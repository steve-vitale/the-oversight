#!/usr/bin/env node
// test-w5gate-20261018.js — pre-sweep proof for sim-w5gate (flesh-out loop,
// 2026-10-18, scale-onramp axis, ARM sim-w5gate-a: the tableActive gate
// refinement re-measured on the NEW readiness bar).
//
// (a) RED→GREEN on the gate refinement: the OLD over-broad heuristic
//     (tableDone || tableWaiting) strands the hunt while a table invitation
//     pends (finding #369: 419 busy days vs 13 live on the pre-seat
//     stack) — RED pins that stranding on the old predicate. GREEN pins
//     the refined gate: live in the stranding state, down while the table
//     sits (Game.tableActive()), down in the win-deferral window
//     (winDeferred counts as sitting), fail-open when tableActive throws
//     or is absent.
// (b) det-gate: gate-off trajectory byte-identical to the plain seatdrive
//     composition (the same objects w5reach2/3 used), on the NEW-bar
//     pre-seat substrate (SEATDRIVE=0 explicit — post-c004b9dd, unset
//     means the win-side stack; finding #380).
// (c) SMOKE both sides with seat=false; layer-live markers honest
//     (WAVE5REACH is the only switch).
//
// NOTE: sim-w5reach3 (2026-10-15) already proved this refinement 22/22 on
// the OLD bar and the kill protocol REVERTED it ("must not be re-landed
// as-is"). This proof re-establishes the mechanism on the NEW bar — it is
// a new measurement's instrument, not a re-landing.
//
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
// WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1. The proof sets/unsets WAVE5REACH
// itself (the w5reach2 withEnv async hazard is avoided: env is restored
// only after the awaited run resolves).
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const W5R = require('./policies/wave5reach');
const SD = require('./policies/seatdrive');

// KILL-PROTOCOL INFO-SKIP: the tableActive gate refinement was REVERTED
// in-tree per kill protocol (sim-w5gate PRIMARY NO-COVERAGE on the
// NEW-bar pre-seat substrate — evidence/2026-10-18/sim-w5gate.md; the
// w5reach3 kill protocol's "must not be re-landed as-is" stands). The
// probe detects the refinement's presence via the stranding state
// (wave-4 unlocked + invitation pending + table NOT active): the refined
// gate is live there, the landed heuristic strands. If the refinement is
// absent, exit green with an INFO-SKIP when W5GATE_KILLED=1 (set by the
// coordinator after a killed arm); without the flag, absence is RED.
// Pre-kill result: 18/18 GREEN (logged in the evidence file).
process.env.WAVE5REACH = '1';
const _strandProbe = W5R.huntLive({
  unlockedWave: () => 4,
  progState: () => ({ tableDone: false, tableWaiting: true }),
  tableActive: () => false,
});
delete process.env.WAVE5REACH;
if (_strandProbe !== true) {
  if (process.env.W5GATE_KILLED === '1') {
    console.log('INFO-SKIP: tableActive gate refinement reverted per kill protocol (sim-w5gate PRIMARY NO-COVERAGE) — proof not applicable. Pre-kill result: 18/18 GREEN (evidence/2026-10-18/sim-w5gate.md).');
    process.exit(0);
  }
  console.error('RED: wave5reach.js lacks the tableActive refinement and W5GATE_KILLED is not set.');
  process.exit(1);
}
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('PROOF STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (SD.layerOn()) { console.error('PROOF STOP: seatdrive layerOn() must be false with SEATDRIVE=0.'); process.exit(2); }
if (W5R.wave5reachOn()) { console.error('PROOF STOP: WAVE5REACH must start unset.'); process.exit(2); }

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (cond) pass++; else fail++;
}

// withEnv (w5reach2 metric-review-4 fix): restore env only AFTER the
// awaited fn() resolves — a naive try/finally restores the moment the
// async function returns its promise, silently running "armed" gate-off.
async function withEnv(vars, fn) {
  const prev = {};
  for (const k of Object.keys(vars)) {
    prev[k] = process.env[k];
    if (vars[k] == null) delete process.env[k]; else process.env[k] = vars[k];
  }
  try { return await fn(); }
  finally { for (const k of Object.keys(vars)) { if (prev[k] == null) delete process.env[k]; else process.env[k] = prev[k]; } }
}

// The OLD over-broad predicate (landed 58131bb1, pre-refinement text) —
// RED instrument only.
function oldTableBusy(Game) {
  try {
    const pg = Game.progState ? Game.progState() : {};
    return !!(pg.tableDone || pg.tableWaiting);
  } catch (e) { return false; }
}
function oldHuntLive(Game) {
  if (!W5R.wave5reachOn()) return false;
  let uw = 1;
  try { uw = (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 1) | 0; } catch (e) {}
  return uw >= 4 && uw < 5 && !oldTableBusy(Game);
}

// Stub games for the gate unit checks. The stranding state is the whole
// point: wave-4 unlocked, tableWaiting pending, table NOT active.
const stubGate = (uw, { tableWaiting = false, tableDone = false, active = false, activeThrows = false, noActive = false } = {}) => {
  const g = {
    unlockedWave: () => uw,
    progState: () => ({ tableDone, tableWaiting }),
  };
  if (noActive) delete g.tableActive;
  else g.tableActive = () => { if (activeThrows) throw new Error('table state unavailable'); return active; };
  return g;
};

