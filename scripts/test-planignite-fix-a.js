// test-planignite-fix-a.js — proof for arm sim-planignite-fix-a (LEVER:
// initialize the plan store on first HavenTick, PLANFIX=1: a ranger at
// Haven who has heard the fire talk about a slain beast — or personally
// fought one — starts thinking in gameplan terms, instead of the tick
// returning null before it ever checks engagement because v.winPlan
// never existed).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the lever is env-gated (the flag is read in exactly one
// place, planfixOn(); off mode = the old guard, store stays absent,
// no plan, the engagement check never runs), the store initializes
// on the first armed havenTick but creation still requires engagement
// (unengaged ranger: store present, no plan; non-ranger: no plan),
// a plan is created exactly once per villager, and the ignition is
// observable out of REAL play — a geared ranger's real expedition
// encounter (lived/heard engagement recorded by the game's own
// expeditionMonster) ignites via havenTick, and a full 150d competent
// run on the DIAG's dead seed 102601 creates plans armed.
// Determinism: D1 (repeatability, recorder ON twice, armed 150d seed
// 102601) + D2 (wrap neutrality, recorder ON vs OFF, armed 150d seed
// 102601) + D3 (drift: fix-driver control vs DIAG-driver control,
// same seed 102601 150d, identical trajectory fingerprints — the
// lever code + driver copy must not perturb off-mode behavior).
// ENCOUNTER GEAR (Steve 2026-11-13): every live fight fixture stages
// a geared scholar fighting with a party — never a fresh un-geared
// scholar alone.
// Usage:
//   node scripts/test-planignite-fix-a.js
//   PLANFIX_PROOF_MODE=off node scripts/test-planignite-fix-a.js
//     (post-revert: asserts the lever is fully gone — src diff empty,
//     no PLANFIX read, no planfixOn helper — and the control
//     behavior still holds; skips the armed legs.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const OFF_MODE = process.env.PLANFIX_PROOF_MODE === 'off';

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
const srcDiff = gitOut('diff master...HEAD -- src/');
const srcFiles = gitOut('diff master...HEAD --name-only -- src/').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const winPlanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
if (OFF_MODE) {
  check('OFF MODE: src diff is empty (lever fully reverted)', srcFiles.length === 0, 'got ' + JSON.stringify(srcFiles));
  check('OFF MODE: no PLANFIX read remains in src/', winPlanSrc.indexOf('PLANFIX') === -1);
  check('OFF MODE: no planfixOn helper remains', winPlanSrc.indexOf('planfixOn') === -1);
  check('OFF MODE: the old havenTick guard is back', winPlanSrc.indexOf('if (!v || !v.winPlan) return null;') !== -1);
} else {
  check('src diff is win-plan.js only (the lever)', srcFiles.length === 1 && srcFiles[0] === 'src/js/win-plan.js',
    'got ' + JSON.stringify(srcFiles));
  check('src diff mentions PLANFIX (the lever flag)', srcDiff.indexOf('PLANFIX') !== -1);
  const flagReads = (winPlanSrc.match(/process\.env\.PLANFIX/g) || []).length;
  check('flag is read in exactly one place (planfixOn)', flagReads === 1, 'got ' + flagReads);
  check('old havenTick guard is gone (no early null on absent store)',
    winPlanSrc.indexOf('if (!v || !v.winPlan) return null;') === -1);
  check('new guard initializes via stateOf when the flag is on',
    winPlanSrc.indexOf('if (!planfixOn()) return null;') !== -1 &&
    winPlanSrc.indexOf('v = stateOf(this);') !== -1);
  check('stateOf is still the only store initializer (no new seeding path)',
    (winPlanSrc.match(/v\.winPlan = v\.winPlan \|\| \{\}/g) || []).length === 1);
}
check('DIAG driver unmodified by this arm',
  gitOut('diff master...HEAD -- scripts/planignite-driver-20261116.js') === '');
check('DIAG analyzer unmodified by this arm',
  gitOut('diff master...HEAD -- scripts/analyze-planignite-a.js') === '');
const fixDriverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'planignite-fix-driver-20261116.js'), 'utf8');
check('fix driver accepts MODE control|armed', fixDriverSrc.indexOf("MODE !== 'control' && MODE !== 'armed'") !== -1);
check('fix driver sets PLANFIX=1 on the armed leg, clears it on control',
  fixDriverSrc.indexOf("if (MODE === 'armed') process.env.PLANFIX = '1';") !== -1 &&
  fixDriverSrc.indexOf('else delete process.env.PLANFIX;') !== -1);
check('fix driver has PLANIGNITE_RECORDER off-switch', fixDriverSrc.indexOf('PLANIGNITE_RECORDER') !== -1);
check('fix driver refuses to overwrite per-seed files', fixDriverSrc.indexOf('refusing to overwrite') !== -1);
check('fix driver records the lever state per run (planfix + planfixEnabled)',
  fixDriverSrc.indexOf('planfix:') !== -1 && fixDriverSrc.indexOf('planfixEnabled:') !== -1);
check('fix analyzer reuses the DIAG classifier (classifyIgnition)',
  fs.readFileSync(path.join(REPO, 'scripts', 'analyze-planignite-fix-a.js'), 'utf8').indexOf('classifyIgnition') !== -1);
const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const mlist = monsters.monsters || monsters;
const w4live = mlist.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const W4_FROZEN = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'];
check('wave-4 ids are 10 and match the frozen list', w4live.length === 10 && JSON.stringify(w4live) === JSON.stringify(W4_FROZEN),
  'got ' + JSON.stringify(w4live));

