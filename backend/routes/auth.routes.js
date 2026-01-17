/**
 * @file auth.js
 * @description Kullanıcı kayıt, giriş, profil yönetimi ve oturum işlemlerini yürüten API rotaları.
 * @route /api/v1/auth
 */

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

/**
 * @desc    JWT oluşturur, Cookie ayarlarını yapar ve yanıt döner.
 * @param   {Object} user - Veritabanından gelen kullanıcı nesnesi
 * @param   {Number} statusCode - HTTP durum kodu
 * @param   {Object} res - Express response nesnesi
 */
const sendTokenResponse = (user, statusCode, res) => {
    // JWT Oluşturma
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || "24h",
    });

    // Cookie Ayarları
    const options = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // Güvenlik: JS üzerinden erişilemez
        secure: process.env.NODE_ENV === "production", // Güvenlik: Prod ortamında sadece HTTPS
        sameSite: 'strict' // CSRF koruması için destekleyici
    };

    // Şifreyi güvenlik için response'dan çıkarıyoruz
    const userResponse = {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
    };

    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            token,
            user: userResponse
        });
};

// ---------------------------------------------------------
// AUTH İŞLEMLERİ
// ---------------------------------------------------------

/**
 * @route   POST /api/v1/auth/register
 * @desc    Yeni kullanıcı kaydı oluşturur
 * @access  Public
 */
router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Çakışma kontrolü
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                msg: "E-posta veya kullanıcı adı zaten sistemde kayıtlı." 
            });
        }

        // Şifre Hashleme
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Kullanıcı Oluşturma
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            profile: { firstName, lastName }
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Kullanıcı girişi yapar ve token döner
 * @access  Public
 */
router.post("/login", async (req, res, next) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ 
                success: false, 
                msg: "Lütfen kullanıcı bilgilerinizi ve şifrenizi girin." 
            });
        }

        // Kullanıcıyı bul (+password ile gizli alanı getiriyoruz)
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        }).select("+password");

        if (!user) {
            return res.status(401).json({ success: false, msg: "Giriş bilgileri hatalı." });
        }

        // Şifre Doğrulama
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, msg: "Giriş bilgileri hatalı." });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Mevcut giriş yapmış kullanıcının bilgilerini getirir
 * @access  Private
 */
router.get("/me", auth, async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @route   PUT /api/v1/auth/updatedetails
 * @desc    Kullanıcı profil bilgilerini günceller
 * @access  Private
 */
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

/**
 * @route   GET /api/v1/auth/logout
 * @desc    Cookie'yi temizler ve oturumu kapatır
 * @access  Private
 */
router.get("/logout", (req, res) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ success: true, msg: "Başarıyla çıkış yapıldı." });
});

module.exports = router;