# sim-scale-onramp-round-0820 — Loop A coordinator evidence, run fleshout-20261104T0820Z

Axis: scale-onramp / winnability chain (converging, NOT converged).
Base at run start: master 6f8ff7810 (Loop B 0730Z winnability round).
Stale-lock recovery at start: lock fleshout-20261104T0545Z (created
05:43Z) had no registry tree and no heartbeat for its run_id and was
>90 min old at run start — deleted per the guard, noted here, and
replaced by this run's lock + claim
(hidden_files/lever-claims/fleshout-20261104T0820Z.json).
Pre-flight: main tree clean, disk 30%. No live sibling claim at start.
All three arms merged locally, pending ship. No push, no bump, no live
verification (ship loop owns deploys).

## Arm 1 — sim-askplus-a: competent-plus-ask — NO-GO, KILLED per prereg

Tracker next blank #1 from Loop B 0730Z (diplo pilot: competent never
proposes, diplomacy structurally zero). Policy-side only, zero src/js.
Prereg aff1a2202 (rebased a1d8d5453) before any judged sim; instruments
adca13f1f (rebased c5b07aa62), proof 41/41; pilot fc7f82c2e (rebased
e6a692d17); kill 2b07c31e8 (rebased 9e555c62e): policy + proof deleted,
evidence + 16 per-seed JSONs + panel files kept, policy recoverable
verbatim from the instruments commit.
Pilot: fresh seeds 99501–99508, 140d death-aware, competent verbatim vs
competent-plus-ask, 0 instrument errors, balanced panel §15 attached
(evidence/2026-11-04/askplus-panel.md: review_required on survival
secondaries only; national 0→0, wins 0→0 — instrument, not judge).
Baseline: proposals 0/8, links 0/8, diplomacy 0/8, wave-4 unlock 8/8,
wave-5 0/8, survived 2/8, median 114.5d.
Armed: proposals 8/8 (bar ≥6 ✓), links 8/8 seeds (bar ≥3 ✓),
end-diplomacy >0 only 2/8 (bar ≥3 ✗) — NO-GO, no confirm run.
Diplomacy flows (102 on 5/8) but does not hold: died-before-seasoning
(99502/99505/99508), one link's trust crossing 40 down zeroes all
diplomacy in a day (99501 d110: 102→0, never recovers), boundary
flicker (99504: 7 toggles). 23/23 proposals end in links, 0 declines —
the judge is not the constraint. Paired survival leans against asking
(median 114.5d → 84.5d, mechanism unproven — tribute/tend food cost is
the hypothesis, not a claim). Band's only wave-5 unlock is armed 99504.
Verdict in plain words: asking works; holding fails. The next arm is
HOLDING, not asking. (Sibling Loop B 0830Z has since published the
recovery list — tend-through vs zombie-clearing separately, a
belongseek panel tending subordinate links, a LEAGUE peer-link corpus,
a SAY_RE instrument fix, and the flipped-LEAD policy question — this
run does not duplicate that list; it adds the items below.)

## Arm 2 — sim-fleerepair-confirm-a: fleerepair confirm — GO (confirm)

Owed confirm of the 0415Z pilot (escapes 2, median strikes 4 vs 2,
cost clean). Prereg 55dc33450 [needs-eyes] before any judged sim;
driver/summarizer scale extension 8ec0294fe (instrument-only, fixes
pilot caveat (a): scale fields now honestly measured, nothing
hard-coded); evidence + 24-file corpus 8c28625a0 [needs-eyes].
Confirm: 12 fresh seeds 99601–99612, 140d death-aware, competent
verbatim vs armed competent-fleerepair-a.js (3 gates, nothing else),
single anchor, 0 instrument errors, 0 scale-read errors.
Bars, all pass: escapes 2 ≥ 2, both transcript-corroborated (99601
d99, 99606 d89, both round-1, "BARRIER CROSSED … You escape" lines
plus a Counter learned); median strikes/fight 3 ≥ 2 (lost fights
also 3 vs 2; damage fraction lost 0.165 vs 0.042); cost bar clean
(starvation 4 ≤ 8, player-flagged 2 ≤ 4, median survival 96d ≥
63.6 and ≥ baseline−10d = 69.5). Flee-attempt turns 42 → 0, barrier
pushes 0 → 12, exposures 53 vs 55, flee-triggered fights 26 vs 0.
Proof scripts/test-fleerepair-20261104.js ALL PASS, re-run on merged
master after the merge.
Wall (honestly measured, 12/12 both legs): wins 0/0, national 0/0,
table sat 0/0, table invited 0/0, wave-4 faced 84 vs 82, wave-4 kills
6 vs 9, wave-5 UNLOCKED 2 armed legs (99608, 99609) but 0 wave-5 kills
and no wave-5 spawn evidenced — the summarizer's "wave5faced" label
counts unlocks, not facings, and must never be cited as a facing.
Rank stayed 'village' on all 24 legs despite standing to 375 —
standing is not the binding scale constraint on these seeds.
What GO means here: the gated policy (already on master behind flags,
defaults untouched — this arm landed instruments + evidence, no new
lever and no default flip) is confirmed on a fresh 12-seed band.