// ---------- 2. Unit: havenTick ignition, live loadGame (child processes) ----------
// Each child loads the game fresh with PLANFIX set or unset, stages an
// engaged ranger at Haven with the plan store ABSENT (the DIAG's dead
// shape: the fire has talked about a slain beast, no initializer of
// any kind has ever fired), calls winPlanHavenTick directly, and
// reports the return, the store, and the plan-seed counter as JSON.
// The parent asserts the behavior; the child never judges.
console.log('== unit: havenTick ignition ==');
function havenChild(envExtra) {
  const env = Object.assign({}, process.env, envExtra || {});
  delete env.PLANIGNITE_RECORDER;
  const script = [
    "const { loadGame, setupGame } = require('./scripts/sim-harness');",
    "(async function () {",
    "  const { Game } = await loadGame({ seed: 102601, mode: 'planignite-fix-proof', fullTelemetry: false });",
    "  await setupGame(Game);",
    "  const out = {};",
    "  const vill = Game.state.village || {};",
    "  const hx = (vill.px != null ? vill.px : 4), hy = (vill.py != null ? vill.py : 4);",
    "  out.haven = [hx, hy];",
    "  out.storeAbsentAtStart = !vill.winPlan;",
    "  const roster = (vill.roster || []).slice();",
    "  let ranger = null, nonRanger = null;",
    "  for (const vid of roster) {",
    "    if (vid === Game.villagerId) continue;",
    "    let prof = null; try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) {}",
    "    let node = null; try { const n = Game.npcNode ? Game.npcNode(vid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}",
    "    const atHaven = !!(node && node.nx === hx && node.ny === hy);",
    "    if (!atHaven) continue;",
    "    if ((prof === 'wanderer' || prof === 'explorer') && !ranger) ranger = vid;",
    "    if (prof !== 'wanderer' && prof !== 'explorer' && !nonRanger) nonRanger = vid;",
    "  }",
    "  out.ranger = ranger; out.nonRanger = nonRanger;",
    "  if (!ranger) { console.log(JSON.stringify({ error: 'no-ranger-at-haven' })); return; }",
    "  // The fire has talked: the village has slain a beast (the heard",
    "  // channel — the game's own villageSlain state, as recordWaveKill",
    "  // writes it). No initializer of any kind has fired: delete the",
    "  // store AND the stats, the DIAG's dead shape.",
    "  Game.state.villageSlain = { redactor: 1 };",
    "  delete Game.state.village.winPlan;",
    "  delete Game.state.village.winPlanStats;",
    "  // --- non-ranger first: profile still gates creation ---",
    "  out.nonRangerCall = {};",
    "  if (nonRanger) {",
    "    out.nonRangerCall.ret = Game.winPlanHavenTick(nonRanger, hx, hy);",
    "    out.nonRangerCall.storePresent = !!Game.state.village.winPlan;",
    "    out.nonRangerCall.plan = (Game.state.village.winPlan || {})[nonRanger] || null;",
    "  }",
    "  // --- engaged ranger: the ignition ---",
    "  out.rangerCall = {};",
    "  out.rangerCall.ret = Game.winPlanHavenTick(ranger, hx, hy);",
    "  out.rangerCall.storePresent = !!Game.state.village.winPlan;",
    "  const plan = (Game.state.village.winPlan || {})[ranger] || null;",
    "  out.rangerCall.plan = plan ? { stage: plan.stage, target: plan.target, sinceDay: plan.sinceDay } : null;",
    "  out.rangerCall.planSeeds = null;",
    "  try { out.rangerCall.planSeeds = (Game.winPlanStats ? Game.winPlanStats() : {}).planSeeds; } catch (e) {}",
    "  // --- second call: no double-seed ---",
    "  out.secondCall = {};",
    "  out.secondCall.ret = Game.winPlanHavenTick(ranger, hx, hy);",
    "  try { out.secondCall.planSeeds = (Game.winPlanStats ? Game.winPlanStats() : {}).planSeeds; } catch (e) {}",
    "  // --- unengaged ranger: store present, no plan (engagement gates) ---",
    "  delete Game.state.village.winPlan;",
    "  delete Game.state.village.winPlanStats;",
    "  Game.state.villageSlain = {};",
    "  try { const a = Game.agencyState ? Game.agencyState() : null; if (a && a.know && a.know[ranger]) a.know[ranger].fought = []; } catch (e) {}",
    "  out.unengagedCall = {};",
    "  out.unengagedCall.ret = Game.winPlanHavenTick(ranger, hx, hy);",
    "  out.unengagedCall.storePresent = !!Game.state.village.winPlan;",
    "  out.unengagedCall.plan = (Game.state.village.winPlan || {})[ranger] || null;",
    "  console.log(JSON.stringify(out));",
    "})().catch(function (e) { console.error(e.stack); process.exit(1); });",
  ].join('\n');
  const res = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(res.trim().split('\n').pop());
}
const armedU = OFF_MODE ? null : havenChild({ PLANFIX: '1' });
const controlU = havenChild({});
if (!OFF_MODE) {
  check('armed: store absent at game start (the DIAG dead shape stages cleanly)',
    armedU.storeAbsentAtStart === true, JSON.stringify({ storeAbsentAtStart: armedU.storeAbsentAtStart }));
  check('armed: a ranger AND a non-ranger stand at Haven at start',
    !!armedU.ranger && !!armedU.nonRanger, JSON.stringify({ ranger: armedU.ranger, nonRanger: armedU.nonRanger }));
  check('armed: non-ranger gets no plan (profile still gates creation)',
    armedU.nonRangerCall.ret === null && armedU.nonRangerCall.plan === null,
    JSON.stringify(armedU.nonRangerCall));
  check('armed: engaged ranger ignites — havenTick returns a plan, store present',
    armedU.rangerCall.ret !== null && armedU.rangerCall.storePresent === true && armedU.rangerCall.plan !== null,
    JSON.stringify(armedU.rangerCall));
  check('armed: the created plan is a real gear-stage plan with a sinceDay',
    armedU.rangerCall.plan && (armedU.rangerCall.plan.stage === 'gear' || armedU.rangerCall.plan.stage === 'party') &&
    typeof armedU.rangerCall.plan.sinceDay === 'number',
    JSON.stringify(armedU.rangerCall.plan));
  check('armed: exactly one plan seed is counted (planSeeds 1)',
    armedU.rangerCall.planSeeds === 1, 'got ' + JSON.stringify(armedU.rangerCall.planSeeds));
  check('armed: second havenTick returns the same plan, no double-seed',
    armedU.secondCall.ret !== null && armedU.secondCall.planSeeds === 1,
    JSON.stringify(armedU.secondCall));
  check('armed: unengaged ranger gets NO plan — but the store IS initialized (engagement gates, init does not hand out plans)',
    armedU.unengagedCall.ret === null && armedU.unengagedCall.storePresent === true && armedU.unengagedCall.plan === null,
    JSON.stringify(armedU.unengagedCall));
}
check('control: store absent at game start', controlU.storeAbsentAtStart === true,
  JSON.stringify({ storeAbsentAtStart: controlU.storeAbsentAtStart }));
