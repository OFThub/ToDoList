const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

/**
 * @route   GET /api/v1/users/search
 * @desc    Kullanıcıları e-posta veya kullanıcı adına göre ara (Projeye ortak eklemek için)
 */
router.get("/search", auth, async (req, res, next) => {
    try {
        const query = req.query.q;
        
        // Boş arama yapılmasını engelle
        if (!query || query.length < 2) {
            return res.status(400).json({ success: false, msg: "Lütfen en az 2 karakter giriniz." });
        }

        // Arama kriterleri:
        // 1. Kendisi hariç ($ne: req.user.id)
        // 2. Email veya Username içinde geçen kelime (case-insensitive regex)
        const users = await User.find({
            _id: { $ne: req.user.id },
            $or: [
                { email: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } }
            ]
        })
        .select("username email profile.avatar profile.firstName profile.lastName")
        .limit(10); // Performans için sınırı tut

        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/v1/users/me
 * @desc    Giriş yapmış kullanıcının kendi detaylarını getir
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
 * @route   PUT /api/v1/users/profile
 * @desc    Profil bilgilerini güncelle
 */
router.put("/profile", auth, async (req, res, next) => {
    try {
        const { firstName, lastName, bio, jobTitle, theme } = req.body;

        // Güncellenecek alanları belirle
        const updateFields = {
            "profile.firstName": firstName,
            "profile.lastName": lastName,
            "profile.bio": bio,
            "profile.jobTitle": jobTitle,
            "settings.theme": theme
        };

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