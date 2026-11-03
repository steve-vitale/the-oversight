# sim-sensor-supply-b — FIXED KNOWN-COLLAPSER SUPPLY PILOT PREREGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T080700Z,
arm sim-sensor-supply-b, axis food-economy. Worktree
sim-sensor-supply-b, branch sim-sensor-supply-b. This arm changes NO
game code, flips NO policy default, edits NO existing script or policy
file. New files only, all named *-sensor-supply-b.*: this prereg, the
proof test (scripts/test-sensor-supply-b.js), the thin analyzer
(scripts/analyze-sensor-supply-b.js, which imports the reused
gatediseng analyzer for the (c) cross-check and adds only the new rule,
lead arithmetic, the still-collapsing exclusion, and the pilot
verdict), the evidence file, and the pilot corpus
(evidence/2026-11-03/sim-sensor-supply-b.jsonl / *-summary.json /
*-sweep.log / *-detcheck.log). The gatecover tracer
(scripts/trace-gatecover-b.js), the gatediseng analyzer
(scripts/analyze-gatediseng-b.js), and scripts/policies/competent.js
are REUSED VERBATIM, read-only, never edited. This worker does NOT
push, bump versions, verify live, merge, or rebase — the coordinator
lands the branch. This pilot does NOT deploy (e*).

## Canon note (read first)

docs/CANON.md read in full. NO canon doc covers the gatediseng sensor
itself — it is a policy-side sim instrument, not a game system; no
canon is invented for it. docs/PRESERVATION.md (food ladder) is
adjacent only, not the sensor. This arm invents no game system: it
measures would-fire overlays on existing evening trajectories.

## Background (read in full, never re-litigated, never re-judged)

Read before judging: evidence/2026-11-02/sim-sensorredesign-b.md and
its prereg (PILOT-GO on the KNOWN collapsing band: (e*) fires 4/4,
beats (c) strictly 4/4, leads 1, 2, 0, 6), evidence/2026-11-02/
sim-sensorconfirm-b.md and its prereg (first fresh-band confirm
INSUFFICIENT-DATA: 2 collapsing vs bar >= 4, band 80001-80024),
evidence/2026-11-02/sim-sensorconfirm2-b.md and its prereg (second
fresh-band confirm INSUFFICIENT-DATA: judged 1 collapsing seed 81053
vs bar >= 4, band 81001-81056), plus docs/MEASUREMENT.md sections
9-12, 14-15. Two fresh confirms in a row failed the count gate — the
lesson is collapse rarity on fresh bands at this base, NOT band size.
A third same-recipe fresh-band confirm is FORBIDDEN: it would
re-prove the same scarcity. This arm therefore runs (e*) on a
DIFFERENT collapsing supply fixed below: the already-judged
collapsing seeds from the three prior runs, re-run fresh on the
current base. This is a pilot on a fixed known supply, not a confirm
— a pilot on a fixed supply cannot deploy (e*), and no deploy claim
may cite it.

Rule (e*) verbatim, carried from the pilot prereg: S = first evening
of the current disengaged stretch; peak(D) = max pantry over S..D in
the stretch; falls(D) = count of evenings t in (S..D] with
pantry(t) < pantry(t-1), cumulative not consecutive; fire at FIRST
evening D in the stretch with D > S, D >= 8, disengaged,
hungryStreak(D) >= 1, where (E1) falls(D) >= 2 AND
pantry(D) <= 0.90*peak(D), or (E2) pantry(D) <= 0.65*peak(D).
Rule (c) is the old stand-down+trend rule from the same prereg
(S = first evening of the current disengaged stretch; D > S, D >= 8,
three consecutive falls ending at D with D-3 >= S, and
pantry(D) <= 0.90*pantry(S)).

## Fixed supply (fixed here, BEFORE any judged leg)

CANDIDATE COLLAPSING SEEDS (7, from the three prior runs' judged
verdicts — verified against the published archived corpora, not
against summary flags, before this prereg was written):

| seed | source run | archived outcome (archived corpus) |
|---|---|---|
| 79006 | sensorredesign pilot | village-lost day 24, first starvation day 23 |
| 79019 | sensorredesign pilot | village-lost day 25, first starvation day 20 |
| 79031 | sensorredesign pilot | village-lost day 22, first starvation day 20 |
| 79064 | sensorredesign pilot | village-lost day 26, first starvation day 25 |
| 80008 | sensorconfirm (80001-80024) | village-lost day 20, first starvation day 18 |
| 80016 | sensorconfirm (80001-80024) | village-lost day 29, first starvation day 28 |
| 81053 | sensorconfirm2 (81001-81056) | village-lost day 30, first starvation day 26 |

