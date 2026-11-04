# Togrescreen-b — FRESH-SEED re-screen of SIGDMG / GEAR / TRICKHOLD (Loop B, run fleshout-loop-b-20261104T0550Z)

DIAG arm, attributes only. No game code changes land from this arm.

## Verdict (prereg-gated, not re-scored)
- STAGE 0 GATE: PASS. All variants construct cleanly; V-alloff
  verified byte-equal to pre-arm2 blobs before any sim; V-full
  completed on all 8 fresh seeds with empty .err files; a 2-seed
  V-full repeat run (89801 won-lesser, 89807 long scatter) is
  BIT-IDENTICAL (per-seed JSON + transcript bytes).
- GEAR (ally gear parity): CREDITED on the fresh set — 3/8 class
  flips vs V-full, meeting the pre-registered ≥2 threshold.
  Direction is MIXED, like morale in 0445Z: gearoff rescues
  89802 (scattered d27 → won lesser d93) and 89807 (scattered
  d155 → won lesser d90) and loses 89803 (won lesser d90 →
  scattered d83). Ally gear parity is a live wire, not a knob
  to turn up: removing it moves whole villages both ways.
- SIGDMG (sigW4 double damage): NON-ATTRIBUTED on the fresh set
  — 0/8 class flips. Not "no effect": 89805 moves (130d/10
  fights → 109d/7 fights) and 89807 moves (155d/18 fights →
  144d/17 fights); the other six seeds are byte-identical to
  V-full (the sigW4 lever never engages there). Combined with
  0445Z (0 pilot flips, one sat-day move), SIGDMG has now
  failed to flip a class on 11 distinct seeds — the strongest
  non-attribution of the three, but still not "inert."
- TRICKHOLD (known-trick hold): NON-ATTRIBUTED on the fresh set
  — 1/8 class flips, below the pre-registered ≥2 threshold.
  The one flip is a loss: 89801 (won lesser d107 → scattered
  d131). Trajectory moves are heavy elsewhere (89803 sat
  90 → 118 with fights 6 → 1; 89805 fights 10 → 0; 89807
  155d/18 fights → 80d/5 fights). One flip short of credit;
  a further seed set could still credit it, and must not be
  reported as "no effect."
- V-alloff control (descriptive only): 4/8 flips — rescues 89802
  (d96) and 89804 (d161), loses 89801 and 89803. Alloff ≠ any
  single-OFF variant (it rescues 89804, which no single-OFF
  variant rescues, and does NOT rescue 89807, which gearoff
  does). Interaction shape noted descriptively; no unregistered
  combos were run.
- MORALE was not re-run (already CREDITED, 0445Z). Arm-2
  attribution now stands: MORALE credited, GEAR credited,
  SIGDMG non-attributed (0/11 seeds flipped), TRICKHOLD
  non-attributed (1/8 fresh flips + 0 pilot flips).

## Method (prereg: sim-togrescreen-b-prereg.md, committed before sims)
- Pinned base ff1725835 (r118's base; d8f334da8 verified an
  ancestor, so arm 2 is ON in V-full). Pinned-tree checkout
  method as 0445Z (branch HEAD untouched during sims; final
  restore to HEAD verified: `git diff HEAD -- src/ index.html`
  empty). One deviation from the brief's wording, recorded in
  the prereg: "detach HEAD" was implemented as the 0445Z
  pinned-tree checkout, which is strictly safer and already
  proven to reproduce r118 deterministically.
- Fresh seeds 89801–89808 (never used by 89701–89707 runs).
  Plan map (probe copy scripts/probe-togrescreen-b-20261104.js;
  the 0445Z probe defaults unknown seeds to 'grey', which would
  NOT be the 0445Z policy, hence the copy): 89801–89803 waves,
  89804 forcedrift control, 89805–89808 wavesnw. Policy:
  capable+deedhunt, greedy defaults MAXTIER 4 / LASTDAY 145,
  armorydrive + fullseat-diag + vetguard on waves seeds.
  Env FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1
  CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1. Horizon 180d
  death-aware (dead villages stop; the observed sat range
  d90–d161 and scatter range d25–d155 both fit inside it).
