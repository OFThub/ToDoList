import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api/axios";

export const useRegister = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend'deki register endpoint'ine istek atıyoruz
      const res = await api.post("/auth/register", form);

      // Başarılı kayıttan sonra token'ı kaydet ve context'i güncelle
      localStorage.setItem("token", res.token);
      setUser(res.user);

      toast.success("Hesabınız başarıyla oluşturuldu! 🎉");
      navigate("/dashboard");
    } catch (err) {
      console.log("Yakalanan Hata:", err); // Tarayıcı konsoluna (F12) bak
      toast.error(err.message || "Kayıt sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, handleChange, handleSubmit };
};