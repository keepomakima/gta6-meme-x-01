// gta6-meme-x-01 entrypoint (Node 22, standard library only).
//
// The entry is the X post itself: the meme image plus its caption. This
// program has one job for the grader — hand the post's address over. It
// reads POST.json from the repository root, checks that it is a JSON
// object with a non-empty "url" string, and copies it byte for byte to the
// grader's output directory. Nothing else happens here.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// /bot and /output inside the grader; the two environment variables let
// the same code run locally with the same behaviour.
const repoRoot = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const postPath = join(repoRoot, 'POST.json');
const destPath = join(outDir, 'POST.json');

function die(message) {
  console.error(message);
  process.exit(1);
}

let text;
try {
  text = readFileSync(postPath, 'utf8');
} catch {
  die(`cannot read POST.json in ${repoRoot}`);
}

let post;
try {
  post = JSON.parse(text);
} catch {
  die(`POST.json in ${repoRoot} is not valid JSON`);
}

if (typeof post !== 'object' || post === null || Array.isArray(post)) {
  die(`POST.json in ${repoRoot} must be a JSON object`);
}
if (typeof post.url !== 'string' || post.url.trim().length === 0) {
  die(`POST.json in ${repoRoot} must contain a non-empty "url" string`);
}

mkdirSync(outDir, { recursive: true });
try {
  copyFileSync(postPath, destPath);
} catch (err) {
  die(`cannot copy POST.json to ${outDir}: ${err.message}`);
}
