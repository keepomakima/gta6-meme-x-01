// gta6-meme-x-01 entrypoint (Node 22, standard library only).
//
// The entry is the X post itself: the meme image plus its caption. This
// program exists for the grader — it hands the post's address over. It
// reads POST.json from the repository root, checks that it is a JSON
// object carrying a non-empty "url" string, and copies the file byte for
// byte into the grader's output directory. That is all it does.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Inside the grader these are /bot and /output; the two environment
// variables let the same code run locally with the same behaviour.
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

// A non-empty string is not enough for the grader: the address has to
// parse as a real URL and use https, otherwise the grader cannot open
// the post. A bare word or an ftp:// link must fail loudly here.
let parsedUrl;
try {
  parsedUrl = new URL(post.url);
} catch {
  die(`POST.json in ${repoRoot} must contain a valid URL in "url" (expected a https://x.com/<handle>/status/<id> post URL)`);
}
if (parsedUrl.protocol !== 'https:') {
  die(`POST.json in ${repoRoot} must contain a https URL in "url" (expected a https://x.com/<handle>/status/<id> post URL, got protocol "${parsedUrl.protocol}")`);
}

mkdirSync(outDir, { recursive: true });
try {
  copyFileSync(postPath, destPath);
} catch (err) {
  die(`cannot copy POST.json to ${outDir}: ${err.message}`);
}
