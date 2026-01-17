/**
 * Proje Detay Sayfası (Project Detail)
 * Projenin görevlerini, katılımcılarını ve genel bilgilerini yönetir.
 * Görünüm (Kanban/Liste) değişimi ve modal yönetimi bu bileşen üzerinden koordine edilir.
 */

import React from "react";
import { useProjectDetail } from "../../hooks/useProjectDetail";

// --- Alt Bileşenler ---
import KanbanBoard from "../../components/jsx/KanbanBoard";
import TaskModal from "../../components/jsx/TasksModal";
import CollaboratorsModal from "../../components/jsx/CollaboratorsModal";

// --- Stil ---
import "../css/projectDetail.css";

export default function ProjectDetail() {
    // Custom Hook'tan gelen state ve fonksiyonların yapılandırılması
    const { 
        project, tasks, loading, view, setView,
        isTaskModalOpen, setIsTaskModalOpen, 
        editingTask, openEditModal, closeTaskModal,
        handleCreateTask, handleUpdateTask, updateTaskStatus,
        handleDeleteTask, 
        isCollabModalOpen, setIsCollabModalOpen,
        addCollaborator, removeCollaborator,
        currentUserId, handleToggleJoinTask 
    } = useProjectDetail();

    // --- Durum Kontrolleri (Loading & Error) ---
    if (loading) {
        return <div className="loader-container"><div className="loader"></div></div>;
    }

    if (!project) {
        return <div className="error-state">Proje bulunamadı.</div>;
    }

    return (
        <div className="project-detail-container fade-in">
            
            {/* Üst Bilgi Çubuğu: Başlık, Kategori ve Aksiyonlar */}
            <header className="project-detail-header">
                
                {/* Sol Kısım: Proje Künyesi */}
                <div className="project-title-area">
                    <div className="project-avatar" style={{ backgroundColor: project.color || "#6366f1" }}>
                        {project.title?.charAt(0).toUpperCase()}
                    </div>
                    <div className="project-info">
                        <h1>{project.title}</h1>
                        <span className="badge">{project.category || "Genel"}</span>
                    </div>
                </div>

                {/* Orta Kısım: Ekip / Katılımcılar */}
                <div className="project-team-section">
                    <div className="avatar-group" onClick={() => setIsCollabModalOpen(true)}>
                        {/* Proje Sahibi (Owner) */}
                        {project.owner && (
                            <div className="mini-avatar owner" title={`Sahip: ${project.owner.username}`}>
                                {project.owner.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {/* Diğer Katılımcılar (İlk 3 Kişi) */}
                        {project.collaborators?.slice(0, 3).map(c => (
                            <div key={c.user._id} className="mini-avatar" title={c.user.username}>
                                {c.user.username?.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {/* Fazla Katılımcı Göstergesi */}
                        {project.collaborators?.length > 3 && (
                            <div className="mini-avatar more">+{project.collaborators.length - 3}</div>
                        )}
                        <button className="btn-add-member">+ Katılımcı</button>
                    </div>
                </div>

                {/* Sağ Kısım: Görünüm Seçenekleri ve Yeni Görev */}
                <div className="project-actions">
                    <div className="view-switcher">
                        <button className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}>
                            📋 Kanban
                        </button>
                        <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>
                            📝 Liste
                        </button>
                    </div>
                    <button className="btn-primary" onClick={() => setIsTaskModalOpen(true)}>
                        + Yeni Görev
                    </button>
                </div>
            </header>

            {/* Ana İçerik Alanı: Seçili Görünüme Göre Render Edilir */}
            <main className="project-content">
                {view === "kanban" ? (
                    // Görünüm 1: Sürükle-Bırak Destekli Kanban Tahtası
                    <KanbanBoard 
                        tasks={tasks} 
                        updateTaskStatus={updateTaskStatus} 
                        onEdit={openEditModal}
                        onDelete={handleDeleteTask} 
                        onJoin={handleToggleJoinTask} 
                        currentUserId={currentUserId}
                    />
                ) : (
                    // Görünüm 2: Geleneksel Tablo Listesi
                    <div className="list-view-container">
                        <table className="task-table">
                            <thead>
                                <tr>
                                    <th>Görev</th>
                                    <th>Durum</th>
                                    <th>Öncelik</th>
                                    <th>Bitiş Tarihi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task._id}>
                                        <td>{task.task}</td>
                                        <td><span className={`pill ${task.status}`}>{task.status}</span></td>
                                        <td><span className={`priority ${task.priority}`}>{task.priority}</span></td>
                                        <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* --- Modallar (Global Modals) --- */}
            
            {/* Görev Ekleme/Düzenleme Modalı */}
            <TaskModal 
                isOpen={isTaskModalOpen}
                onClose={closeTaskModal}
                onSubmit={editingTask ? (data) => handleUpdateTask(editingTask._id, data) : handleCreateTask}
                initialData={editingTask}
            />

            {/* Katılımcı Yönetimi Modalı */}
            <CollaboratorsModal 
                isOpen={isCollabModalOpen}
                onClose={() => setIsCollabModalOpen(false)}
                collaborators={project.collaborators}
                onAdd={addCollaborator}
                onRemove={removeCollaborator}
            />
        </div>
    );
}