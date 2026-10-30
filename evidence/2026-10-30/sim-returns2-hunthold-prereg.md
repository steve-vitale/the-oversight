# sim-returns2-hunthold — PREREGISTRATION (binding, committed BEFORE any judged leg)

Run: gaps coordinator #2, arm gaps2-returns (c).
Assignment: Steve 2026-10-29 15:47 CDT, "Address remaining gaps" — returns
next preregs. Prior build HELD, NOT killed: sim-hunthold-a pilot NO-GO
(P1 FAIL 0 wave-4 picks held-then-departed, G1 FAIL starvation ON 2 >
OFF 1, G2 FAIL wave-4 reach 4 < 6; P2/P3/P4 pass; mechanism works: 209
holds, 71 waiting lines). This prereg is REVISED from that pilot's
metric-review items — it does NOT re-score the old pilot. Every number
below is judged on FRESH corpora run under this prereg. A miss under
it is NO-GO, never re-scored mid-run (MEASUREMENT.md §14). Gating
freeze stands: NO deedGateReady, finale-omen, or wave/scale threshold
change anywhere in this arm.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md and docs/PARTY.md, then the
prior evidence in this tree: evidence/2026-10-29/sim-hunthold-a-
prereg.md (prior prereg — superseded by this prereg for all future
runs, NOT re-scored), evidence/2026-10-29/sim-hunthold-a.md (prior
pilot NO-GO + metric review), evidence/2026-10-29/sim-departhold-a.md
(recorder DIAG-GO) and evidence/2026-10-29/sim-pickdepart-a.md.
CANON GAP (restated, not invented): no CANON-registered doc covers
departure gates, the daily pick lottery, or field-fight returns.
The mechanism below is derived from code (objMaybeDepart,
objDanger, objTightenOrDefer, objHealGate, objDepart, objPick in
src/js/villager-objectives.js), verified by reading it before this
prereg was written. PERCEPTION LAW: the lever reads only the
villager's own objective and the engine's own danger verdict for
that villager's own hunt tile. No roster, snapshot, or list is
consulted; no companion is asked (HUNT never asks).

## What was wrong with the old taxonomy (the three metric-review items, built in)

