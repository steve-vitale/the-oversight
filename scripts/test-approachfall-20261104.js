// test-approachfall-20261104.js — proof for arm sim-approachfall-b.
// Proves the MECHANISM (not the measurement — the judged legs do that):
//  1. Gate-off: failed approach steps re-issue every turn, no wait,
//     no re-pick, no mark (control — live path byte-identical).
//  2. Gate-on, no reachable adjacent tile: 3 failed steps mark the
//     fight approach-blocked; the 4th turn WAITS (no endTurn after
//     it) instead of re-issuing the failed step.
//  3. Gate-on re-pick: with a farther adjacent tile reachable, the
//     blocked turn steps to it; on success the block clears and the
//     next turn strikes from range.
//  4. Gate-on geometry reset: a monster move clears the blocked state
//     so the next turn runs the primary path again (not a wait).
//  5. The variant policy opts into exactly the four gates, no defaults.
//  6. The analyzer flags a 4-same-step loop fight and clears a
//     wait-fallback fight, a re-pick fight, and a striking fight.
//  7. Live-harness smoke: loadGame + setupGame + 2 days run with the
//     variant policy without error.
//  8. The summarizer counts approach-loop fights and player-flagged
//     starvation on fixture corpora in /tmp (never in the repo).
// Run: node scripts/test-approachfall-20261104.js (exit 0 = all pass).
'use strict';
const path = require('path');
const assert = require('assert');
const REPO = path.join(__dirname, '..');

const GATES = ['COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_EXIT_VERIFIED_FLEE',
  'COMPETENT_FLEE_REPAIR', 'COMPETENT_APPROACH_FALLBACK'];
function setGates(on) {
  for (const k of GATES) { if (on) process.env[k] = '1'; else delete process.env[k]; }
  delete process.env.COMPETENT_DPS_RACE;
  delete process.env.COMPETENT_FIGHT_ASSESS;
}

// Stub TB fight: player at (4,4), one monster at (6,6) (distance 2,
// range 1, so the approach branch runs). tbPlayerMove is configurable:
// fail (no move) or succeed (move to the requested tile). findPath is
// configurable per destination tile: null = blocked, [[x,y]] = route.
function makeStub(opts) {
  const calls = { moves: [], waits: 0, strikes: 0, endTurns: 0 };
  const player = { key: 'p', kind: 'player', mx: 4, my: 4, hp: 100,
    maxHp: 100, moveLeft: 3, acted: false, alive: true };
  const monster = { key: 'm_0', kind: 'monster', mx: 6, my: 6, hp: 100,
    maxHp: 100, alive: true, monsterId: 'stub', mdef: { id: 'stub' } };
  const fight = { id: 'stub-fight-1', over: false, round: 2,
    fighters: [player, monster] };
  const Game = {
    tbfight: fight, map: { px: 5, py: 4 },
    state: { scholar: { day: 10, kcal: 500 } },
    data: { monsters: [{ id: 'stub', wave: 1 }], abilities: [] },
    tbIsPlayerTurn: function () { return true; },
    tbFighter: function (k) { return k === 'p' ? player : monster; },
    tbAfterPlayerAction: function () { calls.endTurns++; },
    tbPlayerMove: function (x, y) {
      calls.moves.push([x, y]);
      if (opts.moveOk && opts.moveOk(x, y)) { player.mx = x; player.my = y; return true; }
      return false;
    },
    tbPlayerWait: function () {
      calls.waits++; player.acted = true; player.moveLeft = 0; return true;
    },
    tbPlayerStrike: function () { calls.strikes++; player.acted = true; return true; },
    tbPlayerStudy: function () { return false; },
    equippedWeapon: function () { return { range: 1, name: 'stub knife' }; },
    findPath: function (sx, sy, tx, ty) {
      if (opts.pathOk) return opts.pathOk(tx, ty) ? [[tx, ty]] : null;
      return null;
    },
    tileAt: function (x, y) { return (x === 4 && y === 4) ? { type: 'haven' } : { type: 'wild' }; },
    mapSeen: function () { return false; },
    monsterAt: function () { return false; },
  };
  function nextTurn() { player.moveLeft = 3; player.acted = false; fight.round++; }
  return { Game: Game, ctx: {}, calls: calls, player: player, monster: monster,
    fight: fight, nextTurn: nextTurn };
}

