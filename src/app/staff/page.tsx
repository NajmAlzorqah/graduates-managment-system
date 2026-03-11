import { getStaffHomeData } from "@/lib/api/staff-home";

type MetricCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
};

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <article className="min-h-[130px] rounded-2xl border-2 border-white bg-[#f4b24d] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.15)] md:min-h-[152px] md:px-5 md:py-4 xl:min-h-[158px]">
      <div className="flex items-start justify-between gap-3">
        <h2
          className="text-right text-base leading-[1.1] font-semibold text-[#1a3b5c] md:text-[24px] xl:text-[32px]"
          dir="rtl"
        >
          {title}
        </h2>
        <span className="mt-1 shrink-0 text-[#1a3b5c] md:mt-0">{icon}</span>
      </div>

      <div className="mt-3 flex justify-center md:mt-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-[#465b72] text-[30px] font-medium text-white md:size-[58px] md:text-[34px] xl:size-[62px] xl:text-[36px]">
          {value}
        </div>
      </div>
    </article>
  );
}

export default async function StaffDashboardPage() {
  const { stats, todoItems } = await getStaffHomeData();

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 xl:gap-8 xl:grid-cols-3">
        <MetricCard
          title="عدد الطلاب المسجلين اليوم"
          value={stats.registeredTodayCount}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="size-6 md:size-8 xl:size-10"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 3h16a1 1 0 0 1 1 1v16h-2V5H5v15H3V4a1 1 0 0 1 1-1Zm3 4h10v2H7V7Zm0 4h10v2H7v-2Zm0 4h6v2H7v-2Z" />
            </svg>
          }
        />

        <MetricCard
          title="عدد الشهادات قيد المراجعة"
          value={stats.certificatesUnderReviewCount}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="size-6 md:size-8 xl:size-10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 2h10v3.5c0 2.15-.84 4.2-2.34 5.74L13.41 12l1.25.76A8.12 8.12 0 0 1 17 18.5V22H7v-3.5c0-2.15.84-4.2 2.34-5.74L10.59 12l-1.25-.76A8.12 8.12 0 0 1 7 5.5V2Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          }
        />

        <MetricCard
          title="عدد الشهادات المصادق عليها"
          value={stats.certificatesApprovedCount}
          icon={
            <svg
              viewBox="0 0 24 24"
              className="size-6 md:size-8 xl:size-10"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm5.02 7.32-5.74 7.34a1 1 0 0 1-1.5.1l-2.78-2.8 1.42-1.4 1.98 1.98 5.04-6.46Z" />
            </svg>
          }
        />
      </section>

      <section className="rounded-[30px] bg-[#f2f2f2] p-3 shadow-[inset_0_0_0_1px_rgba(26,59,92,0.08)] md:rounded-[56px] md:p-7 xl:p-8">
        <h2 className="mb-4 text-center text-2xl font-semibold text-[#1a3b5c] md:mb-5 md:text-[36px]">
          To do list
        </h2>

        <div className="space-y-3 md:space-y-4">
          {todoItems.map((item) => (
            <article
              key={item.id}
              className="flex min-h-[74px] items-center gap-3 rounded-[24px] bg-[#1f456f] px-4 py-3 text-white md:min-h-[105px] md:px-6 md:py-4 xl:min-h-[106px]"
            >
              <div
                className="flex flex-col gap-1 text-[#f2f2f2]"
                aria-hidden="true"
              >
                <span className="size-1.5 rounded-full bg-current md:size-2" />
                <span className="size-1.5 rounded-full bg-current md:size-2" />
                <span className="size-1.5 rounded-full bg-current md:size-2" />
              </div>

              <p
                className="flex-1 text-right text-sm leading-[1.35] md:text-[30px] md:leading-[1.2] xl:text-[34px]"
                dir="rtl"
              >
                {item.label}
              </p>

              <input
                type="checkbox"
                checked={item.completed}
                readOnly
                aria-label={`Mark ${item.label} as completed`}
                className="size-8 shrink-0 cursor-default appearance-none rounded-sm border border-[#ccd5dd] bg-[#f4f4f4] md:size-[40px]"
              />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
