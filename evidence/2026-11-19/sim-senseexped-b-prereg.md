# sim-senseexped-b — FROZEN prereg (Loop B run fleshout-loop-b-20261119T0530Z, arm sim-senseexped-b)

**Frozen:** 2026-11-19 ~00:40 UTC, BEFORE any judged sim. Base master
`cd2d685b8` (Loop B 0115Z adoption closeout). Branch `sim-senseexped-b`.
**Lever:** the launch-party sense reads the fighter's current
expedition companions (SENSEEXPED=1, env-gated, default OFF) instead
of the mutable plan party. `villagerFightAllies` gains a launch branch
that takes the fighter's live expedition (`agencyState().exped[vid]`)
and returns the other villagers whose expedition entries share its
target (tx, ty), alive and on the roster, ordered by expedition start
(`sinceDay`, then `sincePart`) — the party that actually set out
together. The branch heads the answer list ahead of crew/earshot, cap
stays 2 (fighter + 2 = the trio). No trust floor on the launch branch
(the launch pick enforced it; the expedition is the commitment). The
same-target guard is UNCHANGED — it is not the constraint, and the two
DIAG arms proved it never wrongly excluded a listed companion. No node
check, as before.

## Design call (the brief's open question — decided here)

Two candidate levers converged from the DIAG arms. **Option A (this
arm): read expedition companions in the sense.** The launch branch
already reads `agencyState().exped` for its per-member guard, so
replacing the membership source is one loop in one function
(`party-wiring.js` only), with no lifecycle, return-timing, or
food/encounter-cadence side effects. **Option B (NOT built):
hold a launched quad's expeditions together** (no independent early
return while the hunt is live) — it would touch `expeditionReturn` /
`expeditionLeg` lifecycle in `villager-agency.js`, change return
timing and encounter cadence, and carry survival side effects far
outside the sense. A is the smaller change by an order of magnitude;
B stays a follow-up candidate, not built here. Only A is judged.

## Ground (two independent DIAG-GO arms converged)

