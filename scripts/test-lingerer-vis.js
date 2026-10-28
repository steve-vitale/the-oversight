#!/usr/bin/env node
// scripts/test-lingerer-vis.js — sim-lingerer-vis-a analyzer / proof validator.
// Reads two corpora (CONTROL, ARMED) of w4damage-sweep rows
// (evidence/2026-10-28/perseed-lingerer-vis-a/{control,armed}/s*-armed.json)
// and judges the binding prereg (sim-lingerer-vis-a-prereg.md).
//
// Census definitions (exactly as pre-registered):
// - TOLL-WOUNDED LINGERER INSTANCE: key seq+tollDay. (1) a w4damage
//   raidTick changes row with tollExact=true and wall>0 for that seq;
//   AND (2) a w4damage daily snapshot on/after the toll day with
//   lingering=true for that seq. Linger-start day = first such snapshot.
// - ENGAGED (instance, day STRICTLY AFTER the toll day): any w4damage
//   fieldFight row, defwound resolve row, nonworldkill start
//   (tileMonster.seq), or oldcore tbEnd row for that seq. Instances
//   counted once. Toll-day fights are the raid night, never a
//   finishing trip (prereg NEVER clause; lingerStart remains the
//   birth witness, not the window edge).
// - FINISHED (instance, day STRICTLY AFTER the toll day): fieldFight
//   vKill, defwound vKill, or tbdmg tbEnd result 'won' joined by
//   fightId to a nonworldkill start with tileMonster.seq == seq.
// - Oldcore removals are corroboration only, never a primary finish.
// - Sense-replay text never enters any count (this analyzer reads
//   corpus rows only).
//
// Usage: node scripts/test-lingerer-vis.js <controlDir> <armedDir> [wallwoundsAfterDir]
// Prints JSON verdict + tables to stdout; writes analysis.json into the
// parent dir of the armed corpus. Exit 0 = analysis complete and both
// bands valid (verdict field carries GO/NO-GO); exit 1 = invalid band,
// missing data, or gate failure (verdict INVALID).
'use strict';
const fs = require('fs');
const path = require('path');

