#!/usr/bin/env node
// journey-social-r75-20261030.js -- SOCIAL leg (leg 5), r75 (lane B).
// R75 FORK of the r74 driver. Binding prereg: evidence/2026-10-30/r75/prereg.md
// (written before any r75 seed ran). r75 = THE TARGET-AWARE WALK +
// DAWN STEP-FIRST RETRY RUN: r74's named-next items. Policy, DAYCAP,
// invite recording, dry census and opening scan are r74 verbatim; the
// ONLY changes are the r75 outing wedge (target-aware walk, hopHome
// on the walk, dawn step-first retry, midday position snapshots) and
// the funnel additions below. Fresh seeds 6501-6504, smoke 6505.
// journey-social-r73-20261030.js -- SOCIAL leg (leg 5), r73 (lane B).
// R74 FORK of the r73 driver. Binding prereg: evidence/2026-10-30/r74/prereg.md
// (written before any r74 seed ran). r74 = THE WEDGE-FIX + RAW-KEPT RUN:
// r73's named-next items. Policy, DAYCAP, invite recording, dry census
// and opening scan are r73 verbatim; the ONLY changes are the r74
// outing wedge (raw kept, d=1 walk fallback, stuck escalation,
// barrenKind, position history) and the funnel additions below.
// Fresh seeds 6401-6404, smoke 6405.
// R73 FORK of the r67 driver. Binding prereg: evidence/2026-10-30/r73/prereg.md
// (written before any r73 seed ran). r73 = THE OUTING-BOTTLENECK RUN:
// r67's named-next question (starts 4, completes 0; 40/46 start-blocks
// are the partner-adjacency reason). Policy, DAYCAP, wedge, invite
// recording, dry census + opening scan are r67 verbatim; the ONLY
// change is the r73 outing wedge (recording-only dawn diag +
// targetCanForage on forage-leg entries, zero game-behavior change).
// Fresh seeds 6301-6304, smoke 6305.
// journey-social-r67-20261029.js -- SOCIAL leg (leg 5), r67 (lane B).
// R67 FORK of the r66 driver. Binding prereg: evidence/2026-10-29/r67/prereg.md
// (written before any r67 seed ran). r67 = THE OPENING-GAP + EMPTY-TURN RUN:
// r66's named-next questions (opening dry lines escape the turn scan,
// +3 counter delta on 6102; phantom zero-entry turns unclassified).
// Policy, DAYCAP, wedge, invite recording, dry9Detail + amendment-A
// recording, and rosterByDay are r66 verbatim (fresh seeds 6201-6204,
// smoke 6205). ONE recording addition (driver-only, zero game behavior
// change): after startConvo, driveOne scans the sitting's opening
// transcript entries with the same dryPoolOf classifier and records
// openingDryLines / openingDry9Lines / openingSelf3Lines /
// openingDryTexts per convo; opening entries are also appended to
// out.transcript (the turn scan starts at beforeLen, so nothing is
// counted twice). Zero src/js in this run.
// R65 FORK of the r64 driver. Binding prereg: evidence/2026-10-29/r65/prereg.md
// (written before any r65 seed ran). r65 = THE RESIDUAL DRY9 BURDEN RUN:
// r64's named-next question. Policy, DAYCAP, wedge, invite recording,
// and dry census are r64 verbatim (fresh seeds 6001-6004, smoke 6005).
// ONE recording addition (driver-only, zero game behavior change):
// per-turn records (turn, pickId, dry9 flag, lastLine) feed a new
// dry9Detail aggregation in dryCensus — follow kind, retry outcome,
// position, and pick class per dry9 turn. See prereg Q1-Q4.
// tackle-outing (7f0e1dc41) made the joint-foraging outing playable on
// pinned fixtures; this run scores it in natural full runs via a
// driver-side favor-accept pick (forage_help wants only) + the dawn-start
// and outing-day wedges (scripts/journey-social-r65-outing-wedge.js,
// proven 14/14 on seeds 42 and 7 before seeds ran). Dry census +
// cold-open instrument are r63 verbatim (replication bars F1 <1.0/convo,
// F2 endDry <20%). The party probe is REMOVED (declared in prereg);
// the invite wrap is KEPT (recording only, descriptive census).
// Zero src/js in this run.
// journey-social-r63-20261029.js -- SOCIAL leg (leg 5), r63 (lane B).
// R63 FORK of the r62 driver. Binding prereg: evidence/2026-10-29/r63/prereg.md
// (written before any r63 seed ran). r63 = THE WILD INVITATION SCORING RUN:
// tackle-invite (89d3c1ee4) proved character decisions on pinned rolls;
// this run scores them in natural full runs via a driver-side
// npcInviteDecision recording wrap (read-only, no RNG) + a once-a-day
// party probe (invite_party picked if offered, after gossip+ans+linger).
// Dry census + cold-open instrument are r62 verbatim (replication bars
// F1 <1.0/convo, F2 endDry <20%). Zero src/js in this run.
// journey-social-r62-20261029.js -- SOCIAL leg (leg 5), r62 (lane B).
// R62 FORK of the r61 driver. Binding prereg: evidence/2026-10-29/r62/prereg.md
// (written before any r62 seed ran). r62 = THE B7 FIX-SCORING RUN:
// gap-social's B7 fix (43753f5b0, in master) exempted conversation
// grammar from the run ledger; r61's census (2.245 dry/convo, dry9
// 99.8%, endDry 65.7%) is the pre-fix baseline. This run scores B7
// against it on fresh seeds, plus the cold-open turn-0 dry instrument
// r61's metric review called for (first NPC line dry or not, per convo).
// Policy + dry-family instrumentation are r61 verbatim except seeds,
// evidence dir, and the cold-open fields. Zero src/js in this run.
// R61 FORK of the r60 driver. Binding prereg: evidence/2026-10-27/r61/prereg.md
// (written before any r61 seed ran). r61 = THE DRY-FAMILY CENSUS RUN:
// r60 counted only the train line (0.891/convo); r61 counts ALL 12
// convoDeflectionLines per conversation (driver-only, zero src/js),
// split by pool (first-9 run-ledger dry vs last-3 self-repeat),
// with preceding pick, following line, end-on-dry flag, and engine
// counter cross-check (convoGet dryLines/selfRepeatLines).
// NO src/js fix in this run: gap-social (oversight-gap-closure)
// owns the B7 dry-fallback fix; this census is its baseline.
// R60 FORK of the r59 driver. Binding prereg: evidence/2026-10-27/r60/prereg.md
// (written before any r60 seed ran). r60 = THE STALL-CENSUS RUN:
// r59 measured the stall beat ('...Sorry, lost my train of thought.')
// at 1.0 per conversation in the 5-read sense set only. r60 counts
// it across ALL conversations (driver-only instrumentation, zero
// src/js change): per-convo stall lines + preceding pick + following
// line, aggregated into r.stallCensus. Policy is r59 verbatim.
// R59 FORK of the r58 driver. Binding prereg: evidence/2026-10-26/r59/prereg.md
// (written before any r59 seed ran). r59 = THE DISPLACEMENT-FIX RUN:
// the party-trim fix (party-formal.js: 'ask:others' survives the party
// trim) measured on r58's matched seeds 5401-5404, control = r58's
// recorded per-seed JSONs. All-linger arms, seeded-speaker steering ON.
// all-linger arms + driver-side build-trace wraps (buildMenu /
// finalizeMenu / convoChoices) recording, per menu build, the entry
// state, replyMenu-cache service, and finalize in/out for
// 'ask:others' — answering r57's named question (game-side build
// trace) without any src/js change and without extra RNG-consuming
// game calls inside the wraps.
// R57 FORK of the r56 driver. Binding prereg: evidence/2026-10-26/r57/prereg.md
// (written before any r57 seed ran). r57 = THE RESIDUAL-DEEP-DIVE RUN:
// all-linger arms (control reproduced 3x, retired) + new probe flags
// (pager-owns, fresh-capped, cache-suspect, spent) splitting r56's
// 401 unexplained inBuilt=false same-pick residual.
// journey-social-r56-20261026.js -- SOCIAL leg (leg 5), r56 (lane B).
// R56 FORK of the r55 driver. Binding prereg: evidence/2026-10-26/r56/prereg.md
// (written before any r56 seed ran). r56 = THE PICK-CONVERSION +
// RESIDUAL-SPLIT RUN: (1) new probe flags (thread/reactiveQ/genericQ/
// pendingQ/inT2list) split r55's 454 inBuilt=false same-pick residual;
// (2) a linger arm (5203/5204) picks an offered-fresh 'ask:others' after
// gossip+ans, testing whether r55's 372->7 offer/pick gap is a driver-policy
// artifact. Control arm 5201/5202 = r55 policy verbatim + probe flags.
// All seeds keep seeded-speaker steering ON (not a funnel variable).
// The r55 header below is history, kept for the fork record.
// journey-social-r55-20261026.js -- SOCIAL leg (leg 5), r55 (lane B).
// PRE-REGISTERED in evidence/2026-10-26/r55/prereg.md (written before any
// r55 seed ran). r55 = THE MAIN-MENU FIX RUN for r54's split verdict
// (offers moved, picks did not — picks flow through the main menu).
//
// Leg question: does the MAIN-MENU discussed-'others' fix move natural
// late picks (r54's failed picks bar)?
//   1. THE MENU FIX (src/js/conversation.js, this run's fix): the
//      main-menu t2discussed loop exempts 'ask:others' from the
//      topicsAdded cap ('others' only — r54's mechanism: fresh + asks
//      fill topicCapMood first, so the discussed loop never fired late
//      in a run). Still bounded by MAXC and the threadAsk exclusion,
//      never while 'others' IS the current thread. Pager rank 3 (r54)
//      carries over unchanged.
//      Proof test scripts/test-journey-social-r55-main-menu.js fails
//      pre-fix, passes post-fix (demonstrated in that order).
//   2. MATCHER BROADENING (carried from r53): hist + old-rift grievance
//      forms join the grievance matcher; "doors stay closed" leaves the
//      deflection matcher (it lives inside genuine forgiven lines).
//   3. T2PICKS PERSISTENCE (carried): the full per-seed t2picks list
//      lands in the per-seed JSON, so the finer funnel split stays
//      measurable.
//   4. INBUILT PROBE (carried from r54): subject-no-offer probe turns
//      record inBuilt (whether 'ask:others' is in offeredReplies, the
//      pre-pagination built list), splitting remaining no-offer turns
//      into not-built vs built-but-paged.
//   5. CRACK CONTROL (carried): seeds split — 5101/5102 keep the daily
//      seeded-speaker steering; 5103/5104 get NO seeded-speaker steering
//      after the seed (daily natural others-steer unchanged, tagged
//      apart). Seeding itself (recordGrievance 'ambushed', 60) is the
//      same on all seeds, labeled everywhere, never blended.
//   6. KNACK BAR REVISION (carried): same-speaker repeats only;
//      cross-speaker retells reported as circulation, never counted as
//      repeats.
//   7. MENU TAG + PROBE FLAG (new): every 'others' offer/pick records
//      its menu (main vs subject); subject-no-offer probes record
//      convoSawOthers (this convo already offered/picked 'others').
// Seeds: 5101-5104 (fresh). Horizon: DAYCAP=140, death-aware.
// Policy: warm-competent + 3 gossip-first convos/day (deep mode), as
// r54, with ONE others-steered convo/day (r48 steering).
// Bindings (a miss is NO-GO, never re-scored; full text in prereg):
//   F1-picks (SAME bar r54 failed): late (d91-140) UNSTEERED others
//       picks >= 2 on >= 2/4 seeds. Steered picks excluded.
//   F1m (mechanism, new): pooled unsteered MAIN-menu 'others' offers
//       on >= 3/4 seeds, and main-menu picks the majority of late
//       unsteered picks when F1-picks passes.
//   F1a (attribution, extended): probes split by convoSawOthers;
//       convoSawOthers + served-same-pick probes are correct non-offers
//       (already asked this convo) and leave the genuine-miss count.
//   M1 formation >= 10 deep2 pairs/seed; M3-cond pooled late close-read
//       TP >= 40%; M4-REVISED same-speaker knack repeats = 0/seed;
//       M5 people: 5 transcripts sense-read, 0 fabricated-history flags.
//   M6 guardrail report-only (arena-deaths question already open).
//   NO-REGRESSION: check.js --quick green + conversation/gossip/moot
//       subset green in the worktree.
// FIX + TOOLING commit (src/js/conversation.js + this driver + proof test).
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || '/home/hatch/workspace/worktrees/journey2-social';
const OUTROOT = process.env.OUTROOT || path.join(REPO, 'evidence', '2026-10-30');
const EVIDIR = path.join(OUTROOT, 'r75');
const TDIR = path.join(EVIDIR, 'transcripts');
const SDIR = path.join(EVIDIR, 'summaries');
for (const d of [EVIDIR, TDIR, SDIR]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

const SMOKE_SEED = 6505;
// r52: 30 days, not 12 (carried from r51) — with per-day gossip-first picks eating early
// turns, 12 days is too short for queue work to reach 'others' (r50's
// 12-day smoke passed only because gossip died after 3 picks per RUN).
const SMOKE_DAYS = 30;
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [6501, 6502, 6503, 6504]).filter(Number.isFinite);
// r56 ARMS: 5201/5202 control (r55 policy verbatim + probe flags);
// 5203/5204 linger (control + linger step). ALL seeds keep seeded-speaker
// steering ON: steering is not a funnel variable (seeded-speaker convos
// are excluded from the natural funnel), so holding it constant isolates
// the linger effect. The r55 steering/no-steering crack control is not
// repeated; G1 is carried-not-gated and the seeded crack is measurable
// on all four seeds.
const ARM_OF = { 6501: 'linger', 6502: 'linger', 6503: 'linger', 6504: 'linger' };
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const GOSSIP_TARGET = 3;

// writeFileFlap (infra 2026-10-19, worsened 2026-10-23): queue all output,
// flush once at end with long EPERM retries.
const pendingWrites = [];
function queueWrite(p, data) { pendingWrites.push({ p, data }); }
// r52 CRASH-SAFETY (carried from r51) (service restart 2026-10-24 killed a run mid-seed-4702
// and the end-only flush lost seed 4701's completed outputs): flush after
// EVERY seed, and drop successfully written entries so each flush is
// incremental. A crash now loses at most the in-flight seed.
function flushWrites() {
  let ok = 0, lost = 0;
  for (let i = pendingWrites.length - 1; i >= 0; i--) {
    const { p, data } = pendingWrites[i];
    let done = false, last = null;
    for (let j = 0; j < 40 && !done; j++) {
      try { fs.writeFileSync(p, data); done = true; }
      catch (e) { last = e; if (!/EPERM/.test(String(e && e.message))) break; }
      if (!done) { const t0 = Date.now(); while (Date.now() - t0 < 3000) {} }
    }
    if (done) { ok++; pendingWrites.splice(i, 1); }
    else {
      lost++;
      console.log(`LOST-FILE (EPERM flap outlasted 40 retries): ${p} [${String(last && last.message || '').slice(0, 80)}]`);
      console.log(`LOST-HEAD ${p}: ${String(data).slice(0, 600)}`);
    }
  }
  console.log(`FLUSH: ${ok} written, ${lost} lost to EPERM flap.`);
  return lost === 0;
}

const { mulberry32, loadGame, setupGame, runDays, manifest } = require(REPO + '/scripts/sim-harness');
const { competent } = require(REPO + '/scripts/policies/competent');
const OUTWEDGE = require(REPO + '/scripts/journey-social-r75-outing-wedge');

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }

// --- bond serve-line matchers ---
function isCloseReadLine(text) {
  const t = String(text || '');
  return /trust .* with my pack|keeps me sane|notice if they stopped showing up/i.test(t);
}
// r51 MATCHER FIX: the real serve line is "I still haven't forgiven ..."
// (memdepth.js convoGrievanceLine) — r50's matcher knew only "hasn't
// forgiven", so it matched NOTHING. Added haven'?t/hasn'?t forgiven.
// r53 MATCHER BROADENING (r52 metric review): the 'other' serves were
// genuine grievance deliveries in hist-template ("rub each other wrong")
// and old-rift ("Older than the scattering") phrasing from the
// why='grievance' pool itself — not matcher misses of another kind.
function isGrievanceLine(text) {
  const t = String(text || '');
  return /haven'?t forgiven|hasn'?t forgiven|still hasn'?t forgiven|won'?t forgive|not.*forgiven|rub each other wrong|older than the scattering/i.test(t);
}
// r52 DEFLECTION matcher: a grievance-topic pick whose generated line
// deflects instead of delivering grievance content (r51 4703: "Victor?
// I'd rather not. Some doors stay closed."). Deflection lines name the
// topic and refuse it; they are NOT grievance deliveries.
// r53 DEFLECTION FIX (r52 metric review): "doors stay closed" sits INSIDE
// genuine forgiven lines ("Some doors stay closed. I still haven't
// forgiven them"), so it false-flagged deliveries as deflections. Only
// "rather not" (and kin) marks a true deflection now.
function isDeflectionLine(text) {
  const t = String(text || '');
  return /rather not|don't want to talk about|not talking about|leave that (one )?alone|some things (stay )?private/i.test(t);
}
function isKnackGossipLine(text) {
  const t = String(text || '');
  return /found a lost knife by smell|cuts close faster when|talks to the garden|stray dog|ate something last month|sees in the dark/i.test(t);
}


// R61 DEFLECTION LINES: mirror of conversation.js convoDeflectionLines()
// (quote-stripped, normalized). First 9 = run-ledger dry pool, last 3 =
// self-repeat pool. Driver-only copy: the game list is the authority;
// a mismatch here shows up as transcript lines counted in neither pool.
const DRY_LINES = [
  '...Sorry, lost my train of thought.',
  'Hm. Never mind \u2014 go on.',
  '...Actually, forget it.',
  '...Where was I? Gone. Ask me something else.',
  'Huh. That went clean out of my head.',
  "...No, it's not coming back. What were you saying?",
  'Lost it. The thought, I mean. Go on.',
  '...Sorry \u2014 that one slipped away from me.',
  "Eh. Wasn't important. Probably.",
  'I just said \u2014 did you miss it?',
  'I just told you \u2014 what else is on your mind?',
  "We've covered this one. Ask me something else.",
];
function dryPoolOf(text) {
  const t = String(text == null ? '' : text).trim().replace(/^"+|"+$/g, '');
  const i = DRY_LINES.indexOf(t);
  if (i < 0) return null;
  return i < 9 ? 'dry9' : 'self3';
}
function dryPickClass(pickId) {
  const id = String(pickId || '');
  if (/^(agree|joke|silence|react:)/.test(id)) return 'react';
  if (/^(ask:|want:|gq:|dlg:)/.test(id)) return 'topic';
  return 'other';
}

