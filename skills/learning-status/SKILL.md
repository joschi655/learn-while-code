---
description: "Show learning progress dashboard. Concepts by status, category breakdown, streak, cross-project patterns, due reviews. Use when: 'learning status', 'what have I learned', 'mein Lernstand', 'show progress', 'how am I doing'."
---

# Learning Status — Progress Dashboard

Shows a deterministic overview of learning progress.

## Instructions

1. Read concepts from `~/.learn-while-code/data/concepts.jsonl`
2. Read quiz history from `~/.learn-while-code/data/quiz-history.jsonl`
3. Read project map from `~/.learn-while-code/project-map.json`
4. Compute and display:

## Output Format

```
## Learning Progress

### Overview
- **Total Concepts:** 20
- **Streak:** 3 days
- **Total Quizzes:** 15
- **Avg Confidence:** 3.2/5

### By Status
unseen       ██████████████████ 12
encountered  ████████           4
quizzed      ████               2
understood   ██                 1
mastered     █                  1

### By Category
| Category | Total | Mastered | Progress |
|----------|-------|----------|----------|
| SAP      | 4     | 0        | ░░░░░░░░ |
| Web      | 4     | 1        | ██░░░░░░ |
| React    | 4     | 0        | ░░░░░░░░ |
| MCP      | 3     | 0        | ░░░░░░░░ |
| ...      |       |          |          |

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
```

5. End with a suggestion:
   - If concepts are due: "Du hast N Konzepte zur Review. Sag 'quiz me'."
   - If nothing due: "Alles reviewed! Arbeite weiter — neue Patterns werden automatisch erkannt."

## Gotchas
- All data is deterministic (read from JSONL files). No LLM judgment in the numbers.
- Progress bars use block characters: ██ for progress, ░░ for remaining.
- Cross-project patterns sorted by frequency (most projects first).
