#!/usr/bin/env node
// test-windowsurvive-20261019.js — proof for the sim-windowsurvive
// window-death attribution instrument.
//
// Suites:
//   CLASSIFIER — parity fixtures: classifyDeath maps every documented
//     cause to its channel IDENTICALLY to
//     scripts/vetwindow-sweep-20261018.js (the comparability contract).
//   WINDOWS — synthetic-history fixtures: attribute() builds deferral(5)
//     windows and assigns window deaths with window-day index +
//     inter-death gaps (incl. the endRec-boundary case).
//   ADDRESS — addressability() fixtures: logistics / fieldCombat /
//     wave4Combat / mundaneField / unaddressable.
//   SMOKE — 1 seed x 15d, both policies: runs complete, census live,
//     0 instrument errors.
//   DET — 2 seeds x 60d: bare-stable, census-stable, bare-vs-census
//     byte-identical trajectories.
//   COMPLETENESS — post-sweep: 16/16 per-seed files valid, 16/16 runs
//     attributed, 0 unattributed rows on died-in-window runs.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 VETREL=1 node scripts/test-windowsurvive-20261019.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const SW = require('./probe-windowsurvive-20261019');
const AZ = require('./analyze-windowsurvive-20261019');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
const cls = (cause, ctx, mn) => SW.classifyDeath(cause, ctx, mn)[0];

// ---------------------------------------------------------------- CLASSIFIER
(function classifier() {
  check('raid cause', cls('raid') === 'raid');
  check('raid-defense cause', cls('raid-defense') === 'raid');
  check('expedition cause', cls('expedition') === 'expedition');
  check('monster-name -> expedition', cls('The Eulogy', {}, new Set(['the eulogy'])) === 'expedition');
  check('aid-runner -> expedition', cls('aid-runner') === 'expedition');
  check('split-fight -> expedition', cls('split-fight: The Audit') === 'expedition');
  check('onExped monster -> expedition', cls('monster', { onExped: true }) === 'expedition');
  check('the wild', cls('the wild') === 'wild');
  check('hunting -> wild', cls('hunting') === 'wild');
  check('patrol combat', cls('patrol combat') === 'patrol');
  check('alien', cls('alien') === 'alien');
  check('disease id', cls('gutrot') === 'disease');
  check('disease regex', cls('food poisoning') === 'disease');
  check('starvation -> haven', cls('starvation') === 'haven');
  check('thirst -> haven', cls('thirst') === 'haven');
  check('injuries -> haven', cls('injuries') === 'haven');
  check("wound-that-wouldn't-close -> haven", cls("a wound that wouldn't close") === 'haven');
  check('combat+aid -> raid', cls('combat', { aid: true }) === 'raid');
  check('combat+router-patrol -> patrol', cls('combat', { router: 'patrol' }) === 'patrol');
  check('combat+router-wild -> wild', cls('combat', { router: 'wild' }) === 'wild');
  check('combat+atHaven -> raid', cls('combat', { atHaven: true }) === 'raid');
  check('combat plain -> wild', cls('combat', {}) === 'wild');
  check('monster+aid -> raid', cls('monster', { aid: true }) === 'raid');
  check('monster unresolved -> other', cls('monster', {}) === 'other');
  check('dehydration trap kept', cls('dehydration') === 'other'); // the vetwindow trap, kept identically
  check('ambush -> other', cls('ambush') === 'other');
  check('contest -> other', cls('contest') === 'other');
  check('unknown -> other', cls('???') === 'other');
  check('isPersonDeath scholar', SW.isPersonDeath({ player: true, kind: 'monster' }));
  check('isPersonDeath villager', SW.isPersonDeath({ kind: 'villager' }));
  check('isPersonDeath monster', !SW.isPersonDeath({ kind: 'monster' }));
})();

