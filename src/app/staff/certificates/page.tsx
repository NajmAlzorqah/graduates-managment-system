import StaffSectionShell from "@/components/staff/staff-section-shell";
import { getAllForms } from "@/lib/api/graduation-forms";

export default async function StaffCertificatesPage() {
  const [underReview, approved, rejected] = await Promise.all([
    getAllForms("UNDER_REVIEW"),
    getAllForms("APPROVED"),
    getAllForms("REJECTED"),
  ]);

  return (
    <StaffSectionShell
      title="Certificate status"
      subtitle="Live overview of graduation certificate processing"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-[24px] bg-[#1a3b5c] p-5 text-white shadow-[0_10px_26px_rgba(9,26,43,0.25)]">
          <p className="text-sm text-white/80">Under review</p>
          <p className="mt-2 text-4xl font-bold">{underReview.length}</p>
        </article>

        <article className="rounded-[24px] bg-[#f4b24d] p-5 text-[#1a3b5c] shadow-[0_10px_26px_rgba(9,26,43,0.2)]">
          <p className="text-sm text-[#1a3b5c]/80">Approved</p>
          <p className="mt-2 text-4xl font-bold">{approved.length}</p>
        </article>

        <article className="rounded-[24px] bg-[#cfe0f1] p-5 text-[#1a3b5c] shadow-[0_10px_26px_rgba(9,26,43,0.12)]">
          <p className="text-sm text-[#1a3b5c]/80">Rejected</p>
          <p className="mt-2 text-4xl font-bold">{rejected.length}</p>
        </article>
      </div>
    </StaffSectionShell>
  );
}
