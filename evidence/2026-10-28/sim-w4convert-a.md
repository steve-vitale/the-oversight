# sim-w4convert-a — the wave-4 encounter -> kill conversion census: met, fought, and killed nothing

Run: fleshout loop, run fleshout-20261028T0416Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4convert-a. Backlog #1267
(census) + #1268 (killer identity as a first-class field).
Worktree: `~/workspace/worktrees/sim-w4convert-a` (branch
sim-w4convert-a).
CENSUS / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever, no meeting-rate change, no lethality re-judgement.
The lethality verdict is NOT re-scored here. No [needs-eyes]
applies (measurement only, no narration or behavior added — the
sense script only READS beats on a replay).

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-w4convert-a-prereg.md (commit 651fddd18).
Corpus: evidence/2026-10-28/perseed-w4convert-a/ (8 rows +
summary.json + analysis.json). Instruments (new this arm, plus
the w4damage stack reused verbatim): scripts/test-w4convert-
sweep.js (copy of the w4damage sweep, differing ONLY in corpus
dir, labels, mode label, and one sweep-side read-only addition:
a daily scholar-history capture — {day, scholarId} from the
Game.villagerId property read — so killer classification
survives scholar succession), scripts/test-w4convert.js
(analyzer / proof validator), scripts/test-w4convert-sense.js
(non-measured replay only).
Detgate: PASS (seed 75101, baseline vs recorders-OFF: days
132/132, gameDays 132/132, tsNationalDay 77 both, no diag
surface, no wraps installed, post-setup world 0) — on the OLD
numbers exactly, so no detgate amendment was needed.

## Plain words first

The village meets wave 4 and kills nothing — and this census
says why, in two halves.

First half: a lot of wave-4 monsters are never met at all. Of
51 wave-4 monsters born on this band, 20 (39%) never had a
single recorded meeting — no field fight, no raid fight, no
turn-based fight, not even a raid draft. Most of them were
still standing in the treeline when the run ended. All three
heralds — the scripted titan scouts — were never met on any
seed. And one seed (75101) unlocked wave 4, won the lesser
seat, and never spawned a single wave-4 monster in the world
at all: the door opened and nobody walked through it before
the game ended.

Second half: the 31 monsters that WERE met were fought — and
still killed nothing. Field fights end one of two ways: the
villager runs, or the villager dies. Never the monster. The
turn-based fights end one way: the village party loses, every
single time (25 world-origin turn-based fights, 25 losses).
The raid channel is mostly a toll booth, not a fight: 22
monsters were drafted to Haven, but only 4 were ever fought
there — 12 were tolled at the wall and never fought at all.
And the wall itself is the biggest wound-maker that counts
for nobody: the most-damaged monster on the band took 900
damage, three-quarters of its health, almost all of it from
the wall — and walked away, because wall damage floors at 1
and belongs to no killer, and the turn-based fights that
followed kept handing health back (in 23 of 25 turn-based
fights, the monster ended with MORE health than it started
the fight with — the turn-based fight scales the monster up
and the loser restores it at the higher number).

So the zero is not one mystery. It is three stacked facts:
two-fifths of wave-4 monsters are never met; the ones met in
the field are fought by villagers who deal 0–33 damage and
then flee or die; and the ones met in turn-based fights are
fought by a party that always loses against a monster whose
health goes up, not down, in the fight. No channel in the
game, as measured, can accumulate damage toward a wave-4
kill — the field chips, the wall wounds without owning, and
the turn-based fight restores.

## Verdict: GO (binding prereg, no re-score)

GO required 8/8 seeds complete + every wave-4 faced instance
classified faced/engaged/killed with channel + killer identity
+ unclassified faced instances = 0 + conversion rates by
channel + at least one mechanism hypothesis for zero
conversion grounded in the counts (not a lever claim).

- (a) 8/8 configs valid: PASS. 8 rows, days > 0, every recorder
  clean (errs 0 on all eight recorders, no overflow), w4damage
  snapshots present on every seed, scholar history present on
  every seed.
