// test-notickexact-a.js — proof for arm sim-notickexact-a (BUILD: defer
// ONLY the exact-population no-tick party_launch commit — part 3 AND plan
// target set AND plan needWave >= 4 — finding #2498 fix candidate,
// exact-population revision of the CONCEPT-DEAD part-3-only shape in
// sim-notickfix3-a).
// Proves the DEFERRAL (live game, via scripts/sim-harness) plus the
// corpus facts it stands on:
//   - static: the fix is present and confined to villager-brain.js
//     (one spot, outside the sibling-owned voice lines 621-704);
//     the homebody (#2499) and holder (#2505) voice lines and
//     firstNameOf (AGUARD body, sim-aguard-a) are untouched; the
//     PROFILEGATE lever stays reverted.
//   - units (live game, seed 103541): a part-3 commit is held ONLY for
//     the exact population (wave-4 targeted plan); a wave-3 plan and a
//     targetless plan still WRITE at part 3; a hunt-stage wave-4 plan
//     is still held (stage is NOT gated); a part-2 commit still writes
//     (part-2 is UNTOUCHED — 2 of 14 baseline late commits launched
//     same-day), part-0/1 commits still write, the deferred pick leaves
//     the villager on their core pick (not the indoor EXPEDITION hold),
//     a same-day part-0 or part-2 commit is cleared by a later part-3
//     deferral (no stale commit survives), and a launchable part-0
//     commit still launches (or is honestly held by a real gate — never
//     silently 'normal').
//   - corpus: both 8-seed corpora clean (run notickexact-a, mode on,
//     recorder on); baseline no-tick ≥ 1 (contact) and armed
//     no-tick = 0 (primary); launches ≥ 90% of baseline; footprint cap
//     (1 ≤ armed deferred bids ≤ 20); cost bar; trajectory control;
//     panel compare status.
//   - gap calibration (prereg-recorded, not re-derived here): the
//     118-vs-14 decomposition was measured pre-run over the notickfix3
//     baseline corpus (branch sim-notickfix3-a, band 103531–103538) with
//     scripts/notickexact-gap-decompose.js and is recorded in
//     evidence/2026-11-18/sim-notickexact-a-prereg.md. That corpus is
//     not in this tree, so the test does not re-derive it.
// D1/D2 live legs (60d, seed 103541, PROFILEGATE=1, armed tip) were
// run during the arm and are recorded in
// evidence/2026-11-18/sim-notickexact-a.md — they are NOT re-run here
// (a proof test must stay fast; the driver legs are the arm's
// evidence, not the test's). The frozen prereg is
// evidence/2026-11-18/sim-notickexact-a-prereg.md.
// Usage:
//   node scripts/test-notickexact-a.js
//   NOTICKEXACT_UNITS_ONLY=1 node scripts/test-notickexact-a.js
//     (static + units only, before the corpora exist)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
const COMPARE = require(path.join(REPO, 'scripts', 'analyze-notickexact-a.js'));

const UNITS_ONLY = process.env.NOTICKEXACT_UNITS_ONLY === '1';

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function preregBase() {
  try {
    const txt = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-18', 'sim-notickexact-a-prereg.md'), 'utf8');
    const m = txt.match(/Base at arm start:\**\s*`([0-9a-f]{7,40})`/);
    return m ? m[1] : null;
  } catch (e) { return null; }
}
function gitDiffNames(base, dir) {
  try {
    return execSync('git diff --name-only ' + base + ' HEAD -- ' + dir, { cwd: REPO }).toString().trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
  } catch (e) { return ['GIT-UNAVAILABLE']; }
}
function mergeBase() {
  try {
    return execSync('git merge-base HEAD master', { cwd: REPO }).toString().trim();
  } catch (e) { return null; }
}

