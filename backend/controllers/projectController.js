// controllers/projectController.js
const Project = require('../models/Project'); // Model ismini kontrol et

exports.createProject = async (req, res) => {
  try {
    // Frontend'den gelen verileri alıyoruz
    const { title, description, category, color } = req.body;

    // Kullanıcı giriş yapmış mı kontrolü (Protect middleware'inden gelir)
    if (!req.user) {
      return res.status(401).json({ success: false, msg: "Yetkisiz erişim" });
    }

    // Yeni projeyi oluştur ve kullanıcıya bağla
    const project = await Project.create({
      title,
      description,
      category: category || 'Genel',
      color: color || '#6366f1',
      user: req.user.id // Projeyi oluşturan kişinin ID'si
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      msg: err.message
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    // Sadece giriş yapan kullanıcının projelerini getir
    const projects = await Project.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (err) {
    res.status(400).json({ success: false, msg: "Projeler getirilemedi" });
  }
};