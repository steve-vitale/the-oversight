# sim-depositgate-b — DIAG: DEPOSITGATE fire-eating vs coming collapse

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1130Z, arm
sim-depositgate-b. Worktree sim-depositgate-b, branch sim-depositgate-b.
Answers Loop B round 1030Z next blank #4 (DEPOSITGATE fire-eating vs
coming collapse, corroborated on seed 51101 by sim-supplyleg-b).
DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing policy file or existing script. New files only: prereg,
depositgate trace driver, depositgate analyzer, census proof test
(named test-depositgate-b-census.js because test-depositgate-b.js
already exists from 2026-10-22 and was NOT edited), evidence, censuses,
corpus extract. sim-harness and policies/competent.js REUSED VERBATIM.
This worker does NOT push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on branch, pending
coordinator merge.

## Verdict: GO — judged exactly against the prereg bars; substantive verdict SUPPORTED (with the strength grading below, read it)

Prereg: evidence/2026-11-01/sim-depositgate-b-prereg.md, commit
d153e272a, written BEFORE any judged sim. Its GO bars (a)–(c), all met
on the pilot 8 AND on the combined 20-seed band:
(a) INSTRUMENT CONTRAST: control (DEPOSITGATE=0) eased-fire total = 0
    exactly on all 20 seeds; armed (DEPOSITGATE=1) eased-fire total > 0
    on all 20 armed seeds (min 13,159 kcal).
(b) ACCOUNTING TIE: per seed, |easedIntakeKcal − (shareEased +
    holdbackKcal)| = 0 on all 40 seed-arms (tolerance was 10 +
    nEasedEvents). Every kcal eaten at the fire ties to a recorded
    eased share. No exceptions.
(c) CENSUS COMPLETE: a per-day row for every lived day on all 40
    seed-arms, gateEngaged flag present on every row.
(d) VERDICT RULE (fixed before judging): SUPPORTED, on pilot and on
    combined band — >= 1 collapsed seed (51101) has preCollapse7 > 0
    (148 kcal) AND >= 1 fullWhileFalling day exists (118 pilot, 285
    combined). GO authorizes NO src/js fix and NO default change.

STRENGTH GRADING (honest, not in the prereg rule — the rule is what
it is, and this grading is how much weight each leg carries):
- The preCollapse7 leg is THIN: 148 kcal, a single day-18 share, in
  the 7 days before the collapse. The bulk of 51101's fire-eating
  happened days 12–17, during the slide, not in the final week — by
  then the gate had correctly stood down (see slide table).
- The fullWhileFalling leg is NON-SPECIFIC: the gate is engaged ~28
  of 30 days on armed seeds, and pantries fall on many days in normal
  play, so "engaged + falling" fires 9–20 days per seed whether or
  not a collapse is coming. It proves the sensor is a LEVEL (fresh
  days > 4), not a TREND — it cannot by itself mean "collapse
  coming". The confirm band adds 167 more such days and ZERO new
  collapses, which confirms the non-specificity.
- The finding that actually carries weight is the SLIDE + TWIN below:
  one seed where the gate fired for 6 straight days while the pantry
  halved, and whose gate-off twin survived comfortably. That is n=1
  and descriptive, not causal — and the confirm band did NOT replicate
  a collapse (19/19 confirm seeds survived in both arms).

## The answer in one paragraph

Under competent play, the gate fires almost every day (mean 28 of 30
engaged days) and diverts a large amount of food from the pantry to
the fire — mean 47,448 kcal per 30-day seed (range 13,159–80,693),
about 83% from the meal-share channel and 17% from return/big-haul
holdbacks — and villages overwhelmingly survive it anyway (19/20
armed seeds survive; 20/20 control). The gate is not a general
village-killer. But its "full" heuristic is a level reading, not a
trend reading: it keeps firing while the total pantry falls, as long
as FRESH days stay above 4. On seed 51101 that meant 6,442 kcal eaten
at the fire over days 12–17 while the pantry fell from 18,589 to
9,518 kcal, with villagers still saying "the shelves are full, ~13
days of fresh on hand". By day 18 the fresh sensor finally cleared
(2.11 days), the gate stood down, and the village was already in
free fall: pantry 4,427 → 0, hungryStreak 0 → 5, Leo starved day 22,
HUNGER WINTER day 22, scattering day 25. The gate-off twin of the
same seed never drops below ~12,700 kcal and survives all 30 days
with 11 alive. The gate did not fire during the starvation week —
its stand-downs worked — but it spent the slide eating instead of
banking, and the bank was not there when the slide became a fall.

