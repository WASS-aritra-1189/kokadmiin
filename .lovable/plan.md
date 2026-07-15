
# BookAdmin — E-commerce Admin Panel (UI Shell + Key Screens)

A clean, information-dense admin panel for a bookstore e-commerce backoffice. All data is mocked in-memory (no backend). The full module list appears in the sidebar so nothing is missing; ~10 high-value screens are fully designed, the rest render a consistent "Coming soon" placeholder using the same shell so they still feel real.

## Design direction

- **Style**: Shopify/Linear-admin — light theme, dense tables, subtle borders, small type, generous data.
- **Colors**: near-white background `#FAFAF9`, cards white, ink `#111827`, muted `#6B7280`, hairline borders `#E5E7EB`, primary indigo `#4F46E5`, success `#10B981`, warn `#F59E0B`, danger `#EF4444`.
- **Type**: Inter (body/UI), JetBrains Mono for numbers/IDs. Base 13–14px, tabular-nums on tables.
- **Components**: shadcn/ui (already installed) — Sidebar, Table, Card, Badge, Dialog, Tabs, Input, Select, Button, DropdownMenu, Sheet, Progress, Chart.
- **Layout**: collapsible left sidebar (grouped modules), sticky top bar (breadcrumb + global search + staff avatar), main scroll area.

## Sidebar module groups (all present as routes)

Dashboard · Books (Books, Bulk Upload, Bulk Update, Import/Export) · Inventory (Stock, Warehouses, Multi-Warehouse, Barcode/QR) · Catalog (Category, Subcategory, Genre, Subject, Author, Publisher, Supplier, Brand, Series, Language, Edition, Format) · Digital (eBook, PDF, EPUB, MOBI, Audiobook, DRM, Downloads) · Procurement (Purchase Orders, GRN, Supplier Invoices, Transfers, Adjustments, Audit, Damage, Returns, Reorder, Low Stock) · Customers (Customers, Groups, Wallet, Loyalty, Memberships, Addresses, Reviews, Wishlist, Activity, Tickets) · Orders (Orders, Manual, Processing, Status, Cancel, Returns, Exchange, Refund, Replacement, Backorder) · Shipping (Shipments, Couriers, Pickup, Labels, AWB, Tracking, Delivery, NDR, Return Pickup, Zones, Charges, Rules, ETA) · Payments (Gateways, Online, UPI, Card, Netbanking, Wallet, COD, EMI, Refund, Settlement, Transactions) · Invoice & Tax (Invoices, GST, Tax, HSN, Credit Notes, Debit Notes, GST Reports) · Marketing (Coupons, Discounts, Campaigns, Flash, Combos, Bundles, Gift Cards, Referral, Affiliate, Loyalty, Abandoned Cart) · CMS (Banners, Homepage, Landing, Static Pages, Blog, FAQ, Testimonials, Media) · SEO · Communication · Reviews · Reports · Finance · Users & Admin · Security · Integrations · Mobile App · Search · Localization · Subscriptions · AI · Settings.

## Fully-designed screens (10)

1. **Dashboard** — KPI tiles (revenue, orders, AOV, low-stock), 14-day revenue area chart, orders-by-status donut, top-selling books table, recent orders, low-stock alerts.
2. **Books list** — dense table with cover thumb, title/author, ISBN, category, format badge, stock, price, status; filters (category, format, stock, status), bulk actions, "Add book" opens sheet.
3. **Add/Edit Book** (sheet + tabs) — Details, Pricing/Tax (GST, HSN), Inventory (per-warehouse stock, reorder point), Media (cover + gallery), SEO, Digital files (PDF/EPUB/MOBI/audio).
4. **Inventory / Stock** — per-SKU rows with on-hand across warehouses, incoming, reserved, available, reorder point; low-stock highlighting; quick adjust.
5. **Orders list** — status pills (New, Processing, Packed, Shipped, Delivered, Returned, Cancelled), customer, items, total, payment, courier; row click → detail drawer.
6. **Order detail** — customer + shipping address block, item lines, totals with GST breakdown, payment, timeline, actions: Print Invoice / Print Shipping Label / Create Shipment / Refund / Cancel.
7. **Customers** — table (name, email, phone, orders, LTV, group, wallet, loyalty), profile drawer with tabs: Orders, Addresses, Wishlist, Reviews, Wallet/Loyalty, Activity, Tickets.
8. **Shipping / Shipments** — AWB, courier, order, from/to, status, ETA; actions: Generate Label, Schedule Pickup, Track, Mark NDR. Includes a printable **Shipping Label** preview (A6) modal.
9. **Coupons/Marketing** — coupon table + create dialog (code, type %/flat, min cart, usage limit, dates, applicable categories).
10. **Reports** — tabs (Sales, Inventory, Customers, Tax, Courier); filter bar, chart + summary table + Export CSV button.

Plus a lightweight **Staff Login** screen (mock) that gates the admin — pick role (Admin / Manager / Warehouse / Support); role controls sidebar item visibility (RBAC demo, in-memory).

## Placeholder screens

Every other module in the list gets a route that renders `<ModulePlaceholder title="…" group="…" />` — page header, description, and a subtle "This module is scaffolded — coming soon" state with 2–3 illustrative empty cards. Keeps navigation complete without inflating scope.

## Technical

- Stack: existing TanStack Start template (React 19 + Vite 7 + TanStack Router + shadcn + Tailwind v4). No new backend.
- Routes: file-based under `src/routes/`. Admin is nested under an `_admin` pathless layout that renders the sidebar + topbar + `<Outlet />`. Login at `/login`; root `/` redirects to `/dashboard`.
- State: mock data in `src/mock/*.ts` (books, orders, customers, shipments, coupons, warehouses, staff). Simple `useAuth` hook backed by `localStorage` for the demo login/role.
- Tables: TanStack Table already available via shadcn patterns — build with plain `<Table>` + local `useMemo` filters to stay lean.
- Charts: `recharts` (already in the stack for shadcn charts).
- Print: shipping label and invoice use a print-only route (`/print/label/$id`, `/print/invoice/$id`) styled for A6/A4 with `@media print`.
- No secrets, no network calls, SSR-safe.

## Out of scope (explicit)

- Real auth, real DB, payments/couriers/GST integrations, file uploads to storage, AI features, mobile app config — placeholders only.

## Deliverable order

1. Shell: `_admin` layout, sidebar (grouped, collapsible, search), topbar, `useAuth` + `/login`.
2. Mock data + shared table/filter primitives + `ModulePlaceholder`.
3. The 10 designed screens.
4. Route stubs for every remaining module using `ModulePlaceholder`.
5. Print views for invoice + shipping label.
