# Trick-availability census — Loop A, run fleshout-20261104T0215Z, arm sim-trickcensus-a

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: zero src/js, zero policy-file changes, zero gate/price/deed/
standing changes. This arm censuses trick/ability availability in
wave-4+ turn-based (TB) fights; it fixes nothing — the fix arm is
named precisely at the end, with its own prereg sketch.

## Pre-registration (committed before any judged sim)

`evidence/2026-11-04/sim-trickcensus-a-prereg.md` (commit
f7a2d87f9, with the calibration leg). Policy
`scripts/policies/competent.js` `{competent}` VERBATIM (at THIS
anchor), default env. Pilot seeds 99101–99108, confirm seeds
99109–99116, horizon 140 days death-aware. Balanced panel (§15):
INAPPLICABLE — pure diagnostic, no before/after change, so no
comparison is fabricated; the census is the instrument and the
pre-registered threshold below is the judge.

Primary metric: trick-bar census completeness on the pilot.
DIAG-GO iff ALL hold on the pilot: (a) trick bar status +
shortfall cause for all 8 seeds; (b) per-villager trick inventory
with source for every fighter in TB fights, 0 fighters
unclassified; (c) one named lever with numbers; (d) sense-test:
at least 3 transcripts read (a trick pressed, a trick
available-but-unpressed, a villager learning or being taught)
and judged for meaning.

Instrument commit 846dad552 (proof
`scripts/test-trickcensus-20261104.js` 17/17, later 18/18 after
the round-1 correction below). Analyzer correction commit
6156251e (scripts-only: round-1 census moved from the empty
pending buffer to the availability log — see metric review;
no judged number changes, since the pilot/confirm JSONs
already contained the availability log).

## Calibration gate — DIVERGED on survival, AGREED on structure, RE-BASELINED

Calibration leg (unjudged, seed 99107 only,
RUN=trickcensus-calib): days 71, village-lost, maxWave 3,
spawnsW4 0, TB 0, kills 0, scale village, endUnlockedWave 3,
peak unmoved by the end call — against 2315Z's days 38 with the
same structural zeros. Survival moved (38 → 71 days); the
structure did not. Consequence, as pre-registered: the judged
baseline for this arm is the pilot leg itself, on current
master. 2315Z totals are NEVER cited as this arm's baseline
and never pooled with pilot numbers. (Descriptive anchor
contrast only: the pilot below has 26 TB fights where 2315Z
had 51 on the same seeds — the band moved again, in the
direction of fewer TB conversions: 26 TB starts from 43
wave-4 spawns here, vs 51 from 58 at 2315Z. That move is
reported, not judged; its cause is outside this arm.)

## The answer in one paragraph (plain words)

The tricks bar is not the problem, and it never was: every
village in all 16 seeds ends with 17–30 known tricks against
a demand of 3, learned mostly by being taught at the haven
(17–28 taught discoveries per seed). The problem is everything
the bar does NOT count. Wave-4 beasts carry no counter field,
so no wave-4 trick can ever add to the bar — and the village's
separate wave-4 signature knowledge (learned by surviving two
field encounters) reaches a turn-based fight almost never: in
48 TB fights, exactly ONE fighter entered a fight knowing the
beast's trick, and he could do nothing with it, because no
move in the game plays a wave-4 signature — the policy's trick
player only handles wave 1–2 counters. Meanwhile the fighter's
own abilities barely reach fights at all: scholars hold a
pressable combat ability in only 4 of 48 fights, and in those
4 the policy presses Rage and only Rage — 12 presses, 0
strikes afterwards, 0 damage — because pressing Rage again
next round beats striking, and the one defensive button
(pocket_sand) sits behind a flee rule that fires first. The
village knows plenty of tricks; the fighter in a wave-4 fight
has almost none of them, and the one he has, he wastes.

## Judged legs — wall numbers

