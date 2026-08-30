import { useEffect } from "react";
import { SignInPanel } from "./SignInPanel";
import { useAuth } from "../store/auth";

type Props = {
  open: boolean;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onSignedIn: () => void;
};

export function SignInDialog({
  open,
  title = "Sign in to sell on Dnols",
  subtitle = "Sign in with Google or email before you add products or complete seller verification.",
  onClose,
  onSignedIn,
}: Props) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (open && user) onSignedIn();
  }, [open, user, onSignedIn]);

  if (!open) return null;

  return (
    <div className="signin-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className="signin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="signin-dialog-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {!loading && user ? (
          <p className="hint">Signed in. Continuing…</p>
        ) : (
          <SignInPanel title={title} subtitle={subtitle} id="signin-dialog-title" />
        )}
      </div>
    </div>
  );
}
