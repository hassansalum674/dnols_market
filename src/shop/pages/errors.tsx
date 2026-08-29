import { Link } from "react-router-dom";
import { paths } from "../lib/paths";

export function ShopServerErrorPage() {
  return (
    <div className="center-state">
      <img
        src="/brand/logo6_dark.svg"
        alt="Dnols"
        className="state-mark"
      />
      <p>Something broke on our side.</p>
      <Link className="btn" to={paths.shop}>
        Back to Today
      </Link>
    </div>
  );
}
