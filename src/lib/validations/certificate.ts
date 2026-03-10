import { z } from "zod";

export const uploadCertificateSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
});

export type UploadCertificateInput = z.infer<typeof uploadCertificateSchema>;
