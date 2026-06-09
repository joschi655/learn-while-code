---
description: "Check a free-text answer against the correct answer stored in an Obsidian concept note. Use when: 'check my answer for [[concept]]', 'was I right about X', 'grade my answer', 'did I get it'."
---

# Check Answer — Retrieval Practice Grading

Grades a free-text answer against the stored correct answer for a concept.

## Instructions

1. Parse the concept ID from the user's message (e.g. `[[express-middleware]]` → `express-middleware`)
2. Read the concept note from the Obsidian vault:
   - Config: `~/.learn-while-code/config.json` → `obsidian_vault` + `obsidian_folder`
   - Note path: `{obsidian_vault}/{obsidian_folder}/{concept-id}.md`
3. Extract `quiz_answer` from the YAML frontmatter
4. Compare the user's answer to `quiz_answer`:
   - **Core idea correct** (4-5/5): User captured the main WHY, even if phrasing differs
   - **Partial** (2-3/5): User got the direction but missed the key mechanism or trade-off
   - **Wrong** (1/5): User described what it does, not why — or got it backwards
5. Give feedback:
   - What they got right
   - What they missed or could sharpen
   - The correct answer (1-2 sentences)
6. Update the concept's SM-2 score: call `sm2Update(concept, quality)` and write back to concepts.jsonl
7. Append to quiz-history.jsonl

## Output Format

```
## Answer Check: [Concept Name]

**Your answer:** [quote their answer]
**Score:** 4/5

✅ You got the core idea — [what they nailed]
⚠️ You missed — [what was absent]

**Correct answer:** [quiz_answer from frontmatter]

SM-2 updated — next review: [date]
```

## Gotchas
- Be generous: if they got the core WHY right, score 4+. Don't penalize for missing edge cases.
- If the concept note doesn't exist yet, say "No note found for [[concept-id]] — sync Obsidian first with `/sync-obsidian`."
- If `quiz_answer` is empty in frontmatter, fall back to the `explanation` field in patterns.jsonl.
