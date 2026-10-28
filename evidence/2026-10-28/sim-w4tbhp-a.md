# sim-w4tbhp-a — the TB-start-HP causal gap for wound2, closed: wound2 does NOT cause the below-max player starts

Run: fleshout loop, run fleshout-20261028T0320Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4tbhp-a.
Worktree: `~/workspace/worktrees/sim-w4tbhp-a` (branch sim-w4tbhp-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game fix proposed. The deliverable is knowledge: a
pre/post TB-start-HP comparison on identical seeds and identical
substrate, closing the causal gap the 0221Z re-measurement left open.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-w4tbhp-a-prereg.md (commit 9ef6c63a1).
Corpus: evidence/2026-10-28/perseed-w4tbhp-a/ (8 post rows
s<seed>-armed.json + 8 pre rows s<seed>-pre.json + summary.json +
analysis.json + sense-75104.txt + sense-75103.txt). Instruments
(copies only, originals untouched):
scripts/test-w4tbhp-sweep.js, scripts/policies/tbdmg-w4tbhp-diag.js,
scripts/test-w4tbhp-sense.js, scripts/test-w4tbhp-analyze.js (new).
Detgates: POST PASS (seed 75101, 132/132, tsNationalDay 77 both),
PRE PASS (seed 75101, 166/166, tsNationalDay 77 both — cross-base
day difference disclosed below, each detgate judged internally).

## Plain words first

The scholar walks into turn-based fights already wounded — and
wound2 is not the reason. Before wound2 ever existed, the scholar
was already walking in hurt: on the pre-wound2 code, 10 of 35
wave-4 turn-based fights start with the scholar's fighter below
full health, at the same rate and in mostly the same fights as
after wound2 (10 of 28). Seven of the below-max fights are
fight-identical on both sides — same seed, same day, same monster,
same wounded number (78, 80, 95, 98, 77, 46, 90 out of 100). The
wound change never touched how the scholar enters a turn-based
fight; its own code says that entry already read the scholar's
health. What wound2 changed was field-fight allies, not the
scholar's front door. And the monster side is unchanged too: the
monster's fighter starts at full health in 26 of 28 post fights
and 32 of 35 pre fights, and the few exceptions are the same
fights on both sides. So the asymmetry the last round found — the
village carries wounds in, the monster doesn't — is real, but it
predates wound2. Wound2 did not create it, and blaming wound2 for
it would be wrong.

## Verdict: GO (binding prereg, no re-score)

GO required all three legs (a)-(c). All three pass:

- (a) BOTH-base corpora complete: PASS. Post 28/28 TB fights with
  player + monster fighter HP at start, pre 35/35, recorder errors
  0 on all seven recorders on both sides, no overflow either
  side, excluded 0, refused 0, incomplete 0 on both sides.
- (b) DETGATE passes on BOTH bases: PASS. Post: baseline vs
  recorders-OFF 132/132 days, 132/132 gameDays, ts counters
  identical (tsNationalDay 77 both), no diag surface, no wraps.
  Pre (scratch tree): 166/166 days, 166/166 gameDays, ts
  counters identical (tsNationalDay 77 both), no diag surface,
  no wraps. Each detgate is judged internally, same-base — the
  cross-base day difference (132 vs 166 on seed 75101) is the
  disclosed amendment, not a failure: the pre-base trajectory
  for 75101 runs longer, as base drift predicts, while the
  recorders stay neutral on both bases.
- (c) COMPARISON TABLE PUBLISHED + CAUSAL VERDICT STATED: PASS
  (tables below). Causal verdict, per the prereg's rule:
  **wound2 does NOT cause the below-max player TB starts.**
  Pre shows them at a comparable rate (10/35 = 28.6% vs post
  10/28 = 35.7%, same order of magnitude, same shape, 7
  fight-identical below-max rows), and the mechanism note in the
  wound2 diff itself predicts this (TB entry already read
  village.health). The claim being tested was causation, not
  magnitude, and a pre-side presence at comparable rate settles
  it against causation.

## The comparison table (the judged measurement)

Player fraction = player fighter HP / max HP at TB start (kind
'player' fighter in the nonworldkill start record). Monster
fraction is the control (kind 'monster' fighter). World fraction
is the world tile monster HP at start, where a world monster
stands on the tile (null for non-world fights).

### Headline counts

| side | TB fights | player below-max | player median frac | player min | monster below-max (control) | monster median frac |
|---|---|---|---|---|---|---|
| PRE (parent 20010c093) | 35 | 10 (28.6%) | 1.0 | 0.46 | 3 (8.6%) | 1.0 |
| POST (base 3264dbb80) | 28 | 10 (35.7%) | 1.0 | 0.09 | 2 (7.1%) | 1.0 |

By channel — player below-max / fights: PRE player-tb-world 9/31,
non-world-TB 0/2, other 1/2; POST non-world-TB 1/2,
player-tb-world 9/25, other 0/1. The shape is the same: the
below-max starts live in world-origin fights, where the scholar
walks onto a tile the monster already stands on.

### Player below-max fights (the judged rows)

POST (10): 75101 d131 influencer 75/100; 75102 d177 suburb 78/100;
75103 d117 audit 80/100, d129 suburb 95/100, d159 algorithm
98/100, d178 suburb 77/100; 75106 d89 eulogy 46/100, d99 algorithm
90/100; 75108 d100 reunion 57/100, d110 eulogy 9/100. These are
exactly the 10 rows the rebase band reported — the post table
reproduces the published snapshot fight for fight.

PRE (10): 75101 d140 reunion 67/100; 75102 d177 suburb 78/100;
75103 d117 audit 80/100, d129 suburb 95/100, d159 algorithm
98/100, d178 suburb 77/100; 75106 d89 eulogy 46/100, d99 algorithm
90/100; 75108 d65 congregation 98/100, d98 eulogy 97/100.
Seven rows are fight-identical to post rows (75102 d177, 75103
d117/d129/d159/d178, 75106 d89/d99 — same seed, day, monster,
and HP number). The pre side's lowest entry is 46/100, not
9/100 — the 9/100 post row (75108 d110) has no pre counterpart
because 75108's trajectory diverged (see below); that is a
trajectory difference, not a mechanism difference, since the
pre side has its own low entries (46, 67) through the same door.

### Monster control (full, with a disclosed footnote)

Monster fighter at full HP: PRE 32/35, POST 26/28. The exceptions
are small deficits, and they are the SAME fights on both sides:
75102 d166 audit 1140/1211 (94.1%), 75106 d143 audit 1268/1298
(97.7%) — identical numbers pre and post. The pre side has one
further small deficit, 75108 d94 eulogy 910/928 (98.1%), on a
trajectory that post does not share. Footnote to the rebase
claim: "the monster always walks in fresh" is now refined to
"the monster's fighter starts at full HP in 26/28 post fights;
the 2 exceptions are 94-98% starts that pre-exist wound2."
Crucially, the deficits do NOT track the world wound: on 75102
d166 the world instance stands at 825/1100 while the fighter
starts at 1140/1211 — the fighter deficit (71) is not the world
deficit (275), so this is not world damage leaking into the
fighter. It is a small pre-existing fighter-construction quirk
(audit fights only, both sides), not a wound2 effect and not
accumulation: the same audit's fighter is rebuilt fight to
fight elsewhere in the same band.

### Full TB-start tables (fractions; world HP where present)

PRE (35): 75101 d140 reunion 67% / monster 100% / world 1200/1200;
75102 d166 audit 100% / 94.1% / 825/1100; d172 reunion ×5 100% /
100% / 300, 1074, 1200, 1200, 1200 of 1200; d174 reunion 100% /
100% / 1200/1200; d176 eulogy 100% / 100% / 675/900; d177 suburb
78% / 100% / 975/1300; 75103 d117 audit 80% / 100% / 825/1100;
d118 eater 100% / 100% / 712/950; d126 eulogy 100% / 100% / —;
d129 suburb 95% / 100% / 975/1300; d159 algorithm 98% / 100% /
750/1000; d160 suburb 100% / 100% / 954/1300; d178 suburb 77% /
100% / 975/1300; 75106 d89 eulogy 46% / 100% / 675/900; d90
reunion 100% / 100% / 900/1200; d91 reunion 100% / 100% /
1150/1200; d99 algorithm 90% / 100% / 719/1000; d129 eulogy 100% /
100% / 675/900; d130 eulogy 100% / 100% / 740/900; d143 audit 100% /
97.7% / 1/70; d145 eulogy 100% / 100% / 675/900; d146 eater 100% /
100% / 702/950; 75108 d65 congregation 98% / 100% / 1/45; d72
congregation 100% / 100% / —; d94 influencer 100% / 100% /
524/850; d94 eulogy 100% / 98.1% / 624/900; d94 eulogy 100% /
100% / 798/900; d95 eulogy 100% / 100% / 900/900; d96 eulogy 100% /
100% / 862/900; d98 eulogy 97% / 100% / 900/900; d99 eulogy 100% /
100% / 900/900.

POST (28): 75101 d131 influencer 75% / 100% / —; 75102 d166
audit 100% / 94.1% / 825/1100; d172 reunion ×5 100% / 100% / 300,
1074, 1200, 1200, 1200 of 1200; d174 reunion 100% / 100% /
1200/1200; d176 eulogy 100% / 100% / 675/900; d177 suburb 78% /
100% / 975/1300; 75103 d117 audit 80% / 100% / 825/1100; d118
eater 100% / 100% / 712/950; d126 eulogy 100% / 100% / —; d129
suburb 95% / 100% / 975/1300; d159 algorithm 98% / 100% /
750/1000; d160 suburb 100% / 100% / 954/1300; d178 suburb 77% /
100% / 975/1300; 75106 d89 eulogy 46% / 100% / 675/900; d90
reunion 100% / 100% / 900/1200; d91 reunion 100% / 100% /
1150/1200; d99 algorithm 90% / 100% / 719/1000; d129 eulogy 100% /
100% / 675/900; d130 eulogy 100% / 100% / 740/900; d143 audit 100% /
97.7% / 1/70; d145 eulogy 100% / 100% / 675/900; d146 eater 100% /
100% / 702/950; 75108 d100 reunion 57% / 100% / 854/1200; d110
eulogy 9% / 100% / 900/900.

25 of the 28 post fights are fight-identical to pre fights
(same seed, day, monster, channel, and all three HP numbers).
The 3 post-only fights are the 75101 influencer and the two
75108 fights — the two diverged trajectories (below). The 10
pre-only fights are all on the diverged 75101/75108 trajectories
plus 75108's congregation/influencer/eulogy thread.

## Parity (post vs rebaseline) — EXACT

The analyzer's parity table (post rows vs
evidence/2026-10-27/perseed-w4channel-rebaseline/, same seeds /
policy / substrate, one shared vocabulary) matches EXACTLY on
all 8 seeds: days, gameDays, won, waveReach, nationalEver/Final,
table, entered, deathTotal, courtship combined, and wave-4 TB
fight counts by channel — zero mismatches. The post band's wall
numbers are therefore the rebaseline band's wall numbers, and
the current base (3264dbb80) has not moved this substrate's
trajectories at all since the rebaseline base: the detgate
(132/132, tsNationalDay 77 both) is numerically identical to
the rebase detgate. Parity is judged ONLY against the
rebaseline corpus, never against the retired w4channel-a
corpus, and neither the lethality verdict nor the rebaseline
verdict is re-scored here.

