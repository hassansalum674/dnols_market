import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListingDetail } from "../api/client";
import { ProductGrid, SkeletonGrid } from "../components/ProductCard";
import { getSavedIds } from "../store/persist";
import type { PublicListing } from "../types";

export function YouPage() {
  const [saved, setSaved] = useState<PublicListing[] | null>(null);
  const [name, setName] = useState(
    () => localStorage.getItem("dnols.name") || "",
  );

  useEffect(() => {
    const ids = getSavedIds();
    if (!ids.length) {
      setSaved([]);
      return;
    }
    void Promise.all(ids.map((id) => fetchListingDetail(id))).then((rows) => {
      setSaved(
        rows
          .map((r) => r.detail)
          .filter((d): d is NonNullable<typeof d> => Boolean(d)),
      );
    });
  }, []);

  return (
    <div className="page">
      <div className="you-block">
        <h2>You</h2>
        <p className="muted">Same tabs whether you sign in or browse as a guest.</p>
        <label className="muted" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="search-input"
          value={name}
          placeholder="Optional"
          onChange={(e) => {
            setName(e.target.value);
            localStorage.setItem("dnols.name", e.target.value);
          }}
        />
        <p className="hint">
          <Link to="/shop">Sell on Dnols</Link>
        </p>
        <label className="muted" htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          className="search-input"
          inputMode="tel"
          defaultValue={localStorage.getItem("dnols.phone") || ""}
          placeholder="2557…"
          onChange={(e) => localStorage.setItem("dnols.phone", e.target.value)}
        />
        <p className="muted">Language</p>
        <div className="chips">
          {(["en", "sw"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              className={`chip ${
                (localStorage.getItem("dnols.lang") || "en") === lang ? "on" : ""
              }`}
              onClick={() => {
                localStorage.setItem("dnols.lang", lang);
                window.location.reload();
              }}
            >
              {lang === "en" ? "English" : "Kiswahili"}
            </button>
          ))}
        </div>
      </div>
      <div className="you-block">
        <h2>Saved</h2>
        {saved === null ? (
          <SkeletonGrid n={2} />
        ) : saved.length === 0 ? (
          <p className="muted">Nothing saved. Heart an item from its page.</p>
        ) : (
          <ProductGrid listings={saved} />
        )}
      </div>
    </div>
  );
}
