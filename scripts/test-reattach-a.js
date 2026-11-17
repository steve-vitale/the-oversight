// test-reattach-a.js — proof for arm sim-reattach-a (BUILD).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the re-attach rule exists and is env-gated (REATTACH=1
// on top of RUMORTARGET=1, both default OFF); a rumor-born plan
// holding a wave-3 target trades up to a fresh told wave-4/5 tale
// while still unlaunched (stage gear/party), and chains upward
// (3->4->5); it NEVER re-attaches downward, same-wave, to the same
// beast, after launch (hunt/standing/table), with REATTACH unset,
// on a stale/dead-teller/untold tale, or on a fought-origin plan;
// the re-attach updates target + needWave + provenance stamps and
// voices its own distinct line naming the new beast, the teller,
// AND the old beast; the old-code-fails controls (both envs OFF;
// RUMORTARGET=1 with REATTACH unset) keep the old target; the
// wave-4 AND wave-5 id sets match the data; the driver wraps the
// attach method, locks LEG to competent, and records re-attach
// rows; the analyzer counts the frozen primary on synthetic
// corpora (4/8 pass with reattach-only seeds, 3/8 fail) and flags
// integrity violations (downward / post-launch re-attaches); and
// the determinism legs D1 (repeatability) + D2 (wrap neutrality)
// are green at 60d on seed 103201 under RUMORTARGET=1 REATTACH=1,
// LEG=competent.
// Usage:
//   node scripts/test-reattach-a.js
//
// MODE NOTE: the lever legs below assume the lever is present on
// this tip (re-applied attach rule + re-attach branch). If the arm
// goes NO-GO and the lever is reverted, the static section runs its
// OFF-MODE legs (lever strings absent, src diff empty) and the
// analyzer fixtures run identically; the live fixture + probe +
// determinism legs are SKIPPED with a printed note, not failed —
// the lever is gone, so there is nothing to probe. (Same shape as
// the sim-proofadapt-a mode-aware pattern on test-rumortarget-a.js.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-reattach-a.js'));

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
const winPlanJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
// MODE DETECTION: the re-attach branch is present iff the REATTACH
// gate is defined in win-plan.js.
const LEVER_PRESENT = winPlanJs.indexOf("process.env.REATTACH === '1'") !== -1;
const ATTACH_PRESENT = winPlanJs.indexOf('winPlanRumorAttach(vid, atCreation)') !== -1;
console.log('mode: ' + (LEVER_PRESENT ? 'LEVER-PRESENT (armed legs)' : 'OFF-MODE (reverted lever)'));
// The src change on this branch is the lever, and only the lever:
// win-plan.js (re-applied attach + re-attach branch + HavenTick
// wiring + origin stamp). Committed or uncommitted — the union of
// the branch diff and the worktree status must be exactly that file.
const srcDiffFiles = gitOut('diff master...HEAD --name-only -- src/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const srcStatusFiles = gitOut('status --porcelain -- src/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean)
  .map(function (s) { return s.replace(/^[MADRCU\? ]+/, '').trim(); });
