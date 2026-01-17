/**
 * User Router (Kullanıcı İşlemleri)
 * Profil yönetimi, kullanıcı arama ve yetkilendirme detaylarını yönetir.
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth"); // JWT Doğrulama Middleware

/**
 * @route   GET /api/v1/users/search
 * @desc    E-posta veya kullanıcı adına göre filtreleme yapar.
 * @usage   CollaboratorsModal içinde yeni üye davet ederken kullanılır.
 */
router.get("/search", auth, async (req, res, next) => {
    try {
        const query = req.query.q;
        
        // Güvenlik: Arama sonuçlarında isteği atan kullanıcının kendisi gelmez.
        let filter = { _id: { $ne: req.user.id } };

        if (query && query.length >= 2) {
            filter.$or = [
                { email: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } }
            ];
        }

        const users = await User.find(filter)
            .select("username email profile.avatar profile.firstName profile.lastName")
            .limit(20); 

        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/v1/users/me
 * @desc    Giriş yapmış kullanıcının profil ve ayar bilgilerini döner.
 * @usage   AuthContext içindeki checkUser() fonksiyonu için temel noktadır.
 */
router.get("/me", auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/v1/users/:id
 * @desc    Belirli bir kullanıcının kısıtlı bilgilerini getirir.
 * @usage   KanbanBoard'da görev sahiplerinin isimlerini çözmek için kullanılır.
 */
router.get("/:id", auth, async (req, res, next) => {
    try {
        // username artık select içerisinde, böylece avatarlarda isimler görünecek.
        const user = await User.findById(req.params.id).select("username profile.avatar");
        
        if (!user) {
            return res.status(404).json({ success: false, msg: "Kullanıcı bulunamadı" });
        }
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Profil ve tema ayarlarını günceller.
 * @usage   Profile sayfasındaki form gönderildiğinde tetiklenir.
 */
router.put("/profile", auth, async (req, res, next) => {
    try {
        const { firstName, lastName, bio, jobTitle, theme } = req.body;

        // Dinamik güncelleme nesnesi
        const updateFields = {};
        if (firstName !== undefined) updateFields["profile.firstName"] = firstName;
        if (lastName !== undefined) updateFields["profile.lastName"] = lastName;
        if (bio !== undefined) updateFields["profile.bio"] = bio;
        if (jobTitle !== undefined) updateFields["profile.jobTitle"] = jobTitle;
        if (theme !== undefined) updateFields["settings.theme"] = theme;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select("-password");

        res.json({ success: true, data: updatedUser });
    } catch (err) {
        next(err);
    }
});

module.exports = router;