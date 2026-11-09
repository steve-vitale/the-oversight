#!/usr/bin/env node
// analyze-medchannel-seed-a.js — MEDICINE-CHANNEL SEEDED-STASH census (measurement only)
// (sim-medchannel-seed-a, 2026-11-09.) Reads the per-seed corpora the
// sweep records on identical seeds (95205-95208) under the competent
// policy: BEFORE (unseeded) and SEEDED (20 antibiotics + 20
// antiparasitic in the Haven pharmacy at day 1). Modes:
//   node scripts/analyze-medchannel-seed-a.js --leg <corpusDir> --legname before|seeded
//     single-leg census (numbers only, no gates)
//   node scripts/analyze-medchannel-seed-a.js --before <corpusDir> --after <corpusDir>
//     before/after comparison + G1 (primary) + G2 (guardrails) verdicts.
//     Exit 0 on GO, 1 on NO-GO (a guardrail breach is NO-GO even if the
//     primary passes, per MEASUREMENT.md §14).
// The balanced-panel compare (§15, G3) and the proof test (G4) are judged
// separately; this analyzer prints the panel placeholder, not a verdict.
//
// CLASSIFICATION (prereg-binding): each medicine cure event is classified
// from the live cure table (src/data/statusEffects.json) + the event's
// recorded fields (diseaseId, kind, diagnosed, holderAbilities):
//   - table check: cure[diseaseId][kind] must be 'cure' or the event is a
//     TABLE-VIOLATION (the channel fired where the table says it cannot).
//   - alien: def.pool === 'alien' → G1 fails outright. trembles → G1 fails.
//   - ability-available: some held ability has cure === 'cure' AND
//     (!needsDiagnosis OR diagnosed). Otherwise medicine-unique.
//   - trichinosis is reported separately (expected 0 BY CONSTRUCTION:
//     no NPC patient can ever present it — see prereg).
// DOSE BALANCE (prereg-binding): per seed, day0Doses − finalMedDoses
// (total doses removed) must equal medicine cures + non-duty takes, where
// non-duty takes are stashLog medicine takes whose (day, vid) does NOT
// match a medicine cure event's (day, holder). Duty takes are exactly one
// per medicine cure (the channel's own stashLog call).
'use strict';
const fs = require('fs');
const path = require('path');

const SEEDS = [95205, 95206, 95207, 95208, 95209, 95210, 95211, 95212];
const LEGNAMES = { before: 'before', seeded: 'seeded' };

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function med(a) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}
function loadTable() {
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'statusEffects.json'), 'utf8'));
  return raw.statuses || raw;
}

// Pure classifier (also exercised by the proof test on synthetic events).
function classify(event, table) {
  const def = table[event.diseaseId];
  if (!def) return { cls: 'unknown-disease', reason: 'no def for ' + event.diseaseId };
  if (!def.cure || def.cure[event.kind] !== 'cure') {
    return { cls: 'table-violation', reason: `cure[${event.diseaseId}][${event.kind}] = ${(def.cure || {})[event.kind] || 'none'} (not 'cure')` };
  }
  if (def.pool === 'alien') return { cls: 'alien', reason: 'alien pool' };
  if (event.diseaseId === 'trembles') return { cls: 'trembles', reason: 'no cure at any tier' };
  const needsDiag = !!(def.cure && def.cure.needsDiagnosis);
  const avail = (event.holderAbilities || []).some(ab =>
    def.cure[ab] === 'cure' && (!needsDiag || !!event.diagnosed));
  return { cls: avail ? 'ability-available' : 'medicine-unique',
    reason: avail ? 'a held ability also cures' : 'no held ability cures this disease' };
}

