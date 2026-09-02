import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopCatalogNav } from "../components/ShopCatalogNav";
import {
  PRODUCT_NEW_PATH,
  PRODUCTS_PATH,
  productEditPath,
} from "../lib/shopRoutes";
import { loadPayouts, loadProducts, loadProfile } from "../storage";
import { syncAllProductsToApi, syncShopToApi } from "../lib/shopSync";
import { formatTzs } from "./errors";

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  pending_review: "Pending",
  rejected: "Rejected",
  suspended: "Suspended",
};

export function DashboardPage() {
  const navigate = useNavigate();
  const profile = loadProfile();
  const products = loadProducts();
  const payouts = loadPayouts();

  useEffect(() => {
    const current = loadProfile();
    if (!current) {
      navigate("/", { replace: true });
      return;
    }
    if (current.status === "pending_review") {
      navigate("/pending", { replace: true });
    } else if (current.status === "rejected") {
      navigate("/rejected", { replace: true });
    } else if (current.status === "active") {
      void (async () => {
        try {
          await syncShopToApi(current);
          await syncAllProductsToApi(current);
        } catch {
          /* keep local catalog; next visit retries */
        }
      })();
    }
  }, [navigate, profile?.shopId, profile?.status]);

  const activeListings = useMemo(
    () => products.filter((p) => p.stock > 0),
    [products],
  );
  const hiddenListings = useMemo(
    () => products.filter((p) => p.stock === 0),
    [products],
  );
  const previewListings = useMemo(() => products.slice(0, 3), [products]);

  if (!profile || profile.status !== "active") return null;

  const statusClass =
    profile.status === "active"
      ? "active"
      : profile.status === "suspended"
        ? "suspended"
        : "pending";

  return (
    <div className="page stall-page dashboard-page">
      <ShopCatalogNav />

      <header className="stall-page-head">
        <div>
          <h1 className="stall-page-title">{profile.step1.shopName}</h1>
          <p className="muted stall-page-desc">
            Shop performance and payouts. Manage photos, prices, and stock on{" "}
            <Link to={PRODUCTS_PATH} className="text-link">
              Products
            </Link>
            .
          </p>
        </div>
        <span className={`status-badge ${statusClass}`}>
          {STATUS_LABELS[profile.status] ?? profile.status}
        </span>
      </header>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{profile.viewsToday}</span>
          <span className="stat-label">Views today</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{profile.viewsThisWeek}</span>
          <span className="stat-label">Views this week</span>
        </div>
        <Link to={PRODUCTS_PATH} className="stat-card stat-card--link">
          <span className="stat-value">{activeListings.length}</span>
          <span className="stat-label">Active listings</span>
        </Link>
        <div className="stat-card">
          <span className="stat-value">0</span>
          <span className="stat-label">Pending escrow</span>
        </div>
      </div>

      <section className="dashboard-section catalog-bridge">
        <div className="catalog-bridge-head">
          <div>
            <h2>Products</h2>
            <p className="muted catalog-bridge-desc">
              {products.length === 0
                ? "No listings yet — add photos and prices buyers see on dnols.com."
                : `${activeListings.length} live · ${hiddenListings.length} hidden (out of stock)`}
            </p>
          </div>
          <Link to={PRODUCT_NEW_PATH} className="btn stall-page-action">
            Add product
          </Link>
        </div>

        {previewListings.length > 0 && (
          <div className="catalog-preview">
            {previewListings.map((p) => (
              <Link
                key={p.id}
                to={productEditPath(p.id)}
                className="product-row"
              >
                {p.coverPhoto ?? p.photos[0] ? (
                  <img
                    className="product-thumb"
                    src={p.coverPhoto ?? p.photos[0]}
                    alt=""
                  />
                ) : (
                  <div className="product-thumb skel" />
                )}
                <div className="product-info">
                  <strong>{p.name}</strong>
                  <span className="price">{formatTzs(p.priceTzs)}</span>
                  <span className="muted">
                    Stock: {p.stock}
                    {p.stock === 0 && " (hidden)"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link to={PRODUCTS_PATH} className="catalog-bridge-link">
          {products.length === 0
            ? "Go to Products"
            : `Manage all ${products.length} product${products.length === 1 ? "" : "s"} →`}
        </Link>
      </section>

      <section className="dashboard-section">
        <h2>Quick links</h2>
        <div className="quick-links">
          <Link to="/stall" className="quick-link">
            Today&apos;s pickups
          </Link>
          <Link to={PRODUCTS_PATH} className="quick-link">
            All products
          </Link>
          <Link to="/stall/orders" className="quick-link">
            Completed orders
          </Link>
          <Link to="/stall/shop" className="quick-link">
            Shop settings
          </Link>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Payout history</h2>
        {payouts.length === 0 ? (
          <p className="muted">No payouts yet.</p>
        ) : (
          payouts.slice(0, 5).map((p) => (
            <div key={p.id} className="payout-row">
              <span className="price">{formatTzs(p.amountTzs)}</span>
              <span className="muted">
                {new Date(p.at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
