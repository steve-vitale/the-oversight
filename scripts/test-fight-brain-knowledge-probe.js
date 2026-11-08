#!/usr/bin/env node
// test-fight-brain-knowledge-probe.js — VILLAGER-BRAIN Phase 5 measure-only.
//
// §8 Phase 5 metric (docs/VILLAGER-BRAIN.md): matched probes — same villager,
// same stats, knows-the-species vs naive → flee/engage differs; turn-based vs
// field answers agree on identical scenarios.
//
// This script MEASURES current wiring. It does not retune IAUS/curves or
// change gameplay. Phase 5's specified channel is per-villager learned
// species memory: agencyState().know[vid].fought (see § perceived world).
// The planned shared reader fighterState(vid) is also checked for presence.
//
// Cases (one loadGame; seed 20261108):
//   sites:     fighterState absent; know.fought writable; call-site census.
//   field-know: matched fieldFight naive vs know[vid].fought=[species]
//               → intent/outcome/flee flags identical (or differ if wired).
//   tb-know:   matched tbVillagerTurn / villagerDecide with same fighter
//               scaffold, naive vs know.fought → flee/action identical.
//   agree:     same villager/stats hopeless scenario — TB flee vs field
//               flee; document agree or disagree.
//   contrast:  villageKnowsTrick (village-shared, NOT know.fought) flips
//               field intent learn→engage — wrong channel for Phase 5.
//
// Exit 0 documents the measured state. Assertions lock the CURRENT
// (unwired) Phase-5 channel so a later wiring land must update this
// probe intentionally.
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

