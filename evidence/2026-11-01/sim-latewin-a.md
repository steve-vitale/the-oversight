# sim-latewin-a — late wave-4 + fast lesser win census, replication band (MEASUREMENT ONLY)

Run: Loop A worker, axis scale-onramp, run fleshout-loop-a-20261101T1935Z.
Worktree branch: sim-latewin-a.
Base anchor: per-seed JSONs (`anchorCommit` field; worktree HEAD at
sweep time be352e2cb3, Loop A round 1742Z coordinator evidence).
Pre-registration: evidence/2026-11-01/sim-latewin-a-prereg.md
(written BEFORE any judged sims; judged against it below).
Instrument: scripts/herald-instrument-20261030.js (HERALD=1,
verbatim reuse) + scripts/policies/muster-diag.js (MUSTER=1,
verbatim reuse) + NEW scripts/latewin-sweep-20261101.js
(heraldcontact sweep with output dir + daily timeline snapshot
added; no other behavioral change) + NEW
scripts/latewin-analyze-20261101.js (derives every judged number
from per-seed JSONs only).
Proof: scripts/test-latewin-20261101.js — 8/8 green (synthetic
rows only; no band seeds), plus a corpus determinism leg: seed
87127 re-run with this arm's sweep to a scratch dir is
byte-identical to the judged JSON.
Corpus: evidence/2026-11-01/perseed-latewin/leadfeast/ (19 judged
seeds) + sim-latewin-a-analysis.json + pilot/confirm logs.
No game code changed. No policy file edited. No [needs-eyes]
(measurement only, nothing player-facing). Panel (§15): NOT
APPLICABLE — single-base DIAG measurement, no before/after
comparison exists in this arm; none fabricated.

## Verdict: DIAG-GO

Judged exactly against the prereg's bars:

- Complete timelines: 19/19 judged seeds (bar: >= 8). Timeline
  rows cover every run; instrumentErrors 0 on all 19.
- Wins-before-titan-road-possible fraction, stated with counts:
  6 of 11 wins closed before omen stage 2 could be reached
  (roadPossibleBeforeWin false). See the table below.
- 87120's pattern: NOT reproduced in its exact 144 -> 146 shape
  on this base (see "The replication result" — on this base
  87120 never reaches wave 4 and wins on day 163), BUT the
  shape the question is about — a lesser win closing before
  the titan road could possibly be ready — is the MAJORITY
  pattern on this band (6/11 wins), not an outlier. The band's
  minimum winDay-placeDay gap is 3 days (87119); the minimum
  winDay-wave4Day gap among wins is 6 days (87126, 87134).
  So the verdict is DIAG-GO with the reproduction call stated
  as BOUNDED-AS-OUTLIER-ON-THIS-BASE for the exact seed, and
  GENERALIZED for the shape: 87120's 2-day gap does not
  reproduce, but wins-before-the-road do, at majority rate.
- Pilot gate: GO. 8/8 pilot seeds ran, instrument fired on all
  8, instrumentErrors 0, and 4 pilot seeds have complete
  timelines with wave-4 day + end day observed (bar: >= 1).
  Confirm (all 11 remaining selected seeds) therefore ran.
- Seat split, kept separate everywhere: wins 11, ALL lesser,
  0 full, 0 seat-none. Full seat is still 0 everywhere.

## Answer in one paragraph

On this base, the lesser win routinely closes before the titan
road could possibly be ready — it is the normal shape of a win,
not 87120's freak accident. Of 11 wins, 6 closed with omen
stage 2 never reached before the win (three of them with the
omen never even started, two with wave 4 unlocked just 6 days
before the win, one stuck at omen stage 1); only 3 wins waited
out the brief's literal 13-day placement-to-win gap, and the
fastest placed-then-won win took just 3 days from placement to
win. The reason is structural, not a race the road loses by a
nose: the table's clock (deeds + regional+ scale + a seat) runs
on a different, faster track than the omen clock (wave 4 +
regional+, then a 10%-per-dawn omen start, then 9+ days of
staging with roll luck). A village can therefore win the game
without ever meeting the Herald — 87120 itself did exactly that
on this base, winning on day 163 with no wave 4, no omen, and a
pantry too full to take more food. The titan road is not late
relative to the win; it is parallel content the lesser win does
not require. Whether that is intended is a design question for
Steve (see "Backlog candidate"), not a measurement gap: the
numbers say the lesser win is reachable before the titan road
opens, by design or by drift, on a majority of wins.

## The replication result (87120, read carefully)

Heraldcontact-a's record (base 7c3295767): 87120 reached wave 4
on day 144 and won on day 146, omen never started. This arm's
re-measurement (base be352e2cb3, same policy stack, control
verified — see "Base movement"): 87120 never reaches wave 4
(maxWave 3), reaches national on day 77, table on day 163, and
wins the lesser seat on day 163, omen never started. The exact
144 -> 146 shape does NOT reproduce on the current base. What
does reproduce, more strongly, is the underlying claim: a
lesser win with no titan road at all. 87120 is bounded as an
outlier in its exact numbers (base movement moved its whole
trajectory), and the shape it exemplified is generalized by
the other 10 wins. Quoting "wave 4 day 144, win day 146" as a
current-base fact would be wrong; it is a prior-base record.