- Stage 0 construction note: two post-pinned HEAD files
  (src/js/villager-goals.js, win-plan.js) survive a pinned
  path-checkout because they are absent from ff1725835. They
  are NOT loaded under the pinned tree: the harness greps the
  script list from index.html, and the pinned index.html does
  not reference them (verified: 0 matches). They were briefly
  moved aside, which broke the variant constructor's clean-tree
  check (it reads worktree-vs-index), so they were restored —
  inert under the pinned index.html — and the chain then ran
  clean. Final restore to HEAD returns them to their HEAD state.
- Runs: 8 V-full + 2 repeat + 32 Stage 1 = 42 probe runs, all
  with empty .err files. Per-seed corpora:
  evidence/2026-11-04/perseed-togrescreen-b/ (vfull-, sigoff-,
  gearoff-, trickoff-, valloff- prefixes) and the repeat dir
  perseed-togrescreen-b-repeat/.

## V-full fresh baseline (8 seeds, the judged reference)
| seed | plan | class | days | alive | end-scale | uw | fights | kills |
|---|---|---|---|---|---|---|---|---|
| 89801 | waves | won lesser d107 | 107 | 7 | regional | 4 | 3 | 0 |
| 89802 | waves | scattered | 27 | 2 | village | 3 | 0 | 0 |
| 89803 | waves | won lesser d90 | 90 | 4 | regional | 4 | 6 | 1 |
| 89804 | forcedrift | scattered | 33 | 8 | village | 3 | 0 | 0 |
| 89805 | wavesnw | scattered | 130 | 2 | regional | 4 | 10 | 0 |
| 89806 | wavesnw | scattered | 41 | 2 | village | 3 | 0 | 0 |
| 89807 | wavesnw | scattered | 155 | 0 | regional | 4 | 18 | 0 |
| 89808 | wavesnw | scattered | 89 | 1 | regional | 3 | 0 | 0 |
Tally: lesser wins 2/8, full seat 0/8, wave-4 unlock 4/8,
wave-5 unlock 0/8, wave-5 faced 0/8, max wave faced 4,
median survival 89.5d. Table entered/won 2/8 (the two lesser
sits); firstFullSeatDay-ever 0/8; readiness-5-ready-ever 0/8;
peak standings 0–199 (sitting seeds 165, 170).

## Stage 1 — fresh screen (flips vs V-full; sat-day/fight moves descriptive)
### SIGDMG — sigoff: 0/8 flips → NON-ATTRIBUTED
| seed | V-full | sigoff | move |
|---|---|---|---|
| 89801 | won d107 | won d107 | identical |
| 89802 | scat d27 | scat d27 | identical |
| 89803 | won d90 | won d90 | identical |
| 89804 | scat d33 | scat d33 | identical |
| 89805 | scat d130, 10 fights | scat d109, 7 fights | days −21, fights −3 |
| 89806 | scat d41 | scat d41 | identical |
| 89807 | scat d155, 18 fights | scat d144, 17 fights | days −11, fights −1 |
| 89808 | scat d89 | scat d89 | identical |
Six seeds byte-identical (JSON cmp): the sigW4 lever never
engages there. Tally: wins 2/8, wave-4 4/8, wave-5 0/8, median
89.5d — the same block tally as V-full.
### GEAR — gearoff: 3/8 flips → CREDITED (mixed direction)
| seed | V-full | gearoff | flip? |
|---|---|---|---|
| 89801 | won d107, 3 fights | won d109, 5 fights | no (sat +2) |
| 89802 | scat d27, 0 fights | WON lesser d93, 4 fights | YES — rescue |
| 89803 | won d90, 6 fights, 1 kill | scat d83, 0 fights | YES — loss |
| 89804 | scat d33 | scat d25 | no |
| 89805 | scat d130, 10 fights | scat d31, 0 fights | no (days −99!) |
| 89806 | scat d41 | scat d40 | no |
| 89807 | scat d155, 18 fights | WON lesser d90, 10 fights, 1 kill | YES — rescue |
| 89808 | scat d89, 0 fights | scat d154, 6 fights, 1 kill | no (days +65) |
Tally: wins 3/8, full 0/8, wave-4 4/8, wave-5 0/8, median
86.5d; table entered/won 3/8; end-scale global on 2 seeds
(89802 won, 89808 scattered). Net wins +1, gross movement 3
seeds — the same shape as morale in 0445Z.
### TRICKHOLD — trickoff: 1/8 flips → NON-ATTRIBUTED (threshold ≥2)
| seed | V-full | trickoff | move |
|---|---|---|---|
| 89801 | won d107, 3 fights | SCAT d131, 10 fights | YES — loss (only flip) |
| 89802 | scat d27 | scat d27 | identical |
| 89803 | won d90, 6 fights, 1 kill | won d118, 1 fight | sat +28, fights −5 |
| 89804 | scat d33 | scat d33 | identical |
| 89805 | scat d130, 10 fights | scat d101, 0 fights | days −29, fights −10 |
| 89806 | scat d41 | scat d36 | days −5 |
| 89807 | scat d155, 18 fights | scat d80, 5 fights | days −75, fights −13 |
| 89808 | scat d89 | scat d91 | days +2 |
Tally: wins 1/8, full 0/8, wave-4 3/8, wave-5 0/8, median
85.5d; table entered/won 1/8; end-scale global on 89807
(scattered). One flip short of credit — do not report as
"no effect" or as "nearly credited" either; the prereg's
threshold binds, and the verdict is NON-ATTRIBUTED with a
recorded flip and heavy trajectory movement.
### V-alloff control (descriptive): 4/8 flips
89801 won d107 → scat d27 (loss); 89802 scat d27 → won d96
(rescue); 89803 won d90 → scat d160, 14 fights, 3 kills
(loss); 89804 scat d33 → won d161, 9 fights (rescue);
89805/89806/89807/89808 no class flip (days move −72/−13/
−71/−13). Tally: wins 2/8, wave-4 2/8, wave-5 0/8, median 80d.

