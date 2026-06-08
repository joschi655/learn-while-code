---
description: "Defense Mode — explain AI-generated code before committing. Retrieval Practice: answer 3-5 targeted questions about logic, data flow, and architectural decisions without help. Blocks shallow understanding. Use when: 'defend', 'defense mode', 'explain before commit', 'prove I understand', 'test my understanding'."
---

# Defend — Retrieval Practice (Defense Mode)

Forces understanding before shipping. You explain the code — no peeking at explanations.

## Learning Principle

> "Retrieving information from memory strengthens it more than re-reading ever could." — Retrieval Practice
>
> This is the hardest step: you must explain what the AI wrote **in your own words**, without seeing the teach explanation. Research shows this active recall is 2-3x more effective for long-term retention than passive review.

## Instructions

1. Identify all files changed since the last commit (`git diff --name-only`)
2. Read the actual changes (`git diff` for staged, `git diff HEAD` for all)
3. Generate 3-5 targeted questions about the code. Rules for questions:
   - **WHY questions only** — never "what does line X do"
   - **Data flow** — "Where does this data come from? What transforms it before it reaches [component]?"
   - **Error paths** — "What happens if [service/API] is unreachable or returns an error?"
   - **Dependencies** — "What other files, services, or systems depend on this change?"
   - **Trade-offs** — "Why this approach instead of [alternative]? What would you lose?"
4. Present questions one at a time. Wait for the user's answer before continuing.
5. After each answer:
   - If correct: confirm briefly, add one nuance they might not have considered
   - If wrong: explain the correct answer in 2-3 sentences, no judgment
6. Rate each answer 1-5 and record via the concept tracker if a matching concept exists
7. After all questions: update `~/.learn-while-code/defense-state.json` with `last_defend_run` timestamp
8. If Obsidian sync is enabled, sync any concepts that were quizzed

## Question Templates

```
- "Why [pattern] instead of [alternative] here?"
- "What happens if [service/API] is unreachable?"
- "Where does the data in [variable/prop] come from? Trace its path."
- "What other files or services would break if you removed [function/component]?"
- "What's the trade-off of [approach chosen] vs [approach not chosen]?"
```

## After Completion

Write to `~/.learn-while-code/defense-state.json`:
```json
{ "last_defend_run": "2026-06-08T14:30:00Z", "session_id": "..." }
```

This unblocks the defense-gate hook for the next `git commit`.

## Gotchas
- Never ask about syntax. Always architecture-level understanding.
- If changes are trivial (README update, version bump), say "No defense needed — trivial change" and update the timestamp.
- Match the user's language. If they answer in German, ask in German.
- The point is retrieval, not humiliation. Wrong answers are learning opportunities, not failures.
