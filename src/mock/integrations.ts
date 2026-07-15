import type { Provider } from "@/components/admin/IntegrationsPage";

export const paymentProviders: Provider[] = [
  { id: "razorpay", name: "Razorpay", tagline: "UPI, cards, netbanking, wallets for Indian merchants.", logo: "RZ", color: "#0C2451", status: "connected",
    meta: [{ label: "Mode", value: "Live" }, { label: "MID", value: "acc_L9x8…" }, { label: "Success rate", value: "98.4%" }, { label: "Settlement", value: "T+2" }],
    fields: [
      { name: "keyId", label: "Key ID", placeholder: "rzp_live_…" },
      { name: "keySecret", label: "Key secret", type: "password" },
      { name: "webhookSecret", label: "Webhook secret", type: "password", full: true },
      { name: "captureMode", label: "Capture", type: "select", options: ["Automatic", "Manual"] },
      { name: "enabled", label: "Enabled at checkout", type: "toggle" },
    ] },
  { id: "stripe", name: "Stripe", tagline: "International cards, Apple/Google Pay, subscriptions.", logo: "ST", color: "#635BFF", status: "connected",
    meta: [{ label: "Mode", value: "Live" }, { label: "Account", value: "acct_1O…" }, { label: "Currency", value: "INR, USD" }, { label: "Success rate", value: "97.1%" }],
    fields: [
      { name: "publishableKey", label: "Publishable key", placeholder: "pk_live_…" },
      { name: "secretKey", label: "Secret key", type: "password", placeholder: "sk_live_…" },
      { name: "webhookSecret", label: "Webhook signing secret", type: "password", full: true },
      { name: "enabled", label: "Enabled", type: "toggle" },
    ] },
  { id: "payu", name: "PayU", tagline: "Popular Indian gateway with EMI and BNPL options.", logo: "PU", color: "#00B67F", status: "available",
    fields: [
      { name: "merchantKey", label: "Merchant key" },
      { name: "merchantSalt", label: "Merchant salt", type: "password" },
      { name: "mode", label: "Mode", type: "select", options: ["Test", "Live"] },
    ] },
  { id: "cashfree", name: "Cashfree", tagline: "Payments, payouts and split settlements.", logo: "CF", color: "#4B36DC", status: "available",
    fields: [
      { name: "appId", label: "App ID" },
      { name: "secretKey", label: "Secret key", type: "password" },
    ] },
  { id: "paytm", name: "Paytm", tagline: "Wallet and UPI-first payments popular across India.", logo: "PT", color: "#00BAF2", status: "available",
    fields: [
      { name: "mid", label: "Merchant ID (MID)" },
      { name: "mkey", label: "Merchant key", type: "password" },
    ] },
  { id: "phonepe", name: "PhonePe", tagline: "UPI-native gateway with instant refunds.", logo: "PP", color: "#5F259F", status: "beta",
    fields: [
      { name: "merchantId", label: "Merchant ID" },
      { name: "saltKey", label: "Salt key", type: "password" },
      { name: "saltIndex", label: "Salt index", placeholder: "1" },
    ] },
];

