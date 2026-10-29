# sim-nighttravel-bank-b — PREREGISTRATION (committed BEFORE any scan or judged run)

Run: oversight-flesh-out-loop-b, arm sim-nighttravel-bank-b,
axis food-economy, run fleshout-loop-b-20261028T1934Z.
This is the FOURTH judged attempt at the nighttravel lever,
following the 2255Z screened run
(evidence/2026-10-28/sim-nighttravel-screened-b.md), whose
verdict was INSUFFICIENT-DATA (pooled withinReach 7/7 =
1.00, n = 7 < pre-registered minimum-n 8 — ONE evening
short; guards G1/G2/G3-fixed all held; blockedPath 62,
expedition 26). The screened run's mandatory next step,
stated in its own evidence file, is exactly this run: bank
24+ qualifiers before staging, so pilot + extension +
confirm can all stage and n >= 8 is reachable at the
measured yield of ~0.5 within-reach evenings per screened
seed (7 withinReach / 14 screened seeds). The 2255Z verdict
STANDS and is NOT re-judged here — its 14 seeds are never
re-judged as fresh data (see scan range below).

POLICY-SIDE ARM ONLY, UNCHANGED POLICY:
scripts/policies/nighttravel.js is adopted verbatim from
branch sim-nighttravel-b (commit 3efb6f6e in this tree,
instrument adoption only) — zero src/js changes, zero
default flips, zero changes to competent.js or
insideevening.js, no driver adopts the policy. The only
new file in this run besides this prereg and the evidence
file is scripts/test-nighttravel-bank-b.js (bank-staging
proof, committed with this prereg BEFORE the scan). The
analyzer's G3-fixed landing check (judge only hops that
moved; refused hops verified by arrival == departure) is
unchanged from the screened run.

## Canon read before building

