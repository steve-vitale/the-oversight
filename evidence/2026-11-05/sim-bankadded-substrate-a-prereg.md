# sim-bankadded-substrate-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261105T1041Z, arm
sim-bankadded-substrate-a, axis food-economy. Worktree
sim-bankadded-substrate-a. This is a RE-DISPATCH: the first
worker on this arm died at 11:19:51Z on a platform transport
error with NO committed work and no files left; this prereg
is written by the re-dispatched worker from the same brief.
MEASUREMENT/DIAGNOSIS ONLY: no game-code change, no policy
change, no win-price / deed-gate / food-number change. Zero
src/js. If the census proves a genuine bug, this arm STOPS
and documents it as a precise backlog item with its own
proposed GO threshold; it does not build a fix, except a
pure instrument fix in its own scripts (pre-registered here,
proven before/after on identical seeds). Sibling Loop B run
never touched; main tree never touched; hidden_files never
touched (coordinator owns the backlog/tracker/claims).
Nothing is pushed, bumped, or live-verified by this worker
(coordinator merges via --ff-only); report 'merged locally,
pending ship' readiness.

## Canon read first

docs/CANON.md, docs/PRESERVATION.md (food ladder, spoilage).
No canon doc covers "banked evening food retention" as a
named rule — that still holds, as in all prior bankretain
arms. The engine's documented per-form dawn spoil sweep (a
form whose spoilDay has arrived is swept at dawn, other
forms persist) is the only overnight removal mechanism on
record. This arm does not invent canon.

## Blank

Loop A arm sim-bankadded-a (run fleshout-20261105T0515Z,
evidence/2026-11-04/sim-bankadded-a.md) screened 64 seeds
(17025–17088) and found exactly 1 bank-mode evening in 64
seeds (seed 17063, +325 kcal, RETAINED at the true
post-sleep morning, replicated exactly on the census leg).
The GO bar of >= 3 judged events was not met, verdict
INSUFFICIENT-DATA (not re-scored). Bank-mode evenings run
~1 per 64 seeds under this stack. All 3 judged events in
the earlier bankretain-substrate run were CARRIED source,
so the narrow bank-added case is still unjudged. The old
band's 15003/30 case remains censored. This arm gives the
narrow case a substrate rich enough to judge, per
sim-findings.md (bank-added retention needs a richer
substrate — this arm claims that item; the coordinator
marks it).

## Substrate design, chosen up front: PROBE-GIVEN-FOOD leg

Of the two substrates the backlog item names, this arm
builds the PROBE-GIVEN-FOOD leg, not the bank-screened
band. Reason, recorded before building: a bank-screened
band pre-filtered on bank-mode evenings is not actually
cheap — the screen IS a full 60d sim per seed, and at
~1 bank-mode evening per 64 seeds it would take ~200
screened seeds (with high Poisson variance) to expect 3
events. The probe leg stages the post-bank state directly
on ANY stranded evening: honest waits to the bank clock
band (dayTicks >= 449, the same band the bank mode fires
in) plus a recorded injection of a fixed known-edible haul
— the exact state a successful bank-mode forage haul
produces. The judged mechanism is overnight retention of
evening-added food, which is identical whether the food
arrived by forage press or by staged injection; the
acquisition mechanism is NOT what is judged, and the
prereg says so plainly. The injection is recorded per
event (probeAddedKcal, stacks, waits, clock) and is
visible in the corpus; nothing about it is hidden.

Probe policy (new instrument, see below):
scripts/policies/bankadded-probe-diag.js, env-gated
BANKADDED_PROBE=1, wrapping the bankfood stack
(bankaddedProbe(bankfood(warmed(woodcarry(nighttravel))))).
After inner.daily returns, on a stranded-away evening
(same strandedEveningDecision as bankfood-diag.js):
- If the underlying bankfood evening was bank-mode with
  edible delta > 0, that is a GENUINE bank-added event:
  record it as genuine, inject NOTHING.
- Else, if this seed has staged fewer than 2 events so
  far (per-seed cap, see below): honest waits via
  Game.doAction('wait') until dayTicks >= 449 (cap 12
  waits; stop on gameOver/combat; if the cap is hit
  without reaching 449, record skip 'wait-cap' and inject
  nothing), then inject the fixed haul — 18 x 40 kcal
  Muscadine Grapes (foodState 'raw', edible true,
  spoilDay = scholarDay + 2), the same haul shape as
  scripts/bankfood-probe.js's diagnostic inject — and
  record the probe evening (packBefore/packAfter canonical
  snapshots, probeAddedKcal 720, waits, clockBefore/After,
  underlying bankfood mode). The probe says NOTHING: no
  Game.say line from the probe, because the probe must not
  narrate the retention mechanism it is measuring.
