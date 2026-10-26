#!/usr/bin/env node
// scripts/test-tbmelt-diag.js — tbmelt census analyzer (sim-tbmelt-a).
// Pure over per-seed recorder stores; no engine, no RNG, no I/O
// except the standalone corpus mode at the bottom.
//
// FATE RULES (fixed in the evidence pre-registration):
//   MELTED (bystander) = world-origin-mismatch lift + tbEnd exists
//     + monster absent from worldMonsters() after tbEnd.
//   RESTORED = lift + tbEnd exists + monster present after tbEnd.
//   KILLED = world-origin lift + fought fighter dead at tbEnd pre
//     (a kill, never a melt).
//   MELTED-FOUGHT = world-origin lift + fighter alive (or unknown)
//     + not restored (counted separately, never in the bystander
//     rate).
//   UNACCOUNTED = lifted, non-refused, non-thrown, no tbEnd row
//     and no adopted endVerdict.
//   DIRECT-BUILD = tbEnd row with no lift (fights built without
//     startCombat), counted separately.
// DOOR: the nonworldkill classifier applied to the tbmelt lift
// row (same fields, same precedence). Cross-checked against the
// nonworldkill store's own classification per seed.
'use strict';
const fs = require('fs');
const path = require('path');
const { classifyStart, analyzeNonworldkill } = require('./policies/nonworldkill-diag');

// The 5 known mismatch fights from sim-nonworldkill-a (seed, day,
// tile monster id, fight monster id is NOT needed for the match —
// the tile id + day + mismatch origin identify them; mid is
// reported for audit). Expected fates: first four MELTED, last
// RESTORED (lingering).
const KNOWN5 = [
  { seed: 73671, day: 9, tileId: 'murkcap', fate: 'melted' },
  { seed: 73674, day: 18, tileId: 'anaconda_empress', fate: 'melted' },
  { seed: 73677, day: 15, tileId: 'living_wire', fate: 'melted' },
  { seed: 73677, day: 63, tileId: 'spool', fate: 'melted' },
  { seed: 73675, day: 9, tileId: 'white_noise_heron', fate: 'restored' },
];

function findEndForLift(lift, ends) {
  if (!lift) return null;
  if (lift.liftId != null) {
    const byLift = ends.find(e => e && e.liftId === lift.liftId);
    if (byLift) return byLift;
  }
  if (lift.fightId) {
    const byFight = ends.find(e => e && e.fightId === lift.fightId && !e.directBuild);
    if (byFight) return byFight;
  }
  return null;
}

function fateOfLift(lift, end) {
  const verdict = lift.endVerdict || null;
  if (!end && !verdict) return { fate: 'unaccounted', detail: null };
  const restored = end ? end.restored : verdict.restored;
  const result = end ? end.result : verdict.result;
  if (restored === true) return { fate: 'restored', detail: { result: result, via: end ? end.restoredVia : verdict.restoredVia } };
  if (restored === false) {
    if (lift.origin === 'world-origin-mismatch') return { fate: 'melted', detail: { result: result } };
    if (lift.origin === 'world-origin') {
      const lf = end ? end.liftedFighter : null;
      if (lf && !lf.alive) return { fate: 'killed', detail: { result: result, fighter: lf } };
      return { fate: 'melted-fought', detail: { result: result, fighter: lf || null } };
    }
    return { fate: 'unresolved-fate', detail: { result: result, origin: lift.origin } };
  }
  return { fate: 'unaccounted', detail: { result: result, restored: restored } };
}

