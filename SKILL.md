---
name: hn
description: Browse Hacker News from the terminal. Use this skill whenever the user mentions Hacker News, HN, wants to see top/new/best stories, read HN comments, open an HN story, or asks what a story is about / wants a summary of a story. Also triggers on just "/hn" with no arguments.
---

Run the `hn` CLI directly (it's globally linked via bun).

## Default behavior

If the user invokes `/hn` with no arguments or just says "hacker news", show top stories:

```bash
hn stories
```

## Commands

**List stories:**
```bash
hn stories [-s top|newest|best] [-l <number>]
```
Default: top 10. Adjust `-s` and `-l` based on what the user asks for.

**Open a story in the browser:**
```bash
hn go <story_id>
```

**Show comments on a story:**
```bash
hn comments <story_id> [-l <number>]
```

## Mapping user intent

- "show me HN" / "what's on HN" / just "/hn" → `hn stories`
- "top 5 stories" → `hn stories -l 5`
- "newest HN posts" → `hn stories -s newest`
- "best stories" → `hn stories -s best`
- "open story 12345" → `hn go 12345`
- "comments on 12345" → `hn comments 12345`
- A bare number (e.g. `3`, `7`) after a story list → summarize that story (see below)
- "what is going on with 3" / "tell me about story 5" / "summarize #2" / "what's that about" → summarize that story (see below)

Run the command and display the output directly to the user.

## Summarizing a story

When the user replies with a bare number, or asks what a story is about, or wants a summary:

1. **Identify the story** — map the number to its position in the most recently listed stories in the conversation, then get its HN story ID and URL.
2. **Fetch the article** — use the `mcp__exa__web_fetch_exa` tool with the story's URL to retrieve the full content. If that's unavailable, fall back to `WebFetch`.
3. **Summarize** — provide a concise summary of what the article is about: the main point, key arguments or findings, and why it might be interesting to an HN audience.

The summary should be a few sentences — enough to give the user a clear picture without needing to open the link themselves.
