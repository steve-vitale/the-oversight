// analyze-dawnchoke-a.js — LEVER analyzer, arm sim-dawnchoke-a
// Reads the dawnchoke-driver-a.js corpora (two legs: ctl on old code,
// arm on new code) and judges the frozen bars in the sim-dawnchoke-a
// prereg §6: PRIMARY wave-4+ departure attempts (armed >= ctl + 4)
// AND at least one control-STUCK staged plan actually departs on
// the armed leg; GUARDRAILS starvation + median survival; plus the
// det-gate (bound: first arm-leg release row — a depart call for a
// forager/homebody-profile holder with a staged wave-4+ plan and no
// party_launch commit today) and the zero-attempt rule.
// Also emits the DIAG tables from the control leg alone
// (--diag-only): choke rate by holder occupation and plan shape,
// and the sub-choke breakdown (no companion at dawn / companions
// present but none ranging / commit written but part-3 deferred /
// commit written but tick skipped otherwise).
// Usage:
//   node scripts/analyze-dawnchoke-a.js --ctl <ctl-dir> --arm <arm-dir> --out <file>
//     [--seeds 107423,...] [--ctl-brain <sha> --arm-brain <sha>]
//   node scripts/analyze-dawnchoke-a.js --diag-only --ctl <ctl-dir> [--seeds ...]
//   node scripts/analyze-dawnchoke-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');

// Wave-4+ id set (frozen list from src/data/monsters.json —
// re-read live so the analyzer refuses a stale roster silently).
const W4P_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald',
  'cancellation', 'editor', 'rerun', 'spoiler', 'timeslot', 'nielsen', 'finale', 'network_note'];
