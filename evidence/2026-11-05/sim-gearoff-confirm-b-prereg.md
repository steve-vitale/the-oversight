# Gearoff-confirm-b prereg — confirm the GEAR toggle on FRESH seeds (Loop B, run fleshout-loop-b-20261106T0130Z)

## Question
Does the gearoff (GEAR) signal from the 0030Z rescreen reproduce on fresh
seeds? The rescreen (evidence/2026-11-05/sim-toggle-rescreen-b.md +
prereg sim-toggle-rescreen-b-prereg.md — READ BOTH, they define this
method) found gearoff GO-CANDIDATE on S1 + S3: seed 99651 flipped
won-lesser d118 -> scattered d66 (a loss), S3 fired on 4 seeds (99653
kills 3->0 / fights 9->0; 99655 fights 0->15; 99656 fights 6->0; 99658
kills 8->1, fights 16->9, wave-5 door closes uw5->uw4). Net direction was
negative, but the screen judges whether the lever MOVES outcomes, not
whether it helps. This confirm asks whether that movement reproduces on
12 fresh seeds.

## Pinned-base method (game code is NEVER committed)
- Pinned base: master commit ff1725835 (arm-2 commit d8f334da8 verified
  an ancestor, so arm 2 is ON in V-full). Branch starts at current master
  (fd2d0c5ef). For sims, the pinned game tree is checked out into the
  worktree: `git checkout ff1725835 -- src index.html scripts`, then the
  toggle tooling scripts are copied back from master
  (`git show master:scripts/<name> > scripts/<name>`) since they postdate
  the base.
- Variant construction BEFORE any sim: after reverting all four levers,
  `git diff d8f334da8^ -- src/js/` must be empty (V-alloff byte-equal to
  pre-arm2 blobs). If not, STOP and report a construction failure.
- Post-base src/js files (villager-goals.js, win-plan.js) must be removed
  from worktree + index for the sim phase (inert — the pinned index.html
  does not reference them — but they would fail the alloff byte-equality
  check). Before finishing, restore src/ + index.html (+ scripts/) to
  HEAD; verify `git diff HEAD -- src/ index.html` empty and
  `git status --short` shows only intended files. Uncommitted leftovers
  = FAIL LOUDLY.