export const courierProviders: Provider[] = [
  { id: "shiprocket", name: "Shiprocket", tagline: "Multi-courier aggregator with the biggest domestic network.", logo: "SR", color: "#7A1CFF", status: "connected",
    meta: [{ label: "Couriers", value: "17" }, { label: "Pickup", value: "MUM-01" }, { label: "COD", value: "Enabled" }, { label: "NDR", value: "Auto" }],
    fields: [
      { name: "email", label: "Account email" },
      { name: "password", label: "Password", type: "password" },
      { name: "channelId", label: "Channel ID" },
      { name: "pickupLocation", label: "Default pickup location" },
      { name: "codEnabled", label: "COD enabled", type: "toggle" },
    ] },
  { id: "delhivery", name: "Delhivery", tagline: "Direct API for surface, express and heavy shipments.", logo: "DL", color: "#E4002B", status: "connected",
    meta: [{ label: "Client", value: "BOOKS_MH" }, { label: "Zone", value: "West" }, { label: "SLA", value: "48h" }, { label: "Insurance", value: "Yes" }],
    fields: [
      { name: "apiToken", label: "API token", type: "password" },
      { name: "clientName", label: "Client name" },
      { name: "pickupPin", label: "Pickup pincode" },
    ] },
  { id: "bluedart", name: "Blue Dart", tagline: "Premium express delivery for high-value orders.", logo: "BD", color: "#003F87", status: "available",
    fields: [
      { name: "licenseKey", label: "License key", type: "password" },
      { name: "loginId", label: "Login ID" },
    ] },
  { id: "dtdc", name: "DTDC", tagline: "Wide surface network for tier-2/3 city fulfilment.", logo: "DT", color: "#EE1C25", status: "available",
    fields: [
      { name: "customerCode", label: "Customer code" },
      { name: "apiKey", label: "API key", type: "password" },
    ] },
  { id: "xpressbees", name: "Xpressbees", tagline: "Reliable third-party courier with a strong reverse-logistics network.", logo: "XB", color: "#FF6600", status: "available",
    fields: [
      { name: "email", label: "Email" },
      { name: "password", label: "Password", type: "password" },
    ] },
  { id: "indiapost", name: "India Post", tagline: "Reach every pincode; the fallback carrier for remote deliveries.", logo: "IP", color: "#B71C1C", status: "beta",
    fields: [
      { name: "customerId", label: "Customer ID" },
      { name: "apiKey", label: "API key", type: "password" },
    ] },
];

export const accountingProviders: Provider[] = [
  { id: "tally", name: "Tally", tagline: "Sync sales, credit notes and GST invoices into Tally ERP.", logo: "TL", color: "#0B6E4F", status: "connected",
    meta: [{ label: "Company", value: "Kokbooks LLP" }, { label: "Ledger", value: "Sales" }, { label: "Last sync", value: "2h ago" }, { label: "Records", value: "12,481" }],
    fields: [
      { name: "endpoint", label: "Tally gateway URL", placeholder: "http://tally.local:9000" },
      { name: "company", label: "Company name" },
      { name: "salesLedger", label: "Sales ledger" },
      { name: "gstLedger", label: "GST ledger" },
      { name: "syncFreq", label: "Sync frequency", type: "select", options: ["Realtime", "Hourly", "Daily"] },
    ] },
  { id: "zoho-books", name: "Zoho Books", tagline: "Cloud accounting with GST filing and reconciliation.", logo: "ZB", color: "#E42527", status: "available",
    fields: [
      { name: "orgId", label: "Organization ID" },
      { name: "clientId", label: "Client ID" },
      { name: "clientSecret", label: "Client secret", type: "password" },
      { name: "refreshToken", label: "Refresh token", type: "password", full: true },
    ] },
  { id: "quickbooks", name: "QuickBooks", tagline: "Popular international accounting suite with multi-currency support.", logo: "QB", color: "#2CA01C", status: "available",
    fields: [
      { name: "clientId", label: "Client ID" },
      { name: "clientSecret", label: "Client secret", type: "password" },
      { name: "realmId", label: "Realm (company) ID" },
    ] },
  { id: "xero", name: "Xero", tagline: "Small business accounting with bank feeds and payroll.", logo: "XE", color: "#13B5EA", status: "available",
    fields: [
      { name: "clientId", label: "Client ID" },
      { name: "clientSecret", label: "Client secret", type: "password" },
      { name: "tenantId", label: "Tenant ID" },
    ] },
];

