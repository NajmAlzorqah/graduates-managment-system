import { z } from "zod";

export const submitGraduationFormSchema = z.object({
  fullNameAr: z
    .string()
    .trim()
    .min(1, "الاسم الرباعي (بالعربي) مطلوب")
    .regex(
      /^[\u0621-\u064A\s]+$/,
      "الاسم بالعربي يجب أن يحتوي على حروف عربية فقط",
    )
    .refine(
      (val) => val.split(/\s+/).filter(Boolean).length === 4,
      "الاسم بالعربي يجب أن يكون رباعي وبالحروف العربية فقط",
    ),
  fullNameEn: z
    .string()
    .trim()
    .min(1, "الاسم (بالإنجليزي) مطلوب")
    .regex(
      /^[a-zA-Z\s]+$/,
      "الاسم الإنجليزي يجب أن يحتوي على حروف إنجليزية فقط",
    ),
  phoneNumber: z
    .string()
    .trim()
    .regex(
      /^\d{9}$/,
      "يجب أن يكون الجزء المتبقي من رقم الهاتف مكون من 9 أرقام",
    ),
  countryCode: z.string().min(1),
  major: z.string().optional().or(z.literal("")),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1999, "سنة التخرج يجب أن تكون بين 1999 و السنة الحالية + 1")
    .max(
      new Date().getFullYear() + 1,
      "سنة التخرج يجب أن تكون بين 1999 و السنة الحالية + 1",
    ),
  studentCardNumber: z.string().optional().or(z.literal("")),
  agreedToTerms: z.literal(true, {
    message: "يجب الموافقة على صحة البيانات",
  }),
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