- The per-seed cap (first 2 staged events per seed) bounds
  within-seed correlation and corpus size; the bar needs
  only >= 3 events. It is pre-registered, not tuned after
  seeing results.

## Adopted accounting (from the bankadded arm, unchanged)

- Post-bank edible = row.postDailyPack.edibleKcal
  (canonical pack snapshot after the evening phase, which
  the driver takes AFTER the probe staging — so it
  includes the injected food). Pack-before edible =
  probe-evening record packBefore.edibleKcal (snapshotted
  after inner.daily, before injection). Bank-added edible
  delta = post-bank edible − pack-before edible (720 for a
  staged event with no other change in between).
- Judged event (this arm): a bank-band added event —
  probe-staged (mode 'bank-probe', probeAddedKcal > 0) OR
  genuine (mode 'bank', delta > 0, no injection) in the
  same corpora — AND a FOLLOWING MORNING IN-STACK (next
  loop-day row exists AND a firstUpkeep record exists for
  scholarDay = gameDay + 1). Otherwise CENSORED, with its
  reason reported (no-next-loop-day / no-first-upkeep).
- Source split, recorded per event, never used to exclude:
  'banked' (delta > 0, pack-before edible 0) vs 'mixed'
  (delta > 0, pack-before edible > 0). Staged vs genuine
  is reported as a separate split.
- Retention verdict at the first-upkeep (true post-sleep
  morning) snapshot, via the spec-conformant classifier in
  scripts/analyze-bankretain-rerun.js (spoil check precedes
  vanish check): RETAINED (no loss) or RETAINED-SPOIL-SWEPT
  (every shortfall a named per-form dawn spoil sweep) =
  retained; VANISHED (food gone with an unnamed shortfall)
  or PARTIAL-UNEXPLAINED = not retained.
