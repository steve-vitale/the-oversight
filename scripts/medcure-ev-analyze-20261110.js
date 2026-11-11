#!/usr/bin/env node
// medcure-ev-analyze-20261110.js — DISEASE / MEDIC-CURE re-measure analyzer
// WITH EVENT CAPTURE (sim-medcure-ev-b, 2026-11-10. Reads
// scripts/medcure-ev-driver-20261110.js corpora:
// evidence/2026-11-10/medcure-ev-b-corpus/medcure-ev-b-competent-s*.json
// plus medcure-ev-b-bare-s*.json for the neutrality leg.)
//
// Metrics (prereg-binding):
//  M1 wound-fever death rate by healer presence — NPC wound_fever episodes
//     (builder v2 over the daily + tick-phase snapshot streams), split by
//     healerPresent at onset; mortality each side. Headline shape matches
//     the 2026-11-08 census (sim-medicdiag-a: died/episodes, ANY death
//     while the episode was open counts as died — outcome /^died/); the
//     fever-cause-only rate is printed alongside as a secondary.
//  M2 cure channel split — duty cures by channel (ability vs medicine),
//     reconciled exactly against the game's own v.medicDutyCures counters.
//  M3 pharmacy stock over time — medicine doses per village-day.
//  Wall numbers — national / table / wins, wave reach, median survival.
//
// Episode rule v2 (prereg): an NPC wound_fever episode opens the first
// time a (vid, diseaseKey) record is seen in ANY snapshot (daily,
// preTick, preCare, postCare, postTick), with onsetDay = that snapshot's
// day, healerPresent = that snapshot's healerPresent, onsetSource = the
// snapshot kind. The preCare snapshot is what makes same-tick onset+cure
// episodes exist at all (medcure-b's blind spot). An episode closes the
// first sighting after onset that lacks the record. Outcome, in priority
// order: 'died' if a death row for that vid has day in
// [onsetDay, lastSeenDay+1] (the +1 covers the tick-after-snapshot
// ordering — a record last seen in postTick(D) whose owner dies in
// tick(D+1)'s progression); 'cured-duty-<channel>' if a duty-cure event
// names (vid, wound_fever) in the same window; 'left' if the vid is no
// longer on the roster at the last sighting (stale-cleanup deletion —
// excluded from M1); 'recovered' if the record disappears with no death
// or cure; 'open' if present on the final day. healerPresent at onset is
// the onset snapshot's value. Day labels are consistent across sources:
// scholar.day increments AFTER villageSicknessTick in endDay (game.js
// ~33626 vs ~33712), so tick-phase snapshots, cure events and death rows
// all carry the day that just ended, same as the daily snapshot.
'use strict';
const fs = require('fs');
const path = require('path');

const SICKNESS_CAUSES = new Set(['sickness', 'wound_fever', 'a wound that wouldn\'t close']);
const CORPUS_DIR = process.argv[2] || path.join(
  __dirname, '..', 'evidence', '2026-11-10', 'medcure-ev-b-corpus');
const PHASE_RANK = { snapshot: 0, preTick: 1, preCare: 2, postCare: 3, postTick: 4 };

function pct(n, d) { return d ? (100 * n / d).toFixed(1) + '%' : 'n/a'; }
function r3(x) { return (x == null || !isFinite(x)) ? 'n/a' : (Math.round(x * 1000) / 1000).toString(); }
function med(a) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

