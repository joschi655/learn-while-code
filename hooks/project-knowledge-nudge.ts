#!/usr/bin/env bun
/**
 * PreToolUse hook on Bash — when you `git commit` in a project that has no
 * knowledge note in the Obsidian vault yet, suggest running learn-project once.
 *
 * A commit is the deterministic proxy for "a chunk of work is done" (incl. a
 * finished plan implementation). This nudge injects additionalContext telling
 * the model to offer learn-project — the model then drives the skill.
 *
 * Non-blocking, fires at most once per project (tracked in a marker file).
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getConfigDir, loadConfig } from './lib/config';
import { detectProjectName } from './lib/project-map';

interface HookInput {
  tool_name: string;
  tool_input: Record<string, string>;
  cwd?: string;
}

function nudgedProjectsPath(): string {
  return join(getConfigDir(), 'nudged-projects.json');
}

function readNudged(): string[] {
  try {
    const p = nudgedProjectsPath();
    if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf-8'));
  } catch {
    // fall through
  }
  return [];
}

function markNudged(project: string): void {
  const list = readNudged();
  if (!list.includes(project)) {
    list.push(project);
    writeFileSync(nudgedProjectsPath(), JSON.stringify(list));
  }
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
    if (!config.obsidian_vault) process.exit(0); // no vault = nowhere to write notes

    const cwd = input.cwd || process.cwd();
    const project = detectProjectName(cwd);

    // Already nudged for this project? Stay quiet.
    if (readNudged().includes(project)) process.exit(0);

    // Does a knowledge note already exist at the vault top level?
    const notePath = join(config.obsidian_vault, config.obsidian_folder, `${project}.md`);
    if (existsSync(notePath)) process.exit(0);

    markNudged(project);

    const lang = config.language === 'de'
      ? `Dieses Projekt (${project}) ist noch nicht in der Knowledgebase. Du committest gerade fertige Arbeit — guter Moment, das Wissen festzuhalten. Biete dem User EINMAL an, den learn-project Skill auszuführen: erst die Architektur und Kern-Logik erklären, Fragen beantworten, dann die Wissensnote schreiben. Wenn der User ablehnt, nicht erneut nachfragen.`
      : `This project (${project}) isn't in your knowledgebase yet. You're committing finished work — a good moment to capture what you built. Offer ONCE to run the learn-project skill: explain the architecture and core logic, answer questions, then write the knowledge note. If the user declines, don't ask again.`;

    console.log(JSON.stringify({ type: 'additionalContext', content: lang }));
  } catch {
    // never block a commit
  }

  process.exit(0);
}

main();
