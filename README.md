# hn-cli

A minimal Hacker News CLI built with Bun. Browse top/new/best stories, read comments, and open articles — all from the terminal.

## Installation

Requires [Bun](https://bun.com).

```bash
git clone https://github.com/sergiosegrera/hn-cli.git
cd hn-cli
bun install
bun link
```

`bun link` adds `hn` to your PATH via `~/.bun/bin`. Make sure that directory is in your shell's PATH:

```bash
export PATH="$HOME/.bun/bin:$PATH"
```

## Usage

```bash
# Top 10 stories (default)
hn stories

# Control sort and count
hn stories -s newest -l 20
hn stories -s best -l 5

# Open a story in the browser
hn go <story_id>

# Show comments
hn comments <story_id>
hn comments <story_id> -l 20
```

## Claude Code skill

`SKILL.md` is a [Claude Code](https://claude.ai/code) skill that wires the `/hn` slash command to this CLI. Drop it in your skills directory:

```bash
mkdir -p ~/.claude/skills/hn
cp SKILL.md ~/.claude/skills/hn/SKILL.md
```

Then `/hn` in any Claude Code session will list top stories, and replying with a number summarizes that article.
