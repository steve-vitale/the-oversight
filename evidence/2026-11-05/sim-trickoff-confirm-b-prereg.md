# Trickoff-confirm-b prereg — confirm the TRICKHOLD toggle on FRESH seeds 99761–99772 (Loop B, run fleshout-loop-b-20261106T0130Z)

## Question
Blank (a) from the 0030Z rescreen (evidence/2026-11-05/sim-toggle-rescreen-b.md):
does the trickoff GO-CANDIDATE signal reproduce on fresh seeds? On the
rescreen block (99651–99658) trickoff was the most volatile single lever:
3/8 class flips (99651 won lesser d118 → scattered d160 WITH wave-5
reached; 99652 scattered d57 → survived to the 180d horizon; 99653
scattered d72 → won lesser d96) and S3 on 5 seeds. Direction is
seed-dependent (2 rescues, 1 loss). This arm confirms on 12 fresh seeds.

## Pinned-base method (game code is NEVER committed)
- Pinned base: master commit ff1725835, the base r118 ran on and the base
  the 0030Z rescreen pinned to. Verified: arm-2 commit d8f334da8 IS an
  ancestor of ff1725835, so the pinned base already has arm 2 ON.
  V-full = the pinned game tree, unmodified.
- Branch starts at current master (for evidence/scripts commits). For
  sims, the pinned game tree is checked out into the worktree:
  `git checkout ff1725835 -- src index.html scripts`, then the toggle
  tooling scripts are copied back from master
  (`git show master:scripts/<name> > scripts/<name>`) since they
  postdate the base.
- Variant construction BEFORE any sim: after reverting all four levers,
  `git diff d8f334da8^ -- src/js/` must be empty (V-alloff byte-equal to
  pre-arm2 blobs). This run screens only trickoff, but the alloff
  construction check is run once up front to prove the constructor still
  works on the pinned base. If not, STOP and report a construction
  failure.
- Post-base src/js files (villager-goals.js, win-plan.js) must be removed
  from worktree + index for the sim phase (inert — the pinned index.html
  does not reference them — but they would fail the alloff byte-equality
  check). Before finishing, restore src/ + index.html (+ scripts/) to
  HEAD; verify `git diff HEAD -- src/ index.html` empty and
  `git status --short` shows only intended files. Uncommitted leftovers
  = FAIL LOUDLY.

