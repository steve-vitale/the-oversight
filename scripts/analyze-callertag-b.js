#!/usr/bin/env node
// analyze-callertag-b.js — re-derivation for sim-callertag-b (DIAG).
// Reads ONLY the existing 2026-10-26 stock9762 corpus; runs no sims, writes
// nothing to the repo. Prints: band gardenInflows re-derivation (count/kcal/
// door/name/unclassified), record field inventory, harvest-event bridge
// (R4) per seed under both the prereg-literal coax interval (anchor, H)
// and the corrected interval [anchor, H) — see the note below — plus
// NPC-sow counts and sayLines-cap status.
// Usage: node scripts/analyze-callertag-b.js [--corpus-dir <dir>]
//
// CORRECTION NOTE (disclosed, both intervals reported): the prereg states
// the bridge as "coax strictly inside (anchor, H)". That misses the
// anchor day itself, but cultivateGarden applies magic to just-harvested
// plots too: after harvestGarden resets a plot (growthLeft back to the
// 28-day regrowth), the plot is NOT ripe, so the same day's coax loop
// (which skips only ripe plots) still sets magicGrowth/magicYield on it,
// and no same-plot second harvest can follow that day (28 minus at most
// ~20 coax days stays > 0). Anchor-day coax therefore DOES assist the
// next harvest. The corrected rule is: ASSISTED iff a coax day falls in
// [anchor, H); ORDINARY iff no coax day falls in [anchor, H]; UNDETERMINED
// iff the only coax day in [anchor, H] is H itself (a morning pre-coax
// harvest that day would be ordinary, a post-coax second harvest assisted
// — snapshots cannot tell which fired for that plot). The analyzer prints
// both; the evidence judges the assisted leg on the corrected rule and
// shows the literal-rule numbers alongside, so the correction cannot hide
// a verdict change.
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv.includes('--corpus-dir')
  ? process.argv[process.argv.indexOf('--corpus-dir') + 1]
  : path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-stock9762-b-corpus');
const load = s => JSON.parse(fs.readFileSync(path.join(dir,
  `stock9762-b-competent-nofeast-s${s}.json`), 'utf8'));
const seeds = [9760, 9761, 9762, 9763, 9764, 9765, 9766, 9767];

function tabulate(recs) {
  const byDoor = {}, byName = {}, byDoorName = {};
  let kcal = 0, unclassified = 0;
  for (const r of recs) {
    if (!r.door || !r.name) { unclassified++; continue; }
    kcal += r.kcal || 0;
    byDoor[r.door] = (byDoor[r.door] || 0) + 1;
    byName[r.name] = (byName[r.name] || 0) + 1;
    const k = r.door + '|' + r.name;
    byDoorName[k] = byDoorName[k] || { count: 0, kcal: 0 };
    byDoorName[k].count++; byDoorName[k].kcal += r.kcal || 0;
  }
  return { n: recs.length, kcal, unclassified, byDoor, byName, byDoorName };
}

console.log('=== band gardenInflows re-derivation ===');
let bandN = 0, bandKcal = 0, bandUnc = 0;
const perSeed = {};
for (const s of seeds) {
  const d = load(s);
  const t = tabulate(d.gardenEvents.gardenInflows);
  perSeed[s] = { d, t };
  bandN += t.n; bandKcal += t.kcal; bandUnc += t.unclassified;
  console.log(s, 'n', t.n, 'kcal', t.kcal, 'doors', JSON.stringify(t.byDoor),
    'names', JSON.stringify(t.byName), 'unclassified', t.unclassified);
}
console.log('band total n', bandN, 'kcal', bandKcal, 'unclassified', bandUnc);

console.log('=== record field inventory ===');
const d62 = perSeed[9762].d;
const giKeys = new Set();
for (const r of d62.gardenEvents.gardenInflows) Object.keys(r).forEach(k => giKeys.add(k));
console.log('gardenInflows record keys (9762):', JSON.stringify([...giKeys].sort()));
console.log('gardenInflows sample:', JSON.stringify(d62.gardenEvents.gardenInflows[0]));
const infKeys = new Set();
for (const r of d62.inflows) Object.keys(r).forEach(k => infKeys.add(k));
console.log('inflows record keys (9762):', JSON.stringify([...infKeys].sort()));
console.log('inflows sample:', JSON.stringify(d62.inflows[0]));
console.log('any gardenInflows record with mover/destination/harvest-day/shares-class field?',
  [...giKeys].some(k => /mover|caller|dest|village|harvest|stack|assisted|ordinary/i.test(k)) ? 'YES' : 'NO');
