import React from "react";
import { Link } from "react-router-dom";
import { useHomePage } from "../../hooks/useHomePage";
import "../css/HomePage.css";

export default function HomePage() {
  const { user, projects, loading } = useHomePage();

  if (loading) return <div className="loader">Sistem Yükleniyor...</div>;

  return (
    <div className="home-container fade-in">
      {/* Karşılama Alanı */}
      <header className="home-hero">
        <div className="hero-content">
          <h1>Tekrar Hoş Geldin, {user?.username}! 🚀</h1>
        </div>
        <Link to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          + Yeni Proje Başlat
        </Link>
      </header>

      {/* Aktif Projeler & Görünüm Türleri */}
      <section className="projects-section">
        <div className="section-header">
          <h2>Aktif Projelerin</h2>
          <Link to="/dashboard" className="view-all">Tümünü Gör</Link>
        </div>

        <div className="projects-layout">
          {projects.map((project) => (
            <div key={project._id} className="project-mega-card">
              <div className="project-card-top">
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <span className="tag">{project.category || "Genel"}</span>
                </div>
                <div className="avatar-group">
                   {/* Üye avatarları buraya gelecek */}
                   <div className="mini-avatar"></div>
                </div>
              </div>

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
          ))}
        </div>
      </section>
    </div>
  );
}