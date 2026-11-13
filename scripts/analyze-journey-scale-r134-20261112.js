#!/usr/bin/env node
// analyze-journey-scale-r134-20261112.js — journey-scale r134 analyzer
// (lane A, leg 3 SCALE). Reads the r134 panel corpora and judges the
// prereg's binding questions from files, not from log memory:
//
//   Q1 SPOKEN-RAISE: 0 spoken-but-unanswerable raise talks AND >=1
//     properly-answered talk. The classifier splits not-offered by
//     whether the raise line is in the transcript: not-offered-spoken
//     is the DEFECT (heard, never offered an answer); not-offered-
//     unspoken is the correct r132 hold. The Claudete guard also stays:
//     an accept YOU line with the raise never spoken is a defect.
//   Q2 DAILY-PLAY MIME (read-only): mimes shown in daily play vs
//     nv:accept/betrayal:accept taken in daily play, from the capture
//     + the betray watch. Expected 0 daily accepts — the gap, confirmed.
//     Verdict recorded, never a gate (no fail change).
//   Q3 TRAJECTORY SHAPE: lived-days total within +/-25% of the r133
//     band's 491; no alive/dead flip without an attributed cause;
//     lesser seat priced >=3/4. Vetbar kept as a guard (zero days where
//     readiness veterans != ladder veterans per wave 4 and wave 5;
//     shadow old-rule counts reported per seed, phantom-days = shadow
//     > fixed).
//   Q4 GUARDS (kept from r133, not the r134 bars): trap-line — a mime
//     shown with no gesture answer at turn 0 is a regression in the
//     shared menu code; betrayal sibling — every turn-0 betrayal:accept
//     offer must have its invite label in the same sitting's opening
//     THEM lines. (The Thabo r132 verdict — NOT a defect, the driver
//     log under-reported — is pinned by the proof test §8.)
//   Q5 CENSUS: per-seed rollup (ladder stage, lesser/full seat, national,
//     deaths by cause, books close).
//
// Usage: node scripts/analyze-journey-scale-r134-20261112.js [EVIDIR]
//   EVIDIR defaults to evidence/2026-11-12/journey-scale-r134.
// Exit 0 = GO; exit 1 = NO-GO (any disagreement on the fixed engine, any
// defect talk, or a missing/corrupt corpus); exit 2 = INCOMPLETE (no raise
// talks in the band — no wild evidence for Q1; the proof test is the
// evidence).
'use strict';
const fs = require('fs');
const path = require('path');
const EVIDIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'evidence', '2026-11-12', 'journey-scale-r134');
const SEEDS = [134101, 134102, 134103, 134104];
const R133_LIVED_DAYS = 491; // r133 band total (lived-days per the r133 run note), prereg Q3 control
let fail = 0;
function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.log('MISSING/CORRUPT: ' + p + ' — ' + (e && e.message)); fail = 1; return null; }
}
let livedTotal = 0;
const rows = [];
for (const seed of SEEDS) {
  const vb = readJson(path.join(EVIDIR, `journey-scale-r134-vetbar-${seed}.json`));
  const tr = readJson(path.join(EVIDIR, `journey-scale-r134-trust-${seed}.json`));
  if (!vb || !tr) { rows.push({ seed, error: true }); continue; }
  const daily = vb.daily || [];
  const disagree4 = daily.filter(r => r.r4 !== r.l3);
  const disagree5 = daily.filter(r => r.r5 !== r.l4);
  const ph4 = daily.filter(r => (r.shadow4 | 0) > (r.r4 | 0));
  const ph5 = daily.filter(r => (r.shadow5 | 0) > (r.r5 | 0));
  const maxR4 = daily.reduce((m, r) => Math.max(m, (r.r4 | 0)), 0);
  const maxL3 = daily.reduce((m, r) => Math.max(m, (r.l3 | 0)), 0);
  const maxR5 = daily.reduce((m, r) => Math.max(m, (r.r5 | 0)), 0);
  const maxL4 = daily.reduce((m, r) => Math.max(m, (r.l4 | 0)), 0);
  const bloodedDays = daily.filter(r => r.blooded).length;
  const c = tr.census || {};
  const lc = c.ladderChain || {};
  const dc = c.deathCensus || {};
  livedTotal += (c.day | 0);
  rows.push({
    seed, days: c.day, over: !!c.over, won: !!c.won, pop: (c.popAlive | 0) + '/' + (c.popTotal | 0),
    vetbarRows: daily.length, disagree4: disagree4.length, disagree5: disagree5.length,
    phantomDays4: ph4.map(r => r.day), phantomDays5: ph5.map(r => r.day),
    maxR4, maxL3, maxR5, maxL4, bloodedDays,
    peakStage: lc.peakStage, stage3Day: lc.stage3Day, lesserDay: lc.seatLesserDay, fullDay: lc.seatFullDay,
    capstoneReady: lc.capstoneReady, capstoneDelivered: lc.capstoneDelivered,
    fights: lc.fights, fightsByWave: lc.fightsByWave,
    deaths: dc.deaths, byCause: dc.byCause, booksClose: !!dc.booksClose,
    unattributed: dc.unattributed, teleOnly: dc.teleOnly,
    rank: c.scaleRank,
  });
}
console.log('=== journey-scale r134 — Q3 GUARD: VETBAR ===');
for (const r of rows) {
  if (r.error) { console.log(`seed ${r.seed}: ERROR (corpus missing)`); continue; }
  console.log(`seed ${r.seed}: vetbarRows=${r.vetbarRows} disagree4=${r.disagree4} disagree5=${r.disagree5} phantomDays4=[${r.phantomDays4.join(',')}] phantomDays5=[${r.phantomDays5.join(',')}] maxR4=${r.maxR4} maxL3=${r.maxL3} maxR5=${r.maxR5} maxL4=${r.maxL4} bloodedDays=${r.bloodedDays}`);
}
const totalDis = rows.reduce((m, r) => m + ((r.disagree4 | 0) + (r.disagree5 | 0)), 0);
console.log(`Q3 VETBAR GUARD: ${totalDis === 0 ? 'GO' : 'NO-GO'} (total disagreements ${totalDis})`);
if (totalDis !== 0) fail = 1;
console.log('\n=== journey-scale r134 — Q3 TRAJECTORY SHAPE ===');
console.log(`lived-days total ${livedTotal} vs r133 band ${R133_LIVED_DAYS} (${(((livedTotal - R133_LIVED_DAYS) / R133_LIVED_DAYS) * 100).toFixed(1)}%; guardrail +/-25%)`);
const within = Math.abs(livedTotal - R133_LIVED_DAYS) / R133_LIVED_DAYS <= 0.25;
console.log(`Q3 lived-days guardrail: ${within ? 'HOLD' : 'BREACH'}`);
const lesserCount = rows.filter(r => !r.error && r.lesserDay != null).length;
console.log(`lesser seat priced: ${lesserCount}/4 (bar >=3/4): ${lesserCount >= 3 ? 'HOLD' : 'BREACH'}`);
if (!within || lesserCount < 3) fail = 1;
console.log('\n=== journey-scale r134 — Q5 CENSUS ===');
for (const r of rows) {
  if (r.error) { console.log(`seed ${r.seed}: ERROR`); continue; }
  console.log(`seed ${r.seed}: days=${r.days} over=${r.over} won=${r.won} pop=${r.pop} rank=${r.rank} peakStage=${r.peakStage} stage3=${r.stage3Day == null ? '-' : 'd' + r.stage3Day} lesser=${r.lesserDay == null ? '-' : 'd' + r.lesserDay} full=${r.fullDay == null ? '-' : 'd' + r.fullDay} ready=${JSON.stringify(r.capstoneReady)} delivered=${r.capstoneDelivered ? (r.capstoneDelivered.kind + '@d' + r.capstoneDelivered.day) : '-'} fights=${r.fights} byWave=${JSON.stringify(r.fightsByWave)} deaths=${r.deaths} byCause=${JSON.stringify(r.byCause)} booksClose=${r.booksClose} unattributed=${r.unattributed} teleOnly=${r.teleOnly}`);
}