console.log('any inflows record with mover/destination field?',
  [...infKeys].some(k => /mover|caller|dest|village/i.test(k)) ? 'YES' : 'NO');

console.log('=== R4 harvest-event bridge (per seed) ===');
for (const s of seeds) {
  const d = perSeed[s].d;
  const say = d.gardenEvents.sayLines;
  const coaxDays = [...new Set(say.filter(x => x.line.includes('coax')).map(x => x.day))].sort((a, b) => a - b);
  const coaxSet = new Set(coaxDays);
  const sayCapped = say.length >= 300;
  // Harvest events: per plot index, track (anchor, lastHarvest, pid).
  const plots = {}; // idx -> {anchor, lh, pid}
  const events = []; // {day, idx, pid, anchor, clsLiteral, clsCorrected}
  const days = d.gardenDays;
  for (const gd of days) {
    gd.plots.forEach((p, idx) => {
      const st = plots[idx] || (plots[idx] = { anchor: null, lh: 0, pid: null });
      const lh = p.lastHarvest || 0;
      if (lh === 0 && st.lh !== 0) st.lh = 0; // replant/clear resets the anchor
      if (lh !== 0 && lh !== st.lh) {
        const anchor = st.lh > 0 ? st.lh : (p.plantedDay || 0);
        const H = gd.day;
        // NOTE: event day from snapshot is the day lastHarvest was stamped;
        // snapshots are end-of-day, so H is the harvest day itself.
        const inOpen = d2 => d2 > anchor && d2 < H;
        const inClosedLeft = d2 => d2 >= anchor && d2 < H;
        const inClosed = d2 => d2 >= anchor && d2 <= H;
        const hasOpen = coaxDays.some(inOpen);
        const hasClosedLeft = coaxDays.some(inClosedLeft);
        const hasClosed = coaxDays.some(inClosed);
        const onlyH = hasClosed && !coaxDays.some(d2 => d2 >= anchor && d2 < H);
        const clsLiteral = hasOpen ? 'assisted' : (onlyH ? 'undetermined' : 'ordinary');
        const clsCorrected = hasClosedLeft ? 'assisted' : (onlyH ? 'undetermined' : 'ordinary');
        events.push({ day: H, idx, pid: p.pid, anchor, clsLiteral, clsCorrected });
        st.lh = lh;
      }
      if (p.plantedDay && p.plantedDay !== st.plantedDay) { st.plantedDay = p.plantedDay; }
      st.pid = p.pid;
    });
  }
  const count = cls => events.filter(e => e['cls' + cls] === 'assisted').length;
  const tally = key => {
    const t = { assisted: 0, ordinary: 0, undetermined: 0 };
    for (const e of events) t[e[key]]++;
    return t;
  };
  const lit = tally('clsLiteral'), cor = tally('clsCorrected');
  const byPid = {};
  for (const e of events) {
    byPid[e.pid || '(null)'] = byPid[e.pid || '(null)'] || { assisted: 0, ordinary: 0, undetermined: 0 };
    byPid[e.pid || '(null)'][e.clsCorrected]++;
  }
  console.log(`seed ${s}: gardenDays ${days[0].day}..${days[days.length - 1].day}, sayLines ${say.length}${sayCapped ? ' (AT CAP 300 — coax days may be truncated)' : ''}, coax days ${coaxDays.length}, harvest events ${events.length}`);
  console.log(`  literal (anchor,H): ${JSON.stringify(lit)} | corrected [anchor,H): ${JSON.stringify(cor)}`);
  console.log(`  events by pid (corrected): ${JSON.stringify(byPid)}`);
  console.log(`  npcSows ${d.gardenEvents.npcSows.length}, player sows ${d.gardenEvents.sows.length}, deposit records ${perSeed[s].t.n}`);
  if (cor.ordinary > 0 || cor.undetermined > 0) {
    console.log('  non-assisted events (corrected):', JSON.stringify(events.filter(e => e.clsCorrected !== 'assisted').slice(0, 20)));
  }
  if (lit.assisted !== cor.assisted) {
    console.log('  literal-vs-corrected differing events:', JSON.stringify(events.filter(e => e.clsLiteral !== e.clsCorrected).slice(0, 20)));
  }
}
