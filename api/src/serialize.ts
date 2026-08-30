import { haversineMeters, sellerStallHint } from "./geo.js";
import { store } from "./store.js";
import type {
  DirectionsPayload,
  Listing,
  PublicListing,
  PublicListingDetail,
  Shop,
} from "./types.js";

export function distanceToShop(
  shop: Shop,
  buyerLat: number,
  buyerLng: number,
): number {
  return haversineMeters(buyerLat, buyerLng, shop.lat, shop.lng);
}

export function toPublicListing(
  listing: Listing,
  buyerLat: number,
  buyerLng: number,
): PublicListing {
  const shop = store.shop(listing.shopId)!;
  return {
    id: listing.id,
    title: listing.title,
    priceTzs: listing.priceTzs,
    category: listing.category,
    photoUrl: listing.photoUrl,
    distanceMeters: distanceToShop(shop, buyerLat, buyerLng),
    inStock: listing.inStock,
  };
}

export function toPublicDetail(
  listing: Listing,
  buyerLat: number,
  buyerLng: number,
): PublicListingDetail {
  return {
    ...toPublicListing(listing, buyerLat, buyerLng),
    description: listing.description,
    ...(listing.sizes ? { sizes: listing.sizes } : {}),
    ...(listing.brand ? { brand: listing.brand } : {}),
  };
}

export function toDirections(shop: Shop): DirectionsPayload {
  return {
    shopName: shop.shopName,
    lat: shop.lat,
    lng: shop.lng,
    streetAddress: shop.streetAddress,
    mapsHint: sellerStallHint(shop.shopName, shop.streetAddress),
  };
}
