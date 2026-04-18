"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-gray-900 text-white shadow-lg flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Skool So Fly</h1>
        <p className="text-sm text-gray-400">POS System</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-800 bg-gray-800">
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-gray-400">Staff Member</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <Link
          href="/dashboard"
          className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
        >
          📊 Dashboard
        </Link>
        <Link
          href="/pos"
          className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
        >
          🛒 POS Register
        </Link>
        <Link
          href="/inventory"
          className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
        >
          📦 Inventory
        </Link>
        <Link
          href="/transactions"
          className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
        >
          💳 Transactions
        </Link>
        <Link
          href="/reports"
          className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
        >
          📈 Reports
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
