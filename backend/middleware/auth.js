const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // 1. Header'ı al
  const authHeader = req.headers.authorization;
  
  // 2. Kontrol et: Header var mı ve "Bearer " ile mi başlıyor?
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Token yok veya format hatalı" });
  }

  // 3. "Bearer eyJ..." metnini boşluktan ayır ve sadece token kısmını al
  const token = authHeader.split(" ")[1];

  try {
    // 4. Ayıklanmış saf token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Eğer buraya düşüyorsa token ayıklanmış ama içeriği (secret key veya süre) hatalıdır
    res.status(401).json({ msg: "Geçersiz token" });
  }
};