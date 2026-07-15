import { api } from "@/lib/axios";
import { ordersService, type Order } from "./orders.service";

const wrap = (r: any) => r.data?.data ?? r.data;

export type ShippingType = "standard" | "express" | "fastest";

export interface ServiceabilityCourier {
  name: string;
  etd: string;
  estimatedDays: number | null;
  freightCharge: number;
  codCharge: number;
  otherCharges: number;
  totalCharge: number;
  isCod: boolean;
  minWeight: number;
  shippingType: ShippingType;
}

export interface ServiceabilityResult {
  available: boolean;
  couriers: ServiceabilityCourier[];
  fastestDays: number | null;
  cheapestCharge: number | null;
}

// Fetch all orders that have a shipment (any status except PENDING)
export const shippingService = {
  // All orders with a shipmentId
  getShipments: (params: { page?: number; limit?: number; search?: string } = {}) =>
    api.get("/orders", { params: { ...params, limit: params.limit ?? 50 } }).then(wrap),

  // Orders awaiting pickup (PROCESSING + has shipmentId but no AWB yet, or pickup not scheduled)
  getPickupRequests: () =>
    api.get("/orders", { params: { status: "PROCESSING", limit: 100 } }).then(wrap),

  // Orders with AWB assigned
  getAwbOrders: () =>
    api.get("/orders", { params: { limit: 100 } }).then(wrap),

  schedulePickup: (orderId: string, pickupDate: string) =>
    api.post(`/orders/${orderId}/pickup`, { pickupDate }).then(wrap),

  getLabel: (orderId: string) =>
    api.get(`/orders/${orderId}/label`).then(wrap),

  track: (orderId: string) =>
    api.get(`/orders/${orderId}/track`).then(wrap),

  checkServiceability: (pincode: string, weight: number, shippingType?: ShippingType): Promise<ServiceabilityResult> =>
    api.get("/orders/serviceability", { params: { pincode, weight, ...(shippingType ? { shippingType } : {}) } }).then(wrap),
};
