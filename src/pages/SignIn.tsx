import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignInPanel } from "../components/SignInPanel";
import { useAuth } from "../store/auth";

export function SignInPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      nav("/you", { replace: true });
    }
  }, [user, loading, nav]);

  if (!loading && user) return null;

  return (
    <div className="page signin-page">
      <Link to="/you" className="back-link">
        ← Back to account
      </Link>
      <SignInPanel onSuccess={() => nav("/you", { replace: true })} />
    </div>
  );
}
