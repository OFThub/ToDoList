const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
// Not: permission middleware'ini projenin yetki seviyesine göre (admin/editor) kullanabilirsiniz.

/**
 * @route   PATCH /api/v1/todos/:id
 * @desc    Görevi günceller (Statü değişikliği, katılımcı atama vb.)
 */
router.patch('/:id', auth, async (req, res) => {
    try {
        // Body içerisinden sadece izin verilen alanları destruct ediyoruz
        const { assignees, task, status, priority, dueDate, description } = req.body;
        
        const updatedFields = {};
        if (assignees !== undefined) updatedFields.assignees = assignees;
        if (task) updatedFields.task = task;
        if (status) updatedFields.status = status;
        if (priority) updatedFields.priority = priority;
        if (dueDate) updatedFields.dueDate = dueDate;
        if (description !== undefined) updatedFields.description = description;

        // findByIdAndUpdate yerine findById kullanmak, doküman üzerinde manuel kontrol sağlar
        // Ancak performans için findByIdAndUpdate + new:true en yaygın yöntemdir.
        const todo = await Todo.findByIdAndUpdate(
            req.params.id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        ).populate('assignees', 'username profile.avatar');

        if (!todo) {
            return res.status(404).json({ success: false, msg: 'Görev bulunamadı.' });
        }
        
        res.json({ success: true, data: todo });
    } catch (err) {
        console.error("Güncelleme Hatası:", err.message);
        res.status(400).json({ success: false, msg: "Güncelleme başarısız: " + err.message });
    }
});

/**
 * @route   DELETE /api/v1/todos/:id
 * @desc    Görevi siler
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        // Güvenlik Notu: Silme işleminden önce görevin projeye ait olup olmadığını 
        // veya silen kişinin yetkisini kontrol etmek iyi bir pratiktir.
        const todo = await Todo.findByIdAndDelete(req.params.id);
        
        if (!todo) {
            return res.status(404).json({ success: false, msg: 'Görev bulunamadı.' });
        }

        res.json({ success: true, msg: 'Görev başarıyla silindi' });
    } catch (err) {
        console.error("Silme Hatası:", err.message);
        res.status(500).json({ success: false, msg: 'Sunucu hatası oluştu.' });
    }
});

module.exports = router;