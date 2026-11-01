# sim-fallen90-b — DIAG: 90-day follow-up on 17724's day-60 fallen_tree episode — GO (ended by a fight, not by the walk)

Run: oversight-flesh-out-loop-b, arm sim-fallen90-b, run
fleshout-loop-b-20261101T0435Z, axis food-economy
(the 0330Z run's next blank (1): refusewin's 60d
window cut 17724's newest story off one night in —
a single fallen_tree refusal night on day 60).
Worktree sim-fallen90-b, branch sim-fallen90-b. Base
commit 7612f9ee3 (worktree HEAD at prereg writing
time). DIAG ONLY (measurement): zero src/js changes,
zero policy-default flips, zero edits to any existing
policy file or existing script. New files only, plus
the refusewin episode analyzer and the gate2hunt
analyzer reused verbatim. This worker does NOT push,
bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed
on branch, pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-fallen90-b-prereg.md, commit 035f82b70, written
BEFORE any judged leg) set GO as ALL of: (a) control
leg reproduces refusewin exactly (13 refusals, same
days, gate-2/census agreement) — else STOP, no
verdict; (b) instrument gate clean on every leg
(control 1 + judged 3 + context 5 = 9 legs, corrected
predicate); (c) 100% episode classification — zero
UNCLASSIFIED across all judged legs; (d) the
per-seed answer — above all 17724's day-60 episode
classified as resolved-by-daytime-walk (with route) /
still-refused-at-90d / ended-other — plus 17734/17737
re-checked at 90d (any new episode past day 60
listed, never hidden); (e) sense pass: at least one
resolution transcript read end to end if 17724's
episode resolves, else the day-90 refused night read
end to end.

All five are met, with one prereg wording gap
documented honestly below (it strengthens, not
weakens, the sense evidence):

- (a) Control reproduces refusewin EXACTLY: BARE 60d
  on 17724 gives 13 refusals on days 24-35 and 60,
  hop split block:creek 12 / block:fallen_tree 1,
  gate-2 12/12, gate clean, and per-evening outcomes
  identical to refusewin's 17724 leg. The betrayal.js
  +12 base move between refusewin's base and this
  base did NOT move this seed's trajectory.
- (b) Instrument gate clean on all 9 legs: errs 0,
  decisions == evenings, complete on the control,
  all 3 judged legs, and all 5 context legs.
- (c) 100% classification: 6 episodes across the 3
  judged legs, 0 UNCLASSIFIED; 1 episode across the
  5 context legs, 0 UNCLASSIFIED. Episode refusal
  counts agree exactly with the verbatim gate2hunt
  census (46 judged, 6 context, both ways).
- (d) The per-seed answer: 17724's day-60 episode
  is a 7-night run (days 60-66, fallen_tree, camp
  wetland (3,5), blocked (4,5)) that ends
  ENDED-OTHER on day 67 by blocked-combat — NOT by
  the daytime walk, and NOT still refused at 90d.
  She walks home the next day anyway (day 68,
  completed at haven), but by the definitions the
  episode's end is the combat evening, and the
  evidence says so rather than reclassifying it as
  a resolution. 17734 and 17737 grow NO new episode
  past day 60 (clean days 61-90 and 48-90
  respectively, and their first-60 evening outcomes
  reproduce refusewin night-for-night).
- (e) Sense pass, exceeded: the prereg's else-branch
  assumed the non-resolution case would be a
  still-refused day-90 night, but the actual case is
  a third path (combat ends the episode on day 67).
  So instead of the one transcript the prereg named,
  three were read end to end: the day-67 ending
  evening, the day-68 walk home, and the day-36
  resolution re-confirmed at 90d (see below). The
  gap is recorded under metric review as a prereg
  wording gap for the NEXT run, not a re-score here.

No metric was re-scored mid-run: no band bar was
defined, so no band claim arises; no seed was pooled;
H5/H6 were not run and are listed as UNRUN, not zero.

## CONTROL (on THIS base, VERBATIM driver)

BARE 60d, seed 17724 only, verbatim
scripts/refusedband-trace-b.js: gatePass true, 60
evenings, 13 refusals — days 24-35 (creek) and 60
(fallen_tree) — EXACTLY refusewin's 17724 leg,
including hop split (block:creek 12,
block:fallen_tree 1) and gate-2 12/12. The episode
analyzer on the control corpus classifies its 2
episodes cleanly (days 24-35 resolved day 36;
day 60 still-refused-at-horizon), which is the
instrument behaving as designed before judged legs.

