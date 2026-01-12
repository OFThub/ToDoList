const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      permissions: {
        write: Boolean,
        delete: Boolean
      }
    }
  ]
});

module.exports = mongoose.model("Project", ProjectSchema);