## Timeline table (all 19 judged seeds; null = never)

Columns: wave-4 day, omen start day, titan placement day
(first stage-2 day), national day, table day, win day + seat,
win-minus-wave4 gap, win-minus-placement gap, road possible
before win (placement <= win day), brief-13 fit
(win-minus-placement >= 13). End gaps for un-won seeds are in
the analysis JSON, not win gaps.

| seed | w4 | omen | place | nat | table | win (seat) | wGap | pGap | road | b13 |
|------|----|------|-------|-----|-------|------------|------|------|------|-----|
| 87103 | — | — | — | — | — | — (lost d60) | — | — | no | no |
| 87104 | 149 | 160 | 171 | 77 | — | — (lost d196) | — | — | no | no |
| 87107 | 69 | 70 | 79 | 77 | 60 | 90 (lesser) | 21 | 11 | YES | no |
| 87109 | 102 | 107 | 119 | 77 | — | — (lost d140) | — | — | no | no |
| 87115 | — | — | — | 77 | — | — (cap d201) | — | — | no | no |
| 87119 | 67 | 78 | 87 | 80 | 64 | 90 (lesser) | 23 | 3 | YES | no |
| 87120 | — | — | — | 77 | 163 | 163 (lesser) | — | — | no | no |
| 87121 | 52 | 53 | 63 | 82 | 66 | 91 (lesser) | 39 | 28 | YES | YES |
| 87123 | 75 | 79 | 94 | 86 | 113 | 114 (lesser) | 39 | 20 | YES | YES |
| 87124 | 33 | 52 | 64 | 77 | 62 | — (lost d83) | — | — | no | no |
| 87126 | 84 | — | — | — | 79 | 90 (lesser) | 6 | — | no | no |
| 87127 | — | — | — | 78 | 127 | 127 (lesser) | — | — | no | no |
| 87128 | 42 | 52 | 61 | — | 79 | 90 (lesser) | 48 | 29 | YES | YES |
| 87132 | 69 | 74 | — | 77 | 59 | 94 (lesser) | 25 | — | no | no |
| 87134 | 84 | — | — | 85 | 72 | 90 (lesser) | 6 | — | no | no |
| 87135 | 88 | 122 | 134 | 105 | — | — (lost d163) | — | — | no | no |
| 87137 | — | — | — | — | — | — (lost d58) | — | — | no | no |
| 87138 | 40 | — | — | 77 | 47 | 90 (lesser) | 50 | — | no | no |
| 87140 | 57 | 63 | 74 | — | 58 | — (lost d76) | — | — | no | no |

Reading the wins (11, all lesser): before the road, 6 —
87120 (no omen), 87127 (no omen), 87126 (wave 4 d84, win d90,
omen never started), 87134 (same 6-day shape), 87132 (omen
stage 1 at win, never placed), 87138 (wave 4 d40, win d90,
omen never started). Road reached but brief-13 missed, 2 —
87107 (11 days), 87119 (3 days). Brief-13 fit, 3 — 87121 (28),
87123 (20), 87128 (29). Minimum winDay-placeDay gap: 3 days.
Minimum winDay-wave4Day gap: 6 days. No win has a negative
or zero gap; no censored field was ever imputed as 0.

Wall numbers on the judged band: national 15/19, table 13/19,
wins 11/19 (all lesser), wave-4 reach 14/19, wave-5 reach 1/19
(87128), median survival 90 days (day-90 win cluster persists:
6 wins on day 90, 2 more on days 91/94), max survival 201.

## Base movement — the screen-vs-sweep disagreement, explained

The prereg's same-base leg (a) FAILED in its naive form and
the failure is explained, not smoothed: this arm's sweep
disagrees with heraldcontact-a's screen on pilot seeds
(87127: screen un-won d201 maxWave 4 omen 2; this sweep won
d127 maxWave 3 omen null; 87120: screen-equivalent 144/146
vs this sweep no-wave-4/win-163; 87137: screen d136 maxWave
4 omen 2 vs this sweep lost d58 maxWave 3). CONTROL: the
ORIGINAL heraldcontact sweep, unmodified, run on THIS base
for 87127 reproduces this arm's result exactly (won d127,
maxWave 3, omen null) — so the divergence is BASE MOVEMENT
between 7c3295767 (Oct 31) and be352e2cb3 (Nov 1), not
instrument perturbation. My timeline snapshot + say ring move
nothing: same seed, same stack, same base, same numbers with
and without them. Consequence, stated plainly: heraldcontact
numbers and latewin numbers are NOT comparable seed-by-seed
across the base move; the latewin verdict judges THIS base
only, and any future replication arm must re-screen on its
own base instead of reusing the Oct 31 screen. The timeline-vs-
census wave-4 cross-check agrees on all 19 seeds (timeline
w4 day == census w4 day everywhere, including the 149/102/67
pilot values), so the instrument itself is consistent.

