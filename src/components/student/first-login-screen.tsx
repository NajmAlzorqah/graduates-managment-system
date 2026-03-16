"use client";

import Link from "next/link";

interface FirstLoginScreenProps {
  userId: string;
  name: string;
  department: string;
}

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
  name,
  department,
}: FirstLoginScreenProps) {
  const trimmedName = name.trim();
  const firstName = trimmedName ? (trimmedName.split(" ")[0] ?? "") : "";

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
            <Link
              href="/student/graduation-form"
              className="inline-flex items-center justify-center gap-2 bg-[#1a3b5c] text-white w-full py-4 rounded-xl font-bold text-lg hover:bg-opacity-90 transition-colors shadow-md"
            >
              <span>تعبئة النموذج</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
