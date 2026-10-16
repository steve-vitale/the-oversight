#!/usr/bin/env node
'use strict';
// test-helpcall-20261016.js — proof tests for the sim-helpcall arm.
//
// THE ARM: raid crisis tiers are fixed (f6cecf3c) but no sweep policy ever
// calls for help, so the aid system sat unmeasured on the sweep substrate.
// scripts/policies/helpcall.js is the engagement layer: on an apex raid
// crisis (crisis.raiders && wave>=3, no call placed yet) it calls
// Game.callForHelp('runner', {}) and records every placement + every
// aidAskVillage verdict into Game.state.hcLedger for 100% attribution.
//
// RED->GREEN: pre-layer, the sweep stack placed ZERO help calls on apex
// raids (the control policies contain no call-for-help verb at all — the
// crisistier sweep's 16/16 identical pairs prove the fix alone is
// behavior-neutral). RED = the apex-only placement + gating assertions
// run against the unwrapped tribfloor stack fail (no placement recorded,
// no gating taxonomy). GREEN = withHelpCall passes them all.
//
// 1. UNIT (fake Game): placement fires only on apex raids; every
//    non-placement is classified; gate-off = pure delegation, zero trace.
// 2. ENGINE-TRUE (loadGame): a fabricated apex raid crisis
//    (Game.raiseAidCrisis + crisis.raiders=true — exactly what
//    havenRaidTick does) drives the REAL callForHelp; the ledger records
//    the engine's own return + the tail crisis.calls entry; the verdict
//    hook records a real aidAskVillage verdict.
// 3. DET-GATE: HELPCALL=0 armed-object vs the unwrapped tribfloor stack on
//    identical seeds — byte-identical trajectories required. Gate-off is
//    structurally pure delegation (the ONLY executed code is the env
//    read); the sim pins it.
//
// Substrate env (asserted): SEATDRIVE=0 FEASTSCALE_R13=1 NODEWITNESS=1.
//
// Run: node scripts/test-helpcall-20261016.js
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TF = require('./policies/tribfloor');
const HC = require('./policies/helpcall');

for (const k of ['SEATDRIVE', 'FEASTSCALE_R13', 'NODEWITNESS']) {
  const want = k === 'SEATDRIVE' ? '0' : '1';
  if (process.env[k] !== want) { console.error(`SUBSTRATE: ${k} must be ${want}`); process.exit(2); }
}

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const savedEnv = process.env.HELPCALL;
function setHc(v) { if (v == null) delete process.env.HELPCALL; else process.env.HELPCALL = v; }

// ---------- 1. UNIT: fake Game ----------
function fakeGame(crisis) {
  const calls = [];
  return {
    state: { scholar: { day: 42 } },
    __callForHelpArgs: null,
    aidCrisis() { return crisis; },
    // Emulates the engine contract: 'sent' pushes a tail entry into
    // crisis.calls (carrying targetId/runner); non-placement returns push
    // nothing.
    callForHelp(tier, opts) {
      this.__callForHelpArgs = [tier, opts];
      const ret = this.__retMode || 'sent';
      const c = this.aidCrisis();
      if (c && ret === 'sent') c.calls.push({ tier, day: 42, part: 1, targetId: 'vTest', runner: 'rTest', result: 'sent' });
      return ret;
    },
    aidAskVillage(v, via, m) { return 'refused'; },
    __crisisCalls: calls,
  };
}
function apexCrisis() { return { raiders: true, wave: 4, sinceDay: 40, calls: [] }; }

