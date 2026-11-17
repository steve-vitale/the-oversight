// test-rumortarget-a.js — proof for arm sim-rumortarget-a (BUILD).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the lever exists and is env-gated (RUMORTARGET=1,
// default OFF); the attach rule picks the highest-wave fresh told
// tale from a living teller and rejects stale / dead-teller / untold /
// moot / wave<3 tales; the attach writes target + needWave +
// provenance stamps and voices one honest line naming the beast the
// holder heard about (monsterDisplayName) and the teller; origin is
// stamped heard vs fought at creation and the refresh attaches only
// to heard, target-null, gear/party/hunt plans; the old-code-fails
// control (identical setup, env OFF) leaves the target null; the
// wave-4 AND wave-5 id sets match the data; the driver wraps the
// attach method, locks LEG to competent, and records tale supply;
// the analyzer counts the frozen primary on synthetic corpora (4/8
// pass, 3/8 fail); and the determinism legs D1 (repeatability) +
// D2 (wrap neutrality) are green at 60d on seed 103101 under
// RUMORTARGET=1, LEG=competent.
// Usage:
//   node scripts/test-rumortarget-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-rumortarget-a.js'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitOut(args) {
  try { return execSync('git ' + args, { cwd: REPO }).toString().trim(); }
  catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- 1. Static ----------
console.log('== static ==');
// The src diff on this branch is the lever, and only the lever:
// win-plan.js (the attach method + HavenTick wiring + origin stamp).
const srcDiffFiles = gitOut('diff master...HEAD --name-only -- src/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
check('src diff on this branch is win-plan.js only', JSON.stringify(srcDiffFiles) === JSON.stringify(['src/js/win-plan.js']), JSON.stringify(srcDiffFiles));
const scriptsStatus = gitOut('status --porcelain -- scripts/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) {
  return /scripts\/(rumortarget-driver-20261117|analyze-rumortarget-a|test-rumortarget-a|build-rumortarget-panels-20261117)\.js$/.test(s);
});
check('scripts worktree diff is rumortarget-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('lever: winPlanRumorAttach exists', winPlanJs.indexOf('winPlanRumorAttach(vid, atCreation)') !== -1);
check('lever: env gate reads RUMORTARGET=1, default OFF',
  winPlanJs.indexOf("process.env.RUMORTARGET === '1'") !== -1);
check('lever: third target-write site is the tale attach (plan.target = best.mid)',
  winPlanJs.indexOf('plan.target = best.mid') !== -1);
check('lever: attach mirrors the seed (plan.needWave = best.wave)',
  winPlanJs.indexOf('plan.needWave = best.wave') !== -1);
check('lever: provenance stamps (targetSource/targetTeller/targetTaleDay)',
  winPlanJs.indexOf("plan.targetSource = 'tale'") !== -1 &&
  winPlanJs.indexOf('plan.targetTeller = best.teller') !== -1 &&
  winPlanJs.indexOf('plan.targetTaleDay = best.taleDay') !== -1);
check('lever: origin stamp at creation (heard vs fought)',
  winPlanJs.indexOf("origin: foughtEngaged ? 'fought' : 'heard'") !== -1);
check('lever: creation + refresh call sites in winPlanHavenTick',
  winPlanJs.indexOf('this.winPlanRumorAttach(vid, true)') !== -1 &&
  winPlanJs.indexOf('this.winPlanRumorAttach(vid, false)') !== -1);
check('lever: freshness window is 30 days (prereg choice, named)',
  winPlanJs.indexOf('RUMOR_TALE_FRESH_DAYS = 30') !== -1);
check('lever: played-only tales (untold/moot excluded)',
  winPlanJs.indexOf("if (!t.played) { entry.reason = 'untold'") !== -1);
check('lever: teller-alive gate (roster + not fallen)',
  winPlanJs.indexOf("entry.reason = 'teller-dead'") !== -1);
check('lever: voice line names the heard beast (monsterDisplayName + firstRef)',
  winPlanJs.indexOf('this.monsterDisplayName(best.mid)') !== -1 &&
  winPlanJs.indexOf('this.firstRef(best.teller)') !== -1);
check('lever: ontology header lists winPlanRumorAttach + the rumor-target rule',
  winPlanJs.indexOf('winPlanRumorAttach(vid, atCreation)') !== -1 &&
  winPlanJs.indexOf('winplan_rumor_target') !== -1);
// Anchors that must still hold (the two pre-existing write sites).
check('anchor: seed writes target only for gear/party (early return present)',
  winPlanJs.indexOf("plan.stage !== 'gear' && plan.stage !== 'party'") !== -1);
check('anchor: seed is wave-gated to wave 3+',
  winPlanJs.indexOf("(mdef.wave || 1) < 3") !== -1);
check('anchor: seed target write exists', winPlanJs.indexOf('plan.target = mdef.id') !== -1);
check('anchor: launchParty companion target copy exists', winPlanJs.indexOf('cplan.target = plan.target') !== -1);
check('anchor: target is born null in exactly 3 creation literals',
  (winPlanJs.match(/target: null/g) || []).length === 3,
  'got ' + (winPlanJs.match(/target: null/g) || []).length);
check('anchor: no target-clearing assignment anywhere in win-plan.js',
  (winPlanJs.match(/\.target\s*=\s*null/g) || []).length === 0,
  'got ' + (winPlanJs.match(/\.target\s*=\s*null/g) || []).length);
check('anchor: exactly ONE plan-deletion site (tableActive in HavenTick)',
  (winPlanJs.match(/delete v\.winPlan\[vid\]/g) || []).length === 1,
  'got ' + (winPlanJs.match(/delete v\.winPlan\[vid\]/g) || []).length);
check('anchor: killerTaleBeat stamps played on told tales (game.js)',
  fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8').indexOf('t.played = true') !== -1);
// Wave-4 AND wave-5 id sets match the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'].sort();
check('wave-4 id set matches monsters.json (10 ids)', JSON.stringify(liveW4) === JSON.stringify(frozenW4), JSON.stringify(liveW4));
const liveW5 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
const frozenW5 = ['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot'].sort();
check('wave-5 id set matches monsters.json (10 ids)', JSON.stringify(liveW5) === JSON.stringify(frozenW5), JSON.stringify(liveW5));
// Policy sha (frozen in the prereg — current master; the rumorplan-a
// test's 74a890f0844e predates the journey r127/r128/r140 landings).
function sha12(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', file), 'utf8')).digest('hex').slice(0, 12);
}
check('competent policy sha is df9b7dff4de4', sha12('competent.js') === 'df9b7dff4de4', 'got ' + sha12('competent.js'));
// Driver + analyzer + panel builder.
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'rumortarget-driver-20261117.js'), 'utf8');
check('driver locks LEG to competent (any other LEG is a hard stop)',
  driverSrc.indexOf("LEG is locked to competent") !== -1);
