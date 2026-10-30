# sim-sweeten-a — LEANLINK NEVER SWEETENS, diagnosed (DIAG-GO)

Run: flesh-out loop, run fleshout-20261030T1747Z, arm sim-sweeten-a.
Axis: scale-onramp. Backlog item: LEANLINK NEVER SWEETENS (from
sim-tributecost-a, run fleshout-20261030T1427Z): sweetener calls 0/0
across 8 leanlink seeds despite the documented "sweeten if pantry >
25,000" path.

DIAG ONLY. Zero src/js changes, zero policy changes, zero edits to
any existing instrument. New scripts only:
scripts/test-sweeten-a-corpus.js (corpus reader),
scripts/test-sweeten-a-propose-detail.js (proposal outcomes + pantry
tail), scripts/test-sweeten-a-branch.js (engine-branch fixture proof).
No [needs-eyes]: no feel, combat, or UI change.

Canon: docs/CANON.md read first. NO canon doc covers the
envoy→counter→sweetener mechanism (CANON.md manifest has no such doc;
scripts/policies/leanlink.js header says so). Mechanism below is
cited from code only, not invented.

## Verdict: DIAG-GO — all four prereg legs pass

| Leg | Bar | Result |
|---|---|---|
| (a) Code path cited | Trigger + condition sites, file + function | PASS |
| (b) Pantry-vs-threshold traces, all 8 seeds | Daily series vs 25,000 + pantry at every answer | PASS |
| (c) Every seed's zero explained | T-NEVER / C-FAILS / OTHER per seed | PASS — 7 T-NEVER, 1 C-FAILS, 0 OTHER |
| (d) Live-channel verdict + one concrete next step | Is a sweetener a real cost channel? | PASS — live in the engine, dormant on leanlink; next step below |

## The sweetener mechanism, in plain words

When Haven proposes a link and the other village is neither won over
nor put off, it counters: "we'll take Haven instead, at 5,000
kcal/week." Haven then has three moves: accept their terms (a flipped
link, Haven subordinate), sweeten (hand over 1,500 kcal of real food
for a second judgment at Haven's own terms — the food is kept by the
other side either way), or walk away. The leanlink policy answers a
counter with "sweeten" only if Haven's pantry holds more than 25,000
kcal at that moment, otherwise "accept". So a sweetener can only ever
fire on a seed that (1) gets a counter at all, and (2) is holding
>25,000 kcal on the day it answers that counter. On these 8 seeds,
condition (1) almost never happened, and on the one seed where it
did, condition (2) failed at the exact moment it mattered.

## Code citations (trigger + condition sites)

- Policy trigger — scripts/policies/leanlink.js, `leanCourtship`:
  `if (st.pendingCounter && Game.answerCounter) { const rich =
  pantryKcal(Game) > 25000; Game.answerCounter(rich ? 'sweeten' :
  'accept'); }`. The rich check is evaluated once per day, after
  competent.daily, on the pantry as it stands at that moment.
  `pantryKcal` sums `kcalEach * units` over the village pantry.
- Counter staging — src/js/hierarchy.js, `proposeLink` → `_stageCounter`:
  score ≥ 55 forms the link directly (no counter); 35–54 stages a
  counter (`this.state.pendingCounter = c`, counter terms fixed at
  5,000 kcal/week for a LEAD-origin proposal, Haven subordinate);
  < 35 declines. No other code stages a primary/subordinate counter
  (`_stagePeerCounter` is the separate covenant/trade path, which
  leanlink never proposes). No code clears `pendingCounter` except
  `answerCounter` itself — so a staged counter cannot be silently
  eaten before the policy answers it.
- Engine sweeten branch — src/js/hierarchy.js, `answerCounter`,
  `how === 'sweeten'`: removes 1,500 kcal via `_removePantryKcal`
  (whole units, so removal is ≥ 1,500 whenever the pantry holds that
  much); if the removal comes up short it returns `'counter'` and
  the counter stays standing; otherwise it re-judges at the
  proposer's original terms and forms the link at YOUR terms only if
  `j2.score + 12 >= 45` — otherwise the food is gone, opinion −5,
  and no link. Sweeten is a gamble, not a purchase.
