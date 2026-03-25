"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Poll every 10 seconds to keep the dashboard synced with staff updates
    const interval = setInterval(() => {
      router.refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