function loadWave4pIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4P_IDS_FROZEN.slice().sort(); }
}
const W4P_SET = new Set(loadWave4pIds());
const STAGED = ['party', 'hunt', 'standing', 'table'];
function isW4Plan(target, needWave) {
  return ((needWave | 0) >= 4) || (target != null && W4P_SET.has(target));
}
function isStagedW4(plan) {
  return !!plan && STAGED.indexOf(plan.stage) !== -1 && isW4Plan(plan.target, plan.needWave);
}
function isTargetlessHunt(plan) {
  return !!plan && plan.stage === 'hunt' && plan.target == null && plan.needWave == null;
}
function isStarvationDeath(d) {
  return !!d && (/starv|hunger/i.test(String(d.kind || '')) || /starv|hunger/i.test(String(d.cause || '')));
}
function median(xs) {
  const s = (xs || []).slice().sort(function (a, b) { return a - b; });
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Streams compared by the det-gate: every recorded event row with a
// day, on both legs, must be identical before the armed leg's first
// release row on that seed. departCalls / scorePicks / planCensus /
// dawnPool are the choke instrument; the rest are the needwave
// streams carried over unchanged.
const DET_STREAMS = ['departCalls', 'scorePicks', 'v4departs', 'planSeeds', 'v4fights',
  'volleyEvents', 'prizeEvents', 'grantEvents', 'contestEvents', 'deaths',
  'planCensus', 'dawnPool', 'needWaveCopies', 'departBeats', 'reseedBeats', 'beatLines'];

function isReleaseRow(r) {
  return !!r && r.source === 'brain' && STAGED.indexOf(r.planStage) !== -1 &&
    isW4Plan(r.planTarget, r.planNeedWave) &&
    (r.profile === 'forager' || r.profile === 'homebody') &&
    r.commitWinPlanAction !== 'party_launch';
}

function analyzeSeed(out) {
  const seed = out.seed;
  const errors = (out.instrumentErrors || []).length;
  const calls = (out.departCalls || []).slice();
  const brainCalls = calls.filter(function (r) { return r.source === 'brain'; });
  const wpCalls = calls.filter(function (r) { return r.source === 'winPlanDepart'; });
  const attempts = brainCalls.filter(function (r) { return isW4Plan(r.planTarget, r.planNeedWave); });
  const launches = attempts.filter(function (r) { return r.result === 'launch'; });
  const holds = attempts.filter(function (r) { return r.result === 'hold'; });
  const normals = attempts.filter(function (r) { return r.result === 'normal'; });
  const wpAttempts = wpCalls.filter(function (r) { return isW4Plan(r.planTarget, r.planNeedWave); });
  // First release day (det-gate bound): earliest release row.
  let firstReleaseDay = null;
  for (const r of brainCalls) {
    if (isReleaseRow(r) && (firstReleaseDay == null || r.day < firstReleaseDay)) firstReleaseDay = r.day;
  }
  const ctlReleaseRows = brainCalls.filter(isReleaseRow).length;
  // ---- Choke census: staged-plan days from planCensus ----
  // A staged-plan day is a census row for a living, at-Haven,
  // not-on-expedition holder of a staged wave-4+ plan OR a
  // targetless-hunt plan. It is a CHOKE day when no departCalls
  // row (either source) exists for that holder that day.
  const callDaysByVid = {};
  for (const r of calls) {
    if (!callDaysByVid[r.vid]) callDaysByVid[r.vid] = {};
    callDaysByVid[r.vid][r.day] = true;
  }
  const scoreByVidDay = {};
  for (const s of (out.scorePicks || [])) {
    const k = s.vid + '|' + s.day;
    if (!scoreByVidDay[k]) scoreByVidDay[k] = [];
    scoreByVidDay[k].push(s);
  }
  const poolByDay = {};
  for (const p of (out.dawnPool || [])) poolByDay[p.day] = p;
  let stagedDays = 0, chokeDays = 0;
  const byOcc = {}; // occupation -> {staged, choke}
  const byShape = {}; // 'targeted-w4' | 'targetless-hunt' -> {staged, choke}
  const byProfile = {}; // range profile -> {staged, choke}
  const subChoke = {}; // sub-choke class -> count (choke days only)
  const stagedDaysByVid = {}; // vid -> Set of days (wave-4+ staged only)
  const stagedSpanByVid = {}; // vid -> {min, max, n}
  for (const row of (out.planCensus || [])) {
    const a = row.attrs || {};
    if (a.dead || !a.atHaven || a.onExped) continue;
    const plan = a.plan;
    if (!plan) continue;
    const shape = isStagedW4(plan) ? 'targeted-w4'
      : (isTargetlessHunt(plan) ? 'targetless-hunt' : null);
    if (!shape) continue;
    const vid = row.vid, day = row.day;
    stagedDays++;
    const hadCall = !!(callDaysByVid[vid] && callDaysByVid[vid][day]);
    if (!hadCall) chokeDays++;
    const occ = a.occupation || 'unknown';
    if (!byOcc[occ]) byOcc[occ] = { staged: 0, choke: 0 };
    byOcc[occ].staged++;
    if (!hadCall) byOcc[occ].choke++;
    if (!byShape[shape]) byShape[shape] = { staged: 0, choke: 0 };
    byShape[shape].staged++;
    if (!hadCall) byShape[shape].choke++;
    const prof = a.profile || 'unknown';
    if (!byProfile[prof]) byProfile[prof] = { staged: 0, choke: 0 };
    byProfile[prof].staged++;
    if (!hadCall) byProfile[prof].choke++;
    if (shape === 'targeted-w4') {
      if (!stagedDaysByVid[vid]) stagedDaysByVid[vid] = {};
      stagedDaysByVid[vid][day] = true;
      if (!stagedSpanByVid[vid]) stagedSpanByVid[vid] = { min: day, max: day, n: 0 };
      const sp = stagedSpanByVid[vid];
      if (day < sp.min) sp.min = day;
      if (day > sp.max) sp.max = day;
      sp.n++;
    }
    if (!hadCall) {
      // Sub-choke classification from the day's scorePicks rows.
      const rows = scoreByVidDay[vid + '|' + day] || [];
      let cls;
      const plRows = rows.filter(function (r) { return r.winPlanAction === 'party_launch'; });
      if (plRows.length) {
        const def = plRows.some(function (r) { return r.deferred === 'party_launch:no-tick-exact'; });
        cls = def ? 'commit-written-part3-deferred' : 'commit-written-no-depart';
      } else if (rows.length) {
        // Latest scoring of the day decides what the holder did.
        const last = rows.slice().sort(function (x, y) { return (x.part - y.part) || 0; }).pop();
        if (last.winPlanAction === 'gear_hold') cls = 'stage-gear-hold';
        else if (last.winPlanAction === 'party_wait') cls = 'party-wait-no-companion';
        else if (last.winPlanAction) cls = 'bid-other-winplan:' + last.winPlanAction;
        else cls = 'bid-lost:' + (last.override || last.pickKind || 'none');
      } else {
        cls = 'never-scored';
      }
      subChoke[cls] = (subChoke[cls] || 0) + 1;
      // Cross-tab: eligible companions that day (0 vs >0).
      const pool = poolByDay[day];
      const elig = pool ? (pool.eligibleCompanions | 0) : null;
      const ekey = cls + '|elig' + (elig === 0 ? '=0' : (elig > 0 ? '>0' : '?'));
      subChoke[ekey] = (subChoke[ekey] || 0) + 1;
    }
  }
  // STUCK plans (control definition): wave-4+ staged on >= 7 distinct
  // census days with ZERO departCalls rows for that vid all run.
  const stuck = [];
  for (const vid of Object.keys(stagedDaysByVid)) {
    const days = Object.keys(stagedDaysByVid[vid]).length;
    const sp = stagedSpanByVid[vid];
    const hadAnyCall = !!(callDaysByVid[vid] && Object.keys(callDaysByVid[vid]).length);
    if (days >= 7 && !hadAnyCall) {
      stuck.push({ vid: vid, stagedDays: days, spanDays: (sp.max - sp.min + 1), firstDay: sp.min, lastDay: sp.max });
    }
  }
  // Deaths.
  const deaths = (out.deaths || []).slice();
  const starv = deaths.filter(isStarvationDeath);
  const kindStrings = {};
  for (const d of deaths) {
    const k = String((d.kind || '') + '/' + (d.cause || ''));
    kindStrings[k] = (kindStrings[k] || 0) + 1;
  }
  // Launches detail (wave-4+ attempts that launched).
  const launchDetail = launches.map(function (r) {
    return { seed: seed, day: r.day, part: r.part, vid: r.vid, source: r.source,
      target: r.planTarget || null, needWave: (r.planNeedWave != null ? (r.planNeedWave | 0) : null),
      stage: r.planStage || null, profile: r.profile || null, occupation: r.occupation || null,
      commitWinPlanAction: r.commitWinPlanAction || null };
  });
  return {
    seed: seed, mode: out.mode || out.leg || null,
    anchorCommit: out.anchorCommit || null,
    brainSha: out.brainSha || null, winplanSha: out.winplanSha || null,
    errors: errors, sayWrap: !!out.sayWrap,
    days: out.days, gameDays: out.gameDays,
    endReason: out.endReason || null, won: !!out.won,
    villageLost: !!out.villageLost, maxWave: out.maxWave,
    unlockedWave: out.unlockedWave, standing: out.standing,
    scaleRank: out.scaleRank || null,
    deaths: deaths.length, starvDeaths: starv.length,
    kindStrings: kindStrings,
    attempts: attempts.length, launchesN: launches.length,
    holds: holds.length, normals: normals.length,
    wpAttempts: wpAttempts.length,
    wpCalls: wpCalls.length, brainCalls: brainCalls.length,
    firstReleaseDay: firstReleaseDay, ctlReleaseRows: ctlReleaseRows,
    launchDetail: launchDetail,
    stagedDays: stagedDays, chokeDays: chokeDays,
    chokeRate: stagedDays ? chokeDays / stagedDays : null,
    byOcc: byOcc, byShape: byShape, byProfile: byProfile,
    subChoke: subChoke,
    stuck: stuck,
    beatLines: (out.beatLines || []).slice(),
    raw: out,
  };
}

function loadLeg(dir, mode, seeds) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, 'dawnchoke-a-s' + seed + '-dawnchoke-a-' + mode + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push(analyzeSeed(JSON.parse(fs.readFileSync(fp, 'utf8'))));
  }
  return rows;
}