function censusLeg(dir, legName) {
  const leg = { dir, leg: legName, seeds: [], daysAlive: [], national: 0, table: 0, win: 0,
    waveReach: {}, deathCauses: {}, deathRows: [],
    medCures: [], abCures: [], cureLines: [], anomalies: [],
    dutyHeldDays: 0, villageDays: 0, day0Doses: {}, finalDoses: {},
    nonDutyTakes: [], doseRemoved: 0, doseBalanceOk: true,
    tableViolations: [], alienCures: [], tremblesCures: [], trichCures: [],
    undiagnosedMedCures: 0, byDisease: {}, byKind: {}, byClass: {},
    seedRows: [], gaps: [], dupDays: [] };
  for (const s of SEEDS) {
    const f = readJson(path.join(dir, `medchannel-seed-a-${legName}-s${s}.json`));
    leg.seeds.push(s);
    leg.daysAlive.push(f.daysAlive);
    if (f.national) leg.national++;
    if (f.table) leg.table++;
    if (f.win) leg.win++;
    for (const w of (f.waveReach || [])) leg.waveReach[w] = (leg.waveReach[w] || 0) + 1;
    for (const [c, n] of Object.entries(f.deathCauses || {})) leg.deathCauses[c] = (leg.deathCauses[c] || 0) + n;
    leg.deathRows.push(...(f.deathRows || []));
    leg.anomalies.push(...(f.anomalies || []).map(a => ({ seed: s, ...a })));
    leg.cureLines.push(...(f.cureLines || []).map(l => ({ seed: s, ...l })));
    // Daily-row integrity: days strictly +1, no gaps unreported.
    // Distinguish TRUE missing days from DUPLICATE-day rows (policy.daily
    // is occasionally called twice on one game day — a harness artifact,
    // same rows on both legs; the final counters are read after runDays,
    // so cure counts are complete regardless).
    const days = (f.daily || []).map(d => d.day);
    const seen = new Set();
    for (const dy of days) {
      if (seen.has(dy)) leg.dupDays.push({ seed: s, day: dy });
      seen.add(dy);
    }
    if (days.length) {
      for (let dy = days[0]; dy <= days[days.length - 1]; dy++) {
        if (!seen.has(dy)) leg.gaps.push({ seed: s, missing: dy });
      }
    }
    for (const d of (f.daily || [])) {
      leg.villageDays++;
      if (d.dutyHeld) leg.dutyHeldDays++;
    }
    // Dose balance for this seed.
    const d0 = (f.day0Doses || {}), df = (f.finalMedDoses || {});
    const removed = (d0.antibiotics + d0.antiparasitic) - (df.antibiotics + df.antiparasitic);
    leg.doseRemoved += removed;
    for (const k of ['antibiotics', 'antiparasitic']) {
      leg.day0Doses[k] = (leg.day0Doses[k] || 0) + (d0[k] || 0);
      leg.finalDoses[k] = (leg.finalDoses[k] || 0) + (df[k] || 0);
    }
    // Non-duty takes: stashLog medicine takes not matching a cure event.
    const cureKeys = new Set((f.cureEvents.medicine || []).map(e => e.day + '|' + e.holder));
    for (const t of (f.stashTakes || [])) {
      if (!cureKeys.has(t.day + '|' + t.vid)) leg.nonDutyTakes.push({ seed: s, ...t });
    }
    leg.seedRows.push({ seed: s, daysAlive: f.daysAlive, day0Doses: d0, finalDoses: df,
      removed, medCures: (f.cureEvents.medicine || []).length,
      abCures: (f.cureEvents.ability || []).length,
      abCuresCounter: (f.finalDutyCures || {}).ability || 0,
      medCuresCounter: (f.finalDutyCures || {}).medicine || 0 });
    leg.medCures.push(...(f.cureEvents.medicine || []).map(e => ({ seed: s, ...e })));
    leg.abCures.push(...(f.cureEvents.ability || []).map(e => ({ seed: s, ...e })));
  }
  // Classify every medicine cure against the live table.
  const table = loadTable();
  for (const e of leg.medCures) {
    const c = classify(e, table);
    e.classification = c.cls;
    e.classReason = c.reason;
    if (c.cls === 'table-violation') leg.tableViolations.push(e);
    if (c.cls === 'alien') leg.alienCures.push(e);
    if (c.cls === 'trembles') leg.tremblesCures.push(e);
    if (e.diseaseId === 'trichinosis') leg.trichCures.push(e);
    if (!e.diagnosed) leg.undiagnosedMedCures++;
    leg.byDisease[e.diseaseId] = (leg.byDisease[e.diseaseId] || 0) + 1;
    leg.byKind[e.kind] = (leg.byKind[e.kind] || 0) + 1;
    leg.byClass[c.cls] = (leg.byClass[c.cls] || 0) + 1;
  }
  // Dose balance: removed == medicine cures + non-duty takes (each
  // non-duty take removes qty doses; duty takes are the cures themselves).
  const nonDutyQty = leg.nonDutyTakes.reduce((a, t) => a + (t.qty || 0), 0);
  leg.nonDutyQty = nonDutyQty;
  leg.doseBalanceOk = leg.anomalies.length === 0 &&
    leg.doseRemoved === leg.medCures.length + nonDutyQty;
  // Counter cross-check: finalDutyCures counters must equal event counts.
  leg.counterMismatches = leg.seedRows.filter(r =>
    r.abCures !== r.abCuresCounter || r.medCures !== r.medCuresCounter);
  leg.medianSurvival = med(leg.daysAlive);
  leg.maxSurvival = Math.max(...leg.daysAlive);
  leg.starvationDeaths = (leg.deathRows || []).filter(d => /starvat/.test(d.cause || '')).length;
  leg.dutyHeldShare = leg.villageDays ? leg.dutyHeldDays / leg.villageDays : null;
  return leg;
}

