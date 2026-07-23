import type { RankedModel } from '../lib/scoring';
import {
  fmtPrice, fmtContext, fmtScore, tier, providerInitials, esc,
} from '../lib/format';

export type SortKey = 'rank' | 'score' | 'intelligence' | 'coding' | 'agentic' | 'speed' | 'value' | 'price' | 'context';

interface Col { key: SortKey; label: string; }

const COLS: Col[] = [
  { key: 'score', label: 'Score' }, { key: 'intelligence', label: 'Intel' },
  { key: 'coding', label: 'Code' }, { key: 'agentic', label: 'Agent' },
  { key: 'speed', label: 'Speed' }, { key: 'value', label: 'Value' },
  { key: 'price', label: 'Out $/M' }, { key: 'context', label: 'Ctx' },
];

export function renderLeaderboard(ranked: RankedModel[], sort: SortKey, sortDir: 1 | -1): string {
  const headers = COLS.map((c) => {
    const active = sort === c.key;
    const arrow = active ? (sortDir === 1 ? ' ↑' : ' ↓') : '';
    return `<th data-sort="${c.key}" style="text-align:right">${c.label}${active ? `<span class="sort-arrow">${arrow.trim()}</span>` : ''}</th>`;
  }).join('');

  const rows = ranked.map((r) => {
    const m = r.model;
    const t = tier(r.breakdown.composite);
    const ageDays = new Date(m.release) > new Date('2026-07-01') ? ' 🆕' : '';
    return `<tr data-model="${m.id}">
      <td class="rank-cell ${r.rank <= 3 ? 'top' : ''}">${r.rank}</td>
      <td><div class="model-cell">
        <div class="avatar" style="background:${m.providerColor}">${providerInitials(m.provider)}</div>
        <div><div class="model-name">${esc(m.name)}${ageDays}</div>
          <div class="model-meta">
            <span class="badge badge-${m.license === 'open' ? 'open' : 'prop'}">${m.license === 'open' ? '🔓' : '🔒'} ${m.license}</span>
            ${m.reasoning ? '<span class="badge badge-reason">🧠</span>' : ''}
            <span>${esc(m.provider)}</span>
          </div></div>
      </div></td>
      <td class="score-cell"><span class="tier-badge tier-${t}">${t}</span> ${fmtScore(r.breakdown.composite)}</td>
      ${scoreCell(r.breakdown.intelligence)}${scoreCell(r.breakdown.coding)}${scoreCell(r.breakdown.agentic)}
      ${scoreCell(r.breakdown.speed)}${scoreCell(r.breakdown.value)}
      <td class="num-cell">${fmtPrice(m.pricing.output)}</td>
      <td class="num-cell">${fmtContext(m.context)}</td>
    </tr>`;
  }).join('');

  return `<div class="lb-wrap"><table class="leaderboard">
    <thead><tr><th style="text-align:center">#</th><th style="text-align:left">Model</th>${headers}</tr></thead>
    <tbody>${rows || '<tr><td colspan="10" class="empty-msg">No models match your filters.</td></tr>'}</tbody>
  </table></div>`;
}

function scoreCell(v: number | null): string {
  if (v === null) return '<td class="num-cell">—</td>';
  const w = Math.max(2, v);
  return `<td class="num-cell">${v.toFixed(0)}<span class="mini-bar"><div style="width:${w}%;background:${barColor(v)}"></div></span></td>`;
}

function barColor(v: number): string {
  if (v >= 70) return '#22c55e';
  if (v >= 45) return '#6366f1';
  return '#5a6378';
}
