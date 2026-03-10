import { mockStudentHomeData } from "@/lib/mock/student-home";
import type { StudentHomeData } from "@/types/student";

export async function getStudentHomeData(): Promise<StudentHomeData> {
  // MOCK — swap body when backend is ready:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student/home`);
  // return res.json() as Promise<StudentHomeData>;
  return mockStudentHomeData;
}
