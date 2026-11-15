# sim-gap3-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T0730Z`, axis winnability chain, arm
sim-gap3-b, tracker blank 4 (second half). Branch `sim-gap3-b`. Base master
`8b77f0f40` (same tip the successorcaution control pilot ran on — no tip
drift to explain away).

## The problem, in plain words

The scholar dies alone in a wave-4/5 field fight at full health, the Codex
passes to the next villager, and the new bearer walks out and dies the same
way. The successor-caution arm proved the first two days after a death are
not the whole story: its 2-day window cut gap-1 deaths 22 → 14, but the
same-day cascades absorbed every one (gap-0 23 → 32), and the 37 gap-3+
deaths — established bearers, 3+ days after succession, dying solo on
ordinary trips — never moved (37 vs 38). This arm is those 37 deaths.

## Stage 1 — DIAG (before any build)

Decompose the gap-3+ scholar `the wild` deaths on a FRESH pilot corpus
(8 seeds, 150d, competent-answercourt-b, current tip) with a probe driver
that records, per death: location (tile corner/edge vs near Haven vs
inside Haven), party/ally presence at fight start, monster wave/species,
days since succession (gap), bearer's prior kill count (fighter vs
never-killed, live `agency.stats[vid].monsterKills`), trip context
(forage-destination fight vs other-travel destination vs non-destination
fight, from a travelTo log), scholar HP at fight start, and what the bot
KNEW at the time — per-monster codex knowledge
(`state.codex.monsters[mid]` stage/patterns), known counter
(`monsterCounters[mid]` or codex stage `slain`), tile revealed/stock,
and the policy's own damage-race verdict (`fightAssessRace`, computed
live at combat_start from exactly the knowledge the policy may use).
Every claim is grounded in perception or live state, never a roster.

The diag names the dominant sub-channel with numbers, and computes the
first-order ceiling for the ONE candidate lever family that is not already
killed or forbidden (see below): map-level destination decline.

## Stage 2 — BUILD (only if the diag permits)

Exactly ONE lever, against the proven dominant sub-channel, if a permitted
lever exists. Policy-side preferred: a competent policy variant (new file
`scripts/policies/competent-gap3-b.js`; default policies byte-identical in
behavior). The candidate family is **map-decline-only, scoped**: skip a
forage destination the scholar can SEE a monster on, only when the policy's
own race declines — with the scope the diag dictates (e.g. codex-known
wave-4/5 species only). A game-code lever only if the diag proves a
game-side mechanism AND it respects the hard boundaries below.

### What is already killed or forbidden (do not rebuild)

- **Fight-start proactive disengage** (`fightAssessHook`): killed at pilot
  in longsim scale-wall r3 (2026-10-13) — flee() is a wasted turn 1, the
  fight continues from the edge; 10 declines = 10 lost first strikes,
  median 69d → 33d. The hook stays OFF. Any variant that re-arms it is a
  re-run of a killed lever.
- **Unscoped map decline** (`COMPETENT_FIGHT_ASSESS=1` as a whole): killed
  at pilot in r3 — the pessimistic prior (20/round for unknown species)
  refused winnable wave-1 fights and traded combat deaths for starvation
  (2 → 13). A rebuild must be SCOPED (the diag's sub-channel, e.g.
  codex-known wave-4/5 only) and must NOT arm the hook. r3's own
  salvage note: map-decline-alone on winseek was mildly positive
  (median 34 → 41, villager:monster 13 → 7) and "a future run could test
  map-decline-only on competent" — that test has never run.
- **Successor-caution window** (2 days): already measured, 2 days is its
  scope. Not rebuilt.
- **Flee repair**: Steve call, held branch `sim-fleerepair-a`. Do not touch
  flee code.
- **Toughness / gear / damage / ability tuning**: combat-play gate still
  holds.
- **Removing the breach**: designed crisis (Steve 2026-10-09).
- **"Killer disperses" cascade-breaker**: rejected in fighterhold (against
  the no-sheepish-despawns stance, on an unproven inference).
- **Party formation**: separate persistent-party program, not this arm.

### BUILD vs DIAG-NO-GO decision rule (frozen before any sims)

- BUILD iff the diag shows a first-order addressable sub-channel whose
  perfect-operation ceiling on P1 is **≤ 0.6x control** (same bar as the
  pilot judge) AND the lever against it is policy-side, scoped, and
  outside the killed/forbidden list above.
- Otherwise **DIAG-NO-GO** with the full decomposition — a valid outcome
  (like fighterhold). Do not invent a lever.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — waves 4–5 are the killing tier; fatal fights
  are solo wave-4/5 field fights at full health (fighterhold probe:
  21/24 at 98–107 HP).
- `docs/PARTY.md` — party members auto-join fights; this arm does NOT
  form parties (separate program).
- `docs/MAP.md` — travel is node-to-node; a forage destination is a
  stocked revealed tile ≤ 3 away; the scholar enters at an edge
  (`travelTo`, game.js:12784) — which is why fatal fights sit at tile
  corners/edges.
