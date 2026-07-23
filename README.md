<div align="center">

# 📊 LLM Rating

### The Unified LLM Leaderboard — All major AI model rankings in one place

[![Deploy](https://github.com/BOSSincrypto/llm-rating/actions/workflows/deploy.yml/badge.svg)](https://github.com/BOSSincrypto/llm-rating/actions/workflows/deploy.yml)
[![Data Refresh](https://github.com/BOSSincrypto/llm-rating/actions/workflows/refresh-data.yml/badge.svg)](https://github.com/BOSSincrypto/llm-rating/actions/workflows/refresh-data.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/badge/gzip-~19KB-success)](#)
[![Models](https://img.shields.io/badge/models-38+-blue)](#)
[![Sources](https://img.shields.io/badge/sources-8-purple)](#)
[![Data](https://img.shields.io/badge/data-as%20of%2020.07.2026-brightgreen)](#)

**🌐 [llm-rating.bossincrypto.dev](https://llm-rating.bossincrypto.dev)**

</div>

---

> Aggregate, normalise, and compare every major LLM benchmark — **Chatbot Arena**, **Artificial Analysis**, **Vellum**, **Aider**, **LiveBench**, **EQ-Bench**, **Scale SEAL** and the **Open LLM Leaderboard** — into a single interactive dashboard with transparent composite scoring, adjustable weights, value analysis, and side-by-side comparison.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏆 **Unified Leaderboard** | 38+ models ranked by a transparent composite score (0–100) with S/A/B/C/D tiers |
| 🎛️ **Adjustable Weights** | Drag sliders for Intelligence, Coding, Agentic, Speed, Value & Context — the ranking recalculates live. 6 presets included. |
| 🎯 **Value Quadrant** | Interactive scatter plot: Intelligence vs Price (log scale) — find the best bang-for-buck |
| 📊 **Analytics** | Market breakdown by provider, open vs proprietary share, price/performance bars |
| ⚖️ **Side-by-Side Compare** | Stack up to 4 models with normalised bar charts across all dimensions |
| 🔍 **Powerful Filters** | Search, provider, license (open/proprietary), modality, reasoning toggle |
| 🏆 **Best-by-Use-Case** | Smartest, Best Coder, Best Agent, Fastest, Best Value, Biggest Context, Best Open, Newest |
| 📐 **Transparent Methodology** | Every score is traceable to its source benchmark with full normalisation logic documented |
| 🌗 **Dark/Light Theme** | Full theming with system preference, persisted in localStorage |
| 📱 **Responsive & Offline** | Works on any screen size; all data is bundled — no server needed |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages (static)                 │
│                  llm-rating.bossincrypto.dev             │
├─────────────────────────────────────────────────────────┤
│  index.html  ──▶  src/main.ts (entry)                   │
│                      │                                   │
│           ┌──────────┼──────────────┐                    │
│           ▼          ▼              ▼                    │
│      lib/store   lib/scoring   components/*              │
│      (state)   (normalise+    (render fns)               │
│                  composite)         │                    │
│           │          │              │                    │
│           └──────────┴──────▶ src/data/                  │
│                              leaderboard.json            │
│                           (38 models, 8 sources)         │
├─────────────────────────────────────────────────────────┤
│  GitHub Actions: deploy.yml · refresh-data.yml · release │
└─────────────────────────────────────────────────────────┘
```

**Zero runtime dependencies.** Pure vanilla TypeScript compiled by Vite to a single ~19 KB gzipped bundle.

## 🔗 Data Sources

| Source | What it measures | Metric |
|--------|-----------------|--------|
| [LMArena](https://lmarena.ai/) | Crowd-sourced blind A/B battles | Arena Elo |
| [Artificial Analysis](https://artificialanalysis.ai/) | Independent Intelligence Index v4.1 | Intel. Index |
| [Vellum](https://www.vellum.ai/llm-leaderboard) | HLE, GPQA, SWE-Bench, OSWorld, BrowseComp | HLE % |
| [Aider](https://aider.chat/docs/leaderboards/) | 225 multi-language coding tasks | Polyglot % |
| [Open LLM Leaderboard](https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard) | Open-weights: IFEval, BBH, MATH, GPQA | Avg Score |
| [LiveBench](https://livebench.ai/) | Contamination-free monthly fresh questions | Live Score |
| [EQ-Bench](https://eqbench.com/) | Emotional intelligence & creative writing | EQ Elo |
| [Scale SEAL](https://scale.com/leaderboard) | Private non-public benchmarks | SEAL Score |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/BOSSincrypto/llm-rating.git
cd llm-rating

# Install (zero runtime deps — only TypeScript + Vite as dev deps)
npm install

# Dev server
npm run dev

# Production build → dist/
npm run build

# Validate the dataset
npm run data:check
```

## 🧮 Scoring Methodology

Each model is scored across **6 dimensions**, normalised to 0–100, combined with user-adjustable weights:

| Dimension | Inputs |
|-----------|--------|
| 🧠 **Intelligence** | Humanity's Last Exam · GPQA Diamond · AA Intelligence Index |
| 💻 **Coding** | SWE-Bench Verified · Aider Polyglot (225 tasks) |
| 🤖 **Agentic** | OSWorld · BrowseComp · Terminal-Bench |
| ⚡ **Speed** | Output tokens/sec + TTFT (log-normalised) |
| 💰 **Value** | 50% intelligence + 50% inverse output price |
| 📐 **Context** | Max context window (log-normalised) |

**Tiers:** S (85+) · A (70+) · B (55+) · C (40+) · D (<40). See the [Methodology](https://llm-rating.bossincrypto.dev) tab on the site for full details.

## 🛠️ Tech Stack

- **TypeScript** (strict mode, ES2022) — type-safe with zero `any`
- **Vite 6** — dev server + esbuild minification only
- **Vanilla DOM** — no React/Vue/Svelte, no runtime framework
- **Custom SVG charts** — no Chart.js/D3 dependency
- **GitHub Actions** — automated deploy, weekly data refresh, release on tag
- **GitHub Pages** — free static hosting with custom domain

## 🤝 Contributing

1. Fork the repo
2. Add or update model data in `src/data/leaderboard.json`
3. Run `npm run data:check` to validate
4. Open a PR

Data contributions are especially welcome — add a model with its benchmark scores and source rankings!

## 📄 License

[MIT](LICENSE) © 2026 [BOSSincrypto](https://github.com/BOSSincrypto)

---

<div align="center">

# 📊 LLM Rating (Русская версия)

### Единый лидерборд LLM — все рейтинги ИИ-моделей в одном месте

**🌐 [llm-rating.bossincrypto.dev](https://llm-rating.bossincrypto.dev)**

</div>

Агрегация, нормализация и сравнение всех основных бенчмарков LLM — **Chatbot Arena**, **Artificial Analysis**, **Vellum**, **Aider**, **LiveBench**, **EQ-Bench**, **Scale SEAL** и **Open LLM Leaderboard** — в едином интерактивном дашборде с прозрачным композитным скорингом, настраиваемыми весами, анализом ценности и пошаговым сравнением.

### Основные возможности

- 🏆 **Единый лидерборд** — 38+ моделей, рейтинг 0–100 с тирами S/A/B/C/D
- 🎛️ **Настраиваемые веса** — перетаскивайте ползунки (Интеллект, Код, Агентность, Скорость, Ценность, Контекст), рейтинг пересчитывается в реальном времени
- 🎯 **Карта ценности** — интерактивный scatter: Интеллект vs Цена (лог. шкала)
- 📊 **Аналитика** — разбивка по провайдерам, open vs proprietary, цена/качество
- ⚖️ **Сравнение** — до 4 моделей рядом с нормализованными графиками
- 🔍 **Фильтры** — поиск, провайдер, лицензия, модальность, reasoning
- 📐 **Прозрачная методология** — каждый балл отслеживается до исходного бенчмарка

### Технологии

Vanilla TypeScript + Vite, без runtime-зависимостей. Бандл ~19 KB gzip. Деплой на GitHub Pages через GitHub Actions с еженедельным автообновлением данных.

<div align="center">

**⭐ Если проект полезен — поставьте звезду!**

`#llm` `#leaderboard` `#ai` `#benchmark` `#chatbot-arena` `#gpt` `#claude` `#gemini` `#github-pages` `#static-site` `#analytics` `#open-source` `#typescript` `#data-visualization`

</div>

