# sim-scholarcare — scholar self-care drive (flesh-out loop, 2026-10-20)

Run: fleshout-20261020T1255Z, arm sim-scholarsurvive → sim-scholarcare. Axis: scale-onramp (the blocking axis).
Worktree: ~/workspace/worktrees/sim-scholarcare. Policy-side only: scripts/policies/scholarcare.js (zero src/js).

## STEP 1 — the verb surface (investigated BEFORE building; all refs src/js/game.js)

Question from the scholarsurvive autopsy: "the base tends others, never the
scholar" — verb-target limitation or policy choice? Both, split by care kind:

**SICKNESS, self-tendable (engine-real, policy-unreached — POLICY CHOICE):**
- `examineSick()` — self diagnosis when vid omitted (game.js ~12415);
  `canDiagnose()` gates it (triage/field_medicine/herbal_remedy, herb lore,
  stethoscope).
- `folkRemedy('rest'|'fluids'|'tea'|'fast')` — "Anyone can try" (game.js
  ~12532). Uncertain efficacy by design (0.35–0.5 slow rolls); fluids costs
  a clean-water bottle, tea a plant unit — real resource costs.
- `treatDisease(abilityId)` (game.js ~12601) — ability-gated self-treatment
  with triage/field_medicine/herbal_remedy. L1 is explicitly "practice on
  yourself" (the treatVillager refusal text, ~12955); day-gated per ability
  (treatDayKey); cures/eases per the disease's cure table and diagnosis.
- `useMedicine('antibiotics'|'antiparasitic')` (game.js ~12665) — self
  medication; specificity matters (wrong pill = wasted dose).
- Automatic: `villagerTreatTick` (~29906) — a medical villager eases the
  scholar's sickness, unasked, 35%/day at Haven. Policy-free but
  medic-dependent.
The base substrate stack (withSeatDrive(withWinDefer(withVetrel(
withReposition(TF leadfeast/belongfeast))))) never calls ANY of these for
the scholar — only the uncomposed policies/treatment-seeking.js does
(evidence: r1 2026-10-11 disease lever, not in this stack).

**WOUNDS, self-healable (engine-real — POLICY CHOICE):**
- `useItem(idx)` — first-aid kit (+30) / healAmount items heal the scholar
  via addHealth (~13024). The base rarely stocks first aid.
- `doAction('rest')` — engine-honest rest verb (~25501): +5 health when fed
  and watered (metabolic-crisis rule: starving/dehydrated = no tissue
  rebuild; cold-shiver = no recovery); refuses mid-fight. +2/day passive.
- `villagerHealCheck` (~7206) pharmacy path: deposited medicine auto-used
  for hurt villagers departing — villager-targeted.

**ENGINE LIMITATIONS (not policy-reachable without src/js):**
- `healerRounds` (~7304) explicitly skips the scholar (`id ===
  this.villagerId continue`) — the camp healer binds up everyone but the
  bearer.
- `tendVillager(vid)` (~12479) reads `(v.sick||{})[vid]`, but the scholar's
  sickness lives in the status-effect list (`seList('scholar')`), never
  `v.sick` — calling it on the scholar prints "They're not sick." Bridging
  the two record systems is a game-code change, out of scope for this arm.
The layer therefore uses ONLY self verbs (folkRemedy / examineSick /
treatDisease / useMedicine / useItem / doAction('rest')).

Conclusion: STEP 2b — the arm is buildable as a policy-side lever.

## THE LEVER

scripts/policies/scholarcare.js (SCHOLARCARE=1, default OFF): a post-wave-4-
kill self-care drive. In upkeep (before the day's spend — the
treatment-seeking.js timing: "a sick person deals with being sick first"),
when the scholar is a recorded wave-4+ killer (waveKillLog w>=4,
by===Game.villagerId — the TB kill path stamps the vid; the gate is keyed
on the killer INCARNATION, not the office, so care lapses honestly after a
mantle transfer) AND at Haven AND not mid-fight: the scholar tends their
own sickness (diagnose → treatDisease with held training → useMedicine for
diagnosed bacterial/parasitic classes when pills are held → folkRemedy:
fluids > tea > rest by availability) and their own wounds (first-aid item
when carried, then the engine-honest doAction('rest')). Gate-off the
wrapper is pure delegation (proved byte-identical in test-scholarcare.js).

