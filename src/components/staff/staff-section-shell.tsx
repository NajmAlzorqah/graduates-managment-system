type StaffSectionShellProps = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
};

export default function StaffSectionShell({
  title,
  subtitle,
  children,
}: StaffSectionShellProps) {
  return (
    <section className="space-y-5">
      <header className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(9,26,43,0.08)]">
        <h2 className="text-2xl font-bold text-[#1a3b5c] md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[#426385] md:text-base">{subtitle}</p>
      </header>

      {children ? children : null}
    </section>
  );
}
