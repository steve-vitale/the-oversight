# sim-successorcaution-b — the successor-caution policy variant

**Verdict: PILOT-NO-GO — killed at pilot, no confirm spend.** The mechanism
works exactly as designed (65 successions caught, 114 caution days, 113
solo trips suppressed, 0 errors) and the cost bar is clean — but the
primary metric does not move: scholar `the wild` deaths per national-day
0.1649 → 0.1562 (0.947x control), one death in 63. The pilot gate's
letter passes on all three items, but its purpose — "never run 12–16
seeds on an invisible effect" — fails on the primary: the effect is
invisible, and the gap analysis shows why it must stay invisible. The
lever prevents gap-1 deaths (22 → 14) and the same-day cascades absorb
every one of them (gap-0 deaths 23 → 32). A daily-level gate cannot touch
a death that happens inside the death day's own daily() call, and the
confirm math is decisive: the confirm bar (≤ 0.6x) would need the ON leg
to nearly halve the death rate the pilot just measured at 0.95x — a ~4σ
swing. No game code was changed. No confirm was run.

Loop B run `fleshout-loop-b-20261115T0621Z`, axis winnability chain, arm
sim-successorcaution-b. Prereg:
`evidence/2026-11-15/sim-successorcaution-b-prereg.md` (committed
`4a8a09e58` — binds). Branch: `sim-successorcaution-b`. Base master
`b9b226430` (funeral-mend tip; FUNERALMEND default ON).

## The lever, in plain words

When the scholar dies alone in a wave-4/5 field fight, the Codex passes
to the next villager, and the new bearer walks out foraging alone at a
tile corner the same day and dies the same way. This arm is door 3 of
the fighterhold hand-off: a policy variant that stops sending the
successor out alone the same day. For the new scholar's first two days,
the bot stays at Haven — it answers the court, tends and proposes links,
keeps promises, sorts and eats, talks, checks its own kit — and does not
start a solo forage trip. No game code. No flee change. No toughness,
gear, or ability tuning. No party system. The policy file is
`scripts/policies/competent-successorcaution-b.js` (new; wraps
`competent-answercourt-b`).

## Stage 0 — reproduction: DIVERGES, explained before judging

