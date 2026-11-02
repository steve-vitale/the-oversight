#!/usr/bin/env node
// creekwood-geometry-20261102.js — map-gen-only corridor probe for the
// sim-creekwood-a confirm screen (Loop B fleshout-20261102T1155Z).
// One process per seed (never two harnesses in one process): loads the
// game, runs setupGame, reads corridor tiles, prints ONE line prefixed
// GEOM-JSON: and exits. Zero days run. Validated on knowns: 97396 must
// flag (5,4) + (6,4) both needsBridge; 97307 must flag (5,4) NB and
// (6,4) wetland (not a creek).
// Usage: SEED=97396 node scripts/creekwood-geometry-20261102.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const SEED = parseInt(process.env.SEED || '', 10);
if (!Number.isFinite(SEED)) { console.error('GEOM STOP: SEED required.'); process.exit(2); }
const CELLS = [[4, 3], [5, 3], [6, 3], [7, 3], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4], [4, 5], [5, 5], [6, 5]];

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const tiles = {};
  for (const c of CELLS) {
    let tl = null;
    try { tl = Game.tileAt(c[0], c[1]); } catch (e) { tl = null; }
    tiles[c[0] + ',' + c[1]] = tl ? {
      type: tl.type || null,
      needsBridge: !!tl.needsBridge,
      bridged: !!tl.bridged,
      blockFrom: tl.blockFrom ? { dx: tl.blockFrom.dx, dy: tl.blockFrom.dy, type: tl.blockFrom.type || null } : null,
    } : null;
  }
  let haven = null;
  try { const v = (Game.state || {}).village || {}; haven = { x: (v.px === undefined ? null : v.px), y: (v.py === undefined ? null : v.py) }; } catch (e) { haven = null; }
  console.log('GEOM-JSON:' + JSON.stringify({ seed: SEED, haven: haven, tiles: tiles }));
})().catch(e => { console.error('GEOM FAIL: ' + (e && e.stack ? e.stack : e)); process.exitCode = 1; });
