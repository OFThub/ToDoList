const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: [true, "Görev bir projeye ait olmalıdır"]
  },
  task: {
    type: String,
    required: [true, "Görev içeriği boş olamaz"],
    trim: true
  },
  description: { type: String },
  
  // Durum Yönetimi
  status: {
    type: String,
    default: "todo" // Projedeki customStatuses'den beslenir
  },
  
  // Öncelik Seviyeleri
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium"
  },

  // Zaman Yönetimi
  dueDate: { type: Date },
  startDate: { type: Date },

  // Görev Atananlar
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  // Alt Görev Desteği (Recursive yapı)
  parentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Todo",
    default: null
  },

  // Dosya Ekleri (URL bazlı)
  attachments: [{
    name: String,
    url: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Görev üzerindeki etiketler
  tags: [{ type: String }],

  // Kim oluşturdu?
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // Görevin tamamlanma yüzdesi (Alt görevlere göre hesaplanabilir)
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { timestamps: true });

// Arama performansı için indeksleme
TodoSchema.index({ project: 1, status: 1 });
TodoSchema.index({ task: "text" }); // Görev içinde arama yapabilmek için

module.exports = mongoose.model("Todo", TodoSchema);