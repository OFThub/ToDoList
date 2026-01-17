import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../css/Sidebar.css";

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobil cihazlarda sidebar açıkken arka planı karartmak için */}
      <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={onClose}></div>
      
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-placeholder">G</div>
          <h3>TaskFlow</h3>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/home" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="icon">🏠</span>
            <span className="link-text">Ana Sayfa</span>
          </NavLink>

          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <span className="icon">📊</span>
            <span className="link-text">Dashboard</span>
          </NavLink>

          <div className="sidebar-section">
            <p className="section-title">PROJELERİM</p>
            <button className="btn-add-project">
              <span className="plus-icon">+</span> Yeni Proje
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-box">
            <div className="user-details">
              <p className="username">{user?.username || "Kullanıcı"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}