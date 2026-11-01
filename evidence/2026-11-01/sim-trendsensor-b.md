# sim-trendsensor-b — DIAG: LEVEL-VS-TREND SENSOR (does a trend-aware "full" reading beat the level rule?)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1305Z, arm
sim-trendsensor-b, axis food-economy. Worktree sim-trendsensor-b, branch
sim-trendsensor-b.
Answers the depositgate backlog item (Loop B round 1130Z, evidence
evidence/2026-11-01/sim-depositgate-b.md): the depositgate's "full"
reading is a LEVEL (fresh days > 4), not a trend — on seed 51101 it ate
6,442 kcal at the fire over days 12–17 while the pantry halved, with
voice still saying "the shelves are full".
DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing script or policy file. New files only, all named
*-trendsensor-b.*: prereg, trend analyzer, proof test, evidence,
corpus. The depositgate driver and policy were NOT run in this arm —
the pilot is a pure replay of the committed depositgate armed corpus,
and no confirm band was run (see Pilot gate). This worker does NOT
push, bump, verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch sim-trendsensor-b, pending
coordinator merge.

## Verdict: NO-GO — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-trendsensor-b-prereg.md, commit
39c6d84f5, written BEFORE any judged analysis. The trend rule (fixed
there): TREND-NOT-FULL on an evening iff the total pantry fell >= 20%
over 5 evenings AND fell three evenings running ending that day AND the
level rule still says engaged. Trend stand-down day = first such day
inside the seed's final engaged run; level stand-down day = the first
disengaged evening after that run; earliness = level minus trend.

(a) 51101 EARLINESS: PASS, by a wide margin. Trend day loopDay 7,
    level stand-down loopDay 18, earliness 11 days (>= 3 required).
    But read the caveat below: the day-7 firing is the first-week
    settling, not the day 12–17 slide — the slide days 15–17 also
    satisfy the rule independently (see trajectory table).
(b) PILOT FALSE-STAND-DOWN CAP: FAIL. 3 surviving pilot seeds have a
    trend stand-down day in their final engaged run (51103, 51104,
    51108); the cap is 2. Survivors observed: 7 (51102–51108).
DIAG-GO requires BOTH bars. (b) fails, so the verdict is NO-GO and the
pilot gate STOPS the run: NO confirm band was run, no fresh seeds were
simulated, and no bar was re-scored. The trend rule as pre-registered
is too eager: it cries wolf on normal first-week pantry settling.

## Per-seed table (pilot replay, armed arm, 30d competent window)

trendDay = first TREND-NOT-FULL day in the final engaged run (null =
none). levelSD = level stand-down evening (null = seed ends engaged).
trendAny = all TREND-NOT-FULL days anywhere in the window, for the
metric-review sensitivity note (the bars use the final run only).

| seed | end | days | trendDay | levelSD | earliness | false | trendAny | final run |
|---|---|---|---|---|---|---|---|---|
| 51101 | village-lost | 25 | 7 | 18 | 11 | — | 7,8,9,10,11,15,16,17 | 1–17 |
| 51102 | survived | 30 | — | — | — | no | — | 1–30 |
| 51103 | survived | 30 | 7 | — | — | YES | 7,8,9,11,12,13,18,19 | 1–30 |
| 51104 | survived | 30 | 7 | — | — | YES | 7 | 1–30 |
| 51105 | survived | 30 | — | — | — | no | 7 | 20–30 |
| 51106 | survived | 30 | — | — | — | no | 7,9,10,11,12,13,14,15,16,17 | 23–30 |
| 51107 | survived | 30 | — | — | — | no | 7,8,25 | 28–30 |
| 51108 | survived | 30 | 10 | — | — | YES | 10,11 | 1–30 |

Census validity: all 8 seeds valid (rows == daysAlive, gateEngaged
boolean on every row, zero null pantry rows). No seed was excluded.

## Seed 51101: the trajectory the rule reads

Evening census rows. The rule fires from day 7 — long before the slide
— because the first week IS a steep fall: the village starts near
39,660 kcal, drops 10,160 kcal on day 3 alone, then eats steadily down.
Day 7 vs day 2 is a 39.6% fall over 5 evenings with falls on days 5, 6,
7. The day 12–17 slide then re-fires the rule on days 15, 16, 17
(earliness 3 on day 15 alone — the slide, judged on its own, would
also have beaten the level rule's day-18 stand-down, but that is NOT
the bar: the bar credits the FIRST firing, day 7).

