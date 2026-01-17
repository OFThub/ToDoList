import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "../css/Kanban.css";
import api from "../../services/api/axios";

const COLUMNS = [
  { id: "todo", title: "Yapılacaklar" },
  { id: "in-progress", title: "Devam Ediyor" },
  { id: "done", title: "Tamamlandı" }
];

export default function KanbanBoard({ 
  tasks = [], 
  updateTaskStatus, 
  onEdit, 
  onDelete 
}) {
  const [users, setUsers] = useState({});

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Kullanıcıyı tek sefer çek
  const fetchUser = useCallback(async (userId) => {
    if (!userId || users[userId]) return;

    try {
      const res = await api.get(`/users/${userId}`);
      setUsers(prev => ({
        ...prev,
        [userId]: res.data.username
      }));
    } catch (err) {
      console.error("Kullanıcı yüklenemedi:", err);
    }
  }, [users]);

  // Task'lardaki kullanıcıları SADECE BİR KEZ yükle
  useEffect(() => {
    const uniqueUserIds = [...new Set(safeTasks.map(t => t.createdBy))];
    uniqueUserIds.forEach(fetchUser);
  }, [safeTasks, fetchUser]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    updateTaskStatus?.(draggableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-wrapper">
        {COLUMNS.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`kanban-column ${
                  snapshot.isDraggingOver ? "dragging-over" : ""
                }`}
              >
                <h3 className="column-header">
                  {col.title}
                  <span className="task-count">
                    ({safeTasks.filter(t => t.status === col.id).length})
                  </span>
                </h3>

                <div className="task-container">
                  {safeTasks
                    .filter(task => task.status === col.id)
                    .map((task, index) => {
                      const creatorName =
                        users[task.createdBy] || "Bilinmiyor";

                      return (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task-card ${
                                snapshot.isDragging ? "is-dragging" : ""
                              } priority-${task.priority?.toLowerCase()}`}
                              style={provided.draggableProps.style}
                            >
                              <div className="task-header">
                                <span
                                  className="user-badge"
                                  title="Görevi Oluşturan"
                                >
                                  👤 {creatorName}
                                </span>

                                <div className="task-actions">
                                  <button
                                    className="btn-icon"
                                    onClick={() => onEdit?.(task)}
                                    title="Düzenle"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn-icon"
                                    onClick={() => onDelete?.(task._id)}
                                    title="Sil"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>

                              <h4 className="task-title">
                                {task.task || "Başlıksız Görev"}
                              </h4>

                              {task.description && (
                                <p className="task-desc">
                                  {task.description.length > 80
                                    ? `${task.description.substring(0, 80)}...`
                                    : task.description}
                                </p>
                              )}

                              <div className="task-footer">
                                <div className="task-date">
                                  {task.dueDate ? (
                                    <>📅 {new Date(task.dueDate).toLocaleDateString()}</>
                                  ) : (
                                    <span className="no-date">Tarih yok</span>
                                  )}
                                </div>

                                {task.priority && (
                                  <span
                                    className={`priority-badge ${task.priority.toLowerCase()}`}
                                  >
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