check('control: engaged ranger gets NO plan (the old guard returns null before engagement)',
  controlU.rangerCall.ret === null && controlU.rangerCall.plan === null,
  JSON.stringify(controlU.rangerCall));
check('control: the store stays absent after the call (nothing initializes it)',
  controlU.rangerCall.storePresent === false, JSON.stringify(controlU.rangerCall));
check('control: unengaged ranger also gets no plan and no store',
  controlU.unengagedCall.ret === null && controlU.unengagedCall.storePresent === false && controlU.unengagedCall.plan === null,
  JSON.stringify(controlU.unengagedCall));

// ---------- 3. Unit: live geared fight -> real-play ignition ----------
// ENCOUNTER GEAR (Steve 2026-11-13): the fighter is a ranger with the
// average gear a player actually has at wave-3 content — a machete in
// hand — fighting with two geared party allies; the scholar is geared
// alongside (crude bow + arrows + machete). The encounter runs through
// the game's OWN expeditionMonster (the real encounter path: it picks
// the beast, runs the field fight, and records lived/heard engagement
// — know[vid].fought on a drive-off/kill, villageSlain on a kill —
// through the same code a sim uses). A direct fieldFight call records
// NEITHER (probed 2026-11-16: obs 1, fought [], slain {}), so it
// cannot prove this path. After a usable encounter the villager comes
// home (node set to Haven, expedition closed — the expedition is over)
// with the plan store deleted, and havenTick must ignite from the
// game-recorded engagement. The child tries seeds 102601-102604 and
// takes the first usable survived encounter. Deterministic per seed.
console.log('== unit: live geared fight ==');
function fightChild() {
  const env = Object.assign({}, process.env, { PLANFIX: '1' });
  delete env.PLANIGNITE_RECORDER;
  const script = [
    "const { loadGame, setupGame } = require('./scripts/sim-harness');",
    "(async function () {",
    "  const out = { tried: [] };",
    "  outer: for (const seed of [102601, 102602, 102603, 102604]) {",
    "    const { Game } = await loadGame({ seed: seed, mode: 'planignite-fix-fight', fullTelemetry: false });",
    "    await setupGame(Game);",
    "    const vill = Game.state.village || {};",
    "    const hx = (vill.px != null ? vill.px : 4), hy = (vill.py != null ? vill.py : 4);",
    "    const roster = (vill.roster || []).slice();",
    "    const rangers = [];",
    "    for (const vid of roster) {",
    "      if (vid === Game.villagerId) continue;",
    "      let prof = null; try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) {}",
    "      let node = null; try { const n = Game.npcNode ? Game.npcNode(vid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}",
    "      if ((prof === 'wanderer' || prof === 'explorer') && node && node.nx === hx && node.ny === hy) rangers.push(vid);",
    "    }",
    "    if (rangers.length < 3) { out.tried.push({ seed: seed, error: 'rangers<3', n: rangers.length }); continue; }",
    "    const w1 = rangers[0], w2 = rangers[1], w3 = rangers[2];",
    "    // ENCOUNTER GEAR: fighter + allies carry the average wave-3 gear.",
    "    function gear(vid, melee) {",
    "      try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (!p) return false;",
    "        p.equipped = p.equipped || {}; p.equipped.melee = { itemId: melee };",
    "        p.items = p.items || []; if (!p.items.some(function (e) { return (e.itemId || e.id) === melee; })) p.items.push({ itemId: melee });",
    "        return true; } catch (e) { return false; }",
    "    }",
    "    const g1 = gear(w1, 'machete'), g2 = gear(w2, 'hunting_spear'), g3 = gear(w3, 'machete');",
    "    let scholarGeared = false;",
    "    try { const s = Game.state.scholar || {}; s.items = s.items || [];",
    "      if (!s.items.some(function (e) { return (e.itemId || e.id) === 'crude_bow'; })) s.items.push({ itemId: 'crude_bow' });",
    "      if (!s.items.some(function (e) { return (e.itemId || e.id) === 'arrow'; })) s.items.push({ itemId: 'arrow', units: 6 });",
    "      if (!s.items.some(function (e) { return (e.itemId || e.id) === 'machete'; })) s.items.push({ itemId: 'machete' });",
    "      scholarGeared = true; } catch (e) {}",
    "    // Full HP: this child needs a drive-off or a kill (the outcomes",
    "    // that record lived engagement), not a flee.",
    "    try { const vv0 = Game.state.village || {}; if (!vv0.health) vv0.health = {}; vv0.health[w1] = 100; } catch (e) {}",
    "    // A real expedition, same target for the party (they travel together).",
    "    const tx = Math.max(0, Math.min(8, hx + 2)), ty = hy;",
    "    let expedOk = false;",
    "    try { Game.startExpedition(w1, hx, hy, false, { tx: tx, ty: ty, duration: 20 });",
    "      Game.startExpedition(w2, hx, hy, false, { tx: tx, ty: ty, duration: 20 });",
    "      Game.startExpedition(w3, hx, hy, false, { tx: tx, ty: ty, duration: 20 });",
    "      const a = Game.agencyState ? Game.agencyState() : null;",
    "      expedOk = !!(a && a.exped && a.exped[w1]); } catch (e) { expedOk = 'ERR:' + String(e.message).slice(0, 60); }",
    "    if (!expedOk) { out.tried.push({ seed: seed, error: 'no-expedition', expedOk: expedOk }); continue; }",
    "    const foughtBefore = (function () { try { const a = Game.agencyState ? Game.agencyState() : null; const kn = a && a.know ? a.know[w1] : null; return (kn && kn.fought) ? kn.fought.slice() : []; } catch (e) { return []; } })();",
    "    const slainBefore = JSON.parse(JSON.stringify(Game.state.villageSlain || {}));",
    "    let encErr = null;",
    "    try { Game.expeditionMonster(w1, 2, false); } catch (e) { encErr = String(e.message).slice(0, 80); }",
    "    const foughtAfter = (function () { try { const a = Game.agencyState ? Game.agencyState() : null; const kn = a && a.know ? a.know[w1] : null; return (kn && kn.fought) ? kn.fought.slice() : []; } catch (e) { return []; } })();",
    "    const slainAfter = Game.state.villageSlain || {};",
    "    const newFought = foughtAfter.filter(function (x) { return foughtBefore.indexOf(x) === -1; });",
    "    const newSlain = Object.keys(slainAfter).filter(function (k) { return (slainAfter[k] | 0) > (slainBefore[k] | 0); });",
    "    let alive = true;",
    "    try { const p = Game.getPerson ? Game.getPerson(w1) : null; if (p && p.dead) alive = false; } catch (e) {}",
    "    const row = { seed: seed, fighter: w1, geared: [g1, g2, g3], scholarGeared: scholarGeared,",
    "      encErr: encErr, newFought: newFought, newSlain: newSlain, alive: alive,",
    "      storeSeededByFight: !!((Game.state.village || {}).winPlan || {})[w1] };",
    "    out.tried.push(row);",
    "    if (!alive || (newFought.length === 0 && newSlain.length === 0)) continue;",
    "    // The expedition is over: the villager is home at Haven, the",
    "    // store is deleted (the DIAG's dead shape), and havenTick must",
    "    // ignite from the engagement the real encounter recorded.",
    "    try { if (Game.npcSetNode) Game.npcSetNode(w1, hx, hy); } catch (e) {}",
    "    try { const a = Game.agencyState ? Game.agencyState() : null; if (a && a.exped) delete a.exped[w1]; } catch (e) {}",
    "    delete Game.state.village.winPlan;",
    "    delete Game.state.village.winPlanStats;",
    "    const ret = Game.winPlanHavenTick(w1, hx, hy);",
    "    const plan = (Game.state.village.winPlan || {})[w1] || null;",
    "    let planSeeds = null;",
    "    try { planSeeds = (Game.winPlanStats ? Game.winPlanStats() : {}).planSeeds; } catch (e) {}",
    "    row.ignited = ret !== null && plan !== null;",
    "    row.planStage = plan ? plan.stage : null;",
    "    row.planSeeds = planSeeds;",
    "    row.engagedVia = newFought.length ? 'lived' : (newSlain.length ? 'heard' : 'none');",
    "    break outer;",
    "  }",
    "  console.log(JSON.stringify(out));",
    "})().catch(function (e) { console.error(e.stack); process.exit(1); });",
  ].join('\n');
  const res = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(res.trim().split('\n').pop());
}
if (!OFF_MODE) {
  const fight = fightChild();
  const usable = fight.tried.find(function (t) { return t.ignited !== undefined; });
  check('live geared fight: at least one seed yields a real encounter with game-recorded engagement (lived fought / heard slain)',
    !!usable, JSON.stringify(fight.tried));
  if (usable) {
    check('live geared fight: the fighter + both allies were geared, scholar geared (encounter gear, not fresh)',
      usable.geared[0] === true && usable.geared[1] === true && usable.geared[2] === true && usable.scholarGeared === true,
      JSON.stringify(usable));
    check('live geared fight: the encounter recorded engagement through the game (lived or heard, not staged)',
      (usable.newFought.length > 0 || usable.newSlain.length > 0) && usable.engagedVia !== 'none',
      JSON.stringify({ fought: usable.newFought, slain: usable.newSlain, via: usable.engagedVia }));
    check('live geared fight: havenTick ignites a plan from that real engagement (store was deleted first)',
      usable.ignited === true && usable.planStage !== null,
      JSON.stringify(usable));
    check('live geared fight: the ignited plan carries a seed count (>=1)',
      typeof usable.planSeeds === 'number' && usable.planSeeds >= 1,
      JSON.stringify({ planSeeds: usable.planSeeds }));
  }
}

