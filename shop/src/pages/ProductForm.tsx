import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CharCount, RadioGroup, Toggle } from "../components/OnboardingLayout";
import { ProductPhotoUpload } from "../components/ProductPhotoUpload";
import { SellHeader } from "../components/SellHeader";
import { isCdnPhoto } from "../lib/photoPipeline";
import { formatTzsInput, parseTzsPrice } from "../lib/validation";
import { loadProducts, loadProfile, upsertProduct } from "../storage";
import type { ProductCondition, SellerProduct, ShopCategory } from "../types";
import {
  PRODUCT_CONDITIONS,
  SHOP_CATEGORIES,
} from "../types";

const FASHION_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const PHONE_STORAGE = ["64GB", "128GB", "256GB", "512GB"];

function variantPresets(category: ShopCategory): string[] {
  if (category === "fashion_shoes" || category === "fabrics_textiles") {
    return FASHION_SIZES;
  }
  if (category === "phones_accessories") return PHONE_STORAGE;
  return [];
}

function emptyProduct(categories: ShopCategory[]): SellerProduct {
  return {
    id: `prod_${Date.now().toString(36)}`,
    name: "",
    category: categories[0] ?? "fashion_shoes",
    condition: "new",
    photos: [],
    priceTzs: 0,
    negotiable: false,
    stock: 1,
    variants: [],
    description: "",
    skuCode: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = loadProfile();
  const isEdit = Boolean(id);

  const [product, setProduct] = useState<SellerProduct>(() => {
    if (id) {
      const existing = loadProducts().find((p) => p.id === id);
      if (existing) return existing;
    }
    return emptyProduct(profile?.step1.categories ?? []);
  });
  const [priceInput, setPriceInput] = useState(() =>
    product.priceTzs ? formatTzsInput(product.priceTzs) : "",
  );
  const [customVariant, setCustomVariant] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [addingPhoto, setAddingPhoto] = useState(false);

  useEffect(() => {
    if (!profile || profile.status !== "active") {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  function patch(partial: Partial<SellerProduct>) {
    setProduct((prev) => ({ ...prev, ...partial }));
  }

  function addPhoto(cdnUrl: string) {
    if (product.photos.length >= 5) return;
    const next = [...product.photos, cdnUrl];
    patch({
      photos: next,
      coverPhoto: next[0],
    });
    setAddingPhoto(false);
  }

  function removePhoto(index: number) {
    const next = product.photos.filter((_, i) => i !== index);
    patch({ photos: next, coverPhoto: next[0] });
  }

  function toggleVariant(v: string) {
    const next = product.variants.includes(v)
      ? product.variants.filter((x) => x !== v)
      : [...product.variants, v];
    patch({ variants: next });
  }

  function addCustomVariant() {
    const v = customVariant.trim();
    if (!v || product.variants.includes(v)) return;
    patch({ variants: [...product.variants, v] });
    setCustomVariant("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product.name.trim()) {
      setErr("Product name is required.");
      return;
    }
    if (product.photos.length < 1) {
      setErr("At least one cover photo is required.");
      return;
    }
    if (!product.photos.every(isCdnPhoto)) {
      setErr("All photos must be processed via CDN before saving.");
      return;
    }
    const price = parseTzsPrice(priceInput);
    if (price <= 0) {
      setErr("Enter a valid price in TZS.");
      return;
    }
    if (product.stock < 0) {
      setErr("Stock quantity is required.");
      return;
    }
    if (product.description.length > 200) {
      setErr("Description must be 200 characters or less.");
      return;
    }

    upsertProduct({
      ...product,
      name: product.name.trim(),
      priceTzs: price,
      updatedAt: new Date().toISOString(),
    });
    navigate("/dashboard");
  }

  const presets = variantPresets(product.category);
  const isElectronics = product.category === "electronics_gadgets";
  const categories = profile?.step1.categories.length
    ? SHOP_CATEGORIES.filter((c) => profile.step1.categories.includes(c.id))
    : SHOP_CATEGORIES;

  return (
    <div className="sell-landing">
      <SellHeader becomeSellerTo="/dashboard" />
      <main className="page product-form-page">
        <Link to="/dashboard" className="back-link">
          ← Back to dashboard
        </Link>
        <h1>{isEdit ? "Edit product" : "Add product"}</h1>

        <form className="product-form" onSubmit={submit}>
          <div className="product-form-grid">
            <section className="product-form-panel product-form-details">
              <h2 className="product-form-section-title">Product details</h2>

              <label className="lbl" htmlFor="product-name">
                Product name *
              </label>
              <input
                id="product-name"
                className="field"
                value={product.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="e.g. Kitenge dress — blue floral"
                required
              />

              <label className="lbl" htmlFor="product-category">
                Category
              </label>
              <select
                id="product-category"
                className="field"
                value={product.category}
                onChange={(e) =>
                  patch({
                    category: e.target.value as ShopCategory,
                    variants: [],
                  })
                }
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <label className="lbl">Condition *</label>
              <RadioGroup
                name="condition"
                options={PRODUCT_CONDITIONS}
                value={product.condition}
                onChange={(v) => patch({ condition: v as ProductCondition })}
              />

              <label className="lbl" htmlFor="product-description">
                Short description{" "}
                <CharCount current={product.description.length} max={200} />
              </label>
              <textarea
                id="product-description"
                className="field"
                value={product.description}
                onChange={(e) => patch({ description: e.target.value })}
                maxLength={210}
                placeholder="Material, fit, or key selling points buyers should know."
                rows={4}
              />

              <label className="lbl" htmlFor="product-sku">
                Product code (optional, for your records)
              </label>
              <input
                id="product-sku"
                className="field"
                value={product.skuCode}
                onChange={(e) => patch({ skuCode: e.target.value })}
                placeholder="e.g. shelf A3 — buyers never see this"
              />
            </section>

            <section className="product-form-panel product-form-commerce">
              <h2 className="product-form-section-title">Photos & pricing</h2>

              <label className="lbl">
                Photos ({product.photos.length}/5) * — first is cover
              </label>
              <p className="hint product-form-hint">
                Cover: white background, square 1:1, min 800×800. Extra shots help
                buyers trust your listing.
              </p>
              <div className="photo-grid product-form-photos">
                {product.photos.map((url, i) => (
                  <div key={url} className="photo-grid-item">
                    <img src={url} alt="" />
                    {i === 0 && <span className="cover-badge">Cover</span>}
                    <button
                      type="button"
                      className="photo-remove"
                      onClick={() => removePhoto(i)}
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {product.photos.length < 5 && !addingPhoto && (
                  <button
                    type="button"
                    className="photo-grid-add"
                    onClick={() => setAddingPhoto(true)}
                  >
                    + Add photo
                  </button>
                )}
              </div>
              {addingPhoto && product.photos.length < 5 && (
                <ProductPhotoUpload
                  mode={product.photos.length === 0 ? "cover" : "detail"}
                  onConfirm={addPhoto}
                  onCancel={() => setAddingPhoto(false)}
                />
              )}

              <label className="lbl" htmlFor="product-price">
                Price in TZS *
              </label>
              <input
                id="product-price"
                className="field price"
                inputMode="numeric"
                value={priceInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d,]/g, "");
                  const num = parseTzsPrice(raw);
                  setPriceInput(num ? formatTzsInput(num) : "");
                }}
                placeholder="45,000"
                required
              />

              <Toggle
                label="Price negotiable"
                on={product.negotiable}
                onChange={(v) => patch({ negotiable: v })}
              />
              {product.negotiable && (
                <p className="hint product-form-hint">
                  Shows "Price negotiable" badge on listing card.
                </p>
              )}

              <label className="lbl" htmlFor="product-stock">
                Stock quantity *
              </label>
              <input
                id="product-stock"
                className="field"
                type="number"
                inputMode="numeric"
                min={0}
                value={product.stock}
                onChange={(e) =>
                  patch({ stock: Math.max(0, Number(e.target.value) || 0) })
                }
                required
              />
              {product.stock === 0 && (
                <p className="hint product-form-hint">
                  Stock 0 auto-hides listing — it is never deleted.
                </p>
              )}

              {presets.length > 0 && (
                <>
                  <label className="lbl">Sizes / variants (optional)</label>
                  <div className="chip-grid">
                    {presets.map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`chip ${product.variants.includes(v) ? "selected" : ""}`}
                        onClick={() => toggleVariant(v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {isElectronics && (
                <>
                  <label className="lbl">Variant (optional)</label>
                  <div className="variant-row">
                    <input
                      className="field"
                      value={customVariant}
                      onChange={(e) => setCustomVariant(e.target.value)}
                      placeholder='e.g. "Black 55-inch"'
                    />
                    <button
                      type="button"
                      className="btn ghost product-form-inline-btn"
                      onClick={addCustomVariant}
                    >
                      Add
                    </button>
                  </div>
                  {product.variants.length > 0 && (
                    <div className="chip-grid">
                      {product.variants.map((v) => (
                        <button
                          key={v}
                          type="button"
                          className="chip selected"
                          onClick={() => toggleVariant(v)}
                        >
                          {v} ×
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {!isElectronics && presets.length > 0 && (
                <div className="variant-row">
                  <input
                    className="field"
                    value={customVariant}
                    onChange={(e) => setCustomVariant(e.target.value)}
                    placeholder="Custom size e.g. 38, 39, 40"
                  />
                  <button
                    type="button"
                    className="btn ghost product-form-inline-btn"
                    onClick={addCustomVariant}
                  >
                    Add
                  </button>
                </div>
              )}

              {err && <p className="err">{err}</p>}
              <button type="submit" className="btn product-form-submit">
                {isEdit ? "Save product" : "Add product"}
              </button>
            </section>
          </div>
        </form>
      </main>
    </div>
  );
}
