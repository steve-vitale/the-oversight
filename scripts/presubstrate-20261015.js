#!/usr/bin/env node
'use strict';
// presubstrate-20261015.js — READ-ONLY full-chain reachability census on the
// PRE-SEAT substrate (flesh-out loop ARM 3, 2026-10-15, scale-onramp axis,
// sim-presubstrate). DIAGNOSTIC: no lever, no GO threshold — the deliverable
// is a verdict per content piece (REACHABLE vs DECORATION, with numbers).
//
// Mission question: the full win-side stack wins 40/48 across three seed
// sets, but everything is measured THROUGH the win — on the PRE-SEAT stack
// (FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 +
// WINPURSUIT=1 + WINDEFER=1, SEATDRIVE unset — proven inert by
// sim-wincensus: 0/16 wins, 15/16 table invites, 0 sittings) the full-chain
// reachability was never censused end to end. Is the win-side content
// reachable on its own terms, or is it decoration that only the seat driver
// walks?
//
// Composition: the tribfloor->windefer base ids (TF.leadfeast /
// TF.belongfeast, plain — no winpursuit/windefer/seatdrive wrappers; the
// WINPURSUIT/WINDEFER env flags are inert on the base policies, set here so
// the env matches the declared composition) with ALL optional gates off
// (WAVE5REACH unset, W3DRIVE unset, SEATDRIVE unset — asserted at load).
//
// Seeds: 8 FRESH [151,262,373,484,595,706,817,928] (all verified unused in
// evidence/ 2026-10-15) x {leadfeast, belongfeast}, 180d death-aware (dead
// villages stop, +10d tail max — harness dead-village tail).
//
// The instrument (withPresub): wraps the base policy with a read-only layer:
//   - pre-dawn census sample: arc, scale rank, polity, unlockedWave,
//     table invite/sitting rising edges, vest scan, exile flag
//   - Game.say passthrough capturing set-piece beats for the SENSE-TESTING
//     village assessment (bounded; returns oSay's result — behavior
//     byte-identical, proven by the DET-GATE)
//   - zero behavioral change: DET-GATE proves instrument-on vs
//     instrument-off byte-identical on fixed seeds (the pathcensus
//     instrument set this precedent: 4/4 trajectory-identical)
//
// Finding #360: no engine telemetry event fires on wave unlock (wave5Day
// null on 32/32 runs). unlockedWave() is sampled DAILY inside the sweep to
// date unlocks — never read after the run.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 SMOKE=1 node scripts/presubstrate-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/presubstrate-20261015.js
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 DET=1 node scripts/presubstrate-20261015.js   # det-gate only
// Targeted re-runs: SEEDS="151,262" ONLY="leadfeast;belongfeast"
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
for (const k of ['WAVE5REACH', 'W3DRIVE', 'SEATDRIVE']) {
  if (process.env[k] === '1') { console.error(`SWEEP STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [151, 262, 373, 484, 595, 706, 817, 928]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-15', 'perseed-presubstrate');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-15', 'presubstrate-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const VEST_IDS = { military_vest: 1, swat_vest: 1 };
const BEAT_CAP = 2000;

// Base policies: the tribfloor base ids, plain (no winpursuit/windefer/
// seatdrive wrappers — optional gates off by composition).
function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Set-piece beat filter: table/arc/wave/national/death moments. Everything
// else is action narration; the bound keeps the instrument light.
const SETPIECE = /THE TABLE|THE AUDIT|table is being set|EVERYONE\. ?SIT\. ?WATCH|the ring of pale light|Ninety dawns|Seven doors|YOUR CASE IS NOT COMPLETE|the Table|ARC II|ARC III|ARC IV|entered Arc|First Court|the realm|their realm|Iron Court|Haven is national|nationalLive|unlockedWave|wave unlock|WAVE|died|funeral|Funeral|exile|Exile|THE SCATTERING|stasis/i;

// ---------------------------------------------------------------------
// The instrument: read-only census wrap of a tribfloor base policy.
function newCensus() {
  return {
    arc2Day: null, arc3Day: null, arc4Day: null,
    regionalDay: null, nationalDay: null,
    realmDay: null, realmShape: null, realmLed: null,
    wave3Day: null, wave4Day: null, wave5Day: null, maxWave: 1,
    invites: 0, sittings: 0, inviteDay: null,
    vestHolders: new Set(),
    exiled: false,
    _wasWaiting: false, _wasDone: false,
    beats: [], beatsDropped: 0,
  };
}

function installSayCapture(Game, ctx) {
  if (ctx._psSayInstalled) return;
  ctx._psSayInstalled = true;
  const oSay = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const C = ctx._presub;
      if (C) {
        const s = String(t || '');
        if (SETPIECE.test(s)) {
          if (C.beats.length < BEAT_CAP) C.beats.push({ day: gday(Game), text: s.slice(0, 280) });
          else C.beatsDropped++;
        }
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
}

function scanVests(Game, C) {
  try {
    const sch = Game.state.scholar || {};
    const hit = (id, holder) => { if (id && VEST_IDS[id]) C.vestHolders.add(holder + ':' + id); };
    for (const s of Object.values(sch.equipped || {})) if (s) hit(s.itemId || s.id, 'scholar');
    for (const it of (sch.inventory || [])) hit(it && (it.itemId || it.id), 'scholar');
    const roster = (Game.state.village || {}).roster || [];
    for (const vid of roster) {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
      if (!p) continue;
      const who = 'v:' + String(vid).slice(0, 12);
      for (const s of Object.values(p.equipped || {})) if (s) hit(s.itemId || s.id, who);
      for (const st of (p.stashed || [])) hit((st && (st.itemId || st.id)) || st, who);
    }
  } catch (e) {}
}

// Read-only pre-dawn census sample. Pure reads of Game state; the only
// writes are to ctx._presub (per-run, never game state).
function sampleDay(Game, ctx) {
  const C = ctx._presub;
  const day = gday(Game);
  let pg = null;
  try { pg = Game.progState ? Game.progState() : null; } catch (e) {}
  // Arcs (progState().arc, 1-4).
  const arc = (pg && pg.arc) || 1;
  if (arc >= 2 && C.arc2Day == null) C.arc2Day = day;
  if (arc >= 3 && C.arc3Day == null) C.arc3Day = day;
  if (arc >= 4 && C.arc4Day == null) C.arc4Day = day;
  // Scale rank.
  let rank = 'village';
  try { rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  const ro = RANK_ORDER[rank] || 0;
  if (ro >= 1 && C.regionalDay == null) C.regionalDay = day;
  if (ro >= 2 && C.nationalDay == null) C.nationalDay = day;
  // Four-realm formation: Haven's polity at >=4 fires (hierarchy.js:
  // "four fires under one head is a realm"). _havenPolity is read-only
  // w.r.t. game semantics; guarded by the det-gate.
  try {
    const p = Game._havenPolity ? Game._havenPolity() : null;
    if (p && (p.size | 0) >= 4 && C.realmDay == null) {
      C.realmDay = day; C.realmShape = p.shape || '?'; C.realmLed = !!p.led;
    }
  } catch (e) {}
  // Waves — finding #360: sample unlockedWave() DAILY; no engine event
  // fires on unlock.
  let w = 1;
  try { w = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  if (w > C.maxWave) C.maxWave = w;
  if (w >= 3 && C.wave3Day == null) C.wave3Day = day;
  if (w >= 4 && C.wave4Day == null) C.wave4Day = day;
  if (w >= 5 && C.wave5Day == null) C.wave5Day = day;
  // Table: invite = tableWaiting rising edge; sitting = tableDone rising
  // edge (wintrace convention).
  if (pg) {
    if (pg.tableWaiting && !C._wasWaiting) { C.invites++; if (C.inviteDay == null) C.inviteDay = day; }
    if (pg.tableDone && !C._wasDone) C.sittings++;
    C._wasWaiting = !!pg.tableWaiting;
    C._wasDone = !!pg.tableDone;
  }
  // Vests + exile.
  scanVests(Game, C);
  try { if ((Game.state.scholar || {}).exiled) C.exiled = true; } catch (e) {}
}

function withPresub(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._presub = newCensus();
      installSayCapture(Game, ctx);
      const oSetup = base.setup;
      if (oSetup) return oSetup(Game, ctx);
    },
    daily(Game, ctx) {
      sampleDay(Game, ctx);
      const oDaily = base.daily;
      return oDaily ? oDaily(Game, ctx) : undefined;
    },
  });
}

function seatDetail(Game) {
  try {
    const s = Game.tableSeat ? Game.tableSeat() : null;
    const d = (s && s.detail) || {};
    return { seat: (s && s.seat) || 'none', w1: d.w1 | 0, w2: d.w2 | 0, w3: d.w3 | 0, contestsN: d.contestsN | 0, crisesN: d.crisesN | 0, rank: d.rank || 'village', stage: d.stage | 0, foodDeeds: !!d.foodDeeds };
  } catch (e) { return { seat: 'err' }; }
}

function deedGate(Game) {
  try {
    const g = Game.deedGateReady ? Game.deedGateReady() : null;
    if (!g) return null;
    return { ok: !!g.ok, w1: g.w1 | 0, w2: g.w2 | 0, w3: g.w3 | 0, w4: g.w4 | 0, w5: g.w5 | 0, contestsN: g.contestsN | 0, crisesN: g.crisesN | 0, rank: g.rank || 'village', stageOk: !!g.stageOk, foodDeeds: !!g.foodDeeds };
  } catch (e) { return null; }
}

// ---------------------------------------------------------------------
// SMOKE gate: both base policies drive with the instrument live.
async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  for (const policyId of POLICIES) {
    process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
    const base = policyFor(policyId);
    check(`[${policyId}] base id = ${policyId}`, base.id === policyId, 'got ' + base.id);
    const policy = withPresub(base, base.id + '-census', base.desc + ' [PRESUBSTRATE]');
    let censusLive = null, dailyRan = false;
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); censusLive = !!(ctx && ctx._presub); };
    const oDaily = policy.daily;
    policy.daily = (G, ctx) => { dailyRan = dailyRan || !!(ctx && ctx._presub); return oDaily(G, ctx); };
    const { Game } = await loadGame({ seed: 151, mode: 'presubstrate-smoke', fullTelemetry: false });
    await setupGame(Game);
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`[${policyId}] census live`, censusLive === true, 'census=' + censusLive);
    check(`[${policyId}] census daily ran`, dailyRan === true, '');
    check(`[${policyId}] 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`[${policyId}] wave sampled`, typeof Game.unlockedWave === 'function', '');
  }
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE: both policies drive, census live, runs complete.');
}

