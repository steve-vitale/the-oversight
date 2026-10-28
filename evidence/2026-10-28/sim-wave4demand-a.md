# sim-wave4demand-a — the wave-4 demand census: the fights are not the demanded undertaking

Run: fleshout loop, run fleshout-20261028T1415Z. Axis: scale-onramp
(the blocking axis). Worker: sim-wave4demand-a.
Worktree: `~/workspace/worktrees/sim-wave4demand-a` (branch
sim-wave4demand-a).
CENSUS / MEASUREMENT ONLY — zero src/js changes, zero default flips,
no game lever. The demand side of the w4convert census: w4convert
found villages meet wave 4 and kill nothing; this arm asks whether
those fights were ever the demanded undertaking — a party, fully
geared — or solo / under-equipped play. No [needs-eyes] applies
(measurement only, no narration or behavior added — the sense
script only READS beats on a replay).

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-28/sim-wave4demand-a-prereg.md (commit 762b786a4).
Corpus: evidence/2026-10-28/perseed-wave4demand-a/ (8 rows +
summary.json + analysis.json). Instruments (new this arm):
scripts/policies/wave4demand-diag.js (recorder),
scripts/test-wave4demand-sweep.js (copy of the w4convert sweep +
demand layer), scripts/test-wave4demand.js (analyzer / proof
validator), scripts/test-wave4demand-sense.js (non-measured
replay only).
Detgate: PASS (seed 75101, baseline vs recorders-OFF: days
132/132, gameDays 132/132, tsNationalDay 77 both, no diag
surface, no wraps installed) — on the expected numbers exactly,
so no detgate amendment was needed. The analyzer re-runs the
detgate at judging time and it passed again there.

## Plain words first

No. The fights are not the demanded undertaking — and the
census says exactly which leg of the demand fails, in each
channel.

In the field, every single wave-4 fight is one villager
alone. Twenty-four field fights plus two raid fights, and
not one of them has a second fighter — not on paper (named
allies: zero, engine allies: zero, both agree) and not in
the fight (the fighting-party diagnostic: all 26 fought
solo). The lone villagers are all armed, about half wear
armor at P >= 10, and not one of them is a veteran — no
field fight on the band ever had a veteran in it. They deal
318 damage across 27 rows (13 rows deal exactly nothing),
then flee (18), die (8), or give it room (1 evade). The
field channel does not fail
the demand at the gear leg. It fails at the party leg,
completely, and at the veteran leg, completely.

In turn-based fights the picture is closer but still not
the demand: 21 of 24 are the scholar alone, 3 have a party
(2 + 1). Two fights — 2 of 24 — meet the full demand rule
(party, everyone armed, at least one armored at P >= 10, a
veteran present, village tricks >= 3). Both of them lost,
both to Audits. And the two fights that were WON were both
fights that did NOT meet the demand: a solo scholar beating
a Reunion (75102, day 172), and a two-fighter party with no
veteran beating a Suburb (75108, day 95). So on this band,
meeting the demand did not produce a win, and winning did
not require meeting it. Those are counts of two and two,
not a law — but they rule out the simple story that "if
only the fights had met the demand, they would have won."
The demand-met fights lost to the same monster type twice;
the wins came from under-equipped fights, and both winning
killers were dead by their run's end.

Underneath the fight level, the village itself is short
where the gate says it matters. At wave-4 fight starts the
village averages 2.88 armored (demand 3 — just short),
6.00 armed (demand 5 — met), 20.42 tricks (demand 3 —
saturated many times over, almost entirely by wave 1–2
counters), and 0.12 veterans (demand 1 — badly short).
Only 6 of 51 fight rows start while the village is ready
by its own gate (field 1/27, TB 5/24). The gate opens the
door once — a veteran exists, the armor counts — and then
the village fights wave 4 mostly unready, because the
veterans die (both of this band's wave-4 killers are in
the fallen list by run end) and the armor thins. The
binding legs, in order, are: party (0.06 of fights),
veterans (0.08 of fights have one), then armored depth —
not weapons (every participant in every classified fight
is armed) and not tricks (saturated).

