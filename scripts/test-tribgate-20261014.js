#!/usr/bin/env node
// scripts/test-tribgate-20261014.js — proof for the tribute fragility gate
// (loop B ARM 3, 2026-10-14, sim-findings #200).
//
// RED (TRIBGATE unset): gate-off the layer is byte-identical to the base
// policy — tribVerb returns 'off', ctx untouched, wrapper daily produces
// identical state to the parent's daily on identical fixtures.
// GREEN (TRIBGATE=1): fixture with fresh-days ~3.75 -> early-in-full HELD
// (tgHeld), scheduled payment still pays via the base discipline;
// fixture with fresh-days ~6.25 -> early-in-full fires (tgEarly, full week
// current) and the base discipline does NOT double-pay.
// Green on >=3 seeds before the sweep.
'use strict';
const SEED = parseInt(process.env.SEED || '11', 10);
const ARMED = process.env.TRIBGATE === '1';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { failed++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

async function tribFixture(seed, freshDaysTarget) {
  const { Game } = await loadGame({ seed, mode: 'tribgate-proof' });
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
  const { triblead, tribbelong, gateOn, tribVerb } = require('./policies/tribgate');
  const { belongseek } = require('./policies/belongseek');
  const week = Math.floor(30 / 7); // 4

  if (!ARMED) {
    console.log(`== tribgate RED proof (gate off, seed ${SEED}) ==`);
    await quietLog(async () => {
      // R1: gate off -> verb returns 'off', ctx untouched
      const { Game } = await tribFixture(SEED, 6.25);
      const ctx = {};
      const verdict = tribVerb(Game, ctx);
      check('R1 verb off gate-off', verdict === 'off', 'verdict=' + verdict);
      check('R1 ctx untouched', ctx.tgEarly === undefined && ctx.tgHeld === undefined,
        JSON.stringify({ tgEarly: ctx.tgEarly, tgHeld: ctx.tgHeld }));
      check('R1 gateOn() false', gateOn() === false);

      // R2: wrapper daily byte-identical to base daily on identical fixtures
      const a = await tribFixture(SEED, 6.25);
      const b = await tribFixture(SEED, 6.25);
      const ca = {}, cb = {};
      tribbelong.daily(a.Game, ca);
      belongseek.daily(b.Game, cb);
      check('R2 wrapper daily byte-identical to base daily',
        stateHash(a.Game) === stateHash(b.Game),
        'hash=' + stateHash(a.Game).slice(0, 60));
      check('R2 no layer counters gate-off', ca.tgEarly === undefined && ca.tgHeld === undefined);
      check('R2 no early verb fires gate-off (nothing paid early by layer)',
        linkOf(a.Game).tributePaidWeek === linkOf(b.Game).tributePaidWeek);
    });
  } else {
    console.log(`== tribgate GREEN proof (armed, seed ${SEED}) ==`);
    await quietLog(async () => {
      // G1: fragile pantry (~3.75 fresh-days) -> early-in-full HELD
      const f1 = await tribFixture(SEED, 3.75);
      const ctx1 = {};
      tribbelong.daily(f1.Game, ctx1);
      const l1 = linkOf(f1.Game);
      check('G1 fragile fixture fresh-days < 4', freshDays(f1.Game) < 4,
        'fresh-days=' + freshDays(f1.Game).toFixed(2));
      check('G1 early-in-full held', ctx1.tgHeld === 1, 'tgHeld=' + ctx1.tgHeld);
      check('G1 no early payment', ctx1.tgEarly === undefined,
        'tgEarly=' + ctx1.tgEarly);
      // the base discipline's scheduled payment still pays on its timing
      check('G1 scheduled payment still paid', l1.tributePaidWeek === week,
        'tributePaidWeek=' + l1.tributePaidWeek + ' week=' + week);
      check('G1 base discipline paid (belongTribute=1)', ctx1.belongTribute === 1,
        'belongTribute=' + ctx1.belongTribute);
      const holdLine = f1.said.find(s => /too thin to pull tribute forward/.test(s));
      check('G1 hold beat is honest (says the grain stays)', !!holdLine);

      // G2: deep pantry (~6.25 fresh-days) -> early-in-full fires
      const f2 = await tribFixture(SEED, 6.25);
      const ctx2 = {};
      tribbelong.daily(f2.Game, ctx2);
      const l2 = linkOf(f2.Game);
      check('G2 deep fixture fresh-days >= 4', freshDays(f2.Game) >= 4,
        'fresh-days=' + freshDays(f2.Game).toFixed(2));
      check('G2 early-in-full fired', ctx2.tgEarly === 1, 'tgEarly=' + ctx2.tgEarly);
      check('G2 full week paid', (l2.tributePaidKcal || 0) >= 6000 && l2.tributePaidWeek === week,
        `paid=${l2.tributePaidKcal} week=${l2.tributePaidWeek}`);
      check('G2 base discipline did not double-pay', ctx2.belongTribute === undefined,
        'belongTribute=' + ctx2.belongTribute);

      // G3: determinism — same fixture, same verdicts/counters
      const f3 = await tribFixture(SEED, 6.25);
      const ctx3 = {};
      tribbelong.daily(f3.Game, ctx3);
      check('G3 deterministic rerun', ctx3.tgEarly === ctx2.tgEarly &&
        stateHash(f3.Game) === stateHash(f2.Game));
    });
  }
  console.log(`\n${failed ? 'PROOF FAILED' : 'PROOF GREEN'} (${passed} pass, ${failed} fail)`);
  if (failed) process.exit(1);
}

if (require.main === module) main().catch(e => { console.error('FATAL', e); process.exit(1); });
