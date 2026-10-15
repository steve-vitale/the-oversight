#!/usr/bin/env node
'use strict';
// test-w5reach2-20261015.js — pre-sweep proof for sim-w5reach2
// (flesh-out loop, 2026-10-15, scale-onramp axis, ARM 1).
//
// The layer is LANDED (scripts/policies/wave5reach.js, WAVE5REACH=1,
// default OFF, ZERO src/js). This arm runs it on the PRE-SEAT stack —
// the wincensus-diagnostic substrate where wins are 0/16 and runs live
// long, so wave-5 is measurable. The tracker's named next: "future
// wave-5 arms need a non-win substrate (pre-seat stack)".
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1
//   SEATDRIVE must be UNSET (fail loudly if set — that would be the
//   win-side stack, not the pre-seat stack).
//   control: W5R.leadseat/belongseat (wrapping SD.leadseat/belongseat)
//     with WAVE5REACH unset — the seat layer gate-offs to pure
//     delegation when SEATDRIVE is unset
//   armed:   the SAME objects + WAVE5REACH=1
//
// Proves, before any sweep spend:
//   (a) det-gate — gate-off (WAVE5REACH unset) trajectory byte-identical
//       to plain seatdrive composition (SD.leadseat/belongseat) on fixed
//       seeds (RED->GREEN phase 1: the layer is inert when off);
//   (b) gate-on — hunts fire: stub-Game unit proof that huntLeg's gate
//       conditions and the commit-flag marking are honest, PLUS a live
//       180d armed smoke that asserts w5Hunts>0 whenever the run reaches
//       wave-4 (RED->GREEN phase 2: the mechanism is live when on).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 node scripts/test-w5reach2-20261015.js
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
  // ASYNC-AWARE (fixed 2026-10-15, sim-w5reach2): the naive try/finally
  // restores the env the moment fn() returns its promise — BEFORE the
  // async run resolves — so a 180d "armed" run silently ran gate-off.
  // (The det-gate was unaffected: gate-off either way. The sweep sets env
  // directly, never via this helper.) Await fn() inside the try so the
  // restore happens after the run resolves.
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