### Coordinator ruling — sense veto question (arm 2)

The worker flagged an ambiguity and did NOT kill on it. RULING: GO
stands. The prereg veto reads: "A repaired flee that reads as a
silent no-op loop is a sense NO-GO." The 5 loop fights (99601
exp#4/#5/#6, 99604 exp#10, 99606 exp#10; 34 turns, 0 strikes, 5/55
armed exposures) are NOT repaired-flee turns: the flee branch
resolves at 3 stuck turns and marks the fight unfleeable, and the
turns that follow are the fallthrough APPROACH path re-issuing the
same failed step on the same blocked geometry ("No path there" every
turn, death without a blow). The repaired flee itself reads human
(both escapes, plus fallthrough strikes elsewhere). The approach loop
is pre-existing in baseline (baseline move-only zero-tile deaths
exist too), so killing the flee repair would remove a confirmed
escape benefit while leaving the loop intact — that would violate
kill discipline (a kill requires establishing the lever itself is
wrong). BUT the pilot's "loop gone from W4 exposures" claim does NOT
survive in full and is corrected here: flee-attempt turns are gone,
blocked-step deaths are not. Next arm, precisely: blocked-step
treatment for the approach path (count failed approach steps; on
repeated failure do something else — strike if possible, ability, or
hold), the same pattern the flee branch just got. Appended to
sim-findings.md.

## Arm 3 — sim-holdbeat-a: veteran-timing diag — DIAG-GO

Zero src/js. Prereg 561dd6e5e before any judged sim; instruments
fdb151855, proof scripts/test-holdbeat-20261104.js 6/6 before the
pilot and re-run green after the judged legs; evidence b5872c25e.
Balanced panel INAPPLICABLE (pure diagnostic, stated in prereg).
Q1 (99110 overlap window): at this anchor the overlap is exactly 1
day (d108; the d109 day is gone because nadia dies d109 — old corpus
NOT pooled). That day: 2 living veterans, readiness-5 NOT ready
(short: armor only), capped standing 195 (5 short of 200), gate
evaluated naturally 51 times and correctly held. The door was not open
on any standing-sufficient day because the window contained no
standing-sufficient day — the "near-miss" dissolves. Fresh band
99701–99708: 0 overlap windows; closest approach 99705 holds 1 living
veteran for weeks while capped climbs 210→375, held on veterans
alone; a second wave-4 kill by the same killer adds nothing (the
count is DISTINCT killers). Pooled wall (10 legs): wins 0, national
0, table 0, wave-5 unlocks/releases 0, median survival 100.5d,
0 instrument errors, 0 gate/recount mismatches.
Q2 (hold-beat timing): read-order artifact, PROVEN, not a count gap.
99101 d134 reproduced exactly: kill seq 6142 → gate-call 6143 → hold
beat seq 6144 ("0 of 2 veterans") → gate exit 6145 → kill credit seq
6156. checkWaveUnlockBeat() runs before the waveKillLog.push the
veteran count reads. End-of-day d134 reads 1 veteran, capped 210,
short veterans only. Named fix, NOT landed (DIAG ONLY): append the
log entry before the unlock check in recordWaveKill. A lever arm must
implement + measure it.
Sense: veteran-kill narration does not distinguish fresh kills from
mop-ups (99110 d108 celebrates a 450/900-HP entry kill identically;
fresh band adds a 1/1300-HP finish) and the "1 of 2" beat never spells
out DISTINCT killers. Appended to sim-findings.md.

