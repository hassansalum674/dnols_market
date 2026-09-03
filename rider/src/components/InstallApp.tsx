import { useEffect, useRef, useState } from "react";
import { useAuth } from "../store/auth";
import {
  canNativeInstall,
  isFirstVisit,
  isIosDevice,
  isStandalone,
  markFirstVisitSeen,
  promptNativeInstall,
  subscribeInstallChanges,
} from "../lib/pwaInstall";

const EN = {
  title: "Install Dnols",
  body: "Add Dnols to your home screen so you can open it like an app. If you deleted it, install it again here.",
  ios: "On iPhone or iPad: tap the Share button, then Add to Home Screen.",
  browser: "Tap Install to add Dnols to your home screen.",
  manual: "In your browser menu, choose Install app or Add to Home Screen.",
  install: "Install",
  gotIt: "Got it",
  notNow: "Not now",
  wait: "Please wait…",
  settingsTitle: "Install app",
  hint: "If you deleted the app, you can install it again from here.",
  installed: "Dnols is installed on this device.",
};

const SW: typeof EN = {
  title: "Sakinisha Dnols",
  body: "Weka Dnols kwenye skrini ya nyumbani ili uifungue kama programu. Ukiifuta, sakinisha tena hapa.",
  ios: "Kwenye iPhone au iPad: gusa Share, kisha Add to Home Screen.",
  browser: "Gusa Sakinisha kuweka Dnols kwenye skrini ya nyumbani.",
  manual: "Kwenye menyu ya kivinjari, chagua Install app au Add to Home Screen.",
  install: "Sakinisha",
  gotIt: "Sawa",
  notNow: "Si sasa",
  wait: "Subiri…",
  settingsTitle: "Sakinisha programu",
  hint: "Ukiifuta programu, unaweza kuisakinisha tena hapa.",
  installed: "Dnols imesakinishwa kwenye kifaa hiki.",
};

function copy() {
  return document.documentElement.lang === "sw" ? SW : EN;
}

export function InstallAppSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = copy();
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
          <h3 id="install-title">{t.title}</h3>
          <button type="button" className="sheet-close" onClick={onClose} aria-label={t.notNow}>
            ×
          </button>
        </div>
        <p className="hint">{t.body}</p>
        {ios ? (
          <p className="hint">{t.ios}</p>
        ) : native ? (
          <p className="hint">{t.browser}</p>
        ) : (
          <p className="hint">{t.manual}</p>
        )}
        {native && !ios ? (
          <>
            <button
              type="button"
              className="btn sheet-apply"
              disabled={busy}
              onClick={() => void install()}
            >
              {busy ? t.wait : t.install}
            </button>
            <button type="button" className="btn ghost install-dismiss" onClick={onClose}>
              {t.notNow}
            </button>
          </>
        ) : (
          <button type="button" className="btn sheet-apply" onClick={onClose}>
            {t.gotIt}
          </button>
        )}
      </div>
    </>
  );
}

export function InstallAppPrompt({ ready = true }: { ready?: boolean }) {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const prevUid = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!ready || loading || isStandalone()) return;
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
  const t = copy();
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
    <section className="block shop-panel">
      <h2>{t.settingsTitle}</h2>
      {installed ? (
        <p className="muted">{t.installed}</p>
      ) : (
        <>
          <p className="muted">{t.hint}</p>
          <button type="button" className="btn" onClick={() => setOpen(true)}>
            {t.install}
          </button>
          <InstallAppSheet open={open} onClose={() => setOpen(false)} />
        </>
      )}
    </section>
  );
}
