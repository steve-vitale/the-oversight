#!/usr/bin/env node
// sim-rerunclock-wallseg-analyze.js — rerun-clock census + window
// attribution for arm sim-rerunclock-wallseg. Namespace
// sim-rerunclock-wallseg-* (new files only).
//
// Reads evidence/2026-10-24/perseed-rerunclock-wallseg/s<seed>-<policy>.json
// (pilot 73201-73208 x lead/belong by default; SEEDS/POLICIES env override
// for the extension band and the 702xx secondary) and writes
// sim-rerunclock-wallseg-attribution.json next to the corpus. Reports:
//   1. Census: per-config w4/w5 days, end, national/table/wins, maxWave.
//   2. Wall numbers: national / table / wins, wave 4-5 unlocks, median /
//      max survival, death-cause shares, villager (non-scholar) combat
//      deaths as co-primary (§14c) alongside scholar combat deaths.
//   3. Lead/belong identity vs divergence per seed (postunlock2-b found
//      byte-identity on 708xx — reported here, never leaned on).
//   4. Door windows: EVERY door-open config carries door day, days
//      post-door to lost/cap, overtime tier trajectory 1..6 with
//      days-at-tier, rerun counts all/w4/w5/post-door, killer class per
//      the rerunclock rule, door-bar snapshot (veterans/armor/armed at
//      door), Eulogy-cascade deaths (cause-attributed), and gap-W2 kit
//      linkage stats (linked/unlinked deaths in the window).
//   5. Census verdict (PRE-REGISTERED rule, over LOST DOOR configs —
//      not lost qualifying configs: the brief's population is doors):
//      'rerun-clock' iff a majority of LOST door configs classify
//      rerun-clock; 'single-apex' iff a majority classify single-apex;
//      'mixed/other' otherwise; 'no door configs' / 'no lost door
//      configs' when those populations are empty (findings, not verdicts).
//   6. DIAG bar (backlog #894 fix — the sim-rerunclock vacuous-true bug):
//      diagGo REQUIRES qualifyingTotal >= 1. A vacuous true on an empty
//      population is a bug, not a GO. diagGo = censusComplete AND
//      qualifyingTotal >= 1 AND every qualifying config trajectory-
//      attributed AND verdictNamed. The evidence GO bar is stricter:
//      goBar.go = doorOpen >= 2 AND every door config attributed AND
//      verdictNamed. The analyzer reports both; the evidence judges.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-rerunclock-wallseg');
let kit = null;
try { kit = require(path.join(REPO, 'scripts', 'sim-instrument-kit')); } catch (e) { kit = null; }

