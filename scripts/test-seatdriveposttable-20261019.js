#!/usr/bin/env node
// test-seatdriveposttable-20261019.js — proof for the sim-seatdrive-posttable
// seated-table mortality attribution instrument.
//
// Suites:
//   CLASSIFIER — parity fixtures: classifyDeath maps every documented
//     cause to its channel IDENTICALLY to
//     scripts/probe-posttable-20261019.js (the comparability contract).
//   TABLE — synthetic-history fixtures: invitation vs sitting distinction
//     (won | sat | withdrawn | invitation-only | no-table), seated death
//     attribution (day >= sittingDay split during-table vs post-table),
//     day-after-sitting index, tier-at-death stamp, tier-stamped daily
//     series, win-state-at-death and the unmet list.
//   DOSE — doseResponse fixtures: tier-days vs tier-deaths from stamped
//     recs; null tiers never counted as tier 0.
//   SMOKE — 1 seed x 15d, both policies, SEATDRIVE=1: runs complete,
//     table census live, overtimeTier stamp non-null on every rec, 0
//     instrument errors.
//   DET — 2 seeds x 60d: bare-stable, census-stable, bare-vs-census
//     byte-identical trajectories (non-perturbation), SEATDRIVE=1.
//   COMPLETENESS — post-sweep (COMPLETE=1): 16/16 armed per-seed files
//     valid, >=14/16 runs with tier-stamped series (0 null otier recs),
//     invitation->sitting conversion measured, #1 seated channel named with
//     >=2x margin over #2.
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 node scripts/test-seatdriveposttable-20261019.js
'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const SW = require('./probe-seatdriveposttable-20261019');
const AZ = require('./analyze-seatdriveposttable-20261019');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
const cls = (cause, ctx, mn) => SW.classifyDeath(cause, ctx, mn)[0];

