#!/usr/bin/env node
// diag-readpurity-20261022.js — is the window-live read path pure?
// Run A: policy daily calls VB.vbWindowLive once per day (normal).
// Run B: policy daily calls VB.vbWindowLive twice per day.
// Same seed/config/env. Byte-identical => the read path is pure.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const VB = require('./policies/vetbench');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

function setVB(on) { if (on) process.env.VETBENCH = '1'; else delete process.env.VETBENCH; }

async function traj(extraCalls) {
  setVB(true);
  const policyObj = VB.armedFor('belongfeast');
  const { Game } = await loadGame({ seed: 65477, mode: 'vetbench-readpure', fullTelemetry: false });
  await setupGame(Game);
  const hs = [];
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try {
        for (let i = 0; i < extraCalls; i++) VB.vbWindowLive(G);
        for (let i = 0; i < extraCalls; i++) VB.vbVetVids(G);
        hs.push(G.state.scholar.day + ':' + dayHash(G));
      } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  return hs.join('|');
}

(async () => {
  const a = await traj(0); // policy's own single reads only
  const b = await traj(1); // +1 extra windowLive +1 extra vetVids per day
  console.log('single-vs-double reads byte-identical:', a === b, 'len', a.length, b.length);
  if (a !== b) {
    const pa = a.split('|'), pb = b.split('|');
    let first = -1;
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      if (pa[i] !== pb[i]) { first = i; break; }
    }
    console.log('first divergence at day-index', first);
  }
})().catch(e => { console.error('DIAG CRASH:', e && e.stack || e); process.exit(1); });
