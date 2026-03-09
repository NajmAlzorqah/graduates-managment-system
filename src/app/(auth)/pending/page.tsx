import { Tajawal } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500"],
  display: "swap",
});

const universityLogo =
  "http://localhost:3845/assets/877a5d886b0f7cc527bec70476465f07316a8bf3.png";

export default function PendingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1a3b5c] md:justify-center md:gap-8 md:py-12 md:px-4">
      {/* Top bar: back arrow + logo */}
      <div className="relative flex items-center justify-center pt-8 pb-4 md:pt-0 md:pb-0">
        {/* Back arrow */}
        <Link
          href="/register"
          aria-label="Go back to sign up"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:opacity-75 transition-opacity md:left-0"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 5L9 14l9 9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* University logo */}
        <div className="relative w-[160px] h-[160px] sm:w-[180px] sm:h-[180px]">
          <Image
            src={universityLogo}
            alt="Al-Nasser University"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="
          relative mx-3 mb-6 rounded-[32px] overflow-hidden
          sm:mx-6
          md:mx-auto md:w-full md:max-w-[480px] md:mb-0
        "
      >
        {/* White backdrop layer (visible as a thin border effect) */}
        <div className="absolute inset-0 bg-white rounded-[32px]" />

        {/* Amber card */}
        <div
          className="
            relative bg-[#ffb755] rounded-[24px] mx-[10px] mt-[10px] mb-[10px]
            px-6 py-10
            sm:px-10
            shadow-[inset_0px_4px_8px_rgba(0,0,0,0.15)]
          "
        >
          {/* Arabic content — RTL */}
          <div
            dir="rtl"
            className={`${tajawal.className} text-[#1a3b5c] text-center flex flex-col gap-4`}
          >
            {/* Title */}
            <p className="text-[28px] sm:text-[32px] font-medium leading-tight">
              عزيزي الطالب
            </p>

            {/* Body lines */}
            <div className="text-[22px] sm:text-[26px] font-normal leading-relaxed space-y-1">
              <p>يرجى الانتظار</p>
              <p>حتى يتم التحقق من حسابك</p>
              <p>بواسطة شؤون الخريجين</p>
              <p>سيتم ارسال اشعار</p>
              <p>عبر الايميل فور التحقق</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
