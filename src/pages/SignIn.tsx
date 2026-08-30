import { Link } from "react-router-dom";
import { SignInPanel } from "../components/SignInPanel";

export function SignInPage() {
  return (
    <div className="page account-page">
      <Link to="/you" className="back-link">
        ← Back
      </Link>
      <SignInPanel />
    </div>
  );
}
