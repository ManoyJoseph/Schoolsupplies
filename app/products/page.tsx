"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/supabase/database";
import { Product, Category } from "@/lib/types/database";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { totalItems, addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData } = await getCategories();
      setCategories(categoriesData || []);

      // Fetch products
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-300 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Skool So Fly</h1>
              <p className="text-gray-600 text-sm">Point of Sale System</p>
            </div>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => {
                  router.push("/");
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                <span>⇦</span> Logout
              </button>
              <Link
                href="/cart"
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2"
              >
                🛒 Cart {totalItems > 0 && <span className="bg-red-600 px-2 py-1 rounded text-xs">{totalItems}</span>}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
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
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full font-medium transition ${
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
              className={`px-6 py-2 rounded-full font-medium transition ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredProducts.map((product) => {
              const category = categories.find(c => c.id === product.category_id);
              return (
                <div key={product.id} className="bg-white border border-gray-300 rounded-lg p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{category?.name || "Uncategorized"}</p>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-2">${product.price?.toFixed(2) || "0.00"}</p>
                      <p className="text-sm text-gray-600">Stock: {product.stock_quantity || 0}</p>
                    </div>
                    <button
                      onClick={() => addItem(product, 1)}
                      className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
