// test-vetguard-b.js — proof test, arm sim-vetguard-b.
// Proves the diagnostic's code premises and its instrument:
//   §1 LIVE: on a live staged fixture (a table-stage veteran built
//      through game code — recordWaveKill + stageTableVeteran +
//      winPlanHavenTick), winPlanFightGate returns
//      {avoid:true, reason:'veteran-guard'} for a SOLO table veteran
//      vs a wave-3 beast, demotes the plan to 'party', and bumps
//      avoidances — and returns null for the controls: same veteran
//      with a full armed party beside them, vs a wave-2 beast, when
//      the plan is not table-stage. Rule order: a solo table veteran
//      vs a WAVE-4 beast is veteran-guard, not outmatched.
//   §2 LIVE: winPlanDepart holds a table-stage veteran at Haven for
//      VETERAN_GUARD_DAYS when no party launches (bump
//      veteranGuardHolds), and releases them to 'normal' once the
//      hold expires.
//   §3 Analyzer on synthetic legs (via the analyzer's own --selftest,
//      asserted 0 failures) + frozen-bar judges on synthetic corpora.
//   §4 Driver module loads and exports its helpers.
// Live sections run through scripts/sim-harness.js (seeded, full
// src/js list in index.html order, Math.random seeded before eval).
// Substrate parity with the census: VETREENGAGE=1 (set here; the
// gate's co-tasked party counting is env-gated).
// Usage: node scripts/test-vetguard-b.js
'use strict';
process.env.VETREENGAGE = '1';
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const driver = require('./vetguard-driver-b');
const A = require('./analyze-vetguard-b');

