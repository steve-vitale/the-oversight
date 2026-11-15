// analyze-onlylead-b.js — analyzer for the DIAG arm sim-onlylead-b
// (run fleshout-loop-b-20261115T1055Z). WHY only the lead shape stages?
// Reads the per-seed JSONs from scripts/onlylead-driver-20261115.js and
// produces, per seed and per shape (lead / conquest / belong /
// covenant / trade): staged (with sat/unsat) or the ONE named blocker
// from the frozen taxonomy in evidence/2026-11-15/sim-onlylead-b-prereg.md.
// The taxonomy is code-grounded (docs/SCALE.md + src/js/hierarchy.js
// _havenPolity / polityOf / _belongPolity / _covenantPolity /
// _tradePolity / _checkNational): the analyzer assigns the first
// matching branch, in order, never by hand.
// Usage: node scripts/analyze-onlylead-b.js [controlDir] [onDir]
//   writes evidence/2026-11-15/onlylead-b-analysis.json and prints a
//   human summary to stdout.
// As a module: { classifyShape, analyzeShapes, analyze }.
// Base wall-number aggregates reuse the answercourt analyzer
// (analyze-answercourt-b.js) on the same records — the DIAG adds the
// per-shape layer, it does not re-derive the wall numbers.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { analyze: baseAnalyze } = require(path.join(REPO, 'scripts', 'analyze-answercourt-b'));

const SHAPES = ['lead', 'conquest', 'belong', 'covenant', 'trade'];
// Priority order for shadowing (docs/SCALE.md + _havenPolity):
// lead → belong → covenant → trade (conquest is the polityOf(HOME)
// variant of lead, same priority slot as lead).
const PRIORITY = { lead: 0, conquest: 0, belong: 1, covenant: 2, trade: 3 };

function candOf(sn, shape) {
  try { return (sn.shapeCands || {})[shape] || null; } catch (e) { return null; }
}
function roadOf(sn) {
  return sn.road || { nPrimSeas: 0, nConq: 0, nConqSeas: 0, nCovFormed: 0, nCovSeas: 0, nTradeFormed: 0, nTradeSeas: 0, bestBelong: null };
}

