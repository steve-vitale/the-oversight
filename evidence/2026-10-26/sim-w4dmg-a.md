# sim-w4dmg-a — wave-4 fight damage decomposition (axis scale-onramp)

Run: fleshout loop, arm sim-w4dmg-a. DIAG / MEASUREMENT ONLY — zero
src/js changes, no demand-number moves, no veterans-bar changes, no
combat-code changes, no default flips. Any "how much damage would it
take" arithmetic below is DESCRIPTIVE measurement (observed DPS vs
observed HP), NOT a lever proposal. No [needs-eyes]: measurement only
(stated explicitly per the brief; that assessment is re-checked at
close).

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5; readiness bars wave 4: 3 armored P>=10 / 5 armed /
3 tricks / 1 veteran killed wave-3+; wave-5 veterans bar 2 living
wave-4+ killers). No design is invented here. Where the code's
recorded numbers differ from the canon bands (e.g. a wave-4 def
whose HP range sits below 850), the row reports the code number and
the difference is noted, not smoothed over.

Starting HEAD (this worktree, recorded before any sweep):
628ceb21e — "journey-scale r41: never-fought means still standing
there (spawnfate FATE-GO 8/8 + leg play 3/4 lesser seats)". The
r41 spawnfate result is engaged only where it bears on fight
winnability (a never-fought monster still standing is a monster
whose wounds persist across meetings — see the wounds-in column);
it is not re-litigated here.