## Trajectory divergence, pre vs post (finding, not a verdict item)

6 of 8 seeds run trajectory-identical on both bases (75102,
75103, 75104, 75105, 75106, 75107 — same days, deaths, courtship,
and fight counts to the row). Two diverge, both in ways wound2's
field-ally change can plausibly move (allies entering field
fights at real health changes who lives through field fights,
which changes everything downstream):

- 75101: PRE 166 days, 51 deaths, won lesser, court 7 → POST
  132 days, 34 deaths, won lesser, court 7. Same win, 34 days
  earlier, 17 fewer deaths.
- 75108: PRE 99 days, 54 deaths, court 13 → POST 114 days, 42
  deaths, court 12. Same loss shape, 15 days longer, 12 fewer
  deaths.

Pre band wall: won 3/8, national ever/final 8/8 / 5/8, table
invited/entered 6/8 / 3/8, wave-4 5/8, wave-5 0/8, median 166d
upper / 164d conventional, deaths 328, courtship combined 122,
8/8 active. Post band wall: won 3/8, national ever/final 7/8 /
5/8, table invited/entered 6/8 / 3/8, wave-4 5/8, wave-5 0/8,
median 162d upper / 154d conventional, deaths 299, courtship
combined 121, 8/8 active. The pre band's extra national-ever
(75108 reaching national-ever on the pre trajectory) is a
trajectory fact, not a mechanism fact, and it does not touch
the TB-start verdict, which is per-fight.

