// sim-heraldarr-a-analyze.js — analyzer for the Herald arrival census.
// Usage: node scripts/sim-heraldarr-a-analyze.js <corpusDir> <outJson>
// Reads one JSON object per file in <corpusDir> (one line each),
// writes the analysis JSON to <outJson>, prints a short summary.
'use strict';
const fs = require('fs');
const path = require('path');
const HAL = require(path.join(__dirname, 'sim-heraldarr-a-lib'));

const dir = process.argv[2];
const outPath = process.argv[3];
if (!dir || !outPath) { console.error('usage: sim-heraldarr-a-analyze.js <corpusDir> <outJson>'); process.exit(2); }

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const seeds = [];
for (const f of files) {
  const raw = fs.readFileSync(path.join(dir, f), 'utf8').trim();
  // One JSON object per file (single line); tolerate trailing newline.
  const lines = raw.split('\n').filter(l => l.trim().length);
  if (lines.length !== 1) { console.error('SKIP ' + f + ': expected 1 JSON line, got ' + lines.length); continue; }
  seeds.push(JSON.parse(lines[0]));
}

function analyzeSeed(s) {
  const contacts = s.contacts || [];
  const scholarContacts = contacts.filter(c => c.channel === 'scholar').length;
  const villagerContacts = contacts.filter(c => c.channel === 'villager').length;
  const lairs = s.lairs || [];
  const dawns = s.dawns || [];
  const moves = s.moves || [];
  const travel = s.travelEvents || [];
  const located = lairs.length > 0 || dawns.some(d => d.omenStage !== null && d.omenStage >= 2);
  const contacted = contacts.length > 0;
  let seedClass = 'NEVER-LOCATED';
  if (contacted) seedClass = 'CONTACTED';
  else if (located) seedClass = 'LOCATED-UNFACED';
  let window = null;
  if (located) {
    const firstDawn = dawns.find(d => d.heraldTile);
    if (firstDawn) window = s.gameDays - firstDawn.day;
  }
  // Branch counts over travel events where a monster sat on the from-tile.
  // Mismatches count ONLY tracked herald cases (oldMonsterId 'herald' with
  // a branch contradiction); nested wander moves during other monsters'
  // travelTo calls are observations, not branch violations (v2 taxonomy).
  const branchCounts = {};
  const mismatches = [];
  let nestedMoves = 0;
  for (const t of travel) {
    if (t.oldMonsterId) {
      branchCounts[t.branch] = (branchCounts[t.branch] || 0) + 1;
      if (t.oldMonsterId === 'herald' && t.mismatch) mismatches.push({ day: t.day, from: t.from, dest: t.dest, oldMonsterId: t.oldMonsterId, branch: t.branch, mismatch: t.mismatch, heraldBefore: t.heraldBefore, heraldAfter: t.heraldAfter });
    }
    if (t.nestedMove) nestedMoves++;
  }
  const heraldTravel = travel.filter(t => t.oldMonsterId === 'herald');
  const heraldBranchCounts = {};
  for (const t of heraldTravel) heraldBranchCounts[t.branch] = (heraldBranchCounts[t.branch] || 0) + 1;
  // Move-kind counts.
  const moveKinds = {};
  for (const m of moves) moveKinds[m.kind] = (moveKinds[m.kind] || 0) + 1;
  // Chain events per inter-dawn window: primitive moves with day in
  // [prev.day, cur.day), PLUS dawn-tick spawns stamped day == cur.day
  // when the herald was absent at prev dawn (the spawn fires inside
  // titanDawnTick before the dawn snapshot, so its day stamp equals the
  // dawn day it appears in), PLUS synthesized follow legs from
  // travelEvents (the sweep's travelTo wrapper pushes no move events
  // since v2 — see the sweep note). A synthesized leg is dropped when
  // a primitive move with identical (day, from, to) already covers it.
  // Same-day order between a synthesized leg and same-day primitive
  // moves is unknown (nested worldTick order inside travelTo), so the
  // chain test tries primitives-then-synthesized AND the reverse.
  function windowChainEvents(prev, cur) {
    const prim = moves.filter(m => (m.day >= prev.day && m.day < cur.day) ||
      (m.kind === 'spawn' && m.day === cur.day && !prev.heraldTile));
    const primEvents = prim.map(m => ({ from: m.from, to: m.to, cls: m.kind }));
    const synth = [];
    for (const t of travel) {
      if (t.oldMonsterId !== 'herald') continue;
      if (!t.heraldBefore || !t.heraldAfter || HAL.sameTile(t.heraldBefore, t.heraldAfter)) continue;
      if (!(t.day >= prev.day && t.day < cur.day)) continue;
      const cls = t.branch === 'followEnter' ? 'followEnter' : (t.mismatch ? 'travelAnomaly' : 'travelOther');
      const dup = prim.some(m => m.day === t.day && HAL.sameTile(m.from, t.heraldBefore) && HAL.sameTile(m.to, t.heraldAfter));
      if (!dup) synth.push({ from: t.heraldBefore, to: t.heraldAfter, cls: cls });
    }
    return { primEvents: primEvents, synthEvents: synth, allMoves: prim };
  }
  function attributeWithOrderAllowance(prevTile, curTile, primEvents, synthEvents) {
    const a = HAL.attributeWindow(prevTile, curTile, primEvents.concat(synthEvents));
    if (a.attributed) return a;
    const b = HAL.attributeWindow(prevTile, curTile, synthEvents.concat(primEvents));
    if (b.attributed) return b;
    return a;
  }
  // Haven-tile arrival windows + attribution chains.
  const havenWindows = [];
  // Inter-dawn windows: move events are day-stamped with scholar.day at
  // the time of the call; dawn N's snapshot day == N. A move with day D
  // belongs to the window (dawn D .. dawn D+1) when D is the dawn day it
  // follows — but scholar.day during day D IS D, and the NEXT dawn is
  // day D+1's snapshot... except the dawn snapshot itself is stamped
  // with the NEW day. So: window (prevDawn.day -> dawn.day) collects
  // moves with day == prevDawn.day... NO: moves during calendar day D
  // happen after dawn-D snapshot and before dawn-(D+1) snapshot, and
  // scholar.day reads D throughout day D. The dawn-(D+1) snapshot is
  // stamped D+1. So window (dawn.day=D -> nextDawn.day=D+1) collects
  // moves with day == D. We implement generally: moves with day >=
  // prevDawn.day && day < dawn.day.
  for (let i = 1; i < dawns.length; i++) {
    const prev = dawns[i - 1], cur = dawns[i];
    if (!cur.heraldTile) continue;
    const curIsHaven = HAL.sameTile(cur.heraldTile, cur.havenTile);
    const prevIsHaven = prev.heraldTile ? HAL.sameTile(prev.heraldTile, cur.havenTile) : false;
    if (!curIsHaven || prevIsHaven) continue;
    const we = windowChainEvents(prev, cur);
    const attr = attributeWithOrderAllowance(prev.heraldTile, cur.heraldTile, we.primEvents, we.synthEvents);
    havenWindows.push({
      fromDawn: prev.day, toDawn: cur.day,
      fromTile: prev.heraldTile, toTile: cur.heraldTile,
      havenTile: cur.havenTile,
      movesInWindow: we.allMoves.map(m => ({ kind: m.kind, from: m.from, to: m.to, branch: m.branch || null })),
      attributed: attr.attributed, landingCls: attr.landingCls, reason: attr.reason,
    });
  }
  // Dawn-to-dawn change coverage: every pair with differing herald tiles
  // gets the same chain test (attributed or not).
  let changeWindows = 0, attributedWindows = 0;
  const unattributed = [];
  for (let i = 1; i < dawns.length; i++) {
    const prev = dawns[i - 1], cur = dawns[i];
    if (HAL.sameTile(prev.heraldTile, cur.heraldTile)) continue;
    if (!prev.heraldTile && !cur.heraldTile) continue;
    changeWindows++;
    const we = windowChainEvents(prev, cur);
    const attr = attributeWithOrderAllowance(prev.heraldTile, cur.heraldTile, we.primEvents, we.synthEvents);
    if (attr.attributed) attributedWindows++;
    else unattributed.push({ fromDawn: prev.day, toDawn: cur.day, fromTile: prev.heraldTile, toTile: cur.heraldTile, reason: attr.reason, movesInWindow: we.allMoves.map(m => ({ kind: m.kind, from: m.from, to: m.to })) });
  }
  return {
    seed: s.seed, days: s.days, gameDays: s.gameDays, endReason: s.endReason,
    endScaleRank: s.endScaleRank, maxWave: s.maxWave, wave4: s.wave4, wave5: s.wave5,
    national: s.national, table: s.table, won: s.won,
    seedClass: seedClass, window: window,
    lairCount: lairs.length, lairs: lairs,
    contacts: contacts.length, scholarContacts: scholarContacts, villagerContacts: villagerContacts,
    dawns: dawns.length, moves: moves.length,
    moveKinds: moveKinds, branchCounts: branchCounts, heraldBranchCounts: heraldBranchCounts,
    mismatches: mismatches, nestedMoves: nestedMoves, travelEvents: travel.length,
    captureErrs: s.captureErrs, havenWindows: havenWindows,
    changeWindows: changeWindows, attributedWindows: attributedWindows, unattributed: unattributed,
    worldTickCount: s.worldTickCount, wanderCalls: s.wanderCalls,
    raidCalls: s.raidCalls, dailyCalls: s.dailyCalls,
    endHerald: s.endHerald,
  };
}

