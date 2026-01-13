const express = require("express");
const Todo = require("../models/Todo");
const auth = require("../middleware/auth");
const permission = require("../middleware/permission");

const router = express.Router();

router.post("/:projectId", auth, permission("write"), async (req, res) => {
  const todo = await Todo.create({ title: req.body.title, completed: false, project: req.params.projectId });
  req.io.to(req.params.projectId).emit("update");
  res.json(todo);
});

router.delete("/:projectId/:todoId", auth, permission("delete"), async (req, res) => {
  await Todo.findByIdAndDelete(req.params.todoId);
  req.io.to(req.params.projectId).emit("update");
  res.json({ msg: "Silindi" });
});

module.exports = router;