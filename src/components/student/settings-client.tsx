"use client";

import { useState } from "react";

function EditIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#1a3b5c]"
      role="img"
      aria-label="Edit Icon"
    >
      <title>Edit</title>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  );
}

function Toggle({
  isOn,
  onToggle,
  label,
}: {
  isOn: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between w-full py-2">
      <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
        {label}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="relative inline-flex h-8 w-[68px] items-center rounded-full bg-[#1a3b5c] shadow-inner"
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
            isOn ? "-translate-x-[38px]" : "-translate-x-1"
          }`}
        />
        <span
          className={`absolute text-sm font-semibold text-white transition-opacity ${isOn ? "right-2" : "right-2 opacity-0"}`}
        >
          on
        </span>
        <span
          className={`absolute text-sm font-semibold text-white transition-opacity ${!isOn ? "left-2" : "left-2 opacity-0"}`}
        >
          off
        </span>
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
      className="flex items-center gap-2"
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? "border-[#1a3b5c]" : "border-white"}`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#1a3b5c]" />}
      </div>
      <span className="text-white text-lg font-bold font-arabic">{label}</span>
    </button>
  );
}

export default function SettingsClient() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [siteNotifs, setSiteNotifs] = useState(false);
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div
      className="flex flex-col px-5 pt-8 pb-10 gap-6 w-full max-w-md mx-auto"
      dir="rtl"
    >
      <h1 className="text-white text-3xl font-bold font-arabic text-center mb-2">
        الاعدادات
      </h1>

      {/* Account Settings */}
      <div className="bg-white rounded-[25px] p-4 shadow-md flex flex-col gap-3">
        <h2 className="text-[#1a3b5c] text-xl font-bold font-arabic px-2">
          اعدادات الحساب :
        </h2>
        <div className="bg-[#ffb755] rounded-[20px] p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
              تغيير كلمة المرور
            </span>
            <button
              type="button"
              className="flex items-center justify-center transition-opacity hover:opacity-70"
            >
              <EditIcon />
            </button>
          </div>
          <div className="h-px w-full bg-[#1a3b5c]/10"></div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[#1a3b5c] text-lg font-bold font-arabic">
              تغيير الايميل
            </span>
            <button
              type="button"
              className="flex items-center justify-center transition-opacity hover:opacity-70"
            >
              <EditIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-[25px] p-4 shadow-md flex flex-col gap-3">
        <div className="bg-[#ffb755] rounded-[20px] p-4 flex flex-col gap-2">
          <Toggle
            label="إشعارات البريد"
            isOn={emailNotifs}
            onToggle={() => setEmailNotifs(!emailNotifs)}
          />
          <div className="h-px w-full bg-[#1a3b5c]/10"></div>
          <Toggle
            label="التنبيهات داخل الموقع"
            isOn={siteNotifs}
            onToggle={() => setSiteNotifs(!siteNotifs)}
          />
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-[25px] p-4 shadow-md flex flex-col gap-3">
        <div className="bg-[#ffb755] rounded-[20px] p-4 flex justify-around items-center">
          <RadioOption
            label="عربي"
            selected={language === "ar"}
            onSelect={() => setLanguage("ar")}
          />
          <RadioOption
            label="English"
            selected={language === "en"}
            onSelect={() => setLanguage("en")}
          />
        </div>
      </div>

      {/* Theme */}
      <div className="bg-white rounded-[25px] p-4 shadow-md flex flex-col gap-3">
        {/* Note: In the design the theme section has an inner shadow on the orange box */}
        <div className="bg-[#ffb755] rounded-[20px] p-4 flex justify-around items-center shadow-[inset_0px_4px_4px_rgba(0,0,0,0.1)]">
          <RadioOption
            label="نهاري"
            selected={theme === "light"}
            onSelect={() => setTheme("light")}
          />
          <RadioOption
            label="ليلي"
            selected={theme === "dark"}
            onSelect={() => setTheme("dark")}
          />
        </div>
      </div>
    </div>
  );
}