| day | pantry | freshDays | eng | day | pantry | freshDays | eng |
|---|---|---|---|---|---|---|---|
| 1 | 39,660 | 5.07 | yes | 10 | 20,100 | 7.73 | yes |
| 2 | 39,660 | 5.07 | yes | 11 | 18,589 | 9.03 | yes |
| 3 | 29,500 | 4.74 | yes | 12 | 19,400 | 10.36 | yes |
| 4 | 29,658 | 4.77 | yes | 13 | 18,202 | 13.22 | yes |
| 5 | 28,000 | 5.13 | yes | 14 | 14,811 | 15.02 | yes |
| 6 | 25,900 | 5.20 | yes | 15 | 12,900 | 12.57 | yes |
| 7 | 23,950 | 5.28 | yes | 16 | 12,460 | 10.31 | yes |
| 8 | 22,650 | 5.40 | yes | 17 | 9,518 | 6.04 | yes |
| 9 | 20,500 | 6.15 | yes | 18 | 4,427 | 2.11 | no |

Note the level-vs-stock gap in one line: fresh days RISE from 5.07 to
15.02 while the total store FALLS from 39,660 to 14,811. Fresh days
are a ratio to today's burn, not a stock count — exactly the
depositgate finding, now visible across the whole first fortnight.

## The three false stand-downs (why the cap fails)

- 51104 — the cleanest false alarm. Trend fires day 7 only (pantry
  41,940 → 30,000 over the first week, same settling shape as 51101).
  From day 8 the pantry climbs back (30,956 → 33,728 by day 9) and the
  village ends the window comfortable (32–33k, fresh days 25–28). A
  sensor that stood down on day 7 would have been standing down on a
  village about to get richer, not poorer.
- 51108 — trend fires days 10–11 (pantry 39,940 → 18,100), then the
  pantry recovers to 20,194 by day 12 and the village survives all 30
  days. A two-day slide that reverses on day 12.
- 51103 — trend fires days 7–9 and 11–13 (pantry down to 13,138 by day
  13), then recovers to 17,915 on day 14 and survives; it fires again
  on days 18–19 and still survives. The rule fires on a real dip that
  the village eats through — the difference between 51103's dip and
  51101's slide is not visible to a 5-day/20%/3-fall rule.
Non-false survivors: 51102 never fires anywhere. 51105, 51106, 51107
fire early (day 7, and days 9–17 for 51106) but NOT in their final
engaged runs — their gates disengaged mid-window, so their final runs
start on days 20, 23, 28. That is the final-run definition doing heavy
lifting (see metric review): counted anywhere, 6 of 7 survivors fire.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Yes — the voice overstates fullness while the pantry falls, in plain
words. On 51101 the "shelves are full" family runs from day 2 through
day 17 without a break (27 lines): day 2, "Maureen checks the pantry
before heading out — the shelves are full, ~5 days of fresh on hand…
leaves the fish nets standing… The pantry can't take more; the wild
will keep." Day 7 (the trend day), "Mara checks the pantry before
heading out — the shelves are full, ~5 days of fresh on hand… leaves
the harvest standing." Day 12, "Mara checks the pantry before heading
out — the shelves are full, ~10 days of fresh on hand…"; day 12 again,
"Nikolai taps the pantry door — full to bursting — and keeps the day's
share in hand. 'Dinner's on me tonight, then.'" Day 17, with the pantry
down to 9,518 kcal from 39,660, still: "Ruth checks the pantry before
heading out — the shelves are full, ~6 days of fresh on hand… The
pantry can't take more." A reader who trusts the villagers believes
the store is full. The census says the store fell on nearly every one
of those days. The mismatch is not a lie — fresh days really were
5–15 — it is the level-vs-stock gap: "days of fresh" sounds like "how
much food we have" but behaves like "how long the fresh slice lasts at
today's burn". Then the voice goes quiet (gate off day 18) and the
hunger lines take over with no bridge, exactly as the depositgate arm
reported.
Pot-stays-full prose bug: REPRODUCES in this replay, day 22, verbatim:
"💀 Leo starved. Slowly. Nobody eats much tonight. The pot stays full
and nobody touches it." Recorded here only, not re-litigated (already
filed by the depositgate arm).

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this replay carries no such fields. NO wall
movement is claimed. In-window: wave reach max 2 (6/8 seeds; wave 1 on
51101, 51106); waves 3–5 not reached in 30 days (expected — early
window). Median survival 30 days (max 30); collapses 1/8 (51101 only).
Arc II/III/IV, regional → national, table, win flag: not reachable in
this window, not measured, not claimed.

## Pilot gate (applied as written)

