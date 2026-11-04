# sim-hurthome-fix-a — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T1015Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-hurthome-fix-a. Axis: food-economy.
Arm: HURT-AWARE TURN-HOME RULE FOR TRIPS — the NAMED NEXT ARM from
Loop A sim-hurthome-a (evidence/2026-11-04/sim-hurthome-a.md, DIAG-GO),
which closed the behavior measurement; narration half already landed
by Loop B 2130Z sim-hurttraveler-b (evidence/2026-11-03/sim-hurttraveler-b.md).

## CONTEXT (not re-litigated)

- Diag numbers (seeds 97101–97116, competent, 100d, dawn census):
  trips 22 episodes: 15 returned (come-home 0.682), 7 died (0.318);
  conditional turn-home rate (same+next-day / returned) 12/15 = 0.800;
  stayed-out >= 3 days 3/15 returned. Walk-outs (LEAVE, 999-part
  clock): 6 episodes, 0 returned, 6 died — a DIFFERENT population,
  structurally unreachable by any trip-clock rule.
- Mechanism (code-read, re-verified this run before designing):
  npcNodeTravel (game.js ~16937) returns on ONE condition,
  partsAway >= away.duration; no health check exists on the return
  path. expedHurt (villager-agency.js ~531) caps st.exped.duration
  to legs+1 ("cut the expedition short — the body insists") but
  nothing writes that cap back into v.away.duration; the diag
  corpus shows the disconnect firing on 5/15 expedition episodes.
  Expedition and away durations start EQUAL (same `duration`
  variable, in parts, at the agency departure setter), so the cap
  and the clock are the same units — the disconnect is purely the
  missing write-back.
- Constraints carried from the diag (must not be assumed away):
  (a) walk-outs are NOT the same problem — a trip rule cannot
  reach a 999-part clock, and this arm excludes purpose 'leave'
  explicitly; (b) faster returns need not save lives — 9/13
  diag died-away died ON the episode day itself, many past saving
  when the dawn census first saw them; (c) the voice line needs
  no change — 4/5 diag stay-out evenings already carry a true
  reason through it. The narration question here is narrower:
  what a hurt-aware RETURN line says (diag: return lines
  celebrate haul and scars, never the hurt that sent them home).

## DECISION UNDER TEST (chosen before any judged sim)

ONE mechanism only, so the effect is attributable:

**A health check on the return path (CHOSEN).** In npcNodeTravel,
a ledger-away villager on a TRIP (any purpose except 'leave')
with hp <= 7 (the awayHungerVoice gate; alive, hp >= 1) returns
at the next travel tick, regardless of the trip clock. LEAVE
walk-outs are excluded by purpose, not by clock arithmetic, so
no walk-out is ever pulled home by this rule.

**The expedHurt write-back (REJECTED as the arm, kept as a
fallback note).** Writing the exped cap back into v.away.duration
reaches only expedition hurts via the expedHurt path (monster
flee), while diag trips span 7 purposes (expedition 15, leave 6,
forage 2, hunt 2, guard 1, visit 1, water 1 — 7 non-expedition
trips). The health check subsumes the expedition case: a hurt
expeditioner returns at the next travel tick, which is at least
as fast as the capped clock would bring them, and it covers
every hurt source (monster, wound, sickness), not just the
expedHurt path. If this arm NO-GOs, the write-back remains a
narrower fallback for a future arm — it is NOT added mid-run.

**The hurt-aware return line (part of the same commit).** When
the hurt check (not the clock) triggers a return, and the player
is at Haven to see it, the game says one line at the return
tick: "🧭 {first} returns from the wilds hurt (health {hp}/100)
— the trip cut short." It names the villager, the true hp at
return, and the reason (hurt, not clock). It fires inside the
npcNodeTravel return branch, so for forage trips it precedes
the existing forage return line (both true, no contradiction),
and for expeditions it precedes the later expeditionReturn
haul/stories line. Wording is state-true by construction: it
fires only on the hurt branch, only with the hp read at that
tick. It consumes no RNG and writes no game value beyond the
pre-existing say path.

