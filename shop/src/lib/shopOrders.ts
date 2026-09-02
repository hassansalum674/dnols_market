import { fetchShopOrders, getOrder } from "../api";
import { loadProfile } from "../storage";
import type { OrderView, SavedOrder } from "../types";

export type OrderRow = { saved: SavedOrder; live: OrderView | null; err?: string };

function asSaved(live: OrderView): SavedOrder {
  return {
    orderId: live.orderId,
    listingIds: live.listingIds,
    handoverPin: live.handoverPin ?? "",
    pickupCode: live.pickupCode ?? "",
    accessToken: live.accessToken ?? "",
    totalTzs: live.totalTzs,
    createdAt: live.createdAt,
  };
}

export async function loadShopOrderRows(
  local: SavedOrder[],
): Promise<OrderRow[]> {
  const shopId = loadProfile()?.shopId;
  const remote = shopId
    ? await fetchShopOrders(shopId).catch(() => [] as OrderView[])
    : [];
  const seen = new Set(remote.map((o) => o.orderId));
  const remoteRows: OrderRow[] = remote.map((live) => ({
    saved: asSaved(live),
    live,
  }));
  const localOnly = await Promise.all(
    local
      .filter((s) => !seen.has(s.orderId))
      .map(async (s) => {
        try {
          return { saved: s, live: await getOrder(s.orderId) };
        } catch (e) {
          return {
            saved: s,
            live: null,
            err: e instanceof Error ? e.message : "unavailable",
          };
        }
      }),
  );
  return [...remoteRows, ...localOnly];
}

export async function countHeldPickups(local: SavedOrder[]): Promise<number> {
  const rows = await loadShopOrderRows(local);
  return rows.filter((r) => r.live?.escrow === "paid_held").length;
}
