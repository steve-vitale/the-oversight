# sim-presence2 — presence re-run with the §14-revised primary (2026-10-19)

Run: flesh-out loop arm sim-presence2 (loop oversight-flesh-out-loop), axis scale-onramp (the blocking axis).
Worktree: ~/workspace/worktrees/sim-presence2.
Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, villager XP law, combat-readiness bar, design call #4).

LINEAGE (read before designing): evidence/2026-10-19/sim-presence.md (the lever
spec — scripts/policies/presence.js documented in full in "The lever"; the layer
was DELETED per kill protocol, REBUILT byte-faithfully for this run — sha256
fd1a437ef4e41638bf622039e37654415f814273aa9aad6afe004b5fe821df53, verified
identical to the 7de3bbede original; zero src/js, policy-side only),
evidence/2026-10-19/sim-presence-confirm.md (the confirm NO-GO'd on a conflated
metric: 3 vs 4 ALL-veterans, but 4 vs 0 living VILLAGER veterans — the
metric-review §2 PROPOSES the revised primary for the next run, which is this
run). The confirm's instruments/scripts are on master: scripts/test-presence.js
(layer proof), scripts/test-presence-confirm.js (T1/T2 pin the veteran metric
definition; T3 live on the rebuilt layer — no INFO-SKIP).

THE LEVER (scripts/policies/presence.js, PRESENCE=1, policy-side only, zero
src/js): the "stand with the village" beat — scholar self-movement only. When a
wave-3+ threat is at the Haven node (a wave-3+ world monster on the haven node,
or an aid crisis active) AND the scholar is at Haven but OUTSIDE (and not in
combat), the scholar goes INSIDE (Game.enterBuilding — NOT Game.goInside, which
does not exist; the original proof caught this) and takes one micro-step
(triggers ensureVillagerPositions so inside villagers get grid positions the
join rule can see). NEVER calls Game.assignTask, Game.takeWeapon, or any verb
that moves/assigns/risks a villager. The scholar moves; the village doesn't.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

- SUBSTRATE: tribfloor leadfeast/belongfeast, env FEASTSCALE_R13=1 TRIBFLOOR=1
  SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
  KILLDISC=1 (the presence-confirm substrate).
- PILOT (mechanism check on the rebuilt layer): seeds 64201–64204 (verified
  filename-unused — the two 64207 hits in perseed-spikechar-b are kcal values,
  not seeds) x {leadfeast,belongfeast} = 8 runs per arm, paired. PRIMARY: JOIN
  RATE (fights with any companion damage / wave-3+ killing fights) ≥ 1.5x
  control → GO to confirm (pilot 7.05x, confirm 29.4x — the mechanism is
  proven, this gates the rebuild).
- CONFIRM: seeds 64201–64208 x {leadfeast,belongfeast} = 16 runs per arm, 180d
  death-aware, paired on identical seeds, through the balanced panel (§15).
  PRIMARY (outcome, the §14-revised metric): living VILLAGER veterans at end
  of run = Game.waveCombatReadiness(4).veterans EXCLUDING the scholar vid
  → presence ≥ control + 2 (the +4 bar scaled from 32 to 16 runs) → GO.
  Miss → NO-GO (kill protocol: layer deleted zero-trace, instruments +
  evidence land). Never re-scored mid-run.
- GUARDRAILS (all must hold): median survival ≥ control−5d; no new death
  modes (esp. ZERO fighter-movement deaths — proof pins that the mechanism
  never assigns/moves/risks villagers); national/table reach not degraded
  (±2 band); starvation watch-item (confirm showed 16 vs 11 — report, not
  judged, unless it breaches control+4).
- Per-seed JSONs carry TOP-LEVEL `won` (boolean), `national` (boolean),
  `table` (boolean) keys.

## Proof

- RED phase (real): layer absent + PRESENCE_KILLED unset → exit 1, "RED:
  scripts/policies/presence.js missing and PRESENCE_KILLED not set."
