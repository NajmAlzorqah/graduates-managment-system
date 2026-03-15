"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { updateAdminPassword } from "@/lib/actions/admin";

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function UpdateAdminPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("oldPassword", data.oldPassword);
      formData.append("newPassword", data.newPassword);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await updateAdminPassword(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success ?? "Password updated!");
        onClose();
        reset();
        router.push("/login"); // Force re-login
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onClick={() => {
        onClose();
        reset();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
          reset();
        }
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Change Password"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-[#1a3b5c]">
          Change Password
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="oldPassword">Old Password</label>
            <input
              id="oldPassword"
              type="password"
              {...register("oldPassword")}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.oldPassword ? (
              <p className="text-xs text-red-500">
                {errors.oldPassword.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.newPassword ? (
              <p className="text-xs text-red-500">
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="rounded-md border border-gray-300 px-3 py-2"
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