// ---------- 4. Recorder: live in-memory runs (shape + both flag states) ----------
console.log('== recorder live ==');
function loadDriverFresh(days, armed) {
  const driverPath = path.join(REPO, 'scripts', 'planignite-fix-driver-20261116.js');
  delete require.cache[require.resolve(driverPath)];
  process.env.DAYS = String(days);
  process.env.MODE = armed ? 'armed' : 'control';
  process.env.RUN = 'planignite-fix-a';
  delete process.env.TABLESEATNOWAIT;
  delete process.env.LEANLINKRESCUE;
  delete process.env.PLANFIX;
  return require(driverPath);
}
async function liveRuns() {
  const dControl = loadDriverFresh(5, false);
  const outControl = await dControl.oneRun(102601);
  check('live control run completes with 0 instrument errors', outControl.instrumentErrors.length === 0,
    JSON.stringify(outControl.instrumentErrors.slice(0, 3)));
  check('live control run policy is competent, sha df9b7dff4de4',
    outControl.policy === 'competent' && outControl.policySha === 'df9b7dff4de4',
    'got ' + outControl.policy + '/' + outControl.policySha);
  check('control run records planfix false + planfixEnabled false',
    outControl.planfix === false && outControl.planfixEnabled === false,
    'got planfix=' + outControl.planfix + ' enabled=' + outControl.planfixEnabled);
  check('control run carries the ignition instrument (havenTickCalls + igniteCensus + winPlanStats)',
    Array.isArray(outControl.havenTickCalls) && Array.isArray(outControl.igniteCensus) && outControl.winPlanStats != null,
    'calls=' + (outControl.havenTickCalls || []).length);
  if (OFF_MODE) return; // post-revert: only the control leg is provable; the armed leg is gone
  const dArmed = loadDriverFresh(150, true);
  const outLong = await dArmed.oneRun(102601);
  check('live 150d armed run completes with 0 instrument errors', outLong.instrumentErrors.length === 0,
    JSON.stringify(outLong.instrumentErrors.slice(0, 3)));
  check('armed run records planfix true + planfixEnabled true',
    outLong.planfix === true && outLong.planfixEnabled === true,
    'got planfix=' + outLong.planfix + ' enabled=' + outLong.planfixEnabled);
  check('live 150d armed run on the DIAG dead seed 102601 CREATES plans (the catch-22 is broken)',
    outLong.v4creates.length > 0,
    'creates=' + outLong.v4creates.length + ' planCensus=' + (outLong.planCensus || []).length);
  check('live 150d armed run: a creation is sourced from havenTick (the fixed path, not a seed row)',
    (outLong.v4creates || []).some(function (c) { return c && (c.creator === 'haventick' || c.source === 'haventick' || (c.creator || '').indexOf('haven') !== -1); }),
    JSON.stringify((outLong.v4creates || []).slice(0, 3)));
  check('live 150d armed run: zero tick-gate mismatches',
    (outLong.tickGateChecks || []).filter(function (c) { return !c.match; }).length === 0,
    'checks=' + (outLong.tickGateChecks || []).length);
  check('live 150d armed run: unexplained havenTick calls are gone (the guard no longer fires)',
    (outLong.havenTickCalls || []).filter(function (c) { return c.outcome === 'unexplained-call'; }).length === 0,
    'unexplained=' + (outLong.havenTickCalls || []).filter(function (c) { return c.outcome === 'unexplained-call'; }).length);
}

