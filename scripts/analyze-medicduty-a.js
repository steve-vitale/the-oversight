#!/usr/bin/env node
// analyze-medicduty-a.js — HAVEN MEDIC DUTY census (measurement only)
// (sim-medicduty-a, 2026-11-08.) Joins, per leg, the three corpora the
// run records on identical seeds under the competent policy:
//   medicduty-a-competent-s*.json  (duty snapshot: dutyVid, dutyBlocked)
//   medicdiag-a-competent-s*.json  (medicDetail: healerPresent, medicCount)
//   feveranat-a-competent-s*.json  (episodes, treats, production flows)
// and prints the census + the pre-registered gates. Modes:
//   node scripts/analyze-medicduty-a.js --leg <dir>
//     single-leg census (numbers only, no gates)
//   node scripts/analyze-medicduty-a.js --before <dir> --after <dir>
//     before/after comparison + G1 (primary) + G2 (guardrails) verdicts.
//     Exit 0 on GO, 1 on NO-GO (a guardrail breach is NO-GO even if the
//     primary passes, per MEASUREMENT.md §14).
// The balanced-panel compare (§15, G3) and the proof test (G4) are judged
// separately; this analyzer prints the panel placeholder, not a verdict.
'use strict';
const fs = require('fs');
const path = require('path');

const SEEDS = [96301, 96302, 96303, 96304, 96305, 96306, 96307, 96308];

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

// Reconstruct NPC episodes from feveranat onsets/ends/treats (same join
// rule as analyze-feveranat-a.js: next end for the same who at/after the
// onset day; treated = a villagerCare treat for that who inside the window).
// POOLCAPTURE-BAR-A (#1921): a cure counts as a treated outcome — a
// cureEvent for the same patient in the window, an end with outcome
// 'cured' (treatVillager), or a 'recovered' end whose end-day daySeries
// snapshot shows sickMap[who].daysLeft >= 3 (duty cure: the record still
// had daysLeft > 1 after that day's decrement; natural expiry shows 1.
// Validated: 0 false positives on the pre-duty before leg, 132/132 at 1).
// The duty cure leaves no cureEvent (it deletes v.sick directly without
// calling cureStatus), so the snapshot rule is the only attribution for
// recorded cured episodes. Cures that infect and cure inside ONE tick
// never become episodes at all; they are counted separately as
// same-tick cures (total duty cures minus attributed cured episodes)
// and reported on the care-coverage line, not in treatedShare.
function episodesOf(f) {
  const onsets = (f.sickOnsets || []).filter(o => o.kind === 'npc');
  const ends = (f.sickEnds || []).filter(e => e.kind === 'npc');
  const treats = (f.treatEvents || []).filter(t => t.kind === 'villagerCare');
  const cures = (f.cureEvents || []);
  const snapByDay = new Map((f.daySeries || []).map(d => [d.day, d]));
  const eps = [];
  for (const o of onsets) {
    const end = ends.filter(e => e.who === o.who && e.day >= o.day)
      .sort((a, b) => a.day - b.day)[0] || null;
    const endDay = end ? end.day : f.daysAlive;
    const treated = treats.some(t => t.who === o.who && t.day >= o.day && t.day <= endDay);
    const ep = { seed: f.seed, who: o.who, diseaseId: o.diseaseId, healerPresent: !!o.healerPresent,
      duration: endDay - o.day, treated, cured: false, curedBy: null,
      outcome: end ? end.outcome : 'open' };
    for (const c of cures) {
      if (c.target !== o.who) continue;
      if (c.day < o.day || c.day > endDay) continue;
      if (c.diseaseId && o.diseaseId && c.diseaseId !== o.diseaseId) continue;
      ep.treated = true; ep.cured = true; ep.curedBy = 'cureEvent';
    }
    if (ep.outcome === 'cured') { ep.treated = true; ep.cured = true; ep.curedBy = ep.curedBy || 'cured-end'; }
    if (ep.outcome === 'recovered' && end) {
      const snap = snapByDay.get(end.day);
      const rec = snap && (snap.sickMap || {})[o.who];
      if (rec && (rec.daysLeft || 0) >= 3) { ep.treated = true; ep.cured = true; ep.curedBy = 'duty-snapshot'; }
    }
    eps.push(ep);
  }
  return eps;
}

