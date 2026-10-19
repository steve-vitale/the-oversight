#!/usr/bin/env node
// Zero is a real map coordinate, not a missing-position sentinel.
'use strict';
const K = require('../../scripts/godpath/lib'), T = K.reporter('drift-zero-coordinate');
(async () => {
  const G = await K.load({ seed: 7 }); K.newRun(G);
  G.state.scholar.exiled = true; G.state.scholar.drifting = true;
  G.map.px = 0; G.map.py = 0;
  const village = { id: 'smoke_probe', x: 3, y: 3, name: 'Distant fire', hinted: false };
  G.state.otherVillages = [village];
  const lines = K.captureSays(G);
  try { for (let i = 0; i < 200 && !village.hinted; i++) G.driftTick(); }
  finally { lines.restore(); }
  T.ok('a corner drifter can discover distant smoke', village.hinted === true);
  T.ok('the direction is measured from the real zero coordinate', lines.some(s => /smoke on the horizon, east/.test(s)));
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
