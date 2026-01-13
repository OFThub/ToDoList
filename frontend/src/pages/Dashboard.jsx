import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newTodoTask, setNewTodoTask] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    // Token kontrolü
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchProjects();
    } catch (err) {
      console.error("User parse edilemedi:", err);
      window.location.href = "/login";
    }
  }, []);

  // Projeleri getir
  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(res.data);
    } catch (err) {
      console.error("Projeler alınamadı:", err.response?.data || err.message);
    }
  };

  // Yeni proje oluştur
  const createProject = async () => {
    if (!newProjectTitle.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/projects",
        { title: newProjectTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects([...projects, res.data]);
      setNewProjectTitle("");
      alert("Proje oluşturuldu");
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.message ||
        "Proje oluşturulamadı";
      alert(msg);
    }
  };

  // Todo ekle
  const addTodo = async () => {
    if (!newTodoTask.trim() || !selectedProject) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/projects/${selectedProject._id}/todos`,
        { task: newTodoTask },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedProject = res.data;

      setSelectedProject(updatedProject);
      setProjects(
        projects.map((p) =>
          p._id === updatedProject._id ? updatedProject : p
        )
      );

      setNewTodoTask("");
    } catch (err) {
      alert("Görev eklenemedi");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // User henüz yüklenmediyse
  if (!user) {
    return <p style={{ padding: 20 }}>Yükleniyor...</p>;
  }

  return (
    <div style={{ padding: 20, display: "flex", gap: 40, fontFamily: "sans-serif" }}>
      {/* SOL TARAF */}
      <div style={{ flex: 1 }}>
        <h1>Dashboard</h1>
        <p>
          Hoş geldin <b>{user.username}</b>{" "}
          <button onClick={logout}>Çıkış Yap</button>
        </p>

        <hr />

        <h3>Projelerim</h3>

        <div style={{ marginBottom: 15 }}>
          <input
            placeholder="Yeni Proje Adı"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
          />
          <button onClick={createProject}>Oluştur</button>
        </div>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {projects.map((p) => (
            <li
              key={p._id}
              onClick={() => setSelectedProject(p)}
              style={{
                padding: 10,
                border: "1px solid #eee",
                marginBottom: 5,
                borderRadius: 5,
                cursor: "pointer",
                backgroundColor:
                  selectedProject?._id === p._id ? "#e3f2fd" : "white",
              }}
            >
              <b>{p.title}</b>
              <br />
              <small>
                {p.owner?.username === user.username
                  ? "⭐ Sahibi"
                  : "👥 Katılımcı"}
              </small>
            </li>
          ))}
        </ul>
      </div>

      {/* SAĞ TARAF */}
      <div style={{ flex: 2, borderLeft: "1px solid #ccc", paddingLeft: 20 }}>
        {selectedProject ? (
          <>
            <h2>{selectedProject.title}</h2>

            <div style={{ marginBottom: 20 }}>
              <input
                placeholder="Yeni Görev..."
                value={newTodoTask}
                onChange={(e) => setNewTodoTask(e.target.value)}
              />
              <button onClick={addTodo}>Görev Ekle</button>
            </div>

            <ul>
              {selectedProject.todos?.map((todo) => (
                <li key={todo._id}>
                  {todo.task}{" "}
                  <small style={{ color: "#777" }}>
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </small>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div style={{ marginTop: 100, textAlign: "center", color: "#888" }}>
            <h3>Soldan bir proje seç</h3>
          </div>
        )}
      </div>
    </div>
  );
}
