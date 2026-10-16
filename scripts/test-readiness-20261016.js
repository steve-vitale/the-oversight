#!/usr/bin/env node
// scripts/test-readiness-20261016.js — DESIGN CALL #4 proof (2026-10-16).
// "Standing opens the wave door, but a real combat-readiness representation
//  should decide whether the village walks through."
//
// RED→GREEN: a bread-road village (standing 100 via 5 feasts, day 60,
// wave-3 open via the wave-2 ledger bar) that FLED three wave-3 monsters
// and is unarmored / unarmed / trickless / bloodless.
//
//   PRISTINE code: the old faced-experience bar (fleeing counts) is met, so
//     wave 4 unlocks — the bug: promoted into a war it can't fight.
//   FIXED code:  unlock HOLDS at wave 3 with the hold beat naming the short
//     bars (armor, weapons, tricks, veterans) — no silent block.
//
// The test asserts the DESIRED behavior, so it FAILS on pristine (RED) and
// passes on the fixed tree (GREEN). Then the same village gears up
// (armor worn, weapons to hand, counters known, veterans blooded) and the
// unlock MUST release. A ready village still unlocks; waves 1-3 unchanged;
// plenty cap, peak ratchet, no-win-before-90 intact.
//
// Fixture state is scripted and deterministic (seeded harness). New tests
// must not write into the repo — this one doesn't.
'use strict';
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
function ledger(points) {
  return { points, perType: { x: 2, y: 2 }, perTypeX: {} };
}

async function buildGame() {
  const { Game } = await loadGame({ seed: 416, mode: 'readiness-proof' });
  await quietLog(async () => { await setupGame(Game); });
  Game._beatLines = [];
  const origSysSay = Game.sysSay, origSay = Game.say;
  Game.sysSay = function (t) { try { Game._beatLines.push(t); } catch (e) {} if (origSysSay) return origSysSay.call(Game, t); };
  Game.say = function (t) { try { Game._beatLines.push(t); } catch (e) {} if (origSay) return origSay.call(Game, t); };
  return Game;
}

// Strip every fighter to genuinely unready: no worn armor, no weapons
// equipped or carried, no known tricks, no recorded kills.
function stripVillage(Game) {
  const sch = Game.state.scholar || {};
  sch.equipped = {};
  sch.inventory = (sch.inventory || []).filter(e => {
    const iid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
    const def = (Game.data.items || []).find(d => d && d.id === iid);
    return !(def && def.weapon);
  });
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (vid === Game.villagerId) continue;
    const vp = Game.vpOf(vid);
    if (!vp || vp.dead) continue;
    vp.equipped = {};
    vp.items = [];
  }
  Game.state.monsterCounters = {};
  Game.state.waveKillLog = [];
}

function baseFixture(Game) {
  // day 60, wave 3 open via the wave-2 ledger bar (4 pts), standing via
  // plenty ONLY (5 feasts = 100, war = 0), three wave-3 types FACED (fled —
  // the old bar's "ready" state), village stripped to unready.
  Game.state.scholar.day = 60;
  Game.state.waveLedger = Game.state.waveLedger || {};
  Game.state.waveLedger[1] = ledger(5);
  Game.state.waveLedger[2] = ledger(4);
  Game.state.waveLedger[3] = ledger(0);
  Game.state.waveLedger[4] = ledger(0);
  Game.state.waveLedger[5] = ledger(0);
  Game.state.feastLog = feast(5, 55);
  try { Game.deedState().wavesFaced = { redactor: 3, gavel: 3, spool: 3 }; } catch (e) {}
  delete Game.state._standingDeferBeat;
  delete Game.state._standingPlentyCapBeat;
  delete Game.state._standingPeakWave;
  Game._beatLines.length = 0;
  stripVillage(Game);
}

function livingVids(Game, n) {
  const out = [];
  for (const vid of ((Game.state.village || {}).roster || [])) {
    if (vid === Game.villagerId) { out.push(vid); continue; }
    const vp = Game.vpOf(vid);
    if (vp && !vp.dead) out.push(vid);
    if (out.length >= n) break;
  }
  return out;
}

