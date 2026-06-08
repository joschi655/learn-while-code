#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readConcepts, readQuizHistory } from './concept-tracker';
import { getConfigDir } from './config';

export interface Progress {
  total_concepts: number;
  by_status: Record<string, number>;
  by_category: Record<string, { total: number; mastered: number }>;
  streak_days: number;
  last_quiz_date: string;
  total_quizzes: number;
  avg_confidence: number;
}

const PROGRESS_PATH = join(getConfigDir(), 'progress.json');

export function computeProgress(): Progress {
  const concepts = readConcepts();
  const quizHistory = readQuizHistory();

  const by_status: Record<string, number> = {
    unseen: 0, encountered: 0, quizzed: 0, understood: 0, mastered: 0,
  };
  const by_category: Record<string, { total: number; mastered: number }> = {};

  for (const c of concepts) {
    by_status[c.status] = (by_status[c.status] || 0) + 1;
    if (!by_category[c.category]) by_category[c.category] = { total: 0, mastered: 0 };
    by_category[c.category].total++;
    if (c.status === 'mastered') by_category[c.category].mastered++;
  }

  const quizDates = [...new Set(quizHistory.map(q => q.timestamp.split('T')[0]))].sort();
  let streak_days = 0;
  if (quizDates.length > 0) {
    const today = new Date();
    let checkDate = new Date(today);
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (quizDates.includes(dateStr)) {
        streak_days++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const avg_confidence = quizHistory.length > 0
    ? quizHistory.reduce((sum, q) => sum + q.quality, 0) / quizHistory.length
    : 0;

  const progress: Progress = {
    total_concepts: concepts.length,
    by_status,
    by_category,
    streak_days,
    last_quiz_date: quizDates.length > 0 ? quizDates[quizDates.length - 1] : '',
    total_quizzes: quizHistory.length,
    avg_confidence: Math.round(avg_confidence * 10) / 10,
  };

  writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
  return progress;
}

export function readProgress(): Progress | null {
  try {
    if (existsSync(PROGRESS_PATH)) {
      return JSON.parse(readFileSync(PROGRESS_PATH, 'utf-8'));
    }
  } catch {
    // fall through
  }
  return null;
}
