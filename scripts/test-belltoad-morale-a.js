#!/usr/bin/env node
// scripts/test-belltoad-morale-a.js — sim-belltoad-morale-a proof + measurement.
//
// ARM (candidate 2 from sim-belltoad-a, morale ONLY — candidate 3's
// post-cap fallback is a later run's arm and is NOT touched here):
// trick-aware morale must not hold a NON-PROGRESSING trick. Definition
// (pre-registered in evidence/2026-10-25/sim-belltoad-morale-a.md BEFORE
// any armed sweep): at a round-end morale check, the hold is lifted
// when ALL of: (a) trickLog has >= 2 entries (trick repeated across
// rounds); (b) rec.mDealt === 0 (zero damage dealt all fight);
// (c) lead HP unchanged from fight entry (members[0].hp ===
// rec.leadHpEntry, recorded at members build); (d) no termination
// counter is still advancing toward its threshold — redactorQuiet < 3,
// focusBore < 3, tosRead < 2, eulogyContradicts < 3 each mean the trick
// IS progressing and the hold is kept. Shout/whiff/dance-style pure
// mitigation tricks have no counter, so they CAN be lifted. Fallback
// when lifted: the normal hopeless branch (help call if allies near,
// else vFlee) plus a narrating log line — never silent.
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) +
// deathcensus-diag fight recorder (runOne from
// scripts/test-deathcensus-diag-sweep.js, recorder pid 'armed'), seeds
// 73671-73678, 180d death-aware horizon. Control = current master
// (candidate 1 already in); armed = control + candidate 2.
//
// Modes (read argv handling before use — unknown flags are NOT safe):
//   --sweep <control|armed>: run 8 seeds, write per-seed rows to EVID
//     (default evidence/2026-10-25/perseed-sim-belltoad-morale-a)
//     as s<seed>-<mode>.json via the flap-safe writer.
//   --analyze: load both corpora, judge against the pre-registered bar
//     in evidence/2026-10-25/sim-belltoad-morale-a.md. Exit 1 on fail.
//   --diag: 8-seed replay capturing every fight whose log contains
//     'holds the line' plus the 3 known other-class death fights;
//     census-matches each seed against the control corpus. Read-only
//     (no corpus writes). Exit 1 on census mismatch.
//   --replay: deterministic replay of seed 73677 under current code;
//     census-matches the armed corpus and prints every belltoad fight
//     log for the sense check. Exit 1 on mismatch.
//   Default: --analyze.
//
// No src/js is touched by this script. Corpus writes go only to EVID.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-belltoad-morale-a');
const { runOne, writeRowViaWriter } = require('./test-deathcensus-diag-sweep');

function loadRow(mode, seed) {
  return JSON.parse(fs.readFileSync(path.join(EVID, `s${seed}-${mode}.json`), 'utf8'));
}
function allFightRows(row) {
  const dc = row.deathcensus || {};
  const out = [];
  for (const f of (dc.resolveFights || [])) out.push(Object.assign({ src: 'resolve' }, f));
  for (const f of (dc.directFights || [])) out.push(Object.assign({ src: 'direct' }, f));
  return out;
}
function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function villagerDeaths(row) {
  const ds = (row.deathcensus && row.deathcensus.deaths) || [];
  return ds.filter(d => !d.player).length;
}
function starvationSicknessRate(row) {
  // Cost leg: deaths attributed to starvation/sickness in the census
  // death list, per 100 village-days (days field). Counted the same way
  // in both configs; the 1332Z legs used this family of cost rate.
  const ds = (row.deathcensus && row.deathcensus.deaths) || [];
  const n = ds.filter(d => !d.player && /starv|sick|disease|hunger/i.test(
    [(d.cause || ''), (d.kind || ''), (d.who || '')].join(' '))).length;
  return { n, days: row.days || 0, rate: row.days ? (n / row.days) * 100 : 0 };
}

async function sweepMode(mode) {
  fs.mkdirSync(EVID, { recursive: true });
  for (const seed of SEEDS) {
    const row = await runOne('armed', seed, 180, null);
    const body = JSON.stringify(row, null, 1) + '\n';
    const fn = path.join(EVID, `s${seed}-${mode}.json`);
    const sha = writeRowViaWriter(fn, body);
    console.log(`SWEEP ${mode} seed=${seed} days=${row.days} gameDays=${row.gameDays} end=${row.endReason} won=${row.won} natEver=${row.nationalEver} table=${row.table} wave=${row.waveReach} arc=${row.maxArc} vDeaths=${villagerDeaths(row)} sha=${sha}`);
  }
  console.log(`SWEEP-DONE mode=${mode} seeds=${SEEDS.length} dir=${EVID}`);
}

