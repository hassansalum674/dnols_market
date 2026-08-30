const LAST_PHONE = "dnols.checkout.lastPhone";
const LAST_METHOD = "dnols.checkout.lastMethod";

export type PayMethod = "mpesa" | "tigo" | "airtel";

export function saveCheckoutPrefs(phone: string, method: PayMethod): void {
  try {
    localStorage.setItem(LAST_PHONE, phone);
    localStorage.setItem(LAST_METHOD, method);
  } catch {
    /* ignore */
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
}[] = [
  {
    id: "mpesa",
    label: "M-Pesa",
    network: "Vodacom",
    stkHint: "Enter your M-Pesa PIN on the Vodacom prompt",
  },
  {
    id: "tigo",
    label: "Mix by Yas",
    network: "Tigo Pesa",
    stkHint: "Approve the payment on your Mix by Yas / Tigo Pesa screen",
  },
  {
    id: "airtel",
    label: "Airtel Money",
    network: "Airtel",
    stkHint: "Confirm with your Airtel Money PIN when prompted",
  },
];
