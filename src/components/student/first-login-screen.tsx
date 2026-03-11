"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface FirstLoginScreenProps {
  userId: string;
  name: string;
  department: string;
}

type FormState = {
  fullName: string;
  passportName: string;
  major: string;
  graduationYear: string;
  studentCardNumber: string;
  passportFile: File | null;
  highSchoolFile: File | null;
};

const initialFormState: FormState = {
  fullName: "",
  passportName: "",
  major: "",
  graduationYear: "",
  studentCardNumber: "",
  passportFile: null,
  highSchoolFile: null,
};

const progressSteps = [
  "تعبئة الاستمارة",
  "التأكد من بيانات الاستمارة",
  "ارسال الشهادة للتعليم العالي",
  "المصادقة على الشهادة",
] as const;

function UserAvatarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export default function FirstLoginScreen({
  userId,
  name,
  department,
}: FirstLoginScreenProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<FormState>({
    ...initialFormState,
    major: department,
  });

  const trimmedName = name.trim();
  const firstName = trimmedName ? (trimmedName.split(" ")[0] ?? "") : "";

  function openFormModal() {
    setError("");
    setIsOpen(true);
  }

  function closeFormModal() {
    if (isSubmitting) return;
    setIsOpen(false);
  }

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key],
  ) {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }

  async function uploadStudentDocument(
    documentType: "PASSPORT" | "HIGH_SCHOOL_CERT",
    label: string,
    file: File,
  ): Promise<void> {
    const data = new FormData();
    data.append("documentType", documentType);
    data.append("label", label);
    data.append("file", file);

    const response = await fetch(`/api/students/${userId}/documents`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      throw new Error("فشل رفع المستندات. حاول مرة أخرى.");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const parsedYear = Number(formState.graduationYear);
    if (
      !formState.fullName.trim() ||
      !formState.passportName.trim() ||
      !formState.major.trim() ||
      !formState.studentCardNumber.trim() ||
      !formState.passportFile ||
      !formState.highSchoolFile ||
      Number.isNaN(parsedYear)
    ) {
      setError("يرجى تعبئة كل الحقول المطلوبة وإرفاق الملفات.");
      return;
    }

    if (parsedYear < 2000 || parsedYear > 2100) {
      setError("سنة التخرج يجب أن تكون بين 2000 و 2100.");
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadStudentDocument(
        "PASSPORT",
        "صورة جواز السفر",
        formState.passportFile,
      );
      await uploadStudentDocument(
        "HIGH_SCHOOL_CERT",
        "شهادة الثانوية",
        formState.highSchoolFile,
      );

      const response = await fetch("/api/graduation-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major: formState.major,
          graduationYear: parsedYear,
          studentCardNumber: formState.studentCardNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("تعذر إرسال النموذج. يرجى المحاولة مرة أخرى.");
      }

      setIsOpen(false);
      setFormState({ ...initialFormState, major: formState.major });
      router.refresh();
      router.push("/student");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "حدث خطأ غير متوقع أثناء الإرسال.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a3b5c] font-arabic relative overflow-hidden pb-24">
      {/* Profile Header */}
      <div className="flex items-center gap-4 px-6 pt-12 pb-6" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-[#ffb755] flex items-center justify-center shrink-0 shadow-lg">
          <UserAvatarIcon className="w-8 h-8 text-[#1a3b5c]" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-white font-bold text-lg leading-tight truncate">
            {name}
          </p>
          <p className="text-[#ffb755] font-medium text-sm">{department}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-t-[36px] mx-2 px-6 pt-8 pb-12 flex flex-col items-center">
        {/* Welcome Text */}
        <div className="text-center mb-8 w-full max-w-sm">
          <h1 className="text-[#1a3b5c] text-2xl font-bold mb-2">
            مرحباً {firstName}
          </h1>
          <p className="text-[#1a3b5c] text-lg font-medium leading-relaxed">
            أولاً قم بتعبئة الاستمارة
            <br />
            لتتمكن من تتبع شهادتك
          </p>
        </div>

        {/* Steps List */}
        <div className="w-full max-w-sm flex flex-col gap-4 mb-10 mt-2 px-2">
          {progressSteps.map((step, idx) => (
            <div key={step} className="flex items-center gap-4 text-[#1a3b5c]">
              <div className="w-8 h-8 rounded-full bg-[#ffb755] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                {idx + 1}
              </div>
              <span className="text-lg font-semibold">{step}</span>
            </div>
          ))}
        </div>

        {/* Action Form Card / Button */}
        <div className="w-full max-w-sm mt-auto">
          <div className="bg-[#ffb755] rounded-[28px] p-6 text-center shadow-lg transform transition-transform hover:scale-[1.02]">
            <h2 className="text-[#1a3b5c] text-xl font-bold mb-2">
              خطوتك الأخيرة نحو التخرج تبدأ هنا
            </h2>
            <p className="text-[#1a3b5c] font-medium mb-6 text-sm">
              أهلاً بك في نظام إدارة الخريجين. يرجى ملء نموذج التخرج للبدء.
            </p>
            <button
              type="button"
              onClick={openFormModal}
              className="inline-flex items-center justify-center gap-2 bg-[#1a3b5c] text-white w-full py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-colors shadow-md"
            >
              <span>تعبئة النموذج</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          onClick={closeFormModal}
          className="absolute inset-0 bg-black/40"
          aria-label="إغلاق النافذة"
        />

        <div
          className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px] rounded-t-[28px] bg-white px-4 pt-5 pb-6 shadow-2xl transition-transform duration-300 ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="graduation-form-title"
        >
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-300" />
          <h3
            id="graduation-form-title"
            className="mb-4 text-center text-xl font-bold text-[#1a3b5c]"
          >
            تعبئة الاستمارة
          </h3>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#1a3b5c]">
                الاسم الرباعي
              </span>
              <input
                type="text"
                value={formState.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1a3b5c] focus:outline-none"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#1a3b5c]">
                الاسم كما في جواز السفر
              </span>
              <input
                type="text"
                value={formState.passportName}
                onChange={(event) =>
                  updateField("passportName", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1a3b5c] focus:outline-none"
                required
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-[#1a3b5c]">
                  التخصص
                </span>
                <input
                  type="text"
                  value={formState.major}
                  onChange={(event) => updateField("major", event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1a3b5c] focus:outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-[#1a3b5c]">
                  سنة التخرج
                </span>
                <input
                  type="number"
                  min={2000}
                  max={2100}
                  value={formState.graduationYear}
                  onChange={(event) =>
                    updateField("graduationYear", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1a3b5c] focus:outline-none"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#1a3b5c]">
                رقم البطاقة الجامعية
              </span>
              <input
                type="text"
                value={formState.studentCardNumber}
                onChange={(event) =>
                  updateField("studentCardNumber", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#1a3b5c] focus:outline-none"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#1a3b5c]">
                صورة جواز السفر
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) =>
                  updateField("passportFile", event.target.files?.[0] ?? null)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-[#1a3b5c] file:px-3 file:py-1 file:text-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-[#1a3b5c]">
                شهادات الثانوية
              </span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) =>
                  updateField("highSchoolFile", event.target.files?.[0] ?? null)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-[#1a3b5c] file:px-3 file:py-1 file:text-white"
                required
              />
            </label>

            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={closeFormModal}
                className="h-11 flex-1 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                disabled={isSubmitting}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="h-11 flex-1 rounded-xl bg-[#1a3b5c] text-sm font-semibold text-white transition-colors hover:bg-[#14314d] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري الإرسال..." : "إرسال"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
