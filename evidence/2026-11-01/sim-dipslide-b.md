# sim-dipslide-b — DIAG: DIP-VS-SLIDE SENSOR (early-window exclusion + recovery confirmation)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1346Z, arm
sim-dipslide-b, axis food-economy. Worktree sim-dipslide-b, branch
sim-dipslide-b.
Answers the 1305Z Loop B round's metric review
(evidence/2026-11-01/sim-food-depositkeep-trendsensor-round-1305.md and
evidence/2026-11-01/sim-trendsensor-b.md): the trendsensor trend rule
was NO-GO at pilot — earliness passed on 51101 (trend day 7 vs level
stand-down 18) but 3 of 7 surviving seeds fired in their final engaged
run (51103, 51104, 51108) against a cap of 2, because the killer slide
(days 12–17) looks exactly like the first-week settling (days 3–7).
DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing script or policy file. New files only, all named
*-dipslide-b.*: prereg, analyzer, proof test, evidence, corpus. No new
sims were run in this arm — the pilot is a pure replay of the
committed depositgate armed corpus, and NO fresh-seed confirm was run
(see Pilot gate). This worker does NOT push, bump, verify live, or
merge into master; the coordinator merges.
Status to coordinator: committed on branch sim-dipslide-b, pending
coordinator merge.

## Verdict: GO (pilot) — judged exactly against the prereg bars

Prereg: evidence/2026-11-01/sim-dipslide-b-prereg.md, commit
56a7d5f38, written BEFORE any judged replay. The sensor rule (fixed
there): the trendsensor trend condition UNCHANGED (pantry fell >= 20%
over 5 evenings AND fell 3 evenings running AND level rule still
engaged), PLUS (i) early-window exclusion — candidate days with
loopDay < 8 are ignored; PLUS (ii) recovery confirmation, N = 5 — a
candidate day D confirms only if the loopDay-(D+5) evening exists, is
still inside the same final engaged run, and P(D+5) < P(D) (hence also
below P(D-5), the level five evenings before the signal). The
actionable day is confirmedDay = D+5, never the candidate day.
ConfirmedDay = first confirming candidate's confirmation evening in
the seed's final engaged run; a candidate that fails recovery does not
end the scan.

(a) 51101 EARLINESS: PASS. Candidate day 8, confirmed day 13, level
    stand-down loopDay 18, earliness 5 days (>= 3 required). The
    5-evening confirmation delay is charged against earliness here
    (the trendsensor rule's 11-day earliness was on the unconfirmed
    day-7 firing); 5 days still clears the bar with 2 days of margin.
(b) PILOT FALSE-FIRE CAP: PASS. 1 surviving pilot seed has a confirmed
    fire in its final engaged run (51103); the cap is 1. Survivors
    observed: 7 (51102–51108). Trendsensor pilot: 3.
GO requires BOTH bars. Both pass, so the verdict is GO — pilot only.
Per the prereg's pilot gate, NO fresh-seed confirm was run in this arm
under any outcome: this GO earns a fresh-seed confirm NEXT run; it does
not run one here. That restraint matters more than usual here (see
metric review 1): this design was motivated by this very corpus, so
the pilot numbers are optimistic by construction and the fresh-seed
confirm is the real test.

## Per-seed fire table (pilot replay, armed arm, 30d competent window)

cand = candidate day (first confirming candidate), conf = confirmedDay
(actionable day), levelSD = level stand-down evening (null = seed ends
engaged), false = survived seed with a confirmed fire in its final run.
eligInRun = eligible candidate days (loopDay >= 8) inside the final run.
confAny = confirmed day anywhere in the window (descriptive only —
the bars use the final run).

| seed | end | days | cand | conf | levelSD | earliness | false | eligInRun | confAny | final run |
|---|---|---|---|---|---|---|---|---|---|---|
| 51101 | village-lost | 25 | 8 | 13 | 18 | 5 | — | 8,9,10,11,15,16,17 | 13 | 1–17 |
| 51102 | survived | 30 | — | — | — | — | no | — | — | 1–30 |
| 51103 | survived | 30 | 8 | 13 | — | — | YES | 8,9,11,12,13,18,19 | 13 | 1–30 |
| 51104 | survived | 30 | — | — | — | — | no | — | — | 1–30 |
| 51105 | survived | 30 | — | — | — | — | no | — | — | 20–30 |
| 51106 | survived | 30 | — | — | — | — | no | — | 14 | 23–30 |
| 51107 | survived | 30 | — | — | — | — | no | — | 13 | 28–30 |
| 51108 | survived | 30 | — | — | — | — | no | 10,11 | — | 1–30 |

