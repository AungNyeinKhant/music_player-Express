import { Server, Namespace } from 'socket.io';
import { AccessPayload, verifyJwtToken } from '../../utils/jwt';

export const setupAdminNamespace = (io: Server): Namespace => {
  const adminNamespace = io.of('/admin');
  
  // Setup authentication middleware for admin namespace
  adminNamespace.use((socket: any, next: any) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication token require'));
    }

    try {
      const decoded = verifyJwtToken<AccessPayload>(token);
      if (decoded.payload?.role !== "admin") {
        return next(new Error('Unauthorized'));
      }
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  return adminNamespace;
}; 