console.log('\n=== journey-scale r134 — Q1 SPOKEN-RAISE (not-offered split) ===');
// Q1 classifier (prereg): the raisetalk file's header carries the policy's
// outcome ('accepted' | 'counter' | 'not-offered' | 'talk-failed' |
// 'error'). The split is on whether the raise line is in the transcript:
//   not-offered + raise SPOKEN  = DEFECT (heard, never offered an answer
//     — the Henry 133101 shape the r134 fix addresses).
//   not-offered + raise UNSPOKEN = correct r132 hold (never heard, never
//     offered — the bookkeeping survives, the human moment was never there).
//   accepted (+ the accept YOU line after the raise) = properly answered.
//   counter = a proper counter (the village countered the proposal).
//   talk-failed / error = reported, not a defect (the sitting never opened).
// The Claudete guard also stays: an accept YOU line with the raise never
// spoken before it is a defect whatever the outcome field says.
const RAISE_LINE = /We should link with .* — we'd be stronger together\./;
const ACCEPT_LINE = /^YOU: "All right\. Let's ask them\."$/;
let talkTotal = 0, defectTalks = [], properTalks = 0, notOfferedSpoken = 0, notOfferedUnspoken = 0, counters = 0, failed = 0;
for (const seed of SEEDS) {
  let files = [];
  try { files = fs.readdirSync(EVIDIR).filter(f => f.startsWith(`journey-scale-r134-raisetalk-${seed}-`) && f.endsWith('.txt')).sort(); } catch (e) { files = []; }
  for (const f of files) {
    let text = '';
    try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
    const header = (text.split('\n')[0] || '');
    const outcome = (header.match(/outcome (\S+)/) || [])[1] || '?';
    const lines = text.split('\n').slice(1).filter(l => l.trim() !== '');
    talkTotal += 1;
    let raiseSpoken = false, raiseSpokenBeforeAccept = false, acceptIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (/^THEM:/.test(l) && RAISE_LINE.test(l)) { raiseSpoken = true; if (acceptIdx === -1) raiseSpokenBeforeAccept = true; }
      if (ACCEPT_LINE.test(l.trim())) { acceptIdx = i; break; }
    }
    if (acceptIdx >= 0 && !raiseSpokenBeforeAccept) {
      defectTalks.push(`${f} (Claudete: accept at line ${acceptIdx + 1}, raise never spoken; outcome ${outcome})`);
    } else if (outcome === 'not-offered' && raiseSpoken) {
      notOfferedSpoken += 1;
      defectTalks.push(`${f} (not-offered-spoken: raise heard, no link:accept offered)`);
    } else if (outcome === 'not-offered') {
      notOfferedUnspoken += 1;
    } else if (outcome === 'accepted') {
      properTalks += 1;
    } else if (outcome === 'counter') {
      counters += 1;
    } else {
      failed += 1;
      console.log(`  note: ${f} outcome ${outcome} (talk-failed/error — reported, not a defect)`);
    }
  }
}
console.log(`raise talks: ${talkTotal} (properly-answered ${properTalks}, counter ${counters}, not-offered-spoken ${notOfferedSpoken} [DEFECT], not-offered-unspoken ${notOfferedUnspoken} [correct hold], failed/error ${failed}, defect ${defectTalks.length})`);
for (const d of defectTalks) console.log('  DEFECT: ' + d);
const q1go = defectTalks.length === 0 && properTalks >= 1;
if (talkTotal === 0) {
  console.log('Q1 SPOKEN-RAISE VERDICT: INCOMPLETE (no raise talks in the band — no wild evidence; the proof test is the evidence)');
  fail = 2;
} else {
  console.log(`Q1 SPOKEN-RAISE VERDICT: ${q1go ? 'GO' : 'NO-GO'} (zero not-offered-spoken AND >=1 properly-answered talk)`);
  if (!q1go) fail = 1;
}

