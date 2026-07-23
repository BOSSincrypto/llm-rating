import type { SourceMeta } from '../types';
import type { RankedModel } from '../lib/scoring';
import type { ViewId } from '../lib/store';
import { fmtPrice, fmtSpeed, fmtDate, esc } from '../lib/format';

const NAV: { id: ViewId; label: string; icon: string }[] = [
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'value', label: 'Value Map', icon: '🎯' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'compare', label: 'Compare', icon: '⚖️' },
  { id: 'sources', label: 'Sources', icon: '🔗' },
  { id: 'methodology', label: 'Method', icon: '📐' },
];

export function renderNav(active: ViewId, compareCount: number): string {
  const tabs = NAV.map((t) =>
    `<button class="nav-tab ${t.id === active ? 'active' : ''}" data-view="${t.id}">${t.icon} ${t.label}${t.id === 'compare' && compareCount ? ` <span style="opacity:.7">(${compareCount})</span>` : ''}</button>`
  ).join('');
  return `<header class="header"><div class="header-inner">
    <a class="logo" href="#" data-view="leaderboard"><span class="logo-mark">📊</span><span>LLM&nbsp;Rating</span></a>
    <nav class="nav-tabs">${tabs}</nav>
    <button class="icon-btn" id="theme-toggle" title="Toggle theme">🌙</button>
  </div></header>`;
}

export function renderHero(asOf: string, modelCount: number, sourceCount: number): string {
  return `<section class="hero">
    <h1>The Unified LLM Leaderboard</h1>
    <p>All major AI model rankings — ${sourceCount} leaderboards, ${modelCount} models — in one place</p>
    <div class="asof"><span class="dot"></span> Data accurate as of ${fmtDate(asOf)} · auto-refreshed weekly</div>
  </section>`;
}

export function renderStatsBar(ranked: RankedModel[], sources: SourceMetaMeta2[]): string {
  const open = ranked.filter((r) => r.model.license === 'open').length;
  const prop = ranked.length - open;
  const cheapest = [...ranked].filter((r) => r.model.pricing.output !== null).sort((a, b) => a.model.pricing.output! - b.model.pricing.output!)[0];
  const fastest = [...ranked].filter((r) => r.model.speed.outputTps !== null).sort((a, b) => b.model.speed.outputTps! - a.model.speed.outputTps!)[0];
  const newest = [...ranked].sort((a, b) => new Date(b.model.release).getTime() - new Date(a.model.release).getTime())[0];
  return `<div class="stats-bar">
    <div class="stat-pill"><b>${ranked.length}</b><span>models tracked</span></div>
    <div class="stat-pill"><b>${sources.length}</b><span>data sources</span></div>
    <div class="stat-pill"><b>${open}</b><span>open · ${prop} proprietary</span></div>
    <div class="stat-pill"><b>${cheapest ? fmtPrice(cheapest.model.pricing.output) : '—'}</b><span>cheapest/M · ${cheapest ? esc(cheapest.model.name) : ''}</span></div>
    <div class="stat-pill"><b>${fastest ? fmtSpeed(fastest.model.speed.outputTps) : '—'}</b><span>fastest · ${fastest ? esc(fastest.model.name) : ''}</span></div>
    <div class="stat-pill"><b>${newest ? fmtDate(newest.model.release) : '—'}</b><span>newest · ${newest ? esc(newest.model.name) : ''}</span></div>
  </div>`;
}

type SourceMetaMeta2 = SourceMeta;
