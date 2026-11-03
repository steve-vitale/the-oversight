#!/usr/bin/env node
// sortietarget-fixture.js — ONE harness per process (never two harnesses
// in one node process). Child worker for scripts/test-sortietarget-a.js.
// Usage: node scripts/sortietarget-fixture.js <seed> <case>
// Cases: targetMiddle | targetLast | twinTarget | unmatched | absent |
//        single | endure | offerRecord | keyStability
// Prints exactly one JSON line to stdout.
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const seed = parseInt(process.argv[2], 10);
const kase = process.argv[3];

function day(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function pickDefs(Game, n, sameKind) {
  const all = (Game.data.monsters || []).filter(d => d && d.id && Array.isArray(d.hp));
  const weak = all.filter(d => (d.hp[0] || 99) <= 30).sort((a, b) => (a.hp[0] || 99) - (b.hp[0] || 99));
  if (sameKind) {
    const d = weak[0];
    return Array.from({ length: n }, () => d);
  }
  return weak.slice(0, n);
}

async function main() {
  const { Game, loadFails } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  if (loadFails && loadFails.length) { console.log(JSON.stringify({ error: 'loadFails: ' + loadFails.join('; ') })); return; }
  await setupGame(Game, 'Columbus, Ohio');
  const out = { seed, case: kase, day: day(Game) };
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;

  if (kase === 'endure') {
    const ret = Game.answerLingerer('endure');
    console.log(JSON.stringify(Object.assign(out, { ret, beatDay: Game.state.lingererBeatDay })));
    return;
  }

  const n = kase === 'single' ? 1 : 3;
  const sameKind = kase === 'twinTarget';
  const defs = pickDefs(Game, n, sameKind);
  if (defs.length < n) { console.log(JSON.stringify(Object.assign(out, { error: 'not enough weak defs: ' + defs.length }))); return; }
  const world = Game.worldMonsters();
  const entities = defs.map(d => {
    const m = { id: d.id, tx: hx, ty: hy, mx: 0, my: 0, hp: 3, maxHp: 3,
      lingering: true, lingerSince: day(Game), wave: d.wave || 1 };
    world.push(m);
    return m;
  });
  // Stamp keys through the engine's own path (also the beats-panel path).
  const raiders = Game.lingeringRaiders();
  out.raiderKeys = raiders.map(m => m.lingerKey || null);
  out.raiderIds = raiders.map(m => m.id);
  out.keysDistinct = new Set(out.raiderKeys).size === out.raiderKeys.length;

  if (kase === 'offerRecord') {
    // Drive the real gorge loop: it speaks one line per lingerer and must
    // record the LAST announced offer (world-array order last).
    try { Game.havenGrowthDaily(); } catch (e) { out.gorgeError = String(e.message).slice(0, 120); }
    const off = Game.state.lastLingererOffer || null;
    out.offer = off;
    out.offerMatchesLast = !!(off && raiders.length && off.key === raiders[raiders.length - 1].lingerKey);
    console.log(JSON.stringify(out));
    return;
  }
  if (kase === 'keyStability') {
    const again = Game.lingeringRaiders().map(m => m.lingerKey || null);
    out.keysStable = JSON.stringify(again) === JSON.stringify(out.raiderKeys);
    console.log(JSON.stringify(out));
    return;
  }

  let targetKey = null, expectedOrder = null;
  if (kase === 'targetMiddle') {
    targetKey = raiders[1].lingerKey;
    expectedOrder = [raiders[1].lingerKey, raiders[0].lingerKey, raiders[2].lingerKey];
  } else if (kase === 'targetLast') {
    targetKey = raiders[2].lingerKey;
    expectedOrder = [raiders[2].lingerKey, raiders[0].lingerKey, raiders[1].lingerKey];
  } else if (kase === 'twinTarget') {
    targetKey = raiders[1].lingerKey;
    expectedOrder = [raiders[1].lingerKey, raiders[0].lingerKey, raiders[2].lingerKey];
  } else if (kase === 'unmatched') {
    targetKey = 'ling99999';
    expectedOrder = raiders.map(m => m.lingerKey);
  } else if (kase === 'absent') {
    targetKey = null;
    expectedOrder = raiders.map(m => m.lingerKey);
  } else if (kase === 'single') {
    targetKey = raiders[0].lingerKey;
    expectedOrder = [raiders[0].lingerKey];
  }
  const ret = targetKey === null
    ? Game.answerLingerer('sortie')
    : Game.answerLingerer('sortie', targetKey);
  out.ret = ret;
  out.expectedOrder = expectedOrder;
  out.foughtKeys = (ret && Array.isArray(ret.fought)) ? ret.fought.map(f => f.key) : null;
  out.foughtIsPrefix = Array.isArray(out.foughtKeys) && out.foughtKeys.every((k, i) => k === expectedOrder[i]);
  out.firstFoughtIsTarget = !!(targetKey && targetKey !== 'ling99999' && out.foughtKeys && out.foughtKeys[0] === targetKey);
  out.targetFought = !!(targetKey && targetKey !== 'ling99999' && out.foughtKeys && out.foughtKeys.includes(targetKey));
  console.log(JSON.stringify(out));
}

main().catch(e => { console.log(JSON.stringify({ error: String((e && e.stack) || e).slice(0, 500) })); });
