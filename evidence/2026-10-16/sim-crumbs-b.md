# sim-crumbs-b — CRUMB-FIX tuning arm for finding #121 (2026-10-16)

ARM: food-economy axis, game-code tuning. Worktree: sim-crumbs-b.

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binding)

- **Lever**: CRUMB-FIX — tune the `pantryDraw` floor1 crumbs break
  (src/js/game.js). Steve's ruling 2026-10-14 on finding #121: the
  no-fractionating rule STANDS, but the floor1 rounding that starves
  villagers with food in the pantry is a TUNING BUG — hungry villagers
  should just take the full piece. The old branch
  (`if (!drewAny) units = 1; else { stoppedForCrumbs = true; break; }`)
  refused the whole piece once anything was drawn. New: still-hungry
  villagers take the full piece whole (pieces stay indivisible); the
  urgency-first/size-second sort (slabs last) bounds the extra take to one
  non-slab piece in the common case. Gate: CRUMBFIX=1 (measurement default
  OFF); landed default-ON with '0' opt-out (dawnrefuse pattern).
- **Primary metric**: crumbs-left starved-villager-days 7 → 0 on the
  sharcensus census shape (seeds 11/22/33/44/55/66/77/88 ×
  leadcourt/belongseek, 180d death-aware). A miss is NO-GO, never re-scored.
- **Guardrails**: empty-pantry share not worse than control; national ≥
  control−2; median survival ≥ control−10d; no new death mode; no new
  starvation-path inflation.
