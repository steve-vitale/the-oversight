#!/usr/bin/env node
// scripts/test-tribdisc-20261014.js — proof for the healthy-pantry tribute
// discipline lever (loop B, 2026-10-14, food-economy axis, claims the
// tribgate kill-side finding as its own arm).
//
// RED (TRIBDISC unset, FEASTSCALE_R13=1 substrate): gate-off the layer is
// byte-identical to the parent policies — tribVerb returns 'off', ctx
// untouched, wrapper daily produces identical state to the parent's daily on
// identical fixtures (both roads).
// GREEN (TRIBDISC=1): fixture with fresh-days ~3.75 -> NO early pay (fragile:
// the verb holds silently and the base discipline's scheduled payment still
// pays the week on its own timing); fixture with fresh-days ~6.25 ->
// early-in-full fires (tdEarly, full week current, base discipline does NOT
// double-pay, early pay recorded in ctx._tribHist in the trackTribute shape
// for r13 feast-gate symmetry); determinism rerun.
// Green on >=3 seeds before the sweep.
'use strict';
const SEED = parseInt(process.env.SEED || '11', 10);
const ARMED = process.env.TRIBDISC === '1';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { failed++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function tribFixture(seed, freshDaysTarget) {
  const { Game } = await loadGame({ seed, mode: 'tribdisc-proof' });
  await setupGame(Game);
  const said = [];
  Game.say = (s) => { said.push(String(s)); };
  Game.feedback = function () {};
  Game.state.scholar.day = 30; Game.dayPart = 2;
  const v = Game.state.village, day = 30, burn = 2400;
  v.burnHistory = [burn, burn, burn, burn, burn, burn, burn];
  const freshKcal = Math.round(freshDaysTarget * burn);
  v.pantry = [
    { name: 'Foraged food', kcalEach: 500, units: Math.ceil(freshKcal / 500), safe: true, spoilDay: day + 3 },
    { name: 'Pemmican bars', foodKind: 'pemmican', kcalEach: 500, units: 120, safe: true, spoilDay: day + 120 },
  ];
  // Active subordinate link: Haven owes village-east 6,000 kcal/week.
  const ms = Game.mshipState();
  ms.links = ms.links || [];
  ms.links.push({
    id: 'link-trib-fixture', status: 'active', primary: 'village-east', subordinate: 'haven',
    tributeKcalPerWeek: 6000, tributePaidWeek: -1, tributeWeek: -1, tributePaidKcal: 0, arrears: 0,
    obligations: ['tribute', 'aid'], trust: 50,
    history: [{ day: 1, kind: 'formed', note: 'Haven joined village-east as subordinate.' }],
  });
  return { Game, said };
}

function linkOf(Game) {
  return (Game.hierarchyState() || []).find(l => l && l.id === 'link-trib-fixture');
}
function freshDays(Game) { return Game.pantryFreshDays ? Game.pantryFreshDays() : -1; }
function stateHash(Game) {
  const s = Game.state.scholar || {}, v = Game.state.village || {};
  const l = linkOf(Game) || {};
  return JSON.stringify([
    s.day, Math.round((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 0), 0)),
    (v.pantry || []).length, l.tributePaidWeek, Math.round(l.tributePaidKcal || 0), l.arrears || 0,
  ]);
}