// ---------- 1. Static ----------
function staticChecks() {
console.log('== static ==');
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const winplanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('fix present: NOTICKEXACT marker + exact-population guard in vbrainScorePick',
  brainJs.indexOf('NOTICKEXACT (sim-notickexact-a, finding #2498)') !== -1 &&
  brainJs.indexOf("logged.winPlanAction === 'party_launch' && partOf(this) === 3") !== -1 &&
  brainJs.indexOf("entry.deferred = 'party_launch:no-tick-exact'") !== -1);
check('fix gates on the plan target + needWave (exact population, not every part-3 pick)',
  brainJs.indexOf('_ntPlan.target != null') !== -1 &&
  brainJs.indexOf('(_ntPlan.needWave | 0) >= 4') !== -1 &&
  brainJs.indexOf('_ntVv.winPlan[vid]') !== -1);
check('fix does NOT defer part-2 (no partOf(this) >= 2 deferral guard)',
  brainJs.indexOf("partOf(this) >= 2") === -1);
check('fix clears the stale commit on deferral (delete br.commit[vid])',
  brainJs.indexOf('delete _ntBr.commit[vid]') !== -1);
check('sibling-owned voice lines untouched: homebody (#2499) + holder (#2505) lines present verbatim',
  brainJs.indexOf('asked ') !== -1 &&
  brainJs.indexOf(' to walk out with the party — but ') !== -1 &&
  brainJs.indexOf(' never leaves Haven, so ') !== -1 &&
  brainJs.indexOf(' meant to walk out with ') !== -1 &&
  brainJs.indexOf(' stays home.') !== -1);
check('firstNameOf untouched (AGUARD body, sim-aguard-a #2509)',
  brainJs.indexOf('function firstNameOf(name) {') !== -1 &&
  brainJs.indexOf('AGUARD (sim-aguard-a, finding #2509)') !== -1 &&
  brainJs.indexOf("if (/^an? /i.test(s)) return s;") !== -1);
check('profilegate lever stays reverted: no profilegateOn() helper in either twin',
  brainJs.indexOf('profilegateOn') === -1 && winplanJs.indexOf('profilegateOn') === -1);
check('unguarded profile check PRESENT in both twins (master behavior)',
  brainJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1 &&
  winplanJs.indexOf("if (prof !== 'wanderer' && prof !== 'explorer') continue;") !== -1);
if (!UNITS_ONLY) {
  const BASE = preregBase();
  console.log('  info: prereg base ' + BASE);
  check('prereg base resolves', !!BASE);
  // Confinement is the BRANCH's contribution: anchor on the merge-base
  // with master, not the prereg base. The prereg base (03c53bf6e) predates
  // the muster growth line (titans.js + game.js) that landed on master
  // before this branch rebased; diffing against it would count master
  // landings as this branch's change. The fix itself is byte-identical
  // across the rebase (verified by diff). (Adoption correction 2026-11-18.)
  const MB = mergeBase();
  console.log('  info: merge-base with master ' + MB);
  const srcDiff = MB ? gitDiffNames(MB, 'src/') : ['NO-BASE'];
  check('src/ diff vs merge-base is EXACTLY the fix (villager-brain.js only)',
    JSON.stringify(srcDiff) === JSON.stringify(['src/js/villager-brain.js']),
    'diff=' + JSON.stringify(srcDiff));
}
check('prereg + instrument files exist (prereg, wrapper, panel builder, gap script)',
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-18', 'sim-notickexact-a-prereg.md')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'analyze-notickexact-a.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'build-notickexact-panels-20261117.js')) &&
  fs.existsSync(path.join(REPO, 'scripts', 'notickexact-gap-decompose.js')));
}

