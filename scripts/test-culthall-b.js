#!/usr/bin/env node
// test-culthall-b.js — real-play proof of the cultivate hall gate.
// One seed per process (never two harnesses in one process): run with a
// seed arg for one seed, or --all for the prereg pilot band 10400-10407.
// The parent (--all) spawns one child process per seed, collects the
// JSON each child prints, writes per-seed corpus files, and judges the
// prereg GO legs (A1 + B1 + B2 on 8/8 seeds).
//
// Real-play sequence per seed (public Game methods only):
//   fresh setup -> grant green_thumb L1 (disclosed fixture) ->
//   cultivate attempt while inside (leg A) -> Game.exitBuilding()
//   (the exact call the app.js 'Step outside' button makes) ->
//   gardenWorkGate + makePlot (leg B).
// No Game.save stub, no DOM: app.js is excluded from the node harness
// by design, so the UI path is verified at code level (button ->
// exitBuilding) and the engine call itself is executed here.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [10400, 10401, 10402, 10403, 10404, 10405, 10406, 10407];
const HALL_REASON = 'Step outside the hall to work the garden.';

function snap(Game) {
  const s = Game.state.scholar || {};
  let plots = null;
  try { plots = JSON.parse(JSON.stringify(Game.gardenPlots() || [])); } catch (e) { plots = 'unserializable:' + String(e && e.message); }
  const tickFields = {};
  for (const k of ['ticks', 'dayTicks', 'timeTicks', 'dayPart', 'partTicks']) {
    if (s[k] !== undefined) tickFields[k] = s[k];
  }
  let tileType = null;
  try { tileType = Game.playerTile() ? Game.playerTile().type : null; } catch (e) { tileType = 'error:' + String(e && e.message); }
  return { day: s.day || 0, kcal: s.kcal, insideHaven: s.insideHaven,
    px: Game.map ? Game.map.px : null, py: Game.map ? Game.map.py : null,
    tileType, mx: s.mx, my: s.my, plots, tickFields };
}

async function oneSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'culthall-b', fullTelemetry: false, narration: true });
  await setupGame(Game);
  // Capture player-visible lines from here on (setup chatter excluded).
  const lines = [];
  const origSay = Game.say;
  Game.say = function () {
    const text = Array.prototype.slice.call(arguments).join(' ');
    lines.push(text);
    if (typeof origSay === 'function') return origSay.apply(this, arguments);
    return undefined;
  };
  const takeLines = () => { const out = lines.slice(); lines.length = 0; return out; };

  const setup = snap(Game);
  // Disclosed fixture: grant the cultivate ability (spandraw probe method).
  const s = Game.state.scholar;
  if (!Array.isArray(s.abilities)) s.abilities = [];
  if (!s.abilities.some(a => a && a.id === 'green_thumb')) s.abilities.push({ id: 'green_thumb', level: 1 });
  let grantOk = false;
  try { grantOk = !!Game.hasAbility('green_thumb'); } catch (e) { grantOk = 'error:' + String(e && e.message); }

  // Leg A: cultivate while inside.
  const preA = snap(Game);
  takeLines();
  let cultResult = null, cultError = null;
  try { cultResult = Game.useAbility('green_thumb', 'cultivate'); }
  catch (e) { cultError = String(e && e.message); }
  const linesA1 = takeLines();
  let gateA = null;
  try { gateA = Game.gardenWorkGate(); } catch (e) { gateA = { error: String(e && e.message) }; }
  const postA = snap(Game);
  const zeroChangeA = JSON.stringify(preA) === JSON.stringify(postA);

  // Leg A2 (supporting): makePlot while inside.
  takeLines();
  let makeInside = null, makeInsideError = null;
  try { makeInside = Game.makePlot(); } catch (e) { makeInsideError = String(e && e.message); }
  const linesA2 = takeLines();
  const postA2 = snap(Game);
  const zeroChangeA2 = JSON.stringify(postA) === JSON.stringify(postA2);

  // Leg B: the in-game Step outside action (app.js button -> exitBuilding).
  takeLines();
  let exitResult = null, exitError = null;
  try { exitResult = Game.exitBuilding(); } catch (e) { exitError = String(e && e.message); }
  const linesB = takeLines();
  const afterExit = snap(Game);
  let gateB = null;
  try { gateB = Game.gardenWorkGate(); } catch (e) { gateB = { error: String(e && e.message) }; }

  // Leg B2: real garden work fires after exit.
  const preB = snap(Game);
  takeLines();
  let makeOutside = null, makeOutsideError = null;
  try { makeOutside = Game.makePlot(); } catch (e) { makeOutsideError = String(e && e.message); }
  const linesB2 = takeLines();
  const postB = snap(Game);
  const plotsBefore = Array.isArray(preB.plots) ? preB.plots.length : -1;
  const plotsAfter = Array.isArray(postB.plots) ? postB.plots.length : -1;

  // Leg B3 (supporting): cultivate gate reason after exit.
  let magicGate = null;
  try { magicGate = Game.gardenMagicGate(); } catch (e) { magicGate = { error: String(e && e.message) }; }

  return { seed, setup, grantOk,
    legA: { cultResult, cultError, lines: linesA1, gate: gateA, zeroChange: zeroChangeA,
      pre: preA, post: postA },
    legA2: { makeInside: makeInside == null ? null : 'fired', makeInsideError, lines: linesA2,
      zeroChange: zeroChangeA2 },
    legB: { exitResult: exitResult == null ? null : (exitResult === true ? true : 'truthy'),
      exitError, lines: linesB, afterExit, gate: gateB },
    legB2: { makeOutside: makeOutside == null ? null : 'fired', makeOutsideError, lines: linesB2,
      plotsBefore, plotsAfter, plotsDelta: plotsAfter - plotsBefore,
      kcalBefore: preB.kcal, kcalAfter: postB.kcal, kcalDelta: (postB.kcal || 0) - (preB.kcal || 0) },
    legB3: { magicGate } };
}

