#!/usr/bin/env node
// scripts/test-refusalsay-a.js — sim-refusalsay-a fixtures.
// Proves the refusal say-text probe (scripts/policies/
// refusalsay-diag.js, NEW) stacked with the real scholarmelt
// recorder (scripts/policies/scholarmelt-diag.js, UNEDITED) plus
// the analyzer refusal rule (scripts/analyze-refusalsay-a.js) on
// synthetic rows BEFORE any judged analysis. No game harness, no
// jest: a fake Game with stubbed combat methods drives the real
// wraps; synthetic logs drive the real computeRefusal.
// Usage: node scripts/test-refusalsay-a.js
// Exit 0 + FIXTURES-PASS iff every check passes.
'use strict';
const { newStore: newSmStore, installScholarmeltDiag, finalizeScholarmeltDiag } = require('./policies/scholarmelt-diag');
const { newStore: newProbeStore, installRefusalsayDiag, MAX_EVENTS, MAX_ARGTEXT, WRAP_NAMES } = require('./policies/refusalsay-diag');
const { computeRefusal, parseGateSay } = require('./analyze-refusalsay-a');

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ok: ${name}`); }
  else { failed++; console.log(`  FAIL: ${name}${detail !== undefined ? ' :: ' + JSON.stringify(detail) : ''}`); }
}

const MUSTER_TEXT = '⛔ THE HERALD does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster 10 allied blades (you have 3). This is not courage. This is arithmetic.';
const CAMPAIGN_FLOOR_TEXT = '⛔ THE HEART demands 10 surviving blades — the march has 7. Sound the call again (finaleReinforce) if anyone still answers, or the campaign ends here.';
const CAMPAIGN_NODE_TEXT = '⛔ THE HEART is not here yet. The sky is still showing commercials — kill THE COMMERCIAL BREAK first (node 1 of 3). The march goes in order.';

// All WRAP_NAMES methods must exist on the fake Game or the probe
// install counts a diag error. NOTE: removeWorldMonster is
// deliberately ABSENT (and absent from WRAP_NAMES): the probe must
// install cleanly without it. All default to no-ops; scenarios
// override startCombat/tbAdvance/tbMonsterTurn/tbEnd per case.
const ALL_METHODS = ['startCombat', 'tbBeginTurn', 'tbAdvance', 'tbEnd',
  'tbEndCheck', 'tbBarrierExit', 'tbMonsterTurn', 'tbVillagerTurn',
  'tbRoundWrap', 'tbDamage', 'maybeCheatDeath', 'playerDeath',
  'identifyMonster', 'combatWitnessReact', 'villageEvent', 'observe',
  'playerMonster', 'tele', 'say', 'sysSay', 'audioEvent'];
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
    if (mode === 'refusal') { G.say(MUSTER_TEXT); return null; }
    if (mode === 'campaign-floor') { G.say(CAMPAIGN_FLOOR_TEXT); return null; }
    if (mode === 'campaign-node') { G.say(CAMPAIGN_NODE_TEXT); return null; }
    if (mode === 'unknown-say') { G.say('Something unrecognized happened.'); return null; }
    if (mode === 'multi-say') { G.say('First.'); G.say('Second.'); return null; }
    if (mode === 'nosay') { return null; }
    if (mode === 'tbend') {
      const f = liveFight();
      G.tbfight = f;
      G.tbBeginTurn();
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
    if (mode === 'nested') {
      // Outer live window; inner refusal call nests inside it.
      const f = liveFight();
      G.tbfight = f;
      const saved = modeRef.mode;
      modeRef.mode = 'refusal';
      try { G.startCombat('herald'); } finally { modeRef.mode = saved; }
      return G.tbfight;
    }
    return null;
  };
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
      installRefusalsayDiag(G, probeStore, smStore);
    } else {
      installRefusalsayDiag(G, probeStore, smStore);
      installScholarmeltDiag(G, smStore);
    }
    check(`${tag} probe installed`, probeStore.installed === true, probeStore);
    check(`${tag} probe errs 0 after install`, probeStore.errs === 0, probeStore.errors);
    check(`${tag} no removeWorldMonster wrap`, WRAP_NAMES.indexOf('removeWorldMonster') < 0, WRAP_NAMES);

    // R: refusal (muster) -> dissolved, refusal bracket, have/need parsed.
    modeRef.mode = 'refusal';
    G.startCombat('herald');
    const rowR = smStore.meetings[0];
    check(`${tag} R row dissolved start-post`, rowR.dissolveCause === 'start-post-gone', rowR.dissolveCause);
    finalizeScholarmeltDiag(G, smStore);
    check(`${tag} R flushed dissolved-no-tbend`, rowR.result === 'dissolved-no-tbend', rowR.result);
    check(`${tag} R probe attached`, !!rowR.refusalSayProbe && rowR.refusalSayProbe.events.length > 0, rowR.refusalSayProbe);
    const sayEv = rowR.refusalSayProbe.events.find(e => e.fn === 'say' && e.phase === 'enter');
    check(`${tag} R say enter carries verbatim argText`, sayEv && sayEv.argText === MUSTER_TEXT, sayEv && sayEv.argText);
    check(`${tag} R no argText on non-say events`, rowR.refusalSayProbe.events.filter(e => e.fn !== 'say' && e.fn !== 'sysSay').every(e => e.argText === undefined), rowR.refusalSayProbe.events.map(e => e.fn + ':' + (e.argText !== undefined)));
    const bR = computeRefusal(rowR.refusalSayProbe, 'herald');
    check(`${tag} R bracket refusal muster`, bR.bracketed && bR.windowKind === 'refusal' && bR.windowCall === 'refusal:muster', bR);
    check(`${tag} R have/need parsed 3/10`, bR.have === 3 && bR.need === 10, bR);
    check(`${tag} R gateSource say-text + title`, bR.gateSource === 'say-text' && bR.titanTitle === 'THE HERALD', bR);
    check(`${tag} R window never live`, bR.everLive === false && bR.sayCalls === 1, bR);

    // CF: campaign floor -> refusal, have/need parsed.
    modeRef.mode = 'campaign-floor';
    G.startCombat('finale');
    const rowCF = smStore.meetings[smStore.meetings.length - 1];
    const bCF = computeRefusal(rowCF.refusalSayProbe, 'finale');
    check(`${tag} CF bracket refusal campaign`, bCF.bracketed && bCF.windowKind === 'refusal' && bCF.gate === 'campaign', bCF);
    check(`${tag} CF have/need parsed 7/10`, bCF.have === 7 && bCF.need === 10, bCF);

    // CN: campaign node -> refusal, gate identified, have/need null.
    modeRef.mode = 'campaign-node';
    G.startCombat('finale');
    const rowCN = smStore.meetings[smStore.meetings.length - 1];
    const bCN = computeRefusal(rowCN.refusalSayProbe, 'finale');
    check(`${tag} CN bracket refusal campaign node`, bCN.bracketed && bCN.gate === 'campaign' && bCN.gateSource === 'say-text', bCN);
    check(`${tag} CN have/need null (n/a)`, bCN.have === null && bCN.need === null, bCN);

    // A: tbEnd inside -> call bracket tbEnd (reused rule), NOT refusal.
    modeRef.mode = 'tbend';
    const retA = G.startCombat('herald');
    const rowA = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} A row ended won (not dissolved)`, rowA.result === 'won', rowA.result);
    const bA = computeRefusal(rowA.refusalSayProbe, 'herald');
    check(`${tag} A bracket call tbEnd`, bA.bracketed && bA.windowKind === 'call' && bA.windowCall === 'tbEnd', bA);
    check(`${tag} A delegation returns fight-null after tbEnd`, retA === null, retA);

    // B: direct null inside tbMonsterTurn, no tbEnd -> subtree bracket.
    modeRef.mode = 'directnull';
    G.startCombat('herald');
    const rowB = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} B row dissolved start-post`, rowB.dissolveCause === 'start-post-gone', rowB.dissolveCause);
    finalizeScholarmeltDiag(G, smStore);
    check(`${tag} B flushed dissolved-no-tbend`, rowB.result === 'dissolved-no-tbend', rowB.result);
    const bB = computeRefusal(rowB.refusalSayProbe, 'herald');
    check(`${tag} B bracket call tbMonsterTurn`, bB.bracketed && bB.windowKind === 'call' && bB.windowCall === 'tbMonsterTurn', bB);
    check(`${tag} B tbEndSeen false`, bB.tbEndSeen === false, bB);
    const transB = rowB.refusalSayProbe.events.find(e => e.stackNames);
    check(`${tag} B transition carries stackNames`, Array.isArray(transB && transB.stackNames), transB);
    check(`${tag} B stackNames carry no paths`, (transB.stackNames || []).every(n => n.indexOf('/') < 0 && n.indexOf('\\') < 0), transB && transB.stackNames);

    // C: null in body gap -> gap bracket.
    modeRef.mode = 'bodygap';
    G.startCombat('herald');
    const rowC = smStore.meetings[smStore.meetings.length - 1];
    const bC = computeRefusal(rowC.refusalSayProbe, 'herald');
    check(`${tag} C bracket gap`, bC.bracketed && bC.windowKind === 'gap' && bC.windowCall === 'gap:identifyMonster->combatWitnessReact', bC);
    check(`${tag} C gap context startCombat-body`, bC.windowContext === 'startCombat-body', bC);

    // D: live fight -> no refusal bracket, identity preserved.
    modeRef.mode = 'live';
    const retD = G.startCombat('herald');
    const rowD = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} D row live (no cause)`, rowD.dissolveCause === null && rowD.result === null, { cause: rowD.dissolveCause, result: rowD.result });
    check(`${tag} D delegation returns same fight object`, retD === G.tbfight && retD !== null, retD === G.tbfight);
    const bD = computeRefusal(rowD.refusalSayProbe, 'herald');
    check(`${tag} D unbracketed no-null-event`, !bD.bracketed && bD.reason === 'no-null-event', bD);
    G.tbEnd('fled');

    // E: engine throw inside window -> rethrown, window closes.
    modeRef.mode = 'throw';
    let caught = null;
    try { G.startCombat('herald'); } catch (e) { caught = e; }
    check(`${tag} E throw rethrown unchanged`, caught && caught.message === 'boom', caught && caught.message);
    const rowE = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} E throw row has probe log`, !!rowE.refusalSayProbe && rowE.refusalSayProbe.events.length > 0, rowE.refusalSayProbe);
    check(`${tag} E throw event recorded`, rowE.refusalSayProbe.events.some(e => e.phase === 'throw'), rowE.refusalSayProbe.events.map(e => e.fn + '/' + e.phase));
    modeRef.mode = 'live';
    G.startCombat('herald');
    const rowE2 = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} E next window attaches fresh log`, !!rowE2.refusalSayProbe && rowE2.refusalSayProbe !== rowE.refusalSayProbe, !!rowE2.refusalSayProbe);
    G.tbEnd('fled');

    // F: buffer cap flags overflow (same Game; tele loop inside window).
    modeRef.mode = 'cap';
    G.startCombat('herald');
    const rowF = smStore.meetings[smStore.meetings.length - 1];
    check(`${tag} F overflow flagged`, rowF.refusalSayProbe.overflow === true, rowF.refusalSayProbe.overflow);
    check(`${tag} F events capped at MAX_EVENTS`, rowF.refusalSayProbe.events.length === MAX_EVENTS, rowF.refusalSayProbe.events.length);
    check(`${tag} F probe store overflow counted`, (probeStore.overflow.windows | 0) >= 1, probeStore.overflow);
    G.tbEnd('fled');

    check(`${tag} probe errs 0 at end`, probeStore.errs === 0, probeStore.errors);
    check(`${tag} probe windows counted`, probeStore.windows >= 9, probeStore.windows);
    check(`${tag} probe attached counted`, probeStore.attached >= 9, probeStore.attached);
  } finally { restore(); }
}

