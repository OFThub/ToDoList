const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  // Dashboard tarafında 'title' olarak kullandık, burada da öyle yapalım
  title: { type: String, required: true },
  
  // Projeyi oluşturan kişi
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Diğer kullanıcılar ve yetkileri
  collaborators: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permissions: {
        canWrite: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false }
      }
    }
  ],

  // Projeye ait to-do maddeleri
  todos: [
    {
      task: { type: String, required: true },
      completed: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Project", ProjectSchema);