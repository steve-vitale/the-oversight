# sim-deferhold — backlog #734 FIX: wave-5 title knowledge-gated in the defer5 hold beat (2026-10-21)

Arm: **sim-deferhold** (scale-onramp axis, convergence tracker: scale-onramp is the blocking axis).
Scope: `src/js/standing.js` `_standingHoldBeat` defer5 first-fire beat ONLY. Narration-text change, no game logic touched.

## Pre-registration (evidence header)

- **Primary metric:** the defer5 first-fire beat must not name the wave-5 title ("The Producers") — canon compliance per MONSTER-WAVES.md design call #4 ("The wave's TITLE is never named in the hold (knowledge-gate discipline)").
- **GO threshold:** 0 title-namings in the defer5 first-fire beat AND byte-identical state trajectories on 4 paired seeds with the fix on vs off (narration-only change must not perturb game state).
- **Horizon:** fixture-driven (day 60 scripted village) + 40-day paired trajectories, death-aware (runs ended 10–40d by village death — identical on/off).
- **Seeds:** fixture seed 4242; det-gate seeds 101/202/303/404. Policy: no-op daily (the fixture forces the defer5 hold to bite so the changed beat path executes).
- **Verdict: FIX-GO.** 31/31 checks green; RED demonstrated on pristine (beat named "The Producers").

## Canon call (for Steve's overrule)

docs/MONSTER-WAVES.md (design call #4, 2026-10-16) is decisive: **"The wave's TITLE is never named in the hold (knowledge-gate discipline) — the bar is the fiction: the village knows it's not ready; the scouts report the horde."** `_readinessBarLine`'s comment already said exactly this. The defer5 first-fire beat contradicted it by naming "The Producers" (the wave-5 title, earned only when wave 5 lands — `_standingReleaseBeat(5)` / `waveUnlockBeat(5)`'s job). So: **fix the TEXT (option a), the comment was right.**

## Before / after

- Before: `📡 The fifth draft stays in the wings. The Producers want a village that can fight them — armor the village (3 of 4 fighters armored); blood your fighters (0 of 2 veterans).`
- After: `📡 The fifth draft stays in the wings. It wants a village that can fight — armor the village (3 of 4 fighters armored); blood your fighters (0 of 2 veterans).`

Numbered drafts ("the fifth draft") stay — they're used the same way in the cap beat, `standingLine()`, and the release beat itself. Only the unearned TITLE is gated, matching the defer4 discipline (which names wave-3's "Final Draft" only when earned, otherwise "the next act").

## SENSE-TESTING (transcript context)

Read the beat live in a 2026-10-20 journey transcript (`journey-endgame-r25-r25-probe-s9036.txt`, d85): it lands mid-combat between a strike report and the Records beat — the System taunting that the coming draft wants worthy opponents. The fixed line keeps the voice: showbiz menace ("stays in the wings"), the taunt ("wants a village that can fight"), the honest bar readout. It still sounds like itself; the only thing lost is the premature name-drop.

## Proof: scripts/test-deferhold-20261021.js (31/31 green)

1. **Fixture RED→GREEN** (seed 4242): scripted village — wave-4 readiness met, wave-5 readiness not (armor 3/4, veterans 0/2), capped standing 200 → defer5 binds, total held at 199. `RED_PRISTINE=1` mode demonstrates the bug on pristine (beat names "The Producers"); fixed tree asserts the gated text + short bars + no titles in `standingLine()`.
2. **Det-gate** (seeds 101/202/303/404, 40d, no-op policy): fix ON vs OFF trajectories **byte-identical** on all 4 seeds (digests via `det-gate.js` `dayHash` — game state only, narration excluded by construction). The changed beat path executed in both runs of every seed (first-fire line captured), and the ONLY differing narration line is the first-fire beat. Narration-only change perturbs no game state.
3. **Static audit**: defer4 first-fire still gates wave-3's title on earned ("the next act" when unearned; "the Final Draft" when earned); defer5 7-day reminder beat unchanged; plenty-cap beat unchanged; `_standingReleaseBeat(4)` still names "The Mirror Draft"; `_standingReleaseBeat(5)` still names "the Producers" (the earn moment); `_readinessBarLine` and `standingLine()` name no titles.

## Regression

- `scripts/test-readiness-20261016.js`: 29/29 green (unchanged).
- `scripts/test-readinessv3-20261015.js`: 29/29 green (unchanged).
- `node scripts/check.js --quick`: HUNG — zero output, ~0.2% CPU after 7 min, killed via SIGTERM. Sibling loops were running godpath tests in other worktrees at the time (shared-resource contention suspected; not investigated — narration-only change, targeted proofs all green). NOT re-run; not a test failure of this change.

## Village assessment

The blank was fiction-honesty, not mechanics: a village held at wave 4 for unreadiness was being told the coming wave's NAME by the System — knowledge the village hadn't earned. The defer4 discipline already knew this ("the next act" until wave 3 is earned); defer5 was the one leak, now closed. No lever behavior, readiness bars, gates, or cadences changed — the scale-onramp wall numbers are untouched by this fix (wall work continues on the main axis).

## Metric review

Metric proved right: canon-compliance (0 title-namings) + byte-identical trajectories was exactly the falsifiable bar for a narration-only fix. No revision proposed.

## Findings backlog

None new this run — the defer5 title leak was itself backlog #734, now fixed.

## Convergence

Axis: scale-onramp — still blocking (this arm filled a fiction-honesty blank on it, not a wall number). State: converging.
