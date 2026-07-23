import type { SourceMeta } from '../types';
import type { RankedModel } from '../lib/scoring';
import { esc } from '../lib/format';

export function renderSources(sources: SourceMeta[], ranked: RankedModel[]): string {
  const cards = sources.map((s) => {
    const modelCount = ranked.filter((r) => r.model.sources.some((ms) => ms.id === s.id)).length;
    const topModel = ranked.find((r) => r.model.sources.some((ms) => ms.id === s.id && ms.rank === 1));
    return `<div class="card" style="cursor:default">
      <div class="card-head"><span class="source-dot" style="background:${s.color};width:14px;height:14px"></span>
        <div class="card-model">${s.name}</div></div>
      <p style="font-size:13px;color:var(--text-dim);margin:6px 0">${s.focus}</p>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        <span class="chip active">${modelCount} models</span><span class="chip">${s.metricLabel}</span></div>
      ${topModel ? `<div class="card-detail" style="margin-top:8px">#1: <b>${esc(topModel.model.name)}</b></div>` : ''}
      <a href="${s.url}" target="_blank" rel="noopener" class="preset-btn" style="display:inline-block;margin-top:8px">↗ Visit</a>
    </div>`;
  }).join('');
  return `<div class="section-title">🔗 Data Sources (${sources.length})</div>
    <p style="color:var(--text-dim);margin-bottom:16px;font-size:14px">This dashboard aggregates rankings from the world's leading independent LLM evaluation platforms. Each measures models differently — together they paint a holistic picture.</p>
    <div class="cards-grid">${cards}</div>`;
}

export function renderMethodology(): string {
  return `<div class="section-title">📐 Methodology</div>
    <div class="panel" style="max-width:800px">
      <h3 style="margin-bottom:8px">How the Composite Score Works</h3>
      <p style="color:var(--text-dim);font-size:14px;margin-bottom:16px">Each model is scored across <b>6 dimensions</b>, normalised to 0–100, then combined using user-adjustable weights into a composite score. Models are tiered S/A/B/C/D.</p>
      <div class="detail-grid" style="grid-template-columns:1fr">
        <div class="detail-item"><div class="detail-label">🧠 Intelligence</div><div style="font-size:13px;color:var(--text-dim)">Avg of HLE, GPQA Diamond & AA Intelligence Index v4.1 (normalised).</div></div>
        <div class="detail-item"><div class="detail-label">💻 Coding</div><div style="font-size:13px;color:var(--text-dim)">Avg of SWE-Bench Verified & Aider Polyglot (225 multi-language tasks).</div></div>
        <div class="detail-item"><div class="detail-label">🤖 Agentic</div><div style="font-size:13px;color:var(--text-dim)">Avg of OSWorld, BrowseComp & Terminal-Bench.</div></div>
        <div class="detail-item"><div class="detail-label">⚡ Speed</div><div style="font-size:13px;color:var(--text-dim)">Log-normalised blend of output tokens/sec & TTFT latency.</div></div>
        <div class="detail-item"><div class="detail-label">💰 Value</div><div style="font-size:13px;color:var(--text-dim)">50% intelligence + 50% inverse output price (log-normalised).</div></div>
        <div class="detail-item"><div class="detail-label">📐 Context</div><div style="font-size:13px;color:var(--text-dim)">Log-normalised max context window in tokens.</div></div>
      </div>
      <h3 style="margin:20px 0 8px">Tiering</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="chip"><span class="tier-badge tier-S" style="margin-right:4px">S</span> 85+</span>
        <span class="chip"><span class="tier-badge tier-A" style="margin-right:4px">A</span> 70+</span>
        <span class="chip"><span class="tier-badge tier-B" style="margin-right:4px">B</span> 55+</span>
        <span class="chip"><span class="tier-badge tier-C" style="margin-right:4px">C</span> 40+</span>
        <span class="chip"><span class="tier-badge tier-D" style="margin-right:4px">D</span> &lt;40</span>
      </div>
      <h3 style="margin:20px 0 8px">Data Freshness & Caveats</h3>
      <p style="color:var(--text-dim);font-size:14px">Data is compiled from live leaderboards and <b>refreshed weekly</b> via GitHub Actions. Models with missing benchmark data receive a conservative mid-score (35) so they aren't unfairly penalised. Scores are estimates based on publicly available data — always consult original sources for authoritative rankings.</p>
    </div>`;
}
