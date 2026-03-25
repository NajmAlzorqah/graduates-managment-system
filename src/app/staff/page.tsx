import { redirect } from "next/navigation";
import StaffTodoList from "@/components/staff/staff-todo-list";
import { getStaffHomeData } from "@/lib/api/staff-home";
import { auth } from "@/lib/auth";

type MetricCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
};

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-[#f4b24d] px-4 py-4 shadow-[0_6px_20px_rgba(0,0,0,0.12)] md:gap-4 md:rounded-3xl md:px-5 md:py-5 xl:px-6 xl:py-6">
      {/* Header row: title on right (RTL), icon on left */}
      <div className="flex items-start justify-between gap-2">
        <span className="flex shrink-0 items-center text-[#1a3b5c]">
          {icon}
        </span>
        <h2
          className="text-right text-[18px] font-semibold leading-tight text-[#1a3b5c] md:text-[22px] xl:text-[26px]"
          dir="rtl"
        >
          {title}
        </h2>
      </div>

      {/* Count bubble */}
      <div className="flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1a3b5c] text-[26px] font-semibold text-white md:h-[60px] md:w-[60px] md:text-[30px] xl:h-[68px] xl:w-[68px] xl:text-[34px]">
          {value}
        </div>
      </div>
    </article>
  );
}

export default async function StaffDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { stats, todoItems } = await getStaffHomeData(session.user.id);

  return (
    <div className="flex flex-col gap-5 md:gap-6 xl:gap-7">
      {/* Metric cards */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5 xl:gap-6"
        aria-label="Statistics"
      >
        <MetricCard
          title="الطلاب المسجلين اليوم"
          value={stats.registeredTodayCount}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 xl:h-10 xl:w-10"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 3h16a1 1 0 0 1 1 1v16h-2V5H5v15H3V4a1 1 0 0 1 1-1Zm3 4h10v2H7V7Zm0 4h10v2H7v-2Zm0 4h6v2H7v-2Z" />
            </svg>
          }
        />

        <MetricCard
          title="الشهادات قيد المراجعة"
          value={stats.certificatesUnderReviewCount}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 xl:h-10 xl:w-10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 2h10v3.5c0 2.15-.84 4.2-2.34 5.74L13.41 12l1.25.76A8.12 8.12 0 0 1 17 18.5V22H7v-3.5c0-2.15.84-4.2 2.34-5.74L10.59 12l-1.25-.76A8.12 8.12 0 0 1 7 5.5V2Z"
                stroke="#1a3b5c"
                strokeWidth="1.8"
              />
            </svg>
          }
        />

        <MetricCard
          title="الشهادات المعتمدة"
          value={stats.certificatesApprovedCount}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 xl:h-10 xl:w-10"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm5.02 7.32-5.74 7.34a1 1 0 0 1-1.5.1l-2.78-2.8 1.42-1.4 1.98 1.98 5.04-6.46Z" />
            </svg>
          }
        />
      </section>

      {/* To-do list */}
      <StaffTodoList
        initialTodos={todoItems}
        currentUserId={session.user.id}
        staffMembers={[
          { id: session.user.id, name: session.user.name || "Me" },
        ]}
      />
    </div>
  );
}
