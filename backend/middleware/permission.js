const Project = require("../models/Project");
const Todo = require("../models/Todo");

/**
 * Gelişmiş Yetki Kontrolü
 * Hem Proje hem de bağımsız Todo (Görev) bazlı yetkiyi denetler.
 */
module.exports = (requiredPermission) => async (req, res, next) => {
    try {
        const { projectId, todoId } = req.params;
        const userId = req.user?.id;
        let targetProjectId = projectId;

        // 1. ADIM: Eğer istek bir Todo (Görev) üzerinden geliyorsa, önce o görevin projesini bul
        if (todoId) {
            const todo = await Todo.findById(todoId);
            if (!todo) {
                return res.status(404).json({ success: false, msg: "Görev bulunamadı." });
            }
            targetProjectId = todo.project; // Görevin bağlı olduğu proje ID'sini al
            req.todo = todo; // Controller'da tekrar veritabanına gitmemek için todo'yu req'e ekle
        }

        if (!targetProjectId) {
            return res.status(400).json({ success: false, msg: "Proje veya Görev ID'si gerekli." });
        }

        // 2. ADIM: Projeyi getir
        const project = await Project.findById(targetProjectId);
        if (!project) {
            return res.status(404).json({ success: false, msg: "İlgili proje bulunamadı." });
        }
        req.project = project;

        // 3. ADIM: Yetki Kontrolü (Hiyerarşik)
        
        // A. Proje Sahibi ise her şeye izni var
        if (project.owner.toString() === userId) {
            req.userProjectRole = "owner";
            return next();
        }

        // B. Ortak Çalışan Kontrolü
        const collaborator = project.collaborators.find(
            (c) => c.user && c.user.toString() === userId
        );

        // C. Görünürlük Kontrolü (Public Projeler)
        if (!collaborator) {
            if (project.visibility === 'public' && requiredPermission === 'read') {
                req.userProjectRole = "viewer";
                return next();
            }
            return res.status(403).json({ success: false, msg: "Bu projeye erişim yetkiniz yok." });
        }

        // 4. ADIM: Rol Bazlı İzinler
        const userRole = collaborator.role;
        const permissionMap = {
            'read': ['viewer', 'editor', 'admin'],
            'write': ['editor', 'admin'],
            'delete': ['admin'],
            'manage_members': ['admin']
        };

        if (!permissionMap[requiredPermission].includes(userRole)) {
            return res.status(403).json({ 
                success: false, 
                msg: `Bu işlem için '${requiredPermission}' yetkisi gerekiyor. Mevcut rolünüz: ${userRole}` 
            });
        }

        req.userProjectRole = userRole;
        next();

    } catch (err) {
        console.error("Permission Middleware Error:", err);
        res.status(500).json({ success: false, msg: "Yetki kontrolü hatası." });
    }
};