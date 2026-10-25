# sim-oldcore-a — the old-core turnover audit (axis scale-onramp)

Run: fleshout-20261025T1815Z, arm sim-oldcore-a. DIAG ONLY — zero src/js
changes, zero game-code changes, zero default flips. Recorders only:
scripts/policies/spawnsrc-diag.js (reused VERBATIM) +
scripts/policies/oldcore-diag.js (new, this run) +
scripts/test-oldcore-diag-sweep.js (new, this run) +
scripts/test-oldcore-diag.js analyzer (new, this run).
This arm designs and lands NO fix. A complete classification IS the
deliverable. The mechanism design is the next run's pre-registration,
not a rescue.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law,
  and its line "Earlier waves never leave — the ecosystem only gets
  richer": this run measures whether that holds for INDIVIDUAL old
  stock, not just the roster — the roster can get richer while every
  old individual also never leaves, which is exactly what the prior
  runs suggest). No haven/raid canon doc exists (carried) — spawn and
  removal design lives in src/js/game.js and src/js/havenGrowth.js.
- Context read first, all three: evidence/2026-10-25/sim-spawnsrc-a.md
  (raid-time pool median 17 vs maintain cap 8, wave-3+ share 7.16%
  (107/1,494); maintain is 26.3% of the pool by LONGEVITY, ~6.9x
  re-appearance, all births days 3–16; hushwolf all day-16 births),
  evidence/2026-10-25/sim-tileentry-a.md (tile-entry targeting at its
  100% ceiling KILLED: pool 9.71% vs 23% bar, because armed
  trajectories truncate and new wave-3+ stock turns over faster
  (1.47 vs 2.33 appearances/birth) while the immortal old core
  persists — maintain + hushwolf = 38% of the armed pool, all
  wave-1/2), evidence/2026-10-25/sim-w5births-a.md (wave-5 births 0;
  spawn targeting exonerated; vetkill discipline: never call gated
  standing functions mid-run — this recorder calls none of them).
- Question (tileentry blank #1, promoted): the pool share is set by
  survival, not births. Do individual old-core entities EVER leave?
  Which removal path, if any, moves old stock — or is the old core
  mechanically immortal on this band?
- Substrate (shared, landed pattern): tableseat-nowait
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1) + spawnsrc recorder reused
  VERBATIM (SPAWNSRC=1, scripts/policies/spawnsrc-diag.js) + your
  new oldcore recorder (OLDCORE=1). Seeds 73671–73678, 180d
  death-aware horizon (runDays stops on death/win; 180 is the cap).
  Pilot = this 8-seed band; NO confirm spend pre-registered.
- CONTROL GATE (run first, before judging): reproduce the published
  control band exactly — deaths 234, national-ever 7/8, wins 4/8,
  wave-4 6/8, wave-5 0/8, raids 85, raiders 361, pool 1,494, pool
  wave-3+ 107. If the control does not replicate, STOP and report —
  do not judge against a moved baseline. The control verification
  section below is written BEFORE the analyzer verdict.
- PRIMARY (DIAG-GO requires ALL):
  (a) >=95% of raid-time pool entities' fates classified
  (unknown <=5%);
  (b) old-core table, per seed + pooled, for maintain + hushwolf
  wave-1/2 entities: birth count, median lifespan, still-present-
  at-end share, exit-cause shares, appearances/birth;
  (c) core share over time (days 30/60/120/180) + wave-3+ turnover
  comparison (appearances/birth old vs new);
  (d) a named mechanism answer: which removal path, if any, moves
  old stock — or "none measured" with the numbers that prove it;
  (e) SENSE-TESTING LAW: read at least one raid transcript, judge
  meaning/coherence, quote one line.
  If any of (a)–(e) is missing, verdict is DIAG-NO-GO, not a pass.
