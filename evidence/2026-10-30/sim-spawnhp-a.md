# sim-spawnhp-a — SPAWN-HP VARIANCE CENSUS, WILD WAVE-4

Run: flesh-out loop, run fleshout-20261030T0738Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-spawnhp-a.
Ranked next by run fleshout-20261030T0641Z (sim-recurrence-a
finding F-2 / ranked next #4, carried from sim-chainclose-a F-3).
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default
flip, no gate change, no deed-bar move, no damage buff. This arm
runs the owed spawn-HP census; it builds nothing.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-30/sim-spawnhp-a-prereg.md (commit 0edbdcb6e,
plus pre-sweep correction 0ea9d2644: the SPAWN-VARIANCE rule as
first committed demanded hp == maxHp even for a post-meeting
sighting, which a meeting's own wound makes impossible — the
corrected rule demands maxHp == opening on a trajectory-consistent
sighting, hp == maxHp only for a pre-meeting unwounded sighting;
no judged number existed when the correction landed).
Instruments: commit 0ea9d2644 (spawnhp sweep copy + analyzer +
fixtures; the sweep-copy diff shows only the prereg-disclosed
deltas).
VERDICT: DIAG-GO — all seven legs pass (see "Header vs result").
The measurement is complete; the game verdict is a census, not a
fix — and it closes the spawn-variance question on this band.

## Plain words first

Wild wave-4 beasts do NOT spawn with varying HP. Every wild beast
on this band spawns at exactly its type's floor HP — the census
proves it through each beast's own maxHp, which never sits below
the floor anywhere in the band (0 of 44 unmet census streaks, 0 of
10 met individuals). What varies is the HP beasts ARRIVE with,
because the world wounds them before first contact. The headline
wound is the palisade wall: when a raid drafts a world beast and
the village has a palisade, the wall takes exactly a quarter of
the beast's max HP as it comes over — 1100 becomes 825, 900
becomes 675, 850 becomes 637. All three of w4meet's mysterious
below-floor arrivals are that wound, to the number, including the
rounding (850 loses 213, not 212). One of them is a raid beast
wounded the same day it fights; one is a beast wounded days
earlier that then sat pinned at the haven tile for a week before
anyone met it in the field. A second, smaller wound channel is
ordinary recorded fights (a raid fight that closes at 1066 makes
the next wild meeting open at 1066). Three small wounds at the
haven tile have no recorded fight behind them at all — those stay
unexplained and are the next measurement's job, not a guess here.
Any future arm that prices a wave-4 fight should assume the beast
spawns at its floor and then ask what wounded it — never assume a
spawn roll.

## Header (pre-registered) vs result

- COMPLETENESS: 16/16 valid seeds AND all six recorders errs 0
  with overflow empty AND joins 100% AND breakline==w4dpr at every
  row AND shoutrec prefix-consistency at every row AND census
  files present/parseable for 16/16 seeds, snapshots sorted by
  day, final snapshot day within 1 of the seed's days, census
  entries carrying maxHp.
  RESULT: 16/16 rows valid; all six recorders errs 0, overflow
  empty; joins 2257/2257, 0 errors; breakline-vs-w4dpr mDealt
  agreement 2257/2257 (0 mismatches); shoutrec prefix-consistency
  751/751 checked, 0 violations; census 16/16 present, sorted,
  final day within 1 (s75102: 85 vs 86 days; s75104: 101 vs 102;
  s75113: 149 vs 150; s75114: 159 vs 160; all others exact),
  maxHp present on every census entry → PASS.
- SUBSTRATE-EQUIVALENCE: all 16 s<seed>-fresh.json rows
  byte-identical to chainclose's corpus rows.
  RESULT: 16/16 byte-identical → PASS. The maxHp census wrapper
  did not perturb the game, and this corpus IS the chainclose
  substrate. Wall numbers reproduce exactly (see below).
- CENSUS-COMPLETENESS (primary metric): EVERY wild wave-4
  individual on the band has an opening-HP row with exactly one
  provenance class; the per-type table aggregates exactly those
  individuals; every UNMET-CENSUS streak is listed separately.
  RESULT: 10/10 wild individuals classified (SPAWN-HP 5,
  WOUNDED-IN-CORPUS 1, OFF-CORPUS-WOUNDED 1, AT-FLOOR-OR-ABOVE 3,
  SPAWN-VARIANCE 0, UNDETERMINED 0); per-type table aggregates
  those 10 (never meetings); 44 UNMET-CENSUS streaks listed
  (streaks are NOT individuals — a wound splits a streak, see
  metric review) → PASS.
- PROVENANCE-CASES: all 3 named w4meet cases carry a verdict
  from classes 1-5, 0 UNCLASSIFIED (bare unknown).
  RESULT: all 3 reproduced exactly on this band (same seed, type,
  channel, day, opening HP) and all 3 classify OFF-CORPUS-WOUNDED
  with census evidence → PASS. On the w4meet corpus itself (no
  census there) all 3 classify UNDETERMINED with the missing
  instrument named — that gap is exactly what this band's census
  fills (legacy check: join 2248, 0 errors).
- DETERMINISM GATE: one seed re-run into a scratch EVID dir; row
  JSON byte-identical AND census JSON byte-identical; scratch
  removed.
  RESULT: seed 75102 re-ran byte-identical in full (row +
  census); scratch dir removed after the diff → PASS.
- SENSE BAR: EVERY below-floor first-meeting transcript on this
  band read end to end, PLUS the 3 named cases' transcripts.
  RESULT: 4/4 logs read (75102 audit 1066, 75116 audit 825,
  75113 influencer 637, 75113 eulogy 675 — the audit 825 log
  serves both the wild-individual set and the named-case set)
  → PASS.
- FIXTURE BAR: provenance decision tree in priority order,
  cross-seed chain separation THROUGH chainclose buildChains,
  censored=survived-only, census streak splitting + collision
  flagging, per-type aggregation over individuals, byte-identity
  comparator.
  RESULT: FIXTURES-PASS (33 checks, 0 fails, including the
  pre-sweep SPAWN-VARIANCE correction fixtures) → PASS.
- INSUFFICIENT-DATA: per-type variance claims for every type
  except audit (n=1-2) — descriptives shown, labeled thin, never
  judged as variance. Raid (n=4 meetings) and other (n=1) are
  INSUFFICIENT-DATA for shape claims, counts only, as in
  chainclose.
- VERDICT: DIAG-GO. Nothing failed.

## Q1 — the per-type opening-HP census (individuals, never meetings)

Def floors (src/data/monsters.json, wave 4): algorithm
[1000,1200], audit [1100,1300], congregation [900,1100], eater
[950,1150], eulogy [900,1100], herald [700,900], influencer
[850,1050], reunion [1200,1400], strike [1000,1200], suburb
[1300,1500]. No wild individual of any type opened ABOVE its
floor; every opening is the floor or a wound below it.

| Type | n | Min | Max | Mean | Variance claim |
|---|---:|---:|---:|---:|---|
| algorithm | 1 | 1000 | 1000 | 1000 | INSUFFICIENT-DATA |
| audit | 4 | 825 | 1100 | 1022.75 | VARIANCE (wound variance, see below) |
| eulogy | 1 | 900 | 900 | 900 | INSUFFICIENT-DATA |
| herald | 1 | 700 | 700 | 700 | INSUFFICIENT-DATA |
| reunion | 2 | 1200 | 1200 | 1200 | INSUFFICIENT-DATA |
| suburb | 1 | 1300 | 1300 | 1300 | INSUFFICIENT-DATA |
| congregation, eater, influencer, strike | 0 | — | — | — | NO WILD INDIVIDUALS (unmet streaks only) |

The audit variance (825–1100) is the whole band's variance story
in miniature, and it is wound variance, not spawn variance: the
four audit individuals' maxHp values are all 1100 (the floor).
1100, 1100 (spawn, seen unwounded), 1066 (raid-wounded in-corpus),
825 (tolled off-corpus). No audit — no beast of any type — shows
a maxHp below its floor.

Per wild individual (chain = (seed, mid) wound-continuity chain;
prior = earlier same-mid meeting any channel; pre-census =
sightings with day <= first meeting day):

| Individual | First | Opening | Floor | Ratio | Prior in-corpus | Earliest pre-census | Provenance |
|---|---|---:|---:|---:|---|---|---|
| s75102 algorithm (n=4) | d65 aid | 1000 | 1000 | 1.000 | raid d64 closed 986 (HP break — new beast) | d59 1000/1000 (5,5) | SPAWN-HP |
| s75102 audit (n=1) | d74 resolve | 1066 | 1100 | 0.969 | raid d73 closed 1066 | d74 1066/1100 (4,4) | WOUNDED-IN-CORPUS |
| s75102 eulogy (n=4) | d55 resolve | 900 | 900 | 1.000 | none | none pre-meeting | AT-FLOOR-OR-ABOVE |
| s75102 herald (n=1) | d74 aid | 700 | 700 | 1.000 | none | d65 700/700 (7,4) | SPAWN-HP |
| s75102 reunion (n=1) | d79 resolve | 1200 | 1200 | 1.000 | none | d53 1200/1200 (5,5) | SPAWN-HP |
| s75110 reunion (n=1) | d57 resolve | 1200 | 1200 | 1.000 | none | none pre-meeting | AT-FLOOR-OR-ABOVE |
| s75113 audit (n=1) | d145 resolve | 1100 | 1100 | 1.000 | none | d144 1100/1100 (4,3) | SPAWN-HP |
| s75114 audit (n=1) | d115 resolve | 1100 | 1100 | 1.000 | none | none pre-meeting | AT-FLOOR-OR-ABOVE |
| s75116 audit (n=1) | d139 resolve | 825 | 1100 | 0.750 | none | d133 825/1100 (4,4) | OFF-CORPUS-WOUNDED |
| s75116 suburb (n=1) | d140 resolve | 1300 | 1300 | 1.000 | none | d121 1300/1300 (4,2) | SPAWN-HP |

Provenance counts (wild individuals): SPAWN-HP 5,
WOUNDED-IN-CORPUS 1, OFF-CORPUS-WOUNDED 1, AT-FLOOR-OR-ABOVE 3
(opening == floor, spawn unproven for lack of a pre-meeting
census sighting — classified, not a spawn verdict),
SPAWN-VARIANCE 0, UNDETERMINED 0. Below-floor wild openings: 2
of 10 (1066 wounded-in-corpus, 825 off-corpus).

Instance-vs-type note (the algorithm row): the s75102 wild
algorithm opens at a fresh 1000 even though a raid algorithm
closed at 986 the day before — different beasts, same type. A
type-level tracker would call the algorithm "wounded to 986";
the instance-level census calls it a new spawn at the floor,
seen unwounded at d59 (1000/1000). The same discipline separates
the s75113 eulogy entities in Q2.

## Q2 — the 3 provenance verdicts (all reproduced, all OFF-CORPUS-WOUNDED)

All three reproduce EXACTLY on this band (same seed, type,
channel, day, opening HP as w4meet) — this is the same substrate
story told with a census attached, not a new band's coincidence.
The mechanism for all three is the raid palisade toll
(havenGrowth.js havenRaidTick): a raid drafts the nearest living
world monsters, moves them to the haven tile (village px/py,
default (4,4)), and — if the village has a palisade
(havenTier >= 2) — subtracts round(maxHp x 0.25) from current HP.
Lingering raiders are then re-pinned to the haven tile daily
(havenGrowthDaily) and drift off after ~6 nights with only the
lingering flag cleared — the entity stays in the world and can
later be met wild. The toll arithmetic, JS Math.round (halves
round up):

| Case | Floor | Toll round(floor x 0.25) | Opening | Ratio |
|---|---:|---:|---:|---:|
| 75113 eulogy, raid d136 | 900 | 225 | 675 | 0.750 |
| 75116 audit, wild d139 | 1100 | 275 | 825 | 0.750 |
| 75113 influencer, raid d127 | 850 | 213 (212.5 rounds up) | 637 | 0.749 |

- 75113 EULOGY 675 — OFF-CORPUS-WOUNDED (same-day draft toll).
  CORRECTED EVIDENCE (disclosed): the analyzer's computed
  (a)-branch evidence cited the d112 sighting (900 at (3,4)),
  but trajectory analysis shows that entity is NOT the d136
  beast: it drops to 675 at (4,4) on d113 (a toll-shaped
  draft, no meeting that day) and then vanishes from the census
  after d113 with no recorded fight. The d136 beast is the
  later entity, seen wandering at a full 900 from d116 through
  the d135–136 snapshot at (4,6). During d136 — after that
  morning's snapshot — the raid drafts it (haven pin + toll
  900 → 675) and the defense fight opens at 675, dealing 17
  (658 left). The next morning's census shows it at (4,4) with
  exactly 658 — toll 225 + fight 17 = the 242 drop from the
  d136 snapshot's 900. The class is unchanged by the
  correction (the wound channel is unrecorded in the meeting
  corpus either way); the cited sighting is corrected to the
  right entity. The d112→d113 drop stands separately as a
  second, independent toll demonstration on this seed.