## Per-seed table (armed arm, 30d competent window)

eased = shareEased + holdbackKcal (kcal eaten at the fire). fwf =
fullWhileFalling days (evening engaged + pantry fell vs prior
evening). pre7 = eased kcal in the 7 days before the collapse day
(0 for survivors by definition). All accounting diffs 0; all
censuses complete. Control arm: eased 0 on all 20 seeds, engaged 0
by definition (gate off), 20/20 survived — full control rows live in
the .jsonl files, not repeated here.

| seed | end | days | eased | share | holdback | engaged | fwf | pre7 | wave |
|---|---|---|---|---|---|---|---|---|---|
| 51101 | village-lost | 25 | 13,159 | 8,001 | 5,158 | 17 | 13 | 148 | 1 |
| 51102 | survived | 30 | 48,412 | 37,731 | 10,681 | 30 | 16 | 0 | 2 |
| 51103 | survived | 30 | 38,218 | 31,689 | 6,529 | 30 | 20 | 0 | 2 |
| 51104 | survived | 30 | 71,697 | 64,392 | 7,305 | 30 | 12 | 0 | 2 |
| 51105 | survived | 30 | 69,238 | 61,094 | 8,144 | 29 | 12 | 0 | 2 |
| 51106 | survived | 30 | 16,477 | 13,414 | 3,063 | 26 | 19 | 0 | 1 |
| 51107 | survived | 30 | 30,244 | 22,823 | 7,421 | 29 | 17 | 0 | 2 |
| 51108 | survived | 30 | 80,693 | 71,905 | 8,788 | 30 | 9 | 0 | 2 |
| 51109 | survived | 30 | 57,917 | 53,339 | 4,578 | 30 | 9 | 0 | 1 |
| 51110 | survived | 30 | 51,855 | 41,994 | 9,861 | 30 | 17 | 0 | 2 |
| 51111 | survived | 30 | 60,841 | 51,191 | 9,650 | 30 | 13 | 0 | 2 |
| 51112 | survived | 30 | 52,163 | 42,566 | 9,597 | 30 | 11 | 0 | 2 |
| 51113 | survived | 30 | 24,792 | 18,795 | 5,997 | 23 | 14 | 0 | 2 |
| 51114 | survived | 30 | 22,567 | 15,703 | 6,864 | 24 | 19 | 0 | 2 |
| 51115 | survived | 30 | 56,501 | 46,338 | 10,163 | 30 | 15 | 0 | 2 |
| 51116 | survived | 30 | 60,726 | 49,268 | 11,458 | 30 | 13 | 0 | 2 |
| 51117 | survived | 30 | 36,486 | 29,945 | 6,541 | 26 | 16 | 0 | 1 |
| 51118 | survived | 30 | 62,218 | 51,331 | 10,887 | 30 | 9 | 0 | 2 |
| 51119 | survived | 30 | 44,713 | 31,607 | 13,106 | 30 | 16 | 0 | 2 |
| 51120 | survived | 30 | 50,041 | 41,130 | 8,911 | 30 | 15 | 0 | 2 |
| MEAN (armed) | — | 29.8 | 47,448 | 39,213* | 8,235* | 28 | 14 | — | — |

* Share/holdback means are over all 20 armed seeds (39,213 /
8,235 — about 83/17); the accounting tie holds on all 40 seed-arms. Homecoming-keep voice lines: 32
across the armed band (scholar homecomings are rare — the competent
scholar camps wild — but the keep does fire sometimes). Tribute
waived: 0 kcal on every seed — no tribute exists in a 30d pre-seat
window, so the waiver channel is unmeasured here, not zero-by-design.

## Seed 51101: the slide, day by day (armed arm)

Evening census rows. eng = evening gateEngaged (a day can still ease
while the evening reads disengaged — see day 18 note).

