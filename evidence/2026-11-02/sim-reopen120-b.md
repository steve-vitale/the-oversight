# sim-reopen120-b — longer-window route-reopen probe: DIAG-GO (0 reopens in 120 days)

Run: oversight-flesh-out-loop-b, arm sim-reopen120-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T153648Z).
Worktree sim-reopen120-b, branch sim-reopen120-b.
Prereg: evidence/2026-11-02/sim-reopen120-b-prereg.md
(committed 61605a2bf BEFORE any judged sim). Instruments:
4338c8051 (120d driver + DIAG analyzer + proof).
Proof: scripts/test-vetobudget-reopen120-b.js 15/15 (new),
scripts/test-vetobudget-b.js 27/27 (re-run),
scripts/test-vetobudget-confirm-b.js 14/14 (re-run),
scripts/test-vetobudget-qual-b.js 11/11 (re-run).
Convergence state: DIAG-GO — the longer-window reopen rate is
JUDGED (2 abandonments, every post-abandonment window
counted), and it is 0. This is a measurement verdict, not a
lever verdict: it neither re-confirms nor overturns the
1505Z GO.

## Question (1505Z residual, now measured)

The 1505Z qual arm confirmed the veto budget on band
67501-67512 at 60d and measured in-window reopen cost zero
(1 abandonment, day 51; baseline twin passed the abandoned
step 0 times after, 27 more vetoes, 0 passes). Its stated
residual was never measured past the window: a route
opening after day 60 would still stay abandoned. This arm
doubles the window to 120 death-aware days on the same
qualified band, guard-only vs guard+budget, identical
seeds, and counts every post-abandonment pass.

## Pilot gate: PASSED (2 abandonments, not 0)

Seeds 67501-67508, both legs, 120d, before spending the
remaining 4: armed abandonments on 67502 (1, 17
suppressions) and 67505 (1, 1 suppression). Gate passed,
so the pilot legs ARE the full band's first 8 seeds (same
driver, same seeds — no re-run), and 67509-67512 were run
fresh on both legs. Extension seeds carried 0 abandonments.

## SUBSTRATE DRIFT — read this before comparing to 60d

The 120d run is NOT a horizon extension of the 60d run.
Day-1 start snapshots are identical between the 60d
confirm and this run (same seed, roster, pantry), but
day-1 END pantry already differs by 630 kcal (41710 vs
42340 on 67502-armed), and the veto pattern moved: the
60d repetition (2 silent day 28, then 3/day days 51-60)
does not occur at 120d; instead 67502 repeats at days
87-92 (+111). The only src/js change between the 1505Z
qual results commit (e01308f9e, ancestor of this branch)
and this branch's base is journey-crisis r111
(7776da714: dead-identity applicant reuse fix in
membership.js). So the re-routing is bounded to the r111
delta as a whole (which line moved day-1 pantry was not
isolated — recorded, not chased). Consequences, stated
plainly:
- The 60d day-51 abandonment no longer exists on current
  master. This run does NOT re-measure it.
- The 120d measurement stands on its OWN two legs (both
  at 120d, identical seeds, same code): its abandonments
  (67502 day 88, 67505 day 15) are real on current master,
  and the reopen rate below is judged on them.
- Any future arm comparing horizons must re-baseline on
  current master first; a 60d-vs-120d prefix comparison
  across a landing is not a clean extension.

## Full band (67501-67512, 120d, guard vs guard+budget, DEPOSITGATE=0)

Analyzer exit 0, VERDICT: DIAG-GO.

| Bar (1345Z/1505Z style, reported) | Baseline | Armed | Verdict |
|---|---|---|---|
| B1 median survival (>= baseline) | 120d | 120d | PASS |
| B2 deaths (<= baseline, no new mode) | 635, modes as listed | 635, identical modes | PASS |
| B2 player-flagged deaths (separate) | 93 | 93 | PASS |
| B3 failed-trip share (<= baseline + 0.05) | 0.363 | 0.363 | PASS |
| B4 mean daily haul (>= 0.95x) | 338.4 | 338.4 (1.00x) | PASS |
| B4perSeed floor (every seed >= 0.50x own) | — | worst seed 1.00x | PASS |
| B5 away day-ends (<= baseline + 2) | 53 | 53 | PASS |
| B6 forageTrips (>= 0.90x baseline) | 2469 | 2469 (1.00x) | PASS |
| B7 suppressions > 0 on repetition seeds | — | 67502: 17, 67505: 1 | PASS |
| B8 veto-created pockets (= 0) | — | 0 | PASS |
| Structural armed later-day hops (= 0) | — | 0 | PASS |
| Identity divergent day-records (pantry + roster) | — | 0 / 1440 | PASS |