function judge(r) {
  const a0 = r.setup.insideHaven === true && r.setup.px === 4 && r.setup.py === 4 && r.setup.tileType === 'haven';
  const a1 = r.legA.cultResult === false && r.legA.lines.some(l => l.indexOf(HALL_REASON) !== -1)
    && r.legA.gate && r.legA.gate.ok === false && r.legA.gate.short === 'step outside'
    && r.legA.gate.reason === HALL_REASON && r.legA.zeroChange === true;
  const b1 = r.legB.exitResult === true && r.legB.afterExit.insideHaven === false
    && r.legB.afterExit.px === 4 && r.legB.afterExit.py === 4;
  const b2 = r.legB.gate && r.legB.gate.ok === true && r.legB2.makeOutside === 'fired'
    && r.legB2.plotsDelta === 1 && r.legB2.kcalDelta === -120;
  return { a0, a1, b1, b2, go: a0 && a1 && b1 && b2 };
}

async function main() {
  const arg = process.argv[2];
  if (arg && arg !== '--all') {
    const r = await oneSeed(Number(arg));
    console.log('CULTHALL_JSON:' + JSON.stringify(r));
    return;
  }
  const corpusDir = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-culthall-b-corpus');
  fs.mkdirSync(corpusDir, { recursive: true });
  const rows = [];
  for (const seed of SEEDS) {
    const out = execFileSync(process.execPath, [__filename, String(seed)], { encoding: 'utf8', timeout: 300000 });
    const line = out.split('\n').find(l => l.indexOf('CULTHALL_JSON:') === 0);
    if (!line) throw new Error('no JSON from seed ' + seed + '; output:\n' + out);
    const r = JSON.parse(line.slice('CULTHALL_JSON:'.length));
    r.judgement = judge(r);
    fs.writeFileSync(path.join(corpusDir, 'seed-' + seed + '.json'), JSON.stringify(r, null, 2) + '\n');
    rows.push(r);
    console.log('seed ' + seed + ': A0=' + r.judgement.a0 + ' A1=' + r.judgement.a1
      + ' B1=' + r.judgement.b1 + ' B2=' + r.judgement.b2 + ' GO=' + r.judgement.go);
  }
  const goCount = rows.filter(r => r.judgement.go).length;
  console.log('---');
  console.log('GO seeds: ' + goCount + '/' + rows.length);
  console.log('VERDICT: ' + (goCount === rows.length ? 'GO (gate verified working as intended)' : 'NO-GO'));
  if (goCount !== rows.length) process.exitCode = 1;
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
