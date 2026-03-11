"use client";

import { useActionState, useEffect } from "react";
import ProfileAvatarUpload from "@/components/student/profile-avatar-upload";
import { updateOwnProfileAction } from "@/lib/actions/student";

type ProfileContentProps = {
  nameAr: string;
  major: string;
  email: string;
  academicId: string;
  studentCardNumber: string;
};

const initialState: { success?: boolean; error?: string } = {};

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[26px] w-[26px] text-[#f4b24d]"
      aria-hidden="true"
    >
      <path
        d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.5 2.8.7 4.2.7.7 0 1.2.5 1.2 1.2V21c0 .7-.5 1.2-1.2 1.2C10.9 22.2 1.8 13.1 1.8 1.2 1.8.5 2.3 0 3 0h4.1c.7 0 1.2.5 1.2 1.2 0 1.5.2 2.9.7 4.2.1.4 0 .8-.2 1.2l-2.2 2.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[26px] w-[26px] text-[#f4b24d]"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M3 6.2 12 13l9-6.8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function AcademicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[26px] w-[26px] text-[#f4b24d]"
      aria-hidden="true"
    >
      <path
        d="m2 9 10-5 10 5-10 5L2 9Zm4 3v5m12-5v5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function ProfileContent({
  nameAr,
  major,
  email,
  academicId,
  studentCardNumber,
}: ProfileContentProps) {
  const [state, action, pending] = useActionState(
    updateOwnProfileAction,
    initialState,
  );

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes profileFadeIn {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes floatAvatar {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
    `;
    document.head.append(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[430px] flex-col px-[14px] pb-[32px] pt-[16px] text-white">
      <header className="animate-[profileFadeIn_450ms_ease-out]" dir="rtl">
        <h1 className="text-center font-arabic text-[24px] font-bold leading-tight">
          الملف الشخصي
        </h1>
      </header>

      <section
        className="mt-[12px] flex flex-col items-center animate-[profileFadeIn_550ms_ease-out]"
        dir="rtl"
      >
        <ProfileAvatarUpload />
        <p className="mt-[14px] text-center font-arabic text-[28px] font-bold leading-none">
          {nameAr || "-"}
        </p>
        <p className="mt-[6px] text-center font-arabic text-[24px] font-bold text-[#f4b24d] leading-none">
          {major || "-"}
        </p>
      </section>

      <section className="mt-[20px] animate-[profileFadeIn_650ms_ease-out] rounded-[28px] bg-[#f7f7f7] px-[16px] py-[22px] text-[#1a3b5c] shadow-[0_10px_40px_rgba(0,0,0,0.16)]">
        <h2 className="text-center font-arabic text-[26px] font-bold">
          بياناتي
        </h2>

        <div className="mt-[20px] flex flex-col gap-[14px]" dir="rtl">
          <div className="flex items-center justify-between gap-[10px]">
            <PhoneIcon />
            <p className="text-[26px] font-bold leading-none">
              {studentCardNumber || "---"}
            </p>
          </div>
          <div className="flex items-center justify-between gap-[10px]">
            <MailIcon />
            <p className="break-all text-[24px] font-bold leading-none">
              {email}
            </p>
          </div>
          <div className="flex items-center justify-between gap-[10px]">
            <AcademicIcon />
            <p className="text-[26px] font-bold leading-none">
              ID:{academicId}
            </p>
          </div>
        </div>

        <details className="mt-[20px] rounded-[16px] bg-[#e9eef3] p-[10px]">
          <summary className="cursor-pointer select-none text-right font-arabic text-[13px] font-bold">
            تعديل البيانات
          </summary>
          <form
            action={action}
            className="mt-[10px] flex flex-col gap-[8px]"
            dir="rtl"
          >
            <input
              name="nameAr"
              defaultValue={nameAr}
              placeholder="الاسم"
              className="rounded-[12px] border border-[#cfd8e3] bg-white px-[12px] py-[6px] text-right text-[12px] outline-none ring-[#1a3b5c]/30 focus:ring-2"
            />
            <input
              name="email"
              defaultValue={email}
              placeholder="البريد الإلكتروني"
              className="rounded-[12px] border border-[#cfd8e3] bg-white px-[12px] py-[6px] text-right text-[12px] outline-none ring-[#1a3b5c]/30 focus:ring-2"
            />
            <input
              name="studentCardNumber"
              defaultValue={studentCardNumber}
              placeholder="رقم الهاتف"
              className="rounded-[12px] border border-[#cfd8e3] bg-white px-[12px] py-[6px] text-right text-[12px] outline-none ring-[#1a3b5c]/30 focus:ring-2"
            />
            {state?.error ? (
              <p className="text-right text-[12px] text-red-600">
                {state.error}
              </p>
            ) : null}
            {state?.success ? (
              <p className="text-right text-[12px] text-green-700">
                تم التحديث بنجاح
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-fit items-center gap-[6px] self-start rounded-full bg-[#f4b24d] px-[14px] py-[6px] font-arabic text-[14px] font-bold text-[#1a3b5c] shadow-[inset_0_4px_4px_rgba(0,0,0,0.16)] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-[16px] w-[16px]"
                aria-hidden="true"
              >
                <path
                  d="m14 4 6 6m-3.5-7.5a2.1 2.1 0 0 1 3 3L8 17l-4 1 1-4L16.5 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              تعديل
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