const srcUnion = Array.from(new Set(srcDiffFiles.concat(srcStatusFiles))).sort();
if (LEVER_PRESENT) {
  check('src change on this branch is win-plan.js only', JSON.stringify(srcUnion) === JSON.stringify(['src/js/win-plan.js']), JSON.stringify(srcUnion));
} else {
  check('off: src change is empty (lever fully reverted)', srcUnion.length === 0, JSON.stringify(srcUnion));
}
const scriptsStatus = gitOut('status --porcelain -- scripts/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) {
  return /scripts\/(rumortarget-driver-20261117|analyze-rumortarget-a|test-rumortarget-a|build-rumortarget-panels-20261117|reattach-driver-20261117|analyze-reattach-a|test-reattach-a|build-reattach-panels-20261117)\.js$/.test(s);
});
check('scripts worktree diff is rumortarget-* + reattach-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
if (LEVER_PRESENT) {
  check('lever: attach method exists (re-applied from rumortarget-a)', ATTACH_PRESENT);
  check('lever: env gates read RUMORTARGET=1 AND REATTACH=1, both default OFF',
    winPlanJs.indexOf("process.env.RUMORTARGET === '1'") !== -1 &&
    winPlanJs.indexOf("process.env.REATTACH === '1'") !== -1);
  check('lever: re-attach branch exists inside winPlanRumorAttach (reattached flag)',
    winPlanJs.indexOf('reattached: false') !== -1 && winPlanJs.indexOf('result.reattached = true') !== -1);
  check('lever: upward-only gate (best.wave <= oldWave blocks)',
    winPlanJs.indexOf("if (best.wave <= result.oldWave) { result.reattachBlocked = 'wave-not-higher'") !== -1);
  check('lever: launched-plan gate (stage-launched block)',
    winPlanJs.indexOf("result.reattachBlocked = 'stage-launched'") !== -1);
  check('lever: REATTACH-off gate (reattach-off block)',
    winPlanJs.indexOf("result.reattachBlocked = 'reattach-off'") !== -1);
  check('lever: re-attach voice line is distinct (changes the hunt, names old beast)',
    winPlanJs.indexOf('changes the hunt') !== -1 && winPlanJs.indexOf('bigger prey than') !== -1);
  check('lever: re-attach refresh call site in winPlanHavenTick (targeted heard plan, gear/party)',
    winPlanJs.indexOf("plan.target && plan.origin === 'heard'") !== -1);
  check('lever: ontology header lists the rumor-reattach rule',
    winPlanJs.indexOf('winplan_rumor_reattach') !== -1);
  check('lever: attach branch still writes target + needWave + provenance',
    winPlanJs.indexOf('plan.target = best.mid') !== -1 &&
    winPlanJs.indexOf('plan.needWave = best.wave') !== -1 &&
    winPlanJs.indexOf("plan.targetSource = 'tale'") !== -1);
} else {
  check('off: no REATTACH read in win-plan.js', winPlanJs.indexOf("process.env.REATTACH === '1'") === -1);
  check('off: no re-attach branch (no reattached flag)', winPlanJs.indexOf('reattached') === -1);
  check('off: no re-attach voice line', winPlanJs.indexOf('changes the hunt') === -1);
}
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
// Policy sha (frozen in the prereg).
function sha12(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', file), 'utf8')).digest('hex').slice(0, 12);
}
check('competent policy sha is df9b7dff4de4', sha12('competent.js') === 'df9b7dff4de4', 'got ' + sha12('competent.js'));
// Driver + analyzer + panel builder.
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'reattach-driver-20261117.js'), 'utf8');
check('driver locks LEG to competent (any other LEG is a hard stop)',
  driverSrc.indexOf('LEG is locked to competent') !== -1);
check('driver wraps winPlanRumorAttach', driverSrc.indexOf('origRumorAttach') !== -1 && driverSrc.indexOf('rumortargetAttaches') !== -1);
check('driver records re-attach fields (reattached / oldTarget / oldWave / reattachBlocked)',
  driverSrc.indexOf('reattached') !== -1 && driverSrc.indexOf('oldTarget') !== -1 &&
  driverSrc.indexOf('reattachBlocked') !== -1 && driverSrc.indexOf('reattachApplicable') !== -1);
check('driver records taleSupply (killerTales + vetKillerTales + logs)',
  driverSrc.indexOf('taleSupply') !== -1 && driverSrc.indexOf('killerTaleLog') !== -1);
