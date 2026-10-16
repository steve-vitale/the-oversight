#!/usr/bin/env node
'use strict';
// test-belongreach-20261016.js — pre-sweep proof for sim-belongreach
// (flesh-out loop, 2026-10-16, scale-onramp axis: road-aware wave-5
// pursuit).
//
// THE ARM (policy-side only, ZERO src/js changes): scripts/policies/
// belongreach.js — the wave5reach hunt/commit mechanism (huntLive
// window, every-3rd-day cadence, healthy-and-fed precondition, _huntCommit
// + _w5Commit commit flags, the 35% mid-fight eject untouched) gated to
// the BELONG ROAD only. wave5reach.js is NOT refactored — it stays as
// landed (the tableBusy(tableDone||tableWaiting) heuristic restored after
// the w5reach3 refinement was reverted per kill protocol).
//
// WHY: evidence/2026-10-15/sim-w5reach3.md — road heterogeneity: armed
// moved belong road 0/8 -> 4/8 wave-5 unlocks but regressed lead road
// 8/8 -> 5/8 with median -11.5d (scholar-absence + fight-risk cost where
// the base already wins). So the hunt fires ONLY where the base's own
// verbs aren't already unlocking. Lead-road ids get pure delegation even
// with the layer opted in.
//
// Substrate (asserted up front — #312 lesson):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1
//   SEATDRIVE must be UNSET (fail loudly if set — pre-seat substrate;
//   the w5reach2/w5reach3 precedent, SEATDRIVE unset keeps wins off so
//   wave-5 reach is measurable).
//   control: BR.leadseat/belongseat with BELONGREACH unset
//   armed:   the SAME objects + BELONGREACH=1
//
// RED->GREEN: the proof's G2/R1 checks pin the road gate (lead ids
// delegate pure even with BELONGREACH=1) — on a wave5reach-shaped layer
// they FAIL; they pass only with the belong-road gate. The det-gate pins
// gate-off byte-identity (d) and the road-gate byte-identity (lead armed
// == plain seatdrive).
//
// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (BELONGREACH_KILLED=1
// set by the coordinator after a killed arm), this proof exits green
// with an INFO-SKIP instead of FATAL-ing. Without the layer and without
// the flag, absence is RED (exit 1).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 node scripts/test-belongreach-20261016.js
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');

let BR = null;
try {
  BR = require('./policies/belongreach');
} catch (e) {
  if (process.env.BELONGREACH_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/belongreach.js is ABSENT (killed per kill protocol — layer deleted, evidence+instruments kept).');
    console.log('INFO-SKIP: this proof skips loudly instead of FATAL-ing.');
    process.exit(0);
  }
  console.error('PROOF RED: scripts/policies/belongreach.js is ABSENT — the layer does not exist yet.');
  console.error('PROOF RED: ' + e.message);
  process.exit(1);
}

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

// Fabricated mid-game state: wave-4 unlocked, scholar healthy and fed.
// Enough surface for huntLive / huntLeg / fight-flag checks; the real
// Game drives the determinism and smoke checks below.
const stubGate = (uw, { tableWaiting = false, tableDone = false } = {}) => ({
  unlockedWave: () => uw,
  progState: () => ({ tableDone, tableWaiting }),
  state: { scholar: { hp: 80, kcal: 500, day: 60, mx: 4, my: 4 } },
  maxHealth: () => 100,
  data: { monsters: [{ id: 'the_editor', wave: 4 }, { id: 'the_spool', wave: 3 }] },
  over: false, tbfight: false,
});

const stubHuntWorld = () => {
  const g = stubGate(4);
  g.map = { px: 0, py: 0 };
  g.travelTargets = () => [{ x: 1, y: 1, d: 3 }];
  g.tileAt = () => ({ type: 'thicket', revealed: true });
  g.travelTo = (x, y) => { g.map.px = x; g.map.py = y; };
  g.monsterAt = () => null; // no visible monster — the leg travels honestly without an engagement
  return g;
};

const stubFight = (mid, wave) => {
  const g = stubGate(4);
  g.tbfight = { over: false, fighters: [{ kind: 'monster', hp: 900, monsterId: mid }] };
  g.data = { monsters: [{ id: mid, wave }] };
  return g;
};

