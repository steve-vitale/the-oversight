# sim-barwhy-b — PRE-REGISTRATION (committed before any after-measurement)

Run: fleshout-loop-b-20261028T0630Z, axis food-economy, arm sim-barwhy-b.
Worktree branch: sim-barwhy-b. Background: evidence/2026-10-28/sim-onceaday-scope-b.md
(prior loop-B run): the action bar renders disabled buttons + effect text, NOT the
why reason; legacy time_skip/echo_location rows carry why 'Used today.' even when
enabled. Named blank: the bar shows the why reason.

## Fix scope (only this)

1. `src/js/app.js` `abilityBarHTML`: render the row's `why` reason on DISABLED
   buttons only (visible text span, same style family as the desc span; also
   included in the button title). Enabled buttons render no why.
2. `src/js/abilityActions.js` `_legacyActivatables`: a row's `why` is null when
   the row is available, and carries the refusal reason only when disabled.
   Named rows: time_skip, echo_location ('Used today.' when used, null when
   live). Same stale-why pattern in sibling legacy rows (blood_magic,
   field_medicine, herbal_remedy, purify, compost_king) is fixed by the same
   rule — an enabled row must not carry a refusal sentence — because the
   primary metric below judges EVERY enabled button, not just the two named.
   Cannibal_frenzy already follows the rule (null when available); dowsing
   carries no why. Data-driven / god / keepsake rows already emit
   why=null when available via `_actionAvailable` returning `{ok:true}`.
3. Explicitly NOT changed: any action's enabled/disabled state, any precheck
   logic, any narration text (why strings are surfaced verbatim, never
   reworded), calm_beast targeting (separate future arm — calm_beast stays
   disabled with its existing reason, only made visible), the DEAD hardcoded
   `activatableAbilities` copy in game.js (marked unreachable, kept until a
   --force-delete cleanup is approved — touching it is scope creep).

## Primary metric: why reason visible and honest

GO iff ALL hold:
(a) Across the documented action set (prior arm's target=null table plus all
    legacy rows, in flag-set and flag-unset / condition-met and condition-unmet
    states), every DISABLED button's rendered bar HTML carries its why reason
    text verbatim (HTML-escaped form).
(b) Every ENABLED button carries no stale why: row why is null/empty AND its
    rendered bar HTML contains no why text.
(c) Availability parity: no action's enabled/disabled state changes vs the
    before snapshot on any fixture (identical seeds, identical fixture setup).
(d) An 8-seed pilot band (competent-player policy, 100d death-aware cap, same
    seeds before/after) completes 8/8 with no crash; wall numbers
    (national/table/wins, wave 4-5 reach, median survival) reported before/after.
    Expectation: identical before/after, since availability, prechecks, costs
    and narration are untouched — the band is a regression guard, not an
    effect measurement.

Fixtures: seeds 9981 + 9982 (same as the prior arm), fixture setup mirroring
scripts/test-onceaday-scope-b.js (granted abilities, conversation on/off,
flag set/unset, pack carcass present/absent, dispute present/absent, health/
sickness/poison states). Before snapshot: scripts/test-barwhy-b.js in dump
mode on unmodified code, saved to /tmp (ephemeral) and quoted in the evidence
file. After run: same script in assert mode against the same before snapshot.

## Judgement standard

"Honest" is judged against the UI tap path (the bar passes no target), same
standard as the prior arm. The calm_beast button remains disabled with
"Nothing here to calm." — visible now, still dishonest about the room in the
prior arm's sense; that dishonesty is NOT this arm's to fix and is NOT counted
against GO leg (a), which requires the reason to be VISIBLE, not the state to
become true. Leg (c) is what guards against smuggling a targeting fix in.

## Metric review (to be filled at verdict time)

Doubts for the NEXT run, not this one: none pre-registered. If the bar's
rendered HTML cannot be proven from node (app.js is DOM-only and excluded
from the node harness), the render half of legs (a)/(b) is proven by
evaluating the REAL abilityBarHTML function source extracted from app.js
against stubbed Game/esc — stated plainly in the evidence file, not hidden.
If scripts/balance-panel.js cannot ingest the fixture/band corpus, that is
stated explicitly (standing panel exception) rather than faking a panel
artifact.
