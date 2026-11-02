# sim-vetobudget-confirm-b — veto budget confirm: DIAG (fresh band carries no repetition)

Run: oversight-flesh-out-loop-b, arm sim-vetobudget-confirm-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T1345Z).
Worktree sim-vetobudget-confirm-b, branch sim-vetobudget-confirm-b.
Prereg: evidence/2026-11-02/sim-vetobudget-confirm-b-prereg.md
(committed 287e6a850 BEFORE any judged sim). Instruments:
75aa921f0 (confirm driver + confirm analyzer + proof).
Proof: scripts/test-vetobudget-b.js 27/27 (re-run),
scripts/test-vetobudget-confirm-b.js 14/14.
Convergence state: DIAG — primary unjudgeable on this band
(no repetition seed at baseline); the pilot GO is NOT
overturned and NOT confirmed by this run.

## What was confirmed, and what was not

The pilot (1233Z, band 62801-62808, 30d) showed the veto
budget killing a real 22-day repetition pattern with zero
harm. This confirm was owed on a FRESH 16-seed band over
60 days, with a longer window for a budgeted route to
reopen. The fresh band, 66001-66016, carries no repetition
at all: 3 guard vetoes band-wide at baseline, 1 of them
silent, on a single seed — a 1-silent, 2-day flicker, not
a pattern. The budget therefore never engaged (0
abandonments, 0 suppressions), so there is nothing to
judge the primary on. Per the prereg, that is DIAG, never
a GO on an unjudgeable primary. It is also not a NO-GO:
every no-harm bar passes, every day-record is identical
between legs including pantry and roster, and no
route-reopen cost could be measured because no route was
ever abandoned. Stated plainly: this run proves the budget
is harmless on a band without repetition; it does not
prove the budget works, because on this band there was
no repetition for it to work on.

## Census (proof, not judged evidence)

- scripts/test-vetobudget-b.js: PASS 27 checks (pilot
  proof, unchanged wrapper — re-run before judged sims).
- scripts/test-vetobudget-confirm-b.js: PASS 14 checks
  (new). Confirm driver env gate: DAYS=30 fatal, DAYS=61
  fatal, COMPETENT_FEAST=1 fatal, all exit 2 before any
  game boot; snapshot carries pantryKcal (harness
  formula) + sorted roster; analyzer on synthetic
  records: GO case with one route-reopen + one
  pantry-only identity divergence on the reopen day,
  structural leak (armed later-day hop for an abandoned
  step) => NO-GO, no-repetition case => DIAG exit 2.
- Instrument change vs the pilot, preregged and minimal:
  the pilot driver hardcodes DAYS=30 (fatal otherwise),
  so the confirm uses a derived driver with exactly two
  changes — DAYS=60 gate, and pantry + roster fields on
  every day snapshot. ZERO policy changes, ZERO src/js
  changes, ZERO policy-default flips, N still 3.

## Confirm (judged band 66001-66016, 60d, guard-only vs guard+budget, identical seeds, DEPOSITGATE=0)

Both legs fresh with this run's own confirm driver (NO
reuse of the pilot's JSONL). All 16 seeds survived 60
loop-days on both legs (daysAlive 60/60, median 60).

| Bar | Baseline | Armed | Verdict |
|---|---|---|---|
| P2 steps with silent vetoes on > 3 seed-days (= 0) | no repetition seed | none | PASS (vacuous — see verdict) |
| P3 total same-step silent vetoes > 3 (= 0) | max 1 | none (max 1) | PASS (vacuous) |
| P1 (REPORT ONLY) max same-step silent / seed-day on repetition seeds | no repetition seed | — | reported, not judged |
| B1 median survival (>= baseline) | 60d | 60d | PASS |
| B2 deaths (<= baseline, no new mode) | 236, modes as listed | 236, identical modes | PASS |
| B2 player-flagged deaths (<= baseline, separate) | 18 | 18 | PASS |
| B3 failed-trip share (<= baseline + 0.05) | 0.421 | 0.421 | PASS |
| B4 mean daily haul (>= 0.95x) | 318.1 | 318.1 (1.00x) | PASS |
| B4perSeed floor (every seed >= 0.50x own baseline) | — | worst seed 1.00x | PASS |
| B5 away day-ends (<= baseline + 2) | 28 | 28 | PASS |
| B6 forageTrips (>= 0.90x baseline) | 2086 | 2086 (1.00x) | PASS |
| B7 suppressions > 0 on every repetition seed | no repetition seeds | — | PASS vacuously (never engaged) |
| B8 veto-created pockets (= 0) | — | 0 | PASS |
| Structural (a1) armed later-day hops for abandoned steps (= 0) | — | 0 (no abandonments) | PASS vacuously |
| Route-reopen (b) abandoned steps later passed at baseline | — | 0 abandonments, 0 passes | UNTESTED |

