// analyze-gateavoid-b8-a.js — DIAG: what does a B8 meeting do to the
// holder's plan afterward? (finding #2733; prereg
// evidence/2026-11-24/sim-gateavoid-b8-a-prereg.md)
//
// B8 = gate-avoid-plan-exists-no-retarget (frozen taxonomy in
// analyze-retarget-a.js): a gate-avoid meeting where the holder already
// has a plan; the gate resets the stage but never sets the target.
// Corpus: REUSE of the retarget band 109411-109418, both legs (16 seeds),
// declared a replay in the prereg — no fresh-seed claim.
//
// Method: reuse the frozen analyzer (analyzeSeed) for the classified
// meeting rows, then trace each B8 meeting forward through the REST of
// the run (planCensus / v4departs / killCalls / regDeaths+deaths).
// No game code is touched; no new sims run.
//
// Usage: node scripts/analyze-gateavoid-b8-a.js [--selftest]
//        [--out evidence/2026-11-24/gateavoid-b8-a-analysis.json]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.resolve(__dirname, '..');
const retarget = require('./analyze-retarget-a.js');

const CTL_DIR = path.join(REPO, 'evidence', '2026-11-24', 'perseed-retarget-a-ctl');
const ARM_DIR = path.join(REPO, 'evidence', '2026-11-24', 'perseed-retarget-a-arm');
const B8_RULE = 'gate-avoid-plan-exists-no-retarget';

function loadLeg(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort();
  return files.map(function (f) {
    return { file: f, corpus: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) };
  });
}

function firstAfter(rows, vid, d0, pred) {
  let best = null;
  for (const r of rows) {
    if (r.vid !== vid || !(r.day > d0)) continue;
    if (pred && !pred(r)) continue;
    if (!best || r.day < best.day) best = r;
  }
  return best;
}

// Trace one B8 meeting forward through the rest of the run.
function traceB8(corpus, row) {
  const vid = row.vid, d0 = row.day, mid = row.mid;
  const gates = (corpus.v4gates || []).filter(function (g) {
    return g.vid === vid && g.day === d0 && g.mid === mid;
  });
  const gate = gates[0] || null;
  const stageAtGate = gate ? (gate.planStage != null ? gate.planStage : null) : null;
  const targetAtGate = gate ? (gate.planTarget != null ? gate.planTarget : null) : null;
  const needWaveAtGate = gate ? (gate.needWave != null ? gate.needWave : null) : null;
  const shape = targetAtGate === mid ? 'target-already-met'
    : targetAtGate == null ? 'targetless' : 'mistargeted';

  const census = (corpus.planCensus || []).filter(function (c) { return c.vid === vid; });
  const acquired = firstAfter(census, vid, d0, function (c) { return c.target != null; });
  const departs = (corpus.v4departs || []).filter(function (r) { return r.vid === vid; });
  const launch = firstAfter(departs, vid, d0, function (r) { return r.result === 'launch'; });
  const kills = (corpus.killCalls || []).filter(function (k) { return k.by === vid && !k.dup && k.day > d0; });
  kills.sort(function (a, b) { return a.day - b.day; });
  const kill = kills[0] || null;
  const regDeath = (corpus.regDeaths || []).find(function (r) { return r.villagerId === vid; });
  const deathRow = (corpus.deaths || []).find(function (r) { return r.who === vid; });
  const death = regDeath || deathRow || null;
  const deathDay = death ? death.day : null;

  // A launch/kill after the holder's death cannot belong to the holder:
  // post-death rows are ignored (defensive; real corpora should not have them).
  const liveLaunch = (launch && (deathDay == null || launch.day < deathDay)) ? launch : null;
  const liveKill = (kill && (deathDay == null || kill.day < deathDay)) ? kill : null;

  let downstream;
  if (liveLaunch && liveLaunch.target === mid) downstream = 'launched-on-met';
  else if (liveLaunch) downstream = 'launched-other';
  else if (deathDay != null) downstream = 'died-before-launch';
  else if (acquired) downstream = 'target-acquired-never-launched';
  else downstream = 'never-targeted';

  return {
    seed: corpus.seed, leg: corpus.leg || corpus.mode || null,
    day: d0, vid: vid, mid: mid, wave: row.wave, gateReason: gate ? (gate.reason || null) : null,
    gateRowsMatched: gates.length,
    stageAtGate: stageAtGate, targetAtGate: targetAtGate, needWaveAtGate: needWaveAtGate,
    partySizeAtGate: gate ? (gate.partySize != null ? gate.partySize : null) : null,
    shape: shape, downstream: downstream,
    acquiredDay: acquired ? acquired.day : null,
    acquiredTarget: acquired ? acquired.target : null,
    acquiredNeedWave: acquired ? (acquired.needWave != null ? acquired.needWave : null) : null,
    launchDay: liveLaunch ? liveLaunch.day : null,
    launchTarget: liveLaunch ? (liveLaunch.target != null ? liveLaunch.target : null) : null,
    launchTargetWave: liveLaunch ? (liveLaunch.targetWave != null ? liveLaunch.targetWave : null) : null,
    launchStage: liveLaunch ? (liveLaunch.stage || null) : null,
    killDay: liveKill ? liveKill.day : null,
    killMid: liveKill ? liveKill.mid : null,
    killWave: liveKill ? (liveKill.wave != null ? liveKill.wave : null) : null,
    killOnMet: liveKill ? liveKill.mid === mid : false,
    deathDay: deathDay,
    endDay: corpus.days, endReason: corpus.endReason || null,
  };
}

