#!/usr/bin/env node
// analyze-journey-social-r67-20261029.js -- OPENING-GAP + EMPTY-TURN +
// SPEAKER-CONCENTRATION (lane B, social r67).
// Reads evidence/2026-10-29/r67/journey-social-r67-s<seed>.json for seeds
// 6201-6204 (or SEEDS env) and prints per-seed + pooled:
//  - gapBefore (counter - turn-scanned dry) and gapAfter (counter -
//    turn-scanned - opening dry): GAP-CLOSES iff gapAfter == 0 per seed.
//    openingConvosScanned must equal totalConvos or the scan is not live.
//  - empty-turn census (built in-driver, since the per-seed JSON deletes
//    _convoLog): count, by pickId, mid vs last, mid-next distribution,
//    and any mid-conversation non-navigation dead picks.
//  - speaker concentration: per speaker, convos, dry9 (turn + opening),
//    dry9 share vs convo share. INTERESTING iff the top speaker's dry9
//    share exceeds their convo share by >= 10pp.
// Pure JSON aggregation; no game code, no RNG.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const EVIDIR = path.join(REPO, 'evidence', '2026-10-29', 'r67');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [6201, 6202, 6203, 6204]).filter(Number.isFinite);

function main() {
  const pooled = { convos: 0, scannedConvos: 0, ctr: 0, scanned: 0, opening: 0, opening9: 0, opening3: 0,
    empty: 0, emptyMid: 0, emptyLast: 0, emptyMidNonNav: 0, byPick: {}, midNext: {},
    speakers: {}, deadPicks: [] };
  let allClosed = true;
  for (const s of SEEDS) {
    const f = path.join(EVIDIR, `journey-social-r67-s${s}.json`);
    let r;
    try { r = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { console.log(`SEED ${s}: MISSING/UNPARSEABLE ${f}`); allClosed = false; continue; }
    const dc = r.dryCensus || {};
    const et = dc.emptyTurnCensus || {};
    const scanLive = (dc.openingConvosScanned || 0) === (dc.totalConvos || 0);
    if (dc.gapAfter !== 0) allClosed = false;
    console.log(`SEED ${s}: days=${r.days} alive=${r.alive} convos=${dc.totalConvos} scanLive=${scanLive} (scanned ${dc.openingConvosScanned}/${dc.totalConvos} convos, ${dc.openingEntriesScanned} opening entries) ctr=${dc.counterDryTotal} scanned=${dc.totalDryLines} opening=${dc.openingDryTotal} (dry9=${dc.openingDry9Total} self3=${dc.openingSelf3Total}) gapBefore=${dc.gapBefore} gapAfter=${dc.gapAfter} GAP=${dc.gapAfter === 0 ? 'CLOSED' : 'OPEN'}`);
    console.log(`  EMPTY seed ${s}: total=${et.total || 0} mid=${et.mid || 0} last=${et.last || 0} midNonNav=${et.midNonNav || 0} byPick=${JSON.stringify(et.byPick || {})} midNext=${JSON.stringify(et.midNext || {})}`);
    for (const d of (et.deadPicks || []).slice(0, 20)) console.log(`  DEAD-PICK seed ${s}: day ${d.day} ${d.name} turn ${d.turn}/${d.turnsTotal} pick=${d.pickId}`);
    if ((et.deadPicks || []).length > 20) console.log(`  DEAD-PICK seed ${s}: ... +${(et.deadPicks || []).length - 20} more`);
    const sp = dc.speakerDry9 || {};
    const totConvos = dc.totalConvos || 0;
    const totDry9 = Object.values(sp).reduce((a, v) => a + v.dry9, 0);
    const ranked = Object.entries(sp).sort((a, b) => b[1].dry9 - a[1].dry9).slice(0, 5);
    for (const [name, v] of ranked) {
      const cs = totConvos ? (100 * v.convos / totConvos) : 0;
      const ds = totDry9 ? (100 * v.dry9 / totDry9) : 0;
      console.log(`  SPEAKER seed ${s}: ${name} convos=${v.convos} (${cs.toFixed(1)}%) dry9=${v.dry9} (${ds.toFixed(1)}%) diff=${(ds - cs).toFixed(1)}pp`);
    }
    pooled.convos += dc.totalConvos || 0; pooled.scannedConvos += dc.openingConvosScanned || 0;
    pooled.ctr += dc.counterDryTotal || 0; pooled.scanned += dc.totalDryLines || 0;
    pooled.opening += dc.openingDryTotal || 0; pooled.opening9 += dc.openingDry9Total || 0; pooled.opening3 += dc.openingSelf3Total || 0;
    pooled.empty += et.total || 0; pooled.emptyMid += et.mid || 0; pooled.emptyLast += et.last || 0; pooled.emptyMidNonNav += et.midNonNav || 0;
    for (const [k, v] of Object.entries(et.byPick || {})) pooled.byPick[k] = (pooled.byPick[k] || 0) + v;
    for (const [k, v] of Object.entries(et.midNext || {})) pooled.midNext[k] = (pooled.midNext[k] || 0) + v;
    for (const d of (et.deadPicks || [])) pooled.deadPicks.push(Object.assign({ seed: s }, d));
    for (const [name, v] of Object.entries(sp)) {
      pooled.speakers[name] = pooled.speakers[name] || { convos: 0, dry9: 0 };
      pooled.speakers[name].convos += v.convos; pooled.speakers[name].dry9 += v.dry9;
    }
  }
  const pooledGapAfter = pooled.ctr - pooled.scanned - pooled.opening;
  console.log(`POOLED: convos=${pooled.convos} scanLive=${pooled.scannedConvos === pooled.convos} (${pooled.scannedConvos}/${pooled.convos}) ctr=${pooled.ctr} scanned=${pooled.scanned} opening=${pooled.opening} (dry9=${pooled.opening9} self3=${pooled.opening3}) gapBefore=${pooled.ctr - pooled.scanned} gapAfter=${pooledGapAfter} GAP=${allClosed ? 'CLOSED (all seeds)' : 'OPEN'}`);
  console.log(`POOLED empty: total=${pooled.empty} mid=${pooled.emptyMid} last=${pooled.emptyLast} midNonNav=${pooled.emptyMidNonNav} byPick=${JSON.stringify(pooled.byPick)} midNext=${JSON.stringify(pooled.midNext)}`);
  console.log(`POOLED empty verdict: ${pooled.emptyMidNonNav === 0 ? 'EXPLAINED (zero mid-conversation non-navigation empty turns)' : 'DEAD-PICK (' + pooled.emptyMidNonNav + ' mid-conversation non-navigation empty turns)'}`);
  for (const d of pooled.deadPicks.slice(0, 20)) console.log(`POOLED dead-pick: seed ${d.seed} day ${d.day} ${d.name} turn ${d.turn}/${d.turnsTotal} pick=${d.pickId}`);
  const ranked = Object.entries(pooled.speakers).sort((a, b) => b[1].dry9 - a[1].dry9).slice(0, 5);
  const totDry9 = Object.values(pooled.speakers).reduce((a, x) => a + x.dry9, 0);
  for (const [name, v] of ranked) {
    const cs = pooled.convos ? (100 * v.convos / pooled.convos) : 0;
    const dshare = totDry9 ? (100 * v.dry9 / totDry9) : 0;
    console.log(`POOLED speaker: ${name} convos=${v.convos} (${cs.toFixed(1)}%) dry9=${v.dry9} (${dshare.toFixed(1)}%) diff=${(dshare - cs).toFixed(1)}pp`);
  }
  if (ranked.length) {
    const [topName, top] = ranked[0];
    const cs = pooled.convos ? (100 * top.convos / pooled.convos) : 0;
    const dshare = totDry9 ? (100 * top.dry9 / totDry9) : 0;
    console.log(`POOLED speaker verdict: ${((dshare - cs) >= 10) ? 'INTERESTING' : 'SPREAD'} (top ${topName} diff ${(dshare - cs).toFixed(1)}pp, bar >=10pp)`);
  }
}
main();
