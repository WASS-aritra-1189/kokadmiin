export type LocaleLanguage = { id: string; name: string; iso: string; locale: string; script: string; rtl: boolean; enabled: boolean; isDefault: boolean };
export const localeLanguages: LocaleLanguage[] = [
  { id: "l1", name: "English", iso: "en", locale: "en-IN", script: "Latin", rtl: false, enabled: true, isDefault: true },
  { id: "l2", name: "Hindi", iso: "hi", locale: "hi-IN", script: "Devanagari", rtl: false, enabled: true, isDefault: false },
  { id: "l3", name: "Bengali", iso: "bn", locale: "bn-IN", script: "Bengali", rtl: false, enabled: true, isDefault: false },
  { id: "l4", name: "Tamil", iso: "ta", locale: "ta-IN", script: "Tamil", rtl: false, enabled: true, isDefault: false },
  { id: "l5", name: "Marathi", iso: "mr", locale: "mr-IN", script: "Devanagari", rtl: false, enabled: false, isDefault: false },
  { id: "l6", name: "Urdu", iso: "ur", locale: "ur-IN", script: "Nastaʿlīq", rtl: true, enabled: false, isDefault: false },
  { id: "l7", name: "Arabic", iso: "ar", locale: "ar-AE", script: "Arabic", rtl: true, enabled: false, isDefault: false },
];

export type Currency = { id: string; name: string; code: string; symbol: string; rate: number; decimals: number; enabled: boolean; isBase: boolean };
export const currencies: Currency[] = [
  { id: "c1", name: "Indian Rupee", code: "INR", symbol: "₹", rate: 1, decimals: 2, enabled: true, isBase: true },
  { id: "c2", name: "US Dollar", code: "USD", symbol: "$", rate: 0.012, decimals: 2, enabled: true, isBase: false },
  { id: "c3", name: "Euro", code: "EUR", symbol: "€", rate: 0.011, decimals: 2, enabled: true, isBase: false },
  { id: "c4", name: "British Pound", code: "GBP", symbol: "£", rate: 0.0094, decimals: 2, enabled: true, isBase: false },
  { id: "c5", name: "UAE Dirham", code: "AED", symbol: "د.إ", rate: 0.044, decimals: 2, enabled: false, isBase: false },
  { id: "c6", name: "Singapore Dollar", code: "SGD", symbol: "S$", rate: 0.016, decimals: 2, enabled: false, isBase: false },
];

export type Country = { id: string; name: string; iso2: string; iso3: string; phone: string; currency: string; enabled: boolean; shipping: boolean };
export const countries: Country[] = [
  { id: "co1", name: "India", iso2: "IN", iso3: "IND", phone: "+91", currency: "INR", enabled: true, shipping: true },
  { id: "co2", name: "United States", iso2: "US", iso3: "USA", phone: "+1", currency: "USD", enabled: true, shipping: true },
  { id: "co3", name: "United Kingdom", iso2: "GB", iso3: "GBR", phone: "+44", currency: "GBP", enabled: true, shipping: true },
  { id: "co4", name: "Germany", iso2: "DE", iso3: "DEU", phone: "+49", currency: "EUR", enabled: true, shipping: false },
  { id: "co5", name: "United Arab Emirates", iso2: "AE", iso3: "ARE", phone: "+971", currency: "AED", enabled: false, shipping: false },
  { id: "co6", name: "Singapore", iso2: "SG", iso3: "SGP", phone: "+65", currency: "SGD", enabled: false, shipping: false },
];

export type State = { id: string; name: string; code: string; country: string; gstCode: string; enabled: boolean };
export const states: State[] = [
  { id: "s1", name: "Maharashtra", code: "MH", country: "India", gstCode: "27", enabled: true },
  { id: "s2", name: "Karnataka", code: "KA", country: "India", gstCode: "29", enabled: true },
  { id: "s3", name: "Tamil Nadu", code: "TN", country: "India", gstCode: "33", enabled: true },
  { id: "s4", name: "Delhi", code: "DL", country: "India", gstCode: "07", enabled: true },
  { id: "s5", name: "West Bengal", code: "WB", country: "India", gstCode: "19", enabled: true },
  { id: "s6", name: "Gujarat", code: "GJ", country: "India", gstCode: "24", enabled: true },
  { id: "s7", name: "Uttar Pradesh", code: "UP", country: "India", gstCode: "09", enabled: true },
  { id: "s8", name: "California", code: "CA", country: "United States", gstCode: "—", enabled: true },
  { id: "s9", name: "New York", code: "NY", country: "United States", gstCode: "—", enabled: true },
];

export type City = { id: string; name: string; state: string; country: string; pincode: string; tier: "Metro" | "Tier 1" | "Tier 2" | "Tier 3"; enabled: boolean };
export const cities: City[] = [
  { id: "ci1", name: "Mumbai", state: "Maharashtra", country: "India", pincode: "400001", tier: "Metro", enabled: true },
  { id: "ci2", name: "Pune", state: "Maharashtra", country: "India", pincode: "411001", tier: "Tier 1", enabled: true },
  { id: "ci3", name: "Bengaluru", state: "Karnataka", country: "India", pincode: "560001", tier: "Metro", enabled: true },
  { id: "ci4", name: "Chennai", state: "Tamil Nadu", country: "India", pincode: "600001", tier: "Metro", enabled: true },
  { id: "ci5", name: "New Delhi", state: "Delhi", country: "India", pincode: "110001", tier: "Metro", enabled: true },
  { id: "ci6", name: "Kolkata", state: "West Bengal", country: "India", pincode: "700001", tier: "Metro", enabled: true },
  { id: "ci7", name: "Ahmedabad", state: "Gujarat", country: "India", pincode: "380001", tier: "Tier 1", enabled: true },
  { id: "ci8", name: "Lucknow", state: "Uttar Pradesh", country: "India", pincode: "226001", tier: "Tier 1", enabled: true },
  { id: "ci9", name: "Nashik", state: "Maharashtra", country: "India", pincode: "422001", tier: "Tier 2", enabled: false },
];

export type TimeZone = { id: string; name: string; tz: string; offset: string; country: string; enabled: boolean; isDefault: boolean };
export const timezones: TimeZone[] = [
  { id: "t1", name: "India Standard Time", tz: "Asia/Kolkata", offset: "+05:30", country: "India", enabled: true, isDefault: true },
  { id: "t2", name: "Coordinated Universal Time", tz: "UTC", offset: "+00:00", country: "—", enabled: true, isDefault: false },
  { id: "t3", name: "Eastern Time", tz: "America/New_York", offset: "-05:00", country: "United States", enabled: true, isDefault: false },
  { id: "t4", name: "Pacific Time", tz: "America/Los_Angeles", offset: "-08:00", country: "United States", enabled: true, isDefault: false },
  { id: "t5", name: "British Time", tz: "Europe/London", offset: "+00:00", country: "United Kingdom", enabled: false, isDefault: false },
  { id: "t6", name: "Gulf Standard Time", tz: "Asia/Dubai", offset: "+04:00", country: "United Arab Emirates", enabled: false, isDefault: false },
  { id: "t7", name: "Singapore Time", tz: "Asia/Singapore", offset: "+08:00", country: "Singapore", enabled: false, isDefault: false },
];