Pilot (99101–99108): days 140, 127, 118, 139, 84, 96, 71, 68
(median 107); 1 survived to horizon, 7 lost; wins 0/8,
national 0/8, table 0/8, scale village 8/8; maxWave 4 on 6
seeds, 3 on 2; wave-4 spawns 43, TB starts 26, field wave-4
calls 20, wave-4 kills 5 (4 TB-linked, 1 field); wave-5 faced 0.
Confirm (99109–99116): days 99, 140, 71, 98, 72, 70, 89, 94
(median 91.5); 1 survived, 7 lost; wins 0/8, national 0/8,
table 0/8; TB starts 22, wave-4 kills 2 (both TB-linked);
wave-5 faced 0. Pooled: 48 TB fights, 265 recorded player
turns (rounds 2+; plus 48 round-1 closing moves, see below),
7 wave-4 kills, 0 wave-5, 0 wins, 0 national, 0 table.
Standing-sufficient days (capped >= 200) pooled: 87, and
veterans is short on ALL 87 — the door's binding bar is
veterans, not tricks, on every standing-sufficient day.
Only one seed in 16 ever holds 2 veterans at once (99110,
best veterans 2) and it still never reads ready (best
armored 3 < 4). Instrument health pooled: 0 instrument
errors; 1 orphan TB end (confirm 99116, see below); 0
unclassified fighters.

## (a) Per-seed bar table — tricks met everywhere, veterans bind

End bars = final daily snapshot; best = best day per bar;
short-days = days each bar is short across the run's daily
snapshots. Demand (wave 5): armored 4 @ P>=15, armed 6,
tricks 3, veterans 2.

| seed | days | end | end bars a/ar/t/v | best a/ar/t/v | trick-short days | short on capped>=200 days | cause |
|------|------|-----|-------------------|---------------|------------------|---------------------------|-------|
| 99101 | 140 | survived | 7/7/22/0 | 8/12/22/1 | 3 | veterans (8d) | tricks-met |
| 99102 | 127 | lost | 0/1/26/0 | 6/12/26/1 | 3 | — (0 capped days) | tricks-met |
| 99103 | 118 | lost | 2/2/22/0 | 5/11/22/1 | 6 | — | tricks-met |
| 99104 | 139 | lost | 0/0/22/0 | 9/12/22/0 | 5 | veterans 32d, weapons 12d, armor 11d | tricks-met |
| 99105 | 84 | lost | 0/0/20/0 | 8/12/20/0 | 3 | veterans 13d, weapons 9d, armor 2d | tricks-met |
| 99106 | 96 | lost | 2/5/30/0 | 6/12/30/0 | 3 | — | tricks-met |
| 99107 | 71 | lost | 2/4/21/0 | 4/11/21/0 | 7 | — | tricks-met |
| 99108 | 68 | lost | 2/2/19/0 | 6/12/19/0 | 5 | — | tricks-met |
| 99109 | 99 | lost | 1/1/22/0 | 7/11/22/0 | — | — | tricks-met |
| 99110 | 140 | survived | 1/5/22/0 | 3/12/22/2 | — | — | tricks-met |
| 99111 | 71 | lost | 5/7/17/0 | 7/12/17/0 | — | — | tricks-met |
| 99112 | 98 | lost | 4/5/29/0 | 6/12/29/0 | — | — | tricks-met |
| 99113 | 72 | lost | 3/7/20/0 | 5/12/20/0 | — | — | tricks-met |
| 99114 | 70 | lost | 2/3/25/0 | 7/12/25/0 | — | — | tricks-met |
| 99115 | 89 | lost | 0/1/19/0 | 5/12/19/0 | — | — | tricks-met |
| 99116 | 94 | lost | 0/0/26/0 | 4/12/26/0 | — | — | tricks-met |

Reading: the tricks bar is short only in the first days of a
run (3–7 days per pilot seed, before counters are learned)
and met at end on 16/16 seeds. No seed's shortfall cause is
ever "tricks" in the binding sense: on standing-sufficient
days the short bars are veterans always, armor/weapons
sometimes, tricks never. The bar's cause class is
"tricks-met" on all 16 seeds, with the wave-4 signature state
reported alongside (below) rather than folded into the bar —
folding it in would be a category error, since the bar
cannot count wave-4 kinds by construction (see taxonomy).

## Taxonomy (code-verified, not assumed)

- BAR tricks = `monsterCounterKnown` over `state.monsterCounters`,
  which REQUIRES a `counter` field on the monster def. Only
  wave 1–2 defs carry one. Wave-4/5 kinds can never move the
  bar, however well the village knows them.
