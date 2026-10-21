#!/usr/bin/env node
// test-surpluskeep2-b.js — proof for the sim-surpluskeep2-b diagnostic.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-surpluskeep2-b.js
//   (SURPLUSFEED may be unset or '1' in the shell — the script sets it per
//   sub-proof. SEATDRIVE=0 explicit. Read the Usage header BEFORE running
//   any proof (ENV TRAP rule: FEASTSCALE_R13=1 is REQUIRED).)
//
// RED:    pristine runs write no gate/upkeep instrument state on Game.
// GREEN:  (a) gate sensor records a daily dawn pantry series on an
//         instrumented ARMED run (ints, non-negative, one entry per dawn);
//         (b) the PURE gate-crossing detector passes synthetic units
//         (downward crossings, edge at exactly 20000, gaps never
//         interpolated, recrossings); (c) the 8802 leadfeast exemplar
//         end-to-end on current master: every detected crossing straddles
//         the gate in the weekly series (detector honesty on real data),
//         trust trajectories extract, paired control computable — and the
//         run REPORTS whether the parent's full chain reproduces.
// DET:    40d x 2 proof seeds, instrumented-vs-pristine ARMED: canonical
//         state projection (parent canon + hierarchy-link extension,
//         link.id EXCLUDED as unstable) byte-identical — all new wraps
//         (upkeep probe's breakLink/payTribute/tendLink/sleep/say, the gate
//         sensor's sleep, surplusFeedGovernor) are RNG-clean.
// REPEAT: same armed seed twice in-process byte-identical (instrument rows
//         INCLUDING the gate pantryDaily series).
// RED-EQUIV (same-commit, SURPLUSFEED unset): instrumented vs pristine
//         outcome fields on identical seeds — the gate instrument adds zero
//         drift to the paired substrate.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const {
  attachUpkeepProbe, attachGateSensor, dayOf, pantryKcal,
  weeklyPantry, detectGateCrossings, detectRecrossings, TEND_GATE_KCAL,
} = require('./surpluskeep2-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED && process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: SURPLUSFEED must be unset or exactly "1" (see Usage header)');
  process.exit(2);
}

// canonical projection: the parent's canon (pantry/roster/scholar/links/nat),
// link.id EXCLUDED — Date.now()+R().
function canon(Game) {
  const items = (((Game.state || {}).village || {}).pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (((Game.state || {}).village || {}).roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  const st = Game.state || {};
  let links = [];
  try {
    const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (const l of ls) {
      if (!l) continue;
      const other = (l.kind === 'covenant' || l.kind === 'trade')
        ? (l.a === 'haven' ? l.b : l.a)
        : (l.subordinate === 'haven' ? l.primary : l.subordinate);
      links.push([String(other || '?'), l.kind || 'vassal', l.status || '?',
        l.trust | 0, Math.round(l.arrears || 0), Math.round(l.tributeKcalPerWeek || 0),
        (l.tributePaidWeek == null ? -1 : l.tributePaidWeek) | 0,
        (l.tendedWeek == null ? -1 : l.tendedWeek) | 0,
        (l.lastKeptDay == null ? -1 : l.lastKeptDay) | 0,
        (l.day == null ? -1 : l.day) | 0].join('|'));
    }
  } catch (e) {}
  links.sort();
  return JSON.stringify({
    d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0),
    lk: links.join(';'), nat: st.nationalLive ? 1 : 0, natDay: st.nationalDay || 0,
  });
}

// the sfeed governor sensor (parent pattern)
function attachSfeed(Game) {
  const sf = { govCalls: 0, trimCalls: 0, trimKcal: 0 };
  const o = Game.surplusFeedGovernor;
  if (typeof o === 'function') Game.surplusFeedGovernor = function (v, give) {
    const r = o.apply(this, arguments);
    try { sf.govCalls++; if (r < give) { sf.trimCalls++; sf.trimKcal += (give - r); } } catch (e) {}
    return r;
  };
  return sf;
}

function attachAll(Game) {
  const K = attachUpkeepProbe(Game);
  const G = attachGateSensor(Game);
  const sf = attachSfeed(Game);
  return { K, G, sf };
}

async function run(seed, days, policy, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'skeep2-test', fullTelemetry: false });
  await setupGame(Game);
  let inst = null;
  if (instrumented) inst = attachAll(Game);
  const result = await runDays(Game, policy, { days, manifest: null });
  return { Game, inst, result };
}

