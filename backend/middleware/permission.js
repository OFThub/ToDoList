const Project = require("../models/Project");

module.exports = (type) => async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);
  const member = project.members.find(m => m.user.toString() === req.user.id);

  if (!member || !member.permissions[type]) {
    return res.status(403).json({ msg: "Yetki yok" });
  }
  next();
};