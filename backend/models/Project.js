const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Proje başlığı zorunludur"],
    trim: true,
    maxlength: [100, "Başlık 100 karakterden fazla olamaz"]
  },
  description: { type: String, trim: true },
  
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  color: { 
    type: String, 
    default: "#6366f1" // Varsayılan bir indigo/mor tonu
  },

  collaborators: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { 
        type: String, 
        enum: ["admin", "editor", "viewer"], 
        default: "viewer" 
      },
      joinedAt: { type: Date, default: Date.now }
    }
  ],

  customStatuses: [
    {
      label: { type: String, default: "Todo" },
      color: { type: String, default: "#808080" }
    }
  ],

  category: {
    type: String,
    default: "Other"
  },

  isArchived: { type: Boolean, default: false },
  
  visibility: {
    type: String,
    enum: ["private", "team", "public"],
    default: "private"
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

ProjectSchema.virtual('tasks', {
  ref: 'Todo',
  localField: '_id',
  foreignField: 'project'
});

module.exports = mongoose.model("Project", ProjectSchema);