async function detGateCheck() {
  // (a) gate-off byte-identity: wrapped (BELONGREACH unset) vs plain
  // seatdrive composition — both roads.
  // (b) road-gate byte-identity: leadseat with BELONGREACH=1 vs plain
  // seatdrive leadseat — the road gate keeps lead pure delegation even
  // opted in.
  const checks = [];
  const cases = [
    { wp: BR.belongseat, sp: SD.belongseat, seed: 181, env: { BELONGREACH: undefined }, tag: 'belong gate-off' },
    { wp: BR.leadseat, sp: SD.leadseat, seed: 292, env: { BELONGREACH: undefined }, tag: 'lead gate-off' },
    { wp: BR.leadseat, sp: SD.leadseat, seed: 403, env: { BELONGREACH: '1' }, tag: 'lead armed (road gate)' },
  ];
  for (const c of cases) {
    await withEnv({ ...SUBSTRATE, ...c.env }, async () => {
      const hA = [], hB = [];
      const { Game: gA } = await loadGame({ seed: c.seed, mode: 'belongreach-det-wrapped', fullTelemetry: false });
      await setupGame(gA);
      await quietLog(async () => { await runDays(gA, c.wp, { days: 60, sampleEvery: 30, collectHashes: (h) => hA.push(h) }); });
      const { Game: gB } = await loadGame({ seed: c.seed, mode: 'belongreach-det-naked', fullTelemetry: false });
      await setupGame(gB);
      await quietLog(async () => { await runDays(gB, c.sp, { days: 60, sampleEvery: 30, collectHashes: (h) => hB.push(h) }); });
      const same = hA.length === hB.length && hA.every((h, i) => h === hB[i]);
      checks.push({ tag: c.tag, seed: c.seed, same, n: hA.length });
    });
  }
  return checks;
}

async function armedDeterminism() {
  // Gate-on determinism on the new base: two identical 60d belong-armed
  // runs must be byte-identical.
  const hs = [];
  for (let i = 0; i < 2; i++) {
    await withEnv({ ...SUBSTRATE, BELONGREACH: '1' }, async () => {
      const { Game } = await loadGame({ seed: 181, mode: `belongreach-armed-det-${i}`, fullTelemetry: false });
      await setupGame(Game);
      const h = [];
      await quietLog(async () => { await runDays(Game, BR.belongseat, { days: 60, sampleEvery: 30, collectHashes: (x) => h.push(x) }); });
      hs.push(h);
    });
  }
  return hs[0].length === hs[1].length && hs[0].every((h, i) => h === hs[1][i]);
}