function detGateForSeed(ctlRow, armRow) {
  const bound = armRow.firstReleaseDay;
  const detail = { seed: ctlRow.seed, bound: bound, mismatches: [] };
  if (ctlRow.ctlReleaseRows !== 0) {
    detail.mismatches.push('ctl leg recorded ' + ctlRow.ctlReleaseRows + ' first-release rows (must be 0)');
  }
  for (const stream of DET_STREAMS) {
    const cRows = (ctlRow.raw[stream] || []).filter(function (r) { return bound == null || (r.day | 0) < bound; });
    const aRows = (armRow.raw[stream] || []).filter(function (r) { return bound == null || (r.day | 0) < bound; });
    if (JSON.stringify(cRows) !== JSON.stringify(aRows)) {
      detail.mismatches.push(stream + ': pre-bound rows differ (' + cRows.length + ' ctl vs ' + aRows.length + ' arm)');
    }
  }
  detail.pass = detail.mismatches.length === 0;
  return detail;
}

function analyze(ctlRows, armRows, opts) {
  opts = opts || {};
  const seeds = ctlRows.map(function (r) { return r.seed; });
  const sum = function (rows, f) { return rows.reduce(function (a, r) { return a + (f(r) || 0); }, 0); };
  const ctlAttempts = sum(ctlRows, function (r) { return r.attempts; });
  const armAttempts = sum(armRows, function (r) { return r.attempts; });
  const ctlLaunches = sum(ctlRows, function (r) { return r.launchesN; });
  const armLaunches = sum(armRows, function (r) { return r.launchesN; });
  const ctlStarv = sum(ctlRows, function (r) { return r.starvDeaths; });
  const armStarv = sum(armRows, function (r) { return r.starvDeaths; });
  const ctlMed = median(ctlRows.map(function (r) { return r.gameDays; }));
  const armMed = median(armRows.map(function (r) { return r.gameDays; }));
  const ctlErr = sum(ctlRows, function (r) { return r.errors; });
  const armErr = sum(armRows, function (r) { return r.errors; });
  // Anchor check: when the expected shas are supplied, each leg's
  // files must carry them; otherwise the leg side is unverified.
  const anchorChecks = [];
  function checkSha(rows, field, expected, label) {
    if (expected == null) { anchorChecks.push({ label: label, checked: false }); return; }
    const bad = rows.filter(function (r) { return r[field] !== expected; });
    anchorChecks.push({ label: label, checked: true,
      pass: bad.length === 0, badSeeds: bad.map(function (r) { return r.seed; }) });
  }
  checkSha(ctlRows, 'brainSha', opts.ctlBrain, 'ctl villager-brain.js');
  checkSha(armRows, 'brainSha', opts.armBrain, 'arm villager-brain.js');
  const anchorPass = anchorChecks.every(function (c) { return !c.checked || c.pass; });
  // Per-seed starvation excess (arm minus ctl).
  const starvExcess = [];
  for (let i = 0; i < ctlRows.length; i++) {
    starvExcess.push({ seed: ctlRows[i].seed,
      ctl: ctlRows[i].starvDeaths, arm: armRows[i].starvDeaths,
      excess: armRows[i].starvDeaths - ctlRows[i].starvDeaths });
  }
  const maxExcess = starvExcess.reduce(function (a, r) { return Math.max(a, r.excess); }, -Infinity);
  // Det-gate per seed.
  const det = [];
  for (let i = 0; i < ctlRows.length; i++) det.push(detGateForSeed(ctlRows[i], armRows[i]));
  const detPass = det.every(function (d) { return d.pass; });
  // Stuck plans: control-STUCK (seed, vid) that actually depart on arm.
  const ctlStuckKeys = {};
  for (const r of ctlRows) {
    for (const s of (r.stuck || [])) ctlStuckKeys[r.seed + '|' + s.vid] = s;
  }
  const stuckDeparted = [];
  for (const r of armRows) {
    for (const l of (r.launchDetail || [])) {
      const key = r.seed + '|' + l.vid;
      if (ctlStuckKeys[key] && stuckDeparted.indexOf(key) === -1) stuckDeparted.push(key);
    }
  }
  // Wall numbers.
  const wall = function (rows) {
    return { wins: sum(rows, function (r) { return r.won ? 1 : 0 }),
      national: sum(rows, function (r) { return r.scaleRank === 'national' ? 1 : 0 }),
      wave5: sum(rows, function (r) { return (r.maxWave | 0) >= 5 ? 1 : 0 }),
      wave4: sum(rows, function (r) { return (r.maxWave | 0) >= 4 ? 1 : 0 }),
      medianSurvival: median(rows.map(function (r) { return r.gameDays; })),
      maxSurvival: Math.max.apply(null, rows.map(function (r) { return r.gameDays; })),
      villagesLost: sum(rows, function (r) { return r.villageLost ? 1 : 0 }) };
  };
  const bars = {};
  bars.instrument = (ctlErr === 0 && armErr === 0);
  bars.detGate = detPass;
  bars.anchor = anchorPass;
  const zeroAttempt = (ctlAttempts < 5 && armAttempts < 5);
  bars.primaryAttempts = (armAttempts >= ctlAttempts + 4);
  bars.primaryStuckDeparts = (stuckDeparted.length >= 1);
  bars.starvTotal = (armStarv <= ctlStarv + 2);
  bars.starvPerSeed = (maxExcess <= 2);
  bars.survival = (ctlMed != null && armMed != null) && (armMed >= 0.8 * ctlMed);
  let verdict = 'NO-GO';
  if (zeroAttempt) verdict = 'INCONCLUSIVE';
  else if (bars.instrument && bars.detGate && bars.anchor && bars.primaryAttempts &&
    bars.primaryStuckDeparts && bars.starvTotal && bars.starvPerSeed && bars.survival) verdict = 'GO';
  // Choke totals (control leg, the DIAG).
  function chokeTotals(rows) {
    const tot = { staged: 0, choke: 0, byOcc: {}, byShape: {}, byProfile: {}, subChoke: {} };
    for (const r of rows) {
      tot.staged += r.stagedDays; tot.choke += r.chokeDays;
      for (const k of Object.keys(r.byOcc || {})) {
        if (!tot.byOcc[k]) tot.byOcc[k] = { staged: 0, choke: 0 };
        tot.byOcc[k].staged += r.byOcc[k].staged; tot.byOcc[k].choke += r.byOcc[k].choke;
      }
      for (const k of Object.keys(r.byShape || {})) {
        if (!tot.byShape[k]) tot.byShape[k] = { staged: 0, choke: 0 };
        tot.byShape[k].staged += r.byShape[k].staged; tot.byShape[k].choke += r.byShape[k].choke;
      }
      for (const k of Object.keys(r.byProfile || {})) {
        if (!tot.byProfile[k]) tot.byProfile[k] = { staged: 0, choke: 0 };
        tot.byProfile[k].staged += r.byProfile[k].staged; tot.byProfile[k].choke += r.byProfile[k].choke;
      }
      for (const k of Object.keys(r.subChoke || {})) tot.subChoke[k] = (tot.subChoke[k] || 0) + r.subChoke[k];
    }
    tot.chokeRate = tot.staged ? tot.choke / tot.staged : null;
    return tot;
  }
  const ctlChoke = chokeTotals(ctlRows);
  const armChoke = chokeTotals(armRows);
  return {
    verdict: verdict, zeroAttempt: zeroAttempt,
    seeds: seeds,
    ctl: { attempts: ctlAttempts, launches: ctlLaunches,
      starvDeaths: ctlStarv, medianSurvival: ctlMed,
      instrumentErrors: ctlErr, wall: wall(ctlRows),
      choke: ctlChoke,
      stuck: ctlRows.reduce(function (a, r) { return a.concat((r.stuck || []).map(function (s) { return { seed: r.seed, vid: s.vid, stagedDays: s.stagedDays, spanDays: s.spanDays, firstDay: s.firstDay, lastDay: s.lastDay }; })); }, []),
      perSeed: ctlRows.map(function (r) { return { seed: r.seed, gameDays: r.gameDays,
        attempts: r.attempts, launches: r.launchesN, holds: r.holds, normals: r.normals,
        wpAttempts: r.wpAttempts, starvDeaths: r.starvDeaths, deaths: r.deaths,
        stagedDays: r.stagedDays, chokeDays: r.chokeDays, chokeRate: r.chokeRate,
        firstReleaseDay: r.firstReleaseDay, errors: r.errors }; }) },
    arm: { attempts: armAttempts, launches: armLaunches,
      starvDeaths: armStarv, medianSurvival: armMed,
      instrumentErrors: armErr, wall: wall(armRows),
      choke: armChoke,
      perSeed: armRows.map(function (r) { return { seed: r.seed, gameDays: r.gameDays,
        attempts: r.attempts, launches: r.launchesN, holds: r.holds, normals: r.normals,
        wpAttempts: r.wpAttempts, starvDeaths: r.starvDeaths, deaths: r.deaths,
        stagedDays: r.stagedDays, chokeDays: r.chokeDays, chokeRate: r.chokeRate,
        firstReleaseDay: r.firstReleaseDay, errors: r.errors }; }) },
    stuckDeparted: stuckDeparted,
    ctlStuckCount: Object.keys(ctlStuckKeys).length,
    starvExcess: starvExcess, maxStarvExcess: maxExcess,
    det: det, detPass: detPass, anchorChecks: anchorChecks,
    bars: bars,
    ctlLaunchDetail: ctlRows.reduce(function (a, r) { return a.concat(r.launchDetail); }, []),
    armLaunchDetail: armRows.reduce(function (a, r) { return a.concat(r.launchDetail); }, []),
    kindStrings: (function () {
      const k = {};
      for (const r of ctlRows.concat(armRows)) {
        for (const key of Object.keys(r.kindStrings || {})) k[key] = (k[key] || 0) + (r.kindStrings[key] || 0);
      }
      return k;
    })(),
    armBeatLines: armRows.reduce(function (a, r) { return a.concat(r.beatLines.map(function (b) { return { seed: r.seed, day: b.day, text: b.text }; })); }, []),
    ctlBeatLines: ctlRows.reduce(function (a, r) { return a.concat(r.beatLines.map(function (b) { return { seed: r.seed, day: b.day, text: b.text }; })); }, []),
  };
}

