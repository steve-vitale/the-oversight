#!/usr/bin/env node
// test-hurttraveler-b.js — proof for the sim-hurttraveler-b narration fix.
// (2026-11-03, oversight-flesh-out-loop-b, axis food-economy.)
//
// Legs:
//   A. Fixture reason sentences: the REAL awayReasonSentence /
//      awayHungerVoice functions, borrowed onto a hand-built context
//      (same state shape the engine holds: state.village.away,
//      state.village.health, state.scholar.day, dayPart, objOf,
//      displayName, getPerson, say). Each purpose + clock state must
//      render its true reason; unknown purposes fall back to the
//      clock clause only; no away record means no line at all.
//      RED on pristine: awayReasonSentence does not exist there, and
//      the lines carry no reason sentence.
//   B. Live wiring: oneRun(96101, 100) twice (sequential, never
//      concurrent). The two runs must be byte-identical on hurtLines
//      (determinism), every live hurt line must contain the reason
//      its own snapshot implies, and the traveler's name must be
//      their own (never a borrowed name).
//   C. Narration-only: N voice calls must read Math.random zero
//      times and must not mutate health, pack, or away records
//      (only the pre-existing _awayVoice day-marker bookkeeping may
//      move).
//
// Env: the sweep module asserts PLENTYDEPRI=1, DEPOSITGATE=1, SEEDS
// (a legal list) and DAYS=100 at require time, so they are set here
// before require. The proof never writes into the repo: live legs use
// oneRun() in memory only (the sweep's main block, which writes
// corpora, runs only under require.main).
'use strict';
process.env.PLENTYDEPRI = '1';
process.env.DEPOSITGATE = '1';
process.env.SEEDS = '96101,96102,96103,96104,96105,96106,96107,96108';
process.env.DAYS = '100';

const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');
const { oneRun } = require('./sweep-hurttraveler-b');

// Real Game functions, bound onto each fixture context after load (the
// voice calls this.awayReasonSentence, so the context must carry it —
/// otherwise the guarded call yields '' and the line tests a hollow stub).
let GAME_FUNCS = null;
function makeCtx(overrides) {
  const o = overrides || {};
  const lines = [];
  const village = {
    away: o.away || {},
    health: o.health || {},
    objectives: o.objectives || {},
  };
  const ctx = {
    state: { village, scholar: { day: o.day != null ? o.day : 12 } },
    dayPart: o.dayPart != null ? o.dayPart : 2,
    awayReasonSentence: GAME_FUNCS ? GAME_FUNCS.reason : undefined,
    awayHungerVoice: GAME_FUNCS ? GAME_FUNCS.voice : undefined,
    lines,
    objOf(vid) { return village.objectives[vid] || null; },
    displayName(vid) { return (o.names || {})[vid] || 'Someone'; },
    getPerson(vid) { return { name: (o.names || {})[vid] || 'Someone' }; },
    say(t) { lines.push(t); },
  };
  return ctx;
}

