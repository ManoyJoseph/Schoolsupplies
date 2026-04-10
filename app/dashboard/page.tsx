"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to role selection
    router.push("/role-select");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}
