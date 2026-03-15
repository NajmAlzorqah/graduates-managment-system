import AdminReportsTable from "@/components/admin/admin-reports-table";
import { getReports } from "@/lib/api/reports";

export default async function AdminReportsPage() {
  const reports = await getReports();

  return (
    <div className="flex-1">
      <AdminReportsTable rows={reports} />
    </div>
  );
}
