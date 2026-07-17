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
      { label: "Boards", to: "/catalog/boards" },
      { label: "Book Series", to: "/catalog/series" },
      { label: "Languages", to: "/catalog/languages" },
      { label: "Editions", to: "/catalog/editions" },
      { label: "Formats", to: "/catalog/formats" },
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
      { label: "Gateways", to: "/payments/gateways" },
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
      { label: "Banners", to: "/cms/banners" },
      { label: "Blog", to: "/cms/blog" },
      { label: "FAQ", to: "/cms/faq" },
  
    ],
  },
  {
    label: "SEO", icon: Search,
    items: [
      { label: "SEO Overview", to: "/seo" },
      { label: "URL Manager", to: "/seo/urls" },
      { label: "Meta Tags", to: "/seo/meta" },
      { label: "Sitemap", to: "/seo/sitemap" },
      { label: "robots.txt", to: "/seo/robots" },
      { label: "Schema Markup", to: "/seo/schema" },
      { label: "Canonical URLs", to: "/seo/canonical" },
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
      { label: "Reports Hub", to: "/reports" },
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
      { label: "Activity Logs", to: "/users/activity" },
      { label: "Login History", to: "/users/login-history" },
    ],
  },
  {
    label: "Security", icon: Lock,
    items: [
    
      { label: "RBAC", to: "/security/rbac" },
    

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
      { label: "Store", to: "/settings/store" },
      { label: "Company", to: "/settings/company" },
      { label: "GST", to: "/settings/gst" },
      { label: "Payments", to: "/settings/payments" },
      { label: "Shipping", to: "/settings/shipping" },
      { label: "Email", to: "/settings/email" },
      { label: "SMS", to: "/settings/sms" },
      { label: "Notifications", to: "/settings/notifications" },
      { label: "Currency", to: "/settings/currency" },
      { label: "Theme", to: "/settings/theme" },
      { label: "Backup", to: "/settings/backup" },
      { label: "Maintenance", to: "/settings/maintenance" },
      { label: "System Logs", to: "/settings/logs" },
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
