import React from "react";
import { useProjectDetail } from "../../hooks/useProjectDetail";
import KanbanBoard from "../../components/jsx/KanbanBoard";
import TaskModal from "../../components/jsx/TasksModal";
import "../css/projectDetail.css";

export default function ProjectDetail() {
    const { 
        project, tasks, loading, view, setView,
        isTaskModalOpen, handleCreateTask, updateTaskStatus,
        handleUpdateTask, openEditModal, editingTask,
        handleDeleteTask, closeTaskModal, setIsTaskModalOpen 
    } = useProjectDetail();

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;
    if (!project) return <div className="error-state">Proje bulunamadı.</div>;

    return (
        <div className="project-detail-container fade-in">
            <header className="project-detail-header">
                <div className="project-title-area">
                    <div className="project-avatar" style={{backgroundColor: project.color || "#6366f1"}}>
                        {project.title?.charAt(0).toUpperCase()}
                    </div>
                    <div className="project-info">
                        <h1>{project.title}</h1>
                        <span className="badge">{project.category || "Genel"}</span>
                    </div>
                </div>

                <div className="project-actions">
                    <div className="view-switcher">
                        <button className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}>📋 Kanban</button>
                        <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>📝 Liste</button>
                    </div>
                    <button className="btn-primary" onClick={() => setIsTaskModalOpen(true)}>+ Yeni Görev</button>
                </div>
            </header>

            <main className="project-content">
                {view === "kanban" && (
                    <KanbanBoard 
                        tasks={tasks} 
                        updateTaskStatus={updateTaskStatus} 
                        onEdit={openEditModal}
                        onDelete={handleDeleteTask} 
                    />
                )}
                {view === "list" && (
                    <div className="list-view-container">
                        <table className="task-table">
                            <thead>
                                <tr><th>Görev</th><th>Durum</th><th>Öncelik</th><th>Bitiş Tarihi</th></tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task._id}>
                                        <td>{task.task}</td>
                                        <td><span className={`pill ${task.status}`}>{task.status}</span></td>
                                        <td><span className={`priority ${task.priority}`}>{task.priority}</span></td>
                                        <td>{new Date(task.dueDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <TaskModal 
                isOpen={isTaskModalOpen}
                onClose={closeTaskModal}
                onSubmit={editingTask ? (data) => handleUpdateTask(editingTask._id, data) : handleCreateTask}
                initialData={editingTask}
            />
        </div>
    );
}