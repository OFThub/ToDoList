import React from "react";
import { useTasksModel } from "../../hooks/useTasksModal";
import "../css/TasksModal.css";

export default function TaskModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData = null,
    availableTasks = []
}) {
    const {
        formData,
        tagInput,
        setTagInput,
        parentTaskOptions,
        handleChange,
        handleAddTag,
        handleRemoveTag,
        handleSubmit
    } = useTasksModel(initialData, isOpen, onSubmit, availableTasks);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initialData ? "Görevi Düzenle" : "Yeni Görev Oluştur"}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label>Görev Başlığı *</label>
                        <input
                            type="text"
                            name="task"
                            value={formData.task}
                            onChange={handleChange}
                            placeholder="Görevin başlığını girin"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Açıklama</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Görev detaylarını yazın..."
                            rows="3"
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
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Başlangıç Tarihi</label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
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

                    <div className="form-group">
                        <label>Etiketler</label>
                        <div className="tag-input-container">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                placeholder="Etiket ekle (Enter ile)"
                            />
                            <button type="button" onClick={handleAddTag} className="btn-add-tag">
                                + Ekle
                            </button>
                        </div>
                        <div className="tags-display">
                            {formData.tags.map((tag, idx) => (
                                <span key={idx} className="tag-item">
                                    #{tag}
                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="tag-remove">
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">İptal</button>
                        <button type="submit" className="btn-submit">
                            {initialData ? "Güncelle" : "Oluştur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}