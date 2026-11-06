# Sigoff-confirm-b — confirm the SIGDMG toggle on FRESH seeds 99781–99792 (Loop B, 2026-11-05/06)

Run: fleshout-loop-b-20261106T0130Z, arm sim-sigoff-confirm-b. Prereg:
evidence/2026-11-05/sim-sigoff-confirm-b-prereg.md (committed b5704aff3)
— it binds this run; the band was NOT re-picked and the judge was NOT
re-scored. 26 probe runs total: 2 DET + 12 V-full (pass 1) + 12 sigoff.
All probe .err files empty.

## Verdict (prereg-gated, not re-scored): NO-GO
The rescreen signal does NOT reproduce on fresh seeds. The signal fires on
exactly 1 of 12 seeds (99785: full → lesser flip, S3 kill/fight swings),
below the confirm bar of >=2. S1 flips 1/12, S2 1/12 (descriptive only),
S3 1/12 — all three on the same single seed. The other 11 seeds: 10 are
class-, sat-, kill- and fight-identical; 99784 moves fights 6 → 8 only
(below the S3 bar of 3). Sigoff leaves no trace on this band: the lever
is inert on 11/12 fresh seeds and costs one full seat on the twelfth.
Per the prereg judge, a miss is NO-GO, never re-scored against a
friendlier metric mid-run. Net wins alone would misread this run (4 wins
on both sides: V-full 3 lesser + 1 full, sigoff 4 lesser) — the gross
flip is what matters, and there is exactly one.

## Pinned-base method (as prereg)
- Pinned base ff1725835 (arm-2 d8f334da8 verified an ancestor, so arm 2 is
  ON in V-full). Branch sim-sigoff-confirm-b holds evidence/scripts only;
  game code was never committed.
- Pinned checkout: `git checkout ff1725835 -- src index.html scripts`,
  then the variant constructor copied back from master
  (apply-toggle-variant-20261104.py). The three confirm scripts are new
  files (not in the base) and were diff-verified unchanged vs HEAD after
  the checkout.
- Post-base src/js files (villager-goals.js, win-plan.js) removed from
  worktree + index for the sim phase; final restore returns them from HEAD.
- Alloff construction check (before any sim): V-alloff verified byte-equal
  to pre-arm2 blobs (`verify-alloff` PASS — sigoff 3 hunks, gearoff 7,
  moraleoff 1, trickoff 1, both header comment lines deleted). Restored
  to the pinned tree after the check (`git diff --quiet -- src/js/` clean).
- Probe: scripts/probe-toggle-confirm-sigoff-b-20261105.js =
  probe-toggle-rescreen-20261105.js with ONLY the PLAN map changed to
  99781–99783 waves / 99784 forcedrift / 99785–99792 wavesnw
  (diff-verified: header comment + PLAN const + its two comment lines
  only). Classifier + proof script are seeds-parameterized copies of the
  rescreen pair (default seeds 99781–99792) PLUS the 'survived' class
  named (endReason 'survived' = survived-to-horizon, per prereg) and a
  `confirm` mode judging the prereg bar. Env for every sweep:
  FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1
  TELEMETRY_FULL=1 RELAYGREY=1; 180d death-aware horizon; SEEDS env set
  explicitly on every invocation.
- Seed-band freshness re-verified by this worker before any sim (0 hits
  for any of 99781–99792 in any dated prereg or any *.md under evidence/
  + goal hidden_files/; nearest named bands 99731–99742, 99721–99728,
  99711–99718 do not cover it; data-value hits inside JSON corpora are
  values, not seed namings, per the tbretreat-b precedent).
- Staging deviation (pre-registered): NO full V-full pass-2 repeat —
  rescreen proved byte-identical repeat on this identical pinned base +
  probe (8 seeds); DET re-verifies determinism on this band's first seed.

## Stage 0 — determinism gate: PASS
- (a) DET=1 on seed 99781 (2 x 120d of the pinned tree): DET GREEN
  byte-identical. Log: evidence/2026-11-05/stage0-det-sigoff-confirm-b.log
  (err empty, 0 bytes). DET writes no per-seed files (in-memory compare).
- (b) V-full pass 1 on all 12 fresh seeds: integrity 12/12. No pass 2
  per the pre-registered staging deviation.

