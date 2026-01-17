/**
 * CollaboratorsModal Bileşeni
 * Projeye yeni ekip üyeleri davet etmek ve mevcut üyelerin 
 * yetkilerini yönetmek için kullanılır.
 */

import React, { useState } from "react";
import "../css/CollaboratorsModal.css";

export default function CollaboratorsModal({ isOpen, onClose, collaborators, onAdd, onRemove }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer"); // Varsayılan rol: İzleyici

    // Modal kapalıysa hiçbir şey render etme
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // Davet etme işlemini üst bileşene (ProjectDetail veya Dashboard) pasla
        onAdd(email, role);
        setEmail(""); // Formu temizle
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal-content collab-modal scale-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Proje Katılımcıları</h2>
                    <button onClick={onClose} className="close-btn" aria-label="Kapat">&times;</button>
                </div>

                {/* Yeni Üye Ekleme Formu */}
                <form onSubmit={handleSubmit} className="add-collab-form">
                    <div className="input-group">
                        <input 
                            type="email" 
                            placeholder="Kullanıcı e-posta adresi..." 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary">Davet Et</button>
                </form>

                <hr className="divider" />

                {/* Mevcut Katılımcı Listesi */}
                <div className="collaborators-list">
                    <h3>Kayıtlı Üyeler ({collaborators?.length || 0})</h3>
                    {collaborators?.length > 0 ? (
                        collaborators.map((collab) => (
                            <div key={collab.user._id} className="collab-item">
                                <div className="collab-info">
                                    <div className="collab-avatar">
                                        {collab.user.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="collab-text">
                                        <span className="collab-name">{collab.user.username}</span>
                                        <span className={`role-badge ${collab.role}`}>{collab.role}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onRemove(collab.user._id)} 
                                    className="btn-remove-collab"
                                    title="Üyeyi Projeden Çıkar"
                                >
                                    Kaldır
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-data">Henüz hiç katılımcı eklenmemiş.</p>
                    )}
                </div>
            </div>
        </div>
    );
}