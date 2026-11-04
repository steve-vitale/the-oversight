# Loop B 0445Z coordinator closeout — pinned-base toggle (arm sim-togglepin-b)

Run: fleshout-loop-b-20261104T0445Z, axis scale-onramp (winnability-chain
re-point, queue item 1 continuation). Loop A 0415Z live throughout on
fleerepair-adopt + tbobsfeed — NOT touched; its claim and trees left alone.
No B lock existed at start (previous B run dead); B lock + claim created
04:45Z, deleted at closeout.

## Worker result (branch sim-togglepin-b, evidence/scripts only, zero src/ diff)
Worker evidence: evidence/2026-11-04/togglepin-b.md + togglepin-b-prereg.md,
per-seed corpora evidence/2026-11-04/perseed-togglepin-b/ (30 probe runs),
proof script scripts/test-togglepin-b-20261104.js.

- Stage 0 determinism gate PASS: V-full on pinned base ff1725835 reproduces
  r118 on 7/7 seeds with sat days EXACT (89702 won lesser d99, 89705 won
  lesser d113 uw4, 89706 won lesser d102; 89701/89703/89704/89707 scattered).
  The 0330Z calibration failure was current-master drift, not construction
  error. V-alloff verified byte-equal to pre-arm2 blobs before any sim.
- MORALE (party-HP-pool) CREDITED, mixed direction: moraleoff flips 3/7 vs
  V-full — rescues 89701 (scattered → won lesser d95) and 89704 (scattered →
  won lesser d91), loses 89706 (won lesser d102 → scattered d48). Net wins
  4/7 vs V-full 3/7. Mechanism traced to first divergence per seed (low-wave
  party fights the wave-4 census never sees). This lever moves whole villages
  both ways; it is NOT a knob to turn up.
- SIGDMG, GEAR, TRICKHOLD: NON-ATTRIBUTED on pilot alone (0 class flips,
  fast kill, no full block per prereg). Not "no effect": sigoff moves 89705
  (sat 108 vs 113); gearoff/trickoff move sat days −9 to −23 and swing fight
  counts/kills heavily without changing pilot classes.
- V-alloff control: 2/7 class flips (rescues 89703, loses 89706) plus the
  arm's only wave-5 reach (89705, uw5, still lesser d90). Alloff ≠ moraleoff
  alone — interaction noted descriptively; no unregistered combos were run.

## Scale-wall numbers (7-seed blocks, pinned base)
- V-full: lesser 3/7, full seat 0/7, national-or-better 0/7, wave-4 4/7,
  wave-5 0/7, median survival 90d.
- Moraleoff: lesser 4/7, full 0/7, wave-4 4/7, wave-5 0/7, median 90d.
- V-alloff: lesser 3/7, full 0/7, wave-4 5/7, wave-5 1/7, median 90d.
- In plain words: villages still win lesser seats and never the full seat,
  with or without arm 2, on this block.

## Coordinator verification (independent of the worker's report)
- Sibling landed first: master had moved to 1f4b4f9ca (Loop A 0415Z
  coordinator evidence) after the worker branched. Rebases clean (no file
  overlap — A's commit touched only sim-scale-onramp-round-0415.md).
- Proof re-run after rebase, green: sanity 3/3 (89702 d99, 89704 scattered,
  89705 d113), moraleoff flips 3/7, valloff flips 2/7 + wave-5 on 89705 —
  matching the worker's verdicts exactly.
- Game tree restored: `git diff HEAD -- src/ index.html scripts/` empty,
  worktree status empty at handoff.

## Telemetry deviation check
Worker declared INAPPLICABLE (same reason as toggle-b): matched-seed
classification corpus, stale regime-unrecorded endgame baseline whose own
text forbids pre-seat comparisons. Coordinator concurs; no compare
fabricated, baseline NOT rolled. (Loop A 0415Z's corpora got a recorder-shape
REFUSAL on the same check — same class, not a deviation.)

## Infrastructure
- Registration slow (~11 min wall: internal reap + 60k-file/7.2G worktree
  checkout; the `git reset --hard` child was progressing throughout, not
  wedged — file count grew 60,551 → 62,849 while watched).
- Safe-commit index-clobber phantoms hit the worker's Stage 0 and Stage 1
  commits; repaired via HEAD-blob cacheinfo, commits verified correct.
- No EPERM flap blocked this run. check.js --quick NOT re-run (zero src/
  diff; proof script green on merged base).

## Next blanks (this run's, named NOT run)
(a) Re-screen sigoff / gearoff / trickoff on a fresh seed set — pilot
non-attribution covers only 89702/89704/89705 classes and gearoff/trickoff
already move trajectories heavily. (b) A design look at the party
hopeless/winning judgment itself — what a party should read as hopeless,
and what fleeing should cost — before any morale re-tuning, since the
lever's direction is seed-dependent. Do NOT run unregistered pairwise
combos on this arm's authority; a combo run needs its own prereg.
Loop A 0415Z's next-blanks list stands alongside (fleerepair confirm,
playable signature verb, STAYING second half, Rage gate + pocket_sand
flee-order fix, hold-beat veteran timing, readiness-5 release-after-ready).

Merged locally, pending ship (no push, no bump, no live verification —
ship loop owns deploys).
