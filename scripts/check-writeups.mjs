#!/usr/bin/env node
/*
 * Checks a batch of venue write-ups against docs/writing-style.md before the
 * owner sees them. No dependencies.
 *
 *   node scripts/check-writeups.mjs batch.json
 *
 * batch.json: [{ "slug": "tyga", "name": "Tyga", "text": "..." }, ...]
 * Exit code 1 if anything is flagged. Keep the word list in step with the doc.
 */

import { readFileSync } from "node:fs";

const BANNED_WORDS = [
  "nestled", "vibrant", "bustling", "hidden gem", "gem", "haven", "boasts", "elevate", "elevated", "delve",
  "culinary journey", "culinary experience", "culinary adventure", "gastronomic", "mouth-watering", "mouthwatering",
  "tantalising", "tantalizing", "indulgent", "indulge", "must-visit", "must-try", "foodie", "foodies",
  "look no further", "something for everyone", "authentic", "cosy ambience", "cozy ambiance", "warm and welcoming",
  "delightful", "exquisite", "delectable", "sumptuous", "scrumptious", "perfect spot", "perfect place", "go-to",
  "treat yourself", "feast for the senses", "symphony", "tapestry", "testament", "unforgettable", "unparalleled",
  "world-class", "top-notch", "second to none", "truly", "simply", "seamless", "curated", "a true",
  "offers a range of", "in the heart of", "whether you're", "verified", "checked", "certified", "approved",
];

const BANNED_PATTERNS = [
  [/\bwhether you(?:'re| are)\b/i, '"Whether you\'re..." opener'],
  [/\bnot just\b|\bmore than just\b/i, '"not just / more than just"'],
  [/\bit'?s not\b[^.]*\bit'?s\b/i, '"It\'s not X, it\'s Y"'],
  [/^from\b[^.]*\bto\b/i, '"From X to Y" opener'],
  [/(^|[.!?]\s+)(the|our|my)?\s*\w+:\s/i, "colon reveal"],
  [/\?/, "question mark (rhetorical question)"],
  [/!/, "exclamation mark"],
  [/—|\s–\s|\s--\s/, "dash used as punctuation (no em-dashes)"],
  [/^(located|situated)\b/i, '"Located/Situated in" opener'],
  [/\b(a must|well worth (a|the) (visit|trip)|won'?t be disappointed|you won'?t regret)\b/i, "summary sign-off"],
];

const words = (t) => t.trim().split(/\s+/).filter(Boolean);
const sentences = (t) => t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
const stdev = (xs) => Math.sqrt(mean(xs.map((x) => (x - mean(xs)) ** 2)));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function checkOne(item) {
  const issues = [];
  const warnings = [];
  const t = item.text ?? "";
  const n = words(t).length;
  if (n < 30 || n > 110) issues.push(`length ${n} words (aim for 30 to 110)`);

  for (const w of BANNED_WORDS) {
    if (new RegExp(`(^|[^a-z])${esc(w)}([^a-z]|$)`, "i").test(t)) issues.push(`banned word: "${w}"`);
  }
  for (const [re, label] of BANNED_PATTERNS) if (re.test(t)) issues.push(`banned pattern: ${label}`);

  // Rough: "A, B and C" with short items. A warning only, because commas between
  // clauses look the same to a regex. Read the flagged sentences yourself.
  const triples = t.match(/\b[\w'-]+(?: [\w'-]+)?, [\w'-]+(?: [\w'-]+)?,? and [\w'-]+\b/g) ?? [];
  if (triples.length > 1) warnings.push(`maybe ${triples.length} lists of three: ${triples.map((x) => `"${x}"`).join("; ")}`);

  const lens = sentences(t).map((s) => words(s).length);
  if (lens.length >= 3 && stdev(lens) < 3) issues.push(`flat rhythm: sentence lengths ${lens.join(", ")} (mix short and long)`);

  return { slug: item.slug, words: n, issues, warnings };
}

function checkBatch(items) {
  const issues = [];
  const first = items.map((i) => (words(i.text ?? "")[0] ?? "").toLowerCase().replace(/[^a-z']/g, ""));
  const counts = first.reduce((m, w) => m.set(w, (m.get(w) ?? 0) + 1), new Map());
  for (const [w, c] of counts) if (c > 1 && w) issues.push(`${c} write-ups open with "${w}"`);

  const byName = items.filter((i) => i.name && (i.text ?? "").trim().toLowerCase().startsWith(i.name.toLowerCase())).length;
  if (byName > 3) issues.push(`${byName} write-ups open with the venue's name (3 at most)`);

  const lens = items.map((i) => words(i.text ?? "").length);
  if (items.length >= 5 && stdev(lens) < 10) issues.push(`lengths too similar (${lens.join(", ")} words)`);

  const sentCounts = items.map((i) => sentences(i.text ?? "").length);
  if (items.length >= 5 && new Set(sentCounts).size === 1) issues.push(`every write-up has ${sentCounts[0]} sentences`);

  return issues;
}

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/check-writeups.mjs batch.json");
  process.exit(2);
}
const items = JSON.parse(readFileSync(file, "utf8"));
let flagged = 0;
for (const r of items.map(checkOne)) {
  if (r.issues.length) flagged++;
  console.log(`${r.issues.length ? "FIX" : "ok "}  ${r.slug} (${r.words} words)`);
  for (const i of r.issues) console.log(`       - ${i}`);
  for (const w of r.warnings) console.log(`       ? ${w}`);
}
const batch = checkBatch(items);
if (batch.length) {
  console.log("\nBatch:");
  for (const i of batch) console.log(`  - ${i}`);
}
console.log(`\n${flagged} of ${items.length} need fixing${batch.length ? `, ${batch.length} batch issue(s)` : ""}.`);
process.exit(flagged || batch.length ? 1 : 0);
