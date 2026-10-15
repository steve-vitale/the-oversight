# longsim scale-wall r36 — WILDERNESS DIRECTIONAL-FLEE REFUSAL (flesh-out, 2026-10-14)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims
- **Axis:** scale-onramp (blocking; standing directive overrides rotation)
- **Question (finding #203):** the r26 fleedirect layer's headline judgment —
  REFUSE outward pushes into unknown nodes when hurt/hungry (proven 17/17 in
  scripts/test-fleedirect-20261014.js) — fired 0 times in 8 armed leadfeast
  runs because leadfeast disengages happen at the haven node (118/118 holds
  at-haven), never in the wilderness. Does the refusal fire on a ranging
  substrate, and does it pay (fewer stranded scholars, fewer scholar combat
  deaths)?
- **Primary metric:** (a) armed wilderness-disengage refusals fire ≥5 times
  on 8 seeds, AND (b) armed scholar combat deaths ≤ control−2 — the judgment
  must both fire and pay.
- **GO threshold:** refusals ≥5 AND scholarCombat_armed ≤ scholarCombat_control − 2
- **Guardrails:** median survival ≥ control−10d; national ≥ control−2; no new
  death mode (cause-FAMILY level: strip player:/villager: prefix, named
  monsters → `monster` family); starvation deaths ≤ control+9
- **Horizon:** 150d death-aware (dead villages stop; +10d tail max)
- **Seeds:** 11/22/33/44/55/66/77/88 × wildrange substrate, IDENTICAL seeds
  both sides
- **Policies:** wildrange (WILDRANGE=1, COMPETENT_DIRECTIONAL_FLEE=1 —
  ranging substrate + the r2 directional judgment; the r2 at-haven hold is
  symmetric on both arms). CONTROL: FLEEDIRECTWILD unset. ARMED:
  FLEEDIRECTWILD=1. Same tree, env-var only.
- **If the refusal fires 0× on the ranging substrate:** the arm is
  UNMEASURABLE — kill as unmeasurable, keep instruments, do NOT re-score.
- **A miss is NO-GO** — never re-scored against a friendlier metric mid-run.

## Canon check
READ docs/CANON.md FIRST, then docs/MONSTER-WAVES.md. Canon touched: none —
this is engagement/disengage JUDGMENT only (policy-side). No fight
execution, no damage math, no monster counters (villager counter-execution
is the sibling sim-learnfirst lane; race_guard honored).

## The lever
`scripts/policies/fleedirectwild.js` (NEW, gate FLEEDIRECTWILD=1, default
OFF) + a gated, fail-closed hook in `scripts/policies/competent.js` flee()
(returns false → the fight falls through to combat; absent layer file
post-kill degrades to the r2 path). The layer implements ONLY the r26
refusal's wilderness half on top of the current tree's landed r2 judgment:
- judged push is a safe way home (haven, or havenward with no monster) →
  push through (reason safe-home)
- judged push is known-safe ground → push through (reason known-safe)
- otherwise (the r26 "least-bad" push into the unknown) + scholar hurt
  (hp<50% maxHp) or hungry (kcal<35% kcalCap) → HOLD, refuse the outward
  push (reason refuse-hurt / refuse-hungry / refuse-hurt-hungry)
- healthy+fed → push through (reason least-bad-strong)
- at haven → the layer never runs (the hook sits after the r2 at-haven
  null-hold, which is already measured — coin flip — and symmetric).

## Substrate choice (documented per brief)
meatseek and haul do not range (meatseek is a haven-bound food layer; haul
loots corpses in place). courtkill/warroad's hunt machinery ranges but is
wave-3-gated (day 25+ — too late for the refusal's unknown-world surface).
So the substrate is a NEW ranging policy, `scripts/policies/wildrange.js`
(gate WILDRANGE=1): rebuilt from the warroad-spec hunt machinery
(engine-honest thicket/ruin expeditions via real travelTo + real
checkEncounter; visible world monsters walked up to on the detail grid,
bounded 12 steps) with two deliberate changes: (1) NOT wave-3-gated —
ranges every 2nd day from day 3, healthy (hp≥60%) and fed (kcal≥200);
(2) NO committed-hunt fight override — the fight path stays competent's
natural judgment (new-fight outmatched assessment, 35%-HP threshold), so
wilderness disengages happen honestly. Both arms share the substrate
identically.

## Gates (before any sweep spend)
- **proof** scripts/test-fleedirectwild-20261014.js: REAL RED (layer absent →
  require throws, FAILs, exit 1) → GREEN (unit A–E: refuse-hurt-hungry on
  the hurt/hungry wilderness fixture; silent for the strong / safe-home /
  known-safe / at-haven; gate-off hook inert; e2e G: refusal fires through
  the real fight path, 0 judged pushes; e2e H: the strong push through).
- **det-gate** scripts/det-gate-fleedirectwild-20261014.js: 16/16
  bit-identical (8 seeds × control/armed, each run twice in-process, 25d).
- **SMOKE=1** (scripts/sweep-fleedirectwild-20261014.js): policy drives
  (5.60 calls/day); the substrate ranges (13 legs in 15d); the refusal
  fires through the real fight path on the scripted hurt/hungry wilderness
  disengage (4 refusals, 0 pushes).

## Pilot (8 seeds × 150d death-aware, identical seeds) — RESULTS

| | median days | national | table | wins | wave4 | wave5 | starve | scholarCombat | refusals |
|---|---|---|---|---|---|---|---|---|---|
| control | 85 | 0/8 | 0/8 | 0/8 | 3/8 | 0/8 | 6 | 16 | 0 |
| armed | 85 | 0/8 | 0/8 | 0/8 | 3/8 | 0/8 | 6 | 16 | 0 |
| GO bar | ≥75 | ≥−2 | — | — | — | — | ≤15 | ≤14 | ≥5 |

Per-seed days (control → armed): 48→48, 114→114, 36→36, 48→48, 35→35,
85→85, 150→150, 90→90 — byte-identical. scholarCombat per-seed: 1/4/0/1/1/3/5/1
both sides. Death families identical both sides (combat 58, monster 12,
sickness 6, starvation 6, dehydration 5, wound 3, alien 1, thirst 1,
villager combat 5); armed-only families: none — no new death mode.

**VERDICT: KILLED AT PILOT — UNMEASURABLE.** Primary bar 1 (refusals ≥5):
**0** — MISS. Primary bar 2 (scholarCombat ≤ control−2 = 14): 16 — MISS
(no move). Per §14 and the arm's own pre-registered unmeasurability
condition (0 firings → kill, do not re-score): NO-GO. The layer is deleted
per kill protocol; instruments kept.

## Why 0× (honest diagnosis — the run's real finding)
The armed side judged **279 wilderness disengages** — and passed **279/279
through as `safe-home`**. The diagnostic (temporary pass-reason telemetry
on s22/s77) shows: the r2 directional judgment already guarantees a safe
way home on every wilderness disengage in honest play. The scholars WERE
hurt on most of them (hurt on 71/88 s22 disengages, 46/61 s77) and hungry
on a few (4–6) — the refusal's *condition* was live — but the judged push
was always havenward-safe, so the refusal's *trigger* (the r26 "least-bad"
push into the unknown: all havenward exits monster-active AND no
known-safe ground AND hurt/hungry) never materialized in 8 seeds × 150d.

In other words: the r2 judgment (landed 2026-10-13) already solves the
wilderness half of the r1 stranding failure — it never pushes outward into
the unknown, so there is nothing left for the r26 refusal to refuse. The
refusal is a dead letter on the current tree: a guard for a corner
(unknown push + hurt/hungry) that honest play never reaches. The r26 unit
proof (17/17) proved the logic on fixtures; it never proved the trigger
occurs in live play — the missing gate.

## Metric review (§14 — for the NEXT run, not this one)
1. **The primary's bar 1 (≥5 firings) worked exactly as designed**: it is
   a measurability gate, and it killed a 0-fire arm cleanly instead of
   letting it claim a survival effect. Keep firing-gates on all judgment
   layers.
2. **A judgment layer needs a reachability proof before a sweep.** Unit
   fixtures prove logic; they do not prove the trigger occurs in live
   play. The predcond arm's constructed-scenario pattern (scenario 6/6 on
   live telemetry) is the right pre-sweep gate for judgment layers whose
   trigger is a subset of an already-landed judgment's edge case.
