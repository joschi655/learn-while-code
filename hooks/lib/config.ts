#!/usr/bin/env bun
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface LWCConfig {
  obsidian_vault: string;
  obsidian_folder: string;
  sync_on_quiz: boolean;
  sync_on_mastered: boolean;
  language: 'de' | 'en';
  defense_mode: 'strict' | 'remind' | 'off';
}

const DEFAULT_CONFIG: LWCConfig = {
  obsidian_vault: '',
  obsidian_folder: 'Learning/CodeConcepts',
  sync_on_quiz: true,
  sync_on_mastered: true,
  language: 'de',
  defense_mode: 'remind',
};

const CONFIG_DIR = join(process.env.HOME || '~', '.learn-while-code');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export function getConfigDir(): string {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  return CONFIG_DIR;
}

export function getDataDir(): string {
  const dir = join(getConfigDir(), 'data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export function loadConfig(): LWCConfig {
  try {
    if (existsSync(CONFIG_PATH)) {
      const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
      return { ...DEFAULT_CONFIG, ...raw };
    }
  } catch {
    // fall through
  }
  return DEFAULT_CONFIG;
}
