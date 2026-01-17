const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const permission = require('../middleware/permission');

// @route   DELETE /api/v1/todos/:id
router.delete('/:id', auth,  async (req, res) => {
    try {
        const todo = await Todo.findByIdAndDelete(req.params.id);
        
        if (!todo) {
            return res.status(404).json({ success: false, msg: 'Görev bulunamadı.' });
        }

        res.json({ success: true, msg: 'Görev başarıyla silindi' });
    } catch (err) {
        console.error("Silme Hatası:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/v1/todos/:id
router.patch('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true, runValidators: true }
        );

        if (!todo) return res.status(404).json({ success: false, msg: 'Görev bulunamadı' });
        
        res.json({ success: true, data: todo });
    } catch (err) {
        res.status(400).json({ success: false, msg: 'Güncelleme hatası: ' + err.message });
    }
});

module.exports = router;