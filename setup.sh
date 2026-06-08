#!/bin/bash
set -e

CONFIG_DIR="$HOME/.learn-while-code"
DATA_DIR="$CONFIG_DIR/data"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Setting up learn-while-code..."

# Create directories
mkdir -p "$DATA_DIR"

# Copy seed data if no existing data
if [ ! -f "$DATA_DIR/concepts.jsonl" ]; then
  cp "$SCRIPT_DIR/data/concepts-seed.jsonl" "$DATA_DIR/concepts.jsonl"
  echo "Seeded $DATA_DIR/concepts.jsonl with 20 starter concepts"
else
  echo "concepts.jsonl already exists, skipping seed"
fi

if [ ! -f "$DATA_DIR/patterns.jsonl" ]; then
  cp "$SCRIPT_DIR/data/patterns-seed.jsonl" "$DATA_DIR/patterns.jsonl"
  echo "Seeded $DATA_DIR/patterns.jsonl with 20 pattern definitions"
else
  echo "patterns.jsonl already exists, skipping seed"
fi

# Create empty quiz history if not exists
touch "$DATA_DIR/quiz-history.jsonl"

# Create config from example if not exists
if [ ! -f "$CONFIG_DIR/config.json" ]; then
  cp "$SCRIPT_DIR/config/learn-while-code.example.json" "$CONFIG_DIR/config.json"
  echo "Created $CONFIG_DIR/config.json (edit to configure Obsidian vault, language, etc.)"
else
  echo "config.json already exists, skipping"
fi

echo ""
echo "Setup complete!"
echo ""
echo "Data directory: $CONFIG_DIR"
echo "Config file:    $CONFIG_DIR/config.json"
echo ""
echo "To install as Claude Code plugin:"
echo "  /plugin install learn-while-code@USERNAME/learn-while-code"
echo ""
echo "Or manually add hooks to .claude/settings.json (see README.md)"
echo ""
echo "Available commands after install:"
echo "  /learn-while-code:teach          - Explain recent code changes"
echo "  /learn-while-code:defend         - Defense mode before commit"
echo "  /learn-while-code:quiz           - Spaced repetition quiz"
echo "  /learn-while-code:map-arch       - Architecture summary"
echo "  /learn-while-code:learning-status - Progress dashboard"
