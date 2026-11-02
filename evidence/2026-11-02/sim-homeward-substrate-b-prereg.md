# sim-homeward-substrate-b — PREREG (committed BEFORE any validation or screening sim)

Run: oversight-flesh-out-loop-b, arm sim-homeward-substrate-b
(coordinator brief 2026-11-02, run fleshout-loop-b-20261102T1345Z).
Worktree sim-homeward-substrate-b, branch sim-homeward-substrate-b.
This worker does NOT push, bump, verify live, merge, or rebase; the
coordinator lands the branch. Status to coordinator: committed on
branch, pending coordinator merge.

## Predecessors (read, never re-litigated, never checked out)

- evidence/2026-11-02/sim-homewardstep-rpt-b.md (Loop B 1030Z):
  PILOT GO for the FULL guard on qualifying band 62801-62808 — BUT
  homeward vetoes were 0 on the judged band: all prevention came
  via inherited OUTWARD vetoes.
- evidence/2026-11-02/sim-homext-abl-b.md (Loop B 1135Z): ablation
  on that band, outward-only vs full, trajectories identical,
  extension-only preventions 0 — NO-GO for the extension ON THAT
  BAND.
- evidence/2026-11-02/sim-homeveto-band-b.md (Loop B 1233Z):
  DIAG-NO-BAND — 0/8 fresh bands qualify, 0 armed homeward vetoes
  in 64 seeds, 0/80 armed seeds counting the predecessors. Its
  metric review leaves ONE open instrument question, which is
  this run's question: on seed 61807 the SHADOW guard's
  E-evaluation allegedly FAILS on day-4 approach hops where the
  ARMED guard PASSES with identical history, while on 64601
  shadow and armed agree — so shadow-log screening for
  approach-clean trips must be validated BEFORE it is used to
  screen.
- evidence/2026-11-02/sim-food-round-1233.md (coordinator round,
  homeveto section): restates the instrument question above;
  the 61807 diagnostic's printed "VERDICT: GO" is NOT a verdict
  and is not re-judged here.

## Canon note

