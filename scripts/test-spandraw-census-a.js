#!/usr/bin/env node
// test-spandraw-census-a.js — proof for the census-a instrument.
// (sim-spandraw-census-a; prereg committed as 336f83903 BEFORE any
// judged sim.)
//
// DET-GATE (the instrument, proven before the census is judged):
// the census counts a known cultivate day-crossing span correctly
// (9954 replay -> PROVEN, 3,820 kcal) and a non-crossing span as
// non-crossing (synthetic S2 + synthetic cultivate C4).
//
// Synthetic legs (no game load) + design-probe control leg (the
// tap-window path re-analyzes a real design-probe instance and
// must reproduce its crossing + exclusion) + 9954 replay control
// + census-analyzer consistency legs. Corpus legs run only under
// CENSUS_STRICT=1, which requires both judged corpora (LEG 1: 8
// census files; LEG 2: 120 playpath files) and asserts every
// attempted tap is span-logged and every key classified.
//
// Usage: node scripts/test-spandraw-census-a.js
//        CENSUS_STRICT=1 node scripts/test-spandraw-census-a.js
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
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'census-a-proof-'));
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

// LEG S1 (DET-GATE, crossing): crossing tap, endDay-framed internal
// draw, created record, item-matched exclusion -> crossed, draws, excl.
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
  check('S1 crossing tap counted: span logged, crossed, endDay draw, excl 5990',
    t.spans === 1 && t.crossed === 1 && t.internalDraws === 1 && t.endDayDraws === 1 && t.exclKcal === 5990,
    `spans=${t.spans} crossed=${t.crossed} draws=${t.internalDraws} endDay=${t.endDayDraws} excl=${t.exclKcal}`);
}
// LEG S2 (DET-GATE, non-crossing): same-day tap, no draws, no record.
{
  const nest = [
    { evt: 1, kind: 'spanEnter', ability: 'tracker', action: 'track', day: 3, depth: 0, directBefore: 0 },
    { evt: 2, kind: 'spanExit', ability: 'tracker', action: 'track', day: 3, depth: 0, directBefore: 0, directAfter: 0, result: true },
  ];
  const inst = baseInst([{ tapDay: 3, outcome: 'attempted', tapResult: true, evtBefore: 0, evtAfter: 2, dayTicksBefore: 390, gameDayBefore: 3, gameDayAfter: 3, sayWindow: [] }], nest, []);
  const r = analyzeFile(writeInst('s2.json', inst));
  const t = r.taps[0];
  check('S2 non-crossing tap counted as non-crossing: no crossing, no draws, no exclusion',
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
// LEG C3 (DET-GATE, cultivate): the 9954 belongseek replay control
// still classifies cultivate as PROVEN with 3,820 kcal exclusions.
{
  const f = path.join(__dirname, '..', 'evidence', '2026-10-27', 'sim-9954cultnest-b-replay', '9954cultnest-b-belongseek-nofeast-s9954.json');
  if (!fs.existsSync(f)) { fail++; console.log('FAIL C3 9954 replay file missing'); }
  else {
    try {
      const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
      const cp = censusPayload(raw);
      const rows = Object.values(cp.perKey || {});
      const row = rows.find((x) => (x.key || '') === 'green_whisper.cultivate') || null;
      const excl = row ? (row.exclusionsKcal || 0) : 0;
      const cls = row ? (row.classification || '') : '';
      check('C3 9954 replay control: cultivate PROVEN at 3,820 kcal',
        /PROVEN/.test(cls) && excl === 3820, `key=${row ? row.key : '?'} classification=${cls} excl=${excl}`);
    } catch (e) { fail++; console.log('FAIL C3 9954 replay threw: ' + String(e && e.message)); }
  }
}
// LEG C4 (DET-GATE, cultivate non-crossing): synthetic same-day
// cultivate span with no draws and no record -> NO-DAY-CROSSING.
{
  const nest = [
    { evt: 1, kind: 'spanEnter', ability: 'green_thumb', action: 'cultivate', day: 8, depth: 0, directBefore: 10 },
    { evt: 2, kind: 'spanExit', ability: 'green_thumb', action: 'cultivate', day: 8, depth: 0, directBefore: 10, directAfter: 10, result: true },
  ];
  const payload = { seed: 47001, nestEvents: nest, directRecords: [], mealDrawRecords: [] };
  const cp = censusPayload(payload);
  const row = (Object.values(cp.perKey || []).find((x) => (x.key || '') === 'green_thumb.cultivate')) || null;
  check('C4 synthetic same-day cultivate: NO-DAY-CROSSING, zero exclusions',
    !!row && row.classification === 'NO-DAY-CROSSING' && row.exclusionsKcal === 0,
    `classification=${row ? row.classification : '?'} excl=${row ? row.exclusionsKcal : '?'}`);
}
// LEG corpus (STRICT only): both judged corpora complete, every
// attempted tap span-logged, every key classified.
if (process.env.CENSUS_STRICT === '1') {
  const leg1 = path.join(__dirname, '..', 'evidence', '2026-11-06', 'sim-spandraw-census-a-corpus');
  const leg2 = path.join(__dirname, '..', 'evidence', '2026-11-06', 'sim-spandraw-census-a-playpath');
  const f1 = fs.existsSync(leg1) ? fs.readdirSync(leg1).filter((f) => f.endsWith('.json')).sort() : [];
  const f2 = fs.existsSync(leg2) ? fs.readdirSync(leg2).filter((f) => f.endsWith('.json')).sort() : [];
  check('STRICT LEG 1 corpus file count 8', f1.length === 8, 'files=' + f1.length);
  let leg1Bad = 0;
  for (const f of f1) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(leg1, f), 'utf8'));
      if (!Array.isArray(p.nestEvents) || !Array.isArray(p.directRecords) || !Array.isArray(p.mealDrawRecords)) leg1Bad++;
    } catch (e) { leg1Bad++; }
  }
  check('STRICT LEG 1 every payload carries nestEvents/directRecords/mealDrawRecords', leg1Bad === 0, 'bad=' + leg1Bad);
  check('STRICT LEG 2 corpus file count 120', f2.length === 120, 'files=' + f2.length);
  let attempted = 0, unlogged = 0, unclassified = 0;
  for (const f of f2) {
    const r = analyzeFile(path.join(leg2, f));
    for (const t of r.taps) {
      if (t.outcome === 'attempted') { attempted++; if (!t.spanLogged) unlogged++; }
    }
    if (!r.key) unclassified++;
  }
  check('STRICT LEG 2 every attempted tap span-logged', attempted > 0 && unlogged === 0, `attempted=${attempted} unlogged=${unlogged}`);
  check('STRICT LEG 2 every file keyed', unclassified === 0, 'unkeyed=' + unclassified);
  try {
    const out = execSync('node ' + path.join(__dirname, 'analyze-spandraw-playpath-b.js') + ' ' + leg2, { encoding: 'utf8', timeout: 120000 });
    const j = JSON.parse(out);
    check('STRICT analyzer prints 15-key table', Array.isArray(j.perKey) && j.perKey.length === 15, 'keys=' + (j.perKey ? j.perKey.length : '?'));
    const positions = [];
    for (const row of (j.perKey || [])) for (const p of (row.tapPositions || [])) positions.push(p);
    positions.sort((a, b) => a - b);
    const med = positions.length ? positions[Math.floor(positions.length / 2)] : null;
    check('STRICT tap-position distribution published', positions.length > 0 && med != null,
      `n=${positions.length} min=${positions[0]} median=${med} max=${positions[positions.length - 1]}`);
  } catch (e) { fail++; console.log('FAIL STRICT analyzer run: ' + String(e && e.message)); }
  try {
    const out = execSync('node ' + path.join(__dirname, 'census-spandraw-b.js') + ' ' + leg1, { encoding: 'utf8', timeout: 120000 });
    const j = JSON.parse(out);
    const keys = Object.keys(j.keys || {});
    check('STRICT LEG 1 analyzer classifies every fired key', keys.length >= 1 && keys.every((k) => !!(j.keys[k].classification)),
      'keys=' + keys.join(','));
    check('STRICT LEG 1 wall rows 8', (j.wall && j.wall.seeds) === 8, 'seeds=' + (j.wall ? j.wall.seeds : '?'));
  } catch (e) { fail++; console.log('FAIL STRICT LEG 1 analyzer run: ' + String(e && e.message)); }
} else {
  console.log('SKIP corpus legs (set CENSUS_STRICT=1 after the judged census)');
}
console.log(`\n${pass} PASS, ${fail} FAIL — verdict ${fail === 0 ? 'PROOF-GREEN' : 'PROOF-RED'}`);
process.exit(fail === 0 ? 0 : 1);
