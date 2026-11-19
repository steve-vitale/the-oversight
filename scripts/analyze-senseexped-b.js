// analyze-senseexped-b.js — analyzer + judge, arm sim-senseexped-b
// (finding #2583: the launch-party sense reads the mutable plan party,
// not the expedition). Reads the senseexped driver corpora (per-seed
// JSONs with senseTraces) and computes, per leg:
//   * sense rate (PRIMARY): over trace-meetings — first inFight sense
//     trace per (fighter, day) with a live fighter expedition —
//     denominator = meetings where the fighter has >=2 same-target
//     expedition companions alive; numerator = the sense returned 2
//     of them (returned ∩ trueCompanions >= 2).
//   * raw sense rate: same meetings, any denominator (all trace-
//     meetings with a live fighter expedition), numerator = returned
//     >= 2 true companions.
//   * launch-with-party rate (secondary): denominator meetings joined
//     to a v4encounters row (same fighter, same day; best-match by
//     ally overlap) where the fighter fielded >= 2 launch companions
//     (members of the joined win-plan launch — a different
//     same-target party's members do not count). Meetings with no
//     joined launch are excluded from the fielded denominator and
//     counted under noLaunch.
//   * same-target conflation count: denominator meetings where the
//     sense returned a member of a DIFFERENT same-target party —
//     operationalized by joining the meeting to its win-plan launch
//     (fighter-anchored, most recent launch in [day-21, day]
//     containing the fighter): a returned vid outside that launch's
//     party is conflated. Meetings with no joined launch are counted
//     separately (voluntary expeditions carry no launch record).
//   * launches (pool floor): v4departs rows, result 'launch',
//     targetWave >= 4 (same definition as analyze-allyslot3-b.js).
//   * wall census: wins, national, wave 4/5 reach, standing >= 200,
//     median survival, survived 150d, deaths, starvation deaths
//     (cause === 'starvation').
// Judge (frozen prereg): GO iff arm sense rate >= 0.80 AND
// arm - ctl >= 0.30 AND launches >= 6 on both legs AND arm
// denominator >= 4 AND all three cost bars pass AND 0 instrument
// errors. Pool-floor failure is NO-GO kind METRIC-BROKEN.
// Usage:
//   node scripts/analyze-senseexped-b.js [--selftest]
//   node scripts/analyze-senseexped-b.js [--ctl <dir>] [--arm <dir>]
//     [--out <analysis.json>] [--seeds 104758,...]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null)
  || [104758, 104759, 104760, 104761, 104762, 104763, 104764, 104765];
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const CTL_DIR = path.join(REPO, argvVal('--ctl', 'evidence/2026-11-19/perseed-senseexped-b-ctl'));
const ARM_DIR = path.join(REPO, argvVal('--arm', 'evidence/2026-11-19/perseed-senseexped-b-arm'));
const OUT = argvVal('--out', null);

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function load(dir, leg) {
  const rows = [];
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'senseexped-b-s' + seed + '-senseexped-b-' + leg + '.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    rows.push({ seed: seed, r: JSON.parse(fs.readFileSync(fp, 'utf8')) });
  }
  return rows;
}
// Launches: v4departs result 'launch', wave-4+ target (allyslot3 def).
function launchesOf(d) {
  const out = [];
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || (r.targetWave | 0) < 4) continue;
    out.push({ day: r.day, vid: r.vid, target: r.target || null,
      party: [r.vid].concat(r.party || []) });
  }
  return out;
}
// Trace-meetings: first inFight sense trace per (fighter, day) with a
// live fighter expedition. One meeting = one fighter-day.
function meetingsOf(d) {
  const seen = {};
  const out = [];
  for (const t of (d.senseTraces || [])) {
    if (!t.inFight || !t.fighterExped) continue;
    const k = t.fighter + '|' + t.day;
    if (seen[k]) continue;
    seen[k] = true;
    const tru = t.trueCompanions || [];
    const ret = t.returned || [];
    const retTrue = ret.filter(function (v) { return tru.indexOf(v) !== -1; });
    out.push({ day: t.day, fighter: t.fighter, trueCompanions: tru.slice(),
      returned: ret.slice(), retTrue: retTrue, denom: tru.length >= 2,
      full: retTrue.length >= 2 });
  }
  return out;
}
// Join a meeting to its win-plan launch: most recent launch in
// [day-21, day] whose party contains the fighter.
function joinLaunch(launches, m) {
  let best = null;
  for (const l of launches) {
    if (m.day < l.day || m.day > l.day + 21) continue;
    if (l.party.indexOf(m.fighter) === -1) continue;
    if (!best || l.day > best.day) best = l;
  }
  return best;
}
// Join a meeting to a v4encounters row: same fighter + day, best-match
// by ally overlap with the true companions.
function joinEncounter(d, m) {
  let best = null, bestScore = -1;
  for (const e of (d.v4encounters || [])) {
    if (e.vid !== m.fighter || e.day !== m.day) continue;
    let score = 0;
    for (const a of (e.allyVids || [])) if (m.trueCompanions.indexOf(a) !== -1) score++;
    if (score > bestScore) { best = e; bestScore = score; }
  }
  return best;
}
function summarizeLeg(rows) {
  const s = { seeds: rows.length, launches: 0, meetings: 0, denom: 0, numer: 0,
    rawDenom: 0, rawNumer: 0, fielded: 0, fieldedDenom: 0, noEncounter: 0,
    conflated: 0, noLaunch: 0, errors: 0, wins: 0, national: 0, wave5: 0,
    wave4: 0, standing200: 0, survived150: 0, deaths: 0, starvation: 0,
    gameDays: [], perSeed: [] };
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  for (const x of rows) {
    const d = x.r;
    s.errors += (d.instrumentErrors || []).length;
    const launches = launchesOf(d);
    const meetings = meetingsOf(d);
    let denom = 0, numer = 0, fielded = 0, fieldedDenom = 0, noEnc = 0,
      confl = 0, noLaunch = 0;
    for (const m of meetings) {
      s.rawDenom++;
      if (m.full) s.rawNumer++;
      if (!m.denom) continue;
      denom++; if (m.full) numer++;
      // Conflation: join to the win-plan launch (independent of any
      // encounter row — the sense's return is stamped either way).
      const l = joinLaunch(launches, m);
      if (!l) { noLaunch++; }
      else {
        for (const r of m.returned) {
          if (r !== m.fighter && l.party.indexOf(r) === -1) { confl++; break; }
        }
      }
      // Launch-with-party: join to the encounter row. Fielding is
      // counted against the JOINED LAUNCH's party members, not the
      // trace's same-target set (a different same-target party's
      // members are not the fighter's launch companions).
      const e = joinEncounter(d, m);
      if (!e) { noEnc++; continue; }
      if (!l) continue; // fielding needs a launch identity
      fieldedDenom++;
      const fieldedN = (e.allyVids || []).filter(function (a) { return a !== m.fighter && l.party.indexOf(a) !== -1; }).length;
      if (fieldedN >= 2) fielded++;
    }
    s.launches += launches.length;
    s.meetings += meetings.length;
    s.denom += denom; s.numer += numer;
    s.fielded += fielded; s.fieldedDenom += fieldedDenom; s.noEncounter += noEnc;
    s.conflated += confl; s.noLaunch += noLaunch;
    s.wins += d.won ? 1 : 0;
    s.national += ((RANK[d.scaleRank] || 0) >= 2) ? 1 : 0;
    s.wave5 += (d.maxWave || 0) >= 5 ? 1 : 0;
    s.wave4 += (d.maxWave || 0) >= 4 ? 1 : 0;
    s.standing200 += (d.standing || 0) >= 200 ? 1 : 0;
    s.survived150 += (d.gameDays || 0) >= 150 ? 1 : 0;
    s.deaths += Array.isArray(d.deaths) ? d.deaths.length : 0;
    s.starvation += (d.deaths || []).filter(function (x) { return x.cause === 'starvation'; }).length;
    s.gameDays.push(d.gameDays || 0);
    s.perSeed.push({ seed: x.seed, launches: launches.length, meetings: meetings.length,
      denom: denom, numer: numer, fielded: fielded, fieldedDenom: fieldedDenom,
      conflated: confl, noLaunch: noLaunch, won: !!d.won, scaleRank: d.scaleRank,
      maxWave: d.maxWave, standing: d.standing, gameDays: d.gameDays,
      endReason: d.endReason, deaths: (d.deaths || []).length,
      starvation: (d.deaths || []).filter(function (y) { return y.cause === 'starvation'; }).length });
  }
  s.senseRate = s.denom ? s.numer / s.denom : null;
  s.rawSenseRate = s.rawDenom ? s.rawNumer / s.rawDenom : null;
  s.fieldRate = s.fieldedDenom ? s.fielded / s.fieldedDenom : null;
  s.medianSurvival = median(s.gameDays);
  return s;
}
function judge(ctl, arm) {
  const bars = [];
  const poolOk = ctl.launches >= 6 && arm.launches >= 6 && arm.denom >= 4;
  bars.push({ id: 'pool', pass: poolOk,
    detail: 'launches ctl ' + ctl.launches + ' / arm ' + arm.launches + ' (floor >=6/leg); arm sense denominator ' + arm.denom + ' (floor >=4)' });
  const senseOk = arm.senseRate != null && arm.senseRate >= 0.80 &&
    ctl.senseRate != null && (arm.senseRate - ctl.senseRate) >= 0.30;
  bars.push({ id: 'primary', pass: senseOk,
    detail: 'arm sense rate ' + (arm.senseRate == null ? 'n/a' : arm.senseRate.toFixed(3)) + ' (' + arm.numer + '/' + arm.denom + ') vs ctl ' +
      (ctl.senseRate == null ? 'n/a' : ctl.senseRate.toFixed(3)) + ' (' + ctl.numer + '/' + ctl.denom + '); bar >= 0.80 and gap >= 0.30' });
  const c1 = arm.starvation <= ctl.starvation + 2;
  bars.push({ id: 'C1-starvation', pass: c1, detail: 'starvation deaths arm ' + arm.starvation + ' vs ctl ' + ctl.starvation + ' (bar <= ctl+2)' });
  const c2 = ctl.medianSurvival ? (arm.medianSurvival >= 0.8 * ctl.medianSurvival) : true;
  bars.push({ id: 'C2-survival', pass: c2, detail: 'median survival arm ' + arm.medianSurvival + 'd vs ctl ' + ctl.medianSurvival + 'd (bar >= 0.8x ctl)' });
  const c3 = arm.deaths <= ctl.deaths + 16;
  bars.push({ id: 'C3-community-loss', pass: c3, detail: 'village deaths arm ' + arm.deaths + ' vs ctl ' + ctl.deaths + ' (bar <= ctl+16)' });
  const instrOk = ctl.errors === 0 && arm.errors === 0;
  bars.push({ id: 'instrument', pass: instrOk, detail: 'instrument errors ctl ' + ctl.errors + ' / arm ' + arm.errors + ' (bar 0)' });
  let verdict = 'GO', kind = null;
  if (!poolOk) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (!bars.every(function (b) { return b.pass; })) { verdict = 'NO-GO'; kind = 'BAR-MISS'; }
  return { verdict: verdict, kind: kind, bars: bars };
}

