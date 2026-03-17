"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Plus, Search, Trash2, X, AlertCircle, Users } from "lucide-react";
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
  getRecipientCountAction,
} from "@/lib/actions/staff-notifications";
import type { StudentBasicInfo } from "@/types/student";

type RecipientType = "all" | "group" | "single";

type NotificationFormProps = {
  students: StudentBasicInfo[];
  backLink: string;
  role: "ADMIN" | "STAFF";
};

// Custom checkbox for the orange theme
const CustomCheckbox = ({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string, id: string }) => (
  <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group">
    <div 
      className={`size-6 rounded-md border-2 flex items-center justify-center transition-all ${
        checked ? "bg-[#F4A261] border-[#F4A261]" : "border-gray-300 group-hover:border-[#F4A261]"
      }`}
    >
      {checked && <X className="size-4 text-white rotate-45" strokeWidth={4} />}
    </div>
    <span className={`text-xl font-bold transition-colors ${checked ? "text-[#1D3557]" : "text-gray-500"}`}>
      {label}
    </span>
    <input 
      id={id}
      type="checkbox" 
      className="hidden" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)} 
    />
  </label>
);

export default function NotificationForm({
  students,
  backLink,
  role,
}: NotificationFormProps) {
  const storageKey = `${role.toLowerCase()}_notification_templates`;

  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState<RecipientType>("all");

  // Single student selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentBasicInfo | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Group selection
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [status, setStatus] = useState<"active" | "graduated" | "all">("all");

  // Counter
  const [recipientCount, setRecipientCount] = useState<number>(students.length);

  // Quick templates
  const [templates, setTemplates] = useState<{title: string, message: string}[]>([]);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);

  const majors = useMemo(
    () =>
      [...new Set(students.map((s) => s.major).filter(Boolean))]
        .map((value) => String(value))
        .sort((a, b) => a.localeCompare(b, "ar")),
    [students],
  );

  useEffect(() => {
    const storedTemplates = localStorage.getItem(storageKey);
    if (storedTemplates) {
      try {
        setTemplates(JSON.parse(storedTemplates));
      } catch {
        setTemplates([]);
      }
    }
  }, [storageKey]);

  const saveTemplates = (nextTemplates: {title: string, message: string}[]) => {
    setTemplates(nextTemplates);
    localStorage.setItem(storageKey, JSON.stringify(nextTemplates));
  };

  const handleAddTemplate = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("يرجى تعبئة العنوان والرسالة لحفظهما كقالب");
      return;
    }
    if (templates.some(t => t.title === title)) {
      toast.error("هذا القالب موجود بالفعل");
      return;
    }
    saveTemplates([{ title, message }, ...templates]);
    toast.success("تم حفظ القالب");
  };

  const handleDeleteTemplate = (e: React.MouseEvent, titleToDelete: string) => {
    e.stopPropagation();
    saveTemplates(templates.filter((t) => t.title !== titleToDelete));
  };

  const handleSelectTemplate = (template: {title: string, message: string}) => {
    setTitle(template.title);
    setMessage(template.message);
    setIsTemplateDropdownOpen(false);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.academicId.includes(searchQuery) ||
      s.major?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStudentSelect = (student: StudentBasicInfo) => {
    setSelectedStudent(student);
    setSearchQuery(student.nameAr || student.name || "");
    setIsDropdownOpen(false);
  };

  // Update recipient count
  useEffect(() => {
    const fetchCount = async () => {
      const count = await getRecipientCountAction({
        recipientType,
        major: major || undefined,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        status,
        studentId: selectedStudent?.id,
      });
      setRecipientCount(count);
    };
    fetchCount();
  }, [recipientType, major, graduationYear, status, selectedStudent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("يرجى تعبئة العنوان والرسالة");
      return;
    }

    if (recipientType === "all") {
       if (!confirm("هل أنت متأكد من إرسال هذا الإشعار لجميع الطلاب؟")) return;
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
      if (major) data.major = major;
      if (graduationYear) data.graduationYear = parseInt(graduationYear);
      data.status = status;
    }

    startTransition(async () => {
      const result = await sendNewNotificationAction(data);
      if (result.success) {
        toast.success("تم إرسال الإشعار بنجاح!");
        setTitle("");
        setMessage("");
        setSearchQuery("");
        setSelectedStudent(null);
      } else {
        toast.error(result.error || "فشل إرسال الإشعار");
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 font-arabic" dir="rtl">
      {/* Header */}
      <div className="mb-12 relative flex flex-col items-center">
        <Link
          href={backLink}
          className="absolute right-0 top-0 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95 sm:top-1/2 sm:-translate-y-1/2"
        >
          <ArrowLeft className="size-8" />
        </Link>
        <h1 className="text-4xl font-bold text-white md:text-[50px]">
          إرسال أشعار جديد
        </h1>
        <p className="mt-4 text-xl text-white/80 font-light">
          اختر نوع الإشعار وحدد المستلمين
        </p>
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[40px] bg-white p-6 shadow-2xl md:rounded-[60px] md:p-14"
      >
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Notification Type & Template Selection */}
          <div className="space-y-4">
            <Label className="block text-2xl font-bold text-black">
              نوع الإشعار:
            </Label>
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                  className="flex h-16 w-full items-center justify-between rounded-2xl bg-[#1D3557] px-6 text-xl text-white transition-all hover:bg-[#1D3557]/90"
                >
                  <span className="truncate">{title || "اختر إشعار ..."}</span>
                  <ChevronDown className={`size-6 transition-transform ${isTemplateDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isTemplateDropdownOpen && (
                    <motion.div
                      key="template-dropdown"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl bg-[#1D3557] p-2 shadow-xl border border-white/10"
                    >
                      {templates.length === 0 ? (
                        <p key="no-templates" className="p-4 text-center text-white/50">لا توجد قوالب محفوظة</p>
                      ) : (
                        templates.map((t, index) => (
                          <div
                            key={`${t.title}-${index}`}
                            onClick={() => handleSelectTemplate(t)}
                            className="flex items-center justify-between rounded-xl px-4 py-3 text-white transition-colors hover:bg-white/10 cursor-pointer group"
                          >
                            <span className="truncate font-medium">{t.title}</span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTemplate(e, t.title)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all"
                            >
                              <Trash2 className="size-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                type="button"
                onClick={handleAddTemplate}
                className="h-16 rounded-2xl bg-[#F4A261] px-8 text-xl font-bold text-[#1D3557] hover:bg-[#F4A261]/90 transition-all active:scale-95"
              >
                <Plus className="ml-2 size-6" />
                إضافه إشعار جديد للقائمة
              </Button>
            </div>
          </div>

          {/* Content Inputs */}
          <div className="space-y-6">
            <div className="space-y-4">
               <Label className="block text-2xl font-bold text-black">محتوى الإشعار</Label>
               <Input
                placeholder="عنوان الإشعار..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-16 rounded-2xl border-none bg-gray-100 px-6 text-xl text-[#1D3557] placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#1D3557]"
              />
            </div>
            
            <Textarea
              placeholder="اكتب رسالتك هنا..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[220px] rounded-[30px] border-none bg-[#F4A261] p-8 text-2xl font-medium text-[#1D3557] placeholder:text-[#1D3557]/60 focus-visible:ring-0"
            />
          </div>

          {/* Recipient Selection */}
          <div className="rounded-[30px] bg-[#F4A261]/10 p-6 md:p-10 space-y-8">
            <div className="flex items-center justify-between">
               <Label className="text-2xl font-bold text-black">تحديد المستلمين:</Label>
               <div className="flex items-center gap-2 rounded-full bg-[#1D3557] px-4 py-1.5 text-white">
                  <Users className="size-5" />
                  <span className="text-lg font-bold">{recipientCount} مستلم</span>
               </div>
            </div>

            <div className="space-y-6">
              {/* All Students */}
              <CustomCheckbox 
                id="all"
                label="جميع الطلاب"
                checked={recipientType === "all"}
                onChange={() => setRecipientType("all")}
              />

              {/* Specific Group */}
              <div className="space-y-4">
                <CustomCheckbox 
                  id="group"
                  label="مجموعة معينة"
                  checked={recipientType === "group"}
                  onChange={() => setRecipientType("group")}
                />
                
                <AnimatePresence>
                  {recipientType === "group" && (
                    <motion.div
                      key="group-selection"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pr-8"
                    >
                      <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">
                        <div className="relative">
                          <select
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            className="h-14 w-full rounded-2xl bg-gray-100 px-4 text-xl font-bold text-[#1D3557]/70 appearance-none outline-none focus:ring-2 focus:ring-[#1D3557]"
                          >
                            <option value="">التخصص</option>
                            {majors.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 size-5 pointer-events-none text-[#1D3557]/50" />
                        </div>

                        <Input
                          type="number"
                          placeholder="سنة التخرج"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="h-14 rounded-2xl border-none bg-gray-100 px-4 text-center text-xl font-bold text-[#1D3557]/70"
                        />

                        <div className="relative">
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="h-14 w-full rounded-2xl bg-gray-100 px-4 text-xl font-bold text-[#1D3557]/70 appearance-none outline-none focus:ring-2 focus:ring-[#1D3557]"
                          >
                            <option value="all">الحالة</option>
                            <option value="active">نشط</option>
                            <option value="graduated">خريج</option>
                          </select>
                          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 size-5 pointer-events-none text-[#1D3557]/50" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Single Student */}
              <div className="space-y-4">
                <CustomCheckbox 
                  id="single"
                  label="طالب واحد"
                  checked={recipientType === "single"}
                  onChange={() => setRecipientType("single")}
                />

                <AnimatePresence>
                  {recipientType === "single" && (
                    <motion.div
                      key="single-selection"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pr-8 relative"
                    >
                      <div className="relative pt-2">
                        <Input
                          placeholder="ابحث عن اسم الطالب أو رقمه الأكاديمي أو تخصصه..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsDropdownOpen(true);
                            setSelectedStudent(null);
                          }}
                          className="h-14 w-full rounded-2xl border-none bg-gray-100 pr-12 text-xl font-bold text-[#1D3557]/70 placeholder:text-gray-400"
                        />
                        <Search className="absolute right-4 top-[calc(50%+4px)] -translate-y-1/2 size-6 text-[#F4A261]" />
                      </div>

                      {isDropdownOpen && searchQuery && filteredStudents.length > 0 && (
                        <motion.div
                          key="student-search-results"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute z-20 mt-2 max-h-60 w-[calc(100%-32px)] overflow-auto rounded-2xl border border-gray-100 bg-white shadow-2xl"
                        >
                          {filteredStudents.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className="w-full px-6 py-4 text-right text-[#1D3557] transition-colors hover:bg-gray-50 flex flex-col border-b last:border-b-0"
                              onClick={() => handleStudentSelect(s)}
                            >
                              <span className="font-bold text-lg">{s.nameAr || s.name}</span>
                              <span className="text-sm opacity-60">{s.academicId} - {s.major}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isPending || !title || !message || (recipientType === "single" && !selectedStudent)}
              className="h-[70px] w-full rounded-full bg-[#1D3557] text-2xl font-bold text-white shadow-xl hover:bg-[#1D3557]/90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isPending ? "جاري الإرسال..." : "إرسال الإشعار"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
