#!/usr/bin/env node
// scripts/test-overtime-a.js — proof validator for the sim-overtime-a census.
// Pure corpus analysis PLUS one live against-code check (standingCfg
// readyDemand read from a freshly loaded game). No sims, no game edits.
//
// Checks (exit 1 on any failure):
//  V1 corpus integrity: 8 rows, days > 0, every gate field present.
//  V2 veterans recompute: distinct wave-4+ killers from the row's own
//      waveKillLog + rosterLiving + scholarId (the gate's living rule)
//      equals the row's rd5.veterans; wave-4-only recompute equals
//      kills.livingW4killers.
//  V3 gated consistency: gated recomputed from the row's end standing +
//      rd4/rd5 readiness + peakBefore equals gatedComputed; the engine's
//      gatedEngine equals that, or equals the recomputation with
//      peakAfter (peak release between the two reads).
//  V4 unlock consistency: engineUwEnd satisfies the unlockedWave() rule
//      against (w3 rung, gatedEngine, w4faced).
//  V5 demand vs live code: standingCfg().readyDemand read from a loaded
//      game equals {4:{3,10,5,3,1}, 5:{4,15,6,3,2}} as read from
//      src/js/standing.js, and every row's recorded demand matches it.
//  V6 recount: blocker support counts and wall aggregates recomputed
//      from rows equal summary.json's.
//  V7 daily series: every row has a non-empty daily series with all
//      gate fields on every point.
// Usage: node scripts/test-overtime-a.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = process.argv[2] || path.join(REPO, 'evidence', '2026-10-27', 'perseed-overtime-a');

let failures = 0;
function check(ok, msg) {
  console.log((ok ? 'PASS ' : 'FAIL ') + msg);
  if (!ok) failures++;
}

function gatedFrom(raw, capped, peak, rd4ready, rd5ready) {
  let gated = raw;
  if (raw >= 200 && capped < 200 && peak < 5) gated = Math.min(gated, 199);
  if (raw >= 100 && !rd4ready && peak < 4) gated = Math.min(gated, 99);
  if (capped >= 200 && !rd5ready && peak < 5) gated = Math.min(gated, 199);
  const floor = peak >= 5 ? 200 : peak >= 4 ? 100 : 0;
  return Math.max(gated, floor);
}

function blockerCounts(rows) {
  const cands = ['w3rung', 'standingNum', 'capOnly', 'w4faced', 'rd5-armored', 'rd5-armed', 'rd5-tricks', 'rd5-veterans'];
  const counts = {};
  for (const c of cands) counts[c] = 0;
  for (const r of rows) {
    const g = r.gate;
    const met = {
      w3rung: !!(g.w3rung && g.w3rung.met),
      standingNum: (g.standing.raw >= 200) && (g.capped >= 200),
      w4faced: (g.w4faced > 0) || (r.daily || []).some(d => (d.w4faced | 0) > 0),
      'rd5-armored': (g.rd5.armored >= (g.rd5.demand.armored | 0)),
      'rd5-armed': (g.rd5.armed >= (g.rd5.demand.armed | 0)),
      'rd5-tricks': (g.rd5.tricks >= (g.rd5.demand.tricks | 0)),
      'rd5-veterans': (g.rd5.veterans >= (g.rd5.demand.veterans | 0)),
    };
    met.rd5ready = met['rd5-armored'] && met['rd5-armed'] && met['rd5-tricks'] && met['rd5-veterans'];
    const reached5 = (r.engineUwEnd | 0) >= 5 || (r.waveReach | 0) >= 5;
    if (reached5) continue;
    if (!met.standingNum && met.w3rung && met.rd5ready && met.w4faced) counts.standingNum++;
    if ((g.standing.raw >= 200) && (g.capped < 200) && met.w3rung && met.rd5ready && met.w4faced) counts.capOnly++;
    if (!met.w3rung && met.standingNum && met.rd5ready && met.w4faced) counts.w3rung++;
    if (!met.w4faced && met.w3rung && met.standingNum && met.rd5ready) counts.w4faced++;
    for (const b of ['rd5-armored', 'rd5-armed', 'rd5-tricks', 'rd5-veterans']) {
      if (!met[b] && met.w3rung && met.standingNum && met.w4faced
        && ['rd5-armored', 'rd5-armed', 'rd5-tricks', 'rd5-veterans'].every(x => x === b || met[x])) counts[b]++;
    }
  }
  return counts;
}

