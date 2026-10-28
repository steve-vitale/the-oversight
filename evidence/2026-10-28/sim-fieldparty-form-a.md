# sim-fieldparty-form-a — why no field party ever forms when a villager meets a wave-4 monster

Run: fleshout loop, run fleshout-20261028T1528Z. Axis: scale-onramp
(blocking axis). Worker: sim-fieldparty-form-a.
Worktree: `~/workspace/worktrees/sim-fieldparty-form-a` (branch
sim-fieldparty-form-a).
CENSUS / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no fix bundled. The mechanism below names the next
arm; it does not build it. No [needs-eyes] (measurement only).

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-fieldparty-form-a-prereg.md (commit 8d52a77a0).
Instruments: scripts/policies/fieldparty-form-diag.js (recorder),
scripts/test-fieldparty-form-a-sweep.js (sweep copy),
scripts/test-fieldparty-form-a.js (analyzer / proof validator),
scripts/test-fieldparty-form-a-sense.js (non-measured replay only).
Corpus: evidence/2026-10-28/perseed-fieldparty-form-a/ (8 rows +
summary.json + analysis.json).
Detgate: PASS (seed 75101, baseline vs recorders-OFF: days 132/132,
gameDays 132/132, tsNationalDay 77, no diag surface, no wraps
installed) — on the expected numbers exactly. Recorder-ON on the
same seed also matches (132d, 34 deaths) with 0 recorder errors,
so the recorder itself moves nothing.

## Plain words first

No party forms because the village's party-forming machinery is
never fed on the wild path — twice over, and both halves are
measured, not inferred.

First, the wild meeting code asks the wrong list. When a villager
meets a monster in the field, the game builds the party from the
day-part outdoor-crew snapshot — the list of villagers assigned
to patrol, scout, hunt, or forage work that part. On this band
that list is empty at every single fight, all 1,272 of them, in
every wave, not just wave 4. The policy in play assigns only
water, wood, garden, cook, and fish work — never an outdoor
task — so the snapshot is empty by construction, and no other
source ever puts anyone on an outdoor task at a fight moment.
The party-up code therefore computes zero allies, every time,
before any judgment, trust check, or bravery roll is ever
reached.

Second, the villagers who ARE physically there are invisible
to that code. In 14 of the 24 wave-4 field meetings, at least
one other armed villager was standing on the monster's own
tile — in one meeting, five of them — and still the fight was
solo, because the code never looks at the tile. Meetings are
picked by tile (one villager per monster per world tick, coin
flip whether the tick even fires), but parties are built from
assignments, and the two lists never meet. The village-wide
armed count at those meetings averaged 6.25 — the company
exists, in the village and on the tile, just never in the list
the fight code reads.

Third, the one join call that DOES read tile presence is wired
to the wrong road. `villagerFightAllies` — the function that
finds nearby trusted villagers, crew first, then anyone in
earshot — is called only by expedition meetings (villagers out
ranging on their own). It is never called by the wild meeting
code or by patrols. The corpus proves the split cleanly: all
58 meetings anywhere on the band that had any named ally, and
all 8 meetings where a second fighter actually joined, are
expedition fights. Wild, patrol, raid, and aid-crisis meetings
have zero named allies and zero joins, ever. The machinery
works — it just never runs on the road where wave-4 meetings
happen.

And a second fighter never arrives late, either. The 24
meetings sit on just 11 distinct wave-4 monsters; the same
beast is met again and again (one Eulogy met 4 times on
75108, another 3 times on 75106), always by one villager at a
time, never by two together, and no later meeting on any of
those 11 ever has a join. Every judged meeting ends in 1–2
rounds — fled (16) or dead (8) — so even the shout branch,
which needs a fight to last long enough to turn hopeless,
never gets a round to fire in, and there is nobody to shout
to anyway.

So the 1415Z judgment — "the village judges it cannot win" —
is true of the village's words (the muster beat, the mourning)
but the mechanism underneath is not a judgment at all. It is
a missing feed: the wild path's party input is an assignment
list that is always empty, and the presence-aware join call
exists but is wired to expeditions only. Fix the feed and the
judgment question becomes testable; as the code stands, no
villager choice is ever consulted.

## Verdict: DIAG-GO (binding prereg, no re-score) — with one flagged vacuity

GO required: (a) census complete 8/8, (b) 0 UNCLASSIFIED on the
judged set, (c) every could-form meeting classified with its
code citation, (d) a NAMED MECHANISM quoted from the code,
(e) recorder neutrality + wall parity.