## Fresh seed band 99761–99772 (12 seeds)
Freshness check (local_seed_band_freshness skill, re-verified by THIS
worker before any sim):
- ALL dated preregs (evidence/*/sim-*-prereg.md): exact-boundary grep
  (`\b9976[1-9]\b|\b9977[0-2]\b`) — 0 hits for any of 99761–99772.
- Goal hidden_files/ lever-claims/ + convergence-tracker.md +
  sim-findings.md: 0 hits except this run's own claim file
  (fleshout-loop-b-20261106T0130Z.json, which names 99761–99772 as THIS
  arm's band — coordinator-assigned, not a prior use).
- Named prereg/forbidden/band files in hidden_files/ (maxdepth 2,
  excluding the 2.9G evidence salvage): 0 hits.
- Other worktrees' 2026-11-05 preregs: the only hit is
  sim-sigoff-confirm-b's prereg, which NAMES 99761–99772 as the sibling
  trickoff band (its own band is 99781–99792) — a naming reference, not
  a use. No collision.
- Clear of the named forbidden/contaminated bands: 99009–99024
  (belongzombie) and 99401–99412 (tendfloor forbidden list). Nearby named
  bands do NOT cover this band: 99701–99714 holdbeat, 99721–99732
  tbretreat-b, 99741–99752 tbretreat-b-confirm.
- Coordinator-verified fresh (claim file): 0 exact-boundary hits across
  all dated preregs + goal hidden_files + worktree copies; rejected
  candidates recorded in the claim file: 99701–99714 holdbeat,
  99721–99732 tbretreat-b, 99741–99752 tbretreat-b-confirm.
- Seed plans mirror the rescreen layout (3 waves / 1 forcedrift / rest
  wavesnw): 99761–99763 waves, 99764 forcedrift, 99765–99772 wavesnw.

## Substrate (r118 verbatim, do not retune)
Probe scripts/probe-toggle-confirm-trickoff-b-20261105.js =
probe-toggle-rescreen-20261105.js with ONLY the PLAN map changed to the
99761–99772 layout above (header comment records the diff; diff-verified).
The r118 probe defaults unknown seeds to the 'grey' plan, which would
break substrate parity, so the plan-map change is a tooling adaptation,
not a construction change. Capable + deedhunt + vetcommit + greedy
deferral defaults MAXTIER 4 / LASTDAY 145, armorydrive + fullseat-diag +
vetguard on waves seeds, 180d death-aware horizon. Env:
FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1
TELEMETRY_FULL=1 RELAYGREY=1. Per-seed corpora under
evidence/2026-11-05/perseed-toggle-confirm-trickoff-b/ following the
rescreen layout (vfull- / trickoff- prefixes, .json + -transcript.txt
per seed).

## Hunk map (reused verbatim from the rescreen prereg, verified from `git show d8f334da8`)
- TRICKHOLD — fieldFights.js, 1 hunk: known-trick hold only; the
  pre-existing trickLog hold is untouched (it is not in the commit).
- The constructor still knows all four levers for the alloff
  verification only (SIGDMG 3 hunks, GEAR 7 hunks + comment line,
  MORALE 1 hunk + comment line). No hunk maps to none or two levers.

## Variant construction (revert-from-pinned, never committed)
Script: scripts/apply-toggle-variant-20261104.py (unchanged, from
master). V-full = unmodified pinned tree. Variant game code is NEVER
committed; `restore` returns src/js to the pinned tree after the run.

## Judge (binding, decided by the coordinator per the rescreen metric review — judge BOTH class flips and trajectory movement; do NOT re-score to whichever moved)
- Primary: gross class flips vs same-base V-full on identical seeds.
  Class vocabulary: scattered / won-lesser (+ sat day) / survived-to-
  horizon (a village alive at the 180d horizon without sitting — NAME
  it, never lump under "other") / wave-5 reached (unlockedWave >= 5 OR
  satWaves.w5 > 0). Count flips GROSS — rescues and losses separately —
  with direction + mechanism traced per flip in the transcript.
- Trajectory: S2 (sat-day |Δ| >= 9) + S3 (wave-4 census kill swing >= 2
  or fight swing >= 3) per seed, same thresholds as the screen.
- GO (confirm) iff the screen signal reproduces: S1 (>=1 class flip)
  OR S3 (>=1 seed) fires on >=2 of 12 seeds, with every flip
  mechanism-traced.
- NO-GO iff the signal fires on <=1 of 12 seeds.
- S2 is recorded/descriptive, NOT deciding. Net wins alone NEVER judge
  (the screen showed net wins 0 with 3 flips — 2 rescues, 1 loss — and
  the lever is a live wire, not a knob). A miss is NO-GO, never re-scored
  against a friendlier metric mid-run. Every evidence file carries a
  "metric review" section.

## Staged design (judge against this header)
- STAGE 0 — determinism gate: (a) DET=1 byte-identical on seed 99761
  (probe's own det mode, two identical runs of the pinned tree);
  (b) V-full sweep on all 12 fresh seeds (pass 1 — the judged baseline).
  GATE (binding): both pass. On FAIL: STOP, report a determinism failure
  with the per-seed divergence table, do NOT judge, do NOT soften the
  gate, do NOT re-run on current master.
- STAGE 1 — confirm ONLY (12 runs): trickoff on the same 12 fresh seeds
  vs same-base V-full pass 1. Judge strictly against the judge above.
- STAGING DEVIATION (pre-registered, explicit — record it in the prereg
  and metric review): NO full V-full pass-2 repeat. Justification: the
  rescreen proved byte-identical repeat on this identical pinned base +
  probe (8 seeds, evidence/2026-11-05/sim-toggle-rescreen-b.md); DET
  re-verifies determinism on your band's first seed; a 12-seed pass 2
  would cost ~30 min and add no new information (determinism is a
  property of the code, not the seeds). Do not let this quietly become
  the staging.
- Total runs: 2 (DET) + 12 (pass 1) + 12 (variant) = 26. Budget ~70-80
  min. TIME: this run's window is tight — the tree registered late, so
  it starts behind the other two arms. If clearly going to overrun,
  commit what exists and report PARTIAL with NO verdict (a partial
  corpus is never judged, never re-scored). Do NOT rush the judge to
  fit the window. A clean partial that the next run can adopt is a good
  outcome; a rushed verdict is not.

## Sense-testing law
Sense-read at least one flipped or most-moved seed end to end
(transcript): meaning, coherence, relevance, consequences — never just
counts. For a NO-GO, sense-read the most-moved seed anyway to confirm
the mechanism is understood. Genuine out-of-arm findings go to
hidden_files/sim-findings.md in its format (do not chase them).

## Scale-wall numbers (report every run)
national / table / wins, wave 4–5 unlocks, median survival for the
judged corpora, in plain words too.

## Metric review (to be filled at closeout)
Pre-run note: the rescreen metric review asked the confirm to judge
BOTH class flips and trajectory movement — this prereg implements
exactly that (S1 + S3 deciding, S2 descriptive, net wins never the
judge). The classifier names 'survived' as its own class (endReason
'survived'), per the rescreen's note that 'other' undersells surviving
to the horizon. The staging deviation (no pass-2 repeat) is recorded
above; if DET passes and pass 1 completes cleanly, the deviation costs
nothing — but it must be named in the closeout, not silently adopted
as the new staging.
