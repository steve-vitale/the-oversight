# sim-food-economy-round-0730-b — coordinator evidence (loop B, 2026-10-29 0730Z)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261029T0730Z.
Axis: food-economy (second axis; loop A live on scale-onramp throughout,
0715Z lottery-a finish then 0815Z pickdepart-a, NOT touched).

Pre-flight: main tree clean, disk 19%, reaper run (other runs' active/dirty
trees left alone). Claim written before any sims
(`hidden_files/lever-claims/fleshout-loop-b-20261029T0730Z.json`); B lock
created 07:38Z. Master moved twice under the run by sibling lanes
(journey-scale r51 5d6c94143, loop A pickdepart-a 10a827e24 — both
tooling/evidence only, zero src/js, zero overlap with either arm). Both
arm branches were rebased onto the moved master clean, proofs re-run green
by the coordinator on the rebased branches, then merged --ff-only.
No src/js in this run. No default flips. Both arms land as default-OFF
policy instruments only. Merged locally, pending ship.

## Arm 1 — sim-eveningdetour-b: GO (pilot + confirm)

Question (from the 0630Z review's next blank #1, blockedpath §5 draft
prereg): on a travel-refused evening, does walking the BFS route-around
home rescue the evening? Prereg committed before any judged after-leg
(f9fe185a7); confirm declaration committed before any confirm after-leg
(14ec56363); final GO commit 2b25b7155 (rebased; original 05350cd14).

Judged numbers (primary metric, quoted with its scope: rescue rate among
refused evenings on refused-prone seeds, bar ≥ 0.50, min-n 8):

| Band | Seeds | Refused evenings (after leg) | Rescued | Rate | G1 | G2 | G3 |
|---|---|---|---|---|---|---|---|
| Pilot | 8 | 15 | 15 | 1.000 | median 30 vs 30 | starvation 4 vs 2 (at bound) | 0 violations |
| Confirm | 14 | 17 | 17 | 1.000 | median 30 vs 30 | starvation 3 vs 6 | 0 violations |

Before/after burden: pilot refused evenings 84 → 15 first-refusals (all
rescued, refused-streaks eliminated, mean 6.0/max 9 → none); confirm
43 → 17 (streak mean 3.07/max 7 → none). This is trajectory divergence,
not a denominator trick — a rescue puts the villager home, so the rest of
the episode never occurs — and the arm evidence reports rate and counts
together. Mechanics: 99 detour steps across both bands, all exactly one
orthogonal tile (0 teleports), 0 combat encounters on detour steps,
0 stopped / 0 no-path / 0 died; path lengths walked 2–5 steps. Detour
steps bill nothing (node travel free); the lodge walk bills 8–10 kcal as
converted evenings already do. Total deaths fell on both bands
(pilot 79→68, confirm 138→123). Before-leg reproduction exact: pilot
before-leg refused counts match the verdict corpus exactly (84); confirm
before-leg total 43 matches diag + scan expectation. G2 watch item
resolved: the pilot's starvation uptick (4 vs 2, all on seed 11390 days
18–20, that seed's total deaths still falling 14→10) did NOT replicate at
confirm (3 vs 6) — recorded as trajectory-divergence noise, no guard
re-scored.

Proof: scripts/test-eveningdetour-b.js T1–T8 PROOF-GREEN on the rebased
branch (coordinator re-run). Scope held: zero src/js, competent.js
untouched, gate default-OFF, no driver adopts it.

Sense-testing: rescued evenings read as played walks — refusal line, then
plain "Travel 1 tile to…" steps, follower trailing step-by-step and
stopping at the treeline, lodge walk + hall entry. The known blank
persists and was NOT built: no "going around" narration line (felt most
on 5-step walks). Stopped/no-path branches were never exercised (0/32
detours stopped) — designed and coded, not played; flagged for a future
harder-geometry run (see findings backlog).

## Arm 2 — sim-adjacenttile-b: GO

Question (from the 0630Z review's next blank #2): the standing go-home
instrument's already-home guard uses Game.playerAtHaven() (Manhattan
distance ≤ 1), so a player standing one hop from haven with a CLEAR hop
never gets the standing step. Does the tile check alone (player tile ==
haven tile) rescue those evenings? Prereg committed before any judged
after-leg (3c5f8d86a); final GO commit 980a71afe (rebased; original
9d5d2ec77). The standinghome-retry verdict stands and was never
re-scored; this is a new prereg on a guard change inside the gated
instrument only. Game.playerAtHaven itself was NOT changed.

Judged numbers (substrate identical to the standinghome-retry run:
thief grant, trip-home route-around ON in both legs):

- Seed 10772: its 2 hop-clear evenings (days 10–11, at (4,3)) both convert
  to at-home, 2/2 — the prereg's centerpiece bar.
- Pooled hop-clear away evenings: 2 → 0.
- Controls fire on identical days; refused 0 → 0; pooled starvation
  11 → 10; median survival 30 → 30.
- G1 causal-window (7 days after a standing step) starvation: 0.
  G2 honesty: 0 violations.

Proof: scripts/test-adjacenttile-b.js PROOF-GREEN on the rebased branch
(coordinator re-run). The worker also ran check.js --quick on its tree:
283 passed / 7 failed in 1586s — the worker verified none of the 7 can be
caused by this arm (only 3 check tests reference the COMPETENT_STANDING_HOME
gate, all green; the one visible failure, a racks-full voice-gating test,
never imports competent.js and touches zero src/js-adjacent code). The
standing pre-existing profile was 280/7; the 283/7 figure is consistent
with pre-existing tree noise, not a regression. Coordinator did NOT re-run
check.js --quick (zero src/js in this run; the arm proof re-runs above are
the landing gate). The 7 check failures remain triaged as pre-existing
noise for the ship loop's own verification run; a fresh check run with
output captured to a file (not through tail) would be needed to name all
7, since the worker's run truncated the FAIL lines.

