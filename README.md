# learn-while-code

Stop vibe-coding blindly. Learn architecture and patterns while you build.

A [Claude Code](https://code.claude.com) plugin that adds a **teaching layer** on top of AI-assisted coding. Inspired by [Contral](https://www.producthunt.com/products/contral)'s Build/Learn/Defense modes. Instead of shipping code you don't understand, learn-while-code detects patterns you use, quizzes you on them, and tracks your progress with spaced repetition.

## Learning Framework

This plugin implements a **Reflective Learning Loop** grounded in four established learning principles:

### The 4-Step Loop

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ 1. GENERATE │───▶│ 2. EXPLAIN  │───▶│ 3. RECALL   │───▶│4. EXPERIMENT│
│ AI writes   │    │ AI teaches  │    │ You explain │    │ You modify  │
│ code        │    │ you why     │    │ without help│    │independently│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     hooks              /teach            /defend             /quiz
  (automatic)                                             (spaced repetition)
```

### Principles Used

| Principle | What it means | How the plugin uses it |
|-----------|---------------|------------------------|
| **Kolb's Experiential Learning** | Learn by doing, then reflecting, then forming concepts, then experimenting | Generate → Explain → Recall → Experiment loop on every AI code change |
| **Deliberate Practice** | Focused goals, repetition, immediate feedback | Each quiz targets one concept, rates your understanding, adjusts difficulty via SM-2 |
| **Retrieval Practice** | Recalling without help strengthens memory more than re-reading | `/defend` forces you to explain code in your own words before committing |
| **Spacing & Interleaving** | Review over time, mix topics | SM-2 schedules reviews at increasing intervals; quizzes mix categories (web, auth, infra) |

### How Each Feature Maps to a Principle

| Feature | Kolb Phase | Additional Principle |
|---------|------------|---------------------|
| Pattern Detection (hooks) | **Experience** — encounter patterns while building | Automatic, no effort required |
| `/teach` | **Reflection** — understand what happened and why | Builds mental models, not just syntax knowledge |
| `/defend` | **Conceptualization** — explain it yourself | Retrieval Practice — no peeking at the code explanation |
| `/quiz` | **Experimentation** — apply knowledge to new questions | Spacing (SM-2 intervals) + Interleaving (mixed categories) |
| `/map-arch` | **Conceptualization** — see the whole system | Builds architectural mental models beyond individual patterns |
| `/learning-status` | **Reflection** — see your progress over time | Deliberate Practice — identifies weak spots to focus on |

---

## Features

### 5 Skills (slash commands)

| Command | Mode | Description |
|---------|------|-------------|
| `/learn-while-code:teach` | Learn | Explain recent code changes — architecture, not syntax |
| `/learn-while-code:defend` | Defense | Explain AI-generated code before committing |
| `/learn-while-code:quiz` | Quiz | SM-2 spaced repetition on due concepts |
| `/learn-while-code:map-arch` | Explore | Scan repo, produce architecture summary |
| `/learn-while-code:learning-status` | Progress | Dashboard: streak, categories, cross-project stats |

### 3 Hooks (automatic)

| Hook | Event | What it does |
|------|-------|--------------|
| Pattern Detection | PostToolUse | Detects architecture patterns in code you write/edit/read |
| Post-Task Quiz | Stop | Asks 1 quiz question after significant work (1x per 30min max) |
| Defense Gate | PreToolUse | Optionally blocks `git commit` until `/defend` is run |

### Extras

- **SM-2 spaced repetition** — same algorithm as Anki
- **Cross-project tracking** — "Express middleware appears in 4 of your projects"
- **Obsidian sync** — concepts become notes in your vault
- **20 starter patterns** — SAP/BTP, Web, React, MCP, Auth, Infra
- **Configurable language** — English (default) or German

---

## Installation

### Option A: Claude Code Plugin (recommended)

```
/plugin install learn-while-code@YOUR_USERNAME/learn-while-code
```

Then run the setup script to seed your data:

```bash
~/.claude/plugins/learn-while-code/setup.sh
```

### Option B: Manual Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/learn-while-code.git ~/learn-while-code

# Run setup (creates ~/.learn-while-code/ with seed data and config)
cd ~/learn-while-code
chmod +x setup.sh
./setup.sh
```

Then add hooks to your `.claude/settings.json` (merge with existing hooks if you have any):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|Read",
        "hooks": [
          {
            "type": "command",
            "command": "bun ~/learn-while-code/hooks/learning-capture.ts",
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
            "command": "bun ~/learn-while-code/hooks/post-task-quiz.ts",
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
            "command": "bun ~/learn-while-code/hooks/defense-gate.ts",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

And symlink skills so Claude Code discovers them:

```bash
ln -s ~/learn-while-code/skills/teach ~/.claude/skills/learn-while-code-teach
ln -s ~/learn-while-code/skills/defend ~/.claude/skills/learn-while-code-defend
ln -s ~/learn-while-code/skills/quiz ~/.claude/skills/learn-while-code-quiz
ln -s ~/learn-while-code/skills/map-arch ~/.claude/skills/learn-while-code-map-arch
ln -s ~/learn-while-code/skills/learning-status ~/.claude/skills/learn-while-code-learning-status
```

---

## Configuration

Edit `~/.learn-while-code/config.json` (created by `setup.sh`):

```json
{
  "obsidian_vault": "",
  "obsidian_folder": "Learning/CodeConcepts",
  "sync_on_quiz": true,
  "sync_on_mastered": true,
  "language": "en",
  "defense_mode": "remind"
}
```

| Setting | Values | Default | Description |
|---------|--------|---------|-------------|
| `obsidian_vault` | path or `""` | `""` | Obsidian vault root. Empty = no sync. |
| `obsidian_folder` | string | `Learning/CodeConcepts` | Subfolder in vault for concept notes |
| `sync_on_quiz` | bool | `true` | Sync concept to Obsidian after quiz |
| `sync_on_mastered` | bool | `true` | Sync concept when it reaches "mastered" |
| `language` | `"en"` / `"de"` | `"en"` | Quiz and prompt language |
| `defense_mode` | `"strict"` / `"remind"` / `"off"` | `"remind"` | How the defense gate behaves |

### Obsidian Integration

Set `obsidian_vault` to your vault root and concept notes will be synced automatically:

```json
{
  "obsidian_vault": "/path/to/your/vault",
  "obsidian_folder": "Learning/CodeConcepts"
}
```

Each concept becomes a note with YAML frontmatter, quiz history, and project usage — all linked with tags for graph view.

---

## How It Works

### Concept State Machine

Every pattern you encounter progresses through 5 deterministic states:

```
unseen ──▶ encountered ──▶ quizzed ──▶ understood ──▶ mastered
           (automatic)     (1 quiz)    (3x correct)   (5x correct,
                                                        interval >21d)
```

- **unseen** → **encountered**: Pattern detected in your code (automatic, via hook)
- **encountered** → **quizzed**: You answered at least 1 quiz about it
- **quizzed** → **understood**: 3+ correct answers (quality >= 3)
- **understood** → **mastered**: 5+ correct answers with SM-2 interval > 21 days

All transitions are deterministic — no LLM judgment in the scoring.

### SM-2 Spaced Repetition

Same algorithm as [Anki](https://apps.ankiweb.net/). After each quiz answer, the system schedules the next review:

| Your rating | Meaning | Effect |
|-------------|---------|--------|
| 1 | Blackout, no idea | Reset to 1 day |
| 2 | Wrong but recognized topic | Reset to 1 day |
| 3 | Correct with difficulty | Interval: 1 → 6 → 15 → 35 days... |
| 4 | Correct with minor hesitation | Faster interval growth |
| 5 | Trivial, instant recall | Fastest growth, ease factor increases |

### Cross-Project Tracking

The pattern detection hook identifies which git repo you're in and maps patterns to projects. `learning-status` shows which patterns appear across multiple repos:

```
Cross-Project Patterns (Top 5):
  express-middleware     ████████ 4 projects  [understood]
  cloud-foundry-deploy   ██████  3 projects  [encountered]
  jwt-validation         ██████  3 projects  [quizzed]
```

Patterns used in more projects are prioritized in quizzes — they're more important to understand deeply.

### Defense Mode

Inspired by Contral's Defense Mode. Three settings:

| Mode | Behavior |
|------|----------|
| `strict` | Blocks `git commit` until you run `/defend` and answer questions about the code |
| `remind` | Shows a reminder when you commit without defending, but doesn't block |
| `off` | No defense gate |

---

## Adding Custom Patterns

Edit `~/.learn-while-code/data/patterns.jsonl`:

```json
{"id":"my-pattern","name":"My Custom Pattern","category":"Custom","description":"What it does","codeSignatures":["myFunction\\(","myImport"],"filePatterns":["*.ts"],"whyQuestion":"Why use this pattern instead of X?","explanation":"Because it solves Y by doing Z"}
```

And add a matching concept to `~/.learn-while-code/data/concepts.jsonl`:

```json
{"id":"my-pattern","name":"My Custom Pattern","category":"Custom","status":"unseen","interval":1,"easeFactor":2.5,"repetitions":0,"nextReview":"2026-01-01","lastSeen":"2026-01-01","encounterCount":0,"correctCount":0,"incorrectCount":0}
```

### Starter Patterns (20 included)

| Category | Patterns |
|----------|----------|
| SAP/BTP | Cloud Foundry deployment, XSUAA auth, BTP Object Store (S3), SAP AI Core |
| Web | Express middleware, Express routing, Vite bundling, CORS handling |
| React | Zustand state, React hooks lifecycle, component composition, Suspense boundaries |
| MCP | Server tool definition, transport types, client connection |
| Data | Prisma migrations, JSONL append pattern |
| Auth | JWT validation |
| Infra | Docker containerization, environment variables |

---

## Data Storage

All user data lives in `~/.learn-while-code/` (never in the plugin repo):

```
~/.learn-while-code/
├── config.json           # User configuration
├── progress.json         # Computed progress stats (auto-generated)
├── project-map.json      # Cross-project pattern map (auto-generated)
├── last-quiz.json        # Rate limiter state
├── defense-state.json    # Defense gate state
└── data/
    ├── concepts.jsonl    # Concept states + SM-2 metadata
    ├── patterns.jsonl    # Pattern signatures + explanations
    └── quiz-history.jsonl # All quiz attempts (append-only)
```

---

## Requirements

- [Claude Code](https://code.claude.com) CLI
- [Bun](https://bun.sh) runtime (for hook execution)

## Contributing

PRs welcome! Especially for:
- New pattern definitions (more frameworks, languages, cloud providers)
- Translations (question templates for other languages)
- Additional quiz question types

## License

MIT
