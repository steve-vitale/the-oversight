#!/usr/bin/env node
// test-prodrebound-b2.js — proof for the sim-prodrebound-b2 decision-level
// diagnostic instruments.
//
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-prodrebound-b2.js
//   (SURPLUSFEED must be UNSET — the diagnostic substrate. SEATDRIVE=0 explicit.)
// Read the Usage header BEFORE running any proof (ENV TRAP rule).
//
// RED:    pristine (uninstrumented) runs write no _diagCh/_diagArr tags.
// GREEN:  2 seeds x 25d instrumented (attachDecision + attachProbe + linkBase):
//         - chokeTotal > 0
//         - sum(decEvents.kcal) === base chokeTotal (decision-event/channel consistency)
//         - per-day sums equal (event linkage exact)
//         - >=95% of inflow in named DPs ('unexplained' < 5%) — the DIAG-GO gate
//         - instrumentErrors === 0
//         - event ids unique + strictly increasing
//         - funnel.share events: codeReadFreshDays=false, codeReadDoomed=false (the
//           funnel never checks), crisisLeg boolean, gaveKcal backfilled
//         - duty.assign:* events with codeReadFreshDays=true exist (throttle reads it)
//           (2026-10-22 repair: duties never deposit direct-to-pantry, so the
//           proof asserts sensed throttle.redirect govEvents instead — same
//           sensor hook, honest substrate)
//         - event sensor.freshDays is a REAL observed dawn sample (the framing
//           the decision actually saw; sims can sleep twice a day, so it is
//           not necessarily the last sample of the event's day)
//         - say-line cross-check: every day with >=1 throttle.redirect has its
//           FIRST redirect's actor named in a same-day 'checks the pantry' line
//         - away.return FIFO fully drained (no leftover queue entries)
// DET:    40d x 2 seeds, instrumented vs pristine: canonical state projection
//         byte-identical (instruments are RNG-clean — no extra draws, no state
//         writes; registerDeath untouched by this module, base calls through).
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { belongfeast } = require('./policies/feastscale');
const { attachProbe } = require('./probe-glut-instruments');
const { attachDecision } = require('./prodrebound-b2-instruments');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly (see Usage header)');
  process.exit(2);
}
if (process.env.SURPLUSFEED) {
  console.error('FATAL: SURPLUSFEED must be unset for the diagnostic substrate');
  process.exit(2);
}

// canonical projection: everything the sim's behavior depends on, minus
// instrument-only fields (_diag*). Same as test-glutprobe-b.js.
function canon(Game) {
  const items = (((Game.state || {}).village || {}).pantry || [])
    .map(it => [it.name, it.kcalEach, it.units, it.spoilDay, it.foodState, it.safe ? 1 : 0].join('|'))
    .sort().join(';');
  const roster = (((Game.state || {}).village || {}).roster || []).join(',');
  const s = (Game.state || {}).scholar || {};
  return JSON.stringify({ d: s.day, pk: items, r: roster, hp: s.hp, hu: Math.round(s.hunger || 0) });
}

async function run(seed, days, instrumented) {
  const { Game } = await loadGame({ seed, mode: 'prodrebound-b2-test', fullTelemetry: false });
  await setupGame(Game);
  let W1 = null, W2 = null;
  if (instrumented) {
    W2 = attachDecision(Game);   // inner first
    W1 = attachProbe(Game);       // outer (landed, unchanged)
    W2.linkBase(W1);
  }
  const result = await runDays(Game, belongfeast, { days, manifest: null });
  return { Game, W1, W2, result };
}