### V-full full block (12 fresh seeds, the judged baseline — pass 1)
| seed | plan | class | sat | uw | fights | kills | vDie | days | end scale |
|---|---|---|---|---|---|---|---|---|---|
| 99781 | waves | won lesser | d90 | 4 | 4 | 0 | 0 | 90 | global |
| 99782 | waves | scattered | — | 3 | 0 | 0 | 0 | 31 | village |
| 99783 | waves | scattered | — | 4 | 2 | 0 | 0 | 96 | regional |
| 99784 | forcedrift | won lesser | d90 | 4 | 6 | 4 | 2 | 90 | global |
| 99785 | wavesnw | won FULL | d90 | 5 | 6 | 2 | 0 | 90 | global |
| 99786 | wavesnw | scattered | — | 2 | 0 | 0 | 0 | 28 | village |
| 99787 | wavesnw | scattered | — | 4 | 12 | 3 | 3 | 156 | regional |
| 99788 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 29 | village |
| 99789 | wavesnw | scattered | — | 4 | 0 | 0 | 0 | 46 | village |
| 99790 | wavesnw | won lesser | d90 | 5 | 5 | 4 | 1 | 90 | global |
| 99791 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 28 | village |
| 99792 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 104 | regional |
Tally: full 1/12, lesser 3/12, survived-to-horizon 0/12, scattered 8/12,
wave-4 unlocked (uw>=4) 7/12, wave-5 reached 2/12 (99785, 99790), median
survival 90d (sorted days 28/28/29/31/46/90/90/90/90/96/104/156; classifier
upper-median 90d). Note 99785: the block's only full seat — releaseSnap
d63 (2 living veterans, rd5 ready), Cancellation faced d71, Rerun d78,
w5 faced 2. Note 99790: lesser d90 with wave 5 unlocked (releaseSnap d71,
2 living veterans) and a wave-5 Editor kill d78 — the village sat lesser
with the door open.

## Stage 1 — sigoff confirm (12 runs vs V-full pass 1)
Flip = outcome class differs from same-base V-full. Confirm bar: GO iff
S1 (>=1 class flip) OR S3 (wave-4 census kill swing >=2 or fight swing
>=3) fires on >=2 of 12 seeds. S2 descriptive only.

### sigoff (SIGDMG) — NO-GO (signal seeds 1/12)
| seed | V-full | sigoff | flip? | sat Δ | kills | fights |
|---|---|---|---|---|---|---|
| 99781 | won lesser d90 | won lesser d90 | no | 0 | 0→0 | 4→4 |
| 99782 | scattered d31 | scattered d31 | no | — | 0→0 | 0→0 |
| 99783 | scattered d96 | scattered d96 | no | — | 0→0 | 2→2 |
| 99784 | won lesser d90 | won lesser d90 | no | 0 | 4→4 | 6→8 |
| 99785 | WON FULL d90 uw5 | WON LESSER d124 | YES — loss | +34 | 2→0 (S3) | 6→9 (S3) |
| 99786 | scattered d28 | scattered d28 | no | — | 0→0 | 0→0 |
| 99787 | scattered d156 | scattered d156 | no | — | 3→3 | 12→12 |
| 99788 | scattered d29 | scattered d29 | no | — | 0→0 | 0→0 |
| 99789 | scattered d46 | scattered d46 | no | — | 0→0 | 0→0 |
| 99790 | won lesser d90 uw5 | won lesser d90 uw5 | no | 0 | 4→4 | 5→5 |
| 99791 | scattered d28 | scattered d28 | no | — | 0→0 | 0→0 |
| 99792 | scattered d104 | scattered d104 | no | — | 0→0 | 0→0 |
S1 1/12, S2 1/12 (99785, +34 — descriptive only), S3 1/12 (99785 only).
Signal seeds (flip OR S3): 1 [99785] of 12 — below the >=2 bar.
Tally: lesser 4/12, full 0/12, survived-to-horizon 0/12, scattered 8/12,
wave-5 1/12 (99790), median 90d (classifier upper-median 90d; sorted days
28/28/29/31/46/90/90/90/96/104/124/156).

## Scale-wall numbers (judged corpora, plain words)
- V-full (12): full seat 1, lesser 3, national-or-better at end 4
  (99781, 99784, 99785, 99790 all end global), wave-4 unlocked 7/12,
  wave-5 reached 2/12 (99785 full, 99790 lesser), median survival 90d.
- Sigoff (12): full 0, lesser 4, national-or-better 4 (same four seeds),
  wave-4 7/12, wave-5 1/12 (99790 only), median 90d.
- In plain words: on this fresh block, villages win seats (one of them
  the full seat) and reach wave 5 twice on the pinned game; turning the
  signature-damage lever off costs exactly one of those — the full seat
  on 99785, which falls back to a lesser seat 34 days later — and changes
  nothing else on any other seed. The binding constraint on this block is
  still everything downstream of sitting: the full seat exists but is
  fragile, resting on two wave-4 kills landing on the right days, and one
  lever takes it away.

