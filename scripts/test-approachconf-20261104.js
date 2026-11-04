// test-approachconf-20261104.js — proof for the approachfall CONFIRM
// (arm sim-approachconf-b, Loop B run fleshout-loop-b-20261104T1212Z).
//
// Covers, on fixtures (never live sims):
//   1. Weakest-monster classification: an out-of-range weakest monster
//      makes a zero-tile move-only turn an APPROACH-STEP even when a
//      nearer monster is in range (the pilot's closest-monster predicate
//      would have missed it); an in-range weakest monster with a
//      non-adjacent target makes it a FLEE-WALK, never an approach step.
//   2. Loop definition unchanged: died + 0 strikes + same-step run >= 4.
//   3. Fallback proxy: wait / re-pick-attempt / re-pick-moved turns
//      following >= 3 approach steps count once each, with kinds.
//   4. Other-blocked split: in-range weakest + adjacent target counts
//      in neither the approach nor the flee class.
//   5. Summarizer: split totals, fallback counts, and the suffix filter
//      (an '-armed' file is NOT swept into a '-baseline' summary — the
//      pilot's filter footgun, fixed).
//   6. Variant policy gates exact (four on, DPS_RACE off).
//   7. Live-harness smoke: 2 days run at this anchor without error.
// Run: node scripts/test-approachconf-20261104.js (exit 0 = all pass).
'use strict';
const path = require('path');
const assert = require('assert');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'approachconf-analyze-20261104'));
const PILOT = require(path.join(REPO, 'scripts', 'approachfall-analyze-20261104'));

function startFor(monsters, dists) {
  return { player: { mx: 4, my: 4, moveLeft: 3, acted: false, hp: 100, maxHp: 100 },
    weapon: { range: 1 }, monsters: monsters, dists: dists };
}
function moveTurn(seq, start, target, movedTo) {
  const post = movedTo ? { mx: movedTo[0], my: movedTo[1], moveLeft: 2, acted: true }
    : { mx: 4, my: 4, moveLeft: 3, acted: true };
  return { turnSeq: seq, round: seq + 1, extra: false, start: start,
    actions: [{ fn: 'tbPlayerMove', kind: 'move', args: [String(target[0]), String(target[1])],
      returned: true,
      pre: { player: { mx: 4, my: 4, moveLeft: 3, acted: false } },
      post: { player: post } }],
    sayMark: 0, end: null, closeReason: 'advance', sayLines: ['No path there.'] };
}
function waitTurn(seq, start) {
  return { turnSeq: seq, round: seq + 1, extra: false, start: start,
    actions: [{ fn: 'tbPlayerWait', kind: 'wait', args: [], returned: true,
      pre: { player: { mx: 4, my: 4, moveLeft: 3, acted: false } },
      post: { player: { mx: 4, my: 4, moveLeft: 0, acted: true } } }],
    sayMark: 0, end: null, closeReason: 'advance', sayLines: [] };
}
function exposure(turns) {
  return { seq: 1, day: 50, mid: 'stub', wave: 4, fightId: 'fx-1',
    partySizeStart: 1, party: [], trickKnown: false,
    monsters: [{ key: 'm_0', mid: 'stub', hpStart: 500, maxHp: 500, wave: 4 }],
    hits: [], transcript: [], abilityUses: [], shoutUses: 0, offerFoodUses: 0,
    turns: turns, npcTurns: [],
    end: { result: 'lost', day: 50, round: 9, monsters: [{ key: 'm_0', mid: 'stub', alive: true, hp: 500 }],
      humans: [{ key: 'p', alive: false }], monsterDeadW4: 0, monsterTotalW4: 1,
      humansDead: ['x'], humansFled: [], monstersFled: [] }, kills: [] };
}
// Single monster, out of range: the pilot's canonical failed turn.
function outStart() {
  return startFor([{ key: 'm_0', mx: 6, my: 6, hp: 500, alive: true }],
    [{ key: 'm_0', mid: 'stub', dist: 2, inRange: false }]);
}
// Single monster, in range, edge target: the pilot's flee walk.
function inStart() {
  return startFor([{ key: 'm_0', mx: 5, my: 5, hp: 500, alive: true }],
    [{ key: 'm_0', mid: 'stub', dist: 1, inRange: true }]);
}
// Two monsters: nearer one in range (hp 500), weakest out of range (hp 100).
function weakestOutStart() {
  return startFor([
    { key: 'm_0', mx: 5, my: 5, hp: 500, alive: true },
    { key: 'm_1', mx: 6, my: 6, hp: 100, alive: true }],
    [{ key: 'm_0', mid: 'stub', dist: 1, inRange: true },
     { key: 'm_1', mid: 'stub', dist: 2, inRange: false }]);
}
// Two monsters: weakest in range (hp 100), other out of range (hp 500).
function weakestInStart() {
  return startFor([
    { key: 'm_0', mx: 5, my: 5, hp: 100, alive: true },
    { key: 'm_1', mx: 6, my: 6, hp: 500, alive: true }],
    [{ key: 'm_0', mid: 'stub', dist: 1, inRange: true },
     { key: 'm_1', mid: 'stub', dist: 2, inRange: false }]);
}