- 75116 AUDIT 825 — OFF-CORPUS-WOUNDED (pre-sighting draft toll,
  then a week pinned at the treeline). The census NEVER shows
  this entity at 1100: its first sighting, d133, is already
  825/1100 at (4,4), and it sits at (4,4) at 825 through the
  d139 meeting. Spawn at the floor is proven by maxHp 1100;
  the wound predates the first sighting, so the draft day is
  before d133 (spawn and draft fell between snapshots, or the
  entity spawned before the census window's first sighting of
  it — the corpus cannot date the draft day, and this evidence
  does not pretend otherwise). Seven days pinned at the haven
  tile is the lingering-raider signature (daily re-pin); the
  d139 wild meeting lands at the drift boundary. After the
  meeting (vFlee, 785 left) the audit never reappears in the
  census — a post-meeting disappearance, candidate the
  scholar-melt sink (recurrence F-1), unproven per-entity (see
  findings).
- 75113 INFLUENCER 637 — OFF-CORPUS-WOUNDED (same-day draft
  toll). The census shows the influencer only on d126–127 at
  (5,4), full 850/850. The d127 morning snapshot still shows
  850; during d127 the raid drafts it (toll 850 → 637) and the
  defense fight opens at 637, dealing 19 (618 left). After the
  fight (vFlee) it never reappears in the census — again a
  post-meeting disappearance with no recorded removal (same
  candidate, same caveat as the audit).