function diagOnly(ctlRows) {
  const sum = function (rows, f) { return rows.reduce(function (a, r) { return a + (f(r) || 0); }, 0); };
  const tot = { staged: 0, choke: 0, byOcc: {}, byShape: {}, byProfile: {}, subChoke: {} };
  for (const r of ctlRows) {
    tot.staged += r.stagedDays; tot.choke += r.chokeDays;
    for (const k of Object.keys(r.byOcc || {})) {
      if (!tot.byOcc[k]) tot.byOcc[k] = { staged: 0, choke: 0 };
      tot.byOcc[k].staged += r.byOcc[k].staged; tot.byOcc[k].choke += r.byOcc[k].choke;
    }
    for (const k of Object.keys(r.byShape || {})) {
      if (!tot.byShape[k]) tot.byShape[k] = { staged: 0, choke: 0 };
      tot.byShape[k].staged += r.byShape[k].staged; tot.byShape[k].choke += r.byShape[k].choke;
    }
    for (const k of Object.keys(r.byProfile || {})) {
      if (!tot.byProfile[k]) tot.byProfile[k] = { staged: 0, choke: 0 };
      tot.byProfile[k].staged += r.byProfile[k].staged; tot.byProfile[k].choke += r.byProfile[k].choke;
    }
    for (const k of Object.keys(r.subChoke || {})) tot.subChoke[k] = (tot.subChoke[k] || 0) + r.subChoke[k];
  }
  return {
    mode: 'diag-only',
    seeds: ctlRows.map(function (r) { return r.seed; }),
    attempts: sum(ctlRows, function (r) { return r.attempts; }),
    launches: sum(ctlRows, function (r) { return r.launchesN; }),
    holds: sum(ctlRows, function (r) { return r.holds; }),
    normals: sum(ctlRows, function (r) { return r.normals; }),
    wpAttempts: sum(ctlRows, function (r) { return r.wpAttempts; }),
    stagedDays: tot.staged, chokeDays: tot.choke,
    chokeRate: tot.staged ? tot.choke / tot.staged : null,
    byOcc: tot.byOcc, byShape: tot.byShape, byProfile: tot.byProfile,
    subChoke: tot.subChoke,
    stuck: ctlRows.reduce(function (a, r) { return a.concat((r.stuck || []).map(function (s) { return { seed: r.seed, vid: s.vid, stagedDays: s.stagedDays, spanDays: s.spanDays, firstDay: s.firstDay, lastDay: s.lastDay }; })); }, []),
    perSeed: ctlRows.map(function (r) { return { seed: r.seed, gameDays: r.gameDays,
      attempts: r.attempts, launches: r.launchesN, stagedDays: r.stagedDays,
      chokeDays: r.chokeDays, chokeRate: r.chokeRate, stuckN: (r.stuck || []).length,
      starvDeaths: r.starvDeaths, deaths: r.deaths, errors: r.errors }; }),
  };
}

