// test-stayrecover-20261105.js — proof for arm sim-stayrecover-a.
// Proves the MECHANISM (not the measurement — the judged legs do that):
//  1. Verb (real engine): tbEatRations bites 250 kcal -> +25 HP, debits
//     the pack, spends the action, does not auto-advance while moves
//     remain; partial pack (100-249) eats whole for +floor(kcal/10);
//     the heal caps at maxHp.
//  2. Verb refusals (real engine): pack < 100, full HP, already acted —
//     each returns false and spends NOTHING (no kcal, no HP, no action).
//  3. Policy gate-off: the eat block never runs (control).
//  4. Policy gate-on: a hurt fighter in range eats instead of striking.
//  5. Policy gate-on: never eats instead of a killing blow (weakest
//     monster <= 50 HP -> strike); never eats out of range (closes in
//     instead); short pack falls through to the strike.
//  6. Variant policy opts into exactly the four gates (flee repair +
//     recovery), DPS_RACE and APPROACH_FALLBACK stay off.
//  7. Analyzer: a turn whose only action is an eat classifies 'eat'
//     (not 'no-action'); the summarizer counts eats, HP restored and
//     kcal from the say-line, rounds survived in lost fights, and the
//     approach-loop metric on a fixture corpus.
//  8. Live-harness smoke: loadGame + setupGame + 2 days with the
//     stayrecover policy + instrument, no error.
// Run: node scripts/test-stayrecover-20261105.js (exit 0 = all pass).
'use strict';
const path = require('path');
const assert = require('assert');
const REPO = path.join(__dirname, '..');

function setGates(opts) {
  const keys = ['COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_EXIT_VERIFIED_FLEE',
    'COMPETENT_FLEE_REPAIR', 'COMPETENT_RECOVER'];
  for (const k of keys) delete process.env[k];
  if (opts) for (const k of Object.keys(opts)) { if (opts[k]) process.env[k] = '1'; }
  delete process.env.COMPETENT_DPS_RACE;
  delete process.env.COMPETENT_FIGHT_ASSESS;
}
// The R configuration: the full stayrecover gate set (flee repair + recovery).
const GATES_R = { COMPETENT_DIRECTIONAL_FLEE: '1', COMPETENT_EXIT_VERIFIED_FLEE: '1',
  COMPETENT_FLEE_REPAIR: '1', COMPETENT_RECOVER: '1' };

// Stub TB fight for the POLICY tests: player hurt, one monster, pack of
// a controllable size. Mirrors the fleerepair proof stub, plus the pack
// and a fake tbEatRations that mimics the real verb's contract.
function makeStub(opts) {
  const calls = { moves: [], pushes: [], strikes: 0, eats: 0, endTurns: 0 };
  let pack = opts.pack != null ? opts.pack : 1000;
  const player = { key: 'p', kind: 'player', mx: opts.px, my: opts.py, hp: opts.hp,
    maxHp: 100, moveLeft: 3, acted: false, alive: true };
  const monster = { key: 'm_0', kind: 'monster', mx: opts.mx, my: opts.my,
    hp: opts.mhp != null ? opts.mhp : 500,
    maxHp: opts.mhp != null ? opts.mhp : 500,
    alive: true, monsterId: 'stub', mdef: { id: 'stub' } };
  const fight = { id: 'stub-fight-1', over: false, round: 2,
    fighters: [player, monster] };
  const Game = {
    tbfight: fight, map: { px: opts.mapPx, py: opts.mapPy },
    state: { scholar: { day: 10, kcal: 500 } },
    data: { monsters: [{ id: 'stub', wave: 4 }], abilities: [] },
    villagerId: 'stub-scholar',
    tbIsPlayerTurn: function () { return true; },
    tbFighter: function (k) { return k === 'p' ? player : monster; },
    tbAfterPlayerAction: function () { calls.endTurns++; },
    tbPlayerMove: function () { calls.moves.push(Array.prototype.slice.call(arguments)); return false; },
    tbBarrierExit: function () { calls.pushes.push(Array.prototype.slice.call(arguments)); return true; },
    tbPlayerStrike: function () { calls.strikes++; player.acted = true; return true; },
    tbEatRations: function () {
      calls.eats++;
      if (pack < 100 || player.hp >= player.maxHp || player.acted) return false;
      const bite = Math.min(250, Math.floor(pack));
      pack -= bite;
      player.hp = Math.min(player.maxHp, player.hp + Math.max(1, Math.floor(bite / 10)));
      player.acted = true;
      return true;
    },
    packKcal: function () { return pack; },
    packSpend: function (vid, kcal) { pack = Math.max(0, pack - kcal); },
    equippedWeapon: function () { return { range: 1, name: 'stub knife' }; },
    tileAt: function (x, y) { return (x === 4 && y === 4) ? { type: 'haven' } : { type: 'wild' }; },
    mapSeen: function () { return false; },
    monsterAt: function () { return false; },
  };
  return { Game: Game, ctx: {}, calls: calls, player: player, monster: monster,
    fight: fight, pack: function () { return pack; } };
}

