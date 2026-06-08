#!/usr/bin/env bun
/**
 * Stop hook — injects a spaced repetition quiz question after task completion.
 * Gated by: recursion guard, rate limit (30min), minimum tool calls, encountered concepts.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getDueForReview, generateQuizQuestion, readConcepts } from './lib/concept-tracker';
import { getConfigDir, loadConfig } from './lib/config';

interface HookInput {
  session_id: string;
  transcript_path?: string;
  stop_hook_active?: boolean;
}

const RATE_LIMIT_MINUTES = 30;
const MIN_TOOL_CALLS = 5;

function lastQuizPath(): string {
  return join(getConfigDir(), 'last-quiz.json');
}

function readLastQuiz(): { timestamp: string; conceptId: string } | null {
  try {
    const p = lastQuizPath();
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    return null;
  }
}

function writeLastQuiz(conceptId: string): void {
  writeFileSync(lastQuizPath(), JSON.stringify({
    timestamp: new Date().toISOString(),
    conceptId,
  }));
}

function countToolCalls(transcriptPath: string): number {
  try {
    if (!existsSync(transcriptPath)) return 0;
    const content = readFileSync(transcriptPath, 'utf-8');
    const matches = content.match(/"type"\s*:\s*"tool_use"/g);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

async function main() {
  try {
    const raw = await Bun.stdin.text();
    if (!raw.trim()) process.exit(0);

    const input: HookInput = JSON.parse(raw);

    if (input.stop_hook_active) process.exit(0);

    const lastQuiz = readLastQuiz();
    if (lastQuiz) {
      const elapsed = Date.now() - new Date(lastQuiz.timestamp).getTime();
      if (elapsed < RATE_LIMIT_MINUTES * 60 * 1000) process.exit(0);
    }

    if (input.transcript_path) {
      const toolCalls = countToolCalls(input.transcript_path);
      if (toolCalls < MIN_TOOL_CALLS) process.exit(0);
    }

    const concepts = readConcepts();
    const encountered = concepts.filter(c => c.status !== 'unseen');
    if (encountered.length === 0) process.exit(0);

    const due = getDueForReview();
    if (due.length === 0) process.exit(0);

    const concept = due[0];
    const quiz = generateQuizQuestion(concept);

    writeLastQuiz(concept.id);

    const config = loadConfig();
    const lang = config.language === 'de'
      ? `QUIZ TIME -- antworte kurz bevor du dich verabschiedest:\n\n**${concept.name}** -- ${quiz.question}\n\nTipp: ${quiz.hint}\n\n(Sag 'richtig', 'falsch', oder gib eine Zahl 1-5 als Qualitaet an)`
      : `QUIZ TIME -- answer briefly before wrapping up:\n\n**${concept.name}** -- ${quiz.question}\n\nHint: ${quiz.hint}\n\n(Say 'correct', 'wrong', or give a number 1-5 as quality rating)`;

    console.log(JSON.stringify({ type: 'additionalContext', content: lang }));
  } catch {
    // never block
  }

  process.exit(0);
}

main();
