import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useDashboard = (onLogout) => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newTodoTask, setNewTodoTask] = useState("");
  const [collabEmail, setCollabEmail] = useState("");
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = useCallback(() => {
    localStorage.clear();
    if (onLogout) onLogout(); 
    navigate("/login");
  }, [navigate, onLogout]);

//////////////////////////////////////////

//  CREATE

//////////////////////////////////////////

  // Proje oluşturma
  const createProject = async () => {
    if (!newProjectTitle.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/projects",
        { title: newProjectTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Yeni eklenen projeyi listeye ekle
      setProjects((prev) => [...prev, res.data]);
      setNewProjectTitle("");
      alert("Proje oluşturuldu!");
    } catch (err) {
      alert("Proje oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

/////////////////////

  // Katılımcı ekleme
  const addCollaborator = async () => {
    if (!collabEmail.trim()) return alert("Lütfen e-posta girin.");
    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/projects/${selectedProject._id}/collaborators`,
        { email: collabEmail, canWrite },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Hem seçili projeyi hem de genel listeyi güncelle
      setSelectedProject(res.data);
      setProjects((prev) =>
        prev.map((p) => (p._id === res.data._id ? res.data : p))
      );
      setCollabEmail("");
      setCanWrite(false);
      alert("Katılımcı eklendi.");
    } catch (err) {
      alert(err.response?.data?.message || "Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

/////////////////////

  // Görev (Todo) ekleme
  const addTodo = async () => {
    if (!newTodoTask.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/projects/${selectedProject._id}/todos`,
        { task: newTodoTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedProject(res.data);
      setProjects((prev) =>
        prev.map((p) => (p._id === res.data._id ? res.data : p))
      );
      setNewTodoTask("");
    } catch (err) {
      alert("Görev eklenemedi.");
    }
  };

//////////////////////////////////////////

//  READ

//////////////////////////////////////////

  const userId = user?._id || user?.id;

  const isOwner = selectedProject
    ? (selectedProject.owner?._id || selectedProject.owner) === userId
    : false;

  const canWriteTodo =
    isOwner ||
    selectedProject?.collaborators?.some((c) => {
      const collabId = c.user?._id || c.user;
      return collabId === userId && c.permissions?.canWrite;
    });

/////////////////////

  // Projeleri getirme fonksiyonu
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Projeler yüklenirken hata:", err);
      if (err.response?.status === 401) logout();
    }
  }, [token, logout]);

/////////////////////

  // Kullanıcı kontrolü ve ilk veri yüklemesi
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchProjects();
    } catch (err) {
      localStorage.clear();
      navigate("/login");
    }
  }, [token, navigate, fetchProjects]);

//////////////////////////////////////////

//  UPDATE

//////////////////////////////////////////

  const renameProject = async (projectId, newTitle) => {
    // 1. Token Kontrolü (Hata buradan kaynaklanıyor olabilir)
    const currentToken = localStorage.getItem("token"); 
    
    if (!currentToken) {
      alert("Oturum süreniz dolmuş, lütfen tekrar giriş yapın.");
      return;
    }

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/projects/${projectId}/rename`,
        { title: newTitle },
        { 
          headers: { 
            Authorization: `Bearer ${currentToken}` 
          } 
        }
      );

      // Sidebar ve Seçili Proje State Güncellemeleri
      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? res.data : p))
      );

      if (selectedProject?._id === projectId) {
        setSelectedProject(res.data);
      }
      
      alert("Proje adı başarıyla değiştirildi.");
    } catch (err) {
      console.error("Rename error:", err);
      // Backend'den gelen hata mesajını göster
      alert(err.response?.data?.msg || "İsim değiştirilemedi.");
    }
  };

//////////////////////////////////////////

//  DELETE

//////////////////////////////////////////

  // Proje silme
  const deleteProject = async (projectId) => {
    if (!window.confirm("Projeyi silmek istiyor musunuz?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      if (selectedProject?._id === projectId) setSelectedProject(null);
    } catch (err) {
      alert("Silme işlemi başarısız.");
    }
  };

//////////////////////////////////////////

  return {
    user,
    projects,
    selectedProject,
    setSelectedProject,
    newProjectTitle,
    setNewProjectTitle,
    newTodoTask,
    setNewTodoTask,
    collabEmail,
    setCollabEmail,
    canWrite,
    setCanWrite,
    loading,
    userId,
    isOwner,
    canWriteTodo,
    createProject,
    deleteProject,
    addCollaborator,
    addTodo,
    logout,
    renameProject,
  };
};