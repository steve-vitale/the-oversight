// test-trickshare-a.js — proof for arm sim-trickshare-a (LEVER:
// hearthside trick teaching, TRICKSHARE=1: a survived observation
// told at the fire credits a taught observation on the shared bar).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the lever is env-gated (the flag is read in exactly one
// place, trickShareEnabled(); off mode = no offers, no shares, the
// 2-observation path unchanged), the pending offer is recorded on
// a first observation and the dawn share teaches the trick to
// villagers actually at Haven (teacher away/dead/no-listeners keep
// the pending), teach-on-learn voices the party who were there,
// perception holds (only the living Haven population hears it),
// waves 1–2 learn through discoverMonsterCounter(mid, 'taught'),
// the driver records the taught rows (source 'taught'), and the
// determinism legs D1 (repeatability) + D2 (wrap neutrality) are
// green at 150d on seed 102601 under TRICKSHARE=1, LEG=competent.
// Usage:
//   node scripts/test-trickshare-a.js
//   TRICKSHARE_PROOF_MODE=off node scripts/test-trickshare-a.js
//     (post-revert: asserts the lever is fully gone — src diff empty,
//     no TRICKSHARE read, no share helpers — and the control
//     2-observation path still behaves; skips the armed legs.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-trickshare-a'));
const OFF_MODE = process.env.TRICKSHARE_PROOF_MODE === 'off';

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
const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
if (OFF_MODE) {
  check('OFF MODE: src diff is empty (lever fully reverted)', srcFiles.length === 0, 'got ' + JSON.stringify(srcFiles));
  check('OFF MODE: no TRICKSHARE read remains in src/', (gameSrc.match(/process\.env\.TRICKSHARE/g) || []).length === 0);
  check('OFF MODE: no trickShare helpers remain', gameSrc.indexOf('trickShareEnabled') === -1 && gameSrc.indexOf('noteTrickTaught') === -1 && gameSrc.indexOf('trickShareDawnTick') === -1);
  check('OFF MODE: no share hook remains in sleep()', gameSrc.indexOf('trickShareDawnTick') === -1);
} else {
  check('src diff is game.js + fieldFights.js only (the lever)', srcFiles.length === 2 && srcFiles.indexOf('src/js/game.js') !== -1 && srcFiles.indexOf('src/js/fieldFights.js') !== -1,
    'got ' + JSON.stringify(srcFiles));
  check('src diff mentions TRICKSHARE (the lever flag)', srcDiff.indexOf('TRICKSHARE') !== -1);
  const flagReads = (gameSrc.match(/process\.env\.TRICKSHARE/g) || []).length;
  check('flag is read in exactly one place (trickShareEnabled)', flagReads === 1, 'got ' + flagReads);
  check('no trickLearnThreshold helper (threshold is NOT cut)', gameSrc.indexOf('trickLearnThreshold') === -1);
  const thSites = (gameSrc.match(/obs\[mid\] < 2/g) || []).length;
  check('threshold stays 2 at all three obs sites (2x _trickObservation + 1x noteNodeWitnessKill)', thSites === 3, 'got ' + thSites);
  check('sleep() calls the share tick once per dawn (hook present)', gameSrc.indexOf('this.trickShareDawnTick()') !== -1);
  check('fieldFights threads the party into the observation call (teach-on-learn audience)',
    ffSrc.indexOf("this.noteVillagerTrickObservation(vid, mdef.id, (opts && opts.allyVids) || null)") !== -1);
}
const winPlanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
check('gate reads villageKnowsTrick (anchor: trickHolds branch)', winPlanSrc.indexOf('villageKnowsTrick') !== -1);
check('field-fight AI reads villageKnowsTrick (anchor)', ffSrc.indexOf('villageKnowsTrick') !== -1);
check('killfail analyzer unmodified by this arm',
  gitOut('diff master...HEAD -- scripts/analyze-killfail-a.js') === '');
check('killfail driver unmodified by this arm',
  gitOut('diff master...HEAD -- scripts/killfail-driver-20261116.js') === '');
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'trickshare-driver-20261116.js'), 'utf8');
check('driver has TRICKSHARE_RECORDER off-switch', driverSrc.indexOf('TRICKSHARE_RECORDER') !== -1);
check('driver defaults LEG to competent', driverSrc.indexOf("process.env.LEG || 'competent'") !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver records BEFORE/AFTER trick state (trickBefore + trickAfter)',
  driverSrc.indexOf('trickBefore') !== -1 && driverSrc.indexOf('trickAfter') !== -1);
