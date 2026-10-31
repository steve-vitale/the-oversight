#!/usr/bin/env node
// pocketcall-analyze-20261031.js — census analysis for sim-pocketcall-a.
// Reads evidence/2026-10-31/perseed-pocketcall-a/census/s<seed>.json
// (or EVID env) and prints: classification completeness, class counts
// (with n, by weapon, by caller), sensed-contact breakdown for
// never-called (+ secondary for never-departed), supply-blocked vs
// call-blocked split for dry fights, volley totals, wall numbers, and
// a reproduction check against deadfall-b's prototype corpus.
// Writes NOTHING; prints JSON summary + tables.
// Usage: node scripts/pocketcall-analyze-20261031.js [seed...]
//   EVID=... node scripts/pocketcall-analyze-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-31', 'perseed-pocketcall-a', 'census');
const { classifyFight, sensedContact } = require(path.join(REPO, 'scripts', 'pocketcall-diag-20261031'));
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
function supplySplit(f) {
  const pile = f.pile || {};
  const need = f.rangedAmmoId;
  if (need === 'arrow') return ((pile.stick || 0) < 2 || (pile.fiber || 0) < 1) ? 'supply-blocked' : 'call-blocked';
  if (need === 'bolt') return ((pile.stick || 0) < 2) ? 'supply-blocked' : 'call-blocked';
  if (need === 'stone') return ((pile.stone || 0) === 0) ? 'supply-blocked' : 'call-blocked';
  return 'other-ammo-no-pile-recipe';
}

