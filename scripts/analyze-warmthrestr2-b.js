#!/usr/bin/env node
// analyze-warmthrestr2-b.js — census + staged linkage + strand runs +
// restraint/divergence scan for sim-warmthrestr2-b corpora (scripts/warmthrestr2-trace-b.js).
// Usage: node scripts/analyze-woodwarm-b.js <corpusDir> [outJson]
// Reads one JSON file per seed, prints a human summary, and writes
// the machine census to outJson when given. Pure reads; no game code.
//
// STAGED definition (prereg): a creek evening whose bridge skip is
// 'wood-short' AND for which some EARLIER loop-day evening has a
// warmth record acted=true, fireLit=true, logSpent>=1, AND no
// morning carry acted=true on any loop-day strictly after the
// spend night and up to and including the staged evening's
// loop-day (carry records live on the evening row of their own
// loop-day: row.loopDay's woodcarryCarry is that morning's carry).
// The staged evening's own warmth action never stages itself.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: analyze-warmthrestr2-b.js <corpusDir> [outJson]'); process.exit(2); }
const outJson = process.argv[3] || null;

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const strandsBySeed = {}; const restraintMissDetail = []; let woodMaxCreek = null; let packGe5Evenings = 0; let sub4WithoutSpend = 0;
const perSeed = {};
const missReasons = {};
const stillSkip = {};
const woodVals = [];
let seeds = 0, evenings = 0, creekEvenings = 0, stillRefused = 0, rescued = 0;
let warmActed = 0, warmLogSpent = 0, warmFireFailed = 0, warmRecords = 0;
const staged = [];
const nextNightAfterSpend = [];
const spendEvents = [];
let havenMornings = 0, pileMinAfterDay1 = null, pileMinDay = null, pileFloorAfterDay1 = 0;
const pileByDay = {};
let offLeverLines = 0, offWarmActed = 0;

