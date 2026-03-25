"use client";

import Image from "next/image";
import { useTransition } from "react";
import toast from "react-hot-toast";
import {
  approveStudentAction,
  rejectStudentAction,
} from "@/lib/actions/staff-students";
import type { Student } from "@/types/student";

interface PendingStudentCardProps {
  student: Student;
}

function StudentAvatar({
  avatarUrl,
  name,
}: {
  avatarUrl?: string | null;
  name: string;
}) {
  return (
    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#1a3b5c] md:h-[100px] md:w-[100px] xl:h-[131px] xl:w-[131px] relative overflow-hidden">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-10 w-10 md:h-14 md:w-14 xl:h-[84px] xl:w-[84px]"
          fill="#ffffff"
          aria-hidden="true"
        >
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.64 0-8.4 2.9-8.4 6.48A1.52 1.52 0 0 0 5.12 22h13.76a1.52 1.52 0 0 0 1.52-1.52C20.4 16.9 16.64 14 12 14Z" />
        </svg>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 28 18"
      className="h-3 w-[18px] shrink-0 xl:h-[17px] xl:w-[28px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 9L10 17L26 1" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 26 26"
      className="h-[14px] w-[14px] shrink-0 xl:h-[18px] xl:w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 3L23 23M23 3L3 23" />
    </svg>
  );
}

export default function PendingStudentCard({
  student,
}: PendingStudentCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveStudentAction(student.id);
      if (result.success) {
        toast.success("تم قبول الطالب بنجاح");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await rejectStudentAction(student.id);
      if (result.success) {
        toast.success("تم رفض الطالب");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div
      className="flex items-center gap-3 rounded-[28px] bg-[#f4b24d] px-4 py-3.5 shadow-sm md:gap-5 md:rounded-[36px] md:px-6 md:py-4 xl:gap-6 xl:rounded-[44px] xl:px-8 xl:py-5"
      dir="rtl"
    >
      {/* Avatar — rightmost in RTL */}
      <StudentAvatar avatarUrl={student.avatarUrl} name={student.name || ""} />

      {/* Student info — flex-1 in the middle, right-aligned text */}
      <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5 text-right md:gap-1">
        <p className="truncate text-[15px] font-bold leading-tight text-[#1a3b5c] md:text-[20px] xl:text-[26px]">
          {student.name || "—"}
        </p>
        <p className="truncate text-[12px] font-semibold text-[#1a3b5c] md:text-[16px] xl:text-[22px]">
          {student.email}
        </p>
        <p className="text-[12px] font-semibold text-[#1a3b5c] md:text-[16px] xl:text-[22px]">
          ID:{student.academicId}
        </p>
      </div>

      {/* Action buttons — leftmost in RTL = visual left side */}
      <div className="flex shrink-0 flex-col gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="flex h-[34px] min-w-[100px] items-center justify-center gap-1.5 rounded-[29px] bg-[#1a3b5c] px-3 text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90 disabled:opacity-50 md:h-[40px] md:min-w-[120px] md:px-4 xl:h-[44px] xl:min-w-[151px]"
        >
          <CheckIcon />
          <span
            className="text-[13px] font-light md:text-[16px] xl:text-[22px]"
            dir="rtl"
          >
            قبول
          </span>
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={isPending}
          className="flex h-[34px] min-w-[100px] items-center justify-center gap-1.5 rounded-[29px] bg-[#1a3b5c] px-3 text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90 disabled:opacity-50 md:h-[40px] md:min-w-[120px] md:px-4 xl:h-[44px] xl:min-w-[151px]"
        >
          <XIcon />
          <span
            className="text-[13px] font-light md:text-[16px] xl:text-[22px]"
            dir="rtl"
          >
            رفض
          </span>
        </button>
      </div>
    </div>
  );
}
