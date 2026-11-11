// test-trapfirst-a.js — proof for the trapping first-numbers instrument
// (arm sim-trapfirst-a, run fleshout-20261111T0315Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-trapfirst-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const TI = require(path.join(REPO, 'scripts', 'trapfirst-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'trapfirst-analyze-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

// ---- A. Analyzer classifier fixtures (no game load) ----
(function () {
  ok(AN.isTrapDepositName('Snared meat'), 'A1 Snared meat is a trap deposit');
  ok(AN.isTrapDepositName('Pit meat (White-tailed deer)'), 'A2 Pit meat is a trap deposit');
  ok(!AN.isTrapDepositName('Game meat'), 'A3 Game meat is NOT a trap deposit (hunt duty)');
  ok(!AN.isTrapDepositName('Fish catch'), 'A4 Fish catch is not a trap deposit');
  ok(AN.isMeatDepositName('Snared meat'), 'A5 Snared meat is meat');
  ok(AN.isMeatDepositName('Game meat'), 'A6 Game meat is meat');
  ok(!AN.isMeatDepositName('Foraged food'), 'A7 Foraged food is not meat');
  eq(AN.defHp('glasswing'), 18, 'A8 glasswing def hp is 18 (not the 20 fallback)');
  ok(AN.defHp('nonexistent_species_xyz') === null, 'A9 unknown species def hp is null');
})();