for (const f of files) {
  const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const s = inst.seed;
  seeds++;
  const evs = inst.evenings || [];
  evenings += evs.length;
  const byDay = {};
  for (const e of evs) byDay[e.loopDay] = e;
  perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0, warmActed: 0, warmLogSpent: 0 };
  for (const e of evs) {
    const wc = e.woodcarry || {};
    const ww = e.warmth || null;
    if (ww) {
      warmRecords++;
      if (ww.acted) {
        warmActed++; perSeed[s].warmActed++;
        if (ww.fireLit && ww.logSpent && ww.logSpent >= 1) {
          warmLogSpent++; perSeed[s].warmLogSpent++;
          spendEvents.push({ seed: s, nightN: e.loopDay, woodBefore: ww.woodBefore, woodAfter: ww.woodAfter,
            branchesBefore: ww.branchesBefore, kcalBefore: ww.kcalBefore, kcalAfter: ww.kcalAfter,
            ticksBefore: ww.ticksBefore, ground: ww.ground });
        } else if (ww.acted && !ww.fireLit) warmFireFailed++;
      } else if (ww.miss && ww.miss !== 'lever-off') {
        missReasons[ww.miss] = (missReasons[ww.miss] || 0) + 1;
        if (ww.miss.startsWith('restraint-')) restraintMissDetail.push({ seed: s, loopDay: e.loopDay, miss: ww.miss, woodBefore: ww.woodBefore, branchesBefore: ww.branchesBefore, ticksLeft: ww.ticksLeft, fireCost: ww.fireCost, ground: ww.ground });
      }
    }
    for (const line of (e.eveningSayTail || [])) {
      if (typeof line === 'string' && line.indexOf('No bridge tonight') >= 0) offLeverLines++;
    }
    const cr = e.woodcarryCarry || null;
    if (cr && cr.skip && cr.skip !== 'not-at-haven' && cr.skip !== 'game-over' && cr.skip !== 'combat' && cr.skip !== 'lever-off' && cr.pileBefore !== undefined && cr.pileBefore !== null) {
      havenMornings++;
      (pileByDay[e.loopDay] = pileByDay[e.loopDay] || []).push(cr.pileBefore);
      if (e.loopDay > 1 && cr.skip === 'pile-floor') pileFloorAfterDay1++;
    }
    if (wc.bucket !== 'creek') continue;
    creekEvenings++; perSeed[s].creek++;
    const cls = wc.classification || {};
    woodVals.push(cls.woodPlayer);
    if (cls.woodPlayer !== null && cls.woodPlayer !== undefined) { if (woodMaxCreek === null || cls.woodPlayer > woodMaxCreek) woodMaxCreek = cls.woodPlayer; if (cls.woodPlayer >= 5) packGe5Evenings++; }
    if (wc.rescued) { rescued++; perSeed[s].rescued++; }
    else {
      stillRefused++; perSeed[s].still++;
      (strandsBySeed[s] = strandsBySeed[s] || []).push(e.loopDay);
      const sk = (wc.bridge && wc.bridge.skip) || '(no-bridge-record)';
      stillSkip[sk] = (stillSkip[sk] || 0) + 1;
    }
    // Staged linkage (walk-back, refill-checked).
    if (wc.bridge && wc.bridge.skip === 'wood-short') {
      let best = null;
      for (let d = e.loopDay - 1; d >= 1; d--) {
        const prev = byDay[d];
        const pw = prev ? prev.warmth : null;
        if (!(pw && pw.acted && pw.fireLit && pw.logSpent >= 1)) continue;
        let refill = null;
        for (let m = d + 1; m <= e.loopDay; m++) {
          const mr = byDay[m];
          const mc = mr ? mr.woodcarryCarry : null;
          if (mc && mc.acted) { refill = m; break; }
        }
        best = { seed: s, nightN: d, nightNp1: e.loopDay, woodPlayer: cls.woodPlayer,
          kcal: cls.kcalLive, ticks: cls.ticksToDayEnd, narration: wc.narration || null,
          warmWoodBefore: pw.woodBefore, warmWoodAfter: pw.woodAfter,
          refillLoopDay: refill, eveningSayTail: e.eveningSayTail || [] };
        break; // most recent spend night is the staging candidate
      }
      if (best && best.refillLoopDay === null) staged.push(best);
      else if (best) {
        // Spend existed but a haven-morning refill intervened: not staged.
        nextNightAfterSpend.push({ seed: s, note: 'refilled-spend-not-staged', nightN: best.nightN, nightNp1: best.nightNp1, refillLoopDay: best.refillLoopDay });
      }
    }
  }
  // Next-night outcomes after every log-spend warmth event.
  for (const e of evs) {
    const ww = e.warmth || null;
    if (!(ww && ww.acted && ww.fireLit && ww.logSpent >= 1)) continue;
    const nxt = byDay[e.loopDay + 1];
    if (!nxt) { nextNightAfterSpend.push({ seed: s, nightN: e.loopDay, nightNp1: null, outcome: '(no-next-evening)' }); continue; }
    const nwc = nxt.woodcarry || {};
    const carryNext = nxt.woodcarryCarry || null;
    nextNightAfterSpend.push({ seed: s, nightN: e.loopDay, nightNp1: e.loopDay + 1,
      outcome: nxt.eveningOutcome, bucket: nwc.bucket || null,
      bridgeSkip: (nwc.bridge && nwc.bridge.skip) || null,
      rescued: !!nwc.rescued, woodPlayer: (nwc.classification || {}).woodPlayer ?? null,
      inside: nxt.inside, tile: nxt.tile,
      morningCarryActed: !!(carryNext && carryNext.acted),
      morningCarrySkip: carryNext ? carryNext.skip : null });
  }
  for (const e of evs) if (e.warmth && e.warmth.acted) offWarmActed++;
}
// Strand runs: maximal consecutive still-refused creek loop-days per seed.
const strands = {};
for (const [seed, days] of Object.entries(strandsBySeed)) {
  const sorted = [...days].sort((a,b)=>a-b); const runs = []; let cur = [sorted[0]];
  for (let i=1;i<sorted.length;i++) { if (sorted[i] === sorted[i-1]+1) cur.push(sorted[i]); else { runs.push(cur); cur=[sorted[i]]; } }
  if (cur.length) runs.push(cur); strands[seed] = runs;
}
// Sub-4-without-spend: creek evening with wood<4 on a leg with no prior warmth log-spend for that seed.
for (const f2 of files) { const inst2 = JSON.parse(fs.readFileSync(path.join(dir, f2), 'utf8')); let spent=false; for (const e2 of inst2.evenings||[]) { const w2=e2.warmth||null; if (w2&&w2.acted&&w2.fireLit&&w2.logSpent>=1) spent=true; const wc2=e2.woodcarry||{}; if (wc2.bucket==='creek') { const wv=(wc2.classification||{}).woodPlayer; if (wv!==null&&wv!==undefined&&wv<4&&!spent) sub4WithoutSpend++; } } }
for (const d of Object.keys(pileByDay).map(Number).sort((a, b) => a - b)) {
  if (d <= 1) continue;
  for (const v of pileByDay[d]) {
    if (pileMinAfterDay1 === null || v < pileMinAfterDay1) { pileMinAfterDay1 = v; pileMinDay = d; }
  }
}
const pileDay1 = pileByDay[1] || [];

