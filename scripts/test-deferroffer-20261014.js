#!/usr/bin/env node
// PROOF (deferroffer arm, 2026-10-14): the win-day-floor deferral re-offer.
//
// BUG (sim-findings #131-T2, REAL BUG on the win path): the pre-day-90
// winDayFloorDefer (src/js/table.js) never re-opened the 7-door modal — the
// beat promised "the table will still be here" but tableOfferPaths was
// one-shot. Evidence: wincensus seed s22 deferred @67, stalled 101 days in
// T.phase='paths' with tableChoices=null, died d167, win never landed
// (evidence/2026-10-14/sim-wincensus.md).
//
// FIX (table.js only): winDayFloorDefer records T.winDeferred and re-arms the
// dawn driver (pg.tableWaiting=true, pg.tableDone=false — sanctity preserved
// via tableActive's winDeferred carve-out). tableScene re-opens the 7-door
// modal via tableOfferPaths once winDayFloorOk() passes — exactly once.
//
// FIXTURE: beloved path walked to its finals at day 67 (mirrors s22's d67
// deferral), then the REAL Game.tableResolveFinal('final:audience') drives
// the REAL winDayFloorDefer. Days 68-100 drive the EXACT ledger dawn-driver
// gate: `if (pg.tableWaiting && !pg.tableDone && Game.state.systemArrived)
// Game.tableScene()` (ledger.js:1424).
//
// RED (pristine table.js): the re-offer never fires — tableChoices stays
//   null through day 100, win never landable. => assertion FAILS (bug proven).
// GREEN (fixed): the modal re-opens at day 90, exactly once, answerable.
//   => all assertions PASS.
//
// DET-GATE: the whole fixture runs over 32 seeds; 32/32 must pass (GREEN) —
// or 32/32 must fail at the re-offer assertion (REAL RED). Any other split
// is a fixture/harness problem, not a result.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = Array.from({ length: 32 }, (_, i) => i + 1);
const DEFERRAL_DAY = 67;   // mirrors s22's d67 deferral
const FLOOR_DAY = 90;      // winDayFloorOk: scholar.day >= 90

// The exact ledger.js:1424 dawn-driver gate, driven manually.
function dawnDriver(Game) {
  const pg = Game.progState();
  if (pg.tableWaiting && !pg.tableDone && Game.state.systemArrived) Game.tableScene();
}

async function runFixture(seed) {
  const { Game } = await loadGame({ seed, mode: 'deferroffer-proof' });
  await setupGame(Game);
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function (t) { sayLines.push(String(t)); return origSay.call(this, t); };

  const s = Game.state.scholar;
  const pg = Game.progState();
  // Fixture: beloved path walked to its finals before the day-90 floor.
  s.day = DEFERRAL_DAY;
  Game.state.systemArrived = true;
  pg.tableDone = true;
  pg.tableWaiting = false;
  const T = Game.tableState();
  T.seat = 'full'; T.phase = 'finals'; T.path = 'beloved'; T.branch = 'light';
  T.beat = 0; T.meters = {}; T.weakened = 0; T.abils = []; T.abilMods = {};
  s.tableChoices = null;

  // The REAL win resolution at day 67 -> the REAL winDayFloorDefer.
  Game.tableResolveFinal('final:audience');

  const obs = { seed, deferral: {}, reoffer: {}, answer: {} };
  const d = obs.deferral;
  d.phase = T.phase; d.over = !!Game.over; d.won = !!Game.won;
  d.choicesNull = s.tableChoices == null;
  d.beatSpoken = sayLines.some(l => l.includes('THE TABLE WAITS'));
  d.winDeferred = T.winDeferred === true;
  d.tableWaiting = !!Game.progState().tableWaiting;
  d.tableDone = !!Game.progState().tableDone;
  // Sanctity must hold through the deferral window (the table still sits).
  s.day = 80; d.sanctityAt80 = !!Game.tableActive();

  // Advance past the floor, driving the exact dawn-driver gate each day.
  let reofferDay = null;
  for (let day = DEFERRAL_DAY + 1; day <= 100; day++) {
    s.day = day;
    dawnDriver(Game);
    if (s.tableChoices) { reofferDay = day; break; }
  }
  const r = obs.reoffer;
  r.reofferDay = reofferDay;
  r.winDeferredCleared = T.winDeferred === false;
  r.tableDone = !!Game.progState().tableDone;
  r.tableWaiting = !!Game.progState().tableWaiting;
  r.returnsBeats = sayLines.filter(l => l.includes('THE TABLE RETURNS')).length;
  r.modalPrompt = s.tableChoices ? String((s.tableChoices.prompt || '')) : null;
  r.modalOptions = s.tableChoices ? (s.tableChoices.options || []).length : 0;
  r.sevenDoors = r.modalPrompt ? (r.modalPrompt.match(/◈/g) || []).length : 0;

  // The re-offered modal must be answerable — the 7 doors open again.
  if (s.tableChoices) {
    Game.chooseTableOption('path:beloved');
    obs.answer.phaseAfterPick = T.phase;
    obs.answer.pathAfterPick = T.path;
  }
  // No duplicates: keep driving the gate + direct tableScene() calls.
  for (let day = 101; day <= 105; day++) { s.day = day; dawnDriver(Game); Game.tableScene(); }
  r.returnsBeatsAfter = sayLines.filter(l => l.includes('THE TABLE RETURNS')).length;

  return { Game, obs, T, sayLines };
}