Per-seed (away/episodes, failed share, haul, vetoes(silent)
base -> armed, suppressions, wave, endReason): 66001 0/0,
0.217, 542 identical, 0(0) -> 0(0), supp 0, wave 2;
66002 0/0, 0.883, 95.9 identical, 0 -> 0, supp 0, wave 3;
66003 0/0, 0.567, 147.5 identical, 0 -> 0, supp 0, wave 3;
66004 0/0, 0.067, 514.1 identical, 0 -> 0, supp 0, wave 3;
66005 0/0, 0.250, 382.1 identical, 0 -> 0, supp 0, wave 2;
66006 0/0, 0.333, 274.8 identical, 3(1) -> 3(1), supp 0,
wave 3; 66007 1/0, 0.283, 498.6 identical, 0 -> 0, supp 0,
wave 3; 66008 9/0, 0.367, 602.5 identical, 0 -> 0, supp 0,
wave 2; 66009 0/0, 0.850, 41.4 identical, 0 -> 0, supp 0,
wave 3; 66010 0/0, 0.667, 154.5 identical, 0 -> 0, supp 0,
wave 2; 66011 0/0, 0.450, 180.7 identical, 0 -> 0, supp 0,
wave 2; 66012 0/0, 0.050, 773.1 identical, 0 -> 0, supp 0,
wave 1; 66013 18/0, 0.483, 270.7 identical, 0 -> 0, supp 0,
wave 3; 66014 0/0, 0.667, 7.5 identical, 0 -> 0, supp 0,
wave 2; 66015 0/0, 0.567, 210.2 identical, 0 -> 0, supp 0,
wave 2; 66016 0/0, 0.033, 393.5 identical, 0 -> 0, supp 0,
wave 3. All endReason survived, both legs.

### The band's only vetoes (the whole phenomenon, such as it is)

Seed 66006 only. Day 34 (loopDay 34): two SPOKEN vetoes
on two different steps, (3,3)->(5,3) and (3,3)->(6,4).
Day 35: one SILENT veto on (3,3)->(5,3). That is the
band total: 3 vetoes, 1 silent, 1 step, 2 days — against
the repetition definition (>= 6 total silent OR >= 4
distinct days) it is not even close. No step reaches the
budget of 3 silent vetoes, so no abandonment, no
suppression, no reopen, no cost. The other 15 seeds have
zero vetoes of any kind across 60 days.

### Mechanism accounting

Band-wide: 3 baseline veto attempts = 3 armed vetoes + 0
suppressions. The budget changed nothing anywhere on this
band because its trigger condition never occurred. This
is the instrument correctly doing nothing, not a failure
of the instrument — but it is also not evidence the
instrument works, which is why the verdict is DIAG
rather than GO.

### Stronger identity check (pilot metric review, adopted)

Per-seed per-loopDay comparison of day snapshots
(positions, scholar kcal, pantry kcal, roster count +
id set) + forage attempts/successes: 0 divergent
day-records on all 16 seeds (960 day-records compared).
SCOPE, as preregged: this is a snapshot comparison,
not full game-state equality — codex, trust, inventory
composition, and monster state are not compared. On
this band the scope limit is moot (the legs agree on
everything compared), but the claim is snapshot
identity, not total identity.

### Route-reopen (the confirm's new question)

(a) Structural: 0 armed later-day hops for abandoned
steps — vacuously true, since there are no abandoned
steps. Same-day armed hops are likewise 0 for abandoned
steps (none exist). (b) Cost: 0 abandoned steps, so 0
steps whose baseline twin later passed. The
permanent-abandonment risk remains UNTESTED after this
run, exactly as after the pilot: no budgeted step has
yet been observed reopening. Any future confirm must
first qualify its band (see metric review) or the same
DIAG will recur.

## Sense-testing (transcripts, not just counts)

