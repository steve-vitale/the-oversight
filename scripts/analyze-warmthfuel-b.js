#!/usr/bin/env node
// analyze-warmthfuel-b.js — strand-night warmth-fuel attribution for
// sim-warmthfuel-b corpora (scripts/warmthfuel-trace-b.js).
// Usage: node scripts/analyze-warmthfuel-b.js <corpusDir> [outJson]
// Pure reads; no game code. Gate numbers come from the kcalshort
// analyzer's classify() (bridge needs 4 logs, 60 kcal, 96 ticks).
// Attribution classes are fixed by the prereg
// (evidence/2026-10-31/sim-warmthfuel-b-prereg.md) and computed
// here, never inferred from narration alone.
'use strict';
const fs = require('fs');
const path = require('path');
const { classify } = require('./analyze-kcalshort-b.js');

const WOOD_NEEDED = 4, KCAL_NEEDED = 60, TICKS_NEEDED = 96;

// Warmth fire say lines (makeFire success copy) — these are the
// warmth fire itself, excluded from the other-fire scan.
const WARMTH_LINE_RE = /tinder catches|beard-moss tinder takes|Third fire|knack now/;
// Other-fuel scan is deliberately narrow: only player fuel-spending
// action lines (feedFire wood/branch, tent-fire feeding). Gossip
// ("fragments by the fire"), codex counters ("They fear fire"),
// and conversation lines mentioning fire are NOT fuel spends and
// must not pollute the scan.
const OTHER_FIRE_RE = /lay another log on|feed it another branch|You feed the little fire|You feed it another/i;

function attributeNight(r) {
  const w = r.warmth;
  if (!w) return { fuel: 'UNATTRIBUTED', reason: 'no-warmth-record' };
  if (!w.acted) return { fuel: 'NO-WARMTH-SPEND', reason: 'miss:' + (w.miss || 'unknown') };
  if (!w.fireLit) {
    if (w.logSpent === 0 || w.logSpent === null) return { fuel: 'NO-FUEL', reason: 'friction-failed' };
    return { fuel: 'OTHER-UNEXPLAINED', reason: 'fireLit-false-but-logSpent=' + w.logSpent };
  }
  // fireLit true.
  if (w.logSpent !== null && w.logSpent >= 1) {
    if (w.logSpent > 1) return { fuel: 'OTHER-UNEXPLAINED', reason: 'logSpent=' + w.logSpent };
    const branchesBefore = (w.branchesBefore === undefined ? null : w.branchesBefore);
    if (branchesBefore !== null && branchesBefore >= 2) {
      return { fuel: 'OTHER-UNEXPLAINED', reason: 'acted-with-branches>=2' };
    }
    if (r.logs !== null && r.logs > WOOD_NEEDED) return { fuel: 'WOOD-SURPLUS', reason: 'pre-fire-logs=' + r.logs };
    return { fuel: 'WOOD', reason: 'fireLit-logSpent-1-branches<2' };
  }
  if (w.logSpent === 0) {
    // Branch fuel only if post-evening branches prove the 2-branch spend.
    const bb = (w.branchesBefore === undefined ? null : w.branchesBefore);
    const ba = (r.eveningBranchesAfter === undefined ? null : r.eveningBranchesAfter);
    if (bb !== null && ba !== null && bb - ba === 2) return { fuel: 'BRANCHES', reason: 'branches-before-after-diff-2' };
    return { fuel: 'OTHER-UNEXPLAINED', reason: 'fireLit-logSpent-0-no-branch-proof bb=' + bb + ' ba=' + ba };
  }
  return { fuel: 'OTHER-UNEXPLAINED', reason: 'logSpent-null' };
}