check('driver has REATTACH_RECORDER off-switch', driverSrc.indexOf('REATTACH_RECORDER') !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver writes to evidence/2026-11-17', driverSrc.indexOf("'evidence', '2026-11-17'") !== -1);
const panelSrc = fs.readFileSync(path.join(REPO, 'scripts', 'build-reattach-panels-20261117.js'), 'utf8');
check('panel builder uses the fresh band 103201-103208 + reattach corpora',
  panelSrc.indexOf('103201') !== -1 && panelSrc.indexOf('perseed-reattach-a-control') !== -1 &&
  panelSrc.indexOf('perseed-reattach-a-on') !== -1);
check('analyzer exports analyzeLeg', typeof ANALYZE.analyzeLeg === 'function');

// ---------- 2. Re-attach rule unit fixtures (live Game, fabricated state) ----------
console.log('== re-attach-rule fixtures (live Game) ==');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
let Game = null;
let HOLDER = null, TELLER = null, TELLER2 = null;
let SAY_LINES = [];
async function setupLive() {
  const loaded = await loadGame({ seed: 103201, mode: 'reattach-test', fullTelemetry: false });
  Game = loaded.Game;
  await setupGame(Game);
  const roster = (((Game.state || {}).village || {}).roster || []).filter(function (v) { return v !== Game.villagerId; });
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
function envBothOn() { process.env.RUMORTARGET = '1'; process.env.REATTACH = '1'; }
function envAttachOnly() { process.env.RUMORTARGET = '1'; delete process.env.REATTACH; }
function envOff() { delete process.env.RUMORTARGET; delete process.env.REATTACH; }

async function reattachFixtures() {
  await setupLive();
  if (!LEVER_PRESENT) {
    console.log('  (off-mode: lever absent — live fixtures skipped, analyzer fixtures still run)');
    return;
  }
  const day = 40;
  setDay(day);
  envBothOn();
  setFallen([]);
  // 1. Re-attach fires wave-3 -> wave-4; voice line names new beast, teller, AND old beast.
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  let plan = setPlan(HOLDER, { target: 'redactor', needWave: 3, targetSource: 'tale', targetTeller: TELLER2, targetTaleDay: day - 10 });
  SAY_LINES = [];
  let ret = Game.winPlanRumorAttach(HOLDER, false);
  check('re-attach fires wave-3 -> wave-4 (eater, fresh told tale)',
    ret && ret.reattached === true && ret.mid === 'eater' && ret.wave === 4 &&
    ret.oldTarget === 'redactor' && ret.oldWave === 3 &&
    plan.target === 'eater' && plan.needWave === 4,
    JSON.stringify(ret && { mid: ret.mid, wave: ret.wave, old: ret.oldTarget, oldWave: ret.oldWave }));
  check('re-attach refreshes provenance (tale + new teller + new taleDay)',
    plan.targetSource === 'tale' && plan.targetTeller === TELLER && plan.targetTaleDay === day,
    JSON.stringify({ s: plan.targetSource, t: plan.targetTeller, d: plan.targetTaleDay }));
  check('re-attach voice line names the NEW beast, the teller, AND the old beast',
    SAY_LINES.length === 1 &&
    SAY_LINES[0].indexOf(Game.monsterDisplayName('eater')) !== -1 &&
    SAY_LINES[0].indexOf(Game.monsterDisplayName('redactor')) !== -1 &&
    SAY_LINES[0].indexOf('changes the hunt') !== -1,
    JSON.stringify(SAY_LINES));
  clearPlan(HOLDER);
  // 2. Re-attach fires wave-3 -> wave-5 and wave-4 -> wave-5; chains 3->4->5.
  setTales([{ mid: 'editor', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3 });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('re-attach fires wave-3 -> wave-5 (editor)',
    ret && ret.reattached === true && ret.mid === 'editor' && ret.wave === 5 && plan.target === 'editor',
    JSON.stringify(ret && { mid: ret.mid, wave: ret.wave }));
  clearPlan(HOLDER);
  setTales([{ mid: 'editor', killer: TELLER2, day: day - 1, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'eater', needWave: 4 });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('re-attach fires wave-4 -> wave-5 (editor)',
    ret && ret.reattached === true && ret.mid === 'editor' && ret.wave === 5 && plan.target === 'editor',
    JSON.stringify(ret && { mid: ret.mid, wave: ret.wave }));
  clearPlan(HOLDER);
  setTales([{ mid: 'strike', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3 });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('chain step 1: 3 -> 4 (strike)',
    ret && ret.reattached === true && plan.target === 'strike' && plan.needWave === 4);
  setTales([{ mid: 'editor', killer: TELLER2, day: day, told: true, played: true }]);
  SAY_LINES = [];
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('chain step 2: 4 -> 5 (editor) while still unlaunched',
    ret && ret.reattached === true && plan.target === 'editor' && plan.needWave === 5,
    JSON.stringify(ret && { mid: ret.mid, wave: ret.wave }));
  clearPlan(HOLDER);
  // 3. NEVER downward: wave-4 held, wave-3 tale on offer.
  setTales([{ mid: 'redactor', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'eater', needWave: 4 });
  SAY_LINES = [];
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('NEVER downward: wave-4 held, wave-3 tale offered — target kept, block named',
    ret && ret.reattached === false && ret.reattachBlocked === 'wave-not-higher' &&
    ret.mid === null && plan.target === 'eater' && plan.needWave === 4 && SAY_LINES.length === 0,
    JSON.stringify({ blocked: ret && ret.reattachBlocked, target: plan.target }));
  clearPlan(HOLDER);
  // 4. NEVER same-wave: wave-4 held, a DIFFERENT wave-4 beast offered.
  setTales([{ mid: 'strike', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'eater', needWave: 4 });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('NEVER same-wave: wave-4 held, different wave-4 beast offered — target kept',
    ret && ret.reattached === false && ret.reattachBlocked === 'wave-not-higher' && plan.target === 'eater',
    JSON.stringify({ blocked: ret && ret.reattachBlocked, target: plan.target }));
  clearPlan(HOLDER);
  // 5. NEVER to the same beast.
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'eater', needWave: 4 });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('NEVER to the same beast: eater held, eater tale offered — target kept',
    ret && ret.reattached === false && ret.reattachBlocked === 'wave-not-higher' && plan.target === 'eater');
  clearPlan(HOLDER);
  // 6. NEVER after launch: hunt / standing / table stages block.
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  for (const stage of ['hunt', 'standing', 'table']) {
    plan = setPlan(HOLDER, { target: 'redactor', needWave: 3, stage: stage });
    SAY_LINES = [];
    ret = Game.winPlanRumorAttach(HOLDER, false);
    check('NEVER after launch: ' + stage + '-stage plan keeps its beast, block named',
      ret && ret.reattached === false && ret.reattachBlocked === 'stage-launched' &&
      plan.target === 'redactor' && SAY_LINES.length === 0,
      JSON.stringify({ blocked: ret && ret.reattachBlocked, target: plan.target }));
    clearPlan(HOLDER);
  }
  // 7. REATTACH unset: attach fires, but NO re-attach.
  envAttachOnly();
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3 });
  SAY_LINES = [];
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('REATTACH-off control: plan keeps its wave-3 beast, block named reattach-off',
    ret && ret.reattached === false && ret.reattachBlocked === 'reattach-off' &&
    plan.target === 'redactor' && SAY_LINES.length === 0,
    JSON.stringify({ blocked: ret && ret.reattachBlocked, target: plan.target }));
  clearPlan(HOLDER);
  envBothOn();
  // 8. Both envs OFF: old-code control, null, untouched.
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3 });
  envOff();
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('OLD-CODE CONTROL: both envs OFF returns null, plan untouched',
    ret === null && plan.target === 'redactor' && plan.needWave === 3,
    JSON.stringify({ ret: ret, target: plan.target }));
  clearPlan(HOLDER);
  envBothOn();
  // 9. Stale / dead-teller / untold higher-wave tales never re-attach.
  setTales([{ mid: 'eater', killer: TELLER, day: day - 31, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3 });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('stale higher-wave tale (31d) never re-attaches (block no-tale)',
    ret && ret.reattached === false && ret.reattachBlocked === 'no-tale' && plan.target === 'redactor',
    JSON.stringify({ blocked: ret && ret.reattachBlocked }));
  clearPlan(HOLDER);
  setFallen([TELLER]);
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3 });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('dead-teller higher-wave tale never re-attaches',
    ret && ret.reattached === false && plan.target === 'redactor',
    JSON.stringify({ blocked: ret && ret.reattachBlocked }));
  clearPlan(HOLDER);
  setFallen([]);
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: false }]);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3 });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('untold higher-wave tale never re-attaches',
    ret && ret.reattached === false && plan.target === 'redactor');
  clearPlan(HOLDER);
  // 10. Fought-origin plans never re-attach.
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, { target: 'redactor', needWave: 3, origin: 'fought' });
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('fought-origin plan is never re-attached', ret === null && plan.target === 'redactor');
  clearPlan(HOLDER);
  // 11. First-attach still works with both envs on (regression guard for part 1).
  setTales([{ mid: 'eater', killer: TELLER, day: day, told: true, played: true }]);
  plan = setPlan(HOLDER, {});
  SAY_LINES = [];
  ret = Game.winPlanRumorAttach(HOLDER, false);
  check('first-attach still works (target-null plan takes the fresh wave-4 tale)',
    ret && ret.reattached === false && ret.mid === 'eater' && plan.target === 'eater' && plan.needWave === 4,
    JSON.stringify(ret && { mid: ret.mid }));
  check('first-attach voice line is the attach line, not the re-attach line',
    SAY_LINES.length === 1 && SAY_LINES[0].indexOf('keeps coming back to') !== -1 &&
    SAY_LINES[0].indexOf('changes the hunt') === -1,
    JSON.stringify(SAY_LINES));
  clearPlan(HOLDER);
  envOff();
}

