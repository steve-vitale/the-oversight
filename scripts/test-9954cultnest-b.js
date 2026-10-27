#!/usr/bin/env node
// test-9954cultnest-b.js — proof for sim-cultnest-b (prereg:
// evidence/2026-10-27/sim-cultnest-b-prereg.md). Judges ONLY the
// nesting question: do meal pantryDraw seq 466 + 474 execute inside
// the green_whisper.cultivate useAbility span that creates direct
// record seq 124? Exit 0 for NESTED or NOT-NESTED (both are GO
// outcomes in opposite directions); exit 1 for INCONCLUSIVE.
// No jest. No src/js touched. No analyzer/ledger code touched.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const cult = read('evidence/2026-10-27/sim-9954cultnest-b-replay/9954cultnest-b-belongseek-nofeast-s9954.json');
const per = read('evidence/2026-10-27/sim-9954perstack-b-replay/9954perstack-b-belongseek-nofeast-s9954.json');
const raid = read('evidence/2026-10-27/sim-raidcallers-b-corpus/raidcallers-b-belongseek-nofeast-s9954.json');
let pass = 0, fail = 0;
const fails = [];
function check(name, ok, extra) {
  if (ok) { pass++; }
  else { fail++; fails.push(name + (extra ? ' :: ' + extra : '')); }
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra && !ok ? ' :: ' + extra : ''));
}
function deepEq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function normRaid(recs) {
  // stackTop normalization (9954trace arm, same class): stackTop
  // embeds the absolute worktree path, so replays from different
  // worktrees (sim-9954perstack-b vs sim-cultnest-b) differ in the
  // path segment, and the 300-char truncation window shifts with
  // it. Normalize the worktree segment out, then compare on the
  // common length; every non-stackTop field must deep-equal.
  return (recs || []).map((r) => {
    const c = Object.assign({}, r);
    if (typeof c.stackTop === 'string') c.stackTop = c.stackTop.replace(/workspace\/worktrees\/[^/]+/g, 'workspace/worktrees/WT');
    return c;
  });
}
function raidEq(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  const na = normRaid(a), nb = normRaid(b);
  for (let i = 0; i < na.length; i++) {
    for (const k of new Set([...Object.keys(na[i]), ...Object.keys(nb[i])])) {
      if (k === 'stackTop') {
        const sa = String(na[i][k] || ''), sb = String(nb[i][k] || '');
        const n = Math.min(sa.length, sb.length);
        if (sa.slice(0, n) !== sb.slice(0, n)) return false;
      } else if (JSON.stringify(na[i][k]) !== JSON.stringify(nb[i][k])) return false;
    }
  }
  return true;
}
function compareFields(a, b, exclude, label, raidNorm) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if (exclude.has(k)) continue;
    let av = a[k], bv = b[k];
    if (k === 'raidRecords') { check('fidelity ' + label + ' field ' + k, raidEq(av, bv), 'stackTop-normalized mismatch'); continue; }
    check('fidelity ' + label + ' field ' + k, deepEq(av, bv),
      'cult=' + JSON.stringify(av).slice(0, 120) + ' vs ' + JSON.stringify(bv).slice(0, 120));
  }
}
// ---- Step 0: fidelity ----
compareFields(cult, per, new Set(['ms', 'nestEvents']), 'vs-perstack', false);
compareFields(cult, raid, new Set(['ms', 'nestEvents', 'perstackOpening', 'perstackFlowCounts', 'perstackDay100StartCounts', 'perstackPostRunCounts', 'stackDays', 'stackDay100Start', 'stackDay100Snap', 'stackPostRun']), 'vs-raidcallers', true);
check('fidelity perstack-only fields absent in raidcallers corpus',
  raid.perstackOpening === undefined && raid.perstackFlowCounts === undefined);
check('fidelity cult nestEvents present and non-empty',
  Array.isArray(cult.nestEvents) && cult.nestEvents.length > 0, 'len=' + (cult.nestEvents || []).length);
// ---- Step 1: reproduction ----
const ev = cult.nestEvents || [];
const direct124s = (cult.directRecords || []).filter((r) => r.seq === 124);
check('reproduction direct seq 124 unique', direct124s.length === 1, 'count=' + direct124s.length);
const d124 = direct124s[0];
check('reproduction direct124 path/day/total', !!d124 && d124.path === 'green_whisper.cultivate' && d124.day === 36 && d124.totalKcal === 3820,
  d124 ? JSON.stringify(d124) : 'missing');