- Wave-4/5 trick knowledge = `state.villagerTricks` (signature
  defs in `Game.villagerTrickDefs()`, 10 wave-4 kinds), fed by
  the 2-observation bar (`state.villageCounterObs`) plus
  `state.villageSlain` teaching counts. Learned, never counted.
- Fighter abilities in TB fights = the scholar's System
  abilities (`state.scholar.abilities`) surfaced as
  `activatableAbilities()` combat actions. The competent
  policy presses them only through `abilityPressPlay`'s fixed
  cascade (turncoat, war_cry, bird_strike, pocket_sand,
  freeze_tag, fear_aura, rage) and plays beast tricks only
  through `beastTrickPlay`, which attempts ONLY known or
  hint-known counter-field kinds. A known wave-4 signature
  has no policy verb at all.
- Trick knowledge is VILLAGE state, not per-villager state:
  no fighter carries a personal trick store. Per-fighter
  inventory below is therefore scholar abilities + gear for
  the scholar, gear for allies, and village-known tricks at
  village level. Any per-villager source the engine does not
  store is reported as "unknown, needs instrument" — none
  was needed: every TB fighter's inventory is classified.

## (b) Per-fighter inventory in TB fights — 0 unclassified

All 48 exposures carry a fight-start inventory (scholar
abilities, activatable combat actions with available/why,
monsterCounterKnown / villageKnowsTrick / villagerTricks /
villageCounterObs / villageSlain for the fought kind, bar
trick count, readiness-5 bars) and a fight-end inventory.
Party fighters all carry gear records (armor P, armed) —
allies are armed in every recorded party, armor P 9–47.

Scholar holdings per fight (pilot, the pattern confirm
repeats): 1–6 abilities, almost always passive/info kinds
(beast_calm, lucky_rock, green_whisper, green_thumb,
iron_stomach, cornucopia, rain_dancer, echo_location,
night_eyes, second_skin, the_touch, pyrokinesis, ...). A
cascade ability (one `abilityPressPlay` will ever try) is
held in only 4 of 48 fights pooled: pocket_sand in 2 pilot
fights, rage in 2 pilot + 2 confirm fights. Bird Strike,
war_cry, turncoat, freeze_tag, fear_aura are held in 0 of
48 fights. That is the first availability fact: the pressable
set reaches the fighter in 4/48 fights (8%), not because
the buttons are missing — 5–9 combat actions are available
at fight start in essentially every fight (read_stance,
take_aim, walk_in, haymaker, tripwire, field_medicine,
stare_down, dead_aim_shot, set_ambush, read_fight, dowsing,
compost_king, ...) — but because the policy's cascade tries
only 7 named abilities, and scholars rarely hold one.

Per-fight availability vs pressed (pilot fights, confirm
same shape):

| fight | kind | outcome | avail at start (n) | pressed | never pressed (sample) |
|-------|------|---------|--------------------|---------|------------------------|
| 99101-1 | eulogy | won | 9 | — | all 9 incl. pocket_sand |
| 99102-1..3 | eulogy/algorithm/reunion | lost | 6/4/5 | — | all |
| 99103-1..6 | eulogy x5, reunion | lost/won | 4–5 | — | all incl. pocket_sand (fight 1) |
| 99104-1..6 | eater, eulogy x5 | lost | 6–7 | — | all |
| 99105-1..4 | congregation x3, influencer | won/lost | 5–6 | — | all |
| 99105-5 | reunion | lost | 8 | rage x2 | other 7 |
| 99105-6..9 | reunion, eulogy x3 | lost | 5–8 | — | all |
| 99106-1 | eulogy | lost | 7 | rage x2 | other 6 |
| confirm | (22 fights) | — | — | rage x2 in 2 fights (99109 eater, 99116 algorithm) | all else |

Pooled: 12 ability presses, all rage, in 4 fights; 0 presses
of any other ability in 48 fights; 0 ability-or-trick damage
(0 such hits, 0 damage) across the whole corpus. Ability
presses do not damage directly (rage buffs strikes), so 0
ability damage is expected for rage — but 0 strikes follow
any press (see below), so the buffs buy nothing either.

## Wave-4 signature knowledge — learned late, used never

End-of-run wave-4/5 knowledge, per seed (obs = observations
of 2 needed; slain = villageSlain count):

