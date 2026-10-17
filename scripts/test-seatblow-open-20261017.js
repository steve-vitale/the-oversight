#!/usr/bin/env node
// scripts/test-seatblow-open-20261017.js — proof for sim-seatblow-open.
//
// Steve 2026-10-17 decision #441/#445 ("Food deeds: open the gate"): the
// tbDamage _ps gate opens — a villager fighter's own blow carries
// FEASTED/OVERCHARGE when the village is feasted/fueled, and banks the
// food-thesis deed (feastSurgeUsed, recorded as feastSurgeBy='v:<rid>').
//
// RED  (SEATBLOW_ROOT=<pristine control tree>): villager blows get no
//       uplift and never mark the deed.
// GREEN (default SEATBLOW_ROOT=this tree): uplift lands, narration names
//       the striker, the deed banks to the villager. Scholar path unchanged.
//
//   SEATBLOW_ROOT=~/workspace/worktrees/sim-seatblow-ctl node scripts/test-seatblow-open-20261017.js  # RED
//   node scripts/test-seatblow-open-20261017.js                                                       # GREEN
'use strict';
const path = require('path');
const ROOT = process.env.SEATBLOW_ROOT || path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(ROOT, 'scripts/sim-harness'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (!cond) { fail++; console.error('FAIL: ' + name + (extra ? ' — ' + extra : '')); return; }
  pass++;
  console.log('ok: ' + name);
}

// Fixture: a live tbfight with a hostile target and one striker.
// kind 'hostile' targets skip monster-specific hooks, isolating the
// feasted/overcharge hook under test.
async function fixture({ feasted, hunger, sourceKind, targetKind, mult }) {
  const { Game } = await loadGame({ seed: 4242, mode: 'seatblow-fixture' });
  await setupGame(Game);
  const lines = [];
  const _say = Game.say;
  Game.say = function (m) { lines.push(String(m)); try { return _say.apply(this, arguments); } catch (e) {} };
  const s = Game.state.scholar;
  s.day = 10;
  s.prog = s.prog || {};
  s.prog.feastSurge = !!feasted; // devotion armed
  s.feastBuff = feasted ? { untilDay: 12, mult: mult || 2.03, used: false } : null;
  // Fuel environment: a secure village; the striker's own belly is set per-case.
  Game.villageFoodTier = () => 'secure';
  const vid = 'vtest';
  Game.npcNeeds(vid).hunger = hunger;
  const src = sourceKind === 'p'
    ? { key: 'p', kind: 'player', name: 'you', alive: true, hp: 80, maxHp: 100 }
    : sourceKind === 'ally'
      ? { key: 'a_1', kind: 'ally', name: 'Rook', alive: true, hp: 60, maxHp: 60 }
      : { key: 'v_test', kind: 'villager', villagerId: vid, name: 'Mira', alive: true, hp: 60, maxHp: 60 };
  const tgt = { key: 'h_0', kind: targetKind || 'hostile', alive: true, hp: 200, maxHp: 200 };
  Game.tbfight = { over: false, fighters: [src, tgt] };
  return { Game, lines, vid };
}

async function blow(Game, srcKey, dmg) {
  const src = Game.tbFighter(srcKey);
  const label = srcKey === 'p' ? 'you' : (src ? src.name : srcKey);
  let landed = 0;
  await quietLog(async () => { landed = Game.tbDamage('h_0', dmg, label, srcKey === 'p' && label === 'you' ? null : srcKey, { quiet: true }); });
  return landed;
}

