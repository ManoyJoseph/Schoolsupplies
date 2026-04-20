"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    totalItemsSold: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayTransactions, setTodayTransactions] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: transactions } = await supabase
      .from("transactions").select("*");

    const { data: items } = await supabase
      .from("transaction_items").select("*, products(name)");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayData } = await supabase
      .from("transactions").select("*")
      .gte("created_at", today.toISOString());

    const { data: recent } = await supabase
      .from("transactions").select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    const totalRevenue = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) ?? 0;
    const totalTransactions = transactions?.length ?? 0;
    const totalItemsSold = items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0;

    const productMap: { [key: string]: { name: string; qty: number; revenue: number } } = {};
    items?.forEach((item) => {
      const name = item.product_name || item.products?.name || "Unknown";
      if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0 };
      productMap[name].qty += item.quantity || 0;
      productMap[name].revenue += item.subtotal || 0;
    });
    const sorted = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    const todayRev = todayData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) ?? 0;

    setStats({
      totalRevenue,
      totalTransactions,
      avgTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      totalItemsSold,
    });
    setTopProducts(sorted);
    setTodayRevenue(todayRev);
    setTodayTransactions(todayData?.length ?? 0);
    setRecentTransactions(recent ?? []);
    setLoading(false);
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-96">
      <p className="text-gray-400">Loading reports...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Sales analytics and performance overview</p>
      </div>

      {/* Today's Stats */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          📅 Today
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-3xl font-bold text-blue-700">₱{todayRevenue.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Today's Revenue</p>
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6">
            <p className="text-3xl mb-2">🧾</p>
            <p className="text-3xl font-bold text-violet-700">{todayTransactions}</p>
            <p className="text-sm text-gray-600 mt-1">Today's Transactions</p>
          </div>
        </div>
      </div>

      {/* All Time Stats */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          📊 All Time
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { emoji: "💵", value: `₱${stats.totalRevenue.toFixed(2)}`, label: "Total Revenue", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
            { emoji: "🧾", value: stats.totalTransactions, label: "Transactions", color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
            { emoji: "📦", value: stats.totalItemsSold, label: "Items Sold", color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
            { emoji: "📈", value: `₱${stats.avgTransactionValue.toFixed(2)}`, label: "Avg Transaction", color: "text-violet-700", bg: "bg-violet-50 border-violet-100" },
          ].map((card) => (
            <div key={card.label} className={`${card.bg} border rounded-2xl p-5`}>
              <p className="text-2xl mb-2">{card.emoji}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-sm text-gray-600 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-900">🏆 Top Products</h2>
            <p className="text-xs text-gray-400 mt-0.5">By units sold</p>
          </div>
          {topProducts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-300 text-4xl mb-2">📦</p>
              <p className="text-gray-400 text-sm">No sales data yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl w-8 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.qty} units sold</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    ₱{p.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-lg font-bold text-gray-900">🕐 Recent Transactions</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 5 transactions</p>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-300 text-4xl mb-2">🧾</p>
              <p className="text-gray-400 text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-sm">🧾</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold text-blue-600">
                      #{t.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(t.created_at).toLocaleString("en-PH", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ₱{t.total_amount?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
