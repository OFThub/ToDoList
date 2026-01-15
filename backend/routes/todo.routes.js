const express = require("express");
const auth = require("../middleware/auth");
const permission = require("../middleware/permission");
const Project = require("../models/Project"); // Sadece Project modelini çekiyoruz
const router = express.Router();

// Yeni To-Do Oluşturma (Project içindeki diziye ekler)
router.post("/:projectId", auth, permission("write"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ msg: "Proje bulunamadı" });

    // Yeni todo objesini oluştur (Model değil, obje olarak)
    const newTodo = {
      task: req.body.task,
      user: req.user.id,
      status: "todo",
      assignees: []
    };

    // Projenin içindeki todos dizisine ekle
    project.todos.push(newTodo);
    await project.save();

    // Socket.io ile güncelleme bildir
    if (req.io) req.io.to(req.params.projectId).emit("todo_updated");

    // Eklenen son todoyu (ID'si oluşmuş haliyle) döndür
    const addedTodo = project.todos[project.todos.length - 1];
    res.status(201).json(addedTodo);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// To-Do'yu üstlenme (Katılımcı olma)
router.post("/:projectId/:todoId/assign", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ msg: "Proje bulunamadı" });

    const todo = project.todos.id(req.params.todoId);
    if (!todo) return res.status(404).json({ msg: "Görev bulunamadı" });

    // Katılımcı ekleme/çıkarma mantığı
    const index = todo.assignees.indexOf(req.user.id);
    if (index > -1) {
      todo.assignees.splice(index, 1);
    } else {
      todo.assignees.push(req.user.id);
    }

    // ÖNEMLİ: Mevcut statüyü koruduğumuzdan emin olalım
    // (Zaten todo.status içinde o anki değer duruyor)
    
    await project.save();
    
    // Populate işlemi kullanıcı isimlerini görmek içindir
    // execPopulate() veya güncel yöntemle doldurup sadece todoyu dönelim
    const updatedProject = await Project.findById(project._id).populate("todos.assignees", "username");
    const updatedTodo = updatedProject.todos.id(req.params.todoId);

    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PROJE ADINI DEĞİŞTİR
router.patch("/:projectId/:todoId/rename", auth, permission("write"), async (req, res) => {
  try {
    const { newTask } = req.body;
    if (!newTask) return res.status(400).json({ msg: "Yeni görev adı gerekli" });

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ msg: "Proje bulunamadı" });

    const todo = project.todos.id(req.params.todoId);
    if (!todo) return res.status(404).json({ msg: "Görev bulunamadı" });

    todo.task = newTask; // Görev adını güncelle
    await project.save();

    // Güncel todoyu döndür (Populate ederek kullanıcı isimlerini koruyun)
    const updatedProject = await Project.findById(project._id).populate("todos.assignees", "username");
    res.json(updatedProject.todos.id(req.params.todoId));
  } catch (err) {
    res.status(500).json({ msg: "Sunucu hatası" });
  }
});

router.patch("/:projectId/:todoId", auth, permission("write"), async (req, res) => {
  try {
    const { status, task, group } = req.body;
    const project = req.project;
    const todo = project.todos.id(req.params.todoId);
    if (!todo) return res.status(404).json({ msg: "Görev bulunamadı" });

    // Gelen alanları güncelle
    if (status) todo.status = status;
    if (task) todo.task = task;
    if (group) todo.group = group;

    await project.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ msg: "Güncelleme hatası" });
  }
});

// TODO SİLME - Belirli bir projenin içindeki todoyu siler
router.delete('/:projectId/:todoId', auth, permission("delete"), async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return res.status(404).json({ msg: 'Proje bulunamadı' });

        // Mongoose pull metodu ile diziden ilgili ID'li todoyu çıkarıyoruz
        project.todos.pull({ _id: req.params.todoId });
        await project.save();

        // Socket.io ile güncelleme yayınla
        if (req.io) req.io.to(req.params.projectId).emit("todo_updated");

        res.json({ msg: "Görev başarıyla silindi", todoId: req.params.todoId });
    } catch (err) {
        console.error("Backend Silme Hatası:", err);
        res.status(500).json({ msg: 'Silme sırasında sunucu hatası' });
    }
});

module.exports = router;