let failures = 0;
function fail(msg) { failures++; console.error('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }
function assert(cond, msg) { if (cond) ok(msg); else fail(msg); }

async function live() {
  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'test' });
  if (loadFails && loadFails.length) { fail('live module load failures: ' + loadFails.join('; ')); return; }
  await setupGame(Game);
  const mdef = function (id) { return (Game.data.monsters || []).find(function (m) { return m.id === id; }); };
  const day = function () { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  assert(typeof Game.winPlanFightGate === 'function', '§1 Game.winPlanFightGate exists');
  assert(typeof Game.winPlanDepart === 'function', '§2 Game.winPlanDepart exists');
  assert(typeof Game.winPlanHavenTick === 'function', '§1 Game.winPlanHavenTick exists');
  assert(typeof Game.recordWaveKill === 'function', '§1 Game.recordWaveKill exists');
  assert(typeof Game.winPlanFightParty === 'function', '§1 Game.winPlanFightParty exists');
  assert(typeof Game.npcSetNode === 'function', '§1 Game.npcSetNode exists (fixture placement)');
  assert(typeof Game.winPlanStats === 'function', '§1 Game.winPlanStats exists');

  const haven = driver.havenTile(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const npcs = roster.filter(function (id) { return id && id !== Game.villagerId; });
  if (npcs.length < 3) { fail('live need 3+ NPCs, have ' + npcs.length); return; }

  // Pick a ranger at Haven as the veteran-to-be.
  let vid = null;
  for (const id of npcs) {
    if (!driver.alive(Game, id)) continue;
    const prof = Game.npcRangeProfile ? Game.npcRangeProfile(id) : null;
    if (prof !== 'wanderer' && prof !== 'explorer') continue;
    if (driver.atHaven(Game, id)) { vid = id; break; }
    if (!vid) vid = id;
  }
  if (!vid) { fail('live no ranger found for the veteran fixture'); return; }
  // Put the veteran at Haven (fixture placement — the HavenTick
  // advance requires it) and scatter everyone else far away so the
  // sensed party is solo unless a control places an ally beside them.
  Game.npcSetNode(vid, haven.nx, haven.ny);
  const others = npcs.filter(function (id) { return id !== vid; });
  others.forEach(function (id, i) { Game.npcSetNode(id, (i % 2 === 0 ? 0 : 8), (i % 4 < 2 ? 0 : 8)); });
  assert(driver.atHaven(Game, vid), '§1 veteran placed at Haven (' + haven.nx + ',' + haven.ny + ')');

  // Grant the wave-4 kill through the real choke point, then stage.
  Game.recordWaveKill('eater', vid, 'vetguard-test', null);
  assert(driver.isWave4Killer(Game, vid), '§1 recordWaveKill made ' + vid + ' a wave-4 killer (ledger path)');
  const d0 = day();
  const staged = driver.stageTableVeteran(Game, vid, d0);
  assert(staged.ok, '§1 stageTableVeteran ok for the veteran (why=' + (staged.why || 'null') + ')');
  assert(((Game.state || {})._standingDeferBeat || {})[5] === d0, '§1 staging set the fifth-draft beat (beat[5]=' + d0 + ')');
  // The advance to 'table' is GAME CODE's job: winPlanHavenTick.
  const ticked = Game.winPlanHavenTick(vid, haven.nx, haven.ny);
  const plan = driver.planOf(Game, vid);
  assert(plan && plan.stage === 'table', '§1 winPlanHavenTick advanced the staged veteran to table stage (stage=' + (plan && plan.stage) + ')');

  // Solo party check (the guard's party<2 trigger).
  const partySolo = Game.winPlanFightParty(vid);
  assert(Array.isArray(partySolo) && partySolo.length === 1 && partySolo[0] === vid,
    '§1 staged veteran fights solo at the meeting instant (party=' + JSON.stringify(partySolo) + ')');
  const vg = driver.gearOfReplica(Game, vid);
  console.log('note: veteran gear armed=' + vg.armed + ' armored=' + vg.armored + ' (solo fires regardless of gear)');

  const avoidBefore = (Game.winPlanStats() || {}).avoidances || 0;
  const redactor = mdef('redactor');
  assert(!!redactor && redactor.wave === 3, '§1 redactor def is wave 3 (guard floor)');
  // FIRE: solo table veteran vs a wave-3 beast.
  const fired = Game.winPlanFightGate(vid, redactor);
  assert(!!fired && fired.avoid === true && fired.reason === 'veteran-guard',
    '§1a FIRE: solo table veteran vs wave-3 -> avoid veteran-guard (got ' + JSON.stringify(fired && { avoid: fired.avoid, reason: fired.reason }) + ')');
  const planAfterFire = driver.planOf(Game, vid);
  assert(planAfterFire && planAfterFire.stage === 'party' && (planAfterFire.party || []).length === 0,
    '§1a the firing call demotes the plan to party with an empty party (stage=' + (planAfterFire && planAfterFire.stage) + ')');
  assert(((Game.winPlanStats() || {}).avoidances || 0) === avoidBefore + 1,
    '§1a the firing call bumps avoidances (' + avoidBefore + ' -> ' + ((Game.winPlanStats() || {}).avoidances || 0) + ')');

  // Re-stage to table for the controls (fixture reset; the HavenTick
  // path was already proven above).
  function restageTable() {
    const p = driver.planOf(Game, vid);
    if (p) { p.stage = 'table'; p.party = []; }
    return p;
  }
  // CONTROL 1: wave-2 beast — below the guard's floor.
  restageTable();
  const w2 = mdef('deer') || { id: 'deer', wave: 1 };
  const w2def = (Game.data.monsters || []).find(function (m) { return m && m.wave === 2; }) || w2;
  const nullW2 = Game.winPlanFightGate(vid, w2def);
  assert(nullW2 === null, '§1b CONTROL wave-' + (w2def.wave || '?') + ' vs solo table veteran -> null (got ' + JSON.stringify(nullW2 && { avoid: nullW2.avoid, reason: nullW2.reason }) + ')');
  assert(driver.planOf(Game, vid).stage === 'table', '§1b the wave-2 control leaves the plan table-staged');
  // CONTROL 2: plan not table-stage — a standing-stage veteran is not guarded.
  const p2 = driver.planOf(Game, vid);
  p2.stage = 'standing';
  const nullStanding = Game.winPlanFightGate(vid, redactor);
  assert(nullStanding === null, '§1c CONTROL standing-stage veteran vs wave-3 -> null (got ' + JSON.stringify(nullStanding && { avoid: nullStanding.avoid, reason: nullStanding.reason }) + ')');
  // CONTROL 3: rule order — solo table veteran vs a WAVE-4 beast is
  // veteran-guard, not outmatched (the guard is checked first).
  restageTable();
  const eater = mdef('eater');
  assert(!!eater && eater.wave === 4, '§1 eater def is wave 4');
  const fired4 = Game.winPlanFightGate(vid, eater);
  assert(!!fired4 && fired4.avoid === true && fired4.reason === 'veteran-guard',
    '§1d RULE ORDER: solo table veteran vs wave-4 -> veteran-guard, not outmatched (got ' + JSON.stringify(fired4 && { reason: fired4.reason }) + ')');
  // CONTROL 4: a full armed party beside the veteran — no guard.
  restageTable();
  // Arm the veteran if needed, then place an armed ally on their node.
  function armPerson(id) {
    const person = Game.getPerson ? Game.getPerson(id) : null;
    if (!person) return false;
    if (driver.gearOfReplica(Game, id).armed) return true;
    person.items = person.items || [];
    person.items.push({ itemId: 'sharpened_stick' });
    return driver.gearOfReplica(Game, id).armed;
  }
  assert(armPerson(vid), '§1e veteran armed for the party control');
  const ally = others[0];
  Game.npcSetNode(ally, haven.nx, haven.ny);
  assert(armPerson(ally), '§1e ally armed for the party control');
  const partyTwo = Game.winPlanFightParty(vid);
  assert(Array.isArray(partyTwo) && partyTwo.length === 2 && partyTwo.indexOf(ally) !== -1,
    '§1e party is now veteran + armed ally (party=' + JSON.stringify(partyTwo) + ')');
  const nullParty = Game.winPlanFightGate(vid, redactor);
  assert(nullParty === null, '§1e CONTROL table veteran + armed ally vs wave-3 -> null (got ' + JSON.stringify(nullParty && { avoid: nullParty.avoid, reason: nullParty.reason }) + ')');
  assert(driver.planOf(Game, vid).stage === 'table', '§1e the party control leaves the plan table-staged');
  // Clean up the ally placement for §2 (no companion at Haven).
  Game.npcSetNode(ally, 0, 0);

  // ---- §2: the depart-side guard ----
  // Re-stage (controls left the plan table-staged already; assert it),
  // scatter all companions off Haven so no party can launch.
  const plan2 = driver.planOf(Game, vid);
  assert(plan2 && plan2.stage === 'table', '§2 veteran still table-staged for the depart check');
  const holdsBefore = (Game.winPlanStats() || {}).veteranGuardHolds || 0;
  const dep1 = Game.winPlanDepart(vid, haven.nx, haven.ny, false);
  assert(dep1 === 'hold', '§2a DEPART HOLD: table veteran with no launchable companion -> hold (got ' + JSON.stringify(dep1) + ')');
  assert(((Game.winPlanStats() || {}).veteranGuardHolds || 0) === holdsBefore + 1,
    '§2a the hold bumps veteranGuardHolds (' + holdsBefore + ' -> ' + ((Game.winPlanStats() || {}).veteranGuardHolds || 0) + ')');
  const planHold = driver.planOf(Game, vid);
  assert(planHold && planHold.holdSinceDay === day(),
    '§2a the hold stamps holdSinceDay=' + day() + ' (got ' + (planHold && planHold.holdSinceDay) + ')');
  // Hold expiry: 7 days later the same call releases to 'normal'.
  // (The code treats a NEGATIVE holdSinceDay as "never held" and
  // re-stamps it, so the fixture advances the clock instead of
  // writing a negative day: day 10, hold stamped day 2, 8 days out.)
  Game.state.scholar.day = 10;
  planHold.holdSinceDay = 2;
  const dep2 = Game.winPlanDepart(vid, haven.nx, haven.ny, false);
  assert(dep2 === 'normal', '§2b HOLD EXPIRY: holdSinceDay 8 days ago -> normal (got ' + JSON.stringify(dep2) + ')');
  assert(driver.planOf(Game, vid).holdSinceDay === -1,
    '§2b expiry resets holdSinceDay to -1 (got ' + driver.planOf(Game, vid).holdSinceDay + ')');
}

async function main() {
  await live();
  // ---- §3: analyzer selftest + frozen-bar judges on synthetic corpora ----
  try {
    const stOk = A.selftest();
    assert(stOk === true, '§3 analyzer --selftest green');
  } catch (e) { fail('§3 analyzer selftest threw: ' + String(e && e.message)); }
  // ---- §4: driver exports ----
  assert(typeof driver.oneRun === 'function', '§4 driver exports oneRun');
  assert(typeof driver.stageTableVeteran === 'function', '§4 driver exports stageTableVeteran');
  assert(typeof driver.gearOfReplica === 'function', '§4 driver exports gearOfReplica');
  assert(typeof driver.isWave4Killer === 'function', '§4 driver exports isWave4Killer');
  assert(typeof driver.planOf === 'function', '§4 driver exports planOf');
  assert(typeof driver.needWaveOf === 'function', '§4 driver exports needWaveOf');
  assert(typeof driver.atHaven === 'function', '§4 driver exports atHaven');
  assert(typeof A.judgeSurvey === 'function' && typeof A.judgeStage === 'function', '§4 analyzer exports judgeSurvey/judgeStage');
  console.log(failures === 0 ? 'ALL PASS' : (failures + ' FAILURES'));
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(function (e) { console.error(e.stack); process.exit(1); });