- (a) 8/8 configs valid: PASS. 8 rows, days > 0, recorder errs
  0 on all rows, no overflow.
- (b) UNCLASSIFIED: 0. Every judged meeting classified.
- (c) Classification complete: PASS — but see the vacuity
  note. Every judged meeting is NO-CREW:RAW-EMPTY (24/24),
  split 14 TILE-ONLY / 10 TILE-EMPTY (see table).
- (d) Mechanism: NAMED (below, with code citations).
- (e) Detgate PASS (above); parity vs the 1415Z demand corpus:
  PASS, EXACT, on all 8 seeds and all 9 fields per seed
  (days, won, nationalEver/Final, table, entered, deaths,
  waveReach, courtship combined 110).

VERDICT: DIAG-GO. FLAGGED VACUITY, NOT HIDDEN: the prereg's
primary metric — formation rate on could-form meetings (crew
lens) — has denominator ZERO (0 could-form meetings in 24),
so the rate itself is 0/0, undefined, not 0%. That is not a
census failure; it IS the finding, one level up: the
could-form condition never arises because the crew input is
always empty. The tile-lens rate (0 formed / 14 tile-could-
form) is reported as a secondary descriptive number only,
never substituted for the primary — the prereg's definition
is held, and the reason its denominator is empty is the
mechanism. A future prereg that wants a non-vacuous primary
should define could-form on the tile lens (physical company)
or on village-wide armed presence, and say so up front.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single arm, tableseat-nowait VERBATIM.
- Horizon 180d DEATH-AWARE (runDays stops on death/win;
  +10d tail max). Sweep wall time ~14 min for 8 seeds
  (plus detgate and sense replays).
- Base: branch tip 9e3c7f152 at worktree creation; game code
  unchanged by this arm (zero src/js — verified: the arm's
  commits touch only evidence + scripts/policies +
  scripts/test-*).

## Wall numbers (THIS band only, never pooled)

| field | this band (75101-75108) | 1415Z demand corpus |
|---|---|---|
| national ever / final | 7/8 / 6/8 | 7/8 / 6/8 (exact) |
| table invited / entered | 4/8 / 3/8 | 4/8 / 3/8 (exact) |
| wins (lesser / full) | 3/8 (3 / 0) | 3/8 (3 / 0) (exact) |
| wave-4 unlock | 6/8 | 6/8 (exact) |
| wave-5 unlock | 0/8 | 0/8 (exact) |
| median survival | 146d (days: 132, 180, 132, 90, 180, 146, 180, 102) | 146d (exact) |
| deaths total | 286 | 286 (exact) |
| courtship combined | 110 (8/8 seeds active) | 110 (exact) |

Per-seed judged meetings: 75101: 0, 75102: 0, 75103: 0,
75104: 0, 75105: 0, 75106: 15, 75107: 0, 75108: 9. Seeds
75101/75104/75107 contribute no wave-4 field meetings:
75104 and 75107 never unlocked wave 4; 75101 and 75105
unlocked it with 0–1 spawns never fought in the field.
They belong in the band denominator (8 seeds) but not in
the meeting table.

Reconciliation with the 1415Z counts: the w4convert channel
split (field 11 fights / 11 engaged / 0 kills) counts
DISTINCT INSTANCES; this census counts MEETINGS. Both are
right: 11 distinct wave-4 field instances, met 24 times,
0 field kills. The demand census's field rows (24) match
this census's judged meetings (24) exactly, with identical
outcomes (vDie 8, vFlee 16) and identical per-seed splits
(75106: 15, 75108: 9).

## The formation table (the judged measurement)

JUDGED SET (prereg): wave-4, channel field, caller resolve /
patrol / aid, leader a villager. The 'aid' caller is the
aidFight routing of a resolve/patrol meeting (same origin
functions; the stack shows aidFight) — the prereg-literal
cut (resolve + patrol only) is 18 meetings; the 6 aid
meetings are included because they are wild field meetings
routed through aidFight, exactly as the demand census
counted them (field callers resolve 18, aid 6). Both cuts
give the same classification (all NO-CREW), so the
inclusion changes no finding; it is stated, not smuggled.

| class | n / 24 | meaning |
|---|---|---|
| NO-CREW:RAW-EMPTY+TILE-ONLY | 14 | crew snapshot empty AND >= 1 armed other villager on the monster's tile |
| NO-CREW:RAW-EMPTY+TILE-EMPTY | 10 | crew snapshot empty AND no armed other villager on the tile |
| JOINED-* / NAMED-NOT-FOUGHT / CREW-UNARMED / UNCLASSIFIED | 0 | — |

