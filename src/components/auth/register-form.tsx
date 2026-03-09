"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { RegisterActionState } from "@/lib/actions/auth";
import { registerAction } from "@/lib/actions/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<RegisterActionState>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await registerAction({}, formData);
      if (result.success) {
        router.push("/pending");
      } else {
        setState(result);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {/* Name */}
      <div className="flex items-center gap-3 bg-[#FFF3E4] rounded-full px-5 py-4">
        {/* Pencil icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-hidden="true"
        >
          <path
            d="M19 3l6 6-14 14H5v-6L19 3Z"
            stroke="#1a3b5c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 6l6 6"
            stroke="#1a3b5c"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          name="name"
          placeholder="name"
          required
          disabled={isPending}
          className="flex-1 bg-transparent outline-none text-[#1a3b5cc7] font-semibold text-[18px] placeholder:text-[#1a3b5cc7] placeholder:font-semibold disabled:opacity-60"
          autoComplete="name"
        />
      </div>
      {state.fieldErrors?.name && (
        <p className="text-red-800 bg-red-100 rounded-2xl px-4 py-2 text-sm text-center font-medium -mt-2">
          {state.fieldErrors.name}
        </p>
      )}

      {/* Academic ID */}
      <div className="flex items-center gap-3 bg-[#FFF3E4] rounded-full px-5 py-4">
        {/* Person icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-hidden="true"
        >
          <circle cx="14" cy="9" r="5" stroke="#1a3b5c" strokeWidth="2" />
          <path
            d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10"
            stroke="#1a3b5c"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          name="academicId"
          placeholder="academic ID"
          required
          disabled={isPending}
          className="flex-1 bg-transparent outline-none text-[#1a3b5cc7] font-semibold text-[18px] placeholder:text-[#1a3b5cc7] placeholder:font-semibold disabled:opacity-60"
          autoComplete="username"
        />
      </div>
      {state.fieldErrors?.academicId && (
        <p className="text-red-800 bg-red-100 rounded-2xl px-4 py-2 text-sm text-center font-medium -mt-2">
          {state.fieldErrors.academicId}
        </p>
      )}

      {/* Email */}
      <div className="flex items-center gap-3 bg-[#FFF3E4] rounded-full px-5 py-4">
        {/* Envelope icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="6"
            width="22"
            height="16"
            rx="2"
            stroke="#1a3b5c"
            strokeWidth="2"
          />
          <path
            d="M3 8l11 8 11-8"
            stroke="#1a3b5c"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="email"
          name="email"
          placeholder="email"
          required
          disabled={isPending}
          className="flex-1 bg-transparent outline-none text-[#1a3b5cc7] font-semibold text-[18px] placeholder:text-[#1a3b5cc7] placeholder:font-semibold disabled:opacity-60"
          autoComplete="email"
        />
      </div>
      {state.fieldErrors?.email && (
        <p className="text-red-800 bg-red-100 rounded-2xl px-4 py-2 text-sm text-center font-medium -mt-2">
          {state.fieldErrors.email}
        </p>
      )}

      {/* Password */}
      <div className="flex items-center gap-3 bg-[#FFF3E4] rounded-full px-5 py-4">
        {/* Eye icon toggle */}
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="shrink-0 cursor-pointer"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 14s3.5-7 11-7 11 7 11 7-3.5 7-11 7S3 14 3 14Z"
                stroke="#1a3b5c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="14" cy="14" r="3" stroke="#1a3b5c" strokeWidth="2" />
              <line
                x1="4"
                y1="4"
                x2="24"
                y2="24"
                stroke="#1a3b5c"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 14s3.5-7 11-7 11 7 11 7-3.5 7-11 7S3 14 3 14Z"
                stroke="#1a3b5c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="14" cy="14" r="3" stroke="#1a3b5c" strokeWidth="2" />
            </svg>
          )}
        </button>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="password"
          required
          disabled={isPending}
          className="flex-1 bg-transparent outline-none text-[#1a3b5cc7] font-semibold text-[18px] placeholder:text-[#1a3b5cc7] placeholder:font-semibold disabled:opacity-60"
          autoComplete="new-password"
        />
      </div>
      {state.fieldErrors?.password && (
        <p className="text-red-800 bg-red-100 rounded-2xl px-4 py-2 text-sm text-center font-medium -mt-2">
          {state.fieldErrors.password}
        </p>
      )}

      {/* Confirm Password */}
      <div className="flex items-center gap-3 bg-[#FFF3E4] rounded-full px-5 py-4">
        {/* Lock / padlock icon toggle */}
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          className="shrink-0 cursor-pointer"
          aria-label={
            showConfirm ? "Hide confirm password" : "Show confirm password"
          }
        >
          {showConfirm ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="12"
                width="20"
                height="13"
                rx="2"
                stroke="#1a3b5c"
                strokeWidth="2"
              />
              <path
                d="M9 12V8a5 5 0 0 1 10 0v4"
                stroke="#1a3b5c"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="18" r="1.5" fill="#1a3b5c" />
              <line
                x1="4"
                y1="4"
                x2="24"
                y2="24"
                stroke="#1a3b5c"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="4"
                y="12"
                width="20"
                height="13"
                rx="2"
                stroke="#1a3b5c"
                strokeWidth="2"
              />
              <path
                d="M9 12V8a5 5 0 0 1 10 0v4"
                stroke="#1a3b5c"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="14" cy="18" r="1.5" fill="#1a3b5c" />
            </svg>
          )}
        </button>
        <input
          type={showConfirm ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm password"
          required
          disabled={isPending}
          className="flex-1 bg-transparent outline-none text-[#1a3b5cc7] font-semibold text-[18px] placeholder:text-[#1a3b5cc7] placeholder:font-semibold disabled:opacity-60"
          autoComplete="new-password"
        />
      </div>
      {state.fieldErrors?.confirmPassword && (
        <p className="text-red-800 bg-red-100 rounded-2xl px-4 py-2 text-sm text-center font-medium -mt-2">
          {state.fieldErrors.confirmPassword}
        </p>
      )}

      {/* Global error */}
      {state.error && (
        <p className="text-red-800 bg-red-100 rounded-2xl px-4 py-2 text-sm text-center font-medium">
          {state.error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#1a3b5c] text-white rounded-full py-4 text-[22px] font-normal mt-2 transition-opacity disabled:opacity-60 hover:opacity-90 active:opacity-80 cursor-pointer"
      >
        {isPending ? "signing up…" : "sign up"}
      </button>

      {/* Already have an account */}
      <p className="text-center text-[#1a3b5c] text-[15px] mt-1">
        already have an account?{" "}
        <Link
          href="/login"
          className="text-[#fff3e4] font-semibold hover:underline"
        >
          login
        </Link>
      </p>
    </form>
  );
}
