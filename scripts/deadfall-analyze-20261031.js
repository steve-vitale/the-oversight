#!/usr/bin/env node
// deadfall-analyze-20261031.js — paired census analysis for sim-deadfall-b (stickfiber fields + deadfall ledger).
// Reads evidence/2026-10-31/perseed-deadfall-b/<arm>/s<seed>.json (or EVID
// + ARM env) and prints: census completeness, per-seed pile ever/max,
// per-weapon supply classes, pocket-call material classification,
// sling-step breakdown, end-of-run ammo census, wall numbers.
// Writes NOTHING; prints JSON summary + tables.
// Usage: ARM=baseline|prototype node scripts/deadfall-analyze-20261031.js [seed...]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const ARM = process.env.ARM || 'baseline';
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-deadfall-b', ARM);
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
// Recipe materials (src/data/recipes.json): arrow stick2+stone1+fiber1,
// bolt stick2+stone1. Returns list of materials short at the given pile.
function shortMats(ammoId, pile) {
  const p = pile || {};
  if (ammoId === 'arrow') {
    const out = [];
    if ((p.stick || 0) < 2) out.push('stick');
    if ((p.stone || 0) < 1) out.push('stone');
    if ((p.fiber || 0) < 1) out.push('fiber');
    return out;
  }
  if (ammoId === 'bolt') {
    const out = [];
    if ((p.stick || 0) < 2) out.push('stick');
    if ((p.stone || 0) < 1) out.push('stone');
    return out;
  }
  return [];
}

