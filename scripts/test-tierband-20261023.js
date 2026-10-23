#!/usr/bin/env node
// test-tierband-20261023.js — proof gates for sim-overtime-yield-b.
//
// The arm: scripts/policies/tierband.js (TIERBAND=1), composing OUTSIDE
// scripts/policies/splitclose.js (already on master, untouched):
// control = SPLITCLOSE=1 (discipline WITHOUT tier-awareness) = SC.armedFor;
// armed   = SPLITCLOSE=1 + TIERBAND=1 = TB.armedFor (tier>=3 wave-4 fights
// bypass the discipline — the scholar fights to kill normally; tier<3
// keeps the splitclose soften/hold discipline).
//
// E0 shape; E1 det-gate (TIERBAND unset => TB.armedFor byte-identical to
// SC.armedFor, SPLITCLOSE=1, 60d x2 bases); E2 env-gate; E3 synthetic
// RED->GREEN fixtures (tier-3+ fight => discipline bypassed: no hold, the
// scholar finishes via the discipline-free stack; tier-0/2 fight =>
// discipline active; tier sampling once at fight start = the
// measure-overtime-splitclose sampling point; non-w4/titan delegate;
// gate-off pure delegation); E4 armed+KILLDISC deterministic; D2 180d armed
// runs complete per policy + deterministic re-run.
//
// Usage (the full Usage-header env — the env-trap lesson: run exactly this):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 node scripts/test-tierband-20261023.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const SC = require(path.join(REPO, 'scripts', 'policies', 'splitclose'));
const TB = require(path.join(REPO, 'scripts', 'policies', 'tierband'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// Stable trajectory digest (same fields as the splitclose proof — the
// det-gate compares across compositions).
function digest(Game, result) {
  const st = Game.state || {};
  const s = st.scholar || {};
  const v = st.village || {};
  return JSON.stringify({
    day: s.day || 0,
    alive: !!Game.villagerId,
    hp: Math.round(s.hp || 0),
    pop: ((v.roster || []).length),
    pantry: Math.round((st.pantry && st.pantry.kcal) || 0),
    wkl: (st.waveKillLog || []).length,
    uw: (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 0),
    over: !!Game.over, won: !!Game.won,
    deaths: (result && result.samples && result.samples.deaths || []).length,
  });
}

async function shortRun(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'tierband-proof', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

// ---------- synthetic fight fixtures (E3) ----------
// Mirror the splitclose proof's makeGame + Game.overtimeTier.
const MONSTERS = [
  { id: 'the_algorithm', wave: 4 }, { id: 'the_audit', wave: 4 },
  { id: 'herald', wave: 4 }, { id: 'gavel', wave: 3 },
];
function makeGame(o) {
  o = o || {};
  const tgtHp = o.tgtHp != null ? o.tgtHp : 100; // in-band (feasted band 134)
  const tgtMid = o.tgtMid || 'the_algorithm';
  const compHpPct = o.compHpPct != null ? o.compHpPct : 0.9;
  const scholarHpPct = o.scholarHpPct != null ? o.scholarHpPct : 0.8;
  const round = o.round != null ? o.round : 3;
  const feasted = o.feasted !== false; // default feasted (band 134)
  const tier = o.tier != null ? o.tier : 0;
  const tierCalls = { n: 0 };
  const comps = o.comps === 0 ? [] : [{ key: 'v_0', kind: 'villager', villagerId: 'vidA', alive: true, fled: false, hp: 100 * compHpPct, maxHp: 100 }];
  const fighters = [
    { key: 'p', kind: 'villager', alive: true, hp: 100 * scholarHpPct, maxHp: 100 },
    ...comps,
    { key: 'm_0', kind: 'monster', monsterId: tgtMid, alive: true, fled: false, hp: tgtHp, maxHp: 1000 },
  ];
  const calls = { waits: 0, baseFights: 0 };
  const base = { fight(Game, ctx) { calls.baseFights++; return 'inner'; } };
  const G = {
    data: { monsters: MONSTERS },
    tbfight: { id: o.fightId || 'f1', over: false, round, fighters },
    tbIsPlayerTurn: () => true,
    tbFighter: (k) => fighters.find(f => f.key === k) || null,
    partyMembers: () => comps.map(c => c.villagerId),
    tbPlayerWait: () => { calls.waits++; },
    feastedActive: () => feasted,
    overtimeTier: o.tierFn || (() => { tierCalls.n++; return tier; }),
    _calls: calls, _base: base, _tierCalls: tierCalls,
  };
  return G;
}
function runTierband(G) {
  // Full composition as the armed policy builds it: splitclose over the
  // discipline-free base, tierband outside both.
  const split = SC.withSplitclose(G._base, 't', 't');
  const wrapped = TB.withTierband(split, G._base, 'tb', 'tb');
  const ctx = {};
  const r = wrapped.fight(G, ctx);
  return { r, ctx, calls: G._calls, tierCalls: G._tierCalls };
}
function tbKeys(ctx) { return Object.keys(ctx).filter(k => /^tb/.test(k) || k === '_tbFightObj'); }

async function main() {
  console.log('E0 shape');
  ok('E0 module loads with withTierband', typeof TB.withTierband === 'function');
  ok('E0 tierbandOn exported', typeof TB.tierbandOn === 'function');
  ok('E0 armedFor/controlFor exported', typeof TB.armedFor === 'function' && typeof TB.controlFor === 'function');
  ok('E0 tier cutoff = 3', TB.tierCutoff() === 3);
  ok('E0 overtimeTier reader exported', typeof TB.overtimeTier === 'function');

  console.log('E2 env-gate');
  delete process.env.TIERBAND;
  ok('E2 gate off when TIERBAND unset', !TB.tierbandOn());
  process.env.SPLITCLOSE = '1';
  process.env.TIERBAND = '1';
  ok('E2b gate on when TIERBAND=1', TB.tierbandOn());

  console.log('E3 synthetic RED->GREEN fixtures (SPLITCLOSE=1, TIERBAND=1)');

  // E3a: tier-3 fight => the discipline is BYPASSED. In-band target,
  // companions staged — the discipline ALONE would hold here (see E3h);
  // tierband fights to kill normally instead.
  {
    const G = makeGame({ tier: 3, tgtHp: 100 });
    const { r, ctx, calls } = runTierband(G);
    ok('E3a tier-3: inner base fights (scholar finishes normally)', calls.baseFights === 1, `baseFights=${calls.baseFights}`);
    ok('E3a tier-3: no hold', calls.waits === 0, `waits=${calls.waits}`);
    ok('E3a tier-3: discipline never fired (no sc* counters)', ctx.scHolds === undefined && ctx.scSoftens === undefined,
      `scHolds=${ctx.scHolds} scSoftens=${ctx.scSoftens}`);
    ok('E3a tier-3: bypass sampled + counted', ctx.tbFightTier === 3 && (ctx.tbHighTierBypasses | 0) >= 1 && (ctx.tbHighTierFights | 0) === 1,
      `tier=${ctx.tbFightTier} bypasses=${ctx.tbHighTierBypasses} fights=${ctx.tbHighTierFights}`);
  }
  // E3b: tier-0 fight => the discipline is ACTIVE (soften/hold as-is).
  {
    const G = makeGame({ tier: 0, tgtHp: 100 });
    const { ctx, calls } = runTierband(G);
    ok('E3b tier-0: discipline holds (waits)', calls.waits === 1, `waits=${calls.waits}`);
    ok('E3b tier-0: band hold counted on the splitclose side', (ctx.scHolds | 0) === 1, `scHolds=${ctx.scHolds}`);
    ok('E3b tier-0: inner base not called directly', calls.baseFights === 0, `baseFights=${calls.baseFights}`);
    ok('E3b tier-0: low-tier route counted', (ctx.tbLowTierFights | 0) === 1 && ctx.tbHighTier !== true, `tbLowTierFights=${ctx.tbLowTierFights}`);
  }
  // E3c: tier-5 fight far above the band => bypass too (no soften).
  {
    const G = makeGame({ tier: 5, tgtHp: 4000 });
    const { ctx, calls } = runTierband(G);
    ok('E3c tier-5: inner base fights', calls.baseFights === 1 && calls.waits === 0, `baseFights=${calls.baseFights} waits=${calls.waits}`);
    ok('E3c tier-5: no soften counter', ctx.scSoftens === undefined, `scSoftens=${ctx.scSoftens}`);
  }
  // E3d: tier-2 fight => discipline active (cutoff is 3).
  {
    const G = makeGame({ tier: 2, tgtHp: 100 });
    const { ctx, calls } = runTierband(G);
    ok('E3d tier-2: discipline holds', calls.waits === 1 && (ctx.scHolds | 0) === 1, `waits=${calls.waits} scHolds=${ctx.scHolds}`);
  }
  // E3e: tier sampled ONCE at fight start (the measure-overtime sampling
  // point) — never re-sampled mid-fight.
  {
    let n = 0;
    const G = makeGame({ tierFn: () => { const v = [1, 5, 9][Math.min(n, 2)]; n++; return v; } });
    const split = SC.withSplitclose(G._base, 't', 't');
    const wrapped = TB.withTierband(split, G._base, 'tb', 'tb');
    const ctx = {};
    wrapped.fight(G, ctx);            // fight start: samples 1
    ok('E3e tier sampled at fight start', ctx.tbFightTier === 1, `tbFightTier=${ctx.tbFightTier}`);
    wrapped.fight(G, ctx);            // same fight: must NOT re-sample
    ok('E3e tier not re-sampled mid-fight', ctx.tbFightTier === 1, `tbFightTier=${ctx.tbFightTier}`);
    const fightsBefore = ctx.tbW4Fights | 0;
    G.tbfight = { id: 'f2', over: false, round: 2, fighters: G.tbfight.fighters }; // new fight
    wrapped.fight(G, ctx);            // new fight start: samples 5
    ok('E3e tier re-sampled at next fight start', ctx.tbFightTier === 5 && (ctx.tbW4Fights | 0) === fightsBefore + 1,
      `tbFightTier=${ctx.tbFightTier} tbW4Fights=${ctx.tbW4Fights}`);
  }
  // E3f: non-wave-4 fight => delegate (no tier route), even at tier 5.
  {
    const G = makeGame({ tier: 5, tgtMid: 'gavel', tgtHp: 300 });
    const { ctx, calls } = runTierband(G);
    ok('E3f non-w4: delegates through to base', calls.baseFights === 1 && calls.waits === 0, `baseFights=${calls.baseFights}`);
    ok('E3f non-w4: no tier route', ctx.tbW4Fights === undefined && ctx.tbHighTier === false, `tbW4Fights=${ctx.tbW4Fights} tbHighTier=${ctx.tbHighTier}`);
  }
  // E3g: titan fight (herald, wave-4) => excluded exactly as in splitclose.
  {
    const G = makeGame({ tier: 5, tgtMid: 'herald', tgtHp: 100 });
    const { ctx, calls } = runTierband(G);
    ok('E3g titan: delegates, no bypass route', calls.baseFights === 1 && ctx.tbW4Fights === undefined, `baseFights=${calls.baseFights} tbW4Fights=${ctx.tbW4Fights}`);
    ok('E3g titan: splitclose never holds the titan', ctx.scHolds === undefined, `scHolds=${ctx.scHolds}`);
  }
  // E3h RED->GREEN: the SAME in-band tier-3 fight under the discipline
  // ALONE holds (the wasteful hold the arm removes) — under tierband it
  // fights to kill.
  {
    const G = makeGame({ tier: 3, tgtHp: 100 });
    const split = SC.withSplitclose(G._base, 't', 't');
    const ctx = {};
    split.fight(G, ctx); // SPLITCLOSE=1, no tierband
    ok('E3h RED: discipline alone holds at tier-3', G._calls.waits === 1 && (ctx.scHolds | 0) === 1, `waits=${G._calls.waits} scHolds=${ctx.scHolds}`);
    const G2 = makeGame({ tier: 3, tgtHp: 100 });
    const { ctx: c2, calls: calls2 } = runTierband(G2);
    ok('E3h GREEN: tierband bypasses at tier-3', calls2.baseFights === 1 && G2._calls.waits === 0 && c2.scHolds === undefined,
      `baseFights=${calls2.baseFights} waits=${G2._calls.waits} scHolds=${c2.scHolds}`);
  }
  // E3i gate-off pure delegation: TIERBAND unset, SPLITCLOSE=1 — the
  // wrapper must behave EXACTLY like the discipline stack, ctx untouched.
  {
    const savedT = process.env.TIERBAND; delete process.env.TIERBAND;
    const G1 = makeGame({ tier: 3, tgtHp: 100 });
    const wrapped1 = TB.withTierband(SC.withSplitclose(G1._base, 't', 't'), G1._base, 'tb', 'tb');
    const ctxA = {};
    wrapped1.fight(G1, ctxA);
    const G2 = makeGame({ tier: 3, tgtHp: 100 });
    const split2 = SC.withSplitclose(G2._base, 't', 't');
    const ctxB = {};
    split2.fight(G2, ctxB);
    ok('E3i gate-off: same calls as the naked discipline stack',
      JSON.stringify(G1._calls) === JSON.stringify(G2._calls),
      `\n  A=${JSON.stringify(G1._calls)}\n  B=${JSON.stringify(G2._calls)}`);
    ok('E3i gate-off: ctx untouched by tierband (no tb* keys)', tbKeys(ctxA).length === 0, `keys=${tbKeys(ctxA).join(',')}`);
    ok('E3i gate-off: identical ctx to the naked stack', JSON.stringify(ctxA) === JSON.stringify(ctxB),
      `\n  A=${JSON.stringify(ctxA)}\n  B=${JSON.stringify(ctxB)}`);
    if (savedT !== undefined) process.env.TIERBAND = savedT; else delete process.env.TIERBAND;
    process.env.TIERBAND = '1';
  }
  // E3j low-scholar-hp still delegates to the discipline's own bounds
  // (the bypass is tier-routed, not hp-routed): tier-0, scholar 30% hp,
  // in-band target => discipline declines the hold, scholar finishes.
  {
    const G = makeGame({ tier: 0, tgtHp: 100, scholarHpPct: 0.3 });
    const { ctx, calls } = runTierband(G);
    ok('E3j tier-0 low-hp: discipline bounds hold', calls.waits === 0 && calls.baseFights === 1, `waits=${calls.waits} baseFights=${calls.baseFights}`);
  }

  console.log('E1 det-gate (SPLITCLOSE=1, TIERBAND unset => byte-identical to SPLITCLOSE-only; 60d x2 bases)');
  {
    const savedT = process.env.TIERBAND; delete process.env.TIERBAND;
    process.env.SPLITCLOSE = '1';
    ok('E1 gate pinned: splitclose on, tierband off', SC.splitcloseOn() && !TB.tierbandOn());
    for (const [baseId, seed] of [['leadfeast', 65421], ['belongfeast', 65422]]) {
      const a = await shortRun(SC.armedFor(baseId), seed, 60);
      const b = await shortRun(TB.armedFor(baseId), seed, 60);
      const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
      ok(`E1 ${baseId} s${seed} byte-identical`, da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
    }
    if (savedT !== undefined) process.env.TIERBAND = savedT; else process.env.TIERBAND = '1';
  }

  console.log('E4 armed+KILLDISC deterministic (SPLITCLOSE=1, TIERBAND=1)');
  process.env.SPLITCLOSE = '1';
  process.env.TIERBAND = '1';
  {
    const a = await shortRun(TB.armedFor('leadfeast'), 65423, 60);
    const b = await shortRun(TB.armedFor('leadfeast'), 65423, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok('E4 identical seeds -> identical digest', da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }

  console.log('D2 180d armed runs complete per policy + deterministic re-run (SPLITCLOSE=1, TIERBAND=1)');
  {
    const a = await shortRun(TB.armedFor('leadfeast'), 65424, 180);
    const b = await shortRun(TB.armedFor('belongfeast'), 65425, 180);
    ok('D2 180d armed completes (leadfeast)', !!a.result, '');
    ok('D2 180d armed completes (belongfeast)', !!b.result, '');
    const c = await shortRun(TB.armedFor('leadfeast'), 65424, 180);
    const da = digest(a.Game, a.result), dc = digest(c.Game, c.result);
    ok('D2 180d armed deterministic re-run', da === dc, da !== dc ? `\n  A=${da}\n  C=${dc}` : '');
  }

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FAIL: ' + (e && e.stack || e)); process.exit(1); });
