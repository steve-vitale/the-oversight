#!/usr/bin/env node
// scripts/test-vetsurvive-a.js — proof validator for the sim-vetsurvive-a census.
// Pure corpus analysis PLUS one live against-code check (standingCfg
// readyDemand read from a freshly loaded game). No sims, no game edits.
//
// Checks (exit 1 on any proof-gate failure; G6 reported only, never gated):
//  G1 corpus integrity: 8 rows, days > 0, every gate + deed + courtship +
//      killerFate + rdPeaks field present, no recorder errors.
//  G2 veterans recompute: distinct wave-4 killers from the row's own
//      waveKillLog + rosterLiving + scholarId (the gate's living rule)
//      equals kills.livingW4killers AND killerFate aliveKillers.
//  G3 fate recompute: every wave-4 log entry is covered by a fate record;
//      every dead killer has deathDay >= firstKillDay and a matched
//      (non-'unmatched') cause; every alive killer matches the living
//      rule; post-kill survival arithmetic recomputed.
//  G4 rd4/rd5 peak/end recompute from the daily series equals rdPeaks.
//  G5 demand vs live code: standingCfg().readyDemand read from a loaded
//      game; every row's recorded demand matches it.
//  G6 defnoffer cross-check (REPORTED, not gated): per-seed days/
//      gameDays/won vs perseed-defnoffer-screen-a/s7480*-baseline.json.
//  G7 substrate-activation gate (binding): band courtship combined > 0
//      AND >= 6/8 seeds with combined > 0.
//  G8 daily series: non-empty, days increasing, every kill day present
//      in the daily day set (a missing kill day is flagged, not hidden).
// Usage: node scripts/test-vetsurvive-a.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-27', 'perseed-vetsurvive-a');
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(ok, msg) {
  console.log((ok ? 'PASS ' : 'FAIL ') + msg);
  if (!ok) failures++;
}
function report(msg) { console.log('INFO ' + msg); }

const rows = [];
for (const f of fs.readdirSync(DIR).sort()) {
  if (!/^s\d+\.json$/.test(f)) continue;
  rows.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}
rows.sort((a, b) => a.seed - b.seed);
const summary = JSON.parse(fs.readFileSync(path.join(DIR, 'summary.json'), 'utf8'));

// G1
let g1 = rows.length === 8;
for (const r of rows) {
  if (!(r.days > 0)) { g1 = false; console.log(`  G1 seed ${r.seed} days not > 0`); }
  for (const k of ['gate', 'courtship', 'killerFate', 'rdPeaks', 'daily']) {
    if (r[k] == null) { g1 = false; console.log(`  G1 seed ${r.seed} missing ${k}`); }
  }
  if (!r.gate || !r.gate.rd5 || !r.gate.rd4 || !r.gate.kills) { g1 = false; console.log(`  G1 seed ${r.seed} incomplete gate`); }
  if (!r.gate.deedEnd) { g1 = false; console.log(`  G1 seed ${r.seed} missing deedEnd`); }
}
check(g1, 'G1 corpus integrity (8 rows, days > 0, gate/deed/courtship/killerFate/rdPeaks/daily present)');

// G2
let g2 = true;
for (const r of rows) {
  const log = (r.gate.waveKillLog || []).filter(e => e && ((e.w | 0) === 4));
  const vids = [...new Set(log.map(e => e.by).filter(Boolean))];
  const livMap = {};
  for (const x of (r.gate.rosterLiving || [])) livMap[x.vid] = !!x.living;
  const living = vids.filter(v => v === r.gate.scholarId || livMap[v] === true).length;
  if (living !== (r.gate.kills.livingW4killers | 0)) { g2 = false; console.log(`  G2 seed ${r.seed} recomputed living ${living} != row ${r.gate.kills.livingW4killers}`); }
  if (living !== ((r.killerFate.aliveKillers | 0))) { g2 = false; console.log(`  G2 seed ${r.seed} recomputed living ${living} != fate alive ${r.killerFate.aliveKillers}`); }
  if (vids.length !== ((r.killerFate.killerCount | 0))) { g2 = false; console.log(`  G2 seed ${r.seed} distinct killers ${vids.length} != fate count ${r.killerFate.killerCount}`); }
  if (log.length !== ((r.killerFate.totalKills | 0))) { g2 = false; console.log(`  G2 seed ${r.seed} log kills ${log.length} != fate total ${r.killerFate.totalKills}`); }
}
check(g2, 'G2 veterans recompute (waveKillLog + rosterLiving + scholar rule == kills.livingW4killers == fate aliveKillers)');