check('driver wraps winPlanRumorAttach', driverSrc.indexOf('origRumorAttach') !== -1 && driverSrc.indexOf('rumortargetAttaches') !== -1);
check('driver records taleSupply (killerTales + vetKillerTales + logs)',
  driverSrc.indexOf('taleSupply') !== -1 && driverSrc.indexOf('killerTaleLog') !== -1);
check('driver has RUMORTARGET_RECORDER off-switch', driverSrc.indexOf('RUMORTARGET_RECORDER') !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver writes to evidence/2026-11-17', driverSrc.indexOf("'evidence', '2026-11-17'") !== -1);
check('driver keeps the rumorplan capture (launches + target-diffs + census)',
  driverSrc.indexOf('rumorplanLaunches') !== -1 && driverSrc.indexOf('seedattachCreations') !== -1);
const panelSrc = fs.readFileSync(path.join(REPO, 'scripts', 'build-rumortarget-panels-20261117.js'), 'utf8');
check('panel builder reads the 103101-103108 band, control vs on',
  panelSrc.indexOf('103101') !== -1 && panelSrc.indexOf('perseed-rumortarget-a-control') !== -1 &&
  panelSrc.indexOf('perseed-rumortarget-a-on') !== -1);
check('analyzer exports analyzeLeg', typeof ANALYZE.analyzeLeg === 'function');

// ---------- 2. Attach-rule unit fixtures (live Game, fabricated state) ----------
console.log('== attach-rule fixtures (live Game) ==');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
let Game = null;
let HOLDER = null, TELLER = null, TELLER2 = null;
let SAY_LINES = [];
async function setupLive() {
  const loaded = await loadGame({ seed: 103101, mode: 'rumortarget-test', fullTelemetry: false });
  Game = loaded.Game;
  await setupGame(Game);
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (v) { return v !== Game.villagerId; });
  // Holder + tellers: real roster villagers (teller-alive needs roster membership).
  HOLDER = roster[0];
  TELLER = roster[1];
  TELLER2 = roster[2];
  const origSay = Game.say;
  Game.say = function () {
    try { if (typeof arguments[0] === 'string') SAY_LINES.push(String(arguments[0])); } catch (e) {}
    return origSay.apply(this, arguments);
  };
}
function setDay(d) { Game.state.scholar.day = d; }
function setTales(list) {
  Game.state.killerTales = list.filter(function (t) { return !t.vet; }).map(function (t) { return { mid: t.mid, killer: t.killer, day: t.day, told: !!t.told, played: !!t.played }; });
  Game.state.vetKillerTales = list.filter(function (t) { return !!t.vet; }).map(function (t) { return { mid: t.mid, killer: t.killer, day: t.day, told: !!t.told, played: !!t.played }; });
}
function setFallen(vids) {
  Game.state.village.fallen = (vids || []).map(function (v) { return { villagerId: v }; });
}
function setPlan(vid, over) {
  Game.state.village.winPlan = Game.state.village.winPlan || {};
  const base = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1, origin: 'heard' };
  Game.state.village.winPlan[vid] = Object.assign(base, over || {});
  return Game.state.village.winPlan[vid];
}
function clearPlan(vid) { try { delete Game.state.village.winPlan[vid]; } catch (e) {} }
function envOn() { process.env.RUMORTARGET = '1'; }
function envOff() { delete process.env.RUMORTARGET; }

