# SIM-FEASTTABLE — feast-as-table-door isolation (ARM 3, loop B, food-economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-feasttable
Axis: food-economy (scale-wall lens) — sim-findings FEAST-AS-TABLE-DOOR claimed (3x replicated, graduated to own arm).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the feast-as-table-door finding is 3× replicated (overstock
  r32b table 0→5 with telemetry LOUD — all 5 table seeds had overstock
  feasts, Arc 4; sim-overdraw3 pilot 0→4 + wave-5 0→5; sim-allowancegate2
  pilot 4→5) but every replication bundled the feast with confounds —
  pantry-blind firing (r32b), aid + early-tribute verbs (overdraw3), or
  feasts on both sides (allowgate2). Correlation or causation unresolved.
  This arm ISOLATES the feast: the armed side hosts ONLY candidate-gated,
  floor-honored major feasts (the r13 candidacy + the re-armed 4-day gate),
  with NO tribute or aid changes; the control side never feasts at all.
  Measured on table seats/deeds as the PRIMARY — not on rot.
- **Lever**: scripts/policies/feasttable.js (FEASTTABLE=1, default OFF).
  Wraps the base courtship policies (belongseek/leadcourt) →
  belongtable/leadtable. Gate off = pure delegation (proof R1 pins
  byte-identical). Gate on: daily wraps FS.trackTribute (READ-ONLY
  recording of the engine's real payTribute/tendLink return values —
  tribute/tend counts as contribution toward the ≥1500 candidacy bar; the
  verbs themselves untouched, no aid verb added); upkeep runs the parent
  then tableFeast: AG2.feastCandidate (dusk, haven, one-feast/day, cadence
  7d armed/14d unarmed incl. fusion ceiling, contribution ≥1500,
  plan.ok, 1.5× buffer) → 4-day floor test (spendTarget = (freshDays−4)×
  burn; hold on candidates only, ctx.ftGateHeld, postponed not displaced)
  → Game.hostFeast() on a qualified candidate, marking
  ctx._fsLastFeastDay / ctx.fsFeasts / ctx.fsArmedFeasts exactly as the
  r13 layer does. Zero src/js changes.
- **CONTROL-DESIGN NOTE (deviation from the claim's letter, documented)**:
  the run claim names the control "(leadfeast/belongfeast...)". Running
  the r13 allowance as the control would reproduce the just-landed
  allowgate2 comparison (r13 vs r13+floor, table 4→5/16 already measured
  as a guardrail) — feasts on both sides isolates nothing. The graduation
  question is feast-vs-no-feast causation with the SAFE feast
  (candidate+floor). Control = the base policies (belongseek/leadcourt,
  FEASTTABLE unset): 0 scholar feasts by construction on the courtship
  road (eveningFeast's donations-only gate measured 0/60 dusks;
  surplusFeast needs COMPETENT_SURPLUS_FEAST=1). Re-measured on current
  tip, identical seeds. The task's own calibration ("isolates",
  "never fire pantry-blind", "No tribute or aid changes", GO bar +2/8)
  fits a pristine-class control, not an r13-class one.
- **PRIMARY**: table-reach rate (any tableSeat, lesser or full) armed ≥
  control + 2/8 on identical seeds. Table seats counted toward the
  primary carry a traced deed path: firstFeastDay → (feastSurgeUsedDay,
  sentimentDay) → seatDay. Seats WITHOUT a traced path are reported
  separately and the verdict says so plainly — never silently counted.
- **GUARDRAILS**: starvation deaths ≤ control+2; hungryDays ≤ control ×
  1.335 (r25b A/A noise ceiling); national ≥ control−2; no new death mode.
- **SECONDARY**: food-deed rung rate (sentimentTaught && feastSurgeUsed),
  deed attribution (feast→rung→seat per table seed), fsFeasts /
  fsArmedFeasts / ftGateHeld, wave-4/5 unlocks, Arc reach, wins, exiled,
  death-cause shares, Standing per avenue, fresh-days trajectory,
  pantry peaks.
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop.
- **Seeds**: pilot 11/22/33/44 × leadcourt/belongseek = 8 runs/side
  (the overdraw3 seed set, for comparability), IDENTICAL seeds control
  vs armed. Confirm 12–16/side only on pilot GO per §9.
- **Det-gate**: 16/16 bit-identical reruns both sides first (r27 rule);
  SMOKE=1 honesty gate (unwrap + live drive + gate-contrast fixtures:
  control does NOT fire on the 6.2d candidate fixture; armed FIRES on
  6.2d and HOLDS on 3.9d).