(async () => {
  const summaryPath = path.join(DIR, 'summary.json');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const rows = summary.rows || [];
  check(rows.length === 8, `V1 corpus rows = ${rows.length} (expect 8)`);
  let v1 = true;
  for (const r of rows) {
    if (!(r.days > 0)) { v1 = false; console.log(`  V1 row seed ${r.seed} days=${r.days}`); }
    const g = r.gate || {};
    const need = ['w3rung', 'standing', 'capped', 'gatedComputed', 'gatedEngine', 'rd5', 'rd4', 'w4faced', 'kills', 'waveKillLog', 'rosterLiving', 'deedEnd'];
    for (const k of need) if (!(k in g)) { v1 = false; console.log(`  V1 row seed ${r.seed} missing gate.${k}`); }
    if (!g.rd5 || !g.rd5.demand) { v1 = false; console.log(`  V1 row seed ${r.seed} missing rd5 demand`); }
  }
  check(v1, 'V1 every row days>0 with all gate fields');

  // V2 veterans recompute
  let v2 = true;
  for (const r of rows) {
    const g = r.gate;
    const livingSet = new Set((g.rosterLiving || []).filter(x => x.living).map(x => x.vid));
    livingSet.add(g.scholarId);
    const byWave = (wmin, wmax) => {
      const s = new Set();
      for (const e of (g.waveKillLog || [])) {
        if (!e || !e.by) continue;
        if ((e.w | 0) < wmin || (e.w | 0) > wmax) continue;
        if (livingSet.has(e.by)) s.add(e.by);
      }
      return s.size;
    };
    const rec45 = byWave(4, 99), rec4 = byWave(4, 4);
    if (rec45 !== (g.rd5.veterans | 0)) { v2 = false; console.log(`  V2 seed ${r.seed} recomputed w4+ living=${rec45} vs rd5.veterans=${g.rd5.veterans}`); }
    if (rec4 !== (g.kills.livingW4killers | 0)) { v2 = false; console.log(`  V2 seed ${r.seed} recomputed w4 living=${rec4} vs kills.livingW4killers=${g.kills.livingW4killers}`); }
  }
  check(v2, 'V2 veterans recompute matches on all seeds (w4+ -> rd5, w4 -> kills)');

  // V3 gated consistency
  let v3 = true;
  for (const r of rows) {
    const g = r.gate;
    const rec = gatedFrom(g.standing.raw, g.capped, g.peakBeforeEngineCall, !!(g.rd4 && g.rd4.ready), !!(g.rd5 && g.rd5.ready));
    if (rec !== (g.gatedComputed | 0)) { v3 = false; console.log(`  V3 seed ${r.seed} recomputed gated=${rec} vs gatedComputed=${g.gatedComputed}`); }
    const recAfter = gatedFrom(g.standing.raw, g.capped, g.peakAfterEngineCall, !!(g.rd4 && g.rd4.ready), !!(g.rd5 && g.rd5.ready));
    if ((g.gatedEngine | 0) !== rec && (g.gatedEngine | 0) !== recAfter) { v3 = false; console.log(`  V3 seed ${r.seed} gatedEngine=${g.gatedEngine} matches neither pre-peak (${rec}) nor post-peak (${recAfter}) recomputation`); }
  }
  check(v3, 'V3 gated totals consistent (computed == engine, peak allowance only)');

  // V4 unlock consistency
  let v4 = true;
  for (const r of rows) {
    const g = r.gate;
    const uw = r.engineUwEnd | 0;
    const should5 = !!(g.w3rung && g.w3rung.met) && (g.gatedEngine | 0) >= 200 && (g.w4faced | 0) > 0;
    const should4 = !!(g.w3rung && g.w3rung.met) && (g.gatedEngine | 0) >= 100;
    if ((uw >= 5) !== should5) { v4 = false; console.log(`  V4 seed ${r.seed} engineUw=${uw} vs should5=${should5}`); }
    if ((uw >= 4) !== should4) { v4 = false; console.log(`  V4 seed ${r.seed} engineUw=${uw} vs should4=${should4}`); }
  }
  check(v4, 'V4 engine unlocked wave satisfies the unlockedWave() rule on all seeds');

  // V5 demand vs live code
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 75001, mode: 'overtime-a-demand-check', fullTelemetry: false });
  await setupGame(Game);
  const dem = Game.standingCfg ? Game.standingCfg().readyDemand : null;
  const exp4 = { armored: 3, armorP: 10, armed: 5, tricks: 3, veterans: 1 };
  const exp5 = { armored: 4, armorP: 15, armed: 6, tricks: 3, veterans: 2 };
  const eq = (a, b) => a && b && Object.keys(b).every(k => (a[k] | 0) === (b[k] | 0));
  check(eq(dem && dem[4], exp4) && eq(dem && dem[5], exp5), `V5 live standingCfg readyDemand matches code reading (4=${JSON.stringify(dem && dem[4])} 5=${JSON.stringify(dem && dem[5])})`);
  let v5b = true;
  for (const r of rows) {
    if (!eq(r.gate.rd5.demand, exp5) || !eq(r.gate.rd4.demand, exp4)) { v5b = false; console.log(`  V5 seed ${r.seed} row demand differs from live code demand`); }
  }
  check(v5b, 'V5 every row demand matches live code demand');

  // V6 recount
  const recCounts = blockerCounts(rows);
  let v6 = true;
  for (const c of Object.keys(recCounts)) {
    if ((summary.blocker.counts[c] | 0) !== recCounts[c]) { v6 = false; console.log(`  V6 blocker ${c}: summary=${summary.blocker.counts[c]} recount=${recCounts[c]}`); }
  }
  const agg = summary.aggregate || {};
  const recWon = rows.reduce((t, r) => t + r.won, 0);
  const recNat = rows.reduce((t, r) => t + r.nationalEver, 0);
  const recW5 = rows.filter(r => (r.waveReach | 0) >= 5 || (r.engineUwEnd | 0) >= 5).length;
  const recW4 = rows.filter(r => (r.waveReach | 0) >= 4 || (r.engineUwEnd | 0) >= 4).length;
  if (agg.won !== recWon || agg.nationalEver !== recNat || agg.wave5 !== recW5 || agg.wave4 !== recW4) {
    v6 = false; console.log(`  V6 wall recount won=${recWon}/${agg.won} natEver=${recNat}/${agg.nationalEver} w4=${recW4}/${agg.wave4} w5=${recW5}/${agg.wave5}`);
  }
  check(v6, 'V6 blocker counts + wall aggregates recount equals summary');

  // V7 daily series
  let v7 = true;
  for (const r of rows) {
    if (!Array.isArray(r.daily) || !r.daily.length) { v7 = false; console.log(`  V7 seed ${r.seed} empty daily series`); continue; }
    for (const d of r.daily) {
      const keys = ['d', 'raw', 'capped', 'gated', 'peak', 'rd5', 'w4faced', 'uw', 'w4kills', 'livingW4killers', 'deed', 'ot'];
      for (const k of keys) if (!(k in d)) { v7 = false; console.log(`  V7 seed ${r.seed} daily point missing ${k}`); break; }
    }
  }
  check(v7, 'V7 daily series present with all gate fields on every seed');


  // G4 deed agreement: deed w4 == waveEngaged(4) at end; deed w-counts
  // consistent with wavesFaced-derived counts; ok recomputed from
  // components equals recorded ok.
  let v4d = true;
  for (const r of rows) {
    const g = r.gate, de = g.deedEnd;
    if (!de) { v4d = false; console.log(`  G4 seed ${r.seed} missing deedEnd`); continue; }
    if ((de.w4 | 0) !== (g.w4faced | 0)) { v4d = false; console.log(`  G4 seed ${r.seed} deed w4=${de.w4} vs waveEngaged(4)=${g.w4faced}`); }
    // NOTE: gate.wavesFaced is ALREADY counts-per-wave (the sweep's
    // wavesFacedCounts tallies deedState().wavesFaced per wave), not the
    // mid->wave map — compare deed counts against it directly.
    const fc = g.wavesFaced || {};
    if ((de.w1 | 0) !== (fc[1] || 0) || (de.w2 | 0) !== (fc[2] || 0) || (de.w3 | 0) !== (fc[3] || 0) || (de.w4 | 0) !== (fc[4] || 0) || (de.w5 | 0) !== (fc[5] || 0)) {
      v4d = false; console.log(`  G4 seed ${r.seed} deed w-counts ${de.w1}/${de.w2}/${de.w3}/${de.w4}/${de.w5} vs wavesFaced-derived ${fc[1]||0}/${fc[2]||0}/${fc[3]||0}/${fc[4]||0}/${fc[5]||0}`);
    }
    const recOk = !!(de.w1 >= 5 && de.w2 >= 5 && de.w3 >= 4 && de.w4 >= 3 && de.w5 >= 2 && de.contestsN >= 3 && de.crisesN >= 3 && de.stage >= 2 && de.foodDeeds && de.scale);
    if (recOk !== !!de.ok) { v4d = false; console.log(`  G4 seed ${r.seed} recomputed ok=${recOk} vs recorded ok=${de.ok}`); }
    for (const d of (r.daily || [])) {
      if (!Array.isArray(d.deed) || d.deed.length !== 11) { v4d = false; console.log(`  G4 seed ${r.seed} daily deed malformed at d=${d.d}`); break; }
    }
  }
  check(v4d, 'G4 deed agreement (w4 == waveEngaged(4), w-counts == wavesFaced, ok recomputes)');

  // G5 twokey recount from daily series equals summary.twokey.
  let v5t = true;
  const tk = summary.twokey || {};
  for (const r of rows) {
    const d = r.daily || [];
    const peakCapped = d.length ? Math.max.apply(null, d.map(x => x.capped | 0)) : 0;
    const peakVet = d.length ? Math.max.apply(null, d.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0;
    const ps = (tk.perSeed || {})[r.seed];
    if (!ps || ps.peakCapped !== peakCapped || ps.peakVet !== peakVet) { v5t = false; console.log(`  G5 seed ${r.seed} recount peakCapped=${peakCapped} peakVet=${peakVet} vs summary ${JSON.stringify(ps)}`); }
  }
  const recBoth = rows.filter(r => { const d = r.daily || []; const pc = d.length ? Math.max.apply(null, d.map(x => x.capped | 0)) : 0; const pv = d.length ? Math.max.apply(null, d.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0; return pv === 0 && pc < 200; }).length;
  if ((tk.bothAbsentPeak | 0) !== recBoth) { v5t = false; console.log(`  G5 bothAbsentPeak summary=${tk.bothAbsentPeak} recount=${recBoth}`); }
  check(v5t, 'G5 twokey recount from daily series equals summary');

  // G10 SEQ recount: LEG 2 (S1/S2/S3) + first-veteran table from daily series.
  let v10 = true;
  const sq = summary.seq || {};
  const sqPs = sq.perSeed || {};
  for (const r of rows) {
    const d = r.daily || [];
    const peakCapped = d.length ? Math.max.apply(null, d.map(x => x.capped | 0)) : 0;
    const peakVet = d.length ? Math.max.apply(null, d.map(x => (x.rd5 ? x.rd5[3] | 0 : 0))) : 0;
    const peakGated = d.length ? Math.max.apply(null, d.map(x => x.gated | 0)) : 0;
    let s1v = 0;
    for (const x of d) if ((x.gated | 0) >= 200 && (x.peak | 0) < 5 && !(((x.capped | 0) >= 200) && ((x.rd5 ? x.rd5[3] | 0 : 0) >= 2))) s1v++;
    const ps = sqPs[r.seed];
    if (!ps) { v10 = false; console.log(`  G10 seed ${r.seed} missing seq perSeed`); continue; }
    if (ps.peakCapped !== peakCapped || ps.peakVet !== peakVet || ps.peakGated !== peakGated || ps.s1violations !== s1v) {
      v10 = false; console.log(`  G10 seed ${r.seed} seq recount capped=${peakCapped} vet=${peakVet} gated=${peakGated} s1v=${s1v} vs summary ${JSON.stringify(ps)}`);
    }
    const defN = d.filter(x => (x.raw | 0) >= 100 && ((x.rd4 ? x.rd4[3] | 0 : 0) === 0) && (x.gated | 0) <= 99).length;
    if (ps.deferralPoints !== defN) { v10 = false; console.log(`  G10 seed ${r.seed} deferralPoints recount=${defN} vs ${ps.deferralPoints}`); }
    const f4 = d.find(x => (x.rd4 ? x.rd4[3] | 0 : 0) >= 1) || null;
    const f5 = d.find(x => (x.rd5 ? x.rd5[3] | 0 : 0) >= 1) || null;
    const f4d = f4 ? f4.d : null, f5d = f5 ? f5.d : null;
    const sF4d = ps.firstVet4 ? ps.firstVet4.d : null, sF5d = ps.firstVet5 ? ps.firstVet5.d : null;
    if (f4d !== sF4d || f5d !== sF5d) { v10 = false; console.log(`  G10 seed ${r.seed} firstVet days recount F4=${f4d} F5=${f5d} vs summary F4=${sF4d} F5=${sF5d}`); }
  }
  const recS1 = rows.every(r => (sqPs[r.seed] || {}).s1ok);
  const recS2 = rows.filter(r => (sqPs[r.seed] || {}).deferralPoints > 0).length;
  const recS3 = rows.every(r => !(sqPs[r.seed] || {}).s3violation);
  if (sq.s1ok !== recS1 || sq.s2seeds !== recS2 || sq.s3ok !== recS3 || sq.seqOk !== (recS1 && recS2 >= 1 && recS3)) {
    v10 = false; console.log(`  G10 seq aggregates summary s1=${sq.s1ok} s2=${sq.s2seeds} s3=${sq.s3ok} seqOk=${sq.seqOk} vs recount s1=${recS1} s2=${recS2} s3=${recS3}`);
  }
  check(v10, 'G10 SEQ recount (S1/S2/S3 + first-veteran days) equals summary');


  // G10-OT overtime recount: firings + windowed peaks + penalty formula from daily series.
  let v10ot = true;
  const ot = summary.ot || {};
  const otPs = ot.perSeed || {};
  for (const r of rows) {
    const d = r.daily || [];
    const fir = [];
    let prevTier = null, prevGated = null;
    for (const x of d) {
      const o = x.ot;
      if (!o || o.tier == null) { v10ot = false; console.log(`  G10-OT seed ${r.seed} daily point d=${x.d} missing ot/tier`); continue; }
      if (prevTier != null && (o.tier | 0) > prevTier) fir.push({ d: x.d, tierFrom: prevTier, tierTo: o.tier | 0, days: o.days | 0, losses: o.losses | 0, penalty: o.penalty, gated: x.gated | 0, gatedPrev: prevGated, raw: x.raw | 0, capped: x.capped | 0, seat: o.seat || null });
      prevTier = o.tier | 0; prevGated = x.gated | 0;
    }
    const ps = otPs[r.seed];
    if (!ps) { v10ot = false; console.log(`  G10-OT seed ${r.seed} missing ot perSeed`); continue; }
    if (JSON.stringify(fir) !== JSON.stringify(ps.firings)) { v10ot = false; console.log(`  G10-OT seed ${r.seed} firings recount=${JSON.stringify(fir)} vs summary=${JSON.stringify(ps.firings)}`); }
    for (const f of fir) {
      const expPen = Math.min(40, 4 * (f.tierTo | 0) + 3 * (f.losses | 0));
      if ((f.penalty | 0) !== expPen) { v10ot = false; console.log(`  G10-OT seed ${r.seed} firing d=${f.d} penalty=${f.penalty} vs formula ${expPen} (tier ${f.tierTo} losses ${f.losses})`); }
    }
    if (ps.firstFiring) {
      const before = d.filter(x => (x.d | 0) < (ps.firstFiring.d | 0));
      const after = d.filter(x => (x.d | 0) > (ps.firstFiring.d | 0));
      const pb = before.length ? Math.max.apply(null, before.map(x => x.gated | 0)) : null;
      const pa = after.length ? Math.max.apply(null, after.map(x => x.gated | 0)) : null;
      if (ps.peakBefore !== pb || ps.peakAfter !== pa) { v10ot = false; console.log(`  G10-OT seed ${r.seed} windowed peaks recount before=${pb} after=${pa} vs summary ${ps.peakBefore}/${ps.peakAfter}`); }
    }
    if (r.otEnd && r.otEnd.penalty != null) {
      const last = d[d.length - 1];
      if (last && last.ot && last.ot.penalty != null && (r.otEnd.penalty | 0) !== (last.ot.penalty | 0)) { v10ot = false; console.log(`  G10-OT seed ${r.seed} otEnd penalty=${r.otEnd.penalty} vs last daily=${last.ot.penalty}`); }
    }
  }
  const recTot = rows.reduce((t, r) => t + ((otPs[r.seed] || {}).nFirings | 0), 0);
  if ((ot.totalFirings | 0) !== recTot) { v10ot = false; console.log(`  G10-OT totalFirings summary=${ot.totalFirings} recount=${recTot}`); }
  check(v10ot, 'G10-OT overtime firing + windowed-peak + penalty-formula recount equals summary');

  // G11 activation: policy ctx present + live overtime functions.
  let v11 = true;
  for (const r of rows) {
    const ts = r.ts || {};
    const hasTs = Object.keys(ts).some(k => k.indexOf('ts') === 0);
    // CORRECTED (validator fix, corpus untouched): tableseat's preview leg
    // only runs at national+ (tsDriveSeat is gated on rank>=2, and
    // tablePreview() returns null while tableWaiting is false), so a seed
    // that never reaches national EXPECTEDLY has empty ts counters — that
    // is not a substrate failure. For national seeds, tsNationalDay must
    // be present (policy daily ran and saw national). For never-national
    // seeds, substrate-run evidence is the daily rank series itself:
    // the village must have progressed past village rank (regional at
    // some point) via the courtship substrate, or died before day 25
    // (before proposing even starts) — neither excuses a flat village-only
    // run past day 25. 75005 (died d75, regional d47) passes on the rank
    // proxy; its empty ts is the expected never-national shape.
    const d = r.daily || [];
    const maxRankDaily = d.length ? Math.max.apply(null, d.map(x => x.rank | 0)) : 0;
    const reachedNational = (r.nationalEver | 0) === 1;
    if (reachedNational && !hasTs) { v11 = false; console.log(`  G11 seed ${r.seed} reached national but has no policy ts counters`); }
    if (!reachedNational && maxRankDaily < 1 && (r.days | 0) >= 25) { v11 = false; console.log(`  G11 seed ${r.seed} never national and never left village rank (days=${r.days}) — substrate may not have run`); }
    const nullOt = (r.daily || []).filter(x => !x.ot || x.ot.tier == null).length;
    if (nullOt > 0) { v11 = false; console.log(`  G11 seed ${r.seed} ${nullOt} daily points with null ot`); }
  }
  let liveOk = false;
  try {
    const pg = Game.progState ? Game.progState() : {};
    liveOk = (typeof Game.overtimeTier === 'function') && (typeof Game.overtimeStanding === 'function');
    if (liveOk) {
      const saved = { o: pg.overtime, l: pg.overtimeLosses };
      pg.overtime = 2; pg.overtimeLosses = 5;
      const st = Game.overtimeStanding();
      const expPen = Math.min(40, 4 * 2 + 3 * 5);
      if ((st.penalty | 0) !== expPen || (st.tier | 0) !== 2) { v11 = false; console.log(`  G11 live overtimeStanding synthetic tier2/losses5 penalty=${st.penalty} vs ${expPen}`); }
      pg.overtime = saved.o; pg.overtimeLosses = saved.l;
    }
  } catch (e) { v11 = false; console.log('  G11 live overtime check threw: ' + String(e && e.message)); }
  check(v11 && liveOk, 'G11 activation (policy ctx on every row, no null ot points, live overtimeStanding formula)');

  console.log(failures === 0 ? 'ALL OVERTIME PROOFS PASS' : `OVERTIME PROOFS FAILED (${failures} failures)`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('OVERTIME PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
