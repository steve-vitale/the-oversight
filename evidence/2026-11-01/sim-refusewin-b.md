# sim-refusewin-b — DIAG: longer-window refusal episodes GO (both 30d-stranded seeds resolve by daytime walking)

Run: oversight-flesh-out-loop-b, arm sim-refusewin-b, run
fleshout-loop-b-20261101T0330Z, axis food-economy
(tracker next blank 2 from the 0249Z closeout, and
sim-findings "REFUSAL RUNS UNRESOLVED AT THE HORIZON;
H5/H6 UNRUN", loop-B 0119Z gate2hunt arm: a 30d window
cuts stranded stories off mid-run). Worktree
sim-refusewin-b, branch sim-refusewin-b. Base commit
6409c1312 (worktree HEAD at prereg writing time).
DIAG ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy
file or existing script. New files only, plus the
refusedband driver and gate2hunt analyzer reused
verbatim. This worker does NOT push, bump, verify live,
or merge into master; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator
merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-refusewin-b-prereg.md, commit 46ebaf946, written
BEFORE any judged leg) set GO as ALL of: (a)
instrument gate clean on every judged leg (control 2
+ judged 3 = 5 legs, corrected predicate); (b) 100%
episode classification — zero UNCLASSIFIED; (c) the
question answered per seed: did 17724 and 17737
resolve, and by what route, with 17734's known
resolution re-confirmed or corrected at 60d; (d)
sense pass: at least one resolution transcript read
end to end, plus the (4,3) chokepoint verdict at 60d
and any NEW refusal episodes past day 30.

All four are met:

- (a) Instrument gate clean on all 5 legs: every leg
  errs 0, decisions == evenings, complete (all 5
  days-complete; no leg needed the sleep-step
  disjunct).
- (b) 100% classification: 6 episodes across the 3
  judged legs, 0 UNCLASSIFIED. Episode refusal counts
  agree exactly with the verbatim gate2hunt census
  (40 refusals both ways).
- (c) The question is answered per seed, and the
  answer is yes in both cases: 17724's 12-night creek
  run (days 24-35) resolves day 36 by daytime walking
  around via [[5,6],[5,5],[5,4],[4,4]]; 17737's
  10-night fallen_tree run (days 29-38) resolves day
  39 by daytime walking via
  [[4,2],[5,2],[5,3],[4,3],[4,4]], and its second run
  (days 41-46) resolves day 47 the same way. 17734's
  known resolution is RE-CONFIRMED at 60d: its first
  30 days reproduce gate2hunt's 30d shape exactly
  (days 10-16 resolved day 17; days 26-29 resolved day
  30), and it carries no new episode past day 30.
- (d) Sense pass: two resolution transcripts read end
  to end (17724 day 36, 17737 day 39 — see below);
  the (4,3) chokepoint still binds for 17734 and 17737
  at 60d while 17724's funnel remains (4,5) (it was
  never (4,3) — see the correction below); NEW
  episodes past day 30 exist on two seeds: 17737's
  second episode (days 41-46, resolved day 47) and
  17724's single night on day 60 (fallen_tree, still
  refused at the horizon — the window cuts a story off
  again, one night in).

No metric was re-scored mid-run: no band bar was
defined, so no band claim arises; no seed was pooled;
H5/H6 were not run and are listed as UNRUN, not zero.

## CONTROL-DRIVER (pilot part 1, on THIS base)

