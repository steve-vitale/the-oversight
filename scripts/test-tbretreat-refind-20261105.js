// test-tbretreat-refind-20261105.js — proof for the tbretreat-refind
// policy variant, driver, and analyzer (arm sim-tbretreat-refind-b).
// Fixture tests (fake Game: trigger boundaries, delegation, persistent
// chase, push-outcome classification, haven-hold, sealed suppression,
// stats) + instrument smoke + analyzer fixtures (gates G1-G4, thin
// guard, re-engagement) + live harness smoke + off/on neutrality leg +
// variant-vs-baseline neutrality leg (driver subprocesses into /tmp,
// never into evidence/). Exit non-zero on any failure.
// Usage: node scripts/test-tbretreat-refind-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'tbretreat-refind-analyze-20261105'));
const INST = require(path.join(REPO, 'scripts', 'staypolicy-instrument-20261105'));
const RF = require(path.join(REPO, 'scripts', 'policies', 'tbretreat-refind'));
const BASE = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// ---- variant wrapping: only fight is overridden, no env gates ----
(function () {
  const v = RF.tbretreatRefind;
  check('wrap-daily-identical', v.daily === BASE.competent.daily);
  check('wrap-fight-overridden', v.fight !== BASE.competent.fight);
  check('wrap-id', v.id === 'tbretreat-refind');
  check('wrap-eat-reexport', RF.competentEat === BASE.competentEat);
  const gates = ['COMPETENT_DPS_RACE', 'COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_EXIT_VERIFIED_FLEE', 'COMPETENT_FLEE_REPAIR', 'COMPETENT_FIGHT_ASSESS', 'COMPETENT_W2DISENGAGE'];
  check('no-env-gates', gates.every(function (k) { return process.env[k] !== '1'; }), JSON.stringify(gates.map(function (k) { return [k, process.env[k]]; })));
  check('trigger-constants', RF.REFIND_SCHOLAR_HP === 0.75 && RF.REFIND_MONSTER_HP === 0.75 && RF.REFIND_STUCK_TURNS === 3 && RF.REFIND_MAX_CROSSINGS === 6);
})();

// ---- fake TB Game for the policy fixtures ----
// The fake implements the sense channels chooseFleeDir reads (tileAt /
// mapSeen / monsterAt) so direction choice is exercised for real.
// pushScript: per-push outcomes — 'exit' (fight ends, map unchanged),
// 'exit-haven' (fight ends, map moves to haven), 'cross' (map moves one
// node in the push direction, scholar re-placed at centre+3d, fight
// live), 'consume' (nothing moves, push spent).
function fakeTb(opts) {
  const o = opts || {};
  const p = { key: 'p', kind: 'player', hp: (o.php != null ? o.php : 100), maxHp: (o.pmax != null ? o.pmax : 100), mx: 4, my: 4, moveLeft: 2, acted: false };
  const m = { key: 'm_0', kind: 'monster', alive: true, fled: false, monsterId: o.mid || 'w4a',
    mdef: { id: o.mid || 'w4a', wave: (o.wave != null ? o.wave : 4) },
    hp: (o.mhp != null ? o.mhp : 600), maxHp: (o.mmax != null ? o.mmax : 1000), mx: 6, my: 4 };
  const f = { id: 'fight1', over: false, round: 1, gridSize: 9, fighters: [p, m] };
  if (o.noFlee) f.noFlee = true;
  if (o.tableTrial) f.tableTrial = true;
  const calls = { moves: [], pushes: 0, waits: 0, endTurns: 0, baseCalls: 0 };
  const script = (o.pushScript || ['exit']).slice();
  const map = { px: (o.mapX != null ? o.mapX : 5), py: (o.mapY != null ? o.mapY : 4) };
  const monsterTiles = o.monsterTiles || {};
  const G = {
    villagerId: 'leader',
    data: { monsters: [{ id: 'w4a', wave: 4 }, { id: 'w3a', wave: 3 }, { id: 'w5a', wave: 5 }], items: [], villagers: [], background_survivors: [] },
    state: { scholar: { day: 50 }, waveKillLog: [], village: { fallen: [], roster: ['leader'], health: {} } },
    map: map,
    tileAt: function (x, y) { return (x === 4 && y === 4) ? { type: 'haven' } : { type: 'wild' }; },
    mapSeen: function () { return true; },
    monsterAt: function (x, y) { return !!monsterTiles[x + ',' + y]; },
    tbfight: f,
    tbFighter: function (k) { return k === 'p' ? p : null; },
    tbIsPlayerTurn: function () { return true; },
    tbPlayerMove: function (x, y) {
      calls.moves.push([x, y]);
      if (o.moveStuck) return false;
      p.mx = x; p.my = y;
      return true;
    },
    tbBarrierExit: function (dx, dy) {
      calls.pushes += 1;
      const outcome = script.length ? script.shift() : 'exit';
      if (outcome === 'exit') { f.over = true; return true; }
      if (outcome === 'exit-haven') { map.px = 4; map.py = 4; f.over = true; return true; }
      if (outcome === 'cross') {
        map.px += dx; map.py += dy;
        p.mx = Math.max(0, Math.min(8, 4 + dx * 3));
        p.my = Math.max(0, Math.min(8, 4 + dy * 3));
        return true;
      }
      return true; // 'consume': nothing moves
    },
    tbPlayerWait: function () { calls.waits += 1; },
    tbAfterPlayerAction: function () { calls.endTurns += 1; },
    equippedWeapon: function () { return { range: 1 }; },
  };
  return { G: G, p: p, m: m, f: f, calls: calls };
}

