#!/usr/bin/env node
// bloodrestraint-analyze.js — offline analyzer for the sim-bloodrestraint
// pilot (axis scale-onramp). PURE offline join over the per-seed JSONs: no
// sims, no RNG, deterministic.
//
// PRE-REGISTERED (§14, written BEFORE any sims):
//   PRIMARY (binding): blooded-vid 14d-window deaths AS MANTLE-HOLDER,
//     summed over configs. Blooded vid = distinct waveKillLog `by` vid
//     with w>=4 (run-end scholar's own kills excluded, the restage
//     convention). Index = FIRST wave-4+ kill day; window =
//     [firstKill, firstKill+14]. Death inside the window with the death
//     row's player flag set (mantle-holder) counts. Incomplete windows
//     (firstKill+14 > run gameDays) with no death are excluded.
//     GO iff armed <= control - 2. A miss is NO-GO, never re-scored.
//   SECONDARY: defer5 2-living-veteran coincidence days (armed > control)
//     — per-day living sets built from kill days + death rows; distinct
//     living veteran vids; wall (national/table/wins/wave4/wave5/median).
//   GUARDRAILS: median survival paired diff >= -10d; succession never
//     deadlocks (no armed village-lost pair-loss attributable to the
//     restraint — every brEvent row must carry a picked id); no new
//     death-cause strings vs control (>=2-event rule); starvation
//     deaths not worse than control (armed <= control+2).
//
// Usage: node scripts/bloodrestraint-analyze.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.BR_EVID || path.join(REPO, 'evidence', '2026-10-24', 'perseed-bloodrestraint');
const SEEDS = [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518];
const POLICIES = ['leadfeast', 'belongfeast'];
const WINDOW = 14;

function load(arm, policy, seed) {
  const tag = `${arm}-${policy}${arm === 'armed' ? '-bloodrestraint' : ''}-s${seed}.json`;
  const fp = path.join(EVID, tag);
  if (!fs.existsSync(fp)) throw new Error('missing sweep file: ' + fp);
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Blooded rows: first-kill index per vid, death join, window-mantle deaths.
function bloodedRows(r) {
  const endScholar = r.scholarVid ? String(r.scholarVid) : null;
  const kills = (r.waveKillLog || []).filter(e => (e.w | 0) >= 4 && e.by);
  const byVid = {};
  for (const e of kills) {
    const vid = String(e.by);
    if (endScholar && vid === endScholar) continue;
    byVid[vid] = byVid[vid] || [];
    byVid[vid].push(e.d | 0);
  }
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
    if (death && death.day >= firstKill && death.day <= windowClose) {
      rows.push({
        vid, seed: r.seed, arm: r.arm, firstKill, windowClose,
        status: death.asScholar ? 'window-mantle-death' : 'window-fighter-death',
        killDays, deathDay: death.day, cause: death.cause,
      });
      continue;
    }
    if (!death && windowClose > endDay) {
      rows.push({ vid, seed: r.seed, arm: r.arm, firstKill, windowClose, status: 'incomplete-window', killDays });
      continue;
    }
    rows.push({ vid, seed: r.seed, arm: r.arm, firstKill, windowClose, status: death ? 'post-window-death' : 'survivor', killDays, deathDay: death ? death.day : null, asScholar: death ? death.asScholar : null });
  }
  return rows;
}

// Defer5 coincidence: per-day distinct LIVING wave-4+ killer vids.
function coincideDays(r) {
  const kills = (r.waveKillLog || []).filter(e => (e.w | 0) >= 4 && e.by);
  const deathDayByVid = {};
  for (const d of (r.deathRows || [])) {
    if (d.kind !== 'villager' || d.real === false) continue;
    const vid = String(d.who || '');
    const day = d.day | 0;
    if (vid && (deathDayByVid[vid] == null || day < deathDayByVid[vid])) deathDayByVid[vid] = day;
  }
  const firstKill = {};
  const maxDay = r.gameDays | 0;
  for (const e of kills) {
    const vid = String(e.by), d = e.d | 0;
    if (firstKill[vid] == null || d < firstKill[vid]) firstKill[vid] = d;
  }
  let days2 = 0;
  const vids = Object.keys(firstKill);
  for (let day = 0; day <= maxDay; day++) {
    let n = 0;
    for (const vid of vids) {
      if (firstKill[vid] <= day && (deathDayByVid[vid] == null || deathDayByVid[vid] > day)) n++;
    }
    if (n >= 2) days2++;
  }
  return { days2, distinctLiving: vids.filter(vid => deathDayByVid[vid] == null || deathDayByVid[vid] > maxDay).length };
}

