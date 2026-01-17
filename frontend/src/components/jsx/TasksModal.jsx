import React, { useState } from "react";
import "../css/TasksModal.css";

export default function TaskModal({ isOpen, onClose, onSubmit, project }) {
  const [formData, setFormData] = useState({
    task: "",
    description: "",
    priority: "Medium",
    status: "todo",
    dueDate: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Formu temizle ve kapat
    setFormData({ task: "", description: "", priority: "Medium", status: "todo", dueDate: "" });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in">
        <div className="modal-header">
          <h2>Yeni Görev Ekle</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Görev Başlığı</label>
            <input
              type="text"
              name="task"
              value={formData.task}
              onChange={handleChange}
              placeholder="Yapılacak işi yazın..."
              required
            />
          </div>

          <div className="form-group">
            <label>Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Görev detayları..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Öncelik</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="Low">Düşük</option>
                <option value="Medium">Orta</option>
                <option value="High">Yüksek</option>
                <option value="Urgent">Acil</option>
              </select>
            </div>

            <div className="form-group">
              <label>Bitiş Tarihi</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
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