// Stub the base fight so delegation is observable (restored after the
// fixtures — the live legs below must see the real base policy).
const origBaseFight = BASE.competent.fight;
let baseCalls = 0;
BASE.competent.fight = function () { baseCalls += 1; return 'base-handled'; };

function runPolicy(fake, ctx) {
  ctx = ctx || {};
  const r = RF.tbretreatRefind.fight(fake.G, ctx);
  return { r: r, ctx: ctx };
}

(function () {
  // 1. Trigger fires at 74/100 vs 760/1000 (0.74 < 0.75, 0.76 > 0.75):
  // map (5,4) -> havenward dir (-1,0); walk (4,4)->(0,4) in 4 steps,
  // push through and exit. 4 steps + 1 push = 5 turns.
  RF.resetRefindStats();
  const fake = fakeTb({ php: 74, mhp: 760 });
  baseCalls = 0;
  let r;
  const ctx = {};
  for (let i = 0; i < 5; i++) { r = runPolicy(fake, ctx); }
  check('trigger-fires-walk-push-exit', r.r === true && fake.calls.moves.length === 4 && fake.calls.pushes === 1 && fake.f.over === true,
    JSON.stringify({ moves: fake.calls.moves, pushes: fake.calls.pushes, over: fake.f.over }));
  check('trigger-stats', (function () { const s = RF.refindStats(); return s.triggerFires === 1 && s.fights === 1 && s.fleeTurns === 5 && s.exits === 1 && s.exitsGaveup === 1 && s.exitsHaven === 0 && s.events.length === 1 && s.events[0].scholarHpFrac === 0.74 && s.events[0].monsterHpFrac === 0.76 && s.events[0].result === 'exited' && s.events[0].exitKind === 'exited-gaveup'; })(),
    JSON.stringify(RF.refindStats()));
  check('trigger-no-base-call', baseCalls === 0, 'baseCalls=' + baseCalls);
})();

(function () {
  // 2. Boundaries: scholar exactly 75% does NOT fire; monster exactly
  // 75% does NOT fire; scholar 74% + monster 76% DOES fire.
  RF.resetRefindStats();
  let fake = fakeTb({ php: 75, mhp: 900 });
  baseCalls = 0;
  let r = runPolicy(fake);
  check('boundary-scholar-75-nofire', r.r === 'base-handled' && baseCalls === 1 && RF.refindStats().triggerFires === 0,
    JSON.stringify({ r: r.r, baseCalls: baseCalls }));
  fake = fakeTb({ php: 74, mhp: 750 });
  baseCalls = 0;
  r = runPolicy(fake);
  check('boundary-monster-75-nofire', r.r === 'base-handled' && baseCalls === 1 && RF.refindStats().triggerFires === 0,
    JSON.stringify({ r: r.r, baseCalls: baseCalls }));
  fake = fakeTb({ php: 74, mhp: 760 });
  baseCalls = 0;
  r = runPolicy(fake);
  check('boundary-74-76-fires', r.r === true && baseCalls === 0 && RF.refindStats().triggerFires === 1,
    JSON.stringify({ r: r.r, baseCalls: baseCalls }));
})();

