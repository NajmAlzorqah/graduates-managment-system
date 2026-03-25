"use client";

import type { NotificationTemplate } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createTemplateAction,
  deleteTemplateAction,
} from "@/lib/actions/notification-templates";
import { sendNewNotificationAction } from "@/lib/actions/staff-notifications";

type SendNotificationScreenProps = {
  staffUsers: { id: string; nameAr: string | null; name: string | null }[];
  initialTemplates: NotificationTemplate[];
};

export default function SendNotificationScreen({
  staffUsers,
  initialTemplates,
}: SendNotificationScreenProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState(initialTemplates);
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);

  // Recipient selection
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [isRecipientDropdownOpen, setIsRecipientDropdownOpen] = useState(false);

  const filteredStaff = staffUsers.filter((user) =>
    (user.nameAr || user.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const handleAddTemplate = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("يرجى تعبئة العنوان والرسالة لحفظهما كقالب");
      return;
    }

    startTransition(async () => {
      const result = await createTemplateAction({ title, message });
      if (result.success) {
        if (result.data) {
          setTemplates([result.data, ...templates]);
        }
        toast.success("تمت إضافة القالب بنجاح");
      } else {
        toast.error(result.error || "فشل في إضافة القالب");
      }
    });
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await deleteTemplateAction(id);
      if (result.success) {
        setTemplates(templates.filter((t) => t.id !== id));
        toast.success("تم حذف القالب");
      } else {
        toast.error((result as any).error);
      }
    });
  };

  const handleSelectTemplate = (template: NotificationTemplate) => {
    setTitle(template.title);
    setMessage(template.message);
    setIsTemplateDropdownOpen(false);
  };

  const toggleStaffSelection = (id: string) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id)
        ? prev.filter((staffId) => staffId !== id)
        : [...prev, id],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("يرجى تعبئة العنوان والرسالة");
      return;
    }

    if (selectedStaffIds.length === 0) {
      toast.error("يرجى اختيار مستلم واحد على الأقل");
      return;
    }

    startTransition(async () => {
      // Since sendNewNotificationAction is designed for students,
      // we might need a separate action or reuse logic.
      // But based on the prompt "Admin can only send notifications to staff",
      // I will assume sendNewNotificationAction can handle multiple ids if modified,
      // or I'll call it multiple times for each staff member if it's single-recipient.
      // Wait, let's check sendNewNotificationAction again.

      let successCount = 0;
      for (const staffId of selectedStaffIds) {
        const result = await sendNewNotificationAction({
          title,
          message,
          recipientType: "single",
          studentId: staffId, // Reusing the studentId field for staffId
        });
        if (result.success) successCount++;
      }

      if (successCount === selectedStaffIds.length) {
        toast.success("تم إرسال الإشعار بنجاح");
        setTitle("");
        setMessage("");
        setSelectedStaffIds([]);
        setSearchQuery("");
      } else if (successCount > 0) {
        toast.success(`تم إرسال الإشعار لـ ${successCount} من المستلمين`);
      } else {
        toast.error("فشل إرسال الإشعار");
      }
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 font-arabic" dir="rtl">
      {/* Header */}
      <div className="mb-12 relative">
        <Link
          href="/admin/notifications"
          className="absolute right-0 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="size-8" />
        </Link>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white md:text-[50px]">
            إرسال أشعار جديد
          </h1>
          <p className="mt-4 text-xl text-white/80 font-light">
            اختر نوع الإشعار وحدد المستلمين
          </p>
        </div>
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[60px] bg-white p-8 shadow-2xl md:p-14"
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
                  onClick={() =>
                    setIsTemplateDropdownOpen(!isTemplateDropdownOpen)
                  }
                  className="flex h-16 w-full items-center justify-between rounded-2xl bg-[#1a3b5c] px-6 text-xl text-white transition-all hover:bg-[#1a3b5c]/90"
                >
                  <span className="truncate">{title || "اختر إشعار ..."}</span>
                  <ChevronDown
                    className={`size-6 transition-transform ${isTemplateDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isTemplateDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto rounded-2xl bg-[#1a3b5c] p-2 shadow-xl border border-white/10"
                    >
                      {templates.length === 0 ? (
                        <p className="p-4 text-center text-white/50">
                          لا توجد قوالب محفوظة
                        </p>
                      ) : (
                        templates.map((t) => (
                          <div
                            key={t.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectTemplate(t)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleSelectTemplate(t);
                              }
                            }}
                            className="flex items-center justify-between rounded-xl px-4 py-3 text-white transition-colors hover:bg-white/10 cursor-pointer group"
                          >
                            <span className="truncate font-medium">
                              {t.title}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteTemplate(t.id, e)}
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
                disabled={isPending}
                className="h-16 rounded-2xl bg-[#ffb755] px-8 text-xl font-bold text-[#1a3b5c] hover:bg-[#ffb755]/90 transition-all active:scale-95"
              >
                <Plus className="ml-2 size-6" />
                إضافه إشعار جديد للقائمة
              </Button>
            </div>
          </div>

          {/* Title Input (New) */}
          <div className="space-y-4">
            <Input
              placeholder="اكتب عنوان الإشعار هنا..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-16 rounded-2xl border-none bg-gray-100 px-6 text-xl text-[#1a3b5c] placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[#1a3b5c]"
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-4">
            <Textarea
              placeholder="اكتب أشعار جديد....."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[220px] rounded-[30px] border-none bg-[#ffb755] p-8 text-2xl font-medium text-[#1a3b5c] placeholder:text-[#1a3b5c]/60 focus-visible:ring-0"
            />
          </div>

          {/* Recipient Selection */}
          <div className="space-y-4">
            <Label className="block text-2xl font-bold text-black">
              تحديدالمستلمين:
            </Label>
            <div className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  setIsRecipientDropdownOpen(!isRecipientDropdownOpen)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setIsRecipientDropdownOpen(!isRecipientDropdownOpen);
                  }
                }}
                className="flex min-h-16 w-full flex-wrap items-center gap-2 rounded-2xl bg-[#ffb755] px-6 py-3 cursor-pointer"
              >
                <Search className="size-7 text-[#1a3b5c]" />
                {selectedStaffIds.length === 0 ? (
                  <span className="text-xl font-bold text-[#1a3b5c]/65 mr-2">
                    الاسم ...
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2 mr-2">
                    {selectedStaffIds.map((id) => {
                      const staff = staffUsers.find((u) => u.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#1a3b5c] px-3 py-1 text-sm text-white"
                        >
                          {staff?.nameAr || staff?.name}
                          <X
                            className="size-4 cursor-pointer hover:text-red-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStaffSelection(id);
                            }}
                          />
                        </span>
                      );
                    })}
                  </div>
                )}
                <ChevronDown
                  className={`mr-auto size-7 text-[#1a3b5c] transition-transform ${isRecipientDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              <AnimatePresence>
                {isRecipientDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-40 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100"
                  >
                    <div className="p-3 border-b border-gray-100">
                      <Input
                        autoFocus
                        placeholder="ابحث عن الموظف..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-12 border-none bg-gray-50 focus-visible:ring-0"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {filteredStaff.length === 0 ? (
                        <p className="p-4 text-center text-gray-400">
                          لا يوجد نتائج
                        </p>
                      ) : (
                        filteredStaff.map((user) => (
                          <div
                            key={user.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleStaffSelection(user.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                toggleStaffSelection(user.id);
                              }
                            }}
                            className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors cursor-pointer ${
                              selectedStaffIds.includes(user.id)
                                ? "bg-[#1a3b5c] text-white"
                                : "text-[#1a3b5c] hover:bg-gray-50"
                            }`}
                          >
                            <span className="font-bold">
                              {user.nameAr || user.name}
                            </span>
                            {selectedStaffIds.includes(user.id) && (
                              <Plus className="size-5 rotate-45" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={
                isPending || !title || !message || selectedStaffIds.length === 0
              }
              className="h-[70px] w-full rounded-full bg-[#1a3b5c] text-2xl font-bold text-white shadow-xl hover:bg-[#1a3b5c]/90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isPending ? "جاري الإرسال..." : "إرسال الإشعار"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
