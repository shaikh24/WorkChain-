const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
dotenv.config();

const authRoutes = require('./routes/auth');
const gigsRoutes = require('./routes/gigs');
const projectsRoutes = require('./routes/projects');
const levelsRoutes = require('./routes/levels');
const adminRoutes = require('./routes/admin');
const escrowRoutes = require('./routes/escrow');
const uploadRoutes = require('./routes/uploads');
const paymentsRoutes = require('./routes/payments');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({limit:'10mb'}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/levels', levelsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/payments', paymentsRoutes);

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('join', (room) => { socket.join(room); });
  socket.on('leave', (room) => { socket.leave(room); });
  socket.on('message', (data) => {
    io.to(data.room).emit('message', { sender: data.sender, text: data.text, time: Date.now() });
  });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch(err => console.error(err));
