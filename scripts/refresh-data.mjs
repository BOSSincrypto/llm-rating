#!/usr/bin/env node
/**
 * Refreshes the leaderboard data timestamp.
 * 
 * This script updates the `generatedAt` field to today's date.
 * Extend it to fetch live data from public APIs/datasets:
 *   - LMArena: https://huggingface.co/datasets/lmsys/chatbot_arena_conversations
 *   - Open LLM Leaderboard: https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard
 *   - Artificial Analysis: https://artificialanalysis.ai/
 *
 * All fetches are wrapped in try/catch — a failure simply skips the update
 * (graceful degradation, never breaks the deploy).
 */
import { readFileSync, writeFileSync } from 'fs';

const path = new URL('../src/data/leaderboard.json', import.meta.url);
const data = JSON.parse(readFileSync(path, 'utf-8'));

// Update the "last compiled" timestamp
data.generatedAt = new Date().toISOString().slice(0, 10);

// TODO: Add live data fetches here. Example pattern:
// try {
//   const res = await fetch('https://some-api/leaderboard');
//   const json = await res.json();
//   // merge into data.models...
// } catch (e) {
//   console.warn(`Fetch failed, skipping: ${e.message}`);
// }

writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log(`✓ Updated generatedAt to ${data.generatedAt}`);
