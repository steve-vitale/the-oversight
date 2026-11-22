# Journey endgame r264 — run note (Lane B, leg 4 ENDGAME)

Run: `playtest-loop-2-20261121T2255Z`, Lane B leg 4 endgame, substrate `c55bc8503`.
Prereg: `evidence/2026-11-21/journey-endgame-r264-prereg.md`. Probe:
`scripts/probe-endgame-r264-20261121.js`. Analyzer:
`scripts/analyze-endgame-r264-20261121.js`. Clone:
`scripts/clone-endgame-r264.py`. Pass script:
`scripts/run-endgame-r264-passes.sh`. Proof test:
`scripts/test-endgame-r264-tribute-first.js` (5/5).
Telemetry baseline: `hidden_files/telemetry-baselines/endgame.json` (uw 22 /
won 4 / peakVet 3 per the r263 revert).

## Headline

The tribute experiment is VOID, the charter is unreachable in daily
resolution, and the stall finally has fates in days. The pilot (2 seeds)
never reached a deedGate-ok day, so the tribute-first policy never had
an attempt to act on — the prereg's PILOT FIRST rule stopped the
expansion, and the run did not burn the full panel on a question whose
precondition never occurred. The mechanism itself is proven by test
(5/5): on the r263 converting attempt, tribute-first flips the
delivery to military_tribute. The charter census is the sharpest
result: 131 peak>=3 days across the pilot, ZERO with an active trade
link — the trade-charter capstone is not just never ready at the
moment that matters, no village ever has the link it needs. The stall
unblocked on both pilot seeds (the second living veteran arrived) and
neither converted — unblocking is necessary but not sufficient; both
villages faced only 1 of 2 wave-5 types, so the deed gate stayed shut.

## The pilot (Pass T, TRIBUTE_FIRST=1, seeds 89701–89702)

Flags: FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1
CAPABLE_VETGUARD=1 RELAYGREY=1 CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1
TRIBUTE_FIRST=1. PILOT_EXIT:0, both seeds wrote JSONs + transcripts.

- **89701: sat lesser d90, won, 2 living veterans, rd5 ready d83.**
  Deed gate never ok (w5=1, needs 2). 0 capstone attempts. Bought the
  bundle early d34 (spent 8071). Tribute-ready on 9 peak>=3 days —
  but the delivery block requires deedGate ok, so no attempt ever
  fired. Charter-ready 0/57 peak>=3 days; active trade links 0/57.
