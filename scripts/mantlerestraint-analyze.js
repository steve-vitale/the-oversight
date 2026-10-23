#!/usr/bin/env node
// mantlerestraint-analyze.js — offline analyzer for the sim-mantlerestraint
// arm (axis scale-onramp). PURE offline join over the per-seed JSONs: no
// sims, no RNG, deterministic.
//
// Join conventions REUSED VERBATIM from scripts/vetrestage-analyze.js (the
// re-stage analyzer): blooded vid = distinct waveKillLog `by` vid with
// w>=4, excluding the run-end scholarVid; index = FIRST wave-4+ kill day;
// window = [firstKill, firstKill+14]; death inside the window as
// mantle-holder (death row player or playerRepaired) = CHAIR-CENSORED;
// death inside the window as a fighter = window-death; alive at window
// close = survivor; incomplete-window (alive at run end, window extends
// past endDay) excluded. A death inside the window is an observed outcome
// even when the run ends before windowClose (the re-stage's mid-analysis
// fix). NOTE: the re-stage's own first-kill window is used WITHOUT the
// #844 dedupe — the analyzer joins on recorded kill days; the restraint's
// dedupe only narrows its own candidacy filter.
//
//   PRIMARY (binding): 14d-window survival share among blooded vids
//     (chair-censored + incomplete excluded):
//     GO = armed share − control share >= +0.25 AND >=6 evaluable
//     blooded vids per arm (else NO-GO thin). A miss is NO-GO, never
//     re-scored (§14).
//
//   ENGAGEMENT (binding): >=6/8 seeds have >=1 blooded vid whose
//     succession candidacy was actually skipped (state.mantleRestraintTrace
//     from the armed arm — the restraint's own honesty record).
//
//   GUARDRAILS: median survival paired diff >= -10d; starvation <=
//     control+2; no new death kinds (>=2-event rule); wall numbers
//     (national/table/wins, wave4/5, median survival) both arms.
//
//   SECONDARY (reported): defer5 veterans-bar co-satisfaction — max
//     simultaneous LIVING wave-4+ killers per config, from the offline
//     join (vid blooded by day d and alive at d). Share of configs with
//     >=2 per arm.
//   CHAIR DIAGNOSTIC (reported): per arm — censored, windowDeaths,
//     postWindowScholarDeaths. The restraint should SHRINK the censored
//     set (converting chair deaths into fighter-window outcomes or
//     survivors).
//
// Usage: node scripts/mantlerestraint-analyze.js [--json]
//   EVID override: MR_EVID=<dir>
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.MR_EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-mantlerestraint');
const SEEDS = [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518];
const POLICIES = ['leadfeast', 'belongfeast'];
const WINDOW = 14;