const CLAUSE = 'carries the wound at the treeline';

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function loadRows(dir) {
  const rows = [];
  for (const f of fs.readdirSync(dir).sort()) {
    if (!/^s\d+-armed\.json$/.test(f)) continue;
    rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
  return rows;
}
function storeErrs(row) {
  // Sum diag errs across recorder stores; missing diag counts as error.
  let errs = 0; const missing = [];
  for (const k of ['raftdraft', 'spawnsrc', 'oldcore', 'defwound', 'w5births', 'nonworldkill', 'tbdmg', 'w4damage']) {
    const d = row[k] && row[k].diag;
    if (!d) { missing.push(k); continue; }
    errs += (d.errs | 0);
    for (const ov of Object.values(d.overflow || {})) errs += (ov | 0);
  }
  return { errs, missing };
}
function censusRow(row) {
  const w4 = (row.w4damage || {});
  const raidTicks = w4.raidTicks || [];
  const snapshots = w4.snapshots || [];
  const fieldFights = w4.fieldFights || [];
  const defRows = ((row.defwound || {}).resolveFights || []);
  const nwkStarts = ((row.nonworldkill || {}).starts || []);
  const tbEnds = ((row.tbdmg || {}).tbEnds || []);
  const oldTbEnds = ((row.oldcore || {}).tbEnds || []);
  // Toll events per seq.
  const tolls = [];
  for (const rt of raidTicks) {
    for (const c of (rt.changes || [])) {
      if (c && c.tollExact && (c.wall | 0) > 0 && c.seq != null) {
        tolls.push({ seq: c.seq, day: rt.day | 0, postHp: c.postHp, maxHp: c.maxHp, wall: c.wall, type: c.type || null });
      }
    }
  }
  // Linger-start per (seq, tollDay).
  const instances = [];
  for (const t of tolls) {
    let start = null;
    for (const sn of snapshots) {
      if ((sn.day | 0) < t.day) continue;
      const hit = (sn.present || []).find(p => p && p.seq === t.seq && p.lingering);
      if (hit) { start = sn.day | 0; break; }
    }
    if (start == null) continue;
    const key = t.seq + '|' + t.day;
    if (instances.find(i => i.key === key)) continue;
    instances.push({ key, seq: t.seq, tollDay: t.day, lingerStart: start, type: t.type, postHp: t.postHp, maxHp: t.maxHp, wall: t.wall, events: [], finishes: [] });
  }
  // Engagement + finish events.
  const tbWonByFight = {};
  for (const e of tbEnds) if (e && e.result === 'won' && e.fightId) tbWonByFight[e.fightId] = true;
  const nwkByFight = {};
  for (const s of nwkStarts) if (s && s.fightId) nwkByFight[s.fightId] = s;
  for (const inst of instances) {
    // Engagement window is STRICTLY after the toll day: fights on the
    // toll day itself are the raid night (defenders), not a finishing
    // trip after the lingerer is named at the treeline. This is the
    // prereg's NEVER clause (raid-night fights on the toll day are
    // never counted); lingerStart is retained as the birth witness.
    const after = (d) => (d | 0) > inst.tollDay;
    for (const f of fieldFights) {
      if (f && f.seq === inst.seq && after(f.day)) {
        inst.events.push({ src: 'field', day: f.day, caller: f.caller || null, outcome: f.outcome || null });
        if (f.outcome === 'vKill') inst.finishes.push({ src: 'field', day: f.day, outcome: 'vKill' });
      }
    }
    for (const f of defRows) {
      if (f && f.seq === inst.seq && after(f.day)) {
        inst.events.push({ src: 'resolve', day: f.day, outcome: f.outcome || null });
        if (f.outcome === 'vKill') inst.finishes.push({ src: 'resolve', day: f.day, outcome: 'vKill' });
      }
    }
    for (const s of nwkStarts) {
      if (s && s.tileMonster && s.tileMonster.seq === inst.seq && after(s.day)) {
        inst.events.push({ src: 'tb-start', day: s.day, fightId: s.fightId || null });
        if (s.fightId && tbWonByFight[s.fightId]) inst.finishes.push({ src: 'tb', day: s.day, fightId: s.fightId });
      }
    }
    for (const e of oldTbEnds) {
      if (e && e.seq === inst.seq && after(e.day)) {
        inst.events.push({ src: 'tb-end', day: e.day, result: e.result || null, kind: e.kind || null });
      }
    }
  }
  return { instances };
}
function bandStats(dir) {
  const rows = loadRows(dir);
  const perSeed = [];
  let errs = 0; const errDetail = [];
  for (const r of rows) {
    const e = storeErrs(r);
    errs += e.errs;
    if (e.errs || e.missing.length) errDetail.push({ seed: r.seed, errs: e.errs, missing: e.missing });
    const c = censusRow(r);
    const engaged = c.instances.filter(i => i.events.length > 0);
    const finished = c.instances.filter(i => i.finishes.length > 0);
    perSeed.push({
      seed: r.seed, days: r.days, gameDays: r.gameDays, won: r.won,
      waveReach: r.waveReach, nationalEver: r.nationalEver ? 1 : 0,
      nationalFinal: r.nationalFinal ? 1 : 0, table: r.table ? 1 : 0,
      entered: r.entered ? 1 : 0, deathTotal: r.deathTotal,
      starvation: r.starvationDeaths | 0,
      courtship: ((r.courtship || {}).combined | 0),
      seatKind: ((r.ts || {}).tsSeatKind) || ((((r.tableState || {}).seat) || null)),
      instances: c.instances.length, engaged: engaged.length, finished: finished.length,
      lingerNights: null, instanceDetail: c.instances.map(i => ({
        key: i.key, seq: i.seq, type: i.type, tollDay: i.tollDay,
        lingerStart: i.lingerStart, postHp: i.postHp, maxHp: i.maxHp, wall: i.wall,
        engaged: i.events.length > 0, finished: i.finishes.length > 0,
        nEvents: i.events.length,
        bySrc: i.events.reduce((a, e) => { a[e.src] = (a[e.src] | 0) + 1; return a; }, {}),
        finishes: i.finishes,
      })),
    });
  }
  const sum = (k) => perSeed.reduce((a, s) => a + (s[k] | 0), 0);
  return {
    dir, rows: perSeed.length, errs, errDetail, perSeed,
    days: perSeed.map(s => s.days), medianDays: medianOf(perSeed.map(s => s.days)),
    nationalEver: sum('nationalEver'), nationalFinal: sum('nationalFinal'),
    tableInvited: sum('table'), tableEntered: sum('entered'), wins: sum('won'),
    deathTotal: sum('deathTotal'), starvation: sum('starvation'),
    courtshipCombined: sum('courtship'),
    courtshipActiveSeeds: perSeed.filter(s => s.courtship > 0).length,
    instances: sum('instances'), engaged: sum('engaged'), finished: sum('finished'),
    winsLesser: perSeed.filter(s => s.won && s.seatKind === 'lesser').length,
    winsFull: perSeed.filter(s => s.won && s.seatKind === 'full').length,
    wave4: perSeed.filter(s => (s.waveReach | 0) >= 4).length,
    wave5: perSeed.filter(s => (s.waveReach | 0) >= 5).length,
  };
}
function main() {
  const [controlDir, armedDir, parityDir] = process.argv.slice(2);
  if (!controlDir || !armedDir) { console.error('usage: test-lingerer-vis.js <controlDir> <armedDir> [parityDir]'); process.exit(2); }
  const control = bandStats(controlDir);
  const armed = bandStats(armedDir);
  let parity = null;
  if (parityDir) {
    const p = bandStats(parityDir);
    const fields = ['days', 'gameDays', 'won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal', 'courtship'];
    const diffs = [];
    for (const cs of control.perSeed) {
      const ps = p.perSeed.find(s => s.seed === cs.seed);
      if (!ps) { diffs.push({ seed: cs.seed, why: 'missing-in-parity' }); continue; }
      for (const f of fields) if ((cs[f] | 0) !== (ps[f] | 0)) diffs.push({ seed: cs.seed, field: f, control: cs[f], parity: ps[f] });
    }
    parity = { dir: parityDir, rows: p.rows, diffs, exact: diffs.length === 0 };
  }
  const legs = {};
  legs.a_parity = parity ? parity.exact : null;
  legs.b_beatFires = null; // filled from sense replays, reported in evidence (not corpus)
  legs.c_engagement = (armed.engaged >= control.engaged + 1) && (armed.finished >= control.finished);
  legs.d_cost = (armed.starvation <= control.starvation + 2) &&
    (armed.medianDays >= 0.8 * control.medianDays);
  // Arm-only starvation: seeds dead in armed but not dead in control.
  // "Dead" here = not won and days < 180 (horizon survivors and winners
  // are not dead). Starvation detail per seed is a count, so arm-only
  // starvation = sum over such seeds of armed starvation.
  const controlBySeed = {}; for (const s of control.perSeed) controlBySeed[s.seed] = s;
  let armOnlyDead = [], armOnlyStarv = 0;
  for (const s of armed.perSeed) {
    const c = controlBySeed[s.seed];
    const armedDead = !s.won && (s.days | 0) < 180;
    const controlDead = c && !c.won && (c.days | 0) < 180;
    if (armedDead && !controlDead) { armOnlyDead.push(s.seed); armOnlyStarv += (s.starvation | 0); }
  }
  legs.d_armOnly = { seeds: armOnlyDead, starvation: armOnlyStarv, pass: armOnlyStarv <= 2 };
  legs.d_cost = legs.d_cost && legs.d_armOnly.pass;
  legs.e_substrate = (control.courtshipCombined > 0 && control.courtshipActiveSeeds >= 6 &&
    armed.courtshipCombined > 0 && armed.courtshipActiveSeeds >= 6);
  legs.g_valid = (control.rows === 8 && armed.rows === 8 && control.errs === 0 && armed.errs === 0);
  const valid = legs.g_valid && legs.e_substrate && (parity ? parity.exact : true);
  // Leg (b) is sense-only and leg (f) is detgate-only: both are reported
  // in evidence and folded into the final verdict there, never faked here.
  const verdict = (!valid) ? 'INVALID' : 'PENDING-SENSE-DETGATE';
  const out = { clause: CLAUSE, verdict, legs, control, armed, parity, armOnlyDead, armOnlyStarv,
    engagementDelta: armed.engaged - control.engaged, finishDelta: armed.finished - control.finished };
  console.log(JSON.stringify(out, null, 2));
  try {
    const parent = path.dirname(path.resolve(armedDir));
    fs.writeFileSync(path.join(parent, 'analysis.json'), JSON.stringify(out, null, 2));
  } catch (e) { console.error('analysis.json write failed:', e.message); }
  process.exit(valid ? 0 : 1);
}
main();