- Injected-stack identity check (new, this arm): for each
  judged staged event, the analyzer reports the injected
  stack's units at post-bank vs first-upkeep, isolated from
  any carried stack of the same key by subtracting the
  packBefore units of that key (key 'Muscadine
  Grapes|40|true|raw', expected spoilDay gameDay + 2).
  Expected 18 units at both snapshots if retained. This
  is the "actually bank-added, not carried" confirmation.
- Morning upkeep's competentEat IS the morning meal for
  accounting (prior arms' mechanism decision): retained-
  then-eaten counts as retained, not vanished. Upkeep eats
  count as morning meals, never as vanished food. Remote
  pantry requisition (havenStoresAccess 'remote') is
  reported per judged morning via the morning record,
  never silently netted out.
- Count DISTINCT events (seed + loopDay), never
  leg-instances. A distinct judged event is RETAINED iff
  every judged leg-instance of it is retained; differing
  instance verdicts flag DISAGREED, which fails unanimity.
  (This arm runs ONE leg per seed, so DISAGREED is not
  expected; the rule stands.)
- Transcript rule (this arm's deviation from the prior
  arms' strandnarr rule, stated with cause): no separate
  strandnarr census leg exists for the probe policy, so
  the probe driver captures the FULL dayLines (not a
  trimmed slice) on every probe evening AND on the
  following morning's row. That is the sense-test source:
  the judged window's evening + morning narration,
  in-corpus. The numeric verdict comes from the
  first-upkeep snapshot, as in all prior arms.

## Primary metric (binding)

Distinct judged bank-band added events (seed + loopDay;
probe-staged OR genuine bank-mode delta > 0 in the same
corpora) retained at the true post-sleep morning, with
the retention verdict (RETAINED / NOT-RETAINED with
mechanism) holding on all of them.

GO threshold for a verdict: >= 3 distinct judged events,
with a unanimous retention verdict (all retained, or all
not-retained with a traced mechanism). Fewer than 3 =
INSUFFICIENT-DATA: report the staged yield (how many
stranded evenings found, how many staged, how many
judged, how many censored and why) and the measured rate.
Do NOT lower the bar mid-run. Do NOT re-score against a
friendlier metric (e.g. counting flip-mode delta > 0
events, or carried events, toward the bar) — flip-mode
delta > 0 events are reported as screen context only,
never counted toward the bar. A miss is NO-GO /
INSUFFICIENT-DATA, never re-scored. Do NOT run a third
unchanged census if the substrate still yields < 3 events
— report the measured rate and stop.

## Bands (reuse, NOT fresh — freshness rule checked)

No fresh seed band is used in this arm. Every seed below
is named in a prior prereg, so the SEED-BAND FRESHNESS
rule (a band named in ANY prior prereg is not fresh) does
not apply — reuse is stated, not claimed as fresh.

- Primary band (8 seeds): the seeds with stranded
  evenings in the 64-seed bankadded screen
  (evidence/2026-11-04/sim-bankadded-a-screen-guard-variant,
  report hidden_files bankadded-screen-64.json): 17064 (9
  stranded evenings), 17059 (5), 17073 (4), 17025 (3),
  17060 (3), 17063 (3), 17029 (2), 17051 (1) — 30 stranded
  evenings total across the band. 17063 is the prior arm's
  single judged event seed.
- Extension pool (if the primary band yields < 3 judged
  events): blocks of 8 from 15003 (known heavy strander,
  9 stranded nights in 30d per the bankfood-diag addendum;
  old band's 15003/30 case remains censored) plus the
  substrate-arm guard-variant corpus stranders
  (evidence/2026-11-04/
  sim-bankretain-substrate-a-corpus-guard-variant):
  17007 (3), 17010 (3), 17016 (4), 17020 (2), 17021 (3),
  17023 (4), 17024 (2). Extension cap: 16 seeds (24 total
  including primary). The extension blocks are the
  pre-registered screen itself, not a confirm spend.
- Legs: guard-variant (WOODWARM=0, BANKFOOD=1,
  BANKADDED_PROBE=1, DAYS=60, same env gates as the
  bankadded arm: COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=nighttravel,
  WOODCARRY=1). OUTDIR evidence/2026-11-05/
  sim-bankadded-substrate-a-corpus.
- No OFF leg: the probe leg is a staged measurement, not
  a before/after comparison; no neutrality guardrail is
  owed. Instrument errors (bankfood errs + probe errs)
  must be 0 across the corpus.

## Horizon and policy

60d death-aware horizon (dead villages stop simulating;
the driver runs at most 60 loop-days). Policy: competent-
player policy (nighttravel + woodcarry + woodwarm +
bankfood stack, as in the bankadded arm) + the probe
wrapper outside it. SENSE-TESTING LAW: read the morning
transcripts for judged events — confirm the retained food
is actually the injected bank-added food (stack identity),
and judge whether the morning meal reads sensibly.

## New instruments (pure, pre-registered)

- scripts/policies/bankadded-probe-diag.js (new): the
  probe wrapper described above. Env-gated
  BANKADDED_PROBE=1; unset/0 delegates to inner.daily /
  inner.upkeep untouched. Reuses packSnap and
  strandedEveningDecision from bankfood-diag.js (imported,
  not copied). No existing policy file is edited.
- scripts/bankadded-probe-trace-b.js (new driver):
  adapted from scripts/bankfood-trace-b.js with ONLY the
  changes disclosed here: the probe wrapper outside the
  bankfood stack, BANKADDED_PROBE=1 required (FATAL
  otherwise), row.bankaddedProbeEvening attached per
  loop-day, row.postDailyPack snapshotted after probe
  staging (as the existing driver already does after
  daily), fullDaySay captured on probe evenings AND the
  following morning's row. Same honesty guards as the
  bankfood driver: no thief grant, no taps, no state edits
  by the recorder, no clock-setting, no top-ups, no driver
  travelTo — the ONLY inventory write in a variant leg is
  the probe policy's own recorded injection.
- scripts/analyze-bankadded-probe.js (new): builds judged
  events from probe corpora (probe-staged + genuine
  bank-mode delta > 0 from the same files), judged vs
  censored split, retention verdict via
  classifyRetention from analyze-bankretain-rerun.js,
  injected-stack identity check, flip-added context via
  analyze-bankadded.js's filter on the same corpora.
  Never writes into the repo.
- scripts/test-bankadded-probe-a.js (new): pure tests for
  the probe predicate, the staging decision (genuine vs
  staged vs skip), the per-seed cap, the analyzer's event
  building (judged vs censored), and the injected-stack
  identity check, on hand-built fixtures. No sims, no repo
  reads. Proof bar: test-bankadded-probe-a.js green BEFORE
  any new judged sim runs.

## Panel note (§15)

scripts/balance-panel.js cannot express the
nighttravel+woodcarry+woodwarm strand stack, the 60-day
evening census, or an env-gated single-mechanism probe
(same declaration as every prior strand arm). Comparison
here is probe-leg events judged by one analyzer, never
labeled a panel comparison. No game-code change was made,
so no panel comparison is owed.

## Metric review (section required in the evidence file)

A miss is NO-GO / INSUFFICIENT-DATA, never re-scored
against a friendlier metric mid-run. If the metric proves
wrong, write it under "metric review" and propose the
revision for the NEXT run.
