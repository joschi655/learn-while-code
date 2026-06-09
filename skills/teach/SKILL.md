---
name: teach
description: "Explain code and patterns after AI writes them. Kolb's Reflection phase — breaks down what was done, why this pattern, how it fits the architecture, and what could go wrong. Use when: 'teach me', 'explain this', 'what did you just do', 'why this pattern', 'what should I learn from this'."
---

# Teach — Reflection Phase (Kolb's Learning Cycle)

After AI writes or edits code, explain the changes at an architecture level. This is the **Reflection** phase of the Reflective Learning Loop — turning raw experience into understanding.

## Learning Principle

> "Reflection transforms experience into learning." — Kolb's Experiential Learning Cycle
>
> The AI just wrote code (Experience). Now we reflect: what patterns were used, why those patterns, how they connect, what could go wrong. This builds mental models, not just syntax familiarity.

## Instructions

1. Identify the files that were recently changed in this session (check git diff or recent tool calls)
2. For each significant change, explain:
   - **What it does** (1-2 sentences, no line-by-line walkthrough)
   - **Why this pattern** (vs alternatives — e.g., "Zustand instead of Redux because...")
   - **How it connects** to the rest of the architecture (what calls it, what it depends on)
   - **What breaks if** this component fails (error paths, missing dependencies, cascading failures)
3. Link to concepts tracked by learn-while-code if the pattern matches a known concept (read `~/.learn-while-code/data/concepts.jsonl`)
4. Keep explanations conversational, not academic. Match the user's language.
5. End with: "Questions about this?" to invite the next phase (Recall via `/defend`)

## Output Format

```
## What Changed
[file list with 1-line architectural summary each]

## Pattern: [name]
**What:** [1-2 sentences]
**Why this, not [alternative]:** [trade-off explanation]
**Connects to:** [upstream/downstream dependencies]
**Fails when:** [error scenarios]

## Concepts Touched
- [concept-name] (status: encountered/quizzed/understood/mastered)
- [concept-name] ...

Questions about this?
```

## Gotchas
- **Use the learning profile.** The SessionStart hook injects what the user has mastered, understood, and what's weak. Don't over-explain mastered concepts — mention them as context ("you already know Express middleware — this uses the same pattern for..."). Spend depth on encountered/unseen concepts.
- Explain architecture decisions, not syntax. "This uses middleware" is useless. "Middleware here separates auth from business logic so each can be tested independently" is useful.
- If the change is trivial (typo fix, version bump), say "Nothing architecturally interesting — no new concepts here" and skip.
- Read the actual diff, don't guess from file names.
- When multiple patterns overlap, explain how they interact (e.g., "Express routing + JWT middleware + Zustand store form the request lifecycle").
