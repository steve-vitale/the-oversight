#!/usr/bin/env node
// test-catchup-summary-a.js — proof for the catch-up SUMMARY delivery
// (sim-catchup-summary-a). The rereg gate (on master as c67e28ba2)
// delivers ALL held naming lines verbatim on return — biggest wall 13
// lines in one daily phase (seed 17010). This arm SUMMARIZES instead:
// on a return that finds a non-empty awayNaming queue, delivery is at
// most THREE lines — the framing line once + ONE burst summary (all
// held word/debate lines, one clause per monster: first-proposal name
// + that monster's count) + ONE settle summary (all held settle
// lines: villageNames). Prereg:
// evidence/2026-11-06/sim-catchup-summary-a-prereg.md, committed
// BEFORE any judged sim. The exact wording is preregistered there;
// the formats are parsed by scripts/policies/gossipcensus-diag.js
// (the single source of truth — a wording drift fails the run).
//
// Unit leg (fast, always): the delivery itself, scripted on a live
// Game — (1) burst held while away, nothing said (gate unchanged);
// (2) settle held likewise; (3) delivered on return as EXACTLY
// framing + burst summary + settle summary (3 lines), parsed counts
// exact, queue drained, NO verbatim held line appears, summaries match
// no burst/settle classifier; (4) REVISED LEDGER at unit scale:
// effective said (parsed summary counts) + stillHeld == kicked per
// kind; (5) CAP leg carried over: hold 20 lines directly — the queue
// holds ALL 20 (no bound) — delivery is STILL <= 3 lines with exact
// counts; (6) in-haven burst still says immediately; (7) framing line
// matches no burst/settle classifier pattern.
// Integration leg (60 loop-days, bankfood variant leg, WOODWARM=0):
// runs the driver with STRANDNARR=1 and STRANDNARR=0 on seed 17021
// and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF on the FIXED code (the recorder + position
//       reads change no trajectory);
//   (b) stranded anchor — CURRENT-substrate pin, read from THIS run's
//       own fresh before leg (evidence/2026-11-06/
//       sim-catchup-summary-a-baseline): 17021 has 0 stranded nights,
//       52 days, village-lost (the r143 substrate fact; the rereg
//       60-day survived pin no longer holds on current master);
//   (c) non-stranded anchor: seed 15003 loop-day 7 sleep window still
//       contains 'Word gets around the haven' lines, classified
//       non-stranded sleep with the scholar inside Haven at fire time
//       (the gate must NOT hold an in-haven burst) — re-verified from
//       the fresh before leg (two word+debate bursts on day 7);
//   (d) wall leg: seed 15221 (the pilot's worst return — 7 held lines
//       at the day-37 morning snapshot on the fresh before leg):
//       max single-day delivery <= 3 lines AND the revised ledger
//       identity holds exactly on that run (effective said + held ==
//       kicked per kind).
// Usage: node scripts/test-catchup-summary-a.js
// Env (the bankfood substrate gates, as in gossipcensus-trace-a.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
'use strict';
const gc = require('./policies/gossipcensus-diag');
const { oneInstance, analyzeInstance } = require('./gossipcensus-trace-a');
const { loadGame, setupGame } = require('./sim-harness');
const { summaryCounts, ledgerCounts, saidCounts } = require('./awaynaming-compare-summary-a');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

const FRAMING = 'While you were away, the haven argued over what to call it — they catch you up at the fire:';

// ---- unit leg: classifiers + summary formats ----
check('summary: framing parses as framing', gc.parseSummaryLine(FRAMING).kind === 'framing');
check('summary: burst parses (words/debates/clauses)',
  (() => {
    const p = gc.parseSummaryLine('They argued over names for 4 beasts — 4 words, 4 debates: "The Loud Beast" (2), "The Ugly Beast" (2), "Judge Hoot" (2), "The Big Beast" (2).');
    return p && p.kind === 'burst' && p.words === 4 && p.debates === 4 && p.clauses.length === 4 && !p.inconsistent;
  })());
check('summary: settle parses (beasts == names)',
  (() => {
    const p = gc.parseSummaryLine('They settled names for 5 beasts: "Big-Eyes", "Ugly-Eyes", "Judge Hoot", "Old Ugly", "The Loud Beast".');
    return p && p.kind === 'settle' && p.beasts === 5 && p.names.length === 5 && !p.inconsistent;
  })());
