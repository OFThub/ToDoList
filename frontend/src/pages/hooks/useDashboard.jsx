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
  const [canDelete, setCanDelete] = useState(false);
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
        { email: collabEmail, canWrite, canDelete},
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

  // useDashboard.js içindeki addTodo fonksiyonu
  const addTodo = async () => {
    if (!newTodoTask.trim()) return;
    
    try {
      const res = await axios.post(
        `http://localhost:5000/api/todos/${selectedProject._id}`, 
        { task: newTodoTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const addedTodo = res.data;

      // 1. Seçili projeyi anında güncelle (Ekranda hemen görünmesi için)
      setSelectedProject(prev => ({
        ...prev,
        todos: [addedTodo, ...prev.todos]
      }));

      // 2. Ana projeler listesini güncelle (Projeler arası geçişte kaybolmaması için)
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p._id === selectedProject._id 
            ? { ...p, todos: [addedTodo, ...p.todos] } 
            : p
        )
      );

      setNewTodoTask("");
    } catch (err) {
      console.error("Ekleme hatası:", err.response?.data);
      alert("Görev eklenemedi.");
    }
  };

/////////////////////

  // Görevi Üstlenme (Join/Assign) - GÜNCELLENDİ
  const toggleTodoAssign = async (todoId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/todos/${selectedProject._id}/${todoId}/assign`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedTodo = res.data;

      setSelectedProject(prev => ({
        ...prev,
        todos: prev.todos.map(t => t._id === todoId ? updatedTodo : t)
      }));
    } catch (err) {
      alert("Görev üstlenilemedi.");
    }
  };

  // useDashboard.js içine eklenecekler:

const addGroup = async (groupName) => {
  if (!groupName) return;
  try {
    const res = await axios.post(
      `http://localhost:5000/api/projects/${selectedProject._id}/groups`,
      { groupName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSelectedProject(res.data);
  } catch (err) {
    alert("Grup eklenemedi");
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

  const canDeleteTodo =
    isOwner ||
    selectedProject?.collaborators?.some((c) => {
      const collabId = c.user?._id || c.user;
      return collabId.toString() === userId?.toString() && c.permissions?.canDelete;
    });
  const onDragStart = (e, todoId) => {
    e.dataTransfer.setData("todoId", todoId);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, columnId, groupName = "") => {
    const todoId = e.dataTransfer.getData("todoId");
    // Backend'e hem yeni durumu (status) hem de yeni grubu (group) gönderiyoruz
    updateTodo(todoId, { status: columnId, group: groupName });
  };

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

      setProjects((prev) =>
        prev.map((p) => (p._id === projectId ? res.data : p))
      );

      if (selectedProject?._id === projectId) {
        setSelectedProject(res.data);
      }
      
      alert("Proje adı başarıyla değiştirildi.");
    } catch (err) {
      console.error("Rename error:", err);
      alert(err.response?.data?.msg || "İsim değiştirilemedi.");
    }
  };

/////////////////////

  const updateTodo = async (todoId, updates) => {
    try {
      // Backend "status" beklediği için objeyi ona göre gönderiyoruz
      await axios.patch(
        `http://localhost:5000/api/todos/${selectedProject._id}/${todoId}`,
        { status: updates.status }, // "newStatus" değil, "status" gönderin
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Local State Güncelleme
      const updatedTodos = selectedProject.todos.map(t => 
        t._id === todoId ? { ...t, status: updates.status } : t
      );

      setSelectedProject({ ...selectedProject, todos: updatedTodos });
      setProjects(prev => prev.map(p => 
        p._id === selectedProject._id ? { ...p, todos: updatedTodos } : p
      ));
      
    } catch (err) {
      console.error("Güncelleme hatası", err);
    }
  };

/////////////////////

const renameTodo = async (todoId, newTask) => {
  if (!newTask || !newTask.trim()) return;
  try {
    const res = await axios.patch(
      `http://localhost:5000/api/todos/${selectedProject._id}/${todoId}/rename`,
      { newTask: newTask },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const updatedTodo = res.data;

    // Sadece seçili projedeki ilgili todoyu güncelle
    setSelectedProject((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t._id === todoId ? updatedTodo : t)),
    }));

    // Genel projeler listesindeki veriyi de senkronize et
    setProjects((prev) =>
      prev.map((p) =>
        p._id === selectedProject._id
          ? { ...p, todos: p.todos.map((t) => (t._id === todoId ? updatedTodo : t)) }
          : p
      )
    );
  } catch (err) {
    console.error("Todo Rename hatası:", err.response?.data);
    alert(err.response?.data?.msg || "Görev adı değiştirilemedi.");
  }
};

// return kısmına renameProject'i eklemeyi unutmayın!

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

/////////////////////

  // Görev Silme - GÜNCELLENDİ
  const deleteTodo = async (todoId) => {
    if (!window.confirm("Bu görevi silmek istediğinize emin misiniz?")) return;
    
    try {
      // URL: BaseURL + ProjectID + TodoID (Aradaki fazladan /todos/ kaldırıldı)
      await axios.delete(
        `http://localhost:5000/api/todos/${selectedProject._id}/${todoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // UI Güncelleme: Seçili projeden kaldır
      setSelectedProject((prev) => ({
        ...prev,
        todos: prev.todos.filter((t) => t._id !== todoId)
      }));

      // UI Güncelleme: Genel projeler listesinden kaldır
      setProjects((prev) =>
        prev.map((p) =>
          p._id === selectedProject._id
            ? { ...p, todos: p.todos.filter((t) => t._id !== todoId) }
            : p
        )
      );

    } catch (err) {
      console.error("Silme hatası detayı:", err.response?.data);
      alert("Silme hatası: " + (err.response?.data?.msg || "Yetki yetersiz veya sunucu hatası"));
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
    toggleTodoAssign,
    deleteTodo,
    canDeleteTodo,
    renameTodo,
    onDragStart,
    onDragOver,
    onDrop,
    updateTodo,
  };
};