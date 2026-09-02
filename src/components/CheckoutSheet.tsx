import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { payOrder } from "../api/client";
import { SellerStallPreview } from "./SellerStallPreview";
import { IconTrash } from "./IconTrash";
import { BillingCardTile } from "./BillingCardTile";
import { CheckoutSignInGate } from "./CheckoutSignInGate";
import { formatTsh } from "../lib/format";
import { isValidPickupCode } from "../lib/pickupCode";
import {
  loadBillingCards,
  upsertBillingCardFromCheckout,
  type BillingCard,
} from "../lib/billingCards";
import {
  loadLastAddress,
  loadLastDeliveryPhone,
  loadLastFulfillment,
  loadLastPayMethod,
  loadLastPayPhone,
  PAY_METHODS,
  saveCheckoutPrefs,
  type Fulfillment,
} from "../lib/checkout";
import {
  formatTzPhoneDisplay,
  isValidTzPhone,
  normalizeTzPhone,
} from "../lib/phone";
import { useAuth } from "../store/auth";
import { useCart } from "../store/cart";
import { useCheckoutSheet } from "../store/checkoutSheet";
import { markPaid, saveLocalOrder } from "../store/persist";
import { loadProfile, saveProfile } from "../lib/profile";
import { UserAvatar } from "./UserAvatar";
import { userDisplayName } from "../lib/userDisplay";