What the toll is NOT: the alienPlayers ~2906 lead is REFUTED as
a spawn explanation. That line sits inside apBeamHit, the alien
beam-damage resolver: its only callers are the tbDamage wrap
(when damageType is alien_beam, inside an existing turn-based
fight) and one 0-damage telegraph call. It never spawns a
monster, never sets world HP, and its 0.9–1.1 band is beam damage
against a fighter's maxHp — while 825/1100 = 0.75 sits outside
that band anyway. Do not cite it for spawn HP.

Caveats stated plainly: (1) the corpus does not record
havenTier, so "palisade present" is inferred from the toll
signature (exact amount + haven-tile pin), not directly
observed; (2) the census carries no entity IDs — entity
identity across a vanish gap is trajectory continuity
(hp + tile + day adjacency), which is why the eulogy evidence
needed the correction above; (3) a raid draft that wounds an
entity nobody ever meets leaves no meeting at all, so toll
drops on unmet entities are draft-shaped but not
meeting-anchored (see Q3).

## Q3 — spawn variance is zero; opening variance is wound variance

MaxHp census (the spawn instrument): 0 of 44 UNMET-CENSUS
streaks has maxHp below its def floor, and all 10 met
individuals' trajectories have maxHp equal to their floors.
Every unmet streak FIRST appears at its floor (or, for
wound-split streaks, at a wounded value whose maxHp is still
the floor). There is no below-floor spawn on this band. A
future arm should treat wild spawn HP as the floor, exactly,
and price wounds — not spawn rolls.