Bar (b) failed, so the run STOPPED: no confirm band (no 51121–51132
sims were run, no fresh seeds consumed). The confirm bars (c)–(d) are
therefore NOT judged — they are unrun, not failed. The pilot result
stands on its own as the result of this arm.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration: the panel compares lever arms through its standardized
observer/scorecard/cohort rows; this arm changes no game code, runs no
lever, and its primary metric is a within-trajectory instrument
comparison (trend rule vs level rule on identical evening pantry
series), not a panel metric. The level-vs-trend table above is reported
directly, on identical seeds and identical trajectories.

## Metric review

(1) FIRST-WEEK SETTLING CONTAMINATES THE RULE (the main finding, and
    the reason for NO-GO): every pilot seed starts near 39–42k kcal
    and sheds roughly a quarter of it in week 1 (including a ~10k step
    on day 3), so a 5-day/20%/3-fall rule fires on normal settling in
    6 of 7 surviving seeds somewhere in the window. The rule cannot
    tell "settling" from "sliding" with slope + falls alone. NEXT RUN:
    pre-register a revision — e.g. exclude the first 10 evenings, or
    require the trend to persist past a recovery check — and judge it
    on fresh seeds. No revision is applied here and nothing above is
    re-scored under one.
(2) FINAL-RUN DEFINITION IS LOAD-BEARING: the false count is 3 under
    the final-run rule but 6 counted anywhere (51105/51106/51107 fire
    early, then their gates disengage and reset the run). NEXT RUN:
    pre-register the counting rule explicitly (anywhere vs final run)
    with a reason, and report both counts as it does here.
(3) EARLINESS LEG IS STILL n=1: only 51101 collapses in the pilot, the
    same unreplicated-collapse caveat the depositgate arm carried.
    The 11-day earliness is a sensor property, not a survival claim:
    banking the eased kcal would change the trajectory, so whether a
    trend sensor would have saved 51101 is unmeasured here.
(4) EVENING-SNAPSHOT LIMIT (same as depositgate): the trend rule reads
    evening pantry while the gate decides intraday; a trend day is
    "the evening a trend-aware sensor would first have disagreed",
    not a claim about any single decision. The >= 3-day bar absorbs a
    1-day slip, but the day-7 firing's meaning (settling vs slide)
    does not turn on it.
(5) No metric, threshold, seed, or leg definition was changed mid-run.
    Prereg committed (39c6d84f5) before the analyzer ran on any real
    trajectory; the analyzer and proof test were written after the
    prereg and the pilot was judged only against its header.

## Village assessment (plain words)

The village on 51101 starts rich and eats itself down for a week
before anything goes visibly wrong — the pantry falls every day from
day 3 while everyone keeps saying the shelves are full, because the
fresh slice keeps looking healthy even as the whole store shrinks.
The slide that kills it (days 12–17) looks, to a slope rule, exactly
like the settling that opens every healthy run (days 3–7): same shape,
same speed, different ending. That is why a simple trend sensor fails
here — not because trends don't matter, but because the first week
teaches the rule the wrong lesson. The survivors show the other side:
villages dip hard and come back (51103 down to 13k, then back up;
51108 down to 18k, then back up), so standing down on a dip is not
obviously right either. What is missing is not a steeper slope
threshold but a way to tell a dip from a slide — time, or a recovery
check, or the stock level itself — and that is the next run's design
question, not a fix to land from this arm.

## Attribution limits (from prereg, unchanged)

- Evening snapshots only; intraday decisions may differ by <= 1 day.
- The trend rule is judged, not the gate: earliness is a sensor
  property, not a survival claim; the banked-food counterfactual is
  unmeasured.
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs unmeasured.
- Descriptive replay, NOT a causal claim: one collapsing seed cannot
  prove the level sensor caused the death, and this NO-GO cannot prove
  no trend sensor could work — only that THIS rule, as pre-registered,
  cries wolf too often.

## Findings for backlog (for the coordinator to append)

None from this arm. The first-week settling pattern and the final-run
sensitivity are this arm's metric review (above), not new backlog
items; the "pot stays full" line was already filed by the depositgate
arm and is recorded here only as reproduced.

## Files

- Prereg: evidence/2026-11-01/sim-trendsensor-b-prereg.md
- Analyzer: scripts/analyze-trendsensor-b.js (pure; stdin jsonl -> JSON)
- Proof test: scripts/test-trendsensor-b.js (20 pure checks; --live:
  3 replay checks, run after prereg — all green)
- Evidence: evidence/2026-11-01/sim-trendsensor-b.md (this file)
- Corpus: evidence/2026-11-01/sim-trendsensor-b-corpus/
  sim-trendsensor-b-pilot-summary.json (full per-seed trend analysis,
  pantry series, and sense lines for the 8-seed pilot replay)
- Reused verbatim, never edited: evidence/2026-11-01/
  sim-depositgate-b-armed.jsonl (depositgate armed pilot corpus)