function driveOne(Game, vid, tag, mode, convoLog, runState) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const moodAtStart = safe(() => Game.npcMood(vid), '?');
  const out = {
    vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false,
    threads: [], transcript: [], deadAir: [], maxDeadAirStreak: 0,
    npcTurns: 0, dryLines: 0, stallLines: 0, stallTurns: [], stallFollows: [], _stallPending: false,
    dryFamLines: 0, dry9Lines: 0, self3Lines: 0, dryTurns: [], dryFollows: [], _dryPending: false, endOnDry: false, counterDry: null, counterSelf: null, coldOpenDry: null, coldOpenLine: '', turnRecs: [], gossipPicks: 0, comfortPicks: 0, moodAtStart,
    openingDryLines: 0, openingDry9Lines: 0, openingSelf3Lines: 0, openingDryTexts: [],
    openingScanned: false, openingEntries: 0,
    repeatHits: [], closeReads: 0, grievanceServes: 0, knackGossips: 0, othersSteered: false, lingerPick: false, partyProbePick: false, sawInvitePartyOffer: false,
    favorAcceptPick: false, favorAcceptFavorId: null,
    // r51: wrap-recorded serve (independent of the line matcher) + reoffer state.
    grievanceWrapServe: false, grievanceWrapServes: 0,
    // r52: deflection lines + subject-no-offer probe state.
    deflectionLines: 0, subjectNoOfferTurns: 0, subjectNoOfferPick: null,
    subjectNoOfferMenuMore: false, subjectNoOfferFreshTopics: 0, subjectNoOfferProbes: [],
    othersPrevPick: null, othersReofferPick: false, othersReofferOffer: false, othersPickChanged: false,
    // r50 FUNNEL: per-convo reachability of the 'others' surface.
    // r55 MENU TAG: offers/picks split by menu (main vs subject), so the
    // run can measure which menu natural picks actually come from.
    sawSubjectMenu: false, sawOthersOffer: false, sawMainOthersOffer: false, sawSubjectOthersOffer: false,
    othersPickMenu: null, othersPickMenus: [],
    sawAnsOffer: false,
    offeredWhileCapped: false, offeredNotFresh: false,
    pickedOthers: false, pickedAns: 0, seededSteered: !!runState.inSeededConvo,
  };
  // r51: the speaker's last SERVED 'others' pick (wrap log = servings only;
  // menu-check calls carry {menuCheck:true} and are skipped by the wrap).
  try {
    const log = runState.t2picks || [];
    for (let i = log.length - 1; i >= 0; i--) {
      if (String(log[i].vid) === String(vid)) { out.othersPrevPick = { id: log[i].id, why: log[i].why }; break; }
    }
    if (out.othersPrevPick) {
      try {
        const now = Game.t2pickOther(vid, { menuCheck: true });
        out.othersPickChanged = !!now && now.why !== 'neutral' &&
          (String(now.id) !== String(out.othersPrevPick.id) || now.why !== out.othersPrevPick.why);
      } catch (e) {}
    }
  } catch (e) {}
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  const seenContent = new Set();
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  noteThread();
  // r67 OPENING SCAN (recording only): startConvo resets the transcript
  // and the dryLines counter every sitting, so the entries present now
  // are exactly this sitting's opening lines. The turn scan starts at
  // each turn's beforeLen and never sees them — that is the r66 +3 gap.
  // Classify them with the same dryPoolOf and append them to the
  // transcript (sense reads become the full conversation). Turn-based
  // dryTurns/dry9Detail are untouched: opening lines have no turn.
  try {
    const cc0 = Game.convoGet(vid);
    const tr0 = (cc0 && cc0.transcript) || [];
    out.openingScanned = true;
    out.openingEntries = tr0.length;
    for (const e of tr0) {
      const who0 = (e && e.who) || (e && e.speaker) || '?';
      const text0 = (e && (e.text || e.line)) || '';
      if (!text0) continue;
      out.transcript.push({ who: who0, text: String(text0).slice(0, 600) });
      const dp0 = dryPoolOf(text0);
      if (dp0) {
        out.openingDryLines++;
        if (dp0 === 'dry9') out.openingDry9Lines++; else out.openingSelf3Lines++;
        out.openingDryTexts.push(String(text0).slice(0, 120));
      }
    }
  } catch (e) {}
  const seenIds = [];
  // r57 CACHE-SUSPECT: previous subject-menu turn's built set in this convo.
  let prevSubjectBuilt = null;
  let deadStreak = 0;
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    // r50 funnel capture (before any pick): subject menu? others offered?
    // r55 MENU TAG: menuKind for this turn (subject vs main), used for
    // offer splits and pick attribution below.
    let menuKind = 'main';
    try {
      const cc0 = Game.convoGet(vid);
      if (cc0 && cc0.choosingSubject) out.sawSubjectMenu = true;
      menuKind = (cc0 && cc0.choosingSubject) ? 'subject' : 'main';
    } catch (e) {}
    // r52 FUNNEL SPLIT probe: subject menu reached but 'others' not
    // offered — does a pick exist right now? menuCheck is a READ (the
    // wrap skips it), so this cannot inflate serving counts.
    // r54 INBUILT: offeredReplies holds the FULL pre-pagination built
    // list for this menu build, so a no-offer turn splits into
    // not-built (cap/exclusion) vs built-but-paged (rank).
    try {
      const ccP = Game.convoGet(vid);
      const hasOthers = choices.some(x => String(x.id || '') === 'ask:others');
      if (ccP && ccP.choosingSubject && !hasOthers) {
        out.subjectNoOfferTurns++;
        let probe = null;
        try { const now = Game.t2pickOther(vid, { menuCheck: true }); if (now && now.id) probe = { id: String(now.id), why: now.why || '?' }; } catch (e) {}
        out.subjectNoOfferPick = probe;
        out.subjectNoOfferMenuMore = choices.some(x => String(x.id || '') === 'menu:more');
        out.subjectNoOfferFreshTopics = choices.filter(x => x && !seenIds.includes(String(x.id || '')) && /^ask:/.test(String(x.id || ''))).length;
        let inBuilt = null;
        try { const or = (Game.convoGet(vid) || {}).offeredReplies || {}; inBuilt = Object.prototype.hasOwnProperty.call(or, 'ask:others'); } catch (e) {}
        // r55 PROBE FLAG: convoSawOthers — whether this convo already
        // offered or picked 'others' on an earlier turn. At probe time
        // sawOthersOffer/pickedOthers reflect earlier turns only (the
        // current-turn offer update runs below, and picks land later),
        // so true means this non-offer is the CORRECT already-asked
        // exclusion, not a genuine miss — unless the pick changed since
        // serving (the analyzer's served-changed-pick split covers that).
        // r56 PROBE FLAGS: split r55's inBuilt=false residual. Read from
        // the same convoGet the probe already uses (ccP): thread (the
        // r54 re-list is blocked while thread==='others'), reactiveQ /
        // genericQ (a hanging question OWNS the menu — choosingSubject
        // stays set but the built menu is answers-only, a CORRECT
        // non-offer), pendingQ, and inT2list (whether 'ask:others' is
        // in topic2Asks at all — gating vs construction gap). Reads
        // only; no game state is changed.
        let probeThread = null, probeReactiveQ = null, probeGenericQ = null, probePendingQ = false, probeInT2list = null;
        try {
          probeThread = (ccP.thread === undefined || ccP.thread === null) ? null : String(ccP.thread);
          probeReactiveQ = (ccP.reactiveQ && ccP.reactiveQ.id) ? String(ccP.reactiveQ.id) : (ccP.reactiveQ ? '?' : null);
          probeGenericQ = (ccP.genericQ && ccP.genericQ.kind) ? String(ccP.genericQ.kind) : (ccP.genericQ ? '?' : null);
          probePendingQ = !!ccP.pendingQ;
          if (typeof Game.topic2Asks === 'function') {
            const tl = Game.topic2Asks(vid) || [];
            probeInT2list = tl.some(a => a && String(a.id || '') === 'ask:others');
          }
        } catch (e) {}
        // r57 DEEP PROBE FLAGS (reads only): pager-owns, fresh-capped,
        // cache-suspect, spent. Computed from the same convoGet (ccP)
        // plus topic2Asks/t2topicFresh reads (menuCheck-safe: t2topicFresh
        // for 'others' routes through t2othersChanged with menuCheck).
        let r57 = { othersFresh: null, othersFreshIndex: -1, freshBeforeOthers: null, topicCapMood: null, temper: null, moodBand: null, pendingQAlone: false, windingDown: false, closingBeat: false, ambushThread: false, pendingTrade: false, pendingHawk: false, invitationBeat: false, pagerOwns: 'none', spentOthers: false, prevMenuSame: false };
        try {
          const temper = safe(() => Game.npcTemper(vid), null);
          const moodBand = safe(() => Game.convoMoodBand(vid), null);
          let topicCap = (temper === 'withdrawn' || temper === 'prickly' || temper === 'restless') ? 2 : 5;
          if (moodBand === 'tense') topicCap = Math.max(1, topicCap - 1);
          r57.temper = temper; r57.moodBand = moodBand; r57.topicCapMood = topicCap;
          if (typeof Game.topic2Asks === 'function') {
            const tl2 = Game.topic2Asks(vid) || [];
            const freshIds = [];
            let oFresh = null;
            for (const a of tl2) {
              const tid = String(a.id || '').slice(4);
              let fr = null;
              try { fr = (typeof Game.t2topicFresh === 'function') ? Game.t2topicFresh(vid, tid) : null; } catch (e) {}
              if (fr) freshIds.push(String(a.id));
              if (String(a.id) === 'ask:others') { oFresh = fr; }
            }
            r57.othersFresh = oFresh;
            r57.othersFreshIndex = freshIds.indexOf('ask:others');
            r57.freshBeforeOthers = r57.othersFreshIndex >= 0 ? r57.othersFreshIndex : null;
          }
          r57.pendingQAlone = !!ccP.pendingQ && !ccP.reactiveQ && !ccP.genericQ;
          r57.windingDown = !!ccP.windingDown;
          r57.closingBeat = !!(ccP.spokenBeat && ccP.spokenBeat.tag === 'closing');
          r57.ambushThread = ccP.thread === 'ambush';
          r57.pendingTrade = !!ccP.pendingTrade;
          r57.pendingHawk = !!ccP.pendingHawk;
          r57.invitationBeat = !!(ccP.spokenBeat && ccP.spokenBeat.tag === 'invitation' && safe(() => Game.pendingInvite && Game.pendingInvite(vid), false));
          if (r57.ambushThread) r57.pagerOwns = 'ambush';
          else if (r57.windingDown || r57.closingBeat) r57.pagerOwns = 'windingDownOrClosing';
          else if (r57.invitationBeat) r57.pagerOwns = 'invitation';
          else if (ccP.pendingQ) r57.pagerOwns = 'pendingQ';
          else if (ccP.reactiveQ) r57.pagerOwns = 'reactiveQ';
          else if (ccP.genericQ) r57.pagerOwns = 'genericQ';
          else if (ccP.pendingTrade) r57.pagerOwns = 'pendingTrade';
          else if (ccP.pendingHawk) r57.pagerOwns = 'pendingHawk';
          r57.spentOthers = !!((ccP.spent || {})['ask:others']);
          const builtNow = Object.keys((Game.convoGet(vid) || {}).offeredReplies || {});
          if (prevSubjectBuilt) {
            r57.prevMenuSame = prevSubjectBuilt.length === builtNow.length && prevSubjectBuilt.every(id => builtNow.indexOf(id) !== -1);
          }
        } catch (e) {}
        // r59 BUILD TRACE + T2 SETS (reads only): the build record(s)
        // for the convoChoices call that built this turn's menu, plus
        // 'others' membership in t2fresh/t2discussed and the derived
        // freshness (served pick vs this probe's pick — never a fresh
        // t2pickOther call, which could consume RNG).
        let r59 = { trace: null, buildsThisCall: 0, reactiveDef: false, gqActive: false, rumorDone: false, inFresh: null, inDiscussed: null, saidCount: null, t2otherServed: null, othersChanged: null, fullIds: null, delivered: null, inParty: null };
        try {
          const ccT = Game.convoGet(vid) || {};
          r59.reactiveDef = !!(ccT.reactiveQ && Game.REACTIVE_DEFS && Game.REACTIVE_DEFS[ccT.reactiveQ.id]);
          r59.gqActive = !!ccT.genericQ && !r59.reactiveDef && !ccT.pendingQ;
          r59.rumorDone = !!ccT.rumorDone;
          r59.saidCount = ((ccT.said || {})['t2:others'] || []).length;
          r59.t2otherServed = ccT.t2otherServed ? { id: String(ccT.t2otherServed.id), why: String(ccT.t2otherServed.why) } : null;
          if (r59.t2otherServed && probe && probe.why !== 'neutral') r59.othersChanged = (String(probe.id) !== r59.t2otherServed.id || String(probe.why) !== r59.t2otherServed.why);
          else if (r59.t2otherServed) r59.othersChanged = false;
          if (typeof Game.topic2Asks === 'function') {
            const tl3 = Game.topic2Asks(vid) || [];
            const inList = tl3.some(a => String(a.id || '') === 'ask:others');
            let fr3 = null;
            try { fr3 = (typeof Game.t2topicFresh === 'function') ? Game.t2topicFresh(vid, 'others') : null; } catch (e) {}
            r59.inFresh = inList && fr3 === true;
            r59.inDiscussed = inList && (r59.saidCount > 0) && fr3 === false;
          }
          const callBuilds = (Game.__r59traceState && Game.__r59traceState.lastCallBuilds) || [];
          r59.buildsThisCall = callBuilds.length;
          r59.trace = callBuilds.length === 1 ? callBuilds[0] : (callBuilds.length ? callBuilds : null);
          try { r59.fullIds = Object.keys((Game.convoGet(vid) || {}).offeredReplies || {}); } catch (e) {}
          try { r59.delivered = (Game.__r59traceState && Game.__r59traceState.lastCallDelivered) || null; } catch (e) {}
          try { r59.inParty = (typeof Game.inParty === 'function') ? !!Game.inParty(vid) : null; } catch (e) {}
        } catch (e) {}
        out.subjectNoOfferProbes.push({ turn: t, pick: probe, menuMore: out.subjectNoOfferMenuMore, freshTopics: out.subjectNoOfferFreshTopics, inBuilt, convoSawOthers: !!(out.sawOthersOffer || out.pickedOthers), thread: probeThread, reactiveQ: probeReactiveQ, genericQ: probeGenericQ, pendingQ: probePendingQ, inT2list: probeInT2list, trust: safe(() => (Game.state.village || {}).trust || {}, {})[vid], r57, r59 });
      }
    } catch (e) {}
    // r57: track the last subject-menu built set for cache-suspect flags.
    try { const ccU = Game.convoGet(vid); if (ccU && ccU.choosingSubject) prevSubjectBuilt = Object.keys(ccU.offeredReplies || {}); } catch (e) {}
    if (choices.some(x => String(x.id || '') === 'ask:others')) {
      out.sawOthersOffer = true;
      if (menuKind === 'subject') out.sawSubjectOthersOffer = true; else out.sawMainOthersOffer = true;
      if (out.othersPrevPick) out.othersReofferOffer = true;
      if (runState.othersDoneToday && !runState.forceOthersOnce) out.offeredWhileCapped = true;
      if (seenIds.includes('ask:others')) out.offeredNotFresh = true;
    }
    if (choices.some(x => /^ans:/.test(String(x.id || '')))) out.sawAnsOffer = true;
    if (choices.some(x => String(x.id || '') === 'invite_party')) out.sawInvitePartyOffer = true;
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
    // r65 FAVOR-ACCEPT (declared in prereg): a live forage_help ask owns
    // the menu — accept it before gossip/ans/linger. Other favor kinds
    // are recorded as offers but never committed by this driver (their
    // dlg:commit is gated out of the fallbacks below), so one villager's
    // other promise cannot silently block their later forage commit.
    let favorWant = null;
    try {
      const ccW = Game.convoGet(vid);
      const w = ccW && ccW.want;
      if (w && w.id === 'ask_favor' && w.favor) favorWant = w;
    } catch (e) {}
    if (favorWant && favorWant.favor) {
      const fav = favorWant.favor;
      try {
        if (!runState.favorOfferIds.has(fav.id)) {
          runState.favorOfferIds.add(fav.id);
          runState.favorOffers.push({ day, vid: String(vid), vidName: vname(Game, vid), favorId: fav.id, kind: fav.kind, task: fav.task || null, line: fav.line || null, favorState: fav.state || null });
        }
      } catch (e) {}
    }
    let pick = null;
    let favorAcceptTurn = false; // r65 SHAKEDOWN FIX: per-TURN, not per-convo — out.favorAcceptPick stays true for the rest of the convo, so verifying on it recorded one accept per subsequent turn (67 phantom accepts in smoke).
    if (favorWant && favorWant.favor && favorWant.favor.kind === 'forage_help' && favorWant.favor.state === 'asked') {
      const dc = choices.find(x => String(x.id || '') === 'dlg:commit');
      if (dc) { pick = dc; favorAcceptTurn = true; out.favorAcceptPick = true; out.favorAcceptFavorId = favorWant.favor.id; }
    }
    if (mode === 'deep') {
      if (!pick && runState.gossipPicks < GOSSIP_TARGET) {
        const g = byId(/^ask:gossip$/);
        if (g && (fresh(g) || !seenIds.some(id => id === 'ask:gossip'))) pick = g;
        // r52 (carried from r51): gossipPicks is the TODAY count (reset daily); the total lives
        // in gossipPicksTotal so the per-run metric survives the reset.
        if (pick) { runState.gossipPicks++; runState.gossipPicksTotal = (runState.gossipPicksTotal || 0) + 1; out.gossipPicks++; }
      }
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (!pick && ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
        pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
      // r56 LINGER (linger arm only): when 'others' is offered fresh,
      // weigh it instead of paging past it. The old fallbacks ('more',
      // kind-temper, fresh asks) systematically skip an offered 'others'
      // — r55's 372->7 gap. Linger picks it here (after gossip + ans),
      // WITHOUT setting othersSteered/othersDoneToday: it is a natural
      // pick under the linger policy, so it stays in the unsteered
      // funnel. Seeded-speaker probe convos are excluded (forceOthersOnce
      // has its own steer). Mirrors the steer's pick-quality behavior
      // (picks the offered 'others' regardless of the underlying why).
      if (!pick && runState.arm === 'linger' && !runState.forceOthersOnce) {
        const oL = byId(/^ask:others$/);
        if (oL && fresh(oL)) { pick = oL; out.lingerPick = true; }
      }
      // r65: the r63 party probe is REMOVED (declared in prereg). The
      // invite wrap below still censuses every party decision that
      // ordinary fallback picks produce; the probe subset stays empty.
      // r50 (as r49): steer one convo per day toward 'others' (t2gen_others surface).
      // The subject menu shows only 1-2 fresh t2 topics (defs order); work
      // through the queue — discussed topics drop behind, 'others' surfaces.
      // r50: forceOthersOnce (seeded-speaker probe convos) steers WITHOUT
      // consuming the day's natural steer.
      if (!pick && (!runState.othersDoneToday || runState.forceOthersOnce)) {
        const o = byId(/^ask:others$/);
        if (o && fresh(o)) { pick = o; if (!runState.forceOthersOnce) runState.othersDoneToday = true; out.othersSteered = true; }
        else {
          const c2 = safe(() => Game.convoGet(vid), null);
          if (c2 && c2.choosingSubject) {
            const t2 = choices.find(x => x && fresh(x) && /^ask:(lately|where|you|fears|neighbors|advice|oldworld|skills|systemtake|loved|personal)$/.test(String(x.id || '')));
            if (t2) pick = t2;
            else { const more = byId(/^menu:more$/); if (more) pick = more; }
          }
          if (!pick) { const subj = byId(/^(dlg:)?subject$/); if (subj && fresh(subj)) pick = subj; }
        }
      }
      // r65 FALLBACK GATE: outing play belongs to the wedge (favor_action
      // / requirements / cancel / trail-talk never picked here), and a
      // non-forage favor's dlg:commit is skipped while that want is live.
      // The deliberate favor-accept above bypasses this filter.
      const forbidCommit = !!(favorWant && favorWant.favor && favorWant.favor.kind !== 'forage_help');
      const fb = (x) => {
        const id = String((x && x.id) || '');
        if (id === 'dlg:favor_action' || id === 'dlg:favor_requirements' || id === 'dlg:favor_cancel' || id === 'dlg:forage_talk') return false;
        if (id === 'dlg:commit' && forbidCommit) return false;
        return true;
      };
      const fbChoices = choices.filter(fb);
      if (!pick) pick = fbChoices.find(x => String(x.id || '') === 'more');
      if (!pick) pick = fbChoices.find(x => fresh(x) && String(x.temper || '') === 'kind');
      if (!pick) pick = fbChoices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = fbChoices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
      if (!pick) pick = fbChoices.find(x => fresh(x) && /^(agree|joke|silence|react:)/.test(String(x.id || '')));
      if (!pick) pick = fbChoices.find(x => fresh(x) && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = fbChoices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = fbChoices[0] || choices[0];
    }
    if (!pick) break;
    const pickId = String(pick.id || '');
    if (pickId === 'ask:others') { out.pickedOthers = true; out.othersPickMenu = menuKind; out.othersPickMenus.push(menuKind); if (out.othersPrevPick) out.othersReofferPick = true; }
    if (/^ans:/.test(pickId)) out.pickedAns++;
    seenIds.push(pickId);
    if (/^dlg:(comfort|empathize|stay)$/.test(pickId)) { out.comfortPicks++; }
    if (pickId === 'invite_party' && out.partyProbePick) { runState.partyProbeActive = vid; runState.partyProbeDay = day; }
    const beforeLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    const tpBefore = (runState.t2picks || []).length;
    try { Game.convoTurn(vid, pickId); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    // r65 FAVOR-ACCEPT verification: post-turn STATE, not the pick alone.
    // A refused commit (same-villager open promise) stays asked and is
    // recorded as accepted:false with the live state.
    if (favorAcceptTurn) {
      try {
        const favAfter = (typeof Game.convoGetFavor === 'function') ? Game.convoGetFavor(vid) : (Game.state.village.favorLedger || {})[vid];
        const promAfter = (Game.state.village.promises || {})[vid];
        const accepted = !!(favAfter && favAfter.state === 'promised' && promAfter && promAfter.favorId === favAfter.id);
        runState.favorAccepts.push({ day, vid: String(vid), vidName: vname(Game, vid), favorId: out.favorAcceptFavorId, accepted, favorState: favAfter && favAfter.state, meetDay: favAfter && favAfter.meetDay, promiseFavorId: promAfter && promAfter.favorId, promiseKept: promAfter && promAfter.kept });
      } catch (e) {}
    }
    // r51 WRAP-SERVE: a t2pickOther serving (grievance/vgrievance) during
    // this turn marks the convo as a serve EVEN IF the line matcher misses
    // the prose — the wrap record is the ground truth for saving transcripts.
    try {
      const log = runState.t2picks || [];
      for (let i = tpBefore; i < log.length; i++) {
        const tp = log[i];
        if (tp && (tp.why === 'grievance' || tp.why === 'vgrievance')) { out.grievanceWrapServe = true; out.grievanceWrapServes++; }
      }
    } catch (e) {}
    out.turns++;
    if (runState.partyProbeActive === vid) runState.partyProbeActive = null;
    noteThread();
    const afterLen = safe(() => { const cc = Game.convoGet(vid); return (cc.transcript || []).length; }, 0);
    let turnHadDry9 = false; // r65: set inside the entry scan below
    try {
      const cc = Game.convoGet(vid);
      const tr = (cc && cc.transcript) || [];
      for (let i = beforeLen; i < tr.length; i++) {
        const e = tr[i];
        const who = (e && e.who) || (e && e.speaker) || '?';
        const text = (e && (e.text || e.line)) || '';
        if (text) {
          out.transcript.push({ who, text: String(text).slice(0, 600) });
          if (out.coldOpenDry === null && who === 'them') { out.coldOpenDry = !!dryPoolOf(text); out.coldOpenLine = String(text).slice(0, 120); }
          if (out._stallPending) { out.stallFollows.push({ turn: t, who, text: String(text).slice(0, 200) }); out._stallPending = false; }
          if (out._dryPending) { out.dryFollows.push({ turn: t, who, text: String(text).slice(0, 200) }); out._dryPending = false; }
          if (/lost my train of thought/i.test(String(text))) { out.stallLines++; out.stallTurns.push({ turn: t, pickId: pickId, who }); out._stallPending = true; }
          const dp = dryPoolOf(text);
          if (dp) { out.dryFamLines++; if (dp === 'dry9') { out.dry9Lines++; turnHadDry9 = true; } else out.self3Lines++; out.dryTurns.push({ turn: t, pickId: pickId, who, pool: dp, line: String(text).slice(0, 120) }); out._dryPending = true; }
          if (isCloseReadLine(text)) out.closeReads++;
          if (isGrievanceLine(text)) out.grievanceServes++;
          if (isDeflectionLine(text)) out.deflectionLines++;
          if (isKnackGossipLine(text)) out.knackGossips++;
        }
      }
      try { const cc2 = Game.convoGet(vid); if (cc2) { out.counterDry = cc2.dryLines || 0; out.counterSelf = cc2.selfRepeatLines || 0; } } catch (e) {}
      const nl = String(((tr[tr.length - 1]) || {}).text || '');
      if (/^(agree|joke|silence|react:)/.test(pickId)) { out.dryLines++; deadStreak++; out.deadAir.push({ pickId, line: nl.slice(0, 120) }); }
      else { out.npcTurns++; deadStreak = 0; }
      out.maxDeadAirStreak = Math.max(out.maxDeadAirStreak, deadStreak);
      out.turnRecs.push({ turn: t, pickId, dry9: turnHadDry9, lastLine: nl.slice(0, 200), added: afterLen - beforeLen }); // r65 only; r67 amendment A: added
      const nrm = nl.trim().replace(/^\"+|\"+$/g, '');
      if (nrm && seenContent.has(nrm)) out.repeatHits.push({ turn: t, pickId, line: nl.slice(0, 140) });
      else if (nrm) seenContent.add(nrm);
    } catch (e) {}
  }
  // r52 SERVE SPLIT class: grievance line delivered > deflection >
  // other (wrap served but neither — matcher gap, never renamed).
  out.wrapServeClass = !out.grievanceWrapServe ? null
    : out.grievanceServes > 0 ? 'grievance-line'
    : out.deflectionLines > 0 ? 'deflection' : 'other';
  // r50 funnel classification (natural + seeded alike; analysis splits by tag).
  out.funnelClass = out.pickedOthers ? 'picked-others'
    : out.sawOthersOffer && out.offeredWhileCapped ? 'offered-capped'
    : out.sawOthersOffer && out.offeredNotFresh ? 'offered-not-fresh'
    : out.sawOthersOffer ? 'offered-not-picked'
    : out.sawSubjectMenu ? 'subject-no-offer'
    : out.sawAnsOffer ? 'no-subject-ans'
    : 'no-subject-no-ans';
  try {
    for (let i = out.transcript.length - 1; i >= 0; i--) {
      const e = out.transcript[i];
      if (e && e.who === 'them') { out.endOnDry = !!dryPoolOf(e.text); break; }
    }
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

async function runWorld({ seed, days, policyId, steering, arm }) {
  const steeringOn = steering !== false; // r53: false = no seeded-speaker steering arm
  const { Game, manifest: mf } = await loadGame({ seed, mode: policyId, fullTelemetry: true });
  await setupGame(Game);
  // SMOKE ONLY: instrument test — open the trust-gated topics (ask:others
  // needs minTrust 20) so the t2pickOther wrap can prove it fires. Full
  // seeds run unmodified.
  if (String(policyId).endsWith('-smoke')) {
    try {
      const v = Game.state.village || {};
      v.trust = v.trust || {};
      for (const id of (v.roster || [])) v.trust[id] = Math.max(v.trust[id] || 10, 30);
    } catch (e) {}
  }
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);
  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const runState = { gossipPicks: 0, gossipPicksTotal: 0, seed, arm: arm || 'control', othersDoneToday: false, inSeededConvo: false, forceOthersOnce: false, t2picks: null, partyProbeDoneToday: false, partyProbeActive: null, partyProbeDay: -1, favorOfferIds: new Set(), favorOffers: [], favorAccepts: [], outingLog: [] };
  const inviteDecisions = []; // r63: every npcInviteDecision call (wrap records, game decides)
  const t2picks = [];      // every t2pickOther SERVING (menu checks skipped): {day, vid, id, why, +live class}
  runState.t2picks = t2picks;
  const grievances = [];   // every recordGrievance: {day, by, against, kind, severity}
  const bondSnaps = [];    // every-5d bond census
  const grievStateSnaps = []; // DAILY grievance-state census (r49): betrayal + conflicts
  const rosterByDay = []; // r67: read-only living-NPC roster per loop-day (livingIds().length).
  // r50 SEEDED CRACK: first depth>=2 NPC-NPC pair + its ambush-outcome grievance.
  const seeded = { pair: null, day: null, pre: null, post: null, serves: [] };
  const seededDaily = []; // r52: daily v/depth for the seeded pair, seedDay..+14.
  const beatBuf = [];
  const origSay = Game.say, origSysSay = Game.sysSay;
  Game.say = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  Game.sysSay = function (msg) { try { beatBuf.push({ day: curDay(), text: String(msg == null ? '' : msg) }); if (beatBuf.length > 40000) beatBuf.shift(); } catch (e) {} };
  // r48 wraps (as r47): t2pickOther (the 'close' surface) + recordGrievance (crack events).
  // r51 MENUCHECK: the re-offer fix calls t2pickOther during menu builds
  // with {menuCheck:true} — those are READS, not servings. The wrap must
  // skip them, or menu checks inflate every pick/serving count.
  try {
    const origPick = Game.t2pickOther;
    if (typeof origPick === 'function') {
      Game.t2pickOther = function (vid, opts) {
        let r = null;
        try { r = origPick.apply(this, arguments); } catch (e) {}
        if (opts && opts.menuCheck) return r;
        try {
          if (r && r.id) {
            // r49 live classification: exact bond state at pick time (the
            // 5-day pairHist is too coarse for fallback classes).
            let namedDepth = null, speakerHasDeep2 = false, inGroup = false;
            try {
              const vv = Game.state.village || {};
              const roster = (vv.roster || []).filter(id => id !== vid && id !== me());
              const bonds = vv.bonds || {};
              const keyOf = (a, b) => {
                for (const k of Object.keys(bonds)) {
                  const parts = String(k).split('|');
                  if ((parts[0] === a && parts[1] === b) || (parts[0] === b && parts[1] === a)) return k;
                }
                return null;
              };
              const nk = keyOf(String(vid), String(r.id));
              if (nk) namedDepth = (bonds[nk] || {}).depth || 0;
              for (const k of Object.keys(bonds)) {
                const bnd = bonds[k] || {};
                if ((bnd.depth || 0) < 2) continue;
                const parts = String(k).split('|');
                const oid = parts[0] === vid ? parts[1] : parts[1] === vid ? parts[0] : null;
                if (!oid || roster.indexOf(oid) === -1) continue;
                try { if ((Game.getPerson(oid) || {}).dead) continue; } catch (e) {}
                speakerHasDeep2 = true; break;
              }
              for (const g of (vv.groups || [])) {
                const m = g.members || [];
                if (m.includes(vid) && m.includes(String(r.id))) { inGroup = true; break; }
              }
            } catch (e) {}
            t2picks.push({ day: curDay(), vid: String(vid), vidName: vname(Game, vid), id: String(r.id), idName: vname(Game, r.id), why: r.why || '?', namedDepth, speakerHasDeep2, inGroup, seededSteered: !!runState.inSeededConvo });
            // r50: seeded-pair serve detection (wrap reads the live `seeded` var).
            try {
              if (seeded.pair && String(vid) === seeded.pair.a && String(r.id) === seeded.pair.b && (r.why === 'vgrievance' || r.why === 'grievance')) {
                seeded.serves.push({ day: curDay(), why: r.why });
              }
            } catch (e) {}
          }
        } catch (e) {}
        return r;
      };
    }
  } catch (e) {}
  try {
    const origGr = Game.recordGrievance;
    if (typeof origGr === 'function') {
      Game.recordGrievance = function (by, against, kind, severity) {
        let r = null;
        try { r = origGr.apply(this, arguments); } catch (e) {}
        try { grievances.push({ day: curDay(), by: String(by), byName: vname(Game, by), against: String(against), againstName: vname(Game, against), kind: kind || '?', severity: severity || 15 }); } catch (e) {}
        return r;
      };
    }
  } catch (e) {}

  // r63 INVITE WRAP (reads only, no RNG, no mutation): wrap
  // npcInviteDecision so every wild invitation decision is censused.
  // The wrapper calls through unchanged and records the returned
  // decision; it calls NO Math.random itself, so trajectories are
  // untouched. Party decisions during a probe pick's convoTurn carry
  // probe:true (day + invitee match); lure decisions from npcPlotTick
  // carry probe:false. Backstabber party accepts bypass this function
  // by design and are never recorded here.
  try {
    const origInviteDec = Game.npcInviteDecision;
    if (typeof origInviteDec === 'function') {
      Game.npcInviteDecision = function (invitee, inviter, opts) {
        const d = origInviteDec.apply(this, arguments);
        try {
          inviteDecisions.push({ day: curDay(), kind: ((opts || {}).kind || 'party'),
            invitee: String(invitee), inviteeName: vname(Game, invitee),
            inviter: String(inviter), inviterName: vname(Game, inviter),
            chance: (d && d.chance !== undefined) ? d.chance : null,
            accept: !!(d && d.accept), veto: (d && d.veto) || null,
            inputs: (d && d.inputs) || null, reasons: (d && d.reasons) || null,
            probe: ((opts || {}).kind || 'party') === 'party' && runState.partyProbeActive === invitee && runState.partyProbeDay === curDay() });
        } catch (e) {}
        return d;
      };
    }
  } catch (e) {}
  // r59 BUILD TRACE (reads only, no RNG, no mutation): wrap buildMenu /
  // finalizeMenu / convoChoices to record, per menu build, the entry
  // state, whether the replyMenu cache served it, and whether
  // finalize kept 'ask:others'. A cache hit is replyMenu object
  // identity (finish() replaces the object on fresh builds; the cache
  // path leaves it untouched) cross-checked by finalize not running.
  // othersChanged is NEVER recomputed here (t2pickOther menuCheck can
  // consume RNG on the neutral fallback); the probe derives it from
  // the served pick + this probe's pick instead.
  const traceState = { callSeq: 0, curCallBuilds: [], lastCallBuilds: [], lastCallDelivered: null, freshByVid: {}, census: { totalBuilds: 0, cacheHits: 0, finalizeCalls: 0, finalizeDrops: 0, buildsPerCall: {} } };
  Game.__r59traceState = traceState;
  const traceCensus = traceState.census;
  try {
    const origBuildMenu58 = Game.buildMenu;
    const origFinalize58 = Game.finalizeMenu;
    const origConvoChoices58 = Game.convoChoices;
    let traceFinalizeRec = null;
    if (typeof origFinalize58 === 'function') {
      Game.finalizeMenu = function (vid, choices) {
        const out = origFinalize58.apply(this, arguments);
        try {
          const inIds = (choices || []).map(ch => ch && ch.id);
          const outIds = (out || []).map(ch => ch && ch.id);
          traceFinalizeRec = { ran: true, inHasOthers: inIds.indexOf('ask:others') !== -1, outHasOthers: outIds.indexOf('ask:others') !== -1, inCount: inIds.length, outCount: outIds.length };
          traceCensus.finalizeCalls++;
          if (traceFinalizeRec.inHasOthers && !traceFinalizeRec.outHasOthers) traceCensus.finalizeDrops++;
        } catch (e) {}
        return out;
      };
    }
    if (typeof origBuildMenu58 === 'function') {
      Game.buildMenu = function (vid, uncapped) {
        let entry = null, preMenu = null;
        try {
          const c0 = Game.convoGet(vid) || {};
          preMenu = c0.replyMenu || null;
          entry = { choosingSubject: !!c0.choosingSubject, thread: (c0.thread === undefined || c0.thread === null) ? null : String(c0.thread), depth: (c0.depth === undefined ? null : c0.depth), spokenBeatTag: (c0.spokenBeat && c0.spokenBeat.tag) ? String(c0.spokenBeat.tag) : null, windingDown: !!c0.windingDown, pendingQ: !!c0.pendingQ, reactiveQ: (c0.reactiveQ && c0.reactiveQ.id) ? String(c0.reactiveQ.id) : (c0.reactiveQ ? '?' : null), reactiveDef: !!(c0.reactiveQ && Game.REACTIVE_DEFS && Game.REACTIVE_DEFS[c0.reactiveQ.id]), genericQ: (c0.genericQ && c0.genericQ.kind) ? String(c0.genericQ.kind) : (c0.genericQ ? '?' : null), pendingTrade: !!c0.pendingTrade, pendingHawk: !!c0.pendingHawk, rumorDone: !!c0.rumorDone, heldBeats: (c0.heldBeats || []).length, spentOthers: !!((c0.spent || {})['ask:others']) };
          entry.gqActive = !!c0.genericQ && !entry.reactiveDef && !c0.pendingQ;
        } catch (e) {}
        traceFinalizeRec = null;
        let res = null, err = null;
        try { res = origBuildMenu58.apply(this, arguments); } catch (e) { err = e; }
        try {
          const c1 = Game.convoGet(vid) || {};
          const postMenu = c1.replyMenu || null;
          const cacheHit = !err && postMenu !== null && postMenu === preMenu;
          const offered = Object.keys(c1.offeredReplies || {});
          const rec = { entry, cacheHit, error: !!err, finalize: traceFinalizeRec, hasOthers: offered.indexOf('ask:others') !== -1, offeredCount: offered.length, offeredIds: offered.slice(), origin: cacheHit ? (traceState.freshByVid[String(vid)] || null) : null };
          traceCensus.totalBuilds++;
          if (cacheHit) traceCensus.cacheHits++;
          traceState.curCallBuilds.push(rec);
          if (!cacheHit && !err) traceState.freshByVid[String(vid)] = rec;
        } catch (e) {}
        if (err) throw err;
        return res;
      };
    }
    if (typeof origConvoChoices58 === 'function') {
      Game.convoChoices = function (vid) {
        traceState.callSeq++;
        traceState.curCallBuilds = [];
        const r = origConvoChoices58.apply(this, arguments);
        traceState.lastCallBuilds = traceState.curCallBuilds.slice();
        traceCensus.buildsPerCall[traceState.lastCallBuilds.length] = (traceCensus.buildsPerCall[traceState.lastCallBuilds.length] || 0) + 1;
        try {
          const dids = (r || []).map(ch => ch && ch.id);
          traceState.lastCallDelivered = { ids: dids, hasOthers: dids.indexOf('ask:others') !== -1, count: dids.length };
        } catch (e) { traceState.lastCallDelivered = null; }
        return r;
      };
    }
  } catch (e) {}

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = me();
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  function trustOf(vid) { try { const t = (Game.state.village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return 10; } }

  // r49 (as r48): bond census — every 5 days + final. NPC-NPC pairs and player pairs.
  function snapshotGrievanceState() {
    const d = curDay();
    try {
      const v = Game.state.village || {};
      const bet = (((v.betrayal || {}).grievances) || []).map(g => ({ by: String(g.by), against: String(g.against), kind: g.kind || '?', day: g.day || 0 }));
      const conf = (v.conflicts || []).map(c => ({ a: String(c.a), b: String(c.b), resolved: !!c.resolved }));
      grievStateSnaps.push({ day: d, betrayal: bet, conflicts: conf });
    } catch (e) {}
  }

  function snapshotBonds(final) {
    const d = curDay();
    try {
      const v = Game.state.village || {};
      const sid = me();
      const pairs = [], playerPairs = [];
      for (const k of Object.keys(v.bonds || {})) {
        const bnd = v.bonds[k] || {};
        const [a, b] = String(k).split('|');
        const rec = { k, a, aName: vname(Game, a), b, bName: vname(Game, b), v: bnd.v || 0, depth: bnd.depth || 0 };
        if (a === sid || b === sid) playerPairs.push(rec); else pairs.push(rec);
      }
      bondSnaps.push({ day: d, final: !!final, pairs, playerPairs });
    } catch (e) {}
  }

  const talkedToday = new Set();
  function socialConvo() {
    const day = curDay();
    runState.othersDoneToday = false;
    runState.partyProbeDoneToday = false;
    runState.gossipPicks = 0; // r51: gossip-first is per-DAY (r50 ran it per-RUN by accident)
    if (day < 3) return;
    const living = livingIds();
    if (!living.length) return;
    // r50 SEEDED-SPEAKER steering (probe only, tagged, excluded from
    // natural funnel/windows): one extra forced-others convo/day with the
    // seeded speaker for 30 days after seeding. Does NOT consume the
    // day's natural others-steer (forceOthersOnce).
    if (steeringOn && seeded.pair && day > seeded.day && day <= seeded.day + 30) {
      let speakerAlive = true;
      try { speakerAlive = !((Game.getPerson(seeded.pair.a) || {}).dead); } catch (e) {}
      if (speakerAlive) {
        runState.inSeededConvo = true;
        runState.forceOthersOnce = true;
        driveOne(Game, seeded.pair.a, 'seeded-speaker', 'deep', convoLog, runState);
        runState.forceOthersOnce = false;
        runState.inSeededConvo = false;
      }
    }
    for (let n = 0; n < 3; n++) {
      const pool = living.filter(id => !talkedToday.has(id));
      const arr = pool.length ? pool : living;
      const target = arr[(day * 7 + n * 5) % arr.length];
      if (!target || talkedToday.has(target)) continue;
      talkedToday.add(target);
      // r50: r48 steering (1 others-steered convo/day). r49's d50+
      // per-convo reset is NOT repeated (r49 metric review).
      driveOne(Game, target, 'bond-daily-' + (n + 1), 'deep', convoLog, runState);
    }
  }
  function resetTalkLedger() { talkedToday.clear(); }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: policyId,
    upkeep(Game2, ctx) {
      if (base.upkeep) base.upkeep(Game2, ctx);
      // r65 DAWN START WEDGE: dayPart 0 only, once per loop-day (the
      // wedge itself guards both). Base upkeep runs first, untouched.
      try { OUTWEDGE.startWedge(Game, runState.outingLog, runState); } catch (e) {}
    },
    daily(Game2, ctx) {
      resetTalkLedger();
      // r67 ROSTER SNAPSHOT (recording only): roster at day start, before convos.
      try { rosterByDay.push({ day: curDay(), living: livingIds().length }); } catch (e) {}
      // r65 OUTING-DAY WEDGE: before the competent day (tick budget is
      // fullest here; the wedge travels out and back itself). At most
      // one outing advances per loop-day (the wedge guards it).
      try { OUTWEDGE.recordPosHistory(Game, runState); } catch (e) {}
      try { OUTWEDGE.dayWedge(Game, runState.outingLog, runState); } catch (e) {}
      if (base.daily) base.daily(Game2, ctx);
      socialConvo();
      // r75 MIDDAY POS SNAPSHOT: after the day's play, so partners who
      // gain a position mid-day are recorded (see prereg B3/Q5).
      try { OUTWEDGE.recordPosHistory(Game, runState, 'midday'); } catch (e) {}
      try { snapshotGrievanceState(); } catch (e) {}
      // r52 CRACK TRACE: daily seeded-pair bond state (after convos).
      try {
        if (seeded.pair && curDay() >= seeded.day && curDay() <= seeded.day + 14) {
          const bnd = Game.bondGet ? Game.bondGet(seeded.pair.a, seeded.pair.b) : null;
          seededDaily.push({ day: curDay(), v: bnd ? (bnd.v || 0) : null, depth: bnd ? (bnd.depth || 0) : null });
        }
      } catch (e) {}
      try { if (curDay() % 5 === 0) snapshotBonds(false); } catch (e) {}
      for (const cp of safe(() => Game.corpses() || [], [])) {
        if (!cp || seenCorpseIds.has(cp.id)) continue;
        seenCorpseIds.add(cp.id);
        const kind = cp.kind || '';
        if (kind === 'person' || kind === 'villager') deaths.push({ name: cp.name || 'someone', day: curDay(), cause: cp.cause || 'unknown' });
      }
      // r50 SEEDED CRACK: first depth>=2 NPC-NPC pair gets an
      // ambush-outcome grievance via the game's own recordGrievance
      // ('ambushed', 60 — exactly what the ambush plot records).
      // Seeded at END of day (after convos/snapshots), so the pair's
      // pre-seed bond state is exact and steering starts next day.
      try {
        if (!seeded.pair && !Game.over) {
          const vv = Game.state.village || {};
          const bonds = vv.bonds || {};
          const cand = [];
          for (const k of Object.keys(bonds)) {
            const bnd = bonds[k] || {};
            if ((bnd.depth || 0) < 2) continue;
            const parts = String(k).split('|');
            const a = parts[0], b = parts[1];
            if (!a || !b || a === me() || b === me()) continue;
            try { if ((Game.getPerson(a) || {}).dead || (Game.getPerson(b) || {}).dead) continue; } catch (e) {}
            cand.push({ a, b, v: bnd.v || 0, depth: bnd.depth || 0 });
          }
          cand.sort((x, y) => (x.a + '|' + x.b < y.a + '|' + y.b ? -1 : 1));
          if (cand.length) {
            const c = cand[0];
            const pre = { v: c.v, depth: c.depth };
            Game.recordGrievance(c.a, c.b, 'ambushed', 60);
            let post = pre;
            try { const bnd = Game.bondGet(c.a, c.b) || {}; post = { v: bnd.v || 0, depth: bnd.depth || 0 }; } catch (e) {}
            seeded.pair = { a: String(c.a), b: String(c.b), aName: vname(Game, c.a), bName: vname(Game, c.b) };
            seeded.day = curDay();
            seeded.pre = pre; seeded.post = post;
          }
        }
      } catch (e) {}
    },
  });
  const result = await runDays(Game, pol, { days, manifest: mf });
  snapshotBonds(true);

  // --- bond trajectory analysis ---
  const pairHist = {};   // key -> [{day, v, depth}]
  for (const s of bondSnaps) for (const p of s.pairs) {
    (pairHist[p.k] = pairHist[p.k] || []).push({ day: s.day, v: p.v, depth: p.depth });
  }
  const npcPairs = Object.keys(pairHist).map(k => {
    const h = pairHist[k];
    const maxDepth = Math.max(...h.map(x => x.depth));
    const minDepth = Math.min(...h.map(x => x.depth));
    const maxV = Math.max(...h.map(x => x.v));
    const firstDeep2 = h.find(x => x.depth >= 2);
    return {
      k, aName: h[0] && pairHist[k] ? undefined : undefined,
      maxDepth, minDepth, maxV,
      firstDeep2Day: firstDeep2 ? firstDeep2.day : null,
      finalDepth: h[h.length - 1].depth, finalV: h[h.length - 1].v,
      dropped: maxDepth - h[h.length - 1].depth,   // how much depth was lost
    };
  });
  // attach names
  const nameOf = {};
  for (const s of bondSnaps) for (const p of s.pairs) { nameOf[p.a] = p.aName; nameOf[p.b] = p.bName; }
  for (const np of npcPairs) { const [a, b] = np.k.split('|'); np.aName = nameOf[a] || a; np.bName = nameOf[b] || b; }
  const deep2Pairs = npcPairs.filter(p => p.maxDepth >= 2);
  // grievance -> depth drop within 7d (M2)
  const cracks = [];
  for (const g of grievances) {
    const k = Game.bondKey ? safe(() => Game.bondKey(g.by, g.against), g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by) : (g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by);
    const h = pairHist[k];
    if (!h) continue;
    const before = h.filter(x => x.day <= g.day).slice(-1)[0];
    const after = h.filter(x => x.day > g.day && x.day <= g.day + 7).slice(-1)[0];
    if (before && after && after.depth <= before.depth - 1) {
      cracks.push({ day: g.day, byName: g.byName, againstName: g.againstName, kind: g.kind, depthBefore: before.depth, depthAfter: after.depth });
    }
  }
  // r48 M2-revised: grievance -> warmth (v) drop >= 10 within 7d, and
  // grievances between depth>=2 pairs (the rare event r47 never saw).
  const vCracks = [];
  const friendGrievances = [];
  for (const g of grievances) {
    const k = Game.bondKey ? safe(() => Game.bondKey(g.by, g.against), g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by) : (g.by < g.against ? g.by + '|' + g.against : g.against + '|' + g.by);
    const h = pairHist[k];
    if (!h) continue;
    const before = h.filter(x => x.day <= g.day).slice(-1)[0];
    const after = h.filter(x => x.day > g.day && x.day <= g.day + 7).slice(-1)[0];
    if (!before || !after) continue;
    if (before.depth >= 2) friendGrievances.push({ day: g.day, byName: g.byName, againstName: g.againstName, kind: g.kind, depthBefore: before.depth, vBefore: before.v, vAfter: after.v });
    if (before.v - after.v >= 10) vCracks.push({ day: g.day, byName: g.byName, againstName: g.againstName, kind: g.kind, vBefore: before.v, vAfter: after.v, depthBefore: before.depth, depthAfter: after.depth });
  }
  // r49 STATE grievances: first appearance per (source,pair,kind) across
  // daily snapshots; score friend-at-appearance + v-drop within 7d (M2-state).
  // NOTE: repeat same-kind grievances between a pair collapse to first
  // appearance (state snapshots cannot count identical entries apart).
  const bondKeyOf = (a, b) => Game.bondKey ? safe(() => Game.bondKey(a, b), a < b ? a + '|' + b : b + '|' + a) : (a < b ? a + '|' + b : b + '|' + a);
  const stateSeen = {};
  const stateGrievances = [];
  for (const snap of grievStateSnaps) {
    for (const g of snap.betrayal) {
      const key = 'bet|' + g.by + '|' + g.against + '|' + g.kind;
      if (stateSeen[key]) continue;
      stateSeen[key] = true;
      stateGrievances.push({ source: 'betrayal', day: snap.day, by: g.by, against: g.against, kind: g.kind, recDay: g.day });
    }
    for (const c of snap.conflicts) {
      if (c.resolved) continue;
      const key = 'conf|' + (c.a < c.b ? c.a + '|' + c.b : c.b + '|' + c.a);
      if (stateSeen[key]) continue;
      stateSeen[key] = true;
      stateGrievances.push({ source: 'conflicts', day: snap.day, by: c.a, against: c.b, kind: 'conflict', recDay: snap.day });
    }
  }
  const stateFriendGrievances = [];
  const stateVCracks = [];
  for (const g of stateGrievances) {
    const k = bondKeyOf(g.by, g.against);
    const h = pairHist[k];
    if (!h) continue;
    const before = h.filter(x => x.day <= g.day).slice(-1)[0];
    const after = h.filter(x => x.day > g.day && x.day <= g.day + 7).slice(-1)[0];
    if (!before || !after) continue;
    if (before.depth >= 2) stateFriendGrievances.push({ day: g.day, source: g.source, byName: undefined, againstName: undefined, kind: g.kind, depthBefore: before.depth, vBefore: before.v, vAfter: after.v });
    if (before.v - after.v >= 10) stateVCracks.push({ day: g.day, source: g.source, kind: g.kind, vBefore: before.v, vAfter: after.v, depthBefore: before.depth, depthAfter: after.depth });
  }
  // attach names to state grievance rows
  for (const row of [...stateFriendGrievances, ...stateVCracks]) {
    const g = stateGrievances.find(x => x.day === row.day && x.source === row.source && x.kind === row.kind);
    if (g) { row.byName = vname(Game, g.by); row.againstName = vname(Game, g.against); }
  }
  // 'close' reads naming ledger pairs (M3): for each t2pick with why=close,
  // look up the pair's ledger depth AT THAT DAY (pairHist, r48 method) AND
  // the exact live class at pick time (r49 wrap values).
  const closeReads = [];
  for (const tp of t2picks) {
    if (tp.why !== 'close') continue;
    const k = tp.vid < tp.id ? tp.vid + '|' + tp.id : tp.id + '|' + tp.vid;
    const h = pairHist[k];
    let ledgerDepth = null, ledgerV = null;
    if (h) {
      const at = h.filter(x => x.day <= tp.day).slice(-1)[0] || h[0];
      ledgerDepth = at.depth; ledgerV = at.v;
    }
    const nd = (tp.namedDepth === undefined || tp.namedDepth === null) ? null : tp.namedDepth;
    const cls = nd !== null && nd >= 2 ? 'TP' : nd === null ? 'null' : (tp.speakerHasDeep2 ? 'missed-TP' : 'shallow');
    closeReads.push({ day: tp.day, vidName: tp.vidName, idName: tp.idName, why: tp.why, ledgerDepth, ledgerV, liveDepth: nd, speakerHasDeep2: !!tp.speakerHasDeep2, inGroup: !!tp.inGroup, cls });
  }
  const firstDeep2DayAll = deep2Pairs.length ? Math.min(...deep2Pairs.map(p => p.firstDeep2Day).filter(d => d !== null)) : null;
  for (const cr of closeReads) cr.late = firstDeep2DayAll !== null && cr.day >= firstDeep2DayAll;
  const lateClose = closeReads.filter(c => c.late);
  const lateTP = lateClose.filter(c => c.cls === 'TP');
  const lateNull = lateClose.filter(c => c.cls === 'null');
  const condRate = lateClose.length ? (lateTP.length / lateClose.length) : null;
  const pooledTP = closeReads.filter(c => c.cls === 'TP').length;
  const pooledRate = closeReads.length ? (pooledTP / closeReads.length) : null;
  const grievReads = t2picks.filter(tp => tp.why === 'grievance' || tp.why === 'vgrievance');
  const grievReadsByWhy = { grievance: grievReads.filter(g => g.why === 'grievance').length, vgrievance: grievReads.filter(g => g.why === 'vgrievance').length };
  const closeReadsTotal = convoLog.reduce((s, o) => s + o.closeReads, 0);
  const grievanceServesTotal = convoLog.reduce((s, o) => s + o.grievanceServes, 0);
  const knackGossipsTotal = convoLog.reduce((s, o) => s + o.knackGossips, 0);
  const knackLines = [];
  for (const o of convoLog) for (const e of o.transcript) if (isKnackGossipLine(e.text)) knackLines.push({ seedDay: o.day, convo: o.name, text: e.text });
  // r53 KNACK BAR REVISION (r52 metric review): same-speaker repeats only.
  // Same villager retelling the same knack on another day = a repeat;
  // a DIFFERENT villager retelling it = circulation (lore, not defect).
  const knackBySpeakerText = {};
  for (const k of knackLines) {
    const key = k.convo + '||' + String(k.text || '').trim().toLowerCase();
    (knackBySpeakerText[key] = knackBySpeakerText[key] || { name: k.convo, text: k.text, days: [] }).days.push(k.seedDay);
  }
  const knackSameSpeakerRepeats = Object.values(knackBySpeakerText).filter(x => x.days.length > 1)
    .map(x => ({ name: x.name, text: String(x.text).slice(0, 120), count: x.days.length, days: x.days }));
  const knackByText = {};
  for (const k of knackLines) {
    const key = String(k.text || '').trim().toLowerCase();
    (knackByText[key] = knackByText[key] || { text: k.text, speakers: new Set() }).speakers.add(k.convo);
  }
  const knackCrossSpeakerRetells = Object.values(knackByText).filter(x => x.speakers.size > 1)
    .map(x => ({ text: String(x.text).slice(0, 120), speakers: [...x.speakers] }));

  // r50 FUNNEL + WINDOWS (natural only: mode deep, tag != seeded-speaker).
  const naturalConvos = convoLog.filter(o => o.mode === 'deep' && o.tag !== 'seeded-speaker');
  const funnelCounts = {};
  for (const o of naturalConvos) funnelCounts[o.funnelClass || 'unknown'] = (funnelCounts[o.funnelClass || 'unknown'] || 0) + 1;
  const funnel = {
    totalNaturalConvos: naturalConvos.length,
    subjectReached: naturalConvos.filter(o => o.sawSubjectMenu).length,
    offered: naturalConvos.filter(o => o.sawOthersOffer).length,
    mainOffered: naturalConvos.filter(o => o.sawMainOthersOffer).length,
    subjectOffered: naturalConvos.filter(o => o.sawSubjectOthersOffer).length,
    picked: naturalConvos.filter(o => o.pickedOthers).length,
    classes: funnelCounts,
  };
  // r53 F1 STRICT (prereg): unsteered natural convos only — the daily
  // others-steer (othersSteered) and seeded-speaker convos are excluded,
  // so the menu fix is judged on what natural play surfaces, not steering.
  const unsteeredConvos = naturalConvos.filter(o => !o.othersSteered);
  const funnelUnsteered = {
    totalNaturalUnsteered: unsteeredConvos.length,
    subjectNoOffer: unsteeredConvos.filter(o => o.funnelClass === 'subject-no-offer').length,
    offered: unsteeredConvos.filter(o => o.sawOthersOffer).length,
    // r55 MENU SPLIT: convo-level attribution (a convo can touch both
    // menus, so main+subject may exceed offered; late picks split the same
    // way — the F1m mechanism measure).
    mainOffered: unsteeredConvos.filter(o => o.sawMainOthersOffer).length,
    subjectOffered: unsteeredConvos.filter(o => o.sawSubjectOthersOffer).length,
    picked: unsteeredConvos.filter(o => o.pickedOthers).length,
    latePicks: unsteeredConvos.filter(o => o.pickedOthers && o.day >= 91).length,
    latePicksMain: unsteeredConvos.filter(o => o.pickedOthers && o.day >= 91 && (o.othersPickMenus || []).includes('main')).length,
    latePicksSubject: unsteeredConvos.filter(o => o.pickedOthers && o.day >= 91 && (o.othersPickMenus || []).includes('subject')).length,
    latePicksBySeed: null,
  };
  funnelUnsteered.subjectNoOfferRate = funnelUnsteered.totalNaturalUnsteered
    ? funnelUnsteered.subjectNoOffer / funnelUnsteered.totalNaturalUnsteered : null;
  // r56: unsteered class counts (for the conversion ceiling: offered minus
  // offered-not-fresh re-offers). Flows into verdicts via funnelUnsteered.
  const unsteeredCounts = {};
  for (const o of unsteeredConvos) unsteeredCounts[o.funnelClass || 'unknown'] = (unsteeredCounts[o.funnelClass || 'unknown'] || 0) + 1;
  funnelUnsteered.classes = unsteeredCounts;
  const WIN_LABELS = ['1-30', '31-60', '61-90', '91-120', '121+'];
  const windows = WIN_LABELS.map(label => ({ window: label, picks: 0 }));
  let naturalPicks = 0, seededPicks = 0;
  for (const tp of t2picks) {
    if (tp.seededSteered) { seededPicks++; continue; }
    naturalPicks++;
    const d = tp.day || 0;
    const bi = d < 1 ? 0 : Math.min(4, Math.floor((d - 1) / 30));
    windows[bi].picks++;
  }
  // r50 SEEDED effect: +7d bond move (5d snapshots) + serve within 30d.
  let seededEffect = null;
  if (seeded.pair) {
    const k = bondKeyOf(seeded.pair.a, seeded.pair.b);
    const h = pairHist[k] || [];
    const after7 = h.filter(x => x.day > seeded.day && x.day <= seeded.day + 7);
    const last7 = after7.length ? after7[after7.length - 1] : null;
    const firstServe = seeded.serves.length ? seeded.serves[0] : null;
    const serveWithin30 = !!(firstServe && firstServe.day <= seeded.day + 30);
    const vDrop = last7 ? (seeded.pre.v - last7.v) : null;
    const depthDrop = last7 ? (seeded.pre.depth - last7.depth) : null;
    const crack7 = (depthDrop !== null && depthDrop >= 1) || (vDrop !== null && vDrop >= 10);
    // r52 CRACK TRACE classification from the daily trajectory.
    let crackTraceClass = null;
    try {
      const d7 = seededDaily.find(x => x.day === seeded.day + 7);
      const d14 = seededDaily.find(x => x.day === seeded.day + 14);
      const vPre = seeded.pre.v;
      if (d7 && d7.v !== null && d7.v > vPre) crackTraceClass = 'rise';
      else if (d14 && d14.v !== null && d14.v <= vPre - 10) crackTraceClass = 'stick';
      else if (d7 && d7.v !== null && d7.v <= vPre - 10 && d14 && d14.v !== null && d14.v >= vPre - 10) crackTraceClass = 'fade';
      else if (d7 && d7.v !== null && d7.v <= vPre - 10) crackTraceClass = 'dropped-unresolved';
      else crackTraceClass = 'no-drop';
    } catch (e) {}
    seededEffect = {
      pair: seeded.pair, day: seeded.day, pre: seeded.pre, post: seeded.post,
      daily: seededDaily, crackTraceClass,
      vAt7: last7 ? last7.v : null, depthAt7: last7 ? last7.depth : null,
      vDrop, depthDrop, crack7: !!crack7, firstServe, serveWithin30,
      serves: seeded.serves.length, servesAll: seeded.serves,
      effect: !!(crack7 || serveWithin30),
    };
  }

  const v = Game.state.village || {};
  let mootsConvened = 0;
  try { mootsConvened = (v.moots || []).length; } catch (e) {}
  const deathCauses = {};
  for (const d of deaths) { const k = String(d.cause || 'unknown'); deathCauses[k] = (deathCauses[k] || 0) + 1; }
  const repeatHits = [];
  for (const o of convoLog) for (const r of (o.repeatHits || [])) repeatHits.push({ day: o.day, name: o.name, turn: r.turn, pickId: r.pickId, line: r.line });
  const trustSum = livingIds().reduce((s, id) => s + trustOf(id), 0);
  const totalNpc = convoLog.reduce((s, o) => s + o.npcTurns, 0);
  const totalDry = convoLog.reduce((s, o) => s + o.dryLines, 0);
  return {
    seed, steering: steeringOn, arm: runState.arm, days: curDay(), deaths, deathCauses, alive: livingIds().length,
    // r67 WILD-NAMING RECORD (recording only): the party-naming fix's
    // wild effect — name + the day it was formed, if the driver ever
    // completed a naming through conversation on this seed.
    partyNamed: safe(() => Game.partyName(), null),
    partyFormedDay: safe(() => (Game.state.village || {}).partyFormed, null),
    convos: convoLog.length, deepConvos: convoLog.filter(o => o.mode === 'deep').length,
    gossipPicks: runState.gossipPicksTotal, gossipPicksToday: runState.gossipPicks,
    reofferOffers: convoLog.filter(o => o.othersReofferOffer).length,
    reofferPicks: convoLog.filter(o => o.othersReofferPick).length,
    reofferLatePicks: convoLog.filter(o => o.othersReofferPick && o.day >= 91).length,
    reofferMissed: convoLog.filter(o => o.othersPickChanged && !o.sawOthersOffer).length,
    wrapServes: convoLog.filter(o => o.grievanceWrapServe).length,
    wrapServeClasses: (() => { const c = { 'grievance-line': 0, deflection: 0, other: 0 };
      for (const o of convoLog) if (o.wrapServeClass) c[o.wrapServeClass] = (c[o.wrapServeClass] || 0) + 1; return c; })(),
    wrapServeConvos: convoLog.filter(o => o.grievanceWrapServe).map(o => ({ day: o.day, name: o.name, tag: o.tag, cls: o.wrapServeClass, grievanceServes: o.grievanceServes, deflectionLines: o.deflectionLines })),
    funnelProbe: (() => { const probes = []; for (const o of convoLog) for (const pr of (o.subjectNoOfferProbes || [])) probes.push({ day: o.day, name: o.name, tag: o.tag, ...pr });
      const menuProblem = probes.filter(pr => pr.pick && pr.pick.why !== 'neutral').length;
      return { turns: probes.length, menuProblem, pickProblem: probes.length - menuProblem, probes }; })(),
    traceCensus,
    wrapServeMatcherHits: convoLog.filter(o => o.grievanceWrapServe && o.grievanceServes > 0).length,
    funnel, funnelUnsteered, windows, naturalPicks, seededPicks, naturalConvos: naturalConvos.length,
    seededEffect,
    t2picksTotal: t2picks.length, t2picksList: t2picks, closeReadsTotal, closeReads,
    grievReads: grievReads.map(g => ({ day: g.day, vidName: g.vidName, idName: g.idName, why: g.why })),
    grievanceServesTotal, grievances, cracks, vCracks, friendGrievances,
    stateGrievances, stateFriendGrievances, stateVCracks, grievStateSnapDays: grievStateSnaps.length, rosterByDay,
    // r67 DIAG (env-gated, post-band investigation only; never in the verdict series):
    // per-conversation engine-counter vs scanned-dry projection for the 6102 delta.
    perConvoDiag: process.env.DIAG_PERCONVO ? convoLog.map(o => ({ tag: o.tag, day: o.day, name: o.name, turns: o.turns, dry9Lines: o.dry9Lines, self3Lines: o.self3Lines, dryFamLines: o.dryFamLines, dryTurns: (o.dryTurns || []).length, counterDry: o.counterDry, counterSelf: o.counterSelf, endOnDry: o.endOnDry })) : undefined,
    firstDeep2DayAll, lateClose: lateClose.length, lateTP: lateTP.length, lateNull: lateNull.length,
    condRate, pooledTP, pooledRate, grievReadsByWhy,
    othersSteered: convoLog.reduce((s, o) => s + (o.othersSteered ? 1 : 0), 0),
    lingerPicks: convoLog.reduce((s, o) => s + (o.lingerPick ? 1 : 0), 0),
    knackGossipsTotal, knackLines, knackSameSpeakerRepeats, knackCrossSpeakerRetells,
    npcPairCount: npcPairs.length, deep2Pairs,
    bondSnapDays: bondSnaps.length,
    mootsConvened,
    l3: { bonds: npcPairs.length, deep2: deep2Pairs.length, cracks: cracks.length, vCracks: vCracks.length, friendGrievances: friendGrievances.length, t2picks: t2picks.length, avgTrust: livingIds().length ? (trustSum / livingIds().length).toFixed(1) : 'n/a' },
    favorOffers: runState.favorOffers, favorAccepts: runState.favorAccepts, outingLog: runState.outingLog,
    posHistory: runState.posHistory || {}, posHistoryMidday: runState.posHistoryMidday || {}, stuckDaysEnd: runState.stuckDays || {},
    favorEndStates: (() => { try { return OUTWEDGE.favorEndStates(Game); } catch (e) { return []; } })(),
    favorFunnel: (() => {
      const offers = runState.favorOffers, accepts = runState.favorAccepts, log = runState.outingLog;
      const step = (s) => log.filter(r => r.step === s).length;
      const complete = (() => {
        try {
          // r65 SHAKEDOWN FIX: completion is PHYSICAL (started, pressed,
          // delivered), not the favor.state string — a delivered outing's
          // favor later moves on to 'thanked', which the old
          // state==='fulfilled' rule missed (Molly d14: delivered 990,
          // counted 0). Promise-keeping is reported alongside, matched
          // by favorId (see favorEndStates).
          return OUTWEDGE.favorEndStates(Game).filter(es => (es.forageCount || 0) >= 1 && (es.deliveredKcal || 0) > 0 && es.returnedDay !== null).length;
        } catch (e) { return 0; }
      })();
      const keptMatched = (() => {
        try {
          return OUTWEDGE.favorEndStates(Game).filter(es => es.promiseKept === true).length;
        } catch (e) { return 0; }
      })();
      const completeEvents = (() => {
        const seen = new Set(); let n = 0;
        for (const r of log) if (r.step === 'deliver' && r.ok && (r.deliveredKcal || 0) > 0 && !seen.has(r.favorId)) { seen.add(r.favorId); n++; }
        return n;
      })();
      const keptStrict = (() => {
        try { return OUTWEDGE.favorEndStates(Game).filter(es => es.promiseKept === true).length; } catch (e) { return 0; }
      })();
      const barrenKindCount = (k) => log.filter(r => r.step === 'forage-barren' && r.barrenKind === k).length;
      return { offers: offers.length, forageOffers: offers.filter(o => o.kind === 'forage_help').length, otherFavorOffers: offers.filter(o => o.kind !== 'forage_help').length, accepts: accepts.filter(a => a.accepted).length, acceptAttempts: accepts.length, waits: step('wait'), starts: step('start'), startBlocked: step('start-blocked'), forages: step('forage'), forageNodeBarren: step('forage-node-barren'), forageBarren: step('forage-barren'), forageBarrenTravel: barrenKindCount('travel-blocked'), forageBarrenNode: barrenKindCount('node-barren'), forageTravelBlocked: step('forage-travel-blocked'), forageTravelWalked: step('forage-travel-walked'), stepRetries: step('start-step-retry'), retryAssigned: log.filter(r => r.step === 'start-step-retry' && r.stepAssigned).length, retryStarts: log.filter(r => r.step === 'start' && r.retryFromStep).length, outingsEndedStuck: step('outing-ended-stuck'), outingsEndBlocked: step('outing-end-blocked'), talks: step('talk'), delivers: step('deliver'), deliverBlocked: step('deliver-blocked'), completeOutings: complete, completeOutingsEvents: completeEvents, keptMatched: keptMatched, keptMatchedStrict: keptStrict };
    })(),
    inviteDecisions,
    inviteCensus: (() => {
      const byKind = (kind) => {
        const rows = inviteDecisions.filter(d => d.kind === kind);
        const acc = rows.filter(d => d.accept).length;
        const ch = rows.map(d => d.chance).filter(x => typeof x === 'number');
        const vetoes = {}; for (const d of rows) if (d.veto) vetoes[d.veto] = (vetoes[d.veto] || 0) + 1;
        return { n: rows.length, accepts: acc, acceptRate: rows.length ? acc / rows.length : null, vetoes,
          chanceMin: ch.length ? Math.min(...ch) : null, chanceMax: ch.length ? Math.max(...ch) : null,
          chanceMean: ch.length ? +(ch.reduce((a, b) => a + b, 0) / ch.length).toFixed(1) : null };
      };
      const probeRows = inviteDecisions.filter(d => d.kind === 'party' && d.probe);
      return { lure: byKind('lure'), party: byKind('party'),
        partyProbe: { n: probeRows.length, accepts: probeRows.filter(d => d.accept).length,
          acceptRate: probeRows.length ? probeRows.filter(d => d.accept).length / probeRows.length : null },
        partyProbeConvos: convoLog.filter(o => o.partyProbePick).length,
        partyProbePicks: convoLog.reduce((a, o) => a + (o.partyProbePick ? 1 : 0), 0),
        convosWithInviteOffer: convoLog.filter(o => o.sawInvitePartyOffer).length };
    })(),
    stallCensus: (() => {
      const all = convoLog; const deep = convoLog.filter(o => o.mode === 'deep');
      const totalStall = all.reduce((sum, o) => sum + (o.stallLines || 0), 0);
      const withStall = all.filter(o => (o.stallLines || 0) > 0).length;
      const hist = { '0': 0, '1': 0, '2': 0, '3+': 0 };
      for (const o of all) { const n = o.stallLines || 0; hist[n >= 3 ? '3+' : String(n)]++; }
      const prePick = {};
      for (const o of all) for (const st of (o.stallTurns || [])) {
        const k = /^(agree|joke|silence|react:)/.test(st.pickId || '') ? 'react' : (/^(ask:|want:|gq:|dlg:)/.test(st.pickId || '') ? 'topic' : 'other');
        prePick[k] = (prePick[k] || 0) + 1;
      }
      const follows = [];
      for (const o of all) for (const f of (o.stallFollows || [])) follows.push({ day: o.day, name: o.name, who: f.who, text: f.text });
      const deepStall = deep.reduce((sum, o) => sum + (o.stallLines || 0), 0);
      return { totalConvos: all.length, deepConvos: deep.length, totalStallLines: totalStall, convosWithStall: withStall,
        shareWithStall: all.length ? (withStall / all.length) : 0, stallsPerConvo: all.length ? (totalStall / all.length) : 0,
        deepStallLines: deepStall, stallsPerDeepConvo: deep.length ? (deepStall / deep.length) : 0, hist, prePick, follows };
    })(),
    dryCensus: (() => {
      const all = convoLog; const deep = convoLog.filter(o => o.mode === 'deep');
      const tot = all.reduce((sum, o) => sum + (o.dryFamLines || 0), 0);
      const tot9 = all.reduce((sum, o) => sum + (o.dry9Lines || 0), 0);
      const tot3 = all.reduce((sum, o) => sum + (o.self3Lines || 0), 0);
      const withDry = all.filter(o => (o.dryFamLines || 0) > 0).length;
      const endDry = all.filter(o => o.endOnDry).length;
      const hist = { '0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5+': 0 };
      for (const o of all) { const n = o.dryFamLines || 0; hist[n >= 5 ? '5+' : String(n)]++; }
      const prePick = {}; const prePick9 = {}; const follows = [];
      for (const o of all) for (const dt of (o.dryTurns || [])) {
        const k = dryPickClass(dt.pickId); prePick[k] = (prePick[k] || 0) + 1;
        if (dt.pool === 'dry9') prePick9[k] = (prePick9[k] || 0) + 1;
      }
      for (const o of all) for (const f of (o.dryFollows || [])) follows.push({ day: o.day, name: o.name, who: f.who, text: f.text });
      const followClass = (txt) => {
        const t = String(txt || '');
        if (/lost my train of thought|never mind|forget it|where was i|out of my head|not coming back|lost it|slipped away|wasn'?t important|i just said|i just told you|covered this one/i.test(t)) return 'another-dry';
        if (/bye|goodbye|\bleave\b|talk again|talk later|rest when you can|we'll talk/i.test(t)) return 'close';
        if (/remind|where were|were saying|back to|so,? (you|we) were|anyway/i.test(t)) return 'recap';
        if (/\?/.test(t)) return 'question';
        return 'other';
      };
      const followCounts = {}; for (const f of follows) { const c = followClass(f.text); followCounts[c] = (followCounts[c] || 0) + 1; }
      const noFollow = tot - follows.length;
      // r65 dry9Detail: one record per dry9 turn (follow kind, retry
      // outcome, position, pick class). Turn records are driver-only.
      const dry9Detail = [];
      for (let ci = 0; ci < all.length; ci++) {
        const o = all[ci];
        const recs = o.turnRecs || [];
        for (const dt of (o.dryTurns || [])) {
          if (dt.pool !== 'dry9') continue;
          const next = recs.find(r => r.turn === dt.turn + 1);
          let followKind = 'end';
          // r67 amendment A: record whether the next turn added entries at all,
          // so another-dry splits into true chains vs stale-lastLine phantoms.
          const followNextAdded = next ? (next.added === undefined ? null : next.added) : null;
          const followNextLastLine = next ? String(next.lastLine || '').slice(0, 120) : '';
          if (next && next.lastLine) {
            const fl = String(next.lastLine);
            if (next.dry9 || dryPoolOf(fl) === 'dry9' || dryPoolOf(fl) === 'self3') followKind = 'another-dry';
            else if (isCloseReadLine(fl)) followKind = 'close';
            else followKind = 'substantive';
          }
          const later = recs.filter(r => r.turn > dt.turn && r.pickId === dt.pickId);
          const retry = later[0] || null;
          let retryKind = 'none';
          if (retry) retryKind = retry.dry9 ? 'dry9' : (dryPoolOf(retry.lastLine) === 'self3' ? 'self3' : 'substantive');
          const turnsTotal = o.turns || 0;
          dry9Detail.push({ convoIdx: ci, day: o.day, name: o.name, turn: dt.turn, turnsTotal,
            posFrac: turnsTotal > 0 ? +(dt.turn / turnsTotal).toFixed(2) : 0,
            pickId: dt.pickId, pickClass: dryPickClass(dt.pickId),
            followKind, followNextAdded, followNextLastLine, retried: !!retry, retryKind });
        }
      }
      const dry9FollowCounts = {}; const dry9RetryCounts = {}; const dry9PickCounts = {};
      const dry9PosBuckets = { 'early-0-1': 0, 'mid-2-4': 0, 'late-5plus': 0 };
      for (const d of dry9Detail) {
        dry9FollowCounts[d.followKind] = (dry9FollowCounts[d.followKind] || 0) + 1;
        dry9RetryCounts[d.retryKind] = (dry9RetryCounts[d.retryKind] || 0) + 1;
        dry9PickCounts[d.pickClass] = (dry9PickCounts[d.pickClass] || 0) + 1;
        if (d.turn <= 1) dry9PosBuckets['early-0-1']++;
        else if (d.turn <= 4) dry9PosBuckets['mid-2-4']++;
        else dry9PosBuckets['late-5plus']++;
      }
      const dry9EndConvoIdx = new Set();
      for (const d of dry9Detail) if (d.turnsTotal > 0 && d.turn === d.turnsTotal - 1) dry9EndConvoIdx.add(d.convoIdx);
      const dry9EndConvoCount = dry9EndConvoIdx.size;
      const ctrDry = all.reduce((sum, o) => sum + (o.counterDry || 0), 0);
      const ctrSelf = all.reduce((sum, o) => sum + (o.counterSelf || 0), 0);
      // r67 OPENING GAP: scanned turn-dry (tot) vs engine counter (ctrDry)
      // vs scanned + opening dry. gapBefore is the r66 residual; gapAfter
      // must be 0 on every seed for GAP-CLOSES.
      const openingTot = all.reduce((sum, o) => sum + (o.openingDryLines || 0), 0);
      const openingTot9 = all.reduce((sum, o) => sum + (o.openingDry9Lines || 0), 0);
      const openingTot3 = all.reduce((sum, o) => sum + (o.openingSelf3Lines || 0), 0);
      // r67 AMENDMENT B (pilot-caught, recording only): scan-liveness
      // proof + in-census empty-turn and speaker aggregations. The
      // per-seed JSON deletes _convoLog before writing, so any census
      // that reads turnRecs must be built here, inside dryCensus.
      const openingConvosScanned = all.filter(o => o.openingScanned).length;
      const openingEntriesScanned = all.reduce((sum, o) => sum + (o.openingEntries || 0), 0);
      const emptyTurnCensus = (() => {
        const byPick = {}, midNext = {}, deadPicks = [];
        let total = 0, mid = 0, last = 0, midNonNav = 0;
        const isNavPick = (id) => /^menu:/.test(String(id || ''));
        for (const o of all) {
          const recs = o.turnRecs || [];
          const turnsTotal = o.turns || 0;
          for (const rec of recs) {
            if (rec.added !== 0) continue;
            total++;
            const k = String(rec.pickId || '?');
            byPick[k] = (byPick[k] || 0) + 1;
            if (rec.turn === turnsTotal - 1) last++;
            else {
              mid++;
              const nx = recs.find(x => x.turn === rec.turn + 1);
              const nk = nx ? `${String(nx.pickId || '?')}/added=${nx.added}` : 'none';
              midNext[nk] = (midNext[nk] || 0) + 1;
              if (!isNavPick(k)) { midNonNav++; if (deadPicks.length < 50) deadPicks.push({ day: o.day, name: o.name, turn: rec.turn, turnsTotal, pickId: k }); }
            }
          }
        }
        return { total, mid, last, midNonNav, byPick, midNext, deadPicks };
      })();
      const speakerDry9 = {};
      for (const o of all) {
        const nm = o.name || '?';
        speakerDry9[nm] = speakerDry9[nm] || { convos: 0, dry9: 0 };
        speakerDry9[nm].convos++;
        speakerDry9[nm].dry9 += (o.dry9Lines || 0) + (o.openingDry9Lines || 0);
      }
      return { totalConvos: all.length, deepConvos: deep.length, totalDryLines: tot, dry9Lines: tot9, self3Lines: tot3,
        convosWithDry: withDry, shareWithDry: all.length ? (withDry / all.length) : 0, dryPerConvo: all.length ? (tot / all.length) : 0,
        convosEndingOnDry: endDry, shareEndingOnDry: all.length ? (endDry / all.length) : 0, hist, prePick, prePick9,
        followCounts, noFollow, follows: follows.slice(0, 400),
        dry9Detail, dry9FollowCounts, dry9RetryCounts, dry9PickCounts, dry9PosBuckets, dry9EndConvoCount,
        counterDryTotal: ctrDry, counterSelfTotal: ctrSelf,
        openingDryTotal: openingTot, openingDry9Total: openingTot9, openingSelf3Total: openingTot3,
        gapBefore: ctrDry - tot, gapAfter: ctrDry - (tot + openingTot),
        openingConvosScanned, openingEntriesScanned, emptyTurnCensus, speakerDry9,
        deepDryLines: deep.reduce((sum, o) => sum + (o.dryFamLines || 0), 0),
        coldOpenDryConvos: all.filter(o => o.coldOpenDry).length, coldOpenSeenConvos: all.filter(o => o.coldOpenDry !== null).length,
        coldOpenDryRate: all.filter(o => o.coldOpenDry !== null).length ? (all.filter(o => o.coldOpenDry).length / all.filter(o => o.coldOpenDry !== null).length) : 0 };
    })(),
    repeatCount: repeatHits.length, repeats: repeatHits.slice(0, 20),
    dryRate: totalNpc ? (totalDry / totalNpc * 12).toFixed(2) : '0.00',
    endState: {
      over: !!Game.over, villageLost: !!Game.villageLost,
      scattered: !!((Game.state.village || {}).scattered),
      extinct: !!((Game.state.village || {}).extinct),
      scholarExiled: !!((Game.state.scholar || {}).exiled),
      scholarDead: !!((safe(() => Game.getPerson(me()), null) || {}).dead),
    },
    _convoLog: convoLog,
  };
}

(async () => {
  console.log(`SMOKE: seed ${SMOKE_SEED}, ${SMOKE_DAYS} days (self-test: bond census + t2pickOther wrap + grievance wrap + convos + funnel + r52 probe/class + r65 favor/outing instruments)`);
  const smoke = await runWorld({ seed: SMOKE_SEED, days: SMOKE_DAYS, policyId: 'journey-social-r75-smoke', steering: true, arm: 'control' });
  console.log(`SMOKE: bondSnapDays=${smoke.bondSnapDays} convos=${smoke.convos} t2picks=${smoke.t2picksTotal} grievances=${smoke.grievances.length} npcPairs=${smoke.npcPairCount} grievStateSnaps=${smoke.grievStateSnapDays} funnelTotal=${smoke.funnel ? smoke.funnel.totalNaturalConvos : 'n/a'} traceBuilds=${smoke.traceCensus ? smoke.traceCensus.totalBuilds : 'n/a'} traceCacheHits=${smoke.traceCensus ? smoke.traceCensus.cacheHits : 'n/a'} probeTurns=${smoke.funnelProbe ? smoke.funnelProbe.turns : 'n/a'} probeTraced=${smoke.funnelProbe ? smoke.funnelProbe.probes.filter(pr => pr.r59 && pr.r59.trace).length : 'n/a'}`);
  console.log(`SMOKE-INVITE: decisions=${(smoke.inviteDecisions || []).length} lure=${smoke.inviteCensus ? smoke.inviteCensus.lure.n : 'n/a'} partyProbe=${smoke.inviteCensus ? smoke.inviteCensus.partyProbe.n : 'n/a'} (wrap live if Game.npcInviteDecision existed; 0 decisions in 30d is report-only, not a gate)`);
  console.log(`SMOKE-FAVOR: offers=${(smoke.favorOffers || []).length} forageOffers=${smoke.favorFunnel ? smoke.favorFunnel.forageOffers : 'n/a'} accepts=${smoke.favorFunnel ? smoke.favorFunnel.accepts : 'n/a'} outingSteps=${(smoke.outingLog || []).length} (0 favors in 30d is report-only, not a gate — the wedge proof test, not smoke, proves the wedge)`);
  const realTest = smoke.bondSnapDays >= 2 && smoke.convos > 0 && smoke.t2picksTotal > 0 && smoke.grievStateSnapDays >= 2 && smoke.funnel && smoke.funnel.totalNaturalConvos > 0 && smoke.traceCensus && smoke.traceCensus.totalBuilds > 0 && smoke.funnelProbe && smoke.funnelProbe.turns > 0 && smoke.funnelProbe.probes.filter(pr => pr.r59 && pr.r59.trace).length === smoke.funnelProbe.turns;
  console.log(`SMOKE SELF-TEST: ${realTest ? 'PASS (bond census + grievance-state census live, t2pickOther wrap firing, convos ran, funnel live)' : 'FAIL (instrument broken — investigate before full seeds)'}`);
  if (!realTest) { console.log('ABORT: instrumentation self-test failed. Full seeds skipped.'); process.exit(3); }

  const results = [];
  for (const s of SEEDS) {
    try {
      const r = await runWorld({ seed: s, days: DAYCAP, policyId: 'journey-social-r75', steering: true, arm: ARM_OF[s] || 'control' });
      const convoLog = r._convoLog; delete r._convoLog;
      queueWrite(path.join(EVIDIR, `journey-social-r75-s${s}.json`), JSON.stringify(r, null, 1));
      const sname = (o) => o.name.replace(/\W+/g, '_');
      const tline = (e) => `${e.who}: ${e.text}`;
      // r50 sense-read set: as r49 (bond-relevant convos) + 1 late convo
      // per seed + 1 seeded-speaker convo per seed (serve or no-serve).
      const bondy = convoLog.filter(o => o.closeReads > 0 || o.grievanceServes > 0 || o.grievanceWrapServe || o.knackGossips > 0).slice(0, 3);
      const bondySaved = bondy.length ? bondy : convoLog.filter(o => o.mode === 'deep' && o.turns >= 4).slice(0, 2);
      bondySaved.forEach((o, i) => {
        queueWrite(path.join(TDIR, `s${s}-bondy-${i + 1}-${sname(o)}.txt`),
          [`# SURFACE+SEEDED sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart}, closeReads=${o.closeReads} grievanceServes=${o.grievanceServes} wrapServe=${o.grievanceWrapServe} knackGossips=${o.knackGossips})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // r51 WRAP-SERVE saves: serve convos saved from the WRAP record, not
      // the line matcher — so a future matcher miss can never lose prose.
      // (Deduped against bondy saves; the wrap flag is the ground truth.)
      // r52 SERVE SPLIT: save ALL wrap-serve convos (not slice(0,2)),
      // class in the filename so the deflection share is auditable.
      convoLog.filter(o => o.grievanceWrapServe && bondySaved.indexOf(o) === -1).forEach((o, i) => {
        queueWrite(path.join(TDIR, `s${s}-wrapserve-${o.wrapServeClass || 'unclass'}-${i + 1}-${sname(o)}.txt`),
          [`# WRAP-SERVE sense-read (${o.wrapServeClass}) — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart}, grievanceServes=${o.grievanceServes} deflectionLines=${o.deflectionLines} wrapServes=${o.grievanceWrapServes})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      const lates = convoLog.filter(o => o.mode === 'deep' && o.day >= 100 && o.turns >= 5).slice(0, 1);
      (lates.length ? lates : convoLog.filter(o => o.mode === 'deep' && o.turns >= 5).slice(-1)).forEach((o) => {
        queueWrite(path.join(TDIR, `s${s}-late-d${o.day}-${sname(o)}.txt`),
          [`# SURFACE+SEEDED late sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      const stallTop = convoLog.filter(o => (o.stallLines || 0) > 0).sort((a, b) => (b.stallLines - a.stallLines)).slice(0, 2);
      stallTop.forEach((o, i) => {
        queueWrite(path.join(TDIR, `s${s}-stall-${i + 1}-${sname(o)}.txt`),
          [`# STALL sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, stallLines=${o.stallLines}, stallTurns=${JSON.stringify(o.stallTurns)}, stallFollows=${JSON.stringify(o.stallFollows)})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      const dryTop = convoLog.filter(o => (o.dryFamLines || 0) > 0).sort((a, b) => (b.dryFamLines - a.dryFamLines)).slice(0, 2);
      dryTop.forEach((o, i) => {
        queueWrite(path.join(TDIR, `s${s}-dry-${i + 1}-${sname(o)}.txt`),
          [`# DRY sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, dryFam=${o.dryFamLines} dry9=${o.dry9Lines} self3=${o.self3Lines} endOnDry=${o.endOnDry} counterDry=${o.counterDry} counterSelf=${o.counterSelf} dryTurns=${JSON.stringify(o.dryTurns)})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      const coldTop = convoLog.filter(o => o.coldOpenDry).slice(0, 1);
      coldTop.forEach((o) => {
        queueWrite(path.join(TDIR, `s${s}-coldopen-${sname(o)}.txt`),
          [`# COLD-OPEN sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, coldOpenLine=${JSON.stringify(o.coldOpenLine)})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // r65 FAVOR-ACCEPT saves: every convo where the driver accepted a
      // forage_help ask (the ask + the commit beat, in the transcript).
      convoLog.filter(o => o.favorAcceptPick).slice(0, 4).forEach((o, i) => {
        queueWrite(path.join(TDIR, `s${s}-favoraccept-${i + 1}-${sname(o)}.txt`),
          [`# FAVOR-ACCEPT sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart}, favorId: ${o.favorAcceptFavorId})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // r65 OUTING LOG: the wedge's step records (ask lives in the favor
      // ledger; start/forage/talk/deliver lines live here).
      queueWrite(path.join(SDIR, `s${s}-outing-log.txt`),
        [`# OUTING LOG — seed ${s} (${r.days}d, ${r.alive} alive)`,
         `FUNNEL: ${JSON.stringify(r.favorFunnel)}`,
         ...r.outingLog.map(o => `d${o.day} ${o.step}: ${o.vidName || o.vid || ''} ${o.favorId || ''}${o.line ? ' :: ' + String(o.line).slice(0, 300) : ''}${o.status ? ' :: ' + JSON.stringify(o.status).slice(0, 300) : ''}${o.pressPlayerKcal !== undefined ? ` press=${o.pressPlayerKcal}/${o.pressPartnerKcal} cum=${o.cumPlayerKcal}/${o.cumPartnerKcal}` : ''}${o.deliveredKcal !== undefined ? ` delivered=${o.deliveredKcal} kept=${o.promiseKept}` : ''}`),
         `END STATES: ${JSON.stringify(r.favorEndStates)}`,
         `OFFERS: ${JSON.stringify(r.favorOffers)}`,
         `ACCEPTS: ${JSON.stringify(r.favorAccepts)}`].join('\n') + '\n');
      queueWrite(path.join(SDIR, `s${s}-invite-decisions.txt`),
        [`# INVITE DECISIONS — seed ${s} (${r.days}d, ${r.alive} alive)`,
         ...r.inviteDecisions.map(d => `d${d.day} ${d.kind}${d.probe ? '-probe' : ''}: ${d.inviterName} -> ${d.inviteeName} chance=${d.chance} accept=${d.accept} veto=${d.veto || '-'} inputs=${JSON.stringify(d.inputs)} reasons=${JSON.stringify(d.reasons)}`)].join('\n') + '\n');
      const seededConvos = convoLog.filter(o => o.tag === 'seeded-speaker');
      const seededServed = seededConvos.filter(o => o.grievanceServes > 0 || o.grievanceWrapServe);
      (seededServed.length ? seededServed.slice(0, 1) : seededConvos.slice(0, 1)).forEach((o) => {
        queueWrite(path.join(TDIR, `s${s}-seeded-d${o.day}-${sname(o)}.txt`),
          [`# SEEDED sense-read — seed ${s} day ${o.day}, ${o.name} (turns ${o.turns}, mood: ${o.moodAtStart}, grievanceServes=${o.grievanceServes})`,
           ...o.transcript.map(tline)].join('\n') + '\n');
      });
      // bond ledger summary
      const lines = [`# SURFACE+SEEDED — seed ${s} (${r.days}d, ${r.alive} alive)`, ''];
      lines.push(`npcPairs=${r.npcPairCount} deep2=${r.deep2Pairs.length} cracks=${r.cracks.length} vCracks=${r.vCracks.length} friendGriev=${r.friendGrievances.length} stateGriev=${r.stateGrievances.length} stateFriend=${r.stateFriendGrievances.length} stateVCrack=${r.stateVCracks.length} t2picks=${r.t2picksTotal} closeReadsServed=${r.closeReadsTotal} grievanceServes=${r.grievanceServesTotal} othersSteered=${r.othersSteered}`);
      lines.push(`COND-TP: firstDeep2Day=${r.firstDeep2DayAll} lateClose=${r.lateClose} lateTP=${r.lateTP} lateNull=${r.lateNull} condRate=${r.condRate === null ? 'n/a' : (r.condRate * 100).toFixed(1) + '%'} pooledTP=${r.pooledTP}/${r.closeReads.length} pooledRate=${r.pooledRate === null ? 'n/a' : (r.pooledRate * 100).toFixed(1) + '%'} grievReadsByWhy=${JSON.stringify(r.grievReadsByWhy)}`);
      lines.push(`FUNNEL (natural): convos=${r.funnel.totalNaturalConvos} subject=${r.funnel.subjectReached} offered=${r.funnel.offered} picked=${r.funnel.picked} classes=${JSON.stringify(r.funnel.classes)}`);
      lines.push(`FUNNEL-UNSTEERED (r55 strict): convos=${r.funnelUnsteered.totalNaturalUnsteered} subjectNoOffer=${r.funnelUnsteered.subjectNoOffer} rate=${r.funnelUnsteered.subjectNoOfferRate === null ? 'n/a' : (r.funnelUnsteered.subjectNoOfferRate * 100).toFixed(1) + '%'} offered=${r.funnelUnsteered.offered} mainOffered=${r.funnelUnsteered.mainOffered} subjectOffered=${r.funnelUnsteered.subjectOffered} picked=${r.funnelUnsteered.picked} latePicks=${r.funnelUnsteered.latePicks} latePicksMain=${r.funnelUnsteered.latePicksMain} latePicksSubject=${r.funnelUnsteered.latePicksSubject}`);
      lines.push(`STEERING-ARM: steering=${r.steering} knackSameSpeakerRepeats=${r.knackSameSpeakerRepeats.length} knackCrossSpeakerRetells=${r.knackCrossSpeakerRetells.length}`);
      for (const kr of r.knackSameSpeakerRepeats) lines.push(`  KNACK-SAME-SPEAKER-REPEAT: ${kr.name} x${kr.count} days ${kr.days.join(',')} — ${kr.text.slice(0, 100)}`);
      for (const kr of r.knackCrossSpeakerRetells) lines.push(`  KNACK-CIRCULATION: ${kr.speakers.join(' / ')} — ${kr.text.slice(0, 100)}`);
      lines.push(`REOFFER: offers=${r.reofferOffers} picks=${r.reofferPicks} latePicks=${r.reofferLatePicks} missedChangedNotOffered=${r.reofferMissed}`);
      lines.push(`WRAPSERVE: convos=${r.wrapServes} matcherHits=${r.wrapServeMatcherHits} matcherServes=${r.grievanceServesTotal} classes=${JSON.stringify(r.wrapServeClasses)}`);
      lines.push(`FUNNEL-PROBE (subject-no-offer turns): turns=${r.funnelProbe.turns} menuProblem=${r.funnelProbe.menuProblem} pickProblem=${r.funnelProbe.pickProblem}`);
      lines.push(`INVITE (wrap, carried from r63): lure=${JSON.stringify(r.inviteCensus.lure)} party=${JSON.stringify(r.inviteCensus.party)} partyProbe=${JSON.stringify(r.inviteCensus.partyProbe)} partyProbeConvos=${r.inviteCensus.partyProbeConvos} convosWithInviteOffer=${r.inviteCensus.convosWithInviteOffer}`);
      lines.push(`FAVOR (r65): funnel=${JSON.stringify(r.favorFunnel)}`);
      lines.push(`OUTING END STATES: ${JSON.stringify(r.favorEndStates)}`);
      for (const o of r.favorOffers) lines.push(`  FAVOR-OFFER d${o.day}: ${o.vidName} kind=${o.kind} favorId=${o.favorId} task=${o.task}`);
      for (const a of r.favorAccepts) lines.push(`  FAVOR-ACCEPT d${a.day}: ${a.vidName} favorId=${a.favorId} accepted=${a.accepted} state=${a.favorState} meetDay=${a.meetDay}`);
      for (const d of r.inviteDecisions) lines.push(`  INVITE-DEC d${d.day} ${d.kind}${d.probe ? '-probe' : ''}: ${d.inviterName} -> ${d.inviteeName} chance=${d.chance} accept=${d.accept} veto=${d.veto || '-'} inputs=${JSON.stringify(d.inputs)} reasons=${JSON.stringify(d.reasons)}`);
      lines.push(`SEEDED-DAILY: ${r.seededEffect ? JSON.stringify(r.seededEffect.daily) + ' class=' + r.seededEffect.crackTraceClass : 'none'}`);
      lines.push(`GOSSIP: totalPicks=${r.gossipPicks} (per-day reset active; r47-r50 reported per-run-capped counts — NOT comparable)`);
      lines.push(`WINDOWS (natural picks): ${r.windows.map(w => w.window + '=' + w.picks).join(' ')} naturalPicks=${r.naturalPicks} seededPicks=${r.seededPicks} gossipPicks=${r.gossipPicks}`);
      lines.push(`SEEDED: ${r.seededEffect ? JSON.stringify(r.seededEffect) : 'none (no depth>=2 pair formed)'}`);
      for (const p of r.deep2Pairs) {
        lines.push(`  FRIEND d${p.firstDeep2Day}: ${p.aName} <> ${p.bName} — maxDepth ${p.maxDepth}, final ${p.finalDepth} (v=${p.finalV}), dropped ${p.dropped}`);
      }
      for (const c of r.cracks) {
        lines.push(`  CRACK d${c.day}: ${c.byName} vs ${c.againstName} (${c.kind}) depth ${c.depthBefore} -> ${c.depthAfter}`);
      }
      for (const vc of r.vCracks) {
        lines.push(`  VCRACK d${vc.day}: ${vc.byName} vs ${vc.againstName} (${vc.kind}) v ${vc.vBefore} -> ${vc.vAfter} (depth ${vc.depthBefore} -> ${vc.depthAfter})`);
      }
      for (const fg of r.friendGrievances) {
        lines.push(`  FRIEND-GRIEV d${fg.day}: ${fg.byName} vs ${fg.againstName} (${fg.kind}) depth ${fg.depthBefore} v ${fg.vBefore} -> ${fg.vAfter}`);
      }
      for (const cr of r.closeReads) {
        lines.push(`  CLOSE-READ d${cr.day}: ${cr.vidName} about ${cr.idName} — live depth=${cr.liveDepth} ledger depth=${cr.ledgerDepth} class=${cr.cls} late=${cr.late} inGroup=${cr.inGroup} speakerHasDeep2=${cr.speakerHasDeep2}`);
      }
      for (const sg of r.stateFriendGrievances) {
        lines.push(`  STATE-FRIEND-GRIEV d${sg.day} (${sg.source}): ${sg.byName} vs ${sg.againstName} (${sg.kind}) depth ${sg.depthBefore} v ${sg.vBefore} -> ${sg.vAfter}`);
      }
      for (const sv of r.stateVCracks) {
        lines.push(`  STATE-VCRACK d${sv.day} (${sv.source}): ${sv.byName} vs ${sv.againstName} (${sv.kind}) v ${sv.vBefore} -> ${sv.vAfter} (depth ${sv.depthBefore} -> ${sv.depthAfter})`);
      }
      for (const g of r.grievReads.slice(0, 6)) {
        lines.push(`  GRIEV-READ d${g.day}: ${g.vidName} about ${g.idName} (why=${g.why})`);
      }
      for (const k of r.knackLines.slice(0, 8)) {
        lines.push(`  KNACK d${k.seedDay} ${k.convo}: ${k.text.slice(0, 120)}`);
      }
      lines.push('', `deathCauses: ${JSON.stringify(r.deathCauses)}`);
      queueWrite(path.join(SDIR, `s${s}-friendship-summary.txt`), lines.join('\n') + '\n');
      flushWrites(); // r51 crash-safety: this seed's outputs are durable NOW
      results.push(r);
      console.log(`INVITE seed ${s}: lure=${r.inviteCensus.lure.n} acc=${r.inviteCensus.lure.accepts} rate=${r.inviteCensus.lure.acceptRate === null ? 'n/a' : (r.inviteCensus.lure.acceptRate * 100).toFixed(1) + '%'} chanceMean=${r.inviteCensus.lure.chanceMean} vetoes=${JSON.stringify(r.inviteCensus.lure.vetoes)} partyProbeDec=${r.inviteCensus.partyProbe.n} acc=${r.inviteCensus.partyProbe.accepts} partyProbeConvos=${r.inviteCensus.partyProbeConvos} convosWithInviteOffer=${r.inviteCensus.convosWithInviteOffer}`);
      console.log(`FAVOR seed ${s}: funnel=${JSON.stringify(r.favorFunnel)} endStates=${JSON.stringify(r.favorEndStates)}`);
      // r57 crash-safety (r56 pattern): verdicts rewrite per seed (r55's end-only
      // verdicts write needed the assembler after the restart split).
      queueWrite(path.join(EVIDIR, 'r75-verdicts.json'), JSON.stringify(buildVerdicts(results), null, 1));
      flushWrites();
      console.log(`SEED ${s} arm=${r.arm} steering=${r.steering} unsteeredNoOffer=${r.funnelUnsteered.subjectNoOffer}/${r.funnelUnsteered.totalNaturalUnsteered} unsteeredLatePicks=${r.funnelUnsteered.latePicks} knackSame=${r.knackSameSpeakerRepeats.length} knackCross=${r.knackCrossSpeakerRetells.length}: ${r.days}d alive=${r.alive} deep2=${r.deep2Pairs.length} cracks=${r.cracks.length} vCracks=${r.vCracks.length} friendGriev=${r.friendGrievances.length} stateFriend=${r.stateFriendGrievances.length} stateVCrack=${r.stateVCracks.length} t2picks=${r.t2picksTotal} closeReads=${r.closeReadsTotal} lateClose=${r.lateClose} lateTP=${r.lateTP} lateNull=${r.lateNull} condRate=${r.condRate === null ? 'n/a' : (r.condRate * 100).toFixed(1) + '%'} grievServes=${r.grievanceServesTotal} knack=${r.knackGossipsTotal} stall=${r.stallCensus.totalStallLines}/${r.stallCensus.totalConvos} stallRate=${r.stallCensus.stallsPerConvo.toFixed(2)} shareWith=${(r.stallCensus.shareWithStall * 100).toFixed(1)}% dry=${r.dryCensus.totalDryLines}/${r.dryCensus.totalConvos} dryRate=${r.dryCensus.dryPerConvo.toFixed(2)} dry9=${r.dryCensus.dry9Lines} self3=${r.dryCensus.self3Lines} endDry=${r.dryCensus.convosEndingOnDry} coldOpen=${r.dryCensus.coldOpenDryConvos}/${r.dryCensus.coldOpenSeenConvos} ctr=${r.dryCensus.counterDryTotal}/${r.dryCensus.counterSelfTotal} othersSteered=${r.othersSteered} reoffer=${r.reofferOffers}/${r.reofferPicks} reofferLate=${r.reofferLatePicks} reofferMissed=${r.reofferMissed} wrap=${r.wrapServes}/${r.wrapServeMatcherHits} wrapCls=${JSON.stringify(r.wrapServeClasses)} probe=${r.funnelProbe.turns}/${r.funnelProbe.menuProblem}/${r.funnelProbe.pickProblem} funnel=${JSON.stringify(r.funnel.classes)} windows=${r.windows.map(w => w.picks).join('/')} seeded=${r.seededEffect ? JSON.stringify({ day: r.seededEffect.day, pair: r.seededEffect.pair.aName + '<>' + r.seededEffect.pair.bName, crack7: r.seededEffect.crack7, serve30: r.seededEffect.serveWithin30, effect: r.seededEffect.effect }) : 'none'}`);
    } catch (e) {
      console.log(`SEED ${s} FAILED: ${e && e.message}`);
    }
  }
  // r57: verdicts builder shared by the per-seed incremental write and
  // the final write, so a split run never needs the assembler. A
  // function declaration (not const) so the per-seed use hoists above
  // this definition point inside the IIFE.
  function buildVerdicts(rs) { return rs.map(r => ({
    seed: r.seed, steering: r.steering, arm: r.arm, alive: r.alive, deep2: r.deep2Pairs.length, cracks: r.cracks.length, vCracks: r.vCracks.length, friendGrievances: r.friendGrievances.length,
    stateGrievances: r.stateGrievances.length, stateFriend: r.stateFriendGrievances.length, stateVCracks: r.stateVCracks.length,
    t2picks: r.t2picksTotal, closeReads: r.closeReads.length, grievReads: r.grievReads.length, grievReadsByWhy: r.grievReadsByWhy,
    firstDeep2Day: r.firstDeep2DayAll, lateClose: r.lateClose, lateTP: r.lateTP, lateNull: r.lateNull, condRate: r.condRate,
    pooledTP: r.pooledTP, pooledRate: r.pooledRate, othersSteered: r.othersSteered, lingerPicks: r.lingerPicks,
    knack: r.knackGossipsTotal, dryCensus: r.dryCensus, stallCensus: r.stallCensus,
    funnel: r.funnel, funnelUnsteered: r.funnelUnsteered, windows: r.windows, naturalPicks: r.naturalPicks, seededPicks: r.seededPicks,
    knackSameSpeakerRepeats: r.knackSameSpeakerRepeats, knackCrossSpeakerRetells: r.knackCrossSpeakerRetells, t2picksTotal: r.t2picksTotal,
    gossipPicks: r.gossipPicks, seededEffect: r.seededEffect,
    reofferOffers: r.reofferOffers, reofferPicks: r.reofferPicks, reofferLatePicks: r.reofferLatePicks, reofferMissed: r.reofferMissed,
    wrapServes: r.wrapServes, wrapServeMatcherHits: r.wrapServeMatcherHits, grievanceServesTotal: r.grievanceServesTotal,
    wrapServeClasses: r.wrapServeClasses, wrapServeConvos: r.wrapServeConvos, funnelProbe: { turns: r.funnelProbe.turns, menuProblem: r.funnelProbe.menuProblem, pickProblem: r.funnelProbe.pickProblem },
    inviteCensus: r.inviteCensus, inviteDecisionsCount: (r.inviteDecisions || []).length,
    favorFunnel: r.favorFunnel, favorOffersCount: (r.favorOffers || []).length, favorAcceptsCount: (r.favorAccepts || []).length, outingLogCount: (r.outingLog || []).length, favorEndStates: r.favorEndStates, posHistory: r.posHistory || {}, posHistoryMidday: r.posHistoryMidday || {}, stuckDaysEnd: r.stuckDaysEnd || {},
  })); }
  const verd = buildVerdicts(results);
  queueWrite(path.join(EVIDIR, 'r75-verdicts.json'), JSON.stringify(verd, null, 1));
  flushWrites();
  console.log('DONE r75.');
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