- **Horizon**: 180d death-aware (pacing-law max). Dead villages stop (+10d tail).
- **Substrate**: FEASTSCALE_R13=1 both sides (pre-registered; no-op in this
  tree — the gate exists only in sibling scripts, not in this tree's src).
  Own paired control, identical seeds. Policies: leadcourt + belongseek
  (the census shape, competent-player policy family per MEASUREMENT §10).
- **Staging**: proof test RED→GREEN→det-gate→SMOKE first; pilot 8 runs
  (4 seeds × 2 policies) control vs armed; confirm = full 16-run census
  shape control vs armed. Kill at pilot if the primary doesn't move or any
  guardrail breaks.

## Proof test (scripts/test-crumbs-20261016.js)

- **RED** (pristine, PHASE=red): s66-d46 fixture (want=1218, pantry one
  500-kcal piece + 4×2000 = 8,000 fresh kcal, each bigger than the remaining
  718 want): taken=500, remaining=718, 8,000 fresh left, shortOfFresh=false,
  no crumb take. The bug reproduces: hungry with a full pantry, refused.
- **GREEN** (CRUMBFIX=1, PHASE=green): full 2000 piece taken whole
  (taken=2500, crumbTakes=1, one indivisible unit); !drewAny whole-piece
  case unchanged; slab-only crumbs take the whole slab (!drewAny path).
- **GATEOFF** (fix installed, CRUMBFIX unset): byte-identical fixture
  behavior to RED — the gate changes nothing when off.
- **DETGATE** (2 seeds × 2 policies × 40d, sharcensus instrument): pristine
  vs gate-off canonical row JSON **byte-identical** (md5 match).
- **SMOKE**: harness boots, gate default OFF, CRUMBFIX=1 takes the piece.
- RED-verification used the patch dance (`git diff > patch; checkout HEAD`;
  re-apply) — never git stash on the hot shared repo.

## Pilot (8 runs: seeds 11/22/33/44 × leadcourt/belongseek, 180d death-aware)

Pilot CONTROL (CRUMBFIX unset), 2026-10-16:
- leadcourt: n=4, won=0, medD=180, maxD=180, nat=4, tab=0, maxWave=4, hungry=0
- belongseek: n=4, won=0, medD=122, maxD=180, nat=3, tab=0, maxWave=3, hungry=9
- starved days: 3 total, ALL `away-pack-empty` — **zero crumbs-left on the
  pilot seeds**. The pilot seeds cannot adjudicate the primary; they screen
  guardrails only. The primary is adjudicated at confirm (full 8-seed shape,
  where the 7 crumbs-left were measured).
- Full per-run: [leadcourt s11] 180d survived wave4 global; [s22] 149d
  village-lost wave4 national; [s33] 180d survived wave4 global; [s44] 180d
  survived wave2 national; [belongseek s11] 180d survived wave3 global;
  [s22] 122d village-lost wave3 national; [s33] 87d village-lost wave3
  national; [s44] 106d village-lost wave3 regional.

Pilot ARMED (CRUMBFIX=1), 2026-10-16:
- leadcourt: n=4, won=0, medD=180, maxD=180, nat=4, tab=0, maxWave=5, hungry=8
- belongseek: n=4, won=0, medD=180, maxD=180, nat=4, tab=0, maxWave=4, hungry=4
- starved days: 7 total — 6 on `away-pack*` (packMeal, untouched by this arm),
  1 `empty-pantry` (Lena, leadcourt-s33 d149, ate 24/1329, desperation-spoiled
  path). crumbs-left: 0.
- Guardrails: national 7→8 ✓ (≥5); medianDays 180→180 ✓ (≥170);
  per-meal pantry draw 88.5→90.3 kcal (+2%); sharing gaveK 4552→6165k (+35%).
- Drain audit (one-off wrapper, s33 leadcourt 180d armed): 634 pantryDraw
  calls, 61 crumb-take firings (9.6% of meals), 21,956 kcal = 3.21% of total
  pantry throughput. The extra cost is bounded and small.
- s33 autopsy: the armed village collapsed d120→d130 from 10→3 villagers
  (combat massacre: 12 villager-combat + 29 combat + 10 monster + 5 expedition
  deaths); the pantry was 53k at d120 and healthy until the producers died.
  Lena's d149 empty-pantry starvation happened with 2 villagers left — the
  village was already combat-dead. The fix did not starve it.
- New rare death causes in armed (sickness, Buffering, The Moderator,
  starvation ×1) vs control-only (The Understudy, Choir Toad): single-
  occurrence flips at n=8/side — noise, not a systematic new mode.

PILOT VERDICT: GO to confirm. The primary cannot move on the pilot seeds
(bug absent in control); guardrails hold on the measures that matter, the
mechanism cost is measured at 3.2% throughput, and the one collapse is
combat-driven with a healthy pantry until the massacre.

## Confirm (full 8-seed census shape, 16 runs/side) — COMPLETE (recovery run 2026-10-16T0955Z)

32 runs: seeds 11/22/33/44/55/66/77/88 x {leadcourt, belongseek} x {control (CRUMBFIX unset), armed (CRUMBFIX=1)}, 180d death-aware, FEASTSCALE_R13=1 both sides (no-op in the sweep path — policies don't compose it; identical both sides), paired on identical seeds. Proof re-verified on the new master base before the sweep (counterwire landed since the pilot): RED/GREEN/GATEOFF all green, DETGATE byte-identical md5 32815bf64ac6e5bf81496c58bed8ea3a (pristine vs gate-off, 2 seeds x 2 policies x 40d).

| metric | control | armed | bar | verdict |
|---|---|---|---|---|
| crumbs-left starved-days (PRIMARY) | 1 | 0 | 7 -> 0 | NO-COVERAGE (control produced 1, not 7 — substrate moved since the original census) |
| empty-pantry share (guardrail) | 0.25 (3/12) | 0.556 (5/9) | not worse | MISS |
| national (guardrail) | 14 | 15 | >= 12 | GO |
| medianDays (guardrail) | 180 | 180 | >= 170 | GO |
| new death mode (guardrail) | — | Buffering x1, The Moderator x1, wound x3, The Reunion x1 (all single-seed) | none | GO (noise per pilot precedent; death shape combat-dominated both sides) |
| starvedDays (guardrail: no starvation-path inflation) | 12 | 9 | not worse | GO |

The one control crumbs-left (belongseek-s44 d162: ate 566/1010, pantry full): the armed twin has 0 starved days and survives 180d — the fix works exactly where the bug appears.

s88 autopsy (the guardrail miss, mechanism identified): armed leadcourt-s88's pantry sat ~17–26k fresh d95–101 (control twin: 35–52k, 8 villagers vs armed 5–7 — trajectories diverged early via the fix's butterfly). At d106, on a 5,626-kcal pantry, Raj (want 1,459) and Emilio (want 1,716) each took a whole 2,813-kcal piece under the fix and ate 3,993 / 4,414 — pantry 5,626 -> 0 in one day. d107–111: desperation-spoiled, 4 empty-pantry starvations in the dying tail (village-lost d115). Under the old code those two meals take nothing (stoppedForCrumbs) and the pantry survives for the next villager. The fix converts one villager's crumbs-left starvation into pantry depletion that starves others — on MARGINAL pantries the whole-piece take is the lethal move. Cost mode is real, mechanical, and concentrated in the marginal-pantry regime.

CONFIRM VERDICT: NO-GO per binding §14 — the empty-pantry-share guardrail missed on the letter (0.25 -> 0.556), mechanism confirmed. Layer KILLED per kill protocol: src/js/game.js reverted to HEAD (byte-identical), instruments + evidence retained. The bug Steve ruled on stays open; the next arm is the guarded variant (whole-piece take only when the pantry stays above a floor), spec'd in the findings backlog.

## Sense test

The proof's GREEN-phase fixture beat reads honest as a player: "Nino draws a 500-kcal cut, still hungry for 718 — the pantry holds four 2000-kcal pieces. The old rule refused them; the fix takes one whole 2000 piece. He eats 2500 against a 1218 need — over-fed by one indivisible piece, never a broken one. That is the ruling, literal." No silent branches; the over-feed is narrated as over-feed. The s88 cost mode is mechanical (pantry depletion), not narrative — nothing dishonest in the beats, the harm is in the ledger. Sense: PASS on honesty; the design question is the ledger trade, not the voice.

## Metric review (§14)

Two doubts, both for the NEXT run (no mid-run re-scoring — this run is NO-GO as pre-registered):

1. The primary (crumbs-left 7 -> 0) did not reproduce its effect size: the original 7/44 was measured on an older substrate; on current master the same 16-run shape yields 1 crumbs-left in control. The event is now rare (food-economy levers landed since). Future arms on this bug should pre-register a fixture-anchored primary (the RED fixture proves the mechanism) plus guardrail-led sweep adjudication, or a richer census (more seeds) to recover event count.
2. The empty-pantry-share guardrail penalizes the fix's intended mechanism by construction: the fix converts crumbs-left starvations into takes, and on marginal pantries into empty-pantry starvations. The share denominator (starvedDays) also shrank 12 -> 9 because the fix worked. A design-honest guardrail set: absolute starvedDays not worse (12 -> 9 GO), max per-seed starvation delta (s88: 0 -> 4, the heterogeneity lens), and a marginal-pantry floor probe. Proposed revision for the guarded-variant arm.

## Blanks filled / documented

- Finding filed (sim-findings.md): the marginal-pantry cost mode of the literal whole-piece take, with the s88 autopsy and the guarded-variant spec (next arm). Steve-call candidate: the guard refines how his ruling is implemented, not the ruling itself.
- The sharcensus census shape's crumbs-left event rate is now 1/16 runs (was 7) — documented for future food-economy arms: the bug is rare on current master, fixture-anchored testing carries the mechanism proof.
