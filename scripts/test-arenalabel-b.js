#!/usr/bin/env node
// test-arenalabel-b.js — proof for the sim-arenalabel-b arm:
// tbEnd('lost') labels deaths by fight origin, label-only.
//
// Legs L1–L6 call the new Game.tbFightDeathCause(f) directly
// with fabricated fight objects (no full fight needed):
//   L1 arenaContest present -> 'the arena' (unchanged)
//   L2 proven wild (monster fighter, no hostile, no flags) -> 'the wild'
//   L3 betrayal fight -> 'betrayal' (SUPERSEDED by sim-arenafallback-b
//     2026-10-28: fallback origins now name themselves; see
//     scripts/test-arenafallback-b.js for the full origin set)
//   L4 tableTrial fight -> 'the table trial' (superseded, as L3)
//   L5 coalitionArena fight -> 'the coalition arena' (superseded, as L3)
//   L6 hostile-only fight (alien human) -> 'a stranger' (superseded, as L3;
//     knowledge-gated: pre-reveal the fighter is 'Stranger', never 'an alien')
// Legs L7–L8 are harness integrations through the REAL tbEnd:
//   L7 real wild fight forced to 'lost' -> playerDeath 'the wild',
//      and registerDeath / fallen / telemetry / lineage / death
//      line all agree on 'the wild'
//   L8 real fight with state.arenaContest set forced to 'lost'
//      -> playerDeath 'the arena', all derivations agree
// No mechanics are asserted here beyond the label: L7/L8 force
// the loss by setting the player fighter to 0 HP (the fight
// outcome itself is not under test).
//
//   node scripts/test-arenalabel-b.js   (exit 0 = PROOF-GREEN)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function wildFight() {
  return { fighters: [{ key: 'p', kind: 'player' }, { key: 'm_0', kind: 'monster', monsterId: 'bulldozer' }] };
}
(async () => {
  const { Game } = await loadGame({ seed: 4242 });
  await setupGame(Game);
  if (typeof Game.tbFightDeathCause !== 'function') {
    console.log('FAIL tbFightDeathCause missing — the lever is not installed');
    process.exit(1);
  }
  const saveArc = Game.state.arenaContest;
  try { Game.state.arenaContest = null; } catch (e) {}

  // L1: arena contest fight -> 'the arena'
  Game.state.arenaContest = { contestId: 'blood_pit', waves: ['bulldozer'], waveIdx: 0 };
  ok('L1 arenaContest present -> the arena', Game.tbFightDeathCause(wildFight()) === 'the arena');
  Game.state.arenaContest = null;

  // L2: proven wild -> 'the wild'
  ok('L2 proven wild monster fight -> the wild', Game.tbFightDeathCause(wildFight()) === 'the wild');

  // L3–L6: SUPERSEDED by sim-arenafallback-b — fallback origins now
  // name themselves (label-only change, design change on purpose).
  ok('L3 betrayal fight -> betrayal (arenafallback-b)', Game.tbFightDeathCause({ betrayal: true, fighters: wildFight().fighters }) === 'betrayal');
  ok('L4 tableTrial fight -> the table trial (arenafallback-b)', Game.tbFightDeathCause({ tableTrial: true, fighters: wildFight().fighters }) === 'the table trial');
  ok('L5 coalitionArena fight -> the coalition arena (arenafallback-b)', Game.tbFightDeathCause({ coalitionArena: {}, fighters: wildFight().fighters }) === 'the coalition arena');
  ok('L6 alien-hostile fight -> a stranger (arenafallback-b)', Game.tbFightDeathCause({ fighters: [{ key: 'p', kind: 'player' }, { key: 'h_0', kind: 'hostile', alienPid: 'x' }] }) === 'a stranger');
  ok('L6b no-monster fight -> the arena (unchanged)', Game.tbFightDeathCause({ fighters: [{ key: 'p', kind: 'player' }] }) === 'the arena');

  // Harness legs: capture playerDeath + say lines through the real path.
  const deaths = [];
  const sayLines = [];
  const origPD = Game.playerDeath;
  Game.playerDeath = function (...args) { deaths.push(args[0]); return origPD.apply(this, args); };
  const origSay = Game.say;
  Game.say = function (...args) { try { sayLines.push(String(args[0] || '')); } catch (e) {} return origSay.apply(this, args); };
  function forceLoss() {
    const s = Game.state.scholar;
    s.abilities = [];
    Game.state.phoenixLink = null;
    Game.startCombat('bulldozer');
    const p = Game.tbFighter('p');
    if (!p) throw new Error('no player fighter after startCombat');
    p.hp = 0; p.alive = false;
    s.health = 0;
    Game.tbEndCheck();
    if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('lost');
  }
  function derivations(vid) {
    const v = Game.state.village || {};
    const fallen = (v.fallen || []).filter((x) => x.villagerId === vid);
    const teles = (Game.state.telemetry || []).filter((t) => t && t.type === 'death' && String(t.who) === String(vid));
    const lineage = (typeof Game.lineage === 'function' ? Game.lineage() : []).filter((x) => x.villagerId === vid);
    const regs = []; // registerDeath derivation is checked via fallen/tele/lineage + wrapper cause; see below
    return { fallen: fallen.length ? fallen[fallen.length - 1].cause : null,
      telemetry: teles.length ? teles[teles.length - 1].cause : null,
      lineage: lineage.length ? lineage[lineage.length - 1].cause : null, regs };
  }

  // L7: real wild fight loss
  const vidBefore = Game.villagerId;
  const deathsBefore = deaths.length;
  forceLoss();
  const wildCause = deaths.slice(deathsBefore)[0];
  const wildDeriv = derivations(vidBefore);
  const wildLine = sayLines.slice().reverse().find((l) => /is dead —/.test(l));
  ok('L7 wild fight loss -> playerDeath the wild', wildCause === 'the wild', 'cause=' + wildCause);
  ok('L7 wild derivations agree (fallen/tele/lineage)', wildDeriv.fallen === 'the wild' && wildDeriv.telemetry === 'the wild' && wildDeriv.lineage === 'the wild', JSON.stringify(wildDeriv));
  ok('L7 wild death line names the wild', !!wildLine && /is dead — the wild/.test(wildLine), wildLine ? wildLine.slice(0, 120) : 'no death line');

  // L8: real arena-contest fight loss (activeContest null so the
  // contest-resume hook early-returns; the label path is what is
  // under test, not the contest show).
  const vid2 = Game.villagerId;
  Game.state.arenaContest = { contestId: 'blood_pit', waves: ['bulldozer'], waveIdx: 0 };
  Game.state.activeContest = null;
  const deathsBefore2 = deaths.length;
  forceLoss();
  const arenaCause = deaths.slice(deathsBefore2)[0];
  const arenaDeriv = derivations(vid2);
  const arenaLine = sayLines.slice().reverse().find((l) => /is dead —/.test(l));
  ok('L8 arena fight loss -> playerDeath the arena', arenaCause === 'the arena', 'cause=' + arenaCause);
  ok('L8 arena derivations agree (fallen/tele/lineage)', arenaDeriv.fallen === 'the arena' && arenaDeriv.telemetry === 'the arena' && arenaDeriv.lineage === 'the arena', JSON.stringify(arenaDeriv));
  ok('L8 arena death line names the arena', !!arenaLine && /is dead — the arena/.test(arenaLine), arenaLine ? arenaLine.slice(0, 120) : 'no death line');

  Game.state.arenaContest = saveArc;
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