const perSeed = seeds.map(analyzeSeed);
const sum = (f) => perSeed.reduce((a, s) => a + (f(s) || 0), 0);
const pooled = {
  seeds: perSeed.length,
  contactedSeeds: perSeed.filter(s => s.seedClass === 'CONTACTED').length,
  locatedUnfacedSeeds: perSeed.filter(s => s.seedClass === 'LOCATED-UNFACED').length,
  neverLocatedSeeds: perSeed.filter(s => s.seedClass === 'NEVER-LOCATED').length,
  won: sum(s => s.won), wonDay90: 0, // won-day-90 needs a won-day field; not in this instrument — reported as unknown, never 0-implied
  survivedUnwonPast120: perSeed.filter(s => !s.won && s.gameDays > 120).length,
  totalContacts: sum(s => s.contacts),
  totalScholarContacts: sum(s => s.scholarContacts),
  totalVillagerContacts: sum(s => s.villagerContacts),
  totalMoves: sum(s => s.moves),
  totalTravelEvents: sum(s => s.travelEvents),
  totalMismatches: sum(s => s.mismatches.length),
  havenWindows: perSeed.reduce((a, s) => a.concat(s.havenWindows.map(w => Object.assign({ seed: s.seed }, w))), []),
  changeWindows: sum(s => s.changeWindows),
  attributedWindows: sum(s => s.attributedWindows),
  unattributedWindows: perSeed.reduce((a, s) => a.concat(s.unattributed.map(w => Object.assign({ seed: s.seed }, w))), []),
  moveKinds: {},
  heraldBranchCounts: {},
  national: sum(s => s.national), table: sum(s => s.table),
  wave4: sum(s => s.wave4), wave5: sum(s => s.wave5),
  medianSurvival: (function () {
    const ds = perSeed.map(s => s.gameDays).sort((a, b) => a - b);
    return ds.length ? ds[Math.floor(ds.length / 2)] : null;
  })(),
};
for (const s of perSeed) {
  for (const k of Object.keys(s.moveKinds)) pooled.moveKinds[k] = (pooled.moveKinds[k] || 0) + s.moveKinds[k];
  for (const k of Object.keys(s.heraldBranchCounts)) pooled.heraldBranchCounts[k] = (pooled.heraldBranchCounts[k] || 0) + s.heraldBranchCounts[k];
}
pooled.wonDay90 = null; // not measured by this instrument; see note above

const analysis = { seeds: perSeed.length, perSeed: perSeed, pooled: pooled };
fs.writeFileSync(outPath, JSON.stringify(analysis, null, 1) + '\n');
console.log('seeds=' + perSeed.length +
  ' contacted=' + pooled.contactedSeeds +
  ' locatedUnfaced=' + pooled.locatedUnfacedSeeds +
  ' neverLocated=' + pooled.neverLocatedSeeds +
  ' contacts=' + pooled.totalContacts +
  ' havenWindows=' + pooled.havenWindows.length +
  ' havenLandings=' + JSON.stringify(pooled.havenWindows.map(w => w.landingCls)) +
  ' changeWindows=' + pooled.changeWindows + '/' + pooled.attributedWindows + ' attributed' +
  ' unattributed=' + pooled.unattributedWindows.length +
  ' mismatches=' + pooled.totalMismatches +
  ' heraldBranches=' + JSON.stringify(pooled.heraldBranchCounts) +
  ' won=' + pooled.won + ' national=' + pooled.national + ' table=' + pooled.table +
  ' wave4=' + pooled.wave4 + ' wave5=' + pooled.wave5);