function gateUnits() {
  console.log('== gate units (RED on the old heuristic, GREEN on the refinement) ==');
  // The stranding state: wave-4, invitation PENDING, table not active.
  const strand = stubGate(4, { tableWaiting: true, active: false });
  // RED: the landed heuristic strands here (the 419-vs-13 mechanism).
  ok('RED old gate strands on pending invitation',
    oldHuntLive(strand) === false, 'finding #369 reproduced');
  // GREEN: the refined gate is live here.
  ok('GREEN refined gate live in stranding state',
    W5R.huntLive(strand) === true, 'finding #369 fix');
  // Sanctity: the table actually sitting stands the hunt down.
  const sitting = stubGate(4, { tableDone: true, active: true });
  ok('huntLive FALSE while the table sits (tableActive)',
    W5R.huntLive(sitting) === false, '');
  // Win-deferral window: tableActive() treats winDeferred as sitting.
  const deferred = stubGate(4, { tableWaiting: true, tableDone: false, active: true });
  ok('huntLive FALSE in win-deferral window (active, tableWaiting, !tableDone)',
    W5R.huntLive(deferred) === false, '');
  // Wave-5 already unlocked: the goal is met, hunt stands down.
  ok('huntLive FALSE after wave-5 unlock',
    W5R.huntLive(stubGate(5, { tableWaiting: true, active: false })) === false, '');
  // Fail-open (matches the old exception path): unreadable engine state
  // keeps the hunt live rather than silently stranding it.
  ok('huntLive TRUE when tableActive throws (fail-open)',
    W5R.huntLive(stubGate(4, { tableWaiting: true, activeThrows: true })) === true, '');
  ok('huntLive TRUE when Game has no tableActive (defensive default)',
    W5R.huntLive(stubGate(4, { tableWaiting: true, noActive: true })) === true, '');
}

function gateOffUnit() {
  console.log('== gate-off unit (WAVE5REACH unset: pure delegation) ==');
  // Gate-off: pure delegation.
  ok('huntLive FALSE when WAVE5REACH unset',
    W5R.huntLive(stubGate(4, { active: false })) === false, '');
}

async function detGate() {
  console.log('== det-gate (gate-off byte-identical to seatdrive composition) ==');
  const fails = [];
  for (const seed of [54201, 54202]) {
    for (const policyId of ['belongfeast', 'leadfeast']) {
      const ours = policyId === 'leadfeast' ? W5R.leadseat : W5R.belongseat;
      const theirs = policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
      const h = [];
      for (const [label, base] of [['ours', ours], ['theirs', theirs]]) {
        await withEnv({ WAVE5REACH: null }, async () => {
          const { Game } = await loadGame({ seed, mode: `w5gate-det-${label}`, fullTelemetry: false });
          await setupGame(Game);
          const hashes = [];
          const oDaily = base.daily;
          const policy = Object.assign({}, base, {
            daily(G, ctx) {
              if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
              try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
            },
          });
          await quietLog(async () => { await runDays(Game, policy, { days: 60, manifest: undefined, sampleEvery: 30 }); });
          h.push(hashes.join('|'));
        });
      }
      const same = h[0] === h[1];
      console.log(`  ${same ? 'PASS' : 'FAIL'} det-gate s${seed} ${policyId} — ${same ? 'byte-identical' : 'DIVERGED'}`);
      if (same) pass++; else { fail++; fails.push(`${seed}/${policyId}`); }
    }
  }
  if (fails.length) console.error('DET-GATE FAILED: ' + fails.join(', '));
}

async function smokeGate() {
  console.log('== smoke gate (both sides, SEATDRIVE=0 pre-seat) ==');
  const fails = [];
  for (const side of ['control', 'armed']) {
    await withEnv({ WAVE5REACH: side === 'armed' ? '1' : null }, async () => {
      const { Game } = await loadGame({ seed: 54201, mode: `w5gate-smoke-${side}`, fullTelemetry: false });
      await setupGame(Game);
      let w5Live = null, seatLive = null, deferLive = null;
      const base = W5R.belongseat;
      const policy = Object.assign({}, base);
      const oSetup = base.setup;
      policy.setup = (G, ctx) => {
        // Env-live assertion INSIDE the run (w5reach2 metric-review-4):
        // the layer must see the env the sweep intends.
        w5Live = W5R.wave5reachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
        if (oSetup) return oSetup(G, ctx);
      };
      let r = null;
      await quietLog(async () => { r = await runDays(Game, policy, { days: 15, manifest: undefined, sampleEvery: 30 }); });
      const markers = w5Live === (side === 'armed') && seatLive === false && deferLive === true;
      ok(`${side}: layer-live markers honest`, markers, `w5r=${w5Live} seat=${seatLive} defer=${deferLive}`);
      ok(`${side}: run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
      ok(`${side}: expected policy id`, base.id === 'belongfeast-windefer', base.id);
      if (!(markers && r && r.days >= 15 && base.id === 'belongfeast-windefer')) fails.push(side);
    });
  }
  if (fails.length) { console.error('SMOKE GATE FAILED: ' + fails.join(', ')); }
  return fails;
}

(async () => {
  await withEnv({ WAVE5REACH: '1' }, async () => { gateUnits(); });
  await withEnv({ WAVE5REACH: null }, async () => { gateOffUnit(); });
  await detGate();
  const smokeFails = await smokeGate();
  console.log(`\nPROOF: ${pass} passed, ${fail} failed${smokeFails.length ? ' (+smoke failures)' : ''}`);
  process.exit(fail || smokeFails.length ? 3 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(4); });
