'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-context';
import { Order, OrderStatus, CartItem } from '@/types/cart';
import { formatINR, formatDate } from '@/lib/utils/formatters';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ref = order.order_reference || order.orderNumber || '';
        const matchRef = ref.toLowerCase().includes(q);
        const name = order.shipping_address?.full_name || order.customer?.fullName || '';
        const matchName = name.toLowerCase().includes(q);
        const city = order.shipping_address?.city || order.customer?.city || '';
        const matchCity = city.toLowerCase().includes(q);
        const phone = order.shipping_address?.phone || order.customer?.phone || '';
        const matchPhone = phone.toLowerCase().includes(q);
        const email = order.shipping_address?.email || order.customer?.email || '';
        const matchEmail = email.toLowerCase().includes(q);
        const matchItem = order.items.some((i: CartItem) => {
          const itemName = i.name || i.product?.name || '';
          return itemName.toLowerCase().includes(q);
        });
        if (!matchRef && !matchName && !matchCity && !matchPhone && !matchEmail && !matchItem) {
          return false;
        }
      }
      return true;
    });
  }, [orders, searchQuery, selectedStatus]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    setNotice(`Order status updated to "${newStatus}".`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    setTimeout(() => setNotice(null), 3000);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Shipped':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-purple-50 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              Customer Orders & Fulfilment Desk
            </h2>
            <span className="px-2 py-0.5 bg-[#BD8B52]/10 text-[#BD8B52] border border-[#BD8B52]/20 rounded-full text-[10px] font-bold">
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs text-[#737373] mt-1">
            Track customer purchases, update delivery progression, inspect item snapshots, and manage customer shipments.
          </p>
        </div>

        <Link
          href="/checkout"
          className="px-4 py-2 bg-[#F5F1E8] hover:bg-[#E5E0D8] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Test Storefront Checkout
        </Link>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference (TRN-...), customer name, phone, city, or garment..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E5E0D8] rounded-lg text-xs focus:border-[#BD8B52] focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[#E5E0D8] rounded-lg text-xs text-[#171717]"
          >
            <option value="all">All Order Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="overflow-x-auto border border-[#E5E0D8] rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E5E0D8] text-[#737373] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Order Reference</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Garment Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Fulfilment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F1E8]">
              {filteredOrders.map((order: Order) => (
                <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors">
                  {/* Reference & Date */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#171717] block">
                      {order.order_reference || order.orderNumber}
                    </span>
                    <span className="text-[10px] text-[#737373] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-[#A3A3A3]" />
                      {formatDate(order.created_at || order.createdAt)}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#171717] block">
                      {order.shipping_address?.full_name || order.customer?.fullName || 'Customer'}
                    </span>
                    <span className="text-[10px] text-[#737373] block">
                      {order.shipping_address?.city || order.customer?.city || ''}, {order.shipping_address?.state || order.customer?.state || ''}
                    </span>
                    <span className="text-[10px] text-[#BD8B52] font-mono">
                      {order.shipping_address?.phone || order.customer?.phone || ''}
                    </span>
                  </td>

                  {/* Items Snapshot */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {order.items.slice(0, 2).map((item: CartItem, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-[#171717] line-clamp-1">
                            {item.quantity}x {item.name || item.product?.name || 'Garment'}
                          </span>
                          <span className="px-1 py-0.2 bg-[#F5F1E8] rounded text-[9px] font-bold">
                            {item.size}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <span className="text-[10px] text-[#737373]">
                          +{order.items.length - 2} more garments
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#171717] text-sm block">
                      {formatINR(order.total_amount_inr ?? order.total ?? 0)}
                    </span>
                    {(order.discount_inr > 0 || order.discount > 0) && (
                      <span className="text-[10px] text-emerald-700">
                        -{formatINR(order.discount_inr || order.discount)} coupon
                      </span>
                    )}
                  </td>

                  {/* Payment */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#171717] block">
                      {order.payment_method || (order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'UPI')}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        order.payment_status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>

                  {/* Status & Quick Transition */}
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#E5E0D8] text-[#171717] rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto text-[#BD8B52]">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#171717]">No Orders Found</h3>
          <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
            There are currently no customer orders matching the filter. When visitors complete checkout on the storefront with UPI or COD, their orders appear here immediately.
          </p>
          <div className="pt-2">
            <Link
              href="/checkout"
              className="px-5 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              Place Test Order via Storefront
            </Link>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F1E8]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#BD8B52]">
                  Order Snapshot
                </span>
                <h3 className="text-lg font-black text-[#171717]">
                  {selectedOrder.order_reference}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-[#737373] hover:text-[#171717] font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="p-4 bg-[#FDFBF7] border border-[#E5E0D8] rounded-2xl space-y-3 text-xs">
              <h4 className="font-bold text-[#171717] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-[#BD8B52]" /> Shipping Destination
              </h4>
              <div className="space-y-1 text-[#555]">
                <p className="font-bold text-[#171717]">{selectedOrder.shipping_address.full_name}</p>
                <p>{selectedOrder.shipping_address.street_address || selectedOrder.shipping_address.address_line1 || selectedOrder.customer?.address}</p>
                <p>
                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} -{' '}
                  <span className="font-mono">{selectedOrder.shipping_address.postal_code}</span>
                </p>
                <p className="pt-1 text-[#171717] flex items-center gap-3">
                  <span>
                    Phone: <strong className="font-mono">{selectedOrder.shipping_address.phone}</strong>
                  </span>
                  <span>
                    Email: <strong>{selectedOrder.shipping_address.email}</strong>
                  </span>
                </p>
              </div>
            </div>

            {/* Itemized Garments Snapshot */}
            <div className="space-y-3">
              <h4 className="font-bold text-[#171717] uppercase tracking-wider text-xs">
                Ordered Garments ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-[#F5F1E8] border border-[#E5E0D8] rounded-xl overflow-hidden">
                {selectedOrder.items.map((item: CartItem, idx: number) => {
                  const name = item.name || item.product?.name || 'Garment';
                  const img = item.image_url || item.product?.image_url || '';
                  const unitPrice = item.price_inr ?? item.product?.price_inr ?? 0;
                  return (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded bg-[#F5F1E8] overflow-hidden shrink-0 border border-[#E5E0D8]">
                          {img ? (
                            <img src={img} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-[#737373]">No pic</div>
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-[#171717]">{name}</h5>
                          <span className="text-[10px] text-[#737373]">
                            Size: <strong>{item.size}</strong> &bull; Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-[#171717]">
                        {formatINR(unitPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-[#FAF7F2] border border-[#E5E0D8] rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-[#737373]">
                <span>Garment Subtotal</span>
                <span>{formatINR(selectedOrder.subtotal_inr)}</span>
              </div>
              {selectedOrder.discount_inr > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(selectedOrder.discount_inr)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#737373]">
                <span>Doorstep Courier</span>
                <span>
                  {selectedOrder.shipping_fee_inr === 0 ? 'Complimentary (Free)' : formatINR(selectedOrder.shipping_fee_inr)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#171717] pt-2 border-t border-[#E5E0D8]">
                <span>Total Amount</span>
                <span>{formatINR(selectedOrder.total_amount_inr)}</span>
              </div>
            </div>

            {/* Status Transition Control */}
            <div className="space-y-2">
              <label className="font-bold text-xs text-[#171717] uppercase tracking-wider block">
                Update Order Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as OrderStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        selectedOrder.status === st
                          ? 'bg-[#171717] text-[#BD8B52] border-[#171717]'
                          : 'bg-white text-[#737373] border-[#E5E0D8] hover:border-[#BD8B52]'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-2 border-t border-[#F5F1E8]">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
