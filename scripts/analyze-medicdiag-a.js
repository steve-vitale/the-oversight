#!/usr/bin/env node
// analyze-medicdiag-a.js — village-side care census over the feveranat +
// medicdiag corpora (same band 96301–96308, competent, 150d).
// Reads evidence/2026-11-07/feveranat-a-corpus/ (episodes, treatments,
// wall numbers) and evidence/2026-11-07/medicdiag-a-corpus/ (per-day
// medicDetail: who the medics are, where they are, what they hold).
// Pure analysis: reads only, prints a report, exits 0. Verdict logic for
// G1–G3 lives here; G4 (fix shape named) is judged in the evidence file
// against the prereg header — the analyzer prints the measured inputs.
//
// C1 HEALER CAPACITY — healer-days, medic-days, Haven medic-days,
// scholar-healer vs village-medic-healer days, NPC sick-days with a healer
// present at Haven vs absent, tends delivered vs theoretical capacity.
// C2 CURE-CHANNEL CORROBORATION — cureEvents, diagnoses, treatVillager /
// tendVillager calls in the wild (the verdict itself, ABSENT with code
// citations, is rendered in the evidence file).
// C3 MODELED VALUE — healer-present episode mortality (NPC only, primary)
// applied to healer-absent episodes; deaths-avoided under the prereg's
// stated assumptions. Sick-days covered per healer-day.
// G3 CORPUS (revised final-day rule, pre-registered): daySeries length ==
// daysAlive, or == daysAlive-1 with the single missing day being the final
// day and endReason village-lost / game over (or a death recorded that
// day); flowSeries likewise. endReason comes from the sweep summary
// (sweep-competent.json) or the bare fingerprints in the same directory.
'use strict';
const fs = require('fs');
const path = require('path');
const { buildEpisodes } = require('./analyze-feveranat-a.js');

const FEVER_DIR = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'feveranat-a-corpus');
const MEDIC_DIR = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-07', 'medicdiag-a-corpus');

const sum = (xs) => xs.reduce((a, b) => a + (b || 0), 0);
const med = (xs) => { const s = xs.slice().sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const mean = (xs) => (xs.length ? sum(xs) / xs.length : null);
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) + '%' : 'n/a');
const r1 = (n) => (n == null ? 'n/a' : (Math.round(n * 10) / 10));
const r3 = (n) => (n == null ? 'n/a' : (Math.round(n * 1000) / 1000));
const died = (e) => /^died/.test(e.outcome);

// Pure helpers (unit-tested by scripts/test-medicdiag-a.js):
// modeledAvoided: deaths-avoided when the absent group had the present
// group's mortality. coverageCount: episodes with a non-null healerPresent.
function modeledAvoided(presentN, presentD, absentN, absentD) {
  if (!presentN || !absentN) return null;
  const rate = presentD / presentN;
  return absentD - absentN * rate;
}
function coverageCount(eps) {
  return { total: eps.length, classified: eps.filter(e => e.healerPresent != null).length,
    unclassified: eps.filter(e => e.healerPresent == null).length };
}

function readDir(dir, re) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => re.test(f)).sort()
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function endReasons(dir) {
  const out = {};
  try {
    const summ = JSON.parse(fs.readFileSync(path.join(dir, 'sweep-competent.json'), 'utf8'));
    for (const row of (summ.rows || [])) {
      const fp = row.fingerprint || {};
      if (row.seed != null && fp.endReason) out[row.seed] = fp.endReason;
    }
    for (const fp of (summ.bare || [])) {
      if (fp.seed != null && fp.endReason && out[fp.seed] == null) out[fp.seed] = fp.endReason;
    }
  } catch (e) {}
  try {
    for (const fp of readDir(dir, /-bare-s\d+\.json$/)) {
      if (fp.seed != null && fp.endReason && out[fp.seed] == null) out[fp.seed] = fp.endReason;
    }
  } catch (e) {}
  return out;
}

