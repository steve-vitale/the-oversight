# sim-warmthfuel-b — prereg (BINDING; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-warmthfuel-b, axis
food-economy. Worktree sim-warmthfuel-b. DIAG ONLY: zero
src/js changes, zero policy-default flips, no behavior probe
built, run, or judged. Sibling trees never touched; main
tree never touched.

Pinned base: 003a9c2f391edd56f31a0f6f9f1305dfe6380a48
(worktree HEAD at prereg time, after rebasing the empty
branch onto current master). If the coordinator merges
sibling work mid-run, this arm does NOT re-pin silently:
any re-pin is a new prereg amendment committed before the
affected leg, and numbers are never mixed across pins.

## Question (backlog warmth item, 2026-10-30, arm sim-kcalshort-b)

The warmth fire spends bridge logs on strand nights (ON
nights 9, 11, 13 in the kcalshort census), turning a
3-night food-only guard strand into a 10-night
food-and-wood strand. Warmth is both remedy and cause.
Question for this arm, re-derived on current master:
for EVERY strand night on the 15215 guard + ON legs,
what fuel did warmth spend — bridge log, branches, or
other — with the wood trajectory night by night; and
under the PROTECTED-WOOD COUNTERFACTUAL (bridge logs
protected from warmth, everything else held fixed),
which strand nights convert to rescued, and what does
the strand length become?

Prior evidence read in full before designing anything:
evidence/2026-10-30/sim-kcalshort-b.md (census, warmth
spends ON nights 9/11/13, guard strand nights 7-9 with
rescue day 10) and evidence/2026-10-31/
sim-food-economy-round-0741-b.md (jointgate DIAG-GO +
strandfix2 NO-GO: flips fire but manufacture no wood;
banked food vanishes overnight). No number from either
is quoted as current until re-derived below.

## Substrate (fixed, same strand band as kcalshort/jointgate)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30,
bank seeds 15003, 15009, 15091, 15211, 15215, 15220,
15221, 15337, 15376, 15439. Two judged legs: guard
(WOODWARM=0) and ON (WOODWARM=1; the live substrate leg,
primary). All 10 seeds must survive 30 days on every leg
or the leg is re-run, never judged short.

## Definitions (fixed before any leg)

- Strand evening: a still-refused creek evening
  (woodcarry bucket creek, rescued false) belonging to a
  strand: a maximal run of still-refused creek evenings
  on CONSECUTIVE loop-days (the kcalshort analyzer's
  definition, including length-1 runs). "Strand set" =
  all strand evenings on the leg, re-derived on this
  base by the pilot + confirm legs themselves. The old
  bank's strand set (15215-only) is NEVER quoted as
  current; if the pilot shows a different set, the
  census covers what exists and names what vanished.
- Evening numbers (refusal-time, from the woodcarry
  classification already recorded on the row, NOT from
  any post-evening snapshot): logs = classification.
  woodPlayer, kcal = classification.kcalLive (fallback
  kcal, named per evening if used), ticks =
  classification.ticksToDayEnd. Bridge gates (canon
  costs): 4 logs, 60 kcal, 96 ticks.
- Warmth record (per evening, from ctx._wwLast):
  acted, miss reason, branchesBefore, woodBefore,
  woodAfter, logSpent, fireLit. Engine fuel rule
  (src/js/game.js fireFuel): branches >= 2 -> 2
  branches; else wood >= 1 -> 1 log; else no fuel.
  Warmth gate (scripts/policies/woodwarm.js
  warmDecision): branches >= 2 -> miss
  'branches-available'; wood < 1 -> miss 'no-wood'.
  So an acted warmth fire on branchesBefore < 2 can
  only take wood fuel when it lights.
- Fuel attribution per strand evening (exactly one):
  - WOOD (bridge log): acted, fireLit true,
    logSpent >= 1, branchesBefore < 2. The spent log
    is a bridge log whenever the pre-fire pack held
    <= 4 logs (every strand evening holds <= 4 by the
    refusal record); if any acted night holds > 4
    logs pre-fire, that night is attributed WOOD-SURPLUS
    (a log above the bridge need), not WOOD, and the
    counterfactual treats only the bridge-need portion.
  - BRANCHES: acted, fireLit true, logSpent == 0,
    branchesBefore >= 2 with a recorded branch spend.
    (The recorder cannot see branch units spent by
    makeFire directly; branch spend is therefore
    attested ONLY if post-evening branches =
    branchesBefore - 2. If that equality fails, the
    night is OTHER-UNEXPLAINED, never assumed.)
  - NO-FUEL (friction failed): acted, fireLit false,
    logSpent == 0. Kcal/ticks were spent on the
    attempt, no fuel.
  - NO-WARMTH-SPEND: not acted, any miss reason
    (named per night: branches-available, no-wood,
    ticks-short, fire-near, lever-off on guard, ...).
    No warmth fuel spent that night.
  - OTHER-UNEXPLAINED: any acted night matching none
    of the above (e.g. fireLit true with logSpent == 0
    and no branch-spend equality, or logSpent > 1).
    Counts against bar (a): any OTHER-UNEXPLAINED
    strand night fails DIAG-GO.