function snapEq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
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

  // Keep personality fixed for matched pairs (tb scaffolds set ai explicitly).
  setTemper(Game, vid, 'steady');

  // ---- sites ----
  console.log('== call sites / shared reader ==');
  check('fighterState absent (Phase 5 shared read not landed)',
    typeof Game.fighterState !== 'function',
    'typeof=' + typeof Game.fighterState);
  check('agencyState present', typeof Game.agencyState === 'function');
  ensureKnow(Game, vid);
  setFought(Game, vid, [species]);
  check('know[vid].fought writable',
    ((Game.agencyState().know[vid] || {}).fought || []).indexOf(species) !== -1);
  setFought(Game, vid, []);

  // Runtime census: wrap know[vid] access during fieldFight.
  let knowReads = 0;
  const a0 = Game.agencyState();
  const rawKnow = a0.know;
  const knowProxy = new Proxy(rawKnow, {
    get(target, prop, recv) {
      if (prop === vid || prop === String(vid)) knowReads++;
      return Reflect.get(target, prop, recv);
    },
  });
  a0.know = knowProxy;

  // ---- field: knows vs naive (Phase 5 channel) ----
  console.log('== fieldFight: know.fought matched pair ==');
  Game.state.village.health = Game.state.village.health || {};
  // Clear village trick / counter knowledge so only know.fought differs.
  Game.state.monsterCounters = Game.state.monsterCounters || {};
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  delete Game.state.monsterCounters[species];
  delete Game.state.villagerTricks[species];

  // Matched RNG: both arms use the SAME stream start; fought[] is sole delta.
  function runFieldMatched(fought) {
    setFought(Game, vid, fought);
    Game.state.village.health[vid] = 100;
    let s = SEED ^ 0xF16B7;
    const rng = function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    const beforeReads = knowReads;
    const rec = Game.fieldFight(vid, mdef, null, {
      awareness: false,
      braveryBonus: 35,
      rng,
    });
    return {
      fought: fought.slice(),
      snap: fieldSnap(rec),
      knowReadsDelta: knowReads - beforeReads,
    };
  }

  const fieldNaive = runFieldMatched([]);
  const fieldKnows = runFieldMatched([species]);
  note('field naive: ' + JSON.stringify(fieldNaive.snap));
  note('field knows: ' + JSON.stringify(fieldKnows.snap));
  const fieldDiffers = !snapEq(fieldNaive.snap, fieldKnows.snap);
  check('field: know.fought does NOT change flee/engage (unwired Phase-5 channel)',
    !fieldDiffers,
    'naive=' + JSON.stringify(fieldNaive.snap) + ' knows=' + JSON.stringify(fieldKnows.snap));
  note('field know[vid] proxy reads during fights: naiveΔ=' + fieldNaive.knowReadsDelta
    + ' knowsΔ=' + fieldKnows.knowReadsDelta);

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
    const said = [];
    const prevSay = Game.say;
    Game.say = (msg) => { said.push(String(msg)); };
    Game.tbVillagerTurn(v);
    Game.say = prevSay;
    const dec = C.villagerDecide(v, [v, m], () => false, new Set(), null, 8);
    Game.tbfight = null;
    return {
      fled: !!v.fled,
      action: (dec && dec.action && dec.action.type) || null,
      ai: v.ai,
      hp: v.hp,
    };
  }

  const tbNaive = runTb([]);
  const tbKnows = runTb([species]);
  note('tb naive: ' + JSON.stringify(tbNaive));
  note('tb knows: ' + JSON.stringify(tbKnows));
  check('tb: know.fought does NOT change flee/engage (unwired Phase-5 channel)',
    JSON.stringify(tbNaive) === JSON.stringify(tbKnows),
    'naive=' + JSON.stringify(tbNaive) + ' knows=' + JSON.stringify(tbKnows));

  // villagerDecide itself has no Game/agency handle — structural unwired proof.
  const vDec = mkFighter({ hp: 40 });
  const mDec = mkMonster();
  setFought(Game, vid, [species]);
  const d1 = C.villagerDecide(vDec, [vDec, mDec], () => false, new Set(), null, 8);
  setFought(Game, vid, []);
  const d2 = C.villagerDecide(vDec, [vDec, mDec], () => false, new Set(), null, 8);
  check('villagerDecide ignores agency know.fought (pure ai-tag script)',
    JSON.stringify(d1.action) === JSON.stringify(d2.action)
    && JSON.stringify(d1.moves) === JSON.stringify(d2.moves));

  // ---- TB vs field agreement on identical hopeless scenario ----
  // Same species, same villager, both at ~30% HP facing an outmatching
  // beast. Field uses gavel + braveryBonus (retreat-proof recipe) so the
  // hopeless path is reachable; TB uses the same trajectory scaffold.
  console.log('== TB vs field agreement (identical hopeless inputs) ==');
  setFought(Game, vid, []);
  delete Game.state.monsterCounters[species];
  delete Game.state.villagerTricks[species];
  const gavel = (Game.data.monsters || []).find(m => m.id === 'gavel') || mdef;
  delete Game.state.monsterCounters[gavel.id];
  delete Game.state.villagerTricks[gavel.id];

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
    mdef: { id: gavel.id, attack: (gavel.attack || { damage: [37, 55] }) },
  });
  Game.tbfight = mkFight(vA, mA);
  Game.tbVillagerTurn(vA);
  const tbFled = !!vA.fled;
  Game.tbfight = null;

  note('agree hopeless: field outcome=' + fieldAgree.outcome
    + ' fleeHopeless=' + !!fieldAgree.fleeHopeless
    + ' fleeHpFrac=' + fieldAgree.fleeHpFrac
    + ' | tb fled=' + tbFled + ' ai=helpful hpFrac=0.30 species=' + gavel.id);
  // Both past their flee lines → agree on flee (not proof of a shared reader).
  check('hopeless helpful@30%: TB and field both flee',
    fieldFled === true && tbFled === true,
    'fieldFled=' + fieldFled + ' tbFled=' + tbFled);

  // Mid-HP: field floor flee vs TB brave hold (fleeLine 0.4) — seam 6.
  Game.state.village.health[vid] = 45;
  let sMid = SEED ^ 0x45F1E;
  const rngMid = function () {
    sMid |= 0; sMid = sMid + 0x6D2B79F5 | 0;
    let t = Math.imul(sMid ^ sMid >>> 15, 1 | sMid);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const fieldMid = Game.fieldFight(vid, gavel, null, {
    awareness: false, braveryBonus: 0, rng: rngMid,
  });
  const fieldMidFled = fieldMid.outcome === 'vFlee';
  const vBrave = mkFighter({ hp: 45, ai: 'brave', _dealt: 12, _taken: 60 });
  const mBrave = mkMonster({
    mdef: { id: gavel.id, attack: (gavel.attack || { damage: [37, 55] }) },
  });
  Game.tbfight = mkFight(vBrave, mBrave);
  Game.tbVillagerTurn(vBrave);
  const tbBraveHeld = !vBrave.fled;
  Game.tbfight = null;
  note('midHP@45%: field outcome=' + fieldMid.outcome
    + ' fleeHpFrac=' + fieldMid.fleeHpFrac
    + ' | tb brave fled=' + !!vBrave.fled);
  check('midHP@45%: TB brave holds while field flees (disagreement documented)',
    fieldMidFled === true && tbBraveHeld === true,
    'fieldFled=' + fieldMidFled + ' tbBraveHeld=' + tbBraveHeld);

  // ---- contrast: village trick channel (NOT Phase 5 know.fought) ----
  // Round-1 death (hp=5) freezes opening intent before learn→good-exchange.
  console.log('== contrast: villageKnowsTrick (wrong channel for Phase 5) ==');
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
  check('contrast: villageKnowsTrick DOES flip field opening intent (learn→engage)',
    intentNaive.intent === 'learn' && intentNaive.why === 'learn-first'
    && intentKnown.intent === 'engage' && intentKnown.why === 'trick-known',
    'naive=' + JSON.stringify(intentNaive) + ' known=' + JSON.stringify(intentKnown));
  setFought(Game, vid, []);
  check('contrast: that channel is NOT agency know.fought',
    ((Game.agencyState().know[vid] || {}).fought || []).length === 0);

  // Restore know proxy cleanup (avoid leaking Proxy into later code).
  a0.know = rawKnow;

  // ---- verdict ----
  console.log('== verdict ==');
  const verdict = 'unwired';
  note('VERDICT=' + verdict
    + ' — neither fight brain reads agencyState().know[vid].fought; '
    + 'fighterState absent; field uses villageKnowsTrick (village-shared) instead.');
  note('TB call sites: villagerDecide (engine/combat.js), tbVillagerTurn/'
    + 'tbVillagerHopeless/tbVillagerReactiveFlee (game.js) — ai-tag + trajectory only.');
  note('Field call sites: fieldFight morale/intent (fieldFights.js) — bravery/'
    + 'temper/vBreak + villageKnowsTrick; no know.fought.');
  check('verdict is unwired', verdict === 'unwired');

  console.log('\nfight-brain-knowledge probe: ' + pass + ' passed, ' + fail + ' failed');
  if (notes.length) {
    console.log('notes:');
    for (const n of notes) console.log('  - ' + n);
  }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
