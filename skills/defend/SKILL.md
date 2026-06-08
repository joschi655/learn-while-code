---
description: "Defense Mode — explain AI-generated code before committing. Asks 3-5 targeted questions about logic, data flow, error handling, and architectural decisions. Blocks shallow understanding. Use when: 'defend', 'defense mode', 'explain before commit', 'prove I understand'."
---

# Defend — Defense Mode

Forces understanding before shipping. After AI writes code, you must explain it.

## Instructions

1. Identify all files changed since the last commit (use `git diff --name-only`)
2. Read the actual changes (`git diff` for staged, `git diff HEAD` for all)
3. Generate 3-5 targeted questions about the code. Questions must be:
   - **WHY questions** (not "what does line X do")
   - About **data flow** ("Where does this data come from? What transforms it?")
   - About **error paths** ("What happens if this API call fails?")
   - About **dependencies** ("What other services does this touch?")
   - About **trade-offs** ("Why this approach instead of X?")
4. Present questions one at a time. Wait for the user's answer.
5. After each answer, briefly confirm if correct or explain the right answer.
6. Rate each answer 1-5 and record via the concept tracker if a matching concept exists.
7. After all questions: update `~/.learn-while-code/defense-state.json` with `last_defend_run` timestamp.
8. If Obsidian sync is enabled, sync any concepts that were quizzed.

## Question Templates

```
- "Warum [pattern] statt [alternative] hier?"
- "Was passiert wenn [service/API] nicht erreichbar ist?"
- "Woher kommen die Daten in [variable/prop]? Welchen Weg nehmen sie?"
- "Welche anderen Dateien/Services haengen von dieser Aenderung ab?"
- "Was wuerde brechen wenn du [component/function] entfernst?"
```

## After Completion

Write to `~/.learn-while-code/defense-state.json`:
```json
{ "last_defend_run": "2026-06-08T14:30:00Z", "session_id": "..." }
```

This unblocks the defense-gate hook for the next `git commit`.

## Gotchas
- Never ask about syntax ("What does const mean?"). Always architecture-level.
- If changes are trivial (README update, version bump), say "No defense needed" and update the timestamp anyway.
- German questions by default. Switch to English if user answers in English.