SayLines are byte-identical between legs on all 16 seeds
(lengths 5111/5084/5234/6060/5250/6443/5395/5282/5549/
6332/7195/6860/5323/5903/5396/6021, content identical)
— expected, since the budget never engaged and adds no
narration. The villages themselves read as living
places, not as repetition machines: on 66002 a fever
runs through the month (Camila feverish day 10, Nikos
nodding at her by day 30, Thabo bringing 625 kcal home
day 55) while the village fails 88% of its trips and
scrapes 96 kcal/day — a struggling village that still
survives, its deaths combat deaths (hummice,
anaconda, murkcap), not starvation. On 66012 the
opposite village: 773 kcal/day, 5% failed trips, 4
deaths in 60 days, people lingering over the fire and
recovering from fevers. On 66013 the outside world
presses in: Thornfield's speaker sends a runner about
shared ground day 10, The Bloodied threaten over
stripped ground day 30, and Violet finds Fever's End
day 55. Nothing robotic, static, or repeated was
flagged in the sampled transcripts; the one silent
veto on 66006 never reaches a line (silent by design),
and the scholar ends day 35 home at kcal 2155 with
the pantry over 116,000 kcal — refused once, fed
anyway, no story told about it because nothing
happened worth telling.

## Village assessment (plain words)

Sixteen villages, same village on both legs, and mostly
they are just getting on with it. A few are rich
(66012: full baskets, few deaths), a few are scraping
(66002, 66009, 66014: under 100 kcal/day, failed trips
most days, yet alive at day 60), two spend a lot of
nights away from home (66008: 9 away nights, 66013:
18) without stranding. Everybody fights more than
starves: 236 deaths band-wide, modes identical on
both legs (wild/combat dominant, then ambush, disease,
wounds, expedition, named monsters), 18 of them
player-flagged on both legs, zero starvation seeds.
What is missing is the thing this run was built to
measure: no village here has a scholar hammering at a
shut door. The pilot's village did, twice over; these
sixteen do not. That is luck of the band draw, not a
change in the game — but it means the question this
confirm asked ("does the budget hold up over 60 days
when routes reopen?") is still open, and the villages
here cannot answer it.

## Wall numbers (in-window only, never pooled across arms)

Confirm window (60d, driver): national / table / wins
0 both legs (expected 60-day pre-seat profile, not a
regression); median survival 60d both; driver wave
reach: maxWaveUnlocked per seed 2,3,3,3,2,3,3,2,3,2,2,
1,3,2,2,3 both legs (wave 4-5 unlocks 0, full seat 0,
wave 5 reached 0 unchanged). No wall movement is shown
or claimed: this confirm measures veto repetition, not
the scale wall.

## Balanced panel (§15, context never verdict)

Combined campaign: `node scripts/balance-panel.js --out
/tmp/vetobudget-confirm-b-panel --policies
competent-homewardstep-b,competent-vetobudget-b --seeds
66001,...,66016 --days 60 --par 4` — 32 cases, 0 reused,
sourcesStable true, neutrality matched on both policies
(proof seed 66001, 0 warnings). Per-seed panel rows are
IDENTICAL between legs on 15/16 seeds (won 0, national
0, table 0, maxArc 3, vests 0, maxRank village on every
seed, both legs). The exception is seed 66005
(waveReach 3 vs 2, panel-counted deaths 21 vs 13) —
AND the panel's own substrate differs from the judged
driver's on the same seeds (panel loses village 66002
on day 59 where the driver survives it 60d; panel
waveReach on 66004 is 4 where the driver records 3).
The panel is context, never verdict, and its substrate
difference is now a findings-backlog item (see below)
— it does not overturn the driver's judged identity
(0 divergent day-records including pantry + roster on
66005 and 66002 alike), but panel rows must not be
quoted as judged evidence until the substrate gap is
isolated. Raw panel archived as
evidence/2026-11-02/sim-vetobudget-confirm-b-panel.json.gz.

The compare of the two single-policy panels returns
decision INVALID — "Unmatched policies / Unmatched
cases" — and is attached as-is
(evidence/2026-11-02/sim-vetobudget-confirm-b-panel-compare.md),
not overridden. Same structural refusal class as the
pilot: the comparator matches campaigns with the same
policy set across two roots, while a policy-side arm
splits its two policies across the two panels, so the
sets can never match. The valid panel artifact is the
single combined campaign above. No panel verdict is
claimed.

