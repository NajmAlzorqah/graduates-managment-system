import Image from "next/image";
import RegisterForm from "@/components/auth/register-form";
import universityLogo from "../../../../public/logo.png";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#1a3b5c] md:justify-center md:gap-8 md:py-12 md:px-4">
      {/* Logo — fills top area on mobile, fixed size above card on desktop */}
      <div className="flex flex-none items-center justify-center pt-10 pb-4 md:pt-0 md:pb-0">
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

      {/* Card — slides up from bottom on mobile, centred box on desktop */}
      <div
        className="
          bg-[#F5A623]
          rounded-t-[48px] px-6 pt-8 pb-10
          flex flex-col gap-0
          sm:px-10
          md:rounded-[40px] md:mx-auto md:w-full md:max-w-[460px] md:px-10 md:py-10
        "
      >
        <h1 className="text-[#1a3b5c] text-2xl sm:text-[28px] font-bold text-center mb-6">
          sign up
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
}
