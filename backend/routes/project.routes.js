/**
 * @file projects.js
 * @description Proje yönetimi, katılımcı kontrolü ve proje bazlı görev işlemlerini yürüten Express router dosyası.
 * @route /api/v1/projects
 */

const express = require('express');
const router = express.Router();

// Modeller
const Project = require('../models/Project');
const Todo = require('../models/Todo');
const User = require('../models/User');

// Middleware
const auth = require('../middleware/auth');
const permission = require('../middleware/permission');

// ---------------------------------------------------------
// PROJE TEMEL İŞLEMLERİ
// ---------------------------------------------------------

/**
 * @route   POST /api/v1/projects
 * @desc    Yeni bir proje oluşturur
 * @access  Private (Giriş yapmış kullanıcı)
 */
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

/**
 * @route   GET /api/v1/projects
 * @desc    Kullanıcının sahibi olduğu, ortağı olduğu veya herkese açık projeleri listeler
 * @access  Private
 */
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

/**
 * @route   GET /api/v1/projects/:projectId
 * @desc    ID'ye göre proje detayını, görevlerini ve katılımcılarını getirir
 * @access  Private + Permission (Read)
 */
router.get('/:projectId', auth, permission('read'), async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.projectId)
      .populate('owner', 'username')
      .populate({
        path: 'tasks',
        select: 'task description status priority dueDate startDate assignees progress parentTask createdBy'
      })
      .populate('collaborators.user', 'username profile.avatar');

    if (!project) {
      return res.status(404).json({ success: false, msg: 'Proje bulunamadı' });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    console.error("Proje Detay Hatası:", err);
    next(err);
  }
});

/**
 * @route   PATCH /api/v1/projects/:projectId
 * @desc    Proje bilgilerini ve custom statüleri günceller
 * @access  Private + Permission (Admin)
 */
router.patch('/:projectId', auth, permission('admin'), async (req, res, next) => {
  try {
    const { customStatuses, title, description, category, color, visibility } = req.body;
    console.log("Gelen Body:", req.body);

    // Güncellenebilir alanları belirle
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (color !== undefined) updates.color = color;
    if (visibility !== undefined) updates.visibility = visibility;
    
    // Custom statüleri güncelle (varsa)
    if (customStatuses && Array.isArray(customStatuses)) {
      // Statü validasyonu
      if (customStatuses.length === 0) {
        return res.status(400).json({ 
          success: false, 
          msg: 'En az bir durum olmalı' 
        });
      }
      updates.customStatuses = customStatuses.map(s => ({
        label: s.label || s,
        color: s.color || '#6366f1'
      }));
    }
    console.log("Güncellenen Alanlar:", updates);
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('owner', 'username').populate('collaborators.user', 'username');

    if (!project) {
      return res.status(404).json({ success: false, msg: 'Proje bulunamadı' });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    console.error("Proje Güncelleme Hatası:", err);
    next(err);
  }
});

// ---------------------------------------------------------
// KATILIMCI (COLLABORATOR) YÖNETİMİ
// ---------------------------------------------------------

/**
 * @route   POST /api/v1/projects/:projectId/collaborators
 * @desc    Projeye e-posta ile yeni bir katılımcı ekler
 * @access  Private + Permission (Admin)
 */
router.post('/:projectId/collaborators', auth, permission('admin'), async (req, res) => {
  try {
    const { email, role } = req.body;
    const { projectId } = req.params;

    // Kullanıcı kontrolü
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, msg: "Bu e-posta adresine sahip kullanıcı bulunamadı." });
    }

    // Proje kontrolü
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, msg: "Proje bulunamadı." });
    }

    // Çift kayıt kontrolü
    const isAlreadyMember = project.collaborators.some(
      c => c.user.toString() === userToAdd._id.toString() || 
           project.owner.toString() === userToAdd._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ success: false, msg: "Kullanıcı zaten bu projede yer alıyor." });
    }

    project.collaborators.push({
      user: userToAdd._id,
      role: role || 'viewer'
    });

    await project.save();
    
    // Güncellenmiş projeyi döndür
    const updatedProject = await project.populate('collaborators.user', 'username profile.avatar');
    
    res.status(200).json({ 
      success: true, 
      msg: "Katılımcı başarıyla eklendi.",
      data: updatedProject 
    });
  } catch (err) {
    console.error("Katılımcı Ekleme Hatası:", err);
    res.status(500).json({ success: false, msg: "Sunucu hatası." });
  }
});

