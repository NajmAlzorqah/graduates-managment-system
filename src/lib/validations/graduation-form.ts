import { z } from "zod";

const graduationFormStatusEnum = z.enum([
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
]);

export const submitGraduationFormSchema = z.object({
  major: z.string().min(1, "Major is required"),
  graduationYear: z.coerce
    .number()
    .int()
    .min(2000, "Graduation year must be 2000 or later")
    .max(2100, "Graduation year must be 2100 or earlier"),
  studentCardNumber: z.string().min(1, "Student card number is required"),
});

export type SubmitGraduationFormInput = z.infer<
  typeof submitGraduationFormSchema
>;

export const reviewGraduationFormSchema = z.object({
  status: graduationFormStatusEnum.refine(
    (val) => val === "APPROVED" || val === "REJECTED",
    { message: "Status must be APPROVED or REJECTED" },
  ),
  comments: z.string().max(2000).optional(),
});

export type ReviewGraduationFormInput = z.infer<
  typeof reviewGraduationFormSchema
>;
