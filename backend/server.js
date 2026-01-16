require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// 1. Uygulama ve Sunucu Başlatma
const app = express();
const server = http.createServer(app);

// 2. Veritabanı Bağlantısı
connectDB();

// 3. Socket.io Yapılandırması
// Frontend (5173) ile Backend (5000) arasındaki WebSocket CORS ayarı
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// 4. Global Middleware'ler

// Helmet: Güvenlik başlıklarını ekler. 
// crossOriginResourcePolicy: CORS hatalarını önlemek için 'cross-origin' olarak ayarlandı.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Yapılandırması: Frontend'in API'ye erişimine izin verir.
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true, // Token/Cookie bazlı işlemler için zorunlu
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

app.use(compression()); // Yanıtları sıkıştırır
app.use(morgan("dev")); // İstekleri konsola yazar

// Body Parser: Gelen JSON verisini okur
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 5. Socket.io Instance'ını Request'e Enjekte Etme
// Bu sayede controller içinde req.io.emit() diyerek bildirim gönderebilirsin.
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 6. API Rotaları (v1 sürümü)
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/projects", require("./routes/project.routes"));
app.use("/api/v1/todos", require("./routes/todo.routes"));
app.use("/api/v1/users", require("./routes/user.routes"));

// 7. Sağlık Kontrolü
app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// 8. 404 Hatası Yakalama
app.use((req, res, next) => {
  const err = new Error(`İstediğiniz rota (${req.originalUrl}) bu sunucuda bulunamadı.`);
  err.statusCode = 404;
  next(err);
});

// 9. Merkezi Hata Yönetimi (Global Error Handler)
// Hataları frontend'e düzgün formatta gönderir.
app.use(errorHandler);

// 10. Socket İşleyicisi
require("./socket/socket")(io);

// 11. Sunucuyu Dinlemeye Başla
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  🚀 Sunucu ${process.env.NODE_ENV || 'development'} modunda çalışıyor.
  📡 Port: ${PORT}
  🔗 API: http://localhost:${PORT}/api/v1
  `);
});

// 12. Beklenmedik Çökmeleri Yakala
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Sunucu kapatılıyor...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});