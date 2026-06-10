---
name: learn-project
description: "Write a rich project knowledge note into the Obsidian vault: architecture overview, core decision logic step by step, tools and principles used (linked to concept notes), and how everything connects. Deeper than map-arch — this is the note you actually learn from. Use when: 'learn project', 'document this project in my knowledgebase', 'add project knowledge', 'explain the logic of this project', 'project deep dive'."
---

# Learn Project — Whole-System Knowledge Note

Generates the note a future-you opens to re-understand a project: not just what stack it uses, but **how the logic works and why it's shaped that way**. This is Kolb's Conceptualization at project scale — connecting individual patterns into a coherent system model, and training the logical thinking needed to specify systems precisely.

## Learning Principle

> Understanding a system means being able to trace its decisions: which inputs matter, in what order they're checked, what happens at each branch. If you can narrate the logic flow from memory, you can also specify changes to it precisely. That's the skill this note trains.

## The Flow — Explain First, Write Second, Quiz Later

This is the order, always:

1. **Investigate** the project from the real code
2. **Explain it to the user conversationally** and invite questions — this is the learning moment, it comes BEFORE the note
3. **Write the knowledge note** to Obsidian (the durable record of what was just explained)
4. **Point to `study`** for later spaced-repetition review

Never skip step 2 to jump straight to writing a file. The user learns by having it explained and by asking follow-ups — the note is the artifact, not the teaching.

## Instructions

### 1. Investigate the project (be thorough — this note must be self-sufficient)

- Read the README, entrypoints, and the core source files
- Identify the **central decision logic** — the algorithm at the heart of the project. Examples: account selection order in a switcher, retry/fallback chains, scheduling priorities, state machines
- Trace it precisely: what inputs, what order of checks, what tie-breakers, what happens on failure
- Identify tools, frameworks, and patterns used. Check `~/.learn-while-code/data/concepts.jsonl` for matching concept IDs — those get `[[wikilinks]]`
- Identify how components connect: who calls whom, where state lives, what the data flow is

### 2. Explain it — out loud, before writing anything

Walk the user through what you found, in plain language, in this order:
- **What the project does** and the core problem it solves (1-2 sentences)
- **The architecture** — components and how they connect
- **The core decision logic, step by step** — narrate it, with the WHY for each ordering choice. This is the centerpiece.
- **The tools and principles used** and why each one fits here

Then stop and say: **"Frag mich was du willst — wenn's sitzt, schreib ich die Note in deine Knowledgebase."** Answer follow-up questions until the user is satisfied. This back-and-forth IS the learning; the note just captures it. Only proceed to writing once the user signals they've got it (or explicitly says "schreib die Note" / "go ahead").

### 3. Write the note

Target: `{obsidian_vault}/{obsidian_folder}/{ProjectName}.md` (top level, NOT in Concepts/ or System/). Read config from `~/.learn-while-code/config.json`.

```markdown
---
type: project-knowledge
project: {project-name}
repo: {path}
created: {date}
tags:
  - learn-while-code
  - project-knowledge
---

# {Project Name}

> One-paragraph: what this project does and the core problem it solves.

## Architecture Overview

{Components and how they connect. A small ASCII diagram if it helps.
Who calls whom, where state lives, what the boundaries are.}

## Core Logic — How It Decides

{THE most important section. Step-by-step narration of the central
decision logic, numbered, in plain language. e.g. for an account
switcher: "1. Read all accounts from X. 2. Filter out accounts that
hit their rate limit (checked via Y). 3. Sort remaining by Z. 4. Pick
the first; on auth failure, mark cooldown and retry with next..."

Include the WHY for each rule: what breaks if the order were different,
what edge case each check protects against.}

## Tools & Principles Used

| Tool/Principle | Role here | Concept |
|---------------|-----------|---------|
| {e.g. JSONL storage} | {why this project uses it} | [[jsonl-append-pattern]] |
| {tool without concept note} | {role} | — |

## How It Connects

{The web: which principle enables which feature. "The cooldown logic
works because state is persisted in X, which survives restarts because
of Y..." — 2-4 sentences linking the pieces.}

## Think About It

{2-3 WHY questions about THIS project's logic, for self-testing:
- "Why is the rate-limit check before the sort, not after?"
- "What happens if two processes switch accounts simultaneously?"}

## Related
- [[_project-{project-name}]] (auto-tracked concepts)
- {other relevant project knowledge notes}
```

### 4. Cross-link

- Every tool/principle that has a concept note in the tracker gets a `[[concept-id]]` wikilink
- Link the auto-generated `[[_project-{name}]]` index note
- If other project knowledge notes exist at the top level and share concepts, link them under Related
- Run `syncAllIndexes()` so the MOC (`_learn-while-code.md`) links the new note

### 5. Confirm and hand off

Report where the note was written and which concepts it links to. Then point forward: "Die Note liegt jetzt in deiner Knowledgebase. Später kannst du `study` sagen — dann frag ich dich an den 'Think About It'-Fragen ab und tracke das mit Spaced Repetition."

## Gotchas
- **The Core Logic section is the point.** Don't write a generic stack list — trace the actual decision flow from the real code, in order, with reasons. If you can't find a central logic, say so and describe the dominant data flow instead.
- Read the actual code. Never write the logic section from the README alone — READMEs lie about edge cases.
- Match the depth to the project: a 10-file CLI gets a tighter note than a full-stack app, but the logic section is never skipped.
- Plain language over jargon. The reader is learning, not reviewing.
- Re-running overwrites the note — that's fine, it should reflect current state.
