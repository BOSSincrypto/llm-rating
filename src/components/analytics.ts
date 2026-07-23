import type { RankedModel } from '../lib/scoring';
import { fmtPrice, esc } from '../lib/format';
import { barRow } from '../charts/svg';

export function renderAnalytics(ranked: RankedModel[]): string {
  const provCounts = new Map<string, { count: number; color: string }>();
  ranked.forEach((r) => {
    const cur = provCounts.get(r.model.provider) || { count: 0, color: r.model.providerColor };
    cur.count++;
    provCounts.set(r.model.provider, cur);
  });
  const provData = [...provCounts.entries()].sort((a, b) => b[1].count - a[1].count);
  const total = ranked.length;
  const donut = donutSVG(provData.map(([name, d]) => ({ label: name, value: d.count, color: d.color })), total);
  const legend = provData.map(([name, d]) =>
    `<div class="legend-item"><span class="legend-dot" style="background:${d.color}"></span>${esc(name)} <b>${d.count}</b></div>`
  ).join('');

  const open = ranked.filter((r) => r.model.license === 'open').length;
  const prop = total - open;
  const avgPrice = (lic: string) => {
    const prices = ranked.filter((r) => r.model.license === lic && r.model.pricing.output !== null).map((r) => r.model.pricing.output!);
    return prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  };

  const top15 = ranked.slice(0, 15);
  const pricePerf = top15.filter((r) => r.model.pricing.output !== null && r.model.pricing.output > 0)
    .map((r) => barRow(esc(r.model.name), r.breakdown.composite, 100, r.model.providerColor)).join('');

  return `<div class="section-title">📊 Market Analytics</div>
    <div class="cards-grid">
      <div class="panel"><div class="panel-title">🏭 Models by Provider</div>
        <div class="donut-wrap">${donut}<div class="legend">${legend}</div></div>
      </div>
      <div class="panel"><div class="panel-title">🔓 Open vs Proprietary</div>
        <div style="display:flex;gap:12px;margin:12px 0">
          <div class="detail-item" style="flex:1"><div class="detail-label">Open</div><div class="detail-value" style="color:var(--success)">${open}</div><div class="detail-label">avg ${fmtPrice(avgPrice('open'))}/M</div></div>
          <div class="detail-item" style="flex:1"><div class="detail-label">Proprietary</div><div class="detail-value">${prop}</div><div class="detail-label">avg ${fmtPrice(avgPrice('proprietary'))}/M</div></div>
        </div>
        <div class="bar-row"><span class="bar-label">Open</span><div class="bar-track"><div class="bar-fill" style="width:${(open / total * 100).toFixed(0)}%;background:var(--success)"></div></div><span class="bar-val">${((open / total) * 100).toFixed(0)}%</span></div>
        <div class="bar-row"><span class="bar-label">Prop</span><div class="bar-track"><div class="bar-fill" style="width:${(prop / total * 100).toFixed(0)}%;background:var(--text-dim)"></div></div><span class="bar-val">${((prop / total) * 100).toFixed(0)}%</span></div>
      </div>
    </div>
    <div class="section-title">💰 Composite Score — Top 15</div>
    <div class="panel">${pricePerf || '<div class="empty-msg">No data</div>'}</div>`;
}

function donutSVG(segments: { label: string; value: number; color: string }[], total: number): string {
  const r = 60, cx = 70, cy = 70, sw = 24;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map((s) => {
    const frac = s.value / total;
    const len = frac * circ;
    const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${sw}" stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
    offset += len;
    return arc;
  }).join('');
  return `<svg viewBox="0 0 140 140" width="140" height="140">${arcs}<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text)">${total}</text><text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="9" fill="var(--text-dim)">models</text></svg>`;
}
