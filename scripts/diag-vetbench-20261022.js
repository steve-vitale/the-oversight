#!/usr/bin/env node
// diag-vetbench-20261022.js — diagnose test-vetbench E4/E5 failures.
// D1: control (VETBENCH unset) 180d twice — byte-identical? (isolates
//     whether long-run non-determinism pre-exists the benching layer)
// D2: armed (VETBENCH=1) 180d twice — byte-identical?
// D3: s65477-belong armed — per window-day: vetVids, eligible, muster
//     coverage, sheltered/away/health state (why did engagement never fire?)
// Usage: same pinned env as the proof test.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const VB = require('./policies/vetbench');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const KD = require('./killdisc-instrument-20261021');

function setVB(on) { if (on) process.env.VETBENCH = '1'; else delete process.env.VETBENCH; }

async function traj(seed, vbFlag, base, days) {
  setVB(vbFlag);
  const policyObj = vbFlag ? VB.armedFor(base) : VB.substrateFor(base);
  const { Game } = await loadGame({ seed, mode: 'vetbench-diag', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KD.install(Game, t);
  await setupGame(Game);
  const hs = [];
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  setVB(true);
  return hs.join('|');
}

(async () => {
  // D1: control long-run determinism (benching layer present but gate off).
  const c1 = await traj(65421, false, 'leadfeast', 180);
  const c2 = await traj(65421, false, 'leadfeast', 180);
  console.log('D1 control 180d x2 byte-identical:', c1 === c2, 'len', c1.length, c2.length);
  // D2: armed long-run determinism.
  const a1 = await traj(65421, true, 'leadfeast', 180);
  const a2 = await traj(65421, true, 'leadfeast', 180);
  console.log('D2 armed 180d x2 byte-identical:', a1 === a2, 'len', a1.length, a2.length);
  if (a1 !== a2) {
    const p1 = a1.split('|'), p2 = a2.split('|');
    let first = -1;
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      if (p1[i] !== p2[i]) { first = i; break; }
    }
    console.log('D2 first divergence at day-index', first,
      'a1=', (p1[first] || '').slice(0, 60), 'a2=', (p2[first] || '').slice(0, 60));
  }
  // D3: window-day anatomy on s65477-belong armed.
  setVB(true);
  const { Game } = await loadGame({ seed: 65477, mode: 'vetbench-diag3', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = KD.install(Game, t);
  await setupGame(Game);
  const oDaily = VB.armedFor('belongfeast').daily;
  const policy = Object.assign({}, VB.armedFor('belongfeast'), {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try {
        const day = ((G.state || {}).scholar || {}).day || 0;
        if (VB.vbWindowLive(G)) {
          const v = (G.state || {}).village || {};
          const vets = VB.vbVetVids(G);
          const elig = vets.filter(x => VB.vbDraftEligible(G, x));
          const sh = vets.filter(x => { try { return G.isSheltered(x); } catch (e) { return false; } });
          const away = vets.filter(x => v.away && v.away[x]);
          const hp = vets.map(x => x + ':' + ((v.health || {})[x]));
          console.log(`  D3 window day ${day}: vets=[${vets}] eligible=[${elig}] sheltered=[${sh}] away=[${away}] hp=[${hp}] muster=${!!(v.shelterMustered)} vbMine=[${(ctx.vbMine || [])}]`);
        }
      } catch (e) { console.log('  D3 trace error', String((e && e.message) || e)); }
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  console.log('D3 done. instrumentErrors:', t.instrumentErrors.length);
})().catch(e => { console.error('DIAG CRASH:', e && e.stack || e); process.exit(1); });
