"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { saveToken } from "@/lib/auth";

export default function AuthCallback() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      saveToken(token);
      window.location.href = "/chat";    
    } 
    else {
      window.location.href = "/";
    }
  }, [searchParams]);

  return (
    <main className="flex items-center justify-center h-[60vh]">
      <p className="text-sm text-ink/60">Signing you in...</p>
    </main>
  );
}