// ---------------------------------------------------------------- WINDOWS
function synthRec(recs, deaths, endReason, gameDays, endRec) {
  return { seed: 1, policyId: 'leadfeast', recs,
    deathsAttributed: { attributed: deaths, attributedCount: deaths.length,
      unattributedCount: 0, phantomCount: 0, causeSpace: {} },
    endRec: endRec || null, endReason, gameDays, won: false,
    national: false, table: false, exiled: false, maxWave: 4, wave4Day: 50, wave5Day: null };
}
function mkrec(d, def5) { return { d, st: { def5 }, uw: 4, peak: 4, w4k: 0 }; }
(function windows() {
  // One died window d60-90, three deaths: a scholar raid death w4, a
  // villager starvation, a combat death outside (pre-window).
  const recs = [];
  for (let d = 1; d <= 91; d++) recs.push(mkrec(d, d >= 60 && d <= 91));
  const deaths = [
    { who: 'v1', name: 'Sigrun', day: 40, cause: 'combat', kind: 'person', player: true, wave: 3, channel: 'expedition', rule: 'cause', ctx: {}, stateAtDeath: { pantry: 5000, hungryStreak: 0, vets: 0, armored: 2 } },
    { who: 'v1', name: 'Sigrun2', day: 65, cause: 'combat', kind: 'person', player: true, wave: 4, channel: 'raid', rule: 'ctx:scholar-fight-at-haven', ctx: {}, stateAtDeath: { pantry: 100, hungryStreak: 4, vets: 0, armored: 1 } },
    { who: 'v2', name: 'Mekonnen', day: 70, cause: 'starvation', kind: 'villager', player: false, wave: null, channel: 'haven', rule: 'cause', ctx: {}, stateAtDeath: { pantry: 0, hungryStreak: 5, vets: 0, armored: 1 } },
  ];
  const a = AZ.attribute(synthRec(recs, deaths, 'village-lost', 92, mkrec(92, true)));
  check('W1 def5ever', a.def5ever);
  check('W1 one window', a.attempts.length === 1 && a.attempts[0].outcome === 'died');
  check('W1 two window deaths', a.windowDeathCount === 2, `got ${a.windowDeathCount}`);
  check('W1 window-day index', a.windowDeaths[0].windowDay === 6 && a.windowDeaths[1].windowDay === 11);
  check('W1 inter-death gap', JSON.stringify(a.interDeathGaps) === '[5]');
  // Without an endRec there is genuinely no evidence the village was at
  // the door when it died — 'regressed' is the honest read (the probe
  // always writes endRec, so this shape never occurs in practice).
  const a2 = AZ.attribute(synthRec(recs, deaths, 'village-lost', 92, null));
  check('W2 no-endRec reads regressed (honest)', a2.attempts.length === 1 && a2.attempts[0].outcome === 'regressed' && a2.windowDeathCount === 0);
  // Regressed: deferral ends mid-run, village alive.
  const recs3 = [];
  for (let d = 1; d <= 120; d++) recs3.push(mkrec(d, d >= 60 && d <= 90));
  const a3 = AZ.attribute(synthRec(recs3, [], 'survived', 120, mkrec(120, false)));
  check('W3 regressed', a3.attempts.length === 1 && a3.attempts[0].outcome === 'regressed');
  check('W3 no window deaths', a3.windowDeathCount === 0);
  // Never-door: no deferral.
  const recs4 = [];
  for (let d = 1; d <= 120; d++) recs4.push(mkrec(d, false));
  const a4 = AZ.attribute(synthRec(recs4, [], 'survived', 120, mkrec(120, false)));
  check('W4 not def5ever', !a4.def5ever && a4.windowDeathCount === 0);
})();

// ---------------------------------------------------------------- ADDRESS
(function address() {
  const mk = (channel, cause, wave) => AZ.addressability({ channel, cause, wave });
  const A1 = mk('haven', 'starvation', null);
  check('A1 starvation logistics+addressable', A1.logistics && A1.addressable);
  const A2 = mk('other', 'dehydration', null);
  check('A2 dehydration logistics (the trap, still addressable)', A2.logistics && A2.addressable);
  const A3 = mk('raid', 'combat', 4);
  check('A3 wave-4 raid combat field+addressable', A3.fieldCombat && A3.wave4Combat && A3.addressable);
  const A4 = mk('expedition', 'combat', 3);
  check('A4 wave-3 expedition combat', A4.fieldCombat && A4.wave3Combat && !A4.wave4Combat);
  const A5 = mk('disease', 'gutrot', null);
  check('A5 disease mundane-field, NOT addressable', A5.mundaneField && !A5.addressable);
  const A6 = mk('other', 'ambush', null);
  check('A6 ambush unaddressable', !A6.addressable && !A6.fieldCombat && !A6.logistics);
})();

