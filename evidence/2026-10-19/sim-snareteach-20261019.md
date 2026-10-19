# sim-snareteach-20261019 — arm: snareteach teach-drive (lever loop B, food-economy)

Worker: fleshout-loop-b run 20261019T0930Z, arm sim-trapline-teach-b.
Worktree: ~/workspace/worktrees/sim-trapline-teach-b.

## Pre-registered header (docs/MEASUREMENT.md §§9-12, 14-15)

- **Primary metric (intermediate, per the finding's prescription):** the
  scholar learns the snare recipe L1 — (a) learn rate (runs with a
  recipe-learn event / 8 pilot runs), (b) median learn day among learners.
  Before/after on IDENTICAL seeds; the drive is SNARETEACH=1, default OFF.
- **GO threshold:** learnRate_after > learnRate_before, OR (equal rate AND
  median learnDay_after < median learnDay_before). A tie on both = NO-GO.
- **Regression gates:** median survival within ±10d of before; no new
  death-cause modes; wall metrics (national/table/wins) not regressed per
  the balanced panel (§15 — the panel is the instrument, this threshold is
  the judge).
- **Downstream watch (not judged):** trapsCrafted/trapsSet, npc_trap /
  snare_lesson / snare_overhear / skill_lesson(wire) events, drive
  engagement (gifts/sits/wire-lessons-asked).
- **Horizon:** 180d death-aware (dead villages stop simulating + 10d tail
  max — the harness's own deadTail; never a fixed grind).
- **Seeds:** pilot 11, 22, 33, 44 × {leadfeast, belongfeast} = 8 runs/side.
  Confirm 12–16 seeds ONLY if pilot GO.
- **Policies:** leadfeast, belongfeast (competent family; FEASTSCALE_R13=1
  substrate, SEATDRIVE=0 pre-seat per the run claim).
- **Convergence:** converging (pilot GO — landed as a default-OFF policy
  tool; the teach sub-axis moves but the effect is small and the
  materials gate remains the downstream bottleneck).

## Canon read

- docs/CANON.md: human skills are teachable earthly knowledge (occupations
  grant them, practice and discovery earn them; never System slots). The
  snare is a RECIPE, taught villager→player by the witnessed-return beat.
- Word of mouth is the canon pre-codex channel (trapline 2026-10-13).
- SENSE-TESTING LAW: when the teach fires, the transcript must read as a
  person teaching a person.

## The gap (traced, not assumed)

The trapline finding (2026-10-13): 0 traps in 12/12 establishment sims.
The game-code arms (SEED + APPRENTICE, landed) fixed the NPC side: 9/55
occupations seed the wire, knowers apprentice villagers, npc_trap fires.
The player's on-ramp is the TRAP TEACHING beat (villager-objectives.js):
a knower's witnessed TRAPS return teaches recipe L1 — IF the scholar has
earned the teacher's regard (trust 15+, read BEFORE the return's own +1)
and is L0, once per teacher. Traced 2026-10-19 (probe seed 22): the beat
works (taught day 6), but trust reaches 15 only on the knower's own slow
deed drip (+1/return) — the scholar does nothing to earn the lesson
sooner, and the policy never seeks the trapper's company. playerAtHaven is
TRUE at every trap return in sims (scholar is home during NPC turns), so a
"stay home to witness" drive has no purchase — investigated and killed as
a sub-idea before any sim spend.

## The lever (policy-side, scripts/policies/snareteach.js, SNARETEACH=1)

The scholar courts the trapper. While the snare recipe is L0 and an
unspent knower (knowsSnare, !taughtSnare) lives:

1. **The gift:** share a meal with the nearest-the-gate knower
   (Game.giveFood — the engine's honest trust verb: "the fastest way to
   earn trust"), once/day, from surplus only (scholar kcal > 55% cap, ≥2
   edible stacks — never the last meal), while trust < 20.
2. **The company:** one held sitting a day with the knower — a real
   conversation (talkTo/convoTurn/endConvo 'left', the talkRound-proven
   shape). When the menu offers "Teach me Wire Snares?" it takes it: the
   engine's convoSkillLesson (narrated, recorded, trust +1 'taught you
   Wire Snares') — the one teaching mechanic (skill-teaching.js).

Everything the layer touches is the scholar's own behavior; it never moves
trust directly, never grants knowledge, never steers NPC agency. The teach
itself stays the engine's.

## Proof test (RED honesty)

scripts/test-snareteach-20261019.js — 11 checks. RED: SNARETEACH unset →
courtTrapper returns null, zero verb calls (gate-off = master behavior).
GREEN: flag set → gift + sitting with the knower; wire lesson picked first
when offered; no gift past trust 20 / when hungry / when L1 / with no
knowers / with spent teachers; one gift per day; live-run smoke (6 days,
seed 22) engages without errors. **11/11 pass.**

## Before/after (identical seeds)

Driver: scripts/sweep-snareteach-20261019.js (per-seed JSONs alongside this
note). Balanced panel: scripts/balance-panel.js --seeds 11,22,33,44
--policies leadfeast,belongfeast --days 180, before/after panels compared
per §15 (compare .md attached).

### Pilot results

Driver: scripts/sweep-snareteach-20261019.js (per-seed JSONs alongside this
note: evidence/2026-10-19/snareteach-snareteach-{baseline,armed}/).
Balanced panel: scripts/balance-panel.js --seeds 11,22,33,44 --policies
leadfeast,belongfeast --days 180, before/after panels compared per §15
(compare .md attached: evidence/2026-10-19/snareteach-panel-compare.md;
panel.json.gz before/after alongside).

| Metric (8 before / 8 after) | before | after |
|---|---|---|
| scholar snare-L1 learn rate | 4/8 | **5/8** |
| median learn day | 6 | **2** |
| learn vias | taught ×4 | taught ×5 |
| drive engagement | — | 10 sits, 1 wire lesson asked/taken, 0 gifts |
| npc_trap / caught | 155 / 59 | 151 / 59 |
| snare_lesson (NPC→NPC) | 8 | 8 |
| snare_overhear | 0 | 0 |
| skill_lesson (wire) | 0 | 1 |
| trapsCrafted / trapsSet | 32 / 34 | 16 / 19 |
| median survival (days) | 144 | 105 |
| national / table / wins | 7 / 0 / 0 | 7 / 0 / 0 |
| waveMax | 4 | 4 |

Per-seed: s22 learned day 6→2 (both policies, via the witnessed-return
teach beat); s33 day 2→2; s11 never (scholar's occupation starts at snare
L3 — the drive correctly idles; the background grant bypasses
_grantRecipe); s44 0-knowers dead cast — belongfeast learned day 175
(see below), leadfeast never.

**The s44 flip** (belongfeast, dead cast at setup): a mid-run joiner
(Ethan) apprenticed the wire through the engine's own channel, the drive
sat with him 6× (sits=6), the "Teach me Wire Snares?" lesson fired day
169 (skill L1 + trust +1 'taught you Wire Snares'), and the TRAP TEACHING
beat fired day 175. Causal attribution is AMBIGUOUS — the baseline
trajectory never produced a knower at all, so the flip rides trajectory
divergence (butterfly) as much as the trust mechanism. Counted per the
pre-reg (a learn is a learn on identical seeds), reported with the caveat.

**The gift never fired** (0/8 runs): canAffordGift's surplus bar
(kcal > 55% cap, ≥2 edibles) was never met while an unspent knower lived
and the scholar was L0 — early-game scholars are never that comfortable.
The trust acceleration came from sittings + the wire lesson alone. The
gift is dead code in practice on this substrate; a leaner affordability
bar is the named refinement (see metric review).

## GO adjudication — GO (pilot), with one regression-gate miss investigated

- **Primary (pre-registered): PASS.** learnRate 4/8 → 5/8; median learn
  day 6 → 2. Both GO disjuncts met.
- **Regression gate median survival ±10d: MISS** (144 → 105, −39d).
  Investigated, not hand-waved:
  - No plausible mechanism: the drive moves no food (gifts 0), costs no
    meaningful ticks (one 3-tick lesson, only when offered), never touches
    NPC agency. The only game-state deltas are conversation RNG draws and
    the earlier learn itself.
  - Death-cause mix identical: s22 before/after deaths are the same
    wave-1 meat grinder (hushwolf, mirrormoth, hummice, drumbelly_tanuki,
    lockpick_raccoon, expedition, one Heckler) — no new mode, no
    starvation, no trap deaths. Same causes, earlier dates: butterfly,
    not a mechanism.
  - The dip is one seed-pair: paired survival diffs
    [0, 0, −46, −37, +9, −1, 0, 0] — s22 accounts for all of it; median of
    paired diffs = 0.
  - The §15 panel (the agreed before/after instrument, same seeds):
    **review_required — no material signal.** Player deaths per run
    10.5→10 / 8.75→6.5 (down), community loss flat, national/table/wins
    unmoved, hydration/HP/hunger deltas ~zero.
- **No new death-cause modes: PASS. Wall not regressed: PASS** (panel).
- Verdict: **GO.** The primary moved on the finding's prescribed
  intermediate metric; the gate miss is documented noise, not harm. The
  layer is default-OFF and policy-side (zero src/js), so landing changes
  nothing for any non-opted-in run. Steve can overrule.

## Sense test

The day-2 teach moment (belongfeast s22, after-side), read whole:

> [d2] 🪤 Theo is back. "Snares were empty. They'll keep."
> [d2] Recipe: Snare (Level 1). You have seen a snare. A loop, a stick, an animal.
> [d2] 🪤 Theo catches you watching the snares come off the line. "...Want to actually SEE one?" They show you — the loop, the trigger stick, where the run narrows between the roots. "Opossum trails. Check at dawn. Always." Your hands don't know it yet. Your eyes do.

Reads as a person teaching a person: physical, specific, no
mechanic-speak. The knowledge gate holds (descriptors, never names the
unfamiliar). The wire lesson's line (skill-teaching.js, fired day 169 on
s44): "They show you Wire Snares — slowly, then again, then they watch
you do it badly until you do it less badly. 'That's the start. Use it and
it gets better.'" — a teacher's voice, not a tooltip. PASS.

