export interface INotificationPayload {
  title?: string;
  message: string;
}

export interface INotification extends INotificationPayload {
  createdAt: string;
}
