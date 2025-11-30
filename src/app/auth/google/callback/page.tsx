"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Login failed. Please try again.");
      router.push("/login");
      return;
    }

    if (token) {
      // Store token
      localStorage.setItem("token", token);

      // Update auth state
      checkAuth()
        .then(() => {
          toast.success("Login successful!");
          router.push("/");
        })
        .catch(() => {
          toast.error("Failed to verify session.");
          router.push("/login");
        });
    } else {
      router.push("/login");
    }
  }, [searchParams, router, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