// Nested + orphan: sweep order (probe outside) only — the prereg's
// claimed-set cases. Probe-inside nested is the documented
// limitation (inner row not claimed) and is NOT asserted here.
{
  const restore = stubGodpath();
  try {
    const modeRef = { mode: 'nested' };
    const G = scenarioGame(modeRef);
    const smStore = newSmStore();
    const probeStore = newProbeStore();
    installScholarmeltDiag(G, smStore);
    installRefusalsayDiag(G, probeStore, smStore);
    G.startCombat('herald');
    const rows = smStore.meetings;
    check('NEST outer row has probe log', !!rows[0].refusalSayProbe, rows[0]);
    check('NEST inner row has probe log', !!rows[1].refusalSayProbe, rows[1]);
    check('NEST logs are distinct objects', rows[0].refusalSayProbe !== rows[1].refusalSayProbe, null);
    check('NEST inner log carries muster say', rows[1].refusalSayProbe.events.some(e => e.fn === 'say' && e.argText === MUSTER_TEXT), rows[1].refusalSayProbe.events.map(e => e.fn));
    check('NEST outer log carries no say (not stolen)', !rows[0].refusalSayProbe.events.some(e => e.fn === 'say'), rows[0].refusalSayProbe.events.map(e => e.fn));
    check('NEST inner row is refused kind', rows[1].kind === 'refused', rows[1].kind);
    // The nested inner log is NOT a refusal bracket: the outer fight
    // is live throughout the inner window, so everLive is true and the
    // dissolved-row judge correctly declines (a refusal bracket
    // requires a standalone never-live window). Nested inner rows are
    // kind 'refused', never dissolved rows, so the analyzer never
    // judges them as dissolved — the attach assertions above are the
    // nested guarantee, not the bracket.
    const bInner = computeRefusal(rows[1].refusalSayProbe, 'herald');
    check('NEST inner log not a refusal bracket (live outer fight)', !bInner.bracketed && bInner.everLive === true && bInner.reason === 'no-null-event', bInner);
    check('NEST inner say text still captured', bInner.sayText === MUSTER_TEXT, bInner.sayText);
    G.tbEnd('fled');

    // Orphan: a live fight ended without a recorded start creates an
    // orphan-end row; the NEXT window must not claim it.
    G.tbfight = liveFight();
    G.tbEnd('won');
    const orphan = smStore.meetings[smStore.meetings.length - 1];
    check('ORPHAN row created kind orphan-end', orphan.kind === 'orphan-end' && orphan.result === 'won', { kind: orphan.kind, result: orphan.result });
    modeRef.mode = 'refusal';
    G.startCombat('herald');
    const refRow = smStore.meetings[smStore.meetings.length - 1];
    check('ORPHAN next window refusal row has probe', !!refRow.refusalSayProbe, refRow.refusalSayProbe);
    check('ORPHAN orphan row NOT claimed by next window', orphan.refusalSayProbe == null, orphan.refusalSayProbe);
    check('ORPHAN probe errs 0', probeStore.errs === 0, probeStore.errors);
  } finally { restore(); }
}