- Exit causes: CLOSED exit set, defined from code reads FIRST (below).
  A fled re-entry is NOT an exit. A combat lift is NOT an exit until
  tbEnd settles it. A removal followed by a same-object re-push is
  NOT an exit (entity continues).
- Recorder neutrality: draw no RNG, throw nothing into the engine,
  return every original value untouched, tag monsters with properties
  game code never reads. Never call gated standing functions mid-run
  (the w5births vetkill discipline applies wherever relevant).
- Do NOT design or land a game fix.

## CLOSED EXIT SET (read from src/js/game.js + src/js/havenGrowth.js before the sweep)

Removal is centralized: every path funnels through
removeWorldMonster(m) (game.js), so the recorder wraps that one
function and classifies from flag wraps + the Error-stack hint. The
cause lives in the caller, never in the removal itself:

- still-present-at-end — in the final world list at run end.
- raid-defense-kill — removeWorldMonster inside
  resolveWildMonsterEncounter with opts.raid (havenGrowth
  havenRaidTick defender loop); outcome vKill.
- villager-fight-kill — removeWorldMonster inside
  resolveWildMonsterEncounter (wild) or resolvePatrol (patrol);
  outcome vKill.
- raid-lingerer-sortie-kill — removeWorldMonster inside havenGrowth
  lingererSortie (treeline sortie on a lingering raider).
- aid-crisis-kill — removeWorldMonster inside aidFight (called from
  resolveWildMonsterEncounter for a lingering raider mid-crisis).
- player-fight-kill — startCombat lifts the world monster out of the
  world (removeWorldMonster at fight start is a LIFT, not an exit);
  tbEnd('won') settles it dead. The lift + won pair is the kill.
- player-fight-melt — tbEnd('fled'/'lost'/'routed') on a lifted
  non-titan, non-lingerer origin: nothing puts it back (only
  titan/campaign pieces and lingerers are restored at tbEnd), so
  the entity is mechanically gone without dying — "melts back
  into the wilds" in fiction, absent from the world list in fact.
- re-entry (not an exit) — tbEnd restores a titan/lingerer origin
  (same object pushed back), or any same-object re-push after a
  removal: the removal event is cancelled and the entity continues.
- corpse-clear — removeWorldMonster on outcome alreadyDead (a 0-hp
  corpse the world kept; no kill, no deed).
- fled-record (NOT an exit) — monsterTurn fearful flee at a grid edge
  writes state.fledMonsters[key] and then removes the object; the
  individual persists as a fled record and travelTo may re-spawn it
  as a NEW object (spawnsrc source fled-recovery, 0 births on the
  control band). Reported as its own fate, never merged into kills,
  never counted as still-present.
- departure-lost-trail — monsterTurn, lostSight > 6: the monster
  loses the player's trail and is removed, unkilled.
- departure-watched-away — monsterTurn curious stance, watchTurns
  >= 2 (nightlight): the glow dims and sinks, removed unkilled.
- trap-capture — monsterTurn gwTrap: the glasswing is trapped,
  removed, not killed.
- displaced-bigger-wings — the no-flee displacement removal (a
  bigger wings event drives the prior monster off with nowhere to
  go); removed unkilled.
- scripted-clear — removeWorldMonster from finale-campaign,
  network-campaign, or titans campaign cleanup; named by stack.
- other-named — removal whose stack names a function outside the
  set above; the function name IS the classification (reported,
  counted as classified-other, never hidden).
- vanished-unrecorded — daily-diff absence with NO removal event
  since the last snapshot: the recorder gap class. Counts as
  UNKNOWN for gate (a).
- pending-in-fight — run ended with the entity lifted into an
  unfinished player fight (should not occur at run end; if it
  does, it is reported, not silently resolved).

NOT exits (entity continues, never counted as removed): villager
fight mFlee (the monster relocates to an adjacent tile); vFlee /
vDie (the monster stays on its tile); wander moves; raid drafting
(raiders are teleported to Haven tiles, hp taxed by the palisade,
but remain world entities); lingering (a raider at the treeline is
still a world entity).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## CONTROL VERIFICATION (written after the sweep, BEFORE the analyzer verdict)

