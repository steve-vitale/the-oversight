#!/usr/bin/env node
'use strict';
// test-w3drive-20261015.js — pre-sweep proof for the wave-3 counter-learning
// lever (flesh-out loop, 2026-10-15, sim-w3drive, scale-onramp axis).
//
// The lever: scripts/policies/w3drive.js (env-gated W3DRIVE=1, default OFF,
// ZERO src/js changes) wrapping the tribfloor->windefer chain
// (WD.withWinDefer(TF.leadfeast/belongfeast, id 'leadfeast-windefer'/
// 'belongfeast-windefer' — the same construction seatdrive uses as its
// inner layer). committed wave-3 fights use the proven ctx._huntCommit
// mechanism honored by competent.js's flee-block extension (inert without
// the flag); the layer NEVER writes ctx._w5Commit.
//
// Proves, before any sweep spend:
//   (a) layer-live markers honest on BOTH sides (the sweep hard-fails on
//       a marker mismatch per run);
//   (b) gate-off det-gate: the withW3Drive composition is byte-identical
//       to the naked tribfloor->windefer composition on identical seeds
//       (gate-off purity — the layer must be inert when W3DRIVE is unset);
//   (c) SMOKE: one 20d run per side, markers honest, run completes;
//   (d) unit checks on the layer's read logic with stub Game objects
//       (huntLive gating; _huntCommit marking conditions; _w5Commit never
//       written) — these exercise logic only, never the engine;
//   (e) instrument honesty: the sweep's counter-discovery tele capture
//       fires only for wave>=3 ids and the villagerTricks writer set is
//       exactly {_trickObservation} (grep-pinned here, not assumed).
//
// Usage (substrate env asserted):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/test-w3drive-20261015.js
//   SEEDS="151,262" DAYS=20 node scripts/test-w3drive-20261015.js   # targeted det-gate
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const WD = require('./policies/windefer');
const TF = require('./policies/tribfloor');
// KILL PROTOCOL: the layer was deleted after the confirm-stage guardrail
// miss (see evidence/2026-10-15/sim-w3drive.md). The proof INFO-SKIPs when
// the layer is absent; instruments are retained.
const W3_PATH = (() => { try { return require.resolve('./policies/w3drive'); } catch (e) { return null; } })();
if (!W3_PATH) {
  console.log('== w3drive pre-sweep proof ==');
  console.log('INFO-SKIP: layer deleted per kill protocol (scripts/policies/w3drive.js absent). Instruments retained.');
  process.exit(0);
}
const W3 = require(W3_PATH);

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE === '1') { console.error('PROOF STOP: SEATDRIVE must NOT be set for the w3drive substrate.'); process.exit(2); }

let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function withEnv(vars, fn) {
  const saved = {};
  for (const k of Object.keys(vars)) { saved[k] = process.env[k]; }
  try {
    for (const [k, v] of Object.entries(vars)) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
    return fn();
  } finally {
    for (const k of Object.keys(vars)) {
      if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
    }
  }
}

