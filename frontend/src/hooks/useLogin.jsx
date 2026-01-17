/**
 * useLogin Hook'u
 * Kullanıcının kimlik bilgilerini (Email/Kullanıcı Adı ve Şifre) doğrular,
 * JWT token yönetimini sağlar ve oturumu global state üzerinde başlatır.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext"; 
import api from "../services/api/axios";

export const useLogin = () => {
  // --- Form State ---
  const [identifier, setIdentifier] = useState(""); // E-posta veya Kullanıcı Adı
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuth(); // AuthContext'ten oturum güncelleme fonksiyonu
  const navigate = useNavigate();

  /**
   * Giriş İşlemi Yöneticisi
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Kimlik Doğrulama İsteği: Backend'e verileri gönderir
      const response = await api.post("/auth/login", { identifier, password });

      // Veri Yapısı Kontrolü: Axios interceptor ayarına göre datayı ayıklar
      const data = response.data || response; 

      if (data && data.user) {
        const { token, user } = data;

        // 2. Güvenli Depolama: Token'ı tarayıcı hafızasına kaydet
        localStorage.setItem("token", token);
        
        // 3. Oturum Başlatma: Global kullanıcı state'ini güncelle
        setUser(user); 
        
        // 4. Geri Bildirim ve Yönlendirme
        toast.success(`Hoş geldin ${user.username} ✨`);
        navigate("/home"); 
      } else {
        // Backend'den başarılı (200) dönen ancak içeriği eksik olan yanıtların kontrolü
        console.error("Beklenen veri yapısı (user/token) eksik:", data);
        throw new Error("Giriş verileri doğrulanamadı.");
      }

    } catch (err) {
      // Hata Yönetimi: API'den gelen spesifik hata mesajını kullanıcıya yansıtır
      console.error("Login Süreç Hatası:", err);
      const errorMessage = err.response?.data?.msg || err.message || "Giriş başarısız";
      toast.error(errorMessage);
    } finally {
      // İşlem tamamlandığında butonu tekrar aktif hale getir
      setLoading(false);
    }
  };

  // UI Bileşeninin (Login.jsx) kullanacağı arayüz
  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    handleSubmit,
  };
};