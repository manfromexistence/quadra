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
      className={cn("relative block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-dark.png"
        alt="Quadra"
        fill
        priority={priority}
        className="object-contain dark:hidden"
        sizes={`${size}px`}
      />
      <Image
        src="/logo-light.png"
        alt="Quadra"
        fill
        priority={priority}
        className="hidden object-contain dark:block"
        sizes={`${size}px`}
      />
    </span>
  );
}
