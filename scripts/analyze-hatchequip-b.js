#!/usr/bin/env node
// analyze-hatchequip-b.js — per-seed verdicts for sim-hatchequip-b.
// Reads evidence/2026-10-30/sim-hatchequip-b-corpus/*.json (default) and
// prints one line per seed plus the mechanism counts the prereg judges:
//   - spawn stashed hatchet? (pool.stashed includes hatchet)
//   - gearUp calls targeting the vessel, by acquire flag (expect 0/0)
//   - gearUp calls targeting others, by acquire flag (expect >0, incl. true)
//   - first morning the vessel's scholar inventory/equipped holds a hatchet
//   - first morning the stashed hatchet leaves the vessel's stash (expect never)
//   - first morning the vessel holds a stone_knife, with the preceding
//     craft('stone_knife') day and whether the stash still holds one after
//     (H-B test: craft-before-equip + stash-intact = knapped, not stash-fed)
//   - loot/succession hatchet arrivals (hatchet in scholar kit with no
//     stash-hatchet at spawn and no stash loss — cross-check vs axeacq)
// Usage: node scripts/analyze-hatchequip-b.js [corpusDir]
'use strict';
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-30', 'sim-hatchequip-b-corpus');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
const rows = [];
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const spawnStash = ((d.spawnSnap || {}).pool || {}).stashed || [];
  const spawnHatchetStashed = spawnStash.indexOf('hatchet') >= 0;
  const spawnStoneStashed = spawnStash.indexOf('stone_knife') >= 0;
  const gv = (d.log || {}).gearUpVessel || [];
  const go = (d.log || {}).gearUpOther || {};
  let firstHatchetKitDay = null, firstHatchetKitHow = null;
  let stashHatchetLostDay = null;
  let prevStashHatchet = spawnHatchetStashed;
  const allSnaps = [{ gameDay: 0, scholar: d.spawnSnap.scholar, person: d.spawnSnap.person }];
  for (const m of (d.mornings || [])) allSnaps.push(m);
  for (const s of allSnaps) {
    const sch = s.scholar || {};
    const kit = [].concat(sch.inv || [], sch.eq || []);
    if (firstHatchetKitDay === null && kit.indexOf('hatchet') >= 0) {
      firstHatchetKitDay = s.gameDay;
      firstHatchetKitHow = (s.gameDay === 0) ? 'spawn' : 'morning-snap';
    }
    const st = ((s.person || {}).stash || []);
    const nowHas = st.indexOf('hatchet') >= 0;
    if (prevStashHatchet && !nowHas && stashHatchetLostDay === null) stashHatchetLostDay = s.gameDay;
    prevStashHatchet = nowHas;
  }
  let firstStoneKitDay = null;
  for (const s of allSnaps) {
    const sch = s.scholar || {};
    if (firstStoneKitDay === null && [].concat(sch.inv || [], sch.eq || []).indexOf('stone_knife') >= 0) firstStoneKitDay = s.gameDay;
  }
  const knap = ((d.log || {}).crafts || []).filter((c) => c.recipe === 'stone_knife');
  const firstKnap = knap.length ? knap[0] : null;
  const stoneEquip = ((d.log || {}).equips || []).filter((e) => e.item === 'stone_knife');
  const firstStoneEquip = stoneEquip.length ? stoneEquip[0] : null;
  // stash still holds stone_knife on the first morning the kit holds one?
  let stashStoneAtFirstStoneKit = null;
  if (firstStoneKitDay !== null) {
    const snap = allSnaps.find((s) => s.gameDay === firstStoneKitDay);
    stashStoneAtFirstStoneKit = snap ? (((snap.person || {}).stash || []).indexOf('stone_knife') >= 0) : null;
  }
  const endStash = ((d.mornings || []).length ? (d.mornings[d.mornings.length - 1].person || {}).stash : ((d.spawnSnap.person || {}).stash)) || [];
  rows.push({
    seed: d.seed, end: d.endReason, daysAlive: d.daysAlive,
    spawnHatchetStashed, spawnStoneStashed,
    gearUpVessel: gv.length,
    gearUpVesselAcquireTrue: gv.filter((c) => c.acquire).length,
    gearUpVesselAcquireFalse: gv.filter((c) => !c.acquire).length,
    gearUpOther: go.total || 0, gearUpOtherAcquireTrue: go.acquireTrue || 0,
    gearUpOtherAcquireFalse: go.acquireFalse || 0,
    firstHatchetKitDay, stashHatchetLostDay,
    endStashHasHatchet: endStash.indexOf('hatchet') >= 0,
    firstStoneKitDay, firstKnapDay: firstKnap ? firstKnap.day : null,
    firstKnapOk: firstKnap ? firstKnap.ok : null,
    firstStoneEquipDay: firstStoneEquip ? firstStoneEquip.day : null,
    stashStoneAtFirstStoneKit,
    wrapErrors: ((d.log || {}).wrapErrors || []).length,
  });
}
for (const r of rows) console.log(JSON.stringify(r));
const hatchetCases = rows.filter((r) => r.spawnHatchetStashed);
console.log('---');
console.log('seeds: ' + rows.length);
console.log('spawn-hatchet-stashed vessels: ' + hatchetCases.length + ' seeds ' + hatchetCases.map((r) => r.seed).join(','));
console.log('of those, ever held a hatchet (kit day non-null): ' + hatchetCases.filter((r) => r.firstHatchetKitDay !== null).length);
console.log('of those, stash hatchet ever lost: ' + hatchetCases.filter((r) => r.stashHatchetLostDay !== null).length);
console.log('gearUp targeting vessel (all seeds): ' + rows.reduce((t, r) => t + r.gearUpVessel, 0));
console.log('gearUp targeting others (all seeds): ' + rows.reduce((t, r) => t + r.gearUpOther, 0) + ' (acquire=true ' + rows.reduce((t, r) => t + r.gearUpOtherAcquireTrue, 0) + ')');
console.log('stone_knife control: kit day / knap day / stash-intact-at-kit:');
for (const r of rows.filter((r) => r.spawnStoneStashed)) {
  console.log('  seed ' + r.seed + ': kitDay=' + r.firstStoneKitDay + ' knapDay=' + r.firstKnapDay + ' knapOk=' + r.firstKnapOk + ' equipDay=' + r.firstStoneEquipDay + ' stashStoneAtKit=' + r.stashStoneAtFirstStoneKit);
}
console.log('wrapErrors total: ' + rows.reduce((t, r) => t + r.wrapErrors, 0));
