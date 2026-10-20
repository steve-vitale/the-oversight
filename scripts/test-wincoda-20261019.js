#!/usr/bin/env node
// test-wincoda-20261019.js — win-coda per-path fix (sim-wincoda).
//
// Findings backlog: the win coda in tableEpilogue (src/js/table.js ~1263)
// was IDENTICAL verbatim across all walked paths (theater class). This
// proof fires the coda through the REAL table state machine —
// Game.tableEpilogue reading this.tableState().path, no stubs — and shows:
//   RED (pre-fix): all seven paths produce the byte-identical coda string.
//   GREEN (post-fix): seven distinct codas, each with path-specific imagery,
//     no sentence shared between any two, unknown-path falls back verbatim.
//   DET-GATE (WINCODA_DUMP=1 / WINCODA_COMPARE): 16 seeds, armed vs control
//     transcripts byte-identical except exactly the coda site line.
//
// PRE-REGISTRATION (binding, docs/MEASUREMENT.md §14):
//   PRIMARY: RED/GREEN coda-distinctness via the real table state machine.
//   GUARDRAIL: det-gate — 16/16 seed-pairs byte-identical armed vs control
//     on identical seeds, differing only at the coda line. A text-only
//     change must not move the RNG stream.
//   If the primary misses, NO-GO honestly.
//
// Node harness: full src/js list in index.html order via scripts/godpath/lib
// (wraps sim-harness: Math.random seeded BEFORE eval, DOM-only files
// excluded, Game.save real). One seed per process load; 8 seeds sequential.
'use strict';
const fs = require('fs');
const K = require('./godpath/lib');
const T = K.reporter('wincoda');
const PATHS = ['feared', 'indispensable', 'beloved', 'witness', 'assimilated', 'defiant', 'relay'];
// Path-specific imagery anchors — each coda must carry its path's identity.
const IMG = {
  feared: ['fear', 'flinch', 'afraid', 'terror', 'shield'],
  indispensable: ['contract'],
  beloved: ['audience', 'beloved'],
  witness: ['ledger', 'charge', 'record'],
  assimilated: ['inside', 'trojan'],
  defiant: ['price', 'no twice', 'free', 'walking'],
  relay: ['machine', 'light', 'conversation', 'channel', 'caretaker'],
};
const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];

// Fire the coda for one path through the REAL table state machine:
// pg.table.path is live state, tableEpilogue reads this.tableState() itself.
// No ascensions, no facilitation (fresh newRun) → the coda branch fires.
async function codaLines(Game, path) {
  const lines = [];
  const oldSay = Game.say;
  Game.say = (l) => { lines.push(String(l)); };
  try {
    const pg = Game.progState();
    pg.table = pg.table || {};
    pg.table.path = path;
    pg.table.branch = 'light';
    pg.table.phase = 'challenge';
    Game.tableEpilogue(null, 'light', { id: 'final:test', label: 'Test final.' });
  } finally {
    Game.say = oldSay;
  }
  return lines;
}

function codaOf(lines) {
  const hits = lines.filter(l => l.startsWith('◈ ') && /walks out of the light|does not walk out|reached into the light/.test(l));
  return hits;
}

(async () => {
  // DET-GATE DUMP MODE: WINCODA_DUMP=1 → JSON array of
  // {seed, path, lines} (full say() transcript of the epilogue coda branch)
  // over 16 seeds × 7 paths. Run pre-fix (control) and post-fix (armed);
  // the comparator requires byte-identical transcripts except exactly the
  // coda site line — a text-only change must not move the RNG stream.
  if (process.env.WINCODA_DUMP === '1') {
    const out = [];
    const DET_SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    for (const seed of DET_SEEDS) {
      const Game = await K.load({ seed });
      K.newRun(Game);
      const pg = Game.progState();
      pg.table = pg.table || {};
      for (const p of PATHS) {
        out.push({ seed, path: p, lines: await codaLines(Game, p) });
      }
    }
    console.log(JSON.stringify(out));
    return;
  }
  const allCodas = {}; // path -> Set of observed coda strings across seeds
  for (const seed of SEEDS) {
    const Game = await K.load({ seed });
    K.newRun(Game);
    const pg = Game.progState();
    pg.table = pg.table || {};
    for (const p of PATHS) {
      const lines = await codaLines(Game, p);
      const hits = codaOf(lines);
      T.ok(`seed ${seed} path ${p}: exactly one coda fires`, hits.length === 1,
        `got ${hits.length}: ${JSON.stringify(lines.slice(0, 3))}`);
      if (hits.length === 1) {
        allCodas[p] = allCodas[p] || new Set();
        allCodas[p].add(hits[0]);
      }
    }
    // Unknown path falls back to the original verbatim line, never a crash.
    const unkLines = await codaLines(Game, 'no-such-path');
    const unkHits = codaOf(unkLines);
    T.ok(`seed ${seed}: unknown path falls back verbatim`,
      unkHits.length === 1 && unkHits[0].indexOf('The village endures. That was always the story.') > 0,
      JSON.stringify(unkHits[0] || ''));
  }

  // The Bearer's name/pronoun are roster-RNG; across 8 seeds the set per
  // path may hold up to 8 name-variants of the same coda — normalize by
  // stripping the leading name token before distinctness checks.
  const norm = (s) => s.replace(/^◈ .*? (?=walks out of the light|does not walk out|reached into the light)/, '◈ {name} ')
    .replace(/\b(he|she|they)\b/g, '{pro}');
  const canon = {};
  for (const p of PATHS) {
    const set = allCodas[p] || new Set();
    canon[p] = new Set([...set].map(norm));
    T.ok(`path ${p}: one coda shape across 8 seeds (name/pronoun only)`, canon[p].size === 1,
      [...set].slice(0, 2).join(' || '));
  }
  const shapes = PATHS.map(p => [...canon[p]][0]).filter(Boolean);
  T.ok('all seven paths produce a coda', shapes.length === 7);

  // RED check: are they all identical? (pre-fix: YES → the theater bug)
  const distinct = new Set(shapes);
  const identical = distinct.size === 1;
  T.ok('GREEN: codas differ per path (RED would show 1 identical string)',
    !identical, identical ? `all identical: ${shapes[0].slice(0, 80)}…` : '');

  // GREEN: path-specific imagery per coda.
  if (!identical) {
    for (const p of PATHS) {
      const c = [...canon[p]][0].toLowerCase();
      const hit = (IMG[p] || []).some(w => c.indexOf(w) >= 0);
      T.ok(`path ${p}: coda carries path-specific imagery`, hit, [...canon[p]][0].slice(0, 90));
    }
    // GREEN: no sentence shared between any two codas.
    const sent = (s) => s.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
    const seen = {};
    let shared = 0;
    for (const p of PATHS) {
      for (const s of sent([...canon[p]][0])) {
        if (seen[s] && seen[s] !== p) { shared++; T.ok(`no shared sentence (${JSON.stringify(s)} in ${seen[s]} and ${p})`, false); }
        seen[s] = seen[s] || p;
      }
    }
    if (!shared) T.ok('no sentence shared between any two codas', true);
  }

  // Read each coda aloud for the evidence (SENSE-TESTING LAW).
  console.log('\n--- codas (read aloud) ---');
  for (const p of PATHS) console.log(`[${p}] ${[...canon[p]][0] || '(missing)'}`);
  T.done();
})().catch(e => { console.error('FATAL', e); process.exitCode = 2; });
