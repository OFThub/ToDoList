/**
 * Merkezi Hata Yönetimi (Global Error Handler)
 */
module.exports = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Konsola geliştirici için hatayı detaylı yazdır
    console.error(`🔴 Hata Yakalandı: ${err.name} - ${err.message}`.red);

    // Mongoose hatalarını şık JSON formatına dönüştür
    if (err.name === 'CastError') {
        error.message = `Geçersiz ID formatı.`;
        error.statusCode = 404;
    }

    if (err.code === 11000) {
        error.message = 'Bu kayıt zaten mevcut (Duplicate field).';
        error.statusCode = 400;
    }

    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors).map(val => val.message);
        error.statusCode = 400;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Sunucu Hatası'
    });
};