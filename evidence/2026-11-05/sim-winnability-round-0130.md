# Toggle-confirm round 0130 — sigoff NO-GO landed, gearoff + trickoff stranded for adoption (Loop B, 2026-11-05/06)

Run: fleshout-loop-b-20261106T0130Z, axis scale-onramp / winnability chain.
Tracker blank (1) from the 0030Z run: a 12-seed confirm per toggle on its own
fresh band, judging BOTH class flips and trajectory movement (GO iff the
screen signal reproduces on >=2 of 12 seeds). Loop A live on food-economy
throughout (0028Z claim, arms sim-awaynaming-rereg-a + sim-enddaybeats-fix-a)
— NOT touched. No stale-lock recovery (no B lock existed at run start).
Pre-flight: main tree clean, disk 24%, reaper active 5/16, removed nothing
sibling-owned. Claim fleshout-loop-b-20261106T0130Z.json (retired to .DEAD
with a .note at closeout — see adoption notes below).

## Outcome: 1 arm LANDED, 2 arms STRANDED (not failed, not judged)
- sim-sigoff-confirm-b — LANDED as 978d7fda9 (rebased onto 3eea6b3ab clean,
  proof re-run green on the rebased tip). Verdict: **NO-GO**.
- sim-gearoff-confirm-b — STRANDED at closeout: Stage 0 complete and
  committed (tip 8874bb652), Stage 1 variant runs in progress in the
  worktree. No verdict. Adoption notes below.
- sim-trickoff-confirm-b — STRANDED at closeout: Stage 0 complete and
  committed (tip a79fd1dab), Stage 1 variant runs in progress in the
  worktree. No verdict. Adoption notes below.
The run ended at its time budget (registrations alone took ~25 min under
load; see infrastructure). The two stranded workers were sent a
stop-cleanly message (finish the in-flight seed, commit completed files,
report PARTIAL with NO verdict, restore to HEAD) — whether they acted on
it before the run ended is unknown; the adoption notes describe the
committed state, which is the safe point either way.

## Arm 1 — sigoff confirm: NO-GO (landed 978d7fda9)
Evidence: evidence/2026-11-05/sim-sigoff-confirm-b.md (+ prereg,
80-file corpus perseed-toggle-confirm-sigoff-b/, proof
scripts/test-toggle-confirm-sigoff-b-20261105.js). Pinned base ff1725835,
26 probe runs (2 DET + 12 V-full + 12 sigoff), all .err files empty.
- Stage 0 gate PASS: DET GREEN byte-identical on 99781; V-full pass 1
  integrity 12/12. No pass-2 repeat per the pre-registered staging
  deviation (rescreen proved byte-identical repeat on this identical
  pinned base + probe; DET re-verifies on the new band's first seed).
- Confirm bar: GO iff S1 (>=1 class flip) OR S3 (kill swing >=2 or fight
  swing >=3) fires on >=2 of 12 seeds; S2 descriptive only; net wins
  never judge. Result: signal fires on exactly **1 of 12** seeds — below
  the bar. S1 1/12, S2 1/12, S3 1/12, all three on the same seed (99785).
- The one moved seed, 99785: V-full WON FULL d90 (uw5) -> sigoff WON
  LESSER d124. Sat +34 (S2, descriptive). Kills 2->0, fights 6->9 (S3).
  Mechanism (census + killLog, sense-read PASS): V-full kills Strike d51
  and Algorithm d63 -> 2 living veterans -> releaseSnap d63 (rd5 ready)
  -> wave 5 unlocks -> Cancellation faced d71, Rerun d78 -> full seat
  d90. Sigoff meets the same monsters on nearly the same days but every
  wave-4 fight ends mFlee instead of vKill, the d69 Reunion fight ends
  vDie (Liam Steele falls), killLog EMPTY, peak veterans 0, releaseSnap
  null — the hold beat names it honestly: "The fifth draft stays in the
  wings — blood your fighters (0 of 2 veterans)." No wave-5 unlock, w5
  faced 0, lesser d124. The signature-damage lever decides whether
  wave-4 fights end in kills or in monsters getting away — and kills are
  the hard proof the readiness-5 door demands.
- The other 11 seeds: 10 class-, sat-, kill- and fight-identical; 99784
  moves fights 6->8 only (below the S3 bar of 3). Sigoff is inert on
  11/12 fresh seeds and costs one full seat on the twelfth.
- V-full baseline (12): full 1/12 (99785), lesser 3/12, survived 0/12,
  scattered 8/12, wave-4 unlocked 7/12, wave-5 reached 2/12 (99785,
  99790), median survival 90d.
- Sigoff (12): full 0/12, lesser 4/12, survived 0/12, scattered 8/12,
  wave-4 7/12, wave-5 1/12 (99790), median 90d.
- Baseline note, firsts on a confirm band: 99785 is the block's only
  full seat, and 99790's d78 Editor kill IS a wave-5 kill (feastedDay
  fights d78 "editor" vKill; satWaves w5:2) — the block's only wave-5
  kill, on a village that still sat lesser d90 with the door open.
  The winnability wall stands: wave-5 kills happen, but the village
  that makes one does not take the full seat.