3. **Bar 2 (scholarCombat ≤ control−2) was moot** with 0 firings — a
   coupled primary where one prong gates measurability should let the
   measurability prong kill first (it did, by the pre-registered rule).
4. **The refusal has no voice.** It fires (or doesn't) as a silent hold —
   no say-beat, no journal trace. A judgment that never speaks cannot be
   sense-tested from transcripts; only its counters exist. Any future
   disengage-judgment layer should narrate its refusal (the no-silent-
   actions rule) so sense-testing can judge it as judgment vs panic.

## Village assessment (control side — the wildrange road baseline)
The ranging road is a hard road: villages range into the wild every 2nd
day and die out there — median 85d, national 0/8, table 0/8, wins 0/8,
wave-4 3/8 (s66/s77/s88), wave-5 0/8. The wall stands: ranging buys
wave-4 contact (via the war lane — s77 banked its way to wave 4 and
survived 150d) but no scale.
- **s77 (control)** survived 150d, reached wave 4 — then kept ranging: 5
  scholar combat deaths (succession held, the village outlived its
  scholars). The road's ceiling is visible here: the village survives its
  rangers dying, but never scales.
- **s22 (control)** 114d, wave 3, 4 scholar combat deaths — the
  attritional shape: 71 range legs, 21 engagements, scholars worn down
  in the wild.
- **s33/s55 (control)** collapsed day 35–36: the early-collapse shape on
  a ranging road (combat-led, starvation present).
- **Who dies and why:** scholars die in tb fights in the wild
  (scholarCombat 16/33 scholar deaths); villagers die in combat 58/114.
  Starvation 6 — the ranging road feeds itself but bleeds in the field.
- **Missing capabilities:** unchanged from the r26 read — no sanctuary
  semantics at haven (#87); no policy judges WHERE a wilderness flee
  leads when the r2 judgment has no safe exit (the corner this arm
  proved unreachable in practice).
- **Blanks filled:** (1) the #203 question is ANSWERED, not just
  documented: the wilderness refusal is unmeasurable because the r2
  directional judgment already covers the wilderness case — 279/279
  wilderness disengages pushed safe-home. The r26 refusal spec's
  wilderness half is superseded by the landed r2 judgment. (2) The
  wildrange substrate itself: an engine-honest early-game ranging policy
  (thicket/ruin/forest/grove legs, real travelTo + real checkEncounter,
  visible-monster engagement) — deleted per kill protocol, spec preserved
  in this evidence for any future arm that needs wilderness surface.
- **Blanks documented (open):** none new — the arm's question closed.

## Sense-testing (transcripts read)
Armed s22 (60d sense run, say/emit capture, 26 disengages, 0 refusals):
the wilderness disengage reads as **deliberate retreat, not panic**.
d33: the scholar is losing to a wave-3 Buffering at round 11 — "Travel 1
tile to trail edge." → "🚪 BARRIER CROSSED — you crash through to a new
area, but they're right behind you — through the barrier! (The edge of
the grid is an exit. The chase continues.)" — the chase continues
honestly (the Buffering follows: "The Buffering is flagging — it won't
follow much further."). Later: "Travel 1 tile to Haven." → "You walk
back into Haven. 16 Codex entries. The village is glad to see you." →
"🚪 BARRIER CROSSED — you crash through into Haven. The gate shuts
behind you. The wild goes quiet. (Haven is safe — nothing follows you
here.)" → "You escape. The thicket keeps its secrets." The scholar
survived the wave-3 encounter and learned: "You lived to tell it — the
Buffering's moves are burned into your memory. (1/2 — one more survived
encounter and you'll have its trick.)" — a person learning, not a
counter ticking.
**The refusal has no transcript voice** (0 firings) — metric-review item
4 above. Note for the record: the "Travel 1 tile to trail edge." beat is
honest but terse/mechanical next to the rich barrier-crossing beats.

## Convergence state: killed-at-pilot (unmeasurable)
Scale-onramp stays the blocking axis. Wall numbers this run (control,
wildrange road): national 0/8, table 0/8, wins 0/8, wave-4 3/8, wave-5
0/8, median 85d.

## Metric review (§14)
(To be written after the pilot.)

## Village assessment
(To be written after the pilot.)

## Sense-testing (transcripts read)
(To be written after the pilot.)

## Convergence state: —
Scale-onramp stays the blocking axis.

## What changed (files)
- `scripts/policies/fleedirectwild.js` — DELETED per kill protocol (was: the
  refusal layer, gate FLEEDIRECTWILD=1)
- `scripts/policies/wildrange.js` — DELETED per kill protocol (was: the
  ranging substrate, gate WILDRANGE=1; spec preserved in the evidence above)
- `scripts/policies/competent.js` — hook REVERTED, byte-clean vs HEAD
  (verified: `git diff` empty)
- `scripts/test-fleedirectwild-20261014.js` — NEW, kept (REAL RED→GREEN
  pre-kill; RED post-kill by design)
- `scripts/det-gate-fleedirectwild-20261014.js` — NEW, kept (16/16
  bit-identical pre-kill; INFO-SKIP post-kill)
- `scripts/sweep-fleedirectwild-20261014.js` — NEW, kept (SMOKE=1 gate
  pre-kill; INFO-SKIP post-kill; COMPARE=1 verdict from kept JSONs)
- `evidence/2026-10-14/fdwild-control.json`, `fdwild-armed.json` — kept
  (per-seed rows + aggregates; telemetry-check inputs)
- `evidence/2026-10-14/sim-fleedirectwild.md` — this file
