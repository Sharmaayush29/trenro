import { Product } from '@/types';

export type ClothingSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethodType = 'cod' | 'upi' | 'card';

export interface CartItem {
  id: string; // product.id + '-' + size
  product: Product;
  size: ClothingSize;
  quantity: number;
  outfitId?: string;
  outfitTitle?: string;
  name?: string;
  price_inr?: number;
  image_url?: string;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ShippingAddress {
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  street_address?: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  order_reference: string;
  items: CartItem[];
  subtotal: number;
  subtotal_inr: number;
  shipping: number;
  shipping_fee_inr: number;
  discount: number;
  discount_inr: number;
  total: number;
  total_amount_inr: number;
  status: OrderStatus;
  createdAt: string;
  created_at: string;
  customer: OrderCustomer;
  shipping_address: ShippingAddress;
  paymentMethod: PaymentMethodType;
  payment_method: string;
  payment_status: 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Cancelled' | 'Refunded';
  couponCode?: string;
  paymentId?: string;
}