function failTurn(s, policy) {
  const ret = policy.fight(s.Game, s.ctx);
  assert.strictEqual(ret, true, 'fight() should handle the turn');
  s.nextTurn();
}

async function main() {
  const base = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const policy = base.competent;

  // 7. Live-harness smoke FIRST (before stub env manipulation).
  {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const variant = require(path.join(REPO, 'scripts', 'policies', 'competent-approachfall-b'));
    const { Game } = await loadGame({ seed: 99801, mode: 'competent-approachfall-proof', fullTelemetry: false });
    await setupGame(Game);
    const INST = require(path.join(REPO, 'scripts', 'fleerepair-instrument-20261104'));
    const inst = INST.install(Game);
    await quietLog(async function () { await runDays(Game, variant.competent, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    inst.uninstall();
    console.log('smoke: 2-day live run with variant policy completed');
  }

  // 1. Gate-off control: 5 failed steps, no wait, no mark.
  setGates(false);
  {
    const s = makeStub({ moveOk: function () { return false; } });
    for (let i = 0; i < 5; i++) failTurn(s, policy);
    assert.strictEqual(s.calls.moves.length, 5, 'gate-off: step re-issued every turn');
    assert.strictEqual(s.calls.waits, 0, 'gate-off: no wait fallback');
    assert.strictEqual(s.calls.endTurns, 5, 'gate-off: turn ended each time');
    assert.strictEqual(s.ctx._approachBlockedFor, undefined, 'gate-off: never marked blocked');
    assert.strictEqual(s.ctx.approachFallbackMarks || 0, 0, 'gate-off: no marks counted');
    console.log('gate-off: 5 failed steps re-issued, no wait, no mark (control)');
  }

  // 2. Gate-on, nothing reachable: 3 fails -> blocked, 4th+ wait.
  setGates(true);
  {
    const s = makeStub({ moveOk: function () { return false; } });
    failTurn(s, policy); failTurn(s, policy); failTurn(s, policy);
    assert.strictEqual(s.ctx._approachBlockedFor, 'stub-fight-1', 'gate-on: marked blocked after 3 fails');
    assert.strictEqual(s.ctx.approachFallbackMarks, 1, 'gate-on: exactly one mark');
    assert.strictEqual(s.calls.moves.length, 3, 'gate-on: exactly 3 step attempts');
    failTurn(s, policy);
    assert.strictEqual(s.calls.waits, 1, 'gate-on: 4th turn waits');
    assert.strictEqual(s.calls.moves.length, 3, 'gate-on: no 4th step attempt');
    assert.strictEqual(s.calls.endTurns, 3, 'gate-on: no endTurn after wait');
    failTurn(s, policy);
    assert.strictEqual(s.calls.waits, 2, 'gate-on: 5th turn still waits (frozen geometry)');
    assert.strictEqual(s.ctx.approachFallbackWaits, 2, 'gate-on: waits counted');
    console.log('gate-on blocked: 3 fails -> mark, then waits, no endTurn after wait');
  }

  // 3. Gate-on re-pick: (5,5) blocked, (5,6) reachable and stepping
  // there succeeds -> block clears -> next turn strikes from range.
  setGates(true);
  {
    const s = makeStub({
      moveOk: function (x, y) { return x === 5 && y === 6; },
      pathOk: function (tx, ty) { return tx === 5 && ty === 6; },
    });
    failTurn(s, policy); failTurn(s, policy); failTurn(s, policy);
    assert.strictEqual(s.ctx._approachBlockedFor, 'stub-fight-1', 're-pick: blocked after 3 fails');
    failTurn(s, policy);
    assert.deepStrictEqual(s.calls.moves[3], [5, 6], 're-pick: 4th turn steps to the reachable tile');
    assert.strictEqual(s.ctx._approachBlockedFor, null, 're-pick: block cleared on success');
    assert.strictEqual(s.ctx.approachRepickSteps, 1, 're-pick: success counted');
    assert.strictEqual(s.calls.endTurns, 4, 're-pick: step turn ended normally');
    failTurn(s, policy);
    assert.strictEqual(s.calls.strikes, 1, 're-pick: next turn strikes from range');
    console.log('gate-on re-pick: blocked -> alternate tile -> cleared -> strike');
  }

  // 4. Gate-on geometry reset: monster move clears the blocked state.
  setGates(true);
  {
    const s = makeStub({ moveOk: function () { return false; } });
    failTurn(s, policy); failTurn(s, policy); failTurn(s, policy);
    assert.strictEqual(s.ctx._approachBlockedFor, 'stub-fight-1', 'geometry: blocked before move');
    s.monster.mx = 6; s.monster.my = 5; // monster steps: geometry changed
    failTurn(s, policy);
    assert.strictEqual(s.calls.waits, 0, 'geometry: no wait after monster move');
    assert.strictEqual(s.calls.moves.length, 4, 'geometry: primary path retried');
    assert.strictEqual(s.ctx._approachBlockedFor, null, 'geometry: blocked cleared by reset');
    console.log('gate-on geometry reset: monster move -> primary path retried, no wait');
  }

  // 6. Analyzer: loop fight flagged; wait / re-pick / striking fights clear.
  {
    const AN = require(path.join(REPO, 'scripts', 'approachfall-analyze-20261104'));
    function failedTurn(seq, target) {
      return { turnSeq: seq, round: seq + 1, extra: false,
        start: { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 100, maxHp: 100 },
          weapon: { range: 1 }, monsters: [{ key: 'm_0', mx: 6, my: 6, alive: true }],
          dists: [{ key: 'm_0', mid: 'stub', dist: 2, inRange: false }] },
        actions: [{ fn: 'tbPlayerMove', kind: 'move', args: [String(target[0]), String(target[1])],
          returned: false,
          pre: { player: { mx: 4, my: 4, moveLeft: 3, acted: false } },
          post: { player: { mx: 4, my: 4, moveLeft: 3, acted: true } } }],
        sayMark: 0, end: null, closeReason: 'advance', sayLines: ['No path there.'] };
    }
    function waitTurn(seq) {
      return { turnSeq: seq, round: seq + 1, extra: false,
        start: { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 100, maxHp: 100 },
          weapon: { range: 1 }, monsters: [{ key: 'm_0', mx: 6, my: 6, alive: true }],
          dists: [{ key: 'm_0', mid: 'stub', dist: 2, inRange: false }] },
        actions: [{ fn: 'tbPlayerWait', kind: 'wait', args: [], returned: true,
          pre: { player: { mx: 4, my: 4, moveLeft: 3, acted: false } },
          post: { player: { mx: 4, my: 4, moveLeft: 0, acted: true } } }],
        sayMark: 0, end: null, closeReason: 'advance', sayLines: [] };
    }
    function strikeTurn(seq) {
      return { turnSeq: seq, round: seq + 1, extra: false,
        start: { player: { mx: 5, my: 6, moveLeft: 3, acted: false, hp: 100, maxHp: 100 },
          weapon: { range: 1 }, monsters: [{ key: 'm_0', mx: 6, my: 6, alive: true }],
          dists: [{ key: 'm_0', mid: 'stub', dist: 1, inRange: true }] },
        actions: [{ fn: 'tbPlayerStrike', kind: 'strike', args: ['m_0'], returned: true,
          pre: { player: { mx: 5, my: 6, moveLeft: 3, acted: false } },
          post: { player: { mx: 5, my: 6, moveLeft: 3, acted: true } } }],
        sayMark: 0, end: null, closeReason: 'advance', sayLines: [] };
    }
    function exposure(turns, hits) {
      return { seq: 1, day: 50, mid: 'stub', wave: 4, fightId: 'fx-1',
        partySizeStart: 1, party: [], trickKnown: false,
        monsters: [{ key: 'm_0', mid: 'stub', hpStart: 500, maxHp: 500, wave: 4 }],
        hits: hits || [], transcript: [], abilityUses: [], shoutUses: 0, offerFoodUses: 0,
        turns: turns, npcTurns: [],
        end: { result: 'lost', day: 50, round: 9, monsters: [{ key: 'm_0', mid: 'stub', alive: true, hp: 500 }],
          humans: [{ key: 'p', alive: false }], monsterDeadW4: 0, monsterTotalW4: 1,
          humansDead: ['x'], humansFled: [], monstersFled: [] }, kills: [] };
    }
    const loop = AN.analyzeApproach(exposure(
      [failedTurn(1, [5, 5]), failedTurn(2, [5, 5]), failedTurn(3, [5, 5]), failedTurn(4, [5, 5])]));
    assert.strictEqual(loop.isLoopFight, true, 'analyzer: 4 same-step fails = loop');
    assert.strictEqual(loop.maxSameStepRun, 4, 'analyzer: max run 4');
    assert.strictEqual(loop.noPathLines, 4, 'analyzer: No-path lines counted');
    const waitFb = AN.analyzeApproach(exposure(
      [failedTurn(1, [5, 5]), failedTurn(2, [5, 5]), failedTurn(3, [5, 5]), waitTurn(4)]));
    assert.strictEqual(waitFb.isLoopFight, false, 'analyzer: wait fallback breaks the loop');
    assert.strictEqual(waitFb.maxSameStepRun, 3, 'analyzer: wait-fallback max run 3');
    const repick = AN.analyzeApproach(exposure(
      [failedTurn(1, [5, 5]), failedTurn(2, [5, 5]), failedTurn(3, [5, 5]),
        { turnSeq: 4, round: 5, extra: false,
          start: { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 100, maxHp: 100 },
            weapon: { range: 1 }, monsters: [{ key: 'm_0', mx: 6, my: 6, alive: true }],
            dists: [{ key: 'm_0', mid: 'stub', dist: 2, inRange: false }] },
          actions: [{ fn: 'tbPlayerMove', kind: 'move', args: ['5', '6'], returned: true,
            pre: { player: { mx: 4, my: 4, moveLeft: 3, acted: false } },
            post: { player: { mx: 5, my: 6, moveLeft: 2, acted: true } } }],
          sayMark: 0, end: null, closeReason: 'advance', sayLines: [] }]));
    assert.strictEqual(repick.isLoopFight, false, 'analyzer: successful re-pick breaks the loop');
    assert.strictEqual(repick.maxSameStepRun, 3, 'analyzer: re-pick max run 3');
    const striker = AN.analyzeApproach(exposure(
      [failedTurn(1, [5, 5]), strikeTurn(2)],
      [{ targetKind: 'monster', targetKey: 'm_0', hpDelta: -10, turnSeq: 2, sourceClass: 'leader' }]));
    assert.strictEqual(striker.isLoopFight, false, 'analyzer: a striking fight is not a loop');
    console.log('analyzer: loop flagged, wait/re-pick/strike fights cleared');
  }

  // 5. Variant policy opts into exactly the four gates (LAST: mutates env).
  // The smoke already required the variant once, so Node's module cache
  // would swallow a second require — drop it from the cache first so
  // this require actually re-runs the file's env assignments.
  {
    setGates(false);
    const before = base.competent;
    const variantPath = path.join(REPO, 'scripts', 'policies', 'competent-approachfall-b');
    delete require.cache[require.resolve(variantPath)];
    const variant = require(variantPath);
    assert.strictEqual(process.env.COMPETENT_DIRECTIONAL_FLEE, '1', 'variant: directional on');
    assert.strictEqual(process.env.COMPETENT_EXIT_VERIFIED_FLEE, '1', 'variant: exit-verified on');
    assert.strictEqual(process.env.COMPETENT_FLEE_REPAIR, '1', 'variant: flee-repair on');
    assert.strictEqual(process.env.COMPETENT_APPROACH_FALLBACK, '1', 'variant: approach-fallback on');
    assert.strictEqual(process.env.COMPETENT_DPS_RACE, undefined, 'variant: DPS_RACE stays off');
    assert.strictEqual(variant.competent, before, 'variant: competent object unchanged');
    console.log('variant: four gates on, DPS_RACE off, competent unchanged');
  }

  // 8. Summarizer: loop fights + player-flagged starvation on fixtures.
  {
    const fs = require('fs');
    const os = require('os');
    const cp = require('child_process');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'approachfall-summ-'));
    try {
      const failT = function (seq) {
        return { turnSeq: seq, round: seq + 1, extra: false,
          start: { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 100, maxHp: 100 },
            weapon: { range: 1 }, monsters: [{ key: 'm_0', mx: 6, my: 6, alive: true }],
            dists: [{ key: 'm_0', mid: 'stub', dist: 2, inRange: false }] },
          actions: [{ fn: 'tbPlayerMove', kind: 'move', args: ['5', '5'], returned: false,
            pre: { player: { mx: 4, my: 4, moveLeft: 3, acted: false } },
            post: { player: { mx: 4, my: 4, moveLeft: 3, acted: true } } }],
          sayMark: 0, end: null, closeReason: 'advance', sayLines: ['No path there.'] };
      };
      const loopEx = { seq: 1, day: 50, mid: 'stub', wave: 4, fightId: 'fx-1',
        partySizeStart: 1, party: [], trickKnown: false,
        monsters: [{ key: 'm_0', mid: 'stub', hpStart: 500, maxHp: 500, wave: 4 }],
        hits: [], transcript: [], abilityUses: [], shoutUses: 0, offerFoodUses: 0,
        turns: [failT(1), failT(2), failT(3), failT(4)], npcTurns: [],
        end: { result: 'lost', day: 50, round: 9, monsters: [{ key: 'm_0', mid: 'stub', alive: true, hp: 500 }],
          humans: [{ key: 'p', alive: false }], monsterDeadW4: 0, monsterTotalW4: 1,
          humansDead: ['x'], humansFled: [], monstersFled: [] }, kills: [] };
      const baseJ = { exposures: [], killRows: [], deaths: [], days: 140,
        endReason: 'lost', won: false, spawnsW4: 0, tbCalls: 0,
        fieldCallsW4: 0, maxWave: 4, orphanTbEnds: [], instrumentErrors: [] };
      fs.writeFileSync(path.join(dir, 'approachfall-s90001-pilot-baseline.json'),
        JSON.stringify(Object.assign({}, baseJ, { seed: 90001, exposures: [loopEx],
          deaths: [{ day: 50, kind: 'villager', who: 'v1', cause: 'starvation', player: true },
            { day: 60, kind: 'villager', who: 'v2', cause: 'starvation', player: false }] })) + '\n');
      fs.writeFileSync(path.join(dir, 'approachfall-s90002-pilot-baseline.json'),
        JSON.stringify(Object.assign({}, baseJ, { seed: 90002 })) + '\n');
      const out = cp.execFileSync(process.execPath,
        [path.join(REPO, 'scripts', 'approachfall-summarize-20261104.js'), dir, 'pilot-baseline'],
        { encoding: 'utf8' });
      const sum = JSON.parse(out);
      assert.strictEqual(sum.totals.approachLoopFights, 1, 'summarizer: exactly one loop fight');
      assert.strictEqual(sum.totals.failedApproachTurns, 4, 'summarizer: failed turns counted');
      assert.strictEqual(sum.totals.noPathLines, 4, 'summarizer: No-path lines counted');
      assert.strictEqual(sum.totals.starvationDeaths, 2, 'summarizer: starvation totals');
      assert.strictEqual(sum.totals.starvationPlayerDeaths, 1, 'summarizer: player-flagged starvation');
      assert.strictEqual(sum.perSeed[0].loopFights, 1, 'summarizer: per-seed loop count');
      assert.strictEqual(sum.perSeed[1].loopFights, 0, 'summarizer: healthy seed zero loops');
      console.log('summarizer: loop fights + player-flagged starvation counted on fixtures');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log('test-approachfall-20261104: ALL PASS');
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