- (b) Parity vs the w4damage corpus: PASS, EXACT, on all 8
  seeds and all 13 checks per seed (days, gameDays, won,
  waveReach, nationalEver/Final, table, entered, deathTotal,
  courtship combined, wave-4 defwound rows by context, wave-4
  nonworldkill starts, wave-4 spawn seq sets). Detgate PASS
  proves recorder neutrality; the scholar-history read is
  pure (a property read, no RNG moved — parity exact proves it).
- (c) Census complete: universe 51, faced 31, engaged 29,
  killed 0, never-met 20, met-but-no-kill 31, multi-touch 19,
  vanished 0, unclassified 0 (after the analyzer fix disclosed
  below — the first run's 2 unclassified records were
  non-world expedition fights mis-bucketed as world touches,
  not census gaps).
- (d) Conversion rates by channel: reported below (field
  16 -> 16 -> 0; raid 22 -> 4 -> 0; TB 18 -> 18 -> 0).
- (e) Mechanism hypothesis grounded in the counts: see
  "Mechanism hypothesis" below (three stacked facts, each
  with its counts — not a lever claim, and no fix is proposed
  by this census arm).
- (f) SENSE: PASS (sense seed 75103 by the prereg's
  deterministic rule — tied 9 faced with 75106, lowest seed
  wins — window d106-d180; see "Sense note" below).

VERDICT: GO. The census is complete and the zero is
explained, not just counted. A complete census showing 0
kills is a GO census with a 0-conversion finding — the
prereg forbids re-scoring a kill-rate disappointment as a
census failure, and this run does not do so.

ANALYZER-FIX DISCLOSURE (read this before trusting the
verdict): the analyzer's FIRST run judged mechanical FAIL
(unclassified = 2, one each on 75102 and 75103). That was an
instrument bug, not a census gap, and it was fixed and
re-proved without touching the corpus or re-sweeping: the
two records were w4damage fieldFight rows with seq null,
worldMonster FALSE, caller 'other', stack
expeditionMonster/expeditionLeg — expedition-leg fights
against monsters that are never world spawns. The first
analyzer fed them into the world-instance touch path, which
counted them as unattributed world touches. The fix buckets
them as non-world field fights (the prereg's 'other'
channel, reported with citation, never folded into
field/raid/TB), exactly as the prereg's non-world TB
reconciliation already did for turn-based fights. The GO rule
itself was NOT changed, the prereg was NOT re-scored, the
corpus was NOT re-swept, and the original FAIL run is
disclosed here rather than hidden. The analysis.json in the
corpus is the re-run's output (mechanical PASS).

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single arm, tableseat-nowait VERBATIM.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max). Sweep wall time ~9 min for 8 seeds (plus detgate
  ~2 min and sense replays).
- Base: bcf137c40, POST-w4damage (3264dbb80 is an ancestor).
  Master did not move under this run; no rebase was needed.
- Substrate-activation gate: band courtship combined = 121
  (identical to the w4damage band, as exact parity requires),
  seeds active 8/8 — GATE PASSES (combined > 0 and >= 6/8
  active). No inactive seed on this band.

## Wall numbers (THIS band only, never pooled)

| field | this band (75101-75108) | w4damage band |
|---|---|---|
| national ever / final | 7/8 / 5/8 | 7/8 / 5/8 |
| table invited / entered | 6/8 / 3/8 | 6/8 / 3/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 3/8 (3 / 0) |
| wave-4 unlock | 5/8 | 5/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 162d (days: 90, 114, 132, 146, 162, 177, 180, 180) | 162d |
| deaths total | 299 | 299 |

Per-seed ends: 75101 won lesser d132 (wave 4, national, zero
wave-4 world spawns); 75102 village-lost d177 (wave 4,
global); 75103 survived d180 (wave 4, regional, table
invited, never entered); 75104 won lesser d90 (wave 3,
national, never unlocked wave 4); 75105 won lesser d162
(wave 3, global, never unlocked wave 4); 75106
village-lost d146 (wave 4, regional); 75107 survived d180
(wave 3, global, never tabled, never unlocked wave 4);
75108 village-lost d114 (wave 4, regional, 2 starvation
deaths). Arc IV (table entered): 3/8. All three wins are
lesser-seat wins. The full seat is still nobody's story;
wave 5 is still unreached.

