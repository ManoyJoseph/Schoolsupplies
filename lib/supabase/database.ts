import { createClient } from "./client";
import { Product, Category, Order, OrderItem } from "../types/database";

// Database functions for School Supplies app
// ===== CATEGORIES =====
export async function getCategories() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("categories")
    .select("*");

  return { data: data as Category[] | null, error };
}

export async function getCategoryById(categoryId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  return { data: data as Category | null, error };
}

// ===== PRODUCTS =====
export async function getProducts() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("*");

  return { data: data as Product[] | null, error };
}

export async function getProductsByCategory(categoryId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId);

  return { data: data as Product[] | null, error };
}

export async function getProductById(productId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  return { data: data as Product | null, error };
}

// ===== ORDERS =====
export async function getOrders(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId);

  return { data: data as Order[] | null, error };
}

export async function getOrderById(orderId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  return { data: data as Order | null, error };
}

export async function createOrder(userId: string, totalPrice: number) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total_price: totalPrice,
      status: "pending",
    })
    .select()
    .single();

  return { data: data as Order | null, error };
}

// ===== ORDER ITEMS =====
export async function getOrderItems(orderId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  return { data: data as OrderItem[] | null, error };
}

export async function addOrderItem(
  orderId: string,
  productId: string,
  quantity: number,
  priceAtPurchase: number
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("order_items")
    .insert({
      order_id: orderId,
      product_id: productId,
      quantity,
      price_at_purchase: priceAtPurchase,
    })
    .select()
    .single();

  return { data: data as OrderItem | null, error };
}

// ===== ADMIN FUNCTIONS =====
export async function getAllOrders() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, price))")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  return { data: data as Order | null, error };
}

export async function getSalesStats() {
  const supabase = createClient();
  
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("total_price, created_at");

  if (ordersError) return { data: null, error: ordersError };

  // Calculate stats
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
  const totalOrders = orders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get top products
  const { data: topProducts, error: topError } = await supabase
    .from("order_items")
    .select("product_id, products(name), quantity")
    .order("quantity", { ascending: false })
    .limit(5);

  return {
    data: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topProducts: topProducts || [],
    },
    error: topError,
  };
}

export async function updateProduct(
  productId: string,
  updates: { name?: string; price?: number; description?: string }
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", productId)
    .select()
    .single();

  return { data: data as Product | null, error };
}

export async function addProduct(
  name: string,
  price: number,
  categoryId: string,
  description?: string
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      price,
      category_id: categoryId,
      description,
    })
    .select()
    .single();

  return { data: data as Product | null, error };
}

export async function deleteProduct(productId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  return { error };
}