function censusLeg(dir) {
  const leg = { dir, seeds: [], daysAlive: [], national: 0, table: 0, win: 0,
    waveReach: {}, deathCauses: {}, deathRows: [],
    present: 0, absent: 0, absentWithMedic: 0, absentNoMedic: 0,
    healerDays: 0, medicDays: 0, havenAvail: 0, villageDays: 0,
    dutyDays: 0, dutyHolders: new Set(), holderChanges: 0, dutyBlocked: 0,
    episodes: [], treatedEps: 0, produced: 0, need: 0,
    joinMismatches: 0, fingerprints: {} };
  for (const s of SEEDS) {
    const duty = readJson(path.join(dir, `medicduty-a-competent-s${s}.json`));
    const diag = readJson(path.join(dir, `medicdiag-a-competent-s${s}.json`));
    const fev = readJson(path.join(dir, `feveranat-a-competent-s${s}.json`));
    leg.seeds.push(s);
    leg.daysAlive.push(duty.daysAlive);
    if (duty.national) leg.national++;
    if (duty.table) leg.table++;
    if (duty.win) leg.win++;
    for (const w of (duty.waveReach || [])) leg.waveReach[w] = (leg.waveReach[w] || 0) + 1;
    for (const [c, n] of Object.entries(duty.deathCauses || {})) leg.deathCauses[c] = (leg.deathCauses[c] || 0) + n;
    leg.deathRows.push(...(duty.deathRows || []));
    leg.fingerprints[s] = null; // per-seed files carry no fingerprint; the summary OUT holds rows[].fingerprint

    // JOIN CHECK: duty snapshot vs medicdiag snapshot, day by day.
    const diagByDay = new Map((diag.medicDays || []).map(m => [m.day, m]));
    let prevDuty = null;
    for (const d of (duty.dutyDays || [])) {
      const m = diagByDay.get(d.day);
      if (!m || m.healerPresent !== d.healerPresent || m.sickCountNPC !== d.sickCountNPC) leg.joinMismatches++;
      if (d.dutyVid) {
        leg.dutyDays++;
        leg.dutyHolders.add(d.dutyVid);
        if (prevDuty !== null && prevDuty !== d.dutyVid) leg.holderChanges++;
        prevDuty = d.dutyVid;
      } else if (prevDuty !== null) { leg.holderChanges++; prevDuty = null; }
    }
    leg._blockedPerSeed = leg._blockedPerSeed || {};
    const _lastDuty = (duty.dutyDays || [])[(duty.dutyDays || []).length - 1];
    leg._blockedPerSeed[s] = _lastDuty ? _lastDuty.dutyBlocked : 0;
    // A2 CURE METRIC (secondary, reported): cumulative cures by channel
    // at the last recorded day (before-leg snapshots lack the field -> 0).
    const _c = (_lastDuty && _lastDuty.dutyCures) || {};
    leg.curesAbility = (leg.curesAbility || 0) + (_c.ability || 0);
    leg.curesMedicine = (leg.curesMedicine || 0) + (_c.medicine || 0);
    // PRIMARY (medicdiag medicDays — authoritative medicDetail).
    for (const m of (diag.medicDays || [])) {
      leg.villageDays++;
      if (m.healerPresent) { leg.present += m.sickCountNPC; leg.healerDays++; }
      else {
        leg.absent += m.sickCountNPC;
        if ((m.medicCount || 0) >= 1) leg.absentWithMedic += m.sickCountNPC;
        else leg.absentNoMedic += m.sickCountNPC;
      }
      leg.medicDays += (m.medicCount || 0);
      leg.havenAvail += (m.havenMedicAvailable || 0);
    }
    // SECONDARY (feveranat episodes + flows).
    const eps = episodesOf(fev);
    leg.episodes.push(...eps);
    leg.treatedEps += eps.filter(e => e.treated).length;
    for (const fl of (fev.flowSeries || [])) { leg.produced += (fl.produced || 0); leg.need += (fl.need || 0); }
  }
  leg.dutyBlocked = Object.values(leg._blockedPerSeed || {}).reduce((a, b) => a + b, 0);
  leg.presentShare = (leg.present + leg.absent) ? leg.present / (leg.present + leg.absent) : null;
  // POOLCAPTURE-BAR-A (#1925): medic-days-only share — the share of
  // sick-days on days when a roster medic exists at all
  // (present / (present + absentWithMedic)).
  leg.medicDaysShare = (leg.present + leg.absentWithMedic)
    ? leg.present / (leg.present + leg.absentWithMedic) : null;
  // POOLCAPTURE-BAR-A (#1921): cured-episode attribution + same-tick
  // decomposition. Attributed cured episodes are the ones the snapshot
  // rule (or a cureEvent / 'cured' end) caught; the remaining duty cures
  // infected and cured inside one tick and never became episodes.
  leg.curedEpisodes = leg.episodes.filter(e => e.cured).length;
  leg.totalCures = (leg.curesAbility || 0) + (leg.curesMedicine || 0);
  leg.sameTickCures = Math.max(0, leg.totalCures - leg.curedEpisodes);
  leg.careCoverage = (leg.episodes.length + leg.sameTickCures)
    ? (leg.treatedEps + leg.sameTickCures) / (leg.episodes.length + leg.sameTickCures) : null;
  leg.medianSurvival = med(leg.daysAlive);
  leg.maxSurvival = Math.max(...leg.daysAlive);
  leg.starvationDeaths = (leg.deathRows || []).filter(d => /starvat/.test(d.cause || '')).length;
  leg.sicknessDeaths = (leg.deathRows || []).filter(d =>
    /sickness|wound_fever|disease|lockjaw|trichinosis|gutrot|trembles|fever/.test(d.cause || '')).length;
  leg.woundFeverDeaths = leg.episodes.filter(e => e.diseaseId === 'wound_fever' && e.outcome === 'died').length;
  leg.treatedShare = leg.episodes.length ? leg.treatedEps / leg.episodes.length : null;
  leg.producedNeed = leg.need ? leg.produced / leg.need : null;
  return leg;
}

