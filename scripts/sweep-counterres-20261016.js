#!/usr/bin/env node
// sweep-counterres-20261016.js — the sim-counterres resolution measurement.
// POLICY-SIDE ONLY (zero src/js changes): resolution-based confirm of the
// landed wave-3+ counter-wiring (sim-counterwire, 0815Z) under the revised
// metric (evidence/2026-10-16/sim-counterwire.md "Metric review").
//
// A RESOLUTION = a fight vs a known-trick species ending in
//   (a) a trick-attributed kill (waveKillLog entry with trick detail), OR
//   (b) mFlee/vFlee with >=2 trick actions in the fight's trickLog
//       (the trick drove the outcome).
// PRIMARY (binding): w3+ resolutions armed >= 20 across the pilot sweep.
// The kill channel reads waveKillLog (field + TB + contest + patrol + wild
// + agency kills all record trick detail via trickSummary/trickSummaryFor).
// The flee channel needs per-fight records: a READ-ONLY fieldFight wrapper
// (no RNG, no logic — the det-gate in test-counterres proves byte-identical
// trajectories) captures {mid, wave, outcome, trickLog, trickKnown}.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
//   SEEDS=702,703,... POLICIES=leadfeast DAYS=180 ARM=armed SEATDRIVE=1
//   node scripts/sweep-counterres-20261016.js
// ARM=armed   -> SEATDRIVE=1 (driver genuinely active, explicitly composed
//              via withSeatDrive — METHOD NOTE: SEATDRIVE env unset != driver
//              active; a sweep that doesn't compose the wrapper runs pre-seat).
// ARM=control -> SEATDRIVE=0 (pure delegation, driver off).
// Both arms share master code, identical seeds, identical env; only the
// seat-drive switch differs.
//
// Per-seed JSONs: evidence/2026-10-16/perseed-counterres/<policy>-s<seed>-<arm>.json
// Schema: exact numeric keys national/table/won/exiled (+ wins alias for telemetry-check).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const TF = require(path.join(ROOT, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(ROOT, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(ROOT, 'scripts', 'policies', 'seatdrive'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
const ARM = process.env.ARM || 'armed';
if (ARM === 'armed' && process.env.SEATDRIVE !== '1') {
  console.error('SWEEP STOP: ARM=armed requires SEATDRIVE=1 explicitly (the driver must be genuinely active, not merely unset).');
  process.exit(2);
}
if (ARM === 'control' && process.env.SEATDRIVE !== '0') {
  console.error('SWEEP STOP: ARM=control requires SEATDRIVE=0 (pure delegation).');
  process.exit(2);
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [702]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const EVID = process.env.COUNTERRES_EVID || path.join(ROOT, 'evidence', '2026-10-16', 'perseed-counterres');
const BEATS = process.env.COUNTERRES_BEATS || path.join(ROOT, 'evidence', '2026-10-16', 'counterres-beats');
const BEAT_CAP = 3000;
const BEAT_LEN = 300;
const TRICK_BEAT = /COUNTER LEARNED|trick|Trick|confess|bore|loophole|goodbye|look away|Scabbing|Navigation is victory|contradicts|Tanking|argues theology|boring|PRONE|SMALLER|starve|dismiss/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const scholarVid = (Game) => { try { return (Game.state.scholar || {}).villagerId || 'player'; } catch (e) { return 'player'; } };

// ---------------------------------------------------------------------------
// Resolution counting (shared with the proof test — exported).
// ---------------------------------------------------------------------------
function waveOf(monsterById, mid, fallback) {
  return monsterById[mid] || fallback || 1;
}

// Kill channel: waveKillLog entries carrying trick detail.
// Flee channel: per-fight records (from the read-only fieldFight wrapper).
// A resolution is a fight vs a known-trick species ending in (trick-
// attributed kill) OR (mFlee/vFlee with >=2 trick actions in trickLog).
function countResolutions(waveKillLog, fights, monsterById, scholarId) {
  const items = [];
  for (const k of (waveKillLog || [])) {
    if (!k.trick) continue;
    const w = waveOf(monsterById, k.mid, k.w);
    items.push({
      channel: 'kill', mid: k.mid, wave: w, via: k.via || null,
      trick: String(k.trick).slice(0, 120),
      byScholar: k.by === scholarId || k.by === 'player',
      day: k.d == null ? null : k.d,
    });
  }
  for (const f of (fights || [])) {
    if (f.outcome !== 'mFlee' && f.outcome !== 'vFlee') continue;
    if ((f.nTrick || 0) < 2) continue;
    if (!f.knownStart && !f.knownEnd) continue;
    const w = waveOf(monsterById, f.mid, f.wave);
    items.push({
      channel: 'flee', mid: f.mid, wave: w, outcome: f.outcome,
      nTrick: f.nTrick, tricks: (f.trickActions || []).slice(0, 12),
      vid: f.vid || null, day: f.day == null ? null : f.day,
      rounds: f.rounds == null ? null : f.rounds,
    });
  }
  const w3 = items.filter(i => i.wave >= 3);
  return {
    total: items.length, w3: w3.length,
    w3kill: w3.filter(i => i.channel === 'kill').length,
    w3flee: w3.filter(i => i.channel === 'flee').length,
    allkill: items.filter(i => i.channel === 'kill').length,
    allflee: items.filter(i => i.channel === 'flee').length,
    items,
  };
}

// ---------------------------------------------------------------------------
// Policy composition — EXPLICIT via withSeatDrive (METHOD NOTE: SEATDRIVE
// env unset != driver active; composing the wrapper is what activates it).
// ---------------------------------------------------------------------------
function policyFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const deferred = WD.withWinDefer(base, policyId + '-windefer',
    policyId + ' + win-side layers (WINPURSUIT=1 + WINDEFER=1) over the tribfloor base');
  return SD.withSeatDrive(deferred, policyId + '-windefer',
    policyId + '-windefer + seatdrive (counterres: explicitly composed)');
}