// ---------- 2. Deferral units (live game) ----------
// Synthetic party_launch candidate in the real winPlanCands shape:
// {kind:'EXPEDITION', w:5.0, companion, vbrainSrc:'win_plan',
//  winPlanAction:'party_launch', considerations:[...]}.
// The fix reads the plan from state.village.winPlan[vid] (same read as
// winPlanCands), so each unit sets that villager's plan first.
function launchCand(companion) {
  return { kind: 'EXPEDITION', w: 5.0, companion: companion,
    vbrainSrc: 'win_plan', winPlanAction: 'party_launch',
    considerations: [
      { id: 'win_plan_stage', raw: 1, note: 'party' },
      { id: 'companion', raw: 1, note: String(companion) },
    ] };
}
function coreCand() {
  return { kind: 'FORAGE', w: 1.0 };
}
async function unitChecks() {
console.log('== deferral units (live game, seed 103541) ==');
const { Game } = await loadGame({ seed: 103541, mode: 'notickexact-test', fullTelemetry: false });
await setupGame(Game);
const village = (Game.state || {}).village || {};
const roster = (village.roster || []).slice();
const alive = roster.filter(function (vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; return p && !p.dead; } catch (e) { return false; }
});
check('roster has live villagers to score', alive.length >= 8, 'alive=' + alive.length);
function atHaven(vid) {
  try { const n = Game.npcNode ? Game.npcNode(vid) : null; return !!(n && n.nx === 4 && n.ny === 4); } catch (e) { return false; }
}
const atHome = alive.filter(atHaven);
check('villagers are at Haven (4,4) at setup', atHome.length >= 7, 'atHome=' + atHome.length);
function setPlan(vid, plan) {
  try {
    if (!village.winPlan) village.winPlan = {};
    village.winPlan[vid] = plan;
  } catch (e) {}
}
function scoreAt(vid, part, companion) {
  Game.dayPart = part;
  const ret = Game.vbrainScorePick(vid, [coreCand(), launchCand(companion)], { rng: Math.random });
  let commit = null;
  try { commit = (typeof Game.vbrainCommit === 'function') ? Game.vbrainCommit(vid) : null; } catch (e) {}
  let log = null;
  try { log = (typeof Game.vbrainLastLog === 'function') ? Game.vbrainLastLog(vid) : null; } catch (e) {}
  return { ret: ret, commit: commit, log: log };
}
const v0 = atHome[0], v1 = atHome[1], v2 = atHome[2], v3 = atHome[3], v4 = atHome[4], v5 = atHome[5], v6 = atHome[6];
const comp = atHome[7] || atHome[0];
const W4_PARTY = { target: 'eulogy', stage: 'party', needWave: 4, node: { nx: 5, ny: 5 }, party: [comp] };
const W4_HUNT = { target: 'reunion', stage: 'hunt', needWave: 4, node: { nx: 5, ny: 5 }, party: [comp] };
const W3_PARTY = { target: 'redactor', stage: 'party', needWave: 3, node: { nx: 5, ny: 5 }, party: [comp] };
const TARGETLESS = { target: null, stage: 'hunt', needWave: null, node: null, party: [] };
// U1: part-0 commit writes.
setPlan(v0, W4_PARTY);
let r = scoreAt(v0, 0, comp);
check('U1 part-0 party_launch writes a commit (a commit with a tick left still writes)',
  !!r.commit && r.commit.winPlanAction === 'party_launch' && r.commit.part === 0 && r.commit.kind === 'EXPEDITION',
  JSON.stringify(r.commit));
// U2: part-1 commit writes.
setPlan(v1, W4_PARTY);
r = scoreAt(v1, 1, comp);
check('U2 part-1 party_launch writes a commit',
  !!r.commit && r.commit.winPlanAction === 'party_launch' && r.commit.part === 1,
  JSON.stringify(r.commit));
// U3: part-2 commit WRITES (part-2 is untouched by the part-3-only fix).
setPlan(v2, W4_PARTY);
r = scoreAt(v2, 2, comp);
check('U3 part-2 party_launch still WRITES a commit (part-2 untouched; 2 of 14 baseline late commits launched same-day)',
  !!r.commit && r.commit.winPlanAction === 'party_launch' && r.commit.part === 2,
  'commit=' + JSON.stringify(r.commit));