export const emailProviders: Provider[] = [
  { id: "resend", name: "Resend", tagline: "Developer-friendly transactional email with domain verification.", logo: "RE", color: "#000000", status: "connected",
    meta: [{ label: "Domain", value: "kokbooks.in" }, { label: "DKIM", value: "Verified" }, { label: "Sent (30d)", value: "48,120" }, { label: "Bounce", value: "0.4%" }],
    fields: [
      { name: "apiKey", label: "API key", type: "password", placeholder: "re_live_…" },
      { name: "fromEmail", label: "From email", placeholder: "orders@kokbooks.in" },
      { name: "fromName", label: "From name" },
      { name: "replyTo", label: "Reply-to" },
    ] },
  { id: "sendgrid", name: "SendGrid", tagline: "Enterprise-grade delivery with detailed reputation analytics.", logo: "SG", color: "#1A82E2", status: "available",
    fields: [
      { name: "apiKey", label: "API key", type: "password", placeholder: "SG.…" },
      { name: "fromEmail", label: "From email" },
      { name: "template", label: "Default template ID" },
    ] },
  { id: "ses", name: "Amazon SES", tagline: "Low-cost bulk sending on AWS infrastructure.", logo: "SE", color: "#FF9900", status: "available",
    fields: [
      { name: "accessKeyId", label: "Access key ID" },
      { name: "secretAccessKey", label: "Secret access key", type: "password" },
      { name: "region", label: "Region", type: "select", options: ["ap-south-1", "us-east-1", "eu-west-1"] },
    ] },
  { id: "postmark", name: "Postmark", tagline: "Reliable transactional delivery separated from marketing streams.", logo: "PM", color: "#FFDE00", status: "available",
    fields: [
      { name: "serverToken", label: "Server token", type: "password" },
      { name: "streamId", label: "Message stream ID" },
    ] },
];

export const smsProviders: Provider[] = [
  { id: "msg91", name: "MSG91", tagline: "DLT-compliant transactional and OTP SMS across India.", logo: "M9", color: "#F26522", status: "connected",
    meta: [{ label: "Sender ID", value: "KOKBKS" }, { label: "DLT", value: "Registered" }, { label: "Sent (30d)", value: "18,420" }, { label: "Delivery", value: "96%" }],
    fields: [
      { name: "authKey", label: "Auth key", type: "password" },
      { name: "senderId", label: "Sender ID" },
      { name: "dltTemplateId", label: "DLT template ID" },
      { name: "route", label: "Route", type: "select", options: ["Transactional", "Promotional", "OTP"] },
    ] },
  { id: "twilio", name: "Twilio", tagline: "Global SMS/WhatsApp/voice with programmable APIs.", logo: "TW", color: "#F22F46", status: "available",
    fields: [
      { name: "accountSid", label: "Account SID" },
      { name: "authToken", label: "Auth token", type: "password" },
      { name: "fromNumber", label: "From number" },
    ] },
  { id: "textlocal", name: "Textlocal", tagline: "Simple bulk SMS with campaign scheduling.", logo: "TL", color: "#0091D5", status: "available",
    fields: [
      { name: "apiKey", label: "API key", type: "password" },
      { name: "sender", label: "Sender ID" },
    ] },
  { id: "kaleyra", name: "Kaleyra", tagline: "Omnichannel messaging with SMS + WhatsApp + voice.", logo: "KL", color: "#4B0082", status: "beta",
    fields: [
      { name: "sid", label: "SID" },
      { name: "apiKey", label: "API key", type: "password" },
    ] },
];

