export const DASHBOARD_PATH = "/stall/dashboard";
export const PRODUCTS_PATH = "/stall/stock";
export const PRODUCT_NEW_PATH = "/stall/products/new";

export function productEditPath(id: string): string {
  return `/stall/products/${id}/edit`;
}
