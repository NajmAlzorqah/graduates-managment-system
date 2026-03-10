import { z } from "zod";

const documentTypeEnum = z.enum([
  "PASSPORT",
  "PERSONAL_PHOTO",
  "HIGH_SCHOOL_CERT",
  "NATIONAL_ID",
  "OTHER",
]);

const documentStatusEnum = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);

export const uploadDocumentSchema = z.object({
  documentType: documentTypeEnum,
  label: z.string().min(1, "Label is required").max(200),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const reviewDocumentSchema = z
  .object({
    status: documentStatusEnum.refine((val) => val !== "PENDING", {
      message: "Status must be ACCEPTED or REJECTED",
    }),
    rejectionReason: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.status === "REJECTED" && !data.rejectionReason) {
        return false;
      }
      return true;
    },
    {
      message: "Rejection reason is required when rejecting a document",
      path: ["rejectionReason"],
    },
  );

export type ReviewDocumentInput = z.infer<typeof reviewDocumentSchema>;