(function () {
  // 3. Wave scope: wave 3 delegates; wave 5 FIRES (wave-4+); unknown
  // delegates.
  RF.resetRefindStats();
  let fake = fakeTb({ php: 10, mid: 'w3a', wave: 3 });
  baseCalls = 0;
  let r = runPolicy(fake);
  check('wave3-delegates', r.r === 'base-handled' && baseCalls === 1, JSON.stringify({ r: r.r }));
  fake = fakeTb({ php: 10, mid: 'w5a', wave: 5, mhp: 900 });
  baseCalls = 0;
  r = runPolicy(fake);
  check('wave5-fires', r.r === true && baseCalls === 0 && RF.refindStats().triggerFires === 1,
    JSON.stringify({ r: r.r, fires: RF.refindStats().triggerFires }));
  fake = fakeTb({ php: 10, mid: 'mystery', wave: null });
  fake.m.mdef = { id: 'mystery' };
  baseCalls = 0;
  r = runPolicy(fake);
  check('unknown-delegates', r.r === 'base-handled' && baseCalls === 1 && RF.refindStats().triggerFires === 1,
    JSON.stringify({ r: r.r, fires: RF.refindStats().triggerFires }));
})();

(function () {
  // 4. PERSISTENT CHASE (the staypolicy correction): map (6,4),
  // havenward dir (-1,0); walk 4 steps, push #1 CROSSES to (5,4)
  // (fight live, scholar re-placed at (1,4)); 1 step to the edge;
  // push #2 exits. The policy must NOT mark unfleeable after the
  // first push. 4 + 1 + 1 + 1 = 7 flee turns, 1 crossing.
  RF.resetRefindStats();
  const fake = fakeTb({ php: 50, mhp: 900, mapX: 6, pushScript: ['cross', 'exit'] });
  baseCalls = 0;
  const ctx = {};
  let r;
  for (let i = 0; i < 7; i++) { r = runPolicy(fake, ctx); }
  const s = RF.refindStats();
  check('persistent-chase-exits', r.r === true && fake.f.over === true && fake.calls.pushes === 2 &&
    s.exits === 1 && s.crossings === 1 && s.pushes.crossed === 1 && s.fleeTurns === 7 && s.consumedPushes === 0,
    JSON.stringify({ pushes: fake.calls.pushes, over: fake.f.over, stats: s }));
  check('persistent-chase-no-base-call', baseCalls === 0, 'baseCalls=' + baseCalls);
})();

(function () {
  // 5. Haven exit: push toward haven lands ON haven -> exited-haven.
  RF.resetRefindStats();
  const fake = fakeTb({ php: 50, mhp: 900, pushScript: ['exit-haven'] });
  baseCalls = 0;
  const ctx = {};
  let r;
  for (let i = 0; i < 5; i++) { r = runPolicy(fake, ctx); }
  const s = RF.refindStats();
  check('haven-exit-kind', r.r === true && s.exits === 1 && s.exitsHaven === 1 && s.events[0].exitKind === 'exited-haven',
    JSON.stringify(s));
})();

(function () {
  // 6. Stuck flee: the step moves nowhere 3 turns in a row (monster out
  // of range, so no strike fall-through) -> unfleeable, base fights it
  // out from then on. The 4th call delegates straight to base.
  RF.resetRefindStats();
  const fake = fakeTb({ php: 20, mhp: 900, moveStuck: true });
  fake.m.mx = 8; fake.m.my = 8; // out of range (Chebyshev 4 > 1)
  baseCalls = 0;
  const ctx = {};
  const r1 = runPolicy(fake, ctx), r2 = runPolicy(fake, ctx), r3 = runPolicy(fake, ctx);
  const s3 = RF.refindStats();
  const r4 = runPolicy(fake, ctx);
  check('stuck-3-fallback', r1.r === true && r2.r === true && r3.r === 'base-handled' && baseCalls === 2 &&
    s3.stuckFallbacks === 1 && r4.r === 'base-handled',
    JSON.stringify({ r1: r1.r, r2: r2.r, r3: r3.r, r4: r4.r, baseCalls: baseCalls, stats: s3 }));
})();

