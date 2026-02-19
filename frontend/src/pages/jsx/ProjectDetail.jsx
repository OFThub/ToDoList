/**
 * Proje Detay Sayfası (Project Detail)
 * Projenin görevlerini, katılımcılarını ve genel bilgilerini yönetir.
 * Görünüm (Kanban / Liste / Gantt) değişimi ve modal yönetimi bu bileşen üzerinden koordine edilir.
 */

import React from "react";
import { useProjectDetail } from "../../hooks/useProjectDetail";

// --- Alt Bileşenler ---
import KanbanBoard from "../../components/jsx/KanbanBoard";
import GanttView   from "../../components/jsx/GanttView";       // ← YENİ
import TaskModal from "../../components/jsx/TasksModal";
import CollaboratorsModal from "../../components/jsx/CollaboratorsModal";

// --- Stil ---
import "../css/projectDetail.css";

export default function ProjectDetail() {
    const { 
        project, tasks, loading, error, view, setView,
        isTaskModalOpen, setIsTaskModalOpen, 
        editingTask, openEditModal, closeTaskModal,
        handleCreateTask, handleUpdateTask, updateTaskStatus,
        handleDeleteTask, 
        isCollabModalOpen, setIsCollabModalOpen,
        addCollaborator, removeCollaborator,
        currentUserId, handleToggleJoinTask,
        handleProjectUpdate
    } = useProjectDetail();

    // --- Durum Kontrolleri ---
    if (loading) {
        return (
            <div className="loader-container">
                <div className="loader"></div>
                <p>Proje yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-state">
                <h2>⚠️ Hata</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Yeniden Yükle</button>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="error-state">
                <h2>⚠️ Proje Bulunamadı</h2>
                <p>Aradığınız proje mevcut değil.</p>
            </div>
        );
    }

    return (
        <div className="project-detail-container fade-in">

            {/* Üst Bilgi Çubuğu */}
            <header className="project-detail-header">
                
                {/* Sol: Proje Künyesi */}
                <div className="project-title-area">
                    <div className="project-avatar" style={{ backgroundColor: project.color || "#6366f1" }}>
                        {project.title?.charAt(0).toUpperCase()}
                    </div>
                    <div className="project-info">
                        <h1>{project.title}</h1>
                        <span className="badge">{project.category || "Genel"}</span>
                    </div>
                </div>

                {/* Orta: Ekip / Katılımcılar */}
                <div className="project-team-section">
                    <div className="avatar-group" onClick={() => setIsCollabModalOpen(true)}>
                        {project.owner && (
                            <div className="mini-avatar owner" title={`Sahip: ${project.owner.username}`}>
                                {project.owner.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {project.collaborators?.slice(0, 3).map(c => (
                            <div key={c.user._id} className="mini-avatar" title={c.user.username}>
                                {c.user.username?.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {project.collaborators?.length > 3 && (
                            <div className="mini-avatar more">+{project.collaborators.length - 3}</div>
                        )}
                        <button className="btn-add-member" onClick={() => setIsCollabModalOpen(true)}>
                            + Katılımcı
                        </button>
                    </div>
                </div>

                {/* Sağ: Görünüm Seçenekleri ve Yeni Görev */}
                <div className="project-actions">
                    <div className="view-switcher">
                        <button
                            className={view === "kanban" ? "active" : ""}
                            onClick={() => setView("kanban")}
                        >
                            📋 Kanban
                        </button>
                        <button
                            className={view === "list" ? "active" : ""}
                            onClick={() => setView("list")}
                        >
                            📝 Liste
                        </button>
                        {/* ── YENİ: Gantt sekmesi ── */}
                        <button
                            className={view === "gantt" ? "active" : ""}
                            onClick={() => setView("gantt")}
                        >
                            📅 Zaman
                        </button>
                    </div>
                    <button className="btn-primary" onClick={() => setIsTaskModalOpen(true)}>
                        + Yeni Görev
                    </button>
                </div>
            </header>

            {/* Ana İçerik */}
            <main className="project-content">
                {view === "kanban" && (
                    <KanbanBoard 
                        tasks={tasks}
                        project={project}
                        updateTaskStatus={updateTaskStatus} 
                        onEdit={openEditModal}
                        onDelete={handleDeleteTask} 
                        onJoin={handleToggleJoinTask} 
                        currentUserId={currentUserId}
                        onProjectUpdate={handleProjectUpdate}
                    />
                )}

                {view === "list" && (
                    <div className="list-view-container">
                        <table className="task-table">
                            <thead>
                                <tr>
                                    <th>Görev</th>
                                    <th>Durum</th>
                                    <th>Öncelik</th>
                                    <th>Bitiş Tarihi</th>
                                    <th>İşlemler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task._id}>
                                        <td className="task-name">{task.task}</td>
                                        <td>
                                            <select 
                                                value={task.status} 
                                                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                                className="status-select"
                                            >
                                                {project.customStatuses?.map(status => (
                                                    <option key={status.label} value={status.label}>
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`priority ${task.priority?.toLowerCase()}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : "—"}</td>
                                        <td className="actions">
                                            <button onClick={() => openEditModal(task)} title="Düzenle">✏️</button>
                                            <button onClick={() => handleDeleteTask(task._id)} title="Sil">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── YENİ: Gantt Görünümü ── */}
                {view === "gantt" && (
                    <GanttView
                        tasks={tasks}
                        project={project}
                    />
                )}
            </main>

            {/* Modallar */}
            <TaskModal 
                isOpen={isTaskModalOpen}
                onClose={closeTaskModal}
                onSubmit={editingTask ? (data) => handleUpdateTask(editingTask._id, data) : handleCreateTask}
                initialData={editingTask}
                customStatuses={project.customStatuses}
            />

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