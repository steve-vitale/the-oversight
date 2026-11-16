# sim-haventick-b — DIAG: havenTick plan-creation counted per instance and per launch

**Arm:** sim-haventick-b (Loop A, run `fleshout-20261116T1315Z` — ADOPTED by
run `fleshout-20261116T1515Z` after the 1315Z run died on timeout + host
write flap with the sims done and the analysis unwritten; axis winnability
chain, tracker blank #4 DIAG).
**Prereg:** `evidence/2026-11-16/sim-haventick-b-prereg.md` (frozen; no
correction — the frozen design held as written, including the analyzer
fix below, which implements the prereg's bar 2 as written rather than
re-scoring anything).
**Prior art:** `evidence/2026-11-16/sim-seedpaths-b.md` + prereg — the
instrument this arm EXTENDS (its §Next diagnostic #1 names this arm);
`evidence/2026-11-16/sim-poolmarginals-b.md` + prereg;
`evidence/2026-11-16/sim-companionpool-b.md`;
`evidence/2026-11-16/sim-launchdef-a.md`.
**Type:** DIAG — instrument + measured path distribution. No game change,
no default flipped. The seed call is reverted; the branch's `src/` is
byte-identical to the base.
**Seeds:** 102141–102148 (8-seed pilot, 150d death-aware, policy competent
verbatim, sha `74a890f0844e`). Fresh band (coordinator-verified; no prereg
names any seed in it). The comparison to seedpaths' band (102131–102138)
is a cross-band comparison, not a same-corpus claim.
**Branch:** `sim-haventick-b`. **Worktree:**
`~/workspace/worktrees/sim-haventick-b`.
**Base:** master `5eedd695b` at arm start (the worktree HEAD; master has
since moved to `ef8bd7177` — NOT rebased, coordinator owns the rebase at
landing).

## GO verdict: GO — instrument valid, all six prereg bars pass

| # | Prereg bar | Result |
|---|---|---|
| 1 | Zero unclassified instances on EACH leg; no bare `unknown`; zero `unknown-*` havenTick sources; zero `unknown-*` seed paths | **PASS** — coverage 1.0 on both legs (50/50 instrument, 19/19 control); 0 unattributed; 0 unknown havenTick sources; 0 unknown seed rows |
| 2 | Creation-ledger check: every planCensus holder traces to a `v4creates` row on/before its first observed day | **PASS** — 85/85 holders traced (65 instrument, 20 control); 0 holders without a creation; `creationRowMissing` 0 on both legs |
| 3 | Corpus 16/16 files parse | **PASS** — 8 control + 8 instrument, identical seeds |
| 4 | Proof green: `scripts/test-haventick-b.js` — 73/73 on the instrument tip (seed call on) + 73/73 in the off shape after the revert; D1/D2 green | **PASS** — 73/73 on the tip, **75/75** in the off shape after the revert (two new ledger fixtures H9/H10 added with the analyzer fix; see below) |
| 5 | Wall numbers reported for both legs | **PASS** — below |
| 6 | Frames reconciled: seedpaths-frame vs creation-frame instance counts, handoff count listed | **PASS** — difference 0 on both legs; handoffs 8 instrument / 3 control |

**The VERDICT is the distribution table itself plus the launch/kill
answer** (below). A DIAG GO means the instrument is valid and the table
is trustworthy — not that any path "wins".

## The answer, in plain words

**Yes — havenTick plans exist, they launch, and they kill.** On master
as-is (the control leg, seed call absent), havenTick creates 16 of the
19 plan episodes (84%), launches 12 of the 13 launched episodes (92%),
and those launched parties kill wave-4 beasts: Clarence Lombardi's party
kills an Algorithm on day 132, Ruby Callaghan's party kills a Strike on
day 79, Theo Lindqvist's party kills a Congregation on day 146. HavenTick
alone — no seed call anywhere in the trajectory — launches parties that
kill wave-4 monsters. With the seed call on, havenTick still owns the
launches: 19 of 25 launched episodes (76%), 44 of 56 launch events.

The surprise is the other half of the control leg: **on 4 of 8 seeds the
plan system never starts at all.** Seeds 102141, 102144, 102145 and
102148 record zero plan creations of any kind in 150 days — no
havenTick, no seed, no winPlanOf — while the villages survive, reach
wave 5, and slay beasts (seed 102141: survived 150d, standing 375,
70 wave kills in the ledger). The game's own counters agree
(`winPlanStats` all zero on those seeds), the recorder was on, the
wraps were live, and D3 is clean — this is master-as-is behavior, not
an instrument miss. HavenTick is a real plan-creation path, but it is
not a reliable one: it fired on only half the control seeds. The seed
call is what wakes the system on the other half. See §Village
assessment.

## Analyzer fix (instrument correction, committed separately)

The committed analyzer (`d2de0f175`, after the revert) fixes one
implementation bug found while judging this run — **it does not change
any measured number** (the distribution table, launch/kill lists, wall
numbers and frame reconciliation are byte-identical before and after;
only the gate changes).

As committed, the analyzer's ledger check demanded that every
planCensus row fall inside some episode's `[openDay, closeDay]` window
with matching target, and gated on that count being zero. It failed:
4,078 rows across both legs. The prereg's bar 2 as written does NOT
demand that — it demands that every planCensus *holder* trace to a
`v4creates` row on/before its first observed day ("no plan holder is
ever observed without a recorded creation"). Every one of the 4,078
rows is explained by four artifacts the frozen episode definitions
themselves produce, with **0 unexplained**:

| Cause | Instrument | Control | What it is |
|---|---|---|---|
| `w3PlanNoEpisode` | 1,361 | 83 | Wave-3 seed creations open NO episode by frozen rule, yet their plans live in the census for days (e.g. gen_t708phd, seed 102141 day 36, target buffering, needWave 3) |
| `postDeathTail` | 1,362 | 713 | Census rows after a holder-died close, holderAlive false — dead holders' plans linger in `winPlan` for the rest of the run (tails up to 101–102 days; the only `delete v.winPlan[vid]` in the code is the table-active case, win-plan.js:321 — there is NO death cleanup) |
| `sameDayRetargetTarget` | 4 | 1 | The census row on a retarget close day already shows the new target |
| `w3RetargetContinuation` | 306 | 248 | After a wave-3 retarget closes the episode, the plan continues in the census with the new wave-3 target and no new episode opens |
| `unexplained` | **0** | **0** | |

The fix implements the prereg's written bar as the gate
(`holdersWithoutCreation`, 0 on both legs) and keeps the
row-in-episode-window count as a diagnostic with the cause breakdown
above, pinned by two new proof fixtures (H9 wave-3 plan, H10
post-death tail). Proof went 73/73 → 75/75. The analyzer exited 1
before the fix and 0 after, on the same corpora, with identical
judged numbers. Full before/after is in the commit message of
`d2de0f175`.

## Before / after on identical seeds

| | Control leg (seed call absent = master as-is) | Instrument leg (seed call on) |
|---|---|---|
| Seeds / files | 8 / 8 | 8 / 8 |
| Instrument errors | 0 | 0 |
| Seed rows (all waves ≥ 3) | 33 (agency-evade 22, agency-flee 11, gate-avoid 0, world-tick 0) | 189 (world-tick 73, agency-evade 83, agency-flee 33, gate-avoid 0) |
| Wave-4+ seed calls | 6 | 69 |
| Plan instances opened (episodes) | **19** | **50** |
| Plan creations (`v4creates`) | 20 (havenTick 16, winPlanOf 3, seed 1) | 65 (havenTick 23, winPlanOf 10, seed 32) |
| Scored dawns (pool rows) | 0 | 100 |
| Launched episodes | 13 | 25 |
| Launch events (a plan launches again and again) | 29 (havenTick 27, winPlanOf 2) | 56 (havenTick 44, winPlanOf 6, world-tick 6) |
| Launch kills (wave ≥ 3 / wave ≥ 4) | 25 / 3 | 48 / 7 |
| National by standing ≥200 / by scaleRank | 4 / 0 | 6 / 0 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave-4 reached / wave-5 reached | 8 / 4 | 8 / 6 |
| Median survival (gameDays) | 150.5d | 150.5d |
| Wave-4 kills / wave-5 kills (all sources) | 32 / 0 | 39 / 5 |
| Deaths (all causes) | 612 | 720 |

Per-seed (instrument leg): 102141 survived 151d standing 199, 6
episodes, 4 launched; 102142 survived 151d standing 545, 4 episodes,
3 launched; 102143 lost 102d standing 175, 6 episodes, 5 launched;
102144 lost 119d standing 345, 5 episodes, 3 launched; 102145 lost
150d standing 515, 5 episodes, 1 launched; 102146 survived 151d
standing 515, 8 episodes, 3 launched; 102147 survived 150d standing
535, 7 episodes, 5 launched; 102148 survived 151d standing 410, 9
episodes, 1 launched.
Per-seed (control leg): 102141 survived 150d standing 375, 0
episodes; 102142 survived 151d standing 545, 4 episodes, 3 launched;
102143 lost 144d standing 199, 6 episodes, 4 launched; 102144 lost
89d standing 150, 0 episodes; 102145 survived 151d standing 199, 0
episodes; 102146 lost 133d standing 490, 4 episodes, 3 launched;
102147 survived 151d standing 440, 5 episodes, 3 launched; 102148
survived 152d standing 199, 0 episodes.
(The wall difference between legs on 8 seeds is noise plus the seed
call's own effect — more plans, more parties out, more fighting, more
dying (720 vs 612 deaths); the seed call is a DIAG instrument,
reverted — do not read it as a lever effect.)

### The control leg's four empty seeds are real

Seeds 102141/102144/102145/102148 (control) carry empty recorder
arrays across the board — but so do the game's own counters, the
recorder was on (`recorderOn: true`, all wraps live), the villages
survived 89–152 days, and D3 is clean (first divergence at/after the
first world-tick seed day on every seed). Seed 102141's village slew
70 beasts in the ledger, reached wave 5, stood ready-4 — and nobody
ever started a plan. The empty seeds are a finding about master, not
a hole in the corpus: without the seed call, the plan system sleeps
on half the band.

## The distribution table (the result this arm exists for)

### Five-path headline table — episodes by first-creator

| First creator | Instrument episodes (n=50) | Instrument launched episodes (n=25) | Instrument launch events | Control episodes (n=19) | Control launched episodes (n=13) | Control launch events |
|---|---|---|---|---|---|---|
| havenTick | **23 (46.0%)** | **19 (76.0%)** | **44** | **16 (84.2%)** | **12 (92.3%)** | **27** |
| world-tick | 17 (34.0%) | 3 (12.0%) | 6 | 0 | 0 | 0 |
| agency-evade | 0 | 0 | 0 | 0 | 0 | 0 |
| agency-flee | 0 | 0 | 0 | 0 | 0 | 0 |
| gate-avoid | 0 | 0 | 0 | 0 | 0 | 0 |
| winPlanOf (sixth row) | 10 (20.0%) | 3 (12.0%) | 6 | 3 (15.8%) | 1 (7.7%) | 2 |
| unknown | 0 | 0 | 0 | 0 | 0 | 0 |

HavenTick share: 46% of episodes / 76% of launched episodes on the
instrument leg; 84% / 92% on the control leg. The seed call dilutes
havenTick's share (it adds 17 world-tick episodes) but havenTick
still owns the launches on either leg.

### Seed rows by path

| Path | Instrument rows, wave ≥ 3 | Instrument rows, wave ≥ 4 | Control rows, wave ≥ 3 | Control rows, wave ≥ 4 |
|---|---|---|---|---|
| world-tick | 73 (38.6%) | 37 (53.6%) | 0 | 0 |
| agency-evade | 83 (43.9%) | 22 (31.9%) | 22 (66.7%) | 4 (66.7%) |
| agency-flee | 33 (17.5%) | 10 (14.5%) | 11 (33.3%) | 2 (33.3%) |
| gate-avoid | 0 | 0 | 0 | 0 |
| unknown | **0** | **0** | **0** | **0** |

Gate-avoid fired **zero** rows on this band (seedpaths' band had 3
across both legs) — the gate path is silent here, not dead; it is
just rare. Agency paths seed plenty (116 rows instrument, 33
control) and open nothing on either leg: every agency seed lands on
a holder who already holds a plan or whose plan has advanced — the
same pattern seedpaths found for agency-evade.

### Seedpaths frame (for comparison with seedpaths' 28 instances / 7 launches)

Instrument leg: 17 instances, all world-tick first-seeder, 3
launches (all world-tick). Control leg: 0 instances, 0 launches —
the seedpaths frame sees nothing on master as-is for this band,
because the only seed rows are agency ones that never open. The
creation frame's seed episodes reconcile exactly with the seedpaths
frame (difference 0 both legs); the 8 instrument / 3 control
handoffs are havenTick/winPlanOf episodes closed by a seed retarget,
whose story continues under a seed episode. Of the 17 world-tick
episodes, 14 opened on a wave-4+ seed creation and 3 opened on a
retarget row.

### Bucket split by creator

Instrument: havenTick 19 launched / 1 selected-blocked / 1
candidate-not-bid / 2 churned; world-tick 3 launched / 11
candidate-not-bid / 3 churned; winPlanOf 3 launched / 2
selected-blocked / 1 candidate-not-bid / 4 churned. Control:
havenTick 12 launched / 2 selected-blocked / 1 candidate-not-bid /
1 churned; winPlanOf 1 launched / 1 selected-blocked / 1 churned.
Target-killed is structurally N/A for the target-null havenTick and
winPlanOf episodes (recorded null, never counted) — and 0 for the
world-tick episodes too: no launched party in this band killed the
beast its plan was aimed at. HavenTick plans launch at a far higher
rate than world-tick ones (19/23 vs 3/17): a havenTick holder is at
Haven, geared, with companions in reach, when the plan starts; a
world-tick holder is a wild fleer whose plan mostly waits for a
companion that never comes (11/17 candidate-not-bid).

### Wave-3 side table (creations that open no episode)

Instrument: 18 wave-3 creations (world-tick 16, agency-evade 2).
Control: 1 (agency-evade). Their plans are visible in the census
and in the `w3PlanNoEpisode` diagnostic rows — the plans exist, they
just never enter the episode frame, exactly as frozen.

### HavenTick source split

Instrument: `heard` 22, `both` 1, `lived` **0**. Control: `heard`
13, `both` 3, `lived` **0**. No havenTick creation on this band
came from personal fought experience alone — every one came from
hearing the village slew a beast (or both). The likely mechanism
(not proven): a villager who personally fights a beast usually gets
a plan from the fight itself (the seed call fires at the fight)
before havenTick ever sees them plan-less at Haven — so the `lived`
branch is shadowed by the seed paths. One line for the findings
backlog, not a bar failure: the source is always named, never
unknown.

## Launch-that-kills: havenTick alone launches parties that kill

Instrument leg: 48 wave-3+ kills and 7 wave-4+ kills by launched
episodes' holders/companions on/after the launch day. Control leg
(master as-is): 25 wave-3+ kills and 3 wave-4+ kills. The wave-4
kills by havenTick-created launches:

| Seed / leg | Holder | Launch day | Wave-4 kill |
|---|---|---|---|
| 102142 / control | gen_n99b2vv (Clarence Lombardi) | 63, with gen_17ijlv2 | Algorithm, day 132, by the holder, via player |
| 102142 / control | theo_lindqvist | 82, with gen_17ijlv2 | Congregation, day 146, by the holder, via player |
| 102146 / control | ruby_callaghan | 70, with carlos_diaz | Strike, day 79, by the holder, via player |
| 102142 / instrument | gen_n99b2vv | 63 | Algorithm, day 132 (same trajectory — seed 102142 is IDENTICAL across legs per D3) |
| 102142 / instrument | theo_lindqvist | 82 | Congregation, day 146 (same) |
| 102146 / instrument | ruby_callaghan | 70 | Strike, day 79 (same) |
| 102147 / instrument | hannah_kim | 43, with gen_u3ucb9u | Congregation, day 82, by the holder, via companion |
| 102147 / instrument | gen_u3ucb9u | 43, with gen_ccsnxl6 | Eater, day 113, by the holder, via player |
| 102141 / instrument | gen_mhp5siu (winPlanOf) | 77, with ethan_hunt | Eater, day 116, by the holder, via player |
| 102147 / instrument | greta_hansen (world-tick, target suburb) | 124, with mateo_alvarez | Eater, day 137, by the holder, via wild |

Seed 102142 is identical across legs on every reported field, so
its three havenTick wave-4 kills are master-as-is facts, not
seed-call artifacts. **The answer to the prereg's second headline
question is yes, twice over: havenTick alone launches parties that
kill — including wave-4 beasts — on master as-is.**

## Reachability verdict for the wave-4 chain

**Reachable — and havenTick is the chain's most reliable starter on
master as-is.** 50 episodes / 25 launched episodes / 56 launch
events (instrument); 19 / 13 / 29 (control). Wave-4 beasts are
killed by launched parties (7 wave-4 launch kills instrument, 3
control). Wave-5 targets: the chain reaches wave 5 (6/8 instrument,
4/8 control villages unlock it) but no launched party kills a
wave-5 beast yet, and no launched party kills its own plan target
(target-killed 0 across the band). Regional is reached 8/8 on both
legs (every seed ends scaleRank regional); national by scaleRank 0/8
on both legs, table 0, wins 0. The scale wall does not move on 8
seeds: standing reaches 545 yet the rank stays regional — standing
alone does not confer national.

## Village assessment, in plain words

Two kinds of village live on this band. On four seeds the village
wakes up: somebody hears the fire talk about a slain beast, starts
thinking in gameplan terms at Haven, gathers a companion, and walks
out — again and again, the same plan launching seven times in a
season (Clarence Lombardi, seed 102142: seven launches, seven kills,
a wave-4 Algorithm dead by his own hand on day 132). On the other
four seeds the village never wakes up: it fights at the door, it
teaches, it celebrates its veterans on camera ("Francisco just put
down Chorus Line... on CAMERA. That's a veteran kill, folks"), it
survives to wave 5 — and nobody ever starts a plan. The difference
is not courage or gear (seed 102141's village stood ready-4 with
veterans to spare); it is whether the plan system ever gets its
first spark. HavenTick is the spark on master as-is, and it is a
coin flip. The seed call is the second spark, and it fires on wild
flees the village otherwise forgets. Neither spark is the
bottleneck after ignition — once a havenTick plan exists it launches
and it kills — the bottleneck is ignition itself, and on half the
band there is none.

## Sense-testing (read the lines, not just the counts)

**Clarence Lombardi (seed 102142, control leg — master as-is).**
Day 60 a havenTick plan starts (source `heard`, stage party — the
village has slain beasts and Clarence heard about it at Haven). Day
63 he launches with Morgan Holmes. He launches six more times
(days 73, 97, 106, 110, 119, 127), mostly with Theo Lindqvist, and
dies day 137. Along the way his parties kill a Focus Group, two
Spools, a Terms of Service, a Buffering, a Redactor — and on day
132 Clarence himself kills an Algorithm, wave 4, via the player.
The recorded creator matches the story: no seed row ever fired for
him; the plan came from hearing about the village's kills, and the
launches are his own repeated walks, not one lucky dawn.

**Ruby Callaghan (seed 102146, control leg).** Day 52 havenTick
(heard). Day 53 she evades an Audit on expedition — the log reads
"Ruby saw The Audit in time and gave it room." Day 70 she launches
with Carlos Diaz. Day 79 she kills a Strike, wave 4, via the
player. She dies day 83. The evade is recorded as a firing of her
still-live havenTick episode (stage hunt, no retarget) — the
instrument's story and the narration agree: the evade did not plant
the plan, the hearing did.

**Ethan Hunt (seed 102141, instrument leg).** Day 37 havenTick,
launches the same day with Diana Osei — the earliest havenTick
launch in the band, one day after the first world-tick seed. Seven
selections over the run (Diana, then a sick-block, then Mariam
Ortiz three times), stage cycling party→hunt→party→hunt, plan
deleted day 151. His parties kill a Chorus Line, a Spool and a
Callback. The plan never had a target and never needed one: it is a
standing invitation to walk out with whoever is at Haven.

**The sleeping village (seed 102141, control leg).** The same seed
without the seed call: the village meets beasts at the door ("Andre,
Brayden, Mariam and Francisco met them at the door — 4 put down"),
teaches ("Sigrun has been asking Andre about Cold-Blooded... Planning
something"), celebrates veteran kills on camera — and records zero
plans, zero parties, zero departures in 150 days. The villagers act
like people the whole time; they just never act like planners. The
contrast with the instrument leg of the same seed (6 episodes, 4
launched) is the seed call's whole story in one seed.

**One check, clean:** every recorded `havenTick` row's caller frame
is the agency tick (`villager-agency.js:433`), every `world-tick`
row's is `resolveWildMonsterEncounter`, every `agency-*` row's is
`expeditionMonster`. No row's creator contradicts its caller — and
the `lived`-zero split above is a real property of the band, not a
classifier artifact (the classifier distinguishes lived/heard/both
from the fought/slain counts, and `both` fires when both are
present).

## Blanks filled or documented

- **Seedpaths' named next diagnostic #1, closed.** HavenTick
  plan-creation counted per instance and per launch, the same way:
  23 episodes / 19 launched episodes / 44 launch events
  (instrument); 16 / 12 / 27 (control). HavenTick is the largest
  plan-creation path on master as-is and the largest launch source
  on either leg.
- **winPlanOf, the sixth creator, counted.** 10 episodes / 3
  launched episodes (instrument); 3 / 1 (control). A companion
  handed a plan at launch does walk: gen_mhp5siu's winPlanOf
  episode launches day 77 and kills a wave-4 Eater day 116. It is
  a real sixth path, not a rounding error — and it is the only
  creator whose episodes are mostly churn (4/10 churned before
  dawn, instrument).
- **Dead holders' plans never die (documented, not fixed).** The
  only `delete v.winPlan[vid]` in the code is the table-active
  case; a dead holder's plan stays in `winPlan` and in the census
  for the rest of the run (tails to 101–102 days, 2,075 rows).
  Appended to the findings backlog.
- **HavenTick `lived` is zero on this band (documented).** All 39
  havenTick creations are `heard` (35) or `both` (4); none is
  `lived` alone. Likely mechanism: the fight seeds first, so the
  `lived` branch is shadowed. Appended to the findings backlog.
- **Four control seeds never start a plan (documented).** See
  §Village assessment. Appended to the findings backlog.
- **CANON GAP (recorded, not invented):** no CANON-registered doc
  covers companion-pool seed paths, departure gates, the pick
  lottery, or havenTick plan creation (checked against the
  `docs/CANON.md` manifest). `docs/MONSTER-WAVES.md` lists 9
  wave-4 ids; the data has 10 (herald is the 10th) and the data
  rules — the analyzer's frozen list matches the data exactly
  (wave4Ids MATCH).
- **Index clobber (safe-commit):** struck once this run (the
  analyzer-fix commit: `MM` on both files). Repaired via
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, verified with `git status` clean + `git diff
  HEAD` empty + hash-object match. Commit verified correct.

## Metric review

- The frozen definitions held — no mid-run re-scoring. The only
  change was the analyzer's ledger gate, which implements the
  prereg's bar 2 as written (holder traces to a creation) instead
  of the stricter row-in-episode-window check the analyzer had
  implemented; the judged numbers are identical before and after.
- **First-creator-wins hid nothing.** 18 multi-path episodes
  (instrument) and 4 (control); all 90 later firings landed with
  stageAfter `hunt` — the plan already past gear/party — so no
  later path could have been the effective seeder. The firings
  lists preserve the full record for any re-count.
- **No wrap missed a creation.** 0 unknown rows on either leg;
  every instance attributed; every seed row's path matches its
  caller frame; 85/85 census holders trace to a creation row.
  The havenTick path is a plan-creation path, not a missed seed
  hook — it never calls `winPlanSeedFromFight`.
- **150d was the right horizon.** Episodes open as late as day 137
  (102142 world-tick first day) and launches run to day 146
  (102142 Theo's Congregation kill); a 100d horizon would have
  missed the late launches and the wave-4 launch kills.
- **Control-leg reproduction: cross-band, not same-corpus.** This
  band's control leg (19 episodes, all havenTick/winPlanOf) is not
  comparable instance-for-instance to seedpaths' band (3 instances,
  all seed-created) — different seeds, different base. What
  reproduces is the shape: without the seed call, plans are rare
  and havenTick/gate/agency are the only starters; with it, the
  world-tick stream adds a second, larger stream. The D3 check is
  clean on all 8 seeds (below), so the legs differ only by the
  seed call itself.
- **winPlanOf creations mattered.** 10 episodes / 3 launched
  episodes instrument (6 launch events, one wave-4 Eater kill);
  3 / 1 control. The sixth creator is material, not a zero row.
- **Launch events vs launched episodes.** The prereg's launch
  count is episodes that launched at least once (25/13). The
  underlying launch EVENTS are 56/29 — havenTick plans relaunch
  repeatedly (up to 7 times for one plan). Any future lever that
  prices "a launch" should say which count it means.

## Balanced-panel review note (why no panel)

No balanced panel was run for this DIAG, same as dawnbid,
companionpool, poolmarginals, and seedpaths. The panel
(`scripts/balance-panel.js`) runs fresh multi-policy sims and
compares two panel `.json.gz` files — it cannot compare recorder
corpora, and this arm ships no game change: the seed call is
reverted, the instrument is observation-only, and the prereg bars
are the judge. A panel here would measure the seed call's noise
across fresh trajectories, not the judged corpora. The neutrality
proof (D1/D2/D3) is the panel's substitute here, and it is clean.
The prereg's panel instruction was evaluated against this and
declined for the stated reason, not silently skipped.

## Neutrality evidence

- **D1** (proof test): instrument tip, seed 102141, 60d, recorder ON
  twice — identical full corpus (including `v4creates` rows).
- **D2** (proof test): same, recorder ON vs OFF — identical
  trajectories; recorder-off run carries empty
  companionPool/dawnbid/v4/ledger arrays.
- **D3** (drift smoke, `scripts/vetparty-drift-check.js` over both
  corpora): CLEAN on all 8 seeds, NO PRE-LEVER DRIFT. First
  divergence days 38/—(identical)/34/28/54/93/40/31 vs first
  world-tick seed days 36/63/33/27/50/51/39/29. Seed 102142 is
  IDENTICAL across legs on every reported field.
- **Proof:** 73/73 on the instrument tip (seed call on), 75/75 in
  the off shape after the revert (73 + H9/H10). The off-shape
  150d live run records 0 seed rows on seed 102141 — the same
  empty-seed phenomenon as the control corpus, consistent, not a
  failure.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-16/perseed-haventick-b-on/*.json' --metrics
national,table,wins,exiled` — **REFUSED**, as the recent DIAGs hit:
"telemetry-check: refusing recorder-corpus input: all 8 --current
rows carry top-level anchorCommit, so they are sweep recorder rows,
not runs. Recorder corpora are compared with sweep-compare tables,
never against a run baseline here." Recorded, not worked around;
the baseline was not rolled on it.

## Wall numbers (both legs)

| | Control | Instrument |
|---|---|---|
| National by standing ≥200 | 4/8 | 6/8 |
| National by scaleRank | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave-4 reached / wave-5 reached | 8 / 4 | 8 / 6 |
| Median survival | 150.5d | 150.5d |
| Wave-4 kills / wave-5 kills | 32 / 0 | 39 / 5 |
| Deaths (all causes) | 612 | 720 |

## Commits on this branch

- `63e439dc7` frozen prereg
- `e0c9683a8` instrument — creation-ledger driver + analyzer + proof
  test (73/73 control shape; control anchor, seed call ABSENT)
- `16441f555` seed call re-landed verbatim (instrument anchor)
- `fe4bc0e19` revert seed call after measurement (branch `src/`
  byte-identical to base `5eedd695b`)
- `d2de0f175` analyzer ledger check implements prereg bar 2 as
  written + H9/H10 fixtures, proof 75/75
- This evidence + analysis + corpora commit follows.

Ready to merge, pending ship. Do NOT push, do NOT bump — the ship
loop owns deploys.

## Files

- Prereg: `evidence/2026-11-16/sim-haventick-b-prereg.md`
- Instrument: `scripts/haventick-driver-20261116.js`,
  `scripts/analyze-haventick-b.js`, `scripts/test-haventick-b.js`
- Corpora: `evidence/2026-11-16/perseed-haventick-b-control/` (8 files),
  `evidence/2026-11-16/perseed-haventick-b-on/` (8 files)
- Analysis: `evidence/2026-11-16/haventick-b-analysis.json`
- This evidence file: `evidence/2026-11-16/sim-haventick-b.md`

## Next diagnostic (named, not done)

1. **Why half the control villages never ignite.** HavenTick is a
   coin flip on master as-is. The gate needs its three conditions
   (wanderer/explorer profile, at Haven, engaged) read against the
   empty seeds: is it the profile, the Haven presence, or the
   engagement that never lines up — or does the village just never
   have a ranger at Haven at tick time? A diagnostic that logs the
   gate's three conditions per tick on an empty seed would say
   which.
2. **Why `lived` never creates.** If the fight seeds first, the
   havenTick `lived` branch may be unreachable by construction —
   worth one probe, not a lever.
3. **Dead holders' plans linger.** No death cleanup exists for
   `winPlan`; whether the linger costs anything (pool pollution,
   census noise, a dead holder holding a companion slot) is a
   question for whoever owns win-plan.
