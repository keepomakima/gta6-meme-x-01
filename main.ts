// gta6-meme-x-01 entrypoint (Node 22, standard library only).
//
// The entry itself is the X post: the meme image plus its caption. This
// program does exactly one job for the grader — it hands the post's address
// over. It reads POST.json from the repository root and copies it to the
// grader's output directory, where the gate reads it. Nothing else.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Outside the grader's container the two environment variables stand in for
// /bot and /output. The copy is deterministic: two runs write the same bytes.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Where the repository lives (/bot in the grader) and where the gate looks
// for the result (/output in the grader). Defaults match the grader; the
// environment variables let us run the same code locally.
const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'POST.json');
const TARGET = join(OUTPUT_DIR, 'POST.json');

// Fail with a clear message when the post file is unusable, instead of
// handing the gate a broken file. Returns the parsed object on success.
function loadPostFile(path) {
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch {
    console.error(`POST.json could not be read from ${BOT_DIR}`);
    process.exit(1);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error(`POST.json in ${BOT_DIR} is not valid JSON`);
    process.exit(1);
  }
  if (typeof parsed !== 'object' || parsed === null || typeof parsed.url !== 'string') {
    console.error(`POST.json in ${BOT_DIR} must be a JSON object with a "url" string`);
    process.exit(1);
  }
  if (parsed.url.trim() === '') {
    console.error(`POST.json in ${BOT_DIR} has an empty "url"`);
    process.exit(1);
  }
  return parsed;
}

loadPostFile(SOURCE);

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(SOURCE, TARGET);
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
