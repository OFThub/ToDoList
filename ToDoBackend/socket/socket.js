module.exports = (io) => {
  io.on("connection", socket => {
    socket.on("joinProject", projectId => {
      socket.join(projectId);
    });
  });
};