## Flip mechanisms (first-divergence notes; census is wave-4-only)
The wave-4 census does not record the low-wave party fights
that fork these villages (0445Z metric-review caveat, still
applies). First-divergence below is the first fallen-list
difference between matched runs — the earliest named death
that differs — plus the wave-4 census contrast. Low-wave
fights are the unrecorded fork; the census shows only the
downstream wave-4 consequences.
- gearoff-89802 (rescue): V-full dies out by d27 with ZERO
  census fights — a starvation/sickness/wound cascade (Aria
  d16 sickness, Matías d16 thirst, then four d25–d27
  starvation/wound deaths, pantry 0). Gearoff's first death
  differs immediately (Aria d13 'the wild', Matías d21
  monster); the village goes on to fight 4 census fights,
  talk down two wave-4s (audit d86, congregation d92), and
  sit lesser d93 with pantry 7400. Removing ally gear does
  not "add" fights directly — it changes low-wave party
  fights, and the village that survives those survives.
- gearoff-89803 (loss): V-full sits d90 with 6 census fights
  and a kill (influencer d49); gearoff never records a
  census fight at all and scatters d83 on hunger (pantry 0).
  First fallen difference: Manaaki d28 sickness (gearoff)
  vs Sam d31 wound (V-full); gearoff's deaths then run
  sickness → monster → starvation (16 fallen vs 13).
  The village that fought its way to the table in V-full
  never gets to a census fight without ally gear.
- gearoff-89807 (rescue): V-full grinds 155 days through 18
  census fights with 0 kills and dies out (0 alive, last
  deaths dehydration d155). Gearoff fights 10, kills a
  congregation d85, and sits d90 with 6 alive. First fallen
  difference is day 10 itself (Ramiro monster vs Carlos
  wound) — the fork is early and low-wave, the payoff late.
