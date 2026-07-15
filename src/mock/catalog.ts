// Mock data for catalog / inventory sub-modules.

export type Category = { id: string; name: string; slug: string; parent?: string; books: number; status: "Active" | "Hidden"; icon: string };
export const categories: Category[] = [
  { id: "CAT-01", name: "Fiction", slug: "fiction", books: 1284, status: "Active", icon: "📖" },
  { id: "CAT-02", name: "Non-Fiction", slug: "non-fiction", books: 942, status: "Active", icon: "📚" },
  { id: "CAT-03", name: "Children", slug: "children", books: 512, status: "Active", icon: "🧸" },
  { id: "CAT-04", name: "Academic", slug: "academic", books: 803, status: "Active", icon: "🎓" },
  { id: "CAT-05", name: "Business", slug: "business", books: 217, status: "Active", icon: "💼" },
  { id: "CAT-06", name: "Self-Help", slug: "self-help", books: 189, status: "Active", icon: "🌱" },
  { id: "CAT-07", name: "Cookbooks", slug: "cookbooks", books: 94, status: "Active", icon: "🍳" },
  { id: "CAT-08", name: "Comics & Manga", slug: "comics", books: 331, status: "Hidden", icon: "💥" },
];

export type Subcategory = { id: string; name: string; parent: string; slug: string; books: number };
export const subcategories: Subcategory[] = [
  { id: "SUB-01", name: "Literary Fiction", parent: "Fiction", slug: "literary", books: 412 },
  { id: "SUB-02", name: "Historical Fiction", parent: "Fiction", slug: "historical", books: 231 },
  { id: "SUB-03", name: "Mystery & Thriller", parent: "Fiction", slug: "mystery", books: 289 },
  { id: "SUB-04", name: "Romance", parent: "Fiction", slug: "romance", books: 176 },
  { id: "SUB-05", name: "Biography", parent: "Non-Fiction", slug: "biography", books: 208 },
  { id: "SUB-06", name: "History", parent: "Non-Fiction", slug: "history", books: 341 },
  { id: "SUB-07", name: "Picture Books", parent: "Children", slug: "picture", books: 128 },
  { id: "SUB-08", name: "Young Adult", parent: "Children", slug: "ya", books: 197 },
  { id: "SUB-09", name: "Engineering", parent: "Academic", slug: "engg", books: 254 },
  { id: "SUB-10", name: "Medical", parent: "Academic", slug: "medical", books: 187 },
];

export type Genre = { id: string; name: string; slug: string; mood: string; books: number };
export const genres: Genre[] = [
  { id: "GEN-01", name: "Magical Realism", slug: "magical-realism", mood: "Dreamlike", books: 78 },
  { id: "GEN-02", name: "Dystopian", slug: "dystopian", mood: "Bleak", books: 132 },
  { id: "GEN-03", name: "Cozy Mystery", slug: "cozy-mystery", mood: "Warm", books: 91 },
  { id: "GEN-04", name: "Space Opera", slug: "space-opera", mood: "Epic", books: 63 },
  { id: "GEN-05", name: "Coming of Age", slug: "coming-of-age", mood: "Nostalgic", books: 214 },
  { id: "GEN-06", name: "Historical Romance", slug: "historical-romance", mood: "Sweeping", books: 88 },
  { id: "GEN-07", name: "Noir", slug: "noir", mood: "Shadowy", books: 42 },
];

export type Subject = { id: string; name: string; slug: string; grade: string; books: number };
export const subjects: Subject[] = [
  { id: "SUBJ-01", name: "Physics", slug: "physics", grade: "11–12 / UG", books: 214 },
  { id: "SUBJ-02", name: "Chemistry", slug: "chemistry", grade: "11–12 / UG", books: 198 },
  { id: "SUBJ-03", name: "Mathematics", slug: "mathematics", grade: "1–12 / UG", books: 402 },
  { id: "SUBJ-04", name: "English", slug: "english", grade: "1–12", books: 176 },
  { id: "SUBJ-05", name: "History", slug: "history", grade: "6–12 / UG", books: 143 },
  { id: "SUBJ-06", name: "Economics", slug: "economics", grade: "11–12 / UG", books: 111 },
  { id: "SUBJ-07", name: "Computer Science", slug: "cs", grade: "9–12 / UG / PG", books: 289 },
];