// U3b: with the part-2 commit written, align rewrites to the EXPEDITION hold (master behavior preserved).
(function () {
  const o = { kind: 'FORAGE', purpose: 'forage', indoor: false, state: 'ready' };
  const out = Game.vbrainAlignObjective(v2, o, 4, 4);
  check('U3b after a part-2 write the objective becomes the EXPEDITION hold (master behavior, not the core pick)',
    out && out.kind === 'EXPEDITION' && out.indoor === true, 'kind=' + (out && out.kind) + ' indoor=' + (out && out.indoor));
})();
// U4: part-3 commit held for the EXACT population (wave-4 targeted plan).
setPlan(v3, W4_PARTY);
r = scoreAt(v3, 3, comp);
check('U4 part-3 party_launch is HELD for a wave-4 targeted plan: no commit written, log marked deferred',
  !r.commit && !!r.log && r.log.deferred === 'party_launch:no-tick-exact',
  'commit=' + JSON.stringify(r.commit) + ' deferred=' + (r.log && r.log.deferred));
// U4b: the deferred pick leaves the core pick (align does not rewrite to the hold).
(function () {
  const o = { kind: 'FORAGE', purpose: 'forage', indoor: false, state: 'ready' };
  const out = Game.vbrainAlignObjective(v3, o, 4, 4);
  check('U4b after a part-3 deferral the objective stays the core pick (FORAGE, not the EXPEDITION hold)',
    out && out.kind === 'FORAGE' && !out.indoor, 'kind=' + (out && out.kind));
})();
// U4c: hunt-stage wave-4 plan is STILL held (stage is NOT gated — 8 of the
// 14 calibration no-tick selections were stage hunt at score time).
setPlan(v6, W4_HUNT);
r = scoreAt(v6, 3, comp);
check('U4c part-3 party_launch is HELD for a hunt-stage wave-4 plan (stage not gated)',
  !r.commit && !!r.log && r.log.deferred === 'party_launch:no-tick-exact',
  'commit=' + JSON.stringify(r.commit) + ' deferred=' + (r.log && r.log.deferred));
// U4d: wave-3 plan still WRITES at part 3 (not the exact population).
setPlan(v4, W3_PARTY);
r = scoreAt(v4, 3, comp);
check('U4d part-3 party_launch still WRITES for a wave-3 plan (not the diag population)',
  !!r.commit && r.commit.winPlanAction === 'party_launch' && r.commit.part === 3,
  'commit=' + JSON.stringify(r.commit));
// U4e: targetless plan still WRITES at part 3 (not the exact population).
setPlan(v5, TARGETLESS);
r = scoreAt(v5, 3, comp);
check('U4e part-3 party_launch still WRITES for a targetless plan (not the diag population)',
  !!r.commit && r.commit.winPlanAction === 'party_launch' && r.commit.part === 3,
  'commit=' + JSON.stringify(r.commit));
