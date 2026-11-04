# Togglepin-b prereg — arm-2 sub-lever attribution, PINNED at r118's base (Loop B, run fleshout-loop-b-20261104T2230Z)

## Question
Which winnability-push arm-2 sub-lever — sigW4 double-damage removal,
ally gear parity, party morale, or known-trick hold — caused each flip
on the journey-endgame r118 matched block, where five of seven seeds
changed outcome class or sat day and the block's only wave-5 unlock
vanished? This run re-registers the toggle PINNED at r118's exact base
after the 0330Z toggle-b run stopped at Stage 0 with a calibration
failure on current master (V-full 3/3 vs r118, V-alloff only 1/3 vs
r110). Base drift, not a construction error.

## Pinned-base method (game code is NEVER committed)
- Pinned base: master commit ff1725835, the base r118 ran on. Verified
  before any sim: arm-2 commit d8f334da8 IS an ancestor of ff1725835,
  so the pinned base already has arm 2 ON. V-full = the pinned game
  tree, unmodified.
- Branch starts at current master (for evidence/scripts commits). For
  sims, the pinned game tree is checked out into the worktree:
  `git checkout ff1725835 -- src index.html scripts`, then the three
  toggle tooling scripts are copied back from master
  (`git show master:scripts/<name> > scripts/<name>`) since they
  postdate the base. If the pinned harness cannot run the toggle
  probe, that is reported loudly and ONLY tooling is adapted
  (committed as scripts), never game code.
- Variant construction BEFORE any sim: after reverting all four
  levers, `git diff d8f334da8^ -- src/js/` must be empty (V-alloff
  byte-equal to pre-arm2 blobs). If not, STOP and report a
  construction failure.
- Before finishing, src/ + index.html (+ scripts/) are restored to
  HEAD so the branch holds evidence/scripts ONLY; verified with
  `git diff HEAD -- src/ index.html` empty and `git status --short`
  showing only intended files. Uncommitted leftovers = FAIL LOUDLY.

## Primary metric (binding)
Per-seed outcome class on matched seeds 89701–89707: scattered /
won-lesser (+ sat day) / wave-5 reached iff veterans.unlockedWave
>= 5 OR satWaves.w5 > 0. A variant FLIPS a seed iff its class
differs from same-base V-full on that seed. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. Secondary
(descriptive only): sat-day deltas, kill counts, standing peaks,
wave-5 reach. Every evidence file carries a "metric review" section.

Outcome class rules (classifier: scripts/classify-toggle-b-20261104.js,
copied back from master with the other tooling):
- satDay set + satSeatKind → `won-<seat>` (lesser expected here).
- endReason village-lost, no sat → `scattered`.
- wave-5 reached iff veterans.unlockedWave >= 5 OR satWaves.w5 > 0.

## Reference classes
r118 (V-full target, on the pinned base): 89701 scattered, 89702 won
lesser (sat d99), 89703 scattered, 89704 scattered (control), 89705
won lesser (sat d113, uw4), 89706 won lesser (sat d102), 89707
scattered.
r110 (V-alloff target on ITS OWN base): NOT a calibration target
here. r110's base is gone; toggle-b's metric review already ruled
that a historical block cannot calibrate a later base, and the
pinned base ff1725835 already contains landings after r110. V-alloff
on the pinned base is the same-base control record only — its
classes are reported descriptively, never judged against r110.

## Hunk map (reused verbatim from toggle-b prereg, verified from
`git show d8f334da8`, no unmapped hunks)
- SIGDMG — sigW4.js, 3 hunks covering 5 changes: congregation argue
  (total=0) + beam narrate-only (combined hunk), suburb narrate-only,
  algorithm narrate-only + eater growth-only (combined hunk).
- GEAR — fieldFights.js, 7 hunks + header comment line: allyGear
  function, both call sites, ally strike formula (+ broadcast),
  ally armor absorb (+ its comment line).
- MORALE — fieldFights.js, 1 hunk + header comment line: rtd
  party-HP-pool only.
- TRICKHOLD — fieldFights.js, 1 hunk: known-trick hold only; the
  pre-existing trickLog hold is untouched (it is not in the commit).
