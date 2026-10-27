#!/usr/bin/env node
// analyze-journey-social-r61-funnel-20261027.js -- DRY-FAMILY CENSUS.
// Reads evidence/2026-10-27/r61/journey-social-r61-s<seed>.json for seeds
// 5601-5604 (or SEEDS env) and prints per-seed + pooled dry-family census
// (all 12 deflection lines), pool split, preceding-pick split, follow
// classes, end-on-dry share, counter cross-check, train-line comparison
// to r60's 0.891 baseline, and r59/r60 guardrails. No game code, no RNG:
// pure JSON aggregation.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const EVIDIR = path.join(REPO, 'evidence', '2026-10-27', 'r61');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [5601, 5602, 5603, 5604]).filter(Number.isFinite);

function main() {
  const pooled = { convos: 0, dry: 0, dry9: 0, self3: 0, withDry: 0, endDry: 0, stalls: 0, follows: {}, prePick: {}, prePick9: {}, hist: { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5+': 0 }, ctrDry: 0, ctrSelf: 0, noOffer: 0, unsteered: 0, latePicks: 0, deep2: 0, alive: [] };
  for (const s of SEEDS) {
    const f = path.join(EVIDIR, `journey-social-r61-s${s}.json`);
    if (!fs.existsSync(f)) { console.log(`SEED ${s}: MISSING ${f}`); continue; }
    const r = JSON.parse(fs.readFileSync(f, 'utf8'));
    const d = r.dryCensus || {};
    const sc = r.stallCensus || {};
    const fu = r.funnelUnsteered || {};
    console.log(`SEED ${s}: days=${r.days} alive=${r.alive} deep2=${(r.deep2Pairs || []).length} convos=${d.totalConvos} dry=${d.totalDryLines} dry/convo=${(d.dryPerConvo || 0).toFixed(3)} shareWith=${((d.shareWithDry || 0) * 100).toFixed(1)}% dry9=${d.dry9Lines} self3=${d.self3Lines} endDry=${d.convosEndingOnDry} (${((d.shareEndingOnDry || 0) * 100).toFixed(1)}%) hist=${JSON.stringify(d.hist)} prePick=${JSON.stringify(d.prePick)} follows=${JSON.stringify(d.followCounts)} noFollow=${d.noFollow} ctr=${d.counterDryTotal}/${d.counterSelfTotal}`);
    console.log(`  TRAIN-COMPARE seed ${s}: stalls=${sc.totalStallLines} stalls/convo=${(sc.stallsPerConvo || 0).toFixed(3)} shareWith=${((sc.shareWithStall || 0) * 100).toFixed(1)}% noOffer=${fu.subjectNoOffer}/${fu.totalNaturalUnsteered} latePicks=${fu.latePicks}`);
    pooled.convos += d.totalConvos || 0; pooled.dry += d.totalDryLines || 0; pooled.dry9 += d.dry9Lines || 0; pooled.self3 += d.self3Lines || 0;
    pooled.withDry += d.convosWithDry || 0; pooled.endDry += d.convosEndingOnDry || 0; pooled.stalls += sc.totalStallLines || 0;
    pooled.ctrDry += d.counterDryTotal || 0; pooled.ctrSelf += d.counterSelfTotal || 0;
    pooled.noOffer += fu.subjectNoOffer || 0; pooled.unsteered += fu.totalNaturalUnsteered || 0; pooled.latePicks += fu.latePicks || 0;
    pooled.deep2 += (r.deep2Pairs || []).length; pooled.alive.push(r.alive);
    for (const k of Object.keys(pooled.hist)) pooled.hist[k] += (d.hist || {})[k] || 0;
    for (const [k, v] of Object.entries(d.prePick || {})) pooled.prePick[k] = (pooled.prePick[k] || 0) + v;
    for (const [k, v] of Object.entries(d.prePick9 || {})) pooled.prePick9[k] = (pooled.prePick9[k] || 0) + v;
    for (const [k, v] of Object.entries(d.followCounts || {})) pooled.follows[k] = (pooled.follows[k] || 0) + v;
  }
  const n = pooled.convos;
  console.log(`POOLED: convos=${n} dry=${pooled.dry} dry/convo=${n ? (pooled.dry / n).toFixed(3) : 'n/a'} shareWith=${n ? ((pooled.withDry / n) * 100).toFixed(1) : 'n/a'}% dry9=${pooled.dry9} (${pooled.dry ? ((pooled.dry9 / pooled.dry) * 100).toFixed(1) : 'n/a'}%) self3=${pooled.self3} (${pooled.dry ? ((pooled.self3 / pooled.dry) * 100).toFixed(1) : 'n/a'}%) endDry=${pooled.endDry} (${n ? ((pooled.endDry / n) * 100).toFixed(1) : 'n/a'}%) hist=${JSON.stringify(pooled.hist)}`);
  console.log(`POOLED prePick=${JSON.stringify(pooled.prePick)} prePick9=${JSON.stringify(pooled.prePick9)} follows=${JSON.stringify(pooled.follows)} ctrDry=${pooled.ctrDry} ctrSelf=${pooled.ctrSelf} ctrTotal=${pooled.ctrDry + pooled.ctrSelf} (transcript dry=${pooled.dry})`);
  console.log(`POOLED train-compare: stalls=${pooled.stalls} stalls/convo=${n ? (pooled.stalls / n).toFixed(3) : 'n/a'} (r60 baseline 0.891) dry-to-train ratio=${pooled.stalls ? (pooled.dry / pooled.stalls).toFixed(2) : 'n/a'}x`);
  console.log(`POOLED guardrails: noOffer=${pooled.noOffer}/${pooled.unsteered} (${pooled.unsteered ? ((pooled.noOffer / pooled.unsteered) * 100).toFixed(1) : 'n/a'}%, r60 9.2%) latePicks=${pooled.latePicks} (r60 443) deep2=${pooled.deep2} (r60 93) alive=${pooled.alive.join('/')} (r60 7/7/8/8)`);
}
main();
