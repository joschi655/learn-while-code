---
name: sync-obsidian
description: "Sync all learning data to Obsidian vault. Rebuilds concept notes, category indexes, project indexes, and the overview MOC. Creates a connected knowledge graph visible in Obsidian's graph view. Use when: 'sync obsidian', 'update obsidian', 'rebuild vault', 'sync learning notes'."
---

# Sync Obsidian — Rebuild Learning Vault

Exports all learning data to Obsidian as a connected knowledge graph.

## What Gets Created

```
Learning/CodeConcepts/           (configurable via obsidian_folder)
├── _learn-while-code.md         # MOC — overview with progress bars, links to everything
├── _category-Web.md             # Category index — all Web concepts, mastery progress
├── _category-SAP.md             # Category index — all SAP concepts
├── _category-React.md           # ...
├── _project-MCP-CX-Operations.md   # Project index — concepts detected in this repo
├── _project-PlanningDashboard.md    # Project index
├── express-middleware.md         # Concept note — wikilinks to related concepts + projects
├── zustand-state.md             # Concept note
└── ...
```

## Graph Structure

Notes are connected via `[[wikilinks]]`:

- **Overview** (`_learn-while-code.md`) → links to all categories and projects
- **Category indexes** → link to all concepts in that category
- **Project indexes** → link to all concepts detected in that project
- **Concept notes** → link to their category, projects where used, and related concepts (co-occurring in same projects)

In Obsidian's graph view, this creates a hub-and-spoke layout:
- Categories and projects are hubs
- Concepts are nodes connected to both
- Related concepts form cross-links

## Instructions

1. Check that `obsidian_vault` is set in `~/.learn-while-code/config.json`
2. Read all concepts from `~/.learn-while-code/data/concepts.jsonl`
3. Read all patterns from `~/.learn-while-code/data/patterns.jsonl`
4. Read quiz history from `~/.learn-while-code/data/quiz-history.jsonl`
5. Read project map from `~/.learn-while-code/project-map.json`
6. For each concept: call `syncToObsidian(concept, pattern)` — writes concept note with wikilinks
7. Call `syncAllIndexes()` — writes category indexes, project indexes, and the overview MOC
8. Report: how many notes written, where, and suggest opening Obsidian graph view

## Output Format

```
## Obsidian Sync Complete

Vault: /path/to/vault/Learning/CodeConcepts/
Notes written: 28 (20 concepts + 4 categories + 3 projects + 1 overview)

Open Obsidian → Graph View to see your learning map.
Start from _learn-while-code.md for the overview.
```

## Gotchas
- If `obsidian_vault` is empty in config, tell the user to set it first and show the config path.
- Index files are prefixed with `_` so they sort to top in Obsidian's file explorer.
- The overview note uses `MOC` tag (Map of Content) — standard Obsidian convention.
- Re-running this is safe — all notes are overwritten, not duplicated.
