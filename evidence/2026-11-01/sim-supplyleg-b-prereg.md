# sim-supplyleg-b — PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-supplyleg-b.
Question (backlog item SUPPLY-LEG LEVER UNMEASURED ON FRESH SEEDS):
which supply leg is the live lever? Seed 17549's story (sim-death17549-b,
run 2026-11-01T0545Z) was expedition-lumpy — one big return night 17,
nothing after — but that is ONE seed. This arm measures per-leg pantry
inflow kcal shares on FRESH seeds, not a single-seed story.

DIAG ONLY: no src/js changes, no policy-default flips, no edits to any
existing policy file or existing script. New files only: this prereg, the
supplyleg trace driver, the supplyleg analyzer, the pure proof test,
evidence, censuses/corpora. The absencehunt trace driver, the
split-absencehunt-jsonl splitter, and sim-harness are REUSED VERBATIM.

## Canon note (read first)

docs/CANON.md read; docs/PRESERVATION.md read (food ladder: processing
rungs, not supply legs). NO canon doc defines "supply legs" as a system —
the legs below are derived from the code's own named pantry-entry paths
(stockPantry names, depositPantryPieces call sites, stockSurplus), not
invented canon. Where the code gives no leg name, the event lands in a
named other/unattributed bucket, never silently assigned.

## Primary metric

Per seed, over a 30-day competent-policy window: for each supply leg, its
share of total WRAPPER-LOGGED gross pantry inflow kcal. Inflow is logged
at the pantry-entry methods themselves (driver wrappers around
stockPantry, depositPantryPieces, pantryAdd, stockSurplus) plus a
push-trap on the home village pantry array for direct pushes. Shares are
shares of GROSS inflow (not net pantry change: meals, spoilage, and
smoking transforms subtract separately and are not inflows).

## Leg definitions (exact, fixed before judging)

- expedition: stockPantry 'Expedition haul' / 'Expedition meat', or any
  stockPantry call whose stack matches /expeditionReturn|haulKcal|
  haulUnknown/ (field-meat returns).
- npc-forage: stockPantry 'Foraged food' (away-forage returns, big-day
  hauls, routine hauls, initiatives, assignments).
- meal-surplus: stockSurplus returns (shared meal surplus into pantry).
- scholar-unload: depositPantryPieces into the home village whose stack
  matches /returnToVillage/ (scholar coming home, pack pooled).
- scholar-donate: depositPantryPieces into the home village whose stack
  matches /donateToPantry/.
- favor-delivery: depositPantryPieces into the home village whose stack
  matches /favor/i.
- fish: stockPantry 'Fish catch'.
- traps: stockPantry names starting 'Snared meat' or 'Pit meat'.
- garden: any stockPantry/depositPantryPieces event carrying gardenShares,
  or stockPantry 'Garden harvest' (garden flag wins over method/name).
- tribute: direct-push events named 'Tribute grain*'.
- contest-prize: pantryAdd or direct-push events whose stack matches
  /contest/i. (Prize, not a supply leg; excluded from dominance.)
- processing: all other pantryAdd events (cooked food put away, etc.).
  (Transformation of pack food, not new world supply; excluded from
  dominance.)
- other-supply: any other stockPantry name (Weregild, aid, System meals,
  etc.), reported by name.
- direct-other: any other direct-push event with kcal > 0 (the honest
  unattributed bucket for direct writes; reported by name).
- transform-skip: direct pushes whose stack matches /smoke|preserve|
  rack/i (smoking splits/converts in place; net-zero, NOT inflow).
- zero-kcal: direct pushes with kcalEach 0 (unknown flesh; counted in
  units, never in kcal shares).

Deposit events into any village object OTHER than Game.state.village
are excluded entirely (exile amends, other-village pantries).

## GO threshold (judged exactly against this header)

