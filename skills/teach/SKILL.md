---
description: "Explain code and patterns after AI writes them. Breaks down what was done, why this pattern, how it fits the architecture, and what could go wrong. Use when: 'teach me', 'explain this', 'what did you just do', 'why this pattern'."
---

# Teach — Learn Mode

After AI writes or edits code, explain the changes at an architecture level.

## Instructions

1. Identify the files that were recently changed in this session (check git diff or recent tool calls)
2. For each significant change, explain:
   - **What it does** (1-2 sentences, no line-by-line)
   - **Why this pattern** (vs alternatives — e.g., "Zustand instead of Redux because...")
   - **How it connects** to the rest of the architecture (what calls it, what it depends on)
   - **What breaks if** this fails (error paths, missing dependencies)
3. Link to concepts tracked by learn-while-code if the pattern matches a known concept
4. Keep explanations conversational, not academic. German if the user writes German, English otherwise.
5. End with: "Frage dazu?" / "Questions about this?"

## Format

```
## What changed
[file list with 1-line summary each]

## Pattern: [name]
**What:** ...
**Why this, not X:** ...
**Connects to:** ...
**Fails when:** ...

## Concepts touched
- [concept-name] (status: encountered/quizzed/...)
```

## Gotchas
- Don't explain syntax. Explain architecture decisions.
- If the user just ran a simple rename or typo fix, say "Nothing architecturally interesting here" and skip.
- Read the actual diff, don't guess from file names.
