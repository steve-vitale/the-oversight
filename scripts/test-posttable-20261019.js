#!/usr/bin/env node
// test-posttable-20261019.js — proof for the sim-posttable post-table
// mortality attribution instrument.
//
// Suites:
//   CLASSIFIER — parity fixtures: classifyDeath maps every documented
//     cause to its channel IDENTICALLY to
//     scripts/probe-windowsurvive-20261019.js (the comparability contract).
//   TABLE — synthetic-history fixtures: attribute() detects invitation day,
//     sat/withdrawn/invitation-only/no-table outcomes, phase traces,
//     post-table death filtering (day >= tableDay), day-after-table index,
//     win-state-at-death and the unmet list.
//   KILLER-WAVE — nameToWave + joinKillerWave fixtures.
//   SMOKE — 1 seed x 15d, both policies: runs complete, table census live,
//     death capture + KILLDISC installed, 0 instrument errors.
//   DET — 2 seeds x 60d: bare-stable, census-stable, bare-vs-census
//     byte-identical trajectories (non-perturbation).
//   COMPLETENESS — post-sweep (COMPLETE=1): 16/16 per-seed files valid,
//     16/16 runs attributed, 0 unattributed on table-reaching runs.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 node scripts/test-posttable-20261019.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const SW = require('./probe-posttable-20261019');
const AZ = require('./analyze-posttable-20261019');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
const cls = (cause, ctx, mn) => SW.classifyDeath(cause, ctx, mn)[0];

// ---------------------------------------------------------------- CLASSIFIER
// Parity with the vetwindow/windowsurvive classifier (copied verbatim).
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

