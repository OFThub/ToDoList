import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      alert("Kayıt başarılı");
      console.log(res.data);

      // Örnek Register/Login başarılı olduğunda:
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.message || "Kayıt olurken hata oluştu");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Kullanıcı Adı" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Şifre" onChange={handleChange} />
      <button type="submit">Kayıt Ol</button>
    </form>
  );
}
