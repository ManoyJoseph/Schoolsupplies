"use client";

import { useState, useEffect } from "react";
import { getProducts, getCategories } from "@/lib/supabase/database";
import { Product, Category } from "@/lib/types/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: categoriesData } = await getCategories();
      setCategories(categoriesData || []);

      const { data: productsData } = await getProducts();
      setProducts(productsData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const addToOrder = (product: Product, qty: number) => {
    if (qty <= 0) return;

    const existingItem = orderItems.find(item => item.product_id === product.id);
    if (existingItem) {
      setOrderItems(
        orderItems.map(item =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + qty,
                subtotal: (item.quantity + qty) * item.price,
              }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          product_id: product.id,
          product_name: product.name,
          price: product.price || 0,
          quantity: qty,
          subtotal: (qty * (product.price || 0)),
        },
      ]);
    }
    setQuantity({ ...quantity, [product.id]: 0 });
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromOrder(productId);
    } else {
      const product = products.find(p => p.id === productId);
      setOrderItems(
        orderItems.map(item =>
          item.product_id === productId
            ? {
                ...item,
                quantity: newQty,
                subtotal: newQty * item.price,
              }
            : item
        )
      );
    }
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Skool So Fly - POS</h1>
              <p className="text-gray-600 text-sm">Point of Sale Register</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Product Selection (Left Side) */}
          <div className="col-span-2">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <svg
                  className="absolute left-4 top-3.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === null
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    selectedCategory === category.id
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border border-gray-300 rounded-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      ${product.price?.toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">Stock: {product.stock_quantity || 0}</p>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max={product.stock_quantity || 1}
                        value={quantity[product.id] || 1}
                        onChange={(e) =>
                          setQuantity({
                            ...quantity,
                            [product.id]: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-16 px-2 py-2 border border-gray-300 rounded text-center"
                      />
                      <button
                        onClick={() =>
                          addToOrder(product, quantity[product.id] || 1)
                        }
                        className="flex-1 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary (Right Side) */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 h-fit sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order</h2>

            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items in order</p>
            ) : (
              <>
                {/* Order Items */}
                <div className="mb-4 max-h-96 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.product_id} className="mb-3 pb-3 border-b border-gray-300">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeFromOrder(item.product_id)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.product_id, parseInt(e.target.value) || 1)
                          }
                          className="w-12 text-center px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
                        >
                          +
                        </button>
                        <span className="ml-auto font-medium text-gray-900">
                          ${item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full mt-6 bg-black text-white py-3 rounded-lg font-bold text-lg hover:bg-gray-800 transition">
                  Proceed to Payment
                </button>

                {/* Clear Order */}
                <button
                  onClick={() => setOrderItems([])}
                  className="w-full mt-2 bg-gray-300 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                  Clear Order
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
