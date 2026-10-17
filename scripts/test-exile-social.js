#!/usr/bin/env node
// test-exile-social.js — PROOF TEST for Steve's 2026-10-17 ruling:
// "Social consequences too." Exile was enforced logistically only (guards,
// pantry denial, uprising) while the village kept chatting and feasting with
// the exile (Oct-12 r7 finding: 51 full conversations + 22 feasts post-exile;
// conversation.js had no exile gate).
// Ruling: cold shoulders with loyalty exceptions — villagers refuse social
// engagement with the exiled by default; close friends/family may break the
// cold shoulder at a trust cost. Not full lockout; amends stays possible.
//
// RED (pre-fix): startConvo opens a full conversation with the exiled scholar
//   as if nothing happened — no refusal, no loyalty logic, no trust cost.
// GREEN (post-fix):
//   1. non-loyal villager: startConvo -> {refused:true}, a human refusal line,
//      no conversation active, no kcal charged.
//   2. loyal villager (trust>=40): first approach BREAKS the shoulder — the
//      conversation opens, and the breaker pays a real trust cost (-10).
//   3. talkTo (the UI surface) returns the refusal line, not a convo opener.
//   4. a pending pre-exile talk request resolves as a cold shoulder, marked
//      delivered (not stranded).
//   5. the amends path (justiceRespond restitution at stage 2) still works —
//      the gate must not touch pre-exile justice.
// Usage: node scripts/test-exile-social.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra === undefined ? '' : String(extra).slice(0, 220)); }
}
const trustOf = (Game, vid) => {
  const t = (Game.state.village.trust || {})[vid];
  return t === undefined ? 10 : t;
};

