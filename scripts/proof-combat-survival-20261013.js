#!/usr/bin/env node
// proof-combat-survival-20261013.js — RED/GREEN mechanism proofs for the 6
// combat-survival fixes (audit 2026-10-13). Each section asserts the NEW
// behavior; on the pre-fix tree the assertions fail (RED), on the fixed tree
// they pass (GREEN). Seeded per MEASUREMENT.md §3; run on 7, 42, 99.
// Usage: SEED=7 node scripts/proof-combat-survival-20261013.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const SEED = parseInt(process.env.SEED || '7', 10);

let failures = 0, passes = 0;
function check(name, cond, detail) {
  if (cond) { passes++; console.log(`  PASS ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function section(name) { console.log(`\n[seed ${SEED}] ${name}`); }

function mkFight(Game, fighters, round) {
  Game.tbfight = {
    id: 'proof-' + SEED, fighters,
    order: fighters.map(f => f.key), turnIdx: 0, round: round || 1, over: false,
  };
}
function mkVillager(key, vid, opts) {
  return Object.assign({
    key, kind: 'villager', villagerId: vid, name: 'Vill' + key,
    mx: 2, my: 4, hp: 100, maxHp: 100, alive: true, fled: false,
    speed: 3, moveLeft: 3, acted: false, ai: 'brave', wbonus: 0,
  }, opts || {});
}
function mkMonster(Game, key, id, opts) {
  const mdef = (Game.data.monsters || []).find(m => m.id === id);
  if (!mdef) throw new Error('no mdef for ' + id);
  return Object.assign({
    key, kind: 'monster', monsterId: id, mdef, name: mdef.name || id,
    mx: 6, my: 4, hp: 100, maxHp: 100, alive: true, fled: false,
    speed: 3, moveLeft: 3, acted: false, telegraph: null,
    stunned: 0, hesitate: 0,
  }, opts || {});
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'combat-survival-proof' });
  await setupGame(Game, 'Columbus, Ohio');
  Game.say = () => {};
  const vids = (Game.state.village.roster || []).filter(r => r !== Game.villagerId);
  if (vids.length < 3) throw new Error('need 3+ villagers, have ' + vids.length);
  const S = globalThis.Scattering.combat;

  // ---------- P1: reactive flee floor ----------
  section('P1 reactive flee floor (burst-death gap)');
  {
    // Burst: brave villager 63/100 takes 51 — old code waits for their turn;
    // new code flees at damage time (12 HP left, one more 51-hit kills).
    const v = mkVillager('v0', vids[0], { hp: 63, ai: 'brave' });
    const m = mkMonster(Game, 'm0', 'hushwolf');
    v._dealt = 20; v._taken = 280; // hopeless trajectory (round 8)
    mkFight(Game, [v, m], 8);
    Game.tbDamage('v0', 51, 'gavel');
    check('burst hit below flee line → fled immediately', v.fled === true, `fled=${v.fled} hp=${v.hp}`);
  }
  {
    // Round 1 has no trajectory — the would-die-next-hit floor still fires.
    const v = mkVillager('v0', vids[0], { hp: 100, ai: 'brave' });
    const m = mkMonster(Game, 'm0', 'hushwolf');
    mkFight(Game, [v, m], 1);
    Game.tbDamage('v0', 70, 'gavel'); // 100 → 30 (< 0.4 line), 30 <= 70
    check('round-1 killable-next-hit → fled', v.fled === true, `fled=${v.fled} hp=${v.hp}`);
  }
  {
    // Control: WINNING fighter below the personality line holds to the 5%
    // floor — the reactive check doesn't break a winning line.
    const v = mkVillager('v0', vids[0], { hp: 100, ai: 'brave' });
    const m = mkMonster(Game, 'm0', 'hushwolf', { hp: 100, maxHp: 100 });
    v._dealt = 400; v._taken = 65; // winning: rtk=1, rtd=2.15
    mkFight(Game, [v, m], 5);
    Game.tbDamage('v0', 65, 'gavel'); // 100 → 35 (0.35 < 0.4 line) but winning
    check('winning fighter below line holds (5% floor)', v.fled === false, `fled=${v.fled} hp=${v.hp}`);
  }
  {
    // Control: chip damage above the flee line never flees.
    const v = mkVillager('v0', vids[0], { hp: 90, ai: 'brave' });
    const m = mkMonster(Game, 'm0', 'hushwolf');
    v._dealt = 20; v._taken = 280;
    mkFight(Game, [v, m], 8);
    Game.tbDamage('v0', 10, 'gavel'); // 90 → 80, above line
    check('above flee line → no flee', v.fled === false, `fled=${v.fled}`);
  }

  // ---------- P2: hopeless factor 0.6 → 0.85 ----------
  section('P2 hopeless factor (slow bleeds flee)');
  {
    // rtd/rtk = 0.7: old factor reads "fine" (0.7 > 0.6), new reads hopeless.
    const v = mkVillager('v0', vids[0], { hp: 196, maxHp: 200 });
    const m = mkMonster(Game, 'm0', 'hushwolf', { hp: 100, maxHp: 100 });
    v._dealt = 40; v._taken = 112; // 4 rounds: 10 dpr vs 28 dpr
    mkFight(Game, [v, m], 5);       // rtk=100/10=10, rtd=196/28=7 → 0.7
    check('slow bleed 0.7x reads hopeless', Game.tbVillagerHopeless(v) === true,
      `rtd/rtk=0.7 hopeless=${Game.tbVillagerHopeless(v)}`);
  }
  {
    // 0.95x stays non-hopeless — not everything flees.
    const v = mkVillager('v0', vids[0], { hp: 190, maxHp: 200 });
    const m = mkMonster(Game, 'm0', 'hushwolf', { hp: 100, maxHp: 100 });
    v._dealt = 40; v._taken = 80; // rtk=10, rtd=190/20=9.5 → 0.95
    mkFight(Game, [v, m], 5);
    check('near-even 0.95x stays non-hopeless', Game.tbVillagerHopeless(v) === false,
      `hopeless=${Game.tbVillagerHopeless(v)}`);
  }

  // ---------- P3a: field_medicine parity ----------
  section('P3a field_medicine in tactical');
  {
    const vid = vids[1];
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[vid] = ['field_medicine'];
    const v = mkVillager('v0', vid, { hp: 50, ai: 'brave' });
    const m = mkMonster(Game, 'm0', 'hushwolf');
    mkFight(Game, [v, m], 3);
    Game.tbVillagerTurn(v);
    check('medicated +20 (50→70)', v.hp === 70, `hp=${v.hp}`);
    check('once-per-fight flag set', v._fieldMedicated === true);
    delete Game.state.village.npcAbilities[vid];
  }
  {
    // Control: no ability → no heal, turn proceeds normally (strikes).
    const vid = vids[1];
    const v = mkVillager('v0', vid, { hp: 50, ai: 'brave' });
    const m = mkMonster(Game, 'm0', 'hushwolf');
    mkFight(Game, [v, m], 3);
    Game.tbVillagerTurn(v);
    check('no ability → no heal', v.hp === 50 && !v._fieldMedicated, `hp=${v.hp}`);
  }

  // ---------- P3b: war_cry parity ----------
  section('P3b war_cry in tactical');
  {
    const vid = vids[2];
    Game.state.village.npcAbilities = Game.state.village.npcAbilities || {};
    Game.state.village.npcAbilities[vid] = ['war_cry'];
    const v = mkVillager('v0', vid, { hp: 30, ai: 'brave' });
    const m = mkMonster(Game, 'm0', 'hushwolf', { hp: 200, maxHp: 200 });
    v._dealt = 10; v._taken = 100; // hopeless: rtk=80, rtd=1.2
    mkFight(Game, [v, m], 5);
    Game.tbVillagerTurn(v);
    check('war cry fires instead of fleeing', v.fled === false && v._warCried === true,
      `fled=${v.fled} _warCried=${v._warCried}`);
    check('monster hesitates (loses next attack)', (m.hesitate || 0) >= 1, `hesitate=${m.hesitate}`);
    delete Game.state.village.npcAbilities[vid];
  }
  {
    // Control: same setup, no ability → flees as before.
    const vid = vids[2];
    const v = mkVillager('v0', vid, { hp: 30, ai: 'brave' });
    const m = mkMonster(Game, 'm0', 'hushwolf', { hp: 200, maxHp: 200 });
    v._dealt = 10; v._taken = 100;
    mkFight(Game, [v, m], 5);
    Game.tbVillagerTurn(v);
    check('no war_cry → flees', v.fled === true, `fled=${v.fled}`);
  }

  // ---------- P4: monster fleeAt ----------
  section('P4 monster fleeAt wired');
  {
    const mdef = (Game.data.monsters || []).find(m => m.id === 'hushwolf');
    check('hushwolf mdef carries fleeAt 0.25', mdef && mdef.fleeAt === 0.25,
      `fleeAt=${mdef && mdef.fleeAt}`);
    const n12 = (Game.data.monsters || []).filter(m => m.fleeAt > 0).length;
    check('12 monsters.json entries carry fleeAt', n12 === 12, `count=${n12}`);
  }
  {
    // Tactical: belltoad (fleeAt 0.3, no preTurnHooks) at 20% HP flees.
    const _r = Math.random; Math.random = () => 0.5; // < 0.7, deterministic
    try {
      const m = mkMonster(Game, 'm0', 'belltoad', { hp: 20, maxHp: 100 });
      const p = { key: 'p', kind: 'player', mx: 4, my: 4, hp: 100, maxHp: 100, alive: true, speed: 3 };
      mkFight(Game, [p, m], 3);
      Game.tbMonsterTurn(m);
      check('wounded belltoad breaks and runs', m.fled === true, `fled=${m.fled}`);
    } finally { Math.random = _r; }
  }
  {
    // Fallback discriminator: ad-hoc mdef with NO monsters.json fleeAt and
    // NO preTurnHooks (id 'belltoad' → behaviors fleeAt 0.3). Old code reads
    // mdef.fleeAt=undefined → 0 → holds; new code falls back to the table.
    const _r = Math.random; Math.random = () => 0.5;
    try {
      const m = {
        key: 'm0', kind: 'monster', name: 'Belltoad',
        mdef: { id: 'belltoad', name: 'Belltoad' },
        mx: 6, my: 4, hp: 20, maxHp: 100, alive: true, fled: false,
        speed: 3, telegraph: null, stunned: 0, hesitate: 0,
      };
      const p = { key: 'p', kind: 'player', mx: 4, my: 4, hp: 100, maxHp: 100, alive: true, speed: 3 };
      mkFight(Game, [p, m], 3);
      let _threw = null;
      try { Game.tbMonsterTurn(m); } catch (e) { _threw = e; }
      check('ad-hoc mdef reads behaviors-table fleeAt fallback', m.fled === true && !_threw,
        `fled=${m.fled}${_threw ? ' threw=' + String(_threw).slice(0, 80) : ''}`);
    } finally { Math.random = _r; }
  }
  {
    // Characterization (not a discriminator): the sigW3c sponsor-creature
    // already fled via its sponsorCling hook when hostless — the fallback
    // changes nothing for it. Assert no behavior change.
    const _r = Math.random; Math.random = () => 0.5;
    try {
      const m = {
        key: 'm0', kind: 'monster', name: 'Sponsor-creature',
        mdef: { id: 'ad_sponsor', name: 'Sponsor-creature' },
        mx: 6, my: 4, hp: 30, maxHp: 40, alive: true, fled: false,
        speed: 1, telegraph: null, stunned: 0, hesitate: 0,
      };
      const p = { key: 'p', kind: 'player', mx: 4, my: 4, hp: 100, maxHp: 100, alive: true, speed: 3 };
      mkFight(Game, [p, m], 3);
      Game.tbMonsterTurn(m);
      check('ad_sponsor still flees hostless (hook, unchanged)', m.fled === true, `fled=${m.fled}`);
    } finally { Math.random = _r; }
  }
  {
    // Null-safety: a hostile fighter (no mdef) must not throw AT THE FLEE
    // LINE. (Deeper hostile-turn gaps are pre-existing and swallowed by the
    // turn loop's try/catch — out of scope; this asserts my line is safe.)
    const m = {
      key: 'h0', kind: 'hostile', name: 'Betrayer', mx: 6, my: 4,
      hp: 50, maxHp: 100, alive: true, fled: false, speed: 3,
      telegraph: null, stunned: 0, hesitate: 0,
    };
    const p = { key: 'p', kind: 'player', mx: 4, my: 4, hp: 100, maxHp: 100, alive: true, speed: 3 };
    mkFight(Game, [p, m], 3);
    let threw = null;
    try { Game.tbMonsterTurn(m); } catch (e) { threw = e; }
    const fleeThrow = threw && /fleeAt/.test(String((threw && threw.stack) || threw));
    check('hostile (mdef-less) does not throw at the flee line', !fleeThrow,
      threw ? String(threw).slice(0, 120) : '');
  }

  // ---------- P5: healer rounds <70 ----------
  section('P5 healer rounds threshold');
  {
    const [a, b] = [vids[0], vids[1]];
    const v = Game.state.village; v.health = v.health || {};
    v.health[a] = 60; v.health[b] = 90;
    const s = Game.state.scholar; s.healerRoundsDay = -1;
    const _ch = Game.campHealerName;
    Game.campHealerName = () => 'Healer';
    const treated = Game.healerRounds();
    check('villager at 60 HP gets rounds', treated === a && v.health[a] === 75,
      `treated=${treated} hp=${v.health[a]}`);
    Game.campHealerName = _ch;
  }

  // ---------- P6: helpful AI strikes ----------
  section('P6 helpful AI strikes when adjacent');
  {
    const f = { key: 'vf', kind: 'villager', mx: 4, my: 4, hp: 100, maxHp: 100, speed: 3, ai: 'helpful' };
    const foe = { key: 'm0', kind: 'monster', mx: 5, my: 4, alive: true, fled: false };
    const dec = S.villagerDecide(f, [f, foe], () => false, new Set());
    check('adjacent helpful → strike', dec.action.type === 'strike', `action=${dec.action.type}`);
  }
  {
    // Close-in (d=3): moves adjacent, then strikes.
    const f = { key: 'vf', kind: 'villager', mx: 4, my: 4, hp: 100, maxHp: 100, speed: 3, ai: 'helpful' };
    const foe = { key: 'm0', kind: 'monster', mx: 7, my: 4, alive: true, fled: false };
    const dec = S.villagerDecide(f, [f, foe], () => false, new Set());
    check('close-in helpful → strike', dec.action.type === 'strike', `action=${dec.action.type}`);
  }

  console.log(`\n[seed ${SEED}] ${passes} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
