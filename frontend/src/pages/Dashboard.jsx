import { useDashboard } from "./hooks/useDashboard";
import "./Dashboard.css";

export default function Dashboard({ onLogout }) { 
  const {
    user, projects, selectedProject, setSelectedProject,
    newProjectTitle, setNewProjectTitle, newTodoTask, setNewTodoTask,
    collabEmail, setCollabEmail, canWrite, setCanWrite,
    loading, userId, isOwner, canWriteTodo,
    createProject, deleteProject, addCollaborator, addTodo, logout,
    renameProject // 🔥 EKSİK OLAN BUYDU: Buraya ekledik
  } = useDashboard(onLogout);

  if (!user) return <p className="loading-screen">Yükleniyor...</p>;

  return (
    <div className="dashboard">
      {/* SOL SİDEBAR */}
      <div className="sidebar">
        <div className="user-bar">
          <h2>Dashboard</h2>
          <h2>{user.username}</h2>
          <button className="logout-btn" onClick={logout}>Çıkış</button>
        </div>

        <div className="new-project">
          <input
            placeholder="Yeni proje adı"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
          />
          <button onClick={createProject} disabled={loading}>
            {loading ? "..." : "Ekle"}
          </button>
        </div>

        <ul className="project-list">
          {projects.map((p) => {
            const isProjectOwner = (p.owner?._id || p.owner) === userId;
            return (
              <li
                key={p._id}
                className={`project-card ${selectedProject?._id === p._id ? "active" : ""}`}
                onClick={() => setSelectedProject(p)}
              >
                <div className="project-header">
                  <div>
                    <div className="project-title">{p.title}</div>
                    
                    {/* İSİM DÜZENLEME BUTONU */}
                    {isProjectOwner && (
                      <button
                        className="edit-title-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newTitle = prompt("Yeni isim:", p.title);
                          if (newTitle && newTitle.trim() !== "") {
                            renameProject(p._id, newTitle);
                          }
                        }}
                      >
                        ✏️ İsmi Düzenle
                      </button>
                    )}

                    <div className="project-meta">
                      {isProjectOwner ? "⭐ Sahibi" : "👥 Katılımcı"}
                    </div>
                  </div>
                  {isProjectOwner && (
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(p._id);
                      }}
                    >
                      Sil
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* SAĞ İÇERİK */}
      <div className="content">
        {selectedProject ? (
          <>
            <div className="content-header">
              <h3>{selectedProject.title}</h3>
            </div>

            {isOwner && (
              <div className="collaborator-box">
                <h4>Katılımcı Ekle</h4>
                <div className="collab-inputs">
                  <input
                    type="email"
                    placeholder="Kullanıcı e-posta adresi"
                    value={collabEmail}
                    onChange={(e) => setCollabEmail(e.target.value)}
                  />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={canWrite}
                      onChange={(e) => setCanWrite(e.target.checked)}
                    />
                    <span>Yazma Yetkisi</span>
                  </label>
                  <button onClick={addCollaborator} disabled={loading}>
                    {loading ? "Ekleniyor..." : "Ekle"}
                  </button>
                </div>
              </div>
            )}

            <div className="todo-section">
              <div className="todo-input">
                <input
                  placeholder="Yeni görev"
                  value={newTodoTask}
                  onChange={(e) => setNewTodoTask(e.target.value)}
                />
                <button onClick={addTodo} disabled={!canWriteTodo}>
                  Görev Ekle
                </button>
              </div>

              <ul className="todo-list">
                {selectedProject.todos?.length > 0 ? (
                  selectedProject.todos.map((t) => (
                    <li key={t._id} className="todo-item">{t.task}</li>
                  ))
                ) : (
                  <p className="no-data">Henüz görev eklenmemiş.</p>
                )}
              </ul>
            </div>
          </>
        ) : (
          <div className="empty-state">
             <p>İşlem yapmak için soldan bir proje seçin veya yeni bir tane oluşturun.</p>
          </div>
        )}
      </div>
    </div>
  );
}