Census validity: all 8 seeds valid (rows == daysAlive, gateEngaged
boolean on every row, zero null pantry rows). No seed was excluded.
No seed lacked a final engaged run, so the no-run counting branch was
not exercised on this corpus (it is covered by a unit check instead).

## How each old false alarm was (or was not) filtered

- 51104 — filtered by the EARLY-WINDOW EXCLUSION. Its only trend
  candidate in the whole window was day 7 (pantry 41,940 → 30,000 over
  week 1, the settling shape). With loopDay < 8 ignored, it has no
  eligible candidate at all, hence no fire. From day 8 the pantry
  climbs back (30,956 → 33,728 by day 9) and the village ends the
  window at 32–33k, fresh days 25–28. The exclusion alone kills the
  cleanest false alarm from the trendsensor round.
- 51108 — filtered by the RECOVERY CONFIRMATION. Eligible candidates
  days 10 and 11 both fail recovery: P(15) = 20,908 >= P(10) = 19,700,
  and P(16) = 19,833 >= P(11) = 18,100. The two-day slide reverses by
  day 12 (20,194) and the village ends at 36,634. A sensor that waits
  five evenings before acting correctly stays quiet here.
- 51103 — NOT filtered; the one counted false fire. Candidate day 8
  confirms at day 13 (P(13) = 13,138 < P(8) = 23,168). The pantry does
  recover — but one evening too late: day 14 bounces to 17,915, the
  day AFTER confirmation. Note what lengthening the window would do:
  nothing — at day 14 the pantry (17,915) is still below the day-8
  level (23,168), so a 6-evening window confirms 51103 too. This seed's
  shape is a deep dip the village eats through on a low pantry (it
  falls further to 7,200 by day 19, then hovers at 5–8k and still
  survives all 30 days). It is a cautious stand-down, not a wild one,
  but under the pre-registered strict rule — survived + confirmed in
  the final run — it counts false, and the cap of 1 absorbs exactly
  this one. It is the known residual risk the fresh-seed confirm must
  measure, not a reason to re-tune the rule before the confirm.
- 51106 / 51107 — the final-run counting rule still doing heavy
  lifting. Both confirm somewhere in the window (days 14 and 13) but
  NOT in their final engaged runs (which start days 23 and 28 after
  mid-window disengagements), so neither counts. Counted anywhere, the
  false count would be 3 (51103 + 51106 + 51107) and bar (b) would
  fail. The confirm run must keep the final-run rule exactly as
  pre-registered here.

## Seed 51101: the slide the sensor now catches, with confirmation charged

Evening pantry: day 8 = 22,650 (candidate: 5-day fall vs day 3's 29,500
is 23%, falls on days 6, 7, 8); day 13 = 18,202, still below day 8, so
the day-8 candidate confirms on day 13 — five evenings before the
level rule stands down on day 18, while the pantry is still at 18k and
before the day 14–17 collapse leg (14,811 → 12,900 → 12,460 → 9,518).
The sensor would have stood the gate down on day 13, banking the
eased kcal from days 13–17 instead of eating them at the fire. Whether
banking that food saves the village is STILL unmeasured (the
counterfactual changes the trajectory) — earliness is a sensor
property, not a survival claim, exactly as in the trendsensor arm.

## Sense test (SENSE-TESTING LAW: read, don't just count)

On 51101's confirmed day 13, the voice still says the shelves are
full while the total store has fallen from 39,660 to 18,202:
"Mara checks the pantry before heading out — the shelves are full,
~13 days of fresh on hand… leaves the harvest standing and turns to
the stone pile instead. The pantry can't take more." A sensor that
stands down on day 13 would read to a player as the village finally
noticing the slide underneath the fresh-slice voice — sensible, not
crying wolf: the fresh slice genuinely looks healthy (13 days) while
the whole store has halved. On 51104, where the sensor now stays
quiet, the voice on day 9 already sounds like a recovery — "the
shelves are full, ~19 days of fresh on hand" — and the pantry climbs
to 33,728 the same day; staying quiet there reads sensibly too. On
51103's confirmed day 13 the voice is the same "shelves are full, ~7
days of fresh" line it gives on day 14 when the pantry bounces — the
player would hear nothing change at the moment the sensor acts, which
is the honest limit of this sensor: it acts on the stock trend, not on
a voice cue, and on 51103 it acts one evening before the bounce. The
known "pot stays full" prose bug REPRODUCES in this replay, day 22,
verbatim: "💀 Leo starved. Slowly. Nobody eats much tonight. The pot
stays full and nobody touches it." Recorded here only, not
re-litigated (already filed by the depositgate arm).

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this replay carries no such fields. NO wall
movement is claimed. In-window: wave reach max 2 (6/8 seeds; wave 1 on
51101, 51106); waves 3–5 not reached in 30 days (expected — early
window). Median survival 30 days (max 30); collapses 1/8 (51101 only).
Arc II/III/IV, regional → national, table, win flag: not reachable in
this window, not measured, not claimed.

