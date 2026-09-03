import type { PayMethod } from "./checkout";
import { PAY_METHODS } from "./checkout";
import { requestAccountPush } from "./syncBus";

export type BillingCard = {
  id: string;
  method: PayMethod;
  phone: string;
  deliveryPhone?: string;
  label?: string;
  createdAt: string;
};

function key(uid: string): string {
  return `dnols.billing.${uid}`;
}

function read(uid: string): BillingCard[] {
  try {
    return JSON.parse(localStorage.getItem(key(uid)) || "[]") as BillingCard[];
  } catch {
    return [];
  }
}

function write(uid: string, cards: BillingCard[]): void {
  localStorage.setItem(key(uid), JSON.stringify(cards.slice(0, 5)));
  requestAccountPush();
}

export function loadBillingCards(uid: string): BillingCard[] {
  return read(uid);
}

export function deleteBillingCard(uid: string, id: string): void {
  write(
    uid,
    read(uid).filter((c) => c.id !== id),
  );
}

export function addBillingCard(
  uid: string,
  input: {
    method: PayMethod;
    phone: string;
    deliveryPhone?: string;
    label?: string;
  },
): BillingCard {
  const cards = read(uid);
  const existing = cards.findIndex(
    (c) =>
      c.method === input.method &&
      c.phone.replace(/\D/g, "") === input.phone.replace(/\D/g, ""),
  );
  const card: BillingCard = {
    id: `bill_${Date.now().toString(36)}`,
    method: input.method,
    phone: input.phone,
    deliveryPhone: input.deliveryPhone,
    label: input.label?.trim() || defaultLabel(input.method),
    createdAt: new Date().toISOString(),
  };
  if (existing >= 0) {
    cards[existing] = { ...cards[existing], ...card, id: cards[existing]!.id };
  } else {
    cards.unshift(card);
  }
  write(uid, cards);
  return existing >= 0 ? cards[existing]! : card;
}

export function upsertBillingCardFromCheckout(
  uid: string,
  method: PayMethod,
  phone: string,
  deliveryPhone?: string,
): BillingCard {
  return addBillingCard(uid, { method, phone, deliveryPhone });
}

function defaultLabel(method: PayMethod): string {
  return PAY_METHODS.find((m) => m.id === method)?.label ?? method;
}

export function payMethodMeta(method: PayMethod) {
  return PAY_METHODS.find((m) => m.id === method)!;
}
