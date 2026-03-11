"use client";

import { useTransition } from "react";
import { logoutAction } from "@/lib/actions/logout";

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={`inline-flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-[#1a3b5c] px-3.5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(0,0,0,0.22)] transition-all duration-200 hover:bg-[#14314d] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      aria-label="Logout"
    >
      {/* Logout icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="16 17 21 12 16 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="21"
          y1="12"
          x2="9"
          y2="12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
