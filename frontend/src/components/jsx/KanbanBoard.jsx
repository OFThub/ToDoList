import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useKanbanBoard } from "../../hooks/useKanbanBoard";
import "../css/Kanban.css";

export default function KanbanBoard({ 
    tasks = [], 
    project,
    updateTaskStatus, 
    onEdit, 
    onDelete,
    onJoin,
    currentUserId,
    onProjectUpdate
}) {
    const {
        columns,
        users,
        newColumnTitle,
        setNewColumnTitle,
        expandedTasks,
        safeTasks,
        isLoadingColumn,
        addColumn,
        removeColumn,
        toggleSubTasks,
        onDragEnd,
        getSubTasks,

    } = useKanbanBoard(
        tasks, 
        updateTaskStatus, 
        currentUserId, 
        project?._id, 
        project?.customStatuses || [],
        onProjectUpdate
    );

    const renderTaskCard = (task, index, isSubTask = false) => {
        if (!task || !task._id) return null;

        const isAssigned = task.assignees?.some(id => 
            (typeof id === 'object' ? id._id : id) === currentUserId
        );
        const subTasks = getSubTasks(task._id);
        const hasSubTasks = subTasks.length > 0;
        const isExpanded = expandedTasks.has(task._id);

        return (
            <React.Fragment key={task._id}>
                <Draggable draggableId={task._id} index={index}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card ${snapshot.isDragging ? "is-dragging" : ""} ${isSubTask ? "subtask" : ""} priority-${task.priority?.toLowerCase() || "normal"}`}
                            style={{ 
                                ...provided.draggableProps.style, 
                                marginLeft: isSubTask ? '20px' : '0' 
                            }}
                        >
                            <div className="task-header">
                                <div className="task-assignees-avatars">
                                    {Array.isArray(task.assignees) && task.assignees.map((assigneeId) => {
                                        const id = typeof assigneeId === 'object' ? assigneeId._id : assigneeId;
                                        const name = users[id] || "...";
                                        return (
                                            <div 
                                                key={id} 
                                                className={`mini-avatar ${id === currentUserId ? 'me' : ''}`} 
                                                title={name}
                                            >
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                        );
                                    })}
                                    <button 
                                        className={`btn-join-task ${isAssigned ? 'leave' : 'join'}`} 
                                        onClick={() => onJoin?.(task)}
                                        title={isAssigned ? "Çıkış yap" : "Katıl"}
                                    > 
                                        {isAssigned ? "-" : "+"} 
                                    </button>
                                </div>
                                <div className="task-actions">
                                    <button 
                                        onClick={() => onEdit?.(task)} 
                                        title="Düzenle"
                                        className="btn-edit"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        onClick={() => onDelete?.(task._id)} 
                                        title="Sil"
                                        className="btn-delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <div className="task-content-area">
                                {hasSubTasks && (
                                    <button 
                                        className="subtask-toggle" 
                                        onClick={() => toggleSubTasks(task._id)}
                                    >
                                        {isExpanded ? '▼' : '▶'} {subTasks.length} alt görev
                                    </button>
                                )}
                                <h4 className="task-title">{task.task || "Başlıksız Görev"}</h4>
                                {task.description && <p className="task-desc">{task.description}</p>}
                                
                                {task.progress > 0 && (
                                    <div className="progress-container">
                                        <div className="progress-bar" style={{ width: `${task.progress}%` }}>
                                            <span className="progress-text">{task.progress}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="task-footer">
                                <span className="task-date">
                                    📅 {task.startDate ? new Date(task.startDate).toLocaleDateString('tr-TR') : '..'} - {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '..'}
                                </span>
                                <span className={`priority-badge ${task.priority?.toLowerCase() || "normal"}`}>
                                    {task.priority || "Normal"}
                                </span>
                            </div>
                        </div>
                    )}
                </Draggable>
                {isExpanded && hasSubTasks && subTasks.map((subTask, subIdx) => 
                    renderTaskCard(subTask, index + subIdx + 1, true)
                )}
            </React.Fragment>
        );
    };

    // Sütunları ve görevleri kontrol et
    if (!Array.isArray(columns) || columns.length === 0) {
        return (
            <div className="kanban-outer-container">
                <div className="kanban-empty-state">
                    <p>Kanban tahtası yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="kanban-outer-container">
            <div className="column-controls">
                <input 
                    type="text" 
                    placeholder="Örn: Test Aşaması" 
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addColumn()}
                    disabled={isLoadingColumn}
                    className="column-input"
                />
                <button 
                    onClick={addColumn} 
                    className="btn-add-column"
                    disabled={isLoadingColumn}
                >
                    {isLoadingColumn ? "Ekleniyor..." : "+ Sütun Ekle"}
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-wrapper">
                    {columns.map((col) => {
                        if (!col || !col.id) return null;
                        
                        const columnTasks = safeTasks.filter(t => 
                            t && t.status === col.id && !t.parentTask
                        );
                        
                        return (
                            <Droppable droppableId={col.id} key={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`kanban-column ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                                        style={{ borderTopColor: col.color }}
                                    >
                                        <h3 className="column-header">
                                            <div className="header-text">
                                                <span 
                                                    className="status-indicator"
                                                    style={{ backgroundColor: col.color }}
                                                    title="Durum rengi"
                                                ></span>
                                                {col.title || col.id}
                                                <span className="task-count">{columnTasks.length}</span>
                                            </div>
                                            <button 
                                                className="btn-remove-col" 
                                                onClick={() => removeColumn(col.id)}
                                                title="Sütunu sil"
                                            >
                                                &times;
                                            </button>
                                        </h3>
                                        <div className="task-container">
                                            {columnTasks.length > 0 ? (
                                                columnTasks.map((task, index) => renderTaskCard(task, index))
                                            ) : (
                                                <div className="empty-column">Görev yok</div>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
        </div>
    );
}