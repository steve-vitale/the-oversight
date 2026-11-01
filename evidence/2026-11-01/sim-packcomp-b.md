# sim-packcomp-b — DIAG: would identification / shelling push zero-seed packs over the 2,000 keep?

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1346Z,
axis food-economy, arm sim-packcomp-b. Worktree sim-packcomp-b,
branch sim-packcomp-b. Answers the coordinator's pack-composition
arm, following sim-depositkeep-b: with the gate OFF (keep 2,000),
scholar unload is nonzero on 4/8 pilot seeds and exactly 0 on
51103/51104/51107/51108, which fail on pack COMPOSITION (unknowns,
in-shell nuts, materials), not threshold. This arm itemizes every
scholar return pack on the identical substrate and computes three
counterfactual packs per return: (a) identification only, (b)
shelling only, (c) both combined — would any return pack exceed
2,000 kcal and therefore unload?
DIAG ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing policy file or existing script. New files
only: prereg, packcomp trace driver, counterfactual module,
analyzer, proof test, evidence, census/corpus. This worker does
NOT push, bump, verify live, or merge into master; the coordinator
merges. Status to coordinator: committed on branch, pending
coordinator merge.

## Verdict: NO-GO / killed-at-pilot — judged exactly against the prereg bar

Prereg: evidence/2026-11-01/sim-packcomp-b-prereg.md, committed
BEFORE any judged sim (see Infrastructure for the commit saga).
Its verdict rule, applied exactly as written:

GO required BOTH: combined (c) counterfactual predicts nonzero
unload on >= 6/8 seeds AND flips >= 2 of the 4 depositkeep zero
seeds (51103, 51104, 51107, 51108). The pilot lands at 5/8 seeds
and 1 flip. That is NO-GO on both prongs, and per the task there
is NO confirm spend: killed at pilot, evidence only. No re-score:
the 51107 flip, the 10 over-2,000 (c) returns on 51107, and the
shelling upside on the unloading seeds do NOT convert a 5/8 +
1-flip into a GO — the bar was 6/8 + 2 flips and it missed both.

But "NO-GO" undersells what the pilot actually proved, so state it
sharply: processing is a REAL lever on exactly one zero seed and a
dead end on the other three — and the split is clean, not marginal.
51107 flips decisively on shelling alone (10 returns over 2,000,
best pack 3,616 kcal of shelled acorns). 51103/51104/51108 never get
within 800 kcal of the keep even with BOTH channels combined
(best (c) packs 1,200 / 1,200 / 565). For those three seeds the
blocker is haul SIZE — a handful of nuts — not processing. No
identification or shelling lever, however perfect, moves them.
The next lever on this axis is therefore two different jobs, not
one: a shelling habit (for the 51107 shape) and forage volume /
targets (for the 51103/51104/51108 shape). A single "processing"
lever cannot be judged GO on this band because the band contains
both shapes and only one of them is processing-shaped.

## The answer in one paragraph

