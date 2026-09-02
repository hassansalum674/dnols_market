import { useEffect, useState } from "react";

type Variant = "auto" | "dark" | "light" | "wordmark" | "submark";

type Props = {
  variant?: Variant;
  className?: string;
  height?: number;
};

const SRC = {
  /** Full lockup — submark + nols on dark */
  dark: "/brand/logo6_dark.svg",
  /** Full lockup — submark + nols on white */
  light: "/brand/logo1_primary.svg",
  /** d + nols wordmark on white */
  wordmark: "/brand/logo3_wordmark.svg",
  /** Blue square submark only */
  submark: "/brand/logo4_submark.svg",
} as const;

const ASPECT = {
  dark: 500 / 130,
  light: 500 / 130,
  wordmark: 420 / 120,
  submark: 1,
} as const;

function htmlTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function useHtmlTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">(htmlTheme);
  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setTheme(htmlTheme());
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

export function BrandLogo({
  variant = "auto",
  className = "",
  height = 36,
}: Props) {
  const theme = useHtmlTheme();
  const resolved: Exclude<Variant, "auto"> =
    variant === "auto" ? theme : variant;
  const src = SRC[resolved];
  const width = Math.round(height * ASPECT[resolved]);
  return (
    <img
      className={className}
      src={src}
      alt="Dnols"
      width={width}
      height={height}
    />
  );
}
