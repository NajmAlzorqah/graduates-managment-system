"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Major {
  id: string;
  name: string;
}

export default function ManageMajorsModal({
  isOpen,
  onClose,
  onMajorsChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  onMajorsChange: (majors: string[]) => void;
}) {
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMajorName, setNewMajorName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMajors();
    }
  }, [isOpen]);

  const fetchMajors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/majors");
      if (res.ok) {
        const data = await res.json();
        setMajors(data);
        onMajorsChange(data.map((m: Major) => m.name));
      }
    } catch (error) {
      toast.error("Failed to fetch majors");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMajorName.trim()) return;

    setProcessing(true);
    try {
      const res = await fetch("/api/majors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMajorName.trim() }),
      });

      if (res.ok) {
        toast.success("تم إضافة التخصص بنجاح");
        setNewMajorName("");
        fetchMajors();
      } else {
        const text = await res.text();
        toast.error(text || "حدث خطأ أثناء الإضافة");
      }
    } catch (error) {
      toast.error("حدث خطأ في الشبكة");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateMajor = async (id: string) => {
    if (!editingName.trim()) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/majors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (res.ok) {
        toast.success("تم تحديث التخصص بنجاح");
        setEditingId(null);
        fetchMajors();
      } else {
        const text = await res.text();
        toast.error(text || "حدث خطأ أثناء التحديث");
      }
    } catch (error) {
      toast.error("حدث خطأ في الشبكة");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteMajor = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف تخصص ${name}؟`)) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/majors/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("تم حذف التخصص بنجاح");
        fetchMajors();
      } else {
        toast.error("حدث خطأ أثناء الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ في الشبكة");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="إدارة التخصصات"
        onClick={(event) => event.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-xl font-bold text-[#1a3b5c]">إدارة التخصصات</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {/* Add New Major Form */}
          <form onSubmit={handleAddMajor} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newMajorName}
              onChange={(e) => setNewMajorName(e.target.value)}
              placeholder="اسم التخصص الجديد..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a3b5c]/20"
              disabled={processing}
            />
            <Button
              type="submit"
              disabled={processing || !newMajorName.trim()}
              className="bg-[#1a3b5c] text-white hover:bg-[#1a3b5c]/90 rounded-xl"
            >
              {processing && !editingId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "إضافة"
              )}
            </Button>
          </form>

          {/* Majors List */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#1a3b5c]/40" />
              </div>
            ) : majors.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد تخصصات مضافة</p>
            ) : (
              majors.map((major) => (
                <div
                  key={major.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  {editingId === major.id ? (
                    <div className="flex flex-1 gap-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#1a3b5c]/20 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateMajor(major.id)}
                        disabled={processing}
                        className="text-green-600 hover:text-green-700 font-bold text-sm"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={processing}
                        className="text-gray-500 hover:text-gray-600 text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[#1a3b5c] font-medium">{major.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(major.id);
                            setEditingName(major.name);
                          }}
                          className="p-1 text-gray-500 hover:text-[#1a3b5c] transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMajor(major.id, major.name)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