- scripts/test-presence.js ALL GREEN on the rebuilt layer: A 21/21 (gate
  honesty; goInside triggers A2–A8; A9 — assignTask/takeWeapon never called;
  A10 waveOf), V 13/13 (NEW — the villager-veteran metric: engine
  veterans(4) = vA + scholar pinned, villagerVeterans = vA only; scholar w4
  kill excluded; dead w4 killer excluded; judgePrimary ±2 boundary; VET_BAR=2;
  judgeJoin 1.5x boundary with exactly-representable 0.375/0.25 — the
  0.15/0.10 draft failed on IEEE754 1.4999999999999998, a test artifact not a
  predicate bug), C1 6/6 (det-gate: gate-off byte-identical to tribfloor,
  gate-on deterministic + non-vacuous), C2 (180d presence runs both policies
  complete, zero errors, deterministic re-runs).
- scripts/test-presence-confirm.js 18/18 GREEN: T1 (engine veterans
  definition), T2 (judge predicates, VET_BAR=4), T3 LIVE on the rebuilt layer
  (no INFO-SKIP — beat fires, assignTask/takeWeapon never called).

[RESULTS — appended after the sweeps]

## Results — PILOT

**PILOT VERDICT: GO-TO-CONFIRM.** The rebuilt layer reproduces the mechanism.

32 pilot runs would be 16+16; this pilot is 8+8 (seeds 64201–64204 x
{lead,belong}), 0 instrument errors, anchor 5d90f9b96 (current master at
sweep time).

| metric | control | presence | bar |
|---|---|---|---|
| JOIN RATE (fights w/ companion dmg / w3 killing fights) | 33.3% (5/15) | 65.0% (13/20) | ≥1.5x → GO (1.95x) |
| w3 companion kills | 1 | 4 | — |
| companion damage (total) | 347 | 1,928 | — |
| beat engagement (goInside fires) | 0 | 82 | — |
| runs with beat firing | 0/8 | 8/8 | ≥8 → GO |
| median survival (gameDays) | 135 | 114 | ≥ control−5d → **FAIL (−21d)** |
| starvation deaths | 7 | 8 | watch-item → ok |
| death modes | 14 | 12 (raw-new: "the night", "The Moderator") | category judgment → PASS |
| national reach | 4/8 | 2/8 | ±2 band → PASS |
| table reach | 7/8 | 5/8 | ±2 band → PASS |
| wave-4 / wave-5 / wins | 5/8, 0/8, 0/8 | 5/8, 0/8, 0/8 | — |