Band-wide wound census (derived observation, NOT a GO leg —
adjacent-day census drops for wave-4 ids, first-entry-per-day,
same-entity approximation; method and caveats in metric
review): 29 adjacent-day hp drops. 18 are pure toll-shaped
(drop == round(maxHp x 0.25) AND new tile (4,4), no recorded
meeting that day). The other 11 decompose as: 6 recorded-fight
reflections (the next morning's census showing a meeting's
dealt damage: s75102 eulogy d57, algorithm d66/d71, herald d75,
audit d75, s75113 audit d146); 1 toll+fight combo (s75113
eulogy d137: 242 = 225 toll + 17 fight); 1 twin-pair artifact
(s75102 algorithm d72: 959 → 986 is the raid twin replacing
the wild entity in the per-id sequence, not a heal — the
per-id sequence cannot separate same-type entities); and 3
UNEXPLAINED drops, all at (4,4), all with zero recorded
meetings (any channel) that day:

| Unexplained drop | From → to | Drop | Toll would be |
|---|---|---:|---:|
| s75105 suburb d128 | 975 → 872 | 103 | 325 |
| s75114 reunion d126 | 900 → 745 | 155 | 300 |
| s75114 algorithm d159 | 750 → 624 | 126 | 250 |

These three are neither toll-shaped nor recorded-fight wounds.
The live candidate family is scholar turn-based combat (the
corpus's unrecorded channel — a tb wound followed by a
flee-respawn at wounded hp would land exactly like this), but
that is a candidate, not a verdict: no tb recorder exists to
split it. The same gap covers the post-meeting disappearances
in Q2 (influencer after d127, audit after d139, the d113
tolled eulogy after d113): entities that should still be in
the world are gone with no recorded removal. Recurrence's
scholar-melt sink (tbEnd restores only titans/lingering
raiders) is the prime candidate for those three as well —
again unproven per-entity.