- **89702: sat NONE d90 — walked defiant/light, won.** The village
  refused the table and won by walking away ("Humanity walks —
  poorer, whole, free"). Deed gate never ok (w5=1, stage short). 0
  capstone attempts. Bought d18. Tribute-ready on 3 peak>=3 days.
  Charter-ready 0/74; active trade links 0/74.
- **RNG drift (method note):** on r263 Pass C, 89702 sat FULL d90
  (deedGate ok d87, w5=2). On this substrate it faced 1 wave-5 type
  and walked defiant. The only live substrate deltas are dialogue
  (namebeast, settled re-ask, quote-kind, deflect, witness-line,
  owed-walk) — dialogue code consumes RNG, so the same seed now
  rolls a different world. **Same-seed panels are only comparable on
  an identical substrate; even dialogue-only deltas re-roll the
  world.** The r263 comparison in this note is descriptive, not
  paired.

## Q2 TRIBUTE-FIRST — VOID (policy never engaged)

Analyzer: `GO TRIBUTE-FIRST: VOID: no military_tribute delivery fired
— policy did not engage; experiment unanswered, not failed`. The
precondition (a deedGate-ok day) never occurred on either pilot seed.
Per the frozen PILOT FIRST rule, the T5 expansion did NOT run.
Mechanism proof (test-endgame-r264-tribute-first.js, 5/5, on the REAL
r263 C 89702 attempt record): tribute-first selects military_tribute
when ready+payable; flag off keeps the embassy first; ready-but-
unpayable tribute (scholar+1, payable 1/2) does NOT jump the queue
(it would refuse 'veterans-short' daily and block the embassy
forever); tribute-not-ready leaves the order alone; tribute-alone-
ready is selected either way. The policy is correct; the wild
experiment awaits a band where the gate opens. The r263 mining stands:
tribute was ready+payable on 4/4 attempt days and lost only on order.

## Q3 CHARTER CENSUS — never available, in daily resolution

Analyzer: `GO CHARTER-CENSUS: 131 peak>=3 days, charter ready 0,
blockers {"no-sealed-charter":131}; days with an active trade link 0,
with an active CHARTERED link 0, hierarchy-null 0 — charter never
available on this panel`. This strengthens r263 (0/4 attempt days)
to 0/131 peak>=3 days with ZERO active trade links anywhere. The
blocker is not "the link exists but isn't chartered" — the link
itself never exists. The trade-charter capstone is unreachable in
practice on this panel. Filed as a DESIGN OBSERVATION, not a defect:
the charter's preconditions (a chartered trade link) are a design
question for Steve, not a bug visible from the sim. No game change
made here.

## Q1 STALL FATES — first run, in days

Analyzer: `GO STALL-FATES: 2/2 seeds stalled, 70.3 stall-days total,
fates {"UNBLOCK":2}; UNBLOCK->full 0/2 (r263: 4/6) — 89701:33.0d
UNBLOCK d83 dgOk=never sat=lesser | 89702:37.3d UNBLOCK d88 dgOk=never
sat=none`. Both stalls unblocked (rd5ready flipped true — the second
living wave-4 veteran arrived, as the r263 mining predicted), but
neither converted: both villages faced only 1 of 2 wave-5 types, so
the deed gate never opened. **Unblocking the stall is necessary but
not sufficient — the gate also needs w5>=2 distinct types faced.**
Against the r263 corpus (mined, 522.7 stall-days / 18 seeds):
UNBLOCK 6 (4/6 converted), REGRESSION 4 (rd4ready flips false —
gated standing crashes 199 -> 100), PERSIST 8. The pilot adds 2
UNBLOCKs with 0 conversions, both blocked on w5-facing, not on the
stall. The r247 metric now has its first run, in days (samples /
~3.0 per day — the units correction from the prereg: r263's "161
days at 199" is 161 samples = 53.7 days).

## Q4 M25d — no new data

No bought seed scattered on this run (both pilot seeds won). The
r263 reading (1/13, at the bar) stands; the next run with bought
seeds decides whether 1/13 was the edge or the middle.

## Q5 DIALOGUE HOLDS — people check (read in full)

Transcripts read in full: 89701 (69 SAY lines), 89702 (92 SAY lines).
Defect greps across both: "dodged the the" 0, "The The" 0,
"three times now" 0, "Names, named." 0, never-again deflect lines 0.
The one "that one" hit is Vasyl's lesson line ("Oh — THAT one. Here,
look." / "Hold on — I already showed you this one. White Oak Acorns.
You remember.") — a teaching moment, not a settled-favor re-ask.
No resume-quote mismatches served; no namebeast topic served
(vacuous on this 2-seed panel — the r152 evidence stands from the
landing run). The r262/r152 fixes hold on this panel.

- **The defiant walk (89702):** "Walk away." / "Humanity walks —
  poorer, whole, free. The cameras follow for years: the long shot
  of small figures leaving the light, carrying their food and their
  dead and their songs." A refusal that reads as an earned ending,
  not a bookkeeping accident. The village won by refusing.
- **The audit (89701):** "only 1 of 2 different wave-5 monsters
  faced; no capstone deed delivered (military tribute, trade
  charter, or feast embassy)" — the shortfall named exactly, in the
  village's own numbers.
- **War-path namespace (carried):** "Big Loud" names TWO different
  kills (day 84 yours, day 82 Nino's) on 89701 — the r263 Loud-Eyes
  observation in miniature. The war path is faithful to the dump;
  the dump's own names are the thin part. Design observation, not a
  defect.
- **Keepsake refrain:** "The feast was the weapon" appears 2× on
  89701 and 3× on 89702, each with a different rotated tail — the
  phrase repeats by design (test-main67 A-1b requires it per item);
  the full sentences vary. Not a defect; the r263 flat spot stands
  as designed.

## Analyzer verdicts (pilot, 2 seeds)

40 GO, 3 NO-GO. Analyzer exit 1. Log:
`evidence/2026-11-21/journey-endgame-r264-analyzer-t.log`.

- **M1-guard NO-GO:** threshold is >=3 seeds reaching the window;
  a 2-seed pilot cannot meet it (2/2 announced). Structural pilot
  artifact, not a game finding.
- **M6-guard-named-deferred NO-GO:** 0/0 — no deferred sit on the
  pilot, so the metric is unmeasurable here. Structural pilot
  artifact (r263 passed it because D 89703 deferred 18 days).
- **M23-capstone NO-GO (VACUOUS note):** no pass-B seed reached
  deedGateReady().ok — the same fact as TRIBUTE-FIRST VOID, scored
  NO-GO by the pre-existing M23. The capstone leg never engaged.
- All other verdicts GO, including M20-standing-trace (both seeds
  mech199=true), M25c-buyout-early (2 eligible early-days, 0 skipped,
  3 attempts, 2 bought), STALL-FATES, TRIBUTE-FIRST (VOID note),
  CHARTER-CENSUS.

## Village assessment (plain words)

Two villages, both alive at day 90, both won — one by sitting lesser
at the table, one by walking away from it. The people fought
together, learned each other's tricks, and buried their dead with
feasts; the table read their ledger back to them honestly, naming
exactly what was missing (one more wave-5 monster, one capstone).
But the road to the full seat narrowed to a single missing thing on
both seeds: a second wave-5 monster faced. Both villages had the
veterans, the standing, the bundle — and neither could find the
second late monster. The tribute sat ready and payable on 12 days
across the two villages and was never offered the choice, because
the gate never opened. And the trade charter — the third door — does
not exist in these villages' world at all: no trade link was ever
active on any of the 131 days that mattered.

## Reachable / fun / winnable

- **Reachable: YES (unchanged).** Both villages reached the table
  (announced d90, sat d90). The table is not a rumor.
- **Fun: YES, with the carried caveats.** The defiant walk is a real
  ending with real words; the audit names the shortfall honestly;
  the war path and the keepsakes read as a world with people in it.
  The keepsake refrain and the narrow war-path namespace remain the
  two flat notes, both by design.
- **Winnable: NOT DECIDED on this leg.** The pilot never opened the
  deed gate, so no full seat was in play. The r263 verdict (YES —
  4 full seats) stands unchallenged; this run adds no new full-seat
  evidence either way. The tribute road is still untested in the
  wild; the charter road is unreachable in practice.

## F-item

None. No new finding is filed from r264: the VOID is an experiment
that never engaged (not a defect), the charter is a design
observation (Steve-call), and the stall-fate split is a first
measurement, not a failure. The war-path namespace and keepsake
refrain stay carried observations.

## Metric review (§14)

- **M20 samples-vs-days — CORRECTED.** The analyzer's daysAt199
  counts trace samples (~3.0/day). r263's "161 days at 199" (D 89703)
  is 161 samples = 53.7 days. This run reports days (samples /
  samples-per-day, computed per seed). The M20 verdict itself is
  unchanged (it counts samples); the run NOTE must divide. Future
  runs: report days, keep the sample count alongside.
- **peakVet baseline (3):** unchanged — no roll (telemetry quiet;
  pilot peakLivingVeterans 2/2, within tolerance).
- **FIGHTALLY2:** stays OFF. Ninth sighting not taken — this run
  does not touch it; the turn-on decision is still owed.
- **M25d:** no new data (0 bought-seed losses on 2 bought seeds).
  Bar stays <=1; r263's 1/13 at the limit still awaits the next
  bought band.
- **NOTICK/CARRY:** 0 deferrals, 0 trioCarry — sixth straight zero.
  The instrument keeps measuring nothing; the deferral it was built
  to catch has never fired on six endgame panels. Carried.
- **M1/M6 on pilots:** both thresholds are absolute (>=3 seeds,
  >=1 deferred sit) and cannot pass on a 2-seed pilot. Future pilot
  runs should read them as structural, not as failures — or the
  analyzer should scale them per r124's PILOT-scaled precedent
  (M1 already carries that comment; the threshold was never scaled).
- **M23 vs TRIBUTE-FIRST:** the same fact (no deedGate-ok day)
  scores NO-GO under M23 and VOID under TRIBUTE-FIRST. The VOID
  reading is the honest one for a pilot; M23's NO-GO is the
  pre-existing rule for a full pass. No revision proposed — the run
  note adjudicates, the analyzer stands.

## Telemetry

`telemetry-check.js` on Pass T (2 files, 3 metrics
veterans.unlockedWave/won/peakLivingVeterans): **quiet**. Baseline
NOT rolled.

## Gate

Two full gates were run by the adoption (the timed-out run's gate log
was a 294-byte partial, killed ~230/344):

**Gate 1** — `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-r264-gate` in the worktree, rebased
onto `70d9dda36`: **339 passed, 5 failed in 818s — 0 attributable.**
The 5 are exactly the standing families, identical to r152/r153:
measurement-proof staleness pair (2), phone-frame stale receipt (1),
120s deed-attainment timeouts (2).

**Gate 2 (final, on the merge tip)** — the ship loop then landed its
batch-ship version bump (`caaf6742c`), so the branch was rebased onto
it (`73c42ca0e`) and the gate re-run serialized:
`node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-r264-gate2`: **336 passed, 8 failed
in 1261s — 0 attributable.** The 8:
  1. `test-measurement-proof-update.js` — "Proof source inputs are not
     current". Staleness pair, standing since r151.
  2. `test-measurement-workflow.js` — retained neutrality proof covers
     the current inputs. Staleness pair, standing since r151.
  3. `test-phone-frame-proof.js` — stale receipt / retained browser
     inputs do not match current source. Standing phone-frame family.
  4. `test-one-person-army-deed-attainment.js` — TIMEOUT after 120s.
     Standing 120s-timeout family.
  5. `test-living-garden-deed-attainment.js` — TIMEOUT after 120s.
     Standing 120s-timeout family.
  6. `test-measurement-cache-flags.js` — "both actual CLI
     configurations complete valid neutral panels". Standing
     measurement-cache-flags family; **passes solo 4/4**.
  7. `test-occupation-panels.js` — TIMEOUT after 120s under load
     (same flake r153 saw once); **passes solo 25/25**.
  8. `test-capable-bot-20261014.js` — TIMEOUT after 120s under load,
     sub-assertions all ok; **passes solo 42/42**.
- The 3 extras (6–8) were each re-run solo on the merge tip and pass
  clean — load flakes under the concurrent ship-loop + adoption-merge
  contention during gate 2, not regressions. This run touches no src/,
  data, or index.html — only evidence + scripts (probe, analyzer,
  clone, pass script, proof test) — so none of the 8 can be caused by
  this run's changes. Proof test
  `test-endgame-r264-tribute-first.js` re-run 5/5 PASS on the merge
  tip. Log: `evidence/2026-11-21/journey-endgame-r264-gate.log`.
