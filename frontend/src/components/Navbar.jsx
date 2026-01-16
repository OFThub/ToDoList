import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import "./Navbar.css";

export default function Navbar({ onToggleSidebar }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Çıkış yapıldı");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        {/* BURASI KRİTİK: toggle fonksiyonu burada tetikleniyor */}
        <button className="nav-icon-btn toggle-btn" onClick={onToggleSidebar}>
          ☰
        </button>
        <span className="nav-title">TaskFlow</span>
      </div>

      <div className="nav-right">
        <button className="nav-action-btn">🔔</button>
        <button className="nav-action-btn">⚙️</button>
        <div className="v-divider"></div>
        <button onClick={handleLogout} className="logout-btn">
          Çıkış
        </button>
      </div>
    </header>
  );
}