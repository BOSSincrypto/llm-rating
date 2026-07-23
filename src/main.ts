import './styles/main.css';
import data from './data/leaderboard.json' with { type: 'json' };
import type { DataSnapshot, FilterState, Weights, Model, Modality } from './types';
import { scoreModels, WEIGHT_PRESETS } from './lib/scoring';
import { store, type ViewId } from './lib/store';
import { renderNav, renderHero, renderStatsBar } from './components/render';
import { renderControls, matchPreset } from './components/controls';
import { renderLeaderboard, type SortKey } from './components/table';
import { renderModal } from './components/modal';
import { renderValueMap, renderBestFor } from './components/views';
import { renderAnalytics } from './components/analytics';
import { renderCompare } from './components/extra';
import { renderSources, renderMethodology } from './components/info';

const snapshot = data as unknown as DataSnapshot;
let filters: FilterState = { query: '', providers: [], license: 'all', modalities: [], reasoning: 'all', maxPriceOut: null, minContext: null, sources: [] };
let sortKey: SortKey = 'rank';
let sortDir: 1 | -1 = 1;
let selectedModelId: string | null = null;

function applyFilters(models: Model[]): Model[] {
  return models.filter((m) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.provider.toLowerCase().includes(q)) return false;
    }
    if (filters.providers.length && !filters.providers.includes(m.provider)) return false;
    if (filters.license !== 'all' && m.license !== filters.license) return false;
    if (filters.modalities.length && !filters.modalities.every((mod) => m.modalities.includes(mod))) return false;
    if (filters.reasoning === 'yes' && !m.reasoning) return false;
    if (filters.reasoning === 'no' && m.reasoning) return false;
    return true;
  });
}

type Ranked = ReturnType<typeof scoreModels>;
function getSorted(ranked: Ranked): Ranked {
  if (sortKey === 'rank') return sortDir === 1 ? ranked : [...ranked].reverse();
  const getVal = (r: Ranked[number]): number => {
    if (sortKey === 'score') return r.breakdown.composite;
    if (sortKey === 'price') return r.model.pricing.output ?? 9999;
    if (sortKey === 'context') return r.model.context;
    return r.breakdown[sortKey as keyof typeof r.breakdown] ?? -1;
  };
  return [...ranked].sort((a, b) => (getVal(b) - getVal(a)) * sortDir);
}

function renderFooter(): string {
  return `<footer class="footer">
    <div class="src-row">${snapshot.sources.map((s) => `<a class="src-link" href="${s.url}" target="_blank" rel="noopener">${s.short}</a>`).join('')}</div>
    <p>LLM Rating · The Unified LLM Leaderboard · Data as of ${snapshot.asOf}</p>
    <p style="margin-top:4px">Vanilla TypeScript · zero runtime deps · <a href="https://github.com/BOSSincrypto/llm-rating" target="_blank" rel="noopener">GitHub</a> · MIT</p>
  </footer>`;
}