The control leg (unmodified funeralmend driver, competent-answercourt-b,
pilot band 100201–100208) does NOT reproduce the committed funeral-mend
ON pilot numbers. It diverges on all 8 seeds (e.g. 100201: committed 150d
survived / 62 deaths; fresh 113d village-lost / 73 deaths; 100204:
committed 150d survived; fresh 97d village-lost). The cause is located,
not assumed: between the corpus anchor (`f7ec330a58`) and this run's tip,
journey-scale r206 changed `src/js/game.js` in two behavior-relevant
places — the `travelTo` landing-spot rule (a walkable neighbor is no
longer an exit; the landing cell must sit in the tile's main connected
component, BFS regions) and monster spawn placement (no more spawning
stacked on the scholar's tile) — plus conversation-label freshness in
`conversation.js` / `convo-scene.js`. Real game-behavior changes shift
sim trajectories. The funeral-mend arm's post-rebase Stage-0 check
covered only the OFF leg on 3 seeds; the ON leg was generated
pre-rebase and cannot reproduce on this tip.

Consequence, recorded before judging: **the judged control is the fresh
control leg on the current tip, not the committed corpus numbers.** The
prereg's control values (P1 0.1075, held-days 63.5, survival 130d) are
superseded by the fresh control leg (P1 0.1649, held-days 47.5, survival
117.5d). The fresh control is harsher on every axis — the r206 drift
made this band deadlier. All judged comparisons below are fresh-control
vs fresh-armed on the same tip.

Stage 0b — the NEW driver
(`scripts/successorcaution-driver-20261115.js`, copy of the funeralmend
driver + third-policy dispatch + caution stats) reproduces Stage 0a
**3/3**: seeds 100201/100203/100212, all judged fields identical
(100212's only field diff is `anchorCommit`, which differs by
construction — the corpus commit moved under the run; no src change in
between). The new driver is validated; the judged legs both run on it.

## Proof test — scripts/test-successorcaution-b.js (4/4)

- `static`: no `Math.random` in code (comments stripped first — the
  header documents the rule in prose); CAUTION_DAYS is 2; competent.js
  + competent-answercourt-b.js unmodified vs HEAD; no src/js file
  modified; fight and upkeep hooks inherited unchanged.
- `unit-caution` (fake Game): first daily runs the wrapped daily; a vid
  change opens a 2-day window (wrapped daily NOT called, trips
  suppressed when needTrip is true, one voiced line names the
  successor); normal play resumes after N days; a second succession
  re-opens the window. 2 successions, 3 caution days, 3 suppressed,
  2 say lines, 0 errors.
- `sim-caution` (real harness, seed 100208, 60 days): 1 succession on
  day 24 (the corpus's first death on that seed is day 23); 2 caution
  days, 2 trips suppressed; on every caution day the wrapped daily did
  not run, forageTrips did not rise, and the scholar stayed at Haven;
  the successor's first daily found them at Haven (4,4).
- `determinism`: the armed driver oneRun twice on seed 100208, 60 days —
  deaths, days, endReason, series length, and caution stats identical.

## Pilot (8 seeds 100201–100208, 150d, fresh control vs armed)

### Pilot OFF leg (fresh control — the judge's baseline)

| seed | days | end | maxWave | scale end | natDay | held-days | dissolutions | starv | wildNat | P1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100201 | 113 | village-lost | 5 | national | 62 | 52 | — | 0 | 5 | 0.096 |
| 100202 | 132 | village-lost | 5 | national | 97 | 36 | — | 0 | 7 | 0.194 |
| 100203 | 145 | village-lost | 4 | national | 62 | 83 | — | 0 | 9 | 0.108 |
| 100204 | 97 | village-lost | 4 | national | 68 | 30 | — | 0 | 8 | 0.267 |
| 100205 | 124 | village-lost | 5 | regional | 62 | 59 | d121 | 0 | 7 | 0.119 |
| 100206 | 104 | village-lost | 4 | national | 62 | 43 | — | 0 | 10 | 0.233 |
| 100207 | 93 | village-lost | 4 | national | 74 | 20 | — | 0 | 7 | 0.350 |
| 100208 | 122 | village-lost | 4 | national | 64 | 59 | — | 0 | 10 | 0.169 |

OFF aggregates: national-ever 8/8; end-state national 7/8; median
national held-days **47.5**; median survival **117.5d**; starvation
pooled **0**; total deaths 652; dissolutions **1**; wave-5 unlocked 3/8;
wave-4 8/8; wins 0; table 0. Pooled P1 **0.1649** (63 while-national
scholar `the wild` deaths / 382 national-days).

### Pilot ON leg (armed)

| seed | days | end | maxWave | scale end | natDay | held-days | dissolutions | starv | wildNat | P1 | succ/caut/supp |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 100201 | 132 | village-lost | 5 | national | 62 | 71 | — | 0 | 4 | 0.056 | 9/15/15 |
| 100202 | 95 | village-lost | 4 | regional | — | 0 | — | 0 | 0 | — | 8/14/13 |
| 100203 | 115 | village-lost | 4 | national | 62 | 54 | — | 0 | 6 | 0.111 | 8/15/15 |
| 100204 | 127 | village-lost | 4 | national | 68 | 60 | — | 0 | 13 | 0.217 | 10/17/17 |
| 100205 | 150 | survived | 5 | national | 62 | 89 | — | 0 | 11 | 0.124 | 11/21/21 |
| 100206 | 63 | village-lost | 4 | national | 62 | 2 | — | 0 | 9 | 4.500 | 3/4/4 |
| 100207 | 143 | village-lost | 5 | national | 74 | 70 | — | 0 | 11 | 0.157 | 10/17/17 |
| 100208 | 123 | village-lost | 4 | national | 64 | 51 | — | 0 | 8 | 0.157 | 6/11/11 |

ON aggregates: national-ever 7/8; end-state national 7/8; median
national held-days **57**; median survival **125d**; starvation pooled
**0**; total deaths 612; dissolutions **0**; wave-5 unlocked 3/8;
wave-4 8/8; wins 0; table 0. Pooled P1 **0.1562** (62 / 397).
Caution pooled: **65 successions detected, 114 caution days, 113 trips
suppressed, 1 trips-not-needed, 65 voiced lines, 0 errors.**

Notes on the table: 100206's P1 of 4.500 is a degenerate ratio (9
while-national deaths over 2 national days — the village reached
national on day 62 and died in the cascade the same day); per-seed P1
is meaningless on tiny denominators, which is why the pooled P1 is the
judge. 100202 never reached national ON (died day 95 regional), so it
contributes no national days. Per-seed P1 improved on 4 seeds, was flat
on 2, and is degenerate/absent on 2 — the pooled move is noise-level.

### Pilot gate (pre-registered, all three)

- (i) Mechanism fires: every pilot seed with ≥ 1 succession has
  cautionDays ≥ 1 (3–21 per seed), AND band tripsSuppressed 113 ≥ 1 —
  **PASS, strongly.** The lever engages on every succession and the
  suppression is near-total (113 of 114 caution days would have
  tripped).
- (ii) Cost bar clean: starvation ON 0 ≤ OFF 0 + 2 ✓; median survival
  ON 125 ≥ 0.8 × 117.5 = 94 ✓ — **PASS.** Staying home for two days
  after a succession costs nothing measurable: no one starved for it,
  and villages lived longer on balance.
- (iii) P1 moves in the GO direction: 0.1562 < 0.1649 — **passes by
  the letter (0.947x), fails by effect.** One death in 63. The gap
  analysis below shows the move is not a lever effect waiting for more
  seeds — it is the ceiling of what this mechanism can do on this
  band, already reached and offset.

### Why no confirm — the gap analysis and the confirm math

Analyzer: `scripts/analyze-successorcaution-ceiling-b.js` (episodes:
a new episode starts after a gap ≥ 3 days; the ceiling is all deaths
from the first gap-1/2 death to the end of each episode).

Fresh-control pilot gaps (88 scholar `the wild` deaths): same-day
(gap 0) 23, gap 1: 22, gap 2: 5, gap 3+: 38. ON pilot gaps (88 deaths):
gap 0: **32**, gap 1: **14**, gap 2: 5, gap 3+: 37. Total `the wild`
deaths are IDENTICAL (88 → 88); death-cause shares are unchanged
(`the wild` 13.5% → 14.4% of all deaths). The lever did exactly what
it was built to do — gap-1 deaths fell 22 → 14 (−36%: the window
works, the successor who would have died the next day stays home and
lives) — and the same-day cascades absorbed every one of them, gap-0
rising 23 → 32 (+39%). A daily-level gate cannot touch a death that
happens inside the death day's own daily() call: the rest of daily()
(counterPlay, talkRound travel, the next trip leg) keeps running with
the new bearer after a mid-trip succession, and the cascade continues
in the same call. The deaths the lever prevents are replaced, one for
one, by deaths it structurally cannot reach.

Confirm math: the pilot ON rate is 62 while-national deaths on 8
seeds (7.75/seed). A 16-seed confirm at the same rate would land
~124 deaths against a control of ~126 — the bar (≤ 0.6x) needs ≤ ~76,
a 39% drop from the measured ON rate, roughly a 4σ swing
(σ ≈ √124 ≈ 11 deaths; the bar needs −48). The ceiling on the fresh
control is 0.429x in principle, but the pilot shows the lever
operating at 0.947x while its own window works — the gap between the
ceiling and the observed effect is the same-day cascade, which more
seeds cannot fix. Spending 32 runs on a near-certain NO-GO is the
waste the pilot gate exists to prevent. **Killed at pilot.**

## Balanced-panel compare (§15)

`evidence/2026-11-15/successorcaution-panel.{json,md}` +
`-before`/`-after` `.json.gz` (builder:
`scripts/build-successorcaution-panels-20261115.js`; paired seeds,
same driver code path, same metrics; the contrast IS the policy).
Decision **review_required**; no material signals. Village deaths per
run 81.5 → 76.5 (delta −5, 95% CI [−21.4, +10]); per 100 days −7.2
(CI [−19.1, +2.6]); both intervals include zero. National scale access
0.875 → 0.875. Community loss 1 → 0.875 (100205 survived ON). The
panel agrees with the pre-registered bars: a small, non-significant
improvement in deaths, no movement in scale access. The panel is the
instrument; the pre-registered bars are the judge, and they say NO-GO
on the primary.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-15/perseed-successorcaution-b-on/*.json' --metrics
national,table,wins,exiled --allow-recorder-corpus` fires three LOUD
lines (national 12→0, table 16→0, wins 16→0). Investigated same-run:
verified from the baseline file itself that its `_regime.note`
documents this exact comparison as invalid — it is a "winseat — full
win-side win stack, ~100%-win suite" regime, and it says "DO NOT
compare pre-seat / courtship / readiness substrates against this
baseline — wins are structurally ~0 there and telemetry-check will
fire a spurious LOUD 'wins disappeared'". This arm is a pre-seat
substrate (wins 0 and table 0 on both legs); the national line is the
same mapping artifact (the check reads a `national` count field the
recorder rows do not carry — measured national-ever is 7/8 ON, 8/8
OFF). The LOUD lines are the documented regime artifact, not a
regression; no action taken, no baseline re-seeded (re-labeling the
baseline is a separate maintenance decision, not this arm's).

## Sense-testing — does the grieving bearer staying home read sensibly?

Mostly yes — and the village does not go silent on caution days. The
linkLines on succession days are alive: aid grain sent to three fires
("Haven sends 1,500 kcal of grain to Emberhold's fire — not tribute,
the other way around"), "You came back bloody. Nobody asks. Someone
saves you the good seat by the fire", and the grave-speaking for the
new bearer ("At the grave, Carlos, Lemein, Sam and 3 more speak for
Shannon — 'Chebet trusted them. We saw it. Give them the fire's
hearing.' The village listens."). The succession itself is voiced by
the engine ("The Codex doesn't pause for grief. Shannon blinks — and
it's already there..."). Two honesty wrinkles, recorded not hidden:

1. **The caution line itself is not in the corpus.** The policy voices
   one line per succession ("<Name> stays by the fire today — the
   Codex is heavy, and the wild can wait a day."), and the stats prove
   it fired 65 times (sayLines = successions on every seed, 0
   errors) — but the driver's linkLines regex does not match it, so
   the text is not retained in any per-seed file. The stay is
   legible in the counters, not in the transcript. A recorder that
   kept policy-voiced lines would close this; the policy is not at
   fault, the instrument is.
2. **The stay reads as absence, not mourning, in the numbers.** On
   caution days the scholar does Haven chores (talk, tend, promises)
   but the village's own routines carry the day — nothing in the
   transcript marks the two days as grief rather than an ordinary
   Haven day, except the one voiced line (see wrinkle 1).

Village stories: **100206** is the verdict in miniature — reached
national on day 62 and died the same day: seven scholar deaths on d62
and four more on d63, all `the wild`, with only 3 successions
detected and 4 caution days, because the cascade ran inside two
daily() calls. **100205** is the lever's best seed — survived 150 with
89 held-days (control: died day 124, held 59), 11 successions, 21
caution days, 21 trips suppressed — yet still 14 scholar deaths,
spread across days 41–146: established bearers dying on later trips,
which the 2-day window never touches. **100207** held 70 days (control
20) across 10 successions — the hold lengthens even while the deaths
continue.

## Reachability verdict

- **Waves 1–5:** wave-4 reached 8/8 both legs; wave-5 3/8 both legs.
  The lever does not unlock new waves and does not close any.
- **Regional → national:** national-ever 8/8 OFF → 7/8 ON (100202
  never reached national ON); end-state national 7/8 both legs. The
  lever lengthens national holds (+9.5 median days) without changing
  national access.
- **The table:** 0/8 both legs. The lever does not move the village
  toward the table — it is a death-delay lever, not a standing lever.
- **Wins:** 0/8 both legs.
- **Cost verdict:** clean. Starvation 0 on both legs; median survival
  125d vs 117.5d; dissolutions 0 vs 1; total deaths 612 vs 652. The
  two-day stay costs nothing measurable — the village is not
  starving, collapsing, or losing standing for it.
- **Net reachability:** the chain's binding link is unchanged. Scholars
  still die alone in the wild at the same total rate (88 → 88); the
  lever only shifts deaths out of the next-day bucket and into the
  same-day bucket. Winnability is not advanced by this lever in this
  shape.

## Village assessment (plain words)

The village reads like a village that keeps losing its bearer and
keeps carrying on — it sends grain to other fires, it speaks for the
new bearer at the grave, it saves the good seat by the fire for the
bloodied returner. The two-day stay after a death is the humane thing
and it is free: no one starved, no one dissolved, holds got longer.
But it does not save the bearer, because the bearer does not die the
day after the death — the bearer dies the day of the death, in the
same long day that killed their predecessor, or weeks later as an
established bearer on an ordinary trip. The 2-day window covers a
hole the deaths do not fall through. The lever is a kindness with a
good conscience and a null result on the thing it was built to fix.

## Metric review (against the prereg)

- **P1 (primary): scholar `the wild` deaths per national-day ≤ 0.6x
  control.** OFF 0.1649 (63/382); ON 0.1562 (62/397); **0.947x.
  NO-GO.** The bar is 0.6x (≤ 0.0989); the observed rate is 57%
  above the bar.
- **P2: median national held-days ≥ control.** OFF 47.5; ON 57 —
  **PASS** (but P2 is a companion; it does not override P1).
- **Cost bar: starvation pooled ≤ control + 2 AND median survival ≥
  0.8x control.** Starvation 0 ≤ 2 ✓; survival 125 ≥ 94 ✓ —
  **PASS.**
- **Pilot gate:** (i) mechanism fires — **PASS, strongly** (65/65
  successions caught, 113 trips suppressed); (ii) cost bar clean —
  **PASS**; (iii) P1 in GO direction — **passes by the letter,
  fails by effect** (0.947x). Gate's purpose fails: the effect is
  invisible and the gap analysis proves it cannot grow with more
  seeds.
- **Ceiling check:** pre-sim ceiling on the committed corpus was
  0.737x — already below the 0.6x bar, recorded before any sims so
  the bar could not be moved post-hoc. Fresh-control ceiling on this
  band is 0.429x in principle; the observed 0.947x against that
  ceiling is the same-day cascade absorbing the gain.
- **Where the deaths live:** gap-1 deaths −36% (mechanism works);
  gap-0 deaths +39% (cascade absorbs); gap-3+ unchanged (37 vs 38 —
  the lever never reaches established bearers).
- **Recommendation:** do not confirm, do not land as-is. The next
  lever should aim at the two buckets this one cannot touch: (a)
  same-day cascades — the rest of a death day's daily() call running
  with the new bearer (needs a game-side or driver-side break, not a
  daily-level policy gate); (b) gap-3+ established-bearer deaths —
  the 47% of deaths that happen 3+ days after succession, on ordinary
  trips (needs a different lever: accompany the bearer, or change
  what the trip itself is). Re-setting the P1 bar to the ceiling
  (0.737x on the committed corpus) would make the bar honest, but
  even that bar is not met (0.947x) — the lever is a null result,
  not a near-miss.

## Wall numbers

- Runs 2026-11-14 20:46–21:30 (Stage 0), 2026-11-15 00:34–01:19 (Stage
  0b, pilot OFF), 01:45–02:44 (pilot ON); 3 replays of the 8-seed
  band on the new driver (2 identical on all judged fields, 1
  anchorCommit-only diff); 0 errors across the armed pilot.
- **Pre-sim gap shares (committed funeral-mend ON corpus, 16 seeds,
  148 scholar the-wild deaths):** gap-0 40 (27.0%), gap 1–2: 38
  (25.7%), gap 3+: 70 (47.3%). Ceiling (N=2, perfect operation incl.
  cascade truncation): best possible P1 = 0.0792 = 0.737x control.
  N=3,4,5,7 give the same ceiling. The assigned 0.6x bar (0.0645)
  sits below the mechanism's first-order ceiling — recorded in the
  prereg before any sims.
- **Fresh-control pilot (8 seeds, 88 deaths):** gap-0 23, gap-1 22,
  gap-2 5, gap-3+ 38. Ceiling 0.0707 = 0.429x. **ON pilot (8 seeds,
  88 deaths):** gap-0 32, gap-1 14, gap-2 5, gap-3+ 37.
- **Death-cause shares (pilot, 8 seeds):** OFF 652 total — villager
  combat 43.3%, combat 18.3%, expedition 17.5%, the wild 13.5%.
  ON 612 total — villager combat 42.3%, expedition 20.3%, combat
  14.9%, the wild 14.4%. The lever shifts deaths between causes
  and buckets; it does not reduce them.
- **Wall totals (pilot band, 8 seeds):** 12 the-wild scholar deaths
  prevented nowhere — 88 OFF → 88 ON; 652 total deaths → 612
  (−6.1%, inside the panel's CI); 1 dissolution → 0; 0 starvation
  both legs.

## Files changed

- `scripts/policies/competent-successorcaution-b.js` (new, 179 lines) —
  the lever. No src/js change; no default-policy change.
- `scripts/successorcaution-driver-20261115.js` (new) — driver for the
  armed + third-policy dispatch + caution stats in capSummary.
- `scripts/test-successorcaution-b.js` (new) — 4/4 green proof test.
- `scripts/analyze-successorcaution-ceiling-b.js` (new) — gap/ceiling
  analyzer.
- `scripts/analyze-successorcaution-b.js` (new) — pilot judge analyzer
  (validated exactly against published funeral-mend numbers).
- `scripts/build-successorcaution-panels-20261115.js` (new) — §15 panel
  builder (adapted from the funeralmend builder).
- `evidence/2026-11-15/sim-successorcaution-b-prereg.md` (new) —
  pre-registration (committed before any sims).
- `evidence/2026-11-15/sim-successorcaution-b.md` (this file).
- `evidence/2026-11-15/successorcaution-panel.{json,md}` +
  `successorcaution-panel-before.json.gz` /
  `successorcaution-panel-after.json.gz` — §15 balanced-panel
  compare (review_required, no material signals).
- `evidence/2026-11-15/perseed-successorcaution-b-control/` — 11
  files (8 pilot + 3 Stage-0b validation; funeralmend driver,
  competent-answercourt-b).
- `evidence/2026-11-15/perseed-successorcaution-b-on/` — 8 files
  (pilot, armed policy).
- **No game code changed.** `git diff HEAD` over src/js is empty;
  `scripts/policies/competent.js` and
  `competent-answercourt-b.js` are unmodified vs HEAD (proven in the
  proof test's static leg).

## Final checks

- Proof test 4/4 green at commit `31c51f32d`; no code changed since
  (only evidence commits) — no re-run needed.
- All pilot numbers are computed from the per-seed corpus files with
  `scripts/analyze-successorcaution-b.js` (re-run above against the
  control dir: 100201 52d held / 0.096, 100202 36 / 0.194, 100203 83 /
  0.108, 100204 30 / 0.267, 100205 59 / 0.119, 100206 43 / 0.233,
  100207 20 / 0.350, 100208 59 / 0.169 — matches the tables).
- Index-clobber struck after every safe-commit on this arm (4 times);
  repaired each time with
  `git ls-tree -r HEAD -- <dir> | git update-index --add
  --index-info`; worktree must be verified clean before handoff.
- Next step is a coordinator decision: kill the lever (recommended)
  or re-set the bar and aim the next lever at same-day cascades /
  gap-3+ established-bearer deaths.