## The conversion table (the judged measurement)

Universe = 51 fresh wave-4 world spawns (spawnsrc seqs).
Faced = >= 1 encounter record for the seq. Engaged = >= 1
fight row with rounds >= 1. Killed = vKill row, removal-kind
kill, or a won TB fight with the monster dead (see prereg
for the exact definitions).

Band totals (an instance touched by two channels counts in
both channels' faced counts but once in the band total —
the per-channel rows sum ABOVE the band total when instances
multi-touch, and that is stated, never hidden):

| channel | faced | engaged | killed | engaged/faced | killed/engaged | killed/faced |
|---|---|---|---|---|---|---|
| field | 16 | 16 | 0 | 1.000 | 0 | 0 |
| raid | 22 | 4 | 0 | 0.182 | 0 | 0 |
| TB | 18 | 18 | 0 | 1.000 | 0 | 0 |
| BAND (distinct instances) | 31 | 29 | 0 | 0.935 | 0 | 0 |

Band funnel: 51 spawned -> 31 faced (61%) -> 29 engaged
(94% of faced) -> 0 killed (0% of engaged). The funnel does
NOT narrow at engagement — faced monsters almost always get
fought. It narrows at the kill step, completely, in every
channel, and at the meeting step, where 20 never get faced.

Raid-channel anatomy (the channel that looks biggest and
fights least): of 22 raid-faced instances, 12 were
raid-drafted-only (tolled at the wall, no defender fight
row, no field fight row — drafted, tolled, released), 4 were
engaged through a raid defender fight, and the remaining 6
were raid-drafted AND fought through another channel
(field or TB). The raid draft is mostly a toll-and-release,
not a fight: the game's own narration says so on the sense
seed (d116: "Nobody met The Audit — it's still out there at
the treeline").

Field-channel anatomy: 39 field fight rows across the band
(75103: 7, 75106: 16, 75108: 16, 75102: 0) on 16 instances,
every one engaged (rounds >= 1), every one ending vFlee or
vDie — never vKill, never mFlee. Total field damage on the
band: 432 (75103: 120, 75106: 133, 75108: 179), per-fight
0–33, per-fight mean ~11. Nine of 75106's 16 field fights
dealt exactly 0 damage. A field fight is a villager meeting
a monster with 850–1500 HP, dealing about 11 damage, and
then running or dying.

TB-channel anatomy: 25 world-origin TB fights on 18
instances, every one engaged, every one ending 'lost'
(75102: 9, 75103: 6, 75106: 8, 75108: 2). Zero 'won', zero
'routed' among world-origin wave-4 TB fights. In 23 of 25,
the monster ended the fight with MORE health than the world
monster had when the fight started (TB end HP vs the
recorder's tile HP at fight start) — the turn-based fight
scales the monster's health up (e.g. 75103 seq 64 suburb:
tile 975 -> TB end 3688/3688; seq 60 suburb: 954 -> 2554;
seq 59 algorithm: 750 -> 2374), and the lost fight's
lingerer restore writes the higher number back into the
world. The two exceptions are the band's only real dents:
75103 seq 48 audit, 17 rounds, tile 825 -> TB end 499/1214
(the longest TB fight on the band — and the party still
lost, and the monster later left by departure, not death);
75102 seq 21 reunion, one late fight 1200 -> 1153.

## Per-seed census

| seed | days | universe | faced | engaged | killed | never-met | met-no-kill | deed-faced w4 types |
|---|---|---|---|---|---|---|---|---|
| 75101 | 132 | 0 | 0 | 0 | 0 | 0 | 0 | influencer |
| 75102 | 177 | 8 | 6 | 4 | 0 | 2 | 6 | audit, eulogy, reunion, suburb |
| 75103 | 180 | 15 | 9 | 9 | 0 | 6 | 9 | algorithm, audit, eater, eulogy, influencer, strike, suburb |
| 75104 | 90 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 75105 | 162 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 75106 | 146 | 13 | 9 | 9 | 0 | 4 | 9 | algorithm, audit, eater, eulogy, influencer, reunion |
| 75107 | 180 | 0 | 0 | 0 | 0 | 0 | 0 | — |
| 75108 | 114 | 15 | 7 | 7 | 0 | 8 | 7 | eulogy, reunion, suburb |
| BAND | — | 51 | 31 | 29 | 0 | 20 | 31 | — |

Per-seed notes:

- 75101 (the unlocked-but-empty seed): wave 4 unlocked, won
  lesser d132, zero wave-4 world spawns, zero wave-4 field
  rows. Its one deed-faced wave-4 type (influencer) comes
  from a single non-world TB fight (d131, null-origin
  influencer, lost). The wave-4 story on this seed is a
  turn-based fight against a monster that was never in the
  world. Without the non-world reconciliation, this seed
  would look like a census miss; with it, it reconciles
  exactly.
- 75102 (the no-field-fight seed): zero wave-4 field rows
  at all. All 6 faced instances were met via raid draft
  and/or TB (channel sets: TB+raid x4, raid-only x2, of
  which both raid-only instances were never engaged). Its
  9 TB fights are all lost, including 6 against a single
  reunion instance (seq 21, d172-d174) that absorbed 900
  toll damage across raids — the most-damaged instance on
  the band, 75% of its 1200 max HP, field damage 0 — and
  still walked away (removed by player-fight-melt after
  the final lost TB fight, never killed).
- 75103 (the sense seed): the widest deed-faced set (7
  types) and the band's only 17-round TB fight (seq 48
  audit, d117, lost, 499/1214). Field fights: 7 rows, all
  1–2 rounds, outcomes vFlee x6 + raid vDie x1, damage
  15–28 per fight. The raid defender fight that killed a
  villager (seq 59 algorithm, d158, elijah_scott, vDie,
  0 damage dealt, 87 taken) is the band's starkest field
  line: the defender died without landing a blow.
