"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendNewNotificationAction } from "@/lib/actions/staff-notifications";

export default function SendNotificationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("يرجى تعبئة العنوان والرسالة");
      return;
    }

    setIsPending(true);
    try {
      const result = await sendNewNotificationAction({
        title,
        message,
        recipientType: "all", // Simplified for admin for now as per design
      });

      if (result.success) {
        toast.success("تم إرسال الإشعار بنجاح");
        onClose();
        setTitle("");
        setMessage("");
      } else {
        toast.error(result.error || "فشل إرسال الإشعار");
      }
    } catch (_error) {
      toast.error("حدث خطأ ما");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[40px] bg-white p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-8" />
              </button>
              <h2 className="text-[32px] font-bold text-[#1a3b5c]">
                إرسال إشعار جديد
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="block text-right text-xl font-bold text-[#1a3b5c]"
                >
                  العنوان
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-14 rounded-[18px] border-2 border-[#ffb755] bg-white px-4 text-right text-lg text-[#1a3b5c]"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="message"
                  className="block text-right text-xl font-bold text-[#1a3b5c]"
                >
                  الرسالة
                </Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px] rounded-[26px] border-2 border-[#ffb755] bg-white p-4 text-right text-lg text-[#1a3b5c]"
                  dir="rtl"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="h-14 w-full rounded-full bg-[#ffb755] text-xl font-bold text-[#1a3b5c] hover:bg-[#ffb755]/90"
              >
                {isPending ? "جاري الإرسال..." : "إرسال الإشعار"}
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
