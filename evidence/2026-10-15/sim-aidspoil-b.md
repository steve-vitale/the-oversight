# SIM-AIDSPOIL — aid-only spoil-first drawdown (ARM 1, loop B, food-economy #273)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-aidspoil
Axis: food-economy (scale-wall lens) — claims sim-findings #273 (the
verb-specific correction of #199's refuted blanket prescription).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the sim-spoilfirst arm (KILLED AT PILOT, evidence
  evidence/2026-10-15/sim-spoilfirst-b.md) proved blanket spoil-first
  drawdown INVERTS rot (absolute fresh-rot 412.6k → 1418.6k, 3.44x;
  rot/vd 69 → 165, 2.40x). Its autopsy measured the mechanism: the
  spoil-first TRIBUTE taxes the fresh FLOW and leaves the preserved
  SAVINGS to accumulate and rot (56k of preserved rot on the worst
  seed); the control's least-perishable-first tribute taxes the
  savings the fresh-first meals never get to. #273's CORRECT DESIGN:
  aid (tendLink) = soonest-spoiling-first (humanitarian: feed the thin
  subordinate the food that needs eating); tribute (payTribute) =
  least-perishable-first (extractive: tax the stockpile, leave the
  flow). This arm isolates the aid effect: aid-ONLY spoil-first in game
  code, tribute pinned to the default ordering. The spoilfirst pilot's
  lead road was near-neutral (rot/vd 94 → 100, 52 aids) with the
  tribute confound; overdraw4's policy-side fresh-first aid proved 2x
  (confirm 0.503/0.503). The aid-only question is open, not proven.