const census = { dir, seeds, files: files.length, evenings, creekEvenings, stillRefused, rescued,
  stillSkip, woodVals, perSeed,
  warmRecords, warmActed, warmLogSpent, warmFireFailed, missReasons,
  spendEvents, staged, nextNightAfterSpend,
  havenMornings, pileMinAfterDay1, pileMinDay, pileDay1, pileFloorAfterDay1,
  offLeverLines, offWarmActed, strands, restraintMissDetail, woodMaxCreek, packGe5Evenings, sub4WithoutSpend };

console.log('seeds: ' + seeds + ' files: ' + files.length + ' evenings: ' + evenings);
console.log('creek evenings: ' + creekEvenings + ' still-refused: ' + stillRefused + ' rescued: ' + rescued);
console.log('still skip breakdown: ' + JSON.stringify(stillSkip));
console.log('wood values on creek evenings: ' + JSON.stringify(woodVals));
console.log('warmth records: ' + warmRecords + ' acted: ' + warmActed + ' log-spent: ' + warmLogSpent + ' fire-failed: ' + warmFireFailed);
console.log('warmth miss reasons: ' + JSON.stringify(missReasons));
console.log('STAGED wood-short evenings: ' + staged.length);
for (const st of staged) console.log('  STAGED seed ' + st.seed + ' spend night ' + st.nightN + ' -> night ' + st.nightNp1 + ' wood ' + st.woodPlayer + ' warmth ' + st.warmWoodBefore + '->' + st.warmWoodAfter + ' | ' + st.narration);
console.log('spend events: ' + spendEvents.length);
for (const sp of spendEvents) console.log('  SPEND seed ' + sp.seed + ' night ' + sp.nightN + ' wood ' + sp.woodBefore + '->' + sp.woodAfter + ' branches ' + sp.branchesBefore + ' kcal ' + sp.kcalBefore + '->' + sp.kcalAfter + ' ticksLeft ' + sp.ticksBefore + ' ground ' + sp.ground);
console.log('next nights after log-spend warmth: ' + nextNightAfterSpend.length);
for (const nn of nextNightAfterSpend) console.log('  seed ' + nn.seed + ' N ' + nn.nightN + ' -> ' + nn.nightNp1 + ' outcome ' + nn.outcome + ' bucket ' + nn.bucket + ' skip ' + nn.bridgeSkip + ' rescued ' + nn.rescued + ' wood ' + nn.woodPlayer + ' inside ' + nn.inside + (nn.morningCarryActed !== undefined ? ' carryActed ' + nn.morningCarryActed : '') + (nn.note ? ' note ' + nn.note : ''));
console.log('haven mornings with pile: ' + havenMornings + ' pile min days 2+: ' + pileMinAfterDay1 + ' (day ' + pileMinDay + ') pile day1: ' + JSON.stringify(pileDay1) + ' pile-floor after day1: ' + pileFloorAfterDay1);
console.log('lever lines in tails: ' + offLeverLines + ' warmth acted records: ' + offWarmActed + ' (guard: acted must be 0 on guard legs)');
console.log('per-seed: ' + JSON.stringify(perSeed));
console.log('STRANDS: ' + JSON.stringify(strands));
console.log('RESTRAINT MISSES: ' + JSON.stringify(restraintMissDetail));
console.log('DIVERGENCE: woodMaxCreek=' + woodMaxCreek + ' packGe5Evenings=' + packGe5Evenings + ' sub4WithoutSpend=' + sub4WithoutSpend);
if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(census, null, 2)); console.log('wrote ' + outJson); }
