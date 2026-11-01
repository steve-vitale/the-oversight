#!/usr/bin/env node
// scripts/test-seathes-a.js — proof test for sim-seathes-a (DIAG).
// Part 1: analyzer unit checks on synthetic decision rows (every
// classification class + priority order + secondary fields).
// Part 2: corpus legs re-deriving EVERY headline number of
// evidence/2026-11-01/sim-seathes-a.md from the judged corpora
// (seathes-a-perseed + rd5daily-a-perseed), independent of the
// sweep's printed verdict. No sims run here.
// Usage: node scripts/test-seathes-a.js [--corpus DIR]
// Exit 1 on any failed check; prints "PASS n/n" on success.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { classifyHeld, summarizeSeed, analyzeDir } = require('./seathes-a-sweep');

let n = 0, fails = [];
function check(name, cond, extra) {
  n++;
  if (!cond) fails.push(`${name} :: ${extra == null ? '' : JSON.stringify(extra).slice(0, 300)}`);
  else console.log(`  ok ${name}`);
}
function mkRow(over) {
  const pre = Object.assign({
    d: 170, rank: 'regional', rankOrd: 1, seat: 'lesser', ok: false,
    waiting: true, done: false, alive: true, exiled: false, joined: false,
    pv: { seat: 'lesser', ready: true, why: '', ot: 0, standingCost: 0, losses: 0 },
    block: '', access: 'remote', inside: false, tile: 'haven', tsB: {},
  }, over.pre || {});
  const post = Object.assign({ tsA: {} }, over.post || {});
  return { pre, post };
}
function runUnit() {
  console.log('== unit: classifyHeld ==');
  // RANK-GATE wins over everything (ready preview + presence ok).
  check('rank-gate priority over ready preview',
    classifyHeld(mkRow({})).class === 'RANK-GATE');
  // RANK-GATE even when the game gate would also block (combat).
  check('rank-gate priority over combat block',
    classifyHeld(mkRow({ pre: { pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1, standingCost: 4, losses: 0 }, block: 'Finish the current encounter before taking your seat.' } })).class === 'RANK-GATE');
  // PREVIEW-NULL subclasses.
  check('preview-null tablewaiting-false',
    (() => { const c = classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, waiting: false, pv: null } })); return c.class === 'PREVIEW-NULL' && c.subclass === 'TABLEWAITING-FALSE'; })());
  check('preview-null other cause (waiting true, seat lesser, day >= 90)',
    (() => { const c = classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, done: false, waiting: true, pv: null, seat: 'lesser' } })); return c.class === 'PREVIEW-NULL' && c.subclass === 'OTHER'; })());
  // ENTRY-BLOCKED subclasses.
  check('entry-blocked haven',
    (() => { const c = classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, pv: { seat: 'lesser', ready: false, why: 'Return to Haven to take your seat.', ot: 0, standingCost: 0, losses: 0 }, block: 'Return to Haven to take your seat.' } })); return c.class === 'ENTRY-BLOCKED' && c.subclass === 'HAVEN'; })());
  check('entry-blocked combat',
    (() => { const c = classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 0, standingCost: 0, losses: 0 } } })); return c.class === 'ENTRY-BLOCKED' && c.subclass === 'COMBAT'; })());
  check('entry-blocked contest',
    (() => { const c = classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, pv: { seat: 'lesser', ready: false, why: 'Finish the current contest before taking your seat.', ot: 0, standingCost: 0, losses: 0 } } })); return c.class === 'ENTRY-BLOCKED' && c.subclass === 'CONTEST'; })());
  // GUARD beats attempt accounting.
  check('guard exiled',
    classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, exiled: true } })).class === 'GUARD');
  check('guard dead scholar',
    classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, alive: false } })).class === 'GUARD');
  // SAT / ATTEMPTED-FAILED via counter diffs.
  check('sat via taken diff',
    classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, tsB: { tsSeatAttempts: 3 } }, post: { tsA: { tsSeatAttempts: 4, tsSeatTaken: 1 } } })).class === 'SAT');
  check('attempted-failed via failed diff',
    classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2, tsB: { tsSeatAttempts: 3 } }, post: { tsA: { tsSeatAttempts: 4, tsSeatFailed: 1 } } })).class === 'ATTEMPTED-FAILED');
  // Ready + guard-pass + no attempt diff = UNCLASSIFIED (must never
  // be silently classified as a block).
  check('ready-but-no-attempt is UNCLASSIFIED',
    classifyHeld(mkRow({ pre: { rank: 'national', rankOrd: 2 } })).class === 'UNCLASSIFIED');
  // Secondary fields survive on RANK-GATE days.
  check('rank-gate secondary wouldReady/wouldBlock/presenceOk',
    (() => { const c = classifyHeld(mkRow({ pre: { pv: { seat: 'lesser', ready: true, why: '', ot: 0, standingCost: 0, losses: 0 } } })); return c.wouldReady === true && c.wouldBlock === '' && c.presenceOk === true; })());
  check('rank-gate secondary combat wouldBlock',
    (() => { const c = classifyHeld(mkRow({ pre: { pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1, standingCost: 4, losses: 0 } } })); return c.wouldReady === false && /encounter/.test(c.wouldBlock); })());
}

