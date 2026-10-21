#!/usr/bin/env node
// windowstay-sweep-20261021.js — post-unlock-window SURVIVAL CENSUS sweep
// (flesh-out loop arm sim-windowstay-r2, run fleshout-20261021T1215Z, axis
// scale-onramp).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. Runs the unlocking seed x policy pairs from the proof's E0
// reproduction gate (evidence/2026-10-21/e0-repro-windowstay.json) on the
// VGEAR=1 winning substrate:
//   VCE.armedFor(base) = withVillagerGear(withSeatDrive(withWinDefer(TF
//   base))) — pinned in scripts/policies/vgearconfirm.js.
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
// VGEAR=1 KILLDISC=1 POSTWIN=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT
// unset. SWEEP FAILS LOUD unless the env matches exactly.
//
// INSTRUMENT: scripts/instr-windowstay-20261021.js (killdisc v2 base +
// windowreach window layer + death-capture layer). Fight ids contain
// Date.now() — used in-process only for the engagement<->kill/outcome joins
// and NEVER persisted (bool flags only), so per-seed JSONs are re-run
// byte-identical.
//
// POST-WIN CONTINUATION HOOK (documented — this is the finding as much as
// the mechanism): the stock harness (scripts/sim-harness.js runDays) loops
// `for (day = 1; day <= days && !Game.over; day++)`, and EVERY win path in
// src/js/table.js sets `this.over = true; this.won = true;`
// (table.js:858/963/1046/1075) — with this.wipe() removing only the SAVE
// KEY, never the in-memory state. So the stock harness STOPS at the win
// flag on a village that is fully alive in memory — that is the truncation
// that killed the s64703 and s64858 window measurements (wins ~d90, the
// door opens d75-97). The hook: after runDays returns with Game.won,
// record winDay + winPath (tableState().path), flip Game.over = false (the
// ONE documented engine mutation in this arm's tooling, POSTWIN-ALLOW), and
// call runDays AGAIN for (180 - winDay) loop-days. T.phase='done' +
// tableWaiting=false prevent a second win; a post-win village-lost sets
// Game.over WITHOUT Game.won and the hook never fires — the death-aware
// end is preserved.
//
// Writes per-seed JSONs ONCE, on purpose, to
// evidence/2026-10-21/perseed-windowstay-r2/{policy}/s<seed>.json and prints
// a summary.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 POSTWIN=1 \
//   EVID=... node scripts/windowstay-sweep-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC', 'POSTWIN']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate/instrument/postwin).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (process.env[k] != null) { console.error(`SWEEP STOP: ${k} must be UNSET on this substrate.`); process.exit(2); }
}
if (!VCE.vgearOn()) { console.error('SWEEP STOP: VGEAR layer off despite VGEAR=1.'); process.exit(2); }
if (!WS.instrumentOn()) { console.error('SWEEP STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }

const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-21', 'perseed-windowstay-r2');
const E0PATH = process.env.E0PATH || path.join(REPO, 'evidence', '2026-10-21', 'e0-repro-windowstay.json');
fs.mkdirSync(EVID, { recursive: true });

let E0;
try { E0 = JSON.parse(fs.readFileSync(E0PATH, 'utf8')); }
catch (e) { console.error(`SWEEP STOP: cannot read E0 reproduction gate output ${E0PATH}: ${e.message}`); process.exit(2); }
const PAIRS = (E0.unlocking || []).map(u => ({ seed: u.seed | 0, policyId: String(u.policyId) }))
  .filter(p => Number.isFinite(p.seed) && (p.policyId === 'leadfeast' || p.policyId === 'belongfeast'));
if (!PAIRS.length) { console.error('SWEEP STOP: E0 gate lists zero unlocking pairs — nothing to census.'); process.exit(2); }

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

function gday(Game) {
  try { return (((Game.state || {}).scholar || {}).day | 0) || 0; } catch (e) { return 0; }
}

async function oneRun(seed, policyId) {
  const policy = VCE.armedFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'windowstay', fullTelemetry: false });
  const t = {
    kills: [], engagements: [], fieldFights: [], spawns: [],
    tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [],
    deathRecs: [], fightStarts: [],
  };
  const uninstall = WS.install(Game, t);

  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy, {
    daily(Gm, ctx) {
      hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm));
      return policy.daily(Gm, ctx);
    },
  });
  let result = await quietLog(async () => { return await runDays(Game, wrapped, { days: 180, manifest: undefined, sampleEvery: 30 }); });

  // POST-WIN CONTINUATION HOOK (see header): stock harness stops at the
  // win flag; the village is alive in memory. Resume it for the window.
  let winDay = null, winPath = null, winResumed = false, postWinDays = 0, endReasonFirst = result.endReason;
  let wonFirst = false;
  try { wonFirst = !!Game.won; } catch (e) {}
  if (Game.over && wonFirst) {
    winDay = gday(Game);
    try { const T = (typeof Game.tableState === 'function') ? Game.tableState() : null; winPath = T ? (T.path || null) : null; } catch (e) {}
    const remaining = Math.max(0, 180 - winDay);
    if (remaining > 0) {
      Game.over = false; // POSTWIN-ALLOW: the one documented engine flip in this arm's tooling
      winResumed = true;
      result = await quietLog(async () => { return await runDays(Game, wrapped, { days: remaining, manifest: undefined, sampleEvery: 30 }); });
      postWinDays = gday(Game) - winDay;
    }
  }
  try { uninstall(); } catch (e) {}

  const st = Game.state || {};
  let scholarVid = null;
  try { scholarVid = (st.scholar && st.scholar.villagerId) || Game.villagerId || null; } catch (e) {}
  const byScholar = (by) => !!(by && (by === scholarVid || by === 'player' || by === 'p'));

  // wave-4+ engagements with the fight-id joins done IN PROCESS (raw fight
  // ids are never persisted — bool flags only). Same join code as the
  // windowreach sweep (proven on 32 runs).
  const engagements = [];
  for (const e of t.engagements) {
    if ((e.wave | 0) < 4) continue;
    let outcome = null, outcomeSource = 'unrecorded';
    let killJoin = false, killBy = null, killVia = null, killerIsScholar = false;
    if (e.fightId) {
      const o = t.tbOutcomes[e.fightId];
      if (o != null) { outcome = String(o); outcomeSource = 'tbEnd'; }
    }
    for (const k of t.kills) {
      if ((k.wave | 0) < 4) continue;
      const fidMatch = e.fightId && k.ctx && k.ctx.fightId === e.fightId;
      const dayMidMatch = !e.fightId && k.day === e.day && k.mid === e.mid;
      if (fidMatch || dayMidMatch) {
        killJoin = true; killBy = k.by; killVia = k.via; killerIsScholar = byScholar(k.by);
        break;
      }
    }
    engagements.push({
      d: e.day, mid: e.mid, wave: e.wave, shape: e.shape,
      party: e.partySize, started: !!e.started,
      fightIdPresent: !!e.fightId, outcome, outcomeSource,
      killJoin, killBy, killVia, killerIsScholar,
    });
  }
  engagements.sort((a, b) => a.d - b.d);

  const fieldFights = t.fieldFights.filter(f => (f.wave | 0) >= 4).map(f => ({
    d: f.day, vid: f.vid, mid: f.mid, wave: f.wave, outcome: f.outcome,
    rounds: f.rounds, vTaken: f.vTaken, mDealt: f.mDealt,
  }));
  fieldFights.sort((a, b) => a.d - b.d);

  // fieldFightsAll (ALL waves): villager field-fight deaths in the window
  // are overwhelmingly wave-1..3 monsters — the death analyzer joins
  // death recs (day+vid) to vDie field fights for the killer-wave join.
  const fieldFightsAll = t.fieldFights.map(f => ({
    d: f.day, vid: f.vid, mid: f.mid, wave: f.wave, outcome: f.outcome,
  }));
  fieldFightsAll.sort((a, b) => a.d - b.d);

  // Phantom check on death recs (windowsurvive pattern): a person-kind tele
  // for a still-living villager is a PHANTOM (excluded from the census,
  // counted). DiedForReal is pure reads; run post-run like the probe.
  // Player-flag repair cross-check (sim-harness.js:305-330): corpses.js
  // registerDeath can repair a death tele's player flag in place AFTER the
  // fire; the harness's own _liveDeaths reads it lazily, but my tele wrap
  // fires before the repair. Cross-check each rec against the harness's
  // death sample (day|who|cause) and persist playerRepaired.
  let liveDeaths = [];
  try { liveDeaths = (result.samples && result.samples.deaths) || []; } catch (e) {}
  const liveByKey = {};
  for (const d of liveDeaths) {
    const k = [(d.day | 0), String(d.who || ''), String(d.cause || '')].join('|');
    if (!(k in liveByKey)) liveByKey[k] = !!d.player;
  }
  const deathRecs = t.deathRecs.map(rec => {
    let real = null;
    try { real = WS.diedForReal(Game, rec.who); } catch (e) {}
    const k = [(rec.day | 0), String(rec.who || ''), String(rec.cause || '')].join('|');
    const repaired = (k in liveByKey) ? liveByKey[k] : null;
    return Object.assign({}, rec, { real, playerRepaired: repaired });
  });

  const kills = t.kills.filter(k => (k.wave | 0) >= 4).map(k => ({
    d: k.day, mid: k.mid, wave: k.wave, by: k.by, via: k.via,
    pyrrhic: !!k.pyrrhic, shape: KD.classifyKill(k, k.ctx),
    byScholar: byScholar(k.by), hasFightId: !!(k.ctx && k.ctx.fightId),
  }));
  kills.sort((a, b) => a.d - b.d);

  const spawns = t.spawns.filter(s => (s.wave | 0) >= 4).map(s => ({
    d: s.day, mid: s.mid, wave: s.wave, veteran: s.veteran, src: s.src,
  }));
  spawns.sort((a, b) => a.d - b.d);

  // Wall numbers.
  let national = 0, table = 0, won = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  try { won = !!Game.won ? 1 : 0; } catch (e) {}
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  let gameDays = 0;
  try { gameDays = (st.scholar && st.scholar.day) || 0; } catch (e) {}

  // Unlock days from the window trace (first day uw >= 4 / >= 5).
  let w4Day = null, w5Day = null;
  for (const w of t.window) {
    if (w4Day == null && (w.uw | 0) >= 4) w4Day = w.day;
    if (w5Day == null && (w.uw | 0) >= 5) w5Day = w.day;
  }

  const out = {
    seed, policyId, instrument: 'windowstay-v1-on-killdisc-v2+windowreach-layer',
    substrate: 'VCE.armedFor (withVillagerGear(withSeatDrive(withWinDefer(TF base)))) + KILLDISC=1 (v2 base + window layer + death-capture layer)',
    env: 'FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 POSTWIN=1, SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset',
    anchorCommit: ANCHOR,
    maxWave, w4Day, w5Day, national, table, won,
    days: result.days, gameDays, endReason: result.endReason,
    endReasonFirst, wonFirst,
    winDay, winPath, winResumed, postWinDays,
    deaths,
    nDeathRecs: t.deathRecs.length, nFightStarts: t.fightStarts.length,
    nWindowTraceDays: t.window.length,
    w4Engagements: engagements.length, w4FieldFights: fieldFights.length,
    w4Kills: kills.length, w4Spawns: spawns.length,
    window: t.window,
    engagements, fieldFights, fieldFightsAll, kills, spawns,
    deathRecs,
    fightStarts: t.fightStarts,
    hashes,
    instrumentErrors: t.instrumentErrors,
  };
  const dir = path.join(EVID, policyId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1) + '\n');
  return out;
}

