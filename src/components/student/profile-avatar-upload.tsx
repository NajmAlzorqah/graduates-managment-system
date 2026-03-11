"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProfileAvatarUploadProps = {
  initialImageUrl?: string;
  className?: string;
};

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 12c2.8 0 5-2.2 5-5s-2.2-5-5-5-5 2.2-5 5 2.2 5 5 5Zm0 2c-3.9 0-8 2-8 5v2h16v-2c0-3-4.1-5-8-5Z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-[16px] w-[16px] text-[#1a3b5c]"
      aria-hidden="true"
    >
      <path
        d="m14 4 6 6m-3.5-7.5a2.1 2.1 0 0 1 3 3L8 17l-4 1 1-4L16.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProfileAvatarUpload({
  initialImageUrl,
  className,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayedSrc = previewUrl || initialImageUrl || null;

  function handleFilePick(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;

    const nextUrl = URL.createObjectURL(file);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(nextUrl);
  }

  return (
    <div
      className={[
        "relative h-[248px] w-[248px] rounded-full border border-[#123455] bg-[#f4b24d]",
        "shadow-[0_7px_0_0_rgba(16,45,74,0.65)] [animation:floatAvatar_3s_ease-in-out_infinite]",
        "sm:h-[264px] sm:w-[264px]",
        className ?? "",
      ].join(" ")}
    >
      {displayedSrc ? (
        <Image
          src={displayedSrc}
          alt="Student profile avatar"
          fill
          unoptimized
          className="rounded-full object-cover"
        />
      ) : (
        <UserIcon className="absolute left-[50%] top-[50%] h-[124px] w-[124px] -translate-x-[50%] -translate-y-[50%] text-[#1a3b5c]" />
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const selected = event.currentTarget.files?.[0] ?? null;
          handleFilePick(selected);
        }}
      />

      <button
        type="button"
        aria-label="Upload profile image"
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-[16px] right-[16px] flex h-[52px] w-[52px] items-center justify-center rounded-[50%] bg-white/70 shadow-md transition duration-300 hover:scale-105"
      >
        <EditIcon />
      </button>
    </div>
  );
}
