import { redirect } from "next/navigation";
import CertificateStatusCard from "@/components/student/certificate-status-card";
import DocumentsStatusCard from "@/components/student/documents-status-card";
import FirstLoginScreen from "@/components/student/first-login-screen";
import { getGraduationForm } from "@/lib/api/graduation-forms";
import { getStudentHomeData } from "@/lib/api/student-home";
import { auth } from "@/lib/auth";

function UserAvatarIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export default async function StudentHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const form = await getGraduationForm(session.user.id);

  const { profile, certificateSteps, documents } = await getStudentHomeData(
    session.user.id,
  );

  if (!form || form.status === "DRAFT") {
    // Show the first login screen for students needing to submit their form
    return (
      <FirstLoginScreen
        userId={session.user.id}
        name={profile.nameAr || "طالب"}
        department={profile.department || ""}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 px-5 pt-10 pb-4" dir="rtl">
        {/* Avatar — first child in RTL flex-row = right side */}
        <div className="w-20 h-20 rounded-full bg-[#ffb755] flex items-center justify-center shrink-0 shadow-md">
          <UserAvatarIcon className="w-10 h-10 text-[#1a3b5c]" />
        </div>
        {/* Name & Department */}
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-white font-bold text-xl leading-tight font-arabic truncate">
            {profile.nameAr}
          </p>
          <p className="text-[#ffb755] font-medium text-sm font-arabic">
            {profile.department}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-5 px-3">
        <CertificateStatusCard steps={certificateSteps} />
        <DocumentsStatusCard documents={documents} />
      </div>
    </div>
  );
}