function runCorpus() {
  console.log('== corpus: judged seathes-a-perseed ==');
  const argDir = process.argv.indexOf('--corpus') >= 0 ? process.argv[process.argv.indexOf('--corpus') + 1] : null;
  const evidDir = argDir || path.join(REPO, 'evidence', '2026-11-01', 'seathes-a-perseed');
  const a = analyzeDir(evidDir);
  const bySeed = {};
  for (const s of a.perSeed) bySeed[s.seed] = s;
  check('corpus has 8 seeds', a.perSeed.length === 8, a.perSeed.map(s => s.seed));
  check('all seriesOk', a.agg.seriesOk === 8, a.perSeed.map(s => [s.seed, s.seriesOk]));
  check('all neutrality vs rd5daily ok', a.agg.neutOk === 8, a.perSeed.map(s => [s.seed, s.neutDiffs]));
  check('zero UNCLASSIFIED held days band-wide', a.agg.unclassifiedTotal === 0, a.perSeed.map(s => [s.seed, s.unclassifiedN]));
  check('analyzer diagGo true', a.agg.diagGo === true, a.agg);
  // 78201: the headline held seed.
  const s1 = bySeed[78201];
  check('78201 heldN 16', s1 && s1.heldN === 16, s1 && s1.heldN);
  check('78201 held window 165..180', s1 && s1.heldFirst === 165 && s1.heldLast === 180, s1 && [s1.heldFirst, s1.heldLast]);
  check('78201 all held RANK-GATE', s1 && s1.classCounts['RANK-GATE'] === 16 && Object.keys(s1.classCounts).length === 1, s1 && s1.classCounts);
  check('78201 no decision-national/lesser overlap', s1 && s1.overlapN === 0, s1 && s1.overlapDays);
  check('78201 never sat', s1 && s1.satDay == null, s1 && s1.satDay);
  check('78201 won 0', s1 && s1.won === 0, s1 && s1.won);
  // 78201 held-day contents, re-derived from the daily file directly.
  const d1 = JSON.parse(fs.readFileSync(path.join(evidDir, 's78201-daily.json'), 'utf8'));
  const held1 = d1.series.filter(r => r.pre && (r.pre.seat === 'lesser' || r.pre.seat === 'full') && !r.pre.done);
  check('78201 daily file held rows 16', held1.length === 16, held1.length);
  check('78201 held days all regional', held1.every(r => r.pre.rank === 'regional'), held1.map(r => [r.pre.d, r.pre.rank]));
  check('78201 held days all standing 199 vs t5 200', held1.every(r => r.pre.standing === 199 && r.pre.t5 === 200), held1.map(r => [r.pre.d, r.pre.standing, r.pre.t5]));
  check('78201 held days all dist w5=2 only', held1.every(r => r.pre.dist && r.pre.dist.w5 === 2 && r.pre.dist.w1 === 0 && r.pre.dist.w2 === 0 && r.pre.dist.w3 === 0 && r.pre.dist.w4 === 0 && r.pre.dist.contests === 0 && r.pre.dist.crises === 0 && r.pre.dist.stage === 0 && r.pre.dist.foodDeeds === 0), held1.map(r => r.pre.dist));
  check('78201 held days all scholar on haven tile 4,4', held1.every(r => r.pre.tile === 'haven' && r.pre.px === 4 && r.pre.py === 4), held1.map(r => [r.pre.d, r.pre.tile, r.pre.px, r.pre.py]));
  check('78201 held days all access non-none (presence satisfied)', held1.every(r => r.pre.access && r.pre.access !== 'none'), held1.map(r => [r.pre.d, r.pre.access, r.pre.inside]));
  check('78201 held days preview ready on exactly 7 days (game gate not the blocker on those)', held1.filter(r => r.pre.pv && r.pre.pv.ready).length === 7, held1.map(r => [r.pre.d, r.pre.pv ? r.pre.pv.ready : null]));
  check('78201 held days combat-blocked secondary on exactly 8 days (173-180)', held1.filter(r => r.pre.pv && !r.pre.pv.ready).length === 8, held1.map(r => [r.pre.d, r.pre.pv ? r.pre.pv.why : null]));
  check('78201 decision national window 88..154 (67 days), ending 10 days before lesser start', (() => {
    const nat = d1.series.filter(r => (r.pre.rankOrd | 0) >= 2).map(r => r.pre.d);
    return nat[0] === 88 && nat[nat.length - 1] === 154 && nat.length === 67;
  })(), d1.series.filter(r => (r.pre.rankOrd | 0) >= 2).map(r => r.pre.d).slice(0, 3));
  check('78201 overtime tier 2 on day 180', (() => { const r = held1.find(x => x.pre.d === 180); return r && r.pre.pv && r.pre.pv.ot === 2 && r.pre.pv.standingCost === 8; })(), held1.find(x => x.pre.d === 180));
  check('78201 day 165 preview null (waiting false at decision moment)', (() => { const r = held1.find(x => x.pre.d === 165); return r && r.pre.pv == null && r.pre.waiting === false; })(), held1.find(x => x.pre.d === 165));
  check('78201 no seat attempts on any held day', held1.every(r => {
    const b = (r.pre.tsB || {}), t = (r.post.tsA || {});
    return ((t.tsSeatAttempts | 0) - (b.tsSeatAttempts | 0)) === 0;
  }), held1.map(r => r.post.tsA));
  // 78208: the other lesser-holding seed.
  const s8 = bySeed[78208];
  check('78208 heldN 36', s8 && s8.heldN === 36, s8 && s8.heldN);
  check('78208 held window 128..163', s8 && s8.heldFirst === 128 && s8.heldLast === 163, s8 && [s8.heldFirst, s8.heldLast]);
  check('78208 all held RANK-GATE', s8 && s8.classCounts['RANK-GATE'] === 36 && Object.keys(s8.classCounts).length === 1, s8 && s8.classCounts);
  check('78208 no decision-national/lesser overlap', s8 && s8.overlapN === 0, s8 && s8.overlapDays);
  check('78208 never sat', s8 && s8.satDay == null, s8 && s8.satDay);
  // 78206: the in-band positive control. Its 13 decision lesser days
  // are pre-sit days, not held-to-end days: 6 RANK-GATE (regional,
  // days 78-83), 6 PREVIEW-NULL/DAY-LT-90 (national but day < 90,
  // days 84-89), then SAT on day 90 — the first day all gates align.
  const s6 = bySeed[78206];
  check('78206 decision lesser days 13 (78..90)', s6 && s6.heldN === 13 && s6.heldFirst === 78 && s6.heldLast === 90, s6 && [s6.heldN, s6.heldFirst, s6.heldLast]);
  check('78206 classes RANK-GATE 6, PREVIEW-NULL 6, SAT 1', s6 && s6.classCounts['RANK-GATE'] === 6 && s6.classCounts['PREVIEW-NULL'] === 6 && s6.classCounts['SAT'] === 1, s6 && s6.classCounts);
  check('78206 sat day 90 kind lesser', s6 && s6.satDay === 90 && s6.satKind === 'lesser', s6 && [s6.satDay, s6.satKind]);
  check('78206 decision-national/lesser overlap 7 (84-90)', s6 && s6.overlapN === 7, s6 && s6.overlapDays);
  check('78206 PREVIEW-NULL subclass all DAY-LT-90', s6 && s6.held.filter(h => h.class === 'PREVIEW-NULL').every(h => h.subclass === 'DAY-LT-90'), s6 && s6.held.filter(h => h.class === 'PREVIEW-NULL'));
  // No other seed held a lesser/full seat to end without sitting:
  // only 78201/78208 held to end; 78206's rows end in a sit.
  const otherHeld = a.perSeed.filter(s => s.seed !== 78201 && s.seed !== 78208 && s.seed !== 78206 && s.heldN > 0);
  check('no seed besides 78201/78208/78206 had decision lesser days', otherHeld.length === 0, otherHeld.map(s => [s.seed, s.heldN]));
  check('band held-classified total 65 (16 + 36 + 13)', a.agg.heldTotal === 65, a.agg.heldTotal);
  // 78208 secondary splits.
  const d8 = JSON.parse(fs.readFileSync(path.join(evidDir, 's78208-daily.json'), 'utf8'));
  const held8 = d8.series.filter(r => r.pre && (r.pre.seat === 'lesser' || r.pre.seat === 'full') && !r.pre.done);
  check('78208 held days ready 31, combat-blocked 4, pv-null 1', held8.filter(r => r.pre.pv && r.pre.pv.ready).length === 31 && held8.filter(r => r.pre.pv && !r.pre.pv.ready).length === 4 && held8.filter(r => r.pre.pv == null).length === 1, held8.map(r => [r.pre.d, r.pre.pv ? r.pre.pv.ready : null]));
  check('78208 zero decision national days (post-day day-77 national was intra-day flicker)', d8.series.filter(r => (r.pre.rankOrd | 0) >= 2).length === 0, d8.series.filter(r => (r.pre.rankOrd | 0) >= 2).map(r => r.pre.d));
  check('78208 overtime tier 4 on day 163', (() => { const r = held8.find(x => x.pre.d === 163); return r && r.pre.pv && r.pre.pv.ot === 4; })(), held8.find(x => x.pre.d === 163));
  // Cross-check vs rd5daily: post-day lesser windows agree in span.
  const rd5 = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-01', 'rd5daily-a-perseed', 's78201-daily.json'), 'utf8'));
  const rd5lesser = rd5.daily.filter(r => r.s === 'lesser').map(r => r.d);
  check('78201 rd5daily post-day lesser span 165..180 agrees', rd5lesser[0] === 165 && rd5lesser[rd5lesser.length - 1] === 180 && rd5lesser.length === 16, [rd5lesser[0], rd5lesser[rd5lesser.length - 1], rd5lesser.length]);
}

runUnit();
runCorpus();
console.log(`\nPASS ${n - fails.length}/${n}`);
if (fails.length) {
  console.log('FAILURES:');
  for (const f of fails) console.log('  FAIL ' + f);
  process.exit(1);
}
