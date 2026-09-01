import { Link } from "react-router-dom";
import { useI18n } from "../store/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="site-footer" aria-label={t.legalNav}>
      <div className="site-footer-inner">
        <p className="site-footer-copy muted">© {new Date().getFullYear()} Dnols</p>
        <nav className="site-footer-links">
          <Link to="/terms">{t.terms}</Link>
          <Link to="/privacy">{t.privacy}</Link>
          <a href="mailto:support@dnols.com">{t.contact}</a>
        </nav>
      </div>
    </footer>
  );
}
