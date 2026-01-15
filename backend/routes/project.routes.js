const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const permission = require('../middleware/permission');

//////////////////////////////////////////

//  CREATE

//////////////////////////////////////////

// Yeni Proje Oluştur
router.post('/', auth, async (req, res) => {
    const project = new Project({ title: req.body.title, owner: req.user.id });
    await project.save();
    res.json(project);
});

/////////////////////

// PROJEYE KULLANICI VE YETKİ EKLE
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Proje bulunamadı' });

    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Yetkiniz yok' });
    }

    const { email, canWrite, canDelete } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'Bu mail ile kullanıcı bulunamadı' });
    }

    if (user._id.toString() === project.owner.toString()) {
      return res.status(400).json({ msg: 'Proje sahibi zaten ekli' });
    }

    const alreadyAdded = project.collaborators.some(
      c => c.user?.toString() === user._id.toString()
    );
    if (alreadyAdded) {
      return res.status(400).json({ msg: 'Kullanıcı zaten katılımcı' });
    }

    project.collaborators.push({
    user: user._id,
    permissions: {
        canWrite: Boolean(canWrite),
        canDelete: Boolean(canDelete)
    }
    });

    await project.save();

    const updatedProject = await Project.findById(project._id)
    .populate('owner', 'username email')
    .populate('collaborators.user', 'username email');

    res.json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Sunucu hatası' });
  }
});

/////////////////////

router.post("/:projectId/groups", auth, permission("write"), async (req, res) => {
  try {
    const { groupName } = req.body;
    const project = await Project.findById(req.params.projectId);
    
    if (project.groups.includes(groupName)) {
      return res.status(400).json({ msg: "Bu grup zaten mevcut" });
    }

    project.groups.push(groupName);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).send("Sunucu hatası");
  }
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

//////////////////////////////////////////

//  READ

//////////////////////////////////////////

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

//////////////////////////////////////////

//  UPDATE

//////////////////////////////////////////

// PROJE ADINI GÜNCELLE (RENAME)
router.patch('/:id/rename', auth, async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ msg: 'Başlık gerekli' });

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Proje bulunamadı' });

        // Yetki kontrolü
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Sadece sahip isim değiştirebilir' });
        }

        project.title = title;
        await project.save();

        const updatedProject = await Project.findById(project._id)
            .populate('owner', 'username')
            .populate('collaborators.user', 'username');

        res.json(updatedProject);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Sunucu hatası' });
    }
});

//////////////////////////////////////////

//  DELETE

//////////////////////////////////////////

// TODO SİL (Yetki: Sahibi veya canDelete: true olanlar)
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) return res.status(404).json({ msg: 'Proje bulunamadı' });

        // Güvenlik: Sadece proje sahibi silebilir
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Bu projeyi silme yetkiniz yok (Sadece sahip silebilir)' });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Proje başarıyla silindi' });
    } catch (err) {
        res.status(500).send('Sunucu hatası');
    }
});

//////////////////////////////////////////

module.exports = router;