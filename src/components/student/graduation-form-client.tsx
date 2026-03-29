"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ChevronDown, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GraduationForm } from "@/types/graduation-form";

interface GraduationFormClientProps {
  userId: string;
  profile: {
    id: string;
    nameAr: string;
    name: string;
    major: string;
    studentCardNumber: string;
    graduationYear: string;
    department: string;
    phone: string;
  };
  currentForm: GraduationForm | null;
}

export default function GraduationFormClient({
  userId,
  profile,
  currentForm,
}: GraduationFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullNameAr, setFullNameAr] = useState(profile.nameAr || "");
  const [fullNameEn, setFullNameEn] = useState(profile.name || "");
  const [countryCode, setCountryCode] = useState("+967");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [graduationYear, setGraduationYear] = useState(profile.graduationYear);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isEditing, setIsEditing] = useState(
    !currentForm || currentForm.status === "REJECTED",
  );

  const status = currentForm?.status || "DRAFT";

  // If rejected, redirect back to home so they can start over
  if (status === "REJECTED") {
    router.replace("/student");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (Images only: JPEG, PNG)
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("يرجى اختيار صورة فقط (JPEG, PNG)");
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          "حجم الملف كبير جداً. يرجى ضغط الصورة لتكون أقل من 5 ميجابايت قبل الرفع.",
        );
        e.target.value = ""; // Reset input
        return;
      }
      setPassportFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Quadruple name and Arabic letters validation
    const parts = fullNameAr.trim().split(/\s+/).filter(Boolean);
    if (parts.length !== 4 || !/^[\u0621-\u064A\s]+$/.test(fullNameAr)) {
      toast.error("الاسم بالعربي يجب أن يكون رباعي وبالحروف العربية فقط");
      return;
    }

    // English name validation (English letters only)
    if (!/^[a-zA-Z\s]+$/.test(fullNameEn)) {
      toast.error("الاسم الإنجليزي يجب أن يحتوي على حروف إنجليزية فقط");
      return;
    }

    // Graduation year validation
    const year = Number.parseInt(graduationYear, 10);
    const currentYear = new Date().getFullYear();
    if (Number.isNaN(year) || year < 1999 || year > currentYear + 1) {
      toast.error("سنة التخرج يجب أن تكون بين 1999 و السنة الحالية + 1");
      return;
    }

    // Phone number validation (exactly 9 digits after codes)
    if (!/^\d{9}$/.test(phoneNumber)) {
      toast.error("يجب إدخال 9 أرقام بالضبط لرقم الهاتف");
      return;
    }

    if (!agreedToTerms) {
      toast.error("يجب الموافقة على صحة البيانات");
      return;
    }

    if (
      !fullNameAr ||
      !fullNameEn ||
      (!passportFile && !currentForm) ||
      !graduationYear
    ) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    startTransition(async () => {
      try {
        // 1. Upload Passport Document (if changed)
        if (passportFile) {
          const formData = new FormData();
          formData.append("documentType", "PASSPORT");
          formData.append("label", "صورة جواز السفر");
          formData.append("file", passportFile);

          const uploadRes = await fetch(`/api/students/${userId}/documents`, {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) throw new Error("فشل رفع صورة جواز السفر");
        }

        // 2. Submit Graduation Form
        const formRes = await fetch("/api/graduation-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullNameAr,
            fullNameEn,
            countryCode,
            phoneNumber,
            major: profile.major,
            graduationYear: Number.parseInt(graduationYear, 10),
            studentCardNumber: profile.studentCardNumber,
            agreedToTerms,
          }),
        });

        if (!formRes.ok) throw new Error("فشل إرسال النموذج");

        toast.success("تم استلام النموذج بنجاح");
        router.refresh();
        setIsEditing(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "حدث خطأ ما");
      }
    });
  };

  const handleConfirm = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/graduation-form/confirm", {
          method: "POST",
        });
        if (!res.ok) throw new Error("فشل تأكيد النموذج");
        toast.success("تم تأكيد النموذج بنجاح");
        router.refresh();
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
              {fullNameAr || profile.nameAr}
            </p>
            <p className="text-[#ffb755] font-medium text-sm">
              {profile.major}
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
            {status === "APPROVED"
              ? "تم اعتماد النموذج"
              : status === "SUBMITTED"
                ? "النموذج قيد المراجعة"
                : status === "NEEDS_CONFIRMATION"
                  ? "يرجى تأكيد بياناتك"
                  : "تعبئة استمارة التخرج"}
          </h1>
          <p className="text-[#1a3b5c] text-xl font-medium leading-relaxed">
            {status === "APPROVED"
              ? "لقد قمت بتأكيد جميع بياناتك بنجاح"
              : status === "SUBMITTED"
                ? "سنقوم بمراجعة بياناتك وإخبارك بالنتيجة"
                : status === "NEEDS_CONFIRMATION"
                  ? "تأكد من صحة البيانات أدناه ثم اضغط تأكيد"
                  : "أولا قم بتعبئة الاستمارة لتتمكن من تتبع شهادتك"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#ffb755] rounded-[35px] p-8 shadow-inner space-y-6"
        >
          <div className="space-y-3">
            <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
              اسم الطالب (بالعربي): رباعي كامل كما هو في شهادة الثانوية
            </Label>
            <Input
              value={fullNameAr}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\u0621-\u064A\s]/g, "");
                setFullNameAr(val);
              }}
              disabled={!isEditing}
              className="h-14 rounded-full border-none bg-white disabled:bg-white/50 text-[#1a3b5c] text-lg px-6 shadow-sm"
              placeholder="ادخل الاسم الرباعي بالعربي"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
              اسم الطالب (بالإنجليزي): يفضل كما في جواز السفر إن وجد
            </Label>
            <Input
              value={fullNameEn}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                setFullNameEn(val);
              }}
              disabled={!isEditing}
              className="h-14 rounded-full border-none bg-white disabled:bg-white/50 text-[#1a3b5c] text-lg px-6 shadow-sm"
              placeholder="Enter name in English"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
              رقم الهاتف:
            </Label>
            <div
              className={`flex h-14 w-full items-center rounded-full bg-white shadow-sm overflow-hidden ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="relative h-full shrink-0 border-l border-gray-100">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={!isEditing}
                  className="h-full bg-transparent pr-10 pl-4 text-[#1a3b5c] text-lg font-bold outline-none appearance-none cursor-pointer"
                >
                  <option value="+967">+967</option>
                  <option value="+966">+966</option>
                  <option value="+971">+971</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a3b5c] w-5 h-5 pointer-events-none" />
              </div>

              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 9) setPhoneNumber(val);
                }}
                disabled={!isEditing}
                className="h-full flex-1 bg-transparent px-6 text-[#1a3b5c] text-lg font-bold outline-none placeholder:text-gray-400 placeholder:font-normal"
                placeholder="ادخل 9 أرقام"
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
              min={1999}
              max={new Date().getFullYear() + 1}
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              disabled={!isEditing}
              className="h-14 rounded-full border-none bg-white disabled:bg-white/50 text-[#1a3b5c] text-lg px-6 shadow-sm"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[#1a3b5c] text-xl font-bold mr-2">
              ادرج صورة الجواز ان وجد :
            </Label>
            <div
              className={`relative h-14 bg-white rounded-full flex items-center px-6 shadow-sm overflow-hidden ${!isEditing ? "bg-white/50 cursor-not-allowed" : ""}`}
            >
              <span className="flex-1 text-gray-400 text-lg truncate ml-4">
                {passportFile
                  ? passportFile.name
                  : status !== "DRAFT"
                    ? "مرفوع مسبقاً"
                    : "اختيار صورة الجواز"}
              </span>
              <div className="flex items-center gap-2 text-[#1a3b5c]">
                <Upload className="w-6 h-6" />
                <span className="text-xl font-bold">رفع</span>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/jpg"
                disabled={!isEditing}
                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                required={!currentForm}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Checkbox
              id="agreed"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              disabled={!isEditing}
              className="w-6 h-6 rounded-md bg-white border-none data-[state=checked]:bg-[#1a3b5c]"
            />
            <Label
              htmlFor="agreed"
              className="text-[#1a3b5c] text-lg font-bold cursor-pointer"
            >
              أتحمل صحة البيانات الخاصة بالاسم العربي والإنجليزي
            </Label>
          </div>

          <div className="pt-6 flex flex-col items-center gap-4">
            {isEditing ? (
              <Button
                type="submit"
                disabled={isPending}
                className="h-14 w-44 rounded-xl bg-[#1a3b5c] text-white text-2xl font-bold hover:bg-[#1a3b5c]/90 transition-all active:scale-95 shadow-lg"
              >
                {isPending ? "جاري الإرسال..." : "ارسال"}
              </Button>
            ) : status === "NEEDS_CONFIRMATION" ? (
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="h-14 w-44 rounded-xl bg-[#1a3b5c] text-white text-2xl font-bold hover:bg-[#1a3b5c]/90 transition-all active:scale-95 shadow-lg"
                >
                  {isPending ? "جاري التأكيد..." : "تأكيد"}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isPending}
                  className="h-14 w-44 rounded-xl bg-white text-[#1a3b5c] text-2xl font-bold hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
                >
                  تعديل
                </Button>
              </div>
            ) : status === "SUBMITTED" ? (
              <div className="text-[#1a3b5c] font-bold text-xl bg-white/20 px-8 py-4 rounded-2xl">
                بانتظار مراجعة الموظف...
              </div>
            ) : status === "APPROVED" ? (
              <div className="text-[#1a3b5c] font-bold text-xl bg-green-500/20 px-8 py-4 rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                <span>تم الاعتماد بنجاح</span>
              </div>
            ) : null}
          </div>
        </form>

        {/* Notes Section */}
        <div className="mt-12 space-y-6 bg-blue-50/50 p-8 rounded-[35px] border border-blue-100">
          <h2 className="text-[#1a3b5c] text-2xl font-bold flex items-center gap-2">
            <span className="w-2 h-8 bg-[#ffb755] rounded-full" />
            ملاحظات هامة:
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-3 text-[#1a3b5c] text-lg leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-[#ffb755] shrink-0 mt-2.5" />
              <span>
                الطلاب الراغبين بإحضار صور شخصية حديثة عدد (6) لوثائق التخرج
                عليهم بسرعة تسليمها للأرشيف.
              </span>
            </li>
            <li className="flex gap-3 text-[#1a3b5c] text-lg leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-[#ffb755] shrink-0 mt-2.5" />
              <span>
                الطلاب الذين لديهم أخطاء في البيانات الشخصية (الاسم، تاريخ
                الميلاد، مكان الميلاد) في مؤهل الثانوية سرعة التصحيح لمؤهلات
                الثانوية.
              </span>
            </li>
            <li className="flex gap-3 text-[#1a3b5c] text-lg leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-[#ffb755] shrink-0 mt-2.5" />
              <span>
                على جميع الطلاب الاطلاع على النتائج والمراجعة حتى لا يكون هناك
                أخطاء أو نتائج لم يتم إدخالها.
              </span>
            </li>
            <li className="flex gap-3 text-[#1a3b5c] text-lg leading-relaxed font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-2.5" />
              <span>
                تعبئة هذه الاستمارة ضرورية لكل طالب خريج ويتحمل أي طالب مسؤولية
                عدم تعبئتها.
              </span>
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