## Wall (judged corpora, 24 configs: V-full 12 + sigoff 12)
Full seat 1/24, lesser 7/24, wave-5 reached 3/24 (99785, 99790 on V-full;
99790 on sigoff), wave-5 kills 1/24 (99790 Editor d78, baseline),
median survival 90d. In plain words: on this fresh block villages win
seats (one of them the full seat) and reach wave 5 twice on the pinned
game; turning the signature-damage lever off costs exactly one of those
— the full seat on 99785, which falls back to a lesser seat 34 days
later — and changes nothing else on any other seed. The binding
constraint on this block is still everything downstream of sitting: the
full seat exists but is fragile, resting on two wave-4 kills landing on
the right days, and one lever takes it away.

## Telemetry deviation check
Declared INAPPLICABLE, not run: same reason as toggle-b/togglepin-b and
the rescreen — the corpus is matched-seed classification, and the
endgame baseline is the same stale, regime-unrecorded file r118 already
flagged (its own text forbids pre-seat comparisons). Running the check
would manufacture LOUD lines against a baseline that does not describe
this regime. No compare is fabricated. §15 balanced panels do not apply
to this diagnostic: the instrument is the matched-seed classification
itself, and the prereg staged design governs.

## Adoption notes — gearoff + trickoff (for the next B run; do NOT re-run Stage 0)
- sim-gearoff-confirm-b: branch tip at closeout 8874bb652 (Stage 0: DET
  GREEN seed 99821 + V-full pass 1 baseline, 12 fresh seeds 99821–99832,
  lesser 5/12, wave-5 0/12, median 90d). Band 99821–99832 verified fresh
  (0 exact-boundary hits; stay clear of used 99801–99808). Plan map:
  99821–99823 waves, 99824 forcedrift, 99825–99832 wavesnw. Prereg
  committed beafc5018 (judge S1+S3 >=2/12, pinned base ff1725835, same
  staging deviation: no pass-2). Worktree at closeout held uncommitted
  mid-Stage-1 state (corpus files staged-as-deleted — the index-clobber
  class mid-run, or the pinned checkout; inspect before touching).
  The branch tip is the safe point. Judge on adoption: same prereg bar.
- sim-trickoff-confirm-b: branch tip at closeout a79fd1dab (Stage 0:
  V-full pass 1 baseline, 12 fresh seeds 99761–99772, lesser 5/12,
  wave-5 1/12 on 99761, median 95d; DET GREEN b4ca8e84c on seed 99761).
  Band 99761–99772 verified fresh (0 exact-boundary hits across all
  dated preregs + hidden_files + worktree copies). Plan map: 99761–99763
  waves, 99764 forcedrift, 99765–99772 wavesnw. Prereg committed
  916ec290c (judge S1+S3 >=2/12, pinned base ff1725835, staging
  deviation: no pass-2). Worktree at closeout held uncommitted
  mid-Stage-1 state (stage1 log + pinned-checkout diff vs HEAD; inspect
  before touching). The branch tip is the safe point. Judge on adoption:
  same prereg bar.