console.log('\n=== journey-scale r134 — Q4 GUARD: TRAP-LINE (r133 fix still live) ===');
// A trap-line sitting is a -nv transcript whose opening shows the mime
// ("(They mime walking — ...)"). It is a DEFECT sitting iff the mime was
// shown and the turn-0 menu offered NO gesture answer (nv:accept /
// nv:decline) — the Tarek/Mario shape. It is ANSWERED iff the policy
// picked nv:accept or nv:decline in the sitting. The turn-0 choices line
// is the offered menu; the YOU lines are the picks.
const MIME_RX = /mime walking/;
const NV_ANSWER_RX = /^YOU: \[(nv:accept|nv:decline)\]/;
let trapTotal = 0, trapAnswered = 0, trapDefect = [];
let mimeInCapture = 0;
const mimeBySeed = {}; // Q2: per-seed {capture, nv} mime counts (daily-play estimate = capture - nv)
for (const seed of SEEDS) {
  let files = [];
  try { files = fs.readdirSync(EVIDIR).filter(f => f.startsWith(`journey-scale-r134-transcript-${seed}-day`) && f.endsWith('-nv.txt')).sort(); } catch (e) { files = []; }
  let nvMimes = 0;
  for (const f of files) {
    let text = '';
    try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
    if (!MIME_RX.test(text)) continue;
    trapTotal += 1;
    nvMimes += 1;
    const lines = text.split('\n');
    const turn0 = lines.find(l => l.indexOf('(turn0 choices:') !== -1) || '';
    const offered = /nv:accept/.test(turn0) || /nv:decline/.test(turn0);
    const answered = lines.some(l => NV_ANSWER_RX.test(l.trim()));
    if (answered) trapAnswered += 1;
    if (!offered) trapDefect.push(`${f} (mime shown, no nv:accept/nv:decline at turn 0; choices: ${turn0.trim().slice(0, 160)})`);
    console.log(`  ${f}: mime shown, offered=${offered ? 'yes' : 'NO'}, answered=${answered ? 'yes' : 'no'}`);
  }
  try {
    const cap = fs.readFileSync(path.join(EVIDIR, `journey-scale-r134-capture-${seed}.txt`), 'utf8');
    const capMimes = (cap.match(/mime walking/g) || []).length;
    mimeInCapture += capMimes;
    mimeBySeed[seed] = { capture: capMimes, nv: nvMimes };
  } catch (e) { mimeBySeed[seed] = { capture: 0, nv: nvMimes }; }
}
console.log(`trap-line sittings (nonverbal transcripts): ${trapTotal} (answered ${trapAnswered}, defect ${trapDefect.length}); mimes anywhere in the say-capture: ${mimeInCapture}`);
for (const d of trapDefect) console.log('  DEFECT: ' + d);
if (trapTotal === 0) {
  // GUARD, not the r134 bar: no mime in the band means nothing to
  // regress-check — silent, not INCOMPLETE (Q1's evidence is the raise
  // talks, not the trap line).
  console.log('Q4 TRAP-LINE GUARD: SILENT (no mime shown in the band — nothing to regress-check)');
} else {
  const guardGo = trapDefect.length === 0 && trapAnswered >= 1;
  console.log(`Q4 TRAP-LINE GUARD: ${guardGo ? 'HOLD' : 'BREACH'} (zero defect sittings AND >=1 answered sitting)`);
  if (!guardGo) fail = 1;
}

