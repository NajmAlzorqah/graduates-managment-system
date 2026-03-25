import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      sentNotifications: true,
      reviewedDocuments: true,
      reviewedForms: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const data = [
    ["Name", user.name],
    ["Email", user.email],
    ["Academic ID", user.academicId],
    ["Role", user.role],
    ["Email Notifications", user.emailNotifications ? "Enabled" : "Disabled"],
    ["Site Notifications", user.siteNotifications ? "Enabled" : "Disabled"],
    ["Language", user.language],
    ["Theme", user.theme],
    ["Notifications Sent", user.sentNotifications.length],
    ["Documents Reviewed", user.reviewedDocuments.length],
    ["Forms Reviewed", user.reviewedForms.length],
  ];

  const csvContent = data.map((row) => row.join(",")).join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="staff-export-${session.user.id}.csv"`,
    },
  });
}
