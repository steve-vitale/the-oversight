# Winnability round 1322Z — grind-to-finish DIAG-NO + killer simultaneity DIAG-GO (Loop B, 2026-11-05)

Coordinator evidence, run fleshout-loop-b-20261105T1322Z. Axis scale-onramp /
winnability chain. Merged locally, pending ship. No push, no bump, no live
verification (ship loop owns deploys).

## Run start

STALE-LOCK RECOVERY: deleted 3h52m-old 0930Z B lock (no registry tree or
heartbeat for that run_id); dead claim retired to .DEAD. Its arms were already
accounted for on master — approachlive landed as f72e4bd16 (SUBSTRATE-MISSING),
triggerbuild landed through 9797dfabd (GO 6/6) — nothing stranded.
Loop A live on food-economy throughout (1215Z claim: sim-banksnap-a +
sim-pantryspoil-a, NOT touched; Loop A landed both mid-run: banksnap
GO-RETAINED 14/14 as 6b516a7ea, pantryspoil GO LAND lever 90b959147
[needs-eyes]).

Queue disposition (verified against tracker + evidence, not the stale queue
text): the re-point queue's item (1) arm-2 toggle ALREADY has its verdict
(0330Z/0445Z/0550Z: MORALE credited, GEAR credited, SIGDMG/TRICKHOLD
pilot-non-attributed); item (2) flee-repair is confirmed GO as a default-OFF
policy instrument (fleerepair-confirm-a, 12 fresh seeds) with its approach
fallback guardrail-blocked twice (approachbranch-a NO-GO, approachlive-b
SUBSTRATE-MISSING) — a game-code port of the repair needs a Steve call on
scope (engine-side flee/fallthrough for human players) and is NOT claimed
here; item (3) standing accumulation is decomposed (standaccum2/3,
killerdeath, secondkiller, killersim). This run therefore took the freshest
open blanks from the 0915Z entry: (1) the grind-to-finish chain and (2)
killer simultaneity re-measure with a stated banking-screen plan.

## Arm 1 — sim-grindfinish-b: DIAG-NO

Commits c54d319ef (prereg) + 20f6d331b (evidence + corpus + instruments),
proof 26/26 post-rebase and on merged master. Zero src/js.
Evidence: evidence/2026-11-05/sim-grindfinish-b.md (+ prereg);
corpus evidence/2026-11-05/perseed-grindfinish-b/ (8 files, 0 errors).

Band 99309–99316, fresh, competent verbatim, 150d death-aware. (The brief's
suggested 99301–99308 is contaminated — a judged leg of sim-diplo-b,
2026-11-04 — the worker moved to 99309–99316, verified fresh by whole-token
grep across all dated preregs + evidence .md, zero hits.)

Verdict DIAG-NO per the pre-registered rule. The grind-to-finish chain WORKS
mechanically — and that is exactly why it is not the binder:
- Chain plumbing sound: TB lift covers 88.2% of TB fights (30/34, fidelity
  29/30 — the 2026-10-26 #1167 "TB never inherits field wounds" claim is
  STALE for tile-monster fights; the sim-w4tbkill-a lift fixed it),
  TB→TB continuation 13/14, gap median 1 day, 7-day re-find 36.4%.
- Kills came fresh, not wounded: wounded-entry TB kill rate 0/3 (0 kills,
  thin band < 5), fresh-entry 2/9 = 22.2%. Both kills (2/2) were non-lifted,
  pending-live wanderer fights at fresh entry (fracHi 0.84); lifted siege
  fights killed 0/30. The dmground "kills are finishes of ground-down
  beasts" did NOT reproduce here (n=2 — a question, not an overturn).
- The grind's PRICE binds: seed 99313's algorithm went 750→624→508→451→
  267→209→114 across six TB fights on days 63–65 — six scholars died, roster
  7→0, village lost with the beast at 114 HP. TB fights end death-or-win
  (32 death, 2 won, 0 fled band-wide).
- Field side nearly absent: 11 field fights band-wide, 3 seeds with zero;
  field kills 0. 1-HP arrivals 0 — the fieldfinish stuck state did not
  appear on this band.
- Sense: six scholars die to one beast across two days with no line ever
  naming the beast or its remaining HP — the grind is invisible in the
  fiction. Wave-4 kills pass without a triumph beat (same gap dmground
  noted).

Wall (grindfinish band): wins 0/8, national 0/8, table 0/8, wave-4 unlocks
7/8, faced 7/8, wave-5 0/8, readiness-5-ready days 0, median survival 81d.

Findings appended (5, sim-findings.md lines 1760–1764): grind-step price,
TB all-in 0 fled, fresh-kill inversion, #1169-class unexplained HP drops
(incl. a 6-HP lift discrepancy at 99315 d92), invisible-grind narration.

## Arm 2 — sim-killersim2-b: DIAG-GO

Commits 25da7ff46 (prereg), ce19cf405 (analyzer), c8f7ee3c0 (death-channel
fix), e633f21da (evidence); proof 26/26 post-rebase. Zero src/js.
Evidence: evidence/2026-11-05/sim-killersim2-b.md (+ prereg);
corpus evidence/2026-11-05/perseed-killersim2-b/ (32 files, 0 errors).

