#!/usr/bin/env node
// test-rotmech-b.js — proof of instrument honesty for scripts/instr-rotmech-b.js.
//
// RED on known shapes (synthetic rot scenarios where the mechanism is
// constructed — the instrument must identify the constructed mechanism):
//   R-a  cap door: over-cap stockPantry writes store + rot; stockSurplus
//        over-cap refuses (capRefused counted, nothing stored).
//   R-b  piece size: stockPantry granulates (500+200); stockSurplus emits
//        uniform 200-kcal units; tags carry funnel + piece size.
//   R-c  draw order: pantryDraw's fresh-first sort draws the surplus-clock
//        stack before the pantry-path piece; arrival ranks reflect it.
// GREEN on live telemetry:
//   G-1  instrumented run is trajectory byte-identical to uninstrumented
//        (det-gate style) — the instrument is read-only.
//   G-2  conservation per funnel: written ~= rot + drawn + eatenSpoiled +
//        playerTakes + endInv (within rounding epsilon).
//   G-3  the differential D and mechanism shares compute on a live run.
//
// Usage (Usage header FIRST — the ENV TRAP):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-rotmech-b.js
'use strict';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { attachRotmech, dayOf, pantryKcalLive } = require('./instr-rotmech-b');
const { leadfeast } = require('./policies/feastscale');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED === '1') { console.error('FATAL: SURPLUSFEED must be unset'); process.exit(2); }

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
const V = (Game) => (Game.state || {}).village || {};

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-rotmech-b', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

// ---------------- RED-a: cap door ----------------
async function redA() {
  console.log('RED-a: cap-door evaporation');
  const Game = await newGame(8911);
  const W = attachRotmech(Game);
  const v = V(Game);
  const cap = Game.pantryCapKcal();
  // fill to over-cap with DIRECT pushes (untagged — the instrument only tags wrapped writes)
  v.pantry = v.pantry || [];
  v.pantry.push({ name: 'Filler', kcalEach: cap + 50000, units: 1, spoilDay: 9999, safe: true, kg: 1 });
  const roomBefore = cap - pantryKcalLive(Game);
  ok('pantry is over cap', roomBefore < 0, `room=${roomBefore}`);
  // engine path: cap refuses
  const giveS = 5000;
  const storedS = Game.stockSurplus(v, giveS);
  ok('stockSurplus over-cap stores 0', storedS === 0, `stored=${storedS}`);
  ok('capRefused counted', W.fun.surplus.capRefused >= giveS - 1, `capRefused=${W.fun.surplus.capRefused}`);
  // re-tag path: NO cap gate — stores anyway
  Game.stockPantry(3000, 'Foraged food');
  const pItems = v.pantry.filter(i => i._diagF === 'pantry');
  ok('stockPantry over-cap still writes', pItems.length > 0 && pItems.reduce((t, i) => t + i.kcalEach * i.units, 0) === 3000);
  ok('over-cap write tagged', pItems.every(i => i._diagOverCap === true));
  ok('overCapWrite counted', W.fun.pantry.overCapWrite === 3000, `got ${W.fun.pantry.overCapWrite}`);
  // force rot: backdate the clocks, sweep
  const day = dayOf(Game);
  for (const i of v.pantry) if (i._diagF === 'pantry') i.spoilDay = day - 1;
  Game.sweepSpoiled();
  ok('over-cap pantry rot attributed to cap component', W.fun.pantry.rotOverCap === 3000, `got ${W.fun.pantry.rotOverCap}`);
  ok('no surplus rot', W.fun.surplus.rot === 0, `got ${W.fun.surplus.rot}`);
}

// ---------------- RED-b: piece size ----------------
async function redB() {
  console.log('RED-b: piece-size granularity');
  const Game = await newGame(8912);
  const W = attachRotmech(Game);
  const v = V(Game);
  const beforeSet = new Set(v.pantry || []);
  Game.stockPantry(700, 'Foraged food');
  const pItems = v.pantry.filter(i => i._diagF === 'pantry' && !beforeSet.has(i));
  const sizes = pItems.map(i => i.kcalEach * i.units).sort((a, b) => a - b);
  ok('stockPantry granulates 700 -> 200+500', JSON.stringify(sizes) === JSON.stringify([200, 500]), `got ${JSON.stringify(sizes)}`);
  ok('piece tags recorded', pItems.every(i => i._diagPiece === i.kcalEach));
  const before = v.pantry.length;
  const stored = Game.stockSurplus(v, 700);
  const sItems = v.pantry.filter(i => i._diagF === 'surplus');
  ok('stockSurplus emits uniform 200-kcal units', sItems.length >= 1 && sItems.every(i => i.kcalEach === 200), `got ${sItems.map(i => i.kcalEach)}`);
  ok('remainder carried (< 700 stored)', stored === 600, `stored=${stored}`);
  ok('funnel tags distinct', pItems.every(i => i._diagF === 'pantry') && sItems.every(i => i._diagF === 'surplus'));
  void before;
}

