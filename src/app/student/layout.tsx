export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* TODO: Add student sidebar from Figma design */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