function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [73201, 73202, 73203, 73204, 73205, 73206, 73207, 73208]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['lead', 'belong']);
const CONFIGS = [];
const missing = [];
for (const s of SEEDS) {
  for (const b of POLICIES) {
    const fn = path.join(EVID, `s${s}-${b}.json`);
    if (!fs.existsSync(fn)) { missing.push(`s${s}-${b}`); continue; }
    CONFIGS.push({ seed: s, base: b, cur: load(fn) });
  }
}
function isVillager(d) { return !!d.person && !d.player; }
function isScholar(d) { return !!d.person && !!d.player; }
function windowDeaths(C, T) {
  const ds = C.postunlockDeaths || [];
  if (T.windowOpen == null) return [];
  return ds.filter(d => (d.day | 0) >= (T.windowOpen | 0));
}
function censusRow(c) {
  const C = c.cur, T = C.trajectory || {};
  const ds = C.postunlockDeaths || [];
  const vd = ds.filter(isVillager), sd = ds.filter(isScholar);
  const door = C.unlock && C.unlock.w5Day != null;
  const wDeaths = windowDeaths(C, T);
  const wVd = wDeaths.filter(isVillager);
  return { config: `s${c.seed}-${c.base}`, seed: c.seed, base: c.base,
    w4Day: C.unlock ? C.unlock.w4Day : null, w5Day: C.unlock ? C.unlock.w5Day : null,
    endDay: C.days, endReason: C.endReason, national: C.national, table: C.table, won: C.won,
    exiled: C.exiled, maxWave: C.maxWave, qualifying: !!T.qualifying, doorOpen: !!door,
    nationalDay: T.nationalDay, tableDay: T.tableDay, windowOpen: T.windowOpen,
    tierFirst: T.tierFirst, tierAtNational: T.tierAtNational, tierAtDoor: T.tierAtDoor, tierAtEnd: T.tierAtEnd,
    daysAtTier: T.daysAtTier, daysPostDoor: T.daysPostDoor, daysPostNational: T.daysPostNational,
    rerun: T.rerun, fights: T.fights, lastDeath: T.lastDeath,
    killerClass: T.killerClass, killerReason: T.killerReason,
    trajectoryComplete: !!T.trajectoryComplete,
    doorSnapshot: C.doorSnapshot || null,
    eulogyCascadePostWindow: C.eulogyCascadePostWindow != null ? C.eulogyCascadePostWindow : null,
    windowVillagerDeaths: wVd.length, windowVillagerCombatDeaths: wVd.filter(d => d.combatCause).length,
    villagerDeaths: vd.length, villagerCombatDeaths: vd.filter(d => d.combatCause).length,
    scholarDeaths: sd.length, scholarCombatDeaths: sd.filter(d => d.combatCause).length,
    instrumentErrors: (C.instrumentErrors || []).length };
}
const census = CONFIGS.map(censusRow);
function wallNumbers(rows) {
  return { n: rows.length, national: rows.filter(r => r.national).length,
    table: rows.filter(r => r.table).length, wins: rows.filter(r => r.won).length,
    exiled: rows.filter(r => r.exiled).length,
    wave4: rows.filter(r => r.w4Day != null).length, wave5: rows.filter(r => r.w5Day != null).length,
    villageLost: rows.filter(r => r.endReason === 'village-lost').length,
    survived: rows.filter(r => r.endReason !== 'village-lost').length,
    medianSurvival: median(rows.map(r => r.endDay)),
    maxSurvival: rows.length ? Math.max.apply(null, rows.map(r => r.endDay)) : null,
    villagerCombatDeaths: rows.reduce((a, r) => a + r.villagerCombatDeaths, 0),
    villagerDeaths: rows.reduce((a, r) => a + r.villagerDeaths, 0),
    scholarCombatDeaths: rows.reduce((a, r) => a + r.scholarCombatDeaths, 0) };
}
const overall = wallNumbers(census);
const perPolicy = {};
for (const b of POLICIES) perPolicy[b] = wallNumbers(census.filter(r => r.base === b));
const causeShares = {};
const villagerCauseShares = {};
for (const c of CONFIGS) {
  for (const d of (c.cur.postunlockDeaths || [])) {
    const k = String(d.cause || 'unknown');
    causeShares[k] = (causeShares[k] || 0) + 1;
    if (isVillager(d)) villagerCauseShares[k] = (villagerCauseShares[k] || 0) + 1;
  }
}
const identity = [];
for (const s of SEEDS) {
  const l = census.find(r => r.seed === s && r.base === 'lead');
  const be = census.find(r => r.seed === s && r.base === 'belong');
  if (!l || !be) { identity.push({ seed: s, identical: null, note: 'pair incomplete' }); continue; }
  const fields = ['w4Day', 'w5Day', 'endDay', 'endReason', 'national', 'table', 'won', 'maxWave'];
  const diff = fields.filter(f => l[f] !== be[f]);
  identity.push({ seed: s, identical: diff.length === 0, differingFields: diff });
}
function doorDetail(c) {
  const C = c.cur, T = C.trajectory || {};
  const row = census.find(r => r.config === `s${c.seed}-${c.base}`);
  let kitStats = null;
  if (kit && typeof kit.attributeWindowDeaths === 'function') {
    try {
      const wds = windowDeaths(C, T);
      const res = kit.attributeWindowDeaths(wds, C.postunlockFights || []);
      kitStats = { total: res.total, linked: res.linked, unlinked: res.unlinked, byStrength: res.byStrength };
    } catch (e) { kitStats = { error: String((e && e.message) || e) }; }
  }
  const snap = C.doorSnapshot || {};
  return Object.assign({}, row, { kitWindowStats: kitStats,
    doorBarsAtOrBefore: snap.atOrBefore || null, doorBarsAtOrAfter: snap.atOrAfter || null,
    attributed: !!T.trajectoryComplete && (snap.atOrBefore != null || snap.atOrAfter != null) });
}
const doorConfigs = CONFIGS.filter(c => c.cur.unlock && c.cur.unlock.w5Day != null).map(doorDetail);
const qualifying = CONFIGS.filter(c => (c.cur.trajectory || {}).qualifying).map(c => doorDetail(c));
const lostDoor = doorConfigs.filter(q => q.endReason === 'village-lost');
let verdict;
if (!doorConfigs.length) verdict = 'no door configs';
else if (!lostDoor.length) verdict = 'no lost door configs';
else {
  const rc = lostDoor.filter(q => q.killerClass === 'rerun-clock').length;
  const sa = lostDoor.filter(q => q.killerClass === 'single-apex').length;
  if (rc > lostDoor.length / 2) verdict = 'rerun-clock';
  else if (sa > lostDoor.length / 2) verdict = 'single-apex';
  else verdict = 'mixed/other';
}
const verdictNamed = ['rerun-clock', 'single-apex', 'mixed/other'].indexOf(verdict) >= 0;
const censusComplete = missing.length === 0 && CONFIGS.length === SEEDS.length * POLICIES.length;
// Backlog #894: diagGo MUST require >= 1 qualifying config — a vacuous
// true on an empty population is a bug, not a GO.
const bar = { censusComplete, qualifyingTotal: qualifying.length,
  qualifyingAttributed: qualifying.filter(q => q.trajectoryComplete).length,
  doorOpen: doorConfigs.length,
  doorAttributed: doorConfigs.filter(q => q.attributed).length,
  verdictNamed,
  diagGo: censusComplete && qualifying.length >= 1 &&
    qualifying.every(q => q.trajectoryComplete) && verdictNamed };
const goBar = { go: doorConfigs.length >= 2 && doorConfigs.length > 0 &&
    doorConfigs.every(q => q.attributed) && verdictNamed,
  doorOpen: doorConfigs.length, doorAttributed: doorConfigs.filter(q => q.attributed).length, verdictNamed };
const out = { seeds: SEEDS, policies: POLICIES, missing, census, wallNumbers: overall, perPolicy,
  causeShares, villagerCauseShares, identity,
  doorConfigs, qualifyingCount: qualifying.length,
  lostDoorCount: lostDoor.length,
  killerClassCounts: { 'rerun-clock': lostDoor.filter(q => q.killerClass === 'rerun-clock').length,
    'single-apex': lostDoor.filter(q => q.killerClass === 'single-apex').length,
    'mixed/other': lostDoor.filter(q => q.killerClass === 'mixed/other').length,
    survived: doorConfigs.filter(q => q.endReason !== 'village-lost').length },
  verdict, bar, goBar };
const outPath = path.join(EVID, 'sim-rerunclock-wallseg-attribution.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify(out, null, 1));
