#!/usr/bin/env node
// analyze-corpsemove-b.js — pure reads over the corpsemove corpora.
// Emits the table JSON (default: stdout; path arg writes it). No game
// code, no policy code, no trajectory claims beyond what the files show.
'use strict';
const fs = require('fs');
const path = require('path');
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31');
function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
const PILOT = [15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337];
const mine = {};
for (const s of PILOT) mine[s] = load(path.join(BASE, 'sim-corpsemove-b-corpus-on', 'corpsemove-b-nighttravel-s' + s + '.json'));
const ctl = load(path.join(BASE, 'sim-corpsemove-b-control-gap', 'toolloss-gap-b-nighttravel-s15215.json'));
const old = load(path.join(BASE, 'sim-toolloss-b-corpus-gap', 'toolloss-gap-b-nighttravel-s15215.json'));

function mseq(d) { return d.mornings.map((m) => [m.loopDay, m.morningInv ? m.morningInv.scholarId : null, m.morningCut ? m.morningCut.tier : null, m.tile, m.mx, m.my]); }
function eseq(d) { return d.evenings.map((e) => [e.loopDay, e.eveningInv ? e.eveningInv.scholarId : null, e.tile, e.mx, e.my]); }
function corpseMoves(d) {
  const out = [];
  for (const rows of [d.mornings.map((m) => ['M' + m.loopDay, m.corpses]), d.evenings.map((e) => ['E' + e.loopDay, e.corpses])]) {
    const last = {};
    for (const [tag, cs] of rows) for (const c of (cs || [])) {
      if (!c || typeof c !== 'object' || !c.id) continue;
      const node = c.node ? [c.node.x, c.node.y] : null;
      if (last[c.id] && JSON.stringify(last[c.id]) !== JSON.stringify(node)) out.push({ at: tag, id: c.id, villagerId: c.villagerId, from: last[c.id], to: node });
      last[c.id] = node;
    }
  }
  return out;
}
function bearerChanges(d) {
  const out = []; let prev = null;
  for (const m of d.mornings) {
    const id = m.morningInv ? m.morningInv.scholarId : null;
    if (prev && id !== prev) out.push({ loopDay: m.loopDay, from: prev, to: id });
    prev = id;
  }
  return out;
}
const pilot = PILOT.map((s) => ({ seed: s, bearerChanges: bearerChanges(mine[s]), corpseMoves: corpseMoves(mine[s]), deaths: (mine[s].deaths || []).length }));

const g = (d, day) => d.mornings.find((m) => m.loopDay === day);
const e = (d, day) => d.evenings.find((x) => x.loopDay === day);
const gab = (row) => (row.corpses || []).find((c) => c && c.villagerId === 'gen_gyft62f');
const m18 = g(old, 18), m19 = g(old, 19), e18 = e(old, 18);
const c18 = gab(m18), c19 = gab(m19);
const gap19 = m19.gapLines || [];
const bringIdx = gap19.findIndex((l) => l.includes('they bring Gabriela home'));
const dawnIdx = gap19.findIndex((l) => l.includes('DAY 19 DAWN'));
const day18BodyLines = (e18.fullDaySay || []).filter((l) => /corpse|carry|grave|gabriela|body/i.test(l));
const otherStable = [];
for (const m of [g(old, 17), m18, m19]) otherStable.push({ loopDay: m.loopDay, others: (m.corpses || []).filter((c) => c && c.villagerId !== 'gen_gyft62f').map((c) => [c.id, c.node]) });

const out = {
  instrumentEquivalenceOnThisBase: { morningSeqEqual: JSON.stringify(mseq(mine[15215])) === JSON.stringify(mseq(ctl)), eveningSeqEqual: JSON.stringify(eseq(mine[15215])) === JSON.stringify(eseq(ctl)) },
  trajectoryReproduction: {
    reproduced: false,
    oldBearer17: g(old, 17).morningInv.scholarId, newBearer17: g(mine[15215], 17).morningInv.scholarId,
    oldEvening7Tile: e(old, 7).tile, newEvening7Tile: e(mine[15215], 7).tile,
    oldStrand: 'creek evenings 7-16, death day 17', newStrand: 'haven all 30 evenings, no bearer change',
  },
  bracketPriorCorpus: {
    evening18: { bearer: e18.eveningInv.scholarId, bearerName: e18.eveningInv.scholarName, corpseNode: c18.node, corpseMxMy: [c18.mx, c18.my], items: c18.items, looted: c18.looted },
    morning19: { bearer: m19.morningInv.scholarId, bearerName: m19.morningInv.scholarName, corpseNode: c19.node, corpseMxMy: [c19.mx, c19.my], items: c19.items, looted: c19.looted },
    segment: 'evening loop-day 18 -> morning loop-day 19 (overnight gap)',
    itemsIdentical: JSON.stringify(c18.items) === JSON.stringify(c19.items),
  },
  narration: { bringHomeLine: gap19[bringIdx] || null, bringHomeGapIndex: bringIdx, dawnGapIndex: dawnIdx, beforeDawn: bringIdx >= 0 && dawnIdx >= 0 && bringIdx < dawnIdx, day18BodyLines },
  otherCorpsesStable: otherStable,
  pilotCensus: pilot,
  mechanism: {
    name: 'Game.recoverBearer() — the village brings its dead bearer home (src/js/corpses.js)',
    caller: 'Game.endDay() (src/js/game.js, THE VILLAGE BRINGS ITS BEARER HOME block)',
    queue: 'village.pendingBurials pushed in ledger.js playerDeath (corpseId, villagerId, name, day = scholar day at death)',
    condition: 'fires on the first endDay where scholar.day > pending day',
    effect: 'c.node = {village px, py}; c.mx = 4; c.my = 4; c.recovered = true; c.deathKnown = true; say line verbatim',
    timingOn15215: 'death day 17 -> pending day 17 -> endDay 17 not due (17 !> 17) -> endDay 18 due (18 > 17) -> morning 19 at Haven',
    onlyCorpseNodeWriterInCodebase: 'grep: corpses.js:937-938 is the only c.node / c.mx assignment on a corpse',
  },
};
const dest = process.argv[2];
if (dest) fs.writeFileSync(dest, JSON.stringify(out, null, 2) + '\n');
else process.stdout.write(JSON.stringify(out, null, 2) + '\n');
console.error('analyze-corpsemove-b: pilot=' + PILOT.length + ' reproduced=' + out.trajectoryReproduction.reproduced + ' bracket=' + out.bracketPriorCorpus.segment);
