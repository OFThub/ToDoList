const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  // Görevin açıklaması
  task: { 
    type: String, 
    required: [true, "Görev içeriği boş olamaz"],
    trim: true 
  },

  // Görev tamamlandı mı?
  completed: { 
    type: Boolean, 
    default: false 
  },

  // Görevi oluşturan kullanıcı
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  // Eğer bu görev bir projeye dahilse projenin ID'si
  // Kişisel görevler için burası boş kalabilir
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project",
    default: null
  },

  // Görevin öncelik durumu
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  // Son tarih (opsiyonel)
  dueDate: {
    type: Date
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Todo", TodoSchema);