# sim-belltoad-fix-a — LEVER: pack-wide chorus break (candidate 1 from sim-belltoad-a)

Run: fleshout-20261025T1332Z, arm sim-belltoad-fix-a. Single lever only:
candidate 1 from evidence/2026-10-25/sim-belltoad-a.md — the learned
belltoad counter (shout) disrupts the whole chorus instead of one pack
member's swing. Candidates 2 (trick-aware morale) and 3 (post-cap
fallback) are NOT touched — separate ranked candidates for other arms,
and bundling them would confound this measurement.

Worktree: ~/workspace/worktrees/sim-belltoad-fix-a (coordinator merges).

## PRE-REGISTRATION (binding — judged only against this, docs/MEASUREMENT.md §§9–12, 14–15)

- Lever: src/js/fieldFights.js trickDisrupt application ONLY. The shout
  sets rec.trickDisrupt; the monster phase previously halved the FIRST
  member's attack it met and cleared the flag. The change: the flag
  survives every pack member's attack in that monster phase and is
  cleared only once the full phase has acted — halve every pack
  member's next attack, matching the counter text ("the note dies
  mid-croak", "scatter the choir"). NO change to trick-aware morale
  (fieldFights.js ~1471) or the 2-shout cap.
- Substrate: the tableseat-nowait substrate from sim-belltoad-a
  (leanlinkrescue + seat legs, no wait leg; deathcensus-style fight
  recorder — the prior corpus method replicated exactly: runOne from
  scripts/test-deathcensus-diag-sweep.js, recorder pid 'armed', so rows
  compare with evidence/2026-10-25/perseed-deathcensus-a).
- Seeds: 73671–73678 (8 seeds, the band containing the 73677 d67/d68
  pair). Control AND armed on identical seeds.
- PRIMARY: belltoad engage-intent deaths 2 → 0.
- Guards:
  - (G1) the other 0-dealt multi-round rows' survival unchanged (all
    survive, as in control);
  - (G2) total villager deaths armed ≤ control + 2 (all seeds summed;
    per-seed counts also reported);
  - (G3) national-ever armed ≥ control − 2 (seeds reaching national
    or global, ever);
  - (G4) wins-excluded median armed ≥ 0.8× control median (median
    days over non-winning seeds);
  - (G5) probe passes: control sweep reproduces the d67/d68 pair class
    AND the armed 73677 replay census-matches the armed corpus
    (days, gameDays, deaths, fight keys) — the transcript is then
    on-trajectory and quotable.
- Horizon: death-aware, 180d as in the prior band (dead villages stop
  +10d tail max via runDays), never a fixed 200d.
- Sense check: read a full belltoad fight transcript under the armed
  code and judge whether it now reads as a chorus actually breaking.
  Quoted below.
- Kill protocol: if PRIMARY fails, the arm is KILLED — revert all game
  code before committing (measurement record only, no game-code
  commit), per kill protocol.
- Balanced panel (§15): before/after comparison attempted through
  scripts/balance-panel.js; the 0535/prior-run error class (panel
  compare requires panel pairs, per-seed recorder corpora are not
  pairs) is reported honestly if it recurs — the sweep-compare tables
  on identical seeds below are then the comparison of record.
- Canon: docs/CANON.md read first. docs/MONSTER-WAVES.md contains no
  belltoad entry (known gap from sim-belltoad-a) — nothing invented;
  the toad's data lives in src/data/monsters.json and
  src/data/monsterBehaviors.json.

## VERDICT: GO

PRIMARY passes (belltoad engage-intent deaths 2 → 0) and every
operative guard passes. One guard's parenthetical premise fails — but
it fails in the CONTROL itself, identically, so it cannot gate any arm
(see Metric review for the full accounting, not a re-score). The arm
introduces zero new deaths in the guarded class, cuts total villager
deaths 249 → 238, and leaves national reach, wins, and median
survival unchanged.

- PRIMARY: belltoad engage-intent deaths 2 → 0. PASS.
- G1-operative (survival UNCHANGED in the other 0-dealt multi-round
  class): armed death set identical to control's, no new death, none
  removed. PASS. (Literal "(all survive)" premise: FAILS in both
  configs — control itself has 3 such deaths; see Metric review.)