// Protected-wood counterfactual for ONE strand (ordered evenings).
// wood' = refusalWood + cumulative WOOD spends on earlier strand
// evenings. First evening passing all three gates converts.
function counterfactual(evenings) {
  let cum = 0;
  let converted = null, length = evenings.length, neverReached = [];
  for (let i = 0; i < evenings.length; i++) {
    const e = evenings[i];
    if (e.unclassified) return { error: 'unclassified-evening', length: null, converted: null, neverReached: [] };
    const woodPrime = e.logs + cum;
    const passes = woodPrime >= WOOD_NEEDED && e.kcal >= KCAL_NEEDED && e.ticks >= TICKS_NEEDED;
    if (passes && converted === null) {
      converted = { loopDay: e.loopDay, woodPrime, woodActual: e.logs, kcal: e.kcal, ticks: e.ticks };
      length = i;
      neverReached = evenings.slice(i + 1).map((x) => x.loopDay);
    }
    if (e.fuel === 'WOOD') cum += 1;
  }
  return { error: null, length, converted, neverReached, totalWoodSpends: cum };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const perSeed = {}, strands = [], table = [], unclassified = [], unexplained = [];
  const trajectoryBreaks = [], otherFireLines = [];
  let seeds = 0, evenings = 0, creekEvenings = 0, stillRefused = 0, rescued = 0;
  let warmActed = 0, warmLogSpent = 0, recorderErrs = 0;
  const wall = [];
  for (const f of files) {
    const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const s = inst.seed;
    seeds++;
    const evs = inst.evenings || [];
    evenings += evs.length;
    recorderErrs += ((inst.woodcarryStore && inst.woodcarryStore.errs) || 0)
      + ((inst.warmthStore && inst.warmthStore.errs) || 0);
    const mornByDay = {};
    for (const m of (inst.mornings || [])) mornByDay[m.loopDay] = m;
    const evByDay = {};
    for (const e of evs) evByDay[e.loopDay] = e;
    wall.push({ seed: s, daysAlive: inst.daysAlive, endReason: inst.endReason,
      maxWaveUnlocked: inst.maxWaveUnlocked, deaths: (inst.deaths || []).length });
    perSeed[s] = { evenings: evs.length, creek: 0, still: 0, rescued: 0,
      warmActed: 0, warmLogSpent: 0, strands: [], daysAlive: inst.daysAlive, endReason: inst.endReason };
    for (const e of evs) {
      const wc = e.woodcarry || {};
      const ww = e.warmth || null;
      if (ww && ww.acted) {
        warmActed++; perSeed[s].warmActed++;
        if (ww.fireLit && ww.logSpent && ww.logSpent >= 1) { warmLogSpent++; perSeed[s].warmLogSpent++; }
      }
      if (wc.bucket !== 'creek') continue;
      creekEvenings++; perSeed[s].creek++;
      if (wc.rescued) { rescued++; perSeed[s].rescued++; }
      else { stillRefused++; perSeed[s].still++; }
    }
    let run = [];
    const flush = () => {
      if (!run.length) return;
      const strandEvenings = run.map((e) => {
        const c = classify(e);
        const m = mornByDay[e.loopDay] || null;
        const nm = mornByDay[e.loopDay + 1] || null;
        const ne = evByDay[e.loopDay + 1] || null;
        const neCls = (ne && ne.woodcarry && ne.woodcarry.classification) || null;
        const nextRefusalWood = neCls ? (neCls.woodPlayer === undefined ? null : neCls.woodPlayer) : null;
        const row = { seed: s, loopDay: e.loopDay,
          morningKcal: m ? m.kcal : null, morningWood: m ? m.morningWood : null,
          morningBranches: m ? (m.morningBranches === undefined ? null : m.morningBranches) : null,
          postEveningKcal: (e.kcal === undefined ? null : e.kcal),
          eveningWoodAfter: (e.eveningWoodAfter === undefined ? null : e.eveningWoodAfter),
          eveningBranchesAfter: (e.eveningBranchesAfter === undefined ? null : e.eveningBranchesAfter),
          nextMorningWood: nm ? nm.morningWood : null,
          nextMorningBranches: nm ? (nm.morningBranches === undefined ? null : nm.morningBranches) : null,
          nextRefusalWood,
          warmth: e.warmth || null,
          fullDaySay: e.fullDaySay || null,
          ...c };
        if (!c.unclassified) {
          const attr = attributeNight(row);
          row.fuel = attr.fuel; row.fuelReason = attr.reason;
          // Trajectory deltas (null-safe; a null anywhere flags, never hides).
          row.warmthDelta = (row.eveningWoodAfter !== null && row.logs !== null) ? (row.eveningWoodAfter - row.logs) : null;
          row.overnightDelta = (row.nextMorningWood !== null && row.eveningWoodAfter !== null) ? (row.nextMorningWood - row.eveningWoodAfter) : null;
          row.daytimeDeltaNext = (row.nextRefusalWood !== null && row.nextMorningWood !== null) ? (row.nextRefusalWood - row.nextMorningWood) : null;
          row.branchWarmthDelta = (row.eveningBranchesAfter !== null && row.warmth && row.warmth.branchesBefore !== undefined && row.warmth.branchesBefore !== null)
            ? (row.eveningBranchesAfter - row.warmth.branchesBefore) : null;
          // Trajectory breaks: warmth delta must equal -logSpent on
          // acted nights, 0 on miss nights; overnight delta expected 0.
          const w = row.warmth;
          const expectedWarmthDelta = w ? (w.acted ? -(w.logSpent || 0) : 0) : null;
          if (expectedWarmthDelta !== null && row.warmthDelta !== null && row.warmthDelta !== expectedWarmthDelta) {
            trajectoryBreaks.push({ seed: s, loopDay: e.loopDay, kind: 'warmth-delta-mismatch',
              warmthDelta: row.warmthDelta, expected: expectedWarmthDelta, fuel: row.fuel });
          }
          if (row.overnightDelta !== null && row.overnightDelta !== 0) {
            trajectoryBreaks.push({ seed: s, loopDay: e.loopDay, kind: 'overnight-delta-nonzero', delta: row.overnightDelta });
          }
          if (row.fuel === 'OTHER-UNEXPLAINED' || row.fuel === 'UNATTRIBUTED') {
            unexplained.push({ seed: s, loopDay: e.loopDay, fuel: row.fuel, reason: row.fuelReason });
          }
          // Other-fire scan over the full day's say lines.
          for (const line of (e.fullDaySay || [])) {
            if (WARMTH_LINE_RE.test(line)) continue;
            if (OTHER_FIRE_RE.test(line)) {
              otherFireLines.push({ seed: s, loopDay: e.loopDay, line: line.slice(0, 200) });
            }
          }
        } else {
          row.fuel = 'UNATTRIBUTED'; row.fuelReason = 'unclassified-evening';
          unclassified.push({ seed: s, loopDay: e.loopDay });
          unexplained.push({ seed: s, loopDay: e.loopDay, fuel: 'UNATTRIBUTED', reason: 'unclassified-evening' });
        }
        return row;
      });
      const cf = counterfactual(strandEvenings);
      const rec = { seed: s, nights: strandEvenings.map((x) => x.loopDay), length: strandEvenings.length,
        eveningWoods: strandEvenings.map((x) => x.logs),
        counterfactual: cf };
      strands.push(rec);
      perSeed[s].strands.push(rec);
      for (const r of strandEvenings) table.push(r);
      run = [];
    };
    const sorted = [...evs].sort((a, b) => a.loopDay - b.loopDay);
    for (const e of sorted) {
      const wc = e.woodcarry || {};
      if (wc.bucket === 'creek' && !wc.rescued) {
        if (run.length && e.loopDay !== run[run.length - 1].loopDay + 1) flush();
        run.push(e);
      } else flush();
    }
    flush();
  }
  const byFuel = {};
  for (const r of table) byFuel[r.fuel] = (byFuel[r.fuel] || 0) + 1;
  return { dir, seeds, files: files.length, evenings, creekEvenings, stillRefused, rescued,
    warmActed, warmLogSpent, recorderErrs, strandCount: strands.length, strandEvenings: table.length,
    unclassifiedCount: unclassified.length, unexplainedCount: unexplained.length,
    byFuel, perSeed, strands, table, unclassified, unexplained, trajectoryBreaks, otherFireLines, wall };
}

