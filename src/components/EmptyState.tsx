import { Link } from "react-router-dom";

export function EmptyCart() {
  return (
    <div className="center-state">
      <svg className="bag-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M12 16h24l-2 24H14L12 16z" />
        <path d="M18 16v-3a6 6 0 0 1 12 0v3" />
      </svg>
      <p>Your bag is empty. Shops are a short walk away.</p>
      <Link className="btn" to="/">
        Start shopping
      </Link>
    </div>
  );
}

export function StatusScreen({
  line,
  action = "Try again",
  onAction,
  to,
}: {
  line: string;
  action?: string;
  onAction?: () => void;
  to?: string;
}) {
  return (
    <div className="center-state">
      <img className="center-mark" src="/brand/logo6_dark.svg" alt="Dnols" />
      <p>{line}</p>
      {to ? (
        <Link className="btn" to={to}>
          {action}
        </Link>
      ) : (
        <button type="button" className="btn" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
