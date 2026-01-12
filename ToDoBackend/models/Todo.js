const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }
});

module.exports = mongoose.model("Todo", TodoSchema);
