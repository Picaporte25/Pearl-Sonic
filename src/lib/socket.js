import { io } from 'socket.io-client';

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io({
      path: '/api/socket',
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  console.log('[socket] connecting...');
  s.connect();
}

export function joinRoom(userId) {
  const s = getSocket();
  console.log('[socket] joining room for user:', userId);
  s.emit('join', userId);
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
}

export { getSocket };