(function () {
  // 7. Consumed push, blocked far side: scholar already on the edge,
  // push does not exit and does not move -> classified 'blocked',
  // wait the turn out, mark unfleeable, next turn delegates to base.
  RF.resetRefindStats();
  const fake = fakeTb({ php: 20, mhp: 900, pushScript: ['consume'] });
  fake.p.mx = 0; fake.p.my = 4;
  baseCalls = 0;
  const ctx = {};
  const r1 = runPolicy(fake, ctx);
  const s1 = RF.refindStats();
  const r2 = runPolicy(fake, ctx);
  check('consumed-blocked-fallback', r1.r === true && fake.calls.waits === 1 && fake.calls.pushes === 1 &&
    s1.consumedPushes === 1 && s1.pushes.blocked === 1 && s1.sealedFallbacks === 1 &&
    s1.events[0].result === 'consumed-blocked' && r2.r === 'base-handled' && baseCalls === 1,
    JSON.stringify({ r1: r1.r, r2: r2.r, waits: fake.calls.waits, stats: s1 }));
})();

(function () {
  // 8. Consumed push, sealed: the fight seals AFTER the trigger fired
  // (noFlee set between turns, mid-disengage) -> classified 'sealed'.
  RF.resetRefindStats();
  const fake = fakeTb({ php: 20, mhp: 900, pushScript: ['consume'] });
  baseCalls = 0;
  const ctx = {};
  runPolicy(fake, ctx); // trigger fires, walk step 1
  fake.f.noFlee = true; // seal lands mid-disengage
  let r;
  for (let i = 0; i < 3; i++) { r = runPolicy(fake, ctx); } // walks 2-4 to the edge
  r = runPolicy(fake, ctx); // push: sealed
  const s1 = RF.refindStats();
  check('consumed-sealed-classified', r.r === true && fake.calls.waits === 1 && fake.calls.pushes === 1 &&
    s1.pushes.sealed === 1 && s1.events[0].result === 'consumed-sealed',
    JSON.stringify({ r: r.r, waits: fake.calls.waits, stats: s1 }));
})();

(function () {
  // 9. Haven-hold: the fight is ON the haven node -> chooseFleeDir is
  // null, the trigger fires but the scholar HOLDS and base fights.
  RF.resetRefindStats();
  const fake = fakeTb({ php: 20, mhp: 900, mapX: 4, mapY: 4 });
  baseCalls = 0;
  const ctx = {};
  const r1 = runPolicy(fake, ctx);
  const s1 = RF.refindStats();
  const r2 = runPolicy(fake, ctx);
  check('haven-hold', r1.r === 'base-handled' && s1.triggerFires === 1 && s1.havenHolds === 1 &&
    s1.events[0].result === 'haven-hold' && r2.r === 'base-handled' && baseCalls === 2,
    JSON.stringify({ r1: r1.r, r2: r2.r, baseCalls: baseCalls, stats: s1 }));
})();

(function () {
  // 10. Sealed suppression: a fight that STARTS sealed (noFlee, or a
  // table trial) never evaluates the trigger; counted once per fight.
  RF.resetRefindStats();
  let fake = fakeTb({ php: 10, mhp: 900, noFlee: true });
  baseCalls = 0;
  let r = runPolicy(fake);
  check('sealed-suppression-noflee', r.r === 'base-handled' && baseCalls === 1 && RF.refindStats().triggerFires === 0 && RF.refindStats().suppressions === 1,
    JSON.stringify({ r: r.r, stats: RF.refindStats() }));
  fake = fakeTb({ php: 10, mhp: 900, tableTrial: true });
  baseCalls = 0;
  r = runPolicy(fake);
  check('sealed-suppression-trial', r.r === 'base-handled' && baseCalls === 1 && RF.refindStats().triggerFires === 0 && RF.refindStats().suppressions === 2,
    JSON.stringify({ r: r.r, stats: RF.refindStats() }));
})();

(function () {
  // 11. Once fired, the disengage commits: HP drifting back above the
  // line mid-chase must NOT hand the turn back to base.
  RF.resetRefindStats();
  const fake = fakeTb({ php: 50, mhp: 900, mapX: 6, pushScript: ['cross', 'exit'] });
  baseCalls = 0;
  const ctx = {};
  let r;
  for (let i = 0; i < 4; i++) { r = runPolicy(fake, ctx); } // 4 walks
  fake.p.hp = 90; // heals above the 75% line mid-disengage (fixture-only)
  r = runPolicy(fake, ctx); // push #1: cross
  const s = RF.refindStats();
  check('commit-after-fire', r.r === true && s.crossings === 1 && baseCalls === 0,
    JSON.stringify({ r: r.r, stats: s }));
})();

