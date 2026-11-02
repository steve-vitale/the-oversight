# sim-vetobudget-qual-b — veto budget QUALIFIED confirm: GO

Run: oversight-flesh-out-loop-b, arm sim-vetobudget-qual-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T1505Z).
Worktree sim-vetobudget-qual-b, branch sim-vetobudget-qual-b.
Prereg: evidence/2026-11-02/sim-vetobudget-qual-b-prereg.md
(committed 15bd69a3f BEFORE any judged sim). Instruments:
screen analyzer + proof (this run), confirm driver + analyzer
from the 1345Z arm (unchanged).
Proof: scripts/test-vetobudget-qual-b.js 11/11 (new),
scripts/test-vetobudget-b.js 27/27 (re-run),
scripts/test-vetobudget-confirm-b.js 14/14 (re-run).
Convergence state: GO — the pilot GO (62801-62808) is now
CONFIRMED on a qualified fresh band.

## What this run did differently (the 1345Z lesson, applied)

The 1345Z confirm spent a full two-leg campaign on band
66001-66016, which carried no repetition at all, and
returned DIAG. This run qualified FIRST: one guard-only
screen leg per band, 8 seeds, 60d, and only then the armed
leg. Band 1 of the preregged series qualified immediately
(see screen table), so the screening budget spent was 8
seeds, not 48 — and the confirm that followed was judged
on a band carrying a real 32-silent-veto repetition pattern.

## Step A — screen (guard-only, 60d, competent-homewardstep-b)

