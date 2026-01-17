/**
 * useDashboard Hook'u
 * Proje listesinin yönetimi, dinamik filtreleme, arama algoritmaları
 * ve proje istatistiklerinin hesaplanması bu dosya üzerinden koordine edilir.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api/axios";
import { toast } from "react-hot-toast";

export const useDashboard = () => {
  const { user } = useAuth();
  
  // --- State Yönetimi ---
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Hepsi");

  // Yeni proje şablonu (Resetleme kolaylığı için)
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "Genel",
    color: "#6366f1"
  });

  /**
   * Projeleri API'den Çekme
   * useCallback ile referans sabitlenerek gereksiz useEffect tetiklenmeleri önlenir.
   */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      // Farklı API yanıt yapılarına (data.data veya data) uyum sağlar
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

  /**
   * Dinamik Kategori Listesi
   * Mevcut projelerin kategorilerini tarayarak benzersiz bir liste oluşturur.
   */
  const uniqueCategories = useMemo(() => {
    const categories = projects.map(p => p.category).filter(Boolean);
    return ["Hepsi", ...new Set(categories)]; // Set kullanarak dublike kayıtları temizler
  }, [projects]);

  // --- CRUD İşlemleri ---

  const handleCreateProject = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await api.post("/projects", newProject);
      const created = res.data?.data || res.data || res;
      
      setProjects((prev) => [created, ...prev]); // Yeni projeyi listenin başına ekle
      setIsModalOpen(false);
      setNewProject({ title: "", description: "", category: "Genel", color: "#6366f1" });
      toast.success("Proje başarıyla eklendi! 🚀");
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
      toast.success("Proje başarıyla silindi.");
    } catch (err) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  /**
   * Filtreleme ve Arama Mantığı
   * searchTerm veya filterCategory değiştiğinde otomatik tetiklenir.
   */
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const title = p.title || "";
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filterCategory === "Hepsi" || p.category === filterCategory;
      return matchesSearch && matchesCat;
    });
  }, [projects, searchTerm, filterCategory]);

  /**
   * İstatistik Hesaplayıcı
   * Dashboard üstündeki özet kartları için sayısal verileri üretir.
   */
  const stats = useMemo(() => ({
    total: projects.length,
    active: projects.filter(p => p.status !== "completed").length,
    progress: projects.length > 0 
      ? Math.round((projects.filter(p => p.status === "completed").length / projects.length) * 100) 
      : 0
  }), [projects]);

  // UI Bileşenine servis edilen paket
  return {
    user, 
    projects: filteredProjects, 
    loading, 
    stats, 
    uniqueCategories,
    isModalOpen, 
    setIsModalOpen, 
    searchTerm, 
    setSearchTerm,
    filterCategory, 
    setFilterCategory, 
    newProject, 
    setNewProject,
    handleCreateProject, 
    handleDeleteProject
  };
};