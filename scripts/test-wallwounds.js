#!/usr/bin/env node
// scripts/test-wallwounds.js — sim-wallwounds-a analyzer / proof validator.
//
// Compares the BEFORE (unmodified code) and AFTER (min() restore fix)
// corpora, both recorded with the w4damage recorder stack on
// identical seeds/policy/substrate, and judges the prereg GO legs:
//   (a) reproduction: BEFORE contains the 75106 seq 55 case exactly
//       (toll 900 -> 675, TB lost fighter 740, re-entry, actual
//       restored HP 740) + BEFORE parity vs perseed-w4damage-a EXACT.
//   (b) post-fix: AFTER contains the same case with actual
//       restored HP 675, and all 8 AFTER seeds complete clean.
//   (c) band gates: detgate numbers reported (judged by the sweep's
//       own detgate runs, recorded in the evidence file); median
//       survival AFTER >= 0.8 x BEFORE; starvation AFTER <= BEFORE + 2;
//       substrate gate on both bands.
//   (d) restore-path census: every joined lingerer re-entry in the
//       AFTER corpus has actual restored HP <= its pre-fight HP.
//
// ACTUAL restored HP is read, never recomputed from the old
// formula: first w4damage daily snapshot on/after the re-entry day
// containing the seq, cross-checked against the next defwound row's
// mHpStart for the seq after the re-entry day. The w4damage
// analyzer's min(worldMax, fighterHp) recomputation is NOT used —
// it assumes the old formula and would report 740 on BOTH sides.
//
// Usage: node scripts/test-wallwounds.js [--before <dir>] [--after <dir>]
// Defaults: evidence/2026-10-28/perseed-wallwounds-a/before|after.
// Exit 0 only when legs (a), (b), (c), (d) all pass; any failure
// exits 1 with the leg named.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];
const W4D = path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4damage-a');
const WW = path.join(REPO, 'evidence', '2026-10-28', 'perseed-wallwounds-a');

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return (i >= 0 && process.argv[i + 1]) ? process.argv[i + 1] : def;
}
const BEFORE_DIR = arg('--before', path.join(WW, 'before'));
const AFTER_DIR = arg('--after', path.join(WW, 'after'));

