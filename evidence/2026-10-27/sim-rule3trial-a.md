# sim-rule3trial-a — trial-completing player substrate screen: SCREEN-NEGATIVE

Run: flesh-out loop, axis scale-onramp. Worker: sim-rule3trial-a
(run fleshout-20261027T1940Z).
Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-rule3trial-a-prereg.md (commit d7ec438e).
Corrected-instrument commit (see "Invalid first sweep" below):
6fdd3725. Judged corpus: evidence/2026-10-27/perseed-rule3trial-a/
(16 per-seed rows + summary.json). Proof:
scripts/test-rule3trial-a.js — ALL APPLICABLE PROOFS PASS
(--require A). No src/js touched. The two new policy files built for
this screen (tableseat-trialchase, tablepaths-trial) are DELETED in
the final commit, per the prereg's killed-arms rule — the screen is
negative, so they leave no trace. The sweep and proof scripts stay as
the measurement record.

Verdict: **SCREEN-NEGATIVE** — judged only against the binding prereg.
The pilot band seated 5/8 (floor clause (a) met) but produced ZERO
seated seeds with defiance NOT offered (floor clause (b) failed), so
Phase 2 was never judged, no live fallback-feared test was forced,
and no band beyond the one pre-registered band was screened. Rule (3)
(fallback-feared) stays unit-proven only, exactly as after 1631Z,
1715Z, and 1816Z.

## Plain words

The last three attempts could not test the "only feared is offered,
take feared" rule because every village that reached the table had
already earned defiance. This run built the player the 1816Z notes
asked for: someone who plays FOR the audience's trials — hauling hard
and donating everything while a pantry trial is open, eating
half-learned plants toward full knowledge while an identify trial is
open — instead of letting trials expire. It did not work either. The
trial-chasing villages completed 32 trials (and the chase days are
counted: 138 pantry-chase days, 119 identify-chase days), but they
still let 52 trials expire, and every village that sat down carried
defiance of 5 to 8, where 4 is enough to be offered the defiant door.
Chasing trials moved completions but nowhere near enough: staying
under 4 after 90+ days needs roughly two-thirds of trials completed,
and this player completed barely more than a third. The rule itself
is still untested live, and the hunt now needs a different trigger
route, not a stronger chase (see Metric review).

## Invalid first sweep — read this before the numbers (LOUD)

The first sweep on this band (retained separately, NOT judged, at
evidence/2026-10-27/perseed-rule3trial-a-invalid/) is INVALID and
must never be cited as this screen's result. Its sweep env omitted
LEANLINKRESCUE=1, which the leanlinkrescue courtship gates on — so
both legs ran competent-only with the trial chase on top, no
courtship at all, national 0/8, seats 0/8. The bug was caught from
the corpus itself: courtship counters (proposedLead, courtCounters,
tended) were entirely absent on every row, while trial telemetry was
rich — a substrate-activation signature, not a game result. The
proof gates all "passed" on the invalid corpus (G-leak trivially true
with no seatings, 0 seated) — delegation gates cannot detect a
missing courtship, which is the metric-review lesson below.

What was done about it, disclosed rather than hidden: the sweep env
was fixed (LEANLINKRESCUE=1 on both legs, det-gate and sense modes
too; commit 6fdd3725), the det-gates were re-run under the corrected
env (both PASS), and the pilot was re-run on the SAME pre-registered
band 77301-77308. This is a corrected-instrument run, not a second
screen: the registered substrate (tableseat-nowait = leanlinkrescue
courtship + seat legs, plus the trial chase) had never been measured
on these seeds before — the invalid run measured competent+chase, a
different substrate entirely, and its numbers appear nowhere in the
judged results below. The invalid corpus is kept only so the failure
is auditable; it was not blended, not re-scored, and not used to
choose anything.

## The screen (binding design, as pre-registered)

- Candidate substrate: tableseat-nowait (leanlinkrescue courtship +
  seat legs, no wait leg) + trial chase (extra forage trip + sort +
  donate-all on pantry trials; extra forage + sort + eat level-2
  plants on identify trials), under tablepaths-trial's door rule on
  the armed leg. Baseline tableseat-trialchase vs armed
  tablepaths-trial, identical seeds, 180d death-aware horizon, paired
  sweep.
- One pilot band: 77301-77308. Freshness verified before sweeping:
  substring grep of evidence/2026-10-27/ found ZERO hits for any of
  the 8 seeds (77101/77107 were rejected for hitting under the same
  grep).
- Seat-rate floor (binding): QUALIFIES iff armed seated >= 3 AND >= 1
  seated seed with defiance NOT offered. Seated = 5, no-defiance = 0:
  clause (a) met, clause (b) failed → SCREEN-NEGATIVE.
