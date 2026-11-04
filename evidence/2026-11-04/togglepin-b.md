# Togglepin-b — arm-2 sub-lever attribution, PINNED at r118's base: MORALE CREDITED, others pilot-non-attributed (Loop B, 2026-11-04)

## Verdict (prereg-gated, not re-scored)
- STAGE 0 GATE: PASS. V-full on the pinned base (ff1725835, r118's
  exact base) reproduces r118 outcome class on 3/3 pilot seeds AND,
  on the full block, on 7/7 seeds — with sat days EXACT (d99, d113,
  d102). Zero class drift, zero sat-day drift. The pinned checkout
  + tooling-copy method reproduces r118 deterministically. This is
  the calibration the 0330Z toggle-b run could not get on current
  master, and it is what its verdicts stand on.
- STAGE 1 SCREEN: MORALE advances (1 pilot flip). SIGDMG, GEAR,
  TRICKHOLD: 0 pilot flips → NON-ATTRIBUTED on pilot alone
  (fast kill — no full block, per prereg). That is a statement
  about outcome class on these three seeds, NOT "no effect":
  GEAR moved sat days and fight counts heavily without changing
  pilot classes, and SIGDMG moved 89705's sat day and kill count.
- STAGE 2 FULL BLOCK: MORALE CREDITED with pinned-base behavior.
  Moraleoff flips 3/7 seeds vs V-full, and on all three the V-full
  class matches r118's class for that seed — the prereg's CREDITED
  condition, met three times over. Direction is MIXED, and that
  matters more than the count: removing party-pool morale RESCUES
  two seeds V-full scatters (89701, 89704) and LOSES one seed
  V-full wins (89706). Arm 2's party morale is not "the fix" or
  "the bug" — it is a live wire that moves whole villages, both
  ways, through low-wave field fights the wave-4 census never sees.
- No full seat anywhere, on any variant. The wave-5 door opens on
  exactly one run in the whole arm (V-alloff 89705, uw5) — and that
  run still sits lesser, d90.

## Stage 0 — determinism/calibration (6 runs, pinned base)
V-full pilot vs r118: 89702 won lesser d99 (r118 d99) ✓, 89704
scattered (r118 scattered) ✓, 89705 won lesser d113 uw4 (r118
d113 uw4) ✓ — 3/3, sat days exact. Gate threshold was ≥2/3.
V-alloff pilot (same-base control record, NOT gated vs r118/r110):
89702 won lesser d103, 89704 scattered d54, 89705 won lesser d90
uw5 (wave-5 reached). The r110 comparison is void on this base by
design (see prereg); alloff's pilot classes match V-full's on all
three seeds, with sat days moved (+4, −23) and one wave-5 reach
gained. Proof script sanity: 3/3 class matches, PASS.

## V-full full block vs r118 (7 seeds, the judged baseline)
| seed | plan | r118 class | V-full pinned | match |
|---|---|---|---|---|
| 89701 | waves | scattered | scattered d90, alive 2, uw3 | ✓ |
| 89702 | waves | won lesser d99 | won lesser d99, uw4 | ✓ exact |
| 89703 | waves | scattered | scattered d52, alive 2, uw4 | ✓ |
| 89704 | forcedrift control | scattered | scattered d90, alive 1, uw3 | ✓ |
| 89705 | wavesnw | won lesser d113 uw4 | won lesser d113, uw4 | ✓ exact |
| 89706 | wavesnw | won lesser d102 | won lesser d102, uw4 | ✓ exact |
| 89707 | wavesnw | scattered | scattered d58, alive 5, uw3 | ✓ |
7/7 classes, 3/3 sat days exact. The pinned base IS r118's run,
reproduced, not approximated.

## Stage 1 — toggle screen (12 runs, pilot seeds)
Flip = outcome class differs from same-base V-full. (Wave-5 flag
is reported alongside; no verdict in this arm hinges on the
class-vs-flag distinction — every morale flip below is a class
flip, and the one wave-5-flag-only change, valloff-89705, is
descriptive.)
| variant | 89702 | 89704 | 89705 | flips | verdict |
|---|---|---|---|---|---|
| sigoff (SIGDMG) | won d99 = | scattered = | won d108 (was d113), kills 3 (was 4) | 0 | NON-ATTRIBUTED (pilot) |
| gearoff (GEAR) | won d90 (was d99), fights 3 (was 10), kills 0 (was 1) | scattered d89 | won d97 (was d113), fights 3 (was 7) | 0 | NON-ATTRIBUTED (pilot) |
| moraleoff (MORALE) | won d95 (was d99) | scattered → WON lesser d91 | won d90 (was d113) | 1 | ADVANCES |
| trickoff (TRICKHOLD) | won d90 (was d99), kills 3 (was 1) | scattered d83 | won d90 (was d113), kills 0 (was 4) | 0 | NON-ATTRIBUTED (pilot) |
Notes: sigoff-89702 and sigoff-89704 are BYTE-IDENTICAL to V-full
— the sigW4 lever never engages on those seeds. Gearoff and
trickoff move trajectories a lot (sat days −9 to −23, fight
counts halved or kills swung 1↔3) without changing any pilot
class: class-screen non-attribution is not effectlessness, and
a future screen on other seeds could still credit them. They get
no full block here because the prereg's fast kill binds.

