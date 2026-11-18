// analyze-notickexact-a.js — before/after comparison for arm sim-notickexact-a
// (BUILD: defer ONLY the exact-population no-tick party_launch commit —
// part 3 AND plan target set AND plan needWave >= 4 — finding #2498 fix
// candidate, exact-population revision of the CONCEPT-DEAD part-3-only
// shape in sim-notickfix3-a). Reads the two 8-seed corpora
// (PROFILEGATE=1 both legs; baseline without the fix, armed with it),
// runs the FROZEN classifier + tracer (analyze-launchdef-a.js /
// analyze-notick-a.js) over both, and prints the comparison the frozen
// prereg GO bars judge: no-tick-after-commit instances, launched
// instances, wave-4+ launch events, wall numbers, starvation totals +
// arm-only, deferred-bid footprint (part === 3 AND target set AND
// needWave >= 4) + footprint cap, and the trajectory control (no delta
// before the fix's first effect). This is a READ over the corpora: no
// re-classification, no sims. The balanced panel
// (scripts/build-notickexact-panels-20261117.js + balance-panel.js
// compare) is the separate §15 instrument; its verdict is reported
// alongside, never substituted for the frozen bars.
// Usage:
//   node scripts/analyze-notickexact-a.js <baseDir> <armedDir> [outJson]
// Writes the analysis JSON (default:
// evidence/2026-11-18/notickexact-a-analysis.json). Exits 0 iff both
// corpora parse cleanly (8 files each, 0 instrument errors); the GO
// verdict itself is judged by scripts/test-notickexact-a.js, not here.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-profilegate-b.js'));
const TRACER = require(path.join(REPO, 'scripts', 'analyze-notick-a.js'));