| day | pantry | freshDays | est | eng | streak | alive | eased | delta |
|---|---|---|---|---|---|---|---|---|
| 12 | 19,400 | 10.36 | 12 | yes | 0 | 11 | 641 | +811 |
| 13 | 18,202 | 13.22 | 15 | yes | 0 | 11 | 1,478 | −1,198 |
| 14 | 14,811 | 15.02 | 17 | yes | 0 | 10 | 1,417 | −3,391 |
| 15 | 12,900 | 12.57 | 14 | yes | 0 | 10 | 917 | −1,911 |
| 16 | 12,460 | 10.31 | 12 | yes | 0 | 10 | 756 | −440 |
| 17 | 9,518 | 6.04 | 7 | yes | 0 | 10 | 1,233 | −2,942 |
| 18 | 4,427 | 2.11 | 2 | no | 0 | 10 | 148 | −5,091 |
| 19 | 6,950 | 2.61 | 2 | no | 1 | 10 | 0 | +2,523 |
| 20 | 1,916 | 0.61 | 0 | no | 0 | 10 | 0 | −5,034 |
| 21 | 610 | 0.19 | 0 | no | 1 | 10 | 0 | −1,306 |
| 22 | 1,036 | 0.35 | 0 | no | 2 | 10 | 0 | +426 |
| 23 | 1,369 | 0.48 | 0 | no | 3 | 9 | 0 | +333 |
| 24 | 0 | 0.00 | 0 | no | 4 | 9 | 0 | −1,369 |
| 25 | 0 | 0.00 | 0 | no | 5 | 9 | 0 | 0 |

Read it as: six engaged days (12–17) eat 6,442 kcal at the fire while
the pantry halves; the sensor still reads 6–15 fresh days throughout
because fresh days are a ratio to the measured burn, not a stock
count. Day 18's 148 kcal eased even though the evening reads
disengaged — the meal loop eased while fresh days were still above 4
earlier in the day, and the evening snapshot caught the fall after.
That is an intraday-sensor note, not an error: the gate reads the
sensor at each decision, and the evening flag is only a snapshot.
Days 19–25 the gate is fully off (fresh < 4, then hungryStreak >= 3
from day 23) — the stand-downs work exactly as designed. The collapse
is not "the gate kept eating through starvation". It is "the gate
ate through the slide, then correctly stopped, too late".

Twin contrast (same seed, gate off): control 51101 survives 30 days,
pantry 12,783–16,990 kcal across days 21–30, fresh days 5.34–7.01,
11 alive throughout. The armed twin loses a villager day 14
(dehydration of the scholar? — deaths list: day 13 scholar death by
dehydration, village continues under succession; day 22 Leo starves)
and ends at 9 alive, village-lost. n=1: the twin difference is
consistent with "banking matters on this seed", not proof the gate
caused the death — trajectories diverge from the first eased share,
so many downstream differences (including the day-13 scholar death)
are entangled with it.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Seed 51101 armed, days 11–25, reads sensically — and that is the
problem, not a comfort. The villagers' spoken sensor matches the
code's sensor exactly, so they sound reasonable while the store
halves: day 11–14, "Mara checks the pantry before heading out — the
shelves are full, ~9 days of fresh on hand… leaves the harvest
standing" / "~13 days of fresh on hand"; day 12, "Nikolai taps the
pantry door — full to bursting — and keeps the day's share in hand.
'Dinner's on me tonight, then.'"; day 13, "Mara sets the sharing
basket down by the fire instead of the pantry. 'Full shelves don't
need my little more.'"; day 14, "Leo returns from foraging the
wilds: +244 kcal to the pantry — the shelves are full, so 243 kcal
is eaten at the fire instead." A reader who trusts the villagers
believes the shelves are full. The census says the total pantry fell
every one of those days. The mismatch is not a lie — fresh days
really were 10–15 — it is a LEVEL-vs-STOCK gap: "days of fresh"
sounds like "how much food we have" but behaves like "how long the
fresh portion lasts at today's burn". Then the voice goes quiet
(the gate is off, so no more fire lines) and the hunger lines take
over without any bridge: day 18 "STARVING: health and energy
falling", day 22 "Leo starved. Slowly. Nobody eats much tonight. The
pot stays full and nobody touches it." (that pot line reads
incoherent on a starvation night — a small prose bug, filed below,
not smoothed), "CRISIS — THE HUNGER WINTER. Three days now the
village has gone to sleep hungry. The pantry is an echo.", day 25
"Haven couldn't hold. On the third hungry day, people started
walking — in different directions. The scattering, again." The
arc is legible: confident fire-eating, then silence, then hunger,
then walking. What is missing is any voice noticing the slide while
it happens — nobody says "the shelves were fuller last week".
Two smaller sense notes: the scholar's own "STARVING: the spiral has
started" flag fires day 11 while the village reads full — that is
the away scholar starving out wild, not village hunger (village
hungryStreak 0), but the line does not say so; and the day-13
scholar death by dehydration passes with no village-level beat in
this extract (succession carries the village on, correctly, but
quietly).

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins — those
are late-game states, and this census carries no such fields. NO wall
movement is claimed. In-window: wave reach max 2 (armed 16/20 seeds,
control 17/20); wave 1 on the rest; waves 3–5 not reached in 30 days
in either arm (expected — this window is early game). Median
survival 30 days both arms (max 30); collapses armed 1/20, control
0/20; village-lost armed 1, control 0. Arc II/III/IV, regional →
national, table, win flag: not reachable in this window, not
measured, not claimed.

