/**
 * Tiny dependency-free SVG chart helpers.
 * Designed for the value-quadrant scatter plot and small sparklines.
 */

export interface Point {
  x: number;
  y: number;
  r?: number;
  color: string;
  label: string;
  id: string;
}

/** Build an SVG scatter-plot string. */
export function scatterSVG(
  points: Point[],
  opts: {
    width: number;
    height: number;
    pad?: number;
    xLabel: string;
    yLabel: string;
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    xLog?: boolean;
    yLog?: boolean;
    quadrantLabels?: [string, string, string, string];
  }
): string {
  const pad = opts.pad ?? 48;
  const W = opts.width;
  const H = opts.height;
  const iw = W - pad * 1.5;
  const ih = H - pad * 1.5;

  const transform = (val: number, min: number, max: number, log: boolean) => {
    if (log) {
      const lv = Math.log10(Math.max(val, 0.0001));
      const lmin = Math.log10(Math.max(min, 0.0001));
      const lmax = Math.log10(Math.max(max, 0.0001));
      return (lv - lmin) / (lmax - lmin);
    }
    return (val - min) / (max - min);
  };

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = opts.xMin ?? Math.min(...xs);
  const xMax = opts.xMax ?? Math.max(...xs);
  const yMin = opts.yMin ?? Math.min(...ys);
  const yMax = opts.yMax ?? Math.max(...ys);

  const sx = (x: number) => pad + transform(x, xMin, xMax, !!opts.xLog) * iw;
  const sy = (y: number) => H - pad - transform(y, yMin, yMax, !!opts.yLog) * ih;

  const dots = points
    .map((p) => {
      const cx = sx(p.x);
      const cy = sy(p.y);
      const r = p.r ?? 5;
      return `<g class="dot-group" data-id="${p.id}" style="cursor:pointer">
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r}" fill="${p.color}" fill-opacity="0.75" stroke="${p.color}" stroke-width="1.5"/>
        <title>${p.label}</title>
      </g>`;
    })
    .join('');

  // quadrant divider lines
  const midX = pad + iw / 2;
  const midY = H - pad - ih / 2;
  const ql = opts.quadrantLabels;

  return `<svg viewBox="0 0 ${W} ${H}" class="chart-scatter" role="img">
    <defs>
      <pattern id="grid" width="${(iw / 4).toFixed(0)}" height="${(ih / 4).toFixed(0)}" patternUnits="userSpaceOnUse">
        <path d="M ${(iw / 4).toFixed(0)} 0 L 0 0 0 ${(ih / 4).toFixed(0)}" fill="none" stroke="var(--grid)" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect x="${pad}" y="${pad}" width="${iw}" height="${ih}" fill="url(#grid)"/>
    <line x1="${midX}" y1="${pad}" x2="${midX}" y2="${H - pad}" stroke="var(--border)" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="${pad}" y1="${midY}" x2="${W - pad / 2}" y2="${midY}" stroke="var(--border)" stroke-width="1" stroke-dasharray="4 4"/>
    ${
      ql
        ? `<text x="${midX + 6}" y="${pad + 16}" class="qlabel" fill="var(--text-dim)">${ql[0]}</text>
           <text x="${pad + 6}" y="${pad + 16}" class="qlabel" fill="var(--text-dim)">${ql[1]}</text>
           <text x="${pad + 6}" y="${H - pad - 6}" class="qlabel" fill="var(--text-dim)">${ql[2]}</text>
           <text x="${midX + 6}" y="${H - pad - 6}" class="qlabel" fill="var(--text-dim)">${ql[3]}</text>`
        : ''
    }
    <line x1="${pad}" y1="${H - pad}" x2="${W - pad / 2}" y2="${H - pad}" stroke="var(--border-strong)" stroke-width="1.5"/>
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${H - pad}" stroke="var(--border-strong)" stroke-width="1.5"/>
    <text x="${W / 2}" y="${H - 8}" text-anchor="middle" class="axis-label" fill="var(--text-dim)">${opts.xLabel}</text>
    <text x="14" y="${H / 2}" text-anchor="middle" class="axis-label" fill="var(--text-dim)" transform="rotate(-90 14 ${H / 2})">${opts.yLabel}</text>
    ${dots}
  </svg>`;
}

/** Build a simple horizontal bar comparison for the compare view */
export function barRow(label: string, value: number, max: number, color: string, suffix = ''): string {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return `<div class="bar-row">
    <span class="bar-label">${label}</span>
    <div class="bar-track"><div class="bar-fill" style="width:${pct.toFixed(1)}%;background:${color}"></div></div>
    <span class="bar-val">${value.toFixed(1)}${suffix}</span>
  </div>`;
}
