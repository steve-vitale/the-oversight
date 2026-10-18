# sim-winloss-a — RUN-LOSS CENSUS on the recalibrated bar (2026-10-18)

Run: flesh-out loop arm sim-winloss-a, axis scale-onramp (the blocking axis),
run fleshout-20261018T1615Z, loop A. Canon: docs/CANON.md + docs/MONSTER-WAVES.md
(read first; the gate is design call #4 — four bars; on the recalibrated bar
(sim-readinessfix, 2026-10-18) wave-4 demands {armored 3 @ P>=10, armed 5,
tricks 3, veterans 1}, wave-5 {armored 4 @ P>=15, armed 6, tricks 3,
veterans 2}). ZERO src/js changes, ZERO scripts/policies changes —
instrument-only arm. Instruments + evidence only.

LINEAGE: evidence/2026-10-18/sim-vetwindow.md (landed 5d64f27fb, DIAG-GO)
attributed VETERAN deaths (8/8, all scholar deaths, channels raid/thirst/
expedition/wild) and reported winseat wall numbers (national 9/16, table 7/16,
wave-4 7/16, wave-5 0/16, WINS 9/16, median 90d win-truncated). What it did
NOT do: attribute RUN LOSSES — the 7/16 winseat runs that don't win. That is
THIS arm's question.

## Substrate (winseat — copied EXACTLY from evidence/2026-10-18/sim-vetwindow.md)

`withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))`
- VETREL=1 (companion veteran channel) + REPOSITION=1 (movement-kind
  execution) + NODEWITNESS=1 (witness observation channel, game-code flag in
  fieldFights.js) + SEATDRIVE=1 (seat driver, explicit composition)
- Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
  (+ WINPURSUIT=1 WINDEFER=1 set in-process; the windefer wrapper is
  composed, so the env is live — exactly the defercensus2b corpus)

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Seeds:** 8 fresh (59101–59108 — verified unused as sim seeds in evidence/;
all hits were pantry-kcal/telemetry-row false positives, same class as
vetwindow's), x {leadfeast, belongfeast} = 16 runs. **Horizon:** 180d
death-aware (dead villages stop simulating; the harness's runDays handles it).
**No control arm** — this is a census (like vetwindow).

**PRIMARY (diagnostic GO, binding):** 100% attribution of the NON-WINNING runs
— for every run that does not win, name what ended the run (terminal state +
the death cascade that actually killed the run's win prospects: roster
trajectory, final-window deaths, cause channels), 0 unattributed non-win runs,
0 instrument errors. A miss is NO-GO, never re-scored.

**Loss-channel taxonomy (binding):**
- `village-lost:*` — terminal death cascade. Sub-channels by the final
  30-day window: `starvation-cascade` (pantry ~0 at end + haven-logistics
  deaths dominant in the window), `combat-grind` (raid/combat/expedition/wild
  channels dominant), `disease`, `mixed` (no dominant channel).
- `stall-seat:<bar>` — survived 180d, tableSeat()='none': the largest-gap
  lesser-seat bar (w1-faced/w2-faced/w3-faced/contests/crises/scale/stage/
  food-thesis).
- `stall-invite` — seat earned (full/lesser) but tableWaiting never fired.
- `stall-table` — tableWaiting fired but the run never won (scene failed or
  was cleared).
- `nomad-wiped` — nomad road ending with endReason 'wiped'.

For each observed channel, the arm's real deliverable: a CONCRETE next lever
spec (file/mechanism/primary/bar).

**Fidelity (pre-registered):** DET-gate — instrument-on vs instrument-off
trajectories byte-identical (2 seeds x 60d), both-repeat stable;
FIDELITY — re-run 2 completed sweep seeds, byte-identical per-seed JSON
(including the run-loss classification). Proof:
scripts/test-winloss-a-20261018.js (classifier fixtures + SMOKE + DET +
FIDELITY, all GREEN before the sweep except FIDELITY which needs the sweep).

**Secondary (not binding):** reachability on the corpus (wave-4/5 reach, Arc
reach, national/table), wall numbers vs vetwindow's corpus, one sense-tested
loss-cascade transcript, villager-behavior sample.

## Results

**PRIMARY: DIAGNOSTIC GO — 5/5 non-winning runs fully attributed, 0 unattributed
non-win runs, 0 instrument errors.** 16/16 runs completed. Per-seed JSONs:
evidence/2026-10-18/perseed-winloss-a/ (16 files). Fidelity/det-gate: see
Metric review.

### Loss-channel table (the 5 non-wins; 11/16 won, all table-path, legend='table')

| channel | n | run | days | story |
|---|---|---|---|---|
| village-lost:starvation-cascade | 1 | belongfeast s59103 | 37 | Pantry 39140→0 by d34; 7 starvation + 1 wound + 1 sickness deaths d26–36; THE SCATTERING d37 (hungryDays=3, pop 2, scholar alive) |
| village-lost:combat-grind | 1 | belongfeast s59106 | 100 | 4 scholar deaths (d12 raid ×2, d48 lockjaw, d53 wild); pantry 42570→0; pop 12→7; THE SCATTERING d100 (hungryDays=3, pop 7, scholar alive) |
| village-lost:disease | 1 | leadfeast s59103 | 73 | 3 sickness deaths (d22/d44/d46) + expedition + wild + wound; pantry 39140→0; pop 12→8; THE SCATTERING d73 (hungryDays=3, pop 8, scholar alive) |
| stall-seat:w3-faced | 1 | belongfeast s59104 | 130 | Wave 4 unlocked, NATIONAL→GLOBAL rank, stage 3, 10 contests, 4 crises — but w3-faced=1/3 (19 w1, 11 w2 faced). Seat=none. Day froze at 130. |
| stall-table | 1 | leadfeast s59104 | 75 | Arc 4 + lesser seat d63; tableWaiting=true (unannounced, day<90 floor); scholar died d72 (raid), succession d73; day froze at 75 after sleep-wake. Village healthy (pop 8, pantry 42k). |

### THE SCATTERING is the terminal event (not the death-wipe)

All three village-lost runs ended via game.js:28643 — "Haven couldn't hold.
On the third hungry day, people started walking — in different directions.
The scattering, again." — NOT via the ledger.js scholar-death path. Verified
by blocking-state probes on the deterministic re-runs: scattered=true,
hungryDays=3, scholar alive, pop 2/7/8, no fight/contest/encounter. The death
cascades (starvation/combat/disease) are the EROSION; the scattering is the
TERMINAL event. The scholars did not die at the end — the villages walked away.

This reframes the loss: the binding constraint is the PANTRY hitting zero and
staying zero for 3 hungry days, not scholar mortality per se. (The vetwindow
finding "veteran deaths are scholar deaths" still holds for the veteran
channel, but the RUN losses on this substrate end in dispersal.)

### The w3-faced stall is a scale-vs-fight misalignment

belongfeast s59104 reached GLOBAL rank (top of the scale ladder), stage 3,
10 contests survived, 4 crises, wave 4 unlocked — and cannot sit at the table
because it faced only 1 distinct wave-3 type (needs 3). w1=19, w2=11 distinct
faced. The village scaled via the standing ladder (blood/bonds/bread) but the
SEAT demands fight diversity. A village can out-scale its fight record. This
is a design tension (steve-call territory): the standing gate is flexible
(blood OR bonds OR bread), the seat gate is not (must fight).

### The stall-table day-freeze

leadfeast s59104: the invitation (tableWaiting=true) was pending but
unannounced (win-day floor: day 75 < 90). The scholar died in a raid d72,
succession d73, and the game day stopped advancing at 75 after a sleep-wake
("You wake with a start — something is wrong") with NO persistent wake
condition (wake probe: 2/3 stuck sleeps had none of tbfight/pendingEncounter/
over/activeContest/tent-destroyed true). The village was healthy. The day
simply stopped advancing. Same freeze signature at d130 in the w3-faced stall
(normal dawn, then nothing). The mechanism is in the sleep/day-rollover area
(game.js sleep()/tickAction) and needs a dedicated engine-debug arm. It is NOT
a policy artifact (the policy drove 74/129 days fine; the won runs completed).

### Wall numbers (winseat, fresh seeds 59101–59108)

| national | table | wave-4 | wave-5 | wins | arc4 | median survival |
|---|---|---|---|---|---|---|
| 10/16 | 9/16 | 9/16 | 0/16 | 11/16 | 12/16 | 90d |

vs vetwindow corpus (53101–53108): national 9/16, table 7/16, wave-4 7/16,
wave-5 0/16, wins 9/16, median 90d. Consistent (fresh seeds, same substrate).
All 11 wins are table-path (legend='table'), NOT nomad — the winseat substrate
wins through the table.

### Reachability on this corpus

- Wave 4: 9/16 (all via the recalibrated readiness bar). Wave 5: 0/16.
- Arc IV: 12/16. National: 10/16 (one reached global). Table invite: 9/16.
- The full seat (deedGateReady): 0/16 (wave-5 never unlocks, so the 5/5/4/3/2
  gate can't complete). Lesser seat: reached in the won runs.
- The scale wall stands: wave-5 0/16, and the w3-faced stall shows a village
  can reach global without being able to sit.

### Named lever specs (the arm's real deliverable — file/mechanism/primary/bar)

1. **starvation-cascade → food-economy arm (lever 0).** File: src/js/game.js
   famine/scattering (hungryDays, famineLimit=3, famineGraceDays/granary=5).
   Mechanism: pantry 0 for 3 hungry days → scattering, regardless of roster
   health. Primary: village-lost:starvation-cascade rate on winseat. Bar: TBD
   by the arm (diagnostic named the mechanism; the arm sets the GO).
2. **combat-grind → combat arm (lever 1).** File: raid defense mechanics
   (scholar raid mortality: 2/4 scholar deaths were raid combat at haven).
   Mechanism: scholars die defending raids, eroding leadership + pantry.
   Primary: scholar raid-death rate. Bar: TBD.
3. **disease → disease arm (lever 7).** File: disease vectors/cures
   (sickness killed 3 villagers across d22–d46). Mechanism: mundane disease
   pressure. Primary: disease-channel death share. Bar: TBD.
4. **stall-seat:w3-faced → design review (steve-call) OR wave-3 diversity arm.**
   File: src/js/table.js tableSeat() (w3>=3 bar) vs src/js/standing.js
   (flexible blood/bonds/bread). Mechanism: scale ladder and seat gate
   misaligned — global rank without fight diversity. Primary: w3-faced
   distribution on winseat. Bar: TBD. **This one needs Steve's call** on
   whether the seat should require fight diversity when standing doesn't.
5. **stall-table → engine-robustness arm.** File: src/js/game.js sleep() /
   tickAction() day-rollover. Mechanism: day stops advancing with no blocking
   state (the "(none-true)" stuck sleeps). Primary: day-freeze incidence.
   Bar: 0 freezes. **This is a bug hunt, not a balance lever.**

## Metric review (§14 — binding, never re-scored)

1. **100% attribution:** 5/5 non-winning runs attributed (3 village-lost with
   terminal-event verification, 2 survived with stall diagnosis), 0
   unattributed, 0 instrument errors. GO.
2. **Det-gate:** 2/2 byte-identical trajectories (instrument-on vs
   instrument-off, 2 seeds × 60d), both-repeat stable. GO.
3. **Fidelity:** 2/2 sweep seeds re-run byte-identical (full per-seed JSON
   including run-loss classification). GO.
4. **Seeds:** 8 fresh (59101–59108), verified unused as sim seeds in
   evidence/ (all hits were pantry-kcal/telemetry-row false positives).
5. **'dehydration' → 'haven':** the sim-vetwindow correction is implemented
   in this instrument (normalizeCause) and proven by fixtures (synthetic +
   real vetwindow rows). The vetwindow [open] finding can note this revision.
6. **Day-freeze stalls:** 2/16 runs (stall-table, stall-seat:w3-faced) ended
   with the game day frozen, not the village dead. Classified honestly as
   'survived' with the stall channel; the freeze mechanism is documented
   above and named as an engine-robustness lever. Not re-scored.
7. **Phantom person-death teles (4):** same class as vetwindow's finding
   (non-roster combatants in TB fights); excluded via diedForReal, counted.

## Convergence

**converging.** The diagnostic GO is met: 100% run-loss attribution on fresh
seeds with a clean instrument (DET + fidelity green). The headline
refinement: winseat run losses do NOT end in death-wipes — they end in THE
SCATTERING (3/3 village-losts, verified). The scale wall now has two new
faces: (a) the pantry-zero → scattering pipeline (the famine clock, not
combat, is the terminal mechanism), and (b) the w3-faced seat bar blocking a
global-rank village (scale/fight misalignment). Plus an engine-robustness
item: the day-advance stall (2/16). The axis stays scale-onramp. No game
change: zero src/js changes, zero scripts/policies changes — instruments +
evidence only.

## Sense-testing (SENSE-TESTING LAW)

Read the full d22–d37 cascade of the STARV run
(evidence/2026-10-18/winloss-transcripts/belongfeast-s59103.txt, 1423 lines).
It is meaningful, desperate, coherent — the village's story as it loses.

d26: Sigrun starves. "Nobody's talking much. The fire feels smaller tonight."
"◈ CRISIS — THE FIRST GRAVE. Sigrun is dead. The village digs its first
grave, and everyone understands at once: this place can kill you. It just
did." The System: "Oh. Oh no. Was that supposed to happen? The audience is
crying. I did not know they could do that." Then "💀 Sigrun starved. Slowly.
The village is 10 now." "⚠ Haven's pantry is empty. Day 1 of hunger." The
same day, Leo discovers Apex Sense by the fire — life and death in the same
breath. Coherent.

d37: the scholar strips the dead — Austin, Deirdre, Nikolai, Yuki — "Your
hands know what they did." "You will dream about this. You already know."
"Handling the bloating remains was a mistake. Fever by nightfall." Then "⚠
Haven's pantry is empty. Day 3 of hunger." "Haven couldn't hold. On the third
hungry day, people started walking — in different directions. The scattering,
again." The end is not a wipe — it's a dispersal. The food thesis made
manifest: survival logistics never stop, and when they fail, the village
doesn't die fighting — it walks away.

No robotic lines in the cascade. (Minor: Sigrun gets two death beats —
"starved" and "succumbed to the fever" — a duplicate-beat bug, noted in
findings. And Nikolai's companion bark "Smell that? Something's different
here." repeats 6× in 5 days — noted.)

## Out-of-arm findings (appended, NOT chased — per arm discipline)

- [open] 2026-10-18 — engine/robustness — DAY-ADVANCE STALL (sim-winloss-a):
  2/16 winseat runs (leadfeast s59104 d75, belongfeast s59104 d130) ended with
  the game day frozen — healthy villages, no fight/contest/encounter/modal,
  the policy loop spinning 180 iterations. Wake probe (scripts/winloss-
  wakeprobe-20261018.js): 2/3 stuck sleeps had NO wake condition true
  (tbfight/pendingEncounter/over/activeContest/tent all false) — sleep()
  returned without advancing and without a "woke" trigger. Mechanism in
  game.js sleep()/tickAction day-rollover; needs a dedicated engine-debug
  arm. Named lever spec #5 above.
- [open] 2026-10-18 — text — DUPLICATE DEATH BEAT (sim-winloss-a):
  belongfeast-s59103 d26: Sigrun gets two death announcements — "💀 Sigrun
  starved. Slowly." and "💀 Sigrun succumbed to the fever." Same death, two
  beats. Minor text bug.
- [open] 2026-10-18 — conversation/content — COMPANION BARK REPETITION
  (sim-winloss-a): belongfeast-s59103: Nikolai's "Smell that? Something's
  different here." 6× across d31–d35, "Stay close, yeah?" 4× across d31–d35.
  Companion barks need a cooldown or variety pool.
- [open] 2026-10-18 — telemetry — 'dehydration' CAUSE NOW MAPPED (sim-winloss-a):
  this arm's instrument (scripts/winloss-sweep-20261018.js normalizeCause)
  implements the sim-vetwindow metric-review #6 correction ('dehydration' →
  haven, proven by fixtures). The [open] vetwindow finding stands for the
  vetwindow instrument; future instruments should use the normalized mapping.

## Village assessment (plain words)

The winseat village on fresh seeds: 11/16 win through the table (all
table-path, none nomad), 3/16 scatter, 2/16 stall. The modal winner reaches
arc 4 around day 63–90, takes the lesser seat, and wins around day 90. The
modal loser doesn't die — it disperses: the pantry hits zero, the hungry
days tick (1… 2… 3), and people walk in different directions. The scholars
who die, die in raids (defending haven), of thirst while foraging, or of
sickness — never in wave-4+ combat. The villagers act like people: they
gossip by the fire (and the retelling gets better than the event), debate
new members ("More mouths, same fire."), teach each other (Loquat by the
fire, "The Codex grows — the human way."), trade, mentor, and grieve. The
death pipeline (tele → succession → burial → the fire speaks) is human.

Who thrived: the 11 table-winners; the scholars who lived to day 90. Who died
and why: Chloe (raid, d20), Sigrun (starvation, d26), the d35 starvation
cluster (Austin, Deirdre, Nikolai, Yuki), the raid/wild scholar deaths. What
was missing: (a) a pantry that can survive 3 hungry days — the famine clock
is the terminal mechanism; (b) wave-3 fight diversity for the seat; (c) a
day-advancement guarantee. The blank this diagnostic fills: the run-loss
channel map — and the correction that losses end in scattering, not wipes.

## Files

- scripts/winloss-sweep-20261018.js — sweep + SMOKE/DET/FIDELITY modes (this run)
- scripts/winloss-analyze-20261018.js — aggregator (this run)
- scripts/test-winloss-a-20261018.js — proof: classifier fixtures + SMOKE + DET + FIDELITY (this run)
- scripts/winloss-transcripts-20261018.js — SAY-line probe + blocking-state dump (this run)
- scripts/winloss-wakeprobe-20261018.js — focused day-freeze diagnostic (this run)
- evidence/2026-10-18/perseed-winloss-a/ — 16 per-seed JSONs
- evidence/2026-10-18/winloss-transcripts/ — 5 loss transcripts + blocking states
- evidence/2026-10-18/sim-winloss-a.md — this file
- ZERO src/js changes, ZERO scripts/policies changes (instrument-only arm)