check('driver records trickKnownEnd + trickObsEnd snapshots',
  driverSrc.indexOf('trickKnownEnd') !== -1 && driverSrc.indexOf('trickObsEnd') !== -1);
check('driver records the lever state per run (trickShare + trickShareEnabled)',
  driverSrc.indexOf('trickShare:') !== -1 && driverSrc.indexOf('trickShareEnabled:') !== -1);
check('driver records taught rows + offers (trickObservations + trickShareOffers)',
  driverSrc.indexOf('trickObservations') !== -1 && driverSrc.indexOf('trickShareOffers') !== -1);
check('driver wraps noteTrickTaught with source taught',
  driverSrc.indexOf("source: 'taught'") !== -1 && driverSrc.indexOf('noteTrickTaught') !== -1);
// Wave-4/5 id sets match the data (10 + 10).
const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const mlist = monsters.monsters || monsters;
const w4live = mlist.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const w5live = mlist.filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
check('wave-4 ids are 10 and match the data', w4live.length === 10 && JSON.stringify(w4live) === JSON.stringify(ANALYZE_W4()),
  'got ' + JSON.stringify(w4live));
check('wave-5 ids are 10 and match the data', w5live.length === 10 && JSON.stringify(w5live) === JSON.stringify(ANALYZE_W5()),
  'got ' + JSON.stringify(w5live));
function ANALYZE_W4() { return require(path.join(REPO, 'scripts', 'analyze-killfail-a')).W4.slice().sort(); }
function ANALYZE_W5() { return require(path.join(REPO, 'scripts', 'analyze-killfail-a')).W5.slice().sort(); }

