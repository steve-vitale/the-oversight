// analyze-morningcarry-trace-b.js — pure reads over a morningcarry trace
// corpus dir. Pairs each evening with the night bracket after it and the
// following morning, and reports, per night: which pack stacks survived
// sleep, which the dawn sweep took (with its say line), and what the
// morning pack actually holds — split known vs unknown — plus, for every
// haven morning, what the pantry could have carried (long-life kcal =
// spoilDay >= gameDay + 2, i.e. survives tonight's dawn sweep).
// Usage: node scripts/analyze-morningcarry-trace-b.js <corpusDir> [outJson]
'use strict';
const fs = require('fs');
const path = require('path');

function keyOf(it) {
  return (it.name || '?') + '|' + (it.spoilDay === null || it.spoilDay === undefined ? '?' : it.spoilDay) + '|' + (it.edible === false ? 'unk' : 'known');
}

// Diff pack A (evening) -> pack B (morning). Returns { lost, kept, gained }.
// lost: stacks present in A, absent/reduced in B. Matching is by keyOf;
// units are compared per key (stacks with the same name but different
// spoilDay are distinct stacks and never merged by this diff).
function packDiff(aItems, bItems) {
  const a = {}, b = {};
  for (const it of (aItems || [])) { const k = keyOf(it); a[k] = a[k] || { key: k, name: it.name, spoilDay: it.spoilDay, edible: it.edible, kcalEach: it.kcalEach, foodState: it.foodState, units: 0 }; a[k].units += it.units || 0; }
  for (const it of (bItems || [])) { const k = keyOf(it); b[k] = b[k] || { key: k, name: it.name, spoilDay: it.spoilDay, edible: it.edible, kcalEach: it.kcalEach, foodState: it.foodState, units: 0 }; b[k].units += it.units || 0; }
  const lost = [], kept = [], gained = [];
  for (const k of Object.keys(a)) {
    if (!b[k]) lost.push({ ...a[k], unitsLost: a[k].units });
    else if (b[k].units < a[k].units) lost.push({ ...a[k], unitsLost: a[k].units - b[k].units, unitsKept: b[k].units });
    else kept.push({ ...a[k], unitsKept: b[k].units });
  }
  for (const k of Object.keys(b)) {
    if (!a[k]) gained.push({ ...b[k], unitsGained: b[k].units });
  }
  return { lost, kept, gained };
}

// A pantry/pack item carried on gameDay D survives tonight's dawn sweep
// iff its spoilDay is strictly past tomorrow's dawn (sweep removes
// spoilDay <= new day, new day = D + 1). So survival needs spoilDay >= D + 2.
// Items with no spoilDay (gear, keepsakes) never spoil.
function survivesTonight(item, gameDay) {
  if (item.spoilDay === null || item.spoilDay === undefined) return true;
  return item.spoilDay >= gameDay + 2;
}