## Pilot gate (applied as written)

Pilot GO, but the pilot gate in this prereg says STOP under any
outcome: a GO earns a fresh-seed confirm NEXT run; it does not run one
here. So NO confirm band was run, no fresh seeds were consumed, and
the confirm bars (c)–(d) from the prereg are specified but NOT judged
— they are unrun, not passed. The next run's job, in order: run the
fresh-seed confirm (armed only, competent, 30d, same substrate gates)
against the EXACT rule below, and judge (c) false-fire rate <= 25% of
surviving confirm seeds and (d) collapse earliness >= 3 on at least
one collapsed confirm seed if any collapse (else UNJUDGED).

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration: the panel compares lever arms through its standardized
observer/scorecard/cohort rows; this arm changes no game code, runs no
lever, and its primary metric is a within-trajectory instrument
comparison (dip/slide sensor vs level rule on identical evening
pantry series), not a panel metric. The level-vs-sensor table above is
reported directly, on identical seeds and identical trajectories.

## Metric review

(1) PILOT GO IS PROVISIONAL BY CONSTRUCTION (the main caveat): this
    design was motivated by the pilot corpus's own failure mode (the
    trendsensor round's three false alarms), so its pilot numbers are
    optimistic. A GO here licenses a fresh-seed confirm; it is not, by
    itself, a landing case. Do NOT revise the rule before the confirm
    — the confirm must test THIS sensor, or its result means nothing.
(2) 51103 IS THE RESIDUAL RISK, AND IT IS A ONE-DAY NEAR MISS: its
    recovery lands on day 14, one evening after the day-13
    confirmation, and no longer confirmation window fixes it (day-14
    pantry is still below the day-8 level). If the confirm band shows
    many 51103-shaped seeds — deep dips that the village eats through
    on a low pantry — the cap of 25% may fail there, and THAT is when
    a revision (e.g. a recovery-to-candidate-level test over a longer
    window, or a stock-floor condition) belongs in a NEXT design, not
    in this run's numbers.
(3) FINAL-RUN COUNTING IS STILL LOAD-BEARING: counted anywhere, the
    false count is 3 (51103, 51106, 51107), not 1. The confirm run must
    pre-register the counting rule identically (final engaged run
    only) and report both counts, as this arm does.
(4) CONFIRMATION DELAY EATS EARLINESS, BY DESIGN: 51101 earliness fell
    from 11 (unconfirmed day-7 firing) to 5 (confirmed day 13). The
    bar (>= 3) still passes with 2 days of margin, but a shorter
    future slide could see the confirmation land after the level
    stand-down. The confirm band should report earliness distribution,
    not just the >= 3 pass/fail, on any collapsed confirm seed.
(5) EARLINESS LEG IS STILL n=1: only 51101 collapses in the pilot, the
    same unreplicated-collapse caveat the depositgate and trendsensor
    arms carried. A confirmed stand-down is a sensor property, not a
    survival claim: banking the eased kcal would change the
    trajectory, so whether this sensor would have saved 51101 is
    unmeasured here.
(6) EVENING-SNAPSHOT LIMIT (same as depositgate/trendsensor): the
    sensor reads evening pantry while the gate decides intraday; a
    confirmed day is "the evening a dip/slide sensor would first have
    disagreed, after confirmation", not a claim about any single
    decision. The >= 3-day bar absorbs a 1-day slip.
(7) No metric, threshold, seed, or leg definition was changed mid-run.
    Prereg committed (56a7d5f38) before the analyzer ran on any real
    trajectory; the analyzer and proof test were written after the
    prereg and the pilot was judged only against its header. The one
    deviation from the task brief's letter, disclosed here: the brief
    said to write scripts/test-*.js proving each measurement, and the
    live test run reports 25 checks (20 pure + 5 live) — the analyzer
    output itself, not the test script, is the verdict record.

## Village assessment (plain words)

The village on 51101 starts rich, settles for a week, then slides for
real — and this time the alarm can tell the difference. The first-week
settling no longer trips it, because signals from the first seven
evenings are simply ignored. The two-day dip on 51108 no longer trips
it either, because the sensor waits five evenings and watches the
pantry climb back before it speaks. The one village it still calls
wrong is 51103, which dips hard, stays low, and survives anyway — the
sensor stands down on day 13, and the pantry bounces the very next
day. That is a cautious mistake, not a panicked one, and the strict
count allows exactly one of them. What is still missing is not a
cleverer slope but proof on villages this sensor has never seen: the
next run must take it to fresh seeds and see whether the dip-vs-slide
distinction holds up there, or whether 51103 was the first of a crowd.

