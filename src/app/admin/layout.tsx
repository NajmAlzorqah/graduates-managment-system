export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* TODO: Add admin sidebar from Figma design */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
