# longsim scale-wall run r2 — DIRECTIONAL FLEE (2026-10-13, flesh-out)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation; `longsims-rotation.txt` stays 3)
- **Question:** r1 KILLED the DPS-race lever at pilot (median 69→28d) with an honest diagnosis: the barrier push extracts scholars from fights but pushes through the NEAREST edge, stranding hurt, hungry scholars on unknown nodes (seed-44 trace: day-25 scholar pushed (4,4)→(3,4)→(2,4) AWAY from haven, starved the same day). Does DIRECTIONAL fleeing — havenward exits that judge the destination, plus a recover-and-return window — fix the stranding without reintroducing the deaths the push was saving?
- **Primary metric:** national reach per seed (0/1); secondary: median survival days
- **GO threshold:** after-side national ≥ 2/8 AND median survival ≥ 1.2× baseline (≥82.8d) — else KILL AT PILOT
- **Horizon:** 150d death-aware (dead villages stop; +10d tail)
- **Seeds:** 11/22/33/44 × competent/winseek = 8 runs before/after on IDENTICAL seeds
- **Gate config:** COMPETENT_DIRECTIONAL_FLEE=1 (AFTER) vs unset (BEFORE). COMPETENT_DPS_RACE unset in BOTH arms — the DPS instrument stays inert; the disengage triggers under test are the new-fight outmatched assessment + the legacy 35%-HP threshold, both funneling through the directional flee(). Lever lives in competent.fight only; winseek's own flee() is untouched (legacy) — winseek is the untreated control arm.
- **Baseline:** re-run on this tree's tip BEFORE the lever (gate off) — see Results.

## Canon check
READ docs/CANON.md FIRST, then MONSTER-WAVES.md + BEAR.md + DESIGN.md combat intent ("slow and risky to start"). Fights are REAL fights, never RNG outcome tables. The Highbeam Deer (160 HP) is the benchmark — never questioned. Engine law used: tbBarrierExit pushes onto the haven tile end even relentless chases ("HAVEN IS SAFE" — game.js); sealed fights refuse the push.