- 75104 / 75105 / 75107: never unlocked wave 4 (waveReach
  3), zero spawns, zero deed-faced wave-4 types. They are
  not conversion failures — they are pre-wave-4 runs, and
  they belong in the denominator of the band (8 seeds)
  but not in the universe (51 instances).
- 75106: 13 spawns, 9 faced, 9 engaged, 0 killed. Field
  fights 16 rows, damage 133 total, nine 0-damage rows.
  The prior band's known instances re-derive here (seq
  47 algorithm, seq 55 eulogy, seq 57 eulogy, seq 58
  eater) — the census reproduces the w4damage corpus's
  cast exactly, as parity requires.
- 75108: 15 spawns, 7 faced, 7 engaged, 0 killed; the
  highest never-met count (8). Field fights 16 rows,
  damage 179 total. One never-met instance (seq 39
  eulogy) left by departure-lost-trail without ever being
  faced — the only never-met instance not still present
  at end.

## The never-met vs met-but-no-kill split

- Never-met: 20/51 (39%). End-states: 19 still present at
  run end, 1 removed by departure-lost-trail (75108 seq 39
  eulogy). Vanished (neither present nor removed): 0. By
  seed: 75102: 2 (herald, reunion); 75103: 6 (herald,
  3x reunion, eater, congregation); 75106: 4 (herald,
  2x eulogy, influencer); 75108: 8 (algorithm x2, eater,
  2x reunion, strike, eulogy, congregation). All three
  scripted-titan heralds on the band were never met.
  Spawn sources of the never-met: tile-entry dominates
  (the never-met are not a spawn-source artifact — they
  spawned the normal way and were simply never met).
