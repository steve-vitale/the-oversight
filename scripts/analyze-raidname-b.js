#!/usr/bin/env node
// analyze-raidname-b.js — dawn-raid census over a fightorigin corpus.
// Reads evidence/2026-10-29/sim-raidname-b-corpus (or --corpus DIR)
// and classifies every morning-interval fight creation:
//   raid-pending: a havenRaidTick setter entry (pendingLog stackFrames)
//     with matching monster id, after the previous creation, before this one
//   breach-in-tail: creation sayTail contains the BREACH lines
//   raid-word-in-tail: creation sayTail contains a line with "raid"
//   corpse-fighter: a fighter seated at creation with alive===false / hp<=0
//     (the raid-aftermath interleave mechanism: a villager who fell in
//     the raid's defender fights is seated in the dawn fight)
// Morning interval M: evening checkpoint (loopDay M-1, inside) -> morning
// checkpoint (loopDay M); creations bracketed by checkpoint seq.
// Usage: node scripts/analyze-raidname-b.js [--corpus DIR] [--out FILE]
'use strict';
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
let corpus = path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-raidname-b-corpus');
let out = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--corpus') corpus = args[++i];
  else if (args[i] === '--out') out = args[++i];
}
const BREACH_RE = /It got INSIDE|Perimeter violated/;
const RAID_RE = /raid/i;
const CASUALTY_RE = /didn't come back|met them at the door|Nobody met|☠ .* falls/;
const summary = { corpus, seeds: [], totals: {} };
let dawnRaidMornings = 0, dawnRaidFights = 0, morningCreations = 0;
let breachInTail = 0, raidWordInTail = 0, interleave = 0, missMornings = 0;
let missRaidMornings = 0, havenCreations = 0, corpseFights = 0;
for (const f of fs.readdirSync(corpus).sort()) {
  if (!f.endsWith('.json')) continue;
  const d = JSON.parse(fs.readFileSync(path.join(corpus, f), 'utf8'));
  const seedRow = { seed: d.seed, mornings: [], dawnRaidMornings: [], missMornings: [], creations: [] };
  const evCp = new Map(), moCp = new Map();
  for (const cp of (d.checkpoints || [])) {
    if (cp.checkpoint === 'evening') evCp.set(cp.loopDay, cp);
    if (cp.checkpoint === 'morning') moCp.set(cp.loopDay, cp);
  }
  const evRow = new Map((d.evenings || []).map((e) => [e.loopDay, e]));
  const moRow = new Map((d.mornings || []).map((m) => [m.loopDay, m]));
  for (const m of (d.mornings || [])) {
    const M = m.loopDay;
    const ev = evRow.get(M - 1);
    if (!ev || ev.inside !== true) continue;
    const ecp = evCp.get(M - 1), mcp = moCp.get(M);
    if (!ecp || !mcp) continue;
    const interval = (d.fightCreations || []).filter((c) => c.seq >= ecp.seq && c.seq < mcp.seq);
    const isMiss = m.inside !== true;
    if (isMiss) { missMornings++; seedRow.missMornings.push(M); }
    const row = { morning: M, miss: isMiss, creations: [] };
    for (const c of interval) {
      morningCreations++;
      const mons = (c.fighters || []).filter((x) => x.monsterId).map((x) => x.monsterId);
      const prevFo = Math.max(0, ...((d.fightCreations || []).filter((x) => x.foSeq < c.foSeq).map((x) => x.foSeq)));
      const raidSet = (d.pendingLog || []).filter((p) =>
        p.foSeq < c.foSeq && p.foSeq > prevFo &&
        (p.stackFrames || []).some((s) => /havenRaidTick/.test(s)) &&
        mons.includes(p.pendingMonsterId));
      const tail = c.sayTail || [];
      const corpses = (c.fighters || []).filter((x) => x.alive === false || (typeof x.hp === 'number' && x.hp <= 0));
      const cre = {
        ordinal: c.ordinal, loopDay: c.loopDay, slot: c.slot,
        inside: !!(c.pos && c.pos.inside), monsters: [...new Set(mons)],
        monsterNames: (c.fighters || []).filter((x) => x.monsterId).map((x) => x.name),
        villagerNames: (c.fighters || []).filter((x) => x.kind === 'villager').map((x) => x.name),
        raidPending: raidSet.length > 0,
        breachInTail: tail.some((l) => BREACH_RE.test(l)),
        raidWordInTail: tail.some((l) => RAID_RE.test(l)),
        casualtyInTail: tail.some((l) => CASUALTY_RE.test(l)),
        corpseFighters: corpses.map((x) => x.name),
        sayTail: tail,
      };
      cre.dawnRaid = cre.raidPending && cre.inside;
      if (cre.inside) havenCreations++;
      if (cre.dawnRaid) {
        dawnRaidFights++;
        if (cre.breachInTail) breachInTail++;
        if (cre.raidWordInTail) raidWordInTail++;
        if (cre.casualtyInTail) interleave++;
        if (corpses.length) corpseFights++;
      }
      row.creations.push(cre);
      seedRow.creations.push(cre);
    }
    if (row.creations.some((c) => c.dawnRaid)) {
      dawnRaidMornings++;
      seedRow.dawnRaidMornings.push(M);
      if (row.miss) missRaidMornings++;
    }
    seedRow.mornings.push(row);
  }
  summary.seeds.push(seedRow);
}
summary.totals = {
  seeds: summary.seeds.length, morningCreations, havenCreations,
  dawnRaidMornings, dawnRaidFights, breachInTail, raidWordInTail,
  interleave, corpseFights, missMornings, missRaidMornings,
};
console.log(JSON.stringify(summary.totals, null, 2));
for (const s of summary.seeds) {
  if (s.dawnRaidMornings.length || s.missMornings.length) {
    console.log(`seed ${s.seed}: dawnRaidMornings=${JSON.stringify(s.dawnRaidMornings)} missMornings=${JSON.stringify(s.missMornings)}`);
    for (const c of s.creations.filter((x) => x.dawnRaid)) {
      console.log(`  ord ${c.ordinal} loopDay ${c.loopDay} slot ${c.slot} mons ${c.monsters.join(',')} names ${c.monsterNames.join(',')} breach=${c.breachInTail} raidWord=${c.raidWordInTail} casualty=${c.casualtyInTail} corpses=${JSON.stringify(c.corpseFighters)}`);
    }
  }
}
if (out) fs.writeFileSync(out, JSON.stringify(summary, null, 2) + '\n');