(async () => {
  const ARMED = !process.env.SEATBLOW_ROOT || !/seatblow-ctl/.test(process.env.SEATBLOW_ROOT);
  console.log('tree: ' + ROOT + ' (' + (ARMED ? 'ARMED/expect-open' : 'CONTROL/expect-closed') + ')');

  // 1. Villager feasted blow — the opened gate.
  {
    const { Game, lines } = await fixture({ feasted: true, hunger: 10, sourceKind: 'villager' });
    const exp = Game.feastedMult();
    const landed = await blow(Game, 'v_test', 10);
    const s = Game.state.scholar;
    if (ARMED) {
      ok('villager feasted blow uplifted', landed === Math.round(10 * exp), `landed=${landed} exp=${Math.round(10 * exp)}`);
      ok('narration names the striker', lines.some(l => /FEASTED/.test(l) && /Mira's blow carries the feast/.test(l)), JSON.stringify(lines.filter(l => /FEASTED|OVERCHARGED/.test(l))));
      ok('deed banks to the villager', s.prog.feastSurgeUsed === true && s.prog.feastSurgeBy === 'v:vtest', `used=${s.prog.feastSurgeUsed} by=${s.prog.feastSurgeBy}`);
      ok('devotion spent once (idempotent)', s.prog.feastSurge === false, `feastSurge=${s.prog.feastSurge}`);
    } else {
      ok('RED: villager feasted blow NOT uplifted', landed === 10, `landed=${landed}`);
      ok('RED: deed NOT marked by villager blow', s.prog.feastSurgeUsed !== true, `used=${s.prog.feastSurgeUsed}`);
      ok('RED: no feasted narration for villager', !lines.some(l => /FEASTED/.test(l) && /Mira/.test(l)));
    }
  }

  // 2. Scholar path unchanged (regression guard on both trees).
  {
    const { Game, lines } = await fixture({ feasted: true, hunger: 10, sourceKind: 'p' });
    const exp = Game.abilityPowerMult();
    const landed = await blow(Game, 'p', 10);
    const s = Game.state.scholar;
    ok('scholar feasted blow uplifted (unchanged)', landed === Math.round(10 * exp), `landed=${landed} exp=${Math.round(10 * exp)}`);
    ok('scholar narration unchanged', lines.some(l => l === `FEASTED ×${exp}: the feast was the weapon.`), JSON.stringify(lines.filter(l => /FEASTED/.test(l))));
    ok('scholar banks deed as p', s.prog.feastSurgeUsed === true && (s.prog.feastSurgeBy === 'p' || s.prog.feastSurgeBy === undefined), `by=${s.prog.feastSurgeBy}`);
  }

  // 3. Kind 'ally' stays out of the gate (not at the village feast).
  {
    const { Game, lines } = await fixture({ feasted: true, hunger: 10, sourceKind: 'ally' });
    const landed = await blow(Game, 'a_1', 10);
    const s = Game.state.scholar;
    if (ARMED) {
      ok('ally blow NOT uplifted (excluded)', landed === 10, `landed=${landed}`);
      ok('ally blow does NOT bank the deed', s.prog.feastSurgeUsed !== true);
    } else {
      ok('RED: ally blow NOT uplifted', landed === 10, `landed=${landed}`);
    }
  }

  // 4. Villager vs villager target — the target check still excludes.
  {
    const { Game } = await fixture({ feasted: true, hunger: 10, sourceKind: 'villager', targetKind: 'villager' });
    const landed = await blow(Game, 'v_test', 10);
    ok('villager blow vs villager target NOT uplifted', landed === 10, `landed=${landed}`);
  }

  // 5. Villager overcharge — the striker's own belly, not the scholar's bank.
  {
    const { Game, lines } = await fixture({ feasted: false, hunger: 10, sourceKind: 'villager' });
    const landed = await blow(Game, 'v_test', 10);
    const s = Game.state.scholar;
    if (ARMED) {
      ok('well-fed villager blow overcharged x1.25', landed === Math.round(10 * 1.25), `landed=${landed}`);
      ok('overcharge narration names the striker', lines.some(l => /OVERCHARGED ×1\.25/.test(l) && /Mira fights on a full belly/.test(l)), JSON.stringify(lines.filter(l => /OVERCHARGED/.test(l))));
      ok('overcharge does NOT mark the deed', s.prog.feastSurgeUsed !== true);
    } else {
      ok('RED: villager overcharge absent', landed === 10, `landed=${landed}`);
    }
  }

  // 6. Hungry villager — no fuel, no uplift.
  {
    const { Game } = await fixture({ feasted: false, hunger: 90, sourceKind: 'villager' });
    const landed = await blow(Game, 'v_test', 10);
    ok('hungry villager blow NOT uplifted', landed === 10, `landed=${landed}`);
  }

  // 7. Second feasted blow after the mark — idempotent, no error, no re-mark.
  if (ARMED) {
    const { Game } = await fixture({ feasted: true, hunger: 10, sourceKind: 'villager' });
    await blow(Game, 'v_test', 10);
    const first = Game.state.scholar.prog.feastSurgeBy;
    const landed2 = await blow(Game, 'v_test', 10);
    ok('second feasted blow still uplifted', landed2 === Math.round(10 * Game.feastedMult()), `landed2=${landed2}`);
    ok('deed mark not overwritten', Game.state.scholar.prog.feastSurgeBy === first, `by=${Game.state.scholar.prog.feastSurgeBy}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
