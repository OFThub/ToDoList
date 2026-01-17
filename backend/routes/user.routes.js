const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

/**
 * @route   GET /api/v1/users/search
 * @desc    Kullanıcıları e-posta veya kullanıcı adına göre ara
 */
router.get("/search", auth, async (req, res, next) => {
    try {
        const query = req.query.q;
        
        // Eğer sorgu boşsa tüm kullanıcıları getir (Kanban eşleşmesi için gerekebilir)
        // Ancak güvenlik için kendisi hariç tutulur.
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
 * @route   GET /api/v1/users/:id
 * @desc    ID ile kullanıcı getir (DÜZELTİLDİ: Username artık geliyor)
 */
router.get("/:id", auth, async (req, res, next) => {
    try {
        // HATA DÜZELTME: "-username" ifadesi kullanıcı adını gizliyordu, "username" olarak güncellendi.
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
 * @desc    Profil bilgilerini güncelle
 */
router.put("/profile", auth, async (req, res, next) => {
    try {
        const { firstName, lastName, bio, jobTitle, theme } = req.body;

        // undefined gelme ihtimaline karşı kontrollü atama
        const updateFields = {};
        if (firstName) updateFields["profile.firstName"] = firstName;
        if (lastName) updateFields["profile.lastName"] = lastName;
        if (bio) updateFields["profile.bio"] = bio;
        if (jobTitle) updateFields["profile.jobTitle"] = jobTitle;
        if (theme) updateFields["settings.theme"] = theme;

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