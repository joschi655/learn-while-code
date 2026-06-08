#!/usr/bin/env bun
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { getDataDir } from './config';

export interface Concept {
  id: string;
  name: string;
  category: string;
  status: 'unseen' | 'encountered' | 'quizzed' | 'understood' | 'mastered';
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: string;
  lastSeen: string;
  encounterCount: number;
  correctCount: number;
  incorrectCount: number;
}

export interface Pattern {
  id: string;
  name: string;
  category: string;
  description: string;
  codeSignatures: string[];
  filePatterns: string[];
  whyQuestion: string;
  explanation: string;
}

export interface DetectedPattern {
  patternId: string;
  confidence: number;
  matchedSignature: string;
}

export interface QuizEntry {
  timestamp: string;
  conceptId: string;
  question: string;
  quality: number;
  sessionId: string;
  project?: string;
}

export interface QuizQuestion {
  conceptId: string;
  question: string;
  hint: string;
}

function ensureDir(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readJsonl<T>(path: string): T[] {
  if (!existsSync(path)) return [];
  const content = readFileSync(path, 'utf-8').trim();
  if (!content) return [];
  return content.split('\n').map(line => JSON.parse(line) as T);
}

function writeJsonl<T>(path: string, items: T[]): void {
  ensureDir(path);
  writeFileSync(path, items.map(i => JSON.stringify(i)).join('\n') + '\n');
}

function appendJsonl<T>(path: string, item: T): void {
  ensureDir(path);
  appendFileSync(path, JSON.stringify(item) + '\n');
}

export function conceptsPath(): string {
  return join(getDataDir(), 'concepts.jsonl');
}

export function quizPath(): string {
  return join(getDataDir(), 'quiz-history.jsonl');
}

export function patternsPath(): string {
  return join(getDataDir(), 'patterns.jsonl');
}

export function readConcepts(): Concept[] {
  return readJsonl<Concept>(conceptsPath());
}

export function writeConcepts(concepts: Concept[]): void {
  writeJsonl(conceptsPath(), concepts);
}

export function appendQuizHistory(entry: QuizEntry): void {
  appendJsonl(quizPath(), entry);
}

export function readPatterns(): Pattern[] {
  return readJsonl<Pattern>(patternsPath());
}

export function readQuizHistory(): QuizEntry[] {
  return readJsonl<QuizEntry>(quizPath());
}

// SM-2 spaced repetition algorithm
export function sm2Update(concept: Concept, quality: 0 | 1 | 2 | 3 | 4 | 5): Concept {
  const updated = { ...concept };
  const today = new Date().toISOString().split('T')[0];

  if (quality >= 3) {
    if (updated.repetitions === 0) {
      updated.interval = 1;
    } else if (updated.repetitions === 1) {
      updated.interval = 6;
    } else {
      updated.interval = Math.round(updated.interval * updated.easeFactor);
    }
    updated.repetitions += 1;
    updated.easeFactor = Math.max(
      1.3,
      updated.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    );
    updated.correctCount += 1;
  } else {
    updated.repetitions = 0;
    updated.interval = 1;
    updated.incorrectCount += 1;
  }

  const next = new Date();
  next.setDate(next.getDate() + updated.interval);
  updated.nextReview = next.toISOString().split('T')[0];
  updated.lastSeen = today;

  if (updated.status === 'unseen' || updated.status === 'encountered') {
    updated.status = 'quizzed';
  }
  if (updated.correctCount >= 5 && updated.interval > 21) {
    updated.status = 'mastered';
  } else if (updated.correctCount >= 3) {
    updated.status = 'understood';
  }

  return updated;
}

export function detectPatterns(content: string, filePath: string): DetectedPattern[] {
  const patterns = readPatterns();
  const detected: DetectedPattern[] = [];

  for (const pattern of patterns) {
    let matchCount = 0;
    let firstMatch = '';

    for (const sig of pattern.codeSignatures) {
      try {
        if (new RegExp(sig).test(content)) {
          matchCount++;
          if (!firstMatch) firstMatch = sig;
        }
      } catch {
        // skip invalid regex
      }
    }

    for (const fp of pattern.filePatterns) {
      const fpClean = fp.replace(/\*/g, '');
      if (filePath.includes(fpClean)) {
        matchCount++;
        if (!firstMatch) firstMatch = fp;
      }
    }

    if (matchCount > 0) {
      detected.push({
        patternId: pattern.id,
        confidence: Math.min(matchCount, 5),
        matchedSignature: firstMatch,
      });
    }
  }

  return detected;
}

export function getDueForReview(): Concept[] {
  const concepts = readConcepts();
  const today = new Date().toISOString().split('T')[0];

  return concepts.filter(c =>
    c.status !== 'unseen' && (c.nextReview <= today || c.status === 'encountered')
  ).sort((a, b) => {
    if (a.status === 'encountered' && b.status !== 'encountered') return -1;
    if (b.status === 'encountered' && a.status !== 'encountered') return 1;
    return a.nextReview.localeCompare(b.nextReview);
  });
}

export function generateQuizQuestion(concept: Concept): QuizQuestion {
  const patterns = readPatterns();
  const pattern = patterns.find(p => p.id === concept.id);

  if (pattern) {
    return {
      conceptId: concept.id,
      question: pattern.whyQuestion,
      hint: pattern.explanation.substring(0, 80) + '...',
    };
  }

  return {
    conceptId: concept.id,
    question: `Was ist ${concept.name} und wann benutzt man es?`,
    hint: `Kategorie: ${concept.category}`,
  };
}
