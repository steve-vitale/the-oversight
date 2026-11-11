#!/usr/bin/env node
// sortie-damage-break-fixture.js — ONE harness per process (never two
// harnesses in one node process). Child worker for
// scripts/test-journey-crisis-r180-fight1-damage.js (Q4 isolation).
// Usage: node scripts/sortie-damage-break-fixture.js <seed> <case>
// Cases: heavyKill | heavyFlee | lightFlee | heavyDie
//
// Q4 (crisis r180 prereg): the r155 frame said a sortie "breaks open on a
// death/flee OR vTaken >= ~70". Code read (havenGrowth.js lingererSortie)
// shows broke=true ONLY in the vFlee and vDie branches — no vTaken clause.
// The panel correlation is a shadow of fieldFight's own HP-fraction break
// line (a badly hurt fighter flees; the flee breaks the sortie). This
// fixture isolates the LOOP rule: stub Game.fieldFight so fight 1 returns
// a vKill/mFlee with vTaken 90 and see whether the sortie still fights
// lingerer 2. The stub seals a real damage settlement
// (Game.sealDamageResult) so hurtVillager applies the damage for real —
// the leader fights fight 2 wounded, exactly as the live code does.
// Prints exactly one JSON line to stdout.
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const seed = parseInt(process.argv[2], 10);
const kase = process.argv[3];

function day(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function leaderHp(Game, vid) {
  try {
    const v = Game.state.village || {};
    if (vid === Game.villagerId) return (Game.state.scholar || {}).health || 100;
    return (v.health && v.health[vid] !== undefined) ? v.health[vid] : 100;
  } catch (e) { return 100; }
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  if (loadFails && loadFails.length) { console.log(JSON.stringify({ error: 'loadFails: ' + loadFails.join('; ') })); return; }
  await setupGame(Game, 'Columbus, Ohio');
  const out = { seed, case: kase, day: day(Game) };
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;

  // Two weak lingerers, same construction as sortietarget-fixture.js.
  const all = (Game.data.monsters || []).filter(d => d && d.id && Array.isArray(d.hp));
  const weak = all.filter(d => (d.hp[0] || 99) <= 30).sort((a, b) => (a.hp[0] || 99) - (b.hp[0] || 99));
  if (weak.length < 2) { console.log(JSON.stringify(Object.assign(out, { error: 'not enough weak defs: ' + weak.length }))); return; }
  const world = Game.worldMonsters();
  const defs = weak.slice(0, 2);
  const entities = defs.map(d => {
    const m = { id: d.id, tx: hx, ty: hy, mx: 0, my: 0, hp: 3, maxHp: 3,
      lingering: true, lingerSince: day(Game), wave: d.wave || 1 };
    world.push(m);
    return m;
  });
  const raiders = Game.lingeringRaiders();
  if (raiders.length < 2) { console.log(JSON.stringify(Object.assign(out, { error: 'only ' + raiders.length + ' raiders' }))); return; }
  out.raiderIds = raiders.map(m => m.id);

  // Muster leader: needs >= 2 fighters (the sortie gate). Give the leader
  // a full 100 HP so a sealed 90-damage hit leaves them alive at 10.
  let muster = [];
  try { muster = Game._musterAway ? Game._musterAway(3, 'defense') : []; } catch (e) { muster = []; }
  if (muster.length < 2) { console.log(JSON.stringify(Object.assign(out, { error: 'muster too small: ' + muster.length }))); return; }
  const leader = muster[0];
  out.leader = leader;
  out.leaderHpBefore = leaderHp(Game, leader);
  try { (Game.state.village.health = Game.state.village.health || {})[leader] = 100; } catch (e) {}
  out.leaderHpBefore = 100;

  // Scripted outcomes per case: [fight1, fight2]. vTaken is sealed with
  // the leader's CURRENT hp at stub-call time, so hurtVillager applies it.
  const SCRIPT = {
    heavyKill: [{ outcome: 'vKill', vTaken: 90 }, { outcome: 'vKill', vTaken: 5 }],
    heavyFlee: [{ outcome: 'mFlee', vTaken: 90 }, { outcome: 'vKill', vTaken: 0 }],
    lightFlee: [{ outcome: 'vFlee', vTaken: 4 }],
    heavyDie: [{ outcome: 'vDie', vTaken: 90 }],
  };
  const script = SCRIPT[kase];
  if (!script) { console.log(JSON.stringify(Object.assign(out, { error: 'unknown case ' + kase }))); return; }
  let call = 0;
  const origFieldFight = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    const step = script[Math.min(call, script.length - 1)];
    call++;
    const rec = { outcome: step.outcome, vTaken: step.vTaken, mDealt: 0,
      rounds: 1, vHpLeft: null, mHpLeft: 0, vTakenP4: step.vTaken, allyTaken: 0, allyDealt: 0 };
    // Seal the damage the way a real fieldFight does (sealDamageResult),
    // so hurtVillager consumes a real once-only settlement. Start is the
    // leader's live HP at this call; end is start minus the damage.
    try {
      const cur = leaderHp(Game, vid);
      const end = Math.max(0, cur - step.vTaken);
      Game.sealDamageResult(rec, [[vid, step.vTaken, { start: cur, end }]]);
    } catch (e) { out.sealError = String(e && e.message || e).slice(0, 120); }
    return rec;
  };

  let ret = null;
  try { ret = Game.answerLingerer('sortie'); } catch (e) { out.sortieError = String(e && e.stack || e).slice(0, 300); }
  Game.fieldFight = origFieldFight;
  out.ret = ret;
  out.fightCalls = call;
  out.leaderHpAfter = leaderHp(Game, leader);
  out.leaderAlive = (() => { try { const vp = Game.vpOf(leader); return !!(vp && !vp.dead); } catch (e) { return null; } })();
  console.log(JSON.stringify(out));
}

main().catch(e => { console.log(JSON.stringify({ error: String((e && e.stack) || e).slice(0, 500) })); });
