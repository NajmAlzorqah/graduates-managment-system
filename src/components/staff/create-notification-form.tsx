"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { createNotificationAction } from "@/lib/actions/staff-notifications";
import {
  createNotificationSchema,
  type CreateNotificationInput,
} from "@/lib/validations/notification";
import type { Student } from "@/types/student";

type CreateNotificationFormProps = {
  students: Student[];
  onSuccess: () => void;
};

export default function CreateNotificationForm({
  students,
  onSuccess,
}: CreateNotificationFormProps) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateNotificationInput>({
    resolver: zodResolver(createNotificationSchema),
  });

  const onSubmit = (data: CreateNotificationInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("message", data.message);
      if (data.userId) {
        formData.append("userId", data.userId);
      }
      // Handle multiple userIds if your UI supports it
      // For now, we assume single user selection
      const result = await createNotificationAction(formData);
      if (result.success) {
        toast.success("Notification sent successfully!");
        reset();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl bg-white p-6 shadow-lg"
    >
      <div>
        <label
          htmlFor="userId"
          className="mb-1 block font-medium text-[#1a3b5c]"
        >
          Recipient
        </label>
        <select
          id="userId"
          {...register("userId")}
          className="w-full rounded-lg border-gray-300"
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.academicId})
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="title"
          className="mb-1 block font-medium text-[#1a3b5c]"
        >
          Title
        </label>
        <input
          id="title"
          {...register("title")}
          className="w-full rounded-lg border-gray-300"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-1 block font-medium text-[#1a3b5c]"
        >
          Message
        </label>
        <textarea
          id="message"
          {...register("message")}
          rows={4}
          className="w-full rounded-lg border-gray-300"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[#ffb755] px-6 py-2 font-bold text-white shadow-md hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isPending ? "Sending..." : "Send Notification"}
        </button>
      </div>
    </form>
  );
}
