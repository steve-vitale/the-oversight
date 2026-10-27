#!/usr/bin/env node
// scripts/test-woundmill-gap.js — proof test for Triage A1 (2026-10-27):
// the risk-weighted MEET-finish rule. A raid defender who MEETS a beast
// already crippled finishes it ONLY when every risk leg holds; otherwise
// the fight ends exactly as today (rounds-0 mFlee).
//
// Legs (pre-registered in evidence/2026-10-27/sim-woundmill-gap.md §2):
//   cripple line: beast starts at or below 10% of max health (stricter
//     than the 0.25/0.15 break line); defender health >= 75% of max;
//     defender armed (weapon bonus > 0); beast alone (pack size 1);
//     beast's hardest single hit <= half the defender's current health;
//     raid scope only (opts.raid). A committed fight runs real rounds
//     and is decided by them — never a scripted kill.
// Fixtures (fresh Game per fixture, so trick observations from one
// fixture cannot leak into another):
//   M1 pass: raid, bulldozer at 4/90 HP, healthy armed defender -> rounds > 0
//   M2a decline, above cripple line: bulldozer at 18/90 (below the 0.25
//     break line, above the 0.10 cripple line) -> rounds-0 mFlee
//   M2b decline, hurt defender: health 50/100 -> rounds-0 mFlee
//   M2c decline, unarmed defender: no weapon -> rounds-0 mFlee
//   M2d decline, pack: hushwolf pack 3 at 5% -> rounds-0 mFlee
//   M2e decline, worst hit: gavel (top hit 55) vs 100-HP defender
//     (55 > 50) -> rounds-0 mFlee
//   M4a field unchanged: same as M1 but opts.raid unset -> rounds-0 mFlee
//   M4b drop unchanged: raid fight that STARTS healthy (90/90) and is
//     left to normal rounds — the rule must not convert it (it is
//     Stage-2 scope; here we only assert the pass fixture's gate does
//     not fire on a start-healthy beast, i.e. no meetFinish flag)
//   M3 not-scripted: gavel at 10% vs a 120-HP weakly-armed defender
//     across 8 RNG seeds — at least one non-vKill, or varying damage
//     taken across seeds (both prove rounds decide, not a script).
// Run: node scripts/test-woundmill-gap.js
'use strict';
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'woundmill-gap-proof' });
  await setupGame(Game);
  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) throw new Error('no non-scholar roster villager');
  return { Game, vid };
}
function arm(Game, vid, itemId) {
  const vp = (Game.data.villagers || []).find(p => p.id === vid)
    || (Game.data.background_survivors || []).find(p => p.id === vid);
  if (!vp) throw new Error('villager person record not found for ' + vid);
  vp.items = [{ itemId, units: 1 }];
  vp.equipped = { melee: { itemId } };
  return vp;
}
function disarm(Game, vid) {
  const vp = (Game.data.villagers || []).find(p => p.id === vid)
    || (Game.data.background_survivors || []).find(p => p.id === vid);
  if (!vp) throw new Error('villager person record not found for ' + vid);
  vp.items = [];
  vp.equipped = {};
  return vp;
}
function setHealth(Game, vid, hp) {
  Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[vid] = hp;
}
function mdefOf(Game, id) {
  const d = (Game.data.monsters || []).find(m => m.id === id);
  if (!d) throw new Error('monster def not found: ' + id);
  return d;
}
function entity(id, hp, maxHp) { return { id, hp, maxHp, tx: 0, ty: 0 }; }

