type Props = {
  className?: string;
};

/** Alibaba-style text lockup — bold orange sans-serif */
export function BrandWordmark({ className = "" }: Props) {
  return (
    <span className={`brand-wordmark ${className}`} aria-label="dnols.com">
      dnols.com
    </span>
  );
}
