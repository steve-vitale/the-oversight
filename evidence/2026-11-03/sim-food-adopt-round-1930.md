# Loop B 1930Z — food-economy ADOPTION RUN (dead 1630Z run recovered, 2 arms landed, merged locally pending ship)

Run: fleshout-loop-b-20261103T1930Z, axis food-economy (second
non-converged axis; Loop A live on scale-onramp 1819Z gearbar/w4convert
throughout, NOT touched; win lanes NOT touched; gap/journey lanes NOT
touched; stranded gutted sim-ctraj-b NOT touched).
Claim written before any sims; lock created at run start.
Pre-flight: main tree clean, disk 31%, reaper removed nothing
sibling-owned (dead trees protected by uncommitted changes).

## Stale-lock recovery (this run's start)

Dead B run 1630Z, triple-check dead: lock 1630Z; its tree heartbeats
sim-awayration2-b 17:10:46Z (145 min stale) and sim-streakfree-b
18:21:53Z (74 min stale) at 19:35Z recovery; no processes for either
arm; last worktree writes 18:28Z/18:31Z (61+/58+ min stale).
Unlike the 1330Z recovery (nothing to salvage), the 1630Z run left
real work: awayration2-b had 1 commit (prereg + diag instrument +
pilot corpus 3b1c9804a) PLUS an uncommitted fix and a complete armed
pilot corpus; streakfree-b had 2 commits (prereg + tools/analyzer +
proof 22/22) PLUS a 180/200-seed screen corpus. This run ADOPTED both
arms into fresh trees (salvage read-only from the dead trees; workers
committed into new branches). Dead claim retired to .DEAD with note;
dead trees left untouched for the reaper (their branches are kept;
the adopted content now lives on master).

## Arm 1 — sim-awayration2-adopt-b: KILLED at pilot (NO-GO)

Adoption: dead commit 3b1c9804a cherry-picked cleanly
(5a2535d89); the uncommitted fix re-applied deliberately from its
138-line diff (not a wholesale copy); armed pilot corpus copied and
verified (8 per-seed JSONs parse). Proof test green WITH the fix,
then the fix was killed per prereg — it was never committed on the
adoption branch, so the kill is a clean absence: zero src/js change
vs branch base (verified by coordinator diff).

Prereg (binding): primary metric mean pack-meal shortfall, pilot
seeds 96101–96108, competent, 100d. GO = armed mean ≤ 5.0 kcal AND
shortfall-meal share ≤ 0.010, plus guardrails. Expectation stated
in the prereg was NO-GO, and the pilot confirms it.

Before/after (identical seeds, competent, 100d):

| | Baseline (diag) | Armed (salvaged) | Armed (fresh, current base) | GO |
|---|---|---|---|---|
| Mean pack-meal shortfall | 13.8 kcal | 15.2 kcal | 12.4 kcal | ≤ 5.0 — MISS |
| Shortfall-meal share | 0.026 (11/417) | 0.024 (8/327) | 0.018 (9/511) | ≤ 0.010 — MISS |
| Decomposition | topUpGap 1.000 | topUpGap 1.000, theft 0 | topUpGap 1.000, theft 0 | — |
| Pack-day adequacy | 0.993 | 0.985 (guardrail ≥0.98 pass) | 0.992 | — |
| Starvation deaths | 6 | 13 (guardrail ≤8 breached on the letter; all 13 on pantry-0 seeds, same empty-pantry collapse as baseline, amplified by RNG-stream divergence — reported as written, not needed for the verdict) | — | — |

Mechanism confirmed exactly as diagnosed: dawn now tracks want
(mean 693 vs want 582, gap −111 vs baseline −293) and the top-up
almost never fires — on pantry-plentiful days take already equaled
want; on pantry-empty days there is nothing more to draw. Confirm
seeds 96109–96124 were NOT run (prereg forbids them on NO-GO). No
re-scoring against any friendlier metric.

§15 balanced panel: attempted, not fabricated (before-panel on
stashed baseline, after-panel with fix, competent/96101–96108/100d;
compare decision `review_required`, driven only by tier-3+ weapon/
armor access 1 → 0.75 on 2/8 seeds, RNG-reshuffle noise — the fix
touches no loot code). Per §15 the panel is evidence, not judge;
it does not override the NO-GO. The dead worker's `panel-before/`
was NOT reused (its "before" label is unverifiable); its
`checkquick-armed.log` is a truncated 2-line mid-run log and no
verdict is drawn from it.