Raid appendix (counts only, INSUFFICIENT-DATA for shape
claims): 4 raid wave-4 meetings — s75102 algorithm d64
1000 → 986, s75102 audit d73 1100 → 1066, s75113 influencer
d127 637 → 618, s75113 eulogy d136 675 → 658. Note the first
two open AT their floors — no toll applied on their draft
nights (whether for lack of a palisade or another draft path,
the corpus cannot say, and this evidence does not guess). The other wave-4
meeting is s75110 eater d51, expedition evade, hp null.

## Q4 — sense-test (4/4 logs read end to end)

SENSE-PASS. All four below-floor transcripts read as fights
against beasts that arrive already wounded — nothing in any
story explains the pre-meeting wound, and nothing contradicts
it either (no "fresh from the dark" line, no prior-fight
reference, no wall-wound narration at meeting time):

- s75102 audit 1066 (vDie, 3 rounds, 58 dealt): Mateo fights
  with bow-but-no-arrows, strikes in melee anyway, dies at
  0 after Terrence's 4-damage join. The story is a clean
  losing fight; the 1066 opening (34 below floor) is
  invisible in-story — the raid fight that caused it happened
  the day before, off this transcript.
- s75116 audit 825 (vFlee, 3 rounds, 40 dealt): Miguel at 1 HP
  ("runs while running still works"), Isabel joins for 3.
  The beast ends at 785, standing — exactly the census story
  (sat a week at 825, met, wounded, then gone).
- s75113 influencer 637 (vFlee, 2 rounds, 19 dealt): Maame
  strikes twice, flees at 20 HP. No line marks the beast as
  wall-wounded; the toll happened hours earlier, off-screen.
- s75113 eulogy 675 (vDie, 2 rounds, 17 dealt): Maame dies to
  "Final Chapter" at 0. Same invisibility: the wall wound has
  no meeting-time narration.