docs/CANON.md read first; docs/MAP.md states the way home as
travel through the same travelTo pipeline (home board, beyond
tiles, one continuous map). No canon doc covers the pocket
guard itself: it is a policy-side sim instrument (a competent
variant), not a game system, so there is no canon to invent
from — the guard's E(D) model is inherited verbatim from the
predecessors, and this run changes nothing in any policy
file. Policy/instrument only: scripts/policies/* (unchanged,
reused) plus driver/analyzer/test/evidence. ZERO src/js
changes, unless a proof failure proves a minimal fix (then
the fix ships with its own proof test and is flagged).

## Question (DIAGNOSTIC ONLY — never a GO/NO-GO for the extension)

Is shadow-log E a valid screen for approach-clean trips? That
is: when the shadow (baseline) leg logs an approach hop as
E-passing, does the armed (full-guard) leg evaluate that same
hop, in the same history, as E-passing too — and when it
logs an approach hop as E-failing, does the armed leg agree?
If yes, shadow logs may be used to screen fresh bands for
trips whose approach survives the outward guard while the
homeward step into no-escape ground is actually attempted
under guard. If no, shadow screening is invalid and the
next run needs a different instrument.

## Validation FIRST (before any band screening)

Fresh runs, reused driver unchanged, same substrate as
screening (below): seed 61807 and seed 64601, two legs each
— baseline 'competent' under the SHADOW guard and armed
'competent-homewardstep-b' (full guard). These seeds are
pre-used diagnostics, used ONLY for validation: they are
never screened, never judged, never candidates.

MATCHED PREFIX (decided now, before seeing fresh results):
for each seed, take the entry day — 61807 day 4, 64601 day
17 (the predecessors' entry days; if a fresh shadow leg's
entry day differs, use the fresh leg's own entry day, defined
as the first day whose shadow hop log contains a homeward
hop with simOk=false landing on that day's end position with
a failing dayEndReturnSim, and disclose the change). The
matched prefix is the contiguous hop sequence in the shadow
day log from the day's haven departure through, inclusive:
- 61807: the homeward entry hop (2,0)->(3,0);
- 64601: the first armed-vetoed hop (1,4)->(1,2).
Compare, hop by hop in order, same from->to: shadow simOk
vs armed simOk for the identical hop occurrence (first
occurrence of that hop on that day in each leg). Also report
as secondary data the all-occurrence agreement on the entry
day (every hop occurrence, occurrence-matched), and whether
the fresh day logs reproduce the stored predecessor day logs
hop-for-hop (determinism check, reported not barred).

VALIDATED BAR (decided now, before seeing fresh results):
shadow E is VALIDATED iff matched-prefix agreement is 100%
on BOTH seeds — every matched hop has identical simOk under
shadow and armed — AND no armed veto occurs before the
matched-prefix end other than the terminating hop itself.
Any matched-hop disagreement FAILS the bar UNLESS a
mechanistic explanation is demonstrated (not merely
asserted): re-evaluation of E at the matched state must
reproduce BOTH outcomes from one identified differing input
— named field among: tile revealed set, tile stock value,
travelBlockage result, shared roadwork-credit pool state, or
hop-log occurrence identity (a later re-evaluation of the
same from->to at a different time of day with changed
state). A demonstrated mechanism re-qualifies validation
only for the corrected matching rule it implies (e.g. first
occurrence only), stated explicitly in the evidence file.
An unexplained disagreement, or matched-prefix agreement
below 100% on either seed, means DIAG-SHADOW-INVALID:
screening STOPS, no band is screened on shadow logs, the
mechanism (as far as the data shows) and the instrument fix
the NEXT run needs are reported, and the 61807 diagnostic
itself is NOT re-judged as evidence for the extension.

NOTE (prior-evidence check, not a validation result): the
stored predecessor files already show agreement on the
matched days — the 61807 diag baseline day-4 log has the
walk-out hops (4,4)->(2,4), (2,4)->(1,4), (1,4)->(1,2),
(1,2)->(1,1), (1,1)->(2,0) all simOk=true, matching the
full leg, and the 64601 screen-7 baseline day-17 log has
(1,4)->(1,2) simOk=false, matching the armed veto. The
fresh validation runs below decide whether that agreement
reproduces; the predecessor's contrary prose claim is
treated as an unreproduced claim, not as data.

## APPROACH-CLEAN definition (decided now, before any screening)

A trip on seed S qualifies as an APPROACH-CLEAN CANDIDATE
iff ALL of the following hold, verified from the two
screening legs' driver files (shadow baseline + armed full,
same seed, same day D):

1. SHADOW TRIP: shadow day-D hop log contains a contiguous
   walk-out sequence W starting at the haven tile and ending
   at origin O, followed by a homeward hop H: O->T with
   homeward=true, simOk=false, landing on T = shadow day-D
   end position, with shadow dayEndReturnSim for day D
   failing (ok=false). H is the FIRST such homeward hop on
   that seed/day.
2. SHADOW APPROACH PASSES: every hop in W has simOk=true
   in the shadow log (first occurrence of W on day D).
3. ARMED APPROACH PASSES: armed day-D hop log contains the
   identical sequence W (same from->to in order, first
   occurrence) with every hop simOk=true and vetoed=false.
4. ARMED HOMEWARD ATTEMPT FAILS E: armed day-D hop log
   contains a homeward hop H': O->T with homeward=true and
   simOk=false — i.e. the homeward step into no-escape
   ground is actually attempted under the armed policy and
   E-fails there (hence vetoed=true under the full guard).
5. ARMED VETO ATTRIBUTION: armed day-D homewardVetoes >= 1
   with a vetoed hop-log entry for H' on day D.

Proving driver fields, exactly: day.hops[].from/to,
day.hops[].simOk, day.hops[].vetoed, day.hops[].homeward,
day.dayEndReturnSim.ok, day.end.pos, day.homewardVetoes.
No episode logic, no day-end-sim-only inference: a trip
whose approach hops are never logged under the armed leg
(e.g. the armed scholar never walks that route) is NOT a
candidate, and a trip whose armed homeward hop passes E is
NOT a candidate (its homeward step is not a no-escape step).

CANDIDATE RECORD (per trip): seed, day D, W sequence with
per-hop (shadow simOk, armed simOk, armed vetoed), H/H'
from->to and T, armed homeward veto count on the seed and
on day D, shadow day-D end kcal/hydration. A candidate is a
trip a FUTURE judged pilot could run outward-only vs full
on — it is NOT itself judged evidence for the extension.

BAND QUALIFIER: a band QUALIFIES iff it contains >= 1
approach-clean candidate trip. Screening stops at the first
qualifying band; bands after it are never run.

## Screening (only if validation passes)

Bands, in order, first qualifier stops the search (max 8
bands, 8 seeds each, seeds = start..start+7):

1. 67001-67008
2. 67101-67108
3. 67201-67208
4. 68001-68008
5. 68201-68208
6. 68701-68708
7. 69101-69108
8. 69201-69208

BANNED (never screened, never judged): 62801-62808,
62001-62016, 61901-61916, 62301, 62401, 62501, 62601, 62701
(as band starts), 64001-64708, and any other previously
used band. Verification performed before this prereg was
written: zero mentions of any chosen band start, and zero
mentions of any individual seed in any chosen band, in any
*.md under evidence/ (all dates) and in
evidence/2026-11-02/*.md specifically; the 65001-65701
range was REJECTED because 65001/65101/65201-family seeds
were used by October arms (sim-w4finish, sim-w5legs,
sim-presencetend, sim-tendhalf, sim-winsupport-decomp),
even though evidence/2026-11-02/ alone is clean for them.
The chosen 67001+ / 68001+ / 68701+ / 69101+ / 69201+
starts sit clear of every previously used band start found
by that grep (67301, 67401-67701, 68101, 68301-68601,
68801-69001 families all carry prior mentions and were
avoided).

Per band, BOTH legs fresh with scripts/homext-abl-b-driver.js
(unchanged): baseline 'competent' under the SHADOW guard
and armed 'competent-homewardstep-b' (full guard).
Screening is judged by the new analyzer
scripts/analyze-homeward-substrate-b.js (screen mode),
which applies the APPROACH-CLEAN definition above to the
two driver files and prints every candidate trip plus a
band verdict. EVERY band screened is disclosed in the
evidence file with its candidate trips (or none), whether
it qualifies or not. Screening files are screening
evidence only, NEVER judged legs: if a band qualifies, a
FUTURE run re-runs legs fresh on its seeds for any pilot.

Substrate, identical to the predecessors: competent, 30d,
DEPOSITGATE=0, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, and the packcomp *=1 flags must NOT be 1
(driver-enforced, FATAL otherwise). Death-aware horizon:
30 loop-days max; dead villages stop simulating; no
fixed-200d horizon. Horizon reason: pockets are an early
far-travel phenomenon (observed days 4-29 in predecessor
evidence); a 30d window contains them while a longer window
adds pre-seat noise, and the 30d pre-seat profile
(national / table / wins 0) is expected, not a regression.

## Outcome vocabulary (this run's ONLY verdicts)

- DIAG-VALIDATED + candidate list: validation passed AND
  >= 1 band qualified within budget; the evidence file
  carries the candidate list for a future judged pilot.
- DIAG-NO-CANDIDATE: validation passed AND the 8-band
  budget was spent with zero approach-clean candidate
  trips. No GO/NO-GO for the extension is claimed.
- DIAG-SHADOW-INVALID: validation failed (see bar above).
  No band screening on shadow logs, no candidate list, no
  GO/NO-GO for the extension.

## Balanced panel (§15)

Run scripts/balance-panel.js as CONTEXT only if it applies
to the corpora (single combined campaign, policies
competent + competent-homewardstep-b, screened seeds/days,
as the predecessors did). If it refuses the recorder corpus
(the known refusal class from prior rounds), record the
refusal as-is, do not fabricate a compare, do not roll any
baseline. No panel verdict is claimed in any case: the
panel is the instrument, this prereg's bar is the judge.

## Sense-testing law

Read the sayLines transcripts for veto lines on armed legs
and for the candidate trips' villages' own words; judge
meaning and coherence, never just counts. The evidence
file carries a village assessment in plain words for the
candidate trips (what the village looked like, who thrived
and who died and why), plus wall numbers for any screened
band (national / table / wins, wave 4-5 unlocks, median
survival) with the 30d pre-seat profile stated as expected,
not a regression, and a "metric review" section.

## Census (proof, not judged evidence)

BEFORE validation results are judged, the proof test
scripts/test-homeward-substrate-b.js must show: (a) the
validator counts matched-prefix agreement exactly on
synthetic driver-shaped records (agreeing prefix, one
disagreeing hop, 64601-shape prefix ending in a vetoed
hop); (b) the screener applies the APPROACH-CLEAN
definition exactly (qualifying trip, armed-approach-missing
trip rejected, armed-homeward-passing trip rejected,
shadow-approach-failing trip rejected); (c) every screening
band start in this prereg is outside the banned set above
and does not overlap any banned band; (d) the reused
driver/analyzer/policy files are unmodified in this
worktree. The predecessor proof tests
scripts/test-homext-abl-b.js (21/21) and
scripts/test-homeveto-screen-b.js are re-run post-commit as
regression checks, not re-authored. Any proof failure is a
proof failure: fix the instrument, do not judge legs
against a failing one.

## Deliverable

Evidence file evidence/2026-11-02/sim-homeward-substrate-b.md
(prereg header, validation numbers with per-hop agreement
tables for 61807 and 64601, screening ledger for every band
run, candidate list or NO-CANDIDATE / SHADOW-INVALID
verdict, village assessment in plain words, wall numbers,
metric review section), plus the analyzer + proof test
files, all committed on branch sim-homeward-substrate-b.
Report to coordinator: DIAG verdict with validation
numbers, screen ledger summary, commit hashes, proof-test
results, and findings outside this arm as backlog notes
only (not chased mid-run).

## Explicitly excluded

No reuse of any banned band; no screening past the 8-band
budget; no re-judging the 61807 diagnostic as evidence for
the extension; no GO/NO-GO for the extension in any case;
no pairing with any other arm's re-confirm; no src/js
changes except a proof-proven minimal fix if a proof
failure forces one; no other worktree touched; no push,
bump, live verification, merge, or rebase.
