import type { Category, PublicListing } from "../types";

/**
 * Client-side browse structure for the one Kariakoo market.
 *
 * Deliberately scoped to the wedge (docs/wedge-strategy.md): two real catalogs
 * — fashion + electronics — split into the sub-groups a Kariakoo shopper
 * actually asks for. No manufacturers / worldwide / RFQ surfaces; structure
 * exists to help someone find nearby, in-stock things faster, not to build a
 * global catalog. Collections match on listing title so the API contract is
 * unchanged.
 */
export type Collection = {
  key: string;
  label: string;
  match: RegExp;
};

export type TopCategory = {
  id: Category;
  label: string;
  blurb: string;
  /** picsum seed used for the category tile when no listing photo is handy. */
  seed: string;
  collections: Collection[];
};

export const CATEGORIES: TopCategory[] = [
  {
    id: "fashion",
    label: "Fashion",
    blurb: "Kitenge, shoes, bags",
    seed: "dnols-cat-fashion",
    collections: [
      { key: "fabric", label: "Kitenge & fabric", match: /kitenge|khanga|leso|ankara|dashiki/i },
      { key: "shoes", label: "Shoes", match: /sneaker|slide|canvas|high-top/i },
      { key: "bags", label: "Bags", match: /tote|backpack|bag/i },
      { key: "accessories", label: "Accessories", match: /belt|cap|hat/i },
    ],
  },
  {
    id: "electronics",
    label: "Electronics",
    blurb: "Phones, audio, power",
    seed: "dnols-cat-electronics",
    collections: [
      { key: "phones", label: "Phones", match: /phone/i },
      { key: "audio", label: "Audio", match: /earbud|tws|speaker|radio/i },
      { key: "power", label: "Power & charging", match: /power|charger|cable|solar/i },
      { key: "computer", label: "Computer", match: /mouse|keyboard|tv|monitor/i },
    ],
  },
];

export function categoryTileImage(cat: TopCategory, listings: PublicListing[]): string {
  const first = listings.find((l) => l.category === cat.id);
  return (
    first?.photoUrl ??
    `https://picsum.photos/seed/${encodeURIComponent(cat.seed)}/640/640`
  );
}

/** Group a category's listings into its named collections (client-side). */
export function groupCollections(
  cat: TopCategory,
  listings: PublicListing[],
): { collection: Collection; items: PublicListing[] }[] {
  const inCat = listings.filter((l) => l.category === cat.id);
  const groups = cat.collections.map((collection) => ({
    collection,
    items: inCat.filter((l) => collection.match.test(l.title)),
  }));
  const matched = new Set(groups.flatMap((g) => g.items.map((i) => i.id)));
  const other = inCat.filter((l) => !matched.has(l.id));
  if (other.length) {
    groups.push({
      collection: { key: "more", label: "More", match: /.^/ },
      items: other,
    });
  }
  return groups.filter((g) => g.items.length > 0);
}