async function main() {
  const base = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const policy = base.competent;

  // 8. Live-harness smoke FIRST (before stub env manipulation).
  {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 99613, mode: 'competent-stayrecover-proof', fullTelemetry: false });
    await setupGame(Game);
    const variant = require(path.join(REPO, 'scripts', 'policies', 'competent-stayrecover-a'));
    const INST = require(path.join(REPO, 'scripts', 'stayrecover-instrument-20261105'));
    const inst = INST.install(Game);
    await quietLog(async function () { await runDays(Game, variant.competent, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    inst.uninstall();
    assert.strictEqual(inst.t.instrumentErrors.length, 0, 'smoke: no instrument errors: ' + JSON.stringify(inst.t.instrumentErrors));
    console.log('smoke: 2-day live run completed (stayrecover policy + instrument)');
  }

  // 1+2. Verb on the REAL engine (godpath lib fight helper).
  {
    const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const lib = require(path.join(REPO, 'scripts', 'godpath', 'lib'));
    const { Game } = await loadGame({ seed: 99613, mode: 'competent-stayrecover-verb', fullTelemetry: false });
    await setupGame(Game);
    const says = lib.captureSays(Game);
    const vid = Game.villagerId;
    lib.fight(Game, 'gallowdeer', { px: 2, py: 4, mx: 3, my: 4, hp: 100 });
    const pf = Game.tbFighter('p');
    assert.ok(Game.tbfight && !Game.tbfight.over, 'verb: real TB fight is live');
    assert.strictEqual(typeof Game.tbEatRations, 'function', 'verb: tbEatRations exists on Game');
    // Seed the pack directly (the test sets the day's ration by hand).
    Game.packKcal(vid);
    Game.state.village.pack[vid].kcal = 1000;
    pf.hp = 40;
    const ok = Game.tbEatRations();
    assert.strictEqual(ok, true, 'verb: eat succeeds when hurt with a full pack');
    assert.strictEqual(pf.hp, 65, 'verb: +25 HP (40 -> 65)');
    assert.strictEqual(Game.packKcal(vid), 750, 'verb: pack debited 250 kcal');
    assert.strictEqual(pf.acted, true, 'verb: action spent');
    assert.strictEqual(Game.tbIsPlayerTurn(), true, 'verb: turn does NOT auto-advance while moves remain');
    assert.ok(says.some(function (l) { return l.indexOf('250 kcal') >= 0 && l.indexOf('+25 HP') >= 0; }),
      'verb: say line names the bite honestly: ' + JSON.stringify(says.slice(-3)));
    // Partial pack: 150 kcal -> +15 HP, pack emptied.
    pf.acted = false; pf.hp = 40;
    Game.state.village.pack[vid].kcal = 150;
    assert.strictEqual(Game.tbEatRations(), true, 'verb: partial pack eats');
    assert.strictEqual(pf.hp, 55, 'verb: partial bite +15 HP (40 -> 55)');
    assert.strictEqual(Game.packKcal(vid), 0, 'verb: partial pack emptied');
    // Cap at maxHp: 90 HP + 25 heal -> 100, pack still debited 250.
    pf.acted = false; pf.hp = 90;
    Game.state.village.pack[vid].kcal = 1000;
    assert.strictEqual(Game.tbEatRations(), true, 'verb: eat at 90 HP succeeds');
    assert.strictEqual(pf.hp, 100, 'verb: heal caps at maxHp');
    assert.strictEqual(Game.packKcal(vid), 750, 'verb: capped eat still pays the bite');
    // Refusal: pack < 100 spends nothing.
    pf.acted = false; pf.hp = 40;
    Game.state.village.pack[vid].kcal = 50;
    assert.strictEqual(Game.tbEatRations(), false, 'verb: short pack refuses');
    assert.strictEqual(pf.hp, 40, 'verb refusal: HP unchanged');
    assert.strictEqual(Game.packKcal(vid), 50, 'verb refusal: pack unchanged');
    assert.strictEqual(pf.acted, false, 'verb refusal: action NOT spent');
    // Refusal: full HP spends nothing.
    pf.acted = false; pf.hp = 100;
    Game.state.village.pack[vid].kcal = 1000;
    assert.strictEqual(Game.tbEatRations(), false, 'verb: full HP refuses');
    assert.strictEqual(Game.packKcal(vid), 1000, 'verb refusal: pack unchanged at full HP');
    // Refusal: already acted spends nothing.
    pf.acted = true; pf.hp = 40;
    assert.strictEqual(Game.tbEatRations(), false, 'verb: already-acted refuses');
    assert.strictEqual(Game.packKcal(vid), 1000, 'verb refusal: pack unchanged when acted');
    assert.strictEqual(pf.hp, 40, 'verb refusal: HP unchanged when acted');
    says.restore();
    try { Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
    console.log('verb: bite math, cap, partial pack, and all three refusals (real engine)');
  }

  // 3. Policy gate-off: no eat — the legacy flee walk ends the turn
  // (the fleerepair proof's control shape: no fallthrough, no strike).
  setGates(false);
  {
    const s = makeStub({ px: 4, py: 4, mx: 5, my: 4, hp: 40, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'gate-off fight() should handle the turn');
    assert.strictEqual(s.calls.eats, 0, 'gate-off: no eat');
    assert.strictEqual(s.calls.strikes, 0, 'gate-off: legacy flee ends the turn, no strike');
    assert.strictEqual(s.calls.endTurns, 1, 'gate-off: turn ended once in the flee walk');
    assert.strictEqual(s.ctx.recoverEats || 0, 0, 'gate-off: no eat counted');
    console.log('gate-off: no eat, legacy flee ends the turn (control)');
  }

  // 4. Policy gate-on (full R config): a hurt fighter in range eats
  // instead of striking. The flee step fails (blocked stub move) and the
  // repair falls through — fight() reaches the eat block before the
  // strike, and the eat spends the action.
  setGates(GATES_R);
  {
    const s = makeStub({ px: 4, py: 4, mx: 5, my: 4, hp: 40, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'gate-on fight() should handle the turn');
    assert.strictEqual(s.calls.eats, 1, 'gate-on: exactly one eat');
    assert.strictEqual(s.calls.strikes, 0, 'gate-on: no strike on the eat turn');
    assert.strictEqual(s.player.hp, 65, 'gate-on: +25 HP from the bite');
    assert.strictEqual(s.pack(), 750, 'gate-on: 250 kcal spent');
    assert.strictEqual(s.ctx.recoverEats, 1, 'gate-on: eat counted');
    assert.strictEqual(s.ctx.recoverKcal, 250, 'gate-on: kcal counted');
    assert.strictEqual(s.ctx.recoverHp, 25, 'gate-on: HP counted');
    console.log('gate-on: hurt fighter in range eats (+25 HP, 250 kcal) instead of striking');
  }

  // 5a. Policy gate-on: weakest monster <= 50 HP -> strike, never eat.
  setGates(GATES_R);
  {
    const s = makeStub({ px: 4, py: 4, mx: 5, my: 4, hp: 40, mhp: 50, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'kill-blow fight() should handle the turn');
    assert.strictEqual(s.calls.eats, 0, 'kill-blow: no eat instead of a killing blow');
    assert.strictEqual(s.calls.strikes, 1, 'kill-blow: strike fired');
    console.log('gate-on: killing blow -> strike, never eat');
  }

  // 5b. Policy gate-on: out of range -> no eat. The flee step is
  // attempted (a move is recorded) and the turn is spent there; the
  // eat block is never reached, so nothing is eaten.
  setGates(GATES_R);
  {
    const s = makeStub({ px: 2, py: 4, mx: 6, my: 4, hp: 40, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'out-of-range fight() should handle the turn');
    assert.strictEqual(s.calls.eats, 0, 'out-of-range: no eat');
    assert.ok(s.calls.moves.length >= 1, 'out-of-range: a flee step was attempted');
    console.log('gate-on: out of range -> no eat');
  }

  // 5c. Policy gate-on: short pack -> verb refuses, falls through to strike.
  setGates(GATES_R);
  {
    const s = makeStub({ px: 4, py: 4, mx: 5, my: 4, hp: 40, pack: 50, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'short-pack fight() should handle the turn');
    assert.strictEqual(s.calls.eats, 0, 'short-pack: no eat');
    assert.strictEqual(s.calls.strikes, 1, 'short-pack: falls through to strike');
    assert.strictEqual(s.pack(), 50, 'short-pack: pack untouched');
    console.log('gate-on: short pack -> no eat, falls through to strike');
  }

  // 5d. Policy gate-on: healthy fighter (hpPct >= 0.50) never eats.
  setGates(GATES_R);
  {
    const s = makeStub({ px: 4, py: 4, mx: 5, my: 4, hp: 60, mapPx: 5, mapPy: 4 });
    const ret = policy.fight(s.Game, s.ctx);
    assert.strictEqual(ret, true, 'healthy fight() should handle the turn');
    assert.strictEqual(s.calls.eats, 0, 'healthy: no eat at 60% HP');
    assert.strictEqual(s.calls.strikes, 1, 'healthy: strike as usual');
    console.log('gate-on: healthy fighter (60%) never eats');
  }

  // 6. Variant policy opts into exactly the four gates (LAST: mutates env).
  {
    const before = base.competent;
    const variant = require(path.join(REPO, 'scripts', 'policies', 'competent-stayrecover-a'));
    assert.strictEqual(process.env.COMPETENT_DIRECTIONAL_FLEE, '1', 'variant: directional on');
    assert.strictEqual(process.env.COMPETENT_EXIT_VERIFIED_FLEE, '1', 'variant: exit-verified on');
    assert.strictEqual(process.env.COMPETENT_FLEE_REPAIR, '1', 'variant: flee-repair on');
    assert.strictEqual(process.env.COMPETENT_RECOVER, '1', 'variant: recover on');
    assert.strictEqual(process.env.COMPETENT_DPS_RACE, undefined, 'variant: DPS_RACE stays off');
    assert.strictEqual(process.env.COMPETENT_APPROACH_FALLBACK, undefined, 'variant: APPROACH_FALLBACK stays off');
    assert.strictEqual(variant.competent, before, 'variant: competent object unchanged');
    console.log('variant: four gates on, DPS_RACE + APPROACH_FALLBACK off, competent unchanged');
  }

  // 7. Analyzer eat class + summarizer recovery/loop metrics on fixtures.
  {
    const A = require(path.join(REPO, 'scripts', 'stayrecover-analyze-20261105'));
    const ex = {
      seq: 1, day: 50, mid: 'w4stub', partySizeStart: 1, trickKnown: false,
      end: { result: 'lost', day: 50, round: 9, monsters: [], humans: [{ vid: 'v1', alive: false }] },
      transcript: [],
      turns: [
        { turnSeq: 1, round: 2, extra: false,
          start: { player: { hp: 40, maxHp: 100, moveLeft: 3, acted: false, mx: 4, my: 4 }, weapon: { range: 1 },
            monsters: [{ key: 'm_0', mid: 'w4stub', hp: 500, maxHp: 900, alive: true }],
            dists: [{ key: 'm_0', mid: 'w4stub', dist: 1, inRange: true }] },
          actions: [{ kind: 'eat', returned: true,
            pre: { player: { hp: 40, maxHp: 100, moveLeft: 3, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] },
            post: { player: { hp: 65, maxHp: 100, moveLeft: 3, acted: true, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] } }],
          sayLines: ['You tear into your rations mid-fight — 250 kcal, +25 HP. The pack is lighter now. (750 kcal left)'],
          end: { player: { hp: 65, maxHp: 100, moveLeft: 0, acted: true, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] },
          closeReason: 'advance' },
        { turnSeq: 2, round: 3, extra: false,
          start: { player: { hp: 65, maxHp: 100, moveLeft: 3, acted: false, mx: 4, my: 4 }, weapon: { range: 1 },
            monsters: [{ key: 'm_0', mid: 'w4stub', hp: 500, maxHp: 900, alive: true }],
            dists: [{ key: 'm_0', mid: 'w4stub', dist: 3, inRange: false }] },
          actions: [{ kind: 'move', returned: false,
            pre: { player: { hp: 65, maxHp: 100, moveLeft: 3, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] },
            post: { player: { hp: 65, maxHp: 100, moveLeft: 2, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] } }],
          sayLines: ['No path there.'],
          end: { player: { hp: 65, maxHp: 100, moveLeft: 2, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] },
          closeReason: 'advance' },
        { turnSeq: 3, round: 4, extra: false,
          start: { player: { hp: 65, maxHp: 100, moveLeft: 3, acted: false, mx: 4, my: 4 }, weapon: { range: 1 },
            monsters: [{ key: 'm_0', mid: 'w4stub', hp: 500, maxHp: 900, alive: true }],
            dists: [{ key: 'm_0', mid: 'w4stub', dist: 3, inRange: false }] },
          actions: [{ kind: 'move', returned: false,
            pre: { player: { hp: 65, maxHp: 100, moveLeft: 3, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] },
            post: { player: { hp: 65, maxHp: 100, moveLeft: 2, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] } }],
          sayLines: ['No path there.'],
          end: { player: { hp: 65, maxHp: 100, moveLeft: 2, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] },
          closeReason: 'advance' },
        { turnSeq: 4, round: 5, extra: false,
          start: { player: { hp: 65, maxHp: 100, moveLeft: 3, acted: false, mx: 4, my: 4 }, weapon: { range: 1 },
            monsters: [{ key: 'm_0', mid: 'w4stub', hp: 500, maxHp: 900, alive: true }],
            dists: [{ key: 'm_0', mid: 'w4stub', dist: 3, inRange: false }] },
          actions: [{ kind: 'move', returned: false,
            pre: { player: { hp: 65, maxHp: 100, moveLeft: 3, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] },
            post: { player: { hp: 65, maxHp: 100, moveLeft: 2, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] } }],
          sayLines: ['No path there.'],
          end: { player: { hp: 65, maxHp: 100, moveLeft: 2, acted: false, mx: 4, my: 4 }, weapon: { range: 1 }, monsters: [], dists: [] },
          closeReason: 'advance' },
      ],
      npcTurns: [], hits: [], kills: [],
    };
    const sum = A.summarize(ex);
    assert.strictEqual(sum.outcome, 'fighter-died', 'analyzer: lost fight outcome');
    assert.strictEqual(sum.turns[0].cls, 'eat', 'analyzer: eat-only turn classifies eat');
    assert.strictEqual(sum.turnHist.eat, 1, 'analyzer: turnHist counts the eat');
    assert.strictEqual(sum.turns[1].cls, 'move-only', 'analyzer: blocked approach turn is move-only');
    assert.strictEqual(sum.rounds, 9, 'analyzer: rounds survived reads end.round');
    // Summarizer on a one-file fixture corpus (in /tmp, never in the repo).
    const fs = require('fs');
    const os = require('os');
    const cp = require('child_process');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stayrecover-summ-'));
    try {
      const j = { seed: 99613, run: 'stayrecover-recovery', policy: 'stayrecover',
        anchorCommit: 'fixture', days: 140, gameDays: 140, endReason: 'survived',
        won: false, villageLost: false, maxWave: 4, spawnsW4: 1, tbCalls: 4,
        fieldCallsW4: 0, exposures: [ex], killsW4: 0, killRows: [],
        unlinkedKills: [], spawns: [], orphanTbEnds: [], wrapCounts: {},
        instrumentErrors: [], notes: [], deaths: [],
        scaleSamples: null, standingSamples: null, scaleRankFinal: 'village',
        standingFinal: 100, arcFinal: 1, tableWaiting: false, tableEntered: false,
        nationalReached: false, maxStanding: 100, scaleReadError: null };
      fs.writeFileSync(path.join(dir, 'stayrecover-s99613-stayrecover-recovery.json'), JSON.stringify(j) + '\n');
      const out = cp.execFileSync(process.execPath,
        [path.join(REPO, 'scripts', 'stayrecover-summarize-20261105.js'), dir, 'stayrecover-recovery'],
        { encoding: 'utf8' });
      const t = JSON.parse(out).totals;
      assert.strictEqual(t.eats, 1, 'summarizer: one eat counted');
      assert.strictEqual(t.eatHpTotal, 25, 'summarizer: +25 HP restored');
      assert.strictEqual(t.eatKcalTotal, 250, 'summarizer: 250 kcal parsed from the say-line');
      assert.strictEqual(t.medianHpPerEat, 25, 'summarizer: median HP per eat');
      assert.strictEqual(t.medianRoundsLost, 9, 'summarizer: median rounds survived in lost fights');
      assert.strictEqual(t.approachLoopFights, 1, 'summarizer: one approach-loop fight (3 blocked turns)');
      assert.strictEqual(t.approachLoopMaxRun, 3, 'summarizer: longest approach loop is 3 turns');
      assert.strictEqual(t.approachLoopTurns, 3, 'summarizer: three loop turns');
      console.log('analyzer+summarizer: eat class, recovery metrics, rounds lost, approach loop (fixture)');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log('test-stayrecover-20261105: ALL PASS');
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
