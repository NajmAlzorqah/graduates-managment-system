import type { Metadata } from "next";
import CertificateStatusList from "@/components/staff/certificate-status-list";
import { getNotificationTemplates } from "@/lib/api/notification-templates";
import { getStudentsWithCertSteps } from "@/lib/api/students";

export const metadata: Metadata = {
  title: "حالة الشهادة | نظام إدارة الخريجين",
};

export default async function CertificateStatusPage() {
  const [students, templates] = await Promise.all([
    getStudentsWithCertSteps(true), // Exclude completed
    getNotificationTemplates(),
  ]);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-2">
      <CertificateStatusList students={students} templates={templates} />
    </div>
  );
}
