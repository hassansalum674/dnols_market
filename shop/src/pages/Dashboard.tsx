import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SellHeader } from "../components/SellHeader";
import { loadPayouts, loadProducts, loadProfile } from "../storage";
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
    if (!profile) {
      navigate("/", { replace: true });
      return;
    }
    if (profile.status === "pending_review") {
      navigate("/pending", { replace: true });
    } else if (profile.status === "rejected") {
      navigate("/rejected", { replace: true });
    }
  }, [profile, navigate]);

  const activeListings = useMemo(
    () => products.filter((p) => p.stock > 0),
    [products],
  );
  const hiddenListings = useMemo(
    () => products.filter((p) => p.stock === 0),
    [products],
  );

  if (!profile || profile.status !== "active") return null;

  const statusClass =
    profile.status === "active"
      ? "active"
      : profile.status === "suspended"
        ? "suspended"
        : "pending";

  return (
    <div className="sell-landing">
      <SellHeader becomeSellerTo="/dashboard" />
      <main className="page dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>{profile.step1.shopName}</h1>
            <span className={`status-badge ${statusClass}`}>
              {STATUS_LABELS[profile.status] ?? profile.status}
            </span>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-value">{profile.viewsToday}</span>
            <span className="stat-label">Views today</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{profile.viewsThisWeek}</span>
            <span className="stat-label">Views this week</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{activeListings.length}</span>
            <span className="stat-label">Active listings</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">0</span>
            <span className="stat-label">Pending escrow</span>
          </div>
        </div>

        <Link to="/products/new" className="btn dashboard-add">
          + Add product
        </Link>

        <section className="dashboard-section">
          <h2>Your listings</h2>
          {products.length === 0 && (
            <p className="muted">No products yet. Add your first listing.</p>
          )}
          {products.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.id}/edit`}
              className="product-row"
            >
              {p.photos[0] ? (
                <img className="product-thumb" src={p.photos[0]} alt="" />
              ) : (
                <div className="product-thumb skel" />
              )}
              <div className="product-info">
                <strong>{p.name}</strong>
                <span className="price">{formatTzs(p.priceTzs)}</span>
                <span className="muted">
                  Stock: {p.stock}
                  {p.stock === 0 && " (hidden)"}
                  {p.negotiable && " · Negotiable"}
                </span>
              </div>
            </Link>
          ))}
          {hiddenListings.length > 0 && (
            <p className="hint">
              {hiddenListings.length} listing(s) hidden (stock 0) — not deleted.
            </p>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Quick links</h2>
          <div className="quick-links">
            <Link to="/stall/orders" className="quick-link">
              Completed orders
            </Link>
            <Link to="/stall" className="quick-link">
              Incoming pickups
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
      </main>
    </div>
  );
}