## THE JUDGED LEGS (BARE 90d, one leg per seed, NEW 90d driver)

Travel-refused evening = eveningOutcome ===
'travel-refused'. Episode = maximal run of
consecutive travel-refused evenings on one leg.
Classifications per the prereg (resolved-by-daytime-
walk = next evening 'completed' at haven;
still-refused-at-90d = run includes day 90,
survived; ended-other = leg ended or another outcome
next, with day + outcome recorded).

| seed | episodes (days, nights, block) | end classification + route |
|---|---|---|
| 17724 | 24-35, 12 nights, creek, camp creek (5,6), blocked (4,5) | resolved day 36 by daytime walk: [[5,6],[5,5],[5,4],[4,4]] (re-confirmed at 90d) |
| 17724 | 60-66, 7 nights, fallen_tree, camp wetland (3,5), blocked (4,5) | ENDED-OTHER day 67, blocked-combat (evening tile grove (4,3)); walks home day 68, completed at haven — see sense note |
| 17734 | 10-16, 7 nights, creek, camp wetland (5,3), blocked (4,3) | resolved day 17 by daytime walk: [[5,3],[5,4],[4,4]] (re-confirmed) |
| 17734 | 26-29, 4 nights, creek, camp wetland (5,3), blocked (4,3) | resolved day 30 by daytime walk: same route (re-confirmed) |
| 17737 | 29-38, 10 nights, fallen_tree, camp forest_floor (4,2), blocked (4,3) | resolved day 39 by daytime walk: [[4,2],[5,2],[5,3],[4,3],[4,4]] (re-confirmed) |
| 17737 | 41-46, 6 nights, fallen_tree, camp forest_floor (4,2), blocked (4,3) | resolved day 47 by daytime walk: same route (re-confirmed) |

Totals (judged legs, never a band): 270 evenings,
46 travel-refused evenings (17724: 19, 17734: 11,
17737: 16), hop split block:creek 23 /
block:fallen_tree 23, bucket split creek 23 /
other-refused 23, gate-2 cross-check 23/23 (reported,
not thresholded), narrated 46/46, errs 0 on all legs,
3/3 legs survived their 90-day window. Outcome totals:
completed 161, already-inside 59, blocked-combat 3,
walk-interrupted-combat 1, travel-refused 46,
out-of-reach 0. No leg ended early; no
still-refused-at-90d episode occurred on any judged
leg; no ended-other episode besides 17724's day-67
one occurred.

Per-seed refusal days (90d): 17724: 24-35, 60-66;
17734: 10-16, 26-29; 17737: 29-38, 41-46. Clean
stretches past day 60: 17734 days 31-90 (no
refusals), 17737 days 48-90, 17724 days 37-59 and
68-90.

## BEFORE / AFTER — 60d vs 90d per seed

| seed | 60d refusals (refusewin) | 90d refusals (this arm) | what the extra 30 days changed |
|---|---|---|---|
| 17724 | 13 (24-35, 60) | 19 (24-35, 60-66) | the day-60 single night becomes a 7-night run ending in combat day 67, home day 68; first-60 outcomes reproduce exactly |
| 17734 | 11 (10-16, 26-29) | 11 (same) | nothing new; first-60 outcomes reproduce exactly; days 61-90 clean |
| 17737 | 16 (29-38, 41-46) | 16 (same) | nothing new; first-60 outcomes reproduce exactly; days 61-90 clean |

The 90d window answers the question it was bought
for, and the answer is neither of the two outcomes
the prereg's headline contemplated: 17724's
fallen_tree episode does not resolve by walking
home, and it does not run to the horizon either. A
monster fight breaks the pattern on day 67, and she
walks home the day after the fight. The window is
what ends stories, not the refusals — but here the
story ends by combat, not by the window.

## THE ANSWER, SEED BY SEED (plain words)

17724 — the day-60 night was the first night of a
week-long stuck, not a one-off. She spends seven
nights (days 60-66) at the same wetland camp (3,5),
told no by the same fallen tree at (4,5) every
night, foraging outward by day (meadow, forest
floor, creek, grove — beaver, porcupine, black bear
met and noted, packs filled, hides stripped and left
for weight). On day 67 she is out at the grove
(4,3) when Old Stare is waiting at the treeline and
the evening becomes a fight instead of a refused
hop — "OLD STARE! You're on your own." — antlers
for 8 through armor. The next day she walks the one
tile to Haven, is welcomed with 40 Codex entries,
and gets back to sowing and fishing orders. The
episode is ended-other by the letter, with a
walk-home the day after: the fight, not the walk,
is what broke the run.

