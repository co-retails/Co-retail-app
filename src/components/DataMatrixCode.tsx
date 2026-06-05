import React, { useMemo } from 'react';

interface DataMatrixCodeProps {
  /** Payload encoded in the code (drives the deterministic module pattern). */
  value: string;
  /** Rendered pixel size of the square symbol. */
  size?: number;
  className?: string;
  /** Accessible label. */
  title?: string;
}

/** Modules per side, including the finder/timing border. */
const GRID = 20;

/**
 * Renders a deterministic Data Matrix–style 2D code as inline SVG.
 *
 * This is a visual stand-in for a real Data Matrix symbol (no encoder library
 * is bundled): it reproduces the characteristic look — a solid "L" finder
 * pattern on the left and bottom edges, a dashed timing pattern on the top and
 * right edges, and a data region filled deterministically from `value` so the
 * same payload always renders the same pattern.
 */
export default function DataMatrixCode({
  value,
  size = 176,
  className,
  title,
}: DataMatrixCodeProps) {
  const modules = useMemo(() => buildModules(value, GRID), [value]);
  const cell = 100 / GRID; // viewBox is 0..100

  return (
    <svg
      role="img"
      aria-label={title ?? `Data matrix code ${value}`}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      shapeRendering="crispEdges"
    >
      <rect x={0} y={0} width={100} height={100} fill="#ffffff" />
      {modules.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell}
              height={cell}
              fill="#000000"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

function buildModules(value: string, n: number): boolean[][] {
  // FNV-1a style seed from the payload for a stable, well-mixed pattern.
  let seed = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    seed ^= value.charCodeAt(i);
    seed = (seed * 0x01000193) >>> 0;
  }
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const grid: boolean[][] = [];
  for (let r = 0; r < n; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < n; c++) {
      const isLeft = c === 0;
      const isBottom = r === n - 1;
      const isTop = r === 0;
      const isRight = c === n - 1;

      if (isLeft || isBottom) {
        row.push(true); // solid "L" finder pattern
      } else if (isTop) {
        row.push(c % 2 === 0); // timing pattern (alternating)
      } else if (isRight) {
        row.push(r % 2 === 1); // timing pattern (alternating)
      } else {
        row.push(rand() > 0.5); // data region
      }
    }
    grid.push(row);
  }
  return grid;
}
