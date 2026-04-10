"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/supabase/auth";
import Link from "next/link";
import { useEffect } from "react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">School Supplies</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
          <p className="text-gray-600 mb-4">
            You are signed in as: <span className="font-semibold">{user.email}</span>
          </p>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✅ Your authentication is set up and working! You can now build out your app features.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/products"
            className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center cursor-pointer"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🛍️ Shop</h3>
            <p className="text-gray-600">Browse and buy school supplies</p>
          </Link>
          <Link
            href="/cart"
            className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center cursor-pointer"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🛒 Cart</h3>
            <p className="text-gray-600">View your shopping cart</p>
          </Link>
          <Link
            href="/admin"
            className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center cursor-pointer border-2 border-purple-200"
          >
            <h3 className="text-2xl font-bold text-purple-600 mb-2">⚙️ Admin</h3>
            <p className="text-gray-600">Manage orders & products</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