Primary metric (crew lens): formed 0 / could-form 0 = 0/0
UNDEFINED (vacuity flagged above). Secondary (tile lens):
formed 0 / tile-could-form 14 = 0%. Village-wide context:
leaders armed 24/24, village armed mean 6.25 at meeting
starts, village armored (P >= 10) mean ~2.9, leaders veteran
0/24, tile veterans present 0/24.

Per-meeting shape: intent learn-first 10, engage/trick-known
14; rounds 1 (10) or 2 (14) — never more; damage dealt total
255, max single meeting 46; outcomes vDie 8, vFlee 16.
The 14 engage-intent meetings COULD have shouted (intent
gate open) but had allies 0, so the shout branch's allies
condition fails before intent matters. The 10 learn-intent
meetings would have withdrawn at round >= 3, but all ended
by round 2 — learn-preemption is never even tested on this
band. Intent is not the binding gate here; the empty crew
input is, one step earlier.

Aid-caller detail (6 meetings, all solo): aidFight sets
allyFromStart ONLY when foreign help is actually at the
door (present.length > 0, comms.js aidFight). On this band
no foreign help was at the door for any of the 6, so
allyFromStart stayed false and allies stayed 0 — the aid
path's join also never fires here, for lack of help at
the door, not because of a gate.

## The mechanism (code citations — the named answer)

1. WILD MEETINGS READ ASSIGNMENTS, NOT THE TILE.
   game.js resolveWildMonsterEncounter: "PARTY-UP ... a
   villager jumped in the wild can call to whoever's out
   there with them" — builds wAllies / wAllyVids SOLELY
   from `this._outdoorCrew`. game.js resolvePatrol: same
   pattern (pAllies / pAllyVids from `this._outdoorCrew`).
   Neither reads npcsOnNode(monster tile). game.js
   resolveAssignments snapshots `_outdoorCrew` from
   `state.village.assignments` tasks patrol/scout/hunt/
   forage.
2. THE SNAPSHOT IS ALWAYS EMPTY ON THIS BAND. Corpus:
   crewRaw non-empty in 0/1272 meetings (all waves, all
   callers, all channels). Cause, measured at the policy
   level: tableseat-nowait → leanlinkrescue → competent
   assigns only water, wood, garden, cook, fish work
   (scripts/policies/competent.js assignment sites) —
   none in OUTDOOR_TASKS — and no other source puts a
   villager on an outdoor task at any fight moment on
   this band. (Whether a differently-assigning policy
   would fill the snapshot is a next-arm question, not
   claimed here.)
3. MEETINGS ARE PICKED BY TILE, ONE AT A TIME. game.js
   villagerMonsterTick: per world monster, npcIds =
   npcsOnNode(tile) filtered (roster, not sheltered, not
   post-flee-resting); `if (Math.random() > 0.5) continue`
   (half the ticks skip); one vid picked at random.
   Co-located villagers therefore meet the same monster
   in separate solo meetings, never as a group — and the
   corpus shows exactly that: 11 instances, 24 meetings,
   0 joins, and 0 later-joins across all same-seq groups
   (9 multi-meeting groups, days-spans up to 4 days,
   e.g. 75108 seq 30 met 4 times d86–d88 by 3 leaders).