- docs/CANON.md (manifest) — read first.
- docs/ABILITY-REFUSALS.md — pantry doors/ledger canon:
  the gate is `havenStoresAccess()`; this arm moves the
  PLAYER through the lodge door at evening time (via
  insideevening's own evening step, reused verbatim); it
  does not change the gate, the ledger, or any refusal.
- docs/TIME-ECONOMY.md (ticks/day-parts) — cost
  accounting as in the screened prereg: node travel is
  free by engine law, the lodge detail walk bills
  walkStepKcal() per landed square plus 1 tick per step,
  arrival runs treelineAmbush / checkEncounter, a
  follower holds at the haven boundary.
- No canon doc covers "travel home at evening time" as
  a policy rule — this is a player-behavior lever, not a
  system, so no canon is invented for it. Authority for
  the reach rule is the engine itself
  (travelTargets()/travelTo()/travelBlockage) plus the
  prior arm evidence (2126Z/2224Z/2255Z). The travel
  reuses only honest player verbs already in the game
  (one travelTo hop, then walk + 'Go inside'), exactly
  as a player tapping home on the map would.

## Perception law (Steve 2026-10-28, binding) — sense channel stated

Nighttravel's "home" is the villager's OWN haven:
state.village.px/py (engine default 4,4, verified 4,4 on
every prior policy row), the haven the player lives in
and has been to. The sense channel is lived-in
knowledge: the player knows home because they live
there, and the reach check offers ONLY nodes the engine
already offers in Game.travelTargets() — revealed tiles
within Manhattan d <= 3, or adjacent tiles — i.e. places
the player can see or has revealed, never a roster, crew
list, or snapshot. No list-fed wiring exists anywhere
in this arm: the policy consults travelTargets() + its
own haven coords; the driver records positions; the
analyzers count positions. Any list-fed wiring would be
reverted, not landed. The scan analyzer enforces this
mechanically (control-only input, fatal on any
non-insideevening file).

## The policy (unchanged, summarized)

scripts/policies/nighttravel.js extends insideevening:
competent.daily runs, then the night step as the
evening's LAST step before the harness's sleep.
Game over / in combat / pending encounter:
'blocked-combat', no travel, no entry. Inside a tent:
'blocked-tent', no travel, no entry. Already inside
on the haven tile, or outside on the haven tile:
delegate to insideevening's eveningStep unchanged.
Away: REACH = the haven node appears in
Game.travelTargets() — a single honest travelTo hop,
no force, no route-around, no blockage clearing, no
multi-hop trek, no walking into fog beyond what the
engine offers. Not offered: 'out-of-reach', sleep
away. Offered: ONE Game.travelTo(hx, hy); position
unchanged: 'travel-refused' (block object / null
recorded); fight live after the hop:
'travel-arrived-combat', no entry attempt; death on
the hop: 'travel-died'; otherwise delegate to
insideevening's eveningStep for the walk + 'Go
inside' leg. The policy does NOT exit in the morning;
no kcal floor beyond the engine's own affordability
check in beginPathWalk.

## Instrument

- Driver: scripts/nighttravel-trace-b.js, unchanged
  (fresh game per seed via scripts/sim-harness.js, same
  grant fixture: thief ability granted at setup so the
  tap is offered; same nofeast substrate on both legs:
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1, asserted FATAL in the driver;
  30 loop-days; tap days = last 5 loop-days;
  genuine thief tap exactly as insideevening did;
  pre-travel position per evening).
- Analyzer: scripts/analyze-nighttravel-b.js --rerun,
  WITH the G3-fixed landing check. The legacy
  raw-false count is retained for transparency but is
  NOT the guard. Legacy pooled fields are retained
  for comparability only and are NOT the judge.
- Proofs: scripts/test-nighttravel-rerun-b.js (R1–R11)
  and scripts/test-nighttravel-b.js (T1–T9), unchanged
  from the screened run, are the judging proofs.
- Scan analyzer: scripts/analyze-nighttravel-scan-b.js,
  unchanged. It reads ONLY a control-leg
  (insideevening) corpus directory and refuses any
  non-insideevening file, so it cannot select on
  conversion outcome: control rows carry no
  travelOffered/converted fields at all.
- Bank-staging proof (NEW, committed with this
  prereg): scripts/test-nighttravel-bank-b.js
  (checks B1–B8 below). It validates the bank
  staging from the scan JSON alone, before any
  judged run is spent on the confirm band.

## Primary metric, GO threshold, minimum-n rule, guards (judge ONLY against these)

An evening is AWAY iff its preStepTile is not
'haven' (preStepTile is the post-competent.daily,
pre-night-step position on the policy leg, exactly
as in prior runs). Evenings with eveningOutcome
'game-over' are excluded from every count (the
driver records no night step for them), as before.

### Population partition (disjoint, policy leg, per away evening)

Applied in this order; every away evening lands in
exactly one population (unchanged from the screened
prereg):

1. blockedGuard — eveningOutcome 'blocked-combat'
   or 'blocked-tent'. Excluded from the primary
   denominator. Reported, never pooled.
2. havenUnknown — eveningOutcome 'haven-unknown'.
   Excluded from the primary denominator. Reported.
3. expeditionAway — travelOffered === false
   ('out-of-reach': the haven node was not offered
   in travelTargets). Reported as its own
   population, NEVER pooled into the primary.
4. blockedPathAway — eveningOutcome
   'travel-refused' AND travel.hopReturnKind starts
   with 'block:'. Reported as its own population,
   NEVER pooled into the primary.
5. withinReach — travelOffered === true AND NOT
   blockedPathAway. This is the primary population.
6. unclassifiedAway — any remaining away evening.
   Excluded from the primary denominator. Reported;
   a non-zero count is investigated in the evidence
   file, not silently dropped.

PRIMARY (M1r, pooled over the judged band):
within-reach conversion =
  (withinReach away evenings ending inside on the
  haven tile: inside === true AND tile === 'haven')
  / (all withinReach away evenings).
Within the denominator, these stay as
non-conversions: travel-refused with a null / non-
block return, travel-arrived-combat, travel-died,
and travelled-home-but-entry-failed evenings
(entry outcomes completed / walk-no-path /
no-go-inside-button / entry-refused /
walk-interrupted-combat, exactly as insideevening
records them).

### Minimum-n rule (pre-declared, binding)

GO requires pooled withinReach n >= 8 across the
judged band. If pooled withinReach n < 8 at any
stage verdict, the verdict is INSUFFICIENT-DATA —
not GO and not NO-GO, no landing, and the small-n
rate is reported as a diagnostic only. A rate on
n < 8 must never be presented as a pass, and a miss
on a thin denominator must never be presented as a
lever failure.

### Guards (G3-fixed; G1/G2 copied from prior preregs)

- G1 (survival guard): median daysAlive (loop-days
  survived, death-aware: dead villages stop) on the
  policy leg >= control median - 2.
- G2 (starvation guard): starvation-caused deaths
  (telemetry cause matching starvation, either leg)
  on the policy leg <= control + 2.
- G3-fixed (honesty guard, zero-tolerance): zero
  evenings in the policy corpus where (a) entry
  completed while inCombat/pendingEncounter was
  live at entry time, (b) entry completed from a
  tent, (c) a travel hop that MOVED did not land
  on the haven node, or (d) a travel hop used force
  / more than one travelTo call. A refused hop
  (arrival == departure) is verified by arrival ==
  departure AND outcome 'travel-refused'; it is
  NOT a (c) violation under any reading. The
  legacy raw-false count is reported for
  transparency and is NOT the guard. Verified by
  the proof scripts' legs over the corpus, not by
  assertion.

### Verdict (staged — see "Staged judged runs" below)

GO iff pooled-bank M1r >= 0.50 AND pooled-bank
withinReach n >= 8 AND G1 AND G2 AND G3-fixed all
hold on the pooled bank.
NO-GO iff pooled-bank M1r < 0.50 (with n >= 8) or
any guard fails on the pooled bank — OR the
pilot/extension gates below fail conclusively
(rate < 0.50 with n >= 8, or a guard fails) before
confirm is spent, in which case the verdict is
NO-GO on the staged corpus run and confirm is not
spent.
INSUFFICIENT-DATA iff pooled withinReach n < 8
after the staged bands that were run.
A miss is NO-GO, never re-scored against a
friendlier metric mid-run; metric doubts go under
"metric review" in the evidence file for the NEXT
run.

### Secondary metrics (REPORTED, never gates)

- streaksBroken: a streak is a maximal run of
  consecutive loop-days on one seed where each
  evening's preStepTile is away (non-null, not
  'haven'). A streak is BROKEN iff its last
  evening is a converted away evening (preStep
  away, ends inside on the haven tile). Reported
  as broken / total streaks, per seed and pooled.
  Streaks ending at the 30-day cap unconverted are
  unbroken, not broken.