export type Author = { id: string; name: string; nationality: string; books: number; followers: number; status: "Active" | "Draft"; bio: string };
export const authors: Author[] = [
  { id: "AUT-01", name: "Anisha Rao", nationality: "Indian", books: 6, followers: 12800, status: "Active", bio: "Historian and novelist based in Bengaluru." },
  { id: "AUT-02", name: "M. Ellery Vance", nationality: "American", books: 3, followers: 8420, status: "Active", bio: "Writer of quiet, cartographic fiction." },
  { id: "AUT-03", name: "Priya Menon", nationality: "Indian", books: 4, followers: 24100, status: "Active", bio: "Food writer and cookbook author from Kerala." },
  { id: "AUT-04", name: "Yusuf Chen", nationality: "Singaporean", books: 2, followers: 5210, status: "Active", bio: "Writes on machines, cognition and cities." },
  { id: "AUT-05", name: "Rowan Hale", nationality: "British", books: 7, followers: 19340, status: "Active", bio: "Essayist on grief, ritual and slow living." },
  { id: "AUT-06", name: "Léa Marchetti", nationality: "French", books: 5, followers: 6100, status: "Active", bio: "Poet, translator and letterpress printer." },
  { id: "AUT-07", name: "Devika Iyer", nationality: "Indian", books: 8, followers: 34210, status: "Active", bio: "Chronicles the bureaucratic sublime." },
  { id: "AUT-08", name: "Simon Ashford", nationality: "British", books: 1, followers: 980, status: "Draft", bio: "Memoirist. Debut coming this winter." },
];

export type Publisher = { id: string; name: string; hq: string; imprints: number; titles: number; contact: string; email: string; status: "Active" | "Inactive" };
export const publishers: Publisher[] = [
  { id: "PUB-01", name: "Aleph Press", hq: "New Delhi", imprints: 4, titles: 812, contact: "K. Rajan", email: "orders@alephpress.in", status: "Active" },
  { id: "PUB-02", name: "Kolkata Kitab", hq: "Kolkata", imprints: 2, titles: 341, contact: "S. Basu", email: "trade@kolkatakitab.in", status: "Active" },
  { id: "PUB-03", name: "Deccan Books", hq: "Hyderabad", imprints: 3, titles: 517, contact: "V. Reddy", email: "hello@deccanbooks.com", status: "Active" },
  { id: "PUB-04", name: "Ivory Owl", hq: "Mumbai", imprints: 1, titles: 128, contact: "N. Shah", email: "sales@ivoryowl.com", status: "Active" },
  { id: "PUB-05", name: "North Wind Editions", hq: "Shimla", imprints: 2, titles: 94, contact: "R. Bhatia", email: "info@northwind.in", status: "Inactive" },
];

export type Supplier = { id: string; name: string; gstin: string; city: string; leadDays: number; rating: number; balance: number; contact: string; phone: string };
export const suppliers: Supplier[] = [
  { id: "SUP-01", name: "Aleph Press Distribution", gstin: "07AABCA1234E1Z5", city: "Delhi", leadDays: 4, rating: 4.7, balance: 128400, contact: "R. Bhaskar", phone: "+91 98110 20000" },
  { id: "SUP-02", name: "Southern Books Depot", gstin: "33AAACS9012F1Z2", city: "Chennai", leadDays: 6, rating: 4.3, balance: 42100, contact: "M. Iyer", phone: "+91 98400 33221" },
  { id: "SUP-03", name: "Bombay Bookseller Co.", gstin: "27AAECB4455L1Z1", city: "Mumbai", leadDays: 3, rating: 4.8, balance: 208720, contact: "A. Kapoor", phone: "+91 98200 41000" },
  { id: "SUP-04", name: "Kolkata Kitab Wholesale", gstin: "19AABCK7788K1Z9", city: "Kolkata", leadDays: 7, rating: 4.1, balance: 66210, contact: "S. Basu", phone: "+91 98300 21100" },
  { id: "SUP-05", name: "Deccan Books Trading", gstin: "36AAECD3311M1Z4", city: "Hyderabad", leadDays: 5, rating: 4.5, balance: 91580, contact: "V. Reddy", phone: "+91 98480 11221" },
];

export type Brand = { id: string; name: string; segment: string; titles: number; status: "Active" | "Draft"; color: string };
export const brands: Brand[] = [
  { id: "BRN-01", name: "Aleph Classics", segment: "Fiction reprints", titles: 214, status: "Active", color: "#4F46E5" },
  { id: "BRN-02", name: "LittleReader", segment: "Children 3–8", titles: 128, status: "Active", color: "#F59E0B" },
  { id: "BRN-03", name: "Signal Academic", segment: "UG/PG textbooks", titles: 342, status: "Active", color: "#10B981" },
  { id: "BRN-04", name: "Nightjar", segment: "Poetry / literary", titles: 61, status: "Active", color: "#8B5CF6" },
  { id: "BRN-05", name: "SlowKitchen", segment: "Cookbooks", titles: 47, status: "Draft", color: "#EF4444" },
];