The raid channel, again, is mostly a toll booth: 16
tolled-not-fought events across 14 monsters, against 2
fought raid fights (both solo, both fled). The wall wounds
without owning, same as w4convert found — and on this band
the village's own answer, in its own words from the sense
replay, is the muster beat: "scouts report The Eulogy
hunting near Haven, and it is beyond us. Everyone inside.
No one walks the treeline alone — the garden crews double
up, the hunters stand down. We outlast it." The village
does not fail to form the demanded party by accident. It
judges the monster beyond it and chooses not to take it on
as a party at all. That judgment is people-like — and it
is also the demand gap: the party never forms because the
village has decided, collectively, that it cannot win.

## Verdict: DIAG-GO (binding prereg, no re-score)

GO required census complete 8/8 seeds AND every wave-4
fight demand-classified or explicitly UNCLASSIFIED with a
count AND the demand-meet share per channel + demand-met
vs not-met outcome table published. No outcome threshold
gates GO; incompleteness or silently dropped fights fail it.

- (a) 8/8 configs valid: PASS. 8 rows, days > 0, every
  recorder clean (errs 0 on all nine recorders, no
  overflow).
- (b) Parity vs partyfinish CONTROL: PASS, EXACT, on all
  8 seeds and all 9 fields per seed (days, gameDays, won,
  waveReach, nationalEver/Final, table, entered,
  deathTotal) plus wave-4 defwound rows by context,
  wave-4 nonworldkill starts, and wave-4 spawn seq sets.
- (c) Reconciliation: PASS. Field rows 27 = 27 (field 24
  + raid 2 + other 1); TB starts 26 = 26 (world 24 +
  nonworld 2); unmatched TB ends 0; refused/threw/failed
  starts 0; unresolved TB 0.
- (d) UNCLASSIFIED: 0. Every wave-4 fight row carries
  complete participant gear + village tricks; nothing was
  dropped or assumed.
- (e) Cornered dormancy: PASS. 0 cornered wave-4 fights
  (the partyfinish mechanism is present in code but
  dormant on this substrate, as pre-registered).
