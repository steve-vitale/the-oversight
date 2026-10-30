#!/usr/bin/env node
// scripts/test-dissolveprobe-a.js — sim-dissolveprobe-a fixtures.
// Proves the in-call dissolve probe (scripts/policies/
// dissolveprobe-diag.js, NEW) stacked with the real scholarmelt
// recorder (scripts/policies/scholarmelt-diag.js, UNEDITED) plus the
// analyzer bracket rule (scripts/analyze-dissolveprobe-a.js) on
// synthetic rows BEFORE any judged analysis. No game harness, no
// jest: a fake Game with stubbed combat methods drives the real
// wraps; synthetic logs drive the real computeBracket.
// Usage: node scripts/test-dissolveprobe-a.js
// Exit 0 + FIXTURES-PASS iff every check passes.
'use strict';
const { newStore: newSmStore, installScholarmeltDiag, finalizeScholarmeltDiag } = require('./policies/scholarmelt-diag');
const { newStore: newProbeStore, installDissolveProbeDiag, MAX_EVENTS } = require('./policies/dissolveprobe-diag');
const { computeBracket } = require('./analyze-dissolveprobe-a');

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok: ${name}`); }
  else { failed++; console.log(`  FAIL: ${name}${detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''}`); }
}

// All WRAP_NAMES methods must exist on the fake Game or the probe
// install counts a diag error. All default to no-ops; scenarios
// override startCombat/tbAdvance/tbMonsterTurn/tbEnd per case.
const ALL_METHODS = ['startCombat', 'tbBeginTurn', 'tbAdvance', 'tbEnd',
  'tbEndCheck', 'tbBarrierExit', 'tbMonsterTurn', 'tbVillagerTurn',
  'tbRoundWrap', 'tbDamage', 'maybeCheatDeath', 'playerDeath',
  'identifyMonster', 'combatWitnessReact', 'villageEvent', 'observe',
  'removeWorldMonster', 'playerMonster', 'tele', 'say', 'sysSay', 'audioEvent'];
function fakeGame() {
  const G = {
    state: { scholar: { day: 10, health: 100, mx: 4, my: 4, monster: null } },
    map: { px: 4, py: 4 },
    villagerId: 'v1',
    over: false,
    tbfight: null,
    pendingMonsterId: null,
    _world: [],
    worldMonsters() { return this._world.slice(); },
    monsterAt(px, py) { return this._world.find(m => m.tx === px && m.ty === py) || null; },
  };
  for (const m of ALL_METHODS) {
    if (m === 'startCombat') G[m] = function () { return null; };
    else if (m === 'tbEnd') G[m] = function () {};
    else if (m === 'playerMonster') G[m] = function () { return null; };
    else G[m] = function () {};
  }
  return G;
}
function liveFight() {
  return { over: false, result: null, turnIdx: 0, round: 1, worldOrigin: null, tableTrial: false,
    order: ['m_0', 'p'],
    fighters: [
      { key: 'm_0', kind: 'monster', monsterId: 'herald', hp: 700, maxHp: 900, alive: true, fled: false, mdef: { id: 'herald' } },
      { key: 'p', kind: 'player', hp: 100, maxHp: 100, alive: true, fled: false },
    ] };
}
function stubGodpath() {
  const prev = globalThis.Scattering;
  globalThis.Scattering = { Godpath: {
    beginApexHunt() {}, observeApexHunt() {}, finishApexHunt() {},
    finishWardRescues() {}, finishTacticalEscape() {},
  } };
  return () => { if (prev === undefined) delete globalThis.Scattering; else globalThis.Scattering = prev; };
}

// Per-scenario Game builder: the orig startCombat branches on `mode`
// (set by the test), so wraps installed once see every scenario.
function scenarioGame(modeRef) {
  const G = fakeGame();
  G.startCombat = function () {
    const mode = modeRef.mode;
    if (mode === 'tbend') {
      const f = liveFight();
      G.tbfight = f;
      G.tbBeginTurn();
      // tbAdvance fake: ends the fight through Game.tbEnd.
      G.tbEnd('won');
      return G.tbfight;
    }
    if (mode === 'directnull') {
      const f = liveFight();
      G.tbfight = f;
      G.tbBeginTurn();
      G.tbMonsterTurn(f.fighters[0]);
      return null;
    }
    if (mode === 'bodygap') {
      const f = liveFight();
      G.tbfight = f;
      G.identifyMonster('herald');
      G.tbfight = null; // unwrapped body code nulls the fight
      G.combatWitnessReact('start');
      return null;
    }
    if (mode === 'live') {
      const f = liveFight();
      G.tbfight = f;
      G.tbBeginTurn();
      G.tbAdvance();
      return G.tbfight;
    }
    if (mode === 'throw') {
      const f = liveFight();
      G.tbfight = f;
      G.tbBeginTurn();
      throw new Error('boom');
    }
    if (mode === 'cap') {
      const f = liveFight();
      G.tbfight = f;
      for (let i = 0; i < MAX_EVENTS + 100; i++) G.tele('x');
      return G.tbfight;
    }
    return null;
  };
  // Scenario-specific sub-behavior (read by the orig above through G):
  const origTbMonsterTurn = G.tbMonsterTurn;
  G.tbMonsterTurn = function () {
    if (modeRef.mode === 'directnull') { G.tbfight = null; return; }
    return origTbMonsterTurn.apply(this, arguments);
  };
  const origTbEnd = G.tbEnd;
  G.tbEnd = function (result) {
    // Fake core tbEnd: mark over, record result, null the fight.
    const f = G.tbfight;
    if (!f || f.over) return;
    f.over = true; f.result = result;
    G.tbfight = null;
    return origTbEnd.apply(this, arguments);
  };
  return G;
}

function runOrder(order) {
  const tag = order;
  const restore = stubGodpath();
  try {
    const modeRef = { mode: 'live' };
    const G = scenarioGame(modeRef);
    const smStore = newSmStore();
    const probeStore = newProbeStore();
    if (order === 'probe-out') {
      installScholarmeltDiag(G, smStore);
      installDissolveProbeDiag(G, probeStore, smStore);
    } else {
      installDissolveProbeDiag(G, probeStore, smStore);
      installScholarmeltDiag(G, smStore);
    }
    check(`${tag} probe installed`, probeStore.installed === true, probeStore);
    check(`${tag} probe errs 0 after install`, probeStore.errs === 0, probeStore.errors);

    // A: tbEnd inside -> bracket tbEnd, tbEndSeen true, row NOT dissolved.
    modeRef.mode = 'tbend';
    const retA = G.startCombat('herald');
    const rowA = smStore.meetings[0];
    check(`${tag} A row has probe log`, !!rowA.dissolveInCallProbe && rowA.dissolveInCallProbe.events.length > 0, rowA.dissolveInCallProbe);
    check(`${tag} A row ended won (not dissolved)`, rowA.result === 'won', rowA.result);
    const bA = computeBracket(rowA.dissolveInCallProbe);
    check(`${tag} A bracket call tbEnd`, bA.bracketed && bA.windowKind === 'call' && bA.windowCall === 'tbEnd', bA);
    check(`${tag} A tbEndSeen true`, bA.tbEndSeen === true, bA);
    check(`${tag} A delegation returns fight-null after tbEnd`, retA === null, retA);

    // B: direct null inside tbMonsterTurn, no tbEnd -> subtree bracket.
    modeRef.mode = 'directnull';
    G.startCombat('herald');
    const rowB = smStore.meetings[1];
    check(`${tag} B row dissolved start-post`, rowB.result === null && rowB.dissolveCause === 'start-post-gone', { result: rowB.result, cause: rowB.dissolveCause });
    finalizeScholarmeltDiag(G, smStore);
    check(`${tag} B flushed dissolved-no-tbend`, rowB.result === 'dissolved-no-tbend', rowB.result);
    check(`${tag} B probe attached`, !!rowB.dissolveInCallProbe && rowB.dissolveInCallProbe.events.length > 0, rowB.dissolveInCallProbe);
    const bB = computeBracket(rowB.dissolveInCallProbe);
    check(`${tag} B bracket call tbMonsterTurn`, bB.bracketed && bB.windowKind === 'call' && bB.windowCall === 'tbMonsterTurn', bB);
    check(`${tag} B tbEndSeen false`, bB.tbEndSeen === false, bB);
    // Fake orig calls tbMonsterTurn directly (not nested in tbAdvance),
    // so the nesting is just the call itself and context is null.
    check(`${tag} B nesting is the call itself`, bB.windowContext === null && bB.windowNesting && bB.windowNesting.length === 1 && bB.windowNesting[0] === 'tbMonsterTurn', bB);
    const transB = rowB.dissolveInCallProbe.events.find(e => e.stackNames);
    check(`${tag} B transition carries stackNames`, Array.isArray(transB && transB.stackNames), transB);
    check(`${tag} B stackNames carry no paths`, (transB.stackNames || []).every(n => n.indexOf('/') < 0 && n.indexOf('\\') < 0), transB && transB.stackNames);

    // C: null in body gap -> gap bracket.
    modeRef.mode = 'bodygap';
    G.startCombat('herald');
    const rowC = smStore.meetings[2];
    check(`${tag} C row dissolved start-post`, rowC.dissolveCause === 'start-post-gone', rowC.dissolveCause);
    const bC = computeBracket(rowC.dissolveInCallProbe);
    check(`${tag} C bracket gap`, bC.bracketed && bC.windowKind === 'gap' && bC.windowCall === 'gap:identifyMonster->combatWitnessReact', bC);
    check(`${tag} C gap context startCombat-body`, bC.windowContext === 'startCombat-body', bC);
    check(`${tag} C tbEndSeen false`, bC.tbEndSeen === false, bC);

    // D: live fight -> no bracket, no false null, identity preserved.
    modeRef.mode = 'live';
    const retD = G.startCombat('herald');
    const rowD = smStore.meetings[3];
    check(`${tag} D row live (no cause)`, rowD.dissolveCause === null && rowD.result === null, { cause: rowD.dissolveCause, result: rowD.result });
    check(`${tag} D delegation returns same fight object`, retD === G.tbfight && retD !== null, retD === G.tbfight);
    const bD = computeBracket(rowD.dissolveInCallProbe);
    check(`${tag} D unbracketed no-null-event`, !bD.bracketed && bD.reason === 'no-null-event', bD);
    // Cleanup: end the live fight so later scenarios start clean.
    G.tbEnd('fled');

    // E: engine throw inside window -> rethrown, window closes.
    modeRef.mode = 'throw';
    let caught = null;
    try { G.startCombat('herald'); } catch (e) { caught = e; }
    check(`${tag} E throw rethrown unchanged`, caught && caught.message === 'boom', caught && caught.message);
    const rowE = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} E throw row has probe log`, !!rowE.dissolveInCallProbe && rowE.dissolveInCallProbe.events.length > 0, rowE.dissolveInCallProbe);
    check(`${tag} E throw event recorded`, rowE.dissolveInCallProbe.events.some(e => e.phase === 'throw'), rowE.dissolveInCallProbe.events.map(e => e.fn + '/' + e.phase));
    // Window closed: next window works (fresh buffer, not the throw's).
    modeRef.mode = 'live';
    G.startCombat('herald');
    const rowE2 = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} E next window attaches fresh log`, !!rowE2.dissolveInCallProbe && rowE2.dissolveInCallProbe !== rowE.dissolveInCallProbe, !!rowE2.dissolveInCallProbe);
    G.tbEnd('fled');

    // F: buffer cap flags overflow (same Game; tele loop inside window).
    modeRef.mode = 'cap';
    G.startCombat('herald');
    const rowF = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} F overflow flagged`, rowF.dissolveInCallProbe.overflow === true, rowF.dissolveInCallProbe.overflow);
    check(`${tag} F events capped at MAX_EVENTS`, rowF.dissolveInCallProbe.events.length === MAX_EVENTS, rowF.dissolveInCallProbe.events.length);
    check(`${tag} F probe store overflow counted`, (probeStore.overflow.windows | 0) >= 1, probeStore.overflow);
    G.tbEnd('fled');

    check(`${tag} probe errs 0 at end`, probeStore.errs === 0, probeStore.errors);
    check(`${tag} probe windows counted`, probeStore.windows >= 7, probeStore.windows);
    check(`${tag} probe attached counted`, probeStore.attached >= 7, probeStore.attached);
  } finally { restore(); }
}