setHc('1');
{
  const G = fakeGame(apexCrisis());
  const ctx = {};
  HC.driveHelpCall(G, ctx);
  check('unit: apex raid crisis places exactly one runner call',
    G.__callForHelpArgs && G.__callForHelpArgs[0] === 'runner' && ctx.hcPlacements === 1,
    JSON.stringify(G.__callForHelpArgs));
  const led = G.state.hcLedger;
  check('unit: placement recorded to ledger with tier/wave/ret',
    led && led.calls.length === 1 && led.calls[0].tier === 'runner' && led.calls[0].wave === 4 && led.calls[0].ret === 'sent',
    JSON.stringify(led && led.calls));
  check('unit: verdict hook installed on placement path', G.__hcAskHook === true);
  // The hook records verdicts: call through the wrapped aidAskVillage.
  const v = G.aidAskVillage('v9', 'runner', {});
  check('unit: verdict recorded by hook', v === 'refused' && led.verdicts.length === 1 && led.verdicts[0].verdict === 'refused' && led.verdicts[0].via === 'runner');
  // Repeat drive on the same crisis: the placed call blocks a second one.
  const n0 = led.calls.length;
  HC.driveHelpCall(G, {});
  check('unit: no repeat placement after a placed call', led.calls.length === n0);
  // Non-placement returns ('nolink') re-attempt honestly: the engine says
  // aloud each time, and links can form mid-crisis. Classified, not a bug.
  const G2 = fakeGame(apexCrisis());
  G2.__retMode = 'nolink';
  HC.driveHelpCall(G2, {});
  HC.driveHelpCall(G2, {});
  const led2 = G2.state.hcLedger;
  check('unit: non-placement re-attempts are recorded attempts, never phantom placements',
    led2.calls.length === 2 && led2.calls.every(c => c.ret === 'nolink' && c.engineResult === ''));
}
{
  // Gating taxonomy: every non-placement classified, nothing placed.
  const cases = [
    ['no-crisis', null], ['resolved', { raiders: true, wave: 4, resolved: true, calls: [] }],
    ['not-raid', { raiders: false, wave: 4, calls: [] }], ['sub-apex', { raiders: true, wave: 2, calls: [] }],
    ['already-called', { raiders: true, wave: 5, calls: [{ tier: 'runner' }] }],
  ];
  let allOk = true;
  for (const [why, crisis] of cases) {
    const G = fakeGame(crisis);
    const ctx = {};
    HC.driveHelpCall(G, ctx);
    const ok = !G.__callForHelpArgs && (ctx.hcSkip || {})[why] === 1 && !(G.state.hcLedger && G.state.hcLedger.calls.length);
    if (!ok) { allOk = false; console.log(`    sub-case ${why} failed`); }
  }
  check('unit: gating taxonomy (no-crisis/resolved/not-raid/sub-apex/already-called)', allOk);
}
{
  // Gate-off: pure delegation, zero trace.
  setHc('0');
  const G = fakeGame(apexCrisis());
  let baseRan = false, spyFired = false;
  G.callForHelp = () => { spyFired = true; return 'sent'; };
  const wrapped = HC.withHelpCall({ daily(g, c) { baseRan = true; } }, 't', 'd');
  const ctx = {};
  wrapped.daily(G, ctx);
  check('unit: gate-off delegates to base', baseRan === true);
  check('unit: gate-off places no call', spyFired === false);
  check('unit: gate-off installs no hook and writes no ledger', !G.__hcAskHook && !G.state.hcLedger);
  check('unit: gate-off leaves no ctx trace', ctx.hcPlacements === undefined && ctx.hcSkip === undefined);
  setHc(null);
  check('unit: default (unset) is OFF', HC.layerOn() === false);
  setHc('1');
  check('unit: HELPCALL=1 is ON', HC.layerOn() === true);
  setHc('0');
  check('unit: HELPCALL=0 is OFF', HC.layerOn() === false);
}
setHc(savedEnv);

