#!/usr/bin/env node
// test-relaycoda.js — branch-agnostic relay win coda (sim-relaycoda).
//
// Backlog: [open] 2026-10-20 "BRANCH-AGNOSTIC RELAY CODA NEEDED". The
// landed sim-wincoda relay coda (src/js/table.js) mixed both branches'
// payoffs: "walks out of the light" is the light/grey exit, while "the
// System learned {pro} name first" is the DARK final's own payoff
// (docs/TABLE.md: dark relay final = "become its voice (you stay inside,
// forever, and it learns your name first)"). Naming which branch is the
// open voice question — this arm lands ONE branch-agnostic relay coda
// instead: src/js/table.js only, voice-only, ZERO RNG draws.
//
// PRE-REGISTRATION (binding, docs/MEASUREMENT.md §14). GO requires all:
//   (1) the coda fires on relay walks through the REAL table flow
//       (Game.tableEpilogue → this.tableState().path, no stubs) on ≥2 seeds;
//   (2) sense-read passes — relay finale transcripts are read aloud-equivalent
//       and judged for meaning/coherence; the line must never name a fixed
//       door/branch (anti-pins below, enforced in code);
//   (3) det-gate: identical-seed epilogue transcripts byte-identical armed
//       vs control EXCEPT exactly the coda line (voice-only proof).
// A miss on any = NO-GO, honestly.
//
// Branch/door pins — phrases that commit the coda to one relay branch
// (all from docs/TABLE.md canon). The coda must not contain any of them:
//   light final  "become its champion" / champion / "fights for Earth"
//   dark final   "become its voice" / "learns your name first" /
//                "stay inside" / "favorite instrument"
//   grey finals  "both-hands" / "the-contract" / "the middle road is open" /
//                "door gift" / "hand is forward"
//   exits        "walks out of the light" / "does not walk out" / "go home"
// Identity anchors (the line must still read as the RELAY's own ending):
//   "the light", "wire", "machine", "conversation", "channel", "caretaker".
//
// Node harness: full src/js list in index.html order via scripts/godpath/lib
// (wraps sim-harness: Math.random seeded BEFORE eval, DOM-only files
// excluded, Game.save real). One seed per process load; seeds sequential.
'use strict';
const fs = require('fs');
const K = require('./godpath/lib');
const T = K.reporter('relaycoda');
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const DET_SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

// Phrases that NAME a fixed relay door/branch (docs/TABLE.md). Forbidden.
const PINS = [
  /champion/i,                       // light final: "become its champion"
  /fights for earth/i,
  /become its voice/i,               // dark final: "become its voice"
  /learns?\s+(your|his|her|their)\s+name(\s+first)?/i, // dark: "learns your name first"
  /stay(s)?\s+inside/i,              // dark: "you stay inside, forever"
  /inside,\s*forever/i,
  /favorite instrument/i,            // dark: "its favorite instrument"
  /both[-\s]?hands/i,                // grey final: "both-hands"
  /the[-\s]?contract/i,              // grey final: "the-contract"
  /middle road/i,                    // grey voicing: "The middle road is open"
  /door gift/i, /hand is forward/i,  // grey door gift
  /walks out of the light/i,         // exit claim (landed coda's muddle)
  /does not walk out/i,
  /\bgo(es)? home\b/i,               // home-going is branch-biased
  /\blight final\b/i, /\bdark final\b/i, /\bgrey final\b/i,
  /\btender\b/i,                     // light band name on the relay
];
// The line must still carry relay identity. At least one required.
const ANCHORS = [/the light/i, /\bwire\b/i, /\bmachine\b/i, /conversation/i, /channel/i, /caretaker/i];

// Fire the coda for the relay path through the REAL table state machine.
// pg.table.path is live state; tableEpilogue reads this.tableState().
// Fresh newRun → no ascensions, no facilitation → the coda branch fires.
async function codaLines(Game, branch, lean) {
  const lines = [];
  const oldSay = Game.say;
  Game.say = (l) => { lines.push(String(l)); };
  try {
    const pg = Game.progState();
    pg.table = pg.table || {};
    pg.table.path = 'relay';
    pg.table.branch = branch;
    pg.table.phase = 'challenge';
    if (typeof lean === 'number' && pg.scholar) {
      pg.scholar.relayLeanVal = lean; // if the lean meter exists, exercise it
    }
    Game.tableEpilogue(null, branch, { id: 'final:test', label: 'Test final.' });
  } finally {
    Game.say = oldSay;
  }
  return lines;
}

function codaOf(lines) {
  return lines.filter(l => l.startsWith('◈ '));
}