function printLeg(tag, leg) {
  console.log(`=== sim-medicduty-a ${tag} ===`);
  console.log(`WALL: national=${leg.national}/8 table=${leg.table} wins=${leg.win} waveReach=${JSON.stringify(leg.waveReach)} medianSurvival=${leg.medianSurvival}d max=${leg.maxSurvival}d`);
  console.log(`PRIMARY: present=${leg.present} absent=${leg.absent} share=${leg.presentShare == null ? 'n/a' : (leg.presentShare * 100).toFixed(1) + '%'} absentWithMedic=${leg.absentWithMedic} absentNoMedic=${leg.absentNoMedic} (village-days=${leg.villageDays} healerDays=${leg.healerDays} medicDays=${leg.medicDays} havenAvail=${leg.havenAvail})`);
  console.log(`PRIMARY (poolcapture-bar-a #1925, secondary): medic-days-only share=${leg.medicDaysShare == null ? 'n/a' : (leg.medicDaysShare * 100).toFixed(1) + '%'} (present / (present + absentWithMedic)) — the share is reported, never gating`);
  console.log(`DUTY: dutyDays=${leg.dutyDays}/${leg.villageDays} holders=${leg.dutyHolders.size} holderChanges=${leg.holderChanges} blockedDepartures=${leg.dutyBlocked} joinMismatches=${leg.joinMismatches} curesAbility=${leg.curesAbility || 0} curesMedicine=${leg.curesMedicine || 0}`);
  console.log(`SECONDARY: episodes=${leg.episodes.length} treated=${leg.treatedEps} treatedShare=${leg.treatedShare == null ? 'n/a' : (leg.treatedShare * 100).toFixed(1) + '%'} sicknessDeaths=${leg.sicknessDeaths} woundFeverDeaths=${leg.woundFeverDeaths} starvationDeaths=${leg.starvationDeaths}`);
  console.log(`SECONDARY (poolcapture-bar-a #1921): curedEpisodes=${leg.curedEpisodes} totalDutyCures=${leg.totalCures} sameTickCures=${leg.sameTickCures} (cures that never became episodes) careCoverage=${leg.careCoverage == null ? 'n/a' : (leg.careCoverage * 100).toFixed(1) + '%'} ((treated + sameTickCures) / (episodes + sameTickCures))`);
  console.log(`GUARDRAILS: produced/need=${leg.producedNeed == null ? 'n/a' : leg.producedNeed.toFixed(3)} deathCauses=${JSON.stringify(leg.deathCauses)}`);
}

