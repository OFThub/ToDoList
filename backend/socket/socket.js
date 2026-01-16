/**
 * Socket.io Real-time Yönetim Merkezi
 */
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Yeni Bağlantı: ${socket.id}`);

    // 1. Proje Odasına Katılma
    // Kullanıcı bir projeyi açtığında o projenin ID'sine özel odaya girer
    socket.on("joinProject", (projectId) => {
      socket.join(projectId);
      console.log(`👤 Kullanıcı ${socket.id}, Proje Odasına Katıldı: ${projectId}`);
    });

    // 2. Proje Odasından Ayrılma
    socket.on("leaveProject", (projectId) => {
      socket.leave(projectId);
      console.log(`🚶 Kullanıcı ${socket.id}, Proje Odasından Ayrıldı: ${projectId}`);
    });

    // 3. "Kullanıcı Yazıyor..." Efekti (Real-time Typing)
    // ClickUp'taki gibi, birisi açıklama yazarken başkalarının görmesini sağlar
    socket.on("typing", ({ projectId, username }) => {
      socket.to(projectId).emit("userTyping", { username });
    });

    socket.on("stopTyping", ({ projectId }) => {
      socket.to(projectId).emit("userStoppedTyping");
    });

    // 4. Görev Değişikliklerini Yayınlama (Broadcast)
    // Not: Bu işlemler genellikle controller içinden req.io ile yapılır
    // Ancak socket üzerinden doğrudan tetiklemek isterseniz:
    socket.on("taskUpdate", (data) => {
      // Gönderen hariç o projedeki herkese güncel veriyi ilet
      socket.to(data.projectId).emit("taskUpdated", data.updatedTask);
    });

    // 5. Global Bildirimler (Notification)
    // Kullanıcıyı kendi kullanıcı ID'sine özel bir odaya alalım (Örn: Bildirimler için)
    socket.on("setup", (userData) => {
      socket.join(userData.id);
      console.log(`🔔 Bildirim Odası Hazır: ${userData.id}`);
      socket.emit("connected");
    });

    // 6. Bağlantı Kesilmesi
    socket.on("disconnect", () => {
      console.log("❌ Kullanıcı ayrıldı");
    });
  });
};