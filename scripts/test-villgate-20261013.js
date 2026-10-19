#!/usr/bin/env node
// scripts/test-villgate-20261013.js — proof test: villager departure heal gate
// (flesh-out-b 2026-10-13, arm 1, axis combat-balance).
//
// The expedition villagerHealCheck (70 HP gate: pharmacy -> healer -> sit-out)
// must also cover objective departures (water/visit/traps/guard/leave/explore)
// in villager-objectives.js. Today those departures walk out at any HP
// (r16 arm C census: 22/27 wave-1 NPC monster deaths were non-expedition
// purposes, median entry HP 22).
//
// RED phase: run BEFORE the change — T1/T2/T4 must fail (no objHealGate,
// objDepart ignores HP). GREEN: all pass after.
//
// Usage: node scripts/test-villgate-20261013.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: Number(process.env.SEED || 11), mode: 'villgate-test' });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = v.px != null ? v.px : 4, hy = v.py != null ? v.py : 4;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  if (!vid) { console.log('no NPC villager in roster — cannot test'); process.exit(2); }
  const vid2 = roster[1] || vid;

  // capture 🩹 say lines (heal-check narration)
  const healLines = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const t = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (/🩹/.test(t)) healLines.push(t);
    } catch (e) {}
    return origSay(msg);
  };

  function setHp(id, hp) { v.health = v.health || {}; v.health[id] = hp; }
  function clearAway(id) { if (v.away) delete v.away[id]; v.hurtGate = {}; }
  function mkObj(id, kind, purpose) {
    const o = Game.objOf(id);
    o.kind = kind; o.purpose = purpose; o.state = 'ready';
    o.indoor = false; o.tx = hx + 1; o.ty = hy; o.partsLeft = 2; o.tightness = 0;
    o.companion = null; o.targetVid = null; o.tightened = false;
    return o;
  }
  // Prepare actual people and stores. Replacing a display-name reader does
  // not remove a real doctor's ability to treat someone.
  Game.stashState().medicine = [];
  Game.state.scholar.abilities = [];
  Game.state.scholar.backgroundAbilities = [];
  Game.state.codex.skills = {};
  Game.map.px = hx; Game.map.py = hy;
  Game.state.scholar.insideHaven = true;
  v.away = {}; v.party = [];
  for (const id of roster) Game.getPerson(id).formerOccupation = 'Farmer';
  ok(Game.campHealerId('haven') === null, 'no-help fixture has no actual healer');

  console.log('T1 — objHealGate exists');
  ok(typeof Game.objHealGate === 'function', 'Game.objHealGate is a function', 'typeof=' + typeof Game.objHealGate);

  console.log('T2 — hurt villager (30 HP), no healer: objective departure is sat out');
  setHp(vid, 30); clearAway(vid);
  const o2 = mkObj(vid, 'WATER', 'water');
  const r2 = Game.objDepart(vid, o2, hx, hy, false);
  ok(r2 === false, 'objDepart returns false (blocked)', 'returned ' + JSON.stringify(r2));
  ok(!((v.away || {})[vid]), 'villager NOT marked away', 'away=' + JSON.stringify((v.away || {})[vid]));
  ok(o2.state === 'ready', 'objective stays ready (not out)', 'state=' + o2.state);
  const g2 = (v.hurtGate || {})[vid];
  ok(g2 && g2.satOut === true, 'hurtGate records the sit-out', JSON.stringify(g2));
  ok(healLines.length >= 1 && /rest/.test(healLines[healLines.length - 1]),
    'sit-out is narrated as rest', healLines[healLines.length - 1] || '(none)');

  console.log('T3 — hurt villager re-gated same day: silent, no double narration');
  const nBefore = healLines.length;
  const r3 = Game.objHealGate ? Game.objHealGate(vid, o2, hx, hy, false) : 'n/a';
  ok(r3 === false, 'second gate still false', 'returned ' + JSON.stringify(r3));
  ok(healLines.length === nBefore, 'no second narration line', `lines ${nBefore} -> ${healLines.length}`);

  console.log('T4 — hurt villager (40 HP), healer present: patched up, then departs');
  Game.getPerson(vid2).formerOccupation = 'Doctor';
  Game.getPerson(vid2).name = 'Doc';
  Game.revealName(vid2, 'prepared departure-gate doctor');
  setHp(vid, 40); clearAway(vid);
  const o4 = mkObj(vid, 'WATER', 'water');
  const r4 = Game.objDepart(vid, o4, hx, hy, false);
  ok(r4 === true, 'objDepart returns true (healed, cleared)', 'returned ' + JSON.stringify(r4));
  ok(((v.away || {})[vid] || {}).purpose === 'water', 'villager marked away on the water run');
  ok((v.health || {})[vid] === 65, 'healer +25 applied (40 -> 65)', 'hp=' + (v.health || {})[vid]);
  ok(healLines.some(l => /Doc patches/.test(l) || /patches them up/.test(l)),
    'healer patch-up narrated', healLines.slice(-2).join(' || ') || '(none)');

  console.log('T5 — healthy villager (90 HP): departs, no gate friction');
  Game.getPerson(vid2).formerOccupation = 'Farmer';
  setHp(vid, 90); clearAway(vid);
  const o5 = mkObj(vid, 'TRAPS', 'traps');
  const n5 = healLines.length;
  const r5 = Game.objDepart(vid, o5, hx, hy, false);
  ok(r5 === true && ((v.away || {})[vid] || {}).purpose === 'traps', 'healthy villager departs');
  ok(healLines.length === n5, 'no heal narration for a healthy villager');

  console.log('T6 — LEAVE: hurt, no healer — desperate still walk out (never blocked)');
  setHp(vid, 25); clearAway(vid);
  const o6 = mkObj(vid, 'LEAVE', 'leave');
  const r6 = Game.objDepart(vid, o6, hx, hy, false);
  ok(r6 === true && !!((v.away || {})[vid]), 'LEAVE departure is never sat out');
  const g6 = (v.hurtGate || {})[vid];
  ok(!(g6 && g6.satOut), 'LEAVE never records a sit-out', JSON.stringify(g6));
  ok(healLines.some(l => /leaving anyway|walk out/.test(l)),
    'desperate walk-out narrated', healLines.slice(-2).join(' || ') || '(none)');

  console.log('T7 — objMaybeDepart early-exit: a sat-out villager rests the day out');
  setHp(vid, 30); clearAway(vid);
  v.hurtGate[vid] = { day: (Game.state.scholar || {}).day || 0, satOut: true };
  const o7 = mkObj(vid, 'WATER', 'water');
  Game.objMaybeDepart(vid, null, true, hx, hy);
  ok(!((v.away || {})[vid]), 'sat-out villager does not depart via objMaybeDepart');
  ok(o7.state === 'ready', 'objective left alone while resting');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
