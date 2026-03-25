import AdminReportsTable from "@/components/admin/admin-reports-table";
import StaffTodoList from "@/components/staff/staff-todo-list";
import { getStaffMembers, getStaffTodos } from "@/lib/actions/staff-todo";
import { getReports } from "@/lib/api/reports";

export default async function AdminReportsPage() {
  const reports = await getReports();
  const todos = await getStaffTodos();
  const staffMembers = await getStaffMembers();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex-1">
        <AdminReportsTable rows={reports} />
      </div>

      <div className="mt-8">
        <StaffTodoList
          initialTodos={todos}
          staffMembers={staffMembers}
          isAdmin={true}
        />
      </div>
    </div>
  );
}
