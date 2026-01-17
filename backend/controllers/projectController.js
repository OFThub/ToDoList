/**
 * @file projectController.js
 * @description Proje oluşturma, listeleme ve katılımcı yönetimi mantığını içerir.
 */

const Project = require('../models/Project');
const User = require('../models/User'); // addCollaborator için gerekli

/**
 * @route   POST /api/v1/projects
 * @desc    Yeni bir proje oluşturur
 * @access  Private
 */
exports.createProject = async (req, res) => {
  try {
    const { title, description, category, color } = req.body;

    // Yetki Kontrolü: Protect middleware'inden gelen kullanıcı verisi
    if (!req.user) {
      return res.status(401).json({ success: false, msg: "Yetkisiz erişim. Lütfen giriş yapın." });
    }

    // Yeni projeyi oluştur
    const project = await Project.create({
      title,
      description,
      category: category || 'Genel',
      color: color || '#6366f1',
      user: req.user.id // Projeyi oluşturan (Owner)
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.error("Proje oluşturma hatası:", err);
    res.status(400).json({
      success: false,
      msg: err.message
    });
  }
};

/**
 * @route   GET /api/v1/projects
 * @desc    Giriş yapan kullanıcının projelerini tarihe göre azalan sırada getirir
 * @access  Private
 */
exports.getProjects = async (req, res) => {
  try {
    // Sadece mevcut kullanıcıya ait projeleri getir
    const projects = await Project.find({ user: req.user.id }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (err) {
    console.error("Projeleri getirme hatası:", err);
    res.status(400).json({ 
      success: false, 
      msg: "Projeler listeniz yüklenemedi." 
    });
  }
};

/**
 * @route   POST /api/v1/projects/:projectId/collaborators
 * @desc    Projeye e-posta adresi üzerinden katılımcı ekler
 * @access  Private (Sadece proje sahibi yapabilmeli)
 */
exports.addCollaborator = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;

    // 1. Kullanıcıyı sistemde ara
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ success: false, msg: "Sistemde bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı." });
    }

    // 2. Projeyi bul
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, msg: "Proje bulunamadı." });
    }

    // 3. Mükerrer kayıt kontrolü (Zaten ekli mi?)
    const isAlreadyAdded = project.collaborators.some(
      c => c.user.toString() === userToAdd._id.toString()
    );
    
    if (isAlreadyAdded) {
      return res.status(400).json({ success: false, msg: "Kullanıcı zaten bu projenin katılımcısı." });
    }

    // 4. Katılımcıyı listeye ekle ve kaydet
    project.collaborators.push({ 
      user: userToAdd._id, 
      role: role || "viewer" 
    });
    
    await project.save();

    res.status(200).json({ 
      success: true, 
      msg: "Katılımcı başarıyla eklendi.", 
      user: {
        id: userToAdd._id,
        username: userToAdd.username,
        email: userToAdd.email
      }
    });
  } catch (err) {
    console.error("Katılımcı ekleme hatası:", err);
    res.status(500).json({ success: false, msg: "Sunucu tarafında bir hata oluştu." });
  }
};