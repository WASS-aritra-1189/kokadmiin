import { api } from "@/lib/axios";

const wrap = (r: any) => {
  const body = r?.data;
  if (body && typeof body === "object") {
    if ("data" in body) return body.data;
    return body;
  }
  return r;
};

export const dashboardService = {
  // Dashboard Overview API (all-in-one)
  getOverview: (params?: { filter?: string; startDate?: string; endDate?: string }) =>
    api.get("/dashboard/overview", { params }).then(wrap),

  // Sales Overview API
  getSalesOverview: (params?: { filter?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/sales-overview", { params }).then(wrap),

  // Revenue Trend API
  getRevenueTrend: (params?: { groupBy?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/sales-revenue-trend", { params }).then(wrap),

  // Sales By Category API
  getSalesByCategory: (params?: { groupBy?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/sales-by-category", { params }).then(wrap),

  // Sales By Payment Method API
  getSalesByPaymentMethod: (params?: { groupBy?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/sales-by-payment-method", { params }).then(wrap),

  // Sales By Location API
  getSalesByLocation: (params?: { groupBy?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/sales-by-location", { params }).then(wrap),

  // Order Analytics API
  getOrderAnalytics: (params?: { groupBy?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/order-analytics", { params }).then(wrap),

  getOrderStatusDistribution: (params?: { groupBy?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/order-status-distribution", { params }).then(wrap),

  getOrdersOverTime: (params?: { groupBy?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/orders-over-time", { params }).then(wrap),

  // Product Analytics API
  getProductAnalytics: (params?: { groupBy?: string; startDate?: string; endDate?: string }) => 
    api.get("/dashboard/product-analytics", { params }).then(wrap),

  getInventoryStatus: () => 
    api.get("/dashboard/inventory-status").then(wrap),

  // Bunch Order Analytics APIs
  getBunchSalesOverview: (params?: { filter?: string; startDate?: string; endDate?: string }) =>
    api.get("/dashboard/bunch-sales-overview", { params }).then(wrap),

  getBunchRevenueTrend: (params?: { groupBy?: string; startDate?: string; endDate?: string }) =>
    api.get("/dashboard/bunch-sales-revenue-trend", { params }).then(wrap),

  getBunchSalesByPaymentMethod: (params?: { groupBy?: string; startDate?: string; endDate?: string }) =>
    api.get("/dashboard/bunch-sales-by-payment-method", { params }).then(wrap),

  getBunchSalesByLocation: (params?: { groupBy?: string; startDate?: string; endDate?: string }) =>
    api.get("/dashboard/bunch-sales-by-location", { params }).then(wrap),

  getBunchOrderAnalytics: (params?: { groupBy?: string; startDate?: string; endDate?: string }) =>
    api.get("/dashboard/bunch-order-analytics", { params }).then(wrap),

  getBunchOrderStatusDistribution: (params?: { groupBy?: string; startDate?: string; endDate?: string }) =>
    api.get("/dashboard/bunch-order-status-distribution", { params }).then(wrap),

  getBunchOrdersOverTime: (params?: { groupBy?: string; startDate?: string; endDate?: string }) =>
    api.get("/dashboard/bunch-orders-over-time", { params }).then(wrap),
};
