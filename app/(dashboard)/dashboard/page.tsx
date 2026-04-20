"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todaySales: 0,
    totalTransactions: 0,
    lowStockItems: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();

      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: lowStockItems } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .lt("stock_quantity", 10);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayTransactions } = await supabase
        .from("transactions")
        .select("total_amount")
        .gte("created_at", today.toISOString());

      const todaySales = todayTransactions?.reduce(
        (sum, t) => sum + (t.total_amount || 0), 0) ?? 0;

      const { count: totalTransactions } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });

      setStats({
        todaySales,
        totalTransactions: totalTransactions ?? 0,
        lowStockItems: lowStockItems ?? 0,
        totalProducts: totalProducts ?? 0,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  const cards = [
    {
      label: "Today's Sales",
      value: `₱${stats.todaySales.toFixed(2)}`,
      emoji: "💰",
      bg: "bg-blue-50",
      border: "border-blue-100",
      valueColor: "text-blue-700",
      desc: "Revenue today",
    },
    {
      label: "Total Transactions",
      value: stats.totalTransactions,
      emoji: "🧾",
      bg: "bg-violet-50",
      border: "border-violet-100",
      valueColor: "text-violet-700",
      desc: "All time sales",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      emoji: "📦",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      valueColor: "text-emerald-700",
      desc: "In inventory",
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStockItems,
      emoji: "⚠️",
      bg: "bg-orange-50",
      border: "border-orange-100",
      valueColor: stats.lowStockItems > 0 ? "text-orange-600" : "text-gray-400",
      desc: "Items below 10",
    },
  ];

  const quickActions = [
    { label: "New Sale", href: "/pos", emoji: "🛒", color: "bg-blue-500 hover:bg-blue-600" },
    { label: "Add Product", href: "/inventory", emoji: "📦", color: "bg-emerald-500 hover:bg-emerald-600" },
    { label: "Transactions", href: "/transactions", emoji: "🧾", color: "bg-violet-500 hover:bg-violet-600" },
    { label: "Reports", href: "/reports", emoji: "📊", color: "bg-orange-500 hover:bg-orange-600" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's your store overview for today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} border ${card.border} rounded-2xl p-5`}
          >
            <div className="text-2xl mb-3">{card.emoji}</div>
            <p className={`text-2xl font-bold ${card.valueColor}`}>
              {loading ? "..." : card.value}
            </p>
            <p className="text-sm font-medium text-gray-700 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`${action.color} text-white flex flex-col items-center gap-2 p-4 rounded-xl transition-all`}
            >
              <span className="text-2xl">{action.emoji}</span>
              <span className="text-sm font-semibold">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Today's Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₱{loading ? "..." : stats.todaySales.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Transactions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? "..." : stats.totalTransactions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
