import { useEffect, useMemo, useState } from "react";
import { getListings } from "../api";
import { ShimmerList } from "../components/Splash";
import { loadSkus, saveSkus } from "../storage";
import type { Category, LocalSku, PublicListing } from "../types";
import { formatTzs } from "./errors";

type Merged = {
  key: string;
  listing?: PublicListing;
  local?: LocalSku;
};

export function StockPage() {
  const [catalog, setCatalog] = useState<PublicListing[] | null>(null);
  const [local, setLocal] = useState<LocalSku[]>(() => loadSkus());
  const [editing, setEditing] = useState<LocalSku | null>(null);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void getListings()
      .then((r) => setCatalog(r.items))
      .catch((e: unknown) => {
        setCatalog([]);
        setErr(e instanceof Error ? e.message : "listings failed");
      });
  }, []);

  const persist = (next: LocalSku[]) => {
    setLocal(next);
    saveSkus(next);
  };

  const rows = useMemo<Merged[]>(() => {
    const byId = new Map(local.map((s) => [s.listingId ?? s.id, s]));
    const fromApi: Merged[] = (catalog ?? []).map((l) => ({
      key: l.id,
      listing: l,
      local: byId.get(l.id),
    }));
    const extras = local
      .filter((s) => !s.listingId)
      .map((s) => ({ key: s.id, local: s }));
    return [...extras, ...fromApi];
  }, [catalog, local]);

  if (catalog === null) {
    return (
      <div className="page">
        <ShimmerList rows={6} />
      </div>
    );
  }

  return (
    <div className="page">
      <p className="muted">
        Catalog from GET /listings. There is no seller SKU API — add/edit lives
        here, with notes stored locally.
      </p>
      {err && <p className="err">{err}</p>}
      <button className="btn" style={{ margin: "12px 0" }} onClick={() => setAdding(true)}>
        Add SKU
      </button>
      {rows.length === 0 && (
        <div className="center-state">
          <p>No SKUs. Start the API on 8787, or add a local item.</p>
        </div>
      )}
      {rows.map((r) => {
        const title = r.local?.title ?? r.listing?.title ?? "";
        const price = r.local?.priceTzs ?? r.listing?.priceTzs ?? 0;
        const stock = r.local?.inStock ?? r.listing?.inStock ?? false;
        const photo = r.local?.photoUrl ?? r.listing?.photoUrl;
        const notes = r.local?.notes;
        return (
          <button
            key={r.key}
            className="stock-row"
            type="button"
            onClick={() =>
              setEditing(
                r.local ??
                  ({
                    id: `overlay_${r.listing!.id}`,
                    listingId: r.listing!.id,
                    title: r.listing!.title,
                    priceTzs: r.listing!.priceTzs,
                    category: r.listing!.category,
                    inStock: r.listing!.inStock,
                    notes: "",
                    photoUrl: r.listing!.photoUrl,
                    createdAt: new Date().toISOString(),
                  } satisfies LocalSku),
              )
            }
          >
            {photo ? (
              <img className="stock-thumb" src={photo} alt="" />
            ) : (
              <div className="stock-thumb skel" />
            )}
            <div>
              <strong>{title}</strong>
              <div className="muted">
                {formatTzs(price)} · {stock ? "in stock" : "out"}
              </div>
              {notes ? <div className="hint">{notes}</div> : null}
            </div>
            <span className="muted">{r.local && !r.listing ? "local" : "edit"}</span>
          </button>
        );
      })}
      {(editing || adding) && (
        <SkuSheet
          initial={
            adding
              ? {
                  id: `sku_${Date.now().toString(36)}`,
                  title: "",
                  priceTzs: 0,
                  category: "fashion",
                  inStock: true,
                  notes: "",
                  createdAt: new Date().toISOString(),
                }
              : editing!
          }
          onClose={() => {
            setEditing(null);
            setAdding(false);
          }}
          onSave={(sku) => {
            const rest = local.filter((s) => {
              if (s.id === sku.id) return false;
              if (sku.listingId && s.listingId === sku.listingId) return false;
              return true;
            });
            persist([sku, ...rest]);
            setEditing(null);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function SkuSheet({
  initial,
  onClose,
  onSave,
}: {
  initial: LocalSku;
  onClose: () => void;
  onSave: (s: LocalSku) => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [price, setPrice] = useState(String(initial.priceTzs || ""));
  const [category, setCategory] = useState<Category>(initial.category);
  const [inStock, setInStock] = useState(initial.inStock);
  const [notes, setNotes] = useState(initial.notes);

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label="Edit SKU">
        <h3>{initial.listingId ? "Edit overlay" : "SKU"}</h3>
        <p className="hint">
          Changes stay on this phone. The mock API does not persist seller
          listings.
        </p>
        <label className="lbl">Title</label>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label className="lbl">Price (TZS)</label>
        <input
          className="field"
          inputMode="numeric"
          value={price}
          onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
        />
        <label className="lbl">Category</label>
        <select
          className="field"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          <option value="fashion">fashion</option>
          <option value="electronics">electronics</option>
        </select>
        <div className="toggle">
          <span>In stock</span>
          <button
            type="button"
            className={inStock ? "btn" : "btn ghost"}
            style={{ width: "auto", minHeight: 36, padding: "0 16px" }}
            onClick={() => setInStock((v) => !v)}
          >
            {inStock ? "Yes" : "No"}
          </button>
        </div>
        <label className="lbl">Notes (local)</label>
        <textarea
          className="field"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Stall note — size, stall number, restock…"
        />
        <div className="btn-row">
          <button className="btn ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            type="button"
            disabled={!title.trim()}
            onClick={() =>
              onSave({
                ...initial,
                title: title.trim(),
                priceTzs: Number(price) || 0,
                category,
                inStock,
                notes,
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