- Both trees heartbeated 04:12:40Z at closeout (fresh, workers alive).
  The workers may have been cancelled when this run ended; check for
  live processes + heartbeat freshness before adopting. If either worker
  committed a partial Stage 1 before cancellation, judge NOTHING on it —
  adopt the completed seeds, finish the rest, then judge the full 12.
- Rejected bands (recorded so nobody re-uses them): 99701–99714
  (99701–99708 holdbeat), 99721–99732 (99721–99728 tbretreat-b),
  99741–99752 (99742 tbretreat-b-confirm 99731–99742).

## Infrastructure
- Worktree registration took ~25 min for 3 trees under load (sigoff add
  ~7 min, gearoff ~4 min, trickoff ~12 min — its `git reset --hard`
  child ran 12+ min). Sibling lanes were landing throughout (master
  moved twice under the run: journey-social-life r144 fd2d0c5ef, Loop A
  awaynaming-rereg 3eea6b3ab). No EPERM flap this run.
- Safe-commit index clobber hit the sigoff worker on all three
  safe-commits (committed files showed staged-as-deleted); repaired every
  time via HEAD-blob cacheinfo and re-verified before continuing. The
  coordinator evidence commit (this file) — same check applied.
- Sigoff branch rebased once onto 3eea6b3ab clean; proof re-run green on
  the rebased tip (integrity 12/12 both prefixes; confirm NO-GO
  reproduces exactly: signal seeds 1 [99785] of 12). Merged --ff-only as
  978d7fda9. Tree released, branch deleted, main tree clean at closeout
  for this arm.
- Stray .lock files seen in .git/refs/heads/ during the run
  (flap-mimic.lock, flap-x.lock) — NOT this run's, left alone, no action.
- check.js --quick NOT re-run: zero src/js on master from this run;
  standing 280/7 profile recorded by the 1830Z run the same day (the
  1915Z Loop A run later recorded 280/10 — a separate lane's profile,
  not attributed here).

## Metric review (for the NEXT run, not this one)
- The confirm bar worked as designed (per the sigoff arm's metric
  review): judging BOTH flips and trajectory (gross, per-seed union)
  kept the verdict honest — net wins alone would have called this run a
  wash (4 wins each side), while the gross flip count (1 loss, 0
  rescues) plus the single-seed S3 are exactly what the bar measures.
  NO-GO is the correct call: one seed is a signal, not a reproduction.
- The rescreen's S3-only signal (99653: +4 fights, no flip) did not
  reproduce in kind: this band's only S3 seed carries a flip too. When
  sigoff moves, it moves class as well.
- The 'survived' class naming fired on 0 seeds this band, but the
  classifier + proof script now carry it — keep the vocabulary for the
  gearoff/trickoff confirms.
- The announce-window transcript limit (fork before d90 invisible in the
  transcript) is the same census-blindness the rescreen metric review
  named — carried, still unbuilt.

scale-onramp stays converging (NOT converged): sigoff's rescreen signal
does NOT reproduce — the lever is inert on 11/12 fresh seeds — but the
full seat is proven to exist on a fresh band and to rest on two wave-4
kills, and a wave-5 kill exists on the baseline without a full seat
following. Gearoff + trickoff confirms are still owed (stranded, see
adoption notes). Next blanks, in order: (1) adopt + finish the gearoff
and trickoff confirms on their committed Stage 0 baselines; (2) a lever
on the wild death channel for first killers; (3) flee-repair game-code
port — STEVE CALL on scope. food-economy stays converging (NOT
converged): untouched by this run. Claim retired to .DEAD with a .note;
lock deleted.
