#!/usr/bin/env node
// test-vgearbeats.js — proof for scripts/policies/vgearbeats.js
// (flesh-out loop, 2026-10-20, arm sim-vgearbeats, axis scale-onramp,
// named next #699 of sim-villagergear).
//
// RED->GREEN on the narration layer:
//   A1 gate honesty: VGEARBEATS unset -> pure delegation (no _vgBeats ctx
//      keys, no hook install, no say calls).
//   A2 beats require VGEAR: VGEARBEATS=1 but VGEAR unset -> pure delegation
//      (the beats narrate the layer; without it they are silent).
//   B1 donation beat fires on a layer donation, naming the weapon.
//   B2 same arming-epoch donation -> no repeat (the raidgarrison lesson).
//   B3 new epoch (restock then deplete) -> beats again.
//   B4 rate cap: one donation beat per day max.
//   B5 failed donation (counter unmoved) -> no beat.
//   C1 invite beat fires on a layer invite, naming the villager.
//   C2 same (episode, villager) -> no repeat.
//   C3 rate cap: one invite beat per day max.
//   C4 new staging episode -> same villager beats again.
//   D1 yield beat fires on the first hold turn of a fight, naming the
//      companion.
//   D2 same fight, second yield turn -> no repeat.
//   D3 new fight -> beats again.
//   E1 no RNG draws in the narration path (Math.random poisoned -> beats
//      still fire; the kinresolve-det lesson).
//   E2 no game-state writes (Game.state JSON byte-identical across beats;
//      say writes Game.log, the text stream, only).
//   F det-gate (real harness): VGEAR=1, beats on vs off -> per-day
//      trajectory hashes byte-identical (2 seeds x 60d); beats-on
//      deterministic across re-runs.
//   G the 180d measurement corpus lives in
//      scripts/sweep-vgearbeats-20261020.js (4 fresh seeds x 2 policies x
//      beats on/off): coverage, neutrality, wall numbers.
// Usage: node scripts/test-vgearbeats.js
'use strict';
const fs = require('fs');
const path = require('path');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (VGEARBEATS_KILLED=1 set
// by the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1).
if (!fs.existsSync(path.join(__dirname, 'policies', 'vgearbeats.js'))) {
  if (process.env.VGEARBEATS_KILLED === '1') {
    console.log('INFO-SKIP: vgearbeats layer deleted per kill protocol (sim-vgearbeats NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/vgearbeats.js missing and VGEARBEATS_KILLED not set.');
  process.exit(1);
}

const VB = require('./policies/vgearbeats');
const VG = require('./policies/villagergear');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

const OLD_ENV = { VGEAR: process.env.VGEAR, VGEARBEATS: process.env.VGEARBEATS };
function setEnv(vgear, beats) {
  if (vgear) process.env.VGEAR = '1'; else delete process.env.VGEAR;
  if (beats) process.env.VGEARBEATS = '1'; else delete process.env.VGEARBEATS;
}
function restoreEnv() {
  if (OLD_ENV.VGEAR === undefined) delete process.env.VGEAR; else process.env.VGEAR = OLD_ENV.VGEAR;
  if (OLD_ENV.VGEARBEATS === undefined) delete process.env.VGEARBEATS; else process.env.VGEARBEATS = OLD_ENV.VGEARBEATS;
}

// Mock Game: just enough surface for the beats layer (pure reads +
// say + the two verbs). The mock donateWeapon honestly removes the item.
function mockGame(opts) {
  opts = opts || {};
  const sayLines = [];
  const inv = (opts.inventory || []).map(it => Object.assign({}, it));
  const g = {
    state: {
      scholar: { day: opts.day || 1, inventory: inv },
      village: { roster: opts.roster || [] },
    },
    data: { items: opts.itemDefs || [] },
    log: [],
    say(t) { sayLines.push(String(t)); },
    _sayLines: sayLines,
    stashState() { return { weapons: opts.armory || [] }; },
    donateWeapon(idx) {
      const sInv = g.state.scholar.inventory;
      if (typeof idx !== 'number' || !sInv[idx]) return null;
      sInv.splice(idx, 1);
      return { ok: true };
    },
    getPerson(vid) {
      const nm = (opts.names || {})[vid];
      return nm ? { name: nm } : null;
    },
    displayName(vid) {
      const nm = (opts.names || {})[vid];
      return nm || vid;
    },
    unlockedWave() { return opts.wave || 1; },
    waveCombatReadiness() {
      return opts.readiness || { veterans: 0, demand: { veterans: 2 }, short: [] };
    },
    partyMembers() { return opts.party || []; },
    tbfight: null,
  };
  return g;
}
const ITEM_DEFS = [
  { id: 'stone_knife', name: 'stone knife' },
  { id: 'hunting_spear', name: 'hunting spear' },
];
function beatsCtx() { return {}; }

// A base policy whose daily/fight the test drives directly (simulating
// what the VGEAR layer does: call the verb, bump the counter).
function mockBase(hooks) {
  return {
    id: 'mockbase', desc: 'mock',
    daily(Game, ctx) { if (hooks && hooks.daily) hooks.daily(Game, ctx); },
    fight(Game, ctx) { if (hooks && hooks.fight) return hooks.fight(Game, ctx); return false; },
  };
}

// ---------- A: gate honesty ----------
function testA() {
  // A1: both flags unset -> pure delegation.
  setEnv(false, false);
  {
    const g = mockGame();
    const origDon = g.donateWeapon;
    const ctx = beatsCtx();
    let baseDaily = 0, baseFight = 0;
    const p = VB.withVGearBeats(mockBase({ daily() { baseDaily++; }, fight() { baseFight++; return 'F'; } }), 't', 't');
    p.daily(g, ctx);
    const fr = p.fight(g, ctx);
    const beatKeys = Object.keys(ctx).filter(k => k.indexOf('_vgBeats') === 0);
    check('A1 gate-off pure delegation', baseDaily === 1 && baseFight === 1 && fr === 'F' &&
      beatKeys.length === 0 && g._sayLines.length === 0 && g.donateWeapon === origDon,
      `beatKeys=${beatKeys.length} say=${g._sayLines.length}`);
  }
  // A2: VGEARBEATS=1 but VGEAR unset -> silent (beats narrate the layer).
  setEnv(false, true);
  {
    const g = mockGame();
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(mockBase({ daily(G, c) { c.vgDonations = (c.vgDonations | 0) + 1; } }), 't', 't');
    p.daily(g, ctx);
    check('A2 beats need VGEAR (VGEAR unset -> silent)', g._sayLines.length === 0,
      `say=${g._sayLines.length}`);
  }
  restoreEnv();
}

// ---------- B: donation beats ----------
function donBase() {
  return mockBase({ daily(Game, ctx) { Game.donateWeapon(0); ctx.vgDonations = (ctx.vgDonations | 0) + 1; } });
}
function testB() {
  setEnv(true, true);
  const mk = (armory, inv) => mockGame({
    armory, inventory: inv, itemDefs: ITEM_DEFS,
    names: {}, wave: 1, day: 5,
  });
  // B1: donation -> one beat naming the weapon.
  {
    const g = mk([{ itemId: 'x', units: 1 }], [{ itemId: 'stone_knife' }]);
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(donBase(), 't', 't');
    p.daily(g, ctx);
    check('B1 donation beat names the weapon',
      g._sayLines.length === 1 && /stone knife/.test(g._sayLines[0]) && (ctx._vgBeatsDonBeats | 0) === 1,
      JSON.stringify(g._sayLines[0]));
  }
  // B2: second donation, same epoch -> no repeat (raidgarrison lesson).
  {
    const g = mk([{ itemId: 'x', units: 1 }],
      [{ itemId: 'stone_knife' }, { itemId: 'hunting_spear' }]);
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(donBase(), 't', 't');
    p.daily(g, ctx);
    p.daily(g, ctx);
    const epochs = Object.keys(ctx._vgBeatsFiredDon || {});
    check('B2 same-epoch donation: no repeat', g._sayLines.length === 1 &&
      epochs.length === 1 && (ctx._vgBeatsFiredDon[epochs[0]] | 0) === 1,
      `say=${g._sayLines.length} epochs=${epochs.length}`);
  }
  // B3: restock (>=3) then deplete -> new epoch -> beats again.
  {
    const g = mk([{ itemId: 'x', units: 1 }],
      [{ itemId: 'stone_knife' }, { itemId: 'hunting_spear' }]);
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(donBase(), 't', 't');
    p.daily(g, ctx); // epoch 1, beat 1
    g.state.scholar.day = 6;
    // restock to >=3 with no donation (layer no-ops when stocked)
    const quiet = VB.withVGearBeats(mockBase({}), 't', 't');
    const armFull = [{ itemId: 'a', units: 1 }, { itemId: 'b', units: 1 }, { itemId: 'c', units: 1 }];
    g.stashState = () => ({ weapons: armFull });
    quiet.daily(g, ctx); // epoch closes
    g.state.scholar.day = 7;
    g.stashState = () => ({ weapons: [{ itemId: 'a', units: 1 }] });
    p.daily(g, ctx); // epoch 2, beat 2
    check('B3 new epoch beats again', g._sayLines.length === 2 &&
      (ctx._vgBeatsDonEpoch | 0) === 2 && /hunting spear/.test(g._sayLines[1]),
      `say=${g._sayLines.length} epoch=${ctx._vgBeatsDonEpoch | 0}`);
  }
  // B4: rate cap — two epochs, same day -> one beat.
  {
    const g = mk([{ itemId: 'x', units: 1 }],
      [{ itemId: 'stone_knife' }, { itemId: 'hunting_spear' }]);
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(donBase(), 't', 't');
    p.daily(g, ctx); // epoch 1 beat, day 5
    const armFull = [{ itemId: 'a', units: 1 }, { itemId: 'b', units: 1 }, { itemId: 'c', units: 1 }];
    g.stashState = () => ({ weapons: armFull });
    VB.withVGearBeats(mockBase({}), 't', 't').daily(g, ctx); // close epoch, same day
    g.stashState = () => ({ weapons: [{ itemId: 'a', units: 1 }] });
    p.daily(g, ctx); // epoch 2, same day -> capped
    check('B4 one donation beat per day max', g._sayLines.length === 1,
      `say=${g._sayLines.length}`);
  }
  // B5: failed donation (counter unmoved) -> no beat.
  {
    const g = mk([{ itemId: 'x', units: 1 }], []);
    g.donateWeapon = function () { return null; }; // install AFTER wrapper? no — wrapper installs its own hook; simulate failure inside
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(mockBase({
      daily(Game, ctx2) { const r = Game.donateWeapon(0); if (r) ctx2.vgDonations = (ctx2.vgDonations | 0) + 1; },
    }), 't', 't');
    p.daily(g, ctx);
    check('B5 failed donation: no beat', g._sayLines.length === 0 && (ctx._vgBeatsDonBeats | 0) === 0,
      `say=${g._sayLines.length}`);
  }
  restoreEnv();
}

// ---------- C: invite beats ----------
function invBase(vid) {
  return mockBase({ daily(Game, ctx) { ctx.vgInvitesOk = (ctx.vgInvitesOk | 0) + 1; ctx._vgStagePick = { id: vid }; } });
}
function testC() {
  setEnv(true, true);
  const mk = (names, day) => mockGame({
    names, wave: 4, day: day || 30,
    readiness: { veterans: 0, demand: { veterans: 2 }, short: [] },
  });
  // C1: invite -> beat naming the villager.
  {
    const g = mk({ tariq_1: 'Tariq Mahmood' });
    const ctx = beatsCtx();
    VB.withVGearBeats(invBase('tariq_1'), 't', 't').daily(g, ctx);
    check('C1 invite beat names the villager',
      g._sayLines.length === 1 && /Tariq/.test(g._sayLines[0]) && (ctx._vgBeatsInvBeats | 0) === 1,
      JSON.stringify(g._sayLines[0]));
  }
  // C2: same (episode, villager) -> no repeat.
  {
    const g = mk({ tariq_1: 'Tariq Mahmood' });
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(invBase('tariq_1'), 't', 't');
    p.daily(g, ctx);
    g.state.scholar.day = 31;
    p.daily(g, ctx);
    check('C2 same (episode, villager): no repeat', g._sayLines.length === 1,
      `say=${g._sayLines.length}`);
  }
  // C3: different villager, same day -> rate cap; next day -> beat.
  {
    const g = mk({ tariq_1: 'Tariq Mahmood', aurora_2: 'Aurora Lindqvist' });
    const ctx = beatsCtx();
    VB.withVGearBeats(invBase('tariq_1'), 't', 't').daily(g, ctx);
    VB.withVGearBeats(invBase('aurora_2'), 't', 't').daily(g, ctx); // same day: capped
    const afterCap = g._sayLines.length;
    g.state.scholar.day = 31;
    VB.withVGearBeats(invBase('aurora_2'), 't', 't').daily(g, ctx); // next day: beats
    check('C3 one invite beat per day max', afterCap === 1 && g._sayLines.length === 2 &&
      /Aurora/.test(g._sayLines[1]), `say=${g._sayLines.length}`);
  }
  // C4: new staging episode -> same villager beats again.
  {
    const g = mk({ tariq_1: 'Tariq Mahmood' });
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(invBase('tariq_1'), 't', 't');
    p.daily(g, ctx); // ep 1, beat
    g.state.scholar.day = 31;
    // staging stands down (bar met) then resumes: new episode
    const met = { veterans: 2, demand: { veterans: 2 }, short: [] };
    const unmet = { veterans: 0, demand: { veterans: 2 }, short: [] };
    g.waveCombatReadiness = () => met;
    VB.withVGearBeats(mockBase({}), 't', 't').daily(g, ctx);
    g.waveCombatReadiness = () => unmet;
    g.state.scholar.day = 32;
    p.daily(g, ctx); // ep 2, beat again
    check('C4 new staging episode: same villager beats again',
      g._sayLines.length === 2 && (ctx._vgBeatsStageEp | 0) === 2,
      `say=${g._sayLines.length} ep=${ctx._vgBeatsStageEp | 0}`);
  }
  restoreEnv();
}

// ---------- D: yield beats ----------
function yieldBase() {
  return mockBase({ fight(Game, ctx) { ctx._vgYield = true; return true; } });
}
function testD() {
  setEnv(true, true);
  const mkFight = () => ({ over: false, fighters: [] });
  // D1: first yield turn of a fight -> beat naming the companion.
  {
    const g = mockGame({ names: { aurora_2: 'Aurora Lindqvist' } });
    g.partyMembers = () => ['aurora_2'];
    const f = mkFight();
    g.tbfight = f;
    // engagedCompanions needs fighters with kind/villagerId/alive on tbfight
    f.fighters = [{ kind: 'villager', villagerId: 'aurora_2', alive: true, fled: false }];
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(yieldBase(), 't', 't');
    // NOTE: the real engagedCompanions reads partyMembers + fighters; the
    // mock above satisfies it through the real VG.engagedCompanions.
    const r = p.fight(g, ctx);
    check('D1 yield beat names the companion',
      r === true && g._sayLines.length === 1 && /Aurora/.test(g._sayLines[0]) &&
      (ctx._vgBeatsYieldBeats | 0) === 1, JSON.stringify(g._sayLines[0]));
  }
  // D2: second yield turn, same fight -> no repeat.
  {
    const g = mockGame({ names: { aurora_2: 'Aurora Lindqvist' } });
    g.partyMembers = () => ['aurora_2'];
    const f = mkFight();
    f.fighters = [{ kind: 'villager', villagerId: 'aurora_2', alive: true, fled: false }];
    g.tbfight = f;
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(yieldBase(), 't', 't');
    p.fight(g, ctx);
    p.fight(g, ctx);
    check('D2 same fight, second yield: no repeat', g._sayLines.length === 1,
      `say=${g._sayLines.length} yieldBeats=${ctx._vgBeatsYieldBeats | 0}`);
  }
  // D3: new fight -> beats again.
  {
    const g = mockGame({ names: { aurora_2: 'Aurora Lindqvist' } });
    g.partyMembers = () => ['aurora_2'];
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(yieldBase(), 't', 't');
    const f1 = mkFight(); f1.fighters = [{ kind: 'villager', villagerId: 'aurora_2', alive: true, fled: false }];
    g.tbfight = f1; p.fight(g, ctx);
    g.state.scholar.day = 2; // the 1/day rate cap spans fights: a new day lets the new fight beat
    const f2 = mkFight(); f2.fighters = [{ kind: 'villager', villagerId: 'aurora_2', alive: true, fled: false }];
    g.tbfight = f2; p.fight(g, ctx);
    check('D3 new fight beats again', g._sayLines.length === 2 &&
      (ctx._vgBeatsFightSeq | 0) === 2, `say=${g._sayLines.length}`);
  }
  // D4: two fights, SAME day -> the 1/day rate cap holds across fights.
  {
    const g = mockGame({ names: { aurora_2: 'Aurora Lindqvist' } });
    g.partyMembers = () => ['aurora_2'];
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(yieldBase(), 't', 't');
    const f1 = mkFight(); f1.fighters = [{ kind: 'villager', villagerId: 'aurora_2', alive: true, fled: false }];
    g.tbfight = f1; p.fight(g, ctx);
    const f2 = mkFight(); f2.fighters = [{ kind: 'villager', villagerId: 'aurora_2', alive: true, fled: false }];
    g.tbfight = f2; p.fight(g, ctx);
    check('D4 one yield beat per day max (across fights)', g._sayLines.length === 1,
      `say=${g._sayLines.length}`);
  }
  restoreEnv();
}

// ---------- E: narration-path purity ----------
function testE() {
  setEnv(true, true);
  // E1: Math.random poisoned -> beats still fire (no RNG draws).
  {
    const realRandom = Math.random;
    Math.random = () => { throw new Error('RNG drawn in narration path'); };
    let threw = null;
    const g = mockGame({
      armory: [{ itemId: 'x', units: 1 }], inventory: [{ itemId: 'stone_knife' }],
      itemDefs: ITEM_DEFS, names: { tariq_1: 'Tariq Mahmood' }, wave: 4, day: 40,
      readiness: { veterans: 0, demand: { veterans: 2 }, short: [] },
    });
    const ctx = beatsCtx();
    try {
      const p = VB.withVGearBeats(mockBase({
        daily(Game, c) { Game.donateWeapon(0); c.vgDonations = (c.vgDonations | 0) + 1; c.vgInvitesOk = (c.vgInvitesOk | 0) + 1; c._vgStagePick = { id: 'tariq_1' }; },
        fight(Game, c) { c._vgYield = true; return true; },
      }), 't', 't');
      g.partyMembers = () => ['tariq_1'];
      const f = { over: false, fighters: [{ kind: 'villager', villagerId: 'tariq_1', alive: true, fled: false }] };
      g.tbfight = f;
      p.daily(g, ctx);
      p.fight(g, ctx);
    } catch (e) { threw = e; }
    Math.random = realRandom;
    check('E1 no RNG draws in narration path', !threw && g._sayLines.length === 3,
      threw ? threw.message : `say=${g._sayLines.length}`);
  }
  // E2: Game.state byte-identical across beats (say writes Game.log only).
  {
    const g = mockGame({
      armory: [{ itemId: 'x', units: 1 }], inventory: [{ itemId: 'stone_knife' }],
      itemDefs: ITEM_DEFS, names: { tariq_1: 'Tariq Mahmood' }, wave: 4, day: 40,
      readiness: { veterans: 0, demand: { veterans: 2 }, short: [] },
    });
    const before = JSON.stringify(g.state);
    const ctx = beatsCtx();
    const p = VB.withVGearBeats(mockBase({
      daily(Game, c) { c.vgDonations = (c.vgDonations | 0) + 1; c.vgInvitesOk = (c.vgInvitesOk | 0) + 1; c._vgStagePick = { id: 'tariq_1' }; },
      fight(Game, c) { c._vgYield = true; return true; },
    }), 't', 't');
    g.partyMembers = () => ['tariq_1'];
    const f = { over: false, fighters: [{ kind: 'villager', villagerId: 'tariq_1', alive: true, fled: false }] };
    g.tbfight = f;
    p.daily(g, ctx);
    p.fight(g, ctx);
    // NOTE: the mock base's donateWeapon hook captured a pending name, but
    // the mock base here does not call donateWeapon — the beat falls back
    // to 'a spare edge'. State must still be untouched.
    check('E2 no game-state writes', JSON.stringify(g.state) === before && g._sayLines.length === 3,
      `say=${g._sayLines.length}`);
  }
  // E2b: pickLine is deterministic (same key -> same line, both variants reachable).
  {
    const seen = new Set();
    for (let i = 0; i < 40; i++) seen.add(VB.pickLine(VB.DON_LINES, 'don:' + i)('w'));
    const again = VB.pickLine(VB.DON_LINES, 'don:7')('w');
    check('E2b deterministic line selection', seen.size === 2 && again === VB.pickLine(VB.DON_LINES, 'don:7')('w'),
      `variants=${seen.size}`);
  }
  restoreEnv();
}

// ---------- F/G: real-harness gates ----------
async function testFG() {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const FS = require('./policies/feastscale');
  async function trajectory(seed, beatsOnFlag, days) {
    if (beatsOnFlag) process.env.VGEARBEATS = '1'; else delete process.env.VGEARBEATS;
    process.env.VGEAR = '1';
    const { Game } = await loadGame({ seed, mode: 'vgearbeats-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const pol = beatsOnFlag ? VB.vgbLead : VG.vgearLead;
    const oDaily = pol.daily;
    const wrapped = Object.assign({}, pol, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 30 }); });
    return hs.join('|');
  }
  for (const seed of [711, 712]) {
    const off = await trajectory(seed, false, 60);
    const on = await trajectory(seed, true, 60);
    check(`F det-gate: beats on/off trajectory-identical (s${seed}, VGEAR=1, 60d)`,
      off === on && off.length > 0, `len=${off.length}`);
  }
  const on1 = await trajectory(711, true, 60);
  const on2 = await trajectory(711, true, 60);
  check('F det-gate: beats-on deterministic (re-run identical)', on1 === on2 && on1.length > 0,
    `len=${on1.length}`);
  delete process.env.VGEARBEATS;
}

async function main() {
  console.log('== A: gate honesty =='); testA();
  console.log('== B: donation beats =='); testB();
  console.log('== C: invite beats =='); testC();
  console.log('== D: yield beats =='); testD();
  console.log('== E: narration-path purity =='); testE();
  console.log('== F/G: real-harness gates =='); await testFG();
  restoreEnv();
  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(2); });