export const whatsappProviders: Provider[] = [
  { id: "meta-cloud", name: "WhatsApp Cloud API", tagline: "Official Meta Cloud API with template messaging.", logo: "WA", color: "#25D366", status: "connected",
    meta: [{ label: "WABA", value: "10298…" }, { label: "Phone", value: "+91 9876…" }, { label: "Templates", value: "12 approved" }, { label: "Quality", value: "Green" }],
    fields: [
      { name: "phoneNumberId", label: "Phone number ID" },
      { name: "wabaId", label: "Business account ID" },
      { name: "accessToken", label: "Permanent access token", type: "password", full: true },
      { name: "verifyToken", label: "Webhook verify token", type: "password" },
    ] },
  { id: "gupshup", name: "Gupshup", tagline: "BSP with unified WhatsApp templates + no-code bots.", logo: "GS", color: "#FF6B00", status: "available",
    fields: [
      { name: "apiKey", label: "API key", type: "password" },
      { name: "appName", label: "App name" },
      { name: "source", label: "Source (WhatsApp number)" },
    ] },
  { id: "wati", name: "Wati", tagline: "Team inbox + broadcast tooling on top of WhatsApp Cloud.", logo: "WT", color: "#00A884", status: "available",
    fields: [
      { name: "endpoint", label: "Tenant endpoint", type: "url" },
      { name: "accessToken", label: "Access token", type: "password" },
    ] },
  { id: "interakt", name: "Interakt", tagline: "Marketing automations and shared team inbox for D2C.", logo: "IN", color: "#5B21B6", status: "beta",
    fields: [
      { name: "secretKey", label: "Secret key", type: "password" },
    ] },
];

export const analyticsProviders: Provider[] = [
  { id: "ga4", name: "Google Analytics 4", tagline: "Event-based product analytics with e-commerce reports.", logo: "GA", color: "#F9AB00", status: "connected",
    meta: [{ label: "Property", value: "G-XXXX1234" }, { label: "Stream", value: "kokbooks.in" }, { label: "Events (30d)", value: "1.4M" }, { label: "Consent", value: "Granted" }],
    fields: [
      { name: "measurementId", label: "Measurement ID", placeholder: "G-XXXXXXXXXX" },
      { name: "apiSecret", label: "Measurement Protocol secret", type: "password" },
      { name: "sendEcommerce", label: "Send e-commerce events", type: "toggle" },
      { name: "anonymizeIp", label: "Anonymize IP", type: "toggle" },
    ] },
  { id: "mixpanel", name: "Mixpanel", tagline: "Product analytics with funnels and cohort retention.", logo: "MP", color: "#7856FF", status: "available",
    fields: [
      { name: "projectToken", label: "Project token" },
      { name: "region", label: "Data residency", type: "select", options: ["US", "EU", "IN"] },
    ] },
  { id: "posthog", name: "PostHog", tagline: "Open-source analytics with session replay and feature flags.", logo: "PH", color: "#1D4AFF", status: "available",
    fields: [
      { name: "apiKey", label: "Project API key" },
      { name: "host", label: "Instance host", placeholder: "https://app.posthog.com" },
    ] },
];

export const gtmProviders: Provider[] = [
  { id: "gtm-web", name: "Google Tag Manager (Web)", tagline: "Manage marketing/analytics tags without code changes.", logo: "GT", color: "#246FDB", status: "connected",
    meta: [{ label: "Container", value: "GTM-ABCD123" }, { label: "Version", value: "v42" }, { label: "Tags", value: "18" }, { label: "Consent Mode", value: "v2" }],
    fields: [
      { name: "containerId", label: "Container ID", placeholder: "GTM-XXXXXXX" },
      { name: "enableConsentMode", label: "Enable Consent Mode v2", type: "toggle" },
      { name: "dataLayerName", label: "dataLayer variable", placeholder: "dataLayer" },
    ] },
  { id: "gtm-server", name: "GTM Server-Side", tagline: "Route events server-side for accuracy on iOS/adblock traffic.", logo: "GS", color: "#0F9D58", status: "available",
    fields: [
      { name: "serverContainerUrl", label: "Server container URL", type: "url" },
      { name: "measurementId", label: "GA4 measurement ID" },
      { name: "apiSecret", label: "API secret", type: "password" },
    ] },
];

