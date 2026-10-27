# sim-w4channel-a — wave-4 encounter→kill conversion census by channel: GO (the census completes — and conversion is zero on every channel)

Run: fleshout loop, run fleshout-20261027T2147Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4channel-a.
Worktree: `~/workspace/worktrees/sim-w4channel-a` (branch sim-w4channel-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
wave-4 faced → engaged → killed census by channel, with killer
identity first-class, answering the 2036Z round's top blank.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-w4channel-a-prereg.md (commit bc302ea82).
Corpus: evidence/2026-10-27/perseed-w4channel-a/ (8 rows + summary.json
+ analysis.json + sense-75104.txt). Instruments:
scripts/test-w4channel-a-sweep.js (channel census sweep),
scripts/test-w4channel-a.js (proof validator / analyzer),
scripts/test-w4channel-a-sense.js (non-measured sense replay).
Detgate: PASS (seed 75101: baseline vs recorders-OFF days 131/131,
gameDays 131/131, tsNationalDay 77 both, no diag surface, no wraps
installed, post-setup world 0).

## Plain words

This band kills no wave-4 monster at all — not through the world, not
through the feast, not through contests, not anywhere. Eleven Mirror
Draft monsters are born into the world, six of them are fought, and
all six survive: the scholar loses thirteen turn-based fights in a
row, villagers flee or die in five field fights and evade three
more, and two contest fights are lost too. The monsters that do die
on this band die in no channel, because there are no deaths to
channel. The last band's story was "one kill per band, always the
scholar." This band's story is simpler and harsher: zero kills, zero
killers, and the narrowest part of the funnel is no longer "monsters
never met" — it is "monsters met and never killed."

Two contrasts with the w4funnel band sharpen the finding. First,
timing is not the excuse here: the median wave-4 arrival on this
band had 47 days left in its run (w4funnel's median was 7), and the
most-fought monster was fought seven times across 52 days and still
lived. Second, the non-world door that produced the w4funnel band's
only veteran — the feast-draw Strike — never opens at wave 4 here:
there are zero null-origin wave-4 turn-based fights on this band.
The feast drew a Suburb once, but the fight was about a monster
standing on another tile's shadow (an origin mismatch, counted as
`other`, lost), and the contest arena drew an Algorithm twice, also
as mismatches, also lost. The door that fired before fired nothing
this time, and the world funnel fired everything and converted
nothing.

## Verdict: GO (binding prereg, no re-score)

GO required: (a) 8/8 configs valid; (b) >= 95% of wave-4 arrivals
classified into a known outcome; (c) channel attributed for >= 90%
of wave-4 fights and 100% of wave-4 kills; (d) the narrowest funnel
stage named with counts and shares; (e) SENSE: one seed's wave-4
thread read in plain words. COUNT:

- (a) 8/8 rows, days > 0, every gate + deed + channel field present,
  recorder errors 0 on all six recorders, no overflow. PASS.
- (b) 11/11 arrivals classified into known outcomes (100%):
  still-present 9, melted 2, unknown 0. PASS.
- (c) 24/24 wave-4 fight events channel-attributed (100%); 0
  wave-4 kills, so the kill-attribution clause holds vacuously —
  stated plainly, not hidden: there were no kills to attribute,
  and the empty kill table IS the finding (see Metric review for
  the prereg wording note). PASS with that stated caveat.
- (d) Narrowest stage named: ENGAGED → KILLED, 0/6 engaged arrivals
  killed (0.0%), 0/24 fights lethal, against arrivals → engaged
  6/11 (54.5%). PASS.
- (e) Sense: 75104's wave-4 thread read below (census timeline +
  non-measured replay note). PASS.

VERDICT: GO. The census is complete; the conversion it measures is
zero. The zero-kill branch (prereg, binding) applies: the census
completes with an empty kill table, and there is NO second judged
band on new wording in this run.

## The band (binding design, as pre-registered)

- Seeds 75101-75108, as assigned. Single arm:
  scripts/policies/tableseat-nowait.js VERBATIM (LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, TABLEDEFIANT unset — the vetsurvive prereg's
  exact game-policy env set) PLUS recorder on-switches only
  (RAFTDRAFT=1, SPAWNSRC=1, OLDCORE=1, W5BIRTHS=1, DEFWOUND=1,
  NONWORLDKILL=1). No armed leg: no lever under test.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max). Sweep wall time ~13 min for 8 seeds (plus detgate ~2 min).
