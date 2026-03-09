import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect root to login — after auth is wired, redirect based on role
  redirect("/login");
}
