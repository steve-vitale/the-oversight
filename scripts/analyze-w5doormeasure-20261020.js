#!/usr/bin/env node
// analyze-w5doormeasure-20261020.js — stall-point attribution + blocker
// attribution for the sim-w5door-measure wave-5 unlock-path diagnostic.
//
// Reads evidence/2026-10-20/perseed-w5doormeasure/<policy>/s<seed>.json and,
// per run, derives:
//   - stallClass: unlocked | engaged-but-failed | progressed-but-stalled |
//     never-progressed (the sim-w5census decomposition, reproduced).
//   - attempts: maximal contiguous deferral(5)-true windows with outcomes
//     released | died | won | horizon | regressed.
//   - blockers: for every run with peak>=4 and peak<5, >=1 named blocker from
//     B1..B9 (the pre-registered PRIMARY). FAILS LOUD (exit 1) on any run
//     with 0 named blockers.
//   - E1: wave-2/3 leg pacing (ledger fill vs bars, day floors, unlock days).
//   - E2: kills by killer class per wave + ledger points per wave.
//   - E3: window-mortality of deed earners (killer dead within 30d of kill).
//   - E4: raid-exposure vs unlock decoupling (#469): kills/faced with wave >
//     unlockedWave that day.
//   - wall numbers: national/table/wins/wave-4/wave-5/median/max survival,
//     death-cause shares.
//
// Writes: evidence/2026-10-20/w5doormeasure-corpus-summary.json and
//         evidence/2026-10-20/w5doormeasure-stall-attribution.md
// Usage: node scripts/analyze-w5doormeasure-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-w5doormeasure');
const OUTD = path.join(__dirname, '..', 'evidence', '2026-10-20');

// Stall-point classification (pre-registered — the w5 door is
// standingDeferral(5); the classes form a strict path ladder, same as
// sim-w5census so the decompositions compare honestly).
function classify(rec) {
  const recs = rec.recs || [];
  let maxPeak = 0, def5ever = false, firstDef5Day = null, peak4Day = null;
  for (const r of recs) {
    if ((r.peak | 0) > maxPeak) maxPeak = r.peak | 0;
    if ((r.peak | 0) >= 4 && peak4Day == null) peak4Day = r.d;
    if (r.def5 && !def5ever) { def5ever = true; firstDef5Day = r.d; }
  }
  const endPeak = (rec.endRec && (rec.endRec.peak | 0)) || 0;
  if (endPeak > maxPeak) maxPeak = endPeak;
  const unlocked = maxPeak >= 5 || (rec.wave5Day != null);
  let stallClass, stallSub = null;
  if (unlocked) stallClass = 'unlocked';
  else if (def5ever) {
    stallClass = 'engaged-but-failed';
    if (maxPeak < 4) stallSub = 'w5door-without-w4';
  }
  else if (maxPeak >= 4) stallClass = 'progressed-but-stalled';
  else stallClass = 'never-progressed';
  return { stallClass, stallSub, maxPeak, def5ever, firstDef5Day, peak4Day, unlocked: !!unlocked };
}

// Wave-5 unlock attempts: maximal contiguous deferral(5)-true windows.
function attemptsOf(rec) {
  const recs = (rec.recs || []).slice();
  // The daily hook's last record can lag run end by a day; the endRec is
  // the terminal observation (the sim-w5census F9 lesson).
  if (rec.endRec && recs.length && (rec.endRec.d | 0) > (recs[recs.length - 1].d | 0)) recs.push(rec.endRec);
  const wins = [];
  let cur = null;
  for (const r of recs) {
    if (r.def5) {
      if (!cur) cur = { start: r.d, end: r.d };
      else cur.end = r.d;
    } else if (cur) { wins.push(cur); cur = null; }
  }
  if (cur) wins.push(cur);
  const endDay = (rec.endRec && (rec.endRec.d | 0)) || ((rec.gameDays | 0) || 0);
  // Attempt outcomes — the sim-w5census semantics, reproduced exactly:
  // a window open at run end takes the run's endKind (won/died/horizon);
  // a window that closed earlier while alive+unwon regressed.
  const endKind = rec.won ? 'won'
    : (rec.endReason === 'village-lost' || rec.endReason === 'pop-zero') ? 'died'
    : (endDay >= 180 || rec.endReason === 'survived') ? 'horizon' : 'died';
  for (const w of wins) {
    w.len = w.end - w.start + 1;
    if ((rec.wave5Day != null) && rec.wave5Day >= w.start && rec.wave5Day <= w.end + 1) w.outcome = 'released';
    else if (w.end >= endDay) w.outcome = endKind;
    else w.outcome = 'regressed';
  }
  return wins;
}