async function attachFixtures() {
  await setupLive();
  const day = 40;
  setDay(day);
  // 1. Highest wave wins; freshest breaks the wave tie.
  envOn();
  setFallen([]);
  setTales([
    { mid: 'redactor', killer: TELLER, day: day, told: true, played: true }, // wave 3
    { mid: 'eater', killer: TELLER, day: day - 5, told: true, played: true }, // wave 4, older
    { mid: 'strike', killer: TELLER2, day: day - 1, told: true, played: true }, // wave 4, freshest
  ]);
  let plan = setPlan(HOLDER, {});
  SAY_LINES = [];
  let ret = Game.winPlanRumorAttach(HOLDER, false);
  check('attach picks highest wave then freshest (strike, w4, 1d old)',
    ret && ret.mid === 'strike' && ret.wave === 4 && plan.target === 'strike' && plan.needWave === 4,
    JSON.stringify(ret && { mid: ret.mid, wave: ret.wave }));
  check('attach stamps provenance (tale + teller + taleDay)',
    plan.targetSource === 'tale' && plan.targetTeller === TELLER2 && plan.targetTaleDay === day - 1,
    JSON.stringify({ s: plan.targetSource, t: plan.targetTeller, d: plan.targetTaleDay }));
  const beastName = Game.monsterDisplayName('strike');
  check('voice line names the heard beast descriptor + the teller',
    SAY_LINES.length === 1 && SAY_LINES[0].indexOf(beastName) !== -1 && SAY_LINES[0].indexOf('tale of') !== -1,
    JSON.stringify(SAY_LINES));
  clearPlan(HOLDER);
  // 2. Stale tale (>30d) excluded; fresh wave-3 tale attaches instead.
  setTales([
    { mid: 'eater', killer: TELLER, day: day - 31, told: true, played: true },
    { mid: 'redactor', killer: TELLER, day: day - 2, told: true, played: true },
  ]);
  plan = setPlan(HOLDER, {});
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('stale tale (31d) excluded; fresh wave-3 tale attaches',
    ret && ret.mid === 'redactor' && ret.wave === 3 && plan.target === 'redactor',
    JSON.stringify(ret && { mid: ret.mid, wave: ret.wave }));
  check('stale rejection is named in considered',
    (ret.considered || []).some(function (c) { return c.mid === 'eater' && c.reason === 'stale'; }),
    JSON.stringify(ret.considered));
  clearPlan(HOLDER);
  // 3. Dead teller excluded.
  setFallen([TELLER]);
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, {});
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('dead teller excluded (no attach, plan untouched)',
    ret && ret.mid === null && plan.target === null && plan.needWave === undefined,
    JSON.stringify({ mid: ret && ret.mid, target: plan.target }));
  check('dead-teller rejection is named in considered',
    (ret.considered || []).some(function (c) { return c.reason === 'teller-dead'; }),
    JSON.stringify(ret.considered));
  clearPlan(HOLDER);
  setFallen([]);
  // 4. Untold + moot tales excluded; wave-2 tale excluded.
  setTales([
    { mid: 'eater', killer: TELLER, day: day, told: false, played: false },
    { mid: 'strike', killer: TELLER, day: day, told: true, played: false }, // moot
    { mid: 'mirror_stag', killer: TELLER, day: day, told: true, played: true }, // wave 2
  ]);
  plan = setPlan(HOLDER, {});
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('untold + moot + wave-2 tales all excluded (no attach)',
    ret && ret.mid === null && plan.target === null,
    JSON.stringify({ mid: ret && ret.mid }));
  clearPlan(HOLDER);
  // 5. Env OFF is the old-code control: identical setup, no attach.
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, {});
  envOff();
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('OLD-CODE CONTROL: env OFF returns null, plan untouched',
    ret === null && plan.target === null && plan.needWave === undefined,
    JSON.stringify({ ret: ret, target: plan.target }));
  clearPlan(HOLDER);
  envOn();
  // 6. Non-heard plans are never attached (fought origin, no origin).
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { origin: 'fought' });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('fought-origin plan is NOT attached', ret === null && plan.target === null);
  clearPlan(HOLDER);
  plan = setPlan(HOLDER, {});
  delete plan.origin;
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('origin-less (read/companion) plan is NOT attached', ret === null && plan.target === null);
  clearPlan(HOLDER);
  // 7. Standing/table stages are never attached; a targeted plan is never re-attached.
  plan = setPlan(HOLDER, { stage: 'standing' });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('standing-stage plan is NOT attached', ret === null && plan.target === null);
  clearPlan(HOLDER);
  plan = setPlan(HOLDER, { stage: 'table' });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('table-stage plan is NOT attached', ret === null && plan.target === null);
  clearPlan(HOLDER);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3 });
  SAY_LINES = [];
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('targeted plan is never re-attached (target kept, no voice line)',
    ret === null && plan.target === 'redactor' && SAY_LINES.length === 0);
  clearPlan(HOLDER);
  // 8. Vet tales (repeat wave-4 kills) attach too.
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true, vet: true }]);
  plan = setPlan(HOLDER, {});
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('vet tale (repeat wave-4 kill) attaches',
    ret && ret.mid === 'eater' && plan.target === 'eater',
    JSON.stringify(ret && { mid: ret.mid }));
  clearPlan(HOLDER);
}

