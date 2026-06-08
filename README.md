# learn-while-code

Stop vibe-coding blindly. Learn architecture and patterns while you build.

A [Claude Code](https://code.claude.com) plugin inspired by [Contral](https://www.producthunt.com/products/contral) that adds a teaching layer on top of AI-assisted coding. Instead of just shipping code you don't understand, learn-while-code detects what patterns you're using, quizzes you on them, and tracks your progress with spaced repetition.

## Features

**5 Skills (slash commands):**
- `/learn-while-code:teach` — Explain recent code changes at an architecture level
- `/learn-while-code:defend` — Defense Mode: explain code before committing (like Contral's Defense Mode)
- `/learn-while-code:quiz` — Spaced repetition quiz with SM-2 scheduling
- `/learn-while-code:map-arch` — Scan repo and produce architecture summary
- `/learn-while-code:learning-status` — Progress dashboard with streak, categories, cross-project stats

**3 Hooks (automatic):**
- **Pattern Detection** (PostToolUse) — Detects architecture patterns in code you write/edit/read
- **Post-Task Quiz** (Stop) — Asks 1 quiz question after significant work (rate-limited to 1x/30min)
- **Defense Gate** (PreToolUse) — Optionally blocks `git commit` until you run `/defend`

**Extras:**
- SM-2 spaced repetition algorithm (same as Anki)
- Cross-project pattern tracking ("Express middleware used in 4 of your projects")
- Obsidian vault sync (concepts become notes in your vault)
- 20 starter patterns (SAP/BTP, Web, React, MCP, Auth, Infra)
- German + English support

## Install

### Option A: Claude Code Plugin (recommended)

```
/plugin install learn-while-code@YOUR_USERNAME/learn-while-code
```

### Option B: Manual Setup

```bash
git clone https://github.com/YOUR_USERNAME/learn-while-code.git
cd learn-while-code
chmod +x setup.sh
./setup.sh
```

Then add hooks to your `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|Read",
        "hooks": [
          {
            "type": "command",
            "command": "bun /path/to/learn-while-code/hooks/learning-capture.ts",
            "timeout": 5
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bun /path/to/learn-while-code/hooks/post-task-quiz.ts",
            "timeout": 5
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bun /path/to/learn-while-code/hooks/defense-gate.ts",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## Configuration

Edit `~/.learn-while-code/config.json`:

```json
{
  "obsidian_vault": "/path/to/your/obsidian/vault",
  "obsidian_folder": "Learning/CodeConcepts",
  "sync_on_quiz": true,
  "sync_on_mastered": true,
  "language": "de",
  "defense_mode": "remind"
}
```

| Setting | Values | Default | Description |
|---------|--------|---------|-------------|
| `obsidian_vault` | path or `""` | `""` | Obsidian vault root. Empty = no sync. |
| `obsidian_folder` | string | `Learning/CodeConcepts` | Subfolder in vault for concept notes |
| `sync_on_quiz` | bool | `true` | Sync concept to Obsidian after quiz |
| `sync_on_mastered` | bool | `true` | Sync concept when it reaches "mastered" |
| `language` | `"de"` / `"en"` | `"de"` | Quiz question language |
| `defense_mode` | `"strict"` / `"remind"` / `"off"` | `"remind"` | How the defense gate behaves |

## How It Works

### Pattern Detection
When you write, edit, or read code files, the `learning-capture` hook matches content against 20+ code signatures (regex patterns). Matches update the concept tracker:

```
unseen --> encountered --> quizzed --> understood --> mastered
```

Each transition is deterministic:
- `encountered`: Pattern detected in your code (automatic)
- `quizzed`: Answered at least 1 quiz about it
- `understood`: 3+ correct answers (quality >= 3)
- `mastered`: 5+ correct answers with SM-2 interval > 21 days

### SM-2 Spaced Repetition
Same algorithm as Anki. After each quiz answer:
- Quality 1-2: Reset interval to 1 day (need more practice)
- Quality 3: Interval grows: 1 -> 6 -> 15 -> 35 days...
- Quality 4-5: Interval grows faster (ease factor increases)

### Cross-Project Tracking
The hook detects which git repo you're in and maps patterns to projects. `/learning-status` shows which patterns appear across multiple projects, helping you prioritize what to learn deeply.

### Defense Mode
Inspired by Contral's Defense Mode. Before committing, you explain the code:
- `strict`: Blocks `git commit` until `/defend` is run
- `remind`: Shows a reminder but lets you commit
- `off`: No defense gate

## Adding Custom Patterns

Edit `~/.learn-while-code/data/patterns.jsonl` to add your own patterns:

```json
{"id":"my-pattern","name":"My Custom Pattern","category":"Custom","description":"What it is","codeSignatures":["myFunction\\(","myImport"],"filePatterns":["*.ts"],"whyQuestion":"Why use this pattern?","explanation":"Because..."}
```

Then add a matching concept to `~/.learn-while-code/data/concepts.jsonl`:

```json
{"id":"my-pattern","name":"My Custom Pattern","category":"Custom","status":"unseen","interval":1,"easeFactor":2.5,"repetitions":0,"nextReview":"2026-01-01","lastSeen":"2026-01-01","encounterCount":0,"correctCount":0,"incorrectCount":0}
```

## Data Storage

All data lives in `~/.learn-while-code/`:

```
~/.learn-while-code/
├── config.json           # User configuration
├── progress.json         # Computed progress stats
├── project-map.json      # Cross-project pattern map
├── last-quiz.json        # Rate limiter state
├── defense-state.json    # Defense gate state
└── data/
    ├── concepts.jsonl    # Concept states + SM-2 metadata
    ├── patterns.jsonl    # Pattern signatures + explanations
    └── quiz-history.jsonl # All quiz attempts
```

## Requirements

- [Claude Code](https://code.claude.com) CLI
- [Bun](https://bun.sh) runtime (for hook execution)

## License

MIT
