import { z } from "zod";

export const createNotificationSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    message: z.string().min(1, "Message is required").max(2000),
    userId: z.string().cuid().optional(),
    userIds: z.array(z.string().cuid()).min(1).optional(),
  })
  .refine((data) => data.userId || data.userIds, {
    message: "Either userId or userIds must be provided",
    path: ["userId"],
  });

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;

export const markReadSchema = z.object({
  isRead: z.boolean(),
});

export type MarkReadInput = z.infer<typeof markReadSchema>;