Reachability (watch only): armed survived 3/8, wave 4 on 2/8,
Arc III 8/8, national/table/wins 0/8 — the scale wall is untouched
by this lever, as expected. Deaths: monster 21, wild 17,
starvation 13 of 71 total.

Sense test: all 10 armed away-voice lines are the same hurt-traveler
full-meal template (e.g. Norman d27, 1,485 kcal at health 4) —
honest about the meal, never explaining why a villager at health
3–7 stays out instead of going home. Appended to sim-findings.md
as an [open] travel/health item (the diag had it only in its own
evidence, not the backlog).

Commits: 1765c0a33 (cherry-picked prereg + instruments + diag
corpus) + 7b7acbbb9 (evidence: armed corpus + analysis, rerun
corpus, panels, evidence file). Proof scripts/test-awayration2-b.js
ALL LEGS PASS post-rebase (legs A+B; leg C asserts fix behavior
and was correctly dropped with the fix).

## Arm 2 — sim-streakfree-adopt-b: INSUFFICIENT-DATA

Adoption: dead branch's prereg + tools/analyzer + proof
cherry-picked cleanly onto current master 77ff4a807 (no rebase
needed at adoption). Reused files verified untouched vs master
(trace-gatecover-b.js, analyze-gatediseng-b.js, competent.js —
empty diff). No game code, policy default, or existing script/
policy file edited. This run lands evidence + instrument only, per
the prereg — no (v*) or (e*) deploy.

Screen (Stage 1 — GO): salvaged corpus verified exactly as briefed
(180 lines, seeds 83001–83180 in order), then completed with seeds
83181–83200, same verbatim tracer invocation, appended in order,
no salvaged line overwritten. Final: 200 lines, rows == daysAlive
on all 200. Collapsing 10 (bar ≥ 4): 83014, 83019, 83020, 83055,
83111, 83126, 83140, 83149, 83163, 83189 (screen rate 5%).
Survivors 189; other 1 (83042, lost day 29, no starvation death).
The 20 completion seeds added no collapsers.

Tracer legs (Stage 2 — judged on tracer corpus only): 26 legs
(10 candidates + first 16 survivors), rows == daysAlive on 26/26,
first try. Still-collapsing 8 (≥ 4 ✓). Excluded by the prereg's
still-collapsing rule: 83126, 83140 (screen-collapsing → tracer
survived 30d). Survivor drift: 83013 (screen survivor → tracer
village-lost day 28, first starvation day 26). Per the prereg this
alone forces INSUFFICIENT-DATA — 83013 joins no denominator, no
replacement sampled.

Judged legs on the 8 still-collapsing: fire 8/8 ✓, tie 8/8 ✓,
strict 6/8 (≥ 50% ✓), lead-one 7/8 (≥ 75% ✓), survivors 15 (≥ 12 ✓),
cross-check 0 mismatches on 26/26 ✓. Cost leg FAILS independently:
(v*) fires on 4/15 traced survivors (26.7% > 25%) — 83001 (d8 E1),
83002 (d8 F), 83005 (d24 E2), 83011 (d30 E1, horizon edge). (c)
fires on 3/15; overlap is exactly those 3. So even without the
drift, the variant would not be PILOT-GO: cost is the binding
constraint, not coverage.

Before/after on identical trajectories: mean lead (v*) 3.75 days
vs (c) 2.875 days; (F) is first-firing on 2/8 (83014, 83020),
buying exactly one extra day each. Sole death-knell firing: 83055
(lead 0 under all three rules). Determinism spot-check (83014,
83111, 83189): 3/3 byte-identical re-runs.

Substrate finding — screen/tracer divergence is base drift, not
flakiness: tracer-vs-screen byte-equality holds on only 10/26
legs; membership agrees on 23/26, and the 3 disagreements are
exactly the two exclusions + the drift seed, all handled by
prereg rules. Cause identified: salvaged screen lines were
generated on the dead tree's base (991609dfe), tracer legs on
current master (77ff4a807), which differ in src/js (win-plan.js
+715 lines, villager-agency.js). Judged legs run on tracer lines
only, per the prereg. Metric review in the arm evidence
recommends future adoptions re-screen on the judging base or
pre-register base-drift handling.