function checkGreen(obs) {
  const d = obs.deferral, r = obs.reoffer, a = obs.answer;
  // 1. The deferral itself (identical on pristine and fixed code).
  assert.strictEqual(d.phase, 'paths', `seed ${obs.seed}: deferral must leave T.phase='paths' (got ${d.phase})`);
  assert.strictEqual(d.over, false, `seed ${obs.seed}: deferral must not end the game`);
  assert.strictEqual(d.won, false, `seed ${obs.seed}: deferral must not set won`);
  assert.strictEqual(d.choicesNull, true, `seed ${obs.seed}: deferral must clear the modal`);
  assert.strictEqual(d.beatSpoken, true, `seed ${obs.seed}: deferral beat must be spoken`);
  assert.strictEqual(d.sanctityAt80, true, `seed ${obs.seed}: table sanctity must hold during the deferral window`);
  // 2. THE FIX: the modal re-opens once the floor passes.
  assert.strictEqual(r.reofferDay, FLOOR_DAY,
    `seed ${obs.seed}: REAL RED — deferred modal never re-opens (reofferDay=${r.reofferDay})`);
  assert.strictEqual(r.winDeferredCleared, true, `seed ${obs.seed}: winDeferred must clear on fire`);
  assert.strictEqual(r.tableDone, true, `seed ${obs.seed}: sequence sits again after re-offer`);
  assert.strictEqual(r.tableWaiting, false, `seed ${obs.seed}: driver disarmed after re-offer`);
  assert.strictEqual(r.returnsBeats, 1, `seed ${obs.seed}: exactly one TABLE RETURNS beat (got ${r.returnsBeats})`);
  assert.ok(r.modalPrompt && r.modalPrompt.includes('Seven doors'),
    `seed ${obs.seed}: re-offered modal must be the 7-door prompt`);
  assert.strictEqual(r.modalOptions, r.sevenDoors,
    `seed ${obs.seed}: modal options (${r.modalOptions}) must match priced doors (${r.sevenDoors})`);
  // 3. The re-offered modal is live, and fires exactly once.
  assert.strictEqual(a.phaseAfterPick, 'challenge', `seed ${obs.seed}: re-offered modal must be answerable`);
  assert.strictEqual(a.pathAfterPick, 'beloved', `seed ${obs.seed}: picked path must start`);
  assert.strictEqual(r.returnsBeatsAfter, 1, `seed ${obs.seed}: no duplicate re-offers (got ${r.returnsBeatsAfter})`);
}

async function main() {
  let pass = 0, fail = 0;
  const failures = [];
  for (const seed of SEEDS) {
    try {
      const { obs } = await runFixture(seed);
      checkGreen(obs);
      pass++;
    } catch (e) {
      fail++;
      failures.push(`seed ${seed}: ${e.message.split('\n')[0]}`);
    }
  }
  console.log(`deferroffer proof: ${pass}/${SEEDS.length} GREEN`);
  if (fail) {
    console.log('failures:');
    for (const f of failures.slice(0, 8)) console.log('  ' + f);
    if (failures.length > 8) console.log(`  ... and ${failures.length - 8} more`);
    const redAtReoffer = failures.filter(f => f.includes('REAL RED')).length;
    if (redAtReoffer === SEEDS.length) {
      console.log('REAL RED: 32/32 fail at the re-offer assertion — the deferred modal never re-opens on pristine code. Bug reproduced.');
    }
    process.exit(1);
  }
  console.log('GREEN: 32/32 — deferral re-offers the 7-door modal at day 90, exactly once, answerable, sanctity held.');
}

main().catch(e => { console.error('HARNESS FAILURE:', e); process.exit(2); });