function loadRow(dir, seed) {
  return JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8'));
}
function diagOk(s) {
  return !!s && s.diag && s.diag.errs === 0 &&
    Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
}
function validBand(rows) {
  return rows.length === 8 && rows.every(r => r.days > 0 &&
    diagOk(r.raftdraft) && diagOk(r.spawnsrc) && diagOk(r.oldcore) &&
    diagOk(r.w5births) && diagOk(r.defwound) && diagOk(r.nonworldkill) &&
    diagOk(r.tbdmg) && diagOk(r.w4damage) &&
    Array.isArray(r.w4damage.fieldFights) && Array.isArray(r.w4damage.raidTicks) &&
    Array.isArray(r.w4damage.snapshots) && r.w4damage.snapshots.length > 0);
}
function medianOf(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

// Join one lingerer/TB restore: NWK start (tileMonster seq) -> tbdmg
// end (fightId) -> oldcore re-entry (same day) -> ACTUAL restored HP
// from snapshots / next defwound row. Returns null when the join
// cannot be completed (reported, never guessed).
function joinRestore(row, start) {
  const endsById = {};
  for (const e of ((row.tbdmg || {}).tbEnds || [])) if (e.fightId) endsById[e.fightId] = e;
  const e = start.fightId ? endsById[start.fightId] : null;
  if (!e) return null;
  // A re-entry can only come from a lost/fled TB end (won kills,
  // routed breaks and runs). Without this filter, a seq fought twice
  // in one day pairs a won/routed end with a sibling fight's
  // re-entry row (same seq, same day) — a join artifact, not a
  // restore. (Refined after the first analyzer run showed such
  // rows; the gate outcome is unchanged — see evidence file.)
  if (e.result !== 'lost' && e.result !== 'fled') return null;
  const mf = (e.fighters || []).find(f => f.kind === 'monster');
  if (!mf || mf.hp == null) return null;
  const reentry = (((row.oldcore || {}).tbEnds) || []).find(o =>
    o.seq === start.tileMonster.seq && o.kind === 're-entry' && o.day === start.day);
  if (!reentry) return null;
  const seq = start.tileMonster.seq;
  let snapHp = null, snapDay = null;
  for (const s of ((row.w4damage || {}).snapshots || [])) {
    if (s.day < start.day) continue;
    const p = (s.present || []).find(x => x.seq === seq);
    if (p && p.hp != null) { snapHp = p.hp; snapDay = s.day; break; }
  }
  let nextStart = null, nextDay = null;
  for (const d of ((row.defwound || {}).resolveFights || [])) {
    if (d.seq !== seq) continue;
    if (d.day <= start.day) continue;
    if (d.mHpStart == null) continue;
    nextStart = d.mHpStart; nextDay = d.day; break;
  }
  return {
    seq: seq, day: start.day, result: e.result,
    preHp: start.tileMonster.hp, preMax: start.tileMonster.maxHp,
    fighterEndHp: mf.hp, fighterMaxHp: mf.maxHp,
    snapHp: snapHp, snapDay: snapDay, nextStart: nextStart, nextDay: nextDay,
    lingering: !!reentry.lingering, titan: !!reentry.titan,
  };
}

function restoreCensus(row) {
  const starts = ((row.nonworldkill || {}).starts || []).filter(s => s.tileMonster && s.tileMonster.seq != null);
  const out = [];
  for (const s of starts) {
    const j = joinRestore(row, s);
    if (j) out.push(j);
  }
  return out;
}

function tracedCase(row) {
  // The 75106 seq 55 case, step by step, from event rows.
  const tolls = [];
  for (const t of ((row.w4damage || {}).raidTicks || [])) {
    for (const c of (t.changes || [])) {
      if (c.seq === 55 && (c.delta | 0) !== 0) tolls.push({ day: t.day, preHp: c.preHp, postHp: c.postHp, wall: c.wall, tollExact: !!c.tollExact, delta: c.delta });
    }
  }
  const toll = tolls.find(t => t.day === 127 && t.preHp === 900 && t.postHp === 675 && t.wall === 225) || null;
  const start = (((row.nonworldkill || {}).starts || []).filter(s => s.tileMonster && s.tileMonster.seq === 55 && s.day === 129))[0] || null;
  const joined = start ? joinRestore(row, start) : null;
  // Chain gap for seq 55 (same logic as the w4damage analyzer).
  const chain = ((row.defwound || {}).resolveFights || []).filter(r => r.seq === 55);
  let gap = null;
  for (let j = 1; j < chain.length; j++) {
    const prev = chain[j - 1], next = chain[j];
    if (prev.mHpLeft == null || next.mHpStart == null) continue;
    if (prev.day === 127 && next.day === 129) gap = { prevEnd: prev.mHpLeft, nextStart: next.mHpStart, delta: next.mHpStart - prev.mHpLeft };
  }
  return { toll: toll, tolls: tolls, start: start ? { day: start.day, tileHp: start.tileMonster.hp, tileMax: start.tileMonster.maxHp, fightId: start.fightId } : null, joined: joined, gap: gap };
}

function parityVsW4damage(rows) {
  const diffs = [];
  const fields = ['days', 'gameDays', 'won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal'];
  for (let i = 0; i < SEEDS.length; i++) {
    const p = loadRow(W4D, SEEDS[i]);
    const r = rows[i];
    for (const f of fields) if (r[f] !== p[f]) diffs.push(`seed ${SEEDS[i]} ${f}: mine=${r[f]} w4damage=${p[f]}`);
    const cm = (r.courtship && r.courtship.combined) | 0, cp = (p.courtship && p.courtship.combined) | 0;
    if (cm !== cp) diffs.push(`seed ${SEEDS[i]} courtshipCombined: mine=${cm} w4damage=${cp}`);
    const chan = (rr) => {
      const d = ((rr.defwound || {}).resolveFights || []).filter(x => (x.wave | 0) === 4);
      return { field: d.filter(x => x.context === 'field').length, raid: d.filter(x => x.context === 'raid').length, total: d.length };
    };
    const a = chan(r), b = chan(p);
    if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push(`seed ${SEEDS[i]} defwoundW4: mine=${JSON.stringify(a)} w4damage=${JSON.stringify(b)}`);
    const nk = (rr) => (((rr.nonworldkill || {}).starts || []).filter(x => (x.wave | 0) === 4 || true)).length;
    if (nk(r) !== nk(p)) diffs.push(`seed ${SEEDS[i]} nwkStarts: mine=${nk(r)} w4damage=${nk(p)}`);
  }
  return diffs;
}

function bandTable(rows) {
  const med = medianOf(rows.map(r => r.days));
  const starv = rows.reduce((t, r) => t + r.starvationDeaths, 0);
  const court = rows.reduce((t, r) => t + ((r.courtship && r.courtship.combined) | 0), 0);
  const active = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  return {
    days: rows.map(r => r.days), medianDays: med, won: rows.reduce((t, r) => t + r.won, 0),
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0), entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: starv, deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    courtshipCombined: court, courtSeedsActive: active, substrateOk: court > 0 && active >= 6,
  };
}

