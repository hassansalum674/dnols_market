import { Link } from "react-router-dom";

export function ServerErrorPage() {
  return (
    <div className="center-state">
      <img className="center-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
      <p>Something broke on our side.</p>
      <Link className="btn" to="/">
        Start shopping
      </Link>
    </div>
  );
}

export function OfflinePage() {
  return (
    <div className="center-state">
      <img className="center-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
      <p>You're offline.</p>
      <Link className="btn" to="/">
        Start shopping
      </Link>
    </div>
  );
}
