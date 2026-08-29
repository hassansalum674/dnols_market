import { Link } from "react-router-dom";
import { shopPaths } from "../paths";

export function ServerErrorPage() {
  return (
    <div className="center-state">
      <img
        className="state-mark"
        src="/brand/logo6_dark.svg"
        alt="Dnols"
      />
      <p>Something broke on our side.</p>
      <Link className="btn" to={shopPaths.home}>
        Back to Today
      </Link>
    </div>
  );
}

export function formatTzs(n: number): string {
  return `${n.toLocaleString("en-TZ")} TZS`;
}
