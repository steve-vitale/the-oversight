#!/usr/bin/env node
// analyze-journey-social-r65-dry9-20261029.js -- DRY9 DEEP-DIVE (lane B, social r65).
// Reads the 4 per-seed JSONs from evidence/2026-10-29/r65 and prints pooled
// Q1-Q4 breakdowns from the driver's dry9Detail records (prereg-bound).
// No game code, no RNG, read-only.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const EVIDIR = path.join(REPO, 'evidence', '2026-10-29', 'r65');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [6001, 6002, 6003, 6004]).filter(Number.isFinite);
const sum = (o) => Object.entries(o || {}).map(([k, v]) => `${k}=${v}`).join(' ');
const pct = (n, d) => d ? (100 * n / d).toFixed(1) + '%' : 'n/a';

const pooled = { convos: 0, dry9: 0, follow: {}, retry: {}, pick: {}, pos: {}, endConvos: 0, retried: 0, retrySub: 0 };
for (const s of SEEDS) {
  const f = path.join(EVIDIR, `journey-social-r65-s${s}.json`);
  let r;
  try { r = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(`SEED ${s}: MISSING/UNPARSEABLE ${f}`); continue; }
  const dc = r.dryCensus || {};
  const det = dc.dry9Detail || [];
  const withNext = det.filter(d => d.followKind !== 'end');
  const rec = withNext.filter(d => d.followKind === 'substantive' || d.followKind === 'close').length;
  const retried = det.filter(d => d.retried);
  const retrySub = retried.filter(d => d.retryKind === 'substantive').length;
  console.log(`SEED ${s}: convos=${dc.totalConvos} dry=${dc.totalDryLines} dry9=${dc.dry9Lines} dry9/convo=${dc.totalConvos ? (dc.dry9Lines / dc.totalConvos).toFixed(3) : 'n/a'} self3=${dc.self3Lines} endDry=${dc.convosEndingOnDry} endDry9convos=${dc.dry9EndConvoCount} coldOpen=${dc.coldOpenDryConvos}/${dc.coldOpenSeenConvos}`);
  console.log(`  follow: ${sum(dc.dry9FollowCounts)} | recovery(sub+close)/withNext=${rec}/${withNext.length} (${pct(rec, withNext.length)})`);
  console.log(`  retry: ${sum(dc.dry9RetryCounts)} | retried=${retried.length} retrySubstantive=${retrySub} (${pct(retrySub, retried.length)})`);
  console.log(`  pick: ${sum(dc.dry9PickCounts)} | pos: ${sum(dc.dry9PosBuckets)} | ctrDry=${dc.counterDryTotal} ctrSelf=${dc.counterSelfTotal}`);
  pooled.convos += dc.totalConvos || 0; pooled.dry9 += dc.dry9Lines || 0;
  pooled.endConvos += dc.dry9EndConvoCount || 0;
  for (const [k, v] of Object.entries(dc.dry9FollowCounts || {})) pooled.follow[k] = (pooled.follow[k] || 0) + v;
  for (const [k, v] of Object.entries(dc.dry9RetryCounts || {})) pooled.retry[k] = (pooled.retry[k] || 0) + v;
  for (const [k, v] of Object.entries(dc.dry9PickCounts || {})) pooled.pick[k] = (pooled.pick[k] || 0) + v;
  for (const [k, v] of Object.entries(dc.dry9PosBuckets || {})) pooled.pos[k] = (pooled.pos[k] || 0) + v;
  pooled.retried += retried.length; pooled.retrySub += retrySub;
}
const withNextP = pooled.dry9 - (pooled.follow.end || 0);
const recP = (pooled.follow.substantive || 0) + (pooled.follow.close || 0);
console.log(`POOLED: convos=${pooled.convos} dry9=${pooled.dry9} dry9/convo=${pooled.convos ? (pooled.dry9 / pooled.convos).toFixed(3) : 'n/a'}`);
console.log(`POOLED follow: ${sum(pooled.follow)} | recovery=${recP}/${withNextP} (${pct(recP, withNextP)}) | end-on-dry9 convos=${pooled.endConvos} (${pct(pooled.endConvos, pooled.convos)} of convos)`);
console.log(`POOLED retry: ${sum(pooled.retry)} | retried=${pooled.retried} retrySubstantive=${pooled.retrySub} (${pct(pooled.retrySub, pooled.retried)})`);
console.log(`POOLED pick: ${sum(pooled.pick)} | pos: ${sum(pooled.pos)}`);
const topPick = Object.entries(pooled.pick).sort((a, b) => b[1] - a[1])[0];
if (topPick) console.log(`POOLED top pick class: ${topPick[0]} ${topPick[1]}/${pooled.dry9} (${pct(topPick[1], pooled.dry9)})`);
// Prereg verdict lines (bars bind; this printout is the record).
const recRate = withNextP ? recP / withNextP : 0;
const endRate = pooled.convos ? pooled.endConvos / pooled.convos : 0;
console.log(`VERDICT-RECOVERY: ${recRate >= 0.85 && endRate < 0.05 ? 'HESITATION' : 'WART'} (recovery ${pct(recP, withNextP)} bar >=85%; end-on-dry9 ${pct(pooled.endConvos, pooled.convos)} bar <5%)`);
console.log(`VERDICT-REPLICATION: ${pooled.convos && pooled.dry9 / pooled.convos >= 0.20 && pooled.dry9 / pooled.convos <= 0.40 ? 'IN-BAND' : 'OUT-OF-BAND'} (dry9/convo band [0.20, 0.40])`);
