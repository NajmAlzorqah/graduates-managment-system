import { mockStudents } from "@/lib/mock/students";
import type { Student } from "@/types/student";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getStudents(): Promise<Student[]> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/students`);
    return res.json() as Promise<Student[]>;
  }
  return mockStudents;
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/students/${id}`);
    return res.json() as Promise<Student>;
  }
  return mockStudents.find((s) => s.id === id);
}