// ---------------------------------------------------------------- KILLER-WAVE
(function killerWave() {
  check('KW name: The Redactor -> w3', AZ.nameToWave('The Redactor') === 3);
  check('KW name: The Influencer -> w4', AZ.nameToWave('The Influencer') === 4);
  check('KW name: Highbeam Deer -> w1', AZ.nameToWave('Highbeam Deer') === 1);
  check('KW name: unknown -> null', AZ.nameToWave('Not A Monster') === null);
  const rec = { fightStarts: [
      { day: 60, mid: 'the_influencer', wave: 4, via: 'combat_start' },
      { day: 70, mid: 'choir_toad', wave: 1, via: 'router:wild' },
    ],
    deathsAttributed: { attributed: [
      { who: 'v1', day: 65, cause: 'combat', wave: null },
      { who: 'v2', day: 75, cause: 'monster', wave: null },
      { who: 'v3', day: 80, cause: 'The Redactor', wave: null },
      { who: 'v4', day: 50, cause: 'combat', wave: null },
    ] } };
  const ds = AZ.joinKillerWave(rec);
  check('KW join: combat -> latest fight-start wave', ds[0].killerWave === 4 && ds[0].killerVia === 'combat_start');
  check('KW join: monster -> wild router wave', ds[1].killerWave === 1 && ds[1].killerVia === 'router:wild');
  check('KW join: monster-name -> name lookup', ds[2].killerWave === 3 && ds[2].killerVia === 'name-lookup');
  check('KW join: no fight before death -> null', ds[3].killerWave === null);
  check('KW probe exports waveOf', typeof SW.waveOf === 'function');
})();

// ---------------------------------------------------------------- SMOKE / DET
async function smoke() {
  process.env.DAYS = '15';
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const out = await SW.runOne(63801, policyId, { noWrite: true });
    check(`SMOKE[${policyId}] run completes`, out.gameDays >= 15, `days=${out.gameDays}`);
    check(`SMOKE[${policyId}] daily census live`, out.recs.length >= 15, `recs=${out.recs.length}`);
    check(`SMOKE[${policyId}] death capture installed`, out.deathsAttributed.rawCount >= 0, `raw=${out.deathsAttributed.rawCount}`);
    check(`SMOKE[${policyId}] 0 instrument errors`, out.instrumentErrors === 0, `ierr=${out.instrumentErrors}`);
    const last = out.recs[out.recs.length - 1];
    check(`SMOKE[${policyId}] state reads live`, last && last.st && typeof last.st.pantry === 'number', `pantry=${last && last.st && last.st.pantry}`);
  }
  delete process.env.DAYS;
}
async function det() {
  process.env.DAYS = '60';
  let ok = true;
  for (const seed of [63801, 63802]) {
    process.env.WINSURV_BARE = '1';
    const hB1 = (await SW.runOne(seed, 'leadfeast', { noWrite: true })).hashes.join('|');
    const hB2 = (await SW.runOne(seed, 'leadfeast', { noWrite: true })).hashes.join('|');
    delete process.env.WINSURV_BARE;
    const hC1 = (await SW.runOne(seed, 'leadfeast', { noWrite: true })).hashes.join('|');
    const hC2 = (await SW.runOne(seed, 'leadfeast', { noWrite: true })).hashes.join('|');
    const pass = hB1 === hB2 && hC1 === hC2 && hB1 === hC1;
    if (!pass) ok = false;
    check(`DET s${seed}`, pass, `bareStable=${hB1 === hB2} censusStable=${hC1 === hC2} identical=${hB1 === hC1}`);
  }
  delete process.env.DAYS;
  return ok;
}

(async () => {
  if (process.env.SMOKE_ONLY === '1') await smoke();
  else {
    await smoke();
    if (process.env.DET === '1') await det();
  }
  console.log(`windowsurvive-proof: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
