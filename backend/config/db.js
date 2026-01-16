const mongoose = require("mongoose");

/**
 * MongoDB Bağlantı Yönetimi
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Modern Mongoose sürümlerinde bu ayarlar varsayılan olsa da 
            // büyük projelerde manuel kontrol ve pool boyutu önemlidir.
            maxPoolSize: 10,             // Aynı anda açık kalacak maksimum bağlantı sayısı
            serverSelectionTimeoutMS: 5000, // Sunucu yanıt vermezse 5 saniye sonra vazgeç
            socketTimeoutMS: 45000,      // İnaktif bağlantıyı 45 saniye sonra kapat
            family: 4                    // IPv4 kullanmaya zorla (Bazı ortamlarda hızlandırır)
        });

        console.log(`🚀 MongoDB Bağlantısı Sağlandı: ${conn.connection.host}`);

        // Bağlantı olaylarını dinle
        mongoose.connection.on('error', (err) => {
            console.error(`❌ Veritabanı çalışma zamanı hatası: ${err}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB bağlantısı kesildi. Yeniden bağlanmaya çalışılıyor...');
        });

    } catch (error) {
        console.error(`🔴 Veritabanı Bağlantı Hatası: ${error.message}`);
        
        // Kritik hata: Uygulamayı kapat ama şık bir şekilde
        process.exit(1);
    }
};

/**
 * Graceful Shutdown (Uygulama kapanırken bağlantıyı kes)
 * Bekleyen işlemlerin veri kaybına uğramasını engeller.
 */
const closeDB = async () => {
    await mongoose.connection.close();
    console.log('💤 MongoDB bağlantısı uygulama sonlandığı için kapatıldı.');
};

// Uygulama SIGINT (Ctrl+C) veya SIGTERM sinyali aldığında bağlantıyı kapat
process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
});

module.exports = connectDB;