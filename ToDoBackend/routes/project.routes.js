const express = require("express");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    owner: req.user.id,
    members: [{
      user: req.user.id,
      permissions: { write: true, delete: true }
    }]
  });
  res.json(project);
});

router.post("/:id/add-user", auth, async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (project.owner.toString() !== req.user.id)
    return res.status(403).json({ msg: "Sadece kurucu ekleyebilir" });

  project.members.push(req.body);
  await project.save();
  res.json(project);
});

module.exports = router;
