#!/usr/bin/env node
// scripts/test-fieldguard-analyze.js — sim-fieldguard-a GO-leg analyzer.
// Reads evidence/2026-10-25/perseed-fieldguard-a/ per-seed rows:
//   s<seed>-control.json = unguarded recorder corpus (control tree)
//   s<seed>-armed.json   = guarded recorder corpus (this tree)
// Prints every pre-registered pilot leg for control vs armed, from ONE
// set of definitions (no re-scoring):
//   FIELD = analysis.byContext.field (kind-filtered person/villager,
//     non-scholar; the recorder's context classification).
//   ONE-ROUND <15% = fight rows (resolve field + direct field) with
//     outcome 'vDie', rounds == 1, vHpStartFrac < 0.15. (Historic
//     mechanism count was "6 of 9 one-round field deaths at 6–11%";
//     this recount is the judging baseline; any difference from 6 is
//     reported, and the arm is judged against the recount.)
//   STARV+SICK = kind-filtered villager deaths whose harness death-list
//     cause matches /starv|hunger/ (starvation) or /sick|disease|
//     plague|fever/ (sickness), counted off the raw death list in
//     each row (row.deathcensus.deaths), never off mixed totals.
//   GUARD FIRINGS = fight rows with outcome 'vWithdraw' (field
//     context), split resolve vs direct (expedition) rows.
//   MEDIANS: wins-excluded median = median days over non-winning
//     seeds; all-runs median alongside. WAVE-4-OR-WIN = seeds with
//     waveReach >= 4 OR won == 1.
// Usage: node scripts/test-fieldguard-analyze.js [evidDir]
// Exit 0 always (this prints legs; the evidence file judges).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.argv[2] || path.join(REPO, 'evidence', '2026-10-25', 'perseed-fieldguard-a');

