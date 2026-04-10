"use client";

import { useCart } from "@/lib/cart-context";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Continue Shopping
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
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-6 border-b last:border-b-0"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">
                      {item.product.description}
                    </p>
                    <p className="text-blue-600 font-semibold mt-2">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex flex-col items-end justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.product.id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            Math.min(
                              item.product.stock_quantity,
                              item.quantity + 1
                            )
                          )
                        }
                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <Link
                href="/products"
                className="flex-1 text-center bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700"
              >
                Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="flex-1 text-center bg-red-100 text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-200"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 border-b pb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold mb-6">
                <span>Total:</span>
                <span>${(totalPrice + totalPrice * 0.1).toFixed(2)}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full block text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