With identification AND shelling both applied arithmetically to
the recorded packs, the scholar would unload on 5/8 seeds (the 4
depositkeep unloading seeds plus 51107) instead of 4/8 — one flip,
not two. Channel (a) identification alone flips NOTHING: its best
zero-seed pack is 1,200 kcal (51107's unknown value is 0 on its
big returns; 51103's unknowns are entirely nut species that would
still sit in-shell after identification). Channel (b) shelling
alone flips exactly 51107: 32 White Oak Acorns, shelled at
round(150 x 0.75) = 113 kcal each, make 3,616 kcal — the only
zero-seed pack that ever clears 2,000. On 51103 and 51104 the
biggest possible pack is 8 hickory nuts shelled (8 x 150 = 1,200);
on 51108 it is 5 acorns shelled (565). Identification adds at most
800 kcal on any zero-seed return (51103's 4 unknown hickory nuts).
The zero seeds are not one problem: 51107 is an unshelled pantry,
the other three are small hauls.

## Pilot gates (all passed, before judging)

(1) POSITIVE CONTROLS: scripts/test-packcomp-b.js — 15 pure
checks green, plus one live field-capture control on NON-pilot
seed 51109: 28 live returns, foodState and hiddenKcal/lump fields
present on real returns, finished-pack figures computed by the
judged code path. A census from this recorder is a real census.
(2) COMPLETE CAPTURE: analyzer completeCapture true on 8/8 seeds
(full evening snapshots plus a finished-pack figure on every live
return, every item carrying foodState, zero incomplete returns,
zero null unknown-value components).
(3) INSTRUMENT NEUTRALITY: the driver contains no travelTo,
returnToVillage, eat, donateToPantry, shellNuts, identifyPlant, or
other state-moving call in the judged path — wrappers count only
(wrapper assignments + orig.apply passthrough, verified by code
read; the grep hits are comments and wrapper definitions).
(4) GATE-OFF CHECK: gate-engaged reads false on every judged
return (entry and exit), 0 exceptions.
(5) SUBSTRATE TIE (exact, not approximate): per-seed max finished
pack from this run ties the depositkeep census EXACTLY on all 8
seeds (2970 / 5780 / 0 / 0 / 2910 / 3320 / 1040 / 0), and unload
totals tie EXACTLY (2850 / 5980 / 0 / 0 / 2040 / 1320 / 0 / 0).
Homecoming counts tie exactly (30 / 28 / 28 / 33 / 22 / 28 / 29 /
28). The substrate replicated; the counterfactual is computed on
the same packs depositkeep judged.
(6) ACCOUNTING TIE (not a prereg gate, but checked): per seed,
deposit-unload totals equal return-unload totals exactly, and
donations are 0 on 8/8 seeds with ZERO donateToPantry calls —
the depositkeep gate-off finding reproduces unchanged.

## Pilot census (30d competent window, DEPOSITGATE=0, seeds 51101-51108)

homeLive = returnToVillage calls with Game.over false at entry
(depositkeep rule; endDay-flagged sensitivity count is identical
— 0 flagged calls on all 8 seeds). fin = as-is finished pack;
unk = unknown revealed value; shell = shelled value; (a)/(b)/(c)
= channel packs; overC = returns with (c) > 2000. Full per-return
tables with items: evidence/2026-11-01/sim-packcomp-b-census.json.

| seed | end | days | wave | homeLive | unload | maxFin | maxUnk | maxShell | maxA | maxB | maxC | overA | overB | overC | wouldC |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 51101 | survived | 30 | 1 | 30 | 2850 | 2970 | 1155 | 4800 | 2970 | 6420 | 6420 | 6 | 17 | 17 | yes |
| 51102 | survived | 30 | 2 | 28 | 5980 | 5780 | 2220 | 4662 | 5780 | 7382 | 7382 | 4 | 9 | 11 | yes |
| 51103 | survived | 30 | 1 | 28 | 0 | 0 | 800 | 1200 | 800 | 1200 | 1200 | 0 | 0 | 0 | NO |
| 51104 | survived | 30 | 2 | 33 | 0 | 0 | 530 | 1200 | 1200 | 1200 | 1200 | 0 | 0 | 0 | NO |
| 51105 | survived | 30 | 2 | 22 | 2040 | 2910 | 710 | 0 | 2910 | 2910 | 2910 | 3 | 3 | 3 | yes |
| 51106 | survived | 30 | 2 | 28 | 1320 | 3320 | 1190 | 0 | 3320 | 3320 | 3320 | 1 | 1 | 1 | yes |
| 51107 | survived | 30 | 2 | 29 | 0 | 1040 | 1200 | 3616 | 1200 | 3616 | 3616 | 0 | 10 | 10 | YES (flip) |
| 51108 | survived | 30 | 2 | 28 | 0 | 0 | 160 | 565 | 160 | 565 | 565 | 0 | 0 | 0 | NO |

Judged counts: would-unload (c) on 5/8 seeds (51101, 51102,
51105, 51106, 51107); zero-seed flips (c): 1/4 (51107 only);
flips (a): 0/4; flips (b): 1/4 (51107 only). GO needed 6/8 + 2
flips. Both prongs miss.

## The zero seeds, one by one (what the packs actually are)

- 51107 — FLIPS, on shelling alone. Its big returns carry zero
  finished food and zero unknowns: just acorns. Best return
  (loopDay 24, day 24): 32 White Oak Acorns (in shell), shelled
  value 32 x round(150 x 0.75) = 3,616 kcal; 10 of its 29 live
  returns clear 2,000 on (b)/(c). Its finished food (blackberries,
  max 1,040) lives on different returns from its acorn packs — the
  seed never mixes the two. Identification contributes nothing to
  the flip (maxA 1,200, overA 0): the acorns are already named.
  The blocker here is purely the missing shell step.
- 51103 — small haul, not a processing problem. Best (c) return
  (loopDay 30, day 30): 8 Hickory Nuts (in shell) + sticks +
  Father's Whetstone + an unopened fan care package = 1,200 kcal
  shelled, 800 kcal short of the keep. Its only unknown value
  anywhere is 4 unknown hickory nuts (lump component hickory_nut,
  4 x 200 = 800) — and those are nut species, so identification
  alone would leave them in-shell: the (a)-excluding-nut
  sensitivity for 51103 is 0. Even perfect processing on the best
  day leaves 800 kcal of headroom unfilled.
- 51104 — same shape as 51103, twice over. Best (c) returns
  (loopDays 17 and 19): 8 Hickory Nuts shelled = 1,200 kcal, plus
  sticks, stones, whetstone, care package. Max unknown value 530.
  No return combines a big nut pack with finished food or unknowns
  — the channels never stack to anywhere near 2,000.
- 51108 — smallest haul of all. Best (c) return (loopDay 3,
  day 3): 5 White Oak Acorns shelled = 565 kcal, plus a field
  suture kit and sticks. Its only unknown value is 4 unknown
  shoots (lump component stinging_nettle, 4 x 40 = 160) — and
  nettle is must-cook, so the (a)-excluding-must-cook sensitivity
  for 51108 is 0: identification alone yields zero unloadable
  food here. Residual unprocessed food (must-cook nettle, max 480
  kcal on loopDay 29: 12 x 40) would still leave the seed ~1,000
  kcal short even if cooking were counted — and cooking is out
  of this arm's scope. The blocker is haul size, full stop.

## Side finding: shelling upside on the seeds that already unload

On 51101, shelling lifts the best unload-eligible pack from 2,970
(finished) to 6,420 (b)/(c) — 17 of 30 returns clear 2,000 on (b)
vs 6 on (a). On 51102, (b) best is 7,382 vs finished best 5,780.
The scholar on unloading seeds is ALREADY carrying large unshelled
nut packs alongside finished food; shelling would roughly double
the unload-eligible pack on those seeds too. This is descriptive,
not judged: the GO bar counts seeds and flips, not band totals.
But it means a shelling lever's payoff is not confined to 51107 —
it is just only decisive there.

## Sense test (SENSE-TESTING LAW: read, don't just count)

One return transcript per zero seed, max-(c) return each (full
extracts: evidence/2026-11-01/sim-packcomp-b-corpus/):

- 51107, day 24 — CONFIRMS depositkeep's sense note and sharpens
  it: the miss here is not smallness, it is unshelledness. "You
  work the patch with practiced hands: 32x White Oak Acorns (in
  shell — shell them to eat)." Then "1 unprocessed haul onto the
  counter — the clock is ticking." Then Rachel: "Oh — THAT one.
  Here, look." / "Hold on — I already showed you this one. White
  Oak Acorns. You remember." The species is KNOWN, the lesson
  already taught, the nuts still in-shell on the counter, and no
  keep/unload voice fires (correct: 0 finished). The game is
  honest about all of it; what never happens is the shell step.
  The counterfactual is literally the forage line's own promise:
  "shell them to eat."
- 51103, day 30 — CONFIRMS the small-haul note. "8x Hickory Nuts
  (in shell — shell them to eat)." Same honest counter staging,
  same already-taught lesson from David. Eight nuts is a small
  haul even shelled (1,200 kcal); nothing here reads as a missed
  unload.
- 51104, day 17 — CONFIRMS, with a telling line: "Nobody at the
  fire knows your haul any better than you do. It'll be your own
  hands that teach you." The 8 hickory nuts are named, staged,
  and small. The day also carries real village news (the
  Hushpuppy mauled Ingrid, -44 health) — the return reads as a
  lived day, not a ledger event.
- 51108, day 3 — CONFIRMS, and the game voices the counterfactual
  itself: "Someone by the fire nods at the counter. 'We pool food
  here. Keep what you need for the road — the rest feeds
  everyone, once it's food.'" Five acorns are not food yet. The
  same return's day lines also show the scholar STARVING ("You
  went to bed on an empty stomach") while carrying those 5
  unshelled acorns — the most human moment in the band: food in
  the pack, hunger at the fire, and the shell step between them
  never taken.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table / wins:
no seed can reach national in 30 days, and none does. What
runDays returns in-window: 8/8 seeds survived 30 days gate-off
(median survival 30, max 30, collapses 0); wave reach max 2
(wave 1 on 51101/51103, wave 2 on the rest); waves 3–5 not reached
(expected — early window). National 0, table 0, wins 0 IN THIS
WINDOW ONLY — not a wall movement claim. Pantry-cap say lines: 0
band-wide, so the pantry-cap caveat in the prereg bites nowhere.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration: the panel compares lever arms through its standardized
observer/scorecard/cohort rows; this arm changes no game code, its
primary metric is a custom return-pack census with arithmetic
counterfactuals, not a panel metric, and its baseline is a
PUBLISHED census, not a freshly run panel. The counterfactual
tables above are reported directly instead.

## Caveats and attribution limits (honest, per prereg)

- ARITHMETIC, NOT A RE-SIM: the counterfactual applies
  identification/shelling to recorded packs without charging
  ticks (shellNuts costs 4 ticks per lot), without changing
  forage targets, and without re-routing any day. A GO here would
  have licensed a real-lever run, not proven the lever's in-game
  effect. The NO-GO verdict does not depend on this caveat — the
  three non-flipping seeds fail by 800–1,435 kcal, far beyond any
  tick-cost rounding.
- GATE-OFF ≠ KEEP-ONLY, inherited from depositkeep: DEPOSITGATE=0
  disables meal-share easing and haul holdbacks as well as
  lowering the keep. The counterfactual is computed on gate-off
  packs; gate-on packs (keep 6,000) would differ. The flip
  question is asked on the gate-off substrate exactly as the
  coordinator prescribed.
- SPOILAGE NOT RE-APPLIED: the counterfactual assumes processing
  happened before the return, on the pack as recorded. No zero-seed
  pack carried a spoilage flag that would change the verdict (the
  packs are nuts and fresh unknowns, not rot).
- SINGLE policy (competent) by prereg design, 30-day early window
  only. Other policies and later windows may shape differently —
  in particular, a later window's larger nut packs could flip
  more seeds on shelling, but that is a next run's question.
- The (a) channel as prescribed counts unknown nuts at revealed
  value even though identification alone leaves them in-shell.
  The nut sensitivity (51103: aNoNut max 0; 51108: aNoMC max 0)
  makes that overstatement visible. The JUDGED verdict uses (c),
  which is unaffected by the (a) overstatement — (c) counts each
  item once, in its final processed state.

## Metric review (for the NEXT run; this run judged against its header)

- THE (c) BAR CONFLATED TWO BLOCKERS: the 6/8 + 2-flip bar assumed
  the zero seeds shared one processing-shaped blocker. They do
  not: 51107 is shelling-shaped, 51103/51104/51108 are haul-size-
  shaped. The NEXT run should pre-register SEPARATE bars — e.g. a
  shelling-lever bar judged on shelling-shaped seeds (or on
  returns carrying in-shell packs over the keep when shelled),
  and a haul-size question judged on forage volume — instead of
  multiplying two blockers into one seed count.
- IDENTIFICATION ALONE IS NEARLY WORTHLESS ON THIS BAND: (a)
  flips 0/4, and its two best zero-seed values are both
  sensitivity-zero (51103's unknowns are all nuts; 51108's only
  unknown is must-cook nettle). A future identification lever
  needs a band where unknowns are non-nut, non-must-cook species
  in volume — or it needs to be bundled with shelling, which is
  just channel (c) again.
- THE SHELLING LEVER DESERVES A REAL RUN: 51107's flip is not
  marginal (10 returns over 2,000, best 3,616) and the unloading
  seeds carry large unshelled packs too. The next run on this
  axis should test an actual shelling habit (policy or game
  change: shell at camp / on return), pre-registered on fresh
  seeds, with tick costs charged — not another arithmetic
  census. The 51107 shape (acorn/oak packs, known species,
  already-taught lessons, nuts sitting on the counter) is the
  test case.
- HAUL SIZE IS THE 51103/51104/51108 QUESTION: even perfect
  processing leaves those seeds 800–1,435 kcal short of the keep
  on their best days. The next question there is forage targets
  and volume (why 8 nuts is the ceiling: patch yields, trip
  length, competing demands), not processing.
- No metric, threshold, seed, or channel definition was changed
  mid-run. The NO-GO verdict stands as written; the 51107 flip
  and the shelling upside above are interpretation of a NO-GO
  result, not a re-score.

## Findings for backlog (for the coordinator to append)

This worker does NOT edit the tracker (coordinator owns it) and
does not append to sim-findings.md directly (same hidden_files
directory the coordinator owns; depositkeep precedent). The lines
below are in backlog format for the coordinator to append verbatim
if it wants them:

- [open] 2026-11-01 — food-economy / scholar supply — shelling habit missing: the scholar carries in-shell nut packs home for 30 days and never shells them, even for already-known, already-taught species (51107: 32 acorns sit on the counter unshelled while the scholar starves on 51108's shape); a shell-at-camp habit would flip 51107-class seeds (sim-packcomp-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — small-haul seeds: 51103/51104/51108 never carry more than 8 nuts / 5 acorns on any return, so no processing lever reaches the 2,000 keep (best combined packs 1,200 / 1,200 / 565); the blocker is forage volume/targets, not identification or shelling (sim-packcomp-b evidence).
- [open] 2026-11-01 — food-economy / scholar supply — identification alone worthless on this band: all of 51103's unknown value is nut species (still in-shell after identification) and 51108's only unknown value is must-cook nettle (still unprocessed after identification); future identification levers need a non-nut, non-must-cook band or must bundle with shelling (sim-packcomp-b evidence).

## Infrastructure (loud, per task)

- EPERM FLAP blocked all git writes for ~25 minutes mid-run
  (hash-object, read-tree lock writes, and the worktree-heartbeat
  registry write all returned Operation not permitted; plain file
  writes worked throughout). The prereg file itself was written
  and its content frozen BEFORE any sim; only its commit was
  delayed by the flap. No sim — judged or control — ran before
  the prereg commit landed.
- DUPLICATE PREREG COMMIT (harmless, reported loudly): a
  background commit-retry loop (started during the flap) and a
  foreground retry both landed within the same minute:
  bca3458f9 and fac560ec2, identical message, IDENTICAL TREES
  (verified: same tree hash b0335d6f...). The second commit is a
  content-identical duplicate, not a divergence; it merges
  --ff-only cleanly. It was NOT reset away (branch-tip surgery
  during a flap risks orphaning something the coordinator saw).
- INDEX CLOBBER hit both subsequent safe-commits (the known
  class): after each commit the worktree index showed the
  just-committed files as staged deletions plus untracked.
  Repaired both times via git update-index --add --cacheinfo
  from HEAD blobs; verified with git status --short empty (modulo
  the next batch of new files) and git diff HEAD empty. The
  commits themselves were verified correct (a54fd9a: 4 files,
  773 insertions).
- Zero flap losses on the judged pilot: all 8 seeds landed first
  try, every line JSON-verified after landing. The driver's
  callback-based stdout retry was not exercised.
- Sibling trees untouched: sim-dawnblock-a, sim-titangate-a
  (Loop A), sim-dipslide-b (Loop B) never read, written, or
  merged. Main tree at ~/workspace/the-scattering never touched.

## Files

- Prereg: evidence/2026-11-01/sim-packcomp-b-prereg.md
- Driver: scripts/packcomp-b-driver.js
- Counterfactual: scripts/packcomp-b-count.js
- Analyzer: scripts/analyze-packcomp-b.js
- Proof test: scripts/test-packcomp-b.js (15 pure checks;
  live control --live-control on non-pilot seed 51109)
- Pilot census: evidence/2026-11-01/sim-packcomp-b.jsonl
  (8 lines), sim-packcomp-b-census.json (analyzer summary +
  full per-return item tables)
- Corpus extracts: evidence/2026-11-01/sim-packcomp-b-corpus/
  51103-day30-return.txt, 51104-day17-return.txt,
  51107-day24-return.txt, 51108-day3-return.txt