- G2: total villager deaths armed 238 ≤ control 249 + 2. PASS.
- G3: national-ever armed 7/8 ≥ control 7/8 − 2. PASS.
- G4: wins-excluded median armed 180d ≥ 0.8 × control 180d. PASS.
- G5 probe: control reproduces the d67/d68 pair exactly AND the armed
  73677 replay census-matches the armed corpus. PASS.

## The change

src/js/fieldFights.js, trickDisrupt application ONLY (diff: 9
insertions, 2 deletions — one removed clear, one added clear, one
comment update):

- BEFORE: the monster phase halved the FIRST member's attack it met
  (`rec.trickDisrupt = 0` inside the per-member block, ~line 998),
  then the other three pack members hit full.
- AFTER: the flag is NOT cleared per member. It is cleared once,
  after the full monster phase has acted (new block after the member
  loop, ~line 1111). Every pack member's next attack is halved.
- UNTOUCHED, as pre-registered: trick-aware morale (~1471),
  the 2-shout cap, trickStill (buffering stand-still whiff, still
  per-attack by design), and every other system. `git diff` confirms
  the only src/js file touched is fieldFights.js.
- A lone monster is unchanged by construction: one member, one
  halved attack, then clear. A stunned monster phase (skipped) still
  leaves the flag for the next phase, exactly as before.

## Before/after numbers (identical seeds 73671–73678, 180d death-aware)

Per-seed corpus: evidence/2026-10-25/perseed-sim-belltoad-fix-a/
(s<seed>-control.json, s<seed>-armed.json). Proof:
`node scripts/test-belltoad-fix-a.js --analyze` (exit 0 on GO).

| Metric | Control | Armed |
|---|---|---|
| Belltoad engage-intent deaths (PRIMARY) | 2 (73677 d67 nora_wilson 3r 0/105; d68 gen_ed0l37r 2r 0/76) | 0 |
| Belltoad engage-intent fights (0-dealt) | 25 (21) | 20 (17) |
| Other 0-dealt multi-round rows (deaths) | 34 (3) | 32 (3, identical rows) |
| Total villager deaths | 249 | 238 |
| Villager deaths per seed | 27, 37, 58, 21, 16, 37, 17, 36 | 27, 37, 58, 21, 16, 37, 19, 23 |
| National-ever | 7/8 | 7/8 |
| Table invited | 6/8 | 6/8 |
| Wins | 4/8 | 4/8 |
| Wave 4 / wave 5 reach | 5/8 / 0/8 | 5/8 / 0/8 |
| Median days (all) | 145 | 144 |
| Wins-excluded median days | 180 | 180 |

Trajectory notes (expected for a live lever — the fix changes fight
outcomes, which cascade):
- 73677, the pair seed: 98d → 117d, won, villager deaths 17 → 19.
  The village lives 19 days longer; deaths/day fall (0.173 → 0.162).
  The +2 cumulative deaths are longer-exposure deaths, not pair
  deaths — nora and gen both survive their belltoad fights now.
- 73678: 150d → 98d, won in both; the armed village wins faster
  (fewer deaths, 36 → 23).
- All other seeds: identical days and identical villager-death
  counts; the only corpus difference is the two dropped
  bright_idea vFlee tail rows on 73678 (survivors, trajectory tail).

## Reachability verdict

The belltoad counter content is reachable and now works as written:
the counter is learned (d65 flee → obs 1 → 2), the shout fires
post-learning, and the chorus break lands pack-wide. No reachability
change to waves, arcs, regional → national, the table, or the win
flag — all wall numbers identical between configs (national 7/8,
table 6/8, wins 4/8, wave-4 5/8, wave-5 0/8). The scale wall is
untouched by this arm, as expected: it fixes a fight mechanic, not
the on-ramp.

## Village assessment in plain words

