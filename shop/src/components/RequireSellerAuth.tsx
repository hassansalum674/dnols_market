import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { RoutePulse } from "./Splash";
import { SignInDialog } from "./SignInDialog";
import { useAuth } from "../store/auth";

type Props = {
  children: ReactNode;
  /** Where to send the user after a successful sign-in */
  afterSignIn?: string;
};

export function RequireSellerAuth({ children, afterSignIn }: Props) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) setDialogOpen(true);
  }, [loading, user]);

  if (loading) return <RoutePulse />;

  if (!user) {
    return (
      <>
        <SignInDialog
          open={dialogOpen}
          onClose={() => navigate("/")}
          onSignedIn={() => {
            setDialogOpen(false);
            if (afterSignIn) navigate(afterSignIn, { replace: true });
          }}
        />
        <div className="page auth-gate-hint">
          <p className="muted">Sign in to continue as a seller.</p>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
