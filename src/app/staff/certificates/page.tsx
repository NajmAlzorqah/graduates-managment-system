import type { Metadata } from "next";
import CertificateStatusList from "@/components/staff/certificate-status-list";
import { getNotificationTemplates } from "@/lib/api/notification-templates";
import { getStudentsWithCertSteps } from "@/lib/api/students";

export const metadata: Metadata = {
  title: "حالة الشهادة | نظام إدارة الخريجين",
};

export default async function CertificateStatusPage() {
  const [students, templates] = await Promise.all([
    getStudentsWithCertSteps(),
    getNotificationTemplates(),
  ]);

  return (
    <div className="max-w-[1200px] mx-auto">
      <CertificateStatusList students={students} templates={templates} />
    </div>
  );
}
