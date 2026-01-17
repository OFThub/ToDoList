/**
 * Kayıt Sayfası (Register Page)
 * Kullanıcıların sisteme yeni hesap oluşturmasını sağlar.
 * Form yönetimi ve API işlemleri 'useRegister' hook'u üzerinden yürütülür.
 */

import React from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../../hooks/useRegister";

// Stil tanımlamaları
import "../css/auth.css";

export default function Register() {
  // Custom Hook: Form state'i, yüklenme durumu ve olay yöneticileri
  const { form, loading, handleChange, handleSubmit } = useRegister();

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        
        {/* Başlık Bölümü */}
        <div className="auth-header">
          <h2>Yeni Hesap Oluştur</h2>
          <p>Ücretsiz kayıt ol ve projelerini yönetmeye başla.</p>
        </div>

        {/* Kayıt Formu */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Kullanıcı Adı Girişi */}
          <div className="form-group">
            <label htmlFor="username">Kullanıcı Adı</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="örneğin: omerdev"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* E-posta Girişi */}
          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Şifre Girişi */}
          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Gönder Butonu: İşlem sırasında (loading) devre dışı bırakılır */}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </button>
          
        </form>

        {/* Alt Bilgi ve Yönlendirme */}
        <div className="auth-footer">
          <span>Zaten bir hesabın var mı?</span>
          <Link to="/login" className="auth-link"> Giriş Yap</Link>
        </div>

      </div>
    </div>
  );
}