- Seeds 74201-74208, 74601-74608, 74801-74808, 75701-75708,
  76101-76108, 76301-76308, 76501-76508, diagnostic 76901-76902 were
  NOT re-swept or re-scored.

## Results (judged corpus only)

| seed | days | won | national ever/final | table | entered / door / defiance | wave | trials seen/comp/exp |
|------|------|-----|---------------------|-------|---------------------------|------|----------------------|
| 77301 | 90 | won | 1 / 1 | 1 | defiant / 8, won | 3 | 9 / 1 / 8 |
| 77302 | 180 | survived | 1 / 1 | 0 | — | 3 | 21 / 13 / 7 (+1 open) |
| 77303 | 93 | won | 1 / 1 | 1 | defiant / 5, won | 4 | 10 / 4 / 5 (+1 open) |
| 77304 | 90 | won | 1 / 1 | 1 | defiant / 6, won | 4 | 9 / 3 / 6 |
| 77305 | 90 | won | 1 / 1 | 1 | defiant / 5, won | 3 | 9 / 4 / 5 |
| 77306 | 36 | lost | 0 / 0 | 0 | — | 2 | 3 / 0 / 3 |
| 77307 | 101 | won | 1 / 1 | 1 | defiant / 7, won | 4 | 11 / 4 / 7 |
| 77308 | 153 | lost | 1 / 1 | 0 | — | 3 | 15 / 3 / 11 (+1 open) |
| TOTAL | med 93 | 5/8 | 7/8 / 7/8 | 5/8 | 5 defiant, 0 other | — | 87 / 32 / 52 (+3 open) |

Every seated armed row took rule 'defiant' (defiance offered, picked
defiant, won). Offer lists were the full earned set on 4 of 5
seatings (feared, beloved, witness, assimilated, defiant, relay;
77305 lacked witness). Baseline entered feared on the same 5 seeds
and won on the same 5 — the door changes nothing else, as in every
prior band.

Mechanism corroboration (the strongest number in this screen): on
all 5 seated seeds, the trial telemetry's EXPIRED count equals the
seating defiance value exactly — 77301: 8 expiries / defiance 8;
77303: 5 / 5; 77304: 6 / 6; 77305: 5 / 5; 77307: 7 / 7. Defiance at
seating is trial expiries, counted two independent ways (ledger
snapshot at the door, chase telemetry across the run). The chase
completed 32 trials but the seated villages still expired 5-8 each —
expiries accrue from the first weeks (the invalid run's diagnostic
shape: first expiry days 13-22, roughly one per 9-13 days), and a
seating at day 90-101 needs fewer than 4 expiries across the whole
run. This substrate completed 37% of its trials; staying under the
threshold needs roughly two-thirds.

The identify half of the chase barely fired: across both legs, only
3 eat-L2 bites and 1 L2→L3 conversion were recorded, against 119
identify-chase days. Identify trials almost never had level-2 plants
in the pack to eat — the bottleneck for identify completion is
getting plants TO level 2 (5 harvests), not the final tastings. The
pantry half did the work (138 chase days, donate-all), and still fell
short against the village drain.

## Wall numbers (armed legs; baseline identical except door)

| national ever | national final | table | wins | full seat | wave 4 | wave 5 | median days |
|--------------|---------------|-------|------|-----------|--------|--------|-------------|
| 7/8 | 7/8 | 5/8 | 5/8 | 0/8 | 3/8 | 0/8 | 93 |

