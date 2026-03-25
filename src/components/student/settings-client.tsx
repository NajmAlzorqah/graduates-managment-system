"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bell,
  ChevronLeft,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Moon,
  Pencil,
  Sun,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/logout";
import {
  changeEmailAction,
  changePasswordAction,
  updateUserSettingsAction,
} from "@/lib/actions/student-settings";
import {
  type ChangeEmailInput,
  type ChangePasswordInput,
  changeEmailSchema,
  changePasswordSchema,
} from "@/lib/validations/student-settings";

interface SettingsClientProps {
  initialSettings: {
    email: string;
    emailNotifications: boolean;
    siteNotifications: boolean;
    language: string;
    theme: string;
  };
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[35px] p-5 shadow-lg flex flex-col gap-4 w-full">
      <h2 className="text-[#1a3b5c] text-xl font-bold font-arabic text-right px-2">
        {title}
      </h2>
      <div className="bg-[#ffb755] rounded-[25px] p-5 flex flex-col gap-4 shadow-inner">
        {children}
      </div>
    </div>
  );
}

function Toggle({
  isOn,
  onToggle,
  label,
  icon: Icon,
}: {
  isOn: boolean;
  onToggle: () => void;
  label: string;
  icon: any;
}) {
  return (
    <div className="flex items-center justify-between w-full py-1">
      <div className="flex items-center gap-3">
        <div className="text-[#1a3b5c]">
          <Icon size={20} />
        </div>
        <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
          {label}
        </span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-7 w-[52px] items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1a3b5c] focus:ring-offset-2 p-1 group ${
          isOn ? "bg-[#1a3b5c]" : "bg-gray-300"
        }`}
        dir="ltr"
      >
        <span className="sr-only">{label}</span>

        {/* On Label */}
        <span
          className={`absolute left-[7px] text-[9px] font-black uppercase tracking-tighter transition-all duration-300 pointer-events-none ${
            isOn
              ? "opacity-100 translate-x-0 text-white"
              : "opacity-0 -translate-x-2"
          }`}
        >
          on
        </span>

        {/* Off Label */}
        <span
          className={`absolute right-[7px] text-[9px] font-black uppercase tracking-tighter transition-all duration-300 pointer-events-none ${
            !isOn
              ? "opacity-100 translate-x-0 text-gray-500"
              : "opacity-0 translate-x-2"
          }`}
        >
          off
        </span>

        {/* Thumb */}
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.45,0.05,0.55,0.95)] ${
            isOn ? "translate-x-6" : "translate-x-0"
          } group-active:scale-90`}
        />
      </button>
    </div>
  );
}