// ---------- 2. Unit: share mechanics, live loadGame (child processes) ----------
// Each child loads the game fresh with TRICKSHARE set or unset, then
// drives the observation + share paths directly and reports the
// observation counts, known-state, pending offers, and captured
// narration as JSON. The parent asserts the behavior; the child
// never judges.
console.log('== unit: share mechanics ==');
function shareChild(envExtra) {
  const env = Object.assign({}, process.env, envExtra || {});
  delete env.TRICKSHARE_RECORDER;
  const script = [
    "const { loadGame, setupGame } = require('./scripts/sim-harness');",
    "(async function () {",
    "  const { Game } = await loadGame({ seed: 102601, mode: 'trickshare-proof', fullTelemetry: false });",
    "  const said = [];",
    "  const origSay = Game.say ? Game.say.bind(Game) : null;",
    "  Game.say = function (s) { said.push(String(s)); try { if (origSay) return origSay(s); } catch (e) {} };",
    "  await setupGame(Game);",
    "  Game.state.villageCounterObs = {};",
    "  Game.state.villagerTricks = {};",
    "  Game.state.monsterCounters = {};",
    "  Game.state.trickSharePending = {};",
    "  delete Game.state.trickShareLastDay;",
    "  said.length = 0;",
    "  const roster = ((Game.state.village || {}).roster || []).slice();",
    "  if (roster.length < 4) { console.log(JSON.stringify({ error: 'roster<4', roster: roster })); return; }",
    "  const w1 = roster[0], w2 = roster[1], w3 = roster[2], w4 = roster[3];",
    "  const out = { enabled: null, roster: roster.slice(0, 4) };",
    "  try { out.enabled = (typeof Game.trickShareEnabled === 'function') ? Game.trickShareEnabled() : null; } catch (e) { out.enabled = 'ERR:' + e.message; }",
    "  // Haven population at game start (the perception ground).",
    "  try { out.havenAtStart = Game.campPeopleIds('haven'); } catch (e) { out.havenAtStart = 'ERR:' + e.message; }",
    "  // --- first observation: offer recorded, not learned ---",
    "  out.obs1 = {};",
    "  out.obs1.knownBefore = Game.villageKnowsTrick('algorithm');",
    "  Game.noteVillagerTrickObservation(w1, 'algorithm');",
    "  out.obs1.obsAfter1 = (Game.state.villageCounterObs || {}).algorithm || 0;",
    "  out.obs1.knownAfter1 = Game.villageKnowsTrick('algorithm');",
    "  out.obs1.pending = Game.state.trickSharePending ? Game.state.trickSharePending.algorithm || null : null;",
    "  out.obs1.saidAfter1 = said.slice();",
    "  // --- dawn share: teacher at Haven + listeners -> taught learn ---",
    "  said.length = 0;",
    "  out.share = {};",
    "  out.share.fired = Game.trickShareDawnTick();",
    "  out.share.obsAfter = (Game.state.villageCounterObs || {}).algorithm || 0;",
    "  out.share.knownAfter = Game.villageKnowsTrick('algorithm');",
    "  out.share.pendingAfter = Game.state.trickSharePending ? (Game.state.trickSharePending.algorithm || null) : null;",
    "  out.share.said = said.slice();",
    "  // --- once per dawn: a second tick the same day is a no-op ---",
    "  said.length = 0;",
    "  out.share.secondTick = Game.trickShareDawnTick();",
    "  out.share.secondTickSaid = said.slice();",
    "  // --- teacher away: pending kept, no credit ---",
    "  Game.state.villageCounterObs = {}; Game.state.villagerTricks = {}; Game.state.trickSharePending = {}; delete Game.state.trickShareLastDay; said.length = 0;",
    "  Game.noteVillagerTrickObservation(w2, 'eater');",
    "  try { Game.state.village.away = Game.state.village.away || {}; Game.state.village.away[w2] = true; } catch (e) {}",
    "  out.away = {};",
    "  out.away.pendingBefore = Game.state.trickSharePending ? Game.state.trickSharePending.eater || null : null;",
    "  out.away.fired = Game.trickShareDawnTick();",
    "  out.away.obsAfter = (Game.state.villageCounterObs || {}).eater || 0;",
    "  out.away.knownAfter = Game.villageKnowsTrick('eater');",
    "  out.away.pendingAfter = Game.state.trickSharePending ? (Game.state.trickSharePending.eater || null) : null;",
    "  // teacher comes home the next day -> the tale is told then",
    "  try { delete Game.state.village.away[w2]; } catch (e) {}",
    "  try { Game.state.scholar.day = (Game.state.scholar.day || 1) + 1; } catch (e) {}",
    "  said.length = 0;",
    "  out.away.firedNextDay = Game.trickShareDawnTick();",
    "  out.away.knownNextDay = Game.villageKnowsTrick('eater');",
    "  out.away.saidNextDay = said.slice();",
    "  // --- teacher dead: pending dropped, no credit ---",
    "  Game.state.villageCounterObs = {}; Game.state.villagerTricks = {}; Game.state.trickSharePending = {}; delete Game.state.trickShareLastDay; said.length = 0;",
    "  Game.noteVillagerTrickObservation(w3, 'reunion');",
    "  try { const p = Game.getPerson ? Game.getPerson(w3) : null; if (p) p.dead = true; } catch (e) {}",
    "  out.dead = {};",
    "  out.dead.fired = Game.trickShareDawnTick();",
    "  out.dead.obsAfter = (Game.state.villageCounterObs || {}).reunion || 0;",
    "  out.dead.knownAfter = Game.villageKnowsTrick('reunion');",
    "  out.dead.pendingAfter = Game.state.trickSharePending ? (Game.state.trickSharePending.reunion || null) : null;",
    "  // --- no listeners: teacher alone at Haven -> pending kept ---",
    "  Game.state.villageCounterObs = {}; Game.state.villagerTricks = {}; Game.state.trickSharePending = {}; delete Game.state.trickShareLastDay; said.length = 0;",
    "  try { const p3 = Game.getPerson ? Game.getPerson(w3) : null; if (p3) p3.dead = false; } catch (e) {}",
    "  Game.noteVillagerTrickObservation(w4, 'herald');",
    "  try { Game.state.village.away = {}; for (const r of roster) if (r !== w4) Game.state.village.away[r] = true; } catch (e) {}",
    "  out.alone = {};",
    "  out.alone.fired = Game.trickShareDawnTick();",
    "  out.alone.obsAfter = (Game.state.villageCounterObs || {}).herald || 0;",
    "  out.alone.knownAfter = Game.villageKnowsTrick('herald');",
    "  out.alone.pendingAfter = Game.state.trickSharePending ? (Game.state.trickSharePending.herald || null) : null;",
    "  try { Game.state.village.away = {}; } catch (e) {}",
    "  // --- second survived observation before dawn clears the pending ---",
    "  Game.state.villageCounterObs = {}; Game.state.villagerTricks = {}; Game.state.trickSharePending = {}; delete Game.state.trickShareLastDay; said.length = 0;",
    "  Game.noteVillagerTrickObservation(w1, 'audit');",
    "  out.clear = {};",
    "  out.clear.pendingAfter1 = Game.state.trickSharePending ? (Game.state.trickSharePending.audit || null) : null;",
    "  Game.noteVillagerTrickObservation(w2, 'audit');",
    "  out.clear.knownAfter2 = Game.villageKnowsTrick('audit');",
    "  out.clear.pendingAfter2 = Game.state.trickSharePending ? (Game.state.trickSharePending.audit || null) : null;",
    "  // --- teach-on-learn: learn with allies present voices the telling ---",
    "  Game.state.villageCounterObs = {}; Game.state.villagerTricks = {}; Game.state.trickSharePending = {}; delete Game.state.trickShareLastDay; said.length = 0;",
    "  Game.noteVillagerTrickObservation(w1, 'strike');",
    "  out.teach = {};",
    "  out.teach.saidAfter1 = said.slice();",
    "  said.length = 0;",
    "  Game.noteVillagerTrickObservation(w1, 'strike', [w2, w3]);",
    "  out.teach.knownAfter2 = Game.villageKnowsTrick('strike');",
    "  out.teach.saidAfter2 = said.slice();",
    "  // --- waves 1-2: a taught credit learns through discoverMonsterCounter ---",
    "  Game.state.villageCounterObs = {}; Game.state.villagerTricks = {}; Game.state.monsterCounters = {}; Game.state.trickSharePending = {}; delete Game.state.trickShareLastDay; said.length = 0;",
    "  Game.noteVillagerTrickObservation(w1, 'bulldozer');",
    "  out.w12 = {};",
    "  out.w12.obsAfter1 = (Game.state.villageCounterObs || {}).bulldozer || 0;",
    "  out.w12.pending = Game.state.trickSharePending ? (Game.state.trickSharePending.bulldozer || null) : null;",
    "  said.length = 0;",
    "  out.w12.taught = Game.noteTrickTaught('bulldozer', w1, [w2, w3]);",
    "  out.w12.knownAfter = Game.villageKnowsTrick('bulldozer');",
    "  out.w12.counterSet = !!((Game.state.monsterCounters || {}).bulldozer);",
    "  out.w12.said = said.slice();",
    "  console.log(JSON.stringify(out));",
    "})().catch(function (e) { console.error(e.stack); process.exit(1); });",
  ].join('\n');
  const res = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(res.trim().split('\n').pop());
}
const armedU = OFF_MODE ? null : shareChild({ TRICKSHARE: '1' });
const controlU = shareChild({});
if (!OFF_MODE) {
  check('armed flag reads true (trickShareEnabled)', armedU.enabled === true, 'got ' + JSON.stringify(armedU.enabled));
}
check('control flag reads false (trickShareEnabled)', controlU.enabled === false, 'got ' + JSON.stringify(controlU.enabled));
if (!OFF_MODE) {
  check('armed: Haven population at start includes the teacher + listeners',
    Array.isArray(armedU.havenAtStart) && armedU.havenAtStart.indexOf(armedU.roster[0]) !== -1 && armedU.havenAtStart.length >= 2,
    'haven=' + JSON.stringify(armedU.havenAtStart) + ' roster=' + JSON.stringify(armedU.roster));
  check('armed: first observation records a pending offer (teacher + day), trick NOT learned',
    armedU.obs1.knownBefore === false && armedU.obs1.obsAfter1 === 1 && armedU.obs1.knownAfter1 === false &&
    armedU.obs1.pending && armedU.obs1.pending.teacher === armedU.roster[0] && typeof armedU.obs1.pending.day === 'number',
    JSON.stringify(armedU.obs1));
  check('armed: first observation is silent (no COUNTER LEARNED, no telling line)',
    armedU.obs1.saidAfter1.every(function (s) { return s.indexOf('COUNTER LEARNED') === -1 && s.indexOf('told the fire') === -1; }),
    JSON.stringify(armedU.obs1.saidAfter1).slice(0, 300));
  check('armed: dawn share fires, teaches the trick (obs 1->2), pending consumed',
    armedU.share.fired === true && armedU.share.obsAfter === 2 && armedU.share.knownAfter === true && armedU.share.pendingAfter === null,
    JSON.stringify(armedU.share));
  check('armed: dawn share voices the hearthside learn beat (teacher + listeners named)',
    armedU.share.said.some(function (s) { return s.indexOf('COUNTER LEARNED') !== -1 && s.indexOf('At the fire,') !== -1 && s.indexOf('told') !== -1; }),
    JSON.stringify(armedU.share.said).slice(0, 500));
  check('armed: second dawn tick the same day is a no-op (once-per-dawn guard)',
    armedU.share.secondTick === false && armedU.share.secondTickSaid.length === 0,
    'secondTick=' + armedU.share.secondTick + ' said=' + JSON.stringify(armedU.share.secondTickSaid));
  check('armed: teacher away from Haven -> pending kept, no credit, trick not learned',
    armedU.away.pendingBefore && armedU.away.pendingBefore.teacher === armedU.roster[1] &&
    armedU.away.fired === false && armedU.away.obsAfter === 1 && armedU.away.knownAfter === false &&
    armedU.away.pendingAfter && armedU.away.pendingAfter.teacher === armedU.roster[1],
    JSON.stringify(armedU.away));
  check('armed: teacher home the next day -> the tale is told then (pending survives a missed dawn)',
    armedU.away.firedNextDay === true && armedU.away.knownNextDay === true,
    JSON.stringify({ fired: armedU.away.firedNextDay, known: armedU.away.knownNextDay }));
  check('armed: teacher dead before dawn -> pending dropped, no credit',
    armedU.dead.fired === false && armedU.dead.obsAfter === 1 && armedU.dead.knownAfter === false && armedU.dead.pendingAfter === null,
    JSON.stringify(armedU.dead));
  check('armed: no listeners at Haven -> pending kept, no credit',
    armedU.alone.fired === false && armedU.alone.obsAfter === 1 && armedU.alone.knownAfter === false &&
    armedU.alone.pendingAfter && armedU.alone.pendingAfter.teacher === armedU.roster[3],
    JSON.stringify(armedU.alone));
  check('armed: second survived observation before dawn clears the pending (learned the old way)',
    armedU.clear.pendingAfter1 && armedU.clear.pendingAfter1.teacher === armedU.roster[0] &&
    armedU.clear.knownAfter2 === true && armedU.clear.pendingAfter2 === null,
    JSON.stringify(armedU.clear));
  check('armed: teach-on-learn voices the party who were there (names + "how it went")',
    armedU.teach.knownAfter2 === true &&
    armedU.teach.saidAfter2.some(function (s) { return s.indexOf('how it went') !== -1 && s.indexOf('they were there') !== -1; }),
    JSON.stringify(armedU.teach.saidAfter2).slice(0, 400));
  check('armed: first observation of the teach pair stays silent (no learn line yet)',
    armedU.teach.saidAfter1.every(function (s) { return s.indexOf('COUNTER LEARNED') === -1; }),
    JSON.stringify(armedU.teach.saidAfter1).slice(0, 300));
  check('armed: waves 1-2 taught credit learns through discoverMonsterCounter (counter set, via taught)',
    armedU.w12.obsAfter1 === 1 && armedU.w12.pending && armedU.w12.pending.teacher === armedU.roster[0] &&
    armedU.w12.taught === true && armedU.w12.knownAfter === true && armedU.w12.counterSet === true,
    JSON.stringify(armedU.w12));
  check('armed: waves 1-2 taught learn beat is voiced with the taught framing',
    armedU.w12.said.some(function (s) { return s.indexOf('COUNTER LEARNED') !== -1 && s.indexOf('Someone at the haven knew the trick.') !== -1; }),
    JSON.stringify(armedU.w12.said).slice(0, 400));
}
check('control: first observation records NO pending offer (flag off)',
  controlU.obs1.obsAfter1 === 1 && controlU.obs1.knownAfter1 === false &&
  (controlU.obs1.pending === null || controlU.obs1.pending === undefined),
  JSON.stringify(controlU.obs1));
