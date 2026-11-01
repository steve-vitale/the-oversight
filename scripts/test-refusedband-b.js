#!/usr/bin/env node
// test-refusedband-b.js — pure proof test for the refusedband analyzer.
// No game load, no RNG, no file writes. Covers the prereg definitions:
// refusal counting (travel-refused only), hop split, bucket sources
// (woodcarry first, creekremedy fallback), gate-2 fraction incl. the
// D=0 case, instrument gate cases, narration detection, and the
// band bar. Exits non-zero on any failure.
'use strict';
const assert = require('assert');
const { classifyRefusal, gateOf, classifySeedRefused, analyzeDir, hopTypeOf } = require('./analyze-refusedband-b');
const fs = require('fs');
const os = require('os');
const path = require('path');

let n = 0;
function ok(name, cond) { n++; assert.ok(cond, name); console.log('ok ' + n + ' - ' + name); }

function eve(overrides) {
  return Object.assign({
    loopDay: 1, mapPx: 2, mapPy: 4, tile: 'forest_floor', havenPx: 4, havenPy: 4,
    eveningOutcome: 'travel-refused', ntTravel: { hopReturnKind: 'block:creek' },
    ntHavenDistance: 2, ntBefore: { mapPx: 2, mapPy: 4 },
    woodcarry: null, creekremedy: null, dayLines: ['The creek runs fast here — no crossing without a bridge or a swim.'],
  }, overrides);
}

// T1: refusal counted only on eveningOutcome === 'travel-refused'.
ok('T1 travel-refused counts', classifyRefusal(eve({})) !== null);
ok('T1 out-of-reach does not count', classifyRefusal(eve({ eveningOutcome: 'out-of-reach' })) === null);
ok('T1 completed does not count', classifyRefusal(eve({ eveningOutcome: 'completed' })) === null);
ok('T1 policy-no-record does not count', classifyRefusal(eve({ eveningOutcome: 'policy-no-record' })) === null);
ok('T1 travel-arrived-combat does not count', classifyRefusal(eve({ eveningOutcome: 'travel-arrived-combat' })) === null);
ok('T1 travel-died does not count', classifyRefusal(eve({ eveningOutcome: 'travel-died' })) === null);

// T2: hop type parsing.
ok('T2 block:creek -> creek', hopTypeOf('block:creek') === 'creek');
ok('T2 block:fallen_tree parses', hopTypeOf('block:fallen_tree') === 'fallen_tree');
ok('T2 undefined hop -> null type', hopTypeOf(undefined) === null);
ok('T2 non-block hop -> null type', hopTypeOf('completed') === null);

// T3: bucket sources — woodcarry first, creekremedy fallback, none when neither.
const wcCreek = { bucket: 'creek', hopReturnKind: 'block:creek', classification: { blockType: 'creek', probeAgrees: true, probeError: null, isCreek: true, blockedTile: { x: 3, y: 4 } } };
ok('T3 woodcarry bucket wins', classifyRefusal(eve({ woodcarry: wcCreek })).bucket === 'creek');
ok('T3 woodcarry source recorded', classifyRefusal(eve({ woodcarry: wcCreek })).source === 'woodcarry');
ok('T3 woodcarry probe fields carried', classifyRefusal(eve({ woodcarry: wcCreek })).blockType === 'creek');
const crCreek = { hopReturnKind: 'block:creek', blockType: 'creek', probeAgrees: true, probeError: null, isCreek: true, blockedTile: { x: 3, y: 4 } };
ok('T3 creekremedy bucket creek', classifyRefusal(eve({ creekremedy: crCreek })).bucket === 'creek');
ok('T3 creekremedy source recorded', classifyRefusal(eve({ creekremedy: crCreek })).source === 'creekremedy');
const crDisagree = { hopReturnKind: 'block:creek', blockType: 'fallen_tree', probeAgrees: false, probeError: null, isCreek: false, blockedTile: { x: 3, y: 4 } };
ok('T3 creek hop + probe disagree -> unclassified', classifyRefusal(eve({ creekremedy: crDisagree })).bucket === 'unclassified');
const crOther = { hopReturnKind: 'block:fallen_tree', blockType: 'fallen_tree', probeAgrees: true, probeError: null, isCreek: false, blockedTile: { x: 3, y: 4 } };
ok('T3 non-creek refusal -> other-refused', classifyRefusal(eve({ ntTravel: { hopReturnKind: 'block:fallen_tree' }, creekremedy: crOther })).bucket === 'other-refused');
ok('T3 no source -> bucket null', classifyRefusal(eve({})).bucket === null);

// T4: narration detection (engine block line in dayLines).
ok('T4 creek refusal narrated', classifyRefusal(eve({})).narrated === true);
ok('T4 refusal without block line not narrated', classifyRefusal(eve({ dayLines: ['You camp wild tonight.'] })).narrated === false);
ok('T4 fallen_tree line matches its type', classifyRefusal(eve({ ntTravel: { hopReturnKind: 'block:fallen_tree' }, dayLines: ['A fallen tree blocks the path.'] })).narrated === true);