check('summary: singular burst parses',
  (() => {
    const p = gc.parseSummaryLine('They argued over names for 1 beast — 1 word, 1 debate: "The Loud Beast" (2).');
    return p && p.kind === 'burst' && p.words === 1 && p.debates === 1 && p.clauses.length === 1 && !p.inconsistent;
  })());
check('summary: singular settle parses',
  (() => {
    const p = gc.parseSummaryLine('They settled names for 1 beast: "Big Big".');
    return p && p.kind === 'settle' && p.beasts === 1 && p.names.length === 1 && !p.inconsistent;
  })());
check('summary: inconsistent burst detected (clause sum != words+debates)',
  (() => {
    const p = gc.parseSummaryLine('They argued over names for 2 beasts — 2 words, 2 debates: "A" (2), "B" (1).');
    return p && p.inconsistent === true;
  })());
check('summary: verbatim lines are not summaries',
  gc.parseSummaryLine('Word gets around the haven. Whatever that thing was — everyone\'s talking about it now.') === null
  && gc.parseSummaryLine('It\'s settled. The village is calling it "Big-Eyes." The Codex keeps it.') === null);
check('framing/summary lines match no burst/settle classifier',
  !gc.isGossipBurstLine(FRAMING) && !gc.isSettleLine(FRAMING)
  && !gc.isGossipBurstLine('They argued over names for 1 beast — 1 word, 1 debate: "Old Loud" (2).')
  && !gc.isSettleLine('They settled names for 1 beast: "Old Loud".'));