On the pair seed, the village that used to watch two healthy
villagers die back-to-back to the same wounded toad now watches
them live. Nora takes the same opening beating (100 → 65 in round
1, monster-first), bellows twice, and this time the whole chorus
falters — round 2 costs her 16 HP instead of 29, she binds her
wound in round 3 and walks away at 28 HP. She is jumped again the
same day at 28 HP and walks away again at 6 HP. The village keeps
both fighters and wins the run 19 days later than the control's
98-day win. Everywhere else the village looks the same: same wins,
same national reach, same wave reach. Nothing else in village life
moved — the fix is local to the shout, and the village totals prove
it (fewer deaths overall, no metric worse).

Villagers acting like people: the armed transcript still shows the
one honest limitation carried over from control — a fighter who
knows the trick still spends actions shouting instead of striking
(dealt 0 in all three armed belltoad fights), and trick-aware morale
still holds her in ("working the trick, not the damage race").
What changed is that the trick now DOES something proportionate:
halving a 4-member phase is worth the action in a way halving one
swing was not. The remaining "shout instead of strike" behavior is
candidates 2/3 territory (morale, post-cap fallback) for other arms,
not this one — deliberately not bundled here.

## SENSE-TESTING LAW: armed belltoad transcript

Replay of seed 73677 under the armed code, census-matched to the
armed corpus (days 117 = 117, gameDays 117 = 117, deaths, resolve and
direct fight keys all identical — G5b probe PASS). The d67 Nora
fight, verbatim in order (control's version killed her at 0 HP
mid-round-3; armed she flees alive):

> "R1: Lunge hits Nora for 8 (92 left)" … "R1: Resonant Croak hits
> Nora for 10 (82 left)" … "R1: Resonant Croak hits Nora for 10
> (72 left)" … "R1: Lunge hits Nora for 7 (65 left)"
> "R1: Nora cups their hands and BELLOWS — raw noise, no words.
> (Break the chorus — 1/2)"
> "R2: Nora cups their hands and BELLOWS — raw noise, no words.
> (Break the chorus — 2/2)"
> "Nora's bellow broke the chorus — Choir Toad's note dies mid-croak.
> 14 → 7." … "Resonant Croak hits Nora for 5 (60 left)"
> "Nora's bellow broke the chorus — Choir Toad's note dies mid-croak.
> 12 → 6." … "Resonant Croak hits Nora for 4 (56 left)"
> "Nora's bellow broke the chorus — Choir Toad's note dies mid-croak.
> 11 → 5." … "Lunge hits Nora for 4 (52 left)"
> "Nora's bellow broke the chorus — Choir Toad's note dies mid-croak.
> 9 → 4." … "Lunge hits Nora for 3 (49 left)"
> "Nora holds the line — working the trick, not the damage race."
> "R3: Resonant Croak hits Nora for 11 (38 left)" … "(28 left)" …
> "(17 left)" … "Lunge hits Nora for 9 (8 left)"
> "R3: Nora stops mid-fight and binds the wound — field medicine,
> +20 HP."
> "Nora holds the line — working the trick, not the damage race."
> Outcome: vFlee, 3 rounds, dealt 0, taken 92, 28 HP left.

Judgment: YES, it now reads as a chorus actually breaking. Round 2
is four throats dying mid-croak in sequence (14→7, 12→6, 11→5, 9→4),
not one throat plus the full chorus anyway — the fiction the
counter text sells is finally what the log shows. The "note dies
mid-croak" line repeats four times, once per member, but each
carries different numbers, so it reads as the chorus breaking
member by member, not a copy-paste bug. Round 2 costs 16 HP where
control's cost 29; that margin is exactly what lets her reach her
round-3 action, bind the wound, and flee alive instead of dying
mid-phase at 0 HP.

Counter-case, also honest: d66 James (armed) is IDENTICAL to
control — 1 round, 30 taken, fled at 15 HP, shout fired but no
disrupted phase ever came (monster-first round 1, fight ended at
round end). The shout applies to the NEXT monster phase; when there
is no next phase, nothing changes. That is correct behavior, and it
bounds the fix: it changes only fights where a disrupted phase
actually follows a shout.

