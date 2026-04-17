"use client";

import { useMemo } from "react";

type Props = {
  name: string;
  size?: number;
  className?: string;
};

// Generate deterministic colors based on name
function generateGradientColors(name: string): [string, string, string] {
  const colors = [
    ["#FF6B6B", "#4ECDC4", "#45B7D1"], // Coral to Teal to Blue
    ["#6C5CE7", "#A29BFE", "#FD79A8"], // Purple to Lavender to Pink
    ["#00B894", "#00CEC9", "#74B9FF"], // Green to Cyan to Blue
    ["#FF7675", "#FDCB6E", "#E17055"], // Red to Yellow to Orange
    ["#55EFC4", "#81ECEC", "#A29BFE"], // Mint to Aqua to Purple
    ["#FAB1A0", "#FF7675", "#FD79A8"], // Peach to Red to Pink
    ["#FFEAA7", "#FDCB6E", "#E17055"], // Yellow to Orange to Red
    ["#DDA0DD", "#98FB98", "#87CEEB"], // Plum to Light Green to Sky Blue
    ["#FFB6C1", "#FFA07A", "#F0E68C"], // Light Pink to Light Salmon to Khaki
    ["#20B2AA", "#48D1CC", "#00CED1"], // Light Sea Green to Medium Turquoise to Dark Turquoise
  ];
  
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length]!;
}

// Generate geometric pattern based on name
function generatePattern(name: string, size: number): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const patternType = hash % 4;
  const gridSize = Math.max(4, Math.floor(size / 20));
  
  let pattern = '';
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cellHash = (hash + i * 7 + j * 13) % 100;
      const opacity = (cellHash % 30) / 100 + 0.1; // 0.1 to 0.4 opacity
      const cellSize = size / gridSize;
      
      if (cellHash > 60) { // Only show some cells for a scattered effect
        switch (patternType) {
          case 0: // Circles
            pattern += `<circle cx="${j * cellSize + cellSize/2}" cy="${i * cellSize + cellSize/2}" r="${cellSize/4}" fill="rgba(255,255,255,${opacity})" />`;
            break;
          case 1: // Squares
            pattern += `<rect x="${j * cellSize + cellSize/4}" y="${i * cellSize + cellSize/4}" width="${cellSize/2}" height="${cellSize/2}" fill="rgba(255,255,255,${opacity})" />`;
            break;
          case 2: // Triangles
            const cx = j * cellSize + cellSize/2;
            const cy = i * cellSize + cellSize/2;
            const r = cellSize/4;
            pattern += `<polygon points="${cx},${cy-r} ${cx-r},${cy+r/2} ${cx+r},${cy+r/2}" fill="rgba(255,255,255,${opacity})" />`;
            break;
          case 3: // Diamonds
            const dcx = j * cellSize + cellSize/2;
            const dcy = i * cellSize + cellSize/2;
            const dr = cellSize/4;
            pattern += `<polygon points="${dcx},${dcy-dr} ${dcx+dr},${dcy} ${dcx},${dcy+dr} ${dcx-dr},${dcy}" fill="rgba(255,255,255,${opacity})" />`;
            break;
        }
      }
    }
  }
  
  return pattern;
}

export function GradientAvatar({ name, size = 40, className = "" }: Props) {
  const { gradientId, colors, pattern } = useMemo(() => {
    const [color1, color2, color3] = generateGradientColors(name);
    const gradientId = `gradient-${name.replace(/[^a-zA-Z0-9]/g, '')}-${size}`;
    const pattern = generatePattern(name, size);
    
    return {
      gradientId,
      colors: [color1, color2, color3],
      pattern
    };
  }, [name, size]);

  return (
    <div className={`w-full h-full ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full"
        style={{ borderRadius: 'inherit' }}
      >
        <defs>
          <radialGradient id={gradientId} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="50%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </radialGradient>
        </defs>
        
        {/* Base gradient background */}
        <rect
          width={size}
          height={size}
          fill={`url(#${gradientId})`}
          rx={className.includes('rounded-none') ? 0 : size / 2}
        />
        
        {/* Geometric pattern overlay */}
        <g opacity="0.6">
          <g dangerouslySetInnerHTML={{ __html: pattern }} />
        </g>
        
        {/* Subtle noise texture */}
        <rect
          width={size}
          height={size}
          fill="url(data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E)"
          rx={className.includes('rounded-none') ? 0 : size / 2}
        />
      </svg>
    </div>
  );
}