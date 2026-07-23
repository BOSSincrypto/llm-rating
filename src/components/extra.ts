import type { RankedModel } from '../lib/scoring';
import { fmtPrice, fmtSpeed, fmtContext, fmtDate, esc, providerInitials, tier } from '../lib/format';
import { barRow } from '../charts/svg';

export function renderCompare(ranked: RankedModel[], compareIds: string[]): string {
  const selected = compareIds.map((id) => ranked.find((r) => r.model.id === id)).filter(Boolean) as RankedModel[];
  if (!selected.length) {
    return `<div class="compare-empty"><div style="font-size:48px;margin-bottom:12px">⚖️</div>
      <h3>Compare Models Side-by-Side</h3>
      <p>Toggle models in the leaderboard (click the row) to add them here — up to 4 at once.</p></div>`;
  }
  const cols = selected.map((r) => {
    const m = r.model;
    const t = tier(r.breakdown.composite);
    return `<div class="compare-col">
      <div class="card-head"><div class="avatar" style="background:${m.providerColor}">${providerInitials(m.provider)}</div>
        <div><div class="card-model">${esc(m.name)}</div><div class="card-title">${esc(m.provider)}</div></div></div>
      <div style="text-align:center;margin:8px 0"><span class="tier-badge tier-${t}" style="width:36px;height:36px;font-size:18px">${t}</span>
        <div class="detail-value" style="font-size:22px">${r.breakdown.composite.toFixed(1)}</div><div class="detail-label">composite</div></div>
      ${barRow('Intel', r.breakdown.intelligence ?? 0, 100, '#8b5cf6')}
      ${barRow('Code', r.breakdown.coding ?? 0, 100, '#22c55e')}
      ${barRow('Agent', r.breakdown.agentic ?? 0, 100, '#6366f1')}
      ${barRow('Speed', r.breakdown.speed ?? 0, 100, '#06b6d4')}
      ${barRow('Value', r.breakdown.value ?? 0, 100, '#f59e0b')}
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
        <div class="detail-grid" style="grid-template-columns:1fr 1fr">
          <div><div class="detail-label">Out $/M</div><div class="detail-value" style="font-size:13px">${fmtPrice(m.pricing.output)}</div></div>
          <div><div class="detail-label">Speed</div><div class="detail-value" style="font-size:13px">${fmtSpeed(m.speed.outputTps)}</div></div>
          <div><div class="detail-label">Context</div><div class="detail-value" style="font-size:13px">${fmtContext(m.context)}</div></div>
          <div><div class="detail-label">Released</div><div class="detail-value" style="font-size:13px">${fmtDate(m.release)}</div></div>
        </div></div>
      <button class="preset-btn" style="width:100%;margin-top:8px" data-remove-compare="${m.id}">✕ Remove</button>
    </div>`;
  }).join('');
  return `<div class="section-title">⚖️ Compare (${selected.length}/4)</div><div class="compare-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${cols}</div>`;
}