- Why direct accepts are so common — src/js/hierarchy.js,
  `judgeLink`: base 38 + up to +20 from the representative's
  standing + opinion/2 + up to +15 for an existing alliance +
  strength difference + a ±10 roll. By day 25, against known
  villages, that arithmetic clears 55 most of the time, so the
  35–54 counter band is rarely entered at all.
- UI wiring (sweeten is not orphaned code): src/js/app.js:16954
  binds the "Sweeten it (1,500 kcal)" button to
  `Game.answerCounter('sweeten')`.

## Per-seed evidence (tributecost leanlink corpus, seeds 9911–9918)

Totals: 30 proposals, 2 counters staged, 2 counters answered,
0 sweeten calls, 2 accept calls. 28 of 30 proposals formed a link
directly (score ≥ 55); 0 declined. Counters staged = counters
answered on every seed, so no counter was left unanswered at a
village loss and none was cleared elsewhere.

| Seed | End | Proposes | Counters staged → answered | Sweeten | Accept | Max pantry | Days pantry > 25,000 | Explanation |
|---|---|---|---|---|---|---|---|---|
| 9911 | lost d166 | 9 | 2 → 2 | 0 | 2 | 56,961 | 127 / 165 | C-FAILS (see below) |
| 9912 | lost d139 | 3 | 0 → 0 | 0 | 0 | 41,540 | 39 / 139 | T-NEVER |
| 9913 | lost d129 | 3 | 0 → 0 | 0 | 0 | 39,140 | 35 / 128 | T-NEVER |
| 9914 | survived 180d | 3 | 0 → 0 | 0 | 0 | 57,294 | 117 / 180 | T-NEVER |
| 9915 | survived 180d | 3 | 0 → 0 | 0 | 0 | 40,740 | 12 / 180 | T-NEVER |
| 9916 | survived 180d | 3 | 0 → 0 | 0 | 0 | 92,101 | 129 / 180 | T-NEVER |
| 9917 | survived 180d | 3 | 0 → 0 | 0 | 0 | 55,968 | 134 / 180 | T-NEVER |
| 9918 | lost d159 | 3 | 0 → 0 | 0 | 0 | 45,866 | 21 / 158 | T-NEVER |

### T-NEVER seeds (9912–9918): the trigger was never reached

Each of these seeds proposed exactly 3 times — the cap-3 subordinate
limit — and every proposal formed a link outright. Once the cap
filled, leanlink stopped proposing entirely (its propose gate
requires an open subordinate slot), so no further counter could ever
arise for the rest of the run. The policy's sweeten branch was never
evaluated on a live counter on any of these seeds, because there was
never a counter to answer. This is NOT a pantry story: seed 9916 sat
above 25,000 kcal on 129 of 180 days and still never sweetened,
because pantry size is irrelevant when no counter exists.

### C-FAILS seed (9911): the trigger fired, the pantry condition failed

9911 is the only seed where the cap freed up (links broke) and
proposing resumed: 9 proposals, days 25–150. Two counters were
staged, late in a collapsing run:

- Day 143, village_0: counter staged (pantry 14,449). Day 144:
  answered 'accept' — pantry at answer 12,713 kcal, far below
  25,000. The accept formed a flipped 5,000-kcal/week link.
- Day 144, village_2: counter staged (pantry 12,713). Day 145:
  answered 'accept' — pantry at answer 12,873 kcal. Again a flipped
  5,000-kcal/week link.

The pantry trajectory makes the timing plain: 9911 held >25,000 kcal
on 127 days, but the counter answers landed in a trough. Pantry fell
from 30,040 (day 132) to 20 (day 140), recovered only to ~14,449 by
day 143, and the two answers were taken at 12,713 / 12,873 — barely
above the 12,000 propose gate, less than half the sweeten gate. A
brief recovery to ~27,000 on days 150–154 came too late: no counter
was pending then (the day-150 proposal formed directly), and the
village was lost on day 166 with the pantry at 0. So on 9911 the
answer is the pantry condition, not the trigger — and it is a
moment-in-time failure, not a "pantry never high" failure. Any
analysis that only checks "was the pantry ever over 25,000" would
get this seed exactly wrong.

