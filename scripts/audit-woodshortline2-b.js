#!/usr/bin/env node
// audit-woodshortline2-b.js — tail audit for sim-woodshortline2-b.
// Own instrument for this run (not copied from the prior branch).
// Reads the judged ON corpus and the guard corpus, rebuilds the
// staged linkage from the raw evening rows, and prints for every
// staged wood-short evening its FULL eveningSayTail with checks,
// plus rescued and other-still summaries.
// Usage:
//   node scripts/audit-woodshortline2-b.js <onDir> <guardDir> [outJson]
// Stdout is redirected by the caller to the tail-audit .txt file.
'use strict';
const fs = require('fs');
const path = require('path');

const onDir = process.argv[2];
const guardDir = process.argv[3] || null;
const outJson = process.argv[4] || null;
if (!onDir) { console.error('usage: audit-woodshortline2-b.js <onDir> <guardDir> [outJson]'); process.exit(2); }

function loadDir(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

// The landed woodcarry lacking line, wood-short branch. "log" vs "logs"
// handled by logs? so the singular night (1 log) parses too.
const WOOD_RE = /No bridge tonight — the pack holds (\d+) logs?, and a bridge needs 4\./;
const REFUSAL_RE = /No bridge tonight/;
// A still-refused evening must not claim the crossing it was refused.
const STILL_CONTRA_RE = /(lash logs together|bridge spans|bridge (stands|is built)|you cross|reached home|You (walk|step) (home|across))/i;
// Warmth-outcome lines, used only to order refusal vs same-night fire.
const FIRE_RE = /(tinder catches|Nothing\. Your arms ache|got the knack|friction fire is yours)/;

function classify(inst) {
  const evs = inst.evenings || [];
  const byDay = new Map(evs.map((e) => [e.loopDay, e]));
  const staged = [], rescued = [], otherStill = [];
  for (const e of evs) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') continue;
    const cls = wc.classification || {};
    if (wc.rescued) { rescued.push({ e, wc, cls }); continue; }
    const skip = (wc.bridge && wc.bridge.skip) || '(no-bridge-record)';
    if (skip !== 'wood-short') { otherStill.push({ e, wc, cls, skip }); continue; }
    // Most recent earlier spend night, then refill check.
    let spendNight = null, spendRec = null;
    for (let d = e.loopDay - 1; d >= 1; d--) {
      const pw = (byDay.get(d) || {}).warmth;
      if (pw && pw.acted && pw.fireLit && pw.logSpent >= 1) { spendNight = d; spendRec = pw; break; }
    }
    let refillDay = null;
    if (spendNight !== null) {
      for (let m = spendNight + 1; m <= e.loopDay; m++) {
        const mc = (byDay.get(m) || {}).woodcarryCarry;
        if (mc && mc.acted) { refillDay = m; break; }
      }
    }
    const isStaged = spendNight !== null && refillDay === null;
    staged.push({ e, wc, cls, spendNight, spendRec, refillDay, isStaged });
  }
  return { staged, rescued, otherStill };
}

function auditStaged(s) {
  const tail = s.e.eveningSayTail || [];
  const counts = [];
  let refusalIdx = -1;
  const fireIdxs = [];
  tail.forEach((line, i) => {
    const m = String(line).match(WOOD_RE);
    if (m) counts.push(parseInt(m[1], 10));
    if (refusalIdx === -1 && REFUSAL_RE.test(String(line))) refusalIdx = i;
    if (FIRE_RE.test(String(line))) fireIdxs.push(i);
  });
  const contra = tail.filter((l) => STILL_CONTRA_RE.test(String(l)));
  const ok = s.isStaged && counts.length >= 1 && counts.every((n) => n === s.cls.woodPlayer)
    && contra.length === 0 && refusalIdx >= 0
    && fireIdxs.every((fi) => refusalIdx < fi);
  return { seed: s.e.seed ?? null, loopDay: s.e.loopDay, spendNight: s.spendNight,
    refillDay: s.refillDay, isStaged: s.isStaged, woodPlayer: s.cls.woodPlayer,
    kcalLive: s.cls.kcalLive, ticksToDayEnd: s.cls.ticksToDayEnd,
    narration: s.wc.narration || null, lineCounts: counts, refusalIdx, fireIdxs,
    contraLines: contra, ok, tail: tail.slice() };
}