function analyzeMode() {
  let fail = 0;
  const check = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; };
  const ctrl = {}, armed = {};
  for (const seed of SEEDS) { ctrl[seed] = loadRow('control', seed); armed[seed] = loadRow('armed', seed); }
  const fights = (rows) => SEEDS.flatMap(s => allFightRows(rows[s]).map(f => Object.assign({ seed: s }, f)));
  const cf = fights(ctrl), af = fights(armed);
  const dieKey = (f) => [f.seed, f.day, f.vid, f.mid].join('|');

  // PRIMARY: other 0-dealt multi-round deaths fall vs control.
  const otherCtrl = cf.filter(f => f.mid !== 'belltoad' && f.rounds >= 2 && f.mDealt === 0);
  const otherArmed = af.filter(f => f.mid !== 'belltoad' && f.rounds >= 2 && f.mDealt === 0);
  const otherCtrlDie = otherCtrl.filter(f => f.outcome === 'vDie');
  const otherArmedDie = otherArmed.filter(f => f.outcome === 'vDie');
  console.log(`OTHER 0-dealt multi-round rows: control ${otherCtrl.length} (deaths ${otherCtrlDie.length}), armed ${otherArmed.length} (deaths ${otherArmedDie.length})`);
  for (const f of otherCtrlDie) console.log(`  CTRL-DIE  s${f.seed} d${f.day} ${f.mid} ${f.vid} r=${f.rounds} ctx=${f.context}`);
  for (const f of otherArmedDie) console.log(`  ARMED-DIE s${f.seed} d${f.day} ${f.mid} ${f.vid} r=${f.rounds} ctx=${f.context}`);
  check(otherArmedDie.length < otherCtrlDie.length,
    `PRIMARY: armed other-class deaths ${otherArmedDie.length} < control ${otherCtrlDie.length}`);

  // Guard (pre-registered G-bell, corrected form): belltoad engage-intent
  // deaths armed <= control (no new belltoad death). The brief's "staying
  // 0" premise does NOT hold on current master (control is 1), so the
  // gateable form is no-new-death, as stated in the evidence header
  // BEFORE arming. The control count is reported, not gated.
  const bellCtrlDie = cf.filter(f => f.mid === 'belltoad' && f.intent === 'engage' && f.outcome === 'vDie');
  const bellArmedDie = af.filter(f => f.mid === 'belltoad' && f.intent === 'engage' && f.outcome === 'vDie');
  console.log(`BELLTOAD engage-intent deaths: control ${bellCtrlDie.length}, armed ${bellArmedDie.length}`);
  check(bellArmedDie.length <= bellCtrlDie.length, `GUARD belltoad engage-intent deaths armed ${bellArmedDie.length} <= control ${bellCtrlDie.length} (no new belltoad death)`);
  console.log(`CONTROL belltoad count (informational, not gated): ${bellCtrlDie.length} — pre-reg note: current-master control is 1, not 0`);

  // Guard (corrected 1332Z wording): death set in the other class
  // identical-or-subset of control — no NEW death class appears.
  const ctrlDieKeys = otherCtrlDie.map(dieKey).sort();
  const armedDieKeys = otherArmedDie.map(dieKey).sort();
  const newDeaths = armedDieKeys.filter(k => !ctrlDieKeys.includes(k));
  console.log(`OTHER-CLASS death sets: control [${ctrlDieKeys.join('; ')}] armed [${armedDieKeys.join('; ')}] new [${newDeaths.join('; ')}]`);
  check(newDeaths.length === 0, 'GUARD no new death in the other class (armed set ⊆ control set)');

  // 1332Z cost/guard legs.
  const vdCtrl = SEEDS.map(s => villagerDeaths(ctrl[s]));
  const vdArmed = SEEDS.map(s => villagerDeaths(armed[s]));
  const sumCtrl = vdCtrl.reduce((a, b) => a + b, 0), sumArmed = vdArmed.reduce((a, b) => a + b, 0);
  console.log(`VILLAGER DEATHS per seed: control [${vdCtrl.join(',')}] sum=${sumCtrl}; armed [${vdArmed.join(',')}] sum=${sumArmed}`);
  check(sumArmed <= sumCtrl + 2, `GUARD total villager deaths armed ${sumArmed} <= control ${sumCtrl} + 2`);
  const natCtrl = SEEDS.reduce((t, s) => t + (ctrl[s].nationalEver || 0), 0);
  const natArmed = SEEDS.reduce((t, s) => t + (armed[s].nationalEver || 0), 0);
  console.log(`NATIONAL-EVER: control ${natCtrl}/8, armed ${natArmed}/8`);
  check(natArmed >= natCtrl - 2, `GUARD national-ever armed ${natArmed} >= control ${natCtrl} - 2`);
  const medCtrl = medianOf(SEEDS.filter(s => !ctrl[s].won).map(s => ctrl[s].days));
  const medArmed = medianOf(SEEDS.filter(s => !armed[s].won).map(s => armed[s].days));
  console.log(`WINS-EXCLUDED MEDIAN days: control ${medCtrl}, armed ${medArmed}`);
  check(medArmed >= 0.8 * medCtrl, `GUARD wins-excluded median armed ${medArmed} >= 0.8x control ${medCtrl}`);
  const w4Ctrl = SEEDS.filter(s => (ctrl[s].waveReach || 1) >= 4).length;
  const w4Armed = SEEDS.filter(s => (armed[s].waveReach || 1) >= 4).length;
  console.log(`WAVE-4 reach: control ${w4Ctrl}/8, armed ${w4Armed}/8`);
  check(w4Armed >= w4Ctrl - 1, `GUARD wave-4 armed ${w4Armed} >= control ${w4Ctrl} - 1`);
  const costCtrl = SEEDS.map(s => starvationSicknessRate(ctrl[s]));
  const costArmed = SEEDS.map(s => starvationSicknessRate(armed[s]));
  const rateCtrl = costCtrl.reduce((t, c) => t + c.n, 0) / Math.max(1, costCtrl.reduce((t, c) => t + c.days, 0)) * 100;
  const rateArmed = costArmed.reduce((t, c) => t + c.n, 0) / Math.max(1, costArmed.reduce((t, c) => t + c.days, 0)) * 100;
  console.log(`STARVATION/SICKNESS cost rate per 100vd: control ${rateCtrl.toFixed(3)} (${costCtrl.reduce((t, c) => t + c.n, 0)} events), armed ${rateArmed.toFixed(3)} (${costArmed.reduce((t, c) => t + c.n, 0)} events)`);
  check(rateArmed <= rateCtrl + 0.2, `GUARD cost rate armed ${rateArmed.toFixed(3)} <= control ${rateCtrl.toFixed(3)} + 0.2`);

  // Wall numbers (reported).
  const wall = (rows, name) => {
    const won = SEEDS.reduce((t, s) => t + (rows[s].won || 0), 0);
    const tab = SEEDS.reduce((t, s) => t + (rows[s].table || 0), 0);
    const w4 = SEEDS.filter(s => (rows[s].waveReach || 1) >= 4).length;
    const w5 = SEEDS.filter(s => (rows[s].waveReach || 1) >= 5).length;
    const med = medianOf(SEEDS.map(s => rows[s].days));
    console.log(`WALL ${name}: won=${won}/8 natEver=${name === 'control' ? natCtrl : natArmed}/8 table=${tab}/8 wave4=${w4}/8 wave5=${w5}/8 medianDays=${med}`);
  };
  wall(ctrl, 'control'); wall(armed, 'armed');

  console.log(`\nANALYZE-DONE fail=${fail} -> ${fail ? 'NO-GO / KILLED (see evidence header for which)' : 'GO'}`);
  if (fail) process.exit(1);
}

