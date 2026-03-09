export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* TODO: Add staff sidebar from Figma design */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
