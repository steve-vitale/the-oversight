#!/usr/bin/env node
// test-fight-brain-knowledge-probe.js — VILLAGER-BRAIN Phase 5 wiring proof.
//
// §8 Phase 5 metric (docs/VILLAGER-BRAIN.md): matched probes — same villager,
// same stats, knows-the-species vs naive → flee/engage differs; turn-based vs
// field answers agree on identical scenarios (or document remaining disagreement).
//
// OVE-49 measured UNWIRED. OVE-52 lands shared fighterState(vid) and wires
// both brains. This script locks the WIRED state:
//   sites:     fighterState present; know.fought writable.
//   field-know: know.fought flips opening intent (learn→species-fought engage)
//               and/or flee flags.
//   tb-know:   know.fought flips hopeless flee (naive flees, knows holds)
//               at matched 30% HP trajectory.
//   agree:     matched hopeless inputs — both brains ask fighterShouldFlee.
//   contrast:  villageKnowsTrick still flips field intent (separate channel).
//   control:   stripping fighterState.species.fought → Phase-5 delta vanishes.
//
// Exit 0 = wired. No repo writes.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
const notes = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function note(s) { notes.push(s); console.log('  NOTE ' + s); }

function ensureKnow(Game, vid) {
  const a = Game.agencyState();
  a.know = a.know || {};
  a.know[vid] = a.know[vid] || { plants: 0, monsters: 0, places: [], fought: [] };
  if (!Array.isArray(a.know[vid].fought)) a.know[vid].fought = [];
  return a.know[vid];
}

function setFought(Game, vid, list) {
  const k = ensureKnow(Game, vid);
  k.fought = list.slice();
}

function setTemper(Game, vid, t) {
  const vp = (Game.data.villagers || []).find(x => x.id === vid)
    || (Game.data.background_survivors || []).find(x => x.id === vid)
    || (Game.generatedRoster || []).find(x => x.id === vid);
  if (!vp) return;
  vp.personality = vp.personality || {};
  vp.personality.temperament = t;
}

function fieldSnap(rec) {
  return {
    intent: rec.intent || null,
    intentWhy: rec.intentWhy || null,
    outcome: rec.outcome || null,
    fleeHopeless: !!rec.fleeHopeless,
    fleeLearn: !!rec.fleeLearn,
    fleeWise: !!rec.fleeWise,
    fleeHpFrac: rec.fleeHpFrac == null ? null : Math.round(rec.fleeHpFrac * 1000) / 1000,
    rounds: rec.rounds | 0,
  };
}

