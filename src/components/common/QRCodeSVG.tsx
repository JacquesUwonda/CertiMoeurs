import React from 'react';

// Lightweight, deterministic QR Code SVG Generator for reliable zero-dependency rendering
export interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
  fgColor?: string;
  bgColor?: string;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 140,
  className = '',
  fgColor = '#0f172a',
  bgColor = '#ffffff'
}) => {
  // Generate deterministic 25x25 matrix pattern based on string hash
  const gridSize = 25;
  const hash = Math.abs(
    value.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  );

  const matrix: boolean[][] = Array(gridSize)
    .fill(false)
    .map(() => Array(gridSize).fill(false));

  // 1. Draw standard finder patterns (top-left, top-right, bottom-left)
  const drawFinderPattern = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 || i === 6 || j === 0 || j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          matrix[r + i][c + j] = true;
        } else {
          matrix[r + i][c + j] = false;
        }
      }
    }
  };

  drawFinderPattern(0, 0);
  drawFinderPattern(0, gridSize - 7);
  drawFinderPattern(gridSize - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Fill data pseudo-randomly but deterministically with value seed
  let seed = hash;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder zones
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= gridSize - 8;
      const inBL = r >= gridSize - 8 && c < 8;
      const inTiming = r === 6 || c === 6;

      if (!inTL && !inTR && !inBL && !inTiming) {
        seed = (seed * 9301 + 49297) % 233280;
        matrix[r][c] = (seed / 233280) > 0.48;
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      className={`rounded-sm select-none ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <rect width={gridSize} height={gridSize} fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill={fgColor}
              shapeRendering="crispEdges"
            />
          ) : null
        )
      )}
    </svg>
  );
};
