# sim-geartier P4 fresh-seed re-run — DECLARATION (committed BEFORE any fresh-seed run)

Arm: build-abilities (Steve 2026-10-29: "Address all gaps. Build it.",
abilities follow-ups, measurement refresh only, no game retunes).
Parent job: the geartier-a abilities pass landed thin at 0d0e23d05
(bird/broadcast/mending GO, snare NO-GO killed). The pass report
(evidence/2026-10-29/sim-geartier-a.md, Metric review) says bird
passed by 0.53 points and broadcast by 0.17 points — within seed
noise — and recommends a fresh-seed re-run before anyone cites the
pass as strong. This note is that re-run's binding declaration.

## What is NOT changing

No ability numbers, costs, gates, or game code change in this arm.
This is a measurement refresh. If the re-run overturns a prior GO
(a margin flips), that is a finding to report with its numbers —
the old verdict is NOT quietly re-scored, and NO game change lands
on the back of it without a fresh prereg (that would be next-run
work). Gating freeze stands. Perception law stands. Six System
slots, food-powered abilities: untouched.

## Instrument

scripts/test-geartier-a.js (same script, same prereg shapes), with
one added instrument option, default-preserving: env
GEARTIER_SEED_BASE (fight-RNG base, default 9100 = the original
run) and GEARTIER_LOAD_SEED (loadGame world seed, default 75106
= the original run). The original numbers must reproduce exactly
under the defaults on the current tree before any fresh-seed run
is judged; if they do not, that drift is reported first and the
fresh run is not judged until the drift is explained.

## Fresh seeds (declared here, before any fresh-seed run)

- Fight-RNG base: 37100 (original: 9100). Fight seed per cell is
  still base + s*131 + beast.hp, s = 0..4, beasts 850/1100 — 5
  paired seeds x 2 beasts = 10 cells per arm, exactly the
  original shape.
- World seed: 85217 (original: 75106). New villages, new rosters;
  kit, HP, ally shapes, and ability assignments are script-fixed,
  so the shapes hold while the people differ.
- Cells run, post-change code (current tree): control,
  control-aid, control-aid-hurt, bird, broadcast, mending.
- Cells run, pre-change code (godpath.js + fieldFights.js at
  0d0e23d05^, the pass parent — verified: NOTHING else touched
  those two files between the pass and this tree's HEAD, so the
  parent versions are exactly pre-pass code): bird, broadcast,
  mending, plus control cells as a no-change check (the pass
  must not move the bare kit: fresh pre-control must equal
  fresh post-control).
- The pre-code run is a temporary worktree file swap for
  measurement only, restored immediately after, with `git diff`
  verified empty before any commit. No pre-code file is ever
  committed.

## Bars (frozen from sim-geartier-a-prereg.md P4, judged per ability
on the FRESH seeds, post-vs-pre on the same fresh seeds)

- >= 2 of 3 improve on their named metric AND none regresses
  mDealt by > 10% vs its own pre-change fresh-seed cell.
  - bird (shout-join shape): taken/R median down >= 10%.
  - broadcast (aid shape, ally from round 1): allyDealt mean
    up >= 25% or median rounds up >= 1.
  - mending (aid shape, leader entering at 55 HP): allyHpLeft
    median up or median rounds up >= 1.
- The original-seed margins (bird -10.53% vs bar -10%;
  broadcast +25.17% vs bar +25%; mending 52 -> 58) are the
  comparison point, not the bar: the re-run reports its own
  fresh-seed margins plainly, and whether bird/broadcast still
  stand on fresh seeds.

## Companion job (same arm, separate leg)

Proof-refresh via scripts/balance-proof-update.js with a REAL
neutral panel built from the current tree through
scripts/balance-panel.js — never a hand edit of proof outputs.
That leg is reported alongside, but it does not touch P4 bars.

## Files

- This declaration: evidence/2026-10-29/sim-geartier-p4-rerun-prereg.md
- Reproduction (defaults): evidence/2026-10-29/geartier-p4-rerun-repro.json
- Fresh post: evidence/2026-10-29/geartier-p4-rerun-fresh-post.json
- Fresh pre: evidence/2026-10-29/geartier-p4-rerun-fresh-pre.json
- Results note: evidence/2026-10-29/sim-geartier-p4-rerun.md
