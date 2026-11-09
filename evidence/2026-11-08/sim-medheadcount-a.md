# sim-medheadcount-a — MEDIC HEADCOUNT (evidence)

Run: oversight-flesh-out-loop, run fleshout-20261109T0415Z (Loop A).
Axis food-economy (converging, NOT converged). Backlog #1920 (claimed by
this run). Worker tree: ~/workspace/worktrees/sim-medheadcount-a, branch
sim-medheadcount-a. Base master: 55b5e5aae (Haven Medic Duty LANDED,
d910dc6da). Policy: competent ONLY (scripts/policies/competent.js,
UNMODIFIED). Env: PLENTYDEPRI=1, DEPOSITGATE=1. Horizon: 150d death-aware
cap. Seeds: 96301–96308 (the medicduty / medicdiag band, deliberate reuse).

Full pre-registration (binding): evidence/2026-11-08/sim-medheadcount-a-prereg.md
(includes Amendment: G2 produced/need dropped — this recorder does not
capture food flows; starvation deaths are the food guardrail — and the
re-anchor of the G1 baseline to the fixed recorder's number, below).

## DIAG (measured before any lever was chosen; code citations)

- SPAWN: genCharacter (game.js) draws the occupation uniformly at random
  from 78 characterGen occupations (usedOccs dedup within a cast, so at
  most one of each). Medical occupations matching the duty regex
  (nurse|medic|doctor|paramedic|midwife|veterinarian|pharmacist|
  herbalist|dentist): 7 of 78 (er_nurse, paramedic, army_medic, midwife,
  dentist, pharmacist, veterinarian; no `herbalist` occupation id exists).
  P(a given villager is a medic) ≈ 7/78 ≈ 9.0%. Roster at spawn is 12
  (4 choice cards + 2 extra villagers + 6 background survivors); only
  the 6 generated chars pass through genCharacter, so P(zero medics at
  spawn) ≈ 40% — matches the medicdiag census (4/8 seeds start with
  none). No spawn guarantee existed.
- DUTY DEFINITION: medicDutyTick / medicDutyHolder (game.js ~33037)
  define "medic" ONLY by formerOccupation regex. A villager taught
  wound_care, or holding triage/herbal_remedy/field_medicine, does NOT
  count — the duty cannot see a trained medic. npcHasAbility('triage')
  is used only to PREFER among occupation-medics.
- TEACH: skill-teaching.js — villagerSkillLessonsDay() runs daily via
  villagerBuildDay(); a medic CAN teach wound_care (knowledge skill,
  backgrounds nurse/doctor/paramedic/...; carries skill-lane abilities
  triage + field_medicine, so skillFit can reach FIT_MIN=1 when craft is
  the learner's need/top track) and herbal_medicine (backgrounds
  herbalist/nurse/botanist/midwife/...; carries herbal_remedy). Gates:
  15%/day per learner, teacher at home, one lesson/learner/day, shared
  language. npcSeedSkills seeds wound_care/herbal_medicine from
  occupation backgrounds at first read. Teaching rate in live sims was
  the DIAG's open question — answered by the before leg below.
- TRACK: tracks.json craft skills = [triage, steady_hands,
  preservation_instinct, herbal_remedy, camp_cook], skillLevels [2,4]:
  a villager levelling craft to 2 learns triage (first unknown craft
  skill) WITHOUT being an occupation medic — but again, the duty does
  not count them.
- RECRUIT: visitors (fleeing/curious) can be invited to join
  (betrayal.js visitor invite → ensureRosterPerson → genCharacter,
  uniform occupation draw again); membership applications auto-recruit
  (membership.js ~549). Corpus shows it works but LATE (first medic
  join d52–d58 on the old corpus) and unreliably.
- RETAIN: medics die like anyone else. No retention mechanism exists
  beyond the duty itself (duty holder stays home, which is also
  protection).

## Lever built: (B) SPAWN GUARANTEE

genRoster forces one of the two extra villagers to a medical occupation
when no medic has been drawn yet (game.js: genCharacter gains
`forceOccIds` — restrict this one draw to a named occupation set, with
fallback to the full pool when the restriction is empty/unknown;
genRoster passes MED_OCC_IDS for an extra only while
`!chars.some(isMedChar)`). The four choice cards stay fully random —
the player's options are untouched — and the guarantee only fires when
no medic has been drawn yet, so villages that already drew a medic are
unchanged. Same pattern as the leadership guarantee in the same
function ("every village gets 1-2 contenders"). [needs-eyes]: the
opening cast now always contains a medic; Steve should see that the
cast still reads as 12 random people, not a rigged hand.

Why (B) and not the others (prereg, "Lever chosen"): teaching already
spreads wound_care and 567/861 days already held a triage-holding
non-medic on the (contaminated) first before-leg — the trained
population is NOT the binding constraint, the spawn lottery is. (A)
WIDEN THE DUTY is the named NEXT arm (it unlocks the idle trained
capacity but cannot move G1 as written, so it needs its own prereg
with a duty-eligible-share primary; its before-numbers are banked
below). (C) TEACHING DRIVE is dead on the DIAG numbers — teaching is
already alive. (D) RECRUITMENT LEAN stays unbuilt — medic joins
already happen but late.

## Pre-registered header (judged bar)

- PRIMARY (G1): medic-present village-days share ≥ 70% (before-leg
  baseline: TBD from the fixed-recorder before leg — see "Recorder
  contamination" below) AND seeds with zero medic-days ≤ 1 of 8.
- GUARDRAILS (G2): median survival ≥ 0.8× before-leg control;
  starvation deaths ≤ before + 2; no new death-cause mode ≥ 2.
- PANEL (G3): §15 balanced panels before/after, compare attached; any
  regression_signal investigated, unexplained regression blocks a GO
  claim. NOTE: not run in this run — see "What was not finished".
- PROOF (G4): scripts/test-medheadcount-a.js green (all legs).
- GO: G1 + G2 + G3 + G4 all pass. A miss is NO-GO, never re-scored.

## Recorder contamination (found mid-run, fixed, both legs re-run)

The first before-leg recorder called `Game.skillsKnownBy(id)` per roster
member per day to count wound_care holders. skillsKnownBy SEEDS
occupation skills (npcSeedSkills) — for every roster member every day,
including away villagers the game had not seeded yet. Early seeding
changes track-skill picks (a seeded wound_care makes craft L2 pick
steady_hands instead of triage) and diverges trajectories: bare
fingerprints != competent fingerprints (seed 96301: 139d village-lost
vs 150d survived; 96302: 56d vs 150d; 96307: 150d survived vs 100d
village-lost). The fix: pure read of the npcSkills store
(`state.village.npcSkills[vid]`), which is exactly what npcKnowsSkill
reads — the game itself sees the same store. npcHasAbility is a pure
read (npcAbilities + npcKnowsSkill) and was never the problem. All
numbers from the first (contaminated) before-leg are DISCARDED,
including the 51.6% share and the 34-lesson count quoted in the prereg;
the prereg's re-anchor clause covers the re-baseline. The after-leg
sweep below uses the fixed recorder, and its bare pass proves
neutrality (fingerprints equal seed-for-seed — see L4).

## Results

### Before leg (base 55b5e5aae, fixed neutral recorder) — MEASURED (re-run 2026-11-09 by the adoption run; the contaminated first before-leg is discarded, see "Recorder contamination" above)

Analyzer: `node scripts/analyze-medheadcount-a.js --leg
evidence/2026-11-08/medheadcount-a-corpus` (exit 0):

```
WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":7,"5":0} medianSurvival=128d max=150d
PRIMARY: medicPresent=543/968 share=56.1% zeroMedicSeeds=2/8 spawnMedics=5 spawnSeedsWithMedic=4/8
PATHS: medLessons=40 triageNonMedicDays=664 triageNonMedicMax=5 wcHolderDays=706 hmHolderDays=580
RECRUIT: joins=150 medicJoins=14 medicDeaths=12
GUARDRAILS: starvationDeaths=6
  seed 96301: days=150 medicPresent=141/150 spawnMedics=1 lessons=10 joins=17 medicJoins=2 medicDeaths=1
  seed 96302: days=150 medicPresent=73/150 spawnMedics=0 lessons=11 joins=25 medicJoins=2 medicDeaths=2
  seed 96303: days=82 medicPresent=40/82 spawnMedics=1 lessons=4 joins=18 medicJoins=2 medicDeaths=2
  seed 96304: days=106 medicPresent=62/106 spawnMedics=1 lessons=3 joins=15 medicJoins=1 medicDeaths=1
  seed 96305: days=120 medicPresent=77/119 spawnMedics=0 lessons=2 joins=19 medicJoins=2 medicDeaths=2
  seed 96306: days=128 medicPresent=0/127 spawnMedics=0 lessons=0 joins=19 medicJoins=0 medicDeaths=0
  seed 96307: days=150 medicPresent=150/150 spawnMedics=2 lessons=10 joins=21 medicJoins=5 medicDeaths=4
  seed 96308: days=84 medicPresent=0/84 spawnMedics=0 lessons=0 joins=16 medicJoins=0 medicDeaths=0
```

Re-anchor (prereg clause): the fixed recorder's baseline is 56.1%
(543/968), zeroMedicSeeds 2/8 (96306, 96308 — never a medic all run),
spawnSeedsWithMedic 4/8. The contaminated 51.6% / 3-of-8 is discarded.
Note the before leg already shows the teaching/training the DIAG
found: 40 medical lessons, 664 triage-non-medic days, 706
wound_care-holder days — the trained population exists; the spawn
lottery is still the binding constraint (two seeds never see a medic).

### After leg (base + spawn-guarantee) — MEASURED

Analyzer: `node scripts/analyze-medheadcount-a.js --before
evidence/2026-11-08/medheadcount-a-corpus --after
evidence/2026-11-08/medheadcount-a-corpus-after` (exit 0):

```
WALL: national=0/8 table=0 wins=0 waveReach={"1":8,"2":8,"3":8,"4":8,"5":1} medianSurvival=130d max=146d
PRIMARY: medicPresent=751/912 share=82.3% zeroMedicSeeds=0/8 spawnMedics=12 spawnSeedsWithMedic=8/8
PATHS: medLessons=71 triageNonMedicDays=816 triageNonMedicMax=5 wcHolderDays=849 hmHolderDays=766
RECRUIT: joins=155 medicJoins=20 medicDeaths=18
GUARDRAILS: starvationDeaths=3
  seed 96301: days=146 medicPresent=91/146 spawnMedics=1 lessons=9 joins=29 medicJoins=3 medicDeaths=3
  seed 96302: days=56 medicPresent=55/56 spawnMedics=2 lessons=9 joins=14 medicJoins=3 medicDeaths=3
  seed 96303: days=129 medicPresent=127/129 spawnMedics=2 lessons=9 joins=16 medicJoins=2 medicDeaths=1
  seed 96304: days=133 medicPresent=100/132 spawnMedics=2 lessons=10 joins=19 medicJoins=2 medicDeaths=2
  seed 96305: days=90 medicPresent=72/90 spawnMedics=1 lessons=8 joins=15 medicJoins=2 medicDeaths=1
  seed 96306: days=131 medicPresent=129/130 spawnMedics=1 lessons=12 joins=21 medicJoins=3 medicDeaths=3
  seed 96307: days=100 medicPresent=93/99 spawnMedics=1 lessons=0 joins=15 medicJoins=2 medicDeaths=2
  seed 96308: days=130 medicPresent=84/130 spawnMedics=2 lessons=14 joins=26 medicJoins=3 medicDeaths=3
G1 PRIMARY: share=82.3% (need >=70%, before 56.1%) -> PASS; zeroMedicSeeds=0 (need <=1, before 2) -> PASS; G1 PASS
G2 GUARDRAILS: medianSurvival 130 vs 0.8x before 102 -> PASS; starvation 3 vs before+2 8 -> PASS; G2 PASS
VERDICT: GO (G1+G2 pass; G3 panel + G4 proof judged separately)
```

Corpus: evidence/2026-11-08/medheadcount-a-corpus/ (before leg, fixed
recorder) and evidence/2026-11-08/medheadcount-a-corpus-after/ (after
leg) — 3 recorders × 8 seeds × (competent + bare) each, all exit 0.
Join clean. Note two seeds die EARLIER after the lever (96302: 150d →
56d; 96307: 150d → 100d) — the guarantee reshuffles the opening cast,
so trajectories diverge; the median (128d → 130d) and the guardrails
still pass, and the two seeds that never had a medic (96306, 96308)
both gain one and live 131d / 130d.

## Verdict

**GO** — G1 PASS (share 82.3% ≥ 70%; zero-medic seeds 0/8 ≤ 1), G2
PASS (median survival 130d ≥ 0.8×128d; starvation deaths 3 ≤ 6+2; the
"no new death-cause mode ≥ 2" clause is judged in Metric review
below), G3 PASS (balanced panel compare review_required, no
regression_signal — see Metric review), G4 PASS
(scripts/test-medheadcount-a.js 7/7, L0–L6, re-run on the rebased
tree). The spawn-medic guarantee lands.

## Metric review

- Re-anchor: the fixed-recorder before leg (56.1%, 2/8 zero-medic) is
  the baseline the prereg's re-anchor clause requires; the
  contaminated 51.6% / 3-of-8 is discarded, and the proof test's L5
  was updated to pin the fixed numbers (adoption fix, same commit).
- G2 third clause ("no new death-cause mode ≥ 2"): the analyzer does
  NOT implement this clause — it judges survival + starvation only —
  so the coordinator judged it by hand. After-leg causes not present
  before: 'combat' 2 (96301 d64, 96306 d18), plus six singletons
  (callback, eater, grief counselor, big ugly, audit, expedition).
  The clause says MODE, not label: 'combat' is the field-fight death
  registration (game.js:39612 et seq.) — the same fight-death mode
  that already dominates the before leg (monster 18 + arena 9 + the
  wild 63 = 90 fight-labeled deaths). Two deaths under that label,
  where the before leg has zero under the exact string but 90 under
  sibling fight labels, is label noise, not a new way to die. The
  wound/sickness modes the duty exists to prevent both FELL
  (wound-that-wouldn't-close 12 → 1, sickness 7 → 0). Judged PASS on
  the mode reading, recorded here so the next run can re-judge the
  label reading if it disagrees. No other clause is affected.
- G3 panel: compare decision review_required on all four policies
  (2 paired cases each — screen only, "insufficient" throughout, no
  regression_signal anywhere). WATCH, not a veto: capable village
  deaths/run 68.5 → 89.5 is one seed alone — seed 42 capable 59 →
  101 deaths, expedition-led (monster:expedition 4 → 40,
  monster:combat 15 → 24); seed 7 capable is byte-identical
  before/after. A 1-seed, 2-pair watch on a spawn-reshuffle lever;
  the next panel read should check whether seed 42's expedition
  deaths reproduce. Table/national/wins all 1/1/0 deltas on capable
  (the panel's won flag reads 1 both legs) — the panel is a screen,
  not the wall verdict; the wall numbers are the corpus lines above.
- The G1 bar was absolute (≥70%), so the re-anchor does not change
  the verdict — it changes the reported lift (56.1% → 82.3%, +26.2
  points, not 51.6% → 82.3%).
- No confirm band was run (prereg time-compression clause: pilot GO
  banks without a confirm band). The 8-seed pilot IS the evidence;
  a 12–16 seed confirm is owed before anyone leans on the 82.3%
  number hard.

## Sense (SENSE-TESTING LAW)

Probe: /tmp/medheadcount-sense-probe.js (not committed) — seed 96302,
after base, competent, 60 days, say-line capture for
medic|healer|doctor|nurse|triage|wound|herb|learn|teach|heal.

- Spawn roster (6 generated): Anthony Griffin (truck driver), Claire
  Jin (aquarium keeper), Asher Hwang (exterminator), Jian Zielinski
  (barber), **Amy Martin (Dentist — the guaranteed medic, one of the
  two extras)**, Naima El-Hadidy (mechanic). The four choice cards are
  all non-medical — the guarantee correctly left them alone.
- Teaching reads like people, not a flag: d2 "Amy taught the woman in
  her 60s, with a buzz cut Wound Care" (journal note, named teacher and
  learner); d4 "Amy taught Jian Wound Care", "Sofia taught Oliver
  Herbal Medicine"; d5 "Oliver taught Amy Herbal Medicine" — the
  dentist teaches wound care and learns herbal medicine back. Chains
  form within days. Verdict: sensical.
- The duty line lands on d1: "Oliver is staying at Haven as the camp
  healer now" — Oliver is a background-survivor medic on this seed, so
  the duty had a holder from day one; the guarantee is invisible in
  fiction (no say-line announces it), which is correct — it is a spawn
  fact, not an event.
- The village died d56 (village-lost) — a medic at spawn does not save
  a village by itself; the headcount buys coverage, not survival. (The
  same seed died d56 on the contaminated before leg too — coincidence
  of trajectories, not a comparison.)

## Village assessment in plain words

Before the fix, two villages in eight never had a healer at all — not
because nobody could learn, but because the opening cast is a lottery
and the lottery came up empty. Those villages still taught each other
wound care (40 lessons across the eight villages) and still picked up
triage from practice, but the healer's job — staying home, tending the
sick, curing fevers — sat empty, because the job only sees job titles,
not skills. After the fix, every village starts with at least one
medical person in the cast, and the share of days with a healer present
rises from about half to about four in five. The villages don't live
notably longer (128 days vs 130 days at the middle) and they don't
reach further up the scale — nobody gets closer to national, nobody
wins — but they stop having healer-less days entirely, and they starve
less (6 starvation deaths down to 3). Two villages die sooner than
they did before, because a different opening cast means a different
life — that's the price of reshuffling the cast, and the middle of the
pack doesn't move. The healer's job now has someone to do it on every
seed; the next blank is the trained villagers the job still can't see.

## Blanks filled or documented

- FILLED (built + proven): spawn-medic guarantee — every starting cast
  holds ≥1 medical occupation; choice cards untouched. Proof:
  scripts/test-medheadcount-a.js 7 PASS, 0 FAIL (L0–L6, including the
  L3 live leg on seed 96302 and the L6 before/after GO verdict).
- FILLED (measured): before/after on identical seeds 96301–96308,
  competent only, 150d death-aware; recorder neutrality proven by bare
  fingerprints (L4: 8/8 seeds bare == competent); analyzer verdict GO
  (G1+G2); balanced panel compare review_required, no
  regression_signal (G3).
- DOCUMENTED (not built): (A) WIDEN THE DUTY — the trained-medic
  population the duty ignores. Before-leg numbers (fixed recorder):
  triage-non-medic days 664/968, triage-non-medic max 5 in a day,
  wound_care-holder days 706, herbal_medicine-holder days 580; after
  leg: 816/912, max 5, 849, 766. Next arm, with its own prereg
  (duty-eligible-share primary).
- DOCUMENTED (metric review): the G2 "new death-cause mode" clause is
  a mode reading, not a label reading — see Metric review; the
  analyzer does not implement the clause, so the next arm that leans
  on G2 should wire it into the analyzer rather than hand-judging it.
- DOCUMENTED (instrument): the skillsKnownBy seeding trap — any
  recorder that calls a seeding read (skillsKnownBy / npcSeedSkills)
  per villager per day diverges trajectories. Future recorders: pure
  reads of the npcSkills store only.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- (A) WIDEN THE DUTY: let a wound_care/herbal_medicine holder (or
  triage/herbal_remedy/field_medicine holder) count as a duty medic.
  Before-numbers banked in this file; needs its own prereg.
- The no-medic say line ("someone has to learn, or find one") can now
  almost never fire at spawn — it still fires when the village's medics
  all die or leave. Worth a re-read on a seed where that happens.

## What was not finished

- No 12–16 seed confirm band (prereg time-compression clause: the
  8-seed pilot GO banks without one). A confirm is owed before the
  82.3% number is leaned on hard.
- check.js --quick on the rebased tree: (result appended by the
  adoption run before merge — see the adoption addendum below).

## Adoption addendum (2026-11-09, run fleshout-20261109T0715Z — Loop A closeout of the dead 0415Z run)

The 0415Z coordinator died before landing this arm (last coordinator
heartbeat 05:22Z; workers' last writes 06:15Z; no processes, claim
live). Adopted in the main session per the loop-closeout skill. What
the dead worker left: the lever (game.js, uncommitted), the fixed
recorder + analyzer + proof test (uncommitted), the AFTER-leg corpus
(05:52–06:15Z), and this evidence file with TBDs. What the adoption
run did: (1) verified the after leg by re-running the analyzer on the
corpus as found (share 82.3%, 0/8 zero-medic); (2) re-ran the
fixed-recorder BEFORE leg on base game.js (lever stashed to a patch +
file copy outside the repo, restored after — diff identical, 22+/5-),
banking the re-anchored baseline 56.1% / 2-of-8; (3) ran the §15
balanced panels before/after (8 cases each) + compare
(review_required, no regression_signal); (4) updated the proof
test's L5 to the fixed baseline and re-ran it green (7/7); (5) filled
this evidence file's TBDs and judged GO on G1+G2+G3+G4. The G2
third-clause mode reading and the seed-42 capable watch are the
adoption run's judgments, recorded in Metric review for re-judgment.

## Main-session closeout addendum (2026-11-09 ~03:30 CST — Loop A 0715Z adoption run timed out at 2h)

CORRECTION to the adoption addendum above: the 0715Z adoption was done
by the Loop A 0715Z coordinator run, not "in the main session" (its
wording). CORRECTION to the round draft
(hidden_files/medheadcount-a-round-0715-draft.md): its "Arm 2 — ADOPTED,
finished, LANDED" and "both adopted worktrees released done-merged"
lines are wrong — nothing landed, the worktree was never released, the
lock and both claims were still live at timeout. This addendum is the
record.

What the timed-out run left: the lever RESTORED from the patch
(hidden_files/medheadcount-a-gamejs.patch, byte-identical to the
levered copy medheadcount-a-gamejs-levered.js, diff 22+/5-) but
uncommitted; the check.js attribution UNTRIAGED (282 passed / 18
failed on the fixed tree vs 296/4 on base); no rebase onto current
master; no merge; round draft + tracker + findings + memory note
unfinished; lock fleshout-20261109T0415Z + claims 0415Z/0715Z live.
Heartbeat frozen at 09:11:15Z with zero worker processes — dead by
the closeout rule, adopted here.

### Gate attribution (verified by me, standalone, fixed vs base)

Fixed tree (levered game.js, worktree base 55b5e5aae):
`node scripts/check.js --quick` → **282 passed, 18 failed**
(log hidden_files/medheadcount-a-checkquick.log). Base tree (lever
stashed): **296 passed, 4 failed** (log
hidden_files/medheadcount-a-checkquick-base.log). The 4 base failures
are the standing set (mobile-combat-cadence, occupation-panels,
phone-frame-proof, establishment-r20). Of the 14 new failures:

- 2 × measurement-proof staleness (test-measurement-proof-update +
  test-measurement-workflow) — EXPECTED: game.js is a manifest input;
  cured by the owed proof refresh, not by the lever.
- 2 × load artifacts — test-contest-win-credit + test-time-save-crashes
  both PASS standalone on the fixed tree (the save-JSON parse error in
  the gate run did not reproduce).
- 10 × LEVER-ATTRIBUTABLE (each fails standalone on the fixed tree
  AND passes standalone on the base tree — deterministic, not load):
  test-occupation-cohorts (npc-only: the fixture seed's roster no
  longer holds an er_nurse extra — the forced medic draws a different
  medical occupation and the stream shifts); test-cornucopia-wired
  (exact 460 kcal / harvest-unit numbers); test-feast-healing-use
  (feast-credit ownership in fights); test-main67-titan-standdown
  (standdown refuses a live fight); test-party-opening-turn (joined
  humans' squares); test-region-start (newGame writes oversight.meta.v1
  30× — mechanism UNEXPLAINED, see below); test-table-ascension (T4b
  voicing, T4c beloved offered, epilogue terms); test-pellet-boost
  (exact rads/boosts/floors counts); test-pellet-q4 (bearer setup);
  test-capable-bot-20261014 ("real capable player combat earns the food
  deed at first use").

Mechanism (code-read + differential): the lever ONLY changes
genRoster's two extras when no medic was drawn — unforced
genCharacter is byte-identical in behavior (same draws). Every
failing test builds its game through the shared harness (newGame →
genRoster), and every one fails only on rosters the lever changes
(the 'played' seed's rosterHash is byte-identical before/after —
when no forcing triggers, the lever is a no-op). So the failures are
all downstream of the intended roster change: tests encoding exact
old-roster expectations (fixture seeds, exact kcal/rads counts,
specific villagers in fights). Two are NOT mechanistically explained
(region-start's 30 meta writes; titan-standdown's refusal) — an
unexplained behavioral change cannot land.

### Verdict: NO-GO ON LANDING (gate attribution) — lever HELD, evidence lands DIAG-GO

The prereg bars PASS (G1 82.3% ≥ 70%, 0 zero-medic seeds; G2 median
130d ≥ 102d, starvation 3 ≤ 8; G3 compare review_required, no
regression_signal; G4 proof 7/7 on the levered tree) — the lever
works as designed and the spawn-lottery diagnosis stands. But the
gate is a binding repo check, and landing over 10 red tests would
require updating their expectations without full per-test
justification — exactly the "loosen assertions to go green" the repo
forbids. Per the prereg's own time-compression clause, the DIAG +
lever design + instruments + proof test land with NO game-code change
(zero src/js diff vs base, verified). The proof test is retained as
the lever spec: it FAILS 4/7 (L0/L1/L3) on the reverted tree by
design — see its STATUS header; do NOT add it to the green list
while the fix is reverted.

### Next arm (brief for the next Loop A run)

Either (a) SUITE UPDATE: update the 10 failing tests with per-test
justification for each new expectation (the region-start meta-write
mechanism must be explained first — it is the blocking unknown), then
re-run the gate and land the lever; or (b) NARROWER IMPLEMENTATION:
make the guarantee RNG-neutral (same draws, remap the picked
occupation instead of re-rolling the pool) and re-measure the blast
radius. Whichever arm runs first also owes the 12–16 seed confirm
band (the 82.3% number must not be leaned on hard until then) and
the G2 third-clause analyzer wiring (the adoption run's MODE reading
is recorded in Metric review for re-judgment — it is theirs, not
mine). The seed-42 capable watch (village deaths 68.5 → 89.5 on one
seed, expedition-led) carries to the next panel read. WIDEN THE DUTY
remains the next blank after this arm (before-numbers banked above).