## Lever played: DIRECTIONAL FLEE + RECOVER-AND-RETURN (policy-side)
One functional lever under one new gate (`COMPETENT_DIRECTIONAL_FLEE=1`, default OFF), orthogonal to `COMPETENT_DPS_RACE`:
1. `chooseFleeDir(Game, mpx, mpy)` — scores the 4 exit directions: +10 landing ON haven (engine-guaranteed chase end), +4 havenward, +1 lateral, −2 away; +2 destination known (visited/shared); −6 destination monster-active. When a safe havenward exit exists, monster-active exits are excluded outright (never trade one fight for another on the way home). At the haven node: HOLD — return null, no push leads toward safety; fight() falls through to tricks/strikes (standing ground with the pantry beats pushing outward — the r1 lesson, stated as code).
2. `flee()` (competent.fight): with the gate on, walks one tile/turn toward the chosen edge (the full edge walk exceeds moveLeft — tbPlayerMove refuses long paths), then pushes THROUGH via tbBarrierExit toward the judged destination. A push that moves the scholar or ends the fight marks the recover window.
3. `recovering()` / `recoverStep()` / `markRecover()` — for 2 days after a directional push (or until fed+healed at haven), daily() skips outward legs (stoneRun's frontier pushes, forage trips, counterPlay, workTrapline) and walks the scholar home to eat/drink instead of wandering the new node.

**Mechanism proof: scripts/test-directional-flee-r1.js — 19/19 PASS** (a: havenward choice + walk + push land closer to haven + recover marked; b: rejudges away from a monster-active havenward node, holds at haven with zero pushes; c: recover window bounded, expires, ends early when fed+healed, inert with gate off). Sweep driver: scripts/sweep-dir-flee-r1.js.

## Results

### Baseline re-run on this tree's tip (gate off) — matches r1 exactly
8 runs, seeds 11/22/33/44 × competent/winseek, 150d death-aware: **national 0/8, table 0/8, won 0/8, median 69d** — byte-identical per-seed days to r1's bc1980f6 baseline (competent 69/150/14/90, winseek 32/124/15/34). The tip is stable; the wall holds.

### Pilot verdict: KILLED AT PILOT
Identical 8 seeds, after-side (COMPETENT_DIRECTIONAL_FLEE=1, DPS_RACE unset): **national 0/8, table 0/8, won 0/8, median 44d** (GO required national ≥ 2/8 AND median ≥ 82.8d = 1.2× 69d).

| | national | table | won | median days |
|---|---|---|---|---|
| before (gate off) | 0/8 | 0/8 | 0/8 | 69 |
| after (gate on) | 0/8 | 0/8 | 0/8 | 44 |
| GO threshold | ≥2/8 | — | — | ≥82.8 |

Per-run days before: 69/150/14/90 (competent), 32/124/15/34 (winseek).
Per-run days after: 84/109/14/44 (competent), 32/124/15/34 (winseek — byte-identical; control arm untouched as designed).

### Why (honest diagnosis, diag-verified)
1. **The blank was rarer than the diagnosis implied.** The directional push — the actual r1-blank-filler — fired only **2× in 8 runs** (seed 22: (3,0)→(3,1), havenward onto a known-safe node, score 6 — the mechanism worked live exactly as designed). Disengages happen overwhelmingly AT haven, not on wild nodes: **54 holds** vs 2 pushes. The r1 stranding scenario (push outward from a wild node) is real but rare; the lever's main behavioral effect was never the push.
2. **The hold-at-haven dominated — and the net is negative.** 54 holds converted the legacy "walk to the edge and stall" into "stand and fight." Locally it helped: seed-44 in-fight scholar deaths 3→1 (diag-dir-flee-r1). But villages collapsed earlier on seeds 22 (150→109d) and 44 (90→44d); scholar deaths flat (4→4 on seed 44), villager deaths up (3→7). The causal chain from hold to earlier collapse is NOT fully traced — filed as an open blank, not a claim.
3. **Telemetry correction (matters for reading r1 too): the 'combat' death bucket mixes monster kills with people deaths.** `registerDeath({kind:'monster', cause:'combat'})` fires for every monster the scholar kills, and the tb player-death branch has NO registerDeath — scholar deaths are invisible in the sweep's death telemetry. Kind-split recount: seed-44 'combat' 11→20 was MONKILLS 13→20 (the scholar kills more when they fight back), not more scholar deaths. Bearer deaths tracked separately via villagerId changes: 2→5, 6→5, 1→1, 4→4 (before→after). The r1 "player combat deaths 34→14" reading conflates the same way — future runs should use kind-split keys.

### Convergence state: killed-at-pilot
Scale-onramp stays the blocking axis; wall numbers unchanged (national 0/8, table 0/8, wins 0, wave 4–5 unlocks 0). `longsims-rotation.txt` stays 3 (standing directive overrides rotation). The lever is kept behind the opt-in gate (default OFF), documented, proven 19/19 — inert unless a future run re-arms it.

### Village assessment (after-side, gate on)
- **Seed 11 (competent)** improved 69→84d — the only seed the lever helped (16 holds, 0 pushes; fewer villager deaths 9→6).
- **Seed 22** fell 150→109d (the run that previously survived the horizon). 2 havenward pushes + 1 recover day; 18 holds.
- **Seed 33** unchanged 14d (early collapse both arms — thirst/starvation, untouched by a fight lever).
- **Seed 44** fell 90→44d. 14 holds; the traced haven fight (14 ducks, outmatched at start) held 6 turns and the scholar died at turn 12 — vs 3 in-fight deaths across 90 days before. Villager deaths 3→7.
- **Who died and why:** scholars die at roughly the same rate (bearer deaths flat); villagers die faster in the after-side on 2/4 seeds. The fight lever moves haven-fight dynamics but not the village's survival.
- **Missing capabilities:** no instrument measures WHY the hold hurts the village (fight-duration × village-clock interaction is the open hypothesis — tb fights freeze the day clock, and faster fight resolution may re-expose villagers to field risk sooner); scholar deaths invisible in death telemetry (needs a bearer-death tele event); the push needs wild-node disengages to matter, which barely occur.
- **Blanks filled:** (1) directional flee instrument — built, proven 19/19, kept gated; (2) destination judgment (havenward + known-safe + monster-active exclusion); (3) recover-and-return window; (4) kind-split death telemetry in the sweep driver (future runs should keep it).
- **Blanks documented (open):** hold-at-haven → earlier village collapse (mechanism untraced); bearer deaths missing from telemetry; the r1 'combat deaths' readings need kind-split re-interpretation.

### Sense-testing (transcripts read)
- **Villagers act like people (unchanged by this lever).** 40-day after-side sample (seed 22): distinct profiles/occupations (Wolfgang McDonald the journalist-wanderer — the same voice r1 sense-tested; Lena Ruiz er_nurse-forager; James Okonkwo carpenter-forager). The lever touches only the scholar's fight/daily policy; villager agency, dialogue, and gossip systems are untouched.
- **Flagged (pre-existing, not mine):** the sim policy talkTo→endConvo's immediately, so sims never hold real conversations (policy-fidelity note from r1, still true).

### What I changed (files)
- scripts/policies/competent.js — COMPETENT_DIRECTIONAL_FLEE gate; chooseFleeDir/fleeDirScore (havenward scoring + destination judgment + haven hold); directional flee() walk-then-push; markRecover/recovering/recoverStep + daily() wiring (outward legs skipped while recovering); exports for the proof test
- scripts/test-directional-flee-r1.js — 19/19 mechanism proof (NEW)
- scripts/sweep-dir-flee-r1.js — before/after sweep driver, identical seeds, kind-split death telemetry (NEW)
- scripts/diag-dir-flee-r1.js, scripts/diag-scholar-deaths-r1.js — fight + bearer-death diagnostics (NEW)
- evidence/2026-10-13/sim-scale-wall-r2.md — this file

### Numbers table (before → after, identical seeds 11/22/33/44)
| | national | table | won | median days | scholar (bearer) deaths |
|---|---|---|---|---|---|
| before (gate off) | 0/8 | 0/8 | 0/8 | 69 | 2/6/1/4 |
| after (gate on) | 0/8 | 0/8 | 0/8 | 44 | 5/5/1/4 |
| GO threshold | ≥2/8 | — | — | ≥82.8 | — |

Wall numbers every run: national 0/8, table 0/8, wins 0, wave 4–5 unlocks 0, max wave 3, max arc 3.