## Stage 2 — full block (12 runs: remainders; pilot runs reused,
determinism already proven exact, so no re-runs were spent)
### Moraleoff full block vs V-full (7 seeds)
| seed | V-full | moraleoff | flip? |
|---|---|---|---|
| 89701 | scattered d90 | WON lesser d95, alive 1, 12 census fights, 3 kills | YES — rescue |
| 89702 | won lesser d99 | won lesser d95 | no (sat −4) |
| 89703 | scattered d52 | scattered d55 | no |
| 89704 | scattered d90 | WON lesser d91, alive 6 | YES — rescue |
| 89705 | won lesser d113 | won lesser d90 | no (sat −23) |
| 89706 | won lesser d102 | SCATTERED d48, alive 4 | YES — loss |
| 89707 | scattered d58 | scattered d77 | no |
Moraleoff tally: lesser wins 4/7, scattered 3/7, wave-5 0/7,
median survival 90d (V-full: 3/7, 4/7, 0/7, 90d). Net wins +1,
gross movement 3 seeds. Every flipped seed's V-full class matches
r118 → MORALE CREDITED.
### V-alloff full block vs V-full (control, 7 seeds)
Class flips 2/7: 89703 scattered → won lesser d106; 89706 won
lesser d102 → scattered. Plus 89705 wave-5-flag change (won
lesser d90, uw5 — the arm's only wave-5 reach) with class
unchanged. Tally: lesser wins 3/7, scattered 4/7, wave-5 1/7,
median 90d. Note the interaction shape, descriptively: alloff
rescues 89703 (moraleoff does not) and does NOT rescue 89701
(moraleoff does); both lose 89706. The four levers together do
not equal morale alone — but no combo verdict is claimed here;
unregistered combos were not run, per prereg.

## Flip mechanisms (first-divergence analysis, not just counts)
All three morale flips run through LOW-WAVE field fights — the
wave-4 census legitimately shows nothing for them, because the
census tracks wave-4 fights only. The morale lever (rtd: with a
live ally standing, hopeless/winning compares party HP pool vs
total incoming, not the leader alone) changes flee/fight behavior
in ordinary party fights, and the village-level consequences
compound from there. Each flip was traced to its first divergence:
- 89701 (rescue): trajectories identical until day 10. V-full
  loses Ivan to a monster on day 10; moraleoff loses nobody then
  (first death Yaqi, ambush, day 13). V-full cascades to a day-90
  hunger scatter ("third hungry day"); moraleoff sits lesser d95
  with 1 alive, pantry 5210. A day-10 party fight's hopeless call
  is the fork.
- 89704 (rescue, the control seed): trajectories identical
  through day 75 (standing + wave traces). Day 75/76: V-full loses
  Teboho to a monster; moraleoff loses Luis to wound-fever
  instead, faces one more wave-3 type, and holds armored 4 / armed
  4 where V-full holds 3 / 3. V-full scatters d90 on hunger
  ("fifth hungry day", pantry 0, 1 alive); moraleoff sits lesser
  d91 with 6 alive, pantry 17755, after a day-90 feast + surge.
  The diverging fight is a non-wave-4 party fight (census empty
  on both sides) — exactly the class of fight the arm-2 morale
  change was built for, and here it HURTS the V-full village.
- 89706 (loss): divergence day 23–24 — a crisis-count split
  (V-full crises 2, moraleoff 1) and a wound death: V-full loses
  Eamon Lan to an unclosing wound day 23, moraleoff loses Rasha
  Mahmoud to the same cause day 33, and moraleoff's village
  never recovers, scattering d48 on hunger, where V-full goes on
  to win lesser d102 (including a day-71 Congregation fight that
  costs a villager but does not break the village). Same lever,
  opposite direction.
Context: the 2026-10-28 tile-party note (sim-findings #1382)
hypothesized that leader-only hopeless morale makes parties flee
round 2–3 no matter how many hands join, and named a staying /
morale arm as the ranked next step. Arm 2's party-pool morale
WAS that answer's shape — and this run measures it: it moves
outcomes on 3/7 matched seeds, but it does not move them in one
direction. A lever that rescues two villages and loses a third
is not a tuning knob to turn up; it is a behavior whose
hopeless/winning judgment needs a design look (which fight
states should read as hopeless for a party, and what fleeing
costs the village afterward), not a bigger number.

## Scale-wall numbers (judged corpora, plain words)
- V-full block (7): lesser wins 3, full seat 0, national-or-better
  at end 0 (best end-scale regional; 89707 ends village), wave-4
  unlocked 4/7 (89702, 89703, 89705, 89706), wave-5 reached 0/7,
  median survival 90d (days 52–113).
- Moraleoff block (7): lesser wins 4, full seat 0, end-scale
  global on 2 seeds (89702, 89705 — both still lesser seats),
  wave-4 unlocked 4/7, wave-5 0/7, median survival 90d.
- V-alloff block (7): lesser wins 3, full seat 0, end-scale global
  on 1 seed (89705, lesser seat + uw5), wave-4 unlocked 5/7,
  wave-5 reached 1/7 (89705 only), median survival 90d.
- In plain words: on this matched block, villages still win
  lesser seats and never the full seat, with or without arm 2;
  removing arm 2 entirely opens the wave-5 door once (89705)
  without producing a wave-5 kill or a full seat; removing party
  morale alone opens no wave-5 door at all. The binding constraint
  on this block is not the toggle — it is everything downstream
  of sitting lesser: standing, veterans, and wave-5 facing, none
  of which any single-OFF variant moves to a win.

## Sense-reading (SENSE-TESTING LAW)
Read end to end: moraleoff-89701's announce slice (announce d95
→ sit d95). It reads as one coherent village story, not a
counter artifact: foraging and Haven returns with honest empty
messages ("This patch is worked out"), a dry cistern with a real
choice attached, butchering with yields, sowing with honest
timers — then the table announce, an audit that names real deeds
(waves 1–3 faced 15/9/7, 7 wave-4 fought, 9 contests, 4 crises),
a war-path beat naming real kills with days (Nadia d76, Marcus
d66, both vs Big Ugly), a ledger read that admits broken
promises, and a beloved finale spent naming unfilmed villages
and the dead. The flipped seeds' endings are likewise honest:
both scatters (V-full 89701/89704/89706-moraleoff) carry the
hunger-scatter narration with the hungry-day count, pantry 0,
and a named remnant — not a crash, not a silent death, not a
repeated line. No robotic, static, or repeated villager behavior
was flagged in the judged corpora; no out-of-arm finding is
appended to sim-findings.md from this run (the morale verdict
itself is this run's report, and the older morale backlog items
concern different bands and are not marked by this arm).

## Village assessment (plain words)
On the pinned base these seven villages are the r118 villages,
exactly: three sit lesser, four scatter, none reaches the full
seat. The villages that sit do so with 6–8 people alive and a
real fight history behind them; the villages that scatter do so
on hunger after losing people early — Ivan on day 10, Teboho on
day 75, the slow wound-and-sickness attrition of the 89704
control. What is missing is not gear or wave access on this
block: wave-4 is unlocked on most seeds, fighters are armed and
armored by the end on the sitting seeds, and the wave-5 door
opens exactly once without a kill behind it. The blank this run
fills is narrower and firmer than that: of arm 2's four
sub-levers, party morale is the one that moves matched-seed
outcomes, and it moves them both ways through ordinary party
fights. The blank it documents is the rest of the attribution:
sigW4 damage, ally gear parity, and known-trick hold show no
outcome-class effect on these three pilot seeds, and whether
they move other seeds is still open — it was not measured here,
and must not be reported as "no effect."

## Telemetry deviation check
Declared INAPPLICABLE, not run: same reason as toggle-b — the
corpus is matched-seed classification, and the endgame baseline
is the same stale, regime-unrecorded file r118 already flagged
(its own text forbids pre-seat comparisons). Running the check
would manufacture LOUD lines against a baseline that does not
describe this regime. No compare is fabricated. §15 balanced
panels do not apply to this diagnostic: the instrument is the
matched-seed classification itself, and the prereg staged design
governs.

## Convergence state
Morale: CREDITED (pinned-base behavior, mixed direction).
SigW4 / gear / trickhold: NON-ATTRIBUTED on pilot alone — open,
not killed. Arm-2 attribution question: partially answered.
Next blank (named, NOT run): (a) re-screen sigoff / gearoff /
trickoff on a fresh seed set, since pilot non-attribution covers
only 89702/89704/89705 classes and gearoff/trickoff already move
trajectories heavily; (b) a design look at the party
hopeless/winning judgment itself — what a party should read as
hopeless, and what fleeing should cost — before any morale
re-tuning, since the lever's direction is seed-dependent. Do NOT
run unregistered pairwise combos on this arm's authority; if a
combo run is wanted, it needs its own prereg (the alloff-vs-
moraleoff shape above is its motivation, not its license).

## Metric review (for the NEXT run, not this one)
- The one-sided Stage 0 gate worked exactly as designed: pinning
  to r118's base turned calibration from a drift argument into a
  determinism check, and it passed 7/7 with sat days exact. Keep
  pinned-base re-registration as the pattern for any future
  historical-block attribution; never calibrate a later base
  against a historical block again.
- The class-only flip screen is coarse in a useful way (it fast-
  killed three variants on 12 runs) but it hides trajectory
  movement: gearoff's sat-day shifts (−9, −16) and fight-count
  halving, and trickoff's kill swings (1↔3, 4↔0), are real lever
  effects that a class screen scores as zero. A future screen
  should carry sat-day / kill-count movement as a secondary
  screen (descriptive, not a re-score) so "0 flips" is never
  misread as "inert."
- The wave-4-only census is blind to the fights that actually
  flipped seeds here (all low-wave party fights). Any future
  morale/staying arm needs a low-wave field-fight census, or it
  will keep reporting "0 fights" for villages whose fates were
  decided in fights it never recorded.
- The morale verdict's mixed direction means the NEXT morale
  prereg must pre-register direction handling: a lever that
  flips seeds both ways cannot be judged by net wins alone; the
  judge must be gross flips + mechanism per flip, as here.

## Proof results
- Variant constructor (scripts/apply-toggle-variant-20261104.py,
  from master): all four single-OFF variants + alloff apply
  cleanly on the pinned base; alloff verified byte-equal to
  d8f334da8^ for both src/js files BEFORE any sim (`git diff
  d8f334da8^ -- src/js/` empty); every variant restored to the
  pinned tree after its run (`git diff --quiet -- src/js/` clean
  at every stage boundary). Hunk map as prereg: SIGDMG 3 hunks /
  GEAR 7 hunks + comment line / MORALE 1 hunk + comment line /
  TRICKHOLD 1 hunk; zero unmapped hunks.
- Pinned-tree method: `git checkout ff1725835 -- src index.html
  scripts`, three tooling scripts copied back from master; probe
  ran unmodified on the pinned harness (no tooling adaptation
  was needed). Final restore returns src/ + index.html (+
  scripts/) to HEAD; verified below before commit.
- Probe (scripts/probe-toggle-b-20261104.js): r118 probe verbatim
  except OUTDIR/PREFIX params. All probe .err files empty (30
  runs total: 6 Stage 0 + 12 Stage 1 + 12 Stage 2), no crashes.
- Classifier (scripts/classify-toggle-b-20261104.js) + proof
  script (scripts/test-togglepin-b-20261104.js): sanity 3/3 vs
  r118 pilot classes, PASS; flips accounting run for every
  variant vs V-full. Sigoff byte-identity on 89702/89704
  confirmed with cmp.
- No game-code change is committed or landed by this arm.
  Branch holds evidence/scripts only, as briefed. No jest suite
  was run (no game code is committed or landed by this
  diagnostic arm; the variant code was restored before
  closeout).
- Index-clobber class hit twice (after the Stage 0 and Stage 1
  safe-commits: committed files showed staged-as-deleted);
  repaired both times via HEAD-blob cacheinfo and re-verified
  status before continuing. Both commits verified correct via
  `git show --stat` before repair.

## Commits (branch sim-togglepin-b, ready for coordinator merge, pending ship)
- 6538700a6 — togglepin-b prereg (pinned-base method, one-sided
  Stage 0 gate, r110 target void on pinned base).
- 42aed4f9 — togglepin-b Stage 0 (V-full 3/3 vs r118, V-alloff
  pilot control, proof script).
- 150514bc — togglepin-b Stage 1 (moraleoff flips 89704;
  sigoff/gearoff/trickoff 0 pilot flips).
- (Stage 2 + this note follow in the closeout commit — per-seed
  outputs, logs, and this note.)
- No push, no bump, no live check — merged locally, pending ship
  (ship loop owns version bumps, pushes, live verification).
