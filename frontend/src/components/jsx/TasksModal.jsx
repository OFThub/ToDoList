/**
 * TaskModal Bileşeni
 * Yeni görev ekleme veya mevcut görevleri düzenleme işlemlerini yönetir.
 * Kontrollü form (controlled component) yapısını kullanır.
 */

import React, { useState } from "react";
import "../css/TasksModal.css";

export default function TaskModal({ isOpen, onClose, onSubmit, project }) {
  // --- Form State Başlangıç Değerleri ---
  const initialFormState = {
    task: "",
    description: "",
    priority: "Medium",
    status: "todo",
    dueDate: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  // Modal kapalıysa DOM'a hiçbir şey basma (Performans optimizasyonu)
  if (!isOpen) return null;

  /**
   * Input Değişim Yönetimi
   * Tüm input, textarea ve select elementlerini tek bir fonksiyonla günceller.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Form Gönderim Yönetimi
   * Veriyi üst bileşene (onSubmit) iletir, formu temizler ve modalı kapatır.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    
    // İşlem sonrası formu ilk haline döndür ve kapat
    setFormData(initialFormState);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* e.stopPropagation: İçeriğe tıklandığında modalın kapanmasını önler */}
      <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Başlık Alanı */}
        <div className="modal-header">
          <h2>Yeni Görev Ekle</h2>
          <button className="close-btn" onClick={onClose} aria-label="Kapat">
            &times;
          </button>
        </div>

        {/* Görev Formu */}
        <form onSubmit={handleSubmit}>
          
          {/* Görev Başlığı */}
          <div className="form-group">
            <label htmlFor="task">Görev Başlığı</label>
            <input
              id="task"
              type="text"
              name="task"
              value={formData.task}
              onChange={handleChange}
              placeholder="Yapılacak işi yazın..."
              required
            />
          </div>

          {/* Açıklama */}
          <div className="form-group">
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Görev detayları..."
              rows="3"
            />
          </div>

          {/* Yan Yana Alanlar: Öncelik ve Tarih */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Öncelik</label>
              <select 
                id="priority" 
                name="priority" 
                value={formData.priority} 
                onChange={handleChange}
              >
                <option value="Low">Düşük</option>
                <option value="Medium">Orta</option>
                <option value="High">Yüksek</option>
                <option value="Urgent">Acil</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Bitiş Tarihi</label>
              <input
                id="dueDate"
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
            >
              İptal
            </button>
            <button type="submit" className="btn-primary">
              Görevi Oluştur
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}