const all = []; // joined ranged fights with class + sensed + split
const wall = [];
const joinProblems = [];
let errsTotal = 0, pcErrsTotal = 0, supplyErrsTotal = 0, sfErrsTotal = 0;
let totalFights = 0, lowWave = 0, fieldCalls = 0;
const deadfallPerSeed = [];
const pileStickSeeds = [];
for (const seed of seeds) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}.json`), 'utf8'));
  wall.push(d);
  errsTotal += (d.instrumentErrors || []).length;
  pcErrsTotal += (d.pcErrors || []).length;
  supplyErrsTotal += (d.supplyErrors || []).length;
  sfErrsTotal += (d.stickfiberErrors || []).length;
  totalFights += (d.fights || []).length;
  lowWave += (d.lowWaveFights || 0);
  fieldCalls += (d.fieldFightCalls || 0);
  deadfallPerSeed.push({ seed, hauls: d.deadfallHauls || 0, sticks: d.deadfallSticks || 0, fiber: d.deadfallFiber || 0 });
  const daily = (d.supplyDaily || []).filter(r => r.pile);
  pileStickSeeds.push({ seed, stickEver: daily.some(r => (r.pile.stick || 0) > 0),
    stickMax: daily.reduce((m, r) => Math.max(m, r.pile.stick || 0), 0) });
  const adFights = d.fights || [];
  const pcFights = d.pcFights || [];
  if (adFights.length !== pcFights.length) {
    joinProblems.push({ seed, adFights: adFights.length, pcFights: pcFights.length });
  }
  const n = Math.min(adFights.length, pcFights.length);
  for (let i = 0; i < n; i++) {
    const f = adFights[i], p = pcFights[i];
    if (f.day !== p.day || f.vid !== p.vid || f.mid !== p.mid) {
      joinProblems.push({ seed, index: i, ad: [f.day, f.vid, f.mid], pc: [p.day, p.vid, p.mid] });
    }
    if (!f.rangedAmmoId) continue;
    const cls = classifyFight({ carriedNeeded: f.carriedNeeded, pocketBefore: p.pocketBefore,
      departBefore: p.departBefore, wentBefore: p.wentBefore,
      fighterNode: p.fighterNode, havenNode: p.havenNode, away: !!p.away, onExpedition: p.onExpedition });
    const sens = sensedContact({ fighterNode: p.fighterNode, scholarNode: p.scholarNode,
      fighterGrid: p.fighterGrid, scholarGridRaw: p.scholarGridRaw,
      crewIncludesVid: p.crewIncludesVid, crewAliveOthers: p.crewAliveOthers,
      partyIncludesVid: p.partyIncludesVid });
    const dry = cls.cls !== 'ARMED';
    // Weapon-first-seen vs last pre-fight pocket day (strict day < fight day).
    let weaponNote = null;
    try {
      const seen = (d.weaponFirstSeen || {})[f.vid] || {};
      const firstSeen = seen[f.rangedWeaponId] ? seen[f.rangedWeaponId].day : null;
      const prePockets = (d.pocketCalls || []).filter(c => c.vid === f.vid && c.day < f.day);
      const lastPocketDay = prePockets.length ? Math.max.apply(null, prePockets.map(c => c.day)) : null;
      if (firstSeen !== null && lastPocketDay !== null && firstSeen > lastPocketDay) weaponNote = 'pocket-predates-weapon';
      else if (firstSeen !== null && lastPocketDay === null && (p.pocketBefore || 0) > 0) weaponNote = 'pocket-same-day-only';
      else if (firstSeen !== null) weaponNote = 'pocket-after-weapon';
      else weaponNote = 'weapon-first-seen-unknown';
    } catch (e) { weaponNote = 'weapon-note-error'; }
    all.push(Object.assign({ seed }, f, { pc: p, cls: cls.cls, atHome: cls.atHome,
      nodeUnknown: cls.nodeUnknown, anomaly: cls.anomaly,
      sensed: sens, supplySplit: dry ? supplySplit(f) : null, weaponNote }));
  }
}

const ranged = all;
const classes = ['ARMED', 'NEVER-CALLED', 'NEVER-DEPARTED', 'DRY-AT-HOME', 'DRY-AT-FIGHT'];
const classCounts = {};
for (const c of classes) classCounts[c] = ranged.filter(f => f.cls === c).length;
const anomalies = ranged.filter(f => f.anomaly).length;
const neverCalled = ranged.filter(f => f.cls === 'NEVER-CALLED');
const neverDeparted = ranged.filter(f => f.cls === 'NEVER-DEPARTED');
const dry = ranged.filter(f => f.cls !== 'ARMED');
function sensSummary(rows) {
  const out = { n: rows.length, union: 0, unreachable: 0,
    c1: 0, c2: 0, c2Stale: 0, c3: 0, c4: 0,
    overlaps: { c1c3: 0, c1c4: 0, c3c4: 0, all3: 0 } };
  for (const f of rows) {
    const s = f.sensed;
    if (s.c1) out.c1++;
    if (s.c2) out.c2++;
    if (s.c2Stale) out.c2Stale++;
    if (s.c3) out.c3++;
    if (s.c4) out.c4++;
    if (s.reachable) out.union++; else out.unreachable++;
    if (s.c1 && s.c3) out.overlaps.c1c3++;
    if (s.c1 && s.c4) out.overlaps.c1c4++;
    if (s.c3 && s.c4) out.overlaps.c3c4++;
    if (s.c1 && s.c3 && s.c4) out.overlaps.all3++;
  }
  return out;
}
const complete = ranged.filter(f => f.cls && (f.cls === 'ARMED' || f.supplySplit) &&
  ((f.cls !== 'NEVER-CALLED' && f.cls !== 'NEVER-DEPARTED') || f.sensed)).length;
const completeness = ranged.length ? complete / ranged.length : 0;

// Reproduction check vs deadfall-b prototype corpus (cross-base, labeled).
let repro = null;
try {
  const dbDir = path.join(REPO, 'evidence', '2026-10-31', 'perseed-deadfall-b', 'prototype');
  const dbFights = [];
  for (const seed of seeds) {
    const fp = path.join(dbDir, `s${seed}.json`);
    if (!fs.existsSync(fp)) continue;
    const dd = JSON.parse(fs.readFileSync(fp, 'utf8'));
    for (const f of (dd.fights || [])) dbFights.push({ seed, day: f.day, vid: f.vid, mid: f.mid, outcome: f.outcome,
      volleyShots: (f.volley && f.volley.shots) || 0, volleyDmg: (f.volley && f.volley.dmg) || 0 });
  }
  const mine = all.map(f => ({ seed: f.seed, day: f.day, vid: f.vid, mid: f.mid, outcome: f.outcome,
    volleyShots: (f.volley && f.volley.shots) || 0, volleyDmg: (f.volley && f.volley.dmg) || 0 }));
  const key = (x) => `${x.seed}|${x.day}|${x.vid}|${x.mid}|${x.outcome}`;
  const dbKeys = new Set(dbFights.map(key));
  const myKeys = new Set(mine.map(key));
  let identical = 0;
  for (const k of myKeys) if (dbKeys.has(k)) identical++;
  repro = { deadfallPrototypeFights: dbFights.length, myRangedFights: mine.length,
    identicalFightIdentity: identical,
    deadfallVolleyFights: dbFights.filter(f => f.volleyShots > 0).map(f => `${f.seed} d${f.day} ${f.vid} ${f.volleyShots}shots/${f.volleyDmg}dmg`),
    myVolleyFights: mine.filter(f => f.volleyShots > 0).map(f => `${f.seed} d${f.day} ${f.vid} ${f.volleyShots}shots/${f.volleyDmg}dmg`) };
} catch (e) { repro = { error: String(e && e.message) }; }

const summary = {
  seeds, seedCount: seeds.length,
  totalWave4Fights: totalFights, rangedFights: ranged.length,
  lowWaveFights: lowWave, fieldFightCalls: fieldCalls,
  joinProblems, joinOk: joinProblems.length === 0,
  classificationCompleteness: completeness, classified: complete, anomalies,
  classCounts,
  classByWeapon: {},
  classByCaller: {},
  crossTab: counter(ranged, f => `P${(f.pc.pocketBefore || 0) > 0 ? '>0' : '0'}/D${(f.pc.departBefore || 0) > 0 ? '>0' : '0'}/A${(f.carriedNeeded || 0) > 0 ? '>0' : '0'}`),
  sensedNeverCalled: sensSummary(neverCalled),
  sensedNeverDepartedSecondary: sensSummary(neverDeparted),
  supplySplitDry: counter(dry, f => f.supplySplit),
  supplySplitByClass: {},
  weaponNoteDry: counter(dry, f => f.weaponNote),
  volley: {
    rangedWithShots: ranged.filter(f => ((f.volley && f.volley.shots) || 0) > 0).length,
    totalShots: ranged.reduce((t, f) => t + ((f.volley && f.volley.shots) || 0), 0),
    totalDmg: ranged.reduce((t, f) => t + ((f.volley && f.volley.dmg) || 0), 0),
  },
  outcomes: counter(ranged, f => f.outcome),
  callersRanged: counter(ranged, f => f.callerClass),
  deadfall: { perSeed: deadfallPerSeed,
    seedsWithHauls: deadfallPerSeed.filter(x => x.hauls > 0).length,
    totalHauls: deadfallPerSeed.reduce((t, x) => t + x.hauls, 0),
    totalSticks: deadfallPerSeed.reduce((t, x) => t + x.sticks, 0),
    totalFiber: deadfallPerSeed.reduce((t, x) => t + x.fiber, 0) },
  pileStickSeeds: { positive: pileStickSeeds.filter(x => x.stickEver).length, perSeed: pileStickSeeds },
  instrumentErrors: { ammo: errsTotal, pc: pcErrsTotal, supply: supplyErrsTotal, stickfiber: sfErrsTotal },
  wall: {
    national: wall.reduce((t, d) => t + (d.national || 0), 0),
    table: wall.reduce((t, d) => t + (d.table || 0), 0),
    wins: wall.reduce((t, d) => t + (d.won || 0), 0),
    wave4: wall.filter(d => (d.maxWave || 1) >= 4).length,
    wave5: wall.filter(d => (d.maxWave || 1) >= 5).length,
    medianSurvival: medianOf(wall.map(d => d.gameDays || 0)),
    maxSurvival: Math.max.apply(null, wall.map(d => d.gameDays || 0)),
  },
  reproductionVsDeadfallB: repro,
};
for (const f of ranged) {
  const w = f.rangedWeaponId || 'none';
  summary.classByWeapon[w] = summary.classByWeapon[w] || {};
  summary.classByWeapon[w][f.cls] = (summary.classByWeapon[w][f.cls] || 0) + 1;
  const c = f.callerClass || 'unknown';
  summary.classByCaller[c] = summary.classByCaller[c] || {};
  summary.classByCaller[c][f.cls] = (summary.classByCaller[c][f.cls] || 0) + 1;
  if (f.cls !== 'ARMED') {
    summary.supplySplitByClass[f.cls] = summary.supplySplitByClass[f.cls] || {};
    summary.supplySplitByClass[f.cls][f.supplySplit] = (summary.supplySplitByClass[f.cls][f.supplySplit] || 0) + 1;
  }
}
console.log(JSON.stringify(summary, null, 1));
console.log('\n--- ranged fights (seed day vid weapon need carried P D W class caller supply volley outcome pile sensed) ---');
for (const f of ranged) {
  const v = f.volley || {};
  const s = f.sensed;
  const sensTxt = (f.cls === 'NEVER-CALLED' || f.cls === 'NEVER-DEPARTED')
    ? `sens[${s.c1 ? 'C1' : '-'}${s.c2 ? 'C2' : '-'}${s.c3 ? 'C3' : '-'}${s.c4 ? 'C4' : '-'}${s.c2Stale ? ' stale' : ''} reachable=${s.reachable}]`
    : 'sens[n/a]';
  console.log(`s${f.seed} d${f.day} ${f.vid} ${f.mid} ${f.rangedWeaponId} need=${f.rangedAmmoId} carried=${f.carriedNeeded} P=${f.pc.pocketBefore} D=${f.pc.departBefore} W=${f.pc.wentBefore} ${f.cls} caller=${f.callerClass} supply=${f.supplySplit || '-'} volley=${v.shots || 0}/${v.dmg || 0} outcome=${f.outcome} pile=${f.pile ? `st${f.pile.stick}/f${f.pile.fiber}/s${f.pile.stone}` : 'null'} ${sensTxt} nodeUnknown=${f.nodeUnknown} weaponNote=${f.weaponNote}`);
}
console.log('\n--- never-called sensed detail (seed day vid fighterNode scholarNode fighterGrid crewMates party) ---');
for (const f of neverCalled) {
  const p = f.pc;
  console.log(`s${f.seed} d${f.day} ${f.vid} fighterNode=${p.fighterNode ? `${p.fighterNode.nx},${p.fighterNode.ny}` : 'null'} scholarNode=${p.scholarNode ? `${p.scholarNode.nx},${p.scholarNode.ny}` : 'null'} fighterGrid=${p.fighterGrid ? `${p.fighterGrid.mx},${p.fighterGrid.my}` : 'null'} scholarGrid=${p.scholarGridRaw ? `${p.scholarGridRaw.mx},${p.scholarGridRaw.my}` : 'null(fallback 4,4)'} crewIn=${p.crewIncludesVid} crewAliveOthers=${JSON.stringify(p.crewAliveOthers)} party=${p.partyIncludesVid} monsterNode=${p.monsterNode ? `${p.monsterNode.tx},${p.monsterNode.ty}` : 'null'} optAllies=${p.optAllies} optAllyVids=${JSON.stringify(p.optAllyVids)}`);
}
