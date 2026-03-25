"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Download,
  Globe,
  LockKeyhole,
  Mail,
  Moon,
  PenLine,
  Sun,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useOptimistic, useState, useTransition } from "react";
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
  language: "en",
  theme: "light",
};

const SWITCH_OPTIONS = {
  notification: [
    { label: "on", value: "on" },
    { label: "off", value: "off" },
  ] as const,
  language: [
    { label: "Arabic", value: "ar" },
    { label: "English", value: "en" },
  ] as const,
  theme: [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ] as const,
};

function applyDocumentPreferences(settings: Partial<StaffSettingsState>) {
  if (typeof document === "undefined") return;
  if (settings.theme) {
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark",
    );
  }
}

function SettingsSection({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="w-full rounded-[25px] bg-white p-4 shadow-[0_4px_4px_rgba(0,0,0,0.25)] md:p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-[#1a3b5c] md:text-[24px]">
          {title}:
        </h2>
      </div>
      <div className="overflow-hidden rounded-[28px] bg-[#ffb755] p-1 shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col">{children}</div>
      </div>
    </motion.section>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  action,
  isLast = false,
}: {
  icon: any;
  label: string;
  value?: string;
  action: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-4 md:px-6",
        !isLast && "border-b border-[#1a3b5c]/10",
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-[#1a3b5c]">
          <Icon size={24} />
        </div>
        <div className="flex flex-col">
          <span className="text-[18px] font-bold text-[#1a3b5c] md:text-[20px]">
            {label}
          </span>
          {value && (
            <span className="text-[14px] text-[#1a3b5c]/70 md:text-[16px]">
              {value}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">{action}</div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon: Icon,
  variant = "primary",
}: {
  onClick: () => void;
  icon: any;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
        variant === "primary"
          ? "bg-[#1a3b5c] text-white"
          : "bg-white/30 text-[#1a3b5c]",
      )}
    >
      <Icon size={20} />
    </button>
  );
}

interface SettingsFormProps {
  initialSettings: StaffSettingsState | null;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const { data: session, update } = useSession();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [_isPending, startTransition] = useTransition();
  const [isNameModalOpen, setNameModalOpen] = useState(false);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const baseSettings = initialSettings ?? DEFAULT_SETTINGS;

  const [optimisticSettings, setOptimisticSettings] = useOptimistic(
    baseSettings,
    (state, update: Partial<StaffSettingsState>) => ({
      ...state,
      ...update,
    }),
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

      const result = await updateStaffPreferences({ [key]: value });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${key.replace(/([A-Z])/g, " $1").trim()} updated.`);
        if (key === "language") {
          // Temporarily reload to apply language if it was implemented,
          // but we are keeping it in English for now.
          // window.location.reload();
        }
      }
    });
  };

  const handleExportData = async () => {
    toast.loading("Preparing your data for export...", { id: "export" });
    try {
      const response = await fetch("/api/staff/export");
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `staff-export-${session?.user?.id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Your data has been exported successfully.", {
        id: "export",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data. Please try again later.", {
        id: "export",
      });
    }
  };

  if (!hasLoaded) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1a3b5c] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 pb-12">
      {/* Account Settings */}
      <SettingsSection title="Account Settings" delay={0.1}>
        <SettingsRow
          icon={User}
          label="Update Name"
          value={session?.user?.name ?? "..."}
          action={
            <ActionButton
              onClick={() => setNameModalOpen(true)}
              icon={PenLine}
            />
          }
        />
        <SettingsRow
          icon={LockKeyhole}
          label="Password"
          value="Change or reset your password"
          isLast
          action={
            <ActionButton
              onClick={() => setPasswordModalOpen(true)}
              icon={PenLine}
            />
          }
        />
      </SettingsSection>

      {/* Notifications Settings */}
      <SettingsSection title="Notification Settings" delay={0.2}>
        <SettingsRow
          icon={Mail}
          label="Email Notifications"
          action={
            <AnimatedSwitch
              ariaLabel="Email Notifications"
              options={[...SWITCH_OPTIONS.notification]}
              value={optimisticSettings.emailNotifications}
              onChange={(v) =>
                handleSettingChange("emailNotifications", v as any)
              }
            />
          }
        />
        <SettingsRow
          icon={Bell}
          label="Site Notifications"
          isLast
          action={
            <AnimatedSwitch
              ariaLabel="Site Notifications"
              options={[...SWITCH_OPTIONS.notification]}
              value={optimisticSettings.siteNotifications}
              onChange={(v) =>
                handleSettingChange("siteNotifications", v as any)
              }
            />
          }
        />
      </SettingsSection>

      {/* Interface Settings */}
      <SettingsSection title="Interface Settings" delay={0.3}>
        <SettingsRow
          icon={Globe}
          label="Choose Language"
          action={
            <div className="relative">
              <AnimatedSwitch
                ariaLabel="Choose Language"
                options={[...SWITCH_OPTIONS.language]}
                value="en" // Hardcoded to English
                onChange={() =>
                  toast.error("Language selection is temporarily disabled.")
                }
                className="opacity-50 grayscale cursor-not-allowed"
              />
            </div>
          }
        />
        <SettingsRow
          icon={optimisticSettings.theme === "light" ? Sun : Moon}
          label="Theme"
          isLast
          action={
            <AnimatedSwitch
              ariaLabel="Theme"
              options={[...SWITCH_OPTIONS.theme]}
              value={optimisticSettings.theme}
              onChange={(v) => handleSettingChange("theme", v as any)}
            />
          }
        />
      </SettingsSection>

      {/* Advanced Settings */}
      <SettingsSection title="Advanced Settings" delay={0.4}>
        <SettingsRow
          icon={Download}
          label="Export Data"
          value="Download your account data"
          isLast
          action={
            <ActionButton
              onClick={handleExportData}
              icon={Download}
              variant="secondary"
            />
          }
        />
      </SettingsSection>

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
    </div>
  );
}
