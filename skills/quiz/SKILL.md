---
description: "Interactive spaced repetition quiz on architecture concepts. Uses SM-2 scheduling (Spacing), mixes categories (Interleaving), and asks WHY questions (Retrieval Practice). Use when: 'quiz me', 'quiz', 'test my knowledge', 'spaced repetition', 'review session'."
---

# Quiz — Spacing + Interleaving + Retrieval Practice

Structured quiz session using the SM-2 algorithm. Combines three proven learning techniques.

## Learning Principles

> **Spacing**: Reviewing at increasing intervals (1d → 6d → 15d → 35d) beats cramming by 200-400%.
>
> **Interleaving**: Mixing topics (web, auth, infra, React in one session) builds stronger connections than blocking (all React, then all auth).
>
> **Retrieval Practice**: Answering WHY questions from memory, not recognition. The struggle to recall is what strengthens the memory.

## Instructions

1. Read concepts from `~/.learn-while-code/data/concepts.jsonl`
2. Find concepts due for review:
   - Status `encountered` — highest priority (never quizzed)
   - `nextReview <= today` — SM-2 scheduled review
   - Prioritize concepts with higher cross-project frequency (`~/.learn-while-code/project-map.json`)
   - **Interleave**: don't pick 3 concepts from the same category; mix categories
3. Select up to 5 concepts for this session
4. For each concept:
   a. State the concept name and category
   b. Read the matching pattern from `~/.learn-while-code/data/patterns.jsonl`
   c. Ask the `whyQuestion` — don't show the explanation yet
   d. Wait for the user's answer
   e. Show the correct answer (2-3 sentences from `explanation` field)
   f. Ask user to self-rate: "How confident are you? (1=no idea, 2=wrong but recognized it, 3=correct with difficulty, 4=correct easily, 5=trivial)"
   g. Update concept via SM-2 algorithm, append to `quiz-history.jsonl`
   h. If Obsidian sync is enabled, sync the concept note
5. Show summary after all questions

## Summary Format

```
## Quiz Complete

| Concept | Rating | New Status | Next Review |
|---------|--------|------------|-------------|
| Express Middleware | 4/5 | understood | 2026-06-14 |
| Zustand State | 2/5 | quizzed | 2026-06-09 |
| JWT Validation | 3/5 | quizzed | 2026-06-14 |

Streak: 3 days | Total quizzes: 15 | Avg confidence: 3.2/5
```

## SM-2 Quality Mapping

| Rating | Meaning | SM-2 Effect |
|--------|---------|-------------|
| 1 | Blackout, no idea | Reset interval to 1 day |
| 2 | Wrong, but recognized the topic | Reset interval to 1 day |
| 3 | Correct with difficulty | Interval grows: 1→6→15→35 days |
| 4 | Correct with minor hesitation | Interval grows faster (higher ease) |
| 5 | Trivial, instant recall | Maximum growth, ease factor increases |

## Gotchas
- Never quiz on `unseen` concepts — they haven't been encountered yet.
- If no concepts are due: "All caught up! Keep coding — new patterns are detected automatically."
- Maximum 5 questions per session to prevent quiz fatigue.
- Match the user's language.
- The SM-2 ease factor starts at 2.5 and adjusts based on performance. Consistently low ratings make a concept appear more often.
