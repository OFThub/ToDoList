import React from "react";
import { Link } from "react-router-dom";
import { useRegister } from "../../hooks/useRegister";
import "../css/auth.css";

export default function Register() {
  const { form, loading, handleChange, handleSubmit } = useRegister();

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h2>Yeni Hesap Oluştur</h2>
          <p>Ücretsiz kayıt ol ve projelerini yönetmeye başla.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Kullanıcı Adı</label>
            <input
              name="username"
              type="text"
              placeholder="örneğin: omerdev"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>E-posta Adresi</label>
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Zaten bir hesabın var mı?</span>
          <Link to="/login">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}