import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  FileText,
  Loader2,
  ThumbsDown,
  ThumbsUp,
  User as UserIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import type { StudentWithSteps } from "@/types/student";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithSteps | null;
};

export default function CertificateDetailsModal({
  isOpen,
  onClose,
  student,
}: Props) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [comments, setComments] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!student) return null;

  const passportDoc = student.documents.find(
    (d) => d.documentType === "PASSPORT",
  );

  const handleReview = async (
    status: "APPROVED" | "NEEDS_CONFIRMATION" | "REJECTED",
  ) => {
    if (status === "REJECTED" && !comments.trim()) {
      toast.error("يرجى إدخال سبب الرفض");
      return;
    }

    if (!student.graduationFormId) {
      toast.error("بيانات النموذج غير متوفرة");
      return;
    }

    setIsReviewing(true);
    try {
      const res = await fetch(
        `/api/graduation-form/${student.graduationFormId}/review`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, comments }),
        },
      );

      if (!res.ok) throw new Error("فشل في تحديث حالة النموذج");

      toast.success(
        status === "APPROVED"
          ? "تم اعتماد النموذج بنجاح"
          : "تم تحديث حالة النموذج بنجاح",
      );
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ ما");
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#ececec] rounded-[40px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
          >
            {/* Header */}
            <div className="bg-[#1a3b5c] p-6 text-white flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-white/10 p-1 rounded-full transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <h2 className="text-2xl font-bold font-arabic" dir="rtl">
                بيانات الخريج وتتبع الشهادة
              </h2>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {/* Review Action Section */}
              {student.graduationFormSubmitted &&
                ["SUBMITTED", "NEEDS_CONFIRMATION", "CONFIRMED_BY_STUDENT", "REJECTED"].includes(
                  student.graduationFormStatus || "",
                ) && (
                  <div
                    className="bg-white rounded-[30px] p-6 shadow-sm border-2 border-[#ffb755] mb-8"
                    dir="rtl"
                  >
                    <h3 className="text-xl font-bold text-[#1a3b5c] mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-[#ffb755]" />
                      مراجعة نموذج التخرج
                    </h3>
                    <p className="text-[#1a3b5c]/70 font-bold mb-6">
                      {student.graduationFormStatus === "CONFIRMED_BY_STUDENT"
                        ? "قام الطالب بتأكيد البيانات. يمكنك الآن الاعتماد النهائي أو طلب تأكيد إضافي."
                        : "يرجى مراجعة البيانات أدناه والتحقق من صحتها قبل الاعتماد."}
                    </p>

                    {showRejectForm ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="يرجى كتابة أسباب الرفض أو الملاحظات..."
                          className="w-full bg-[#f3f4f6] rounded-2xl p-4 border-none focus:ring-2 focus:ring-[#ffb755] font-bold text-[#1a3b5c] h-32 resize-none"
                        />
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => handleReview("REJECTED")}
                            disabled={isReviewing}
                            className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                          >
                            {isReviewing ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              "تأكيد الرفض وإرسال ملاحظات"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRejectForm(false)}
                            className="px-8 bg-gray-200 text-[#1a3b5c] font-bold py-3 rounded-xl hover:bg-gray-300 transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        <button
                          type="button"
                          onClick={() => handleReview("APPROVED")}
                          disabled={isReviewing}
                          className="flex-1 min-w-[150px] bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-3"
                        >
                          {isReviewing ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              <ThumbsUp className="w-6 h-6" />
                              <span>اعتماد نهائي</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview("NEEDS_CONFIRMATION")}
                          disabled={isReviewing}
                          className="flex-1 min-w-[150px] bg-[#1a3b5c] text-white font-bold py-4 rounded-2xl hover:bg-[#1a3b5c]/90 transition-all shadow-lg flex items-center justify-center gap-3"
                        >
                          {isReviewing ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              <Circle className="w-6 h-6" />
                              <span>طلب تأكيد الطالب</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(true)}
                          disabled={isReviewing}
                          className="flex-1 min-w-[150px] bg-white text-red-500 border-2 border-red-500 font-bold py-4 rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-3"
                        >
                          <ThumbsDown className="w-6 h-6" />
                          <span>رفض (يوجد أخطاء)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

              {/* Student Basic Info Section */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                dir="rtl"
              >
                <div className="bg-white rounded-[30px] p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-4 border-b pb-3 border-[#f0f0f0]">
                    <div className="w-12 h-12 rounded-full bg-[#ffb755]/20 flex items-center justify-center shrink-0">
                      <UserIcon className="w-6 h-6 text-[#1a3b5c]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1a3b5c]">
                        البيانات الشخصية
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {!student.graduationFormSubmitted ? (
                      <div className="py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-[#1a3b5c] font-bold text-xl">
                          الطالب لم يكمل نموذج التخرج
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-sm text-[#1a3b5c]/50 font-bold">
                            الاسم بالعربي (حسب شهادة الثانوية)
                          </p>
                          <p className="text-xl font-bold text-[#1a3b5c]">
                            {student.nameAr || "غير متوفر"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#1a3b5c]/50 font-bold">
                            الاسم بالإنجليزي (حسب الجواز)
                          </p>
                          <p className="text-xl font-bold text-[#1a3b5c]">
                            {student.name || "غير متوفر"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#1a3b5c]/50 font-bold">
                            رقم الهاتف
                          </p>
                          <p className="text-xl font-bold text-[#1a3b5c]" dir="ltr">
                            {student.phone || "---"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#1a3b5c]/50 font-bold">
                            سنة التخرج
                          </p>
                          <p className="text-xl font-bold text-[#1a3b5c]">
                            {student.graduationYear || "---"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-[30px] p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-4 border-b pb-3 border-[#f0f0f0]">
                    <div className="w-12 h-12 rounded-full bg-[#ffb755]/20 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-[#1a3b5c]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1a3b5c]">
                        وثيقة جواز السفر
                      </h3>
                    </div>
                  </div>

                  {passportDoc ? (
                    <div className="relative group overflow-hidden rounded-2xl border-2 border-[#f0f0f0] aspect-video flex items-center justify-center bg-[#f9f9f9]">
                      <Image
                        src={`/api/${passportDoc.filePath}`}
                        alt="Passport Copy"
                        fill
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                          href={`/api/${passportDoc.filePath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white text-[#1a3b5c] px-4 py-2 rounded-full font-bold flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>فتح الملف</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#1a3b5c]/30 gap-2 border-2 border-dashed border-[#e5e7eb] rounded-2xl">
                      <FileText className="w-12 h-12" />
                      <p className="font-bold">لم يتم رفع الجواز بعد</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Section */}
              <div className="bg-white rounded-[40px] p-8 shadow-sm" dir="rtl">
                <h3 className="text-xl font-bold text-[#1a3b5c] mb-8 border-r-4 border-[#ffb755] pr-4">
                  تتبع مراحل الشهادة
                </h3>

                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute right-6 top-0 bottom-0 w-1 bg-[#1a3b5c]/10 rounded-full" />

                  <div className="space-y-8 relative">
                    {student.steps.map((step) => (
                      <div key={step.id} className="flex gap-6 items-start">
                        {/* Status Icon */}
                        <div
                          className={[
                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm",
                            step.status === "completed"
                              ? "bg-[#ffb755] text-[#1a3b5c]"
                              : "bg-[#f3f4f6] text-[#1a3b5c]/30",
                          ].join(" ")}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <Circle className="w-6 h-6 fill-current" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-[#f9f9f9] rounded-2xl p-4 border border-[#f0f0f0]">
                          <div className="flex justify-between items-center">
                            <h4 className="text-lg font-bold text-[#1a3b5c]">
                              {step.label}
                            </h4>
                            <span
                              className={[
                                "px-4 py-1 rounded-full text-xs font-bold",
                                step.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-[#1a3b5c]/10 text-[#1a3b5c]/50",
                              ].join(" ")}
                            >
                              {step.status === "completed"
                                ? "مكتمل"
                                : "قيد الانتظار"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
