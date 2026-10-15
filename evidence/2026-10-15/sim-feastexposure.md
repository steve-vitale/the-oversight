# SIM-FEASTEXPOSURE — the feast fight-exposure gate (flesh-out loop A, 2026-10-15)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop (A) · Worker tree: sim-feastexposure
Axis: scale-onramp (the blocking axis) — sim-findings FEAST FIGHT-EXPOSURE GATE claimed (the named-next from loop B's killed sim-feasttable-b).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: loop B's sim-feasttable-b proved feasts open the table door
  with traced causation (table 0/16 -> 5/16, food-deeds 0/16 -> 13/16,
  wave-5 0/16 -> 6/16, Arc IV reached) but the lever was KILLED per §14:
  the national guardrail breached (6/16 vs >= 9/16), 4/5 national-lost
  seeds died 22-89d earlier, combat-dominated. Suspected harm channel:
  the feast's scavenger-draw adds real combat exposure — every armed
  feast draws a scavenger (drawFeastScavenger, chance 1.0) and the road
  faced it unconditionally (94 feasts = 94 guaranteed scholar fights);
  the 4-day floor guards the pantry, not the fight. This arm keeps the
  candidate-gated floor-honored feasts and adds a FIGHT-EXPOSURE gate:
  face the draw only when the odds are favorable, else the watch drives
  it off (the engine's honest decline — devotion stays armed, the door
  is deferred not closed), plus a per-window cap (lingerers driven off
  once the deed marks).
- **Lever**: scripts/policies/feastexposure.js (FEASTEXPOSURE=1, default
  OFF; gate-off = pure delegation, RED-pinned byte-identical). Wraps the
  FEASTSCALE_R13 substrate — belongfeast/leadfeast -> belongexposure/
  leadexposure. Zero src/js changes (policy-side only).
- **Substrate (BOTH sides)**: FEASTSCALE_R13=1 — candidate-gated
  (contribution >= 1500 incl. tribute/tend), floor-honored (1.5x buffer),
  cadence-gated feasts on the courtship road. Control = substrate
  ungated (FEASTEXPOSURE unset): draws faced unconditionally, the
  feasttable-b behavior. Armed = substrate + the gate.
- **The gate** (assessDraw): the policy's own fightAssessDPR knowledge
  model (codex / fight-lore / pessimistic prior) for monster damage; the
  engine's veteran stat line (+50% HP, +3 damage — game.js) from the
  draw's veteran flag; the scholar's REAL feasted damage uplift
  (Game.feastedMult() — the fight happens while feasted); the policy's
  own 1.3 race margin; plus one prudence addition (design call, Steve
  can overrule): a wounded scholar (hp < 50% max) never takes a draw
  fight. Runs twice per upkeep tick: BEFORE the road's upkeep
  (pre-empting feastFightRoad's unconditional face of a night-surviving
  draw) and AFTER it (the fresh draw this tick's feast just created —
  the night's sleep wakes on a pending encounter and fights it that
  night, so the dusk tick-end is the last policy chance to decline).
  Patrol sweeps deliberately UNGATED in v1 (the deed's fallback; not
  the named 94-fight channel — documented next suspect if the
  guardrail still breaches).
- **PRIMARY (confirm, 16 seeds)**: armed table >= 3/16 (feasttable-b hit
  5/16 ungated; the gate must keep the door open). Table seats counted
  carry the traced feast->rung->seat path requirement (as feasttable-b).
- **GUARDRAILS (confirm)**: national >= control-2/16 (the killed harm,
  must not recur); median >= control-10d; starvation/hungryDays within
  noise; no new death mode (n>=3).
- **PILOT bars (8 seeds/side, pre-registered)**: primary signal armed
  table >= 2/8 (feasttable-b pilot hit 3/8 — the door demonstrably
  open); guardrails national >= control-1/8, median >= control-15d, no
  new death mode, starvation <= control+1. Pilot GO -> confirm 12-16;
  pilot miss/kill-fast -> KILL per §14 (layer deleted, evidence + proof
  + sweep + sense + det-gate kept).
- **SECONDARY**: food-deed rung rate, deed attribution (traced paths),
  fsFeasts/fsArmedFeasts, exposure counters
  (assessed/left/driven/drivenUsed), wave-4/5 unlocks, Arc reach, wins,
  exiled, death-cause shares, Standing per avenue.
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop.
- **Seeds**: pilot 11/22/33/44 x leadcourt/belongseek = 8 runs/side (the
  feasttable seed set, for comparability), IDENTICAL seeds control vs
  armed. Confirm 11/22/33/44/55/66/77/88 = 16/side only on pilot GO.
- **Det-gate**: 16/16 bit-identical reruns both sides first (r27 rule);
  SMOKE=1 honesty gate (unwrap + live drive + gate-contrast fixture:
  control never gates on an unfavorable draw; armed drives it off).
- **Decision rule**: GO -> land as its own commit; primary miss or any
  guardrail breach -> KILL per §14 (layer deleted, evidence + proof +
  sweep + sense + det-gate kept).
- **Instruments**: tableSeat()/deedGateReady() best-ever rows +
  waveLedgerPoints sampling (the r17 tablerecon convention);
  per-seed deed attribution (firstFeastDay, surgeUsedDay, sentimentDay,
  seatDay, seat); the gate's own counters.

## Proof results (REAL RED -> GREEN, run BEFORE any sims, 2026-10-15)

scripts/test-feastexposure-20261015.js. Independently re-run.

RED (FEASTEXPOSURE unset, substrate FEASTSCALE_R13=1): R1 gate-off
byte-identical — belongexposure/leadexposure == belongfeast/leadfeast
per-day hashes, 40d x2 seeds, IDENTICAL. R2: gate-off, the gate never
acts — on a live-draw fixture the gate's telemetry stays absent and the
gate never drove the draw off (the road faces it ungated, exactly the
feasttable-b behavior).

GREEN (FEASTSCALE_R13=1 FEASTEXPOSURE=1): G1 favorable draw (known
hummice, healthy scholar) -> LEFT for the road (draw still pending,
exposureLeft=1, driveOff NOT called; detail: playerDPR 19.5 =
(13+0)x1.5 feasted, monsterDPR 6, roundsToKill 0.7 vs roundsToDie
16.7). G2 unfavorable draw (unknown heckler -> pessimistic prior 20
DPR) -> DRIVEN OFF (driveOffFeastDraw called exactly once, draw
cleared, exposureDriven=1, first-decline detail recorded, the prior
identified as the decider). G3 deed already marked (buff used) +
lingering draw -> driven off, exposureDrivenUsed=1, no race assessment
wasted (the per-window cap). G4 no draw -> no-op. G5 veteran draw ->
the veteran stat line applied (mhp 150 = 100x1.5, monsterDPR 21.5 =
18.5+3, game.js numbers). G6 wounded scholar (hpFrac 0.4, winnable
race: lostRace=false deadInTwo=false) -> DRIVEN OFF with hpFloorMiss
in the detail (the prudence floor is the decider). G7 determinism
(identical fixture twice -> identical verdict). G8 40d armed live run:
substrate fired 3 feasts AND the gate assessed 3 live draws (left 2,
driven 1) — the gate is live on real draws.
RESULT: all checks passed (RED and GREEN).

Design correction made during proof (documented): the first G8 failed
(exposureAssessed=0 on 3 armed feasts) — instrumentation showed the
draw is created at the dusk tick-end and FOUGHT during the night's
sleep (sleep wakes on a pending encounter; the wake-fight marks the
deed — feastSurgeUsed=true with faceFeastDraw never called). The gate
therefore runs twice per upkeep tick: before the road's upkeep
(pre-empting feastFightRoad) and after it (catching the fresh draw
before the night). Re-ran GREEN: all pass.

Det-gate: 16/16 bit-identical BOTH sides
(scripts/det-gate-feastexposure-20261015.js; logs
evidence/2026-10-15/detgate-fx-{control,armed}.log); SMOKE=1 honesty
gate green both sides (incl. the gate-contrast fixture: control never
gates on the unfavorable draw; armed drives it off, exposureDriven=1).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense runs (FEASTSCALE_R13=1 FEASTEXPOSURE=1;
scripts/sense-feastexposure-20261015.js).

**belongseek seed 22 (120d, village-lost d116):** 12 feasts (5 armed);
the gate assessed 11 draws: 7 LEFT, 4 DRIVEN. The d29 armed feast drew
the Heckler — "🌙 The cookfire's smell carried further than the laughter
did — smoke and grease on the night wind. The Heckler is circling the
edge of the light. It followed the feast here. (A scavenger, drawn by
the feast. Face it while the feast is in you — or let the watch drive it
off.)" The gate judged it favorable (Hardlight knife, feasted x2.03)
and left it; that night: "⚔ THE HECKLER! You're on your own." → "You
STRIKE the heckler for 120 (Hardlight knife)." → "The Heckler falls."
A real event with a real choice and a real consequence — the deed's
rung, earned.

The 4 declines read as prudence, not skipping: "🔥 A person, maybe 20s
takes up a brand and A person, maybe 30s follows — they meet it at the
edge of the light with noise and fire. [It] was never brave. It melts
back into the dark. (The watch drove off the feast's scavenger. The
devotion stays armed; the feast's fire still burns in you.)" The
declined draws were genuine suicide fights — terms_of_service (420 HP,
31 DPR, roundsToDie 3.2 vs roundsToKill 12.8) and congregation (1100
HP). Nobody pretends the beast wasn't there; the village just refuses
the fight it can't win, and the fire stays lit for the next feast.

**PASS** — with the standing [open] re-note: the devotion channeling
line ("💛 You hold Coat button... The feast was the weapon.") fires
VERBATIM every day (finding #64 repetition class, fifth run in a row).
Filed, not chased.

## Pilot results

8 runs/side, identical seeds (11/22/33/44 x leadcourt/belongseek), 180d
death-aware. Det-gate 16/16 both sides; SMOKE green both sides.

| metric | control (substrate ungated) | armed (gate) | pre-reg pilot bar | verdict |
|---|---|---|---|---|
| table (**PRIMARY signal**) | 3/8 | **2/8** | >= 2/8 | **GO** |
| traced seats | 3/3 | 2/2 | — | — |
| food-deeds | 6/8 | 6/8 | — | — |
| national (**GUARDRAIL**) | 3/8 | **5/8** | >= 2/8 | **GO** |
| median survival (**GUARDRAIL**) | 145d | **111d** | >= 130d | **MISS** |
| starvation (**GUARDRAIL**) | 3 | 3 | <= 4 | GO |
| hungryDays | 9 | 15 | (noise) | note |
| no new death mode (**GUARDRAIL**) | — | same modes | — | GO |
| wave-4 / wave-5 | 7/8 / 5/8 | 7/8 / 6/8 | — | — |
| max Arc | 4 | 4 | — | — |
| wins / exiled | 0/8 / 0 | 0/8 / 0 | — | — |
| feasts (fsFeasts / armed) | 77 / 64 | 62 / 49 | mechanism | — |
| exposure (assessed/left/driven) | 0 | 49 / 29 / 20 | gate live | — |

Seats (all traced feast->rung->seat): control leadcourt-s44 lesser,
belongseek-s22 lesser, belongseek-s44 FULL; armed leadcourt-s22 lesser,
belongseek-s22 lesser.

Paired per-seed (control -> armed):
- leadcourt-s11: 145d -> 145d, nat kept 1->1 (gate inert, 0 draws)
- leadcourt-s22: 86d -> 180d, nat 0->1, table 0->1 (14 assessed, 8 driven)
- leadcourt-s33: 111d -> 111d, nat kept 1->1 (2 assessed, 0 driven)
- leadcourt-s44: 180d -> 109d, nat kept 1->1, table 1->0 (8 assessed, 4 driven)
- belongseek-s11: 26d -> 26d, early collapse both (gate inert)
- belongseek-s22: 180d -> 116d, table kept 1->1 traced (11 assessed, 4 driven)
- belongseek-s33: 66d -> 66d, unchanged (5 assessed, 0 driven)
- belongseek-s44: 180d -> 102d, nat 0->1, table 1->0 (9 assessed, 4 driven)

National: GAINED on 2 seeds (lead-s22, belong-s44), LOST on none (3->5/8).
The feasttable-b harm did not recur — it reversed.

**Verdict: KILLED AT PILOT per §14.** The primary signal passed (2/8,
both traced) and the national guardrail passed decisively (5/8 vs the
2/8 bound — the killed harm reversed), but the median guardrail
breached: 111d vs the pre-registered >= 130d (control 145d - 15d). A GO
met with a guardrail breached is NO-GO — never re-scored. No confirm
spend.

## Why the guardrail missed (autopsy, not theory)

The three shortened seeds (lead-s44 180->109d, belong-s22 180->116d,
belong-s44 180->102d) all died of the usual village killers
(combat/monster — no gate-specific mode; death-cause shares below show
the same modes both sides). The obvious mechanism candidate was
patrol-extension: driven draws leave the deed unmarked, the buff live,
so feastFightRoad's patrol (3 sweeps/day seeking fights) should run
longer and add the very exposure the gate cuts. TESTED AND DEAD: the
deed-unmarked windows (firstFeastDay -> surgeUsedDay) are IDENTICAL
control vs armed on all four gate-active seeds (lead-s44 d27->27,
belong-s22 d21->29, belong-s44 d21->21, lead-s22 d27->34). The gate did
not extend the patrol window — the left draws and the patrol marked the
deed on the same schedule as the control's unconditional faces. With no
mechanism and identical deed windows, the median shift reads as
perturbation at n=8 (the feasttable-b evidence warned the identical-seed
design is perturbation-dominated for RNG-consuming verbs: a driven
draw vs a fought draw consumes wildly different RNG, and everything
downstream diverges). The miss is honored anyway — §14 does not permit
re-scoring on a mechanism argument. Noted for the metric review.

## Confirm results

Not run — killed at pilot per §14. No confirm spend.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control (8) | 3/8 | 3/8 | 0/8 | 7/8 | 5/8 | 145d | 180d |
| armed (8) | 5/8 | 2/8 | 0/8 | 7/8 | 6/8 | 111d | 180d |

Exiled: 0 both. The scale wall is not broken by this arm, but the feast
road (substrate) opens the table door on its own (3/8 control, one FULL
seat), the gate keeps it open (2/8, all traced), and national IMPROVED
under the gate (3->5/8, none lost). The median cost has no mechanism
(deed windows identical) — see autopsy.

## Death-cause shares

Control (66 deaths): combat 50 (76%), sickness 7 (11%), villager combat
4 (6%), monster 4 (6%), starvation 3 (5%), wound 2, contest 2,
expedition 1.
Armed (81 deaths): combat 53 (65%), monster 12 (15%), sickness 5 (6%),
contest 4, starvation 3 (4%), villager combat 2, expedition 1, wound 1.
Same modes — no new death mode: GUARDRAIL HOLDS. (Monster 4->12 is the
three shortened seeds' ambient violence, an existing mode, not a new
one.)

## Village assessment (plain words)

Eight villages on the feast road learned to judge the fire. The gate
assessed 49 scavenger-draws and declined 20 — and the declines were
never silent: the watch took up brands, the beast melted back into the
dark, and the devotion stayed armed for the next feast. Two villages
reached the lesser seat of the galactic table through feasts they
hosted, every seat carrying the traced feast->rung->seat path; the
road without the gate reached three (one of them a FULL seat).

The surprise of the run is the national column: five of eight gated
villages reached national, against three ungated — and no village lost
a national it would have had. leadcourt-s22 is the sharpest case: the
control twin died at d86 with nothing; the gated twin drove off 8
draws, lived the full 180 days, and took both national and the lesser
seat. The gate did the thing it was built for — the feasttable-b harm
did not recur.

But three villages that lived 180 days ungated died around day 100
gated — of the same combat and monsters that kill every village, just
sooner, with no mechanism the instruments can find. The deed marked on
the same day in both arms; the patrol ran the same window; the draws
were the only behavioral difference, and the gate's whole job was to
make those fights safer. The numbers say the villages died earlier;
the mechanism says nothing changed except which fights happened. That
is the finding, both halves, and the guardrail is honored over the
story.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the feast fight-exposure gate —
  scripts/policies/feastexposure.js (FEASTEXPOSURE=1, default OFF;
  DELETED per kill protocol — the file is removed, not committed),
  proof scripts/test-feastexposure-20261015.js (REAL RED->GREEN,
  independently re-run, kept as instrument), sweep
  scripts/measure-feastexposure-20261015.js (kept, incl. the traced
  feast->rung->seat attribution + the gate's exposure counters),
  det-gate scripts/det-gate-feastexposure-20261015.js (16/16 both
  sides, kept; logs evidence/2026-10-15/detgate-fx-{control,armed}.log),
  sense scripts/sense-feastexposure-20261015.js (kept). Per-seed JSONs
  under evidence/2026-10-15/perseed-fx-{control,armed}-pilot/,
  fx-{control,armed}-pilot.json/.log (kept). Zero src/js changes
  (policy-side only).
- **FILLED (mechanism)**: the feast-draw lifecycle — the draw is created
  at the dusk tick-end and FOUGHT during the night's sleep (sleep wakes
  on a pending encounter; the wake-fight marks the deed with
  faceFeastDraw never called). Future feast arms must gate at the dusk
  tick-end, not just pre-upkeep: this layer runs the gate twice per
  tick (before the road's upkeep to pre-empt feastFightRoad, after it
  to catch the fresh draw before the night). The first proof G8 caught
  this (exposureAssessed=0 on 3 armed feasts) — the RED would have
  passed on a dead gate without the live-run assertion.
- **FILLED (instrument)**: assessDraw — the race model (policy's own
  fightAssessDPR knowledge model + the engine's veteran stat line +
  the real feasted damage uplift + the 1.3 margin + the 50%-HP prudence
  floor), with per-decision detail records (exposureFirstDecline /
  exposureLastDetail) for autopsy.
- **DOCUMENTED (hypothesis tested, dead)**: patrol-extension — driven
  draws do NOT extend the deed-unmarked window (identical d->d windows
  on all gate-active seeds); the patrol is exonerated as the median
  mechanism.
- **[open] re-noted, not chased**: finding #64 (devotion channeling line
  verbatim daily) — sixth run in a row.

## Metric review (§14)

1. **The median guardrail missed (111d vs the >= 130d bound) — KILL
   stands, no re-scoring.** The primary signal passed (2/8, both
   traced) and the national guardrail passed decisively (5/8 vs >= 2/8
   — the feasttable-b harm reversed, none lost), but §14 is explicit:
   a GO met with a guardrail breached is NO-GO. The breach carries no
   mechanism (deed-unmarked windows identical control vs armed; deaths
   are the usual combat/monster), which reads as perturbation at n=8 —
   but the bar was pre-registered and the miss is a miss. The pilot
   gate did its job: cheap signal, no confirm spend.
2. **The national reversal is the arm's real result.** The guardrail
   the arm was built to fix (feasttable-b's 11->6/16 national cost)
   went 3->5/8 with zero national lost on any paired seed. The gate's
   mechanism (declining suicide draws — terms_of_service at 420 HP/31
   DPR, congregation at 1100 HP) is the plausible channel, and
   leadcourt-s22 (86d -> 180d + national + table) is the existence
   proof. This is worth a next run at confirm scale, not a quiet
   burial.
3. **Median on n=8 with death-aware horizons is perturbation-dominated
   — metric review for the NEXT run, not this one.** The identical-seed
   design cannot separate trajectory perturbation from mechanism at
   this n (feasttable-b said the same). A next run should pre-register
   the median at confirm scale only (n=16, control-10d), or pair the
   median with a mechanism check (deed-window identity, as done here).
   That revision applies to the next run's header — this run is judged
   on its own header, where the breach is a breach.
4. **The twice-per-tick gate pattern worked.** The proof's G8 caught a
   dead gate (the sleep-wake lifecycle) before any sims were spent —
   the live-run assertion in the proof earned its keep. Keep the G8
   pattern (substrate fires + gate assesses on a live run) for future
   gate arms.
5. **hungryDays 9->15 is noted, not judged.** The pilot bar covered
   starvation (3<=4, held); hungryDays had no pilot bar. It sits inside
   the feasttable confirm's x1.335 noise model only barely (12.0) —
   worth a bar on the next run, not a verdict on this one.

## Convergence state

scale-onramp: **killed-at-pilot** (feastexposure). The feast road opens
the table door with or without the gate (control 3/8 incl. one FULL
seat, all traced; armed 2/8, all traced). The gate reversed the
feasttable-b national harm (3->5/8, none lost) but breached the median
guardrail (111d vs >= 130d) with no mechanism found — perturbation at
n=8 is the honest read, the kill stands per §14. Candidate for a next
run at confirm scale with the median bar set at confirm level; the
instruments (proof/sweep/sense/det-gate) are kept and degrade cleanly
(INFO-SKIP) with the layer deleted.
