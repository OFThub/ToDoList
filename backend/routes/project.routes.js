const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Sadece kullanıcının dahil olduğu projeleri getir
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user.id },
                { 'collaborators.user': req.user.id }
            ]
        }).populate('owner', 'username').populate('collaborators.user', 'username');
        res.json(projects);
    } catch (err) {
        res.status(500).send('Hata');
    }
});

// Yeni Proje Oluştur
router.post('/', auth, async (req, res) => {
    const project = new Project({ title: req.body.title, owner: req.user.id });
    await project.save();
    res.json(project);
});

// PROJEYE KULLANICI VE YETKİ EKLE (Sadece Sahibi Yapabilir)
router.post('/:id/collaborators', auth, async (req, res) => {
    const project = await Project.findById(req.params.id);
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Yetkiniz yok' });

    const { userId, canWrite, canDelete } = req.body;
    project.collaborators.push({ user: userId, permissions: { canWrite, canDelete } });
    await project.save();
    res.json(project);
});

// TODO EKLE (Yetki: Sahibi veya canWrite: true olanlar)
router.post('/:id/todos', auth, async (req, res) => {
    const project = await Project.findById(req.params.id);
    const collab = project.collaborators.find(c => c.user.toString() === req.user.id);
    const hasWriteAuth = project.owner.toString() === req.user.id || (collab && collab.permissions.canWrite);

    if (!hasWriteAuth) return res.status(403).json({ msg: 'Yazma yetkiniz yok' });

    project.todos.push({ task: req.body.task });
    await project.save();
    res.json(project);
});

// TODO SİL (Yetki: Sahibi veya canDelete: true olanlar)
router.delete('/:projectId/todos/:todoId', auth, async (req, res) => {
    const project = await Project.findById(req.params.projectId);
    const collab = project.collaborators.find(c => c.user.toString() === req.user.id);
    const hasDeleteAuth = project.owner.toString() === req.user.id || (collab && collab.permissions.canDelete);

    if (!hasDeleteAuth) return res.status(403).json({ msg: 'Silme yetkiniz yok' });

    project.todos = project.todos.filter(t => t._id.toString() !== req.params.todoId);
    await project.save();
    res.json({ msg: 'Todo silindi' });
});

module.exports = router;