/** Buyer PWA lives under `/app`. `/` is the marketing landing. */
export const APP = "/app";

export const paths = {
  landing: "/",
  home: APP,
  search: (q?: string) =>
    q ? `${APP}/search?q=${encodeURIComponent(q)}` : `${APP}/search`,
  categories: `${APP}/categories`,
  category: (cat: string) => `${APP}?cat=${encodeURIComponent(cat)}`,
  product: (id: string) => `${APP}/product/${id}`,
  cart: `${APP}/cart`,
  checkout: `${APP}/checkout`,
  orders: `${APP}/orders`,
  you: `${APP}/you`,
  shop: "/shop",
} as const;