BARE 30d, seeds 17734 + 17737, gate2hunt analyzer
verbatim: gatePass true, 60 evenings, 13 refusals —
17734 days 10-16 and 26-29 (11, creek), 17737 days
29-30 (2, fallen_tree) — EXACTLY gate2hunt's 30d
numbers, including hop split (block:creek 11,
block:fallen_tree 2) and gate-2 11/11. Trajectories
are base-stable between ee159dbc3 and 6409c1312, as
expected given `git diff ee159dbc3 HEAD -- src/js`
is empty. The episode analyzer on the control corpus
classifies its 3 episodes cleanly (17734's two runs
both resolved-by-daytime-walk at days 17 and 30;
17737's run still-refused-at-horizon), which is the
instrument behaving as designed before judged legs.

## THE JUDGED LEGS (BARE 60d, one leg per seed)

Travel-refused evening = eveningOutcome ===
'travel-refused'. Episode = maximal run of
consecutive travel-refused evenings on one leg.
Classifications per the prereg (resolved-by-daytime-
walk = next evening 'completed' at haven; still-
refused-at-60d = run includes the last day, survived;
ended-other = leg ended or another outcome next).

| seed | episodes (days, nights, block) | end classification + route |
|---|---|---|
| 17724 | 24-35, 12 nights, creek, camp creek (5,6), blocked (4,5) | resolved day 36 by daytime walk: [[5,6],[5,5],[5,4],[4,4]]; day-36 lines "Travel 1 tile to Haven." / "You walk back into Haven." |
| 17724 | 60, 1 night, fallen_tree, camp wetland (3,5), blocked (4,5) | still-refused-at-60d (NEW past day 30) |
| 17734 | 10-16, 7 nights, creek, camp wetland (5,3), blocked (4,3) | resolved day 17 by daytime walk: [[5,3],[5,4],[4,4]] (re-confirmed) |
| 17734 | 26-29, 4 nights, creek, camp wetland (5,3), blocked (4,3) | resolved day 30 by daytime walk: same route (re-confirmed) |
| 17737 | 29-38, 10 nights, fallen_tree, camp forest_floor (4,2), blocked (4,3) | resolved day 39 by daytime walk: [[4,2],[5,2],[5,3],[4,3],[4,4]] |
| 17737 | 41-46, 6 nights, fallen_tree, camp forest_floor (4,2), blocked (4,3) | resolved day 47 by daytime walk: same route (NEW past day 30) |

Totals (judged legs, never a band): 180 evenings,
40 travel-refused evenings (17724: 13, 17734: 11,
17737: 16), hop split block:creek 23 /
block:fallen_tree 17, bucket split creek 23 /
other-refused 17, gate-2 cross-check 23/23 (reported,
not thresholded), narrated 40/40, errs 0 on all legs,
3/3 legs survived their 60-day window. Outcome totals:
completed 121, already-inside 17, blocked-combat 1,
walk-interrupted-combat 1, travel-refused 40,
out-of-reach 0. No leg ended early; no ended-other
episode occurred.

Per-seed refusal days (60d): 17724: 24-35, 60;
17734: 10-16, 26-29; 17737: 29-38, 41-46. Clean
stretches past day 30: 17734 days 31-60 (no
refusals), 17737 days 48-60, 17724 days 37-59.

## THE ANSWER, SEED BY SEED (plain words)

17724 — the H3 creek case — did resolve, and it took
longer than the 30d window allowed: the run that the
30d window showed as 7 nights (days 24-30) is really
a 12-night run (days 24-35) at the same creek camp
(5,6), blocked at (4,5). On day 36 she walks home in
daylight around the creek — south through (5,5) and
(5,4) to haven (4,4) — and spends the day foraging,
sowing, and giving fishing orders like nothing
happened. The 30d cut was 6 nights early, not a
different story.

17737 — the H4 fallen_tree case — resolved twice over.
The 2-night stub the 30d window showed (days 29-30)
is really a 10-night run (days 29-38) at the same
forest-floor camp (4,2), blocked at (4,3); she walks
home day 39. Then she goes out again and the same
shape repeats: 6 nights (days 41-46), home day 47.
Fallen_tree refusals resolve exactly the way creek
refusals do — by waiting for daylight and walking
around — which the 30d window could not show because
it ended on night 2.

17734 — the known resolution — is re-confirmed, not
corrected: its 60d leg reproduces the 30d shape
night-for-night (10-16 resolved 17; 26-29 resolved
30) and then stays clean for 30 more days. The
daytime-walk resolution is not a 30d artifact.

## THE CHOKEPOINT AT 60d (correction + verdict)

Correction to the gate2hunt shorthand: the
chokepoint was never one tile for all seeds. 17724's
refusals were blocked at (4,5) already in gate2hunt's
H3 report (camp (5,6), haven (4,4), the tile between
them on the hop's path); only 17734/17737 (and 17606,
H1's 17703) funnel through (4,3). At 60d the verdict
is: (4,3) still binds for 17734 and 17737 (every one
of their 27 refusals blocked at (4,3)), and (4,5)
still binds for 17724 (every one of its 13 refusals
blocked at (4,5), including the new day-60 night).
The funnel is per-seed — the tile the single night
hop must cross from that seed's camp — not a
universal tile. No refusal in this arm is blocked
anywhere else.

## NEW EPISODES PAST DAY 30 (listed, not hidden)

- 17737 days 41-46 (6 nights, fallen_tree, (4,3)):
  resolved day 47 by daytime walk. A full second
  episode the 30d window never saw.
- 17724 day 60 (1 night, fallen_tree, (4,5)):
  still-refused-at-horizon. The 60d window cuts a
  story off again — one night in, at a new camp
  (wetland (3,5)) with a new block type for this seed.
  Whether it becomes a run is a question for a longer
  window, not a claim made here.
- 17734: no new episode past day 30 (days 31-60
  clean).

## SENSE TEST (law) — resolutions read end to end

17724 day 36 (the key resolution): the day reads as
a person coming home, not a snap. She starts with a
calming breath over the Contract Quill ("Breathe.
The shaking eases."), works a grove patch for
Muscadine Grapes and Jerusalem Artichoke (930 kcal),
walks the tile to Haven, keeps a day's food, is
welcomed ("You walk back into Haven. 26 Codex
entries. The village is glad to see you."), then
spends the haven day sowing artichoke, clearing a
dead bed, and sending Wolfgang, Kennedy, and Olaoluwa
out to fish. The 12 refused nights behind her are
not mentioned — but nothing claims she crossed the
creek at night, and the walk itself is narrated step
by step. The day before (day 35, still refused) she
is stalked twice by the Big Beast while out at the
creek camp, which makes the homecoming read as
relief, not routine.

17737 day 39 (the fallen_tree resolution): the same
shape with more texture. She forages a grove patch
(920 kcal), sets a snare, walks the tile to Haven
past a Static Kite pacing at the treeline ("unwilling.
The walls end the argument. It's still out there."),
lays out the haul while Jack starts a lesson and
catches himself — "Hold on — I already showed you
this one. Hickory Nuts. You remember." — then garden
magic and fishing orders for Nicole and Jack. The
self-correcting lesson line is the opposite of
robotic: the villager remembers what was already
taught. The walk-home reads as a person finding a
way: grove, Haven, hall, in that order, with the
world still threatening at the edges.

Texture notes carried, not hidden (same class as
gate2hunt's): the double block line on first-refusal
evenings persists (17724 day 60 shows the fallen_tree
line twice — daytime attempt + night hop,
undistinguished); the fishing-order line ("X nods
eagerly. They'll report back by next part.") repeats
verbatim per villager, which reads as a form line
rather than a person; "This patch is worked out"
repeats heavily on stranded days. None contradicts
any count — positions, outcomes, and day transcripts
agree throughout.

## Villager behavior sample (goals, routines, dialogue)

Out of the 60d corpora: villagers forage outward,
set snares, sow and tend garden beds, strip bodies
for gland sacs and teeth, hand out fishing orders by
name, teach lessons (with the self-correction above),
trade Codex entries on return, and react to monsters
by giving wide berth or being followed (Big Beast,
Anaconda Empress, Static Kite at the treeline). No
static or repeated-dialogue failure beyond the form
lines noted above; the stranded evenings' haven-
business lines (donations, broadcasts) noted by
gate2hunt do not dominate these 60d transcripts.

## Reachability verdict

Refusal episodes are reachable AND resolvable on
current master at 60d: both 30d-stranded seeds
resolve by daytime walking, and the known resolution
reproduces exactly. The longer window does not
change the mechanism — it completes the story the
30d window cut off. What a longer window also does
is open new stories: 17737 grows a second episode,
and 17724 ends refused again on day 60, so "resolved
at 60d" is a per-episode verdict, never a per-seed
verdict. A seed is not "done refusing" because one
episode resolved.

## Village assessment, in plain words

Picture the three villagers at the end of two
months. The creek-camper who spent twelve nights
being told no by the water finally walks home on a
morning in the second month, sows her artichokes,
and sends three friends out fishing — then, on the
very last night of the window, is out at a different
wetland being told no by a fallen tree instead. The
forest-floor camper who was stuck for two nights
when the first month ended turns out to have been
stuck for ten, walks home, goes out again, and is
stuck for six more before walking home a second
time. And the wetland camper from the band walks
home twice in the first month and then simply never
gets stuck again. The night step still knows only
one jump straight home, and the daytime walk still
knows the way around — that has not changed. What
the longer window proves is that the daytime walk
always eventually wins, on creek and on fallen tree
alike, and that no seed is finished with refusing
just because one run ended: the same villager can
resolve, go out, and refuse again. The window is
what ends, not the story.

## Wall numbers

NOT MEASURED BY THIS PRE-SEAT CENSUS — reported,
never fabricated. As LAST MEASURED (Loop A lane):
full seat 0 / wave 5 reached 0. This census does not
re-measure the wall: it measures refusal episodes,
not wave progression, national reach, or the table.
Observed survival on judged legs: 3 of 3 legs
survived their 60-day window (no village-lost or
over-other endings). National 0, table 0, wins 0 in
this census are structural (a pre-seat refusal census
cannot reach them), not wall measurements.

## Blanks filled or documented

- FILLED (this arm, measured): the 30d-stranded
  question — 17724 resolves day 36 (12-night run),
  17737 resolves day 39 (10-night run) and again day
  47 (6-night run), by daytime walking in every case,
  with routes recorded. The sim-findings item
  "REFUSAL RUNS UNRESOLVED AT THE HORIZON" is closed
  for these two seeds at 60d.
- FILLED (this arm, measured): 17734's resolution
  re-confirmed at 60d (identical first-30-days shape,
  no new episode past day 30).
- DOCUMENTED (this arm, measured): the chokepoint is
  per-seed, not universal — (4,3) for 17734/17737,
  (4,5) for 17724, unchanged at 60d.
- DOCUMENTED (this arm, measured): new episodes past
  day 30 — 17737's second episode (resolved) and
  17724's day-60 night (still refused at horizon).
  The 60d window itself cuts a story off, one night
  in.
- DOCUMENTED (this arm, measured): base stability —
  the 30d control reproduces gate2hunt exactly
  (13 refusals, same days, gate-2 11/11) on base
  6409c1312.
- UNRUN (this arm, stated): H5/H6 cells remain UNRUN,
  not zero — no stop rule in this prereg admitted
  them, and none was invented mid-run.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars (instrument clean + 100%
  classification + per-seed answer + sense pass):
  MET, on all four legs — (a) 5/5 legs gate-clean,
  (b) 6/6 episodes classified, 0 UNCLASSIFIED, (c)
  17724 resolved day 36, 17737 resolved days 39 and
  47, 17734 re-confirmed, (d) two resolution
  transcripts read end to end, chokepoint verdict
  stated, new past-30d episodes listed. No metric was
  re-scored mid-run: no band bar was defined or
  claimed, no seed was pooled, H5/H6 were not run.
- The 60d window question (carried from prereg):
  60d answered the named seeds' question, but day 60
  itself opens a new unresolved episode on 17724 —
  a longer window (90d) for that seed belongs to the
  NEXT run's prereg, not to an extension here.
- Whether 'completed'-at-haven could ever be a
  night-hop arrival rather than a daytime walk: NO
  under this instrument, and the resolution days'
  lines confirm it — every resolution day carries
  "Travel 1 tile to Haven." plus "You walk back into
  Haven." in its dayLines.
- Whether bucket and tile criteria should ever be
  merged: NO — carried; refusal counts, bucket
  counts, and tile counts stay separate throughout
  (the per-seed funnel note is a tile observation
  about refusals, not a merged criterion).
- Whether episodes should merge across a single
  'completed' evening: NO — carried; any non-refused
  evening splits episodes, and the split is visible
  (17737's two episodes are separated by days 39-40
  at haven).

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard
and observer contract. It cannot express the
nighttravel / creekremedy-diag stacks, a 60-day
per-evening refusal census, or a census with no
variant — the same declaration gate2hunt made. The
comparison here is a census across legs on identical
seeds through the census analyzers, never labeled a
panel comparison. No panel result is fabricated; the
panel tool was not invoked on this corpus. No lever
comparison arose (DIAG only).

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-refusewin-b-census-60d.json --metrics
national,table,wins,exiled` prints LOUD
"national/table/wins disappeared: baseline 12/16/16
-> current 0 (n=1 files)". Investigated as a
missing-field artifact, same class as gate2hunt's and
refusedband's: this census carries no
national/table/wins/exiled fields at all (keys:
corpusDir, policy, horizonDays, legs, seeds,
eveningsJudged, outcomeTotals, totalRefusals, ...) —
the check ingests a census file where the baseline
expects per-seed sweep rows, so 0 means "field
absent", not "wall moved". No genuine LOUD signal is
claimed or hidden; the baseline is NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Index clobber hit on all three safe-commit.sh
   commits this run (prereg 46ebaf946, instruments
   fb4b39f54, control corpus 15644587): each commit
   was correct (stat + blob verified) while the main
   index showed the committed files as staged
   deletions. Repaired each time via `git
   update-index --add --cacheinfo` from HEAD blobs,
   verified with `git status --short` empty + `git
   diff HEAD` empty + hash-object match before
   proceeding. The coordinator should verify the same
   way after the final commit.
2. No EPERM flap observed on judged transports: all
   stdout runs completed first-try, all splitter
   writes landed first-try, all corpora split from
   evidence/ jsonl (never /tmp), no .jsonl leftovers
   at evidence time. (The episode analyzer's /tmp
   output was a throwaway cross-check read, not a
   judged corpus — the committed episodes file is
   generated by the analyzer from the evidence/
   corpus at evidence time.)
3. Diff guard at evidence time: `git diff --name-only
   6409c1312 -- src/ scripts/policies/` is EMPTY — no
   game code, no policy file moved under measurement
   (to be re-verified by the coordinator at merge).
4. Leg timing (for the next hunt's planning): 60d
   legs ~25s per seed (3 legs, 75s total). The 90d
   follow-up on 17724's day-60 episode is cheap.
5. Note: the committed episodes file
   (sim-refusewin-b-episodes-60d.json) is analyzer
   output over the evidence/ corpus; regenerate with
   `node scripts/analyze-refusewin-b.js
   evidence/2026-11-01/sim-refusewin-b-corpus-60d
   <out>` if ever in doubt.

## Proof

scripts/test-refusewin-b.js: pure 10/10 (resolved /
still-refused / ended-other by leg-end / ended-other
by moved / episode splitting / UNCLASSIFIED-only case
/ gate cases / aggregation / fallen_tree route).
Control-driver: BARE 30d 17734+17737 reproduces
gate2hunt exactly (13 refusals, same days, gate-2
11/11, gatePass true). Corpus checks: 5/5 legs pass
the corrected instrument gate; episode counts agree
with the verbatim gate2hunt census (40 refusals both
ways); narration 40/40; gate-2 cross-check 23/23.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-11-01/sim-refusewin-b-prereg.md
  (commit 46ebaf946)
- Evidence (this file): evidence/2026-11-01/
  sim-refusewin-b.md
- Instruments: scripts/analyze-refusewin-b.js,
  scripts/test-refusewin-b.js (instruments commit
  fb4b39f54); driver scripts/refusedband-trace-b.js
  and analyzer scripts/analyze-gate2hunt-b.js reused
  verbatim from the base (no edits — verified by the
  diff guard)
- Control corpus + census: evidence/2026-11-01/
  sim-refusewin-b-corpus-control,
  sim-refusewin-b-census-control.json
- Judged corpora (3 legs) + censuses: evidence/
  2026-11-01/sim-refusewin-b-corpus-60d,
  sim-refusewin-b-census-60d.json,
  sim-refusewin-b-episodes-60d.json
- No compare .md exists (no paired lever comparison —
  this is a DIAG census, never labeled a panel
  comparison).
