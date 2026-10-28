#!/usr/bin/env node
// test-spandraw-playpath-b.js — proof for the playpath instrument.
// (sim-spandraw-playpath-b; prereg 46afa322c.)
//
// Synthetic legs (no game load) + design-probe control leg (the
// tap-window path re-analyzes a real design-probe instance and
// must reproduce its crossing + exclusion) + census-analyzer
// consistency leg. Corpus legs run only under PLAYPATH_STRICT=1,
// which requires the full judged corpus (120 files) and asserts
// every attempted tap is span-logged and every key classified.
//
// Usage: node scripts/test-spandraw-playpath-b.js
//        PLAYPATH_STRICT=1 node scripts/test-spandraw-playpath-b.js
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { analyzeFile } = require('./analyze-spandraw-playpath-b.js');
const { censusPayload } = require('./census-spandraw-b.js');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name + (extra != null ? ' — ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra != null ? ' — ' + extra : '')); }
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'playpath-proof-'));
function writeInst(name, inst) {
  const f = path.join(tmp, name);
  fs.writeFileSync(f, JSON.stringify(inst));
  return f;
}
// Direct record seq 1, items Dried meat 12x400 + Peanuts 7x170 = 5990.
function baseInst(taps, nestEvents, direct) {
  return { seed: 1, ability: 'tracker', action: 'track', key: 'tracker.track', grantOk: true, endReason: 'survived', taps, nestEvents, directRecords: direct, mealDrawRecords: [] };
}
const directCross = [{ seq: 1, day: 2, path: 'tracker.track', items: [{ name: 'Dried meat', kcalEach: 400, units: 12, spoilDay: 31 }, { name: 'Peanuts', kcalEach: 170, units: 7, spoilDay: 61 }], totalKcal: 5990 }];