- Met-but-no-kill: 31/31 faced instances (100%). Last
  outcomes: TB lost (with or without a field fight) for
  17, field vFlee for 9, field vDie for 5 (counts overlap
  by last-recorded outcome per instance; see analysis.json
  for the per-instance table). No faced instance ended
  in a kill, a monster flee that counts as a kill, or a
  removal-kind kill.
- The split matters because the two halves need different
  work (see "Named next step"): never-met is a meeting
  problem (routing, spawn placement, raid drafting that
  never becomes a fight); met-but-no-kill is a fighting
  problem (field damage trivial, TB always lost, TB
  health scaling upward). A lever that only raises meeting
  rates would feed more monsters into the 0%-kill funnel;
  a lever that only raises damage would still leave 39%
  unmet. Neither is proposed by this census arm — the
  census names the split so a fix arm can aim at the
  right half.

## Killer identity (backlog #1268, first-class field)

Kills on this band: 0. The killer-identity field is therefore
EMPTY by fact, not by missing data — every kill slot in
analysis.json is present and empty, and the analyzer's
killer-attribution leg (killed instances with unattributed
killer = 0, vacuously) passes. What the census DOES record,
as the "who tried" roster for a future kill to be attributed
against:

- Field defenders (vid, verbatim, with outcomes): 75103:
  elijah_scott x3, lena_ruiz x2, jorge_silva x2; 75106:
  catalina_reyes x4, visjoin_102 x4, visjoin_115 x3,
  ingrid_vik, emma_larsen, visjoin_113, visjoin_111,
  visjoin_140; 75108: app_mgpsphm923 x4, diana_osei x3,
  giulia_bianchi x2, ava_garcia x2, hannah_kim x2,
  visjoin_103 x2, visjoin_90. None of them killed anything;
  the field outcomes for all of them are vFlee or vDie.
- TB kills: none, so no TB-party attribution arises. The
  recorder carries fighter keys (p + villager allies) but
  no killing-blow attribution, so a future TB kill will be
  reported as 'scholar-led TB party' with its fighter-key
  list — never an invented individual (see prereg).
- Scholar-history instrument (new this arm, proven by this
  band): the scholar changed repeatedly DURING the wave-4
  window — 75103: 11 scholar changes across the run,
  including d117, d118, d126, d129, d146, d159, d160, d174,
  d179; 75106: 12 changes; 75102: 6; 75108: 8. An
  end-of-run scholar id would misclassify every earlier
  scholar-as-defender as a villager. The daily scholar
  history in each corpus row (scholarHistory) is what makes
  the day-matched classification in the prereg possible;
  on a band with kills, it will be the difference between
  a true scholar/villager split and a wrong one. On this
  band it is exercised and empty — the machinery is proven,
  the kills are not there to classify.

## Faced kinds per seed

Spawn sources over the 51-instance universe (spawnsrc
classification, as the engine records them): tile-entry 45,
scripted-titan 3 (the three heralds, all never met),
maintain 3 (all on 75102: seq 25 suburb faced TB+raid,
seq 27 reunion never met, seq 28 eulogy raid-only).
Wanderer-contact: 0. Unknown/other: 0. Per seed: 75102:
tile-entry 4, scripted-titan 1, maintain 3; 75103:
tile-entry 14, scripted-titan 1; 75106: tile-entry 12,
scripted-titan 1; 75108: tile-entry 15; other seeds: no
wave-4 spawns. The spawn story is overwhelmingly
tile-entry — monsters appearing where the scholar steps —
not a maintain-cap or wanderer-cast story.

Deed-faced wave-4 types (type-level, value = wave, from
deedState().wavesFaced — a type fought blow-by-blow at
least once, never a count and never a kill count): 75101:
influencer (via the non-world TB fight only); 75102:
audit, eulogy, reunion, suburb; 75103: algorithm, audit,
eater, eulogy, influencer, strike, suburb; 75106:
algorithm, audit, eater, eulogy, influencer, reunion;
75108: eulogy, reunion, suburb. The deed gate's wave-4 bar
(3 distinct types fought) is met on 75102, 75103, 75106,
and 75108 — the deed bar is NOT the binding constraint on
this band; kills are.

