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
    <span className={cn("relative inline-block shrink-0", className)}>
      <Image
        src="/logo-dark.png"
        alt="Quadra"
        width={size}
        height={size}
        priority={priority}
        className="dark:hidden"
        style={{ width: size, height: size }}
        unoptimized
      />
      <Image
        src="/logo-light.png"
        alt="Quadra"
        width={size}
        height={size}
        priority={priority}
        className="hidden dark:block"
        style={{ width: size, height: size }}
        unoptimized
      />
    </span>
  );
}
