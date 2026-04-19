import { cn } from "@midday/ui/cn";
import Image from "next/image";

interface BrandLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  size = 36,
  className,
  priority = false,
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
        loading={priority ? "eager" : "lazy"}
      />
      {/* Dark mode logo */}
      <img
        src="/logo-dark.svg"
        alt="Quadra Logo"
        width={size}
        height={size}
        className="hidden dark:block object-contain"
        style={{ width: size, height: size, position: 'absolute', inset: 0 }}
        loading={priority ? "eager" : "lazy"}
      />
    </span>
  );
}
