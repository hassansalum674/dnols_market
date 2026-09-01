import type { OrderView } from "../types";

const ESCROW_LABEL: Record<OrderView["escrow"], string> = {
  reserved: "Reserved",
  paid_held: "Paid · ready for pickup",
  handed_over: "Completed",
  rejected_refund: "Refunded",
};

export function escrowLabel(status?: OrderView["escrow"] | string | null): string {
  if (!status) return "Unknown";
  return ESCROW_LABEL[status as OrderView["escrow"]] ?? "Processing";
}

export function shortOrderRef(orderId: string): string {
  if (orderId.length <= 10) return orderId;
  return `#${orderId.slice(-6).toUpperCase()}`;
}
