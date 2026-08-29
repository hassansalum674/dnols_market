import { Link } from "react-router-dom";
import { paths } from "../lib/paths";

export function ServerErrorPage() {
  return (
    <div className="center-state">
      <img className="state-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
      <p>Something broke on our side.</p>
      <Link className="btn" to={paths.home}>
        Start shopping
      </Link>
    </div>
  );
}

export function OfflinePage() {
  return (
    <div className="center-state">
      <img className="state-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
      <p>You're offline.</p>
      <Link className="btn" to={paths.home}>
        Start shopping
      </Link>
    </div>
  );
}