- Freshness, as disclosed in the prereg (not assumed): a targeted
  check after the prereg commit found NO prior corpus for seeds
  75101-75108 — no filename containing them, and no 2026-10-27
  evidence .md mentioning them except this arm's own prereg. (The
  broad filename grep's "7510" hits were seed 67510 files from
  2026-10-23 — a substring match, a different seed, not this band.)
  This band is FRESH FOR THE CHANNEL CENSUS.
- Substrate-activation gate (rule3trial lesson, binding): band
  courtship combined = 99 (courtCounters 2, courtAccords 17,
  courtNational 10, courtGlobal 5, tended 42, defenseCalls 0,
  proposedLead 23), seeds active 7/8 — GATE PASSES (combined > 0
  and >= 6/8 active). The one inactive seed is 75105, dead day 34
  before courtship can start (lead proposals begin day 25) — a
  timing fact, not a missing substrate, same shape as vetsurvive's
  74805. Per-seed courtship: 75101: 26, 75102: 10, 75103: 15,
  75104: 17, 75105: 0, 75106: 9, 75107: 8, 75108: 14.
- Read discipline: the sweep-side snapshot uses ONLY pure reads
  (deedState wavesFaced, waveKillLog, waveCombatReadiness,
  roster/vpOf/disp for killer identity, tableState). It never calls
  villageStandingTotal() or unlockedWave() mid-run.

## Wall numbers (every run needs these)

| field | this band (75101-75108) | vetsurvive (74801-74808) | 2036Z pooled (24 seeds) |
|---|---|---|---|
| national ever / final | 7/8 / 6/8 | 7/8 / 5/8 | 22/24 / 16/24 |
| table invited / entered | 5/8 / 5/8 | 3/8 / 1/8 | 9/24 / 5/24 |
| wins (lesser / full) | 5/8 (5 lesser / 0 full) | 1/8 (lesser) | 5/24 (all lesser) |
| wave-4 unlock | 3/8 | 3/8 | 14/24 |
| wave-5 unlock | 0/8 | 0/8 | 1/24 |
| median survival | 145d (days: 34, 90, 96, 131, 145, 165, 168, 169) | 180d | 174-180d per band |
| deaths / starvation | 221 / 1 (0.5%) | 284 / 6 | 836 / 9 |

Per-seed ends: 75101 village-lost d131 (wave 4, global); 75102 won
lesser d90 (wave 3, global); 75103 won lesser d168 (wave 4,
national); 75104 village-lost d165 (wave 4, regional); 75105
village-lost d34 (wave 1, village); 75106 won lesser d96 (wave 3,
global); 75107 won lesser d145 (wave 3, global); 75108 won lesser
d169 (wave 3, national). Arc IV (table entered): 5/8; Arc III or
lower: 3/8. National is NOT the wall on this band either (7/8 reach
it), and the lesser seat is the live path (5 wins, all lesser) —
the full seat is still nobody's story.

Death-cause shares (221 deaths): combat family 177 (80.1%:
villager combat 80, villager-vs-villager combat 64, player arena 29,
player contest 4); expedition 18, ambush 7, wound-that-wouldn't-
close 4, villager monster 3, sickness 3, thirst 2, starvation 1,
singles (Landlord, Choir Toad x2, toad-war-drum, tick, dehydration).
Combat dominates; starvation does not explain the scale wall here
either.

## The funnel (per-instance arrivals → engaged → killed)

Definitions (prereg, fixed before sweeping): ARRIVAL = one wave-4
world-monster birth (oldcore birth joined to spawnsrc spawn on seq).
ENGAGED = an arrival with >= 1 seq-linked fight row (defwound
resolve, oldcore tbEnd, or a world-origin nonworldkill TB start).
KILLED = one waveKillLog entry with w == 4. FACED-TYPE = a distinct
wave-4 type in deedState().wavesFaced at end (per TYPE, never per
instance). FACED-INSTANCE is UNMEASURABLE with the existing
recorders (no sighting recorder — a world monster enters the deed
feed only by being fought), so the census reports NEVER-ENGAGED
arrivals as its labelled proxy, exactly as pre-registered.

