import type { CertificateStep } from "@/types/student";

type Props = {
  steps: CertificateStep[];
  className?: string;
};

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CertificateStatusCard({
  steps,
  className = "",
}: Props) {
  return (
    <div className={`bg-white rounded-[35px] px-6 py-6 ${className}`}>
      {/* Title */}
      <h2
        className="text-center text-[#1a3b5c] font-semibold text-xl mb-6 font-arabic"
        dir="rtl"
      >
        حالة الشهادة
      </h2>

      {/* Progress Tracker */}
      <div className="flex items-center justify-center mb-6 px-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            {/* Circle */}
            <div
              role="img"
              aria-label={step.status === "completed" ? "مكتمل" : "قيد التنفيذ"}
              className="w-12 h-12 rounded-full bg-[#ffb755] flex items-center justify-center shrink-0 shadow-sm"
            >
              {step.status === "completed" && (
                <CheckIcon className="text-[#1a3b5c]" />
              )}
            </div>
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="h-[3px] w-8 sm:w-12 bg-[#1a3b5c]" />
            )}
          </div>
        ))}
      </div>

      {/* Steps List */}
      <div className="space-y-3" dir="rtl">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center gap-3">
            {/* Status indicator — first child appears on RIGHT in RTL */}
            {step.status === "completed" ? (
              <div className="w-7 h-7 rounded-full bg-[#ffb755] flex items-center justify-center shrink-0 text-[#1a3b5c]">
                <CheckIcon />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#ffb755] shrink-0" />
            )}
            <span className="text-[#1a3b5c] font-medium text-base leading-snug font-arabic">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