function render() {
  const state = store.getState();
  const filtered = applyFilters(snapshot.models);
  const ranked = getSorted(scoreModels(filtered, snapshot.sources, state.weights));
  const activePreset = matchPreset(state.weights);
  const providers = [...new Set(snapshot.models.map((m) => m.provider))].sort();
  const app = document.getElementById('app')!;
  let content = '';

  switch (state.view) {
    case 'leaderboard':
      content = renderHero(snapshot.asOf, snapshot.models.length, snapshot.sources.length)
        + renderStatsBar(ranked, snapshot.sources)
        + renderControls(filters, state.weights, providers, activePreset)
        + renderLeaderboard(ranked, sortKey, sortDir); break;
    case 'value':
      content = renderHero(snapshot.asOf, snapshot.models.length, snapshot.sources.length)
        + renderValueMap(ranked) + renderBestFor(ranked); break;
    case 'analytics':
      content = renderHero(snapshot.asOf, snapshot.models.length, snapshot.sources.length)
        + renderAnalytics(ranked); break;
    case 'compare':
      content = renderHero(snapshot.asOf, snapshot.models.length, snapshot.sources.length)
        + renderCompare(ranked, state.compareIds); break;
    case 'sources': content = renderSources(snapshot.sources, ranked); break;
    case 'methodology': content = renderMethodology(); break;
  }

  app.innerHTML = renderNav(state.view, state.compareIds.length) + `<main class="container">${content}</main>` + renderFooter();

  const modalEl = document.getElementById('modal-host')!;
  if (selectedModelId) {
    const all = scoreModels(snapshot.models, snapshot.sources, state.weights);
    modalEl.innerHTML = renderModal(all.find((x) => x.model.id === selectedModelId) ?? null, snapshot.sources);
  } else { modalEl.innerHTML = ''; }
  bindEvents();
}
function bindEvents() {
  const $ = <T extends HTMLElement = HTMLElement>(s: string): T | null => document.querySelector(s) as T | null;
  $('#theme-toggle')?.addEventListener('click', () => store.toggleTheme());
  document.querySelectorAll('[data-view]').forEach((el) =>
    el.addEventListener('click', (e) => { e.preventDefault(); store.setView((el as HTMLElement).dataset.view as ViewId); })
  );
  $('#search')?.addEventListener('input', (e) => {
    filters.query = (e.target as HTMLInputElement).value; render(); $('#search')?.focus();
  });
  document.querySelectorAll('.chip[data-filter]').forEach((el) =>
    el.addEventListener('click', () => {
      const t = el as HTMLElement; const type = t.dataset.filter!; const val = t.dataset.val!;
      if (type === 'license') filters.license = val as FilterState['license'];
      else if (type === 'reasoning') filters.reasoning = val as FilterState['reasoning'];
      else if (type === 'provider') filters.providers = filters.providers.includes(val) ? filters.providers.filter((p) => p !== val) : [...filters.providers, val];
      else if (type === 'modality') { const m = val as Modality; filters.modalities = filters.modalities.includes(m) ? filters.modalities.filter((x) => x !== m) : [...filters.modalities, m]; }
      render();
    })
  );
  document.querySelectorAll('input[data-weight]').forEach((el) =>
    el.addEventListener('input', () => {
      const key = (el as HTMLInputElement).dataset.weight as keyof Weights;
      store.setWeights({ ...store.getState().weights, [key]: +((el as HTMLInputElement).value) });
      render(); (document.querySelector(`input[data-weight="${key}"]`) as HTMLInputElement)?.focus();
    })
  );
  document.querySelectorAll('.preset-btn[data-preset]').forEach((el) =>
    el.addEventListener('click', () => {
      const p = WEIGHT_PRESETS[(el as HTMLElement).dataset.preset!];
      if (p) store.setWeights({ intelligence: p.intelligence, coding: p.coding, agentic: p.agentic, speed: p.speed, value: p.value, context: p.context });
      render();
    })
  );
  document.querySelectorAll('th[data-sort]').forEach((el) =>
    el.addEventListener('click', () => {
      const key = (el as HTMLElement).dataset.sort as SortKey;
      if (sortKey === key) sortDir = (sortDir === 1 ? -1 : 1); else { sortKey = key; sortDir = 1; }
      render();
    })
  );
  document.querySelectorAll('tr[data-model], .card[data-model]').forEach((el) =>
    el.addEventListener('click', () => { selectedModelId = (el as HTMLElement).dataset.model!; render(); })
  );
  document.querySelectorAll('.dot-group[data-id]').forEach((el) =>
    el.addEventListener('click', () => { selectedModelId = (el as HTMLElement).dataset.id!; render(); })
  );
  $('#modal-close')?.addEventListener('click', () => { selectedModelId = null; render(); });
  $('#modal-overlay')?.addEventListener('click', (e) => { if (e.target === $('#modal-overlay')) { selectedModelId = null; render(); } });
  document.querySelectorAll('[data-remove-compare]').forEach((el) =>
    el.addEventListener('click', () => { store.toggleCompare((el as HTMLElement).dataset.removeCompare!); render(); })
  );
}

store.init();
store.subscribe(render);
render();