// ---------- 3. Live HavenTick probe (creation + refresh, env ON vs OFF) ----------
console.log('== live HavenTick probe ==');
async function havenTickProbe() {
  // Reuse the loaded Game from the fixtures (same process, same state).
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const day = (Game.state.scholar || {}).day || 0;
  setDay(day);
  // Find a ranger standing at Haven.
  const roster = v.roster || [];
  let holder = null;
  for (const vid of roster) {
    if (vid === Game.villagerId) continue;
    let prof = null;
    try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) {}
    if (prof !== 'wanderer' && prof !== 'explorer') continue;
    let node = null;
    try { node = Game.npcNode ? Game.npcNode(vid) : null; } catch (e) {}
    if (!node || node.nx !== hx || node.ny !== hy) continue;
    holder = vid;
    break;
  }
  check('probe setup: a ranger stands at Haven', !!holder, 'roster=' + roster.length + ' haven=(' + hx + ',' + hy + ')');
  if (!holder) return;
  // The holder fought nothing (fresh setup: know is empty); the village
  // has slain a wave-4 beast; its tale was told at the fire by a living
  // teller. That is the rumor-born creation shape.
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    const kn = a && a.know ? a.know[holder] : null;
    if (kn) kn.fought = [];
  } catch (e) {}
  Game.state.villageSlain = { eater: 1 };
  setFallen([]);
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  clearPlan(holder);
  envOn();
  SAY_LINES = [];
  const created = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE creation: HavenTick creates a heard plan WITH a wave-4 target (env ON)',
    !!created && created.origin === 'heard' && created.target === 'eater' && created.needWave === 4,
    JSON.stringify(created && { origin: created.origin, target: created.target, needWave: created.needWave }));
  check('LIVE creation: the attach voice line names the beast the holder heard about',
    SAY_LINES.length >= 1 && SAY_LINES.some(function (l) { return l.indexOf(Game.monsterDisplayName('eater')) !== -1; }),
    JSON.stringify(SAY_LINES));
  // The identical setup with the env OFF: plan born, target null.
  clearPlan(holder);
  envOff();
  SAY_LINES = [];
  const createdOff = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE OLD-CODE CONTROL: HavenTick creates the heard plan target-null (env OFF)',
    !!createdOff && createdOff.origin === 'heard' && createdOff.target === null,
    JSON.stringify(createdOff && { origin: createdOff.origin, target: createdOff.target }));
  check('LIVE OLD-CODE CONTROL: no attach voice line with env OFF',
    SAY_LINES.filter(function (l) { return /beast to hunt/.test(l); }).length === 0,
    JSON.stringify(SAY_LINES));
  // Refresh: a pre-existing heard plan (env ON) takes a fresh tale later.
  envOn();
  clearPlan(holder);
  setTales([]); // no tale at birth: plan born target-null
  Game.state.villageSlain = { eater: 1 };
  const bornNull = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE refresh setup: plan born target-null with no tale to hear',
    !!bornNull && bornNull.target === null, JSON.stringify(bornNull && { target: bornNull.target }));
  setTales([{ mid: 'strike', killer: TELLER2, day: day, told: true, played: true }]);
  const refreshed = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE refresh: the same heard plan takes the fresh tale on a later Haven tick',
    !!refreshed && refreshed.target === 'strike' && refreshed.needWave === 4,
    JSON.stringify(refreshed && { target: refreshed.target, needWave: refreshed.needWave }));
  clearPlan(holder);
  envOff();
}