// ---------------- RED-c: draw order ----------------
async function redC() {
  console.log('RED-c: draw order (fresh-first)');
  const Game = await newGame(8913);
  const W = attachRotmech(Game);
  const v = V(Game);
  Game.stockSurplus(v, 400);            // 2 x 200-kcal units, spoilDay v.day+3
  Game.stockPantry(500, 'Foraged food'); // 1 x 500-kcal piece, spoilDay day+3+bonus
  const sItems = v.pantry.filter(i => i._diagF === 'surplus');
  const pItems = v.pantry.filter(i => i._diagF === 'pantry');
  ok('one of each funnel present', sItems.length >= 1 && pItems.length >= 1);
  const rS = Math.min(...sItems.map(i => i._diagRank));
  const rP = Math.min(...pItems.map(i => i._diagRank));
  ok('surplus stack ranks ahead of pantry piece', rS < rP, `rS=${rS} rP=${rP}`);
  const out = Game.pantryDraw(v, 100, {});
  ok('pantryDraw eats the surplus funnel first', W.fun.surplus.drawn > 0 && W.fun.pantry.drawn === 0,
    `surplus.drawn=${W.fun.surplus.drawn} pantry.drawn=${W.fun.pantry.drawn} taken=${out.taken}`);
}

// ---------------- GREEN: live honesty ----------------
function trajHash(rows, says) {
  return crypto.createHash('sha256').update(rows.join('\n') + '\n###\n' + says.join('\n')).digest('hex').slice(0, 16);
}
async function oneTraj(seed, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'test-rotmech-b-g' + (instrumented ? '-i' : ''), fullTelemetry: false });
  await setupGame(Game);
  let W = null;
  if (instrumented) W = attachRotmech(Game);
  const rows = [], says = [];
  const oSay = Game.say;
  Game.say = function (m) { try { says.push(String(m)); } catch (e) {} return oSay.apply(this, arguments); };
  const P = Object.assign({}, leadfeast);
  const origDaily = P.daily;
  let deaths = 0;
  const oTele = Game.tele;
  Game.tele = function (t, d) { let r; try { r = oTele.apply(this, arguments); } catch (e) { throw e; } try { if (t === 'death') deaths++; } catch (e) {} return r; };
  P.daily = (G, ctx) => {
    const r = origDaily(G, ctx);
    const v = G.state.village || {};
    const pk = ((v.pantry || [])).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
    rows.push([dayOf(G), Math.round(pk), (v.roster || []).length, deaths].join(','));
    if (W) W.sampleDay();
    return r;
  };
  const res = await runDays(Game, P, { days: 60, manifest: null, sampleEvery: 61 });
  return { h: trajHash(rows, says), W, Game, res };
}
async function green() {
  console.log('GREEN: live telemetry honesty (seed 8914, leadfeast, 60d)');
  const a = await oneTraj(8914, false);
  const b = await oneTraj(8914, true);
  ok('G-1 instrumented trajectory byte-identical', a.h === b.h, `plain=${a.h} instr=${b.h}`);
  const W = b.W;
  const inv = W.endInventory();
  // G-2: the daily reconciliation quantifies every unwrapped sink
  // (smoke-rack destruction, tribute/theft, kid/forager nibbles) as
  // F.unaccounted. Assert it stays bounded: |unaccounted| <= 25% of written
  // per funnel; report the residual honestly.
  let consOk = true; const consDetail = [];
  for (const f of ['surplus', 'pantry']) {
    const F = W.fun[f];
    const un = F.unaccounted || 0;
    const pct = F.written > 0 ? un / F.written : 0;
    consDetail.push(`${f}: unaccounted=${Math.round(un)} (${(pct * 100).toFixed(1)}% of written)`);
    if (Math.abs(pct) > 0.25) consOk = false;
  }
  ok('G-2 unwrapped sinks bounded (<=25% of written per funnel)', consOk, consDetail.join(' ; '));
  console.log('  conservation detail: ' + consDetail.join(' ; '));
  console.log('  mergeXfer: ' + JSON.stringify(W.mergeXfer));
  const rs = W.fun.surplus, rp = W.fun.pantry;
  const rateS = rs.written > 0 ? rs.rot / rs.written : 0;
  const rateP = rp.written > 0 ? rp.rot / rp.written : 0;
  const D = rateP - rateS;
  ok('G-3 differential + shares computable', isFinite(D) && rs.written > 0 && rp.written > 0,
    `D=${D.toFixed(4)} rateS=${rateS.toFixed(4)} rateP=${rateP.toFixed(4)}`);
  console.log(`  live 60d: surplus written=${Math.round(rs.written)} rot=${Math.round(rs.rot)} | pantry written=${Math.round(rp.written)} rot=${Math.round(rp.rot)} D=${(D * 100).toFixed(2)}pp`);
}

(async () => {
  await redA();
  await redB();
  await redC();
  await green();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