function loadDir(dir) {
  const bySeed = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j;
  }
  return { bySeed: bySeed, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function starvOf(rawBySeed) {
  let total = 0, deaths = 0;
  const perSeed = {};
  for (const k of Object.keys(rawBySeed)) {
    const j = rawBySeed[k];
    deaths += (j.deaths || []).length;
    const st = (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;
    perSeed[j.seed] = st;
    total += st;
  }
  return { total: total, deaths: deaths, perSeed: perSeed };
}
function matchedStarv(a, b) {
  // Starvation deaths in A on (seed,day) pairs with no starvation
  // death in B — the matched same-seed same-day cost (launchdef shape).
  const bKeys = {};
  for (const k of Object.keys(b)) {
    const j = b[k];
    for (const d of (j.deaths || [])) if (d.cause === 'starvation') bKeys[j.seed + ':' + d.day] = true;
  }
  let n = 0;
  for (const k of Object.keys(a)) {
    const j = a[k];
    for (const d of (j.deaths || [])) if (d.cause === 'starvation' && !bKeys[j.seed + ':' + d.day]) n++;
  }
  return n;
}
// deferredBids(j): score rows where the pick was party_launch at
// part === 3 but NO commit was written — the deferral's own footprint
// (EXACT population: part 3 AND plan target set AND plan needWave >= 4;
// the dead arms counted part === 3 regardless of plan, and part >= 2
// before that).
// In the baseline (no fix) this must be 0: writeCommit runs for every
// logged pick, so a party_launch pick always leaves a commit behind.
function deferredBids(j) {
  const out = [];
  for (const r of (j.dawnbidScores || [])) {
    const pickAction = r.pick ? (r.pick.winPlanAction || null) : null;
    if (pickAction !== 'party_launch') continue;
    if ((r.part | 0) !== 3) continue;
    if (r.commit) continue;
    const plan = r.plan || {};
    if (plan.target == null) continue;
    if ((plan.needWave | 0) < 4) continue;
    out.push({ seed: j.seed, vid: r.vid, target: (r.plan && r.plan.target) || null,
      day: r.day, part: r.part, corePick: r.pick ? (r.pick.corePick || null) : null,
      pickKind: r.pick ? (r.pick.kind || null) : null });
  }
  return out;
}
// firstDivergenceDay(baseJ, armedJ): the first day whose vetfirst
// daily snapshot differs between the two legs (deep compare), or null
// when the arrays are identical. Daily snapshots carry only game
// state (day, scholarId, waveKillLog, vets, roster, veteranRows,
// partyMembers, ready4/5) — no anchor or recorder metadata — so a
// difference is a real trajectory difference. A length difference
// counts as a divergence at the first missing day.
function firstDivergenceDay(baseJ, armedJ) {
  const a = baseJ.daily || [], b = armedJ.daily || [];
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return (a[i] && a[i].day != null ? a[i].day : i);
  }
  if (a.length !== b.length) {
    const longer = a.length > b.length ? a : b;
    const snap = longer[n];
    return (snap && snap.day != null ? snap.day : n);
  }
  return null;
}
function summarizeLeg(dir) {
  const raw = loadDir(dir);
  const leg = loadDir(dir);
  for (const k of Object.keys(leg.bySeed)) leg.bySeed[k] = ANALYZE.funnelForSeed(leg.bySeed[k]);
  const s = ANALYZE.summarize(leg);
  const st = starvOf(raw.bySeed);
  s.wall.deaths = st.deaths;
  s.wall.starvation = st.total;
  s.starvation = st;
  return { summary: s, raw: raw, files: leg.files.length };
}
function analyzePair(baseDir, armedDir) {
  const base = summarizeLeg(baseDir);
  const armed = summarizeLeg(armedDir);
  const baseTrace = TRACER.analyzeDir(baseDir);
  const armedTrace = TRACER.analyzeDir(armedDir);
  // Deferred-bid footprint per leg.
  const baseDeferred = [], armedDeferred = [];
  for (const k of Object.keys(base.raw.bySeed)) baseDeferred.push.apply(baseDeferred, deferredBids(base.raw.bySeed[k]));
  for (const k of Object.keys(armed.raw.bySeed)) armedDeferred.push.apply(armedDeferred, deferredBids(armed.raw.bySeed[k]));
  // First baseline LATE-COMMIT day per seed (Correction 1.2): the
  // first day with a part-≥2 party_launch commit, any resolution —
  // the fix's first effect on that seed. (The tracer's late list
  // carries exactly those selections.)
  const firstLateBySeed = {};
  for (const l of baseTrace.lateCommits) {
    const s = l.seed;
    if (firstLateBySeed[s] == null || l.day < firstLateBySeed[s]) firstLateBySeed[s] = l.day;
  }
  // First DEFERRAL day per seed: the first day with a part-3
  // party_launch pick whose commit was deferred on the armed leg — the
  // fix's actual first effect on that seed. (The first-baseline-
  // LATE-COMMIT reference assumed the fix fires only on wave-4 instance
  // plans; the dead arms falsified that for their broader gates. This
  // arm's gate IS the wave-4 targeted population, so the two references
  // should agree closely — the armed leg's own footprint is still the
  // authority, since it is the fix's actual first effect.)
  const firstDeferredBySeed = {};
  for (const d of armedDeferred) {
    const s = d.seed;
    if (firstDeferredBySeed[s] == null || d.day < firstDeferredBySeed[s]) firstDeferredBySeed[s] = d.day;
  }
  // Trajectory control per seed (Correction 2): first divergence
  // day ≥ first deferral day, or no divergence when the seed has
  // no deferral.
  const traj = [];
  let trajPass = true;
  for (const k of Object.keys(base.raw.bySeed).sort()) {
    const bj = base.raw.bySeed[k], aj = armed.raw.bySeed[k];
    const divDay = firstDivergenceDay(bj, aj);
    const firstLate = (firstLateBySeed[bj.seed] != null ? firstLateBySeed[bj.seed] : null);
    const firstDef = (firstDeferredBySeed[bj.seed] != null ? firstDeferredBySeed[bj.seed] : null);
    const ok = divDay == null || (firstDef != null && divDay >= firstDef);
    // A seed with no deferral must not diverge at all: ok is
    // already false there when divDay != null (firstDef null).
    if (!ok) trajPass = false;
    traj.push({ seed: bj.seed, firstBaselineLateDay: firstLate, firstDeferredDay: firstDef, firstDivergenceDay: divDay, pass: ok });
  }
  const medBase = base.summary.medianSurvival, medArmed = armed.summary.medianSurvival;
  const medianRatio = (medBase != null && medArmed != null && medBase) ? round(medArmed / medBase, 3) : null;
  const starvBaseOnly = matchedStarv(base.raw.bySeed, armed.raw.bySeed);
  const starvArmedOnly = matchedStarv(armed.raw.bySeed, base.raw.bySeed);
  const go = {
    primaryNoTickArmedZero: armedTrace.noTickSelections === 0,
    primaryContact: baseTrace.noTickSelections >= 1,
    // Frozen bar 2 (parent brief): launches >= 90% of baseline, on both
    // launch measures (launched instances AND wave-4+ launch events).
    launchesHeld: armed.summary.launchedInstances >= 0.9 * base.summary.launchedInstances &&
      armed.summary.launchEventsW4 >= 0.9 * base.summary.launchEventsW4,
    footprintCap: armedDeferred.length >= 1 && armedDeferred.length <= 20,
    costMedian: medianRatio != null && medianRatio >= 0.8,
    costStarvTotals: armed.summary.starvation.total <= base.summary.starvation.total + 2,
    costStarvArmOnly: starvArmedOnly <= starvBaseOnly + 2,
    trajectory: trajPass,
  };
  go.pass = go.primaryNoTickArmedZero && go.primaryContact && go.launchesHeld &&
    go.footprintCap && go.costMedian && go.costStarvTotals && go.costStarvArmOnly && go.trajectory;
  return {
    arm: 'notickexact-a',
    baseDir: path.basename(baseDir), armedDir: path.basename(armedDir),
    files: { base: base.files, armed: armed.files },
    instrumentErrors: { base: baseTrace.instrumentErrors, armed: armedTrace.instrumentErrors },
    noTick: { base: baseTrace.noTickSelections, armed: armedTrace.noTickSelections,
      baseFateTally: baseTrace.fateTally, armedFateTally: armedTrace.fateTally,
      baseTraces: baseTrace.traces, armedTraces: armedTrace.traces },
    lateCommits: { base: baseTrace.lateCommitCount, armed: armedTrace.lateCommitCount,
      baseLaunched: baseTrace.lateCommitLaunched, armedLaunched: armedTrace.lateCommitLaunched,
      baseTally: baseTrace.lateTally, armedTally: armedTrace.lateTally },
    launched: { instancesBase: base.summary.launchedInstances, instancesArmed: armed.summary.launchedInstances,
      eventsW4Base: base.summary.launchEventsW4, eventsW4Armed: armed.summary.launchEventsW4,
      eventsAllBase: base.summary.launchEventsAll, eventsAllArmed: armed.summary.launchEventsAll },
    deferredBids: { base: baseDeferred, armed: armedDeferred,
      baseN: baseDeferred.length, armedN: armedDeferred.length },
    wall: { base: base.summary.wall, armed: armed.summary.wall,
      medianBase: medBase, medianArmed: medArmed, medianRatio: medianRatio,
      survivedBase: base.summary.survived, survivedArmed: armed.summary.survived },
    starvation: { baseTotal: base.summary.starvation.total, armedTotal: armed.summary.starvation.total,
      baseOnly: starvBaseOnly, armedOnly: starvArmedOnly,
      basePerSeed: base.summary.starvation.perSeed, armedPerSeed: armed.summary.starvation.perSeed },
    trajectory: traj, trajectoryPass: trajPass,
    funnel: { base: base.summary.byFunnel, armed: armed.summary.byFunnel,
      baseSub: base.summary.byFunnelSub, armedSub: armed.summary.byFunnelSub },
    go: go,
  };
}

function main() {
  const baseDir = process.argv[2];
  const armedDir = process.argv[3];
  const outFile = process.argv[4] || path.join(REPO, 'evidence', '2026-11-18', 'notickexact-a-analysis.json');
  if (!baseDir || !armedDir) { console.error('NOTICKEXACT ANALYZE STOP: baseDir armedDir required.'); process.exit(2); }
  const a = analyzePair(baseDir, armedDir);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(a, null, 2) + '\n');
  console.log('=== sim-notickexact-a before/after: ' + a.baseDir + ' -> ' + a.armedDir + ' ===');
  console.log('files: base ' + a.files.base + ' armed ' + a.files.armed +
    '  instrumentErrors: base ' + a.instrumentErrors.base + ' armed ' + a.instrumentErrors.armed);
  console.log('no-tick selections: base ' + a.noTick.base + ' armed ' + a.noTick.armed);
  console.log('late commits (part>=2): base ' + a.lateCommits.base + ' (launched ' + a.lateCommits.baseLaunched +
    ') armed ' + a.lateCommits.armed + ' (launched ' + a.lateCommits.armedLaunched + ')');
  console.log('launched instances: base ' + a.launched.instancesBase + ' armed ' + a.launched.instancesArmed +
    '  launch events W4: base ' + a.launched.eventsW4Base + ' armed ' + a.launched.eventsW4Armed);
  console.log('deferred bids: base ' + a.deferredBids.baseN + ' armed ' + a.deferredBids.armedN);
  console.log('wall base: ' + JSON.stringify(a.wall.base) + ' median ' + a.wall.medianBase);
  console.log('wall armed: ' + JSON.stringify(a.wall.armed) + ' median ' + a.wall.medianArmed +
    '  medianRatio ' + a.wall.medianRatio);
  console.log('starvation totals: base ' + a.starvation.baseTotal + ' armed ' + a.starvation.armedTotal +
    '  arm-only: base ' + a.starvation.baseOnly + ' armed ' + a.starvation.armedOnly);
  console.log('trajectory: ' + (a.trajectoryPass ? 'PASS' : 'FAIL') +
    ' ' + JSON.stringify(a.trajectory.map(function (t) { return t.seed + ':def' + t.firstDeferredDay + '/div' + t.firstDivergenceDay + ' (late' + t.firstBaselineLateDay + ')'; })));
  console.log('GO bars: ' + JSON.stringify(a.go));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (a.files.base !== 8 || a.files.armed !== 8 || a.instrumentErrors.base || a.instrumentErrors.armed) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { analyzePair: analyzePair, deferredBids: deferredBids, firstDivergenceDay: firstDivergenceDay };