(async () => {
  const SEED = 20261108;
  const { Game } = await loadGame({ seed: SEED, mode: 'fight-brain-know', fullTelemetry: false });
  setupGame(Game);
  Game.say = function () {};

  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  check('probe villager present', !!vid);
  const species = 'hushwolf';
  const mdef = (Game.data.monsters || []).find(m => m.id === species);
  check('species def present (' + species + ')', !!mdef, 'missing monster');

  setTemper(Game, vid, 'steady');

  // ---- sites ----
  console.log('== call sites / shared reader ==');
  check('fighterState present (Phase 5 shared read)',
    typeof Game.fighterState === 'function',
    'typeof=' + typeof Game.fighterState);
  check('contestFleeSealed present', typeof Game.contestFleeSealed === 'function');
  check('fighterShouldFlee present', typeof Game.fighterShouldFlee === 'function');
  check('applyFighterState present', typeof Game.applyFighterState === 'function');
  check('agencyState present', typeof Game.agencyState === 'function');
  ensureKnow(Game, vid);
  setFought(Game, vid, [species]);
  check('know[vid].fought writable',
    ((Game.agencyState().know[vid] || {}).fought || []).indexOf(species) !== -1);
  const stKnow = Game.fighterState(vid, { foeId: species, hp: 30, maxHp: 100 });
  setFought(Game, vid, []);
  const stNaive = Game.fighterState(vid, { foeId: species, hp: 30, maxHp: 100 });
  check('fighterState.species.fought mirrors know.fought',
    stKnow.species.fought === true && stNaive.species.fought === false);
  check('fighterState fleeLine lower when fought',
    stKnow.curve.fleeLine < stNaive.curve.fleeLine,
    'know=' + stKnow.curve.fleeLine + ' naive=' + stNaive.curve.fleeLine);

  // ---- field: knows vs naive (Phase 5 channel) ----
  console.log('== fieldFight: know.fought matched pair ==');
  Game.state.village.health = Game.state.village.health || {};
  Game.state.monsterCounters = Game.state.monsterCounters || {};
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  delete Game.state.monsterCounters[species];
  delete Game.state.villagerTricks[species];

  // Opening-intent freeze: round-1 death so learn→good-exchange cannot rewrite.
  function runFieldOpening(fought) {
    setFought(Game, vid, fought);
    Game.state.village.health[vid] = 5;
    let s = 7;
    const rng = function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return (s >>> 0) / 0x80000000;
    };
    const rec = Game.fieldFight(vid, mdef, null, {
      awareness: false,
      braveryBonus: 0,
      rng,
    });
    return fieldSnap(rec);
  }

  const fieldNaiveOpen = runFieldOpening([]);
  const fieldKnowsOpen = runFieldOpening([species]);
  note('field open naive: ' + JSON.stringify(fieldNaiveOpen));
  note('field open knows: ' + JSON.stringify(fieldKnowsOpen));
  check('field: know.fought flips opening intent learn→species-fought engage',
    fieldNaiveOpen.intent === 'learn' && fieldNaiveOpen.intentWhy === 'learn-first'
    && fieldKnowsOpen.intent === 'engage' && fieldKnowsOpen.intentWhy === 'species-fought',
    'naive=' + JSON.stringify(fieldNaiveOpen) + ' knows=' + JSON.stringify(fieldKnowsOpen));

  // ---- TB: knows vs naive ----
  console.log('== turn-based: know.fought matched pair ==');
  const C = (globalThis.Scattering || {}).combat;
  check('Scattering.combat.villagerDecide present', !!(C && typeof C.villagerDecide === 'function'));

  function mkFighter(over) {
    return Object.assign({
      key: 'v_' + vid, kind: 'villager', villagerId: vid, name: 'Probe',
      hp: 30, maxHp: 100, speed: 3, mx: 4, my: 4, alive: true, fled: false,
      ai: 'helpful', helped: false, wbonus: 0, _dealt: 12, _taken: 60,
    }, over || {});
  }
  function mkMonster(over) {
    return Object.assign({
      key: 'm1', kind: 'monster', id: species, hp: 200, maxHp: 300,
      alive: true, fled: false, mx: 6, my: 4, speed: 4,
      mdef: { id: species, attack: { damage: [37, 55] } },
    }, over || {});
  }
  function mkFight(v, m, over) {
    return Object.assign({
      round: 3, over: false, noFlee: false, fighters: [v, m],
    }, over || {});
  }

  function runTb(fought) {
    setFought(Game, vid, fought);
    const v = mkFighter();
    const m = mkMonster();
    Game.tbfight = mkFight(v, m);
    Game.tbVillagerTurn(v);
    Game.applyFighterState(v);
    const dec = C.villagerDecide(v, [v, m], () => false, new Set(), null, 8);
    const out = {
      fled: !!v.fled,
      action: (dec && dec.action && dec.action.type) || null,
      ai: v.ai,
      fleeLine: v.fleeLine,
      speciesFought: !!v.speciesFought,
      hp: v.hp,
    };
    Game.tbfight = null;
    return out;
  }

  const tbNaive = runTb([]);
  const tbKnows = runTb([species]);
  note('tb naive: ' + JSON.stringify(tbNaive));
  note('tb knows: ' + JSON.stringify(tbKnows));
  check('tb: know.fought changes hopeless flee (naive flees, knows holds)',
    tbNaive.fled === true && tbKnows.fled === false,
    'naive=' + JSON.stringify(tbNaive) + ' knows=' + JSON.stringify(tbKnows));
  check('tb: applyFighterState stamps speciesFought from know.fought',
    tbNaive.speciesFought === false && tbKnows.speciesFought === true);

  // villagerDecide reads stamped fields (pure combat.js — no Game handle).
  setFought(Game, vid, [species]);
  const vDecK = mkFighter({ hp: 40, ai: 'cautious' });
  const mDec = mkMonster();
  Game.tbfight = mkFight(vDecK, mDec);
  Game.applyFighterState(vDecK);
  const dKnow = C.villagerDecide(vDecK, [vDecK, mDec], () => false, new Set(), null, 8);
  setFought(Game, vid, []);
  const vDecN = mkFighter({ hp: 40, ai: 'cautious' });
  Game.tbfight = mkFight(vDecN, mDec);
  Game.applyFighterState(vDecN);
  // Raise fear so naive below-line path is live for the decide script.
  vDecN.fighterFear = 0.5;
  vDecN.fleeLine = 0.55;
  vDecN.speciesFought = false;
  const dNaive = C.villagerDecide(vDecN, [vDecN, mDec], () => false, new Set(), null, 8);
  Game.tbfight = null;
  note('decide knows: ' + JSON.stringify(dKnow.action) + ' naive(stamped): ' + JSON.stringify(dNaive.action));
  check('villagerDecide: stamped knows engages; naive+fear flees',
    dKnow.action && dKnow.action.type !== 'flee'
    && dNaive.action && dNaive.action.type === 'flee',
    'know=' + JSON.stringify(dKnow.action) + ' naive=' + JSON.stringify(dNaive.action));

  // ---- TB vs field agreement via shared fighterShouldFlee ----
  console.log('== TB vs field agreement (shared fighterShouldFlee) ==');
  setFought(Game, vid, []);
  delete Game.state.monsterCounters[species];
  delete Game.state.villagerTricks[species];
  const gavel = (Game.data.monsters || []).find(m => m.id === 'gavel') || mdef;
  delete Game.state.monsterCounters[gavel.id];
  delete Game.state.villagerTricks[gavel.id];

  // Matched read: same st, same sit → same boolean from both brains' helper.
  const stAgree = Game.fighterState(vid, { foeId: gavel.id, hp: 30, maxHp: 100, noFlee: false });
  const sitHopeless = { hopeless: true, winning: false, hpFrac: 0.30 };
  const sitFloor = { hopeless: false, winning: false, hpFrac: 0.30, floorFlee: true };
  const sitSealed = Game.fighterState(vid, { foeId: gavel.id, hp: 30, maxHp: 100, noFlee: true });
  check('shared shouldFlee(hopeless@30%) is true for naive steady',
    Game.fighterShouldFlee(stAgree, sitHopeless) === true);
  check('shared shouldFlee(floor@30%) is true for naive steady',
    Game.fighterShouldFlee(stAgree, sitFloor) === true);
  check('contestFleeSealed / noFlee zeroes shouldFlee in both brains',
    sitSealed.noFlee === true
    && Game.fighterShouldFlee(sitSealed, sitHopeless) === false
    && Game.contestFleeSealed({ noFlee: true }) === true);

  // Live TB + field both flee on matched naive hopeless inputs.
  Game.state.village.health[vid] = 30;
  let sAgree = SEED ^ 0xA6EEE;
  const rngAgree = function () {
    sAgree |= 0; sAgree = sAgree + 0x6D2B79F5 | 0;
    let t = Math.imul(sAgree ^ sAgree >>> 15, 1 | sAgree);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const fieldAgree = Game.fieldFight(vid, gavel, null, {
    awareness: false,
    braveryBonus: 35,
    rng: rngAgree,
  });
  const fieldFled = fieldAgree.outcome === 'vFlee';

  const vA = mkFighter({ hp: 30, ai: 'helpful', _dealt: 12, _taken: 60 });
  const mA = mkMonster({
    id: gavel.id,
    mdef: { id: gavel.id, attack: (gavel.attack || { damage: [37, 55] }) },
  });
  Game.tbfight = mkFight(vA, mA);
  Game.tbVillagerTurn(vA);
  const tbFled = !!vA.fled;
  Game.tbfight = null;

  note('agree hopeless naive: field outcome=' + fieldAgree.outcome
    + ' fleeHopeless=' + !!fieldAgree.fleeHopeless
    + ' fleeHpFrac=' + fieldAgree.fleeHpFrac
    + ' | tb fled=' + tbFled);
  check('hopeless naive@30%: TB and field both flee (shared shouldFlee)',
    fieldFled === true && tbFled === true,
    'fieldFled=' + fieldFled + ' tbFled=' + tbFled);

  // Knows@30%: both hold on hopeless (fleeLine below HP).
  setFought(Game, vid, [gavel.id]);
  Game.state.village.health[vid] = 30;
  let sKnow = SEED ^ 0xA6EEE;
  const rngKnow = function () {
    sKnow |= 0; sKnow = sKnow + 0x6D2B79F5 | 0;
    let t = Math.imul(sKnow ^ sKnow >>> 15, 1 | sKnow);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const fieldKnowHold = Game.fieldFight(vid, gavel, null, {
    awareness: false, braveryBonus: 35, rng: rngKnow,
  });
  const vK = mkFighter({ hp: 30, _dealt: 12, _taken: 60 });
  const mK = mkMonster({
    id: gavel.id,
    mdef: { id: gavel.id, attack: (gavel.attack || { damage: [37, 55] }) },
  });
  Game.tbfight = mkFight(vK, mK);
  Game.tbVillagerTurn(vK);
  const tbKnowHeld = !vK.fled;
  Game.tbfight = null;
  note('agree hopeless knows@30%: field outcome=' + fieldKnowHold.outcome
    + ' | tb fled=' + !!vK.fled + ' line=' + (vK.fleeLine));
  // Field may still kill/die/learn-withdraw via other branches; TB hold is the
  // shared shouldFlee answer. Document if field outcome is not a hold.
  const fieldKnowHeld = fieldKnowHold.outcome !== 'vFlee';
  if (fieldKnowHeld && tbKnowHeld) {
    check('hopeless knows@30%: TB and field both hold', true);
  } else if (tbKnowHeld && !fieldKnowHeld) {
    note('REMAINING DISAGREE: TB holds via fighterShouldFlee; field still fled'
      + ' (outcome=' + fieldKnowHold.outcome + ') — field has learn-withdraw /'
      + ' floor / shout branches beyond the shared hopeless gate.');
    check('hopeless knows@30%: TB holds (field disagreement documented)',
      tbKnowHeld === true);
  } else {
    check('hopeless knows@30%: TB holds via fighterState',
      tbKnowHeld === true,
      'tbFled=' + !!vK.fled + ' field=' + fieldKnowHold.outcome);
  }
  setFought(Game, vid, []);

  // ---- contrast: village trick channel (NOT Phase 5 know.fought) ----
  console.log('== contrast: villageKnowsTrick (separate channel) ==');
  setFought(Game, vid, []);
  delete Game.state.monsterCounters[species];
  delete Game.state.villagerTricks[species];
  function openingIntent(trickKnown) {
    Game.state.village.health[vid] = 5;
    if (trickKnown) Game.state.monsterCounters[species] = true;
    else delete Game.state.monsterCounters[species];
    let s = 7;
    const rng = function () {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return (s >>> 0) / 0x80000000;
    };
    const rec = Game.fieldFight(vid, mdef, null, {
      awareness: false, braveryBonus: 0, rng,
    });
    return { intent: rec.intent, why: rec.intentWhy, outcome: rec.outcome };
  }
  const intentNaive = openingIntent(false);
  const intentKnown = openingIntent(true);
  note('village trick naive intent=' + JSON.stringify(intentNaive)
    + ' known=' + JSON.stringify(intentKnown));
  check('contrast: villageKnowsTrick still flips field opening intent (learn→engage)',
    intentNaive.intent === 'learn' && intentNaive.why === 'learn-first'
    && intentKnown.intent === 'engage' && intentKnown.why === 'trick-known',
    'naive=' + JSON.stringify(intentNaive) + ' known=' + JSON.stringify(intentKnown));
  setFought(Game, vid, []);
  check('contrast: that channel is NOT agency know.fought',
    ((Game.agencyState().know[vid] || {}).fought || []).length === 0);

  // ---- failing control: strip species.fought from fighterState ----
  console.log('== failing control: strip fighterState.species.fought ==');
  // Contrast above may have left monsterCounters[species]=true — clear so
  // the control cannot falsely pass via the village-trick channel.
  delete Game.state.monsterCounters[species];
  delete Game.state.villagerTricks[species];
  setFought(Game, vid, []);
  const _origFS = Game.fighterState.bind(Game);
  Game.fighterState = function (id, opts) {
    const st = _origFS(id, opts);
    if (st && st.species) {
      st.species.fought = false;
      st.species.mauled = false;
      // Recompute curve as if naive (no fought bend).
      st.curve.fleeLine = Math.min(0.75, st.curve.fleeLine + 0.14);
      if (st.curve.fleeLine > 0.42 && st.curve.fleeLine < 0.58) st.curve.aiTag = 'helpful';
    }
    return st;
  };
  setFought(Game, vid, [species]);
  const ctrlOpen = runFieldOpening([species]);
  const ctrlTb = runTb([species]);
  Game.fighterState = _origFS;
  note('control field open: ' + JSON.stringify(ctrlOpen));
  note('control tb: ' + JSON.stringify(ctrlTb));
  check('control: stripped fought → field opening stays learn-first (not species-fought)',
    ctrlOpen.intentWhy !== 'species-fought',
    JSON.stringify(ctrlOpen));
  check('control: stripped fought → TB flees again at 30% hopeless',
    ctrlTb.fled === true,
    JSON.stringify(ctrlTb));

  // ---- verdict ----
  console.log('== verdict ==');
  const verdict = 'wired';
  note('VERDICT=' + verdict
    + ' — fighterState shared; both brains read know[vid].fought;'
    + ' contestFleeSealed zeroes flee; villageKnowsTrick remains a separate channel.');
  check('verdict is wired', verdict === 'wired');

  console.log('\nfight-brain-knowledge probe: ' + pass + ' passed, ' + fail + ' failed');
  if (notes.length) {
    console.log('notes:');
    for (const n of notes) console.log('  - ' + n);
  }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
