import { requestAccountPush } from "./syncBus";

const LAST_PHONE = "dnols.checkout.lastPhone";
const LAST_DELIVERY_PHONE = "dnols.checkout.lastDeliveryPhone";
const LAST_METHOD = "dnols.checkout.lastMethod";
const LAST_FULFILLMENT = "dnols.checkout.lastFulfillment";
const LAST_ADDRESS = "dnols.checkout.lastAddress";

export type PayMethod = "mpesa" | "tigo" | "airtel";
export type Fulfillment = "pickup" | "delivery";

export function saveCheckoutPrefs(
  phone: string,
  method: PayMethod,
  deliveryPhone?: string,
  fulfillment?: Fulfillment,
  deliveryAddress?: string,
): void {
  try {
    localStorage.setItem(LAST_PHONE, phone);
    localStorage.setItem(LAST_METHOD, method);
    if (deliveryPhone) {
      localStorage.setItem(LAST_DELIVERY_PHONE, deliveryPhone);
    }
    if (fulfillment) {
      localStorage.setItem(LAST_FULFILLMENT, fulfillment);
    }
    if (deliveryAddress) {
      localStorage.setItem(LAST_ADDRESS, deliveryAddress.trim());
    }
    requestAccountPush();
  } catch {
    /* ignore */
  }
}

export function loadLastFulfillment(): Fulfillment | null {
  try {
    const v = localStorage.getItem(LAST_FULFILLMENT);
    if (v === "pickup" || v === "delivery") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function loadLastAddress(): string {
  try {
    return localStorage.getItem(LAST_ADDRESS) ?? "";
  } catch {
    return "";
  }
}

export function loadLastDeliveryPhone(): string {
  try {
    return localStorage.getItem(LAST_DELIVERY_PHONE) ?? "";
  } catch {
    return "";
  }
}

export function loadLastPayPhone(): string {
  try {
    return localStorage.getItem(LAST_PHONE) ?? "";
  } catch {
    return "";
  }
}

export function loadLastPayMethod(): PayMethod {
  try {
    const m = localStorage.getItem(LAST_METHOD);
    if (m === "tigo" || m === "airtel" || m === "mpesa") return m;
  } catch {
    /* ignore */
  }
  return "mpesa";
}

export const PAY_METHODS: {
  id: PayMethod;
  label: string;
  network: string;
  stkHint: string;
  checkoutLabel: string;
  accent: string;
}[] = [
  {
    id: "mpesa",
    label: "M-Pesa",
    network: "Vodacom",
    checkoutLabel: "Pay with M-Pesa",
    accent: "#4caf50",
    stkHint: "Enter your M-Pesa PIN on the Vodacom prompt",
  },
  {
    id: "tigo",
    label: "Mix by Yas",
    network: "Tigo Pesa",
    checkoutLabel: "Pay with Mix by Yas",
    accent: "#1565c0",
    stkHint: "Approve the payment on your Mix by Yas / Tigo Pesa screen",
  },
  {
    id: "airtel",
    label: "Airtel Money",
    network: "Airtel",
    checkoutLabel: "Pay with Airtel Money",
    accent: "#e40000",
    stkHint: "Confirm with your Airtel Money PIN when prompted",
  },
];