/**
 * @route   DELETE /api/v1/projects/:projectId/collaborators/:userId
 * @desc    Katılımcıyı projeden çıkarır ve atandığı tüm görevlerden temizler
 * @access  Private + Permission (Admin)
 */
router.delete('/:projectId/collaborators/:userId', auth, permission('admin'), async (req, res) => {
  try {
    const { projectId, userId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, msg: "Proje bulunamadı." });
    }

    // Katılımcı dizisinden filtrele
    project.collaborators = project.collaborators.filter(
      c => c.user.toString() !== userId
    );
    await project.save();

    // Veri Tutarlılığı: Görevlerdeki atamalar temizle
    await Todo.updateMany(
      { project: projectId, assignees: userId },
      { $pull: { assignees: userId } }
    );

    res.status(200).json({ 
      success: true, 
      msg: "Katılımcı projeden ve ilgili tüm görevlerden çıkarıldı.",
      data: project 
    });
  } catch (err) {
    console.error("Katılımcı Silme Hatası:", err);
    res.status(500).json({ success: false, msg: "Sunucu hatası." });
  }
});

// ---------------------------------------------------------
// GÖREV (TASK) İŞLEMLERİ
// ---------------------------------------------------------

/**
 * @route   POST /api/v1/projects/:projectId/tasks
 * @desc    Projeye bağlı yeni bir görev oluşturur
 * @access  Private + Permission (Write)
 */
router.post('/:projectId/tasks', auth, permission('write'), async (req, res, next) => {
  try {
    const { 
      task, 
      description, 
      priority, 
      dueDate, 
      startDate, 
      assignees, 
      tags, 
      parentTask, 
      status,
      progress
    } = req.body;

    if (!task) {
      return res.status(400).json({ success: false, msg: 'Görev içeriği zorunludur' });
    }

    // Proje kontrol et
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, msg: 'Proje bulunamadı' });
    }

    // Status validasyonu
    const validStatus = status && project.customStatuses.some(s => s.label === status)
      ? status
      : project.customStatuses[0]?.label || 'Todo';

    const newTask = await Todo.create({
      project: req.params.projectId,
      task,
      description: description || '',
      priority: priority || 'Medium',
      dueDate,
      startDate,
      assignees: assignees || [],
      tags: tags || [],
      parentTask: parentTask || null,
      status: validStatus,
      progress: progress || 0,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: newTask });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/v1/projects/:projectId/tasks/:taskId
 * @desc    Görevi günceller
 * @access  Private + Permission (Write)
 */
router.put('/:projectId/tasks/:taskId', auth, permission('write'), async (req, res, next) => {
  try {
    const task = await Todo.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, msg: 'Görev bulunamadı' });
    }

    // Status değişirse validasyon yap
    if (req.body.status) {
      const project = await Project.findById(req.params.projectId);
      const statusExists = project.customStatuses.some(s => s.label === req.body.status);
      if (!statusExists) {
        return res.status(400).json({ success: false, msg: 'Geçersiz durum' });
      }
    }

    const updatedTask = await Todo.findByIdAndUpdate(
      req.params.taskId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updatedTask });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/v1/projects/:projectId/tasks/:taskId
 * @desc    Görevi siler (alt görevler de silinir)
 * @access  Private + Permission (Write)
 */
router.delete('/:projectId/tasks/:taskId', auth, permission('write'), async (req, res, next) => {
  try {
    const task = await Todo.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, msg: 'Görev bulunamadı' });
    }

    // Alt görevleri sil
    await Todo.deleteMany({ parentTask: req.params.taskId });
    
    // Görevi sil
    await Todo.findByIdAndDelete(req.params.taskId);

    res.json({ success: true, msg: 'Görev silindi' });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /api/v1/projects/:projectId
 * @desc    Projeyi ve projeye ait tüm görevleri siler
 * @access  Private + Permission (Delete)
 */
router.delete('/:projectId', auth, permission('delete'), async (req, res, next) => {
  try {
    // Projeye ait tüm görevleri sil
    await Todo.deleteMany({ project: req.params.projectId });
    
    // Projeyi sil
    await Project.findByIdAndDelete(req.params.projectId);

    res.json({ success: true, msg: 'Proje ve görevler silindi' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;