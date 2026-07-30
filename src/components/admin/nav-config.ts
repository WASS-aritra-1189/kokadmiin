import {
  LayoutDashboard, BookOpen, Tags, Users,
  ShoppingCart, Truck, CreditCard, Megaphone, LayoutTemplate,
  Search, MessagesSquare, BarChart3, ShieldCheck, Lock,
  Plug, Globe, Settings, Package, School, type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; to: string };
export type NavGroup = { label: string; icon: LucideIcon; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "Overview", icon: LayoutDashboard,
    items: [{ label: "Dashboard", to: "/dashboard" }],
  },
  {
    label: "Books", icon: BookOpen,
    items: [
      { label: "All Books", to: "/books" },
    ],
  },
  {
    label: "Bunch", icon: Package,
    items: [
      { label: "Bunches", to: "/bunch" },
      { label: "Bunch Orders", to: "/bunch/orders" },
      { label: "Returns", to: "/bunch/returns" },
      { label: "Exchanges", to: "/bunch/exchanges" },
    ],
  },
  {
    label: "Schools", icon: School,
    items: [
      { label: "All Schools", to: "/schools" },
      { label: "Classes", to: "/schools/classes" },
    ],
  },
  {
    label: "Catalog", icon: Tags,
    items: [
      { label: "Categories", to: "/catalog/categories" },
      { label: "Genres", to: "/catalog/genres" },
      { label: "Subjects", to: "/catalog/subjects" },
      { label: "Authors", to: "/catalog/authors" },
      { label: "Publishers", to: "/catalog/publishers" },
      { label: "Boards", to: "/catalog/boards" },
      { label: "Languages", to: "/catalog/languages" },
    ],
  },
  {
    label: "Customers", icon: Users,
    items: [
      { label: "All Customers", to: "/customers" },
      { label: "Reviews & Ratings", to: "/customers/reviews" },
      { label: "Wishlist", to: "/customers/wishlist" },
      { label: "Support Tickets", to: "/customers/tickets" },
    ],
  },
  {
    label: "Orders", icon: ShoppingCart,
    items: [
      { label: "All Orders", to: "/orders" },
      { label: "Processing", to: "/orders/processing" },
      { label: "Cancellations", to: "/orders/cancellations" },
      { label: "Returns", to: "/orders/returns" },
      { label: "Exchanges", to: "/orders/exchanges" },
      { label: "Refunds", to: "/orders/refunds" },
    ],
  },
  {
    label: "Shipping", icon: Truck,
    items: [
      { label: "Shipments", to: "/shipping/shipments" },
      { label: "Pickup Requests", to: "/shipping/pickup" },
      { label: "Labels", to: "/shipping/labels" },
      { label: "AWB Numbers", to: "/shipping/awb" },
      { label: "Live Tracking", to: "/shipping/tracking" },
      { label: "Return & Exchange Pickup", to: "/shipping/return-pickup" },
      { label: "Delivery Time", to: "/shipping/eta" },
    ],
  },
  {
    label: "Payments", icon: CreditCard,
    items: [
      { label: "Transactions", to: "/payments/transactions" },
      { label: "COD", to: "/payments/cod" },
      { label: "Refunds", to: "/payments/refunds" },
    ],
  },
  {
    label: "Marketing", icon: Megaphone,
    items: [
      { label: "Coupons", to: "/marketing/coupons" },
    ],
  },
  {
    label: "Content", icon: LayoutTemplate,
    items: [
      { label: "Pages", to: "/settings/pages" },
      { label: "Banners", to: "/cms/banners" },
      { label: "Blog", to: "/cms/blog" },
      { label: "FAQ", to: "/cms/faq" },
    ],
  },
  {
    label: "Communication", icon: MessagesSquare,
    items: [
      { label: "Email Templates", to: "/comms/email-templates" },
      { label: "SMS Templates", to: "/comms/sms-templates" },
      { label: "WhatsApp Templates", to: "/comms/whatsapp-templates" },
      { label: "Push Notifications", to: "/comms/push" },
    ],
  },
  {
    label: "Reports", icon: BarChart3,
    items: [
      { label: "Sales", to: "/reports/sales" },
      { label: "Revenue", to: "/reports/revenue" },
      { label: "Inventory Analysis", to: "/reports/inventory" },
      { label: "Product Analytics", to: "/dashboard/product-analytics" },
      { label: "Order Analytics", to: "/dashboard/order-analysis" },
    ],
  },
  {
    label: "Users & Admin", icon: ShieldCheck,
    items: [
      { label: "Designations", to: "/users/designations" },
      { label: "Staff Members", to: "/users/staff" },
      { label: "Menus", to: "/users/menus" },
      { label: "Designation Permissions", to: "/users/designation-permissions" },
      { label: "Staff Permissions", to: "/users/staff-permissions" },
      { label: "Activity Logs", to: "/activity-logs" },
    ],
  },
  {
    label: "Integrations", icon: Plug,
    items: [
      { label: "Payment APIs", to: "/integrations/payment" },
      { label: "Courier APIs", to: "/integrations/courier" },
      { label: "Email API", to: "/integrations/email" },
      { label: "SMS Gateway", to: "/integrations/sms" },
    ],
  },
  {
    label: "Localization", icon: Globe,
    items: [
      { label: "Countries", to: "/locale/countries" },
      { label: "States", to: "/locale/states" },
      { label: "Cities", to: "/locale/cities" },
    ],
  },
  {
    label: "Settings", icon: Settings,
    items: [
      { label: "General", to: "/settings/general" },
      
    ],
  },
];

export function findNavLabel(pathname: string): { group: string; label: string } | null {
  for (const g of NAV) {
    for (const it of g.items) {
      if (it.to === pathname) return { group: g.label, label: it.label };
    }
  }
  return null;
}