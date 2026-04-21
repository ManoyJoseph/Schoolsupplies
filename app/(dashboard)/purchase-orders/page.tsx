"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("purchase_orders")
      .select(`
        *,
        suppliers(name, email, phone),
        purchase_order_items(*, products(name, stock_quantity))
      `)
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const handleMarkReceived = async (order: any) => {
    if (!confirm("Mark this order as received? This will update stock levels.")) return;

    const supabase = createClient();

    // Update stock for each item
    for (const item of order.purchase_order_items) {
      const currentStock = item.products?.stock_quantity || 0;
      await supabase
        .from("products")
        .update({ stock_quantity: currentStock + item.quantity_ordered })
        .eq("id", item.product_id);
    }

    // Mark order as received
    await supabase
      .from("purchase_orders")
      .update({ status: "received" })
      .eq("id", order.id);

    fetchOrders();
    alert("✅ Stock updated successfully!");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this order?")) return;
    const supabase = createClient();
    await supabase
      .from("purchase_orders")
      .update({ status: "cancelled" })
      .eq("id", id);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "received":
        return "bg-emerald-100 text-emerald-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "pending": return "⏳";
      case "received": return "✅";
      case "cancelled": return "❌";
      default: return "❓";
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage supplier orders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
          <p className="text-2xl mb-2">⏳</p>
          <p className="text-2xl font-bold text-orange-600">
            {orders.filter((o) => o.status === "pending").length}
          </p>
          <p className="text-sm text-gray-600">Pending Orders</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-2xl font-bold text-emerald-600">
            {orders.filter((o) => o.status === "received").length}
          </p>
          <p className="text-sm text-gray-600">Received Orders</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <p className="text-2xl mb-2">❌</p>
          <p className="text-2xl font-bold text-red-600">
            {orders.filter((o) => o.status === "cancelled").length}
          </p>
          <p className="text-sm text-gray-600">Cancelled Orders</p>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 font-medium">No purchase orders yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Go to Suppliers and click "Place Order"
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">
                    📋
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      From: <span className="font-semibold text-blue-600">
                        {order.suppliers?.name}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                    {getStatusEmoji(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("en-PH", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Items Ordered
                </p>
                <div className="space-y-2">
                  {order.purchase_order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Current stock: {item.products?.stock_quantity ?? "—"}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        +{item.quantity_ordered} units
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplier Contact */}
              {order.suppliers?.email && (
                <p className="text-xs text-gray-400 mb-4">
                  📧 {order.suppliers.email}
                  {order.suppliers.phone && ` · 📞 ${order.suppliers.phone}`}
                </p>
              )}

              {/* Actions */}
              {order.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMarkReceived(order)}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-all"
                  >
                    ✅ Mark as Received
                  </button>
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {order.status === "received" && (
                <div className="py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <p className="text-emerald-700 font-semibold text-sm">
                    ✅ Stock has been updated
                  </p>
                </div>
              )}

              {order.status === "cancelled" && (
                <div className="py-2.5 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-red-600 font-semibold text-sm">
                    ❌ This order was cancelled
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