## Pilot gates (both passed, before judging)

(1) INSTRUMENT CONTRAST (proof test --live, seed 51101, run twice
with identical numbers): control eased 0, armed eased 13,159,
accounting diff 0 — twice, byte-identical trajectories, confirming
determinism. (2) NONZERO CAPTURE: armed eased > 0 on all 8 pilot
seeds. No confirm band was needed by the pilot gate — but the prereg
REQUIRED a confirm band on GO, and it ran: 12 fresh seeds
(51109–51120), both arms, all 24 seed-arms complete, zero failed
seeds after per-seed retries (see infrastructure note).

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration: the panel compares lever arms through its standardized
observer/scorecard/cohort rows; this arm changes no game code and its
primary metric is a per-day gate-ledger census, not a panel metric.
The DEPOSITGATE 0/1 contrast is an instrument control, reported
directly above on identical seeds, not a lever comparison under §15.

## Metric review

(1) SCATTERED-FLAG CONTAMINATION (instrument definition, not a
verdict change): the prereg defined scattering as endReason
'village-lost' OR any say line containing 'scattering'. The say-line
half overcounts badly: survived seeds match flashbacks ("the
scattering took the one person you were keeping alive"), monster
flavor ("wing-scales scattering like sparks"), and the Taken thread
("Taken at the Scattering"). True scattering events in this band = 1
(51101 armed, "Haven couldn't hold… The scattering, again.").
The verdict rule uses collapsed (endReason), so the verdict is
unaffected — but the analyzer's `scattered` counts (armed 9/20,
control 7/20) must NEVER be quoted as scattering rates. NEXT RUN:
define scattering by the exact "Haven couldn't hold" line or by
endReason only.
(2) FULLWHILEFALLING IS TOO WEAK A LEG: engaged ≈ every day, and
pantries fall on many normal days, so the leg is near-trivially
satisfied (285 days combined). It measures "the sensor is a level",
not "a collapse is coming". NEXT RUN: pre-register a stricter form
— e.g. engaged days where the pantry falls 3 days running, or
engaged days within 14 days of a collapse — and judge the gate on
that.
(3) PRECELLAPSE7 WINDOW IS THIN BY CONSTRUCTION: the gate stands
down exactly when hunger arrives (fresh < 4, then streak >= 3), so a
7-day pre-collapse window will usually catch little or nothing. The
informative window on 51101 was the 6-day slide BEFORE the sensor
cleared, not the 7 days before death. NEXT RUN: pre-register a
"slide window" (engaged days while pantry falls >= 25% over the
window) alongside, not instead of, the pre-collapse window.
(4) EVENING-SNAPSHOT LIMIT: gateEngaged is an evening read; decisions
ease intraday (day-18 148 kcal). Day attribution may be off by one
day at most; the 7-day and slide windows absorb it, but a future
per-decision census should log the sensor at each easing call.
(5) HOMEKEEPING: homecoming keep kcal is voice-counted only (32
lines armed band) because the keep is not ledgered — a kcal measure
would need driver-side pack observation at returnToVillage, a
possible next instrument, not a claim made here.
(6) No metric, threshold, seed, or leg definition was changed
mid-run. The SUPPORTED verdict stands as written; the strength
grading above is interpretation, not a re-score.

