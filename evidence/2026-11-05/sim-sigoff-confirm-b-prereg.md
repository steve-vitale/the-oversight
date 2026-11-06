# Sigoff-confirm-b prereg — confirm the SIGDMG toggle on FRESH seeds 99781–99792 (Loop B, run fleshout-loop-b-20261106T0130Z)

## Question
Does the sigoff screen signal reproduce on fresh seeds? The 0030Z rescreen
(evidence/2026-11-05/sim-toggle-rescreen-b.md + prereg
sim-toggle-rescreen-b-prereg.md) found sigoff GO-CANDIDATE on S3 only:
0 class flips, 0 sat-day moves >=9, but seed 99653's wave-4 census fights
swung 9 → 13 (+4). This arm confirms or kills that signal on a fresh
12-seed band. Sibling confirms (gearoff 99821–99832, trickoff 99761–99772)
run on their own bands under the same coordinator claim; never duplicate.

## Pinned-base method (game code is NEVER committed)
- Pinned base: master commit ff1725835 (arm-2 commit d8f334da8 is an
  ancestor, so arm 2 is ON in V-full). Branch starts at current master
  (98c68bf5e). For sims, check out the pinned game tree into the worktree:
  `git checkout ff1725835 -- src index.html scripts`, then copy the toggle
  tooling scripts back from master
  (`git show master:scripts/<name> > scripts/<name>`).
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

