#!/usr/bin/env node
// scripts/analyze-feastdraw-a.js — feast-draw yield analyzer over the
// sim-feastdraw-a corpus (evidence/2026-10-26/perseed-sim-feastdraw-a).
// Prints the per-seed yield table, the band yield rates, the wave
// distribution, and the 73678 day-115 strike draw join in full, and
// writes analysis.json next to the rows. Read-only over the corpus
// (it writes only analysis.json in the corpus dir).
//
// Usage: node scripts/analyze-feastdraw-a.js [evidDir]
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeFeastdraw } = require('./policies/feastdraw-diag');
const { analyzeNonworldkill } = require('./policies/nonworldkill-diag');

const REPO = path.join(__dirname, '..');
const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-26', 'perseed-sim-feastdraw-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const perSeed = [];
for (const seed of SEEDS) {
  const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8'));
  const an = analyzeFeastdraw(row.feastdraw, row.nonworldkill);
  const nwk = analyzeNonworldkill(row.nonworldkill);
  perSeed.push({ seed, row, an, nwk });
}
const tot = (f) => perSeed.reduce((t, s) => t + (f(s.an) || 0), 0);
const band = {
  grants: tot(a => a.grants), fresh: tot(a => a.fresh), refreshed: tot(a => a.refreshed), refused: tot(a => a.refused),
  spawned: tot(a => a.spawned), notSpawned: tot(a => a.notSpawned),
  faced: tot(a => a.faced), facedFace: tot(a => a.facedFace), facedHarness: tot(a => a.facedHarness),
  drivenOff: tot(a => a.drivenOff), unmet: tot(a => a.unmet),
  facedWithKill: tot(a => a.facedWithKill), totalKills: tot(a => a.totalKills),
  wave4Draws: tot(a => a.wave4Draws), wave4Kills: tot(a => a.wave4Kills),
  castVeteranDraws: tot(a => a.castVeteranDraws), unclassified: tot(a => a.unclassified),
  feastStarts: tot(a => a.feastStarts),
};
band.drawsPerFreshGrant = band.fresh ? band.spawned / band.fresh : null;
band.facedRate = band.spawned ? band.faced / band.spawned : null;
band.killRate = band.faced ? band.facedWithKill / band.faced : null;
band.veteransPerDraw = band.spawned ? band.wave4Kills / band.spawned : null;
band.waveDist = {};
band.outcomes = {};
band.notSpawnedByWhy = {};
for (const s of perSeed) {
  for (const k of Object.keys(s.an.waveDist)) band.waveDist[k] = (band.waveDist[k] || 0) + s.an.waveDist[k];
  for (const k of Object.keys(s.an.outcomes)) band.outcomes[k] = (band.outcomes[k] || 0) + s.an.outcomes[k];
  for (const k of Object.keys(s.an.notSpawnedByWhy)) band.notSpawnedByWhy[k] = (band.notSpawnedByWhy[k] || 0) + s.an.notSpawnedByWhy[k];
}
console.log('=== sim-feastdraw-a analyzer ===');
console.log('seed | grants fresh refr refused | spawned notSpawned | faced(face/harness) driven unmet | kills | w4draws w4kills | unclass');
for (const s of perSeed) {
  const a = s.an;
  console.log(`${s.seed} | ${a.grants} ${a.fresh} ${a.refreshed} ${a.refused} | ${a.spawned} ${a.notSpawned} | ${a.faced}(${a.facedFace}/${a.facedHarness}) ${a.drivenOff} ${a.unmet} | ${a.totalKills} | ${a.wave4Draws} ${a.wave4Kills} | ${a.unclassified}  (feastStarts=${a.feastStarts}, nwkFeastKills=${s.nwk.killsByDoor['feast-draw'] || 0})`);
}
console.log('BAND: ' + JSON.stringify(band));
console.log('\nDraw rows (band):');
for (const s of perSeed) {
  for (const o of s.an.drawOutcomes) {
    console.log(`  s${s.seed} d${o.day} ${o.monsterId} w${o.wave} vet=${o.veteran} -> ${o.outcome} startD=${o.startDay} end=${o.endResult} kills=${o.killCount} w4kills=${o.wave4Kills.length}`);
  }
}
console.log('\nStrike join (73678):');
const s78 = perSeed.find(s => s.seed === 73678);
if (s78) {
  for (const o of s78.an.drawOutcomes) {
    if (o.monsterId === 'strike') console.log('  draw outcome: ' + JSON.stringify(o));
  }
  const g78 = (s78.row.feastdraw.grants || []).filter(g => g.drawMonsterId === 'strike');
  console.log('  grants naming strike: ' + JSON.stringify(g78.map(g => ({ day: g.day, granted: g.granted, refreshed: g.refreshed, mult: g.mult, quality: g.quality }))));
  const starts78 = (s78.row.nonworldkill.starts || []).filter(x => x.feastDraw && x.feastDraw.monsterId === 'strike');
  console.log('  nonworldkill feast-draw starts for strike: ' + JSON.stringify(starts78.map(x => ({ day: x.day, arg: x.arg, mid: x.mid, wave: x.wave, fightId: x.fightId, origin: x.origin, fighters: x.fighters }))));
}
const out = { band, perSeed: perSeed.map(s => ({ seed: s.seed, an: s.an, nwkByDoor: s.nwk.byDoor, nwkKillsByDoor: s.nwk.killsByDoor })) };
fs.writeFileSync(path.join(dir, 'analysis.json'), JSON.stringify(out, null, 1) + '\n');
console.log('\nwrote ' + path.join(dir, 'analysis.json'));