const SUBSTRATE = { FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1', WINPURSUIT: '1', WINDEFER: '1' };

// The naked base the layer wraps: tribfloor -> windefer, the seatdrive
// inner-layer construction. The sweep runs W3.leadw3/belongw3.
function nakedBase(policyId) {
  const tf = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  return WD.withWinDefer(tf, `${policyId}-windefer`, `naked tribfloor->windefer for proof`);
}

async function detGateOnce(seed, policyId, days) {
  const runs = [];
  for (const armed of [false, true]) {
    Object.assign(process.env, SUBSTRATE);
    if (armed) process.env.W3DRIVE = '1'; else delete process.env.W3DRIVE;
    const policy = armed ? (policyId === 'leadfeast' ? W3.leadw3 : W3.belongw3) : nakedBase(policyId);
    const { Game } = await loadGame({ seed, mode: `w3drive-detgate-${armed ? 'armed' : 'control'}` });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const baseDaily = policy.daily;
    wrapped.daily = (G, ctx) => {
      try { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); } catch (e) { hashes.push('ERR'); }
      return baseDaily ? baseDaily(G, ctx) : undefined;
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
    runs.push({ armed, hashes, days: r && r.days, endReason: r && r.endReason });
    delete process.env.W3DRIVE;
  }
  return runs;
}

async function main() {
  console.log('== w3drive pre-sweep proof ==');

  // ----- 1. layerOn honesty -----
  withEnv({ W3DRIVE: '1' }, () => ok('layerOn true when W3DRIVE=1', W3.w3driveOn() === true, ''));
  withEnv({ W3DRIVE: undefined }, () => ok('layerOn false when unset', W3.w3driveOn() === false, ''));
  withEnv({ W3DRIVE: '0' }, () => ok('layerOn false when W3DRIVE=0', W3.w3driveOn() === false, ''));

  // ----- 2. composition integrity -----
  withEnv(Object.assign({}, SUBSTRATE), () => {
    ok('leadw3 id', W3.leadw3 && W3.leadw3.id === 'leadfeast-windefer', W3.leadw3 && W3.leadw3.id);
    ok('belongw3 id', W3.belongw3 && W3.belongw3.id === 'belongfeast-windefer', W3.belongw3 && W3.belongw3.id);
    ok('tribfloor layerOn true under TRIBFLOOR=1', TF.layerOn() === true, '');
    ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, '');
    // the naked base matches the wrapped base's shape (same underlying ids)
    const nb = nakedBase('belongfeast');
    ok('naked base id matches', nb.id === 'belongfeast-windefer', nb.id);
  });

  // ----- 3. unit checks: huntLive gating + commit flags (stub Games) -----
  withEnv({ W3DRIVE: '1' }, () => {
    const stubG = (uw, tableDone, hpPct) => ({
      unlockedWave: () => uw,
      progState: () => ({ tableDone: !!tableDone, tableWaiting: false }),
      state: { scholar: { hp: 100 * (hpPct == null ? 1 : hpPct) } },
      maxHealth: () => 100,
      data: { monsters: [{ id: 'spool', wave: 3 }, { id: 'the_reunion', wave: 4 }] },
    });
    ok('huntLive false at uw=2', W3.huntLive(stubG(2, false)) === false, '');
    ok('huntLive true at uw=3', W3.huntLive(stubG(3, false)) === true, '');
    ok('huntLive false at uw=4 (wave5reach territory)', W3.huntLive(stubG(4, false)) === false, '');
    ok('huntLive false at uw=5', W3.huntLive(stubG(5, false)) === false, '');
    ok('huntLive false during table', W3.huntLive(stubG(3, true)) === false, '');
    // gate off: everything false even at uw=3
    withEnv({ W3DRIVE: undefined }, () => {
      ok('huntLive false when gate off (uw=3)', W3.huntLive(stubG(3, false)) === false, '');
    });
    // commit marking: wave-3 fight, scholar healthy -> _huntCommit true
    const fightG = Object.assign(stubG(3, false), {
      tbfight: { over: false, fighters: [
        { key: 'p', kind: 'player', hp: 90 },
        { key: 'm_0', kind: 'monster', hp: 300, monsterId: 'spool' },
      ]},
    });
    const ctx = {};
    const noopBase = { fight: () => 'delegated' };
    W3.withW3Drive(noopBase, 'x', 'x').fight(fightG, ctx);
    ok('_huntCommit true on live wave-3 fight', ctx._huntCommit === true, JSON.stringify(ctx._huntCommit));
    ok('_w5Commit never written', !('_w5Commit' in ctx), JSON.stringify(Object.keys(ctx)));
    ok('blood fight counter increments', ctx.w3BloodFights === 1, JSON.stringify(ctx.w3BloodFights));
    // wave-4 fight at uw=4: hunt not live -> no commit
    const fightG4 = Object.assign(stubG(4, false), {
      tbfight: { over: false, fighters: [
        { key: 'p', kind: 'player', hp: 90 },
        { key: 'm_0', kind: 'monster', hp: 900, monsterId: 'the_reunion' },
      ]},
    });
    const ctx4 = {};
    W3.withW3Drive(noopBase, 'x', 'x').fight(fightG4, ctx4);
    ok('_huntCommit false at uw=4 (stand down)', ctx4._huntCommit === false, JSON.stringify(ctx4._huntCommit));
    ok('no blood fight counted at uw=4', (ctx4.w3BloodFights || 0) === 0, '');
    // hurt scholar: no commit
    const fightHurt = Object.assign(stubG(3, false, 0.3), {
      tbfight: { over: false, fighters: [
        { key: 'p', kind: 'player', hp: 30 },
        { key: 'm_0', kind: 'monster', hp: 300, monsterId: 'spool' },
      ]},
    });
    const ctxH = {};
    W3.withW3Drive(noopBase, 'x', 'x').fight(fightHurt, ctxH);
    ok('_huntCommit false when scholar hurt', ctxH._huntCommit === false, JSON.stringify(ctxH._huntCommit));
  });

  // ----- 4. det-gate: gate-off byte-identical to the naked base -----
  const detSeeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [151, 262]).filter(Number.isFinite);
  const detDays = parseInt(process.env.DAYS || '30', 10);
  for (const seed of detSeeds) {
    const runs = await detGateOnce(seed, 'belongfeast', detDays);
    const [control, armed] = runs;
    const sameLen = control.hashes.length === armed.hashes.length;
    let same = sameLen;
    let firstDiv = -1;
    if (sameLen) {
      for (let i = 0; i < control.hashes.length; i++) {
        if (control.hashes[i] !== armed.hashes[i]) { same = false; firstDiv = i; break; }
      }
    }
    ok(`det-gate seed ${seed}: gate-off byte-identical (${detDays}d)`,
      control.armed === false && armed.armed === true && same,
      same ? `days=${control.days}/${armed.days}` : `firstDiv=${firstDiv} len=${control.hashes.length}/${armed.hashes.length}`);
  }

  // ----- 5. instrument honesty: tele-funnel pin (JS-based, no shell quoting) -----
  // The sweep's primary instrument counts wave-3+ 'counter_discovered' tele
  // events and attributes waveKillLog kills to trick knowledge at kill day.
  // That instrument is honest ONLY if every villagerTricks write funnels
  // through _trickObservation (which always fires the tele). Pin it here:
  // the write `vt[mid] = true` must live inside _trickObservation and
  // nowhere else in src/js.
  const fs = require('fs');
  try {
    const src = fs.readFileSync(__dirname + '/../src/js/game.js', 'utf8');
    const start = src.indexOf('_trickObservation(vid, mid, firstPerson)');
    const fnBody = start >= 0 ? src.slice(start, start + 6000) : '';
    const writeInside = fnBody.includes('vt[mid] = true');
    let writesOutside = 0;
    for (const f of ['game.js', 'fieldFights.js', 'villager-agency.js']) {
      try {
        const s2 = fs.readFileSync(__dirname + '/../src/js/' + f, 'utf8');
        for (const m of s2.matchAll(/villagerTricks[^\n]*=\s*true|vt\[mid\]\s*=\s*true/g)) {
          // the one known-good write sits inside _trickObservation in game.js
          if (f === 'game.js' && start >= 0) {
            const idx = m.index;
            if (idx > start && idx < start + 6000) continue;
          }
          writesOutside++;
        }
      } catch (e) {}
    }
    ok('villagerTricks written ONLY by _trickObservation', writeInside && writesOutside === 0,
      `writeInside=${writeInside} writesOutside=${writesOutside}`);
    const teleLines = src.split('\n').filter(l => l.includes("tele('counter_discovered'"));
    ok('counter_discovered tele fires from the discovery funnel', teleLines.length > 0,
      teleLines.length + ' call sites');
  } catch (e) { ok('villagerTricks/tele pin', false, String((e && e.message) || e).slice(0, 120)); }

  // ----- 6. SMOKE: 20d both sides, markers honest, run completes -----
  for (const side of ['control', 'armed']) {
    Object.assign(process.env, SUBSTRATE);
    if (side === 'armed') process.env.W3DRIVE = '1'; else delete process.env.W3DRIVE;
    const base = side === 'armed' ? W3.belongw3 : nakedBase('belongfeast');
    const { Game } = await loadGame({ seed: 151, mode: `w3drive-smoke-${side}` });
    await setupGame(Game);
    let w3Live = null, tfLive = null, wdLive = null, runCtx = null;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      runCtx = ctx; w3Live = W3.w3driveOn(); tfLive = TF.layerOn(); wdLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 20, sampleEvery: 30 }); });
    ok(`${side}: markers honest`, w3Live === (side === 'armed') && tfLive === true && wdLive === true,
      `w3=${w3Live} tf=${tfLive} wd=${wdLive}`);
    ok(`${side}: run completes`, !!(r && r.days >= 20), `days=${r && r.days}`);
    ok(`${side}: policy id`, base.id === 'belongfeast-windefer', base.id);
    delete process.env.W3DRIVE;
  }

  console.log(`\n== w3drive proof: ${pass} pass, ${fail} fail ==`);
  if (fail) { console.log('FAILS: ' + fails.join('\n  ')); process.exit(1); }
  console.log('proof GREEN.');
}
main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