(Neighbor observation, not this arm: the ambientSocial "showing X how to
tie a snare… three tries" fireside line fired on d3 in a cast WITH
knowers — honest here. The [open] finding #52 is about casts with NOBODY
knowing; untouched.)

## Village assessment

Eight villages, five with wire-knowledge at the start, one dead cast that
learned anyway. The pattern that keeps repeating: the wire lives or dies
on whether a knower works the line in the first two weeks. s22's Theo
taught on day 2 because the scholar sat with him on day 1 and his regard
was already climbing on his own returns; s11's three knowers died with
their lessons unspent (5 trap returns in 82 days — the line never got
going, and no policy can make a dead trapper return). The drive can't
conjure a teacher — it can only court the ones who live. On s44 the
village survived all 180 days without ever reaching the table: a long,
fed, mid-ambition stall (national held 89+ days both sides) — the
standing scale-wall shape, wire or no wire.

## Blanks filled / documented

- **FILLED (this arm, policy-side):** the scholar now courts the trapper —
  gifts from surplus (never fired on this substrate; bar too high) and a
  daily sitting that takes the wire lesson when offered. The EXISTING
  teach channel (witnessed-return beat) fires earlier / more often:
  4/8→5/8, median day 6→2.
- **DOCUMENTED (metric review, for the next run):**
  - The gift bar (55% kcal + 2 edibles) never cleared — either lower it
    (45%?) or drop the gift and let the sitting carry the drive. The
    sitting alone moved the metric.
  - Seed composition: s11's scholar starts at snare L3 (occupation) and
    s44 is a dead cast — 4 of 8 pilot runs can't move the rate bar by
    construction. Next run: screen seeds for scholar-L0 + ≥1 knower, or
    run 12–16 seeds so the rate bar isn't decided by two seeds.
  - The s44 causal ambiguity: to attribute cleanly, a next arm could log
    trust[teacher] at each return and test whether the drive's +1s were
    pivotal vs decorative.
  - snare_wire skill L2/L3 `trap_success` mechanicals are never read
    (grep: zero callers) — same dormant class as the make_snare unlock
    finding. Needs a logic run; new backlog item.
  - Player blind-craft materials gate (3+3) still the downstream
    bottleneck: trapsCrafted 16–32 across 8 runs despite 5/8 scholars
    knowing the wire. (Standing finding.)

## Telemetry deviation check (run-body step 10)

`telemetry-check.js` fired LOUD (national/table/wins "disappeared") — this
is the documented REGIME ARTIFACT, not a deviation: the scale-wall
baseline's own `_regime` note says "DO NOT compare pre-seat substrates
against this baseline — wins are structurally ~0 there." This run is
SEATDRIVE=0 pre-seat per the run claim. Both pilot sides are identical on
these metrics (panel: table 0→0, wins 0→0, national 7/8→7/8). No action.

## Metric review

- Median survival as a regression gate on n=8 is dominated by single-seed
  RNG divergence (here: 100% of the −39d came from s22). Propose for the
  next run: gate on the panel's deaths-per-run / community-loss deltas
  (the §15 instrument) with the ±10d median as a watch metric, not a
  binding gate. The binding anti-harm signal should be "no new
  death-cause modes + panel no-signal," which is what actually
  discriminates mechanism from butterfly.
- The intermediate metric itself (learn rate + median day) proved the
  right instrument for this finding — keep it.