(a) KIND-FILTERED DEPARTURE JOIN (required fix): the old join
(same vid, same huntMid, dep.part >= pick.part, no intervening
pick) did NOT filter by departure kind. It misfired once in the
old band: a wave-4 HUNT pick joined to a GUARD departure (the
villager was drafted as a companion; objAskCompanion rewrites a
companion's objective to GUARD but never cleared huntMid), and
was counted as a HUNT departure. THIS RUN'S JOIN: a departure
counts as pick-linked ONLY if the departure record's objective
kind == 'HUNT' (or purpose == 'hunt'). Non-HUNT departures
never count as HUNT departures, in either corpus.

(b) GUARD-DRAFTED CLASS (new terminal class): a primary pick
whose objective was converted to GUARD by a companion ask before
any departure or later pick — detected as a departure record
with kind != 'HUNT' (GUARD in practice) carrying the pick's
huntMid, same vid, dep.part >= pick.part, no intervening pick —
classes as guard-drafted, NEVER as departed-pick-linked and
NEVER as superseded-by-needs-pick. Precedence in the taxonomy:
guard-drafted is checked BEFORE departed-pick-linked. (In the
old band's misfire, the next funnel pick after the guard
departure was WATER — the old taxonomy's first-later-pick rule
would have misread the pick as needs-superseded had the
departure join not fired first. Both misreadings are closed by
this class.)

(c) CLEARING HUNT PROVENANCE ON CONVERSIONS (root-cause fix,
in BOTH corpora as baseline): objAskCompanion (GUARD rewrite),
objMaybeDepart's inline defer (HAVEN_CHORE rewrite), and
objTightenOrDefer's defer branch (HAVEN_CHORE rewrite) now clear
huntMid/huntTx/huntTy/huntDay to null and followsUsed to 0 when
they rewrite an objective to a non-HUNT errand — exactly as
objPick already clears them on fresh picks. Rationale: a
converted objective is no longer a hunt; carrying the beast's
name into a guard's or chore's departure is what made the old
join misfire, and what lets a post-overwrite chore still carry
a huntMid. Scope pin: terminal done/idle transitions are NOT
cleared here (objPick clears on the next fresh pick anyway);
tighten branches that KEEP the kind are NOT cleared (a HUNT
never tightens — it defers — so no HUNT provenance can ride
a tighten). Engine-behavior note, verified by grep before this
prereg: the ONLY readers of huntMid on objectives are the HUNT
arrival block (kind == 'HUNT' gated), objTrailFollow (kind ==
'HUNT' gated), and the recorders. Clearing on non-HUNT
conversions therefore changes no engine decision — only
recorder joins. That neutrality is MEASURED, not asserted, by
leg H-P0 below.

## The lever (unchanged from the prior prereg — re-frozen, not re-tuned)

Plain words: a villager who decided to go back for a beast, and
finds the road looking moderately dangerous, now WAITS instead
of quietly swapping the hunt for housework. They stay home, the
hunt stays decided, and the danger check runs again next part.
They walk only when the check says go. Severe danger still
sends them home to indoor work, exactly as before. After about
two days of waiting, if the danger still has not eased, they
give up and take indoor work exactly as before.

Rules (scripts/policies/hunthold.js, HUNTHOLD=1 gated, zero
src/js for the lever itself):

1. SCOPE: pre-ready HUNT objectives in objMaybeDepart only
   (pre.kind == 'HUNT', pre.state == 'ready'), any wave.
2. HELD VERDICTS: 'ask' (score 2-3) and 'tighten' (score 4-5)
   ONLY. On a held verdict with budget left, the lever returns
   early WITHOUT calling the engine: objective stays 'ready'
   with hunt fields untouched, no RNG drawn, no departure, no
   overwrite, danger re-checked next part.
3. NEVER HELD: 'go' (engine departs) and 'defer' (score 6+,
   engine overwrites to indoor work). Unknown verdicts are
   never held: the lever delegates to the engine.
4. ENGINE EARLY RETURNS UNTOUCHED: sick, away, engaged,
   agency-owned, heal-sat-out-earlier-today, or not at haven —
   the lever delegates and consumes NO hold budget. Budget is
   spent only on a real danger verdict for a villager at haven.
5. BUDGET: at most 6 held evaluations per picked objective
   (MAX_HOLD = 6 — about two days of departure checks). The
   counter rides the objective as o.dangerHold and is cleared
   by every fresh objPick. On the 7th ask/tighten evaluation
   the lever delegates to the engine, which overwrites exactly
   as before.
6. NARRATION: on the FIRST hold for an objective, and only
   when the player is at haven, the villager says one waiting
   line naming the beast by village descriptor. Later holds
   for the same objective are silent.
7. WHAT THE LEVER DOES NOT TOUCH: pick weights, the offer
   window (age 0-3), the heal gate, the ask-companion rule
   (HUNT never asks), the departure gates' age-blindness, or
   any gate retune. Needs picks are not overridden. The
   fresh-pick-in-call scope limit stands (documented in the
   prior prereg §8): fresh HUNTs picked inside objMaybeDepart's
   own re-pick branch and overwritten in the same call are NOT
   restored by the lever; the analyzer reports them separately.
8. A GO verdict means GO CANDIDATE as an instrument,
   default-OFF only — landing this as live game behavior is a
   coordinator/Steve call, NOT made by this arm. No default
   flips.

## Roots, substrate, runner (only HUNTHOLD varies)

- Root: this tree (gaps2-returns) at merge commit e0c6e600a
  PLUS the provenance-clearing commit (src change, item (c)
  above) PLUS prereg + revised-analyzer commits — all committed
  BEFORE either sweep runs, and nothing else committed until
  both sweeps + analysis are done (lottery contamination
  lesson). The grudge + trail mechanisms are PRESENT in both
  corpora (they are part of this tree's code): the substrate
  is "grudge+trail present, hunthold varies" — stated, because
  the prior pilot ran without grudge/trail. Within-run pairing
  is what the legs judge: OFF vs ON differ ONLY by HUNTHOLD.
- Substrate: tableseat-nowait policy VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1, DEPARTHOLD=1 IN BOTH CORPORA (the
  recorder is the instrument and must run in both), 180d
  death-aware, competent policy tableseat-nowait.
- Runner: scripts/test-hunthold-a-sweep.js verbatim, SEEDS +
  EVID env overrides only. Install order: hunthold FIRST, then
  the recorders — so the departhold recorder wraps OUTSIDE the
  lever and records held evaluations.
- Corpora (fresh, read-only after the run):
  evidence/2026-10-29/perseed-returns2-hunthold-off/
  (HUNTHOLD unset) and evidence/2026-10-29/
  perseed-returns2-hunthold-on/ (HUNTHOLD=1).
- Bands: PILOT seeds 75201–75208 (8, FRESH seed numbers — the
  prior band 75101–75108 is not re-run, so no number in this
  run can be mistaken for a re-score of the old pilot).
  CONFIRM (seeds 75201–75216, 16) ONLY if the pilot passes
  every leg below AND time remains; a pilot verdict, GO or
  NO-GO, is a complete result either way.
- Analyzer: scripts/test-hunthold-a.js REVISED (committed
  before the sweeps): kind-filtered departure join,
  guard-drafted class with precedence above, evaluation-based
  secondary census (below), and the H-P0 clearing leg. The
  analyzer takes --off/--on/--seeds flags; the judged run
  passes the fresh dirs + fresh seeds explicitly. Fixtures:
  scripts/test-hunthold-a-fixtures.js re-run (13/13 required)
  plus two new fixture cases for the revised analyzer: (i) a
  GUARD departure joined to a HUNT pick classes guard-drafted,
  never departed; (ii) a HUNT-kind departure still classes
  departed-pick-linked. Exit 1 on any fixture failure, before
  any sweep runs.

## Primary universe and taxonomy (binding)

PRIMARY UNIVERSE: every pick record in the ON corpus whose
chosen.kind == 'HUNT' and whose chosen.huntMid maps to a
wave-4 monster in src/data/monsters.json. Each such pick gets
EXACTLY ONE class by priority order (revised — guard-drafted
inserted first):

1. guard-drafted (new): joined departure (vid + huntMid +
   dep.part >= pick.part, no intervening pick) with kind !=
   'HUNT' — the objective was converted by a companion ask
   (or any non-HUNT conversion) before departing.
2. departed-pick-linked (KIND-FILTERED): joined departure
   with kind == 'HUNT' (or purpose == 'hunt').
3. died-before-departure, overwritten-danger,
   superseded-by-needs-pick, candidate-null-after-pick,
   superseded-by-re-pick, held-ready-at-end, gate-blocked,
   horizon, unknown — as in the prior prereg (departhold
   priority order, adapted only by the two changes above).

HELD-BY-LEVER annotation (unchanged in substance): an
evaluation with recorder action 'held-ready' and sub
'other-held' whose danger records are non-empty and every
record's verdict is in {ask, tighten} counts as a lever hold
(the engine alone never produces held-ready/other-held with a
danger record on a HUNT objective). A pick's chain notes
heldLeverEvals, heldThenDeparted (class departed-pick-linked
KIND-FILTERED and heldLeverEvals > 0 before the departure),
heldBeforeOverwrite (class overwritten-danger and
heldLeverEvals > 0 before the overwrite).
UNEXPLAINED other-held: any held-ready/other-held evaluation
whose danger records are empty, or contain a verdict outside
{ask, tighten}, is unexplained and breaks the instrument leg
(H-P3). In the OFF corpus ANY held-ready/other-held evaluation
on a wave-4 HUNT objective is unexplained (lever off; engine
should never produce one) and likewise breaks H-P3.

SECONDARY CENSUS — EVALUATION-BASED (fixes the funnel
blindness: the old secondary census reported 0 holds because
funnel's wave-4-memory-holder universe captured 0 of the 209
holds): holds, held-then-departed chains, held-before-
overwrite, budget exhaustions, and waiting lines are counted
from EVALUATIONS directly (all HUNT objectives, all waves)
plus the lever store (holds / exhaustions / narrated / errs),
which must agree with the recorder count. The funnel-based
secondary census is still printed for comparability with the
old pilot, but it is NOT judged — its blindness is now a
known artifact, not a finding.

## Pre-registered GO threshold — PILOT (binding; a miss is NO-GO)

PILOT GO iff ALL of:

  (H-P0) CLEARING: departures in the OFF corpus with kind !=
      'HUNT' carrying non-null huntMid == 0, AND the same
      count in the ON corpus == 0. (If clearing works, stale
      provenance departures vanish from both corpora. A
      nonzero count fails H-P0 and voids the taxonomy legs
      that depend on clean joins — overall NO-GO, with the
      failing rows named.)
  (H-P1) MECHANISM: at least one ON primary pick has
      heldLeverEvals >= 1 AND is class departed-pick-linked
      (KIND-FILTERED) with the departure AFTER the hold(s)
      — the held-then-departed pattern, observed in a chain.
      Wave-1 holds alone never satisfy H-P1. A guard-drafted
      pick never satisfies H-P1.
  (H-P2) COUNT NOT WORSE: ON primary HUNT-kind departed
      count >= OFF primary HUNT-kind departed count.
      (Pilot n is tiny — the pilot proves the mechanism
      exists; the confirm band, below, is where strict
      improvement is judged.)
  (H-P3) COMPLETENESS + INSTRUMENT: 100% of ON primary
      picks classified into a named mechanism, ZERO
      'unknown'; ZERO unexplained other-held evaluations
      on wave-4 HUNT objectives in EITHER corpus; every
      wave-4 HUNT objective evaluation in the ON corpus
      carries its danger verdict or a named no-attempt
      reason (no recorder action 'other'); every ON
      'overwritten' evaluation carries a danger verdict +
      subtype.
  (H-P4) RECORDER/LEVER HYGIENE: diag errs == 0 and
      overflow empty in every row for every recorder
      (fieldparty, returns, funnel, departhold) and the
      lever store (hunthold errs == 0), in BOTH corpora;
      the recorder is installed in both corpora; the
      lever store is present in ON rows and null in OFF
      rows.
  (H-G1) STARVATION: starvationDeaths ON <= OFF (totals
      across the band).
  (H-G2) WALL: wins ON >= OFF wins; wave-4 reach ON >= OFF
      wave-4 reach (counts of seeds reaching wave 4).
  (H-G3) NO NEED-OVERRIDE STARVATION: zero held villagers
      starve while holding, any wave: no ON HUNT pick
      (any wave) with heldLeverEvals >= 1 has its
      villager die of starvation while the pick is still
      open (no linked departure, and no later pick with
      day strictly before the death day). Day-granular,
      as the deaths channel is; a same-day later pick
      does not clear the guard.
  If the primary universe is empty in either corpus, the
  verdict is INSUFFICIENT-DATA, not GO — an empty
  universe proves nothing about the mechanism.

## Guards / reported (NOT re-scored into PILOT GO)

- MEDIAN SURVIVAL, DEATH TOTAL (OFF vs ON).
- NEEDS SUPERSESSION counts (primary + secondary).
- BUDGET EXHAUSTION: heldBeforeOverwrite picks.
- FRESH-PICK OVERWRITES: overwritten-danger picks whose
  overwrite evaluation has freshPickInCall true.
- GUARD-DRAFTED census: guard-drafted picks (primary +
  all-wave), OFF vs ON — the class the old taxonomy lacked.
  A rise in guard-drafted picks under the lever is reported,
  not scored: drafting is a companion mechanism, not a lever
  effect, unless the chains show otherwise.
- SENSE BAR: >= 1 full verdict chain quoted VERBATIM from
  the ON corpus (pick -> held evaluations with verdicts ->
  departure or overwrite), with a judgment of whether the
  villager reads like a person waiting or an errand queue
  idling (SENSE-TESTING LAW). The chain must show the hold
  verdicts, not just the class.

## Pre-registered GO threshold — CONFIRM (binding)

Confirm runs ONLY after a pilot GO, on seeds 75201–75216
with the identical substrate and install order, OFF vs ON.
CONFIRM GO iff ALL of: (H-P0), (H-P1), (H-P2-strict: ON
primary HUNT-kind departed count > OFF), (H-P3), (H-P4),
(H-G1), (H-G2), (H-G3) on the confirm band. A confirm miss
is overall NO-GO: the lever stays default-OFF, and the
evidence records a proven mechanism without a confirmed
effect — not a kill of the mechanism (kill discipline: a
missed bar is not a kill; root-cause and confirm the lever
itself is wrong before killing). Per MEASUREMENT.md §14a,
the evidence classifies any kill from the mechanism section.

## Proof tests (before the pilot corpora are judged; all must pass)

1. Revised fixtures (above): 13/13 old cases + 2 new
   guard-draft cases. Exit 1 on any failure, before sweeps.
2. node scripts/check.js --quick with
   --cacheDirectory=/tmp/jest-cache-gaps2-returns, run on the
   clearing commit and adjudicated against the merge-commit
   baseline: ZERO NEW failures vs that baseline. Any new
   failure fails the proof and blocks the sweeps. (The
   clearing commit is the only src/js change after the merge
   commit in this run; the baseline comparison isolates it.)
3. Analyzer determinism: two runs over the pilot corpora,
   byte-identical analysis JSON.

## Metric review (for the NEXT run — never a mid-run re-score)

- (Carried, still open): whether MAX_HOLD = 6 is the right
  budget, or whether the budget should count days rather
  than evaluations (a villager at haven only some parts
  accrues evaluations slower); whether the fresh-pick-in-
  call scope limit should be closed by a restore-based hold,
  and what clock a restored objective should carry; whether
  guard tolerances (e.g. starvation within +1, wave-4 reach
  within -1) should replace the strict guards on small bands
  — NOT adopted here: this run keeps strict guards and
  answers the tolerance question with the confirm band's
  size, not with post-hoc tolerance; whether a held hunt
  should say its waiting line every dawn rather than once
  per objective.
- (New, from this prereg's design): whether the clearing fix
  should also cover terminal done/idle transitions (currently
  left to objPick's fresh-pick clear) if any future join
  reads terminal objectives; whether guard-drafted picks
  deserve their own lever (a drafted hunter's hunt is lost
  without a trace — the companion mechanism, not the danger
  mechanism, eats it).
