import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COLUMNS = [
  { id: "todo", title: "Yapılacaklar" },
  { id: "in-progress", title: "Devam Ediyor" },
  { id: "done", title: "Tamamlandı" }
];

export default function KanbanBoard({ tasks = [], updateTaskStatus }) {
  // GÜVENLİK: tasks undefined veya null gelirse boş diziye eşitle
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    if (updateTaskStatus) {
      updateTaskStatus(draggableId, destination.droppableId);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-wrapper" style={{ display: "flex", gap: "20px", padding: "20px", overflowX: "auto" }}>
        {COLUMNS.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`kanban-column ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                style={{
                  background: "#f4f5f7",
                  borderRadius: "10px",
                  padding: "15px",
                  minWidth: "300px",
                  minHeight: "400px"
                }}
              >
                <div className="column-header" style={{ marginBottom: "15px", fontWeight: "bold" }}>
                  {col.title} ({safeTasks.filter(t => t.status === col.id).length})
                </div>

                <div className="task-container" style={{ minHeight: "100px" }}>
                  {safeTasks
                    .filter((task) => task.status === col.id)
                    .map((task, index) => (
                      <Draggable 
                        key={task._id || `task-${index}`} 
                        draggableId={task._id || `task-${index}`} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? "is-dragging" : ""}`}
                            style={{
                              background: "white",
                              padding: "15px",
                              borderRadius: "6px",
                              marginBottom: "10px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              ...provided.draggableProps.style
                            }}
                          >
                            <h4 style={{ margin: 0 }}>{task.task || "Başlıksız Görev"}</h4>
                            {task.description && (
                              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                                {task.description.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
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