import type {
  Category,
  DirectionsPayload,
  ListingFilters,
  PublicListing,
  PublicListingDetail,
} from "../types";

const pic = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/640`;

/** Distances from a Kariakoo pin — never expose shop lat/lng here. */
const D: Record<string, number> = {
  shop_mama_aisha: 78,
  shop_swahili_threads: 114,
  shop_kariakoo_kicks: 127,
  shop_night_market_bags: 118,
  shop_tech_alley: 162,
  shop_phone_city: 121,
  shop_volt_accessories: 186,
  shop_radio_house: 194,
};

type Seed = PublicListing & {
  shopId: string;
  description: string;
  sizes?: string[];
  brand?: string;
  createdAt: string;
  trendingScore: number;
  streetAddress: string;
  shopName: string;
  lat: number;
  lng: number;
};

const SEED: Seed[] = [
  {
    id: "lst_kitenge_maxi_01",
    shopId: "shop_mama_aisha",
    title: "Kitenge maxi dress — indigo",
    priceTzs: 45000,
    category: "fashion",
    photoUrl: pic("dnols-kitenge-maxi"),
    distanceMeters: D.shop_mama_aisha,
    inStock: true,
    description: "Hand-cut kitenge maxi, wrap waist. Pickup only after payment.",
    sizes: ["S", "M", "L", "XL"],
    createdAt: "2026-08-12T09:00:00.000Z",
    trendingScore: 92,
    shopName: "Mama Aisha Kitenge",
    streetAddress: "Congo St, Kariakoo",
    lat: -6.82195,
    lng: 39.27442,
  },
  {
    id: "lst_khanga_set_02",
    shopId: "shop_mama_aisha",
    title: "Khanga pair — coastal print",
    priceTzs: 18000,
    category: "fashion",
    photoUrl: pic("dnols-khanga-pair"),
    distanceMeters: D.shop_mama_aisha,
    inStock: true,
    description: "Two-piece khanga, cotton. Popular for gifts.",
    sizes: ["one-size"],
    createdAt: "2026-08-18T11:20:00.000Z",
    trendingScore: 88,
    shopName: "Mama Aisha Kitenge",
    streetAddress: "Congo St, Kariakoo",
    lat: -6.82195,
    lng: 39.27442,
  },
  {
    id: "lst_dashiki_03",
    shopId: "shop_swahili_threads",
    title: "Men's dashiki shirt — gold",
    priceTzs: 32000,
    category: "fashion",
    photoUrl: pic("dnols-dashiki-gold"),
    distanceMeters: D.shop_swahili_threads,
    inStock: true,
    description: "Embroidered collar dashiki. Street pickup after escrow.",
    sizes: ["M", "L", "XL", "XXL"],
    createdAt: "2026-08-08T14:00:00.000Z",
    trendingScore: 71,
    shopName: "Swahili Threads",
    streetAddress: "Msimbazi St, Kariakoo",
    lat: -6.82312,
    lng: 39.27315,
  },
  {
    id: "lst_ankara_blazer_04",
    shopId: "shop_swahili_threads",
    title: "Ankara blazer — unisex",
    priceTzs: 78000,
    category: "fashion",
    photoUrl: pic("dnols-ankara-blazer"),
    distanceMeters: D.shop_swahili_threads,
    inStock: true,
    description: "Tailored ankara blazer, single button.",
    sizes: ["S", "M", "L"],
    createdAt: "2026-08-21T08:30:00.000Z",
    trendingScore: 64,
    shopName: "Swahili Threads",
    streetAddress: "Msimbazi St, Kariakoo",
    lat: -6.82312,
    lng: 39.27315,
  },
  {
    id: "lst_leso_headwrap_05",
    shopId: "shop_mama_aisha",
    title: "Leso headwrap bundle (3)",
    priceTzs: 12000,
    category: "fashion",
    photoUrl: pic("dnols-leso-wrap"),
    distanceMeters: D.shop_mama_aisha,
    inStock: false,
    description: "Restock expected next market day.",
    sizes: ["one-size"],
    createdAt: "2026-07-30T10:00:00.000Z",
    trendingScore: 40,
    shopName: "Mama Aisha Kitenge",
    streetAddress: "Congo St, Kariakoo",
    lat: -6.82195,
    lng: 39.27442,
  },
  {
    id: "lst_sneakers_06",
    shopId: "shop_kariakoo_kicks",
    title: "Low-top sneakers — white",
    priceTzs: 55000,
    category: "fashion",
    photoUrl: pic("dnols-sneakers-white"),
    distanceMeters: D.shop_kariakoo_kicks,
    inStock: true,
    description: "Everyday low-tops. Confirm size at handover.",
    sizes: ["39", "40", "41", "42", "43", "44"],
    createdAt: "2026-08-22T16:00:00.000Z",
    trendingScore: 85,
    shopName: "Kariakoo Kicks",
    streetAddress: "Uhuru St, Kariakoo",
    lat: -6.82268,
    lng: 39.27501,
  },
  {
    id: "lst_slides_07",
    shopId: "shop_kariakoo_kicks",
    title: "Rubber slides — black",
    priceTzs: 15000,
    category: "fashion",
    photoUrl: pic("dnols-slides-black"),
    distanceMeters: D.shop_kariakoo_kicks,
    inStock: true,
    description: "Market-day slides, cushion sole.",
    sizes: ["40", "41", "42", "43", "44"],
    createdAt: "2026-08-15T12:00:00.000Z",
    trendingScore: 55,
    shopName: "Kariakoo Kicks",
    streetAddress: "Uhuru St, Kariakoo",
    lat: -6.82268,
    lng: 39.27501,
  },
  {
    id: "lst_canvas_08",
    shopId: "shop_kariakoo_kicks",
    title: "Canvas high-tops — navy",
    priceTzs: 42000,
    category: "fashion",
    photoUrl: pic("dnols-canvas-navy"),
    distanceMeters: D.shop_kariakoo_kicks,
    inStock: true,
    description: "Lace-up canvas, gum sole.",
    sizes: ["38", "39", "40", "41", "42"],
    createdAt: "2026-08-05T09:45:00.000Z",
    trendingScore: 48,
    shopName: "Kariakoo Kicks",
    streetAddress: "Uhuru St, Kariakoo",
    lat: -6.82268,
    lng: 39.27501,
  },
  {
    id: "lst_tote_09",
    shopId: "shop_night_market_bags",
    title: "Kitenge tote bag",
    priceTzs: 22000,
    category: "fashion",
    photoUrl: pic("dnols-kitenge-tote"),
    distanceMeters: D.shop_night_market_bags,
    inStock: true,
    description: "Lined tote, inner zip pocket.",
    sizes: ["one-size"],
    createdAt: "2026-08-19T13:10:00.000Z",
    trendingScore: 77,
    shopName: "Night Market Bags",
    streetAddress: "Nyamwezi St, Kariakoo",
    lat: -6.8214,
    lng: 39.27355,
  },
  {
    id: "lst_backpack_10",
    shopId: "shop_night_market_bags",
    title: "City backpack — charcoal",
    priceTzs: 38000,
    category: "fashion",
    photoUrl: pic("dnols-backpack-charcoal"),
    distanceMeters: D.shop_night_market_bags,
    inStock: true,
    description: 'Laptop sleeve up to 15".',
    sizes: ["one-size"],
    createdAt: "2026-08-11T07:00:00.000Z",
    trendingScore: 60,
    shopName: "Night Market Bags",
    streetAddress: "Nyamwezi St, Kariakoo",
    lat: -6.8214,
    lng: 39.27355,
  },
  {
    id: "lst_belt_11",
    shopId: "shop_swahili_threads",
    title: "Leather belt — tan",
    priceTzs: 19000,
    category: "fashion",
    photoUrl: pic("dnols-belt-tan"),
    distanceMeters: D.shop_swahili_threads,
    inStock: true,
    description: "Local tannery belt, brass buckle.",
    sizes: ["85cm", "90cm", "95cm", "100cm"],
    createdAt: "2026-08-01T15:00:00.000Z",
    trendingScore: 33,
    shopName: "Swahili Threads",
    streetAddress: "Msimbazi St, Kariakoo",
    lat: -6.82312,
    lng: 39.27315,
  },
  {
    id: "lst_cap_12",
    shopId: "shop_night_market_bags",
    title: "DSM baseball cap",
    priceTzs: 14000,
    category: "fashion",
    photoUrl: pic("dnols-cap-dsm"),
    distanceMeters: D.shop_night_market_bags,
    inStock: true,
    description: "Embroidered Dar es Salaam cap.",
    sizes: ["adjustable"],
    createdAt: "2026-08-24T10:20:00.000Z",
    trendingScore: 81,
    shopName: "Night Market Bags",
    streetAddress: "Nyamwezi St, Kariakoo",
    lat: -6.8214,
    lng: 39.27355,
  },
  {
    id: "lst_phone_a15_13",
    shopId: "shop_phone_city",
    title: "Refurbished Android A15",
    priceTzs: 185000,
    category: "electronics",
    photoUrl: pic("dnols-phone-a15"),
    distanceMeters: D.shop_phone_city,
    inStock: true,
    description: "90-day stall warranty. Unlock PIN at handover.",
    brand: "Generic A-series",
    createdAt: "2026-08-20T09:00:00.000Z",
    trendingScore: 95,
    shopName: "Phone City Kariakoo",
    streetAddress: "Mchikichi St, Kariakoo",
    lat: -6.82205,
    lng: 39.27288,
  },
  {
    id: "lst_feature_14",
    shopId: "shop_phone_city",
    title: "Dual-SIM feature phone",
    priceTzs: 35000,
    category: "electronics",
    photoUrl: pic("dnols-feature-phone"),
    distanceMeters: D.shop_phone_city,
    inStock: true,
    description: "Long battery, torch, FM radio.",
    brand: "Tecno stub",
    createdAt: "2026-08-14T11:00:00.000Z",
    trendingScore: 70,
    shopName: "Phone City Kariakoo",
    streetAddress: "Mchikichi St, Kariakoo",
    lat: -6.82205,
    lng: 39.27288,
  },
  {
    id: "lst_earbuds_15",
    shopId: "shop_volt_accessories",
    title: "TWS earbuds — black",
    priceTzs: 28000,
    category: "electronics",
    photoUrl: pic("dnols-tws-black"),
    distanceMeters: D.shop_volt_accessories,
    inStock: true,
    description: "Charging case, touch controls.",
    brand: "Volt Audio",
    createdAt: "2026-08-23T18:00:00.000Z",
    trendingScore: 90,
    shopName: "Volt Accessories",
    streetAddress: "Aggrey St, Kariakoo",
    lat: -6.82401,
    lng: 39.2734,
  },
  {
    id: "lst_powerbank_16",
    shopId: "shop_volt_accessories",
    title: "Power bank 20 000 mAh",
    priceTzs: 42000,
    category: "electronics",
    photoUrl: pic("dnols-powerbank-20k"),
    distanceMeters: D.shop_volt_accessories,
    inStock: true,
    description: "Dual USB-A + USB-C in.",
    brand: "Volt Charge",
    createdAt: "2026-08-10T08:00:00.000Z",
    trendingScore: 74,
    shopName: "Volt Accessories",
    streetAddress: "Aggrey St, Kariakoo",
    lat: -6.82401,
    lng: 39.2734,
  },
  {
    id: "lst_charger_17",
    shopId: "shop_volt_accessories",
    title: "33W USB-C charger",
    priceTzs: 18000,
    category: "electronics",
    photoUrl: pic("dnols-charger-33w"),
    distanceMeters: D.shop_volt_accessories,
    inStock: false,
    description: "Out of stock — cable still available.",
    brand: "Volt Charge",
    createdAt: "2026-08-03T12:30:00.000Z",
    trendingScore: 22,
    shopName: "Volt Accessories",
    streetAddress: "Aggrey St, Kariakoo",
    lat: -6.82401,
    lng: 39.2734,
  },
  {
    id: "lst_cable_18",
    shopId: "shop_tech_alley",
    title: "USB-C braided cable 2m",
    priceTzs: 8000,
    category: "electronics",
    photoUrl: pic("dnols-cable-usbc"),
    distanceMeters: D.shop_tech_alley,
    inStock: true,
    description: "Reinforced ends, 60W rated.",
    brand: "Alley Cables",
    createdAt: "2026-08-25T07:40:00.000Z",
    trendingScore: 68,
    shopName: "Tech Alley DSM",
    streetAddress: "Livingstone St, Kariakoo",
    lat: -6.82355,
    lng: 39.2748,
  },
  {
    id: "lst_speaker_19",
    shopId: "shop_radio_house",
    title: "Bluetooth speaker mini",
    priceTzs: 48000,
    category: "electronics",
    photoUrl: pic("dnols-bt-speaker"),
    distanceMeters: D.shop_radio_house,
    inStock: true,
    description: "IPX4, 8h play. Demo in stall after pay.",
    brand: "Radio House",
    createdAt: "2026-08-17T16:15:00.000Z",
    trendingScore: 79,
    shopName: "Radio House TZ",
    streetAddress: "Swahili St, Kariakoo",
    lat: -6.82172,
    lng: 39.27555,
  },
  {
    id: "lst_radio_20",
    shopId: "shop_radio_house",
    title: "AM/FM portable radio",
    priceTzs: 26000,
    category: "electronics",
    photoUrl: pic("dnols-amfm-radio"),
    distanceMeters: D.shop_radio_house,
    inStock: true,
    description: "USB charge + dry cells.",
    brand: "Radio House",
    createdAt: "2026-08-06T10:00:00.000Z",
    trendingScore: 51,
    shopName: "Radio House TZ",
    streetAddress: "Swahili St, Kariakoo",
    lat: -6.82172,
    lng: 39.27555,
  },
  {
    id: "lst_tv_21",
    shopId: "shop_tech_alley",
    title: '32" LED TV (open box)',
    priceTzs: 320000,
    category: "electronics",
    photoUrl: pic("dnols-led-32"),
    distanceMeters: D.shop_tech_alley,
    inStock: true,
    description: "HDMI + USB. Buyer inspects at stall.",
    brand: "Alley Vision",
    createdAt: "2026-08-09T13:00:00.000Z",
    trendingScore: 58,
    shopName: "Tech Alley DSM",
    streetAddress: "Livingstone St, Kariakoo",
    lat: -6.82355,
    lng: 39.2748,
  },
  {
    id: "lst_mouse_22",
    shopId: "shop_tech_alley",
    title: "Wireless mouse",
    priceTzs: 16000,
    category: "electronics",
    photoUrl: pic("dnols-mouse-wl"),
    distanceMeters: D.shop_tech_alley,
    inStock: true,
    description: "2.4 GHz dongle included.",
    brand: "Alley Peripherals",
    createdAt: "2026-08-16T09:20:00.000Z",
    trendingScore: 44,
    shopName: "Tech Alley DSM",
    streetAddress: "Livingstone St, Kariakoo",
    lat: -6.82355,
    lng: 39.2748,
  },
  {
    id: "lst_keyboard_23",
    shopId: "shop_tech_alley",
    title: "Mini Bluetooth keyboard",
    priceTzs: 24000,
    category: "electronics",
    photoUrl: pic("dnols-kb-mini"),
    distanceMeters: D.shop_tech_alley,
    inStock: true,
    description: "Pairs with phones and tablets.",
    brand: "Alley Peripherals",
    createdAt: "2026-08-13T17:00:00.000Z",
    trendingScore: 39,
    shopName: "Tech Alley DSM",
    streetAddress: "Livingstone St, Kariakoo",
    lat: -6.82355,
    lng: 39.2748,
  },
  {
    id: "lst_solar_24",
    shopId: "shop_volt_accessories",
    title: "Folding solar charger 21W",
    priceTzs: 65000,
    category: "electronics",
    photoUrl: pic("dnols-solar-21w"),
    distanceMeters: D.shop_volt_accessories,
    inStock: true,
    description: "USB-A out, travel pouch.",
    brand: "Volt Charge",
    createdAt: "2026-08-26T08:00:00.000Z",
    trendingScore: 83,
    shopName: "Volt Accessories",
    streetAddress: "Aggrey St, Kariakoo",
    lat: -6.82401,
    lng: 39.2734,
  },
];

function toPublic(s: Seed): PublicListing {
  return {
    id: s.id,
    title: s.title,
    priceTzs: s.priceTzs,
    category: s.category,
    photoUrl: s.photoUrl,
    distanceMeters: s.distanceMeters,
    inStock: s.inStock,
  };
}

export function filterListings(filters: ListingFilters): PublicListing[] {
  let rows = SEED.filter((s) => {
    if (filters.category && s.category !== filters.category) return false;
    if (filters.maxDistance && s.distanceMeters > Number(filters.maxDistance))
      return false;
    if (filters.inStock && !s.inStock) return false;
    if (filters.minPrice !== "" && filters.minPrice != null && s.priceTzs < Number(filters.minPrice))
      return false;
    if (filters.maxPrice !== "" && filters.maxPrice != null && s.priceTzs > Number(filters.maxPrice))
      return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (!s.title.toLowerCase().includes(q) && !s.category.includes(q))
        return false;
    }
    return true;
  });

  const sort = filters.sort ?? "nearest";
  rows = [...rows].sort((a, b) => {
    if (sort === "price_asc") return a.priceTzs - b.priceTzs;
    if (sort === "price_desc") return b.priceTzs - a.priceTzs;
    if (sort === "newest")
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return a.distanceMeters - b.distanceMeters;
  });

  return rows.map(toPublic);
}

export function mockSuggest(q: string): PublicListing[] {
  if (!q.trim()) return [];
  return filterListings({ q, sort: "nearest" }).slice(0, 6);
}

export function mockDetail(
  id: string,
  paid: boolean,
): PublicListingDetail | null {
  const s = SEED.find((x) => x.id === id);
  if (!s) return null;
  const base: PublicListingDetail = {
    ...toPublic(s),
    description: s.description,
    sizes: s.sizes,
    brand: s.brand,
    paid,
  };
  if (paid) {
    base.directions = {
      shopName: s.shopName,
      lat: s.lat,
      lng: s.lng,
      streetAddress: s.streetAddress,
      mapsHint: `${s.shopName} · ${s.streetAddress}.`,
    };
  }
  return base;
}

export function mockTrending(): PublicListing[] {
  return [...SEED]
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 6)
    .map(toPublic);
}

export function mockByIds(ids: string[]): PublicListing[] {
  return ids
    .map((id) => SEED.find((s) => s.id === id))
    .filter(Boolean)
    .map((s) => toPublic(s!));
}

/** Shop pickup coords unlocked after pay — one entry per stall. */
export function mockDirectionsForListingIds(ids: string[]): DirectionsPayload[] {
  const seen = new Set<string>();
  const out: DirectionsPayload[] = [];
  for (const id of ids) {
    const s = SEED.find((x) => x.id === id);
    if (!s || seen.has(s.shopId)) continue;
    seen.add(s.shopId);
    out.push({
      shopName: s.shopName,
      lat: s.lat,
      lng: s.lng,
      streetAddress: s.streetAddress,
      mapsHint: `${s.shopName} · ${s.streetAddress}.`,
    });
  }
  return out;
}

export const MOCK_CATEGORIES: Category[] = ["fashion", "electronics"];