function analyzeTbmelt(tbmeltStore, nwkStore) {
  const lifts = ((tbmeltStore && tbmeltStore.lifts) || []);
  const ends = ((tbmeltStore && tbmeltStore.ends) || []);
  const lifted = lifts.filter(l => l && l.lifted);
  const refused = lifts.filter(l => l && l.refused);
  const thrown = lifts.filter(l => l && l.threw);
  const rows = lifted.map(l => {
    const cls = classifyStart(l);
    const end = findEndForLift(l, ends);
    const f = fateOfLift(l, end);
    return { lift: l, cls: cls, end: end, fate: f.fate, detail: f.detail };
  });
  const byFate = {}, byDoor = {}, meltsByDoor = {}, meltsByWave = {}, meltsByWaveDoor = {};
  const melts = [], restoredList = [], unaccounted = [], killed = [], foughtMelts = [], unresolved = [];
  for (const r of rows) {
    byFate[r.fate] = (byFate[r.fate] || 0) + 1;
    const d = r.cls.door;
    byDoor[d] = (byDoor[d] || 0) + 1;
    if (r.fate === 'melted') {
      melts.push(r);
      meltsByDoor[d] = (meltsByDoor[d] || 0) + 1;
      const w = 'w' + ((r.lift.tileMonster && r.lift.tileMonster.wave) | 0);
      meltsByWave[w] = (meltsByWave[w] || 0) + 1;
      meltsByWaveDoor[w] = meltsByWaveDoor[w] || {};
      meltsByWaveDoor[w][d] = (meltsByWaveDoor[w][d] || 0) + 1;
    }
    if (r.fate === 'restored') restoredList.push(r);
    if (r.fate === 'unaccounted') unaccounted.push(r);
    if (r.fate === 'killed') killed.push(r);
    if (r.fate === 'melted-fought') foughtMelts.push(r);
    if (r.fate === 'unresolved-fate') unresolved.push(r);
  }
  const mismatch = rows.filter(r => r.lift.origin === 'world-origin-mismatch');
  const mismatchOther = mismatch.filter(r => r.cls.door === 'other');
  const directBuildEnds = ends.filter(e => e && e.directBuild);
  // Cross-check vs nonworldkill: mismatch sets must agree.
  let nwk = null, nwkMismatch = [], cross = null;
  try {
    if (nwkStore) {
      nwk = analyzeNonworldkill(nwkStore);
      const starts = (nwkStore.starts || []);
      nwkMismatch = starts.filter(s => s && !s.refused && !s.threw && !s.tableTrial && s.origin === 'world-origin-mismatch');
      const key = (day, tileId, mid) => day + '|' + tileId + '|' + (mid || '');
      const tbKeys = new Set(mismatch.map(r => key(r.lift.day, r.lift.tileMonster && r.lift.tileMonster.id, r.lift.mid)));
      const nwkKeys = new Set(nwkMismatch.map(s => key(s.day, s.tileMonster && s.tileMonster.id, s.mid)));
      const missing = [...nwkKeys].filter(k => !tbKeys.has(k));
      const extra = [...tbKeys].filter(k => !nwkKeys.has(k));
      // Adopted-resolved extras: tbmelt resolves an adopted fight's
      // mid via the engine rule (arg || pendingMonsterId) where
      // nonworldkill reads world-origin-unresolved (fighters gone
      // by post-record). An extra is explained iff its tbmelt lift
      // is an adopted (end-row) fight AND a nonworldkill start on
      // the same day with the same tile id is unresolved.
      const nwkStarts = (nwkStore.starts || []);
      const extraExplained = extra.map(k => {
        const r = mismatch.find(x => key(x.lift.day, x.lift.tileMonster && x.lift.tileMonster.id, x.lift.mid) === k);
        const adopted = !!(r && r.lift.fightIdSource && r.lift.fightIdSource.indexOf('end-row') >= 0);
        const nwkRow = nwkStarts.find(s => s && s.day === (r && r.lift.day) && s.tileMonster && s.tileMonster.id === (r && r.lift.tileMonster && r.lift.tileMonster.id) && s.origin === 'world-origin-unresolved');
        return { key: k, adopted: adopted, nwkUnresolved: !!nwkRow, nwkArg: nwkRow ? nwkRow.arg : null };
      });
      const extraUnexplained = extraExplained.filter(e => !(e.adopted && e.nwkUnresolved));
      cross = { nwkMismatch: nwkMismatch.length, tbmeltMismatch: mismatch.length, missing: missing, extra: extra,
        extraExplained: extraExplained, extraUnexplained: extraUnexplained,
        agree: missing.length === 0 && extraUnexplained.length === 0 };
    }
  } catch (e) { cross = { error: String((e && e.message) || e).slice(0, 160) }; }
  const initiations = nwk ? nwk.initiations : null;
  return {
    liftsTotal: lifts.length, lifted: lifted.length, refused: refused.length, thrown: thrown.length,
    nullOriginStarts: lifts.filter(l => l && l.origin === 'null-origin').length,
    rows: rows, byFate: byFate, byDoor: byDoor,
    mismatch: mismatch.length, mismatchOther: mismatchOther.map(r => ({ day: r.lift.day, arg: r.lift.arg, mid: r.lift.mid, tileId: r.lift.tileMonster && r.lift.tileMonster.id, stack: r.lift.stack })),
    melts: melts, meltsTotal: melts.length,
    meltsByDoor: meltsByDoor, meltsByWave: meltsByWave, meltsByWaveDoor: meltsByWaveDoor,
    meltsPerInitiation: (initiations ? (melts.length / initiations) : null),
    initiations: initiations,
    restored: restoredList, unaccounted: unaccounted, killed: killed,
    foughtMelts: foughtMelts, unresolved: unresolved,
    directBuildEnds: directBuildEnds.length,
    directBuildEndRows: directBuildEnds.map(e => ({ day: e.day, fightId: e.fightId, result: e.result })),
    endsTotal: ends.length, cross: cross, nwkByDoor: nwk ? nwk.byDoor : null,
    meltRows: melts.map(r => ({ day: r.lift.day, tileId: r.lift.tileMonster && r.lift.tileMonster.id,
      tileWave: r.lift.tileMonster && r.lift.tileMonster.wave,
      tileTitan: r.lift.tileMonster && r.lift.tileMonster.titan,
      tileLingering: r.lift.tileMonster && r.lift.tileMonster.lingering,
      tileVeteran: r.lift.tileMonster && r.lift.tileMonster.veteran,
      tileHp: r.lift.tileMonster && r.lift.tileMonster.hp,
      fightMid: r.lift.mid, fightWave: r.lift.wave, door: r.cls.door,
      sub: r.cls.sub, initiator: r.cls.initiator, result: r.end ? r.end.result : (r.lift.endVerdict && r.lift.endVerdict.result),
      fighters: r.lift.fighters })),
    restoredRows: restoredList.map(r => ({ day: r.lift.day, tileId: r.lift.tileMonster && r.lift.tileMonster.id,
      tileWave: r.lift.tileMonster && r.lift.tileMonster.wave,
      tileTitan: r.lift.tileMonster && r.lift.tileMonster.titan,
      tileLingering: r.lift.tileMonster && r.lift.tileMonster.lingering,
      fightMid: r.lift.mid, door: r.cls.door, result: r.end ? r.end.result : null })),
  };
}

