"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select(`*, transaction_items(*)`)
      .order("created_at", { ascending: false });
    if (data) setTransactions(data);
    setLoading(false);
  };

  const filtered = transactions.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
  const todayTransactions = transactions.filter((t) => {
    const today = new Date();
    const tDate = new Date(t.created_at);
    return tDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 mt-1">All POS sales history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <p className="text-2xl mb-2">💰</p>
          <p className="text-2xl font-bold text-blue-700">₱{totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
        </div>
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5">
          <p className="text-2xl mb-2">🧾</p>
          <p className="text-2xl font-bold text-violet-700">{transactions.length}</p>
          <p className="text-sm text-gray-600 mt-1">Total Transactions</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
          <p className="text-2xl mb-2">📅</p>
          <p className="text-2xl font-bold text-emerald-700">₱{todayRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-1">Today's Revenue</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
          <p className="text-2xl mb-2">📊</p>
          <p className="text-2xl font-bold text-orange-600">
            ₱{transactions.length > 0 ? (totalRevenue / transactions.length).toFixed(2) : "0.00"}
          </p>
          <p className="text-sm text-gray-600 mt-1">Avg Transaction</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tendered</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-gray-400 text-4xl mb-2">🧾</p>
                  <p className="text-gray-400 font-medium">No transactions yet</p>
                  <p className="text-gray-300 text-sm mt-1">Complete a sale in POS Register</p>
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                      #{t.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-medium">
                      {t.transaction_items?.length || 0} items
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">
                      ₱{t.total_amount?.toFixed(2) || "0.00"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      ₱{t.amount_tendered?.toFixed(2) || "0.00"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-emerald-600">
                      ₱{t.change_amount?.toFixed(2) || "0.00"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">
                        {new Date(t.created_at).toLocaleDateString("en-PH", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(t.created_at).toLocaleTimeString("en-PH", {
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
