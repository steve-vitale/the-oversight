#!/usr/bin/env node
// test-spikechar-b.js — proof fixtures for the intra-day glut-spike
// characterization (arm sim-spikechar-b, run fleshout-loop-b-20261019T0317Z).
//
// The characterization rests on four instrument claims:
//   T1. determinism: same seed, same env (armed), twice -> govLog (full
//       precision) + hunger censuses byte-identical.
//   T2. classification: every trim lands in exactly one of
//       {spike, glut, unknownDawn, leanWindow}; leanWindow = 0;
//       spike > 0 (mechanism visible); unclassified = 0. dawnFd < 0 is
//       "no dawn sample", NEVER spike (leanclass's -1<=4 vacuity fixed).
//   T3. ordering: every gov call labeled day D precedes the dayEnded=D
//       POST-sleep census (trimSeq < censusSeq). Game.sleep() runs catch-up
//       villagerMealDay calls (proven by event probe), so the pre-sleep
//       census does NOT post-date in-sleep trims — the post-sleep one does.
//   T4. comparability: the PRE-sleep census mild-day set is a superset of
//       the pilot's policy.daily starveDays (same >70 band; the pacing
//       tick-burn sits between the two samples so hunger only rises),
//       at <=3x the count.
// A miss on any fixture is instrument NO-GO (loud), never a lever verdict.
//
// Seeds 6401/6402 (pilot range) keep the census seeds 6611-6618 strictly fresh.
'use strict';
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';
process.env.SURPLUSFEED = '1';
const crypto = require('crypto');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

let failures = 0;
function ok(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}

function classify(t) {
  // t: {trim, fireFd, dawnFd} full precision. Returns the class.
  if (!t.trim) return 'no-trim';
  if (!(t.fireFd > 4)) return 'leanWindow';
  if (!(t.dawnFd >= 0)) return 'unknownDawn';
  if (t.dawnFd <= 4) return 'spike';
  return 'glut';
}

function hungerCensus(Game) {
  let nLiving = 0, nHungry = 0;
  try {
    for (const id of (((Game.state || {}).village || {}).roster) || []) {
      let p = null;
      try { p = Game.getPerson(id); } catch (e) {}
      if (!p || p.dead) continue;
      nLiving++;
      let h = 0;
      try { h = (Game.npcNeeds(id).hunger) || 0; } catch (e) {}
      if (h > 70) nHungry++;
    }
  } catch (e) {}
  return { nLiving, nHungry };
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'spikechar-test', fullTelemetry: false });
  await setupGame(Game);
  const govLog = [], census = [], dawnByDay = {};
  let seq = 0, starveDays = 0;
  const starveDaySet = new Set();
  const oGov = Game.surplusFeedGovernor;
  Game.surplusFeedGovernor = function (v, give) {
    const day = (Game.state.scholar || {}).day || 0;
    let fireFd = -1;
    try { fireFd = Game.pantryFreshDays(); } catch (e) {}
    const dawnFd = (dawnByDay[day] !== undefined) ? dawnByDay[day] : -1;
    const s = ++seq;
    const r = oGov.apply(this, arguments);
    govLog.push({ seq: s, day, fireFd, dawnFd, trim: (typeof r === 'number' && r < give) });
    return r;
  };
  const oSleep = Game.sleep;
  Game.sleep = function () {
    const dayEnded = (Game.state.scholar || {}).day || 0;
    const pre = hungerCensus(Game);
    const sPre = ++seq;
    const r = oSleep.apply(this, arguments);
    const sPost = ++seq;
    const post = hungerCensus(Game);
    const dayAfter = (Game.state.scholar || {}).day || 0;
    let fd = -1;
    try { fd = Game.pantryFreshDays(); } catch (e) {}
    dawnByDay[dayAfter] = fd;
    census.push(Object.assign({ seq: sPre, dayEnded, phase: 'pre' }, pre));
    census.push(Object.assign({ seq: sPost, dayEnded, phase: 'post' }, post));
    return r;
  };
  const policy = Object.assign({}, leadfeast);
  const origDaily = leadfeast.daily;
  let loopDay = 0;
  policy.daily = (G, ctx) => {
    try {
      let hungry = 0;
      for (const id of (((G.state || {}).village || {}).roster || [])) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) { starveDays++; starveDaySet.add(loopDay); }
    } catch (e) {}
    loopDay++;
    if (origDaily) return origDaily(G, ctx);
  };
  await runDays(Game, policy, { days, manifest: null });
  return { govLog, census, starveDays, starveDaySet };
}

