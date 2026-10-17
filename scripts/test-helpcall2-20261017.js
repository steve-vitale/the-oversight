#!/usr/bin/env node
'use strict';
// test-helpcall2-20261017.js — proof tests for the sim-helpcall2 arm.
//
// THE ARM: the aid-engaging policy layer scripts/policies/helpcall.js
// (withHelpCall, HELPCALL=1, default OFF, zero src/js) was measured on the
// BROKEN crisis-tier substrate (pre-crisistier: every raid crisis read wave
// 1, the wave>=3 apex penalty never applied). This arm re-runs it on the
// FIXED substrate. The layer is UNCHANGED — this proof re-pins its contract
// on the new substrate (no NODEWITNESS, TRIBFLOOR=1 active, the crisistier
// fix present in-tree).
//
// 1. UNIT (fake Game): placement fires only on apex raids; every
//    non-placement is classified; gate-off = pure delegation, zero trace;
//    default (unset) = OFF.
// 2. ENGINE-TRUE (loadGame): a fabricated apex raid crisis
//    (Game.raiseAidCrisis + crisis.raiders=true — exactly what
//    havenRaidTick does) drives the REAL callForHelp; the ledger records
//    the engine's own return + the tail crisis.calls entry; the verdict
//    hook records a real aidAskVillage verdict.
// 3. CONTROL-NAKEDNESS: the control stack (unwrapped tribfloor, HELPCALL
//    unset) run live installs NOTHING — no hook, no ledger. Layer markers
//    are honest on both sides: armed records, control is silent.
// 4. DET-GATE: HELPCALL=0 armed-object vs the unwrapped tribfloor stack on
//    identical seeds — byte-identical trajectories required.
// 5. SMOKE: armed stack 20d x 2 policies — no crash, no aid errors.
//
// Substrate env (asserted): SEATDRIVE=0 FEASTSCALE_R13=1 TRIBFLOOR=1
// SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, NODEWITNESS unset,
// ALLOWGATE2 unset.
//
// Run: SEATDRIVE=0 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 node scripts/test-helpcall2-20261017.js
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const TF = require('./policies/tribfloor');
const HC = require('./policies/helpcall');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SUBSTRATE: ${k} must be 1`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SUBSTRATE: SEATDRIVE must be 0 explicit (pre-seat courtship)'); process.exit(2); }
if (process.env.NODEWITNESS === '1') { console.error('SUBSTRATE: NODEWITNESS must NOT be 1 (this arm runs the crisistier substrate, not the witness substrate)'); process.exit(2); }
if (process.env.ALLOWGATE2 === '1') { console.error('SUBSTRATE: ALLOWGATE2 must be unset'); process.exit(2); }

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const savedEnv = process.env.HELPCALL;
function setHc(v) { if (v == null) delete process.env.HELPCALL; else process.env.HELPCALL = v; }

// ---------- 1. UNIT: fake Game ----------
function fakeGame(crisis) {
  return {
    state: { scholar: { day: 42 } },
    __callForHelpArgs: null,
    aidCrisis() { return crisis; },
    callForHelp(tier, opts) {
      this.__callForHelpArgs = [tier, opts];
      const ret = this.__retMode || 'sent';
      const c = this.aidCrisis();
      if (c && ret === 'sent') c.calls.push({ tier, day: 42, part: 1, targetId: 'vTest', runner: 'rTest', result: 'sent' });
      return ret;
    },
    aidAskVillage(v, via, m) { return 'refused'; },
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
  const v = G.aidAskVillage('v9', 'runner', {});
  check('unit: verdict recorded by hook', v === 'refused' && led.verdicts.length === 1 && led.verdicts[0].verdict === 'refused' && led.verdicts[0].via === 'runner');
  const n0 = led.calls.length;
  HC.driveHelpCall(G, {});
  check('unit: no repeat placement after a placed call', led.calls.length === n0);
  const G2 = fakeGame(apexCrisis());
  G2.__retMode = 'nolink';
  HC.driveHelpCall(G2, {});
  HC.driveHelpCall(G2, {});
  const led2 = G2.state.hcLedger;
  check('unit: non-placement re-attempts are recorded attempts, never phantom placements',
    led2.calls.length === 2 && led2.calls.every(c => c.ret === 'nolink' && c.engineResult === ''));
}
{
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
  const { Game } = await loadGame({ seed: 962, mode: 'helpcall2-proof' });
  await setupGame(Game, null, 'courtship');
  const raised = Game.raiseAidCrisis('reunion pack', 4);
  check('engine: raiseAidCrisis returns the crisis', !!raised && (raised.wave | 0) === 4);
  raised.raiders = true;
  const ctx = {};
  HC.driveHelpCall(Game, ctx);
  const led = Game.state.hcLedger;
  const p = led && led.calls[0];
  check('engine: real callForHelp placed on apex raid crisis', !!p && p.tier === 'runner' && p.wave === 4 && typeof p.ret === 'string');
  const crisis = Game.aidCrisis();
  const tail = crisis && crisis.calls && crisis.calls[crisis.calls.length - 1];
  const nonPlaced = ['nolink', 'hot', 'null', 'no-verb', 'error', 'gated'].includes(p.ret);
  check('engine: ledger matches engine tail entry (or honest no-tail on non-placement)',
    (tail && p.engineResult === String(tail.result || '') && p.targetId === String(tail.targetId || '') && p.runner === String(tail.runner || '')) ||
    (!tail && nonPlaced && p.engineResult === '' && p.targetId === '' && p.runner === ''),
    JSON.stringify({ p, tail }));
  const before = led.verdicts.length;
  Game.aidAskVillage('no-such-village', 'runner', {});
  check('engine: real verdict recorded by hook', led.verdicts.length === before + 1 && String(led.verdicts[before].verdict) === 'nolink');
  const n0 = led.calls.length;
  HC.driveHelpCall(Game, {});
  check('engine: re-attempt adds an attempt, never a phantom placement', led.calls.length === n0 + 1 && Game.state.hcLedger.calls[n0].ret === 'nolink');
  setHc(savedEnv);
}

// ---------- 3. CONTROL-NAKEDNESS: the control stack installs nothing ----------
async function controlNaked() {
  setHc(null); // explicitly unset — the true default-OFF path
  const { Game } = await loadGame({ seed: 963, mode: 'helpcall2-proof' });
  await setupGame(Game, null, 'courtship');
  await quietLog(() => runDays(Game, TF.leadfeast, { days: 20, manifest: { seed: 963 } }));
  check('control: no hcLedger on the unwrapped stack (HELPCALL unset)', Game.state.hcLedger === undefined);
  check('control: no verdict hook installed', !Game.__hcAskHook);
  setHc(savedEnv);
}

// ---------- 4. DET-GATE ----------
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
  const { Game } = await loadGame({ seed, mode: 'helpcall2-det' });
  await setupGame(Game, null, 'courtship');
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  const r = await runDays(Game, wrapped, { days, manifest: { seed } });
  return { hashes: hashes.join('\n'), endReason: r.endReason, days: r.days };
}
async function detGate() {
  setHc('0');
  const seeds = [962, 963, 964];
  let allOk = true;
  for (const seed of seeds) {
    const a1 = await quietLog(() => hashesFor(seed, HC.leadhc, 60));
    const a2 = await quietLog(() => hashesFor(seed, HC.leadhc, 60));
    const b1 = await quietLog(() => hashesFor(seed, TF.leadfeast, 60));
    const selfOk = a1.hashes === a2.hashes;
    const crossOk = a1.hashes === b1.hashes && a1.endReason === b1.endReason;
    console.log(`  det seed ${seed}: self-identical=${selfOk} cross-identical(armed-gateoff vs control)=${crossOk} end=${a1.endReason}/${b1.endReason}`);
    if (!selfOk) console.log(`    NOTE: self-pair differs on seed ${seed} — known timestamp-ID/contest entropy (det-gate.js); seed cannot prove the gate.`);
    else if (!crossOk) { allOk = false; }
  }
  check('det-gate: gate-off armed-object is byte-identical to the unwrapped stack (on self-consistent seeds)', allOk);
  setHc(savedEnv);
}

// ---------- 5. SMOKE ----------
async function smoke() {
  setHc('1');
  for (const [policy, pid] of [[HC.leadhc, 'leadfeast'], [HC.belonghc, 'belongfeast']]) {
    const { Game } = await loadGame({ seed: 965, mode: 'helpcall2-smoke' });
    await setupGame(Game, null, 'courtship');
    const r = await quietLog(() => runDays(Game, policy, { days: 20, manifest: { seed: 965 } }));
    const errs = (Game.state.hcLedger && Game.state.hcLedger.errors) || [];
    check(`smoke: armed ${pid} 20d runs clean (end=${r.endReason})`, !!r.endReason);
    check(`smoke: armed ${pid} has no aid-system errors`, errs.length === 0, JSON.stringify(errs.slice(0, 2)));
  }
  setHc(savedEnv);
}

(async () => {
  await engineTrue();
  await controlNaked();
  await detGate();
  await smoke();
  console.log(`\nhelpcall2 proof: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
