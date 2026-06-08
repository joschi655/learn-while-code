#!/usr/bin/env bun
/**
 * PreToolUse hook on Bash — blocks git commit if /defend hasn't been run since last code change.
 * Configurable: strict (block), remind (warn), off (disabled).
 * Exit code 2 = block the tool call.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getConfigDir, loadConfig } from './lib/config';

interface HookInput {
  tool_name: string;
  tool_input: Record<string, string>;
  session_id: string;
}

const DEFENSE_STATE_PATH = join(getConfigDir(), 'defense-state.json');

interface DefenseState {
  last_code_change: string;
  last_defend_run: string;
}

function readDefenseState(): DefenseState {
  try {
    if (existsSync(DEFENSE_STATE_PATH)) {
      return JSON.parse(readFileSync(DEFENSE_STATE_PATH, 'utf-8'));
    }
  } catch {
    // fall through
  }
  return { last_code_change: '', last_defend_run: '' };
}

async function main() {
  try {
    const raw = await Bun.stdin.text();
    if (!raw.trim()) process.exit(0);

    const input: HookInput = JSON.parse(raw);

    if (input.tool_name !== 'Bash') process.exit(0);

    const command = input.tool_input?.command || '';
    if (!command.match(/git\s+commit/)) process.exit(0);

    const config = loadConfig();
    if (config.defense_mode === 'off') process.exit(0);

    const state = readDefenseState();

    if (!state.last_code_change) process.exit(0);

    const codeChangeTime = new Date(state.last_code_change).getTime();
    const defendTime = state.last_defend_run ? new Date(state.last_defend_run).getTime() : 0;

    if (defendTime >= codeChangeTime) process.exit(0);

    if (config.defense_mode === 'strict') {
      const msg = config.language === 'de'
        ? 'Defense Mode: Du hast Code geschrieben aber /learn-while-code:defend noch nicht ausgefuehrt. Erklaere den Code bevor du commitest.'
        : 'Defense Mode: You wrote code but haven\'t run /learn-while-code:defend yet. Explain the code before committing.';
      console.error(JSON.stringify({ error: msg }));
      process.exit(2);
    }

    if (config.defense_mode === 'remind') {
      const msg = config.language === 'de'
        ? 'Hinweis: Du koenntest /learn-while-code:defend ausfuehren um den Code zu erklaeren bevor du commitest.'
        : 'Hint: Consider running /learn-while-code:defend to explain the code before committing.';
      console.log(JSON.stringify({ type: 'additionalContext', content: msg }));
    }
  } catch {
    // never block on error
  }

  process.exit(0);
}

main();
