# Toggle-rescreen-b prereg — re-screen sigoff / gearoff / trickoff on FRESH seeds (Loop B, run fleshout-loop-b-20261105T2330Z)

## Question
Blank (a) from the 0445Z togglepin run: do the 0445Z trajectory movements
reproduce on fresh seeds, and does any toggle flip a village's class?
0445Z fast-killed sigoff / gearoff / trickoff on pilot non-attribution
covering only 89702/89704/89705 classes — but sigoff moved 89705 (sat
108 vs 113) and gearoff/trickoff moved sat days −9 to −23 and swung
fight counts/kills heavily without changing pilot classes. MORALE was
credited in 0445Z and is NOT part of this screen.

## Pinned-base method (game code is NEVER committed)
- Pinned base: master commit ff1725835, the base r118 ran on and the
  base 0445Z pinned to. Verified: arm-2 commit d8f334da8 IS an ancestor
  of ff1725835, so the pinned base already has arm 2 ON. V-full = the
  pinned game tree, unmodified.
- Branch starts at current master (for evidence/scripts commits). For
  sims, the pinned game tree is checked out into the worktree:
  `git checkout ff1725835 -- src index.html scripts`, then the toggle
  tooling scripts are copied back from master
  (`git show master:scripts/<name> > scripts/<name>`) since they
  postdate the base.
- Variant construction BEFORE any sim: after reverting all four
  levers, `git diff d8f334da8^ -- src/js/` must be empty (V-alloff
  byte-equal to pre-arm2 blobs). This run screens only sigoff /
  gearoff / trickoff, but the alloff construction check is run once
  up front to prove the constructor still works on the pinned base.
  If not, STOP and report a construction failure.
- Before finishing, src/ + index.html (+ scripts/) are restored to
  HEAD so the branch holds evidence/scripts ONLY; verified with
  `git diff HEAD -- src/ index.html` empty and `git status --short`
  showing only intended files. Uncommitted leftovers = FAIL LOUDLY.