- tapDaysConverted: tap days (last 5 loop-days)
  whose pre-travel position was away AND whose tap
  was attempted (button ok): converted fraction,
  reported with its n, plus the withinReach subset
  (attempted away taps whose evening record has
  travelOffered === true and is not blockedPathAway)
  reported alongside. Tap-day counts are small by
  construction; they are descriptive evidence about
  the tap failure class, not a second bar.

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as prior runs: the question is
evening conversion, and the away pattern is visible
inside 30 days. Dead villages stop simulating
(runDays endReason); a +10d tail is unnecessary
because sleep rolls the day and the next loop-day
records the outcome. A longer horizon is NOT used:
the binding constraint measured in 2255Z is trigger
rarity PER SEED (0.5 withinReach evenings per
screened seed), not days per seed — the wider bank
below addresses rarity directly, and keeping 30d
preserves comparability with 2126Z (2/2), 2224Z
(0/0), and 2255Z (7/7, n = 7).

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered here before the run (prior-run
precedent, stated so its absence is not a gap):
this leg is a 30-day position/reachability
measurement of a POLICY-SIDE arm — zero src/js
changes, so there is no game-root delta for a
panel to compare (base panel vs lever panel would
be identical by construction), and the panel's
registry policies do not include the trace
policies (insideevening/nighttravel) this arm
measures. The before/after instrument for this leg
is the custom driver on identical seeds (control
insideevening vs policy nighttravel), and the
pre-registered thresholds above are the judge.
Wall numbers are reported as not-observable-in-30d
for the judged corpora, never claimed as movement.
If this lever ever becomes a game change, a panel
compare is run at that point; a policy-side trace
cannot fake one now.

## Wider control-only scan (pre-registered BEFORE the scan — targeting 24+ qualifiers)