// ---- selftest ----
function selftest() {
  let p = 0, f = 0;
  function ck(n, c, x) { if (c) p++; else { f++; console.log('SELFTEST FAIL: ' + n + (x ? ' — ' + x : '')); } }
  // Synthetic per-seed doc builder.
  function doc(o) {
    return Object.assign({ v4departs: [], v4encounters: [], senseTraces: [],
      instrumentErrors: [], deaths: [], won: false, scaleRank: 'regional',
      maxWave: 4, standing: 199, gameDays: 150, endReason: 'survived' }, o);
  }
  function tr(o) {
    return Object.assign({ seq: 1, day: 10, fighter: 'h1', fighterExped: { tx: 3, ty: 3, sinceDay: 10 },
      trueCompanions: [], planParty: null, returned: [], inFight: true }, o);
  }
  // (a) dedupe: two traces same fighter-day collapse to one meeting.
  (function () {
    const d = doc({ senseTraces: [tr({ seq: 1 }), tr({ seq: 2 })] });
    ck('dedupe collapses same fighter-day', meetingsOf(d).length === 1);
  })();
  // (b) denominator/numerator: >=2 true companions + 2 returned = full.
  (function () {
    const d = doc({ senseTraces: [
      tr({ fighter: 'h1', day: 10, trueCompanions: ['c1', 'c2'], returned: ['c1', 'c2'] }),
      tr({ fighter: 'h1', day: 11, trueCompanions: ['c1', 'c2'], returned: ['c1'] }),
      tr({ fighter: 'h2', day: 10, trueCompanions: ['c1'], returned: ['c1'] }),
    ] });
    const s = summarizeLeg([{ seed: 1, r: d }]);
    ck('denominator counts only >=2-true meetings', s.denom === 2, 'got ' + s.denom);
    ck('numerator counts full returns only', s.numer === 1, 'got ' + s.numer);
    ck('sense rate 1/2', s.senseRate === 0.5);
    ck('raw denominator counts all trace-meetings', s.rawDenom === 3);
  })();
  // (c) non-inFight traces and missing expeditions are not meetings.
  (function () {
    const d = doc({ senseTraces: [
      tr({ inFight: false, trueCompanions: ['c1', 'c2'], returned: ['c1', 'c2'] }),
      tr({ fighterExped: null, trueCompanions: ['c1', 'c2'], returned: ['c1', 'c2'] }),
    ] });
    ck('non-fight / no-expedition traces excluded', meetingsOf(d).length === 0);
  })();
  // (d) launch-with-party join: encounter row fielded 2 launch companions.
  (function () {
    const d = doc({
      v4departs: [{ day: 9, vid: 'h1', result: 'launch', targetWave: 4, party: ['c1', 'c2'] }],
      v4encounters: [{ day: 10, vid: 'h1', allyVids: ['c1', 'c2'] }],
      senseTraces: [tr({ day: 10, trueCompanions: ['c1', 'c2'], returned: ['c1', 'c2'] })],
    });
    const s = summarizeLeg([{ seed: 1, r: d }]);
    ck('fielded counts when encounter fields 2 launch companions', s.fielded === 1 && s.fieldedDenom === 1, JSON.stringify([s.fielded, s.fieldedDenom]));
    ck('no conflation when returned are launch members', s.conflated === 0);
  })();
  // (e) conflation: returned vid from a different same-target party.
  (function () {
    const d = doc({
      v4departs: [{ day: 9, vid: 'h1', result: 'launch', targetWave: 4, party: ['c1', 'c2'] }],
      v4encounters: [{ day: 10, vid: 'h1', allyVids: ['c1', 'x9'] }],
      senseTraces: [tr({ day: 10, trueCompanions: ['c1', 'c2', 'x9'], returned: ['c1', 'x9'] })],
    });
    const s = summarizeLeg([{ seed: 1, r: d }]);
    ck('conflation counts a returned non-launch member', s.conflated === 1, 'got ' + s.conflated);
    ck('fielded misses when only 1 launch companion fields', s.fielded === 0);
  })();
  // (f) no-launch meetings counted separately, not as conflation.
  (function () {
    const d = doc({ senseTraces: [tr({ day: 10, trueCompanions: ['c1', 'c2'], returned: ['c1', 'c2'] })] });
    const s = summarizeLeg([{ seed: 1, r: d }]);
    ck('no-launch counted, not conflated', s.noLaunch === 1 && s.conflated === 0);
  })();
  // (g) judge: GO bar, gap bar, pool floor, cost bars.
  (function () {
    function leg(o) { return Object.assign({ launches: 8, denom: 6, numer: 6, senseRate: 1, rawDenom: 6, rawNumer: 6, fielded: 0, fieldedDenom: 0, noEncounter: 0, conflated: 0, noLaunch: 0, errors: 0, wins: 0, national: 0, wave5: 0, wave4: 0, standing200: 0, survived150: 0, deaths: 10, starvation: 0, gameDays: [150], medianSurvival: 150, perSeed: [] }, o); }
    const ctl = leg({ senseRate: 0.2, denom: 5, numer: 1 });
    const arm = leg({});
    ck('judge GO when all bars pass', judge(ctl, arm).verdict === 'GO', JSON.stringify(judge(ctl, arm)));
    ck('judge NO-GO when gap < 0.30', judge(leg({ senseRate: 0.75, denom: 5, numer: 3 }), arm).verdict === 'NO-GO');
    ck('judge NO-GO when arm rate < 0.80', judge(ctl, leg({ senseRate: 0.7, denom: 6, numer: 4 })).verdict === 'NO-GO');
    ck('judge METRIC-BROKEN when arm denom < 4', judge(ctl, leg({ denom: 3, numer: 3, senseRate: 1 })).kind === 'METRIC-BROKEN');
    ck('judge METRIC-BROKEN when launches < 6', judge(leg({ launches: 5 }), arm).kind === 'METRIC-BROKEN');
  })();
  // (h) launches definition: only result launch + targetWave >= 4.
  (function () {
    const d = doc({ v4departs: [
      { day: 1, vid: 'a', result: 'launch', targetWave: 4, party: ['b'] },
      { day: 2, vid: 'a', result: 'launch', targetWave: 3, party: ['b'] },
      { day: 3, vid: 'a', result: 'hold', targetWave: 4, party: [] },
    ] });
    ck('launches counts wave-4+ launches only', launchesOf(d).length === 1);
  })();
  console.log('analyze-senseexped-b --selftest: ' + p + ' passed, ' + f + ' failed');
  return f === 0;
}