function analyzeFile(filePath) {
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const mornByDay = {};
  for (const m of (d.mornings || [])) mornByDay[m.loopDay] = m;
  const nightByEvening = {};
  for (const n of (d.nights || [])) nightByEvening[n.afterEveningLoopDay] = n;
  const stillEvenings = [];
  const strandRuns = [];
  let run = [];
  const flushRun = () => { if (run.length) strandRuns.push(run); run = []; };
  for (const e of (d.evenings || [])) {
    const still = !!(e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued);
    if (still) { stillEvenings.push(e.loopDay); run.push(e.loopDay); } else flushRun();
  }
  flushRun();
  const nights = [];
  for (const e of (d.evenings || [])) {
    const m = mornByDay[e.loopDay + 1];
    const n = nightByEvening[e.loopDay];
    if (!m) continue;
    const sweepLines = (d.sayLines || []).filter((s) => s.seq >= (n ? n.seqBefore : 0) && s.seq < (n ? n.seqAfter : 1e9) && /went bad/i.test(s.line)).map((s) => s.line);
    const waitLines = (d.sayLines || []).filter((s) => s.seq >= (n ? n.seqAfter : 0) && s.seq < m.saySeqAtMorning && /went bad|Spoiled and discarded/i.test(s.line)).map((s) => s.line);
    const sleepDiff = n ? packDiff(n.pre.pack ? n.pre.pack.items : [], n.post.pack ? n.post.pack.items : []) : null;
    const nightDiff = packDiff(e.pack ? e.pack.items : [], m.pack ? m.pack.items : []);
    const postSleepDiff = n ? packDiff(n.post.pack ? n.post.pack.items : [], m.pack ? m.pack.items : []) : null;
    nights.push({
      eveningLoopDay: e.loopDay, morningLoopDay: m.loopDay,
      eveningStillCreek: !!(e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued),
      eveningKcal: e.kcal, morningKcal: m.kcal,
      eveningPackKcal: e.pack ? { all: e.pack.kcalAll, known: e.pack.kcalKnown, unknown: e.pack.kcalUnknown } : null,
      morningPackKcal: m.pack ? { all: m.pack.kcalAll, known: m.pack.kcalKnown, unknown: m.pack.kcalUnknown } : null,
      vesselSame: e.vesselId === m.vesselId, eveningVessel: e.vesselId, morningVessel: m.vesselId,
      dayRolled: n ? !!n.dayRolled : null,
      sleepLost: sleepDiff ? sleepDiff.lost : null,
      postSleepLost: postSleepDiff ? postSleepDiff.lost : null,
      nightLost: nightDiff.lost, nightKept: nightDiff.kept, nightGained: nightDiff.gained,
      sweepLines, waitWindowSpoilLines: waitLines,
    });
  }
  const strandMornings = [];
  for (const m of (d.mornings || [])) {
    if (!m.strandMorning) continue;
    // ALL pack items, not just kcalEach > 0: unknown food carries
    // kcalEach 0 until identified, and the trace must show it present.
    const stacks = (m.pack && m.pack.items || []);
    strandMornings.push({
      loopDay: m.loopDay, gameDay: m.gameDay, kcal: m.kcal, dayTicks: m.dayTicks,
      wood: m.morningWood, vesselId: m.vesselId,
      packKnownKcal: m.pack ? m.pack.kcalKnown : null,
      packUnknownKcal: m.pack ? m.pack.kcalUnknown : null,
      foodStacks: stacks.map((it) => ({ name: it.name, units: it.units, kcalEach: it.kcalEach, edible: it.edible, foodState: it.foodState, spoilDay: it.spoilDay, spoiled: it.spoiled, lump: it.lump })),
    });
  }
  const havenMornings = [];
  for (const m of (d.mornings || [])) {
    if (!m.startsAtHaven) continue;
    const pan = m.pantry || { items: [], kcal: 0 };
    let longLifeKcal = 0, longLifeItems = 0;
    for (const it of (pan.items || [])) {
      if ((it.kcalEach || 0) > 0 && it.edible !== false && survivesTonight(it, m.gameDay)) {
        longLifeKcal += (it.kcalEach || 0) * (it.units || 1); longLifeItems++;
      }
    }
    havenMornings.push({
      loopDay: m.loopDay, gameDay: m.gameDay, kcal: m.kcal,
      packKnownKcal: m.pack ? m.pack.kcalKnown : null,
      packWeightKg: m.pack ? m.pack.weightKg : null,
      carryCapacityKg: pan.carryCapacityKg,
      pantryKcal: pan.kcal, pantryCount: pan.count,
      pantryLongLifeKcal: longLifeKcal, pantryLongLifeItems: longLifeItems,
      pantrySample: (pan.items || []).slice(0, 12).map((it) => ({ name: it.name, units: it.units, kcalEach: it.kcalEach, edible: it.edible, foodState: it.foodState, spoilDay: it.spoilDay })),
    });
  }
  return {
    seed: d.seed, woodwarm: d.woodwarm, errs: d.errCount, daysAlive: d.daysAlive,
    endReason: d.endReason, maxWaveUnlocked: d.maxWaveUnlocked,
    stillEvenings, strandRuns, nights, strandMornings, havenMornings,
  };
}

function main() {
  const dir = process.argv[2];
  const out = process.argv[3] || null;
  if (!dir) { console.error('usage: analyze-morningcarry-trace-b.js <corpusDir> [outJson]'); process.exit(2); }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const results = files.map((f) => analyzeFile(path.join(dir, f)));
  if (out) fs.writeFileSync(out, JSON.stringify(results, null, 2));
  for (const r of results) {
    console.log('seed ' + r.seed + ' woodwarm=' + r.woodwarm + ' stillEvenings=' + JSON.stringify(r.stillEvenings) + ' runs=' + JSON.stringify(r.strandRuns) + ' errs=' + r.errs + ' maxWave=' + r.maxWaveUnlocked);
    console.log('  strand mornings: ' + r.strandMornings.length);
    for (const sm of r.strandMornings) {
      console.log('    M' + sm.loopDay + ' kcal=' + sm.kcal + ' known=' + sm.packKnownKcal + ' unknown=' + sm.packUnknownKcal + ' wood=' + sm.wood + ' stacks=' + JSON.stringify(sm.foodStacks));
    }
    console.log('  haven mornings: ' + r.havenMornings.length);
    for (const hm of r.havenMornings) {
      console.log('    M' + hm.loopDay + ' day=' + hm.gameDay + ' kcal=' + hm.kcal + ' packKnown=' + hm.packKnownKcal + ' pantry=' + hm.pantryKcal + ' longLife=' + hm.pantryLongLifeKcal + ' (' + hm.pantryLongLifeItems + ' items) capKg=' + hm.carryCapacityKg + ' packKg=' + hm.packWeightKg);
    }
    console.log('  strand nights (evening -> morning):');
    for (const n of r.nights.filter((x) => x.eveningStillCreek)) {
      console.log('    E' + n.eveningLoopDay + '->M' + n.morningLoopDay + ' eveKcal=' + n.eveningKcal + ' mornKcal=' + n.morningKcal + ' evePack=' + JSON.stringify(n.eveningPackKcal) + ' mornPack=' + JSON.stringify(n.morningPackKcal) + ' vesselSame=' + n.vesselSame);
      console.log('      sleepLost=' + JSON.stringify(n.sleepLost) + ' postSleepLost=' + JSON.stringify(n.postSleepLost) + ' sweep=' + JSON.stringify(n.sweepLines));
      console.log('      nightLost=' + JSON.stringify(n.nightLost) + ' nightKept=' + JSON.stringify(n.nightKept));
    }
  }
}

if (require.main === module) main();
module.exports = { packDiff, survivesTonight, keyOf, analyzeFile };
