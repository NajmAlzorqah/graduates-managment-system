export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  sentById: string | null;
  createdAt: Date;
};
