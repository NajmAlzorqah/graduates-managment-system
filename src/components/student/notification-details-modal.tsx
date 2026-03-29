"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  confirmStepAction,
  updateStudentDataAction,
} from "@/lib/actions/student";
import type { StudentWithProfile } from "@/types/student";
import type { SerializedNotification } from "./notification-card";

type NotificationDetailsModalProps = {
  notification: SerializedNotification;
  student: StudentWithProfile | null;
  onClose: () => void;
};

export default function NotificationDetailsModal({
  notification,
  student,
  onClose,
}: NotificationDetailsModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize data from student prop or fallbacks
  const [formData, setFormData] = useState({
    nameAr: student?.nameAr || "",
    name: student?.name || "",
    major: student?.profile?.major || "IT",
    studentCardNumber: student?.profile?.studentCardNumber || "",
    graduationYear:
      student?.profile?.graduationYear || new Date().getFullYear(),
  });

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for transition
  };

  // Check if it's a graduation form notification
  const isFormNotification =
    notification.title.includes("استمارة") ||
    notification.message.includes("بيانات") ||
    notification.message.includes("مراجعة");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "graduationYear" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSaveChanges = async () => {
    const year = formData.graduationYear;
    const currentYear = new Date().getFullYear();
    if (year < 1999 || year > currentYear + 1) {
      toast.error("سنة التخرج يجب أن تكون بين 1999 و السنة الحالية + 1", {
        style: { fontFamily: "Tajawal, sans-serif" },
      });
      return;
    }

    try {
      setIsSaving(true);
      const res = await updateStudentDataAction(formData);

      if (res.error) {
        throw new Error(res.error);
      }

      toast.success("تم حفظ التعديلات بنجاح", {
        style: { fontFamily: "Tajawal, sans-serif" },
      });
      setIsEditing(false);
    } catch (_err) {
      toast.error("حدث خطأ أثناء حفظ التعديلات", {
        style: { fontFamily: "Tajawal, sans-serif" },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await confirmStepAction(2);

      if (res.error) {
        throw new Error(res.error);
      }

      toast.success("تم تأكيد البيانات بنجاح", {
        style: { fontFamily: "Tajawal, sans-serif" },
      });
      setIsConfirming(false);
      handleClose();
    } catch (_err) {
      toast.error("حدث خطأ أثناء التأكيد. يرجى المحاولة لاحقاً.", {
        style: { fontFamily: "Tajawal, sans-serif" },
      });
      setIsConfirming(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
      dir="rtl"
    >
      <div
        className={`bg-white w-full sm:w-[500px] h-[90vh] sm:h-[80vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out sm:scale-100 ${
          isVisible ? "translate-y-0" : "translate-y-full sm:translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#ffb755] px-6 py-5 rounded-t-3xl relative shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-arabic font-bold text-2xl">
              عرض التفاصيل
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <h3 className="text-white font-arabic font-bold text-3xl mt-4 opacity-90">
            الاستمارة
          </h3>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
            <div className="absolute top-4 left-4 flex gap-2">
              {notification.status === "مستخدم" && (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                  مستخدم
                </span>
              )}
              <span className="bg-blue-50 text-[#1a3b5c] px-3 py-1 rounded-full text-xs font-bold">
                إشعار
              </span>
            </div>
            <h4 className="font-arabic font-bold text-xl text-[#ffb755] mb-2 pr-1">
              {notification.title}
            </h4>
            <p className="font-arabic text-[#1a3b5c] text-lg leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
            <div className="mt-4 text-left text-sm text-gray-400 font-medium">
              {new Date(notification.createdAt).toLocaleDateString("ar-SA")}
            </div>
          </div>

          {isFormNotification && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              <div>
                <label className="block font-arabic font-semibold text-[#1a3b5c] text-lg mb-2">
                  الاسم الرباعي:
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nameAr"
                    value={formData.nameAr}
                    onChange={handleInputChange}
                    className="w-full bg-white rounded-lg p-3 border-2 border-[#1a3b5c]/20 focus:border-[#ffb755] focus:outline-none transition-colors text-[#1a3b5c] font-medium min-h-[50px]"
                  />
                ) : (
                  <div className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-[#1a3b5c] font-medium min-h-[50px] flex items-center">
                    {formData.nameAr}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-arabic font-semibold text-[#1a3b5c] text-lg mb-2">
                  الاسم كما في جواز السفر :
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    dir="ltr"
                    className="w-full bg-white rounded-lg p-3 border-2 border-[#1a3b5c]/20 focus:border-[#ffb755] focus:outline-none transition-colors text-[#1a3b5c] font-medium font-sans min-h-[50px]"
                  />
                ) : (
                  <div
                    className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-[#1a3b5c] font-medium font-sans min-h-[50px] flex items-center"
                    dir="ltr"
                  >
                    {formData.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block font-arabic font-semibold text-[#1a3b5c] text-lg mb-2">
                  التخصص:
                </label>
                {isEditing ? (
                  <select
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    className="w-full bg-white rounded-lg p-3 border-2 border-[#1a3b5c]/20 focus:border-[#ffb755] focus:outline-none transition-colors text-[#1a3b5c] font-medium min-h-[50px] font-arabic cursor-pointer"
                  >
                    <option value="" disabled>
                      اختر التخصص
                    </option>
                    <option value="IT">تكنولوجيا المعلومات (IT)</option>
                    <option value="علوم حاسوب">علوم حاسوب</option>
                    <option value="هندسة">هندسة</option>
                    <option value="طب">طب</option>
                    <option value="إدارة أعمال">إدارة أعمال</option>
                  </select>
                ) : (
                  <div className="w-full bg-gray-50 rounded-lg p-3 border border-gray-200 text-[#1a3b5c] font-medium min-h-[50px] flex items-center font-sans">
                    {formData.major}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-arabic font-semibold text-[#1a3b5c] text-sm mb-2">
                      رقم البطاقة الجامعية:
                    </label>
                    <input
                      type="text"
                      name="studentCardNumber"
                      value={formData.studentCardNumber}
                      onChange={handleInputChange}
                      className="w-full bg-white rounded-lg p-3 border-2 border-[#1a3b5c]/20 focus:border-[#ffb755] focus:outline-none transition-colors text-[#1a3b5c] font-medium font-sans"
                    />
                  </div>
                  <div>
                    <label className="block font-arabic font-semibold text-[#1a3b5c] text-sm mb-2">
                      سنة التخرج:
                    </label>
                    <input
                      type="number"
                      name="graduationYear"
                      min={1999}
                      max={new Date().getFullYear() + 1}
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      className="w-full bg-white rounded-lg p-3 border-2 border-[#1a3b5c]/20 focus:border-[#ffb755] focus:outline-none transition-colors text-[#1a3b5c] font-medium font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="block font-arabic font-semibold text-[#1a3b5c] text-lg mb-3">
                  صورة جواز السفر:
                </label>
                <div className="w-fit bg-blue-50 text-[#1a3b5c] font-arabic font-medium px-6 py-2.5 rounded-full cursor-not-allowed opacity-50 flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>مرفوع مسبقاً</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {isFormNotification && !isConfirming && (
          <div className="p-5 bg-white border-t border-gray-100 flex gap-4 shrink-0">
            {notification.status === "مستخدم" ? (
              <div className="w-full text-center py-3 px-4 bg-gray-100 rounded-xl text-gray-500 font-arabic font-bold text-lg border border-gray-200">
                هذا الإشعار تم استخدامه مسبقاً ولا يمكن استخدامه مرة أخرى.
              </div>
            ) : isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-200 text-[#1a3b5c] font-arabic font-bold text-xl py-3 rounded-xl hover:bg-gray-300 transition-colors shadow-md disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="flex-1 bg-[#ffb755] text-white font-arabic font-bold text-xl py-3 rounded-xl hover:bg-[#e5a547] transition-colors shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></span>
                  ) : (
                    "حفظ التعديلات"
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsConfirming(true)}
                  className="flex-1 bg-[#1a3b5c] text-white font-arabic font-bold text-xl py-3 rounded-xl hover:bg-[#122841] transition-colors shadow-md"
                >
                  تأكيد
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-[#ffb755] text-white font-arabic font-bold text-xl py-3 rounded-xl hover:bg-[#e5a547] transition-colors shadow-md"
                >
                  تعديل
                </button>
              </>
            )}
          </div>
        )}

        {/* Confirmation State */}
        {isFormNotification && isConfirming && (
          <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-4 shrink-0">
            <p className="font-arabic font-bold text-[#1a3b5c] text-center text-lg mb-2">
              هل أنت متأكد من صحة جميع البيانات؟ سيتم إرسالها للمراجعة.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsConfirming(false)}
                disabled={isSubmitting}
                className="flex-[0.5] bg-gray-200 text-[#1a3b5c] font-arabic font-bold text-xl py-3 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                رجوع
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isSubmitting}
                className="flex-1 bg-[#1a3b5c] text-white font-arabic font-bold text-xl py-3 rounded-xl hover:bg-[#122841] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "نعم، تأكيد وإرسال"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