Prior arm read first: evidence/2026-10-26/sim-wave4enc-a.md
(1920Z run, band 73671-73678, base 1377d03c3). Its decomposition is
the substrate for this arm, not a result to re-prove: field fights
12 (0 kills, damage 0-31 HP vs monster starts of 448-1000 HP, 1-3
rounds, villager flees or dies) and player tb fights 13 (all lost).
This arm decomposes THOSE fights' damage: per round, per source,
against the HP pool, with the wounds the fighter walked in with.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Question: wave-4 fights are lost 25/25 on this band (12 field
  non-kills + 13 tb losses) and 24/33 spawns are never fought. Is
  the damage shortfall a DPS problem (even a full-length fight at
  observed damage rates could not finish the HP pool), a
  truncation problem (damage rates would finish it, but fights
  end in 1-3 rounds by flee/death), a zero-hit problem (no damage
  lands at all), or a party problem (fights are fought alone, so
  one villager's strikes are the whole offence)? Answer from
  rows, not from the band summary.
- Substrate: tableseat-nowait (LEANLINKRESCUE=1 +
  TABLESEATNOWAIT=1, seat legs only), seeds 73671-73678, 180d
  death-aware horizon (runDays stops on Game.over).
- Re-baseline FIRST: plain tableseat-nowait, 8 seeds, compared
  field-by-field against the 1920Z band table (wins 2/8,
  national-ever 6/8, national-final 5/8, table 4/8, entered 2/8,
  wave-4 6/8, wave-5 0/8, median 152d, deaths 307, starvation 1).
  Any base delta is reported field-by-field, never silently
  absorbed. The 1920Z base was 1377d03c3; this arm's base is
  628ceb21e, so a delta is EXPECTED to be possible and is a
  finding, not a failure.
- Baseline: plain tableseat-nowait, own replication (8 seeds),
  NOT another arm's corpus. Armed: tableseat-nowait wrapped
  with five observational recorders, four verbatim reuses plus
  one new one: fieldfinish-diag (FIELDFINISH=1), nonworldkill-
  diag (NONWORLDKILL=1), wave4enc-diag (WAVE4ENC=1), spawnsrc-
  diag (SPAWNSRC=1, reused for spawn linkage context only — its
  rows are NOT re-judged here), and the NEW w4dmg-diag
  (W4DMG=1: per-fight damage decomposition, field + tb).
  Recorders never write game state, draw no RNG, never throw
  into the engine (errors counted). They never call
  villageStandingTotal() or unlockedWave() mid-run.
- Damage-decomposition schema (every wave-4 fight gets one row;
  field AND player tb; no fight hidden):
  - FIELD row: day, vid (fighter), fighter HP at entry
    (state.village.health before the fight) and at exit
    (rec.vHpLeft), damage taken (rec.vTaken), monster type,
    monster HP at fight start (entity hp) and end (rec.mHpLeft),
    monster max HP (entity maxHp, else def range), monster
    damage range + pierce + speed + pack from the def, spawn
    seq (entity _spawnSeq, null = unlinked), wounds carried in
    (startMax - startHp; plus, in the analyzer, the prior fight
    of the same seq, if any, and whether startHp equals its
    endHp), rounds, outcome, intent (rec.intent: learn/engage),
    party (allyVid/calledHelp/opts allies), fighter gear at
    fight end (weapon bonus melee/ranged + armor P via the
    equipment helpers, best-effort, null = unknown-gear and
    counted), fighter abilities held (npcOwnedIds, best-effort;
    HELD is not USED — the engine's returned record does not
    attribute ability damage separately, see taxonomy).
  - FIELD damage sources (taxonomy, read from
    src/js/fieldFights.js — the returned record's own fields):
    volley = rec.volley.dmg (ranged opening); ally =
    rec.allyDealt (ally strikes); close-in = rec.mDealt -
    volley - ally (villager melee strikes PLUS ability/trick/
    godpath field effects, which the record folds into
    mDealt without a separate field — inseparable in the
    engine's own record, stated as such, never split by
    guessing); total = rec.mDealt. A row is internally
    consistent iff volley + ally + close-in == total exactly;
    any row failing that is counted as inconsistent, not fixed.
  - TB row: day, door (nonworldkill classifyStart), monster
    type, monster fighter HP at fight start (nonworldkill
    start fighters) and at fight end (w4dmg tbEnd pre-capture:
    the fight's round count f.round and fighters before tbEnd
    nulls tbfight), monster max HP, party (start fighters:
    player + villager/ally fighters with their HP, wbonus,
    varmor as carried on the fighter objects), wounds carried
    in (startMax - startHp), result (tbEnd result), kills
    written (nonworldkill end newLog, wave-4 only).
  - TB damage sources (taxonomy, stated limit): tb fights
    have NO per-round or per-source damage record in the
    engine — no strike log survives to tbEnd. The ONLY tb
    damage number is NET damage = startHp - endHp of the
    monster fighter (negative = the monster healed more than
    it was hurt, e.g. a signature heal; counted, not hidden).
    Per-source tb damage is therefore UNATTRIBUTED by the
    engine, and this arm reports it as unattributed damage
    with an explicit count, never invented from the field
    formula. Tb rounds ARE recorded (f.round at tbEnd).
  - Unattributed damage, counted explicitly: (a) tb net
    damage (no source split exists); (b) field close-in
    damage (melee vs ability/trick inseparable); (c) any
    field row whose source sum fails the identity above.
    The evidence reports all three counts; zero is not
    assumed.
- Dominant-limiter taxonomy (assigned from rows by the rules
  below, never asserted; one limiter per fight):
  - FIELD: ZERO-HIT if total damage == 0. Else DPS-TOO-LOW
    if rounds-to-kill at observed DPS > 15 (the field round
    cap: even a fight run to the cap at the observed rate
    could not finish the start HP pool; DPS = total / max(
    rounds, 1); rounds-to-kill = ceil(startHp / DPS)).
    Else TRUNCATED (observed DPS would finish the pool
    within the cap, but the fight ended early by flee/
    death/evade — duration, not rate, is binding).
    Rounds-to-kill at observed DPS vs median wave-4 start HP
    is also stated at band level (descriptive arithmetic).
  - TB: DPS-TOO-LOW if net damage < 10% of monster start HP
    (the party removed under a tenth of the pool before the
    fight ended). Else TRUNCATED (the party removed >= 10%
    but the fight still ended lost — duration/party survival
    is binding). Tb rounds are reported alongside but do
    NOT enter the limiter rule (no per-round damage exists
    to divide by).
  - Secondary attributes counted separately (never folded
    into the limiter): no-ally share, volley share of total
    damage, intent=learn share, wounds-in > 0 share, median
    party size, unknown-gear count, unattributed counts.
  - Armor note (code-read, not a row claim): field armor
    absorption (r = P/(P+20), effP = P*(1-pierce)) governs
    damage TAKEN by the villager, not damage DEALT to the
    monster (monsters wear no armor in the defs). Armor
    absorption is therefore NOT a damage-dealt limiter in
    this taxonomy; villager armor P and monster pierce are
    recorded per row so the taken-damage side can be read
    alongside, but the limiter rules above do not use them.
- Cost bar: armed starvation total <= baseline starvation
  total + 2 AND armed median days >= 0.8 x baseline median
  days. G2 identity preferred: armed == baseline exactly on
  days/gameDays/ts/starvation.
- Det-gate: recorders unset == unwrapped on one seed (days/
  gameDays/ts identical, no recorder surface, no installed
  wraps).
- Cross-checks (a seed is fully decomposed only if all hold):
  (a) w4dmg field rows (wave 4) count == wave4enc field rows
  (wave 4) count on that seed (two independent wraps of the
  same fights); (b) w4dmg tb rows joined to a nonworldkill
  start (wave 4) count == nonworldkill tb initiations (wave 4)
  count, minus explicitly-named unjoined rows (direct-build
  ends, same-call routed fights without a start row — each
  named, none hidden); (c) every w4dmg field row passes the
  source-sum identity; (d) recorder errors zero, overflow
  zero.
- DIAG-GO iff (1) >= 6/8 seeds fully decomposed (every wave-4
  fight in a per-fight damage row, zero unattributed fights
  hidden, unattributed damage explicitly counted, recorder
  errors zero), AND (2) the dominant damage limiter is named
  with per-seed counts and band totals, AND (3) the
  descriptive rounds-to-kill arithmetic at observed DPS vs
  median wave-4 HP is stated. Otherwise DIAG-NO-GO, bar
  honored — a dominant limiter is a finding, not a fail.
  Judge against this header; metric doubts go under "metric
  review" for the NEXT run, never a mid-run re-score.
- BALANCED PANEL (§15): balance-panel.js has no corpus-ingest
  mode (standing limitation from prior arms) — the paired
  identical-seed tables below are the comparison of record.
  No panel file is produced or faked. scripts/telemetry-
  check.js is NOT run on recorder rows (its counts are wrong
  on recorder rows).
- Sense-testing: one NON-MEASURED narration-on replay of the
  seed with the most wave-4 fights (chosen after the census);
  judge in plain words whether the fights read as finishable
  contests or scripted executions, and whether anything in
  the narration names a counter, a party, or a next step.
  Never census rows as sense evidence.
- DIAG ONLY: no readyDemand moves, no VETSHAPE flip, no
  src/js default change, no combat-code change. No
  [needs-eyes] flag: measurement only.

## RESULTS (appended after the run)

### Verdict: DIAG-GO (8/8 seeds fully decomposed — above the >= 6 bar)

- G1 det-gate: PASS. Seed 73671, recorders unset == unwrapped:
  days 180, gameDays 181, ts {tsNationalDay: 107} on both sides,
  no recorder surface, no installed wraps.
- G2 recorder neutrality: PASS, 8/8 seeds identical on
  days/gameDays/ts/starvation; faced-map agreement 8/8, kill-log
  agreement 8/8 (exact entry tuples d/mid/w/by/via).
- G3 corpus integrity: PASS. 16/16 rows in
  evidence/2026-10-26/perseed-w4dmg-a/ + summary.json; every
  armed row carries wave-4 damage rows (field + tb) + the
  post-run pure-read snapshot.
- Cost bar: PASS. Armed starvation 1 <= baseline 1 + 2; armed
  median 152 >= 0.8 x baseline median 152 (identical — via G2
  identity, not by a margin).
- Detail: --detail 73673 censusMatch=true (field4 2, tbInits4 6,
  identical limiter sets on re-run).
- Proof: scripts/test-w4dmg-a.js — 171 PASS, 0 FAIL (every
  summary number re-derived from the rows, including an
  independent re-derivation of every field and tb limiter).

### RE-BASELINE (base 628ceb21e) — EXACT vs the 1920Z table

Band aggregates vs the 1920Z table: wins 2/8, national-ever 6/8,
national-final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5
0/8, median 152d, deaths 307, starvation 1 — every field
identical, per seed as well as in aggregate (73671 180d/48
deaths, 73672 180d/51, 73673 124d/32, 73674 142d/won/28, 73675
180d/26, 73676 144d/won/43, 73677 152d/41, 73678 104d/38/starved
1). The r41 base (628ceb21e) reproduces the 1920Z trajectories
on this band exactly, so this arm's damage numbers sit on the
same trajectories the 1920Z arm decomposed — no base delta to
carry, and no silent absorption anywhere.

### PER-SEED DECOMPOSITION (damage rows, not summaries)

| seed | days | end | wave | field4 | tb4 | field dominant | tb dominant |
|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 4 | 3 | 2 | DPS-TOO-LOW (3) | TRUNCATED (2) |
| 73672 | 180 | survived | 4 | 5 | 2 | DPS-TOO-LOW (5) | DPS-TOO-LOW (2) |
| 73673 | 124 | lost | 4 | 2 | 6 | ZERO-HIT (2) | DPS-TOO-LOW (4) / TRUNCATED (2) |
| 73674 | 142 | won (lesser) | 3 | 0 | 0 | — | — |
| 73675 | 180 | survived | 4 | 1 | 1 | TRUNCATED (1)* | TRUNCATED (1) |
| 73676 | 144 | won (lesser) | 4 | 0 | 1 | — | TRUNCATED (1) |
| 73677 | 152 | lost | 4 | 1 | 1 | DPS-TOO-LOW (1) | TRUNCATED (1) |
| 73678 | 104 | lost | 3 | 0 | 0 | — | — |

\* 73675's single field TRUNCATED is the startHp-null ephemeral
influencer fight (see below) — its HP pool is unknown, so the
else-branch assigned TRUNCATED; it is NOT a "would finish
within the cap" case. Disclosed here and in metric review, not
hidden in the band dominant.

Band limiters (25 fights: 12 field + 13 tb): field:DPS-TOO-LOW
9, tb:TRUNCATED 7, tb:DPS-TOO-LOW 6, field:ZERO-HIT 2,
field:TRUNCATED 1. Band dominant limiter: field DPS-TOO-LOW
(9/12 field fights; 9/25 fights overall). No fight is
UNMEASURED-END-MISSING and none is UNENDED — every tb fight
reached tbEnd with its monster fighters present.

### THE FIELD CHANNEL: 12 fights, 254 total damage, median 23

- Damage range 0-39 HP, median 23, against start HPs of
  448-1000 (median start HP 850). Median DPS 13/round
  (rounds 1-3, median 2). Median per-fight rounds-to-kill 63.
- Source split (exact, every row passes volley + ally +
  close-in == total): volley 0, ally 6, close-in 248, total
  254. The ranged opening NEVER fires on a wave-4 field fight
  (volley null on all 12 rows — no bow volley at all, whether
  for want of a bow or want of arrows the record cannot say).
  Ally help is 6 HP in the whole band, from a single fight
  (the ephemeral influencer). 11/12 fights are fought alone
  (no called help, no ally, no opts allies).
- Intent: 10/12 fights open as 'learn' (the engine's
  learn-first default: the villager is observing, not
  committing to a kill). Only 2 open as 'engage' (73672
  herald d144, 73675 ephemeral influencer). The field channel
  is mostly villagers walking up to a Mirror Draft monster to
  learn about it, taking 80-90 damage, and fleeing or dying
  within 2 rounds.
- Gear (now read, 0 unknown-gear rows): weapon bonuses
  melee 0-15, ranged 0-28; armor P 4-20. The best-armored
  field fighter (P=20, herald d137/d143) still deals 23-24
  damage and flees — gear does not change the field story on
  this band, it only changes how long the villager lasts.
- The deepest field dent is 39 HP (73675 ephemeral
  influencer, 3 rounds, ally help 6). The deepest world-entity
  dent is 31 HP (73672 herald, d144). Nothing in the field
  channel removes more than ~5% of a wave-4 HP pool in one
  meeting.
- Wounds DO persist across field meetings (7/12 fights walk
  in already wounded: woundsIn > 0). The cleanest arcs:
  73672 herald seq43: 525 -> 502 -> 479 -> 448 over three
  meetings (prevMatch true each time — the same entity,
  wounds carried exactly); 73672 influencer seq51: 850 ->
  823 -> 799 over two meetings. Grinding works in principle:
  at ~24 damage per meeting, the herald needs ~19 more
  meetings from 448 HP — but each meeting costs a villager's
  life or flight, and the fighters do not survive to repeat
  at that pace. Wounds-in is the field channel's only
  accumulation mechanism, and it accumulates at ~24 HP per
  villager-risking meeting.
- ZERO-HIT (2 fights, both 73673): algorithm d105 (2 rounds,
  villager flees, 0 damage, fighter wb 5/8, armor P=37 — the
  best-armored fighter on the band deals nothing) and eater
  d122 (1 round, villager dies, 0 damage). A P=37 villager
  dealing zero damage in 2 rounds is not a gear story; it is
  a hit/morale story the record cannot split further (the
  record carries no per-strike misses).

### THE TB CHANNEL: 13 fights, median net 252 HP (20.1% of the pool), all lost

- Net damage is summed across ALL monster fighters matched by
  key (see the correction note below): median net 252 HP,
  median net fraction 20.1%, max 58.5%. Tb parties remove a
  fifth of a wave-4 pool in a typical fight — an order of
  magnitude more than the field channel — and STILL lose
  13/13. The tb channel is not a DPS desert; it is a fight
  the party loses after dealing real damage.
- The closest fight in the band: 73675 d146 algorithm,
  scholar ALONE, 10 rounds, 1172 -> 486 (686 HP, 58.5%),
  result lost. At that fight's own rate (~69/round) the kill
  needed ~17 rounds; the fight ended at round 10 with the
  scholar beaten. That is the tb story in one row: the party
  can hurt a Mirror Draft monster badly and still not finish
  it before being finished.
- Limiter split: TRUNCATED 7 (party removed >= 10% but the
  fight still ended lost — party survival/duration binding),
  DPS-TOO-LOW 6 (party removed < 10%: 73672 audit arena 6.0%,
  73672 influencer crew 2.7%, 73673 algorithm x4 at 0.5-7%).
  The tb channel is genuinely two problems, not one: half
  the fights are winnable-on-rate but lost on survival, half
  are not even close on rate.
- Party sizes: median 1-2 (scholar alone in 7 fights, scholar
  + 1 villager in the rest). No tb party on this band has
  more than 2 fighters. The 73673 d112 six-fight day is six
  separate fresh-HP fights (starts 1006-1195), not one fight
  ground down: see the channel-reset finding below.
- The crew fight: 73672 d148 influencer is a 4-fighter crew
  (m_0 + 3 crew, total start HP 9281). The party dealt 252
  total — all of it to one crew fighter (2133 -> 1881), the
  lead untouched (2395 -> 2395). Against a crew, "the
  monster's HP" is ~9281, not the def's 850-1050; the party
  removed 2.7% of the crew's pool. Crew fights are a
  different damage problem from solo fights, and the lead-
  only read hid it until the correction.

### THE CHANNEL-RESET FINDING (the structural blank this arm found)

Tb fights do NOT inherit world wounds. The tb monster fighter
is built from the def's HP range, not from the world entity's
hp — proven on the same spawn sequences:
- 73671 influencer seq40: field ends 618 (d172); tb starts
  941 (d174, inside the def's 850-1050, not 618).
- 73671 suburb seq38: field ends 934 (d178); tb starts 1396
  (d179, inside the def's 1300-1500, not 934).
- 73673 algorithm seq45: field ends 1000 (d105); six tb
  fights d112 start at 1006-1195 (fresh rolls in 1000-1200,
  not 1000-after-wounds — and the field fight dealt 0 anyway).
- 73672 influencer seq51: field ends 799 (d143); tb starts
  at crew scale (9281 total), not 799.
So the two channels never accumulate on each other: field
wounds stay in the field (and persist there, prevMatch true),
tb damage stays in the tb fight (and dies with the loss —
the world entity is not left at the tb end HP). A village
that wounds a monster in the field and then meets it in tb
starts over at full HP (or crew scale). The grind that the
field channel offers at ~24 HP/meeting cannot be combined
with the tb channel's ~252 HP/fight, because neither channel
remembers the other's damage. That reset, not any single
fight's DPS, is why 25 fights produce zero kills: the only
channel that accumulates (field) accumulates too slowly to
matter, and the only channel that deals real damage (tb)
resets to full HP every time.

### DOCUMENTED GAP (not hidden, not explained away)

73672 influencer seq51: last recorded field end is 799 HP
(d143), but the tb-start tile read at d148 shows the world
entity at 586 HP — a 213-HP gap with no recorded fight in
between (field rows and tb starts for that seq were both
checked). Something removed 213 HP outside the two wrapped
channels (or the tile read and the field record measure
different things for a lingering entity — the tile row is
flagged lingering). This arm does not explain the gap; a
future trace arm should record the world entity's HP on a
daily tick to find where that 213 went.

### DESCRIPTIVE ROUNDS-TO-KILL ARITHMETIC (measurement, NOT a proposal)

- Field channel at band medians: median start HP 850 /
  median DPS 13 = 66 rounds to kill (median per-fight
  rounds-to-kill 63). The field round cap is 15. At observed
  field rates, a wave-4 field fight would need ~4x the cap
  to finish — and actual fights last 1-3 rounds. The field
  channel is unwinnable on rate alone, before truncation is
  even considered.
- Tb channel, for contrast: the median tb fight removes
  20.1% of the pool; the best removes 58.5% in 10 rounds.
  At the best fight's rate (~69/round vs ~1172 HP) a tb kill
  needs ~17 rounds — outside the 10 rounds the scholar
  survived, but inside the range a party that lasted longer
  could reach. The tb channel is unwinnable on survival, not
  (only) on rate.
- Unattributed damage, counted explicitly: tb net damage
  (13 fights, no per-source split exists in the engine) +
  field close-in damage (248 HP, melee vs ability/trick
  inseparable in the engine's record) + 0 rows failing the
  source-sum identity. Zero fights are unattributed; all
  unattributed damage is of the stated kinds, not hidden.

### SENSE-TEST (NON-MEASURED replay, seed 73673 — census shape reproduced exactly)

Replay (narration on): days 124, village-lost, maxWave 4,
field4 = 2 (vFlee 1, vDie 1, totalDmg 0) — the census
trajectory, not a fresh run. The ring covers d122-d124, so it
cannot judge the d112 six-loss day directly; what it does
capture is the d122 eater kill, in the System's voice: "The
Eater gorges on the field — +0 damage growth. (Isadora
should have poisoned the meal.)" then "The Eater killed
Isadora in 1 round. The village mourns." Plain-words
judgment: the fight reads as an execution, not a contest —
one round, zero damage dealt, death, mourning. The aside
does name a counter-like idea (poison the meal) — but only
as a retrospective aside after the death, not as a plan the
village can take into the next meeting, and nothing in the
ring names a party ("bring more people") or a next step
for the Algorithm, which the census then loses to six times
in one day. The one counter the ring DOES name with a full
teaching beat is for a wave-3 monster (d123: COUNTER LEARNED
— The Callback: say the goodbye properly, out loud; Mateo
lived to tell it, twice). The learning channel works — for
wave 3. For wave 4 the narration mourns well, hints once in
passing, and instructs not at all. That asymmetry is the
sense-level blank: the village can learn how to beat what
it has already survived, but the Mirror Draft arrives as a
killer with no taught answer.

### VILLAGERS ACTING LIKE PEOPLE (sampled from the same corpus)

- Villagers DO go back to a known monster (73672 herald met
  three times, influencer twice, wounds carried exactly) —
  persistence across people, the village sharing a problem.
  But the sharing stops at contact: 11/12 field fights are
  fought alone, no party forms around a known wave-4
  monster, and the same losing matchup repeats without
  adaptation (73673's algorithm, seven losses across two
  channels, each starting from full HP).
- The learn-first default is visible in the rows (10/12
  field intents 'learn'): villagers approach Mirror Draft
  monsters to observe, not to kill. That is people-like
  caution — and it is also why field damage is so low: the
  engine's own judgment sends villagers in to learn, and
  learning against a 35-95 damage monster costs 80-90 HP
  and a flight or a death.
- From the sense ring (same seed, non-measured): villagers
  patch each other up before heading out ("Omar is hurting
  (69 HP) — You patch them up before they head out"), set
  out to forage with a promise ("Bringing dinner back. One
  way or another"), and tighten belts together in a crisis
  ("We tighten our belts together, three days, no
  exceptions"). The village reads as people between fights;
  inside wave-4 fights it reads as one person at a time
  walking up to something that kills them.
- The scholar's behavior is the least people-like datum:
  six tb losses to one algorithm in one day, each against a
  fresh full-HP monster, with no change of approach visible
  in the rows. Whether that is bot-policy persistence (the
  tableseat-nowait policy re-engaging on bump) or engine
  re-engagement cannot be split by this recorder — the
  policy's bump behavior is the confound, stated here
  rather than blamed on the villagers (same confound as the
  1920Z arm).

### WALL NUMBERS (this run's judged corpora — baseline = armed, G2 identical)

Wins 2/8, national-ever 6/8, national-final 5/8, table waiting
4/8, entered 2/8, wave-1 8/8, wave-2 8/8, wave-3 8/8, wave-4
6/8, wave-5 0/8, median 152d, max 180d, deaths 307, starvation
1, max Arc 4 (arcs per seed: 3, 4, 3, 4, 3, 4, 4, 3). Wave-4
kills 0/8 seeds, wave-4+ killers peak 0 everywhere — the
veterans bar is still empty, now decomposed: the field
channel deals 254 HP across 12 fights (median 23) against
pools of 448-1000, the tb channel deals a median 20.1% per
fight but loses 13/13, and the channels never combine their
damage.
Death-cause shares (307 deaths): villager combat 126
(41.0%), villager-vs-villager combat 85 (27.7%), player arena
43 (14.0%), expedition 13 (4.2%), villager monster 8 (2.6%),
player dehydration 7 (2.3%), sickness 6 (2.0%), wound that
wouldn't close 6 (2.0%), ambush 3 (1.0%), contest 2 (0.7%),
thirst 2 (0.7%), singletons: Moderator, lockjaw, Redactor,
starvation, alien, Loud Beast (1 each). Combat dominates
death (68.7% across the two combat causes); starvation is
1 death on this band — the wall is not hunger, it is
unwinnable fights plus unmet monsters (the 1920Z arm's
24/33 never-fought spawns, unchanged in kind).

### METRIC REVIEW (§14 — binding, no mid-run re-scores)

- The DIAG-GO bar is judged exactly as pre-registered:
  8/8 seeds fully decomposed (>= 6 required), dominant
  limiter named per seed and in band totals
  (field:DPS-TOO-LOW 9), rounds-to-kill arithmetic stated
  (66 rounds at medians, 63 median per-fight, cap 15).
  No metric was re-scored.
- One classifier correction made BEFORE judging, disclosed:
  tb net damage was first computed lead-fighter-only (the
  prereg's singular "monster fighter" wording). The 73672
  d148 influencer crew fight (4 monster fighters) showed
  the lead-only read hiding 252 damage dealt to a crew
  fighter. The classifier now sums net damage across ALL
  monster fighters matched by key (startMonsters/endMonsters
  counts + startOnlyKeys reported per row); band tb net
  median moved 242 -> 252, band limiters unchanged (the
  crew fight is DPS-TOO-LOW under either read: 0% lead-only,
  2.7% crew-total, both < 10%). The correction is in the
  sweep script, the summary was regenerated from the rows,
  and the proof re-derives the corrected numbers (171 PASS).
- Two display artifacts in the summary, stated so they are
  not misread: (a) per-seed rtkMedian 0 on 73673 and 73675
  means "no finite rounds-to-kill in the set" (73673: both
  fights deal 0 damage, so no DPS exists to divide by;
  73675: the single fight's start HP is null), NOT zero
  rounds to kill. medianOf([]) returns 0 in the sweep
  script; the evidence never cites those zeros as rounds.
  (b) 73675's field:TRUNCATED is the startHp-null ephemeral
  fight, assigned by the else-branch — its HP pool is
  unknown, so it cannot be a "would finish within the cap"
  case. A future prereg should add an explicit UNMEASURED
  limiter for startHp-null field fights instead of letting
  the else-branch claim them.
- One metric note for the NEXT run: "fully decomposed"
  passes vacuously on zero-encounter seeds (73674, 73678
  have no wave-4 fights to decompose). A future bar that
  wants to force encounter coverage should require a
  minimum encounter count per seed separately from
  decomposition completeness — proposed here, not applied
  retroactively (same note as the 1920Z arm).
- BALANCED PANEL (§15): attempted, not applicable — same
  recorder-corpus limitation as prior arms
  (balance-panel.js has no corpus-ingest mode). The paired
  identical-seed tables above are the comparison of record.
  No panel file is produced or faked.
- Telemetry-check was NOT run on recorder rows (its counts
  are wrong on recorder rows — standing instruction from
  the 0158Z evidence).
- check.js NOT run: zero src/js diff in this tree (DIAG arm,
  one new recorder policy + two new scripts only) and
  sibling loops are live; the arm's own proof is the
  det-gate + G2 identity + the 171-check proof + the
  detail census-match. node --check clean on all three new
  scripts.

### PROOF SCRIPTS (all in this tree, all run)

- scripts/policies/w4dmg-diag.js — NEW in this arm.
  Per-fight damage decomposition recorder (W4DMG=1): field
  rows (source split volley/ally/close-in, gear, abilities
  held, wounds-in, spawn seq) + tbEnd rows (round count,
  fighters at fight end for the start/end join).
- scripts/test-w4dmg-diag-sweep.js — NEW in this arm.
  Sweep (--one per seed via child processes, --summary
  rebuild, --detgate, --detail, --sense). Det-gate PASS,
  detail census-match PASS (73673), sense replay done
  (NON-MEASURED, see above).
- scripts/test-w4dmg-a.js — NEW in this arm. Proof:
  re-derives every summary number from the rows; 171 PASS,
  0 FAIL.
- Reused verbatim: scripts/policies/fieldfinish-diag.js,
  scripts/policies/nonworldkill-diag.js,
  scripts/policies/wave4enc-diag.js (no edits; spawnsrc-diag
  reused for linkage context only).

### INFRASTRUCTURE (loud, as required)

- /tmp WIPE MID-RUN (sibling-cleanup class, known hazard):
  the first full sweep's stdout log was redirected to
  /tmp/w4dmg-sweep.log; a sibling cleanup wiped /tmp mid-run
  and the sweep process died with it, after baseline 8/8 and
  armed 73671-73673. No corpus was lost: per-seed rows live
  in the worktree evidence dir, not /tmp. Recovery: re-ran
  only the missing armed seeds (73674-73678) via --one
  children writing directly to the evidence dir, then
  --summary rebuilt from the rows on disk. The re-baseline
  EXACT result and G2 PASS confirm the recovered corpus is
  the same corpus, not a substitute. Lesson re-learned:
  never redirect sweep output to /tmp while sibling loops
  are live; process-tracked output (no redirect) survived
  the second run intact.
- No EPERM flap hit this run: all node/shell disk writes
  succeeded (16 band rows, summary, evidence, sense text).
- No safe-commit refusal yet (commit step follows this
  file); the coordinator owns the --ff-only merge. No
  [needs-eyes]: this DIAG arm changes no feel, combat, or
  UI — that assessment did not change during the run.

### BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the wave-4 damage decomposition on
  band 73671-73678 — 25 fights, per-fight rows: field 12
  fights / 254 HP / median DPS 13 / rounds-to-kill 66 at
  medians vs a 15-round cap; tb 13 fights / median net
  20.1% / all lost. DIAG-GO (8/8 decomposed).
- FILLED (measurement): the dominant damage limiter —
  field DPS-TOO-LOW (9/12 field fights), with the tb channel
  split TRUNCATED 7 / DPS-TOO-LOW 6. A dominant limiter is a
  finding, not a fail.
- FILLED (measurement): the channel-reset structure — tb
  fights rebuild monster HP from the def (plus crew scale)
  and never inherit field wounds, so the two channels never
  combine damage. This is the mechanism behind "25 fights,
  zero kills" that the 1920Z encounter counts alone could
  not show.
- FILLED (measurement): the re-baseline is EXACT — the r41
  base reproduces the 1920Z trajectories on this band field
  for field, so future arms can compare per-seed against
  either table.
- DOCUMENTED, NOT FIXED (instrument gap): the 73672
  influencer 213-HP gap (field end 799 -> tb-start tile
  586, no recorded fight in between) — a daily world-entity
  HP tick would find it.
- DOCUMENTED, NOT FIXED (sense blank): wave-4 defeats are
  mourned and once hinted at (poison the meal, as an aside
  after a death), but never taught — no counter beat, no
  party call, no next step — while the wave-3 learning
  channel demonstrably works (Callback counter, d123).
- DOCUMENTED, NOT FIXED (policy confound): the scholar's
  six same-day tb losses to one algorithm cannot be split
  by this recorder into bot-policy persistence vs engine
  re-engagement.
- NOT A FINDING: no game bug was found in the field-fight
  or tb paths — source sums hold on all 12 field rows, the
  two independent field wraps agree on wave-4 counts on all
  8 seeds, every tb initiation joins to a tbEnd row, and
  the kill log agrees with the tb ends. The fights work as
  designed; villages lose them, and the damage does not
  carry across channels.

Convergence state: scale-onramp stays converging (NOT
converged): wave 5 still 0/8, wave-4 kills still 0/8, and now
the reason has a damage decomposition — the field channel
needs ~66 rounds at observed DPS against a 15-round cap,
the tb channel loses after removing a median fifth of the
pool, and the channels reset each other's damage. The wall
did not move; this arm measured exactly how thick it is,
fight by fight, hit by hit.