export type Series = { id: string; name: string; author: string; books: number; ongoing: boolean; latest: string };
export const seriesList: Series[] = [
  { id: "SER-01", name: "The Cartographer Cycle", author: "M. Ellery Vance", books: 3, ongoing: true, latest: "The Silent Cartographer" },
  { id: "SER-02", name: "Small Kingdom Ledgers", author: "Anisha Rao", books: 4, ongoing: true, latest: "Ledgers of the Small Kingdom" },
  { id: "SER-03", name: "Field Guides to Feeling", author: "Rowan Hale", books: 5, ongoing: true, latest: "A Field Guide to Grief" },
  { id: "SER-04", name: "Machines That Dream", author: "Yusuf Chen", books: 2, ongoing: false, latest: "Machines That Dream II" },
  { id: "SER-05", name: "The Municipal Sublime", author: "H. Trần", books: 3, ongoing: true, latest: "The Municipal Sublime" },
];

export type Language = { id: string; name: string; iso: string; script: string; titles: number; rtl: boolean; enabled: boolean };
export const languages: Language[] = [
  { id: "LNG-EN", name: "English", iso: "en", script: "Latin", titles: 4218, rtl: false, enabled: true },
  { id: "LNG-HI", name: "Hindi", iso: "hi", script: "Devanagari", titles: 1284, rtl: false, enabled: true },
  { id: "LNG-BN", name: "Bengali", iso: "bn", script: "Bengali", titles: 612, rtl: false, enabled: true },
  { id: "LNG-TA", name: "Tamil", iso: "ta", script: "Tamil", titles: 498, rtl: false, enabled: true },
  { id: "LNG-TE", name: "Telugu", iso: "te", script: "Telugu", titles: 411, rtl: false, enabled: true },
  { id: "LNG-MR", name: "Marathi", iso: "mr", script: "Devanagari", titles: 379, rtl: false, enabled: true },
  { id: "LNG-GU", name: "Gujarati", iso: "gu", script: "Gujarati", titles: 261, rtl: false, enabled: true },
  { id: "LNG-UR", name: "Urdu", iso: "ur", script: "Perso-Arabic", titles: 188, rtl: true, enabled: true },
  { id: "LNG-ML", name: "Malayalam", iso: "ml", script: "Malayalam", titles: 233, rtl: false, enabled: true },
  { id: "LNG-KN", name: "Kannada", iso: "kn", script: "Kannada", titles: 214, rtl: false, enabled: false },
];

export type Edition = { id: string; name: string; year: number; publisher: string; kind: "First" | "Reprint" | "Revised" | "Illustrated" | "Anniversary"; titles: number };
export const editions: Edition[] = [
  { id: "EDN-01", name: "First edition", year: 2024, publisher: "Aleph Press", kind: "First", titles: 128 },
  { id: "EDN-02", name: "10th anniversary", year: 2025, publisher: "Aleph Press", kind: "Anniversary", titles: 12 },
  { id: "EDN-03", name: "Revised & expanded", year: 2023, publisher: "Signal Academic", kind: "Revised", titles: 44 },
  { id: "EDN-04", name: "Illustrated edition", year: 2024, publisher: "LittleReader", kind: "Illustrated", titles: 31 },
  { id: "EDN-05", name: "Paperback reprint", year: 2026, publisher: "Kolkata Kitab", kind: "Reprint", titles: 210 },
];

export type Format = { id: string; name: string; kind: string; weight: string; hasIsbn: boolean; taxable: boolean; titles: number };
export const formats: Format[] = [
  { id: "FMT-PB", name: "Paperback", kind: "Physical", weight: "300–450 g", hasIsbn: true, taxable: true, titles: 3218 },
  { id: "FMT-HB", name: "Hardcover", kind: "Physical", weight: "500–900 g", hasIsbn: true, taxable: true, titles: 1421 },
  { id: "FMT-EB", name: "eBook (EPUB)", kind: "Digital", weight: "—", hasIsbn: true, taxable: true, titles: 984 },
  { id: "FMT-PDF", name: "PDF", kind: "Digital", weight: "—", hasIsbn: false, taxable: true, titles: 214 },
  { id: "FMT-AB", name: "Audiobook (M4B)", kind: "Digital", weight: "—", hasIsbn: true, taxable: true, titles: 121 },
  { id: "FMT-BS", name: "Box Set", kind: "Physical", weight: "1.5–3 kg", hasIsbn: true, taxable: true, titles: 47 },
];
