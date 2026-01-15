import { useDashboard } from "./hooks/useDashboard";
import "./Dashboard.css";

export default function Dashboard({ onLogout }) {
  const {
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
    canDelete,
    setCanDelete,
    loading,
    userId,
    isOwner,
    canWriteTodo,
    canDeleteTodo,
    createProject,
    deleteProject,
    addCollaborator,
    addTodo,
    logout,
    renameProject,
    updateTodo,
    toggleTodoAssign,
    deleteTodo,
    renameTodo,
    onDragStart,
    onDragOver,
    onDrop,
  } = useDashboard(onLogout);

  if (!user) return <p className="loading-screen">Yükleniyor...</p>;

  return (
    <div className="dashboard">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="user-bar">
          <h2>Dashboard</h2>
          <p className="user-name">👤 {user.username}</p>
          <button className="logout-btn" onClick={logout}>Çıkış Yap</button>
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
                <div className="project-header-sidebar">
                  <div>
                    <div className="project-title">{p.title}</div>
                    <div className="project-meta">
                      {isProjectOwner ? "⭐ Sahibi" : "👥 Katılımcı"}
                    </div>
                  </div>

                  {/* PROJE DÜZENLEME VE SİLME BUTONLARI - GERİ EKLENDİ */}
                  {isProjectOwner && (
                    <div className="project-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Projenin seçilmesini engelle
                          const n = prompt("Projeyi Yeniden Adlandır:", p.title);
                          if (n) renameProject(p._id, n);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Projenin seçilmesini engelle
                             deleteProject(p._id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="content">
        {selectedProject ? (
          <>
            <div className="content-header">
              <h3>{selectedProject.title}</h3>
              
              {isOwner && (
                <div className="collaborator-box">
                  <input
                    placeholder="E-posta adresi"
                    value={collabEmail}
                    onChange={(e) => setCollabEmail(e.target.value)}
                  />
                  <div className="permission-checks">
                    <label>
                      <input
                        type="checkbox"
                        checked={canWrite}
                        onChange={(e) => setCanWrite(e.target.checked)}
                      /> Yazma
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={canDelete}
                        onChange={(e) => setCanDelete(e.target.checked)}
                      /> Silme
                    </label>
                  </div>
                  <button onClick={addCollaborator}>Ekle</button>
                </div>
              )}
            </div>

            {canWriteTodo && (
              <div className="todo-input-section">
                <input
                  placeholder="Görev adı..."
                  value={newTodoTask}
                  onChange={(e) => setNewTodoTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTodo()}
                />
                <button onClick={addTodo}>Ekle</button>
              </div>
            )}

            <div className="kanban-board">
              {[
                { id: "todo", title: "📋 Planlanan" },
                { id: "inprogress", title: "⏳ Yapılıyor" },
                { id: "done", title: "✅ Tamamlandı" }
              ].map((column) => (
                <div 
                  key={column.id} 
                  className="kanban-column"
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, column.id)}
                >
                  <h4>{column.title}</h4>
                  <div className="todo-container">
                    {selectedProject.todos
                      ?.filter((t) => (t.status || "todo") === column.id)
                      .map((t) => (
                        <div 
                          key={t._id} 
                          className="todo-card"
                          draggable={canWriteTodo}
                          onDragStart={(e) => onDragStart(e, t._id)}
                        >
                          <div className="todo-card-top">
                            <span className="group-tag">{t.group || ""}</span>
                            {canDeleteTodo && (
                              <button onClick={() => deleteTodo(t._id)}>❌</button>
                            )}
                          </div>

                          <p className="todo-text">{t.task}</p>

                          <div className="todo-footer">
                            <div className="assignees">
                              {t.assignees?.map((a) => (
                                <span key={a._id || a} className="avatar">
                                  {(a.username || "U")[0].toUpperCase()}
                                </span>
                              ))}
                              {t.status !== "done" && (
                                <button 
                                className="join-btn"
                                onClick={() => toggleTodoAssign(t._id)}
                              >
                                {t.assignees?.some(as => (as._id || as) === userId) ? "Bırak" : "+"}
                              </button>
                            )}
                            </div>
                            
                            {canWriteTodo && (
                              <button 
                                className="rename-btn"
                                onClick={() => {
                                  const n = prompt("Düzenle:", t.task);
                                  if (n) renameTodo(t._id, n);
                                }}
                              >
                                ✏️
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
             <p>🚀 Bir proje seçerek başlayın.</p>
          </div>
        )}
      </div>
    </div>
  );
}