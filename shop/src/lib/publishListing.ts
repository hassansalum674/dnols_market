import { publishListing as publishListingApi } from "../api";
import type { Category, SellerProduct, SellerProfile, ShopCategory } from "../types";

function buyerCategory(category: ShopCategory): Category {
  if (category === "phones_accessories" || category === "electronics_gadgets") {
    return "electronics";
  }
  return "fashion";
}

function shopAddress(profile: SellerProfile): string {
  const parts = [
    profile.step2.street,
    profile.step2.stallNumber ? `Stall ${profile.step2.stallNumber}` : "",
    profile.step2.blockName,
    profile.step2.landmark,
    "Kariakoo, Dar es Salaam",
  ].filter(Boolean);
  return parts.join(", ");
}

/** Push a seller product to the buyer marketplace API. */
export async function publishListing(
  product: SellerProduct,
  profile: SellerProfile,
): Promise<void> {
  const photoUrl = product.coverPhoto ?? product.photos[0];
  if (!photoUrl) throw new Error("missing_photo");

  await publishListingApi({
    id: product.id,
    shopId: profile.shopId,
    shop: {
      shopName: profile.step1.shopName,
      streetAddress: shopAddress(profile),
    },
    title: product.name,
    priceTzs: product.priceTzs,
    category: buyerCategory(product.category),
    photoUrl,
    inStock: product.stock > 0,
    description: product.description || product.name,
    sizes: product.variants.length ? product.variants : undefined,
  });
}