Blind consecutive bands yielded withinReach 0/0 in
16 seeds (2224Z) because within-reach away evenings
are rare AND seed-skewed. The screened run enriched
the denominator by position only and still stopped
one evening short. This run therefore banks a WIDER
qualifier bank under the SAME qualifier rule, never
a sharper outcome-touching screen.

### Scan procedure

- Scan bands (control leg ONLY, POLICY=insideevening,
  same substrate DAYS=30 TAPDAYS=5): consecutive
  blocks of 32 seeds starting at 11000 — block 1
  11000–11031, block 2 11032–11063, and so on,
  into ONE scan corpus directory
  (evidence/2026-10-28/sim-nighttravel-bank-b-scan-insideevening/).
  Scanning STOPS at the end of the first block that
  reaches >= 32 qualifiers, or after block 16
  (11000–11511, 512 seeds), whichever comes first.
  No partial blocks. The >= 32 stop is chosen so
  that, in the normal case, pilot (8) + extension
  (8) + confirm (rest >= 16) all stage; the
  minimum bank for full staging is 24 (see below).
- These bands are fresh: they do not overlap the
  already-judged 10800–10991 bank (never re-judge
  judged seeds as fresh data), nor the 2126Z pilot
  band (10700–10707), the insideevening confirm
  band (10710–10725), the 2126Z reserved confirm
  band (10730–10745), the 2224Z pilot/extension
  bands (10750–10765), or the 2224Z reserved
  confirm band (10766–10781). The 10714/10720
  prediction seeds are NOT in any scan band and
  can NEVER be selected: selection comes only
  from scan qualifiers, by the rule below.
- Qualifier rule (exact, SAME as the screened
  prereg): a seed qualifies iff its control scan
  has >= 2 NEAR-HOME AWAY evenings, where a
  near-home away evening is an evening row with
  eveningOutcome != 'game-over', preStepTile
  != null and != 'haven', and evening-end map
  coords (row.mapPx/mapPy) within Manhattan
  distance <= 3 of the haven node (4,4).
  Rationale, each piece grounded: (i) away evenings
  on the control leg never move in the evening step
  (insideevening returns 'not-attempted-away' /
  'blocked-combat' before any movement), so the
  evening row's post-daily coords ARE the pre-step
  position; (ii) d <= 3 is exactly
  Game.travelTargets()'s offer envelope (revealed
  within d <= 3, or adjacent), so it enriches for
  the reach envelope without promising reach
  (revealedness, blockages, and guards still
  decide — a d2 creek evening qualifies and lands
  in blockedPathAway, correctly); (iii) the haven
  node (4,4) is verified on every prior policy row;
  if any judged policy leg shows haven != (4,4),
  the qualifier definition is revisited under
  "metric review" for the next run, not patched
  mid-run.
- Qualifier ORDER (deterministic, declared now):
  nearHomeAway count desc, ties by seed asc. The
  scan analyzer prints this order and writes it to
  the scan JSON; bands are assigned from it, never
  by hand-picking.
- PROHIBITIONS (binding): never screen on
  travelOffered, converted, travel outcomes, or any
  policy-leg field; never re-order qualifiers by
  anything but the declared order; never add a
  seed outside the qualifier order to a judged band
  for any reason (including "it looked promising"
  — the 10714/10720 prediction stays a prediction,
  never a selection reason); never lower min-near
  or the d <= 3 envelope after seeing scan yields;
  never re-use a 10800–10991 seed as fresh data.
  The scan analyzer enforces the first prohibition
  mechanically (control-only input, fatal on any
  non-insideevening file).

### What the screen does and does not claim

The screen enriches the DENOMINATOR (away evenings
near home) on away-prone seeds. The estimand is
therefore "within-reach conversion among away
evenings on away-prone seeds" — the lever's
conversion rate where its trigger occurs — NOT a
blind-band rate. A blind-band rate is not estimated
by this run and must not be quoted from it. The
2224Z blind-band finding (0 withinReach in 16 blind
seeds) stands as the blind-band evidence.

## Staged judged runs (pre-registered — pilot + extension + confirm)