| stage | count | share |
|---|---|---|
| arrivals | 11 | — |
| engaged (≥1 seq-linked fight) | 6 | 54.5% of arrivals |
| never-engaged (proxy for never-faced) | 5 | 45.5% of arrivals |
| engaged, not killed | 6 | 100% of engaged |
| killed (from arrivals) | 0 | 0% of engaged, 0% of arrivals |
| kills (all channels) | 0 | — |
| faced-types (per-seed sum / distinct) | 8 / 6 | types, not instances — see below |

Narrowest stage: ENGAGED → KILLED (0.0% conversion). The
arrivals → engaged stage (54.5%) is the leakier-looking number
only until the second stage is read: every engaged arrival
survives, so the funnel's binding constraint on this band is
fight lethality, not meeting. (On the w4funnel band the order was
reversed — never-fought 81.8% — because arrivals there had a
median 7 days to live in; here the median is 47 days, and meeting
stops being the excuse.)

Arrival detail (days-available = end day minus arrival day):

| seed | arrival (type @ day, source) | days-avail | engaged? fights | outcome |
|---|---|---|---|---|
| 75101 | eulogy @ d119, tile-entry | 12 | YES, 6 TB | melted |
| 75101 | suburb @ d127, maintain | 4 | no | still-present |
| 75101 | suburb @ d129, tile-entry | 2 | no | still-present |
| 75103 | herald @ d119, scripted-titan | 49 | no | still-present |
| 75104 | suburb @ d95, tile-entry | 70 | YES, 2 (1 field flee + 1 TB loss) | melted |
| 75104 | herald @ d105, scripted-titan | 60 | YES, 1 field flee | still-present |
| 75104 | eater @ d105, tile-entry | 60 | YES, 1 field flee | still-present |
| 75104 | reunion @ d113, tile-entry | 52 | YES, 7 (1 field flee + 6 TB losses) | still-present |
| 75104 | eulogy @ d118, tile-entry | 47 | no | still-present |
| 75104 | influencer @ d126, tile-entry | 39 | no | still-present |
| 75104 | reunion @ d142, tile-entry | 23 | YES, 1 field (villager died) | still-present |

Band totals: arrivals 11, all fresh (fled-recovery 0). Sources:
tile-entry 8, scripted-titan 2, maintain 1. Arrival days sorted:
95, 105, 105, 113, 118, 119, 119, 126, 127, 129, 142. Days-available
sorted: 2, 4, 12, 23, 39, 47, 49, 52, 60, 60, 70 — median 47.
Outcome classes: still-present 9, melted 2, killed 0, departed 0,
fled-record 0, pending-in-fight 0, unknown 0. The two melts are TB-
loss melts: a lifted monster that loses a TB fight and is neither
lingerer nor titan is not restored (oldcore kind
player-fight-melt) — the eulogy on 75101 (6th lost fight, d131)
and the suburb on 75104 (d164). The reunion on 75104 survives six
lost TB fights the other way: re-entry restores (lingering
raider), so wounds never accumulate — the w4funnel suburb
mechanism, again, now with a second witness.