- **Decision rule**: GO → land as its own commit; primary miss or any
  guardrail breach → KILL per §14 (layer deleted, evidence + proof +
  sweep + sense + det-gate kept).
- **Instruments**: tableSeat()/deedGateReady() best-ever rows +
  waveLedgerPoints sampling (the r17 tablerecon convention);
  per-seed deed attribution (firstFeastDay, surgeUsedDay, sentimentDay,
  seatDay, seat).

## Proof results (REAL RED → GREEN, run BEFORE any sims, 2026-10-14)

scripts/test-feasttable-20261014.js. Independently re-run.

RED (FEASTTABLE unset): R1 gate-off byte-identical — belongtable/
leadtable == belongseek/leadcourt per-day hashes, 40d ×2 seeds, IDENTICAL
(the layer adds zero trajectory delta when off). R2: gate-off, the
control truly never feasts — on a contribution-armed 6.2d candidate
fixture (plan ok, 1.5× buffer passes) the parent fires NOTHING
(fsFeasts=0, pantry untouched): the isolation baseline is real, not
assumed.

GREEN (FEASTTABLE=1): R3 armed but no candidate (contrib < 1500) → no
feast AND no hold counted (holds are candidate-only). G1 fires on the
6.2d candidate fixture (pantry 15000→10000, freshDays 6.25→4.17 — floor
honored, fsFeasts=1, cadence marked). G2 holds on the 3.9d fixture (no
feast, pantry untouched at 9500, ftGateHeld=1, cadence NOT marked).
G3 postponed feasts fire on recovery (day-30 hold, cadence unmarked;
fresh food arrives; day-31 fires, _fsLastFeastDay=31). G4 tribute counts
as contribution (gives=0 + _tribHist 2000 → fires; _tribHist empty →
no candidate, no fire, no hold — the r13 rule reused, not reinvented).
G5 no tribute/aid behavior change (payTribute/tendLink restored after
daily; the layer CALLED neither — 0 calls — while the feast still
fired). G6 armed determinism (identical fixture twice → identical).
G7 no double-feast the same dusk. G8 60d armed run: 5 feasts, floor ≥
3.99 after EVERY one (min 11.41) — the floor invariant live.
RESULT: all checks passed (RED and GREEN).
Det-gate 16/16 bit-identical BOTH sides (scripts/det-gate-feasttable-20261014.js);
SMOKE=1 honesty gate green both sides (incl. the gate-contrast fixtures:
control fires nothing on 6.2d; armed fires on 6.2d, holds on 3.9d).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense runs (FEASTTABLE=1; scripts/sense-feasttable-20261014.js).

**belongseek seed 22 (120d, survived):** 12 feasts, all fired at
hungryStreak 0, fresh-days landing 4.3–20.2 after each (the floor
visible, never breached). The beats read as a village deciding, not a
number going up: "🍖 FEAST 📺 — Walt opens the pantry wide: 3× Foraged
food, 1× Foraged food, 1× Snared meat. Zuri, Caitriona, Theo, Nora eat
until the fire burns low. Somebody laughs so hard they cry. For one
evening, nobody is surviving — they're just together. (−2,142 kcal from
the pantry)". Named openers and attendees, varying menus, honest kcal
accounting. The d21 feast fired UNARMED and the engine said so honestly:
"but no keepsake was channeled. The surge must be armed before a feast
can carry it." The d29 feast fired armed — "The channeled keepsake feeds
the feast — the feast was the weapon, and the surge rides the fire" —
and the feast drew its consequence the same night: "🌙 The cookfire's
smell carried further than the laughter did... The Heckler is circling
the edge of the light. It followed the feast here. (A scavenger, drawn
by the feast. Face it while the feast is in you — or let the watch
drive it off.)" The feast→fight chain that marks feastSurgeUsed reads
as a real event with a real choice. The System's escalation line ties
it together: "feast like legends. Make it worth escalating."

**leadcourt seed 44 (103d, village-lost):** 6 feasts; the d27 feast
(Howard opens the pantry, −3,893 kcal, "the surge rides the fire", the
Heckler drawn) is the feast whose fight marked feastSurgeUsed d27 — and
the lesser table seat followed at d73. The village still died at d103
(of combat/monster, the way villages die), but the door opened first.

