import { redirect } from "next/navigation";

export default function HomePage() {
  // TODO: When auth is wired, read session and redirect based on role:
  // - ADMIN  → /admin
  // - STAFF  → /staff
  // - STUDENT → /student
  // For now, redirect unauthenticated users to login
  redirect("/login");
}