Sense note (design observation, not a lever): the palisade
toll's narration lives at draft time (the raid beat), never
at the meeting — so a player meeting a tolled beast meets a
wound with no story. Whether that wound should be narrated
at first meeting is a design question for a later arm, not a
finding of this one.

## Wall numbers (this band, own corpus, 16 seeds, 180d, report-only)

Same upper-middle median convention as chainclose; this
corpus's wall numbers are IDENTICAL to chainclose's (a
consequence of the byte-identical rows, reported here as this
run's own corpus, never as a before/after).

- Wins: 9/16, all lesser seats (full 0). National ever: 13/16.
  National final: 11/16. Table reached: 12/16. Table entered: 9/16.
- Wave reach (unlock flag): wave 1: 16/16, wave 2: 16/16, wave 3:
  14/16, wave 4: 9/16, wave 5: 0/16. (Wild wave-4 CONTACT is
  5/16 seeds, so unlock still overstates contact.)
- Median survival: 118d (days sorted [31, 86, 90, 99, 102, 114,
  115, 115, 118, 128, 150, 160, 165, 180, 180, 180]; statistical
  median 116.5d, noted for comparability).
- Deaths: 527 total. Starvation: 3.
- Death causes (527): villager:combat 219, villager:villager
  combat 140, player:the wild 63, villager:expedition 42,
  villager:monster 18, rest small. This band does not starve;
  it is killed in combat.

## Census counts only (no lever judgment)

- Raid wave-4: 4 (see appendix above). INSUFFICIENT-DATA.
- Other wave-4: 1 (s75110 eater d51, hp null, evade).
  INSUFFICIENT-DATA.
- Wild wave-4 per seed: 75102: 11 meetings / 5 individuals;
  75116: 2 / 2; 75110/75113/75114: 1 each; all other seeds: 0.
  Contact remains concentrated: one seed holds 11/16 wild
  meetings.
- UNMET-CENSUS streaks: 44 (streaks, NOT individuals — see
  metric review). 27 streak-collision days band-wide (two
  same-id entries one day); 0 on the named-case seeds 75113
  and 75116, so no named verdict rides a collision.

## RANKED NEXT (with numbers — no lever built here)

1. TB-COMBAT RECORDER (split the remainder). 3 unexplained
   (4,4) drops (103/155/126) + 3 post-meeting disappearances
   (influencer, audit, d113 eulogy) all sit in the corpus's
   unrecorded channel. A record-only tb-combat recorder (same
   pattern as the census: read state, feed no decision) that
   logs scholar-vs-world-monster encounters (mid, world HP
   before/after, tb outcome, fled-respawn hp) would split
   scholar-melt from scholar-wound-respawn from raid-clear —
   and would prove or kill the scholar-melt sink at band
   scale. Until then, no lever should claim to "stop beasts
   vanishing" or "explain every wound".
2. RAID-DRAFT RECORDER (turn the toll inference into proof).
   18 pure toll-shaped drops + 2 same-day toll meetings rest
   on amount + haven-tile pin; the corpus never records a
   draft event or havenTier. A draft recorder (day, entity
   hp/maxHp before/after, palisade flag) would date the
   75116 audit's pre-d133 draft and confirm the palisade
   condition directly instead of by signature.
3. SPAWN-VARIANCE — CLOSED on this band. 0 below-floor maxHp
   in 44 streaks + 10 individuals. Future arms should NOT
   re-run a spawn census on this band; they should assume
   floor spawn for wild entities and price wounds. Any future
   below-floor opening is a wound to explain, not a spawn to
   measure.
4. TOLL-VISIBILITY DESIGN QUESTION (steve-call candidate, not
   a lever): tolled beasts arrive wounded with no meeting-time
   narration of the wall wound (Q4). Whether first meetings
   should name the wall wound is a design ruling, not a
   measurement.
5. RAID-SHAPE WAVE-4 — INSUFFICIENT-DATA (n=4). Do not judge
   any raid-shape lever from 4 meetings.

## Findings-backlog items found (reported to the coordinator; NOT appended to sim-findings.md by this worker)

- F-1 (mechanism, code + census): the raid palisade toll
  (havenRaidTick: drafted world monsters lose round(maxHp x
  0.25) at a palisaded haven) explains all 3 w4meet
  below-floor arrivals exactly (675/825/637, including the
  212.5 → 213 rounding), plus 18 pure toll-shaped census
  drops band-wide. The toll is a routine wound channel, not a
  one-off.
- F-2 (census result): spawn-HP variance is ZERO on this
  band — no wild entity spawns below its def floor (maxHp
  census: 0/44 streaks, 0/10 individuals below floor).
  Opening-HP variance (audit 825–1100) is wound variance.
- F-3 (measurement gap): 3 unexplained haven-tile drops
  (103/155/126, no recorded meeting) + 3 post-meeting
  disappearances need the tb-combat recorder to split
  (scholar-melt vs wound-respawn vs raid-clear).
- F-4 (instrument caveat, from the eulogy correction): the
  (id, hp, tile) census cannot prove entity identity across a
  vanish gap — trajectory continuity is the best available,
  and it misattributes on first pass (d112 vs d116 eulogy
  entities). A draft/spawn recorder with entity ids would
  close this.
- F-5 (carried observation): wild wave-4 contact remains
  concentrated (5/16 seeds, one seed holding 11/16 meetings)
  while unlock is 9/16 — the encounter-rate gap bounds every
  wave-4 claim to a handful of villages.

## Guards (reported, not judged — this arm changes nothing)

- Death causes (527 total) and wall numbers are reported above; no
  guard moves under a measurement-only arm.
- No guard can move under a measurement-only arm.

## Metric review (for the NEXT run — nothing re-scored here)

- CENSUS ENTITY IDENTITY (the eulogy correction): the
  prereg's provenance classes assume a census sighting belongs
  to the individual's entity, but the census keys (id, hp,
  tile) — no entity id. The analyzer's (a)-branch picked the
  d112 sighting for the d136 eulogy; trajectory reading
  (vanish gap d114–115 + fresh 900 entity d116+ + post-meeting
  658 at (4,4)) corrects it to the right entity without
  changing the class. Future preregs needing entity identity
  should require a draft/spawn recorder, or preregister the
  trajectory-continuity rule (hp + tile + day adjacency, with
  vanish gaps breaking continuity) instead of "any sighting
  before the meeting".
