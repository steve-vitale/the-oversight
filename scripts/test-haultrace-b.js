#!/usr/bin/env node
// test-haultrace-b.js — proof for sim-haultrace-b (first traces for the
// haulinvert-b code-proven haul classes). Instrument reuse only: ZERO
// src/js changes. Re-runnable, deterministic on the committed corpora.
//
// Checks:
//   T1 static: reused sweep scripts exist; no src/js file is dirty.
//   T2 Step-1 verdicts on the committed corpora:
//     - Expedition meat FOUND: each of the 7 recorded files carries the
//       exact deposit event(s) cited in sim-haultrace-b.md.
//     - Buried cache / Genesis fruit: zero deposit events in every
//       committed *trace*.json file and in the named corpora.
//     - Custom haulLabels: every stock-event name in every committed
//       trace file is in the census set or the exclusion set.
//   T3 pilot corpus (evidence/2026-10-25/perseed-haultrace-b/):
//     8 per-seed + 8 trace files; invHaul bucket closure; tribute
//     bucket separate from aid; custom-label scan on pilot traces;
//     trace totals reproduce per-seed inv fields.
//   T4 (opt-in, --full): whole-tree literal scan of evidence/**/*.json
//     for the three literal names (slow: ~25s over ~23k files).
//
// Usage: node scripts/test-haultrace-b.js [--full]
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
let PASS = 0, FAIL = 0;
const ok = (cond, msg) => { if (cond) { PASS++; } else { FAIL++; console.error('FAIL:', msg); } };
const eq = (a, b, msg) => ok(a === b, `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);

const CENSUS = new Set(['Foraged food', 'Game meat', 'Garden harvest',
  'Fish catch', 'Expedition haul', 'Aid crew haul', 'Snared meat',
  'Hauled meat', 'Emergency hunt meat']);
const EXCL = new Set(['Weregild', "Hoarder's interest",
  'System-replicated stew', 'System-replicated (enthusiastic) meal',
  'System aid cache', 'SYNTHETIC SUSTENANCE BRICKS', 'Trial feast',
  'Refunded trade goods', 'Meal leftovers', 'Restitution',
  'Ration returned']);
const isCensus = (n) => CENSUS.has(n) || (typeof n === 'string' && n.startsWith('Pit meat ('));
const isExcl = (n) => EXCL.has(n) || (typeof n === 'string' &&
  (n.startsWith('Aid from ') || n.startsWith('Remedy stores from ')));
const isCustom = (n) => !isCensus(n) && !isExcl(n);

// ---------- T1 static ----------
for (const s of ['sweep-haulinvert-b.js', 'compare-haulinvert-b.js',
  'test-haulinvert-b.js', 'sweep-haulcount-b.js']) {
  ok(fs.existsSync(path.join(ROOT, 'scripts', s)), `reused script exists: ${s}`);
}
try {
  const dirty = execSync('git status --porcelain -- src/js', { cwd: ROOT, encoding: 'utf8' }).trim();
  eq(dirty, '', 'zero src/js changes (git status clean under src/js)');
} catch (e) { ok(false, 'git status check threw: ' + e.message); }

// ---------- helpers ----------
function loadJson(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }
function traceFilesUnder(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && /trace.*\.json$/.test(e.name)) out.push(p);
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return out.sort();
}
const EVID = path.join(ROOT, 'evidence');
const ALL_TRACES = traceFilesUnder(EVID);
ok(ALL_TRACES.length >= 40, `committed trace files found (>=40, got ${ALL_TRACES.length})`);

// ---------- T2a Expedition meat FOUND (exact events) ----------
const EXP_FOUND = [
  ['evidence/2026-10-19/journey-deepening-r20-competent-9301.json',
    [{ day: 71, name: 'Expedition meat', kcal: 500 }]],
  ['evidence/2026-10-19/journey-deepening-r20-deed-seeking-9301.json',
    [{ day: 72, name: 'Expedition meat', kcal: 500 }]],
  ['evidence/2026-10-19/journey-deepening-r21-competent-9401.json',
    [{ day: 55, name: 'Expedition meat', kcal: 75 }]],
  ['evidence/2026-10-19/perseed-killaudit/belongfeast-99103.json',
    [{ day: 151, label: 'Expedition meat', kcal: 1250 }]],
  ['evidence/2026-10-20/journey-deepening-r23-competent-9603.json',
    [{ day: 30, name: 'Expedition meat', kcal: 70 },
     { day: 70, name: 'Expedition meat', kcal: 70 }]],
  ['evidence/2026-10-20/journey-deepening-r25-competent-9802.json',
    [{ day: 38, name: 'Expedition meat', kcal: 75 },
     { day: 42, name: 'Expedition meat', kcal: 75 }]],
  ['evidence/2026-10-20/journey-deepening-r25-competent-9804.json',
    [{ day: 101, name: 'Expedition meat', kcal: 70 }]],
];
function collectDepositEvents(d, out, arrKey) {
  if (Array.isArray(d)) { for (const v of d) collectDepositEvents(v, out, arrKey); return; }
  if (d && typeof d === 'object') {
    const nm = d.name || d.label;
    if ((nm === 'Expedition meat' || nm === 'Buried cache' || nm === 'Genesis fruit') &&
        typeof d.kcal === 'number' && typeof d.day === 'number') {
      out.push({ day: d.day, name: d.name, label: d.label, kcal: d.kcal });
    }
    for (const v of Object.values(d)) collectDepositEvents(v, out, arrKey);
  }
}
for (const [rel, want] of EXP_FOUND) {
  const f = path.join(ROOT, rel);
  ok(fs.existsSync(f), `Expedition-meat FOUND file exists: ${rel}`);
  if (!fs.existsSync(f)) continue;
  const evs = [];
  collectDepositEvents(loadJson(f), evs);
  for (const w of want) {
    const key = w.label ? 'label' : 'name';
    const hit = evs.find((e) => e.day === w.day && e[key] === w[key] && e.kcal === w.kcal);
    ok(!!hit, `Expedition-meat event ${w.day}/${w[key]}/${w.kcal} in ${rel}`);
  }
}

// ---------- T2b/c/d trace-file scan: no class names, no custom labels ----------
const CLASS_NAMES = ['Expedition meat', 'Buried cache', 'Genesis fruit'];
let stockTotal = 0;
const customHits = [], classHits = [];
for (const f of ALL_TRACES) {
  let d;
  try { d = loadJson(f); } catch (e) { ok(false, `trace parses: ${f}`); continue; }
  for (const ev of (d.events || [])) {
    if (ev && ev.via === 'stock') {
      stockTotal++;
      if (isCustom(ev.name)) customHits.push(`${f} :: ${JSON.stringify(ev)}`);
      if (CLASS_NAMES.includes(ev.name)) classHits.push(`${f} :: ${JSON.stringify(ev)}`);
    }
  }
}
ok(stockTotal > 0, `stock events enumerated in traces (${stockTotal})`);
eq(customHits.length, 0, 'custom haulLabels: zero non-census, non-exclusion stock names in all traces');
if (customHits.length) customHits.slice(0, 5).forEach((h) => console.error('  custom:', h));
eq(classHits.length, 0, 'class names: zero Expedition-meat/Buried-cache/Genesis-fruit stock events in all traces');
if (classHits.length) classHits.slice(0, 5).forEach((h) => console.error('  class:', h));

// Named corpora: zero class-name mentions at all (per-seed files carry
// totals only; traces carry names and are covered above).
for (const dir of ['evidence/2026-10-25/haulinvert-b-corpus',
  'evidence/2026-10-25/haulcount-b-corpus',
  'evidence/2026-10-25/perseed-deathrow-b']) {
  const full = path.join(ROOT, dir);
  ok(fs.existsSync(full), `named corpus exists: ${dir}`);
  if (!fs.existsSync(full)) continue;
  let mentions = 0;
  for (const name of fs.readdirSync(full)) {
    if (!name.endsWith('.json')) continue;
    const txt = fs.readFileSync(path.join(full, name), 'utf8');
    for (const c of CLASS_NAMES) if (txt.includes(c)) mentions++;
  }
  eq(mentions, 0, `zero class-name mentions in ${dir}`);
}

// ---------- T3 pilot corpus ----------
const PILOT = path.join(ROOT, 'evidence/2026-10-25/perseed-haultrace-b');
ok(fs.existsSync(PILOT), 'pilot corpus dir exists');
if (fs.existsSync(PILOT)) {
  const perSeed = fs.readdirSync(PILOT).filter((n) => /^haulinvert-b-/.test(n) && !n.includes('-trace-') && /-s\d+\.json$/.test(n)).sort();
  const traces = fs.readdirSync(PILOT).filter((n) => /^haulinvert-b-trace-.*-s\d+\.json$/.test(n)).sort();
  eq(perSeed.length, 8, `pilot per-seed files (8, got ${perSeed.length})`);
  eq(traces.length, 8, `pilot trace files (8, got ${traces.length})`);
  for (const n of perSeed) {
    const d = loadJson(path.join(PILOT, n));
    ok(Number.isInteger(d.invHaulActions) && d.invHaulActions >= 0, `${n}: invHaulActions int`);
    ok(d.invHaulActions >= d.haulActions, `${n}: invHaul >= haul (superset)`);
    eq(d.pantryDepositActions, d.invHaulActions + d.invStockExcludedActions +
      d.invPiecesHomeExcludedActions + d.invPiecesForeignActions,
      `${n}: bucket closure (actions)`);
    eq(d.pantryDepositKcal, d.invHaulKcal + d.invStockExcludedKcal +
      d.invPiecesHomeExcludedKcal + d.invPiecesForeignKcal,
      `${n}: bucket closure (kcal)`);
  }
  for (const n of traces) {
    const t = loadJson(path.join(PILOT, n));
    const seed = t.seed;
    const ps = perSeed.map((x) => loadJson(path.join(PILOT, x))).find((x) => x.seed === seed);
    ok(!!ps, `${n}: matching per-seed file for seed ${seed}`);
    if (ps) {
      eq(t.totals.invHaulActions, ps.invHaulActions, `${n}: trace invHaulActions == per-seed`);
      eq(t.totals.invHaulKcal, ps.invHaulKcal, `${n}: trace invHaulKcal == per-seed`);
      eq(t.totals.invPiecesHomeExcludedActions, ps.invPiecesHomeExcludedActions,
        `${n}: trace tribute-bucket actions == per-seed`);
      eq(t.totals.invPiecesHomeExcludedKcal, ps.invPiecesHomeExcludedKcal,
        `${n}: trace tribute-bucket kcal == per-seed`);
    }
    // tribute bucket separate from aid: home-excluded pieces events
    // (via pieces, home, invHaul false) carry Tribute names; stock-
    // excluded events (via stock, invHaul false) never carry Tribute names.
    for (const ev of (t.events || [])) {
      if (ev.via === 'pieces' && ev.home === true && ev.invHaul === false) {
        ok(typeof ev.name === 'string' && ev.name.startsWith('Tribute '),
          `${n}: home-excluded pieces event is tribute-named (${JSON.stringify(ev).slice(0, 120)})`);
      }
      if (ev.via === 'stock' && ev.invHaul === false) {
        ok(!String(ev.name || '').startsWith('Tribute '),
          `${n}: stock-excluded event is not tribute (${JSON.stringify(ev).slice(0, 120)})`);
      }
      if (ev.via === 'stock' && isCustom(ev.name)) {
        // A custom label in the pilot is a FOUND verdict, not a failure:
        // record it loudly; the evidence file cites the trace line.
        console.log(`NOTE CUSTOM LABEL in pilot trace ${n}: ${JSON.stringify(ev)}`);
      }
      if (ev.via === 'stock' && CLASS_NAMES.includes(ev.name)) {
        // A class instance under the inverted predicate is a FOUND upgrade;
        // report it loudly but do not fail: the verdict table records it.
        console.log(`NOTE class instance in pilot trace ${n}: ${JSON.stringify(ev)}`);
      }
    }
  }
}

// ---------- T4 opt-in full-tree scan ----------
if (process.argv.includes('--full')) {
  const walkJson = (d, acc) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walkJson(p, acc);
      else if (e.isFile() && e.name.endsWith('.json')) acc.push(p);
    }
  };
  const all = [];
  walkJson(EVID, all);
  let genesis = 0, buried = 0, exped = 0;
  for (const f of all) {
    let txt;
    try { txt = fs.readFileSync(f, 'utf8'); } catch (e) { continue; }
    if (txt.includes('Genesis fruit')) genesis++;
    if (txt.includes('Buried cache')) buried++;
    if (txt.includes('Expedition meat')) exped++;
  }
  console.log(`FULL SCAN: ${all.length} JSON files; Genesis-fruit files=${genesis}, Buried-cache files=${buried}, Expedition-meat files=${exped}`);
  eq(genesis, 0, 'full scan: zero Genesis-fruit JSON files');
  ok(exped > 0, 'full scan: Expedition-meat files exist (>0)');
}

console.log(`${PASS} PASS, ${FAIL} FAIL`);
process.exit(FAIL ? 1 : 0);