// ---------- 5. Determinism legs D1 + D2 + D3 (150d, seed 102601) ----------
console.log('== determinism legs D1/D2/D3 ==');
function childRun(driverRel, envExtra, tag) {
  const env = Object.assign({}, process.env, { DAYS: '150', MODE: 'control' }, envExtra || {});
  // Explicit env hygiene: the parent process may carry a leaked
  // PLANFIX=1 from the in-process armed liveRuns leg. A control child
  // must NEVER inherit it — the DIAG driver predates the flag and does
  // not clear it, so a leaked value arms the lever inside a supposed
  // control (first D3 run: the "control" child ran armed and matched
  // the armed leg bit-for-bit). Armed children set PLANFIX explicitly
  // in envExtra instead of relying on the leak.
  if (!(envExtra && envExtra.PLANFIX)) delete env.PLANFIX;
  const outFile = '/tmp/planignite-fix-proof-' + tag + '.json';
  const script = "const fs=require('fs');const d=require('./scripts/" + driverRel + "');"
    + "d.oneRun(102601).then(function(o){"
    + "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};"
    + "fs.writeFileSync(" + JSON.stringify(outFile) + ", JSON.stringify({fp:fp,full:o}));"
    + "console.log('WROTE " + outFile + "');"
    + "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(fs.readFileSync(outFile, 'utf8'));
}
async function determinism() {
  if (!OFF_MODE) {
    const a = childRun('planignite-fix-driver-20261116.js', { MODE: 'armed', PLANFIX: '1' }, 'd1a');
    const b = childRun('planignite-fix-driver-20261116.js', { MODE: 'armed', PLANFIX: '1' }, 'd1b');
    check('D1 repeatability: identical full corpus, recorder ON twice, armed 150d',
      JSON.stringify(a.full) === JSON.stringify(b.full));
    const off = childRun('planignite-fix-driver-20261116.js', { MODE: 'armed', PLANFIX: '1', PLANIGNITE_RECORDER: 'off' }, 'd2off');
    check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF, armed 150d',
      JSON.stringify(a.fp) === JSON.stringify(off.fp));
    check('D2 recorder-off run carries empty v4/dawnbid/ignite arrays',
      (off.full.v4seeds || []).length === 0 && (off.full.dawnbidScores || []).length === 0 &&
      (off.full.havenTickCalls || []).length === 0 && (off.full.igniteCensus || []).length === 0);
    check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  }
  // D3 runs in both modes: the lever is off on both sides here, so the
  // fix-driver control trajectory must equal the DIAG-driver control
  // trajectory exactly — the lever code + driver copy perturb nothing.
  // (The child env is scrubbed of PLANFIX above: a leaked flag would
  // arm the DIAG driver's "control" leg, which cannot clear it.)
  const fixCtrl = childRun('planignite-fix-driver-20261116.js', { MODE: 'control' }, 'd3fix');
  const diagCtrl = childRun('planignite-driver-20261116.js', { MODE: 'control' }, 'd3diag');
  check('D3 drift: fix-driver control == DIAG-driver control, identical trajectories (150d seed 102601)',
    JSON.stringify(fixCtrl.fp) === JSON.stringify(diagCtrl.fp),
    'fix=' + JSON.stringify({ days: fixCtrl.fp.days, standing: fixCtrl.fp.standing, deaths: (fixCtrl.fp.deaths || []).length }) +
    ' diag=' + JSON.stringify({ days: diagCtrl.fp.days, standing: diagCtrl.fp.standing, deaths: (diagCtrl.fp.deaths || []).length }));
}

(async function () {
  try {
    await liveRuns();
    await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
