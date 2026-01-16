import React from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import "../css/dashboard.css";

export default function Dashboard() {
  const { 
    user, projects, loading, stats, uniqueCategories,
    isModalOpen, setIsModalOpen, searchTerm, setSearchTerm,
    filterCategory, setFilterCategory, newProject, setNewProject, 
    handleCreateProject, handleDeleteProject 
  } = useDashboard();

  if (loading) return (
    <div className="dashboard-loading-container">
      <div className="loader"></div>
      <p>Projeleriniz hazırlanıyor...</p>
    </div>
  );

  return (
    <div className="dashboard-container fade-in">
      <header className="dashboard-header">
        <div className="welcome-area">
          <h1>Hoş Geldin, {user?.username} 👋</h1>
          <p>Şu an <strong>{stats.total}</strong> aktif projen var.</p>
        </div>
        <button className="btn-add-project" onClick={() => setIsModalOpen(true)}>+ Yeni Proje</button>
      </header>

      <section className="dashboard-stats">
        <div className="stat-card"><h3>{stats.total}</h3><p>Toplam</p></div>
        <div className="stat-card"><h3>{stats.active}</h3><p>Aktif</p></div>
        <div className="stat-card"><h3>%{stats.progress}</h3><p>Başarı</p></div>
      </section>

      <div className="dashboard-controls">
        <input 
          placeholder="Proje ara..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <section className="projects-grid">
        {projects.map((project) => (
          <div key={project._id} className="project-card" style={{ borderTop: `6px solid ${project.color}` }}>
            <div className="card-header">
              <span className="category-tag" style={{backgroundColor : project.color , color : "white"}}>{project.category}</span>
              <button className="btn-delete-small" onClick={() => handleDeleteProject(project._id)}>🗑️</button>
            </div>
            <div className="card-body">
              <h3>{project.title}</h3>
              <p>{project.description || "Açıklama yok."}</p>
            </div>
            <div className="card-footer">
              <div className="project-views-links">
                  <Link to={`/project/${project._id}/kanban`} className="view-link">
                    📋 Kanban
                  </Link>
                  <Link to={`/project/${project._id}/list`} className="view-link">
                    📝 Liste
                  </Link>
                  <Link to={`/project/${project._id}/timeline`} className="view-link">
                    ⏳ Zaman Çizelgesi  
                  </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content scale-up" onClick={(e) => e.stopPropagation()}>
            <h2>🚀 Yeni Proje</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Başlık</label>
                <input required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Açıklama</label>
                <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kategori (Yazın veya Seçin)</label>
                  <input 
                    list="categories" 
                    value={newProject.category} 
                    onChange={e => setNewProject({...newProject, category: e.target.value})} 
                  />
                  <datalist id="categories">
                    {uniqueCategories.filter(c => c !== "Hepsi").map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Renk</label>
                  <input type="color" value={newProject.color} onChange={e => setNewProject({...newProject, color: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>İptal</button>
                <button type="submit" className="btn-submit">Oluştur</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}