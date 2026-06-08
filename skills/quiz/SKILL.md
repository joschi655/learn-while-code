---
description: "Interactive spaced repetition quiz on architecture concepts. SM-2 algorithm schedules reviews. Asks WHY questions, tracks progress, syncs to Obsidian. Use when: 'quiz me', 'quiz', 'test my knowledge', 'spaced repetition', 'review session', 'Lern-Session'."
---

# Quiz — Spaced Repetition

Interactive quiz session using the SM-2 algorithm. Focuses on WHY questions about architecture patterns.

## Instructions

1. Read concepts from `~/.learn-while-code/data/concepts.jsonl`
2. Find concepts due for review:
   - Status `encountered` (never quizzed — highest priority)
   - `nextReview <= today` (SM-2 scheduled)
   - Prioritize concepts with higher cross-project frequency (check `~/.learn-while-code/project-map.json`)
3. Select up to 5 concepts for this session
4. For each concept:
   a. State the concept name and category
   b. Read the matching pattern from `~/.learn-while-code/data/patterns.jsonl`
   c. Ask the `whyQuestion` from the pattern
   d. Wait for the user's answer
   e. Briefly explain the correct answer (2-3 sentences from `explanation` field)
   f. Ask user to self-rate: "Wie sicher bist du? (1=keine Ahnung, 5=trivial)"
   g. Record the quiz: update concept via SM-2, append to quiz-history.jsonl
   h. If Obsidian sync enabled, sync the concept note
5. After all questions, show summary:

## Summary Format

```
Quiz Complete!

| Concept | Rating | New Status | Next Review |
|---------|--------|------------|-------------|
| Express Middleware | 4/5 | understood | 2026-06-14 |
| Zustand State | 2/5 | quizzed | 2026-06-09 |

Streak: 3 days | Total quizzes: 15 | Avg confidence: 3.2
```

## SM-2 Quality Mapping
- 1 = Blackout, no idea
- 2 = Wrong, but recognized the topic
- 3 = Correct with difficulty
- 4 = Correct with minor hesitation
- 5 = Trivial, instant recall

## Gotchas
- German by default. Switch if user answers in English.
- Never quiz on `unseen` concepts — they haven't been encountered yet.
- If no concepts are due, say "Keine Konzepte zur Review. Arbeite weiter — neue Patterns werden automatisch erkannt."
- Maximum 5 questions per session to prevent fatigue.
