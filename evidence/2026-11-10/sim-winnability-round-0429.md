# Loop B round 0429Z — veterans-bar build arms: spear-volley NO-GO + volley-softened sizing

Run: fleshout-loop-b-20261110T0429Z. Axis: scale-onramp (winnability chain).
Master at run start 91650a90f; at closeout 54b5389bb. Both arms merged
locally, pending ship. No version bump, no push, no live verification.

## Run setup

Re-point queue fully disposed before this run (arm-2 toggle CLOSED 0630Z;
flee-repair Steve-call held, branch sim-fleerepair-a; standing accumulation
answered) — per precedent, this run took the latest Loop B review's (0330Z)
next blanks in order. Blanks (1) wave-5 kill lever, (2) answer-the-mail,
(3) second-link recorder were LIVE-CLAIMED by Loop A run
fleshout-20261110T0415Z the whole run — NOT touched. Blank (4) flee-repair
held — NOT taken. Blank (5) veterans-bar build arm is this run: both arms
derive from the vetfinish outcome (FS engine-proven / field-unmeasurable).
Arm independence: arm 1 touches equipment.js only; arm 2 is instrument-only,
zero src/js. Orphan trees sim-wideduty-a + sim-sametick-a (food-economy,
uncommitted evidence) stayed deferred — NOT touched. sim-ctraj-b locked +
dirty — NOT touched. Pre-flight: main tree clean, disk 30%,
worktree-reap ran (7/16 active, no removals).

Loop A landed mid-run (secondlink DIAG-GO 874c89f89 + journey-social-life
r167); master moved 91650a90f → 00528fb72 under the run. Both branches
rebased onto the explicit SHA read immediately before each rebase; proofs
re-run green after every rebase and on merged master.

## Arm 1 — sim-spearvolley-b: NO-GO (net-negative wild effect), fix REVERTED, measurement LANDED

Commits 704fe3922 (prereg) + ed3706ea0 (measurement) + a53305e4b (SHA
record). Zero src/js changes in the final tree — the equipment.js fix was
built, proven, measured on 32 seed-legs, and reverted. Killed arms leave
no trace; the measurement lands so the verdict is recorded.

The fix: `isRangedWeapon` in src/js/equipment.js trusted the data's
`weapon.type` (spears are type 'melee', range 2) instead of the range>1
rule; `migrateEquipment` used the same rule. Exactly the 5 spears/lance
flipped; the other 20 weapons classify identically (proof-test census).

- Primary (constructed, prereg-bound): GO. Bow+spear fighter (crude bow +
  4 arrows + hunting spear + ally) vs full-HP wave-4 beasts, 30 seeded
  streams each: volley fires 30/30 herald (median dmg 14) and 30/30 audit
  (median 26.5), bar ≥27/30. Before fix: 0/30 both (same test via
  `git stash`). Proof test 48/48 on fixed code, 25/48 on unfixed (E1/E2
  slot legs fail as designed). Spear-only control: volley null 30/30,
  contact strike [19,23] (wb 15). Bow-only control unchanged (30/30).
- Cost bar: PASS on both bands. Starvation 5→2 (pilot) and 2→2 (confirm),
  ≤ control+2; median survival 116.5→133.5d (pilot) and 112.5→98.5d
  (confirm), ≥ 0.8× control median.