// ---------------------------------------------------------------- TABLE
function mkrec(d, tb) {
  return { d, st: { pantry: 1000, hungryStreak: 0 }, tb: Object.assign({ waiting: false, done: false, sitting: 0, phase: null, path: null, branch: null, beat: null, seat: null, winDeferred: false, floorOk: true, active: false }, tb || {}), uw: 4, alive: true, won: false };
}
function mkdeath(day, opts) {
  return Object.assign({ who: 'v1', name: 'Test', day, cause: 'combat', kind: 'person', player: true, wave: null, channel: 'raid', rule: 'cause', ctx: {}, stateAtDeath: { pantry: 5000, hungryStreak: 0, vets: 0, armored: 1 }, tableAtDeath: { phase: null, path: null, active: false } }, opts || {});
}
function synthRec(recs, deaths, opts) {
  const o = Object.assign({ endReason: 'village-lost', gameDays: 92, won: false, tableDay: null, satEver: false }, opts || {});
  return {
    seed: 1, policyId: 'leadfeast', substrate: 'pre-seat-win-side', recs, fightStarts: [],
    deathsAttributed: { attributed: deaths, attributedCount: deaths.length, unattributedCount: 0, phantomCount: 0, causeSpace: {} },
    endRec: recs.length ? { d: o.gameDays, tb: recs[recs.length - 1].tb } : null,
    endReason: o.endReason, gameDays: o.gameDays, won: o.won,
    national: false, table: o.tableDay != null, exiled: false, maxWave: 4, wave4Day: 50, wave5Day: null,
    tableDay: o.tableDay, tableDayFloorOk: o.tableDayFloorOk == null ? true : o.tableDayFloorOk,
    satEver: o.satEver, sittingDay: o.sittingDay || null, seatAtSit: o.seatAtSit || null,
    tableDoneDay: o.tableDoneDay || null, tableActiveDays: o.tableActiveDays || 0,
    phaseTrace: o.phaseTrace || [],
  };
}
(function tableTelemetry() {
  // T1: invitation-only (tableWaiting d60+, never sat): d50 combat is
  // PRE-table (excluded), d65/d70 are post-table with day-after index.
  const recs1 = [];
  for (let d = 1; d <= 92; d++) recs1.push(mkrec(d, d >= 60 ? { waiting: true, floorOk: true } : null));
  const a1 = AZ.attribute(synthRec(recs1,
    [mkdeath(50, { player: false, name: 'Pre', channel: 'expedition' }),
     mkdeath(65, { name: 'Scholar', channel: 'raid' }),
     mkdeath(70, { name: 'Vill', player: false, cause: 'starvation', channel: 'haven' })],
    { tableDay: 60 }));
  check('T1 tableOutcome invitation-only', a1.table.tableOutcome === 'invitation-only', `got ${a1.table.tableOutcome}`);
  check('T1 two post-table deaths', a1.postTable.count === 2, `got ${a1.postTable.count}`);
  check('T1 day-after index', a1.postTable.rows[0].dayAfterTable === 5 && a1.postTable.rows[1].dayAfterTable === 10);
  check('T1 scholar/villager split', a1.postTable.scholar === 1 && a1.postTable.villager === 1);
  check('T1 channels', a1.postTable.channels.raid === 1 && a1.postTable.channels.haven === 1);
  check('T1 unmet names the seat', a1.unmet.indexOf('seat-never-taken') >= 0 && a1.unmet.indexOf('table-never-completed') >= 0, `got ${a1.unmet.join(',')}`);
  // T2: sat (sittingId=1 from d62, phase paths): outcome sat.
  const recs2 = [];
  for (let d = 1; d <= 92; d++) recs2.push(mkrec(d, d >= 60 ? { waiting: true, sitting: d >= 62 ? 1 : 0, phase: d >= 62 ? 'paths' : null, active: d >= 62 } : null));
  const a2 = AZ.attribute(synthRec(recs2, [mkdeath(70, { name: 'Scholar' })], { tableDay: 60, satEver: true, sittingDay: 62, seatAtSit: 'full', phaseTrace: ['paths'], tableActiveDays: 8 }));
  check('T2 tableOutcome sat', a2.table.tableOutcome === 'sat', `got ${a2.table.tableOutcome}`);
  check('T2 phases seen', JSON.stringify(a2.table.phasesSeen) === '["paths"]', `got ${a2.table.phasesSeen}`);
  check('T2 active days counted', a2.table.tableActiveDays === 8, `got ${a2.table.tableActiveDays}`);
  check('T2 unmet phase-stuck', a2.unmet.indexOf('phase-stuck:paths') >= 0, `got ${a2.unmet.join(',')}`);
  // T3: won -> unmet empty, outcome won.
  const recs3 = [];
  for (let d = 1; d <= 95; d++) recs3.push(mkrec(d, { waiting: true, sitting: 1, phase: d >= 90 ? 'done' : 'finals', active: d < 90 }));
  const a3 = AZ.attribute(synthRec(recs3, [], { endReason: 'over-other', gameDays: 95, won: true, tableDay: 60, satEver: true, sittingDay: 62, phaseTrace: ['paths', 'challenge', 'finals', 'done'], tableActiveDays: 28 }));
  check('T3 tableOutcome won', a3.table.tableOutcome === 'won', `got ${a3.table.tableOutcome}`);
  check('T3 unmet empty', a3.unmet.length === 0, `got ${a3.unmet.join(',')}`);
  // T4: withdrawn (waiting d60-65 then cleared, never sat).
  const recs4 = [];
  for (let d = 1; d <= 92; d++) recs4.push(mkrec(d, d >= 60 && d <= 65 ? { waiting: true } : null));
  const a4 = AZ.attribute(synthRec(recs4, [], { tableDay: 60 }));
  check('T4 tableOutcome withdrawn', a4.table.tableOutcome === 'withdrawn', `got ${a4.table.tableOutcome}`);
  check('T4 withdrawals counted', a4.table.withdrawals === 1, `got ${a4.table.withdrawals}`);
  // T5: never invited.
  const recs5 = [];
  for (let d = 1; d <= 92; d++) recs5.push(mkrec(d, null));
  const a5 = AZ.attribute(synthRec(recs5, [mkdeath(40)], {}));
  check('T5 tableOutcome no-table', a5.table.tableOutcome === 'no-table', `got ${a5.table.tableOutcome}`);
  check('T5 no post-table deaths', a5.postTable.count === 0);
  check('T5 unmet no-invitation', a5.unmet.length === 1 && a5.unmet[0] === 'no-invitation');
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
    const out = await SW.runOne(64201, policyId, { noWrite: true });
    check(`SMOKE[${policyId}] run completes`, out.gameDays >= 15, `days=${out.gameDays}`);
    check(`SMOKE[${policyId}] daily census live`, out.recs.length >= 15, `recs=${out.recs.length}`);
    check(`SMOKE[${policyId}] death capture installed`, out.deathsAttributed.rawCount >= 0, `raw=${out.deathsAttributed.rawCount}`);
    check(`SMOKE[${policyId}] 0 instrument errors`, out.instrumentErrors === 0, `ierr=${out.instrumentErrors}`);
    check(`SMOKE[${policyId}] 0 killdisc errors`, out.kdErrors === 0, `kdErr=${out.kdErrors}`);
    const last = out.recs[out.recs.length - 1];
    check(`SMOKE[${policyId}] state reads live`, last && last.st && typeof last.st.pantry === 'number', `pantry=${last && last.st && last.st.pantry}`);
    check(`SMOKE[${policyId}] table telemetry live`, last && last.tb && typeof last.tb.waiting === 'boolean' && 'phase' in last.tb, `tb=${last && JSON.stringify(last.tb)}`);
    check(`SMOKE[${policyId}] top-level wall booleans`, typeof out.won === 'boolean' && typeof out.national === 'boolean' && typeof out.table === 'boolean', `won=${out.won} national=${out.national} table=${out.table}`);
  }
  delete process.env.DAYS;
}
async function det() {
  process.env.DAYS = '60';
  let ok = true;
  for (const seed of [64201, 64202]) {
    process.env.POSTTABLE_BARE = '1';
    const hB1 = (await SW.runOne(seed, 'leadfeast', { noWrite: true })).hashes.join('|');
    const hB2 = (await SW.runOne(seed, 'leadfeast', { noWrite: true })).hashes.join('|');
    delete process.env.POSTTABLE_BARE;
    const hC1 = (await SW.runOne(seed, 'leadfeast', { noWrite: true })).hashes.join('|');
    const hC2 = (await SW.runOne(seed, 'leadfeast', { noWrite: true })).hashes.join('|');
    const pass = hB1 === hB2 && hC1 === hC2 && hB1 === hC1;
    if (!pass) ok = false;
    check(`DET s${seed}`, pass, `bareStable=${hB1 === hB2} censusStable=${hC1 === hC2} identical=${hB1 === hC1}`);
  }
  delete process.env.DAYS;
  return ok;
}
// ---------------------------------------------------------------- COMPLETENESS
function completeness() {
  const { recs, bad } = AZ.loadValid();
  check('COMPLETE 0 bad files', bad.length === 0, `bad=${bad.join(',')}`);
  check('COMPLETE 16/16 per-seed files', recs.length === 16, `got ${recs.length}`);
  const attrs = recs.map(AZ.attribute);
  const reached = attrs.filter(a => a.table.reached);
  const unattrib = reached.reduce((t, a) => t + a.deaths.unattributed, 0);
  check('COMPLETE 0 unattributed on table-reaching runs', unattrib === 0, `unattributed=${unattrib}`);
  const wallKeys = ['won', 'national', 'table'];
  for (const r of recs) {
    for (const k of wallKeys) check(`COMPLETE ${r.policyId}-s${r.seed} top-level boolean ${k}`, typeof r[k] === 'boolean', `got ${typeof r[k]}`);
  }
}

(async () => {
  if (process.env.SMOKE_ONLY === '1') await smoke();
  else {
    await smoke();
    if (process.env.DET === '1') await det();
    if (process.env.COMPLETE === '1') completeness();
  }
  console.log(`posttable-proof: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
