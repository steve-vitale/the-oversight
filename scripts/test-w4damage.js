#!/usr/bin/env node
// scripts/test-w4damage.js — sim-w4damage-a analyzer / proof validator.
// Reads evidence/2026-10-28/perseed-w4damage-a/ rows, checks parity
// against evidence/2026-10-27/perseed-w4channel-rebaseline/, re-derives
// wave-4 inter-fight HP gaps from defwound chains, and traces each gap
// through w4damage fieldFight rows (bypass routers), havenRaidTick
// rows (per-object tolls), and daily world-HP snapshots.
// Usage: node scripts/test-w4damage.js [--out <analysis.json>]
// Exit 0 only when the judged legs pass (see verdict section);
// exit 1 names the failing leg. Pure reads over committed corpora —
// it never re-runs a sim and never writes into the corpus dir
// except the --out analysis file (default: <corpus>/analysis.json).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-28', 'perseed-w4damage-a');
const PARITY = path.join(REPO, 'evidence', '2026-10-27', 'perseed-w4channel-rebaseline');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];
// The five drops as reported by sim-w4lethality-rebase (defwound-chain
// reading on the lethality corpus): seed, seq, delta, plus the wobble.
const KNOWN_DROPS = [
  { seed: 75106, seq: 47, mid: 'algorithm', delta: -250 },
  { seed: 75106, seq: 55, mid: 'eulogy', delta: -160 },
  { seed: 75106, seq: 57, mid: 'eulogy', delta: -225 },
  { seed: 75108, seq: 28, mid: 'reunion', delta: -300 },
  { seed: 75108, seq: 29, mid: 'reunion', delta: -300 },
];
const WOBBLE = { seed: 75106, seq: 55, mid: 'eulogy', fieldHp: 740, tbHp: 675, delta: -65 };

