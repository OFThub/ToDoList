const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  task: { 
    type: String, 
    required: [true, "Görev içeriği boş olamaz"],
    trim: true 
  },

  completed: { 
    type: Boolean, 
    default: false 
  },

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project",
    default: null
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  dueDate: {
    type: Date
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Todo", TodoSchema);