const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth"); // Daha önce yazdığımız tam teşekküllü middleware
const router = express.Router();

/**
 * @desc    Token oluşturma ve Cookie Ayarları
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "24h",
    });

    const options = {
        expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000),
        httpOnly: true, // XSS saldırılarını önlemek için JavaScript ile erişilemez
        secure: process.env.NODE_ENV === "production", // Sadece HTTPS üzerinde çalışır
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profile: user.profile
        }
    });
};

/* ==========================================
   1. REGISTER (Kayıt Ol)
   ========================================== */
router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Kullanıcı var mı kontrolü
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, msg: "Email veya kullanıcı adı zaten alınmış." });
        }

        // Şifre hashleme işlemi User modelindeki pre-save hook ile de yapılabilir 
        // ama burada manuel yapıyorsan:
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            profile: { firstName, lastName }
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err); // Merkezi hata yöneticisine gönder
    }
});

/* ==========================================
   2. LOGIN (Giriş Yap)
   ========================================== */
router.post("/login", async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ success: false, msg: "Lütfen email/kullanıcı adı ve şifre girin." });
        }

        // Şifreyi de getir (Modelde select: false olduğu için explicit çağırmalıyız)
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        }).select("+password");

        if (!user) {
            return res.status(401).json({ success: false, msg: "Geçersiz kimlik bilgileri." });
        }

        // Şifre kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, msg: "Geçersiz kimlik bilgileri." });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
});

/* ==========================================
   3. ME (Mevcut Kullanıcı Bilgileri)
   ========================================== */
router.get("/me", auth, async (req, res, next) => {
    try {
        // auth middleware zaten req.user'ı doldurdu
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});

/* ==========================================
   4. UPDATE DETAILS (Profil Güncelleme)
   ========================================== */
router.put("/updatedetails", auth, async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            "profile.firstName": req.body.firstName,
            "profile.lastName": req.body.lastName,
            "profile.bio": req.body.bio
        };

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, user });
    } catch (err) {
        next(err);
    }
});

/* ==========================================
   5. LOGOUT (Çıkış Yap)
   ========================================== */
router.get("/logout", (req, res) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ success: true, msg: "Başarıyla çıkış yapıldı." });
});

module.exports = router;