import CertificateStatusList from "@/components/staff/certificate-status-list";
import StaffSectionShell from "@/components/staff/staff-section-shell";
import { getStudentsWithCertSteps } from "@/lib/api/students";

export default async function StaffCertificatesPage() {
  const students = await getStudentsWithCertSteps();
  const majors = [
    ...new Set(students.map((s) => s.major).filter(Boolean)),
  ] as string[];

  return (
    <StaffSectionShell
      title="Certificate Status"
      subtitle="Live overview of graduation certificate processing"
    >
      <CertificateStatusList students={students} majors={majors} />
    </StaffSectionShell>
  );
}
