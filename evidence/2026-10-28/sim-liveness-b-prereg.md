# Prereg — sim-liveness-b (loop B, run fleshout-loop-b-20261028T1430Z, axis food-economy)

Committed BEFORE any after-measurement, before any game change.
Gap: backlog refusalprecheck/liveness-gap, from
evidence/2026-10-27/sim-refusalprecheck-b.md §metric review 6 and
docs/ABILITY-REFUSALS.md §2: the challenge/posture refusal sentences
promise the target must be "here, alive, and one of yours", but the
precheck and impl check only roster + not-self. A roster member whose
dead flag is set is (hypothesis, to be fixture-proven) still accepted.

## Decision call (stated before building)

FIX = refuse dead-flag targets BEFORE payment, in BOTH the precheck
and the impl, for BOTH actions. The narration stays; the code moves
to meet it. Reasons, from code + canon, not preference:

- docs/ABILITY-REFUSALS.md §1: a refusal the game can see coming
  must refuse before payment. A dead flag is visible pre-payment
  (getPerson(vid).dead), exactly like roster membership.
- The narration is the design intent, not loose copy: §2 states the
  sentence says "alive" while the code tests only roster + not-self,
  and names that mismatch as the open gap. Changing the sentence to
  drop "alive" would bless challenging a corpse and contradict the
  no-silent-actions honesty rule (a dare to a dead villager narrates
  a living response: "grins", "goes pale", "yields the point").
- Precedent in landed code: the calm scan tests alive
  (abilityActions.js _calmableFighter), villagerPocketAmmo returns
  out on person.dead, tableAscended skips v.dead. Dead people do not
  act, yield, or remember anywhere else; challenge/posture should
  not be the exception.
- Smallest alignment: scan paths skip dead persons (so a dead active
  conversation partner does not block a living one, and a dead-only
  audience refuses); explicit dead targets refuse with the existing
  audience sentence. No new sentence, no new eligibility, no cost
  change, no flag change. Trophy mark has no target and is untouched.

This changes player-facing acceptance (a dead conversation partner's
challenge/posture button goes disabled with the audience reason, and
an explicit dead tap refuses instead of succeeding), so the fix
commit carries [needs-eyes].

If the fix proves unsafe (living behavior moves, or the dead flag is
not reachable through getPerson in a way the impl can mirror), land
DIAG with the gap re-proven and the fix spec'd, never a half-fix.

## Primary metric + GO bar

Dead-target acceptance, fixture-proven per action and per path
(report challenge and posture separately, explicit and convo-scan
separately — no assumed symmetry):

- Fixtures per seed (seeds 9981–9988, same pilot seeds as
  sim-refusalprecheck-b): D1 challenge explicit dead; D2 posture
  explicit dead; D3 challenge convo-scan dead (dead partner is the
  only active conversation); D4 posture convo-scan dead.
- GO (after fix): 32/32 dead rows refuse PRE-payment — result
  false, day unchanged, dayTicks unchanged, kcal unchanged,
  challengeDay/postureDay unstamped, audience refusal sentence
  present, and (D3/D4) the bar read disabled (availOk false).
- RED (before fix, expected): dead rows accept (result true) with
  success narration and flag stamped, proving the gap. If any dead
  row already refuses before the fix, that row is reported as
  already-closed, not as fixed by this arm.

## Guardrails (all must hold)

1. Living-target invariance: living explicit + living convo success
   fixtures for both actions (L1–L4, 32 rows) byte-identical
   before/after on result, day, dayTicks, kcal, flags, and narration
   (success marks: challenge "You point at ", posture "yields the
   point"). No living success may flip to refusal.
2. Det-gate (fixture corpus): dump-mode corpus before vs after —
   ONLY the 32 dead rows move (accept → refuse); every living row
   identical, including sayLines.
3. Policy guardrail band: competent policy, seeds 9981–9988, 60d
   death-aware horizon (same instrument as sim-refusalprecheck-b
   leg (c)), before vs after via sweep-compare. GO bar: per-seed
   headline rows identical (days, end reason, wave, arc, rank,
   table, won); starvation deaths and median survival therefore
   identical too — any movement is investigated, not averaged away.
   Wall numbers reported both legs (national / table / wins,
   wave 4–5 unlocks, median survival).
4. Balanced panel (§15): compare .md attached to the evidence file;
   the prereg's judge is guardrail 3's headline identity, with the
   panel as instrument (its decision label is not the verdict when
   every paired delta is 0, per the refusalprecheck precedent).

## Method

- Fixture script scripts/test-liveness-b.js (dump + assert modes,
  adapted from scripts/test-refusalprecheck-b.js): fresh day-1
  setups via scripts/sim-harness.js, one useAbility tap per fixture
  at dayTicks 100 (non-boundary, so successes do not cross the day
  and flags stamp the current day).
- Dead flag: Game.getPerson(partner).dead = true after setup, read
  back before the tap; partner stays on the roster (that is the gap
  state: roster + dead flag).
- No jest concurrency; --cacheDirectory=/tmp/jest-cache-sim-liveness-b
  if jest runs. No push, no bump, no live verification.
- Evidence: evidence/2026-10-28/sim-liveness-b.md + corpus under
  evidence/2026-10-28/sim-liveness-b-corpus/ (+ prereg .md here).
  Every evidence file carries a "metric review" section (§14).

## Metric review (pre-written, to be completed after the run)

- If a dead row behaves differently by path (explicit vs scan) or by
  action, the asymmetry is reported, not averaged.
- If the policy band moves at all, the movement is attributed
  (challenge/posture taps under competent policy are expected to be
  ~zero with COMPETENT_TALK off by default — an identity gate, as
  in sim-refusalprecheck-b) or the arm is NO-GO.