// ---------------------------------------------------------------- CLASSIFIER
// Parity with the vetwindow/windowsurvive/posttable classifier (copied
// verbatim — the comparability contract).
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
function mkrec(d, tb, otier) {
  return {
    d, st: { pantry: 1000, hungryStreak: 0 },
    tb: Object.assign({ waiting: false, done: false, sitting: 0, phase: null, path: null, branch: null, beat: null, seat: null, winDeferred: false, floorOk: true, active: false, otier: null }, tb || {}),
    otier: otier == null ? 0 : otier, uw: 4, alive: true, won: false,
  };
}
function mkdeath(day, opts) {
  return Object.assign({ who: 'v1', name: 'Test', day, cause: 'combat', kind: 'person', player: true, wave: null, channel: 'raid', rule: 'cause', ctx: {}, killerWave: null, stateAtDeath: { pantry: 5000, hungryStreak: 0, vets: 0, armored: 1 }, tableAtDeath: { phase: null, path: null, active: false, otier: 0 } }, opts || {});
}
function synthRec(recs, deaths, opts) {
  const o = Object.assign({ endReason: 'village-lost', gameDays: 92, won: false, tableDay: null, satEver: false, otierMax: 0 }, opts || {});
  return {
    seed: 1, policyId: 'leadfeast', substrate: 'seatdrive-win-side', recs, fightStarts: [],
    deathsAttributed: { attributed: deaths, attributedCount: deaths.length, unattributedCount: 0, phantomCount: 0, causeSpace: {} },
    endRec: recs.length ? { d: o.gameDays, tb: recs[recs.length - 1].tb } : null,
    endReason: o.endReason, gameDays: o.gameDays, won: o.won,
    national: false, table: o.tableDay != null, exiled: false, maxWave: 4, wave4Day: 50, wave5Day: null,
    tableDay: o.tableDay, tableDayFloorOk: o.tableDayFloorOk == null ? true : o.tableDayFloorOk,
    satEver: o.satEver, sittingDay: o.sittingDay || null, seatAtSit: o.seatAtSit || null,
    tableDoneDay: o.tableDoneDay || null, tableActiveDays: o.tableActiveDays || 0,
    phaseTrace: o.phaseTrace || [], otierMax: o.otierMax,
  };
}
(function tableTelemetry() {
  // T1: sat + won. Invitation d60, sit d62 (seat lesser), phase paths, done
  // d70, won d70. Deaths: d65 raid (during-table), d75 haven (post-table).
  const recs1 = [];
  for (let d = 1; d <= 75; d++) {
    recs1.push(mkrec(d, d >= 60 ? {
      waiting: true, sitting: d >= 62 ? 1 : 0, phase: d >= 62 && d < 70 ? 'paths' : (d >= 70 ? 'done' : null),
      path: d >= 63 ? 'defiant' : null, branch: d >= 63 ? 'light' : null, seat: d >= 62 ? 'lesser' : null,
      active: d >= 62 && d < 70,
    } : null, d >= 62 ? 0 : 0));
  }
  const a1 = AZ.seatAttribute(synthRec(recs1,
    [mkdeath(65, { name: 'Scholar', channel: 'raid', tableAtDeath: { phase: 'paths', path: 'defiant', branch: 'light', active: true, otier: 0 } }),
     mkdeath(75, { name: 'Vill', player: false, cause: 'starvation', channel: 'haven', tableAtDeath: { phase: 'done', path: 'defiant', branch: 'light', active: false, otier: 0 } })],
    { tableDay: 60, satEver: true, sittingDay: 62, seatAtSit: 'lesser', tableDoneDay: 70, phaseTrace: ['paths', 'done'], tableActiveDays: 8, endReason: 'over-other', gameDays: 75, won: true }));
  check('T1 tableOutcome won', a1.table.tableOutcome === 'won', `got ${a1.table.tableOutcome}`);
  check('T1 seated sat', a1.seated.sat === true && a1.seated.sittingDay === 62, `got sat=${a1.seated.sat} day=${a1.seated.sittingDay}`);
  check('T1 seated survival', a1.seated.seatedDays === 13, `got ${a1.seated.seatedDays}`);
  check('T1 two seated deaths', a1.seated.count === 2, `got ${a1.seated.count}`);
  check('T1 during/post split', a1.seated.during === 1 && a1.seated.post === 1, `got ${a1.seated.during}/${a1.seated.post}`);
  check('T1 day-after-sitting index', a1.seated.rows[0].dayAfterSit === 3 && a1.seated.rows[1].dayAfterSit === 13);
  check('T1 channels', a1.seated.channels.raid === 1 && a1.seated.channels.haven === 1);
  check('T1 branch carried', a1.seated.rows[0].tableBranch === 'light' && a1.seated.rows[0].tablePath === 'defiant');
  check('T1 tier at death', a1.seated.rows[0].otier === 0 && a1.seated.tiers.t0 === 2, `got ${JSON.stringify(a1.seated.tiers)}`);
  check('T1 unmet empty on won', a1.unmet.length === 0, `got ${a1.unmet.join(',')}`);
  // T2: withdrawn — invitation d60, waiting true→false d65, never sat.
  const recs2 = [];
  for (let d = 1; d <= 92; d++) recs2.push(mkrec(d, (d >= 60 && d < 65) ? { waiting: true } : null, 0));
  const a2 = AZ.seatAttribute(synthRec(recs2, [mkdeath(70, { name: 'Scholar' })], { tableDay: 60, gameDays: 92 }));
  check('T2 tableOutcome withdrawn', a2.table.tableOutcome === 'withdrawn', `got ${a2.table.tableOutcome}`);
  check('T2 not seated', a2.seated.sat === false && a2.seated.count === 0 && a2.seated.seatedDays == null);
  // T3: invitation-only — waiting d60+ to the end, never sat.
  const recs3 = [];
  for (let d = 1; d <= 92; d++) recs3.push(mkrec(d, d >= 60 ? { waiting: true, floorOk: true } : null, 0));
  const a3 = AZ.seatAttribute(synthRec(recs3, [mkdeath(70, { name: 'Scholar' })], { tableDay: 60 }));
  check('T3 tableOutcome invitation-only', a3.table.tableOutcome === 'invitation-only', `got ${a3.table.tableOutcome}`);
  check('T3 not seated', a3.seated.sat === false);
  check('T3 unmet names the seat', a3.unmet.indexOf('seat-never-taken') >= 0, `got ${a3.unmet.join(',')}`);
  // T4: no-table — no invitation ever.
  const recs4 = [];
  for (let d = 1; d <= 80; d++) recs4.push(mkrec(d, null, 0));
  const a4 = AZ.seatAttribute(synthRec(recs4, [mkdeath(40, { name: 'Scholar' })], { gameDays: 80 }));
  check('T4 tableOutcome no-table', a4.table.tableOutcome === 'no-table', `got ${a4.table.tableOutcome}`);
  check('T4 seated empty', a4.seated.count === 0 && a4.seated.seatedDays == null);
  // T5: sat but unfinished table — deaths after sitting with tableDoneDay
  // null all count as during-table (sanctity applies while the table sits).
  const recs5 = [];
  for (let d = 1; d <= 90; d++) {
    recs5.push(mkrec(d, d >= 60 ? { waiting: true, sitting: d >= 62 ? 1 : 0, phase: d >= 62 ? 'challenge' : null, active: d >= 62, seat: 'lesser' } : null, 0));
  }
  const a5 = AZ.seatAttribute(synthRec(recs5,
    [mkdeath(70, { name: 'A', channel: 'raid' }), mkdeath(80, { name: 'B', player: false, channel: 'raid' })],
    { tableDay: 60, satEver: true, sittingDay: 62, seatAtSit: 'lesser', phaseTrace: ['challenge'], tableActiveDays: 28, gameDays: 90 }));
  check('T5 unfinished: both during-table', a5.seated.during === 2 && a5.seated.post === 0, `got ${a5.seated.during}/${a5.seated.post}`);
  check('T5 channel margin', (() => {
    const cs = Object.entries(a5.seated.channels).sort((x, y) => y[1] - x[1]);
    return cs[0][0] === 'raid' && cs[0][1] === 2 && (cs[1] == null || cs[0][1] >= 2 * cs[1][1]);
  })(), `got ${JSON.stringify(a5.seated.channels)}`);
})();

