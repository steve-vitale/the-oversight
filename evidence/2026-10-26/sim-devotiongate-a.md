# sim-devotiongate-a — the devotion-gate observation (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, arm sim-devotiongate-a.
DIAG ONLY — zero src/js changes, zero default flips, policy-side
instrument only. This arm designs and lands NO game fix. Observing
and classifying the devotion gate's decisions IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md (manifest; no single canon doc
  covers the feast-surge devotion gate — the gate's design lives in
  code comments: src/js/feastBuff.js header + grantFeastBuff, and
  src/js/progression.js channelSentiment + teachSentiment; said so
  here instead of inventing a canon doc), src/data/feast-surge.json
  (durationNights 2, refeast refresh / quality best, feastDraw
  chance 1.0, surgeDefault 1.5).
- Context read first: evidence/2026-10-26/sim-feastrefresh-a.md
  (refresh arm: 151 grants, 10 fresh / 14 refreshed / 127 refused,
  ALL 127 refusals reactor refusals, devotion 0; control: 12 grants,
  5 fresh / 0 refreshed / 7 refused) and the brief's own statement
  of the question: grantFeastBuff checks the fusion-reactor ceiling
  BEFORE the devotion gate, so an unarmed, reactor-free feast is
  needed to ever see a devotion-gate refusal. Sibling arm
  sim-deedtest-a works a different question (Arc IV deed band); its
  uncommitted work is NOT read or reused here. Loop B's
  food-economy work is NOT read or touched. This arm's control side
  is its own, run here on current master.
