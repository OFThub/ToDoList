import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api/axios";
import { toast } from "react-hot-toast";

export const useDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Hepsi");

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "Genel",
    color: "#6366f1"
  });

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      const data = res.data?.data || res.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Proje yükleme hatası:", err);
      if (err.response?.status !== 401) toast.error("Projeler getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // DİNAMİK KATEGORİ LİSTESİ: Projelerdeki tüm farklı kategorileri bulur
  const uniqueCategories = useMemo(() => {
    const categories = projects.map(p => p.category).filter(Boolean);
    return ["Hepsi", ...new Set(categories)];
  }, [projects]);

  const handleCreateProject = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await api.post("/projects", newProject);
      const created = res.data?.data || res.data || res;
      setProjects((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewProject({ title: "", description: "", category: "Genel", color: "#6366f1" });
      toast.success("Proje başarıyla eklendi!");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.msg || "Ekleme başarısız.";
      toast.error(errorMsg);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Bu projeyi silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter(p => p._id !== id));
      toast.success("Proje silindi.");
    } catch (err) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const title = p.title || "";
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filterCategory === "Hepsi" || p.category === filterCategory;
      return matchesSearch && matchesCat;
    });
  }, [projects, searchTerm, filterCategory]);

  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status !== "completed").length,
    progress: projects.length > 0 ? Math.round((projects.filter(p => p.status === "completed").length / projects.length) * 100) : 0
  }), [projects]);

  return {
    user, projects: filteredProjects, loading, stats, uniqueCategories,
    isModalOpen, setIsModalOpen, searchTerm, setSearchTerm,
    filterCategory, setFilterCategory, newProject, setNewProject,
    handleCreateProject, handleDeleteProject
  };
};