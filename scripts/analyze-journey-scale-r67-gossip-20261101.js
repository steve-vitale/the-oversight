// scripts/analyze-journey-scale-r67-gossip-20261101.js — journey-scale r67
// GOSSIP-FALLBACK near-duplicate analyzer (PURE: reads transcript files only,
// no engine input, no game state).
//
// Background (r66): 85003 d120 Henrique served the reputation-fallback line
// twice in one sitting, re-framed by voice open/close draws:
//   "The way I read it — Word is you're doing right by people. Keep it up."
//   "Word is you're doing right by people. Keep it up. That's my read."
// The driver's exact-duplicate flag missed it because the lines differ.
// This analyzer strips voice framing and flags normalized-core matches.
//
// Normalization (fixed BEFORE reading r67 results, per the r67 prereg):
//   1. Take THEM: lines only (driver format `THEM: <line>`).
//   2. Strip one layer of outer double quotes.
//   3. Strip a leading voice open: any prefix ending in an em dash within
//      the first 32 chars ("The way I read it — ", "Here's what I think — ",
//      "Heh. " is NOT stripped — it has no dash; it survives into the core,
//      which only makes matching stricter, never looser).
//   4. Strip a trailing voice close sentence if the line ends with one of
//      the known close draws (measured set + weathered/quiet sets seen in
//      characterGen.json voice tables).
//   5. Lowercase, strip punctuation, collapse whitespace.
// A pair is an EXACT repeat if the raw lines are identical, else a NEAR
// repeat if normalized cores are identical and non-empty. Report turn
// distance as the gap in THEM-line index. A pair whose core equals the
// reputation-fallback core is tagged FALLBACK.
// Usage: node scripts/analyze-journey-scale-r67-gossip-20261101.js [EVIDIR]
// Defaults: evidence/2026-11-01/journey-scale-r67. Prints a per-transcript
// report; exit 0 always (this is a reporter, not a gate).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const CLOSES = [
  "that's my read.", 'makes sense to me.', 'worth considering.',
  'seen worse.', "it'll pass.", 'give it time.',
  'just an idea.', 'moving on.', 'cool, cool.',
  '...if that helps.', "i don't know, though.", '...yeah.',
];

const FALLBACK_CORE = 'word is you re doing right by people keep it up';

function stripQuotes(s) {
  s = String(s == null ? '' : s).trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
  return s;
}

function normalizeLine(raw) {
  let s = stripQuotes(raw).trim();
  // Leading voice open: prefix ending in an em dash near the start.
  const dash = s.indexOf('—');
  if (dash !== -1 && dash <= 32) s = s.slice(dash + 1).trim();
  // Trailing voice close: exact known close sentence at the end.
  const low = s.toLowerCase();
  for (const c of CLOSES) {
    if (low.endsWith(c)) { s = s.slice(0, s.length - c.length).trim(); break; }
  }
  s = stripQuotes(s);
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function analyzeTranscript(text) {
  const lines = String(text).split('\n');
  const them = [];
  lines.forEach((ln, i) => {
    const m = /^THEM: (.*)$/.exec(ln);
    if (m) them.push({ idx: i, raw: m[1], core: normalizeLine(m[1]) });
  });
  const pairs = [];
  for (let a = 0; a < them.length; a++) {
    for (let b = a + 1; b < them.length; b++) {
      if (!them[a].core) continue;
      if (them[a].core === them[b].core) {
        pairs.push({
          kind: them[a].raw === them[b].raw ? 'EXACT' : 'NEAR',
          core: them[a].core,
          fallback: them[a].core === FALLBACK_CORE,
          distance: b - a,
          first: them[a].raw,
          second: them[b].raw,
        });
      }
    }
  }
  return { themCount: them.length, pairs };
}

function main() {
  const evid = process.argv[2] || path.join(ROOT, 'evidence', '2026-11-01', 'journey-scale-r67');
  const files = fs.existsSync(evid) ? fs.readdirSync(evid).filter(f => /transcript-.*\.txt$/.test(f)).sort() : [];
  if (!files.length) { console.log('no transcripts in ' + evid); return; }
  let totalPairs = 0, totalFallback = 0;
  for (const f of files) {
    const r = analyzeTranscript(fs.readFileSync(path.join(evid, f), 'utf8'));
    totalPairs += r.pairs.length;
    totalFallback += r.pairs.filter(p => p.fallback).length;
    console.log(`== ${f}: ${r.themCount} THEM lines, ${r.pairs.length} repeat pairs`);
    for (const p of r.pairs) {
      console.log(`   [${p.kind}${p.fallback ? ' FALLBACK' : ''} dist=${p.distance}] core="${p.core}"`);
      console.log(`      1: ${p.first}`);
      console.log(`      2: ${p.second}`);
    }
  }
  console.log(`TOTAL: ${totalPairs} repeat pairs, ${totalFallback} fallback pairs, across ${files.length} transcripts`);
}

if (require.main === module) main();
module.exports = { normalizeLine, analyzeTranscript, FALLBACK_CORE };