## Attribution limits (from prereg, unchanged)

- Evening snapshots only; intraday decisions may differ by <= 1 day.
- The sensor is judged, not the gate: earliness is a sensor property,
  not a survival claim; the banked-food counterfactual is unmeasured.
- Single policy (competent) by design; other policies may pantry
  differently. 30-day early window only; late-game legs unmeasured.
- Descriptive replay, NOT a causal claim: one collapsing seed cannot
  prove the level sensor caused the death, and this pilot GO cannot
  prove the sensor works in general — the fresh-seed confirm next run
  is the test that would.

## Findings for backlog (for the coordinator to append)

None from this arm. The 51103 residual shape and the final-run
sensitivity are this arm's metric review (above), not new backlog
items; the "pot stays full" line was already filed by the depositgate
arm and is recorded here only as reproduced.

## Exact sensor rule as specified for the NEXT run's fresh-seed confirm

(Do NOT re-tune before the confirm. Implement live from pantry history
alone, or replay exactly as here.)

- Evening pantry series P(d) = evening pantryKcal on lived day d.
- CANDIDATE on evening D iff: (i) at least 5 prior evening rows;
  (ii) P(D) <= 0.80 * P(D-5); (iii) P(D-2) < P(D-3) AND P(D-1) < P(D-2)
  AND P(D) < P(D-1); (iv) gateEngaged true that evening. Null pantry
  rows break all chains and are never candidates.
- ELIGIBLE iff loopDay D >= 8 (signals on loopDays 1–7 ignored).
- CONFIRMS iff the loopDay-(D+5) evening row exists with a numeric
  pantry reading, lies inside the same final engaged run (gateEngaged
  true), AND P(D+5) < P(D).
- Scan eligible candidates in the final engaged run ascending; the
  first that confirms gives (candidateDay = D, confirmedDay = D+5).
  A candidate that fails recovery does not end the scan. If none
  confirms, confirmedDay is null.
- Final engaged run = maximal consecutive gateEngaged=true evenings
  ending at the seed's last engaged evening. Level stand-down day =
  first gateEngaged=false evening after that run (null if the seed
  ends engaged). Earliness = levelStandDown - confirmedDay.
- Counting: a fire counts as a false alarm only if it is a confirmed
  fire in a seed's final engaged run. Seeds with no final engaged run
  count as no-run, never false. Fires outside the final run are
  reported descriptively only.
- Confirm bars (next run): (c) false-fire rate <= 25% of surviving
  confirm seeds; (d) if any confirm seed collapses, at least one
  collapsed confirm seed has earliness >= 3, else (d) UNJUDGED.

## Infrastructure notes (for the coordinator)

- The container write-denial (EPERM) flap hit this run hard: the stock
  scripts/safe-commit.sh failed 11 consecutive times (its private index
  lives at /tmp/idx-safecommit-$$ and git could not write the lock
  file), and worktree writes flapped intermittently during the same
  window. Recovery that worked: a byte-identical copy of
  safe-commit.sh with ONLY the IDX path changed (from
  /tmp/idx-safecommit-$$ to a worktree-local path), used for the
  prereg commit and (below) the closeout commit, then DELETED, never
  committed. The commits themselves are standard safe-commit commits
  (private index from HEAD, HEAD-move check, message + file list
  verified in git show --stat).
- The safe-commit index-clobber class hit the prereg commit: after it,
  the main index showed the prereg file as a staged deletion alongside
  its untracked copy. Repaired via git update-index --add --cacheinfo
  from the HEAD blob (061b78e3), then verified git status --short
  clean apart from the temporary script copy. The commit itself was
  correct throughout.

## Files

- Prereg: evidence/2026-11-01/sim-dipslide-b-prereg.md
- Analyzer: scripts/analyze-dipslide-b.js (pure; stdin jsonl -> JSON)
- Proof test: scripts/test-dipslide-b.js (20 pure checks; --live:
  5 replay checks including determinism + independent 51101
  recomputation, all green — 25/25 total)
- Evidence: evidence/2026-11-01/sim-dipslide-b.md (this file)
- Corpus: evidence/2026-11-01/sim-dipslide-b-corpus/
  sim-dipslide-b-pilot-summary.json (full per-seed dip/slide analysis,
  pantry series, and sense lines for the 8-seed pilot replay)
- Reused verbatim, never edited: evidence/2026-11-01/
  sim-depositgate-b-armed.jsonl (depositgate armed pilot corpus)