// LEG S1: crossing tap, endDay-framed internal draw, created record,
// item-matched exclusion -> PROMOTED inputs (crossed, draws, excl).
{
  const nest = [
    { evt: 1, kind: 'spanEnter', ability: 'tracker', action: 'track', day: 1, depth: 0, directBefore: 0 },
    { evt: 2, kind: 'drawEnter', day: 1, want: 5990, frames: ['Game.endDay', 'Game.villageMeal'] },
    { evt: 3, kind: 'drawExit', day: 1, want: 5990, taken: 5990, items: [{ name: 'Dried meat', kcalEach: 400, units: 12, spoilDay: 31 }, { name: 'Peanuts', kcalEach: 170, units: 7, spoilDay: 61 }] },
    { evt: 4, kind: 'spanExit', ability: 'tracker', action: 'track', day: 2, depth: 0, directBefore: 0, directAfter: 1, result: true },
  ];
  const inst = baseInst([{ tapDay: 3, outcome: 'attempted', tapResult: true, evtBefore: 0, evtAfter: 4, dayTicksBefore: 500, gameDayBefore: 1, gameDayAfter: 2, sayWindow: [] }], nest, directCross);
  const r = analyzeFile(writeInst('s1.json', inst));
  const t = r.taps[0];
  check('S1 crossing tap: span logged, crossed, endDay draw, excl 5990',
    t.spans === 1 && t.crossed === 1 && t.internalDraws === 1 && t.endDayDraws === 1 && t.exclKcal === 5990,
    `spans=${t.spans} crossed=${t.crossed} draws=${t.internalDraws} endDay=${t.endDayDraws} excl=${t.exclKcal}`);
}
// LEG S2: same-day tap, no draws, no record -> no crossing, no exclusion.
{
  const nest = [
    { evt: 1, kind: 'spanEnter', ability: 'tracker', action: 'track', day: 3, depth: 0, directBefore: 0 },
    { evt: 2, kind: 'spanExit', ability: 'tracker', action: 'track', day: 3, depth: 0, directBefore: 0, directAfter: 0, result: true },
  ];
  const inst = baseInst([{ tapDay: 3, outcome: 'attempted', tapResult: true, evtBefore: 0, evtAfter: 2, dayTicksBefore: 390, gameDayBefore: 3, gameDayAfter: 3, sayWindow: [] }], nest, []);
  const r = analyzeFile(writeInst('s2.json', inst));
  const t = r.taps[0];
  check('S2 same-day tap: no crossing, no draws, no exclusion',
    t.spans === 1 && t.crossed === 0 && t.internalDraws === 0 && t.exclKcal === 0,
    `crossed=${t.crossed} draws=${t.internalDraws} excl=${t.exclKcal}`);
}
// LEG S3: button-refused tap creates NO span and is not counted attempted.
{
  const inst = baseInst([{ tapDay: 3, outcome: 'button-refused', buttonWhy: 'Trophy Room: no kills recorded yet — hunt something first, then mark it.', dayTicksBefore: 400, gameDayBefore: 3 }], [], []);
  const r = analyzeFile(writeInst('s3.json', inst));
  check('S3 button-refused: no span, outcome preserved', r.taps[0].outcome === 'button-refused' && !('spans' in r.taps[0]), 'outcome=' + r.taps[0].outcome);
}
// LEG S4: policy span OUTSIDE the tap window is excluded.
{
  const nest = [
    { evt: 1, kind: 'spanEnter', ability: 'green_thumb', action: 'cultivate', day: 3, depth: 0, directBefore: 0 },
    { evt: 2, kind: 'spanExit', ability: 'green_thumb', action: 'cultivate', day: 3, depth: 0, directBefore: 0, directAfter: 0, result: true },
    { evt: 3, kind: 'spanEnter', ability: 'tracker', action: 'track', day: 3, depth: 0, directBefore: 0 },
    { evt: 4, kind: 'spanExit', ability: 'tracker', action: 'track', day: 3, depth: 0, directBefore: 0, directAfter: 0, result: true },
  ];
  const inst = baseInst([{ tapDay: 3, outcome: 'attempted', tapResult: true, evtBefore: 2, evtAfter: 4, dayTicksBefore: 390, gameDayBefore: 3, gameDayAfter: 3, sayWindow: [] }], nest, []);
  const r = analyzeFile(writeInst('s4.json', inst));
  check('S4 window excludes policy cultivate span', r.taps[0].spans === 1 && r.taps[0].crossed === 0, 'spans=' + r.taps[0].spans);
}
// LEG C1: design-probe control through the tap-window path.
// A real design tracker.track boundary instance must reproduce:
// crossed span, 11 internal draws, endDay-framed draws, excl 5990.
{
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-spandraw-design-b-corpus');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /tracker\.track-A/.test(f) && /s9981/.test(f)).sort() : [];
  if (!files.length) { fail++; console.log('FAIL C1 design control file missing'); }
  else {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8'));
    const inst = { seed: raw.seed, ability: raw.ability, action: raw.action, key: raw.ability + '.' + raw.action, grantOk: raw.grantOk, endReason: 'probe', taps: [{ tapDay: 1, outcome: 'attempted', tapResult: raw.result, evtBefore: 0, evtAfter: 1e9, dayTicksBefore: raw.dayTicksBefore, gameDayBefore: raw.dayBefore, gameDayAfter: raw.dayAfter, sayWindow: raw.sayLines || [] }], nestEvents: raw.nestEvents, directRecords: raw.directRecords, mealDrawRecords: raw.mealDrawRecords };
    const r = analyzeFile(writeInst('c1.json', inst));
    const t = r.taps[0];
    check('C1 design control via tap window: crossed, 11 draws, excl 5990',
      t.crossed >= 1 && t.internalDraws === 11 && t.endDayDraws >= 1 && t.exclKcal === 5990,
      `file=${files[0]} crossed=${t.crossed} draws=${t.internalDraws} endDay=${t.endDayDraws} excl=${t.exclKcal}`);
    // LEG C2: unchanged census analyzer on the same probe file.
    try {
      const cp = censusPayload(raw);
      const rows = Object.values(cp.perKey || {});
      const row = rows.find((x) => (x.key || '') === 'tracker.track') || null;
      const cls = row ? (row.classification || '') : '';
      check('C2 census analyzer consistency on probe file', /PROVEN/.test(cls), 'classification=' + cls);
    } catch (e) { fail++; console.log('FAIL C2 census analyzer threw: ' + String(e && e.message)); }
  }
}
// LEG corpus (STRICT only): full judged corpus, every attempted tap span-logged.
if (process.env.PLAYPATH_STRICT === '1') {
  const dir = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-spandraw-playpath-b-corpus');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
  check('STRICT corpus file count 120', files.length === 120, 'files=' + files.length);
  let attempted = 0, unlogged = 0, unclassified = 0;
  for (const f of files) {
    const r = analyzeFile(path.join(dir, f));
    for (const t of r.taps) {
      if (t.outcome === 'attempted') { attempted++; if (!t.spanLogged) unlogged++; }
    }
    if (!r.key) unclassified++;
  }
  check('STRICT every attempted tap span-logged', attempted > 0 && unlogged === 0, `attempted=${attempted} unlogged=${unlogged}`);
  check('STRICT every file keyed', unclassified === 0, 'unkeyed=' + unclassified);
  try {
    const out = execSync('node ' + path.join(__dirname, 'analyze-spandraw-playpath-b.js') + ' ' + dir, { encoding: 'utf8', timeout: 120000 });
    const j = JSON.parse(out);
    check('STRICT analyzer prints 15-key table', Array.isArray(j.perKey) && j.perKey.length === 15, 'keys=' + (j.perKey ? j.perKey.length : '?'));
  } catch (e) { fail++; console.log('FAIL STRICT analyzer run: ' + String(e && e.message)); }
} else {
  console.log('SKIP corpus legs (set PLAYPATH_STRICT=1 after the judged census)');
}
console.log(`\n${pass} PASS, ${fail} FAIL — verdict ${fail === 0 ? 'PROOF-GREEN' : 'PROOF-RED'}`);
process.exit(fail === 0 ? 0 : 1);
