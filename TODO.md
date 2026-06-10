# TODO

## Next up

- [ ] **Codex CLI support** — research done, port is straightforward:
  - `.codex-plugin/plugin.json` manifest (mirrors `.claude-plugin/plugin.json`)
  - `hooks/hooks.codex.json` — same JSON shape, same events (PostToolUse, Stop, PreToolUse, SessionStart all exist in Codex)
  - Skills work as-is: same `SKILL.md` + frontmatter format, discovered via `.agents/skills/` or `~/.agents/skills/`
  - Optional `agents/openai.yaml` per skill for UI metadata
  - Note: Codex requires users to trust hooks once via `/hooks` before they run
- [ ] **Test plugin install path** — `/plugin install learn-while-code@joschi655/learn-while-code` is documented but untested; only manual symlink setup is verified
- [ ] **learn-project: auto-refresh MOC** — after writing a project knowledge note, run `syncAllIndexes()` so the overview links it without a manual sync
- [x] **Cheaper model for learning** — `study` skill recommends `/model haiku` at session start and delegates free-text grading to a Haiku subagent (shipped)

## Improvements

- [ ] **Pattern signature precision** — markdown exclusion shipped (false positives from .md files fixed), but signatures still lack word boundaries; tighten if a code-file false positive shows up
- [ ] **German pattern translations** — `language: "de"` config exists, but `patterns.jsonl` whyQuestion/explanation are English-only; add localized fields or a de seed file
- [ ] **ConceptManager CLI** — small CLI for status/due/reset operations on concepts.jsonl (useful for debugging without a Claude session)
- [ ] **More seed patterns** — current 20 cover SAP/Web/React/MCP/Data/Auth/Infra; candidates: testing patterns, CI/CD, queue/worker patterns, caching strategies

## Ideas

- [ ] Weekly digest note in Obsidian (what was learned this week, streak, due next week)
- [ ] `learn-project --update` mode that diffs against the existing note instead of overwriting
- [ ] Quiz questions generated from project knowledge notes ("Think About It" sections feed the quiz pool)
