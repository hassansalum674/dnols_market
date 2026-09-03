import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { inviteRiderSms, listMyRiders, type RiderDoc } from "../api";
import { formatTzMobile, isValidTzMobile } from "../lib/deliveryCloud";
import { getFirebaseAuth } from "../lib/firebase";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";

function riderErrMessage(
  e: unknown,
  t: (k: "riderFail" | "riderOffline" | "riderRulesMissing") => string,
): string {
  const msg = e instanceof Error ? e.message : "";
  const status = (e as { status?: number }).status;
  if (
    status === 403 ||
    msg === "permission_denied" ||
    /security rules are blocking/i.test(msg)
  ) {
    return msg.length > 60 ? msg : t("riderRulesMissing");
  }
  if (
    status === 503 &&
    (msg === "firestore_unavailable" || /could not reach firestore/i.test(msg))
  ) {
    return msg.length > 60 ? msg : t("riderOffline");
  }
  if (/offline|Failed to get document/i.test(msg)) {
    return t("riderOffline");
  }
  return msg || t("riderFail");
}

export function RidersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [riders, setRiders] = useState<RiderDoc[]>([]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const loadRiders = useCallback(async () => {
    const token = await getFirebaseAuth()?.currentUser?.getIdToken();
    if (!token) return;
    try {
      const res = await listMyRiders(token);
      setRiders(res.riders ?? []);
      setErr(null);
    } catch (e) {
      setErr(riderErrMessage(e, t));
    }
  }, [t]);

  useEffect(() => {
    if (!user?.uid) {
      setRiders([]);
      return;
    }
    void loadRiders();
  }, [user?.uid, loadRiders]);

  async function addRider() {
    setErr(null);
    setMsg(null);
    if (!user?.uid) return;
    if (!isValidTzMobile(phone)) {
      setErr(t("riderBadPhone"));
      return;
    }
    setBusy(true);
    try {
      const token = await getFirebaseAuth()?.currentUser?.getIdToken();
      if (!token) {
        setErr(t("riderNeedSignIn"));
        return;
      }
      const res = await inviteRiderSms(phone, token, name);
      setMsg(res.sms === "sent" ? t("riderSmsSent") : t("riderSaved"));
      setPhone("");
      setName("");
      await loadRiders();
    } catch (e) {
      setErr(riderErrMessage(e, t));
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <div className="page stall-page">
        <h1 className="stall-page-title">{t("myRiders")}</h1>
        <p className="section-desc">{t("riderNeedSignIn")}</p>
        <Link to="/signin" className="btn">
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="page stall-page">
      <header className="stall-page-head">
        <div>
          <h1 className="stall-page-title">{t("myRiders")}</h1>
          <p className="muted stall-page-desc">{t("myRidersHint")}</p>
        </div>
      </header>

      <section className="card" style={{ marginBottom: 16 }}>
        <h2 className="product-form-section-title">{t("addRider")}</h2>
        <label className="lbl" htmlFor="rider-name">
          {t("riderName")}
        </label>
        <input
          id="rider-name"
          className="field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("riderNamePh")}
        />
        <label className="lbl" htmlFor="rider-phone">
          {t("riderPhone")}
        </label>
        <input
          id="rider-phone"
          className="field"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+255 6XX or 7XX"
        />
        <button className="btn" disabled={busy} onClick={() => void addRider()}>
          {busy ? t("riderAdding") : t("addRider")}
        </button>
        {err && <p className="err">{err}</p>}
        {msg && <p className="ok">{msg}</p>}
      </section>

      {riders.length === 0 ? (
        <div className="center-state">
          <p>{t("noRiders")}</p>
        </div>
      ) : (
        <div className="order-list">
          {riders.map((r) => (
            <article key={r.riderId} className="card order-card">
              <span className={r.status === "idle" ? "pill live" : "pill"}>
                {r.status === "idle" ? t("riderIdle") : t("riderBusy")}
              </span>
              <h2>{r.name}</h2>
              <p className="muted">{formatTzMobile(r.phone)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