32-seed banking screen, band 99311–99342, verified fresh, competent verbatim,
150d death-aware. Banking defined in the prereg as ≥1 wave-4 kill AND the
killer alive at end of the kill day. The "HOW ≥4 banking seeds" the 0915Z
metric review required: volume at measured rates (25–37.5% → expect 8–12;
P(<4) ~0.6% at p=0.25).

Verdict DIAG-GO, judged strictly against the prereg:
- POWERED: 6 banking seeds (99316, 99317, 99327, 99328, 99334, 99337),
  above the ≥4 target.
- Gap CONFIRMED: 0 days with two living wave-4 killers on any banking seed
  (73 days with exactly one, 0 with two; maxLiving 1 everywhere).
- Mechanisms on all 6 banking seeds: M1 dies-fast 5/6, M2 never-arrives 5/6,
  M4 made-late 3/6, M3 clusters 0/6 (guard works — the only multi-kill seed
  splits its kills 1–1).
- First-killer survival MEDIAN 9.5d (n=6 observed, 0 censored; intervals
  [11,7,1,33,8,13]) — the first claimable median, confirming the 9d/11d
  priors.
- Second-killer production (M3): only 1/6 banking seeds ever banks a second
  killer; post-first-blood 1 kill in 45 fights (2.2%), and that one kill
  (99337 Aroha) dies the same day. 3 of 10 wave-4 kills are same-day
  kill-and-die and never bank at all.
- Death channels (7 banked killers, all died in fight): wild 5,
  contest/arena 1, other "a stranger" 1. Five of seven died in combat at
  haven. (Analyzer bug found by the corpus and fixed pre-evidence: the
  game's death causeArg carries the article — "the arena" was first filed
  as "other:the arena"; fixed with 2 new fixtures, proof re-run 26/26,
  analyzer re-run on the same corpus. Verdict unaffected.)

Wall (killersim2 screen): wins 0/32, national 0/32, table 0/32 (unobserved),
wave-4 unlocks 25/32, faced 25/32, 200 fights / 10 kills (5.0%), wave-5
unlocks/faced/kills 0/32, ready days 0, median survival 87.5d (31 lost,
1 survived to horizon).

Findings: new open item appended (sim-findings.md line 1765, "a stranger"
as a death cause — needs a code read); 7th veteran-word-collision sighting
added as an UPDATE to the existing line 1745 item; hold-beat silence
reproduced in filtered form.

## Wall (this run, 40 distinct seeds)

Wins 0/40, national 0/40, table 0/40, wave-5 unlocks/faced/kills 0/40,
wave-4 kills 12, readiness-5-ready days 0/40, median survival 81d
(grindfinish band) / 87.5d (killersim2 screen). Full seat still unwon;
wave-5 kills still 0 in normal play.

## Telemetry deviation check

Attempted by the coordinator on both corpora: REFUSED by the tool
(recorder-corpus shape, same class as prior runs) — no LOUD line, baseline
NOT rolled, no investigation item. Balanced panel: no before/after pair for
either DIAG corpus (stated in both preregs).

## Metric review

Both arms carry metric-review sections in their evidence files and were
judged strictly against their preregs. Grindfinish: the DIAG-NO rests on the
prereg's rule as written; the fresh-kill inversion (n=2) is recorded as a
question for the next run, not a re-score. Killersim2: the M3 n≥2 guard
worked as designed; the screen delivered the powered sample the 0915Z
metric review demanded. No metric was re-scored mid-run.

## Infrastructure

Registration slow (~6 min/tree under sibling load). Safe-commit index
clobber hit both workers' commits (grindfinish 2x, killersim2 4x) —
repaired via HEAD-blob cacheinfo each time, commits verified correct; one
grindfinish repair pass initially failed on a transient index.lock held by
a concurrent sibling playtest-loop git process in the main tree, which
cleared on its own. Master moved under the run (Loop A banksnap 3 commits,
journey-landing r105); both branches rebased clean with zero file overlap,
proofs re-run green after every rebase and on merged master (grindfinish
26/26, killersim2 26/26). No EPERM flap this run. Reaper final sweep:
active 14/16, removed nothing sibling-owned (LOUD notes only on the
main-session builder trees). Main tree clean at closeout; both branches
deleted; both trees released done-merged.

## Disposition

scale-onramp stays converging (NOT converged): the pair question is now
answered on a powered screen (0 days with two living killers; first-killer
median survival 9.5d; second-killer production 1/45 post-blood fights),
and the grind chain's plumbing is exonerated while its price is named —
but wins are still 0, the full seat still unwon, wave-5 kills still 0, and
readiness-5-ready days still 0. Next blanks, in order: (1) BUILD arm on
second-killer production or first-killer survival — not another
simultaneity measurement; (2) the grind step's price
(survival-per-TB-fight / retreat-and-refind — TB all-in 0 fled is the
lever's shape, needs its own prereg, not a smuggled default); (3)
fresh-kill inversion (wild fight vs treeline siege odds); (4) re-screen
sigoff/gearoff/trickoff on a fresh seed set (0445Z blank a, still open);
(5) flee-repair game-code port — STEVE CALL on scope (see Run start);
(6) carried: veteran-word collision naming, wave5faced label rename,
hold-beat spoken-line probe, sealed-fallback refusal split, ±1-day kill
join, stranger death-cause code read, #1169-class HP-drop trace.
food-economy stays converging (sibling Loop A, untouched).
Claim deleted; lock deleted.