console.log('\n=== journey-scale r134 — Q2 DAILY-PLAY MIME (read-only) ===');
// Q2 (read-only, never a gate): in DAILY play — not the driver's d90/d120
// sittings — does a no-shared-words villager's mimed invitation ever get
// answered now that r133's nv:accept exists? The daily-play chooser
// (conversation-pages.js + per-policy pickTalkChoice, shared across lanes)
// never takes betrayal:accept / nv:accept, so a mimed invite in daily play
// is still left unanswered and re-mimed next sitting. Counts, from files:
//   daily-play mimes ~= capture mimes - driver-sitting (-nv transcript)
//     mimes. The capture collects say lines from the whole run (daily +
//     driver); the -nv transcripts are the driver's nonverbal sittings.
//     An estimate: the capture dedups consecutive identical lines.
//   daily-play accepts: the betray watch is day-attributed, but its
//     accept/nvaccept events are pushed ONLY from the driver's
//     runConversation (d90/d120 + probe days) — so any accept event on a
//     day OUTSIDE the driver days would be a daily-play accept (by
//     construction this is 0; the watch cannot see daily play). The
//     INDEPENDENT signal is the capture: resolveInvite walk lines ("You
//     walk to ...", "It's quiet at ...", "shows you where they go to
//     think", "Halfway to ... freezes", "the ground is torn up") — each
//     accept that resolves via resolveInvite speaks exactly one (sick
//     outcomes and armed ambushes do not). walkLines - driverAccepts is
//     a LOWER bound on daily-play accepts: >0 proves daily accepts
//     happened; 0 proves none (a daily accept could still hide behind a
//     sick/ambush driver accept, but nothing in the capture shows one).
//   Baraka re-check: the comm-'none' villagers seen in the -nv
//     transcripts (name + vid from the transcript header) and their
//     mime/answer status. No Baraka-like case = INCONCLUSIVE, as r130–r133.
// Verdict recorded with the counts; no build claimed; no fail change.
const CONVO_DAYS = [90, 120];
const WALK_RX = /You walk to .* with |It's quiet at |shows you where they go to think|Halfway to .* freezes|the ground is torn up/;
let dailyMimes = 0, driverAccepts = 0, dailyAcceptEvents = [], walkLines = 0;
const nvVillagers = {}; // vid -> {name, mime, answered}
for (const seed of SEEDS) {
  const mb = mimeBySeed[seed] || { capture: 0, nv: 0 };
  dailyMimes += Math.max(0, mb.capture - mb.nv);
  let capText = '';
  try { capText = fs.readFileSync(path.join(EVIDIR, `journey-scale-r134-capture-${seed}.txt`), 'utf8'); } catch (e) {}
  walkLines += capText.split('\n').filter(l => WALK_RX.test(l)).length;
  let files = [];
  try { files = fs.readdirSync(EVIDIR).filter(f => f.startsWith(`journey-scale-r134-transcript-${seed}-day`) && f.endsWith('-nv.txt')).sort(); } catch (e) { files = []; }
  for (const f of files) {
    let text = '';
    try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
    const hm = (text.split('\n')[0] || '').match(/conversation with (.+) \(([^)]+)\)/);
    const nm = hm ? hm[1] : f, vid = hm ? hm[2] : f;
    const mime = MIME_RX.test(text);
    const answered = text.split('\n').some(l => NV_ANSWER_RX.test(l.trim()));
    if (!nvVillagers[vid]) nvVillagers[vid] = { name: nm, mime: false, answered: false };
    if (mime) nvVillagers[vid].mime = true;
    if (answered) nvVillagers[vid].answered = true;
  }
  try {
    const bet = fs.readFileSync(path.join(EVIDIR, `journey-scale-r134-betray-${seed}.txt`), 'utf8');
    for (const l of bet.split('\n')) {
      const m = l.match(/^d(\d+) (accept|nvaccept) /);
      if (!m) continue;
      driverAccepts += 1;
      if (!CONVO_DAYS.includes(parseInt(m[1], 10))) dailyAcceptEvents.push(`${seed}: ${l.trim()}`);
    }
  } catch (e) {}
}
const dailyAcceptLower = Math.max(0, walkLines - driverAccepts);
console.log(`daily-play mimes (capture minus driver -nv): ${dailyMimes} (capture ${mimeInCapture}, driver -nv ${trapTotal})`);
console.log(`driver-sitting accepts (betray watch): ${driverAccepts}; accept events on non-driver days: ${dailyAcceptEvents.length}`);
for (const d of dailyAcceptEvents) console.log('  DAILY ACCEPT: ' + d);
console.log(`resolveInvite walk lines in capture: ${walkLines}; daily-play accept LOWER bound (walk lines minus driver accepts): ${dailyAcceptLower}`);
console.log(`comm-'none' villagers seen in -nv transcripts: ${Object.keys(nvVillagers).length}`);
for (const vid of Object.keys(nvVillagers)) {
  const v = nvVillagers[vid];
  console.log(`  ${v.name} (${vid}): mime shown=${v.mime ? 'yes' : 'no'}, answered=${v.answered ? 'yes' : 'no'}`);
}
if (Object.keys(nvVillagers).length === 0) console.log('  Baraka re-check: INCONCLUSIVE (no comm-\'none\' villager in the band — no Baraka-like case, as r130–r133)');
console.log(`Q2 DAILY-PLAY MIME: RECORDED (read-only — daily mimes ${dailyMimes}, daily accepts proven ${dailyAcceptLower} by the capture lower bound, ${dailyAcceptEvents.length} off-day events in the betray watch; lane decision owed: teach the shared chooser to take betrayal:accept + nv:accept when offered, or keep proving fixes only where the driver looks)`);

