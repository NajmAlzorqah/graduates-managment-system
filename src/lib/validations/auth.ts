import { z } from "zod";

export const loginSchema = z.object({
  academicId: z.string().min(1, "Academic ID is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nameAr: z.string().min(1, "Arabic Name is required"),
    name: z.string().optional().or(z.literal("")),
    academicId: z
      .string()
      .min(3, "Academic ID must be at least 3 characters")
      .max(20, "Academic ID must be at most 20 characters")
      .regex(
        /^[a-zA-Z0-9]+$/,
        "Academic ID must contain only letters and numbers",
      ),
    email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one digit"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
