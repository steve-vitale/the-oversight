# Prereg — raid-siege density cooldown SHIP (build-smallfixes, 2026-11-05)

## Question

The raid-siege density cooldown was built and measured GO on 2026-10-15
(sim-raiddensity: young-national clusters 26 → 0, guardrails green) — but
it still ships behind the `RAIDDENSITY=1` env gate, which is OFF by
default and can never be on in the browser (`process.env` does not exist
there). The s77 terminal shape (3 night raids in 5 days on a 16-day-old
national with a healthy polity) can therefore still happen in live play.
Does removing the gate — shipping the proven cooldown as live behavior —
reproduce the Oct 15 effect on current master, without anything else
moving?

## The fix (game code, no policy change)

Remove the env gate: `_rdOn()` returns true unconditionally. Everything
else is the Oct 15 design, unchanged:
- 7-day post-raid window (`havenRaidCooldownUntil = day + 7`), set by BOTH
  raid channels, respected by both.
- Enforced only on YOUNG nationals (`nationalLive` AND day −
  `nationalFirstDay` < 60). `nationalFirstDay` stamping in hierarchy.js
  becomes unconditional (it was gate-guarded); dissolution clear untouched.
- Commons path: a raid roll inside the window stages nothing — the doubled
  watch fiction line, said aloud, never silent.
- Famine path: a raid chosen inside the window devolves into a beg (normal
  14-day per-village beg cooldown); if the beg cooldown is owed, nothing
  stages and the watch fiction stands alone. The refused-beg 30% comeback
  rides the same gate.
- Refusal-path aftermath (unanswered staged raid melts back with kcal
  taken) untouched.

Test update (design-changed-on-purpose, same commit): the Oct 15 proof
`scripts/test-raiddensity-20261015.js` asserts gate-OFF behavior (helpers
return early with the env unset). That leg is updated to the shipped
behavior — `_rdOn()` true without any env var — and the mechanism fixtures
(boundary day+6 holds / day+7 refuses, old nationals ignore, both fiction
lines) are kept and re-run. A new test,
`scripts/test-raiddensity-ship-20261105.js`, pins the shipped behavior
(cooldown fires with NO env var set; control root still refuses).

## Panel (before/after, identical seeds, two roots)

Instrument: `scripts/sweep-raiddensity-20261015.js` (cluster classifier +
counter, unchanged). Substrate: seeds 11/22/33/44/55/66/77/88 ×
{leadfeast, belongfeast}, 180d death-aware, FEASTSCALE_R13=1 asserted up
front (the #312 lesson, same as Oct 15).
Control root = master e5e6aa59b checked out separately (gate off by
default); candidate root = this branch (gate removed). Identical seeds,
same observer. NOTE on band freshness: these are the Oct 15 substrate
seeds, reused deliberately for comparability with the Oct 15 verdict —
the comparison is control-vs-candidate on identical seeds, and the
freshness rule targets dense loop bands, not this arm's established sparse
substrate (the Oct 15 arm's own baseline rule: never inherit a baseline —
this panel runs its own control on current master).

- **Primary:** combined-channel night-raid clusters (≥2 rival raids
  within 5d) on young nationals (first 60 hold-days) — candidate ≤ 0.5×
  control cluster count. (Oct 15: 26 → 0.)
- **Mechanism check:** no two candidate young-national staged raids with
  gap ≤ 6d (the Oct 15 metric-review revision: the 7d check was one day
  stricter than the day+7 design — a raid on day D+7 is allowed by design).
- **Guardrails:** national reaches ≥ control −2; median survival ≥
  control −10d; no new death mode; the cooldown answers aloud (fiction
  lines in the proof test, not silent removal).
- **§14:** a miss is NO-GO, never re-scored against a friendlier metric
  mid-run.

## What does NOT count

- A cluster reduction bought by fewer national reaches (the guardrail
  catches it), or a silent removal (the fiction lines are part of the
  proof). Wins are not expected to move on this arm — the Oct 15 verdict
  stands: the density mechanism is solved, the win chain is not.