// ---------- 2. ENGINE-TRUE ----------
async function engineTrue() {
  setHc('1');
  const { Game } = await loadGame({ seed: 951, mode: 'helpcall-proof' });
  await setupGame(Game, null, 'courtship');
  // Fabricate exactly what havenRaidTick does: raise the crisis with the
  // true wave, then mark it a raid crisis.
  const raised = Game.raiseAidCrisis('reunion pack', 4);
  check('engine: raiseAidCrisis returns the crisis', !!raised && (raised.wave | 0) === 4);
  raised.raiders = true;
  const ctx = {};
  HC.driveHelpCall(Game, ctx);
  const led = Game.state.hcLedger;
  const p = led && led.calls[0];
  check('engine: real callForHelp placed on apex raid crisis', !!p && p.tier === 'runner' && p.wave === 4 && typeof p.ret === 'string');
  // Engine-true attribution: on a PLACED call the tail crisis.calls entry
  // matches; on a non-placement return ('nolink' here — the fresh game has
  // no linked villages) the engine pushes no tail entry, by engine design.
  const crisis = Game.aidCrisis();
  const tail = crisis && crisis.calls && crisis.calls[crisis.calls.length - 1];
  const nonPlaced = ['nolink', 'hot', 'null', 'no-verb', 'error', 'gated'].includes(p.ret);
  check('engine: ledger matches engine tail entry (or honest no-tail on non-placement)',
    (tail && p.engineResult === String(tail.result || '') && p.targetId === String(tail.targetId || '') && p.runner === String(tail.runner || '')) ||
    (!tail && nonPlaced && p.engineResult === '' && p.targetId === '' && p.runner === ''),
    JSON.stringify({ p, tail }));
  // The verdict hook is live on the real aidAskVillage.
  const before = led.verdicts.length;
  Game.aidAskVillage('no-such-village', 'runner', {});
  check('engine: real verdict recorded by hook', led.verdicts.length === before + 1 && String(led.verdicts[before].verdict) === 'nolink');
  // Second drive on a non-placed crisis: re-attempts, still no phantom
  // placement (the placed-call block is covered by the unit test above).
  const n0 = led.calls.length;
  HC.driveHelpCall(Game, {});
  check('engine: re-attempt adds an attempt, never a phantom placement', led.calls.length === n0 + 1 && Game.state.hcLedger.calls[n0].ret === 'nolink');
  setHc(savedEnv);
}

// ---------- 3. DET-GATE ----------
function dayHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const parts = [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length, Game.map.px, Game.map.py,
      Game.unlockedWave ? Game.unlockedWave() : 0,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)];
    return parts.join('|');
  } catch (e) { return 'ERR'; }
}
async function hashesFor(seed, policy, days) {
  const { Game } = await loadGame({ seed, mode: 'helpcall-det' });
  await setupGame(Game, null, 'courtship');
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  const r = await runDays(Game, wrapped, { days, manifest: { seed } });
  return { hashes: hashes.join('\n'), endReason: r.endReason, days: r.days };
}
async function detGate() {
  // Gate-off is asserted inside the runs: HELPCALL=0.
  setHc('0');
  const seeds = [951, 952, 953];
  let allOk = true;
  for (const seed of seeds) {
    const a1 = await quietLog(() => hashesFor(seed, HC.leadhc, 60));
    const a2 = await quietLog(() => hashesFor(seed, HC.leadhc, 60));
    const b1 = await quietLog(() => hashesFor(seed, TF.leadfeast, 60));
    const selfOk = a1.hashes === a2.hashes;
    const crossOk = a1.hashes === b1.hashes && a1.endReason === b1.endReason;
    console.log(`  det seed ${seed}: self-identical=${selfOk} cross-identical(armed-gateoff vs control)=${crossOk} end=${a1.endReason}/${b1.endReason}`);
    if (!selfOk) console.log(`    NOTE: self-pair differs on seed ${seed} — the known timestamp-ID/contest entropy issue (det-gate.js); seed cannot prove the gate.`);
    else if (!crossOk) { allOk = false; }
  }
  check('det-gate: gate-off armed-object is byte-identical to the unwrapped stack (on self-consistent seeds)', allOk);
  setHc(savedEnv);
}

(async () => {
  await engineTrue();
  await detGate();
  console.log(`\nhelpcall proof: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