function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond) {
    if (cond) { pass++; } else { fail++; console.log('SELFTEST FAIL: ' + name); }
  }
  function seedOut(o) {
    return Object.assign({ seed: 107423, mode: 'ctl', anchorCommit: 'abc',
      winplanSha: 'wp1', brainSha: 'br1', instrumentErrors: [],
      days: 150, gameDays: 150, endReason: 'survived', won: false,
      villageLost: false, maxWave: 5, unlockedWave: 5, standing: 300,
      scaleRank: 'regional', deaths: [], samples: null, v4gunLoc: [],
      contestEvents: [], prizeEvents: [], grantEvents: [],
      corpseTakeEvents: [], killLootEvents: [], volleyEvents: [],
      v4departs: [], v4fights: [], planSeeds: [], planCensus: [],
      needWaveCopies: [], departBeats: [], reseedBeats: [], beatLines: [],
      departCalls: [], scorePicks: [], dawnPool: [],
      sayWrap: true }, o || {});
  }
  function censusRow(day, vid, attrs) {
    return { day: day, vid: vid, attrs: Object.assign({ dead: false, atHaven: true, onExped: false,
      profile: 'forager', occupation: 'forager',
      plan: { stage: 'party', target: 'congregation', needWave: 4, party: [] } }, attrs || {}) };
  }
  function call(day, vid, o) {
    return Object.assign({ day: day, part: 0, vid: vid, source: 'brain',
      commitWinPlanAction: 'party_launch', commitKind: 'EXPEDITION', result: 'launch',
      planStage: 'party', planTarget: 'congregation', planNeedWave: 4,
      profile: 'forager', occupation: 'forager' }, o || {});
  }
  // 1. Attempt counting: brain-path wave-4+ calls count; winPlanDepart
  //    calls do not; non-wave-4 plans do not; 'normal'/'hold' count.
  let c1 = seedOut({ departCalls: [
    call(10, 'alice'),
    call(11, 'alice', { result: 'hold' }),
    call(12, 'alice', { result: 'normal' }),
    call(13, 'alice', { source: 'winPlanDepart' }),
    call(14, 'alice', { planTarget: 'spool', planNeedWave: 3 }),
  ] });
  let a1 = analyzeSeed(c1);
  check('attempts count 3 (brain w4 only)', a1.attempts === 3);
  check('launches count 1', a1.launchesN === 1);
  check('holds 1, normals 1', a1.holds === 1 && a1.normals === 1);
  check('winPlanDepart attempts counted separately', a1.wpAttempts === 1);
  // 2. Choke days: staged census day with no call = choke; with call = not.
  let c2 = seedOut({ planCensus: [
    censusRow(10, 'alice'), censusRow(11, 'alice'),
    censusRow(12, 'alice', { occupation: 'ranger', profile: 'wanderer' }),
    censusRow(13, 'alice', { plan: { stage: 'gear', target: 'congregation', needWave: 4, party: [] } }),
    censusRow(14, 'alice', { plan: { stage: 'hunt', target: null, needWave: null, party: [] } }),
  ], departCalls: [call(10, 'alice')] });
  let a2 = analyzeSeed(c2);
  check('staged days 4 (gear excluded)', a2.stagedDays === 4);
  check('choke days 3 (day 10 had a call)', a2.chokeDays === 3);
  check('choke rate 0.75', a2.chokeRate === 0.75);
  check('byOcc forager staged 3 choke 2', a2.byOcc.forager && a2.byOcc.forager.staged === 3 && a2.byOcc.forager.choke === 2);
  check('byOcc ranger staged 1 choke 1', a2.byOcc.ranger && a2.byOcc.ranger.staged === 1 && a2.byOcc.ranger.choke === 1);
  check('byShape targeted-w4 staged 3', a2.byShape['targeted-w4'] && a2.byShape['targeted-w4'].staged === 3);
  check('byShape targetless-hunt staged 1', a2.byShape['targetless-hunt'] && a2.byShape['targetless-hunt'].staged === 1);
  // 3. STUCK: >= 7 staged days, zero calls anywhere.
  const census7 = [];
  for (let d = 20; d < 27; d++) census7.push(censusRow(d, 'bob'));
  let c3 = seedOut({ planCensus: census7, departCalls: [] });
  let a3 = analyzeSeed(c3);
  check('stuck found (7 days, 0 calls)', a3.stuck.length === 1 && a3.stuck[0].vid === 'bob');
  let c3b = seedOut({ planCensus: census7, departCalls: [call(22, 'bob')] });
  check('not stuck when a call exists', analyzeSeed(c3b).stuck.length === 0);
  const census6 = [];
  for (let d = 20; d < 26; d++) census6.push(censusRow(d, 'bob'));
  check('not stuck at 6 days', analyzeSeed(seedOut({ planCensus: census6, departCalls: [] })).stuck.length === 0);
  // 4. Release row: forager profile, staged w4 plan, no party_launch commit.
  let c4 = seedOut({ departCalls: [
    call(30, 'alice', { commitWinPlanAction: null, result: 'normal' }),
    call(31, 'alice', { commitWinPlanAction: 'party_launch' }),
    call(32, 'alice', { commitWinPlanAction: null, profile: 'wanderer' }),
  ] });
  let a4 = analyzeSeed(c4);
  check('first release day 30', a4.firstReleaseDay === 30);
  check('release rows counted on ctl side', a4.ctlReleaseRows === 1);
  // 5. Sub-choke classes.
  let c5 = seedOut({ planCensus: [
    censusRow(10, 'alice'),
    censusRow(11, 'alice'),
    censusRow(12, 'alice'),
    censusRow(13, 'alice'),
  ], scorePicks: [
    { day: 10, part: 0, vid: 'alice', pickKind: 'EXPEDITION', winPlanAction: 'party_launch', override: 'win_plan:party_launch', deferred: 'party_launch:no-tick-exact', commitKind: null, commitWinPlanAction: null, commitDay: null },
    { day: 11, part: 0, vid: 'alice', pickKind: 'HAVEN_CHORE', winPlanAction: 'gear_hold', override: 'win_plan:gear_hold', deferred: null, commitKind: 'HAVEN_CHORE', commitWinPlanAction: 'gear_hold', commitDay: 11 },
    { day: 12, part: 0, vid: 'alice', pickKind: 'HAVEN_CHORE', winPlanAction: 'party_wait', override: 'win_plan:party_wait', deferred: null, commitKind: 'HAVEN_CHORE', commitWinPlanAction: 'party_wait', commitDay: 12 },
  ], dawnPool: [{ day: 10, byProfileAtHaven: {}, eligibleCompanions: 0, rosterN: 10 }] });
  let a5 = analyzeSeed(c5);
  check('sub-choke part3-deferred counted', (a5.subChoke['commit-written-part3-deferred'] || 0) === 1);
  check('sub-choke gear-hold counted', (a5.subChoke['stage-gear-hold'] || 0) === 1);
  check('sub-choke party-wait counted', (a5.subChoke['party-wait-no-companion'] || 0) === 1);
  check('sub-choke never-scored counted', (a5.subChoke['never-scored'] || 0) === 1);
  check('sub-choke elig cross-tab', (a5.subChoke['commit-written-part3-deferred|elig=0'] || 0) === 1);
  // 6. Verdict math on staged legs.
  function legRows(mode, specs) {
    return specs.map(function (s, i) {
      return analyzeSeed(seedOut(Object.assign({ seed: 107423 + i, mode: mode }, s)));
    });
  }
  function attemptCall(day, vid) { return call(day, vid, { result: 'launch' }); }
  const ctlLeg = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
  ]);
  const armLeg = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'), attemptCall(11, 'alice'), attemptCall(12, 'alice'), attemptCall(13, 'alice'),
        attemptCall(14, 'alice'), attemptCall(15, 'alice'), attemptCall(16, 'alice')],
      planCensus: [censusRow(10, 'alice')] },
    { departCalls: [attemptCall(10, 'alice'), attemptCall(11, 'alice'), attemptCall(12, 'alice')],
      planCensus: [censusRow(10, 'alice')] },
  ]);
  // NOTE: the staged arm legs have firstReleaseDay null (no forager
  // release rows with a null commit), so the det-gate compares the
  // full streams, which differ on departCalls; the det-gate is
  // therefore expected to FAIL here. The staged verdict test
  // isolates the bar logic.
  const v = analyze(ctlLeg, armLeg, {});
  check('staged attempts arm 10 vs ctl 2', v.arm.attempts === 10 && v.ctl.attempts === 2);
  check('staged primaryAttempts passes', v.bars.primaryAttempts === true);
  check('staged det-gate fails as designed (streams differ pre-bound)', v.bars.detGate === false);
  check('staged verdict NO-GO via det-gate', v.verdict === 'NO-GO');
  // A passing det-gate REQUIRES the arm's pre-bound streams to equal
  // ctl's AND ctl release rows to be 0: the bound must be before any
  // divergence. Build that case: arm legs identical to ctl legs
  // except a release row on day 90.
  const ctlLeg3 = legRows('ctl', [
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
    { departCalls: [attemptCall(10, 'alice')], planCensus: [censusRow(10, 'alice')] },
  ]);
  const armLeg3 = legRows('arm', [
    { departCalls: [attemptCall(10, 'alice'), call(90, 'alice', { commitWinPlanAction: null, result: 'normal' })],
      planCensus: [censusRow(10, 'alice')] },
    { departCalls: [attemptCall(10, 'alice'), call(90, 'alice', { commitWinPlanAction: null, result: 'normal' })],
      planCensus: [censusRow(10, 'alice')] },
  ]);
  const v3 = analyze(ctlLeg3, armLeg3, {});
  check('det-gate passes when pre-bound streams identical', v3.bars.detGate === true);
  check('attempts bar fails on +0 (needs +4)', v3.bars.primaryAttempts === false);
  // Zero-attempt rule.
  const v0 = analyze(legRows('ctl', [{ departCalls: [attemptCall(10, 'alice')] }]),
    legRows('arm', [{ departCalls: [attemptCall(10, 'alice')] }]), {});
  check('zero-attempt rule INCONCLUSIVE', v0.verdict === 'INCONCLUSIVE');
  console.log('dawnchoke analyzer selftest: ' + pass + ' pass, ' + fail + ' fail');
  return fail === 0;
}

