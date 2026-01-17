import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api/axios";
import { toast } from "react-hot-toast";

export const useProjectDetail = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("kanban");
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

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

    useEffect(() => { fetchProjectDetails(); }, [fetchProjectDetails]);

    const handleCreateTask = async (taskData) => {
        try {
            const res = await api.post(`/projects/${projectId}/tasks`, taskData);
            setTasks((prev) => [...prev, (res.data?.data || res.data)]);
            setIsTaskModalOpen(false);
            toast.success("Görev eklendi!");
        } catch (err) {
            toast.error("Görev oluşturulamadı.");
        }
    };

    const handleUpdateTask = async (taskId, updatedData) => {
        try {
            const res = await api.patch(`/todos/${taskId}`, updatedData);
            const updatedTask = res.data?.data || res.data;
            setTasks((prev) => prev.map((t) => (t._id === taskId ? updatedTask : t)));
            toast.success("Görev güncellendi");
            setEditingTask(null);
            setIsTaskModalOpen(false);
        } catch (err) {
            toast.error("Güncelleme başarısız.");
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await api.patch(`/todos/${taskId}`, { status: newStatus });
            setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
        } catch (err) {
            toast.error("Durum güncellenemedi.");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!taskId) return toast.error("Geçersiz Görev ID");
        if (!window.confirm("Bu görevi silmek istediğinize emin misiniz?")) return;
        
        try {
            await api.delete(`/todos/${taskId}`);
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            toast.success("Görev silindi.");
        } catch (err) {
            console.error("Silme hatası:", err.response?.data);
            toast.error(err.response?.data?.msg || "Silme yetkiniz olmayabilir.");
        }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setIsTaskModalOpen(true);
    };

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
        setEditingTask(null);
    };

    return {
        project, tasks, loading, view, setView, isTaskModalOpen, 
        setIsTaskModalOpen, editingTask, handleCreateTask, 
        handleUpdateTask, updateTaskStatus, handleDeleteTask, 
        openEditModal, closeTaskModal
    };
};