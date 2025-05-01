import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

import { AccessPayload, verifyJwtToken } from '../utils/jwt';
import { NotificationEventHandler } from './events/notification.event';
import { setupAdminNamespace } from './namespaces/admin.namespace';
import { setupUserNamespace } from './namespaces/user.namespace';

const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Setup namespaces
  const adminNamespace = setupAdminNamespace(io);
  const userNamespace = setupUserNamespace(io);

  // Initialize notification handler with both namespaces
  const notificationHandler = new NotificationEventHandler(adminNamespace, userNamespace);

  return {
    io,
    notificationHandler
  };
};

export default initSocket;
