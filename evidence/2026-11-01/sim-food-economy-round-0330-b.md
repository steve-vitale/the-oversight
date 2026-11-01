# Loop B round 0330Z: coordinator evidence (food-economy — away-evening census + 60d refusal window)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T0330Z,
axis food-economy (second non-converged axis; scale-onramp claimed live
by Loop A run fleshout-loop-a-20261101T0125Z the whole run — NOT touched).
Worktrees sim-awayeve-b + sim-refusewin-b, registered before spawning.
Both arms DIAG ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy file or existing
script. New files only. Merged locally, pending ship (ship loop owns
bumps, pushes, live verification).

## Arms (both GO, judged exactly against their preregs)

Arm sim-awayeve-b — away-evening census (tracker next blank 1 from the
0249Z closeout; sim-findings "AWAY EVENINGS ARE THE BINDING SCARCITY"):
96 judged legs, 2,856 evenings, 30d, 4 policies on identical seeds
(P1 nighttravel-stack, P3 deed-seeking, BARE competent-only, creekseek).
Instrument gate 96/96; classification completeness 100% (574/574 away
evenings carry a return story, 0 UNCLASSIFIED). Base check: 17523
reproduces strandwide exactly on this base (P1 8 creek evenings,
creekseek 13/11/11). Proof scripts/test-awayeve-b.js: 39 assertions,
re-run green post-rebase AND post-merge. Diff guard: 0 src/js,
0 scripts/policies; all new files.
- Away shares: P3 deed-seeking 471/720 = 65.4% (23/24 seeds carry away
  evenings); P1 31/714 = 4.3% (6/24); BARE 37/708 = 5.2% (6/24);
  creekseek 35/714 = 4.9% (6/24).
- What ends days away: NOT the creek, NOT the evening step — whether
  the day's work takes you far enough that home won't open. Patrols do
  it on purpose (P3 ~5-day rhythm starting day 5, 116 episodes:
  56 WALK-HOME, 49 SUCCESSION, 11 HORIZON); competent days do it rarely
  and by accident (P1/BARE episodes end by succession or horizon,
  P1 walk-home only 2/7 episodes); the evening step only decides
  whether the night out is a night you tried to leave (P1 away nights
  return-attempted 30/31, all out-of-reach as subkind, vs BARE
  no-return-step 35/37; BARE walk-home 0/7 episodes).
- Creekseek on fresh bands almost never fires: 1 move in 714 evenings
  (17563 day 5, forest_floor (5,3) -> creek (4,3), a visit — the
  evening itself is at haven on both policies), preceding one extended
  episode (same vessel survives days 9-12 at the (2,0) creek on
  creekseek vs successor waking at haven day 9 on P1). Claim kept
  exactly at "one visit precedes one extended episode" — the mechanism
  that kept her alive is NOT isolated (extra travelTo also steps the
  world). Strandwide's conclusion stands, now measured on away
  evenings.
- Zeros that are findings: road evenings 0/2,856 on every policy;
  tent-camp evenings 0; woke-at-haven-same-vessel stories 0; detour
  outcomes 0; tripHomeDetours signals 0. The road class is empty in
  30d competent/deed windows — bounds any claim that road nights feed
  the away population here.
- Sense pass: 17545 P1 episode days 4-11 (creek (3,0), out-of-reach
  every night) reads as a person stuck working a creek line, with two
  honesty gaps stated, not hidden: fire-gossip lines firing while
  camped away (#1660 class, NOT re-filed); six days at 0 kcal with
  undiminished foraging/travel, then death overnight with no
  starvation narration (observation, not a verdict — kcal semantics
  not established by this census).

Arm sim-refusewin-b — longer window on the refusal band (tracker next
blank 2 from the 0249Z closeout; sim-findings "REFUSAL RUNS UNRESOLVED
AT THE HORIZON; H5/H6 UNRUN"): BARE 60d, named seeds 17734 + 17737 (H4
band) + 17724 (H3 unresolved creek case). Control driver: BARE 30d
reproduces gate2hunt exactly (13 refusals, same days, gate-2 11/11).
Instrument gate clean on all 5 legs (control 2 + judged 3).
100% episode classification: 6 episodes, 0 UNCLASSIFIED; episode
refusal counts agree exactly with the verbatim gate2hunt census
(40 refusals both ways). Proof scripts/test-refusewin-b.js: 10/10,
re-run green post-rebase AND post-merge. Diff guard: 0 src/js,
0 scripts/policies; all new files.
- 17724's 30d "7-night" stub is really a 12-night run (days 24-35,
  creek camp (5,6), blocked (4,5)) resolving day 36 by daytime walk
  via [[5,6],[5,5],[5,4],[4,4]].
