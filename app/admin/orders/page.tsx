"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getAllOrders, updateOrderStatus } from "@/lib/supabase/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      fetchOrders();
    }
  }, [user, loading, router]);

  const fetchOrders = async () => {
    setPageLoading(true);
    const { data, error } = await getAllOrders();
    if (data) {
      setOrders(data);
      const statusMap: { [key: string]: string } = {};
      data.forEach((order: any) => {
        statusMap[order.id] = order.status || "pending";
      });
      setSelectedStatus(statusMap);
    }
    setPageLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setSelectedStatus((prev) => ({
      ...prev,
      [orderId]: newStatus,
    }));

    const { error } = await updateOrderStatus(orderId, newStatus);
    if (error) {
      alert("Failed to update order status");
      // Revert on error
      fetchOrders();
    }
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
          <h1 className="text-4xl font-bold text-gray-900">Orders Management</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Items</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                    No orders yet
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">${order.total_price?.toFixed(2) || "0.00"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.order_items?.length || 0} items</td>
                    <td className="px-6 py-4">
                      <select
                        value={selectedStatus[order.id] || "pending"}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