export function CheckoutSheet() {
  const {
    step,
    method,
    order,
    openPay,
    goBack,
    close,
    setStep,
    setMethod,
    setOrder,
  } = useCheckoutSheet();
  const { items, totalTzs, remove, setQty, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const nav = useNavigate();

  const [phone, setPhone] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [useCustomDelivery, setUseCustomDelivery] = useState(false);
  const [fulfillment, setFulfillment] = useState<Fulfillment | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [billingCards, setBillingCards] = useState<BillingCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const prefsHydrated = useRef(false);

  useEffect(() => {
    if (step === "closed") {
      prefsHydrated.current = false;
      return;
    }
    if (prefsHydrated.current) return;
    prefsHydrated.current = true;
    setMethod(loadLastPayMethod());
    const savedPay = loadLastPayPhone();
    const savedDelivery = loadLastDeliveryPhone();
    const profile = user?.uid ? loadProfile(user.uid) : {};
    const payDefault = profile.phone || savedPay;
    const deliveryDefault = profile.deliveryPhone || savedDelivery || payDefault;
    setPhone(payDefault);
    setDeliveryPhone(deliveryDefault);
    setFulfillment(profile.fulfillment || loadLastFulfillment());
    setDeliveryAddress(profile.deliveryAddress || loadLastAddress());
    setUseCustomDelivery(
      Boolean(
        deliveryDefault &&
          payDefault &&
          deliveryDefault.replace(/\D/g, "") !== payDefault.replace(/\D/g, ""),
      ),
    );
    setSelectedCardId(null);
    setErr(null);
  }, [step, setMethod, user?.uid]);

  useEffect(() => {
    if (!user?.uid || step !== "pay") {
      setBillingCards([]);
      return;
    }
    setBillingCards(loadBillingCards(user.uid));
  }, [user?.uid, step]);

  useEffect(() => {
    if (step !== "closed") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [step]);

  useEffect(() => {
    if (step === "pay" || step === "basket" || step === "success") {
      const el = document.querySelector(".checkout-sheet");
      if (el) el.scrollTop = 0;
    }
  }, [step]);

  if (step === "closed") return null;

  const selectedMethod = PAY_METHODS.find((m) => m.id === method)!;
  const displayPhone = formatTzPhoneDisplay(phone);
  const displayDeliveryPhone = formatTzPhoneDisplay(
    useCustomDelivery ? deliveryPhone : phone,
  );
  const savedPhone = loadLastPayPhone();
  const contactEmail = user?.email ?? null;
  const primaryDirection = order?.directions?.[0];
  const needsSignIn =
    !authLoading &&
    !user &&
    (step === "basket" || step === "pay") &&
    items.length > 0;

  const applyBillingCard = (card: BillingCard) => {
    setSelectedCardId(card.id);
    setMethod(card.method);
    setPhone(card.phone);
    const delivery = card.deliveryPhone || card.phone;
    setDeliveryPhone(delivery);
    setUseCustomDelivery(
      delivery.replace(/\D/g, "") !== card.phone.replace(/\D/g, ""),
    );
    setErr(null);
  };

  const startPayment = async () => {
    setErr(null);
    if (!user?.uid) {
      setErr("Sign in to place an order.");
      return;
    }
    if (!isValidTzPhone(phone)) {
      setErr("Enter a valid Tanzania mobile money number (+255 7XX XXX XXX).");
      return;
    }
    if (!fulfillment) {
      setErr("Choose self pickup or delivery to your location.");
      return;
    }
    const normalizedPay = normalizeTzPhone(phone);
    const deliveryRaw = useCustomDelivery ? deliveryPhone : phone;
    if (!isValidTzPhone(deliveryRaw)) {
      setErr(
        fulfillment === "pickup"
          ? "Enter a valid contact number (+255 7XX XXX XXX)."
          : "Enter a valid delivery contact number (+255 7XX XXX XXX).",
      );
      return;
    }
    const address = deliveryAddress.trim();
    if (fulfillment === "delivery" && address.length < 4) {
      setErr("Enter the area or street where we should deliver.");
      return;
    }
    const normalizedDelivery = normalizeTzPhone(deliveryRaw);
    setStep("waiting");
    const listingIds = [...new Set(items.map((i) => i.listing.id))];
    try {
      await new Promise((r) => setTimeout(r, 2200));
      const paid = await payOrder({
        listingIds,
        payMethod: method,
        phone: normalizedPay,
        deliveryPhone: normalizedDelivery,
        fulfillment,
        deliveryAddress: fulfillment === "delivery" ? address : undefined,
      });
      saveCheckoutPrefs(
        normalizedPay,
        method,
        normalizedDelivery,
        fulfillment,
        fulfillment === "delivery" ? address : undefined,
      );
      saveProfile(user.uid, {
        phone: normalizedPay,
        deliveryPhone: normalizedDelivery,
        fulfillment,
        deliveryAddress: fulfillment === "delivery" ? address : undefined,
      });
      upsertBillingCardFromCheckout(
        user.uid,
        method,
        normalizedPay,
        normalizedDelivery,
      );
      setBillingCards(loadBillingCards(user.uid));
      markPaid(paid.listingIds, paid.accessToken || "paid");
      saveLocalOrder(paid);
      clear();
      setOrder(paid);
      setStep("success");
    } catch (e) {
      setStep("pay");
      setErr(e instanceof Error ? e.message : "Payment failed. Try again.");
    }
  };

  const handleClose = () => {
    close();
    if (window.location.pathname === "/cart" || window.location.pathname === "/checkout") {
      nav("/", { replace: true });
    }
  };

  return (
    <>
      <div
        className="sheet-backdrop checkout-sheet-backdrop"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="sheet checkout-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={
          step === "basket"
            ? "Your basket"
            : step === "pay"
              ? "Checkout"
              : step === "waiting"
                ? "Confirm payment"
                : "Order confirmed"
        }
      >
        {needsSignIn && (
          <>
            <div className="sheet-head">
              <h3>Checkout</h3>
              <button
                type="button"
                className="sheet-close"
                onClick={handleClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <CheckoutSignInGate onClose={handleClose} />
          </>
        )}

        {authLoading && (step === "basket" || step === "pay") && items.length > 0 && (
          <div className="checkout-auth-loading">
            <p className="muted">Loading your account…</p>
          </div>
        )}

        {!needsSignIn && !authLoading && step === "basket" && (
          <>
            <div className="sheet-head">
              <h3>Your basket</h3>
              <button
                type="button"
                className="sheet-close"
                onClick={handleClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {items.length === 0 ? (
              <div className="checkout-sheet-empty">
                <p>Your basket is empty.</p>
                <button type="button" className="btn" onClick={handleClose}>
                  Keep shopping
                </button>
              </div>
            ) : (
              <>
                <ul className="uc-items">
                  {items.map((line) => (
                    <li key={line.listing.id} className="uc-item">
                      <img
                        className="uc-item-photo"
                        src={line.listing.photoUrl}
                        alt=""
                      />
                      <div className="uc-item-body">
                        <p className="uc-item-title">{line.listing.title}</p>
                        <p className="uc-item-price">
                          {formatTsh(line.listing.priceTzs)}
                        </p>
                        <div className="uc-item-actions">
                          <div className="uc-qty">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                setQty(line.listing.id, line.qty - 1)
                              }
                            >
                              −
                            </button>
                            <span>{line.qty}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() =>
                                setQty(line.listing.id, line.qty + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="uc-trash"
                            aria-label="Remove item"
                            onClick={() => remove(line.listing.id)}
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <section className="uc-totals" aria-label="Order totals">
                  <div className="uc-totals-row">
                    <span>Subtotal</span>
                    <span>{formatTsh(totalTzs)}</span>
                  </div>
                  <div className="uc-totals-row">
                    <span>
                      {fulfillment === "pickup"
                        ? "Self pickup"
                        : fulfillment === "delivery"
                          ? "Delivery to you"
                          : "Pickup or delivery"}
                    </span>
                    <span className="uc-free">FREE</span>
                  </div>
                  <div className="uc-totals-row uc-totals-total">
                    <span>Total</span>
                    <span>{formatTsh(totalTzs)}</span>
                  </div>
                </section>

                <section className="uc-pay-section" aria-label="How to receive">
                  <p className="uc-pay-label">How do you want to receive this?</p>
                  <div className="fulfillment-cards">
                    <button
                      type="button"
                      className={`fulfillment-card ${fulfillment === "pickup" ? "on" : ""}`}
                      onClick={() => setFulfillment("pickup")}
                    >
                      <strong>Self pickup</strong>
                      <span>Walk to the stall in Kariakoo after you pay.</span>
                    </button>
                    <button
                      type="button"
                      className={`fulfillment-card ${fulfillment === "delivery" ? "on" : ""}`}
                      onClick={() => setFulfillment("delivery")}
                    >
                      <strong>Delivery</strong>
                      <span>We bring it to your location in Dar es Salaam.</span>
                    </button>
                  </div>
                  <p className="uc-pay-hint">
                    Funds stay in escrow until you receive the item. Then choose
                    a payment wallet below.
                  </p>
                  <div className="uc-pay-buttons">
                    {PAY_METHODS.map((m, i) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`uc-pay-btn ${i === PAY_METHODS.length - 1 ? "uc-pay-btn--dark" : ""}`}
                        onClick={() => openPay(m.id)}
                      >
                        <span
                          className="uc-pay-mark"
                          style={{ background: m.accent }}
                          aria-hidden
                        >
                          {m.label.charAt(0)}
                        </span>
                        {m.checkoutLabel}
                      </button>
                    ))}
                  </div>
                  <p className="uc-pay-foot">
                    M-Pesa · Mix by Yas · Airtel Money ·{" "}
                    <Link to="/terms" onClick={handleClose}>
                      escrow terms
                    </Link>
                  </p>
                </section>
              </>
            )}
          </>
        )}

        {!needsSignIn && !authLoading && step === "pay" && (
          <>
            <div className="sheet-head">
              <button
                type="button"
                className="uc-back"
                aria-label="Back to basket"
                onClick={goBack}
              >
                ←
              </button>
              <h3 className="uc-topbar-title--caps">Checkout</h3>
              <button
                type="button"
                className="sheet-close"
                onClick={handleClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {user && (
              <div className="checkout-signed-in">
                <UserAvatar user={user} size="md" />
                <div>
                  <p className="uc-panel-strong">{userDisplayName(user)}</p>
                  {contactEmail && <p className="muted">{contactEmail}</p>}
                </div>
              </div>
            )}

            <section className="uc-panel" aria-label="Receive order">
              <div className="uc-panel-head">
                <h2 className="uc-panel-label">Receive your order</h2>
              </div>
              <div className="fulfillment-cards">
                <button
                  type="button"
                  className={`fulfillment-card ${fulfillment === "pickup" ? "on" : ""}`}
                  onClick={() => {
                    setFulfillment("pickup");
                    setErr(null);
                  }}
                >
                  <strong>Self pickup</strong>
                  <span>Collect it yourself at the stall.</span>
                </button>
                <button
                  type="button"
                  className={`fulfillment-card ${fulfillment === "delivery" ? "on" : ""}`}
                  onClick={() => {
                    setFulfillment("delivery");
                    setErr(null);
                  }}
                >
                  <strong>Delivery</strong>
                  <span>Bring it to my location.</span>
                </button>
              </div>
              {fulfillment === "pickup" && (
                <p className="hint">
                  After payment we show the stall address. Bring your pickup
                  code.
                </p>
              )}
              {fulfillment === "delivery" && (
                <>
                  <label className="field-label" htmlFor="sheet-delivery-address">
                    Your location
                  </label>
                  <textarea
                    id="sheet-delivery-address"
                    className="sheet-field fulfillment-address"
                    rows={2}
                    placeholder="Area and street, e.g. Kariakoo, Uhuru Street"
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      setErr(null);
                    }}
                  />
                </>
              )}
            </section>

            {billingCards.length > 0 && (
              <section className="uc-panel" aria-label="Saved billing cards">
                <div className="uc-panel-head">
                  <h2 className="uc-panel-label">Saved wallets</h2>
                </div>
                <p className="hint billing-cards-hint">
                  Tap a card to charge that number — no need to retype it each time.
                </p>
                <div className="billing-cards-row">
                  {billingCards.map((card) => (
                    <BillingCardTile
                      key={card.id}
                      card={card}
                      selected={selectedCardId === card.id}
                      compact
                      onSelect={() => applyBillingCard(card)}
                    />
                  ))}
                </div>
                {selectedCardId && (
                  <button
                    type="button"
                    className="uc-use-saved"
                    onClick={() => {
                      setSelectedCardId(null);
                      setErr(null);
                    }}
                  >
                    Enter a different number
                  </button>
                )}
              </section>
            )}

            <section className="uc-panel">
              <div className="uc-panel-head">
                <h2 className="uc-panel-label">Mobile money</h2>
              </div>
              <label className="field-label" htmlFor="sheet-charge-phone">
                Number to charge
              </label>
              <input
                id="sheet-charge-phone"
                className="sheet-field"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+255 7XX XXX XXX"
                value={phone}
                onChange={(e) => {
                  setSelectedCardId(null);
                  setPhone(e.target.value);
                  if (!useCustomDelivery) setDeliveryPhone(e.target.value);
                  setErr(null);
                }}
              />
            </section>

            <section className="uc-panel">
              <div className="uc-panel-head">
                <h2 className="uc-panel-label">
                  {fulfillment === "pickup" ? "Contact number" : "Delivery contact"}
                </h2>
              </div>
              <p className="hint delivery-contact-note">
                {fulfillment === "pickup"
                  ? "We may call this number if the stall needs to reach you."
                  : "Dnols will call this number when your order is on the way. We share it with the seller through Dnols only."}
              </p>

              <label className="checkout-toggle">
                <input
                  type="checkbox"
                  checked={useCustomDelivery}
                  onChange={(e) => {
                    setUseCustomDelivery(e.target.checked);
                    if (!e.target.checked) {
                      setDeliveryPhone(phone);
                    }
                    setErr(null);
                  }}
                />
                <span>
                  {fulfillment === "pickup"
                    ? "Use a different contact number"
                    : "Use a different number to receive delivery"}
                </span>
              </label>

              {useCustomDelivery ? (
                <>
                  <label className="field-label" htmlFor="sheet-delivery-phone">
                    Delivery phone number
                  </label>
                  <input
                    id="sheet-delivery-phone"
                    className="sheet-field"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+255 7XX XXX XXX"
                    value={deliveryPhone}
                    onChange={(e) => {
                      setDeliveryPhone(e.target.value);
                      setErr(null);
                    }}
                  />
                </>
              ) : (
                <p className="uc-panel-strong">
                  {displayPhone || "Same as mobile money number above"}
                </p>
              )}
            </section>

            <section className="uc-panel">
              <div className="uc-panel-head">
                <h2 className="uc-panel-label">Payment wallet</h2>
                <button type="button" className="uc-edit" onClick={goBack}>
                  Change
                </button>
              </div>

              <div className="uc-wallets">
                {PAY_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`uc-wallet ${method === m.id ? "on" : ""}`}
                    onClick={() => {
                      setSelectedCardId(null);
                      setMethod(m.id);
                    }}
                  >
                    <span
                      className="uc-pay-mark"
                      style={{ background: m.accent }}
                      aria-hidden
                    >
                      {m.label.charAt(0)}
                    </span>
                    <div className="uc-wallet-text">
                      <p className="uc-panel-strong">{m.label}</p>
                      <p className="muted">{m.network}</p>
                    </div>
                  </button>
                ))}
              </div>

              {savedPhone && savedPhone !== phone && (
                <button
                  type="button"
                  className="uc-use-saved"
                  onClick={() => setPhone(savedPhone)}
                >
                  Use saved number · {formatTzPhoneDisplay(savedPhone)}
                </button>
              )}

              <p className="hint">{selectedMethod.stkHint}</p>
            </section>

            <section className="uc-panel uc-panel--compact">
              <div className="uc-totals-row">
                <span>Total</span>
                <span className="price">{formatTsh(totalTzs)}</span>
              </div>
            </section>

            {err && <p className="err">{err}</p>}

            <button
              type="button"
              className="btn checkout-sheet-continue"
              onClick={() => void startPayment()}
            >
              Continue
            </button>
          </>
        )}

        {step === "waiting" && (
          <div className="checkout-waiting">
            <div className="stk-pulse" aria-hidden />
            <h2 className="checkout-title">Check your phone</h2>
            <p className="section-desc">
              We sent a request to <strong>{displayPhone || phone}</strong> on{" "}
              {selectedMethod.label}.
            </p>
            <p className="hint">{selectedMethod.stkHint}</p>
            <p className="checkout-waiting-note">
              Do not close this screen until payment completes.
            </p>
          </div>
        )}

        {step === "success" && order && (
          <div className="checkout-sheet-success">
            <div className="checkout-success-badge" aria-hidden>
              ✓
            </div>
            <h2 className="uc-success-title">Thank you for shopping with us!</h2>

            <section className="uc-panel checkout-code-panel">
              <p className="uc-panel-label">Checkout code</p>
              <p className="checkout-code-value">{order.pickupCode}</p>
              <p className="hint">
                {isValidPickupCode(order.pickupCode)
                  ? order.fulfillment === "pickup"
                    ? "Keep this 6-character code — show it at the stall."
                    : "Keep this 6-character code — Dnols may ask for it when coordinating delivery."
                  : "Your checkout code for this order."}
              </p>
            </section>

            <section className="uc-panel">
              <h2 className="uc-panel-label">
                {order.fulfillment === "pickup"
                  ? "Self pickup"
                  : "Delivery to you"}
              </h2>
              {order.fulfillment === "pickup" ? (
                <>
                  <p className="uc-panel-strong">Collect at the stall</p>
                  <p className="hint">
                    Show your checkout code at handover. Stall details are below.
                  </p>
                </>
              ) : (
                <>
                  {order.deliveryAddress && (
                    <p className="uc-panel-strong">{order.deliveryAddress}</p>
                  )}
                  <p className="uc-panel-strong">
                    {order.deliveryPhone
                      ? formatTzPhoneDisplay(order.deliveryPhone)
                      : displayDeliveryPhone}
                  </p>
                  <p className="hint">
                    Dnols will contact you on this number and bring the order to
                    your location.
                  </p>
                </>
              )}
            </section>

            {primaryDirection ? (
              <section className="uc-panel">
                <h2 className="uc-panel-label">Seller stall</h2>
                <p className="uc-panel-strong">{primaryDirection.shopName}</p>
                <p className="muted">{primaryDirection.streetAddress}</p>
                <SellerStallPreview location={primaryDirection} />
                <p className="hint">{primaryDirection.mapsHint}</p>
              </section>
            ) : (
              <section className="uc-panel">
                <p className="hint">
                  Seller stall location appears once the shop is registered on
                  Dnols.
                </p>
              </section>
            )}

            {order.directions && order.directions.length > 1 && (
              <section className="uc-panel">
                <h2 className="uc-panel-label">Other sellers</h2>
                {order.directions.slice(1).map((d) => (
                  <div key={d.shopName} className="checkout-direction">
                    <p className="checkout-direction-name">{d.shopName}</p>
                    <p className="muted">{d.streetAddress}</p>
                    <SellerStallPreview location={d} />
                  </div>
                ))}
              </section>
            )}

            <section className="uc-panel">
              <h2 className="uc-panel-label">Payment</h2>
              <div className="uc-paid-with">
                <span
                  className="uc-pay-mark"
                  style={{ background: selectedMethod.accent }}
                  aria-hidden
                >
                  {selectedMethod.label.charAt(0)}
                </span>
                <div>
                  <p className="uc-panel-strong">{selectedMethod.label}</p>
                  <p className="muted">
                    {order.payPhone
                      ? formatTzPhoneDisplay(order.payPhone)
                      : displayPhone}
                  </p>
                </div>
              </div>
              <p className="hint">
                {formatTsh(order.totalTzs)} held in escrow until you confirm
                {order.fulfillment === "pickup" ? " pickup." : " delivery."}
              </p>
            </section>

            <button
              type="button"
              className="btn checkout-sheet-continue"
              onClick={() => {
                handleClose();
                nav("/orders");
              }}
            >
              View my orders
            </button>
            <button
              type="button"
              className="uc-continue-link"
              onClick={handleClose}
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
