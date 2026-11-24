# sim-retarget-a — PREREG (frozen)

**Arm:** sim-retarget-a · **Loop A run:** fleshout-20261124T0715Z
**Axis:** scale-onramp (converging, NOT converged) · **Finding:** #2720
(tracker next blank — hunt-locked plan retarget; evidence
`evidence/2026-11-23/sim-planform-a-prereg.md` + analysis
`evidence/2026-11-23/planform-a-analysis.json`, DIAG-GO merged
16de94e71)
**Type:** LEVER (one game-code change, flag-gated default-OFF, + driver
+ analyzer + proof test) · **Base master:** `60f6e7436`
(worktree `~/workspace/worktrees/sim-retarget-a`, branch
`sim-retarget-a`; verified `git log --oneline -1` at run start.
FROZEN_BASE below is filled with this prereg commit's hash once
committed.)
**Frozen:** 2026-11-24 ~01:40 UTC, before any judged run. No judged run
has run.

## 0. Why this run (read first)

On the planform band 107633–107648 (16 seeds, 150d, competent
verbatim), 303/303 wave-4 meetings classified, 0 unclassified — 71
bounced off the hunt-lock: a plan frozen in hunt/standing/table stage
bounces unchanged however often the holder meets a wave-4 monster.
Sense case seed 107639: 37 wave-4 meetings, 0 wave-4+ plans ever
created; a holder's targetless hunt plan (needWave 3) bounced a
strike, an audit and a reunion off the lock. The lock is the designed
anti-flip gate, but it is now named as the wave-4 formation wall.
This arm builds the retarget lever the coordinator's design call
names (Steve can overrule): let the seed retarget a hunt-locked plan
upward onto a wave-4 meeting the holder just had.

## 1. Design call (coordinator, Steve can overrule — recorded here)

In `winPlanSeedFromFight` (src/js/win-plan.js), when the lever is on
and the holder's plan is in stage hunt/standing/table and the met
monster's wave is strictly greater than the plan's current wave AND
>= 4: retarget the plan onto the met monster (target + needWave +
node refreshed from the holder's node, exactly as the gear/party
seed path does). Stage stays as it is — a hunt plan keeps hunting,
now at the bigger beast; the departure gate already launches
party/hunt/standing/table plans through the same `launchParty`, so
no stage change is needed for the new target to be hunted. The
party list stays — the party that set out together retargets
together; the next launch re-forms companions and syncs their plans
to the new target. Retarget ONLY upward in wave (never downward,
never sideways to the same wave), so the lock still stops
flip-flopping. The Suburb exclusion stands (never seed or retarget
onto a leave-counter species). A deterministic retarget beat is
spoken at the meeting (Steve's no-silent-actions law): the holder
changes their mind for a named reason — the bigger beast they just
met — not a silent pointer swap. No second-plan variant is built in
this arm (the brief forbids it).

Current wave of a plan: `plan.needWave` when set; else the wave of
`plan.target`'s species (the companion-inherited plan case, leadgate-a
— needWave null); else 0 (a targetless plan with no wave: any
wave-4+ meeting is upward from nothing).

## 2. Route — game code, flag-gated (policy route infeasible)