// Classify ONE shape on ONE per-seed record. Returns
// { shape, outcome: 'staged' | 'blocked' | 'UNCLASSIFIED',
//   blocker: string|null, qualifiedDays, firstQualDay,
//   stagedDays: [], answers, sat, diedAloud }.
function classifyShape(rec, shape) {
  const series = rec.series || [];
  const evs = rec.verbEvents || [];
  let qualifiedDays = 0, firstQualDay = null;
  const stagedDays = [];
  const qualified = []; // {day, pendingShape, nationalLive}
  for (const sn of series) {
    const c = candOf(sn, shape);
    if (c) {
      qualifiedDays++;
      if (firstQualDay === null) firstQualDay = sn.d;
      qualified.push({
        day: sn.d,
        pendingShape: sn.pendingNational ? sn.pendingNational.shape : null,
        nationalLive: !!sn.nationalLive,
        rungDay: sn.rungDay | 0,
      });
    }
    if (sn.pendingNational && sn.pendingNational.shape === shape && stagedDays.indexOf(sn.d) < 0) stagedDays.push(sn.d);
  }
  let answers = 0, sat = 0, diedAloud = 0;
  for (const ev of evs) {
    if (ev.verb !== 'answerNationalChoice' || ev.shape !== shape) continue;
    answers++;
    if (ev.result === 'sat') sat++;
    else if (ev.result === 'died-aloud') diedAloud++;
    if (stagedDays.indexOf(ev.day) < 0) stagedDays.push(ev.day);
  }
  stagedDays.sort(function (a, b) { return a - b; });
  const base = { shape: shape, qualifiedDays: qualifiedDays, firstQualDay: firstQualDay, stagedDays: stagedDays, answers: answers, sat: sat, diedAloud: diedAloud };

  // STAGED: the shape staged a beat (series truth; the answer event
  // corroborates and carries sat/unsat).
  if (stagedDays.length) return Object.assign(base, { outcome: 'staged', blocker: null });

  // QUALIFIED BUT NEVER STAGED: rung gate first, then shadowing.
  if (qualifiedDays > 0) {
    const allBeforeRung = qualified.every(function (q) { return q.day < q.rungDay; });
    if (allBeforeRung) return Object.assign(base, { outcome: 'blocked', blocker: shape + '-rung-gate' });
    // Shadowing: on some qualified day a HIGHER-priority beat was
    // pending, or national was already live under another shape.
    const shadowCounts = {};
    for (const q of qualified) {
      if (q.pendingShape && q.pendingShape !== shape && PRIORITY[q.pendingShape] < PRIORITY[shape]) {
        shadowCounts[q.pendingShape] = (shadowCounts[q.pendingShape] || 0) + 1;
      } else if (q.nationalLive) {
        shadowCounts['national-live'] = (shadowCounts['national-live'] || 0) + 1;
      }
    }
    const shadows = Object.keys(shadowCounts).sort(function (a, b) { return shadowCounts[b] - shadowCounts[a]; });
    if (shadows.length) {
      const top = shadows[0];
      return Object.assign(base, { outcome: 'blocked', blocker: shape + '-shadowed:' + top });
    }
    // Qualified after the rung, nothing pending or live, never staged:
    // the engine should have staged it. That is an instrument mystery,
    // not a diagnosis — UNCLASSIFIED by design.
    return Object.assign(base, { outcome: 'UNCLASSIFIED', blocker: null });
  }

  // NEVER QUALIFIED: the road-state maxima name the failing gate.
  let maxPrimSeas = 0, maxConq = 0, maxConqSeas = 0;
  let maxCovFormed = 0, maxCovSeas = 0, maxTradeFormed = 0, maxTradeSeas = 0;
  let bestBelong = null; // max-trust Haven-subordinate link seen
  for (const sn of series) {
    const r = roadOf(sn);
    if ((r.nPrimSeas | 0) > maxPrimSeas) maxPrimSeas = r.nPrimSeas | 0;
    if ((r.nConq | 0) > maxConq) maxConq = r.nConq | 0;
    if ((r.nConqSeas | 0) > maxConqSeas) maxConqSeas = r.nConqSeas | 0;
    if ((r.nCovFormed | 0) > maxCovFormed) maxCovFormed = r.nCovFormed | 0;
    if ((r.nCovSeas | 0) > maxCovSeas) maxCovSeas = r.nCovSeas | 0;
    if ((r.nTradeFormed | 0) > maxTradeFormed) maxTradeFormed = r.nTradeFormed | 0;
    if ((r.nTradeSeas | 0) > maxTradeSeas) maxTradeSeas = r.nTradeSeas | 0;
    const bb = r.bestBelong;
    if (bb && (!bestBelong || (bb.trust | 0) > (bestBelong.trust | 0))) bestBelong = bb;
  }
  let blocker = null;
  if (shape === 'lead') {
    blocker = 'lead-subs-short:' + maxPrimSeas;
  } else if (shape === 'conquest') {
    if (maxConq === 0) blocker = 'conquest-no-raids';
    else blocker = 'conquest-mixed:' + maxConq + '-of-' + maxPrimSeas;
  } else if (shape === 'belong') {
    if (!bestBelong) blocker = 'belong-no-sub-link';
    else if ((bestBelong.trust | 0) < 50) blocker = 'belong-trust-short:' + (bestBelong.trust | 0);
    else if ((bestBelong.arrears | 0) > 0) blocker = 'belong-arrears:' + (bestBelong.arrears | 0);
    else if ((bestBelong.age | 0) < 14) blocker = 'belong-age-short:' + (bestBelong.age | 0) + 'd';
    else blocker = 'belong-foreign-small:' + (bestBelong.foreignSize | 0);
  } else if (shape === 'covenant') {
    if (maxCovFormed === 0) blocker = 'covenant-no-peer-links';
    else blocker = 'covenant-seasoned-short:' + maxCovSeas + '-of-' + maxCovFormed;
  } else if (shape === 'trade') {
    if (maxTradeFormed === 0) blocker = 'trade-no-peer-links';
    else blocker = 'trade-seasoned-short:' + maxTradeSeas + '-of-' + maxTradeFormed;
  }
  return Object.assign(base, { outcome: blocker ? 'blocked' : 'UNCLASSIFIED', blocker: blocker });
}

// analyzeShapes: per-seed per-shape classification + band rollup.
// Returns { perSeed: {key: {seed, policy, shapes: {shape: result},
//   unclassified}}, byShape: {shape: {staged, blockedBy: {blocker: n},
//   unclassified, qualifiedSeeds}}, unclassified }.
function analyzeShapes(records) {
  const perSeed = {};
  const byShape = {};
  for (const s of SHAPES) byShape[s] = { staged: 0, blockedBy: {}, unclassified: 0, qualifiedSeeds: 0 };
  let unclassified = 0;
  for (const rec of records) {
    const key = rec.seed + '-' + rec.policy;
    const shapes = {};
    for (const s of SHAPES) {
      const r = classifyShape(rec, s);
      shapes[s] = r;
      if (r.outcome === 'staged') byShape[s].staged++;
      else if (r.outcome === 'blocked') {
        byShape[s].blockedBy[r.blocker] = (byShape[s].blockedBy[r.blocker] || 0) + 1;
      } else { byShape[s].unclassified++; unclassified++; }
      if (r.qualifiedDays > 0) byShape[s].qualifiedSeeds++;
    }
    perSeed[key] = { seed: rec.seed, policy: rec.policy, shapes: shapes, unclassified: SHAPES.filter(function (s) { return shapes[s].outcome === 'UNCLASSIFIED'; }).length };
  }
  return { perSeed: perSeed, byShape: byShape, unclassified: unclassified };
}