Per-seed (away/episodes, failed share, haul, vetoes(silent)
base -> armed, suppressions, abandonments, wave, endReason):
67501 6/0, 0.267, 393.4 identical, 4(2) -> 4(2), supp 0,
wave 4, village-lost (day 120); 67502 [REP] 1/0, 0.242,
475.8 identical, 22(20) -> 5(3), supp 17, aband 1, wave 4,
survived; 67503 0/0, 0.483, 319.1 identical, 2(1) -> 2(1),
supp 0, wave 4, survived; 67504 11/0, 0.429, 265.3
identical, 0 -> 0, supp 0, wave 3, village-lost day 56;
67505 [REP] 22/0, 0.325, 387.3 identical, 10(5) -> 9(4),
supp 1, aband 1, wave 4, survived; 67506 1/0, 0.588,
150.3 identical, 1(0) -> 1(0), supp 0, wave 4,
village-lost day 103; 67507 0/0, 0.583, 298.8 identical,
0 -> 0, supp 0, wave 3, village-lost day 72; 67508 4/0,
0.563, 120.8 identical, 0 -> 0, supp 0, wave 2,
village-lost day 32; 67509 0/0, 0.275, 161.7 identical,
2(1) -> 2(1), supp 0, wave 4, survived; 67510 7/0,
0.593, 52.9 identical, 0 -> 0, supp 0, wave 3,
village-lost day 82; 67511 0/0, 0.067, 569.1 identical,
0 -> 0, supp 0, wave 4, survived; 67512 1/0, 0.301,
866.2 identical, 0 -> 0, supp 0, wave 4, village-lost
day 84. Days alive band: 120,120,120,56,120,103,72,32,
120,82,120,84 — median 120 both legs. Death modes
identical both legs (wild/combat dominant, then
expedition, ambush, disease/poison, wounds, starvation,
dehydration, named monsters, contest, arena). One
player-flagged starvation death (67503, day 110) is
identical both legs — a succession story, not a budget
effect (the village survives to 120).

### The reopen table (the primary metric)

| Seed | Abandoned step | Abandon day | Baseline passes after | Baseline vetoes after | Window (baseline days alive after) | Reopen rate |
|---|---|---|---|---|---|---|
| 67502 | 4,4->4,1 | 88 | 0 | 15 (days 89-92 x3/day, day 111 x3) | 32 days | 0 |
| 67505 | 1,3->1,2 | 15 | 0 | 1 (day 16 only) | 105 days | 0 |

Band: 2 abandonments, 2 abandoned steps, 0
post-abandonment baseline passes, 16 post-abandonment
vetoes, band reopen rate 0. Armed later-day hops 0 on
both steps (same-day armed hops 1 each — the abandoning
veto itself, counted before the mark). 0 divergent
day-records on or after either abandonment.

Read the two rows differently — the analyzer counts
both, but they are not equally strong evidence:
- 67502 is the strong row: after abandonment the
  baseline twin kept hammering the step 3x/day for four
  days and again on day 111 (15 refused attempts, 0
  passes, 32-day window). This is the 60d pattern
  replayed at a later date: the refused route stayed
  refused.
- 67505 is the thin row: after abandonment the baseline
  twin vetoed the step once more (day 16) and then never
  attempted it again in 105 days. The 0 here means "the
  route never reopened in the window", but the window
  mostly contains no attempts at all — the step stopped
  presenting, so a late opening would have had only the
  day-16 attempt to show against. The honest summary is
  0 passes in 16 post-abandonment observations, not 0
  passes in 137 days of hammering.

### What this does and does not settle

- SETTLED on this band at 120d: no abandoned step was
  later passed by its baseline twin (0/16 observations).
  The permanent-abandonment cost over a doubled window
  is zero on the observed abandonments, and every
  no-harm bar passes at exactly 1.00x with 0 divergent
  day-records — the budget changes nothing except
  veto/suppression counters, as at 60d.