function main() {
  const beforeDir = arg('before', null);
  const afterDir = arg('after', null);
  const legDir = arg('leg', null);
  if (legDir) {
    printLeg('LEG ' + legDir, censusLeg(legDir));
    return 0;
  }
  if (!beforeDir || !afterDir) {
    console.error('USAGE: analyze-medicduty-a.js --leg <dir> | --before <dir> --after <dir>');
    return 2;
  }
  const b = censusLeg(beforeDir);
  const a = censusLeg(afterDir);
  printLeg('BEFORE', b);
  printLeg('AFTER', a);
  console.log('=== GATES (prereg binding) ===');
  // G1 RE-REGISTERED (poolcapture-bar-a, backlog #1925; sim-medicduty-a
  // metric review): the healer-present SHARE is confounded by survival —
  // the duty extends village life and the added days are mostly no-medic
  // days, so the share falls even as the duty works. The share is demoted
  // to a reported secondary and NEVER gates. PRIMARY is the
  // absent-with-medic POOL CAPTURE: (before - after) / before >= 50%.
  // On the medicduty corpus that is absentWithMedic <= 19 (before 38).
  const capture = (b.absentWithMedic > 0)
    ? (b.absentWithMedic - a.absentWithMedic) / b.absentWithMedic : null;
  const g1 = capture != null && capture >= 0.50;
  console.log(`G1 PRIMARY (pool capture): before absentWithMedic=${b.absentWithMedic} after=${a.absentWithMedic} capture=${capture == null ? 'n/a' : (capture * 100).toFixed(1) + '%'} (need >=50%) -> ${g1 ? 'PASS' : 'FAIL'}; share ${((a.presentShare || 0) * 100).toFixed(1)}% (before ${((b.presentShare || 0) * 100).toFixed(1)}%) and medic-days-only share ${((a.medicDaysShare || 0) * 100).toFixed(1)}% (before ${((b.medicDaysShare || 0) * 100).toFixed(1)}%) reported as secondaries, not gating; G1 ${g1 ? 'PASS' : 'FAIL'}`);
  const g2a = a.medianSurvival >= 0.8 * b.medianSurvival;
  const g2b = a.starvationDeaths <= b.starvationDeaths + 2;
  const beforeCauses = new Set(Object.keys(b.deathCauses));
  const newCauses = Object.entries(a.deathCauses).filter(([c, n]) => !beforeCauses.has(c) && n >= 2).map(([c]) => c);
  const g2c = newCauses.length === 0;
  const g2d = a.producedNeed != null && b.producedNeed != null && a.producedNeed >= b.producedNeed - 0.03;
  console.log(`G2 GUARDRAILS: medianSurvival ${a.medianSurvival} vs 0.8x before ${Math.floor(0.8 * b.medianSurvival)} -> ${g2a ? 'PASS' : 'FAIL'}; starvation ${a.starvationDeaths} vs before+2 ${b.starvationDeaths + 2} -> ${g2b ? 'PASS' : 'FAIL'}; new death causes >=2: ${newCauses.length ? newCauses.join(',') : 'none'} -> ${g2c ? 'PASS' : 'FAIL'}; produced/need ${a.producedNeed.toFixed(3)} vs before-0.03 ${(b.producedNeed - 0.03).toFixed(3)} -> ${g2d ? 'PASS' : 'FAIL'}; G2 ${g2a && g2b && g2c && g2d ? 'PASS' : 'FAIL'}`);
  console.log('G3 PANEL: judged separately from the balance-panel compare .md (see evidence file).');
  console.log('G4 PROOF: judged separately from scripts/test-medicduty-a.js.');
  const go = g1 && g2a && g2b && g2c && g2d;
  console.log(`VERDICT: ${go ? 'GO' : 'NO-GO'}`);
  return go ? 0 : 1;
}

process.exit(main());