async function t1() {
  const a = await oneRun(6401, 40);
  const b = await oneRun(6401, 40);
  const h = o => crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 16);
  const same = h(a.govLog) === h(b.govLog) && h(a.census) === h(b.census);
  ok('T1 twin determinism (govLog + censuses byte-identical)',
    same && a.govLog.length === b.govLog.length && a.census.length === b.census.length,
    `gov=${a.govLog.length}/${b.govLog.length} census=${a.census.length}/${b.census.length} ${h(a.govLog)}/${h(b.govLog)}`);
}

async function t2() {
  // seed 6407 (probed: 20 spike trims in 80d; 6401/6402 stay spike-free in
  // range on this horizon). Pilot range keeps census seeds 6611-6618 fresh.
  const a = await oneRun(6407, 80);
  const trims = a.govLog.filter(g => g.trim);
  const classes = { spike: 0, glut: 0, unknownDawn: 0, leanWindow: 0, unclassified: 0 };
  for (const t of trims) {
    const c = classify(t);
    if (classes[c] === undefined) classes.unclassified++;
    else classes[c]++;
  }
  ok('T2 no lean-window trims (fireFd>4 for all)', classes.leanWindow === 0,
    `${trims.length} trims: ` + JSON.stringify(classes));
  ok('T2 spike mechanism visible', classes.spike > 0, `spike=${classes.spike}`);
  ok('T2 every trim classified', classes.unclassified === 0, JSON.stringify(classes));
}

async function t3() {
  const a = await oneRun(6402, 40);
  const postByDay = new Map(a.census.filter(c => c.phase === 'post').map(c => [c.dayEnded, c]));
  let bad = 0, checked = 0, noCensus = 0;
  for (const t of a.govLog) {
    const c = postByDay.get(t.day);
    if (!c) { noCensus++; continue; }
    checked++;
    if (!(t.seq < c.seq)) bad++;
  }
  ok('T3 every gov call precedes its day\'s POST census (ordering by construction)',
    bad === 0 && checked > 0, `checked=${checked} bad=${bad} noCensusDay=${noCensus}`);
}

async function t4() {
  // Comparability: the pre-sleep census (same >70 band, later in the day
  // than policy.daily — the pacing tick-burn sits between them, so hunger
  // only rises) must catch every loop-day the pilot's instrument catches
  // (superset), at no more than 3x the count. Probed mechanism: on some
  // loop-days daily=0/pre=1/post=0 — ticks burn hunger up after daily,
  // in-sleep catch-up meals bring it back down.
  const a = await oneRun(6401, 40);
  const pre = a.census.filter(c => c.phase === 'pre');
  // per-loop-day alignment: daily hook ran once per loop-day (starveDaySet),
  // census pre runs once per sleep ~= once per loop-day, in order.
  const dailyIdx = [...a.starveDaySet].sort((x, y) => x - y);
  const preMildIdx = pre.map((c, i) => (c.nHungry > 0 ? i : -1)).filter(i => i >= 0);
  const preSet = new Set(preMildIdx);
  // map loop-day i -> census index: both run once per loop-day in order, but
  // the first loop-day's sleep may precede/follow; use nearest-index match
  // with tolerance: daily day i is covered if any pre-census mild day is
  // within +-1 loop-day.
  let uncovered = 0;
  for (const i of dailyIdx) {
    if (!preSet.has(i) && !preSet.has(i - 1) && !preSet.has(i + 1)) uncovered++;
  }
  const ratio = preMildIdx.length / Math.max(1, dailyIdx.length);
  ok('T4 pre-census catches every pilot starveDay (superset, ratio<=3)',
    uncovered === 0 && ratio <= 3,
    `daily=${dailyIdx.length} pre=${preMildIdx.length} uncovered=${uncovered} ratio=${ratio.toFixed(2)}`);
}

(async () => {
  await t1();
  await t2();
  await t3();
  await t4();
  console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