Armed band run Sun 2026-10-25 ~13:30–14:10 CDT, recorders only, no
game code, seeds 73671–73678, 180d death-aware. Corpus:
evidence/2026-10-25/perseed-sim-oldcore-a/ (8 rows + summary.json +
oldcore-summary.json). Sweep --summary: CORPUS PASS. Neutrality:
EXACT reproduction of the published control band on every headline
— deaths 234, national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8,
raids 85, raiders 361, pool 1,494, pool wave-3+ 107.

Per-seed (control trajectory in the spawnsrc/tileentry records):
73671 survived 180d 16 raids/74 raiders, deaths 31; 73672 won lesser
d97 7/28, deaths 25; 73673 won lesser d124 7/30, deaths 28; 73674
survived 180d 14/65, deaths 18; 73675 won lesser d135 13/56, deaths
24; 73676 village-lost d70 7/28 starv 4, deaths 31; 73677
village-lost d143 12/45, deaths 43; 73678 won lesser d116 9/35
starv 1, deaths 34. Wall: national-ever 7/8, national-final 6/8,
table invited 4/8, entered 4/8, wins 4/8 (all lesser), wave-3 8/8,
wave-4 6/8, wave-5 0/8, median survival 135d, starvation 5.
Detgate (seed 73671, recorders OFF): days/gameDays/ts identical,
no recorder surface, no wraps installed, post-setup world size 0 —
PASS. The classification below is judged on trajectories the
recorders did not move.

Recorder fix during analysis (stated, not hidden — the metrics
never changed, the corpus was re-run, not patched): the first
pass classified only 224/256 raid entities (unknown 32, 12.5%) —
every one a player-fight lift that tbEnd never settled. Root
cause, read from code: startCombat sets tbfight.worldOrigin ONLY
for titan/lingerer origins, so ordinary wild-monster lifts had no
origin for the tbEnd wrapper to settle. The fix recovers the
lifted object from the pending-lift map at tbEnd (fights are
serial) and skips null-origin lifts (cast wanderers, an engine
no-op that the first pass had recorded as noise). After the fix
and a full re-run: 256/256 classified, unknown 0, neutrality
still EXACT. The first-pass corpus is superseded, not repaired in
place.

## VERDICT: DIAG-GO

- (a) Classification 256/256 raid-time pool entities (100%,
  unknown 0) — bar >= 95% cleared by 5pp. No entity in any raid
  pool lacks a birth record, a removal event, or a still-present
  verdict (raidNoBirth 0 on all 8 seeds).
- (b) Old-core table below, per seed + pooled, for maintain +
  hushwolf wave-1/2 entities: birth count, median lifespan,
  still-present-at-end share, exit-cause shares, appearances/birth.
- (c) Core share over time (days 30/60/120/180) + wave-3+ turnover
  comparison below: old stock 6.80 appearances/birth vs wave-3+
  2.28 — old stock re-appears ~3x as often per birth.
- (d) Named mechanism answer below: fights move old stock (30 of
  39 exits are kills); melts move 7 more; departures move 2. No
  fled-record, aid-crisis, sortie, or scripted removal moved ANY
  entity on this band. And the surviving half is conditionally
  immortal: past the early window, exits collapse to a trickle
  (5 exits after day 90, 1 after day 120).
- (e) Sense read below, with quoted lines. The villages read as
  people; the "driven off / still out there" fiction and the melt
  mechanics disagree in a way worth naming (see sense section).

## OLD-CORE TABLE (maintain + scripted-hushwolf, wave <= 2)

