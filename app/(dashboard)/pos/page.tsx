"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [quantity, setQuantity] = useState<{ [key: string]: number }>({});
  const [amountTendered, setAmountTendered] = useState("");
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: productsData } = await supabase
      .from("products").select("*, categories(name)").order("name");
    const { data: categoriesData } = await supabase
      .from("categories").select("*").order("name");
    if (productsData) setProducts(productsData);
    if (categoriesData) setCategories(categoriesData);
    setLoading(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = !selectedCategory || p.category_id === selectedCategory;
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product: any, qty: number) => {
    if (qty <= 0) return;
    const existing = cartItems.find((i) => i.product_id === product.id);
    if (existing) {
      setCartItems(cartItems.map((i) =>
        i.product_id === product.id
          ? { ...i, quantity: i.quantity + qty, subtotal: (i.quantity + qty) * i.price }
          : i
      ));
    } else {
      setCartItems([...cartItems, {
        product_id: product.id,
        product_name: product.name,
        price: product.price || 0,
        quantity: qty,
        subtotal: qty * (product.price || 0),
      }]);
    }
    setQuantity({ ...quantity, [product.id]: 1 });
  };

  const removeFromCart = (id: string) => setCartItems(cartItems.filter((i) => i.product_id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCartItems(cartItems.map((i) =>
      i.product_id === id ? { ...i, quantity: qty, subtotal: qty * i.price } : i
    ));
  };

  const total = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const tendered = parseFloat(amountTendered) || 0;
  const change = tendered - total;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return alert("Cart is empty!");
    if (tendered < total) return alert("Amount tendered is less than total!");
    setProcessing(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        cashier_id: session?.user?.id,
        total_amount: total,
        amount_tendered: tendered,
        change_amount: change,
        payment_method: "cash",
      })
      .select().single();

    if (error) { alert("Transaction failed: " + error.message); setProcessing(false); return; }

    await supabase.from("transaction_items").insert(
      cartItems.map((item) => ({
        transaction_id: transaction.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.subtotal,
      }))
    );

    for (const item of cartItems) {
      const product = products.find((p) => p.id === item.product_id);
      if (product) {
        await supabase.from("products")
          .update({ stock_quantity: (product.stock_quantity || 0) - item.quantity })
          .eq("id", item.product_id);
      }
    }

    setSuccessMsg(`✅ Sale complete! Change: ₱${change.toFixed(2)}`);
    setCartItems([]);
    setAmountTendered("");
    fetchData();
    setProcessing(false);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* LEFT — Products */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">POS Register</h1>
          <p className="text-gray-500 text-sm">Select products to add to cart</p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium">
            {successMsg}
          </div>
        )}

        {/* Search + Categories */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !selectedCategory ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-400">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-400">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                    product.stock_quantity === 0 ? "opacity-50 border-gray-100" : "border-gray-200 hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  {/* Category tag */}
                  <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                    {product.categories?.name || "Uncategorized"}
                  </span>

                  <h3 className="font-bold text-gray-900 mt-2 mb-1 text-sm leading-tight">
                    {product.name}
                  </h3>

                  <p className="text-xl font-bold text-gray-900 mb-1">
                    ₱{product.price?.toFixed(2)}
                  </p>

                  <p className={`text-xs font-semibold mb-3 ${
                    product.stock_quantity === 0 ? "text-red-500"
                    : product.stock_quantity < 10 ? "text-orange-500"
                    : "text-emerald-500"
                  }`}>
                    {product.stock_quantity === 0 ? "❌ Out of Stock" : `✓ Stock: ${product.stock_quantity}`}
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max={product.stock_quantity}
                      value={quantity[product.id] || 1}
                      onChange={(e) => setQuantity({ ...quantity, [product.id]: parseInt(e.target.value) || 1 })}
                      className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-center text-sm bg-gray-50"
                      disabled={product.stock_quantity === 0}
                    />
                    <button
                      onClick={() => addToCart(product, quantity[product.id] || 1)}
                      disabled={product.stock_quantity === 0}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-1.5 rounded-lg text-sm font-semibold transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT — Cart */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">🛒 Cart</h2>
            {cartItems.length > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-gray-400 text-sm font-medium">Cart is empty</p>
            <p className="text-gray-300 text-xs mt-1">Add products to get started</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cartItems.map((item) => (
                <div key={item.product_id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900 text-sm leading-tight flex-1 pr-2">
                      {item.product_name}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-100 text-sm"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-100 text-sm"
                    >
                      +
                    </button>
                    <span className="ml-auto text-sm font-bold text-blue-600">
                      ₱{item.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">₱{item.price.toFixed(2)} each</p>
                </div>
              ))}
            </div>

            {/* Payment Section */}
            <div className="border-t border-gray-100 p-4 space-y-3">
              {/* Total */}
              <div className="flex justify-between items-center bg-gray-900 text-white px-4 py-3 rounded-xl">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">₱{total.toFixed(2)}</span>
              </div>

              {/* Amount Tendered */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount Tendered
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  placeholder="₱0.00"
                  className="w-full mt-1 px-4 py-2.5 border border-gray-200 rounded-xl text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Change */}
              {tendered > 0 && (
                <div className={`flex justify-between items-center px-4 py-2.5 rounded-xl ${
                  change >= 0 ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
                }`}>
                  <span className="text-sm font-semibold text-gray-600">Change</span>
                  <span className={`text-lg font-bold ${change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    ₱{change.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={processing || tendered < total || cartItems.length === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl font-bold text-base transition-all"
              >
                {processing ? "Processing..." : "✓ Complete Sale"}
              </button>

              {/* Clear Cart */}
              <button
                onClick={() => { setCartItems([]); setAmountTendered(""); }}
                className="w-full text-gray-400 hover:text-gray-600 py-2 text-sm font-medium transition-all"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