check('control: dawn tick fires nothing with the flag off (no share, no learn)',
  controlU.share.fired === false && controlU.share.obsAfter === 1 && controlU.share.knownAfter === false,
  JSON.stringify(controlU.share));
check('control: second observation still teaches the old way (threshold 2 intact)',
  controlU.clear.knownAfter2 === true && controlU.clear.pendingAfter2 === null,
  JSON.stringify(controlU.clear));
check('control: teach-on-learn line never fires with the flag off',
  controlU.teach.saidAfter2.every(function (s) { return s.indexOf('how it went') === -1; }),
  JSON.stringify(controlU.teach.saidAfter2).slice(0, 300));
check('control: waves 1-2 taught credit refuses with the flag off (noteTrickTaught false, counter unset)',
  controlU.w12.taught === false && controlU.w12.knownAfter === false && controlU.w12.counterSet === false,
  JSON.stringify(controlU.w12));

// ---------- 3. Unit: live geared fight produces the first observation ----------
// ENCOUNTER GEAR (Steve 2026-11-13): the fighter is a villager with the
// average gear a player actually has at wave-3 content — a machete in
// hand, crude bow in the pack — fighting with two geared party allies
// against a wave-3 Redactor. The scholar is geared alongside (crude
// bow + arrows + machete). Nothing here is a fresh un-geared scholar
// alone: the observation must come out of a REAL field fight, not a
// direct function call. Deterministic per seed; the child tries seeds
// 102601-102603 and takes the first survived outcome.
console.log('== unit: live geared fight ==');
function fightChild() {
  const env = Object.assign({}, process.env, { TRICKSHARE: '1' });
  delete env.TRICKSHARE_RECORDER;
  const script = [
    "const { loadGame, setupGame } = require('./scripts/sim-harness');",
    "(async function () {",
    "  const out = { tried: [] };",
    "  for (const seed of [102601, 102602, 102603]) {",
    "    const { Game } = await loadGame({ seed: seed, mode: 'trickshare-fight', fullTelemetry: false });",
    "    const said = [];",
    "    const origSay = Game.say ? Game.say.bind(Game) : null;",
    "    Game.say = function (s) { said.push(String(s)); try { if (origSay) return origSay(s); } catch (e) {} };",
    "    await setupGame(Game);",
    "    Game.state.villageCounterObs = {}; Game.state.villagerTricks = {}; Game.state.trickSharePending = {}; delete Game.state.trickShareLastDay;",
    "    const roster = ((Game.state.village || {}).roster || []).slice();",
    "    if (roster.length < 3) { out.tried.push({ seed: seed, error: 'roster<3' }); continue; }",
    "    const w1 = roster[0], w2 = roster[1], w3 = roster[2];",
    "    // ENCOUNTER GEAR: fighter + allies carry the average wave-3 gear.",
    "    function gear(vid, melee) {",
    "      try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (!p) return false;",
    "        p.equipped = p.equipped || {}; p.equipped.melee = { itemId: melee };",
    "        p.items = p.items || []; if (!p.items.some(function (e) { return (e.itemId || e.id) === melee; })) p.items.push({ itemId: melee });",
    "        return true; } catch (e) { return false; }",
    "    }",
    "    const g1 = gear(w1, 'machete'), g2 = gear(w2, 'hunting_spear'), g3 = gear(w3, 'machete');",
    "    // The scholar is geared alongside: crude bow + arrows + machete.",
    "    let scholarGeared = false;",
    "    try { const s = Game.state.scholar || {}; s.items = s.items || [];",
    "      if (!s.items.some(function (e) { return (e.itemId || e.id) === 'crude_bow'; })) s.items.push({ itemId: 'crude_bow' });",
    "      if (!s.items.some(function (e) { return (e.itemId || e.id) === 'arrow'; })) s.items.push({ itemId: 'arrow', units: 6 });",
    "      if (!s.items.some(function (e) { return (e.itemId || e.id) === 'machete'; })) s.items.push({ itemId: 'machete' });",
    "      scholarGeared = true; } catch (e) {}",
    "    const mdef = (Game.data.monsters || []).find(function (m) { return m.id === 'redactor'; });",
    "    if (!mdef) { out.tried.push({ seed: seed, error: 'no-redactor' }); continue; }",
    "    let rec = null;",
    "    try { rec = Game.fieldFight(w1, mdef, null, { allies: 2, allyVids: [w2, w3], allyFromStart: true }); } catch (e) { out.tried.push({ seed: seed, error: 'fight-threw:' + String(e.message).slice(0, 80) }); continue; }",
    "    const obs = (Game.state.villageCounterObs || {}).redactor || 0;",
    "    const pending = Game.state.trickSharePending ? (Game.state.trickSharePending.redactor || null) : null;",
    "    out.tried.push({ seed: seed, fighter: w1, outcome: rec ? rec.outcome : null, rounds: rec ? rec.rounds : null,",
    "      geared: [g1, g2, g3], scholarGeared: scholarGeared, obs: obs, pendingTeacher: pending ? pending.teacher : null,",
    "      known: Game.villageKnowsTrick('redactor') });",
    "    if (rec && (rec.outcome === 'vFlee' || rec.outcome === 'mFlee' || rec.outcome === 'evade')) break;",
    "  }",
    "  console.log(JSON.stringify(out));",
    "})().catch(function (e) { console.error(e.stack); process.exit(1); });",
  ].join('\n');
  const res = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(res.trim().split('\n').pop());
}
if (!OFF_MODE) {
  const fight = fightChild();
  const survived = fight.tried.find(function (t) { return t.outcome === 'vFlee' || t.outcome === 'mFlee' || t.outcome === 'evade'; });
  check('live geared fight: at least one seed yields a survived encounter (vFlee/mFlee/evade)',
    !!survived, JSON.stringify(fight.tried));
  if (survived) {
    check('live geared fight: the fighter + both allies were geared (encounter gear, not fresh)',
      survived.geared[0] === true && survived.geared[1] === true && survived.geared[2] === true && survived.scholarGeared === true,
      JSON.stringify(survived));
    check('live geared fight: the survived encounter records observation 1 + a pending offer from the fighter',
      survived.obs === 1 && survived.pendingTeacher === survived.fighter,
      JSON.stringify(survived));
    check('live geared fight: the trick is NOT learned after one survived encounter (threshold 2 intact)',
      survived.known === false, JSON.stringify(survived));
  }
}