// Analyzer synthetic-log tests (no Game needed).
{
  const ev = (fn, phase, state, stack, argText) => {
    const e = { fn, phase, state, callStack: stack || [], turnIdx: 0, round: 1, currentKey: 'p', playerHp: 100, nMonFighting: 1 };
    if (argText !== undefined) e.argText = argText;
    return e;
  };
  const refusalLog = (text) => ({ events: [
    ev('startCombat', 'enter', 'null'), ev('say', 'enter', 'null', [], text),
    ev('say', 'exit', 'null', []), ev('startCombat', 'exit', 'null'),
  ], overflow: false });
  let b = computeRefusal(refusalLog(MUSTER_TEXT), 'herald');
  check('SYN refusal muster 3/10', b.bracketed && b.windowKind === 'refusal' && b.gate === 'muster' && b.have === 3 && b.need === 10 && b.gateSource === 'say-text', b);
  b = computeRefusal(refusalLog(CAMPAIGN_FLOOR_TEXT), 'finale');
  check('SYN refusal campaign floor 7/10', b.bracketed && b.gate === 'campaign' && b.have === 7 && b.need === 10, b);
  b = computeRefusal(refusalLog(CAMPAIGN_NODE_TEXT), 'finale');
  check('SYN refusal campaign node nulls', b.bracketed && b.gate === 'campaign' && b.have === null && b.need === null && b.gateSource === 'say-text', b);
  b = computeRefusal(refusalLog('Something unrecognized happened.'), 'herald');
  check('SYN unknown-say not gate-identified', b.bracketed && b.gate === 'unknown-say' && b.gateSource === 'say-text-unparsed', b);
  // Missing argText -> elimination (herald names muster, other mid unknown).
  b = computeRefusal({ events: [
    ev('startCombat', 'enter', 'null'), ev('say', 'enter', 'null', []),
    ev('say', 'exit', 'null', []), ev('startCombat', 'exit', 'null'),
  ], overflow: false }, 'herald');
  check('SYN missing argText elimination herald', b.bracketed && b.gate === 'muster' && b.gateSource === 'elimination' && b.have === null, b);
  b = computeRefusal({ events: [
    ev('startCombat', 'enter', 'null'), ev('say', 'enter', 'null', []),
    ev('say', 'exit', 'null', []), ev('startCombat', 'exit', 'null'),
  ], overflow: false }, 'wisp');
  check('SYN missing argText elimination unknown mid', b.bracketed && b.gate === 'elimination-unknown' && b.gateSource === 'elimination', b);
  // Multi-say / no-say never-live logs unbracketed with exact reasons.
  b = computeRefusal({ events: [
    ev('startCombat', 'enter', 'null'), ev('say', 'enter', 'null', [], 'One.'),
    ev('say', 'exit', 'null', []), ev('say', 'enter', 'null', [], 'Two.'),
    ev('say', 'exit', 'null', []), ev('startCombat', 'exit', 'null'),
  ], overflow: false }, 'herald');
  check('SYN multi-say unbracketed', !b.bracketed && b.reason === 'never-live-multi-say', b);
  b = computeRefusal({ events: [
    ev('startCombat', 'enter', 'null'), ev('startCombat', 'exit', 'null'),
  ], overflow: false }, 'herald');
  check('SYN no-say unbracketed', !b.bracketed && b.reason === 'never-live-no-say', b);
  // Missing log variants.
  b = computeRefusal(null, 'herald');
  check('SYN missing null', !b.bracketed && b.reason === 'missing-log', b);
  b = computeRefusal({ events: [], overflow: false }, 'herald');
  check('SYN missing empty', !b.bracketed && b.reason === 'missing-log', b);
  // Live-window call bracket still computes via the reused rule.
  b = computeRefusal({ events: [
    ev('startCombat', 'enter', 'null'), ev('tbBeginTurn', 'enter', 'live', ['tbBeginTurn']),
    ev('tbBeginTurn', 'exit', 'live', ['tbBeginTurn']), ev('tbAdvance', 'enter', 'live', ['tbAdvance']),
    ev('tbEnd', 'enter', 'live', ['tbAdvance', 'tbEnd']), ev('tbEnd', 'exit', 'null', ['tbAdvance', 'tbEnd']),
    ev('tbAdvance', 'exit', 'null', ['tbAdvance']), ev('startCombat', 'exit', 'null'),
  ], overflow: false }, 'herald');
  check('SYN live call tbEnd', b.bracketed && b.windowKind === 'call' && b.windowCall === 'tbEnd' && b.tbEndSeen === true, b);
  // Live fight gets no refusal bracket.
  b = computeRefusal({ events: [
    ev('startCombat', 'enter', 'null'), ev('tbBeginTurn', 'enter', 'live', ['tbBeginTurn']),
    ev('startCombat', 'exit', 'live'),
  ], overflow: false }, 'herald');
  check('SYN live no refusal', !b.bracketed && b.reason === 'no-null-event' && b.windowKind === null, b);
  // argText truncation at MAX_ARGTEXT (unit: policy helper).
  const { argTextOf } = require('./policies/refusalsay-diag');
  check('SYN argText truncates to 1000', argTextOf('say', ['x'.repeat(1500)]).length === MAX_ARGTEXT, argTextOf('say', ['x'.repeat(1500)]).length);
  check('SYN argText empty for non-say', argTextOf('tbAdvance', ['hello']) === undefined, argTextOf('tbAdvance', ['hello']));
  check('SYN parseGateSay muster', (() => { const p = parseGateSay(MUSTER_TEXT); return p.gate === 'muster' && p.have === 3 && p.need === 10 && p.titanTitle === 'THE HERALD'; })(), parseGateSay(MUSTER_TEXT));
}

runOrder('probe-out');
runOrder('probe-in');

console.log(`FIXTURES: passed=${passed} failed=${failed}`);
if (failed) { console.log('FIXTURES-FAIL'); process.exit(1); }
console.log('FIXTURES-PASS ' + passed + '/' + (passed + failed));
