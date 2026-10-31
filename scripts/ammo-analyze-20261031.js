#!/usr/bin/env node
// ammo-analyze-20261031.js — Stage 1 analysis for sim-ammo-a.
// Reads evidence/2026-10-31/perseed-ammo-a/<arm>/s<seed>.json (or EVID
// + ARM env) and prints the ammo census: per-fight class (a/b/c/d),
// caller split, weapon split, volley totals, pocket-call totals, and
// wall numbers. Writes NOTHING; prints JSON summary + tables.
// Usage: ARM=baseline node scripts/ammo-analyze-20261031.js [seed...]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const ARM = process.env.ARM || 'baseline';
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-ammo-a', ARM);
const seedsArg = process.argv.slice(2).map(s => parseInt(s, 10)).filter(Number.isFinite);
const files = fs.readdirSync(EVID).filter(f => /^s\d+\.json$/.test(f)).sort();
const seeds = files.map(f => parseInt(f.slice(1, -5), 10)).filter(s => !seedsArg.length || seedsArg.includes(s));

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function counter(rows, fn) {
  const m = {};
  for (const r of rows) { const k = fn(r); m[k] = (m[k] || 0) + 1; }
  return m;
}

// Classify ONE ranged wave-4 fight into (a)/(b)/(c)/(d)/noranged.
function classify(f) {
  if (!f.rangedAmmoId) return 'noranged';
  const need = f.rangedAmmoId;
  const carried = (f.carried && f.carried[need]) || 0;
  if (carried > 0) return 'd-carried-but-dry';
  const p = f.pocket || {};
  const ownStash = (f.ownStash && f.ownStash[need]) || 0;
  if (ownStash > 0) return 'b-stored-not-carried';
  if ((p.everCarried || 0) > 0) return 'c-carried-spent';
  if ((p.pocketCalls || 0) === 0) return 'a-never-pocketed';
  // Pocket calls happened but nothing ever landed on the fighter.
  const last = p.lastOut || {};
  if (last.crafted === 1 && !last.craftedOk) return 'a-craft-failed';
  return 'a-pocketed-zero';
}

const all = [];
const wall = [];
let pocketTotal = 0, pocketCallsTotal = 0, errsTotal = 0;
for (const seed of seeds) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}.json`), 'utf8'));
  wall.push(d);
  pocketCallsTotal += (d.pocketCalls || []).length;
  pocketTotal += (d.pocketCalls || []).reduce((t, p) => {
    const pre = Object.values(p.pre || {}).reduce((a, b) => a + b, 0);
    const post = Object.values(p.post || {}).reduce((a, b) => a + b, 0);
    return t + Math.max(0, post - pre);
  }, 0);
  errsTotal += (d.instrumentErrors || []).length;
  for (const f of (d.fights || [])) all.push(Object.assign({ seed }, f));
}

const ranged = all.filter(f => f.rangedAmmoId);
const volleyShots = ranged.map(f => (f.volley && f.volley.shots) || 0);
const volleyDmg = all.map(f => (f.volley && f.volley.dmg) || 0);
const summary = {
  arm: ARM, seeds, seedCount: seeds.length,
  fights: all.length, rangedFights: ranged.length,
  outcomes: counter(all, f => f.outcome),
  volley: {
    rangedWithShots: ranged.filter(f => ((f.volley && f.volley.shots) || 0) > 0).length,
    totalShots: volleyShots.reduce((a, b) => a + b, 0),
    totalDmg: volleyDmg.reduce((a, b) => a + b, 0),
    medianDmgPerFoughtFight: medianOf(volleyDmg),
  },
  fieldKills: all.filter(f => f.outcome === 'vKill').length,
  driveOffs: all.filter(f => f.outcome === 'mFlee').length,
  classes: counter(ranged, classify),
  classesByWeapon: {},
  callers: counter(all, f => f.callerClass),
  callersRanged: counter(ranged, f => f.callerClass),
  classesByCaller: {},
  depart: counter(ranged, f => (f.depart && f.depart.onExpedition) ? 'expedition' : (f.depart && f.depart.away) ? 'away-not-exped' : 'home'),
  pocketCalls: pocketCallsTotal, pocketUnits: pocketTotal,
  instrumentErrors: errsTotal,
  wall: {
    national: wall.reduce((t, d) => t + (d.national || 0), 0),
    table: wall.reduce((t, d) => t + (d.table || 0), 0),
    wins: wall.reduce((t, d) => t + (d.won || 0), 0),
    wave4: wall.filter(d => (d.maxWave || 1) >= 4).length,
    wave5: wall.filter(d => (d.maxWave || 1) >= 5).length,
    medianSurvival: medianOf(wall.map(d => d.gameDays || 0)),
    maxSurvival: Math.max.apply(null, wall.map(d => d.gameDays || 0)),
  },
};
for (const f of ranged) {
  const w = f.rangedWeaponId || 'none';
  summary.classesByWeapon[w] = summary.classesByWeapon[w] || {};
  const c = classify(f);
  summary.classesByWeapon[w][c] = (summary.classesByWeapon[w][c] || 0) + 1;
  const cl = f.callerClass || 'other';
  summary.classesByCaller[cl] = summary.classesByCaller[cl] || {};
  summary.classesByCaller[cl][c] = (summary.classesByCaller[cl][c] || 0) + 1;
}
console.log(JSON.stringify(summary, null, 1));
console.log('\n--- ranged wave-4 fights (seed day vid weapon caller class volley) ---');
for (const f of ranged) {
  const v = f.volley || {};
  console.log(`s${f.seed} d${f.day} ${f.vid} ${f.mid} ${f.rangedWeaponId} need=${f.rangedAmmoId} carried=${f.carriedNeeded} stash=${f.ownStashNeeded} caller=${f.callerClass} class=${classify(f)} volley=${v.shots || 0}shots/${v.dmg || 0}dmg outcome=${f.outcome} depart=${f.depart.onExpedition ? 'exped' : f.depart.away ? 'away' : 'home'} pockets=${(f.pocket || {}).pocketCalls || 0} everCarried=${(f.pocket || {}).everCarried || 0}`);
}
