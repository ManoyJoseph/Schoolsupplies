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