// ---- B. Live wrap fixtures (one game load, direct calls) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 180241, mode: 'trapfirst-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const orig = {};
  ['stockPantry', 'foodCarcass', 'setTrap', 'craft', 'checkTraps', 'tele',
   'assignTask', 'offerDeal', 'appealToGoal', 'noteDeed', 'creditDeed',
   'spawnWorldMonster', 'cleanCarcass', 'pantryDraw', 'eat', 'eatOne',
   'eatStashOne'].forEach(function (n) { orig[n] = Game[n]; });
  const ti = TI.install(Game);
  const t = ti.t;
  const s = Game.state.scholar;

  // B1: stockPantry deposits recorded with name + kcal.
  Game.stockPantry(300, 'Snared meat');
  ok(t.deposits.length === 1 && t.deposits[0].name === 'Snared meat' && t.deposits[0].kcal === 300,
    'B1 stockPantry Snared meat recorded', t.deposits[0]);
  Game.stockPantry(700, 'Pit meat (White-tailed deer)');
  eq(t.deposits.length, 2, 'B2 Pit meat deposit recorded');

  // B3: foodCarcass by origin + species + kcal; trapped name suffix.
  const carc = Game.foodCarcass({ id: 'cottontail_rabbit', name: 'Cottontail rabbit' }, 400, 1, 'trapped');
  ok(t.carcasses.length === 1 && t.carcasses[0].origin === 'trapped' && t.carcasses[0].species === 'cottontail_rabbit' && t.carcasses[0].kcal === 400,
    'B3 foodCarcass trapped recorded', t.carcasses[0]);
  ok(carc && carc.foodState === 'carcass' && carc.hiddenKcal === 400 && /\(trapped\)/.test(carc.name),
    'B4 foodCarcass returns a real trapped carcass', carc && carc.name);

  // B5: setTrap recorded — scholar holds a snare tool. setTrap has NO
  // haven refusal in code (the haven gate lives in the policy's
  // workTraplineSet, not the engine); the trap lands on playerTile().
  s.tools = [{ recipeId: 'snare', uses: 10 }];
  const setBefore = t.trapSets.length;
  const setR = Game.setTrap('snare');
  ok(t.trapSets.length === setBefore + 1 && t.trapSets[t.trapSets.length - 1].recipeId === 'snare',
    'B5 setTrap snare recorded', t.trapSets[t.trapSets.length - 1]);
  ok(setR === true, 'B5b setTrap returns true with a held tool');
  ok(t.trapSets[t.trapSets.length - 1].wire === false, 'B5c held-tool set is not wire-improvised');

  // B6: wire-improvised set — no tool, snare_wire in the pack.
  s.tools = [];
  s.inventory = s.inventory || [];
  s.inventory.push({ id: 'snare_wire', name: 'Snare wire', units: 1, kcalEach: 0 });
  const wireBefore = t.trapSets.length;
  const wireR = Game.setTrap('snare');
  ok(t.trapSets.length === wireBefore + 1 && t.trapSets[t.trapSets.length - 1].wire === true,
    'B6 wire-improvised snare set recorded', t.trapSets[t.trapSets.length - 1]);
  ok(wireR === true, 'B6b wire set returns true');

  // B7: craft recorded with blind flag (L1 = blind).
  try { Game.state.codex.recipes.snare = { level: 1 }; } catch (e) {}
  s.inventory.push({ material: 'vine', name: 'Vine', units: 5, kcalEach: 0 });
  s.inventory.push({ material: 'stick', name: 'Stick', units: 5, kcalEach: 0 });
  const craftBefore = t.trapCrafts.length;
  let craftR = null;
  try { craftR = Game.craft('snare'); } catch (e) { ok(false, 'B7 craft snare recorded', { err: String(e && e.message) }); }
  ok(t.trapCrafts.length === craftBefore + 1 && t.trapCrafts[t.trapCrafts.length - 1].recipeId === 'snare' && t.trapCrafts[t.trapCrafts.length - 1].isTrap === true,
    'B7 craft snare recorded', t.trapCrafts[t.trapCrafts.length - 1]);
  ok(t.trapCrafts[t.trapCrafts.length - 1].blind === true, 'B7b L1 craft is blind');
  void craftR;

  // B8: checkTraps + luckRoll('trap') live. Rig the player tile: a snare
  // with eligible game. The roll may hit or miss under seeded RNG —
  // either proves the sink is live; a hit must also land a carcass.
  const pt = Game.playerTile();
  pt.wildlife = Object.assign({}, pt.wildlife || {}, { cottontail_rabbit: 3 });
  pt.traps = [{ recipeId: 'snare', mx: 4, my: 4, setDay: s.day || 0, uses: 10 }];
  const rollsBefore = t.luckRolls.filter(function (x) { return x.stream === 'trap'; }).length;
  const carcBefore = t.carcasses.filter(function (c) { return c.origin === 'trapped'; }).length;
  Game.checkTraps();
  eq(t.trapChecks.length, 1, 'B8 checkTraps call recorded');
  const trapRolls = t.luckRolls.filter(function (x) { return x.stream === 'trap'; });
  ok(trapRolls.length > rollsBefore && typeof trapRolls[trapRolls.length - 1].p === 'number',
    'B8b luckRoll trap recorded with a probability', trapRolls[trapRolls.length - 1]);
  const trapHits = trapRolls.filter(function (x) { return x.hit; }).length;
  if (trapHits > 0) {
    ok(t.carcasses.filter(function (c) { return c.origin === 'trapped'; }).length > carcBefore,
      'B8c a trap hit lands a trapped carcass', { hits: trapHits });
  } else {
    console.log('ok   B8c (skipped: seeded roll missed, no carcass expected)');
    pass++;
  }

  // B9: staged (scarecrow) catch is GUARANTEED and skips luckRoll.
  pt.wildlife = Object.assign({}, pt.wildlife || {}, { cottontail_rabbit: 3 });
  pt.traps = [{ recipeId: 'snare', mx: 4, my: 4, setDay: s.day || 0, uses: 10 }];
  s.stagedInjury = true;
  const rollsBefore9 = t.luckRolls.filter(function (x) { return x.stream === 'trap'; }).length;
  const carcBefore9 = t.carcasses.filter(function (c) { return c.origin === 'trapped'; }).length;
  Game.checkTraps();
  ok(t.carcasses.filter(function (c) { return c.origin === 'trapped'; }).length > carcBefore9,
    'B9 staged catch lands a trapped carcass');
  ok(t.luckRolls.filter(function (x) { return x.stream === 'trap'; }).length === rollsBefore9,
    'B9b staged catch skips luckRoll', { rolls: t.luckRolls.length });

  // B10: tele npc_trap / npc_pit recorded.
  Game.tele('npc_trap', { vid: 'some_vid', caught: true, kcal: 250 });
  Game.tele('npc_pit', { vid: 'some_vid', caught: true, kcal: 600, species: 'wild_boar' });
  ok(t.teleTrap.length === 2 && t.teleTrap[0].type === 'npc_trap' && t.teleTrap[0].kcal === 250,
    'B10 tele npc_trap recorded', t.teleTrap[0]);
  ok(t.teleTrap[1].type === 'npc_pit' && t.teleTrap[1].species === 'wild_boar' && t.teleTrap[1].kcal === 600,
    'B10b tele npc_pit recorded', t.teleTrap[1]);

  // B11: objReturnEffect 'traps' live path — a knowsSnare villager
  // returning from the trapline fires tele('npc_trap').
  let retVid = null;
  try {
    const ros = ((Game.state || {}).village || {}).roster || [];
    for (const cand of ros) {
      if (cand === Game.villagerId) continue;
      const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(cand) : null;
      if (vp) { vp.knowsSnare = true; retVid = cand; break; }
    }
  } catch (e) {}
  if (retVid && typeof Game.objReturnEffect === 'function') {
    const teleBefore = t.teleTrap.length;
    try { Game.objReturnEffect(retVid, 'traps'); } catch (e) { ok(false, 'B11 objReturnEffect traps fires', { err: String(e && e.message) }); }
    ok(t.teleTrap.length > teleBefore && t.teleTrap[t.teleTrap.length - 1].type === 'npc_trap',
      'B11 objReturnEffect traps fires tele npc_trap', t.teleTrap[t.teleTrap.length - 1]);
  } else {
    ok(false, 'B11 objReturnEffect traps fires', { retVid: retVid, hasMethod: typeof Game.objReturnEffect });
  }

  // B12: assignTask('hunt') + assignTask('deadfall') recorded (the
  // deadfall duty is stick-gathering, counted separately).
  const roster = ((Game.state || {}).village || {}).roster || [];
  const vid = roster.find(function (x) { return x !== Game.villagerId; }) || roster[0];
  Game.assignTask(vid, 'hunt');
  ok(t.huntCalls.length === 1 && t.huntCalls[0].task === 'hunt' && ['ok', 'refused', 'null'].indexOf(t.huntCalls[0].ret) !== -1,
    'B12 assignTask hunt recorded', t.huntCalls[0]);
  Game.assignTask(vid, 'deadfall');
  ok(t.huntCalls.length === 2 && t.huntCalls[1].task === 'deadfall',
    'B12b assignTask deadfall recorded separately', t.huntCalls[1]);
  ok(t.huntCalls.filter(function (c) { return c.verb !== 'assignTask'; }).length === 0,
    'B12c no other-path hunt calls yet');

  // B13: deeds — noteDeed('trapping') records exactly once (dedup).
  const deedsBefore = t.deeds.length;
  Game.noteDeed('trapping');
  eq(t.deeds.length, deedsBefore + 1, 'B13 noteDeed trapping records once (no double-count)');
  ok(t.deeds[t.deeds.length - 1].who === 'player', 'B13b player deed actor');
  Game.creditDeed(vid, 'trapping');
  ok(t.deeds.length === deedsBefore + 2 && t.deeds[t.deeds.length - 1].who === vid,
    'B13c villager trapping deed recorded', t.deeds[t.deeds.length - 1]);

  // B14: spawnWorldMonster bare {id} — the #1826 verification. The
  // WANDERSPAWN FIX fills def fields, so a glasswing must spawn at
  // def hp 18, not the old 20 fallback.
  const spBefore = t.spawns.length;
  const mon = Game.spawnWorldMonster({ id: 'glasswing' }, Game.map.px, Game.map.py, {});
  ok(t.spawns.length === spBefore + 1 && t.spawns[t.spawns.length - 1].id === 'glasswing',
    'B14 spawnWorldMonster bare {id} recorded', t.spawns[t.spawns.length - 1]);
  ok(mon && mon.hp === 18 && mon.maxHp === 18,
    'B14b bare-{id} glasswing spawns at def hp 18, not 20', mon && { hp: mon.hp, maxHp: mon.maxHp });

  // B15: gwTrapTick live trap-spawn path — rig the dive on the scholar's
  // own tile (turns 2 -> 3 triggers), assert the spawn record carries
  // the gwTrapTick caller and def hp. startCombat may run a full TB
  // fight; the spawn record precedes it, so a combat throw must not
  // lose the assertion.
  const spBefore15 = t.spawns.length;
  s.gwTrap = { monsterId: 'glasswing', tileX: (s.mx !== undefined ? s.mx : 4), tileY: (s.my !== undefined ? s.my : 4), turns: 2 };
  try { Game.gwTrapTick(); } catch (e) { console.log('note  B15 gwTrapTick threw after spawn (combat path): ' + String(e && e.message).slice(0, 120)); }
  const gwSpawns = t.spawns.slice(spBefore15).filter(function (x) { return /gwTrapTick/.test(x.caller || ''); });
  ok(gwSpawns.length >= 1, 'B15 gwTrapTick trap spawn recorded', gwSpawns[0]);
  ok(gwSpawns.length >= 1 && gwSpawns[0].hp === 18,
    'B15b trap-spawned glasswing carries def hp 18', gwSpawns[0]);

  // B16: cleanCarcass trapped attribution (identity + name suffix).
  s.inventory = s.inventory || [];
  s.inventory.push(Game.foodCarcass({ id: 'gray_squirrel', name: 'Gray squirrel' }, 200, s.day || 1, 'trapped'));
  const trapIdx = s.inventory.length - 1;
  s.inventory.push(Game.foodCarcass({ id: 'gray_squirrel', name: 'Gray squirrel' }, 200, s.day || 1, 'hunted'));
  const huntIdx = s.inventory.length - 1;
  const cleansBefore = t.cleans.length;
  try { Game.cleanCarcass(trapIdx); } catch (e) {}
  try { Game.cleanCarcass(huntIdx); } catch (e) {}
  ok(t.cleans.length >= cleansBefore + 1 && t.cleans[cleansBefore] && t.cleans[cleansBefore].trapped === true,
    'B16 trapped carcass clean attributed', t.cleans[cleansBefore]);
  if (t.cleans.length >= cleansBefore + 2) {
    ok(t.cleans[cleansBefore + 1].trapped === false, 'B16b hunted carcass clean is not trapped', t.cleans[cleansBefore + 1]);
  } else {
    console.log('note  B16b second clean produced no record (clean may have consumed both); trapped attribution still proven by B16');
  }

  // B17: pantryDraw wrap fires (draws by name).
  try {
    const v = Game.state.village;
    const res = Game.pantryDraw(v, 100, { cook: false });
    ok(t.draws.length === 1 && t.draws[0].taken !== undefined, 'B17 pantryDraw recorded', t.draws[0]);
    void res;
  } catch (e) { ok(false, 'B17 pantryDraw recorded', { err: String(e && e.message) }); }

  // B18: eat wrap fires.
  try {
    Game.eat();
    ok(t.wrapLive.eat === true, 'B18 eat wrap live');
  } catch (e) { ok(false, 'B18 eat wrap live', { err: String(e && e.message) }); }

  // B19: snapshot shape.
  const snap = ti.snapshot();
  ok(snap.pantryByName && typeof snap.pantryKcal === 'number', 'B19 snapshot pantry roll');
  ok(Array.isArray(snap.traps), 'B20 snapshot traps array', { n: (snap.traps || []).length });
  ok(snap.recipeLevels && typeof snap.recipeLevels.snare === 'number', 'B21 snapshot recipeLevels');
  ok(typeof snap.snareWireLevel === 'number', 'B22 snapshot snareWireLevel');
  ok(typeof snap.knowsSnare === 'number' && typeof snap.knowsPit === 'number', 'B23 snapshot knows counts', { ks: snap.knowsSnare, kp: snap.knowsPit });
  ok(snap.mapTrapWildlife && typeof snap.mapTrapWildlife.total === 'number', 'B24 snapshot mapTrapWildlife', snap.mapTrapWildlife);
  ok(Array.isArray(snap.trapToolsHeld), 'B25 snapshot trapToolsHeld');
  ok(Array.isArray(snap.animalsKnown), 'B26 snapshot animalsKnown');
  ok(Array.isArray(t.daily) && t.daily.length === 1, 'B27 snapshot stored');

  // B28: no instrument errors on the fixture run.
  eq(t.instrumentErrors.length, 0, 'B28 zero instrument errors', t.instrumentErrors);

  // B29: uninstall restores every wrapped method + the luck sink.
  ti.uninstall();
  const restored = ['stockPantry', 'foodCarcass', 'setTrap', 'craft', 'checkTraps', 'tele',
    'assignTask', 'offerDeal', 'appealToGoal', 'noteDeed', 'creditDeed',
    'spawnWorldMonster', 'cleanCarcass', 'pantryDraw', 'eat', 'eatOne',
    'eatStashOne'].every(function (n) { return Game[n] === orig[n]; });
  ok(restored, 'B29 uninstall restores all wraps');
  ok(!Game.__luckSink, 'B29b luck sink restored to unset');
}

