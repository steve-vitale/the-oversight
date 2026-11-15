# sim-cascade-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261115T0730Z`, axis winnability chain, arm
sim-cascade-b (winnability-chain blank 3). Branch `sim-cascade-b`. Base
master `8b77f0f40` (coordinator evidence tip; no `src/js` change since the
successorcaution fresh-control tip `31c51f32d` — verified by
`git log 31c51f32d..HEAD -- src/js`, empty).

## The question, in plain words

National villages die because the scholar — the player character — walks
out alone, meets one wave-4/5 monster at full health, and loses. Then the
Codex passes to the next villager, who wakes up healthy and dies the same
way THE SAME DAY. Two to six scholars can die in one day; a village of
ten burns through its roster in a week. The successor-caution policy
(a 2-day stay-home window after each succession) cut next-day deaths
22→14 but same-day cascade deaths ROSE 23→32 and total wild deaths
stayed 88→88: a daily-level gate cannot touch a death inside the death
day's own `daily()` call. This arm finds WHICH same-day mechanism
dominates, then builds exactly one lever against it — if a permitted
lever exists.

## Stage 1 — DIAG (before any build)

Instrument `daily()` / succession / fight on a fresh pilot corpus
(seeds 100201–100208, 150d, competent-answercourt-b) to discriminate
which sub-mechanism dominates same-day cascades. Instrument:
`scripts/cascade-driver-20261115.js` (copy of the successorcaution
driver + cascade instrumentation: combat-session ids, world-monster
INSTANCE ids via object identity — the engine carries no instance id
— provenance labels, doorFledMonsters stash snapshots, bearer,
days-since-succession, daily() phase).

### Classification rules (FROZEN — no post-hoc reclassification)

A **gap-0 follower** is a scholar `the wild` death on the same game day
as a previous scholar `the wild` death (same seed). Each gap-0 follower
is classified by its fatal fight's combat session and provenance:

- **(A) Same fight session.** The follower's `sessionId` EQUALS the
  previous death's `sessionId` — one combat session killed two
  bearers (the successor auto-enrolled into a combat they never
  entered). Code reading says this is impossible (`tbEndCheck`:
  scholar dead → `tbEnd('lost')` → `f.over = true`; the fight ends
  and `tbfight` clears in `tbEnd`'s finally). The probe proves or
  refutes it empirically; a code reading is not a verdict.
- **(B) New fight, waiting killer at Haven.** The follower's session is
  a NEW session whose provenance is `treeline` (treelineAmbush:
  a dead bearer's door-fled stash waits outside the walls and meets
  the new bearer when they leave Haven), `door-reengage`
  (exitBuilding re-engage), or `breach` (a fight starting while the
  scholar is at Haven fires the designed breach crisis).
- **(C) New fight, wild, successor's own trip.** The follower's session
  is a NEW session with provenance `wild` (or other non-Haven
  provenance), `insideHaven=false` at fight start — the successor
  died on their own outing later in the same `daily()` call.

**Dominance:** the sub-mechanism holding the plurality (strictly
largest share) of gap-0 follower deaths. A tie for first, or a
plurality under 50% with the runner-up within one death, is NOT a
proven dominant mechanism — report the decomposition and take the
DIAG-NO-GO path unless a permitted lever addresses the proven
plurality mechanism alone.

**Same-instance proof (FROZEN — fighterhold's inference is not
proof):** two deaths count as the SAME killer only if linked by
(i) identical `worldMonsterInstance` ids across their sessions, or
(ii) a doorFledMonsters stash entry (species + hp + bearer) created
by an earlier fight and consumed by the later fight's re-engage, or
(iii) identical session id (A). Species + tile + day alone is NOT
proof. Wild killers are lifted out of the world at fight start and
NOT restored on `lost` (only titan/lingering `worldOrigin` objects
are put back), so a wild same-instance chain is impossible by
construction — the probe must show it empirically (no shared
instance id across any two fatal wild sessions).

## Stage 2 — BUILD (decision rule, pre-specified)

- If **(A)** dominates: the in-scope lever is ending the fight session
  when the scholar dies (the monster won; the fight is over; the
  successor is not auto-enrolled into a combat they never entered) —
  a bug fix, not a balance lever. (If the probe shows (A) is already
  impossible in code AND in data, there is nothing to build here.)
- If **(B)** dominates: the lever must address the waiting killer
  WITHOUT removing the breach (designed crisis, Steve 2026-10-09)
  and WITHOUT despawning the killer (rejected cascade-breaker).
  The exact lever is chosen after the diag, from within those
  bounds, and named in the evidence file before its pilot runs.
- If **(C)** dominates: report back — the policy door was already
  tried (successorcaution) and the fix belongs to policy, not game
  code. No game-code build. Verdict DIAG-NO-GO.
- If NO permitted lever exists against the proven mechanism: verdict
  DIAG-NO-GO with the full decomposition (a valid outcome, like
  fighterhold). Do not invent a lever.

## Hard boundaries (fighterhold rulings, binding)

NO toughness/gear/damage/ability tuning (combat-play gate still
holds); NO flee-repair (Steve call, held branch — do not touch flee
code); NO removing the breach; NO "killer disperses after killing
the scholar" cascade-breaker. Policies stay byte-identical in this
arm (successorcaution is a separate, already-judged policy arm).

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — waves 4–5 are the killing tier; fatal
  fights are solo wave-4/5 field fights at full health (fighterhold
  probe: 21/24 at 98–107 HP).
- `docs/SCALE.md` — national is a live relationship; each scholar
  death costs −8 trust on every link (funeral mend buys it back).
- `docs/PARTY.md` — party members auto-join fights; this arm does
  NOT form parties (the persistent-party program is separate).
- Diagnosis answered: `evidence/2026-11-14/sim-fighterhold-b.md`
  (DIAG-NO-GO) and `evidence/2026-11-15/sim-successorcaution-b.md`
  (PILOT-NO-GO; gap-0 cascade absorbs the gain).

## Baseline (successorcaution fresh control, 8 seeds 100201–100208)

`evidence/2026-11-15/perseed-successorcaution-b-control/` —
competent-answercourt-b, 150d, FUNERALMEND default ON, tip
`31c51f32d` (no `src/js` change since):
- National-ever 8/8; end-state national 7/8; median national
  held-days **47.5**; dissolutions **1**; median survival **117.5d**;
  starvation pooled **0**; total deaths 652; wave-5 unlocked 3/8;
  wave-4 8/8; wins 0; table 0.
- P1 control: **0.1649** (63 while-national scholar `the wild`
  deaths / 382 national-days).
- Gap shares (88 scholar `the wild` deaths): gap-0 **23**, gap-1 22,
  gap-2 5, gap-3+ 38.

## Pre-registered bars (judge)

- **P1 (primary):** scholar `the wild` deaths per national-day —
  **GO ≤ 0.6x control** (≤ 0.0989 on the fresh control).
- **P2:** median national held-days **≥ control (47.5)**.
- **Cost bar:** starvation pooled **≤ control + 2** AND median
  survival **≥ 0.8x control** (≥ 94d).
- Horizon **150d**, death-aware (dead villages stop simulating).
- Seeds: pilot 100201–100208; confirm 100201–100216 (only if the
  pilot gate passes).
- Policies: control `competent-answercourt-b`; armed leg TBD by the
  Stage 1 diag (game-code flag or policy variant — named before
  its pilot runs, judged by the same bars on the same driver).
- The judged control leg is the fresh cascade-driver control corpus
  generated as the Stage 1 diag corpus on the current tip. It is
  judged against the successorcaution fresh control ONLY through
  Stage 0 (reproduction); the armed leg is judged against the fresh
  cascade control leg on the same driver and tip.

## Stage 0 — reproduction (before any judged sim)

The cascade driver on seeds 100201/100203/100212 with
competent-answercourt-b must reproduce the successorcaution fresh
control judged fields exactly (days, endReason, maxWave, standing,
scaleRank, waveKills, series, deaths). Any divergence is explained
before judging anything (r206 drift lesson: never judge against a
committed corpus from an older tip).

## Pilot gate (all three before any confirm spend)

- (i) Mechanism fires: the lever's instrumented effect is observable
  in the armed leg (named per lever in the evidence file).
- (ii) Cost bar clean on the pilot band (starvation ON ≤ OFF + 2 AND
  median survival ON ≥ 0.8x OFF).
- (iii) P1 moves in the GO direction (ON < OFF on the pilot band)
  AND the gap-0 follower count falls (the lever must touch the
  cascade bucket it was built for, not just shift deaths between
  buckets).
- Kill the lever at pilot if the gate fails — never run 12–16 seeds
  on an invisible effect.

## Proof test

`scripts/test-cascade-b.js` proves, per lever: the mechanism (as
named after the diag); determinism legs (same seed twice →
identical stats); no `Math.random` in new policy code (if any);
no `src/js` change outside the lever's files; the lever's own
unit behavior on a fake Game where applicable.

## Measurement

- Driver: `scripts/cascade-driver-20261115.js` (copy of the
  successorcaution driver + cascade instrumentation; no
  game-behavior change).
- Balanced-panel compare per `docs/MEASUREMENT.md` §15; attach the
  compare `.md` to the evidence file.
- Telemetry deviation check per the body (investigate any LOUD line
  the same run; the scale-wall baseline's winseat regime is a known
  invalid comparison for pre-seat substrates — see
  successorcaution §telemetry).
- Evidence: `evidence/2026-11-15/sim-cascade-b.md` with a "metric
  review" section. Per-seed files under
  `evidence/2026-11-15/perseed-cascade-b-{control,on}/`.
- Sense-testing: read the linkLines — do the cascade days read as a
  village losing bearers one after another, or as noise? Does the
  lever's effect (if any) read sensibly in the transcript?

## Metric review (to be filled in the evidence file)

Pre-registered here: P1 conflates (A)/(B)/(C) deaths — the Stage 1
decomposition quantifies exactly how much of P1 each sub-mechanism
owns, so a lever aimed at one bucket has a known ceiling before its
pilot runs. If P1 moves less than that ceiling, the review will say
whether the shortfall is the wrong bucket, a lever that never
engaged, or deaths the lever structurally cannot reach.
