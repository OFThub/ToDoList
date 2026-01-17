/**
 * useProjectDetail Hook'u
 * Belirli bir projenin tüm detaylarını, görevlerini (CRUD) ve 
 * katılımcı (collaborator) operasyonlarını yöneten merkezi mantık katmanıdır.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

export const useProjectDetail = () => {
    // --- URL Parametreleri ve State Tanımlamaları ---
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("kanban"); // 'kanban' veya 'list' görünümü
    
    // Modal ve Düzenleme Durumları
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);

    // Oturum Bilgileri
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id;

    /**
     * Veri Çekme Fonksiyonu
     * useCallback ile sarmalanarak gereksiz yeniden oluşturulmalar engellenmiştir.
     */
    const fetchProjectDetails = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const res = await api.get(`/projects/${projectId}`);
            setProject(res.data);
            setTasks(res.data.tasks || []);
        } catch (err) {
            if (err.response?.status !== 401) toast.error("Proje yüklenemedi.");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Bileşen yüklendiğinde veriyi çek
    useEffect(() => { 
        fetchProjectDetails(); 
    }, [fetchProjectDetails]);

    // --- Modal Yönetim Fonksiyonları ---
    const openEditModal = (task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setEditingTask(null);
        setIsTaskModalOpen(false);
    };

    // --- Görev (Task) CRUD Operasyonları ---

    const handleCreateTask = async (taskData) => {
        try {
            const res = await api.post(`/projects/${projectId}/tasks`, taskData);
            setTasks((prev) => [...prev, (res.data?.data || res.data)]);
            closeTaskModal();
            toast.success("Görev eklendi!");
        } catch (err) { toast.error("Görev oluşturulamadı."); }
    };

    const handleUpdateTask = async (taskId, updatedData) => {
        try {
            const res = await api.patch(`/todos/${taskId}`, updatedData);
            const updatedTask = res.data?.data || res.data;
            setTasks((prev) => prev.map((t) => (t._id === taskId ? updatedTask : t)));
            toast.success("Görev güncellendi");
            closeTaskModal();
        } catch (err) { toast.error("Güncelleme başarısız."); }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await api.patch(`/todos/${taskId}`, { status: newStatus });
            setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
        } catch (err) { toast.error("Durum güncellenemedi."); }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Bu görevi silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/todos/${taskId}`);
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            toast.success("Görev silindi.");
        } catch (err) { toast.error("Silme başarısız."); }
    };

    // --- Göreve Katılma / Ayrılma (Assignee) Mantığı ---
    const handleToggleJoinTask = async (task) => {
        if (!currentUserId) return toast.error("Lütfen giriş yapın.");
        
        // Kullanıcının halihazırda atanıp atanmadığını kontrol eder
        const isAlreadyAssigned = task.assignees?.some(id => 
            (typeof id === 'object' ? id._id : id) === currentUserId
        );
        
        try {
            let newAssignees;
            if (isAlreadyAssigned) {
                // Görevden Ayrılma: Mevcut ID'ler arasından kullanıcıyı çıkar
                newAssignees = task.assignees
                    .map(id => (typeof id === 'object' ? id._id : id))
                    .filter(id => id !== currentUserId);
            } else {
                // Göreve Katılma: Mevcut ID listesine kullanıcıyı ekle
                const currentIds = task.assignees?.map(id => (typeof id === 'object' ? id._id : id)) || [];
                newAssignees = [...currentIds, currentUserId];
            }

            const res = await api.patch(`/todos/${task._id}`, { assignees: newAssignees });
            const updatedTask = res.data?.data || res.data;

            setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));
            isAlreadyAssigned ? toast.success("Görevden ayrıldınız.") : toast.success("Göreve katıldınız!");
        } catch (err) { toast.error("İşlem başarısız."); }
    };

    // --- Katılımcı (Collaborator) Yönetimi ---

    const removeCollaborator = async (userId) => {
        if (!projectId || !userId) return;

        if (!window.confirm("Projeden çıkarmak istediğinize emin misiniz? Bu kullanıcı atandığı tüm görevlerden de çıkarılacaktır.")) {
            return;
        }

        try {
            await api.delete(`/projects/${projectId}/collaborators/${userId}`);
            
            // Local State Optimizasyonu: Katılımcıyı tüm görevlerin 'assignees' listesinden temizle
            setTasks(prevTasks => prevTasks.map(task => ({
                ...task,
                assignees: task.assignees?.filter(id => {
                    const currentId = (typeof id === 'object' ? id._id : id);
                    return currentId !== userId;
                })
            })));

            await fetchProjectDetails(); // Proje verilerini tazele
            toast.success("Katılımcı ve tüm görev atamaları kaldırıldı.");
        } catch (err) {
            console.error("Silme hatası:", err.response || err);
            toast.error(err.response?.data?.msg || "İşlem başarısız oldu.");
        }
    };

    const addCollaborator = async (email, role) => {
        try {
            await api.post(`/projects/${projectId}/collaborators`, { email, role });
            fetchProjectDetails();
            toast.success("Katılımcı eklendi!");
        } catch (err) { 
            toast.error(err.response?.data?.msg || "Ekleme başarısız."); 
        }
    };

    // Dışarıya aktarılan arayüz (Public API of the hook)
    return {
        project, tasks, loading, view, setView, isTaskModalOpen, setIsTaskModalOpen,
        editingTask, openEditModal, closeTaskModal, handleCreateTask, handleUpdateTask, 
        updateTaskStatus, handleDeleteTask, addCollaborator, 
        removeCollaborator, isCollabModalOpen, setIsCollabModalOpen, currentUserId,
        fetchProjectDetails, handleToggleJoinTask 
    };
};