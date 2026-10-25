#!/usr/bin/env node
// scripts/test-belltoad-cand3.js — sim-belltoad-cand3-b proof + measurement.
//
// ARM (candidate 3 from sim-belltoad-a, post-cap fallback ONLY —
// candidates 1 and 2 are done and NOT touched here): at the trick-aware
// morale check, when the performed trick is EXHAUSTED — a shout-kind
// counter with rec.trickShouts >= 2 — the hold is NOT applied and the
// normal hopeless branch runs (help call / vFlee) with a narrating line.
// After the cap, villagerTrickAction already returns null for shout, so
// the next action WOULD be a strike; the hold at the cap round end is
// what prevents reaching it. No game code is written before the Step 0
// gate in evidence/2026-10-25/sim-belltoad-cand3-b.md passes.
//
// INSTRUMENT LIMIT: recorder corpus rows carry NO trick fields, so
// --step0 counts the corpus-observable proxy (belltoad engage vDie)
// and --diag confirms trick state via a census-matched replay tap.
//
// Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) +
// deathcensus-diag fight recorder (runOne from
// scripts/test-deathcensus-diag-sweep.js, recorder pid 'armed'), seeds
// 73671-73678, 180d death-aware horizon.
//
// Modes:
//   --sweep <control|armed>: run 8 seeds, write per-seed rows to EVID
//     (default evidence/2026-10-25/perseed-sim-belltoad-cand3-b)
//     as s<seed>-<mode>.json via the flap-safe writer.
//   --step0: load the CONTROL corpus, list every belltoad engage vDie
//     row, print wall numbers + full 8-seed days distribution +
//     spool/nielsen setup-completion proxy counts. Exit 0 regardless
//     of target count (Step 0 is data; the KILL decision is judged in
//     the evidence file against the DIAG-confirmed target class).
//   --diag: census-matched replay of all 8 control seeds capturing
//     every belltoad fight (trickLog, trickShouts, holds-line). Exit 1
//     on any census mismatch. Prints the DIAG-confirmed target class.
//   Default: --step0.
//
// No src/js is touched by this script.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-25', 'perseed-sim-belltoad-cand3-b');
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

function step0Mode() {
  const ctrl = {};
  for (const seed of SEEDS) ctrl[seed] = loadRow('control', seed);
  const fights = SEEDS.flatMap(s => allFightRows(ctrl[s]).map(f => Object.assign({ seed: s }, f)));
  const bellDie = fights.filter(f => f.mid === 'belltoad' && f.intent === 'engage' && f.outcome === 'vDie');
  console.log(`BELLTOAD engage-intent vDie rows (control corpus): ${bellDie.length}`);
  for (const f of bellDie) console.log(`  BELL-DIE s${f.seed} d${f.day} ${f.vid} r=${f.rounds} dealt=${f.mDealt} taken=${f.vTaken} entry=${f.vHpStartFrac} src=${f.src} ctx=${f.context}`);
  const tightProxy = bellDie.filter(f => f.rounds >= 2 && f.mDealt === 0);
  console.log(`TIGHT PROXY (rounds>=2, dealt==0, trick state UNCONFIRMED — needs --diag): ${tightProxy.length}`);
  const bellAll = fights.filter(f => f.mid === 'belltoad');
  console.log(`ALL belltoad rows: ${bellAll.length} (engage ${bellAll.filter(f => f.intent === 'engage').length}, learn ${bellAll.filter(f => f.intent === 'learn').length})`);
  // Wall numbers + full distribution (composition-proof basis).
  const days = SEEDS.map(s => ctrl[s].days);
  const vd = SEEDS.map(s => villagerDeaths(ctrl[s]));
  const nat = SEEDS.reduce((t, s) => t + (ctrl[s].nationalEver || 0), 0);
  const tab = SEEDS.reduce((t, s) => t + (ctrl[s].table || 0), 0);
  const won = SEEDS.reduce((t, s) => t + (ctrl[s].won || 0), 0);
  const w4 = SEEDS.filter(s => (ctrl[s].waveReach || 1) >= 4).length;
  const w5 = SEEDS.filter(s => (ctrl[s].waveReach || 1) >= 5).length;
  console.log(`WALL control: won=${won}/8 natEver=${nat}/8 table=${tab}/8 wave4=${w4}/8 wave5=${w5}/8`);
  console.log(`DAYS full 8-seed distribution: [${days.join(',')}] median=${medianOf(days)} wins-excluded median=${medianOf(SEEDS.filter(s => !ctrl[s].won).map(s => ctrl[s].days))} max=${Math.max.apply(null, days)}`);
  console.log(`VILLAGER DEATHS per seed: [${vd.join(',')}] sum=${vd.reduce((a, b) => a + b, 0)}`);
  // Spool / nielsen setup-completion proxy (rounds>=4 and dealt>0).
  for (const mid of ['spool', 'nielsen']) {
    const rows = fights.filter(f => f.mid === mid);
    const done = rows.filter(f => f.rounds >= 4 && f.mDealt > 0);
    console.log(`SETUP-PROXY ${mid}: fights=${rows.length} completed(rounds>=4,dealt>0)=${done.length}`);
    for (const f of done) console.log(`  ${mid.toUpperCase()}-DONE s${f.seed} d${f.day} ${f.vid} r=${f.rounds} dealt=${f.mDealt} out=${f.outcome}`);
  }
  console.log(`\nSTEP0-DONE tightProxy=${tightProxy.length} bellDie=${bellDie.length} (DIAG confirmation required before any verdict — see --diag)`);
}

