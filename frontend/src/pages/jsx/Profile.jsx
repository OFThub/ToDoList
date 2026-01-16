import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api/axios";
import { toast } from "react-hot-toast";
import "../css/Profile.css";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state'ini mevcut kullanıcı bilgileriyle dolduruyoruz
  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    jobTitle: user?.profile?.jobTitle || "",
    bio: user?.profile?.bio || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend'deki /api/v1/users/profile rotasına istek atar
      const res = await api.put("/users/profile", formData);
      
      if (res.success) {
        setUser(res.data); // Global auth context'i güncelle
        toast.success("Profil başarıyla güncellendi ✨");
      }
    } catch (err) {
      toast.error(err.message || "Güncelleme başarısız oldu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page fade-in">
      <div className="profile-header">
        <h1>Hesap Ayarları</h1>
        <p>Profil bilgilerinizi ve hesap tercihlerinizi buradan yönetin.</p>
      </div>

      <div className="profile-container">
        {/* Sol Menü - Bilgi Kartı */}
        <aside className="profile-card">
          <div className="profile-avatar-large">
            {user?.username?.[0].toUpperCase()}
          </div>
          <div className="profile-card-info">
            <h2>{user?.username}</h2>
            <p>{user?.email}</p>
            <span className="badge">Standart Plan</span>
          </div>
        </aside>

        {/* Sağ Taraf - Düzenleme Formu */}
        <main className="profile-form-area card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Ad</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Adınız"
                />
              </div>
              <div className="form-group">
                <label>Soyad</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Soyadınız"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Ünvan</label>
              <input
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="Örn: Senior Developer, Product Manager"
              />
            </div>

            <div className="form-group">
              <label>Hakkımda</label>
              <textarea
                name="bio"
                rows="4"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Kısaca kendinizden bahsedin..."
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}