"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<{ product_id: string; product_name: string; quantity: number }[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: suppliersData } = await supabase
      .from("suppliers").select("*").order("name");

    const { data: productsData } = await supabase
      .from("products").select("*, suppliers(name), categories(name)").order("name");

    if (suppliersData) setSuppliers(suppliersData);
    if (productsData) {
      setProducts(productsData);
      setLowStockProducts(productsData.filter((p) => p.stock_quantity < 10));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (editingId) {
      await supabase.from("suppliers").update(formData).eq("id", editingId);
    } else {
      await supabase.from("suppliers").insert(formData);
    }
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    const supabase = createClient();
    await supabase.from("suppliers").delete().eq("id", id);
    fetchData();
  };

  const handleEdit = (supplier: any) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", contact_person: "", email: "", phone: "", address: "" });
  };

  const openOrderForm = (supplier: any) => {
    setSelectedSupplier(supplier);
    setOrderItems(lowStockProducts.map((p) => ({
      product_id: p.id,
      product_name: p.name,
      quantity: 10,
    })));
    setShowOrderForm(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedSupplier) return;
    const supabase = createClient();

    const { data: order } = await supabase
      .from("purchase_orders")
      .insert({
        supplier_id: selectedSupplier.id,
        status: "pending",
        notes: `Restock order for low stock items`,
      })
      .select().single();

    if (order) {
      await supabase.from("purchase_order_items").insert(
        orderItems.filter((i) => i.quantity > 0).map((item) => ({
          purchase_order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity_ordered: item.quantity,
        }))
      );
    }

    setShowOrderForm(false);
    alert(`✅ Purchase order placed with ${selectedSupplier.name}!`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-500 mt-1">Manage suppliers and restock orders</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
        >
          + Add Supplier
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">⚠️</span>
            <h2 className="font-bold text-orange-800">
              {lowStockProducts.length} Low Stock Items Need Reordering
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {lowStockProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-xl px-3 py-2 border border-orange-100">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-orange-600 font-bold mt-0.5">
                  {p.stock_quantity === 0 ? "Out of Stock" : `Only ${p.stock_quantity} left`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suppliers Grid */}
      {loading ? (
        <p className="text-center text-gray-400 py-12">Loading suppliers...</p>
      ) : suppliers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-4xl mb-3">🏭</p>
          <p className="text-gray-500 font-medium">No suppliers yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first supplier to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              {/* Supplier Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">
                    🏭
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{supplier.name}</h3>
                    {supplier.contact_person && (
                      <p className="text-xs text-gray-400">{supplier.contact_person}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📧</span>
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📞</span>
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📍</span>
                    <span className="truncate">{supplier.address}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => openOrderForm(supplier)}
                  className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  📋 Place Order
                </button>
                <button
                  onClick={() => handleEdit(supplier)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingId ? "✏️ Edit Supplier" : "➕ Add Supplier"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all"
                >
                  {editingId ? "Save Changes" : "Add Supplier"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Place Order Modal */}
      {showOrderForm && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              📋 Place Order
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Ordering from <span className="font-semibold text-blue-600">{selectedSupplier.name}</span>
            </p>

            {orderItems.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No low stock items to reorder!</p>
            ) : (
              <div className="space-y-3 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Low Stock Items
                </p>
                {orderItems.map((item, index) => (
                  <div key={item.product_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                      <p className="text-xs text-orange-500">
                        Stock: {lowStockProducts.find(p => p.id === item.product_id)?.stock_quantity ?? 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Order qty:</label>
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...orderItems];
                          updated[index].quantity = parseInt(e.target.value) || 0;
                          setOrderItems(updated);
                        }}
                        className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePlaceOrder}
                disabled={orderItems.length === 0}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl font-semibold text-sm transition-all"
              >
                ✅ Place Order
              </button>
              <button
                onClick={() => setShowOrderForm(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
