"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type SendNotificationData,
  sendNewNotificationAction,
} from "@/lib/actions/staff-notifications";
import type { StudentBasicInfo } from "@/types/student";

type RecipientType = "all" | "group" | "single" | "none";

type NewNotificationFormProps = {
  students?: StudentBasicInfo[];
};

const checkboxCheckmarkImage =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E\")";

export default function NewNotificationForm({
  students,
}: NewNotificationFormProps) {
  const studentList = students ?? [];
  const storageKey = "staff_notification_templates";

  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("all");

  // Single student selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentBasicInfo | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Group selection
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  // Quick templates
  const [templates, setTemplates] = useState<string[]>([]);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState("");

  const majors = useMemo(
    () =>
      [...new Set(studentList.map((student) => student.major).filter(Boolean))]
        .map((value) => String(value))
        .sort((a, b) => a.localeCompare(b, "ar")),
    [studentList],
  );

  useEffect(() => {
    const storedTemplates = localStorage.getItem(storageKey);
    if (!storedTemplates) {
      return;
    }

    try {
      const parsed = JSON.parse(storedTemplates) as unknown;
      if (Array.isArray(parsed)) {
        const validTemplates = parsed.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        );
        setTemplates(validTemplates);
      }
    } catch {
      setTemplates([]);
    }
  }, []);

  const saveTemplates = (nextTemplates: string[]) => {
    setTemplates(nextTemplates);
    localStorage.setItem(storageKey, JSON.stringify(nextTemplates));
  };

  const handleAddTemplate = () => {
    const value = newTemplate.trim();
    if (!value) {
      toast.error("اكتب نص القالب أولاً");
      return;
    }

    if (templates.includes(value)) {
      toast.error("هذا القالب موجود بالفعل");
      return;
    }

    saveTemplates([value, ...templates]);
    setNewTemplate("");
  };

  const handleDeleteTemplate = (value: string) => {
    saveTemplates(templates.filter((template) => template !== value));
  };

  const handleSelectTemplate = (value: string) => {
    setMessage(value);
    setIsTemplateDropdownOpen(false);
  };

  const filteredStudents = studentList.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.academicId.includes(searchQuery),
  );

  const handleStudentSelect = (student: StudentBasicInfo) => {
    setSelectedStudent(student);
    setSearchQuery(student.nameAr || student.name || "");
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("يرجى تعبئة العنوان والرسالة");
      return;
    }

    if (recipientType === "none") {
      toast.error("يرجى تحديد المستلمين");
      return;
    }

    const data: SendNotificationData = {
      title,
      message,
      recipientType,
    };

    if (recipientType === "single") {
      if (!selectedStudent) {
        toast.error("يرجى اختيار طالب");
        return;
      }
      data.studentId = selectedStudent.id;
    } else if (recipientType === "group") {
      if (!major && !graduationYear) {
        toast.error("يرجى تحديد تخصص أو سنة تخرج للمجموعة");
        return;
      }

      const parsedYear = graduationYear ? parseInt(graduationYear, 10) : null;
      const currentYear = new Date().getFullYear();
      if (parsedYear !== null && (parsedYear < 1999 || parsedYear > currentYear + 1)) {
        toast.error("سنة التخرج يجب أن تكون بين 1999 و السنة الحالية + 1");
        return;
      }

      if (major) data.major = major;
      if (parsedYear !== null) data.graduationYear = parsedYear;
    }

    startTransition(async () => {
      const result = await sendNewNotificationAction(data);
      if (result.success) {
        toast.success("تم إرسال الإشعار بنجاح!");
        // Reset form
        setTitle("");
        setMessage("");
        setRecipientType("all");
        setSearchQuery("");
        setSelectedStudent(null);
        setMajor("");
        setGraduationYear("");
      } else {
        toast.error(result.error || "فشل إرسال الإشعار");
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-3 font-arabic sm:p-5 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-[34px] bg-[#1a3b5c] shadow-[0_16px_36px_rgba(9,26,43,0.25)]"
      >
        <div className="relative px-6 pb-7 pt-5 text-center sm:px-10 sm:pt-6">
          <Link
            href="/staff/notifications"
            className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-[#ffb755] transition-colors hover:bg-white/10"
            aria-label="الرجوع إلى الإشعارات"
          >
            <ArrowLeft className="h-8 w-8" />
          </Link>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            إرسال أشعار جديد
          </h1>
          <p className="mt-1 text-lg text-white/90">
            اختر نوع الإشعار وحدد المستلمين
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-t-[36px] bg-[#ececec] p-4 text-right sm:p-6 md:p-8"
        >
          {/* Notification Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Label
              htmlFor="title"
              className="mb-3 block text-2xl font-bold text-black"
            >
              محتوى الإشعار
            </Label>
            <Input
              id="title"
              placeholder="عنوان الإشعار..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-14 rounded-[18px] border-0 bg-[#1a3b5c] px-4 text-lg text-white placeholder:text-white/85 focus-visible:ring-2 focus-visible:ring-[#ff9f1c]"
              dir="rtl"
            />

            <div className="mt-4 rounded-[18px] bg-[#1a3b5c] p-3">
              <button
                type="button"
                className="flex h-12 w-full items-center justify-between rounded-[14px] bg-[#14314d] px-4 text-white"
                onClick={() =>
                  setIsTemplateDropdownOpen((previousValue) => !previousValue)
                }
              >
                <ChevronDown className="h-5 w-5" />
                <span className="font-bold">
                  اختر قالب إشعار سريع (اختياري)
                </span>
              </button>

              <AnimatePresence>
                {isTemplateDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddTemplate}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#ff9f1c] text-[#1a3b5c]"
                        aria-label="إضافة قالب"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                      <Input
                        value={newTemplate}
                        onChange={(event) => setNewTemplate(event.target.value)}
                        placeholder="أضف قالب إشعار جديد"
                        className="h-10 rounded-[10px] border-0 bg-[#ececec] text-[#1a3b5c] placeholder:text-[#1a3b5c]/60"
                        dir="rtl"
                      />
                    </div>

                    <div className="max-h-44 overflow-auto rounded-[12px] bg-[#ececec]">
                      {templates.length === 0 ? (
                        <p className="p-3 text-sm text-[#1a3b5c]/70">
                          لا توجد قوالب محفوظة
                        </p>
                      ) : (
                        templates.map((template) => (
                          <div
                            key={template}
                            className="flex items-center gap-2 border-b border-[#d8d8d8] p-2 last:border-b-0"
                          >
                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(template)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#ff9f1c] text-[#1a3b5c]"
                              aria-label="حذف القالب"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSelectTemplate(template)}
                              className="flex-1 truncate rounded-[8px] px-2 py-1 text-right text-sm text-[#1a3b5c] hover:bg-[#ffb755]/60"
                            >
                              {template}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Textarea
              id="message"
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-4 min-h-[170px] rounded-[26px] border-0 bg-[#ffb755] p-4 text-xl text-[#1a3b5c] placeholder:text-[#1a3b5c]/65 focus-visible:ring-2 focus-visible:ring-[#1a3b5c]"
              dir="rtl"
            />
          </motion.div>

          {/* Recipient Selection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-[26px] bg-[#ffb755] p-4 sm:p-6"
          >
            <Label className="mb-4 block text-2xl font-bold text-black">
              تحديد المستلمين
            </Label>
            <div className="space-y-4">
              {/* All Students */}
              <label className="pointer-events-auto flex w-full items-center justify-end gap-3 rounded-lg p-3 text-right transition-colors hover:bg-[#f4ac44]">
                <span className="text-xl font-bold text-[#1a3b5c]">
                  جميع الطلاب
                </span>
                <input
                  id="all-students"
                  type="checkbox"
                  checked={recipientType === "all"}
                  onChange={(event) =>
                    setRecipientType(event.target.checked ? "all" : "none")
                  }
                  className="relative z-10 size-7 cursor-pointer appearance-none rounded-[8px] border-2 border-[#ff9f1c] bg-[#ff9f1c] pointer-events-auto"
                  style={{
                    backgroundImage:
                      recipientType === "all" ? checkboxCheckmarkImage : "none",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "16px 16px",
                  }}
                />
              </label>

              {/* Specific Group */}
              <label className="pointer-events-auto flex w-full items-center justify-end gap-3 rounded-lg p-3 text-right transition-colors hover:bg-[#f4ac44]">
                <span className="text-xl font-bold text-[#1a3b5c]">
                  مجموعة معينة
                </span>
                <input
                  id="specific-group"
                  type="checkbox"
                  checked={recipientType === "group"}
                  onChange={(event) =>
                    setRecipientType(event.target.checked ? "group" : "none")
                  }
                  className="relative z-10 size-7 cursor-pointer appearance-none rounded-[8px] border-2 border-[#ff9f1c] bg-[#ff9f1c] pointer-events-auto"
                  style={{
                    backgroundImage:
                      recipientType === "group"
                        ? checkboxCheckmarkImage
                        : "none",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "16px 16px",
                  }}
                />
              </label>
              <AnimatePresence>
                {recipientType === "group" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 gap-4 pt-2 pr-8 md:grid-cols-2">
                      <select
                        aria-label="التخصص"
                        value={major}
                        onChange={(event) => setMajor(event.target.value)}
                        className="h-12 rounded-[14px] border-0 bg-[#ececec] text-center text-[32px] font-bold text-[#1a3b5c]/65 placeholder:text-[#1a3b5c]/65"
                        dir="rtl"
                      >
                        <option value="">التخصص</option>
                        {majors.map((majorOption) => (
                          <option key={majorOption} value={majorOption}>
                            {majorOption}
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder="سنة التخرج"
                        type="number"
                        min={1999}
                        max={new Date().getFullYear() + 1}
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="h-12 rounded-[14px] border-0 bg-[#ececec] text-center text-[32px] font-bold text-[#1a3b5c]/65 placeholder:text-[#1a3b5c]/65"
                        dir="rtl"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Single Student */}
              <label className="pointer-events-auto flex w-full items-center justify-end gap-3 rounded-lg p-3 text-right transition-colors hover:bg-[#f4ac44]">
                <span className="text-xl font-bold text-[#1a3b5c]">
                  طالب واحد
                </span>
                <input
                  id="single-student"
                  type="checkbox"
                  checked={recipientType === "single"}
                  onChange={(event) =>
                    setRecipientType(event.target.checked ? "single" : "none")
                  }
                  className="relative z-10 size-7 cursor-pointer appearance-none rounded-[8px] border-2 border-[#ff9f1c] bg-[#ff9f1c] pointer-events-auto"
                  style={{
                    backgroundImage:
                      recipientType === "single"
                        ? checkboxCheckmarkImage
                        : "none",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "16px 16px",
                  }}
                />
              </label>
              <AnimatePresence>
                {recipientType === "single" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pr-8 pt-2 relative"
                  >
                    <div className="relative">
                      <Input
                        placeholder="ابحث عن اسم الطالب أو رقمه الأكاديمي..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsDropdownOpen(true);
                          setSelectedStudent(null);
                        }}
                        className="h-12 w-full rounded-[14px] border-0 bg-[#ececec] pr-10 text-center text-[32px] font-bold text-[#1a3b5c]/65 placeholder:text-[#1a3b5c]/65"
                        dir="rtl"
                      />
                      <Search className="absolute left-3 top-1/2 h-7 w-7 -translate-y-1/2 text-[#ff9f1c]" />
                    </div>
                    {isDropdownOpen &&
                      searchQuery &&
                      filteredStudents.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-[#d7d7d7] bg-[#ececec] shadow-lg"
                        >
                          {filteredStudents.map((student) => (
                            <li key={student.id}>
                              <button
                                type="button"
                                className="w-full px-4 py-2 text-right text-[#1a3b5c] hover:bg-[#ffb755]/60"
                                onClick={() => handleStudentSelect(student)}
                              >
                                {student.nameAr || student.name} (
                                {student.academicId})
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center"
          >
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[#ff9f1c] px-12 py-6 text-xl font-bold text-[#1a3b5c] transition-transform hover:scale-105 hover:bg-[#f29100] disabled:bg-gray-400"
            >
              {isPending ? "جاري الإرسال..." : "إرسال الإشعار"}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
