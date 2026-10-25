#!/usr/bin/env node
// scripts/test-defwound-arm-sweep.js — sim-defwound-a STAGE 2 pilot
// (scale-onramp axis, 2026-10-25: DEFENDER FINISH, the one rule).
//
// RULE (pre-registered in evidence/2026-10-25/sim-defwound-a.md,
// before implementing): in defender (raid) fights only, a monster
// the fight DROPS below the break line does not flee wounded — the
// fight continues to a finish. Implemented as: resolveWildMonster-
// Encounter threads opts.raid into fieldFight; fieldFight's two
// break-line mFlee checks (post-volley, in-round) are skipped when
// opts.raid AND the lead started at/above the line. A monster that
// STARTS below the line still rounds-0 flees exactly as before.
// Round-cap decision, trick mFlees, vFlee, arena, aidFight: untouched.
// No toll change. No survivability companion.
//
// PAIRING: armed = Stage 1 control composition (tableseat-nowait +
// raftdraft + spawnsrc + oldcore + defwound recorders) run on the
// CHANGED game code, same seeds 73671-73678, 180d death-aware.
// The comparator is the Stage 1 control corpus
// (evidence/2026-10-25/perseed-defwound-a/), NOT a fresh baseline
// run — the only difference between the corpora is the rule.
// Trajectories diverge by RNG cascade after the first changed
// fight; the bars are on aggregates, and the first-divergence
// check below proves the mechanism per seed.
//
// Modes:
//   --one armed <seed> : run one seed, write its row to
//     evidence/2026-10-25/perseed-defwound-arm-a/.
//   --summary : build summary.json from the armed rows on disk,
//     judge the pre-registered GO bars against the Stage 1 control
//     corpus, run the first-divergence check. Exit 1 on any GO
//     miss or proof-gate failure (the verdict is NO-GO, but the
//     script exits 1 so a missed bar can never read as green).
//
// GO BARS (binding, from the evidence pre-registration):
//   PRIMARY: defender below-line survivor EVENTS down >= 30%
//     (control 260 -> <= 182).
//   SECOND LEG (at least one): defender villager kills up
//     (control 25 -> more) OR re-meet events of below-line
//     survivors down (control 877 -> fewer).
//   COST GUARDS: mixed death-tele total <= control +10%
//     (234 -> <= 257); wins >= control (4/8).
// Diagnostics (never bars): national-ever, wave-4/5, median,
// starvation, defender vDie, kind-filtered villager deaths
// (armed only — the Stage 1 corpus predates the deathList field).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { runOne, analyzeSeedRow, SEEDS } = require('./test-defwound-diag-sweep');
const { analyzeDefwound } = require('./policies/defwound-diag');

const CONTROL_DIR = path.join(REPO, 'evidence', '2026-10-25', 'perseed-defwound-a');
const ARM_DIR = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-defwound-arm-a');
const CONTROL = { events: 260, kills: 25, remeets: 877, deaths: 234, wins: 4 };

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function sleepMs(ms) { try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); } catch (e) { /* sleep best-effort */ } }
function writeFileRetry(p, body) {
  let lastErr = null;
  for (let a = 1; a < 8; a++) {
    try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); return; }
    catch (e) {
      lastErr = e;
      console.log(`WRITE-RETRY ${path.basename(p)} attempt=${a} err=${String((e && e.message) || e).slice(0, 160)}`);
      if (a < 8) sleepMs(Math.min(10000, 1000 * a));
    }
  }
  throw lastErr;
}
function kindFilteredVillagerDeaths(row) {
  if (!row || !Array.isArray(row.deathList)) return null;
  const sid = row.scholarId || null;
  return row.deathList.filter(d => !d.player && (d.kind === 'person' || d.kind === 'villager') && d.who !== sid && d.who !== 'player').length;
}

async function oneMode(pid, seedArg) {
  const seed = parseInt(seedArg, 10);
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  fs.mkdirSync(ARM_DIR, { recursive: true });
  const row = await runOne(pid, seed, days, ARM_DIR);
  const dd = row.defwound, od = row.oldcore;
  console.log(`  [${pid} seed ${seed}] days=${row.days} gameDays=${row.gameDays} end=${row.endReason} wave=${row.waveReach} arc=${row.maxArc} finalRank=${row.finalRank} natEver=${row.nationalEver} natFinal=${row.nationalFinal} table=${row.table} entered=${row.entered} won=${row.won} starv=${row.starvationDeaths} deaths=${row.deathTotal} villagerDeaths=${kindFilteredVillagerDeaths(row)} defRows=${dd ? dd.resolveFights.length : 0} defErrs=${dd ? dd.diag.errs : 'n/a'} oldErrs=${od ? od.diag.errs : 'n/a'}`);
}

