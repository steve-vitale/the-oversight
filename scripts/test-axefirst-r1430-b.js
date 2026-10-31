#!/usr/bin/env node
// test-axefirst-r1430-b.js — proof for sim-axefirst-b 1430Z.
// Unit cases for the policy gate + search-stop rule + axe-by-day-7 +
// source classifier, a live mechanism micro-test (15215 ruin run
// record shape), the data check (hatchet in every list pool, shape),
// the tracked-diff guard (vs pinned base 47162b801: the ONLY tracked
// change under src/ + scripts/policies/ is the hatchet entry in
// src/data/regions.json), and — when corpus dirs are passed — corpus
// completeness, errs 0, and pilot determinism byte-identity.
// Usage: node scripts/test-axefirst-r1430-b.js [pilotControl pilotLever confirmControl confirmLever detDir]
// With no dirs, unit + data + live micro-test only.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { classifySource, censusLeg, axeByDay7 } = require('./analyze-axefirst-r1430-b');
const { runDecision, searchStop, newStore, withAxefirst, runRuinRun } = require('./policies/axefirst-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// --- policy gate unit cases (prereg windows, own-state only) ---
check('gate lever-off', runDecision({ on: false }).skip === 'lever-off');
check('gate game-over', runDecision({ on: true, gameOver: true }).skip === 'game-over');
check('gate combat', runDecision({ on: true, combat: true }).skip === 'combat');
check('gate day 1 out', runDecision({ on: true, gameDay: 1, atHaven: true, tier: 'whittle' }).skip === 'out-of-window');
check('gate day 7 out', runDecision({ on: true, gameDay: 7, atHaven: true, tier: 'whittle' }).skip === 'out-of-window');
check('gate day 2 in', runDecision({ on: true, gameDay: 2, atHaven: true, tier: 'whittle' }).run === true);
check('gate day 6 in', runDecision({ on: true, gameDay: 6, atHaven: true, tier: 'whittle' }).run === true);
check('gate not-at-haven', runDecision({ on: true, gameDay: 3, atHaven: false, tier: 'whittle' }).skip === 'not-at-haven');
check('gate has-axe', runDecision({ on: true, gameDay: 3, atHaven: true, tier: 'fell' }).skip === 'has-axe');

// --- search-stop unit cases (prereg guards) ---
check('stop found', searchStop({ found: true, searches: 1, noGain: 0, ticksLeft: 400, kcal: 500 }) === 'found');
check('stop search-cap', searchStop({ searches: 12, noGain: 0, ticksLeft: 400, kcal: 500 }) === 'search-cap');
check('stop no-gain', searchStop({ searches: 3, noGain: 2, ticksLeft: 400, kcal: 500 }) === 'no-gain');
check('stop ticks', searchStop({ searches: 1, noGain: 0, ticksLeft: 63, kcal: 500 }) === 'ticks');
check('stop ticks at boundary (pilot fix: 64 left still stops)', searchStop({ searches: 1, noGain: 0, ticksLeft: 64, kcal: 500 }) === 'ticks');
check('stop kcal', searchStop({ searches: 1, noGain: 0, ticksLeft: 400, kcal: 299 }) === 'kcal');
check('stop kcal floor exact', searchStop({ searches: 1, noGain: 0, ticksLeft: 400, kcal: 300 }) === null);
check('stop ticks floor exact (65 left runs)', searchStop({ searches: 1, noGain: 0, ticksLeft: 65, kcal: 500 }) === null);
check('stop game-over', searchStop({ gameOver: true, searches: 1, noGain: 0, ticksLeft: 400, kcal: 500 }) === 'game-over');
check('stop keep going', searchStop({ searches: 1, noGain: 1, ticksLeft: 400, kcal: 500 }) === null);

// --- classifier reuse (ruin-search finds must NOT be relabeled) ---
check('classify ruin find is other (no fetch/loot/craft line)',
  classifySource({ spawnTierFell: false, lines: ['You find a hatchet.'], prevStash: [], arrStash: [], arrivalInvIds: ['hatchet'] }) === 'other');
check('classify stash fetch still works',
  classifySource({ spawnTierFell: false, lines: ['You remember the Hatchet at your space in the haven and fetch it — it rides in your pack now.'] }) === 'stash fetch');

// --- axeByDay7 synthetic ---
{
  const eve = (loopDay, gameDay, tier, inv) => ({
    loopDay, gameDay,
    eveningTool: { tier: tier ? { tier } : null },
    eveningInv: { inv: (inv || []).map((id) => ({ itemId: id })), eq: {} },
    woodcarry: null, eveningStash: [],
  });
  const morn = (loopDay, gameDay, tier, inv) => ({
    loopDay, gameDay, inside: false, tile: 'creek', inCombat: false, morningWood: 2, kcal: 50,
    tool: { tier: tier ? { tier } : null, target: null, cutInfo: null, ticksLeft: 200, walkSteps: 1 },
    inv: { inv: (inv || []).map((id) => ({ itemId: id })), eq: {} }, stash: [],
  });
  const leg = (evenings, mornings) => ({ seed: 1, evenings, mornings, spawn: { stash: [], inv: { inv: [], eq: {} } } });
  check('axeByDay7 evening day 6', axeByDay7(leg([eve(5, 6, 'fell', [])], [])).byDay7 === true);
  check('axeByDay7 evening day 8 not counted', axeByDay7(leg([eve(7, 8, 'fell', [])], [])).byDay7 === false);
  check('axeByDay7 hatchet id in pack counts', axeByDay7(leg([eve(3, 4, 'whittle', ['hatchet'])], [])).byDay7 === true);
  check('axeByDay7 none', axeByDay7(leg([eve(1, 1, 'whittle', [])], [morn(2, 2, 'whittle', [])])).byDay7 === false);
}

// --- data check: hatchet in every list pool, exact shape, nothing else ---
{
  const root = path.join(__dirname, '..');
  const regions = JSON.parse(fs.readFileSync(path.join(root, 'src/data/regions.json'), 'utf8'));
  const listPools = regions.filter((r) => Array.isArray(((r || {}).people || {}).scavenge));
  check('data: 6 list pools', listPools.length === 6, listPools.length);
  for (const r of listPools) {
    const hits = r.people.scavenge.filter((x) => x.id === 'hatchet');
    check('data: exactly 1 hatchet in ' + r.id, hits.length === 1, hits.length);
    if (hits.length === 1) {
      check('data: hatchet shape ' + r.id,
        hits[0].name === 'Hatchet' && hits[0].kcal === 0 && hits[0].kg === 0.7 && typeof hits[0].text === 'string' && hits[0].text.length > 0, hits[0]);
    }
  }
  const nullPools = regions.filter((r) => !Array.isArray(((r || {}).people || {}).scavenge));
  check('data: 14 null pools untouched (fallback, not invented)', nullPools.length === 14, nullPools.length);
  const items = JSON.parse(fs.readFileSync(path.join(root, 'src/data/items.json'), 'utf8'));
  let hatchetDef = null;
  (function find(o) {
    if (!o || typeof o !== 'object') return;
    if (o.id === 'hatchet') { hatchetDef = o; return; }
    for (const v of Object.values(o)) find(v);
  })(items);
  check('data: items.json hatchet is fell-tier', !!(hatchetDef && hatchetDef.tool && hatchetDef.tool.woodcut === 'fell'), hatchetDef && hatchetDef.tool);
}

// --- tracked-diff guard vs pinned base ---
{
  const PINNED = '47162b801a9763ed92a54bcbd633ec56b9fb049d';
  const root = path.join(__dirname, '..');
  try {
    const names = cp.execSync('git diff ' + PINNED + ' --name-only -- src scripts/policies', { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    check('diff guard: only regions.json changed under src/ + scripts/policies/', eq(names, ['src/data/regions.json']), names);
    const diff = cp.execSync('git diff ' + PINNED + ' -- src/data/regions.json', { cwd: root, encoding: 'utf8' });
    const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
    const removed = diff.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---')).map((l) => l.slice(1));
    check('diff guard: 42 added lines (6 pools x 7)', added.length === 42, added.length);
    // Git aligns the diff with zero removed lines: the previous last
    // element's closer line now closes the new hatchet entry (context),
    // and the added '},' line closes the previous element.
    check('diff guard: 0 removed lines (pure append, no edit)', removed.length === 0, removed);
    const hatchetIdLines = added.filter((l) => l.includes('"id": "hatchet"'));
    check('diff guard: 6 hatchet id lines', hatchetIdLines.length === 6, hatchetIdLines.length);
    const badAdded = added.filter((l) => {
      const t = l.trim();
      return !(t === '},' || t === '{' || t === '"id": "hatchet",' || t === '"name": "Hatchet",' ||
        t === '"kcal": 0,' || t === '"kg": 0.7,' || t.startsWith('"text": "A hatchet hung by the back door'));
    });
    check('diff guard: added lines are hatchet entries + closers only', badAdded.length === 0, badAdded);
  } catch (e) { check('diff guard runs', false, String(e && e.message)); }
}

// --- live mechanism micro-test + lever-off delegation (async tail) ---
async function liveTests() {
  const { loadGame, setupGame } = require('./sim-harness');
  // Lever-off delegation: inner called, vessel unmoved, skip recorded.
  {
    const saved = process.env.AXEFIRST;
    delete process.env.AXEFIRST;
    try {
      const { Game } = await loadGame({ seed: 15215, mode: 'nighttravel-b', fullTelemetry: false });
      await setupGame(Game);
      const before = [Game.map.px, Game.map.py];
      let innerCalled = false;
      const inner = { daily() { innerCalled = true; } };
      const store = newStore();
      const pol = withAxefirst(inner, store);
      pol.daily(Game, {});
      check('live: lever-off delegates to inner', innerCalled === true);
      check('live: lever-off does not move vessel', eq([Game.map.px, Game.map.py], before), [Game.map.px, Game.map.py]);
      check('live: lever-off skip recorded', store.records.length === 1 && store.records[0].skip === 'lever-off', store.records);
    } catch (e) { check('live: lever-off delegation runs', false, String(e && e.message)); }
    if (saved === undefined) delete process.env.AXEFIRST; else process.env.AXEFIRST = saved;
  }
  // ON-path daily() on 15215 (edited pools): the wrapper runs the ruin
  // run, records it (no 'error' skip), then delegates to inner. This
  // is the path a unit-only test missed in the first pilot (a stale
  // variable reference discarded the run record).
  {
    const saved = process.env.AXEFIRST;
    process.env.AXEFIRST = '1';
    try {
      const { Game } = await loadGame({ seed: 15215, mode: 'nighttravel-b', fullTelemetry: false });
      await setupGame(Game);
      let innerCalled = false;
      const inner = { daily() { innerCalled = true; } };
      const store = newStore();
      const pol = withAxefirst(inner, store);
      // Drive to gameDay 2 the honest way: one harness loop-day is not
      // available here, so set the day label the wrapper reads (the
      // wrapper only reads scholar.day for the window gate).
      Game.state.scholar.day = 2;
      pol.daily(Game, {});
      check('live: ON daily delegates to inner', innerCalled === true);
      check('live: ON daily records an acted run (not error)', store.records.length === 1 && store.records[0].acted === true && store.records[0].skip === undefined, store.records);
      check('live: ON daily ruin at (5,4)', !!(store.records[0].ruin && store.records[0].ruin.x === 5 && store.records[0].ruin.y === 4), store.records[0] && store.records[0].ruin);
      check('live: ON daily store runs counted', store.runs === 1, store.runs);
      check('live: ON daily store errs 0', store.errs === 0, store.errors);
    } catch (e) { check('live: ON daily runs', false, String(e && (e.stack || e.message))); }
    if (saved === undefined) delete process.env.AXEFIRST; else process.env.AXEFIRST = saved;
  }
  // Ruin-run mechanism on 15215 (edited pools): hop to the (5,4) ruin,
  // search with engine verbs, return; record shape asserted, find
  // itself NOT asserted (queue membership is the measurement).
  {
    try {
      const { Game } = await loadGame({ seed: 15215, mode: 'nighttravel-b', fullTelemetry: false });
      await setupGame(Game);
      const store = newStore();
      const rec = runRuinRun(Game, store, 2, 2);
      check('live: ruin run acted', rec.acted === true);
      check('live: ruin at (5,4)', !!(rec.ruin && rec.ruin.x === 5 && rec.ruin.y === 4), rec.ruin);
      check('live: ruin run searched at least once', rec.searches >= 1, rec.searches);
      check('live: ruin run return recorded', rec.return === 'home' || rec.return === 'away', rec.return);
      check('live: ruin run stop reason recorded', typeof rec.stop === 'string' && rec.stop.length > 0, rec.stop);
      check('live: ruin run kcal floor respected', rec.kcalAfter === null || rec.kcalAfter >= 0, rec.kcalAfter);
    } catch (e) { check('live: ruin-run mechanism runs', false, String(e && (e.stack || e.message))); }
  }
}

function checkCorpus(dir, expectedLegs, label) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  check(label + ' leg count', files.length === expectedLegs, files.length);
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const c = censusLeg(inst);
    check(label + ' ' + f + ' errs 0', inst.errCount === 0, inst.errCount);
    check(label + ' ' + f + ' mornings complete', c.incompleteMornings === 0, c.incompleteMornings);
    check(label + ' ' + f + ' strands complete', c.incompleteStrands === 0, c.incompleteStrands);
    check(label + ' ' + f + ' evenings>=mornings', inst.evenings.length >= inst.mornings.length, [inst.evenings.length, inst.mornings.length]);
    check(label + ' ' + f + ' axefirst store present', !!inst.axefirstStore && Array.isArray(inst.axefirstStore.records), !!inst.axefirstStore);
    if (inst.arm === 'lever') {
      check(label + ' ' + f + ' lever acted on some day-2..6 haven morning or skipped honestly',
        inst.axefirstStore.records.some((r) => r.acted || (r.skip && r.skip !== 'lever-off')), inst.axefirstStore.records.map((r) => r.skip || 'acted'));
    }
    if (c.firstAxeEvening !== null || c.firstAxeMorning !== null) {
      check(label + ' ' + f + ' source classified', c.source !== null, c.source);
    }
  }
}

async function main() {
  await liveTests();
  const [pilotControl, pilotLever, confirmControl, confirmLever, detDir] = process.argv.slice(2);
  if (pilotControl) checkCorpus(pilotControl, 1, 'pilot-control');
  if (pilotLever) checkCorpus(pilotLever, 1, 'pilot-lever');
  if (confirmControl) checkCorpus(confirmControl, 16, 'confirm-control');
  if (confirmLever) checkCorpus(confirmLever, 16, 'confirm-lever');
  if (detDir && pilotLever) {
    const detFiles = fs.readdirSync(detDir).filter((f) => f.endsWith('.json')).sort();
    check('determinism dir has 1 file', detFiles.length === 1, detFiles.length);
    const pilotFiles = fs.readdirSync(pilotLever).filter((f) => /s15215/.test(f)).sort();
    check('pilot lever has one 15215 file', pilotFiles.length === 1, pilotFiles);
    if (detFiles.length === 1 && pilotFiles.length === 1) {
      const detData = fs.readFileSync(path.join(detDir, detFiles[0]), 'utf8');
      const judged = fs.readFileSync(path.join(pilotLever, pilotFiles[0]), 'utf8');
      check('determinism byte-identical', detData === judged, 'lengths ' + detData.length + ' vs ' + judged.length);
    }
  }
  console.log('axefirst-r1430 proof: ' + pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
