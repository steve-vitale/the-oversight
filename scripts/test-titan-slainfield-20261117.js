#!/usr/bin/env node
// test-titan-slainfield-20261117.js — proof for the journey-deepening r232
// slain-field fix (Q1).
//
// THE DEFECT (r227): a villager field-kill of the Herald removes the world
// monster without setting state.titans.slain — the omen sits at stage 2
// and the muster keeps charging upkeep for a corpse (102506 d98: villagers
// killed the Herald in the field; slain unset, muster charging through
// d101).
//
// THE FIX (src/js/titans.js): titanReconcileFieldSlain, called from
// titanDawnTick after the omen advance and BEFORE titanMusterUpkeep, so no
// upkeep is billed on the day the titan is already dead. For every
// located, unslain titan whose monster is absent from the world AND whose
// death is recorded (telemetry death who=monster id, OR
// state.villageSlain[monster] >= 1 — both engine kill records from the
// same vKill branch; the OR covers the 300-entry telemetry cap): mark
// slain, say it aloud (naming the killer when the corpse names one),
// release the committed, clear the muster, ledger 'slew:', record the
// moment, record the outcome 'slain-field' — distinctly from the
// muster-fight 'slain'. No relic, no viewership bump, no System
// broadcast: those are muster-fight spectacle beats.
//
// RED (before): the fixture below leaves slain unset and the muster
// standing after the dawn tick; the upkeep check keeps billing.
// GREEN (after): slain set, 'slain-field' outcome, muster cleared,
// committed released, said aloud with the killer's name, upkeep stops.
//
// The fixture reproduces the vKill branch's three engine effects with the
// engine's own calls (recordWaveKill + registerDeath + removeWorldMonster)
// — the same calls game.js makes when a villager kills a monster in the
// field. It does NOT stage a live field fight: the fight engine is not
// under test here, the dawn reconciliation is.
//
// Usage: node scripts/test-titan-slainfield-20261117.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 103301, mode: 'slainfield-proof' });
  await setupGame(Game);

  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const sysSaid = [];
  const osys = Game.sysSay;
  Game.sysSay = function (t) { try { sysSaid.push(String(t)); } catch (e) {} if (osys) return osys.call(this, t); };
  const ledger = [];
  Game.ledgerAdd = function (k, v) { ledger.push(k + ':' + v); };
  const moments = [];
  Game.recordMoment = function (t) { try { moments.push(String(t)); } catch (e) {} };

  // ---- shared fixture: one answering ally, one located titan ----
  Game.state.otherVillages = [
    { id: 'ashford', name: 'Ashford', opinion: 30, roster: [
      { id: 'ash_speaker', name: 'Mara Voss', alive: true },
      { id: 'ash_fighter', name: 'Tomm Rill', alive: true },
    ]},
  ];
  const linkAsh = { primary: 'haven', subordinate: 'ashford', status: 'active', trust: 60,
    theirSpeaker: { id: 'ash_speaker', name: 'Mara Voss' }, arrears: 0 };
  Game.mshipState = () => ({ links: [linkAsh] });
  Game.state.scholar.day = 100;

  const st = Game._titanTest.titanState();
  function resetTitanState() {
    st.omens = {};
    st.slain = {};
    st.musters = {};
    st.outcomes = [];
    st.pendingCommit = null;
    Game.state.villageSlain = {};
    Game.state.telemetry = [];
    try { Game.state.corpses = []; } catch (e) {}
    try {
      (Game.worldMonsters() || []).slice().forEach(function (m) { Game.removeWorldMonster(m); });
    } catch (e) {}
    said.length = 0;
    sysSaid.length = 0;
    ledger.length = 0;
    moments.length = 0;
  }
  function placeLocatedHerald() {
    // Located yesterday (day 99): escalation's 5-day strike cannot fire
    // on day 100, so the dawn tick stays deterministic.
    st.omens.herald = { stage: 2, day: 99, warned: {} };
    Game.spawnWorldMonster('herald', 7, 4, { titan: true });
  }
  function buildMuster() {
    Game.titanWarCouncil('herald');
    const muster0 = Game.soundTitanCall('herald');
    Game.titanCommitOwn('herald'); // first tap: names volunteers, states cost
    Game.titanCommitOwn('herald'); // second tap: they march
    return muster0;
  }
  function havenKiller() {
    const committed = Object.keys((Game.state.village || {}).titanCommitted || {});
    const roster = ((Game.state.village || {}).roster || []).map(function (v) { return v.id || v; });
    for (var i = 0; i < roster.length; i++) {
      if (committed.indexOf(roster[i]) < 0) return roster[i];
    }
    return roster.length ? roster[0] : null;
  }
  // The vKill branch's three engine effects, with the engine's own calls.
  function fieldKillHerald(killerVid) {
    try { Game.recordWaveKill('herald', killerVid, 'wild', null); } catch (e) {}
    try {
      Game.registerDeath({
        kind: 'monster', monsterId: 'herald', monsterName: 'The Herald',
        name: 'The Herald', node: { x: 7, y: 4 }, mx: 4, my: 4,
        cause: 'villager combat', killerId: killerVid, witnesses: [killerVid],
      });
    } catch (e) {}
    try {
      const wm = (Game.worldMonsters() || []).find(function (m) { return m.id === 'herald'; });
      if (wm) Game.removeWorldMonster(wm);
    } catch (e) {}
  }
  function slainFieldOutcomes() {
    return (st.outcomes || []).filter(function (o) { return o && o.titan === 'herald' && o.outcome === 'slain-field'; });
  }

  // ---- 1. field-kill fixture reconciles at the next dawn ----
  resetTitanState();
  placeLocatedHerald();
  const muster1 = buildMuster();
  check('1a muster stands before the kill', !!muster1 && !!st.musters.herald &&
    (st.musters.herald.haven || []).length >= 1,
    'muster=' + JSON.stringify(st.musters.herald && st.musters.herald.haven));
  const killer1 = havenKiller();
  check('1b fixture has a Haven killer outside the committed', !!killer1,
    'killer=' + killer1);
  const killerName1 = killer1 ? String(Game.displayName(killer1)).split(' ')[0] : null;
  const viewershipBefore = Game.state.viewership || 0;
  const relicsBefore = ((Game.state.scholar || {}).inventory || []).filter(function (i) { return i && i.titanRelic; }).length;
  fieldKillHerald(killer1);
  check('1c kill records exist before dawn (villageSlain + death tele + corpse)',
    (Game.state.villageSlain.herald || 0) >= 1 &&
    (Game.state.telemetry || []).some(function (r) { return r && r.type === 'death' && r.who === 'herald'; }) &&
    (Game.corpses() || []).some(function (c) { return c && c.monsterId === 'herald' && c.killerId === killer1; }),
    'villageSlain=' + JSON.stringify(Game.state.villageSlain));
  check('1d monster absent before dawn', !(Game.worldMonsters() || []).some(function (m) { return m.id === 'herald'; }));
  said.length = 0; sysSaid.length = 0; ledger.length = 0; moments.length = 0;
  Game.titanDawnTick();
  check('1e slain set at dawn', st.slain.herald === true, 'slain=' + JSON.stringify(st.slain));
  check("1f outcome 'slain-field' recorded (distinct from muster-fight 'slain')",
    slainFieldOutcomes().length === 1, JSON.stringify(st.outcomes));
  check('1g muster cleared', st.musters.herald === null || st.musters.herald === undefined);
  check("1h haven's committed are released (workforce returns)",
    Object.keys((Game.state.village || {}).titanCommitted || {}).length === 0);
  check('1i said aloud, naming the killer', killerName1 &&
    said.some(function (t) { return t.indexOf(killerName1) >= 0 && /brought/.test(t) && /down/.test(t); }),
    said.join(' | ').slice(0, 300));
  check("1j ledger records the slay ('slew:')", ledger.indexOf('titan:slew:herald') >= 0,
    ledger.join(','));
  check('1k moment recorded as a field slaying', moments.some(function (t) { return /slain in the field/.test(t); }),
    moments.join(' | '));
  check('1l no relic from a field kill (spectacle beats stay muster-fight)',
    ((Game.state.scholar || {}).inventory || []).filter(function (i) { return i && i.titanRelic; }).length === relicsBefore);
  check('1m no viewership bump from a field kill', (Game.state.viewership || 0) === viewershipBefore,
    'viewership ' + viewershipBefore + ' -> ' + (Game.state.viewership || 0));
  check('1n no System broadcast for a field kill', sysSaid.length === 0, sysSaid.join(' | ').slice(0, 200));
  said.length = 0;
  Game._titanTest.titanMusterUpkeep(Game.state.scholar.day);
  check('1o upkeep stops: no hunger line after reconciliation',
    !said.some(function (t) { return /muster is hungry/i.test(t); }),
    said.join(' | ').slice(0, 200));

  // ---- 2. living titan -> no-op ----
  resetTitanState();
  placeLocatedHerald();
  buildMuster();
  said.length = 0; ledger.length = 0; moments.length = 0;
  Game.titanDawnTick();
  check('2a living titan: slain stays unset', !st.slain.herald, 'slain=' + JSON.stringify(st.slain));
  check('2b living titan: muster still stands', !!st.musters.herald);
  check('2c living titan: no slain-field outcome', slainFieldOutcomes().length === 0,
    JSON.stringify(st.outcomes));
  check('2d living titan: no field-kill line said', !said.some(function (t) { return /Word comes back from the field/.test(t); }),
    said.join(' | ').slice(0, 200));

  // ---- 3. absent WITHOUT a kill record -> no-op (despawn, not a death) ----
  resetTitanState();
  placeLocatedHerald();
  buildMuster();
  try {
    const wm = (Game.worldMonsters() || []).find(function (m) { return m.id === 'herald'; });
    if (wm) Game.removeWorldMonster(wm);
  } catch (e) {}
  said.length = 0; ledger.length = 0; moments.length = 0;
  Game.titanDawnTick();
  check('3a absent without kill record: slain stays unset', !st.slain.herald);
  check('3b absent without kill record: muster still stands', !!st.musters.herald);
  check('3c absent without kill record: no slain-field outcome', slainFieldOutcomes().length === 0);

  // ---- 4. already slain (muster-fight path) -> no duplicate ----
  resetTitanState();
  placeLocatedHerald();
  buildMuster();
  const killer4 = havenKiller();
  fieldKillHerald(killer4);
  st.slain.herald = true; // titanVictory already set it
  st.musters.herald = null;
  said.length = 0; ledger.length = 0; moments.length = 0;
  Game.titanDawnTick();
  check('4a already slain: no slain-field outcome added', slainFieldOutcomes().length === 0,
    JSON.stringify(st.outcomes));
  check('4b already slain: no second field line', !said.some(function (t) { return /Word comes back from the field/.test(t); }),
    said.join(' | ').slice(0, 200));
  check('4c already slain: no second ledger slew', ledger.indexOf('titan:slew:herald') < 0,
    ledger.join(','));

  // ---- 5. the muster-fight slay path is unchanged ----
  resetTitanState();
  placeLocatedHerald();
  buildMuster();
  const killer5 = havenKiller();
  fieldKillHerald(killer5); // the fight engine records the kill too
  const def5 = Game.titanDef('herald');
  const viewership5 = Game.state.viewership || 0;
  said.length = 0; sysSaid.length = 0; ledger.length = 0; moments.length = 0;
  Game._titanTest.titanVictory('herald', def5);
  check('5a titanVictory still sets slain + clears the muster', st.slain.herald === true &&
    (st.musters.herald === null || st.musters.herald === undefined));
  check('5b titanVictory still broadcasts (System spectacle beat)', sysSaid.length >= 1 &&
    sysSaid.some(function (t) { return /SLAIN/.test(t); }), sysSaid.join(' | ').slice(0, 200));
  check('5c titanVictory still bumps viewership +10', (Game.state.viewership || 0) === viewership5 + 10,
    'viewership ' + viewership5 + ' -> ' + (Game.state.viewership || 0));
  check("5d titanVictory still ledgers 'slew:'", ledger.indexOf('titan:slew:herald') >= 0,
    ledger.join(','));
  said.length = 0; sysSaid.length = 0; ledger.length = 0; moments.length = 0;
  Game.titanDawnTick();
  check('5e dawn after a muster-fight slay adds no slain-field outcome', slainFieldOutcomes().length === 0,
    JSON.stringify(st.outcomes));
  check('5f dawn after a muster-fight slay says no field line', !said.some(function (t) { return /Word comes back from the field/.test(t); }),
    said.join(' | ').slice(0, 200));

  // ---- 6. telemetry-only signal reconciles (villageSlain absent) ----
  resetTitanState();
  placeLocatedHerald();
  buildMuster();
  try {
    const wm = (Game.worldMonsters() || []).find(function (m) { return m.id === 'herald'; });
    if (wm) Game.removeWorldMonster(wm);
  } catch (e) {}
  Game.tele('death', { kind: 'monster', who: 'herald', cause: 'villager combat', wave: 4 });
  said.length = 0; ledger.length = 0;
  Game.titanDawnTick();
  check('6a telemetry-only kill record reconciles', st.slain.herald === true &&
    slainFieldOutcomes().length === 1 && (st.musters.herald === null || st.musters.herald === undefined),
    'slain=' + JSON.stringify(st.slain) + ' outcomes=' + JSON.stringify(st.outcomes));

  // ---- 7. villageSlain-only signal reconciles (telemetry row rolled off) ----
  resetTitanState();
  placeLocatedHerald();
  buildMuster();
  try {
    const wm = (Game.worldMonsters() || []).find(function (m) { return m.id === 'herald'; });
    if (wm) Game.removeWorldMonster(wm);
  } catch (e) {}
  Game.state.villageSlain = { herald: 1 };
  said.length = 0; ledger.length = 0;
  Game.titanDawnTick();
  check('7a villageSlain-only kill record reconciles', st.slain.herald === true &&
    slainFieldOutcomes().length === 1 && (st.musters.herald === null || st.musters.herald === undefined),
    'slain=' + JSON.stringify(st.slain) + ' outcomes=' + JSON.stringify(st.outcomes));

  // ---- 8. stage < 2 (never located) -> no-op ----
  resetTitanState();
  st.omens.herald = { stage: 1, day: 99, warned: {} };
  Game.spawnWorldMonster('herald', 7, 4, { titan: true });
  buildMuster();
  const killer8 = havenKiller();
  fieldKillHerald(killer8);
  said.length = 0; ledger.length = 0;
  Game.titanDawnTick();
  check('8a unlocated titan: slain stays unset', !st.slain.herald);
  check('8b unlocated titan: no slain-field outcome', slainFieldOutcomes().length === 0);

  // ---- 9. corpse gone by dawn -> unnamed line still reconciles ----
  resetTitanState();
  placeLocatedHerald();
  buildMuster();
  const killer9 = havenKiller();
  fieldKillHerald(killer9);
  try { Game.state.corpses = []; } catch (e) {}
  said.length = 0; ledger.length = 0; moments.length = 0;
  Game.titanDawnTick();
  check('9a corpse gone: still reconciles', st.slain.herald === true &&
    slainFieldOutcomes().length === 1 && (st.musters.herald === null || st.musters.herald === undefined));
  check('9b corpse gone: unnamed line said (no killer to name)', said.some(function (t) { return /Word comes back from the field/.test(t) && /whoever was standing there/.test(t); }),
    said.join(' | ').slice(0, 300));

  console.log('r232 slain-field proof: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(function (e) { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
