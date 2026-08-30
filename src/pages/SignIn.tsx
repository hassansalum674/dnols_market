import { Link } from "react-router-dom";
import { SignInPanel } from "../components/SignInPanel";

export function SignInPage() {
  return (
    <div className="page signin-page">
      <Link to="/you" className="back-link">
        ← Back to account
      </Link>
      <SignInPanel />
    </div>
  );
}