Wall numbers (traced legs, 30d limit stated): 17/26 survived,
median days alive 30, max 30; waves 2 (13) / 3 (13); national /
table / wins NOT REACHED IN WINDOW.

Sense test (plain words): on both firing evenings examined
(83014 day 18 via F; 83163 day 14 via E2), the warning would land
silently — no transcript line notices the store falling. 83014's
evening reads as an ordinary productive day (garden work, Ivy
teaching the Murkcap counter); 83163's evening is filled with one
obstacle line repeated verbatim three times ("The creek runs fast
here — no crossing without a bridge or a swim."). A future deploy
must frame (v*) as the store's fall and actually say something on
the firing evening. Proposed findings line appended by coordinator:
transcript-repetition [open] 2026-11-03 (83163 creek line ×3,
zero food/hunger/store lines on a streak-4 firing evening).

§15 balanced panel: inapplicability DECLARED in the prereg — no
compare file fabricated.

Commits: 57468017d (prereg) + 168c14320 (tools + proof 22/22) +
24807c9fd (evidence, corpora, adoption proof). Proofs post-rebase:
test-streakfree-adopt-b.js 23/23, test-streakfree-b.js 22/22,
test-gatediseng-b.js 21/21, test-gatediseng-confirm-b.js 11/11.

## Wall (this run's judged corpora — NOT wall movement)

Both arms are instrument/diagnostic legs, not campaigns. Awayration
pilot: national/table/wins 0/8. Streakfree tracer: national/table/
wins not reached in window. No campaign field moves; the full seat
stays unwon and wave 5 unfought in normal play (Loop A lane).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-03/perseed-awayration2-b-armed/*.json' --metrics
national,table,wins,exiled` → 3 LOUD lines (national 12 → 0,
table 16 → 0, wins 16 → 0). Same known class as prior runs:
competent-only 100d pilot corpus vs a WINSEAT baseline; this run's
own baseline cell is also 0/8. Instrument-population mismatch, not
an arm regression — baseline NOT rolled, no investigation item.

## Infrastructure

- Worktree registration stalled ~15 min behind registry-flock
  congestion at run start (first tree registered, second queued);
  closeout reap likewise slow (~3 min). No lock forced, no sibling
  process touched.
- Safe-commit index clobber hit all worker commits on both arms —
  repaired via HEAD-blob cacheinfo each time, commits verified
  correct, trees clean at closeout.
- Worker heartbeats repeatedly blocked on REGISTRY.lock contention
  during the run (45–60s timeouts); coordinator re-heartbeated the
  awayration tree after its worker finished. Nothing was lost; do
  not read a stale heartbeat on these trees as a live run.
- check.js --quick NOT re-run in full: zero src/js in either arm
  (awayration kill leaves no game-code trace; streakfree is
  instrument-only), proofs re-run green post-rebase on both arms.
- Master moved under this run (sibling journey/gap landings);
  both branches rebased clean in their own worktrees, proofs
  re-run green after every rebase, merged --ff-only.
- Coordinator evidence committed on its own branch and merged
  --ff-only (no direct master commit). No push, no bump, no live
  verification — the batch ship job owns deploys.

## Findings backlog

Appended (2): travel/health hurt-traveler-stays-out (worker 1,
already in file at closeout check) + transcript-repetition creek
line ×3 (worker 2's proposal, appended by coordinator).

food-economy stays converging (NOT converged): the away-ration
formula story is CLOSED (dawn-resizing killed at pilot; remaining
shortfall is pantry-empty, not formula — a future arm wanting to
move THOSE meals needs a real dawn reservation, a different larger
change); the sensor (v*) shape is NOT advanced (INSUFFICIENT-DATA
on drift, cost failing independently at 26.7%). scale-onramp
untouched (sibling Loop A lane). Next blanks, in order: (1) a
future (v*) prereg must pre-register base-drift handling
(re-screen on the judging base) AND solve the cost leg (the
fallback's extra survivor firing is the binding constraint, not
coverage); (2) hurt-traveler turn-home reason or line
(travel/health finding); (3) firing-evening narration for any
future (v*) deploy (silent warnings + creek-line repetition).

Claim deleted; lock deleted.
Merged locally, pending ship (awayration2-adopt 1765c0a33 +
7b7acbbb9, streakfree-adopt 57468017d + 168c14320 + 24807c9fd,
plus coordinator evidence).
