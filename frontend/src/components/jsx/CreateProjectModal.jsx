/**
 * CreateProjectModal Bileşeni
 * Yeni bir proje başlatmak için gerekli tüm verileri (ad, açıklama, renk, tarih) toplar.
 * scale-up animasyonu ile daha dinamik bir giriş sağlar.
 */

import React, { useState } from "react";
import "../css/CreateProjectModal.css";

// Sabit Veriler: Uygulamanın standartlarını belirler
const CATEGORIES = ["Yazılım", "Tasarım", "Pazarlama", "Kişisel", "Eğitim"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Yazılım",
    color: "#6366f1",
    deadline: ""
  });

  // Modal kapalıysa render etme (Erken dönüş)
  if (!isOpen) return null;

  /**
   * Form Gönderimi
   * useDashboard hook'undan gelen onCreate fonksiyonuna verileri paslar.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData); 
    
    // Formu sıfırla ve modalı kapat (İsteğe bağlı, üst bileşende de yapılabilir)
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal İçeriği: scale-up sınıfı ile animasyonlu açılış */}
      <div 
        className="modal-content scale-up" 
        onClick={(e) => e.stopPropagation()} // Overlay tıklamasının formu kapatmasını engeller
      >
        <div className="modal-header">
          <h2>🚀 Yeni Proje Başlat</h2>
          <button className="close-btn" onClick={onClose} aria-label="Kapat">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Proje Adı */}
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

          {/* Açıklama */}
          <div className="form-group">
            <label>Açıklama</label>
            <textarea 
              placeholder="Proje hakkında kısa bir bilgi..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>

          <div className="form-row">
            {/* Kategori Seçimi */}
            <div className="form-group">
              <label>Kategori</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Bitiş Tarihi */}
            <div className="form-group">
              <label>Bitiş Tarihi</label>
              <input 
                type="date" 
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              />
            </div>
          </div>

          {/* Renk Seçici: Proje kartlarının Dashboard üzerindeki rengini belirler */}
          <div className="form-group">
            <label>Proje Rengi</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <div 
                  key={c} 
                  className={`color-circle ${formData.color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormData({...formData, color: c})}
                  title={`Renk: ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="btn-primary">
              Proje Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}