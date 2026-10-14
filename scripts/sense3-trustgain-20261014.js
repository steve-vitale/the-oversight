#!/usr/bin/env node
// one-off: original-scholar trust vs lineage trust (the r30 correction).
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustCensus } = require('./trustgain-20261014');
const { leadcourt } = require('./policies/leadcourt');
(async () => {
  const { Game } = await loadGame({ seed: 11, mode: 'sense3' });
  await setupGame(Game);
  const origVid = Game.villagerId;
  const census = installTrustCensus(Game);
  const wrapped = Object.assign({}, leadcourt);
  const origDaily = leadcourt.daily;
  // reconstruct original scholar's trust from writes (frozen at death, like r30)
  let origTrust = 15;
  const origSeen = new Set();
  wrapped.daily = (G, ctx) => {
    try {
      census.reproxy(); census.sampleDay();
      for (const w of census.writes) {
        const k = w.day + '|' + w.vid + '|' + w.delta;
        if (w.vid === String(origVid) && !origSeen.has(k)) { origSeen.add(k); origTrust = Math.max(0, Math.min(100, origTrust + w.delta)); }
      }
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 144 }); });
  const traj = census.daySamples;
  let lineageLT30 = 0, lineageN = 0, origLT30 = 0;
  // replay orig trust per day from writes
  const writesByDay = {};
  for (const w of census.writes) { (writesByDay[w.day] = writesByDay[w.day] || []).push(w); }
  let ot = 15;
  const seen = new Set();
  for (const s of traj) {
    lineageN++;
    if (s.scholarTrust != null && s.scholarTrust < 30) lineageLT30++;
    for (const w of (writesByDay[s.day] || [])) {
      const k = w.day + w.delta;
      if (w.vid === String(origVid) && !seen.has(k)) { seen.add(k); ot = Math.max(0, Math.min(100, ot + w.delta)); }
    }
    if (ot < 30) origLT30++;
  }
  console.log(`lineage trust<30 share: ${(lineageLT30 / lineageN).toFixed(4)} (${lineageLT30}/${lineageN})`);
  console.log(`original-vid trust<30 share: ${(origLT30 / lineageN).toFixed(4)} (${origLT30}/${lineageN})  <- r30's metric`);
  console.log(`original vid: ${String(origVid).slice(0, 12)}, lineage vids: ${new Set(traj.map(s => s.vid)).size}`);
  console.log('lineage trust by week:', traj.filter((_, i) => i % 7 === 0).map(s => `d${s.day}:${s.scholarTrust}`).join(' '));
})().catch(e => { console.error(e); process.exit(1); });
