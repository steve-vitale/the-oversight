#!/usr/bin/env node
// vetrestage-analyze.js — offline analyzer for the sim-vetrestage re-stage
// pilot (axis scale-onramp). PURE offline join over the per-seed JSONs: no
// sims, no RNG, deterministic.
//
// This is the RE-STAGE of sim-vetretention (1215Z metric review: "the bars,
// not the lever, may be wrong"). The mechanism is unchanged (proven 49/49);
// the bars are revised:
//
//   PRIMARY (binding): 14d-window survival share among blooded vids.
//     Blooded vid = distinct waveKillLog `by` vid with w>=4, excluding the
//     run-end scholarVid (scholar-held kills are ~0 per the autopsy; the
//     layer excludes the sitting scholar regardless).
//     Index = FIRST wave-4+ kill day; window = [firstKill, firstKill+14].
//     - incomplete window (firstKill+14 > run gameDays): EXCLUDED.
//     - death inside the window as mantle-holder (death row player or
//       playerRepaired — grounded: owen_smith d82 row has kind villager
//       BUT player=true): CHAIR-CENSORED — excluded from the primary
//       (the layer stands down at the mantle by design, E3g-proven; the
//       chair is the mantlechain DIAG's separate channel), counted in
//       the chair diagnostic.
//     - death inside the window as a fighter: window death (failure).
//     - alive at window close (death after window or no death): survivor.
//     GO = armed survivor-share − control survivor-share >= +0.25
//     AND >=6 evaluable blooded vids per arm (else NO-GO thin).
//     A miss is NO-GO, never re-scored (§14).
//
//   ENGAGEMENT (binding): >=6/8 seeds have >=1 blooded vid receiving a
//     named retention action (shelter/heal/escort/sitout/shield) within
//     14d of a kill day (the vsTrace proves it fired).
//
//   GUARDRAILS: median survival paired diff >= -10d; starvation <=
//     control+2; no new death kinds (>=2-event rule); wall numbers
//     (national/table/wins, wave4/5, median survival) both arms.
//
//   CHAIR DIAGNOSTIC (reported, not judged): per arm — chair-censored
//     count, window deaths as fighter, post-window deaths as
//     mantle-holder, survivors.
//
// Usage: node scripts/vetrestage-analyze.js [--json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.VS_EVID || path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetrestage');
const SEEDS = [65511, 65512, 65513, 65514, 65515, 65516, 65517, 65518];
const POLICIES = ['leadfeast', 'belongfeast'];
const NAMED_ACTIONS = ['shelter', 'heal', 'escort', 'sitout', 'shield'];
const WINDOW = 14;

