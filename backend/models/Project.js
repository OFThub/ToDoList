const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  collaborators: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permissions: {
        canWrite: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false }
      }
    }
  ],

  todos: [
    {
      task: { type: String, required: true },
      completed: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Project", ProjectSchema);