// ---------- 3. Live HavenTick probe (creation attach + refresh re-attach) ----------
console.log('== live HavenTick probe ==');
async function havenTickProbe() {
  if (!LEVER_PRESENT) { console.log('  (off-mode: lever absent — HavenTick probe skipped)'); return; }
  // Reuse the loaded Game from the fixtures (same process, same state).
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const day = (Game.state.scholar || {}).day || 0;
  setDay(day);
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
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    const kn = a && a.know ? a.know[holder] : null;
    if (kn) kn.fought = [];
  } catch (e) {}
  Game.state.villageSlain = { redactor: 1 };
  setFallen([]);
  // Birth: only a wave-3 tale is told, so the newborn plan takes it.
  setTales([{ mid: 'redactor', killer: TELLER, day: day, told: true, played: true }]);
  clearPlan(holder);
  envBothOn();
  SAY_LINES = [];
  const created = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE creation: HavenTick creates a heard plan WITH the wave-3 target (envs ON)',
    !!created && created.origin === 'heard' && created.target === 'redactor' && created.needWave === 3,
    JSON.stringify(created && { origin: created.origin, target: created.target, needWave: created.needWave }));
  // A fresh wave-4 tale arrives on a later night: the same plan re-attaches.
  Game.state.villageSlain = { redactor: 1, eater: 1 };
  setTales([{ mid: 'eater', killer: TELLER2, day: day, told: true, played: true }]);
  SAY_LINES = [];
  const reattached = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE refresh re-attach: the same heard plan trades up to the fresh wave-4 tale',
    !!reattached && reattached.target === 'eater' && reattached.needWave === 4,
    JSON.stringify(reattached && { target: reattached.target, needWave: reattached.needWave }));
  check('LIVE refresh re-attach: the voice line names the new beast AND the old beast',
    SAY_LINES.length >= 1 && SAY_LINES.some(function (l) {
      return l.indexOf('changes the hunt') !== -1 &&
        l.indexOf(Game.monsterDisplayName('eater')) !== -1 &&
        l.indexOf(Game.monsterDisplayName('redactor')) !== -1;
    }), JSON.stringify(SAY_LINES));
  // REATTACH-off control: the identical setup keeps the wave-3 beast.
  clearPlan(holder);
  setTales([{ mid: 'redactor', killer: TELLER, day: day, told: true, played: true }]);
  envAttachOnly();
  const bornW3 = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE REATTACH-off setup: plan born with the wave-3 target',
    !!bornW3 && bornW3.target === 'redactor', JSON.stringify(bornW3 && { target: bornW3.target }));
  setTales([{ mid: 'eater', killer: TELLER2, day: day, told: true, played: true }]);
  SAY_LINES = [];
  const kept = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE REATTACH-off control: the plan keeps its wave-3 beast despite the fresh wave-4 tale',
    !!kept && kept.target === 'redactor' && kept.needWave === 3,
    JSON.stringify(kept && { target: kept.target, needWave: kept.needWave }));
  check('LIVE REATTACH-off control: no re-attach voice line',
    SAY_LINES.filter(function (l) { return /changes the hunt/.test(l); }).length === 0,
    JSON.stringify(SAY_LINES));
  // Hunt-stage control: a launched plan never re-attaches through HavenTick.
  envBothOn();
  const huntPlan = Game.state.village.winPlan[holder];
  huntPlan.stage = 'hunt';
  setTales([{ mid: 'editor', killer: TELLER2, day: day, told: true, played: true }]);
  SAY_LINES = [];
  const huntKept = Game.winPlanHavenTick(holder, hx, hy);
  check('LIVE hunt-stage control: a hunt-stage plan keeps its beast despite a fresh wave-5 tale',
    !!huntKept && huntKept.target === 'redactor',
    JSON.stringify(huntKept && { target: huntKept.target, stage: huntKept.stage }));
  check('LIVE hunt-stage control: no re-attach voice line',
    SAY_LINES.filter(function (l) { return /changes the hunt/.test(l); }).length === 0,
    JSON.stringify(SAY_LINES));
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
  return { day: day, vid: vid, atCreation: !!atCreation, applicable: true, reattachApplicable: false,
    originBefore: 'heard', stageBefore: 'gear', targetBefore: null,
    result: mid, wave: wave, teller: 't1', taleDay: day, taleAge: 0,
    reattached: false, oldTarget: null, oldWave: null, reattachBlocked: null,
    considered: [{ mid: mid, wave: wave, teller: 't1', taleDay: day, age: 0, played: true, tellerAlive: true, eligible: true, reason: null }] };
}
function reattachRow(day, vid, from, oldWave, to, wave) {
  return { day: day, vid: vid, atCreation: false, applicable: false, reattachApplicable: true,
    originBefore: 'heard', stageBefore: 'party', targetBefore: from,
    result: to, wave: wave, teller: 't1', taleDay: day, taleAge: 0,
    reattached: true, oldTarget: from, oldWave: oldWave, reattachBlocked: null,
    considered: [{ mid: to, wave: wave, teller: 't1', taleDay: day, age: 0, played: true, tellerAlive: true, eligible: true, reason: null }] };
}
function filesFor(firstAttachSeeds, reattachOnlySeeds) {
  const files = {};
  for (const s of [103201, 103202, 103203, 103204, 103205, 103206, 103207, 103208]) {
    const over = {};
    if ((firstAttachSeeds || []).indexOf(s) !== -1) {
      over.seedattachCreations = [heardCreation(10, 'v1')];
      over.rumortargetAttaches = [attachRow(20, 'v1', 'eater', 4, false)];
    }
    if ((reattachOnlySeeds || []).indexOf(s) !== -1) {
      over.seedattachCreations = [heardCreation(10, 'v1')];
      over.rumortargetAttaches = [
        attachRow(20, 'v1', 'redactor', 3, false),
        reattachRow(40, 'v1', 'redactor', 3, 'eater', 4),
      ];
    }
    files[s] = minSeed(s, over);
  }
  return files;
}
(function () {
  const mixed = ANALYZE.analyzeLeg(filesFor([103201, 103202], [103203, 103204]), 'on');
  check('analyzer: 2 first-attach + 2 reattach-only seeds count as 4 primary seeds',
    mixed[103201].attachesW45 === 1 && mixed[103202].attachesW45 === 1 &&
    mixed[103203].reattachesW45 === 1 && mixed[103204].reattachesW45 === 1 &&
    mixed[103203].attachesW45 === 0 && mixed[103204].attachesW45 === 0,
    JSON.stringify([103201, 103202, 103203, 103204].map(function (s) { return { a: mixed[s].attachesW45, r: mixed[s].reattachesW45 }; })));
  const three = ANALYZE.analyzeLeg(filesFor([103201], [103202, 103203]), 'on');
  check('analyzer: 3 primary seeds (mixed) count as 3 (below the bar)',
    three[103201].attachesW45 === 1 && three[103202].reattachesW45 === 1 &&
    three[103203].reattachesW45 === 1 && three[103204].attachesW45 === 0 && three[103204].reattachesW45 === 0);
  // A wave-3-only re-attach counts as a mechanism re-attach, never as a primary seed.
  const w3files = filesFor([], []);
  w3files[103201].seedattachCreations = [heardCreation(10, 'v1')];
  w3files[103201].rumortargetAttaches = [attachRow(20, 'v1', 'redactor', 3, true)];
  const w3leg = ANALYZE.analyzeLeg(w3files, 'on');
  check('analyzer: a wave-3 attach counts in attachesW3, not in the primary',
    w3leg[103201].attachesW3 === 1 && w3leg[103201].attachesW45 === 0 && w3leg[103201].attachesAtCreation === 1,
    JSON.stringify({ w3: w3leg[103201].attachesW3, w45: w3leg[103201].attachesW45 }));
  check('analyzer: origin cross-check is clean when stamps agree',
    w3leg[103201].crossMismatches.length === 0, JSON.stringify(w3leg[103201].crossMismatches));
  // Integrity: a downward re-attach row is flagged; a hunt-stage re-attach row is flagged.
  const badFiles = filesFor([], []);
  badFiles[103201].seedattachCreations = [heardCreation(10, 'v1')];
  const downRow = reattachRow(40, 'v1', 'eater', 4, 'redactor', 3);
  const huntRow = reattachRow(41, 'v1', 'redactor', 3, 'eater', 4);
  huntRow.stageBefore = 'hunt';
  badFiles[103201].rumortargetAttaches = [downRow, huntRow];
  const badLeg = ANALYZE.analyzeLeg(badFiles, 'on');
  check('analyzer: a downward re-attach is an integrity violation',
    badLeg[103201].integrityDownward.length === 1,
    JSON.stringify(badLeg[103201].integrityDownward));
  check('analyzer: a hunt-stage re-attach is an integrity violation',
    badLeg[103201].integrityLaunched.length === 1,
    JSON.stringify(badLeg[103201].integrityLaunched));
  // Launches carrying a re-attached target are counted separately.
  const launchFiles = filesFor([], [103201]);
  launchFiles[103201].rumorplanLaunches = [
    { day: 50, vid: 'v1', role: 'inviter', path: 'winplan', inviter: 'v1', targetAfter: 'eater', stageAfter: 'hunt' },
    { day: 30, vid: 'v1', role: 'inviter', path: 'winplan', inviter: 'v1', targetAfter: 'redactor', stageAfter: 'hunt' },
  ];
  const launchLeg = ANALYZE.analyzeLeg(launchFiles, 'on');
  check('analyzer: only the launch AFTER the re-attach counts as reattached-target',
    launchLeg[103201].rumorLaunchesReattached === 1 && launchLeg[103201].rumorLaunchesTargeted === 2,
    JSON.stringify({ re: launchLeg[103201].rumorLaunchesReattached, t: launchLeg[103201].rumorLaunchesTargeted }));
})();

// ---------- 5. Determinism legs D1 + D2 (60d, seed 103201, RUMORTARGET=1 REATTACH=1, LEG=competent) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '60', LEG: 'competent', RUMORTARGET: '1', REATTACH: '1' }, envExtra || {});
  const script = "const d=require('./scripts/reattach-driver-20261117.js');" +
    "d.oneRun(103201).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  if (!LEVER_PRESENT) { console.log('  (off-mode: lever absent — D1/D2 skipped)'); return; }
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
  const off = childFingerprint({ REATTACH_RECORDER: 'off' });
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
    await reattachFixtures();
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
