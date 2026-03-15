"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { updateAdminName } from "@/lib/actions/admin";

const nameSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
});

type NameFormData = z.infer<typeof nameSchema>;

export default function UpdateAdminNameModal({
  isOpen,
  onClose,
  currentName,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: currentName },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: currentName });
    }
  }, [isOpen, currentName, reset]);

  const onSubmit = (data: NameFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      const result = await updateAdminName(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success ?? "Name updated!");
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Update Your Name"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-[#1a3b5c]">
          Update Your Name
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              id="name"
              {...register("name")}
              className="rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter your full name"
            />
            {errors.name ? (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
