export interface PurchaseNotification {
  id: string;
  userId: string;
  
  packageName: string;
  price: number;
  
  
}

export interface SocketEvents {
  'new_purchase': (data: PurchaseNotification) => void;
  'purchase_status': (status: string) => void;
} 