console.log('\n=== journey-scale r134 — Q4 GUARD: BETRAYAL SIBLING (invite label in the opening) ===');
// Every turn-0 betrayal:accept offer in the d90/d120 transcripts must
// have its invite label in the same sitting's opening THEM lines (the
// lines before the first YOU pick — opener + the "(opening: N THEM
// lines)" block the r134 driver logs). A label is one of the five
// INVITE_DEFS labels. An offer with no label in the opening is a live
// defect (answering an invitation never extended); an offer WITH the
// label is the Thabo shape — honest, not a defect.
const INVITE_LABEL_RX = /Walk with me\?|Help me haul something back\?|Come get air with me|Come see what I found|Walk my trap line with me\?/;
let betrayOffers = 0, betrayDefect = [];
for (const seed of SEEDS) {
  let files = [];
  try { files = fs.readdirSync(EVIDIR).filter(f => f.startsWith(`journey-scale-r134-transcript-${seed}-day`) && f.endsWith('.txt')).sort(); } catch (e) { files = []; }
  for (const f of files) {
    let text = '';
    try { text = fs.readFileSync(path.join(EVIDIR, f), 'utf8'); } catch (e) { continue; }
    const lines = text.split('\n');
    const turn0Idx = lines.findIndex(l => l.indexOf('(turn0 choices:') !== -1);
    if (turn0Idx === -1) continue;
    if (!/betrayal:accept/.test(lines[turn0Idx])) continue;
    betrayOffers += 1;
    const opening = lines.slice(0, turn0Idx).filter(l => /^THEM:/.test(l)).join('\n');
    const hasLabel = INVITE_LABEL_RX.test(opening);
    console.log(`  ${f}: turn-0 betrayal:accept offered, invite label in opening=${hasLabel ? 'yes' : 'NO'}`);
    if (!hasLabel) betrayDefect.push(`${f} (betrayal:accept at turn 0, no invite label in the opening THEM lines)`);
  }
}
console.log(`betrayal turn-0 offers: ${betrayOffers} (defect ${betrayDefect.length})`);
for (const d of betrayDefect) console.log('  DEFECT: ' + d);
if (betrayDefect.length !== 0) fail = 1;
console.log(`Q4 BETRAYAL GUARD: ${betrayDefect.length === 0 ? 'HOLD (no live defect; Thabo verdict stands)' : 'BREACH'}`);

process.exit(fail);
