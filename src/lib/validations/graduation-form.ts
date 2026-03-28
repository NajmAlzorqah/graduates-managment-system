import { z } from "zod";

export const submitGraduationFormSchema = z.object({
  fullName: z.string().min(1, "الاسم الرباعي مطلوب"),
  passportName: z.string().min(1, "الاسم كما في جواز السفر مطلوب"),
  major: z.string().min(1, "التخصص مطلوب"),
  graduationYear: z.coerce
    .number()
    .int()
    .min(2000, "سنة التخرج يجب أن تكون 2000 أو بعدها")
    .max(2100, "سنة التخرج يجب أن تكون 2100 أو قبلها"),
  studentCardNumber: z.string().min(1, "رقم البطاقة الجامعية مطلوب"),
});

export type SubmitGraduationFormInput = z.infer<
  typeof submitGraduationFormSchema
>;

export const reviewGraduationFormSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "NEEDS_CONFIRMATION"]),
  comments: z.string().max(2000).optional(),
});

export type ReviewGraduationFormInput = z.infer<
  typeof reviewGraduationFormSchema
>;
