import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  academicId: z
    .string()
    .min(3, "Academic ID must be at least 3 characters")
    .max(20, "Academic ID must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Academic ID must contain only letters and numbers",
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit"),
  nameAr: z.string().optional(),
  major: z.string().optional(),
  studentCardNumber: z.string().optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  nameAr: z.string().optional(),
  isApproved: z.boolean().optional(),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const updateStudentProfileSchema = z.object({
  studentCardNumber: z.string().optional(),
  major: z.string().optional(),
  graduationYear: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type UpdateStudentProfileInput = z.infer<
  typeof updateStudentProfileSchema
>;