(function () {
  // 12. monsterHpFrac sums across live wave-4+ fighters; stats reset +
  // copy isolation; fightWaves: unknown monster is never wave 4+.
  const w4 = [{ hp: 300, maxHp: 1000 }, { hp: 100, maxHp: 500 }];
  check('monsterHpFrac-sums', Math.abs(RF.monsterHpFrac(w4) - 400 / 1500) < 1e-9, String(RF.monsterHpFrac(w4)));
  RF.resetRefindStats();
  const a = RF.refindStats();
  a.triggerFires = 99;
  check('stats-copy-isolated', RF.refindStats().triggerFires === 0);
  const G = { tbfight: { over: false, fighters: [{ kind: 'monster', alive: true, monsterId: 'mystery', mdef: { id: 'mystery' }, hp: 10 }] }, data: { monsters: [{ id: 'w4a', wave: 4 }] } };
  check('fightWaves-unknown-not-w4plus', RF.fightWaves(G).w4plus.length === 0 && RF.fightWaves(G).unknown.length === 1);
})();

// Restore the real base fight before any live leg.
BASE.competent.fight = origBaseFight;

// ---- instrument smoke (staypolicy instrument, reused unchanged) ----
(function () {
  const G = {
    villagerId: 'leader',
    data: {
      monsters: [{ id: 'w4a', wave: 4 }, { id: 'w3a', wave: 3 }],
      items: [{ id: 'bark_armor', armor: { protection: 10 } }, { id: 'shard_spear', weapon: { bonus: 25 } }],
      villagers: [], background_survivors: [],
    },
    state: { scholar: { day: 50 }, waveKillLog: [], village: { fallen: [], roster: ['leader'], health: {} } },
    map: { px: 4, py: 4 },
    getPerson: function (id) { return { equipped: { melee: { itemId: 'shard_spear' }, torso: { itemId: 'bark_armor' } } }; },
    playerAtHaven: function () { return true; },
    tbfight: null,
    fieldFight: function () { return { outcome: 'mFlee', rounds: 6, mDealt: 300, allyDealt: 50, vTaken: 20, mHpLeft: 650, partySize: 1, intent: 'engage', intentWhy: 'party', trickLog: [] }; },
    startCombat: function (mid) { G.tbfight = { round: 1, fighters: [{ kind: 'villager', villagerId: 'leader', hp: 80 }, { kind: 'monster', monsterId: 'w4a', mdef: { id: 'w4a' }, hp: 900 }] }; return true; },
    tbPlayerStrike: function () { return true; },
    useAbility: function () { return true; },
    tbEnd: function () { return true; },
    recordWaveKill: function () { return true; },
    playerDeath: function () { return true; },
  };
  const inst = INST.install(G);
  check('install-no-errors', inst.t.instrumentErrors.length === 0, JSON.stringify(inst.t.instrumentErrors));
  G.startCombat('w4a');
  G.tbPlayerStrike('m_0');
  G.tbfight.fighters[1].hp = 400; G.tbfight.round = 3;
  G.tbEnd('won');
  check('tb-recorded-not-kill', inst.t.fights.length === 1 && inst.t.fights[0].ending === 'kill-or-rout' && inst.t.fights[0].damageDealt === 500,
    JSON.stringify(inst.t.fights[0]));
  inst.uninstall();
  check('uninstall-restores', inst.t.fights.length === 1);
})();