Pooled: 81 births (57 maintain + 24 scripted-hushwolf), wave mix
w1 77 / w2 4, ALL born days 3–16 (no maintain birth after day 16,
no hushwolf birth except day 16 — the spawnsrc finding, confirmed
at fate level). Still-present at end: 42/81 (51.9%). Exited: 39.
Median lifespan at exit: 11 days. Median age of the still-present:
128 days. Appearances/birth: 6.80 (551 appearances: 457 from the
still-present half, 94 from the exited half — the survivors
contribute 83% of old-core raid appearances).

Exit-cause shares, pooled (of 81 births):
- still-present-at-end 42 (51.9%)
- player-fight-kill 12 (14.8%)
- villager-fight-kill 10 (12.3%)
- raid-defense-kill 8 (9.9%)
- player-fight-melt 7 (8.6%)
- monsterTurn-departure 1 (1.2%)
- departure-lost-trail 1 (1.2%)
- fled-record 0, aid-crisis-kill 0, raid-lingerer-sortie-kill 0,
  scripted-clear 0, other-named 0, pending-in-fight 0,
  vanished-unrecorded 0, unclassified 0.

Per-seed: births / still / still% / median lifespan at exit /
median age still / appearances per birth / exit causes:
- 73671: 9 / 8 / 88.9% / 6d / 172d / 13.89 — melt 1, still 8.
- 73672: 8 / 3 / 37.5% / 1d / 94d / 2.75 — melt 3, villager 1,
  player 1, still 3.
- 73673: 10 / 4 / 40.0% / 43d / 109d / 4.00 — villager 4, still 4,
  player 1, raid-defense 1.
- 73674: 12 / 7 / 58.3% / 59d / 166d / 9.50 — still 7, raid-defense
  2, melt 2, departure 1.
- 73675: 10 / 3 / 30.0% / 9d / 131d / 5.90 — still 3, raid-defense
  3, lost-trail 1, player 2, villager 1.
- 73676: 8 / 5 / 62.5% / 34d / 62d / 5.13 — still 5, villager 1,
  raid-defense 1, player 1.
- 73677: 12 / 7 / 58.3% / 19d / 128d / 7.67 — villager 1, still 7,
  player 3, melt 1.
- 73678: 12 / 5 / 41.7% / 4d / 108d / 4.83 — raid-defense 1,
  villager 2, player 4, still 5.

The bifurcation is the finding, not the average: the exited half
dies young (median 11d; 20 of 39 exits in the first 30 days, exit
days 3–132) while the surviving half lives the whole run (median
age 128d, all born days 3–16, oldest still-present age 177d on
seed 73671). Exit hazard by exit-day bucket: <30d: 20 exits;
30–59d: 8; 60–89d: 6; 90+d: 5 (only 1 after day 120). The pool's
old core is therefore TWO populations wearing one label: a
short-lived cohort the village fights down early, and a permanent
cohort that, once past the early window, essentially never leaves.

Type note (type is not source — stated so the counts are never
misread): hushwolf TYPE births are 27 (24 scripted-pack + 3
maintain-spawned hushwolves), of which 13 still-present, 14 exited.
Nightlight_catfish old-core births are 6, ALL exited, 0 still —
the only old-core type with zero survivors on this band (a
curiosity, not a mechanism claim: its exits are kills, not the
curious-stance departure). All other types have at least one
survivor except murkcap (4 exited, 0 still) — also noted, same
caveat.

All-births fate census (323 births, for context — the old core is
not special in its exit paths, only in its survival): still 166
(51.4%), villager-fight-kill 54, player-fight-kill 41,
player-fight-melt 32, raid-defense-kill 25, monsterTurn-departure
1, departure-lost-trail 4, fled-record 0, aid 0, sortie 0,
scripted 0, other 0, unknown 0. Player-fight-melt is the
second-largest exit path overall (32/323) — a monster the player
meets, fights, and does not kill is mechanically GONE (only
titan/lingerer origins are restored at tbEnd), whatever the
"melts back into the wilds" fiction says.

