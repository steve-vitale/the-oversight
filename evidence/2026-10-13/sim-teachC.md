# Lever C — redundant-teaching stop signal (teachC)

_evidence/2026-10-13/sim-teachC.md — 2026-10-13_

## Pre-registration (binding — MEASUREMENT.md §14)

- **Lever**: (1) game: `Game.teachPlant` becomes an explicit no-op with
  in-fiction feedback when the scholar already knows the plant at L1 (the
  name — the only level this primitive teaches); (2) policy: competent.js
  `teachRound` checks `Game.plantKnown(pid)` before offering.
- **Primary metric**: deliberate `teachPlant` verb calls per run.
  **GO = ≥40% reduction vs identical-seed baseline.**
- **Guardrail**: end-of-run codexP (codex plant breadth) — median after ≥
  median baseline. We cut redundancy, never learning.
- **Seeds**: 11/22/33/44/55/66/77/88 × belongseek + leadcourt + competent
  (the teaching-heavy policies) = 24 runs.
- **Horizon**: 180d death-aware (courtship-suite standard).
- **Files**: `src/js/game.js` (teachPlant gate), `scripts/policies/competent.js`
  (teachRound guard). No other game-code or policy changes.

## Redundancy definition (precise)

Redundant = scholar already knows the plant at L1 AND the lesson is a true
lesson (not wrong-teaching). Placed AFTER wrongTeaching on purpose: a FALSE
lesson is lie-counterplay (canon, Steve 2026-10-06), not redundancy. Depth
(L2+) never flows through `Game.teachPlant`, so nothing deeper is touched.
The no-op skips: encounters++, trust gain, 3 ticks, observe, villagerLearnsPlant.

## The feedback line

> 📖 Mara starts in on the lesson, then catches herself. "Hold on — I already
> showed you this one. Dandelion. You remember."

Sense-tested in a real transcript (proof test prints it): the teacher
deflecting a repeated lesson, relationship intact, no system-error energy.

## Results

24/24 runs completed both suites (identical seeds, 180d death-aware).

| run | baseline tp | after tp | reduction | baseline cxP | after cxP |
|---|---|---|---|---|---|
| median (paired) | 1201 | 0 | **100%** | 35 | 36 |

Deliberate `teachPlant` calls per run: **0 on all 24 after-runs**
(baseline range 721–3187). Median paired reduction **100%** (GO needed ≥40%).
End-of-run codexP: median **36 vs 35 baseline** — guardrail holds (no
knowledge lost; the eliminated calls were all no-ops or redundant).

Median survival (unregistered, watched): 86.5d → 101.5d — no regression;
if anything the verb savings buy time. Not a claim, just no red flag.

## GO verdict

**GO.** Primary metric crushed (100% ≥ 40%), guardrail passed (36 ≥ 35).
Proof test `scripts/test-teach-stopsignal-20261013.js`: RED verified on
unpatched code (redundant teach returned `true`), GREEN after (all 5
assertions: no-op + line, unknown teaches, partial proceeds, wrong-teaching
preserved, policy guard).

## Metric review

- The primary metric measured *policy call volume*, which the policy guard
  trivially zeroes (teachRound's candidates were all scholar-known by
  construction). The game gate's real value — in-fiction no-ops for redundant
  teaches reached via other paths (examine/learnFromShowing, haul moments) —
  is NOT captured by this metric. Next run: count stop-signal firings
  (the 📖 line) as the game-side metric.
- The 100% figure overstates the design win: it mostly reflects deleting a
  broken policy loop, not teaching working better. The "make teaching work"
  direction fix remains an open blank (below).
- Survival moved +15d median — worth watching in the next teaching lever to
  see if it's signal (less dead time) or noise.

## Blanks discovered (not chased)

- competent.js `teachRound` iterates the SCHOLAR's known plants and asks
  villagers who DON'T know the plant to teach — inverted twice over, so as
  written it can never teach anything new (every call is redundant or a
  teacher-doesn't-know no-op). Fixing the direction is a separate lever
  ("make teaching work"), out of this run's scope.
- `Game.teachVillager` is called by winseek.js/oracleV2.js but exists nowhere
  in src/js — dead calls, never fire.
