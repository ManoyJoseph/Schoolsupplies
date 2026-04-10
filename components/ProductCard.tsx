"use client";

import Link from "next/link";
import { useState } from "react";
import { Product } from "@/lib/types/database";
import { useCart } from "@/lib/cart-context";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition h-full flex flex-col">
      {/* Product Image */}
      <Link href={`/products/${product.id}`}>
        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center overflow-hidden cursor-pointer">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400">
              <svg
                className="w-12 h-12 mx-auto"
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
              <p className="text-sm mt-2">No Image</p>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex justify-between items-center mb-4 mt-auto">
          <span className="text-2xl font-bold text-blue-600">
            ${product.price.toFixed(2)}
          </span>
          <span
            className={`text-sm font-medium ${
              product.stock_quantity > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {product.stock_quantity > 0
              ? `${product.stock_quantity} in stock`
              : "Out of stock"}
          </span>
        </div>

        {/* Quantity and Add to Cart */}
        {product.stock_quantity > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Qty:</label>
              <input
                type="number"
                min="1"
                max={product.stock_quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <button
              onClick={handleAddToCart}
              className={`w-full py-2 rounded-lg font-medium transition ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {added ? "✓ Added to Cart" : "Add to Cart"}
            </button>
          </div>
        )}
        {product.stock_quantity === 0 && (
          <button
            disabled
            className="w-full bg-gray-400 text-white py-2 rounded-lg font-medium cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
}