Sense-testing: the rescued 10772 evenings read as a real return home;
the day-11 player starvation death present in the before leg is the
before-leg record, not an after-leg outcome (see arm evidence).

## Wall numbers (every run)

Both arms' legs are 30-day position traces — national / table / wins NOT
OBSERVABLE (no fields), reported not claimed. Wave 4–5 unlocks: 0 in both
arms, both legs. Median survival: 30 days both arms, both legs. No wall
movement claimed. These are nightly-position policy instruments; a
30-day position trace cannot move a scale-wall number.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is attached, as pre-registered practice for
policy-side arms: zero src/js changes, so there is no game-root delta for
a panel to compare, and the panel's registry policies do not include the
trace policies (nighttravel, standing-home) these arms measure. The
before/after instruments on identical seeds are the comparison, and the
pre-registered thresholds are the judge. If either instrument ever
becomes a game change, a panel compare is run at that point.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json` on the detour
confirm-after corpus (14 files) and the adjacenttile after-pilot corpus
(4 files), metrics national,table,wins,exiled: 3 LOUD lines each
(national 12→0, table 16→0, wins 16→0), all the KNOWN field-shape +
regime artifact class (pre-seat 30-day traces vs WINSEAT baseline) —
baseline NOT rolled, no new investigation. Exiled: no LOUD line.

## Village assessment (plain words)

Thirty days in, these villages look like the verdict run's villages:
alive, thin, and — until this run — repeatedly sleeping one tile from
home. Two distinct one-tile traps are now closed as instruments. The
evening detour walks the villager around the rubble, the fallen tree,
the washed-out gap, the creek — the same "go around" a human player
could already tap, which the bot simply never used at evening. The
adjacent-tile fix closes the quieter trap: standing next door to home
with a clear path and still not going in, because "near home" counted as
"home." Neither is a game change yet — both sit default-OFF, waiting for
a decision to adopt — but the measurement question each one answered is
settled: the evenings are rescuable, the guards hold, and the rescued
evenings read as played walks home, not teleports. The blank that
remains open is narration: the walks home still don't say they went
around anything, and the detour's stopped/no-path branches have never
been played — both documented, not built, in this run.

## Infrastructure

- Safe-commit index clobber hit all three detour worker commits and both
  adjacenttile worker commits (committed files showing as staged
  deletions with byte-identical worktree copies); repaired each time by
  the workers via HEAD-blob cacheinfo and verified clean. The commits
  were always correct. Coordinator merges were clean; no clobber on the
  coordinator evidence commit (verified: main tree clean after merge
  and after this commit — see closeout check).
- No EPERM write flap blocked this run.
- Master moved twice under the run (journey r51, loop A pickdepart);
  both branches rebased clean with proofs re-run green before merging.
- Loop A live throughout on scale-onramp (0715Z → 0815Z runs); its claims
  and trees were never touched. Loop B claim deleted and lock deleted at
  closeout.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The detour rescue rate must stay quoted with its scope ("among refused
  evenings on refused-prone seeds"), never as a blind-band rate. A
  blind-band confirm (fresh scan, no outcome screen) is the honest
  follow-up if adoption is ever proposed.
- The detour's stopped/no-path branches are unplayed (0/32). A future
  harder-geometry run (diagonal-only passages, mid-detour combat) must
  exercise them before any adoption claim about robustness.
- The adjacent-tile guard change lives inside a default-OFF instrument.
  If the standing-home instrument is ever adopted, the tile-check guard
  rides with it — but adoption itself needs its own decision, not this
  run's GO.
- check.js --quick's 7 failures remain unnamed in full (worker truncation);
  the ship loop's verification run should capture output to a file.

## Evidence files

- Arm 1: evidence/2026-10-29/sim-eveningdetour-b.md +
  sim-eveningdetour-b-prereg.md + sim-eveningdetour-b-confirm.md +
  sim-eveningdetour-b-analysis.json + sim-eveningdetour-b-confirm-analysis.json
  + corpora (pilot/confirm before/after/scan) + scripts/eveningdetour-trace-b.js
  + scripts/analyze-eveningdetour-b.js + scripts/test-eveningdetour-b.js
  (merged 2b25b7155).
- Arm 2: evidence/2026-10-29/sim-adjacenttile-b.md +
  sim-adjacenttile-b-prereg.md + corpora (after-pilot/after-confirm) +
  scripts/debug-adjacenttile-10772.js + scripts/test-adjacenttile-b.js +
  scripts/policies/competent.js guard change (merged 980a71afe).
- This coordinator file: evidence/2026-10-29/sim-food-economy-round-0730-b.md.

## Next blanks, in order

(1) Homeward clearing habit as a SEPARATE lever (mid-day kcal at clearing
time, floor 200 after clearing), never pooled with the detour. (2) Detour
narration ("going around" line) as a small honesty pass when a src/js arm
opens. (3) Harder-geometry detour run exercising stopped/no-path branches.
(4) Blind-band detour confirm if adoption is proposed. (5) Adoption
decision for the standing-home instrument (with its tile-check guard) —
a decision, not a measurement.

food-economy stays converging (NOT converged): two refused-evening traps
now pass staged pilot + confirm as default-OFF instruments, but neither
is a game change, the homeward clearing habit is unbuilt, detour narration
is unbuilt, and no food-economy fix has landed as game code.
scale-onramp stays converging (untouched; sibling loop A lane).
