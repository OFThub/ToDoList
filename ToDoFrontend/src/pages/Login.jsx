import axios from "axios";
import { useState } from "react";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // username veya email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      alert("Kullanıcı adı/email ve şifre boş olamaz");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          identifier,
          password,
        }
      );

      const { token, user } = res.data;

      // LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Giriş başarılı 🎉");
      console.log("LOGIN RESPONSE:", res.data);

      window.location.href = "/dashboard";

    } catch (err) {
      console.error("LOGIN ERROR:", err.response?.data);
      alert(err.response?.data?.message || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Giriş Yap</h2>

      <form onSubmit={handleSubmit}>
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
    </div>
  );
}
