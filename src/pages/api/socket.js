import { Server } from 'socket.io';

export default function handler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
  });

  io.on('connection', (socket) => {
    console.log('[socket] new connection:', socket.id);

    socket.on('join', (userId) => {
      if (!userId) return;
      const room = `user:${userId}`;
      socket.join(room);
      console.log(`[socket] ${socket.id} joined ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('[socket] disconnected:', socket.id);
    });
  });

  res.socket.server.io = io;
  res.end();
}