- trickoff-89801 (loss): V-full sits d107 with 3 census
  fights; trickoff fights 10 census fights with 0 kills,
  takes a table withdrawal beat at d110 (the table prices
  the run but refuses on food-thesis grounds — "NO FEAST,
  NO SURGE"), and scatters d131 with pantry 0. First fallen
  difference: Marcus d7 monster (V-full) vs Lucia d13
  'the wild' (trickoff). The known-trick hold's removal
  costs the village its early monster kill and, downstream,
  its feast standing.
Census-fight totals across the block underline the fork
class: V-full 37 fights / 1 kill; gearoff 25 / 2; trickoff
16 / 0; sigoff 33 / 1; valloff 23 / 3. No variant produces a
wave-5 facing, a wave-5 kill, or a full seat.

## Scale-wall numbers (judged corpora, plain words)
- V-full (8): lesser wins 2, full seat 0, table entered/won
  2, wave-4 unlocked 4/8, wave-5 reached 0/8, wave-5 faced
  0/8, readiness-5-ready-ever 0/8, median survival 89.5d.
- Sigoff (8): lesser 2, full 0, wave-4 4/8, wave-5 0/8,
  median 89.5d.
- Gearoff (8): lesser 3, full 0, wave-4 4/8, wave-5 0/8,
  median 86.5d.
- Trickoff (8): lesser 1, full 0, wave-4 3/8, wave-5 0/8,
  median 85.5d.
- V-alloff (8): lesser 2, full 0, wave-4 2/8, wave-5 0/8,
  median 80d.
- In plain words: on this fresh block, villages still win
  lesser seats and never the full seat, with or without any
  single arm-2 sub-lever. Removing ally gear parity is the
  only single-OFF change that moves the win count (+1 net),
  and it does so by rescuing two villages while losing a
  third — the same mixed-direction shape as party morale.
  Nothing here opens the wave-5 door: the binding constraint
  on this block is downstream of sitting lesser (standing,
  veterans, wave-5 facing), exactly as in 0445Z.

## Sense-reading (SENSE-TESTING LAW)
Read end to end: both gearoff rescues' announce slices.
89802's reads as one coherent village story — foraging with
honest empty messages, a road food gift with a named trust
beat ("That's what the fire network is FOR"), an honest
granary feast, then a table audit and a finale that names
keepsakes (compass, wedding ring, locket) with their lived-in
histories. 89807's audit names real deeds (waves 1–3 faced
18/11/4, 6 wave-4 fought, 10 contests, 4 crises) and a real
kill (Ugly-Eyes, day 85), and its war-path beat names the
wave-5 bar honestly (3 of 4 fighters armored, 1 of 2
veterans). The loss transcripts are full-run captures with
honest hunger narration (starving warnings, half rations,
pantry-check decisions) — not crashes, not silent deaths,
not repeated lines. No robotic, static, or repeated villager
behavior was flagged in the judged corpora; no out-of-arm
finding is appended to sim-findings.md from this run.

## Village assessment (plain words)
On the pinned base these eight fresh villages are harsher
than the 0445Z block: only two sit lesser, six scatter, and
four of the six never record a single wave-4 census fight —
they die of hunger, sickness, and wounds before the wave-4
story starts. The villages that sit do so with 3–7 people
alive and a real fight history; the villages that scatter
do so on hunger after losing people early (day-13 to
day-27 cascades) or after grinding 130–155 days through a
dozen-plus fights without a kill. What is missing is not
wave access on this block: wave-4 is unlocked on half the
seeds and faced on most, but kills are nearly absent (1
census kill in the whole V-full block) and no village ever
banks the two living veterans the wave-5 door demands.
The blank this run fills is the rest of the attribution:
ally gear parity moves matched-seed outcomes both ways and
is now credited alongside party morale; sigW4 damage and
known-trick hold do not meet the credit threshold on fresh
seeds, with trickhold one flip short and sigW4 flipping
nothing on eleven seeds total. The blank it documents is
the same one 0445Z left: the hopeless/winning judgment
itself — gear and morale both move villages both ways
through ordinary party fights, so the next design look is
at what a party should read as hopeless and what fleeing
should cost, not at bigger numbers on either lever.

## Telemetry deviation check
Declared INAPPLICABLE, not run: same reason as 0445Z/toggle-b
— the corpus is matched-seed classification, and the endgame
baseline is the same stale, regime-unrecorded file whose own
text forbids pre-seat comparisons. No compare fabricated.
§15 balanced panels do not apply to this diagnostic: the
instrument is the matched-seed classification itself, and
the prereg staged design governs.