const result = { staged: [], rescued: [], otherStill: [], guardSummary: [] };
for (const inst of loadDir(onDir)) {
  const { staged, rescued, otherStill } = classify(inst);
  console.log('=== ON seed ' + inst.seed + ': staged=' + staged.filter((s) => s.isStaged).length
    + ' rescued=' + rescued.length + ' otherStill=' + otherStill.length + ' ===');
  for (const s of staged) {
    const rec = auditStaged(s);
    rec.seed = inst.seed;
    result.staged.push(rec);
    console.log('-- STAGED seed ' + inst.seed + ' night ' + s.e.loopDay + ' spendNight ' + s.spendNight
      + ' wood=' + s.cls.woodPlayer + ' counts=' + JSON.stringify(rec.lineCounts)
      + ' refusalIdx=' + rec.refusalIdx + ' fireIdxs=' + JSON.stringify(rec.fireIdxs)
      + ' contra=' + rec.contraLines.length + ' ok=' + rec.ok + (s.isStaged ? '' : ' UNSTAGED refillDay=' + s.refillDay));
    console.log('   narration: ' + JSON.stringify(rec.narration));
    rec.tail.forEach((l, i) => console.log('   tail[' + i + '] ' + l));
  }
  for (const r of rescued) {
    const tail = r.e.eveningSayTail || [];
    const refusals = tail.filter((l) => REFUSAL_RE.test(String(l)));
    const rec = { seed: inst.seed, loopDay: r.e.loopDay, woodPlayer: r.cls.woodPlayer,
      refusalLines: refusals,
      hasLash: tail.some((l) => /lash logs together/.test(String(l))),
      hasWalkHome: tail.some((l) => /walk back into Haven/.test(String(l))),
      tail: tail.slice() };
    result.rescued.push(rec);
    console.log('-- RESCUED seed ' + inst.seed + ' night ' + r.e.loopDay + ' wood=' + r.cls.woodPlayer
      + ' refusalLines=' + refusals.length + ' lash=' + rec.hasLash + ' walkHome=' + rec.hasWalkHome);
    tail.forEach((l, i) => console.log('   tail[' + i + '] ' + l));
  }
  for (const o of otherStill) {
    const tail = o.e.eveningSayTail || [];
    const rec = { seed: inst.seed, loopDay: o.e.loopDay, skip: o.skip, woodPlayer: o.cls.woodPlayer,
      narration: o.wc.narration || null, tail: tail.slice() };
    result.otherStill.push(rec);
    console.log('-- OTHER-STILL seed ' + inst.seed + ' night ' + o.e.loopDay + ' skip=' + o.skip
      + ' wood=' + o.cls.woodPlayer + ' narration=' + JSON.stringify(rec.narration));
    tail.forEach((l, i) => console.log('   tail[' + i + '] ' + l));
  }
}
if (guardDir) {
  console.log('=== GUARD summary only ===');
  for (const inst of loadDir(guardDir)) {
    let creek = 0, still = 0, rescuedN = 0, woodShort = 0;
    for (const e of inst.evenings || []) {
      const wc = e.woodcarry || {};
      if (wc.bucket !== 'creek') continue;
      creek++;
      if (wc.rescued) rescuedN++;
      else { still++; if (wc.bridge && wc.bridge.skip === 'wood-short') woodShort++; }
    }
    result.guardSummary.push({ seed: inst.seed, creek, still, rescued: rescuedN, woodShort });
    console.log('guard seed ' + inst.seed + ': creek=' + creek + ' still=' + still + ' rescued=' + rescuedN + ' woodShort=' + woodShort);
  }
}
const stagedN = result.staged.filter((s) => s.isStaged).length;
const namedN = result.staged.filter((s) => s.isStaged && s.ok).length;
console.log('SUMMARY staged=' + stagedN + ' namedOk=' + namedN + ' rescued=' + result.rescued.length
  + ' rescuedWithRefusal=' + result.rescued.filter((r) => r.refusalLines.length > 0).length
  + ' otherStill=' + result.otherStill.length);
if (outJson) fs.writeFileSync(outJson, JSON.stringify(result, null, 2));