- STREAKS ARE NOT INDIVIDUALS: a wound splits a census streak,
  so one entity wounded twice counts as three streaks. The 44
  UNMET streaks must never be quoted as 44 unmet individuals;
  the honest unmet-entity count needs entity ids the census
  does not carry. The streak list is still valid for its
  stated purpose (first-appearance maxHp values, all floors).
- ADJACENT-DAY DROP METHOD (derived observation, not a leg):
  the per-id day sequence conflates same-type entities when
  one vanishes and another appears the next day (the
  959 → 986 "increase" is the raid/wild algorithm twin pair,
  not a heal). Increases are flagged, never treated as heals;
  toll-shaped drops require the haven-tile pin as well as the
  amount, which is what keeps a fight wound from passing as a
  toll (fight wounds land on the meeting's tile, tolls on
  (4,4) — except meeting-day toll+fight combos, which the
  method puts in "other" and the evidence reads by hand, as
  with eulogy d137).
- SPAWN-VARIANCE CORRECTION (pre-sweep, disclosed): as first
  committed, the class demanded hp == maxHp even for a
  post-meeting sighting; a meeting's own wound makes that
  impossible. The corrected rule (maxHp == opening on a
  trajectory-consistent sighting) is what the fixtures prove
  (33 checks). No judged number was affected: the only
  SPAWN-VARIANCE-shaped case in-band (75116 audit) is
  classified OFF-CORPUS-WOUNDED under both wordings, because
  its first sighting is already wounded (hp < maxHp).
