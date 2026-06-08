#!/usr/bin/env bun
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadConfig } from './config';
import { readProjectMap } from './project-map';
import { readQuizHistory, type Concept, type Pattern } from './concept-tracker';

export function syncToObsidian(concept: Concept, pattern: Pattern | undefined): void {
  const config = loadConfig();
  if (!config.obsidian_vault) return;

  const vaultDir = join(config.obsidian_vault, config.obsidian_folder);
  if (!existsSync(vaultDir)) mkdirSync(vaultDir, { recursive: true });

  const filePath = join(vaultDir, `${concept.id}.md`);
  const projectMap = readProjectMap();
  const freq = projectMap.concept_frequency[concept.id];
  const projects = freq?.projects || [];

  const quizHistory = readQuizHistory()
    .filter(q => q.conceptId === concept.id)
    .slice(-5);

  const quizTable = quizHistory.length > 0
    ? quizHistory.map(q =>
        `| ${q.timestamp.split('T')[0]} | ${q.quality}/5 | ${q.project || '-'} |`
      ).join('\n')
    : '| - | - | - |';

  const content = `---
concept: ${concept.id}
status: ${concept.status}
category: ${concept.category}
last_review: ${concept.lastSeen}
confidence: ${concept.correctCount > 0 ? Math.round((concept.correctCount / (concept.correctCount + concept.incorrectCount)) * 5) : 0}
encounters: ${concept.encounterCount}
tags:
  - learn-while-code
  - ${concept.category.toLowerCase()}
---

# ${concept.name}

${pattern ? `## What it is
${pattern.description}

## Why (not alternatives)
${pattern.explanation}
` : `Category: ${concept.category}`}

## Projects where I used it
${projects.length > 0 ? projects.map(p => `- ${p}`).join('\n') : '- (not yet detected in any project)'}

## Quiz History
| Date | Score | Project |
|------|-------|---------|
${quizTable}

## Status
- **State:** ${concept.status}
- **Encounters:** ${concept.encounterCount}
- **Correct:** ${concept.correctCount} | **Incorrect:** ${concept.incorrectCount}
- **SM-2 Interval:** ${concept.interval} days
- **Next Review:** ${concept.nextReview}
`;

  writeFileSync(filePath, content);
}
