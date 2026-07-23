import type { Model } from '../types';

/** Format a price in USD per 1M tokens, e.g. $3.50 */
export function fmtPrice(v: number | null): string {
  if (v === null || v === undefined) return '—';
  if (v === 0) return 'Free';
  if (v < 0.1) return `$${v.toFixed(3)}`;
  if (v < 1) return `$${v.toFixed(2)}`;
  return `$${v.toFixed(v < 10 ? 2 : 0)}`;
}

/** Format context window, e.g. "1M" or "10M" */
export function fmtContext(tokens: number): string {
  if (tokens >= 1_000_000) {
    const m = tokens / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
  return `${tokens}`;
}

/** Format speed, e.g. "347 t/s" */
export function fmtSpeed(v: number | null): string {
  if (v === null || v === undefined) return '—';
  if (v >= 100) return `${Math.round(v)} t/s`;
  return `${v.toFixed(1)} t/s`;
}

/** Format latency, e.g. "1.14s" */
export function fmtLatency(v: number | null): string {
  if (v === null || v === undefined) return '—';
  if (v < 1) return `${Math.round(v * 1000)}ms`;
  return `${v.toFixed(v < 10 ? 1 : 0)}s`;
}

/** Format a percentage */
export function fmtPct(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined) return '—';
  return `${v.toFixed(digits)}%`;
}

/** Format a composite/normalised score to 0-100 */
export function fmtScore(v: number): string {
  return v.toFixed(1);
}

/** Short, human date e.g. "Jul 2026" */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** Days since a date */
export function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/** Tier letter from a 0-100 score */
export function tier(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 85) return 'S';
  if (score >= 70) return 'A';
  if (score >= 55) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

/** Provider initials for the avatar badge */
export function providerInitials(provider: string): string {
  return provider
    .split(/[\s()]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Escape HTML */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)
  );
}

/** Get the best (rank-1) source for display */
export function topSource(m: Model): { name: string; value: string; metric: string } | null {
  if (!m.sources.length) return null;
  const best = [...m.sources].sort((a, b) => a.rank - b.rank)[0];
  return { name: best.id, value: String(best.value), metric: best.metric };
}