// buildEpisodes(s): pure function of one per-seed corpus object.
// Returns { episodes, unlinkedWoundFeverDeaths, unlinkedSicknessDeaths,
//   unrecordedCures, reconciledDeaths, pretickSightings, tickDayMismatches,
//   notes }.
function buildEpisodes(s) {
  const seed = s.seed;
  const days = (s.dayRows || []).slice().sort((a, b) => a.day - b.day);
  const lastDay = days.length ? days[days.length - 1].day : 0;
  const deaths = s.deathRows || [];
  const cures = s.cureEvents || [];
  const tickEvents = s.tickEvents || [];

  // --- unified sighting timeline, in real-time order. A tick's phases
  // sort after the daily snapshot they follow (afterDay) and before the
  // next day's snapshot. ---
  const sightings = [];
  let idx = 0;
  for (const row of days) {
    sightings.push({ idx: idx++, sortDay: row.day, kind: 'snapshot', day: row.day,
      healerPresent: row.healerPresent, medicCount: row.medicCount, roster: null,
      sick: row.sick || [] });
  }
  let tickDayMismatches = 0;
  for (const te of tickEvents) {
    if (te.day !== te.afterDay) tickDayMismatches++;
    sightings.push({ idx: idx++, sortDay: te.afterDay, kind: te.phase, day: te.day,
      healerPresent: te.healerPresent, medicCount: te.medicCount,
      roster: te.roster || null, sick: te.sick || [] });
  }
  sightings.sort((a, b) => (a.sortDay - b.sortDay) ||
    ((PHASE_RANK[a.kind] || 0) - (PHASE_RANK[b.kind] || 0)) || (a.idx - b.idx));

  const keyOf = (vid, diseaseId, name) => vid + '|' + (diseaseId || ('name:' + name));
  const open = new Map(); // key -> episode under construction
  const episodes = [];
  const notes = [];
  let pretickSightings = 0;
  // Tend detection: a preCare -> postCare pair (same tick) where a record's
  // daysLeft drops by exactly 1 with no deletion is a tend.
  const preCareSeen = new Map(); // vid|diseaseKey -> { daysLeft, tickKey }
  const closeEpisode = (ep, sighting) => {
    ep.closeDay = sighting.day;
    ep.closeKind = sighting.kind;
    const winLo = ep.onsetDay, winHi = ep.lastSeenDay + 1;
    const d = deaths.find(dd => dd.who === ep.who && dd.day >= winLo && dd.day <= winHi);
    const c = cures.find(cc => cc.who === ep.who && cc.day >= winLo && cc.day <= winHi &&
      (cc.diseaseId === ep.diseaseId || (ep.diseaseId == null && cc.diseaseId == null)));
    if (d) {
      ep.outcome = 'died';
      ep.deathDay = d.day; ep.deathCause = d.cause;
      ep.feverDeath = SICKNESS_CAUSES.has(String(d.cause || '').toLowerCase());
      if (d.day > ep.lastSeenDay) notes.push('reconciled-death:' + ep.who + ':' + d.day);
    } else if (c) {
      ep.outcome = 'cured-duty-' + c.channel;
      ep.cureDay = c.day; ep.cureChannel = c.channel; ep.cureHolder = c.holderName;
    } else if (ep.lastSeenRoster && !ep.lastSeenRoster.includes(ep.who)) {
      ep.outcome = 'left';
    } else {
      ep.outcome = 'recovered';
    }
    episodes.push(ep);
    open.delete(keyOf(ep.who, ep.diseaseId, ep.name));
  };

  for (const sg of sightings) {
    const present = new Set();
    for (const rec of (sg.sick || [])) {
      if (rec.vid === undefined) continue;
      const k = keyOf(rec.vid, rec.diseaseId, rec.name);
      present.add(k);
      let ep = open.get(k);
      if (!ep) {
        ep = { seed, who: rec.vid, whoName: null, diseaseId: rec.diseaseId,
          name: rec.name, onsetDay: sg.day, onsetSource: sg.kind,
          lastSeenDay: sg.day, lastSeenKind: sg.kind, lastSeenRoster: sg.roster,
          healerPresent: sg.healerPresent, medicCount: sg.medicCount,
          severity: rec.severity, tended: false };
        if (sg.kind === 'preTick') pretickSightings++;
        open.set(k, ep);
      }
      ep.lastSeenDay = sg.day;
      ep.lastSeenKind = sg.kind;
      if (sg.roster) ep.lastSeenRoster = sg.roster;
      if (rec.severity != null && (ep.severity == null || rec.severity > ep.severity)) ep.severity = rec.severity;
      // Tend: postCare daysLeft exactly one below the same tick's preCare.
      if (sg.kind === 'preCare') {
        preCareSeen.set(k, { daysLeft: rec.daysLeft, tickKey: sg.sortDay + ':' + sg.day });
      } else if (sg.kind === 'postCare') {
        const pre = preCareSeen.get(k);
        if (pre && pre.tickKey === sg.sortDay + ':' + sg.day &&
          pre.daysLeft != null && rec.daysLeft === pre.daysLeft - 1) ep.tended = true;
      }
    }
    // Names: fill whoName from the death rows when available.
    for (const rec of (sg.sick || [])) {
      const k = keyOf(rec.vid, rec.diseaseId, rec.name);
      const ep = open.get(k);
      if (ep && !ep.whoName) {
        const d = deaths.find(dd => dd.who === rec.vid);
        if (d) ep.whoName = d.whoName;
      }
    }
    // Close every open episode whose record is absent from this sighting.
    // (A record absent from a complete v.sick snapshot is really gone.)
    for (const [k, ep] of [...open.entries()]) {
      if (!present.has(k)) closeEpisode(ep, sg);
    }
  }
  // Episodes still open at the end of the timeline stay open.
  for (const ep of open.values()) {
    ep.outcome = 'open';
    ep.closeDay = null; ep.closeKind = null;
    episodes.push(ep);
  }
  // Reconciled deaths: deaths that joined via the +1 window (death day
  // after the last sighting day).
  const reconciledDeaths = episodes.filter(e => e.outcome === 'died' && e.deathDay > e.lastSeenDay);
  // Unlinked deaths: a wound_fever-cause death row matching NO episode is a
  // G2 failure; a sickness-cause death with no open episode is reported
  // separately.
  const unlinkedWoundFeverDeaths = deaths.filter(d =>
    String(d.cause || '').toLowerCase() === 'wound_fever' &&
    !episodes.some(ep => ep.who === d.who && d.day >= ep.onsetDay && d.day <= ep.lastSeenDay + 1));
  const unlinkedSicknessDeaths = deaths.filter(d =>
    String(d.cause || '').toLowerCase() === 'sickness' &&
    !episodes.some(ep => ep.who === d.who && d.day >= ep.onsetDay && d.day <= ep.lastSeenDay + 1));
  // Unrecorded cures: a duty-cure event with no episode anywhere (the
  // record was never seen in any snapshot — the instrument missed it).
  const unrecordedCures = cures.filter(c =>
    !episodes.some(ep => ep.who === c.who && c.day >= ep.onsetDay && c.day <= ep.lastSeenDay + 1));
  return { episodes, unlinkedWoundFeverDeaths, unlinkedSicknessDeaths,
    unrecordedCures, reconciledDeaths, pretickSightings, tickDayMismatches,
    lastDay, notes };
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(f => /^medcure-ev-b-competent-s\d+\.json$/.test(f)).sort();
  const bareFiles = fs.readdirSync(dir).filter(f => /^medcure-ev-b-bare-s\d+\.json$/.test(f)).sort();
  const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  const bare = bareFiles.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  return { seeds, bare, files, bareFiles };
}

