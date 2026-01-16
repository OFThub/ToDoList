import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext"; 
import api from "../services/api/axios";

export const useLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. İstek atılır
      const response = await api.post("/auth/login", { identifier, password });

      /* KRİTİK NOKTA: 
         Eğer api/axios.js içinde "return response.data" yapan bir interceptor YOKSA,
         veriye response.data üzerinden ulaşmalısın. 
      */
      const data = response.data || response; 

      if (data && data.user) {
        const { token, user } = data;

        // 2. Verileri kaydet
        localStorage.setItem("token", token);
        setUser(user); 
        
        // 3. Bildirim ve Yönlendirme
        toast.success(`Hoş geldin ${user.username}`);
        navigate("/home"); 
      } else {
        // Eğer buraya düşüyorsa backend yanıtı beklediğin formatta değil demektir
        console.error("Beklenen veri yapısı gelmedi:", data);
        throw new Error("Kullanıcı verisi alınamadı.");
      }

    } catch (err) {
      console.error("Login Hatası:", err);
      // Backend'den gelen hata mesajını göster
      const errorMessage = err.response?.data?.msg || err.message || "Giriş başarısız";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    handleSubmit,
  };
};