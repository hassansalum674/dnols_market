/** Seller area on the same domain — dnols.com/sell */
export const SELLER_PATH = "/sell";

export const SELLER_URL =
  (import.meta.env.VITE_SELLER_URL as string | undefined)?.trim() ||
  SELLER_PATH;