// ---------- 4. Recorder: live in-memory runs (shape + both flag states) ----------
console.log('== recorder live ==');
function loadDriverFresh(days, trickShare) {
  const driverPath = path.join(REPO, 'scripts', 'trickshare-driver-20261116.js');
  delete require.cache[require.resolve(driverPath)];
  process.env.LEG = 'competent';
  process.env.DAYS = String(days);
  delete process.env.TABLESEATNOWAIT;
  delete process.env.LEANLINKRESCUE;
  if (trickShare) process.env.TRICKSHARE = '1';
  else delete process.env.TRICKSHARE;
  return require(driverPath);
}
async function liveRuns() {
  const dControl = loadDriverFresh(5, false);
  const outControl = await dControl.oneRun(102601);
  check('live control run completes with 0 instrument errors', outControl.instrumentErrors.length === 0,
    JSON.stringify(outControl.instrumentErrors.slice(0, 3)));
  check('live control run policy is competent, sha 74a890f0844e',
    outControl.policy === 'competent' && outControl.policySha === '74a890f0844e',
    'got ' + outControl.policy + '/' + outControl.policySha);
  check('control run records trickShare false + trickShareEnabled false',
    outControl.trickShare === false && outControl.trickShareEnabled === false,
    'got trickShare=' + outControl.trickShare + ' enabled=' + outControl.trickShareEnabled);
  check('control run carries trickKnownEnd + trickObsEnd',
    outControl.trickKnownEnd && Array.isArray(outControl.trickKnownEnd.wave12) &&
    Array.isArray(outControl.trickKnownEnd.wave345) && outControl.trickObsEnd != null,
    JSON.stringify(outControl.trickKnownEnd));
  check('control run carries empty taught rows + offers (channel dead without the flag)',
    Array.isArray(outControl.trickObservations) && outControl.trickObservations.length === 0 &&
    Array.isArray(outControl.trickShareOffers) && outControl.trickShareOffers.length === 0,
    'taught=' + (outControl.trickObservations || []).length + ' offers=' + (outControl.trickShareOffers || []).length);
  if (OFF_MODE) return; // post-revert: only the control leg is provable; the armed leg is gone
  const dArmed = loadDriverFresh(150, true);
  const outLong = await dArmed.oneRun(102601);
  check('live 150d armed run completes with 0 instrument errors', outLong.instrumentErrors.length === 0,
    JSON.stringify(outLong.instrumentErrors.slice(0, 3)));
  check('armed run records trickShare true + trickShareEnabled true',
    outLong.trickShare === true && outLong.trickShareEnabled === true,
    'got trickShare=' + outLong.trickShare + ' enabled=' + outLong.trickShareEnabled);
  check('armed run carries killfailFights array', Array.isArray(outLong.killfailFights));
  const KA = require(path.join(REPO, 'scripts', 'analyze-killfail-a'));
  const cls = KA.classifySeed(outLong);
  check('live 150d armed run: every launched fight classifies (0 unclassified)',
    cls.unclassified.length === 0,
    JSON.stringify(cls.unclassified.map(function (r) { return { day: r.fight.day, mid: r.fight.mid, missing: r.classification.missingFields }; })));
  check('live 150d armed run: launched classification share is 100%',
    cls.launchedTotal === 0 || cls.launchedClassified === cls.launchedTotal,
    'got ' + cls.launchedClassified + '/' + cls.launchedTotal);
  const badKf = (cls.launched || []).map(function (r) { return r.fight; }).find(function (r) {
    return !(r && typeof r.day === 'number' && r.vid && r.mid && (r.wave === 4 || r.wave === 5) &&
      r.fighter && typeof r.fighter.class === 'string' && typeof r.fighter.armorP === 'number' &&
      typeof r.fighter.hpEntry === 'number' && typeof r.trickBefore === 'boolean' &&
      typeof r.outcome === 'string' && typeof r.rounds === 'number' && typeof r.mDealt === 'number' &&
      KA.effectiveMhp(r).method !== 'none' && Array.isArray(r.log) && Array.isArray(r.allies));
  });
  check('launched killfail rows have their full shape (before + after + entry HP by some method)', !badKf,
    badKf ? JSON.stringify(badKf).slice(0, 300) : '');
  check('armed run carries trickKnownEnd wave12/wave345 arrays',
    Array.isArray(outLong.trickKnownEnd.wave12) && Array.isArray(outLong.trickKnownEnd.wave345),
    JSON.stringify(outLong.trickKnownEnd));
  check('armed run carries taught-row + offer arrays (instrument present)',
    Array.isArray(outLong.trickObservations) && Array.isArray(outLong.trickShareOffers),
    'taught=' + (outLong.trickObservations || []).length + ' offers=' + (outLong.trickShareOffers || []).length);
}

