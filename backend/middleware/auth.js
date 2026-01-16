const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Tam Teşekküllü Kimlik Doğrulama Middleware'i
 */
module.exports = async (req, res, next) => {
    try {
        let token;

        // 1. Token'ın Header'dan alınması ve format kontrolü
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                msg: "Lütfen bu işlem için giriş yapın. Yetkilendirme token'ı bulunamadı."
            });
        }

        // 2. Token Doğrulama
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, msg: "Oturum süreniz doldu, lütfen tekrar giriş yapın." });
            }
            return res.status(401).json({ success: false, msg: "Geçersiz token. Erişim reddedildi." });
        }

        // 3. Kullanıcının Veritabanında Kontrol Edilmesi
        // Select("-password") ile güvenlik için şifreyi hariç tutuyoruz
        const currentUser = await User.findById(decoded.id).select("-password");

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                msg: "Bu token'ın sahibi olan kullanıcı artık mevcut değil."
            });
        }

        // 4. Hesap Aktiflik Kontrolü
        if (!currentUser.isActive) {
            return res.status(403).json({
                success: false,
                msg: "Hesabınız askıya alınmıştır. Lütfen destek ekibiyle iletişime geçin."
            });
        }

        // 5. Şifre Değişikliği Kontrolü (Opsiyonel Güvenlik Katmanı)
        // Eğer kullanıcı şifresini değiştirdiyse, eski tokenları geçersiz kılmak için:
        if (currentUser.passwordChangedAt) {
            const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
            if (decoded.iat < changedTimestamp) {
                return res.status(401).json({ msg: "Şifre yeni değiştirildi. Lütfen tekrar giriş yapın." });
            }
        }

        // 6. Bilgileri Request Nesnesine Aktar
        // Artık req.user üzerinden tüm kullanıcı verilerine (roller, email vb.) her yerden erişilebilir.
        req.user = currentUser;
        
        // Son giriş zamanını sessizce güncelle (Opsiyonel)
        currentUser.lastLogin = Date.now();
        await currentUser.save({ validateBeforeSave: false });

        next();
    } catch (err) {
        console.error("Auth Middleware Hatası:", err);
        res.status(500).json({ success: false, msg: "Kimlik doğrulanırken bir sunucu hatası oluştu." });
    }
};