function analyzeLeg(dir, label) {
  const files = loadLeg(dir);
  const meetings = [];
  for (const f of files) {
    const a = retarget.analyzeSeed(f.corpus);
    const b8 = (a.meetings || []).filter(function (m) { return m.rule === B8_RULE; });
    for (const row of b8) meetings.push(traceB8(f.corpus, row));
  }
  return { label: label, seeds: files.length, b8Count: meetings.length, meetings: meetings };
}

function agg(meetings) {
  const by = {};
  function bump(k) { by[k] = (by[k] || 0) + 1; }
  for (const m of meetings) {
    bump('shape:' + m.shape);
    bump('downstream:' + m.downstream);
    bump('shapeXdown:' + m.shape + '|' + m.downstream);
    bump('wave:' + m.wave);
    if (m.shape === 'targetless' && m.wave >= 4) bump('targetless-wave4plus');
    if (m.shape === 'mistargeted' && m.wave >= 4) bump('mistargeted-wave4plus');
    if (m.killOnMet) bump('killed-met-later');
    if (m.launchDay != null && m.launchTarget === m.mid) bump('launched-on-met');
  }
  return by;
}

function analyzeAll() {
  const ctl = analyzeLeg(CTL_DIR, 'ctl');
  const arm = analyzeLeg(ARM_DIR, 'arm');
  const all = ctl.meetings.concat(arm.meetings);
  const w4 = function (ms) { return ms.filter(function (m) { return m.wave === 4; }).length; };
  return {
    arm: 'gateavoid-b8-a', corpus: 'retarget band 109411-109418 (replay, both legs)',
    ctl: { seeds: ctl.seeds, b8Count: ctl.b8Count, w4B8Count: w4(ctl.meetings), agg: agg(ctl.meetings) },
    armLeg: { seeds: arm.seeds, b8Count: arm.b8Count, w4B8Count: w4(arm.meetings), agg: agg(arm.meetings) },
    pooled: { seeds: ctl.seeds + arm.seeds, b8Count: all.length, w4B8Count: w4(all), agg: agg(all) },
    meetings: all,
  };
}

