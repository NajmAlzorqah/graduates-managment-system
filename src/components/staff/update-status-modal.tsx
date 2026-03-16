"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, MessageSquare, Send, Loader2 } from "lucide-react";
import type { StudentWithSteps } from "@/types/student";
import type { NotificationTemplate } from "@prisma/client";
import { updateStepStatusAction } from "@/lib/actions/staff-students";
import { sendNewNotificationAction } from "@/lib/actions/staff-notifications";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithSteps | null;
  templates: NotificationTemplate[];
};

export default function UpdateStatusModal({
  isOpen,
  onClose,
  student,
  templates,
}: Props) {
  const [loadingStepId, setLoadingStepId] = useState<string | null>(null);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [showNotificationForm, setShowNotificationForm] = useState(false);

  if (!student) return null;

  const handleUpdateStatus = async (stepId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "PENDING" : "COMPLETED";
    setLoadingStepId(stepId);

    const res = await updateStepStatusAction(stepId, nextStatus);
    setLoadingStepId(null);

    if (res.success) {
      toast.success("تم تحديث الحالة بنجاح");
      // Pre-fill notification if it was completed
      if (nextStatus === "COMPLETED") {
        const step = student.steps.find((s) => s.id === stepId);
        setNotificationTitle(`تحديث حالة الشهادة: ${step?.label}`);
        setNotificationMessage(`تم إكمال خطوة "${step?.label}" بنجاح.`);
        setShowNotificationForm(true);
      }
    } else {
      toast.error(res.error || "فشل في تحديث الحالة");
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error("يرجى إدخال العنوان والرسالة");
      return;
    }

    setIsSendingNotification(true);
    const res = await sendNewNotificationAction({
      title: notificationTitle,
      message: notificationMessage,
      recipientType: "single",
      studentId: student.id,
    });
    setIsSendingNotification(false);

    if (res.success) {
      toast.success("تم إرسال الإشعار للطالب");
      setShowNotificationForm(false);
      setNotificationTitle("");
      setNotificationMessage("");
    } else {
      toast.error(res.error || "فشل في إرسال الإشعار");
    }
  };

  const applyTemplate = (template: NotificationTemplate) => {
    setNotificationTitle(template.title);
    setNotificationMessage(template.message);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#ececec] rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
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
                تحديث حالة الشهادة
              </h2>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {/* Student Info */}
              <div
                className="bg-white rounded-3xl p-5 mb-8 shadow-sm text-right"
                dir="rtl"
              >
                <p className="text-xl font-bold text-[#1a3b5c]">
                  {student.nameAr || student.name}
                </p>
                <p className="text-[#1a3b5c]/70 font-bold">{student.major}</p>
              </div>

              {/* Steps List */}
              <div className="space-y-4 mb-8" dir="rtl">
                <h3 className="text-xl font-bold text-[#1a3b5c] mb-4">
                  خطوات الشهادة
                </h3>
                {student.steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-transparent hover:border-[#ffb755]/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={[
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                          step.status === "completed"
                            ? "bg-[#ffb755] border-[#ffb755]"
                            : "bg-white border-[#1a3b5c]",
                        ].join(" ")}
                      >
                        {step.status === "completed" && (
                          <CheckCircle2 className="w-6 h-6 text-[#1a3b5c]" />
                        )}
                      </div>
                      <span className="text-[#1a3b5c] font-bold text-lg">
                        {step.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(step.id, step.status)}
                      disabled={loadingStepId === step.id}
                      className={[
                        "px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm",
                        step.status === "completed"
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-[#1a3b5c] text-white hover:bg-[#1a3b5c]/90",
                      ].join(" ")}
                    >
                      {loadingStepId === step.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : step.status === "completed" ? (
                        "تراجع"
                      ) : (
                        "اعتماد"
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Notification Section */}
              {showNotificationForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border-2 border-[#ffb755]/30 overflow-hidden"
                  dir="rtl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <MessageSquare className="w-6 h-6 text-[#1a3b5c]" />
                    <h3 className="text-xl font-bold text-[#1a3b5c]">
                      إرسال إشعار للطالب
                    </h3>
                  </div>

                  {/* Templates Suggestions */}
                  <div className="mb-6 overflow-x-auto flex gap-2 pb-2 custom-scrollbar">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template)}
                        className="whitespace-nowrap bg-[#f3f4f6] hover:bg-[#ffb755]/20 px-4 py-2 rounded-full text-sm font-bold text-[#1a3b5c] border border-[#e5e7eb] transition-colors"
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="notif-title"
                        className="block text-sm font-bold text-[#1a3b5c] mb-2"
                      >
                        عنوان الإشعار
                      </label>
                      <input
                        id="notif-title"
                        type="text"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                        className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-[#ffb755] font-bold text-[#1a3b5c]"
                        placeholder="أدخل عنوان الإشعار..."
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="notif-message"
                        className="block text-sm font-bold text-[#1a3b5c] mb-2"
                      >
                        نص الرسالة
                      </label>
                      <textarea
                        id="notif-message"
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 border-none focus:ring-2 focus:ring-[#ffb755] font-bold text-[#1a3b5c] h-32 resize-none"
                        placeholder="أدخل نص الرسالة..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSendNotification}
                      disabled={isSendingNotification}
                      className="w-full bg-[#ffb755] text-[#1a3b5c] font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#ffb755]/90 transition-all shadow-[0_4px_12px_rgba(255,183,85,0.3)] disabled:opacity-50"
                    >
                      {isSendingNotification ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-6 h-6" />
                          <span>إرسال الإشعار</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
