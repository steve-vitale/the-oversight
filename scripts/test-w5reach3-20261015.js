#!/usr/bin/env node
'use strict';
// test-w5reach3-20261015.js — pre-sweep proof for sim-w5reach3
// (flesh-out loop, 2026-10-15, scale-onramp axis, ARM 3: the tableActive
// gate refinement).
//
// THE ARM (policy-side only, ZERO src/js changes): refine the LANDED
// scripts/policies/wave5reach.js — replace the tableBusy heuristic
// (tableDone || tableWaiting) with the engine-honest Game.tableActive()
// gate (table.js:359, "sanctity is preserved"). Finding #369
// (evidence/2026-10-15/sim-w5reach2.md): on the pre-seat stack the
// landed heuristic strands the wave-4 counter-learning hunt for 419
// wave-4 days vs 13 live days — a PENDING invitation is treated as "the
// table sequence" while the village fights and dies around it. If the
// table's sanctity means the world holds its breath, only the sitting
// should hold it — a pending invitation does not. The 35% retreat
// discipline and the _w5Commit hunt logic are otherwise untouched.
//
// RED->GREEN: the proof's C1 unit check pins the FIXED behavior —
// huntLive TRUE in the stranding state (wave-4 unlocked, tableWaiting
// pending, table NOT active). On the landed code this FAILS (the
// heuristic stands the hunt down); after the refinement it passes.
// Everything else pins unchanged behavior (sitting still stands the
// hunt down, win-deferral sanctity preserved, gate-off inert).
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1
//   SEATDRIVE must be UNSET (fail loudly if set — that would be the
//   win-side stack, not the pre-seat stack).
//   control: W5R.leadseat/belongseat with WAVE5REACH unset
//   armed:   the SAME objects + WAVE5REACH=1
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 node scripts/test-w5reach3-20261015.js
//
// POST-KILL STATUS (PRIMARY NO-GO — see evidence/2026-10-15/sim-w5reach3.md):
// the tableActive gate refinement was REVERTED per kill protocol; the
// landed layer (tableBusy heuristic) is restored. This proof stays
// runnable by INFO-SKIP: the refinement-dependent assertions (C1, C6,
// C7, C8a) are skipped loudly when the refinement is absent instead of
// FATAL-ing; the unchanged-behavior pins, det-gate, determinism, and
// smoke still run against the landed layer.
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const W5R = require('./policies/wave5reach');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') {
  console.error('PROOF STOP: SEATDRIVE must be UNSET for the pre-seat substrate (this arm never sets it).');
  process.exit(2);
}

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

