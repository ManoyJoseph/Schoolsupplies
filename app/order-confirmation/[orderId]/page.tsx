"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderById, getOrderItems } from "@/lib/supabase/database";
import { Order, OrderItem, Product } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data: orderData, error: orderError } = await getOrderById(orderId);
        if (orderError || !orderData) {
          throw new Error(orderError?.message || "Order not found");
        }

        const { data: itemsData, error: itemsError } = await getOrderItems(orderId);
        if (itemsError) {
          throw new Error(itemsError.message);
        }

        setOrder(orderData);
        setOrderItems(itemsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Order Confirmation</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-6">{error}</p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Back to Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmation</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-green-600 text-3xl">✓</div>
            <div>
              <h2 className="text-2xl font-bold text-green-900">Order Placed Successfully!</h2>
              <p className="text-green-700 mt-1">
                Thank you for your purchase. Your order has been confirmed.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            {/* Order Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-xl font-semibold mb-6">Order Information</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm">Order ID</p>
                  <p className="text-lg font-semibold text-gray-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Order Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <p className="text-lg font-semibold text-blue-600 capitalize">
                    {order.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${order.total_price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-6">Order Items</h3>

              {orderItems.length === 0 ? (
                <p className="text-gray-600">No items in this order</p>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                      <div>
                        <p className="font-semibold text-gray-900">Product ID: {item.product_id}</p>
                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.price_at_purchase.toFixed(2)} each</p>
                        <p className="text-gray-600">
                          ${(item.price_at_purchase * item.quantity).toFixed(2)} total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-xl font-semibold mb-6">Order Summary</h3>

              <div className="space-y-4 pb-6 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${(order.total_price / 1.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%):</span>
                  <span>${(order.total_price / 1.1 * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold pt-6 mb-6">
                <span>Total:</span>
                <span className="text-blue-600">${order.total_price.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <Link
                  href="/products"
                  className="block text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/dashboard"
                  className="block text-center bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
                >
                  View Account
                </Link>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  📧 A confirmation email has been sent to your email address with order details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