Faced-types (the engine's faced, per type): 75101: suburb, eulogy,
algorithm (3); 75104: algorithm, eater, herald, suburb, reunion
(5); all other seeds 0. Per-seed sum 8, distinct 6. The two extra
types beyond engaged arrival types are CAST types faced without a
world arrival: algorithm (contest-arena fights, both seeds) and
the feast-draw suburb on 75101 (a cast suburb fought before any
suburb arrival existed on that seed). Faced-type therefore OVER-
counts the world funnel by design — it counts cast encounters too
— and must never be merged into the per-instance funnel. The
per-instance funnel above is the judged one.

Raid check: 5 wave-4 raider appearances in raid drafts, all 5
trace to spawn seqs (raid draft creates nothing — verified, not
assumed). Zero wave-4 raid-defender fights: no drafted wave-4
raider was ever fought by defenders on this band.

## Conversion by channel (the judged table)

Channel vocabulary (prereg, mutually exclusive, precedence:
trap > contest-arena-door (non-world) > non-world-TB (null-origin)
> player-tb-world (world-origin TB) > raid-defender >
villager-field > other). A fight event is one deduplicated
recorder fight (defwound resolve, TB start, or raftdraft
fieldFight; TB ends dedupe against starts by seq, never counted
twice — see Metric review). 24 fight events total: 18
arrival-linked, 6 non-arrival-linked (2 cast TB fights + 1
feast-draw mismatch + 3 unlinked evades, below).

| channel | fights | kills | conversion | what happened |
|---|---|---|---|---|
| player-tb-world | 13 | 0 | 0% | all 13 world-bump TB fights LOST (scholar vs world monster); 6 eulogy + 6 reunion + 1 suburb |
| villager-field | 8 | 0 | 0% | 5 seq-linked field fights (4 villager flees, 1 villager death) + 3 unlinked evades (0 rounds, 0 damage) |
| contest | 2 | 0 | 0% | both contest-arena Algorithm fights (origin-mismatch), both lost |
| other | 1 | 0 | 0% | feast-draw Suburb fight (origin-mismatch: cliffhanger bystander on tile), lost |
| raid-defender | 0 | 0 | — | no wave-4 defender fight fired |
| trap | 0 | 0 | — | no wave-4 trap fight fired |
| non-world-TB | 0 | 0 | — | ZERO null-origin wave-4 TB fights: the w4funnel strike door did not fire at wave 4 on this band |
| TOTAL | 24 | 0 | 0% | |

Per-channel notes, each traceable to the corpus:

- Player TB (13 fights, 0 kills): the scholar fights alone, loses
  every time. Eulogy (75101): 6 world-bump losses d128-d131, the
  last one melting it on the village's final day. Reunion (75104):
  6 world-bump losses on d164 alone, all re-entry restores, plus
  a 7th settlement landing d165 — the village's last day. Suburb
  (75104): 1 world-bump loss d164, melting it. No player TB fight
  on this band was ever won at wave 4.
- Villager field (8 rows, 0 kills): seq-linked field fights are
  eater vFlee (75104 d127), herald vFlee (d129), reunion-142 vDie
  (d148: Ethan dies in 2 rounds, monster at 1176/1200 HP),
  suburb vFlee (d161), reunion-113 vFlee (d162). The 3 unlinked
  rows are Ethan's evades (reunion d119, eulogy d125, algorithm
  d143 — all outcome evade, rounds 0, damage 0): a villager
  meeting a wave-4 monster and getting out without a blow. They
  are counted as field-fight rows, never attributed to an
  arrival, and they exchange no blows — future censuses should
  split evades from fights (see Metric review).
- Contest (2 fights, 0 kills): Algorithm contest-arena fights on
  75101 d130 and 75104 d108, both origin-mismatch (a bystander
  sat on the tile: eulogy on 75101, bright_idea on 75104), both
  lost. The arena door fired at wave 4 and converted nothing.
- Other (1 fight, 0 kills): the feast-draw Suburb on 75101 d126 —
  the feast smoke drew a Suburb, the scholar faced it while a
  cliffhanger sat on her tile, mismatch, lost. This is the
  closest this band comes to the w4funnel strike door, and it is
  a different shape: a feast draw about a cast monster, fought
  through a bystander tile, lost. The strike door (null-origin
  feast draw, won) did not reproduce.
- Non-world-TB (0 fights): the prereg's headline channel for
  non-world kills is empty here. That emptiness is measured,
  not assumed: every wave-4 TB start on the band has an origin
  (world-origin 13, mismatch 3, null-origin 0).

## Killer identity (first-class, and empty)

Wave-4 kills on this band: 0. Killer identities: none. The
killer-identity table is therefore empty, and that emptiness is
reported rather than filled:

| identity class | kills | living at end |
|---|---|---|
| scholar-player | 0 | — |
| villager | 0 | — |
| player-literal | 0 | — |
| unknown (null by) | 0 | — |