function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// analyze: base wall numbers (answercourt analyzer) + shape layer.
function analyze(records) {
  const base = baseAnalyze(records);
  const shapes = analyzeShapes(records);
  // Dominant blocker per shape per policy leg (the G2 reproducibility
  // read: the same blocker family on ≥6/8 seeds is a diagnosis).
  const byPolicy = {};
  for (const rec of records) {
    const key = rec.seed + '-' + rec.policy;
    const ps = shapes.perSeed[key];
    if (!ps) continue;
    if (!byPolicy[rec.policy]) byPolicy[rec.policy] = { n: 0, shapes: {} };
    byPolicy[rec.policy].n++;
    for (const s of SHAPES) {
      if (!byPolicy[rec.policy].shapes[s]) byPolicy[rec.policy].shapes[s] = { staged: 0, blockedBy: {}, unclassified: 0 };
      const r = ps.shapes[s];
      if (r.outcome === 'staged') byPolicy[rec.policy].shapes[s].staged++;
      else if (r.outcome === 'blocked') byPolicy[rec.policy].shapes[s].blockedBy[r.blocker] = (byPolicy[rec.policy].shapes[s].blockedBy[r.blocker] || 0) + 1;
      else byPolicy[rec.policy].shapes[s].unclassified++;
    }
  }
  // Caller split for the peer/raid verbs: who ever proposes covenant /
  // trade or raids — policy or engine? (Settles the "policy never
  // proposes" branch of the taxonomy against live data.)
  const verbCallers = {};
  for (const rec of records) {
    for (const ev of (rec.verbEvents || [])) {
      if (ev.verb !== 'proposeCovenant' && ev.verb !== 'proposeTrade' && ev.verb !== 'raidVillage' && ev.verb !== '_formPeerLink') continue;
      const k = ev.verb + ':' + ev.caller;
      verbCallers[k] = (verbCallers[k] || 0) + 1;
    }
  }
  // Foreign-polity size maxima per seed (the BELONG precondition,
  // read live): max foreign realm size over the run.
  const foreignMax = {};
  for (const rec of records) {
    let m = 0;
    for (const sn of (rec.series || [])) {
      for (const fp of (sn.foreign || [])) if ((fp.size | 0) > m) m = fp.size | 0;
    }
    foreignMax[rec.seed + '-' + rec.policy] = m;
  }
  return Object.assign(base, { shapes: shapes, byPolicyShapes: byPolicy, verbCallers: verbCallers, foreignMax: foreignMax });
}

if (require.main === module) (async function () {
  const controlDir = process.argv[2] || path.join(REPO, 'evidence', '2026-11-15', 'perseed-onlylead-b-control');
  const onDir = process.argv[3] || path.join(REPO, 'evidence', '2026-11-15', 'perseed-onlylead-b-on');
  const records = [];
  for (const dir of [controlDir, onDir]) {
    const files = fs.readdirSync(dir).filter(function (f) { return f.slice(-5) === '.json'; }).sort();
    for (const f of files) records.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  const out = analyze(records);
  const outPath = path.join(REPO, 'evidence', '2026-11-15', 'onlylead-b-analysis.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');
  for (const pol of Object.keys(out.byPolicyShapes)) {
    console.log(pol + ': n=' + out.byPolicyShapes[pol].n);
    for (const s of SHAPES) {
      const sh = out.byPolicyShapes[pol].shapes[s];
      console.log('  ' + s + ' staged=' + sh.staged + ' unclassified=' + sh.unclassified + ' blockedBy=' + JSON.stringify(sh.blockedBy));
    }
  }
  for (const k of Object.keys(out.shapes.perSeed).sort()) {
    const ps = out.shapes.perSeed[k];
    const line = SHAPES.map(function (s) {
      const r = ps.shapes[s];
      return s + ':' + (r.outcome === 'staged' ? 'STAGED(sat ' + r.sat + '/' + r.answers + ')' : (r.outcome === 'blocked' ? r.blocker : 'UNCLASSIFIED')) + ' q' + r.qualifiedDays;
    }).join(' | ');
    console.log(k + ' :: ' + line);
  }
  console.log('verbCallers (peer/raid): ' + JSON.stringify(out.verbCallers));
  console.log('foreignMax: ' + JSON.stringify(out.foreignMax));
  console.log('UNCLASSIFIED total: ' + out.shapes.unclassified);
  console.log('wrote ' + path.relative(REPO, outPath));
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { classifyShape: classifyShape, analyzeShapes: analyzeShapes, analyze: analyze, SHAPES: SHAPES };