- (f) Demand table: PASS. 50 classified world wave-4
  fights; per-channel meet shares (primary + all three
  secondary cuts + each leg's rate) and the demand-met vs
  not-met outcome table are published below.
- (g) SENSE: PASS (sense seed 75106 by the prereg's
  deterministic rule — most wave-4 fights, 25 — window
  d79-d146; see "Sense note" below).

VERDICT: DIAG-GO. The census is complete and the demand
answer is: the fights are solo, veteran-less, mostly
unready-village fights — not the demanded party+geared
undertaking. A complete census showing 4% demand-met is a
GO census with a 4%-demand finding.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single arm, tableseat-nowait VERBATIM.
- Horizon 180d DEATH-AWARE (runDays stops on death/win;
  +10d tail max). Sweep wall time ~10.5 min for 8 seeds
  (plus detgate ~80s x2 and sense replays).
- Base: branch tip e17a518f1 at worktree creation. Game
  code is EXACTLY partyfinish's game code (`git diff
  37aa0a4fb HEAD -- src/js` empty) — the cornered-party
  hold mechanism is present but dormant here (0 cornered
  fights, as asserted). Master did not move under this
  run; no rebase was needed.
- Substrate-activation gate: band courtship combined = 110
  (identical to the partyfinish control band, as exact
  parity requires), seeds active 8/8 — GATE PASSES
  (combined > 0 and >= 6/8 active). NOTE ON THE PREREG'S
  EXPECTATION LINE: the prereg expected 121 "from the
  partyfinish control band" — that number was the
  w4damage-era band's, not control's. Control's own
  combined is 110 (7+8+8+24+16+23+12+12), and this band
  matches it exactly. The expectation line was wrong, not
  the band; the gate itself (combined > 0, >= 6/8 active)
  passes either way, and no GO input depended on 121.
  Recorded here as a metric-review correction, not a
  re-score (see "Metric review").

## Wall numbers (THIS band only, never pooled)

| field | this band (75101-75108) | partyfinish control | w4convert band (era) |
|---|---|---|---|
| national ever / final | 7/8 / 6/8 | 7/8 / 6/8 | 7/8 / 5/8 |
| table invited / entered | 4/8 / 3/8 | (same rows) | 6/8 / 3/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 3/8 (3 / 0) | 3/8 (3 / 0) |
| wave-4 unlock | 6/8 | 6/8 | 5/8 |
| wave-5 unlock | 0/8 | 0/8 | 0/8 |
| median survival | 146d (days: 90, 102, 132, 132, 146, 180, 180, 180) | 146d | 162d |
| deaths total | 286 | 286 | 299 |

Per-seed ends: 75101 won lesser d132 (wave 4, national, zero
wave-4 world spawns, one non-world TB fight); 75102
village-lost d180 (wave 4, global, 10 spawns, 1 wave-4
kill); 75103 won lesser d132 (wave 4, global); 75104 won
lesser d90 (wave 3, national, never unlocked wave 4);
75105 survived d180 (wave 4, global, never tabled);
75106 village-lost d146 (wave 4, regional, table invited
never entered); 75107 survived d180 (wave 3, global,
never tabled, never unlocked wave 4); 75108 village-lost
d102 (wave 4, regional, 1 wave-4 kill, 1 starvation death).
Arc IV (table entered): 3/8. All three wins are
lesser-seat wins. The full seat is still nobody's story;
wave 5 is still unreached.

Death causes (band, verbatim cause strings): villager
cause 'combat' 110, villager cause 'villager combat' 80,
player arena 43, villager expedition 22, villager monster
14, ambush 4, sickness 5, player night 2, player contest
2, alien 1, toad-war-drum 1, starvation 1, thirst 1.
Combat dominates; starvation is a single death on this
band.

## The demand table (the judged measurement)

DEMAND-MET (primary, strict — prereg): party (n >= 2) AND
every participant armed AND armored-count >= 1 AND
veteran present AND village tricksKnown >= 3. Secondary
cuts: PARTY-ONLY (n >= 2), GEARED-PARTY (party + full
arming + armored >= 1), FULL-GATE-IN-FIGHT (party + full
arming + armored >= 3 + veteran + tricks >= 3). Rates are
over classified fights in the channel; UNCLASSIFIED = 0
in every channel.

| channel | n | party | full arming | armored >= 1 | veteran | tricks >= 3 | DEMAND-MET | PARTY-ONLY | GEARED-PARTY | FULL-GATE |
|---|---|---|---|---|---|---|---|---|---|---|
| field | 24 | 0.00 | 1.00 | 0.46 | 0.00 | 1.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| raid | 2 | 0.00 | 1.00 | 1.00 | 0.00 | 1.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| TB | 24 | 0.13 | 1.00 | 0.75 | 0.17 | 1.00 | 0.08 | 0.13 | 0.13 | 0.04 |
| ALL | 50 | 0.06 | 1.00 | 0.62 | 0.08 | 1.00 | 0.04 | 0.06 | 0.06 | 0.02 |

Read the legs, not just the conjunction: weapons bind
nothing (1.00 everywhere — every participant in every
classified fight is armed); tricks bind nothing (1.00
everywhere — the village always holds >= 3 counters, see
"Metric review" for why that leg is saturated); armor
binds mildly in the field (0.46) and little in TB (0.75);
party binds almost everything (0.06); veterans bind
almost everything (0.08). The demand fails first at
"a party", second at "a veteran in it".

Party-size histogram over the 50 classified fights: solo
47, party-of-2 2, party-of-3 1. Participants total 54:
all 54 armed, 35 armored at P >= 10. Engine-vs-named party
mismatch: 0 — the engine's allies count and the named
allies agree on every field row, so "solo" is not a
recorder artifact (every wave-4 field row has
engineAllies 0). Field callers: resolve 18, aid 6, raid
resolve 2 (plus 1 expedition 'other' evade). Field
fighters are ALL villagers (27/27 participants
non-scholar); the scholar never meets a wave-4 monster
in the field on this band — field meetings are a
villager-alone story, TB fights are a scholar-led story.

Village readiness at wave-4 fight starts (mean over the
50 classified fights, gate demand 3/5/3/1): armored 2.88,
armed 6.00, tricks 20.42, veterans 0.12. Only 6 of 51 fight
rows (field 1/27, TB-world 5/24) start while the village
is ready by its own gate. The gate is a door that opens
once and then the village decays below it: veterans die,
armor thins, and the fights go on anyway.

## Demand-met vs not-met outcome table

| channel | demand-met outcomes | not-met outcomes | unclassified |
|---|---|---|---|
| field | (none — 0 met) | vDie 8, vFlee 16 | — |
| raid | (none — 0 met) | vFlee 2 | — |
| TB | lost 2 | lost 20, won 2 | — |

Field damage (wave-4 field+raid+other rows, 27): total
318, max single fight 46, zero-damage rows 13. A lone
armed villager deals about 12 per meeting and then runs
or dies — the same shape w4convert measured (432 over 39
rows), on fewer fights.

## The two wins and the two demand-met fights (named, not pooled)

WINS (both NOT demand-met):
- 75102 d172, Reunion, solo scholar olivia_bennett
  (armed, armorP 26, not a veteran; village readiness
  armored 3, armed 5, tricks 21, veterans 0 — short only
  on veterans). Scholar-led TB win; the kill log records
  olivia_bennett via 'player', 1 wave-4 kill. By run end
  olivia is in the fallen list, dead.
- 75108 d95, Suburb, party of 2: ines_duarte (armed,
  armorP 66) + ruth_goldstein (armed, armorP 37), neither
  a veteran; village readiness armored 3, armed 3
  (short on weapons), tricks 21, veterans 0. The kill log
  records ines_duarte via 'player', 1 wave-4 kill. By run
  end ines is in the fallen list, dead.

DEMAND-MET (both LOST, both Audits):
- 75102 d166, Audit, party of 3: jesse_cortez (armed,
  armorP 42, veteran) + elena_petrova (armed, 26) +
  gen_ayapunj (armed, 15); village tricks 20. Lost.
- 75103 d117, Audit, party of 2: gen_d6fakvh (armed,
  armorP 67, veteran) + gen_hhpsohv (armed, 60); village
  tricks 19. Lost.

Veteran-present TB fights (4/24, ALL lost): the two
demand-met audits above, plus 75102 d176 Eulogy (solo
olivia_bennett, veteran by then — her veteran flag is
the d172 Reunion kill itself, wave-4 counting as wave-3+
for the veteran test) and 75106 d89 Eulogy (solo
marcus_webb, armorP 36, veteran). No field fight ever
had a veteran participant (0/26).

Killer identity (first-class, per kill): 2 wave-4 kills
on the band, both scholar-led TB wins (above), both
killers dead by run end. Field/raid kills: 0. TB-party
attribution is 'scholar-led TB party' with the fighter
list — no individual is named for a TB kill beyond the
scholar vid the log itself records (olivia_bennett,
ines_duarte, each verified against the daily scholar
history: olivia was scholar on d172, ines on d95).
W4convert's band had 0 kills; this band's 2 kills are an
era difference (intervening code, including the
partyfinish mechanism — dormant here — and the
betrayal/comms/game.js changes between bcf137c40 and
8e26af922), NOT a parity break: parity is judged against
partyfinish control, which shares this code, and it is
exact (see below).

## Per-seed fight counts

| seed | field | raid | TB-world | other | TB-nonworld | unclassified |
|---|---|---|---|---|---|---|
| 75101 | 0 | 0 | 0 | 0 | 1 | 0 |
| 75102 | 0 | 0 | 11 | 1 | 0 | 0 |
| 75103 | 0 | 0 | 2 | 0 | 0 | 0 |
| 75104 | 0 | 0 | 0 | 0 | 0 | 0 |
| 75105 | 0 | 0 | 0 | 0 | 0 | 0 |
| 75106 | 15 | 1 | 8 | 0 | 1 | 0 |
| 75107 | 0 | 0 | 0 | 0 | 0 | 0 |
| 75108 | 9 | 1 | 3 | 0 | 0 | 0 |
| BAND | 24 | 2 | 24 | 1 | 2 | 0 |

Seeds 75104/75105/75107 contribute no wave-4 fights:
75104 and 75107 never unlocked wave 4 (waveReach 3);
75105 unlocked wave 4 with a single spawn (w4spawns 1)
that was never fought. They belong in the band denominator
(8 seeds) but not in the fight table.

## Raid toll section

Tolled-not-fought events (demand raidTick change rows,
wave 4, no in-window fight for their seq): 16 events
across 14 distinct seqs — 75102: 7, 75103: 2, 75106: 6,
75108: 1. Fought raid fights: 2 (both solo, both vFlee).
Tolled is a LOWER BOUND on drafted (prereg instrument
note): a raider drafted when the wall is 0 (no palisade)
leaves no HP-change trace and no fight row, so it is
invisible to this instrument; the fought count is exact.
Raftdraft draftedByWave counts are consistent in shape
(drafted wave-4 raiders present on every wave-4 seed) but
carry no seqs, so no seq-level join is claimed.

## Non-world reconciliation (so the totals close)

- TB-nonworld: 2. 75101 d131 null-origin Influencer
  (solo scholar jorge_silva, armed, armorP 11, lost) —
  the same non-world fight w4convert reconciled on this
  seed (deed-faced influencer with zero world spawns).
  75106 d143 world-origin-mismatch Audit (argued audit,
  tile monster a wave-1 cliffhanger seq 3; party
  chantal_mukendi + visjoin_115, lost) — the same
  mismatch class w4convert reported. Both lost, both
  unattributed to any world seq, both outside the 50
  world fights.
- Other channel: 1. 75102 expedition-leg field fight,
  evade, 0 rounds — the expedition channel meets wave 4
  and gives it room, as w4convert found.
- Reconciliation check: field rows 27 (24 + 2 + 1) +
  TB starts 26 (24 world + 2 nonworld) = 53 wave-4 fight
  records, of which 50 are the world demand table, 2 are
  TB-nonworld, 1 is other. No row unaccounted.

## Sense note (75106, NON-MEASURED replay, window d79-d146)

The sense rule picked 75106 (25 wave-4 fights, the band
max). The window's first wave-4 fight in the corpus is
the d89 turn-based Eulogy: solo scholar marcus_webb,
armed, armorP 36, a veteran — the village's proven killer
— fighting alone, and losing. In plain words, from the
measured corpus plus the replay's matching posture (the
replay is non-measured and its trajectory shifts; the
counts above are the corpus's, not the replay's):

Days before that fight, the village already said the
quiet part out loud. On d79 the muster beat runs:
"scouts report The Eulogy hunting near Haven, and it is
beyond us. Everyone inside. No one walks the treeline
alone — the garden crews double up, the hunters stand
down. We outlast it." That is a real judgment, made like
people make it: named, communal, with a plan attached
(double the crews, stand the hunters down). On the raid
night (d85 in the replay) four raiders come over the wall
and the game's own words are "Nobody met The Eulogy —
it's still out there at the treeline," repeated for each
raider, while the lingerers gorge the pantry night after
night and the village argues at the fire about what to
call the thing ("Big Ugly," "The Big Beast" — Walt
naming it, nobody agreeing yet). The villagers are not
passive and not robotic: they talk, they name, they
double up, they choose to endure a gorge price rather
than march out to die. And then, when the scholar does
take the Eulogy on alone in a turn-based fight, he loses
— the same shape as the census: solo, even with a
veteran, against a wave-4 monster, is not the demanded
undertaking, and the village knew it before the fight
started. The sense reading matches the census exactly:
the demand gap is not that villagers lack weapons (they
are armed) or knowledge (tricks saturated) — it is that
the party never forms, because the village has judged
the fight beyond it and chosen outlasting over mustering.

## Parity (exact) and cross-checks

PARITY vs partyfinish CONTROL: EXACT on all 8 seeds and
all 9 fields per seed plus wave-4 defwound rows by
context, wave-4 nonworldkill starts, and wave-4 spawn seq
sets. No divergence to diagnose. The detgate PASS proves
the demand recorder is neutral; the control parity proves
the whole stack (including the demand recorder ON) moves
nothing.

CROSS-CHECK vs partyfinish ARMED (driver contrast,
expected to differ — the sortie driver policy changes
trajectories, so this is NOT a parity failure):
75101 mine 132/1/34 vs armed 162/1/39; 75102 180/0/44 vs
180/0/33; 75103 132/1/28 vs 132/1/28 (identical);
75104 90/1/24 vs 131/0/46; 75105 180/0/48 vs 180/0/75;
75106 146/0/40 vs 90/1/19; 75107 180/0/31 vs 134/1/31;
75108 102/0/37 vs 140/1/41 (days/won/deaths). The armed
band wins more (5 vs 3) and on different seeds — the
driver effect, reported with its explanation, never as a
parity failure. No cross-check disagreement fits neither
explanation, so no STOP was triggered.

ERA COMPARISON vs w4convert (same policy, earlier code —
reported, never gated): w4convert days/won/deaths were
132/1/34, 177/0/42, 180/0/50, 90/1/24, 162/1/36, 146/0/40,
180/0/31, 114/0/42. This band differs on 75102 (180 vs
177), 75103 (132 won vs 180 survived), 75105 (180
survived vs 162 won), 75108 (102 vs 114) — explained by
the 218 lines of src/js changes between bcf137c40 and
8e26af922 (betrayal, comms, game.js, titans, finale-omen
gate) plus the partyfinish mechanism in code, as the
prereg's Base section states. The w4convert verdicts are
not re-scored; the era table is context for why this
band has 2 wave-4 kills where w4convert had 0.

## Metric review (filled at judging time)

- COURTSHIP EXPECTATION (correction, not a re-score).
  The prereg's expectation line (combined 121) named the
  wrong era's number; control's own combined is 110 and
  this band matches it exactly. The gate (combined > 0,
  >= 6/8 active) passes under either number, and no GO
  input depended on 121. Future preregs should quote the
  parity partner's own number, not a predecessor's.
- TRICKS-BAR SATURATION (metric doubt for the NEXT run).
  The gate's tricks bar (3) is saturated 20.42 deep at
  wave-4 fights because monsterCounterKnown counts wave
  1–2 counters — the bar measures "has the village
  learned anything, ever," not "is it ready for wave 4."
  On this band tricks pass 1.00 in every channel, so the
  leg discriminates nothing at wave 4. A future run
  should consider whether the tricks bar needs a
  wave-appropriate weight (e.g. tricks for wave-(w-1)+
  types, or signature-mechanic observations) — proposed
  here, applying to the NEXT run only, never this one.
- TB-WIN ATTRIBUTION (instrument note, not a doubt).
  TB kills log via 'player' with the scholar's vid at
  kill time (olivia_bennett, ines_duarte); the end-of-run
  scholar differs on both seeds, so an end-of-run scholar
  id would misclassify both kills. The daily scholar
  history (retained from w4convert) is what makes the
  attribution correct; future kill attributions must
  keep day-matching scholar identity, never end-of-run.
- FIGHTING-PARTY DIAGNOSTIC (post-prereg, labeled, no
  GO effect). The analyzer also computes a fighting-party
  cut (leader + allyFromStart join + called-help join)
  that the prereg did not name: on this band it changes
  nothing (all 26 field/raid fights are solo under both
  definitions — named party == fighting party, met rate
  0.00 either way), because no wave-4 field fight ever
  had a named ally to join. It is published as a
  diagnostic for bands where field parties exist, and it
  did not move any GO leg.
- PANEL. scripts/balance-panel.js has NO corpus-ingest
  mode for a single-arm census corpus (standing exception,
  as in w4convert): `compare` requires
  --before/--after panel files built from live roots, not
  census rows, and errors without them. No panel artifact
  was faked; the paired tables (this band vs partyfinish
  control, identical seeds/policy/code, parity EXACT) are
  the section-15 substitute. This arm changes nothing in
  the game, so the panel is expected to show zero
  movement; it shows none, because there is no panel to
  move.
- TELEMETRY DEVIATION CHECK (loop body step 10): the
  corpus path for the coordinator's check is
  evidence/2026-10-28/perseed-wave4demand-a/*.json
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

1. FIELD PARTIES NEVER FORM (the demand's binding leg).
   0/26 wave-4 field/raid fights have a second fighter,
   named or joined, even though the village averages 6
   armed fighters at fight starts. Why do villagers meet
   wave-4 monsters alone when armed company exists? A
   fix arm should aim at party formation on meeting
   (routing, crew proximity, aid-call timing), with GO
   on a fought wave-4 party, not a meeting count.
2. VETERAN SCARCITY AT FIGHTS (the gate's binding leg).
   Veterans average 0.12 at wave-4 fight starts; only
   4/50 fights have one; both wave-4 killers die before
   run end. The veteran leg opens the door and then the
   veterans are gone. A fix arm should aim at veteran
   survival/conversion (killer survival after a wave-3+
   kill), with GO on a veteran present in a later wave-4
   fight, not on veteran creation alone.
3. TRICKS-BAR SATURATION (see Metric review). The wave-4
   tricks bar is met by wave 1–2 learning and
   discriminates nothing. A metric-revision arm should
   propose a wave-appropriate tricks bar for the NEXT
   run's prereg.
4. DEMAND-MET AUDIT LOSSES (n=2, not a claim). Both
   demand-met fights lost to Audits — the only
   demand-met monster type on the band. Whether audits
   specifically punish parties, or parties specifically
   fail audits, needs a bigger party-fight sample before
   anyone claims it; reported as a question, not a
   finding.

## Named next step

A fix arm (not this census arm) should pick ONE half of
the demand gap and pre-register against it, using this
corpus as its baseline: either (a) the party half — why
field meetings are always solo and whether a mustered or
aided party can be made to arrive at a wave-4 meeting
(instrument already exists: allyVids + engineAllies +
calledHelp/joinedAllyVid in this corpus, no new recorder
needed); or (b) the veteran half — why veterans are
absent from 46/50 fights and whether a wave-3+ killer
can be kept alive into a wave-4 fight (instrument: the
waveKillLog + scholarHistory join in this corpus, no new
recorder needed). Whichever half is picked, its GO
threshold should be a FOUGHT wave-4 party (or a veteran
in a wave-4 fight), not a meeting count — this census
proves meetings already happen solo at 0% party rate, so
a meeting-count GO would declare victory over the wrong
funnel step.

## Infrastructure notes

- Sweep: scripts/test-wave4demand-sweep.js, 8 seeds,
  ~10.5 min wall + detgate ~80s (x2: pre-sweep proof run
  and analyzer judging run) + sense replays (~90s each,
  run twice for extraction). Corpus:
  evidence/2026-10-28/perseed-wave4demand-a/ (8 rows +
  summary.json + analysis.json). Analyzer:
  scripts/test-wave4demand.js (proof validator; exit 0,
  DIAG-GO, all legs PASS). Sense:
  scripts/test-wave4demand-sense.js (NON-MEASURED replay
  only; 75106 window d79-d146).
- INDEX CLOBBER (loud, repaired, commits correct): after
  BOTH safe-commits in this run (prereg 762b786a4,
  instruments 6e0322cd7a3493), the worktree's main index
  showed the committed files as bogus staged deletions
  plus untracked copies (worktree files byte-identical to
  HEAD). Repaired via `git update-index --add
  --cacheinfo "100644,<blob-from-HEAD>,<path>"` per file
  and re-verified (`git status --short` empty, `git diff
  HEAD` empty, hash-object matches) before proceeding.
  No reset, no stash touched, commits verified via
  `git show --stat HEAD`. The clobber class from the
  2026-10-22/23 register lessons, fifth and sixth
  sightings in this worker's experience; the same check
  runs after every safe-commit in this run.
- Run logs kept alongside the evidence (not in the corpus
  dir): the sweep's per-seed lines are in the run record;
  no separate sweep log file was kept for this arm (the
  summary.json + analysis.json carry the judged numbers).
- MEMORY.md changed under this run from outside (a
  travel–scale coherence note, 2026-10-28 09:40 CDT):
  noted, not acted on — it is outside this arm's
  assignment and does not touch the census.
