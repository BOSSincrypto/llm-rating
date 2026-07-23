import type { Model, SourceMeta, Weights } from '../types';

/** Min-max normalise a list of values to 0–100. nulls are skipped. */
export function normalise(
  values: (number | null | undefined)[],
  min: number,
  max: number,
  higherBetter = true
): (number | null)[] {
  if (max === min) return values.map(() => 50);
  return values.map((v) => {
    if (v === null || v === undefined) return null;
    let norm = ((v - min) / (max - min)) * 100;
    if (!higherBetter) norm = 100 - norm;
    return Math.max(0, Math.min(100, norm));
  });
}

/** Normalise using log10 spread — for metrics with huge ranges (price, speed, context). */
export function normaliseLog(
  values: (number | null | undefined)[],
  higherBetter = true
): (number | null)[] {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && v > 0);
  if (!valid.length) return values.map(() => null);
  const logs = valid.map((v) => Math.log10(v));
  const min = Math.min(...logs);
  const max = Math.max(...logs);
  if (max === min) return values.map(() => 50);
  return values.map((v) => {
    if (v === null || v === undefined || v <= 0) return null;
    let norm = ((Math.log10(v) - min) / (max - min)) * 100;
    if (!higherBetter) norm = 100 - norm;
    return Math.max(0, Math.min(100, norm));
  });
}

function avg(vals: (number | null)[]): number | null {
  const valid = vals.filter((v): v is number => v !== null);
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export interface ScoreBreakdown {
  intelligence: number | null;
  coding: number | null;
  agentic: number | null;
  speed: number | null;
  value: number | null;
  context: number | null;
  composite: number;
}

export interface RankedModel {
  model: Model;
  breakdown: ScoreBreakdown;
  rank: number;
}

/**
 * Compute per-category normalised scores + weighted composite for every model.
 */
export function scoreModels(
  models: Model[],
  sources: SourceMeta[],
  weights: Weights
): RankedModel[] {
  const srcMap = new Map(sources.map((s) => [s.id, s]));

  // --- raw per-model arrays ---
  const intelligenceRaw = models.map((m) => {
    const parts: number[] = [];
    if (m.benchmarks.hle != null) parts.push(m.benchmarks.hle);
    if (m.benchmarks.gpqa != null) parts.push(m.benchmarks.gpqa);
    const aa = m.sources.find((s) => s.id === 'artificialAnalysis');
    if (aa) {
      const meta = srcMap.get('artificialAnalysis')!;
      const ratio = (aa.value - meta.range[0]) / (meta.range[1] - meta.range[0]);
      parts.push(ratio * 65);
    }
    return parts.length ? avg(parts) : null;
  });

  const codingRaw = models.map((m) => {
    const parts: number[] = [];
    if (m.benchmarks.sweBench != null) parts.push(m.benchmarks.sweBench);
    if (m.benchmarks.aiderPolyglot != null) parts.push(m.benchmarks.aiderPolyglot);
    return parts.length ? avg(parts) : null;
  });

  const agenticRaw = models.map((m) => {
    const parts: number[] = [];
    if (m.benchmarks.osWorld != null) parts.push(m.benchmarks.osWorld);
    if (m.benchmarks.browseComp != null) parts.push(m.benchmarks.browseComp);
    if (m.benchmarks.terminalBench != null) parts.push(m.benchmarks.terminalBench);
    return parts.length ? avg(parts) : null;
  });

  const speedRaw = models.map((m) => m.speed.outputTps);
  const latencyRaw = models.map((m) => m.speed.latencySec);
  const contextRaw = models.map((m) => m.context);
  const priceOutRaw = models.map((m) => m.pricing.output);

  // --- normalise ---
  const intelligence = normalise(intelligenceRaw, 0, 100);
  const coding = normalise(codingRaw, 0, 100);
  const agentic = normalise(agenticRaw, 0, 100);
  const speedN = normaliseLog(speedRaw, true);
  const latencyN = normaliseLog(latencyRaw, false);
  const speedCombined = speedN.map((s, i) => avg([s, latencyN[i]]));
  const context = normaliseLog(contextRaw, true);
  const priceNorm = normaliseLog(priceOutRaw, false);

  const value = intelligence.map((intel, i) => {
    if (intel === null || priceNorm[i] === null) return null;
    return intel * 0.5 + priceNorm[i]! * 0.5;
  });

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const safe = (v: number | null) => (v === null ? 35 : v);

  const ranked = models.map((model, i) => {
    const breakdown: ScoreBreakdown = {
      intelligence: intelligence[i],
      coding: coding[i],
      agentic: agentic[i],
      speed: speedCombined[i],
      value: value[i],
      context: context[i],
      composite: 0,
    };
    breakdown.composite =
      (safe(breakdown.intelligence) * weights.intelligence +
        safe(breakdown.coding) * weights.coding +
        safe(breakdown.agentic) * weights.agentic +
        safe(breakdown.speed) * weights.speed +
        safe(breakdown.value) * weights.value +
        safe(breakdown.context) * weights.context) /
      totalWeight;
    return { model, breakdown, rank: 0 };
  });

  ranked.sort((a, b) => b.breakdown.composite - a.breakdown.composite);
  ranked.forEach((r, i) => (r.rank = i + 1));
  return ranked;
}

export const DEFAULT_WEIGHTS: Weights = {
  intelligence: 30, coding: 20, agentic: 15, speed: 10, value: 15, context: 10,
};

export interface WeightPreset extends Weights {
  label: string;
  icon: string;
}

export const WEIGHT_PRESETS: Record<string, WeightPreset> = {
  balanced: { label: 'Balanced', icon: '⚖️', ...DEFAULT_WEIGHTS },
  intelligence: { label: 'Max IQ', icon: '🧠', intelligence: 55, coding: 20, agentic: 15, speed: 5, value: 3, context: 2 },
  coding: { label: 'Coders', icon: '💻', intelligence: 15, coding: 50, agentic: 20, speed: 5, value: 5, context: 5 },
  budget: { label: 'Budget', icon: '💰', intelligence: 15, coding: 10, agentic: 5, speed: 20, value: 40, context: 10 },
  agentic: { label: 'Agents', icon: '🤖', intelligence: 20, coding: 15, agentic: 45, speed: 8, value: 7, context: 5 },
  speed: { label: 'Speed', icon: '⚡', intelligence: 10, coding: 5, agentic: 5, speed: 55, value: 15, context: 10 },
};
