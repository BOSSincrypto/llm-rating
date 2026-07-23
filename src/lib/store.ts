import type { Weights } from '../types';
import { DEFAULT_WEIGHTS } from './scoring';

const THEME_KEY = 'lr-theme';
const WEIGHTS_KEY = 'lr-weights';

export type Theme = 'dark' | 'light';

export type ViewId =
  | 'leaderboard'
  | 'value'
  | 'analytics'
  | 'compare'
  | 'sources'
  | 'methodology';

export interface AppState {
  view: ViewId;
  theme: Theme;
  weights: Weights;
  compareIds: string[];
}

type Listener = () => void;

class Store {
  private state: AppState;
  private listeners = new Set<Listener>();

  constructor() {
    this.state = {
      view: 'leaderboard',
      theme: this.loadTheme(),
      weights: this.loadWeights(),
      compareIds: [],
    };
  }

  private loadTheme(): Theme {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* SSR / no storage */
    }
    return 'dark';
  }

  private loadWeights(): Weights {
    try {
      const saved = localStorage.getItem(WEIGHTS_KEY);
      if (saved) return { ...DEFAULT_WEIGHTS, ...JSON.parse(saved) };
    } catch {
      /* ignore */
    }
    return { ...DEFAULT_WEIGHTS };
  }

  getState(): AppState {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  setView(view: ViewId): void {
    this.state = { ...this.state, view };
    this.notify();
  }

  toggleTheme(): void {
    this.state = {
      ...this.state,
      theme: this.state.theme === 'dark' ? 'light' : 'dark',
    };
    try {
      localStorage.setItem(THEME_KEY, this.state.theme);
    } catch {
      /* ignore */
    }
    this.applyTheme();
    this.notify();
  }

  setWeights(weights: Weights): void {
    this.state = { ...this.state, weights: { ...weights } };
    try {
      localStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
    } catch {
      /* ignore */
    }
    this.notify();
  }

  toggleCompare(id: string): void {
    const cur = this.state.compareIds;
    if (cur.includes(id)) {
      this.state = { ...this.state, compareIds: cur.filter((x) => x !== id) };
    } else if (cur.length < 4) {
      this.state = { ...this.state, compareIds: [...cur, id] };
    }
    this.notify();
  }

  applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.state.theme);
  }

  init(): void {
    this.applyTheme();
  }
}

export const store = new Store();