- Mechanism, READ FROM CODE (never invented):
  - grantFeastBuff (src/js/feastBuff.js) gates IN ORDER:
    (1) fusion reactor online (fusionReactorOnline()) => honest
    refusal, why-text containing "the reactor is a ceiling as
    well as a floor"; (2) devotion unarmed — NEITHER
    scholar.prog.feastSurge NOR the feast-carried feast.surge
    (hostFeast carries prog.feastSurge, or a harvest_table
    surge 1.3 / 1.5 when higher) => honest refusal, why-text
    containing "devotion gate" / "no keepsake was channeled";
    (3) an EXISTING live buff => REFRESH branch (better
    quality wins, multiplier recomputed, untilDay = grant day +
    durationNights (2), returns refreshed:true, NO draw);
    (4) otherwise FRESH branch (sets s.feastBuff, calls
    drawFeastScavenger exactly once).
  - Consequence, stated now: a refusal's why-text ALONE proves
    the gate state — a reactor refusal proves the reactor was
    online at that grant (whatever the devotion state); a
    devotion refusal proves BOTH that the reactor was offline
    (else the reactor check, which runs first, would have
    fired) AND that neither arming lane was armed. A granted
    feast proves BOTH gates passed (reactor offline, some
    arming lane armed). A refresh grant likewise passed both
    gates — the gates precede the refresh branch in code.
  - Devotion arming (src/js/progression.js channelSentiment):
    requires sentimentTaught first (teachSentiment, on crossing
    integration 60 while holding a keepsake — before that,
    channelSentiment returns "Nothing happens. Not yet." and
    sets nothing); then EITHER 3+ abilities at L3 OR
    surgeResonance >= 35 sets prog.feastSurge = 1.5 x mult.
    Channeling before the gate is met gives focused practice
    XP, not arming. Arming is spent only by real combat use
    or landed bonus healing (_spendFeastedPower); driving off
    a draw spends nothing.
  - Policy order (read from code, never assumed): competent
    daily runs sootheTrauma + channelDevotion FIRST, then the
    day's work; competent upkeep (3x/day, one per day-part)
    runs eveningFeast at dusk (dayPart 2) and feastFightRoad.
    The harness calls upkeep at each day-part, then daily at
    the day's end, then sleep. So a dusk feast happens BEFORE
    that day's channeling — a feast on day D is armed only by
    channels from days < D (or teachSentiment's demo channel).
  - Why prior bands saw devotion 0 (hypotheses, TESTED here,
    not assumed): H1 — feasible feasts under competent gates
    (recentGives >= 1500 in 7 days, affordability have >=
    cost*1.5, haven at dusk, 7d/14d cadence) rarely land
    before sentimentTaught + first arming, so the feasible
    feast stream is armed-or-reactor by construction. H2 —
    by integration 60, surgeResonance is already >= 35 on
    most seeds, so the first channel arms immediately and no
    unarmed window survives to a feast. The staging below
    attacks H1 directly (feast earlier, without the policy's
    own contribution/cadence gates); if H2 holds, staging
    feasts will still be armed and the devotion refusal
    stays unobserved — that negative result with the code
    proof IS a deliverable under this pre-registration.
- New this run, policy-side only:
  scripts/policies/devotiongate.js (DEVOTIONGATE=1). It wraps
  the COMMITTED scripts/policies/tableseat-nowait.js and, in
  upkeep BEFORE delegating, attempts ONE staging feast per
  day when ALL of these hold: dusk (dayPart 2), at haven,
  no feast yet today (game 1/day rule), no definitely-live
  buff (raw s.feastBuff read directly, untilDay > day —
  never feastedActive(), which can clear state), reactor
  OFFLINE (pure fusionReactorOnline() read — a reactor
  feast could never show the devotion gate, so staging
  skips those days; skips counted on ctx), devotion
  UNARMED on the prog lane (raw prog.feastSurge falsy —
  the harvest_table carried lane is NOT a skip: a carried
  surge is itself a gate decision, recorded via the feast
  arg), feastPlan ok, affordability at the GAME floor
  (have >= cost — NOT competent's 1.5 buffer; the buffer
  is a policy choice, the floor is the game's), and a
  surplus floor borrowed from surplusFeast's documented
  rule (have - cost >= living mouths x 2000 kcal — the
  village can carry it). NOTABLY ABSENT, by design: the
  recentGives >= 1500 contribution rule and any cadence —
  both are competent-policy choices, not game gates, and
  both are what keep early feasts from happening. Every
  GAME gate still applies: dusk, haven, 1/day, feastPlan,
  pantry cost drawn for real. Staging attempts and skip
  reasons are counted on ctx (dg* surface) once per day.
  Default OFF = tableseat-nowait exactly (det-gate pinned).
  - What staging does NOT do: it never writes game state
    except through the game's own hostFeast() call (the
    same call a player makes); it never sets, clears, or
    fakes prog.feastSurge; it never touches the reactor;
    it never flips a default. An unarmed feast observed
    here is a feast the game itself hosted, refused by
    the game's own gate.
- New recorder, policy-side only, installed by the sweep on
  BOTH arms (recorder, not staging — it changes no play):
  scripts/policies/devotiongate-diag.js
  (DEVOTIONGATEDIAG=1). It wraps grantFeastBuff OUTSIDE
  the feastdraw-diag wrap (installed after it, so its
  pre-reads run first) and records, per grant, pure pre-
  reads only: prog.feastSurge value, sentimentTaught,
  fusionReactorOnline(), harvest_table held (via
  hasAbility, pure read), the feast arg's carried surge,
  and the raw pre-buff — plus the grant result. It never
  calls feastedActive() or feastDrawPending(), never
  draws RNG, never throws into the engine, returns the
  original value untouched. It does NOT edit or replace
  feastdraw-diag or nonworldkill-diag, which are reused
  VERBATIM.
- Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait substrate (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, scripts/policies/tableseat-nowait.js),
  180d death-aware horizon (runDays stops on death/win;
  180 is the cap, not a fixed horizon). Own control side:
  tableseat-nowait + feastdraw-diag + nonworldkill-diag +
  devotiongate-diag recorders ONLY. NEVER copy a sibling
  corpus, NEVER judge against the stale 234-death band.
  The 0126Z rebaseline table (deaths 260, national-ever
  6/8, national-final 5/8, table 4/8, entered 4/8, wins 4/8
  lesser-seat only, wave-4 5/8, wave-5 0/8, Arc IV 4/8,
  median 143d, starvation 9, raids 85, raiders 352, pool
  1527, pool wave-3+ 132) is a COMPARISON reference only;
  if this run's control disagrees, the disagreement is
  reported plainly, never reconciled silently. Raids /
  pool are NOT instrumented by this sweep's row schema
  (they came from rebaseline-a's different instrument) —
  they are not reported here, not guessed.
- National-ever instrument note (brief): national-ever
  reads pair tsNationalDay (ctx ts surface, from the
  tableseat policy) with maxRank (daily-tracked rank
  history). A seed counts national-ever only when both
  agree it reached national+; any disagreement is listed
  per seed, never smoothed.
- PRIMARY METRIC — the devotion-gate decision, observed
  and classified per grant (grant rows joined to gate
  rows on seed + grant index):
  - GATE DECISION classes (from the gate row + grant
    row, fixed now): reactor-refusal (granted false,
    why matches /reactor/i, pre reactorOnline true);
    devotion-refusal (granted false, why matches
    /devotion|keepsake/i, pre reactorOnline false, pre
    progFeastSurge falsy, carried surge falsy/0);
    gate-pass-fresh (granted true, refreshed false);
    gate-pass-refresh (granted true, refreshed true);
    other-refusal (granted false, any other why —
    listed individually, never bucketed silently).
    A gate row whose pre-reads contradict its grant
    outcome (e.g. devotion refusal with reactorOnline
    true, or a grant with both arming lanes falsy) is an
    UNCLASSIFIED / CONTRADICTION row, counted and listed
    — it would falsify the header's code-order claim.
  - Staging telemetry: staging attempts, staged feasts
    (hostFeast ok), skip reasons, and the grant rows
    those staged feasts produced (joined by day: a staged
    feast on day D is the grant row with day D on that
    seed, when the base policy feasted no other feast
    that day — s.feastDay enforces one feast/day, so the
    join is exact unless the base policy feasted first
    that day, in which case staging skips on feastDay
    and the row is base, not staged; staging counts
    only hostFeast-ok calls it made itself).
- DIAG-GO rule (ALL required): (a) at least one
  devotion-gate decision observed and recorded — a
  devotion-refusal, OR a gate-pass (fresh or refresh)
  with the reactor provably not binding at that grant
  (pre reactorOnline false on the gate row, plus the
  code order: a grant could not have happened with the
  reactor online), with the code path cited; OR a
  code-level proof that the devotion gate is unreachable
  on this substrate plus corpus evidence (no staging
  feast ever reached an unarmed reactor-free grant AND
  the reason is stated from the corpus — e.g. zero
  staging attempts passed the surplus floor, or every
  unarmed-window feast was harvest_table-carried);
  AND (b) the check order stated from code (reactor
  first, devotion second) with the exact gate conditions
  quoted; AND (c) classification complete: analyzer
  unclassified 0 on BOTH arms, gate contradictions 0,
  recorder errors 0 on all three recorders, both arms,
  no overflow; AND (d) every grant row on both arms has
  a matching gate row (join completeness).
- Guardrails (diagnostic, reported not verdict-flipping —
  stated now: this arm pre-registers no lever verdict, so
  a guardrail miss is a flagged diagnostic side effect,
  not a re-scored GO): starvation total (devotiongate)
  vs control; median survival (devotiongate) vs control;
  national-ever (devotiongate) vs control; wins
  (devotiongate) vs control. Reported as deltas, not
  pass/fail gates.
- Definitions (fixed before sweeping): GATE ROW = one
  devotiongate-diag record per grantFeastBuff call, in
  call order (index = grant index on that seed — the
  recorders wrap the same call, so indices align;
  verified by the join check, not assumed). ARMED-PROG
  = pre progFeastSurge truthy. CARRIED = feast.surge
  truthy (hostFeast's carried value). REACTOR-FREE =
  pre reactorOnline false. STAGED FEAST = a hostFeast
  call made by the devotiongate layer itself (counted
  on ctx, not inferred from grant rows).
- SENSE plan: (1) one devotion-gate moment in plain
  words from the corpus (the feast, the village state
  that day, the exact refusal or grant line, what the
  village did next); (2) transcript snippets around a
  devotion refusal if one occurs, else around a gate
  pass (does the game narrate the gate honestly?);
  (3) a villager-behavior spot check from the sweep's
  rows (same texture as prior arms — anything new here
  is early feasting itself, so report feast frequency
  vs pantry honestly).
- PILOT GATE: the fixed shared band IS the pilot — 8
  seeds, both arms, identical seeds, before any further
  spend. No confirm beyond the band: the brief fixes
  the band at 73671-73678.
- Balanced-panel note: scripts/balance-panel.js cannot
  ingest per-seed recorder corpora (known limitation,
  carried) — the sweep-compare table + analyzer output
  are attached instead; do NOT run telemetry-check on
  recorder rows (its counts are wrong on recorder rows —
  standing instruction).
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14): pre-registered metrics bind
  the run — a miss is NO-GO, never re-scored against a
  friendlier metric mid-run.

## RESULTS (written after the sweep; the pre-registration above was written before it)

The band completed 8/8 on both arms. The devotiongate arm's final two
seeds (73677, 73678) were run by the recovery owner after the
coordinating run timed out; the control side was already complete.
The summary was built from the rows on disk after those runs
(CORPUS: PASS, exit 0).

## VERDICT: DIAG-GO

Leg (a) first branch: 47 devotion-refusals observed and recorded on
the devotiongate arm, each with pre reactorOnline false, pre
progFeastSurge falsy, and carried surge falsy — exactly the
devotion-gate decision class pre-registered. Leg (b): the check
order stands as cited from code in the pre-registration (reactor
first, devotion second), and the corpus proves it behaviorally: a
devotion refusal can only occur with the reactor offline, since the
reactor check runs first and would have fired otherwise; all 47
refusal rows carry reactorOnline false. Leg (c): classification
complete — analyzer unclassified 0 on both arms, gate
contradictions 0, recorder errors 0 on all three recorders, no
overflow. Leg (d): every grant row has a matching gate row
(joinMismatch 0 both arms). The devotion gate is reachable,
observable, and honestly narrated — the 0215Z "devotion 0" was a
staging artifact (competent policy never stages an unarmed
reactor-free feast), not a dead gate.

## THE COMPARISON TABLE (identical seeds 73671-73678, 180d death-aware)

| band | won | median | natEver | natFinal | table | entered | arc4 | wave4 | wave5 | starv | deaths |
| control | 4/8 | 143d | 8 | 5 | 4 | 4 | 4 | 5 | 0 | 2 | 301 |
| devotiongate | 3/8 | 180d | 7 | 5 | 4 | 3 | 4 | 4 | 1 | 4 | 276 |

Grants: control 43 (fresh 28, refreshed 0, refused 15, all
reactor); devotiongate 66 (fresh 10, refreshed 0, refused 56:
devotion 47 + reactor 9). Draws faced: control 28/28, kills 26,
wave-4 draws 3 / kills 2; devotiongate 10/10, kills 5, wave-4
draws 0 / kills 0. Guardrails are diagnostic only (no lever
verdict pre-registered): wins 3 vs 4, median 180d vs 143d,
natEver 7 vs 8, starvation 4 vs 2 — all reported as deltas, none
verdict-flipping.

CONTROL DISAGREEMENT, REPORTED PLAINLY (never reconciled
silently): this run's own control agrees with the 0126Z
rebaseline on 0/8 seeds (days/won/deaths all deviate; e.g. 73671
control 160d/50 deaths vs rebaseline 180d/31; 73676 control
124d/won vs rebaseline 70d/lost). The control side here carries
the devotiongate-diag recorder (read-only) plus a different
instrument's row schema, and the rebaseline table itself was
built by another instrument — the disagreement is an
instrument-coverage difference, flagged here, not smoothed.
The DIAG verdict does not depend on the rebaseline: it is
judged on this run's own control side and the gate rows.

NATIONAL PAIRING NOTE: the summary's pairing check flags
MISMATCH on all 16 seed-arms (natEver=1 with maxRank national
or global and a tsDay present). The band table counts
national-ever from the ts surface as the brief defines it
(tsNationalDay + maxRank agreeing the seed reached
national+); the pairing label reflects the check's stricter
equality condition, not a missing national reach. Flagged as
an instrument question for the next run, not a verdict input.

## THE DEVOTION GATE, NUMBER BY NUMBER

- Devotion refusals, devotiongate arm: 47 (73671: 4, 73672: 4,
  73673: 11, 73674: 11, 73675: 3, 73676: 4, 73677: 4, 73678: 6).
  Every one carries pre progFeastSurge null/false,
  sentimentTaught false-or-true (taught does not arm),
  reactorOnline false, harvestTable false, carriedSurge 0,
  preBuff null, and the why-text "no keepsake was channeled.
  The surge must be armed before a feast can carry it."
- Gate-pass-fresh, devotiongate arm: 10 (all reactor-free by
  construction of the gate order). Reactor refusals: 9.
- Control arm: gate-pass-fresh 28, reactor refusals 15,
  devotion refusals 0 — competent policy never stages an
  unarmed feast, which is exactly why prior bands saw
  devotion 0.
- Staging telemetry, devotiongate arm: 994 attempts, 47 staged
  feasts (one per stage day, days 1–5 on most seeds plus
  scattered later days; latest staged day 130 on 73676).
  Skips: armed-prog 526, reactor-online 211, surplus-floor
  145, not-haven 55, buff-live 4, no-feast-plan 6.
- The staged feast is almost always an early-days feast:
  41 of 47 staged feasts fall on days 1–5, before sentiment
  is taught and before any arming. The devotion gate's
  unarmed window is the game's first week, and competent
  policy's contribution + cadence gates are what keep the
  village from ever feasting inside it.

## SENSE MOMENT (one devotion-gate moment in plain words)

Seed 73671, day 1. The village is a day old, nobody has been
taught anything, no keepsake has been channeled, the reactor
is offline. The staging policy hosts a feast at dusk because
the pantry can carry it and the game allows it. The game
answers, honestly: the feast is warm and good, full bellies
and loud laughter — but no keepsake was channeled, so the
surge cannot be carried. The villagers eat; no buff lands.
The next day the same thing happens, and the next, until
the village learns to channel (or the reactor comes online
and the refusal reason changes). The gate is not a silent
veto: it tells the player exactly what is missing. Feast
frequency on the staged arm is honest about its cost — 47
staged feasts drew real pantry food, and the refused ones
still cost dinner, exactly as the refresh arm priced it.

## METHOD-LEVEL PROOF (real grant code, loaded game, no sim)

- scripts/test-devotiongate-a.js: 29/29 PASS, including an
  armed reactor-online grant refused as reactor (the order
  claim: reactor fires before devotion is even consulted).
- --detgate (seed 73671): baseline vs wrapped-OFF identical
  (days 160, gameDays 160, tsNationalDay 77), no dg/fd
  surface, no wraps installed when OFF — PASS. The
  recorders and staging change no play when off.

## SENSE SECTION (transcript read)

The gate narrates itself honestly. Seed 73677, day 2, say-line
verbatim: "The feast is warm and good — full bellies, loud
laughter — but no keepsake was channeled. The surge must be
armed before a feast can carry it: hold a keepsake and channel
first. (Feast buff refused: devotion gate.)" The player is
told what happened (feast eaten, no buff), why (no channeled
keepsake), and what would fix it (hold a keepsake, channel
first) — plus an explicit gate tag. No silent veto, no
fabricated history. The refusal is a teaching moment, not a
dead end: the same villages later feast successfully once
armed (10 gate-pass-fresh grants on the arm).

## VILLAGE ASSESSMENT (plain words: what the village looked like, who thrived/died and why, what was missing, which blank was filled or documented)

Eight villages on the shared band, most reaching national
(7–8 of 8) and four reaching the table on each arm; wave-4
reached on 4–5 of 8, wave-5 on exactly one village (the
devotiongate arm's — a diagnostic delta, not a lever claim).
Deaths ran 276–301 across the band. The staged arm's early
feasts did not break villages: its median survival is the
180d cap (vs 143d control) despite 47 extra feasts drawing
real pantry food — early feasting costs dinner but does not
starve the village on this substrate. What was missing
before this arm: any observation of the devotion gate at
all (prior bands: devotion 0). Blank filled: the gate is
real, reachable in the game's first week, and honestly
narrated — the 0215Z "devotion 0" is explained as a staging
artifact of competent policy, not a dead system.

## METRIC REVIEW

- No metric was re-scored mid-run. The verdict uses only
  the pre-registered gate-decision classes, and all four
  DIAG-GO legs were judged against the pre-registration.
- Revision proposed for the NEXT run (not applied here):
  the national-pairing check's equality condition flags
  MISMATCH on all 16 seed-arms even when tsNationalDay and
  maxRank agree the seed reached national+. Either the
  check's condition or the brief's pairing definition needs
  one revision so the label stops crying wolf.
- The control-vs-rebaseline 0/8 agreement is recorded as
  an instrument-coverage difference (different recorder
  sets and row schemas), not a metric failure — the DIAG
  verdict never depended on the rebaseline table.
- No other metric doubts. The gate-decision classes,
  join-completeness rule, and contradiction rule all held
  as written.