Encounter-channel counts (instances touched, multi-touch
counted in each channel): field 16, raid 22, TB 18,
multi-touch 19 (instances touched by 2+ channels).
Channel sets: TB+raid is the commonest multi-touch shape
(75102 x4, 75103 x5, 75106 x2); full TB+field+raid x6
across the band (75103 x1, 75106 x4, 75108 x1).

## Non-world reconciliation (so the totals close)

Non-world wave-4 fights — faced in the deed sense, NOT
world instances, NOT in the 51-universe:

- Non-world TB fights: 3. 75101 d131 null-origin
  influencer (lost); 75103 d126 null-origin eulogy
  (lost); 75106 d143 world-origin-mismatch audit
  (argued audit, tile monster a wave-1 cliffhanger seq
  3, lost). All lost, all unattributed to any world seq.
- Non-world field fights (expedition legs): 2. 75102
  d146 suburb, expeditionMonster caller 'other', evade,
  0 rounds, 0 damage, villager gen_0x2wi4u; 75103 d141
  algorithm, expeditionMonster caller 'other', vDie,
  1 round, 21 damage dealt, villager app_mgpsphm081
  died. The expedition channel meets wave 4 and, on
  this band, evades it or dies to it — it does not kill
  it either. (These are the two records the first
  analyzer run mis-bucketed; see the disclosure above.)
- Reconciliation check: universe 51 + non-world TB 3 +
  non-world field 2 = 56 wave-4 fight-relevant records
  classes; deed-faced types per seed reconcile as noted
  (75101's influencer is explained by its non-world TB
  fight, not by a missing world spawn).

## Mechanism hypothesis (grounded in the counts, not a lever claim)

One hypothesis, in three stacked facts, each with its
counts:

1. MEETING IS THE FIRST FILTER (20/51 never met, 39%).
   Monsters spawn (45/51 tile-entry) and then sit in the
   treeline. Raid drafting touches them (22 drafted) but
   mostly does not convert the draft into a fight (12
   drafted-only). Heralds (3/3) are never met at all.
   Something about where wave-4 monsters spawn relative
   to where villagers actually go, or about how raid
   drafts resolve without a defender meeting, keeps
   two-fifths of the wave out of every fight channel.
2. FIELD FIGHTS CANNOT ACCUMULATE A KILL (39 rows, 432
   total damage, 0 kills, outcomes only vFlee/vDie).
   Per-instance field damage tops out at 82 (75106 seq
   46 influencer, across its fights) against an 850 max
   HP — and the toll, not the field, supplies most of
   every instance's damage (band per-instance damage
   leaders are toll-led: 900, 368, 366, 346, 325). A
   villager dealing ~11 per fight, 1–2 rounds, then
   fleeing or dying, cannot walk a 850–1500 HP monster
   to zero across any plausible number of re-meets —
   and re-meets are limited anyway (field rows per
   instance: mostly 1–3, band max 6 on 75108 seq 30
   eulogy, which still ended unfought-to-death at 11
   total field damage).
3. TURN-BASED FIGHTS RESET THE BOARD UPWARD (25/25 lost;
   23/25 end with monster HP >= fight-start world HP).
   The turn-based channel does not merely fail to kill —
   it actively undoes the other channels' work, because
   the lingerer restore writes the TB-end health (scaled
   up, e.g. 975 -> 3688) back into the world. The
   w4damage arm proved the restore mechanism (+65 on one
   instance); this census proves its DIRECTION is
   systematically upward on wave 4 (23/25), not a
   one-instance curiosity. Until a TB fight can be won,
   or TB-end health stops exceeding world health, the
   TB channel is a health fountain for wave-4 monsters,
   not a kill channel.

None of this is a lever claim and none of it is a fix
proposal: it is the census's answer to "why zero," with
each leg countable in analysis.json. Whether meeting,
field damage, or TB scaling is the right half to aim at
first is a fix arm's call, from Steve's standing intent
— and the split above (never-met vs met-but-no-kill) is
the map for that call.

## Named next step