GO requires ALL of:
(a) A complete per-leg kcal-share table on at least 8 seeds (pilot band
    below), with every logged event in exactly one bucket above and
    shares summing to 100% per seed.
(b) A verdict rendered by the dominance rule below — either one leg
    named dominant, or "no dominant leg", with the evidence quoted.
(c) A sense read: at least one seed's deposit/return lines read end to
    end and judged for meaning (SENSE-TESTING LAW), quoted in evidence.

Dominance rule (fixed now, never after seeing numbers): a leg is
DOMINANT iff it has the highest mean supply-leg share across seeds AND
is the top supply leg on >= 6 of 8 seeds AND its mean share is >= 35%.
Supply legs for dominance = all buckets except processing and
contest-prize. Otherwise the verdict is "no dominant leg". A
scholar-side info line (scholar-unload + scholar-donate summed) is
reported for context but is NOT a leg and cannot be dominant.

## Pilot gate (before any confirm spend)

Pilot = the 8 seeds below, competent policy, 30 days. STOP (no confirm,
report as the result) if EITHER pilot-gate check fails:
  (1) Instrument parity: on 2 pilot seeds, the supplyleg driver's
      evening pantry kcal series must match the absencehunt driver's
      competent-policy series EXACTLY (same seeds, same env gates).
      Any mismatch = instrument not behavior-neutral; stop and report.
  (2) Nonzero capture: logged gross inflow > 0 on all 8 pilot seeds.
      Zero on any seed = the instrument is blind there; stop and report.
"No measurable spread between legs" (top-two supply legs within 5pp of
each other on >= 6 seeds) is NOT a stop: it resolves to "no dominant
leg" under the dominance rule above, and that IS a result.
No confirm band is pre-planned: this is a measurement arm, not a lever
comparison, so the pilot band IS the judged band. If the pilot passes
the gate, the table on these 8 seeds is the deliverable.

## Horizon + why

30 days, death-aware: villages that die stop simulating (no fixed 200d;
a dead village contributes its days-alive only, and its shares are
computed over its own lived window — flagged, never padded). 30d matches
the death17549 window, gives garden/fish/expedition time to fire, and
keeps the band inside the early game where the scale wall bites.
A +10d tail does not apply: the horizon IS the cap; death ends the run.

## Seeds and policies

Seeds (fresh band, never the 17549 story): 51101, 51102, 51103, 51104,
51105, 51106, 51107, 51108.
Policy: competent ONLY (scripts/policies/competent.js, verbatim).
Deviation from MEASUREMENT §2 (multi-policy) is deliberate and stated:
the question is the supply SHAPE under competent play, and the
comparison is between legs within runs, not between policies.
Substrate gates (identical to absencehunt legs): COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1; WOODCARRY/WOODWARM unset;
MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING not 1.
No balanced-panel comparison applies (no before/after lever; §15 is
for lever comparisons, and this arm measures, it does not change).

## Attribution limits (stated before judging)

- Gross inflow only: a leg's share is its share of what ENTERED, not of
  what the village ate. A leg can dominate inflow and still lose the
  village to spoilage or meal timing; the evidence will say so.
- Wrapper coverage: every kcal-bearing pantry write in the code goes
  through a wrapped method or a pantry push; the push trap covers the
  pushes. In-place transforms (smoking splits, kcalEach rewrites) are
  not inflows and are excluded by rule, not by omission.
- Same-day merging: stockPantry merges into matching stacks; the logged
  kcal is the call's kcal argument, unaffected by merging.
- Pantry cap: stockPantry has no cap check; pantryAdd and stockSurplus
  log only what actually stored (return value), so refused kcal is
  never counted as inflow.
- Sleep-phase events: wrappers log under the last started loopDay with
  phase 'sleep' when they fire outside daily(); attribution to a day is
  approximate by half a day at most, shares unaffected.

## Metric review

(To be completed in the evidence file after judging. Doubts about this
header go here, and any revision applies to the NEXT run, never to
this one.)
