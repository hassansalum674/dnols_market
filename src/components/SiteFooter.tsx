import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Legal">
      <div className="site-footer-inner">
        <p className="site-footer-copy muted">© {new Date().getFullYear()} Dnols</p>
        <nav className="site-footer-links">
          <Link to="/terms">Terms of Use</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a href="mailto:support@dnols.com">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
