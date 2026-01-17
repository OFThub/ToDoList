/**
 * KanbanBoard Bileşeni
 * Görevlerin durumlarına göre sütunlara ayrıldığı, 
 * sürükle-bırak desteği sunan ana çalışma alanıdır.
 */

import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../services/api/axios";

// CSS dosyası (Öncelik renkleri ve sürükleme animasyonlarını içerir)
import "../css/Kanban.css";

// Varsayılan Sütun Yapısı
const INITIAL_COLUMNS = [
    { id: "todo", title: "Yapılacaklar" },
    { id: "in-progress", title: "Devam Ediyor" },
    { id: "done", title: "Tamamlandı" }
];

export default function KanbanBoard({ 
    tasks = [], 
    updateTaskStatus, 
    onEdit, 
    onDelete,
    onJoin,
    currentUserId 
}) {
    // --- State Yönetimi ---
    const [columns, setColumns] = useState(INITIAL_COLUMNS);
    const [users, setUsers] = useState({}); // Kullanıcı ID'lerini isimlere eşler (Cache)
    const [newColumnTitle, setNewColumnTitle] = useState("");

    const safeTasks = Array.isArray(tasks) ? tasks : [];

    // --- Sütun Yönetimi ---

    /** Yeni bir statü/sütun ekler */
    const addColumn = () => {
        if (!newColumnTitle.trim()) return;
        const newCol = {
            id: newColumnTitle.toLowerCase().replace(/\s+/g, '-'), // "Acil İşler" -> "acil-isler"
            title: newColumnTitle
        };
        setColumns([...columns, newCol]);
        setNewColumnTitle("");
    };

    /** Belirli bir sütunu listeden kaldırır */
    const removeColumn = (id) => {
        if (window.confirm("Bu sütunu silmek istediğinize emin misiniz?")) {
            setColumns(columns.filter(col => col.id !== id));
        }
    };

    // --- Kullanıcı Bilgisi Çekme (Avatar İsimleri İçerik) ---

    const fetchUserData = useCallback(async (userId) => {
        if (!userId || users[userId]) return; // Zaten yüklüyse tekrar çekme
        try {
            const res = await api.get(`/users/${userId}`);
            setUsers(prev => ({ ...prev, [userId]: res.data.username }));
        } catch (err) { 
            console.error(`Kullanıcı (${userId}) bilgisi alınamadı.`); 
        }
    }, [users]);

    // Görev listesi değiştikçe eksik kullanıcı bilgilerini tamamla
    useEffect(() => {
        const idsToFetch = new Set();
        safeTasks.forEach(task => {
            if (task.createdBy) idsToFetch.add(task.createdBy);
            task.assignees?.forEach(idOrObj => {
                const id = typeof idOrObj === 'object' ? idOrObj._id : idOrObj;
                if (id) idsToFetch.add(id);
            });
        });
        idsToFetch.forEach(id => fetchUserData(id));
    }, [safeTasks, fetchUserData]);

    // --- Drag & Drop Mantığı ---

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        
        // Geçersiz bir yere bırakıldıysa veya yeri değişmediyse çık
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
        
        // Üst bileşene durum güncelleme isteği gönder (API call tetikler)
        updateTaskStatus?.(draggableId, destination.droppableId);
    };

    return (
        <div className="kanban-outer-container">
            
            {/* Sütun Ekleme Paneli */}
            <div className="column-controls">
                <input 
                    type="text" 
                    placeholder="Örn: Test Aşaması" 
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                />
                <button onClick={addColumn} className="btn-add-column">
                    + Sütun Ekle
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-wrapper">
                    {columns.map((col) => (
                        <Droppable droppableId={col.id} key={col.id}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`kanban-column ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                                >
                                    {/* Sütun Başlığı ve Görev Sayısı */}
                                    <h3 className="column-header">
                                        <div className="header-text">
                                            {col.title}
                                            <span className="task-count">
                                                {safeTasks.filter(t => t.status === col.id).length}
                                            </span>
                                        </div>
                                        <button className="btn-remove-col" onClick={() => removeColumn(col.id)}>&times;</button>
                                    </h3>

                                    {/* Görev Kartları Alanı */}
                                    <div className="task-container">
                                        {safeTasks
                                            .filter(t => t.status === col.id)
                                            .map((task, index) => {
                                                const isAssigned = task.assignees?.some(id => 
                                                    (typeof id === 'object' ? id._id : id) === currentUserId
                                                );
                                                
                                                return (
                                                    <Draggable key={task._id} draggableId={task._id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`task-card ${snapshot.isDragging ? "is-dragging" : ""} priority-${task.priority?.toLowerCase()}`}
                                                                style={provided.draggableProps.style}
                                                            >
                                                                {/* Kart Üst Bilgisi: Avatarlar ve Yönetim */}
                                                                <div className="task-header">
                                                                    <div className="task-assignees-avatars">
                                                                        {task.assignees?.map((assigneeId) => {
                                                                            const id = typeof assigneeId === 'object' ? assigneeId._id : assigneeId;
                                                                            const name = users[id] || "...";
                                                                            return (
                                                                                <div key={id} className={`mini-avatar ${id === currentUserId ? 'me' : ''}`} title={name}>
                                                                                    {name.charAt(0).toUpperCase()}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        <button 
                                                                            className={`btn-join-task ${isAssigned ? 'leave' : 'join'}`} 
                                                                            onClick={() => onJoin?.(task)}
                                                                        > {isAssigned ? "-" : "+"} </button>
                                                                    </div>
                                                                    <div className="task-actions">
                                                                        <button onClick={() => onEdit?.(task)}>✏️</button>
                                                                        <button onClick={() => onDelete?.(task._id)}>🗑️</button>
                                                                    </div>
                                                                </div>

                                                                {/* Kart İçeriği */}
                                                                <h4 className="task-title">{task.task}</h4>
                                                                {task.description && <p className="task-desc">{task.description}</p>}

                                                                {/* Kart Alt Bilgisi */}
                                                                <div className="task-footer">
                                                                    <span className="task-date">
                                                                        📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString('tr-TR') : '---'}
                                                                    </span>
                                                                    <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                                                                        {task.priority}
                                                                    </span>
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
        </div>
    );
}