- NOT settled: whether a route that stops presenting
  (67505's shape) could reopen unobserved — the window
  counts attempts, and a route nobody walks toward
  cannot demonstrate reopening either way. A future
  probe of that shape would need a step that keeps
  presenting after abandonment (67502's shape), not a
  bigger band.
- NOT re-measured: the 60d day-51 abandonment, which no
  longer exists on current master (substrate drift
  above). The 1505Z GO stands on its own band and code;
  this run neither strengthens nor weakens it directly —
  it answers the longer-window question on current
  master with fresh abandonments.

## Sense-testing (transcripts, not just counts)

SayLines are byte-identical between legs on both
abandonment seeds (67502: 10559 lines each; 67505:
11232 lines each) — expected: the budget adds no
narration and suppression is silent by design. Silence
persists past day 60, and past each abandonment: on
67502, the 49 day-60+ lines matching route/veto keywords
are all generic road flavor (wanderers, cart-drivers,
broadcasts, trial windows) — nothing about the
4,4->4,1 step, its abandonment, or any veto. On 67505
the same holds (24 keyword lines, all generic road
flavor). The abandoned routes simply vanish from the
story: the scholar ends nights home, fed, foraging near
home instead, and the village's story moves on to
broadcasts, stitching by door light, and strangers by
the road who teach. The one narration gap remains the
known, prereg-excluded one: the abandonment itself is
never spoken (a later arm's narration question, not
this instrument's). The day-120 silent veto on 67505's
armed leg is a DIFFERENT step (4,1->5,0), identical on
the baseline leg — not a reopen signal, and the
analyzer's per-step grouping confirms it is not
counted for the abandoned step.

## Village assessment (plain words)

Twelve villages over 120 days, and the budget touches
none of them except where it stops hammering. 67502 is
the rich one with a shut door again — pantry-fed,
survives the full 120 days, spends its last month
refused on a route that will not open, then stops
hammering and loses nothing. 67505 is the far-walker
(22 away nights, the band's most) whose early shut door
(day 15) costs one suppression and then silence. Seven
villages are lost along the way (67508 day 32, 67504
day 56, 67507 day 72, 67510 day 82, 67512 day 84, 67506
day 103, 67501 at day 120) — combat, wounds, and one
starvation, identical on both legs, nothing traced to
the budget; five survive the full window. The
survivors mostly stay home
and haul: 67512 hauls 866 kcal/day, 67511 569, while
67510 scrapes by on 53 and still reaches day 82. What
is missing, as at 60d, is anything the budget could
break: no village here depends on a refused route
reopening, and the two villages that do hammer refused
routes are untouched for stopping.

## Wall numbers (in-window only, never pooled across arms)

Driver window (120d): national / table / wins 0 both
legs (expected 120-day pre-seat profile, not a
regression); median survival 120d both; driver wave
reach: wave 4 unlocked on 8 seeds (67501, 67502, 67503,
67505, 67506, 67509, 67511, 67512, both legs), wave 5
unlocked 0, wave 5 fought 0, full seat 0. No wall
movement is shown or claimed: this probe measures veto
repetition, not the scale wall. The wave-4 unlocks are
unchanged between legs — the budget neither helps nor
hinders them.

## Balanced panel (§15, context never verdict)

Combined campaign: `node scripts/balance-panel.js --out
/tmp/vetobudget-reopen120-b-panel --policies
competent-homewardstep-b,competent-vetobudget-b --seeds
67501,...,67512 --days 120 --par 4` — 24 cases, 0 reused,
sourcesStable true, neutrality matched on both policies
(proof seed 67501, 0 warnings). Per-seed panel rows are
IDENTICAL between legs on 11/12 seeds (won 0, national
0, table 0, maxArc 3, maxRank village on every seed,
both legs; vests 1 on 67506 both legs). The exception
is seed 67502 (panel villageDeaths 58 base vs 60 armed)
— AND the panel's own substrate differs from the judged
driver's on the same seeds (panel loses village 67501
on day 74 where the driver survives it to day 120;
panel loses 67509 on day 95 where the driver survives
it 120d; panel loses 67511 on day 66 where the driver
survives it 120d; panel keeps 67512 to day 118 where
the driver loses it day 84; panel loses 67504 on day
22 where the driver loses it day 56). The panel is
context, never verdict: the judged driver's 0 divergent
day-records (including pantry + roster) and identical
67502 death counts (69 = 69) stand as the judged
evidence, and panel rows must not be pooled with driver
bars. This is another instance of the known panel/driver
substrate divergence class, noted for the backlog (see
below). No panel compare is claimed: the combined
campaign is the valid panel artifact for a policy-split
arm, as on the 1345Z/1505Z runs. Raw panel archived as
evidence/2026-11-02/sim-reopen120-b-panel.json.gz
(+ per-seed rows in
evidence/2026-11-02/sim-reopen120-b-panel-rows/).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-02/sim-reopen120-b-panel-rows/*.json'
--metrics national,table,wins,exiled --sweep-rows` —
wall: nationalEver 0/24 rows, table 0/24, entered 0/24,
won 0/24 (warning: 24 rows over 12 distinct seeds — two
legs, as expected). LOUD lines: "national disappeared:
baseline 12 -> current 0", "table disappeared:
baseline 16 -> current 0", "wins disappeared: baseline
16 -> current 0". INVESTIGATED, not a real deviation:
same documented artifact as the 1345Z/1505Z runs — the
baseline file is a winseat-regime baseline (~100%-win
suite, 180d) whose own note says pre-seat substrates
must NOT be compared against it. This 120d pre-seat
probe is exactly that regime. Exiled: 0, no LOUD line.

## Verdict: DIAG-GO (longer-window reopen rate judged: 0)

- JUDGED, not assumed: 2 abandonments on the armed leg
  and every post-abandonment window counted (32 days /
  15 observations on 67502; 105 days / 1 observation on
  67505).
- REOPEN RATE 0: 0 baseline passes after abandonment in
  16 post-abandonment observations, band rate 0. The
  67502 row is strong evidence (repeated refusals after
  abandonment); the 67505 row is thin (one refusal, then
  no further attempts) and is reported as such.
- ALL NO-HARM BARS PASS at 1.00x with 0 divergent
  day-records — the budget changes nothing except
  veto/suppression counters over 120 days, as at 60d.
- STRUCTURAL PASS: 0 armed later-day hops for abandoned
  steps.
- SUBSTRATE DRIFT (not a verdict change): the 60d
  abandonment no longer exists on current master (r111
  re-routed the band); this run's abandonments are fresh
  on current master. Future horizon comparisons must
  re-baseline after landings.
- RECOMMENDATION TO COORDINATOR (not a new run spent
  here): the longer-window reopen question is answered
  for the abandonment shapes that keep presenting
  (67502's). The remaining thread on this line is
  narration (should an abandoned route earn a spoken
  line?) — the silence past day 60 is now measured on
  two bands, not just asserted. No further reopen spend
  is owed unless a new abandonment shape appears.

## Metric review (for the NEXT run, never a re-score)

- The pilot gate WORKED as preregged (2 abandonments on
  8 seeds, full band spent with confidence). Keep the
  gate for every future horizon probe.
- The DIAG verdict rule worked: abandonment-keyed (not
  repetition-keyed) judging kept this run from the
  1345Z vacuity trap, and the 0-reopen case is a judged
  result rather than a failed lever test. Keep the rule.
- Reopen rate needs an observations denominator, not
  just a window: 67505's 105-day window with 1
  observation is weaker than 67502's 32-day window with
  15. Future preregs should report both (window days AND
  post-abandonment observations) and should prefer, or
  separately weight, steps that keep presenting after
  abandonment.
- The day-1 pantry divergence check (start identical,
  end differs) is a cheap substrate-drift detector that
  future horizon comparisons should run BEFORE judging
  continuity: if day 1 already differs, the run is a
  fresh measurement, not an extension, and the evidence
  must say so.
- Panel-vs-driver substrate divergence persists (third
  instance class: survival and death counts differ
  between substrates while leg-identity holds on the
  judged driver). Until isolated, panel context on
  policy-split arms carries this caveat — it did not
  affect this verdict, which rests on the judged driver.
- Out-of-arm gaps surfaced, NOT chased (findings backlog
  format, for the coordinator to append):
  `- [open] 2026-11-02 — panel-vs-driver substrate — panel survival/death counts diverge from the judged driver on identical seeds at 120d (67502: panel villageDeaths 58 vs 60 across legs while driver deaths are 69 = 69; panel loses 67501 day 74 / 67509 day 95 / 67511 day 66 where the driver survives 120d; panel keeps 67512 to day 118 where the driver loses it day 84) (sim-reopen120-b evidence).`
  `- [open] 2026-11-02 — substrate drift across landings — journey-crisis r111 (membership.js dead-identity fix) moved the qualified vetobudget band between 1505Z and this run (day-1 pantry 42340 -> 41710 on 67502-armed; veto pattern moved days 28/51 -> 87/88), so the 60d day-51 abandonment no longer exists on current master (sim-reopen120-b evidence).`

## Corpora

- evidence/2026-11-02/sim-reopen120-b-prereg.md
- evidence/2026-11-02/sim-reopen120-b.md (this file)
- evidence/2026-11-02/sim-reopen120-b-pilot-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-reopen120-b-ext-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-reopen120-b-{baseline,armed}.jsonl (full band)
- evidence/2026-11-02/sim-reopen120-b-analysis.txt (+ .err)
- evidence/2026-11-02/sim-reopen120-b-panel.json.gz (+ .log)
- evidence/2026-11-02/sim-reopen120-b-panel-rows/*.json (24 rows)
- scripts/vetobudget-reopen120-b-driver.js, scripts/analyze-vetobudget-reopen120-b.js, scripts/test-vetobudget-reopen120-b.js
