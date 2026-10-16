#!/usr/bin/env node
// scripts/test-readinessv3-20261015.js — READINESS GATE proof.
// REBUILT 2026-10-16 (design call #4): the faced-experience bar
// (sim-readinessgate2 spec, 2026-10-15) measured EXPOSURE — distinct
// wave-(w-1) types faced, fleeing counted — not combat capability. Design
// call #4 (Steve approved) replaced it with a real combat-readiness
// representation: waveCombatReadiness() reads live village state — armor
// worn, weapons to hand, counters known (monsterCounterKnown), veterans
// alive with wave-(w-1)+ kills in state.waveKillLog. The deferral layers
// (plenty cap, peak ratchet), the honest beats, and waves 1-3 untouched
// are unchanged — only the bar moved from exposure to capability.
// Demands are sim starting points in standingCfg().readyDemand, not canon.
//
// RED PHASE: run against PRISTINE standing.js → INFO-SKIP exit 0 (kill
//   protocol: the gate is not in this tree, nothing to prove).
// GREEN PHASE: run against the ARMed tree: all assertions pass (exit 0).
//
// Fixture (scripted, deterministic): day 60; wave-3 unlocked organically via
// the wave-2 ledger bar (4 points); Standing via plenty (5+ feasts @ quality
// 1); the village stripped to genuinely unready (no worn armor, no weapons,
// no counters, no kills).
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

