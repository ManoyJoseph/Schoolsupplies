export type Category = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category_id: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  total_price: number;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  created_at: string;
};
