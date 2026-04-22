require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jurusanRoutes = require('./routes/jurusanRoutes');
const userRoutes = require('./routes/userRoutes');
const listUserRoutes = require('./routes/listUserRoutes');
const listDataUserRoutes = require('./routes/listDataUserRoutes');
const inboxRoutes = require('./routes/inboxRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const beritaRoutes = require('./routes/beritaRoutes');
const { createServer } = require('http');
const { Server } = require('socket.io'); 

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const userSockets = {}; 

io.on("connection", (socket) => {
  console.log("User connect:", socket.id);

  socket.on("register_user", (email) => {
    if (!userSockets[email]) {
      userSockets[email] = [];
    }

    userSockets[email].push(socket.id);
    console.log("REGISTER:", email, socket.id);
  });

  socket.on("forgot_password_request", (data) => {
    console.log("Request dari:", data.email);

    if (!userSockets[data.email]) {
      userSockets[data.email] = [];
    }

    if (!userSockets[data.email].includes(socket.id)) {
      userSockets[data.email].push(socket.id);
    }

    io.emit("admin_notif_reset", data);
  });

  socket.on("admin_reset_done", (data) => {
    const sockets = userSockets[data.email];

    if (sockets && sockets.length > 0) {
      sockets.forEach((id) => {
        io.to(id).emit("user_reset_done", {
          message: "Password kamu sudah direset oleh admin. Password baru: 12345"
        });
      });
    } else {
      console.log("User tidak online:", data.email);
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnect:", socket.id);

    for (const email in userSockets) {
      userSockets[email] = userSockets[email].filter(id => id !== socket.id);

      if (userSockets[email].length === 0) {
        delete userSockets[email];
      }
    }
  });
});

app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
app.use('/jurusan', express.static(path.join(__dirname, 'public/jurusan')));
app.use('/ijazah', express.static(path.join(__dirname, 'public/ijazah')));
app.use('/berita', express.static(path.join(__dirname, 'public/berita')));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jurusan', jurusanRoutes);
app.use('/api/user', userRoutes);
app.use('/api/list_user', listUserRoutes);
app.use('/api/list_data_user', listDataUserRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/berita', beritaRoutes);

app.get('/', (req, res) => {
  res.send('Battle control online - API is running');
});

httpServer.listen(port, () => {
  console.log(`Kiciyo my wife online :3 di http://localhost:${port}`);
});