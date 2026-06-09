#!/usr/bin/env bun
/**
 * PostToolUse hook — detects coding patterns and updates concept encounter counts.
 * Also records pattern usage in the cross-project map.
 * Async, non-blocking. Always exits 0.
 */

import { detectPatterns, readConcepts, writeConcepts } from './lib/concept-tracker';
import { recordPatternInProject } from './lib/project-map';

interface HookInput {
  tool_name: string;
  tool_input: Record<string, string>;
  tool_response?: string;
  session_id: string;
}

const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|py|java|go|rs|yaml|yml|json|toml|sh|sql|prisma|dockerfile)$/i;

async function main() {
  try {
    const raw = await Bun.stdin.text();
    if (!raw.trim()) process.exit(0);

    const input: HookInput = JSON.parse(raw);
    const { tool_name, tool_input, tool_response } = input;

    if (!['Write', 'Edit', 'Read'].includes(tool_name)) process.exit(0);

    const filePath = tool_input?.file_path || '';

    // Only scan real code files. Markdown/prose (SKILL.md, README.md) describe
    // patterns without being them — scanning them produces false positives.
    if (!CODE_EXTENSIONS.test(filePath)) process.exit(0);

    let content = '';
    if (tool_name === 'Write') {
      content = tool_input?.content || '';
    } else if (tool_name === 'Edit') {
      content = tool_input?.new_string || tool_input?.old_string || '';
    } else if (tool_name === 'Read') {
      content = tool_response || '';
    }

    if (!content || content.length < 10) process.exit(0);

    const detected = detectPatterns(content, filePath);
    const relevant = detected.filter(d => d.confidence >= 2);

    if (relevant.length === 0) process.exit(0);

    const concepts = readConcepts();
    const today = new Date().toISOString().split('T')[0];
    const cwd = process.cwd();
    let changed = false;

    for (const det of relevant) {
      const concept = concepts.find(c => c.id === det.patternId);
      if (!concept) continue;

      if (concept.status === 'unseen') {
        concept.status = 'encountered';
      }
      concept.encounterCount++;
      concept.lastSeen = today;
      changed = true;

      recordPatternInProject(det.patternId, cwd);
    }

    if (changed) {
      writeConcepts(concepts);
    }
  } catch {
    // never block
  }

  process.exit(0);
}

main();
