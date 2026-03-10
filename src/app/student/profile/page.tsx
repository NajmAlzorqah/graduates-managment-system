import LogoutButton from "@/components/ui/logout-button";

export default function StudentProfilePage() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-5"
      dir="rtl"
    >
      <p className="text-white font-semibold text-lg font-arabic">
        الملف الشخصي
      </p>
      <p className="text-white/50 text-sm font-arabic">قريباً</p>
      <LogoutButton />
    </div>
  );
}