async function main() {
  // 1+2. Loop fight, weakest-based: 4 same-target approach steps, died, 0 strikes.
  {
    const loop = AN.analyzeConfirm(exposure(
      [moveTurn(1, outStart(), [5, 5]), moveTurn(2, outStart(), [5, 5]),
       moveTurn(3, outStart(), [5, 5]), moveTurn(4, outStart(), [5, 5])]));
    assert.strictEqual(loop.isLoopFight, true, 'loop: 4 approach steps = loop');
    assert.strictEqual(loop.approachStepTurns, 4, 'loop: approach steps 4');
    assert.strictEqual(loop.fleeWalkTurns, 0, 'loop: flee walks 0');
    assert.strictEqual(loop.maxSameStepRun, 4, 'loop: max run 4');
    console.log('loop: died + 0 strikes + run 4 flagged, approach class only');
  }
  // 1. Flee-walk fight: weakest in range, edge target — never an approach loop.
  {
    const fw = AN.analyzeConfirm(exposure(
      [moveTurn(1, inStart(), [0, 4]), moveTurn(2, inStart(), [0, 4]),
       moveTurn(3, inStart(), [0, 4]), moveTurn(4, inStart(), [0, 4])]));
    assert.strictEqual(fw.isLoopFight, false, 'flee-walk: not an approach loop');
    assert.strictEqual(fw.fleeWalkTurns, 4, 'flee-walk: 4 flee walks');
    assert.strictEqual(fw.approachStepTurns, 0, 'flee-walk: 0 approach steps');
    assert.strictEqual(fw.maxSameStepRun, 0, 'flee-walk: approach run 0');
    console.log('flee-walk: in-range weakest + edge target split out, not a loop');
  }
  // 1. Weakest-vs-closest discriminator, both directions.
  {
    const wo = AN.analyzeConfirm(exposure([moveTurn(1, weakestOutStart(), [5, 5])]));
    assert.strictEqual(wo.approachStepTurns, 1, 'weakest-out: approach step counted');
    const pilotWo = PILOT.analyzeApproach(exposure([moveTurn(1, weakestOutStart(), [5, 5])]));
    assert.strictEqual(pilotWo.failedApproachTurns, 0,
      'weakest-out: pilot closest-predicate misses it (contrast proven)');
    const wi = AN.analyzeConfirm(exposure([moveTurn(1, weakestInStart(), [0, 4])]));
    assert.strictEqual(wi.fleeWalkTurns, 1, 'weakest-in: flee walk counted');
    assert.strictEqual(wi.approachStepTurns, 0, 'weakest-in: 0 approach steps');
    console.log('weakest discriminator: out-of-range weakest counts, in-range weakest splits out');
  }
  // 3. Fallback proxy kinds.
  {
    const w = AN.analyzeConfirm(exposure(
      [moveTurn(1, outStart(), [5, 5]), moveTurn(2, outStart(), [5, 5]),
       moveTurn(3, outStart(), [5, 5]), waitTurn(4, outStart())]));
    assert.strictEqual(w.fallbackEvents, 1, 'proxy: wait after 3 fails = 1');
    assert.deepStrictEqual(w.fallbackKinds, ['wait'], 'proxy: kind wait');
    assert.strictEqual(w.isLoopFight, false, 'proxy: wait breaks the loop');
    const rm = AN.analyzeConfirm(exposure(
      [moveTurn(1, outStart(), [5, 5]), moveTurn(2, outStart(), [5, 5]),
       moveTurn(3, outStart(), [5, 5]), moveTurn(4, outStart(), [5, 6], [5, 6])]));
    assert.strictEqual(rm.fallbackEvents, 1, 'proxy: moved re-pick = 1');
    assert.deepStrictEqual(rm.fallbackKinds, ['repick-moved'], 'proxy: kind repick-moved');
    const ra = AN.analyzeConfirm(exposure(
      [moveTurn(1, outStart(), [5, 5]), moveTurn(2, outStart(), [5, 5]),
       moveTurn(3, outStart(), [5, 5]), moveTurn(4, outStart(), [5, 6])]));
    assert.strictEqual(ra.fallbackEvents, 1, 'proxy: re-pick attempt = 1');
    assert.deepStrictEqual(ra.fallbackKinds, ['repick-attempt'], 'proxy: kind repick-attempt');
    const early = AN.analyzeConfirm(exposure(
      [moveTurn(1, outStart(), [5, 5]), moveTurn(2, outStart(), [5, 5]), waitTurn(3, outStart())]));
    assert.strictEqual(early.fallbackEvents, 0, 'proxy: wait after only 2 fails is not a fallback event');
    console.log('fallback proxy: wait / repick-attempt / repick-moved after >=3 fails, not before');
  }
  // 4. Other-blocked: in-range weakest, adjacent target.
  {
    const ob = AN.analyzeConfirm(exposure([moveTurn(1, inStart(), [5, 5])]));
    assert.strictEqual(ob.otherBlockedTurns, 1, 'other-blocked: counted');
    assert.strictEqual(ob.approachStepTurns, 0, 'other-blocked: not approach');
    assert.strictEqual(ob.fleeWalkTurns, 0, 'other-blocked: not flee-walk');
    console.log('other-blocked: in-range weakest + adjacent target sits in neither class');
  }
  // 5. Summarizer split + suffix filter.
  {
    const fs = require('fs');
    const os = require('os');
    const cp = require('child_process');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'approachconf-summ-'));
    try {
      const loopEx = exposure(
        [moveTurn(1, outStart(), [5, 5]), moveTurn(2, outStart(), [5, 5]),
         moveTurn(3, outStart(), [5, 5]), moveTurn(4, outStart(), [5, 5])]);
      const baseJ = { exposures: [], killRows: [], deaths: [], days: 140,
        endReason: 'lost', won: false, spawnsW4: 0, tbCalls: 0,
        fieldCallsW4: 0, maxWave: 4, orphanTbEnds: [], instrumentErrors: [] };
      fs.writeFileSync(path.join(dir, 'approachconf-s90001-baseline.json'),
        JSON.stringify(Object.assign({}, baseJ, { seed: 90001, exposures: [loopEx] })) + '\n');
      fs.writeFileSync(path.join(dir, 'approachconf-s90002-baseline.json'),
        JSON.stringify(Object.assign({}, baseJ, { seed: 90002 })) + '\n');
      fs.writeFileSync(path.join(dir, 'approachconf-s90001-armed.json'),
        JSON.stringify(Object.assign({}, baseJ, { seed: 90001, exposures: [loopEx] })) + '\n');
      const out = cp.execFileSync(process.execPath,
        [path.join(REPO, 'scripts', 'approachconf-summarize-20261104.js'), dir, '-baseline'],
        { encoding: 'utf8' });
      const sum = JSON.parse(out);
      assert.strictEqual(sum.files.length, 2, 'summarizer: suffix filter takes only baseline files');
      assert.strictEqual(sum.totals.approachLoopFights, 1, 'summarizer: one loop fight');
      assert.strictEqual(sum.totals.failedApproachTurns, 4, 'summarizer: approach steps 4');
      assert.strictEqual(sum.totals.fleeWalkTurns, 0, 'summarizer: flee walks 0');
      assert.strictEqual(sum.totals.fallbackEvents, 0, 'summarizer: no fallback in a pure loop');
      const outA = cp.execFileSync(process.execPath,
        [path.join(REPO, 'scripts', 'approachconf-summarize-20261104.js'), dir, '-armed'],
        { encoding: 'utf8' });
      assert.strictEqual(JSON.parse(outA).files.length, 1, 'summarizer: armed filter takes only armed file');
      console.log('summarizer: split totals + suffix filter (armed file excluded from baseline)');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  // 6. Variant gates exact.
  {
    const GATES = ['COMPETENT_DIRECTIONAL_FLEE', 'COMPETENT_EXIT_VERIFIED_FLEE',
      'COMPETENT_FLEE_REPAIR', 'COMPETENT_APPROACH_FALLBACK'];
    for (const k of GATES) delete process.env[k];
    delete process.env.COMPETENT_DPS_RACE;
    const base = require(path.join(REPO, 'scripts', 'policies', 'competent'));
    const before = base.competent;
    const variantPath = path.join(REPO, 'scripts', 'policies', 'competent-approachfall-b');
    delete require.cache[require.resolve(variantPath)];
    const variant = require(variantPath);
    for (const k of GATES) assert.strictEqual(process.env[k], '1', 'variant: ' + k + ' on');
    assert.strictEqual(process.env.COMPETENT_DPS_RACE, undefined, 'variant: DPS_RACE stays off');
    assert.strictEqual(variant.competent, before, 'variant: competent object unchanged');
    console.log('variant: four gates on, DPS_RACE off, competent unchanged');
  }
  // 7. Live-harness smoke at this anchor (verbatim policy, 2 days).
  {
    const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const policyMod = require(path.join(REPO, 'scripts', 'policies', 'competent'));
    const { Game } = await loadGame({ seed: 99601, mode: 'competent-approachconf-proof', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async function () { result = await runDays(Game, policyMod.competent, { days: 2, manifest: undefined, sampleEvery: 30 }); });
    assert.ok(result && Number.isFinite(result.days), 'smoke: 2-day run completes');
    console.log('live-harness smoke: 2 days on seed 99601, verbatim policy, no error');
  }
  console.log('test-approachconf-20261104: ALL PASS');
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
