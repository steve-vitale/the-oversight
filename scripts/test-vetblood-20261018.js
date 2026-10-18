#!/usr/bin/env node
// test-vetblood-20261018.js — proof for the vetblood policy layer
// (flesh-out loop arm sim-vetblood, 2026-10-18, scale-onramp axis).
// POLICY-SIDE ONLY: proves scripts/policies/vetblood.js, never touches
// src/js. Fixtures stub Game.unlockedWave / TB surface (documented); the
// det-gate and smoke run the real engine.
//
// (a) MECHANISM (in-process fixtures on a real harness game):
//     gate-off purity (daily/fight delegate, zero ctx writes); blood-list
//     ordering (tier 0 > tier 2 > tier 3; scholar excluded; dead excluded);
//     staffing invites the blood-list head through the real verb; steering
//     decisions (candidate engaged + near-death -> yield; not near-death /
//     candidate hurt / no candidate / gate off -> base combat); yield bounds
//     (6-turn cap, 2-turn stall cut).
// (b) DET-GATE: VETBLOOD unset => vetblood-lead/belong byte-identical to
//     the tribfloor base on fixed seeds (pure delegation).
// (c) SMOKE: VETBLOOD=1 short run drives without errors.
// Usage: node scripts/test-vetblood-20261018.js
'use strict';
// POST-KILL INFO-SKIP: the vetblood layer was deleted per the kill protocol
// (KILLED-AT-PILOT, engagement 2/16 < 4/16 bar, 2026-10-18), so this proof
// has nothing to prove. Exit 0 instead of crashing on the missing module.
const fs = require('fs'), path = require('path');
if (!fs.existsSync(path.join(__dirname, 'policies', 'vetblood.js'))) {
  console.log('INFO-SKIP: test-vetblood-20261018.js — layer deleted per kill protocol (KILLED-AT-PILOT 2026-10-18); proof vacuous.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const TF = require('./policies/tribfloor');
const VB = require('./policies/vetblood');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function pickVillager(Game, skip) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id && id !== Game.villagerId && id !== skip);
  for (const id of roster) {
    let vp = null;
    try { vp = Game.vpOf(id); } catch (e) {}
    if (vp && !vp.dead) return id;
  }
  return null;
}
function makeVeteran(Game, vid, n) {
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  for (let i = 0; i < (n || 1); i++) {
    Game.state.waveKillLog.push({ d: 60 + i, mid: 'redactor', w: 3, by: vid, via: 'companion', trick: null });
  }
}
function setTrust(Game, vid, t) {
  try { Game.state.village.trust[vid] = t; } catch (e) {}
}
function partyAdd(Game, vid) {
  try { const ps = Game.partyState(); ps.party = ps.party || []; if (!ps.party.includes(vid)) ps.party.push(vid); return true; }
  catch (e) { return false; }
}
async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'vetblood-proof' });
  await setupGame(Game);
  return Game;
}
// Fake TB surface for steering fixtures. Returns restore().
function stubTB(Game, opts) {
  const o = opts || {};
  const p = { key: 'p', kind: 'player', hp: o.php != null ? o.php : 80, maxHp: 100, alive: true };
  const cand = { key: 'v0', kind: 'villager', villagerId: o.candId, hp: o.chp != null ? o.chp : 70, maxHp: 100, alive: true };
  const mon = { key: 'm0', kind: 'monster', monsterId: 'redactor', hp: o.mhp != null ? o.mhp : 30, maxHp: 300, alive: true };
  const f = { over: false, round: 3, fighters: o.noCand ? [p, mon] : [p, cand, mon] };
  const orig = { tbfight: Game.tbfight, tbIsPlayerTurn: Game.tbIsPlayerTurn, tbFighter: Game.tbFighter, tbPlayerWait: Game.tbPlayerWait, partyMembers: Game.partyMembers, unlockedWave: Game.unlockedWave };
  let waits = 0;
  Game.tbfight = f;
  Game.tbIsPlayerTurn = function () { return true; };
  Game.tbFighter = function (k) { return k === 'p' ? p : null; };
  Game.tbPlayerWait = function () { waits++; p.acted = true; p.moveLeft = 0; return true; };
  Game.partyMembers = function () { return o.noCand ? [] : [o.candId]; };
  Game.unlockedWave = function () { return 3; };
  return {
    waits: () => waits, mon, cand, p,
    restore() {
      Game.tbfight = orig.tbfight; Game.tbIsPlayerTurn = orig.tbIsPlayerTurn;
      Game.tbFighter = orig.tbFighter; Game.tbPlayerWait = orig.tbPlayerWait;
      Game.partyMembers = orig.partyMembers; Game.unlockedWave = orig.unlockedWave;
    },
  };
}