Design calls (Steve can overrule):
1. NO withdrawal / re-engagement discipline — that was sim-scholarsurvive's
   layer, killed at pilot (trended toward more player deaths via threat
   saturation). This layer only improves the state the scholar carries into
   the next fight; it cannot save same-day kill-fight deaths (structurally
   unreachable, 6/26 in the scholarsurvive corpus).
2. Killer-gated (not always-on self-care): the arm targets the veteran
   channel's attrition slice; broadening to all scholars is a separate arm.
3. No tendVillager-on-self: it would print "They're not sick." (record-
   system mismatch). Folk remedies + training are the honest self path.
4. Eat/drink are the base's job (competent upkeep does both; scholarsurvive
   leaned on it) — the layer does not duplicate them.
5. Care fires only at Haven (the scholar is a patient at home; ranging out
   is the base's business).

Canon: docs/CANON.md (read), docs/MONSTER-WAVES.md (readiness gate,
VILLAGER XP LAW — read). No doc covers scholar self-care — behavior
documented here.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep)

**Question:** does a policy-side self-care drive save the attrition slice
of the veteran channel — scholars dying of sickness/dehydration/wounds
after their wave-4 kill — and buy the 2-living-veterans bar headroom?

**PRIMARY (binding):** share of ARMED wave-4 kills (w>=4, via='player',
by===scholar vid) whose killer is alive at +30d post-kill (E3 convention:
no player death with killDay <= day <= killDay+30; censored kills with
killDay+30 > run end are listed and excluded). GO >= 25% — the honest bar:
the 50% bar hit 0/26 with 6/26 structurally unreachable (kill-fight
deaths); this arm targets only the attrition slice (3/26 ≈ 11.5% ceiling
on attrition alone — the bar requires the care drive to also blunt the
threat-saturation slice by entering later fights healthier).

**SECONDARY:** 2-living-veterans bar (waveCombatReadiness(5).veterans >= 2,
live read, max over run) met in >= 2/8 runs per policy.

**GUARDRAILS (all binding):** median survival >= control -10d; no new death
modes (>=2-event rule: an armed-only cause with >=2 events is a new mode);
wave-4 unlocks >= control - 1.

**PILOT GATE:** 8 seeds (64001–64008 — verified zero filename/content hits
in evidence/ and scripts/) x {leadfeast, belongfeast} = 16 runs per arm,
control vs armed on IDENTICAL seeds, 180d death-aware horizon, the exact
w5doormeasure substrate (withSeatDrive(withWinDefer(withVetrel(
withReposition(TF base)))), SEATDRIVE=0 pre-seat, VETREL/REPOSITION inert).
If PRIMARY misses at pilot: KILL the arm (delete layer zero-trace, keep
instruments + evidence). If GO at pilot: confirm on 8 more seeds (16 total
per arm).

**§15 balanced panel:** before/after through scripts/balance-panel.js's
scorecard (scripts/build-scholarcare-panels.js) — the panel is the
instrument, the pre-registered threshold is the judge.

**Sense-testing (SENSE-TESTING LAW):** one armed seed re-run with Game.say
captured around a self-care episode — read whole, judge whether it reads
as a person recovering, not a stat-bot.

**Wall numbers (standing directive):** national / table / wins, wave reach
1–5, median/max survival, death-cause shares — reported every run.