// ---- selftest ----
function check(name, cond, detail) {
  if (!cond) throw new Error('SELFTEST FAIL: ' + name + (detail ? ' — ' + detail : ''));
  return name;
}
function selftest() {
  const passed = [];
  function mkCorpus(o) {
    return Object.assign({
      seed: 999001, leg: 'ctl', days: 100, endReason: 'survived',
      v4gates: [], planCensus: [], v4departs: [], killCalls: [], regDeaths: [], deaths: [],
    }, o);
  }
  // T1: targetless meeting, holder later launches on the met monster.
  let c = mkCorpus({
    v4gates: [{ vid: 'v1', day: 10, mid: 'gavel', planStage: 'hunt', planTarget: null, needWave: null }],
    planCensus: [{ vid: 'v1', day: 12, target: 'gavel', needWave: 3, stage: 'party' }],
    v4departs: [{ vid: 'v1', day: 13, result: 'launch', target: 'gavel', targetWave: 3, stage: 'party' }],
    killCalls: [{ by: 'v1', day: 20, mid: 'gavel', wave: 3, dup: false }],
  });
  let t = traceB8(c, { vid: 'v1', day: 10, mid: 'gavel', wave: 3 });
  passed.push(check('T1 targetless+launched-on-met', t.shape === 'targetless' && t.downstream === 'launched-on-met' && t.acquiredDay === 12 && t.killOnMet === true, JSON.stringify(t)));
  // T2: targetless, never targets, never launches, alive at end.
  c = mkCorpus({
    v4gates: [{ vid: 'v2', day: 5, mid: 'audit', planStage: 'party', planTarget: null, needWave: null }],
    planCensus: [{ vid: 'v2', day: 6, target: null }, { vid: 'v2', day: 50, target: null }],
  });
  t = traceB8(c, { vid: 'v2', day: 5, mid: 'audit', wave: 4 });
  passed.push(check('T2 targetless+never-targeted', t.shape === 'targetless' && t.downstream === 'never-targeted', JSON.stringify(t)));
  // T3: mistargeted, holder dies before any launch (a launch after the
  // death day is ignored by the live-launch guard).
  c = mkCorpus({
    v4gates: [{ vid: 'v3', day: 8, mid: 'eater', planStage: 'hunt', planTarget: 'gavel', needWave: 3 }],
    regDeaths: [{ villagerId: 'v3', day: 30 }],
    v4departs: [{ vid: 'v3', day: 40, result: 'launch', target: 'eater' }],
  });
  t = traceB8(c, { vid: 'v3', day: 8, mid: 'eater', wave: 4 });
  passed.push(check('T3 mistargeted+died-before-launch', t.shape === 'mistargeted' && t.downstream === 'died-before-launch' && t.deathDay === 30, JSON.stringify(t)));
  // T4: target already met (no-op meeting), launches on it later.
  c = mkCorpus({
    v4gates: [{ vid: 'v4', day: 3, mid: 'gavel', planStage: 'hunt', planTarget: 'gavel', needWave: 3 }],
    v4departs: [{ vid: 'v4', day: 4, result: 'launch', target: 'gavel', targetWave: 3, stage: 'hunt' }],
  });
  t = traceB8(c, { vid: 'v4', day: 3, mid: 'gavel', wave: 3 });
  passed.push(check('T4 target-already-met+launched-on-met', t.shape === 'target-already-met' && t.downstream === 'launched-on-met', JSON.stringify(t)));
  // T5: target acquired later but never launches.
  c = mkCorpus({
    v4gates: [{ vid: 'v5', day: 9, mid: 'audit', planStage: 'hunt', planTarget: null, needWave: null }],
    planCensus: [{ vid: 'v5', day: 11, target: 'audit', needWave: 4, stage: 'party' }],
    v4departs: [{ vid: 'v5', day: 12, result: 'hold', target: 'audit' }],
  });
  t = traceB8(c, { vid: 'v5', day: 9, mid: 'audit', wave: 4 });
  passed.push(check('T5 target-acquired-never-launched', t.shape === 'targetless' && t.downstream === 'target-acquired-never-launched' && t.acquiredTarget === 'audit', JSON.stringify(t)));
  // T6: determinism — analyzeAll twice, byte-identical.
  const r1 = JSON.stringify(analyzeAll());
  const r2 = JSON.stringify(analyzeAll());
  passed.push(check('T6 determinism', r1 === r2, 'lengths ' + r1.length + ' vs ' + r2.length));
  // T7: wave-4 B8 counts reproduce the retarget evidence exactly
  // (sim-retarget-a.md table: ctl 36 / arm 35, wave-4 meetings).
  // All-wave counts are 36/36 (one non-wave-4 B8 meeting on the arm leg).
  const parsed = JSON.parse(r1);
  passed.push(check('T7 wave-4 B8 counts reproduce retarget (36/35)', parsed.ctl.w4B8Count === 36 && parsed.armLeg.w4B8Count === 35,
    'got ctl ' + parsed.ctl.w4B8Count + ' arm ' + parsed.armLeg.w4B8Count + ' (all-wave ' + parsed.ctl.b8Count + '/' + parsed.armLeg.b8Count + ')'));
  // T8: every meeting traced (0 untraced) — downstream always set.
  passed.push(check('T8 0 untraced', parsed.meetings.every(function (m) { return !!m.downstream && !!m.shape; }),
    'meetings ' + parsed.meetings.length));
  console.log('gateavoid-b8-a selftest: ' + passed.length + ' passed, 0 failed');
  return passed.length;
}

function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    const st = retarget.selftest();
    if (st.fail !== 0 || st.pass !== 38) throw new Error('retarget analyzer selftest NOT green: ' + JSON.stringify(st));
    console.log('retarget analyzer selftest: ' + st.pass + ' passed, 0 failed');
    selftest();
    return;
  }
  const result = analyzeAll();
  const oi = args.indexOf('--out');
  const out = oi !== -1 && args[oi + 1]
    ? args[oi + 1]
    : path.join(REPO, 'evidence', '2026-11-24', 'gateavoid-b8-a-analysis.json');
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({
    ctlB8: result.ctl.b8Count, armB8: result.armLeg.b8Count, pooledB8: result.pooled.b8Count,
    ctlAgg: result.ctl.agg, armAgg: result.armLeg.agg, pooledAgg: result.pooled.agg, out: out,
  }, null, 2));
}

if (require.main === module) main();
module.exports = { traceB8: traceB8, analyzeAll: analyzeAll, selftest: selftest };