Judged corpora are FRESH both-legs runs on the
assigned seeds (the scan's control rows are
selection inputs, not judged corpora — fresh judged
runs keep the judged comparison identical-procedure
on both legs). Control (shared, run fresh on
identical seeds with the SAME driver):
insideevening-only policy. This isolates the TRAVEL
delta: control and policy differ only by the night
step. Substrate (both legs and scan, asserted FATAL
in the driver): COMPETENT_FEAST=0 SEATDRIVE=0
PLENTYDEPRI=0 DEPOSITGATE=1.

### Band assignment (from qualifier order)

- PILOT = first 8 qualifiers.
- EXTENSION = next 8 qualifiers.
- CONFIRM = all remaining qualifiers (rest).
  Full staging requires a bank of >= 24, so that
  confirm has at least 8 seeds. All bands disjoint.
  Bands are assigned from the qualifier order by
  scripts/test-nighttravel-bank-b.js (B1–B8) and
  written to the evidence file before the judged
  runs are spent; no band is assigned by hand.

### Pilot gate (explicit — decides whether extension is spent)

Run pilot (8 seeds, both legs fresh), analyze with
the --rerun analyzer, and check:
- P-GATE-VALID: both legs present for all 8 seeds,
  partition sums hold on every seed (away =
  blockedGuard + havenUnknown + expedition +
  blockedPath + withinReach + unclassified), no
  unresolved unclassified investigation.
- P-GATE-RATE: if pilot pooled withinReach n >= 8
  AND pilot M1r < 0.50, pilot FAILS conclusively —
  STOP, verdict NO-GO on the pilot corpus, no
  extension, no confirm (fast kill; spending more
  seeds cannot rescue a conclusive pilot miss
  under the pooled rule, and the prereg forbids
  re-scoring).
- Otherwise pilot PASSES to extension: either
  n < 8 (extension is mandatory, exactly as in
  prior runs — this is the prereg's own trigger,
  not a choice after seeing the pilot), or
  n >= 8 with M1r >= 0.50 and guards holding on
  the pilot (proceed to confirm staging via
  extension). A guard failure on the pilot alone
  does NOT by itself stop the run — guards are
  judged pooled (see extension gate) — but it is
  reported and must be re-checked pooled; a pilot
  guard failure that persists pooled is a NO-GO
  (see below).

### Extension gate (explicit — decides whether confirm is spent, and whether the pooled-bank verdict is reached)

Run extension (next 8 seeds, both legs fresh),
pool pilot + extension (16 seeds), and check:
- E-GATE-N: pooled pilot+extension withinReach
  n < 8 → STOP, verdict INSUFFICIENT-DATA on the
  pooled pilot+extension corpus, no confirm spent,
  bank committed for the next run. (This is the
  2255Z outcome repeated at larger scale; it is
  not a lever failure.)
- E-GATE-RATE: pooled M1r < 0.50 with n >= 8 →
  STOP, verdict NO-GO on the pooled
  pilot+extension corpus, no confirm spent.
- E-GATE-GUARDS: any guard (G1, G2, G3-fixed)
  fails pooled → STOP, verdict NO-GO on the pooled
  pilot+extension corpus, no confirm spent.
- Otherwise pilot+extension PASS: pooled n >= 8,
  pooled M1r >= 0.50, all guards hold pooled.
  ONLY THEN is the confirm band spent, and ONLY
  THEN is the verdict judged on the pooled bank
  (pilot + extension + confirm, below).

### Confirm + pooled-bank verdict (only if pilot+extension pass)

Run confirm (rest of the bank, at least 8 seeds,
both legs fresh), pool ALL staged bands, and judge
the pooled bank ONLY:
- GO iff pooled-bank M1r >= 0.50 AND pooled-bank
  withinReach n >= 8 AND G1 AND G2 AND G3-fixed
  all hold on the pooled bank.
- NO-GO iff pooled-bank M1r < 0.50 (with n >= 8)
  or any guard fails on the pooled bank.
- INSUFFICIENT-DATA iff pooled-bank n < 8 (cannot
  occur if the extension gate passed, since n is
  monotonic across bands — stated for completeness;
  if it somehow occurred, it would be reported as
  an instrument error, not a pass).
- The pilot-only and pilot+extension-only rates
  are reported as staging diagnostics, never as
  the verdict once confirm has run. The verdict is
  the pooled bank, nothing else.

### Short-bank branches (declared now, not decided after seeing the scan)

