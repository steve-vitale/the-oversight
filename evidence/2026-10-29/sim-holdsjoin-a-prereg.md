# sim-holdsjoin-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261029T1315Z.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-holdsjoin-a.
Assignment: JOINED DEPARTURE-HOLD MEASUREMENT (diag only). Build ONE
analyzer that joins, per HUNT pick, the departlag lag class with the
departhold verdict channel. This arm does NOT re-judge the hunthold
pilot (build lane owns the lever; its P1/G1/G2 NO-GO stands and is
not re-litigated here) and does NOT rebuild the holds lever.
MEASUREMENT ONLY: zero src/js changes, zero default flips, zero
policy defaults changed. Policy-side analyzer + scripts/test-*.js
only, plus evidence.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law) and docs/PARTY.md
(departure/holds/party behaviour — PARTY.md carries no departure-gate
or hold mechanics; the gate mechanics below are derived from code,
verified by reading src/js/villager-objectives.js via the prior arms,
not invented canon). CANON GAP (restated from pickdepart /
departhold / hunthold, not invented): no CANON-registered doc covers
departure gates, the daily pick lottery, travel-to-known-monsters,
or field-fight returns. docs/MAP.md covers the map/travel surface
generally, not these gates.

## Prior arms (restated, not re-litigated)

- sim-departlag-a: pick-to-departure lag census on the funnel band
  (seeds 75101–75116, substrate verbatim below, 180d death-aware).
  Wave-4 HUNT picks n=2 only. It deliberately did NOT join
  departure-hold verdicts, and carries a caveat this arm must
  close: SUPERSEDED-by-re-pick can hide a danger overwrite — the
  murkcap pair (seed 75106, visjoin_102, wave-1 murkcap, tighten
  overwrites at parts 429/432) shows tighten-overwrites reading as
  re-pick/forage supersessions in a pick-only join.
- sim-departhold-a: recorder (scripts/policies/departhold-diag.js,
  DEPARTHOLD=1 gated) classifying departure-hold verdicts; proved
  the silent overwrite is recorded on non-wave-4 picks, with 0
  wave-4 overwrites under complete coverage on its band.
- Build lane sim-hunthold-a pilot (policy scripts/policies/
  hunthold.js, HUNTHOLD=1, corpora
  evidence/2026-10-29/perseed-hunthold-off/ and
  perseed-hunthold-on/, seeds 75101–75108): NO-GO on its own legs
  P1/G1/G2 with the mechanism working (209 holds). NOT re-judged
  here. This arm supplies the joined measurement that pilot
  lacked: what the holds did to the verdict distribution, on
  identical seeds, at pick level.

## PATH DECISION (made BEFORE any judged sweep — from the landed corpora)

The hunthold OFF/ON corpora DO carry the DEPARTHOLD verdict traces
the join needs. Verified before this prereg was written, by reading
the corpora (not by assuming):

- Both arms: `departhold.evaluations` present on all 8 seeds per
  arm (OFF 456 evals, ON 489 evals), `departhold.diag.installed`
  true, `errs` 0.
- Both arms: `funnel.picks` present (OFF 92 picks, ON 8 picks —
  funnel records only picks where the villager held a wave-4
  fight memory or chose a wave-4 HUNT, so sparseness is by
  design, not missing data), `returns.departures` present,
  `deathsList` present, `hunthold` store present on ON.
- The real murkcap pair IS in the OFF corpus (seed 75106,
  visjoin_102, parts 429/432, tighten/4 and tighten/5, each
  replacing a ready HUNT with an indoor HAVEN_CHORE).

Therefore: ANALYZE THE LANDED CORPORA. NO NEW SWEEP. 8 seeds only
is already the corpus size; this is a DIAG arm, not a lever
confirm, and a fresh sweep would re-run identical trajectories
for no new information. If analysis finds a channel missing
after all, the prereg is amended in the evidence file under
"metric review" and the arm reports DIAG-NO-GO on coverage —
never silently re-scoped mid-run.

## Substrate (the corpora's own, verbatim — not re-run)

LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, RETURNS=1,
FUNNEL=1, DEPARTHOLD=1, HUNTHOLD=1 (ON) or unset (OFF).
Seeds 75101–75108, 180d death-aware horizon (the corpora's own
horizon: dead villages stop simulating, +10d tail max). The
horizon is inherited, not chosen: the join re-reads finished
trajectories, so horizon choice cannot bias it.

