// Entry point for the gta6-meme-x-01 bounty entry (Node 22, stdlib only).
//
// What this entry really is: a post on X — one meme picture plus its
// caption. The judge never runs this file to make the meme; the file
// exists so the grader can find the post. Its whole job is to take the
// post's address out of POST.json at the repository root and hand it to
// the grader, unchanged, in the output directory.
//
// How the grader runs it:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The grader mounts the repository at /bot and expects output at
// /output. The two environment variables let the identical code run
// locally, so a local run exercises exactly what the grader will do.
const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const SOURCE = join(BOT_DIR, 'POST.json');
const TARGET = join(OUTPUT_DIR, 'POST.json');

// Hosts the grader can actually open a post on. Anything else is not
// a post address, even if it parses as a URL.
const POST_HOSTS = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com']);

function fail(message) {
  console.error(message);
  process.exit(1);
}

function loadPost() {
  let raw;
  try {
    raw = readFileSync(SOURCE, 'utf8');
  } catch {
    fail(`cannot read POST.json in ${BOT_DIR}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail(`POST.json in ${BOT_DIR} is not valid JSON`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    fail(`POST.json in ${BOT_DIR} must be a JSON object`);
  }
  return parsed;
}

function checkPostUrl(post) {
  if (typeof post.url !== 'string' || post.url.trim().length === 0) {
    fail(`POST.json in ${BOT_DIR} must contain a non-empty "url" string`);
  }
  if (post.url !== post.url.trim()) {
    fail(`POST.json in ${BOT_DIR} must not have surrounding whitespace in "url"`);
  }
  let address;
  try {
    address = new URL(post.url);
  } catch {
    fail(`POST.json in ${BOT_DIR} must contain a valid URL in "url" (expected a https://x.com/<handle>/status/<id> post URL)`);
  }
  if (address.protocol !== 'https:') {
    fail(`POST.json in ${BOT_DIR} must contain a https URL in "url" (got protocol "${address.protocol}")`);
  }
  if (!POST_HOSTS.has(address.hostname)) {
    fail(`POST.json in ${BOT_DIR} must point at x.com in "url" (got host "${address.hostname}")`);
  }
  if (address.username !== '' || address.password !== '') {
    fail(`POST.json in ${BOT_DIR} must not embed credentials in "url"`);
  }
  const parts = address.pathname.split('/').filter(Boolean);
  if (parts.length !== 3 || parts[1] !== 'status') {
    fail(`POST.json in ${BOT_DIR} must contain a post URL in "url" (expected https://x.com/<handle>/status/<id>)`);
  }
}

function main() {
  const post = loadPost();
  checkPostUrl(post);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  try {
    copyFileSync(SOURCE, TARGET);
  } catch (err) {
    fail(`cannot copy POST.json to ${OUTPUT_DIR}: ${err.message}`);
  }
}

main();
