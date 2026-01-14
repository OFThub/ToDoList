import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useRegister = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook en üstte tanımlanmalı

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Kayıt başarılı 🎉");
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // App.js'deki isAuthenticated durumunu güncelle
      if (onRegisterSuccess) onRegisterSuccess();
      
      navigate("/dashboard"); 
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Kayıt olurken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, handleChange, handleSubmit };
};