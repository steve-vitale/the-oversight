# Toggle-b prereg — arm-2 sub-lever attribution (Loop B, run fleshout-loop-b-20261104T0330Z)

## Question
Which winnability-push arm-2 sub-lever — sigW4 double-damage removal,
ally gear parity, party morale, or known-trick hold — caused each flip
on the journey-endgame r118 matched block, where five of seven seeds
changed outcome class or sat day and the block's only wave-5 unlock
vanished?

## Primary metric (binding)
Per-seed outcome class (scattered / won-lesser (+ sat day) / wave-5
reached) on matched seeds 89701–89707. A variant FLIPS a seed iff its
outcome class differs from V-full on that seed. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. Secondary (descriptive
only): sat-day deltas, kill counts, standing peaks, wave-5 reach, and
the 89704 control-flip mechanism sketch.

Outcome class rules (classifier: scripts/classify-toggle-b-20261104.js):
- satDay set + satSeatKind → `won-<seat>` (lesser expected here).
- endReason village-lost, no sat → `scattered`.
- wave-5 reached iff veterans.unlockedWave >= 5 OR satWaves.w5 > 0.

## Reference classes
r118 (V-full target): 89701 scattered, 89702 won lesser (sat d99),
89703 scattered, 89704 scattered (control), 89705 won lesser (sat
d113, uw4), 89706 won lesser (sat d102), 89707 scattered.
r110 (V-alloff target): 89701 scattered, 89702 won lesser (sat d92),
89703 scattered (d152 grind), 89704 won lesser (d90), 89705 won lesser
(sat d120, uw5 faced), 89706 scattered (d34), 89707 scattered.

## Hunk map (verified from `git show d8f334da8`, no unmapped hunks)
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
No hunk maps to none or two of the four. No variant is DRIFT-BLOCKED:
every revert applies cleanly, and V-alloff reproduces the pre-arm2
blobs byte-for-byte (`git diff d8f334da8^ -- src/js/` empty after
alloff; verified before any sim).

## Variant construction (revert-from-current, never committed)
Base = current master at registration (arm 2 fully ON).
Script: scripts/apply-toggle-variant-20261104.py — parses the commit
diff, classifies each hunk, reverts the lever's subset with
`git apply -R`, deletes that lever's header comment line. V-full =
unmodified master. V-alloff = all four reverted (control). Variant
game code is NEVER committed; `restore` returns src/js to HEAD
before finishing, so the branch holds evidence/scripts only.

## Substrate (r118 verbatim, do not retune)
Probe scripts/probe-toggle-b-20261104.js = r118 probe with only
OUTDIR/PREFIX env params changed (diff: 18 lines, header comment +
4 mechanical lines). capable + deedhunt + vetcommit + greedy
deferral defaults MAXTIER 4 / LASTDAY 145, armorydrive +
fullseat-diag + vetguard on waves seeds, 180d death-aware.
Env: FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1
CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1. Seeds: 89701–89703
waves, 89704 forcedrift control, 89705–89707 wavesnw.

## Staged design (judge against this header)
- STAGE 0 — calibration gate (6 runs): V-full + V-alloff on pilot
  seeds 89702, 89704, 89705. GATE: V-full matches r118 class on
  ≥2/3 AND V-alloff matches r110 class on ≥2/3. On FAIL: STOP,
  report calibration failure with the per-seed divergence table;
  do not judge attribution; do not spend Stage 1/2.
- STAGE 1 — toggle screen (12 runs): four single-OFF variants on
  the same 3 pilot seeds. A variant ADVANCES iff it flips ≥1 pilot
  seed vs V-full. 0-flip variants are NON-ATTRIBUTED on pilot alone
  (fast kill — no full block).
- STAGE 2 — full block (7 seeds each): V-full remainder (4 seeds),
  V-alloff remainder (4 seeds), each advancing variant (7 seeds).
  Priority if the clock presses: V-full remainder, V-alloff
  remainder, then advancing variants by pilot flip count desc.
- Attribution verdict per advancing variant (full block): CREDITED
  with a current-master behavior iff it flips ≥1 full-block seed
  vs V-full where V-full's class matches r118's class for that
  seed. Otherwise DESCRIPTIVE. If NO single-OFF variant flips any
  seed at pilot: INTERACTION + name the pairwise-combo run as the
  next blank; do NOT run unregistered combos in this arm.
- Commit per-seed outputs INCREMENTALLY after each stage.

## Sense-testing law
For each advancing variant, sense-read at least one flipped seed end
to end (transcript): meaning, coherence, relevance, consequences —
never just counts. Genuine out-of-arm findings go to
hidden_files/sim-findings.md in its format (do not chase them).

## Scale-wall numbers (report every run)
national / table / wins, wave 4–5 unlocks, median survival for the
judged corpora (per-seed files carry these; block tallies in plain
words too).

## Metric review (for the NEXT run, not this one)
To be filled at closeout. Pre-run note: the r118 analyzer's
standing-peak derivation is not re-run here; standing peaks are
reported descriptively from per-seed traces only if cleanly readable,
not fabricated from a re-derived formula.