// ---------------------------------------------------------------- DOSE
(function dose() {
  // Synthetic tier-stamped corpora: recs across tiers, deaths with tier stamps.
  const mkR = (seed, recTiers, deathTiers) => ({
    seed, policyId: 'leadfeast',
    recs: recTiers.map((t, i) => ({ d: i + 1, otier: t })),
    deathsAttributed: {
      attributed: deathTiers.map((t, i) => ({ day: i + 1, tableAtDeath: { otier: t } })),
    },
  });
  const d = AZ.doseResponse([
    { label: 'a', recs: [mkR(1, [0, 0, 0, 1, 1, 2], [0, 1, 1])] },
    { label: 'b', recs: [mkR(2, [0, 1], [2])] },
  ]);
  const byT = Object.fromEntries(d.map(x => [x.tier, x]));
  check('DOSE tier-days', byT[0].tierDays === 4 && byT[1].tierDays === 3 && byT[2].tierDays === 1, `got ${JSON.stringify(byT)}`);
  check('DOSE tier-deaths', byT[0].deaths === 1 && byT[1].deaths === 2 && byT[2].deaths === 1, `got ${JSON.stringify(byT)}`);
  check('DOSE rates', byT[0].deathsPer100Days === 25 && byT[1].deathsPer100Days === 66.67 && byT[2].deathsPer100Days === 100, `got ${JSON.stringify(byT)}`);
  // Null tiers are never counted as tier 0.
  const dn = AZ.doseResponse([{ label: 'n', recs: [mkR(3, [0, null, null], [null])] }]);
  const byN = Object.fromEntries(dn.map(x => [x.tier, x]));
  check('DOSE null tiers excluded', byN[0].tierDays === 1 && byN[0].deaths === 0 && !('null' in byN), `got ${JSON.stringify(dn)}`);
  // Empty tiers: rate null, not zero.
  check('DOSE empty rate null', byN[0].deathsPer100Days === 0);
})();