No hunk maps to none or two of the four. No variant is DRIFT-BLOCKED
on the pinned base unless the pre-sim construction check says so.

## Variant construction (revert-from-pinned, never committed)
Script: scripts/apply-toggle-variant-20261104.py — parses the commit
diff, classifies each hunk, reverts the lever's subset with
`git apply -R`, deletes that lever's header comment line. V-full =
unmodified pinned tree. V-alloff = all four reverted (control).
Variant game code is NEVER committed; `restore` returns src/js to
the pinned tree after each variant's run, and the final restore
returns src/ + index.html to HEAD before finishing.

## Substrate (r118 verbatim, do not retune)
Probe scripts/probe-toggle-b-20261104.js = r118 probe with only
OUTDIR/PREFIX env params changed (toggle-b diff: 18 lines, header
comment + 4 mechanical lines). capable + deedhunt + vetcommit +
greedy deferral defaults MAXTIER 4 / LASTDAY 145, armorydrive +
fullseat-diag + vetguard on waves seeds, 180d death-aware horizon.
Env: FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1
CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1. Seeds: 89701–89703
waves, 89704 forcedrift control, 89705–89707 wavesnw.
Per-seed corpora under evidence/2026-11-04/perseed-togglepin-b/
following the toggle-b layout (vfull-, valloff-, sigoff-, gearoff-,
moraleoff-, trickoff- prefixes, .json + -transcript.txt per seed).

## Staged design (judge against this header)
- STAGE 0 — determinism/calibration gate (6 runs): V-full AND
  V-alloff on the pinned base on pilot seeds 89702, 89704, 89705.
  GATE (binding): V-full reproduces r118 outcome class on ≥2/3
  pilot seeds (expect 3/3 with sat days close; report sat-day
  deltas as drift signal). V-alloff's pilot classes are recorded
  as the same-base control, NOT gated against r110. On V-full gate
  FAIL: STOP, report a determinism/calibration failure with the
  per-seed divergence table, do NOT judge attribution, do NOT
  soften the gate, do NOT re-run on current master.
- STAGE 1 — toggle screen (12 runs): four single-OFF variants on
  the same 3 pilot seeds. A variant ADVANCES iff it flips ≥1 pilot
  seed vs same-base V-full. 0-flip variants are NON-ATTRIBUTED on
  pilot alone (fast kill — no full block).
- STAGE 2 — full block (7 seeds each): V-full remainder (4 seeds),
  V-alloff remainder (4 seeds), each advancing variant (7 seeds).
  Priority if the clock presses: V-full remainder, V-alloff
  remainder, then advancing variants by pilot flip count desc.
- Attribution verdict per advancing variant (full block, pinned-base
  taxonomy adapted from toggle-b): CREDITED with a pinned-base
  behavior iff it flips ≥1 full-block seed vs V-full where V-full's
  class matches r118's class for that seed. Otherwise DESCRIPTIVE.
  If NO single-OFF variant flips any seed at pilot: INTERACTION +
  name the pairwise-combo run as the next blank; do NOT run
  unregistered combos in this arm.
- Commit per-seed outputs INCREMENTALLY after each stage.

## Sense-testing law
For each advancing variant, sense-read at least one flipped seed
end to end (transcript): meaning, coherence, relevance,
consequences — never just counts. Genuine out-of-arm findings go
to hidden_files/sim-findings.md in its format (do not chase them).

## Scale-wall numbers (report every run)
national / table / wins, wave 4–5 unlocks, median survival for the
judged corpora (per-seed files carry these; block tallies in plain
words too).

## Metric review (for the NEXT run, not this one)
To be filled at closeout. Pre-run note: the Stage 0 gate here is
deliberately one-sided (V-full vs r118 only) because the pinned
base makes V-full's r118 reproduction a determinism check, while
any r110 comparison for V-alloff is void on a base that already
contains post-r110 landings. If V-full reproduces r118 3/3, the
determinism check also validates that the pinned checkout +
tooling-copy method reproduces r118's instrument.
