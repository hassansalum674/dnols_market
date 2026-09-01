import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchListings } from "../api/client";
import { FilterSheet } from "../components/FilterSheet";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { StatusScreen } from "../components/EmptyState";
import { PLACE_LABEL } from "../lib/format";
import { SELLER_URL } from "../lib/urls";
import { useI18n } from "../store/i18n";
import type { Category, ListingFilters, PublicListing, Sort } from "../types";

function fromParams(sp: URLSearchParams): ListingFilters {
  const cat = sp.get("cat") || "";
  const max = sp.get("max") || "";
  const sort = (sp.get("sort") as Sort) || "nearest";
  const inStock = sp.get("stock") === "1";
  const minPrice = sp.get("min") || "";
  const maxPrice = sp.get("maxp") || "";
  return {
    category: (cat as Category) || "",
    maxDistance: max ? Number(max) : "",
    sort,
    inStock,
    minPrice: minPrice ? Number(minPrice) : "",
    maxPrice: maxPrice ? Number(maxPrice) : "",
  };
}

function toParams(f: ListingFilters, sp: URLSearchParams) {
  const next = new URLSearchParams(sp);
  if (f.category) next.set("cat", f.category);
  else next.delete("cat");
  if (f.maxDistance) next.set("max", String(f.maxDistance));
  else next.delete("max");
  if (f.sort && f.sort !== "nearest") next.set("sort", f.sort);
  else next.delete("sort");
  if (f.inStock) next.set("stock", "1");
  else next.delete("stock");
  if (f.minPrice !== "" && f.minPrice != null) next.set("min", String(f.minPrice));
  else next.delete("min");
  if (f.maxPrice !== "" && f.maxPrice != null) next.set("maxp", String(f.maxPrice));
  else next.delete("maxp");
  return next;
}

const SIDEBAR_CATS: { id: Category | ""; labelKey: "allProducts" | "fashion" | "electronics" }[] = [
  { id: "", labelKey: "allProducts" },
  { id: "fashion", labelKey: "fashion" },
  { id: "electronics", labelKey: "electronics" },
];

export function HomePage() {
  const [sp, setSp] = useSearchParams();
  const { t } = useI18n();
  const filters = useMemo(() => fromParams(sp), [sp]);
  const [draft, setDraft] = useState(filters);
  const [open, setOpen] = useState(false);
  const [listings, setListings] = useState<PublicListing[] | null>(null);
  const [source, setSource] = useState<"api" | "mock">("mock");
  const [err, setErr] = useState<"offline" | "500" | null>(null);

  useEffect(() => setDraft(filters), [filters]);

  useEffect(() => {
    let live = true;
    setListings(null);
    setErr(null);
    if (!navigator.onLine) {
      setErr("offline");
    }
    void fetchListings(filters).then(({ listings: rows, source: src }) => {
      if (!live) return;
      setListings(rows);
      setSource(src);
    });
    return () => {
      live = false;
    };
  }, [filters]);

  const setFilters = (next: ListingFilters) => {
    setSp(toParams(next, sp), { replace: true });
  };

  const setCategory = (cat: Category | "") => {
    setFilters({ ...filters, category: cat });
  };

  if (err === "offline") {
    return (
      <StatusScreen
        line={t.offlineHome}
        action={t.retry}
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="page marketplace-page">
      <section className="home-hero">
        <div className="home-hero-text">
          <h1>{t.welcome}</h1>
          <p>{t.welcomeBody(PLACE_LABEL())}</p>
        </div>
        <a
          className="btn home-seller-cta"
          href={SELLER_URL}
          rel="noopener noreferrer"
        >
          {t.becomeSeller}
        </a>
      </section>

      <div className="marketplace-layout">
        <aside className="market-sidebar" aria-label={t.categories}>
          <h2 className="sidebar-title">{t.categories}</h2>
          <ul className="sidebar-list">
            {SIDEBAR_CATS.map((c) => (
              <li key={c.id || "all"}>
                <button
                  type="button"
                  className={filters.category === c.id ? "active" : ""}
                  onClick={() => setCategory(c.id)}
                >
                  {t[c.labelKey]}
                </button>
              </li>
            ))}
          </ul>
          <h2 className="sidebar-title">{t.walkDistance}</h2>
          <ul className="sidebar-list">
            {[200, 500, 1000].map((m) => (
              <li key={m}>
                <button
                  type="button"
                  className={filters.maxDistance === m ? "active" : ""}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      maxDistance: filters.maxDistance === m ? "" : m,
                    })
                  }
                >
                  {m === 1000 ? t.within1km : t.withinM(m)}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className={filters.inStock ? "active" : ""}
                onClick={() => setFilters({ ...filters, inStock: !filters.inStock })}
              >
                {t.inStockOnly}
              </button>
            </li>
          </ul>
          <button type="button" className="sidebar-filters" onClick={() => setOpen(true)}>
            {t.moreFilters}
          </button>
        </aside>

        <div className="market-main">
          <div className="filter-groups filter-groups-mobile">
            <div className="filter-group">
              <span className="filter-label">{t.categories}</span>
              <div className="chips">
                {(["fashion", "electronics"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${filters.category === c ? "on" : ""}`}
                    onClick={() => setCategory(filters.category === c ? "" : c)}
                  >
                    {c === "fashion" ? t.fashion : t.electronics}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <span className="filter-label">{t.nearby}</span>
              <div className="chips">
                {[200, 500, 1000].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`chip ${filters.maxDistance === m ? "on" : ""}`}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        maxDistance: filters.maxDistance === m ? "" : m,
                      })
                    }
                  >
                    {m === 1000 ? "1km" : `${m}m`}
                  </button>
                ))}
                <button
                  type="button"
                  className={`chip ${filters.inStock ? "on" : ""}`}
                  onClick={() => setFilters({ ...filters, inStock: !filters.inStock })}
                >
                  {t.inStock}
                </button>
                <button type="button" className="chip chip-action" onClick={() => setOpen(true)}>
                  {t.allFilters}
                </button>
              </div>
            </div>
          </div>

          {source === "mock" && listings && (
            <p className="hint">{t.sampleListings}</p>
          )}
          {listings === null ? (
            <SkeletonGrid />
          ) : listings.length === 0 ? (
            <p className="muted">{t.nothingInRange}</p>
          ) : (
            <ProductGrid listings={listings} />
          )}
        </div>
      </div>

      <FilterSheet
        open={open}
        filters={draft}
        count={listings?.length ?? 0}
        onClose={() => setOpen(false)}
        onChange={setDraft}
        onApply={() => setFilters(draft)}
      />
    </div>
  );
}
