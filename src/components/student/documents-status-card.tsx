import type { DocumentItem } from "@/types/student";

type Props = {
  documents: DocumentItem[];
  className?: string;
};

const statusLabelMap: Record<DocumentItem["status"], string> = {
  accepted: "مقبول",
  pending: "قيد المراجعة",
  rejected: "مرفوض",
};

const statusColorMap: Record<DocumentItem["status"], string> = {
  accepted: "bg-[#ffb755] text-white",
  pending: "bg-gray-400 text-white",
  rejected: "bg-red-500 text-white",
};

export default function DocumentsStatusCard({
  documents,
  className = "",
}: Props) {
  return (
    <div
      className={`bg-white rounded-[36px] px-6 py-6 shadow-[0px_4px_20px_rgba(0,0,0,0.12)] ${className}`}
    >
      {/* Title */}
      <h2
        className="text-center text-[#1a3b5c] font-semibold text-xl mb-5 font-arabic"
        dir="rtl"
      >
        حالة المستندات
      </h2>

      {/* Document rows */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between bg-[#1a3b5c] rounded-[17px] px-5 py-4"
            dir="rtl"
          >
            {/* Document name — first child in RTL = right side */}
            <span className="text-white font-semibold text-base font-arabic leading-snug">
              {doc.label}
            </span>
            {/* Status badge — right-justified in RTL = left side */}
            <span
              className={`px-5 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap font-arabic ${statusColorMap[doc.status]}`}
            >
              {statusLabelMap[doc.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