async function main() {
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRIBFLOOR = '1';
  process.env.SUCCGRACE = '1';
  process.env.RAIDDENSITY = '1';
  process.env.SEATDRIVE = '0';
  process.env.NODEWITNESS = '1';
  delete process.env.VETREL;
  delete process.env.VETBLOOD; // gate OFF first; fixtures toggle it on

  console.log('== (a) MECHANISM fixtures ==');
  // A1. Gate-off purity: daily/fight delegate with zero ctx writes.
  {
    const Game = await newGame(9401);
    const seen = [];
    const recBase = Object.assign({}, TF.leadfeast, {
      daily(G, c) { seen.push('daily'); },
      fight(G, c) { seen.push('fight'); return true; },
    });
    const pol = VB.withVetblood(recBase, 'vb-test', 'test');
    const ctx = {};
    pol.daily(Game, ctx);
    pol.fight(Game, ctx);
    check('gate-off daily delegates to base', seen.join(',') === 'daily,fight', seen.join(','));
    check('gate-off daily writes no vetblood ctx keys', !Object.keys(ctx).some(k => /vetblood|_vb/i.test(k)), JSON.stringify(Object.keys(ctx)));
  }
  // A2. Blood-list ordering: tier 0 (proven) > tier 2 (armored) > tier 3.
  {
    const Game = await newGame(9402);
    const vA = pickVillager(Game); const vB = pickVillager(Game, vA); const vC = pickVillager(Game, vA === vB ? vA : undefined);
    makeVeteran(Game, vA, 2); // tier 0: blooded, village record >= 2
    const list = VB.bloodList(Game);
    check('fixture has 3 villagers', !!(vA && vB && vC), `${vA},${vB},${vC}`);
    check('proven killer heads the blood list (tier 0)', list.length && list[0].id === vA && list[0].tier === 0,
      JSON.stringify(list.slice(0, 3).map(c => [String(c.id).slice(0, 8), c.tier])));
    check('scholar excluded from the blood list', !list.some(c => c.id === Game.villagerId), '');
    check('dead excluded from the blood list', list.every(c => {
      const h = ((Game.state.village || {}).health || {})[c.id];
      return !(typeof h === 'number' && h <= 0);
    }), '');
  }
  // A3. Staffing: invites the blood-list head through the real verb.
  {
    process.env.VETBLOOD = '1';
    const Game = await newGame(9403);
    const vA = pickVillager(Game); makeVeteran(Game, vA, 1); setTrust(Game, vA, 50);
    const origUW = Game.unlockedWave;
    Game.unlockedWave = function () { return 3; }; // wave-3 unlocked (documented stub)
    const origWR = Game.waveCombatReadiness;
    Game.waveCombatReadiness = function () { return { veterans: 0, demand: { veterans: 1 }, short: ['veterans'] }; }; // bar unmet (documented stub)
    const invited = [];
    let oks = 0;
    const origInvite = Game.inviteToParty;
    Game.inviteToParty = function (id) { invited.push(id); const r = origInvite.call(Game, id); if (r && r.ok) oks++; return r; };
    const ctx = {};
    VB.staffingProtocol(Game, ctx);
    Game.inviteToParty = origInvite; Game.unlockedWave = origUW; Game.waveCombatReadiness = origWR;
    check('staffing invites the blood-list head', invited.includes(vA), JSON.stringify(invited.map(String).map(s => s.slice(0, 8))));
    check('staffing records accepted invites (0 on honest refusal)', (ctx.vetbloodStaff | 0) === oks,
      `staff=${ctx.vetbloodStaff} oks=${oks} (a refusal is the verb's honest answer)`);
    delete process.env.VETBLOOD;
  }
  // A4. Steering GREEN: candidate engaged + near-death -> scholar holds.
  {
    process.env.VETBLOOD = '1';
    const Game = await newGame(9404);
    const vA = pickVillager(Game); makeVeteran(Game, vA, 1); setTrust(Game, vA, 50);
    partyAdd(Game, vA);
    const tb = stubTB(Game, { candId: vA, mhp: 30, chp: 70, php: 80 }); // 10% — near-death
    let baseCalled = false;
    const recBase = Object.assign({}, TF.leadfeast, { fight(G, c) { baseCalled = true; return true; } });
    const pol = VB.withVetblood(recBase, 'vb-test', 'test');
    const ctx = {};
    const r = pol.fight(Game, ctx);
    const ok = tb.waits() === 1 && !baseCalled && r === true && ctx._huntCommit === true && (ctx.vetYields | 0) === 1;
    check('steering yields the killing blow (near-death + healthy candidate)', ok,
      `waits=${tb.waits()} base=${baseCalled} yields=${ctx.vetYields}`);
    tb.restore();
    delete process.env.VETBLOOD;
  }
  // A5. Steering RED cases: not near-death / candidate hurt / no candidate / gate off -> base combat.
  {
    process.env.VETBLOOD = '1';
    const Game = await newGame(9405);
    const vA = pickVillager(Game); makeVeteran(Game, vA, 1); setTrust(Game, vA, 50);
    partyAdd(Game, vA);
    async function runCase(name, tbOpts, gateOn, expectBase) {
      if (gateOn) process.env.VETBLOOD = '1'; else delete process.env.VETBLOOD;
      const tb = stubTB(Game, Object.assign({ candId: vA }, tbOpts));
      let baseCalled = false;
      const recBase = Object.assign({}, TF.leadfeast, { fight(G, c) { baseCalled = true; return true; } });
      const pol = VB.withVetblood(recBase, 'vb-test', 'test');
      const ctx = {};
      pol.fight(Game, ctx);
      const ok = (baseCalled === expectBase) && (gateOn ? true : tb.waits() === 0);
      check(name, ok, `base=${baseCalled} waits=${tb.waits()}`);
      tb.restore();
    }
    await runCase('RED: monster not near-death -> base combat', { mhp: 200, chp: 70 }, true, true);
    await runCase('RED: candidate hurting -> escort fights (rescue)', { mhp: 30, chp: 30 }, true, true);
    await runCase('RED: candidate not in fight -> no steering', { mhp: 30, noCand: true }, true, true);
    await runCase('RED: gate off -> pure delegation', { mhp: 30, chp: 70 }, false, true);
    process.env.VETBLOOD = '1';
  }
  // A6. Yield bounds: 6-turn cap and 2-turn stall cut.
  {
    process.env.VETBLOOD = '1';
    const Game = await newGame(9406);
    const vA = pickVillager(Game); makeVeteran(Game, vA, 1); setTrust(Game, vA, 50);
    partyAdd(Game, vA);
    // Cap: monster keeps taking damage (hp drops each yield).
    {
      const tb = stubTB(Game, { candId: vA, mhp: 30, chp: 70 });
      const recBase = Object.assign({}, TF.leadfeast, { fight() { return true; } });
      const pol = VB.withVetblood(recBase, 'vb-test', 'test');
      const ctx = {};
      for (let i = 0; i < 8; i++) { tb.mon.hp = Math.max(1, 30 - i * 5); pol.fight(Game, ctx); }
      check('yield capped at 6 turns per fight', tb.waits() === 6, `waits=${tb.waits()}`);
      tb.restore();
    }
    // Stall: monster takes no damage -> stops after 2 stalled turns.
    {
      const tb = stubTB(Game, { candId: vA, mhp: 30, chp: 70 });
      const recBase = Object.assign({}, TF.leadfeast, { fight() { return true; } });
      const pol = VB.withVetblood(recBase, 'vb-test', 'test');
      const ctx = {};
      for (let i = 0; i < 5; i++) { tb.mon.hp = 30; pol.fight(Game, ctx); }
      check('yield stops on 2-turn stall', tb.waits() === 2, `waits=${tb.waits()}`);
      tb.restore();
    }
    delete process.env.VETBLOOD;
  }

  console.log('== (b) DET-GATE (gate off => byte-identical to tribfloor base) ==');
  {
    const seeds = [9311, 9312];
    const pairs = [['lead', TF.leadfeast, VB.vetbloodLead], ['belong', TF.belongfeast, VB.vetbloodBelong]];
    let green = 0, total = 0;
    for (const seed of seeds) {
      for (const [pname, basePol, vbPol] of pairs) {
        total++;
        const hashes = {};
        for (const [tag, pol] of [['base', basePol], ['vb', vbPol]]) {
          delete process.env.VETBLOOD;
          const { Game } = await loadGame({ seed, mode: 'vetblood-det' });
          await setupGame(Game);
          const hs = [];
          const wrapped = Object.assign({}, pol, {
            daily(G, ctx) { hs.push(G.state.scholar.day + ':' + dayHash(G)); return pol.daily(G, ctx); },
          });
          await quietLog(async () => runDays(Game, wrapped, { days: 60 }));
          hashes[tag] = hs.join('\n');
        }
        const same = hashes.base === hashes.vb;
        if (same) green++;
        check(`gate-off byte-identical [${pname} seed ${seed}]`, same, same ? '' : 'trajectories diverged');
      }
    }
    check('det-gate all green', green === total, `${green}/${total}`);
  }

  console.log('== (c) SMOKE (gate on, short run) ==');
  {
    process.env.VETBLOOD = '1';
    const { Game } = await loadGame({ seed: 9321, mode: 'vetblood-smoke' });
    await setupGame(Game);
    let result = null, err = null;
    try {
      await quietLog(async () => { result = await runDays(Game, VB.vetbloodLead, { days: 45 }); });
    } catch (e) { err = e; }
    check('45d gate-on run completes without errors', !err && !!result, err ? String(err && err.message) : '');
    delete process.env.VETBLOOD;
  }

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