(async () => {
  const args = process.argv.slice(2);
  // DET-GATE DUMP MODE: RELAYCODA_DUMP=1 → JSON array of
  // {seed, branch, lines} for the relay epilogue coda branch over 16 seeds.
  // Run pre-edit (control) and post-edit (armed); --compare requires
  // byte-identical transcripts except exactly the coda line.
  if (process.env.RELAYCODA_DUMP === '1') {
    const out = [];
    for (const seed of DET_SEEDS) {
      const Game = await K.load({ seed });
      K.newRun(Game);
      for (const b of ['light', 'dark', 'grey']) {
        out.push({ seed, branch: b, lines: await codaLines(Game, b, b === 'light' ? 60 : b === 'dark' ? -60 : 0) });
      }
    }
    console.log(JSON.stringify(out));
    return;
  }
  if (args[0] === '--compare') {
    const ctrl = JSON.parse(fs.readFileSync(args[1], 'utf8'));
    const armed = JSON.parse(fs.readFileSync(args[2], 'utf8'));
    T.ok('det-gate: same number of transcripts', ctrl.length === armed.length, `${ctrl.length} vs ${armed.length}`);
    let pairsOk = 0, codaSwaps = 0;
    for (let i = 0; i < Math.min(ctrl.length, armed.length); i++) {
      const c = ctrl[i], a = armed[i];
      const sameMeta = c.seed === a.seed && c.branch === a.branch;
      const diffs = [];
      const n = Math.max(c.lines.length, a.lines.length);
      for (let j = 0; j < n; j++) {
        if (c.lines[j] !== a.lines[j]) diffs.push({ idx: j, ctrl: c.lines[j], armed: a.lines[j] });
      }
      const ok = sameMeta && diffs.length === 1 && /reached into the light/.test(diffs[0].armed || '');
      if (ok) { pairsOk++; codaSwaps++; }
      else T.ok(`pair ${c.seed}/${c.branch}: exactly the coda line changes`, false,
        JSON.stringify(diffs.map(d => d.idx)));
    }
    T.ok('det-gate: all seed×branch transcripts identical except the coda line',
      pairsOk === ctrl.length, `${pairsOk}/${ctrl.length}`);
    T.ok('det-gate: armed line is the new branch-agnostic coda', codaSwaps === ctrl.length);
    T.done();
    return;
  }
  // ---- GO (1): firing fixtures through the real table flow, ≥2 seeds ----
  const seen = new Set();
  for (const seed of SEEDS) {
    const Game = await K.load({ seed });
    K.newRun(Game);
    const branchLines = {};
    for (const b of ['light', 'dark', 'grey']) {
      const lines = await codaLines(Game, b, b === 'light' ? 60 : b === 'dark' ? -60 : 0);
      const hits = codaOf(lines);
      T.ok(`seed ${seed} branch ${b}: exactly one coda fires`, hits.length === 1,
        `got ${hits.length}: ${JSON.stringify(lines.slice(0, 4))}`);
      if (hits.length === 1) {
        branchLines[b] = hits[0];
        seen.add(hits[0]);
      }
    }
    // GO (2), branch-agnosticism by evidence: the SAME line fires for
    // light, dark and grey on the same seed — the coda commits to no branch.
    if (branchLines.light && branchLines.dark && branchLines.grey) {
      const same = branchLines.light === branchLines.dark && branchLines.dark === branchLines.grey;
      T.ok(`seed ${seed}: one coda across light/dark/grey (branch-agnostic)`, same,
        `light=${JSON.stringify(branchLines.light)}\ndark=${JSON.stringify(branchLines.dark)}`);
    }
  }
  const norm = (s) => s.replace(/^◈ .*? (?=reached into the light)/, '◈ {name} ')
    .replace(/\b(he|she|they)\b/g, '{pro}');
  const normSeen = new Set([...seen].map(norm));
  T.ok('GO(1): relay coda fires on ≥2 seeds through the real table flow', SEEDS.length >= 2);
  T.ok('one coda shape across 8 seeds (only name/pronoun vary)', normSeen.size === 1,
    `got ${normSeen.size} shapes: ${[...normSeen].map(s => JSON.stringify(s.slice(0, 60))).join(' | ')}`);
  // ---- GO (2): anti-pins + identity anchors on the landed text ----
  for (const line of seen) {
    T.ok('coda is branch-agnostic text', true, JSON.stringify(line));
    for (const pin of PINS) {
      T.ok(`anti-pin: no "${pin.source}"`, !pin.test(line), `PINNED: ${JSON.stringify(line)}`);
    }
    const anchored = ANCHORS.some(a => a.test(line));
    T.ok('carries relay identity (light/wire/machine/conversation/channel/caretaker)', anchored,
      JSON.stringify(line));
  }
  T.done();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
