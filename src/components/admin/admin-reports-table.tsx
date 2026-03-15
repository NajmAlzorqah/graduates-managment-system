"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { StudentReport } from "@/types/admin";

type AdminReportsTableProps = {
  rows: StudentReport[];
};

const TABLE_HEADERS = [
  "الاسم الكامل",
  "البريد الالكتروني",
  "الرقم الاكاديمي",
  "التخصص",
  "سنة التخرج",
  "حالة الشهادة",
] as const;

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 44 45"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 3C10.611 3 3 10.611 3 20C3 29.389 10.611 37 20 37C29.389 37 37 29.389 37 20C37 10.611 29.389 3 20 3ZM0 20C0 8.954 8.954 0 20 0C31.046 0 40 8.954 40 20C40 31.046 31.046 40 20 40C8.954 40 0 31.046 0 20Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.657 34.243L43.707 43.293L41.293 45.707L32.243 36.657L34.657 34.243Z"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 12 8"
      className="pointer-events-none h-3 w-3 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 1.5L6 6.5L11 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function exportCsv(rows: StudentReport[]): void {
  const header = [
    "الاسم الكامل",
    "البريد الالكتروني",
    "الرقم الاكاديمي",
    "التخصص",
    "سنة التخرج",
    "حالة الشهادة",
  ];

  const dataRows = rows.map((row) => [
    row.nameAr || "",
    row.email,
    row.academicId,
    row.major || "",
    row.graduationYear?.toString() || "",
    row.certificateStatus,
  ]);

  const csv = [
    header.join(","),
    ...dataRows.map((line) =>
      line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    ),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `admin-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function openPrintWindow(rows: StudentReport[]): void {
  const printWindow = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=1200,height=800",
  );

  if (!printWindow) {
    toast.error("Unable to open print window");
    return;
  }

  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td>${row.nameAr || ""}</td>
          <td>${row.email}</td>
          <td>${row.academicId}</td>
          <td>${row.major || ""}</td>
          <td>${row.graduationYear || ""}</td>
          <td>${row.certificateStatus}</td>
        </tr>
      `,
    )
    .join("");

  printWindow.document.write(`
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>Admin Reports</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #1a3b5c; }
          h1 { margin-bottom: 16px; text-align: center; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #d7dce2; padding: 10px; text-align: right; }
          th { background: #1a3b5c; color: #fff; }
          tr:nth-child(even) { background: #f6f7f9; }
        </style>
      </head>
      <body>
        <h1>التقارير</h1>
        <table>
          <thead>
            <tr>
              <th>الاسم الكامل</th>
              <th>البريد الالكتروني</th>
              <th>الرقم الاكاديمي</th>
              <th>التخصص</th>
              <th>سنة التخرج</th>
              <th>حالة الشهادة</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export default function AdminReportsTable({ rows }: AdminReportsTableProps) {
  const [query, setQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const majors = useMemo(
    () => [
      ...new Set(
        rows
          .map((row) => row.major)
          .filter((major): major is string => !!major),
      ),
    ],
    [rows],
  );
  const years = useMemo(
    () =>
      [
        ...new Set(
          rows
            .map((row) => row.graduationYear)
            .filter((year): year is number => !!year),
        ),
      ].sort((a, b) => b - a),
    [rows],
  );
  const statuses = useMemo(
    () => [...new Set(rows.map((row) => row.certificateStatus))],
    [rows],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        (row.nameAr || "").toLowerCase().includes(normalizedQuery) ||
        row.email.toLowerCase().includes(normalizedQuery) ||
        row.academicId.toLowerCase().includes(normalizedQuery);
      const matchesMajor =
        selectedMajor.length === 0 || row.major === selectedMajor;
      const matchesYear =
        selectedYear.length === 0 ||
        row.graduationYear?.toString() === selectedYear;
      const matchesStatus =
        selectedStatus.length === 0 || row.certificateStatus === selectedStatus;

      return matchesQuery && matchesMajor && matchesYear && matchesStatus;
    });
  }, [rows, query, selectedMajor, selectedYear, selectedStatus]);

  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      toast.error("No reports available to export");
      return;
    }

    exportCsv(filteredRows);
    toast.success("Excel export is ready");
  };

  const handleExportPdf = () => {
    if (filteredRows.length === 0) {
      toast.error("No reports available to export");
      return;
    }

    openPrintWindow(filteredRows);
    toast.success("PDF view opened");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6"
      dir="rtl"
    >
      <header className="flex flex-col items-center justify-center gap-6 mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">التقارير</h1>

        <div className="flex flex-col gap-4 w-full lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-[440px]">
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#f6b651]">
              <SearchIcon />
            </div>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="h-[52px] w-full rounded-full bg-white pl-10 pr-4 text-left text-base font-normal text-[#4e6078] shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] outline-none transition focus:ring-2 focus:ring-[#f6b651]"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:gap-4">
            <div className="relative block min-w-[140px]">
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="h-[52px] w-full appearance-none rounded-full bg-[#f6b651] px-4 pl-10 text-right text-base font-normal leading-none text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] outline-none transition focus:ring-2 focus:ring-white/80"
              >
                <option value="">سنة التخرج</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white">
                <ChevronDownIcon />
              </span>
            </div>

            <div className="relative block min-w-[140px]">
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="h-[52px] w-full appearance-none rounded-full bg-[#f6b651] px-4 pl-10 text-right text-base font-normal leading-none text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] outline-none transition focus:ring-2 focus:ring-white/80"
              >
                <option value="">حالة الشهادة</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white">
                <ChevronDownIcon />
              </span>
            </div>

            <div className="relative block min-w-[140px]">
              <select
                value={selectedMajor}
                onChange={(event) => setSelectedMajor(event.target.value)}
                className="h-[52px] w-full appearance-none rounded-full bg-[#f6b651] px-4 pl-10 text-right text-base font-normal leading-none text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] outline-none transition focus:ring-2 focus:ring-white/80"
              >
                <option value="">القسم</option>
                {majors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="rounded-[40px] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <div className="overflow-x-auto">
          <table className="hidden w-full min-w-[1000px] border-separate border-spacing-y-3 md:table">
            <thead>
              <tr className="h-[64px] rounded-full bg-[#1a3b5c] text-white">
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="px-4 text-center text-xl font-medium first:rounded-r-full last:rounded-l-full"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredRows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{
                      duration: 0.24,
                      delay: index * 0.035,
                      ease: "easeOut",
                    }}
                    className="h-[64px] bg-[#f6b651] text-[#1a3b5c] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                  >
                    <td className="rounded-r-full px-4 text-center text-lg font-bold leading-tight">
                      {row.nameAr || "---"}
                    </td>
                    <td className="px-4 text-center text-base font-medium">
                      {row.email}
                    </td>
                    <td className="px-4 text-center text-base font-medium">
                      {row.academicId}
                    </td>
                    <td className="px-4 text-center text-base font-medium">
                      {row.major || "---"}
                    </td>
                    <td className="px-4 text-center text-base font-medium">
                      {row.graduationYear || "---"}
                    </td>
                    <td className="rounded-l-full px-4 text-center text-base font-medium">
                      {row.certificateStatus}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          <div className="space-y-3 md:hidden">
            <AnimatePresence>
              {filteredRows.map((row) => (
                <motion.article
                  key={row.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="rounded-[24px] bg-[#f6b651] p-4 text-[#1a3b5c] shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
                >
                  <p className="text-lg font-bold">{row.nameAr || "---"}</p>
                  <p className="mt-1 text-base break-all">{row.email}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="font-bold">الرقم:</span> {row.academicId}
                    </p>
                    <p>
                      <span className="font-bold">التخصص:</span>{" "}
                      {row.major || "---"}
                    </p>
                    <p>
                      <span className="font-bold">السنة:</span>{" "}
                      {row.graduationYear || "---"}
                    </p>
                    <p>
                      <span className="font-bold">الحالة:</span>{" "}
                      {row.certificateStatus}
                    </p>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {filteredRows.length === 0 ? (
            <p className="py-8 text-center text-lg text-[#1a3b5c]">
              No matching records found.
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-6 mt-12 sm:flex-row"
        dir="ltr"
      >
        <p className="text-2xl font-bold text-white md:text-3xl">Export to</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-[64px] min-w-[140px] rounded-full bg-[#f6b651] px-8 text-2xl font-bold text-[#1a3b5c] shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/90"
          >
            Excel
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="h-[64px] min-w-[140px] rounded-full bg-[#f6b651] px-8 text-2xl font-bold text-[#1a3b5c] shadow-[0_8px_16px_rgba(0,0,0,0.2)] transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/90"
          >
            PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}
