#!/usr/bin/env node
// scripts/test-belltoad-fix-a.js — sim-belltoad-fix-a proof + measurement.
//
// LEVER (candidate 1 from sim-belltoad-a): the learned belltoad counter
// (shout) disrupts the WHOLE chorus — every pack member's next attack
// is halved — instead of only the first member's swing. Change is
// confined to the trickDisrupt application in src/js/fieldFights.js:
// the flag is no longer cleared after the first member's attack; it is
// cleared once, after the full monster phase has acted. Trick-aware
// morale and the 2-shout cap are untouched.
//
// Substrate (replicated exactly from sim-belltoad-a): tableseat-nowait
// (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, no wait leg) + the
// deathcensus-diag fight recorder (runOne from
// scripts/test-deathcensus-diag-sweep.js, recorder pid 'armed').
// Control = pre-fix code, armed = post-fix code, identical seeds
// 73671-73678, 180d death-aware horizon.
//
// Modes:
//   --sweep <control|armed>: run 8 seeds, write per-seed rows to
//     EVID (default evidence/2026-10-25/perseed-sim-belltoad-fix-a)
//     as s<seed>-<mode>.json via the flap-safe writer.
//   --analyze: load both corpora, judge against the pre-registered
//     bar in evidence/2026-10-25/sim-belltoad-fix-a.md. Exit 1 on
//     any failed check (PRIMARY fail = arm KILLED: revert game code
//     before committing).
//   --replay: deterministic replay of seed 73677 under current code
//     with an RNG-neutral rec tap; census-matches the armed corpus
//     (days, gameDays, deaths, fight keys) and prints every belltoad
//     fight log for the sense check. Exit 1 on mismatch.
//   Default: --analyze.
//
// No src/js is touched by this script. Corpus writes go only to EVID.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-belltoad-fix-a');
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

  // PROBE (G5a): control reproduces the sim-belltoad-a pair class.
  const pairCtrl = cf.filter(f => f.mid === 'belltoad' && f.intent === 'engage' && f.outcome === 'vDie');
  const nora = pairCtrl.find(f => f.seed === 73677 && f.day === 67 && f.vid === 'nora_wilson');
  const gen = pairCtrl.find(f => f.seed === 73677 && f.day === 68 && f.vid === 'gen_ed0l37r');
  console.log(`CONTROL belltoad engage-intent deaths: ${pairCtrl.length} ` +
    pairCtrl.map(f => `s${f.seed} d${f.day} ${f.vid} r=${f.rounds} dealt=${f.mDealt} taken=${f.vTaken}`).join(' | '));
  check(!!nora && nora.rounds === 3 && nora.mDealt === 0 && nora.vTaken === 105 && nora.vHpStartFrac === 1 && nora.mHpStartFrac === 0.4,
    'probe: control d67 nora_wilson row reproduced (vDie 3r entry 1.00 dealt 0 taken 105 mHpStart 0.40)');
  check(!!gen && gen.rounds === 2 && gen.mDealt === 0 && gen.vTaken === 76 && gen.vHpStartFrac === 0.73 && gen.mHpStartFrac === 0.4,
    'probe: control d68 gen_ed0l37r row reproduced (vDie 2r entry 0.73 dealt 0 taken 76 mHpStart 0.40)');

  // PRIMARY: belltoad engage-intent deaths 2 -> 0.
  const pairArmed = af.filter(f => f.mid === 'belltoad' && f.intent === 'engage' && f.outcome === 'vDie');
  console.log(`ARMED belltoad engage-intent deaths: ${pairArmed.length} ` +
    pairArmed.map(f => `s${f.seed} d${f.day} ${f.vid} r=${f.rounds} dealt=${f.mDealt} taken=${f.vTaken}`).join(' | '));
  check(pairCtrl.length === 2, 'control belltoad engage-intent death count is 2 (the pre-registered baseline)');
  check(pairArmed.length === 0, 'PRIMARY: armed belltoad engage-intent deaths = 0');

  // G1: other 0-dealt multi-round rows' survival UNCHANGED.
  // Literal wording vs operative clause, kept distinct on purpose:
  // the pre-registered parenthetical "(all survive, as in control)"
  // is FALSE OF THE CONTROL ITSELF on current code (see metric
  // review), so a literal "all survive" check fails for a null arm
  // too and cannot gate this lever. What gates is the operative
  // clause — survival UNCHANGED: the armed death set in this class
  // must be identical to control's, with no new death. The literal
  // premise checks are printed (not gated) so the discrepancy stays
  // visible instead of being re-scored away.
  const otherCtrl = cf.filter(f => f.mid !== 'belltoad' && f.rounds >= 2 && f.mDealt === 0);
  const otherArmed = af.filter(f => f.mid !== 'belltoad' && f.rounds >= 2 && f.mDealt === 0);
  const otherCtrlDie = otherCtrl.filter(f => f.outcome === 'vDie');
  const otherArmedDie = otherArmed.filter(f => f.outcome === 'vDie');
  console.log(`OTHER 0-dealt multi-round rows: control ${otherCtrl.length} (deaths ${otherCtrlDie.length}), armed ${otherArmed.length} (deaths ${otherArmedDie.length})`);
  for (const f of otherCtrl) console.log(`  CTRL  s${f.seed} d${f.day} ${f.mid} ${f.vid} out=${f.outcome} r=${f.rounds}`);
  for (const f of otherArmed) console.log(`  ARMED s${f.seed} d${f.day} ${f.mid} ${f.vid} out=${f.outcome} r=${f.rounds}`);
  const dieKey = (f) => [f.seed, f.day, f.vid, f.mid].join('|');
  const ctrlDieKeys = otherCtrlDie.map(dieKey).sort();
  const armedDieKeys = otherArmedDie.map(dieKey).sort();
  console.log(`PREMISE (non-gating) control other-row deaths all survive: ${otherCtrlDie.length === 0 ? 'PASS' : 'FAIL'} (control itself has ${otherCtrlDie.length}: ${ctrlDieKeys.join('; ')})`);
  console.log(`PREMISE (non-gating) armed other-row deaths all survive: ${otherArmedDie.length === 0 ? 'PASS' : 'FAIL'} (armed has ${otherArmedDie.length}: ${armedDieKeys.join('; ')})`);
  check(JSON.stringify(armedDieKeys) === JSON.stringify(ctrlDieKeys),
    `G1-operative: armed other-row death set identical to control's (no new death, none removed): armed [${armedDieKeys.join('; ')}] vs control [${ctrlDieKeys.join('; ')}]`);
  // Same check under sim-belltoad-a's exact filter (field context
  // only), for the metric review: it also fails on current control.
  const fieldCtrlDie = otherCtrlDie.filter(f => f.context === 'field');
  const fieldArmedDie = otherArmedDie.filter(f => f.context === 'field');
  console.log(`METRIC-REVIEW field-context-only filter: control other rows ${otherCtrl.filter(f => f.context === 'field').length} (deaths ${fieldCtrlDie.length}), armed ${otherArmed.filter(f => f.context === 'field').length} (deaths ${fieldArmedDie.length})`);

  // G2: total villager deaths armed <= control + 2.
  const vdCtrl = SEEDS.map(s => villagerDeaths(ctrl[s]));
  const vdArmed = SEEDS.map(s => villagerDeaths(armed[s]));
  const sumCtrl = vdCtrl.reduce((a, b) => a + b, 0), sumArmed = vdArmed.reduce((a, b) => a + b, 0);
  console.log(`VILLAGER DEATHS per seed: control [${vdCtrl.join(',')}] sum=${sumCtrl}; armed [${vdArmed.join(',')}] sum=${sumArmed}`);
  check(sumArmed <= sumCtrl + 2, `G2: armed villager deaths ${sumArmed} <= control ${sumCtrl} + 2`);

  // G3: national-ever armed >= control - 2.
  const natCtrl = SEEDS.reduce((t, s) => t + (ctrl[s].nationalEver || 0), 0);
  const natArmed = SEEDS.reduce((t, s) => t + (armed[s].nationalEver || 0), 0);
  console.log(`NATIONAL-EVER: control ${natCtrl}/8, armed ${natArmed}/8`);
  check(natArmed >= natCtrl - 2, `G3: armed national-ever ${natArmed} >= control ${natCtrl} - 2`);

  // G4: wins-excluded median armed >= 0.8x control median.
  const medCtrl = medianOf(SEEDS.filter(s => !ctrl[s].won).map(s => ctrl[s].days));
  const medArmed = medianOf(SEEDS.filter(s => !armed[s].won).map(s => armed[s].days));
  console.log(`WINS-EXCLUDED MEDIAN days: control ${medCtrl} (non-wins ${SEEDS.filter(s => !ctrl[s].won).length}), armed ${medArmed} (non-wins ${SEEDS.filter(s => !armed[s].won).length})`);
  check(medArmed >= 0.8 * medCtrl, `G4: armed wins-excluded median ${medArmed} >= 0.8x control ${medCtrl} (${(0.8 * medCtrl).toFixed(1)})`);

  // Wall numbers (reported, not gated except via G3).
  const wall = (rows, name) => {
    const won = SEEDS.reduce((t, s) => t + (rows[s].won || 0), 0);
    const tab = SEEDS.reduce((t, s) => t + (rows[s].table || 0), 0);
    const w4 = SEEDS.filter(s => (rows[s].waveReach || 1) >= 4).length;
    const w5 = SEEDS.filter(s => (rows[s].waveReach || 1) >= 5).length;
    const med = medianOf(SEEDS.map(s => rows[s].days));
    console.log(`WALL ${name}: won=${won}/8 natEver=${name === 'control' ? natCtrl : natArmed}/8 table=${tab}/8 wave4=${w4}/8 wave5=${w5}/8 medianDays=${med}`);
  };
  wall(ctrl, 'control'); wall(armed, 'armed');

  // Belltoad engage-intent fights overall (context: did engage fights stop being 0-dealt?).
  const engCtrl = cf.filter(f => f.mid === 'belltoad' && f.intent === 'engage');
  const engArmed = af.filter(f => f.mid === 'belltoad' && f.intent === 'engage');
  console.log(`BELLTOAD engage-intent fights: control ${engCtrl.length} (0-dealt ${engCtrl.filter(f => f.mDealt === 0).length}), armed ${engArmed.length} (0-dealt ${engArmed.filter(f => f.mDealt === 0).length})`);
  for (const f of engArmed) console.log(`  ARMED s${f.seed} d${f.day} ${f.vid} out=${f.outcome} r=${f.rounds} dealt=${f.mDealt} taken=${f.vTaken}`);

  console.log(`\nANALYZE-DONE fail=${fail} -> ${fail ? 'NO-GO (kill protocol if PRIMARY failed)' : 'GO'}`);
  if (fail) process.exit(1);
}

