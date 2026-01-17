/**
 * Sidebar Bileşeni
 * Uygulamanın ana menüsünü ve navigasyon linklerini içerir.
 * Mobil cihazlarda 'isOpen' prop'u ile açılıp kapanabilir.
 */

import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Stil Dosyası
import "../css/Sidebar.css";

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* 1. Mobil Arka Plan Karartma (Overlay) */}
      <div 
        className={`sidebar-overlay ${isOpen ? "active" : ""}`} 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* 2. Sidebar Ana Gövde */}
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        
        {/* Sidebar Üst Alan: Logo ve Marka */}
        <div className="sidebar-header">
          <div className="logo-placeholder">T</div>
          <div className="brand-info">
            <h3>TaskFlow</h3>
            <span className="version">v1.0</span>
          </div>
        </div>

        {/* 3. Navigasyon Linkleri */}
        <nav className="sidebar-nav">
          
          <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="icon">🏠</span>
            <span className="link-text">Ana Sayfa</span>
          </NavLink>

          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="icon">📊</span>
            <span className="link-text">Projelerim</span>
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="icon">👤</span>
            <span className="link-text">Profil Ayarları</span>
          </NavLink>

          {/* Bölüm Ayracı: Proje Yönetimi */}
          <div className="sidebar-section">
            <p className="section-title">Hızlı İşlemler</p>
            <button className="btn-add-project" onClick={onClose}>
              <span className="plus-icon">+</span>
              <span className="btn-text">Yeni Proje</span>
            </button>
          </div>
        </nav>

        {/* 4. Sidebar Alt Alan: Kullanıcı Bilgisi */}
        <div className="sidebar-footer">
          <div className="user-box">
            <div className="user-avatar-mini">
              {user?.username?.[0].toUpperCase()}
            </div>
            <div className="user-details">
              <p className="username">{user?.username || "Kullanıcı"}</p>
              <p className="user-role">Üye</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}