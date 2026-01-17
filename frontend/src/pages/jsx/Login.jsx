/**
 * Kullanıcı Giriş Sayfası (Login Page)
 * Mevcut kullanıcıların kimlik doğrulaması yaparak sisteme erişmesini sağlar.
 * Giriş yapılmışsa otomatik olarak ana sayfaya yönlendirme yapar.
 */

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../contexts/AuthContext";

// Görsel stiller
import "../css/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Global kullanıcı durumu (Session check)

  // Custom Hook: Giriş işlemleri ve form yönetimi
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    handleSubmit,
  } = useLogin();

  /**
   * Güvenlik Kontrolü: 
   * Kullanıcı oturumu zaten açık ise Login sayfasını görmesini engelle.
   */
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        
        {/* Giriş Başlık Alanı */}
        <div className="auth-header">
          <h2>Giriş Yap</h2>
          <p>Projelerini yönetmeye hemen başla.</p>
        </div>
        
        {/* Giriş Formu */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Kimlik Bilgisi (Email veya Username) */}
          <div className="form-group">
            <label>Kullanıcı Adı veya Email</label>
            <input
              type="text"
              placeholder="örneğin: omer@test.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {/* Şifre Alanı */}
          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Aksiyon Butonu: Yüklenme durumunda loader gösterir */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="loader"></span> : "Giriş Yap"}
          </button>
          
        </form>

        {/* Alt Bilgi: Kayıt Sayfasına Yönlendirme */}
        <div className="auth-footer">
          <span>Henüz bir hesabın yok mu?</span>
          <Link to="/register" className="auth-link"> Ücretsiz Kayıt Ol</Link>
        </div>

      </div>
    </div>
  );
}