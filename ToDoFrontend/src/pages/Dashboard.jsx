import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      {user ? (
        <>
          <p>
            Hoş geldin <b>{user.username}</b> ({user.email})
          </p>

          <button onClick={logout}>Çıkış Yap</button>
        </>
      ) : (
        <p>Kullanıcı bilgisi bulunamadı</p>
      )}
    </div>
  );
}
