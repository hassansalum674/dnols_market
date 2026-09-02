import {
  createListing,
  registerShop,
  updateShopLocation,
} from "../api";
import { loadProfile, saveProfile, upsertProduct } from "../storage";
import type { SellerProduct, SellerProfile, ShopCategory } from "../types";
import { formatStallAddress } from "./stallAddress";

export function toApiCategory(
  category: ShopCategory,
): "fashion" | "electronics" {
  return category === "phones_accessories" ||
    category === "electronics_gadgets"
    ? "electronics"
    : "fashion";
}

function shopPayload(profile: SellerProfile) {
  return {
    id: profile.shopId,
    shopName: profile.step1.shopName.trim(),
    lat: profile.step2.lat,
    lng: profile.step2.lng,
    streetAddress: formatStallAddress(profile.step2),
    stallNumber: profile.step2.stallNumber.trim(),
    floor: profile.step2.floor || undefined,
    landmark: profile.step2.landmark.trim() || undefined,
    locationCapturedAt: profile.step2.capturedAt ?? undefined,
  };
}

export async function syncShopToApi(
  profile: SellerProfile,
): Promise<string | null> {
  if (profile.step2.lat == null || profile.step2.lng == null) return null;
  const res = await registerShop(shopPayload(profile));
  if (res.shopId && res.shopId !== profile.shopId) {
    saveProfile({ ...profile, shopId: res.shopId });
  }
  return res.shopId ?? profile.shopId;
}

export async function syncShopLocationToApi(
  profile: SellerProfile,
): Promise<void> {
  if (profile.step2.lat == null || profile.step2.lng == null) return;
  await updateShopLocation(profile.shopId, shopPayload(profile));
}

export async function syncProductToApi(
  product: SellerProduct,
  profile?: SellerProfile | null,
): Promise<string | null> {
  const shop = profile ?? loadProfile();
  if (!shop || shop.step2.lat == null || shop.step2.lng == null) return null;
  try {
    await syncShopToApi(shop);
  } catch {
    /* listing may still succeed if the shop already exists */
  }
  const res = await createListing({
    id: product.id,
    shopId: shop.shopId,
    title: product.name.trim(),
    priceTzs: product.priceTzs,
    category: toApiCategory(product.category),
    photoUrl: product.coverPhoto ?? product.photos[0] ?? "",
    inStock: product.stock > 0,
    description: product.description.trim(),
    sizes: product.variants.length ? product.variants : undefined,
  });
  if (res.id && res.id !== product.id) {
    upsertProduct({ ...product, id: res.id });
  }
  return res.id ?? product.id;
}
