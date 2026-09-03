import { useEffect, useRef, useState } from "react";
import { useAuth } from "../store/auth";
import { useI18n } from "../store/i18n";
import {
  canNativeInstall,
  isFirstVisit,
  isIosDevice,
  isStandalone,
  markFirstVisitSeen,
  promptNativeInstall,
  subscribeInstallChanges,
} from "../lib/pwaInstall";

export function InstallAppSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [native, setNative] = useState(canNativeInstall);
  const [busy, setBusy] = useState(false);
  const ios = isIosDevice();

  useEffect(() => subscribeInstallChanges(() => setNative(canNativeInstall())), []);

  if (!open) return null;

  async function install() {
    setBusy(true);
    const outcome = await promptNativeInstall();
    setBusy(false);
    setNative(canNativeInstall());
    if (outcome === "accepted") onClose();
  }

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden />
      <div className="sheet install-sheet" role="dialog" aria-labelledby="install-title" aria-modal="true">
        <div className="sheet-head">
          <h3 id="install-title">{t("installAppTitle")}</h3>
          <button type="button" className="sheet-close" onClick={onClose} aria-label={t("notNow")}>
            ×
          </button>
        </div>
        <p className="section-desc">{t("installAppBody")}</p>
        {ios ? (
          <p className="hint">{t("installAppIos")}</p>
        ) : native ? (
          <p className="hint">{t("installAppBrowser")}</p>
        ) : (
          <p className="hint">{t("installAppManual")}</p>
        )}
        {native && !ios ? (
          <>
            <button
              type="button"
              className="btn sheet-apply"
              disabled={busy}
              onClick={() => void install()}
            >
              {busy ? t("pleaseWait") : t("installAppNow")}
            </button>
            <button type="button" className="btn ghost install-dismiss" onClick={onClose}>
              {t("notNow")}
            </button>
          </>
        ) : (
          <button type="button" className="btn sheet-apply" onClick={onClose}>
            {t("gotIt")}
          </button>
        )}
      </div>
    </>
  );
}

export function InstallAppPrompt({ ready }: { ready: boolean }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const prevUid = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!ready || loading || isStandalone()) return;
    if (window.location.pathname.startsWith("/you/settings")) return;
    if (!isFirstVisit()) return;
    const tmr = window.setTimeout(() => {
      markFirstVisitSeen();
      setOpen(true);
    }, 400);
    return () => window.clearTimeout(tmr);
  }, [ready, loading]);

  useEffect(() => {
    if (!ready || loading || isStandalone()) return;
    const uid = user?.uid ?? null;
    const was = prevUid.current;
    prevUid.current = uid;
    if (was === undefined) return;
    if (!(uid && was !== uid)) return;
    const tmr = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(tmr);
  }, [user?.uid, loading, ready]);

  return <InstallAppSheet open={open} onClose={() => setOpen(false)} />;
}

export function InstallAppSettings() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [installed, setInstalled] = useState(isStandalone);

  useEffect(
    () =>
      subscribeInstallChanges(() => {
        setInstalled(isStandalone());
      }),
    [],
  );

  return (
    <section className="account-section">
      <h2>{t("installApp")}</h2>
      {installed ? (
        <p className="section-desc">{t("installAppInstalled")}</p>
      ) : (
        <>
          <p className="section-desc">{t("installAppHint")}</p>
          <button type="button" className="btn" onClick={() => setOpen(true)}>
            {t("installAppNow")}
          </button>
          <InstallAppSheet open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </section>
  );
}
