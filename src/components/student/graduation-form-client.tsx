"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StudentProfile } from "@/types/student";

interface GraduationFormClientProps {
  userId: string;
  profile: StudentProfile;
}

const SPECIALIZATIONS = [
  "IT",
  "Computer Science",
  "Software Engineering",
  "Information Systems",
];

export default function GraduationFormClient({
  userId,
  profile,
}: GraduationFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState("");
  const [passportName, setPassportName] = useState("");
  const [specialization, setSpecialization] = useState("IT");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [studentCardNumber, setStudentCardNumber] = useState("");
  const [graduationYear, setGraduationYear] = useState(
    new Date().getFullYear().toString(),
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPassportFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !fullName ||
      !passportName ||
      !passportFile ||
      !studentCardNumber ||
      !graduationYear
    ) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    startTransition(async () => {
      try {
        // 1. Upload Passport Document
        const formData = new FormData();
        formData.append("documentType", "PASSPORT");
        formData.append("label", "صورة جواز السفر");
        formData.append("file", passportFile);

        const uploadRes = await fetch(`/api/students/${userId}/documents`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("فشل رفع صورة جواز السفر");

        // 2. Submit Graduation Form
        const formRes = await fetch("/api/graduation-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            major: specialization,
            graduationYear: Number.parseInt(graduationYear, 10),
            studentCardNumber: studentCardNumber,
          }),
        });

        if (!formRes.ok) throw new Error("فشل إرسال النموذج");

        toast.success("تم استلام النموذج بنجاح");
        router.refresh();
        router.push("/student");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "حدث خطأ ما");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#1a3b5c] font-arabic pb-32" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-[#1a3b5c]"
              role="img"
              aria-label="User Avatar"
            >
              <title>User Avatar</title>
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <div className="flex flex-col">
            <p className="text-white font-bold text-lg leading-tight">
              {profile.nameAr}
            </p>
            <p className="text-[#ffb755] font-medium text-sm">
              {profile.department}
            </p>
          </div>
        </div>
        <Link
          href="/student"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
        >
          <ArrowLeft className="w-7 h-7 rotate-180" />
        </Link>
      </div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-t-[40px] px-6 pt-10 pb-12 mx-2"
      >
        <div className="text-center mb-10">
          <h1 className="text-[#1a3b5c] text-3xl font-bold mb-4">
            مرحبا {profile.nameAr.split(" ")[0]}
          </h1>
          <p className="text-[#1a3b5c] text-xl font-medium leading-relaxed">
            أولا قم بتعبئة الاستمارة
            <br />
            لتتمكن من تتبع شهادتك
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#ffb755] rounded-[35px] p-8 shadow-inner space-y-6"
        >
          <div className="space-y-3">
            <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
              الاسم الرباعي:
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-14 rounded-full border-none bg-white text-[#1a3b5c] text-lg px-6 shadow-sm"
              placeholder="ادخل الاسم الرباعي"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
              الاسم كما في جواز السفر :
            </Label>
            <Input
              value={passportName}
              onChange={(e) => setPassportName(e.target.value)}
              className="h-14 rounded-full border-none bg-white text-[#1a3b5c] text-lg px-6 shadow-sm"
              placeholder="ادخل الاسم بالانجليزية"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
                التخصص:
              </Label>
              <div className="relative">
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full h-14 rounded-full border-none bg-white text-[#1a3b5c] text-lg px-6 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-[#1a3b5c]/20"
                >
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1a3b5c] w-6 h-6 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
                رقم البطاقة الجامعية:
              </Label>
              <Input
                value={studentCardNumber}
                onChange={(e) => setStudentCardNumber(e.target.value)}
                className="h-14 rounded-full border-none bg-white text-[#1a3b5c] text-lg px-6 shadow-sm"
                placeholder="رقم البطاقة"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
              سنة التخرج:
            </Label>
            <Input
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="h-14 rounded-full border-none bg-white text-[#1a3b5c] text-lg px-6 shadow-sm"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
              صورة جواز السفر:
            </Label>
            <div className="relative h-14 bg-white rounded-full flex items-center px-6 shadow-sm overflow-hidden">
              <span className="flex-1 text-gray-400 text-lg truncate ml-4">
                {passportFile ? passportFile.name : "upload"}
              </span>
              <div className="flex items-center gap-2 text-[#1a3b5c]">
                <Upload className="w-6 h-6" />
                <span className="text-xl font-bold">upload</span>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
              />
            </div>
          </div>

          <div className="pt-6 flex justify-center">
            <Button
              type="submit"
              disabled={isPending}
              className="h-14 w-44 rounded-xl bg-[#1a3b5c] text-white text-2xl font-bold hover:bg-[#1a3b5c]/90 transition-all active:scale-95 shadow-lg"
            >
              {isPending ? "جاري الإرسال..." : "ارسال"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
