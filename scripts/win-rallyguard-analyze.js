#!/usr/bin/env node
// Compare BEFORE vs AFTER rally-guard panel corpora (directories of
// seed-N.json from win-rallyguard-panel.js). Usage:
//   node scripts/win-rallyguard-analyze.js <beforeDir> <afterDir>
const fs = require('fs');
const path = require('path');
const [beforeDir, afterDir] = process.argv.slice(2);
if (!beforeDir || !afterDir) { console.error('usage: analyze.js <beforeDir> <afterDir>'); process.exit(2); }
function load(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).filter(x => /^seed-\d+\.json$/.test(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
const b = load(beforeDir), a = load(afterDir);
const seeds = Object.keys(a).sort((x, y) => +x - +y);
const sum = (rows, k) => rows.reduce((s, r) => s + (r[k] || 0), 0);
console.log('seed | end(before->after) | raids | guards | guardAfterRaid | rallyGoalGuardAfterRaid | rallyAsks(picked)');
for (const s of seeds) {
  const rb = b[s] || {}, ra = a[s] || {};
  console.log(`${s} | ${rb.endReason || '?'}->${ra.endReason || '?'} | ${rb.raidGossipEvents || 0}->${ra.raidGossipEvents || 0} | ${rb.guardDepartures || 0}->${ra.guardDepartures || 0} | ${rb.guardAfterRaid || 0}->${ra.guardAfterRaid || 0} | ${rb.rallyGoalGuardAfterRaid || 0}->${ra.rallyGoalGuardAfterRaid || 0} | ${rb.rallyAsks || 0}(${rb.rallyAskPicked || 0})->${ra.rallyAsks || 0}(${ra.rallyAskPicked || 0})`);
}
const br = seeds.map(s => b[s] || {}), ar = seeds.map(s => a[s] || {});
console.log(`TOTAL seeds=${seeds.length} raids ${sum(br, 'raidGossipEvents')}->${sum(ar, 'raidGossipEvents')} guards ${sum(br, 'guardDepartures')}->${sum(ar, 'guardDepartures')} guardAfterRaid ${sum(br, 'guardAfterRaid')}->${sum(ar, 'guardAfterRaid')} rallyGoalGuardAfterRaid ${sum(br, 'rallyGoalGuardAfterRaid')}->${sum(ar, 'rallyGoalGuardAfterRaid')} rallyAsks ${sum(br, 'rallyAsks')}->${sum(ar, 'rallyAsks')} picked ${sum(br, 'rallyAskPicked')}->${sum(ar, 'rallyAskPicked')}`);
const moved = sum(ar, 'rallyGoalGuardAfterRaid') - sum(br, 'rallyGoalGuardAfterRaid');
console.log(moved > 0 ? `VERDICT: MOVEMENT +${moved} rally-goal guard departures after raid gossip`
  : moved === 0 ? 'VERDICT: NO MOVEMENT — drive did not fire in panel play (see evidence note)'
  : `VERDICT: REGRESSION ${moved}`);