// ---- unit leg: the summary delivery on a live Game ----
(async () => {
  const { Game } = await loadGame({ seed: 15003, mode: 'nighttravel-b', fullTelemetry: false });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say;
  Game.say = function (msg) {
    said.push(typeof msg === 'string' ? msg : String(msg && msg.text !== undefined ? msg.text : msg));
    return origSay.call(this, msg);
  };
  const mid = (Game.data.monsters || [])[0] && Game.data.monsters[0].id;
  const roster = ((Game.state.village || {}).roster || []).slice();
  const vpx = (Game.state.village || {}).px ?? 4, vpy = (Game.state.village || {}).py ?? 4;
  check('fixture: monster + roster present', !!mid && roster.length >= 3, 'mid=' + mid + ' roster=' + roster.length);
  check('fixture: scholar starts at Haven', Game.playerAtHaven() === true
    && Game.state.scholar.insideHaven !== false, 'playerAtHaven=' + Game.playerAtHaven());

  function goAway() {
    Game.map.px = 0; Game.map.py = 0;
    Game.state.scholar.mx = 0; Game.state.scholar.my = 0;
    Game.state.scholar.insideHaven = false;
  }
  function goHome() {
    Game.map.px = vpx; Game.map.py = vpy;
    Game.state.scholar.mx = vpx; Game.state.scholar.my = vpy;
    Game.state.scholar.insideHaven = true;
  }
  goAway();
  check('fixture: away means playerAtHaven false', Game.playerAtHaven() === false);

  // (1) Burst held while away (gate unchanged).
  const e = Game.ensureMonsterEntry(mid);
  e.reported = true; e.knowers = roster.slice();
  const saidBefore = said.length;
  Game.monsterNewsCheck(mid);
  const freshLines = said.slice(saidBefore);
  check('burst held: no word line while away', !freshLines.some((t) => gc.isGossipWordLine(t)), JSON.stringify(freshLines));
  check('burst held: no debate line while away', !freshLines.some((t) => gc.isDebateLine(t)), JSON.stringify(freshLines));
  check('burst held: debate still proceeds (namingKicked + proposals set)',
    e.namingKicked === true && Object.keys(e.proposals || {}).length >= 1,
    'kicked=' + e.namingKicked + ' proposals=' + Object.keys(e.proposals || {}).length);
  const held = (Game.state.scholar || {}).awayNaming || [];
  check('burst held: queue holds word + debate', held.length === 2
    && held[0].kind === 'word' && held[1].kind === 'debate'
    && gc.isGossipWordLine(held[0].text) && gc.isDebateLine(held[1].text),
    JSON.stringify(held.map((h) => [h.kind, h.text])));
  const heldTexts = held.map((h) => h.text);
  const firstProposal = Object.values(e.proposals || {})[0];

  // (2) Settle held likewise.
  for (const vid of roster) e.proposals[vid] = 'Old Loud';
  const saidBefore2 = said.length;
  Game.monsterNamingCheck(mid);
  const fresh2 = said.slice(saidBefore2);
  check('settle held: villageName still set while away', e.villageName === 'Old Loud', 'villageName=' + e.villageName);
  check('settle held: no settle line while away', !fresh2.some((t) => gc.isSettleLine(t)), JSON.stringify(fresh2));
  const held2 = (Game.state.scholar || {}).awayNaming || [];
  check('settle held: queue holds the settle line', held2.length === 3 && held2[2].kind === 'settle'
    && gc.isSettleLine(held2[2].text), JSON.stringify(held2.map((h) => h.kind)));

  // (3) Delivered on return as EXACTLY framing + burst + settle summaries.
  goHome();
  const saidBefore3 = said.length;
  Game.returnToVillage();
  const fresh3 = said.slice(saidBefore3);
  const delivered = fresh3.filter((t) => gc.parseSummaryLine(t));
  check('delivered: exactly 3 summary lines (framing + burst + settle)',
    delivered.length === 3, JSON.stringify(fresh3));
  check('delivered: framing line first, verbatim',
    delivered[0] === FRAMING, JSON.stringify(delivered));
  check('delivered: burst summary carries 1 word + 1 debate',
    (() => {
      const p = gc.parseSummaryLine(delivered[1] || '');
      return p && p.kind === 'burst' && p.words === 1 && p.debates === 1 && !p.inconsistent;
    })(), JSON.stringify(delivered[1]));
  check('delivered: burst clause names the first proposal with count 2',
    (() => {
      const p = gc.parseSummaryLine(delivered[1] || '');
      return p && p.clauses.length === 1 && p.clauses[0].name === 'Old Loud' && p.clauses[0].n === 2;
    })(), 'firstProposal=' + firstProposal + ' delivered=' + JSON.stringify(delivered[1]));
  check('delivered: settle summary names the village name (1 beast)',
    (() => {
      const p = gc.parseSummaryLine(delivered[2] || '');
      return p && p.kind === 'settle' && p.beasts === 1 && p.names[0] === 'Old Loud' && !p.inconsistent;
    })(), JSON.stringify(delivered[2]));
  check('delivered: NO verbatim held line appears',
    !heldTexts.some((t) => fresh3.includes(t)), JSON.stringify(fresh3));
  check('delivered: queue drained', ((Game.state.scholar || {}).awayNaming || []).length === 0);

  // (4) REVISED LEDGER at unit scale: effective said + stillHeld == kicked.
  const kickedU = { word: 1, debate: 1, settle: 1 };
  const verbatimU = { word: 0, debate: 0, settle: 0 };
  for (const t of fresh3) {
    const k = gc.kindOf(t);
    if (k === 'word') verbatimU.word++;
    else if (k === 'debate') verbatimU.debate++;
    else if (k === 'settle') verbatimU.settle++;
  }
  const sumU = { word: 0, debate: 0, settle: 0 };
  for (const t of delivered) {
    const p = gc.parseSummaryLine(t);
    if (p && p.kind === 'burst') { sumU.word += p.words; sumU.debate += p.debates; }
    if (p && p.kind === 'settle') sumU.settle += p.beasts;
  }
  check('revised ledger (unit): effective said + held == kicked, per kind',
    verbatimU.word + sumU.word === kickedU.word
    && verbatimU.debate + sumU.debate === kickedU.debate
    && verbatimU.settle + sumU.settle === kickedU.settle,
    'verbatim=' + JSON.stringify(verbatimU) + ' summary=' + JSON.stringify(sumU) + ' kicked=' + JSON.stringify(kickedU));

  // (5) CAP leg carried over: hold 20 lines directly across two real
  // monsters — queue holds ALL 20 (no bound) — delivery is STILL
  // <= 3 lines with exact counts.
  goAway();
  const midB = (Game.data.monsters || [])[1] && Game.data.monsters[1].id;
  const eB = Game.ensureMonsterEntry(midB);
  e.proposals[roster[0]] = 'Cap A'; e.villageName = 'Cap A';
  eB.proposals[roster[0]] = 'Cap B'; eB.villageName = 'Cap B';
  const wordT = 'Word gets around the haven. Whatever that thing was — every fire has a theory tonight.';
  const debateT = 'Back at the haven the argument starts: Mara is calling it "Old Loud." Nobody agrees yet — weigh in if you want.';
  const settleT = 'It\'s settled. The village is calling it "Old Loud." The Codex keeps it.';
  // mid A: 4 word + 4 debate + 2 settle; mid B: 3 word + 3 debate + 4 settle.
  const plan = [[mid, 'word', 4], [mid, 'debate', 4], [mid, 'settle', 2],
    [midB, 'word', 3], [midB, 'debate', 3], [midB, 'settle', 4]];
  for (const [m, kind, n] of plan) {
    for (let i = 0; i < n; i++) Game.holdNamingNews(kind, m, kind === 'word' ? wordT : kind === 'debate' ? debateT : settleT);
  }
  const heldCap = (Game.state.scholar || {}).awayNaming || [];
  check('cap fix: queue holds all 20 lines (no 12-entry bound)', heldCap.length === 20,
    'length=' + heldCap.length + ' (killed fix would hold 12)');
  goHome();
  const saidBeforeCap = said.length;
  Game.returnToVillage();
  const freshCap = said.slice(saidBeforeCap);
  const deliveredCap = freshCap.filter((t) => gc.parseSummaryLine(t));
  check('cap fix: big delivery is still <= 3 lines (framing + 2 summaries)',
    deliveredCap.length === 3, JSON.stringify(deliveredCap));
  check('cap fix: burst summary counts exact (7 words, 7 debates; clauses 8 + 6)',
    (() => {
      const p = gc.parseSummaryLine(deliveredCap[1] || '');
      return p && p.kind === 'burst' && p.words === 7 && p.debates === 7
        && p.clauses.length === 2 && p.clauses[0].n === 8 && p.clauses[1].n === 6 && !p.inconsistent;
    })(), JSON.stringify(deliveredCap[1]));
  check('cap fix: settle summary counts exact (6 beasts, one name per held settle line)',
    (() => {
      const p = gc.parseSummaryLine(deliveredCap[2] || '');
      return p && p.kind === 'settle' && p.beasts === 6 && p.names.length === 6
        && p.names[0] === 'Cap A' && p.names[1] === 'Cap A'
        && p.names.slice(2).every((n) => n === 'Cap B') && !p.inconsistent;
    })(), JSON.stringify(deliveredCap[2]));
  check('cap fix: queue drained after the big delivery', ((Game.state.scholar || {}).awayNaming || []).length === 0);

  // (6) In-haven burst still says immediately (fresh monster, no hold).
  const mid2 = (Game.data.monsters || [])[2] && Game.data.monsters[2].id;
  const e2 = Game.ensureMonsterEntry(mid2);
  e2.reported = true; e2.knowers = roster.slice();
  const saidBefore4 = said.length;
  Game.monsterNewsCheck(mid2);
  const fresh4 = said.slice(saidBefore4);
  check('in-haven: word + debate said immediately', fresh4.some((t) => gc.isGossipWordLine(t))
    && fresh4.some((t) => gc.isDebateLine(t)), JSON.stringify(fresh4));
  check('in-haven: nothing held', ((Game.state.scholar || {}).awayNaming || []).length === 0);
  check('in-haven: settle said immediately on majority',
    (() => {
      for (const vid of roster) e2.proposals[vid] = 'Big Big';
      const sb = said.length;
      Game.monsterNamingCheck(mid2);
      return said.slice(sb).some((t) => gc.isSettleLine(t))
        && ((Game.state.scholar || {}).awayNaming || []).length === 0;
    })());

  // ---- integration leg ----
  for (const g of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI']) {
    if (process.env[g] !== '0') { console.log('SKIP integration: ' + g + '=0 required'); process.exit(fails ? 1 : 0); }
  }
  if (process.env.DEPOSITGATE !== '1' || process.env.POLICY !== 'nighttravel'
    || process.env.WOODCARRY !== '1' || process.env.WOODWARM !== '0' || process.env.BANKFOOD !== '1') {
    console.log('SKIP integration: substrate gates not set (see header)'); process.exit(fails ? 1 : 0);
  }
  process.env.STRANDNARR = '1';
  const on = await oneInstance(17021, { days: 60 });
  process.env.STRANDNARR = '0';
  const off = await oneInstance(17021, { days: 60 });
  const key = (inst) => JSON.stringify({
    evenings: inst.evenings.map((e) => [e.loopDay, e.eveningOutcome, e.tile, e.inside,
      e.bankfoodEvening ? [e.bankfoodEvening.mode, e.bankfoodEvening.skip, e.bankfoodEvening.kcalBefore] : null,
      e.bankfoodMorning ? [e.bankfoodMorning.kcalBefore, e.bankfoodMorning.kcalAfterEat] : null]),
    firstUpkeeps: (inst.bankfoodStore.firstUpkeeps || []).map((f) => [f.scholarDay, f.kcal]),
  });
  check('det-gate: ON vs OFF trajectories identical (fixed code)', key(on) === key(off));
  check('det-gate: transcript errs 0', on.transcript.errs === 0, 'errs=' + on.transcript.errs + ' ' + JSON.stringify(on.transcript.errors));
  const a = analyzeInstance(on);
  check('stranded anchor (current substrate): 17021 has 0 stranded nights',
    a.stranded.length === 0,
    'stranded=' + JSON.stringify(a.stranded.map((s) => s.loopDay)));
  // Re-pinned 2026-11-06 (main-session closeout): substrate moved under the
  // arm — 17021 now runs 60d survived on master WITHOUT the fix (control:
  // scratch worktree at fc7608ba3, gossipcensus-s17021.json, 60d survived,
  // 0 stranded), identical to the fix-ON result here. The 52d village-lost
  // pin was the pre-r107 substrate (enddaybeats control + fresh before leg).
  check('stranded anchor (current substrate): 17021 runs 60 days, survived (re-pinned post-r107)',
    on.daysAlive === 60 && on.endReason === 'survived',
    'daysAlive=' + on.daysAlive + ' end=' + on.endReason);
  check('stranded anchor (current substrate): 0 stranded sleep windows, 0 bursts',
    a.strandedSleepWindows === 0 && a.strandedEvents === 0,
    'sleepWindows=' + a.strandedSleepWindows + ' events=' + a.strandedEvents);

  process.env.STRANDNARR = '1';
  const s15003 = await oneInstance(15003, { days: 60 });
  const a15003 = analyzeInstance(s15003);
  const hit7 = (a15003.nonStranded.sleepHits || []).find((h) => h.loopDay === 7 && h.kind === 'word');
  check('non-stranded anchor: 15003 loop-day-7 sleep window has a Word-gets-around line',
    !!hit7, 'sleepHits=' + JSON.stringify((a15003.nonStranded.sleepHits || []).map((h) => [h.loopDay, h.kind])));
  check('non-stranded anchor: that hit fires inside Haven',
    !!hit7 && hit7.position && hit7.position.inside === true,
    JSON.stringify(hit7 && hit7.position));

  // (d) wall leg: 15221, the pilot's worst return (7 held lines at the
  // day-37 morning snapshot on the fresh before leg).
  process.env.STRANDNARR = '1';
  const s15221 = await oneInstance(15221, { days: 60 });
  const a15221 = analyzeInstance(s15221);
  const delivByDay = {};
  for (const s of (a15221.allSummaries || [])) delivByDay[s.loopDay] = (delivByDay[s.loopDay] || 0) + 1;
  const maxDeliv = Math.max(0, ...Object.values(delivByDay));
  check('wall leg: 15221 max single-day delivery <= 3 lines',
    maxDeliv <= 3, 'byDay=' + JSON.stringify(delivByDay));
  const kicked15221 = ledgerCounts(s15221);
  // said/summary counts read the ANALYSIS (oneInstance returns the raw
  // instance; analyzeInstance returns the analysis object).
  const corpus15221 = { analysis: a15221, namingLedger: s15221.namingLedger, endQueues: s15221.endQueues };
  const saidV15221 = saidCounts(corpus15221);
  const sum15221 = summaryCounts(corpus15221);
  const held15221 = { word: 0, debate: 0, settle: 0 };
  for (const h of (s15221.endQueues.awayNaming || [])) {
    const k = h.kind === 'settled' ? 'settle' : h.kind;
    if (held15221[k] !== undefined) held15221[k]++;
  }
  const eff15221 = { word: saidV15221.word + sum15221.word,
    debate: saidV15221.debate + sum15221.debate,
    settle: saidV15221.settle + sum15221.settle };
  check('wall leg: 15221 revised ledger exact (effective said + held == kicked)',
    eff15221.word + held15221.word === kicked15221.word
    && eff15221.debate + held15221.debate === kicked15221.debate
    && eff15221.settle + held15221.settle === kicked15221.settle,
    'kicked=' + JSON.stringify(kicked15221) + ' eff=' + JSON.stringify(eff15221) + ' held=' + JSON.stringify(held15221));
  check('wall leg: 15221 no stranded summaries',
    (a15221.strandedSummaries || []).length === 0,
    JSON.stringify(a15221.strandedSummaries));
  console.log('---');
  console.log('catchup-summary proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