function RadioOption({
  selected,
  onSelect,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selected ? "border-[#1a3b5c] bg-white" : "border-white"}`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#1a3b5c]" />}
      </div>
      <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
        {label}
      </span>
    </button>
  );
}

export default function SettingsClient({
  initialSettings,
}: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [optimisticSettings, setOptimisticSettings] = useOptimistic(
    initialSettings,
    (state, update: Partial<typeof initialSettings>) => ({
      ...state,
      ...update,
    }),
  );

  const handleUpdateSetting = (update: Partial<typeof initialSettings>) => {
    startTransition(async () => {
      setOptimisticSettings(update);
      const result = await updateUserSettingsAction(update as any);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم تحديث الإعدادات");
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <div
      className="flex flex-col px-5 pt-8 pb-10 gap-6 w-full max-w-[430px] mx-auto min-h-screen bg-[#1a3b5c]"
      dir="rtl"
    >
      <h1 className="text-white text-3xl font-bold font-arabic text-center mb-4">
        الاعدادات
      </h1>

      {/* Account Settings */}
      <SectionCard title="اعدادات الحساب :">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
              تغيير كلمة المرور
            </span>
            <Lock size={20} className="text-[#1a3b5c]" />
          </div>
          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Pencil size={20} className="text-[#1a3b5c]" />
          </button>
        </div>

        <div className="h-px w-full bg-[#1a3b5c]/10"></div>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
              تغيير الايميل
            </span>
            <Mail size={20} className="text-[#1a3b5c]" />
          </div>
          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Pencil size={20} className="text-[#1a3b5c]" />
          </button>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="إعدادات الإشعارات:">
        <Toggle
          label="إشعارات البريد"
          icon={Mail}
          isOn={optimisticSettings.emailNotifications}
          onToggle={() =>
            handleUpdateSetting({
              emailNotifications: !optimisticSettings.emailNotifications,
            })
          }
        />
        <div className="h-px w-full bg-[#1a3b5c]/10"></div>
        <Toggle
          label="التنبيهات داخل الموقع"
          icon={Bell}
          isOn={optimisticSettings.siteNotifications}
          onToggle={() =>
            handleUpdateSetting({
              siteNotifications: !optimisticSettings.siteNotifications,
            })
          }
        />
      </SectionCard>

      {/* Interface Settings */}
      <SectionCard title="إعدادات الواجهة:">
        <div className="flex items-center justify-between w-full py-1">
          <div className="flex items-center gap-3">
            <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
              اختيار اللغة
            </span>
            <Globe size={20} className="text-[#1a3b5c]" />
          </div>
          <div className="flex gap-4">
            <RadioOption
              label="English"
              selected={optimisticSettings.language === "en"}
              onSelect={() => handleUpdateSetting({ language: "en" })}
            />
            <RadioOption
              label="عربي"
              selected={optimisticSettings.language === "ar"}
              onSelect={() => handleUpdateSetting({ language: "ar" })}
            />
          </div>
        </div>

        <div className="h-px w-full bg-[#1a3b5c]/10"></div>

        <div className="flex items-center justify-between w-full py-1">
          <div className="flex items-center gap-3">
            <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
              ثيم الموقع
            </span>
            <div className="text-[#1a3b5c]">
              {optimisticSettings.theme === "light" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <RadioOption
              label="ليلي"
              selected={optimisticSettings.theme === "dark"}
              onSelect={() => handleUpdateSetting({ theme: "dark" })}
            />
            <RadioOption
              label="نهاري"
              selected={optimisticSettings.theme === "light"}
              onSelect={() => handleUpdateSetting({ theme: "light" })}
            />
          </div>
        </div>
      </SectionCard>

      {/* Logout */}
      <div className="bg-white rounded-[35px] p-5 shadow-lg flex flex-col gap-4 w-full mb-10">
        <h2 className="text-[#1a3b5c] text-xl font-bold font-arabic text-right px-2">
          الحساب :
        </h2>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="bg-[#ffb755] rounded-[25px] p-5 flex items-center justify-between shadow-inner hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <div className="text-white">
            <ChevronLeft size={24} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#1a3b5c] text-xl font-bold font-arabic">
              تسجيل الخروج
            </span>
            <LogOut size={24} className="text-white" />
          </div>
        </button>
      </div>

      {/* Modals */}
      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
      {isEmailModalOpen && (
        <ChangeEmailModal
          currentEmail={optimisticSettings.email}
          onClose={() => setIsEmailModalOpen(false)}
          onSuccess={(_newEmail) => {
            // Since email change is a formal update that might trigger logout or re-auth,
            // we should probably let the modal handle its own state or refresh.
            // But for the sake of the UI update:
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("currentPassword", data.currentPassword);
      formData.append("newPassword", data.newPassword);
      formData.append("confirmPassword", data.confirmPassword);

      const result = await changePasswordAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم تغيير كلمة المرور بنجاح");
        onClose();
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-[#1a3b5c] hover:opacity-70"
        >
          <X size={24} />
        </button>

        <h3 className="mb-6 text-2xl font-bold text-[#1a3b5c] font-arabic">
          تغيير كلمة المرور
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#1a3b5c] font-bold font-arabic">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              {...register("currentPassword")}
              className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb755]"
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500 font-arabic">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#1a3b5c] font-bold font-arabic">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              {...register("newPassword")}
              className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb755]"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500 font-arabic">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#1a3b5c] font-bold font-arabic">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb755]"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 font-arabic">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-4 bg-[#1a3b5c] hover:bg-[#1a3b5c]/90 text-white rounded-xl py-6 text-lg font-bold font-arabic"
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "تحديث كلمة المرور"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ChangeEmailModal({
  currentEmail,
  onClose,
  onSuccess,
}: {
  currentEmail: string;
  onClose: () => void;
  onSuccess: (email: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: currentEmail },
  });

  const onSubmit = (data: ChangeEmailInput) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("newEmail", data.newEmail);

      const result = await changeEmailAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم تغيير البريد الإلكتروني بنجاح");
        onSuccess(data.newEmail);
        onClose();
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-[#1a3b5c] hover:opacity-70"
        >
          <X size={24} />
        </button>

        <h3 className="mb-6 text-2xl font-bold text-[#1a3b5c] font-arabic">
          تغيير البريد الإلكتروني
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#1a3b5c] font-bold font-arabic">
              البريد الإلكتروني الجديد
            </label>
            <input
              type="email"
              {...register("newEmail")}
              className="rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#ffb755]"
            />
            {errors.newEmail && (
              <p className="text-sm text-red-500 font-arabic">
                {errors.newEmail.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="mt-4 bg-[#1a3b5c] hover:bg-[#1a3b5c]/90 text-white rounded-xl py-6 text-lg font-bold font-arabic"
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "تحديث البريد الإلكتروني"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