COST-DENOMINATOR SEEDS (4, the sensorredesign pilot band's
non-collapsing seeds, re-run fresh for the cost leg only):
79001, 79002, 79003, 79004 (all archived as 30-day survivors).

CONTEXT SEED (1, NOT judged, NOT counted in any denominator):
81042 — see the flag-discrepancy resolution below. It is re-run
fresh for context only; its fresh outcome cannot change any leg.

All 12 seeds are re-run FRESH on the current base via the verbatim
gatecover tracer, one node process per seed, 30d competent, each
line appended to evidence/2026-11-03/sim-sensor-supply-b.jsonl.
The candidate list above is archival background (already-published
corpora), not a judged leg: no fresh leg runs before this prereg
commit.

## Flag-discrepancy resolution (fixed here, BEFORE any judged leg)

sim-sensorconfirm2-b-summary.json carries TWO different per-seed
flags for 81042, and they must not be confused: `collapsed: true`
but `collapsing: false`. Re-derived from the JUDGED DEFINITION
below against the archived corpus line itself (never from summary
flags): 81042's archived death list contains ZERO deaths with cause
'starvation' (combat, the wild, ambush, dehydration, monster — no
starvation), while it is village-lost on day 26. Under the judged
definition it is therefore NOT collapsing: it is an "other" outcome
(lost without a starvation death), exactly as the judged
sensorconfirm2 verdict counted it (collapsing [81053], other
[81042]). The `collapsed` flag means only "village-lost, any cause"
(reused analyzer: endReason village-lost, or daysAlive < days);
`collapsing` additionally requires a starvation death. This prereg
adopts that distinction as the definition: a seed with
collapsed=true and no starvation death is never a collapsing seed,
however it fires under either rule (archived: (c) day 24, (e*) day 26
E2-cliff — reported as context only, never judged).

## Definitions (fixed here, BEFORE any judged leg)

- Collapsing = village-lost (endReason 'village-lost') WITH at least
  one death with cause 'starvation', within the 30d window
  (daysAlive <= 30). Reference day = first starvation death day.
  Operationally this is the carried analyzer's rule:
  collapsing = base.collapsed AND base.firstStarvationDay != null,
  where base is the reused gatediseng analysis.
- DAY-30 BOUNDARY, DEFINED EXPLICITLY (sensorconfirm2 metric review
  (3) ordered this): a loss ON the horizon day counts. 81053
  (village-lost, daysAlive 30, starvation days 26/29/30) IS
  collapsing under this definition — and under the carried analyzer,
  whose collapsed flag is true for it via endReason village-lost
  despite daysAlive == days. SENSITIVITY, reported not judged: under
  a strict daysAlive < 30 reading, 81053 would drop and the
  candidate supply would be 6, not 7. That strict reading is NOT
  adopted; it is stated so a reader can see exactly what turns on
  the boundary. The verdict is judged on the inclusive definition.
- Survivor = survived the full 30d (daysAlive == 30, not
  village-lost). In this supply the only survivors are the 4
  cost-denominator seeds, unless fresh drift changes membership
  (see still-collapsing rule).
- Other outcomes (lost with NO starvation death, e.g. archived
  81042) are neither collapsing nor survivors: reported
  seed-by-seed, count toward neither judged denominator.
- Lead = reference day - first firing day. A still-collapsing seed
  with NO firing has no lead and fails outright; for lead-vs-(c)
  comparisons, no-fire counts as negative infinity (worse than any
  firing).
- Tracer verification: rows == daysAlive on every leg. A leg failing
  verification is re-run once and the retry reported loudly; a seed
  is never judged on a mismatched row count.
- Determinism spot-check (carried verbatim): re-run 3 legs verbatim
  (first, middle, and last still-collapsing legs in seed order if
  >= 3 still-collapsing seeds exist; otherwise the first 3 legs in
  seed order) and report match/mismatch of the full JSON line. A
  mismatch is reported loudly as a substrate finding; judged legs
  run on the first-run lines.
- FULL POLICY OBJECT RULE (pocketpersist lesson, carried verbatim
  in substance): probe drivers must name the FULL policy object
  (setup + upkeep + daily), never a bare {daily} — a bare-{daily}
  driver silently runs a different game (upkeep is part of any
  policy leg). This arm writes NO new probe driver: it reuses the
  verbatim gatecover tracer, which satisfies the rule by
  construction — trace-gatecover-b.js builds its policy as
  Object.assign({}, competent, {daily wrapper calling
  competent.daily}) (lines 71-72) and passes it to runDays (line
  106), and sim-harness.js calls policy.setup (line 418),
  policy.upkeep (line 557), and policy.daily (line 574). The
  prereg verification of that chain is recorded in the evidence
  file; any future driver in this line must name setup + upkeep +
  daily explicitly.

