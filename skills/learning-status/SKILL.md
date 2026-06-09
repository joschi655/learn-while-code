---
name: learning-status
description: "Show learning progress dashboard. Deliberate Practice feedback loop — see which concepts are strong, weak, and due. Use when: 'learning status', 'what have I learned', 'show progress', 'how am I doing', 'what should I study'."
---

# Learning Status — Deliberate Practice Feedback

Shows a deterministic overview of your learning progress. This enables the **Deliberate Practice** feedback loop — identifying weak spots to focus on.

## Learning Principle

> "Deliberate practice requires knowing exactly where you're weak, then targeting those areas specifically." — Anders Ericsson
>
> This dashboard shows your concept mastery by status, category, and cross-project frequency. Use it to decide what to focus on next: encountered-but-never-quizzed concepts, overdue reviews, or categories where you have zero mastery.

## Instructions

1. Read concepts from `~/.learn-while-code/data/concepts.jsonl`
2. Read quiz history from `~/.learn-while-code/data/quiz-history.jsonl`
3. Read project map from `~/.learn-while-code/project-map.json`
4. Compute and display the dashboard below

## Output Format

```
## Learning Progress

### Overview
- **Total Concepts:** 20
- **Streak:** 3 days
- **Total Quizzes:** 15
- **Avg Confidence:** 3.2/5

### By Status
mastered     ██                 1
understood   ██                 1
quizzed      ████               2
encountered  ████████           4
unseen       ██████████████████ 12

### By Category
| Category | Total | Mastered | Progress |
|----------|-------|----------|----------|
| SAP      | 4     | 0        | ░░░░░░░░ |
| Web      | 4     | 1        | ██░░░░░░ |
| React    | 4     | 0        | ░░░░░░░░ |
| MCP      | 3     | 0        | ░░░░░░░░ |

### Cross-Project Patterns (Top 5)
express-middleware     ████████ 4 projects  [understood]
cloud-foundry-deploy   ██████  3 projects  [encountered]
jwt-validation         ██████  3 projects  [quizzed]
zustand-state          ████    2 projects  [unseen]
vite-bundling          ████    2 projects  [encountered]

### Due for Review
- Express Middleware (due today)
- CORS Handling (overdue 2 days)
- Zustand State (encountered, never quizzed)

### Recent Quizzes
| Date | Concept | Score |
|------|---------|-------|
| 2026-06-08 | Express Middleware | 4/5 |
| 2026-06-07 | JWT Validation | 3/5 |

### Weak Spots (Deliberate Practice Focus)
- [Categories with 0 mastered concepts]
- [Concepts with incorrectCount > correctCount]
- [Concepts encountered 5+ times but never quizzed]
```

5. If Obsidian sync is enabled, run `syncAllIndexes()` to regenerate all index notes (overview, categories, projects)
6. End with a recommendation:
   - If concepts are due: "You have N concepts due for review. Say 'quiz me' to start."
   - If weak spots found: "Focus area: [category] — 0 mastered out of N. Try `/quiz` or `/teach` after your next task in this area."
   - If all caught up: "All reviewed! Keep coding — new patterns are detected automatically."

## Gotchas
- All numbers are deterministic — read from JSONL files, no LLM judgment.
- Progress bars: `██` for progress, `░░` for remaining.
- Cross-project patterns sorted by frequency (most projects first).
- "Weak spots" section helps implement Deliberate Practice — focus on what's hardest, not what's familiar.