## The join (exact rules, fixed before any judged analysis)

### Universe 1 — funnel HUNT picks (PRIMARY, task-mandated)

Every pick in either corpus with chosen.kind == 'HUNT'. For each,
compute BOTH:

(a) The departlag lag class, verbatim from
    scripts/test-departlag-a.js classifyPick: DEPARTED /
    SUPERSEDED (subKind RE-PICK / OTHER-HUNT / NEEDS / OTHER,
    with lag in days/parts) / DIED-HOLDING / HELD-TO-HORIZON /
    UNKNOWN, from funnel picks + returns departures + deathsList.

(b) The departhold class, verbatim priority from
    scripts/test-departhold-a.js classifyPick: departed-pick-
    linked / died-before-departure / overwritten-danger /
    superseded-by-needs-pick / candidate-null-after-pick /
    superseded-by-re-pick / held-ready-at-end / gate-blocked /
    horizon, from departhold evaluations + funnel picks +
    returns departures + deathsList. Overwrite window: an
    'overwritten' evaluation at part >= pick.part and (part ==
    pick.part OR before the first later funnel pick) belongs
    to this pick.

JOINED CLASS: if (b) is overwritten-danger, the joined class is
OVERWRITTEN-BY-VERDICT regardless of (a) — a pick-only
SUPERSEDED reading is a MISREAD whenever a verdict overwrite
sits between the pick and the next pick. Otherwise the joined
class follows (b), with (a)'s lag attached. A pick with zero
departhold evaluations between pick and terminal event is
NEVER-CHECKED (its fate was decided before any doorway check
ran — e.g. a needs pick replacing it the same part).

### Universe 2 — evaluation chains (ALL waves, the (a)/(c) census)

Group each corpus's departhold evaluations by (seed, vid, mid,
huntDay), splitting a group at every terminal action
(departed / overwritten): a post-terminal evaluation for the
same (vid, mid, huntDay) starts a NEW chain (a re-pick of the
same beast — exactly the murkcap pair's shape: two single-eval
overwritten chains, not one chain). Mid comes from pre.huntMid,
or post.huntMid for freshPickInCall evaluations. Danger
verdicts are deduped per evaluation (the ON corpus carries
exact-duplicate danger records on delegated evaluations: the
lever's pre-check plus the engine's identical re-check —
dedupe identical (vid, tx, ty, score, verdict) tuples inside
one evaluation before counting).

Chain terminal classes: DEPARTED (last eval departed),
OVERWRITTEN (last eval overwritten), HELD-AT-END (last eval
held-ready / skipped-not-at-haven; then: villager died after
the last eval -> DIED-HOLDING, else HELD-TO-HORIZON-OR-
UNRECORDED-SUPERSESSION — reported as ambiguous, never
silently called superseded, because a ready HUNT replaced
without a departure evaluation leaves no record in any
channel).

Held split (question (c)), applied to terminal-HELD chains
and to never-checked funnel picks, each item to exactly one
bucket, sums reconciling:

- danger-held: chain contains >= 1 evaluation with a non-'go'
  danger verdict (ask / tighten / defer) and was not
  overwritten. In OFF this is expected ~0 (non-'go' overwrites
  in the base engine); in ON this is the lever-held population.
- heal-held: chain contains >= 1 evaluation with a heal
  sat-out (heal record ret false / satOut true, or sub
  heal-sat-out), and no non-'go' danger verdict.
- sick/early-held: chain contains only no-attempt early-return
  evaluations (reason sick / heal-sat-out-earlier-today) and
  no danger verdict and no heal sat-out record.
- never-checked: funnel HUNT pick with zero departhold
  evaluations before its terminal event (Universe 1 only;
  chains by construction have >= 1 evaluation).

Also reported (not bucketed above): departed chains that were
EVER danger-held / ever heal-held before departing — the
"held then walked" path the lever is for.

### Questions the join must answer

(a) Do held picks get danger-overwritten between picks
    (verdict-less overwrites)? Count, at eval level and chain
    level, overwritten evaluations/chains WITH vs WITHOUT a
    danger verdict, both arms. A verdict-less overwrite is an
    overwrite evaluation with an empty (deduped) danger list.