## Wall numbers (this run, per arm — anchors differ, never pooled)

- askplus (8+8, 140d): wins 0, national 0, table 0; wave-5 unlock 0
  baseline / 1 armed (99504); median survival 114.5d → 84.5d.
- fleerepair confirm (12+12, 140d): wins 0, national 0, table 0;
  wave-5 unlocked 0 baseline / 2 armed, wave-5 kills 0; median
  survival 79.5d → 96d; median standing final 135 → 175.
- holdbeat (10 legs): wins 0, national 0, table 0, wave-5 0;
  median survival 100.5d.
In plain words: villages still win nothing at the top. Asking for
alliances now works and fleeing a lost fight now works, but
alliances do not stay held and veterans still do not overlap — and
the two-veteran door, when it was actually looked at, was correctly
shut. The full seat stays unwon and a wave-5 kill stays at zero.

## Metric review

- askplus: bar judged strictly (end-diplomacy leg failed 2/8 vs ≥3);
  no re-scoring. Panel attached; review_required on survival
  secondaries only.
- fleerepair confirm: balanced-panel compare NOT run, for the
  prereg-stated reason (balance-panel.js takes no two-corpus input;
  registering the COMPETENT_*-gated variant would contaminate the
  baseline child, which loads the whole registry per process).
  Comparison rests on the pre-registered per-seed table + analyzer
  aggregates, never a fabricated panel. A contamination-free
  registry route is a tooling blank for a future arm (appended).
- holdbeat: panel inapplicable (diag); stated, not omitted.
- Telemetry deviation check: REFUSED by the tool itself (all 24
  fleerepair-confirm rows carry top-level anchorCommit — recorder
  rows, not runs; same field-shape artifact as Loop B 0730Z/0830Z).
  Baseline NOT rolled, no LOUD lines, no investigation item.

## Findings appended to sim-findings.md (8)

Askplus holding NO-GO; pantry-gated courtship (12k proposal / 20k
tend / 4k-per-week tribute); SAY_RE missing link lines (linked to
sibling 0830Z instrument item, not duplicated); approach-path
blocked-step loop; wave5faced label counts unlocks; hold-beat
read-order fix named; veteran-kill mop-up narration; balance-panel
registry route. All in the file's format with run/evidence cites.

## Infrastructure

- Sibling landings moved master three times during this run
  (playtest r85/r124, Loop B leadbelong-b, Loop B 0830Z polityfrag +
  journey r93): each worker branch rebased clean (no file overlap)
  before its ff-only merge; proofs re-run where they survived the
  kill (fleerepair proof green on merged master; askplus proof file
  was deleted by its kill commit, 41/41 stands in evidence;
  holdbeat proof 6/6 pre-pilot and post-legs).
- safe-commit index clobber hit all three workers' commits; repaired
  each time via HEAD-blob cacheinfo, commits verified correct.
- Registration slow (~13 min per tree: internal reap + large
  checkout) and git lock contention under sibling load; heartbeats
  landed for all three trees (askplus last 08:46Z at handoff, still
  fresh then — do not read an older heartbeat as death without
  re-checking).
- All three trees released done-merged, branches deleted, main tree
  clean at closeout. No push, no bump, no live verification.
- Sibling Loop B 0830Z already published the diplomacy recovery
  list (tend-through vs zombie-clearing separately; belongseek
  panel tending subordinate links; LEAGUE peer-link corpus; SAY_RE
  fix; flipped-LEAD policy question) and the polityfrag DIAG-GO —
  this run's next blanks ADD to that list, they do not replace it:
  (a) approach-path blocked-step fallback arm; (b) recordWaveKill
  append-before-unlock-check lever arm; (c) wave5faced label rename
  in the fleerepair summarizer.

scale-onramp stays converging (NOT converged): full seat unwon,
wave-5 kills 0, but two more mechanisms are now named rather than
suspected — holding fails through pantry-gated tending gaps, and the
veteran door, when examined day by day, holds correctly. The next
work is holding + overlap manufacture, not asking or fleeing.
Claim deleted; lock deleted.
Merged locally, pending ship (askplus 9e555c62e, holdbeat b5872c25e,
fleerepair-confirm 8c28625a0; coordinator evidence this file).
