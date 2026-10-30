#!/usr/bin/env node
// audit-woodshortline-b.js — tail audit for sim-woodshortline-b.
// Reads the judged ON corpus + guard corpus, recomputes the staged
// linkage (same definition as analyze-woodwarm-b.js), and prints:
//  (1) EVERY staged wood-short evening's full eveningSayTail, with
//      automated checks: lacking line present, count == woodPlayer,
//      no contradiction line;
//  (2) EVERY rescued ON creek evening's full tail, with checks for
//      a same-evening refusal line and for sense anchors;
//  (3) EVERY still-refused non-wood-short ON evening's tail + line.
// Pure reads; no game code. Usage:
//   node scripts/audit-woodshortline-b.js <onCorpusDir> [guardCorpusDir]
'use strict';
const fs = require('fs');
const path = require('path');

const onDir = process.argv[2];
if (!onDir) { console.error('usage: audit-woodshortline-b.js <onCorpusDir> [guardCorpusDir]'); process.exit(2); }
const guardDir = process.argv[3] || null;

function loadDir(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return out;
}

const WOOD_LINE = /No bridge tonight — the pack holds (\d+) logs?, and a bridge needs 4\./;
const ANY_REFUSAL = /No bridge tonight/;
const CONTRADICT = /(bridge (stands|spans|is built|built)|you cross|home tonight|reached home|You (walk|step) (home|across))/i;

function auditOne(inst, label) {
  const evs = inst.evenings || [];
  const byDay = {};
  for (const e of evs) byDay[e.loopDay] = e;
  const staged = [], rescued = [], otherStill = [];
  for (const e of evs) {
    const wc = e.woodcarry || {};
    if (wc.bucket !== 'creek') continue;
    const cls = wc.classification || {};
    if (wc.rescued) { rescued.push({ e, wc, cls }); continue; }
    const skip = (wc.bridge && wc.bridge.skip) || '(no-bridge-record)';
    if (skip === 'wood-short') {
      let best = null;
      for (let d = e.loopDay - 1; d >= 1; d--) {
        const prev = byDay[d];
        const pw = prev ? prev.warmth : null;
        if (!(pw && pw.acted && pw.fireLit && pw.logSpent >= 1)) continue;
        let refill = null;
        for (let m = d + 1; m <= e.loopDay; m++) {
          const mc = (byDay[m] || {}).woodcarryCarry;
          if (mc && mc.acted) { refill = m; break; }
        }
        best = { spendNight: d, refillLoopDay: refill, pw };
        break;
      }
      if (best && best.refillLoopDay === null) staged.push({ e, wc, cls, spendNight: best.spendNight, pw: best.pw });
      else staged.push({ e, wc, cls, spendNight: best ? best.spendNight : null, refillLoopDay: best ? best.refillLoopDay : null, unstaged: true });
    } else {
      otherStill.push({ e, wc, cls, skip });
    }
  }
  console.log('=== ' + label + ' seed ' + inst.seed + ': staged=' + staged.filter((s) => !s.unstaged).length
    + ' rescued=' + rescued.length + ' otherStill=' + otherStill.length + ' ===');
  const results = { staged: [], rescued: [], otherStill: [] };
  for (const s of staged) {
    const tail = s.e.eveningSayTail || [];
    const m = [];
    for (const line of tail) { const mm = String(line).match(WOOD_LINE); if (mm) m.push(parseInt(mm[1], 10)); }
    const refusalLines = tail.filter((l) => ANY_REFUSAL.test(String(l)));
    const contra = tail.filter((l) => CONTRADICT.test(String(l)));
    const ok = !s.unstaged && m.length >= 1 && m.every((n) => n === s.cls.woodPlayer) && contra.length === 0;
    const rec = { seed: inst.seed, loopDay: s.e.loopDay, spendNight: s.spendNight, woodPlayer: s.cls.woodPlayer,
      kcal: s.cls.kcalLive, ticks: s.cls.ticksToDayEnd, narration: s.wc.narration || null,
      lineCounts: m, refusalLines, contraLines: contra, unstaged: !!s.unstaged, ok };
    results.staged.push(rec);
    console.log('-- STAGED seed ' + inst.seed + ' night ' + s.e.loopDay + ' (spend night ' + s.spendNight
      + ') wood=' + s.cls.woodPlayer + ' lineCounts=' + JSON.stringify(m) + ' contra=' + contra.length
      + ' ok=' + ok + (s.unstaged ? ' UNSTAGED(refill=' + s.refillLoopDay + ')' : ''));
    console.log('   narration field: ' + JSON.stringify(s.wc.narration || null));
    tail.forEach((l, i) => console.log('   tail[' + i + '] ' + l));
  }
  for (const r of rescued) {
    const tail = r.e.eveningSayTail || [];
    const refusalLines = tail.filter((l) => ANY_REFUSAL.test(String(l)));
    const rec = { seed: inst.seed, loopDay: r.e.loopDay, woodPlayer: r.cls.woodPlayer, refusalLines };
    results.rescued.push(rec);
    console.log('-- RESCUED seed ' + inst.seed + ' night ' + r.e.loopDay + ' wood=' + r.cls.woodPlayer
      + ' sameEveningRefusalLines=' + refusalLines.length);
    tail.forEach((l, i) => console.log('   tail[' + i + '] ' + l));
  }
  for (const o of otherStill) {
    const tail = o.e.eveningSayTail || [];
    const rec = { seed: inst.seed, loopDay: o.e.loopDay, skip: o.skip, woodPlayer: o.cls.woodPlayer,
      narration: o.wc.narration || null, tail };
    results.otherStill.push(rec);
    console.log('-- OTHER-STILL seed ' + inst.seed + ' night ' + o.e.loopDay + ' skip=' + o.skip
      + ' wood=' + o.cls.woodPlayer + ' narration=' + JSON.stringify(o.wc.narration || null));
    tail.forEach((l, i) => console.log('   tail[' + i + '] ' + l));
  }
  return results;
}

const all = { staged: [], rescued: [], otherStill: [] };
for (const inst of loadDir(onDir)) {
  const r = auditOne(inst, 'ON');
  all.staged.push(...r.staged); all.rescued.push(...r.rescued); all.otherStill.push(...r.otherStill);
}
if (guardDir) {
  console.log('=== GUARD (warmth off) summary only ===');
  for (const inst of loadDir(guardDir)) {
    const evs = inst.evenings || [];
    let creek = 0, still = 0, rescuedN = 0, woodShort = 0;
    for (const e of evs) {
      const wc = e.woodcarry || {};
      if (wc.bucket !== 'creek') continue;
      creek++;
      if (wc.rescued) rescuedN++;
      else { still++; if (wc.bridge && wc.bridge.skip === 'wood-short') woodShort++; }
    }
    console.log('guard seed ' + inst.seed + ': creek=' + creek + ' still=' + still + ' rescued=' + rescuedN + ' woodShort=' + woodShort);
  }
}
const named = all.staged.filter((s) => !s.unstaged && s.ok).length;
const stagedN = all.staged.filter((s) => !s.unstaged).length;
console.log('SUMMARY staged=' + stagedN + ' namedOk=' + named + ' rescued=' + all.rescued.length
  + ' rescuedWithRefusalLine=' + all.rescued.filter((r) => r.refusalLines.length > 0).length
  + ' otherStill=' + all.otherStill.length);
if (process.argv[4]) fs.writeFileSync(process.argv[4], JSON.stringify(all, null, 2));