async function runSeedReplay(seed, corpusRow, wantBelltoadOnly) {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.DEATHCENSUS = '1';
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { tableseatNowait } = require('./policies/tableseat-nowait');
  const { newStore, installDeathcensusDiag, withDeathcensusDiag } = require('./policies/deathcensus-diag');
  const store = newStore();
  const base = withDeathcensusDiag(tableseatNowait, 'deathcensus-diag', 'tableseat-nowait + villager death-context census recorder', store);
  const { Game } = await loadGame({ seed, mode: 'deathcensus-diag-armed', fullTelemetry: false });
  await setupGame(Game);
  installDeathcensusDiag(Game, store);
  const captured = [];
  const orig = Game.fieldFight;
  const targets = new Set(['73672|125|ethan_hunt', '73673|86|app_mgpspifq568', '73673|87|olivia_bennett']);
  Game.fieldFight = function (vid, mdef, m, opts) {
    let pre = null;
    try {
      pre = {
        day: (Game.state.scholar || {}).day,
        vid,
        mid: mdef && mdef.id,
        knows: Game.villageKnowsTrick && mdef ? Game.villageKnowsTrick(mdef.id) : null,
        obs: mdef ? ((Game.state.villageCounterObs || {})[mdef.id] || 0) : null,
        vHp: ((Game.state.village || {}).health || {})[vid],
        mHp: m ? m.hp : null,
      };
    } catch (e) { pre = { vid, err: String(e).slice(0, 80) }; }
    const rec = orig.apply(this, arguments);
    try {
      const log = rec.log || [];
      const holds = log.some(l => /holds the line/.test(l));
      const lift = log.some(l => /getting nowhere/.test(l));
      const key = `${seed}|${pre.day}|${vid}`;
      if (holds || lift || targets.has(key) || (wantBelltoadOnly && mdef && mdef.id === 'belltoad')) {
        captured.push({ vid, pre, rec: {
          outcome: rec.outcome, rounds: rec.rounds, vTaken: rec.vTaken, mDealt: rec.mDealt,
          vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft, packCount: rec.packCount,
          volley: rec.volley || null, trickLog: rec.trickLog || null, trickShouts: rec.trickShouts || 0,
          intent: rec.intent, intentWhy: rec.intentWhy, holds, lift, log: log.slice(),
        } });
      }
    } catch (e) { /* capture must never break the sim */ }
    return rec;
  };
  const result = await runDays(Game, base, { days: 180, manifest: undefined, sampleEvery: 10 });
  const deaths = (result.samples.deaths || []).map(d => ({
    day: d.day | 0, kind: d.kind || null,
    who: (d.who != null) ? String(d.who) : null,
    cause: (d.cause != null) ? String(d.cause) : null, player: !!d.player,
  }));
  const fightKey = (f) => [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  const sameDays = corpusRow.days === result.days && corpusRow.gameDays === result.gameDays;
  const sameDeaths = JSON.stringify(corpusRow.deathcensus.deaths) === JSON.stringify(deaths);
  const sameResolve = JSON.stringify((corpusRow.deathcensus.resolveFights || []).map(fightKey)) === JSON.stringify((store.resolveFights || []).map(fightKey));
  const sameDirect = JSON.stringify((corpusRow.deathcensus.directFights || []).map(fightKey)) === JSON.stringify((store.directFights || []).map(fightKey));
  return { seed, days: result.days, sameDays, sameDeaths, sameResolve, sameDirect, captured };
}

async function diagMode() {
  let bad = 0;
  const mode = process.env.DIAGMODE || 'control';
  for (const seed of SEEDS) {
    const corpus = loadRow(mode, seed);
    const r = await runSeedReplay(seed, corpus, false);
    const ok = r.sameDays && r.sameDeaths && r.sameResolve && r.sameDirect;
    if (!ok) bad++;
    console.log(`DIAG seed=${seed} days=${r.days} census days=${r.sameDays} deaths=${r.sameDeaths} resolve=${r.sameResolve} direct=${r.sameDirect} -> ${ok ? 'MATCH' : 'MISMATCH'}`);
    for (const c of r.captured) {
      const q = c.rec;
      console.log(`  HOLD seed=${seed} d${c.pre.day} ${c.pre.mid} ${c.vid} out=${q.outcome} r=${q.rounds} dealt=${q.mDealt} taken=${q.vTaken} trickLog=${JSON.stringify(q.trickLog)} intent=${q.intent} holds=${q.holds} lift=${q.lift}`);
      if (q.outcome === 'vDie' || q.lift || c.pre.mid === 'focus_group' || c.pre.mid === 'eulogy') {
        for (const line of q.log) console.log('    LOG ' + line);
      }
    }
  }
  console.log(`\nDIAG-DONE mismatchSeeds=${bad}`);
  if (bad) process.exit(1);
}

async function replayMode() {
  const corpus = loadRow('armed', 73677);
  const r = await runSeedReplay(73677, corpus, true);
  const ok = r.sameDays && r.sameDeaths && r.sameResolve && r.sameDirect;
  console.log(`REPLAY-CENSUS seed=73677 days=${r.days} daysMatch=${r.sameDays} deathsMatch=${r.sameDeaths} resolveMatch=${r.sameResolve} directMatch=${r.sameDirect}`);
  if (!ok) { console.error('REPLAY REPRODUCTION FAILURE — captured logs are NOT trusted'); process.exit(1); }
  console.log('REPLAY-CENSUS MATCH — captured belltoad fight logs are on-trajectory');
  for (const c of r.captured) {
    const q = c.rec;
    console.log(`\n=== belltoad fight d${c.pre.day} ${c.vid} preKnows=${c.pre.knows} preObs=${c.pre.obs} postObs=? vHpEntry=${c.pre.vHp} mHpEntry=${c.pre.mHp} ===`);
    console.log(`outcome=${q.outcome} rounds=${q.rounds} dealt=${q.mDealt} taken=${q.vTaken} vHpLeft=${q.vHpLeft} mHpLeft=${q.mHpLeft} packCount=${q.packCount} trickLog=${JSON.stringify(q.trickLog)} trickShouts=${q.trickShouts} intent=${q.intent} (${q.intentWhy}) holds=${q.holds}`);
    for (const line of q.log) console.log('  LOG ' + line);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--sweep')) return sweepMode(args[args.indexOf('--sweep') + 1] || 'armed');
  if (args.includes('--diag')) return diagMode();
  if (args.includes('--replay')) return replayMode();
  return analyzeMode();
}
if (require.main === module) main().catch(e => { console.error('BELLTOAD-MORALE-A FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { SEEDS, EVID };