17734 — nothing new. The wetland camper who walked
home twice in the first month simply never gets
stuck again: days 31-90 clean, both resolutions
re-confirmed night-for-night.

17737 — nothing new. The forest-floor camper who
walked home twice by day 47 stays clean through day
90. Two seeds' refusal stories are finished; the
third's finished by a fight.

## CONTEXT LEGS (NOT judged, reported separately, never pooled)

BARE 90d on 5 fresh seeds — 17801, 17802, 17803,
17804, 17805 — verified fresh before running: none
appears in any evidence/ filename, corpus dir, or
2026-11-01 census seed list (2026-11-01 census seeds
run 17511-17566 and 17701-17738; the refusal stack's
corpus filenames run 17611-17618 and 17701-17738;
17801-17805 appear nowhere). Gate clean on all 5
legs (errs 0, decisions == evenings, complete, all
survived 90d). Totals: 450 evenings, 6 refusals, 1
episode, 0 UNCLASSIFIED, narrated per census.

| seed | episodes (days, block) | end |
|---|---|---|
| 17801 | none (0 refusals) | — |
| 17802 | none (0 refusals) | — |
| 17803 | none (0 refusals) | — |
| 17804 | none (0 refusals) | — |
| 17805 | 11-16, 6 nights, washed_out, camp forest_floor (6,5), blocked (5,4) | resolved day 17 by daytime walk: [[6,5],[6,4],[5,4],[4,4]] |

Context reading, and only that: post-60d episodes
are rare on fresh seeds — 0 of 5 context legs grows
one, and 4 of 5 never refuse at all in 90 days. The
one context episode introduces a block type this
stack had not seen (washed_out, hop
block:washed_out), at a new funnel tile (5,4) from
a new camp (6,5) — documented here for the
coordinator (candidate sim-findings item), not
judged, not a claim about the band. No context leg
is pooled into any judged number.

## SENSE TEST (law) — the ending, the walk home, and the re-confirmed resolution, read end to end

