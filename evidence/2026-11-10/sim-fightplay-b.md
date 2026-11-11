# sim-fightplay-b — Fight-play census, FIRST NUMBERS (evidence)

- Run: `fleshout-loop-b-20261111T0045Z` (Loop B adoption arm), worktree
  `~/workspace/worktrees/sim-fightplay-b`, branch `sim-fightplay-b`.
- Base: master `6d7212cda` at prereg; rebased onto the explicit master SHA
  before commit (see §Rebase). Zero `src/js` in this arm (instrument +
  analyzer + proof test only).
- Prereg: `evidence/2026-11-10/sim-fightplay-b-prereg.md` (written and
  committed BEFORE any judged sims).
- Corpus (judged): `evidence/2026-11-10/perseed-fightplay-b/` — 8 per-seed
  JSONs, seeds 180225–180232, competent policy verbatim, 150d death-aware
  horizon. Summary: `evidence/2026-11-10/fightplay-summary-fightplay-pilot.json`
  (regenerated with `node scripts/fightplay-analyze-20261110.js
  evidence/2026-11-10/perseed-fightplay-b fightplay-b`; the run label is
  `fightplay-b` — the earlier label `fightplay-pilot` yields all zeros, so
  the file keeps the `-pilot` name by the adoption brief but the label
  inside is `fightplay-b`).
- DISCARDED corpus: `evidence/2026-11-10/perseed-fightplay-b-v1-noammo/`
  (8 files, same band) was the PRE-FIX run — its ammo capture read the
  wrong equipment lookup, so every ammo number in it is wrong. It is NOT
  committed; the directory was deleted from the tree. The judged corpus is
  the fixed re-run only. No numbers in this file come from v1.
- Proof test: `scripts/test-fightplay-b.js` — **32 passed, 0 failed**
  (plain `node`, not jest — this repo has no jest config; the test is a
  self-contained node script per its own header).

## GO verdict: GO

All six pre-registered GO conditions hold; judged STRICTLY against the
prereg, no re-scoring:

1. Instrument ran to completion on every pilot seed: **8/8 per-seed
   JSONs**, no seed crash, no missing section (all 8 carry every section:
   seed, fights, gateCalls, daily, fightSays, waveKillLog, fallen,
   wavesFaced, instrumentErrors).
2. **0 instrument errors** across all 8 seeds (per-seed 0/0/0/0/0/0/0/0;
   summary `instrumentErrors: 0`).
3. Capture completeness: every §Metrics item has a counted table below,
   except ally ability use, marked UNMEASURABLE with its reason (§Metrics
   completeness).
4. Neutrality leg: MODE=on vs MODE=off end-state digests identical on
   all 3 proof seeds (proof test PASS).
5. Determinism leg: MODE=on repeat runs byte-identical on all 3 proof
   seeds (proof test PASS).
6. Proof test green: 32/32.

## Grounded vs conjured accounting (the headline)

The conjurefix fix is NOT on master, so agency-expedition fights are
conjured by construction — and the census confirms it in full:

| Channel | Fights | Notes |
|---|---|---|
| Total fight rows | 1228 | all channels |
| Field fights | 906 | |
| **Grounded wild** (seq != null) | **509** | the judged corpus |
| Agency fights (cls other, expedition) | 373 | **ALL 373 conjured** (seq == null); grounded agency 0 |
| Player turn-based (scholar, context only) | 322 | outcome field null — context counts only |
| Contest fights | 24 | staged, not wild |
| Psycho (person-vs-person) | 0 | none in this corpus |

Kill accounting (473 kills total): wild 271, **agency 105 — all 105
conjured**, player 57, contest 17, companion 21, aid-crisis 2.
Unmatched kills 0. Grounded wild kills: **274** (vKill outcomes; the
wild-via 271 vs 274 difference is the deed-feed dedupe vs fight rows).

What this means in plain words: **more than a fifth of the kills the
village's records credit (105 of 473) come from fights against monsters
that were never actually in the world.** The village's expedition parties
"kill" monsters the System conjured for the trip. The 509 grounded fights
are the only ones where a villager met a real monster — every number
below is over those 509 unless stated otherwise.

Agency expeditions mostly don't even make contact: of the 373 conjured
agency fights, **241 end in evade** ("saw it, gave it room"), 106 vKill,
19 vFlee, 5 mFlee, 2 vDie. The expedition party declines the fight
two-thirds of the time and still banks 106 kills.

## Party size at fight start

| Party size | Fights | Share |
|---|---|---|
| 1 (solo) | 33 | 6% |
| 2 | 49 | 10% |
| 3 | 427 | 84% |

