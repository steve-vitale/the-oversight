# sim-p4sleep-b — DIAG: the 25 P4 away mornings are deedHunt sorties in upkeep (GO — P4's away total is now citable)

Run: oversight-flesh-out-loop-b, arm sim-p4sleep-b, axis food-economy
(strand/absence thread; the 2030Z closeout's named next blank).
Worktree sim-p4sleep-b, branch sim-p4sleep-b. Base commit b26777c16
(worktree HEAD at prereg writing time). DIAG ONLY (instrument): zero
src/js changes, zero policy-default flips, zero edits to any existing
policy file or existing script. New files only. This worker does NOT
push, bump, verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch, pending coordinator merge.

## Verdict: DIAG-GO on both prereg prongs — the gap is closed, not narrowed

The binding prereg (evidence/2026-10-31/sim-p4sleep-b-prereg.md, commit
67ee7ef55, written BEFORE any judged leg) ordered exactly this: bracket
the absencehunt window on P4 nomadseek, re-derive the unexplained away
mornings on current master, and classify each one as explained-mechanism,
explained-segment-only, or still-unexplained. GO if classified fraction
>= 0.80 OR one mechanism covers >= 0.50. The run clears both bars at
their maximum:

- Pooled judged legs (24 legs: pilot F1 30d + confirm F2 30d + F1 60d):
  25 re-derived unexplained away mornings, 25 EXPLAINED-MECHANISM,
  0 explained-segment-only, 0 still-unexplained. Classified fraction
  1.000; dominant mechanism deedHunt-sortie 25/25 = 1.000.
- Distinct episode starts (de-duplicating the 60d legs' 30d prefix):
  17 starts, 17 explained by deedHunt-sortie, 0 residue. The pooled
  and distinct views agree; neither is a re-score — the prereg judged
  the pooled count, and the distinct count is reported alongside so
  no reader mistakes the 60d prefix for new episodes.
- Denominator guard: pooled denominator 25 >> 4, so the
  "GAP-NOT-REPRODUCED" branch does not apply. The gap reproduced
  exactly (see re-derivation below) and then closed completely.

## Re-derivation on current master: the old-base census reproduces EXACTLY

Every judged cell matches absencehunt's old-base (a3e57bfc1) census on
every reported count — the journey-scale r63 landings between the two
bases did not move this substrate at all:

| cell | genuine | day trips | sleep-returns | away-origin | unexplained | (old base) |
|------|---------|-----------|---------------|-------------|-------------|------------|
| P4 F1 30d (new) | 1 [17501 d17] | 178 | 0 | 34 | 8 | identical |
| P4 F2 30d (new) | 1 [17514 d28] | 177 | 0 | 28 | 6 | identical |
| P4 F1 60d (new) | 2 [17501 d17, 17507 d50] | 295 | 0 | 101 | 11 | identical |

Unexplained mornings per seed, new base = old base, loop-day for
loop-day: F1 30d — 17502:[23], 17503:[18,27], 17504:[10], 17506:[27],
17507:[20,26], 17508:[22]; F2 30d — 17511:[12,16], 17512:[25],
17516:[24], 17517:[22,27]; F1 60d adds only 17505:[37], 17507:[34],
17508:[34] in days 31-60. 60d-prefix determinism: the F1 60d legs'
first-30 loop-days reproduce the F1 30d unexplained lists exactly
(8/8 seeds match), so the 60d horizon extends trajectories, never
re-rolls them. Game-overs (death-aware horizons working): 17501 day
25 (both 30d and 60d legs), 17518 F2 day 21 — the same legs absencehunt
lost. Corpus checks pass on all 24 legs (decisions == evenings,
errs 0, loop-days contiguous, windows close loop-days 2..N, every
unexplained morning carries a window record).

## The mechanism: deedHunt sorties, launched in upkeep — NOT night moves

Pooled segment split over the 25 episode starts: upkeep-1: 18,
upkeep-3: 7, sleep: 0, wait-block: 0, fight-drive: 0, contest-drive: 0.
Every explaining move carries a capHuntSorties delta of exactly 1 in
its own upkeep hook call, and every one lands the vessel on a
non-haven node (destinations pooled: creek 9, trail_edge 5, meadow 5,
grove 3, ruin 2, forest_floor 1). The anatomy, from capable.js
deedHunt (read before any sim, confirmed by trace):

- deedHunt runs in policy.upkeep — i.e. in the harness's 3 upkeep
  parts that run BEFORE daily() each loop-day. When the feast surge
  is pending (feasted, surge unused) or a wave's lesser-seat bar is
  short, it walks to the nearest known world monster (weakest wave
  first, within 4 nodes) and starts the fight.
- The vessel therefore leaves Haven DURING the loop-day's upkeep
  parts and is already out when daily() starts — which is exactly
  when the absencehunt morning snap is taken. The evening snap (end
  of the previous daily) saw it home; the morning snap sees it out.
  The pair looks like an overnight move. It is not. No sleep-segment
  move explains any of the 25, and no wait-block, fight-drive, or
  contest-drive move starts any episode.
- The "window" is a misnomer this arm inherited and now corrects:
  the bracketed interval is not the night — it is sleep PLUS the
  next loop-day's full upkeep sequence (dawn through dusk parts, per
  the 17502 transcript below). The next run's prereg should call it
  the upkeep bracket, not the sleep window (metric review).
- 10 of the 25 sorties never reach their monster (capHuntUnreached
  1): the walk hops toward the target node and stops partway
  (blocked path, out of reach), and the vessel still ends the day
  out — e.g. 17503 morning 18 ends on trail_edge (3,2), not at the
  monster. A failed sortie strands just as surely as a fought one.
  Counter split pooled (overlapping, not exclusive): feast-fights 5,
  wave-fights 10, noticed-en-route 13, ambushed 0.
- Why the vessel stays out for days: deedHunt's walk-home-after-
  sortie runs only on a LATER quiet upkeep (no goal left). While a
  feast surge stays pending or a wave bar stays short, every upkeep
  re-arms a goal instead of walking home — so one sortie becomes a
  multi-morning episode. Episode lengths on the 30d bands: 1-10
  mornings (14 episodes: 5,2,4,2,4,4,1,8,10,6,4,5,7,2); the 60d legs
  show the long tail (17503's day-27 episode runs 24 mornings;
  17505's day-37 episode runs 19).
- Return legs are visible in the same brackets and do not
  contradict the census: 5 away->haven window moves on F1 30d
  (2/10 on F2 30d / F1 60d) — vessels walking home during upkeep,
  including one fight-drive return (17502 morning 28, ruin->haven)
  and two full round-trips inside a single window (17502 morning
  29: out in upkeep-1, home in upkeep-3; 17507 morning 29: out in
  upkeep-1, home in upkeep-2). A round-trip leaves NO trace in the
  evening/morning census at all — the census can therefore
  UNDERCOUNT deedHunt sorties, never overcount them. Sleep-returns
  stay 0 because these returns close windows that opened away
  (away-return class), not windows that opened with a departure.

## Per-seed classification counts (all judged legs)

F1 30d (pilot): 17501: 0 unex (genuine d17); 17502: 1 (d23,
deedHunt-sortie, upkeep-3, ruin); 17503: 2 (d18 upkeep-1 trail_edge,
d27 upkeep-3 trail_edge); 17504: 1 (d10 upkeep-1 creek); 17505: 0;
17506: 1 (d27 upkeep-1 creek); 17507: 2 (d20 upkeep-3 meadow, d26
upkeep-1 grove); 17508: 1 (d22 upkeep-1 creek).
F2 30d (confirm): 17511: 2 (d12 upkeep-1 forest_floor, d16 upkeep-1
creek); 17512: 1 (d25 upkeep-1 trail_edge); 17513: 0; 17514: 0
(genuine d28); 17515: 0; 17516: 1 (d24 upkeep-1 creek); 17517: 2
(d22 upkeep-1 meadow, d27 upkeep-3 meadow); 17518: 0 (village-lost
d21).
F1 60d (confirm): the F1 30d list exactly, plus 17505: d37 upkeep-1
creek; 17507: d34 upkeep-1 grove; 17508: d34 upkeep-1 meadow.
Narration field: 25/25 narrated IN THE WINDOW STREAM (travel lines
inside the explaining upkeep hook call). See the correction below —
this does not contradict absencehunt's daily-transcript note.

## SENSE TEST (law) — PASS, with one correction to the prior note

Read end to end: the full window say stream for 17502, closing
morning 23 (evening day-22 lines, window seq 2525-2691, morning
day-23 lines), plus the explaining hook call (upkeep-3, seq
2603-2620). Judgement:

- The episode reads as a person going out to face a beast, not a
  teleport and not a counter increment. Evening day 22 ends with
  the vessel asleep in the hall ("You settle into the hall floor.
  Sleep takes you.") through a night raid on Haven. Dawn day 23
  wakes rested; the day's upkeep parts run chores, then at dusk
  the feast fires ("FEASTED x2.03"), the draw announces itself
  ("Night Court is circling the edge of the light. It followed the
  feast here. Face it while the feast is in you"), and the vessel
  walks: "Travel 1 tile to ruin" — then fights Ugly-Eyes at the
  ruin with Jae joining ("About time someone fought back"), wins
  it, fights a Hushpuppy, and the next daily starts at the ruin
  looting ("Taken: Gland sac x1, Teeth x2, Ugly-Eyes (carcass)
  x1"; "Emma is Scout now"). Every position change in the window
  has a line that earns it, in order. Nothing claims a return that
  didn't happen; the morning at the ruin matches the fight.
- CORRECTION to absencehunt's note (stated, not hidden): absencehunt
  wrote "no narrated leg covers the haven->ruin move itself" and
  "P4's sleep/upkeep-window moves have no narrated leg at all".
  That holds for DAILY transcripts — the move never appears in any
  day's dayLines, because it happens in upkeep, outside daily().
  But the upkeep say stream DOES narrate it ("Travel 1 tile to
  ruin", the feast-draw line, the fight lines). A reader of daily
  transcripts alone still sees an unexplained jump; a reader of
  the full say stream does not. The narration gap is therefore a
  transcript-visibility gap, not a silent action: 25/25 episode
  starts are narrated in the window stream, 0/25 in the daily
  transcript. No narration wording changes land in this arm (DIAG
  only); the counts above are the design note a future arm needs.
- Texture note, not a contradiction: the "fragments by the fire"
  gossip lines fire during the ruin fight's wait-blocks (the same
  ambient-fire texture absencehunt noted at creek camps) — the fire
  is Haven's, the vessel is at the ruin, and the lines read as if
  the vessel hears them. Same note, same severity: flavor, not a
  position contradiction.

## Citability verdict: P4's away total IS now citable, under this definition

Citable form: P4's away total = genuine departure-days + deedHunt-
sortie episode starts, where an episode start is a morning away
whose previous evening was at haven AND whose upkeep bracket
contains a deedHunt sortie move (capHuntSorties delta 1 in the
explaining upkeep hook call, haven->away position trace). Residue:
0 on all 24 judged legs (25 pooled starts, 17 distinct starts).
Numbers citable per cell: F1 30d — genuine 1 + episode starts 8;
F2 30d — genuine 1 + episode starts 6; F1 60d — genuine 2 + episode
starts 11 (8 of which are the 30d prefix, 3 new in days 31-60).
What is NOT citable: a single pooled "nights away" total without
stating whether 60d prefixes are double-counted (25 pooled vs 17
distinct — always say which), and any claim that deedHunt sorties
are the ONLY way P4 goes away (round-trips inside one window leave
no census trace, so sortie counts are a lower bound on sorties,
and road absences remain 0 because the nomad gate never fired on
this grid).

## Village assessment, in plain words

Picture what absencehunt left unexplained: a scholar who goes to bed
at Haven and wakes up at a ruin, a creek, a grove — five mornings
out of thirty on some villages, with no story in between. The story
was there all along; it was just happening before the day's diary
entry starts. This scholar eats a feast at dusk, feels the surge in
her, hears something circling the edge of the firelight, and walks
out to meet it — to the ruin, to the creek, to the meadow — because
the village's own deed-hunt says a fighter who is feasted should go
find the beast rather than wait for it. Sometimes she reaches it and
fights it with friends at her back; sometimes the path stops short
and she simply ends the day where the walk ran out. And because the
surge stays unspent or the wave's bar stays short, nobody walks her
home the next morning either — she works that ground for days, comes
home, feasts again, and goes out again. The village that "always
comes home for supper" was never the whole picture on this policy:
on nomadseek, the scholar's nights away are not accidents of the
road home failing. They are hunting trips that start before breakfast
is written down.

## Wall numbers

NOT OBSERVABLE on a 30/60-day pre-seat census — reported, never
fabricated. Observed counts on all judged legs: 22 of 24 legs
survived their window; 2 ended village-lost (17501 day 25, 17518
F2 day 21). National 0, table 0, wins 0 (structurally unreachable
in this band, not a wall measurement); median survival is
window-censored (most legs survive the full window). Wave reach is
not reported as a wall number here because this census measures
absence attribution, not wave progression; maxWaveUnlocked per leg
is in the corpora, not summarized as reach.

## Blanks filled or documented

- Filled (this arm, measured): THE 25 ARE EXPLAINED. All 25
  old-base unexplained away mornings reproduce on current master
  and classify as deedHunt-sortie episode starts in upkeep
  (upkeep-1: 18, upkeep-3: 7 pooled). P4's away total is citable
  under the definition above. The 2030Z closeout's named next
  blank is closed.
- Filled (this arm, measured): THE WINDOW IS NOT THE NIGHT. Sleep
  moves 0, wait-block moves 0, fight/contest-drive episode starts
  0. The bracketed interval's action is the next loop-day's upkeep
  parts — daytime sorties misread as overnight moves by the
  evening/morning snap pair.
- Filled (this arm, measured): FAILED SORTIES STILL STRAND. 10/25
  explaining sorties never reached their monster; the partway walk
  alone ends the day away.
- Documented (this arm, design note with counts, NO wording change
  landed): daily transcripts narrate 0/25 episode starts; the
  window say stream narrates 25/25. A future arm that wants
  episode starts legible in daily transcripts has the counts; this
  arm changes no wording.
- Documented (this arm, measurement limit): round-trip sorties
  inside one window (out and home before daily starts) leave no
  census trace — 2 observed on F1 30d — so deedHunt sortie counts
  from evening/morning censuses are lower bounds on sorties.
- Documented (this arm, carried, NOT re-judged): road absences
  remain 0 on all 24 legs (nomad gate never fired); the P3 patrol
  flood and P1 return-failure episodes from absencehunt are
  untouched by this arm (P4 only).

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg definitions HELD: classified fraction 1.000 and dominant
  share 1.000 were judged exactly as written; no metric was
  re-scored. The pooled-vs-distinct reporting is a presentation
  of the same judged data (60d prefix double-count disclosed),
  not a second verdict.
- New doubt for the NEXT run: rename the bracket. "Sleep/upkeep
  window" misleads — the moves are daytime upkeep sorties, and
  the sleep segment contributed 0/25. The next prereg should call
  it the upkeep bracket (sleep + next-day upkeeps, in that order)
  and pre-register the sleep segment's expected 0 explicitly.
- New doubt for the NEXT run: the narration field needs two
  channels, not one — window-stream narration vs daily-transcript
  narration. This run's "narrated" means window-stream; a future
  arm judging transcript coherence must pre-register which channel
  it judges.
- New doubt for the NEXT run: whether the morning snap should move
  before the upkeep parts (as absencehunt's metric review floated
  for the sleep question). On P4 that change would turn all 25
  episode starts into genuine transitions (evening away would
  follow a haven morning correctly) — but it would also move the
  snap before the day's chores, changing every other census class
  with it. Argue it in the next prereg, not here.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nomadseek upkeep-bracket census, a 30/60-day
per-day absence census, or a census with no variant — the same
declaration every prior strand arm made. The comparison here is a
census across seed bands on identical seeds through the window
analyzer, never labeled a panel comparison. No panel result is
fabricated; the panel tool was not invoked on this corpus. No lever
comparison arose (DIAG only).

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit BOTH instrument commits (prereg
   file, then all 4 instrument files: committed files showing
   staged-as-deleted while byte-identical in the worktree).
   Repaired each time via `git update-index --add --cacheinfo`
   from HEAD blobs; `git status --short` empty + `git diff HEAD`
   empty verified after each repair. The commits themselves were
   never in doubt (blob hashes match). The coordinator should
   verify the same way after the final commit below.
2. No EPERM flap observed in this window: all stdout transports
   split first-try, all splitter writes landed first-try. The
   stdout transport rule was followed anyway (judged legs never
   wrote from a game-loaded process; jsonl files deleted after
   split; judged corpora never staged in /tmp).
3. Tracer read-only claim, stated with its one caveat: wrappers
   snap via the same read-only snapPos absencehunt used, plus one
   new call site class (doAction/fight/contest boundaries). The
   mechanism evidence does not depend on snaps at all — it is the
   ctx counter deltas (capHuntSorties) inside the explaining hook
   calls, which only policy code itself can produce. The
   re-derivation's exact match to the old-base census (every count,
   every loop-day) is independent evidence the tracer did not
   perturb trajectories.

## Proof

scripts/test-p4sleep-b.js: pure 16/16; corpus checks 65/65 (F1 30d),
63/63 (F2 30d), 68/68 (F1 60d) per corpus (decisions == evenings,
errs 0, loop-days contiguous, windows close loop-days 2..N, every
unexplained morning carries a window record).
60d-prefix determinism: F1 60d first-30 unexplained lists match F1
30d on 8/8 seeds.
Diff guard: `git diff --name-only b26777c16 -- src/ scripts/policies/`
EMPTY at evidence time.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-p4sleep-b-prereg.md (commit 67ee7ef55)
- Evidence (this file): evidence/2026-10-31/sim-p4sleep-b.md
- Instruments: scripts/p4sleep-trace-b.js,
  scripts/split-p4sleep-jsonl-b.js, scripts/analyze-p4sleep-b.js,
  scripts/test-p4sleep-b.js (instruments commit 1a482f00)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-10-31/sim-p4sleep-b-corpus-p4-f1-30d,
  sim-p4sleep-b-corpus-p4-f2-30d,
  sim-p4sleep-b-corpus-p4-f1-60d
- Censuses (analyzer output, one per corpus):
  evidence/2026-10-31/sim-p4sleep-b-census-p4-f1-30d.json,
  sim-p4sleep-b-census-p4-f2-30d.json,
  sim-p4sleep-b-census-p4-f1-60d.json
- No compare .md exists (no paired lever comparison — this is a
  DIAG census, never labeled a panel comparison).