## CORE SHARE OVER TIME + TURNOVER COMPARISON

Pooled raid-pool shares by day bucket (raids pooled; poolN is the
summed per-raid pool, as in spawnsrc-a):
- days 0–29: 14 raids, pool 134, old-core 61.2%, wave-3+ 0%.
- days 30–59: 18 raids, pool 310, old-core 41.0%, wave-3+ 0.6%.
- days 60–89: 20 raids, pool 374, old-core 33.4%, wave-3+ 3.2%.
- days 90–119: 17 raids, pool 314, old-core 33.4%, wave-3+ 10.2%.
- days 120+: 16 raids, pool 362, old-core 30.9%, wave-3+ 16.9%.

Milestone raids (method, stated: the LAST raid at-or-before the
milestone day across the band — a single raid, not a pooled
share; the buckets above are the robust view):
- day 30: seed 73671 raid d30, pool 12, old-core 66.7%, w3+ 0%.
- day 60: seed 73671 raid d60, pool 19, old-core 42.1%, w3+ 0%.
- day 120: seed 73673 raid d119, pool 13, old-core 30.8%,
  w3+ 7.7%.
- day 180: seed 73671 raid d176, pool 31, old-core 25.8%,
  w3+ 19.4%.

Turnover comparison (spawnsrc birth census joined to raid-pool
appearances by seq):
- old-core: 81 births, 551 appearances, 6.80 per birth.
- wave-3+ (all sources): 47 births, 107 appearances, 2.28 per birth.
- tile-entry wave-3+: 45 births, 105 appearances, 2.33 per birth.
- all births: 323 births, 1,494 appearances, 4.63 per birth.
The old core's share falls over time (61% → 31%) NOT because old
entities leave — the still-present half never does — but because
the pool grows around them (tile-entry births add new stock)
while the short-lived half is fought down early. By day 120+ the
pool is still nearly a third old core, and that third is
overwhelmingly the permanent cohort (457 of the 551 old-core
appearances come from entities still present at run end).

## MECHANISM ANSWER (the deliverable, named)

Which removal path, if any, moves old stock? Fights do — and
almost nothing else does:

1. KILLS move old stock: 30 of 39 old-core exits (77%) are kills
   — player-fight 12, villager-fight 10, raid-defense 8. The
   village fighting its woods is the only large-scale old-core
   remover measured. Raid defense alone (8) is a real path: the
   palisade is not just a draft, it is a grinder for the old core.
