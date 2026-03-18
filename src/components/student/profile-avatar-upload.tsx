"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProfileAvatarUploadProps = {
  initialImageUrl?: string | null;
  className?: string;
  onFileSelect?: (file: File) => void;
  onDelete?: () => void;
};

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 231 215"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M115.5 107.5C144.219 107.5 167.5 84.2188 167.5 55.5C167.5 26.7812 144.219 3.5 115.5 3.5C86.7812 3.5 63.5 26.7812 63.5 55.5C63.5 84.2188 86.7812 107.5 115.5 107.5Z"
        fill="#1a3b5c"
      />
      <path
        d="M38.5 193.5C38.5 156.5 73.1667 126.5 115.5 126.5C157.833 126.5 192.5 156.5 192.5 193.5V211.5H38.5V193.5Z"
        fill="#1a3b5c"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 82 75"
      fill="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle cx="41" cy="37.5" r="37.5" fill="#E9EEF3" fillOpacity="0.8" />
      <path
        d="M57 48C57 49.6569 55.6569 51 54 51H28C26.3431 51 25 49.6569 25 48V32C25 30.3431 26.3431 29 28 29H33L35 25H47L49 29H54C55.6569 29 57 30.3431 57 32V48Z"
        fill="#1A3B5C"
      />
      <circle cx="41" cy="40" r="5" fill="#E9EEF3" />
      
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
className="h-1 w-1 sm:h-3 sm:w-3"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export default function ProfileAvatarUpload({
  initialImageUrl,
  className,
  onFileSelect,
  onDelete,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    setIsDeleted(false);
  }, [initialImageUrl]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayedSrc = isDeleted ? null : (previewUrl || initialImageUrl || null);

  function handleFilePick(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;

    const nextUrl = URL.createObjectURL(file);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(nextUrl);
    setIsDeleted(false);
    onFileSelect?.(file);
  }

  function handleDelete() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setIsDeleted(true);
    onDelete?.();
  }

  return (
    <div
      className={[
        "relative flex items-center justify-center rounded-full",
        className ?? "",
      ].join(" ")}
    >
      {/* Outer Glow/Circle */}
      <div className="absolute h-[110%] w-[110%] rounded-full bg-[#1a3b5c] opacity-20 shadow-[0_0_40px_rgba(0,0,0,0.3)]" />

      {/* Main Avatar Circle */}
      <div className="relative h-[240px] w-[240px] overflow-hidden rounded-full bg-[#ffb755] transition-transform duration-300 hover:scale-[1.02] sm:h-[280px] sm:w-[280px]">
        {displayedSrc ? (
          <Image
            src={displayedSrc}
            alt="Student profile avatar"
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <UserIcon className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const selected = event.currentTarget.files?.[0] ?? null;
          handleFilePick(selected);
        }}
      />

      <div className="absolute bottom-[5%] right-[5%] flex flex-col gap-2">
        {displayedSrc && (
          <button
            type="button"
            aria-label="Delete profile image"
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition duration-300 hover:scale-110 sm:h-10 sm:w-10"
          >
            <TrashIcon />
          </button>
        )}
        <button
          type="button"
          aria-label="Upload profile image"
          onClick={() => inputRef.current?.click()}
          className="h-[60px] w-[60px] transition duration-300 hover:scale-110 sm:h-[70px] sm:w-[70px]"
        >
          <CameraIcon />
        </button>
      </div>
    </div>
  );
}
