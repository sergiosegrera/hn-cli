#!/usr/bin/env bun

import { Command } from "commander";
import chalk from "chalk";
import open from "open";

const HN_API = "https://hacker-news.firebaseio.com/v0";

interface HNItem {
  id: number;
  title?: string;
  url?: string;
  by?: string;
  score?: number;
  descendants?: number;
  text?: string;
  kids?: number[];
  time?: number;
  type?: string;
}

async function fetchItem(id: number): Promise<HNItem> {
  const res = await fetch(`${HN_API}/item/${id}.json`);
  return res.json();
}

async function fetchStoryIds(sort: string): Promise<number[]> {
  const endpoints: Record<string, string> = {
    top: "topstories",
    best: "beststories",
    newest: "newstories",
  };
  const endpoint = endpoints[sort] ?? "topstories";
  const res = await fetch(`${HN_API}/${endpoint}.json`);
  return res.json();
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<p>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}

const program = new Command();

program
  .name("hn")
  .description("HackerNews CLI — for hackers")
  .version("1.0.0");

program
  .command("stories")
  .description("List stories from HackerNews")
  .option("-s, --sort <type>", "sort by: top, newest, or best", "top")
  .option("-l, --limit <number>", "number of stories to show", "10")
  .action(async (options) => {
    const limit = parseInt(options.limit);
    const ids = await fetchStoryIds(options.sort);
    const stories = await Promise.all(ids.slice(0, limit).map(fetchItem));

    console.log(
      chalk.bold(`\n  ${options.sort === "best" ? "Best" : options.sort === "newest" ? "Newest" : "Top"} Stories\n`)
    );

    for (const story of stories) {
      if (!story) continue;
      const points = chalk.yellow(`${story.score ?? 0} pts`);
      const comments = chalk.cyan(`${story.descendants ?? 0} comments`);
      const by = chalk.gray(`by ${story.by}`);
      const ago = chalk.gray(timeAgo(story.time ?? 0));
      const id = chalk.dim(`[${story.id}]`);

      console.log(`  ${id} ${chalk.bold(story.title)}`);
      console.log(`     ${points}  ${comments}  ${by}  ${ago}`);
      if (story.url) console.log(`     ${chalk.dim(story.url)}`);
      console.log();
    }
  });

program
  .command("go")
  .description("Open a story in the browser")
  .argument("<story_id>", "story ID to open")
  .action(async (storyId) => {
    const story = await fetchItem(parseInt(storyId));
    const url = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
    console.log(chalk.green(`Opening: ${story.title}`));
    await open(url);
  });

program
  .command("comments")
  .description("Show comments for a story")
  .argument("<story_id>", "story ID")
  .option("-l, --limit <number>", "max top-level comments to show", "10")
  .action(async (storyId, options) => {
    const story = await fetchItem(parseInt(storyId));
    console.log(chalk.bold(`\n  Comments on: ${story.title}\n`));

    if (!story.kids?.length) {
      console.log(chalk.gray("  No comments yet.\n"));
      return;
    }

    const limit = parseInt(options.limit);
    const commentIds = story.kids.slice(0, limit);
    const comments = await Promise.all(commentIds.map(fetchItem));

    for (const comment of comments) {
      if (!comment || comment.text === undefined) continue;
      const by = chalk.cyan(comment.by ?? "unknown");
      const ago = chalk.gray(timeAgo(comment.time ?? 0));
      const text = stripHtml(comment.text);

      console.log(`  ${by}  ${ago}`);
      for (const line of text.split("\n")) {
        console.log(`    ${line}`);
      }
      console.log();
    }
  });

program.parse();
