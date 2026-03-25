"use client";

export default function CertificateReadyCard() {
  return (
    <div className="bg-white rounded-[35px] px-8 py-10 shadow-lg border-2 border-[#ffb755] flex flex-col items-center text-center gap-6">
      {/* Icon */}
      <div className="w-24 h-24 rounded-full bg-[#ffb755] flex items-center justify-center shadow-md animate-bounce">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1a3b5c"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-4">
        <p className="text-[#1a3b5c] font-bold text-2xl font-arabic leading-tight">
          شهادتك جاهزة. يرجى مراجعة الجامعة والتواصل مع مكتب الخريجين.
        </p>
        <p className="text-[#1a3b5c] font-semibold text-lg leading-snug">
          Your certificate is ready. Please visit the university and contact the
          graduation office.
        </p>
      </div>

      {/* Optional decorative element */}
      <div className="w-16 h-1 bg-[#ffb755] rounded-full" />
    </div>
  );
}