function load(arm, policy, seed) {
  const tag = `${arm}-${policy}${arm === 'armed' ? '-vetrestage' : ''}-s${seed}.json`;
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

// Per config: blooded vids -> window-survival rows (the revised primary).
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
    // FIX (re-stage analysis): a death INSIDE the window is an observed
    // window outcome even when the run ends before windowClose (e.g.
    // village-lost). Incomplete-window applies ONLY to vids alive at
    // run end whose window extends past it.
    if (death && death.day <= windowClose) {
      // died inside the window — outcome observed.
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

const arms = { control: [], armed: [] };
const engagement = {};
const guard = { control: { surv: [], starv: 0, deaths: {} }, armed: { surv: [], starv: 0, deaths: {} } };
const wall = { control: [], armed: [] };
const pairs = [];
const chair = { control: { censored: 0, windowDeaths: 0, postWindowScholarDeaths: 0 }, armed: { censored: 0, windowDeaths: 0, postWindowScholarDeaths: 0 } };

for (const seed of SEEDS) {
  engagement[seed] = { controlBlooded: 0, armedBlooded: 0, armedEngaged: false };
  for (const policy of POLICIES) {
    const rc = load('control', policy, seed);
    const ra = load('armed', policy, seed);
    const kc = bloodedRows(rc), ka = bloodedRows(ra);
    arms.control.push(...kc);
    arms.armed.push(...ka);
    engagement[seed].controlBlooded += kc.filter(x => x.status !== 'incomplete-window').length;
    engagement[seed].armedBlooded += ka.filter(x => x.status !== 'incomplete-window').length;
    // engagement: named retention action in the trace within 14d of a kill day.
    const killDaysByVid = {};
    for (const e of (ra.waveKillLog || []).filter(x => (x.w | 0) >= 4 && x.by)) {
      const vid = String(e.by);
      killDaysByVid[vid] = killDaysByVid[vid] || [];
      killDaysByVid[vid].push(e.d | 0);
    }
    let engaged = false;
    for (const t of (ra.vsTrace || [])) {
      if (!NAMED_ACTIONS.includes(t.action)) continue;
      const kds = killDaysByVid[String(t.vid || '')] || [];
      if (kds.some(kd => (t.day | 0) - kd >= 0 && (t.day | 0) - kd <= 14)) { engaged = true; break; }
    }
    if (engaged) engagement[seed].armedEngaged = true;
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
const engagedSeeds = SEEDS.filter(s => engagement[s].armedEngaged);
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
    bar: '>=6/8 seeds with a blooded vid receiving a named retention action within 14d post-kill',
    engagedSeeds, n: engagedSeeds.length,
    perSeed: Object.fromEntries(SEEDS.map(s => [s, engagement[s]])),
  },
  guardrails: {
    survivalPairedDiffMedian: survDiffMed, survivalBar: '>= -10d', survivalGo: survGo,
    starvation: { control: guard.control.starv, armed: guard.armed.starv, bar: 'armed <= control+2', go: starvGo },
    newDeathKinds: newKinds, kindsGo,
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
  const f = x => x == null ? 'n/a' : (x * 100).toFixed(1) + '%';
  console.log('=== sim-vetrestage RE-STAGE PILOT ANALYSIS ===');
  console.log(`PRIMARY (14d-window survival): control ${pc.survivors}/${pc.n} (${f(pc.share)}) | armed ${pa.survivors}/${pa.n} (${f(pa.share)}) | delta ${delta == null ? 'n/a' : (delta * 100).toFixed(1) + 'pp'} | bar +25pp & n>=6/arm -> ${primaryGo ? 'GO' : 'NO-GO'}${thin ? ' (THIN)' : ''}`);
  console.log(`CHAIR: control censored=${chair.control.censored} windowDeaths=${chair.control.windowDeaths} postWindowScholarDeaths=${chair.control.postWindowScholarDeaths} | armed censored=${chair.armed.censored} windowDeaths=${chair.armed.windowDeaths} postWindowScholarDeaths=${chair.armed.postWindowScholarDeaths}`);
  console.log(`ENGAGEMENT: ${engagedSeeds.length}/8 seeds (${engagedSeeds.join(',')}) -> ${engagementGo ? 'GO' : 'NO-GO'}`);
  console.log(`GUARDRAIL survival paired-diff median: ${survDiffMed} (bar >=-10) -> ${survGo ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDRAIL starvation: control ${guard.control.starv} vs armed ${guard.armed.starv} (bar <=control+2) -> ${starvGo ? 'PASS' : 'FAIL'}`);
  console.log(`GUARDRAIL new death kinds: ${newKinds.length ? newKinds.join(',') : 'none'} -> ${kindsGo ? 'PASS' : 'FAIL'}`);
  const wc = report.wall.control, wa = report.wall.armed;
  console.log(`WALL control: national ${wc.national}/16 table ${wc.table}/16 won ${wc.won}/16 wave4 ${wc.wave4}/16 wave5 ${wc.wave5}/16 medSurv ${wc.medianSurvival}`);
  console.log(`WALL armed:   national ${wa.national}/16 table ${wa.table}/16 won ${wa.won}/16 wave4 ${wa.wave4}/16 wave5 ${wa.wave5}/16 medSurv ${wa.medianSurvival}`);
}
fs.writeFileSync(path.join(EVID, 'vetrestage-analysis.json'), JSON.stringify(report, null, 1) + '\n');