17724 day 67 (the episode's end — blocked-combat):
the day reads as a person interrupted, not a
skipped turn. She steadies herself holding Mixtape
("Breathe. The shaking eases."), walks one tile to
the grove, and the treeline is waiting — "Old
Stare, pacing where the walls end. It waited for a
dead bearer. It'll take the living one." — then a
real turn-based fight (antlers, armor absorbing 2,
8 damage, a bellow "like a foghorn heard through
water"), and the day's haven business still runs
afterward (fishing orders to Wolfgang and Kennedy,
cooking to Valeria, in the same form lines as every
day). The refusal pattern breaks because a monster
found her first, not because the tree moved. That
is a sensible end to a stuck week: the world, not
the path, changed the evening.

17724 day 68 (the walk home, the day after): she
steadies herself holding Bus Schedule, works a grove
patch for Jerusalem Artichoke (400 kcal), walks one
tile to Haven, hears "While you were gone — 8
things you missed" (Olaoluwa staring down the Big
Beast, Mateo the Anaconda Empress, Valeria the
Living Wire, Ruth standing down the Moderator
"bloodied but breathing"), keeps a day's food,
hears "You walk back into Haven. 40 Codex entries.
The village is glad to see you.", and spends the
haven day coaxing beds, harvesting dandelions, and
sending the same three fishing/cooking orders. The
homecoming is ordinary on purpose — the fight was
the event, the walk is the return to routine. The
analyzer is right not to call day 68 the episode's
resolution: day 67 already ended the run, and day 68
is a new day's completed evening, not the first
evening after the run.

17724 day 36 (resolution re-confirmed at 90d): the
same homecoming refusewin read — Contract Quill
breath, grove patch (Muscadine Grapes, Jerusalem
Artichoke, 930 kcal), "Travel 1 tile to Haven.",
"You walk back into Haven. 26 Codex entries.",
sowing artichoke, clearing a dead bed, fishing
orders to Wolfgang, Kennedy, and Olaoluwa. The
12-night creek resolution reproduces line-for-line
at 90d, which is the control's story told a second
way: this base did not rewrite these days.

Texture notes carried, not hidden (same class as
refusewin's): the double block line on
first-refusal evenings persists (day 60 shows the
fallen_tree line twice — daytime attempt + night
hop, undistinguished; days 61-66 show it 2-4 times
as daytime foraging also meets the tree); the
fishing-order line ("X nods eagerly. They'll report
back by next part.") repeats verbatim per villager,
which reads as a form line rather than a person;
"This patch is worked out" repeats heavily on
stranded days. None contradicts any count —
positions, outcomes, and day transcripts agree
throughout. Day 67's ntTravel record is null (a
combat evening carries no travel record), which is
why the episode analyzer's blocked tile for this
episode comes from the refusal evenings' records,
not from day 67 — stated, not papered over.

## Villager behavior sample (goals, routines, dialogue)

Out of the 90d corpora: villagers forage outward
from camp by day even while stuck (meadow, creek,
grove, forest floor), set no snares on these days
but strip bodies for gland sacs and teeth, hand out
fishing/cooking orders by name, teach lessons with
the self-correction refusewin noted ("Hold on — I
already showed you this one. Stinging Nettle. You
remember." — 17805 day 17, Wanjiru), trade Codex
entries on return, react to monsters by noting them
(Anaconda Empress following, Big Beast moving out
there, Moderator, black bear "DECIDING"), and
gossip by the fire with the story growing in the
retelling ("Wolfgang telling Mateo about themself.
Half of it's true anymore."). No static or
repeated-dialogue failure beyond the form lines
noted above; the stranded evenings' haven-business
lines do not dominate these 90d transcripts, and
the day-67 fight reads as a genuine interruption
rather than a skipped turn.

## Reachability verdict

Refusal episodes are reachable AND endable on
current master at 90d, by more than one road: five
of the six judged episodes end by daytime walking,
and the sixth ends because a monster fight breaks
the evening — after which the villager walks home
anyway. "Resolved at 90d" is a per-episode verdict,
never a per-seed verdict, and now also never a
per-mechanism verdict: the walk is the usual way
out, but combat can end a run too. What the longer
window proves here is that 17724's day-60 night was
not a one-night story, that neither judged
companion seed grows a new story past day 60, and
that fresh seeds mostly never refuse at all — the
refusal phenomenon is concentrated in particular
seed trajectories, not spread thin across all of
them.

## Village assessment, in plain words

Picture the three villagers at the end of three
months. The wetland camper who spent twelve nights
being told no by the creek, walked home, and then
spent seven more nights being told no by a fallen
tree, finally gets unstuck the hard way — a monster
with antlers finds her at the grove, she takes a hit
through her armor, and the next morning she simply
walks the one tile home and gets back to sowing and
sending friends out fishing. The other two campers
walked home twice in the first month and a half and
then never got stuck again — one of them hasn't
been refused since day 30, the other since day 47,
and ninety days of evenings hold nothing else for
either of them. And on five brand-new villages,
four never hear "no" at all in three months, and the
fifth hears it for six early nights at a washed-out
crossing and walks home the same way the others
did. The night step still knows only one jump
straight home, and the daytime walk still knows the
way around — that has not changed. What the longer
window proves is that a stuck week can end in a
fight as well as a walk, and that being stuck is a
property of particular journeys, not of every
village.

## Wall numbers

NOT MEASURED BY THIS PRE-SEAT CENSUS — reported,
never fabricated. As LAST MEASURED (Loop A lane):
full seat 0 / wave 5 reached 0. This census does not
re-measure the wall: it measures refusal episodes,
not wave progression, national reach, or the table.
Observed survival on judged legs: 3 of 3 legs
survived their 90-day window (no village-lost or
over-other endings); 5 of 5 context legs also
survived 90 days. National 0, table 0, wins 0 in
this census are structural (a pre-seat refusal census
cannot reach them), not wall measurements.

## Blanks filled or documented

- FILLED (this arm, measured): the 0330Z run's next
  blank (1) — 17724's day-60 fallen_tree episode at
  90d: it is a 7-night run (days 60-66), ended-other
  day 67 by blocked-combat (Old Stare at grove
  (4,3)), with the walk home following day 68. The
  sim-findings item "REFUSAL RUNS UNRESOLVED AT THE
  HORIZON" is now closed for this episode too: at
  90d it is resolved-by-ending, not by horizon.
- FILLED (this arm, measured): 17734/17737 re-check
  at 90d — no new episode past day 60 on either
  seed; both seeds' first-60 evening outcomes
  reproduce refusewin exactly inside the 90d legs.
- FILLED (this arm, measured): base stability —
  the 60d control reproduces refusewin exactly (13
  refusals, same days, gate-2 12/12) on base
  7612f9ee3 despite the betrayal.js +12 move, and
  all three 90d legs reproduce their first-60
  outcomes exactly.
- DOCUMENTED (this arm, measured): the chokepoint
  stays per-seed — (4,5) for 17724 (all 19 refusals),
  (4,3) for 17734/17737 (all 27 refusals), unchanged
  at 90d. The context seed's funnel is new: (5,4)
  from camp (6,5).
- DOCUMENTED (this arm, measured): combat can end a
  refusal episode — 17724 day 67 is the first
  ended-other-by-combat episode in this stack, and
  the walk home follows the next day without
  counting as the episode's resolution.
- DOCUMENTED (this arm, measured, context only): a
  new block type, washed_out (17805, days 11-16,
  resolved day 17) — candidate sim-findings item for
  the coordinator; no claim is made about its band.
- DOCUMENTED (this arm, measured): context census —
  4 of 5 fresh seeds never refuse in 90 days; 0 of 5
  grows a post-60d episode. Refusal is concentrated,
  not diffuse.
- UNRUN (this arm, stated): H5/H6 cells remain UNRUN,
  not zero — no stop rule in this prereg admitted
  them, and none was invented mid-run.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars (control exact + gate clean + 100%
  classification + per-seed answer + sense pass):
  MET — (a) control 13 refusals, same days, gate-2
  12/12; (b) 9/9 legs gate-clean; (c) 6/6 judged
  episodes classified, 0 UNCLASSIFIED (context 1/1
  likewise); (d) 17724 classified ended-other day 67
  with day + outcome, 17734/17737 re-checked with no
  new past-60d episode; (e) sense pass exceeded (see
  below). No metric was re-scored mid-run: no band
  bar was defined or claimed, no seed was pooled,
  H5/H6 were not run, and 17724's episode was NOT
  reclassified as resolved despite the day-68 walk
  home — the definitions bind, and the evidence
  reports the walk as the day after, not the end.
- PREREG WORDING GAP (for the NEXT run, not a
  re-score here): the sense-pass else-branch ("else
  the day-90 refused night read end to end") assumed
  the non-resolution case would be still-refused at
  90d. The actual third path — ended-other by combat
  mid-window — was not named. The sense evidence
  here is stronger than the bar asked for (day-67
  ending + day-68 walk + day-36 resolution, all read
  end to end), but the NEXT prereg for a follow-up
  arm should name all three sense cases explicitly:
  resolution transcript if it resolves, ending-evening
  transcript if it ends other, horizon-night
  transcript if it is still refused at the horizon.
- Whether 'completed'-at-haven the morning after a
  refusal run could ever be a night-hop arrival rather
  than a daytime walk: NO under this instrument, and
  day 68 confirms the boundary from the other side —
  a completed-at-haven evening the day AFTER an
  ended-other evening is a new day's outcome, not
  the episode's resolution, because the definition
  reads only the FIRST evening after the run.
- Whether bucket and tile criteria should ever be
  merged: NO — carried; refusal counts, bucket
  counts, and tile counts stay separate throughout
  (the per-seed funnel note is a tile observation
  about refusals, not a merged criterion; the
  washed_out context episode is a bucket observation
  with its own tile, reported separately).
- Whether episodes should merge across a single
  'completed' evening: NO — carried; any non-refused
  evening splits episodes, and the split is visible
  (17724's day-67 combat evening splits the run from
  the day-68 completed evening; they are not one
  episode and not one resolution).
- Whether a 90d window is long enough: 90d answered
  this seed's question with 23 days to spare (last
  refusal day 66, clean through 90), but an episode
  starting at day 88 could still end refused at 90d.
  That outcome would be classified
  still-refused-at-90d and reported, not extended
  mid-run; a longer window belongs to the NEXT run's
  prereg.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard
and observer contract. It cannot express the
nighttravel / creekremedy-diag stacks, a 90-day
per-evening refusal census, or a census with no
variant — the same declaration refusewin made. The
comparison here is a census across legs on identical
seeds through the census analyzers, never labeled a
panel comparison. No panel result is fabricated; the
panel tool was not invoked on this corpus. No lever
comparison arose (DIAG only).

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-fallen90-b-census-90d.json --metrics
national,table,wins,exiled` prints LOUD
"national/table/wins disappeared: baseline 12/16/16
-> current 0 (n=1 files)". Investigated as a
missing-field artifact, same class as refusewin's:
this census carries no national/table/wins/exiled
fields at all (keys: corpusDir, policy, horizonDays,
legs, seeds, eveningsJudged, outcomeTotals,
totalRefusals, ...) — the check ingests a census
file where the baseline expects per-seed sweep rows,
so 0 means "field absent", not "wall moved". No
genuine LOUD signal is claimed or hidden; the
baseline is NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Index clobber hit on all five safe-commit.sh
   commits this run (prereg 035f82b70, instruments
   775608f83, control 0a22b7e34, judged bfe2252f,
   context 0488f2f4): each commit was correct (stat
   + blob verified) while the main index showed the
   committed files as staged deletions. Repaired each
   time via `git update-index --add --cacheinfo`
   from HEAD blobs (note: the repair must use
   `git rev-parse HEAD:<path>` per file — a
   `git ls-files -s` pipeline lists nothing for
   index-purged files and repairs nothing),
   verified with `git status --short` empty + `git
   diff HEAD` empty before proceeding. The
   coordinator should verify the same way after the
   final commit.
2. No EPERM flap observed on judged transports: all
   stdout runs completed first-try, all splitter
   writes landed first-try, all corpora split from
   evidence/ jsonl (never /tmp), no .jsonl leftovers
   at evidence time. (One analyzer output briefly
   went to /tmp as a throwaway cross-check read; the
   committed episodes files were generated by the
   analyzer from the evidence/ corpora at evidence
   time.)
3. Diff guard at evidence time: `git diff 7612f9ee3
   HEAD -- src/ scripts/policies/` is EMPTY — no game
   code, no policy file moved under measurement, and
   no existing script edited (to be re-verified by
   the coordinator at merge). The only script delta
   is the two NEW files (90d driver variant + proof
   test).
4. Leg timing (for the next hunt's planning): 90d
   legs ~9s per seed in-process (3 judged legs in
   28s total across separate processes; 5 context
   legs in ~95s total); the 60d control took ~37s.
   The 90d follow-up is cheap — a 120d window on a
   future horizon-cut episode would cost no more
   than a minute per seed.
5. Note: the committed episodes files
   (sim-fallen90-b-episodes-90d.json,
   sim-fallen90-b-episodes-ctx90.json,
   sim-fallen90-b-episodes-control.json) are analyzer
   output over the evidence/ corpora; regenerate with
   `node scripts/analyze-refusewin-b.js
   evidence/2026-11-01/sim-fallen90-b-corpus-90d
   <out>` (or the -ctx90 / -control corpus) if ever
   in doubt.

## Proof

scripts/test-fallen90-b.js: pure 6/6 (90d resolved /
90d still-refused horizonDay 90 / 90d ended-other by
leg ending / 90d episode splitting / 90d instrument
gate / static guard proving the 90d driver differs
from the verbatim driver only in header + DAYS gate).
scripts/test-refusewin-b.js re-run: 10/10.
Control: BARE 60d 17724 reproduces refusewin exactly
(13 refusals, same days, gate-2 12/12, gatePass true,
per-evening outcomes identical). Corpus checks: 9/9
legs pass the corrected instrument gate; episode
counts agree with the verbatim gate2hunt census (46
judged + 6 context, both ways); narration 46/46
judged; gate-2 cross-check 23/23 judged; first-60
evening outcomes reproduce refusewin exactly on all
3 judged legs inside the 90d runs.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-11-01/sim-fallen90-b-prereg.md
  (commit 035f82b70)
- Evidence (this file): evidence/2026-11-01/
  sim-fallen90-b.md
- Instruments: scripts/refusedband-trace-90d-b.js
  (NEW 90d driver variant), scripts/test-fallen90-b.js
  (instruments commit 775608f83); analyzers
  scripts/analyze-refusewin-b.js and
  scripts/analyze-gate2hunt-b.js and driver
  scripts/refusedband-trace-b.js reused VERBATIM
  from the base (no edits — verified by the diff
  guard)
- Control corpus + census: evidence/2026-11-01/
  sim-fallen90-b-corpus-control,
  sim-fallen90-b-census-control.json,
  sim-fallen90-b-episodes-control.json (commit
  0a22b7e34)
- Judged corpora (3 legs) + censuses: evidence/
  2026-11-01/sim-fallen90-b-corpus-90d,
  sim-fallen90-b-census-90d.json,
  sim-fallen90-b-episodes-90d.json (commit bfe2252f)
- Context corpora (5 legs) + censuses: evidence/
  2026-11-01/sim-fallen90-b-corpus-ctx90,
  sim-fallen90-b-census-ctx90.json,
  sim-fallen90-b-episodes-ctx90.json (commit 0488f2f4)
- No compare .md exists (no paired lever comparison —
  this is a DIAG census, never labeled a panel
  comparison).
