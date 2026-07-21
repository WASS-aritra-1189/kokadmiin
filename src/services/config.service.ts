import { api } from "@/lib/axios";
import type { Provider } from "@/components/admin/IntegrationsPage";

const wrap = <T,>(r: any): T => r.data?.data ?? r.data;

export interface PaymentGatewayConfig {
  id: string;
  provider: string;
  keyId: string;
  keySecret?: string;
  currency: string;
  webhookSecret?: string;
  status: string;
}

export interface CourierGatewayConfig {
  id: string;
  provider: string;
  email: string;
  channelId: string;
  pickupLocation: string;
  warehousePincode: string;
  warehouseState: string;
  warehousePhone: string;
  autoPickup: boolean;
  status: string;
}

export interface EmailConfig {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword?: string;
  fromName: string;
  fromEmail: string;
  useSSL: boolean;
  status: string;
}

export interface SmsGatewayConfig {
  id: string;
  provider: string;
  subDomain?: string;
  accountSid?: string;
  apiKey?: string;
  apiToken?: string;
  fromNumber?: string;
  authKey?: string;
  templateId?: string;
  status: string;
}

// Config Service APIs
export const configService = {
  // Payment Gateway
  getPaymentConfig: () => api.get("/payment-gateway/config").then(wrap<PaymentGatewayConfig>),
  updatePaymentConfig: (data: Partial<PaymentGatewayConfig>) =>
    api.patch("/payment-gateway/config", data).then(wrap),

  // Courier Gateway
  getCourierConfig: () => api.get("/courier-gateway/config").then(wrap<CourierGatewayConfig>),
  updateCourierConfig: (data: Partial<CourierGatewayConfig>) =>
    api.patch("/courier-gateway/config", data).then(wrap),

  // Email
  getEmailConfig: () => api.get("/email/config").then(wrap<EmailConfig>),
  updateEmailConfig: (data: Partial<EmailConfig>) =>
    api.patch("/email/config", data).then(wrap),
  sendTestEmail: (email: string) =>
    api.post("/email/test", { testEmail: email }).then(wrap),

  // SMS Gateway
  getSmsConfig: () => api.get("/sms-gateway/config").then(wrap<SmsGatewayConfig>),
  updateSmsConfig: (data: Partial<SmsGatewayConfig>) =>
    api.patch("/sms-gateway/config", data).then(wrap),
};

// Payment Gateway - Show only configured provider
export const mapPaymentConfigToProvider = (config: PaymentGatewayConfig | null): Provider[] => {
  if (!config?.provider) {
    return [
      { id: "razorpay", name: "Razorpay", tagline: "UPI, cards, netbanking, wallets for Indian merchants.", logo: "RZ", color: "#0C2451", status: "available", fields: [
        { name: "keyId", label: "Key ID", placeholder: "rzp_live_…" },
        { name: "keySecret", label: "Key secret", type: "password" },
        { name: "webhookSecret", label: "Webhook secret", type: "password", full: true },
        { name: "currency", label: "Currency", placeholder: "INR" },
      ]},
    ];
  }

  const providerConfigs: Record<string, Provider> = {
    razorpay: {
      id: "razorpay", name: "Razorpay", tagline: "UPI, cards, netbanking, wallets for Indian merchants.",
      logo: "RZ", color: "#0C2451", status: "connected",
      fields: [
        { name: "keyId", label: "Key ID" },
        { name: "keySecret", label: "Key secret", type: "password" },
        { name: "webhookSecret", label: "Webhook secret", type: "password", full: true },
        { name: "currency", label: "Currency" },
      ],
      meta: [
        { label: "Key ID", value: config.keyId || "N/A" },
        { label: "Currency", value: config.currency || "INR" },
        { label: "Status", value: config.status || "ACTIVE" },
      ],
    },
    stripe: {
      id: "stripe", name: "Stripe", tagline: "International cards, Apple/Google Pay, subscriptions.",
      logo: "ST", color: "#635BFF", status: "connected",
      fields: [
        { name: "publishableKey", label: "Publishable key" },
        { name: "secretKey", label: "Secret key", type: "password" },
      ],
    },
    payu: {
      id: "payu", name: "PayU", tagline: "Popular Indian gateway with EMI and BNPL options.",
      logo: "PU", color: "#00B67F", status: "connected",
      fields: [
        { name: "merchantKey", label: "Merchant key" },
        { name: "merchantSalt", label: "Merchant salt", type: "password" },
      ],
    },
  };

  return [providerConfigs[config.provider] || providerConfigs.razorpay];
};

