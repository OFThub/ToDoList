import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api/axios";
import { toast } from "react-hot-toast";

// Varsayılan sütunlar
const DEFAULT_COLUMNS = [
    { id: "Yapılacak", title: "Yapılacak", color: "#ef4444" },
    { id: "Devam Ediyor", title: "Devam Ediyor", color: "#f59e0b" },
    { id: "Tamamlandı", title: "Tamamlandı", color: "#10b981" }
];

/**
 * useKanbanBoard Hook
 * Kanban board'un tüm state ve fonksiyonlarını yönetir
 * @param {Array} tasks - Görevler dizisi
 * @param {Function} updateTaskStatus - Görev statusunu güncelleme fonksiyonu
 * @param {String} currentUserId - Mevcut kullanıcının ID'si
 * @param {String} projectId - Proje ID'si
 * @param {Array} initialStatuses - Başlangıç custom statüleri
 * @param {Function} onProjectUpdate - Parent bileşendeki project state'ini güncelleyen fonksiyon
 */
export const useKanbanBoard = (
    tasks, 
    updateTaskStatus, 
    currentUserId, 
    projectId, 
    initialStatuses = [],
    onProjectUpdate
) => {
    const [columns, setColumns] = useState([]);
    const [users, setUsers] = useState({});
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [expandedTasks, setExpandedTasks] = useState(new Set());
    const [isLoadingColumn, setIsLoadingColumn] = useState(false);

    // Proje statüleri değiştikçe sütunları güncelle
    useEffect(() => {
        if (initialStatuses && Array.isArray(initialStatuses) && initialStatuses.length > 0) {
            try {
                const formattedColumns = initialStatuses.map(s => {
                    if (typeof s === 'string') {
                        return { id: s, title: s, color: "#6366f1" };
                    }
                    return {
                        id: s.label || s.id || s,
                        title: s.label || s.title || s,
                        color: s.color || "#6366f1"
                    };
                });
                setColumns(formattedColumns);
            } catch (err) {
                console.error("Sütun formatlama hatası:", err);
                setColumns(DEFAULT_COLUMNS);
            }
        } else {
            setColumns(DEFAULT_COLUMNS);
        }
    }, [initialStatuses]);

    const safeTasks = useMemo(() => {
        if (!Array.isArray(tasks)) return [];
        return tasks.filter(t => t && typeof t === 'object' && t._id);
    }, [tasks]);

    // --- Dinamik Sütun İşlemleri (Backend Senkronizasyonu) ---
    
    /**
     * Yeni sütun/statü ekler (Optimistik Güncelleme)
     */
    const addColumn = useCallback(async () => {
        const trimmedTitle = newColumnTitle?.trim();
        
        if (!trimmedTitle) {
            toast.error("Sütun adı boş olamaz.");
            return;
        }

        if (!projectId) {
            toast.error("Proje ID'si bulunamadı.");
            return;
        }

        setIsLoadingColumn(true);

        // Optimistik güncelleme: hemen UI'ı güncelle
        const newCol = { id: trimmedTitle, title: trimmedTitle, color: "#6366f1" };
        const previousColumns = columns;
        setColumns(prev => [...prev, newCol]);
        setNewColumnTitle("");

        try {
            const newStatus = { 
                label: trimmedTitle, 
                color: "#6366f1" 
            };
            const updatedStatuses = [...(initialStatuses || []), newStatus];

            console.log("📤 Gönderilen statüler:", updatedStatuses);

            const res = await api.patch(`/projects/${projectId}`, {
                customStatuses: updatedStatuses
            });

            console.log("📥 API Yanıtı:", res.data);

            // Response'tan gerçek proje datasını al
            // Backend'de { success: true, data: project } şeklinde döner
            const projectData = res.data?.data || res.data;
            
            if (projectData && projectData.customStatuses && Array.isArray(projectData.customStatuses)) {
                // Parent bileşendeki project state'ini güncelle
                if (onProjectUpdate && typeof onProjectUpdate === 'function') {
                    onProjectUpdate(projectData); 
                }
                
                // Yerel sütunları backend yanıtıyla güncelle
                const formatted = projectData.customStatuses.map(s => {
                    if (typeof s === 'string') {
                        return { id: s, title: s, color: "#6366f1" };
                    }
                    return {
                        id: s.label || s.id || s,
                        title: s.label || s.title || s,
                        color: s.color || "#6366f1"
                    };
                });
                
                console.log("✅ Backend sütunları alındı:", formatted);
                setColumns(formatted);
                toast.success("Sütun eklendi!");
            } else {
                console.warn("⚠️ Response'ta customStatuses bulunamadı:", projectData);
                // Optimistik güncelleme zaten yapıldı, ama toast ver
                toast.success("Sütun eklendi!");
            }
        } catch (err) {
            console.error("Sütun ekleme hatası:", err);
            // Hata durumunda optimistik güncellemeleri geri al
            setColumns(previousColumns);
            setNewColumnTitle(trimmedTitle);
            toast.error(err.response?.data?.msg || "Sütun eklenemedi.");
        } finally {
            setIsLoadingColumn(false);
        }
    }, [newColumnTitle, projectId, initialStatuses, onProjectUpdate, columns]);

    /**
     * Sütunu/statüyü siler (Optimistik Güncelleme)
     */
    const removeColumn = useCallback(async (columnId) => {
        if (!columnId) {
            toast.error("Sütun ID'si geçersiz");
            return;
        }

        if (!window.confirm(`"${columnId}" sütununu silmek istediğinize emin misiniz?`)) {
            return;
        }

        setIsLoadingColumn(true);

        // Optimistik güncelleme: hemen UI'ı güncelle
        const previousColumns = columns;
        setColumns(prev => prev.filter(col => col.id !== columnId));

        try {
            const updatedStatuses = (initialStatuses || []).filter(col => {
                const colLabel = typeof col === 'string' ? col : (col.label || col.id || col);
                return colLabel !== columnId;
            });
            
            console.log("📤 Silme işlemi - Gönderilen statüler:", updatedStatuses);

            const res = await api.patch(`/projects/${projectId}`, {
                customStatuses: updatedStatuses
            });

            console.log("📥 Silme işlemi - API Yanıtı:", res.data);
            
            // Response'tan gerçek proje datasını al
            const projectData = res.data?.data || res.data;
            
            if (projectData && projectData.customStatuses) {
                // Parent'ı bilgilendir
                if (onProjectUpdate && typeof onProjectUpdate === 'function') {
                    onProjectUpdate(projectData);
                }
                
                // Yerel state'i backend yanıtıyla güncelle
                const formatted = projectData.customStatuses.map(s => {
                    if (typeof s === 'string') {
                        return { id: s, title: s, color: "#6366f1" };
                    }
                    return {
                        id: s.label || s.id || s,
                        title: s.label || s.title || s,
                        color: s.color || "#6366f1"
                    };
                });
                
                console.log("✅ Backend sütunları alındı:", formatted);
                setColumns(formatted);
            } else {
                console.warn("⚠️ Response'ta customStatuses bulunamadı, optimistik güncelleme kullanılıyor");
                // Optimistik güncelleme zaten yapıldı, devam et
            }
            
            toast.success("Sütun silindi!");
        } catch (err) {
            console.error("Sütun silme hatası:", err);
            // Hata durumunda optimistik güncellemeleri geri al
            setColumns(previousColumns);
            toast.error(err.response?.data?.msg || "Sütun silinemedi.");
        } finally {
            setIsLoadingColumn(false);
        }
    }, [projectId, initialStatuses, onProjectUpdate, columns]);

    // --- Kullanıcı Bilgileri Caching ---
    
    /**
     * Kullanıcı bilgisini API'den çekerek cache'e kaydeder
     */
    const fetchUserData = useCallback(async (userId) => {
        if (!userId || users[userId]) return;
        
        try {
            const res = await api.get(`/users/${userId}`);
            if (res.data && res.data.username) {
                setUsers(prev => ({ ...prev, [userId]: res.data.username }));
            } else {
                setUsers(prev => ({ ...prev, [userId]: "Bilinmiyor" }));
            }
        } catch (err) {
            console.error(`Kullanıcı (${userId}) bilgisi alınamadı:`, err);
            setUsers(prev => ({ ...prev, [userId]: "Bilinmiyor" }));
        }
    }, [users]);

    useEffect(() => {
        const idsToFetch = new Set();
        
        safeTasks.forEach(task => {
            if (task.createdBy && typeof task.createdBy === 'string') {
                idsToFetch.add(task.createdBy);
            }
            if (Array.isArray(task.assignees)) {
                task.assignees.forEach(idOrObj => {
                    const id = typeof idOrObj === 'object' ? idOrObj._id : idOrObj;
                    if (id && typeof id === 'string') {
                        idsToFetch.add(id);
                    }
                });
            }
        });
        
        idsToFetch.forEach(id => fetchUserData(id));
    }, [safeTasks, fetchUserData]);

    // --- Görev Mantığı ---
    
    /**
     * Parent görevin alt görevlerini döndürür
     */
    const getSubTasks = useCallback((parentId) => {
        if (!parentId) return [];
        return safeTasks.filter(t => t && t.parentTask === parentId);
    }, [safeTasks]);

    /**
     * Alt görevlerin açılıp kapanmasını kontrol eder
     */
    const toggleSubTasks = useCallback((taskId) => {
        if (!taskId) return;
        
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    }, []);

    /**
     * Drag and drop sonu işlemleri
     */
    const onDragEnd = useCallback((result) => {
        const { destination, source, draggableId } = result;

        // Geçersiz drop
        if (!destination) return;

        // Aynı yere drop edildi
        if (
            destination.droppableId === source.droppableId && 
            destination.index === source.index
        ) {
            return;
        }

        // Yeni statüyü backend'e gönder
        if (updateTaskStatus && typeof updateTaskStatus === 'function' && draggableId) {
            updateTaskStatus(draggableId, destination.droppableId);
        }
    }, [updateTaskStatus]);

    return {
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
        fetchUserData,
    };
};