- Diagnosis answered: `evidence/2026-11-14/sim-fighterhold-b.md`
  (DIAG-NO-GO; 88/121 while-national deaths are scholar `the wild`;
  victims mostly never-killed) and
  `evidence/2026-11-15/sim-successorcaution-b.md` (PILOT-NO-GO; gap-1
  22 → 14, gap-0 23 → 32, gap-3+ 37 vs 38 — the channel this arm owns).
- Prior art on the candidate family:
  `evidence/2026-10-13/sim-scale-wall-r3.md` (fight-assess killed at
  pilot; hook harmful, unscoped map decline starves, map-decline-alone
  mildly positive and never tested on competent).

## Baseline (to be measured fresh — never judged against a committed corpus)

The judged control is the FRESH gap3-driver control leg on the current
tip, not the successorcaution numbers. For reference only (same tip,
same policy, same band — the driver must reproduce them):
successorcaution fresh control pilot (8 seeds 100201–100208, 150d,
competent-answercourt-b): P1 **0.1649** (63 while-national scholar
`the wild` deaths / 382 national-days); median held-days **47.5**;
median survival **117.5d**; starvation pooled **0**; total deaths 652;
dissolutions 1; wave-5 3/8; wave-4 8/8; wins 0; table 0; gaps (88
scholar `the wild` deaths): gap-0 23, gap-1 22, gap-2 5, gap-3+ **38**.

## Pre-registered bars (judge — apply only if Stage 2 builds)

- **P1 (primary):** scholar `the wild` deaths per national-day
  (while-national deaths from the `deaths` arrays joined to the series
  `nationalLive` flag, per the ceiling analyzer) — **GO ≤ 0.6x
  control**.
- **P2:** median national held-days **≥ control**.
- **Cost bar:** starvation pooled **≤ control + 2** AND median survival
  **≥ 0.8x control**.
- Horizon **150d**, death-aware (dead villages stop simulating).
- Seeds: pilot 100201–100208; confirm 100201–100216 (only if the pilot
  gate passes).
- Policies: control `competent-answercourt-b`; armed
  `competent-gap3-b` (new file, wraps answercourt-b) — only if Stage 2
  builds.

## Stage 0 — reproduction (before any judged sim)

1. The NEW diag driver (`scripts/gap3-driver-20261115.js`, copy of the
   successorcaution driver + probe tele/travelTo/succession
   instrumentation, all pure reads) must reproduce the successorcaution
   control leg on seeds 100201/100203/100212 exactly (3/3 judged
   fields: days, endReason, maxWave, scale, held-days, deaths, P1
   inputs). Any divergence is explained before judging anything — the
   instrumentation must be trajectory-neutral.
2. Only then does the driver run the full 8-seed control pilot, which
   doubles as the Stage 1 diag corpus.

## Pilot gate (all three before any confirm spend, if Stage 2 builds)

- (i) Mechanism fires: band trips/skips ≥ 1 on the armed leg (the lever
  actually declined at least one would-be fatal destination), AND every
  pilot seed with ≥ 1 succession is unaffected in unrelated behavior.
- (ii) Cost bar clean on the pilot band (starvation ON ≤ OFF + 2 AND
  median survival ON ≥ 0.8x OFF).
- (iii) P1 moves in the GO direction (ON < OFF on the pilot band).
- Kill the lever at pilot if the gate fails — never run 12–16 seeds on
  an invisible effect.

## Proof test

`scripts/test-gap3-b.js` proves (for Stage 1): the diag driver records
combat_start rows with fighters/HP/location, travelTo rows classify
destination vs non-destination fights, succession gaps compute from
death days, and the live race verdict is computed from codex/lore only.
(For Stage 2, if it builds: the skip fires only on the scoped channel,
the fight-start hook stays inert, default policies byte-identical,
determinism legs.)

## Measurement

- Driver: `scripts/gap3-driver-20261115.js` (copy of the
  successorcaution driver; records the `deaths` arrays the judge needs
  + per-fight/per-death diag rows in `diag`).
- Analyzer: `scripts/analyze-gap3-b.js` (reads the control corpus;
  gap shares + gap-3+ decomposition + first-order ceiling).
- Balanced-panel compare per `docs/MEASUREMENT.md` §15 (only if Stage 2
  builds); attach the compare `.md` to the evidence file.
- Telemetry deviation check per the body (investigate any LOUD line the
  same run).
- Evidence: `evidence/2026-11-15/sim-gap3-b.md` with a "metric review"
  section. Per-seed files under
  `evidence/2026-11-15/perseed-gap3-b-control/` (and `-on/` if built).
- Sense-testing: read the linkLines + fatal-fight transcripts — does the
  established bearer dying on an ordinary trip read sensibly, or does
  the village go silent about it?

## Metric review (to be filled in the evidence file)

Pre-registered here: P1 conflates trip deaths with breach deaths and
with same-day cascade deaths — the diag quantifies exactly how much of
P1 the scoped map-decline can ever move. If P1 moves less than the
ceiling, the review will say whether the shortfall is breach deaths,
non-destination fights, races the policy judged winnable, or cascade
replacement (a prevented death replaced by a gap-0 follower, as the
successorcaution pilot showed).