## Why the comparison is clean (confound audit, measured not assumed)

- Substrate + instruments byte-identical: `git diff
  20010c093 HEAD` on scripts/policies/tableseat-nowait.js,
  nonworldkill-diag.js, raftdraft-diag.js, spawnsrc-diag.js,
  oldcore-diag.js, w5births-diag.js, defwound-diag.js,
  vetkill-diag.js, and scripts/sim-harness.js is EMPTY. The
  policy, the recorders, and the harness are literally the same
  code on both sides; only the game code moves.
- Game-code drift between the sides is two files only:
  src/js/fieldFights.js (wound2, 60 lines — Haven ally bodies)
  and src/js/abilityActions.js (refusalprecheck-b, 49 lines —
  pre-payment prechecks). The abilityActions diff touches no
  HP, health, fighter, startCombat, or scholar line (grep
  verified). So the only game-code change that could plausibly
  move TB-start-HP is wound2 itself — and it does not move it.
  This is as close to a single-mechanism test as a
  parent-vs-current comparison gets.
- The tbdmg recorder did not exist on the pre base (created by
  the lethality arm after wound2, commit 4207ac845, a descendant
  of wound2). The pre-side run therefore copied exactly two
  instrument files into the scratch tree — my own
  test-w4tbhp-sweep.js and tbdmg-w4tbhp-diag.js, both
  policy-side observation code, zero src/js. The scratch tree's
  src/js is byte-for-byte the parent commit's by construction
  of `git archive` (sentinel-verified: fieldFights.js contains
  no allyBody, the wound2 marker). Copying recorder policies is
  not hacking the old game: no src/js file in the scratch tree
  was created, edited, or deleted.

