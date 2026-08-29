import { Link } from "react-router-dom";

export function ServerErrorPage() {
  return (
    <div className="center-state">
      <img src="/brand/logo4_submark.svg" alt="Dnols" width={64} height={64} />
      <p>Something broke on our side.</p>
      <Link className="btn" to="/">
        Back to Today
      </Link>
    </div>
  );
}

export function formatTzs(n: number): string {
  return `${n.toLocaleString("en-TZ")} TZS`;
}