// ---------- 4. Analyzer unit fixtures (frozen primary counting) ----------
console.log('== analyzer fixtures ==');
function minSeed(seed, over) {
  const j = {
    seed: seed, anchorCommit: 'abc123', policySha: 'df9b7dff4de4', recorderOn: true,
    instrumentErrors: [], days: 150, gameDays: 150, endReason: 'survived',
    standing: 120, scaleRank: 'regional', won: false, maxWave: 4, unlockedWave: 4,
    deaths: [], vetSays: [],
    seedattachCreations: [], rumortargetAttaches: [], rumorplanLaunches: [],
    taleSupply: { killerTales: [], vetKillerTales: [], killerTaleLog: [], vetKillerTaleLog: [] },
  };
  return Object.assign(j, over || {});
}
function heardCreation(day, vid) {
  return { day: day, vid: vid, createdBy: 'winPlanHavenTick', creatorSite: 'win-plan.js:winPlanHavenTick',
    fought: [], villageSlainTotal: 3, stageAtCreation: 'gear', targetAtCreation: null };
}
function attachRow(day, vid, mid, wave, atCreation) {
  return { day: day, vid: vid, atCreation: !!atCreation, applicable: true, originBefore: 'heard',
    stageBefore: 'gear', targetBefore: null, result: mid, wave: wave, teller: 't1',
    taleDay: day, taleAge: 0,
    considered: [{ mid: mid, wave: wave, teller: 't1', taleDay: day, age: 0, played: true, tellerAlive: true, eligible: true, reason: null }] };
}
function filesFor(attachSeeds) {
  const files = {};
  for (const s of [103101, 103102, 103103, 103104, 103105, 103106, 103107, 103108]) {
    const over = {};
    if (attachSeeds.indexOf(s) !== -1) {
      over.seedattachCreations = [heardCreation(10, 'v1')];
      over.rumortargetAttaches = [attachRow(20, 'v1', 'eater', 4, false)];
    }
    files[s] = minSeed(s, over);
  }
  return files;
}
(function () {
  const four = ANALYZE.analyzeLeg(filesFor([103101, 103102, 103103, 103104]), 'on');
  check('analyzer: 4/8 seeds with a wave-4 attach count as 4 primary seeds',
    [103101, 103102, 103103, 103104].every(function (s) { return four[s].attachesW45 === 1; }) &&
    [103105, 103106, 103107, 103108].every(function (s) { return four[s].attachesW45 === 0; }),
    JSON.stringify([103101, 103102, 103103, 103104].map(function (s) { return four[s].attachesW45; })));
  const three = ANALYZE.analyzeLeg(filesFor([103101, 103102, 103103]), 'on');
  check('analyzer: 3/8 seeds with a wave-4 attach count as 3 (below the bar)',
    [103101, 103102, 103103].every(function (s) { return three[s].attachesW45 === 1; }) &&
    three[103104].attachesW45 === 0);
  const w3 = ANALYZE.analyzeLeg(filesFor([]), 'on');
  // A wave-3-only attach counts as a mechanism attach, never as a primary seed.
  const w3files = filesFor([]);
  w3files[103101].seedattachCreations = [heardCreation(10, 'v1')];
  w3files[103101].rumortargetAttaches = [attachRow(20, 'v1', 'redactor', 3, true)];
  const w3leg = ANALYZE.analyzeLeg(w3files, 'on');
  check('analyzer: a wave-3 attach counts in attachesW3, not in the primary',
    w3leg[103101].attachesW3 === 1 && w3leg[103101].attachesW45 === 0 && w3leg[103101].attachesAtCreation === 1,
    JSON.stringify({ w3: w3leg[103101].attachesW3, w45: w3leg[103101].attachesW45 }));
  check('analyzer: origin cross-check is clean when stamps agree',
    w3leg[103101].crossMismatches.length === 0, JSON.stringify(w3leg[103101].crossMismatches));
})();