A fix arm (not this census arm) should pick ONE half of
the split and pre-register against it, using this corpus
as its baseline: either (a) the meeting half — why 12/22
raid drafts never become a fight and why 3/3 heralds are
never met (instrument already exists: raidTick changes +
defwound raid rows + spawnsrc, no new recorder needed);
or (b) the TB half — why TB monster health scales above
world health and whether a won TB fight is reachable at
all on the current party builds (instrument: the NWK +
tbdmg + oldcore join in this corpus, no new recorder
needed). The field half needs no new instrument either
(defwound rows already carry mDealt/vTaken/rounds/vid).
Whichever half is picked, its GO threshold should be a
KILL (or a fought-and-won TB fight), not a meeting count
— this census proves meetings already happen and convert
at 0%, so a meeting-count GO would declare victory over
the wrong funnel step.

## Sense note (75103, NON-MEASURED replay, window d106-d180)

The sense rule picked 75103 (9 faced, tied with 75106,
lowest seed wins). The window's first faced-not-killed
instance is seq 48 audit: raid-drafted d116, then a
17-round turn-based fight d117, lost, monster ending
499/1214 — the band's longest TB fight and its only real
dent below fight-start health. In plain words, from the
measured corpus plus the replay's matching narration
(the replay is non-measured and its trajectory shifts;
the counts above are the corpus's, not the replay's):

On the night of d116, three raiders came over the wall —
Ugly-Eyes, the Audit, the Eater — and the wall's stakes
took their toll (audit 1100 -> 825, eater 950 -> 712).
And then, in the game's own words from the replay: "Nobody
met The Audit — it's still out there at the treeline."
Nobody met the Eater either. The raid came, the wall bit,
and no defender fought anyone. The next day the scholar's
party took the Audit on in a turn-based fight that ran 17
rounds — the longest fight of its kind on the band — and
still lost, with the monster at 499 of a scaled 1214.
Seventeen rounds of fighting, and the village's best
turn-based result against wave 4 is a loss with the
monster still standing. Later in the window the pattern
repeats in miniature: a villager meets a Strike in the
field (d149, lena_ruiz, 16 damage dealt, 43 taken, flees),
another meets an Influencer (d155, elijah_scott, 22
dealt, 41 taken, flees), and a raid defender meets an
Algorithm and dies without landing a blow (d158,
elijah_scott, 0 dealt, 87 taken). The village is not
passive — it meets these monsters, it fights them, it
talks about them at the fire ("everyone's talking about
it now") — and it never, in this window, kills one. The
sense reading matches the census exactly: meetings happen,
fights happen, kills do not.

## Parity (exact)

The analyzer's parity table (this band vs the w4damage
corpus, same seeds/policy/substrate) matches EXACTLY on
all 8 seeds and all 13 checks per seed: days, gameDays,
won, waveReach, nationalEver/Final, table, entered,
deathTotal, courtship combined, wave-4 defwound rows by
context, wave-4 nonworldkill starts, wave-4 spawn seq
sets. Per-seed days: 132/177/180/90/162/146/180/114 on
both sides. The detgate (132/132, tsNationalDay 77 both)
proves the scholar-history addition is neutral. No
divergence to diagnose; no re-score against any retired
corpus; the lethality verdict is untouched.

## Metric review (filled at judging time)

- ANALYZER FIX, NOT A METRIC CHANGE. The first analyzer
  run judged mechanical FAIL (unclassified 2) because
  expedition-leg field fights were fed into the world
  touch path. The fix changed the instrument's channel
  assignment to match the prereg's own definitions
  (universe = world spawns; 'other' records reported
  with citation, never folded into field/raid/TB) — not
  the GO rule, not the prereg, not the corpus. The
  original FAIL run is disclosed in the Verdict section.
  A future prereg that wants to forbid post-hoc analyzer
  fixes should say so explicitly; this run's prereg
  explicitly allowed instrument-bug fixes with disclosure
  (pilot-gate clause), and that clause was followed.
