export type NotificationEventType = 'SAR_STR_FILED' | string;
export type NotificationChannel = 'IN_APP' | 'EMAIL' | string;

export interface NotificationResponse {
  notificationId: string;
  recipientId: string;
  recipientName: string;
  sarStrId?: string | null;
  eventType: NotificationEventType;
  channel: NotificationChannel;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}