// T5: instrument gate.
function inst(decisions, evenings, opts) {
  return Object.assign({ seed: 17601, policy: 'bare', days: 30, daysAlive: 30, endReason: 'days', errCount: 0, decisions, evenings }, opts || {});
}
const d30 = Array.from({ length: 30 }, (_, i) => ({ loopDay: i + 1 }));
const e30 = Array.from({ length: 30 }, (_, i) => Object.assign(eve({ loopDay: i + 1 }), { eveningOutcome: 'completed', gameOver: false }));
ok('T5 gate passes on clean 30/30', gateOf(inst(d30, e30)).pass === true);
ok('T5 gate fails on decision/evening mismatch', gateOf(inst(d30.slice(0, 29), e30)).pass === false);
ok('T5 gate fails on errs', gateOf(inst(d30, e30, { errCount: 1 })).pass === false);
const eOver = e30.slice(0, 10).map((e, i) => (i === 9 ? Object.assign({}, e, { gameOver: true, eveningOutcome: 'game-over' }) : e));
ok('T5 gate passes on early game-over with day recorded', gateOf(inst(d30.slice(0, 10), eOver, { daysAlive: 10 })).pass === true);

// T6: per-seed classification + gate-2 fraction via analyzeDir on synthetic corpora.
function seedInst(seed, refusals) {
  const evenings = [];
  for (let d = 1; d <= 30; d++) {
    const r = refusals.find((x) => x.loopDay === d);
    if (r) evenings.push(eve(Object.assign({ loopDay: d }, r)));
    else evenings.push(eve({ loopDay: d, eveningOutcome: 'completed', ntTravel: null, dayLines: [] }));
  }
  return { seed, policy: 'bare', days: 30, daysAlive: 30, endReason: 'days', errCount: 0, decisions: evenings.map((e) => ({ loopDay: e.loopDay })), evenings, woodcarryStore: null, creekremedyStore: { records: 3, errs: 0, errors: [], classified: 1, unclassified: 1, otherRefused: 1 } };
}
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'refusedband-test-'));
const s1 = seedInst(17601, [
  { loopDay: 5, creekremedy: crCreek },
  { loopDay: 6, creekremedy: crDisagree },
  { loopDay: 7, ntTravel: { hopReturnKind: 'block:fallen_tree' }, creekremedy: crOther, dayLines: ['A fallen tree blocks the path.'] },
]);
const s2 = seedInst(17602, [
  { loopDay: 9, creekremedy: crCreek },
  { loopDay: 10, creekremedy: crCreek },
]);
fs.writeFileSync(path.join(dir, 'a.json'), JSON.stringify(s1));
fs.writeFileSync(path.join(dir, 'b.json'), JSON.stringify(s2));
const c = analyzeDir(dir);
ok('T6 total refusals 5', c.totalRefusals === 5);
ok('T6 refusal seeds 2', c.seedsWithRefusals.length === 2);
ok('T6 band bar met at 5 on 2 seeds', c.bandBar === true);
ok('T6 block:creek denominator 4', c.blockCreekDenominator === 4);
ok('T6 gate-2 fraction 3/4', c.gate2Agreement === '3/4');
ok('T6 gate passes', c.gatePass === true);
ok('T6 hop split creek 4', c.hopSplit['block:creek'] === 4);
ok('T6 bucket split creek 3', c.bucketSplit.creek === 3);
ok('T6 narrated refusals counted', c.narratedRefusals === 5);

// T7: D=0 case — refusals exist, none at a creek: agreement null, band bar still judgeable.
const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'refusedband-test2-'));
const s3 = seedInst(17603, [
  { loopDay: 4, ntTravel: { hopReturnKind: 'block:fallen_tree' }, creekremedy: crOther, dayLines: ['A fallen tree blocks the path.'] },
  { loopDay: 5, ntTravel: { hopReturnKind: 'block:fallen_tree' }, creekremedy: crOther, dayLines: ['A fallen tree blocks the path.'] },
  { loopDay: 6, ntTravel: { hopReturnKind: 'block:fallen_tree' }, creekremedy: crOther, dayLines: ['A fallen tree blocks the path.'] },
]);
fs.writeFileSync(path.join(dir2, 'a.json'), JSON.stringify(s3));
const c2 = analyzeDir(dir2);
ok('T7 D=0 agreement null', c2.gate2Agreement === null && c2.gate2AgreementValue === null);
ok('T7 D=0 denominator 0', c2.blockCreekDenominator === 0);
ok('T7 band bar false below 5', c2.bandBar === false);

// T8: control cell — policy-no-record evenings never count.
const dir3 = fs.mkdtempSync(path.join(os.tmpdir(), 'refusedband-test3-'));
const ctrl = { seed: 17601, policy: 'deed-seeking', days: 30, daysAlive: 30, endReason: 'days', errCount: 0,
  decisions: d30, evenings: e30.map((e) => Object.assign({}, e, { eveningOutcome: 'policy-no-record', ntTravel: null })), woodcarryStore: null, creekremedyStore: null };
fs.writeFileSync(path.join(dir3, 'a.json'), JSON.stringify(ctrl));
const c3 = analyzeDir(dir3);
ok('T8 control 0 refusals', c3.totalRefusals === 0);
ok('T8 control band bar false', c3.bandBar === false);

console.log('test-refusedband-b: ' + n + '/' + n + ' pure checks passed');