4. THE PRESENCE-AWARE JOIN EXISTS BUT IS WIRED ELSEWHERE.
   src/js/party-wiring.js `Game.villagerFightAllies(vid)`:
   crew (live assignments + snapshot backup) first, then
   villagers on/adjacent nodes ("in earshot"), trust >= 15
   floor, capped at 2. Its ONLY engine caller is
   src/js/villager-agency.js expeditionMonster ("PARTY
   WIRING ... nearby villagers arrive as allies through
   the fieldFight machinery"), which passes the result
   as fieldFight opts.allies/allyVids. resolveWild /
   resolvePatrol never call it. Corpus proof: all 58
   allies>0 meetings and all 8 calledHelp joins on the
   band are expedition channel (caller 'other'); wild /
   patrol / raid / aid meetings have allies 0 always.
   (The 8 expedition joins are waves 1–3 only. The
   band's single wave-4 other-channel meeting — 75102
   d146, Suburb, expedition leg — evaded, so it never
   tested the join; it is outside the judged wild set
   in any case.)
5. AT MOST ONE ALLY EVER JOINS ANYWAY. fieldFights.js
   fieldFight: allyVids sliced to 2, one shift, helpCalled
   guard — a second fighter is the ceiling, never a
   party of 3+. From-start join requires
   opts.allyFromStart (aidFight only). The hopeless shout
   requires hopeless trajectory AND allies > 0 AND
   intent !== 'learn'. On this band allies is 0 before
   any of that is evaluated.
6. THE DELIBERATE PARTY IS A DIFFERENT ROAD. havenGrowth.js
   lingererSortie musters fighters by policy choice
   (muster + rations + real fieldFights) — it is not a
   meeting and is excluded from the judged set. Under
   tableseat-nowait the policy never sorties (0 sortie
   caller rows on this band), so the muster road is
   also untravelled here — reported as context, not
   counted as a meeting failure.

## Contrasts (recorded by the same recorder, not judged)

- WAVE-3 wild meetings (same band, same filters): 82
  meetings, crewRaw non-empty 0/82, allies > 0 0/82,
  joins 0/82, tile-armed >= 1 in 28/82, outcomes vFlee 53
  / mFlee 24 / vDie 5. The empty-crew mechanism is NOT
  wave-4-specific — it is the wild path's shape at every
  wave. Wave 3 differs only in that villagers sometimes
  drive the beast off (24 mFlee vs 0 on wave 4).
- RAID contrast (wave 4, Haven door): 2 meetings, both
  solo, both vFlee, both with tile-armed company present
  (2 and 4 armed others on the tile — the defenders are
  AT Haven, yet the fight is still solo by the same crew
  logic: crew empty, allies 0).
- EXPEDITION positive control: 163 expedition-channel
  meetings, 58 with named allies, 8 with a joined second
  fighter (all by hopeless shout, fromStart false) —
  proof the join machinery itself works when fed. The
  wild path is the unfed one.
- ALL WAVES: crewRaw non-empty 0/1272 meetings. This is
  the single most damning number in the census: the
  party-up input is not sometimes empty or usually
  empty — on this policy band it is empty always.

## Sense note (75106, NON-MEASURED replay, window d90–d146)

The sense rule picked 75106 (15 judged meetings, the band
max). The replay's beats land on the corpus's meetings
exactly: d96 "The Algorithm killed Ingrid in 2 rounds.
The village mourns." (corpus: d96 Ingrid vs Algorithm,
vDie, 2 rounds, tile-armed company 1, crew empty); d97
"The Algorithm killed Emma in 2 rounds" (corpus: d97
Emma vs Algorithm, vDie, 2 rounds, tile-armed company 5,
crew empty). The village around those deaths reads like
people: it argues over what to call the thing ("Big Ugly,"
nobody agreeing), it chooses the gorge price over a
sortie night after night ("Endure it ... or send a
sortie"), it teaches unasked (Fatima teaches Walt Food
Preservation), it checks the pantry before heading out
and turns to the water run when the shelves are full.
That is the sense answer to the task's question: the
villagers' choices read like people judging a fight they
cannot win AND like a missing system, both at once. The
judgment is real in their words — mourning, naming,
enduring — but no villager ever gets the chance to act
on the other half of the judgment (gather company and
try), because the code path that would let company
arrive is never fed. The solo deaths are announced as
solo deaths, with no "nobody came" beat and no join
attempt — the absence is silent, which is exactly what a
missing feed looks like from inside the fiction. No
robotic behavior flagged in the window beyond the
already-known verbatim-repeat class (not re-litigated
here).

## Metric review (filled at judging time)

- PRIMARY-METRIC VACUITY (flagged, not re-scored). The
  prereg's primary (formed / crew-could-form) is 0/0.
  The verdict rests on the prereg's GO legs (complete
  census, 0 unclassified, named mechanism, detgate,
  parity), all of which pass — the vacuity is disclosed
  in the verdict section, and the tile-lens 0/14 is
  reported only as a secondary descriptive number. A
  future prereg should define could-form on physical
  presence (tile lens) if it wants a non-vacuous rate.
- AID-CALLER INCLUSION (labeled, no GO effect). The
  prereg's judged set says "resolve + patrol"; the
  analyzer includes 'aid' (6 meetings) because aidFight
  is a routing of resolve/patrol meetings, as the demand
  census counted them. The prereg-literal cut (18) and
  the analyzed cut (24) classify identically (all
  NO-CREW:RAW-EMPTY), so no finding depends on the
  inclusion.
- EVADE/ALREADYDEAD (no effect). All 24 judged meetings
  were fought (outcomes vDie/vFlee only); the fought-only
  rate equals the all-meetings rate, so the prereg's
  "reaches fieldFight" meeting definition and a
  fought-only definition coincide on this band.