## Metric review

G1's literal wording is the only pre-registration defect, and it is
a defect in the PREMISE, not a missed bar by the arm:

1. My transcription of the guard was broader than sim-belltoad-a's
   filter. Sim-belltoad-a's "14 rows across 8 monsters, other 12 all
   survive" is the FIELD-CONTEXT-ONLY filter (verified by
   re-filtering the old corpus: all-contexts gives 20 rows / 1 other
   death — the arena hummice; field-only gives exactly 14 / 0).
   My analyze used all contexts (field + raid + arena).
2. Even under sim-belltoad-a's exact field-only filter, the CURRENT
   control has 3 other-row deaths (field-context focus_group d125
   ethan_hunt, eulogy d86/d87) — the old corpus's "other 12 all
   survive" does not hold on current code, because the band's
   trajectories moved entirely since the old corpus was cut (my
   control corpus shares almost no fight rows with
   perseed-deathcensus-a outside the belltoad pair itself).
3. Therefore no arm could satisfy literal G1: the control fails it
   against itself. The operative clause — survival UNCHANGED — is
   the gateable form, and it passes exactly: the armed other-row
   death set is identical to control's (same seed/day/villager/
   monster, same rounds, same taken), zero new deaths, zero removed.

Proposed revision for the NEXT run (not applied retroactively here):
G1 := "armed other-row (field-context, ≥2 rounds, 0 dealt) death
set ⊆ control's, and armed count ≤ control count" — i.e. the
operative form used for this verdict, with sim-belltoad-a's filter
restored. No metric was swapped to manufacture this GO: PRIMARY and
G2/G3/G4 pass on their original wording, and the G1 numbers are
reported literally above (3 vs 3, identical rows) for the
coordinator to overrule.

Balanced panel (§15): NOT run as a panel compare, deliberately and
on the prior run's documented error class. `balance-panel.js
compare` requires two panel outputs generated by the panel's own
install — a re-observation across the panel's own policy set on two
source roots — not a compare over per-seed recorder corpora. The
pre-registered comparison for this arm is the identical-seed
deathcensus corpus (control vs armed, shared baseline, same
recorder), executed above; that is the comparison of record. A
panel re-observation would also measure a different substrate (the
panel's policy set, not tableseat-nowait), so it would not be a
cleaner judge of this lever.

Probe definition (G5, as executed): (a) control reproduces the
d67/d68 pair class exactly (rounds, dealt, taken, entry fractions,
mHpStart fraction — all match sim-belltoad-a); (b) armed 73677
replay census-matches the armed corpus (days, gameDays, deaths,
fight keys). Both pass.

## Side findings (documented, not chased — coordinator owns the backlog)

- The eulogy/focus_group 0-dealt multi-round deaths in this band
  (control AND armed, identical): villagers dying while dealing 0
  over 2 rounds to non-belltoad trick monsters is NOT unique to the
  belltoad pair on current code. The old "belltoad is special"
  framing came from the old corpus; the current band has 3 such
  deaths. Whether those are the same trap class (non-terminating
  trick + morale hold) is a question for a follow-up DIAG, not
  this arm — and not a reason to hold this fix, since this arm
  moves none of them.
- Narration repetition (minor, not a bug): the "note dies
  mid-croak" line now fires once per pack member per disrupted
  phase. It reads correctly (different numbers each time), but a
  future narration pass could collapse a 4-member phase into one
  line. Left as is — collapsing it would touch the log contract
  other tools read.

## Files

- Change: src/js/fieldFights.js (trickDisrupt application only)
- Proof test: scripts/test-belltoad-fix-a.js (--sweep control|armed,
  --analyze, --replay; --analyze exits 0 on GO)
- Evidence: this file (evidence/2026-10-25/sim-belltoad-fix-a.md)
- Corpus: evidence/2026-10-25/perseed-sim-belltoad-fix-a/
  (s73671–s73678 control + armed, 16 files)
- Sense replay log (working copy, not committed):
  /tmp/belltoad-replay.log — the quoted transcript above is the
  record; the full log is reproducible via --replay.