- Bank >= 24: full staging as above (pilot 8 +
  extension 8 + confirm rest >= 8).
- Bank 16–23: pilot 8 + extension 8; confirm =
  remaining qualifiers (< 8) is NOT staged as a
  confirm band — the verdict stands on pooled
  pilot+extension (GO/NO-GO/INSUFFICIENT-DATA
  under the same bars, with confirm explicitly
  skipped-with-note, not a lever failure). The
  bank is committed for the next run to top up.
- Bank 8–15: pilot 8; extension = all remaining
  qualifiers; no confirm band (skipped-with-note
  as above); verdict on pooled pilot+extension.
- Bank < 8: NO judged run is spent (a pilot cannot
  be staged); the verdict is INSUFFICIENT-DATA by
  design and the scan yield itself is the finding
  (qualifier rate measured, not assumed, for the
  next run's strategy).

## Landing rule (pre-registered)

- GO: lands the default-OFF policy instrument
  ONLY — scripts/policies/nighttravel.js plus its
  trace/analyzer/proof instruments, as a policy
  file no driver adopts by default. NO driver
  adopts it, NO default flip, NO src/js change,
  NO competent.js / insideevening.js change.
  Landing is a commit of the instrument as held,
  not a game change; a game change would require
  a separate prereg and a panel compare.
- INSUFFICIENT-DATA or NO-GO: the branch stays
  HELD, unmerged as a landed lever, with the bank
  (scan JSON + qualifier order + staged corpora
  actually run) committed for the next run. A
  NO-GO does not delete the policy file on this
  evidence alone (kill discipline, Steve
  2026-10-21: a missed bar is not a kill without
  a root cause); deletion, if ever proposed, is a
  separate coordinator decision. An
  INSUFFICIENT-DATA verdict is explicitly not a
  kill and not a pass.

## Seeds and control (stated before any judged run)

- Scan: blocks from 11000 as above (control only,
  max 11511, stop at >= 32 qualifiers).
- Pilot: first 8 qualifiers (both legs, fresh).
- Extension: next 8 qualifiers (both legs, fresh),
  run if the pilot gate passes (see above).
- Confirm: rest of the bank (both legs, fresh),
  run ONLY if pilot+extension pass their gates.
- Control (shared, run fresh on identical seeds
  with the SAME driver): insideevening-only policy.
- Substrate (both legs and scan, asserted FATAL
  in the driver): COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1.
- 10714 / 10720 prediction — POST-VERDICT
  DIAGNOSTIC ONLY, as in prior runs: their tap-day
  away positions sit inside the single-hop reach
  that converted 2/2 in 2126Z. That prediction is
  NOT part of this run's verdict, NOT a reason to
  pick any seed, and 10714/10720 are NOT in the
  scan, pilot, extension, or confirm bands. Any
  diagnostic check of them after the verdict would
  be unjudged, reported as such, and would not
  change the verdict.

## Sense-testing (mandatory, in the evidence file)

Read transcripts end-to-end for at least: one
travelled-home evening (does the hop + walk +
entry read as a sensible played evening — what did
the player pay, what did the arrival narration
say?); one expedition-away (out-of-reach) evening
(does sleeping away read as the honest boundary,
not a silent failure?); one blocked-path-away
evening if any occur (does the refusal read
honestly?). Judge meaning, not counts: a
converted evening that reads as a teleport is a
failure of the lever even if M1r passes.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who
thrived and who died and why, what knowledge /
capabilities were missing, which blank was filled
(fix) or documented (evidence). Plus wall numbers
for the judged corpora (national / table / wins,
wave 4–5 reach, median survival) even if zero or
not-observable — no wall movement claimed unless
measured.

## Metric review (mandatory section in every evidence file)

Judged ONLY against this preregistration. No
mid-run re-scoring: expedition-away and
blocked-path-away evenings stay out of the primary
denominator as defined here; a thin withinReach
denominator does not rescue or sink anything
beyond the minimum-n rule stated above. If the
metric proves wrong (e.g. the d <= 3 screen proves
too narrow/wide vs what travelTargets offers, or
the haven (4,4) assumption fails on a judged seed),
write it under "metric review" and propose the
revision for the NEXT run.