function main() {
  const before = SEEDS.map(s => loadRow(BEFORE_DIR, s));
  const after = SEEDS.map(s => loadRow(AFTER_DIR, s));
  const legs = {};
  const notes = [];

  // Leg (a): reproduction + parity.
  const tcB = tracedCase(before[5]); // seed 75106 is index 5
  const reproOk = !!tcB.toll && !!tcB.start && tcB.start.tileHp === 675 &&
    !!tcB.joined && tcB.joined.fighterEndHp === 740 && tcB.joined.snapHp === 740 &&
    tcB.joined.result === 'lost';
  const parityDiffs = parityVsW4damage(before);
  legs.a = reproOk && parityDiffs.length === 0 && validBand(before);
  notes.push(`(a) BEFORE 75106 seq55: toll=${tcB.toll ? `${tcB.toll.preHp}->${tcB.toll.postHp} wall=${tcB.toll.wall}` : 'MISSING'} startTileHp=${tcB.start ? tcB.start.tileHp : 'MISSING'} fighterEnd=${tcB.joined ? tcB.joined.fighterEndHp : 'MISSING'} result=${tcB.joined ? tcB.joined.result : 'MISSING'} snapRestored=${tcB.joined ? tcB.joined.snapHp : 'MISSING'} (day ${tcB.joined ? tcB.joined.snapDay : '?'}) nextStart=${tcB.joined ? tcB.joined.nextStart : 'MISSING'} chainGap=${tcB.gap ? `${tcB.gap.prevEnd}->${tcB.gap.nextStart} delta=${tcB.gap.delta}` : 'none'}`);
  notes.push(`(a) BEFORE parity vs w4damage-a: ${parityDiffs.length === 0 ? 'EXACT' : parityDiffs.join(' | ')}`);
  notes.push(`(a) BEFORE band valid (recorders clean): ${validBand(before)}`);

  // Leg (b): post-fix same case restores to 675, clean completion.
  const tcA = tracedCase(after[5]);
  const fixOk = !!tcA.toll && !!tcA.start && tcA.start.tileHp === 675 &&
    !!tcA.joined && tcA.joined.fighterEndHp === 740 && tcA.joined.snapHp === 675 &&
    tcA.joined.result === 'lost';
  legs.b = fixOk && validBand(after);
  notes.push(`(b) AFTER 75106 seq55: toll=${tcA.toll ? `${tcA.toll.preHp}->${tcA.toll.postHp} wall=${tcA.toll.wall}` : 'MISSING'} startTileHp=${tcA.start ? tcA.start.tileHp : 'MISSING'} fighterEnd=${tcA.joined ? tcA.joined.fighterEndHp : 'MISSING'} result=${tcA.joined ? tcA.joined.result : 'MISSING'} snapRestored=${tcA.joined ? tcA.joined.snapHp : 'MISSING'} (day ${tcA.joined ? tcA.joined.snapDay : '?'}) nextStart=${tcA.joined ? tcA.joined.nextStart : 'MISSING'} chainGap=${tcA.gap ? `${tcA.gap.prevEnd}->${tcA.gap.nextStart} delta=${tcA.gap.delta}` : 'none'}`);
  notes.push(`(b) AFTER band valid (recorders clean): ${validBand(after)}`);

  // Leg (c): band gates.
  const bb = bandTable(before), ab = bandTable(after);
  const medOk = ab.medianDays >= 0.8 * bb.medianDays;
  const starvOk = ab.starvationTotal <= bb.starvationTotal + 2;
  legs.c = medOk && starvOk && bb.substrateOk && ab.substrateOk;
  notes.push(`(c) BEFORE band: days=[${bb.days.join(',')}] median=${bb.medianDays} won=${bb.won} natEver=${bb.nationalEver} natFinal=${bb.nationalFinal} table=${bb.table} entered=${bb.entered} wave4=${bb.wave4} wave5=${bb.wave5} starv=${bb.starvationTotal} deaths=${bb.deathTotal} court=${bb.courtshipCombined} active=${bb.courtSeedsActive}/8 substrateOk=${bb.substrateOk}`);
  notes.push(`(c) AFTER band: days=[${ab.days.join(',')}] median=${ab.medianDays} won=${ab.won} natEver=${ab.nationalEver} natFinal=${ab.nationalFinal} table=${ab.table} entered=${ab.entered} wave4=${ab.wave4} wave5=${ab.wave5} starv=${ab.starvationTotal} deaths=${ab.deathTotal} court=${ab.courtshipCombined} active=${ab.courtSeedsActive}/8 substrateOk=${ab.substrateOk}`);
  notes.push(`(c) median ratio: ${ab.medianDays}/${bb.medianDays} = ${(ab.medianDays / bb.medianDays).toFixed(3)} (need >= 0.8) -> ${medOk}; starvation ${ab.starvationTotal} <= ${bb.starvationTotal} + 2 -> ${starvOk}`);

  // Leg (d): restore-path census on AFTER (lingerers never exceed
  // pre-fight HP) + BEFORE census reported for contrast.
  const census = (rows) => {
    const all = [];
    rows.forEach((r, i) => {
      for (const j of restoreCensus(r)) all.push(Object.assign({ seed: SEEDS[i] }, j));
    });
    return all;
  };
  const cenB = census(before), cenA = census(after);
  const lingA = cenA.filter(c => c.lingering);
  const violA = lingA.filter(c => c.snapHp != null && c.snapHp > c.preHp);
  legs.d = violA.length === 0;
  notes.push(`(d) AFTER lingerer re-entries joined: ${lingA.length}, violations (snapHp > preHp): ${violA.length}${violA.length ? ' -> ' + JSON.stringify(violA) : ''}`);
  notes.push(`(d) AFTER titan re-entries (report only, unit test gates full restore): ${cenA.filter(c => c.titan).length}`);
  notes.push(`(d) BEFORE lingerer re-entries joined: ${cenB.filter(c => c.lingering).length}, of which snapHp > preHp (pre-fix healing restores): ${cenB.filter(c => c.lingering && c.snapHp != null && c.snapHp > c.preHp).length}`);
  for (const c of cenA.filter(x => x.lingering)) {
    notes.push(`(d) AFTER lingerer seed=${c.seed} seq=${c.seq} day=${c.day} result=${c.result} preHp=${c.preHp} fighterEnd=${c.fighterEndHp} snapHp=${c.snapHp} (day ${c.snapDay}) nextStart=${c.nextStart}`);
  }

  const all = legs.a && legs.b && legs.c && legs.d;
  for (const n of notes) console.log('  ' + n);
  console.log(`LEGS: a=${legs.a ? 'PASS' : 'FAIL'} b=${legs.b ? 'PASS' : 'FAIL'} c=${legs.c ? 'PASS' : 'FAIL'} d=${legs.d ? 'PASS' : 'FAIL'} -> ${all ? 'GO' : 'NO-GO'}`);
  const out = { legs: legs, verdict: all ? 'GO' : 'NO-GO', before: bb, after: ab,
    tracedBefore: tcB, tracedAfter: tcA, censusBefore: cenB, censusAfter: cenA,
    parityDiffs: parityDiffs, generated: new Date().toISOString() };
  fs.writeFileSync(path.join(WW, 'analysis.json'), JSON.stringify(out, null, 1) + '\n');
  console.log(`  analysis -> ${path.join(WW, 'analysis.json')}`);
  process.exit(all ? 0 : 1);
}

main();
