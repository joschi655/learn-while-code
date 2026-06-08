#!/usr/bin/env bun
/**
 * SessionStart hook — injects a compact learning profile into context.
 * Gives the AI awareness of what the user knows, what's weak, and what's due.
 * ~15 lines of additionalContext, non-blocking.
 */

import { readConcepts, readQuizHistory } from './lib/concept-tracker';
import { readProjectMap } from './lib/project-map';

async function main() {
  try {
    const concepts = readConcepts();
    if (concepts.length === 0) process.exit(0);

    const today = new Date().toISOString().split('T')[0];
    const projectMap = readProjectMap();
    const quizHistory = readQuizHistory();

    const byStatus = { unseen: 0, encountered: 0, quizzed: 0, understood: 0, mastered: 0 };
    for (const c of concepts) byStatus[c.status]++;

    const due = concepts.filter(c =>
      c.status !== 'unseen' && (c.nextReview <= today || c.status === 'encountered')
    );

    const weakCategories = new Map<string, { total: number; mastered: number }>();
    for (const c of concepts) {
      const cat = weakCategories.get(c.category) || { total: 0, mastered: 0 };
      cat.total++;
      if (c.status === 'mastered') cat.mastered++;
      weakCategories.set(c.category, cat);
    }
    const weakest = [...weakCategories.entries()]
      .filter(([, v]) => v.mastered === 0 && v.total > 0)
      .map(([k]) => k);

    const recentQuizzes = quizHistory.slice(-3);
    const avgConfidence = quizHistory.length > 0
      ? (quizHistory.reduce((s, q) => s + q.quality, 0) / quizHistory.length).toFixed(1)
      : 'n/a';

    const topPatterns = Object.entries(projectMap.concept_frequency)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([id, f]) => `${id} (${f.count} projects)`);

    const mastered = concepts.filter(c => c.status === 'mastered').map(c => c.name);
    const understood = concepts.filter(c => c.status === 'understood').map(c => c.name);

    const lines = [
      `[learn-while-code] Learning Profile:`,
      `Progress: ${byStatus.mastered} mastered, ${byStatus.understood} understood, ${byStatus.quizzed} quizzed, ${byStatus.encountered} encountered, ${byStatus.unseen} unseen (${concepts.length} total)`,
    ];

    if (mastered.length > 0) lines.push(`Mastered: ${mastered.join(', ')}`);
    if (understood.length > 0) lines.push(`Understood: ${understood.join(', ')}`);
    if (due.length > 0) lines.push(`Due for review (${due.length}): ${due.slice(0, 5).map(c => c.name).join(', ')}`);
    if (weakest.length > 0) lines.push(`Weak categories (0 mastered): ${weakest.join(', ')}`);
    if (topPatterns.length > 0) lines.push(`Most-used patterns: ${topPatterns.join(', ')}`);
    lines.push(`Avg quiz confidence: ${avgConfidence}/5 | Total quizzes: ${quizHistory.length}`);
    if (recentQuizzes.length > 0) {
      lines.push(`Recent: ${recentQuizzes.map(q => `${q.conceptId}=${q.quality}/5`).join(', ')}`);
    }
    lines.push(`When teaching or explaining code, build on what's mastered/understood. Focus explanations on encountered/unseen concepts.`);

    console.log(JSON.stringify({
      type: 'additionalContext',
      content: lines.join('\n')
    }));
  } catch {
    // never block session start
  }

  process.exit(0);
}

main();