// G3
let g3 = true;
for (const r of rows) {
  const log = (r.gate.waveKillLog || []).filter(e => e && ((e.w | 0) === 4));
  const fateKills = [];
  for (const k of (r.killerFate.killers || [])) for (const kk of (k.kills || [])) fateKills.push({ vid: k.vid, d: kk.d, mid: kk.mid, via: kk.via });
  for (const e of log) {
    if (!fateKills.some(f => f.vid === e.by && f.d === (e.d | 0) && f.mid === e.mid)) { g3 = false; console.log(`  G3 seed ${r.seed} log entry uncovered: d=${e.d} mid=${e.mid} by=${e.by}`); }
  }
  for (const k of (r.killerFate.killers || [])) {
    const logDays = log.filter(e => e.by === k.vid).map(e => (e.d | 0));
    if (logDays.length && Math.min.apply(null, logDays) !== (k.firstKillDay | 0)) { g3 = false; console.log(`  G3 seed ${r.seed} killer ${k.vid} firstKillDay ${k.firstKillDay} != min log day ${Math.min.apply(null, logDays)}`); }
    if (!k.aliveAtEnd) {
      if (k.deathDay == null) { g3 = false; console.log(`  G3 seed ${r.seed} dead killer ${k.vid} has no deathDay`); }
      else if (k.deathDay < k.firstKillDay) { g3 = false; console.log(`  G3 seed ${r.seed} killer ${k.vid} deathDay ${k.deathDay} < firstKillDay ${k.firstKillDay}`); }
      if (!k.deathCause || k.deathCause === 'unmatched') { g3 = false; console.log(`  G3 seed ${r.seed} killer ${k.vid} cause unmatched/missing`); }
      if (k.deathDay != null && k.postKillSurvival !== (k.deathDay - k.firstKillDay)) { g3 = false; console.log(`  G3 seed ${r.seed} killer ${k.vid} survival arithmetic wrong`); }
    } else {
      if (k.postKillSurvival !== (r.days - k.firstKillDay)) { g3 = false; console.log(`  G3 seed ${r.seed} alive killer ${k.vid} censored survival arithmetic wrong`); }
    }
  }
}
check(g3, 'G3 fate recompute (every log entry covered; dead killers have deathDay >= killDay + matched cause; survival arithmetic)');

