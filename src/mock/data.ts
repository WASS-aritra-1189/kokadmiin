// In-memory mock data for the admin panel demo.

export type Book = {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  format: "Paperback" | "Hardcover" | "eBook" | "Audiobook";
  price: number;
  mrp: number;
  stock: number;
  reorder: number;
  status: "Active" | "Draft" | "Out of stock";
  cover: string;
};

const covers = [
  "linear-gradient(135deg,#fde68a,#f59e0b)",
  "linear-gradient(135deg,#c7d2fe,#4f46e5)",
  "linear-gradient(135deg,#bbf7d0,#10b981)",
  "linear-gradient(135deg,#fecaca,#ef4444)",
  "linear-gradient(135deg,#e9d5ff,#8b5cf6)",
  "linear-gradient(135deg,#bae6fd,#0284c7)",
  "linear-gradient(135deg,#fbcfe8,#db2777)",
  "linear-gradient(135deg,#fed7aa,#ea580c)",
];

const titles: [string, string, string, Book["format"]][] = [
  ["The Silent Cartographer", "M. Ellery Vance", "Fiction", "Hardcover"],
  ["Ledgers of the Small Kingdom", "Anisha Rao", "History", "Paperback"],
  ["Salt, Fat, Iron", "Priya Menon", "Cookbook", "Hardcover"],
  ["Grammar of Weather", "T. Okonkwo", "Science", "Paperback"],
  ["A Field Guide to Grief", "Rowan Hale", "Self-help", "Paperback"],
  ["Machines That Dream", "Yusuf Chen", "Technology", "eBook"],
  ["Nocturne for Dust", "Léa Marchetti", "Poetry", "Paperback"],
  ["The Bureaucrat's Daughter", "Devika Iyer", "Fiction", "Hardcover"],
  ["Cold Bread, Warm Rooms", "Simon Ashford", "Memoir", "Paperback"],
  ["Atlas of Quiet Places", "N. Halvorsen", "Travel", "Hardcover"],
  ["The Second Arithmetic", "Gita Balan", "Mathematics", "Paperback"],
  ["Ordinary Ghosts", "P. Kirsanov", "Fiction", "eBook"],
  ["The River Ledger", "Ada Whitcombe", "Fiction", "Audiobook"],
  ["Small Machines, Large Lives", "R. Odusanya", "Essays", "Paperback"],
  ["The Municipal Sublime", "H. Trần", "Architecture", "Hardcover"],
  ["A Working Theory of Rain", "M. Karlsen", "Poetry", "Paperback"],
  ["Bright Ledger", "Sana Qureshi", "Business", "Paperback"],
  ["The Cartographer's Wife", "L. Amaral", "Fiction", "Hardcover"],
  ["Notes on Slow Weather", "Th. Beaumont", "Nature", "Paperback"],
  ["The Last Postmistress", "Yuki Ito", "Fiction", "Paperback"],
];

export const books: Book[] = titles.map(([title, author, category, format], i) => {
  const mrp = 299 + ((i * 37) % 900);
  const price = Math.round(mrp * (0.7 + ((i % 3) * 0.05)));
  const stock = [12, 0, 3, 48, 91, 6, 22, 0, 140, 2, 17, 55, 4, 8, 33, 71, 0, 19, 5, 88][i];
  return {
    id: `BK-${String(1001 + i)}`,
    title,
    author,
    isbn: `978-93-${String(10000 + i * 137).slice(0, 5)}-${String(i).padStart(2, "0")}-${i % 10}`,
    category,
    format,
    price,
    mrp,
    stock,
    reorder: 10,
    status: stock === 0 ? "Out of stock" : "Active",
    cover: covers[i % covers.length],
  };
});

export type Order = {
  id: string;
  date: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  payment: "UPI" | "Card" | "COD" | "Netbanking" | "Wallet";
  status: "New" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Returned" | "Cancelled";
  courier: string;
  awb?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  lines: { bookId: string; title: string; qty: number; price: number }[];
};

const customersRaw = [
  ["Aarav Sharma", "aarav.sharma@example.com", "Mumbai", "MH", "400001"],
  ["Neha Kapoor", "neha.k@example.com", "Delhi", "DL", "110001"],
  ["Rohan Verma", "rohan.v@example.com", "Bengaluru", "KA", "560001"],
  ["Ishita Nair", "ishita@example.com", "Kochi", "KL", "682001"],
  ["Kabir Menon", "kabir.m@example.com", "Chennai", "TN", "600001"],
  ["Meera Iyer", "meera.iyer@example.com", "Pune", "MH", "411001"],
  ["Aditya Rao", "aditya.rao@example.com", "Hyderabad", "TG", "500001"],
  ["Sara Khan", "sara.k@example.com", "Kolkata", "WB", "700001"],
  ["Vikram Singh", "vikram@example.com", "Jaipur", "RJ", "302001"],
  ["Diya Patel", "diya.p@example.com", "Ahmedabad", "GJ", "380001"],
  ["Aryan Joshi", "aryan.j@example.com", "Lucknow", "UP", "226001"],
  ["Zara Sheikh", "zara@example.com", "Bhopal", "MP", "462001"],
];

const statuses: Order["status"][] = ["New", "Processing", "Packed", "Shipped", "Delivered", "Returned", "Cancelled"];
const payments: Order["payment"][] = ["UPI", "Card", "COD", "Netbanking", "Wallet"];
const couriers = ["Delhivery", "BlueDart", "DTDC", "Ekart", "IndiaPost"];

