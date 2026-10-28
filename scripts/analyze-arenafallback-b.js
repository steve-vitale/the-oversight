#!/usr/bin/env node
// analyze-arenafallback-b.js — compare before/after sweep corpora for
// sim-arenafallback-b and judge them against the prereg thresholds.
//   node scripts/analyze-arenafallback-b.js <beforeDir> <afterDir> <pilot|confirm>
// Prints per-origin counts, determinism findings, and a PASS/FAIL per clause.
// Thresholds are the prereg's: pilot arena >=14/16, per-origin >=7/8;
// confirm arena >=28/32, per-origin >=14/16; determinism 0 unintended.
'use strict';
const fs = require('fs');
const path = require('path');

const EXPECT_AFTER = {
  'arena-pit': 'the arena', 'arena-gauntlet': 'the arena',
  betrayal: 'betrayal', tableTrial: 'the table trial',
  coalition: 'the coalition arena', alien: 'a stranger', wild: 'the wild',
};
const EXPECT_BEFORE = {
  'arena-pit': 'the arena', 'arena-gauntlet': 'the arena',
  betrayal: 'the arena', tableTrial: 'the arena',
  coalition: 'the arena', alien: 'the arena', wild: 'the wild',
};

function load(dir) {
  const out = {};
  for (const fn of fs.readdirSync(dir)) {
    if (!fn.endsWith('.json')) continue;
    out[fn] = JSON.parse(fs.readFileSync(path.join(dir, fn), 'utf8'));
  }
  return out;
}
function fieldsAgree(rec, label) {
  const ok = [];
  if (!rec.deaths.length || rec.deaths[0] !== label) ok.push('playerDeath=' + JSON.stringify(rec.deaths));
  if (!rec.regDeaths.length || rec.regDeaths[0] !== label) ok.push('registerDeath=' + JSON.stringify(rec.regDeaths));
  if (!rec.fallen || rec.fallen.cause !== label) ok.push('fallen=' + JSON.stringify(rec.fallen && rec.fallen.cause));
  if (!rec.telemetry || rec.telemetry.cause !== label) ok.push('telemetry=' + JSON.stringify(rec.telemetry && rec.telemetry.cause));
  if (rec.lineage !== label) ok.push('lineage=' + JSON.stringify(rec.lineage));
  if (!rec.deathLine || !rec.deathLine.includes('is dead — ' + label)) ok.push('deathLine=' + JSON.stringify(rec.deathLine));
  return ok;
}
function stripCause(line) {
  if (!line) return line;
  return line.replace(/is dead — [^.]+/, 'is dead — CAUSE');
}
function stripRec(rec, keepCause) {
  if (!rec) return null;
  const c = Object.assign({}, rec);
  if (!keepCause) delete c.cause;
  return c;
}

const beforeDir = process.argv[2];
const afterDir = process.argv[3];
const phase = process.argv[4] || 'pilot';
if (!beforeDir || !afterDir || !['pilot', 'confirm'].includes(phase)) {
  console.error('usage: node scripts/analyze-arenafallback-b.js <beforeDir> <afterDir> <pilot|confirm>');
  process.exit(2);
}
const before = load(beforeDir);
const after = load(afterDir);
const files = Object.keys(before).sort();
const missingAfter = files.filter((f) => !after[f]);
const extraAfter = Object.keys(after).filter((f) => !before[f]);
console.log('files before=' + files.length + ' after=' + Object.keys(after).length +
  ' missingAfter=' + missingAfter.length + ' extraAfter=' + extraAfter.length);
if (missingAfter.length) console.log('MISSING-AFTER ' + missingAfter.join(','));
if (extraAfter.length) console.log('EXTRA-AFTER ' + extraAfter.join(','));