## Pre-side mechanics (as pre-registered, with the one correction)

- Scratch directory ~/workspace/worktrees/scratch-w4tbhp-old:
  plain extracted files from `git archive 20010c093`, NOT a
  git worktree — no git commands were run inside it, it was
  never registered. (Its harness prints `fatal: not a git
  repository` noise while building manifests; that noise is
  tolerated by the harness and does not touch days, ts
  counters, or recorder rows — both pre detgate legs prove it.)
- CORRECTION to the first extraction attempt, disclosed: the
  first `git archive | tar` extraction silently produced
  0-byte files under an EPERM flap (tar created each file then
  failed the write), and the existence-only check passed it —
  the pre detgate then failed with `loadGame is not a
  function` because sim-harness.js was empty. The run did NOT
  proceed on that tree: it was deleted, re-extracted with a
  per-file retry + size-verification extractor (7115 files, 0
  failures), and the pre detgate + sweep ran only on the
  verified tree. The lesson is recorded: existence is not
  content — verify sizes after any archive extraction under
  this flap.
- The scratch directory will be DELETED after the corpus
  commit (see Infrastructure notes — deletion is the last step
  before this run is called done, after the pre corpus is
  committed in the worktree).

## Sense-testing note (short — a supporting note, not a verdict leg)

Fixed seed 75104 first, window d60-d90: 447 beats, ZERO Mirror
Draft mentions — the absence confirmed in words, matching the
corpus (0 wave-4 arrivals on 75104). Supplement 75103, window
d60-d180: 1062 beats, Mirror Draft opens d68, Herald raids
allied villages nightly (trust -5, d92-d177) while never being
fought by the village — same thread as the rebase sense read.
What the replay does NOT show, on either seed: any beat marking
a wounded scholar walking into a turn-based fight. The
below-max entries are silent in narration — the game never
says "you walk in hurt," just as it never says "we almost had
it" for near-kills. The sense gap and the census gap rhyme:
the numbers now prove the wounded entry predates wound2, and
the words never marked it either way. (Replay text is
non-measured; counts are never taken from it, and the replay
trajectory shift is stated, not hidden.)

## Village assessment (plain words)

Three of these eight villages win through the lesser seat and
go home — one of them (75104) in just 90 days, without ever
meeting a wave-4 monster. Three more die (75102 after a long
wave-4 war at day 177, 75106 at day 146, 75108 at day 114), and
two survive the horizon without ever sitting the table (75103,
invited but never entered; 75107, never even invited). Five
reach wave 4, none reaches wave 5, and the full seat is still
nobody's story. The villages that DO reach wave 4 fight it hard
and kill nothing — same as the last round, because this band
IS the last round's band on the current base (parity exact).
What this round adds is the correction of a tempting story:
the scholar's wounds at the fight door are not wound2's doing.
They were already there. If the village is to stop walking in
hurt, the fix is not in wound2's field-ally code — it is in
whatever already made TB entry read the scholar's wounds
before wound2, and that mechanism is now the named next blank
(see below), not a fix claimed here.