| seed | kinds with any trace at end |
|------|------------------------------|
| 99101 | eulogy slain 1 |
| 99102 | influencer slain 1; reunion obs 1 |
| 99103 | reunion obs 1; eulogy obs 1, slain 1; **eater KNOWN (obs 2, day 110)** |
| 99104 | eulogy obs 1 |
| 99105 | congregation obs 1, slain 2; influencer obs 1 |
| 99106 | **eulogy KNOWN (obs 2, day 94)** |
| 99107–99108, 99111, 99114 | none |
| 99110 | congregation slain 1; influencer slain 1; audit obs 1; reunion obs 1; algorithm obs 1 |
| 99112–99113 | eulogy obs 1 |
| 99115 | reunion obs 1; suburb obs 1; eulogy obs 1; **algorithm KNOWN (obs 2)** |
| 99116 | **audit KNOWN (obs 2)**; algorithm obs 1 |

Pooled: 4 seeds learn one wave-4 kind each; 16 kind-slots sit
at exactly 1/2 observations at end of run (the second
survived encounter never comes); 0 seeds learn two kinds.
Learning channels (tele events): bar counters are taught
(17–28 'taught' discoveries per seed — the haven teaching
channel dominates); wave-4 observations arrive ONLY from
field-fight survivals (vFlee/mFlee/evade) and node-witness
kills, by individual villagers (e.g. visjoin_82 twice for
the eater, visjoin_91 twice for the eulogy). TB fights feed
the observation bar ONLY on fled/routed/calmed outcomes
(`noteScholarTrickObservation` in the tbEnd path) — and the
corpus has 0 fled, 0 routed-by-player, 0 calmed TB fights
(42 lost, 6 won). So 48 TB fights — the village's main wave-4
contact — contribute 0 observations. Won TB fights do not
feed the bar at all (only the slain path, which teaches the
codex hint for wave 1–2, not a wave-4 signature).

Timing kills the two pilot completions: the eater is known
day 110 on 99103, but that village's last eater TB fight was
day 80 and it dies day 118; the eulogy is known day 94 on
99106, its only eulogy TB fight was day 92, and the village
dies day 96. Knowledge arrives after its use, or days before
death with no rematch. The confirm completions sharpen the
point rather than softening it: algorithm known on 99115 and
audit known on 99116 — and the audit fight IS in the corpus
(see below).

### The one known-trick fight (99116, audit, day 95)

