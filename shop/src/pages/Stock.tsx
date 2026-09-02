import { Link } from "react-router-dom";
import { ShopCatalogNav } from "../components/ShopCatalogNav";
import { DASHBOARD_PATH, PRODUCT_NEW_PATH, productEditPath } from "../lib/shopRoutes";
import { loadProducts, loadProfile } from "../storage";
import { formatTzs } from "./errors";

export function StockPage() {
  const profile = loadProfile();
  const products = loadProducts();
  const active = products.filter((p) => p.stock > 0);
  const hidden = products.filter((p) => p.stock === 0);

  return (
    <div className="page stall-page">
      <ShopCatalogNav />

      <header className="stall-page-head">
        <div>
          <h1 className="stall-page-title">Your products</h1>
          <p className="muted stall-page-desc">
            Add photos, prices, and details buyers see on dnols.com. Active
            listings publish to the marketplace when you save. View shop stats
            on{" "}
            <Link to={DASHBOARD_PATH} className="text-link">
              Overview
            </Link>
            .
          </p>
        </div>
        <Link to={PRODUCT_NEW_PATH} className="btn stall-page-action">
          Add product
        </Link>
      </header>

      {profile && profile.status !== "active" && (
        <p className="notice">
          Your shop is still under review. You can prepare listings now — they go
          live once approved.
        </p>
      )}

      {products.length === 0 ? (
        <div className="center-state">
          <p>No products yet. Add photos and details for your first listing.</p>
          <Link to={PRODUCT_NEW_PATH} className="btn">
            Add product
          </Link>
        </div>
      ) : (
        <>
          <div className="stock-grid stock-grid--products">
            {active.map((p) => (
              <Link
                key={p.id}
                to={productEditPath(p.id)}
                className="stock-row stock-row--product"
              >
                {p.coverPhoto ?? p.photos[0] ? (
                  <img
                    className="stock-thumb"
                    src={p.coverPhoto ?? p.photos[0]}
                    alt=""
                  />
                ) : (
                  <div className="stock-thumb skel" />
                )}
                <div className="stock-row-body">
                  <strong>{p.name}</strong>
                  <div className="price">{formatTzs(p.priceTzs)}</div>
                  <div className="muted">
                    Stock: {p.stock}
                    {p.negotiable && " · Negotiable"}
                    {profile?.status === "active"
                      ? p.liveOnDnols
                        ? " · Live on dnols.com"
                        : " · Not listed on dnols.com yet"
                      : " · Goes live after approval"}
                  </div>
                </div>
                <span className="stock-row-action">Edit</span>
              </Link>
            ))}
          </div>

          {hidden.length > 0 && (
            <section className="stall-subsection">
              <h2 className="stall-subsection-title">Hidden (out of stock)</h2>
              <p className="hint">
                These listings are hidden from buyers until you restock — they are
                not deleted.
              </p>
              <div className="stock-grid stock-grid--products">
                {hidden.map((p) => (
                  <Link
                    key={p.id}
                    to={productEditPath(p.id)}
                    className="stock-row stock-row--product stock-row--dim"
                  >
                    {p.coverPhoto ?? p.photos[0] ? (
                      <img
                        className="stock-thumb"
                        src={p.coverPhoto ?? p.photos[0]}
                        alt=""
                      />
                    ) : (
                      <div className="stock-thumb skel" />
                    )}
                    <div className="stock-row-body">
                      <strong>{p.name}</strong>
                      <div className="price">{formatTzs(p.priceTzs)}</div>
                      <div className="muted">Out of stock</div>
                    </div>
                    <span className="stock-row-action">Edit</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