- 17737's 30d "2-night" stub is really a 10-night run (days 29-38,
  fallen_tree camp (4,2), blocked (4,3)) resolving day 39 by daytime
  walk via [[4,2],[5,2],[5,3],[4,3],[4,4]] — plus a SECOND episode
  days 41-46 resolving day 47 the same way. Fallen_tree refusals
  resolve exactly the way creek refusals do.
- 17734's known resolution re-confirmed at 60d (days 10-16 resolved
  17; days 26-29 resolved 30; days 31-60 clean, no new episode).
- Chokepoint corrected: it was never one tile for all seeds. (4,3)
  binds for 17734/17737 (and 17606, H1's 17703); (4,5) binds for 17724
  (all 13 of its refusals, including the new day-60 night). The funnel
  is per-seed — the tile the single night hop must cross from that
  seed's camp.
- The 60d window itself cuts a story off again: 17724 day 60, 1 night,
  fallen_tree, new camp wetland (3,5), still refused at horizon.
  "Resolved at 60d" is a per-episode verdict, never a per-seed
  verdict. H5/H6 were NOT run — listed as UNRUN, not zero.
- Sense pass: both resolution days read end to end as a person
  finding a way (17724 day 36: grove work, walk home, "You walk back
  into Haven", then sowing and fishing orders; 17737 day 39: grove,
  snare, walk past a Static Kite at the treeline, haul laid out,
  a self-correcting lesson line — "Hold on — I already showed you
  this one."). Form-line texture noted (double block line on
  first-refusal evenings; verbatim fishing-order lines).

## Landing chain

Master e5303f8ab (journey-establishment r70, landed by a sibling loop
mid-run) -> sim-refusewin-b (4 commits, rebased clean, tip 8549d8826)
-> sim-awayeve-b (5 commits; first --ff-only merge failed because
refusewin had moved master — rebased onto 8549d8826, proofs re-run
green, then merged clean, tip b870bba18). Both proofs re-run green on
merged master (refusewin 10/10, awayeve 39 assertions). Worktrees
released as done-merged, branches deleted, main tree clean at closeout.
No src/js, no policy defaults, no version bump, no push — merged
locally, pending ship.

## Wall numbers

NOT re-measured by these pre-seat censuses (reported, never fabricated).
As LAST MEASURED (Loop A lane): full seat 0 / wave 5 reached 0.
Observed survival here: refusewin 3/3 legs survived 60d; awayeve legs
all complete or village-lost with day recorded (17549 village-lost on
P1/CS day 24, BARE day 18, survives on P3 — death cause NOT investigated
here, named seed for a future arm).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current '<arm census glob>'
--metrics national,table,wins,exiled` on both corpora: 3 LOUD lines
each (national/table/wins baseline -> 0). Investigated: the KNOWN
missing-field artifact (0249Z closeout) — neither census schema carries
national/table/wins/exiled fields at all (verified: field grep empty,
top-level keys are evening/outcome keys), so the checker reads absence
as 0. No wall regression. Baseline NOT rolled.

## Village assessment, in plain words

Run twenty-four villages four ways for a month, and the picture splits
cleanly. Left to their own competent days, scholars almost always come
home — only six villages ever sleep out, and when they do they sleep
out for days at a creek or a forest floor, trying the way home every
evening and being told it won't open, until they die out there and
someone else wakes in the hall. Take the evening step away and almost
nothing changes except nobody even tries. Send the same villagers out
hunting deeds and everything flips: nearly every village sleeps out
most nights, going out on patrol, staying out for days, foraging and
learning, then walking home in daylight or dying out there and doing
it again five days later. And the stranded stories the shorter window
cut off mid-sentence all finish the same way: the creek-camper walks
home on a morning in the second month, the forest-floor camper walks
home twice, and the wetland camper from the band never gets stuck
again. The night step knows only one jump straight home and the
daytime walk knows the way around — that hasn't changed. What the
longer window proves is that the daytime walk always eventually wins,
and that no seed is finished with refusing just because one run ended.

## Blanks filled or documented

- FILLED: the away evening itself, censused (awayeve) — deed patrols
  are the away-evening machine; competent days rarely end away; the
  evening step changes the night's story, not reliably its share.
- FILLED: the 30d-stranded question for 17724/17737 at 60d
  (refusewin) — both resolve by daytime walking, with routes.
- FILLED: 17734's resolution re-confirmed at 60d.
- DOCUMENTED: chokepoint is per-seed ((4,3) vs (4,5)), not universal.
- DOCUMENTED: new episodes past day 30 (17737's second episode,
  resolved; 17724's day-60 night, still refused at horizon).
- DOCUMENTED: road evenings 0/2,856 in 30d windows; tent camps 0.
- DOCUMENTED: 17549 death-cause candidate (dies P1/CS/BARE, survives
  P3); 0-kcal observation (17545 days 6-11); fire-gossip-while-away
  (#1660 class, observed again, not re-filed); succession mornings
  narrated as returns (standing caveat).

## Next blanks, in order

1. 90d follow-up on 17724's day-60 fallen_tree episode (refusewin
   note: 60d legs ~25s per seed — cheap; the question is whether the
   day-60 night becomes a run, and whether it resolves the same way).
2. Patrol-schedule lever comparison (awayeve note: P3's day-5 start +
   ~5-day rhythm sets the away calendar — the natural next measurement
   if away evenings are wanted as a lever rather than a census).
3. Evening-step leg decomposition (awayeve note: which leg — hop offer,
   hop, lodge entry, wood-wrapper daytime costs — moves a given seed's
   evenings; needs seed-day pairs like 17563 day 5, not pooled shares).
4. 17549 death-cause (named seed, no re-hunt needed).
5. H5/H6 refusal cells — still UNRUN (stop-rule remainder from
   gate2hunt, carried, not forgotten).

## Metric review

- Awayeve: no metric re-scored mid-run. Note for the next census: the
  pooled P1-vs-BARE share contrast flips by band (A1: P1 21 vs BARE 13;
  A2: P1 10 vs BARE 24) — pooled shares must never be read as "the
  evening step created N away evenings" on matched seeds, since the
  stacks diverge from day 1. The next prereg should pre-register
  seed-day-pair contrasts for stack effects and keep pooled shares
  descriptive only.
- Refusewin: no metric re-scored mid-run; no band bar was defined, so
  no band claim arises. Note for the next window arm: a 90d horizon
  re-opens the "window cuts a story off" caveat at its own horizon —
  pre-register the horizon-end rule (still-refused-at-horizon is an
  episode end, not a seed verdict) before judging.
- Coordinator: refusewin carries no panel compare .md by design (a
  DIAG census with no paired lever — stated in its evidence, not
  hidden). The control-driver exact reproduction is its comparison.
  The balanced-panel rule binds before/after lever comparisons; a
  future lever arm on these populations must attach a compare .md.

## Infrastructure

- Worktree registration was slow (~4 min for the first tree: git
  reset --hard checkout, not a hang — verified via ps before waiting
  it out). No force, no ref surgery.
- Exec service restarted once mid-run during a coordinator wait
  (WAIT4 command); no work lost — state re-verified (heartbeats,
  branch tips, uncommitted files) before continuing. Awayeve's confirm
  files were uncommitted at that point and committed by the worker
  afterward; nothing was re-run or double-committed.
- No EPERM flap blocked any judged transport or landing step this run.
- Safe-commit index clobber: NOT observed on either arm's commits or
  the coordinator evidence commit path (verified via git status clean
  after each merge; main tree clean at closeout).
- Loop A live on scale-onramp the whole run (0125Z contactfinish +
  contactrec2) — NOT touched; its tree heartbeats read 57 min stale at
  landing time (03:23Z vs 04:20Z), which is A's own coordinator's
  business, not a finding of this run. Journey loops landed twice
  mid-run (journey-social r78, journey-establishment r70) — both
  absorbed via rebase, proofs re-run, no conflicts (disjoint files).

Claim deleted; lock deleted. Merged locally, pending ship.