// ---- analyzer fixtures ----
function arow(seed, opts) {
  const r = { seed: seed, run: 'fixture', days: 100, endReason: 'horizon', won: false,
    fights: [], daily: [{ day: 1, gated: 0, readiness5: { veterans: 0 } }],
    waveKillLog: [], fallen: [], wavesFaced: {}, instrumentErrors: [], deadMap: {},
    scaleRank: 'village', unlockedWave: 1, maxWave: 1,
    refindStats: { fights: 0, triggerFires: 0, fleeTurns: 0, exits: 0, exitsHaven: 0, exitsGaveup: 0,
      crossings: 0, crossingCaps: 0, consumedPushes: 0, pushes: { sealed: 0, worldEdge: 0, blocked: 0, crossed: 0 },
      stuckFallbacks: 0, sealedFallbacks: 0, suppressions: 0, havenHolds: 0, events: [] } };
  return Object.assign(r, opts || {});
}
function ffight(o) {
  return Object.assign({ day: 20, channel: 'field', fighter: 'leader', fighters: ['leader'], mid: 'w4a', wave: 4,
    entryHp: 1000, damageDealt: 200, damageFrac: 0.2, rounds: 5, swingsAttempted: 5, partySize: 1,
    firstKiller: 'k1', firstKillerAliveAtStart: true, firstKillerInFight: false,
    secondCandidatePresent: true, secondCandidates: ['leader'], ending: 'flee', outcomeRaw: 'mFlee',
    gear: { weaponBonus: 25, armorP: 10 },
    focusFire: false, committedFinish: false, committedRounds: 0, shoutRound: null, everWinning: false, everHopeless: false }, o || {});
}
(function () {
  const r = arow(1, {
    fights: [ffight({ day: 20 }), ffight({ day: 21, partySize: 2, fighters: ['leader', 'ally1'], ending: 'kill', outcomeRaw: 'vKill' }), ffight({ day: 22, channel: 'player-tb', ending: 'kill-or-rout', outcomeRaw: 'won' })],
    waveKillLog: [{ d: 21, mid: 'w4a', w: 4, by: 'leader', via: 'field' }],
  });
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-match-one-kill', s.w4killsMatched === 1 && s.unmatchedKills === 0 && s.killRate === 1 / 3,
    JSON.stringify({ matched: s.w4killsMatched, unmatched: s.unmatchedKills, rate: s.killRate }));
  check('analyzer-tb-won-not-kill', s.fights[2].matchedKillBy == null && s.fights[1].matchedKillBy === 'leader',
    JSON.stringify(s.fights.map(function (f) { return f.matchedKillBy; })));
  const s2 = AN.analyzeSeed(JSON.parse(JSON.stringify(r)));
  check('analyzer-determinism', JSON.stringify(s) === JSON.stringify(s2));
})();
(function () {
  // Gates: base 2 TB fights (1 death, 1 matched kill); armed 2 TB fights
  // (1 flee with refind fired, 1 matched kill), 2 trigger fires, 1 exit.
  // G1 1/2, G2 1.0 > 0.5, G3 1.0x, G4 1.0x — all hold, but fires < 15
  // so the thin guard blocks GO.
  const dir = '/tmp/tbretreat-refind-analyzer-' + process.pid;
  fs.mkdirSync(dir, { recursive: true });
  const base = arow(96811, { run: 'tbretreat-refind-baseline', days: 100,
    fights: [ffight({ day: 20, channel: 'player-tb', ending: 'death', outcomeRaw: 'lost' }),
      ffight({ day: 21, channel: 'player-tb', ending: 'kill-or-rout', outcomeRaw: 'won' })],
    waveKillLog: [{ d: 21, mid: 'w4a', w: 4, by: 'leader', via: 'field' }] });
  const armed = arow(96811, { run: 'tbretreat-refind-armed', days: 100,
    fights: [ffight({ day: 20, channel: 'player-tb', ending: 'flee', outcomeRaw: 'fled' }),
      ffight({ day: 23, channel: 'player-tb', ending: 'kill-or-rout', outcomeRaw: 'won', fighters: ['leader'] })],
    waveKillLog: [{ d: 23, mid: 'w4a', w: 4, by: 'leader', via: 'field' }],
    refindStats: { fights: 1, triggerFires: 2, fleeTurns: 7, exits: 1, exitsHaven: 0, exitsGaveup: 1,
      crossings: 1, crossingCaps: 0, consumedPushes: 0, pushes: { sealed: 0, worldEdge: 0, blocked: 0, crossed: 1 },
      stuckFallbacks: 0, sealedFallbacks: 0, suppressions: 0, havenHolds: 0,
      events: [{ day: 20, mid: 'w4a', wave: 4, fighterVid: 'leader', turn: 2, scholarHpFrac: 0.74, monsterHpFrac: 0.9, result: 'exited', exitKind: 'exited-gaveup', crossings: 1 },
        { day: 21, mid: 'w5a', wave: 5, fighterVid: 'leader', turn: 3, scholarHpFrac: 0.7, monsterHpFrac: 0.8, result: 'open', exitKind: null, crossings: 0 }] } });
  fs.writeFileSync(dir + '/tbretreat-refind-s96811-tbretreat-refind-baseline.json', JSON.stringify(base));
  fs.writeFileSync(dir + '/tbretreat-refind-s96811-tbretreat-refind-armed.json', JSON.stringify(armed));
  const out = AN.analyzeDir(dir);
  check('analyzer-gates-hold', out.gates && out.gates.g1.holds && out.gates.g2.holds && out.gates.g3.holds && out.gates.g4.holds,
    JSON.stringify(out.gates));
  check('analyzer-thin-blocks-go', out.gates && out.gates.thin === true && out.gates.go === false,
    JSON.stringify({ thin: out.gates && out.gates.thin, go: out.gates && out.gates.go }));
  check('analyzer-g1-rate', out.gates && out.gates.g1.rate === 0.5 && out.gates.g1.w4onlyRate === 1 && out.gates.g1.w4onlyFires === 1 && out.gates.g1.w4onlyExits === 1,
    JSON.stringify(out.gates && out.gates.g1));
  check('analyzer-reengage-7d', out.reengage && out.reengage.exits === 1 && out.reengage.reengaged7d === 1 && out.reengage.reengagedSameMid7d === 1,
    JSON.stringify(out.reengage));
  check('analyzer-legs-split', out.legs['tbretreat-refind-baseline'] && out.legs['tbretreat-refind-armed'] &&
    out.legs['tbretreat-refind-baseline'].tbDeaths === 1 && out.legs['tbretreat-refind-armed'].tbFlees === 1 &&
    out.legs['tbretreat-refind-armed'].tbFired === 1 && out.legs['tbretreat-refind-armed'].tbFiredFlees === 1,
    JSON.stringify(out.legs));
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
})();

