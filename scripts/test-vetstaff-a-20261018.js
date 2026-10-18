#!/usr/bin/env node
// test-vetstaff-a-20261018.js — proof for the vetstaff policy layer
// (flesh-out loop arm sim-vetstaff-a, 2026-10-18, scale-onramp axis).
// POLICY-SIDE ONLY: proves scripts/policies/vetstaff.js, never touches
// src/js. Fixtures stub Game.unlockedWave / TB surface / armorOf boundary
// (all documented); the det-gate and smoke run the real engine.
//
// (a) MECHANISM (in-process fixtures on a real harness game):
//     gate-off purity (daily/fight delegate, zero ctx writes); blood-list
//     ordering (tier 0 > tier 1 > tier 2 > tier 3; scholar excluded; dead
//     excluded; tier-3 boundary via documented armorOf stub); staffing
//     invites the blood-list head through the real verb; hunt-leg guards
//     (fires only with the candidate in party + healthy; 3-day cooldown);
//     fight wrapper marks _huntCommit on staffed hunt fights ONLY — no
//     steering (tbPlayerWait never called), random fights untouched.
// (b) DET-GATE: VETSTAFF unset => vetstaff-lead/belong byte-identical to
//     the tribfloor base on fixed seeds (pure delegation).
// (c) SMOKE: VETSTAFF=1 short run drives without errors.
// Usage: node scripts/test-vetstaff-a-20261018.js
'use strict';
// POST-KILL INFO-SKIP: the vetstaff layer was deleted per the kill protocol
// (NO-GO on the binding primary, 2026-10-18), so this proof has nothing to
// prove. Exit 0 instead of crashing on the missing module.
const fs0 = require('fs'), path0 = require('path');
if (!fs0.existsSync(path0.join(__dirname, 'policies', 'vetstaff.js'))) {
  console.log('INFO-SKIP: test-vetstaff-a-20261018.js — layer deleted per kill protocol (NO-GO primary 2026-10-18); proof vacuous.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const TF = require('./policies/tribfloor');
const VS = require('./policies/vetstaff');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function pickVillager(Game, ...skips) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id && id !== Game.villagerId && !skips.includes(id));
  for (const id of roster) {
    let vp = null;
    try { vp = Game.vpOf(id); } catch (e) {}
    if (vp && !vp.dead) return id;
  }
  return null;
}
function setHealth(Game, vid, hp) {
  try {
    const v = Game.state.village || {};
    v.health = v.health || {};
    v.health[vid] = hp;
  } catch (e) {}
}
function makeWaveKills(Game, vid, w, n) {
  Game.state.waveKillLog = Game.state.waveKillLog || [];
  for (let i = 0; i < n; i++) {
    Game.state.waveKillLog.push({ d: 60 + i, mid: 'redactor', w, by: vid, via: 'companion', trick: null });
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
  const { Game } = await loadGame({ seed, mode: 'vetstaff-proof' });
  await setupGame(Game);
  return Game;
}
// Fake TB surface for fight fixtures. Returns restore().
function stubTB(Game, opts) {
  const o = opts || {};
  const p = { key: 'p', kind: 'player', hp: o.php != null ? o.php : 80, maxHp: 100, alive: true };
  const cand = { key: 'v0', kind: 'villager', villagerId: o.candId, hp: o.chp != null ? o.chp : 70, maxHp: 100, alive: true };
  const mon = { key: 'm0', kind: 'monster', monsterId: 'redactor', hp: o.mhp != null ? o.mhp : 200, maxHp: 300, alive: true };
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
    waits: () => waits, mon, cand, p, fight: f,
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
  delete process.env.VETSTAFF; // gate OFF first; fixtures toggle it on

  console.log('== (a) MECHANISM fixtures ==');
  // A1. Gate-off purity: daily/fight delegate with zero ctx writes.
  {
    const Game = await newGame(9501);
    const seen = [];
    const recBase = Object.assign({}, TF.leadfeast, {
      daily(G, c) { seen.push('daily'); },
      fight(G, c) { seen.push('fight'); return true; },
    });
    const pol = VS.withVetstaff(recBase, 'vs-test', 'test');
    const ctx = {};
    pol.daily(Game, ctx);
    pol.fight(Game, ctx);
    check('gate-off daily delegates to base', seen.join(',') === 'daily,fight', seen.join(','));
    check('gate-off writes no vetstaff ctx keys', !Object.keys(ctx).some(k => /vetstaff|_vs/i.test(k)), JSON.stringify(Object.keys(ctx)));
  }
  // A2. Blood-list ordering: tier 0 (proven) > tier 1 (thin) > tier 2/3.
  {
    const Game = await newGame(9502);
    const vA = pickVillager(Game); const vB = pickVillager(Game, vA); const vC = pickVillager(Game, vA, vB);
    makeWaveKills(Game, vA, 3, 2); // tier 0: 2 wave-3 kills, village cum3 = 2
    makeWaveKills(Game, vC, 2, 1); // tier 1: blooded on wave-2 combat only
    const list = VS.bloodList(Game);
    check('fixture has 3 villagers', !!(vA && vB && vC), `${vA},${vB},${vC}`);
    const eA = list.find(c => c.id === vA), eC = list.find(c => c.id === vC);
    check('proven killer (2 w3 kills, cum3>=2) is tier 0', eA && eA.tier === 0, JSON.stringify(eA));
    check('tier-0 head leads the list', list.length && list[0].id === vA, JSON.stringify(list.slice(0, 2).map(c => [String(c.id).slice(0, 8), c.tier])));
    check('wave-2-blooded (no w3) is tier 1', eC && eC.tier === 1, JSON.stringify(eC));
    check('tier 1 sorts after tier 0', list.findIndex(c => c.id === vA) < list.findIndex(c => c.id === vC), '');
    check('scholar excluded from the blood list', !list.some(c => c.id === Game.villagerId), '');
    check('dead excluded from the blood list', list.every(c => {
      const h = ((Game.state.village || {}).health || {})[c.id];
      return !(typeof h === 'number' && h <= 0);
    }), '');
  }
  // A2b. Record-thin tier 1: a wave-3 kill with village cum3 < 2.
  {
    const Game = await newGame(9503);
    const vA = pickVillager(Game);
    makeWaveKills(Game, vA, 3, 1); // cum3 = 1 < 2 -> record thin
    const e = VS.bloodList(Game).find(c => c.id === vA);
    check('w3 kill with thin village record is tier 1, not tier 0', e && e.tier === 1, JSON.stringify(e));
  }
  // A2c. Armor boundary tier 2 vs tier 3 (documented armorOf stub — the
  // boundary is the layer's rule; the engine's armor math is standing.js's).
  {
    const Game = await newGame(9504);
    const vD = pickVillager(Game);
    const S = globalThis.Scattering || {};
    const origArmorOf = S.equipment && S.equipment.armorOf;
    // The boundary is the layer's rule; the engine's armor math belongs to
    // standing.js. First check the tier rule against the REAL armorP read
    // for this villager, then pin the >=10 boundary via a documented stub.
    const realAp = VS.armorP(Game, vD);
    const e = VS.bloodList(Game).find(c => c.id === vD);
    const expectTier = (e && (e.kills3 || e.kills2)) ? e.tier : (realAp >= 10 ? 2 : 3);
    check('no-kill villager tiers on the armorP>=10 boundary (real read)', e && e.tier === expectTier,
      `armorP=${realAp} tier=${e && e.tier}`);
    // And the boundary itself, via a direct stub of the module read:
    if (S.equipment) {
      S.equipment.armorOf = function () { return 15; };
      const e2 = VS.bloodList(Game).find(c => c.id === vD);
      check('armorP=15 (stubbed) -> tier 2 armor-paired', e2 && e2.tier === 2 && !(e2.kills3 || e2.kills2), JSON.stringify(e2 && e2.tier));
      S.equipment.armorOf = function () { return 9; };
      const e3 = VS.bloodList(Game).find(c => c.id === vD);
      check('armorP=9 (stubbed) -> tier 3 unarmored', e3 && e3.tier === 3, JSON.stringify(e3 && e3.tier));
      S.equipment.armorOf = origArmorOf;
    } else {
      check('armorP=15 (stubbed) -> tier 2 armor-paired', false, 'no S.equipment in harness');
      check('armorP=9 (stubbed) -> tier 3 unarmored', false, 'no S.equipment in harness');
    }
    check('tier 3 is listed (present) — never staffed is a head-selection rule', (() => {
      const head = VS.bloodListHead(Game);
      return !head || head.tier <= 2;
    })(), '');
  }
  // A3. Staffing: invites the blood-list head through the real verb.
  {
    process.env.VETSTAFF = '1';
    const Game = await newGame(9505);
    const vA = pickVillager(Game); makeWaveKills(Game, vA, 3, 2); setTrust(Game, vA, 50);
    const origUW = Game.unlockedWave;
    Game.unlockedWave = function () { return 3; }; // wave-3 unlocked (documented stub)
    const origWR = Game.waveCombatReadiness;
    Game.waveCombatReadiness = function () { return { veterans: 0, demand: { veterans: 1 }, short: ['veterans'] }; }; // bar unmet (documented stub)
    const invited = [];
    let oks = 0;
    const origInvite = Game.inviteToParty;
    Game.inviteToParty = function (id) { invited.push(id); const r = origInvite.call(Game, id); if (r && r.ok) oks++; return r; };
    const ctx = {};
    VS.staffingProtocol(Game, ctx);
    Game.inviteToParty = origInvite; Game.unlockedWave = origUW; Game.waveCombatReadiness = origWR;
    check('staffing invites the blood-list head', invited.includes(vA), JSON.stringify(invited.map(String).map(s => s.slice(0, 8))));
    check('staffing records accepted invites (0 on honest refusal)', (ctx.vetstaffStaff | 0) === oks,
      `staff=${ctx.vetstaffStaff} oks=${oks} (a refusal is the verb's honest answer)`);
    delete process.env.VETSTAFF;
  }
  // A4. Hunt-leg GREEN: fires with the candidate in party, healthy.
  {
    process.env.VETSTAFF = '1';
    const Game = await newGame(9506);
    const vA = pickVillager(Game); makeWaveKills(Game, vA, 3, 2); setTrust(Game, vA, 50);
    partyAdd(Game, vA);
    setHealth(Game, vA, 90);
    const origUW = Game.unlockedWave;
    Game.unlockedWave = function () { return 3; }; // wave-3 unlocked (documented stub)
    const origWR = Game.waveCombatReadiness;
    Game.waveCombatReadiness = function () { return { veterans: 0, demand: { veterans: 1 }, short: ['veterans'] }; }; // bar unmet
    const ctx = {};
    VS.staffHuntLeg(Game, ctx);
    Game.unlockedWave = origUW; Game.waveCombatReadiness = origWR;
    check('hunt leg fires with staffed healthy candidate', (ctx.vetstaffHunts | 0) >= 1, `hunts=${ctx.vetstaffHunts}`);
    check('hunt leg stamps the 3-day cooldown', (ctx._vsLastHuntDay | 0) === ((Game.state.scholar || {}).day || 0), '');
    delete process.env.VETSTAFF;
  }
  // A5. Hunt-leg RED guards.
  {
    process.env.VETSTAFF = '1';
    const Game = await newGame(9507);
    const vA = pickVillager(Game); makeWaveKills(Game, vA, 3, 2); setTrust(Game, vA, 50);
    const origUW = Game.unlockedWave;
    Game.unlockedWave = function () { return 3; };
    const origWR = Game.waveCombatReadiness;
    Game.waveCombatReadiness = function () { return { veterans: 0, demand: { veterans: 1 }, short: ['veterans'] }; };
    // RED: candidate not in party -> no hunt.
    {
      const ctx = {};
      VS.staffHuntLeg(Game, ctx);
      check('RED: no hunt without the candidate in party', (ctx.vetstaffHunts | 0) === 0, `hunts=${ctx.vetstaffHunts}`);
    }
    // RED: candidate unhealthy (<60) -> no hunt.
    {
      partyAdd(Game, vA);
      setHealth(Game, vA, 40);
      const ctx = {};
      VS.staffHuntLeg(Game, ctx);
      check('RED: no hunt with candidate health < 60', (ctx.vetstaffHunts | 0) === 0, `hunts=${ctx.vetstaffHunts}`);
      setHealth(Game, vA, 90);
    }
    // RED: 3-day cooldown -> second leg same window doesn't fire.
    {
      const ctx = { _vsLastHuntDay: (Game.state.scholar || {}).day || 0 };
      VS.staffHuntLeg(Game, ctx);
      check('RED: 3-day cooldown blocks a second leg', (ctx.vetstaffHunts | 0) === 0, `hunts=${ctx.vetstaffHunts}`);
    }
    Game.unlockedWave = origUW; Game.waveCombatReadiness = origWR;
    delete process.env.VETSTAFF;
  }
  // A6. Fight wrapper: _huntCommit on staffed hunt fights ONLY, no steering.
  {
    process.env.VETSTAFF = '1';
    const Game = await newGame(9508);
    const vA = pickVillager(Game); makeWaveKills(Game, vA, 3, 2); setTrust(Game, vA, 50);
    partyAdd(Game, vA);
    const recBase = Object.assign({}, TF.leadfeast, { fight(G, c) { return true; } });
    const pol = VS.withVetstaff(recBase, 'vs-test', 'test');
    // GREEN: marked hunt fight + candidate engaged + wave-3 -> commit, no waits.
    {
      const tb = stubTB(Game, { candId: vA, mhp: 200, chp: 70, php: 80 });
      const ctx = { _vsHuntFight: tb.fight, _vsCandidate: vA };
      const r = pol.fight(Game, ctx);
      check('staffed hunt fight marks _huntCommit (escort holds)', ctx._huntCommit === true && r === true,
        `commit=${ctx._huntCommit}`);
      check('NO steering: tbPlayerWait never called', tb.waits() === 0, `waits=${tb.waits()}`);
      tb.restore();
    }
    // RED: random fight (not a hunt-leg fight) -> no commit.
    {
      const tb = stubTB(Game, { candId: vA, mhp: 200, chp: 70, php: 80 });
      const ctx = {};
      pol.fight(Game, ctx);
      check('RED: random wave-3 fight keeps standard discipline', ctx._huntCommit === false, `commit=${ctx._huntCommit}`);
      check('RED: random fight, still no steering', tb.waits() === 0, `waits=${tb.waits()}`);
      tb.restore();
    }
    // RED: gate off -> pure delegation.
    {
      delete process.env.VETSTAFF;
      const tb = stubTB(Game, { candId: vA, mhp: 200, chp: 70, php: 80 });
      const ctx = { _vsHuntFight: tb.fight, _vsCandidate: vA };
      let baseCalled = false;
      const rb2 = Object.assign({}, TF.leadfeast, { fight(G, c) { baseCalled = true; return true; } });
      const pol2 = VS.withVetstaff(rb2, 'vs-test', 'test');
      pol2.fight(Game, ctx);
      check('RED: gate off -> pure delegation, ctx untouched', baseCalled && !('_huntCommit' in ctx), `commit=${ctx._huntCommit}`);
      tb.restore();
      process.env.VETSTAFF = '1';
    }
    delete process.env.VETSTAFF;
  }

  console.log('== (b) DET-GATE (gate off => byte-identical to tribfloor base) ==');
  {
    const seeds = [9511, 9512];
    const pairs = [['lead', TF.leadfeast, VS.vetstaffLead], ['belong', TF.belongfeast, VS.vetstaffBelong]];
    let green = 0, total = 0;
    for (const seed of seeds) {
      for (const [pname, basePol, vsPol] of pairs) {
        total++;
        const hashes = {};
        for (const [tag, pol] of [['base', basePol], ['vs', vsPol]]) {
          delete process.env.VETSTAFF;
          const { Game } = await loadGame({ seed, mode: 'vetstaff-det' });
          await setupGame(Game);
          const hs = [];
          const wrapped = Object.assign({}, pol, {
            daily(G, ctx) { hs.push(G.state.scholar.day + ':' + dayHash(G)); return pol.daily(G, ctx); },
          });
          await quietLog(async () => runDays(Game, wrapped, { days: 60 }));
          hashes[tag] = hs.join('\n');
        }
        const same = hashes.base === hashes.vs;
        if (same) green++;
        check(`gate-off byte-identical [${pname} seed ${seed}]`, same, same ? '' : 'trajectories diverged');
      }
    }
    check('det-gate all green', green === total, `${green}/${total}`);
  }

  console.log('== (c) SMOKE (gate on, short run) ==');
  {
    process.env.VETSTAFF = '1';
    const { Game } = await loadGame({ seed: 9521, mode: 'vetstaff-smoke' });
    await setupGame(Game);
    let result = null, err = null;
    try {
      await quietLog(async () => { result = await runDays(Game, VS.vetstaffLead, { days: 45 }); });
    } catch (e) { err = e; }
    check('45d gate-on run completes without errors', !err && !!result, err ? String(err && err.message) : '');
    delete process.env.VETSTAFF;
  }

  console.log(`\nRESULT: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