async function main() {
  console.log('== belongreach pre-sweep proof (road-aware wave-5 pursuit, pre-seat stack) ==');

  // ----- 1. layerOn honesty + ids -----
  await withEnv({ BELONGREACH: '1' }, async () => ok('belongreachOn true when BELONGREACH=1', BR.belongreachOn() === true, ''));
  await withEnv({ BELONGREACH: undefined }, async () => ok('belongreachOn false when unset', BR.belongreachOn() === false, ''));
  await withEnv({ SEATDRIVE: undefined }, async () => ok('seatdrive layerOn false when SEATDRIVE unset (pre-seat)', SD.layerOn() === false, ''));
  await withEnv({ WINDEFER: '1' }, async () => ok('windefer layerOn true under WINDEFER=1', WD.layerOn() === true, ''));
  ok('leadseat id', BR.leadseat && BR.leadseat.id === 'leadfeast-windefer', BR.leadseat && BR.leadseat.id);
  ok('belongseat id', BR.belongseat && BR.belongseat.id === 'belongfeast-windefer', BR.belongseat && BR.belongseat.id);

  // ----- 2. THE ROAD GATE unit checks (RED->GREEN pivot) -----
  await withEnv({ BELONGREACH: '1' }, async () => {
    ok('G1 huntLive TRUE on belong road, wave-4, nothing busy',
      BR.huntLive(stubGate(4), 'belong') === true, '');
    // THE GATE: lead ids hunt NEVER — even with the layer opted in and
    // the hunt window live on the belong road.
    ok('G2 huntLive FALSE on lead road (same live state) — the road gate',
      BR.huntLive(stubGate(4), 'lead') === false, '');
    ok('G3 huntLive FALSE pre-wave-4 (belong)', BR.huntLive(stubGate(3), 'belong') === false, '');
    ok('G4 huntLive FALSE once wave-5 unlocked (belong)', BR.huntLive(stubGate(5), 'belong') === false, '');
    // Landed heuristic preserved: a pending invitation strands the hunt
    // (tableBusy = tableDone || tableWaiting), exactly as wave5reach.js
    // landed. This arm is the ROAD gate, not the table gate.
    ok('G5 huntLive FALSE on belong road with tableWaiting pending (landed tableBusy heuristic)',
      BR.huntLive(stubGate(4, { tableWaiting: true }), 'belong') === false, '');
  });
  await withEnv({ BELONGREACH: undefined }, async () => {
    ok('G6 huntLive FALSE when gate off (belong, live window)', BR.huntLive(stubGate(4), 'belong') === false, '');
    ok('G7 huntLive FALSE when gate off (lead, live window)', BR.huntLive(stubGate(4), 'lead') === false, '');
  });

  // ----- 3. daily: hunt legs fire belong-only -----
  const baseShim = { dailyCalls: 0, fightCalls: 0, daily(Game, ctx) { this.dailyCalls++; return ctx; }, fight(Game, ctx) { this.fightCalls++; return ctx; } };
  await withEnv({ BELONGREACH: '1' }, async () => {
    // Lead: pure delegation — ctx untouched, base.daily called exactly once.
    const leadW = BR.withBelongReach(baseShim, 'leadfeast-windefer', 'lead test', 'lead');
    const ctxL = {};
    const gL = stubHuntWorld();
    leadW.daily(gL, ctxL);
    ok('R1 lead daily delegates pure: base.daily called once', baseShim.dailyCalls === 1, `calls=${baseShim.dailyCalls}`);
    ok('R2 lead daily touches no hunt state (ctx.w5Hunts undefined)', ctxL.w5Hunts === undefined, JSON.stringify(Object.keys(ctxL)));
    // Belong: the hunt leg fires on the fabricated mid-game state.
    const belongW = BR.withBelongReach(baseShim, 'belongfeast-windefer', 'belong test', 'belong');
    const ctxB = {};
    belongW.daily(stubHuntWorld(), ctxB);
    ok('H1 belong daily fires the hunt leg (w5Hunts >= 1)', (ctxB.w5Hunts || 0) >= 1, `w5Hunts=${ctxB.w5Hunts}`);
    ok('H2 belong hunt leg travels (w5HuntLegs >= 1)', (ctxB.w5HuntLegs || 0) >= 1, `w5HuntLegs=${ctxB.w5HuntLegs}`);
    ok('H3 belong hunt is cadence-gated (same-day second call does not re-hunt)',
      (() => { belongW.daily(stubHuntWorld(), ctxB); return ctxB.w5Hunts === 1; })(), `w5Hunts=${ctxB.w5Hunts}`);
  });
  await withEnv({ BELONGREACH: undefined }, async () => {
    const belongW = BR.withBelongReach(baseShim, 'belongfeast-windefer', 'belong test', 'belong');
    const ctx = {};
    belongW.daily(stubHuntWorld(), ctx);
    ok('R3 belong daily gate-off touches no hunt state', ctx.w5Hunts === undefined, JSON.stringify(Object.keys(ctx)));
  });

  // ----- 4. fight: commit flags belong-only -----
  await withEnv({ BELONGREACH: '1' }, async () => {
    const shim = { fight(Game, ctx) { return ctx; } };
    const belongW = BR.withBelongReach(shim, 'belongfeast-windefer', 'belong test', 'belong');
    const leadW = BR.withBelongReach(shim, 'leadfeast-windefer', 'lead test', 'lead');
    const ctxW4 = {};
    belongW.fight(stubFight('the_editor', 4), ctxW4);
    ok('F1 belong marks _w5Commit on wave-4 fight (armed)', ctxW4._w5Commit === true, `_w5Commit=${ctxW4._w5Commit}`);
    ok('F2 belong does not mark _huntCommit on wave-4 fight', ctxW4._huntCommit === false, '');
    const ctxW3 = {};
    belongW.fight(stubFight('the_spool', 3), ctxW3);
    ok('F3 belong marks _huntCommit on wave-3 fight (armed)', ctxW3._huntCommit === true, `_huntCommit=${ctxW3._huntCommit}`);
    ok('F4 belong does not mark _w5Commit on wave-3 fight', ctxW3._w5Commit === false, '');
    const ctxL = {};
    leadW.fight(stubFight('the_editor', 4), ctxL);
    ok('R4 lead fight never touches commit flags (pure delegation)', ctxL._w5Commit === undefined && ctxL._huntCommit === undefined,
      JSON.stringify(Object.keys(ctxL)));
  });
  await withEnv({ BELONGREACH: undefined }, async () => {
    const shim = { fight(Game, ctx) { return ctx; } };
    const belongW = BR.withBelongReach(shim, 'belongfeast-windefer', 'belong test', 'belong');
    const ctx = {};
    belongW.fight(stubFight('the_editor', 4), ctx);
    // Pure delegation on gate-off: the wrapper never touches ctx at all
    // (no reset hygiene needed — nothing was ever set).
    ok('F5 belong gate-off marks no commit flags (pure delegation)', ctx._w5Commit === undefined && ctx._huntCommit === undefined,
      JSON.stringify(Object.keys(ctx)));
  });

  // ----- 5. the 35% eject is preserved (d) -----
  // The layer only MARKS the two commit flags; mid-fight ejection lives
  // in competent.js and reads the threshold from ctx._huntCommit alone.
  // E1: the layer contains no threshold/eject/flee logic of its own.
  // E1: the layer's CODE contains no threshold/eject/flee logic of its
  // own. Comments are stripped first — the header describes the eject
  // as staying in competent.js, which is not code.
  const layerSrc = fs.readFileSync(path.join(__dirname, 'policies', 'belongreach.js'), 'utf8')
    .replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  ok('E1 layer sets no threshold logic (no 0.35 / eject / flee)',
    !/0\.35/.test(layerSrc) && !/\beject\b/i.test(layerSrc) && !/\.flee\(/.test(layerSrc),
    'the mid-fight 35% eject stays in competent.js');
  const flagWrites = (layerSrc.match(/ctx\._(huntCommit|w5Commit)\s*=\s*(true|false)/g) || []).length;
  ok('E2 layer writes exactly the two commit flags in the wave5reach pattern (reset-pair + conditional sets + exception-pair)',
    flagWrites === 6 && !/(ctx\._\w+Commit)\s*=\s*(true|false)/.test(layerSrc.replace(/ctx\._(huntCommit|w5Commit)\s*=\s*(true|false)/g, '')),
    `flag writes=${flagWrites} (expect 6: _huntCommit/_w5Commit reset false + conditional true + exception-path false)`);
  // E3: competent.js's mid-fight eject threshold reads ONLY _huntCommit —
  // _w5Commit committed fights still retreat at 35%.
  const compSrc = fs.readFileSync(path.join(__dirname, 'policies', 'competent.js'), 'utf8');
  const ejectLine = compSrc.split('\n').find(l => /_huntCommit \? 0\.12 : 0\.35/.test(l));
  ok('E3 competent.js eject threshold is `_huntCommit ? 0.12 : 0.35` and never reads _w5Commit',
    !!ejectLine && !/_w5Commit/.test(ejectLine), ejectLine ? ejectLine.trim().slice(0, 80) : '(threshold line not found)');

  // ----- 6. det-gate: gate-off inert + road-gate lead-armed inert -----
  const detChecks = await detGateCheck();
  for (const c of detChecks) {
    ok(`det-gate byte-identical (${c.tag}, seed ${c.seed}, n=${c.n})`, c.same, '');
  }

  // ----- 7. gate-on determinism on the new base -----
  ok('armed belong 60d trajectory deterministic across two identical runs', await armedDeterminism(), '');

  // ----- 8. live armed smoke (layer live markers, run completes) -----
  await withEnv({ ...SUBSTRATE, BELONGREACH: '1' }, async () => {
    const { Game } = await loadGame({ seed: 181, mode: 'belongreach-smoke-armed', fullTelemetry: false });
    await setupGame(Game);
    let brLive = null, seatLive = null, deferLive = null;
    const base = BR.belongseat;
    const policy = Object.assign({}, base);
    const oSetup = base.setup;
    policy.setup = (G, ctx) => {
      brLive = BR.belongreachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
      if (oSetup) return oSetup(G, ctx);
    };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 60, sampleEvery: 30 }); });
    ok('smoke: layer-live markers honest', brLive === true && seatLive === false && deferLive === true,
      `br=${brLive} seat=${seatLive} defer=${deferLive}`);
    ok('smoke: run completes', !!(r && r.days >= 60), `days=${r && r.days}`);
  });
  delete process.env.BELONGREACH;

  console.log(`\n== belongreach proof: ${pass} pass, ${fail} fail ==`);
  if (fail) { console.error('PROOF FAILURES: ' + fails.join(' | ')); process.exit(1); }
  console.log('PROOF GREEN.');
}
main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