function main() {
  const ctlRows = load(CTL_DIR, 'ctl');
  const armRows = load(ARM_DIR, 'arm');
  const ctl = summarizeLeg(ctlRows);
  const arm = summarizeLeg(armRows);
  const j = judge(ctl, arm);
  const out = { arm: 'senseexped-b', seeds: SEEDS, verdict: j.verdict, kind: j.kind,
    bars: j.bars, ctl: ctl, arm: arm };
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind,
    ctlSense: ctl.senseRate, armSense: arm.senseRate,
    ctlDenom: ctl.denom, armDenom: arm.denom,
    ctlLaunches: ctl.launches, armLaunches: arm.launches,
    ctlField: ctl.fieldRate, armField: arm.fieldRate,
    conflated: { ctl: ctl.conflated, arm: arm.conflated },
    wall: { ctl: { wins: ctl.wins, national: ctl.national, wave5: ctl.wave5, wave4: ctl.wave4, standing200: ctl.standing200, median: ctl.medianSurvival },
            arm: { wins: arm.wins, national: arm.national, wave5: arm.wave5, wave4: arm.wave4, standing200: arm.standing200, median: arm.medianSurvival } },
    bars: j.bars.map(function (b) { return b.id + ':' + (b.pass ? 'PASS' : 'FAIL'); }),
  }, null, 2));
  return j;
}

if (require.main === module) {
  if (process.argv.includes('--selftest')) { process.exit(selftest() ? 0 : 1); }
  main();
}
module.exports = { summarizeLeg: summarizeLeg, meetingsOf: meetingsOf, launchesOf: launchesOf, judge: judge, joinLaunch: joinLaunch, joinEncounter: joinEncounter, selftest: selftest };
