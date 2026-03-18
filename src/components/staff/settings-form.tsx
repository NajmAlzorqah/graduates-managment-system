"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Languages,
  LockKeyhole,
  Mail,
  PenLine,
  SunMedium,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState, useTransition, useOptimistic } from "react";
import toast from "react-hot-toast";

import AnimatedSwitch from "@/components/ui/animated-switch";
import { updateStaffPreferences } from "@/lib/actions/staff";
import { cn } from "@/lib/utils";
import UpdateNameModal from "./update-name-modal";
import UpdatePasswordModal from "./update-password-modal";

type NotificationPreference = "on" | "off";
type LanguagePreference = "ar" | "en";
type ThemePreference = "light" | "dark";

type StaffSettingsState = {
  emailNotifications: NotificationPreference;
  siteNotifications: NotificationPreference;
  language: LanguagePreference;
  theme: ThemePreference;
};

const DEFAULT_SETTINGS: StaffSettingsState = {
  emailNotifications: "on",
  siteNotifications: "on",
  language: "ar",
  theme: "light",
};

const SWITCH_OPTIONS = {
  notification: [
    { label: "on", value: "on" },
    { label: "off", value: "off" },
  ] as const,
  language: [
    { label: "عربي", value: "ar" },
    { label: "English", value: "en" },
  ] as const,
  theme: [
    { label: "فاتح", value: "light" },
    { label: "داكن", value: "dark" },
  ] as const,
};

function applyDocumentPreferences(settings: Partial<StaffSettingsState>) {
  if (typeof document === "undefined") return;
  if (settings.language) {
    const isArabic = settings.language === "ar";
    document.documentElement.lang = isArabic ? "ar" : "en";
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
  }
  if (settings.theme) {
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark",
    );
  }
}

function SettingsCard({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="rounded-[28px] bg-white p-[12px] shadow-[0_8px_20px_rgba(8,26,48,0.2)] md:p-[18px]"
    >
      <h2 className="mb-2 px-2 text-right font-['Tajawal',sans-serif] text-[28px] leading-none text-[#1a3b5c] md:mb-3 md:text-[32px]">
        {title}
      </h2>
      <div className="rounded-[24px] bg-[#f7b34d] p-3 shadow-[inset_0_4px_6px_rgba(0,0,0,0.12)] md:p-4">
        {children}
      </div>
    </motion.section>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  action,
  danger = false,
  noBorder = false,
}: {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action: React.ReactNode;
  danger?: boolean;
  noBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-2 md:flex-row md:items-center md:justify-between",
        !noBorder && "border-b border-[#1a3b5c]/12",
      )}
    >
      <div className="flex items-start justify-end gap-3 text-right">
        <div className="pt-1 text-[#ffffff]">{icon}</div>
        <div>
          <p
            className={cn(
              "font-['Tajawal',sans-serif] text-[24px] leading-tight text-[#1a3b5c] md:text-[28px]",
              danger && "text-[#8c4f00]",
            )}
          >
            {label}
          </p>
          {description && (
            <p className="mt-1 max-w-[540px] font-['Tajawal',sans-serif] text-[15px] text-[#26496e]/85 md:text-[16px]">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-start md:justify-end">{action}</div>
    </div>
  );
}

function ActionIconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-[#1a3b5c]/8 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#1a3b5c]/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3b5c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7b34d]"
    >
      {children}
    </button>
  );
}

interface SettingsFormProps {
  initialSettings: StaffSettingsState | null;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const { data: session, update } = useSession();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isNameModalOpen, setNameModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const baseSettings = initialSettings ?? DEFAULT_SETTINGS;

  const [optimisticSettings, setOptimisticSettings] = useOptimistic(
    baseSettings,
    (state, update: Partial<StaffSettingsState>) => ({
      ...state,
      ...update,
    })
  );

  useEffect(() => {
    applyDocumentPreferences(baseSettings);
    setHasLoaded(true);
  }, [baseSettings]);