Median days (93) is win-censored: the 5 seated runs end at their win
(days 90-101), so the median is a win day, not a survival limit.
Deaths (armed leg): 211 total, starvation 4 (3 on 77306, 1 on 77308).
Combat dominates as usual: villager combat 88, villager-vs-villager
combat 61, player arena deaths 26, monster kills 6, ambush 2 (183 of
211 combat-shaped), then expeditions 11, sickness 6, wounds 3, Sweeps
Week 1, alien 1, night 1, starvation 4. Non-seated seeds: 77302
survived to the horizon at national with a 78,951-kcal pantry and
never saw the table; 77308 collapsed to population 2 with 61 deaths;
77306 died day 36 (the band's early collapse, 3 starvation deaths).

## Proof gates (as pre-registered)

- G-det1: PASS (seed 77301, corrected env: baseline days == door-off
  days, no dp counters; re-run after the env fix).
- G-det2: PASS (seed 77301, corrected env: trial-off days ==
  tableseat-nowait days, no tr counters; re-run after the env fix).
- G-screen: PASS (16/16 rows, no zero-day rows, ts/dp/tr counter
  objects present on every row).
- G-offer: PASS on all 5 seated armed rows (proof script): every
  'defiant'-rule row shows 'defiant' in its offer list and picks
  defiant, every earned snapshot's defiant.earned matches offer
  inclusion, every fallbackFeared flag matches its doorRule (all 0).
- G-leak: PASS (non-seated seeds identical days/gameDays between
  legs: 3/3 comparable seeds; the door changes nothing but the door).
- G-trial: REPORTED (telemetry present on all 16 rows; totals above).
  Zero-trials vacuity did NOT occur (87 trials seen).
- Substrate activation (added after the invalid run): courtship
  counters present on the judged corpus — proposedLead 22,
  courtCounters 1, tended 120, identical on both legs. The judged
  corpus ran the registered substrate; the invalid corpus had zeros
  across the board.
- Proof script: scripts/test-rule3trial-a.js, run with --require A:
  ALL APPLICABLE PROOFS PASS, first qualifying band NONE. (The proof
  script itself had a scope bug in its courtship print, fixed before
  judging: it read a loop variable that did not exist in the print
  loop. The fix touches only the print, not any gate.)

## Sense test

No fallback-feared seating occurred, so no seating transcript is
claimed — the prereg's sense condition is explicitly unmet, not
faked. The additional single-seed sense replay (seed 77302, armed
policy, non-measured) completed: survived, no table, ring 240 lines.
Honest limit: the instrument's say ring holds only the run's tail
(days 178-180), so no trial beats survive in it — no trial-chase
reading can be claimed from this replay, and none is. What the tail
does show, coherently: a prosperous late village (pantry ~51,000 kcal
kept, ~94 days of fresh on hand, villagers foraging, donating,
cooking, mending) that reached national and never saw the table —
the same rank-without-invitation shape the corpus shows for 77302.
The sense instrument needs a longer or trial-filtered ring before it
can read trial play; that is a tooling finding, not a game finding.

## Village assessment — what the villages looked like

These were courted, fed, quarrelsome villages. Seven of eight reached
national and held it; five sat down and won through the defiant door.
Pantries at the end ranged from nearly empty (77306 at 750 kcal, dead
day 36; 77307 at 1,265 kcal, won day 101) to overflowing (77302 at
78,951 kcal, national, never invited). Full pantries did not buy
seatings by themselves, and neither did trial-chasing: the seated
five won, all through defiance, and the two national villages that
never saw the table (77302, 77308) show the same decoupling as every
prior band — national is common, the seat is not, the full seat is
nowhere. Who thrived: the seated five, all of whom walked defiant and
won — defiance, once earned, is a winning door, not a losing one. Who
died and why: combat first (149 of 211 deaths are combat-shaped),
then expeditions and sickness; starvation is a minor cause here
(4/211), which cuts against the standing "villages starve
mid-ambition" story on THIS substrate — on trial-chase bands the
binding constraint looks like invitation scarcity plus combat
attrition, not food. What was missing for the non-seated villages
was not food or rank but entry itself: 77302 and 77308 held national
without ever seeing the table.

## Blanks filled or documented

- FILLED (measurement): the trial-chase substrate is now measured —
  32 completions against 52 expiries on 87 trials, with the
  expiries==defiance identity proven on all 5 seatings. Any future
  low-defiance attempt now has a counted completion rate to beat
  (~2/3, not ~1/3) and knows the identify chase's real bottleneck
  (reaching L2, not the final tastings).
- FILLED (instrument, then removed): the trial-chase seat+door pair
  was built, det-gated twice, screened — then deleted per the
  killed-arms rule, so the tree carries no dead substrate.
- FILLED (instrument lesson): delegation gates do not detect a
  missing courtship — a substrate-activation check (courtship
  counters present) is now part of this arm's proof output, and
  future arms should promote it to a gate.
- DOCUMENTED (not filled): rule (3) fallback-feared is still
  unit-proven only. The trial-completing player does not produce
  no-defiance seatings. The sense ring's tail-only capture and the
  77302/77308 national-without-invitation cases are scale-wall data
  points for the axis, not this arm's target, and were not
  investigated further.

## Metric review

- The pre-registered metric held with no mid-run re-score — except
  for the one disclosed deviation, which was an instrument repair,
  not a metric change: the prereg's pairing section listed the sweep
  env without LEANLINKRESCUE=1, and the first sweep ran without it.
  The floor, the band, the horizon, and the verdict branches were NOT
  changed; the env was corrected to what tableseat-nowait's own
  header and every prior arm's pairing require, the det-gates were
  re-run, and the pilot was re-run on the same band. The invalid
  corpus was retained separately and never judged. A future prereg
  should list the FULL env set explicitly (including inherited
  gates like LEANLINKRESCUE) and should include a substrate-activation
  gate (courtship counters non-zero) alongside the delegation gates —
  delegation passing while the substrate never activates is the
  failure mode this run found.
- Attribution caveat (for the NEXT run's prereg, not this one): the
  32 completions are counted ON the chase substrate, but there is no
  chase-off control on these seeds — competent alone might complete
  some of them. The screen's verdict does not depend on that
  attribution (the floor is about seatings, and seatings are counted
  directly), but no claim is made here that the chase CAUSED all 32.
  A future arm wanting a chase-effect number needs a paired
  chase-on/chase-off band.
- The seat-rate floor worked as designed: clause (a) (seated >= 3)
  was met with room (5), so the screen was not starved of seatings —
  it failed cleanly on clause (b) (no-defiance), which is the thing
  under test. The 1715Z/1816Z worry (a band too small to qualify) did
  not recur here.
- Balanced panel (§15): no panel artifact — scripts/balance-panel.js
  has NO corpus-ingest mode for this corpus (its modes are its own
  observer run over its registry policies — capable, risk-aware,
  socialite, winseek — and a compare of two panel files; neither
  measures this corpus). Running it would have measured different
  policies and been mislabeled as this arm's comparison, so it was
  not run as a substitute. The before/after per-seed comparison above
  IS the comparison, as in 1631Z, 1715Z, and 1816Z. The sweep's own
  VERDICT field on the band (GO, on defiant entered) is the DEFIANT
  verdict and was NOT used as this run's verdict.

## Findings note (for the coordinator; NOT acted on)

- Scale wall, unchanged in shape: national ever 7/8 but table 5/8,
  wins 5/8, full seat 0/8, wave 5 0/8. Villages reach national and
  hold it without ever seeing a table offer (77302, 77308) — rank,
  invitation, and entry remain three different things.
- Sense instrument gap: the say ring holds only the run's tail, so
  trial beats (and any mid-run behavior) are unobservable in sense
  replays. A longer or filtered ring is tooling work for a future arm.
- 77308's collapse to population 2 with 61 deaths (combat attrition
  at national) and 77306's day-36 collapse are food/combat data
  points for the axis, not this arm's target.
- The invalid-first-sweep class (env omission silently disabling a
  gated layer) plausibly affects any policy whose activation is an
  env gate inherited from a wrapped policy — worth a checklist line
  in future preregs: list every gate in the wrap chain, not just the
  new layer's gate.

## Loud failures / deviations (none hidden)

- The invalid first sweep (above): env omission, caught from the
  corpus, corrected, re-run, disclosed. The judged corpus is the
  corrected run only.
- The safe-commit index clobber class (AGENTS.md, 2026-10-22/23)
  struck BOTH commits in this run (prereg commit d7ec438e, fix commit
  6fdd3725): HEAD held the correct commits while the main index
  showed bogus staged deletions. Repaired the same way as documented
  (`git update-index --add --cacheinfo` with the HEAD blob per file),
  then verified `git status --short` empty, `git diff HEAD` empty,
  and hash-object == HEAD blob before any judged sweep started. The
  judged sweeps ran AFTER the repairs, on a clean tree, with the
  prereg already committed.
- A proof-script print bug (courtSum scope) was found and fixed
  before judging; it touched no gate.
- No EPERM flap blocked any commit or sweep write. No push, no
  version bump, no live verification — merging to local master is
  the coordinator's job, and this arm reports ready-to-merge,
  pending coordinator.
- Sibling trees untouched; no other worktree or registry entry
  touched.

## Files

- Prereg: evidence/2026-10-27/sim-rule3trial-a-prereg.md
  (committed d7ec438e, before any judged sweep)
- Env-fix commit: 6fdd3725 (LEANLINKRESCUE activation + courtship
  totals in sweep/proof output)
- Evidence (this file): evidence/2026-10-27/sim-rule3trial-a.md
- Judged corpus: evidence/2026-10-27/perseed-rule3trial-a/ (16
  per-seed rows + summary.json)
- Invalid corpus (audit only, NEVER judged):
  evidence/2026-10-27/perseed-rule3trial-a-invalid/ (16 per-seed rows
  + summary.json from the competent-only run)
- Sense replay (non-measured): evidence/2026-10-27/sim-rule3trial-a-sense.txt
  (seed 77302, tail-only ring — see Sense test)
- Proof: scripts/test-rule3trial-a.js
- Sweep (measurement record): scripts/test-rule3trial-a-sweep.js
- DELETED (killed arm, no trace): scripts/policies/tableseat-trialchase.js,
  scripts/policies/tablepaths-trial.js
- Untouched: scripts/policies/tablepaths-defiant.js,
  scripts/policies/tableseat-nowait.js, scripts/policies/leanlinkrescue.js,
  scripts/policies/competent.js, every src/js file.
