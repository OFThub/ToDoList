import React from "react";
import { useRegister } from "./hooks/useRegister";
import "./Auth.css";

export default function Register(onRegisterSuccess) {
  const { form, loading, handleChange, handleSubmit } = useRegister(onRegisterSuccess);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Yeni Hesap Oluştur</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input 
            name="username" 
            placeholder="Kullanıcı Adı" 
            value={form.username}
            onChange={handleChange} 
            required 
          />
          <input 
            name="email" 
            type="email"
            placeholder="Email" 
            value={form.email}
            onChange={handleChange} 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Şifre" 
            value={form.password}
            onChange={handleChange} 
            required 
          />
          
          <button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>
        
        <div className="auth-footer">
          Zaten hesabınız var mı? <a href="/login">Giriş Yap</a>
        </div>
      </div>
    </div>
  );
}