async function main() {
  // M1 — gate passes: raid defender meets a crippled bulldozer.
  {
    const { Game, vid } = await freshGame(101);
    arm(Game, vid, 'hunting_spear');
    setHealth(Game, vid, 100);
    const rec = Game.fieldFight(vid, mdefOf(Game, 'bulldozer'), entity('bulldozer', 4, 90),
      { raid: true, rng: mulberry32(7) });
    ok('M1 pass fixture commits to real rounds', rec.rounds > 0,
      `outcome=${rec.outcome} rounds=${rec.rounds}`);
    ok('M1 pass fixture ends as a fight, not a phantom', rec.outcome !== 'mFlee' || rec.rounds > 0,
      `outcome=${rec.outcome} rounds=${rec.rounds}`);
    console.log(`     M1 detail: outcome=${rec.outcome} rounds=${rec.rounds} vTaken=${rec.vTaken} mDealt=${rec.mDealt} meetFinish=${!!rec.meetFinish}`);
  }
  // M2a — above the cripple line (20% < break 25% but > cripple 10%): decline.
  {
    const { Game, vid } = await freshGame(102);
    arm(Game, vid, 'hunting_spear');
    setHealth(Game, vid, 100);
    const rec = Game.fieldFight(vid, mdefOf(Game, 'bulldozer'), entity('bulldozer', 18, 90),
      { raid: true, rng: mulberry32(7) });
    ok('M2a above-cripple-line declines (rounds-0 mFlee)', rec.outcome === 'mFlee' && rec.rounds === 0,
      `outcome=${rec.outcome} rounds=${rec.rounds}`);
  }
  // M2b — hurt defender (50/100 = 50% < 75%): decline.
  {
    const { Game, vid } = await freshGame(103);
    arm(Game, vid, 'hunting_spear');
    setHealth(Game, vid, 50);
    const rec = Game.fieldFight(vid, mdefOf(Game, 'bulldozer'), entity('bulldozer', 4, 90),
      { raid: true, rng: mulberry32(7) });
    ok('M2b hurt defender declines (rounds-0 mFlee)', rec.outcome === 'mFlee' && rec.rounds === 0,
      `outcome=${rec.outcome} rounds=${rec.rounds}`);
  }
  // M2c — unarmed defender: decline.
  {
    const { Game, vid } = await freshGame(104);
    disarm(Game, vid);
    setHealth(Game, vid, 100);
    const rec = Game.fieldFight(vid, mdefOf(Game, 'bulldozer'), entity('bulldozer', 4, 90),
      { raid: true, rng: mulberry32(7) });
    ok('M2c unarmed defender declines (rounds-0 mFlee)', rec.outcome === 'mFlee' && rec.rounds === 0,
      `outcome=${rec.outcome} rounds=${rec.rounds}`);
  }
  // M2d — pack (hushwolf pack 3) at 5%: decline.
  {
    const { Game, vid } = await freshGame(105);
    arm(Game, vid, 'hunting_spear');
    setHealth(Game, vid, 100);
    const rec = Game.fieldFight(vid, mdefOf(Game, 'hushwolf'), entity('hushwolf', 3, 65),
      { raid: true, rng: mulberry32(7) });
    ok('M2d pack beast declines (rounds-0 mFlee)', rec.outcome === 'mFlee' && rec.rounds === 0,
      `outcome=${rec.outcome} rounds=${rec.rounds}`);
  }
  // M2e — worst hit 55 > half of 100: decline.
  {
    const { Game, vid } = await freshGame(106);
    arm(Game, vid, 'hunting_spear');
    setHealth(Game, vid, 100);
    const rec = Game.fieldFight(vid, mdefOf(Game, 'gavel'), entity('gavel', 30, 360),
      { raid: true, rng: mulberry32(7) });
    ok('M2e worst-hit-too-big declines (rounds-0 mFlee)', rec.outcome === 'mFlee' && rec.rounds === 0,
      `outcome=${rec.outcome} rounds=${rec.rounds}`);
  }
  // M4a — field (non-raid) meeting of a crippled beast: unchanged.
  {
    const { Game, vid } = await freshGame(107);
    arm(Game, vid, 'hunting_spear');
    setHealth(Game, vid, 100);
    const rec = Game.fieldFight(vid, mdefOf(Game, 'bulldozer'), entity('bulldozer', 4, 90),
      { rng: mulberry32(7) });
    ok('M4a field meeting unchanged (rounds-0 mFlee)', rec.outcome === 'mFlee' && rec.rounds === 0,
      `outcome=${rec.outcome} rounds=${rec.rounds}`);
  }
  // M4b — start-healthy raid beast: the meet gate must not fire.
  {
    const { Game, vid } = await freshGame(108);
    arm(Game, vid, 'hunting_spear');
    setHealth(Game, vid, 100);
    const rec = Game.fieldFight(vid, mdefOf(Game, 'bulldozer'), entity('bulldozer', 90, 90),
      { raid: true, rng: mulberry32(7) });
    ok('M4b start-healthy beast does not meet-finish', !rec.meetFinish,
      `outcome=${rec.outcome} rounds=${rec.rounds} meetFinish=${!!rec.meetFinish}`);
  }
  // M3 — committed fight decided by rounds, not scripted.
  {
    const outcomes = [];
    for (let s = 1; s <= 8; s++) {
      const { Game, vid } = await freshGame(200 + s);
      arm(Game, vid, 'sharpened_stick');
      setHealth(Game, vid, 120);
      const rec = Game.fieldFight(vid, mdefOf(Game, 'gavel'), entity('gavel', 36, 360),
        { raid: true, rng: mulberry32(s) });
      outcomes.push({ seed: s, outcome: rec.outcome, rounds: rec.rounds, vTaken: rec.vTaken });
    }
    console.log('     M3 detail: ' + JSON.stringify(outcomes));
    const nonKill = outcomes.filter(o => o.outcome !== 'vKill').length;
    const takenVaries = new Set(outcomes.map(o => o.vTaken)).size > 1;
    const committed = outcomes.filter(o => o.rounds > 0).length;
    ok('M3 committed fights run real rounds', committed === outcomes.length,
      `committed ${committed}/${outcomes.length}`);
    ok('M3 outcome not scripted (a non-kill, or varying damage taken)',
      nonKill > 0 || takenVaries,
      `nonKill=${nonKill} takenVaries=${takenVaries}`);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
