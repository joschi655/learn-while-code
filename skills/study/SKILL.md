---
name: study
description: "Start a study session — the main entry point for learning. Shows progress, runs due spaced-repetition reviews, grades free-text answers, updates SM-2 and Obsidian. Cost-aware: recommends a cheaper model and delegates grading to Haiku. Use when: 'study', 'study session', 'lass uns lernen', 'review time', 'let's learn', 'practice'."
---

# Study — Your Learning Session

The umbrella entry point. One command instead of juggling `learning-status` + `quiz` + `check-answer` separately.

## Cost Awareness (do this first)

Study sessions don't need a frontier model — questions come deterministically from JSONL, and answers are short. **First action of every session:** check which model is running. If it's an Opus-class model, tell the user once:

> Tip: study sessions run fine on a cheaper model — `/model haiku` (or sonnet) saves budget. Want to switch first, or continue?

Don't block on it — if they say continue (or ignore it), proceed. Never repeat the tip within a session.

For **free-text answer grading** (the only step that needs real judgment), delegate to a cheap subagent regardless of session model: spawn an Agent with `model: "haiku"` whose prompt contains the question, the correct answer (from the pattern's `explanation` field), and the user's answer — it returns a 1-5 score plus one sentence on what was missed. Batch multiple answers into one agent call when possible.

## Session Flow

1. **Status snapshot** (3-4 lines max): streak, due count, weakest category. Read from `~/.learn-while-code/data/concepts.jsonl` and `quiz-history.jsonl`. No giant dashboard — this is a warm-up, not a report. (Full dashboard stays in `learning-status`.)
2. **Pick up to 5 due concepts** — same rules as quiz: `encountered` first, then `nextReview <= today`, interleave categories, prioritize cross-project frequency.
3. **For each concept**, ask the `whyQuestion` and let the user choose how to answer:
   - **Self-rate**: they think, you reveal the answer, they rate 1-5
   - **Free-text**: they write their answer, you grade via the Haiku subagent (score 1-5 + one-line feedback), show the correct answer
4. **Update after each answer**: SM-2 via `sm2Update()`, append to `quiz-history.jsonl`
5. **End of session**: summary table (concept, score, new status, next review), then sync changed concepts + indexes to Obsidian if configured
6. **Close with one pointer**: the single weakest area and how to hit it ("most of your SAP concepts are still unseen — code in MCP-CX-Operations and they'll get detected")

## Relationship to Other Skills

| Skill | Keep using it for |
|-------|-------------------|
| `study` | **The default** — regular learning sessions |
| `quiz` | Direct quiz without status/warm-up (study calls the same logic) |
| `learning-status` | Full dashboard with all bars and tables |
| `check-answer` | Grading a single answer outside a session (e.g. from an Obsidian note) |
| `learn-project` | Writing project knowledge notes — documentation, not review |

## Gotchas
- Max 5 questions; quiz fatigue kills retention.
- The status snapshot is 3-4 lines. Resist the dashboard urge.
- Free-text grading is generous: core WHY right = 4+. Edge cases are bonus, not requirement.
- If nothing is due: say so, show the next review date, suggest `learn-project` for the current repo instead.
- Match the user's language.
