import { Server, Namespace } from 'socket.io';
import { AccessPayload, verifyJwtToken } from '../../utils/jwt';

export const setupUserNamespace = (io: Server): Namespace => {
  const userNamespace = io.of('/user');
  
  // Setup authentication middleware for user namespace
  userNamespace.use((socket: any, next: any) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = verifyJwtToken<AccessPayload>(token);
      if (decoded.payload?.role !== "user") {
        return next(new Error('Unauthorized'));
      }
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  return userNamespace;
}; 