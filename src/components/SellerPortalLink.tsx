import { useEffect, useState, type ReactNode } from "react";
import { SELLER_URL } from "../lib/urls";
import { urlWithPrefs } from "../store/settings";

export function SellerPortalLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [href, setHref] = useState(() => urlWithPrefs(SELLER_URL));
  useEffect(() => {
    const sync = () => setHref(urlWithPrefs(SELLER_URL));
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
