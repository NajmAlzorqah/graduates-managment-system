export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  status: string;
  sentById: string | null;
  createdAt: Date;
};

export type NotificationWithUsers = Notification & {
  user: {
    nameAr: string | null;
    role: string;
  };
  sentBy: {
    nameAr: string | null;
    role: string;
  } | null;
};
