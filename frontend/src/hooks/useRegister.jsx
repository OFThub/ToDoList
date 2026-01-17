/**
 * useRegister Hook'u
 * Kayıt olma formunun state yönetimini, API entegrasyonunu
 * ve kayıt sonrası yetkilendirme (authentication) işlemlerini yönetir.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api/axios";

export const useRegister = () => {
  // --- Form State: Kullanıcıdan alınacak temel bilgiler ---
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  // İşlem devam ediyor mu kontrolü (Buton pasifleştirme için)
  const [loading, setLoading] = useState(false);
  
  // Context ve Yönlendirme Araçları
  const { setUser } = useAuth();
  const navigate = useNavigate();

  /**
   * Input Değişim Yöneticisi
   * Form elemanlarındaki 'name' özniteliğine göre state'i dinamik olarak günceller.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Form Gönderim Yöneticisi
   * API isteğini başlatır, başarılı durumda oturumu açar ve kullanıcıyı yönlendirir.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Adım: Backend'deki register endpoint'ine form verilerini gönder
      const res = await api.post("/auth/register", form);

      // 2. Adım: Başarılı yanıttan sonra token'ı yerel depolamaya (localStorage) kaydet
      localStorage.setItem("token", res.token);
      
      // 3. Adım: Global AuthContext'i yeni kullanıcı verisiyle güncelle
      setUser(res.user);

      // 4. Adım: Kullanıcıyı bilgilendir ve çalışma alanına (Dashboard) yönlendir
      toast.success("Hesabınız başarıyla oluşturuldu! 🎉");
      navigate("/dashboard");
      
    } catch (err) {
      // Hata Yönetimi: Detayları konsola bas ve kullanıcıya bildirim göster
      console.log("Kayıt Hatası Detayları:", err); 
      toast.error(err.message || "Kayıt sırasında bir hata oluştu");
      
    } finally {
      // İşlem bittiğinde (başarılı veya başarısız) yükleme durumunu kapat
      setLoading(false);
    }
  };

  // Bileşenlerin kullanacağı state ve fonksiyonları dışa aktar
  return { form, loading, handleChange, handleSubmit };
};