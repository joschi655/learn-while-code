---
name: learn-project
description: "Write a rich project knowledge note into the Obsidian vault: architecture overview, core decision logic step by step, tools and principles used (linked to concept notes), and how everything connects. Deeper than map-arch — this is the note you actually learn from. Use when: 'learn project', 'document this project in my knowledgebase', 'add project knowledge', 'explain the logic of this project', 'project deep dive'."
---

# Learn Project — Whole-System Knowledge Note

Generates the note a future-you opens to re-understand a project: not just what stack it uses, but **how the logic works and why it's shaped that way**. This is Kolb's Conceptualization at project scale — connecting individual patterns into a coherent system model, and training the logical thinking needed to specify systems precisely.

## Learning Principle

> Understanding a system means being able to trace its decisions: which inputs matter, in what order they're checked, what happens at each branch. If you can narrate the logic flow from memory, you can also specify changes to it precisely. That's the skill this note trains.

## Instructions

### 1. Investigate the project (be thorough — this note must be self-sufficient)

- Read the README, entrypoints, and the core source files
- Identify the **central decision logic** — the algorithm at the heart of the project. Examples: account selection order in a switcher, retry/fallback chains, scheduling priorities, state machines
- Trace it precisely: what inputs, what order of checks, what tie-breakers, what happens on failure
- Identify tools, frameworks, and patterns used. Check `~/.learn-while-code/data/concepts.jsonl` for matching concept IDs — those get `[[wikilinks]]`
- Identify how components connect: who calls whom, where state lives, what the data flow is

### 2. Write the note

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

### 3. Cross-link

- Every tool/principle that has a concept note in the tracker gets a `[[concept-id]]` wikilink
- Link the auto-generated `[[_project-{name}]]` index note
- If other project knowledge notes exist at the top level and share concepts, link them under Related

### 4. Confirm

Report where the note was written and which concepts it links to. Suggest opening it in Obsidian and trying the "Think About It" questions.

## Gotchas
- **The Core Logic section is the point.** Don't write a generic stack list — trace the actual decision flow from the real code, in order, with reasons. If you can't find a central logic, say so and describe the dominant data flow instead.
- Read the actual code. Never write the logic section from the README alone — READMEs lie about edge cases.
- Match the depth to the project: a 10-file CLI gets a tighter note than a full-stack app, but the logic section is never skipped.
- Plain language over jargon. The reader is learning, not reviewing.
- Re-running overwrites the note — that's fine, it should reflect current state.