## Base-equality control (before any judged leg)

Each fresh line is compared to its archived corpus line (byte
comparison of the JSON line, as in the sensorredesign pilot).
Divergences are reported loudly per seed (first diverging day and
field). Judged legs run on the FRESH lines only (both rules on
identical fresh trajectories — still a valid comparison), with
drift named as a substrate finding, not hidden. Drift that
preserves membership does not void the legs. Drift that CHANGES
membership is handled by the still-collapsing rule below (for
candidates) and by the membership-change rule below (for cost
seeds).

## Still-collapsing rule + membership-change rule (fixed here)

- A candidate seed that on its FRESH line is NOT collapsing
  (survived, or lost without a starvation death) is EXCLUDED by
  this pre-registered rule and reported by seed with its fresh
  outcome. It is NEVER counted as a rule failure (neither a
  no-fire nor a missed lead). The judged collapsing denominator
  is the still-collapsing count, fixed only after the fresh
  control legs — but by this rule, never by outcome.
- If fewer than 4 seeds still collapse on fresh lines, the verdict
  is INSUFFICIENT-DATA. Bars are NOT lowered, and no replacement
  seed is screened to fill the count.
- If any cost-denominator seed (79001-79004) NEWLY collapses on its
  fresh line, that is a membership-changing drift of the pilot band
  (sensorredesign prereg's INSUFFICIENT-DATA condition, carried):
  the verdict is INSUFFICIENT-DATA, with the seed named. It does
  not join the collapsing denominator mid-run.

## Judged legs + GO bars (fixed here, BEFORE any judged leg)

Carried VERBATIM from the sensorconfirm prereg where applicable —
fire, beats-(c) strictly, strict, and lead >= 1 (MANDATORY per the
lead-0 coverage-gap finding: a lead-0 firing passes beats-(c) but
is not 'in time' in any playable sense). Adaptations for a
collapser-only pilot supply are stated explicitly, not smuggled:

- COUNT GATE: still-collapsing >= 4. If below, verdict is
  INSUFFICIENT-DATA (bars not lowered, no top-up screening).
  The sensorconfirm survivors bar (>= 12) does NOT apply to this
  supply by design: the supply is collapser-only, so a >= 12
  survivor count cannot be met here. It is DEFERRED to the
  confirm, not waived — see cost leg.
- FIRE LEG: (e*) fires on ALL still-collapsing seeds.
- TIE LEG: lead_e >= lead_c on ALL still-collapsing seeds.
- STRICT LEG: lead_e > lead_c on >= 50% of still-collapsing
  seeds.
- LEAD-ONE LEG (mandatory): lead_e >= 1 on >= 75% of
  still-collapsing seeds. A lead-0 firing is named as a
  death-knell even if the other legs pass.
- COST LEG (pilot screen, small-n by design): (e*) fires on
  <= 25% of the fresh cost-denominator survivors — i.e. <= 1/4
  of 79001-79004 as re-run fresh. This is a screen, not a rate:
  the full survivor-cost leg (>= 12 survivors, <= 25%) is
  DEFERRED to the confirm, because this supply contains only 4
  survivors by construction. The deferral reason is the supply
  shape itself: judging a <= 25% rate on a collapser-only supply
  would require inventing a survivor denominator that is not in
  the supply.
- CROSS-CHECK LEG: this arm's analyzer's (c) first-firing matches
  the reused gatediseng analyzer's (c) first-firing on ALL run
  legs (11 judged + 1 context). Any mismatch =
  INSUFFICIENT-DATA (loud failure, not a re-score).
- TRACER LEG: tracer verification rows == daysAlive on every leg
  (after at most one re-run per seed).

Verdict words (judged exactly against this header):
- PILOT-GO: count gate holds AND all legs hold. The shape survives
  a second, different known-collapsing supply; it earns a
  fresh-band confirm whose collapsing supply is fixed in THAT
  run's prereg. It does NOT deploy (e*), and no deploy claim may
  cite this pilot alone — the supply is known-collapsing by
  construction, so this pilot is shape-survival evidence, not
  fresh evidence.
- PILOT-NO-GO: count gate holds but any judged leg fails, with the
  failing leg named. The shape does not advance on this evidence.
- INSUFFICIENT-DATA: still-collapsing < 4, membership-changing
  drift on a cost seed, cross-check mismatch, or tracer
  verification failure unrepairable by re-run — with the failure
  stated. No leg is re-scored, no margin relaxed, no seed
  substituted, no clause redefined mid-run.

Secondary (reported, NOT judged): per-seed clause (E1/E2) and firing
days for both rules on still-collapsing seeds; mean lead_e vs mean
lead_c (with the pilot's warning that means mislead when coverage
differs); still-collapsing seeds with lead_e == 0 (death-knell
firings, named even on a GO); (c) firing rate on the cost survivors
for context; the (c)-vs-(e*) survivor overlap on the cost seeds;
fresh-vs-archived firing comparison per candidate seed (did the
fresh re-run preserve each seed's archived firing pattern?);
81042's fresh context outcome.

## Staged design

STEP 1 — THIS PREREG COMMIT (before any judged leg).
STEP 2 — TOOLS + PROOF (new proof test scripts/test-sensor-supply-b.js;
pure, synthetic series only, NO judged seeds — synthetic rows carry
no seed numbers from any judged band (synthetic seed 999001 only) —
run green after the prereg commit and before any judged application;
it proves the (e*) rule, the collapse derivation (including the
81042 shape: village-lost with no starvation death is NOT
collapsing, and the 81053 shape: village-lost on day 30 with a
starvation death IS collapsing), the still-collapsing exclusion,
and the pilot verdict logic; the reused proof tests
test-gatediseng-b.js (21/21) and test-gatediseng-confirm-b.js (11/11)
are also re-run green on current base before the pilot).
STEP 3 — CONTROL + PILOT (re-run the 12 legs fresh via the verbatim
tracer, one node process per seed; base-equality comparison vs
archived lines; rows == daysAlive each; apply the still-collapsing
rule and the membership-change rule; 81042 judged as context only).
STEP 4 — JUDGE ((c) via reused analyzer, (e*) via thin analyzer,
cross-check, leads, verdict judged exactly against this header;
wall numbers from the pilot supply, 30d limit stated).
STEP 5 — SENSE TEST (read transcripts around (e*) firing evenings
on still-collapsing seeds — at least the firing evenings of two
still-collapsing seeds, on fresh lines — quote >= 3 lines, and
judge in plain words whether the warnings read as the village
noticing in time, or as a silent cliff: a warning that lands on a
silent evening, or alongside a death, is reported as such even on
a GO).
STEP 6 — EVIDENCE (evidence/2026-11-03/sim-sensor-supply-b.md).

## Balanced panel (section 15) — inapplicability declared

No balanced-panel compare is fabricated, with the same reasoning as
the pilot and both confirms: this arm changes NO game code, runs NO
lever, and its primary metrics are within-trajectory instrument
diagnostics (would-fire overlays on identical evening series), not
panel metrics. The tables are reported directly in the evidence
file instead, on identical seeds and identical trajectories.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins. NO
wall movement is claimed. What is reported from the pilot supply:
survival (seeds survived / legs, median and max days alive), wave
reach, still-collapsing count, and national / table / wins as NOT
REACHED IN WINDOW (expected 0 — late-game states with no fields in
this window, reported as such, not as a rate claim).

## Deploy wording note (carried, not acted on)

Any future deploy wording must be peak-anchored ("fallen from its
recent high"), never stand-down-anchored — per the pilot's metric
review (4), (e*) can in principle fire while pantry is still above
its stand-down level. This pilot does NOT deploy (e*) and writes no
deploy copy. Any future (e*) deploy must also frame the warning as
the village store's fall, not personal hunger (sensorconfirm2 sense
framing constraint: the player's own lines can report full while
villagers starve).

## Attribution limits (stated before judging)

- Evening snapshots only: (e*) reads evening pantry/gate/streak
  values. Intraday flicker is not measured and cannot change a
  would-fire evening verdict.
- Would-fire overlay, not a counterfactual: firing days are computed
  on trajectories as run. A real (e*) rule could change villager
  behavior and therefore later evenings; whether it would have
  saved any village is unmeasured and is not claimed.
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs unmeasured.
- Descriptive staged measurement, NOT a causal claim: a PILOT-GO
  here earns a confirm with a supply fixed in its own prereg; it
  does not deploy (e*).

## Metric review

(To be completed in the evidence file after judging. Doubts about
this header go here, and any revision applies to the NEXT run,
never to this one.)
