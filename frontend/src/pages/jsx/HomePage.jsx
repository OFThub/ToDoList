/**
 * Ana Sayfa Bileşeni (HomePage)
 * Kullanıcıyı karşılayan, aktif projelerin özetlerini gösteren 
 * ve farklı proje görünümlerine hızlı erişim sağlayan ana ekrandır.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useHomePage } from "../../hooks/useHomePage";

// Stil tanımlamaları
import "../css/HomePage.css";

export default function HomePage() {
  // Hook üzerinden kullanıcı verileri ve proje listesinin alınması
  const { user, projects, loading } = useHomePage();

  // Yüklenme Durumu (Loading State)
  if (loading) {
    return <div className="loader">Sistem Yükleniyor...</div>;
  }

  return (
    <div className="home-container fade-in">
      
      {/* --- Kahraman (Hero) Bölümü: Karşılama ve Hızlı Aksiyon --- */}
      <header className="home-hero">
        <div className="hero-content">
          <h1>Tekrar Hoş Geldin, {user?.username}! 🚀</h1>
        </div>
        
        {/* Dashboard'a yönlendiren yeni proje butonu */}
        <Link 
          to="/dashboard" 
          className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
        >
          + Yeni Proje Başlat
        </Link>
      </header>

      {/* --- Projeler Bölümü: Aktif Çalışmaların Listelenmesi --- */}
      <section className="projects-section">
        <div className="section-header">
          <h2>Aktif Projelerin</h2>
          <Link to="/dashboard" className="view-all">Tümünü Gör</Link>
        </div>

        {/* Proje Kartları Izgarası (Grid Layout) */}
        <div className="projects-layout">
          {projects.map((project) => (
            <div key={project._id} className="project-mega-card">
              
              {/* Kart Üst Bilgisi: İsim, Kategori ve Ekip */}
              <div className="project-card-top">
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <span className="tag">{project.category || "Genel"}</span>
                </div>
                
                <div className="avatar-group">
                  {/* İleride dinamik üye avatarları Map edilerek buraya eklenebilir */}
                  <div className="mini-avatar"></div>
                </div>
              </div>

              {/* Görünüm Yönlendirmeleri: Proje detayına farklı perspektiflerden erişim */}
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