const fails = [];
const pass = [];
function check(name, cond, detail) {
  const ok = !!cond;
  (ok ? pass : fails).push(name);
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

function feast(n, day) {
  const log = [];
  for (let i = 0; i < n; i++) log.push({ day: day - i, quality: 1 });
  return log;
}
function ledger(points, perType) {
  return { points, perType, perTypeX: {} };
}

async function buildGame() {
  const { Game } = await loadGame({ seed: 11, mode: 'readinessgate-proof' });
  await quietLog(async () => { await setupGame(Game); });
  Game._beatLines = [];
  const origSysSay = Game.sysSay, origSay = Game.say;
  Game.sysSay = function (t) { try { Game._beatLines.push(t); } catch (e) {} if (origSysSay) return origSysSay.call(Game, t); };
  Game.say = function (t) { try { Game._beatLines.push(t); } catch (e) {} if (origSay) return origSay.call(Game, t); };
  return Game;
}

function stripVillage(Game) {
  const sch = Game.state.scholar || {};
  sch.equipped = {};
  sch.inventory = (sch.inventory || []).filter(e => {
    const iid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
    const def = (Game.data.items || []).find(d => d && d.id === iid);
    return !(def && def.weapon);
  });
  for (const vid of ((Game.state.village || {}).roster || [])) {
    if (vid === Game.villagerId) continue;
    const vp = Game.vpOf(vid);
    if (!vp || vp.dead) continue;
    vp.equipped = {};
    vp.items = [];
  }
  Game.state.monsterCounters = {};
  Game.state.waveKillLog = [];
}

function livingFighters(Game) {
  const out = [];
  for (const vid of ((Game.state.village || {}).roster || [])) {
    if (vid === Game.villagerId) continue;
    const vp = Game.vpOf(vid);
    if (vp && !vp.dead) out.push(vid);
  }
  return out;
}

// gearUp(Game, n): n villagers get hide armor (P=20) + spear; the scholar
// gears too. Counters + veteran kills are set separately per phase.
function gearUp(Game, n) {
  const fighters = livingFighters(Game);
  for (let i = 0; i < n && i < fighters.length; i++) {
    const vp = Game.vpOf(fighters[i]);
    vp.equipped = Object.assign(vp.equipped || {}, {
      torso: { itemId: 'hide_armor' },
      melee: { itemId: 'hunting_spear' },
    });
  }
  Game.state.scholar.equipped = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
}

function baseFixture(Game) {
  // day 60, wave 3 open via the wave-2 ledger bar, standing via plenty only,
  // NO combat capability, no peak, no beats.
  Game.state.scholar.day = 60;
  Game.state.waveLedger = Game.state.waveLedger || {};
  Game.state.waveLedger[2] = ledger(4, { x: 2, y: 2 });
  Game.state.waveLedger[3] = ledger(0, {});
  Game.state.waveLedger[4] = ledger(0, {});
  Game.state.waveLedger[5] = ledger(0, {});
  Game.state.feastLog = feast(5, 55);
  try { Game.deedState().wavesFaced = {}; } catch (e) {}
  delete Game.state._standingDeferBeat;
  delete Game.state._standingPlentyCapBeat;
  delete Game.state._standingPeakWave;
  Game._beatLines.length = 0;
  stripVillage(Game);
}

(async () => {
  const Game = await buildGame();
  const ARMED = typeof Game.waveCombatReadiness === 'function' && typeof Game.standingPlentyCappedTotal === 'function';
  console.log('ARMED (waveCombatReadiness + standingPlentyCappedTotal): ' + ARMED);
  if (!ARMED) {
    // KILL PROTOCOL: the readiness-gate arm is not in this tree — nothing
    // to prove. INFO-SKIP, exit 0 (never MODULE_NOT_FOUND).
    console.log('INFO-SKIP: readiness gate not in tree (killed arm) — nothing to prove.');
    process.exit(0);
  }

  // ---- wave-4 deferral: standing >= 100, zero combat capability ----
  baseFixture(Game);
  let s = Game.villageStanding();
  check('fixture standing >= 100 via plenty only', (s.total | 0) >= 100 && (s.war | 0) === 0,
    `total=${s.total} war=${s.war}`);
  const r4 = Game.waveUnlockReady(4);
  check('unready village: ready(4) false, all four bars short',
    r4.ready === false && (r4.short || []).length === 4, JSON.stringify(r4.short));
  const d4 = Game.standingDeferral(4);
  check('unready village: wave-4 unlock DEFERRED', d4.deferred === true, JSON.stringify({ deferred: d4.deferred, raw: d4.raw }));
  check('villageStandingTotal gated to 99', Game.villageStandingTotal() === 99, 'total=' + Game.villageStandingTotal());
  check('unlockedWave() holds at 3', Game.unlockedWave() === 3, 'wave=' + Game.unlockedWave());
  const beat = Game._beatLines.join('\n');
  check('deferral beat fired (names the readiness bars)',
    /not for strangers/i.test(beat) && /armor the village/i.test(beat), 'beats=' + Game._beatLines.length);
  check('standingLine names the held wave', /HELD/.test(Game.standingLine()), Game.standingLine());

  // ---- wave-4 release: the village gears up and bloods itself ----
  gearUp(Game, 4);
  const fighters = livingFighters(Game);
  Game.state.monsterCounters = { bulldozer: true, hushwolf: true, voice_mimic_radio: true };
  Game.state.waveKillLog = [
    { d: 50, mid: 'redactor', w: 3, by: fighters[0], via: 'agency' },
    { d: 51, mid: 'gavel', w: 3, by: fighters[1], via: 'agency' },
  ];
  const r4b = Game.waveUnlockReady(4);
  check('capability bars met => ready(4)', r4b.ready === true, JSON.stringify({ a: r4b.armored, w: r4b.armed, t: r4b.tricks, v: r4b.veterans }));
  check('capability: unlock releases to wave 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  check('peak ratchet set to 4', (Game._standingPeakWave() | 0) === 4, 'peak=' + Game._standingPeakWave());

  // ---- monotonicity: standing collapses, wave 4 sticks ----
  Game.state.feastLog = [];
  const sLow = Game.villageStanding();
  check('fixture standing collapsed', (sLow.total | 0) < 100, 'total=' + sLow.total);
  check('monotonic: unlockedWave stays 4 after standing collapse', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  check('monotonic: total floored at t4', Game.villageStandingTotal() >= 100, 'total=' + Game.villageStandingTotal());
  check('monotonic: deferral(4) grandfathered by peak', Game.standingDeferral(4).grandfathered === true,
    JSON.stringify({ grandfathered: Game.standingDeferral(4).grandfathered }));

  // ---- wave-5 plenty cap: bread alone cannot buy the fifth draft ----
  // (village IS ready for wave 4 — geared above — so the plenty cap is the
  // binding constraint, not the readiness bar)
  baseFixture(Game);
  gearUp(Game, 4);
  const fighters2 = livingFighters(Game);
  Game.state.monsterCounters = { bulldozer: true, hushwolf: true, voice_mimic_radio: true };
  Game.state.waveKillLog = [
    { d: 50, mid: 'redactor', w: 3, by: fighters2[0], via: 'agency' },
    { d: 51, mid: 'gavel', w: 3, by: fighters2[1], via: 'agency' },
  ];
  Game.state.feastLog = feast(10, 55); // plenty = 200, war = 0, dip = 0
  const capped = Game.standingPlentyCappedTotal();
  check('plenty cap: 200 bread counts 100 toward T5', capped === 100, 'capped=' + capped);
  check('plenty cap: total held at 199 (not 200+)', Game.villageStandingTotal() === 199, 'total=' + Game.villageStandingTotal());
  check('plenty cap: unlockedWave stays 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  const capBeat = Game._beatLines.join('\n');
  check('plenty-cap beat fired (bread alone)', /not bought with bread/i.test(capBeat), 'beats=' + Game._beatLines.length);

  // ---- wave-5 readiness deferral: plenty-capped >= T5, w5 bars unmet ----
  Game.state.waveLedger[3] = ledger(4, { x: 2, y: 2 }); // war = 100 -> capped = 200
  try { Game.deedState().wavesFaced = { eater: 4 }; } catch (e) {} // wave-4 faced (w5 door)
  const capped2 = Game.standingPlentyCappedTotal();
  check('war+plenty: capped total reaches T5', capped2 === 200, 'capped=' + capped2);
  const r5 = Game.waveUnlockReady(5);
  check('w5 bars unmet => not ready(5)', r5.ready === false && (r5.short || []).length > 0, JSON.stringify(r5.short));
  const d5 = Game.standingDeferral(5);
  check('wave-5 unlock DEFERRED on readiness', d5.deferred === true, JSON.stringify({ deferred: d5.deferred, capped: d5.capped }));
  check('wave-5 deferral caps total at 199', Game.villageStandingTotal() === 199, 'total=' + Game.villageStandingTotal());
  check('wave-5 held: unlockedWave stays 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());

  // ---- wave-5 release: the village gears for the Producers ----
  for (let i = 0; i < 6 && i < fighters2.length; i++) {
    const vp = Game.vpOf(fighters2[i]);
    vp.equipped = Object.assign(vp.equipped || {}, { torso: { itemId: 'riot_gear' } }); // P=30 >= 20
  }
  for (let i = 0; i < 7 && i < fighters2.length; i++) {
    const vp = Game.vpOf(fighters2[i]);
    vp.equipped = Object.assign(vp.equipped || {}, { melee: { itemId: 'hunting_spear' } });
  }
  Game.state.scholar.equipped = { torso: { itemId: 'riot_gear' }, melee: { itemId: 'hunting_spear' } };
  Game.state.monsterCounters = { bulldozer: true, hushwolf: true, voice_mimic_radio: true, mirror_stag: true };
  Game.state.waveKillLog = [
    { d: 60, mid: 'congregation', w: 4, by: fighters2[0], via: 'agency' },
    { d: 61, mid: 'strike', w: 4, by: fighters2[1], via: 'agency' },
    { d: 62, mid: 'influencer', w: 4, by: fighters2[2], via: 'agency' },
  ];
  const r5b = Game.waveUnlockReady(5);
  check('w5 capability bars met => ready(5)', r5b.ready === true, JSON.stringify(r5b.short));
  check('wave-5 releases to 5', Game.unlockedWave() === 5, 'wave=' + Game.unlockedWave());
  check('peak ratchet set to 5', (Game._standingPeakWave() | 0) === 5, 'peak=' + Game._standingPeakWave());

  // ---- monotonicity w5: collapse, wave 5 sticks ----
  Game.state.feastLog = [];
  Game.state.waveLedger[3] = ledger(0, {});
  check('monotonic: unlockedWave stays 5 after collapse', Game.unlockedWave() === 5, 'wave=' + Game.unlockedWave());

  // ---- waves 1-3 untouched ----
  baseFixture(Game);
  Game.state.feastLog = feast(2, 55); // 40 < 100
  check('standing < t4: no deferral, total honest',
    Game.standingDeferral(4).deferred === false && Game.villageStandingTotal() === 40,
    'wave=' + Game.unlockedWave() + ' total=' + Game.villageStandingTotal());

  // ---- no-win-before-90 intact (table.js, untouched) ----
  if (typeof Game.winDayFloorOk === 'function') {
    const daySave = Game.state.scholar.day;
    Game.state.scholar.day = 89;
    const f89 = Game.winDayFloorOk();
    Game.state.scholar.day = 90;
    const f90 = Game.winDayFloorOk();
    Game.state.scholar.day = daySave;
    check('no-win-before-90 intact (89 denied, 90 allowed)', f89 === false && f90 === true, `89=${f89} 90=${f90}`);
  } else {
    check('no-win-before-90 intact', false, 'winDayFloorOk missing');
  }

  console.log(`\n${pass.length} passed, ${fails.length} failed`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
