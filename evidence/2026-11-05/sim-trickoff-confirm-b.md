# Trickoff-confirm-b — confirm the TRICKHOLD toggle on FRESH seeds 99761–99772 (Loop B, 2026-11-05/06)

Run: fleshout-loop-b-20261106T0130Z, arm sim-trickoff-confirm-b.
Prereg: evidence/2026-11-05/sim-trickoff-confirm-b-prereg.md (committed
916ec290c) — it binds this run; the prereg was NOT rewritten and the seed
band was NOT re-picked. 26 probe runs total: 2 DET + 12 V-full (pass 1) +
12 trickoff. All probe .err files empty.

## Verdict (prereg-gated, not re-scored): CONFIRM GO
- Signal seeds 9 of 12 (GO bar: >=2). S1 class flips 5/12 (2 losses,
  3 rescues, all mechanism-traced below). S3 fires on 8/12. S2 fires on
  1/12 (99766 sat −10) and is descriptive only, never deciding.
- The rescreen signal REPRODUCES on fresh seeds, stronger: the screen
  showed 3/8 flips and S3 on 5/8; the confirm shows 5/12 flips and S3
  on 8/12. The known-trick hold is confirmed as a live wire, not a
  knob — direction is seed-dependent, and net wins alone would misread
  it (lesser 5/12 → 4/12 + 1 survived: net −1 lesser, hiding 5 gross
  flips).
- No game-code change is committed or landed by this arm. Branch holds
  evidence/scripts only.

## Stage 0 — determinism gate: PASS
- (a) DET=1 byte-identical on seed 99761 (2 x 120d of the pinned tree):
  DET GREEN. Log: evidence/2026-11-05/stage0-det.log (err empty).
- (b) V-full sweep on all 12 fresh seeds (pass 1 — the judged baseline):
  complete, integrity 12/12. Log: stage0-vfull-pass1.log (err empty).
- STAGING DEVIATION (pre-registered in the prereg, not silent): NO full
  V-full pass-2 repeat. Justification as prereg: the rescreen proved
  byte-identical repeat on this identical pinned base + probe (8 seeds);
  DET re-verified determinism on this band's first seed. The deviation
  cost nothing here — both gate halves passed cleanly.

## Pinned-base method (as prereg)
- Pinned base ff1725835 (arm-2 d8f334da8 verified an ancestor, so arm 2
  is ON in V-full). Branch sim-trickoff-confirm-b holds evidence/scripts
  only; game code was never committed.
- Pinned checkout: `git checkout ff1725835 -- src index.html scripts`,
  then the 7 tooling scripts verified intact from HEAD (they postdate
  the base; checkout left them alone, as in the rescreen run).
- Post-base src/js files (villager-goals.js, win-plan.js) removed from
  worktree + index for the sim phase; final restore returns them from
  HEAD. scripts/ post-base files on disk are inert (never loaded).
- Alloff construction check (before any sim): V-alloff verified
  byte-equal to pre-arm2 blobs (`git diff d8f334da8^ -- src/js/` empty)
  — PASS. Reverts: sigoff 3 hunks, gearoff 7 hunks, moraleoff 1 hunk,
  trickoff 1 hunk + GEAR/MORALE header comment lines. Restored to the
  pinned tree after the check (`git diff --quiet -- src/js/` clean).
- Probe: scripts/probe-toggle-confirm-trickoff-b-20261105.js =
  probe-toggle-rescreen-20261105.js with ONLY the PLAN map changed to
  99761–99763 waves / 99764 forcedrift / 99765–99772 wavesnw
  (diff-verified: header comment + PLAN const + its two comment lines
  only). Classifier + proof script are seeds-parameterized copies of the
  rescreen pair (defaults 99761–99772; endReason 'survived' names its
  own class, never 'other'; proof script gains a `confirm` judge mode).
  Env for every sweep: FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1
  ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1;
  180d death-aware horizon; SEEDS env set explicitly on every
  invocation.

## What TRICKHOLD is (from `git show d8f334da8`, fieldFights.js)
Arm 2 added one hold: when a fight is hopeless, a villager who KNOWS
the trick (intentWhy === 'trick-known') and has >25% HP does NOT flee
— they hold the line because they know how the fight is fought and
have not had their turn to prove it. (The comment: argue-first fires
on round 3, after the round-2 hopeless check — so a knowledgeable
villager used to flee before ever using the counterplay they knew.)
Trickoff reverts exactly that hold. It applies to ANY fight where a
trick is known — waves 1–2 counters included — so its effects start
long before wave 4, and the village-level consequences compound from
there.

