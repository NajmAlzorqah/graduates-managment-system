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
  const [accountType, setAccountType] = useState<AccountType>("student");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const action =
        accountType === "student" ? createStudentAction : createStaffUserAction;
      const result = await action(formData);
      if (result.success) {
        toast.success(
          accountType === "student"
            ? "تم إنشاء حساب الطالب بنجاح"
            : "تم إنشاء حساب الموظف بنجاح",
        );
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
          إنشاء حساب جديد
        </h1>

        {/* Account type selector */}
        <div
          className="mb-6 flex rounded-[29px] bg-[#ececec] p-1 md:mb-8"
          dir="rtl"
        >
          <button
            type="button"
            onClick={() => setAccountType("student")}
            className={`flex-1 rounded-[25px] py-2.5 text-sm font-bold transition-all md:text-base ${
              accountType === "student"
                ? "bg-[#1a3b5c] text-white shadow-sm"
                : "text-[#1a3b5c]/60 hover:text-[#1a3b5c]"
            }`}
          >
            طالب
          </button>
          <button
            type="button"
            onClick={() => setAccountType("staff")}
            className={`flex-1 rounded-[25px] py-2.5 text-sm font-bold transition-all md:text-base ${
              accountType === "staff"
                ? "bg-[#1a3b5c] text-white shadow-sm"
                : "text-[#1a3b5c]/60 hover:text-[#1a3b5c]"
            }`}
          >
            موظف
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5">
          {/* Name (English) */}
          <FormField
            label="الاسم (إنجليزي)"
            name="name"
            required
            placeholder="Full name in English"
          />

          {/* Arabic name */}
          <FormField
            label="الاسم (عربي)"
            name="nameAr"
            placeholder="الاسم الكامل بالعربية"
          />

          {/* Academic ID */}
          <FormField
            label="الرقم الجامعي"
            name="academicId"
            required
            placeholder="مثال: 2024001"
          />

          {/* Email */}
          <FormField
            label="البريد الإلكتروني"
            name="email"
            type="email"
            required
            placeholder="example@university.edu"
          />

          {/* Password */}
          <FormField
            label="كلمة المرور"
            name="password"
            type="password"
            required
            placeholder="8 أحرف على الأقل، تشمل أرقاماً وأحرفاً كبيرة وصغيرة"
          />

          {/* Student-only fields */}
          {accountType === "student" && (
            <>
              {/* Major */}
              <FormField label="التخصص" name="major">
                <select
                  id="major"
                  name="major"
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

              {/* Student card number */}
              <FormField
                label="رقم بطاقة الطالب"
                name="studentCardNumber"
                placeholder="مثال: SC-2024-001"
              />

              {/* Graduation year */}
              <FormField
                label="سنة التخرج"
                name="graduationYear"
                type="number"
                placeholder="مثال: 2026"
              />
            </>
          )}

          {/* Action buttons */}
          <div
            className="mt-2 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start"
            dir="rtl"
          >
            <button
              type="submit"
              disabled={isPending}
              className="flex h-[52px] items-center justify-center rounded-[29px] bg-[#ffb755] px-8 text-base font-bold text-white shadow-[0_4px_4px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#f0a535] disabled:opacity-60 md:px-10"
            >
              {isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isPending}
              className="flex h-[52px] items-center justify-center rounded-[29px] bg-[#ececec] px-8 text-base font-bold text-[#1a3b5c] transition-colors hover:bg-[#e0e0e0] disabled:opacity-60 md:px-10"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