async function liveLegs() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const { Game } = await loadGame({ seed: 96811, mode: 'competent-tbretreat-refind-proof', fullTelemetry: false });
  await setupGame(Game);
  const inst = INST.install(Game);
  let last = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        const d = ((Game.state || {}).scholar || {}).day || 0;
        if (d !== last) { last = d; inst.snapshot(); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 5, manifest: undefined, sampleEvery: 30 }); });
  inst.snapshot();
  const fin = inst.finalize();
  inst.uninstall();
  check('live-smoke', result && result.days > 0 && inst.t.daily.length > 0 && inst.t.instrumentErrors.length === 0 && Array.isArray(fin.waveKillLog),
    'days=' + (result && result.days) + ' snaps=' + inst.t.daily.length + ' errs=' + JSON.stringify(inst.t.instrumentErrors));

  const tmp = '/tmp/tbretreat-refind-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '96811', OUTDIR: tmp });
  // Off/on neutrality (instrument must not move the run).
  execSync('node scripts/tbretreat-refind-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', REFIND_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/tbretreat-refind-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'tbretreat-refind-s96811-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'tbretreat-refind-s96811-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors));
  // Variant-vs-baseline neutrality (no wave-4 fight exists in 10 days, so
  // the variant must be byte-identical in outcome to competent verbatim).
  execSync('node scripts/tbretreat-refind-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-base', POLICY: 'baseline' }), stdio: 'pipe' });
  execSync('node scripts/tbretreat-refind-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-armed', POLICY: 'refind' }), stdio: 'pipe' });
  const pb = JSON.parse(fs.readFileSync(path.join(tmp, 'tbretreat-refind-s96811-proof-base.json'), 'utf8'));
  const pa = JSON.parse(fs.readFileSync(path.join(tmp, 'tbretreat-refind-s96811-proof-armed.json'), 'utf8'));
  check('neutrality-variant-baseline', pb.days === pa.days && pb.endReason === pa.endReason &&
    (pb.waveKillLog || []).length === (pa.waveKillLog || []).length &&
    pb.fights.length === pa.fights.length &&
    (pb.refindStats.triggerFires | 0) === 0 && (pa.refindStats.triggerFires | 0) === 0 &&
    pa.instrumentErrors.length === 0,
    'base=' + pb.days + '/' + pb.endReason + '/' + pb.fights.length +
    ' armed=' + pa.days + '/' + pa.endReason + '/' + pa.fights.length +
    ' errs=' + JSON.stringify(pa.instrumentErrors));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}
liveLegs().catch(function (e) { console.error(e.stack); process.exit(1); });