function outcomeFields(Game, result) {
  const st = Game.state || {};
  return {
    won: !!Game.won, national: !!st.nationalLive, nationalDay: st.nationalDay || 0,
    nationalShape: st.nationalShape || '', table: !!(Game.progState && Game.progState().tableWaiting),
    rank: Game.scaleRank ? Game.scaleRank() : '?', maxWave: Game.unlockedWave ? Game.unlockedWave() : 1,
    days: result.days, endReason: result.endReason,
  };
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : extra === 0 ? ' — 0' : '')); }
  };

  console.log('RED: pristine runs carry no gate/upkeep instrument state');
  for (const env of ['1', undefined]) {
    if (env) process.env.SURPLUSFEED = env; else delete process.env.SURPLUSFEED;
    const { Game } = await run(8831, 25, leadfeast, false);
    ok(`no instrument state when uninstrumented (SURPLUSFEED=${env || 'unset'})`,
      !Game._upkeepProbe && !Game._gateSensor);
  }

  console.log('GREEN: gate sensor records a daily dawn pantry series (armed)');
  process.env.SURPLUSFEED = '1';
  {
    const { Game, inst, result } = await run(8832, 60, leadfeast, true);
    const pd = inst.G.pantryDaily;
    ok('pantryDaily non-empty', pd.length > 0, pd.length);
    ok('one entry per dawn (days match)', pd.length === result.days, `${pd.length}/${result.days}`);
    ok('entries are [int day, int kcal]', pd.every(([d, k]) => Number.isInteger(d) && Number.isInteger(k)));
    ok('kcal non-negative', pd.every(([, k]) => k >= 0));
    ok('days non-decreasing (sleep may fire twice on one game day)', pd.every(([d], i) => i === 0 || d >= pd[i - 1][0]));
    void Game;
  }

  console.log('GREEN: pure gate-crossing detector — synthetic units');
  {
    // weeklyPantry: dawn-of-week downsampling
    const w = weeklyPantry([[0, 25000], [1, 24000], [7, 21000], [8, 20500], [14, 19000]]);
    ok('weeklyPantry downsamples to week starts', JSON.stringify(w) === JSON.stringify([25000, 21000, 19000]), JSON.stringify(w));
    // duplicate dawn readings on one game day: first wins, deterministic
    const wd = weeklyPantry([[6, 24850], [6, 24850], [7, 21000]]);
    ok('weeklyPantry tolerates duplicate-day dawns', wd[0] === 24850 && wd[1] === 21000, JSON.stringify(wd));
    // downward crossing
    const c1 = detectGateCrossings([25000, 21000, 19000, 18000]);
    ok('downward crossing detected at the right week', c1.length === 1 && c1[0].week === 2 && c1[0].beforeKcal === 21000 && c1[0].afterKcal === 19000, JSON.stringify(c1));
    // never above -> no event
    ok('no event when always below', detectGateCrossings([19000, 18000, 17000]).length === 0);
    // always above -> no event
    ok('no event when always above', detectGateCrossings([25000, 26000, 27000]).length === 0);
    // two crossings
    const c2 = detectGateCrossings([25000, 19000, 21000, 18000]);
    ok('two crossings detected', c2.length === 2 && c2[0].week === 1 && c2[1].week === 3, JSON.stringify(c2.map(e => e.week)));
    // edge: exactly at the gate counts as below (policy needs STRICTLY > 20000)
    const c3 = detectGateCrossings([20001, 20000]);
    ok('20001->20000 is a crossing (gate is strict >)', c3.length === 1, JSON.stringify(c3));
    ok('20000->20001 is NOT a downward crossing', detectGateCrossings([20000, 20001]).length === 0);
    // gaps are never interpolated across
    ok('gap weeks never interpolated', detectGateCrossings([25000, undefined, 19000]).length === 0);
    // recrossings
    const r1 = detectRecrossings([19000, 21000, 19500]);
    ok('upward recrossing detected', r1.length === 1 && r1[0].week === 1 && r1[0].dir === 'up', JSON.stringify(r1));
    ok('recrossing not confused with crossing', detectGateCrossings([19000, 21000]).length === 0);
    ok('gate constant is 20000', TEND_GATE_KCAL === 20000);
  }

  console.log('GREEN: 8802 leadfeast exemplar end-to-end on current master');
  {
    process.env.SURPLUSFEED = '1';
    const { inst } = await run(8802, 180, leadfeast, true);
    const weekly = weeklyPantry(inst.G.pantryDaily);
    const crossings = detectGateCrossings(weekly);
    console.log(`  INFO 8802 armed: ${crossings.length} downward crossing(s): ` +
      crossings.map(c => `w${c.week} ${c.beforeKcal}->${c.afterKcal}`).join('; '));
    // detector honesty on real data: every detected crossing straddles the gate
    const honest = crossings.every(c => c.beforeKcal > TEND_GATE_KCAL && c.afterKcal <= TEND_GATE_KCAL);
    ok('every detected crossing straddles the 20k gate in the weekly series', honest);
    // trust trajectories extract for the first crossing (if any)
    if (crossings.length) {
      const { weeklyTrust } = require('./analyze-surpluskeep2-b.js');
      const w0 = crossings[0].week;
      const t = [];
      for (let k = 0; k <= 4; k++) t.push(weeklyTrust(inst.K.links, w0 + k, 1));
      console.log(`  INFO 8802 armed: 4w post-gate mean polity trust: ${t.map(v => v == null ? 'null' : v.toFixed(0)).join(' -> ')}`);
      ok('trust trajectory extracts (week-0 value present)', t[0] != null, JSON.stringify(t[0]));
    } else {
      console.log('  INFO 8802 armed: no gate crossing on current master — exemplar does not reproduce as a crossing; instrument correctly reports none');
      ok('no-crossing reported honestly (vacuous)', true);
    }
    // paired control computable
    delete process.env.SURPLUSFEED;
    const c = await run(8802, 180, leadfeast, true);
    ok('paired control run completes with gate series', c.inst.G.pantryDaily.length > 0, c.inst.G.pantryDaily.length);
    process.env.SURPLUSFEED = '1';
  }

  console.log('DET: instrumented vs pristine ARMED byte-identical (40d x 2 seeds)');
  process.env.SURPLUSFEED = '1';
  for (const seed of [8833, 8834]) {
    const a = await run(seed, 40, leadfeast, true);
    const b = await run(seed, 40, leadfeast, false);
    const ca = canon(a.Game), cb = canon(b.Game);
    ok(`seed ${seed}: canonical projection byte-identical`, ca === cb,
      ca === cb ? undefined : `len ${ca.length}/${cb.length} head-diff at ${firstDiff(ca, cb)}`);
  }

  console.log('REPEAT: same armed seed twice in-process byte-identical');
  {
    const rowOf = async () => {
      const { inst } = await run(8835, 40, belongfeast, true);
      return JSON.stringify({
        trib: inst.K.tributeEvents, tend: inst.K.tendEvents,
        brk: inst.K.breaks, nat: inst.K.natEvents,
        lnk: inst.K.links, dis: inst.K.dissolveLines,
        gate: inst.G.pantryDaily,
        trim: Math.round(inst.sf.trimKcal),
      });
    };
    const r1 = await rowOf(), r2 = await rowOf();
    ok('repeat byte-identical (incl. gate series)', r1 === r2, r1 === r2 ? undefined : `len ${r1.length}/${r2.length}`);
  }

  console.log('RED-EQUIV: instrumented vs pristine outcome fields, same-commit SURPLUSFEED unset');
  delete process.env.SURPLUSFEED;
  for (const seed of [8801, 8802]) {
    const a = await run(seed, 60, leadfeast, true);
    const b = await run(seed, 60, leadfeast, false);
    const fa = JSON.stringify(outcomeFields(a.Game, a.result));
    const fb = JSON.stringify(outcomeFields(b.Game, b.result));
    ok(`seed ${seed}: outcome fields identical`, fa === fb, fa === fb ? undefined : `${fa} vs ${fb}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });

function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return n;
}
