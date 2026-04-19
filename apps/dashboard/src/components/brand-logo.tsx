import { cn } from "@midday/ui/cn";

interface BrandLogoProps {
  size?: number;
  className?: string;
  /** @deprecated - kept for API compatibility, has no effect */
  priority?: boolean;
}

/**
 * Quadra brand logo rendered as an inline SVG.
 *
 * Uses CSS variables so it automatically reflects the active theme:
 *  - dark mode  → dark background (#0A0A0D), white icon
 *  - light mode → white background, dark icon (#0A0A0D)
 *
 * No Next.js Image component, no image loader, no network requests.
 */
export function BrandLogo({
  size = 36,
  className,
}: BrandLogoProps) {
  return (
    <span 
      className={cn("relative inline-block shrink-0", className)} 
      style={{ width: size, height: size }}
    >
      {/* Light mode logo */}
      <img
        src="/logo-light.svg"
        alt="Quadra Logo"
        width={size}
        height={size}
        className="dark:hidden object-contain"
        style={{ width: size, height: size, position: 'absolute', inset: 0 }}
        loading="eager"
      />
      {/* Dark mode logo */}
      <img
        src="/logo-dark.svg"
        alt="Quadra Logo"
        width={size}
        height={size}
        className="hidden dark:block object-contain"
        style={{ width: size, height: size, position: 'absolute', inset: 0 }}
        loading="eager"
      />
    </span>
  );
}