  const handleSettingChange = <K extends keyof StaffSettingsState>(
    key: K,
    value: StaffSettingsState[K],
  ) => {
    startTransition(async () => {
      setOptimisticSettings({ [key]: value });
      applyDocumentPreferences({ [key]: value });

      if (key === "emailNotifications" || key === "siteNotifications") {
        const result = await updateStaffPreferences({
          emailNotifications: key === "emailNotifications" ? (value as NotificationPreference) : optimisticSettings.emailNotifications,
          siteNotifications: key === "siteNotifications" ? (value as NotificationPreference) : optimisticSettings.siteNotifications,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Preferences updated successfully.");
        }
      } else {
        toast.success(`${key.replace(/([A-Z])/g, " $1").trim()} updated.`);
        if (key === "language") {
          document.location.reload();
        }
      }
    });
  };

  if (!hasLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-24">
        <SettingsCard title="الحساب" delay={0.1}>
          <SettingsRow
            icon={<PenLine size={28} />}
            label="تعديل الاسم"
            description={`الاسم الحالي: ${session?.user?.name ?? "..."}`}
            action={
              <ActionIconButton
                label="تعديل الاسم"
                onClick={() => setNameModalOpen(true)}
              >
                <PenLine size={24} />
              </ActionIconButton>
            }
          />
          <SettingsRow
            icon={<LockKeyhole size={28} />}
            label="تغيير كلمة المرور"
            description="ننصح باستخدام كلمة مرور قوية وتغييرها بشكل دوري"
            action={
              <ActionIconButton
                label="تغيير كلمة المرور"
                onClick={() => setPasswordModalOpen(true)}
              >
                <LockKeyhole size={24} />
              </ActionIconButton>
            }
            noBorder
            danger
          />
        </SettingsCard>

        <SettingsCard title="الإشعارات" delay={0.2}>
          <SettingsRow
            icon={<Mail size={28} />}
            label="إشعارات البريد الإلكتروني"
            description="تلقي التحديثات الهامة والأخبار عبر البريد الإلكتروني"
            action={
              <AnimatedSwitch
                ariaLabel="إشعارات البريد الإلكتروني"
                options={[...SWITCH_OPTIONS.notification]}
                value={optimisticSettings.emailNotifications}
                onChange={(value) =>
                  handleSettingChange(
                    "emailNotifications",
                    value as NotificationPreference,
                  )
                }
              />
            }
          />
          <SettingsRow
            icon={<Bell size={28} />}
            label="الإشعارات داخل الموقع"
            description="إظهار الإشعارات والتنبيهات أثناء تصفحك للموقع"
            action={
              <AnimatedSwitch
                ariaLabel="الإشعارات داخل الموقع"
                options={[...SWITCH_OPTIONS.notification]}
                value={optimisticSettings.siteNotifications}
                onChange={(value) =>
                  handleSettingChange(
                    "siteNotifications",
                    value as NotificationPreference,
                  )
                }
              />
            }
            noBorder
          />
        </SettingsCard>

        <SettingsCard title="التخصيص" delay={0.3}>
          <SettingsRow
            icon={<Languages size={28} />}
            label="لغة الواجهة"
            action={
              <AnimatedSwitch
                ariaLabel="لغة الواجهة"
                options={[...SWITCH_OPTIONS.language]}
                value={optimisticSettings.language}
                onChange={(value) =>
                  handleSettingChange("language", value as LanguagePreference)
                }
              />
            }
          />
          <SettingsRow
            icon={<SunMedium size={28} />}
            label="السمة"
            action={
              <AnimatedSwitch
                ariaLabel="السمة"
                options={[...SWITCH_OPTIONS.theme]}
                value={optimisticSettings.theme}
                onChange={(value) =>
                  handleSettingChange("theme", value as ThemePreference)
                }
              />
            }
            noBorder
          />
        </SettingsCard>
      </div>
      <UpdateNameModal
        isOpen={isNameModalOpen}
        onClose={() => {
          setNameModalOpen(false);
          update(); // Force session update to reflect new name
        }}
        currentName={session?.user?.name ?? ""}
      />
      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