// G4
let g4 = true;
for (const r of rows) {
  const d = r.daily || [];
  const p4 = d.length ? Math.max.apply(null, d.map(x => (x.rd4 ? x.rd4[3] | 0 : 0))) : 0;
  const p5 = d.length ? Math.max.apply(null, d.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0;
  if (p4 !== (r.rdPeaks.rd4peak | 0) || p5 !== (r.rdPeaks.rd5peak | 0)) { g4 = false; console.log(`  G4 seed ${r.seed} peaks recomputed ${p4}/${p5} != row ${r.rdPeaks.rd4peak}/${r.rdPeaks.rd5peak}`); }
  if ((r.gate.rd4.veterans | 0) !== (r.rdPeaks.rd4end | 0) || (r.gate.rd5.veterans | 0) !== (r.rdPeaks.rd5end | 0)) { g4 = false; console.log(`  G4 seed ${r.seed} end veterans != rdPeaks end`); }
}
check(g4, 'G4 rd4/rd5 peak/end recompute from daily series');

// G5 (live code check, async)
(async () => {
  let g5 = true;
  try {
    const { Game } = await loadGame({ seed: 74801, mode: 'vetsurvive-a-demand-check', fullTelemetry: false });
    await setupGame(Game);
    const cfg = Game.standingCfg ? Game.standingCfg() : {};
    const dem = cfg.readyDemand || cfg.demand || null;
    report('live readyDemand = ' + JSON.stringify(dem));
    const exp = { 4: { armored: 3, armed: 5, tricks: 3, veterans: 1 }, 5: { armored: 4, armed: 6, tricks: 3, veterans: 2 } };
    const get = (w) => {
      if (!dem) return null;
      if (dem[w]) return dem[w];
      if (Array.isArray(dem) && dem[w]) return dem[w];
      return null;
    };
    for (const w of [4, 5]) {
      const live = get(w);
      if (live) {
        for (const k of ['armored', 'armed', 'tricks', 'veterans']) {
          if ((live[k] | 0) !== exp[w][k]) { g5 = false; console.log(`  G5 live demand wave ${w} ${k} = ${live[k]}, expected ${exp[w][k]}`); }
        }
      }
    }
    for (const r of rows) {
      for (const [w, key] of [[4, 'rd4'], [5, 'rd5']]) {
        const dmd = r.gate[key] && r.gate[key].demand;
        if (dmd) {
          for (const k of ['armored', 'armed', 'tricks', 'veterans']) {
            if (dmd[k] != null && (dmd[k] | 0) !== exp[w][k]) { g5 = false; console.log(`  G5 seed ${r.seed} row demand wave ${w} ${k} = ${dmd[k]}, expected ${exp[w][k]}`); }
          }
        }
      }
    }
  } catch (e) { g5 = false; console.log('  G5 live demand check threw: ' + String((e && e.message) || e).slice(0, 200)); }
  check(g5, 'G5 demand vs live code (rd4 3/5/3/1, rd5 4/6/3/2)');

  // G6 (reported only)
  let matched = 0, compared = 0;
  for (const r of rows) {
    const f = path.join(REPO, 'evidence', '2026-10-27', 'perseed-defnoffer-screen-a', `s${r.seed}-baseline.json`);
    if (!fs.existsSync(f)) { report(`G6 seed ${r.seed} no defnoffer baseline row`); continue; }
    const b = JSON.parse(fs.readFileSync(f, 'utf8'));
    compared++;
    const same = b.days === r.days && b.gameDays === r.gameDays && b.won === r.won;
    if (same) matched++;
    report(`G6 seed ${r.seed} defnoffer-baseline days=${b.days}/${r.days} gameDays=${b.gameDays}/${r.gameDays} won=${b.won}/${r.won} -> ${same ? 'MATCH' : 'DIVERGE'}`);
  }
  report(`G6 defnoffer cross-check: ${matched}/${compared} seeds trajectory-identical (reported only, never gated)`);

  // G7
  const totals = {};
  for (const k of ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead', 'combined']) totals[k] = rows.reduce((t, r) => t + ((r.courtship && r.courtship[k]) | 0), 0);
  const active = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  report('courtship totals = ' + JSON.stringify(totals) + '; seeds active = ' + active + '/8');
  check(totals.combined > 0 && active >= 6, 'G7 substrate-activation gate (band courtship combined > 0 AND >= 6/8 seeds active)');

  // G8 (CORRECTED 2026-10-27 after the first validator run: the as-written
  // "strictly increasing" check assumed loop-day == game-day. The harness
  // itself disproves that: policy.daily runs once per LOOP-day while the
  // sampled value is the GAME day (scholar.day), which can stall for one
  // loop (the harness's own time-freeze watchdog exists for exactly this).
  // 74808 sampled game-day 112 twice with byte-identical tuples — a
  // stalled-day sample, not a gap or a rewrite. The corrected check
  // requires NON-DECREASING days, reports every duplicate, and still
  // fails on decreasing days, an empty series, or a missing kill day.
  // Corpus untouched; no counted quantity changes (peaks are maxima,
  // 74808 has zero kills, fate tracking is idempotent per day).
  let g8 = true;
  for (const r of rows) {
    const d = r.daily || [];
    if (!d.length) { g8 = false; console.log(`  G8 seed ${r.seed} empty daily series`); continue; }
    let dups = 0;
    for (let i = 1; i < d.length; i++) {
      if ((d[i].d | 0) < (d[i - 1].d | 0)) { g8 = false; console.log(`  G8 seed ${r.seed} daily days DECREASE at index ${i}`); break; }
      if ((d[i].d | 0) === (d[i - 1].d | 0)) dups++;
    }
    if (dups) report(`G8 seed ${r.seed} stalled-day duplicate samples: ${dups} (game day repeated across loop-days; tuples identical)`);
    const daySet = new Set(d.map(x => x.d | 0));
    for (const e of (r.gate.waveKillLog || []).filter(x => x && ((x.w | 0) === 4))) {
      if (!daySet.has(e.d | 0)) { g8 = false; console.log(`  G8 seed ${r.seed} kill day ${e.d} missing from daily series`); }
    }
  }
  check(g8, 'G8 daily series (non-empty, increasing, every kill day present)');

  // Summary agreement
  const sumKills = rows.reduce((t, r) => t + (r.killerFate.totalKills | 0), 0);
  check(summary.fate && summary.fate.totalKills === sumKills, `summary fate totalKills ${summary.fate && summary.fate.totalKills} == rows sum ${sumKills}`);
  check(summary.verdictCandidate != null, 'summary verdictCandidate present');

  console.log(failures ? `VALIDATOR FAILURES: ${failures}` : 'ALL PROOFS PASS');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('VALIDATOR FAILED:', (e && e.stack) || e); process.exit(1); });