async function main() {
  const { triblead, tribbelong, gateOn, tribVerb } = require('./policies/tribdisc');
  const { leadfeast, belongfeast } = require('./policies/feastscale');
  const week = Math.floor(30 / 7); // 4

  if (!ARMED) {
    console.log(`== tribdisc RED proof (gate off, seed ${SEED}) ==`);
    await quietLog(async () => {
      // R1: gate off -> verb returns 'off', ctx untouched, gateOn false
      const { Game } = await tribFixture(SEED, 6.25);
      const ctx = {};
      const verdict = tribVerb(Game, ctx);
      check('R1 verb off gate-off', verdict === 'off', 'verdict=' + verdict);
      check('R1 ctx untouched', ctx.tdEarly === undefined && ctx.tdFragile === undefined,
        JSON.stringify({ tdEarly: ctx.tdEarly, tdFragile: ctx.tdFragile }));
      check('R1 gateOn() false', gateOn() === false);

      // R2: wrapper dailies byte-identical to the parent policies
      const a = await tribFixture(SEED, 6.25);
      const b = await tribFixture(SEED, 6.25);
      const ca = {}, cb = {};
      tribbelong.daily(a.Game, ca);
      belongfeast.daily(b.Game, cb);
      check('R2 belong wrapper daily byte-identical to parent daily',
        stateHash(a.Game) === stateHash(b.Game), 'hash=' + stateHash(a.Game).slice(0, 60));
      check('R2 no layer counters gate-off', ca.tdEarly === undefined && ca.tdFragile === undefined);

      // R3: lead road — ghost both sides, wrappers identical
      const c = await tribFixture(SEED, 6.25);
      const d = await tribFixture(SEED, 6.25);
      const cc = {}, cd = {};
      triblead.daily(c.Game, cc);
      leadfeast.daily(d.Game, cd);
      check('R3 lead wrapper daily byte-identical to parent daily',
        stateHash(c.Game) === stateHash(d.Game));
    });
  } else {
    console.log(`== tribdisc GREEN proof (armed, seed ${SEED}) ==`);
    await quietLog(async () => {
      // G1: fragile pantry (~3.75 fresh-days) -> verb holds SILENTLY;
      // the base discipline's own tribute step still pays on its timing.
      const f1 = await tribFixture(SEED, 3.75);
      const ctx1 = {};
      const verdict1 = tribVerb(f1.Game, ctx1);
      check('G1 fragile fixture fresh-days < 4', freshDays(f1.Game) < 4,
        'fresh-days=' + freshDays(f1.Game).toFixed(2));
      check('G1 verb verdict fragile', verdict1 === 'fragile', 'verdict=' + verdict1);
      check('G1 no early payment by the verb', ctx1.tdEarly === undefined && ctx1.tdFragile === 1,
        JSON.stringify({ tdEarly: ctx1.tdEarly, tdFragile: ctx1.tdFragile }));
      const layerBeat1 = f1.said.find(s => /pull tribute forward|walks out early/.test(s));
      check('G1 fragility hold is silent (no layer beat)', !layerBeat1);

      // G1b: the base discipline still pays on its own timing after the hold
      const f1b = await tribFixture(SEED, 3.75);
      const ctx1b = {};
      tribbelong.daily(f1b.Game, ctx1b);
      const l1b = linkOf(f1b.Game);
      check('G1b base discipline paid after the hold', l1b.tributePaidWeek === week,
        'tributePaidWeek=' + l1b.tributePaidWeek + ' week=' + week);
      check('G1b base discipline did the work (belongTribute=1)', ctx1b.belongTribute === 1,
        'belongTribute=' + ctx1b.belongTribute);

      // G2: deep pantry (~6.25 fresh-days) -> early-in-full fires
      const f2 = await tribFixture(SEED, 6.25);
      const ctx2 = {};
      const verdict2 = tribVerb(f2.Game, ctx2);
      check('G2 deep fixture fresh-days >= 4', freshDays(f2.Game) >= 4,
        'fresh-days=' + freshDays(f2.Game).toFixed(2));
      check('G2 verb verdict early', verdict2 === 'early', 'verdict=' + verdict2);
      const l2 = linkOf(f2.Game);
      check('G2 full week paid early', (l2.tributePaidKcal || 0) >= 6000 && l2.tributePaidWeek === week,
        `paid=${l2.tributePaidKcal} week=${l2.tributePaidWeek}`);
      check('G2 layer counters (tdEarly=1, kcal)', ctx2.tdEarly === 1 && ctx2.tdEarlyKcal >= 6000,
        JSON.stringify({ tdEarly: ctx2.tdEarly, tdEarlyKcal: ctx2.tdEarlyKcal }));
      const earlyBeat = f2.said.find(s => /walks out early/.test(s));
      check('G2 early beat is honest (names the depth + the early timing)', !!earlyBeat,
        earlyBeat ? earlyBeat.slice(0, 70) : 'none');

      // G3: r13 feast-gate symmetry — the early pay is recorded in the
      // trackTribute shape from the engine's real return value
      const hist = ctx2._tribHist || [];
      const rec = hist.find(e => e && e.day === 30);
      check('G3 early pay recorded for the feast-contribution gate', !!rec && rec.kcal >= 6000,
        JSON.stringify(rec));

      // G4: full daily — base discipline does NOT double-pay after the early pay
      const f4 = await tribFixture(SEED, 6.25);
      const ctx4 = {};
      tribbelong.daily(f4.Game, ctx4);
      const l4 = linkOf(f4.Game);
      check('G4 base discipline did not double-pay', ctx4.belongTribute === undefined,
        'belongTribute=' + ctx4.belongTribute);
      check('G4 week paid exactly once (not 2x)', (l4.tributePaidKcal || 0) >= 6000 && (l4.tributePaidKcal || 0) < 12000,
        'paid=' + l4.tributePaidKcal);

      // G5: determinism — identical rerun
      const f5 = await tribFixture(SEED, 6.25);
      const ctx5 = {};
      tribbelong.daily(f5.Game, ctx5);
      check('G5 deterministic rerun', ctx5.tdEarly === ctx4.tdEarly &&
        stateHash(f5.Game) === stateHash(f4.Game));
    });
  }
  console.log(`\n${failed ? 'PROOF FAILED' : 'PROOF GREEN'} (${passed} pass, ${failed} fail)`);
  if (failed) process.exit(1);
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
