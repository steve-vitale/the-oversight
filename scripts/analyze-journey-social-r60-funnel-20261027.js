#!/usr/bin/env node
// analyze-journey-social-r60-funnel-20261027.js -- STALL CENSUS + funnel guardrails.
// Reads evidence/2026-10-27/r60/journey-social-r60-s<seed>.json for seeds
// 5501-5504 (or SEEDS env) and prints per-seed + pooled stall census,
// stall-preceding-pick split, stall-follow classes, and r59 guardrails.
// No game code, no RNG: pure JSON aggregation.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const EVIDIR = path.join(REPO, 'evidence', '2026-10-27', 'r60');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [5501, 5502, 5503, 5504]).filter(Number.isFinite);

function followClass(text) {
  const t = String(text || '');
  if (/lost my train of thought/i.test(t)) return 'another-stall';
  if (/bye|goodbye|\bleave\b|talk again|talk later|rest when you can|we'll talk/i.test(t)) return 'close';
  if (/remind|where were|were saying|back to|so,? (you|we) were|anyway/i.test(t)) return 'recap';
  if (/\?/.test(t)) return 'question';
  return 'other';
}

function main() {
  const pooled = { convos: 0, deep: 0, stalls: 0, withStall: 0, deepStalls: 0, hist: { '0': 0, '1': 0, '2': 0, '3+': 0 }, prePick: {}, follows: {}, followSamples: { other: [] }, noFollows: 0 };
  const guard = [];
  for (const s of SEEDS) {
    const f = path.join(EVIDIR, `journey-social-r60-s${s}.json`);
    if (!fs.existsSync(f)) { console.log(`SEED ${s}: MISSING ${f}`); continue; }
    const r = JSON.parse(fs.readFileSync(f, 'utf8'));
    const c = r.stallCensus || {};
    console.log(`SEED ${s}: days=${r.days} alive=${r.alive} deep2=${(r.deep2Pairs || []).length} convos=${c.totalConvos} deep=${c.deepConvos} stalls=${c.totalStallLines} stallsPerConvo=${(c.stallsPerConvo || 0).toFixed(3)} shareWith=${((c.shareWithStall || 0) * 100).toFixed(1)}% stallsPerDeep=${(c.stallsPerDeepConvo || 0).toFixed(3)} hist=${JSON.stringify(c.hist)} prePick=${JSON.stringify(c.prePick)}`);
    pooled.convos += c.totalConvos || 0; pooled.deep += c.deepConvos || 0; pooled.stalls += c.totalStallLines || 0; pooled.withStall += c.convosWithStall || 0; pooled.deepStalls += c.deepStallLines || 0;
    for (const k of ['0', '1', '2', '3+']) pooled.hist[k] += (c.hist || {})[k] || 0;
    for (const [k, v] of Object.entries(c.prePick || {})) pooled.prePick[k] = (pooled.prePick[k] || 0) + v;
    const follows = c.follows || [];
    for (const fl of follows) {
      const cls = followClass(fl.text);
      pooled.follows[cls] = (pooled.follows[cls] || 0) + 1;
      if (cls === 'other' && pooled.followSamples.other.length < 10) pooled.followSamples.other.push({ seed: s, day: fl.day, name: fl.name, who: fl.who, text: fl.text });
    }
    pooled.noFollows += (c.totalStallLines || 0) - follows.length;
    const fu = r.funnelUnsteered || {};
    const fn = r.funnel || {};
    guard.push({ seed: s, unsteered: fu.totalNaturalUnsteered, noOffer: fu.subjectNoOffer, latePicks: fu.latePicks, naturalConvos: r.naturalConvos, l3: r.l3, funnelClasses: fn.classes });
    console.log(`  GUARD seed ${s}: funnelUnsteered=${JSON.stringify(fu)} funnel=${JSON.stringify(fn)} l3=${JSON.stringify(r.l3)}`);
  }
  const n = pooled.convos;
  console.log(`POOLED: convos=${n} deep=${pooled.deep} stalls=${pooled.stalls} stallsPerConvo=${n ? (pooled.stalls / n).toFixed(3) : 'n/a'} shareWith=${n ? ((pooled.withStall / n) * 100).toFixed(1) : 'n/a'}% stallsPerDeep=${pooled.deep ? (pooled.deepStalls / pooled.deep).toFixed(3) : 'n/a'} hist=${JSON.stringify(pooled.hist)} prePick=${JSON.stringify(pooled.prePick)} follows=${JSON.stringify(pooled.follows)} noFollow=${pooled.noFollows}`);
  console.log(`FOLLOW-OTHER SAMPLES: ${JSON.stringify(pooled.followSamples.other, null, 1)}`);
  console.log(`GUARDRAILS: ${JSON.stringify(guard, null, 1)}`);
}
main();
