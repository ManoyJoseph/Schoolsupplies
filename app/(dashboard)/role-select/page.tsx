"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const dynamic = "force-dynamic";

export default function RoleSelectionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3">Skool So Fly</h1>
          <p className="text-lg text-gray-400">Select your role to continue</p>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {/* Buyer Card */}
          <Link
            href="/products"
            className="block bg-black border-2 border-black rounded-2xl p-8 text-center hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🛍️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Buyer</h2>
            <p className="text-gray-300">Browse and purchase products</p>
          </Link>

          {/* Admin Card */}
          <Link
            href="/admin"
            className="block bg-white border-2 border-black rounded-2xl p-8 text-center hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
            <h2 className="text-2xl font-bold text-black mb-2">Admin</h2>
            <p className="text-gray-700">Manage inventory and view analytics</p>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">Logged in as: {user.email}</p>
          <Link
            href="/login"
            className="text-gray-400 hover:text-white text-sm underline"
          >
            Sign in with a different account
          </Link>
        </div>
      </div>
    </div>
  );
}