## INSTRUMENT (diag instrument, extended — pinned)

- Reuse scripts/hurthome-a-lib.js UNCHANGED (episode definition,
  classification, dawn census: hurt = hp <= 7 and >= 1 at a dawn
  sample; away = v.away present, ledger test; trip key; buckets
  died-away / same-day / next-day / stayed-out >= 3 days /
  censored-early, death first).
- New scripts/sweep-hurthome-fix-a.js = sweep-hurthome-a.js with
  exactly these changes: seed lists below; per-seed dir
  evidence/2026-11-04/perseed-hurthome-fix-a/ (cells suffixed
  -baseline / -armed in filenames); a pre-travel hp snapshot in
  the npcNodeTravel wrapper, so each closed episode records
  hurtTriggered (return closed on a travel tick whose pre-travel
  hp was <= 7 and purpose != 'leave') or wouldTrigger (same
  condition in the BASELINE cell, where no hurt branch exists —
  the diagnostic count of returns the rule WOULD have pulled
  earlier, had it existed). The snapshot reads only; no RNG, no
  game-value writes. Transcript capture unchanged (the new
  return line matches the existing "returns from" capture
  pattern, and names the episode villager, so it is captured
  either way).
- New scripts/analyze-hurthome-fix-a.js: per-cell pooled tables
  split TRIPS vs WALK-OUTS (never pooled), reporting BOTH rates
  for trips: come-home rate = returned / all trip episodes, and
  conditional turn-home rate = (same-day + next-day) / returned
  trip episodes; trip died-away share; stayed-out >= 3-day
  share; hurtTriggered / wouldTrigger counts; meal-line counts
  (BOTH censuses kept, per the diag metric review); guardrails
  (median daysAlive, survived-seed count, maxWave, national /
  table / wins); instrument errors (must be 0).
- Proof test scripts/test-hurthome-fix-a.js (green BEFORE any
  judged armed sim): the hurt-return predicate as a Game method
  (shouldHurtReturn) tested on fixture state — hurt trip true,
  healthy trip false, hp 8 false, hp 0 false, LEAVE false, no
  away record false, predicate mutates nothing and reads no
  RNG; source-wiring check that npcNodeTravel's return branch
  calls the predicate and the hurt line fires only on that
  branch. The predicate is the exact function the branch calls,
  so the proof exercises the judged code, not a copy of it.

## DESIGN (cells, policy, horizon, seeds — pinned)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (dead villages stop; never a
  fixed 200d). Why 100d: comparability with the diag corpus
  that posed the question (same horizon, same policy, same
  instrument family).
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit,
  same as the diag corpus).
- Seeds: PILOT 97501–97508, CONFIRM 97509–97516 (fresh band:
  no s97501+ per-seed files exist in evidence; the October s975
  files are a different 3-digit seed under a different
  instrument). BASELINE cell runs FIRST on pristine code (no
  src change yet in this worktree); ARMED cell runs after the
  fix commit, same seeds, same instrument, same env.
- Cells differ by EXACTLY one commit: the hurt-check + hurt-line
  change in src/js/game.js (+ its proof test). No gate, price,
  deed, readyDemand, policy-default, or other-lane change.

## PRE-REGISTERED GO (judged against this header, §14)

- PILOT GATE (8 seeds per cell): instrument errors 0, every
  episode classified (unclassified 0), baseline trip census
  >= 8. If the pilot trip census is < 8, the confirm band is
  still run (pre-budgeted below) and judging moves to the
  pooled 16-seed census — the threshold is never lowered, the
  health threshold never widened, the horizon never extended
  to manufacture episodes.
- JUDGED CENSUS: pooled 16 seeds per cell. INSUFFICIENT-DATA if
  pooled trip episodes < 16 in either cell (rate verdict
  withheld; counts shown descriptively only).
