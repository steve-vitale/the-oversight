// Proof test for the r118 outing-chain analyzer (Q1 PRIMARY instrument).
// Runs the REAL analyzer (child process) on (a) synthetic fixtures and
// (b) the r117 corpus as calibration, and asserts the shape counts.
// Fixtures (one census file per corpus, one favor each):
//   completes-far: waited, departed, together-ok on a FAR node (d=4) with
//     haul 300, deliver-day ok, kept — CHAIN-COMPLETES-FAR.
//   h-know: departed, together-ok on a FAR node with 0 edible kcal
//     (hands-empty press), no haul anywhere — H-KNOW.
//   h-hop: departed, evening-blocked with far nodes unreached, no
//     together-ok at all — H-HOP.
//   delivery-rung: departed, together-ok near with haul 200 in the snap,
//     no deliver ever — DELIVERY-RUNG.
// Calibration (r117 corpus, reported never re-scored — the r117 panel
// verdicts stand): favors=38 kept=0 broken=11 open=27 waits=4 departs=9
// togetherOkFavors=2 haulFavors=0 deliverFavors=0 farHaul=0 nearHaul=0
// unknownHaul=0 unknownOk=3 handsEmpty=3 pressFail=19; RUNGS asked=29
// waited=0 departed=7 together-ok=2 haul>0=0 deliver=0 kept=0; verdict
// OPEN (the r117 corpus carries no far-node data, so it cannot distinguish
// H-KNOW from H-HOP — the r118 panel is the fresh-seed verdict either way).
// Usage: node scripts/test-landing-r118-outingchain.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { execSync } = require('child_process');

const ANALYZER = path.join(__dirname, 'analyze-landing-r118-outingchain.js');
const GOAL = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-07');

function runAnalyzer(dir) {
  const out = execSync(`node ${ANALYZER} ${dir}`, { encoding: 'utf8' });
  const summary = /OUTINGCHAIN SUMMARY: ([^\n]+)/.exec(out);
  const together = /OUTINGCHAIN TOGETHER: ([^\n]+)/.exec(out);
  const rungs = /OUTINGCHAIN RUNGS: ([^\n]+)/.exec(out);
  const verdict = /OUTINGCHAIN: (CHAIN-COMPLETES-FAR|CHAIN-COMPLETES-NEAR|DELIVERY-RUNG|H-KNOW|H-HOP|CONTRADICTION|OPEN)\b/.exec(out);
  assert(summary, 'no SUMMARY line from analyzer on ' + dir);
  assert(verdict, 'no verdict line from analyzer on ' + dir);
  const kv = (s) => {
    const m = {};
    for (const part of s.split(' ')) { const [k, v] = part.split('='); if (k) m[k] = Number(v); }
    return m;
  };
  return { summary: kv(summary[1]), together: together ? kv(together[1]) : {}, rungs: rungs ? kv(rungs[1]) : {}, verdict: verdict[1], out };
}

function snap(vid, name, favorId, day, opts) {
  return {
    vid, name, favorState: opts.state || 'promised',
    favorId, promiseFavorId: opts.promiseFavorId ?? null,
    promiseMaker: null, promisedDay: opts.askedDay ?? day, askedDay: opts.askedDay ?? day,
    meetDay: null, deadline: null, promiseKept: opts.kept ?? null,
    dayPart: 0, waiting: !!opts.waiting,
    run: opts.run || null,
  };
}
function census(seed, series, attempts, opps) {
  return {
    seed, series,
    r41Summary: {
      outingAttempts: attempts || [],
      outingOpps: opps || [],
      outingTeleDepart: 0, outingTeleTogether: 0, outingTeleReturn: 0, outingTeleTalk: 0,
    },
  };
}
function writeCorpus(dir, seed, c) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `journey-landing-r62-census-${seed}.json`), JSON.stringify(c));
}

// (a) Fixtures.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'outingchain-r118-'));