**Convergence state for this axis:** converging (the w5 door remains the
binding wall; this arm works the veteran channel's attrition slice).

---

*(results below — filled after the sweep; the pre-registration above is unchanged)*

## Results

Pilot sweep complete 2026-10-20: 32/32 runs (16 control + 16 armed), 0
engine errors, 0 instrument errors (SMOKE 8/8 GREEN both arms before the
pilot; proof test 17/17 GREEN; det-gate: gate-off wrapper byte-identical to
bare base). Batches ran 4-way parallel (control/armed x leadfeast/
belongfeast), deterministic per seed; per-seed JSONs written atomically at
run end.

### PRIMARY: killer alive at +30d — MISS (1/10 = 10.0%, bar >= 25%)

ARMED wave-4 scholar kills (via='player', by===scholar vid): 10 across 5
runs (5 censored: killDay+30 beyond run end, listed and excluded). Killer
alive at +30d: **1** — belongfeast s64007, strike d62 (the run with
scCare=102: the drive fired hardest there and the killer survived the
window). Control baseline on identical seeds: 0/11.

**The arm is KILLED at pilot per the pre-registered kill protocol.** The
layer (scripts/policies/scholarcare.js) is deleted zero-trace; instruments
and evidence kept.

### Kill-death taxonomy (armed, n=10)

- threat-saturation: 9 (8 combat, 1 contest — all deathDay > killDay: the
  scholar walks out of one wave-4 fight into the next)
- kill-fight (same-day): 0 on this corpus
- attrition (sickness/dehydration/starvation): **0** — the target slice did
  not materialize on these seeds (corpus-wide: only 3 sickness + 2
  dehydration player-deaths across ALL armed runs, none post-wave-4-kill)
- alive: 1

Per-kill table in scripts/analyze-scholarcare-20261020.js output (and the
evidence JSON above). The mechanism the arm targeted (post-kill attrition)
was absent on this corpus; the observed deaths are the threat-saturation
shape scholarsurvive autopsied — a healthier scholar still walks into the
next fight.

### SECONDARY: 2-living-veterans bar — MISS (0/8 per policy, bar 2/8)

vets5max reached 1 on 4 armed runs, never 2. Control: 1 on 3 runs, never 2.

### GUARDRAILS (all PASS)

- Median survival: control 139d, armed 131d (>= control-10: PASS).
- New death modes: none (>=2-event rule: PASS). Armed-only singletons are
  noise-level and appear in the wall shares below.
- Wave-4 unlocks: control 14, armed 14 (>= control-1: PASS).

### §15 balanced panel — review_required

scripts/build-scholarcare-panels.js vs the pre-registered threshold:
leadfeast playerDeaths100Days **regression_signal** (+1.47/100d; before
6.87, after 8.34), playerDeaths regression_watch (+1.0/run),
communityLost regression_watch (+0.125). belongfeast: no material signal.
The layer does not merely fail to save killers — on leadfeast it trends
toward MORE player deaths (same signature as scholarsurvive's withdrawal:
time spent tending at Haven is time not spent where the village is
dying). Panel .md/.json: evidence/2026-10-20/scholarcare-panel.*.

### Engagement (the layer did fire)

Armed totals: careDays=310 (drive gate open: killer at Haven), sickDays=1,
woundedDays=39, examined=1, treated=1, folk=0, rests=39, firstAid=0,
pills=0. The drive fired honestly — 39 rest episodes for wounded killers —
but sickness self-care almost never triggered (scholars weren't sick; the
corpus's attrition slice was empty). First aid never carried; pills never
held — the wound/sickness kit the drive wants is rarely in the pack.

### Wall numbers (standing directive, every run)

- national / table / wins: control 0/16 / 0/16 / 0/16; armed 0/16 / 0/16 / 0/16
- wave reach: control [16,16,14,14,0]; armed [16,16,14,14,0]
- median / max survival: control 139 / 182; armed 131 / 182
- death causes (16 runs each): combat dominates (500 control / 481 armed),
  villager combat 111/107, starvation 16/15, sickness 8/6, the long tail
  unchanged (monster 37/30, expedition 18/15, contest 8/8).

### Telemetry deviation check

scripts/telemetry-check.js vs the scale-wall baseline: LOUD
"national/table/wins disappeared" — EXPLAINED, not a bug: the baseline's
own _regime block documents a winseat (SEATDRIVE=1, full win stack) regime
and says DO NOT compare pre-seat substrates against it (wins structurally
~0 there). This run is SEATDRIVE=0 pre-seat. Baseline left untouched (not
rolled forward — that would corrupt a different regime's numbers).

## Sense-testing (SENSE-TESTING LAW)

Armed belongfeast s64007 re-run, Game.say captured ±5/+10d around the
wave-4 kill days (d57/d71/d83): evidence/2026-10-20/scholarcare-transcripts/
belongfeast-s64007.txt (2955 lines; CARE markers where the drive fired).

- The self-care READS as a person recovering: after the d71 influencer
  kill, d72 opens with the engine's own rest line ("You settle in and rest
  through most of the dawn. Breath slows. +30 energy. (-40 kcal — rest
  burns fuel too.)") inside a living village morning (spoiled food noted,
  standings read, Yuki patched up by the base, a counter learned, a care
  package landing). No custom narration needed — the honest verb carries it.
- The death reads as the world, not the care: the d83 killer dies d97 to a
  fresh combat encounter, treated and rested days earlier. The fiction holds;
  the mechanics don't — again.
- SENSE-OK on the fiction; the numbers are the problem, not the prose.

## Metric review (§14 — binding, never re-scored)

- PRIMARY: MISS, 1/10 vs the >=25% bar. Not re-scored; the arm is killed.
  The 1 alive kill is on the highest-engagement run (scCare=102) — directionally
  suggestive but n=1 is not evidence; the pilot's job was the bar, and the
  bar missed.
- The bar's own honesty note holds: the attrition slice (3/26 ≈ 11.5% in
  the scholarsurvive corpus) did not materialize here at all (0/10), so
  even a perfect attrition cure could not have reached 25% on this corpus —
  the threat-saturation slice (9/10) is the whole game, and a self-care
  drive doesn't move it.
- Panel "not_observed" metrics (entered, livingNpcs, lowFood, …) are the
  thin instrument's honest gaps — my corpus doesn't populate those contract
  fields. Not a failure; named here.
- Guardrail "median survival >= control-10d": 131 vs 139 — PASS, but the
  panel's playerDeaths regression_signal corroborates the guardrail's
  weakness as a trend detector on 16 runs.

## Village assessment

Sixteen villages on the w5doormeasure substrate, half with a self-care
protocol for their herald-killers. What they looked like: wave-4 reached on
14/16 each side, the w5 door never approached (def5 never true — the
standing leg binds first here), villages dying to combat attrition
(500/481 combat deaths) with starvation second (16/15) and sickness a
distant third (8/6). The armed villages buried their scholars at the same
rate; the drive's 310 care-days bought 39 rests and one surviving killer.
Nobody reached national; nobody won. The blank filled: "the base tends
others, never the scholar" is a policy choice, not a verb limitation — the
verbs exist (folkRemedy, treatDisease, useMedicine, examineSick) and fire
honestly — but tending doesn't move the veteran channel because the
channel's deaths are threat-saturation, not attrition. The blank remains:
how a wave-4 killer survives the week after in a saturated world — a
game-side question (raid pressure, kill-fight lethality), not a policy one.

## Named nexts

1. [backlog → open] The veteran channel's death shape is now measured on
   TWO corpora (scholarsurvive 26 kills, scholarcare 10 kills): kill-fight
   deaths, threat-saturation deaths, attrition deaths. Two policy-side
   layers (withdrawal, self-care) are both killed at pilot — withdrawal
   trended harmful, self-care trended neutral-to-harmful. The named next is
   GAME-SIDE: kill-fight lethality for wave-4 (the scholar dies IN the
   kill fight or to the next one the same week), and raid/encounter pressure
   on recovering killers. Not another policy wrapper.
2. [backlog → open] The self-care verbs exist but the pack never carries
   the kit (first aid 0 uses, pills 0 uses, folk 0): a reachable-design
   question — should a competent mid-game scholar be able to stock first
   aid / medicine more reliably, or is scarcity the point? The drive's
   wound care was rest-only in practice.
3. [steve-call] villagerTreatTick (a medic eases the scholar's sickness,
   Haven only, 35%/day) and healerRounds (explicitly skips the scholar)
   mean the village tends everyone but its own bearer. Is that the intended
   fiction (the scholar is the system's hands, not its patient), or should
   the care machinery include the scholar? Game-side either way.
4. Killed arms leave no trace — scripts/policies/scholarcare.js deleted;
   instruments (test, sweep, analyzer, panel builder, transcripts, corpora)
   and this evidence file land.

## Convergence state for this axis

converging (the w5 door remains the binding wall; the veteran channel is
now understood as threat-density + kill-fight-lethality, not re-engagement
or attrition — the next arm must be game-side, not policy-side).
