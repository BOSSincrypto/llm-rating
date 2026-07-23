import type { RankedModel } from '../lib/scoring';
import { scatterSVG, type Point } from '../charts/svg';
import { fmtPrice, fmtSpeed, fmtScore, fmtContext, esc, providerInitials } from '../lib/format';

/** Value Quadrant — intelligence vs price scatter */
export function renderValueMap(ranked: RankedModel[]): string {
  const pts: Point[] = ranked
    .filter((r) => r.breakdown.intelligence !== null && r.model.pricing.output !== null && r.model.pricing.output > 0)
    .map((r) => ({
      x: r.model.pricing.output!,
      y: r.breakdown.intelligence!,
      r: Math.max(4, Math.min(12, (r.breakdown.composite / 100) * 12)),
      color: r.model.providerColor,
      label: `${r.model.name} — ${fmtScore(r.breakdown.composite)} score · ${fmtPrice(r.model.pricing.output)}/M`,
      id: r.model.id,
    }));

  const svg = scatterSVG(pts, {
    width: 900, height: 480, pad: 56,
    xLabel: 'Output Price ($/1M tokens, log scale) →',
    yLabel: 'Intelligence Score (0–100) →',
    xLog: true,
    quadrantLabels: ['💰 Premium Power', '⭐ Best Value', '🪙 Budget', '⚡ Cheap & Cheerful'],
  });

  const top3value = [...ranked]
    .filter((r) => r.breakdown.value !== null)
    .sort((a, b) => (b.breakdown.value! - a.breakdown.value!))
    .slice(0, 5);

  return `<div class="section-title">🎯 Value Quadrant — Intelligence vs Price</div>
    <div class="panel">${svg}</div>
    <div class="section-title">⭐ Best Value (intelligence per dollar)</div>
    <div class="cards-grid">${top3value.map((r) => valueCard(r)).join('')}</div>`;
}

function valueCard(r: RankedModel): string {
  return `<div class="card" data-model="${r.model.id}">
    <div class="card-head">
      <div class="avatar" style="background:${r.model.providerColor}">${providerInitials(r.model.provider)}</div>
      <div><div class="card-model">${esc(r.model.name)}</div><div class="card-title">${esc(r.model.provider)}</div></div>
    </div>
    <div class="card-stat">${r.breakdown.value?.toFixed(0) ?? '—'}<span style="font-size:13px;color:var(--text-faint)"> value</span></div>
    <div class="card-detail">${fmtPrice(r.model.pricing.output)}/M out · ${r.breakdown.intelligence?.toFixed(0) ?? '—'} intel</div>
  </div>`;
}

/** Best-by-use-case cards */
export function renderBestFor(ranked: RankedModel[]): string {
  const best = (fn: (r: RankedModel) => number | null | undefined, fallback?: (r: RankedModel) => number) => {
    const sorted = [...ranked].sort((a, b) => {
      const av = fn(a) ?? (fallback ? fallback(a) : -1);
      const bv = fn(b) ?? (fallback ? fallback(b) : -1);
      return bv - av;
    });
    return sorted[0];
  };

  const cards: { icon: string; title: string; r: RankedModel; stat: string }[] = [
    { icon: '🧠', title: 'Smartest', r: best((r) => r.breakdown.intelligence), stat: `${best((r) => r.breakdown.intelligence)?.breakdown.intelligence?.toFixed(0)}` },
    { icon: '💻', title: 'Best Coder', r: best((r) => r.breakdown.coding), stat: `${best((r) => r.breakdown.coding)?.breakdown.coding?.toFixed(0)}` },
    { icon: '🤖', title: 'Best Agent', r: best((r) => r.breakdown.agentic), stat: `${best((r) => r.breakdown.agentic)?.breakdown.agentic?.toFixed(0)}` },
    { icon: '⚡', title: 'Fastest', r: best((r) => r.model.speed.outputTps), stat: fmtSpeed(best((r) => r.model.speed.outputTps)?.model.speed.outputTps ?? null) },
    { icon: '💰', title: 'Best Value', r: best((r) => r.breakdown.value), stat: `${best((r) => r.breakdown.value)?.breakdown.value?.toFixed(0)}` },
    { icon: '📐', title: 'Biggest Context', r: best((r) => r.model.context), stat: fmtContext(best((r) => r.model.context)?.model.context ?? 0) },
    { icon: '🔓', title: 'Best Open', r: best((r) => r.model.license === 'open' ? r.breakdown.composite : null), stat: `${best((r) => r.model.license === 'open' ? r.breakdown.composite : null)?.breakdown.composite.toFixed(0)}` },
    { icon: '🆕', title: 'Newest', r: [...ranked].sort((a, b) => new Date(b.model.release).getTime() - new Date(a.model.release).getTime())[0], stat: '' },
  ];

  return `<div class="section-title">🏆 Best by Use-Case</div>
    <div class="cards-grid">${cards.map((c) => bestCard(c.icon, c.title, c.r, c.stat)).join('')}</div>`;
}

function bestCard(icon: string, title: string, r: RankedModel | undefined, stat: string): string {
  if (!r) return '';
  return `<div class="card" data-model="${r.model.id}">
    <div class="card-head"><span class="card-icon">${icon}</span><div class="card-title">${title}</div></div>
    <div class="card-model">${esc(r.model.name)}</div>
    <div class="card-detail">${esc(r.model.provider)} · ${stat ? `<b style="color:var(--accent)">${stat}</b>` : ''}</div>
  </div>`;
}
