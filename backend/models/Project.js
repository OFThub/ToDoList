const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, "Görev içeriği boş olamaz"],
    trim: true
  },
  status: {
    type: String,
    enum: ["todo", "inprogress", "done"],
    default: "todo"
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  collaborators: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permissions: {
        canWrite: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false }
      }
    }
  ],

  groups: [{ type: String }],

  todos: [TodoSchema]
});

module.exports = mongoose.model("Project", ProjectSchema);