- Net effect (prereg clause — "if the net is negative the run is a
  NO-GO"): wild legs, identical seeds, competent/150d. Pilot band
  99641–99648 wave-4 kills 27→23; confirm band 99661–99668 19→11; pooled
  46→34 (−26%); field wave-4 kills 13→8; volley rows (wave-4+) 42→10.
  The pilot before-leg reproduces vetfinish-b's numbers exactly, so the
  divergence is the fix biting, not harness drift. The volley-rate drop
  was investigated, not waved through: all-waves volley rate is near-flat
  (15.3%→13.7% pooled), the wave-4 slice is a 3-seed concentration
  artifact — but the kill drop is consistent on both bands with a proven
  mechanism, so the verdict is NO-GO.
- Mechanism (E4, by construction): machete+spear (no bow) loses ~38%
  damage — median total 232.5→142.5 (herald), 157.5→97.5 (audit). Before,
  the spear added half its bonus through the ranged slot (wb 33); after,
  it is unequipped (wb 18).
- Fallback named for the next arm (not built): melee-first/ranged-fallback
  slot rule — spear→melee when a real ranged weapon is present (volley
  restored), else→ranged (old fold-in preserved). E1/E4 probe recipes are
  recorded in the arm evidence file.

Wall (pooled 16 seeds, before → after): wins 0→0, national 0→0, table 0→0,
wave-4 unlock 16/16→16/16, wave-5 unlock 6/16→3/16, wave-4 kills 46→34,
wave-5 kills 0→2 (both on armed legs; small numbers, not a verdict-changer
— the prereg judged on wave-4 kills), field wave-4 kills 13→8, scholar
deaths 174→160, median survival ~114.5d→~116d.

Evidence: evidence/2026-11-10/sim-spearvolley-b.md +
evidence/2026-11-10/sim-spearvolley-b-prereg.md; corpora
evidence/2026-11-10/perseed-spearvolley-b/ (16 files) +
evidence/2026-11-10/perseed-spearvolley-confirm/ (16 files); analyzer
scripts/spearvolley-analyze-20261110.js (coordinator re-ran post-rebase:
headline numbers reproduce exactly — pilot 27→23 kills, 34→6 volley rows;
confirm 19→11 kills, 8→4 volley rows; pooled 46→34 kills, 174→160
scholar deaths). `node scripts/check.js --quick` on the worker's base:
296 passed / 4 failed, all four pre-existing on the base
(mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes), none attributable to this arm.

## Arm 2 — sim-volleysoft-b: DIAG + SIZING complete, zero src/js, LANDED

Commits f73c092f7 (prereg) + 8ae3eb3f0 (sizing) → rebased ec2659dd3 +
54b5389bb. Proof scripts/test-volleysoft-b.js 17/17 post-rebase and on
merged master.

Two premise corrections (coordinator note — the second is a
measurement-hygiene record for future runs):
1. "Flees free" is wrong for wave 4. Only lockpick_raccoon (wave 1)
   carries a `flee` component; no wave-3+ kind does. A volley-softened
   wave-4 beast takes the committedHold branch and fights on through
   rounds — the exclusion costs the free contact strike + FS commit, not
   the meeting. Verified in code and by construction (0 mFlee in 115
   volley-softened fights).
2. BAND COLLISION — the suggested band 99651–99658 was NOT fresh (used
   2026-11-05 by toggle-rescreen/gearoff/sigoff/trickoff confirms). The
   worker used fresh band 99591–99598 instead, verified 0 hits per seed
   across all 695 preregs, all dated .md, all evidence filenames, and
   scripts/. No future run should treat 99651–99658 as fresh.

- Wild window (fresh band 99591–99598, competent, 150d, 8/8 seeds, 0
  instrument errors): 0 volley-softened meetings in 58 wave-4 field
  fights. The volley fired in only 2/58 fights (both against healthy
  beasts). DIAG field-unmeasurable per the prereg; band not extended.
  Below-break meetings: 3 (all wall-delivered heralds), 2 contact-finish
  kills, 0 FS commits. Wild field shape is the walk-away: 49/58 fights
  end vFlee.
- Constructed sizing (270 fights): 115 volley-softened meetings,
  post-volley remainder median 133 HP (range 83–172). Bow strike [15,19]:
  kill share 0/115, FS-window share 0/115; spear [19,23]: 0/115 kills,
  1/115 in-window. Without any finish, fighters die 57%, flee 23%, kill
  20% (median 3 rounds; 71–73 HP lost even in fights they survive).
  Covering the median remainder at bow sizing needs an ~8-strike window —
  a re-fight, not a finish — and the hold's convertible pool (fled fights
  inside the window) is 0. The free strike is riskless but nearly
  worthless (0/115 kills).
- Lever spec (in the evidence file, NOT built): primary = volley-softened
  committed kills / |V| (R ≤ W×strike), GO ≥ 0.50; cost bar = fighter
  deaths must not exceed the 57% no-finish baseline by >10pp. Do NOT
  build at W=4 (FS sizing) — it covers 0/115; W=8 covers ~50% but is a
  different lever needing its own prereg. Gated on two Steve-calls:
  whether the wound-mill ruling covers volley-crippled beasts, and tail
  width W.

Wall: median survival 113.5d (66–146), won 0/8, national 0/8 (regional
8/8), table 0, wave-4 unlock 8/8, wave-5 unlock 1/8, wave-4 kills 18,
wave-5 kills 0, field wave-4 kills 2, scholar deaths 93.