## Blanks filled or documented

- FILLED (answered, with numbers): the 0221Z round's named next
  blank — the TB-start-HP causal gap for wound2: pre table (35
  fights, 10 below-max player starts) vs post table (28 fights,
  10 below-max player starts), monster control (32/35 vs 26/28
  full), 25 fight-identical rows, 7 fight-identical below-max
  rows, parity exact vs the rebaseline corpus.
- FILLED (mechanism, read from code + corpus): wound2's diff
  touches only field-ally bodies; TB entry already read
  village.health before wound2; the intervening abilityActions
  change touches no HP/fighter code; substrate + instruments
  byte-identical across the comparison.
- FILLED (refinement, measured): the monster-fresh claim now
  carries its footnote — 2/28 post monster starts at 94-98%,
  identical pre, not world-wound leakage, audit fights only.
- DOCUMENTED, NOT FIXED (named next blanks): (1) the
  pre-wound2 TB-entry mechanism itself — what makes the
  scholar's fighter start below max (scholar.health carried
  from field fights? from sickness? from an earlier TB loss?)
  and whether any narration should mark it; (2) the small
  audit monster-start deficits (94.1%, 97.7%) — what in
  fighter construction shaves 2-6% on those two fights;
  (3) the 75101/75108 trajectory divergences — wound2 moved
  two seeds' stories (34 days earlier on 75101, 15 days later
  on 75108) through field-ally survival, worth a look if
  anyone wants wound2's real (non-TB-start) effect measured.
- CARRIED (not chased here): the unrecorded inter-fight damage
  class (0221Z finding); the deeply-negative TB fighter HP
  instrument-read anomaly (2 fights, no verdict impact);
  the sense-replay repetition notes (cook line, keepsake echo,
  treeline chorus, identical fight-start line).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its three pre-registered GO legs: (a) PASS, (b) PASS
(both bases), (c) PASS (table + verdict above). The verdict is
GO. Judgment notes, all disclosed, none a re-score:

1. DETGATE AMENDMENT (prereg-authorized, sim-waitlong-a style).
   Each detgate is judged internally, same-base. The pre
   detgate's days (166) differ from the post detgate's (132)
   because the pre-base 75101 trajectory runs longer — base
   drift, not recorder influence (both detgates prove
   recorder neutrality on their own base: days, gameDays, and
   all ts counters identical baseline-vs-wrapped-OFF). Forcing
   the pre detgate to match the post days would have been
   forcing old numbers, which the prereg forbids.
