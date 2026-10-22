#!/usr/bin/env node
// test-splitkill-20261022.js — proof gates for sim-splitkill.
//
// E0 shape; E1 det-gate (SPLITKILL unset -> armedFor byte-identical to the
// base stack, 60d x2 bases); E1c (+ the seatdrive/vetrel/reposition gates
// still delegate); E2 env-gate; E3 synthetic RED->GREEN fixtures on the
// discipline (soften above band, overshoot hold, band hold, stall finish,
// hurt-companion resume, non-w4 delegate, titan excluded, companion-less
// delegate, low-scholar-hp delegate, round-1 delegate); E4 armed+KILLDISC
// deterministic; D2 180d armed runs complete per policy + deterministic
// re-run.
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   node scripts/test-splitkill-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('PROOF STOP: NODEWITNESS=1 is required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const RP = require(path.join(REPO, 'scripts', 'policies', 'reposition'));
const VR = require(path.join(REPO, 'scripts', 'policies', 'vetrel'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const SK = require(path.join(REPO, 'scripts', 'policies', 'splitkill'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function stackFor(base, tag) {
  const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
  const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
  const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
  return SD.withSeatDrive(w, tag + '-seatdrive', tag + ' seatdrive');
}
function armedFor(base, tag) {
  return SK.withSplitkill(stackFor(base, tag), tag + '-splitkill', tag + ' + splitkill');
}

// Stable trajectory digest: end-state fields that must match for
// byte-identical delegation (excludes wall-clock-derived ids).
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
  const { Game } = await loadGame({ seed, mode: 'splitkill-proof', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

// ---------- synthetic fight fixtures (E3) ----------
const MONSTERS = [
  { id: 'the_algorithm', wave: 4 }, { id: 'the_audit', wave: 4 },
  { id: 'herald', wave: 4 }, { id: 'gavel', wave: 3 },
];
function makeGame(o) {
  o = o || {};
  const tgtHp = o.tgtHp != null ? o.tgtHp : 900;
  const tgtMid = o.tgtMid || 'the_algorithm';
  const tgtWave = (MONSTERS.find(m => m.id === tgtMid) || {}).wave || 4;
  const compHpPct = o.compHpPct != null ? o.compHpPct : 0.9;
  const scholarHpPct = o.scholarHpPct != null ? o.scholarHpPct : 0.8;
  const round = o.round != null ? o.round : 3;
  const comps = o.comps === 0 ? [] : [{ key: 'v_0', kind: 'villager', villagerId: 'vidA', alive: true, fled: false, hp: 100 * compHpPct, maxHp: 100 }];
  const fighters = [
    { key: 'p', kind: 'villager', alive: true, hp: 100 * scholarHpPct, maxHp: 100 },
    ...comps,
    { key: 'm_0', kind: 'monster', monsterId: tgtMid, alive: true, fled: false, hp: tgtHp, maxHp: 1000 },
  ];
  const calls = { waits: 0, baseFights: 0 };
  const base = { fight(Game, ctx) { calls.baseFights++; return true; } };
  const G = {
    data: { monsters: MONSTERS },
    tbfight: { id: 'f1', over: false, round, fighters },
    tbIsPlayerTurn: () => true,
    tbFighter: (k) => fighters.find(f => f.key === k) || null,
    partyMembers: () => comps.map(c => c.villagerId),
    tbPlayerWait: () => { calls.waits++; },
    _calls: calls, _base: base,
  };
  return G;
}
function runDiscipline(G, preset) {
  const ctx = {};
  const wrapped = SK.withSplitkill(G._base, 't', 't');
  if (preset) { ctx._skFightObj = G.tbfight; ctx._skDisc = Object.assign({ fight: G.tbfight, holds: 0, stall: 0, scholarEst: 120, lastTgtHp: null, lastHoldHp: null }, preset); }
  const r = wrapped.fight(G, ctx);
  return { r, ctx, calls: G._calls };
}

async function main() {
  console.log('E0 shape');
  ok('E0 module loads with withSplitkill', typeof SK.withSplitkill === 'function');
  ok('E0 splitkillOn exported', typeof SK.splitkillOn === 'function');
  ok('E0 YIELD_BAND positive number', typeof SK.YIELD_BAND() === 'number' && SK.YIELD_BAND() > 0, 'band=' + SK.YIELD_BAND());

  console.log('E2 env-gate');
  ok('E2 gate off when unset', !SK.splitkillOn());

  // E3 needs the gate ON (E2 pinned it off).
  process.env.SPLITKILL = '1';
  ok('E2b gate on when SPLITKILL=1', SK.splitkillOn());

  console.log('E3 synthetic fixtures (band=' + SK.YIELD_BAND() + ')');
  const BAND = SK.YIELD_BAND();
  // E3a: above band+est -> soften (fall through to base)
  {
    const G = makeGame({ tgtHp: BAND + 500 });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3a soften above band -> base.fight', r === true && calls.baseFights === 1 && calls.waits === 0, JSON.stringify({ r, ctx: ctx.skSoftens }));
    ok('E3a skSoftens counted', (ctx.skSoftens | 0) === 1);
  }
  // E3b: in band -> hold
  {
    const G = makeGame({ tgtHp: Math.floor(BAND * 0.5) });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3b in-band -> hold (wait)', r === true && calls.waits === 1 && calls.baseFights === 0);
    ok('E3b skBandHolds counted', (ctx.skBandHolds | 0) === 1);
  }
  // E3c: overshoot guard — est > band, target between band and est
  {
    const G = makeGame({ tgtHp: Math.floor(BAND * 1.2) });
    const est = Math.floor(BAND * 2.5);
    const { r, ctx, calls } = runDiscipline(G, { scholarEst: est, lastTgtHp: Math.floor(BAND * 1.2) });
    ok('E3c overshoot risk -> hold not strike', r === true && calls.waits === 1 && calls.baseFights === 0, `est=${est} tgt=${Math.floor(BAND * 1.2)}`);
    ok('E3c skOvershootHolds counted', (ctx.skOvershootHolds | 0) === 1);
  }
  // E3d: stall — two stalled holds -> scholar resumes
  {
    const hp = Math.floor(BAND * 0.5);
    const G = makeGame({ tgtHp: hp });
    const ctx = {};
    const wrapped = SK.withSplitkill(G._base, 't', 't');
    wrapped.fight(G, ctx); // hold 1 (lastHoldHp=hp)
    const r2 = wrapped.fight(G, ctx); // hold 2, stall=1
    const r3 = wrapped.fight(G, ctx); // stall=2 -> finish
    ok('E3d two stalled holds -> resume', r2 === true && G._calls.waits === 2 && r3 === true && G._calls.baseFights === 1, `waits=${G._calls.waits} base=${G._calls.baseFights}`);
    ok('E3d skStallFinishes counted', (ctx.skStallFinishes | 0) === 1);
  }
  // E3e: hurt companion -> resume striking
  {
    const G = makeGame({ tgtHp: Math.floor(BAND * 0.5), compHpPct: 0.3 });
    const { r, ctx, calls } = runDiscipline(G, { holds: 2 });
    ok('E3e hurt companion -> resume (no breakoff)', r === true && calls.baseFights === 1 && calls.waits === 0);
  }
  // E3f: non-w4 fight -> delegate
  {
    const G = makeGame({ tgtHp: 100, tgtMid: 'gavel' });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3f wave-3 fight -> delegate', r === true && calls.baseFights === 1 && (ctx.skHolds | 0) === 0);
  }
  // E3g: titan (herald) -> excluded
  {
    const G = makeGame({ tgtHp: 100, tgtMid: 'herald' });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3g herald excluded -> delegate', r === true && calls.baseFights === 1 && (ctx.skHolds | 0) === 0 && (ctx.skW4Fights | 0) === 0);
  }
  // E3h: no companions -> delegate
  {
    const G = makeGame({ tgtHp: Math.floor(BAND * 0.5), comps: 0 });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3h no companions -> delegate', r === true && calls.baseFights === 1 && (ctx.skHolds | 0) === 0);
  }
  // E3i: scholar hp <50% -> no hold
  {
    const G = makeGame({ tgtHp: Math.floor(BAND * 0.5), scholarHpPct: 0.4 });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3i scholar <50% hp -> no hold', r === true && calls.baseFights === 1 && calls.waits === 0);
  }
  // E3j: round 1 -> no hold
  {
    const G = makeGame({ tgtHp: Math.floor(BAND * 0.5), round: 1 });
    const { r, ctx, calls } = runDiscipline(G);
    ok('E3j round 1 -> no hold', r === true && calls.baseFights === 1 && calls.waits === 0);
  }
  // E3k: gate off -> pure delegation, ctx untouched
  {
    delete process.env.SPLITKILL;
    const G = makeGame({ tgtHp: Math.floor(BAND * 0.5) });
    const ctx = {};
    const wrapped = SK.withSplitkill(G._base, 't', 't');
    const r = wrapped.fight(G, ctx);
    ok('E3k gate-off -> base.fight, ctx untouched', r === true && G._calls.baseFights === 1 && Object.keys(ctx).length === 0, 'ctx keys: ' + Object.keys(ctx).join(','));
    process.env.SPLITKILL = '1';
  }
  // E3l: hold cap reached -> scholar resumes (bounded hold)
  {
    const G = makeGame({ tgtHp: Math.floor(BAND * 0.5) });
    const { r, ctx, calls } = runDiscipline(G, { holds: 10, lastHoldHp: Math.floor(BAND * 0.5) });
    ok('E3l hold cap -> resume', r === true && calls.baseFights === 1 && calls.waits === 0, `holds=10`);
  }
  // E3m: overshoot shave takes the shared cap/stall path (no unbounded hold)
  {
    const hp = Math.floor(BAND * 3);
    const G = makeGame({ tgtHp: hp });
    const ctx = {};
    const wrapped = SK.withSplitkill(G._base, 't', 't');
    // Two holds with zero companion damage -> stall hands back the finish.
    wrapped.fight(G, ctx); // overshoot hold 1 (lastHoldHp=hp)
    wrapped.fight(G, ctx); // overshoot hold 2, stall=1
    const r3 = wrapped.fight(G, ctx); // stall=2 -> finish
    ok('E3m stalled overshoot -> resume', r3 === true && G._calls.waits === 2 && G._calls.baseFights === 1,
      `waits=${G._calls.waits} base=${G._calls.baseFights}`);
    ok('E3m skOvershootHolds counted', (ctx.skOvershootHolds | 0) === 2);
  }

  console.log('E1 det-gate (60d x2 bases, SPLITKILL unset)');
  delete process.env.SPLITKILL;
  ok('E1 gate off again for det-gate', !SK.splitkillOn());
  for (const [baseId, seed] of [['leadfeast', 65411], ['belongfeast', 65412]]) {
    const base = baseId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    const a = await shortRun(stackFor(base, baseId + 'A'), seed, 60);
    const b = await shortRun(armedFor(base, baseId + 'B'), seed, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok(`E1 ${baseId} s${seed} byte-identical`, da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }

  console.log('E4 armed+KILLDISC deterministic (SPLITKILL=1)');
  const savedSplit = process.env.SPLITKILL;
  process.env.SPLITKILL = '1';
  {
    const base = TF.leadfeast;
    const a = await shortRun(armedFor(base, 'leadfeastC'), 65413, 60);
    const b = await shortRun(armedFor(base, 'leadfeastD'), 65413, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok('E4 identical seeds -> identical digest', da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }
  if (savedSplit === undefined) delete process.env.SPLITKILL; else process.env.SPLITKILL = savedSplit;

  console.log('D2 180d armed run completes + deterministic re-run (SPLITKILL=1)');
  process.env.SPLITKILL = '1';
  {
    const base = TF.belongfeast;
    const a = await shortRun(armedFor(base, 'belongfeastE'), 65414, 180);
    const b = await shortRun(armedFor(base, 'belongfeastF'), 65414, 180);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok('D2 180d armed completes', !!a.result && !!b.result);
    ok('D2 180d armed deterministic re-run', da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }
  if (savedSplit === undefined) delete process.env.SPLITKILL; else process.env.SPLITKILL = savedSplit;

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FAIL:', e && e.stack || e); process.exit(1); });