- PANEL. scripts/balance-panel.js `compare` requires
  --before/--after panel files built from live roots
  (line ~298: errors without them) and has NO
  census-ingest mode — the standing exception, as in
  the 1415Z arms. No panel artifact was faked; the
  paired parity table (this census vs the 1415Z demand
  corpus, identical seeds/policy, parity EXACT) is the
  §15 substitute. This arm changes nothing in the game,
  so the panel is expected to show zero movement.
- TELEMETRY DEVIATION CHECK (loop body step 10): the
  corpus path for the coordinator's check is
  evidence/2026-10-28/perseed-fieldparty-form-a/*.json
  (metrics national,table,wins,exiled, baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact classes if LOUD lines appear: (a) the
  baseline's own regime note forbids this comparison (a
  ~100%-win winseat suite vs a tableseat-nowait census
  substrate); (b) per-seed rows carry
  nationalEver/entered/won, not top-level
  national/table/wins paths. The corpus's real wall
  numbers are nationalEver 7/8, table entered 3/8, wins
  3/8. No exiled LOUD line is expected; the coordinator
  judges any that appear.

## Blanks found (reported for the findings backlog, NOT chased)

1. WILD-PATH JOIN FEED (the mechanism, not a new
   finding). The wild router never calls
   villagerFightAllies and its crew input is always
   empty under this policy. A fix arm should feed the
   wild meeting a presence-aware ally list (or make
   patrol/scout/hunt/forage assignments exist under a
   competent-like policy), with GO on a FOUGHT wave-4
   field party, not a meeting count.
2. TRUST-FLOOR INTERACTION (question for the fix arm).
   villagerFightAllies answers only at trust >= 15;
   tile company exists (14/24 meetings) but its trust
   values were not recorded as a join input — the fix
   arm's recorder should record tile members' trust so
   a fed-but-unanswered outcome is distinguishable from
   an unfed one.
3. ONE-ALLY CEILING (design note). Even a fed wild
   path joins at most ONE ally (fieldFight shift-once
   rule) — a "party" of 2, never the demanded party of
   3+. Whether the wave-4 demand means a pair or a
   party is a steve-call for the fix arm's prereg, not
   decided here.

## Named next step (next arm, own prereg — NOT built here)

Feed the wild meeting: wire villagerFightAllies (or its
tile/earshot logic) into resolveWildMonsterEncounter /
resolvePatrol, OR put villagers on outdoor assignments
under a competent-like policy — pick ONE feed, pre-
register against it, with GO = at least one FOUGHT
wave-4 field meeting with a joined second fighter on
this same seed band (75101–75108, tableseat-nowait
verbatim), and the classification table from this census
as its baseline (NO-CREW 24/24, could-form 0/24, formed
0/24, tile-could-form 14/24). If the feed is wired but
trust < 15 blocks every answer, that is a classified
outcome (FED-BUT-UNANSWERED), not a failed run — the
next prereg must name that class in advance.

## Infrastructure notes

- Sweep: scripts/test-fieldparty-form-a-sweep.js, 8 seeds,
  ~14 min wall + detgate (~5.5 min, two full runs) +
  sense replay (~80s). Corpus:
  evidence/2026-10-28/perseed-fieldparty-form-a/ (8 rows +
  summary.json + analysis.json). Analyzer:
  scripts/test-fieldparty-form-a.js (proof validator; exit
  0, DIAG-GO, all legs PASS). Sense:
  scripts/test-fieldparty-form-a-sense.js (NON-MEASURED
  replay only; 75106 window d90–d146).
- INDEX CLOBBER (loud, repaired, commits correct): after
  BOTH safe-commits in this run (prereg 8d52a77a0,
  instruments ed4462565), the worktree's main index
  showed the committed files as bogus staged deletions
  plus untracked copies (worktree files byte-identical to
  HEAD). Repaired via `git update-index --add
  --cacheinfo "100644,<blob-from-HEAD>,<path>"` per file
  and re-verified (`git status --short` empty, `git diff
  HEAD` empty) before proceeding. No reset, no stash
  touched, commits verified via `git show --stat HEAD`.
  The clobber class from the 2026-10-22/23 register
  lessons, recurring in this worker's runs; the same
  check runs after every safe-commit in this run.
- Sibling work untouched: sim-partyfinish-band-a's files,
  branch, and worktree were not touched and its outputs
  were not consumed; this census is independent (its own
  recorder, own corpus, parity partner the 1415Z demand
  corpus only).
- Heartbeat: worktree-heartbeat.sh invocations in this
  run were slow (restat-bound, multi-minute); the tree
  stayed registered throughout and no reaper action was
  observed. Coordinator to confirm registry freshness at
  merge.