## Findings for backlog (for the coordinator to append)

- DEPOSITGATE LEVEL-VS-TREND SENSOR: the gate's "full" heuristic
  (fresh days > 4) fires through a halving pantry because it reads a
  level, not a trend. On 51101 it ate 6,442 kcal during a 6-day slide
  while villagers kept saying the shelves were full. Whether the
  sensor should also read trend (or the voice should name the stock)
  is a design question, not a bug report — the gate behaves exactly
  as coded, and its stand-downs work.
- "POT STAYS FULL" PROSE BUG (small): on Leo's starvation night
  (51101 day 22) the line reads "The pot stays full and nobody
  touches it" while the pantry is an echo. Either the pot is a
  different pot (unstated) or the line misfires on starvation nights.
- SCHOLAR-STARVING LINE NEEDS AN AWAY MARKER (small): the scholar's
  "STARVING: the spiral has started" fires while the village reads
  full because the scholar is away from the pantry; the line does not
  say that, so it reads as village hunger.

## Infrastructure note (EPERM write-denial flap, 2026-11-01)

This run fought the flap harder than any previous arm in this lane,
and the mitigations are now IN the committed instrument:
- ~12:19: two confirm launches failed fast (exit 1, empty logs) —
  consistent with flap-denied reads at startup plus a flap-denied
  stderr write swallowing the trace.
- ~12:20: driver stdout JSON writes EPERMed twice AFTER completed
  sims (seed 51101 armed reproduced village-lost day 25, then the
  write died) — the sim result was lost both times.
- Fix committed to the driver: callback-based stdout writes with an
  error-event guard and 12-attempt backoff retry (never a crash on
  the first denied write); the proof test's /tmp record copy became
  best-effort (in-memory parse authoritative) after /tmp writes
  EPERMed through all retries for ~4.5 minutes.
- safe-commit.sh itself was blocked twice by the flap (its private
  index lives in /tmp: "sha1 file '/tmp/idx-safecommit-*.lock' write
  error: Operation not permitted") — no commit was forced; the run
  waited and retried.
- Confirm band landed via a per-seed retry loop (up to 6 tries per
  seed, 20s sleeps, 1-valid-JSON-line verification per seed): armed
  51109 needed 5 tries, armed 51120 needed 2, all other seeds first
  or second try; final: 12/12 armed, 12/12 control, zero failed
  seeds. All census numbers above were verified byte-landed (line
  counts + JSON parses), never claimed on a bare exit code.
- Total eased-fire accounting stayed 0-diff through all of this:
  the flap lost runs, never silently corrupted a number — every
  landed line re-verified after landing.

## Attribution limits (from prereg, unchanged)

- The gate's sensor is FRESH days > 4, not whole-pantry days; a
  "full" reading coexists with a falling total pantry by design.
  fullWhileFalling uses whole-pantry kcal change, so it hunts exactly
  that mismatch.
- Tribute waiver kcal is WANTED kcal, not food moved, and is never
  added to easedFireKcal. Homecoming keep is voice-counted, never
  kcal-estimated.
- Single policy (competent) by design; other policies may gate
  differently. 30-day early window only; late-game legs (tribute,
  regional) are unmeasured here.
- Descriptive contrast, NOT a causal claim: one collapsed seed and
  its twin cannot prove the gate caused the death.

## Files

- Prereg: evidence/2026-11-01/sim-depositgate-b-prereg.md
- Driver: scripts/depositgate-b-driver.js
- Analyzer: scripts/analyze-depositgate-b.js
- Proof test: scripts/test-depositgate-b-census.js (39 pure checks;
  --live contrast: 6 live checks, run twice with identical numbers)
- Pilot census: evidence/2026-11-01/sim-depositgate-b-armed.jsonl
  (8 lines), sim-depositgate-b-control.jsonl (8 lines),
  sim-depositgate-b-census.json (pilot summary)
- Confirm census: evidence/2026-11-01/
  sim-depositgate-b-armed-confirm.jsonl (12 lines),
  sim-depositgate-b-control-confirm.jsonl (12 lines)
- Combined summary: evidence/2026-11-01/sim-depositgate-b-census20.json
- Corpus extract: evidence/2026-11-01/sim-depositgate-b-corpus/
  51101-armed-key-lines.txt (verbatim lines, days 11–25)
