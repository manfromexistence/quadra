"use client";

import Avatar from "boring-avatars";

type Props = {
  name: string;
  size?: number;
  square?: boolean;
};

// Generate random colors based on the name for consistency
function generateColors(name: string): string[] {
  const colors = [
    ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"],
    ["#6C5CE7", "#A29BFE", "#FD79A8", "#FDCB6E", "#E17055"],
    ["#00B894", "#00CEC9", "#0984E3", "#6C5CE7", "#FD79A8"],
    ["#FF7675", "#74B9FF", "#A29BFE", "#FD79A8", "#FDCB6E"],
    ["#55EFC4", "#81ECEC", "#74B9FF", "#A29BFE", "#DFE6E9"],
    ["#FAB1A0", "#FF7675", "#FD79A8", "#FDCB6E", "#FFEAA7"],
    ["#00B894", "#00CEC9", "#74B9FF", "#A29BFE", "#6C5CE7"],
    ["#E17055", "#FDCB6E", "#FFEAA7", "#55EFC4", "#81ECEC"],
  ];
  
  // Use name to deterministically select a color palette
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length]!;
}

export function BoringAvatar({
  name,
  size = 40,
  square = false,
}: Props) {
  const colors = generateColors(name);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Avatar
        size={size}
        name={name}
        variant="bauhaus"
        colors={colors}
        square={square}
      />
    </div>
  );
}
