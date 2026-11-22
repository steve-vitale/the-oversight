// analyze-homebody-a.js — LEVER analyzer, arm sim-homebody-a
// Reads the homebody-driver-a.js corpora (two legs: ctl on old code,
// arm on new code) and judges the frozen bars in the sim-homebody-a
// prereg §7: PRIMARY wave-4+ launches (armed >= control + 4) AND
// Dale-class conversion (>= 1 handoff launch from a range-0 holder),
// GUARDRAILS starvation + median survival, plus the det-gate
// (armed/control determinism on identical seeds except the intended
// change) and the zero-launch rule.
// Usage:
//   node scripts/analyze-homebody-a.js --ctl <ctl-dir> --arm <arm-dir> --out <file>
//     [--seeds 107423,...] [--ctl-winplan <sha> --ctl-brain <sha> --arm-winplan <sha> --arm-brain <sha>]
//   node scripts/analyze-homebody-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');

// Wave-4+ id set (frozen list from src/data/monsters.json —
// re-read live so the analyzer refuses a stale roster silently).
// A plan is wave-4+ when its needWave is >= 4 OR its target is a
// wave-4+ species: the companion sync copies target but NOT needWave
// (old code), so a companion-inherited plan can carry a wave-4 target
// with needWave null. needWave alone UNDERCOUNTS the wave-4 plan
// population (leadgate-a §8).
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
function isW4Launch(d) {
  return !!d && d.result === 'launch' &&
    (((d.needWave | 0) >= 4) || (d.target && W4P_SET.has(d.target)));
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
// handoff on that seed. needWaveCopies itself is included —
// pre-bound it is empty on both legs by construction (a handoff
// transfer creates a copy row only on/after the handoff day).
// The handoffs stream is included too: pre-bound it is empty on
// both legs by definition of the bound.
const DET_STREAMS = ['v4departs', 'planSeeds', 'v4fights', 'volleyEvents',
  'prizeEvents', 'grantEvents', 'contestEvents', 'deaths', 'corpseTakeEvents',
  'killLootEvents', 'v4gunLoc', 'planCensus', 'needWaveCopies',
  'departBeats', 'reseedBeats', 'beatLines', 'handoffs'];

function analyzeSeed(out) {
  const seed = out.seed;
  const errors = (out.instrumentErrors || []).length;
  const copies = (out.needWaveCopies || []).slice();
  // sim-needwave-b (wipe-aware): the copy record logs EVERY
  // needWave change, including wipes to null and the holder's own
  // plan (isHolderPlan true — re-seed noise, never the bound).
  // The det-gate bound is the earliest COMPANION copy, any
  // to-value (a wipe to null is the lever's first divergence just
  // as much as a fill). Rows without isHolderPlan (the -a corpus
  // shape) count as companion rows.
  const companionCopies = copies.filter(function (c) { return !c.isHolderPlan; });
  const holderCopies = copies.filter(function (c) { return !!c.isHolderPlan; });
  const wipeCopies = companionCopies.filter(function (c) { return c.to == null; });
  const downgradeCopies = companionCopies.filter(function (c) {
    return c.from != null && c.to != null && c.to < c.from;
  });
  let firstCopyDay = null;
  for (const c of companionCopies) if (firstCopyDay == null || c.day < firstCopyDay) firstCopyDay = c.day;
  // HOMEBODY: handoffs — the lever's own trace. The det-gate bound
  // is the earliest handoff row, any result (a hold attempt IS the
  // lever's first divergence: on ctl the same dawn commit holds
  // silently; on arm the handoff runs and returns 'hold'). A
  // Dale-class conversion is a launch whose old holder was range-0
  // (oldHolderMaxD strictly 0 — a null maxD never counts).
  const handoffs = (out.handoffs || []).slice();
  let firstHandoffDay = null;
  for (const h of handoffs) if (firstHandoffDay == null || h.day < firstHandoffDay) firstHandoffDay = h.day;
  const handoffLaunches = handoffs.filter(function (h) { return h.result === 'launch'; });
  const daleConversions = handoffLaunches.filter(function (h) { return h.oldHolderMaxD === 0; });
  const handoffNullLeader = handoffLaunches.filter(function (h) { return !h.newLeader; });
  const handoffLines = (out.beatLines || []).filter(function (b) { return /takes the plan and leads the party/.test(b.text || ''); });
  // Launches (wave-4+ by the OR definition).
  const launches = [];
  let holds = 0, homebodyHolds = 0;
  for (const d of (out.v4departs || [])) {
    if (d.result === 'hold') {
      holds++;
      const m0 = (d.members || [])[0];
      if (m0 && m0.profile === 'homebody') homebodyHolds++;
      continue;
    }
    if (!isW4Launch(d)) continue;
    launches.push({ seed: seed, day: d.day, vid: d.vid, source: d.source || null,
      target: d.target || null, needWave: (d.needWave != null ? (d.needWave | 0) : null),
      stage: d.stage || null, party: (d.party || []).slice(),
      partySize: d.partySize | 0 });
  }
  // Departure beats: an ordinary beat spoke for this launch iff a
  // departBeats row with ordinarySpoke true shares day+vid.
  const beatKeys = {};
  for (const b of (out.departBeats || [])) {
    if (b.ordinarySpoke) beatKeys[b.day + '|' + b.vid] = true;
  }
  let nullLaunches = 0, trioLaunches = 0, beatLaunches = 0;
  for (const l of launches) {
    if (l.needWave == null) nullLaunches++;
    if (l.partySize >= 3) trioLaunches++;
    if (beatKeys[l.day + '|' + l.vid]) beatLaunches++;
    l.beat = !!beatKeys[l.day + '|' + l.vid];
  }
  // Deaths.
  const deaths = (out.deaths || []).slice();
  const starv = deaths.filter(isStarvationDeath);
  const kindStrings = {};
  for (const d of deaths) {
    const k = String((d.kind || '') + '/' + (d.cause || ''));
    kindStrings[k] = (kindStrings[k] || 0) + 1;
  }
  return {
    seed: seed, mode: out.mode || out.leg || null,
    anchorCommit: out.anchorCommit || null,
    winplanSha: out.winplanSha || null, brainSha: out.brainSha || null,
    errors: errors, sayWrap: !!out.sayWrap,
    days: out.days, gameDays: out.gameDays,
    endReason: out.endReason || null, won: !!out.won,
    villageLost: !!out.villageLost, maxWave: out.maxWave,
    unlockedWave: out.unlockedWave, standing: out.standing,
    scaleRank: out.scaleRank || null,
    deaths: deaths.length, starvDeaths: starv.length,
    starvBySeed: starv.length, kindStrings: kindStrings,
    launches: launches, launchesN: launches.length, holds: holds,
    nullLaunches: nullLaunches, trioLaunches: trioLaunches,
    beatLaunches: beatLaunches,
    nullRate: launches.length ? nullLaunches / launches.length : null,
    trioRate: launches.length ? trioLaunches / launches.length : null,
    beatRate: launches.length ? beatLaunches / launches.length : null,
    copies: copies.length, companionCopies: companionCopies.length,
    holderCopies: holderCopies.length, wipeCopies: wipeCopies.length,
    downgradeCopies: downgradeCopies.length,
    firstCopyDay: firstCopyDay,
    handoffs: handoffs, handoffsN: handoffs.length,
    handoffLaunches: handoffLaunches, handoffLaunchesN: handoffLaunches.length,
    daleConversions: daleConversions, daleConversionsN: daleConversions.length,
    handoffNullLeaderN: handoffNullLeader.length,
    handoffLinesN: handoffLines.length,
    firstHandoffDay: firstHandoffDay,
    homebodyHolds: homebodyHolds,
    departRowsN: (out.v4departs || []).length,
    beatLines: (out.beatLines || []).slice(),
    raw: out,
  };
}

function loadLeg(dir, mode, seeds) {
  const rows = [];
  for (const seed of seeds) {
    const fp = path.join(dir, 'homebody-a-s' + seed + '-homebody-a-' + mode + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push(analyzeSeed(JSON.parse(fs.readFileSync(fp, 'utf8'))));
  }
  return rows;
}

function detGateForSeed(ctlRow, armRow) {
  const bound = armRow.firstHandoffDay;
  const detail = { seed: ctlRow.seed, bound: bound, mismatches: [] };
  // HOMEBODY: the ctl-zero rule covers handoff rows — the method
  // does not exist on ctl, so any row is an instrument failure.
  const ctlHandoffs = (ctlRow.raw.handoffs || []);
  if (ctlHandoffs.length !== 0) {
    detail.mismatches.push('ctl leg recorded ' + ctlHandoffs.length + ' handoffs rows (must be 0)');
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
  const ctlLaunches = sum(ctlRows, function (r) { return r.launchesN; });
  const armLaunches = sum(armRows, function (r) { return r.launchesN; });
  const ctlNull = sum(ctlRows, function (r) { return r.nullLaunches; });
  const armNull = sum(armRows, function (r) { return r.nullLaunches; });
  const ctlTrio = sum(ctlRows, function (r) { return r.trioLaunches; });
  const armTrio = sum(armRows, function (r) { return r.trioLaunches; });
  const ctlBeat = sum(ctlRows, function (r) { return r.beatLaunches; });
  const armBeat = sum(armRows, function (r) { return r.beatLaunches; });
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
  checkSha(ctlRows, 'winplanSha', opts.ctlWinplan, 'ctl win-plan.js');
  checkSha(ctlRows, 'brainSha', opts.ctlBrain, 'ctl villager-brain.js');
  checkSha(armRows, 'winplanSha', opts.armWinplan, 'arm win-plan.js');
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
  const armHandoffs = sum(armRows, function (r) { return r.handoffsN; });
  const armHandoffLaunches = sum(armRows, function (r) { return r.handoffLaunchesN; });
  const dale = sum(armRows, function (r) { return r.daleConversionsN; });
  const armNullLeader = sum(armRows, function (r) { return r.handoffNullLeaderN; });
  const ctlHomebodyHolds = sum(ctlRows, function (r) { return r.homebodyHolds; });
  const armHomebodyHolds = sum(armRows, function (r) { return r.homebodyHolds; });
  const ctlDepartRows = sum(ctlRows, function (r) { return r.departRowsN; });
  const armDepartRows = sum(armRows, function (r) { return r.departRowsN; });
  const bars = {};
  // Instrument validity also covers the handoff record: a launch
  // row with no new leader means the transfer was not observed —
  // an instrument anomaly, not a game verdict.
  bars.instrument = (ctlErr === 0 && armErr === 0 && armNullLeader === 0);
  bars.detGate = detPass;
  bars.anchor = anchorPass;
  const zeroLaunch = (ctlLaunches < 5 || armLaunches < 5);
  bars.primary = (armLaunches >= ctlLaunches + 4);
  bars.dale = (dale >= 1);
  bars.starvTotal = (armStarv <= ctlStarv + 2);
  bars.starvPerSeed = (maxExcess <= 2);
  bars.survival = (ctlMed != null && armMed != null) && (armMed >= 0.8 * ctlMed);
  let verdict = 'NO-GO';
  if (zeroLaunch) verdict = 'INCONCLUSIVE';
  else if (bars.instrument && bars.detGate && bars.anchor && bars.primary &&
    bars.dale && bars.starvTotal && bars.starvPerSeed && bars.survival) verdict = 'GO';
  return {
    verdict: verdict, zeroLaunch: zeroLaunch,
    seeds: seeds,
    ctl: { launches: ctlLaunches, nullLaunches: ctlNull,
      nullRate: ctlLaunches ? ctlNull / ctlLaunches : null,
      trioLaunches: ctlTrio, trioRate: ctlLaunches ? ctlTrio / ctlLaunches : null,
      beatLaunches: ctlBeat, beatRate: ctlLaunches ? ctlBeat / ctlLaunches : null,
      starvDeaths: ctlStarv, medianSurvival: ctlMed,
      instrumentErrors: ctlErr, wall: wall(ctlRows),
      handoffs: 0, handoffLaunches: 0, daleConversions: 0,
      homebodyHolds: ctlHomebodyHolds, departRows: ctlDepartRows,
      selectedBlockedShare: ctlDepartRows ? ctlHomebodyHolds / ctlDepartRows : null,
      perSeed: ctlRows.map(function (r) { return { seed: r.seed, gameDays: r.gameDays,
        launches: r.launchesN, nullLaunches: r.nullLaunches,
        trioLaunches: r.trioLaunches, beatLaunches: r.beatLaunches,
        starvDeaths: r.starvDeaths, deaths: r.deaths, copies: r.copies,
        companionCopies: r.companionCopies, holderCopies: r.holderCopies,
        wipeCopies: r.wipeCopies, downgradeCopies: r.downgradeCopies,
        firstCopyDay: r.firstCopyDay, errors: r.errors,
        handoffs: r.handoffsN, handoffLaunches: r.handoffLaunchesN,
        daleConversions: r.daleConversionsN, homebodyHolds: r.homebodyHolds,
        firstHandoffDay: r.firstHandoffDay }; }) },
    arm: { launches: armLaunches, nullLaunches: armNull,
      nullRate: armLaunches ? armNull / armLaunches : null,
      trioLaunches: armTrio, trioRate: armLaunches ? armTrio / armLaunches : null,
      beatLaunches: armBeat, beatRate: armLaunches ? armBeat / armLaunches : null,
      starvDeaths: armStarv, medianSurvival: armMed,
      instrumentErrors: armErr, wall: wall(armRows),
      handoffs: armHandoffs, handoffLaunches: armHandoffLaunches,
      daleConversions: dale, nullLeaderLaunches: armNullLeader,
      homebodyHolds: armHomebodyHolds, departRows: armDepartRows,
      selectedBlockedShare: armDepartRows ? armHomebodyHolds / armDepartRows : null,
      perSeed: armRows.map(function (r) { return { seed: r.seed, gameDays: r.gameDays,
        launches: r.launchesN, nullLaunches: r.nullLaunches,
        trioLaunches: r.trioLaunches, beatLaunches: r.beatLaunches,
        starvDeaths: r.starvDeaths, deaths: r.deaths, copies: r.copies,
        companionCopies: r.companionCopies, holderCopies: r.holderCopies,
        wipeCopies: r.wipeCopies, downgradeCopies: r.downgradeCopies,
        firstCopyDay: r.firstCopyDay, errors: r.errors,
        handoffs: r.handoffsN, handoffLaunches: r.handoffLaunchesN,
        daleConversions: r.daleConversionsN, homebodyHolds: r.homebodyHolds,
        firstHandoffDay: r.firstHandoffDay }; }) },
    starvExcess: starvExcess, maxStarvExcess: maxExcess,
    det: det, detPass: detPass, anchorChecks: anchorChecks,
    bars: bars,
    ctlLaunchesDetail: ctlRows.reduce(function (a, r) { return a.concat(r.launches); }, []),
    armLaunchesDetail: armRows.reduce(function (a, r) { return a.concat(r.launches); }, []),
    kindStrings: (function () {
      const k = {};
      for (const r of ctlRows.concat(armRows)) {
        for (const key of Object.keys(r.kindStrings || {})) k[key] = (k[key] || 0) + (r.kindStrings[key] || 0);
      }
      return k;
    })(),
    armBeatLines: armRows.reduce(function (a, r) { return a.concat(r.beatLines.map(function (b) { return { seed: r.seed, day: b.day, text: b.text }; })); }, []),
    ctlBeatLines: ctlRows.reduce(function (a, r) { return a.concat(r.beatLines.map(function (b) { return { seed: r.seed, day: b.day, text: b.text }; })); }, []),
    armHandoffsDetail: armRows.reduce(function (a, r) { return a.concat(r.handoffs.map(function (h) { return Object.assign({ seed: r.seed }, h); })); }, []),
    ctlHandoffsDetail: ctlRows.reduce(function (a, r) { return a.concat(r.handoffs.map(function (h) { return Object.assign({ seed: r.seed }, h); })); }, []),
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
      handoffs: [], sayWrap: true }, o || {});
  }
  function launch(o) {
    return Object.assign({ day: 100, vid: 'alice', source: 'brain',
      result: 'launch', stage: 'hunt', target: 'herald', needWave: 4,
      party: ['bob'], partySize: 2, members: [] }, o || {});
  }
  function handoff(o) {
    return Object.assign({ day: 60, oldHolder: 'dale', oldHolderProfile: 'homebody',
      oldHolderMaxD: 0, newLeader: 'maya', target: 'herald', needWave: 4,
      party: ['bob'], result: 'launch' }, o || {});
  }
  // 1. Launch counting + OR definition (target wave-4, needWave null counts).
  let ctl = seedOut({ v4departs: [launch({ needWave: null }), launch({ needWave: null }),
    launch({ needWave: 4 }), launch({ needWave: 4, target: 'audit', party: ['bob', 'carol'], partySize: 3 })] });
  let a = analyzeSeed(ctl);
  check('null rate 2/4 (reported, not judged)', a.nullRate === 0.5);
  check('trio rate 1/4 (reported, not judged)', a.trioRate === 0.25);
  check('wave-4 target with null needWave is a w4 launch', a.launchesN === 4);
  let ctl2 = seedOut({ v4departs: [launch({ needWave: 3, target: 'spool' })] });
  check('wave-3 launch excluded', analyzeSeed(ctl2).launchesN === 0);
  let ctl3 = seedOut({ v4departs: [launch({ result: 'hold' })] });
  check('hold excluded from launches', analyzeSeed(ctl3).launchesN === 0);
  // 2. Handoff parsing: Dale-class conversion needs oldHolderMaxD strictly 0.
  let hb = seedOut({ mode: 'arm', handoffs: [handoff(), handoff({ day: 70, oldHolderMaxD: 1, newLeader: 'zoe' }),
    handoff({ day: 80, result: 'hold', newLeader: null }), handoff({ day: 90, result: 'launch', newLeader: null, oldHolderMaxD: 1 })] });
  let ha = analyzeSeed(hb);
  check('handoff launches 3 of 4 rows', ha.handoffLaunchesN === 3);
  check('Dale-class conversions 1 (only the maxD-0 launch)', ha.daleConversionsN === 1);
  check('null-leader launches flagged (1)', ha.handoffNullLeaderN === 1);
  check('first handoff day 60', ha.firstHandoffDay === 60);
  let hbNull = seedOut({ mode: 'arm', handoffs: [handoff({ oldHolderMaxD: null })] });
  check('null maxD never counts as Dale-class', analyzeSeed(hbNull).daleConversionsN === 0);
  // 3. Selected-blocked: homebody holds share the holder's profile.
  function holdRow(o) {
    return Object.assign({ day: 100, vid: 'dale', source: 'brain', result: 'hold',
      stage: 'party', target: 'herald', needWave: 4, party: [], partySize: 1,
      members: [{ vid: 'dale', profile: 'homebody', maxD: 0 }] }, o || {});
  }
  let sb = seedOut({ v4departs: [holdRow(), holdRow({ vid: 'erin', members: [{ vid: 'erin', profile: 'forager', maxD: 1 }] }),
    launch({})] });
  let sa = analyzeSeed(sb);
  check('homebody holds 1 of 3 depart rows', sa.homebodyHolds === 1 && sa.departRowsN === 3);
  // 4. Beat join: ordinarySpoke on same day+vid counts; reseed-only does not.
  let ctl4 = seedOut({ v4departs: [launch({ day: 100 }), launch({ day: 101, vid: 'carol' })],
    departBeats: [{ day: 100, vid: 'alice', launched: ['bob'], target: 'herald', needWave: 4, ret: true, reseedSpoke: false, ordinarySpoke: true },
      { day: 101, vid: 'carol', launched: ['bob'], target: 'herald', needWave: 4, ret: true, reseedSpoke: true, ordinarySpoke: false }] });
  check('beat rate 1/2 (reseed-only excluded)', analyzeSeed(ctl4).beatRate === 0.5);
  // 5. Starvation counting by kind/cause.
  let ctl5 = seedOut({ deaths: [{ day: 10, kind: 'starvation', who: 'x', cause: 'starvation', player: false },
    { day: 11, kind: 'death', who: 'y', cause: 'monster', player: false },
    { day: 12, kind: 'death', who: 'z', cause: 'hunger', player: false }] });
  check('starvation deaths 2/3', analyzeSeed(ctl5).starvDeaths === 2);
  // 6. Det-gate: identical pre-bound streams pass; a pre-bound diff fails;
  //    a post-bound diff passes; ctl handoffs fail.
  const base = seedOut({ v4departs: [launch({ day: 50 })], planSeeds: [], needWaveCopies: [] });
  const armSame = seedOut({ mode: 'arm', v4departs: [launch({ day: 50 })],
    handoffs: [handoff({ day: 60 })] });
  check('det-gate passes on identical pre-bound streams', detGateForSeed(analyzeSeed(base), analyzeSeed(armSame)).pass === true);
  const armEarly = seedOut({ mode: 'arm', v4departs: [launch({ day: 50 }), launch({ day: 55, vid: 'carol' })],
    handoffs: [handoff({ day: 60 })] });
  check('det-gate fails on a pre-bound divergence', detGateForSeed(analyzeSeed(base), analyzeSeed(armEarly)).pass === false);
  const armLate = seedOut({ mode: 'arm', v4departs: [launch({ day: 50 }), launch({ day: 70, vid: 'carol' })],
    handoffs: [handoff({ day: 60 })] });
  check('det-gate passes on a post-bound divergence', detGateForSeed(analyzeSeed(base), analyzeSeed(armLate)).pass === true);
  const ctlHandoff = seedOut({ handoffs: [handoff({ day: 60 })] });
  check('det-gate fails when ctl records handoffs', detGateForSeed(analyzeSeed(ctlHandoff), analyzeSeed(armSame)).pass === false);
  // A hold-attempt handoff sets the bound too (it is the first divergence).
  const armHoldBound = seedOut({ mode: 'arm', v4departs: [launch({ day: 50 })],
    handoffs: [handoff({ day: 60, result: 'hold', newLeader: null })] });
  check('hold handoff sets the bound (firstHandoffDay 60)', analyzeSeed(armHoldBound).firstHandoffDay === 60);
  // 7. Verdict math on staged legs (2 seeds each, small).
  function legRows(mode, specs) {
    return specs.map(function (s, i) {
      return analyzeSeed(seedOut(Object.assign({ seed: 107423 + i, mode: mode }, s)));
    });
  }
  const ctlLeg = legRows('ctl', [
    { v4departs: [launch({ day: 90 }), launch({ day: 91 }), launch({ day: 92 }),
        holdRow({ day: 93 }), holdRow({ day: 94 })],
      deaths: [{ day: 5, kind: 'starvation', who: 'x', cause: 'starvation', player: false }] },
    { v4departs: [launch({ day: 90 }), launch({ day: 91 })], deaths: [] },
  ]);
  const armLeg = legRows('arm', [
    { v4departs: [launch({ day: 90 }), launch({ day: 91 }), launch({ day: 92 }),
        launch({ day: 93, vid: 'maya', source: 'handoff', party: ['bob'] }),
        launch({ day: 94, vid: 'maya', source: 'handoff', party: ['bob'] }),
        launch({ day: 95, vid: 'maya', source: 'handoff', party: ['bob'] }),
        launch({ day: 96, vid: 'maya', source: 'handoff', party: ['bob'] })],
      handoffs: [handoff({ day: 60 }), handoff({ day: 61 })],
      deaths: [{ day: 5, kind: 'starvation', who: 'x', cause: 'starvation', player: false }] },
    { v4departs: [launch({ day: 90 }), launch({ day: 91 }),
        launch({ day: 93, vid: 'maya', source: 'handoff', party: ['bob'] })],
      handoffs: [handoff({ day: 60 })],
      deaths: [] },
  ]);
  // NOTE: the staged arm legs diverge from ctl on day-90+ launches
  // (pre-bound is day<60, so those rows are NOT compared) — the
  // det-gate compares only pre-bound rows, and the staged legs
  // share no pre-bound rows at all, so the gate passes trivially.
  const v = analyze(ctlLeg, armLeg, {});
  check('staged verdict GO', v.verdict === 'GO');
  check('staged launches arm 10 vs ctl 5 (bar >= +4)', v.arm.launches === 10 && v.ctl.launches === 5 && v.bars.primary === true);
  check('staged Dale conversions 3', v.arm.daleConversions === 3 && v.bars.dale === true);
  check('staged selected-blocked share ctl 2/7', v.ctl.selectedBlockedShare === 2 / 7);
  check('staged starvation equal', v.bars.starvTotal === true && v.bars.starvPerSeed === true);
  // Zero-launch rule.
  const v0 = analyze(legRows('ctl', [{ v4departs: [launch({})] }]),
    legRows('arm', [{ v4departs: [launch({})] }]), {});
  check('zero-launch rule INCONCLUSIVE', v0.verdict === 'INCONCLUSIVE');
  // Primary missed by 1 (arm 8 vs ctl 5).
  const armShort = legRows('arm', [
    { v4departs: [launch({ day: 90 }), launch({ day: 91 }), launch({ day: 92 }),
        launch({ day: 93, vid: 'maya', source: 'handoff' }), launch({ day: 94, vid: 'maya', source: 'handoff' }),
        launch({ day: 95, vid: 'maya', source: 'handoff' })],
      handoffs: [handoff({ day: 60 })], deaths: [] },
    { v4departs: [launch({ day: 90 }), launch({ day: 91 })], handoffs: [handoff({ day: 60 })], deaths: [] },
  ]);
  const vP = analyze(ctlLeg, armShort, {});
  check('primary missed by 1 -> NO-GO', vP.verdict === 'NO-GO' && vP.bars.primary === false);
  // Dale missed (handoffs from a walker, maxD 1).
  const armNoDale = legRows('arm', [
    { v4departs: [launch({ day: 90 }), launch({ day: 91 }), launch({ day: 92 }),
        launch({ day: 93, vid: 'maya', source: 'handoff' }), launch({ day: 94, vid: 'maya', source: 'handoff' }),
        launch({ day: 95, vid: 'maya', source: 'handoff' }), launch({ day: 96, vid: 'maya', source: 'handoff' })],
      handoffs: [handoff({ day: 60, oldHolderMaxD: 1, oldHolderProfile: 'forager' })], deaths: [] },
    { v4departs: [launch({ day: 90 }), launch({ day: 91 }),
        launch({ day: 93, vid: 'maya', source: 'handoff' })],
      handoffs: [handoff({ day: 60, oldHolderMaxD: 1, oldHolderProfile: 'forager' })], deaths: [] },
  ]);
  const vD = analyze(ctlLeg, armNoDale, {});
  check('Dale missed -> NO-GO', vD.verdict === 'NO-GO' && vD.bars.dale === false);
  // Guardrail: starvation total exceeded.
  const armStarv = legRows('arm', [
    { v4departs: [launch({ day: 90 }), launch({ day: 91 }), launch({ day: 92 }),
        launch({ day: 93, vid: 'maya', source: 'handoff' }), launch({ day: 94, vid: 'maya', source: 'handoff' }),
        launch({ day: 95, vid: 'maya', source: 'handoff' }), launch({ day: 96, vid: 'maya', source: 'handoff' })],
      handoffs: [handoff({ day: 60 })],
      deaths: [{ day: 5, kind: 'starvation', who: 'a', cause: 'starvation', player: false },
        { day: 6, kind: 'starvation', who: 'b', cause: 'starvation', player: false },
        { day: 7, kind: 'starvation', who: 'c', cause: 'starvation', player: false },
        { day: 8, kind: 'starvation', who: 'd', cause: 'starvation', player: false }] },
    { v4departs: [launch({ day: 90 }), launch({ day: 91 }),
        launch({ day: 93, vid: 'maya', source: 'handoff' })],
      handoffs: [handoff({ day: 60 })], deaths: [] },
  ]);
  const vS = analyze(ctlLeg, armStarv, {});
  check('starvation guardrail fails verdict', vS.verdict === 'NO-GO' && vS.bars.starvTotal === false);
  // Anchor check.
  const vA = analyze(ctlLeg, armLeg, { ctlWinplan: 'WRONG', armWinplan: 'wp1' });
  check('anchor mismatch fails', vA.bars.anchor === false && vA.verdict === 'NO-GO');
  console.log('homebody analyzer selftest: ' + pass + ' pass, ' + fail + ' fail');
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
  const ctlDir = arg('ctl', null);
  const armDir = arg('arm', null);
  const outFile = arg('out', null);
  if (!ctlDir || !armDir || !outFile) {
    console.error('usage: node scripts/analyze-homebody-a.js --ctl <dir> --arm <dir> --out <file> [--seeds ...] [--ctl-winplan <sha> --ctl-brain <sha> --arm-winplan <sha> --arm-brain <sha>]');
    process.exit(2);
  }
  const seeds = (arg('seeds', null) || '107423,107424,107425,107426,107427,107428,107429,107430')
    .split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite);
  const ctlRows = loadLeg(ctlDir, 'ctl', seeds);
  const armRows = loadLeg(armDir, 'arm', seeds);
  const result = analyze(ctlRows, armRows, {
    ctlWinplan: arg('ctl-winplan', null), ctlBrain: arg('ctl-brain', null),
    armWinplan: arg('arm-winplan', null), armBrain: arg('arm-brain', null),
  });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: result.verdict, zeroLaunch: result.zeroLaunch,
    ctlLaunches: result.ctl.launches, armLaunches: result.arm.launches,
    ctlHandoffs: result.ctl.handoffs, armHandoffs: result.arm.handoffs,
    armHandoffLaunches: result.arm.handoffLaunches,
    daleConversions: result.arm.daleConversions,
    ctlHomebodyHolds: result.ctl.homebodyHolds, armHomebodyHolds: result.arm.homebodyHolds,
    ctlSelectedBlockedShare: result.ctl.selectedBlockedShare,
    ctlNullRate: result.ctl.nullRate, armNullRate: result.arm.nullRate,
    ctlTrioRate: result.ctl.trioRate, armTrioRate: result.arm.trioRate,
    ctlBeatRate: result.ctl.beatRate, armBeatRate: result.arm.beatRate,
    ctlStarv: result.ctl.starvDeaths, armStarv: result.arm.starvDeaths,
    maxStarvExcess: result.maxStarvExcess,
    ctlMedian: result.ctl.medianSurvival, armMedian: result.arm.medianSurvival,
    detPass: result.detPass, bars: result.bars, out: outFile }, null, 2));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { analyze: analyze, analyzeSeed: analyzeSeed, selftest: selftest,
  detGateForSeed: detGateForSeed, isW4Launch: isW4Launch,
  isStarvationDeath: isStarvationDeath, median: median, W4P_SET: W4P_SET };