// ---------- 5. Determinism legs D1 + D2 (60d, seed 103101, RUMORTARGET=1, LEG=competent) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60', LEG: 'competent', RUMORTARGET: '1' }, envExtra || {});
  const script = "const d=require('./scripts/rumortarget-driver-20261117.js');" +
    "d.oneRun(103101).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childFingerprint({});
  const b = childFingerprint({});
  check('D1 repeatability: identical full corpus, recorder ON twice (60d, armed)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  check('D1 run carries rumortarget arrays + taleSupply',
    Array.isArray(a.full.rumortargetAttaches) && a.full.taleSupply &&
    Array.isArray(a.full.taleSupply.killerTales) && Array.isArray(a.full.taleSupply.vetKillerTales),
    'attaches=' + (a.full.rumortargetAttaches || []).length);
  check('D1 run has 0 instrument errors', (a.full.instrumentErrors || []).length === 0,
    JSON.stringify((a.full.instrumentErrors || []).slice(0, 3)));
  check('D1 run policy is competent, sha df9b7dff4de4',
    a.full.policy === 'competent' && a.full.policySha === 'df9b7dff4de4',
    'got ' + a.full.policy + '/' + a.full.policySha);
  const off = childFingerprint({ RUMORTARGET_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (60d, armed)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty rumortarget/rumorplan/seedattach/v4/dawnbid arrays',
    (off.full.rumortargetAttaches || []).length === 0 && (off.full.rumorplanLaunches || []).length === 0 &&
    (off.full.rumorplanTargetDiffs || []).length === 0 && (off.full.seedattachBounces || []).length === 0 &&
    (off.full.seedattachCensus || []).length === 0 && (off.full.v4seeds || []).length === 0 &&
    (off.full.dawnbidScores || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
}

(async function () {
  try {
    await attachFixtures();
    await havenTickProbe();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  } finally {
    envOff();
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
