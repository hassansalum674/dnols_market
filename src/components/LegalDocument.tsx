import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type Section = {
  id: string;
  title: string;
  body: ReactNode;
};

type Props = {
  title: string;
  effectiveDate: string;
  intro: ReactNode;
  sections: Section[];
  otherPage: { href: string; label: string };
};

export function LegalDocument({
  title,
  effectiveDate,
  intro,
  sections,
  otherPage,
}: Props) {
  return (
    <article className="page legal-page">
      <div className="legal-top">
        <Link to="/" className="back-link">
          ← Back to Dnols
        </Link>
        <h1 className="legal-title">{title}</h1>
        <p className="legal-meta muted">Effective date: {effectiveDate}</p>
        <p className="legal-intro">{intro}</p>
        <nav className="legal-toc" aria-label="On this page">
          <p className="legal-toc-label">On this page</p>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="legal-body">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="legal-section">
            <h2>{s.title}</h2>
            <div className="legal-section-body">{s.body}</div>
          </section>
        ))}
      </div>

      <footer className="legal-footer">
        <p>
          See also{" "}
          <Link to={otherPage.href} className="text-link">
            {otherPage.label}
          </Link>
          .
        </p>
        <p className="muted">
          Questions? Email{" "}
          <a href="mailto:support@dnols.com" className="text-link">
            support@dnols.com
          </a>
          .
        </p>
      </footer>
    </article>
  );
}