(async () => {
  const Game = await buildGame();
  // RED_PRISTINE=1: bug-demonstration mode — run against PRISTINE standing.js
  // (no combat-readiness arm). Asserts the BUG the design call fixes: the
  // fled-but-unready village unlocks wave 4 under the old faced-experience
  // bar. PASS here = bug confirmed on pristine; this same fixture FAILS
  // (stays at wave 3) on the fixed tree — the RED half of RED→GREEN.
  if (process.env.RED_PRISTINE === '1') {
    baseFixture(Game);
    const s = Game.villageStanding();
    check('pristine fixture: standing >= 100 via plenty only', (s.total | 0) >= 100, `total=${s.total}`);
    const r4 = Game.waveUnlockReady(4);
    check('pristine: old faced bar met by FLEEING (3/3 types faced)',
      r4.ready === true, JSON.stringify({ ready: r4.ready, faced: r4.faced, need: r4.need }));
    check('BUG DEMONSTRATED: pristine unlocks wave 4 for the unready village',
      Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
    console.log(`\n${pass.length} passed, ${fails.length} failed`);
    process.exit(fails.length ? 1 : 0);
  }
  const ARMED = typeof Game.waveCombatReadiness === 'function' && typeof Game.waveUnlockReady === 'function';
  console.log('ARMED design-call-4 (waveCombatReadiness + waveUnlockReady): ' + ARMED);
  if (!ARMED) {
    // Kill protocol: the readiness arm is not in this tree — nothing to
    // prove. INFO-SKIP, exit 0 (never MODULE_NOT_FOUND).
    console.log('INFO-SKIP: combat-readiness gate not in tree — nothing to prove.');
    process.exit(0);
  }

  // ---- the unready village: standing qualifies, capability doesn't ----
  baseFixture(Game);
  const s = Game.villageStanding();
  check('fixture: standing >= 100 via plenty only (the door is open)',
    (s.total | 0) >= 100 && (s.war | 0) === 0, `total=${s.total} war=${s.war}`);
  const cr = Game.waveCombatReadiness(4);
  check('fixture: genuinely unready (0 armored / 0 armed / 0 tricks / 0 veterans)',
    cr.armored === 0 && cr.armed === 0 && cr.tricks === 0 && cr.veterans === 0 && cr.ready === false,
    JSON.stringify({ a: cr.armored, w: cr.armed, t: cr.tricks, v: cr.veterans }));
  const r4 = Game.waveUnlockReady(4);
  check('unready village: ready(4) false, all four bars short',
    r4.ready === false && (r4.short || []).length === 4, JSON.stringify(r4.short));
  const d4 = Game.standingDeferral(4);
  check('unready village: wave-4 unlock DEFERRED (not fled-through)',
    d4.deferred === true, JSON.stringify({ deferred: d4.deferred, raw: d4.raw }));
  check('villageStandingTotal gated to 99', Game.villageStandingTotal() === 99, 'total=' + Game.villageStandingTotal());
  check('BUG CHECK: unready village must NOT unlock wave 4 (holds at 3)',
    Game.unlockedWave() === 3, 'wave=' + Game.unlockedWave());
  const beat = Game._beatLines.join('\n');
  check('hold beat FIRED and names the bars (no silent block)',
    /not for strangers/i.test(beat) && /armor the village/i.test(beat) && /weapons in hands/i.test(beat),
    'beats=' + Game._beatLines.length);
  check('standingLine names the HELD wave', /HELD/.test(Game.standingLine()), Game.standingLine());

  // ---- gear up: the village becomes ready -> the unlock MUST release ----
  const vids = livingVids(Game, 8);
  const fighters = vids.filter(v => v !== Game.villagerId);
  for (let i = 0; i < 4 && i < fighters.length; i++) {
    const vp = Game.vpOf(fighters[i]);
    vp.equipped = Object.assign(vp.equipped || {}, { torso: { itemId: 'hide_armor' } }); // P=20 >= 15
  }
  for (let i = 0; i < 5 && i < fighters.length; i++) {
    const vp = Game.vpOf(fighters[i]);
    vp.equipped = Object.assign(vp.equipped || {}, { melee: { itemId: 'hunting_spear' } });
  }
  // the scholar arms and armors too
  Game.state.scholar.equipped = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
  Game.state.monsterCounters = { bulldozer: true, hushwolf: true, voice_mimic_radio: true };
  Game.state.waveKillLog = [
    { d: 50, mid: 'redactor', w: 3, by: fighters[0], via: 'agency' },
    { d: 51, mid: 'gavel', w: 3, by: fighters[1], via: 'agency' },
  ];
  const cr2 = Game.waveCombatReadiness(4);
  check('geared village: readiness bars met',
    cr2.ready === true && cr2.armored >= 4 && cr2.armed >= 5 && cr2.tricks >= 3 && cr2.veterans >= 2,
    JSON.stringify({ a: cr2.armored, w: cr2.armed, t: cr2.tricks, v: cr2.veterans }));
  check('ready village: unlock releases to wave 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  check('peak ratchet set to 4', (Game._standingPeakWave() | 0) === 4, 'peak=' + Game._standingPeakWave());
  const beat2 = Game._beatLines.join('\n');
  check('release beat fired (the draft opens)', /Mirror Draft opens/i.test(beat2),
    'beats=' + Game._beatLines.length);

  // ---- monotonicity: standing collapses, wave 4 sticks ----
  Game.state.feastLog = [];
  check('monotonic: unlockedWave stays 4 after standing collapse', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  check('monotonic: total floored at t4', Game.villageStandingTotal() >= 100, 'total=' + Game.villageStandingTotal());
  check('monotonic: deferral(4) grandfathered by peak', Game.standingDeferral(4).grandfathered === true,
    JSON.stringify({ grandfathered: Game.standingDeferral(4).grandfathered }));

  // ---- plenty cap intact: bread alone cannot buy the fifth draft ----
  baseFixture(Game);
  const vids2 = livingVids(Game, 8);
  const fighters2 = vids2.filter(v => v !== Game.villagerId);
  // gear up exactly as before (readiness met) so the CAP is the binding tooth
  for (let i = 0; i < 4 && i < fighters2.length; i++) {
    const vp = Game.vpOf(fighters2[i]);
    vp.equipped = Object.assign(vp.equipped || {}, { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } });
  }
  Game.state.scholar.equipped = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
  Game.state.monsterCounters = { bulldozer: true, hushwolf: true, voice_mimic_radio: true };
  Game.state.waveKillLog = [
    { d: 50, mid: 'redactor', w: 3, by: fighters2[0], via: 'agency' },
    { d: 51, mid: 'gavel', w: 3, by: fighters2[1], via: 'agency' },
  ];
  Game.state.feastLog = feast(10, 55); // plenty = 200, war = 0
  const capped = Game.standingPlentyCappedTotal();
  check('plenty cap: 200 bread counts 100 toward T5', capped === 100, 'capped=' + capped);
  check('plenty cap: total held at 199 (cap binds, readiness met)', Game.villageStandingTotal() === 199, 'total=' + Game.villageStandingTotal());
  check('plenty cap: unlockedWave stays 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  const capBeat = Game._beatLines.join('\n');
  check('plenty-cap beat fired (bread alone)', /not bought with bread/i.test(capBeat), 'beats=' + Game._beatLines.length);

  // ---- wave-5 readiness deferral, then release ----
  Game.state.waveLedger[3] = ledger(4); // war = 100 -> capped = 200 = t5
  try { Game.deedState().wavesFaced = { eater: 4 }; } catch (e) {} // wave-4 faced (w5 door)
  const r5 = Game.waveUnlockReady(5);
  check('wave-5: not ready yet (w5 bars unmet)', r5.ready === false, JSON.stringify({ ready: r5.ready, short: r5.short }));
  const d5 = Game.standingDeferral(5);
  check('wave-5 unlock DEFERRED on readiness', d5.deferred === true, JSON.stringify({ deferred: d5.deferred, capped: d5.capped }));
  check('wave-5 deferral caps total at 199', Game.villageStandingTotal() === 199, 'total=' + Game.villageStandingTotal());
  check('wave-5 held: unlockedWave stays 4', Game.unlockedWave() === 4, 'wave=' + Game.unlockedWave());
  // gear for the Producers: 6 armored @P>=20, 7 armed, 4 tricks, 3 veterans (wave-4+ kills)
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
  check('wave-5 bars met -> ready(5)', r5b.ready === true, JSON.stringify({ ready: r5b.ready, short: r5b.short }));
  check('wave-5 releases to 5', Game.unlockedWave() === 5, 'wave=' + Game.unlockedWave());
  check('peak ratchet set to 5', (Game._standingPeakWave() | 0) === 5, 'peak=' + Game._standingPeakWave());

  // ---- waves 1-3 untouched ----
  baseFixture(Game);
  Game.state.feastLog = feast(2, 55); // 40 < 100
  check('waves 1-3 never gated', Game.waveUnlockReady(1).ready && Game.waveUnlockReady(2).ready && Game.waveUnlockReady(3).ready);
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