const arms = { control: [], armed: [] };
const guard = { control: { surv: [], starv: 0, deaths: {}, villageLost: [] }, armed: { surv: [], starv: 0, deaths: {}, villageLost: [] } };
const wall = { control: [], armed: [] };
const pairs = [];
const engage = { control: 0, armed: 0, armedSeeds: [] };
const coinc = { control: 0, armed: 0 };
const distLive = { control: 0, armed: 0 };

for (const seed of SEEDS) {
  for (const policy of POLICIES) {
    const rc = load('control', policy, seed);
    const ra = load('armed', policy, seed);
    const kc = bloodedRows(rc), ka = bloodedRows(ra);
    arms.control.push(...kc);
    arms.armed.push(...ka);
    for (const [armKey, rows, r] of [['control', kc, rc], ['armed', ka, ra]]) {
      guard[armKey].surv.push(r.gameDays | 0);
      const dc = r.deaths || {};
      guard[armKey].starv += (dc.starvation | 0) + (dc.starved | 0);
      for (const [k, n] of Object.entries(dc)) guard[armKey].deaths[k] = (guard[armKey].deaths[k] || 0) + n;
      if (/village-lost|villageLost|lost/i.test(String(r.endReason || ''))) guard[armKey].villageLost.push(`${policy}-s${seed}`);
      const cd = coincideDays(r);
      coinc[armKey] += cd.days2;
      distLive[armKey] += cd.distinctLiving;
      wall[armKey].push({
        seed, policy,
        national: r.national | 0, table: r.table | 0, won: r.won | 0,
        wave4: (r.maxWave | 0) >= 4 ? 1 : 0, wave5: (r.maxWave | 0) >= 5 ? 1 : 0,
        survival: r.gameDays | 0,
      });
    }
    // engagement: restraint fired (brEvents rows) on armed
    engage.armed += (ra.brEvents || []).length;
    engage.control += (rc.brEvents || []).length;
    if ((ra.brEvents || []).length) engage.armedSeeds.push(`${policy}-s${seed}`);
    pairs.push({ seed, policy, controlDays: rc.gameDays | 0, armedDays: ra.gameDays | 0, diff: (ra.gameDays | 0) - (rc.gameDays | 0) });
  }
}

// PRIMARY: window deaths as mantle-holder, summed over configs.
const primaryControl = arms.control.filter(r => r.status === 'window-mantle-death').length;
const primaryArmed = arms.armed.filter(r => r.status === 'window-mantle-death').length;
const primaryGo = primaryArmed <= primaryControl - 2;

// SECONDARY verdicts (reported; not binding).
const secondaryCoincGo = coinc.armed > coinc.control;

// GUARDRAILS
const survDiffMed = median(pairs.map(p => p.diff));
const survGo = survDiffMed != null && survDiffMed >= -10;
const starvGo = guard.armed.starv <= guard.control.starv + 2;
const newKinds = Object.keys(guard.armed.deaths).filter(k => (guard.armed.deaths[k] | 0) >= 2 && !(guard.control.deaths[k] | 0));
const kindsGo = newKinds.length === 0;
// Succession-deadlock guardrail: every brEvent row must carry a picked id;
// an armed village-lost in a pair where control survived is investigated.
const brRowsAllPicked = (() => {
  for (const seed of SEEDS) for (const policy of POLICIES) {
    const ra = load('armed', policy, seed);
    for (const e of (ra.brEvents || [])) { if (!e.picked) return false; }
  }
  return true;
})();
const pairLosses = [];
for (const seed of SEEDS) for (const policy of POLICIES) {
  const rc = load('control', policy, seed), ra = load('armed', policy, seed);
  const cLost = /village-lost|villageLost|lost/i.test(String(rc.endReason || ''));
  const aLost = /village-lost|villageLost|lost/i.test(String(ra.endReason || ''));
  if (aLost && !cLost) pairLosses.push(`${policy}-s${seed}`);
}
const deadlockGo = brRowsAllPicked && pairLosses.length === 0;

