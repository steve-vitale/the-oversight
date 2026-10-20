# sim-scholarsurvive — scholar-killer survival layer (flesh-out loop, 2026-10-20)

Run: fleshout-20261020T1015Z, arm sim-scholarsurvive. Axis: scale-onramp (the blocking axis).
Worktree: ~/workspace/worktrees/sim-scholarsurvive. Policy-side only: scripts/policies/scholarsurvive.js (zero src/js).

## THE MECHANISM (from evidence/2026-10-20/w5doormeasure-stall-attribution.md, E2/E3)

The wave-5 door's 2-living-veterans readiness bar can NEVER fill: wave-4
kills are via=player in 10/10 cases, and the killer incarnation (the
scholar) dies within 30 days of the kill in 9/10. The veteran channel is a
death channel: the only villager who kills wave-4 is the scholar, and the
scholar almost never survives the month.

## THE LEVER

A policy-side kill-and-live layer: after the scholar lands a wave-4+ kill,
force full disengage/withdraw + recovery — no re-engagement outside Haven
(honest tbBarrierExit disengage on the scholar's turn), mandatory rest via
the real `doAction('rest')` verb at Haven, protected return to Haven via
the real `travelTo` verb — until healed (hp >= 85%) or killDay+30 (the
whole metric window). Fights AT Haven during recovery delegate to the base
policy (design call #1: defend home).

Design calls (Steve can overrule):
1. FULL WITHDRAWAL, no Haven exception. The brief says "no re-engagement"
   and the first observed killer death (s64002: Marcus Niu, d91) was a
   HAVEN fight — a haven-defense exception guts the mechanism. The
   engine-honest cost of fleeing a raid is the linger/gorge path (unmet
   raiders gorge nightly until driven off), not village death: lives vs
   pantry, legible. The guardrails judge the tradeoff.
2. Recovery ends on HEALED (>=85%, and never before killDay+10 — design
   call #5 below) / EXPIRED (killDay+30) / killer dead or succeeded
   (protection is for the killer incarnation, not the office).
3. Rest = the engine-honest rest verb (heals only when fed/watered; the
   base's eat/drink runs first each day). No self-treatment re-implementation
   — competent already tends others; rest-at-Haven is the legible beat.
4. Kill detection reads the engine's own waveKillLog (w >= 4, by === the
   current scholar's vid).
5. Minimum sit-out (added during the pilot after the s64002 read): recovery
   never ends before killDay+10 even at full HP. The first armed pilot runs
   showed the failure mode precisely — the killer died the DAY AFTER the
   kill, not badly hurt, by re-engaging immediately; a heal-gated release
   ended recovery on the kill day itself and protected nothing. The
   mechanism is re-engagement death, not wound death.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (readiness gate, VILLAGER XP
LAW). No doc covers "post-kill scholar withdrawal" — the behavior is
documented here instead of invented into canon.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sims)

**Question:** does a policy-side kill-and-live protocol turn the scholar's
wave-4 kills from a death channel into living veterans, moving the
2-living-veterans readiness bar?

**PRIMARY (binding):** share of ARMED wave-4 kills (w===4, via='player')
whose killer is alive at +30d post-kill (E3 convention: no samples.deaths
record for the killer vid with killDay <= day <= killDay+30; censored kills
with killDay+30 > run end are listed and excluded). GO >= 4/8 (=50%;
baseline E3: 0.10).

**SECONDARY:** 2-living-veterans bar (waveCombatReadiness(5).veterans >= 2,
live read, max over run) met in >= 2/8 runs per policy.

**GUARDRAILS (all binding):** median survival >= control -10d; no new death
modes (armed cause set ⊆ control cause set); wave-4 unlocks >= control.

**PILOT GATE:** 8 seeds (64001–64008 — verified zero filename/content hits
in evidence/ and scripts/) x {leadfeast, belongfeast} = 16 runs per arm,
control vs armed on IDENTICAL seeds, 180d death-aware horizon, the exact
w5doormeasure substrate (withSeatDrive(withWinDefer(withVetrel(
withReposition(TF base)))), SEATDRIVE=0 pre-seat, VETREL/REPOSITION inert).
If PRIMARY misses at pilot: KILL the arm (delete layer zero-trace, keep
instruments + evidence). If GO at pilot: confirm on 8 more seeds (16 total
per arm).

**§15 balanced panel:** before/after through scripts/balance-panel.js's
scorecard (scripts/build-scholarsurvive-panels.js) — the panel is the
instrument, the pre-registered threshold is the judge.

**Sense-testing (SENSE-TESTING LAW):** one armed seed re-run with Game.say
captured around wave-4 kill days (±5/+10d) — read whole, judge whether the
withdrawal reads as a sensible person surviving.

**Wall numbers (standing directive):** national / table / wins, wave reach
1–5, median/max survival, death-cause shares — reported every run.

**Convergence state for this axis:** converging (the w5 door remains the
binding wall on every substrate measured to date).

---

*(results below — filled after the sweep; the pre-registration above is unchanged)*

## Results

Pilot sweep complete 2026-10-20: 32/32 runs (16 control + 16 armed), 0
engine errors, 0 instrument errors (SMOKE 8/8 GREEN both arms before the
pilot; proof test 9/9 GREEN armed, 3/3 gate-off). Two service restarts
mid-pilot; batches resumed from per-seed JSONs (deterministic per seed —
re-runs are byte-identical); one duplicate batch pair killed, no
corruption (per-seed files are written atomically at run end).

### PRIMARY: killer alive at +30d — MISS (0/26 = 0.0%, bar >= 50%)

ARMED wave-4 player kills: 26 across 10 runs. Killer alive at +30d: **0**.
Control baseline on the identical seeds: 0/19 (E3's 0.10 does not
reproduce on this seed set — the channel is, if anything, worse here).

Per-kill outcomes (armed): same-day deaths d128 (3 kills), d143 (3 kills);
+1d d72; +4d d162; +5d d95 (sickness); +9d d114, d141; +11d d73; +12d
d176; +21d d142 (dehydration). Full table in the analyzer output
(scripts/analyze-scholarsurvive-20261020.js).

**The arm is KILLED at pilot per the pre-registered kill protocol.**
The layer (scripts/policies/scholarsurvive.js) is deleted zero-trace;
instruments and evidence kept.

### SECONDARY: 2-living-veterans bar — MISS (0/8 per policy, bar 2/8)

vets5max reached 1 on 3 armed runs (leadfeast s64003/s64007,
belongfeast s64002), never 2. Control: 1 on 4 runs, never 2.

### GUARDRAILS

- Median survival: control 154d, armed 176d (>= control-10: PASS).
- New death modes: [The Algorithm] — 1 villager death (mateo_alvarez,
  s64002 d96, kind=villager) to the decoupled wave-5 Algorithm (the known
  #469 overtime mechanism, not a layer effect). Noise-level (1/16 runs);
  reported, not hidden.
- Wave-4 unlocks: control 13, armed 13 (>= control: PASS).

### §15 balanced panel — review_required

scripts/build-scholarsurvive-panels.js vs the pre-registered threshold:
playerDeaths regression_watch both policies (leadfeast +0.75/run
CI[-0.25,2.38]; belongfeast +0.75/run CI[0.00,2.25];
playerDeaths100Days +0.29 CI[0.00,0.86]). The layer does not merely fail
to save killers — it trends toward MORE player deaths (the d162
mechanism: disengage from one fight walks the scholar into the next).
Panel .md/.json: evidence/2026-10-20/scholarsurvive-panel.*.

### Engagement (the layer did fire)

Armed totals: killsDetected=20, disengages=105, rests=14, recoverDays=59,
homeWalks=11, recoveriesEnded=3. The hook works mechanically (proof test
9/9 GREEN); the world defeats it.

### Wall numbers (standing directive, every run)

- national / table / wins: control 0/16 / 0/16 / 0/16; armed 0/16 / 0/16 / 0/16
- wave reach: control [16,16,14,13,0]; armed [16,16,14,13,0]
- median / max survival: control 154 / 182; armed 176 / 182
- death causes: combat dominates both (495 control / 534 armed);
  villager combat 110/111; starvation 17/16; the long tail is unchanged
  (see analyzer output for the full shares).

## Mechanism autopsy (why the layer failed — the valuable part)

The withdrawal is mechanically sound and fires constantly, but the
veteran-channel death shape is deeper than re-engagement:

1. **Same-day deaths are structurally unreachable** (6/26 kills): d128
   (3 kills) and d143 (3 kills) — the killer lands multiple wave-4 kills
   and dies IN the kill fight or later the same day. A post-fight daily
   detector can never open in time. Any policy-side layer is blind here;
   only winning the kill fight more safely (or not fighting it) helps.
2. **Threat saturation defeats withdrawal** (the d162 read): the scholar
   disengaged from The Big Beast at Haven ("BARRIER CROSSED — it can't
   follow"), walked to the creek, and walked into a SEALED Vex Marlowe
   fight ("no escape that way" x4) and died. Withdrawal doesn't reduce
   encounters — travel legs and bedroll raids keep delivering new wave-4
   fights inside the window. The killer doesn't die from re-engaging the
   SAME fight; they die because the world is saturated.
3. **Non-combat deaths** (3/26 kills): sickness d95 (+5d), dehydration
   d142 (+21d). The layer has no disease/water answer; the base policy
   tends others, not the scholar.
4. **The layer may cost lives**: panel playerDeaths +0.75/run
   (regression_watch). Fleeing one fight walks the scholar into the next;
   105 disengages, 0 killers saved.

Net: the E3 "9/10 die within 30d" is not a re-engagement problem — it is
a threat-density + kill-fight-lethality + attrition problem. A
policy-side withdrawal layer cannot fix it. The veteran bar needs
killers who survive the kill fight itself and a world that doesn't
deliver a fresh wave-4 to their bedroll the next week — a game-side
question (fight lethality, raid pressure, disease), not a policy-side one.

## Sense-testing (SENSE-TESTING LAW)

Armed s64002 re-run, Game.say captured around the wave-4 kill days
(d90 ±5/+10d, d158, d164):
evidence/2026-10-20/scholarsurvive-transcripts/belongfeast-s64002.txt
(6701+ lines, read in the kill windows).

- The withdrawal READS as a sensible person: after the d90 influencer
  kill the layer's line fires ("Ten days, no treeline, hurt or not. The
  last one who felt fine after killing a herald was dead by morning."),
  the scholar disengages from The Big Beast at the bedroll ("BARRIER
  CROSSED — it can't follow"), walks home. A human reader believes the
  behavior.
- The death reads as the world, not the policy: the sealed Vex Marlowe
  fight ("no escape that way" x4) is a death trap the withdrawal walked
  into, not a failure of nerve. The fiction holds; the mechanics don't.
- Villager SAY lines in the window are alive (gossip chains about Ines,
  the mantle-transfer grief for Marcus Niu: "The fire keeps expecting
  him, and so do you"). SENSE-OK on the fiction; the numbers are the
  problem, not the prose.

## Metric review (§14 — binding, never re-scored)

- PRIMARY: MISS, 0/26 vs the >=50% bar. Not re-scored; the arm is killed.
  The bar was honest (E3's 0.10 baseline left headroom); the outcome is a
  real zero, not a threshold artifact.
- The control baseline on these seeds (0/19) undercuts E3's 0.10 — seed
  noise on a rare event, or the channel worsening. Either way the primary
  compares armed-vs-bar, not armed-vs-control, per the pre-registration.
- Panel "not_observed" metrics (entered, livingNpcs, lowFood, …) are the
  thin instrument's honest gaps — my corpus doesn't populate those
  contract fields. Not a failure; named here.
- Guardrail "no new death modes": 1 Algorithm death, assessed as noise
  (decoupled wave-5 mechanism, non-scholar). Reported, not hidden.

## Village assessment

Sixteen villages on the w5doormeasure substrate, half with a bodyguard
protocol for their herald-killers. What they looked like: wave-4 reached
on 13/16 each side, the w5 door never approached (def5 never true on this
corpus — the standing leg binds first here), villages dying to combat
attrition (495/534 combat deaths) with starvation as the second scythe.
The armed villages lived slightly longer (median 176 vs 154) but buried
slightly more scholars. Nobody reached national; nobody won. The blank
filled: the veteran channel is not a re-engagement problem — documented
above with the mechanism autopsy. The blank remains: how a wave-4 killer
survives the kill fight and the week after in a saturated world.

## Named nexts

1. [backlog → open] The veteran-channel death shape is now refined:
   same-day kill-fight deaths (structurally policy-unreachable),
   threat-saturation deaths (bedroll raids, sealed fights),
   non-combat attrition (sickness, dehydration). A game-side lever
   (kill-fight lethality, raid pressure on recovering killers, scholar
   self-care) is the named next — not another policy wrapper.
2. [backlog → open] Sealed-fight death traps (Vex Marlowe: 4x "no escape
   that way" then death) — is a no-exit wave-4 fight fair when the
   policy's only answer is the barrier? Design question for the combat
   lane.
3. [steve-call] The d162 sequence shows withdrawal can walk a scholar
   from one wave-4 fight into a worse one. If a future arm retries
   withdrawal, the travel leg needs the encounter honesty checked first.
4. Panel playerDeaths regression_watch (+0.75/run) corroborates: the
   layer trends harmful. Killed arms leave no trace — done.

## Convergence state for this axis

converging (the w5 door remains the binding wall; the veteran channel is
now understood as threat-density + kill-fight-lethality, not
re-engagement — the next arm must be game-side, not policy-side).
