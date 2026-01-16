const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// @route   PATCH /api/v1/todos/:id
// @desc    Görevi güncelle (Örn: durum değiştirme)
router.patch('/:id', auth, async (req, res) => {
    try {
        const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!todo) return res.status(404).json({ msg: 'Görev bulunamadı' });
        res.json({ success: true, data: todo });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/v1/todos/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ success: true, msg: 'Görev silindi' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;