async function withEnv(vars, fn) {
  // ASYNC-AWARE (fixed 2026-10-15, sim-w5reach2): await fn() inside the
  // try so the restore happens after the async run resolves.
  const saved = {};
  for (const k of Object.keys(vars)) { saved[k] = process.env[k]; }
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k]; else process.env[k] = v;
  }
  try {
    return await fn();
  } finally {
    for (const k of Object.keys(vars)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1' };

// Stub games for the gate unit checks. The stranding state is the whole
// point: wave-4 unlocked, tableWaiting pending, table NOT active (the
// pre-seat stack's 419-day condition — invitation pends, 0 sittings).
const stubGate = (uw, { tableWaiting = false, tableDone = false, active = false, activeThrows = false, noActive = false } = {}) => {
  const g = {
    unlockedWave: () => uw,
    progState: () => ({ tableDone, tableWaiting }),
    state: { scholar: { hp: 100 } },
    maxHealth: () => 100,
    data: { monsters: [{ id: 'the_editor', wave: 4 }, { id: 'the_spool', wave: 3 }] },
  };
  if (noActive) return g;
  g.tableActive = () => { if (activeThrows) throw new Error('table state unavailable'); return active; };
  return g;
};

async function detGateCheck() {
  // Gate-off trajectory: wrapped (WAVE5REACH unset) vs plain seatdrive
  // composition, byte-identical dayHash on fixed seeds. The refinement
  // does not touch the gate-off path (huntLive returns false before any
  // table check when wave5reachOn() is false) — pin it anyway.
  const checks = [];
  for (const [w5policy, sdpolicy, seed] of [
    [W5R.leadseat, SD.leadseat, 163], [W5R.belongseat, SD.belongseat, 274],
  ]) {
    await withEnv({ ...SUBSTRATE, WAVE5REACH: undefined }, async () => {
      const hA = [], hB = [];
      const { Game: gA } = await loadGame({ seed, mode: 'w5reach3-det-wrapped', fullTelemetry: false });
      await setupGame(gA);
      await quietLog(async () => { await runDays(gA, w5policy, { days: 60, sampleEvery: 30, collectHashes: (h) => hA.push(h) }); });
      const { Game: gB } = await loadGame({ seed, mode: 'w5reach3-det-naked', fullTelemetry: false });
      await setupGame(gB);
      await quietLog(async () => { await runDays(gB, sdpolicy, { days: 60, sampleEvery: 30, collectHashes: (h) => hB.push(h) }); });
      const same = hA.length === hB.length && hA.every((h, i) => h === hB[i]);
      checks.push({ seed, same, n: hA.length });
    });
  }
  return checks;
}

async function armedDeterminism() {
  // Gate-on determinism on the new base: the same armed 60d run twice
  // must be byte-identical (the refinement must not break determinism).
  const hs = [];
  for (let i = 0; i < 2; i++) {
    await withEnv({ ...SUBSTRATE, WAVE5REACH: '1' }, async () => {
      const { Game } = await loadGame({ seed: 163, mode: `w5reach3-armed-det-${i}`, fullTelemetry: false });
      await setupGame(Game);
      const h = [];
      await quietLog(async () => { await runDays(Game, W5R.leadseat, { days: 60, sampleEvery: 30, collectHashes: (x) => h.push(x) }); });
      hs.push(h);
    });
  }
  return hs[0].length === hs[1].length && hs[0].every((h, i) => h === hs[1][i]);
}

async function main() {
  console.log('== w5reach3 pre-sweep proof (tableActive gate refinement, pre-seat stack) ==');

  // POST-KILL INFO-SKIP: probe whether the refinement is present. The
  // landed layer's heuristic returns false in the stranding state; the
  // refined gate returns true. Refinement-dependent assertions skip
  // loudly when absent instead of FATAL-ing.
  const refinementPresent = (() => {
    try {
      const g = {
        unlockedWave: () => 4, tableActive: () => false,
        progState: () => ({ tableDone: false, tableWaiting: true }),
        state: { scholar: { hp: 100 } }, maxHealth: () => 100,
      };
      process.env.WAVE5REACH = '1';
      const r = W5R.huntLive(g) === true;
      delete process.env.WAVE5REACH;
      return r;
    } catch (e) { return false; }
  })();
  if (!refinementPresent) {
    console.log('INFO-SKIP: the tableActive gate refinement is ABSENT (reverted per kill protocol after PRIMARY NO-GO — see evidence/2026-10-15/sim-w5reach3.md).');
    console.log('INFO-SKIP: refinement-dependent assertions (C1, C6, C7, C8a) will SKIP; unchanged-behavior pins, det-gate, determinism, and smoke still run.');
  }
  let skipped = 0;
  const rok = (name, cond, detail) => {
    if (refinementPresent) return ok(name, cond, detail);
    skipped++;
    console.log(`  SKIP ${name} (refinement absent — pinned the reverted behavior)`);
  };

  // ----- 1. layerOn honesty -----
  withEnv({ WAVE5REACH: '1' }, () => ok('wave5reachOn true when WAVE5REACH=1', W5R.wave5reachOn() === true, ''));
  withEnv({ WAVE5REACH: undefined }, () => ok('wave5reachOn false when unset', W5R.wave5reachOn() === false, ''));
  withEnv({ SEATDRIVE: undefined }, () => ok('seatdrive layerOn false when SEATDRIVE unset (pre-seat)', SD.layerOn() === false, ''));
  withEnv({ WINDEFER: '1' }, () => ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, ''));
  ok('leadseat id', W5R.leadseat && W5R.leadseat.id === 'leadfeast-windefer', W5R.leadseat && W5R.leadseat.id);
  ok('belongseat id', W5R.belongseat && W5R.belongseat.id === 'belongfeast-windefer', W5R.belongseat && W5R.belongseat.id);

  // ----- 2. THE GATE unit checks (RED->GREEN pivot is C1) -----
  await withEnv({ WAVE5REACH: '1' }, async () => {
    // C1 — THE FIX: stranding state (wave-4, invitation PENDING, table
    // not active) must be HUNT-LIVE. On the landed code this is FALSE
    // (the heuristic strands it) — RED. After the refinement, TRUE.
    rok('C1 huntLive TRUE in stranding state (tableWaiting pending, table not active)',
      W5R.huntLive(stubGate(4, { tableWaiting: true, active: false })) === true, 'finding #369 fix');
    // C2 — sitting still stands the hunt down (sanctity, unchanged).
    ok('C2 huntLive FALSE while the table sits (tableActive)',
      W5R.huntLive(stubGate(4, { tableDone: true, active: true })) === false, '');
    // C3 — win-deferral window: tableActive() treats winDeferred as
    // sitting ("sanctity is preserved" — table.js:359). Unchanged: stand down.
    ok('C3 huntLive FALSE in win-deferral window (active, tableWaiting, !tableDone)',
      W5R.huntLive(stubGate(4, { tableWaiting: true, active: true })) === false, '');
    // C4/C5 — window bounds unchanged.
    ok('C4 huntLive FALSE pre-wave-4', W5R.huntLive(stubGate(3, { active: false })) === false, '');
    ok('C5 huntLive FALSE once wave-5 unlocked', W5R.huntLive(stubGate(5, { active: false })) === false, '');
    // C6 — exception fail-open matches the old tableBusy exception path
    // (tableBusy returned false on exception -> huntLive true).
    rok('C6 huntLive TRUE when tableActive throws (fail-open, matches old exception path)',
      W5R.huntLive(stubGate(4, { tableWaiting: true, activeThrows: true })) === true, '');
    // C7 — no tableActive at all (older stub): gate defaults to live,
    // same as the old heuristic's exception path.
    rok('C7 huntLive TRUE when Game has no tableActive (defensive default)',
      W5R.huntLive(stubGate(4, { tableWaiting: true, noActive: true })) === true, '');
    // C8 — fight-side flags honor the refined gate: stranding state
    // marks commits; sitting state does not.
    const gFight = (active) => ({
      unlockedWave: () => 4,
      tableActive: () => active,
      progState: () => ({ tableWaiting: !active, tableDone: !!active }),
      state: { scholar: { hp: 80 } },
      maxHealth: () => 100,
      data: { monsters: [{ id: 'the_editor', wave: 4 }] },
      tbfight: { over: false, fighters: [{ kind: 'monster', hp: 900, monsterId: 'the_editor' }] },
    });
    const base = W5R.leadseat;
    const mkPolicy = (Game) => Object.assign({}, base, { fight(G, ctx) { return { ctx }; } });
    const runFight = (Game) => { const ctx = {}; W5R.leadseat.fight.call(null, Game, ctx); return ctx; };
    // Use the real fight wrapper: call the composed fight via a
    // delegation shim that captures ctx flags without needing a base.
    const capture = (Game) => {
      const ctx = {};
      const orig = Object.getPrototypeOf(W5R.leadseat);
      const shim = { fight(G, c) { return c; } };
      const wrapped = W5R.withWave5Reach(shim, 'test-id', 'test');
      let threw = false;
      try { wrapped.fight(Game, ctx); } catch (e) { threw = true; }
      return { ctx, threw };
    };
    const live = capture(gFight(false));
    rok('C8a stranding state marks _w5Commit on wave-4 fight', live.ctx._w5Commit === true && !live.threw,
      `_w5Commit=${live.ctx._w5Commit}`);
    ok('C8b stranding state does not mark _huntCommit (wave-3 only)', live.ctx._huntCommit === false, '');
    const sat = capture(gFight(true));
    ok('C8c sitting state marks no commit flags', sat.ctx._w5Commit === false && sat.ctx._huntCommit === false, '');
    void mkPolicy; void runFight;
  });
  await withEnv({ WAVE5REACH: undefined }, async () => {
    ok('huntLive false when gate off (wave-4, unset)', W5R.huntLive(stubGate(4, { active: false })) === false, '');
  });

  // ----- 3. det-gate: gate-off inert on the new base -----
  const detChecks = await detGateCheck();
  for (const c of detChecks) {
    ok(`det-gate gate-off byte-identical (seed ${c.seed}, n=${c.n})`, c.same, '');
  }

  // ----- 4. gate-on determinism on the new base -----
  ok('armed 60d trajectory deterministic across two identical runs', await armedDeterminism(), '');

  // ----- 5. live armed smoke (layer live markers, run completes) -----
  await withEnv({ ...SUBSTRATE, WAVE5REACH: '1' }, async () => {
    const { Game } = await loadGame({ seed: 163, mode: 'w5reach3-smoke-armed', fullTelemetry: false });
    await setupGame(Game);
    let w5Live = null, seatLive = null, deferLive = null;
    const base = W5R.belongseat;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      w5Live = W5R.wave5reachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    ok('smoke: layer-live markers honest', w5Live === true && seatLive === false && deferLive === true,
      `w5r=${w5Live} seat=${seatLive} defer=${deferLive}`);
    ok('smoke: run completes', !!(r && r.days >= 60), `days=${r && r.days}`);
  });
  delete process.env.WAVE5REACH;

  console.log(`\n== w5reach3 proof: ${pass} pass, ${fail} fail, ${skipped} skipped ==`);
  if (fail) { console.error('PROOF FAILURES: ' + fails.join(' | ')); process.exit(1); }
  console.log('PROOF GREEN.');
}
main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