async function replayMode() {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.DEATHCENSUS = '1';
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { tableseatNowait } = require('./policies/tableseat-nowait');
  const { newStore, installDeathcensusDiag, withDeathcensusDiag } = require('./policies/deathcensus-diag');
  const store = newStore();
  const base = withDeathcensusDiag(tableseatNowait, 'deathcensus-diag', 'tableseat-nowait + villager death-context census recorder', store);
  const { Game } = await loadGame({ seed: 73677, mode: 'deathcensus-diag-armed', fullTelemetry: false });
  await setupGame(Game);
  installDeathcensusDiag(Game, store);
  const captured = [];
  const orig = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    const isBell = mdef && mdef.id === 'belltoad';
    let pre = null;
    if (isBell) {
      try {
        pre = {
          day: (Game.state.scholar || {}).day,
          knows: Game.villageKnowsTrick ? Game.villageKnowsTrick('belltoad') : null,
          obs: ((Game.state.villageCounterObs || {}).belltoad || 0),
          vHp: ((Game.state.village || {}).health || {})[vid],
          mHp: m ? m.hp : null,
        };
      } catch (e) { pre = { err: String(e).slice(0, 100) }; }
    }
    const rec = orig.apply(this, arguments);
    if (isBell) {
      let postObs = null;
      try { postObs = ((Game.state.villageCounterObs || {}).belltoad || 0); } catch (e) {}
      captured.push({ vid, pre, postObs, rec: {
        outcome: rec.outcome, rounds: rec.rounds, vTaken: rec.vTaken, mDealt: rec.mDealt,
        vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft, packCount: rec.packCount,
        volley: rec.volley || null, trickLog: rec.trickLog || null, trickShouts: rec.trickShouts || 0,
        intent: rec.intent, intentWhy: rec.intentWhy, log: rec.log || [],
      } });
    }
    return rec;
  };
  const result = await runDays(Game, base, { days: 180, manifest: undefined, sampleEvery: 10 });
  const corpus = loadRow('armed', 73677);
  const deaths = (result.samples.deaths || []).map(d => {
    let player = false;
    try { player = !!d.player; } catch (e) {}
    return { day: d.day | 0, kind: d.kind || null, who: (d.who != null) ? String(d.who) : null, cause: (d.cause != null) ? String(d.cause) : null, player };
  });
  const fightKey = (f) => [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  const sameDays = corpus.days === result.days && corpus.gameDays === result.gameDays;
  const sameDeaths = JSON.stringify(corpus.deathcensus.deaths) === JSON.stringify(deaths);
  const sameResolve = JSON.stringify((corpus.deathcensus.resolveFights || []).map(fightKey)) === JSON.stringify((store.resolveFights || []).map(fightKey));
  const sameDirect = JSON.stringify((corpus.deathcensus.directFights || []).map(fightKey)) === JSON.stringify((store.directFights || []).map(fightKey));
  console.log(`REPLAY-CENSUS seed=73677 days=${result.days} gameDays=${result.gameDays} daysMatch=${sameDays} deathsMatch=${sameDeaths} resolveMatch=${sameResolve} directMatch=${sameDirect}`);
  if (!(sameDays && sameDeaths && sameResolve && sameDirect)) {
    console.error('REPLAY REPRODUCTION FAILURE — captured logs are NOT trusted (G5b probe FAIL)');
    process.exit(1);
  }
  console.log('REPLAY-CENSUS MATCH — captured belltoad fight logs are on-trajectory (G5b probe PASS)');
  for (const c of captured) {
    const r = c.rec;
    console.log(`\n=== belltoad fight d${c.pre.day} ${c.vid} preKnows=${c.pre.knows} preObs=${c.pre.obs} postObs=${c.postObs} vHpEntry=${c.pre.vHp} mHpEntry=${c.pre.mHp} ===`);
    console.log(`outcome=${r.outcome} rounds=${r.rounds} dealt=${r.mDealt} taken=${r.vTaken} vHpLeft=${r.vHpLeft} mHpLeft=${r.mHpLeft} packCount=${r.packCount} volley=${JSON.stringify(r.volley)} trickLog=${JSON.stringify(r.trickLog)} trickShouts=${r.trickShouts} intent=${r.intent} (${r.intentWhy})`);
    for (const line of r.log) console.log('  LOG ' + line);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--sweep')) return sweepMode(args[args.indexOf('--sweep') + 1] || 'armed');
  if (args.includes('--replay')) return replayMode();
  return analyzeMode();
}
if (require.main === module) main().catch(e => { console.error('BELLTOAD-FIX-A FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { SEEDS, EVID };