The census family's scholar-only identity (vetsurvive's Xavier
Dubois, w5seq/w5twokey's dead killers, w4funnel's elif_demir)
is NEITHER replicated NOR contradicted here: a band with zero
kills cannot speak to who kills. What this band does speak to is
the step before identity — nobody reaches the killing step at
all, scholar or villager. The 2036Z finding ("scholar is the
only recorded killer identity") stands unamended, with one more
band of zero behind it. Living-at-end status per killer is
vacuous here (no killers); the gate's living rule was
recomputed by the analyzer for every kill entry (there were
none) and for every killerStatus entry (also none).

## Sense-testing read (seed 75104, non-measured replay, last 30 days)

Sense seed by the pre-registered rule: most wave-4 kills (0 on all
seeds) → most wave-4 engaged arrivals → 75104 (5 engaged
arrivals; 75101 has 1). Replay:
scripts/test-w4channel-a-sense.js, seed 75104, 165 days, output
saved alongside the corpus (perseed-w4channel-a/sense-75104.txt,
243 life/gate hits from d135, 14 fight starts). The replay
trajectory SHIFTED from the census (as with all narration
replays — the text below proves wording and presence only,
never entity identity or counts), with one notable agreement:
the census's d148 field fight (Reunion kills Ethan in 2 rounds,
monster at 1176/1200 HP) appears in the replay verbatim as
"💀 The Reunion killed Ethan in 2 rounds. The village mourns."

What the replay actually shows, in the last month, reads as a
village living its ordinary life next to an unmet horror:

- The people pass the sense test around the gap: Ethan waters
  and weeds the beds daily, checks a full pantry and turns the
  foraging party back ("Plenty for days. Teaching the kids
  snares instead"), Onni tastes off the spoon at the cookpot,
  Pamela teaches reading tracks, Yara teaches the village new
  plants without the player lifting a finger. Word travels
  (Emberhold riders, Thornfield weddings, Stonebridge heralds),
  rivals raid the pantry at night (The Bloodied, ~1,400 kcal,
  trust -10), and the village argues about names for things
  ("Big Big," "The Loud Beast," "Ugly-Eyes," "The Bailiff") —
  the naming argument firing for monsters the village cannot
  quite name.
- The wave-4 thread itself reads as haunting, not combat: the
  Reunion "stops at the treeline — pacing, unwilling" (d153,
  d154), and on d164 the scholar's line is "You don't know what
  that was. Everyone you've buried, standing up. Someone at the
  haven should hear about this." That is the Reunion's fiction
  (the village you failed, given teeth) arriving as dread, not
  as a fight the village chose. The replay's d164 carries seven
  turn-based fight starts — matching the census's seven d164 TB
  fights (suburb + six reunion) in count, though the replay's
  fight contents are not the census's — and the village ends
  the next day with a quiet fire ("Nobody's talking much. The
  fire feels smaller tonight"), not with a veteran story.
- What the replay does NOT show: any beat marking a wave-4 kill
  (there is none to mark), any "blood your fighters" gate beat
  in the last 30 days, or any villager blooding. Same judgment
  as vetsurvive, one band further, with the gap widened: the
  fiction now gives the Reunion a haunting presence while the
  village still has no visible path from "we met the draft" to
  "we killed one of it."

Sense judgment: the late run reads as people with routines,
teaching, rivalries, and grief — and a monster that kills one
of them, paces the treeline, and is never itself killed. The
sense gap and the census gap are the same gap.

## Village assessment (plain words)

Five of these eight villages win through the lesser seat and go
home; three die, one of them before day 35. Seven reach national
standing at some point. But only three ever reach wave 4, only
two ever meet a wave-4 monster in a fight, and none ever kills
one. The village that goes furthest into the draft, 75104, is a
regional village that meets the Mirror Draft seven times in one
monster, loses every fight, watches a villager die to the second
Reunion, and dies itself the day after the last lost fight. The
village that fights the most wave-4 fights, 75101, loses six
turn-based fights to a single Eulogy and watches it melt on its
own final day — not killed, just gone, because a lost fight
against a non-lingering monster deletes it. If wave 4 is supposed
to be the System building monsters out of us, on this band it
built them, introduced them, and watched us lose to them without
ever landing a killing blow — for 47 median days of trying.

## Blanks filled or documented

- FILLED (answered, with numbers): the wave-4 encounter→kill
  conversion by channel on a fresh band — arrivals 11, engaged
  6 (54.5%), killed 0 (0% of engaged, 0% of arrivals), 24 fight
  events by channel (player-tb-world 13/0, villager-field 8/0,
  contest 2/0, other 1/0, raid-defender 0, trap 0,
  non-world-TB 0), outcomes still-present 9 / melted 2, faced-
  types 8 per-seed (6 distinct), raiders traced 5/5, wall
  numbers + death-cause shares + courtship activation. The
  narrowest stage is engaged → killed, not arrivals → engaged,
  on this band — a reversal of the w4funnel order, explained
  by the 47-day median window (not a contradiction: the
  funnel's binding stage moves when arrivals get time).
- FILLED (mechanism, read from code + corpus): why the first-pass
  analyzer overcounted fights (see Metric review) and why
  mismatch fights must not seq-link their bystander (the
  bystander-melt mechanism, second witness: 75101's eulogy
  under a feast-draw suburb fight and a contest algorithm
  fight; 75104's bright_idea under a contest algorithm fight).
- FILLED (negative, measured): the non-world-TB channel is
  EMPTY at wave 4 on this band (0 null-origin TB fights) — the
  w4funnel strike door did not reproduce, and the feast-draw
  and contest doors that did fire at wave 4 produced only
  mismatch losses.
- DOCUMENTED, NOT FIXED (named next blanks, below): the true
  faced-instance stage (needs a sighting recorder — a tooling
  blank, not a number); the evade/fight split in fight totals;
  the lingerer wound-reset question (a Steve design ruling,
  not a finding — the reunion's six restored losses are the
  evidence, same as the w4funnel suburb); the melt fiction-vs-
  mechanics gap (carried).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the panel corpus-ingest mode (tooling blank,
  fifth round — see below); the live rule-(3) firing band (per
  the 2026-10-27 16:02 call, no more low-defiance substrates
  are burned).

## Next-blank proposal (concrete next arm)

Next arm: a wave-4 lethality census, not another funnel census.
The funnel stages are now measured on four bands (w4funnel,
vetsurvive, standmeet, this one) and the binding stage has moved
to fight lethality: 13/13 player TB fights lost, 5/5 seq-linked
field fights without a kill, 2/2 contest fights lost. The next
arm should measure WHY wave-4 fights are never won — damage
dealt per fight by channel, monster HP remaining at fight end,
and the single-fight damage ceiling against 850-1500 HP monsters
with 0.2-0.5 pierce (the MONSTER-WAVES bands) — from the same
recorders (defwound mDealt/mHpLeft, tbEnd HP path, nwk fight
records), plus the scholar's and villagers' damage output in
those fights. Pre-registration sketch: (1) per wave-4 fight, damage
dealt, rounds, monster HP left, fighter HP left, by channel; (2)
the distribution of single-fight damage vs monster max HP (how
far is the closest loss?); (3) whether any channel ever deals
>50% of a wave-4 monster's HP in one fight. DIAG-GO when every
wave-4 fight on the band has a damage record and the closest-loss
gap is named. Rationale: this arm proved conversion is zero
across channels; the next arm must measure the damage gap
before any lever touches meeting rates, or the loops will keep
manufacturing meetings that end in losses.

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its five pre-registered GO legs (a) 8/8 valid (PASS),
(b) >= 95% classified (100%, PASS), (c) >= 90% fights + 100%
kills channel-attributed (24/24 fights; 0 kills, vacuous,
PASS with the stated caveat), (d) narrowest stage named
(engaged → killed, PASS), (e) sense thread read (75104, PASS).
Three method notes, each a proposal for the NEXT run, never a
revision of this one:

1. ANALYZER CORRECTION, INSTRUMENT-ONLY, CORPUS UNTOUCHED.
   The analyzer's first pass overcounted fights (33 events,
   `other` 10, unpaired tbEnds 9) through two errors, both
   found while reading the corpus against the raw rows and
   fixed in the analyzer before judging: (i) tbEnd pairing used
   day+type+result uniqueness, so same-day repeat fights
   (six reunion losses on d164) failed to pair and were
   counted twice — fixed to seq-based pairing (lift identity,
   preferring same day, then the nearest earlier start with
   that seq; the d165 reunion settlement pairs to a d164
   start); (ii) mismatch TB fights seq-linked their tile
   bystander (eulogy seq 31 under suburb/algorithm fights) —
   fixed to world-origin-only seq-linkage, with bystanderSeq
   recorded separately. After the fix: 24 events, `other` 1,
   unpaired tbEnds 0, engagement unchanged (6/11 — the
   bystander events never decided engagement, since the
   bystander's own fights engaged it anyway). The sweep corpus
   was not re-run and no number was hand-edited; the analyzer
   re-derives everything from the raw rows, and the corrected
   analyzer output is the corpus of record (analysis.json).
2. LEG (c) AT ZERO KILLS IS VACUOUS. With 0 kills, "100% of
   kills channel-attributed" holds without proving anything
   about kill attribution. The verdict stands (the prereg's
   zero-kill branch makes an empty kill table a completed
   census, and legs a/b/d/e are all substantive), but future
   channel preregs should pre-register the zero-kill reading
   of (c) explicitly: vacuous pass + the empty table as the
   finding, or a separate kill-attribution leg that only
   activates when kills > 0.
3. EVADES ARE NOT FIGHTS. Three unlinked field-fight rows are
   outcome evade, rounds 0, damage 0 — a villager meeting a
   wave-4 monster and leaving without a blow. They are counted
   in the 24 fight events as field-fight rows (they are
   fieldFight calls), but the blows-exchanged total is 21, not
   24. Future censuses should split evades from fights in the
   headline fight total; the conversion rates here (0% everywhere)
   are unaffected either way.
4. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (fifth round with this
   standing exception): the attempt built a cases/ dir from
   live roots within the 45s window, which is not a corpus
   panel, and it was removed after. No panel artifact was
   faked; the sweep table + analyzer output are the comparison
   of record. Same standing exception as the census-family
   corpora.
5. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline .../telemetry-
   baselines/scale-wall.json --current
   'evidence/2026-10-27/perseed-w4channel-a/*.json' --metrics
   national,table,wins,exiled` -> 3 LOUD lines (national 12->0,
   table -69% 16->5, wins 16->0, n=10 files). Verdict: KNOWN
   ARTIFACT, no investigation, baseline NOT rolled. Two
   independent reasons, both documented (same as
   vetsurvive/standmeet/2036Z): (a) the baseline's own regime
   note forbids this comparison (a ~100%-win winseat suite vs
   a tableseat-nowait census substrate); (b) the field-shape
   artifact repeats (per-seed rows carry nationalEver/entered/
   won, not top-level national/table/wins paths; summary.json
   + analysis.json are the 9th and 10th files). The corpus's
   real wall numbers are nationalEver 7/8, table entered 5/8,
   wins 5/8. No exiled LOUD line.

## Infrastructure notes

- Sweep: scripts/test-w4channel-a-sweep.js, 8 seeds, ~13 min
  wall. Corpus: evidence/2026-10-27/perseed-w4channel-a/ (8 rows
  + summary.json + analysis.json + sense-75104.txt). Analyzer:
  scripts/test-w4channel-a.js (proof validator, all gates PASS
  post-correction). Sense: scripts/test-w4channel-a-sense.js
  (NON-MEASURED replay only).
- Safe-commit index clobber hit BOTH pre-sweep commits (prereg +
  sweep bc302ea82, analyzer + sense 1c5b3048) — the known class:
  commit correct, main index showing bogus staged deletions +
  untracked twins. Repaired via HEAD-blob cacheinfo both times,
  verified with git status --short empty + git diff HEAD empty,
  before any sweep ran. The corpus/evidence commit below must be
  checked the same way before this run is called done.
- No EPERM flap blocked this run's writes; all rows wrote first
  try. No jest run: zero src/js changed, and the arm proofs are
  the attributable verification (per the census-family precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the sense
  script only READS beats on a replay, it adds none to the game).
- Commit: sim-w4channel-a, GO (census complete, conversion zero
  across channels), zero src/js diff. Branch ready, pending
  coordinator merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
