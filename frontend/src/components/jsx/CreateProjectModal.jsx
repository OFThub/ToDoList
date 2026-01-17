// components/CreateProjectModal.jsx
import React, { useState } from "react";

const CATEGORIES = ["Yazılım", "Tasarım", "Pazarlama", "Kişisel", "Eğitim"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Yazılım",
    color: "#6366f1",
    deadline: ""
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData); // useDashboard'daki fonksiyonu tetikler
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content scale-up">
        <div className="modal-header">
          <h2>🚀 Yeni Proje Başlat</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Proje Adı</label>
            <input 
              type="text" 
              placeholder="Örn: Mobil Uygulama Arayüzü" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea 
              placeholder="Proje hakkında kısa bir bilgi..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kategori</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Bitiş Tarihi</label>
              <input 
                type="date" 
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Proje Rengi</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <div 
                  key={c} 
                  className={`color-circle ${formData.color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormData({...formData, color: c})}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="btn-primary">Proje Oluştur</button>
          </div>
        </form>
      </div>
    </div>
  );
}