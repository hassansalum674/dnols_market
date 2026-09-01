import { Link } from "react-router-dom";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useI18n } from "../store/i18n";

type Props = {
  onClose: () => void;
  title?: string;
};

export function CheckoutSignInGate({ onClose, title }: Props) {
  const { t } = useI18n();
  return (
    <div className="checkout-signin-gate">
      <h3>{title ?? t.signInToCheckout}</h3>
      <p className="section-desc">{t.signInGateBody}</p>
      <GoogleSignInButton label={t.continueGoogle} />
      <p className="auth-divider">
        <span>{t.or}</span>
      </p>
      <Link to="/signin" className="btn signin-email-btn" onClick={onClose}>
        {t.signInEmail}
      </Link>
      <p className="hint">{t.newHere}</p>
    </div>
  );
}