function main() {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: analyze-warmthfuel-b.js <corpusDir> [outJson]'); process.exit(2); }
  const outJson = process.argv[3] || null;
  const c = analyzeDir(dir);
  console.log('seeds: ' + c.seeds + ' files: ' + c.files + ' evenings: ' + c.evenings);
  console.log('creek evenings: ' + c.creekEvenings + ' still-refused: ' + c.stillRefused + ' rescued: ' + c.rescued);
  console.log('warmth acted: ' + c.warmActed + ' log-spent: ' + c.warmLogSpent + ' recorder errs: ' + c.recorderErrs);
  console.log('strands: ' + c.strandCount + ' strand evenings: ' + c.strandEvenings + ' unclassified: ' + c.unclassifiedCount + ' unexplained: ' + c.unexplainedCount);
  console.log('by fuel: ' + JSON.stringify(c.byFuel));
  for (const st of c.strands) {
    console.log('  STRAND seed ' + st.seed + ' nights ' + st.nights.join(',') + ' length ' + st.length
      + ' counterfactual length ' + (st.counterfactual && st.counterfactual.length)
      + ' converted ' + JSON.stringify(st.counterfactual && st.counterfactual.converted)
      + ' neverReached ' + JSON.stringify(st.counterfactual && st.counterfactual.neverReached));
  }
  for (const r of c.table) {
    console.log('  NIGHT seed ' + r.seed + ' day ' + r.loopDay + ' fuel ' + r.fuel + ' (' + r.fuelReason + ')'
      + ' refusalLogs ' + r.logs + ' kcal ' + r.kcal + ' ticks ' + r.ticks
      + ' branchesBefore ' + (r.warmth && r.warmth.branchesBefore)
      + ' woodBefore ' + (r.warmth && r.warmth.woodBefore) + ' woodAfter ' + (r.warmth && r.warmth.woodAfter)
      + ' logSpent ' + (r.warmth && r.warmth.logSpent) + ' fireLit ' + (r.warmth && r.warmth.fireLit)
      + ' postWood ' + r.eveningWoodAfter + ' postBranches ' + r.eveningBranchesAfter
      + ' nextMornWood ' + r.nextMorningWood + ' nextMornBranches ' + r.nextMorningBranches
      + ' nextRefusalWood ' + r.nextRefusalWood
      + ' warmthDelta ' + r.warmthDelta + ' overnightDelta ' + r.overnightDelta + ' daytimeDeltaNext ' + r.daytimeDeltaNext);
  }
  for (const b of c.trajectoryBreaks) console.log('  TRAJECTORY-BREAK ' + JSON.stringify(b));
  for (const o of c.otherFireLines) console.log('  OTHER-FIRE ' + JSON.stringify(o));
  for (const u of c.unexplained) console.log('  UNEXPLAINED ' + JSON.stringify(u));
  console.log('wall: ' + JSON.stringify(c.wall));
  if (outJson) { fs.mkdirSync(path.dirname(outJson), { recursive: true }); fs.writeFileSync(outJson, JSON.stringify(c, null, 2)); console.log('wrote ' + outJson); }
}

if (require.main === module) main();
module.exports = { attributeNight, counterfactual, analyzeDir };
