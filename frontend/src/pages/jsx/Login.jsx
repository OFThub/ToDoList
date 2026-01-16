import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../contexts/AuthContext"; // AuthContext ekledik
import "../css/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Mevcut kullanıcı durumunu al
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    handleSubmit,
  } = useLogin();

  // Kullanıcı zaten giriş yapmışsa HomePage'e fırlat
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h2>Giriş Yap</h2>
          <p>Projelerini yönetmeye hemen başla.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
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

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="loader"></span> : "Giriş Yap"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Henüz bir hesabın yok mu?</span>
          <Link to="/register">Ücretsiz Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}