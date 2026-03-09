import { mockStudents } from "@/lib/mock/students";
import type { Student } from "@/types/student";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function getStudents(): Promise<Student[]> {
  // MOCK: swap this body when backend is ready
  // return fetch(`${API_BASE}/api/students`).then(res => res.json());
  return mockStudents;
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  // MOCK: swap this body when backend is ready
  // return fetch(`${API_BASE}/api/students/${id}`).then(res => res.json());
  return mockStudents.find((s) => s.id === id);
}