// ---------- 5. Determinism legs D1 + D2 (150d, seed 102601, TRICKSHARE=1, LEG=competent) ----------
console.log('== determinism legs D1/D2 ==');
function childRun(envExtra, tag) {
  const env = Object.assign({}, process.env, { DAYS: '150', LEG: 'competent', TRICKSHARE: '1' }, envExtra || {});
  const outFile = '/tmp/trickshare-proof-' + tag + '.json';
  const script = "const fs=require('fs');const d=require('./scripts/trickshare-driver-20261116.js');"
    + "d.oneRun(102601).then(function(o){"
    + "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};"
    + "fs.writeFileSync(" + JSON.stringify(outFile) + ", JSON.stringify({fp:fp,full:o}));"
    + "console.log('WROTE " + outFile + "');"
    + "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(fs.readFileSync(outFile, 'utf8'));
}
async function determinism() {
  const a = childRun({}, 'd1a');
  const b = childRun({}, 'd1b');
  check('D1 repeatability: identical full corpus, recorder ON twice (150d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childRun({ TRICKSHARE_RECORDER: 'off' }, 'd2off');
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (150d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp));
  check('D2 recorder-off run carries empty killfail/rumorplan/seedattach/v4/dawnbid arrays',
    (off.full.killfailFights || []).length === 0 && (off.full.rumorplanLaunches || []).length === 0 &&
    (off.full.rumorplanTargetDiffs || []).length === 0 &&
    (off.full.seedattachBounces || []).length === 0 && (off.full.seedattachCensus || []).length === 0 &&
    (off.full.v4seeds || []).length === 0 && (off.full.dawnbidScores || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
  check('D2 recorder-off run carries empty taught rows + offers',
    (off.full.trickObservations || []).length === 0 && (off.full.trickShareOffers || []).length === 0);
}

(async function () {
  try {
    await liveRuns();
    if (!OFF_MODE) await determinism();
  } catch (e) {
    fail++;
    failures.push('live/determinism threw: ' + (e && e.stack ? e.stack.split('\n')[0] : String(e)));
    console.log('  FAIL: live/determinism threw: ' + (e && e.stack ? e.stack : String(e)));
  }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:'); failures.forEach(function (f) { console.log(' - ' + f); }); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