// ---------------------------------------------------------------------------
// Read-only fieldFight wrapper: captures per-fight records for the flee
// channel. No RNG, no logic changes — pure observation.
// ---------------------------------------------------------------------------
function attachFightCapture(Game) {
  const fights = [];
  const _ff = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, m, opts) {
    let knownStart = false;
    try { knownStart = !!(Game.villageKnowsTrick && mdef && Game.villageKnowsTrick(mdef.id)); } catch (e) {}
    const rec = _ff(vid, mdef, m, opts);
    try {
      const tl = (rec && rec.trickLog) || [];
      let knownEnd = false;
      try { knownEnd = !!(Game.villageKnowsTrick && mdef && Game.villageKnowsTrick(mdef.id)); } catch (e) {}
      fights.push({
        mid: mdef && mdef.id, wave: (mdef && mdef.wave) || 1,
        outcome: rec && rec.outcome,
        nTrick: tl.length, trickActions: tl.slice(0, 12),
        knownStart, knownEnd,
        vid: vid, day: gday(Game), rounds: rec && rec.rounds,
      });
    } catch (e) {}
    return rec;
  };
  return { fights, restore() { Game.fieldFight = _ff; } };
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'counterres', fullTelemetry: false });
  await setupGame(Game);

  const discovered = [];
  const deaths = [];
  const sayBeats = [];
  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'counter_discovered') discovered.push({ day: gday(Game), id: data && data.id, via: data && data.via });
      else if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
    } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (TRICK_BEAT.test(s) && sayBeats.length < BEAT_CAP) sayBeats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
    } catch (e) {}
    return _s(t);
  };
  const cap = attachFightCapture(Game);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  Game.tele = _t; Game.say = _s; cap.restore();

  const st = Game.state || {};
  const sid = scholarVid(Game);
  const monsterById = {};
  try { for (const m of (Game.data.monsters || [])) monsterById[m.id] = m.wave || 1; } catch (e) {}

  const res = countResolutions(st.waveKillLog, cap.fights, monsterById, sid);

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}

  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;
  const fTricks = Object.keys(st.villagerTricks || {});
  const w3TricksKnown = fTricks.filter(id => (monsterById[id] || 1) >= 3);
  const discoveriesByWave = discovered.reduce((o, e) => { const w = 'w' + (monsterById[e.id] || '?'); o[w] = (o[w] || 0) + 1; return o; }, {});
  const fieldDeaths = deaths.filter(d => !d.player).length;
  let trickTally = {};
  try { trickTally = Game._trickTally || {}; } catch (e) {}
  let seat = {};
  try { seat = { attempts: (Game._seatCtx && Game._seatCtx.sdSeatAttempts) || 0 }; } catch (e) {}

  const out = {
    seed, policyId, arm: ARM,
    substrate: 'win-side (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1) + seatdrive ' +
      (ARM === 'armed' ? 'EXPLICITLY composed, SEATDRIVE=1' : 'composed, SEATDRIVE=0 (pure delegation)'),
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave, wave3Reached: maxWave >= 3 ? 1 : 0,
    deaths: deaths.length, fieldDeaths, playerDeaths: deaths.length - fieldDeaths,
    deathCauses: deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    // resolution metric (PRIMARY)
    resW3: res.w3, resW3kill: res.w3kill, resW3flee: res.w3flee,
    resAll: res.total, resAllKill: res.allkill, resAllFlee: res.allflee,
    resolutions: res.items,
    nFights: cap.fights.length,
    trickTally,
    nDiscovered: discovered.length, discoveriesByWave,
    w3TricksKnown, nW3TricksKnown: w3TricksKnown.length,
    finalVillagerTricks: fTricks,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(out, null, 1));
  const beats = sayBeats.slice(0, 800);
  if (beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(beats, null, 1));
  }
  console.log(`  [${ARM} ${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} won=${won} resW3=${res.w3} (k${res.w3kill}/f${res.w3flee}) fieldDeaths=${fieldDeaths}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      await oneRun(seed, policyId);
    }
  }
  console.log(`\nSWEEP DONE (${ARM}) — per-seed JSONs in evidence/2026-10-16/perseed-counterres/.`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun, countResolutions, policyFor, attachFightCapture };