// attributeBlockers(rec): the pre-registered PRIMARY. For every run with
// peak>=4 and peak<5 (wave-4 unlocked, wave-5 never), >=1 named blocker from
// B1..B9. Returns {blockers:[...], unattributed:boolean}.
function attributeBlockers(rec, att) {
  const blockers = [];
  const has = (code, note) => blockers.push({ code, note });
  const endRec = rec.endRec || {};
  const term = (x) => (endRec[x] == null ? null : endRec[x]);
  if (!(att.maxPeak >= 4 && att.maxPeak < 5)) return { blockers, unattributed: false, na: true };
  // B0 (informational, not a blocker): the run WON before the w5 door
  // opened — no blocker, but attributed (the run is complete, not stuck).
  if (rec.won) { has('B0', 'won-before-door: the run ended in a win with peak<5'); return { blockers, unattributed: false }; }
  const cap = term('cap'), raw = term('raw'), peak = att.maxPeak;
  const r5 = endRec.r5 || {};
  const vetT = r5.vet | 0, armT = r5.arm | 0, wpnT = r5.wpn | 0, trkT = r5.trk | 0;
  const wEngaged4 = term('wEngaged4');
  const atts = att.attempts || [];
  // B1: standing-short — capped < 200 at terminal, deferral(5) never true.
  if (!att.def5ever && (cap == null || cap < 200)) {
    const plentyCapped = (endRec.plenty | 0) > 100;
    has('B1', `standing-short: cap=${cap} raw=${raw} (war=${term('war')} dip=${term('dip')} plenty=${term('plenty')}${plentyCapped ? ', plenty-capped' : ''}), def5 never true`);
  }
  // B2..B5: readiness legs short at terminal (deferral(5) was true).
  if (att.def5ever) {
    if (vetT < 2) has('B2', `readiness-veterans: ${vetT}/2 terminally`);
    if (armT < 4) has('B3', `readiness-armor: ${armT}/4 terminally`);
    if (wpnT < 6) has('B4', `readiness-weapons: ${wpnT}/6 terminally`);
    if (trkT < 3) has('B5', `readiness-tricks: ${trkT}/3 terminally`);
    // B6: w4 never faced (the w5 gate's w4-faced leg).
    if ((wEngaged4 | 0) === 0) has('B6', `w4-never-faced: waveEngaged(4)=0 terminally despite peak=${peak}`);
    // B7: died in window; B8: regressed; B9: horizon — from attempt outcomes.
    if (atts.some(a => a.outcome === 'died')) has('B7', 'died-in-window: a deferral(5) window ended with the village lost');
    if (atts.some(a => a.outcome === 'regressed')) has('B8', 'regressed: a deferral(5) window ended alive with capped<200');
    if (atts.some(a => a.outcome === 'horizon')) has('B9', 'horizon: deferral(5) true at run end');
  } else {
    // def5 never true but peak>=4 — B1 covers the standing case; if the
    // terminal capped >= 200 yet def5 never fired, that's the readiness
    // gate silently holding BELOW the deferral definition — name it loud.
    if (cap != null && cap >= 200) {
      if (vetT < 2) has('B2', `readiness-veterans (never-deferred): ${vetT}/2 terminally, cap=${cap}>=200 but def5 never true`);
      if (armT < 4) has('B3', `readiness-armor (never-deferred): ${armT}/4 terminally`);
      if (wpnT < 6) has('B4', `readiness-weapons (never-deferred): ${wpnT}/6 terminally`);
      if (trkT < 3) has('B5', `readiness-tricks (never-deferred): ${trkT}/3 terminally`);
      if ((wEngaged4 | 0) === 0) has('B6', `w4-never-faced (never-deferred): waveEngaged(4)=0, cap=${cap}>=200`);
    }
  }
  return { blockers, unattributed: blockers.length === 0 };
}

// E1: wave-2/3 leg pacing from the daily series.
function legPacing(rec) {
  const recs = rec.recs || [];
  const out = { w2barDay: null, w2floorDay: null, w2unlockDay: rec.wave2Day != null ? rec.wave2Day : null, w3barDay: null, w3floorDay: null, w3unlockDay: rec.wave3Day != null ? rec.wave3Day : null };
  for (const r of recs) {
    if (out.w2barDay == null && (r.l1 | 0) >= 5) out.w2barDay = r.d;
    if (out.w2floorDay == null && (r.d | 0) >= 8) out.w2floorDay = r.d;
    if (out.w3barDay == null && (r.l2 | 0) >= 4) out.w3barDay = r.d;
    if (out.w3floorDay == null && (r.d | 0) >= 25) out.w3floorDay = r.d;
  }
  if (rec.endRec) {
    const e = rec.endRec;
    if (out.w2barDay == null && (e.l1 | 0) >= 5) out.w2barDay = e.d;
    if (out.w3barDay == null && (e.l2 | 0) >= 4) out.w3barDay = e.d;
  }
  return out;
}