- PRIMARY (trips only): armed trip come-home rate minus
  baseline trip come-home rate >= +0.15 absolute.
  (Diag-band expectation: baseline ~0.68; the rule should lift
  it toward ~0.83+ if it works, bounded below by same-day
  deaths that strike before the next travel tick — the diag's
  9/13 same-day deaths are exactly that bound, and a smaller
  lift is a finding about that bound, not a reason to move
  the threshold.)
- SECONDARY (reported, must not contradict GO): armed trip
  died-away share <= baseline trip died-away share;
  conditional turn-home rate reported separately in both cells,
  never as a substitute for the come-home rate; walk-out
  come-home rate reported separately (expected 0 in both cells
  — any armed walk-out return is an EXCLUSION FAILURE and voids
  GO outright); hurtTriggered returns >= 1 in the armed cell
  (the mechanism fired at least once).
- GUARDRAILS (hard; a breach voids GO even if primary passes):
  median daysAlive armed >= baseline median − 10 days;
  survived-seed count armed >= baseline count − 2 seeds.
  Died-away share overall (all episodes) reported, not hidden.
- NARRATION AUDIT (required for GO): >= 1 armed hurt-return
  line found in armed transcripts, quoted and judged TRUE
  (names the returned villager, hp matches the episode's
  return snapshot, line says hurt/cut-short). If 0 lines fire
  (e.g. the player is never at Haven at a hurt return), the
  narration leg is INSUFFICIENT-DATA and no GO is claimed —
  the line exists in code but is unproven in sims, and that is
  reported as such, not papered over.
- GO = primary met AND secondary non-contradiction AND
  guardrails hold AND narration audit passed AND instrument
  clean. GO lands the fix commit (game.js + proof test +
  prereg + evidence + both corpora) on this branch, with
  [needs-eyes] (a behavior change to when hurt villagers come
  home qualifies). The coordinator merges; this worker does
  NOT push, bump, or verify live.
- NO-GO = primary missed, or any guardrail breached, or a
  walk-out exclusion failure, on a judged census. A NO-GO
  leaves NO src change: the fix commit is reverted before
  reporting (policy files deleted, game code reverted), and
  the evidence reports the miss as the finding.
- §15 BALANCED PANEL — DECLARED INAPPLICABLE (before the
  pilot, not after the fact): scripts/balance-panel.js measures
  no hurt-episode metric — its per-seed rows cannot express a
  come-home rate, a conditional turn-home rate, or a
  hurt-triggered return. Fabricating a panel compare from
  census JSONs would be dishonest. The comparison instrument
  is the pre-registered per-seed matched table (identical
  seeds, identical policy/horizon/env, both cells from the
  same instrument), with guardrail medians from the same
  per-seed JSONs. This declaration is made now so that a
  later panel-shaped file cannot be mistaken for a panel.

## SENSE TEST (after the judged run, before verdict)

Read armed transcripts: every hurt-return line found, plus the
return lines of the stayed-out >= 3 days trip episodes, judged
against each episode's own snapshot (purpose, clock, hp, last
hurt). Quote, don't just count: at least one quoted hurt
return and one quoted stayed-out return in the evidence,
judged as a person making a choice (hurt → coming home) vs
the clock merely running out. Meal lines are counted in both
cells as the second census, not judged as the primary.

## VERDICT RULES (§14 — a miss is NO-GO, never re-scored)

- A miss is never re-scored against a friendlier metric
  mid-run (no swapping come-home rate for the conditional
  rate, no pooling trips with walk-outs to lift a number, no
  dropping same-day deaths from the denominator). Doubt about
  a metric goes under "metric review" in the evidence, for
  the NEXT run.
- An instrument failure (unclassified > 0, errors > 0) is
  fixed in the instrument, the affected seeds re-run only,
  and the fix is stated — never hidden by re-scoring.

## METRIC REVIEW (to be filled in the evidence file, not here)

Reserved: whether the +0.15 come-home lift, the hp <= 7 gate,
the trip/walk-out split, and the player-at-haven narration
gate were the right instruments, judged AFTER the run — never
revised mid-run.
