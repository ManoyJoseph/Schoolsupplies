"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getSalesStats } from "@/lib/supabase/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [],
  });
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    setPageLoading(true);
    const { data, error } = await getSalesStats();
    if (data) {
      setStats(data);
    }
    setPageLoading(false);
  };

  if (loading || pageLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Skool So Fly - Sales Reports</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2">All time</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-2">Total Orders</div>
            <div className="text-4xl font-bold text-blue-600">{stats.totalOrders}</div>
            <div className="text-xs text-gray-500 mt-2">Completed orders</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-2">Average Order Value</div>
            <div className="text-4xl font-bold text-purple-600">${stats.avgOrderValue.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-2">Per transaction</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-2">Revenue Per Order</div>
            <div className="text-4xl font-bold text-orange-600">
              ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : "0.00"}
            </div>
            <div className="text-xs text-gray-500 mt-2">Performance metric</div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top 5 Products by Sales</h2>
          
          {stats.topProducts.length === 0 ? (
            <p className="text-gray-600">No sales data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Rank</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((item: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">#{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.products?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.quantity} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-bold">${stats.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-bold">{stats.totalOrders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Order Value:</span>
                <span className="font-bold">${stats.avgOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="font-bold">{stats.totalOrders > 0 ? "High" : "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Business Health</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-bold ${stats.totalOrders > 0 ? "text-green-600" : "text-gray-600"}`}>
                  {stats.totalOrders > 0 ? "Active" : "No Sales Yet"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Products Sold:</span>
                <span className="font-bold">
                  {stats.topProducts.reduce((sum: number, p: any) => sum + p.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Transaction:</span>
                <span className="font-bold">${(stats.totalRevenue / (stats.totalOrders || 1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Top Product:</span>
                <span className="font-bold">
                  {stats.topProducts[0]?.products?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