check('reproduction direct124 items exact',
  !!d124 && deepEq(d124.items, [
    { name: 'Foraged food', kcalEach: 200, units: 12, kcal: 2400, spoilDay: 34, granaryDays: null, foodState: null },
    { name: 'Fish catch', kcalEach: 20, units: 1, kcal: 20, spoilDay: 36, granaryDays: 3, foodState: null },
    { name: 'Foraged food', kcalEach: 200, units: 7, kcal: 1400, spoilDay: 36, granaryDays: null, foodState: null },
  ]));
const key = (items) => (items || []).map((i) => [i.name, i.kcalEach, i.units, i.spoilDay].join('|')).join(';');
function mealRec(seq) { return (cult.mealDrawRecords || []).find((r) => r.seq === seq && r.kind === 'pantryDraw'); }
const m466 = mealRec(466), m474 = mealRec(474);
check('reproduction meal466 exact', !!m466 && m466.day === 35 && m466.context === 'player' && m466.want === 2200 && m466.taken === 2200 &&
  key(m466.items) === 'Foraged food|200|11|34', m466 ? JSON.stringify(m466.items) : 'missing');
check('reproduction meal474 exact', !!m474 && m474.day === 35 && m474.context === 'other' && m474.want === 1468 && m474.taken === 1620 &&
  key(m474.items) === 'Foraged food|200|1|34;Fish catch|20|1|36;Foraged food|200|7|36', m474 ? JSON.stringify(m474.items) : 'missing');
// ---- Step 3: nesting judgment (evt order) ----
const spanExits = ev.filter((e) => e.kind === 'spanExit' && e.directBefore === 123 && e.directAfter === 124 && e.ability === 'green_whisper' && e.action === 'cultivate');
check('nesting seq124 span unique', spanExits.length === 1, 'count=' + spanExits.length);
const spanExit = spanExits[0];
let spanEnter = null;
if (spanExit) {
  for (let i = ev.indexOf(spanExit) - 1; i >= 0; i--) {
    if (ev[i].kind === 'spanEnter' && ev[i].ability === 'green_whisper' && ev[i].action === 'cultivate' && ev[i].depth === spanExit.depth) { spanEnter = ev[i]; break; }
    if (ev[i].kind === 'spanExit' && ev[i].depth === spanExit.depth) break;
  }
}
check('nesting seq124 spanEnter found', !!spanEnter, spanExit ? 'exit evt ' + spanExit.evt : 'no exit');
if (spanEnter && spanExit) {
  console.log('SPAN seq124: enter evt ' + spanEnter.evt + ' day ' + spanEnter.day + ' -> exit evt ' + spanExit.evt + ' day ' + spanExit.day);
}
function drawInside(rec) {
  if (!rec || !spanEnter || !spanExit) return { matches: [], inside: null };
  const rk = key(rec.items);
  const exits = ev.filter((e) => e.kind === 'drawExit' && e.want === Math.round(rec.want) && e.taken === Math.round(rec.taken) && key(e.items) === rk);
  let inside = null;
  for (const ex of exits) {
    let de = null;
    for (let i = ev.indexOf(ex) - 1; i >= 0; i--) {
      if (ev[i].kind === 'drawEnter') { de = ev[i]; break; }
      if (ev[i].kind === 'drawExit') break;
    }
    if (de) inside = (de.evt > spanEnter.evt && de.evt < spanExit.evt);
  }
  return { matches: exits, inside };
}
const r466 = drawInside(m466), r474 = drawInside(m474);
check('nesting meal466 unique nest match', r466.matches.length === 1, 'matches=' + r466.matches.length);
check('nesting meal474 unique nest match', r474.matches.length === 1, 'matches=' + r474.matches.length);
console.log('DRAW466 inside span: ' + r466.inside + ' | DRAW474 inside span: ' + r474.inside);
let verdict = 'INCONCLUSIVE';
if (fail === 0 && r466.inside === true && r474.inside === true) verdict = 'NESTED';
else if (fail === 0 && r466.inside === false && r474.inside === false) verdict = 'NOT-NESTED';
console.log('CHECKS ' + pass + '/' + (pass + fail) + ' pass');
console.log('VERDICT ' + verdict);
if (fails.length) console.log('FAILURES:\n' + fails.map((f) => ' - ' + f).join('\n'));
process.exit(verdict === 'INCONCLUSIVE' ? 1 : 0);