Band 67501-67508 (verified fresh before the prereg: zero
mentions of any 675xx/676xx/678xx/679xx/693xx/694xx seed in
evidence/2026-11-02/*.md at prereg time). Freshness
post-check, stated honestly: a background grep that
finished AFTER the prereg commit listed 67501/67508/67512
etc. among today's .md hits — re-checked by hand, those
hits are the prereg file itself (the only file matching
67501 in today's .md after the commit is the prereg).
The October JSON hits for 67501 in that grep are
incidental numbers in unrelated feastvoice/panel files,
not seed bands. The prereg's freshness claim stands as
scoped: today's .md evidence, pre-prereg.

| Seed | daysAlive | vetoes(silent) | top step total/days | repetition | would-abandon |
|---|---|---|---|---|---|
| 67501 | 60 | 0(0) | none | no | — |
| 67502 | 60 | 36(33) | 4,4->4,1: 32/11 | YES | 4,4->4,1:32 |
| 67503 | 60 | 0(0) | none | no | — |
| 67504 | 60 | 0(0) | none | no | — |
| 67505 | 60 | 0(0) | none | no | — |
| 67506 | 60 | 1(0) | none (1 spoken) | no | — |
| 67507 | 60 | 0(0) | none | no | — |
| 67508 | 44 | 3(1) | 4,1->3,0: 1/1 | no | — |

Band total: 40 vetoes, 34 silent. Repetition seeds: [67502]
(1, not 2). Would-abandon steps: 1 (67502, 4,4->4,1).
Loose seeds (>= 2 total vetoes): [67502, 67508].
VERDICT: QUALIFIED — via the would-abandon gate
(>= 1), with 1 repetition seed in tow. Screening STOPS
here per the prereg (first qualifying band); bands 2-6
were not spent. Note for the record: the band qualified
on the weaker gate, but it ALSO carries a repetition
seed, so the confirm analyzer's judgeability gate (>= 1
repetition seed) is met — this is not a repeat of the
1345Z vacuous pass.

## Step B — confirm (judged band 67501-67512, 60d, guard vs guard+budget, identical seeds, DEPOSITGATE=0)

12 seeds: the 8 screened seeds (guard JSONL REUSED as the
baseline leg — same policy, horizon, driver; re-running it
would burn seeds for no new information) plus 67509-67512
fresh on both legs; the armed leg fresh on all 12.
11 of 12 seeds survived 60 loop-days on both legs;
67508 was village-lost at day 44 on both legs.
Median survival 60d both legs.

| Bar (1345Z bars verbatim; P1 report-only per that review) | Baseline | Armed | Verdict |
|---|---|---|---|
| P2 steps with silent vetoes on > 3 seed-days (= 0) | rep seed 11 days | max 2 days | PASS |
| P3 total same-step silent vetoes > 3 (= 0) | max 32 | max 3 | PASS |
| P1 (REPORT ONLY) max same-step silent / seed-day on repetition seeds | 3 | 2 | reported |
| B1 median survival (>= baseline) | 60d | 60d | PASS |
| B2 deaths (<= baseline, no new mode) | 404, modes as listed | 404, identical modes | PASS |
| B2 player-flagged deaths (<= baseline, separate) | 29 | 29 | PASS |
| B3 failed-trip share (<= baseline + 0.05) | 0.345 | 0.345 | PASS |
| B4 mean daily haul (>= 0.95x) | 355.2 | 355.2 (1.00x) | PASS |
| B4perSeed floor (every seed >= 0.50x own baseline) | — | worst seed 1.00x | PASS |
| B5 away day-ends (<= baseline + 2) | 27 | 27 | PASS |
| B6 forageTrips (>= 0.90x baseline) | 1520 | 1520 (1.00x) | PASS |
| B7 suppressions > 0 on every repetition seed | — | 67502: 29 | PASS |
| B8 veto-created pockets (= 0) | — | 0 | PASS |
| Structural (a1) armed later-day hops for abandoned steps (= 0) | — | 0 | PASS |
| Identity divergent day-records (pantry + roster incl.) | — | 0 / 720 | PASS |

Per-seed (away/episodes, failed share, haul, vetoes(silent)
base -> armed, suppressions, abandonments, wave, endReason):
67501 0/0, 0.317, 443.6 identical, 0(0) -> 0(0), supp 0,
wave 3, survived; 67502 8/0, 0.283, 243.4 identical,
36(33) -> 7(4), supp 29, aband 1, wave 3, survived;
67503 1/0, 0.350, 417.4 identical, 0 -> 0, supp 0,
wave 4, survived; 67504 2/0, 0.450, 399.7 identical,
0 -> 0, supp 0, wave 3, survived; 67505 5/0, 0.133,
566.4 identical, 0 -> 0, supp 0, wave 3, survived;
67506 0/0, 0.517, 242.0 identical, 1(0) -> 1(0), supp 0,
wave 3, survived; 67507 0/0, 0.567, 359.5 identical,
0 -> 0, supp 0, wave 3, survived; 67508 8/0, 0.568,
168.5 identical, 3(1) -> 3(1), supp 0, wave 3,
village-lost day 44; 67509 0/0, 0.067, 466.9 identical,
0 -> 0, supp 0, wave 3, survived; 67510 0/0, 0.567,
39.9 identical, 0 -> 0, supp 0, wave 3, survived;
67511 3/0, 0.050, 537.2 identical, 2(1) -> 2(1), supp 0,
wave 3, survived; 67512 0/0, 0.333, 378.2 identical,
0 -> 0, supp 0, wave 3, survived.

### The repetition pattern, killed (seed 67502, step 4,4->4,1)

Baseline: day 10, the OTHER step (0,3->0,2) takes 1 spoken
+ 1 silent veto and never repeats. Day 28: 4,4->4,1 takes
1 spoken + 2 silent — one short of the budget. Then
silence for 23 days (no vetoes days 29-50). Day 51: the
route re-presents and is refused 3x/day, every day, days
51-60 (30 silent). Band total for the step: 32 silent
over 11 days. Armed: day 28's 2 silent carry (the budget
is run-scoped and does NOT reset at dawn — the
per-expedition design choice, vindicated here: a per-day
budget would have reset twice and never fired); day 51's
first silent is the 3rd, the step is abandoned, the
remaining day-51 attempts are suppressed (2), and days
52-60 are suppressed 3/day (27). Armed step total: 3
silent over 2 days, max 2/day. Suppressions band-wide:
29, all on 67502. This is the pilot's 62808 pattern
reproduced on a fresh band and killed the same way.

### Route-reopen (the 1345Z open question, now MEASURED)

Abandonment: seed 67502, step 4,4->4,1, loopDay 51.
(a) Structural: armed post-abandonment hop-log entries
for the step = 0; armed same-day hops after abandonment
= 1 (the abandoning veto itself, counted before the
mark). Structural PASS. (b) Cost: baseline twin passes
after day 51 = 0 — the baseline kept vetoing the step
3x/day through day 60 (27 vetoes after abandonment, 0
passes). No haul, away, survival, or death divergence
traces to the abandonment (0 divergent day-records on
67502, pantry + roster included). Measured cost of
permanent abandonment on this band: ZERO — because the
route never reopened in-window. Stated plainly, as the
prereg requires: the reopen risk beyond the window is
still untested (a route that opens on day 61+ would
still stay abandoned), but within 60 days the abandoned
route was refused every single day at baseline, so
nothing was lost by abandoning it.

### Identity check (scope as 1345Z)

Per-seed per-loopDay comparison of day snapshots
(positions, scholar kcal, pantry kcal, roster count + id
set) + forage attempts/successes: 0 divergent
day-records on all 12 seeds (720 day-records compared).
Scope limit stands: snapshot comparison, not full
game-state equality (no codex / trust / inventory /
monster comparison). On this band the scope limit is
moot for the claim made (the legs agree on everything
compared, including the abandonment seed).

## Sense-testing (transcripts, not just counts)

SayLines are byte-identical between legs on 67502 (5295
lines both legs) — expected: the budget adds no narration
and suppression is silent by design, so the story does
not change when the futile re-picks stop. What the
transcripts show is a village that does not notice the
budget at all, because the refused route was never part
of its story: the scholar ends every night home at 4,4,
fed (kcal 2000-2400), pantry over 100,000 kcal, foraging
near home instead. Day 12 brings a real learned counter
(Jada on Static: don't walk toward the voice, two rounds
of refusal and the act breaks — codex entry included).
Day 15 brings a System trial offer to Joyce. Days 45/55
bring villagers stitching tears by door light. Nothing
robotic, static, or repeated was flagged; the one
narration gap is the known, prereg-excluded one: the
abandonment itself is never spoken (a later arm's
narration question, not this instrument's — the pilot
prereg excluded it deliberately, and this run keeps that
exclusion).

## Village assessment (plain words)

Twelve villages, and mostly they are getting on with it
while fighting constantly. 67502 is the rich one with a
shut door: pantry 42,000 -> 96,000 kcal, roster 12 -> 8,
31 deaths mostly combat, and a scholar who spends the
last ten days hammering at a route that will not open —
then, on the armed leg, stops hammering and loses
nothing. 67508 is the one that dies: pantry 37,830 -> 0,
roster 12 -> 5, village lost day 44, deaths from combat
and wounds that would not close, not from the budget
(both legs identical to the death). 67510 scrapes by on
39.9 kcal/day of haul with a 57,000-kcal pantry and 30
deaths, 23 of them villager combat — a violent village
that still survives. What is missing, as on the 1345Z
band, is anything the budget could break: no village
here depends on a refused route reopening, and the one
village that does hammer a refused route is richer for
stopping. The budget is a quiet instrument: it removes
futile re-picks and changes nothing else.

## Wall numbers (in-window only, never pooled across arms)

Confirm window (60d, driver): national / table / wins 0
both legs (expected 60-day pre-seat profile, not a
regression); median survival 60d both; driver wave
reach: wave 4 unlocked on 1 seed (67503, both legs),
wave 5 unlocked 0, wave 5 fought 0, full seat 0. No wall
movement is shown or claimed: this confirm measures veto
repetition, not the scale wall. The wave-4 unlock on
67503 is unchanged between legs — the budget neither
helps nor hinders it.

## Balanced panel (§15, context never verdict)

Combined campaign: `node scripts/balance-panel.js --out
/tmp/vetobudget-qual-b-panel --policies
competent-homewardstep-b,competent-vetobudget-b --seeds
67501,...,67512 --days 60 --par 4` — 24 cases, 0 reused.
Per-seed panel rows are IDENTICAL between legs on all 12
seeds (won 0, national 0, table 0, villageDeaths identical
per seed). The panel's own substrate differs from the
judged driver's, same caveat class as the 1345Z run
(panel survival60 = 0 on seeds the driver survives 60d;
panel villageDeaths differ from driver deaths, e.g. 67502:
panel 41 vs driver 31) — panel rows are context, never
verdict, and must not be pooled with driver bars. Raw
panel archived as
evidence/2026-11-02/sim-vetobudget-qual-b-panel.json.gz
(+ .log; per-seed rows extracted to
evidence/2026-11-02/sim-vetobudget-qual-b-panel-rows/*.json).
No panel compare is claimed: the combined campaign is the
valid panel artifact for a policy-split arm, as on the
1345Z run.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-02/sim-vetobudget-qual-b-panel-rows/*.json'
--metrics national,table,wins,exiled --sweep-rows` —
wall: nationalEver 0/12, table 0/12, entered 0/12,
won 0/12. LOUD lines: "national disappeared: baseline 12
-> current 0", "table disappeared: baseline 16 -> current
0", "wins disappeared: baseline 16 -> current 0".
INVESTIGATED, not a real deviation: same documented
artifact as the 1345Z run — the baseline file is a
winseat-regime baseline (~100%-win suite, 180d) whose own
note says pre-seat substrates must NOT be compared
against it. This 60d pre-seat confirm is exactly that
regime. Exiled: 0, no LOUD line.

## Verdict: GO (pilot GO confirmed on a qualified fresh band)

- PRIMARY PASSES NON-VACUOUSLY: P2 (max 2 silent days,
  bar 3) and P3 (max 3 total silent, bar 3) on a band
  carrying a 32-silent / 11-day repetition pattern at
  baseline. The 1345Z DIAG is superseded for this
  question: the budget works on a band where repetition
  actually exists.
- ALL NO-HARM BARS PASS at 1.00x, including 0 divergent
  day-records with pantry + roster — the budget changes
  nothing except veto/suppression counters.
- ROUTE-REOPEN MEASURED: 1 abandonment (day 51), 0
  baseline passes after, 0 cost in-window. The
  permanent-abandonment risk beyond the window remains
  open by design (a route opening after day 60 would
  stay abandoned), and is now a documented residual,
  not an unmeasured fear.
- RECOMMENDATION TO COORDINATOR: the veto-budget lever
  is confirmed and needs no further confirm spend. The
  remaining work on this thread is narration (should an
  abandoned route earn a spoken line?) and, if ever
  wanted, a longer-window reopen probe — both are new
  arms, not re-runs of this one.

## Metric review (for the NEXT run, never a re-score)

- Qualify-first WORKED and should be the default for
  every future confirm on a phenomenon-carrying band:
  8 seeds of screen bought a judged confirm; the 1345Z
  run's 32-seed blind spend bought a DIAG. The screen
  analyzer (repetition definition + would-abandon
  translation) is reusable as-is.
- The brief's qualification gate (>= 2 repetition seeds
  OR >= 1 abandonment) qualified this band on its weaker
  prong with only 1 repetition seed — and that was
  enough, because the confirm analyzer's own gate (>= 1
  repetition seed) was also met. Future preregs should
  state both gates together: screen-qualify on the
  brief's rule, but require >= 1 repetition seed before
  spending the armed leg, or the 1345Z DIAG recurs
  through the would-abandon-only door (a band with a
  lone 3-silent step and no repetition seed would
  qualify on screen and still return DIAG from the
  confirm analyzer).
- P1 dropped as a bar (1345Z review adopted): P1 numbers
  are still tabulated (armed max 2/day on the rep seed)
  for continuity, and P3 continues to imply P1.
- The per-expedition (non-resetting) budget design is
  now evidence-backed, not just reasoned: day 28's 2
  silent vetoes bridged a 23-day gap to day 51's
  abandoning veto. A per-day budget would have failed
  this pattern. Future budget arms should keep the
  run-scoped counter.
- Panel-vs-driver substrate divergence persists (same
  class as 1345Z: survival and death counts differ
  between substrates while leg-identity holds on both).
  Until isolated, panel context on policy-split arms
  carries this caveat — it did not affect this verdict,
  which rests on the judged driver.
- Out-of-arm gap surfaced, NOT chased (findings backlog
  format, for the coordinator to append):
  `- [open] 2026-11-02 — panel-vs-driver substrate — panel survival60/death counts diverge from the judged driver on identical seeds (67502: panel villageDeaths 41 vs driver 31; panel survival60 0 where the driver survives 60d) (sim-vetobudget-qual-b evidence).`

## Corpora

- evidence/2026-11-02/sim-vetobudget-qual-b-prereg.md
- evidence/2026-11-02/sim-vetobudget-qual-b.md (this file)
- evidence/2026-11-02/sim-vetobudget-qual-b-screen1-guard.jsonl (+ .log)
- evidence/2026-11-02/sim-vetobudget-qual-b-confirm-baseline.jsonl (+ ext .jsonl/.log)
- evidence/2026-11-02/sim-vetobudget-qual-b-confirm-armed.jsonl (+ .log)
- evidence/2026-11-02/sim-vetobudget-qual-b-confirm-analysis.txt
- evidence/2026-11-02/sim-vetobudget-qual-b-panel.json.gz (+ .log)
- evidence/2026-11-02/sim-vetobudget-qual-b-panel-rows/*.json
- scripts/analyze-vetobudget-qual-b.js, scripts/test-vetobudget-qual-b.js