// ---------------------------------------------------------------------
// DET-GATE: instrument-on vs instrument-off trajectory-identical, 4 seeds.
// Both-repeat design: [plain, plain] and [census, census] distinguish a
// real instrument leak from the known timestamp-entropy issue
// (det-gate.js header).
async function runHashes(policy, seed, days) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const { Game } = await loadGame({ seed, mode: 'presubstrate-det', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return hashes.join('\n');
}

async function detGate() {
  const seeds = [151, 262, 373, 484];
  const days = 60;
  let green = 0, total = 0;
  for (const seed of seeds) {
    const plain = policyFor('leadfeast');
    const census = withPresub(policyFor('leadfeast'), 'leadfeast-census', 'leadfeast [PRESUBSTRATE DET]');
    const hP1 = await runHashes(plain, seed, days);
    const hP2 = await runHashes(plain, seed, days);
    const hC1 = await runHashes(census, seed, days);
    const hC2 = await runHashes(census, seed, days);
    const plainStable = hP1 === hP2;
    const censusStable = hC1 === hC2;
    const identical = plainStable && censusStable && hP1 === hC1;
    total++;
    if (identical) green++;
    console.log(`  seed ${seed}: plain-stable=${plainStable} census-stable=${censusStable} ` +
      `instrument-identical=${hP1 === hC1} ${identical ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`DET-GATE: ${green}/${total} identical (plain-repeat + census-repeat + plain==census).`);
  if (green < total) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// ---------------------------------------------------------------------
// The sweep.
async function oneRun(seed, policyId) {
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = policyFor(policyId);
  const policy = withPresub(base, base.id + '-census', base.desc + ' [PRESUBSTRATE]');
  const { Game } = await loadGame({ seed, mode: 'presubstrate', fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  const hashes = [];
  const oDaily = policy.daily;
  policy.daily = (G, ctx) => {
    const r = oDaily(G, ctx);
    try { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  const C = (runCtx && runCtx._presub) || newCensus();
  const deaths = {};
  const deathDays = [];
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      deathDays.push({ day: d.day || 0, cause: k, who: String(d.who || '').slice(0, 24), player: !!d.player });
    }
  } catch (e) {}
  const out = {
    seed, policyId, mode: 'presubstrate',
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    won: !!Game.won,
    deaths, deathDays: deathDays.slice(0, 120),
    arc2Day: C.arc2Day, arc3Day: C.arc3Day, arc4Day: C.arc4Day,
    regionalDay: C.regionalDay, nationalDay: C.nationalDay,
    realmDay: C.realmDay, realmShape: C.realmShape, realmLed: C.realmLed,
    wave3Day: C.wave3Day, wave4Day: C.wave4Day, wave5Day: C.wave5Day, maxWave: C.maxWave,
    invites: C.invites, sittings: C.sittings, inviteDay: C.inviteDay,
    vestCount: C.vestHolders.size, vestHolders: Array.from(C.vestHolders).slice(0, 40),
    exiled: C.exiled ? 1 : 0,
    seatDetail: seatDetail(Game), deedGate: deedGate(Game),
    beatsDropped: C.beatsDropped,
    hashes,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled — all 0/1. gameDays is the survival day.
  out.national = C.nationalDay != null ? 1 : 0;
  out.table = C.invites > 0 ? 1 : 0;
  out.wins = out.won ? 1 : 0;
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (C.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}.json`), JSON.stringify(C.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} arc=${C.arc2Day != null ? 'II@' + C.arc2Day : '-'}${C.arc3Day != null ? '/III@' + C.arc3Day : ''}${C.arc4Day != null ? '/IV@' + C.arc4Day : ''} reg=${C.regionalDay || '-'} nat=${C.nationalDay || '-'} realm=${C.realmDay || '-'} w3=${C.wave3Day || '-'} w4=${C.wave4Day || '-'} w5=${C.wave5Day || '-'} inv=${C.invites} sit=${C.sittings} vest=${C.vestHolders.size} ex=${C.exiled ? 1 : 0} win=${out.wins}`);
}

(async () => {
  if (require.main !== module) return; // require() by the proof test must not launch the sweep
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) {
      const p = part.trim();
      if (p) only[p] = true;
    }
  }
  if (process.env.SMOKE === '1') await smokeGate();
  else if (process.env.DET === '1') await detGate();
  else {
    for (const policyId of POLICIES) {
      if (only && !only[policyId]) continue;
      for (const seed of SEEDS) {
        await oneRun(seed, policyId);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log('\nSWEEP DONE — per-seed JSONs in evidence/2026-10-15/perseed-presubstrate/.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withPresub, newCensus, sampleDay, policyFor, VEST_IDS };
