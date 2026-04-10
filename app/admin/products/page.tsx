"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getProducts, getCategories, addProduct, updateProduct, deleteProduct } from "@/lib/supabase/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    description: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (!loading && user) {
      fetchData();
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    setPageLoading(true);
    const { data: productsData } = await getProducts();
    const { data: categoriesData } = await getCategories();
    
    if (productsData) setProducts(productsData);
    if (categoriesData) setCategories(categoriesData);
    
    setPageLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert("Please fill all required fields");
      return;
    }

    if (editingId) {
      // Update product
      const { error } = await updateProduct(editingId, {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
      });
      if (error) {
        alert("Failed to update product");
        return;
      }
    } else {
      // Add new product
      const { error } = await addProduct(
        formData.name,
        parseFloat(formData.price),
        formData.categoryId,
        formData.description
      );
      if (error) {
        alert("Failed to add product");
        return;
      }
    }

    resetForm();
    fetchData();
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await deleteProduct(productId);
    if (error) {
      alert("Failed to delete product");
      return;
    }

    fetchData();
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      categoryId: product.category_id,
      description: product.description || "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      categoryId: "",
      description: "",
    });
    setEditingId(null);
    setShowForm(false);
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
          <h1 className="text-4xl font-bold text-gray-900">Products Management</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-8 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add New Product"}
        </button>

        {/* Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-6">{editingId ? "Edit Product" : "Add New Product"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Product Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="number"
                placeholder="Price *"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category *</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <button
                type="submit"
                className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingId ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-600">
                    No products yet
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const category = categories.find((c) => c.id === product.category_id);
                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{category?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