if (require.main === module) (async function () {
  if (process.argv.includes('--selftest')) {
    process.exit(selftest() ? 0 : 1);
  }
  function arg(name, dflt) {
    const i = process.argv.indexOf('--' + name);
    return i === -1 ? dflt : process.argv[i + 1];
  }
  const diagOnlyFlag = process.argv.includes('--diag-only');
  const ctlDir = arg('ctl', null);
  const armDir = arg('arm', null);
  const outFile = arg('out', null);
  if (!ctlDir) {
    console.error('usage: node scripts/analyze-dawnchoke-a.js --ctl <dir> [--arm <dir> --out <file>] [--seeds ...] [--ctl-brain <sha> --arm-brain <sha>] [--diag-only]');
    process.exit(2);
  }
  const seeds = (arg('seeds', null) || '107423,107424,107425,107426,107427,107428,107429,107430')
    .split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite);
  const ctlRows = loadLeg(ctlDir, 'ctl', seeds);
  if (diagOnlyFlag) {
    const d = diagOnly(ctlRows);
    console.log(JSON.stringify(d, null, 2));
    if (outFile) fs.writeFileSync(outFile, JSON.stringify(d, null, 2) + '\n');
    return;
  }
  if (!armDir || !outFile) {
    console.error('usage: node scripts/analyze-dawnchoke-a.js --ctl <dir> --arm <dir> --out <file> [--seeds ...]');
    process.exit(2);
  }
  const armRows = loadLeg(armDir, 'arm', seeds);
  const result = analyze(ctlRows, armRows, {
    ctlBrain: arg('ctl-brain', null), armBrain: arg('arm-brain', null),
  });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: result.verdict, zeroAttempt: result.zeroAttempt,
    ctlAttempts: result.ctl.attempts, armAttempts: result.arm.attempts,
    ctlLaunches: result.ctl.launches, armLaunches: result.arm.launches,
    ctlStuckCount: result.ctlStuckCount, stuckDeparted: result.stuckDeparted,
    ctlChokeRate: result.ctl.choke.chokeRate, armChokeRate: result.arm.choke.chokeRate,
    ctlStarv: result.ctl.starvDeaths, armStarv: result.arm.starvDeaths,
    maxStarvExcess: result.maxStarvExcess,
    ctlMedian: result.ctl.medianSurvival, armMedian: result.arm.medianSurvival,
    detPass: result.detPass, bars: result.bars, out: outFile }, null, 2));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { analyze: analyze, analyzeSeed: analyzeSeed, selftest: selftest,
  detGateForSeed: detGateForSeed, diagOnly: diagOnly,
  isW4Plan: isW4Plan, isStagedW4: isStagedW4, isTargetlessHunt: isTargetlessHunt,
  isReleaseRow: isReleaseRow, isStarvationDeath: isStarvationDeath, median: median, W4P_SET: W4P_SET };