- NOTE (carried from the rescreen): `git checkout -- src/js/` (the
  constructor's `restore`) restores to the INDEX, which holds the pinned
  blobs after the pinned checkout — so restore returns to the pinned tree
  during the sim phase. safe-commit resets the index to HEAD, so after
  every safe-commit the pinned tree must be re-checked-out and the two
  post-base src/js files re-dropped from the index before any further sim.

## Fresh seed band 99821–99832 (12 seeds)
Freshness check (local_seed_band_freshness skill): searched ALL dated
preregs (evidence/*/sim-*-prereg.md) plus the goal hidden_files/ and
forbidden/contaminated lists for exact-boundary matches of each seed.
Results (verified by this worker before any sim, 2026-11-06 ~03:10Z):
- All dated preregs (evidence/*/sim-*-prereg.md), exact-boundary grep
  per seed: 0 hits for every seed 99821–99832.
- Goal hidden_files/ *.md (forbidden/contaminated lists, notes):
  0 exact-boundary hits.
- Goal hidden_files/ *.json: the ONLY exact-boundary hit is the
  coordinator's own claim file
  hidden_files/lever-claims/fleshout-loop-b-20261106T0130Z.json, which
  names this band as this run's assignment — the reservation itself, not
  a collision.
- No file or directory name under hidden_files/ contains 9982x.
- The loose `9982` hits in 2026-10-27/28/30 preregs are the 4-digit
  seeds 9981–9988 (different numbers), not this band.
- Clear of the named forbidden/contaminated bands: 99009–99024
  (belongzombie) and 99401–99412 (tendfloor forbidden list).
- Coordinator-verified fresh (claim file
  fleshout-loop-b-20261106T0130Z.json): 0 exact-boundary hits across all
  dated preregs + goal hidden_files; rejected candidates recorded in the
  claim: 99701–99714 holdbeat, 99721–99732 tbretreat-b, 99741–99752
  tbretreat-b-confirm. Note 99801–99808 is also used — stay clear of it.
- Seed plans mirror the rescreen layout (3 waves / 1 forcedrift / rest
  wavesnw): 99821–99823 waves, 99824 forcedrift, 99825–99832 wavesnw.

## Substrate (r118 verbatim, do not retune)
Probe scripts/probe-toggle-confirm-gearoff-b-20261106.js =
probe-toggle-rescreen-20261105.js with ONLY the PLAN map changed to the
99821–99832 layout above (header comment records the diff). The r118
probe defaults unknown seeds to the 'grey' plan, which would break
substrate parity, so the plan-map change is a tooling adaptation, not a
construction change. capable + deedhunt + vetcommit + greedy deferral
defaults MAXTIER 4 / LASTDAY 145, armorydrive + fullseat-diag + vetguard
on waves seeds, 180d death-aware horizon. Env for every sweep:
FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1
TELEMETRY_FULL=1 RELAYGREY=1; SEEDS env set explicitly on every
invocation. Per-seed corpora under
evidence/2026-11-05/perseed-toggle-confirm-gearoff-b/ following the
rescreen layout (vfull- / gearoff- prefixes, .json + -transcript.txt per
seed).

## Hunk map (reused verbatim from the rescreen prereg, verified from `git show d8f334da8`)
- GEAR — fieldFights.js, 7 hunks + header comment line (ally gear parity:
  allyGear fn + both call sites, ally strike formula, ally armor).
No other lever is touched by this arm.

## Variant construction (revert-from-pinned, never committed)
Script: scripts/apply-toggle-variant-20261104.py (unchanged, from master).
V-full = unmodified pinned tree. Variant game code is NEVER committed;
`restore` returns src/js to the pinned tree after the run, and the final
restore returns src/ + index.html to HEAD before finishing.

## Judge (binding, decided by the coordinator per the rescreen metric review — judge BOTH class flips and trajectory movement; do NOT re-score to whichever moved)
- Primary: gross class flips vs same-base V-full on identical seeds.
  Class vocabulary: scattered / won-lesser (+ sat day) / survived-to-
  horizon (a village alive at the 180d horizon without sitting — NAME it,
  never lump under "other") / wave-5 reached (unlockedWave >= 5 OR
  satWaves.w5 > 0). Count flips GROSS — rescues and losses separately —
  with direction + mechanism traced per flip in the transcript.
- Trajectory: S2 (sat-day |Δ| >= 9) + S3 (wave-4 census kill swing >= 2
  or fight swing >= 3) per seed, same thresholds as the screen.
- GO (confirm) iff the screen signal reproduces: S1 (>=1 class flip) OR
  S3 (>=1 seed) fires on >=2 of 12 seeds, with every flip
  mechanism-traced.
- NO-GO iff the signal fires on <=1 of 12 seeds.
- S2 is recorded/descriptive, NOT deciding. Net wins alone NEVER judge
  (the screen showed a real lever effect with net-negative direction).
  A miss is NO-GO, never re-scored against a friendlier metric mid-run.
  Every evidence file carries a "metric review" section.

## Staged design (judge against this header)
- STAGE 0 — determinism gate: (a) DET=1 byte-identical on seed 99821
  (probe's own det mode, two identical runs of the pinned tree); (b)
  V-full sweep on all 12 fresh seeds (pass 1 — the judged baseline).
  GATE (binding): both pass. On FAIL: STOP, report a determinism failure
  with the per-seed divergence table, do NOT judge, do NOT soften the
  gate, do NOT re-run on current master.
- STAGE 1 — confirm ONLY (12 runs): gearoff on the same 12 fresh seeds
  vs same-base V-full pass 1. Judge strictly against the judge above.
- STAGING DEVIATION (pre-registered, explicit): NO full V-full pass-2
  repeat. Justification: the rescreen proved byte-identical repeat on
  this identical pinned base + probe (8 seeds,
  evidence/2026-11-05/sim-toggle-rescreen-b.md); DET re-verifies
  determinism on this band's first seed; a 12-seed pass 2 would cost
  ~30 min and add no new information (determinism is a property of the
  code, not the seeds). Do not let this quietly become the staging.
- Total runs: 2 (DET) + 12 (pass 1) + 12 (variant) = 26. Budget ~70-80
  min. TIME: this run's window is tight — if clearly going to overrun,
  commit what exists and report PARTIAL with NO verdict (a partial corpus
  is never judged, never re-scored). Do NOT rush the judge to fit the
  window.

## Sense-testing law
Sense-read at least one flipped or most-moved seed end to end
(transcript): meaning, coherence, relevance, consequences — never just
counts. For a NO-GO, sense-read the most-moved seed anyway to confirm
the mechanism is understood. Genuine out-of-arm findings go to
hidden_files/sim-findings.md in its format (do not chase them).

## Scale-wall numbers (report every run)
national / table / wins, wave 4–5 unlocks, median survival for the
judged corpora, in plain words too.

## Metric review (placeholder — filled at closeout)
To be filled at closeout. Pre-run note: the rescreen metric review
warned that S2 never fired on the fresh block (largest |sat-day Δ| was
2) while S3 did the work on all three toggles, and that the wave-4-only
census is blind to the fights that flipped seeds (gearoff-99651's
stranger fight: 0 census fights on both sides). This confirm judges S1 +
S3 as pre-registered above; S2 stays descriptive. The staging deviation
(no pass 2) is recorded here as well as in the staged design above.