function checkKnown5(perSeedAnalyses) {
  // perSeedAnalyses: {seed: analysis}
  const out = [];
  for (const k of KNOWN5) {
    const an = perSeedAnalyses[k.seed];
    let found = null;
    if (an) {
      const all = (an.rows || []).filter(r => r.lift.day === k.day && r.lift.tileMonster && r.lift.tileMonster.id === k.tileId && r.lift.origin === 'world-origin-mismatch');
      found = all.length ? all[0] : null;
    }
    out.push({ seed: k.seed, day: k.day, tileId: k.tileId, expected: k.fate,
      reproduced: !!(found && found.fate === k.fate),
      actual: found ? found.fate : null,
      door: found ? found.cls.door : null, fightMid: found ? found.lift.mid : null });
  }
  return out;
}

function bandAggregate(perSeed) {
  // perSeed: [{seed, analysis}]
  const agg = { melts: 0, lifted: 0, mismatch: 0, restored: 0, unaccounted: 0, killed: 0,
    foughtMelts: 0, initiations: 0, meltsByDoor: {}, meltsByWave: {}, meltRows: [], restoredRows: [],
    unaccountedRows: [], seeds: perSeed.length };
  for (const ps of perSeed) {
    const a = ps.analysis;
    agg.melts += a.meltsTotal; agg.lifted += a.lifted; agg.mismatch += a.mismatch;
    agg.restored += (a.byFate.restored || 0); agg.unaccounted += a.unaccounted.length;
    agg.killed += a.killed.length; agg.foughtMelts += a.foughtMelts.length;
    agg.initiations += (a.initiations || 0);
    for (const k of Object.keys(a.meltsByDoor)) agg.meltsByDoor[k] = (agg.meltsByDoor[k] || 0) + a.meltsByDoor[k];
    for (const k of Object.keys(a.meltsByWave)) agg.meltsByWave[k] = (agg.meltsByWave[k] || 0) + a.meltsByWave[k];
    for (const r of a.meltRows) agg.meltRows.push(Object.assign({ seed: ps.seed }, r));
    for (const r of a.restoredRows) agg.restoredRows.push(Object.assign({ seed: ps.seed }, r));
    for (const r of a.unaccounted) agg.unaccountedRows.push({ seed: ps.seed, day: r.lift.day, tileId: r.lift.tileMonster && r.lift.tileMonster.id, mid: r.lift.mid, origin: r.lift.origin });
  }
  agg.meltsPerInitiation = agg.initiations ? agg.melts / agg.initiations : null;
  agg.meltsPerSeed = agg.seeds ? agg.melts / agg.seeds : null;
  return agg;
}

