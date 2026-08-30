type Props = {
  variant?: "dark" | "wordmark" | "submark";
  className?: string;
  height?: number;
};

const SRC = {
  dark: "/brand/logo6_dark.svg",
  wordmark: "/brand/logo3_wordmark.svg",
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