## Fresh seed band 99781–99792 (12 seeds)
Freshness check (local_seed_band_freshness skill, re-verified by this
worker before any sim — not taken on the coordinator's word alone):
- Searched ALL dated preregs (`evidence/*/sim-*-prereg.md`, ripgrep
  file-list mode, exact-word `-w` per seed + range pattern `9978[1-9]|
  9979[0-2]`): 0 hits for any of 99781–99792 in any prereg.
- Searched all `*.md` under evidence/ + goal hidden_files/ with exact-word
  `-w` per seed: 0 hits.
- Named bands nearby (do NOT cover this band): 99701–99708 holdbeat,
  99711–99718 vetrest pilot, 99721–99728 tbretreat-b, 99731–99742
  tbretreat-b-confirm. Sibling confirm bands 99761–99772 (trickoff) and
  99821–99832 (gearoff) do not overlap. Rejected candidates recorded in
  the coordinator claim file (fleshout-loop-b-20261106T0130Z.json):
  99701–99714 holdbeat, 99721–99732 tbretreat-b, 99741–99752
  tbretreat-b-confirm.
- Forbidden/contaminated lists named in preregs: 99009–99024 (belongzombie),
  99401–99412 (tendfloor). Clear.
- Data-value hits only: `9978x`/`9979x` numbers occur inside JSON corpora
  (pantry kcal, hashes, panel case values) — values, not seed namings, per
  the tbretreat-b prereg's food-quantity precedent. Not a collision.
- Seed plans mirror the rescreen layout (3 waves / 1 forcedrift / rest
  wavesnw): 99781–99783 waves, 99784 forcedrift, 99785–99792 wavesnw.

## Substrate (r118 verbatim, do not retune)
Probe scripts/probe-toggle-confirm-sigoff-b-20261105.js =
probe-toggle-rescreen-20261105.js with ONLY the PLAN map changed to the
99781–99792 layout above (header comment records the diff; diff-verified).
Capable + deedhunt + vetcommit + greedy deferral defaults MAXTIER 4 /
LASTDAY 145, armorydrive + fullseat-diag + vetguard on waves seeds,
180d death-aware horizon. Env for every sweep: FULLSEAT=1 VETCOMMIT=1
CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1
RELAYGREY=1; SEEDS env set explicitly on every invocation. Per-seed
corpora under evidence/2026-11-05/perseed-toggle-confirm-sigoff-b/
following the rescreen layout (vfull- / sigoff- prefixes, .json +
-transcript.txt per seed).

## Hunk map (reused verbatim from rescreen prereg, verified from `git show d8f334da8`)
- SIGDMG — sigW4.js, 3 hunks covering 5 changes.
- (Constructor still knows GEAR 7 hunks + comment line, MORALE 1 hunk +
  comment line, TRICKHOLD 1 hunk — for the alloff verification only;
  only sigoff is screened here.)
No hunk maps to none or two levers.

## Variant construction (revert-from-pinned, never committed)
Script: scripts/apply-toggle-variant-20261104.py (unchanged, from
master). V-full = unmodified pinned tree. Variant game code is NEVER
committed; `restore` returns src/js to the pinned tree after the run.

## Class vocabulary (binding)
scattered / won-lesser (+ sat day) / won-full (+ sat day) /
survived-to-horizon (a village alive at the 180d horizon without sitting —
NAME it, never lump under "other") / wave-5 reached (unlockedWave >= 5 OR
satWaves.w5 > 0). Class is read from the probe JSON: satDay + satSeatKind
→ won-<seat>; endReason 'survived' → survived-to-horizon; endReason
'village-lost' → scattered; otherwise 'other'. The classifier + proof
script carry this vocabulary (the rescreen classifier lumped 'survived'
under 'other'; this confirm's copies name it, grounded in the probe's own
endReason values — rescreen corpus: 'village-lost', 'survived' d181,
'over-other' with satDay+seat).

## Judge (binding, decided by the coordinator per the rescreen metric review — judge BOTH class flips and trajectory movement; do NOT re-score to whichever moved)
- Primary: gross class flips vs same-base V-full on identical seeds.
  Count flips GROSS — rescues and losses separately — with direction +
  mechanism traced per flip in the transcript.
- Trajectory: S2 (sat-day |Δ| >= 9) + S3 (wave-4 census kill swing >= 2
  or fight swing >= 3) per seed, same thresholds as the screen.
- GO (confirm) iff the screen signal reproduces: S1 (>=1 class flip) OR
  S3 (>=1 seed) fires on >=2 of 12 seeds, with every flip
  mechanism-traced.
- NO-GO iff the signal fires on <=1 of 12 seeds.
- S2 is recorded/descriptive, NOT deciding. Net wins alone NEVER judge
  (the screen showed net wins 0 with a real trajectory effect). A miss
  is NO-GO, never re-scored against a friendlier metric mid-run. Every
  evidence file carries a "metric review" section.

## Staged design (judge against this header)
- STAGE 0 — determinism gate: (a) DET=1 byte-identical on seed 99781
  (probe's own det mode, two identical runs of the pinned tree); (b)
  V-full sweep on all 12 fresh seeds (pass 1 — the judged baseline).
  GATE (binding): both pass. On FAIL: STOP, report a determinism failure
  with the per-seed divergence table, do NOT judge, do NOT soften the
  gate, do NOT re-run on current master.
- STAGE 1 — confirm ONLY (12 runs): sigoff on the same 12 fresh seeds
  vs same-base V-full pass 1. Judge strictly against the judge above.
- Total runs: 2 (DET) + 12 (pass 1) + 12 (variant) = 26. Budget ~70–80 min.
  TIME: this run's window is tight — if clearly going to overrun, commit
  what exists and report PARTIAL with NO verdict (a partial corpus is
  never judged, never re-scored). Do NOT rush the judge to fit the window.

## Staging deviation (pre-registered, explicit — record it in the prereg and metric review)
NO full V-full pass-2 repeat. Justification: the rescreen proved
byte-identical repeat on this identical pinned base + probe (8 seeds,
evidence/2026-11-05/sim-toggle-rescreen-b.md); DET re-verifies
determinism on this band's first seed; a 12-seed pass 2 would cost
~30 min and add no new information (determinism is a property of the
code, not the seeds). Do not let this quietly become the staging.

## Sense-testing law
Sense-read at least one flipped or most-moved seed end to end
(transcript): meaning, coherence, relevance, consequences — never just
counts. For a NO-GO, sense-read the most-moved seed anyway to confirm
the mechanism is understood. Genuine out-of-arm findings go to
hidden_files/sim-findings.md in its format (do not chase them).

## Scale-wall numbers (report every run)
national / table / wins, wave 4–5 unlocks, median survival for the
judged corpora (per-seed files carry these; block tallies in plain
words too).

## Metric review (to be filled at closeout)
To be filled at closeout. Pre-run note: the rescreen metric review
asked the confirm prereg to decide whether it judges class flips,
trajectory movement, or both — this prereg decides BOTH, with the GO bar
(S1 or S3 on >=2/12) fixed above. The 'survived' class is named here
because the rescreen classifier undersold it as 'other'; the confirm
classifier + proof script name it from the probe's own endReason.
