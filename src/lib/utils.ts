import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getNotificationSenderName(
  sentBy: { nameAr: string | null; role: string } | null,
) {
  if (!sentBy) return "شؤون الخريجين"; // System default
  if (sentBy.role === "ADMIN") return "الآدمن";
  if (sentBy.role === "STAFF") return "شؤون الخريجين";
  return sentBy.nameAr || "شؤون الخريجين";
}

export function getNotificationRecipientName(user: {
  nameAr: string | null;
  role: string;
}) {
  if (user.role === "ALL") return user.nameAr || "الكل";
  if (user.role === "GROUP") return user.nameAr || "مجموعة";
  if (user.role === "STUDENT") return user.nameAr || "طالب";
  if (user.role === "STAFF" || user.role === "ADMIN") return "شؤون الخريجين";
  return user.nameAr || "شؤون الخريجين";
}