## Pilot gate (judged, then confirm ran)

Pilot (87104, 87115, 87119, 87127, 87137, 87140, 87109, 87120):
8/8 ran, instrument fired on all 8, instrumentErrors 0,
timeline rows cover every run, and 4 pilot seeds have
complete timelines with wave-4 day + end day observed
(87104, 87109, 87119, 87140) — bar was >= 1. GO. Confirm =
all 11 remaining selected seeds (prereg-fixed deviation from
12–16: the pool yielded only 19 selectable seeds).
Run incident, recorded not hidden: the first pilot invocation
was killed by a runtime restart after 3 seeds (87104, 87115,
87119 — their JSONs survived intact); the remaining 5 pilot
seeds were run in a second invocation, and the pilot log
keeps both invocations. No seed was double-counted; the
determinism leg proves re-runs are byte-identical.

## Sense-testing: does the win read earned, late-road, or skipped?

Two transcripts read, final days only (say ring, last 200
lines per seed):

- 87120 (win d163, no wave 4, no omen — the replication seed
  on this base): the final days read as a village at the top
  of its game, not a village skipping content. Pantry racks
  hold 32,769 kcal ("more than the haven can eat before it
  turns"), ~70 days of fresh on hand; villagers teach (Debbie
  teaches Cassava by drawing it in the dirt), gossip by the
  fire, get mauled by monsters and bound up, fend off a night
  raid, and give 1,574 kcal to The Bloodied ("The fire network.
  That's what it's FOR."). On d162: "The table is being set —
  a lesser seat, priced for what you built." The win reads
  EARNED on the village's own terms — and the titan road
  feels ABSENT, not late: nothing in the final days mentions
  a titan, an omen, or a call, because the village never met
  one. It won a different game (scale + table) without ever
  touching wave 4.
- 87119 (win d90, placement d87, gap 3 — the closest analog
  to 87120's 2-day shape): the table scene itself names the
  Herald — "THE HERALD came. Named and located" — as a
  retrospective line in the audit, alongside real deeds
  (waves 1–3 faced 10/6/4, 1 wave-4 fought, 6 contests, 3
  crises, food truth shared). The win reads EARNED, and the
  road reads LATE-BY-CONSTRUCTION: placed three days before
  the table closed the run, it could only ever appear in the
  win as a name, never as a road traveled. No muster was
  sounded, no call made, no coalition gathered — and the win
  does not feel like it skipped content the village was
  mid-way through, because the village was never on that road.

Judgment: neither transcript reads as a skipped-content win.
Both read as a lesser win that does not require the titan
road — the road is parallel content, and on most wins it
simply has not opened yet when the table prices the run.

## Backlog candidate (for the coordinator to file, not filed here)

#1619 follow-up, needs a Steve design ruling before any build:
is the lesser win SUPPOSED to be reachable before the titan
road opens, or should the titan road open earlier relative
to the win? Measured facts for the ruling: 6/11 lesser wins
close before stage 2; the table's own audit text already
claims the Herald ("named and located") on a win that never
fought it; the full seat is still 0/11, so the titan road's
role in the FULL seat is unmeasured by this arm. No gate
threshold is proposed here — this arm is DIAG, and moving a
gate to force the road earlier would also move the day-90
win cluster, which is a separate measurement.

## Metric review (for the NEXT run)

- The brief's 13-day figure double-counts (stage-2 gate
  compares against the original omen day: earliest stage 2 is
  omen-start + 9 days, not + 13). This arm judged BOTH tests
  (road-possible and brief-13) and the verdict does not depend
  on which is used: 6/11 wins fail even the road-possible
  test, and only 3/11 pass the stricter brief-13 test. A next
  run should pre-register the code-correct 9-day minimum and
  report "stage 2 reached before win" as the single road test.
- The longevity screen does not survive a base move: reusing
  heraldcontact-a's Oct 31 screen on the Nov 1 base selected
  seeds whose trajectories had changed (87127 won d127 instead
  of surviving to d201). Future replication arms should
  re-screen on their own base; the selection rule itself is
  sound, its inputs are base-dated.
- tableDay precedes nationalDay on several wins (87107 table
  d60 vs national d77; 87119 table d64 vs national d80):
  tableWaiting triggers at regional+ with a lesser+ seat,
  so "table day" is not a national-day proxy. A next run
  measuring the scale road should record first-regional day
  too, or stop using tableDay as a scale milestone.
- The day-90 win cluster persists on this base (6 wins on
  exactly day 90). It censored nothing here (the band's wins
  span d90–d163), but any arm hunting late content on this
  stack should still screen for longevity — the cluster is
  where wins pile up, and it sits well inside the omen clock.