async function main() {
  const { Game } = await loadGame({ seed: 4242 });
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  Game.sysSay = () => {}; Game.emit = () => {};
  await setupGame(Game);

  const me = Game.villagerId;
  const npcs = Game.npcIds().filter(id => id !== me);
  if (npcs.length < 3) { console.log('FAIL: not enough villagers'); process.exit(1); }
  const A = npcs[0];            // non-loyal: default trust 10
  const B = npcs[1];            // loyal: trust 45
  const C = npcs[2];            // pending talk request, then exiled
  Game.state.village.trust = Game.state.village.trust || {};
  Game.state.village.trust[B] = 45;

  // ---- 5. AMENDS PATH FIRST (pre-exile — the gate must not touch it) ----
  const j = Game.justiceState();
  j.stage = 2; j.pendingConfront = true; j.confrontedBy = A; j.confrontDay = Game.state.scholar.day;
  // give the scholar something to pay with
  Game.state.scholar.inventory = Game.state.scholar.inventory || [];
  Game.state.scholar.inventory.push({ name: 'smoked meat', kcalEach: 500, units: 10, foodState: 'smoked' });
  let resp = null;
  try { resp = Game.justiceRespond('pay'); } catch (e) { resp = { error: String(e && e.message) }; }
  ok(resp && resp.enough === true, 'amends: restitution at stage 2 still pays out', JSON.stringify(resp));
  ok(Game.justiceState().stage <= 1, 'amends: stage relaxes after restitution', 'stage=' + Game.justiceState().stage);

  // ---- exile ----
  try { Game.exilePlayer('moot'); } catch (e) { console.log('exilePlayer threw: ' + (e && e.message)); process.exit(2); }
  ok(Game.justiceExiled(), 'exile is on (justiceState)', 'justiceExiled=' + Game.justiceExiled());

  // ---- 1. COLD SHOULDER: non-loyal villager refuses ----
  const kcalBefore = Game.state.scholar.kcal;
  const rA = Game.startConvo(A);
  ok(rA && rA.refused === true && rA.broke === false, 'non-loyal: startConvo resolves as a cold-shoulder refusal', JSON.stringify(rA && { refused: rA.refused, broke: rA.broke, ended: rA.ended }));
  ok(typeof (rA && rA.line) === 'string' && rA.line.length > 20, 'non-loyal: the refusal is a real line, not a stub', String(rA && rA.line).slice(0, 120));
  let cA = null; try { cA = Game.convoGet(A); } catch (e) {}
  ok(!cA || !cA.active, 'non-loyal: no conversation is actually open', 'active=' + (cA && cA.active));
  ok(Game.state.scholar.kcal === kcalBefore, 'non-loyal: refused talk charges no kcal', `${kcalBefore} -> ${Game.state.scholar.kcal}`);
  // repeat same day: still refused, no robotic crash
  const rA2 = Game.startConvo(A);
  ok(rA2 && rA2.refused === true, 'non-loyal: repeat attempt same day still refused', JSON.stringify(rA2 && rA2.refused));

  // ---- 3. talkTo surface ----
  const tline = Game.talkTo(A);
  ok(typeof tline === 'string' && tline.length > 20, 'talkTo returns the refusal line', String(tline).slice(0, 120));

  // ---- 2. LOYALTY BREAK: close friend breaks at a trust cost ----
  const trustBefore = trustOf(Game, B);
  ok(trustBefore >= 40, 'setup: B is loyal (trust>=40)', 'trust=' + trustBefore);
  const rB = Game.startConvo(B);
  ok(rB && rB.broke === true && !rB.refused, 'loyal: first approach BREAKS the cold shoulder', JSON.stringify(rB && { broke: rB.broke, refused: rB.refused }));
  let cB = null; try { cB = Game.convoGet(B); } catch (e) {}
  ok(cB && cB.active && cB.exileBreak === true, 'loyal: the conversation opens, marked as a break', 'active=' + (cB && cB.active) + ' exileBreak=' + (cB && cB.exileBreak));
  const trustAfter = trustOf(Game, B);
  ok(trustAfter === trustBefore - 10, 'loyal: the breaker pays a real trust cost (-10)', `${trustBefore} -> ${trustAfter}`);
  const sawCost = said.some(t => /remember this|watched|sees/i.test(t));
  ok(sawCost, 'loyal: the cost is visible in the transcript (witness beat)', said.slice(-6).join(' | ').slice(0, 200));
  // the opened conversation actually works
  let chB = []; try { chB = Game.convoChoices(B) || []; } catch (e) {}
  ok(chB.length > 0, 'loyal: the broken-shoulder conversation has real choices', 'choices=' + chB.length);
  try { Game.endConvo(B, 'left'); } catch (e) {}

  // ---- 4. pending pre-exile talk request resolves, not stranded ----
  Game.state.village.talkRequests = Game.state.village.talkRequests || {};
  Game.state.village.talkRequests[C] = { line: '__NAME__ wanted to talk, before.', day: Game.state.scholar.day };
  const rC = Game.startConvo(C);
  const treq = Game.state.village.talkRequests[C];
  ok(rC && rC.refused === true, 'pending request: resolves as cold shoulder post-exile', JSON.stringify(rC && rC.refused));
  ok(treq && treq.delivered === true, 'pending request: marked delivered, not stranded', JSON.stringify(treq));

  // ---- gate predicate sanity: not exiled -> no gate ----
  const { Game: Game2 } = await loadGame({ seed: 4243 });
  Game2.say = () => {}; Game2.sysSay = () => {}; Game2.emit = () => {};
  await setupGame(Game2);
  const cut2 = (typeof Game2.justiceExileSociallyCut === 'function') ? Game2.justiceExileSociallyCut() : 'MISSING';
  ok(cut2 === false, 'not exiled: the gate is off', 'justiceExileSociallyCut=' + cut2);
  const npcs2 = Game2.npcIds().filter(id => id !== Game2.villagerId);
  const r2 = Game2.startConvo(npcs2[0]);
  ok(r2 && !r2.refused, 'not exiled: conversations open normally', JSON.stringify(r2 && { refused: r2.refused, ended: r2.ended }));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED: the exile-social blank is present (or the fix regressed)'); process.exit(1); }
  console.log('GREEN: exile carries social consequences — cold shoulders by default, loyalty breaks at a trust cost, amends intact');
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
