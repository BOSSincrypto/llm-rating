import type { FilterState, Weights } from '../types';
import { WEIGHT_PRESETS } from '../lib/scoring';
import { esc } from '../lib/format';

export function renderControls(
  filters: FilterState,
  weights: Weights,
  providers: string[],
  activePreset: string
): string {
  const provChips = providers
    .map((p) => `<span class="chip ${filters.providers.includes(p) ? 'active' : ''}" data-filter="provider" data-val="${esc(p)}">${esc(p)}</span>`)
    .join('');

  const licChips = (['all', 'open', 'proprietary'] as const)
    .map((l) => `<span class="chip ${filters.license === l ? 'active' : ''}" data-filter="license" data-val="${l}">${l === 'all' ? 'All' : l === 'open' ? '🔓 Open' : '🔒 Proprietary'}</span>`)
    .join('');

  const modChips = (['text', 'vision', 'code', 'agent'] as const)
    .map((m) => `<span class="chip ${filters.modalities.includes(m) ? 'active' : ''}" data-filter="modality" data-val="${m}">${m}</span>`)
    .join('');

  const reasonChips = (['all', 'yes', 'no'] as const)
    .map((r) => `<span class="chip ${filters.reasoning === r ? 'active' : ''}" data-filter="reasoning" data-val="${r}">${r === 'all' ? 'All' : r === 'yes' ? '🧠 Reasoning' : '⚡ Non-reasoning'}</span>`)
    .join('');

  const wEntries: [keyof Weights, string][] = [
    ['intelligence', '🧠 Intelligence'], ['coding', '💻 Coding'], ['agentic', '🤖 Agentic'],
    ['speed', '⚡ Speed'], ['value', '💰 Value'], ['context', '📐 Context'],
  ];
  const sliders = wEntries
    .map(([key, label]) => `<div class="weight-row">
      <label>${label} <b>${weights[key]}%</b></label>
      <input type="range" min="0" max="60" value="${weights[key]}" data-weight="${key}"/>
    </div>`).join('');

  const presets = Object.entries(WEIGHT_PRESETS)
    .map(([k, p]) => `<span class="preset-btn ${k === activePreset ? 'active' : ''}" data-preset="${k}">${p.icon} ${p.label}</span>`)
    .join('');

  return `<div class="controls">
    <div class="panel">
      <div class="search-box"><span class="ico">🔍</span>
        <input type="text" id="search" placeholder="Search models or providers…" value="${esc(filters.query)}"/>
      </div>
      <div class="chip-group"><div class="chip-group-label">License</div><div class="filter-chips">${licChips}</div></div>
      <div class="chip-group"><div class="chip-group-label">Modality</div><div class="filter-chips">${modChips}</div></div>
      <div class="chip-group"><div class="chip-group-label">Reasoning</div><div class="filter-chips">${reasonChips}</div></div>
      <div class="chip-group"><div class="chip-group-label">Provider</div><div class="filter-chips">${provChips}</div></div>
    </div>
    <div class="panel">
      <div class="panel-title">🎛️ Score Weights — drag to re-rank</div>
      <div class="preset-row">${presets}</div>
      ${sliders}
    </div>
  </div>`;
}

export function matchPreset(weights: Weights): string {
  for (const [k, p] of Object.entries(WEIGHT_PRESETS)) {
    if (k === 'balanced') continue;
    const match = (Object.keys(weights) as (keyof Weights)[]).every(
      (key) => weights[key] === p[key]
    );
    if (match) return k;
  }
  return '';
}