export const orders: Order[] = Array.from({ length: 34 }).map((_, i) => {
  const c = customersRaw[i % customersRaw.length];
  const itemsCount = 1 + (i % 4);
  const lines = Array.from({ length: itemsCount }).map((_, j) => {
    const b = books[(i * 3 + j) % books.length];
    return { bookId: b.id, title: b.title, qty: 1 + (j % 2), price: b.price };
  });
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const status = statuses[i % statuses.length];
  const d = new Date();
  d.setDate(d.getDate() - i);
  return {
    id: `#ORD-${20450 - i}`,
    date: d.toISOString().slice(0, 10),
    customer: c[0],
    email: c[1],
    items: lines.reduce((s, l) => s + l.qty, 0),
    total,
    payment: payments[i % payments.length],
    status,
    courier: couriers[i % couriers.length],
    awb: status === "Shipped" || status === "Delivered" ? `AWB${1000000 + i * 13}` : undefined,
    address: {
      line1: `${101 + i} ${["Rosewood", "Oak", "Palm", "Cedar", "Ivy"][i % 5]} Apartments`,
      line2: `Sector ${1 + (i % 45)}`,
      city: c[2],
      state: c[3],
      pincode: c[4],
      phone: `+91 9${String(800000000 + i * 7391).slice(0, 9)}`,
    },
    lines,
  };
});

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  ltv: number;
  group: "Retail" | "Wholesale" | "VIP" | "Student";
  wallet: number;
  loyalty: number;
  joined: string;
  city: string;
};

export const customers: Customer[] = customersRaw.map((c, i) => ({
  id: `CUST-${3200 + i}`,
  name: c[0],
  email: c[1],
  phone: `+91 9${String(800000000 + i * 4211).slice(0, 9)}`,
  orders: 2 + ((i * 3) % 24),
  ltv: 1200 + i * 745,
  group: (["Retail", "Retail", "VIP", "Wholesale", "Student"] as const)[i % 5],
  wallet: (i % 4) * 250,
  loyalty: 120 + i * 33,
  joined: `2024-0${1 + (i % 9)}-1${i % 9}`,
  city: c[2],
}));

export type Shipment = {
  id: string;
  order: string;
  awb: string;
  courier: string;
  from: string;
  to: string;
  status: "Manifested" | "Picked up" | "In transit" | "Out for delivery" | "Delivered" | "NDR";
  eta: string;
};

export const shipments: Shipment[] = orders
  .filter((o) => o.awb)
  .map((o, i) => ({
    id: `SHIP-${5100 + i}`,
    order: o.id,
    awb: o.awb!,
    courier: o.courier,
    from: "Mumbai Warehouse",
    to: `${o.address.city}, ${o.address.state}`,
    status: (["Picked up", "In transit", "Out for delivery", "Delivered", "NDR"] as const)[i % 5],
    eta: o.date,
  }));

export type Coupon = {
  code: string;
  type: "Percentage" | "Flat";
  value: number;
  minCart: number;
  usage: number;
  limit: number;
  starts: string;
  ends: string;
  status: "Active" | "Scheduled" | "Expired";
};

export const coupons: Coupon[] = [
  { code: "READMORE15", type: "Percentage", value: 15, minCart: 499, usage: 812, limit: 2000, starts: "2026-06-01", ends: "2026-07-31", status: "Active" },
  { code: "FLAT100", type: "Flat", value: 100, minCart: 799, usage: 1523, limit: 5000, starts: "2026-05-15", ends: "2026-08-15", status: "Active" },
  { code: "MONSOON25", type: "Percentage", value: 25, minCart: 999, usage: 0, limit: 1000, starts: "2026-07-15", ends: "2026-08-30", status: "Scheduled" },
  { code: "FICTIONFEST", type: "Percentage", value: 20, minCart: 599, usage: 340, limit: 500, starts: "2026-04-01", ends: "2026-06-30", status: "Expired" },
  { code: "WELCOME50", type: "Flat", value: 50, minCart: 299, usage: 4218, limit: 10000, starts: "2026-01-01", ends: "2026-12-31", status: "Active" },
  { code: "STUDENT10", type: "Percentage", value: 10, minCart: 0, usage: 967, limit: 999999, starts: "2026-01-01", ends: "2026-12-31", status: "Active" },
];

export type Warehouse = { id: string; name: string; city: string; onHand: number };
export const warehouses: Warehouse[] = [
  { id: "WH-MUM", name: "Mumbai Central", city: "Mumbai", onHand: 8421 },
  { id: "WH-DEL", name: "Delhi North", city: "Delhi", onHand: 5230 },
  { id: "WH-BLR", name: "Bengaluru Hub", city: "Bengaluru", onHand: 4118 },
  { id: "WH-CHE", name: "Chennai South", city: "Chennai", onHand: 2907 },
];

export const kpi = {
  revenue: 1284900,
  revenueDelta: 12.4,
  orders: 1842,
  ordersDelta: 8.1,
  aov: 697,
  aovDelta: 3.9,
  lowStock: 14,
  lowStockDelta: -22,
};

export const revenueSeries = [
  { d: "Jun 18", v: 82000 }, { d: "Jun 19", v: 91000 }, { d: "Jun 20", v: 76000 },
  { d: "Jun 21", v: 104000 }, { d: "Jun 22", v: 118000 }, { d: "Jun 23", v: 97000 },
  { d: "Jun 24", v: 89000 }, { d: "Jun 25", v: 132000 }, { d: "Jun 26", v: 121000 },
  { d: "Jun 27", v: 108000 }, { d: "Jun 28", v: 141000 }, { d: "Jun 29", v: 129000 },
  { d: "Jun 30", v: 156000 }, { d: "Jul 01", v: 148000 },
];

export const currency = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