Evidence: evidence/2026-11-10/sim-volleysoft-b.md +
evidence/2026-11-10/sim-volleysoft-b-prereg.md; corpus
evidence/2026-11-10/perseed-volleysoft-b/ (8 files); analyzer
scripts/volleysoft-analyze-20261110.js.

## Wall (this run's judged corpora, 40 configs)

Wins 0, national 0, table 0, wave-5 kills 2 (both on spearvolley armed
legs), wave-4 kills 64 across the spearvolley pooled legs + 18 volleysoft,
median survival ~113–116d. The chain still binds past veterans: the
finish pipeline converts no better, and no village climbs to national.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-10/perseed-spearvolley-b/*.json' --metrics
national,table,wins,exiled` REFUSED (recorder-corpus input, all 16 rows
carry anchorCommit); same refusal on the volleysoft corpus (8 rows).
Same precedent as vetfinish/grind-a. Baseline NOT reseeded, no
investigation item. No balance panel (§15 precedent: the panel takes no
corpus input); the pre-registered primaries are the identical-seed
comparisons + the constructed rates. No compare .md fabricated.

## Infrastructure

- A service restart interrupted the first worktree-registration call
  (no effect — verified zero trees/registry entries, retried clean).
  Registration slow (~2.7 min/tree, CPU-bound reset, not hung).
- Safe-commit index clobber hit all 5 worker commits (including the MM
  form once) — repaired via the HEAD-blob pipe each time, blobs verified,
  commits always correct.
- The ff-only merge of the second branch correctly refused after the
  first merge moved master (diverged siblings at the shared base — the
  merge was NOT piped through head and the failure was loud, chain
  stopped, nothing released). Recovered by rebasing volleysoft onto the
  new master tip a53305e4b, proof re-run green, merged ff-only, ancestor
  verified for both branches.
- `node scripts/check.js --quick` NOT re-run by the coordinator on merged
  master: zero src/js in both landings; the spearvolley worker recorded
  the standing 296/4 profile on its base.
- No EPERM flap this run.

## Findings filed (sim-findings.md)

- SPEAR-IN-RANGED-SLOT stays OPEN (UPDATE): the one-line fix is
  net-negative and reverted; the finding now carries the fallback
  (melee-first/ranged-fallback) + the E4 number (−38% damage on
  machete+spear). Do not re-assign the one-line fix.
- VOLLEY-SOFTENED EXCLUSION (UPDATE): sized, not decided — premise
  correction, wild 0/58, FS sizing covers 0/115, lever spec gated on two
  Steve-calls.
- SPEARXBOW-CORPUS-STALE (new open): test-spearxbow-20261031.js re-runs
  25/27 on current master; corpus anchored 2026-10-31, 1598
  field-differences across 176 fights (roster/world drift). Needs
  re-anchoring/regeneration or an anchor-rule revisit.
- ROUND-CAP WALK-AWAY FROM A NEARLY-DEAD BEAST (new open): 99596 d60,
  Keerati vs Buffering (wave 3) — 15-round cap ends the fight with the
  beast at 10 HP and the fighter at 56 HP.

## Convergence state

scale-onramp stays converging (NOT converged): the veterans-bar build
question is now answered twice over — the spear fix restores the volley
by construction but costs more kills than it gains, and the
volley-softened finish has no wild window to take at FS sizing. The
finish pipeline is not the binding lever on this evidence; the chain
still binds at wave-5 kills / national, past veterans. food-economy stays
converging (untouched; sibling Loop A live on winnability).
Claim deleted; lock deleted.

Next blanks, in order: (1) melee-first/ranged-fallback slot-rule build
(the spearvolley fallback, with its own prereg); (2) volley-softened
finish at W=8 (different lever, own prereg) — gated on the two
Steve-calls (wound-mill coverage + tail width W); (3) flee-repair build
(Loop B queue item 2, Steve call — still held, branch sim-fleerepair-a);
(4) sit-becomes-win (Steve-call); (5) sweep table contract question
(Steve-call); (6) capstone readiness; (7) trial-by-combat staging
(Steve-call); (8) Binding-never-fires follow-up; (9) gating leg-4
recalibration (decision owed). NOTE for the next run: Loop A still holds
the 0330Z blanks (1) wave-5 kill lever and (2) answer-the-mail (claim
fleshout-20261110T0415Z, live at this closeout) — check its claim before
taking any winnability blank.
