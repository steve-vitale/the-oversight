# sim-enddaybeats-a — PRE-REGISTRATION (committed BEFORE any judged sim)

Worker: sim-enddaybeats-a (Loop A, food-economy / narration).
Run: fleshout-20261105T1915Z. Assignment: census the endDay
haven-beats family + killer-tale prose as ONE family in stranded
sleep windows (DIAGNOSTIC ONLY, zero src/js — a measurement arm, no
game change, no lever to land). This is the 1715Z run's
food-economy next blank (the endDay haven-beats item and the
killer-tale item in sim-findings.md, both claimed at the start of
this run) and the gossipcensus-a follow-through: gossipcensus-a
(DIAG-GO, 31 seeds) proved the haven-gossip burst reaches a
stranded scholar at the background rate and reads wrong, and noted
adjacent position-blind beats in the same two hit windows; the
gossipfix arm fixed ONLY the burst/settle (then was killed on its
12-entry queue cap) — the family is still ungated. No single canon
doc covers endDay position-blind narration; the design lives in
evidence/2026-11-05/sim-gossipcensus-a.md ("Adjacent
position-blind beats" + "Fix direction") and the coordinator
evidence evidence/2026-11-05/sim-adoption-round-1715.md.

## The question, precisely

For each beat in the family below: does it fire inside a stranded
scholar's sleep window, at what rate vs the non-stranded sleep
rate, and does it read wrong stranded? The beats (all in stranded
sleep windows; each quoted verbatim in the evidence):

1. RAID CALL — `🚨 <name> is at Haven's door. The village looks to
   you. Four ways to call: a RUNNER ... a SIGNAL FIRE ... the
   SYSTEM RELAY ... an ABILITY CRY ...` (comms.js raiseAidCrisis),
   with its sibling `🐗 RAID — N raiders hit Haven in the night...`
   line (havenGrowth.js havenRaidTick) reported as context.
2. OVERHEAR — `You overhear it at the fire, and stop pretending
   not to listen. ...` (ledger.js _fireBeat framing, first
   gossip-kind legend beat).
3. FRAGMENTS — `You catch fragments by the fire — <teller> telling
   <listener> about ...` (game.js spreadGossip).
4. PANTRY — the day-voice "full shelves" lines, deposit-gate pool
   (`🍽️ <name> looks at the full shelves and waves off the day's
   share. ...` and siblings, game.js _depositGateDayVoice) and
   plenty pool (`... eyes the groaning pantry shelves ...` and
   siblings, game.js _plentyDepriDayVoice).
5. KILLER TALE — tellKillerTale fireside prose (`🔥 The fire
   settles. <killer> has been quiet all evening, and now everyone
   knows why. "... — I put it down today." ...`, game.js
   tellKillerTale via sayHavenNews).
6. OTHER — any other haven-side beat appearing in the same stranded
   sleep windows, enumerated from the full stranded sleep windows
   kept in the corpus — not pre-filtered. (Candidates seen in code:
   the witness line is now relay-gated; the raid-aftermath `🕯️ The
   treeline is still torn up...` line; advancePart nightfall lines
   if the sleep loop's part advances carry them in.)

## Code facts (read, not assumed — line refs on base 7f7475f59)

- The HAVEN-NEWS RELAY (journey-social r141) is IN current master
  and gates the naming family: `sayHavenNews` (game.js ~23075)
  says the line immediately only if `scholarAtHaven()` (standing
  on the haven tile, same notion as havenStoresAccess); while away
  it queues in `state.pendingHavenNews` (cap 20, oldest dropped)
  and `flushHavenNews` (game.js ~23094, called at the top of
  endDay, game.js ~32533) delivers on a night spent at Haven.
  The burst word/debate lines (game.js ~23136, ~23203), the
  settle line (~23234), the endDay witness line (~32571), AND the
  killer-tale prose (tellKillerTale ~23033) ALL go through
  sayHavenNews. The gossipfix arm's separate `holdNamingNews` /
  `awayNaming` mechanism (12-entry cap) is NOT in master — it died
  with the abandoned branch. So the code read says the tale DOES
  carry a position gate (via the relay), unlike the scope note
  written before r141 landed; the census verifies empirically
  whether the gate holds in the judged substrate.
- `killerTaleBeat` is called from advancePart at dayPart === 3
  (game.js ~28320), not from endDay — so tale prose can only enter
  a sleep window via the sleep loop's own part advances, and only
  if the relay says it (scholar at Haven at dayPart 3) or the relay
  is bypassed. The census classifies tale lines in stranded sleep
  windows AND reports where tale lines do appear for stranded
  scholars (daily phase while away should be 0 — queued, not said).
- The OTHER beats are NOT relay-gated (direct `this.say`):
  - RAID: `havenRaidTick` runs inside endDay via the progDaily
    wrap (havenGrowth.js ~968); `raiseAidCrisis` (comms.js ~157)
    and the `🐗 RAID` line (havenGrowth.js ~558) say directly.
  - OVERHEAR: the ledger endDay wrap (ledger.js ~1782) calls
    `ledgerBeat()` + `flushLedgerBeats()` after base endDay —
    still inside sleep(); `_fireBeat` (ledger.js ~362) says
    directly, no position gate. (The combat-deferral queue only
    defers mid-fight beats to this same endDay flush.)
  - FRAGMENTS: `spreadGossip` (game.js ~17968) runs in advancePart
    (~6622) and per travel step (~12943); the sleep loop's
    tickAction chunks drive part transitions, so it can fire
    inside a sleep window.
  - PANTRY: `villageEats()` (game.js ~31793) runs inside endDay
    (~32777) and calls `_depositGateDayVoice` (~31875) and
    `_plentyDepriDayVoice` (~31871) directly after the meal loop.
- `endDay()` runs inside `sleep()` (midnight rollover,
  game.js ~20075); the ledger endDay wrap and the progDaily wrap
  run inside it. A line said anywhere in endDay lands inside the
  sleep window bracketed by the sleep-start/sleep-end markers.
- CONTROL (re-measure, not the judged item): the gossip burst +
  settle lines, classified with the judged gossipcensus-diag
  classifiers, to test whether the r141 relay actually holds in
  this substrate. Gossipcensus-a measured 2/25 stranded sleep
  windows on a now-stale corpus; the relay postdates it.

## Primary metric (per beat, sleep comparison)

- Stranded night = a loop-day evening whose nighttravel outcome
  is `travel-refused` or `out-of-reach` AND the scholar is not
  inside Haven at daily exit (the strandnarr-a evening gate,
  unchanged).
- For each beat kind K in {raid, overhear, fragments, pantry,
  tale} (+ burst/settle as control): PRIMARY = stranded sleep
  windows containing >= 1 K line / stranded sleep windows, vs the
  non-stranded sleep rate (same seeds, same windows). A window
  holding both halves of one raid event (🐗 line + 🚨 call) scores
  1 raid event; a window holding a tale's full prose scores 1 tale
  event (the prose is one say call). Upkeep windows are reported
  per beat as a MECHANISM CHECK only (expected 0 for every beat:
  none of the six call paths runs inside a competentEat upkeep
  call), never part of the verdict.
- POWER BAR (pre-registered, mirroring gossipcensus): >= 20
  stranded sleep windows observed across >= 4 stranding seeds.
  If either leg fails, the verdict is INSUFFICIENT-DATA, never
  re-scored. The "other" enumeration (beat 6) needs no separate
  power bar — it is read off the same powered windows.
- VERDICT RULE (pre-registered): DIAG-GO iff the census is
  powered and every beat's stranded-sleep incidence is established
  with verbatim quotes either way — a 0 rate on a powered census
  IS a verdict (the beat never reaches a stranded scholar), not a
  non-result. A non-zero rate is DIAG-GO with the sense verdict
  below deciding, per beat, whether it reads wrong (fix-or-
  document), is gated (document the relay holding), or is coherent
  (document only). The verdict names the fix direction per beat
  for a future arm: gate (hold until return) vs re-voice (dawn
  System relay) vs leave. No fix in this arm.

## Sense test (SENSE-TESTING LAW — judge meaning, not counts)

Every stranded-window hit is quoted verbatim with its full sleep
window read: does the line read WRONG to a player (a scholar
camped in a thicket hearing "You overhear it at the fire" / "The
village looks to you" / "Catalina looks at the full shelves"
while starving in the wild) or COHERENT (e.g. the tale was told
while the scholar was at Haven at dayPart 3 and stranded only at
evening)? Per beat: reads-wrong / gated / coherent, with the fix
direction (gate vs re-voice) that fits it. A 0 rate gets the same
read on the nearest non-stranded sleep-window hits for contrast.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days. Why: the same substrate as gossipcensus
  (its anchor sits at loop-days 51–53); dead villages stop
  simulating (runDays stops on Game.over), so 60 is a cap, not a
  sentence.
- Policies: bankfood(warmed(woodcarry(nighttravel))) over
  competent, env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1, BANKFOOD=1,
  WOODWARM=0 (the gossipcensus leg, verbatim). PLENTYDEPRI=0 means
  the plenty pantry pool cannot fire on this substrate — the
  classifier still matches it, and a 0 there is reported as
  gate-off, not as absence. DEPOSITGATE=1 means the deposit-gate
  pantry pool is live.
- PILOT (8 seeds, judged first, before any confirm spend): 17021,
  15003, 15009, 15091, 15211, 15215, 15220, 15221 (the
  gossipcensus pilot band, verbatim). Expected from gossipcensus:
  ~15 stranded windows on 1 stranding seed — which FAILS the
  power bar's seed leg by construction, so the pilot is expected
  to end INSUFFICIENT-DATA and trigger the pre-registered screen
  below. The pilot is still judged (its incidence is reported,
  not hidden).
- SCREEN / CONFIRM (pre-registered, runs ONLY after the pilot):
  the same driver over the bankretain-substrate-a band 17001–17024
  (23 fresh seeds; 17021 already in the pilot is not re-run).
  This band is judged strand-screened substrate and is reused
  whole-token, not cherry-picked — every seed in the band runs,
  stranding or not, so the screen cannot inflate the rate by
  selection.
- If pilot + screen still fail the power bar (< 4 stranding seeds
  or < 20 stranded windows), the run ends INSUFFICIENT-DATA with
  the extension named as the NEXT run's job: a fresh band verified
  by whole-token grep across ALL dated preregs
  (evidence/*/sim-*-prereg.md) plus the forbidden-band lists
  (99201–99208 et al. named in 2026-11-04 preregs). No fresh band
  is named or run inside this run.

## Band freshness (verified BEFORE any judged sim)

The 31 seeds are the gossipcensus-a band, reused whole-token as a
deliberate re-measure on current master (the relay postdates the
gossipcensus corpus, and the corpus is stale per sim-findings.md:
15003/15221 trajectories changed). Whole-token grep across ALL
dated preregs confirms: band 17001–17024 named in
evidence/2026-11-04/sim-bankretain-substrate-a-prereg.md and
evidence/2026-11-05/sim-gossipcensus-a-prereg.md; pilot seeds in
the strandnarr-a band; no seed in the forbidden 99201–99208 lists
(the 992xx grep across sim-findings.md returns no hit for this
band). Reuse is the point — same substrate, new verdict — not a
freshness violation.

## Det-gate (instrument honesty)

Seed 17021, 60 loop-days, instrument ON vs OFF: bankfood evening
records, morning records, first-upkeep kcal series, and daily-entry
scholar kcal must be identical. Any divergence = instrument
contamination; the run stops and the instrument is fixed first.
The census driver adds position snapshots (reads only, no state
edits, no RNG) alongside the strandnarr-a markers; the det-gate
covers the whole driver, not just the reused recorder.

## Anchor reproduction (judged in the proof test, before the pilot)

- 17021 CURRENT-SUBSTRATE FACTS (re-pin, verify — do not assume):
  the gossipfix anchor re-pin (coordinator evidence
  evidence/2026-11-05/sim-adoption-round-1715.md) says 17021 is
  now 60d SURVIVED, not the gossipcensus pin of 57d village-lost
  (drift verified from r140 master, not the fix — pre-fix game.js
  on the new master gives the same 60d survived). The proof test
  asserts the census driver reproduces 60d survived on 17021 on
  THIS master. If it does not, that is reported as a finding
  (substrate drift), not silently re-anchored — a miss moves the
  proof to FAIL and the run stops for a re-pin decision.
- Known non-stranded sleep-window gossip hit: seed 15003 loop-day 7
  (strandnarr-a §2). The proof test asserts the census driver
  captures a `Word gets around the haven` line inside the loop-day-7
  sleep window on seed 15003, classified non-stranded sleep with
  the scholar inside Haven at fire time. If the exact loop-day
  does not reproduce, that is reported as a finding (substrate
  drift), not silently re-anchored.
- The gossipcensus stranded hits (17020 loop-day 6, 17023 loop-day
  34) are NOT proof anchors: the gossipcensus corpus is stale on
  current master (sim-findings.md), so those trajectories may not
  reproduce. Stranded windows are established by the pilot+screen
  itself.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO /
INSUFFICIENT-DATA per the rules above, never re-scored against a
friendlier metric mid-run. If a metric proves wrong, it goes under
"metric review" in the evidence file with a revision proposed for
the NEXT run. Every evidence file carries a "metric review" section.

## Wall numbers (carried, NOT re-measured)

This is a narration census corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24.

## Deliverables

- evidence/2026-11-05/sim-enddaybeats-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-05/sim-enddaybeats-a.md (verdict, per-beat
  rates with denominators, every stranded-window hit quoted
  verbatim, sense verdict per beat, fix direction per beat,
  metric review, "other" enumeration)
- evidence/2026-11-05/sim-enddaybeats-a-corpus/ (per-seed JSON:
  judged windows + every classified line + per-loop-day counts;
  stranded sleep windows kept in full transcript)
- scripts/policies/enddaybeats-diag.js (beat classifiers +
  window classification; reuses scripts/policies/strandnarr-diag.js
  verbatim for the transcript recorder and
  scripts/policies/gossipcensus-diag.js for the burst/settle
  control)
- scripts/enddaybeats-trace-a.js (driver: same stack as
  gossipcensus-trace-a.js, only the analysis differs)
- scripts/test-enddaybeats-a.js (proof: unit classifiers +
  det-gate + anchors)
- Zero src/js changes. Zero policy changes. No gate/price/deed
  change. No push, no bump, no live verification (coordinator
  merges via --ff-only; ship loop owns deploys).