function printLeg(tag, leg) {
  console.log(`=== sim-medchannel-seed-a ${tag} (leg ${leg.leg}) ===`);
  console.log(`WALL: national=${leg.national}/8 table=${leg.table} wins=${leg.win} waveReach=${JSON.stringify(leg.waveReach)} medianSurvival=${leg.medianSurvival}d max=${leg.maxSurvival}d`);
  console.log(`CURES: medicine=${leg.medCures.length} ability=${leg.abCures.length} (events) byDisease=${JSON.stringify(leg.byDisease)} byKind=${JSON.stringify(leg.byKind)} byClass=${JSON.stringify(leg.byClass)}`);
  console.log(`MEDICINE DETAIL: trichinosis=${leg.trichCures.length} alien=${leg.alienCures.length} trembles=${leg.tremblesCures.length} tableViolations=${leg.tableViolations.length} undiagnosed=${leg.undiagnosedMedCures} anomalies=${leg.anomalies.length} counterMismatches=${leg.counterMismatches.length} missingDays=${JSON.stringify(leg.gaps)} dupDays=${JSON.stringify(leg.dupDays)}`);
  console.log(`DOSES: day0=${JSON.stringify(leg.day0Doses)} final=${JSON.stringify(leg.finalDoses)} removed=${leg.doseRemoved} nonDutyTakes=${leg.nonDutyTakes.length} (qty ${leg.nonDutyQty}) balanceOk=${leg.doseBalanceOk}`);
  console.log(`DUTY: heldShare=${leg.dutyHeldShare == null ? 'n/a' : (leg.dutyHeldShare * 100).toFixed(1) + '%'} (${leg.dutyHeldDays}/${leg.villageDays} village-days) starvationDeaths=${leg.starvationDeaths} deathCauses=${JSON.stringify(leg.deathCauses)}`);
  console.log(`PER-SEED: ${leg.seedRows.map(r => `s${r.seed}: ${r.daysAlive}d med=${r.medCures} ab=${r.abCures} removed=${r.removed} final=${JSON.stringify(r.finalDoses)}`).join(' | ')}`);
  for (const l of leg.cureLines.slice(0, 5)) console.log(`SAY s${l.seed} d${l.day}: ${l.line}`);
}

function main() {
  const legDir = arg('leg', null);
  const legName = arg('legname', null);
  if (legDir) {
    if (!legName || !LEGNAMES[legName]) { console.error('USAGE: --leg <corpusDir> --legname before|seeded'); return 2; }
    printLeg('LEG ' + legDir, censusLeg(legDir, legName));
    return 0;
  }
  const beforeDir = arg('before', null);
  const afterDir = arg('after', null);
  if (!beforeDir || !afterDir) {
    console.error('USAGE: analyze-medchannel-seed-a.js --leg <dir> --legname <name> | --before <dir> --after <dir>');
    return 2;
  }
  const b = censusLeg(beforeDir, 'before');
  const a = censusLeg(afterDir, 'seeded');
  printLeg('BEFORE', b);
  printLeg('AFTER', a);
  console.log('=== GATES (prereg binding) ===');
  const g1count = a.medCures.length >= 5;
  const g1clean = a.alienCures.length === 0 && a.tremblesCures.length === 0 && a.tableViolations.length === 0;
  const g1dose = a.doseBalanceOk;
  const g1 = g1count && g1clean && g1dose;
  console.log(`G1 PRIMARY: medicineCures(seeded)=${a.medCures.length} (need >=5) -> ${g1count ? 'PASS' : 'FAIL'}; alien=${a.alienCures.length} trembles=${a.tremblesCures.length} tableViolations=${a.tableViolations.length} -> ${g1clean ? 'PASS' : 'FAIL'}; doseBalance removed=${a.doseRemoved} cures=${a.medCures.length} nonDutyQty=${a.nonDutyQty} anomalies=${a.anomalies.length} -> ${g1dose ? 'PASS' : 'FAIL'}; G1 ${g1 ? 'PASS' : 'FAIL'}`);
  console.log(`G1 CONTEXT: before-leg medicineCures=${b.medCures.length} (expect 0); abilityCures before=${b.abCures.length} seeded=${a.abCures.length}; trichinosis medicine cures=${a.trichCures.length} (expect 0 BY CONSTRUCTION, prereg); undiagnosed medicine cures=${a.undiagnosedMedCures}`);
  const g2a = a.medianSurvival >= 0.8 * b.medianSurvival;
  const g2b = a.starvationDeaths <= b.starvationDeaths + 2;
  console.log(`G2 GUARDRAILS: medianSurvival ${a.medianSurvival} vs 0.8x before ${Math.floor(0.8 * b.medianSurvival)} -> ${g2a ? 'PASS' : 'FAIL'}; starvation ${a.starvationDeaths} vs before+2 ${b.starvationDeaths + 2} -> ${g2b ? 'PASS' : 'FAIL'}; G2 ${g2a && g2b ? 'PASS' : 'FAIL'}`);
  console.log('G3 PANEL: judged separately from the balance-panel compare .md (see evidence file).');
  console.log('G4 PROOF: judged separately from scripts/test-medchannel-seed-a.js.');
  const go = g1 && g2a && g2b;
  console.log(`VERDICT: ${go ? 'GO' : 'NO-GO'}`);
  return go ? 0 : 1;
}

if (require.main === module) process.exit(main());
module.exports = { classify, censusLeg, SEEDS };