async function summaryMode() {
  const days = parseInt(process.env.DAYS || '180', 10) || 180;
  const armed = [], control = [];
  for (const seed of SEEDS) {
    armed.push(JSON.parse(fs.readFileSync(path.join(ARM_DIR, `s${seed}-armed.json`), 'utf8')));
    control.push(JSON.parse(fs.readFileSync(path.join(CONTROL_DIR, `s${seed}-armed.json`), 'utf8')));
  }
  const band = {
    n: armed.length,
    won: armed.reduce((t, r) => t + r.won, 0),
    medianDays: medianOf(armed.map(r => r.days)),
    medianDaysWinsExcluded: medianOf(armed.filter(r => !r.won).map(r => r.days)),
    nationalEver: armed.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: armed.reduce((t, r) => t + r.nationalFinal, 0),
    table: armed.reduce((t, r) => t + r.table, 0),
    entered: armed.reduce((t, r) => t + r.entered, 0),
    wave3: armed.filter(r => (r.waveReach || 1) >= 3).length,
    wave4: armed.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: armed.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: armed.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: armed.reduce((t, r) => t + r.deathTotal, 0),
    villagerDeaths: armed.reduce((t, r) => t + (kindFilteredVillagerDeaths(r) || 0), 0),
    villagerDeathsKnown: armed.every(r => kindFilteredVillagerDeaths(r) !== null),
  };
  const perSeed = armed.map((r, i) => ({ seed: r.seed, analysis: analyzeSeedRow(r), control: analyzeSeedRow(control[i]) }));
  const sum = (f) => perSeed.reduce((t, s) => t + f(s.analysis), 0);
  const pooled = {
    defenderFights: sum(a => a.defender.fights),
    defenderByOutcome: (() => { const m = {}; for (const s of perSeed) for (const k of Object.keys(s.analysis.defender.byOutcome)) m[k] = (m[k] || 0) + s.analysis.defender.byOutcome[k]; return m; })(),
    defenderMFleeBelowLine: sum(a => a.defender.mFleeBelowLine),
    defenderManufactured: sum(a => a.defender.manufactured),
    defenderPreWounded: sum(a => a.defender.preWounded),
    defenderStartBelowLine: sum(a => a.defender.startBelowLine),
    defenderVKill: 0, defenderVDie: 0,
    remeetTotal: sum(a => a.remeet.all.totalReMeets),
    remeetEvents: sum(a => a.remeet.all.events),
    remeetFinished: sum(a => a.remeet.all.finishedEntities),
    remeetRounds0: sum(a => a.remeet.all.rounds0ReMeets),
    fates: (() => { const m = {}; for (const s of perSeed) for (const k of Object.keys(s.analysis.fates)) m[k] = (m[k] || 0) + s.analysis.fates[k]; return m; })(),
  };
  pooled.defenderVKill = pooled.defenderByOutcome.vKill || 0;
  pooled.defenderVDie = pooled.defenderByOutcome.vDie || 0;
  // First-divergence check: the control's first defender-manufactured
  // event (day, vid, seq, start HP) must appear in the armed run as
  // the same fight (identical trajectory until then) ending vKill.
  const divergences = [];
  for (let i = 0; i < SEEDS.length; i++) {
    const cRows = control[i].defwound.resolveFights;
    const aRows = armed[i].defwound.resolveFights;
    const first = cRows.find(f => f.raid && f.outcome === 'mFlee' && f.manufactured);
    if (!first) { divergences.push({ seed: SEEDS[i], ok: false, reason: 'control has no manufactured event' }); continue; }
    const match = aRows.find(f => f.day === first.day && f.vid === first.vid && f.seq === first.seq && f.mHpStart === first.mHpStart);
    if (!match) { divergences.push({ seed: SEEDS[i], ok: false, reason: 'no matching armed fight', control: { day: first.day, vid: first.vid, seq: first.seq, mid: first.mid, rounds: first.rounds } }); continue; }
    const ok = match.outcome === 'vKill' && match.rounds >= first.rounds;
    divergences.push({ seed: SEEDS[i], ok: ok, control: { day: first.day, vid: first.vid, seq: first.seq, mid: first.mid, outcome: first.outcome, rounds: first.rounds, endFrac: first.mHpEndFrac },
      armed: { outcome: match.outcome, rounds: match.rounds, endFrac: match.mHpEndFrac, context: match.context } });
  }
  const divPass = divergences.every(d => d.ok);
  const corpusOk = armed.length === SEEDS.length && armed.every(r => r.days > 0 && r.defwound
    && Array.isArray(r.defwound.resolveFights) && r.defwound.diag.errs === 0
    && Object.values(r.defwound.diag.overflow || {}).every(v => v === 0)
    && r.oldcore && r.oldcore.diag.errs === 0);
  const go = {
    primary: pooled.defenderMFleeBelowLine <= 182,
    secondKills: pooled.defenderVKill > CONTROL.kills,
    secondRemeets: pooled.remeetTotal < CONTROL.remeets,
    guardDeaths: band.deathTotal <= 257,
    guardWins: band.won >= CONTROL.wins,
  };
  go.second = go.secondKills || go.secondRemeets;
  go.all = go.primary && go.second && go.guardDeaths && go.guardWins && divPass && corpusOk;
  const report = {
    label: 'sim-defwound-a STAGE 2 pilot (defender finish)', seeds: SEEDS, days,
    band: band, pooled: pooled, control: CONTROL, go: go,
    divergences: divergences, corpusOk: corpusOk, divPass: divPass,
    perSeed: perSeed.map(s => ({ seed: s.seed, defender: s.analysis.defender, remeet: s.analysis.remeet, fates: s.analysis.fates })),
    generated: new Date().toISOString(),
  };
  const summaryPath = path.join(ARM_DIR, 'summary.json');
  writeFileRetry(summaryPath, JSON.stringify(report, null, 1) + '\n');
  console.log('\n=== sim-defwound-a STAGE 2 pilot (defender finish) ===');
  console.log(`  band: n=${band.n} won=${band.won} medD=${band.medianDays} medDNoWin=${band.medianDaysWinsExcluded} natEver=${band.nationalEver} natFinal=${band.nationalFinal} table=${band.table} entered=${band.entered} wave3=${band.wave3} wave4=${band.wave4} wave5=${band.wave5} starv=${band.starvationTotal} deaths=${band.deathTotal} villagerDeaths=${band.villagerDeathsKnown ? band.villagerDeaths : 'n/a'}`);
  console.log(`  DEFENDER: fights=${pooled.defenderFights} byOutcome=${JSON.stringify(pooled.defenderByOutcome)} mFleeBelowLine=${pooled.defenderMFleeBelowLine} manufactured=${pooled.defenderManufactured} preWounded=${pooled.defenderPreWounded} startBelowLine=${pooled.defenderStartBelowLine}`);
  console.log(`  RE-MEET: events=${pooled.remeetEvents} totalReMeets=${pooled.remeetTotal} finished=${pooled.remeetFinished} rounds0=${pooled.remeetRounds0}`);
  console.log(`  FATES: ${JSON.stringify(pooled.fates)}`);
  console.log(`  GO primary (events <= 182): ${pooled.defenderMFleeBelowLine} -> ${go.primary ? 'PASS' : 'FAIL'}`);
  console.log(`  GO second (kills > 25 OR remeets < 877): kills=${pooled.defenderVKill} (${go.secondKills ? 'PASS' : 'fail'}) remeets=${pooled.remeetTotal} (${go.secondRemeets ? 'PASS' : 'fail'}) -> ${go.second ? 'PASS' : 'FAIL'}`);
  console.log(`  GO guards (deaths <= 257, wins >= 4): deaths=${band.deathTotal} (${go.guardDeaths ? 'PASS' : 'FAIL'}) wins=${band.won} (${go.guardWins ? 'PASS' : 'FAIL'})`);
  console.log(`  DIVERGENCE (first manufactured fight -> vKill, per seed): ${divPass ? 'PASS' : 'FAIL'} (${divergences.filter(d => d.ok).length}/${divergences.length})`);
  for (const d of divergences) console.log(`    seed ${d.seed}: ${d.ok ? 'PASS' : 'FAIL'} control=${JSON.stringify(d.control)} armed=${JSON.stringify(d.armed || null)} ${d.reason || ''}`);
  console.log(`  CORPUS: ${corpusOk ? 'PASS' : 'FAIL'} -> ${summaryPath}`);
  console.log(`  VERDICT: ${go.all ? 'GO' : 'NO-GO'}`);
  if (!go.all) { console.error('GO BAR MISS — NO-GO (revert game code, land record only)'); process.exit(1); }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--one')) return oneMode(args[args.indexOf('--one') + 1], args[args.indexOf('--one') + 2]);
  if (args.includes('--summary')) return summaryMode();
  console.error('usage: --one <pid> <seed> | --summary');
  process.exit(2);
}
if (require.main === module) main().catch(e => { console.error('DEFWOUND-ARM SWEEP FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { kindFilteredVillagerDeaths, CONTROL };
