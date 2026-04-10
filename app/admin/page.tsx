"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getSalesStats } from "@/lib/supabase/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SalesStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topProducts: any[];
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topProducts: [],
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      // TODO: Check if user is admin
      // For now, allow all logged-in users
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    const { data, error } = await getSalesStats();
    if (data) {
      setStats(data);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Skool So Fly - Admin</h1>
          <Link
            href="/role-select"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Avg Order Value</div>
            <div className="text-3xl font-bold text-gray-900">${stats.avgOrderValue.toFixed(2)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600">Top Products</div>
            <div className="text-3xl font-bold text-gray-900">{stats.topProducts.length}</div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/orders"
            className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders</h2>
            <p className="text-gray-600">Manage customer orders</p>
          </Link>
          <Link
            href="/admin/products"
            className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Products</h2>
            <p className="text-gray-600">Manage inventory</p>
          </Link>
          <Link
            href="/admin/reports"
            className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports</h2>
            <p className="text-gray-600">Sales analytics</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
