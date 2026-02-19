/**
 * useProjectDetail Hook'u
 * Belirli bir projenin tüm detaylarını, görevlerini (CRUD) ve 
 * katılımcı (collaborator) operasyonlarını yöneten merkezi mantık katmanıdır.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export const useProjectDetail = () => {
    // --- URL Parametreleri ---
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // URL'den başlangıç görünümünü belirle
    const getInitialView = () => {
        if (location.pathname.endsWith("/list"))     return "list";
        if (location.pathname.endsWith("/timeline")) return "gantt";
        return "kanban";
    };

    // --- State Tanımlamaları ---
    const [project, setProject]   = useState(null);
    const [tasks, setTasks]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [view, setViewState]    = useState(getInitialView);

    // Modal ve Düzenleme Durumları
    const [isTaskModalOpen, setIsTaskModalOpen]   = useState(false);
    const [editingTask, setEditingTask]           = useState(null);
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

    // Oturum Bilgileri
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id;

    /**
     * View değiştirirken URL'i de günceller
     */
    const setView = useCallback((newView) => {
        const pathMap = { kanban: "kanban", list: "list", gantt: "timeline" };
        navigate(`/project/${projectId}/${pathMap[newView]}`);
        setViewState(newView);
    }, [projectId, navigate]);

    /**
     * URL değiştiğinde (örn. tarayıcı geri/ileri) view'i senkronize et
     */
    useEffect(() => {
        setViewState(getInitialView());
    }, [location.pathname]);

    /**
     * Projeyi güncelleyen fonksiyon
     * KanbanBoard bileşeninde customStatuses güncellendiğinde çağrılır
     */
    const handleProjectUpdate = useCallback((updatedProject) => {
        if (updatedProject && typeof updatedProject === 'object') {
            setProject(prev => ({ ...prev, ...updatedProject }));
        }
    }, []);

    /**
     * Veri Çekme Fonksiyonu
     */
    const fetchProjectDetails = useCallback(async () => {
        if (!projectId) {
            setError("Proje ID'si bulunamadı");
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/projects/${projectId}`);
            
            if (res.data && typeof res.data === 'object') {
                setProject(res.data);
                setTasks(Array.isArray(res.data.tasks) ? res.data.tasks : []);
            } else {
                setError("Proje verisi geçersiz");
                setProject(null);
                setTasks([]);
            }
        } catch (err) {
            console.error("Proje yükleme hatası:", err);
            
            if (err.response?.status === 404) {
                setError("Proje bulunamadı");
                toast.error("Proje bulunamadı.");
            } else if (err.response?.status === 401) {
                toast.error("Oturum açmanız gerekiyor");
                navigate("/login");
            } else {
                setError("Proje yüklenemedi");
                toast.error("Proje yüklenemedi.");
            }
            
            setProject(null);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, [projectId, navigate]);

    useEffect(() => { 
        fetchProjectDetails(); 
    }, [fetchProjectDetails]);

    // --- Modal Yönetim Fonksiyonları ---
    const openEditModal = useCallback((task) => {
        if (task && task._id) {
            setEditingTask(task);
            setIsTaskModalOpen(true);
        }
    }, []);

    const closeTaskModal = useCallback(() => {
        setEditingTask(null);
        setIsTaskModalOpen(false);
    }, []);

    // --- Görev (Task) CRUD Operasyonları ---

    const handleCreateTask = useCallback(async (taskData) => {
        if (!projectId) {
            toast.error("Proje bilgisi geçersiz");
            return;
        }

        try {
            const res = await api.post(`/projects/${projectId}/tasks`, { ...taskData, projectId });
            const newTask = res.data?.data || res.data;
            
            if (newTask && newTask._id) {
                setTasks((prev) => [...prev, newTask]);
                closeTaskModal();
                toast.success("Görev eklendi!");
            } else {
                throw new Error("Görev verisi geçersiz");
            }
        } catch (err) { 
            console.error("Görev oluşturma hatası:", err);
            toast.error(err.response?.data?.msg || "Görev oluşturulamadı."); 
        }
    }, [projectId, closeTaskModal]);

    const handleUpdateTask = useCallback(async (taskId, updatedData) => {
        if (!taskId) {
            toast.error("Görev bilgisi geçersiz");
            return;
        }

        try {
            const res = await api.patch(`/todos/${taskId}`, updatedData);
            const updatedTask = res.data?.data || res.data;
            
            if (updatedTask && updatedTask._id) {
                setTasks((prev) => prev.map((t) => (t._id === taskId ? updatedTask : t)));
                toast.success("Görev güncellendi");
                closeTaskModal();
            } else {
                throw new Error("Görev verisi geçersiz");
            }
        } catch (err) { 
            console.error("Güncelleme hatası:", err);
            toast.error(err.response?.data?.msg || "Güncelleme başarısız."); 
        }
    }, [closeTaskModal]);

    const updateTaskStatus = useCallback(async (taskId, newStatus) => {
        if (!taskId || !newStatus) return;

        try {
            const res = await api.patch(`/todos/${taskId}`, { status: newStatus });
            const updatedTask = res.data?.data || res.data;
            
            if (updatedTask && updatedTask._id) {
                setTasks((prev) => prev.map((t) => (t._id === taskId ? updatedTask : t)));
            }
        } catch (err) { 
            console.error("Durum güncelleme hatası:", err);
            toast.error(err.response?.data?.msg || "Durum güncellenemedi."); 
        }
    }, []);

    const handleDeleteTask = useCallback(async (taskId) => {
        if (!taskId) {
            toast.error("Görev bilgisi geçersiz");
            return;
        }

        if (!window.confirm("Bu görevi silmek istediğinize emin misiniz?")) return;
        
        try {
            await api.delete(`/todos/${taskId}`);
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            toast.success("Görev silindi.");
        } catch (err) { 
            console.error("Silme hatası:", err);
            toast.error(err.response?.data?.msg || "Silme başarısız."); 
        }
    }, []);

    // --- Göreve Katılma / Ayrılma ---
    const handleToggleJoinTask = useCallback(async (task) => {
        if (!task?._id || !currentUserId) {
            toast.error(!task?._id ? "Görev bilgisi geçersiz" : "Lütfen giriş yapın.");
            return;
        }
        
        const isAlreadyAssigned = task.assignees?.some(id => 
            (typeof id === 'object' ? id._id : id) === currentUserId
        );
        
        try {
            const currentIds = task.assignees?.map(id => (typeof id === 'object' ? id._id : id)) || [];
            const newAssignees = isAlreadyAssigned
                ? currentIds.filter(id => id !== currentUserId)
                : [...currentIds, currentUserId];

            const res = await api.patch(`/todos/${task._id}`, { assignees: newAssignees });
            const updatedTask = res.data?.data || res.data;

            if (updatedTask && updatedTask._id) {
                setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));
                toast.success(isAlreadyAssigned ? "Görevden ayrıldınız." : "Göreve katıldınız!");
            }
        } catch (err) { 
            console.error("Katılım değiştirme hatası:", err);
            toast.error(err.response?.data?.msg || "İşlem başarısız."); 
        }
    }, [currentUserId]);

    // --- Katılımcı (Collaborator) Yönetimi ---

    const removeCollaborator = useCallback(async (userId) => {
        if (!projectId || !userId) {
            toast.error("Katılımcı bilgisi geçersiz");
            return;
        }

        if (!window.confirm("Projeden çıkarmak istediğinize emin misiniz? Bu kullanıcı atandığı tüm görevlerden de çıkarılacaktır.")) return;

        try {
            await api.delete(`/projects/${projectId}/collaborators/${userId}`);
            
            setTasks(prevTasks => prevTasks.map(task => ({
                ...task,
                assignees: task.assignees?.filter(id => 
                    (typeof id === 'object' ? id._id : id) !== userId
                ) || []
            })));

            await fetchProjectDetails();
            toast.success("Katılımcı ve tüm görev atamaları kaldırıldı.");
        } catch (err) {
            console.error("Katılımcı silme hatası:", err);
            toast.error(err.response?.data?.msg || "İşlem başarısız oldu.");
        }
    }, [projectId, fetchProjectDetails]);

    const addCollaborator = useCallback(async (email, role) => {
        if (!projectId || !email) {
            toast.error("Proje veya e-posta bilgisi geçersiz");
            return;
        }

        try {
            const res = await api.post(`/projects/${projectId}/collaborators`, { email, role });
            if (res.data) {
                await fetchProjectDetails();
                toast.success("Katılımcı eklendi!");
            }
        } catch (err) { 
            console.error("Katılımcı ekleme hatası:", err);
            toast.error(err.response?.data?.msg || "Ekleme başarısız."); 
        }
    }, [projectId, fetchProjectDetails]);

    return {
        project, 
        tasks, 
        loading,
        error,
        view, 
        setView,
        isTaskModalOpen, 
        setIsTaskModalOpen,
        editingTask, 
        openEditModal, 
        closeTaskModal, 
        handleCreateTask, 
        handleUpdateTask, 
        updateTaskStatus, 
        handleDeleteTask, 
        addCollaborator, 
        removeCollaborator, 
        isCollabModalOpen, 
        setIsCollabModalOpen, 
        currentUserId,
        fetchProjectDetails, 
        handleToggleJoinTask, 
        handleProjectUpdate,
    };
};