The primary HIT (1.95x ≥ 1.5x) and engagement HIT (8/8). The survival
guardrail MISSED (−21d) — recorded LOUD (see metric review); the death-mode
flag is naive string-matching ("The Moderator" is a wave-2 monster name,
"the night" is game.js's endDay attribution — both instances, not modes;
ZERO fighter-movement deaths, the guardrail's stated intent).

Per the pre-registered pilot verdict (PRIMARY ≥1.5x → GO to confirm; the
pilot is a mechanism check gating the rebuild), the rebuild is faithful:
**GO-TO-CONFIRM**. The survival miss is carried as a LOUD flag to the
confirm, re-judged on the full 16-run corpus.

## Results — CONFIRM

**CONFIRM VERDICT: PARKED with metric review (NOT killed).** The revised
primary HIT exactly at bar; two reach guardrails missed; the kill protocol
is pre-registered for primary miss (which did not occur).

64 runs planned; 32 run (16+16 — the pre-registered 8-seed corpus),
0 instrument errors, anchor 5d90f9b96.

| metric | control | presence | bar |
|---|---|---|---|
| **PRIMARY: living VILLAGER veterans** | **0** | **2** | **≥ +2 → GO (exactly at bar)** |
| engine living-veterans (incl scholar) | 1 | 4 | — |
| veterans5 (living wave-4+ killers) | 0 | 0 | — |
| join rate (mechanism continuity) | 24.1% (7/29) | 50.0% (14/28) | 2.07x |
| w3 companion kills | 1 | 5 | — |
| companion damage (total) | 487 | 2,227 | — |
| beat engagement (goInside fires) | 0 | 138 | — |
| runs with beat firing | 0/16 | 16/16 | — |
| median survival (gameDays) | 110 | 111 | ≥ control−5d → PASS |
| starvation deaths | 7 | 14 | watch-item → **WATCH-BREACH** (> control+4) |
| death modes | 18 | 15 (raw-new: the night, The Moderator, Buffering, alien) | category → PASS |
| national reach | 8/16 | 4/16 | ±2 band → **FAIL** |
| table reach | 12/16 | 9/16 | ±2 band → **FAIL** |
| wave-4 reach | 11/16 | 9/16 | — |
| wave-5 reach | 0/16 | 0/16 | — |
| wins | 0/16 | 0/16 | — |

### Balanced panel (§15)

`evidence/2026-10-19/presence2-panel-primary.md` — control→presence compare:
decision `review_required`. ALL deltas `regression_watch` with 95% CIs
crossing 0 (leadfeast: table −0.125 [−0.375,0], national −0.25 [−0.625,0];
belongfeast: table −0.25 [−0.625,0], national −0.25 [−0.625,0],
npcHungry +0.125 [−0.25,0.5]). NO `regression_signal`. The panel (the
instrument) does not confirm the national/table count differences as a
material signal; the pre-registered ±2 band (the judge) records them as
misses. Both readings are reported; neither is re-scored.

### Veteran identity (deterministic re-run probe, s64202-leadpresence)

The 2 villager-veterans both come from ONE run (s64202-leadpresence):
- Ramon — 5 wave-3 kills (spool, chorus_line, callback ×2, spool) — DEAD.
- Nomthandazo — 1 wave-3 kill (spool) — LIVING veteran.
- Jae-ho — 1 wave-3 kill (spool) — LIVING veteran.
- Engine veterans(4) = 2 (the two living villagers; the scholar had no w3
  kills this run).

This reproduces the confirm's emblematic finding: **presence manufactures
killers; the window kills them.** The most prolific killer (Ramon, 5 kills)
died; the two single-kill survivors are the living veterans. The primary
rests on a single run — fragile, and recorded as such.

### Wall numbers (this run, 32 runs)

national 12/32, table 21/32, wins 0/32, wave-4 20/32, wave-5 0/32, median
survival 110/111d. The scale wall stands (no wins). The presence arm moved
the veteran-production needle on its revised target (2 vs 0 living villager
veterans) but did not move the wall.

## Village assessment (plain words)

The modal presence village fights wave-3 monsters with company. The
scholar's "stand with the village" beat fired 138 times across 16 runs —
every run door-aligned when wave-3+ threats were at Haven. The result: 14
of 28 wave-3 killing fights had companion damage (vs 7 of 29 on control),
and 5 wave-3 monsters were killed BY companions (vs 1 on control).

Who thrived: Nomthandazo and Jae-ho (s64202) — each killed a wave-3 Spool
alongside the scholar and LIVED, the only villagers on either arm to blood
a wave-3 monster and survive the run. Who died: Ramon (s64202) — five
wave-3 kills (spool, chorus_line, two callbacks, another spool), then dead
in the window; the familiar pattern. What was missing before: a reason for
the scholar to be on the same side of the door as the villagers. What this
run confirms: the revised metric (villager-veterans, not scholar-veterans)
is the honest target — control made 0, presence made 2. What remains: the
window still kills killers faster than presence makes them, and the beat
carries a starvation cost (14 vs 7) that needs a mechanism before any
recombination.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-19/presence2-transcripts/leadpresence-s64202.txt
(d52 Spool — Zoltan joins; d119 Big Loud — Zoltan, Nomthandazo, Jae-ho join).

The d52 Spool fight: "⚔ SPOOL! Zoltan joins you!" Zoltan "squares up to
watch. 'Give it hell.'" and fights for 5+ rounds (6, 6, 5, 6 per hit) while
the spool's record/replay (REC 1/3 → LOADED: WAIT/STRIKE/STRIKE) plays out
around them. The d119 fight: "⚔ BIG LOUD! Zoltan, Nomthandazo, Jae-ho join
you!" — three companions with distinct roles: Jae-ho strikes steadily
(16/15/15/13), Zoltan SCREAMS (stuns the monster — a distinct voice, not a
damage number), Nomthandazo witnesses ("Give it hell."). The System itself
reacts to the team — "OHHHH, MULTIPLE THREATS! The audience is FERAL! ...
A TEAM! A NAMED TEAM!"

The sense-test CONFIRMS: door-aligned villagers join and read as PEOPLE —
distinct courage, distinct roles, reactions to the fight, and the fiction
matches the ledger. Nobody is a damage number. (Same bar as the pilot and
confirm transcripts; the mechanism reads identically on the rebuilt layer.)

## Metric review (§14 — binding, never re-scored)

1. **PILOT PRIMARY (≥1.5x join rate) HIT: 1.95x.** Not re-scored. The
   rebuilt layer reproduces the mechanism (gate honesty re-verified by the
   proof's C1 det-gate: gate-off byte-identical to tribfloor).
2. **Pilot survival guardrail MISSED (−21d median at n=8).** Recorded LOUD,
   not hidden, not re-scored. Post-hoc analysis (not a re-score): the two
   earliest presence deaths (s64201: 36d/41d) had 2–3 beat fires and 0 w3
   kills — the beat was not engaged in those deaths. The full-corpus
   confirm re-judged survival: 111 vs 110 → PASS. The n=8 median was noise,
   consistent with the original pilot (+9d, n=16) and confirm (+7d, n=32)
   on the byte-identical mechanism.
3. **CONFIRM PRIMARY (+2 villager-veterans) HIT: 2 vs 0, exactly at bar.**
   Not re-scored. Fragility noted: both veterans come from a single run
   (s64202-leadpresence); control made 0. The bar was written before the
   sweep; the hit is GO per the pre-registered protocol.
4. **Guardrails:** survival PASS (111 vs 110); death-modes PASS on category
   judgment (raw-new strings are instances/variants: The Moderator and
   Buffering are monster names, "alien" is an instance, "the night" is the
   endDay attribution; ZERO fighter-movement deaths — the mechanism never
   assigns/moves/risks villagers, proof A9/T3). National FAIL (8→4, band
   ≥6); table FAIL (12→9, band ≥10). The panel (§15) reads both as
   regression_watch with CIs crossing 0 — noise-consistent, not a material
   signal — but the pre-registered ±2 band is the judge, and it records
   misses. Both readings stand; neither is re-scored.
5. **Starvation WATCH-BREACH: 14 vs 7 (> control+4=11).** The pre-registered
   watch-item breached its judgment threshold. Consistent with the original
   confirm (16 vs 11 + panel npcHungry regression_signal on belongfeast).
   The beat likely pulls the scholar from food work or fight-driven
   consumption raises burn. Mechanism unknown — named next, not re-scored.
6. **Seeds.** 64201–64208, verified filename-unused before the sweep (the
   two 64207 hits in perseed-spikechar-b are kcal values, not seeds).
   32/32 runs, 0 instrument errors, deterministic re-runs (proof C2;
   transcript probe reproduced the sweep exactly).
7. **Infrastructure:** git EPERM flap quiet this run (probe green before
   every write phase; all writes went through). No /tmp loss.

## Verdict and disposition

**CONFIRM VERDICT: PARKED with metric review (NOT killed).**

- The §14-revised primary HIT (2 vs 0 living villager-veterans, +2 exactly
  at bar) — the layer does what the confirm's metric-review asked it to do.
- Two pre-registered reach guardrails missed (national 8→4, table 12→9);
  starvation watch-breached (14 vs 7). Under §14 a miss is NO-GO — this is
  not a clean GO.
- The kill protocol as pre-registered triggers on PRIMARY miss ("Miss →
  NO-GO (kill protocol...)"). The primary did not miss. Deleting a working
  layer on noisy guardrail misses would repeat the false-kill failure mode
  the throughput section warns against ("noisy small-n causes false kills").
  Precedent: sim-winsupport (primary GO + guardrail breaches → PARKED, not
  killed; layer kept default-OFF).
- Disposition: scripts/policies/presence.js KEPT (it is default-OFF by
  design — PRESENCE=1 opt-in; the kill-protocol deletion is not executed).
  Instruments + evidence land.

## Convergence

scale-onramp stays converging. The presence family now reads: mechanism
proven 3/3 (pilot 7.05x, confirm 29.4x, presence2-pilot 1.95x); outcome on
the revised metric GO (2 vs 0 villager-veterans); costs named (starvation
+7, reach guardrails missed but panel-noise-consistent). The veteran
question is answered on the production side (presence makes killers); the
binding constraint remains the window (killers die) plus the newly-priced
starvation cost. Named nexts: (1) starvation-cost mechanism (beat vs
consumption) before any recombination; (2) presence + window-survival
recombination remains the axis's open play, now with a priced food cost.
Directive lift remains a Steve call.

## Named nexts

1. Starvation-cost mechanism: is the beat pulling the scholar from food
   work, or does companion fighting raise consumption? (14 vs 7 here;
   16 vs 11 + npcHungry regression_signal in the confirm.) Instrument the
   scholar's food-work ticks on beat days vs non-beat days.
2. Primary fragility: both villager-veterans came from one run. A
   replication on fresh seeds would test whether 2/16 is the rate or a
   spike.
3. The window still kills killers (Ramon: 5 kills, dead). Presence +
   window-survival recombination is the axis's open play.

## Files

- scripts/policies/presence.js — the layer REBUILT byte-faithfully
  (sha256 fd1a437e…, identical to the 7de3bbede original); PRESENCE=1
  opt-in, default OFF; zero src/js
- scripts/test-presence.js — proof extended: A 21/21, V 13/13 (NEW
  villager-veteran metric section), C1 6/6, C2 180d runs + deterministic
  re-runs; RED→GREEN incl. real RED phase — ALL GREEN
- scripts/test-presence-confirm.js — 18/18 GREEN (T1/T2 live; T3 live on
  the rebuilt layer, no INFO-SKIP)
- scripts/sweep-presence2.js — pilot + confirm sweep (KILLDISC
  instrument; per-seed JSONs carry top-level boolean won/national/table)
- scripts/sweep-presence2-analyze.js — analyzer (villagerVeterans shared
  definition, judge predicates VET_BAR=2; MODE=pilot|confirm)
- scripts/sweep-presence2-panels.js — §15 panel builder
  (control→presence; review_required, all regression_watch)
- scripts/sweep-presence2-transcripts.js — sense-testing probe
- evidence/2026-10-19/perseed-presence2/ — 32 per-seed JSONs +
  _summary-{control,presence}.json + _analysis-{pilot,confirm}.json
- evidence/2026-10-19/presence2-panel-primary-{before,after}.json.gz +
  presence2-panel-primary.json + presence2-panel-primary.md — the panel
- evidence/2026-10-19/presence2-transcripts/leadpresence-s64202.txt —
  sense-test transcript (Zoltan/Nomthandazo/Jae-ho fights)
- evidence/2026-10-19/sim-presence2.md — this file
- ZERO src/js changes; no game-code changes of any kind

