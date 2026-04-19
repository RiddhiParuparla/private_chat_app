const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"].filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// Basic Route
app.get("/", (req, res) => {
  res.send("PrivateCircle API is running...");
});

// Socket Setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST"]
  }
});

const Message = require("./models/Message");
const User = require("./models/User");

// Track socket mappings { socketId: userId }
const userSockets = new Map();

// Socket Handler
io.on("connection", (socket) => {
  console.log(`\x1b[35m%s\x1b[0m`, `User Connected: ${socket.id} ⚡`);

  socket.on("join", async (userId) => {
    socket.join(userId);
    userSockets.set(socket.id, userId);
    
    // Set user online in DB
    await User.findByIdAndUpdate(userId, { status: "online" });
    
    // Broadcast status change to everyone
    io.emit("user_status", { userId, status: "online" });
    
    console.log(`User ${userId} joined their personal room and is ONLINE`);
  });

  socket.on("send_message", async (data) => {
    try {
      const { sender, receiver, content, mediaUrl } = data;
      
      const newMessage = await Message.create({
        sender,
        receiver,
        content,
        mediaUrl
      });

      // Emit to receiver's room and sender's room
      io.to(receiver).emit("receive_message", newMessage);
      io.to(sender).emit("receive_message", newMessage);
      
    } catch (err) {
      console.error("Socket Message Error:", err);
    }
  });

  // Typing Indicators
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("typing", { senderId });
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    io.to(receiverId).emit("stop_typing", { senderId });
  });

  socket.on("disconnect", async () => {
    console.log(`\x1b[31m%s\x1b[0m`, `User Disconnected: ${socket.id} 🔌`);
    
    const userId = userSockets.get(socket.id);
    if (userId) {
      // Set user offline in DB
      await User.findByIdAndUpdate(userId, { status: "offline", lastSeen: new Date() });
      
      // Broadcast status change
      io.emit("user_status", { userId, status: "offline" });
      
      userSockets.delete(socket.id);
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\x1b[32m%s\x1b[0m`, `Server running in ${process.env.NODE_ENV} mode on port ${PORT} 🚀`);
});