Villagers almost never fight alone: 84% of real fights start as a party
of three. `calledHelp` fired in 137/509 (27%) — most parties of three
are the pre-existing party, not a mid-fight call for help. Party size by
wave is flat (mean 2.4–2.9 everywhere); there is no "bigger party for a
bigger monster" — a wave-4 fight starts with the same three villagers a
wave-1 fight does.

Outcome by party × wave (grounded fights):

| Cell | Fights | vKill | mFlee | vFlee | vDie |
|---|---|---|---|---|---|
| w1 / party 3 | 168 | 130 | 32 | 5 | 1 |
| w1 / party 2 | 13 | 11 | 2 | 0 | 0 |
| w1 / party 1 | 5 | 2 | 0 | 2 | 1 |
| w2 / party 3 | 94 | 85 | 9 | 0 | 0 |
| w2 / party 2 | 8 | 7 | 1 | 0 | 0 |
| w2 / party 1 | 17 | 8 | 0 | 7 | 2 |
| w3 / party 3 | 91 | 26 | 12 | 46 | 7 |
| w3 / party 2 | 10 | 2 | 1 | 7 | 0 |
| w3 / party 1 | 4 | 0 | 0 | 4 | 0 |
| w4 / party 3 | 73 | 3 | 11 | 51 | 8 |
| w4 / party 2 | 18 | 0 | 1 | 15 | 2 |
| w4 / party 1 | 7 | 0 | 0 | 7 | 0 |
| w5 / party 3 | 1 | 0 | 0 | 1 | 0 |

Waves 1–2 are won at the party of three (77% and 86% kill rates).
Wave 3 flips: a party of three kills 26/91 (29%) and flees 46/91.
Wave 4 is nearly unkillable in the field: **3 kills in 98 fights**,
all three with a party of three; 73 of 98 end in flight. Solo wave-3/4
fights never kill (0/11) and end in flight or death every time. The
party of three is the villagers' real weapon — and it stops being
enough at wave 3, exactly where the winnability chain needs wave-4
kills.

## Ability uses per fight (leader only)

- **331 ability uses across 216 fights** (42% of grounded fights had at
  least one ability fire; 310 of 1906 rounds carried an ability, 16%).
- By ability: blood_trail 131, peacemaker 76, field_medicine 75,
  patient_aim 16, tripwire 11, intimidating_presence 8, war_cry 5,
  stalk 4, draw_fire 2, scream_cheese 2, rally 1.
- The workhorse is blood_trail (a tracking/passive-style ability) and
  the social/healing pair (peacemaker, field_medicine). Direct combat
  abilities (war_cry, draw_fire, rally) barely fire — 8 uses in 509
  fights combined.
- Per-seed ability totals: 45, 18, 32, 36, 58, 39, 64, 39 — the spread
  tracks which fighters lived, not which monsters were met.