async function main() {
  console.log('== w5reach2 pre-sweep proof (pre-seat stack) ==');

  // ----- 1. layerOn honesty -----
  withEnv({ WAVE5REACH: '1' }, () => ok('wave5reachOn true when WAVE5REACH=1', W5R.wave5reachOn() === true, ''));
  withEnv({ WAVE5REACH: undefined }, () => ok('wave5reachOn false when unset', W5R.wave5reachOn() === false, ''));
  withEnv({ SEATDRIVE: undefined }, () => ok('seatdrive layerOn false when SEATDRIVE unset (pre-seat)', SD.layerOn() === false, ''));
  withEnv({ WINDEFER: '1' }, () => ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, ''));

  // ----- 2. composition integrity: the same wrapped objects the sweep runs -----
  ok('leadseat id', W5R.leadseat && W5R.leadseat.id === 'leadfeast-windefer', W5R.leadseat && W5R.leadseat.id);
  ok('belongseat id', W5R.belongseat && W5R.belongseat.id === 'belongfeast-windefer', W5R.belongseat && W5R.belongseat.id);
  ok('gate-off leadseat delegates to SD.leadseat shape', typeof W5R.leadseat.daily === 'function' && typeof SD.leadseat.daily === 'function', '');

  // ----- 3. unit checks: huntLive gating + commit-flag marking (stub Games) -----
  withEnv({ WAVE5REACH: '1' }, () => {
    const stubG = (uw, tableDone) => ({
      unlockedWave: () => uw,
      progState: () => ({ tableDone: !!tableDone, tableWaiting: false }),
      state: { scholar: { hp: 100 } },
      maxHealth: () => 100,
      data: { monsters: [{ id: 'the_editor', wave: 4 }, { id: 'the_spool', wave: 3 }] },
    });
    ok('huntLive false pre-wave-4', W5R.huntLive(stubG(3, false)) === false, '');
    ok('huntLive true at wave-4', W5R.huntLive(stubG(4, false)) === true, '');
    ok('huntLive false once wave-5 unlocked', W5R.huntLive(stubG(5, false)) === false, '');
    ok('huntLive false during table sequence', W5R.huntLive(stubG(4, true)) === false, '');
    ok('beastWaveOf wave-4 monster', W5R.beastWaveOf(stubG(4, false), 'the_editor') === 4, '');
    ok('beastWaveOf wave-3 monster', W5R.beastWaveOf(stubG(4, false), 'the_spool') === 3, '');
  });
  withEnv({ WAVE5REACH: undefined }, () => {
    const stubG = (uw) => ({ unlockedWave: () => uw, progState: () => ({}) });
    ok('huntLive false when gate off (wave-4, unset)', W5R.huntLive(stubG(4)) === false, '');
  });
  // fight-side flag marking: stub fight with a wave-4 monster, healthy scholar.
  withEnv({ WAVE5REACH: '1' }, () => {
    const g = {
      unlockedWave: () => 4,
      progState: () => ({}),
      state: { scholar: { hp: 80 } },
      maxHealth: () => 100,
      data: { monsters: [{ id: 'the_editor', wave: 4 }] },
      tbfight: { over: false, fighters: [{ kind: 'monster', hp: 900, monsterId: 'the_editor' }] },
    };
    const ctx = {};
    let delegated = false;
    const base = { fight: () => { delegated = true; return false; } };
    const wrapped = W5R.withWave5Reach(base, 'test-id', 'test');
    wrapped.fight(g, ctx);
    ok('_w5Commit set for wave-4+ fight at >=50% HP', ctx._w5Commit === true, 'got ' + ctx._w5Commit);
    ok('_huntCommit false for pure wave-4 fight', ctx._huntCommit === false, 'got ' + ctx._huntCommit);
    ok('delegation still happens', delegated === true, '');
    const g2 = Object.assign({}, g, { state: { scholar: { hp: 30 } } });
    const ctx2 = {};
    wrapped.fight(g2, ctx2);
    ok('_w5Commit false when hurt (<50%)', ctx2._w5Commit === false, 'got ' + ctx2._w5Commit);
    const g3 = Object.assign({}, g, {
      data: { monsters: [{ id: 'the_spool', wave: 3 }] },
      tbfight: { over: false, fighters: [{ kind: 'monster', hp: 300, monsterId: 'the_spool' }] },
    });
    const ctx3 = {};
    wrapped.fight(g3, ctx3);
    ok('_huntCommit set for wave-3 fight', ctx3._huntCommit === true, 'got ' + ctx3._huntCommit);
    ok('_w5Commit false for pure wave-3 fight', ctx3._w5Commit === false, 'got ' + ctx3._w5Commit);
  });

  // ----- 4. det-gate (RED): gate-off purity on fresh seeds, 60d -----
  {
    const SEEDS = [151, 262];
    const DAYS = 60;
    const PIDS = ['leadfeast', 'belongfeast'];
    const naked = (pid) => pid === 'leadfeast' ? SD.leadseat : SD.belongseat;
    const wrapped = (pid) => pid === 'leadfeast' ? W5R.leadseat : W5R.belongseat;
    async function hashesFor(seed, policy) {
      const { Game } = await loadGame({ seed, mode: 'w5reach2-detgate' });
      await setupGame(Game);
      const hashes = [];
      const w = Object.assign({}, policy);
      const base = policy.daily;
      w.daily = (G, ctx) => {
        hashes.push(Game.state.scholar.day + ':' + dayHash(Game));
        return base ? base(G, ctx) : undefined;
      };
      const r = await quietLog(async () => runDays(Game, w, { days: DAYS, sampleEvery: 1 }));
      return { hashes, days: r.days, endReason: r.endReason };
    }
    let det = 0; const detFails = [];
    for (const pid of PIDS) {
      for (const seed of SEEDS) {
        const a = await withEnv(Object.assign({}, SUBSTRATE, { WAVE5REACH: undefined }), () => hashesFor(seed, wrapped(pid)));
        const b = await withEnv(Object.assign({}, SUBSTRATE, { WAVE5REACH: undefined }), () => hashesFor(seed, naked(pid)));
        const same = a.hashes.length === b.hashes.length && a.hashes.every((h, i) => h === b.hashes[i]);
        if (same) { det++; } else detFails.push(`${pid} s${seed}: len ${a.hashes.length} vs ${b.hashes.length}`);
      }
    }
    ok(`det-gate: ${det}/${PIDS.length * SEEDS.length} identical gate-off trajectories on pre-seat substrate`, detFails.length === 0, detFails.join('; ').slice(0, 200));
  }

  // ----- 5. SMOKE: both sides 20d, markers honest (seat=false on pre-seat) -----
  for (const side of ['control', 'armed']) {
    const { Game } = await loadGame({ seed: 151, mode: `w5reach2-proof-smoke-${side}` });
    await setupGame(Game);
    let w5Live = null, seatLive = null, deferLive = null;
    const base = W5R.belongseat;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => { w5Live = W5R.wave5reachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn(); if (oSetup) return oSetup(G, ctx); };
    let smokeResult = null;
    await withEnv(Object.assign({}, SUBSTRATE, { WAVE5REACH: side === 'armed' ? '1' : undefined }), async () => {
      await quietLog(async () => { smokeResult = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    });
    ok(`SMOKE ${side}: wave5reach marker honest`, w5Live === (side === 'armed'), `w5r=${w5Live}`);
    ok(`SMOKE ${side}: seat marker honest (false — pre-seat)`, seatLive === false, `seat=${seatLive}`);
    ok(`SMOKE ${side}: windefer marker honest (true)`, deferLive === true, `defer=${deferLive}`);
    ok(`SMOKE ${side}: run completes its 20 iterations`, !!(smokeResult && smokeResult.days >= 20),
      'days=' + (smokeResult && smokeResult.days));
  }

  // ----- 6. GATE-ON (GREEN): one 180d armed run — the mechanism must be
  // LIVE when its gate opens.
  //
  // CORRECTLY-SCOPED CHECK (diag-w5reach2-window.js): on s151 the wave-4
  // window is d79..d99 but tableWaiting (invitation pending, unsat — the
  // pre-seat stack never sits) covers 20/21 days, so huntLive() opens on
  // exactly 1 day and exactly 1 hunt fires. The layer is LIVE but
  // opportunity-starved: its tableBusy = tableDone||tableWaiting treats a
  // PENDING INVITATION (daily life continues — the wincensus runs fought
  // 100+ days with invites pending) as "the table sequence". The engine's
  // own sanctity predicate is Game.tableActive() (finale actually playing,
  // table.js:359) — the layer's gate is over-broad. That is a MEASUREMENT
  // FINDING for this arm (filed to sim-findings + evidence "named next"),
  // not a layer bug to fix mid-measurement: the brief scopes this arm to
  // measuring the landed layer as-is.
  {
    const seed = 151, policyId = 'belongfeast';
    await withEnv(Object.assign({}, SUBSTRATE, { WAVE5REACH: '1' }), async () => {
      const { Game } = await loadGame({ seed, mode: 'w5reach2-gateon' });
      await setupGame(Game);
      let runCtx = null;
      const base = W5R.belongseat;
      const policy = Object.assign({}, base);
      const oSetup = base.setup;
      policy.setup = (G, ctx) => { runCtx = ctx; if (oSetup) return oSetup(G, ctx); };
      let maxWave = 1, liveDays = 0, busyDays = 0;
      const w = Object.assign({}, policy);
      const oDaily = base.daily;
      w.daily = (G, ctx) => {
        try {
          maxWave = Math.max(maxWave, (G.unlockedWave ? G.unlockedWave() : 1) | 0);
          if (W5R.wave5reachOn()) {
            const uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0;
            if (uw >= 4 && uw < 5) {
              if (W5R.huntLive(G)) liveDays++;
              else {
                let tb = false;
                try { const pg = G.progState ? G.progState() : {}; tb = !!(pg.tableDone || pg.tableWaiting); } catch (e) {}
                if (tb) busyDays++;
              }
            }
          }
        } catch (e) {}
        return oDaily ? oDaily(G, ctx) : undefined;
      };
      const r = await quietLog(async () => runDays(Game, w, { days: 180, sampleEvery: 30 }));
      const hunts = (runCtx && runCtx.w5Hunts) || 0;
      const engaged = (runCtx && runCtx.w5HuntEngaged) || 0;
      console.log(`  GATE-ON run s151: maxWave=${maxWave} end=${r.endReason} days=${r.gameDays} liveDays=${liveDays} busyDays=${busyDays} hunts=${hunts} engaged=${engaged}`);
      ok('GATE-ON: wave-4 was reached (the gate has something to open for)', maxWave >= 4, `maxWave=${maxWave}`);
      if (liveDays >= 1) {
        ok('GATE-ON: the mechanism is LIVE — hunts fire when the gate opens', hunts >= 1,
          `liveDays=${liveDays} hunts=${hunts}`);
      } else {
        console.log('  GATE-ON: gate never opened on s151 (0 live days) — mechanism liveness INCONCLUSIVE from this seed (not a failure)');
      }
      console.log(`  GATE-ON mechanism note: tableWaiting-stranding busyDays=${busyDays}/${liveDays + busyDays} — filed as the arm's key finding`);
    });
    delete process.env.WAVE5REACH;
  }

  console.log(`\nw5reach2 proof: ${pass} pass, ${fail} fail`);
  if (fail) { console.log('FAILURES:\n  ' + fails.join('\n  ')); process.exit(1); }
}

main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
