import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api/axios";
import { toast } from "react-hot-toast";

export const useProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban"); // Görünüm yönetimi burada
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}`);
      const projectData = res.data?.project || res.data?.data || res.data;
      const tasksData = res.data?.tasks || projectData?.tasks || [];

      if (projectData) {
        setProject(projectData);
        setTasks(tasksData);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.error("Proje yüklenemedi.");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchProjectDetails(); }, [fetchProjectDetails]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/todos/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success("Durum güncellendi");
    } catch (err) {
      toast.error("Güncelleme başarısız.");
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, taskData);
      const newTask = res.data?.data || res.data;
      setTasks((prev) => [...prev, newTask]);
      setIsTaskModalOpen(false);
      toast.success("Görev eklendi!");
    } catch (err) {
      toast.error("Görev oluşturulamadı.");
    }
  };

  return { 
    project, tasks, loading, view, setView, 
    isTaskModalOpen, setIsTaskModalOpen, 
    handleCreateTask, updateTaskStatus 
  };
};