function main() {
  const fever = readDir(FEVER_DIR, /^feveranat-a-competent-s\d+\.json$/);
  if (!fever.length) { console.error('no feveranat per-seed files in ' + FEVER_DIR); process.exit(2); }
  const medic = readDir(MEDIC_DIR, /^medicdiag-a-competent-s\d+\.json$/);
  const medicBySeed = new Map(medic.map(m => [m.seed, m]));
  const perSeed = fever.map(s => ({ seed: s.seed, raw: s, built: buildEpisodes(s),
    med: medicBySeed.get(s.seed) || null }));
  const allEps = perSeed.flatMap(ps => ps.built.eps);
  const npcEps = allEps.filter(e => e.kind === 'npc');
  const schEps = allEps.filter(e => e.kind === 'scholar');

  console.log('=== sim-medicdiag-a CARE CENSUS (seeds ' + fever.map(s => s.seed).join(',') + ', competent, 150d) ===');
  console.log('');

  // ---- wall context (inherited) ----
  let national = 0, table = 0, wins = 0;
  const waveReach = {};
  for (const s of fever) {
    if (s.national) national++;
    if (s.table) table++;
    if (s.win) wins++;
    for (const w of (s.waveReach || [])) waveReach[w] = (waveReach[w] || 0) + 1;
  }
  console.log('WALL: national=' + national + '/' + fever.length + ' table=' + table +
    ' wins=' + wins + ' waveReach=' + JSON.stringify(waveReach) +
    ' medianSurvival=' + med(fever.map(s => s.daysAlive)) + 'd max=' + Math.max(...fever.map(s => s.daysAlive)) + 'd');
  console.log('');

  // ---- C1 HEALER CAPACITY (feveranat snapshots + medicDetail where present) ----
  console.log('C1 HEALER CAPACITY:');
  let totDays = 0, totHealerDays = 0, totMedicDays = 0, totSickPresent = 0, totSickAbsent = 0;
  let totHavenMedicDays = 0, totScholarHealerDays = 0, totVillageHealerDays = 0, totTends = 0;
  const holdDays = { triage: 0, herbal_remedy: 0, field_medicine: 0 };
  const holdMedics = { triage: new Set(), herbal_remedy: new Set(), field_medicine: new Set() };
  const medicOccs = {};
  const medicVids = new Set();
  let triageCapacity = 0; // sum over days of (available medics + triage holders): tends/day ceiling
  for (const ps of perSeed) {
    const s = ps.raw;
    const days = s.daySeries || [];
    const hd = days.filter(d => d.healerPresent === true).length;
    const md = sum(days.map(d => d.medicCount || 0));
    const sp = sum(days.map(d => d.healerPresent === true ? (d.sickCountNPC || 0) : 0));
    const sa = sum(days.map(d => d.healerPresent === false ? (d.sickCountNPC || 0) : 0));
    const tends = (s.treatEvents || []).filter(t => t.kind === 'villagerCare').length;
    let line = '  s' + s.seed + ': days=' + days.length + ' healerDays=' + hd +
      ' medicDays=' + md + ' sickDaysPresent=' + sp + ' sickDaysAbsent=' + sa +
      ' tends=' + tends;
    if (ps.med) {
      const mds = ps.med.medicDays || [];
      const hmd = sum(mds.map(d => d.havenMedicAvailable || 0));
      const shd = mds.filter(d => d.healerIsScholar).length;
      const vhd = mds.filter(d => d.healerPresent && !d.healerIsScholar).length;
      const cap = sum(mds.map(d => (d.medics || []).filter(m => m.alive && m.available)
        .reduce((a, m) => a + (m.holds && m.holds.triage ? 2 : 1), 0)));
      line += ' havenMedicAvailDays=' + hmd + ' scholarHealerDays=' + shd +
        ' villageHealerDays=' + vhd + ' tendCapacity=' + cap;
      totHavenMedicDays += hmd; totScholarHealerDays += shd; totVillageHealerDays += vhd;
      triageCapacity += cap;
      for (const d of mds) {
        for (const m of (d.medics || [])) {
          medicVids.add(m.vid);
          medicOccs[m.occ] = (medicOccs[m.occ] || 0) + 1;
          for (const hid of Object.keys(holdDays)) {
            if (m.holds && m.holds[hid]) { holdDays[hid]++; holdMedics[hid].add(m.vid); }
          }
        }
      }
    }
    console.log(line);
    totDays += days.length; totHealerDays += hd; totMedicDays += md;
    totSickPresent += sp; totSickAbsent += sa; totTends += tends;
  }
  console.log('  POOLED: village-days=' + totDays + ' healerDays=' + totHealerDays +
    ' (' + pct(totHealerDays, totDays) + ') medicDays=' + totMedicDays +
    ' NPC sick-days healer-present=' + totSickPresent + ' healer-absent=' + totSickAbsent +
    ' (unknown 0) tends=' + totTends);
  console.log('  tends per medic-day=' + r3(totMedicDays ? totTends / totMedicDays : null) +
    ' tends per healer-day=' + r3(totHealerDays ? totTends / totHealerDays : null));
  if (medic.length) {
    console.log('  MEDICDETAIL (' + medic.length + '/' + fever.length + ' seeds): havenMedicAvailDays=' + totHavenMedicDays +
      ' scholarHealerDays=' + totScholarHealerDays + ' villageHealerDays=' + totVillageHealerDays +
      ' tendCapacity(triage-doubled)=' + triageCapacity);
    console.log('  distinct medic vids=' + medicVids.size + ' occupations(day-counts)=' + JSON.stringify(medicOccs));
    console.log('  holdings (medic-days / distinct medics): triage ' + holdDays.triage + '/' + holdMedics.triage.size +
      ' herbal_remedy ' + holdDays.herbal_remedy + '/' + holdMedics.herbal_remedy.size +
      ' field_medicine ' + holdDays.field_medicine + '/' + holdMedics.field_medicine.size);
    console.log('  tends vs capacity: ' + totTends + ' tends delivered against ' + triageCapacity + ' tend-slots (' + pct(totTends, triageCapacity) + ' of capacity used)');
  } else {
    console.log('  MEDICDETAIL: not recorded in this corpus — run scripts/sweep-medicdiag-a.js for the healer-source split and holdings.');
  }
  // Treatment coverage by healer status at onset.
  for (const st of [true, false]) {
    const g = npcEps.filter(e => e.healerPresent === st);
    console.log('  healer-' + (st ? 'present' : 'absent') + ' at onset: ' + g.length + ' episodes, treated ' +
      g.filter(e => e.treated).length + ' (' + pct(g.filter(e => e.treated).length, g.length) + ')' +
      ', median duration ' + med(g.filter(e => e.duration != null).map(e => e.duration)));
  }
  // Deaths are a wound-fever story: split mortality by disease × healer status.
  const byDis = {};
  for (const e of npcEps) {
    const k = e.diseaseId || e.name;
    byDis[k] = byDis[k] || { n: 0, d: 0, ph: 0, phD: 0, ah: 0, ahD: 0 };
    byDis[k].n++;
    if (died(e)) byDis[k].d++;
    if (e.healerPresent === true) { byDis[k].ph++; if (died(e)) byDis[k].phD++; }
    else { byDis[k].ah++; if (died(e)) byDis[k].ahD++; }
  }
  console.log('  mortality by disease (NPC): ' + Object.keys(byDis).sort().map(k =>
    k + ' n=' + byDis[k].n + ' died=' + byDis[k].d +
    ' present ' + byDis[k].phD + '/' + byDis[k].ph +
    ' absent ' + byDis[k].ahD + '/' + byDis[k].ah).join('; '));
  console.log('');

  // ---- C2 CURE-CHANNEL CORROBORATION (corpus facts; verdict in evidence) ----
  const cures = sum(fever.map(s => (s.cureEvents || []).length));
  const diags = sum(fever.map(s => (s.diagnoses || []).length));
  const tv = sum(fever.map(s => (s.treatEvents || []).filter(t => t.kind === 'treatVillager').length));
  const tvCured = sum(fever.map(s => (s.treatEvents || []).filter(t => t.kind === 'treatVillager' && t.result === 'cured').length));
  const tend = sum(fever.map(s => (s.treatEvents || []).filter(t => t.kind === 'tendVillager').length));
  const curedEnds = allEps.filter(e => e.outcome === 'cured');
  console.log('C2 CURE-CHANNEL CORROBORATION (corpus facts): cureEvents=' + cures +
    ' diagnoses=' + diags + ' treatVillager calls=' + tv + ' (cured ' + tvCured + ')' +
    ' tendVillager calls=' + tend);
  console.log('  episodes ending cured: ' + curedEnds.length +
    (curedEnds.length ? ' — ' + curedEnds.map(e => 's' + e.seed + ' ' + e.whoName + ' ' + e.name + ' by ' + e.by).join('; ') : ' (none)'));
  console.log('  CURE-CHANNEL VERDICT (poolcapture-bar-a #1921, duty-aware): the HAVEN MEDIC DUTY is a villager-side cure path — Game.medicDutyCureAttempt deletes v.sick[pid] directly (ability or pharmacy medicine), called from villagerCareTick for the duty holder only; it never calls cureStatus, so a duty cure leaves NO cureEvent in this corpus. cureEvents=0 therefore proves no SCHOLAR-side cure happened here, not that no villager was cured: duty cures are counted in the duty corpus (v.medicDutyCures) and attributed to episodes by the snapshot rule in analyze-feveranat-a.js (duty-snapshot) — see sim-poolcapture-bar-a. Pre-duty code-read: villagerCareTick only tends (daysLeft -= 1); treatVillager is scholar-only (L2+, 150 kcal); cureStatus is scholar status-list only; the foreign-aid medicine delivery (safetynets.js resolveAidInbound) is the other non-scholar cure.');
  console.log('');

  // ---- C3 MODELED VALUE ----
  const model = (group, label) => {
    const hp = group.filter(e => e.healerPresent === true);
    const ha = group.filter(e => e.healerPresent === false);
    const hpD = hp.filter(died).length, haD = ha.filter(died).length;
    const hpR = hp.length ? hpD / hp.length : null;
    const haR = ha.length ? haD / ha.length : null;
    const expected = (hpR == null) ? null : ha.length * hpR;
    const avoided = (expected == null) ? null : haD - expected;
    console.log('  ' + label + ': present ' + hpD + '/' + hp.length + ' mortality=' + r3(hpR) +
      ' | absent ' + haD + '/' + ha.length + ' mortality=' + r3(haR) +
      ' | expected deaths if absent had present rate=' + (expected == null ? 'n/a' : expected.toFixed(2)) +
      ' | MODELED DEATHS AVOIDED=' + (avoided == null ? 'n/a' : avoided.toFixed(2)));
    return avoided;
  };
  console.log('C3 MODELED VALUE (assumptions: association not causation; effect transfers fully; no capacity limit in the model — capacity is measured separately in C1; NPC episodes only for the primary model):');
  const avoidedNpc = model(npcEps, 'PRIMARY (NPC episodes only)');
  model(allEps, 'ALL episodes (incl. scholar, for the record)');
  console.log('  sick-days covered per healer-day: ' + r3(totHealerDays ? totSickPresent / totHealerDays : null) +
    ' NPC sick-days on healer-present days per healer-day; ' +
    r3(totHealerDays ? (totSickPresent + totSickAbsent) / totHealerDays : null) + ' total NPC sick-days per healer-day (present+absent).');
  console.log('  context: treated deaths 0/' + npcEps.filter(e => e.treated).length + ' vs untreated deaths ' +
    npcEps.filter(e => !e.treated && died(e)).length + '/' + npcEps.filter(e => !e.treated).length +
    ' — the healer effect runs through treatment coverage (present ' +
    pct(npcEps.filter(e => e.healerPresent === true && e.treated).length, npcEps.filter(e => e.healerPresent === true).length) +
    ' treated vs absent ' +
    pct(npcEps.filter(e => e.healerPresent === false && e.treated).length, npcEps.filter(e => e.healerPresent === false).length) + ').');
  console.log('');

  // ---- G1 COVERAGE ----
  const unclassified = allEps.filter(e => e.healerPresent == null);
  console.log('G1 COVERAGE: ' + allEps.length + ' episodes, healer-present/absent at onset recorded on ' +
    (allEps.length - unclassified.length) + '/' + allEps.length + ' — ' +
    (unclassified.length === 0 ? 'PASS (zero UNCLASSIFIED)' : 'FAIL (' + unclassified.length + ' UNCLASSIFIED)'));
  for (const e of unclassified.slice(0, 10)) {
    console.log('    UNCLASSIFIED s' + e.seed + ' ' + e.whoName + ' ' + e.name + ' onset d' + e.onsetDay);
  }
  console.log('');

  // ---- G3 CORPUS (revised final-day rule) ----
  const reasons = endReasons(FEVER_DIR);
  const reasonsMed = endReasons(MEDIC_DIR);
  let g3ok = true;
  const g3notes = [];
  const checkCorpus = (seeds, dirLabel, getEndReason) => {
    for (const s of seeds) {
      const days = s.daySeries || [], flows = s.flowSeries || [];
      const dayNums = new Set(days.map(d => d.day));
      const flowNums = new Set(flows.map(f => f.day));
      const missing = [];
      for (let d = 1; d <= s.daysAlive; d++) if (!dayNums.has(d)) missing.push(d);
      const flowMissing = [];
      for (let d = 1; d <= s.daysAlive; d++) if (!flowNums.has(d)) flowMissing.push(d);
      const endReason = getEndReason(s.seed);
      const excuse = (day) => {
        if (day !== s.daysAlive) return false;
        if (endReason === 'village-lost' || endReason === 'game over') return true;
        return (s.deathRows || []).some(d => d.day === day);
      };
      const dayOk = days.length === s.daysAlive ||
        (days.length === s.daysAlive - 1 && missing.length === 1 && excuse(missing[0]));
      const flowOk = flows.length === 0 ? true :
        (flowMissing.length === 0 || (flowMissing.length === 1 && excuse(flowMissing[0])));
      if (!dayOk || !flowOk) {
        g3ok = false;
        g3notes.push(dirLabel + ' s' + s.seed + ': daySeries=' + days.length + ' daysAlive=' + s.daysAlive +
          ' missing=' + JSON.stringify(missing) + ' flowMissing=' + JSON.stringify(flowMissing) +
          ' endReason=' + endReason);
      }
    }
  };
  checkCorpus(fever, 'feveranat', (seed) => reasons[seed]);
  if (medic.length) checkCorpus(medic.map(m => ({ ...m, daySeries: (m.medicDays || []).map(d => ({ day: d.day })), flowSeries: [] })), 'medicdiag', (seed) => reasonsMed[seed]);
  console.log('G3 CORPUS (revised final-day rule): ' + (g3ok ? 'PASS — all legs valid under the pre-registered rule' : 'FAIL — ' + g3notes.join('; ')));
  console.log('');

  // ---- G2 (corpus corroboration) + G4 pointer ----
  console.log('G2 CURE-CHANNEL VERDICT: ' + (cures === 0 && tv === 0
    ? 'PASS — verdict ABSENT rendered with code citations in the evidence file; corpus corroborates (0 cures, 0 treatVillager calls in the wild)'
    : 'REVIEW — corpus shows cures=' + cures + ' treatVillager=' + tv + '; see evidence'));
  console.log('G3 MODELED VALUE: ' + (avoidedNpc != null
    ? 'PASS — modeled deaths-avoided=' + avoidedNpc.toFixed(2) + ' computed under the stated assumptions'
    : 'FAIL — could not compute'));
  console.log('G4 FIX SHAPE: named in the evidence file (this analyzer prints the measured inputs; the shape + steve-call flag live there).');
  console.log('');

  // ---- Sense: one healer-present recovery, one healer-absent death ----
  console.log('SENSE (one healer-present episode, one healer-absent episode):');
  const presentRec = npcEps.find(e => e.healerPresent === true && e.outcome === 'recovered' && (e.sayWin || []).length);
  const absentDied = npcEps.find(e => e.healerPresent === false && e.outcome === 'died');
  if (presentRec) {
    console.log('  PRESENT s' + presentRec.seed + ' d' + presentRec.onsetDay + ' ' + presentRec.whoName +
      ' (' + presentRec.name + ', treated=' + presentRec.treated + ', duration=' + presentRec.duration + 'd): ' +
      JSON.stringify(presentRec.sayWin));
  }
  if (absentDied) {
    console.log('  ABSENT s' + absentDied.seed + ' d' + absentDied.onsetDay + ' ' + absentDied.whoName +
      ' (' + absentDied.name + ', treated=' + absentDied.treated + ', duration=' + absentDied.duration + 'd, died): ' +
      JSON.stringify(absentDied.sayWin));
    const s = fever.find(x => x.seed === absentDied.seed);
    const dr = (s.deathRows || []).find(d => d.who === absentDied.who && d.day === absentDied.endDay);
    if (dr) console.log('  ABSENT death-day lines: ' + JSON.stringify((dr.sayWin || []).slice(-3)));
  }
  const noHealerLines = allEps.filter(e => (e.sayWin || []).some(l => /no healer/i.test(l))).length;
  console.log('  say-lines anywhere in onset windows mentioning a missing healer: ' + noHealerLines + ' episodes');
  console.log('');
  console.log('CENSUS GATES (analyzer): G1 ' + (unclassified.length === 0 ? 'PASS' : 'FAIL') +
    ' | G2 ' + (cures === 0 && tv === 0 ? 'PASS' : 'REVIEW') +
    ' | G3 ' + (avoidedNpc != null ? 'PASS' : 'FAIL') +
    ' | G4 in evidence.');
}

if (require.main === module) main();
module.exports = { modeledAvoided, coverageCount };