// U5: a same-day part-0 commit is cleared by a later part-3 deferral (no stale commit survives).
(function () {
  const vid = v0;
  const before = Game.vbrainCommit(vid);
  const rr = scoreAt(vid, 3, comp);
  check('U5 part-3 deferral clears the earlier same-day part-0 commit (recorder reads null, not a stale party_launch)',
    !!before && before.winPlanAction === 'party_launch' && before.part === 0 && !rr.commit,
    'before=' + JSON.stringify(before) + ' after=' + JSON.stringify(rr.commit));
})();
// U5b: a same-day part-2 commit is cleared by a later part-3 deferral too.
(function () {
  const vid = v2;
  const before = Game.vbrainCommit(vid);
  const rr = scoreAt(vid, 3, comp);
  check('U5b part-3 deferral clears the earlier same-day part-2 commit (its launch chance already passed at the part-2 tick)',
    !!before && before.winPlanAction === 'party_launch' && before.part === 2 && !rr.commit,
    'before=' + JSON.stringify(before) + ' after=' + JSON.stringify(rr.commit));
})();
// U6: a launchable part-0 commit still launches (or is honestly held by a real gate — never silently 'normal').
(function () {
  // Pick a launchable pair: holder + companion both able to walk.
  let holder = null, companion = null;
  for (let i = 0; i < atHome.length && !holder; i++) {
    for (let j = 0; j < atHome.length && !holder; j++) {
      if (i === j) continue;
      let hd = -1, cd = -1;
      try { hd = Game.npcMaxDist ? Game.npcMaxDist(atHome[i]) : -1; } catch (e) {}
      try { cd = Game.npcMaxDist ? Game.npcMaxDist(atHome[j]) : -1; } catch (e) {}
      if (hd >= 1 && cd >= 1) { holder = atHome[i]; companion = atHome[j]; }
    }
  }
  check('U6 setup: a launchable holder+companion pair exists at Haven', !!holder && !!companion,
    'holder=' + holder + ' companion=' + companion);
  if (!holder) return;
  // Inject a wave-4 plan in 'party' stage with a node, as the win-plan feeder would see it.
  setPlan(holder, { target: 'strike', stage: 'party', needWave: 4, node: { nx: 5, ny: 5 }, party: [companion] });
  const rr = scoreAt(holder, 0, companion);
  check('U6a part-0 commit writes for the launch pair',
    !!rr.commit && rr.commit.winPlanAction === 'party_launch' && rr.commit.companion === companion,
    JSON.stringify(rr.commit));
  let res = null;
  try { res = Game.vbrainExecuteDepart(holder, 4, 4, false); } catch (e) { res = 'THREW:' + String(e.message).slice(0, 60); }
  let exped = false;
  try { const a = Game.agencyState ? Game.agencyState() : null; exped = !!(a && a.exped && a.exped[holder]); } catch (e) {}
  check('U6b a launchable part-0 commit still executes (launch stands, or an honest hold — never silent normal)',
    res === 'launch' || res === 'hold',
    'result=' + res + ' exped=' + exped);
  if (res === 'launch') {
    check('U6c the launch actually stands (holder expedition record exists)',
      exped === true, 'exped=' + exped);
  }
})();
// U7: after a part-3 deferral, execute finds nothing to do ('normal').
(function () {
  let res = null;
  try { res = Game.vbrainExecuteDepart(v3, 4, 4, false); } catch (e) { res = 'THREW:' + String(e.message).slice(0, 60); }
  check('U7 after a part-3 deferral, vbrainExecuteDepart returns normal (no commit to execute)',
    res === 'normal', 'result=' + res);
})();
}

// ---------- 3. Corpus ----------
function loadDir(dir) {
  const bySeed = {};
  const files = [];
  for (const f of fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j; files.push(f);
  }
  return { bySeed: bySeed, files: files };
}
function corpusChecks() {
console.log('== corpus ==');
check('C1 prereg + evidence + analyses + panel compare exist',
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-18', 'sim-notickexact-a-prereg.md')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-18', 'sim-notickexact-a.md')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-18', 'notickexact-a-analysis.json')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-18', 'notickexact-a-base-analysis.json')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-18', 'notickexact-a-panel.json')) &&
  fs.existsSync(path.join(REPO, 'evidence', '2026-11-18', 'notickexact-a-panel.md')));
const a = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-18', 'notickexact-a-analysis.json'), 'utf8'));
check('C2 baseline corpus: 8 files, 0 instrument errors',
  a.files.base === 8 && a.instrumentErrors.base === 0,
  'files=' + a.files.base + ' errors=' + a.instrumentErrors.base);
check('C3 armed corpus: 8 files, 0 instrument errors',
  a.files.armed === 8 && a.instrumentErrors.armed === 0,
  'files=' + a.files.armed + ' errors=' + a.instrumentErrors.armed);