### Recorder blind-spot check (why the tributecost 0/0 can be trusted)

The tributecost analyzer counts a sweetener as an answerCounter call
with pantryDelta < 0. That definition cannot hide a policy sweeten:
the policy only calls 'sweeten' when the pantry exceeds 25,000, and
the engine's whole-unit removal then takes at least 1,500 kcal, so
every genuine sweeten call shows a negative delta. A failed
under-funded sweeten would also show a negative delta, but the
policy never calls sweeten under-funded. The corpus wrap records
every answerCounter call with its argument and pantry before/after,
so the 0/0 is a measured zero, not an absence of instrumentation:
2 answerCounter calls exist in the corpus, both 'accept', both
delta 0. No staged counter lacks an answer.

## Is a sweetener a live cost channel at all?

YES in the engine, NO in practice on leanlink. The branch is proven
live by fixture (scripts/test-sweeten-a-branch.js, 11/11 green, seed
9911 harness): a staged counter answered 'sweeten' with a 30,000-kcal
pantry loses exactly 1,500 kcal and clears the counter (in the
fixture the re-judgment failed, so no link formed — the food was
still taken, which is the engine's documented gamble). The
under-funded leg proves the failure path too: a 1,000-kcal pantry
returns 'counter' and leaves the counter standing. Nothing about
the sweeten branch is broken or dead. What is "dead" is the
opportunity: leanlink's courtship almost never enters the counter
band (28/30 direct accepts), and its cap-3 stops proposing once
full, so the sweeten decision point essentially never arises. A
sweetener is therefore NOT a hidden cost channel draining leanlink
villages — leanlink's courtship costs are the accord gifts
(~2,000 kcal each, 23 calls) and nothing else, exactly as
tributecost reported. Sweeteners cannot explain any leanlink death,
and no sweetener-cost lever exists to tune on this policy.

## Sense check (brief)

The two 9911 counter transcripts read coherently: a collapsing
village, pantry in the low five figures, is offered flipped terms
and takes them rather than gambling 1,500 kcal it cannot spare on a
re-judgment it might lose. Accepting a subordinate link while poor
is the sensible move, and the engine's narration says so ("The gift
talks" vs. the take-it-or-leave-it terms). No sense issue surfaced;
the story the numbers tell matches the story the lines tell.

## Concrete next step (one)

Do NOT chase sweeteners as a leanlink cost lever — there is nothing
there to tune (killed as a cost hypothesis on this evidence, not
killed as a mechanic). The follow-up that WOULD test whether
sweeteners matter anywhere is a policy variant that actually reaches
the counter band — e.g. a courtship policy that proposes to colder
villages (lower opinion / weaker standing, where judgeLink lands in
35–54 instead of ≥55) or that keeps proposing after the cap fills —
run on the same seeds and counting sweeten calls, sweeten successes,
and flipped-vs-own-terms outcomes. Until such a variant produces
counters, any claim about sweetener economics is unmeasured. If no
variant can be made to counter regularly, the Steve-call is whether
the counter band itself is tuned too narrow to matter — that call
belongs to Steve, not to a diag arm.

## Metric review (for the NEXT run, not this verdict)

- "Pantry ever over 25,000" is the wrong summary for this question:
  9911 was over on 127 days and still never sweetened, because the
  only days that matter are counter-answer days. Future preregs
  should require pantry AT ANSWER, not pantry maxima.
- The corpus's proposeLink return values cleanly separate
  formed/counter/declined, which is what made the T-NEVER proof
  possible without new sims. A future recorder should also log the
  judgeLink score at propose time, so the "why no counters" question
  can be answered from the corpus instead of from code arithmetic.
- No new sims were needed: the corpus distinguished trigger vs
  condition on all 8 seeds, so the prereg's step-3 instrumented
  re-runs were correctly not spent. The one new execution was the
  branch fixture, which answers a different question (is the code
  live?) and is not a sim.