- Wood trajectory per strand night (all reads, no
  inference): refusalWood (pre-warmth) ->
  postEveningWood (read-only snapshot after daily
  returns; warmth delta = postEveningWood -
  refusalWood, must equal -logSpent on acted nights
  and 0 on miss nights unless another spend is found)
  -> nextMorningWood (overnight delta =
  nextMorningWood - postEveningWood, expected 0) ->
  nextRefusalWood (daytime delta = nextRefusalWood -
  nextMorningWood). Branch trajectory likewise:
  branchesBefore (warmth record, pre-fire) ->
  postEveningBranches -> nextMorningBranches.
  Any nonzero overnight delta, or any daytime wood
  delta not explained by the day's say lines, is
  reported as an unexplained trajectory break, not
  smoothed over.
- Other-fire scan: on every strand evening, the full
  day's say lines (stored by the recorder) are scanned
  for non-warmth fire/feed lines. Any log-spending
  day event not warmth-attributed is reported as
  OTHER with its line; a clean scan is reported as
  clean, never assumed.
- PROTECTED-WOOD COUNTERFACTUAL (computed, never
  run): wood'(evening) = refusalWood(evening) +
  cumulative warmth log-spends (WOOD attributions
  only) on EARLIER strand evenings, holding daytime
  deltas, kcal, and ticks fixed at their recorded
  values. Rationale for holding them fixed:
  refusal-time kcal/ticks are measured BEFORE the
  warmth step, so a warmth spend cannot change the
  same evening's gates; it can only change later
  evenings' wood. An evening converts to rescued iff
  wood' >= 4 AND kcal >= 60 AND ticks >= 96.
  The FIRST converting evening ends the strand:
  counterfactual strand length = number of
  still-refused evenings before it; later actual
  strand evenings are reported as "never reached",
  NOT as conversions. The guard counterfactual is
  computed the same way (zero spends -> unchanged)
  and must reproduce the actual guard strand.
  LIMIT (stated, not hidden): the counterfactual
  prices the wood gate only. A real protected-logs
  build could diverge (friction draws, cold-night
  consequences, behavior changes) — the counterfactual
  answers "which nights does wood alone block", not
  "what would a build do".

## Pilot gate (before any confirm spend)

Pilot: 8 seeds (15003, 15009, 15091, 15211, 15215,
15220, 15221, 15337) on both legs. Pilot passes iff:
recorder complete on all 16 legs, zero recorder errors
on strand evenings, 15215 strands on both legs (drift
check: if 15215 does NOT strand, STOP — the strand set
has moved and this prereg does not cover judging a
different strand without amendment), and the warmth
record is present on every 15215 strand evening.
Confirm (only if pilot passes): full 10-seed bank on
both legs. NOTE on the generic 12-16 confirm band:
the judged denominator here is the strand bank, and
pilot + confirm cover it in full; unbanked seeds add
no strand denominator by construction of the census,
and any second stranding seed appearing in the bank
joins the census automatically under bar (a). The
confirm size is 10/leg by design, not by shortage.

## DIAG-GO bars (judged exactly as written)

(a) Fuel attribution complete on 100% of strand nights
    on both legs: every strand evening attributed
    exactly one fuel class above, zero
    OTHER-UNEXPLAINED, zero unattributed, wood
    trajectory complete night by night (refusal ->
    post-evening -> next morning -> next refusal)
    with every delta explained or flagged.
(b) Protected-wood counterfactual computed for both
    legs: converted nights named, counterfactual
    strand lengths stated, guard counterfactual
    reproduces actual guard strand.
(c) Warmth-fuel DESIGN DECISION framed as options
    with measured consequences — protect bridge logs
    / burn a non-bridge fuel / leave as-is — decision
    framing only, NO game change, no probe judged.
(d) Determinism: at least one leg re-run
    byte-identical; proof suite green.

A miss on any bar is NO-GO, never re-scored against a
friendlier metric mid-run.

## Panel (§15) applicability

NOT APPLICABLE, same standing as sim-kcalshort-b
(pure DIAG census, no game-root delta). The panel's
compare mode consumes panel-driver outputs
(panel.json.gz before/after), not recorder-row corpora;
guard vs ON differ by a policy env flag (WOODWARM),
not by a game change, so no panel compare .md exists
to attach. The standalone analyzer below is the
instrument; a guard-vs-ON compare .md (attribution
side by side, counterfactual side by side) IS
delivered instead. No panel result is fabricated.

## Wall numbers

National / table / wins are NOT OBSERVABLE on 30-day
pre-seat evening legs — reported as not observable,
never fabricated. Observed structural counts (wave
reach, survival) are reported from the judged corpora.

## Instruments (to be committed after this prereg)

- Recorder: scripts/warmthfuel-trace-b.js — the
  kcalshort driver verbatim PLUS read-only additions
  only: morning branch count, post-evening wood count,
  post-evening branch count (all pure reads after
  daily returns / at morning snap). Behavior-neutrality
  is proven by the equivalence bar: the recorder legs
  must reproduce the kcalshort census numbers
  (creek/still/rescued per seed, strand nights,
  evening woods, warmth acted/log-spent) on the same
  base — any divergence is a recorder defect, not a
  finding.
- Analyzer: scripts/analyze-warmthfuel-b.js — strand
  derivation + fuel attribution + wood/branch
  trajectories + protected-wood counterfactual +
  other-fire scan, pure reads of the corpora.
- Proof: scripts/test-warmthfuel-b.js — attribution
  unit cases (every fuel class + every miss reason +
  counterfactual cases incl. guard reproduction),
  corpus assertions (100% attribution, trajectory
  deltas, counterfactual recomputation, determinism,
  tracked-diff guard: src/ and scripts/policies/
  clean vs HEAD, recorder source contains no engine
  verb calls).

## Metric review (section carried in the evidence file)

The evidence file carries a "metric review" section
per §14. No metric revision is pre-proposed.
