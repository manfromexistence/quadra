import { cn } from "@midday/ui/cn";

interface BrandLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

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
        src="/logo-dark.png"
        alt=""
        width={size}
        height={size}
        className="dark:hidden object-contain"
        style={{ width: size, height: size, display: 'block' }}
        loading="eager"
      />
      {/* Dark mode logo */}
      <img
        src="/logo-light.png"
        alt=""
        width={size}
        height={size}
        className="hidden dark:block object-contain"
        style={{ width: size, height: size, display: 'block' }}
        loading="eager"
      />
    </span>
  );
}
