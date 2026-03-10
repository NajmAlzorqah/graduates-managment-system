import type { StudentHomeData } from "@/types/student";

export const mockStudentHomeData: StudentHomeData = {
  profile: {
    id: "1",
    nameAr: "صالح مصلح المصلوح",
    department: "تقنية معلومات",
  },
  certificateSteps: [
    { id: "1", label: "تعبئة الاستمارة", status: "completed" },
    { id: "2", label: "التأكد من بيانات الاستمارة", status: "completed" },
    { id: "3", label: "ارسال الشهادة للتعليم العالي", status: "in-progress" },
    { id: "4", label: "المصادقة على الشهادة", status: "in-progress" },
  ],
  documents: [
    { id: "1", label: "الاسم باللغة العربية", status: "accepted" },
    { id: "2", label: "الاسم باللغة الانجليزية", status: "accepted" },
    { id: "3", label: "شهادة الثانوية", status: "accepted" },
    { id: "4", label: "جواز السفر", status: "accepted" },
  ],
};