## Convergence state
GEAR: CREDITED (fresh-set behavior, mixed direction).
SIGDMG: NON-ATTRIBUTED (0/8 fresh + 0 pilot = 0/11 seeds flipped).
TRICKHOLD: NON-ATTRIBUTED (1/8 fresh + 0 pilot; threshold ≥2).
Arm-2 attribution question: answered — MORALE credited,
GEAR credited, SIGDMG and TRICKHOLD non-attributed (not
killed: trajectory movement recorded, further screens could
still credit trickhold). Next blank (named, NOT run): the
party hopeless/winning judgment design look (0445Z blank
(b)), now strengthened by gear's mixed-direction credit —
both credited levers move villages both ways through
ordinary party fights. Do NOT run unregistered pairwise
combos on this arm's authority; a combo run needs its own
prereg (the alloff-vs-single-off shape above is its
motivation, not its license).

## Metric review (for the NEXT run, not this one)
- The fresh-seed screen worked as designed: the ≥2-flip
  threshold separated gear (3, credited) from trickhold (1,
  not credited) without re-scoring, and the trajectory-move
  tables kept "0/1 flips" from being misread as "inert."
  Keep the threshold + trajectory-table pairing for any
  future screen.
- The fresh set is harsher than the 0445Z block (2/8 wins vs
  3/7) and four seeds never reach a census fight — on such a
  block, class flips are driven by early survival cascades
  as much as by fight mechanics. A future screen on a
  harsher band should pre-register whether early-scatter
  seeds count equally (they did here, per prereg) or are
  stratified.
- The wave-4-only census continues to blind the analysis to
  the fights that fork villages (all four flips here fork
  in low-wave fights). Any future morale/gear/staying arm
  needs a low-wave field-fight census, or it will keep
  reporting fight counts that miss the deciding fights.
- The Stage 0 gate's repeat check (2 seeds bit-identical)
  plus empty .err files on all 42 runs is the right weight
  for a fresh-seed arm with no historical reference: cheap
  (2 runs) and it rules out construction/determinism failure
  before the 32-run spend.

## Proof results
- Variant constructor (scripts/apply-toggle-variant-20261104.py,
  from master): sigoff 3 hunks, gearoff 7 hunks + comment
  line, trickoff 1 hunk, alloff all four — all apply cleanly
  on the pinned base; alloff verified byte-equal to
  d8f334da8^ for both src/js files BEFORE any sim; every
  variant restored to the pinned tree after its run
  (`git diff --quiet -- src/js/` clean at every stage
  boundary). Final restore returns src/ + index.html (+
  scripts/) to HEAD; verified below before commit.
- Probe (scripts/probe-togrescreen-b-20261104.js): 0445Z probe
  verbatim except the PLAN map extended for 89801–89808.
  All probe .err files empty (42 runs: 8 V-full + 2 repeat +
  32 Stage 1), no crashes.
- Classifier (scripts/classify-togrescreen-b-20261104.js) +
  proof script (scripts/test-togrescreen-b-20261104.js):
  integrity 8/8 on all five variants; flips accounting run
  for every variant vs V-full; repeat 2/2 bit-identical,
  PASS; sigoff byte-identity on 6/8 seeds confirmed with cmp.
- No game-code change is committed or landed by this arm.
  Branch holds evidence/scripts only, as briefed. No jest
  suite was run (no game code is committed or landed by
  this diagnostic arm; variant code was restored before
  closeout).
- Index-clobber class hit once (after the prereg safe-commit:
  committed files showed staged-as-deleted); repaired via
  HEAD-blob cacheinfo and re-verified status before
  continuing. The commit was verified correct via
  `git show --stat` before repair.
- One chain abort + restart: the first Stage 1 attempt
  refused on the constructor's clean-tree check because two
  post-pinned HEAD files had been moved aside (read as
  deletions). Restoring them — inert under the pinned
  index.html — let the chain run clean; no sims were spent
  on the aborted attempt.

## Commits (branch sim-togrescreen-b, ready for coordinator merge, pending ship)
- 496a75f41 — tog rescreen prereg + fresh-seed instruments
  (89801–89808, pinned-base method).
- (Stage 0 + Stage 1 + this note follow in the closeout
  commit — per-seed outputs, logs, and this note.)
- No push, no bump, no live check — committed on branch
  sim-togrescreen-b, pending coordinator merge (ship loop
  owns version bumps, pushes, live verification).
