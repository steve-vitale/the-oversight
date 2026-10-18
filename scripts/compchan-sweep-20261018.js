#!/usr/bin/env node
// compchan-sweep-20261018.js — sim-compchan funnel census (2026-10-18).
//
// DIAGNOSTIC — no lever. 8 fresh seeds x {leadfeast, belongfeast} = 16 runs,
// 180d death-aware, on the vetstaff-a pre-seat substrate with the COMPCHAN
// read-only instrument.
//
// INSTRUMENT: loadGame({seed, mode:'compchan', fullTelemetry:false}) +
// scripts/policies/tribfloor leadfeast/belongfeast (pure tribfloor base — NO
// vetstaff/vetblood/vetrel) + scripts/compchan-instrument-20261018.js
// (COMPCHAN=1) + runDays({days:180, manifest:undefined, sampleEvery:30}).
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-18/perseed-compchan/ and prints a summary. No timestamps
// or timings are written, so re-runs are byte-comparable.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 COMPCHAN=1 \
//   SEEDS=63101,63102 node scripts/compchan-sweep-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const CC = require(path.join(REPO, 'scripts', 'compchan-instrument-20261018'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'COMPCHAN']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (process.env.VETSTAFF === '1') { console.error('SWEEP STOP: VETSTAFF must be unset (pure tribfloor base).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!CC.instrumentOn()) { console.error('SWEEP STOP: COMPCHAN instrument off despite COMPCHAN=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63101, 63102, 63103, 63104, 63105, 63106, 63107, 63108]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-18', 'perseed-compchan');
fs.mkdirSync(EVID, { recursive: true });

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) {}
  return String(vid || '?').slice(0, 14);
}

function isLiving(Game, vid, scholarId) {
  if (!vid) return false;
  if (vid === scholarId) return true; // the scholar is the current adventurer (standing.js)
  try {
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    return !!(vp && !vp.dead);
  } catch (e) { return false; }
}