const perOrigin = {};
for (const origin of Object.keys(EXPECT_AFTER)) perOrigin[origin] = { total: 0, beforeOk: 0, afterOk: 0, afterLabelOk: 0 };
let unintended = 0;
let nonLabelDiffs = 0;
for (const fn of files) {
  const b = before[fn];
  const a = after[fn];
  if (!a) continue;
  const o = perOrigin[b.origin];
  if (!o) { console.log('UNKNOWN-ORIGIN ' + fn); continue; }
  o.total++;
  if (!b.started || b.startError) console.log('BEFORE-NOT-STARTED ' + fn + ' ' + (b.startError || ''));
  if (!a.started || a.startError) console.log('AFTER-NOT-STARTED ' + fn + ' ' + (a.startError || ''));
  const bBad = fieldsAgree(b, EXPECT_BEFORE[b.origin]);
  const aBad = fieldsAgree(a, EXPECT_AFTER[a.origin]);
  if (!bBad.length) o.beforeOk++;
  else console.log('BEFORE-FIELD-DISAGREE ' + fn + ' :: ' + bBad.join('; '));
  if (!aBad.length) { o.afterOk++; }
  else console.log('AFTER-FIELD-DISAGREE ' + fn + ' :: ' + aBad.join('; '));
  if (a.deaths.length && a.deaths[0] === EXPECT_AFTER[a.origin]) o.afterLabelOk++;
  // determinism: non-label fields must match before vs after
  const diffs = [];
  if (JSON.stringify(b.fight) !== JSON.stringify(a.fight)) diffs.push('fight');
  if (b.bearerBefore !== a.bearerBefore) diffs.push('bearer');
  if (JSON.stringify(stripRec(b.fallen)) !== JSON.stringify(stripRec(a.fallen))) diffs.push('fallen-noncause');
  if (JSON.stringify(stripRec(b.telemetry)) !== JSON.stringify(stripRec(a.telemetry))) diffs.push('telemetry-noncause');
  if (stripCause(b.deathLine) !== stripCause(a.deathLine)) diffs.push('deathLine-noncause');
  if (b.labelAtLoss !== EXPECT_BEFORE[b.origin] || a.labelAtLoss !== EXPECT_AFTER[a.origin]) diffs.push('labelAtLoss');
  if (diffs.length) { nonLabelDiffs++; console.log('NONLABEL-DIFF ' + fn + ' :: ' + diffs.join(',')); }
  // unintended label change: anything other than the declared arena->new move
  const bCause = b.deaths.length ? b.deaths[0] : null;
  const aCause = a.deaths.length ? a.deaths[0] : null;
  if (bCause !== EXPECT_BEFORE[b.origin] || (aCause !== EXPECT_AFTER[a.origin] && !(b.origin === 'wild' && aCause === 'the wild'))) {
    // handled by field checks; count only changes outside the declared map
  }
  if (bCause && aCause && bCause !== aCause && EXPECT_AFTER[b.origin] !== aCause) { unintended++; console.log('UNINTENDED-LABEL-CHANGE ' + fn + ' ' + bCause + ' -> ' + aCause); }
  if (bCause && aCause && bCause === aCause && EXPECT_AFTER[b.origin] !== bCause && b.origin !== 'wild' && !b.origin.startsWith('arena')) {
    // a fallback origin that did NOT change is a miss, not an unintended change; counted in afterOk
  }
}
console.log('--- per-origin (total / beforeFieldsOk / afterFieldsOk / afterLabelOk) ---');
for (const [origin, o] of Object.entries(perOrigin)) {
  console.log(origin + ': ' + o.total + ' / ' + o.beforeOk + ' / ' + o.afterOk + ' / ' + o.afterLabelOk);
}
const arenaTotal = perOrigin['arena-pit'].total + perOrigin['arena-gauntlet'].total;
const arenaOk = perOrigin['arena-pit'].afterOk + perOrigin['arena-gauntlet'].afterOk;
console.log('ARENA total=' + arenaTotal + ' afterFieldsOk=' + arenaOk);
console.log('DETERMINISM nonLabelDiffs=' + nonLabelDiffs + ' unintendedLabelChanges=' + unintended);
const arenaBar = phase === 'pilot' ? 14 : 28;
const originBar = phase === 'pilot' ? 7 : 14;
let fail = 0;
function clause(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + ' :: ' + detail);
  if (!cond) fail++;
}
clause('ARENA-' + phase.toUpperCase(), arenaOk >= arenaBar, arenaOk + '/' + arenaTotal + ' >= ' + arenaBar);
for (const origin of ['betrayal', 'tableTrial', 'coalition', 'alien']) {
  const o = perOrigin[origin];
  clause('ORIGIN-' + origin + '-' + phase.toUpperCase(), o.afterOk >= originBar, o.afterOk + '/' + o.total + ' >= ' + originBar);
}
clause('WILD-CONTROL', perOrigin.wild.afterOk >= originBar, perOrigin.wild.afterOk + '/' + perOrigin.wild.total + ' >= ' + originBar);
clause('DETERMINISM', nonLabelDiffs === 0 && unintended === 0, 'nonLabelDiffs=' + nonLabelDiffs + ' unintended=' + unintended);
clause('BEFORE-SANITY', Object.values(perOrigin).every((o) => o.beforeOk === o.total), 'all before instances match pre-change labels');
console.log(fail === 0 ? 'VERDICT PASS' : 'VERDICT FAIL (' + fail + ' clauses)');
process.exit(fail ? 1 : 0);
