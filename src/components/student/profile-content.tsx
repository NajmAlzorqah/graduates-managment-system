"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { updateOwnProfileAction } from "@/lib/actions/student";
import ProfileAvatarUpload from "@/components/student/profile-avatar-upload";

type ProfileContentProps = {
  nameAr: string;
  major: string;
  email: string;
  academicId: string;
  studentCardNumber: string;
  phone: string;
  avatarUrl: string | null;
};

function PhoneIcon() {
  return (
    <svg viewBox="0 0 41 44" fill="none" className="h-[44px] w-[41px]">
      <path
        d="M34.1667 27.5C34.1667 28.9483 33.725 30.3483 32.935 31.5283C31.5417 33.6417 29.3583 34.8333 27.5 34.8333C21.0833 34.8333 13.75 27.5 13.75 21.0833C13.75 19.225 14.9417 17.0417 17.055 15.6483C18.235 14.8583 19.635 14.4167 21.0833 14.4167C22.5317 14.4167 23.9317 14.8583 25.1117 15.6483C27.225 17.0417 28.4167 19.225 28.4167 21.0833L24.75 24.75C24.475 25.025 24.1083 25.1083 23.7417 25.025C23.0083 24.8417 22.0917 24.75 21.0833 24.75C19.0667 24.75 17.4167 26.4 17.4167 28.4167C17.4167 29.425 17.5083 30.3417 17.6917 31.075C17.775 31.4417 17.6917 31.8083 17.4167 32.0833L13.75 35.75C15.6083 37.8633 17.7917 39.055 19.65 39.055C21.0983 39.055 22.4983 38.6133 23.6783 37.8233C25.7917 36.43 26.9833 34.2467 26.9833 32.3883C26.9833 30.94 26.5417 29.54 25.7517 28.36L34.1667 27.5Z"
        stroke="#FFB755"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 35 28" fill="none" className="h-[28px] w-[35px]">
      <path
        d="M2.91666 2.91666H32.0833V25.0833H2.91666V2.91666Z"
        stroke="#FFB755"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.91666 5.83334L17.5 16.0417L32.0833 5.83334"
        stroke="#FFB755"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AcademicIcon() {
  return (
    <svg viewBox="0 0 38 28" fill="none" className="h-[28px] w-[38px]">
      <path
        d="M1.58334 11.0833L19 2.33334L36.4167 11.0833L19 19.8333L1.58334 11.0833Z"
        stroke="#FFB755"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.41666 14V22.75C7.41666 22.75 10.3333 25.6667 19 25.6667C27.6667 25.6667 30.5833 22.75 30.5833 22.75V14"
        stroke="#FFB755"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EditPencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[24px] w-[24px]">
      <path
        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const initialState: { success?: boolean; error?: string } = { success: false, error: "" };

export default function ProfileContent({
  nameAr,
  major,
  email,
  academicId,
  studentCardNumber,
  phone,
  avatarUrl,
}: ProfileContentProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [state, action] = useActionState(
    updateOwnProfileAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();

  // Optimistic UI states
  const [optimisticName, setOptimisticName] = useState(nameAr);
  const [optimisticPhone, setOptimisticPhone] = useState(phone);
  const [optimisticEmail, setOptimisticEmail] = useState(email);

  useEffect(() => {
    if (state?.success) {
      setIsEditModalOpen(false);
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    // Set optimistic values
    setOptimisticName(formData.get("nameAr") as string);
    setOptimisticPhone(formData.get("phone") as string);
    setOptimisticEmail(formData.get("email") as string);
    
    startTransition(() => {
      action(formData);
    });
  };

  const handleAvatarSelect = (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    
    startTransition(() => {
      action(formData);
    });
  };

  const handleAvatarDelete = () => {
    const formData = new FormData();
    formData.append("deleteImage", "true");
    
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-hidden bg-[#1a3b5c] px-[25px] pb-[100px] pt-[60px] text-white">
      {/* Background Decorations */}
      <div className="absolute left-[-20%] top-[60%] h-[300px] w-[300px] rounded-full bg-white opacity-5 blur-[100px]" />
      
      <header className="relative z-10 mb-[20px]" dir="rtl">
        <h1 className="text-center font-arabic text-[32px] font-bold leading-tight">
          الملف الشخصي
        </h1>
      </header>

      <section className="relative z-10 flex flex-col items-center">
        <ProfileAvatarUpload initialImageUrl={avatarUrl} onFileSelect={handleAvatarSelect} onDelete={handleAvatarDelete} />
        
        <div className="mt-[25px] text-center" dir="rtl">
          <h2 className="font-arabic text-[32px] font-bold leading-tight">
            {optimisticName || "-"}
          </h2>
          <p className="mt-[5px] font-arabic text-[24px] font-bold text-[#ffb755]">
            {major || "تقنية معلومات"}
          </p>
        </div>
      </section>

      <section className="relative z-10 mt-[30px] rounded-[39px] bg-white p-[30px] text-[#1a3b5c] shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <h3 className="mb-[25px] text-center font-arabic text-[26px] font-bold">
          بياناتي
        </h3>

        <div className="flex flex-col gap-[25px]" dir="rtl">
          <div className="flex items-center justify-between gap-[15px]">
            <PhoneIcon />
            <p className="text-[24px] font-bold leading-none ltr">
              {optimisticPhone || "777 *** ***"}
            </p>
          </div>
          <div className="flex items-center justify-between gap-[15px]">
            <MailIcon />
            <p className="break-all text-[22px] font-bold leading-tight ltr">
              {optimisticEmail}
            </p>
          </div>
          <div className="flex items-center justify-between gap-[15px]">
            <AcademicIcon />
            <p className="text-[24px] font-bold leading-none ltr">
              ID:{academicId}
            </p>
          </div>
        </div>

        <div className="mt-[35px] flex justify-start">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-[10px] rounded-[19px] bg-[#ffb755] px-[20px] py-[10px] font-arabic text-[22px] font-bold text-[#1a3b5c] shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)] transition-transform active:scale-95"
          >
            <EditPencilIcon />
            <span>تعديل</span>
          </button>
        </div>
      </section>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-[20px] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[380px] rounded-[30px] bg-white p-[25px] text-[#1a3b5c] shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="mb-[20px] text-center font-arabic text-[24px] font-bold">
              تعديل البيانات
            </h3>
            
            <form action={handleSubmit} className="flex flex-col gap-[15px]" dir="rtl">
              <div className="flex flex-col gap-[5px]">
                <label className="pr-[10px] font-arabic text-[14px] font-bold">الاسم بالعربية</label>
                <input
                  name="nameAr"
                  defaultValue={nameAr}
                  className="rounded-[15px] border-2 border-[#e9eef3] bg-[#f8fafc] px-[15px] py-[10px] text-right font-arabic outline-none focus:border-[#ffb755]"
                  placeholder="أدخل اسمك"
                />
              </div>
              
              <div className="flex flex-col gap-[5px]">
                <label className="pr-[10px] font-arabic text-[14px] font-bold">البريد الإلكتروني</label>
                <input
                  name="email"
                  defaultValue={email}
                  className="rounded-[15px] border-2 border-[#e9eef3] bg-[#f8fafc] px-[15px] py-[10px] text-right outline-none focus:border-[#ffb755] ltr"
                  placeholder="email@example.com"
                />
              </div>

              <div className="flex flex-col gap-[5px]">
                <label className="pr-[10px] font-arabic text-[14px] font-bold">رقم الهاتف</label>
                <input
                  name="phone"
                  defaultValue={phone}
                  className="rounded-[15px] border-2 border-[#e9eef3] bg-[#f8fafc] px-[15px] py-[10px] text-right outline-none focus:border-[#ffb755] ltr"
                  placeholder="777 000 000"
                />
              </div>

              {state?.error && (
                <p className="text-center font-arabic text-[14px] font-bold text-red-500">
                  {state.error}
                </p>
              )}

              <div className="mt-[10px] flex gap-[10px]">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-[15px] bg-[#1a3b5c] py-[12px] font-arabic text-[18px] font-bold text-white transition-all hover:bg-[#254b73] disabled:opacity-50"
                >
                  {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-[15px] bg-[#e9eef3] py-[12px] font-arabic text-[18px] font-bold text-[#1a3b5c] transition-all hover:bg-[#dce4ec]"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