function armorP(Game, vid) {
  try {
    const S = globalThis.Scattering || {};
    const eq = S.equipment || null;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (!vp || !eq || typeof eq.armorOf !== 'function') return 0;
    return eq.armorOf(vp, (Game.data && Game.data.items) || []) | 0;
  } catch (e) { return 0; }
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'compchan', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], instrumentErrors: [] };
  const uninstall = CC.install(Game, t);

  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  const scholarId = Game.villagerId || null;
  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let won = 0;
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // --- release window + veteran demand ---
  let demandV = 1;
  try { demandV = Game.standingCfg().readyDemand[4].veterans | 0; } catch (e) {}
  let windowOpenDay = null, firstVetDay = null, unlockDay4 = null, endVeterans = null;
  for (const c of t.census) {
    if (windowOpenDay === null && c.st != null && c.st >= 100) windowOpenDay = c.day;
    if (firstVetDay === null && c.veterans != null && (c.veterans | 0) >= demandV) firstVetDay = c.day;
    if (unlockDay4 === null && c.uw >= 4) unlockDay4 = c.day;
    if (c.veterans != null) endVeterans = c.veterans | 0;
  }
  // Engine's own end-of-run VETERANS reading (reconciliation target).
  let engineVeteransEnd = null;
  try { const rd = Game.waveCombatReadiness(4); engineVeteransEnd = rd ? (rd.veterans | 0) : null; } catch (e) {}

  // --- kill attribution (w3+) ---
  const kills3 = [];
  const byShape = {}, byVia = {};
  let misTagCount = 0, unresolved = 0;
  const killerAgg = {}; // by-vid -> {kills, firstDay, shapes:Set, everInParty, pyrrhic}
  for (const k of t.kills) {
    if ((k.wave | 0) < 3) continue;
    const shape = CC.classifyKill(k, k.ctx);
    const companion = !!(k.by && k.ctx && k.by !== k.ctx.scholarVid);
    const scholarKill = !!(k.by && k.ctx && k.by === k.ctx.scholarVid);
    const inParty = !!(k.by && k.ctx && (k.ctx.partyVids || []).includes(k.by));
    const misTag = companion && k.via === 'player';
    if (misTag) misTagCount++;
    if (!k.by) unresolved++;
    byShape[shape] = (byShape[shape] || 0) + 1;
    byVia[k.via] = (byVia[k.via] || 0) + 1;
    const row = {
      d: k.day, mid: k.mid, w: k.wave, by: k.by, byName: nameOf(Game, k.by),
      via: k.via, pyrrhic: !!k.pyrrhic, shape,
      companion, scholarKill, inParty, misTag,
    };
    kills3.push(row);
    if (k.by) {
      const a = killerAgg[k.by] || (killerAgg[k.by] = { kills: 0, firstDay: k.day, shapes: new Set(), everInParty: false, pyrrhic: 0, scholar: k.by === scholarId });
      a.kills++;
      if (k.day < a.firstDay) a.firstDay = k.day;
      a.shapes.add(shape);
      if (inParty) a.everInParty = true;
      if (k.pyrrhic) a.pyrrhic++;
    }
  }
  kills3.sort((a, b) => a.d - b.d);

  // --- blood-list (rebuilt vetstaff tiers, pure reader) ---
  const villageCumW3 = kills3.length;
  let roster = [];
  try { roster = ((st.village || {}).roster || []).slice(); } catch (e) {}
  const bloodList = [];
  let scholarBlooded = false;
  for (const vid of roster) {
    if (!vid || vid === scholarId) continue;
    if (!isLiving(Game, vid, scholarId)) continue;
    const a = killerAgg[vid];
    const kills = a ? a.kills : 0;
    let tier;
    if (kills >= 1) tier = villageCumW3 >= 2 ? 0 : 1;
    else tier = armorP(Game, vid) >= 10 ? 2 : 3;
    if (kills >= 1) {
      bloodList.push({
        vid, name: nameOf(Game, vid), tier, kills,
        firstDay: a.firstDay, shapes: Array.from(a.shapes).sort(),
        everInParty: a.everInParty, pyrrhic: a.pyrrhic,
      });
    }
  }
  // The scholar counts in the engine's VETERANS reading (standing.js isLiving:
  // the scholar is always living) — reconcile separately, never blood-listed.
  try {
    const sa = killerAgg[scholarId];
    scholarBlooded = !!(sa && sa.kills >= 1);
  } catch (e) {}
  bloodList.sort((a, b) => a.tier - b.tier || b.kills - a.kills || a.firstDay - b.firstDay);
  const bloodedLiving = bloodList.length;
  const reconcileDelta = (engineVeteransEnd == null) ? null
    : (bloodedLiving + (scholarBlooded ? 1 : 0)) - engineVeteransEnd;
  const unknownShapes = kills3.filter(k => k.shape === 'unknown').length;
  const attributionComplete = unknownShapes === 0 && reconcileDelta === 0 && t.instrumentErrors.length === 0;

  // --- veteran survival ---
  const everVetVids = bloodList.map(b => b.vid).concat(scholarBlooded ? [scholarId] : []);
  const deaths = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      if (d && d.who && everVetVids.includes(d.who)) {
        deaths.push({ vid: d.who, name: nameOf(Game, d.who), day: d.day | 0, cause: String(d.cause || 'unknown'), player: !!d.player });
      }
    }
  } catch (e) {}
  const diedInWindow = deaths.filter(d =>
    firstVetDay != null && unlockDay4 != null && d.day >= firstVetDay && d.day <= unlockDay4).length;
  const diedPostRelease = deaths.filter(d => unlockDay4 != null && d.day > unlockDay4).length;

  // --- engagement -> kill (scholar-TB only; engine channels are kill-observed) ---
  const tbW3 = t.engagements.filter(e => (e.wave | 0) >= 3);
  const tbShapes = {};
  for (const e of tbW3) tbShapes[e.shape] = (tbShapes[e.shape] || 0) + 1;

  // --- death causes (context) ---
  const deathCauses = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const c = String((d && d.cause) || 'unknown');
      deathCauses[c] = (deathCauses[c] || 0) + 1;
    }
  } catch (e) {}

  const out = {
    seed, policyId, instrument: 'compchan',
    substrate: 'pure round-1 tribfloor (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0, NODEWITNESS=1, no vetstaff/vetblood/vetrel)',
    anchorCommit: ANCHOR,
    maxWave, wave4: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    demandVeterans: demandV, windowOpenDay, firstVetDay, unlockDay4,
    releaseInWindow: firstVetDay != null && windowOpenDay != null && firstVetDay >= windowOpenDay,
    endVeterans, engineVeteransEnd,
    w3Kills: kills3.length,
    w3CompanionKills: kills3.filter(k => k.companion).length,
    w3ScholarKills: kills3.filter(k => k.scholarKill).length,
    w3Unresolved: unresolved,
    misTagCount,
    byShape, byVia,
    kills: kills3,
    companions: bloodList,
    bloodedLiving, scholarBlooded,
    reconcileDelta, unknownShapes,
    attributionComplete,
    vetSurvival: {
      everVeterans: everVetVids.length,
      deaths: deaths.length,
      diedInWindow, diedPostRelease,
      survivedToEnd: everVetVids.length - deaths.length,
      deathRows: deaths,
    },
    engagements: {
      tbFights: t.engagements.length,
      tbFightsW3: tbW3.length,
      tbW3ByShape: tbShapes,
      note: 'scholar-TB engagements only; engine channels (agency/sortie/patrol/aid-crisis/contest) are kill-observed',
    },
    censusDays: t.census.length,
    instrumentErrors: t.instrumentErrors,
    deathCauses,
  };
  const fp = path.join(EVID, `${policyId}-s${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      try {
        const r = await oneRun(seed, policyId);
        rows.push(r);
        console.log(`done ${policyId} s${seed}: w3=${r.w3Kills} comp=${r.w3CompanionKills} sch=${r.w3ScholarKills} shapes=${JSON.stringify(r.byShape)} blooded=${r.bloodedLiving} schBlood=${r.scholarBlooded?1:0} engV=${r.engineVeteransEnd} firstVet=${r.firstVetDay} attrib=${r.attributionComplete?'OK':'FAIL'} errs=${r.instrumentErrors.length}`);
      } catch (e) {
        console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
        rows.push({ seed, policyId, instrument: 'compchan', error: String(e && e.message) });
      }
    }
  }
  const ok = rows.filter(r => !r.error);
  const attribOK = ok.filter(r => r.attributionComplete).length;
  const summary = {
    instrument: 'compchan', n: ok.length, errors: rows.length - ok.length,
    attributionComplete: `${attribOK}/${ok.length}`,
    totalW3Kills: ok.reduce((a, r) => a + r.w3Kills, 0),
    totalCompanionKills: ok.reduce((a, r) => a + r.w3CompanionKills, 0),
    totalScholarKills: ok.reduce((a, r) => a + r.w3ScholarKills, 0),
    totalMisTags: ok.reduce((a, r) => a + r.misTagCount, 0),
    everVeteran: ok.filter(r => r.firstVetDay != null).length,
    wave4: ok.filter(r => r.wave4).length,
    national: ok.filter(r => r.national).length,
    table: ok.filter(r => r.table).length,
    won: ok.filter(r => r.won).length,
  };
  fs.writeFileSync(path.join(EVID, '_summary.json'), JSON.stringify(summary, null, 1) + '\n');
  console.log('SUMMARY ' + JSON.stringify(summary));
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
