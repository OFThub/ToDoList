const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Todo = require('../models/Todo');

// Middleware
const auth = require('../middleware/auth');
const permission = require('../middleware/permission');


// ==========================================
// 1. PROJE OLUŞTURMA
// ==========================================

// POST /api/v1/projects
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, description, category, visibility, color } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, msg: 'Proje başlığı zorunludur' });
    }

    const project = await Project.create({
      title,
      description: description || '',
      category: category || 'Genel',
      visibility: visibility || 'private',
      color: color || '#6366f1',
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


// ==========================================
// 2. PROJE LİSTELEME
// ==========================================

// GET /api/v1/projects
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
  } catch (err) {
    next(err);
  }
});


// ==========================================
// 3. PROJE DETAY + GÖREVLER (🔥 EN KRİTİK KISIM)
// ==========================================

router.get('/:projectId', auth, permission('read'), async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.projectId)
      .populate('owner', 'username')
      .populate('tasks');

    if (!project) {
      return res.status(404).json({ success: false, msg: 'Proje bulunamadı' });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    console.error(err);
    next(err);
  }
});



// ==========================================
// 4. GÖREV EKLEME
// ==========================================

// POST /api/v1/projects/:projectId/tasks
router.post('/:projectId/tasks', auth, permission('write'), async (req, res, next) => {
  try {
    const { task, description, priority, dueDate, assignees } = req.body;

    if (!task) {
      return res.status(400).json({ success: false, msg: 'Görev içeriği zorunludur' });
    }

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
  } catch (err) {
    next(err);
  }
});


// ==========================================
// 5. PROJE SİLME
// ==========================================

// DELETE /api/v1/projects/:projectId
router.delete('/:projectId', auth, permission('delete'), async (req, res, next) => {
  try {
    await Todo.deleteMany({ project: req.params.projectId });
    await Project.findByIdAndDelete(req.params.projectId);

    res.json({ success: true, msg: 'Proje ve görevler silindi' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