function load(arm, policy, seed) {
  const tag = policy === 'belongfeast' ? 'belongfeast' : 'leadfeast';
  const suffix = arm === 'armed' ? '-mantlerestraint' : '';
  const fp = path.join(EVID, `${arm}-${tag}${suffix}-s${seed}.json`);
  if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Per config: blooded vids -> window-survival rows (re-stage convention).
function bloodedRows(r) {
  const endScholar = r.scholarVid ? String(r.scholarVid) : null;
  const kills = (r.waveKillLog || []).filter(e => (e.w | 0) >= 4 && e.by);
  const byVid = {};
  for (const e of kills) {
    const vid = String(e.by);
    if (endScholar && vid === endScholar) continue; // run-end scholar's own kills
    byVid[vid] = byVid[vid] || [];
    byVid[vid].push(e.d | 0);
  }
  // death join: earliest real villager death row per vid (autopsy method).
  const deathByVid = {};
  for (const d of (r.deathRows || [])) {
    if (d.kind !== 'villager' || d.real === false) continue;
    const vid = String(d.who || '');
    if (!vid) continue;
    const day = d.day | 0;
    if (deathByVid[vid] == null || day < deathByVid[vid].day) {
      deathByVid[vid] = { day, asScholar: !!(d.player || d.playerRepaired), cause: d.cause };
    }
  }
  const endDay = r.gameDays | 0;
  const rows = [];
  for (const vid of Object.keys(byVid)) {
    const killDays = byVid[vid].slice().sort((a, b) => a - b);
    const firstKill = killDays[0];
    const windowClose = firstKill + WINDOW;
    const death = deathByVid[vid] || null;
    if (death && death.day <= windowClose) {
      if (death.asScholar) {
        rows.push({ vid, seed: r.seed, arm: r.arm, firstKill, windowClose, status: 'chair-censored', killDays, deathDay: death.day, cause: death.cause });
      } else {
        rows.push({ vid, seed: r.seed, arm: r.arm, firstKill, windowClose, status: 'window-death', killDays, deathDay: death.day, cause: death.cause });
      }
      continue;
    }
    if (!death && windowClose > endDay) {
      rows.push({ vid, seed: r.seed, arm: r.arm, firstKill, windowClose, status: 'incomplete-window', killDays });
      continue;
    }
    rows.push({
      vid, seed: r.seed, arm: r.arm, firstKill, windowClose, status: 'survivor',
      killDays, deathDay: death ? death.day : null,
      diedAsScholarAfter: death ? death.asScholar : null,
    });
  }
  return rows;
}

// Secondary: max simultaneous LIVING wave-4+ killers (defer5 veterans-bar
// co-satisfaction), offline from waveKillLog + deathRows.
function maxLivingVeterans(r) {
  const bloodDay = {};
  for (const e of (r.waveKillLog || []).filter(x => (x.w | 0) >= 4 && x.by)) {
    const vid = String(e.by);
    const d = e.d | 0;
    if (bloodDay[vid] == null || d < bloodDay[vid]) bloodDay[vid] = d;
  }
  const deathDay = {};
  for (const d of (r.deathRows || [])) {
    if (d.kind !== 'villager' || d.real === false) continue;
    const vid = String(d.who || '');
    const day = d.day | 0;
    if (vid && (deathDay[vid] == null || day < deathDay[vid])) deathDay[vid] = day;
  }
  const endDay = r.gameDays | 0;
  let best = 0;
  for (let d = 0; d <= endDay; d++) {
    let n = 0;
    for (const vid of Object.keys(bloodDay)) {
      if (bloodDay[vid] <= d && (deathDay[vid] == null || deathDay[vid] > d)) n++;
    }
    if (n > best) best = n;
  }
  return best;
}

const arms = { control: [], armed: [] };
const engagement = {};
const guard = { control: { surv: [], starv: 0, deaths: {} }, armed: { surv: [], starv: 0, deaths: {} } };
const wall = { control: [], armed: [] };
const pairs = [];
const chair = { control: { censored: 0, windowDeaths: 0, postWindowScholarDeaths: 0 }, armed: { censored: 0, windowDeaths: 0, postWindowScholarDeaths: 0 } };
const vets = { control: [], armed: [] };

for (const seed of SEEDS) {
  engagement[seed] = { controlBlooded: 0, armedBlooded: 0, armedSkippedSeeds: 0, armedTraceSkips: 0, armedTraceFallbacks: 0 };
  for (const policy of POLICIES) {
    const rc = load('control', policy, seed);
    const ra = load('armed', policy, seed);
    const kc = bloodedRows(rc), ka = bloodedRows(ra);
    arms.control.push(...kc);
    arms.armed.push(...ka);
    engagement[seed].controlBlooded += kc.filter(x => x.status !== 'incomplete-window').length;
    engagement[seed].armedBlooded += ka.filter(x => x.status !== 'incomplete-window').length;
    // engagement: restraint trace entries on the armed arm (a skip happened).
    const tr = ra.mrTrace || [];
    if (tr.length) {
      engagement[seed].armedSkippedSeeds++;
      engagement[seed].armedTraceSkips += tr.filter(t => (t.skipped || []).length).length;
      engagement[seed].armedTraceFallbacks += tr.filter(t => t.fallback).length;
    }
    vets.control.push({ seed, policy, max: maxLivingVeterans(rc) });
    vets.armed.push({ seed, policy, max: maxLivingVeterans(ra) });
    // chair diagnostic + guardrails
    for (const [armKey, rows, r] of [['control', kc, rc], ['armed', ka, ra]]) {
      for (const row of rows) {
        if (row.status === 'chair-censored') chair[armKey].censored++;
        if (row.status === 'window-death') chair[armKey].windowDeaths++;
        if (row.status === 'survivor' && row.diedAsScholarAfter) chair[armKey].postWindowScholarDeaths++;
      }
      guard[armKey].surv.push(r.gameDays | 0);
      const dc = r.deaths || {};
      guard[armKey].starv += (dc.starvation | 0) + (dc.starved | 0);
      for (const [k, n] of Object.entries(dc)) guard[armKey].deaths[k] = (guard[armKey].deaths[k] || 0) + n;
      wall[armKey].push({
        seed, policy,
        national: r.national | 0, table: r.table | 0, won: r.won | 0,
        wave4: (r.maxWave | 0) >= 4 ? 1 : 0, wave5: (r.maxWave | 0) >= 5 ? 1 : 0,
        survival: r.gameDays | 0,
      });
    }
    pairs.push({ seed, policy, controlDays: rc.gameDays | 0, armedDays: ra.gameDays | 0, diff: (ra.gameDays | 0) - (rc.gameDays | 0) });
  }
}

// PRIMARY: 14d-window survival share (chair-censored + incomplete excluded).
function primaryShare(rows) {
  const evalRows = rows.filter(x => x.status === 'survivor' || x.status === 'window-death');
  const surv = evalRows.filter(x => x.status === 'survivor').length;
  return { n: evalRows.length, survivors: surv, share: evalRows.length ? surv / evalRows.length : null };
}
const pc = primaryShare(arms.control), pa = primaryShare(arms.armed);
const thin = pc.n < 6 || pa.n < 6;
const delta = (pc.share != null && pa.share != null) ? pa.share - pc.share : null;
const primaryGo = !thin && delta != null && delta >= 0.25;

// ENGAGEMENT
const engagedSeeds = SEEDS.filter(s => engagement[s].armedSkippedSeeds > 0);
const engagementGo = engagedSeeds.length >= 6;

// GUARDRAILS
const survDiffMed = median(pairs.map(p => p.diff));
const survGo = survDiffMed != null && survDiffMed >= -10;
const starvGo = guard.armed.starv <= guard.control.starv + 2;
const newKinds = Object.keys(guard.armed.deaths).filter(k => (guard.armed.deaths[k] | 0) >= 2 && !(guard.control.deaths[k] | 0));
const kindsGo = newKinds.length === 0;

function wallAgg(rows) {
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  return {
    n: rows.length, national: sum('national'), table: sum('table'), won: sum('won'),
    wave4: sum('wave4'), wave5: sum('wave5'),
    medianSurvival: median(rows.map(r => r.survival)),
  };
}

const report = {
  verdict: { primaryGo, engagementGo, survGo, starvGo, kindsGo, thin },
  primary: {
    control: pc, armed: pa, delta,
    bar: 'armed share − control share >= +0.25 AND >=6 evaluable blooded vids per arm',
  },
  chairDiagnostic: chair,
  engagement: {
    bar: '>=6/8 seeds with >=1 blooded vid whose succession candidacy was actually skipped (mrTrace)',
    engagedSeeds, n: engagedSeeds.length,
    perSeed: Object.fromEntries(SEEDS.map(s => [s, engagement[s]])),
  },
  veteransCoSatisfaction: {
    note: 'max simultaneous LIVING wave-4+ killers per config (defer5 veterans-bar shape), offline join',
    control: vets.control, armed: vets.armed,
    controlGe2: vets.control.filter(x => x.max >= 2).length,
    armedGe2: vets.armed.filter(x => x.max >= 2).length,
  },
  guardrails: {
    survivalPairedDiffMedian: survDiffMed, survivalBar: '>= -10d', survivalGo: survGo,
    starvation: { control: guard.control.starv, armed: guard.armed.starv, bar: 'armed <= control+2', go: starvGo },
    newDeathKinds: newKinds, kindsGo,
    pairedDiffs: pairs,
  },
  wall: { control: wallAgg(wall.control), armed: wallAgg(wall.armed) },
  metricBinding: 'a miss is NO-GO, never re-scored mid-run (§14)',
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 1));
} else {
  console.log('=== MANTLERESTRAINT ANALYZER ===');
  console.log(`PRIMARY: control ${pc.survivors}/${pc.n} = ${pc.share == null ? 'n/a' : (pc.share * 100).toFixed(1) + '%'} | armed ${pa.survivors}/${pa.n} = ${pa.share == null ? 'n/a' : (pa.share * 100).toFixed(1) + '%'} | delta ${delta == null ? 'n/a' : (delta * 100).toFixed(1) + 'pp'} | thin=${thin} | GO=${primaryGo}`);
  console.log(`ENGAGEMENT: ${engagedSeeds.length}/8 seeds (bar >=6) | GO=${engagementGo} | seeds: ${engagedSeeds.join(',') || 'none'}`);
  console.log(`CHAIR: control censored=${chair.control.censored} windowDeaths=${chair.control.windowDeaths} postWinScholar=${chair.control.postWindowScholarDeaths} | armed censored=${chair.armed.censored} windowDeaths=${chair.armed.windowDeaths} postWinScholar=${chair.armed.postWindowScholarDeaths}`);
  console.log(`VETS co-sat(>=2): control ${report.veteransCoSatisfaction.controlGe2}/16 | armed ${report.veteransCoSatisfaction.armedGe2}/16`);
  console.log(`GUARDRAILS: survDiffMed=${survDiffMed}d (go=${survGo}) starv c=${guard.control.starv} a=${guard.armed.starv} (go=${starvGo}) newKinds=[${newKinds.join(',')}] (go=${kindsGo})`);
  const wc = report.wall.control, wa = report.wall.armed;
  console.log(`WALL control: national ${wc.national}/16 table ${wc.table}/16 wins ${wc.won}/16 wave4 ${wc.wave4}/16 wave5 ${wc.wave5}/16 medSurv ${wc.medianSurvival}`);
  console.log(`WALL armed:   national ${wa.national}/16 table ${wa.table}/16 wins ${wa.won}/16 wave4 ${wa.wave4}/16 wave5 ${wa.wave5}/16 medSurv ${wa.medianSurvival}`);
  console.log(`VERDICT: primaryGo=${primaryGo} engagementGo=${engagementGo}`);
}