function wallAgg(rows) {
  const sum = k => rows.reduce((a, r) => a + r[k], 0);
  return {
    n: rows.length, national: sum('national'), table: sum('table'), won: sum('won'),
    wave4: sum('wave4'), wave5: sum('wave5'),
    medianSurvival: median(rows.map(r => r.survival)),
  };
}

const report = {
  verdict: { primaryGo, secondaryCoincGo, survGo, starvGo, kindsGo, deadlockGo },
  primary: {
    bar: 'armed window-mantle-deaths <= control - 2 (summed over configs)',
    control: primaryControl, armed: primaryArmed,
    go: primaryGo,
  },
  secondary: {
    coincidenceDays: { control: coinc.control, armed: coinc.armed, go: secondaryCoincGo },
    distinctLivingVeterans: { control: distLive.control, armed: distLive.armed },
  },
  engagement: {
    brEventsControl: engage.control, brEventsArmed: engage.armed,
    armedSeeds: engage.armedSeeds,
  },
  guardrails: {
    survivalPairedDiffMedian: survDiffMed, survivalBar: '>= -10d', survivalGo: survGo,
    starvation: { control: guard.control.starv, armed: guard.armed.starv, bar: 'armed <= control+2', go: starvGo },
    newDeathKinds: newKinds, kindsGo,
    deadlock: { brRowsAllPicked, armedPairLosses: pairLosses, deadlockGo },
    pairDiffs: pairs.map(p => p.diff),
  },
  wall: { control: wallAgg(wall.control), armed: wallAgg(wall.armed) },
  bloodedDetail: {
    control: arms.control.map(r => ({ vid: r.vid, seed: r.seed, firstKill: r.firstKill, status: r.status, deathDay: r.deathDay || null })),
    armed: arms.armed.map(r => ({ vid: r.vid, seed: r.seed, firstKill: r.firstKill, status: r.status, deathDay: r.deathDay || null })),
  },
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 1));
} else {
  console.log('=== sim-bloodrestraint PILOT ANALYSIS ===');
  console.log(`PRIMARY (14d-window deaths as mantle-holder, summed): control ${primaryControl} | armed ${primaryArmed} | bar armed <= control-2 -> ${primaryGo ? 'GO' : 'NO-GO'}`);
  console.log(`SECONDARY coincidence days (>=2 living vets): control ${coinc.control} | armed ${coinc.armed} -> ${secondaryCoincGo ? 'armed > control' : 'no gain'}`);
  console.log(`SECONDARY distinct living veterans: control ${distLive.control} | armed ${distLive.armed}`);
  console.log(`ENGAGEMENT brEvents: control ${engage.control} (expect 0) | armed ${engage.armed} on seeds [${engage.armedSeeds.join(',')}]`);
  console.log(`GUARDRAIL survival paired-diff median: ${survDiffMed} (bar >=-10) -> ${survGo ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDRAIL starvation: control ${guard.control.starv} vs armed ${guard.armed.starv} -> ${starvGo ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDRAIL new death kinds: ${newKinds.length ? newKinds.join(',') : 'none'} -> ${kindsGo ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDRAIL deadlock: all brEvents picked=${brRowsAllPicked}, armed pair-losses=[${pairLosses.join(',')}] -> ${deadlockGo ? 'PASS' : 'FAIL'}`);
  const wc = report.wall.control, wa = report.wall.armed;
  console.log(`WALL control: national ${wc.national}/16 table ${wc.table}/16 won ${wc.won}/16 wave4 ${wc.wave4}/16 wave5 ${wc.wave5}/16 medSurv ${wc.medianSurvival}`);
  console.log(`WALL armed:   national ${wa.national}/16 table ${wa.table}/16 won ${wa.won}/16 wave4 ${wa.wave4}/16 wave5 ${wa.wave5}/16 medSurv ${wa.medianSurvival}`);
}
fs.writeFileSync(path.join(EVID, 'bloodrestraint-analysis.json'), JSON.stringify(report, null, 1) + '\n');