export const pixelProviders: Provider[] = [
  { id: "meta-pixel", name: "Meta Pixel", tagline: "Facebook + Instagram conversion tracking with CAPI.", logo: "MP", color: "#1877F2", status: "connected",
    meta: [{ label: "Pixel ID", value: "9082…" }, { label: "Match quality", value: "8.7" }, { label: "CAPI", value: "Enabled" }, { label: "Events (30d)", value: "241k" }],
    fields: [
      { name: "pixelId", label: "Pixel ID" },
      { name: "capiToken", label: "Conversions API access token", type: "password" },
      { name: "testEventCode", label: "Test event code" },
      { name: "deduplicate", label: "Deduplicate pixel + CAPI", type: "toggle" },
    ] },
  { id: "tiktok-pixel", name: "TikTok Pixel", tagline: "Track conversions from TikTok Ads campaigns.", logo: "TT", color: "#000000", status: "available",
    fields: [
      { name: "pixelId", label: "Pixel ID" },
      { name: "accessToken", label: "Events API access token", type: "password" },
    ] },
  { id: "pinterest-tag", name: "Pinterest Tag", tagline: "Attribution for Pinterest shopping campaigns.", logo: "PN", color: "#E60023", status: "available",
    fields: [
      { name: "tagId", label: "Tag ID" },
    ] },
  { id: "snap-pixel", name: "Snap Pixel", tagline: "Track Snapchat ad conversions with CAPI support.", logo: "SN", color: "#FFFC00", status: "beta",
    fields: [
      { name: "pixelId", label: "Pixel ID" },
      { name: "accessToken", label: "CAPI token", type: "password" },
    ] },
];

export const webhookEndpoints: Provider[] = [
  { id: "order-created", name: "order.created", tagline: "Fires when a customer completes checkout. Includes items, totals and shipping.", logo: "OC", color: "#4F46E5", status: "connected",
    meta: [{ label: "URL", value: "https://ops.kok…/orders" }, { label: "Deliveries (24h)", value: "412" }, { label: "Success", value: "99.5%" }, { label: "Last event", value: "3m ago" }],
    fields: [
      { name: "url", label: "Endpoint URL", type: "url", placeholder: "https://…", full: true },
      { name: "secret", label: "Signing secret", type: "password", full: true },
      { name: "version", label: "API version", type: "select", options: ["2025-01", "2024-10"] },
      { name: "retry", label: "Retry on 5xx", type: "toggle" },
    ] },
  { id: "order-fulfilled", name: "order.fulfilled", tagline: "Fires once every item ships. Payload includes AWB + courier.", logo: "OF", color: "#10B981", status: "connected",
    meta: [{ label: "URL", value: "https://wh.kok…/ship" }, { label: "Deliveries (24h)", value: "298" }, { label: "Success", value: "100%" }, { label: "Last event", value: "12m ago" }],
    fields: [
      { name: "url", label: "Endpoint URL", type: "url", full: true },
      { name: "secret", label: "Signing secret", type: "password", full: true },
    ] },
  { id: "refund-issued", name: "refund.issued", tagline: "Fires whenever a refund transitions to succeeded.", logo: "RI", color: "#F59E0B", status: "available",
    fields: [
      { name: "url", label: "Endpoint URL", type: "url", full: true },
      { name: "secret", label: "Signing secret", type: "password", full: true },
    ] },
  { id: "inventory-low", name: "inventory.low_stock", tagline: "Fires when SKU stock falls under the reorder point.", logo: "IL", color: "#EF4444", status: "available",
    fields: [
      { name: "url", label: "Endpoint URL", type: "url", full: true },
      { name: "secret", label: "Signing secret", type: "password", full: true },
      { name: "threshold", label: "Extra threshold offset" },
    ] },
  { id: "customer-created", name: "customer.created", tagline: "Fires when a new customer account is created.", logo: "CC", color: "#0EA5E9", status: "available",
    fields: [
      { name: "url", label: "Endpoint URL", type: "url", full: true },
      { name: "secret", label: "Signing secret", type: "password", full: true },
    ] },
];
