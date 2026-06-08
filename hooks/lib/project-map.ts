#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { getConfigDir } from './config';

export interface ProjectEntry {
  path: string;
  last_seen: string;
  concepts_used: string[];
}

export interface ConceptFrequency {
  count: number;
  projects: string[];
}

export interface ProjectMap {
  projects: Record<string, ProjectEntry>;
  concept_frequency: Record<string, ConceptFrequency>;
}

const MAP_PATH = join(getConfigDir(), 'project-map.json');

export function readProjectMap(): ProjectMap {
  try {
    if (existsSync(MAP_PATH)) {
      return JSON.parse(readFileSync(MAP_PATH, 'utf-8'));
    }
  } catch {
    // fall through
  }
  return { projects: {}, concept_frequency: {} };
}

export function writeProjectMap(map: ProjectMap): void {
  writeFileSync(MAP_PATH, JSON.stringify(map, null, 2));
}

export function detectProjectName(cwd: string): string {
  try {
    const remote = execSync('git remote get-url origin 2>/dev/null', { cwd, encoding: 'utf-8' }).trim();
    const match = remote.match(/\/([^/]+?)(?:\.git)?$/);
    if (match) return match[1];
  } catch {
    // not a git repo or no remote
  }
  return cwd.split('/').filter(Boolean).pop() || 'unknown';
}

export function recordPatternInProject(conceptId: string, cwd: string): void {
  const map = readProjectMap();
  const projectName = detectProjectName(cwd);
  const today = new Date().toISOString().split('T')[0];

  if (!map.projects[projectName]) {
    map.projects[projectName] = { path: cwd, last_seen: today, concepts_used: [] };
  }

  const project = map.projects[projectName];
  project.last_seen = today;
  if (!project.concepts_used.includes(conceptId)) {
    project.concepts_used.push(conceptId);
  }

  if (!map.concept_frequency[conceptId]) {
    map.concept_frequency[conceptId] = { count: 0, projects: [] };
  }

  const freq = map.concept_frequency[conceptId];
  if (!freq.projects.includes(projectName)) {
    freq.projects.push(projectName);
    freq.count = freq.projects.length;
  }

  writeProjectMap(map);
}

export function getTopCrossProjectPatterns(limit = 10): Array<{ conceptId: string; count: number; projects: string[] }> {
  const map = readProjectMap();
  return Object.entries(map.concept_frequency)
    .map(([conceptId, freq]) => ({ conceptId, ...freq }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