// completes-far
{
  const dir = path.join(tmp, 'completes-far');
  const fav = 'favor-adaeze-5-1';
  const c = census(99991, [
    { day: 5, outing: [snap('adaeze', 'Adaeze', fav, 5, { state: 'promised', askedDay: 4, waiting: true, run: { startedDay: 5, forageCount: 0, playerKcal: 0, partnerKcal: 0, deliveredKcal: 0, returned: false } })] },
    { day: 6, outing: [snap('adaeze', 'Adaeze', fav, 6, { state: 'fulfilled', askedDay: 4, promiseFavorId: fav, kept: true, run: { startedDay: 5, forageCount: 1, playerKcal: 150, partnerKcal: 150, deliveredKcal: 300, returned: true } })] },
  ], [
    { day: 5, vid: 'adaeze', name: 'Adaeze', kind: 'depart', ok: true, line: 'falls in beside you' },
    { day: 6, vid: 'adaeze', name: 'Adaeze', kind: 'together', via: 'evening', ok: true, line: 'holds up their share', forageCount: 1, playerKcal: 150, partnerKcal: 150, node: { x: 5, y: 4, d: 4 } },
    { day: 6, vid: 'adaeze', name: 'Adaeze', kind: 'deliver-day', via: 'evening', ok: true, line: 'You unload both shares' },
  ], [
    { day: 5, vid: 'adaeze', name: 'Adaeze', waiting: true, favorId: fav },
  ]);
  writeCorpus(dir, 99991, c);
  const r = runAnalyzer(dir);
  assert.strictEqual(r.summary.kept, 1, 'completes-far: kept 1, got ' + JSON.stringify(r.summary));
  assert.strictEqual(r.summary.farHaul, 1, 'completes-far: farHaul 1, got ' + JSON.stringify(r.summary));
  assert.strictEqual(r.summary.waits, 1, 'completes-far: waits 1, got ' + JSON.stringify(r.summary));
  assert.strictEqual(r.verdict, 'CHAIN-COMPLETES-FAR', 'completes-far verdict, got ' + r.verdict);
}

// h-know
{
  const dir = path.join(tmp, 'h-know');
  const fav = 'favor-bruno-5-1';
  const c = census(99992, [
    { day: 5, outing: [snap('bruno', 'Bruno', fav, 5, { state: 'promised', askedDay: 4, run: { startedDay: 5, forageCount: 0, playerKcal: 0, partnerKcal: 0, deliveredKcal: 0, returned: false } })] },
    { day: 6, outing: [snap('bruno', 'Bruno', fav, 6, { state: 'promised', askedDay: 4, run: { startedDay: 5, forageCount: 1, playerKcal: 0, partnerKcal: 0, deliveredKcal: 0, returned: false } })] },
  ], [
    { day: 5, vid: 'bruno', name: 'Bruno', kind: 'depart', ok: true, line: 'falls in beside you' },
    { day: 6, vid: 'bruno', name: 'Bruno', kind: 'together', via: 'evening', ok: true, line: 'shrugs, hands empty of anything edible', forageCount: 1, playerKcal: 0, partnerKcal: 0, node: { x: 5, y: 4, d: 4 } },
  ], []);
  writeCorpus(dir, 99992, c);
  const r = runAnalyzer(dir);
  assert.strictEqual(r.summary.kept, 0, 'h-know: kept 0');
  assert.strictEqual(r.summary.haulFavors, 0, 'h-know: haulFavors 0');
  assert.strictEqual(r.together.farOk, 1, 'h-know: farOk 1, got ' + JSON.stringify(r.together));
  assert.strictEqual(r.together.handsEmpty, 1, 'h-know: handsEmpty 1');
  assert.strictEqual(r.verdict, 'H-KNOW', 'h-know verdict, got ' + r.verdict);
}

// h-hop
{
  const dir = path.join(tmp, 'h-hop');
  const fav = 'favor-celia-5-1';
  const c = census(99993, [
    { day: 5, outing: [snap('celia', 'Celia', fav, 5, { state: 'promised', askedDay: 4, run: { startedDay: 5, forageCount: 0, playerKcal: 0, partnerKcal: 0, deliveredKcal: 0, returned: false } })] },
    { day: 6, outing: [snap('celia', 'Celia', fav, 6, { state: 'promised', askedDay: 4, run: { startedDay: 5, forageCount: 0, playerKcal: 0, partnerKcal: 0, deliveredKcal: 0, returned: false } })] },
  ], [
    { day: 5, vid: 'celia', name: 'Celia', kind: 'depart', ok: true, line: 'falls in beside you' },
    { day: 6, vid: 'celia', name: 'Celia', kind: 'evening-blocked', via: 'evening', ok: false, line: '(5,4,d5):unreached; (4,4,d4):unreached' },
  ], []);
  writeCorpus(dir, 99993, c);
  const r = runAnalyzer(dir);
  assert.strictEqual(r.summary.kept, 0, 'h-hop: kept 0');
  assert.strictEqual(r.together.farUnreached, 2, 'h-hop: farUnreached 2, got ' + JSON.stringify(r.together));
  assert.strictEqual(r.verdict, 'H-HOP', 'h-hop verdict, got ' + r.verdict);
}