// Analyzer synthetic-log tests (no Game needed).
{
  const ev = (fn, phase, state, stack) => ({ fn, phase, state, callStack: stack || [], turnIdx: 0, round: 1, currentKey: 'p', playerHp: 100, nMonFighting: 1 });
  // Call bracket, tbEndSeen true.
  let b = computeBracket({ events: [
    ev('startCombat', 'enter', 'null'), ev('tbBeginTurn', 'enter', 'live', ['tbBeginTurn']),
    ev('tbBeginTurn', 'exit', 'live', ['tbBeginTurn']), ev('tbAdvance', 'enter', 'live', ['tbAdvance']),
    ev('tbEnd', 'enter', 'live', ['tbAdvance', 'tbEnd']), ev('tbEnd', 'exit', 'null', ['tbAdvance', 'tbEnd']),
    ev('tbAdvance', 'exit', 'null', ['tbAdvance']), ev('startCombat', 'exit', 'null'),
  ], overflow: false });
  check('SYN call tbEnd', b.bracketed && b.windowKind === 'call' && b.windowCall === 'tbEnd' && b.tbEndSeen === true, b);
  // Gap bracket, tbEndSeen false.
  b = computeBracket({ events: [
    ev('startCombat', 'enter', 'null'), ev('identifyMonster', 'enter', 'live', ['identifyMonster']),
    ev('identifyMonster', 'exit', 'live', ['identifyMonster']), ev('combatWitnessReact', 'enter', 'null', ['combatWitnessReact']),
    ev('startCombat', 'exit', 'null'),
  ], overflow: false });
  check('SYN gap body', b.bracketed && b.windowKind === 'gap' && b.windowCall === 'gap:identifyMonster->combatWitnessReact' && b.windowContext === 'startCombat-body' && b.tbEndSeen === false, b);
  // tbEnd ran but did NOT null; later call did -> tbEndSeen true, window other call.
  b = computeBracket({ events: [
    ev('startCombat', 'enter', 'null'), ev('tbEnd', 'enter', 'live', ['tbEnd']),
    ev('tbEnd', 'exit', 'live', ['tbEnd']), ev('tbMonsterTurn', 'enter', 'live', ['tbMonsterTurn']),
    ev('tbMonsterTurn', 'exit', 'null', ['tbMonsterTurn']), ev('startCombat', 'exit', 'null'),
  ], overflow: false });
  check('SYN tbEndSeen with other window', b.bracketed && b.windowCall === 'tbMonsterTurn' && b.tbEndSeen === true, b);
  // Unbracketed: live only.
  b = computeBracket({ events: [ev('startCombat', 'enter', 'null'), ev('tbBeginTurn', 'enter', 'live', ['tbBeginTurn']), ev('startCombat', 'exit', 'live')], overflow: false });
  check('SYN unbracketed no-null', !b.bracketed && b.reason === 'no-null-event', b);
  // Missing log variants.
  b = computeBracket(null);
  check('SYN missing null', !b.bracketed && b.reason === 'missing-log', b);
  b = computeBracket({ events: [], overflow: false });
  check('SYN missing empty', !b.bracketed && b.reason === 'missing-log', b);
  b = computeBracket({ events: [ev('startCombat', 'enter', 'null'), ev('startCombat', 'exit', 'null')], overflow: false });
  check('SYN no-live-event', !b.bracketed && b.reason === 'no-live-event', b);
  // Over-transition counts as the null event.
  b = computeBracket({ events: [
    ev('startCombat', 'enter', 'null'), ev('tbBeginTurn', 'enter', 'live', ['tbBeginTurn']),
    ev('tbBeginTurn', 'exit', 'over', ['tbBeginTurn']), ev('startCombat', 'exit', 'null'),
  ], overflow: false });
  check('SYN over-transition brackets', b.bracketed && b.windowCall === 'tbBeginTurn', b);
}

runOrder('probe-out');
runOrder('probe-in');

console.log(`FIXTURES: passed=${passed} failed=${failed}`);
if (failed) { console.log('FIXTURES-FAIL'); process.exit(1); }
console.log('FIXTURES-PASS ' + passed + '/' + (passed + failed));