// E2: kills by killer class per wave (terminal waveKillLog) + ledger pts.
function killAnatomy(rec) {
  const byClassWave = {};
  let total = 0;
  for (const e of (rec.killLog || [])) {
    const w = e.w | 0, c = String(e.cls || 'unknown');
    byClassWave[`${c}.w${w}`] = (byClassWave[`${c}.w${w}`] | 0) + 1;
    total++;
  }
  const endRec = rec.endRec || {};
  const ledger = { l1: endRec.l1 | 0, l2: endRec.l2 | 0, l3: endRec.l3 | 0, l4: endRec.l4 | 0, l5: endRec.l5 | 0 };
  return { total, byClassWave, ledger };
}

// E3: window-mortality of deed earners — for each wave-4+ kill, killer class
// and whether the killer died within 30d of the kill (samples.deaths).
function earnersMortality(rec) {
  const deaths = rec.deathList || [];
  const rows = [];
  for (const e of (rec.killLog || [])) {
    if ((e.w | 0) < 4) continue;
    const kd = e.d | 0, who = String(e.by || '');
    let diedWithin = null;
    for (const d of deaths) {
      if (who && String(d.who) === who && (d.day | 0) >= kd && (d.day | 0) <= kd + 30) { diedWithin = (d.day | 0) - kd; break; }
    }
    rows.push({ d: kd, mid: e.mid, w: e.w, cls: e.cls, ch: e.ch, by: who, diedWithin30: diedWithin });
  }
  return rows;
}

// E4: raid-exposure vs unlock decoupling — kills/faced with wave > uw.
function decoupling(rec) {
  const kills = [], faced = [];
  for (const r of (rec.recs || [])) {
    for (const k of (r.newKills || [])) if (k.decoupled) kills.push({ d: r.d, mid: k.mid, w: k.w, uw: k.uw, cls: k.cls, ch: k.ch });
    for (const f of (r.newFaced || [])) if (f.decoupled) faced.push({ d: r.d, mid: f.mid, w: f.w, uw: r.uw });
  }
  return { kills, faced };
}

function attribute(rec) {
  const att = classify(rec);
  att.attempts = attemptsOf(rec);
  att.blockers = module.exports.attributeBlockers(rec, att);
  att.legs = legPacing(rec);
  att.anatomy = killAnatomy(rec);
  att.earners = earnersMortality(rec);
  att.dec = decoupling(rec);
  att.wave2Day = rec.wave2Day; att.wave3Day = rec.wave3Day; att.wave4Day = rec.wave4Day; att.wave5Day = rec.wave5Day;
  att.maxWave = rec.maxWave; att.national = rec.national; att.table = rec.table; att.won = rec.won;
  att.endReason = rec.endReason; att.gameDays = rec.gameDays; att.endDay = rec.gameDays; att.seed = rec.seed; att.policyId = rec.policyId;
  att.deaths = rec.deaths || {};
  return att;
}