## Fresh seed band 99651–99658 (8 seeds)
Freshness check (local_seed_band_freshness skill): searched ALL dated
preregs (evidence/*/sim-*-prereg.md) plus 2026-11-03/11-04/11-05
evidence for exact seed numbers, and the named forbidden/contaminated
bands. Results:
- First candidate 99551–99558 REJECTED: 99556 is used (hurthome-a
  competent seed, evidence/2026-11-04/perseed-hurthome-a/).
- Chosen band 99651–99658: 0 hits in every prereg for all 8 seeds;
  no exact-number match in any 2026-11-03/11-04/11-05 evidence file
  (the loose `9965[1-8]` hits in tracer/sensor calib files are
  substrings of longer numbers, verified by exact-boundary grep).
- Clear of the named forbidden/contaminated bands: 99009–99024
  (belongzombie) and 99401–99412 (tendfloor forbidden list).
- Seed plans mirror the 89701–89707 layout (+1 wavesnw seed):
  99651–99653 waves, 99654 forcedrift (control), 99655–99658
  wavesnw.

## Substrate (r118 verbatim, do not retune)
Probe scripts/probe-toggle-rescreen-20261105.js = probe-toggle-b-20261104.js
with ONLY the PLAN map changed to the 99651–99658 layout above
(header comment records the diff). The r118 probe defaults unknown
seeds to the 'grey' plan, which would break substrate parity, so the
plan-map change is a tooling adaptation, not a construction change.
capable + deedhunt + vetcommit + greedy deferral defaults MAXTIER 4 /
LASTDAY 145, armorydrive + fullseat-diag + vetguard on waves seeds,
180d death-aware horizon. Env: FULLSEAT=1 VETCOMMIT=1
CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1
RELAYGREY=1. Per-seed corpora under
evidence/2026-11-05/perseed-toggle-rescreen-b/ following the togglepin
layout (vfull-, sigoff-, gearoff-, trickoff- prefixes, .json +
-transcript.txt per seed).

## Hunk map (reused verbatim from togglepin-b prereg, verified from `git show d8f334da8`)
- SIGDMG — sigW4.js, 3 hunks covering 5 changes.
- GEAR — fieldFights.js, 7 hunks + header comment line.
- TRICKHOLD — fieldFights.js, 1 hunk: known-trick hold only; the
  pre-existing trickLog hold is untouched (it is not in the commit).
- MORALE (1 hunk + comment line) is NOT screened here; the constructor
  still knows it for the alloff verification only.
No hunk maps to none or two of the three screened levers.

## Variant construction (revert-from-pinned, never committed)
Script: scripts/apply-toggle-variant-20261104.py (unchanged, from
master). V-full = unmodified pinned tree. Variant game code is NEVER
committed; `restore` returns src/js to the pinned tree after each
variant's run, and the final restore returns src/ + index.html to
HEAD before finishing.

## Primary metric (binding)
Per-seed outcome class on matched fresh seeds 99651–99658:
scattered / won-lesser (+ sat day) / wave-5 reached iff
veterans.unlockedWave >= 5 OR satWaves.w5 > 0. A variant FLIPS a seed
iff its class differs from same-base V-full on that seed. A miss is
NO-GO, never re-scored against a friendlier metric mid-run.
Secondary (screen bar, descriptive but pre-registered): sat-day
deltas, kill counts, fight counts, standing peaks, wave-5 reach.
Every evidence file carries a "metric review" section.

## Screen bar (pre-registered — what counts as a flip / movement worth a confirm)
A toggle is a GO-CANDIDATE (confirm owed, next run) iff ANY of:
- (S1) it flips ≥1 seed's outcome class vs same-base V-full; OR
- (S2) it moves any seed's sat day by |Δ| ≥ 9 days (the bottom of
  the 0445Z gearoff/trickoff observed range, −9 to −23; sigoff's
  −5 sits below the bar); OR
- (S3) it swings any seed's wave-4 census kill count by ≥2, or its
  census fight count by ≥3, vs V-full.
If NO toggle meets S1/S2/S3: DIAG-NO-CANDIDATE, no confirm owed.
The bar is judged on the 8-seed pilot ONLY; NO Stage 2 attribution
runs in this arm — that is a confirm-scale job for the next run.

## Staged design (judge against this header)
- STAGE 0 — determinism gate: (a) DET=1 byte-identical on seed
  99651 (probe's own det mode, two identical runs of the pinned
  tree); (b) V-full sweep run TWICE on all 8 fresh seeds, sat days
  exact between passes on every seed. GATE (binding): both (a) and
  (b) pass. On FAIL: STOP, report a determinism failure with the
  per-seed divergence table, do NOT judge the screen, do NOT
  soften the gate, do NOT re-run on current master.
- STAGE 1 — pilot screen ONLY (24 runs): sigoff / gearoff /
  trickoff on the same 8 fresh seeds vs same-base V-full (pass 1
  is the judged baseline). Judge strictly against the screen bar
  above. No V-alloff screen runs (0445Z already has the alloff
  control on the pinned base; this arm is a re-screen of the three
  fast-killed singles).
- NO Stage 2. If the pilot flips, the confirm is the next run's
  job (its own prereg, 12–16 seeds, fresh band).

## Sense-testing law
For each GO-CANDIDATE toggle, sense-read at least one flipped or
most-moved seed end to end (transcript): meaning, coherence,
relevance, consequences — never just counts. Genuine out-of-arm
findings go to hidden_files/sim-findings.md in its format (do not
chase them).

## Scale-wall numbers (report every run)
national / table / wins, wave 4–5 unlocks, median survival for the
judged corpora (per-seed files carry these; block tallies in plain
words too).

## Metric review (for the NEXT run, not this one)
To be filled at closeout. Pre-run note: the 0445Z metric review
asked for sat-day / kill-count movement as a secondary screen so
"0 flips" is never misread as "inert" — this prereg implements
exactly that as S2/S3, with the thresholds taken from 0445Z's
observed movements (−9 to −23 sat days, kill swings 1↔3 and
4↔0). If S2/S3 fire on fresh seeds without an S1 flip, the next
run's confirm prereg must decide whether the confirm judges
class flips, trajectory movement, or both — do not let the
confirm quietly re-score to whichever moved.