A policy-side driver cannot reach the seed call: the four seed call
sites live inside engine fight routers (game.js
`resolveWildMonsterEncounter`, villager-agency.js `expeditionMonster`
evade/flee branches, win-plan.js `winPlanFightGate`), which fire
during villager fights. Policy modules (scripts/policies/*.js) drive
only the scholar bot's daily decisions and cannot intercept villager
fight callbacks. So the lever is a small default-OFF flag-gated
change in win-plan.js: `planretargetOn()` (`PLANRETARGET=1`, node
sims only; in the browser `process` is undefined, so the lever is
off), following the established `planreseedOn()` / `fleerepair2On()`
pattern. Flag off, `winPlanSeedFromFight` behaves exactly as before
(the hunt-lock early return is untouched). The change adds:
`planRetargets` to `winPlanStats` (+ null-guard in `stateOf`, the
existing pattern), the upward-only retarget branch, and the
`retargetBeat` line (deterministic wording, SAY_RE token `veteran`
so the recorder keeps it in the corpus transcript).

## 3. Band — fresh (verified)

**Band: 109411–109426 (16 seeds).** Pilot 109411–109418, confirm
109419–109426. Freshness check (seed-band skill: every dated prereg
under `evidence/*/sim-*-prereg.md`, plus all
`evidence/2026-11-2*/*.md`, plus evidence filenames):

- The suggested band 109401–109408 is CONTAMINATED: 109401–109403
  are staged by journey-deepening-r278
  (`evidence/2026-11-24/journey-deepening-r278.md:52`). NOT used.
- This band 109411–109426: ZERO hits in preregs and `.md` evidence
  for `1094[0-9][0-9]` (only 109401/109402/109403 appear anywhere,
  all in journey-deepening-r278.md); ZERO `*1094*` evidence
  filenames (the only `1094` filename hits are `s11094`, a different
  seed). Checked 2026-11-24 ~01:35 UTC.
- Neighbor bands do not overlap: planform-a 107633–107648,
  departsafe-a 107601–107616, Loop B live band 109309–109324, Loop B
  journey-deepening 109401–109403. None names 109411–109426.

## 4. The instrument

Copy of the proven recorder `scripts/planform-driver-a.js` →
`scripts/retarget-driver-a.js`, deltas frozen here:

1. Output evidence dir 2026-11-24 (`EVIDENCE_DATE` override), arm
   `retarget-a`, MODE `ctl` | `arm`, file names
   `retarget-a-s<seed>-retarget-a-<mode>.json`, outdir
   `perseed-retarget-a-<mode>`.
2. Policy module `scripts/policies/tableseat-nowait.js` (same as
   planform §3). **Layers OFF:** `TABLESEATNOWAIT` unset and
   `LEANLINKRESCUE` unset — the driver CLI refuses to run if either
   is `'1'`. Net effect: **competent verbatim play**.
3. Anchor pin: `FROZEN_BASE` = this prereg commit (filled in §0
   once committed). The CLI refuses to run unless run-time
   `git rev-parse HEAD` IS the frozen base. The instrument + game
   change stay UNCOMMITTED during the runs (node loads the
   working-tree code; HEAD does not move); everything commits at
   the end.
4. Substrate env (read by game code), identical to the planform
   prereg §3: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
   SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`; `LEND`,
   `PRESENCE`, `KILLBUNDLE`, `HPGATE`, `PINQUAD`, `PROFILEGATE4`
   unset. `PLANRESEED` stays UNSET on both legs — it is a separate
   lever's flag; its commit-time re-seed would interact with
   retargets and blur the before/after. `PLANRETARGET=1` on the arm
   leg ONLY; the driver CLI refuses MODE=arm unless
   `PLANRETARGET=1`, and refuses MODE=ctl if it is set.
5. Seed-row classification (analyzer, copy of
   `scripts/analyze-planform-a.js` → `scripts/analyze-retarget-a.js`,
   same meeting taxonomy A1–B8/C verbatim): a seed row is a
   **retarget** when `planBefore.stage` is in
   {hunt, standing, table} AND `planAfter.target == mid` AND
   `planAfter.needWave > beforeWave` AND `planAfter.needWave >= 4`,
   where `beforeWave = planBefore.needWave ?? waveOf(planBefore.target)
   ?? 0`. A seed row on a locked plan that changes the target to the
   met monster with `planAfter.needWave <= beforeWave` is a
   **defect** (downward/sideways retarget); a retarget onto `suburb`
   is a defect. Both defect kinds are counted separately and must be
   0 (bar 4).
6. Recorder env flag `RETARGET_RECORDER` (off skips the wraps —
   determinism / neutrality legs), mirroring `PLANFORM_RECORDER`.

All wraps remain pure reads + driver-local writes; no game-state
writes, no RNG. The only game-code change is the flag-gated
retarget (§2).

## 5. The question

On a fresh 16-seed band under the planform substrate, does letting a
hunt-locked plan retarget upward onto a wave-4 meeting the holder
just had (a) fire at all, (b) turn into more wave-4 kills, and (c)
do so without starving the village or shortening its life?

## 6. Pre-registered bars (judge — GO / NO-GO)

Measured on the driver's legs (control vs arm, identical seeds).
`retargets` = M1 count (§4.5). `w4kills` = non-dup `killCalls`
rows with wave == 4, cross-checked against the end-of-run
`daily[].wave4Slain` value. `starvation` = `deaths` rows with
cause == 'starvation' (band total). `medianSurvival` = median
`days` over seeds on the leg.

| # | Bar | Threshold |
|---|---|---|
| 1 | PRIMARY — retargets fire (pilot) | arm-leg retargets >= 5 on the 8-seed pilot |
| 2 | PRIMARY — wave-4 kills move (pilot) | arm w4kills > control w4kills on the pilot (band totals) |
| 3 | COST — no starvation / survival price (pilot) | arm starvation total <= control total + 2 AND arm medianSurvival >= 0.8 x control medianSurvival |
| 4 | DEFECT — upward-only holds | 0 downward/sideways retargets AND 0 suburb retargets, both legs, all seeds |
| 5 | INSTRUMENT | Proof test `scripts/test-retarget-a.js` green (unit: upward retarget fires; sideways/downward do not; suburb never; flag-off identical; beat deterministic + SAY_RE token; stats bump); analyzer `--selftest` green; 0 instrument errors on all pilot seed files |
| 6 | PILOT GATE (8 seeds 109411–109418, before the confirm half) | Bars 1–5 on the pilot. A pilot failure stops the run (NO-GO at pilot, no confirm spend; game code reverted, driver/analyzer/test deleted or left uncommitted — nothing lands) |
| 7 | CONFIRM — GO on the pooled 16 seeds | Pooled retargets >= 10 AND pooled w4kills arm > control AND cost bar clean pooled (same §6.3 shape) AND 0 defects pooled. A miss on any pooled bar is NO-GO, never re-scored against a friendlier metric mid-run |

Balanced panel (§15): after the pilot passes, run the panel
before/after (`node scripts/balance-panel.js` per leg-set,
`--intervention-flags PLANRETARGET`, pilot seeds, 150d) and attach
the compare `.md`. The panel is the instrument and a regression
check; the frozen bars above are the judge (cellgate precedent:
a non-`no_material_signal` panel decision with a negative
direction on wins/deaths is an investigation item before landing,
not an automatic NO-GO).

Determinism: a replay of 2 pilot seeds on the arm leg reproduces
the retarget count AND w4kills exactly. Flag neutrality: the same
2 seeds run as MODE=arm with `PLANRETARGET` unset reproduce the
MODE=ctl corpus game outcomes exactly — `winPlanStats`
(parties/departures/retargets), survival days, maxWave, standing,
total deaths, killCalls (the planform prereg §6 bar-4 lesson: never
compare recorder rows across legs — they are empty by construction
when off).

## 7. Pilot → confirm plan

1. Proof test + analyzer selftest green (bar 5, fixtures only).
2. Pilot: 8 seeds 109411–109418, both legs, recorder on.
3. Pilot gate (§6 bar 6). If it passes: determinism + neutrality
   replays on 2 pilot seeds; balanced panel before/after.
4. Confirm: 8 seeds 109419–109426, both legs, recorder on.
5. Analyzer over all 16 pooled; evidence + sense-test (one
   retarget's days read as a story, §8).

## 8. Sense-test (frozen)

Pick one retarget on the arm leg and read its days as a story — the
meeting, the retarget beat line as it appears in the corpus
transcript (`vetSays`), the next departure after the bigger beast,
and whether the hunt that followed made sense. Judge whether the
retarget reads as a person changing their mind for a named reason
(the bigger beast they just met) or as a silent pointer swap. The
verdict section names the village and quotes it.

## 9. Wall numbers (reported every run, never judged)

Wins, national, table, wave-5 reached, wave-4 reached, median
survival, max survival, villages lost, total deaths — per leg
(control vs arm).

## 10. Metric review (to fill at evidence time, never mid-run)

- Whether the retarget count is driven by one seed/village or
  spread across the band (a single-village effect is a weaker GO).
- Whether retargeted plans actually launch on the new target
  (departures after a retarget) or retarget and then sit — the
  planform B8 bucket (gate-avoid-plan-exists, 59 meetings) is NOT
  touched by this lever; if retargets fire but launches do not
  follow, say so.
- Whether the wave-4 kill gain (if any) comes from retargeted
  holders or from elsewhere on the arm leg (killCalls `by` vs
  retarget holders).
- Whether the cost bar's starvation shape (+2 on a ~5-per-band
  base) was the right tolerance, and whether median survival is
  the right survival read on a 150d death-aware horizon.

## 11. Freshness check (record, per the seed-band skill)

- Searched: all `evidence/*/sim-*-prereg.md` + all
  `evidence/2026-11-2*/*.md` for `1094[0-9][0-9]`, plus
  `evidence/**/*1094*` filenames.
- This band 109411–109426: ZERO hits in preregs and `.md` evidence
  (the only `1094xx` hits anywhere are 109401/109402/109403 in
  `evidence/2026-11-24/journey-deepening-r278.md`, a different band);
  ZERO `*1094*` evidence filenames (only `s11094`, a different
  seed). Checked 2026-11-24 ~01:35 UTC.
- Neighbor bands: planform-a 107633–107648, departsafe-a
  107601–107616, Loop B live 109309–109324, journey-deepening
  109401–109403 — none overlaps 109411–109426.

## 13. CORRECTION — neutrality leg (2026-11-24 ~02:00 UTC, before any judged run)

§6's flag-neutrality leg as written ("the same 2 seeds run as
MODE=arm with PLANRETARGET unset reproduce the MODE=ctl corpus game
outcomes exactly") cannot run: the driver's own CLI guard refuses
MODE=arm unless PLANRETARGET=1 and refuses MODE=ctl when it is set
(prereg §4.4) — the combination the leg names is un-runnable by
design. The neutrality proof therefore moves to the level where the
flag is actually read:

- UNIT (proof test §1, U0 + U8a): in one live game, the same
  hunt-plan seed call with PLANRETARGET unset returns the plan
  unchanged, speaks nothing, and bumps nothing — for the upward,
  sideways, downward, and suburb shapes alike. The retarget branch
  is dead when the flag is off and the hunt-lock early return is
  byte-identical to the old code, so flag-off IS the old behavior.
- RUN (proof test §3, D2): recorder-off replays reproduce the
  recorder-independent game outcomes exactly (days, partyDepartures,
  maxWave, standing, deaths, killCalls), proving the instrument
  itself does not move the game.

The determinism leg stands as written (a replay of 2 pilot seeds on
the arm leg reproduces the retarget count AND w4kills exactly). No
bar threshold changed; the frozen bars are judged on the pilot and
confirm legs as frozen in §6.

## 12. Code-grounded seed-call map (frozen — read from the code on this base, not invented)

`winPlanSeedFromFight(vid, mdef, outcome)` (src/js/win-plan.js)
seeds or retargets ONLY when all of these hold: `mdef.wave >= 3`;
NOT (`fleerepair2On()` AND `mdef.id === 'suburb'`); the holder's
plan, if any, is in stage `gear` or `party` — a `hunt`/`standing`/
`table` plan early-returns unchanged (the hunt-lock, planform
finding #2720). When it seeds it sets `target = mdef.id`,
`needWave = mdef.wave`, stage `party` if armed+armored else `gear`.
It does NOT check the wave gate, standing, or whether the holder is
at Haven. The four call sites (planform prereg §12, unchanged on
this base): game.js `resolveWildMonsterEncounter` (VETREENGAGE
block, `vFlee` only, not raid, not aid); villager-agency.js
`expeditionMonster` evade branch (`evaded`); same, flee branch
(`fled`); win-plan.js `winPlanFightGate` outmatched branch
(`avoided`, only when the holder has NO plan — when a plan exists
the gate resets its stage to gear/party and never sets its target;
that B8 path is out of this arm's scope and stays as is).

This arm's change is confined to `winPlanSeedFromFight` + the
`planretargetOn()` gate + the `retargetBeat` line + the
`planRetargets` stat. No other game file is touched. The sibling
arms in this run (sim-holdspeak-a, sim-departteach-a) own the
departure-beat and teaching paths; if the retarget beat needs a
change in a file they own, STOP and report to the coordinator
instead of editing it.
