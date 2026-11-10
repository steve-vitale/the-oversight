# Counter-close arm — PRE-REGISTRATION (arm sim-counterclose-a)

Run: fleshout-20261110T1915Z (Loop A). Axis: scale-onramp / diplomacy
(the counter wall). Base at prereg time: (recorded at commit).
Policy-side only, zero src/js. Win prices, deed gates, readyDemand,
judgeLink bands untouched.

## The failure being closed (diagnosis, from the raiserseat-a corpus — no new sims)

The raiserseat-a evidence reported "29/29 counter" (150204) and "27/27
counter" (150206) as if the villages countered every propose on the
merits. A dawn-pending reconstruction of that corpus
(`proposeCalls` vs daily `pending.counter` snapshots, probe
/tmp/counterdiag-probe.js) shows the counts conflate two different
things:

- 150204 armed: exactly **1 FRESH counter** (day 10, village_0) +
  **28 BLOCKED RE-KNOCKS** — every later propose returned 'counter'
  from `proposeLink`'s guard (`state.pendingCounter` set → "There is
  already an offer on the table — answer it first", hierarchy.js:645)
  without any re-judgment. `pending.counter` stayed true to the last
  snapshot (day 80, village lost).
- 150206 armed: exactly **1 FRESH counter** (day 6, village_1) +
  **26 BLOCKED RE-KNOCKS**. `pending.counter` stayed true to the last
  snapshot (day 152).
- The other six armed seeds: **0 counters** — every propose formed
  (6/5/4/3/4/2). The whole talkturn-a band: **0 counters** (27 formed,
  0 counter, 0 declined) — the wall needs answered raises at volume
  to bite; the seat signal supplied the volume.
