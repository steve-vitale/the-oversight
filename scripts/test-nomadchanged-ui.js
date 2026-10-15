#!/usr/bin/env node
// Proof test: The Long Way Home — 'changed' reunion choice UI (2026-10-15).
// The road default used to silently walk on; now a 'changed' reunion holds
// three real choices open (ask / leave / fight). Spec: docs/WORLD-REGIONS.md §6.
//
// (a) 'changed' reunion presents exactly the three choices.
// (b) ASK yields a coherent answer scene.
// (c) LEAVE matches the old default narration (walk on).
// (d) FIGHT is a real blow-by-blow duel (never a flat roll); win
//     (kin run down, forced home) and lose (bearer backs down, bloodied)
//     change the road outcome.
// (e) State after each choice is consistent (party, supplies, trail).
// Plus: an unanswered choice auto-resolves to leave at the next tick.
//
// Flow: FIGHT first (multi-seed while two kin keep the road open), then
// ASK, LEAVE, auto-resolve, all-found.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

async function main() {
  const { Game } = await loadGame({ seed: SEED });
  await setupGame(Game, 'Columbus, Ohio');
  const D = Game.nomadDrive, N = Game.nomad, S = Game.nomadScenes;
  ok(!!(D && D.chooseReunion && D.pendingChoice), 'driver exposes chooseReunion + pendingChoice');
  ok(!!(S && S.changedChoices && S.choiceLines), 'scenes expose changedChoices + choiceLines');

  // --- departure with 3 known scattered kin ---
  Game.state.globalLive = true;
  const kin = Game.worldKin(Game.villagerId).filter(k => k.fate === 'scattered' && k.region).slice(0, 3);
  ok(kin.length === 3, 'has 3 scattered kin with regions (got ' + kin.length + ')');
  if (kin.length < 3) { console.log('RESULT: ' + pass + ' passed, ' + (fail + 1) + ' failed'); process.exit(1); }
  for (const k of kin) Game.hearOfRegion(k.region, 'test');
  const road = N.start();
  road.supplies = { food: 9999999 };
  ok(road.legs.length >= 1, 'itinerary planned (' + road.legs.length + ' legs)');
  const legged = kin.every(k => road.legs.some(l => (l.kinNames || []).indexOf(k.name) >= 0 || l.kinName === k.name));
  ok(legged, 'every known kin is on the itinerary (shared regional legs allowed)');

  // Force every reunion to 'changed' — the fate is an input to the reunion
  // machinery; the choice flow is what this test proves.
  const fateForOrig = D.fateFor.bind(D);
  D.fateFor = () => 'changed';

  const said = [];
  const sayOrig = Game.say;
  Game.say = (m) => { said.push(String(m)); try { return sayOrig.apply(Game, arguments); } catch (e) {} };

  // Fires the next reunion FOR THE BEARER'S OWN KIN: the next leg with an
  // unresolved bearer-owned kin (entering it if pending), then day-by-day
  // until the choice opens — stopping the moment it does, like a player
  // reading the scene before tapping again. (An extra tick would
  // auto-resolve the choice to leave, by design.) Party members' kin are
  // skipped here: their reunions are the member's call (memberDecide), not
  // the bearer's tap — see test-nomad-partykin.js for that path.
  function fireNextReunion() {
    const next = road.legs.find(l => {
      if (l.status === 'done') return false;
      const names = (l.kinNames && l.kinNames.length) ? l.kinNames : (l.kinName ? [l.kinName] : []);
      return names.some(n => !(l.resolvedKin || {})[n] && !(l.kinOwners && l.kinOwners[n]));
    });
    if (!next) return null;
    if (next.status === 'pending') N.enterLeg(road.legs.indexOf(next));
    for (let d = 0; d < 8 && !D.pendingChoice(); d++) N.daily();
    const pc = D.pendingChoice();
    return pc ? { pc, leg: next } : null;
  }
  const noRot = () => !/undefined|NaN|\[object/.test(said.join(' '));

  console.log('== (a) exactly three choices ==');
  let step = fireNextReunion();
  ok(!!step && !!step.pc, 'reunion holds a pending choice open');
  const ids = (step.pc.choices || []).map(c => c.id);
  ok(ids.length === 3 && ids[0] === 'ask' && ids[1] === 'leave' && ids[2] === 'fight',
    'exactly ask/leave/fight (got: ' + ids.join(',') + ')');
  ok(step.pc.choices.every(c => c.label && !/na_eastern|sahel|south_asia|eu_temperate|east_asia|amazon/i.test(c.label)),
    'labels reveal nothing unknowable');
  ok(step.pc.kind === S.changedKind(step.pc.kinName), 'kind matches deterministic changedKind (' + step.pc.kind + ')');

  console.log('== (d) FIGHT: real duel, win/lose changes the road ==');
  said.length = 0;
  const fightName = step.pc.kinName, fightLeg = step.leg;
  // Spy: prove the duel goes through fieldFight blow-by-blow, never a table.
  let calls = 0, firstRec = null;
  const ffOrig = Game.fieldFight;
  Game.fieldFight = function () {
    calls++;
    const rec = ffOrig.apply(this, arguments);
    if (!firstRec) firstRec = rec;
    return rec;
  };
  const hasRng = (typeof Game.mulberry32 === 'function');
  const outcomes = {};
  let lastR = null;
  for (let s = 1; s <= 12; s++) {
    if (!road.active) break;
    if (!D.pendingChoice()) D.resolveReunion(fightLeg, fightName);
    lastR = D.chooseReunion(fightName, 'fight', hasRng ? { rng: Game.mulberry32(1000 + s) } : {});
    if (!lastR) break;
    outcomes[lastR.outcome] = (outcomes[lastR.outcome] || 0) + 1;
  }
  Game.fieldFight = ffOrig;
  ok(calls >= 2, 'duel entered real fieldFight (' + calls + ' bouts across seeds)');
  ok(!!firstRec && firstRec.rounds >= 1 && Array.isArray(firstRec.log) && firstRec.log.length > 0,
    'bout fought real rounds (' + (firstRec ? firstRec.rounds + ' rounds, ' + firstRec.log.length + ' log lines' : 'none') + ') — never a flat roll');
  ok((outcomes['joined-forced'] || 0) >= 1, 'WIN observed: kin run down, forced home (' + (outcomes['joined-forced'] || 0) + '/12)');
  ok((outcomes['changed'] || 0) >= 1, 'LOSE observed: bearer backed down, bloodied (' + (outcomes['changed'] || 0) + '/12)');
  ok(noRot(), 'no template rot in fight narration');
  ok(road.active, 'road still open (two kin unresolved)');
  // State reflects the LAST fight's outcome.
  const cid = 'kin:' + fightName.replace(/[^a-zA-Z0-9]+/g, '_');
  if (lastR && lastR.outcome === 'joined-forced') {
    ok(!!(road.companions || {})[cid] && road.companions[cid].forced === true, 'forced companion recorded');
    ok(road.partyIds.indexOf(cid) >= 0, 'forced kin walks with the party');
    ok(road.foundKin.some(e => e.name === fightName && e.fate === 'alive'), 'foundKin records alive (forced)');
    ok(fightLeg.resolvedKin[fightName] === 'alive', 'leg records alive');
  } else {
    ok(road.foundKin.some(e => e.name === fightName && e.fate === 'changed'), 'foundKin records changed after lost duel');
    ok(fightLeg.resolvedKin[fightName] === 'changed', 'leg records changed after lost duel');
  }
  ok(!D.pendingChoice(), 'choice closed after FIGHT');

  console.log('== (b) ASK: coherent answer scene ==');
  said.length = 0;
  step = fireNextReunion();
  ok(!!step && !!step.pc, 'second reunion holds a choice open');
  const askName = step.pc.kinName, askKind = step.pc.kind, askLeg = step.leg;
  const foodBefore = road.supplies.food;
  const rAsk = D.chooseReunion(askName, 'ask');
  ok(!!rAsk && rAsk.choice === 'ask', 'chooseReunion(ask) resolves');
  ok(said.length >= 2, 'ASK says a real scene (' + said.length + ' beats)');
  ok(said.join(' ').indexOf(askName.split(' ')[0]) >= 0, 'scene speaks of the kin by name');
  ok(noRot(), 'no template rot in the scene');
  if (askKind === 'leads') ok(road.supplies.food === foodBefore + 1500, 'leads kin sends a 1,500 kcal pack');
  else ok(road.supplies.food === foodBefore, 'no food change for non-leads ask');
  ok(!D.pendingChoice(), 'choice closed after ASK');
  ok(road.foundKin.some(e => e.name === askName && e.fate === 'changed'), 'foundKin records changed');
  ok(askLeg.resolvedKin[askName] === 'changed', 'leg marks kin resolved');

  console.log('== auto-resolve: unanswered choice walks on ==');
  D.resolveReunion(askLeg, askName);
  ok(!!D.pendingChoice(), 'pending choice re-opened');
  N.daily();
  ok(!D.pendingChoice(), 'next tick auto-resolved the unanswered choice');
  const autoEntries = road.foundKin.filter(e => e.name === askName);
  ok(autoEntries.length >= 1 && autoEntries[autoEntries.length - 1].fate === 'changed',
    'auto-resolve is the leave default (changed)');

  console.log('== (c) LEAVE: the old default, narrated ==');
  said.length = 0;
  step = fireNextReunion();
  ok(!!step && !!step.pc, 'third reunion holds a choice open');
  const leaveName = step.pc.kinName;
  const rLeave = D.chooseReunion(leaveName, 'leave');
  ok(!!rLeave && rLeave.choice === 'leave', 'chooseReunion(leave) resolves');
  ok(said.length >= 1 && /walk|bell|hums|trees/i.test(said.join(' ')), 'LEAVE narrates walking on honestly');
  ok(noRot(), 'no template rot in leave narration');
  ok(!D.pendingChoice(), 'choice closed after LEAVE');
  ok(road.foundKin.some(e => e.name === leaveName && e.fate === 'changed'), 'foundKin records changed');

  console.log('== (e) state consistency ==');
  // Drive every remaining leg to completion the way a player would: enter
  // it, live there until its kin resolve. Member-owned reunions resolve via
  // the member's own call (memberDecide); any unanswered bearer choice
  // auto-resolves to leave at the next tick. The road should close
  // all-found once every kin — bearer's and members' — is resolved.
  let guard = 0;
  while (road.active && guard++ < 200) {
    const next = road.legs.find(l => {
      if (l.status === 'done') return false;
      const names = (l.kinNames && l.kinNames.length) ? l.kinNames : (l.kinName ? [l.kinName] : []);
      return names.some(n => !(l.resolvedKin || {})[n]);
    });
    if (!next) break;
    if (next.status === 'pending') N.enterLeg(road.legs.indexOf(next));
    const before = Object.keys(next.resolvedKin || {}).length;
    for (let d = 0; d < 12; d++) {
      N.daily();
      if (!road.active) break;
      if (Object.keys(next.resolvedKin || {}).length > before) break;
    }
  }
  ok(!road.active && road.endReason === 'all-found', 'road closed all-found once every kin resolved');
  ok(typeof road.supplies.food === 'number' && road.supplies.food >= 0, 'supplies sane (' + road.supplies.food + ')');
  ok(road.legs.every(l => ['pending', 'active', 'done'].indexOf(l.status) >= 0), 'all legs in a legal status');
  ok(!road.legs.some(l => l.status === 'done' && !(l.resolvedKin && Object.keys(l.resolvedKin).length)),
    'no leg closed without a resolved kin');

  // restore
  D.fateFor = fateForOrig;
  Game.say = sayOrig;

  console.log('RESULT: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
