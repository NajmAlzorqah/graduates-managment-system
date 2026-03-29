"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  createStaffUserAction,
  createStudentAction,
} from "@/lib/actions/staff-students";

const MAJORS = [
  "علوم الحاسوب",
  "نظم المعلومات",
  "هندسة البرمجيات",
  "الذكاء الاصطناعي",
  "الشبكات والأمن المعلوماتي",
  "الهندسة الكهربائية",
  "الهندسة المدنية",
  "الهندسة الميكانيكية",
  "إدارة الأعمال",
  "المحاسبة",
  "الاقتصاد",
  "الطب",
  "الصيدلة",
  "القانون",
  "أخرى",
];

type AccountType = "student" | "staff";

function FormField({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-right text-sm font-semibold text-[#1a3b5c] md:text-base"
        dir="rtl"
      >
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>
      {children ?? (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="h-[52px] w-full rounded-[29px] border-0 bg-white px-5 text-[#1a3b5c] placeholder-[#1a3b5c]/50 shadow-[0_4px_4px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-[#1a3b5c]/20 md:text-base"
          dir="rtl"
        />
      )}
    </div>
  );
}

export default function CreateAccountForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createStudentAction(formData);
      if (result.success) {
        toast.success("تم إنشاء حساب الطالب بنجاح");
        router.push("/staff/students");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Card */}
      <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:rounded-[40px] md:p-8 xl:p-10">
        {/* Header */}
        <h1
          className="mb-6 text-right text-[22px] font-bold text-[#1a3b5c] md:mb-8 md:text-[28px] xl:text-[32px]"
          dir="rtl"
        >
          إنشاء حساب طالب جديد
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {/* Arabic Name (Required) */}
            <FormField
              label="الاسم الكامل (عربي)"
              name="nameAr"
              required
              placeholder="الاسم الكامل بالعربية"
            />

            {/* English Name (Optional) */}
            <FormField
              label="الاسم الكامل (إنجليزي)"
              name="name"
              placeholder="Full Name in English (Optional)"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {/* Academic ID (Required) */}
            <FormField
              label="الرقم الجامعي"
              name="academicId"
              required
              placeholder="مثال: 2024001"
            />

            {/* Email (Optional) */}
            <FormField
              label="البريد الإلكتروني"
              name="email"
              type="email"
              placeholder="example@university.edu (اختياري)"
            />
          </div>

          {/* Password (Required) */}
          <FormField
            label="كلمة المرور"
            name="password"
            type="password"
            required
            placeholder="8 أحرف على الأقل، تشمل أرقاماً وأحرفاً"
          />

          {/* Student-only fields - Now always shown */}
          <div className="mt-2 space-y-4 rounded-2xl bg-[#f8f9fa] p-4 md:mt-3 md:space-y-5 md:p-6">
            <h3 className="text-right text-sm font-bold text-[#1a3b5c]/70 md:text-base">
              بيانات التخصص والحالة
            </h3>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {/* Major (Required for student) */}
              <FormField label="التخصص" name="major" required>
                <select
                  id="major"
                  name="major"
                  required
                  className="h-[52px] w-full cursor-pointer appearance-none rounded-[29px] border-0 bg-white px-5 text-[#1a3b5c] shadow-[0_4px_4px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-[#1a3b5c]/20 md:text-base"
                  dir="rtl"
                >
                  <option value="">اختر التخصص</option>
                  {MAJORS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Student card number (Optional) */}
              <FormField
                label="رقم بطاقة الطالب"
                name="studentCardNumber"
                placeholder="مثال: SC-2024-001"
              />

              {/* Graduation year (Optional) */}
              <FormField
                label="سنة التخرج"
                name="graduationYear"
                type="number"
                placeholder="مثال: 2026"
              >
                <input
                  id="graduationYear"
                  name="graduationYear"
                  type="number"
                  min={1999}
                  max={new Date().getFullYear() + 1}
                  placeholder="مثال: 2026"
                  className="h-[52px] w-full rounded-[29px] border-0 bg-white px-5 text-[#1a3b5c] placeholder-[#1a3b5c]/50 shadow-[0_4px_4px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-[#1a3b5c]/20 md:text-base"
                  dir="rtl"
                />
              </FormField>
            </div>
          </div>

          {/* Action buttons */}
          <div
            className="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start"
            dir="rtl"
          >
            <button
              type="submit"
              disabled={isPending}
              className="flex h-[52px] items-center justify-center rounded-[29px] bg-[#ffb755] px-12 text-base font-bold text-white shadow-[0_4px_12px_rgba(255,183,85,0.4)] transition-all hover:bg-[#f0a535] hover:shadow-[0_6px_16px_rgba(255,183,85,0.5)] disabled:opacity-60 md:text-lg"
            >
              {isPending ? "جاري الإنشاء..." : "إنشاء حساب الطالب"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isPending}
              className="flex h-[52px] items-center justify-center rounded-[29px] bg-[#ececec] px-8 text-base font-bold text-[#1a3b5c] transition-colors hover:bg-[#e0e0e0] disabled:opacity-60"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