2. MELTS move old stock second: 7 of 39 exits (18%) are
   player-fight melts — the player met the monster, the fight
   ended without a kill, and the entity is mechanically gone
   (tbEnd restores only titan/lingerer origins). This is a
   removal path the fiction does NOT describe as removal ("melts
   back into the wilds"), and it is the second-largest exit path
   in the whole census (32/323).
3. DEPARTURES barely move old stock: 2 of 39 exits (5%) —
   one monsterTurn-departure, one lost-trail. The departure
   machinery exists but almost never fires on this band.
4. NOTHING ELSE moved old stock: fled-record 0, aid-crisis 0,
   lingerer-sortie 0, scripted-clear 0, corpse-clear 0 (no
   alreadyDead old-core removals). There is NO measured departure
   / retirement / despawn mechanism for the old core — no entity
   aged out, wandered off for good, or was scripted away.
5. The surviving half is conditionally immortal: 42/81 old-core
   entities are still present at run end, median age 128d, and
   the exit hazard collapses with age (20 exits <30d, 8 at
   30–59d, 6 at 60–89d, 5 at 90+d, 1 after 120d). A future arm
   that wants the old core to shrink cannot rely on any existing
   path to finish the job: kills and melts take the young and
   the met, and the unmet survivors stay. Whether that is a
   design gap or the intended "earlier waves never leave" canon
   is the next run's pre-registration question — this diag
   proves the shape, it does not rule on it.

So "none measured" is FALSE as a blanket answer, and TRUE in the
sense the tileentry run needed: no mechanism moves the SURVIVING
core. The pool share is set by survival, not births, AND by the
fact that survival past the early window is near-absolute.

## SENSE-TESTING READ (transcript, not just counts)

Read: evidence/2026-10-25/sim-spawnsrc-a-sense.txt — the shared
band's own transcript (seed 73671, days 1–60; this run reproduces
the band exactly, so these are these villages' early days). The
day-60 raid line is the same line three prior runs quoted — a
wave-2 apex gets no special billing, and nothing in it marks wave
or escalation:

> [d60] 🐗 RAID — 5 raiders (Ugly-Eyes, The Moderator, Loud-Eyes,
> Inspiration, Flashbulb Moth) hit Haven in the night, drawn by the
> smell of the pantry! The palisade's stakes take their toll as they
> come over the wall.

And the defense beat that follows it is the sense counterpart of
this run's numbers:

> [d60] 🛡️ Landon, Daniela, Sigrid, Brian and Owen met them at the
> door — 5 driven off.

Villagers read as people in the same transcript — Landon hauling
water and wood and cooking, Daniela standing down the Moderator
("⚔️ Daniela stood down the Moderator and kept walking — 6
rounds, bloodied but breathing. It's still out there,
somewhere."), fire-side gossip fragments ("You catch fragments
by the fire — Grace telling Theo about Daniela. Half of it's
true anymore."). Judgment, with one wrinkle this run's numbers
sharpen: the fiction says "driven off" and "still out there" for
both villager-driven monsters (which DO stay — mFlee relocates,
never removes) and player-met monsters (which do NOT stay — a
melt is a mechanical exit). The transcript cannot tell the two
apart, and neither can a player reading it. That is a coherence
finding, not a bug report: the melt path's fiction and its
mechanics point in opposite directions, and it is the
second-largest exit path in the census. Carried as a blank for
the next run's pre-registration (fiction-vs-mechanics of melts),
not fixed here.

## VILLAGE ASSESSMENT (plain words)

The villages are the poolpres villages again — literally,
trajectory for trajectory — so this run's news is entirely about
what happens to the old animals in their woods. The story is
two stories. In the first weeks, the woods are a battlefield: the
village fights the small animals from the first fortnight, the
player meets them and sometimes kills them, sometimes just
drives them off — and driving one off in a player fight quietly
deletes it, even though the story says it melted back into the
wilds. About half the old animals die this way, most of them
fast. In the second story, the survivors stop dying. Once an old
animal has lived past the first month or so, it is essentially
permanent: it stands at raid after raid, month after month, and
by the end of a long run a handful of animals from the first two
weeks are still a quarter to a third of everything at the wall.
Nothing retires them, nothing lures them away, no script clears
them out — the only things that ever removed an old animal were
a fight it lost, a fight the player walked away from, or, twice,
simply wandering off. The old core is not immortal from birth —
it becomes immortal by surviving. Any future plan that wants the
wall to be mostly big new monsters has to answer the survivors,
not just the births: the births are already mostly new monsters
late, and the wall is still old animals because the old animals
that lived never left.

## METRIC REVIEW (required, §14)

- No metric was re-scored mid-run. DIAG-GO is judged exactly as
  pre-registered: classification >= 95% (achieved 100% after the
  recorder fix and full re-run), old-core table per seed + pooled,
  core share over time, turnover comparison, named mechanism
  answer, sense read — all present above.
- First-pass gate failure, stated not hidden: the first sweep
  classified 224/256 raid entities (unknown 32, 12.5%) because
  tbEnd's worldOrigin covers only titan/lingerer origins. The
  fix (pending-lift recovery at tbEnd + null-lift skip) is a
  RECORDER fix, not a metric change, and the verdict is judged
  on the re-run corpus only. The first-pass numbers are not used
  anywhere in the verdict above.
- Milestone method (stated): milestone shares are single raids
  (the last raid at-or-before the day), not pooled shares — the
  day-bucket table is the pooled view and the one any follow-up
  should compare against.
- Type-vs-source (stated): hushwolf TYPE births (27) exceed
  scripted-hushwolf SOURCE births (24) because maintain also
  spawns hushwolf-type monsters. Source shares and type counts
  answer different questions and are never merged above.
- No revision is proposed to the pre-registered metrics for this
  run. Questions for the NEXT run's pre-registration (not
  re-scores here): (1) is the melt path's fiction-vs-mechanics
  gap intended, and should a melt restore the monster instead of
  deleting it? (2) is the surviving core's near-immortality the
  intended reading of "earlier waves never leave," or should an
  aging/retirement path exist? Both need Steve's design ruling
  before any game change — this diag settles neither.

## CONVERGENCE + NEXT BLANKS

scale-onramp stays converging (NOT converged): this run is a
diag, not a lever — it answers the old-core question on current
master (fights + melts move the young core; the surviving core
is near-immortal), but the full seat is still unreached, wave 5
is still 0/8, and wins are still lesser-seat only. The standing
directive stands until the tracker records this axis converged on
measured evidence.

Next blanks, in order:
1. Old-core mechanism design (NEW, this run's deliverable to the
   next pre-registration): name the path that moves the
   SURVIVING core — or re-derive the 23% bar against a pool
   whose old third never leaves. Kills and melts are measured
   and insufficient for the survivors; departures are ~zero.
   (Candidate for the next run's pre-registration, not tested
   here.)
2. Melt fiction-vs-mechanics (NEW): a player-fight melt deletes
   the entity while narrating it as still out there; it is the
   second-largest exit path (32/323). Is the deletion intended?
   (Steve-call if it changes feel; a diag can settle intent
   from code comments first.)
3. Wave-5 births are zero across all sources (carried, sharpened
   by w5births-a: 0 eligible moments, chain breaks per seed).
4. Palisade-escalation narration beat for wave-3+ raids —
   confirmed a fifth time by the day-60 raid line. (Carried.)
5. Why tile-entry births decelerate late (carried).
6. Defender-fight wound manufacture (carried).
7. Field-kill narration/gossip beat (carried).
8. Wait-narration repetition (carried minor observation).
9. Nightlight old-core curiosity (NEW, minor): all 6 old-core
   nightlights exited, 0 survived — worth one line in a future
   census, not a claim.

## INFRASTRUCTURE + CORPUS

- No EPERM flap blocked this run; all rows wrote first try. Two
  full band runs (first pass + post-fix re-run, 8 seeds each, ~10
  min per band) plus detgate (~2.5 min). The re-run supersedes
  the first pass; no first-pass file is committed separately —
  the committed corpus IS the re-run.
- No sibling tree, branch, claim file, tracker, or lock touched.
  Telemetry-check NOT run, per the standing instruction
  (recorder rows are not panels). Balanced panel NOT run:
  balance-panel.js cannot ingest per-seed recorder corpora
  (carried sighting) — the sweep-compare table + analyzer
  outputs are attached instead.
- Corpus (committed with this run): per-seed armed rows +
  summary.json + oldcore-summary.json in
  evidence/2026-10-25/perseed-sim-oldcore-a/ (8 rows);
  this file; recorder scripts/policies/oldcore-diag.js; sweep
  scripts/test-oldcore-diag-sweep.js; analyzer
  scripts/test-oldcore-diag.js; classifier proof
  scripts/test-oldcore-classify.js (19/19) + detgate PASS (seed
  73671, recorders OFF: identical days/gameDays/ts, no surface,
  no wraps, post-setup world 0).
- Game code: ZERO src/js changes from this run (DIAG ONLY).
  Recorder neutrality proven by exact band reproduction above,
  plus detgate PASS, plus classifier unit proof.
