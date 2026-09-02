import { haversineMeters, sellerStallHint } from "./geo.js";
import { store } from "./store.js";
import type {
  DirectionsPayload,
  Listing,
  Order,
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

export function listingTitlesFor(listingIds: string[]): string[] {
  return listingIds.map((id) => store.listing(id)?.title ?? id);
}

export function toSellerOrder(order: Order) {
  return {
    orderId: order.id,
    escrow: order.status,
    listingIds: order.listingIds,
    listingTitles: listingTitlesFor(order.listingIds),
    totalTzs: order.totalTzs,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    handedOverAt: order.handedOverAt,
    pickupCode: order.pickupCode,
    handoverPin: order.handoverPin,
    payPhone: order.payPhone,
    deliveryPhone: order.deliveryPhone,
  };
}

export function toBuyerOrder(order: Order) {
  const paid = store.isPaid(order.status);
  return {
    id: order.id,
    listingIds: order.listingIds,
    status: order.status,
    pickupCode: paid || order.status === "reserved" ? order.pickupCode : undefined,
    handoverPin: paid ? order.handoverPin : undefined,
    totalTzs: order.totalTzs,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    accessToken: paid ? order.accessToken : undefined,
    directions: paid
      ? order.shopIds.map((sid) => toDirections(store.shop(sid)!))
      : undefined,
    payMethod: order.payMethod,
    payPhone: order.payPhone,
    deliveryPhone: order.deliveryPhone,
  };
}
