// Core type definitions for the Unified LLM Leaderboard

export type License = 'open' | 'proprietary';

export type Modality = 'text' | 'vision' | 'code' | 'audio' | 'image-gen' | 'agent';

export interface Pricing {
  /** USD per 1M input tokens */
  input: number | null;
  /** USD per 1M output tokens */
  output: number | null;
}

export interface Speed {
  /** output tokens per second */
  outputTps: number | null;
  /** time-to-first-token in seconds */
  latencySec: number | null;
}

/** A single source's ranking/score for a model */
export interface SourceScore {
  /** source id, e.g. 'lmarena' */
  id: SourceId;
  /** raw metric value (Elo, %, index) */
  value: number;
  /** rank within that source's leaderboard, 1-based */
  rank: number;
  /** short label for the metric, e.g. "Elo", "HLE %", "Intelligence Index" */
  metric: string;
}

export type SourceId =
  | 'lmarena'
  | 'artificialAnalysis'
  | 'openLLM'
  | 'vellum'
  | 'aider'
  | 'livebench'
  | 'eqbench'
  | 'seal';

export interface BenchmarkScores {
  /** Human-Level / hardest academic exam (Vellum, %) */
  hle?: number | null;
  /** GPQA Diamond graduate science (% ) */
  gpqa?: number | null;
  /** SWE-Bench Verified agentic coding (%) */
  sweBench?: number | null;
  /** OSWorld computer-use (%) */
  osWorld?: number | null;
  /** BrowseComp web browsing (%) */
  browseComp?: number | null;
  /** Terminal-Bench (%) */
  terminalBench?: number | null;
  /** Humanity's Last Exam / composite intelligence */
  /** Aider polyglot code-editing (%) */
  aiderPolyglot?: number | null;
  /** EQ-Bench emotional intelligence Elo */
  eqElo?: number | null;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  providerColor: string;
  release: string; // ISO date
  license: License;
  modalities: Modality[];
  reasoning: boolean;
  context: number; // max context window in tokens
  pricing: Pricing;
  speed: Speed;
  /** benchmark scores normalised to comparable scales */
  benchmarks: BenchmarkScores;
  /** per-source scores/ranks */
  sources: SourceScore[];
  url: string;
  blurb?: string;
}

export interface SourceMeta {
  id: SourceId;
  name: string;
  short: string;
  url: string;
  /** what the source measures */
  focus: string;
  color: string;
  /** the primary metric label shown in UI */
  metricLabel: string;
  /** min/max for normalisation */
  range: [number, number];
  /** whether higher = better (true) or lower = better (false) */
  higherBetter: boolean;
}

export interface DataSnapshot {
  asOf: string; // ISO date string "data accurate as of"
  generatedAt: string; // when the dataset was compiled
  models: Model[];
  sources: SourceMeta[];
}

/** user-adjustable weights for the composite score */
export interface Weights {
  intelligence: number;
  coding: number;
  agentic: number;
  speed: number;
  value: number; // price-performance
  context: number;
}

/** filter state */
export interface FilterState {
  query: string;
  providers: string[];
  license: License | 'all';
  modalities: Modality[];
  reasoning: 'all' | 'yes' | 'no';
  maxPriceOut: number | null; // max output $/1M
  minContext: number | null;
  sources: SourceId[]; // empty = all
}