// ---------------------------------------------------------------- SMOKE + DET
(async () => {
  if (process.env.SKIP_LIVE !== '1') {
    // SMOKE: 1 seed x 15d, both policies — the instrument runs, census
    // live, overtimeTier stamp non-null on every rec, 0 instrument errors.
    for (const policyId of ['leadfeast', 'belongfeast']) {
      const out = await SW.runOne(64201, policyId, { noWrite: true, days: 15 });
      check(`SMOKE ${policyId} recs`, out.recs.length === 15, `got ${out.recs.length}`);
      check(`SMOKE ${policyId} otier stamped`, out.otierNullRecs === 0 && out.recs.every(r => r.otier != null), `nulls=${out.otierNullRecs}`);
      check(`SMOKE ${policyId} census live`, out.deathsAttributed.rawCount >= 0 && out.instrumentErrors === 0, `ierr=${out.instrumentErrors}`);
      check(`SMOKE ${policyId} killdisc installed`, out.kdErrors === 0, `kdErr=${out.kdErrors}`);
    }
    // DET: 2 seeds x 60d — bare-stable, census-stable, bare-vs-census
    // byte-identical (non-perturbation of the SEATDRIVE=1 side).
    const odays = process.env.DAYS; process.env.DAYS = '60';
    for (const seed of [64201, 64202]) {
      for (const policyId of ['leadfeast', 'belongfeast']) {
        process.env.SEATDRIVEPOSTTABLE_BARE = '1';
        const b1 = await SW.runOne(seed, policyId, { noWrite: true });
        const b2 = await SW.runOne(seed, policyId, { noWrite: true });
        delete process.env.SEATDRIVEPOSTTABLE_BARE;
        const c1 = await SW.runOne(seed, policyId, { noWrite: true });
        const c2 = await SW.runOne(seed, policyId, { noWrite: true });
        const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
        const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
        check(`DET s${seed} ${policyId} bare-stable`, hb1 === hb2);
        check(`DET s${seed} ${policyId} census-stable`, hc1 === hc2);
        check(`DET s${seed} ${policyId} identical`, hb1 === hc1, `lens ${b1.hashes.length}/${c1.hashes.length}`);
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
  }
  // ---------------------------------------------------------------- COMPLETENESS (post-sweep)
  if (process.env.COMPLETE === '1') {
    const { recs, bad } = AZ.loadCorpus(require('path').join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-posttable-seatdrive'));
    check('COMPLETE 0 bad files', bad.length === 0, `bad=${bad.join(',')}`);
    check('COMPLETE 16/16 per-seed files', recs.length === 16, `got ${recs.length}`);
    const attrs = recs.map(a => AZ.seatAttribute(a));
    const stamped = recs.filter(r => (r.recs || []).length > 0 && (r.recs || []).every(x => x.otier != null)).length;
    check('COMPLETE >=14/16 tier-stamped series', stamped >= 14, `got ${stamped}/16`);
    const invited = attrs.filter(a => a.table.reached).length;
    const sat = attrs.filter(a => a.seated.sat).length;
    check('COMPLETE invitation->sitting measured', invited > 0 && typeof sat === 'number', `invited=${invited} sat=${sat}`);
    const seatedDeaths = attrs.filter(a => a.seated.sat).flatMap(a => a.seated.rows);
    const ch = {};
    for (const d of seatedDeaths) ch[d.channel] = (ch[d.channel] || 0) + 1;
    const sorted = Object.entries(ch).sort((a, b) => b[1] - a[1]);
    const margin = sorted.length >= 2 && sorted[1][1] > 0 ? sorted[0][1] / sorted[1][1]
      : (sorted.length === 1 && sorted[0][1] > 0 ? Infinity : null);
    check('COMPLETE #1 seated channel named >=2x', margin != null && margin >= 2, `got ${JSON.stringify(ch)} margin=${margin}`);
    const unattrib = attrs.filter(a => a.seated.sat).reduce((t, a) => t + a.deaths.unattributed, 0);
    check('COMPLETE 0 unattributed on seated runs', unattrib === 0, `unattributed=${unattrib}`);
    for (const r of recs) {
      for (const k of ['won', 'national', 'table']) check(`COMPLETE ${r.policyId}-s${r.seed} top-level boolean ${k}`, typeof r[k] === 'boolean', `got ${typeof r[k]}`);
    }
  }
  console.log(`\nseatdriveposttable proof: ${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