(async () => {
  console.log(`windowstay sweep: pairs=${PAIRS.map(p => p.policyId + '/s' + p.seed).join(',')}`);
  const rows = [];
  for (const { seed, policyId } of PAIRS) {
    const t0 = Date.now();
    try {
      const r = await oneRun(seed, policyId);
      rows.push(r);
      console.log(`done ${policyId} s${seed}: end=${r.endReason} days=${r.gameDays} maxWave=${r.maxWave} w5Day=${r.w5Day} ` +
        `winResumed=${r.winResumed} winDay=${r.winDay} winPath=${r.winPath} postWinDays=${r.postWinDays} ` +
        `deaths=${r.nDeathRecs} w4eng=${r.w4Engagements} w4ff=${r.w4FieldFights} w4kills=${r.w4Kills} errs=${r.instrumentErrors.length} ` +
        `(${((Date.now() - t0) / 1000).toFixed(1)}s)`);
    } catch (e) {
      console.error(`ERROR ${policyId} s${seed}: ${e && e.message}`);
      rows.push({ seed, policyId, error: String(e && e.message) });
    }
  }
  const ok = rows.filter(r => !r.error);
  console.log(JSON.stringify({
    instrument: 'windowstay-v1', n: ok.length, errors: rows.length - ok.length,
    runsUnlocked5: ok.filter(r => r.w5Day != null).length,
    runsWinResumed: ok.filter(r => r.winResumed).length,
    totalInstrumentErrors: ok.reduce((a, r) => a + (r.instrumentErrors || []).length, 0),
  }, null, 1));
  fs.writeFileSync(path.join(EVID, 'corpus-summary.json'),
    JSON.stringify({ n: ok.length, errors: rows.length - ok.length, pairs: PAIRS, instrument: 'windowstay-v1' }, null, 1) + '\n');
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