**PASS** — with the standing [open] re-note: the devotion channeling
line ("💛 You hold Coat button... The feast was the weapon.") fires
VERBATIM every day (finding #64 repetition class, fourth run in a row).
Filed, not chased. (Minor instrument note: the sense script's per-feast
`armed` column reads prog.feastSurge after the feast consumed it, so it
under-reports armed status vs the transcript and vs fsArmedFeasts —
cosmetic, not mechanism.)

## Pilot results

8 runs/side, identical seeds (11/22/33/44 × leadcourt/belongseek), 180d
death-aware. Det-gate 16/16 both sides; SMOKE green both sides.

| metric | control (FEASTTABLE unset) | armed (FEASTTABLE=1) | pre-reg |
|---|---|---|---|
| table (**PRIMARY**) | 0/8 | **3/8** | **GO** (≥ 0+2) |
| traced seats | — | 3/3 | — |
| food-deeds | 0/8 | 7/8 | — |
| national (GUARDRAIL) | 6/8 | 4/8 | ≥ 4 ✓ |
| starvation (GUARDRAIL) | 5 | 6 | ≤ 7 ✓ |
| hungryDays (GUARDRAIL) | 12 | 12 | ≤ 16.0 ✓ |
| no new death mode (GUARDRAIL) | — | same modes | ✓ |
| median survival | 138d | 128d | report |
| wave-4 / wave-5 | 1/8 / 0/8 | 7/8 / 4/8 | — |
| max Arc | 3 | 4 | — |
| wins / exiled | 0/8 / 0 | 0/8 / 0 | — |
| feasts (fsFeasts / armed) | 0 | 64 / 39 | mechanism |
| gate holds (candidate-only) | 0 | 52 | gate live |

Pilot verdict: GO per §9 — primary passed (3/8 ≥ 2/8, all 3 seats
traced), all guardrails held. Confirm authorized.

## Confirm results

16 runs/side, identical seeds (11/22/33/44/55/66/77/88 ×
leadcourt/belongseek), 180d death-aware.

| metric | control | armed | pre-reg | verdict |
|---|---|---|---|---|
| table (**PRIMARY**) | 0/16 | **5/16** | ≥ 0+4 | **GO** |
| traced seats | — | 5/5 | — | — |
| food-deeds | 0/16 | 13/16 | — | — |
| national (GUARDRAIL) | 11/16 | 6/16 | ≥ 9 | **MISS** |
| starvation (GUARDRAIL) | 8 | 10 | ≤ 10 | ✓ (at bound) |
| hungryDays (GUARDRAIL) | 28 | 32 | ≤ 37.4 | ✓ |
| no new death mode (GUARDRAIL) | — | same modes | — | ✓ |
| median survival | 129d | 94d | report | −35d |
| wave-4 / wave-5 | 4/16 | 11/16 | — | — |
| max Arc | 3 | 4 | — | — |
| wins / exiled | 0/16 / 2 | 0/16 / 2 | — | — |
| feasts (fsFeasts / armed) | 0 | 94 / 61 | mechanism | — |
| gate holds (candidate-only) | 0 | 79 | gate live | — |
| Standing plenty (median) | 0 | 120 | — | — |

Seats (all lesser, all traced): leadcourt-s44, belongseek-s22,
belongseek-s33, belongseek-s55, belongseek-s66.

**Verdict: KILLED AT CONFIRM per §14.** The primary passed decisively
(5/16 vs 0/16, every seat carrying a traced feast→rung→seat path), but
the national guardrail breached: 6/16 vs the pre-registered ≥ 9/16
(control 11 − 2). A GO met with a guardrail breached is NO-GO — never
re-scored. No further confirm spend.

## Why the guardrail missed (autopsy, not theory)

Paired per-seed national (control → armed), 16 seeds:

- National LOST on 5 seeds: belongseek-s88 (1→0), leadcourt-s22 (1→0),
  leadcourt-s44 (1→0), leadcourt-s66 (1→0), leadcourt-s77 (1→0).
- National KEPT on 6: belongseek-s33/s44/s66/s77, leadcourt-s11/s33
  (all 1→1). Never had it on 5.
- Of the 5 lost, FOUR died substantially earlier on the armed side:
  s88 131→42d, lead-s22 138→86d, lead-s66 110→54d, lead-s77 97→75d.
  The fifth (lead-s44, 116→103d) reached the TABLE — a trade, not harm.
- Death causes on the lost seeds are combat/monster-dominated on both
  sides (no starvation signal — the floor gate holds: starvation 8→10
  total, hungryDays 28→32). The lead road is uniformly ≤0 days
  (−10/−52/−1/−13/0/−56/−22/0); the belong road is mixed (−84 total
  with +87/+46 gains).
- The suspected channel: every feast draws a scavenger fight (the
  sense transcript shows it live — "The Heckler is circling the edge
  of the light... Face it while the feast is in you"). 94 feasts =
  94 extra night fights across 16 runs. The 4-day floor guards the
  PANTRY, not the FIGHT: on fragile trajectories the extra combat
  exposure kills villagers earlier, and dead villages don't reach
  national. The design at 16 seeds cannot separate this channel from
  trajectory perturbation (the identical-seed design is
  perturbation-dominated for RNG-consuming verbs), but the guardrail
  does not require a proven mechanism — it requires the number, and
  the number missed (6 < 9, and < 7 under a seed-scaled −4/16 bound).
- belongseek-s88 is the sharpest case: 4 gate holds (thin pantry —
  the village was already marginal), 1 feast fired, then 2 starvation
  deaths and collapse at d42 (control: 131d). The holds prove the
  gate saw the thin pantry; the collapse that followed is the
  marginal-village tail the floor cannot insure.

## The traced deed paths (causation, not correlation)

Every armed table seat, per-seed:

- **leadcourt-s44**: firstFeast d27 → surgeUsed d27 → seat lesser d73
  (6 feasts, all armed; village-lost d103 — the door opened first).
- **belongseek-s22**: firstFeast d21 → surgeUsed d29 → seat d43
  (16 feasts, 15 armed, 22 holds; survived 180d; wave 5; plenty 320).
- **belongseek-s33**: firstFeast d21 → surgeUsed d21 → seat d93
  (12 feasts; survived 180d; wave 5; NATIONAL kept — the table and
  national coexisted here).
- **belongseek-s55**: firstFeast d21 → surgeUsed d21 → seat d42
  (ONE feast, armed — a single feast opened the door; control twin
  died d134 with no seat).
- **belongseek-s66**: firstFeast d21 → surgeUsed d21 → seat d85
  (4 feasts, all armed, 20 holds; reached GLOBAL; Arc 4; died d94).

Control: 0 feasts, 0 food-deeds, 0/16 tables across all 16 seeds. The
food-deed rung (sentimentTaught && feastSurgeUsed) is unreachable
without feasts BY CONSTRUCTION on the courtship road, and reachable
with them — every seat ordered feast → rung → seat. The 3× replicated
correlation is now a traced causation (4th replication).

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control (16) | 11/16 | 0/16 | 0/16 | 4/16 | 0/16 | 129d | 180d |
| armed (16) | 6/16 | 5/16 | 0/16 | 11/16 | 6/16 | 94d | 180d |

Exiled: 2 both. The scale wall is not broken by this arm, but the
table path opened 5× with traced paths, wave-5 unlocked on 6/16 armed
runs vs 0/16 control, and Arc IV was reached (maxArc 4 vs 3) — the
feast moves the whole late-game road, at a national cost.

## Death-cause shares

Control (179 deaths): combat 91 (51%), monster 25 (14%), villager
combat 22 (12%), sickness 14 (8%), wound 11 (6%), starvation 8 (4%),
contest 2, expedition 2, dehydration 1, experiment 1, alien 1, the
expedition 1.
Armed (162): combat 87 (54%), monster 31 (19%), villager combat 8 (5%),
sickness 12 (7%), contest 4, wound 4, starvation 10 (6%), expedition 2,
thirst 2, alien 2. Same shape — villages die of violence, not hunger,
on both sides. The armed-only "thirst" (2, both on the collapsing
leadcourt-s66) is the engine-native villager water-death cause (game.js
registerDeath cause 'thirst'); the control shows the sibling
player-side label "dehydration" (1). Same family, engine-native, not a
new death mode — the layer adds no death verbs. No new death mode:
GUARDRAIL HOLDS.

## Village assessment (plain words)

Sixteen villages that learned to feast, and the feasts read like
feasts: Walt and Howard opening the pantry wide, Zuri and Caitriona
and Kai and Divya eating until the fire burns low, somebody laughing
so hard they cry, the honest kcal count in the beat. The villages
that feasted while the surge was armed drew the scavenger's circle —
the Heckler in the dark beyond the firelight — and faced it with the
feast in them; that fight is what marks the rung, and the rung is
what opens the door. Five villages reached the lesser seat of the
galactic table, every one of them through a feast they hosted: one
needed a single feast (s55, d21→d42), one needed sixteen. None of the
sixteen villages that never feasted got near the door — 0/16, the
rung unreachable by construction.

But the fire costs. Five villages that would have reached national
didn't — four of them died weeks earlier, mostly to the same
violence that kills every village, just sooner. The floor gate kept
the pantry honest (no starvation signal: 8→10 deaths, hungryDays
28→32, both inside their bounds), but nothing guards the fight the
feast invites. The lead road paid it uniformly; the belong road
gained a 180-day wave-5 survivor (s22) and lost an early collapse
(s88) in the same breath. The feast opens the table door — traced,
proven, no longer correlation — and it charges admission in blood
and days. That is the finding, both halves.

## Blanks filled / documented

- **MEASURED, KILLED AT CONFIRM**: the feast-as-table-door isolation —
  scripts/policies/feasttable.js (FEASTTABLE=1, default OFF; DELETED per
  kill protocol — the file is removed, not committed), proof
  scripts/test-feasttable-20261014.js (REAL RED→GREEN, independently
  re-run, kept as instrument), sweep
  scripts/measure-feasttable-20261014.js (kept, incl. the traced
  feast→rung→seat attribution + r17 tablerecon waveLedgerPoints
  sampling), det-gate scripts/det-gate-feasttable-20261014.js (16/16
  both sides, kept), sense scripts/sense-feasttable-20261014.js (kept).
  Per-seed JSONs under evidence/2026-10-14/perseed-ft-{control,armed,
  control16,armed16}/, ft-{control,armed,control16,armed16}.json/.log
  (kept). Zero src/js changes (policy-side only).
- **FILLED (instrument)**: the candidate+floor feast layer as a
  self-contained wrapper on the base policies (reuses AG2.feastCandidate
  + AG2.burnAt + FS.trackTribute — no duplication); the R2 isolation
  proof (control fires nothing on a candidate fixture); the G5
  no-tribute/aid-change proof (verbs never called, wraps restored).
- **DOCUMENTED** (sim-findings.md): FEAST-AS-TABLE-DOOR updated —
  causation established, lever killed, named next filed (FEAST
  FIGHT-EXPOSURE GATE: keep candidate-gated floor-honored feasts, add
  a fight-exposure gate).
- **[open] re-noted, not chased**: finding #64 (devotion channeling
  line verbatim daily) — fourth run in a row.

## Metric review (§14)

1. **The national guardrail missed (6/16 vs the ≥9/16 bound) — KILL
   stands, no re-scoring.** The primary passed decisively (5/16 vs
   0/16, +5/16 against a +4/16-scaled bar, all 5 seats traced), but
   §14 is explicit: a GO met with a guardrail breached is NO-GO. The
   breach is robust to the bound's scaling (misses even a seed-scaled
   −4/16 bound: 6 < 7) and carries a corroborating earlier-death
   signal (median 129→94d; 4/5 national-lost seeds died 22–89d
   earlier), so this is not a calibration artifact — the instrument
   distinguished correctly.