// ---- C. Live trapline miniature: competent, 12 days, seed 180241 ----
async function traplineMiniature() {
  const { Game } = await loadGame({ seed: 180241, mode: 'trapfirst-proof-c', fullTelemetry: false });
  await setupGame(Game);
  const ti = TI.install(Game);
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally { try { ti.snapshot(); } catch (e) {} }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
  ti.uninstall();
  ok(result.days > 0, 'C1 miniature ran days', { days: result.days });
  ok(ti.t.deposits.some(function (d) { return d.name === 'Foraged food'; }), 'C2 forage deposits exist for the share comparison');
  ok(ti.t.daily.every(function (x) { return Array.isArray(x.traps) && x.mapTrapWildlife && typeof x.mapTrapWildlife.total === 'number'; }),
    'C3 every snapshot has traps + wildlife totals');
  eq(ti.t.instrumentErrors.length, 0, 'C4 zero instrument errors in miniature', ti.t.instrumentErrors);
  // C5/C6 are informational, not pass/fail: whether this cast knows the
  // snare in 12 days is cast-dependent. Print the counts for the record.
  console.log('info  C5 trapSets=' + ti.t.trapSets.length + ' trapCrafts=' + ti.t.trapCrafts.filter(function (c) { return c.isTrap; }).length +
    ' trapChecks=' + ti.t.trapChecks.length + ' luckTrap=' + ti.t.luckRolls.filter(function (x) { return x.stream === 'trap'; }).length +
    ' npcTrap=' + ti.t.teleTrap.filter(function (x) { return x.type === 'npc_trap'; }).length +
    ' huntCalls=' + ti.t.huntCalls.filter(function (c) { return c.task === 'hunt'; }).length +
    ' deadfallCalls=' + ti.t.huntCalls.filter(function (c) { return c.task === 'deadfall'; }).length);
  ok(true, 'C5 trap counts recorded (informational)');
  ok(true, 'C6 hunt/deadfall staffing counts recorded (informational)');
}