## Sense-reading (SENSE-TESTING LAW) — 99785, the flipped seed: PASS
Every movement traces to a legible in-fiction mechanism, not a counting
artifact. The transcripts are announce-window captures (V-full: 63 lines,
announce d90 → sat d90; sigoff: 3247 lines, announce d90 → sat d124),
so the fork itself — before d90 — is traced from the fight census +
killLog, and the sigoff window is read end to end for coherence.
- Mechanism (census + killLog): V-full's Strike dies d51 (Aroha kills)
  and Algorithm dies d63 (Rafael kills) → 2 living veterans →
  releaseSnap d63 (rd5 ready: veterans 2, armored 7, armed 10, tricks
  16) → wave 5 unlocks → Cancellation faced d71 (vFlee), Rerun d78
  (mFlee), w5 faced 2 → full seat d90. Sigoff meets the SAME monsters
  on nearly the same days — Strike d47/d52, Algorithm d64, Suburb,
  Eulogy — but every wave-4 fight ends mFlee (the monster gets away)
  instead of vKill, and the d69 Reunion fight ends vDie (Liam Steele
  falls). killLog EMPTY, peak veterans 0, releaseSnap null — the hold
  beat names it honestly in the transcript: "📺 SYSTEM: '📡 The fifth
  draft stays in the wings — blood your fighters (0 of 2 veterans).'"
  No wave-5 unlock, w5 faced 0, lesser seat d124. The signature-damage
  lever decides whether wave-4 fights end in kills or in monsters
  getting away — and kills are the hard proof the readiness-5 door
  demands, so the whole chain (veterans → release → wave-5 facing →
  full seat) collapses from the fight outcomes alone.
- Coherence (sigoff d90–d124 window, read end to end): the village
  keeps living through the 34 extra days — foraging, water runs, gossip
  by the fire, the Herald and the Inspiration gorging at the treeline
  night after night while the village deliberates — and the eventual
  lesser sit plays out through the feared path with mercy chosen and
  Tāwhiri ascending as Architect through the relay door. V-full's d90
  sit takes a different table path ("BOTH HANDS" — the machine accepts
  an unclean answer). Both endings read as stories, not crashes; no
  robotic, static, or repeated behavior. One window limit, noted not
  chased: the d69 Reunion death (Liam Steele) falls outside the
  announce-window transcript, so its death beat is carried by the
  census only.

## Village assessment (plain words)
These twelve fresh villages are stronger than the rescreen block: four
sit (one of them the full seat), two reach wave 5, seven unlock wave 4 —
and the strongest village on the block, 99785, is the one sigoff breaks.
The rest of the block is harsher in the familiar way: five villages
scatter before day 32 without ever fighting a wave-4 monster, and the
long survivor 99787 fights 12 wave-4 fights, kills 3, and still scatters
d156 with one villager left. What is missing is not wave access — wave 4
is unlocked on 7/12 seeds and wave 5 opens twice — it is living veteran
killers converting into wave-5 kills: no seed kills a wave-5 monster
(99790's Editor kill d78 is a wave-5 kill — see correction below; it is
the block's only one, and that village still sat lesser). The blank this
run fills is the rescreen open item: sigoff's S3 signal does NOT
reproduce — on 12 fresh seeds it fires once, on a single seed, and the
lever is otherwise inert. The blank it documents is that the full seat
on this band hangs on two wave-4 kills: a lever that turns kills into
monster-flees takes the full seat with it.
- Correction to the sentence above, kept in the open because it matters:
  99790's d78 Editor kill IS a wave-5 kill (feastedDayFights d78
  "editor" vKill; satWaves w5:2). So the block has exactly one wave-5
  kill, on a village that sat lesser d90 with the door open. The
  winnability wall stands: wave-5 kills happen, but the village that
  makes one does not take the full seat.

## Telemetry deviation check
Declared INAPPLICABLE, not run: same reason as toggle-b/togglepin-b and
the rescreen — the corpus is matched-seed classification, and the
endgame baseline is the same stale, regime-unrecorded file r118 already
flagged (its own text forbids pre-seat comparisons). Running the check
would manufacture LOUD lines against a baseline that does not describe
this regime. No compare is fabricated. §15 balanced panels do not apply
to this diagnostic: the instrument is the matched-seed classification
itself, and the prereg staged design governs.