- Both fresh counters were the seed's **FIRST propose, days 6–10** —
  a cold early ask: base 38, near-zero opinion (no courtship yet —
  the raiser's lore is rumor-only), a young representative's standing,
  Haven weaker than the target (standing comparison −10), plus the
  ±10 random swing. Early cold asks land in the 35–54 counter band
  by design ("a cold proposal with no relationship behind it usually
  draws a COUNTER-OFFER, not a decline" — judgeLink comment,
  hierarchy.js). The other six seeds' first proposes came later /
  with stronger courtship and formed.

Why one counter stalls the whole season (code-grounded, three facts):

1. `pendingCounter` **never expires** — no sweep touches it; only
   `answerCounter` clears it (hierarchy.js:704–738). A counter staged
   on day 6 is still on the table on day 152.
2. While it sits, `proposeLink` **refuses every new propose** (the
   guard above) — so the village keeps staging raises (cooldown is
   per (raiser, village) pair, 14 days; new villages keep coming),
   the scholar keeps accepting them, and every accept re-knocks on
   a blocked table. The raise pipeline burns itself on one unanswered
   offer.
3. The competent policy has **no counter-answer path**: the only
   answer UI is DOM buttons on the village card
   (`data-counter-accept/sweeten/walk`, app.js:17797) which the node
   policy never touches; conversation menus offer no counter choices;
   `pickTalkChoice` never sees a counter.

The counter terms on the raise path: `acceptLinkRaise` calls
`proposeLink(villageId)` with NO opts, i.e. Haven asks them to bow
(asSubordinate false, tribute 0). The counter flips it: Haven bows,
them primary, **5,000 kcal/week**. `answerCounter('sweeten')` spends
**1,500 kcal** from the pantry for a re-judgment at your terms
(score+12 ≥ 45 → forms Haven-primary at 4,000/week); on failure the
food is kept by them, opinion −5, and the counter clears anyway.
`answerCounter('walk')` clears it at opinion −3. `answerCounter
('accept')` forms the link on their terms, guaranteed.

## The lever (COUNTER_ANSWER=1, policy-side, scripts/policies/competent.js)

`answerPendingCounter(Game, ctx)`, called once daily at the top of
`competent.daily` (before `keepPromises` — its social sittings can
pick `link:accept` — and before `deepTalk`, the propose path), env
gate `COUNTER_ANSWER=1`, default OFF. A counter staged during day N's
talks is answered at the start of day N+1, before any new propose
can re-knock (proposes happen only inside held conversations).

Decision (competent negotiator; follows the `answerBelongCounter`
precedent in scripts/policies/belongseek.js — accept only what the
pantry can carry, otherwise walk rather than promise what you can't
pay):

- Pantry ≥ **12,000 kcal** → **sweeten** (1,500 kcal one-off, keep
  Haven's terms; re-judge +12 vs 45). Same 12,000 threshold the
  policy already uses before courting a subordinate link.
- Pantry < 12,000 kcal → **walk** (clear the table, −3 opinion,
  keep the food; the village re-proposes later when courtship and
  the pantry are stronger).
- Never 'accept' on the raise path: the counter asks Haven to bow
  at 5,000/week, and a competent player who asked them to bow does
  not bow for the asking — they pay a little to hold their terms,
  or walk away. A subordinate link also does not build Haven's
  polity (needs Haven-primary seasoned subordinates).

Counts recorded in ctx for the analyzer: `counterSweetened`,
`counterSweetenFormed`, `counterSweetenFailed`, `counterWalked`,
`counterSweetenKcal`. Deterministic when no counter is pending
(no-op, no RNG consumed); after a sweeten the RNG stream diverges
from control exactly as the game does (judgeLink's re-judgment
draws) — legs are compared on outcomes, not trajectory identity.

## Legs (isolation)

- BOTH legs: `COMPETENT_TALK=1` (the talkturn-a substrate) AND
  `RAISER_SEAT=1` — the +35 raiser-seat signal, present on BOTH legs
  as the **test harness that reproduces the counter load**. The
  failure was observed ONLY on that substrate (80 accepts vs 27
  without it); without the seat signal the band stages 0 counters
  and the lever would have nothing to answer — a vacuous pilot.
  The signal is killed (NO-GO, raiserseat-a) and is NOT re-landed:
  it is re-applied in this tree ONLY as harness, and is REVERTED
  before the final commit (proof pins the revert: RAISER_SEAT a
  no-op on talkScore after revert). The landed artifact is
  COUNTER_ANSWER only.
- ARMED leg: + `COUNTER_ANSWER=1`.
- CONTROL leg: flag unset.
- The ONLY difference between legs is COUNTER_ANSWER. The driver
  sets/deletes all three flags explicitly per leg so ambient env
  cannot leak.

## Band reuse rationale (150201–150208 REUSED)

Same experiment continued: the failure was observed on exactly this
band, on this substrate. Reusing it reproduces the exact failure
conditions (150204/150206 counter-stalled, the other six forming)
so the fix is judged against the failure it claims to close, not
against a fresh band where the failure may never occur. A fresh band
would test generalization, not the fix. The confirm band
150209–150216 is NOT spent this run — it stays reserved for
tendexact-a. If this pilot GOes, a confirm is recorded as OWED
(see below) and run on a fresh band by a later run.

## Pre-registered judgments

Horizon: **150d**, death-aware (dead villages stop; +10d tail max
per the harness). Seeds: **150201–150208** (8, pilot). Policies:
competent, both legs `COMPETENT_TALK=1` + `RAISER_SEAT=1`
(harness); armed + `COUNTER_ANSWER=1`.

HARNESS REPRODUCTION (checked FIRST — if it fails, the pilot is
VOID, not NO-GO): the control leg must show the counter-stall
class — ≥1 seed ending with `pending.counter` true at its last
snapshot, and ≥1 fresh counter band-wide. (Raiserseat-a observed:
2 stalled seeds, 2 fresh counters, 54 blocked re-knocks.)

PRIMARY METRIC (conjunction, judged strictly):
(a) second links formed: **armed seeds > control seeds**
(second-link counting per the talkturn analyzer: any village
beyond the first link, ever).
(b) **zero armed seeds stalled at unanswered counters** (no armed
seed ends with `pending.counter` true at its last snapshot).
GO requires (a) AND (b). A tie on (a) with (b) passing is NO-GO —
the lever must move links, not just clear counters.

COST BAR (per-day form, per the talkturn/raiserseat metric-review
lesson — judge survival levers on the per-day read, not raw totals):
- deaths per 100 village-days armed ≤ control × 1.10;
- starvation deaths armed ≤ control + 2;
- arm-only starvation (armed starvation on seeds where control
  starvation = 0) ≤ control starvation total;
- median survival armed ≥ 0.8 × control median.
A GO primary with a failing cost bar is HELD, not landed (same rule
as talkturn-a).

SECONDARY (reported, not judged): fresh counters vs blocked
re-knocks per leg; counter answers per leg (sweeten formed/failed,
walked, kcal spent); accepts/expires; first-link source; polity /
seasoned links; wall numbers (national / table / wins, wave 4–5
unlocks, median survival); death causes.

## If GO

Record a confirm as OWED — do NOT run it this run and do NOT spend
band 150209–150216. The confirm (fresh band, same legs) belongs to
a later run. If NO-GO, the lever is killed; the instrument and
diagnosis stay as the record.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The raiserseat-a "29/29 counter" count conflated fresh counters
  with blocked re-knocks. This arm's instrument splits them
  (propose-time `pendingCounter`-before + judgeLink score +
  propose-time opinion/rep standing). Future arms should report
  fresh vs blocked separately; a counter-stalled seed is defined
  by a fresh counter unanswered to end, not by a raw 'counter'
  return count.
- The 150206-class definition (≥10 stagings, 0 picks) measures the
  wrong failure on this substrate: the seat signal eliminated it
  (0 picks → 27 picks) while the seed still formed no second link.
  This arm judges the "counter-stalled seed" class instead
  (fresh counter staged, `pending.counter` true at end).