function loadRow(dir, seed) {
  return JSON.parse(fs.readFileSync(path.join(dir, `s${seed}-armed.json`), 'utf8'));
}
function diagOk(section) {
  return !!section && section.diag && section.diag.errs === 0 &&
    Object.values(section.diag.overflow || {}).every(v => (v | 0) === 0);
}
// Defwound-chain gaps for one row: consecutive resolve rows for the
// same seq (wave 4 only) whose next start differs from the previous
// end. Rows with seq null are untagged and never chained.
function chainGaps(row) {
  const rows = ((row.defwound || {}).resolveFights || []).filter(r => (r.wave | 0) === 4);
  const bySeq = {};
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.seq == null) continue;
    (bySeq[r.seq] = bySeq[r.seq] || []).push({ idx: i, row: r });
  }
  const gaps = [];
  for (const seq of Object.keys(bySeq)) {
    const chain = bySeq[seq];
    for (let j = 1; j < chain.length; j++) {
      const prev = chain[j - 1].row, next = chain[j].row;
      if (prev.mHpLeft == null || next.mHpStart == null) continue;
      const delta = next.mHpStart - prev.mHpLeft;
      if (delta !== 0) {
        gaps.push({
          seed: row.seed, seq: Number(seq), mid: next.mid || prev.mid,
          prevDay: prev.day, prevEnd: prev.mHpLeft, prevOutcome: prev.outcome,
          nextDay: next.day, nextStart: next.mHpStart, nextOutcome: next.outcome,
          delta: delta, prevMax: prev.mHpMax, nextMax: next.mHpMax,
        });
      }
    }
  }
  return gaps;
}
// Trace one gap through this seed's w4damage store.
// Interval: days (prevDay, nextDay] — events on the next row's day
// itself are included because intra-day order across recorders is
// not shared, but a same-day event that IS the next row is excluded
// by the defwound-match filter below.
function traceGap(row, gap) {
  const w4 = row.w4damage || { fieldFights: [], raidTicks: [], snapshots: [] };
  const defRows = ((row.defwound || {}).resolveFights || []).filter(r => r.seq === gap.seq);
  const defKey = (d, start) => `${d}|${start}`;
  const defKeys = new Set(defRows.map(r => defKey(r.day, r.mHpStart)));
  const bypass = [];
  for (const f of (w4.fieldFights || [])) {
    if (f.seq !== gap.seq) continue;
    if (!(f.day >= gap.prevDay && f.day <= gap.nextDay)) continue;
    // The next row itself re-appears here as a resolve-routed fight;
    // it is not a bypass. A w4damage fieldFight row matches a
    // defwound row when day + start HP agree (same event, two
    // recordings). Anything else in-window is a bypass fight.
    if (defKeys.has(defKey(f.day, f.mHpStart))) continue;
    bypass.push(f);
  }
  const tolls = [];
  for (const t of (w4.raidTicks || [])) {
    if (!(t.day >= gap.prevDay && t.day <= gap.nextDay)) continue;
    for (const c of (t.changes || [])) {
      if (c.seq === gap.seq && (c.delta | 0) !== 0) {
        tolls.push(Object.assign({ raidDay: t.day }, c));
      }
    }
  }
  // Snapshot bracket: last snapshot at-or-before prevDay's row vs
  // first snapshot at-or-after nextDay — reported for context, not
  // used to name a source (snapshots bracket, events name).
  const snaps = (w4.snapshots || []).map(s => {
    const p = (s.present || []).find(x => x.seq === gap.seq);
    return p ? { day: s.day, hp: p.hp, maxHp: p.maxHp } : null;
  }).filter(Boolean);
  const named = [];
  let explained = 0;
  for (const f of bypass) {
    if (f.worldMonster && f.mHpStart != null && f.mHpLeft != null) {
      const d = f.mHpLeft - f.mHpStart;
      if (d !== 0) { named.push({ kind: 'fieldFight-bypass', caller: f.caller, day: f.day, vid: f.vid, outcome: f.outcome, rounds: f.rounds, mDealt: f.mDealt, delta: d }); explained += d; }
    }
  }
  for (const t of tolls) {
    named.push({ kind: 'raidTick', raidDay: t.raidDay, preHp: t.preHp, postHp: t.postHp, delta: t.delta, wall: t.wall, tollExact: !!t.tollExact });
    explained += (t.delta | 0);
  }
  const traced = named.length > 0 && explained === gap.delta;
  const partial = named.length > 0 && explained !== gap.delta;
  return {
    gap: gap, bypass: bypass, tolls: tolls, snapshots: snaps,
    namedEvents: named, explainedDelta: explained,
    verdict: traced ? 'TRACED' : (partial ? 'PARTIAL' : 'UNNAMED'),
  };
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outPath = outIdx >= 0 ? args[outIdx + 1] : path.join(CORPUS, 'analysis.json');
  const rows = SEEDS.map(s => loadRow(CORPUS, s));
  const parityRows = SEEDS.map(s => loadRow(PARITY, s));
  // (a) Validity: 8 rows, days > 0, every recorder clean.
  const valid = rows.length === 8 && rows.every(r => r.days > 0 &&
    diagOk(r.raftdraft) && diagOk(r.spawnsrc) && diagOk(r.oldcore) &&
    diagOk(r.w5births) && diagOk(r.defwound) && diagOk(r.nonworldkill) &&
    diagOk(r.tbdmg) && diagOk(r.w4damage) &&
    Array.isArray(r.w4damage.fieldFights) && Array.isArray(r.w4damage.raidTicks) &&
    Array.isArray(r.w4damage.snapshots) && r.w4damage.snapshots.length > 0);
  // (c) Parity vs the rebaseline corpus only.
  const parityFields = ['days', 'gameDays', 'won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'deathTotal'];
  const parity = rows.map((r, i) => {
    const p = parityRows[i];
    const diffs = {};
    for (const f of parityFields) if (r[f] !== p[f]) diffs[f] = { mine: r[f], parity: p[f] };
    const courtMine = (r.courtship && r.courtship.combined) | 0;
    const courtPar = (p.courtship && p.courtship.combined) | 0;
    if (courtMine !== courtPar) diffs.courtshipCombined = { mine: courtMine, parity: courtPar };
    const chan = (rr) => {
      const d = ((rr.defwound || {}).resolveFights || []).filter(x => (x.wave | 0) === 4);
      return { field: d.filter(x => x.context === 'field').length, raid: d.filter(x => x.context === 'raid').length, total: d.length };
    };
    const cm = chan(r), cp = chan(p);
    if (JSON.stringify(cm) !== JSON.stringify(cp)) diffs.w4defwoundByContext = { mine: cm, parity: cp };
    const nwk = (rr) => (((rr.nonworldkill || {}).starts || []).filter(x => (x.wave | 0) === 4)).length;
    if (nwk(r) !== nwk(p)) diffs.w4nwkStarts = { mine: nwk(r), parity: nwk(p) };
    return { seed: r.seed, exact: Object.keys(diffs).length === 0, diffs: diffs };
  });
  const parityExact = parity.every(p => p.exact);
  // Courtship substrate gate.
  const courtTotals = {};
  for (const k of ['courtCounters', 'courtAccords', 'courtNational', 'courtGlobal', 'tended', 'defenseCalls', 'proposedLead', 'combined']) courtTotals[k] = rows.reduce((t, r) => t + ((r.courtship && r.courtship[k]) | 0), 0);
  const courtSeedsActive = rows.filter(r => r.courtship && r.courtship.combined > 0).length;
  const substrateOk = courtTotals.combined > 0 && courtSeedsActive >= 6;
  // Gaps + traces.
  const allGaps = [];
  for (const r of rows) allGaps.push(...chainGaps(r));
  const traces = allGaps.map(g => {
    const row = rows.find(r => r.seed === g.seed);
    return traceGap(row, g);
  });
  const traced = traces.filter(t => t.verdict === 'TRACED');
  const partial = traces.filter(t => t.verdict === 'PARTIAL');
  const unnamed = traces.filter(t => t.verdict === 'UNNAMED');
  // Known-drop recurrence: same seed + seq + delta on this band.
  const knownRecurrence = KNOWN_DROPS.map(k => {
    const found = allGaps.filter(g => g.seed === k.seed && g.seq === k.seq && g.delta === k.delta);
    const tracedFound = found.filter(g => traces.find(t => t.gap === g && t.verdict === 'TRACED'));
    return { known: k, recurred: found.length > 0, instances: found, traced: tracedFound.length > 0 };
  });
  const knownRecurred = knownRecurrence.filter(k => k.recurred).length;
  const knownTraced = knownRecurrence.filter(k => k.traced).length;
  // Wobble check: TB start hp for the seq vs last field end before it.
  const wobbleRow = rows.find(r => r.seed === WOBBLE.seed);
  let wobbleCheck = null;
  if (wobbleRow) {
    const starts = ((wobbleRow.nonworldkill || {}).starts || []).filter(s => s.tileMonster && s.tileMonster.seq === WOBBLE.seq);
    const fields = ((wobbleRow.defwound || {}).resolveFights || []).filter(f => f.seq === WOBBLE.seq);
    wobbleCheck = { starts: starts.map(s => ({ day: s.day, tileHp: s.tileMonster.hp, origin: s.origin })), lastFields: fields.slice(-4).map(f => ({ day: f.day, start: f.mHpStart, left: f.mHpLeft, outcome: f.outcome })) };
  }
  // Bypass census by caller class (wave 4 only, world-monster rows).
  const bypassCensus = {};
  for (const r of rows) {
    const defKeys = new Set((((r.defwound || {}).resolveFights) || []).map(x => `${x.day}|${x.seq}|${x.mHpStart}`));
    for (const f of ((r.w4damage || {}).fieldFights || [])) {
      if ((f.wave | 0) !== 4 || !f.worldMonster) continue;
      if (defKeys.has(`${f.day}|${f.seq}|${f.mHpStart}`)) continue;
      const k = f.caller || 'other';
      bypassCensus[k] = (bypassCensus[k] || 0) + 1;
    }
  }
  // Wall numbers (this band only).
  const wall = {
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wins: rows.reduce((t, r) => t + r.won, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDaysUpper: rows.map(r => r.days).sort((a, b) => a - b)[Math.floor(rows.length / 2)],
    days: rows.map(r => r.days),
    deathTotal: rows.reduce((t, r) => t + r.deathTotal, 0),
    starvationDeaths: rows.reduce((t, r) => t + r.starvationDeaths, 0),
  };
  const seats = {};
  for (const r of rows) { const st = (r.tableState && r.tableState.seat) || 'none'; seats[st] = (seats[st] || 0) + 1; }
  // Verdict (prereg GO rule, applied to the re-derived set):
  // - If the gap census is empty, the drop class did not re-derive:
  //   NON-REPRODUCED (not a failure of tracing).
  // - Else the judged set is the known drops that recurred, if at
  //   least one recurred; otherwise the full census gaps. GO needs
  //   >= 4 of 5 traced, or all traced when fewer than 5 are judged.
  let verdict, judgedSet, judgedTraced;
  if (allGaps.length === 0) {
    verdict = 'NON-REPRODUCED'; judgedSet = 0; judgedTraced = 0;
  } else if (knownRecurred > 0) {
    // Prereg: >= 4 of 5 traced, or ALL traced when fewer re-derive.
    judgedSet = knownRecurred; judgedTraced = knownTraced;
    verdict = (knownRecurred >= 5 ? knownTraced >= 4 : knownTraced === knownRecurred) ? 'GO' : 'NO-GO';
  } else {
    judgedSet = allGaps.length; judgedTraced = traced.length;
    verdict = (traced.length === allGaps.length) ? 'GO' : 'NO-GO';
  }
  const analysis = {
    label: 'sim-w4damage-a', seeds: SEEDS, valid: valid,
    parity: { exact: parityExact, perSeed: parity },
    substrate: { totals: courtTotals, seedsActive: courtSeedsActive, substrateOk: substrateOk },
    gaps: { total: allGaps.length, traced: traced.length, partial: partial.length, unnamed: unnamed.length },
    traces: traces, knownRecurrence: knownRecurrence,
    knownRecurred: knownRecurred, knownTraced: knownTraced,
    wobbleCheck: wobbleCheck, bypassCensus: bypassCensus,
    wall: wall, seats: seats, verdict: verdict,
    judgedSet: judgedSet, judgedTraced: judgedTraced,
    generated: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(analysis, null, 1) + '\n');
  console.log(`VALID: ${valid ? 'PASS' : 'FAIL'}`);
  console.log(`PARITY vs rebaseline: ${parityExact ? 'EXACT' : 'DIVERGED'}`);
  for (const p of parity) if (!p.exact) console.log(`  seed ${p.seed} diffs: ${JSON.stringify(p.diffs)}`);
  console.log(`SUBSTRATE: combined=${courtTotals.combined} seedsActive=${courtSeedsActive} ok=${substrateOk}`);
  console.log(`GAPS: total=${allGaps.length} traced=${traced.length} partial=${partial.length} unnamed=${unnamed.length}`);
  console.log(`KNOWN: recurred=${knownRecurred}/5 traced=${knownTraced}/5`);
  console.log(`BYPASS census (wave-4 world fights not in defwound): ${JSON.stringify(bypassCensus)}`);
  console.log(`WALL: natEver=${wall.nationalEver}/8 natFinal=${wall.nationalFinal}/8 table=${wall.table}/8 entered=${wall.entered}/8 wins=${wall.wins}/8 wave4=${wall.wave4}/8 wave5=${wall.wave5}/8 medianDays=${wall.medianDaysUpper} days=${JSON.stringify(wall.days)} deaths=${wall.deathTotal}`);
  console.log(`VERDICT: ${verdict} (judged ${judgedTraced}/${judgedSet}) -> ${outPath}`);
  const pass = valid && substrateOk && (verdict === 'GO' || verdict === 'NON-REPRODUCED');
  if (!pass) { console.error('PROOF GATE FAILURE: ' + (valid ? '' : 'valid FAIL ') + (substrateOk ? '' : 'substrate FAIL ') + (verdict === 'GO' || verdict === 'NON-REPRODUCED' ? '' : 'verdict ' + verdict)); process.exit(1); }
}
if (require.main === module) main();
module.exports = { chainGaps, traceGap, KNOWN_DROPS };
