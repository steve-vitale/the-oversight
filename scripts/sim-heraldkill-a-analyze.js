#!/usr/bin/env node
// sim-heraldkill-a-analyze.js — Herald-kill road-state analyzer (DIAG ONLY).
// Reads a heraldarr2 corpus dir (judged re-run) and emits per-seed
// post-kill state: kill day/killer, removal, lairs (all + post-kill),
// post-kill dawns (Herald present count), omen trajectory + frozen flag,
// re-placement flag, end fields, contact census. Pure analysis of JSON
// corpora: no game state, no RNG, no I/O beyond argv paths.
//   node scripts/sim-heraldkill-a-analyze.js <corpusDir> <outJson>
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2], out = process.argv[3];
if (!dir || !out) { console.error('usage: sim-heraldkill-a-analyze.js <corpusDir> <outJson>'); process.exit(2); }

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const perSeed = [];
for (const f of files) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const kills = (s.contacts || []).filter(c => c.outcome === 'vKill');
  const dies = (s.contacts || []).filter(c => c.outcome === 'vDie');
  const kill = kills.length ? kills[0] : null;
  const killDay = kill ? kill.day : null;
  const removals = s.removals || [];
  const removalAfterKill = kill ? removals.filter(r => r.day >= killDay) : [];
  const postKillLairs = kill ? (s.lairs || []).filter(l => l.day > killDay) : [];
  const dawns = s.dawns || [];
  const postKillDawns = kill ? dawns.filter(d => d.day > killDay) : [];
  const postKillPresent = postKillDawns.filter(d => !!d.heraldTile).length;
  const omenAtKill = kill ? (dawns.filter(d => d.day <= killDay).slice(-1)[0] || {}).omenStage : null;
  // Omen at the kill dawn itself (dawn snapshot on/before kill day) + end.
  const killDawn = kill ? dawns.filter(d => d.day <= killDay).slice(-1)[0] : null;
  const omenStagesPost = postKillDawns.map(d => d.omenStage);
  const frozen = kill ? omenStagesPost.every(v => v === (killDawn ? killDawn.omenStage : null)) : null;
  const replacement = kill ? (postKillLairs.length > 0 || postKillPresent > 0) : null;
  const contactCounts = {};
  for (const c of (s.contacts || [])) contactCounts[c.outcome] = (contactCounts[c.outcome] || 0) + 1;
  perSeed.push({
    seed: s.seed, anchorCommit: s.anchorCommit, captureErrs: s.captureErrs,
    killDay, killerVid: kill ? kill.vid : null, killTile: kill ? kill.heraldTile : null,
    kills: kills.length, dies: dies.length,
    dieDays: dies.map(c => ({ day: c.day, vid: c.vid })),
    lairs: (s.lairs || []).map(l => ({ day: l.day, tx: l.tx, ty: l.ty })),
    removals: removals.map(r => ({ day: r.day, tx: r.tx, ty: r.ty })),
    removalAfterKill: removalAfterKill.map(r => ({ day: r.day, tx: r.tx, ty: r.ty })),
    postKillLairs: postKillLairs.map(l => ({ day: l.day, tx: l.tx, ty: l.ty })),
    postKillDawns: postKillDawns.length, postKillPresent,
    omenAtKillDawn: killDawn ? killDawn.omenStage : null, omenEnd: s.endHerald ? s.endHerald.omenStage : null,
    omenFrozen: frozen, replacement,
    heraldPresentEnd: s.endHerald ? s.endHerald.present : null,
    endHeraldTile: s.endHerald ? s.endHerald.tile : null,
    contacts: contactCounts, scholarContacts: (s.contacts || []).filter(c => c.channel === 'scholar').length,
    villagerContacts: (s.contacts || []).filter(c => c.channel === 'villager').length,
    refusalLines: (s.sayLines || []).filter(l => l.kind === 'refusal').length,
    days: s.days, gameDays: s.gameDays, endReason: s.endReason, endScaleRank: s.endScaleRank,
    maxWave: s.maxWave, national: s.national, table: s.table, won: s.won,
  });
}
const killSeeds = perSeed.filter(p => p.kills > 0);
const result = {
  instrument: 'heraldkill-a-v1', corpusDir: dir, seeds: perSeed.length,
  killSeeds: killSeeds.length, K: killSeeds.length,
  perSeed,
  summary: {
    replacementBySeed: killSeeds.map(p => ({ seed: p.seed, replacement: p.replacement })),
    allReplacementZero: killSeeds.length > 0 && killSeeds.every(p => p.replacement === false),
    allOmenFrozen: killSeeds.length > 0 && killSeeds.every(p => p.omenFrozen === true),
  },
};
fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log('heraldkill analysis: ' + perSeed.length + ' seeds, K=' + killSeeds.length +
  ', allReplacementZero=' + result.summary.allReplacementZero +
  ', allOmenFrozen=' + result.summary.allOmenFrozen);