## Stage 1 — confirm (12 runs vs same-base V-full pass 1)
Flip = outcome class differs from same-base V-full. Classes:
scattered / won-lesser (+ sat day) / survived (alive at the 180d
horizon without sitting) / wave-5 reached (uw>=5 OR satWaves.w5>0).

### V-full full block (12 fresh seeds, the judged baseline)
| seed | plan | class | sat | uw | fights | kills | vDie | days | end scale |
|---|---|---|---|---|---|---|---|---|---|
| 99761 | waves | won lesser | d137 | 5 | 11 | 2 | 1 | 137 | regional |
| 99762 | waves | won lesser | d95 | 4 | 8 | 0 | 2 | 95 | regional |
| 99763 | waves | scattered | — | 4 | 14 | 0 | 2 | 128 | village |
| 99764 | forcedrift | won lesser | d90 | 4 | 4 | 0 | 1 | 90 | regional |
| 99765 | wavesnw | scattered | — | 4 | 8 | 1 | 2 | 141 | regional |
| 99766 | wavesnw | won lesser | d107 | 4 | 1 | 1 | 0 | 107 | regional |
| 99767 | wavesnw | won lesser | d110 | 4 | 7 | 0 | 0 | 110 | global |
| 99768 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 94 | regional |
| 99769 | wavesnw | scattered | — | 4 | 5 | 1 | 3 | 95 | regional |
| 99770 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 54 | regional |
| 99771 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 41 | village |
| 99772 | wavesnw | scattered | — | 3 | 0 | 0 | 0 | 74 | regional |
Tally: lesser 5/12, full 0/12, survived 0/12, wave-4 unlocked (uw>=4)
8/12, wave-5 reached 1/12 (99761), national-or-better at end 1/12
(99767 global), median survival 95d. Total census fights 58, kills 5,
vDie 11.

### trickoff (TRICKHOLD reverted) — CONFIRM GO (signal 9/12)
| seed | V-full | trickoff | flip? | sat Δ | kills | fights |
|---|---|---|---|---|---|---|
| 99761 | won lesser d137 uw5 | SCATTERED d94 | YES — loss | — | 2→0 (S3) | 11→4 (S3) |
| 99762 | won lesser d95 | SCATTERED d29 | YES — loss | — | 0→0 | 8→0 (S3) |
| 99763 | scattered d128 | scattered d42 | no | — | 0→0 | 14→0 (S3) |
| 99764 | won lesser d90 | won lesser d94 | no | +4 | 0→2 (S3) | 4→5 |
| 99765 | scattered d141 | scattered d48 | no | — | 1→0 | 8→0 (S3) |
| 99766 | won lesser d107 | won lesser d97 | no | −10 (S2) | 1→1 | 1→7 (S3) |
| 99767 | won lesser d110 | SURVIVED d181 uw5 | YES — rescue | — | 0→6 (S3) | 7→28 (S3) |
| 99768 | scattered d94 | scattered d94 | no | — | 0→0 | 0→0 |
| 99769 | scattered d95 | WON lesser d145 | YES — rescue | — | 1→3 (S3) | 5→5 |
| 99770 | scattered d54 | scattered d54 | no | — | 0→0 | 0→0 |
| 99771 | scattered d41 | WON lesser d104 | YES — rescue | — | 0→0 | 0→1 |
| 99772 | scattered d74 | scattered d82 | no | — | 0→0 | 0→2 |
S1 5/12, S2 1/12 (descriptive), S3 8/12, signal seeds 9/12.
Tally: lesser 4/12, survived 1/12, scattered 7/12, full 0/12, wave-4
8/12→7/12, wave-5 1/12 (99767 — a different seed than V-full's 99761),
national-or-better at end 3/12 (99764, 99767, 99769 all global),
median survival 94d. Total census fights 52, kills 12, vDie 10.
Gross flips: 2 losses, 3 rescues. Net wins alone (−1 lesser) would
misread the lever entirely.

### Flip mechanisms (traced per flip, transcript + kill log + census)
- 99761 LOSS (won lesser d137 uw5 → scattered d94): V-full's village
  sat after 2 wave-4 kills (eulogy d105 + d136, peak 3 living vets).
  Trickoff's village died in the wave-4 fights themselves: a d89
  eulogy vDie killed gen_iyx2s40 — the same villager who made V-full's
  first wave-4 kill — then a d94 Reunion fight killed Marzena
  Markowski, the last bearer: "No one is left to pick up the Codex.
  The village dies out — quietly." Standing 199 unspent, uw4, 0 alive.
- 99762 LOSS (won lesser d95 → scattered d29): both variants lose the
  same three people first (Amina d11 monster, Scott d13, Xavier d17,
  starvation). Then they fork: trickoff's Eduardo sickens d19 (V-full:
  survives to d56), Caleb sickens d28 (V-full: d46, 'a stranger'),
  Esteban + Dale starve d29, pantry 0, scatter on the third hungry
  day. The lever's low-wave effect — a knowledgeable villager fleeing
  instead of holding — reroutes who is hurt and fed, and the village
  starves out before wave 4 (uw3, 0 fights, standing 0).