- **Lever (game code, src/js/hierarchy.js)**:
  `_removePantryKcal(kcal, opts)` gains an opts.spoilFirst variant —
  same spoilDay-ascending sort, but the draw starts at the
  SOONEST-SPOILING end (pantryDraw's ordering) instead of the
  least-perishable end. Already-spoiled stacks are skipped via the
  canonical isSpoiled boundary (aid must not pay rot as grain).
  Whole-unit honesty unchanged; emptied stacks are swept in a
  post-loop in-place pass (forward iteration cannot splice mid-loop —
  fixed during construction, proved by G10). Env-gated:
  `_spoilFirstDrawdown()` reads SPOILFIRST=1 (default OFF, browser-safe
  typeof guard). ONLY tendLink (the aid verb) passes
  `{ spoilFirst: this._spoilFirstDrawdown() }`. payTribute is PINNED
  to the default least-perishable-first ordering (no opts, comment
  at the call site); every other _removePantryKcal caller keeps the
  long-standing ordering. `hostFeast` already drains via pantryDraw —
  untouched.
  - Canon check: docs/CANON.md + docs/PRESERVATION.md read. Binding
    lines honored: "Rot can't be smoked back into food" (spoil-first
    skips already-spoiled stacks — G12 proves it); "No nonsensical
    calorie loss" (conservation — G10 proves kcal in = kcal out). No
    canon doc covers draw ordering; the ordering follows pantryDraw's
    documented fresh-first rule, not an invented one.
- **Driver (instrument, scripts/policies/aidspoil.js, AIDDRIVER=1,
  default OFF)**: the overdraw4 verb spec with HONEST engine calls (no
  pre-draw trick — the mechanism lives in game code now). Wraps
  leadfeast (the r13 road, aid-dominant) as aidLead. Fresh-days > 4 +
  siege-gate clear → ONE verb/day, priority AID (tendLink on a thin
  subordinate: sub pantry < 5d of need, untended this week, not
  mourning) > FEAST (hostFeast under the r13 allowance chain via
  allowgate2.feastCandidate + the overdraw floor cost ≤ fresh −
  2×burn). NO tribute verb (overdraw4 G7: tribute TIMING was the
  overdraw3 harm channel; the tribute runs on the base discipline's
  own rhythm). Floor: never below 2 fresh-days (maxDrawdownKcal =
  fresh − 2×burn). Siege-gate: lingerer / gorge-night-trailing-7d /
  raid-7d hold all verbs off (asGateHeld counted). Cause lines follow
  CONFIRMED verbs only ([needs-eyes] on the commit — new
  player-facing narration, inert unless AIDDRIVER=1).
- **Conditions**: CONTROL = AIDDRIVER=1 only (driver fires aid/feast
  with the CURRENT least-perishable-first aid ordering). ARMED =
  AIDDRIVER=1 + SPOILFIRST=1 (same driver, spoil-first aid ordering).
  The measured delta is the aid ordering and nothing else. The feast
  verb is ordering-identical on both sides (pantryDraw natively) — a
  built-in constant. The tribute keeps its ordering on both sides —
  the arm's thesis. FEASTSCALE_R13=1 (the leadfeast road as briefed).
- **PRIMARY**: lead-road fresh-rot kcal, armed ≤ control × 0.85
  (identical seeds).
- **GUARDRAILS**: median ≥ control−10d; national ≥ control−2/8;
  starvation deaths ≤ control+2; rot per villager-day ≤ 1.335x (rate
  form per sim-findings #126 — never absolute kcal); no new death
  mode (n≥3 per #216).
- **SECONDARY**: drawdown events (aid/feast counts + kcal), per-day
  rot, fresh-days distribution, pantry peaks, overstock cliffs
  (>10k/d), table/national/wins, wave-4/5 unlocks, gorge nights,
  tribute kcal.
- **Horizon**: 180d death-aware (pacing-law max; dead villages stop —
  the rot measured is rot the village lived to produce, not death-tail
  artifact beyond the +10d tail).
- **Seeds**: pilot 11/22/33/44/55/66/77/88 × aidLead = 8 runs/side,
  IDENTICAL seeds control vs armed. Control RE-MEASURED in the SAME
  sweep (never inherit a baseline — #247). Confirm 12–16 only on
  pilot GO (fresh seeds). Both sides on current master WITH the landed
  prodthrottle — the question is the aid ordering delta on top of it.
- **Det-gate**: 8/8 bit-identical per condition (16/16),
  scripts/det-gate-aidspoil-20261015.js — before trusting any
  comparison. SMOKE=1 honesty gate before measuring (named-export
  unwrap — the prodthrottle lesson).
- **Metric-review note (§14)**: the starvation guardrail here is +2
  (wider than overdraw4's +1) because the ordering change does not
  touch the floor or the verb timing — the harm channel overdraw4
  named (the 2-day floor + aid→feast ratchet) is UNCHANGED by this
  arm, so the arm is not expected to fix it; the guardrail watches
  for ordering-specific harm (e.g. spoil-first aid systematically
  draining food the village would have eaten tonight). If the floor
  harm reproduces, the arm dies on the guardrail honestly.

## Proof results (run BEFORE any sims)

RED (gates off) — real RED phases, all pass:
- R1 gate-off byte-identical: aidLead == leadfeast (33/33 seed 11 —
  village died d33, death-aware; 40/40 seed 22).
- R2 no verbs fire gate-off on the overstock fixture (6.3 fresh-days);
  the parent's own tend discipline still fires (pantry 150000→148500).
- R3 NAIVE RED (the foil): _removePantryKcal on the 3-stack fixture
  drains the +30d stack first (A=100 B=100 C=97) — documents the
  current engine behavior for non-aid callers, proves the fixture
  discriminates.
- R4 tendLink drains least-perishable first with SPOILFIRST unset
  (A=100 B=100 C=97); gate reads OFF.

MID (AIDDRIVER=1 only — the control condition):
- M1 the driver fires aid via the honest tendLink verb (asAid=1,
  1500 kcal); the aid drains least-perishable-first (A=100 B=100
  C=97) — the control ordering is the current engine behavior.
- M2 game gate reads OFF; cause line narrated after the engine beat.

GREEN (AIDDRIVER=1 + SPOILFIRST=1):
- G1 AID fires fresh-first via honest tendLink (no pre-draw):
  asAid=1, 1500 kcal; the +2d stack drained first (A=97 B=100 C=100);
  sub pantry 1000→2500 (subaid channel, real food); trust 30→38;
  haven pantry lighter by exactly the aid (150000→148500); cause
  line AFTER the engine beat (tend@0 cause@1 — honesty ordering
  pinned); floor respected (6.2 fresh-days); one verb/day marked;
  gate reads ON.
- G2/G3/G4 siege-gate: lingerer / recent-raid (lastRaidDay=28, day=30)
  / gorge-night-trailing (day 29, day 30) all hold verbs off; hold
  counted (asGateHeld=1).
- G5 floor math: maxDrawdownKcal = fresh − 2×burn (2143 at the unit
  fixture; 102143 on real overstock).
- G6 FEAST fires when no aid channel: asFeasts=1, 5000 kcal real
  pantry draw (150000→145000), cause narrated, floor respected (6.1d).
- G7 DRIVER NEVER PAYS TRIBUTE (negative assertion): owed belong-side
  link on an overstock pantry — no asTribute counter, no
  early-tribute cause line, tributePaidWeek untouched.
- G8 priority aid > feast: dusk upkeep yields the feast when an aid
  channel exists (asFeasts undefined); the aid fires in daily
  (asAid=1); exactly one verb/day.
- G9 TRIBUTE PINNED (the arm's thesis): with SPOILFIRST=1, payTribute
  STILL drains least-perishable-first (A=100 B=100 C=97) — the
  extractive verb keeps its ordering even when the gate is armed.
- G10 CONSERVATION: pantry 11000→9000, removed=2000 — kcal in = kcal
  out; whole units from the soonest stack (4×500, A.units 7→3); other
  stacks untouched; no emptied stacks linger (the post-loop sweep).
- G11 NARROWNESS: with SPOILFIRST=1, a bare _removePantryKcal (no
  opts — the diplomacy-verb call shape) still drains
  least-perishable-first (A=100 B=100 C=97). The gate does not leak
  to non-drawdown callers.
- G12 SPOILED SKIPPED: spoil-first never pays already-spoiled stacks
  (RotA=10 untouched, soonest-good B drained 10→7) — pantryDraw's
  honesty boundary.
- G13 armed determinism: aidLead bit-identical across runs (33 rows).
RESULT: all checks passed (RED, MID, GREEN), independently re-run.
Det-gate 16/16 + SMOKE=1 below, before trusting comparisons.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, aidLead seed 33, 120d: 23 drawdown beats. The aid
beats are the engine's own tend beats (named subordinates —
Emberhold, Stonebridge, Thornfield; honest varying amounts
1,500/1,600/1,618/1,540 from whole-unit over-removal) interleaved
with the driver's cause lines, fired after confirmed verbs:
- "🌾 Haven sends 1,600 kcal of grain to Stonebridge's fire — not
  tribute, the other way around. Someone's grandmother over there
  will remember who fed her. (Trust +8.)" (d27)
- "🌾 Haven's shelves hold ~5 days of fresh — more than the village
  eats before it turns. The surplus goes to Emberhold's fire, not
  the rot." (d42; ~3d at d44 as the pantry thins — the count is
  post-draw, honest)
- "🍖 The shelves groan — ~6 days of fresh on hand, and the rot is
  already circling. We eat the mountain tonight, or it eats itself."
  (d41)
They read as a village deciding — the why after the what, thinning
counts, named recipients. Nothing robotic in the driver's lines.
**Documented blank (out of arm, pre-existing)**: the engine's own
tend beat ("Someone's grandmother over there will remember who fed
her. (Trust +8.)") repeats byte-identically on every tend — 13+
times in 120 days. The line is fine once; the repetition is the
blank. Not chased this run.
**PASS** (with the documented blank).

## Pilot results

8 runs/side, identical seeds (11/22/33/44/55/66/77/88 × aidLead),
180d death-aware, FEASTSCALE_R13=1. Det-gate 16/16 + SMOKE green both
sides before trusting comparisons.

| metric | control (AIDDRIVER=1) | armed (AIDDRIVER=1 + SPOILFIRST=1) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**) | 798.5k | **1055.0k** | **MISS** (need ≤ 678.7k; ratio **1.321**) |
| rot/villager-day | 115 | **175** | **MISS** (need ≤ 153.5; ratio **1.522**) |
| median survival | 99d | 83d | **MISS** (need ≥ 89d) |
| national | 4/8 | 3/8 | ✓ (≥ 2) |
| table | 1/8 | 1/8 | — |
| wins | 0/8 | 0/8 | — |
| wave-4 unlocks | 6/8 | 5/8 | — |
| wave-5 unlocks | 3/8 | 4/8 | — |
| hungryDays | 14 | 12 | — |
| starvation deaths | 3 | **6** | **MISS** (need ≤ 5) |
| drawdown verbs | 47a/22f (155k) | 42a/17f (126k) | mechanism fires |
| siege-gate holds | 1383 | 1339 | gate live |

Per-seed armed/control fresh-rot ratios: s11 1.00, s22 1.70, s33
0.85, s44 2.84, s55 0.61, s66 0.31, s77 0.13, s88 1.00. The effect
direction FLIPS by seed (0.13–2.84) — the aggregate 1.32× is driven
by the two big-rot seeds (s22, s44); the moderate-rot seeds (s66,
s77) went the other way. This is seed-noise dominance, not a clean
directional signal — but the pre-registered primary is aggregate,
and it missed. No re-scoring.

**Verdict: KILLED AT PILOT per §14.** The primary missed (1.32×,
not ≤0.85×), the rot/vd guardrail breached (1.52× vs the 1.335
band), starvation doubled past the +2 guardrail (3→6), and the
median guardrail breached (83d vs ≥89d). No confirm spend — the
pilot is not a sniff-test miss, it is a miss plus harm signatures.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| pilot control | 4/8 | 1/8 | 0/8 | 6/8 | 3/8 | 99d | 180d |
| pilot armed | 3/8 | 1/8 | 0/8 | 5/8 | 4/8 | 83d | 180d |

Exiled: 0 everywhere. The scale wall is not broken by this arm (and
the arm is killed). TELEMETRY CHECK (same-run investigation item):
`telemetry-check.js` vs the scale-wall baseline reports LOUD —
"national swung -62%: baseline 8 → current 3 (n=8 files)". The armed
pilot's 3/8 national sits inside its own control's guardrail (4/8,
≥2) but below the scale-wall baseline's 8 — worth the next
scale-wall run's attention, not this arm's (killed).

## Death-cause shares

The per-seed JSONs did not capture per-cause death shares (the
instrument's `result.samples.deaths` came back empty — an instrument
gap, documented below). What is measured: starvation deaths 3→6
(guardrail ≤5, MISS). No death mode reached n≥3 on either side in
the captured data, so no new-mode verdict can be drawn — the
starvation count alone is the harm signal. The median drop (99→83d)
is consistent with the starvation doubling, not a separate mode.

## Village assessment (plain words)

Eight villages per side on the aid-dominant road, and the story is
muddle, not mechanism. On both sides the pantries behaved the same
way — lean in the lean seeds, clogged in the fat ones — because the
aid verb is a small tap (42–47 aids, ~130–155k kcal) next to a
pantry that swings 2k to 513k of rot on its own weather. The
spoil-first aid took the food that was about to turn and fed it to
Emberhold and Stonebridge, exactly as designed; the villages that
were already drowning in fresh (s44, s22) drowned deeper, and the
villages that were scraping by (s33, s88) scraped thinner — two of
them starved where their control twins didn't. The ordering change
is not a lever on rot here; it is a reshuffling of which mouth eats
the almost-turning food, and the reshuffle has no reliable
direction. The lead road's near-neutral from the killed spoilfirst
arm (94→100 rot/vd) was the honest preview: the aid effect is
noise, and overdraw4's 0.503 belonged to a different mechanism
(the policy-side pre-draw), not to this ordering.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the game-code aid-only spoil-first
  drawdown ordering — src/js/hierarchy.js `_removePantryKcal(kcal,
  {spoilFirst})` + `_spoilFirstDrawdown()` gate (SPOILFIRST=1,
  default OFF), tendLink opts in, payTribute pinned to the default
  ordering. REVERTED byte-clean via patch file (never stash; patch
  kept at ~/workspace/patches/sim-aidspoil-revert-20261015.patch);
  the driver scripts/policies/aidspoil.js DELETED per kill protocol.
  Kept as instruments: scripts/test-aidspoil-20261015.js (RED/MID/
  GREEN, all pass; INFO-SKIP when the driver is absent),
  scripts/det-gate-aidspoil-20261015.js (16/16; INFO-SKIP),
  scripts/measure-aidspoil-20261015.js (INFO-SKIP),
  scripts/sense-aidspoil-20261015.js (INFO-SKIP), this evidence file
  + per-seed JSONs/logs under evidence/2026-10-15/.
- **FILLED (instrument)**: the honest-engine-call drawdown driver
  pattern rebuilt for the aid-only variant (driver-first preemption
  in daily/upkeep; the aid preempts the base's weekly tend via
  tendedWeek idempotency); the forward-iteration emptied-stack sweep
  (the in-loop splice bug caught during construction, proved by G10);
  the 100-unit 3-stack fixture; the aid-channel-open pre-check that
  lets the feast yield to a pending aid (G8).
- **FILLED (game-code correctness)**: the forward-iteration splice
  hazard in _removePantryKcal — draining emptied stacks with
  splice(i,1) while iterating forward skips the stack that shifts
  into the removed index. Fixed with a post-loop in-place sweep
  (order- and identity-preserving; the default path is byte-identical
  to the old in-loop splice). The layer is reverted, but the finding
  is recorded for any future ordering work.
- **DOCUMENTED** (backlog): (a) the aid-only spoil-first game-code
  ordering does not move rot on the leadfeast road — aggregate 1.32×
  with seed-flipping direction (0.13–2.84), starvation 3→6, median
  99→83d; #273's "aid = soonest-spoiling-first is CORRECT" now rests
  only on overdraw4's policy-side pre-draw mechanism, which is a
  different mechanism (pre-draw vs in-engine reorder) — the design
  claim needs a new proof, not this ordering; (b) the engine's tend
  beat repeats byte-identically on every tend ("Someone's
  grandmother..." × 13+ in 120d) — a voice-repetition blank,
  pre-existing, out of arm; (c) the measure instrument's
  per-cause death shares came back empty (result.samples.deaths) —
  the next food-economy arm should fix the instrument or drop the
  "no new death mode" secondary to starvation-only; (d) the
  telemetry-check LOUD line (national 8→3 vs the scale-wall
  baseline) belongs to the next scale-wall run's investigation list.

## Metric review (§14)

1. **KILL stands — primary missed (1.321 vs ≤0.85) and three
   guardrails breached (rot/vd 1.522 vs 1.335; starvation 6 vs ≤5;
   median 83d vs ≥89d).** No re-scoring. The per-seed
   heterogeneity (0.13–2.84) is mechanism analysis, not a
   friendlier metric — the pre-registered primary is aggregate.
2. **The per-vd guardrail did its job again.** Absolute rot alone
   (1.32×) is modest; the per-vd form (1.52×) shows the mechanism
   is real, not a longevity confound (median fell, so longevity
   cannot explain the rot rise).
3. **The starvation guardrail (+2) fired on real harm.** Seeds 33
   and 88 starved 0→2 each on the armed side — the spoil-first aid
   drained food the village would have eaten tonight on fragile
   pantries. This is the exact ordering-specific harm the metric
   review note named as the watch item.
4. **The "own control in the SAME sweep" rule mattered again.**
   This arm's control (leadfeast road, AIDDRIVER=1: 798.5k) is
   nothing like the killed arm's control (leadcourt/belongseek,
   SFDRIVER=1: 412.6k) — the road and the r13 layer move the
   baseline more than the lever. Inheriting a baseline would have
   wildly misread the delta.
5. **Finding #273's design claim is weakened, not refuted.** The
   killed spoilfirst arm proved the TRIBUTE half (tribute must stay
   least-perishable-first — that stands, G9 re-proved the pin).
   The AID half ("aid = soonest-spoiling-first is CORRECT") was
   tested here in its game-code form and killed. overdraw4's 0.503
   remains, but it is a policy-side pre-draw mechanism, not this
   ordering — the design claim needs a new, mechanism-honest proof.

## Convergence state

food-economy: **killed-at-pilot** (aidspoil). The game-code
aid-only spoil-first drawdown ordering is dead: routing tendLink
through soonest-spoiling-first (tribute pinned to the default
ordering) moved aggregate absolute fresh-rot 1.32× the wrong way
(798.5k→1055.0k), per-villager-day rot 1.52× (115→175, breaching
the r25b guardrail), starvation 3→6, median 99→83d — with the
effect direction flipping by seed (0.13–2.84), i.e. noise, not a
lever. Layer reverted byte-clean; driver deleted; instruments kept
as INFO-SKIP. food-economy stays `converging`; prodthrottle remains
the only landed rot lever.