2. PARITY VOCABULARY. Leg parity uses the rebase analyzer's
   vocabulary (nonworldkill starts, non-excluded,
   non-refused), applied identically to both corpora. The
   analyzer's parity check covers headlines + TB fight counts
   by channel; field-fight counts are not part of this arm's
   parity (the arm's unit is the TB start).
3. "START" DEFINITION. A TB-start row is the fighter snapshot
   the nonworldkill recorder takes AFTER startCombat returns.
   If startCombat routes opening turns synchronously, a
   snapshot could in principle carry opening-turn damage — but
   the definition is identical on both sides and identical to
   the rebase band's, so it cannot manufacture a causal
   difference or hide one: any opening-turn effect would
   appear on both sides alike. A future instrument that snaps
   before the first turn would refine absolute fractions, not
   this verdict.
4. PANEL (§15). scripts/balance-panel.js has NO corpus-ingest
   mode for a single-arm census corpus (standing exception,
   fourth-plus round): its `compare` entry requires two
   panel.json.gz artifacts built by a full multi-policy live-
   root panel run (default 16 seeds × 4 policies × 150 days),
   whose policies are not this arm's tableseat-nowait
   substrate at all — and the scratch root is not a git repo,
   so it cannot even carry a source head. No panel artifact
   was faked; the paired sweep-compare tables (this
   analyzer's output, analysis.json) are the section-15
   substitute, as the prereg provides. The known scorecard
   TypeError mode was not hit because no panel build was
   attempted past the documented entry point — the entry
   point itself establishes the inapplicability (compare
   requires panel artifacts that do not exist for census
   corpora).
5. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline .../telemetry-
   baselines/scale-wall.json --current
   'evidence/2026-10-28/perseed-w4tbhp-a/*.json' --metrics
   national,table,wins,exiled` → 2 LOUD lines (national 12→0,
   wins 16→0, n=18 files). Verdict: KNOWN ARTIFACT, no
   investigation, baseline NOT rolled. Two independent reasons,
   both documented (same as the census family): (a) the
   baseline's own regime note forbids this comparison (a
   ~100%-win winseat suite vs a tableseat-nowait census
   substrate); (b) the field-shape artifact repeats (per-seed
   rows carry nationalEver/entered/won, not top-level
   national/table/wins paths; summary.json + analysis.json are
   the 17th and 18th files). The corpus's real wall numbers are
   nationalEver 7/8 post (8/8 pre), table entered 3/8, wins 3/8.
   No table LOUD line this round, no exiled LOUD line.

Doubts recorded for the NEXT run, never applied here:

1. TB-ENTRY MECHANISM. What sets the scholar's fighter HP at TB
   start below max, and through which prior fight/sickness
   does it arrive? The pre table proves it predates wound2;
   the mechanism is still unnamed.
2. AUDIT START DEFICITS. Why do the two audit fights start
   their monster fighters at 94.1% and 97.7% on both bases?
3. WOUND2'S REAL EFFECT. The 75101/75108 divergences suggest
   wound2's field-ally change moves trajectories through
   field survival — a future arm that wants wound2's effect
   should measure field-fight survival pre/post, not TB starts.

## Infrastructure notes

- Post sweep: scripts/test-w4tbhp-sweep.js, 8 seeds, ~3 min wall
  (faster than the rebase band's 15 min — same seeds, same
  horizon, lighter box load) + detgates ~2 min each + sense
  replays ~30 s. Corpus: evidence/2026-10-28/perseed-w4tbhp-a/
  (8 post rows + 8 pre rows + summary.json + analysis.json +
  sense-75104.txt + sense-75103.txt). Analyzer:
  scripts/test-w4tbhp-analyze.js (unit checks pass; exit 0).
  Sense: scripts/test-w4tbhp-sense.js (NON-MEASURED replay
  only; 75104 window d60-d90, 75103 window d60-d180).
- Safe-commit index clobber hit BOTH worker commits (bogus
  staged deletions, commits themselves correct — verified by
  stat + hash before proceeding); repaired via HEAD-blob
  cacheinfo, verified status empty + diff HEAD empty, after
  each commit. The evidence commit below must be checked the
  same way before this run is called done.
- EPERM flap (container class, same as the 2026-10-24
  evidence-write flap): (1) first scratch extraction produced
  0-byte files (see correction above) — recovered with a
  per-file retry + size-verification extractor, 7115 files, 0
  failures; (2) scratch instrument copies needed retry loops
  (up to 5 attempts, ~40 s) before landing. No post-sweep or
  worktree-corpus write was lost; all corpus writes verified
  by size after copy.
- First post-sweep launch (nohup background, log redirect) died
  silently with an empty log and no process — re-launched as a
  runtime-tracked background job, which ran to completion
  (exit 0, CORPUS PASS). The detgate launched the same nohup
  way survived; the sweep did not — launch-pattern difference
  is not diagnosed, so future runs should prefer the tracked
  background launch.
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the census-family precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the
  sense script only READS beats on a replay, it adds none to
  the game).
- Commit: sim-w4tbhp-a, GO on all legs, zero src/js diff.
  Branch ready, pending coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line, not
  this arm's).
- Heartbeats: tree heartbeat after registration (coordinator),
  after instruments, after post sweep, after pre sweep — all
  landed.

## Findings for the coordinator (NOT appended by this worker)

- [open] 2026-10-28 — TB-entry wound mechanism predates wound2
  — scholar fighter starts below max in 10/35 pre-wound2 TB
  fights (as low as 46/100); the mechanism that sets TB-start
  scholar HP is unnamed and un-narrated (this run's verdict).
- [open] 2026-10-28 — audit monster-start deficits — two audit
  TB fights start their monster fighters at 94.1% and 97.7%
  on BOTH bases, not world-wound leakage (this run's control
  footnote).
- [open] 2026-10-28 — wound2 trajectory effect via field survival
  — 75101 runs 34 days shorter and 75108 runs 15 days longer
  post-wound2, same win/loss shape, through field-ally
  survival (this run's divergence finding).