## Metric review
- The confirm bar worked as designed: judging BOTH flips and trajectory
  (gross, per-seed union) kept the verdict honest — net wins alone would
  have called this run a wash (4 wins each side), while the gross flip
  count (1 loss, 0 rescues) plus the single-seed S3 are exactly what the
  bar measures. NO-GO is the correct call: one seed is a signal, not a
  reproduction.
- S2 fired once (+34 sat days on 99785) and is descriptive only by design
  — correctly, since it rides the same single seed as S1/S3 and adds no
  independent evidence. On this band S2 is not a separate signal from S1.
- The rescreen's S3-only signal (99653: +4 fights, no flip) did not
  reproduce in kind: this band's only S3 seed carries a flip too. The
  screen's "trajectory without class movement" pattern is not what
  sigoff does on fresh seeds — when it moves, it moves class as well.
- The 'survived' class naming (prereg) fired on 0 seeds this band, but
  the classifier + proof script now carry it, so a future horizon
  survivor will be named rather than lumped under 'other'. Keep the
  vocabulary.
- The announce-window transcript limit (fork before d90 invisible in the
  transcript) is the same census-blindness the rescreen metric review
  named: the wave-4 census + killLog carried the mechanism here, but a
  future arm that needs the fork itself will want day-stamped fight
  records or a full-run transcript. (Carried; still unbuilt.)
- Staging deviation (no pass-2 repeat) cost nothing: DET GREEN on the
  band's first seed plus 12/12 integrity, and 10/12 sigoff seeds are
  class-identical to V-full — a determinism failure would have shown as
  noise across the block, not as a single coherent flip.

## Proof results
- Variant constructor (scripts/apply-toggle-variant-20261104.py, from
  master): sigoff applies cleanly on the pinned base (3 hunks, sigW4.js
  only, 4+/24-); alloff verified byte-equal to d8f334da8^ BEFORE any sim;
  every variant restored to the pinned tree after its run
  (`git diff --quiet -- src/js/` clean at every stage boundary).
- Pinned-tree method: `git checkout ff1725835 -- src index.html scripts`,
  variant tool copied back from master; confirm scripts diff-verified
  unchanged vs HEAD after checkout. Two post-base src/js files
  (villager-goals.js, win-plan.js) removed for the sim phase; final
  restore returns them from HEAD.
- Probe (scripts/probe-toggle-confirm-sigoff-b-20261105.js): r118 probe
  verbatim except the PLAN map (diff-verified). DET GREEN byte-identical;
  all probe .err files empty (26 runs total: 2 DET + 12 V-full + 12
  sigoff), no crashes.
- Classifier (scripts/classify-toggle-confirm-sigoff-b-20261105.js) +
  proof script (scripts/test-toggle-confirm-sigoff-b-20261105.js):
  integrity 12/12 on both prefixes; flips reproduce the table above
  exactly (S1 1/12, S2 1/12, S3 1/12); confirm mode judges the prereg
  bar directly (CONFIRM NO-GO, signal seeds 1 [99785] of 12). Both
  scripts were sanity-checked against the rescreen corpus before use
  (sigoff flips 0/8 S3 1/8 reproduce exactly; trickoff-99652 classifies
  'survived').
- No game-code change is committed or landed by this arm. Branch holds
  evidence/scripts only. No jest suite was run (no game code is committed
  or landed by this diagnostic arm; the variant code was restored before
  closeout).
- Index-clobber class hit on all three safe-commits (committed files
  showed staged-as-deleted); repaired every time via HEAD-blob cacheinfo
  and re-verified (status shows only the pinned-checkout state, diff HEAD
  shows only the pinned tree + the two removed files) before continuing.
  All commits verified correct via `git show --stat`.
- No out-of-arm finding is appended to sim-findings.md from this run
  (the NO-GO verdict is this run's report; the announce-window limit is
  a carried metric-review item, not a new finding).

## Commits (branch sim-sigoff-confirm-b, ready for coordinator merge, pending ship)
- b5704aff3 — sigoff-confirm-b prereg (fresh band 99781-99792, confirm
  judge S1+S3 >=2/12, pinned base ff1725835).
- 9a86db6d9 — sigoff-confirm-b tooling (confirm probe, classifier +
  proof script with survived class + confirm mode).
- 71c6f728d — sigoff-confirm-b Stage 0: DET GREEN + V-full pass 1
  baseline (12 fresh seeds, full 1/12 on 99785, lesser 3/12, wave-5 2/12,
  median 90d).
- (Stage 1 + this note follow in the closeout commit — per-seed outputs,
  logs, and this note.)
- No push, no bump, no live check — merged locally, pending ship (ship loop
  owns version bumps, pushes, live verification).