The single fight in 48 where the fighter entered knowing
the beast's trick: villageKnowsTrick true, obs 2/2, sig
def "Be inefficient on purpose". The fight: round 1 closing
move, round 2 move, round 3 move, round 4 one strike for 17
(audit's hide absorbs 10), lost. No trick verb is attempted,
because none exists: `beastTrickPlay` only handles
counter-field kinds, and the audit has no counter field.
Available combat actions at fight start: exactly one
(field_medicine), never pressed. Knowledge without a verb
reads as decoration — the fighter knew the trick and still
fought it as a stranger, because the game gave him no move
for what he knew.

## The Rage loop, reproduced smaller (and once, larger)

Pilot rage fights (99105 reunion, 99106 eulogy): 2 presses
each, rounds 2–3, verbatim trio ("The red comes down. Your
next 3 strikes deal +100% damage." / "You focus — that
costs your action." / "−60 kcal"), then moves, then death;
0 strikes in either fight, 0 damage. Confirm rage fights
(99109 eater, 99116 algorithm): 4 presses each, rounds 2–5,
same trio x4, then moves, death; 0 strikes. Pooled: 12
presses, 720 kcal, 0 strikes, 0 damage. Mechanism (code):
`abilityPressPlay` presses rage whenever the fighter is
"winning" (HP >= 50%) and the fight is non-trivial, and rage
has no once-per-fight gate (unlike Bird Strike, gated once
per fight) — so next round it presses again instead of
striking. The loop ends when HP falls below 50% and fleeing
takes over. At 2315Z the same loop ran 10 presses in one
fight; here fights are shorter, so it runs 2–4 — same loop,
less room. The once-per-fight gate (or strike-when-buffed)
remains the specified fix, but it is NOT this arm's named
lever: it touches 4 of 48 fights.

## Pocket_sand and the flee order (a second, measured waste)

Pocket_sand is held in 2 pilot fights and available on every
recorded action in both (6/6 availability logs, why null),
yet pressed 0 times. Mechanism (code, verified): the policy's
fight order runs the flee check (HP < 35% → retreat) BEFORE
`abilityPressPlay`, and pocket_sand's losing window is
HP < 50%. In 99103 fight 1 the fighter jumps from 58.5% to
31.5% in one round — straight past the 35–50% window — and
the losing turn goes to a flee move, never reaching the
press. In 99101 fight 1 the fighter never drops below 50%
(a win in 5 turns), so the losing-only button never arms.
Available (engine) ≠ pressed (policy order): the defensive
button's window and the flee response compete for the same
turn, and flee wins. Two fights is not a rate — it is the
mechanism, transcript-verified, for why a held defensive
ability can sit available all fight and never fire.

## Round 1 — censused, and a correction to the tbfinish spec

Round-1 player actions: 48/48 fights, all tbPlayerMove
(closing moves), zero strikes, zero abilities — the
tbfinish debug finding (8/8 on one seed) now censused
band-wide via the availability log. CORRECTION to the
tbfinish pending-buffer spec: the buffer hypothesis was
wrong. Round-1 actions do NOT run inside startCombat:
startCombat only advances AI turns until the player turn
arrives, then returns; the policy's round-1 action runs
AFTER startCombat returns, when the exposure already exists.
What is missing is the round-1 TURN record, because
tbBeginTurn fired inside startCombat while no exposure
existed yet, so no turn was ever opened for round 1. The
action is therefore in `actionAvailLog` (round 1, turnIndex
0), not in `ex.round1Actions` (empty by construction) and
not in `ex.turns` (which start at round 2). The analyzer
now reads round 1 from the availability log
(`round1Summary`); any future arm reading `round1Actions`
will read zero and be wrong. The tbfinish turn-economy
numbers are unaffected (they were rounds 2+ throughout).

## The 99116 orphan — one unclassified TB end, honestly reported

Confirm seed 99116 has 1 orphan tbEnd: day 77, result
'routed', audit monster fled at 783/1100 HP. Unlike
tbfinish's proven zero-turn suburb rout (monster at full
HP, no fight created), this one is WOUNDED and fled — a real
fight's end the instrument cannot attach, because no
exposure exists for day 77 (the seed's 4 exposures are days
92–95; tbCalls 5 vs 4 exposures). Mechanism unknown, needs
instrument: the leading candidate is startCombat identity
resolution (effId from mid/pending/world) missing this
fight's kind, so no exposure was opened. It does not break
any GO leg (bar status, fighter inventory for the 22
confirm fights, lever, sense-test are all complete), but it
is a named instrument miss: 1 unclassified TB end out of
23 confirm TB ends. The next arm's prereg should carry an
orphan-classification leg for routed fights.

## Sense-test (SENSE-TESTING LAW — transcripts read and judged)

1. TRICK PRESSED — the 4 rage fights (99105-5, 99106-1,
   99109 eater, 99116 algorithm). Line by line the trio is
   coherent ("food becomes rage"); the SEQUENCE is a loop
   no person would run: press, press (press, press),
   move, move, die, with the +100% buff bought and never
   spent on a strike. Verbatim repeat x2–x4 in one fight is
   the robotic part, same shape as 2315Z's x10, smaller.
2. TRICK AVAILABLE-BUT-UNPRESSED — 99101 fight 1 (won):
   pocket_sand available on all 6 recorded actions, 0
   presses, fighter wins on 4 strikes; and 99105 fight 3
   (congregation, 25 turns, 11 strikes, 0 presses, 6 combat
   actions available at start, none pressed). The first is
   policy-correct (a losing-only button in a fight the
   fighter never loses); the second is the norm: available
   actions the policy never tries because its cascade
   names only 7 abilities. Both read coherently in the
   transcript — the gap is in the policy's menu, not the
   prose.
3. VILLAGER LEARNING OR BEING TAUGHT — no COUNTER LEARNED
   line appears in any TB transcript, and that absence is
   itself the finding: learning happens at the haven and in
   field fights, outside TB transcript capture (the
   instrument captures tele events, not haven dialogue).
   What IS read: (a) the tele record — 17–28 'taught'
   discoveries per seed, the haven teaching channel firing
   constantly for bar counters, plus the two wave-4
   completions narrated through the observation channel
   (visjoin_82's eater, visjoin_91's eulogy); (b) the
   succession lines in TB transcripts — "You wake up
   somebody else. Taiga Kiyohara, 60 — a teacher. Their
   hands know different work now: Green Whisper." — a new
   scholar arriving WITH abilities, which reads as a person
   with a build, not a blank. The teaching itself reads
   only as events, not dialogue, in this corpus: the next
   arm's instrument should capture haven conversation
   transcripts, or the teaching sense-test stays
   event-level. Judged: learning is real and frequent for
   bar tricks, rare and late for wave-4 signatures, and
   invisible in fight transcripts by construction.

Nothing else robotic was flagged: kills are credited to
named fighters, deaths carry mantle transfer, and the
eulogy/audit narration reads as story, not counters.

## Metric review (§14 — no in-run re-scoring)

- No metric was re-scored. GO legs (a)–(d) are judged
  exactly as pre-registered. The round-1 analyzer change
  (pending buffer → availability log) is an instrument
  correction, not a metric change: it re-reads data already
  in the judged JSONs and changes no count (round-1 moves
  were never part of the turn-economy tables).
- The orphan clause from tbfinish's prereg does NOT bind
  this arm (trickcensus's prereg carries no 0-orphan leg);
  the 99116 orphan is reported as a named instrument miss
  above, not hidden and not used to fail a leg it was never
  part of.
- Food/fullness: UNRECORDED as a single field, as in
  tbleth/tbfinish (scholar health/energy recorded instead;
  transcripts show fighters entering well-fed — OVERCHARGED
  lines recur — which bounds the question). The dinner
  reserve (200 kcal) in `abilityPressPlay` is therefore
  not directly audited per press; the rage loop's kcal
  (60/press) is transcript-verified.
- Horizon note: 140 days was adequate (14/16 villages died
  before the cap; 2 survived to it). No horizon change
  proposed.
- Proposed revision for the NEXT arm's prereg (not applied
  here): pre-register routed-fight orphan classification
  (the 99116 class) and haven-conversation transcript
  capture (the teaching sense-test gap); and read round 1
  from the availability log, never from `round1Actions`.

## Verdict — DIAG-GO

(a) Trick bar status + shortfall cause for all 8 pilot seeds:
MET (tricks-met 8/8, end 19–30 vs demand 3; confirm repeats
8/8, end 17–29). (b) Per-villager trick inventory with source
for every fighter in TB fights, 0 unclassified: MET (26/26
pilot exposures + 22/22 confirm exposures carry start/end
inventories; party gear classified on every fighter;
village-level trick state reported at village level per the
verified taxonomy). (c) One named lever with numbers: MET
(below). (d) Sense-test, 3 transcript classes read and
judged: MET (rage-pressed, available-but-unpressed,
learning/teaching via tele record + succession lines, with
the haven-dialogue capture gap named). Confirm leg is
stable on every leg: tricks-met 8/8, 0 unclassified, rage
loop same shape (4 presses x2 fights, 0 strikes), 1 known
signature fight with no verb. The GO covers the diagnostic
on the current anchor only.

## The single next blank — FEED SURVIVED TB ENCOUNTERS INTO THE WAVE-4 OBSERVATION BAR

Chosen over the Rage gate and the flee-order fix, by measured
reach:

- FEED THE BAR (this arm's pick): TB fights currently feed 0
  observations (48 fights, 0 fled/routed/calmed outcomes,
  wins excluded by code). The field-only channel completes
  1 kind per 4 villages and both pilot completions arrive
  too late to use. Spec sketch for the next arm (policy +
  engine read, own prereg, NO gate/price/deed change): count
  a survived TB fight as one observation per fought kind —
  at minimum won TB fights (scholar alive at end, the same
  "lived to tell it" semantics the field channel already
  uses), with the existing 2-observation threshold and
  discover/villagerTricks mechanics untouched. Pilot-measured
  payoff, stated honestly: 6 won TB fights would have fed
  up to 6 observations (one per fought kind per fight); the sharp case is 99105 congregation
  (field obs 1 day 70 + TB wins day 70/71 → known mid-run
  instead of never). That is knowledge, not a measured kill
  — the arm must then measure whether known signatures get
  PLAYED, which needs the second half of the spec below.
- NOT the Rage gate as the arm: it touches 4/48 fights
  (12 presses, 720 kcal, 0 strikes). Real, but an order of
  magnitude smaller than the knowledge gap, and the gate
  alone leaves the fighter with nothing to press in the
  other 44 fights.
- NOT the flee-order fix as the arm: pocket_sand's window
  is pre-empted by flee (verified), but it touches 2/48
  fights. Note it as a cheap policy tweak for a later arm
  (flee check after, not before, the losing-button press —
  or a 35–50% HP press window that flee cannot pre-empt).
- REQUIRED SECOND HALF (same arm or the one after, stated so
  the feed is not mistaken for a fix): a known wave-4
  signature needs a VERB. The 99116 audit fight proves a
  known trick with no move is decoration. The feed arm must
  pair the bar change with at least one playable signature
  verb (or measure, and report, that knowledge alone moves
  nothing) — otherwise it will reproduce the audit fight at
  larger scale.
- NO bar/gate/price arm follows from this evidence: the
  tricks bar is met 16/16 and standing-sufficient days fail
  on veterans (87/87), never tricks. Lowering the tricks
  demand would paper over nothing — it is already cleared.

## Findings list (for the coordinator — NOT edited into sim-findings.md directly)

- [open] 2026-11-04 — trick availability — wave-4 signatures
  known in 4/16 villages, used in 0/48 TB fights; the one
  known-trick fight (99116 audit) plays no trick verb
  (this run / evidence/2026-11-04/sim-trickcensus-a.md).
- [open] 2026-11-04 — trick availability — TB fights feed 0
  wave-4 observations (48 fights, 0 fled/routed/calmed,
  wins excluded by code); field-only channel completes 1
  kind per 4 villages, both pilot completions too late to
  use (this run).
- [open] 2026-11-04 — policy — pocket_sand's losing window
  (HP < 50%) is pre-empted by the flee check (HP < 35%)
  running first in fight order; available on 6/6 actions,
  pressed 0 times in both holding fights (this run).
- [open] 2026-11-04 — instrument — 99116 orphan TB end
  (day 77, routed, audit fled wounded 783/1100) has no
  exposure; startCombat identity resolution is the leading
  candidate, mechanism unproven (this run).
- [open] 2026-11-04 — instrument — haven teaching dialogue
  is not captured by TB instruments, so the learning
  sense-test stays event-level (tele) rather than dialogue
  (this run).
- [open] 2026-11-04 — instrument — round-1 turn records do
  not exist (tbBeginTurn fires inside startCombat before
  the exposure); round-1 actions live only in the
  availability log; `round1Actions` must not be read as a
  census (this run).

## Proof and landing

- `scripts/test-trickcensus-20261104.js`: 18/18 (bar math,
  cause classes, fight census incl. composite-id press join,
  round-1-from-availability-log, summarize aggregation,
  live-harness smoke: install, snapshot, final inventory,
  clean uninstall, 0 instrument errors).
- Arm commits on branch sim-trickcensus-a: instruments
  846dad552 (scripts only, zero src/js), prereg + calibration
  f7a2d87f9, analyzer correction 6156251e (scripts only).
  This evidence file + the 16 per-seed JSONs
  (`perseed-trickcensus-a/`, pilot + confirm, plus the
  calibration JSON) commit on the same branch, pending
  coordinator merge --ff-only, pending ship (the ship loop
  owns version bumps, pushes, live verification).
- check.js --quick NOT re-run in full: zero src/js changed,
  same standing caveat as prior tooling-only landings; the
  arm's own proof (18/18) was run before the judged legs
  and re-run after the analyzer correction.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence; the judged leg
  diverges from 2315Z by the documented anchor move, so a
  deviation on this band is expected, not an instrument
  artifact — the calibration control is the evidence).
- Safe-commit index clobber hit all three worker commits
  (repaired via HEAD-blob cacheinfo each time, commits
  verified correct; worktree bytes identical to HEAD
  blobs). Heartbeats: worktree heartbeated through the run.
- Note for the coordinator (standing context, not a task
  change): this census corroborates the 2026-11-03
  abilities-parity note (abilities underutilized; the
  policy-only ability-use builder does not reach players):
  5–9 combat actions are available at fight start in
  essentially every wave-4 TB fight and 0 non-rage presses
  occur in 48 fights — availability is not the binding
  constraint, policy verbs and signature verbs are.