- 99767 RESCUE (won lesser d110 → survived d181 uw5): V-full fought 7
  wave-4 fights, killed 0, and sat d110 at standing 199. Trickoff
  fought 28, killed 6 census (+2 more in the kill log: a wave-5
  finale_crew kill d156 and a wave-4 herald kill d104 in an engine
  fight), faced wave-5 editors from d111, killed THREE wave-5 monsters
  (timeslot d170, rerun + network_note d173), peaked 2 living vets
  d105, standing 422 — and survived to the horizon with 4 alive. The
  mechanism has a named cause: the table WITHDREW on d90 in trickoff
  ("WE PRICED THE RUN. NO HUNGER ON THE RECORD — THE PELLET HUMS
  WHERE THE FIRE SHOULD BE. NO FEAST, NO SURGE, NOTHING HERE WE CAN
  PRICE"), so the village never announced or sat — and, denied the
  seat, became a wave-5 fighting village instead. (See sense-reading.)
- 99769 RESCUE (scattered d95 → won lesser d145): V-full's village
  died in reunion fights (vDie d68, d70, d89) and scattered d95 at
  standing 175. Trickoff killed reunion d113, then two more kills on
  the eve of sitting (reunion + influencer d144–145) and sat lesser
  d145 at standing 199, global.
- 99771 RESCUE (scattered d41 → won lesser d104): V-full scattered
  d41 (uw3, standing 0, no fights — an early death). Trickoff survived
  the early game, unlocked wave 4, and sat lesser d104 (standing 110)
  after a 9-turn eulogy vFlee on the sat day itself.

### S3-only seeds (trajectory movement without a class flip)
- 99763: scattered d128 → scattered d42, fights 14→0. Died before
  wave 4 (uw3, d42) — the 0 is "died before the wave-4 era," not a
  refusal to fight (nonCommittedW4 0, fastW4 0, engineOpens 0).
- 99765: scattered d141 → scattered d48, fights 8→0. Same shape: died
  d48 at uw3, before wave 4.
- 99764: no flip, kills 0→2 (two Eater kills, d67 + d76, both by
  liam_davis), sat +4 (d90→d94).
- 99766: no flip, sat −10 (the block's only S2 fire), fights 1→7.
- 99768 / 99770: class-identical AND trajectory-identical (0 fights
  both sides; 99770 same sat-day-equivalent scatter day d54).
- 99772: scattered d74 → scattered d82, fights 0→2, no S3.

## Scale-wall numbers (judged corpora, plain words)
- V-full (12): lesser wins 5, full seat 0, national-or-better at end 1
  (99767 global), wave-4 unlocked 8/12, wave-5 reached 1/12 (99761,
  still only a lesser win), median survival 95d.
- Trickoff (12): lesser 4, survived-to-horizon 1, full 0,
  national-or-better 3 (all global), wave-4 7/12, wave-5 1/12 (99767 —
  with THREE wave-5 kills, the block's only wave-5 kills), median 94d.
- In plain words: on this fresh block, villages still win lesser seats
  and never the full seat, with or without the hold; the wave-5 door
  opens exactly once per block on both sides (a different seed each
  time), and only trickoff's opener kills anything past the door. The
  binding constraint is unchanged: everything downstream of sitting
  lesser — standing, veterans, wave-5 facing — and the one village
  that banks a veteran pair (trickoff-99767 ends with 2 living
  veterans, sigrun_eiriksdottir and caleb_jones, the wave-5 killers)
  never sits, because the table withdrew on d90.

## Sense-reading (SENSE-TESTING LAW) — PASS
Two flipped seeds read end to end, plus the loss tails.

- 99767 trickoff (rescue, most-moved): reads as one coherent village
  story across 21,421 SAY lines. The head is ordinary life — water
  runs, trust too low, the fire, the stash — then the d90 table
  withdrawal lands as a named event with a legible cause (no feast,
  no surge, "the pellet hums where the fire should be"), and the
  village's answer is to keep fighting: editors faced from d111,
  a 36-turn editor fight d119, the d157–158 editor/suburb fights that
  kill visjoin_154 the day after visjoin_154 killed a wave-5
  finale_crew, then the d170–173 wave-5 kill run (timeslot, rerun,
  network_note), and the horizon ending not with a sit but with the
  village still out foraging — the Mountain Lord at the boundary,
  keepsakes (Mixtape, Knife roll, Contract Quill) held and lived-in,
  the lingering Big Big / Eulogy / Big Ugly gorging at the treeline,
  a cold snap, hunger starting — and the run simply ending at dawn
  d181 with the village alive. No robotic, static, or repeated
  behavior; the withdrawal has consequences and the village answers
  them by fighting. One awkwardness, noted not chased: the run ends
  mid-spiral (starving, dehydrated, camping wild) with no closing
  beat — surviving to the horizon reads as "the clock ran out," not
  as a village that earned its morning.
- 99762 trickoff (loss): the scatter reads as a story, not a crash —
  the same three opening deaths as V-full, then sickness taking
  Eduardo and Caleb weeks early, two starving on d29, the mantle
  passing to Nasir Kar ("Oh! New face! Same job!"), a trader arriving
  as the village walks away, and a neighboring village's speaker
  sending a runner about the shared ground as the scatter lands.
  The mechanism (early sickness/starvation cascade) is legible in the
  fallen ledger, not just in counts.
- 99761 trickoff (loss): the end is the Reunion fight returning the
  village's own moves ("Your own move, returned hits you for 31"),
  the barrier crossed with the monster right behind, Marzena going
  down, and the Codex's quiet line: "No one is left to pick up the
  Codex. The village dies out — quietly, the way villages do."

## Village assessment (plain words)
These twelve fresh villages are harsher than the rescreen block: five
sit lesser on the pinned game, seven scatter, and the two that sit
with the wave-5 door open (99761) or at global scale (99767) still
never touch the full seat. The strongest village on the block is the
one that never sits: trickoff-99767 reaches wave 5, kills three of
its monsters, stands at 422 — and still has no seat, because the
table withdrew on d90 for want of food-thesis deeds. That is the
winnability wall in miniature from the other side: the village can
fight wave 5 and live, but the seat is a separate negotiation, and a
withdrawn table does not come back. What is missing is not wave
access on this block — wave 4 is unlocked on 7–8/12 seeds — it is
living veteran killers who survive to sit, and wave-5 kills that
convert into a seat. The blank this run fills is the rescreen's open
item: the trickoff signal reproduces on fresh seeds, stronger (5/12
flips, 9/12 signal seeds vs the screen's 3/8 and 6/8). The blank it
documents is the next question, not this run's: the hold's direction
is seed-dependent because it acts through early fight outcomes —
whether a knowledgeable villager holds or flees a hopeless fight
reroutes the whole village history. A lever that decides fights this
way is a design question for Steve (does the hold belong in the
game?), not a tuning knob — the confirm's job was to prove the
effect is real, and it is.

## Telemetry deviation check
Declared INAPPLICABLE, not run: same reason as the rescreen — the
corpus is matched-seed classification, and the endgame baseline is
the same stale, regime-unrecorded file r118 already flagged (its own
text forbids pre-seat comparisons). Running the check would
manufacture LOUD lines against a baseline that does not describe this
regime. No compare is fabricated. §15 balanced panels do not apply to
this diagnostic: the instrument is the matched-seed classification
itself, and the prereg staged design governs.

## Metric review (for the NEXT run, not this one)
- The staging deviation (no pass-2 repeat) cost nothing: DET GREEN +
  a complete 12-seed pass 1, and the judge never needed a repeat.
  But it must stay a named deviation, not silently become the
  staging — a future run that changes the pinned base or the probe
  owes a fresh pass-2.
- S2 fired exactly once (99766, sat −10) and is descriptive by
  design. The confirm's GO never rested on it: signal seeds 9/12
  even counting S1+S3 only (5 flips + 4 S3-only seeds).
- Gross flips are the right judge and net wins the wrong one, again:
  net lesser −1 (5→4) with 1 survived would read as "slightly worse,"
  while the gross picture is 2 losses against 3 rescues including the
  block's only wave-5 kills. Any future toggle confirm must keep the
  gross-flip judge; a net-wins judge would have killed this lever
  twice (screen and confirm both net 0/−1 with live flips).
- The zero-fight seeds (99762/99763/99765 trickoff) are a census-reading
  trap carried from the rescreen metric review: 0 census fights means
  "died before wave 4" here (uw3, d29–48), not "refused to fight."
  The review's ask stands: a low-wave fight census and day-stamped
  fight records, or future arms will keep reporting "0 fights" for
  villages whose fates were decided in fights the census never
  recorded. (Still unbuilt.)
- The survived class earns its naming: 99767's survived-to-horizon is
  the block's most informative outcome (standing 422, three wave-5
  kills, table withdrawn) and would have been invisible as "other."
  The classifier's survived naming worked as designed.
- New open question for the next run / Steve: the d90 table
  withdrawal on 99767 — a village at standing 422 with three wave-5
  kills never gets its table back after a withdrawal. Is a withdrawn
  table permanently gone, or should a village that then proves itself
  in wave 5 earn the offer again? That is a design question, not a
  measurement gap — flagged here, not chased.

## Proof results
- Variant constructor (scripts/apply-toggle-variant-20261104.py, from
  master): trickoff applies cleanly on the pinned base (1 hunk,
  fieldFights.js −13 lines); alloff verified byte-equal to d8f334da8^
  BEFORE any sim (`git diff d8f334da8^ -- src/js/` empty); variant
  restored to the pinned tree after the run (`git diff --quiet --
  src/js/` clean). Hunk map as prereg: TRICKHOLD 1 hunk; zero
  unmapped hunks.
- Pinned-tree method: `git checkout ff1725835 -- src index.html
  scripts`, 7 tooling scripts verified intact from HEAD; probe ran on
  the pinned harness. Two post-base src/js files (villager-goals.js,
  win-plan.js) removed for the sim phase; final restore returns them
  from HEAD. scripts/ post-base files on disk are inert (never loaded).
- Probe (scripts/probe-toggle-confirm-trickoff-b-20261105.js): rescreen
  probe verbatim except the PLAN map (diff-verified). DET GREEN
  byte-identical; all probe .err files empty (26 runs total: 2 DET +
  12 V-full + 12 trickoff).
- Classifier (scripts/classify-toggle-confirm-trickoff-b-20261105.js)
  + proof script (scripts/test-toggle-confirm-trickoff-b-20261105.js):
  integrity 12/12 on both prefixes; smoke-tested on the rescreen
  corpus before any sim (reproduced its verdict: 99652 named
  'survived', confirm GO signal 6/8); confirm mode judges the prereg
  bar directly (GO, signal 9/12, S1 5, S3 8, S2 1 descriptive).
- No game-code change is committed or landed by this arm. Branch holds
  evidence/scripts only. No jest suite was run (no game code is
  committed or landed by this diagnostic arm; the variant code was
  restored before closeout).
- Index-clobber class hit three times (after each safe-commit:
  committed files showed staged-as-deleted, plus one stale index
  entry for the pass-1 log); repaired every time via HEAD-blob
  cacheinfo and re-verified (status clean of stray entries, diff HEAD
  shows only the pinned-checkout state) before continuing. All
  commits verified correct via `git show --stat` / `--name-status`.
  One repair note: the pass-1 log's index entry went stale at 8 lines
  while HEAD + worktree held the full 12 — the clobber can leave a
  stale index entry even on a file that was never D-staged, so the
  post-commit check must compare index vs HEAD, not just look for D
  entries.
- Heartbeat: the worktree-heartbeat script timed out twice under load
  (registry lock contention with sibling arms); retried in background
  and landed (03:23Z and ~04:15Z). No registry damage; REGISTRY.json
  intact throughout.
- No out-of-arm finding is appended to sim-findings.md from this run
  (the GO verdict is this run's report; the table-withdrawal question
  is recorded in the metric review above as a Steve/design question,
  and the horizon-ending awkwardness is a narration nit).

## Commits (branch sim-trickoff-confirm-b, ready for coordinator merge, pending ship)
- 916ec290c — trickoff-confirm-b prereg (fresh band 99761-99772,
  judge S1+S3, staging deviation: no pass-2).
- 47b135cb1 — trickoff-confirm-b tooling (probe PLAN 99761-99772,
  classifier + proof with survived class + confirm judge).
- b4ca8e84c — trickoff-confirm-b Stage 0(a): DET GREEN byte-identical
  on seed 99761 (pinned base ff1725835).
- a79fd1dab — trickoff-confirm-b Stage 0: V-full pass 1 baseline (12
  fresh seeds, lesser 5/12, wave-5 1/12 on 99761, median 95d).
- (Stage 1 + this note follow in the closeout commit — per-seed
  trickoff outputs, logs, and this note.)
- No push, no bump, no live check — merged locally, pending ship (ship
  loop owns version bumps, pushes, live verification).
