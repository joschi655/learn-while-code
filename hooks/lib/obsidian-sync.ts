#!/usr/bin/env bun
import { writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { loadConfig } from './config';
import { readProjectMap } from './project-map';
import { readConcepts, readQuizHistory, type Concept, type Pattern } from './concept-tracker';

// Vault layout: top level holds the MOC and rich project knowledge notes
// (the things a human actually reads); Concepts/ holds the per-pattern
// flashcard notes; System/ holds auto-generated indexes.
function getVaultDir(): string | null {
  const config = loadConfig();
  if (!config.obsidian_vault) return null;
  const dir = join(config.obsidian_vault, config.obsidian_folder);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function getConceptsDir(): string | null {
  const base = getVaultDir();
  if (!base) return null;
  const dir = join(base, 'Concepts');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function getSystemDir(): string | null {
  const base = getVaultDir();
  if (!base) return null;
  const dir = join(base, 'System');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function statusEmoji(status: string): string {
  switch (status) {
    case 'mastered': return '🟢';
    case 'understood': return '🔵';
    case 'quizzed': return '🟡';
    case 'encountered': return '🟠';
    default: return '⚪';
  }
}

function findRelatedConcepts(conceptId: string, allConcepts: Concept[]): string[] {
  const projectMap = readProjectMap();
  const conceptProjects = projectMap.concept_frequency[conceptId]?.projects || [];
  if (conceptProjects.length === 0) return [];

  const related = new Map<string, number>();
  for (const projName of conceptProjects) {
    const proj = projectMap.projects[projName];
    if (!proj) continue;
    for (const otherId of proj.concepts_used) {
      if (otherId === conceptId) continue;
      related.set(otherId, (related.get(otherId) || 0) + 1);
    }
  }

  return [...related.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);
}

export function syncToObsidian(concept: Concept, pattern: Pattern | undefined): void {
  const vaultDir = getVaultDir();
  if (!vaultDir) return;

  const allConcepts = readConcepts();
  const projectMap = readProjectMap();
  const freq = projectMap.concept_frequency[concept.id];
  const projects = freq?.projects || [];
  const related = findRelatedConcepts(concept.id, allConcepts);

  const quizHistory = readQuizHistory()
    .filter(q => q.conceptId === concept.id)
    .slice(-5);

  const quizTable = quizHistory.length > 0
    ? quizHistory.map(q =>
        `| ${q.timestamp.split('T')[0]} | ${q.quality}/5 | ${q.project || '-'} |`
      ).join('\n')
    : '| - | - | - |';

  const relatedLinks = related.length > 0
    ? related.map(id => `- [[${id}]]`).join('\n')
    : '- (none detected yet)';

  const projectLinks = projects.length > 0
    ? projects.map(p => `- [[_project-${p}|${p}]]`).join('\n')
    : '- (not yet detected in any project)';

  const lastScore = quizHistory.length > 0 ? quizHistory[quizHistory.length - 1].quality : null;

  const content = `---
concept: ${concept.id}
status: ${concept.status}
category: ${concept.category}
last_review: ${concept.lastSeen}
confidence: ${concept.correctCount > 0 ? Math.round((concept.correctCount / (concept.correctCount + concept.incorrectCount)) * 5) : 0}
encounters: ${concept.encounterCount}
last_score: ${lastScore ?? 'null'}
quiz_answer: "${pattern ? pattern.explanation.replace(/"/g, "'") : ''}"
tags:
  - learn-while-code
  - ${concept.category.toLowerCase()}
  - practice
---

# ${statusEmoji(concept.status)} ${concept.name}

**Category:** [[_category-${concept.category}|${concept.category}]] | **Status:** ${concept.status} | **Encounters:** ${concept.encounterCount}

${pattern ? `## What it is
${pattern.description}

## Why (not alternatives)
${pattern.explanation}
` : `Category: ${concept.category}`}

## Practice

> **${pattern?.whyQuestion ?? `What is ${concept.name} and when would you use it?`}**

Think before you reveal.

<details>
<summary>Show answer</summary>

${pattern?.explanation ?? ''}

</details>

**Self-assessment after revealing:**
- [ ] Got it — I explained it correctly
- [ ] Partial — I knew the direction but missed details
- [ ] Wrong — I need another encounter with this

*To get Claude to check a free-text answer: paste your answer and say "check my answer for [[${concept.id}]]*

## Projects
${projectLinks}

## Related Concepts
${relatedLinks}

## Quiz History
| Date | Score | Project |
|------|-------|---------|
${quizTable}

## SM-2 State
- **Correct:** ${concept.correctCount} | **Incorrect:** ${concept.incorrectCount}
- **Interval:** ${concept.interval} days
- **Ease Factor:** ${concept.easeFactor.toFixed(2)}
- **Next Review:** ${concept.nextReview}
`;

  const conceptsDir = getConceptsDir();
  if (conceptsDir) writeFileSync(join(conceptsDir, `${concept.id}.md`), content);
}

export function syncCategoryIndex(category: string): void {
  const vaultDir = getVaultDir();
  if (!vaultDir) return;

  const allConcepts = readConcepts().filter(c => c.category === category);
  const mastered = allConcepts.filter(c => c.status === 'mastered').length;
  const understood = allConcepts.filter(c => c.status === 'understood').length;
  const total = allConcepts.length;

  const conceptList = allConcepts
    .sort((a, b) => {
      const order = ['mastered', 'understood', 'quizzed', 'encountered', 'unseen'];
      return order.indexOf(a.status) - order.indexOf(b.status);
    })
    .map(c => `- ${statusEmoji(c.status)} [[${c.id}|${c.name}]] — ${c.status} (${c.encounterCount} encounters)`)
    .join('\n');

  const content = `---
type: category-index
category: ${category}
tags:
  - learn-while-code
  - category-index
---

# ${category}

**${mastered}/${total} mastered** | ${understood} understood | ${total} total concepts

## Concepts
${conceptList}

## Progress
${'█'.repeat(mastered)}${'▓'.repeat(understood)}${'░'.repeat(total - mastered - understood)} ${Math.round(((mastered + understood) / Math.max(total, 1)) * 100)}%
`;

  const systemDir = getSystemDir();
  if (systemDir) writeFileSync(join(systemDir, `_category-${category}.md`), content);
}

export function syncProjectIndex(projectName: string): void {
  const vaultDir = getVaultDir();
  if (!vaultDir) return;

  const projectMap = readProjectMap();
  const project = projectMap.projects[projectName];
  if (!project) return;

  const allConcepts = readConcepts();
  const conceptList = project.concepts_used
    .map(id => {
      const c = allConcepts.find(concept => concept.id === id);
      if (!c) return `- ⚪ [[${id}]]`;
      return `- ${statusEmoji(c.status)} [[${id}|${c.name}]] — ${c.status} ([[_category-${c.category}|${c.category}]])`;
    })
    .join('\n');

  const content = `---
type: project-index
project: ${projectName}
last_seen: ${project.last_seen}
tags:
  - learn-while-code
  - project-index
---

# ${projectName}

**${project.concepts_used.length} concepts detected** | Last active: ${project.last_seen}

## Concepts Used
${conceptList || '- (none detected yet)'}

## Path
\`${project.path}\`
`;

  const systemDir = getSystemDir();
  if (systemDir) writeFileSync(join(systemDir, `_project-${projectName}.md`), content);
}

export function syncAllIndexes(): void {
  const vaultDir = getVaultDir();
  if (!vaultDir) return;

  const allConcepts = readConcepts();
  const projectMap = readProjectMap();

  const categories = [...new Set(allConcepts.map(c => c.category))];
  for (const cat of categories) {
    syncCategoryIndex(cat);
  }

  for (const projName of Object.keys(projectMap.projects)) {
    syncProjectIndex(projName);
  }

  const mastered = allConcepts.filter(c => c.status === 'mastered').length;
  const understood = allConcepts.filter(c => c.status === 'understood').length;
  const encountered = allConcepts.filter(c => c.status !== 'unseen').length;
  const total = allConcepts.length;

  const catLinks = categories
    .map(cat => {
      const catConcepts = allConcepts.filter(c => c.category === cat);
      const catMastered = catConcepts.filter(c => c.status === 'mastered').length;
      return `- [[_category-${cat}|${cat}]] — ${catMastered}/${catConcepts.length} mastered`;
    })
    .join('\n');

  const projLinks = Object.entries(projectMap.projects)
    .sort((a, b) => b[1].last_seen.localeCompare(a[1].last_seen))
    .map(([name, proj]) => `- [[_project-${name}|${name}]] — ${proj.concepts_used.length} concepts (${proj.last_seen})`)
    .join('\n');

  // Rich project knowledge notes written by the learn-project skill live at
  // the top level of the folder, next to this MOC.
  const knowledgeNotes = readdirSync(vaultDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => f.replace(/\.md$/, ''));
  const knowledgeLinks = knowledgeNotes.length > 0
    ? knowledgeNotes.map(n => `- [[${n}]]`).join('\n')
    : '- (none yet — run the learn-project skill inside a repo)';

  const overview = `---
type: learning-overview
tags:
  - learn-while-code
  - MOC
---

# Learn While Code — Overview

**${mastered} mastered** | **${understood} understood** | **${encountered} encountered** | **${total} total**

${'█'.repeat(mastered)}${'▓'.repeat(understood)}${'▒'.repeat(encountered - mastered - understood)}${'░'.repeat(total - encountered)} ${Math.round((mastered / Math.max(total, 1)) * 100)}% mastered

## Project Knowledge
${knowledgeLinks}

## Categories
${catLinks}

## Projects (auto-tracked)
${projLinks}

## Recently Active
${allConcepts
  .filter(c => c.status !== 'unseen')
  .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
  .slice(0, 10)
  .map(c => `- ${statusEmoji(c.status)} [[${c.id}|${c.name}]] — ${c.lastSeen}`)
  .join('\n')}
`;

  writeFileSync(join(vaultDir, `_learn-while-code.md`), overview);
}