async function runSeedDiag(seed, corpusRow) {
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
  Game.fieldFight = function (vid, mdef, m, opts) {
    let pre = null;
    try {
      pre = {
        day: (Game.state.scholar || {}).day, vid, mid: mdef && mdef.id,
        knows: Game.villageKnowsTrick && mdef ? Game.villageKnowsTrick(mdef.id) : null,
        vHp: ((Game.state.village || {}).health || {})[vid], mHp: m ? m.hp : null,
      };
    } catch (e) { pre = { vid, err: String(e).slice(0, 80) }; }
    const rec = orig.apply(this, arguments);
    try {
      if (mdef && mdef.id === 'belltoad') {
        const log = rec.log || [];
        captured.push({ vid, pre, rec: {
          outcome: rec.outcome, rounds: rec.rounds, vTaken: rec.vTaken, mDealt: rec.mDealt,
          vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft, packCount: rec.packCount,
          trickLog: rec.trickLog || null, trickShouts: rec.trickShouts || 0,
          intent: rec.intent, intentWhy: rec.intentWhy,
          holds: log.some(l => /holds the line/.test(l)), log: log.slice(),
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
  let bad = 0, target = 0, broad = 0;
  const onlySeed = process.env.DIAGSEED ? parseInt(process.env.DIAGSEED, 10) : null;
  for (const seed of SEEDS) {
    if (onlySeed && seed !== onlySeed) continue;
    const corpus = loadRow('control', seed);
    const r = await runSeedDiag(seed, corpus);
    const ok = r.sameDays && r.sameDeaths && r.sameResolve && r.sameDirect;
    if (!ok) bad++;
    console.log(`DIAG seed=${seed} days=${r.days} census days=${r.sameDays} deaths=${r.sameDeaths} resolve=${r.sameResolve} direct=${r.sameDirect} belltoadFights=${r.captured.length} -> ${ok ? 'MATCH' : 'MISMATCH'}`);
    for (const c of r.captured) {
      const q = c.rec;
      const isTarget = q.intent === 'engage' && q.outcome === 'vDie' && q.rounds >= 2 && q.trickShouts === 2 && q.mDealt === 0 && q.holds;
      const isBroad = q.intent === 'engage' && q.outcome === 'vDie' && q.rounds >= 2 && q.trickShouts === 2 && q.mDealt > 0;
      if (isTarget) target++;
      if (isBroad) broad++;
      if (q.outcome === 'vDie' || isTarget || isBroad) {
        console.log(`  BELL s${seed} d${c.pre.day} ${c.vid} out=${q.outcome} r=${q.rounds} dealt=${q.mDealt} taken=${q.vTaken} trickLog=${JSON.stringify(q.trickLog)} shouts=${q.trickShouts} intent=${q.intent} holds=${q.holds} TARGET=${isTarget} BROAD=${isBroad}`);
        if (q.outcome === 'vDie') for (const line of q.log) console.log('    LOG ' + line);
      }
    }
  }
  console.log(`\nDIAG-DONE mismatchSeeds=${bad} TARGET(engage,vDie,r>=2,shouts==2,dealt==0,holds)=${target} BROAD(shouts==2,dealt>0)=${broad}`);
  if (bad) process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--sweep')) return sweepMode(args[args.indexOf('--sweep') + 1] || 'armed');
  if (args.includes('--diag')) return diagMode();
  return step0Mode();
}
if (require.main === module) main().catch(e => { console.error('BELLTOAD-CAND3 FAILED:', (e && e.stack) || e); process.exit(1); });
module.exports = { SEEDS, EVID };
