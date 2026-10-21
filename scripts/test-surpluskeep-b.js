#!/usr/bin/env node
// test-surpluskeep-b.js — proof for the sim-surpluskeep-diag-b diagnostic.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-surpluskeep-b.js
//   (SURPLUSFEED may be unset or '1' in the shell — the script sets it per
//   sub-proof. SEATDRIVE=0 explicit. Read the Usage header BEFORE running
//   any proof (ENV TRAP rule: FEASTSCALE_R13=1 is REQUIRED).)
//
// RED:    pristine runs write no upkeep-instrument state on Game.
// GREEN:  2 proof seeds x 100d ARMED instrumented: dawn per-link snapshots
//         sampled (int fields trust/arrears/tpw/tdw/lkd/status);
//         payTribute/tendLink events carry day/other/paid/pantryBefore with
//         pantryBefore >= paid (engine honesty: never pays more than held);
//         breakLink wrap honest on a constructed case (engine's post-break
//         state read back exactly); national sat/lost edges + per-link
//         snapshots honest on constructed dawnUpkeepSensor cases;
//         dissolution say-lines captured by the fixed regex on constructed
//         says (positive + negative).
// ENGAGE: 2 proof seeds x 60d ARMED: trim telemetry fires (trimKcal > 0).
// DET:    40d x 2 proof seeds, instrumented-vs-pristine ARMED: canonical
//         state projection (parent canon + hierarchy-link extension, link.id
//         EXCLUDED as unstable) byte-identical — all new wraps (breakLink,
//         payTribute, tendLink, sleep, surplusFeedGovernor) are RNG-clean.
// REPEAT: same armed seed twice in-process byte-identical (link-id-free
//         projection of the instrument rows).
// RED-EQUIV (same-commit, SURPLUSFEED unset): instrumented vs pristine
//         outcome fields on identical seeds — the upkeep instrument adds
//         zero drift to the paired substrate.
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { attachProbe, dayOf } = require('./probe-glut-instruments');
const { attachStandingProbe } = require('./probe-standnational-instruments');
const { attachUpkeepProbe, dawnUpkeepSensor, pantryKcal } = require('./upkeep-instruments-surpluskeep-b');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED && process.env.SURPLUSFEED !== '1') {
  console.error('FATAL: SURPLUSFEED must be unset or exactly "1" (see Usage header)');
  process.exit(2);
}

// canonical projection: the parent's canon PLUS the hierarchy-link
// extension (sorted by other+kind; link.id EXCLUDED — Date.now()+R()).
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

// the sfeed governor sensor (same as the driver)
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
  const W = attachProbe(Game);
  const S = attachStandingProbe(Game);
  const K = attachUpkeepProbe(Game);
  const sf = attachSfeed(Game);
  return { W, S, K, sf };
}