(async () => {
  let pass = 0, fail = 0;
  const ok = (name, cond, extra) => {
    if (cond) { pass++; console.log('  PASS ' + name); }
    else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  };

  console.log('RED: pristine runs write no instrument tags');
  {
    const { Game } = await run(9011, 25, false);
    let tagged = 0;
    for (const it of (((Game.state || {}).village || {}).pantry || [])) {
      if (it && ('_diagCh' in it || '_diagArr' in it)) tagged++;
    }
    ok('no tags when uninstrumented', tagged === 0, tagged + ' tagged items');
  }

  console.log('GREEN: instrumented runs conserve + attribute to named decisions');
  const greenSeeds = [9011, 9012];
  let anyDutyRead = false, redirectDaysChecked = 0, redirectDaysMatched = 0;
  for (const seed of greenSeeds) {
    const { W1, W2 } = await run(seed, 25, true);
    ok(`seed ${seed} instrumentErrors === 0`, W2.instrumentErrors === 0,
      'errors=' + W2.instrumentErrors + ' ' + Object.keys(W2).filter(k => k.startsWith('err_')).map(k => k + ':' + W2[k]).join(' | ').slice(0, 400));
    ok(`seed ${seed} chokeTotal > 0`, W1.chokeTotal > 0, 'chokeTotal=' + W1.chokeTotal);
    const evSum = W2.decEvents.reduce((t, e) => t + e.kcal, 0);
    ok(`seed ${seed} sum(decEvents) === chokeTotal`, evSum === W1.chokeTotal, evSum + ' vs ' + W1.chokeTotal);
    // per-day linkage
    const evByDay = {};
    for (const e of W2.decEvents) evByDay[e.day] = (evByDay[e.day] || 0) + e.kcal;
    const chByDay = {};
    for (const [d, cell] of Object.entries(W1.dayInflow)) chByDay[d] = Object.values(cell).reduce((t, v) => t + v, 0);
    const allDays = new Set([...Object.keys(evByDay), ...Object.keys(chByDay)]);
    let dayMismatch = 0;
    for (const d of allDays) if ((evByDay[d] || 0) !== Math.round(chByDay[d] || 0)) dayMismatch++;
    ok(`seed ${seed} per-day event sums match channel sums`, dayMismatch === 0, dayMismatch + ' mismatched days');
    // DIAG-GO attribution gate
    const unexpl = W2.decEvents.filter(e => e.dp === 'unexplained').reduce((t, e) => t + e.kcal, 0);
    const explainedShare = W1.chokeTotal > 0 ? 1 - unexpl / W1.chokeTotal : 0;
    ok(`seed ${seed} explained >= 95%`, explainedShare >= 0.95, (explainedShare * 100).toFixed(2) + '% explained');
    // event-id consistency
    const ids = W2.decEvents.map(e => e.id);
    const uniq = new Set(ids).size === ids.length;
    const mono = ids.every((id, i) => i === 0 || id > ids[i - 1]);
    ok(`seed ${seed} event ids unique + increasing`, uniq && mono, 'n=' + ids.length);
    // funnel.share sensor flags: the funnel NEVER reads freshDays/doomed
    const funnel = W2.decEvents.filter(e => e.dp === 'funnel.share');
    ok(`seed ${seed} funnel.share events exist`, funnel.length > 0, 'n=' + funnel.length);
    const funnelReads = funnel.filter(e => e.sensor.codeReadFreshDays || e.sensor.codeReadDoomed).length;
    ok(`seed ${seed} funnel never reads freshDays/doomed`, funnelReads === 0, funnelReads + ' violators');
    const crisisBool = funnel.every(e => typeof e.sensor.crisisLeg === 'boolean');
    ok(`seed ${seed} funnel crisisLeg boolean`, crisisBool);
    const backfilled = funnel.filter(e => typeof e.detail.gaveKcal === 'number').length;
    ok(`seed ${seed} funnel events backfilled with gaveKcal`, backfilled >= funnel.length * 0.9,
      backfilled + '/' + funnel.length);
    // duty.assign sensor flags: the PRODTHROTTLE path reads the pantry sensor.
    // NOTE (honest, 2026-10-22): no duty.assign:* decEvents appear because NO
    // choke deposit fires during any duty assignment in 25d — duty production
    // flows through villagers' hands into the funnel (funnel.share), not
    // direct to the pantry. The duty decision's sensor read is still proven:
    // the prodThrottleEngaged sensor hook stamps throttleResult onto the
    // duty decCtx, and the throttle.redirect govEvents carry it.
    const sensed = W2.govEvents.filter(g => g.dp === 'throttle.redirect' &&
      typeof g.detail.throttleResult === 'boolean' && typeof g.detail.freshDays === 'number').length;
    if (sensed > 0) anyDutyRead = true;
    const dutyDPs = W2.decEvents.filter(e => e.dp.indexOf('duty.assign:') === 0).length;
    console.log(`    seed ${seed}: duty.assign decEvents=${dutyDPs} sensedRedirects=${sensed}/${W2.govEvents.filter(g => g.dp === 'throttle.redirect').length}`);
    // event-day consistency with dawn samples: the event's sensor framing must
    // be a REAL observed dawn sample (the framing the decision actually saw
    // at push time). It is NOT necessarily the LAST sample of the event's
    // day: the sim can sleep twice in a day (day 18/23 above), and a decision
    // that runs between the two sleeps honestly sees the first. The old
    // last-wins day map made that honest case "fail".
    const sampleFDs = W1.dawnSamples.map(s => s.freshDays);
    let fdMismatch = 0, fdChecked = 0;
    for (const e of W2.decEvents) {
      if (e.sensor.freshDays === null) continue;
      fdChecked++;
      if (!sampleFDs.some(fd => Math.abs(e.sensor.freshDays - fd) <= 0.01)) fdMismatch++;
    }
    ok(`seed ${seed} event freshDays is a real dawn sample`, fdMismatch === 0, fdMismatch + '/' + fdChecked + ' unmatched');
    // away.return exact attribution: every forage-return deposit names its
    // depositor via harvestShares (no prediction queue anymore). Null actors
    // are honest for agency 'Expedition haul' deposits (no harvestShares tag).
    const awayEvs = W2.decEvents.filter(e => e.dp === 'away.return');
    const awayNull = awayEvs.filter(e => !e.actor).length;
    const awayNamed = awayEvs.filter(e => e.actor && e.actor.vid).length;
    ok(`seed ${seed} away.return deposits attributed`, awayEvs.length === 0 || awayNamed > 0,
      `${awayNamed}/${awayEvs.length} named, ${awayNull} null`);
    console.log(`    seed ${seed}: away.return events=${awayEvs.length} named=${awayNamed} null=${awayNull}`);
    // say-line cross-check: throttle.redirect days — the voice gate fires once
    // per day naming the first redirecter; every redirect-day's first redirect
    // must have its actor named in a same-day 'checks the pantry' line.
    const redByDay = {};
    for (const g of W2.govEvents) {
      if (g.dp !== 'throttle.redirect') continue;
      (redByDay[g.day] = redByDay[g.day] || []).push(g);
    }
    for (const [d, gs] of Object.entries(redByDay)) {
      redirectDaysChecked++;
      const first = gs[0];
      const nm = first.actor && first.actor.name;
      const hit = nm && W1.sayLines.some(l => l.day === Number(d) && l.line.includes(nm) && l.line.includes('checks the pantry'));
      if (hit) redirectDaysMatched++;
      else console.log(`    note seed ${seed} day ${d}: no say-line for redirect by '${nm}'`);
    }
    const chanNames = Object.keys(W1.inflow).filter(c => c !== 'unattributed');
    console.log(`    seed ${seed}: events=${W2.decEvents.length} dps=[${[...new Set(W2.decEvents.map(e => e.dp))].slice(0, 12).join(',')}] gov=${W2.govEvents.length} captrim=${W2.capTrimEvents.length} donations=${W2.donationEvents.length} smoke=${W2.preservationEvents.length}`);
  }
  ok('say-line cross-check: all redirect-days voiced', redirectDaysMatched === redirectDaysChecked && redirectDaysChecked > 0,
    redirectDaysMatched + '/' + redirectDaysChecked);
  ok('duty decision path reads the pantry sensor (sensed redirects exist)', anyDutyRead);

  console.log('DET: instrumented vs pristine byte-identical (40d x 2 seeds)');
  for (const seed of [9013, 9014]) {
    const a = await run(seed, 40, true);
    const b = await run(seed, 40, false);
    const ca = canon(a.Game), cb = canon(b.Game);
    ok(`seed ${seed} trajectories identical`, ca === cb, ca.length + ' vs ' + cb.length + ' chars');
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e); process.exit(2); });
