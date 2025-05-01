import { Server, Socket, Namespace } from 'socket.io';
import { PurchaseNotification } from '../types/events';

interface AuthenticatedSocket extends Socket {
  user: {
    payload: {userId: string,
      role: "user" | "admin" | "artist"
    }
  }; // You can make this more specific with your user type
}

export class NotificationEventHandler {
  private adminNamespace: Namespace;
  private userNamespace: Namespace;

  constructor(adminNamespace: Namespace, userNamespace: Namespace) {
    this.adminNamespace = adminNamespace;
    this.userNamespace = userNamespace;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle admin connections and events
    this.adminNamespace.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      console.log('Admin connected:', authSocket.user.payload.userId);
      

      // Join admin to notification room
      socket.join('notifications');

      // Handle purchase notifications
      // socket.on('purchase_notification_seen', (notificationId: string) => {
      //   // You can add logic here to mark notification as seen
      //   console.log(`Admin seen notification: ${notificationId}`);
      // });

      socket.on('disconnect', () => {
        console.log('Admin disconnected:', authSocket.user.payload.userId);
      });
    });

    // Handle user connections and events
    this.userNamespace.on('connection', (socket: Socket) => {
      const authSocket = socket as AuthenticatedSocket;
      console.log('User connected:', authSocket.user.payload.userId);
      

      // Join user to their personal room
      socket.join(`user_${authSocket.user.payload.userId}`);

      socket.on('disconnect', () => {
        console.log('User disconnected:', authSocket.user.payload.userId);
      });
    });
  }

  public emitNewPurchase(notification: PurchaseNotification) {
    // Send full notification to admin
    this.adminNamespace.to('notifications').emit('new_purchase', notification);

    // Send status update to specific user
    this.userNamespace.to(`user_${notification.userId}`).emit('purchase_status', {
      
      packageName: notification.packageName,
      price: notification.price
    });
  }

  public emitPurchaseStatus(userId: string, status: string) {
    this.userNamespace.to(`user_${userId}`).emit('purchase_status', { status });
  }
}  