async function run(seed, days, policy, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'skeep-test', fullTelemetry: false });
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

  console.log('RED: pristine runs carry no upkeep-instrument state');
  for (const env of ['1', undefined]) {
    if (env) process.env.SURPLUSFEED = env; else delete process.env.SURPLUSFEED;
    const { Game } = await run(8821, 25, leadfeast, false);
    ok(`no instrument state when uninstrumented (SURPLUSFEED=${env || 'unset'})`, !Game._upkeepProbe);
  }

  console.log('GREEN: instrumented ARMED runs sample links + attribute upkeep');
  process.env.SURPLUSFEED = '1';
  // 8821/leadfeast exercises the tendLink path (LEAD road); 8822/belongfeast
  // exercises the payTribute path (BELONG road)
  for (const [seed, policy] of [[8821, leadfeast], [8822, belongfeast]]) {
    const { Game, inst } = await run(seed, 100, policy, true);
    const K = inst.K;
    ok(`seed ${seed}: dawn per-link snapshots sampled`, K.links.length > 0, K.links.length);
    const intOk = K.links.every(l =>
      Number.isInteger(l.d) && Number.isInteger(l.trust) && Number.isInteger(l.arr) &&
      Number.isInteger(l.tpw) && Number.isInteger(l.tdw) && Number.isInteger(l.lkd) &&
      (l.st === 0 || l.st === 1) && (l.dir === 0 || l.dir === 1 || l.dir === 2) &&
      typeof l.other === 'string');
    ok(`seed ${seed}: link snapshot fields int-typed`, intOk);
    const evs = K.tributeEvents.concat(K.tendEvents);
    ok(`seed ${seed}: tribute/tend events recorded`, evs.length > 0, evs.length);
    const wf = evs.every(e => Number.isInteger(e.d) && typeof e.other === 'string' &&
      Number.isInteger(e.paid) && Number.isInteger(e.pantryBefore));
    ok(`seed ${seed}: upkeep events well-formed (day/other/paid/pantryBefore)`, wf);
    const hon = evs.every(e => e.pantryBefore >= e.paid);
    ok(`seed ${seed}: upkeep honesty (pantryBefore >= paid, never pays more than held)`, hon);
  }

  console.log('GREEN: breakLink attribution honest on a constructed case');
  {
    process.env.SURPLUSFEED = '1';
    const { Game } = await loadGame({ seed: 8825, mode: 'skeep-construct', fullTelemetry: false });
    await setupGame(Game);
    const K = attachUpkeepProbe(Game);
    const d0 = dayOf(Game);
    const link = {
      id: 'test-link-b1', status: 'active', kind: 'vassal',
      subordinate: 'village_test', primary: 'haven',
      trust: 10, arrears: 500, lastKeptDay: -20, tributePaidWeek: -1,
      day: -30, tributeKcalPerWeek: 4000,
    };
    Game.hierarchyState().push(link);
    const r = Game.breakLink('test-link-b1', 'succession');
    ok('constructed breakLink returns truthy', !!r);
    const b = K.breaks[K.breaks.length - 1];
    ok('break recorded with how=succession', b && b.how === 'succession', b && b.how);
    ok('break trust reads the engine post-break state (10)', b && b.trust === 10, b && b.trust);
    ok('break arrears reads the engine post-break state (500)', b && b.arrears === 500, b && b.arrears);
    ok('break keptDays mirrors _linkNeglected math', b && b.keptDays === d0 + 20, b && b.keptDays);
  }

  console.log('GREEN: national sat/lost edges + link snapshots on constructed sensor cases');
  {
    const { Game } = await loadGame({ seed: 8826, mode: 'skeep-construct', fullTelemetry: false });
    await setupGame(Game);
    const K = attachUpkeepProbe(Game);
    Game.state.nationalLive = true; Game.state.nationalShape = 'lead'; Game.state.nationalDay = 77;
    dawnUpkeepSensor(Game, K);
    ok('sat edge recorded on false->true', K.natEvents.some(e => e.kind === 'sat' && e.natDay === 77));
    Game.state.nationalLive = false;
    Game.hierarchyState().push({
      id: 'test-link-b2', status: 'active', kind: 'vassal',
      subordinate: 'village_x', primary: 'haven',
      trust: 35, arrears: 1200, lastKeptDay: 60, tributePaidWeek: 8,
      tendedWeek: 9, day: 10, tributeKcalPerWeek: 4000,
    });
    dawnUpkeepSensor(Game, K);
    const lost = K.natEvents.find(e => e.kind === 'lost');
    ok('lost edge recorded on true->false', !!lost);
    ok('lost edge carries the polity sub snapshot', lost && lost.subs.length === 1 && lost.subs[0].trust === 35, JSON.stringify(lost && lost.subs));
    const row = K.links.find(l => l.other === 'village_x');
    ok('dawn snapshot carries the constructed link ints', row && row.trust === 35 && row.arr === 1200 && row.tpw === 8 && row.tdw === 9 && row.dir === 1,
      row && JSON.stringify([row.trust, row.arr, row.tpw, row.tdw, row.dir]));
  }

  console.log('GREEN: dissolution say-lines captured by the fixed regex');
  {
    const { Game } = await loadGame({ seed: 8827, mode: 'skeep-construct', fullTelemetry: false });
    await setupGame(Game);
    const K = attachUpkeepProbe(Game);
    Game.say('◈ The realm came apart — no polity answers to Haven now, and Haven is a free fire again.');
    Game.say('Just a normal line about the weather.');
    ok('dissolution line captured', K.dissolveLines.length === 1, K.dissolveLines.length);
    ok('non-dissolution line ignored', K.dissolveLines.every(x => /realm came apart/.test(x.line)));
  }

  console.log('ENGAGE: trim telemetry fires on glut days (armed)');
  process.env.SURPLUSFEED = '1';
  for (const seed of [8821, 8822]) {
    const { inst } = await run(seed, 60, leadfeast, true);
    ok(`seed ${seed}: trimKcal > 0`, inst.sf.trimKcal > 0, Math.round(inst.sf.trimKcal));
  }

  console.log('DET: instrumented vs pristine ARMED byte-identical (40d x 2 seeds, link-extended canon)');
  process.env.SURPLUSFEED = '1';
  for (const seed of [8823, 8824]) {
    const a = await run(seed, 40, leadfeast, true);
    const b = await run(seed, 40, leadfeast, false);
    const ca = canon(a.Game), cb = canon(b.Game);
    ok(`seed ${seed}: canonical projection byte-identical`, ca === cb,
      ca === cb ? undefined : `len ${ca.length}/${cb.length} head-diff at ${firstDiff(ca, cb)}`);
  }

  console.log('REPEAT: same armed seed twice in-process byte-identical');
  {
    const rowOf = async () => {
      const { Game, inst } = await run(8823, 40, belongfeast, true);
      // link-id-free projection of the instrument rows
      return JSON.stringify({
        trib: inst.K.tributeEvents, tend: inst.K.tendEvents,
        brk: inst.K.breaks, nat: inst.K.natEvents,
        lnk: inst.K.links, dis: inst.K.dissolveLines,
        trim: Math.round(inst.sf.trimKcal),
      });
    };
    const r1 = await rowOf(), r2 = await rowOf();
    ok('repeat byte-identical', r1 === r2, r1 === r2 ? undefined : `len ${r1.length}/${r2.length}`);
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
