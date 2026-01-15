const Project = require("../models/Project");

module.exports = (type) => async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ msg: "Proje bulunamadı" });

    const userId = req.user.id;

    // ÖNEMLİ: Projeyi req nesnesine ekle ki route içinden erişebilelim
    req.project = project; 

    // Sahibi ise direkt geç
    if (project.owner.toString() === userId) return next();

    const collaborator = project.collaborators.find(
      (c) => c.user && c.user.toString() === userId
    );

    if (!collaborator) {
      return res.status(403).json({ msg: "Bu projeye yetkiniz yok" });
    }

    const hasPermission = type === "write" 
      ? collaborator.permissions.canWrite 
      : collaborator.permissions.canDelete;

    if (!hasPermission) {
      return res.status(403).json({ msg: "Bu işlem için yetkiniz yetersiz" });
    }

    next();
  } catch (err) {
    res.status(500).json({ msg: "Sunucu hatası" });
  }
};