if (require.main === module) {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-26', 'perseed-sim-tbmelt-a');
  const seeds = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
  const perSeed = [], bySeed = {};
  for (const seed of seeds) {
    const row = JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8'));
    const an = analyzeTbmelt(row.tbmelt, row.nonworldkill);
    perSeed.push({ seed: seed, analysis: an }); bySeed[seed] = an;
    console.log(`seed ${seed}: lifts=${an.lifted} mismatch=${an.mismatch} melts=${an.meltsTotal} restored=${an.byFate.restored || 0} killed=${an.killed.length} foughtMelts=${an.foughtMelts.length} unaccounted=${an.unaccounted.length} directBuildEnds=${an.directBuildEnds} crossAgree=${an.cross && an.cross.agree} otherMismatch=${an.mismatchOther.length}`);
  }
  const agg = bandAggregate(perSeed);
  const known = checkKnown5(bySeed);
  console.log('\nBAND: melts=' + agg.melts + ' lifted=' + agg.lifted + ' mismatch=' + agg.mismatch + ' restored=' + agg.restored + ' unaccounted=' + agg.unaccounted + ' killed=' + agg.killed + ' foughtMelts=' + agg.foughtMelts);
  console.log('meltsPerInitiation=' + agg.meltsPerInitiation + ' meltsPerSeed=' + agg.meltsPerSeed);
  console.log('meltsByDoor=' + JSON.stringify(agg.meltsByDoor));
  console.log('meltsByWave=' + JSON.stringify(agg.meltsByWave));
  for (const r of agg.meltRows) console.log(`  MELT s${r.seed} d${r.day} ${r.tileId} w${r.tileWave} via ${r.door} (fight ${r.fightMid} w${r.fightWave}, result ${r.result})`);
  for (const r of agg.restoredRows) console.log(`  RESTORED s${r.seed} d${r.day} ${r.tileId} w${r.tileWave} via ${r.door} (fight ${r.fightMid}, result ${r.result})`);
  for (const k of known) console.log(`  KNOWN5 s${k.seed} d${k.day} ${k.tileId}: expected ${k.expected}, actual ${k.actual}, door ${k.door} -> ${k.reproduced ? 'REPRODUCED' : 'DEVIATION'}`);
  const gate = agg.unaccounted === 0 && perSeed.every(ps => ps.analysis.mismatchOther.length === 0)
    && perSeed.every(ps => !ps.analysis.cross || ps.analysis.cross.agree)
    && known.every(k => k.reproduced);
  console.log('GATE: ' + (gate ? 'PASS' : 'FAIL'));
  if (!gate) process.exit(1);
}

module.exports = { analyzeTbmelt, checkKnown5, bandAggregate, findEndForLift, fateOfLift, KNOWN5 };
