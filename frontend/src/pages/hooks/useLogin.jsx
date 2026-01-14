import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// onLoginSuccess parametresini buraya ekledik
export const useLogin = (onLoginSuccess) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert("Kullanıcı adı/email ve şifre boş olamaz");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        identifier,
        password,
      });

      const { token, user } = res.data;

      // LocalStorage işlemlerini bir kez yapmanız yeterli
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Giriş başarılı 🎉");

      // App.jsx'teki state'i güncellemek için fonksiyonu çağırıyoruz
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Giriş başarısız");
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