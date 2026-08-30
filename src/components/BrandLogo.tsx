type Props = {
  variant?: "dark" | "wordmark" | "submark";
  className?: string;
  height?: number;
};

const SRC = {
  /** Full lockup — submark + nols on dark (splash, header) */
  dark: "/brand/logo6_dark.svg",
  /** d + nols wordmark on white */
  wordmark: "/brand/logo3_wordmark.svg",
  /** Blue square submark only */
  submark: "/brand/logo4_submark.svg",
} as const;

const ASPECT = {
  dark: 500 / 130,
  wordmark: 420 / 120,
  submark: 1,
} as const;

export function BrandLogo({
  variant = "dark",
  className = "",
  height = 36,
}: Props) {
  const src = SRC[variant];
  const width = Math.round(height * ASPECT[variant]);
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
