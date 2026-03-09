"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, {});
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-5 w-full">
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

      {/* Password */}
      <div className="flex items-center gap-3 bg-[#FFF3E4] rounded-full px-5 py-4">
        {/* Eye icon */}
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
          autoComplete="current-password"
        />
      </div>

      {/* Error message */}
      {state.error && (
        <p className="text-red-800 bg-red-100 rounded-2xl px-4 py-2 text-sm text-center font-medium">
          {state.error}
        </p>
      )}

      {/* Remember me + Forget password */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 px-1">
        <button
          type="button"
          onClick={() => setRememberMe((v) => !v)}
          className="flex items-center gap-2 cursor-pointer"
          aria-pressed={rememberMe}
        >
          {/* Toggle pill */}
          <div
            className={`w-[46px] h-[26px] rounded-full flex items-center px-1 transition-colors duration-200 ${
              rememberMe ? "bg-[#1a3b5c]" : "bg-[#3a5a7c]"
            }`}
          >
            <div
              className={`w-[20px] h-[20px] rounded-full bg-white shadow transition-transform duration-200 ${
                rememberMe ? "translate-x-[20px]" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-[#1a3b5c] text-[18px] font-normal">
            remember me
          </span>
        </button>
        <Link
          href="/forgot-password"
          className="text-[#1a3b5c] text-[18px] font-normal hover:underline"
        >
          forget password?
        </Link>
      </div>

      {/* Login button */}
      <button
        type="submit"
        disabled={isPending}
        className="bg-[#1a3b5c] text-white text-xl font-normal rounded-full py-3 px-10 mx-auto w-[200px] hover:bg-[#14304d] transition-colors duration-200 active:scale-95 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? "logging in…" : "login"}
      </button>

      {/* Sign up */}
      <p className="text-center text-[#1a3b5c] text-[14px] mt-1">
        Dont Have a account?{" "}
        <Link
          href="/register"
          className="text-[#FFF3E4] font-semibold hover:underline"
        >
          sing up
        </Link>
      </p>
    </form>
  );
}