- AT-FLOOR-OR-ABOVE (3 wild individuals): worked as designed
  — opening == floor with no pre-meeting census sighting is
  classified but NOT claimed as proven spawn. Keep the class
  distinct from SPAWN-HP; collapsing them would overclaim.
- MEDIAN-DAYS CONVENTION (carried): the analyzer reports the
  upper-middle row (118d); the statistical median is 116.5d.
  This evidence quotes 118d for comparability and notes 116.5d
  here.
- TOLL-SHAPE DERIVATION (post-hoc observation, not a leg):
  the 18/29 toll counts were computed from the committed
  corpus files after the judged analysis, by the stated
  adjacent-day rule. They are reported as an observation that
  corroborates the mechanism, never as a GO leg — the GO legs
  are the preregistered census + provenance classes, which
  were computed by the committed analyzer before this
  derivation.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no
wall number — by design, it is diagnosis — but it closes a
question chainclose left open (F-3) and recurrence confirmed
(F-2): spawn HP does not vary, so the wave-4 HP a village
faces is floor-minus-wounds, and the wounds now have names
(toll, recorded fights) with only 3 drops + 3 disappearances
left to the tb recorder. The next arm that claims movement on
this axis must move a measured quantity — a tolled beast kept
unwounded, a wound explained, a disappearance split — not
re-describe spawn variance.

## Infrastructure notes

- Sweep wall: ~21 min for 16 seeds under sibling load (~80s/seed
  including the full recorder stack + census; chainclose's
  16-seed sweep took ~4.5 min under lighter load — the difference
  is sibling load, not the harness).
- Safe-commit index clobber hit both worker commits (prereg,
  instruments) — repaired via HEAD-blob cacheinfo each time
  with hash verification, never reset, never forced, commits
  verified correct. Same clobber class as the 2026-10-29 loop
  notes.
- Seed 75102's corpus row is byte-identical to chainclose's, and
  the determinism re-run of 75102 is byte-identical in row +
  census — the base did not move under this run for the shared
  seed.
- Scratch dir (determinism re-run of s75102) removed after its
  diff; the worktree holds only committed work plus the corpus
  committed with this file.
- Analyzer exits 0 (COMPLETENESS-PASS, SUBSTRATE-PASS);
  fixtures FIXTURES-PASS (33 checks, 0 fails); determinism
  DETERMINISM-PASS; sense read 4/4 logs (SENSE-PASS by reading).
- No live verification, no push, no bump: this arm reports
  "branch ready for coordinator merge, pending ship" per
  assignment. The batch ship job owns pushes. Sibling loop B may
  move master under this branch; if it does before the
  coordinator merges, rebase cleanly and re-run the proof
  (rebase conflict = FAIL LOUDLY, no force, no merge) — the
  coordinator owns that step, not this worker's final report.

## Files

- Corpus: evidence/2026-10-30/perseed-spawnhp-a/s75101–s75116-fresh.json
  (16 rows, byte-identical to perseed-chainclose-a) +
  census-s75101–s75116.json (16 daily world-monster censuses
  with hp/maxHp/veteran/variant) + summary.json (corpusOk true,
  censusOk true) + analysis.json (analyzer output: joins,
  chains, individuals, per-type table, named cases, unmet
  streaks, wall, substrate).
- Analyzer: scripts/analyze-spawnhp-a.js (chainclose buildChains
  required, never re-implemented; provenance taxonomy;
  census streaks; named cases; legacy w4meet cases mode).
- Sweep: scripts/sweep-spawnhp-a.js (verbatim copy of the
  recurrence sweep with the three prereg-disclosed deltas;
  diff shows only those deltas).
- Fixtures + determinism: scripts/test-spawnhp-a.js (33 checks;
  --determinism <seed> re-runs one seed to scratch and diffs
  row + census, then removes scratch).
- Prereg: evidence/2026-10-30/sim-spawnhp-a-prereg.md (0edbdcb6e,
  correction 0ea9d2644).
- Instruments: scripts/sweep-spawnhp-a.js +
  scripts/analyze-spawnhp-a.js + scripts/test-spawnhp-a.js
  (0ea9d2644).