// delivery-rung
{
  const dir = path.join(tmp, 'delivery-rung');
  const fav = 'favor-dmitri-5-1';
  const c = census(99994, [
    { day: 5, outing: [snap('dmitri', 'Dmitri', fav, 5, { state: 'promised', askedDay: 4, run: { startedDay: 5, forageCount: 0, playerKcal: 0, partnerKcal: 0, deliveredKcal: 0, returned: false } })] },
    { day: 6, outing: [snap('dmitri', 'Dmitri', fav, 6, { state: 'promised', askedDay: 4, run: { startedDay: 5, forageCount: 2, playerKcal: 120, partnerKcal: 80, deliveredKcal: 0, returned: false } })] },
  ], [
    { day: 5, vid: 'dmitri', name: 'Dmitri', kind: 'depart', ok: true, line: 'falls in beside you' },
    { day: 6, vid: 'dmitri', name: 'Dmitri', kind: 'together', ok: true, line: 'holds up their share', forageCount: 2, playerKcal: 120, partnerKcal: 80, node: { x: 4, y: 3, d: 2 } },
    { day: 6, vid: 'dmitri', name: 'Dmitri', kind: 'deliver-blocked', ok: false, line: 'Move next to your partner, on the same side of the Haven door.' },
  ], []);
  writeCorpus(dir, 99994, c);
  const r = runAnalyzer(dir);
  assert.strictEqual(r.summary.haulFavors, 1, 'delivery-rung: haulFavors 1');
  assert.strictEqual(r.summary.deliverFavors, 0, 'delivery-rung: deliverFavors 0');
  assert.strictEqual(r.summary.nearHaul, 1, 'delivery-rung: nearHaul 1');
  assert.strictEqual(r.verdict, 'DELIVERY-RUNG', 'delivery-rung verdict, got ' + r.verdict);
}

// h-hop-stock (R121 FIX): same H-HOP shape, but the evening-blocked line
// carries the r119+ nodeFails format with tile stock — "(5,4,d5,s47):
// unreached". Before the fix the parse silently dropped these entries and
// farUnreached read 0 on the r119/r120 panels (true r120 count: 11).
{
  const dir = path.join(tmp, 'h-hop-stock');
  const fav = 'favor-elsa-5-1';
  const c = census(99995, [
    { day: 5, outing: [snap('elsa', 'Elsa', fav, 5, { state: 'promised', askedDay: 4, run: { startedDay: 5, forageCount: 0, playerKcal: 0, partnerKcal: 0, deliveredKcal: 0, returned: false } })] },
    { day: 6, outing: [snap('elsa', 'Elsa', fav, 6, { state: 'promised', askedDay: 4, run: { startedDay: 5, forageCount: 0, playerKcal: 0, partnerKcal: 0, deliveredKcal: 0, returned: false } })] },
  ], [
    { day: 5, vid: 'elsa', name: 'Elsa', kind: 'depart', ok: true, line: 'falls in beside you' },
    { day: 6, vid: 'elsa', name: 'Elsa', kind: 'evening-blocked', via: 'evening', ok: false, line: '(5,4,d5,s47):unreached; (4,4,d4,s42):unreached' },
  ], []);
  writeCorpus(dir, 99995, c);
  const r = runAnalyzer(dir);
  assert.strictEqual(r.summary.kept, 0, 'h-hop-stock: kept 0');
  assert.strictEqual(r.together.farUnreached, 2, 'h-hop-stock: farUnreached 2, got ' + JSON.stringify(r.together));
  assert.strictEqual(r.verdict, 'H-HOP', 'h-hop-stock verdict, got ' + r.verdict);
}

