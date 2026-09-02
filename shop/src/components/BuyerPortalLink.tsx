import { useEffect, useState, type ReactNode } from "react";
import { BUYER_URL } from "../lib/urls";
import { urlWithPrefs } from "../store/settings";

export function BuyerPortalLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [href, setHref] = useState(() => urlWithPrefs(BUYER_URL));
  useEffect(() => {
    const sync = () => setHref(urlWithPrefs(BUYER_URL));
    window.addEventListener("dnols-settings", sync);
    sync();
    return () => window.removeEventListener("dnols-settings", sync);
  }, []);
  return (
    <a className={className} href={href} rel="noopener noreferrer">
      {children}
    </a>
  );
}