## Telemetry deviation check (§15 loop step 10)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
(per-seed panel rows, armed leg) --metrics
national,table,wins,exiled --sweep-rows` — wall:
nationalEver 0/16, table 0/16, entered 0/16, won 0/16.
LOUD lines: "national disappeared: baseline 12 ->
current 0", "table disappeared: baseline 16 -> current
0", "wins disappeared: baseline 16 -> current 0".
INVESTIGATED, not a real deviation: the baseline file
itself is a winseat-regime baseline (~100%-win suite,
180d) and carries an explicit note that pre-seat /
courtship / readiness substrates must NOT be compared
against it — "wins are structurally ~0 there and
telemetry-check will fire a spurious LOUD 'wins
disappeared'". This 60d pre-seat confirm is exactly
that regime, so the LOUD lines are the documented
artifact, not a wall movement. Exiled: 0, no LOUD line
(exiled is unmeasured by the panel rows and counts 0
by absence, same as the baseline's 0).

## Verdict: DIAG (primary unjudgeable — fresh band carries no repetition)

- PRIMARY UNJUDGEABLE: 0 repetition seeds at baseline
  (band total 3 vetoes, 1 silent). P2/P3 pass vacuously;
  P1 reported only, per prereg, and is moot here.
- ALL NO-HARM BARS PASS at 1.00x, but vacuously for
  the budget question: the budget never engaged, so
  "no harm" here means "no effect", not "safe effect".
- IDENTITY 0 divergences (pantry + roster included)
  is the run's real, non-vacuous result: the confirm
  driver + analyzer work, and the two legs agree
  exactly where the budget is inert.
- ROUTE-REOPEN UNTESTED: 0 abandonments, 0 later
  baseline passes. The permanent-abandonment cost is
  still an open question after two runs.
- The pilot GO (62801-62808) STANDS, unconfirmed and
  unoverturned. This DIAG neither strengthens nor
  weakens it; it says the fresh band did not carry the
  phenomenon.
- RECOMMENDATION TO COORDINATOR (not a new run spent
  here): do not spend another full two-leg confirm on
  an unqualified band. Qualify first — a guard-only
  screen over fresh bands, scanning stepStats for the
  repetition definition, costs one leg per band — and
  only run the armed leg once a band carries >= 1
  repetition seed. Alternatively, re-qualify the pilot
  band at 60d as a horizon extension (same seeds, new
  prereg, stated as extension rather than fresh
  confirm). Either is a coordinator call; this worker
  spent no sims beyond the preregged band.

## Metric review (for the NEXT run, never a re-score)

- A fresh-band confirm needs a QUALIFICATION screen
  in its prereg: "band carries >= 1 repetition seed at
  baseline (guard-only leg)" as a gate before the
  armed leg is spent. This run spent a full 32-run
  campaign (both legs, 60d) to learn the band was
  empty; a guard-only screen would have learned it for
  half the cost. The homeveto band-screen precedent
  (8 bands, screen-then-judge) is the model.
- P1 is redundant given P3, not just weak: P3 bounds
  every step's total silent vetoes <= 3, and a
  per-day count can never exceed its step total, so
  P1 passes whenever P3 passes. Future preregs should
  drop P1 entirely, not merely report it.
- The repetition definition (>= 6 total silent OR >=
  4 days) worked as a scanner: it correctly returned
  empty on a band whose max is 1 silent / 2 days.
  Keep it, but pair it with the qualification gate
  above.
- Player-flagged deaths as a separate bar worked
  (18 = 18) and should stay: the band death total
  (236) is NPC-dominated and would hide scholar harm.
- Panel-vs-driver substrate divergence (66005 split,
  66002 survival split, 66004 wave split) is now a
  findings-backlog item. Until isolated, panel context
  on policy-split arms carries this caveat, and panel
  rows must not be pooled with driver bars.
- The identity check (pantry + roster) worked and was
  cheap (0 divergences, 960 day-records). Keep it for
  every future confirm; its scope limit (no codex /
  trust / inventory / monster comparison) stands as
  stated.

## Corpora

- evidence/2026-11-02/sim-vetobudget-confirm-b-prereg.md
- evidence/2026-11-02/sim-vetobudget-confirm-b.md (this file)
- evidence/2026-11-02/sim-vetobudget-confirm-b-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-vetobudget-confirm-b-analysis.txt
- evidence/2026-11-02/sim-vetobudget-confirm-b-panel.json.gz (+ .log)
- evidence/2026-11-02/sim-vetobudget-confirm-b-panel-{base,armed}.log
- evidence/2026-11-02/sim-vetobudget-confirm-b-panel-compare.md (+ .json, .log)
- scripts/vetobudget-confirm-b-driver.js, scripts/analyze-vetobudget-confirm-b.js, scripts/test-vetobudget-confirm-b.js
