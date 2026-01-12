require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

/* ===========================
   SOCKET.IO
=========================== */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite frontend
    methods: ["GET", "POST"],
  },
});

/* ===========================
   MIDDLEWARE
=========================== */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ===========================
   DATABASE
=========================== */
connectDB();

/* ===========================
   ROUTES
=========================== */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/projects", require("./routes/project.routes"));
app.use("/api/todos", require("./routes/todo.routes"));

/* ===========================
   SOCKET FILE
=========================== */
require("./socket/socket")(io);

/* ===========================
   SERVER
=========================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Backend çalışıyor: http://localhost:${PORT}`);
});