- **UNMEASURABLE — ally ability use.** The engine records only the
  leader's firings (`rec.ffFired` / `roundsDetail[].abilities`). No
  per-ally firing record exists anywhere in the fight row (verified by
  reading a sample row's full key list: no ally-ability field). Two of
  the three fighters in the modal party are therefore invisible in this
  metric. The 331 uses are a floor, not a total.

## Flee / engage vs THAT villager's monster knowledge

Four decision points, cross-tabulated by knowledge at the moment of the
call:

**1. Win-plan pre-fight gate** (`winPlanFightGate`): 381 calls —
avoid 8, seek 3, **null 370 (97%)**. The gate is effectively inert: it
declines to advise in 97% of calls, and of the 11 times it did advise,
only 2 decisions joined a recorded fight (1 avoid, 1 seek). Whatever
the gate is for, it is not steering fights.

**2. Pre-fight awareness evade**: **0 in grounded wild fights.**
Villagers NEVER decline a real wild meeting before contact. Evade
exists only in conjured agency fights (241). A villager who meets a
real wave-4 monster in the wild always walks into the fight — the
"see it, give it room" choice is never exercised against a real
monster.

**3. Fight intent**: engage 496 (intentWhy: party 259, trick-known
233, good-exchange 4), learn 13. The 13 "learn" fights: **0 kills, 12
vFlee, 1 vDie** — walk in, learn, run. That is the intent working as
designed, and it is rare (3%).

**4. Mid-fight morale flee** (outcome by knowledge):

| Knowledge at entry | Fights | vKill | mFlee | vFlee | vDie |
|---|---|---|---|---|---|
| Trick known | 233 | 127 (55%) | 43 | 54 (23%) | 9 |
| Trick unknown | 276 | 147 (53%) | 26 | 91 (33%) | 12 |
| Fought this type before | 3 | 2 | 1 | 0 | 0 |
| Never fought this type | 506 | 272 | 68 | 145 | 21 |

Two things stand out. First, **knowing the trick barely moves the
kill rate** (55% vs 53%) — it moves the flee rate instead (23% vs
33%): known-trick fighters hold their ground longer. Second, **the
fighter's personal fought list is nearly empty: 3 of 509 fights** are
against a monster type that villager has fought before. Villagers
almost never meet the same monster twice, so personal monster
knowledge barely accumulates — the village-wide trick store is the
only memory that matters, and it is the only thing the flee/engage
call can lean on.

Median fight shape: vKill 4 rounds, vFlee 3 rounds, mFlee 1 round,
vDie 2 rounds. Fleeing fights took a median 34 damage before leaving,
vs 18 in winning fights — villagers spend about three rounds getting
hurt before they decide to go.

## Trick use

- Trick-known fights: 233. Of those, **168 (72%) executed NO trick**.
  Only 65 trick-known fights saw at least one execution (196
  executions total — Spool-style waits fire three times per fight).
- By wave, the split is stark:

| Wave | Fights | Trick known | Trick executed (fights) |
|---|---|---|---|
| 1 | 186 | 93 | 2 |
| 2 | 119 | 57 | 0 |
| 3 | 105 | 46 | 39 |
| 4 | 98 | 37 | 24 |
| 5 | 1 | 0 | 0 |

Wave 1–2 counters (the Undertale tricks: shout, offer food, wait,
sidestep…) are known in 150 fights and executed in **2**. Wave 3–5
signature-mechanic counterplay executes when known (63 of 83 fights).
Execution by type: wait:buffering-still 97, contradict 19,
wait:spool-record 18, wait:redactor-quiet 12, farewell 11, leave 8,
confess 7, inefficient 7, examine 6, look_away 5, shout 3,
focus_followers 1, wait:reunion-novel 1, bore 1.

In plain words: **villagers know the wave 1–2 tricks and never use
them.** The knowledge is in the village store; the field-fight engine
either never offers the counter move to a villager, or the villager
never chooses it. The signature mechanics (waves 3–5) work the other
way: when the village knows the move, the fighter does it. The
wave 1–2 counter system is, for villagers, decoration — knowledge
without behavior. This is the census's sharpest single finding for the
arm-2 toggle and flee-repair queues: the "use what you know" failure
is not in the flee call, it is in the counter-execution path for the
early waves.

## Ammo pocketed / used

- Pocketed at contact: **587 rounds across 509 fights** (mean ~1.2).
  Only **106 fights** had any ammo at all.
- Spent: **263 rounds**. Volley: 200 fights opened with a volley,
  268 planned shots, 141 hits, 2467 damage.
- Reasons for zero ammo: no ranged weapon 250 fights, ranged weapon
  but no ammo 94, ranged weapon with a mismatched ammo type 59.
- The log line recurs verbatim across seeds: "Maitê has Sling but no
  arrows — the string stays drawn, useless." Villagers walk into fights
  carrying a sling and no stones. Half the village fights without a
  ranged weapon at all; of those who carry one, most carry it empty.
  The volley that does happen is accurate (141/268 hits, 53%) and
  meaningful (2467 damage) — the gap is supply, not aim.

## Reachability verdict

- Waves: w1–w4 fought on all 8 seeds; w5 fought on 2/8 (one fight
  each, both fled). Wave 5 is reachable but barely touched.
- Scale: regional on 6/8 seeds, village on 2/8. **National 0/8, table
  0/8, wins 0/8.**
- Readiness-5 (wave-5 gate) at end of run: ready on 0/8 seeds. The
  binding bar is **veterans: 0 on 7/8 seeds, 1 on one seed** (demand
  2). Tricks bar is met everywhere (21–28 known vs demand 3). Armor
  short on 6/8, weapons short on 5/8. Standing reached 225 on the two
  w5 seeds — the standing is there, the veterans are not. This is the
  99107 pattern again: all four bars were met for days on some seeds,
  but the veteran count never moved because wave-4 kills barely happen
  (13 wave-4 kills across 8 seeds, 3 of them grounded field kills).
- The chain as measured: wild ally-join works (parties of three are
  the norm), wave-4 kills are the choke (3/98 grounded), veterans
  follow the kills (0–1 per village), readiness-5 never releases,
  wave 5 is faced once per lucky seed, the full seat never appears.

## Village assessment (plain words)

Eight villages, 150 days at most, competent play. Six of the eight
villages died (days 69–147); two survived to the 150-day horizon.
Median survival 127 days. 129 villagers fell across the eight runs;
the biggest killer was not monsters but "the wild" (82 deaths) —
exposure, the road, the world itself — against 23 deaths recorded as
monster kills, 6 contest, 5 arena, 5 ambush, 2 starvation. The village
does not mostly die in fights. It dies out there.

Who fought: everyone, in threes. The modal villager fight is a party
of three meeting a wave 1–2 beast, killing it in four rounds, taking
about 18 damage, and going home with a cheer — the fightSays kill
lines repeat the same template every time ("killed the X with their
party — N rounds, M taken. Word travels fast. The village cheers."),
which reads as a village that celebrates the same way every time
rather than a village with a memory of each fight. Wave-3 fights are
where the mood changes: the party still goes in three strong, but now
it flees half the time, and the ones who stay die more often. Wave-4
fights are a rout in slow motion — three villagers walk in, take
their hits, and leave after three rounds with nothing dead.

What was missing: (a) **knowledge that changes behavior** — the
village knows 150 wave 1–2 tricks and uses 2 of them; the fighter's
own memory of past fights is empty because they never meet the same
monster twice; (b) **a pre-fight choice** — no villager ever declined
a real wild meeting, and the win-plan gate declined to advise 97% of
the time, so every meeting becomes a fight and the flee decision is
made three rounds late, after the damage is taken; (c) **ammo in the
pocket** — the sling is carried, the stones are not; (d) **veterans**
— with 3 grounded wave-4 kills in 8 villages, nobody lives long
enough as a proven killer to open the wave-5 door, and the readiness
bars name veterans as the short bar on every seed.

What the village looked like at the end: standing 125–225, regional,
wave 4 unlocked everywhere, wave 5 unlocked twice, no national rank,
no table, no win. Strong enough to be noticed, not strong enough to
be ready. The fight-play gate's answer, in one line: **villagers do
fight — in parties, with abilities, fleeing sensibly late — but they
fight every monster they meet, they don't use the tricks they know,
and they can't kill what the win needs killed.**

## Metric review (§14 — judge strictly, no re-scoring)

- The GO bar held as written; the verdict is GO on the pre-registered
  terms. Nothing below changes that verdict.
- **Metric that proved weaker than hoped: "flee/engage vs knowledge"
  as a four-point tab.** The pre-fight points (gate, evade) are
  near-degenerate — the gate returns null 97% of the time and evade
  never fires on grounded fights — so the tab collapses to the
  mid-fight morale flee, which is real but only one decision. For the
  NEXT run, the metric should be re-cut as: (i) gate-null rate as its
  own instrument-health number, (ii) evade rate split grounded vs
  agency (the split, not the total, is the finding), (iii) a
  "rounds-before-flee" distribution as the flee-quality measure.
  Proposed revision for the next run only; this run is judged on the
  prereg as written.
- **Taxonomy artifact to watch:** the summary's `groundedKills` (274)
  vs `killsByVia.wild` (271) differ by 3 — fight-row outcomes vs the
  deed-feed kill log dedupe. Both are reported; the 3-fight gap is
  dedupe, not error, but a future census should name which count is
  canonical.
- **Blind channel, confirmed:** ally ability use is unmeasurable from
  the record (no per-ally firing field). Any future claim about
  "villagers use abilities X times per fight" must either instrument
  allies or state it is leader-only. The arm-2 toggle and ability-use
  follow-ups queue behind this gap.
- **Seed-band note:** 180225–180232 was fresh at prereg (verified
  against all preregs + the coverage round-2115 reservations); it is
  now spent — do not reuse for a before/after on this arm.

## Sense-testing (read, don't just count)

Read: fightSays kill lines + `logExcerpt` samples across all 8 seeds.

- **Ganging up — yes, and it's the only thing that works.** Parties
  of three are the norm; solo wave-3/4 fights never kill. The party
  is real: `calledHelp` fires in 27% of fights, and the kill lines
  name the party every time.
- **Using what they know — no, for the early waves.** The Spool
  sequence is the counter-example done right: three villagers in a
  row, on different seeds, all wait out the record phase ("gives the
  spool nothing — waits, breathes, checks a strap. Feeding it
  silence.") and the replay hits for 0. That is a villager using
  knowledge, legibly. The wave 1–2 counters are the opposite: the
  knowledge sits in the store and the fighter strikes anyway.
- **Fleeing sensibly — late but real.** Wave-4 flees after ~3 rounds
  and ~34 damage read as "we tried, it didn't work, we left" — not
  panic, not suicide. But the flee is always mid-fight; nobody ever
  looks at a wave-4 monster and walks the other way first.
- **Wasted turns — visible in the margins.** "Walk In" (peacemaker)
  fails against wave-4 monsters and leaves the fighter exposed
  ("still off-balance from the failed parley, Grace takes it worse").
  Rage fires and then the fighter strikes — correct — but the
  tbfinish wasted-turn pattern (failed flees, zero-tile moves, rage
  re-pressed) is a player-turn-based phenomenon; the villager
  field-fight record shows no re-pressed rage and no zero-tile move
  in the sampled excerpts. The flee-repair build's target is the
  turn-based engine, not this one — this census neither confirms nor
  denies it.
- **Repetition — the kill beat and the compass beat.** The kill line
  is one template with the monster name swapped; the Trail-compass
  feast line repeats verbatim dozens of times across seeds. Neither
  is a fight-play defect, but both are the village sounding like a
  recording. Noted for the backlog, not chased here.

## Wall numbers (every run)

National 0/8 · table 0/8 · wins 0/8 · wave 4 unlocked 8/8 · wave 5
unlocked 2/8 · median survival 127d (max 150d, 6/8 villages lost).
Death causes (129 fallen): the wild 82, monster 23, contest 6, arena
5, ambush 5, starvation 2, wound 2, thirst 1, combat 1, Gavel 1,
toad 1. Standing at end: 125–225 (median 199). Scale: regional 6/8,
village 2/8.

## Findings for backlog (coordinator appends to sim-findings.md)

- [open] 2026-11-10 — fight-play / counters — Villagers know wave 1–2
  monster counters (150 trick-known fights) and execute them in 2.
  Wave 3–5 signature counterplay executes when known (63/83). The
  counter-execution path for early-wave counters appears dead for
  villagers. (sim-fightplay-b, 509 grounded fights.)
- [open] 2026-11-10 — fight-play / pre-fight choice — Grounded wild
  fights never end in pre-fight evade (0/509); evade fires only on
  conjured agency fights (241/373). The win-plan gate returns null on
  370/381 calls. Villagers have no working "don't fight this one"
  decision against real monsters. (sim-fightplay-b.)
- [open] 2026-11-10 — fight-play / knowledge — A fighter has fought
  the same monster type before in only 3/509 grounded fights. Personal
  monster knowledge cannot accumulate at this meeting rate; the
  village trick store is the only memory. (sim-fightplay-b.)
- [open] 2026-11-10 — fight-play / ammo — 250/509 fights with no
  ranged weapon; 94 with a ranged weapon but no ammo; 59 with the
  wrong ammo type. Only 106 fights had any ammo at contact. The sling
  is carried empty. (sim-fightplay-b.)
- [open] 2026-11-10 — fight-play / agency — ALL 373 agency-expedition
  fights are conjured (conjurefix not on master) and 105 of the 473
  credited kills come from them. Kill-based bars (ledger, veterans)
  read conjured kills as real. (sim-fightplay-b; confirms
  sim-conjurefix-b NO-GO.)
- [open] 2026-11-10 — fight-play / readiness — Veterans bar is 0 on
  7/8 seeds, 1 on one seed, while tricks are 21–28 vs demand 3.
  Readiness-5 never releases; wave-4 grounded kills are 3/98. The
  veteran bar, not standing, is the wave-5 choke. (sim-fightplay-b.)
- [open] 2026-11-10 — narration — Kill beat is one template
  ("killed the X with their party — N rounds, M taken. Word travels
  fast. The village cheers."); Trail-compass feast line repeats
  verbatim dozens of times per corpus. Village narration sounds
  recorded. (sim-fightplay-b, sense-testing.)

## Rebase

Rebased onto explicit master SHA (read in the main tree immediately
before rebasing; see coordinator merge note for the SHA). Proof test
re-run green after the rebase (32/32).

## Files

- `evidence/2026-11-10/sim-fightplay-b-prereg.md` (committed earlier)
- `evidence/2026-11-10/perseed-fightplay-b/` (8 JSONs, fixed corpus)
- `evidence/2026-11-10/fightplay-summary-fightplay-pilot.json`
- `evidence/2026-11-10/sim-fightplay-b.md` (this file)
- `scripts/fightplay-analyze-20261110.js`, `scripts/fightplay-driver-20261110.js`,
  `scripts/fightplay-instrument-20261110.js`, `scripts/test-fightplay-b.js`
  (committed earlier; ammo-lookup fix committed earlier)
