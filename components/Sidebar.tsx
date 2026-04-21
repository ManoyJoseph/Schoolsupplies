"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  ClipboardList,
  CreditCard,
  BarChart3,
  LogOut,
  Store,
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRole() {
      if (!user) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setRole(data?.role ?? null);
    }
    fetchRole();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const adminLinks = [
    { href: "/pos", label: "POS Register", icon: ShoppingCart },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/suppliers", label: "Suppliers", icon: Truck },
    { href: "/purchase-orders", label: "Purchase Orders", icon: ClipboardList },
    { href: "/transactions", label: "Transactions", icon: CreditCard },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  const cashierLinks = [
    { href: "/pos", label: "POS Register", icon: ShoppingCart },
  ];

  const links = role === "admin" ? adminLinks : cashierLinks;

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col"
      style={{ background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" }}
    >
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
            <Store size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Skool So Fly</h1>
            <p className="text-slate-400 text-xs mt-0.5">POS System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.email}</p>
              <p className={`text-xs font-semibold mt-0.5 ${
                role === "admin" ? "text-yellow-400" : "text-green-400"
              }`}>
                {role === "admin" ? "Admin" : "Cashier"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
          Menu
        </p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium text-sm">{link.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}