const all = [];
const wall = [];
const pilePerSeed = [];
const supplyCalls = [];
let errsTotal = 0, supplyErrsTotal = 0;
let endCarried = {}, endStash = {}, craftAll = {};
for (const seed of seeds) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}.json`), 'utf8'));
  wall.push(d);
  errsTotal += (d.instrumentErrors || []).length;
  supplyErrsTotal += (d.supplyErrors || []).length;
  for (const f of (d.fights || [])) all.push(Object.assign({ seed }, f));
  for (const c of (d.supplyPocketCalls || [])) supplyCalls.push(Object.assign({ seed }, c));
  // Pile trajectory aggregates from the raw daily array.
  const daily = (d.supplyDaily || []).filter(r => r.pile);
  const agg = {};
  for (const mat of ['stick', 'fiber', 'stone', 'branch']) {
    let mx = 0, ever = false, first = null, daysPos = 0;
    for (const r of daily) {
      const v = (r.pile[mat] || 0);
      if (v > mx) mx = v;
      if (v > 0) { ever = true; daysPos++; if (first === null) first = r.day; }
    }
    agg[mat] = { ever, max: mx, firstDay: first, daysPositive: daysPos, final: daily.length ? (daily[daily.length - 1].pile[mat] || 0) : null };
  }
  pilePerSeed.push({ seed, days: (d.supplyDaily || []).length, pileNullDays: (d.supplyDaily || []).filter(r => !r.pile).length, agg });
  const se = d.supplyEnd || {};
  for (const [k, v] of Object.entries(se.carriedTotals || {})) endCarried[k] = (endCarried[k] || 0) + v;
  for (const [k, v] of Object.entries(se.stashTotals || {})) endStash[k] = (endStash[k] || 0) + v;
  for (const [vid, m] of Object.entries(se.ammoCraftAll || {})) {
    for (const [ammo, lvl] of Object.entries(m || {})) {
      const key = vid + ':' + ammo;
      craftAll[key] = lvl;
    }
  }
}

const ranged = all.filter(f => f.rangedAmmoId);
// Completeness: pile non-null + pocket object present + caller present.
// (ammoCraft null = "none crafted" is complete, not missing.)
const complete = all.filter(f => f.pile && f.pocket && f.callerClass).length;
const completeness = all.length ? complete / all.length : 0;

// Pocket-call material classification (bow/crossbow only).
const bowCalls = supplyCalls.filter(c => c.out && (c.out.ammoId === 'arrow' || c.out.ammoId === 'bolt'));
const callClass = [];
for (const c of bowCalls) {
  if (c.out.crafted === 1) callClass.push(c.out.craftedOk ? 'craft-success' : 'craft-failed-blind-roll');
  else {
    const short = shortMats(c.out.ammoId, c.prePile);
    callClass.push(short.length ? 'material-blocked:' + short.join('+') : 'craft-not-attempted-other');
  }
}
const blockedByMat = {};
for (const c of bowCalls) {
  if (c.out.crafted === 1) continue;
  for (const m of shortMats(c.out.ammoId, c.prePile)) blockedByMat[m] = (blockedByMat[m] || 0) + 1;
}
const slingCalls = supplyCalls.filter(c => c.out && c.out.ammoId === 'stone');
// Sling-step breakdown per sling FIGHT (not per call).
const slingFights = ranged.filter(f => f.rangedAmmoId === 'stone');
const slingSteps = { 'no-pocket-call': 0, 'call-took-stones': 0, 'call-capped-or-full': 0, 'call-zero-take-pile-positive-contradiction': 0, 'other': 0 };
for (const f of slingFights) {
  const calls = supplyCalls.filter(c => c.seed === f.seed && c.vid === f.vid && c.day <= f.day);
  if (!calls.length) { slingSteps['no-pocket-call']++; continue; }
  const took = calls.some(c => {
    const pre = Object.values(c.preCarried || {}).reduce((a, b) => a + b, 0);
    const post = Object.values(c.postCarried || {}).reduce((a, b) => a + b, 0);
    return post > pre;
  });
  if (took) { slingSteps['call-took-stones']++; continue; }
  const last = calls[calls.length - 1];
  const carriedStone = (last.preCarried || {}).stone || 0;
  if (carriedStone >= 6) slingSteps['call-capped-or-full']++;
  else if ((last.prePile || {}).stone > 0) slingSteps['call-zero-take-pile-positive-contradiction']++;
  else slingSteps['other']++;
}
// Supply-side class per ranged fight.
function supplyClass(f) {
  const need = f.rangedAmmoId;
  const carried = (f.carried && f.carried[need]) || 0;
  if (carried > 0) return 'carried-at-fight';
  const calls = supplyCalls.filter(c => c.seed === f.seed && c.vid === f.vid && c.day <= f.day && c.out && c.out.ammoId === need);
  const everCarried = (f.pocket || {}).everCarried || 0;
  if (everCarried > 0) return 'carried-but-spent';
  if (calls.some(c => c.out.crafted === 1 && c.out.craftedOk)) return 'produced-but-never-carried';
  if (calls.some(c => c.out.crafted === 1)) return 'craft-attempted-failed-roll';
  if (calls.length) return 'called-never-produced';
  return 'never-called-never-produced';
}

const deadfallPerSeed = wall.map(d => ({ seed: d.seed, hauls: d.deadfallHauls || 0, sticks: d.deadfallSticks || 0, fiber: d.deadfallFiber || 0 }));
const summary = {
  arm: ARM, seeds, seedCount: seeds.length,
  deadfall: { perSeed: deadfallPerSeed,
    seedsWithHauls: deadfallPerSeed.filter(x => x.hauls > 0).length,
    seedsPileStickPositive: pilePerSeed.filter(x => x.agg.stick.ever).length,
    totalHauls: deadfallPerSeed.reduce((t, x) => t + x.hauls, 0),
    totalSticks: deadfallPerSeed.reduce((t, x) => t + x.sticks, 0),
    totalFiber: deadfallPerSeed.reduce((t, x) => t + x.fiber, 0),
    medianStoneMax: medianOf(pilePerSeed.map(x => x.agg.stone.max)),
    seedsStonePositive: pilePerSeed.filter(x => x.agg.stone.ever).length }, 
  fights: all.length, rangedFights: ranged.length,
  censusCompleteness: completeness, completeFights: complete,
  outcomes: counter(all, f => f.outcome),
  volley: {
    rangedWithShots: ranged.filter(f => ((f.volley && f.volley.shots) || 0) > 0).length,
    totalShots: ranged.reduce((t, f) => t + ((f.volley && f.volley.shots) || 0), 0),
    totalDmg: all.reduce((t, f) => t + ((f.volley && f.volley.dmg) || 0), 0),
  },
  pileAtFight: {
    stickZero: ranged.filter(f => f.pile && (f.pile.stick || 0) === 0).length,
    fiberZero: ranged.filter(f => f.pile && (f.pile.fiber || 0) === 0).length,
    stoneRange: ranged.length ? [Math.min.apply(null, ranged.filter(f => f.pile).map(f => f.pile.stone || 0)), Math.max.apply(null, ranged.filter(f => f.pile).map(f => f.pile.stone || 0))] : null,
  },
  pilePerSeed,
  pocketCalls: {
    total: supplyCalls.length,
    bowCalls: bowCalls.length,
    bowCallClasses: counter(callClass, x => x),
    blockedByMaterial: blockedByMat,
    craftAttempts: bowCalls.filter(c => c.out.crafted === 1).length,
    craftSuccesses: bowCalls.filter(c => c.out.crafted === 1 && c.out.craftedOk).length,
    slingCalls: slingCalls.length,
  },
  slingSteps,
  supplyClasses: counter(ranged, supplyClass),
  supplyClassesByWeapon: {},
  callersRanged: counter(ranged, f => f.callerClass),
  endCensus: { carriedTotals: endCarried, stashTotals: endStash, ammoCraftEntries: Object.keys(craftAll).length, ammoCraft: craftAll },
  instrumentErrors: errsTotal, supplyErrors: supplyErrsTotal,
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
  summary.supplyClassesByWeapon[w] = summary.supplyClassesByWeapon[w] || {};
  const c = supplyClass(f);
  summary.supplyClassesByWeapon[w][c] = (summary.supplyClassesByWeapon[w][c] || 0) + 1;
}
console.log(JSON.stringify(summary, null, 1));
console.log('\n--- ranged wave-4 fights (seed day vid weapon need carried stash pile caller supplyClass volley) ---');
for (const f of ranged) {
  const v = f.volley || {};
  console.log(`s${f.seed} d${f.day} ${f.vid} ${f.mid} ${f.rangedWeaponId} need=${f.rangedAmmoId} carried=${f.carriedNeeded} stash=${f.ownStashNeeded} pile=${f.pile ? `st${f.pile.stick}/f${f.pile.fiber}/s${f.pile.stone}` : 'null'} caller=${f.callerClass} supply=${supplyClass(f)} volley=${v.shots || 0}shots/${v.dmg || 0}dmg outcome=${f.outcome} pockets=${(f.pocket || {}).pocketCalls || 0}`);
}
console.log('\n--- dry ranged fighters: pocket calls with pile-at-call (seed vid weapon ammoId day prePile out) ---');
for (const f of ranged.filter(x => (x.carriedNeeded || 0) === 0)) {
  const calls = supplyCalls.filter(c => c.seed === f.seed && c.vid === f.vid && c.day <= f.day);
  console.log(`s${f.seed} ${f.vid} ${f.rangedWeaponId} fight-d${f.day} calls=${calls.length} ${calls.map(c => `d${c.day}:pile st${c.prePile ? c.prePile.stick : '?'} /f${c.prePile ? c.prePile.fiber : '?'} /s${c.prePile ? c.prePile.stone : '?'} out=${JSON.stringify(c.out)}`).join(' | ') || '(none)'}`);
}