function median(xs) {
  const a = xs.filter(x => x != null).slice().sort((p, q) => p - q);
  if (!a.length) return null;
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

// runCorpus(evidDir, outDir): the driver, exported for the proof test.
// Returns { exitCode, summary } — exitCode 1 on the PRIMARY fail-loud.
function runCorpus(evidDir, outDir) {
  if (!fs.existsSync(evidDir)) { console.error(`STOP: no sweep dir ${evidDir} — run the probe first.`); return { exitCode: 2 }; }
  const runs = [];
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const dir = path.join(evidDir, policyId);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/^s\d+\.json$/.test(f)) continue;
      runs.push(attribute(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
    }
  }
  runs.sort((a, b) => (a.policyId < b.policyId ? -1 : a.policyId > b.policyId ? 1 : a.seed - b.seed));
  // PRIMARY gate: every peak>=4/<5 run must carry >=1 named blocker.
  const eligible = runs.filter(r => r.maxPeak >= 4 && r.maxPeak < 5);
  const unattributed = eligible.filter(r => r.blockers.unattributed);
  // Corpus summary.
  const stallDist = {};
  const blockerDist = {};
  for (const r of runs) {
    stallDist[r.stallClass] = (stallDist[r.stallClass] | 0) + 1;
    for (const b of r.blockers.blockers) blockerDist[b.code] = (blockerDist[b.code] | 0) + 1;
  }
  const nat = runs.filter(r => r.national).length;
  const tab = runs.filter(r => r.table).length;
  const wins = runs.filter(r => r.won).length;
  const waveReach = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of runs) for (let w = 1; w <= 5; w++) if ((r.maxWave | 0) >= w) waveReach[w]++;
  const surv = runs.map(r => r.gameDays | 0);
  const deathCauses = {};
  for (const r of runs) for (const [k, v] of Object.entries(r.deaths || {})) deathCauses[k] = (deathCauses[k] | 0) + v;
  const e4runs = runs.map(r => ({ seed: r.seed, policyId: r.policyId, decKills: r.dec.kills.length, decFaced: r.dec.faced.length, maxPeak: r.maxPeak }));
  const summary = {
    n: runs.length,
    primary: { eligible: eligible.length, unattributed: unattributed.length, go: unattributed.length === 0 },
    stallDist, blockerDist,
    wall: { national: nat, table: tab, wins, waveReach, medianSurvival: median(surv), maxSurvival: Math.max(...surv, 0), deathCauses },
    legs: runs.map(r => ({ seed: r.seed, policyId: r.policyId, stallClass: r.stallClass, w2unlock: r.legs.w2unlockDay, w3unlock: r.legs.w3unlockDay, w4unlock: r.wave4Day, firstDef5: r.firstDef5Day })),
    w4killsByClass: runs.map(r => ({ seed: r.seed, policyId: r.policyId, w4: [r.anatomy.byClassWave['player.w4'] | 0, r.anatomy.byClassWave['villager.w4'] | 0, r.anatomy.byClassWave['companion.w4'] | 0], w3: [r.anatomy.byClassWave['player.w3'] | 0, r.anatomy.byClassWave['villager.w3'] | 0, r.anatomy.byClassWave['companion.w3'] | 0] })),
    e4runs,
  };
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'w5doormeasure-corpus-summary.json'), JSON.stringify(summary, null, 1));
  // Attribution table.
  let md = `# w5doormeasure stall attribution — ${runs.length} runs\n\n`;
  md += `PRIMARY: ${eligible.length} runs with wave-4 unlocked but wave-5 never unlocked; ${unattributed.length} unattributed → ${unattributed.length === 0 ? 'GO' : 'NO-GO (FAIL LOUD)'}\n\n`;
  md += `| seed | policy | stall | peak | w4d | def5d | w5d | end | blockers |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of runs) {
    const b = r.blockers.na ? 'n/a' : r.blockers.blockers.map(x => x.code).join('+');
    md += `| ${r.seed} | ${r.policyId} | ${r.stallClass}${r.stallSub ? '/' + r.stallSub : ''} | ${r.maxPeak} | ${r.wave4Day == null ? '—' : 'd' + r.wave4Day} | ${r.firstDef5Day == null ? '—' : 'd' + r.firstDef5Day} | ${r.wave5Day == null ? '—' : 'd' + r.wave5Day} | ${r.endReason}:d${r.gameDays} | ${b} |\n`;
  }
  md += `\n## Blocker detail (eligible runs)\n\n`;
  for (const r of eligible) {
    md += `### ${r.policyId}-s${r.seed} (${r.stallClass}, end ${r.endReason}:d${r.gameDays})\n`;
    for (const b of r.blockers.blockers) md += `- ${b.code}: ${b.note}\n`;
  }
  fs.writeFileSync(path.join(outDir, 'w5doormeasure-stall-attribution.md'), md);
  console.log(`n=${runs.length} stall=${JSON.stringify(stallDist)} blockers=${JSON.stringify(blockerDist)}`);
  console.log(`PRIMARY: eligible=${eligible.length} unattributed=${unattributed.length} → ${unattributed.length === 0 ? 'GO' : 'NO-GO FAIL LOUD'}`);
  if (unattributed.length) {
    console.error('UNATTRIBUTED RUNS: ' + unattributed.map(r => `${r.policyId}-s${r.seed}`).join(', '));
    return { exitCode: 1, summary };
  }
  return { exitCode: 0, summary };
}

function main() {
  try {
    const r = runCorpus(EVID, OUTD);
    if (r.exitCode) process.exit(r.exitCode);
  } catch (e) { console.error('ANALYZER CRASH:', e); process.exit(2); }
}

module.exports = { classify, attemptsOf, attributeBlockers, legPacing, killAnatomy, earnersMortality, decoupling, attribute, runCorpus };

if (require.main === module) { main(); }