(function () {
  const leg = loadDir(path.join(REPO, 'evidence', '2026-11-17', 'perseed-notickexact-a-base'));
  let ok = Object.keys(leg.bySeed).length === 8;
  for (const k of Object.keys(leg.bySeed)) {
    const j = leg.bySeed[k];
    if (j.run !== 'notickexact-a' || j.mode !== 'on' || j.recorderOn !== true) ok = false;
    if ((j.instrumentErrors || []).length) ok = false;
  }
  check('C2b baseline files carry the notickexact-a run + on mode + recorder on', ok);
})();
(function () {
  const leg = loadDir(path.join(REPO, 'evidence', '2026-11-17', 'perseed-notickexact-a-armed'));
  let ok = Object.keys(leg.bySeed).length === 8;
  for (const k of Object.keys(leg.bySeed)) {
    const j = leg.bySeed[k];
    if (j.run !== 'notickexact-a' || j.mode !== 'on' || j.recorderOn !== true) ok = false;
    if ((j.instrumentErrors || []).length) ok = false;
  }
  check('C3b armed files carry the notickexact-a run + on mode + recorder on', ok);
})();
check('C4 PRIMARY: baseline no-tick ≥ 1 (contact) and armed no-tick = 0',
  a.noTick.base >= 1 && a.noTick.armed === 0,
  'base=' + a.noTick.base + ' armed=' + a.noTick.armed);
check('C5 launches ≥ 90% of baseline: launched instances AND wave-4+ launch events',
  a.launched.instancesArmed >= 0.9 * a.launched.instancesBase &&
  a.launched.eventsW4Armed >= 0.9 * a.launched.eventsW4Base,
  'instances ' + a.launched.instancesBase + '->' + a.launched.instancesArmed +
  ' eventsW4 ' + a.launched.eventsW4Base + '->' + a.launched.eventsW4Armed);
check('C6 cost bar: median ratio ≥ 0.8, starvation totals armed ≤ base+2, arm-only armed ≤ base-only+2',
  a.wall.medianRatio != null && a.wall.medianRatio >= 0.8 &&
  a.starvation.armedTotal <= a.starvation.baseTotal + 2 &&
  a.starvation.armedOnly <= a.starvation.baseOnly + 2,
  'medianRatio=' + a.wall.medianRatio + ' starv ' + a.starvation.baseTotal + '->' + a.starvation.armedTotal +
  ' arm-only ' + a.starvation.baseOnly + '->' + a.starvation.armedOnly);
check('C7 trajectory control: first divergence ≥ first deferral day on all 8 seeds',
  a.trajectoryPass === true && a.trajectory.length === 8,
  JSON.stringify(a.trajectory.map(function (t) { return t.seed + ':def' + t.firstDeferredDay + '/div' + t.firstDivergenceDay; })));
check('C8 footprint cap: armed deferred bids ≥ 1 AND ≤ 20, baseline = 0 (the fix fired, narrowly, and only the fix defers)',
  a.deferredBids.armedN >= 1 && a.deferredBids.armedN <= 20 && a.deferredBids.baseN === 0,
  'base=' + a.deferredBids.baseN + ' armed=' + a.deferredBids.armedN);
const evidence = fs.readFileSync(path.join(REPO, 'evidence', '2026-11-18', 'sim-notickexact-a.md'), 'utf8');
check('C9 evidence records D1 GREEN and D2 GREEN',
  evidence.indexOf('D1 GREEN') !== -1 && evidence.indexOf('D2 GREEN') !== -1);
(function () {
  const panel = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-18', 'notickexact-a-panel.json'), 'utf8'));
  check('C10 panel compare top-level decision is not regression_signal',
    panel.decision !== 'regression_signal',
    'decision=' + panel.decision);
})();
}

async function main() {
  staticChecks();
  await unitChecks();
  if (!UNITS_ONLY) corpusChecks();
  else console.log('== corpus checks skipped (NOTICKEXACT_UNITS_ONLY=1) ==');
  console.log('== test-notickexact-a: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:\n' + failures.map(function (f) { return '  - ' + f; }).join('\n')); process.exitCode = 1; }
}
if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