function medianOf(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
function load(pid) {
  const rows = [];
  // Per-seed rows ONLY: /^s\d+-(control|armed)\.json$/ — summary files
  // (summary-control.json) also end in '-control.json' and must NOT be
  // counted as a seed row (this bug inflated the first control read
  // to n=9; medians printed then were not trustworthy).
  const re = new RegExp(`^s\\d+-${pid}\\.json$`);
  for (const f of fs.readdirSync(dir).sort()) {
    if (!re.test(f)) continue;
    try { rows.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))); } catch (e) { /* skip */ }
  }
  return rows.sort((a, b) => a.seed - b.seed);
}
function analyze(pid) {
  const rows = load(pid);
  const out = { pid, n: rows.length, seeds: rows.map((r) => r.seed) };
  out.won = rows.filter((r) => r.won).length;
  out.days = rows.map((r) => r.days);
  out.medianAll = medianOf(out.days);
  out.medianWinsExcluded = medianOf(rows.filter((r) => !r.won).map((r) => r.days));
  out.nationalEver = rows.filter((r) => r.nationalEver).length;
  out.nationalFinal = rows.filter((r) => r.nationalFinal).length;
  out.table = rows.filter((r) => r.table).length;
  out.entered = rows.filter((r) => r.entered).length;
  out.wave4orWin = rows.filter((r) => (r.waveReach || 1) >= 4 || r.won).length;
  out.wave4 = rows.filter((r) => (r.waveReach || 1) >= 4).length;
  out.wave5 = rows.filter((r) => (r.waveReach || 1) >= 5).length;
  out.maxArc = Math.max(0, ...rows.map((r) => r.maxArc || 1));
  const ctx = { raid: 0, field: 0, arena: 0, tb: 0, other: 0, unknown: 0 };
  let villager = 0, scholar = 0, monster = 0, unknownKind = 0, starvSick = 0, starv = 0, sick = 0;
  let oneRoundLt15 = 0, oneRoundTotal = 0;
  const oneRoundDetail = [];
  let withdraw = 0, withdrawResolve = 0, withdrawDirect = 0;
  let fieldFights = 0, fieldVDie = 0, raidFights = 0, raidVDie = 0, raidVKill = 0, raidMFleeBelow = 0;
  let recorderErrs = 0, resolveRows = 0, directRows = 0;
  for (const r of rows) {
    const dc = r.deathcensus || {};
    const a = dc.analysis;
    if (a) {
      for (const k of Object.keys(ctx)) ctx[k] += a.byContext[k] || 0;
      villager += a.population.villagerDeaths || 0;
      scholar += a.population.scholarDeaths || 0;
      monster += a.population.monsterDeaths || 0;
      unknownKind += a.population.unknownKindDeaths || 0;
      fieldFights += (a.fightTotals.fieldW3 || {}).fights || 0;
      raidFights += (a.fightTotals.raid || {}).fights || 0;
      raidVDie += (a.fightTotals.raid || {}).vDie || 0;
      raidVKill += (a.fightTotals.raid || {}).vKill || 0;
      raidMFleeBelow += (a.fightTotals.mFleeBelowLine || {}).raid || 0;
      resolveRows += (a.fightTotals || {}).resolveRows || 0;
      directRows += (a.fightTotals || {}).directRows || 0;
    }
    recorderErrs += (dc.diag && dc.diag.errs) || 0;
    // Kind-filtered starvation+sickness off the raw harness death list.
    for (const d of (dc.deaths || [])) {
      if (d.kind !== 'person' && d.kind !== 'villager') continue;
      if (d.player) continue;
      const c = String(d.cause || '');
      if (/starv|hunger/i.test(c)) { starv++; starvSick++; }
      else if (/sick|disease|plague|fever/i.test(c)) { sick++; starvSick++; }
    }
    // One-round <15% field deaths + guard firings off fight rows.
    const res = dc.resolveFights || [];
    const dir2 = dc.directFights || [];
    for (const row of res) {
      if (row.context !== 'field') continue;
      if (row.outcome === 'vWithdraw') { withdraw++; withdrawResolve++; }
      if (row.outcome === 'vDie') {
        if (row.rounds === 1) {
          oneRoundTotal++;
          if (row.vHpStartFrac != null && row.vHpStartFrac < 0.15) {
            oneRoundLt15++;
            oneRoundDetail.push({ seed: r.seed, day: row.day, vid: row.vid, mid: row.mid, vHp: row.vHpStartFrac, wave: row.wave, src: 'resolve' });
          }
        }
      }
    }
    for (const row of dir2) {
      if (row.context !== 'field') continue;
      if (row.outcome === 'vWithdraw') { withdraw++; withdrawDirect++; }
      if (row.outcome === 'vDie') {
        if (row.rounds === 1) {
          oneRoundTotal++;
          if (row.vHpStartFrac != null && row.vHpStartFrac < 0.15) {
            oneRoundLt15++;
            oneRoundDetail.push({ seed: r.seed, day: row.day, vid: row.vid, mid: row.mid, vHp: row.vHpStartFrac, wave: row.wave, src: 'direct' });
          }
        }
      }
    }
    for (const row of res.concat(dir2)) if (row.context === 'field' && row.outcome === 'vDie') fieldVDie++;
  }
  out.byContext = ctx;
  out.villagerDeaths = villager; out.scholarDeaths = scholar; out.monsterDeaths = monster; out.unknownKindDeaths = unknownKind;
  out.starvSick = starvSick; out.starv = starv; out.sick = sick;
  out.oneRoundLt15 = oneRoundLt15; out.oneRoundTotal = oneRoundTotal; out.oneRoundDetail = oneRoundDetail;
  out.withdraw = withdraw; out.withdrawResolve = withdrawResolve; out.withdrawDirect = withdrawDirect;
  out.fieldVDieRows = fieldVDie; out.raidFights = raidFights; out.raidVDie = raidVDie; out.raidVKill = raidVKill; out.raidMFleeBelow = raidMFleeBelow;
  out.resolveRows = resolveRows; out.directRows = directRows; out.recorderErrs = recorderErrs;
  out.deathTotal = rows.reduce((s, r) => s + (r.deathTotal || 0), 0);
  return out;
}
function printOut(o) {
  console.log(`--- ${o.pid} (n=${o.n} seeds ${o.seeds.join(',')}) ---`);
  console.log(`won=${o.won}/${o.n} medianAll=${o.medianAll}d medianWinsExcluded=${o.medianWinsExcluded}d nationalEver=${o.nationalEver}/${o.n} nationalFinal=${o.nationalFinal}/${o.n} table=${o.table} entered=${o.entered} wave4=${o.wave4} wave4orWin=${o.wave4orWin} wave5=${o.wave5} maxArc=${o.maxArc}`);
  console.log(`byContext=${JSON.stringify(o.byContext)} villagerDeaths=${o.villagerDeaths} scholar=${o.scholarDeaths} monster=${o.monsterDeaths} unknownKind=${o.unknownKindDeaths} deathTotal(mixed)=${o.deathTotal}`);
  console.log(`oneRoundFieldDeaths=${o.oneRoundTotal} oneRoundLt15=${o.oneRoundLt15} detail=${JSON.stringify(o.oneRoundDetail)}`);
  console.log(`starv=${o.starv} sick=${o.sick} starvSick=${o.starvSick}`);
  console.log(`guardWithdrawals=${o.withdraw} (resolve=${o.withdrawResolve} direct-expedition=${o.withdrawDirect})`);
  console.log(`fieldVDieRows=${o.fieldVDieRows} raidFights=${o.raidFights} raidVDie=${o.raidVDie} raidVKill=${o.raidVKill} raidMFleeBelowLine=${o.raidMFleeBelow}`);
  console.log(`fightRows resolve=${o.resolveRows} direct=${o.directRows} recorderErrs=${o.recorderErrs}`);
}
const ctrl = analyze('control');
const armed = analyze('armed');
printOut(ctrl);
printOut(armed);
console.log('--- PILOT GO LEGS (armed vs control; GO needs ALL) ---');
const legs = [
  ['PRIMARY field deaths <= 9 (control ' + ctrl.byContext.field + ')', armed.byContext.field <= 9],
  ['one-round <15% deaths <= 2 (control recount ' + ctrl.oneRoundLt15 + ')', armed.oneRoundLt15 <= 2],
  ['wins-excluded median >= 180d (armed ' + armed.medianWinsExcluded + ')', armed.medianWinsExcluded != null && armed.medianWinsExcluded >= 180],
  ['national-ever >= 6/8', armed.nationalEver >= 6],
  ['wave-4-or-win >= 5/8', armed.wave4orWin >= 5],
  ['raid villager deaths <= 2 (control ' + ctrl.byContext.raid + ')', armed.byContext.raid <= 2],
  ['starv+sick <= control ' + ctrl.starvSick + ' + 2', armed.starvSick <= ctrl.starvSick + 2],
  ['directed probe binding cases PASS (see probe log)', null],
  ['guard fired in sweep (withdraw > 0)', armed.withdraw > 0],
];
for (const [name, v] of legs) console.log(`  [${v === null ? '?' : (v ? 'PASS' : 'FAIL')}] ${name}`);
