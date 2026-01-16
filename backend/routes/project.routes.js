const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Todo = require('../models/Todo');
const User = require('../models/User');

// Middleware'ler
const auth = require('../middleware/auth'); // 'protect' yerine 'auth' kullanıyorsun
const permission = require('../middleware/permission');

// ==========================================
// 1. PROJE OLUŞTURMA & LİSTELEME
// ==========================================

// @route   POST /api/v1/projects
router.post('/', auth, async (req, res, next) => {
    try {
        // Frontend'den gelen 'color' bilgisini de alıyoruz
        const { title, description, category, visibility, color } = req.body;
        
        // Basit validasyon: Title zorunlu
        if (!title) {
            return res.status(400).json({ success: false, msg: 'Lütfen bir proje başlığı girin' });
        }

        const project = await Project.create({
            title,
            description: description || '',
            category: category || 'Genel',
            visibility: visibility || 'private',
            color: color || '#6366f1', // Dashboard'dan gelen renk
            owner: req.user.id,
            customStatuses: [
                { label: "Todo", color: "#808080" },
                { label: "In Progress", color: "#007bff" },
                { label: "Done", color: "#28a745" }
            ]
        });

        res.status(201).json({ success: true, data: project });
    } catch (err) { 
        console.error("Proje Oluşturma Hatası:", err);
        next(err); 
    }
});

// @route   GET /api/v1/projects
router.get('/', auth, async (req, res, next) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user.id },
                { 'collaborators.user': req.user.id },
                { visibility: 'public' }
            ]
        })
        .populate('owner', 'username profile.avatar')
        .sort('-createdAt');

        res.json({ success: true, count: projects.length, data: projects });
    } catch (err) { next(err); }
});

// ==========================================
// 2. PROJE DETAYLARI & GÖREVLER
// ==========================================

// GET /api/v1/projects/:projectId
router.get('/:projectId', auth, permission('read'), async (req, res, next) => {
    try {
        // Eğer permission middleware'i req.project'i setlemiyorsa buradan tekrar bulalım
        let project = req.project;
        
        if (!project) {
            project = await Project.findById(req.params.projectId).populate('owner', 'username');
        }

        if (!project) {
            return res.status(404).json({ success: false, msg: 'Proje bulunamadı' });
        }

        const tasks = await Todo.find({ project: req.params.projectId })
            .populate('assignees', 'username profile.avatar')
            .sort('priority');

        res.json({ 
            success: true, 
            data: project, // Frontend 'data' veya 'project' bekliyor olabilir, ikisini de kapsayalım
            project: project, 
            tasks: tasks 
        });
    } catch (err) { next(err); }
});

// Görev Ekleme
router.post('/:projectId/tasks', auth, permission('write'), async (req, res, next) => {
    try {
        const { task, description, priority, dueDate, assignees } = req.body;

        const newTask = await Todo.create({
            project: req.params.projectId,
            task,
            description,
            priority,
            dueDate,
            assignees,
            createdBy: req.user.id
        });

        res.status(201).json({ success: true, data: newTask });
    } catch (err) { next(err); }
});

// Proje Silme
router.delete('/:projectId', auth, permission('delete'), async (req, res, next) => {
    try {
        await Todo.deleteMany({ project: req.params.projectId });
        await Project.findByIdAndDelete(req.params.projectId);
        res.json({ success: true, msg: 'Proje ve görevler silindi' });
    } catch (err) { next(err); }
});

module.exports = router;