// (b) Calibration on the r117 corpus.
{
  const r = runAnalyzer(path.join(GOAL, 'landing-r117'));
  assert.strictEqual(r.summary.seeds, 10, 'r117 calibration: seeds 10');
  assert.strictEqual(r.summary.favors, 38, 'r117 calibration: favors 38, got ' + JSON.stringify(r.summary));
  assert.strictEqual(r.summary.kept, 0, 'r117 calibration: kept 0');
  assert.strictEqual(r.summary.broken, 11, 'r117 calibration: broken 11');
  assert.strictEqual(r.summary.open, 27, 'r117 calibration: open 27');
  assert.strictEqual(r.summary.waits, 4, 'r117 calibration: waits 4');
  assert.strictEqual(r.summary.departs, 9, 'r117 calibration: departs 9');
  assert.strictEqual(r.summary.togetherOkFavors, 2, 'r117 calibration: togetherOkFavors 2');
  assert.strictEqual(r.summary.haulFavors, 0, 'r117 calibration: haulFavors 0');
  assert.strictEqual(r.summary.farHaul, 0, 'r117 calibration: farHaul 0');
  assert.strictEqual(r.summary.nearHaul, 0, 'r117 calibration: nearHaul 0');
  assert.strictEqual(r.summary.unknownHaul, 0, 'r117 calibration: unknownHaul 0');
  assert.strictEqual(r.together.unknownOk, 3, 'r117 calibration: unknownOk 3');
  assert.strictEqual(r.together.handsEmpty, 3, 'r117 calibration: handsEmpty 3');
  assert.strictEqual(r.together.pressFail, 19, 'r117 calibration: pressFail 19');
  assert.strictEqual(r.rungs.asked, 29, 'r117 calibration: rung asked 29');
  assert.strictEqual(r.rungs.departed, 7, 'r117 calibration: rung departed 7');
  assert.strictEqual(r.rungs['together-ok'], 2, 'r117 calibration: rung together-ok 2');
  assert.strictEqual(r.rungs['haul>0'], 0, 'r117 calibration: rung haul>0 0');
  assert.strictEqual(r.verdict, 'OPEN', 'r117 calibration verdict OPEN, got ' + r.verdict);
}

console.log('OUTINGCHAIN PROOF: fixtures (completes-far, h-know, h-hop, h-hop-stock, delivery-rung) + r117 calibration PASS');

// (c) Calibration on the r120 corpus (R121 FIX: farUnreached is 11, not 0 —
// the pre-fix parse dropped every r119+ "(x,y,dN,sN):unreached" entry).
// Reported, never re-scored — the r120 panel verdicts stand.
{
  const GOAL120 = path.join(process.env.HOME || '/home/hatch',
    'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-09');
  const r = runAnalyzer(path.join(GOAL120, 'landing-r120'));
  assert.strictEqual(r.summary.seeds, 10, 'r120 calibration: seeds 10');
  assert.strictEqual(r.summary.favors, 32, 'r120 calibration: favors 32, got ' + JSON.stringify(r.summary));
  assert.strictEqual(r.summary.kept, 1, 'r120 calibration: kept 1');
  assert.strictEqual(r.summary.broken, 7, 'r120 calibration: broken 7');
  assert.strictEqual(r.summary.open, 24, 'r120 calibration: open 24');
  assert.strictEqual(r.summary.waits, 5, 'r120 calibration: waits 5');
  assert.strictEqual(r.summary.departs, 6, 'r120 calibration: departs 6');
  assert.strictEqual(r.summary.togetherOkFavors, 4, 'r120 calibration: togetherOkFavors 4');
  assert.strictEqual(r.summary.haulFavors, 2, 'r120 calibration: haulFavors 2');
  assert.strictEqual(r.summary.farHaul, 1, 'r120 calibration: farHaul 1');
  assert.strictEqual(r.together.farOk, 7, 'r120 calibration: farOk 7');
  assert.strictEqual(r.together.nearOk, 2, 'r120 calibration: nearOk 2');
  assert.strictEqual(r.together.handsEmpty, 7, 'r120 calibration: handsEmpty 7');
  assert.strictEqual(r.together.pressFail, 7, 'r120 calibration: pressFail 7');
  assert.strictEqual(r.together.farUnreached, 11, 'r120 calibration: farUnreached 11, got ' + JSON.stringify(r.together));
  assert.strictEqual(r.together.nearUnreached, 4, 'r120 calibration: nearUnreached 4');
  assert.strictEqual(r.rungs.asked, 26, 'r120 calibration: rung asked 26');
  assert.strictEqual(r.rungs.kept, 1, 'r120 calibration: rung kept 1');
  assert.strictEqual(r.verdict, 'CHAIN-COMPLETES-FAR', 'r120 calibration verdict, got ' + r.verdict);
}

console.log('OUTINGCHAIN PROOF: r120 calibration PASS (farUnreached 11, nearUnreached 4, pressFail 7)');
