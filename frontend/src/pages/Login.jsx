import React from "react";
import { useLogin } from "./hooks/useLogin"; // Yolun doğru olduğundan emin olun
import "./Auth.css";

// Prop'u süslü parantez içinde (destructuring) alıyoruz
export default function Login({ onLoginSuccess }) {
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    handleSubmit,
  } = useLogin(onLoginSuccess); // Prop'u hook'a paslıyoruz

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Giriş Yap</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Kullanıcı adı veya Email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
        <div className="auth-footer">
          Hesabın yok mu? <a href="/register">Kayıt Ol</a>
        </div>
      </div>
    </div>
  );
}