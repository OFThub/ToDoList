/**
 * Navbar Bileşeni
 * Uygulamanın üst barını yönetir. Sidebar tetikleyici, bildirimler
 * ve kullanıcı oturum kapatma (logout) aksiyonlarını içerir.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";

// Stil Dosyası
import "../css/navbar.css";

export default function Navbar({ onToggleSidebar }) {
  const { setUser } = useAuth(); // AuthContext'ten kullanıcı state'ini sıfırlamak için
  const navigate = useNavigate();

  /**
   * Çıkış Yapma Mantığı
   * Token'ı siler, global state'i temizler ve kullanıcıyı giriş ekranına atar.
   */
  const handleLogout = () => {
    // 1. Kimlik doğrulama verilerini temizle
    localStorage.removeItem("token");
    setUser(null);
    
    // 2. Kullanıcıyı bilgilendir
    toast.success("Başarıyla çıkış yapıldı. Tekrar görüşmek üzere! 👋");
    
    // 3. Login sayfasına yönlendir
    navigate("/login");
  };

  return (
    <header className="navbar fade-in">
      
      {/* Sol Bölüm: Menü Kontrolü ve Marka */}
      <div className="nav-left">
        {/* Sidebar'ı açıp kapatan Hamburger Menü Butonu */}
        <button 
          className="nav-icon-btn toggle-btn" 
          onClick={onToggleSidebar}
          aria-label="Menüyü Aç/Kapat"
        >
          ☰
        </button>
        <h2 className="nav-brand">TaskFlow</h2>
      </div>

      {/* Sağ Bölüm: Bildirimler, Ayarlar ve Çıkış */}
      <div className="nav-right">
        {/* Hızlı Erişim Butonları */}
        <button className="nav-action-btn" title="Bildirimler">🔔</button>
        <button className="nav-action-btn" title="Ayarlar">⚙️</button>
        
        {/* Görsel Ayraç */}
        <div className="v-divider"></div>
        
        {/* Oturum Kapatma Butonu */}
        <button onClick={handleLogout} className="logout-btn">
          <span className="logout-text">Çıkış Yap</span>
        </button>
      </div>

    </header>
  );
}