async function main() {
  // The real functions, loaded from the worktree's src via the harness.
  const { Game } = await loadGame({ seed: 42, mode: 'hurttraveler-test', fullTelemetry: false });
  await setupGame(Game);
  assert.strictEqual(typeof Game.awayReasonSentence, 'function',
    'awayReasonSentence must exist (RED on pristine: the fix is absent)');
  assert.strictEqual(typeof Game.awayHungerVoice, 'function', 'awayHungerVoice must exist');
  const voice = Game.awayHungerVoice;
  const reason = Game.awayReasonSentence;
  GAME_FUNCS = { reason, voice };

  // --- Leg A: fixture reason sentences ---
  // Expedition, trip ongoing: since d10 p1, now d12 p2, duration 12 -> partsLeft 3.
  let ctx = makeCtx({ away: { v1: { purpose: 'expedition', sinceDay: 10, sincePart: 1, duration: 12, nx: 6, ny: 6 } },
    health: { v1: 5 }, names: { v1: 'Mara Stone' } });
  let r = reason.call(ctx, 'v1');
  assert.ok(/still out on a long trek/.test(r), 'expedition errand: ' + r);
  assert.ok(/trip isn.t over yet/.test(r), 'expedition clock ongoing: ' + r);

  // Forage, clock run out: duration 8 -> partsLeft -1.
  ctx = makeCtx({ away: { v1: { purpose: 'forage', sinceDay: 10, sincePart: 1, duration: 8, nx: 5, ny: 4 } },
    health: { v1: 4 }, names: { v1: 'Brian Otieno' } });
  r = reason.call(ctx, 'v1');
  assert.ok(/still out foraging/.test(r), 'forage errand: ' + r);
  assert.ok(/due home/.test(r), 'forage clock due: ' + r);

  // Visit with a known target: name must be the target's, not a bystander.
  ctx = makeCtx({ away: { v1: { purpose: 'visit', sinceDay: 10, sincePart: 1, duration: 12, nx: 5, ny: 5 } },
    objectives: { v1: { kind: 'VISIT', state: 'out', targetVid: 'v2', partsLeft: 3 } },
    health: { v1: 3 }, names: { v1: 'Sam Wilson', v2: 'Ana Ruiz', v3: 'Bystander Bystander' } });
  r = reason.call(ctx, 'v1');
  assert.ok(/visiting Ana/.test(r), 'visit names the true target: ' + r);
  assert.ok(!/Bystander/.test(r), 'visit borrows no name: ' + r);

  // Guard with a known companion.
  ctx = makeCtx({ away: { v1: { purpose: 'guard', sinceDay: 10, sincePart: 1, duration: 12, nx: 5, ny: 5 } },
    objectives: { v1: { kind: 'GUARD', state: 'out', targetVid: 'v2', partsLeft: 3 } },
    health: { v1: 6 }, names: { v1: 'Jenny Cox', v2: 'Mia Andersson' } });
  r = reason.call(ctx, 'v1');
  assert.ok(/walking with Mia/.test(r), 'guard names the companion: ' + r);

  // Objective returning: clock clause is the walk home, whatever the parts say.
  ctx = makeCtx({ away: { v1: { purpose: 'visit', sinceDay: 10, sincePart: 1, duration: 8, nx: 4, ny: 4 } },
    objectives: { v1: { kind: 'VISIT', state: 'returning', targetVid: 'v2', partsLeft: 3 } },
    health: { v1: 2 }, names: { v1: 'Gonzalo Carranza', v2: 'Ana Ruiz' } });
  r = reason.call(ctx, 'v1');
  assert.ok(/already walking home/.test(r), 'returning clock: ' + r);

  // LEAVE walk-out: its own sentence, no trip language.
  ctx = makeCtx({ away: { v1: { purpose: 'leave', sinceDay: 10, sincePart: 1, duration: 999, nx: 7, ny: 7 } },
    health: { v1: 7 }, names: { v1: 'Nina Petrova' } });
  r = reason.call(ctx, 'v1');
  assert.ok(/walked away from Haven/.test(r), 'leave sentence: ' + r);

  // Unknown purpose: clock clause only, never an invented errand.
  ctx = makeCtx({ away: { v1: { purpose: 'mystery', sinceDay: 10, sincePart: 1, duration: 12, nx: 5, ny: 5 } },
    health: { v1: 5 }, names: { v1: 'Pat Lee' } });
  r = reason.call(ctx, 'v1');
  assert.ok(/trip isn.t over yet/.test(r), 'unknown purpose falls back to clock: ' + r);
  assert.ok(!/foraging|trek|visiting|fetching/.test(r), 'unknown purpose invents no errand: ' + r);

  // No away record: empty reason, and the voice says nothing.
  ctx = makeCtx({ away: {}, health: { v1: 5 }, names: { v1: 'Pat Lee' } });
  assert.strictEqual(reason.call(ctx, 'v1'), '', 'no away record -> empty reason');
  voice.call(ctx, 'v1', 1400, 1400, 1400);
  assert.strictEqual(ctx.lines.length, 0, 'no away record -> no line');

  // Full voice line: own name + meal + reason; dedupe to one line per day.
  ctx = makeCtx({ away: { v1: { purpose: 'water', sinceDay: 10, sincePart: 1, duration: 12, nx: 5, ny: 6 } },
    health: { v1: 6 }, names: { v1: 'Henry Zhang' } });
  voice.call(ctx, 'v1', 1301, 1301, 1301);
  voice.call(ctx, 'v1', 1301, 1301, 1301); // same day: deduped
  assert.strictEqual(ctx.lines.length, 1, 'one line per (vid,day)');
  assert.ok(/^Henry eats away from the haven/.test(ctx.lines[0]), 'own name first: ' + ctx.lines[0]);
  assert.ok(/1301 kcal/.test(ctx.lines[0]), 'meal named: ' + ctx.lines[0]);
  assert.ok(/still out fetching water/.test(ctx.lines[0]), 'reason in full line: ' + ctx.lines[0]);
  assert.ok(!/far from the haven.s shelves/.test(ctx.lines[0]), 'shelves filler dropped: ' + ctx.lines[0]);

  // hp > 7: no line (voice gate unchanged).
  ctx = makeCtx({ away: { v1: { purpose: 'forage', sinceDay: 10, sincePart: 1, duration: 12, nx: 5, ny: 5 } },
    health: { v1: 8 }, names: { v1: 'Pat Lee' } });
  voice.call(ctx, 'v1', 1300, 1300, 1300);
  assert.strictEqual(ctx.lines.length, 0, 'hp 8 -> no line');
  console.log('leg A (fixture reason sentences) PASS');

  // --- Leg C: narration-only (RNG + mutation) ---
  ctx = makeCtx({ away: { v1: { purpose: 'expedition', sinceDay: 10, sincePart: 1, duration: 12, nx: 6, ny: 6 } },
    health: { v1: 5 }, names: { v1: 'Mara Stone' } });
  const before = JSON.stringify({ health: ctx.state.village.health, away: ctx.state.village.away });
  let rngReads = 0;
  const origRandom = Math.random;
  Math.random = function () { rngReads++; return origRandom(); };
  try {
    for (let i = 0; i < 5; i++) { ctx.state.scholar.day = 12 + i; voice.call(ctx, 'v1', 1300, 1300, 1300); }
  } finally { Math.random = origRandom; }
  assert.strictEqual(rngReads, 0, 'voice must read Math.random zero times, got ' + rngReads);
  const after = JSON.stringify({ health: ctx.state.village.health, away: ctx.state.village.away });
  assert.strictEqual(after, before, 'voice must not mutate health/away records');
  console.log('leg C (narration-only: 0 RNG reads, no mutation) PASS');

  // --- Leg B: live wiring + determinism on seed 96101, 100d ---
  const r1 = await oneRun(96101, 100);
  const r2 = await oneRun(96101, 100);
  assert.strictEqual(JSON.stringify(r1.perSeed.hurtLines), JSON.stringify(r2.perSeed.hurtLines),
    'same-seed runs must be byte-identical on hurt lines');
  assert.ok(r1.perSeed.hurtLines.length >= 1, 'seed 96101 must yield >= 1 hurt line (diag: 1)');
  const errandFor = (purp) => ({ expedition: 'long trek', explore: 'long trek', forage: 'foraging',
    water: 'fetching water', traps: 'snares', visit: 'visiting', guard: 'walking with',
    haul: 'haul', hunt: 'hunting', leave: 'walked away from Haven' }[purp] || null);
  for (const hl of r1.perSeed.hurtLines) {
    const sn = hl.snap, purp = (sn.away && sn.away.purpose) || '?';
    const err = errandFor(purp);
    if (err) assert.ok(hl.line.includes(err), `live line must carry errand "${err}" for ${purp}: ${hl.line}`);
    if (purp === 'leave') assert.ok(/walked away from Haven and haven't come back/.test(hl.line), 'leave line: ' + hl.line);
    else if (sn.obj && sn.obj.state === 'returning') assert.ok(/already walking home/.test(hl.line), 'returning line: ' + hl.line);
    else if (sn.partsLeft != null && sn.partsLeft <= 0) assert.ok(/due home/.test(hl.line), 'due-home line: ' + hl.line);
    else assert.ok(/trip isn.t over yet/.test(hl.line), 'ongoing-trip line: ' + hl.line);
    assert.ok(hl.line.startsWith(sn.name.split(' ')[0]), 'live line starts with own first name: ' + hl.line);
  }
  console.log(`leg B (live wiring + determinism, seed 96101, ${r1.perSeed.hurtLines.length} hurt lines) PASS`);
  console.log('ALL LEGS PASS');
}

main().catch(e => { console.error('PROOF FAIL', e); process.exit(1); });