- `evidence/2026-11-18/sim-sensecotravel-b.md` (Loop B, finding
  #2583): corrected join re-judges the 2330Z pilot at field-4 4/6 =
  0.67; all 7 arm-leg sense misses classified (expedition-ended 3,
  different-expedition 2, dead 2); 0 in-plan-party-but-unsensed. When
  the plan party is intact the sense returns the trio 6/6.
- `evidence/2026-11-19/sim-sense-guard-diag-a.md` (Loop A, finding
  #2571): repro + fresh legs, 24 misses classified; 20/24 (83%) trace
  to `plan.party` churn (fighter-relaunched 13, mirror-overwrite 7)
  against 4 genuine target-mismatches. Mirror-overwrite pinned on
  seed 104753 (holder emma_larsen: plan.party shrinks to one other
  holder on d71/d93 when a former companion re-launches as holder).
  Fresh-leg sense rate 0.39 (7/18) under the plan-sourced sense.

## Why the launch branch is built here (scope note)

The plan-sourced launch branch (LAUNCHPARTY substrate, commit
`1fe712030`, HELD finding #2538) is NOT on master — `grep LAUNCHPARTY
src/js/` is empty at this base. This arm therefore lands the launch
branch itself, but sourced from expedition companions per the named
lever, under the new flag SENSEEXPED=1 — it does NOT port the
plan-sourced branch. The control leg is current master (no launch
branch: crew + earshot only), so the contrast measures exactly the
lever: old sense vs expedition-sourced launch sense. The
plan-sourced branch is never built or judged here.

## Substrate (rides along, NEVER re-judged)

- PARTYSIZE4 (on master, env-gated): wave-4+ launches go out as
  trios/quads; without it the pilot would have no launched parties
  to sense. ON both legs.
- VETREENGAGE (on master, env-gated): co-tasked counting in
  `winPlanFightParty` — affects SEEK decisions, hence how many
  meetings occur. ON both legs.
- FLEEREPAIR2 (on master, env-gated): flee repair in the win plan.
  ON both legs.
- FIGHTALLY2 (on master, env-gated): the second ally can answer (the
  hopeless-shout chain ally1 → ally2); without it the sense's second
  seat could never field and the launch-with-party secondary would
  measure nothing. ON both legs.
- Shared flags on BOTH legs: PARTYSIZE4=1, VETREENGAGE=1,
  FLEEREPAIR2=1, FIGHTALLY2=1. The ONLY difference between legs is
  SENSEEXPED (unset on ctl, =1 on arm). Same branch code both legs.
- ALLYSLOT3 is NOT on master and is NOT carried: field-4 (the 4th
  member) is not judged here; the trio (fighter + 2) is the sense
  metric and fits the engine's cap of 2. LAUNCHPARTY is NOT carried
  (see scope note above).

## Seed-band freshness (mandatory, local_seed_band_freshness)

**Chosen band: 104758–104765 (8 seeds).** Search scope and result:
- Every dated prereg under `evidence/` (`evidence/*/sim-*-prereg.md`,
  full `104[0-9]{3}` extraction): used seeds nearest the band are
  104750, 104752, 104753, 104757 (sense-guard-diag-a survey/fresh)
  and 104720–104727 (allyslot3 rerun); no 104758–104765 seed appears
  in any prereg.
- Every `evidence/*/sim-*.md`: no 104758–104765 seed appears.
- Filenames under `evidence/`: no file names 104758–104765.
- `git grep` over committed `evidence/`: the literal strings
  104758–104765 occur only as substrings inside old unrelated JSON
  corpora (counts/ids, e.g. `evidence/2026-11-03/...-s96106.json`,
  `evidence/2026-11-10/perseed-roundcap-b/*.jsonl`) — the same
  substring-false-positive class the allyslot3-rerun-b prereg
  records for 10472x. No band naming, no corpus, no reservation.
- Tracker (`convergence-tracker.md`): no 104758–104765 band
  reservation (its 1047xx hits are run-ids/timestamps).
- Reserved bands 104911–104926 and 104941–104956 (carrier arms) are
  untouched and stay fresh.
- **Result: band 104758–104765 is FRESH.**

## Pool expectation (from the DIAG corpora, not a survey)

No survey run (time): the DIAG fresh leg on 104750–104757 (same
substrate minus ALLYSLOT3) measured launches 15, denominator
meetings 18 per 8 seeds. This band should deliver a comparable pool;
the floor below is set well under that measured rate. **Pool floor:
≥6 launches/leg AND ≥4 sense-denominator meetings on the arm leg.**
If the arm leg delivers fewer than 4 denominator meetings, the pilot
is NO-GO, kind METRIC-BROKEN (the band delivered no pool to judge
the sense).

## Primary metric (BINDING, §14)

**Sense rate on the arm leg.** Denominator: wave-4+ meetings on the
arm leg where the fighter has ≥2 same-target expedition companions
alive at the meeting instant (the fighter's live expedition
companions — the party that set out together and is still out).
Numerator: those meetings where the sense returned 2 launch
companions (the fighter's same-target expedition companions, not
bystanders). One meeting = one fighter-day (first sense trace per
fighter per day in a fight context; the instrument records every
call and the analyzer dedupes). **GO bar: arm sense rate ≥ 0.80
AND arm − ctl ≥ 0.30 absolute.** The control leg's sense rate is
measured the same way (the recorder reads the true expedition
companions on both legs, even though the old sense does not use
them); the old master sense is expected low (rerun-b control leg:
0/5) but is measured, not assumed. If the arm rate is ≥ 0.80 but the
gap to control is < 0.30, the verdict is NO-GO (the lever adds
nothing over what earshot already finds).

Why this denominator: companions whose expeditions ended, who died,
or who are on a different expedition are NOT in it — they are not
out with the fighter at the meeting instant, so the sense cannot and
should not return them (the d69/d112/d82 misses are outside it by
construction). The metric judges exactly the lever's claim: when the
party is still out together, the sense sees it.

## Secondary (REPORTED, not binding)

- **Launch-with-party rate:** denominator-eligible meetings where
  the fighter entered the fight with ≥2 allies fielded
  (encounter row allyVids ⊇ 2 launch companions), arm vs ctl.
  No binding threshold: the shout chain, flee logic, and fight
  length all stand between sensing and fielding.
- **Raw sense rate** over ALL wave-4+ meetings (any denominator),
  arm vs ctl, so the exclusion's size is visible.
- **Same-target conflation count:** denominator meetings where the
  sense returned a member of a DIFFERENT same-target party (the one
  known edge of expedition-sourcing: two parties, one target).
  Reported; if it ever exceeds 2 meetings on the arm leg it is a
  finding, not a re-score.
- Per-seed launch / meeting / sense table; wall numbers both legs.

## Cost bars (BINDING guardrails, §14 — a GO with a breached guardrail is NO-GO)

- Starvation: arm total ≤ ctl total + 2 (same bar as partysize4-b /
  allyslot3-rerun-b).
- Median survival: arm ≥ 0.8 × ctl.
- Community loss (village deaths): arm total village deaths ≤ ctl
  total + 16 (2 per seed × 8 seeds).

## Instrument bars (BINDING)

- 0 instrument errors on both legs; 8/8 per-seed files per leg;
  frozen seeds 104758–104765 on both legs; driver determinism
  (pilot seed, 60d, twice) in the proof test.

## Design

- Horizon: 150d, death-aware (never fixed 200d). 150d is the §10
  guide for the wave-4/5 window; the DIAG fresh leg's median
  survival sits at 151d.
- Seeds: 104758, 104759, 104760, 104761, 104762, 104763, 104764,
  104765 (8, pilot gate). Policies: competent verbatim only — the
  pilot's question is a mechanism question (does the sense return
  the party that set out together), not a playstyle question; the
  balanced panel runs the same policy on both legs.
- Legs: ctl = substrate flags, SENSEEXPED unset; arm = substrate
  flags + SENSEEXPED=1. Same branch code both legs.
- Panel: `scripts/balance-panel.js` compare (instrument, not judge)
  via a cloned panel builder (`scripts/build-senseexped-b-panels.js`).
- Proof: `scripts/test-senseexped-b.js` — staged harness probes:
  (a) a geared wave-4 hunting party staged on one shared target
  with the plan party decayed (re-launch overwrite + a companion's
  expedition ended + a death purge, from the d112/d69/d82 cases):
  old code (flag off) fails to return the trio, new code (flag on)
  returns it; (b) flag-off byte-identical old sense (crew/earshot
  order unchanged); (c) same-target guard intact (a companion on a
  different target is not returned); (d) dead / off-expedition
  companions are not returned; (e) driver determinism (pilot seed,
  60d, twice).
- Instrument: `scripts/senseexped-driver-b.js` (clone of
  `scripts/allyslot3-driver-b.js`, recorder unchanged, plus the
  SENSE-TRACE wrap on `Game.villagerFightAllies` — pure reads, the
  original runs exactly once) and `scripts/analyze-senseexped-b.js`
  (fresh small analyzer: sense rate, launch-with-party rate, wall
  census; selftest).
- **Scope boundary (frozen):** the `winPlanFightParty` VETREENGAGE
  co-tasking reads the same decaying `plan0.party` — that is a
  separate follow-up, NOT changed here; the gate already takes the
  sensed allies first, so the fixed sense flows into the gate's
  party without touching the co-tasking. Do not widen the arm to
  the gate.

## Fixture (encounter-gear rule, Steve 2026-11-13)

The staged proof fixtures stage a geared wave-4 hunting party as the
launch leaves them (holder + 2–3 launch companions, armed and
armored, on one shared target) — the average gear/party a player has
when they reach wave-4 content — never a fresh un-geared solo
fighter. The pilot's driver stages the geared fight through the
competent policy.

## Canon

No canon doc covers the launch-party sense: docs/PARTY.md covers
party dynamics (cap, trust, betrayal, travel, combat auto-join) but
not the meeting sense or expedition membership; docs/CANON.md lists
no sense/expedition doc. This is recorded here per the brief rather
than inventing canon. The change follows PARTY.md's combat rule
("Party members auto-join fights even beyond the normal 4-square
radius — They're with you. That's the point.") — the sense now
reads who is actually with you.

## Metric review

- The primary denominator (≥2 same-target expedition companions
  alive at the meeting instant) is the one place this prereg could
  drift: it excludes meetings where the party has already split,
  died, or re-launched apart. That exclusion is pre-registered here,
  before any numbers are seen, with the reason stated (the lever's
  claim is only about parties still out together) — it is not a
  mid-run re-score. The raw sense rate over ALL wave-4+ meetings
  is reported alongside so a later reader can see the exclusion's
  size.
- The GO bar's second clause (arm − ctl ≥ 0.30) is the guard
  against a rich earshot control: if the old sense already finds
  the trio by proximity on this band, the lever adds nothing and
  the verdict is NO-GO even at a high arm rate.
- The same-target conflation edge is pre-registered as a counted
  secondary, not a denominator adjustment: if two parties share
  one target, the sense may return the wrong party's members, and
  that meeting fails the numerator honestly.
- The pool floor (≥6 launches, ≥4 denominator meetings) is set
  from the DIAG fresh leg's measured rate (15 launches, 18
  denominator meetings per 8 seeds) with slack below measured on
  both clauses. If the arm leg still delivers denom < 4, the
  verdict is METRIC-BROKEN and the arm returns to the queue; it is
  not re-scored on a looser denominator.
- No survey was run for this band (time); the floor rests on the
  DIAG fresh leg's adjacent-band measurement instead. That is a
  disclosed weakness of the floor, not of the metric: the floor
  only gates whether the band delivered a pool, and the DIAG leg
  ran the same substrate on the adjacent band.
- No metric was re-scored: this file is frozen before the lever
  legs run and before any judged sim.