function analyze(dir) {
  const { seeds, bare } = loadCorpus(dir);
  const out = { seeds: seeds.length, perSeed: [], pooled: {}, gates: {} };
  let totVillageDays = 0, totHealerDays = 0, totSickDays = 0;
  const allEps = [];
  const allWf = [];
  let totUnlinkedWF = 0, totUnlinkedSick = 0, totUnrecordedCures = 0, totReconciled = 0;
  let totCureAbility = 0, totCureMedicine = 0, cureMismatch = 0;
  let totInstrErr = 0, totPretickSightings = 0, totTickDayMismatches = 0;
  let totTickEvents = 0, tickPhaseMismatch = 0;
  const wall = { national: 0, table: 0, wins: 0, waveReach: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, survivals: [] };
  const deathCauses = {};
  let pharmDays = 0, pharmZeroDays = 0, pharmDosesSum = 0, pharmMax = 0;
  let pharmAbxSum = 0, pharmAntipSum = 0, seedsEverStocked = 0, stockChanges = 0;

  for (const s of seeds) {
    const built = buildEpisodes(s);
    const eps = built.episodes;
    const wf = eps.filter(e => e.diseaseId === 'wound_fever');
    const died = (e) => /^died/.test(e.outcome || '');
    const feverDied = (e) => e.outcome === 'died' && e.feverDeath;
    const hd = s.dayRows.filter(r => r.healerPresent).length;
    const sd = s.dayRows.reduce((a, r) => a + (r.sickCountNPC || 0), 0);
    totVillageDays += s.dayRows.length; totHealerDays += hd; totSickDays += sd;
    totUnlinkedWF += built.unlinkedWoundFeverDeaths.length;
    totUnlinkedSick += built.unlinkedSicknessDeaths.length;
    totUnrecordedCures += built.unrecordedCures.length;
    totReconciled += built.reconciledDeaths.length;
    totInstrErr += (s.instrumentErrors || []).length;
    totPretickSightings += built.pretickSightings;
    totTickDayMismatches += built.tickDayMismatches;
    totTickEvents += (s.tickEvents || []).length;
    const pc = s.tickPhaseCounts || {};
    // Phase rule (corrected — see prereg Amendment): entry/exit pairs must
    // balance (preTick == postTick, preCare == postCare) and care ticks
    // never exceed sickness ticks. A tick may legitimately lack care phases:
    // villageSicknessTick early-returns when no onset candidates exist,
    // skipping villagerCareTick for that tick.
    if (!(pc.preTick === pc.postTick && pc.preCare === pc.postCare && pc.preCare <= pc.preTick)) tickPhaseMismatch++;
    // M2 reconciliation: events vs the game's own counters.
    const evAb = s.cureEvents.filter(c => c.channel === 'ability').length;
    const evMed = s.cureEvents.filter(c => c.channel === 'medicine').length;
    const fin = s.finalDutyCures || { ability: 0, medicine: 0 };
    if (evAb !== fin.ability || evMed !== fin.medicine) cureMismatch++;
    totCureAbility += evAb; totCureMedicine += evMed;
    // M3 pharmacy series.
    let everStocked = false, prevTotal = null;
    for (const r of s.dayRows) {
      const t = (r.pharmacy || {}).total || 0;
      pharmDays++; pharmDosesSum += t; pharmMax = Math.max(pharmMax, t);
      pharmAbxSum += (r.pharmacy || {}).antibiotics || 0;
      pharmAntipSum += (r.pharmacy || {}).antiparasitic || 0;
      if (t === 0) pharmZeroDays++; else everStocked = true;
      if (prevTotal != null && t !== prevTotal) stockChanges++;
      prevTotal = t;
    }
    if (everStocked) seedsEverStocked++;
    // Wall.
    if (s.national) wall.national++;
    if (s.table) wall.table++;
    if (s.win) wall.wins++;
    for (const w of (s.waveReach || [])) wall.waveReach[w] = (wall.waveReach[w] || 0) + 1;
    wall.survivals.push(s.daysAlive);
    for (const [k, v] of Object.entries(s.deathCauses || {})) deathCauses[k] = (deathCauses[k] || 0) + v;
    allEps.push(...eps); allWf.push(...wf);
    out.perSeed.push({ seed: s.seed, daysAlive: s.daysAlive,
      villageDays: s.dayRows.length, healerDays: hd,
      npcEpisodes: eps.length, wfEpisodes: wf.length,
      wfDied: wf.filter(died).length, wfFeverDied: wf.filter(feverDied).length,
      wfCured: wf.filter(e => /^cured-duty/.test(e.outcome || '')).length,
      wfTended: wf.filter(e => e.tended).length,
      wfPreCareOnly: wf.filter(e => e.onsetSource === 'preCare' || e.onsetSource === 'postCare').length,
      cureAbility: evAb, cureMedicine: evMed,
      sayLines: (s.sayLines || []).length,
      tickEvents: (s.tickEvents || []).length,
      finalDutyCures: fin, cureMismatch: (evAb !== fin.ability || evMed !== fin.medicine),
      unlinkedWF: built.unlinkedWoundFeverDeaths.length,
      unlinkedSick: built.unlinkedSicknessDeaths.length,
      unrecordedCures: built.unrecordedCures.length,
      reconciledDeaths: built.reconciledDeaths.length,
      pretickSightings: built.pretickSightings,
      tickDayMismatches: built.tickDayMismatches,
      instrumentErrors: (s.instrumentErrors || []).length,
      pharmMaxDay: Math.max(0, ...s.dayRows.map(r => (r.pharmacy || {}).total || 0)),
      pharmStockedDays: s.dayRows.filter(r => ((r.pharmacy || {}).total || 0) > 0).length });
  }

  // ---- M1 (PRIMARY): wound-fever mortality by healer presence at onset ----
  // 'left' episodes are excluded from both sides (neither died nor recovered).
  const wfCounted = allWf.filter(e => e.outcome !== 'left');
  const wfP = wfCounted.filter(e => e.healerPresent === true);
  const wfA = wfCounted.filter(e => e.healerPresent === false);
  const died = (e) => /^died/.test(e.outcome || '');
  const feverDied = (e) => e.outcome === 'died' && e.feverDeath;
  const m1 = {
    present: { n: wfP.length, died: wfP.filter(died).length, feverDied: wfP.filter(feverDied).length },
    absent: { n: wfA.length, died: wfA.filter(died).length, feverDied: wfA.filter(feverDied).length },
    unclassified: allWf.filter(e => e.healerPresent == null).length,
    leftExcluded: allWf.filter(e => e.outcome === 'left').length,
  };
  m1.present.rate = m1.present.n ? m1.present.died / m1.present.n : null;
  m1.absent.rate = m1.absent.n ? m1.absent.died / m1.absent.n : null;
  m1.present.feverRate = m1.present.n ? m1.present.feverDied / m1.present.n : null;
  m1.absent.feverRate = m1.absent.n ? m1.absent.feverDied / m1.absent.n : null;
  // All-disease NPC mortality by healer presence (context).
  const allP = allEps.filter(e => e.healerPresent === true && e.outcome !== 'left');
  const allA = allEps.filter(e => e.healerPresent === false && e.outcome !== 'left');
  const m1all = {
    present: { n: allP.length, died: allP.filter(died).length },
    absent: { n: allA.length, died: allA.filter(died).length },
  };
  // Treated share: duty-cured or tended wound-fever episodes by healer presence.
  const treated = (list) => list.filter(e => /^cured-duty/.test(e.outcome || '') || e.tended).length;
  const curedP = wfP.filter(e => /^cured-duty/.test(e.outcome || '')).length;
  const curedA = wfA.filter(e => /^cured-duty/.test(e.outcome || '')).length;
  // Onset-source split: how many wound-fever episodes only the event
  // capture could see (the blind spot medcure-b missed).
  const onsetSources = {};
  for (const e of allWf) onsetSources[e.onsetSource] = (onsetSources[e.onsetSource] || 0) + 1;

  // ---- M2: cure channel split ----
  const cureEvents = [];
  for (const s of seeds) for (const c of (s.cureEvents || [])) cureEvents.push({ seed: s.seed, ...c });
  const m2 = { ability: totCureAbility, medicine: totCureMedicine,
    total: totCureAbility + totCureMedicine, mismatchSeeds: cureMismatch,
    byDisease: {} };
  for (const c of cureEvents) {
    const k = c.diseaseId || 'unnamed';
    m2.byDisease[k] = m2.byDisease[k] || { ability: 0, medicine: 0 };
    m2.byDisease[k][c.channel]++;
  }
  // Episode-join rate (the judged quantity): duty-cure events that joined
  // a real episode.
  const joinRate = m2.total ? (m2.total - totUnrecordedCures) / m2.total : null;

  // ---- M3: pharmacy stock over time ----
  const m3 = { villageDays: pharmDays, meanDoses: pharmDays ? pharmDosesSum / pharmDays : null,
    maxDoses: pharmMax, zeroDays: pharmZeroDays, stockedDays: pharmDays - pharmZeroDays,
    meanAbx: pharmDays ? pharmAbxSum / pharmDays : null,
    meanAntip: pharmDays ? pharmAntipSum / pharmDays : null,
    seedsEverStocked, stockChanges };

  // ---- Wall ----
  wall.medianSurvival = med(wall.survivals);
  wall.maxSurvival = wall.survivals.length ? Math.max(...wall.survivals) : null;

  // ---- Gates (prereg G1–G3; G4 is the proof test, reported by the test) ----
  const g1 = seeds.length === 8 && seeds.every(s =>
    (s.dayRows || []).length > 0 && (s.dayRows || []).length === s.villageDays &&
    (s.instrumentErrors || []).length === 0) &&
    tickPhaseMismatch === 0 && totTickEvents > 0;
  const g2 = m1.unclassified === 0 && totUnlinkedWF === 0 &&
    (joinRate == null || joinRate >= 0.8) && cureMismatch === 0;
  let g3 = null, g3detail = '';
  if (bare.length) {
    const fpEq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    let summaryFps = null;
    try {
      const sumPath = path.join(dir, 'sweep-competent.json');
      if (fs.existsSync(sumPath)) {
        const sum = JSON.parse(fs.readFileSync(sumPath, 'utf8'));
        summaryFps = new Map((sum.rows || []).map(r => [r.seed, r.fingerprint]));
      }
    } catch (e) { summaryFps = null; }
    const mism = [];
    for (const b of bare) {
      if (summaryFps && summaryFps.has(b.seed)) {
        if (!fpEq(b, summaryFps.get(b.seed))) mism.push(b.seed + ':fingerprint-diverged');
        continue;
      }
      const rec = seeds.find(s => s.seed === b.seed);
      if (!rec) { mism.push(b.seed + ':no-recorded'); continue; }
      const shared = (x) => ({ seed: x.seed, daysAlive: x.daysAlive,
        maxWave: x.maxWave, national: x.national, table: x.table, win: x.win,
        deathCauses: x.deathCauses, deathKeys: x.deathKeys });
      const recShared = shared({ seed: rec.seed, daysAlive: rec.daysAlive,
        maxWave: Math.max(0, ...(rec.waveReach || [1])), national: rec.national,
        table: rec.table, win: rec.win, deathCauses: rec.deathCauses,
        deathKeys: (rec.deathRows || []).map(d => d.day + '|' + d.who + '|' + d.cause).sort() });
      if (!fpEq(shared(b), recShared)) mism.push(b.seed + ':fingerprint-diverged');
    }
    g3 = mism.length === 0;
    g3detail = mism.length ? mism.join('; ') : ('bare ' + bare.length + '/' + bare.length + ' match' +
      (summaryFps ? ' (full fingerprints)' : ' (shared subset)'));
  }

  out.pooled = { villageDays: totVillageDays, healerDays: totHealerDays,
    healerShare: totVillageDays ? totHealerDays / totVillageDays : null,
    npcSickDays: totSickDays, m1, m1all,
    wfCuredPresent: curedP, wfCuredAbsent: curedA,
    wfTreatedPresent: treated(wfP), wfTreatedAbsent: treated(wfA),
    onsetSources, m2, joinRate, m3, wall, deathCauses,
    unlinkedWF: totUnlinkedWF, unlinkedSick: totUnlinkedSick,
    unrecordedCures: totUnrecordedCures, reconciledDeaths: totReconciled,
    instrumentErrors: totInstrErr, cureEvents,
    pretickSightings: totPretickSightings, tickDayMismatches: totTickDayMismatches,
    tickEvents: totTickEvents, tickPhaseMismatch };
  out.gates = { G1_capture_complete_8of8: g1, G2_episode_join_clean: g2,
    G3_neutrality: g3, G3_detail: g3detail,
    GO: (g1 && g2 && g3 === true) };
  return out;
}