(b) Does HUNTHOLD change the verdict distribution vs control
    on identical seeds? Eval-level verdict distribution
    (deduped per eval) + chain terminal distribution + held
    split, OFF vs ON, same seed numbers. Trajectories diverge
    after the first hold, so "identical seeds" means identical
    seed numbers and substrate, not identical trajectories —
    rates and counts are compared, never paired pick-by-pick
    across arms after divergence.
(c) Held split per the buckets above, both arms.

## Primary metric + DIAG-GO threshold (binding)

PRIMARY METRIC: joined-class coverage + verdict-channel
completeness on the two corpora: (i) share of funnel HUNT
picks with a joined class (target 100%, 0 unknown), (ii)
overwriteWithoutVerdict count (target 0 in both arms),
(iii) reclassification count (pick-only SUPERSEDED ->
joined OVERWRITTEN-BY-VERDICT) on real data.

DIAG-GO requires ALL legs:

- LEG 1 — JOIN COMPLETENESS: 100% of funnel HUNT picks in
  both corpora receive a joined class, 0 unknown; 100% of
  evaluation chains receive a terminal class (ambiguous
  held-to-horizon-or-unrecorded counts as a named class, not
  unknown). Any unclassified pick/chain fails the leg.
- LEG 2 — CAVEAT CLOSED: the murkcap-style fixture passes
  (a tighten-overwrite between picks reads as overwrite, NOT
  as a clean re-pick supersession) AND the real murkcap pair
  in the OFF corpus appears as overwritten chain terminals
  with verdicts (tighten/4, tighten/5), not hidden inside a
  supersession class. If the real pair cannot be shown this
  way, the leg fails even if the fixture passes.
- LEG 3 — VERDICT CHANNEL COMPLETE: overwriteWithoutVerdict
  == 0 in both arms at eval level (every overwritten
  evaluation carries a danger verdict); dangerOutside records
  counted and reported separately, never fed into a class.
- LEG 4 — HUNTHOLD DISTRIBUTION ANSWERED: OFF vs ON
  verdict distribution + chain terminal distribution +
  held split all computed on identical seeds, with the shift
  attributed (lever holds vs budget-exhausted overwrites,
  cross-checked against the hunthold store: holds, exhausted,
  narrated). A missing arm or an uncomputed distribution
  fails the leg; no direction of shift is pre-required, so
  the leg cannot be gamed by picking a friendly direction.
- LEG 5 — HELD SPLIT RECONCILES: every terminal-held chain
  and every never-checked funnel pick sits in exactly one
  bucket (danger-held / heal-held / sick-early-held /
  never-checked) and the buckets sum to the held +
  never-checked totals in both arms.

A miss on any leg is DIAG-NO-GO, never re-scored against a
friendlier metric mid-run. Doubts about the metric go under
"metric review" in the evidence file and apply to the NEXT
run, not this one.

## Fixture (mandatory, before the judged numbers are claimed)

scripts/test-holdsjoin-a-fixtures.js proves, on synthetic
rows: (1) a murkcap-style tighten-overwrite between a HUNT
pick and the next funnel pick joins as OVERWRITTEN-BY-VERDICT
while the departlag-only class reads SUPERSEDED; (2) chain
splitting at terminal actions (two overwrites, same
(vid, mid, huntDay) = two chains); (3) danger dedup inside one
evaluation (lever pre-check duplicate does not double-count);
(4) held-split bucketing (danger / heal / sick-early /
never-checked) including a never-checked pick with zero evals;
(5) a departed chain that was ever danger-held is reported as
held-then-departed, not as danger-held terminal. Fixtures run
green before the analyzer's judged output is trusted.

## Sense bar (SENSE-TESTING LAW)

Quote at least one verbatim held-pick verdict trace (eval
chain, with danger/heal/tighten/depart records) from the real
corpora and judge whether it reads as a person-like decision
chain — a villager waiting, being checked, and walking or
being turned back for a reason a person would recognize —
not just counts.

## Deliverables

- scripts/test-holdsjoin-a.js (analyzer, pure reads over the
  two corpora + src/data/monsters.json wave lookup; writes
  evidence/2026-10-29/holdsjoin-a-analysis.json).
- scripts/test-holdsjoin-a-fixtures.js (fixtures above).
- evidence/2026-10-29/sim-holdsjoin-a.md (evidence, with a
  "metric review" section) + holdsjoin-a-analysis.json.
- Commits via scripts/safe-commit.sh only. No push, no bump,
  no live verification — report 'merged locally, pending
  ship' readiness; the coordinator merges with --ff-only.