// Courier Gateway - Show only configured provider
export const mapCourierConfigToProvider = (config: CourierGatewayConfig | null): Provider[] => {
  if (!config?.provider) {
    return [
      { id: "shiprocket", name: "Shiprocket", tagline: "Multi-courier aggregator with the biggest domestic network.", logo: "SR", color: "#7A1CFF", status: "available", fields: [
        { name: "email", label: "Account email" },
        { name: "password", label: "Password", type: "password" },
        { name: "channelId", label: "Channel ID" },
        { name: "pickupLocation", label: "Default pickup location" },
      ]},
    ];
  }

  const providerConfigs: Record<string, Provider> = {
    shiprocket: {
      id: "shiprocket", name: "Shiprocket", tagline: "Multi-courier aggregator with the biggest domestic network.",
      logo: "SR", color: "#7A1CFF", status: "connected",
      fields: [
        { name: "email", label: "Account email" },
        { name: "password", label: "Password", type: "password" },
        { name: "channelId", label: "Channel ID" },
        { name: "pickupLocation", label: "Default pickup location" },
      ],
      meta: [
        { label: "Email", value: config.email || "N/A" },
        { label: "Channel ID", value: config.channelId || "N/A" },
        { label: "Pickup Location", value: config.pickupLocation || "N/A" },
        { label: "Pincode", value: config.warehousePincode || "N/A" },
      ],
    },
    delhivery: {
      id: "delhivery", name: "Delhivery", tagline: "Direct API for surface, express and heavy shipments.",
      logo: "DL", color: "#E4002B", status: "connected",
      fields: [
        { name: "apiToken", label: "API token", type: "password" },
        { name: "clientName", label: "Client name" },
      ],
    },
  };

  return [providerConfigs[config.provider] || providerConfigs.shiprocket];
};

// Email - Show only configured
export const mapEmailConfigToProvider = (config: EmailConfig | null): Provider[] => {
  if (!config?.smtpHost) {
    return [
      { id: "smtp", name: "SMTP Config", tagline: "Configure your SMTP server for transactional emails.", logo: "EM", color: "#1A82E2", status: "available", fields: [
        { name: "smtpHost", label: "SMTP Host", placeholder: "smtp.gmail.com" },
        { name: "smtpPort", label: "SMTP Port", placeholder: "587" },
        { name: "smtpUsername", label: "SMTP Username" },
        { name: "smtpPassword", label: "SMTP Password", type: "password" },
        { name: "fromEmail", label: "From Email" },
        { name: "fromName", label: "From Name" },
      ]},
    ];
  }

  return [{
    id: "smtp", name: "SMTP Config", tagline: "Transactional email configuration.",
    logo: "EM", color: "#1A82E2", status: "connected",
    fields: [
      { name: "smtpHost", label: "SMTP Host" },
      { name: "smtpPort", label: "SMTP Port" },
      { name: "smtpUsername", label: "SMTP Username" },
      { name: "smtpPassword", label: "SMTP Password", type: "password" },
      { name: "fromEmail", label: "From Email" },
      { name: "fromName", label: "From Name" },
      { name: "useSSL", label: "Use SSL", type: "toggle" },
    ],
    meta: [
      { label: "SMTP Host", value: config.smtpHost },
      { label: "Port", value: String(config.smtpPort) },
      { label: "From Email", value: config.fromEmail || "N/A" },
      { label: "SSL", value: config.useSSL ? "Enabled" : "Disabled" },
    ],
  }];
};

// SMS Gateway - Show only configured provider
export const mapSmsConfigToProvider = (config: SmsGatewayConfig | null): Provider[] => {
  if (!config?.provider) {
    return [
      { id: "sms", name: "SMS Gateway", tagline: "Configure SMS provider for OTPs and notifications.", logo: "MS", color: "#F26522", status: "available", fields: [
        { name: "provider", label: "Provider", type: "select", options: ["exptel", "msg91", "twilio"] },
        { name: "accountSid", label: "Account SID" },
        { name: "apiKey", label: "API Key", type: "password" },
        { name: "apiToken", label: "API Token", type: "password" },
        { name: "fromNumber", label: "Sender ID" },
      ]},
    ];
  }

  return [{
    id: "sms", name: "SMS Gateway", tagline: "SMS provider configuration.",
    logo: "MS", color: "#F26522", status: "connected",
    fields: [
      { name: "provider", label: "Provider" },
      { name: "subDomain", label: "Sub Domain" },
      { name: "accountSid", label: "Account SID" },
      { name: "apiKey", label: "API Key", type: "password" },
      { name: "apiToken", label: "API Token", type: "password" },
      { name: "fromNumber", label: "Sender ID" },
    ],
    meta: [
      { label: "Provider", value: config.provider?.toUpperCase() || "N/A" },
      { label: "Account SID", value: config.accountSid || "N/A" },
      { label: "Sender ID", value: config.fromNumber || "N/A" },
    ],
  }];
};