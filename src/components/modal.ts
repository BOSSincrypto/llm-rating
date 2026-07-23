import type { SourceMeta } from '../types';
import type { RankedModel } from '../lib/scoring';
import {
  fmtPrice, fmtSpeed, fmtContext, fmtPct, fmtScore, fmtDate,
  tier, providerInitials, esc,
} from '../lib/format';

export function renderModal(r: RankedModel | null, sources: SourceMeta[]): string {
  if (!r) return '';
  const m = r.model;
  const t = tier(r.breakdown.composite);
  const srcMap = new Map(sources.map((s) => [s.id, s]));
  const sourceRows = m.sources.map((s) => {
    const meta = srcMap.get(s.id);
    return `<div class="source-row">
      <span class="source-dot" style="background:${meta?.color || '#888'}"></span>
      <div><div class="source-name">${meta?.short || s.id}</div><div class="source-metric">${s.metric}</div></div>
      <span class="source-value">${s.value}</span><span class="source-rank">#${s.rank}</span>
    </div>`;
  }).join('');

  const benchRows = Object.entries(m.benchmarks)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `${benchLabel(k)}: <b>${fmtPct(v)}</b>`).join(' · ');

  return `<div class="modal-overlay" id="modal-overlay"><div class="modal">
    <div class="modal-header">
      <div class="avatar" style="background:${m.providerColor};width:42px;height:42px;border-radius:10px;font-size:14px">${providerInitials(m.provider)}</div>
      <div><div style="font-size:20px;font-weight:800">${esc(m.name)}</div>
        <div class="model-meta" style="margin-top:2px">
          <span class="badge badge-${m.license === 'open' ? 'open' : 'prop'}">${m.license}</span>
          ${m.reasoning ? '<span class="badge badge-reason">🧠 Reasoning</span>' : ''}
          <span>${esc(m.provider)} · ${fmtDate(m.release)}</span>
        </div></div>
      <button class="modal-close" id="modal-close">✕</button>
    </div>
    <div class="modal-body">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">
        <span class="tier-badge tier-${t}" style="width:40px;height:40px;font-size:20px">${t}</span>
        <div><div class="detail-label">Composite Score</div><div class="detail-value" style="font-size:24px">${fmtScore(r.breakdown.composite)}<span style="font-size:13px;color:var(--text-faint)"> / 100</span></div></div>
        <div style="margin-left:auto"><a href="${m.url}" target="_blank" rel="noopener" class="chip active">↗ Provider</a></div>
      </div>
      ${m.blurb ? `<p style="color:var(--text-dim);font-size:13px;margin-bottom:8px">${esc(m.blurb)}</p>` : ''}
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">Input $/1M</div><div class="detail-value">${fmtPrice(m.pricing.input)}</div></div>
        <div class="detail-item"><div class="detail-label">Output $/1M</div><div class="detail-value">${fmtPrice(m.pricing.output)}</div></div>
        <div class="detail-item"><div class="detail-label">Speed</div><div class="detail-value">${fmtSpeed(m.speed.outputTps)}</div></div>
        <div class="detail-item"><div class="detail-label">Context</div><div class="detail-value">${fmtContext(m.context)}</div></div>
      </div>
      ${benchRows ? `<div style="font-size:12px;color:var(--text-dim);margin:10px 0;padding:10px;background:var(--bg-elev);border-radius:8px">${benchRows}</div>` : ''}
      ${sourceRows ? `<div class="panel-title" style="margin-top:14px">📊 Cross-Source Rankings</div><div class="source-list">${sourceRows}</div>` : '<div class="empty-msg" style="padding:20px">No detailed source data yet.</div>'}
    </div>
  </div></div>`;
}

function benchLabel(k: string): string {
  const map: Record<string, string> = {
    hle: "Humanity's Last Exam", gpqa: 'GPQA Diamond', sweBench: 'SWE-Bench',
    osWorld: 'OSWorld', browseComp: 'BrowseComp', terminalBench: 'Terminal-Bench',
    aiderPolyglot: 'Aider Polyglot', eqElo: 'EQ-Bench Elo',
  };
  return map[k] || k;
}