2. **The traced-path requirement worked as designed.** The task
   demanded: if the table moves without a traced deed path, say so.
   All 5 seats traced feast→rung→seat with day-ordering; the control
   had 0 feasts and 0 tables. The 3× replicated correlation is now a
   measured causation — the strongest form of this finding to date.
3. **The starvation guardrail sat exactly at its bound (10 ≤ 10).**
   The bound was well-calibrated: the floor gate holds the hunger
   line but with no headroom, and a genuine hunger harm would have
   blown past 10. The hungryDays ×1.335 ceiling (32 ≤ 37.4) agreed.
   Keep both bounds for future feast arms.
4. **The pilot→confirm staging worked.** The 8-seed pilot GOed
   (3/8, all guardrails green); the 16-seed confirm caught the
   national cost the pilot's bound (−2/8, passed at exactly 4/8)
   couldn't resolve. This is the pilot gate doing its job — cheap
   signal first, expensive resolution second.
5. **National as a guardrail for a table arm — metric review for the
   NEXT run, not this one.** The table is a different endgame path
   (plenty road) from national (scale milestone); a future arm could
   pre-register a composite (table OR national reach) rather than
   guarding national alone. That revision applies to the next run's
   header — this run is judged on its own header, where the breach
   is a breach.

## Convergence state

food-economy: **killed-at-confirm** (feasttable). The feast-as-table-door
is now CAUSATION, not correlation (4th replication, 5/5 traced
feast→rung→seat paths, 0/16 control tables). But the lever as built
costs national reach (11→6/16, guardrail miss) with an earlier-death
signal, plausibly via the feast's unfenced scavenger-draw combat
exposure — the 4-day floor guards the pantry, not the fight. The
proven parts (candidate-gated floor-honored feasts, tribute-as-
contribution, no aid/tribute changes) plus a fight-exposure gate are
the starting point for the next arm. The village-scale rot bind stands
on the landed prodthrottle; the table door stands open but expensive.