function printReport(a) {
  const p = a.pooled;
  console.log('=== sim-medcure-ev-b RE-MEASURE WITH EVENT CAPTURE (seeds=' + a.seeds + ') ===');
  console.log('WALL: national=' + p.wall.national + '/' + a.seeds + ' table=' + p.wall.table +
    ' wins=' + p.wall.wins + ' waveReach=' + JSON.stringify(p.wall.waveReach) +
    ' medianSurvival=' + p.wall.medianSurvival + 'd max=' + p.wall.maxSurvival + 'd');
  console.log('VILLAGE-DAYS: ' + p.villageDays + ' healerDays=' + p.healerDays +
    ' (' + pct(p.healerDays, p.villageDays) + ') NPC sick-days=' + p.npcSickDays);
  console.log('EVENT CAPTURE: tickEvents=' + p.tickEvents + ' phase-mismatch seeds=' + p.tickPhaseMismatch +
    ' pretickSightings=' + p.pretickSightings + ' tickDayMismatches=' + p.tickDayMismatches);
  console.log('M1 WOUND-FEVER MORTALITY (NPC episodes, healer at onset; census shape died/episodes):');
  console.log('  present ' + p.m1.present.died + '/' + p.m1.present.n + ' = ' + pct(p.m1.present.died, p.m1.present.n) +
    ' (fever-cause only ' + p.m1.present.feverDied + '/' + p.m1.present.n + ' = ' + pct(p.m1.present.feverDied, p.m1.present.n) + ')');
  console.log('  absent  ' + p.m1.absent.died + '/' + p.m1.absent.n + ' = ' + pct(p.m1.absent.died, p.m1.absent.n) +
    ' (fever-cause only ' + p.m1.absent.feverDied + '/' + p.m1.absent.n + ' = ' + pct(p.m1.absent.feverDied, p.m1.absent.n) + ')');
  console.log('  unclassified healer status: ' + p.m1.unclassified +
    ' | left-excluded episodes: ' + p.m1.leftExcluded +
    ' | duty-cured wound-fever episodes: present ' + p.wfCuredPresent + ', absent ' + p.wfCuredAbsent +
    ' | treated (cured or tended): present ' + p.wfTreatedPresent + ', absent ' + p.wfTreatedAbsent);
  console.log('  onset sources (wound-fever episodes): ' + JSON.stringify(p.onsetSources));
  console.log('  ALL-DISEASE NPC mortality: present ' + p.m1all.present.died + '/' + p.m1all.present.n +
    ' (' + pct(p.m1all.present.died, p.m1all.present.n) + ') absent ' + p.m1all.absent.died + '/' + p.m1all.absent.n +
    ' (' + pct(p.m1all.absent.died, p.m1all.absent.n) + ')');
  console.log('M2 CURE CHANNEL SPLIT: total=' + p.m2.total + ' ability=' + p.m2.ability +
    ' medicine=' + p.m2.medicine + ' counter-mismatch seeds=' + p.m2.mismatchSeeds +
    ' episode-join rate=' + (p.joinRate == null ? 'n/a' : (100 * p.joinRate).toFixed(1) + '%'));
  console.log('  by disease: ' + JSON.stringify(p.m2.byDisease));
  for (const c of p.cureEvents.slice(0, 40)) {
    console.log('    cure s' + c.seed + ' d' + c.day + ' ' + c.channel + ' ' +
      (c.holderName || c.holder) + ' -> ' + (c.whoName || c.who) + ' (' + (c.diseaseId || 'unnamed') + ')');
  }
  if (p.cureEvents.length > 40) console.log('    ... +' + (p.cureEvents.length - 40) + ' more');
  console.log('M3 PHARMACY: village-days=' + p.m3.villageDays + ' mean doses/day=' + r3(p.m3.meanDoses) +
    ' (abx ' + r3(p.m3.meanAbx) + ' / antip ' + r3(p.m3.meanAntip) + ')' +
    ' max=' + p.m3.maxDoses + ' stocked days=' + p.m3.stockedDays + ' zero days=' + p.m3.zeroDays +
    ' seeds ever stocked=' + p.m3.seedsEverStocked + '/' + a.seeds + ' stock changes=' + p.m3.stockChanges);
  console.log('DEATH CAUSES: ' + JSON.stringify(p.deathCauses));
  console.log('JOIN: unlinked wound-fever deaths=' + p.unlinkedWF +
    ' unlinked sickness deaths=' + p.unlinkedSick +
    ' unrecorded cures=' + p.unrecordedCures +
    ' reconciled (death after last snapshot)=' + p.reconciledDeaths +
    ' instrument errors=' + p.instrumentErrors);
  for (const r of a.perSeed) {
    console.log('  s' + r.seed + ': ' + r.daysAlive + 'd healerDays=' + r.healerDays +
      '/' + r.villageDays + ' wfEps=' + r.wfEpisodes + ' wfDied=' + r.wfDied +
      ' wfFeverDied=' + r.wfFeverDied + ' wfCured=' + r.wfCured +
      ' wfTended=' + r.wfTended + ' wfPreCareOnly=' + r.wfPreCareOnly +
      ' cures ab/med=' + r.cureAbility + '/' + r.cureMedicine +
      ' sayLines=' + r.sayLines + ' tickEvents=' + r.tickEvents +
      ' pharmMax=' + r.pharmMaxDay + ' stockedDays=' + r.pharmStockedDays +
      (r.cureMismatch ? ' CURE-MISMATCH' : '') +
      (r.unlinkedWF ? ' UNLINKED-WF=' + r.unlinkedWF : '') +
      (r.unrecordedCures ? ' UNRECORDED-CURES=' + r.unrecordedCures : '') +
      (r.instrumentErrors ? ' INSTR-ERR=' + r.instrumentErrors : ''));
  }
  console.log('GATES: G1=' + (a.gates.G1_capture_complete_8of8 ? 'PASS' : 'FAIL') +
    ' G2=' + (a.gates.G2_episode_join_clean ? 'PASS' : 'FAIL') +
    ' G3=' + (a.gates.G3_neutrality === true ? 'PASS' : a.gates.G3_neutrality === false ? 'FAIL' : 'n/a') +
    ' (' + a.gates.G3_detail + ')');
  console.log('VERDICT: ' + (a.gates.GO ? 'GO (re-measure valid, instrument joins episodes)' : 'NO-GO (see gates)'));
}

if (require.main === module) {
  const a = analyze(CORPUS_DIR);
  printReport(a);
  process.exit(a.gates.GO ? 0 : 1);
}

module.exports = { buildEpisodes, analyze, SICKNESS_CAUSES };