- KILLER-IDENTITY EMPTINESS. The prereg's GO rule requires
  killer identity for every killed instance; with 0 kills
  that leg passes vacuously. That is the honest reading,
  not a gap: the field is implemented (vid + day-matched
  scholar classification + TB-party fallback), exercised
  on the defender roster, and empty because there are no
  kills to classify. A future band WITH kills is the real
  test of the field, and this corpus's scholar histories
  are the instrument it will need.
- TB HEALTH COMPARISON. The 23/25 "monster ends higher"
  count compares TB fighter HP at tbEnd to the recorder's
  tile HP at fight start. TB fighter HP is a scaled
  quantity (party/level scaling inside startCombat), not
  the world HP — so the comparison measures the
  fight's net effect on the world monster THROUGH the
  lingerer restore (which writes TB-end health back),
  not damage dealt inside the fight. That is the right
  comparison for the kill question (does the world
  monster get closer to death?), and the w4damage arm's
  restore join proves the write-back mechanism. A future
  arm that wants pure in-fight damage should join TB
  round-by-round fighter snapshots, which no current
  recorder captures.
- PANEL. scripts/balance-panel.js has NO corpus-ingest mode
  for a single-arm census corpus (standing exception,
  fifth-plus round): the tool builds panels from live
  roots and compares panel files (`compare --before
  <panel.json.gz> --after <panel.json.gz> --out <prefix>`),
  not census rows. No panel artifact was faked; the paired
  sweep tables + analyzer outputs (parity EXACT) are the
  comparison of record, as the section-15 substitute.
  This arm changes nothing in the game, so the panel is
  expected to show zero movement; it shows none, because
  there is no panel to move.
- TELEMETRY DEVIATION CHECK (loop body step 10):
  `node scripts/telemetry-check.js --baseline .../telemetry-
  baselines/scale-wall.json --current
  'evidence/2026-10-28/perseed-w4convert-a/*.json' --metrics
  national,table,wins,exiled` → 3 LOUD lines (national
  12→0, table −62% 16→6, wins 16→0, n=10 files). Verdict:
  KNOWN ARTIFACT, no investigation, baseline NOT rolled.
  Two independent reasons, both documented (same as the
  census family): (a) the baseline's own regime note
  forbids this comparison (a ~100%-win winseat suite vs a
  tableseat-nowait census substrate); (b) the field-shape
  artifact repeats (per-seed rows carry
  nationalEver/entered/won, not top-level
  national/table/wins paths; summary.json + analysis.json
  are the 9th and 10th files). The corpus's real wall
  numbers are nationalEver 7/8, table entered 3/8, wins
  3/8. No exiled LOUD line.

## Infrastructure notes

- Sweep: scripts/test-w4convert-sweep.js, 8 seeds, ~9 min
  wall + detgate ~2 min + sense replays. Corpus:
  evidence/2026-10-28/perseed-w4convert-a/ (8 rows +
  summary.json + analysis.json). Analyzer:
  scripts/test-w4convert.js (proof validator; exit 0 on
  the re-run, mechanical PASS, unclassified 0). Sense:
  scripts/test-w4convert-sense.js (NON-MEASURED replay
  only; 75103 window d106-d180).
- INDEX CLOBBER (loud, repaired, commit correct): after
  the prereg safe-commit (651fddd18), the worktree's main
  index showed the prereg file as a bogus staged deletion
  plus an untracked copy (worktree file byte-identical to
  HEAD, blob 92df4e93). Repaired via `git update-index
  --add --cacheinfo "100644,92df4e93,<path>"` and
  re-verified (`git status --short` empty, `git diff HEAD`
  empty). No reset, no stash touched, commit verified via
  `git show --stat HEAD`. The clobber class from the
  2026-10-22/23 register lessons, fourth sighting class;
  the same check runs after every safe-commit in this run.
- Run logs kept alongside the evidence (not in the corpus
  dir): the sweep's per-seed lines are in the run record;
  no separate sweep log file was kept for this arm (the
  summary.json + analysis.json carry the judged numbers).
