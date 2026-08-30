import { Link } from "react-router-dom";
import { GoogleSignInButton } from "./GoogleSignInButton";

type Props = {
  onClose: () => void;
  title?: string;
};

export function CheckoutSignInGate({
  onClose,
  title = "Sign in to checkout",
}: Props) {
  return (
    <div className="checkout-signin-gate">
      <h3>{title}</h3>
      <p className="section-desc">
        You need a Dnols account to place an order. Sign in once, then save your
        mobile money wallet as a billing card for faster checkout next time.
      </p>
      <GoogleSignInButton label="Continue with Google" />
      <p className="auth-divider">
        <span>or</span>
      </p>
      <Link to="/signin" className="btn signin-email-btn" onClick={onClose}>
        Sign in with email
      </Link>
      <p className="hint">
        New here? Create an account on the next screen — it takes under a minute.
      </p>
    </div>
  );
}