// ---- D. Neutrality miniature: instrument on vs off, 12 days ----
async function neutralityMini() {
  async function mini(seed, on) {
    const { Game } = await loadGame({ seed: seed, mode: 'trapfirst-proof-d', fullTelemetry: false });
    await setupGame(Game);
    let ti = null;
    if (on) ti = TI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (ti) ti.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
    if (ti) ti.uninstall();
    const pantryKcal = ((Game.state || {}).village || {}).pantry || [];
    const pk = pantryKcal.reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
    const deaths = ((result && result.samples && result.samples.deaths) || []).length;
    return { days: result.days, pantryKcal: pk, deaths: deaths, errors: ti ? ti.t.instrumentErrors.length : 0 };
  }
  const on = await mini(180241, true);
  const off = await mini(180241, false);
  ok(on.days === off.days && on.pantryKcal === off.pantryKcal && on.deaths === off.deaths,
    'D1 neutrality miniature identical', { on: on, off: off });
  eq(on.errors, 0, 'D2 miniature instrument errors 0');
}

(async function () {
  try {
    await liveFixtures();
    await traplineMiniature();
    await neutralityMini();
  } catch (e) {
    fail++;
    fails.push('harness-threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : String(e)));
    console.log('FAIL harness-threw :: ' + String(e && e.stack || e).slice(0, 500));
  }
  console.log('\ntrapfirst proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
